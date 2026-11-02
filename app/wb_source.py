"""Weld Balance — единственный источник станции точки и пистолета.

Правило (решение 2026-10-31):
* станция точки и пистолета берётся ТОЛЬКО из WB: строка weld_point.wb_station
  (текст из Excel) сопоставляется со справочником station в рамках бренда модели и
  хранится в weld_point.station_id;
* цепочка «пистолет → трансформатор → станция» для станции НЕ используется:
  трансформатор — ручная характеристика пистолета в Перечне;
* чего нет в WB или что в WB противоречиво — «потеряшки»: на сайте явно «нет в WB»,
  а в таблице wb_issue («Сверка») — запрос ИТО на рассмотрение.

Сырые данные WB (что вставили из Excel) не меняются никогда. Вся логика работает по
рабочим ключам weld_point_key (модель, № точки, G, станция), которые считаются из сырых
колонок ОДНИМИ правилами — app/normalize.py (refresh_wb_keys). Представления v_wb_point /
v_wb_gun — чтение станции из одного места.

Всё здесь работает молча: вставке WB из Excel ничего не мешает, проблемы копятся
в Сверке.
"""
from collections import defaultdict
from datetime import datetime

from app.normalize import code_key, g_number, spot_key, station_key

# Контактная сварка — у неё обязан быть пистолет G. CO2/шпилька/автосварка — без G.
SPOT_WELDING_TYPES = ('PSW', 'RSW')


# ── сырые строки WB → рабочие ключи (правила — только app/normalize.py) ──────────
def refresh_wb_keys(db, wp_ids=None):
    """Пересчитать рабочие ключи строк WB (weld_point_key) из СЫРЫХ колонок weld_point.
    Сырые колонки не меняются. Пишет только изменившееся; при полном пересчёте удаляет
    ключи удалённых строк. Возвращает число записанных строк ключей."""
    sql = 'SELECT id, model_code, spot_number, gun_mntc, wb_station FROM weld_point'
    ksql = 'SELECT weld_point_id, model_key, spot_key, g_num, station_key FROM weld_point_key'
    if wp_ids is None:
        rows, have = db.execute(sql).fetchall(), db.execute(ksql).fetchall()
    else:
        ids = list(wp_ids)
        rows = [r for i in ids for r in db.execute(sql + ' WHERE id=?', (i,)).fetchall()]
        have = [r for i in ids for r in db.execute(ksql + ' WHERE weld_point_id=?', (i,)).fetchall()]
    have = {r[0]: tuple(r[1:]) for r in have}
    upserts = []
    for wid, model, spot, gun, station in rows:
        keys = (code_key(model), spot_key(spot), g_number(gun), station_key(station))
        if have.get(wid) != keys:
            upserts.append((wid, *keys))
    db.executemany(
        'INSERT INTO weld_point_key (weld_point_id, model_key, spot_key, g_num, station_key) VALUES (?,?,?,?,?) '
        'ON CONFLICT(weld_point_id) DO UPDATE SET model_key=excluded.model_key, spot_key=excluded.spot_key, '
        'g_num=excluded.g_num, station_key=excluded.station_key', upserts)
    if wp_ids is None:
        db.execute('DELETE FROM weld_point_key WHERE weld_point_id NOT IN (SELECT id FROM weld_point)')
    return len(upserts)


class StationMatcher:
    """Ключ станции строки WB → станция справочника (в рамках бренда модели). Справочник
    приводится к ключам теми же правилами (normalize.station_key). Читается один раз."""

    def __init__(self, db):
        self.brands = defaultdict(set)
        for code, bid in db.execute('SELECT model_code, brand_id FROM model'):
            self.brands[code_key(code)].add(bid)
        self.stations = defaultdict(list)
        for sid, name, bid in db.execute('SELECT UniqueID, station_name, brand_id FROM station'):
            self.stations[bid].append((sid, station_key(name)))

    def match(self, model_key, st_key):
        """station_id или None (нет станции / нет такой в справочнике / неоднозначно)."""
        if st_key is None:
            return None
        cands = [s for b in self.brands.get(model_key, ()) for s in self.stations[b]]
        exact = [sid for sid, c in cands if c == st_key]
        if len(exact) == 1:
            return exact[0]
        if exact:
            return None
        # варианты написания: 'FR WH 1-10' ↔ 'WH 1-10', 'INR+WH L-10' ↔ 'INR L-10'
        alias = [sid for sid, c in cands if c.endswith(' ' + st_key) or c.replace('+WH', '') == st_key]
        return alias[0] if len(alias) == 1 else None


_KEYED_ROWS = ('SELECT w.id, k.model_key, k.station_key, w.station_id FROM weld_point w '
               'LEFT JOIN weld_point_key k ON k.weld_point_id = w.id')


def sync_wb_stations(db, wp_ids=None, matcher=None):
    """Проставить weld_point.station_id по рабочим ключам. Пишет только изменившиеся
    строки (идемпотентно). Возвращает число обновлённых строк."""
    matcher = matcher or StationMatcher(db)
    rows = (db.execute(_KEYED_ROWS).fetchall() if wp_ids is None else
            [r for i in wp_ids for r in db.execute(_KEYED_ROWS + ' WHERE w.id=?', (i,)).fetchall()])
    changed = 0
    for wid, model_key, st_key, cur in rows:
        sid = matcher.match(model_key, st_key)
        if sid != cur:
            db.execute('UPDATE weld_point SET station_id=? WHERE id=?', (sid, wid))
            changed += 1
    return changed


def relinkable_gun_rows(db):
    """id строк WB без gun_id, у которых G-номер теперь однозначно есть в справочнике
    (пистолет добавили в Перечень после загрузки WB)."""
    by_g = defaultdict(list)
    for gid, g in db.execute('SELECT UniqueID, g_num FROM gun'):
        by_g[g].append(gid)
    return [wid for wid, g in db.execute(
        'SELECT w.id, k.g_num FROM weld_point w JOIN weld_point_key k ON k.weld_point_id = w.id '
        'WHERE w.gun_id IS NULL AND k.g_num IS NOT NULL') if len(by_g.get(g, [])) == 1]


def _step(db, name, fn, errors):
    """Шаг синхронизации в своей точке сохранения: сбой шага откатывает только его."""
    db.execute(f'SAVEPOINT {name}')
    try:
        out = fn()
    except Exception as e:  # noqa: BLE001 — шаг не должен ронять остальные шаги
        db.execute(f'ROLLBACK TO {name}')
        db.execute(f'RELEASE {name}')
        errors.append(f'{name}: {type(e).__name__}: {e}'[:300])
        return False, None
    db.execute(f'RELEASE {name}')
    return True, out


def sync_wb(db):
    """Довести производные данные WB до актуального состояния: довязать G-номера,
    появившиеся в Перечне после загрузки WB; проставить станции; пересобрать Сверку.

    Шаги независимы (SAVEPOINT): сбой довязки одной строки не мешает остальным строкам,
    станциям и Сверке (раньше всё откатывалось целиком — и станции оставались пустыми).
    Идемпотентно. НЕ коммитит — транзакцией владеет вызывающий (run_wb_sync)."""
    from app.documents import resolve_weld_point_links
    from app.equipment import sync_register
    errors, relinked, failed = [], 0, 0
    # сырые строки WB → рабочие ключи (первым: на ключах работает всё остальное)
    _, keys = _step(db, 'wb_keys', lambda: refresh_wb_keys(db), errors)
    # Перечень (Excel цеха) → пистолеты: до довязки, чтобы новые G сразу довязались в WB
    _, register = _step(db, 'register', lambda: sync_register(db), errors)
    for wid in relinkable_gun_rows(db):
        ok, _ = _step(db, 'wb_relink', lambda w=wid: resolve_weld_point_links(db, [w]), errors)
        if ok:
            relinked += 1
        else:
            failed += 1
            errors[-1] = f'строка WB #{wid} — {errors[-1]}'
    _, stations = _step(db, 'wb_stations', lambda: sync_wb_stations(db), errors)
    _, defects_filled = _step(db, 'defects_fill', lambda: fill_defects_from_wb(db), errors)
    _, open_issues = _step(db, 'wb_issues', lambda: rebuild_issues(db), errors)
    return {'keys_updated': keys, 'register': register, 'relinked': relinked, 'relink_failed': failed, 'stations_updated': stations,
            'defects_filled': defects_filled,
            'open_issues': open_issues, 'errors': errors[:10], 'errors_total': len(errors)}


def run_wb_sync(db_path, audit=True, trigger='start'):
    """Синхронизация WB одной транзакцией (при старте и по кнопке в «Сверке»).

    Производные данные WB — не правки людей, в Журнал им не место: триггеры журнала
    снимаются и возвращаются ВНУТРИ той же транзакции (DDL в SQLite транзакционен), а
    BEGIN IMMEDIATE не даёт чужим правкам проскочить мимо Журнала на это время.
    Возвращает итог для показа в «Сверке» (ok, время, числа, ошибки шагов)."""
    import sqlite3

    from app.audit import drop_audit_triggers, ensure_audit_triggers
    con = sqlite3.connect(db_path, timeout=30, isolation_level=None)   # транзакции — вручную
    at = datetime.now().isoformat(timespec='seconds')
    try:
        con.execute('BEGIN IMMEDIATE')
        if audit:
            drop_audit_triggers(con, commit=False)
        res = sync_wb(con)
        if audit:
            ensure_audit_triggers(con, commit=False)
        con.execute('COMMIT')
        return {'ok': not res['errors_total'], 'at': at, 'trigger': trigger, **res}
    except Exception as e:  # noqa: BLE001 — итог показываем, сайт не роняем
        if con.in_transaction:
            con.execute('ROLLBACK')
        return {'ok': False, 'at': at, 'trigger': trigger, 'errors': [f'{type(e).__name__}: {e}'[:300]],
                'errors_total': 1}
    finally:
        con.close()


def sync_wb_on_start(db):
    """Совместимость (тесты/скрипты): синхронизация на переданном соединении + commit."""
    res = sync_wb(db)
    db.commit()
    return res


def wb_health(db):
    """Живое состояние связки с WB (для «Сверки»): сколько строк WB, у скольких станция
    распознана, у скольких текст станции есть, а станции нет."""
    total, with_text, linked = db.execute(
        "SELECT COUNT(*), SUM(TRIM(COALESCE(wb_station,''))<>''), SUM(station_id IS NOT NULL) "
        'FROM weld_point').fetchone()
    return {'wb_rows': total or 0, 'with_station_text': with_text or 0, 'station_linked': linked or 0,
            'station_unlinked': (with_text or 0) - (linked or 0)}


# ── SQL-фрагменты «станция пистолета по WB» (алиас пистолета в запросе — g) ───
# Подставляются во ВСЕ чтения станции пистолета — правило задано в одном месте.
GUN_WB_JOIN = """
        LEFT JOIN v_wb_gun vg ON vg.gun_id = g.UniqueID
        LEFT JOIN station st ON st.UniqueID = vg.station_id"""
# Название с явной пометкой потеряшек (они же в Сверке).
GUN_WB_STATION_NAME = ("CASE WHEN vg.gun_id IS NULL THEN '⚠ нет в WB' "
                       "WHEN vg.n_stations = 0 THEN '⚠ станция WB не распознана' "
                       "WHEN vg.n_stations > 1 THEN '⚠ ' || REPLACE(vg.station_names, ',', ' / ') "
                       "ELSE st.station_name END")
# Линия (бренд): по станции пистолета; при нескольких станциях — по любой из них.
GUN_WB_BRAND_ID = ("COALESCE(st.brand_id, (SELECT st2.brand_id FROM weld_point w2 "
                   "JOIN station st2 ON st2.UniqueID = w2.station_id WHERE w2.gun_id = g.UniqueID LIMIT 1))")

# Станция ТОЧКИ по WB (алиасы: точка — s, модель — m). Подставляется в чтения точки.
# v_wb_point — по рабочим ключам; справочник модели чистый (код заглавными), номер карточки
# точки — число, CAST даёт ту же форму, что normalize.spot_key ('20').
POINT_WB_JOIN = """
        LEFT JOIN v_wb_point wp ON wp.model_key = UPPER(m.model_code) AND wp.spot_key = CAST(s.spot_number AS TEXT)
        LEFT JOIN station wst ON wst.UniqueID = wp.station_id"""
POINT_WB_STATION_NAME = ("CASE WHEN wp.model_key IS NULL THEN '⚠ нет в WB' "
                         "WHEN wp.n_stations = 0 THEN '⚠ станция WB не распознана' "
                         "WHEN wp.n_stations > 1 THEN '⚠ несколько станций в WB' "
                         "ELSE wst.station_name END")
# Последний активный трансформатор пистолета — ручная характеристика (на станцию не влияет).
GUN_TRANSFORMER_NAME = ("(SELECT t.transID FROM gun_transformer_assignment gta JOIN trans t ON t.UniqueID = gta.transformer_id "
                        "WHERE gta.gun_id = g.UniqueID AND gta.is_active = 1 ORDER BY gta.UniqueID DESC LIMIT 1)")
# Псевдо-станция «пистолеты не из WB» для выбора при вводе ТО (id 0 не бывает у станции).
LOST_GUNS_STATION_ID = 0
LOST_GUNS_STATION_NAME = '⚠ Пистолеты не из WB'


# ── чтение станции (то же, что v_wb_point / v_wb_gun) ─────────────────────────
def point_station(db, model_code, spot_number):
    """(station_id | None, n_stations) точки по WB. Станция — только если она одна."""
    if not model_code or spot_number in (None, ''):
        return None, 0
    # v_wb_point — по рабочим ключам: ввод приводится теми же правилами (app/normalize.py)
    r = db.execute('SELECT n_stations, station_id FROM v_wb_point WHERE model_key=? AND spot_key=?',
                   (code_key(model_code), spot_key(spot_number))).fetchone()
    return (r[1], r[0] or 0) if r else (None, 0)


def point_gun(db, model_code, spot_number, spot_id=None):
    """Пистолет точки: по WB, если он там один; в WB пистолет не определён (нет G / G не в
    Перечне) — действующая связка точка↔пистолет; в WB у точки несколько пистолетов —
    None (неоднозначно, это в Сверке)."""
    r = None
    if model_code and spot_number not in (None, ''):
        r = db.execute('SELECT gun_id, n_guns FROM v_wb_point WHERE model_key=? AND spot_key=?',
                       (code_key(model_code), spot_key(spot_number))).fetchone()
    if r and r[0] is not None:
        return r[0]
    if (r and r[1] > 1) or spot_id is None:
        return None
    ws = db.execute('SELECT gun_id FROM welding_setup WHERE spot_id=? AND is_active=1 ORDER BY UniqueID LIMIT 1',
                    (spot_id,)).fetchone()
    return ws[0] if ws else None


# С какого дня дефекты могли зарегистрироваться без станции/пистолета (развёртывание «WB —
# эталон», 0022: номера точек WB с нулями не сопоставлялись, станции не были проставлены).
DEFECT_FILL_SINCE = '2026-10-30'


def fill_defects_from_wb(db):
    """Дозаполнить из WB дефекты, у которых при регистрации не определились пистолет и/или
    станция. Только ПУСТЫЕ поля — определённая станция дефекта не меняется (правило «не
    плывёт»). Открытые дефекты + все зарегистрированные с DEFECT_FILL_SINCE. → число дефектов."""
    from app.defect_flow import OPEN_STATUSES
    ph = ','.join('?' * len(OPEN_STATUSES))
    rows = db.execute(f"""
        SELECT d.UniqueID, d.gun_id, d.snap_station_id, d.snap_g_num, d.spot_id, mo.model_code,
               COALESCE(CAST(s.spot_number AS TEXT), d.manual_spot_number)
        FROM defects d
        LEFT JOIN spot s ON s.UniqueID = d.spot_id
        LEFT JOIN model mo ON mo.UniqueID = COALESCE(s.model_id, d.manual_model_id)
        WHERE (d.gun_id IS NULL OR d.snap_station_id IS NULL OR d.snap_g_num IS NULL)
          AND (COALESCE(d.status, 'registered') IN ({ph}) OR d.df_date >= ?)""",
        (*OPEN_STATUSES, DEFECT_FILL_SINCE)).fetchall()
    filled = 0
    for did, gun_id, station_id, snap_g, spot_id, code, num in rows:
        changed = False
        if gun_id is None:
            gun_id = point_gun(db, code, num, spot_id)
            if gun_id is not None:
                db.execute('UPDATE defects SET gun_id=? WHERE UniqueID=?', (gun_id, did))
                changed = True
        if snap_g is None and gun_id is not None:
            db.execute('UPDATE defects SET snap_g_num=(SELECT g_num FROM gun WHERE UniqueID=?), '
                       'snap_gun_type=(SELECT gun_type FROM gun WHERE UniqueID=?) WHERE UniqueID=?',
                       (gun_id, gun_id, did))
            changed = True
        if station_id is None:
            sid = defect_station(db, did)
            if sid is not None:
                db.execute('UPDATE defects SET snap_station_id=?, '
                           'snap_station_name=(SELECT station_name FROM station WHERE UniqueID=?) WHERE UniqueID=?',
                           (sid, sid, did))
                changed = True
        filled += changed
    return filled


def gun_station(db, gun_id):
    """(station_id | None, n_stations) пистолета по WB. Станция — только если она одна."""
    if gun_id is None:
        return None, 0
    r = db.execute('SELECT COUNT(DISTINCT station_id), MIN(station_id) FROM weld_point WHERE gun_id=?',
                   (gun_id,)).fetchone()
    n = r[0] or 0
    return (r[1] if n == 1 else None), n


def defect_station(db, defect_id):
    """Станция дефекта строго по WB: есть точка (модель + №) — станция точки; нет точки
    (регистрация по G-номеру) — станция пистолета. Неоднозначно / нет в WB → None."""
    d = db.execute("""
        SELECT mo.model_code, COALESCE(CAST(s.spot_number AS TEXT), d.manual_spot_number), d.gun_id
        FROM defects d
        LEFT JOIN spot s ON s.UniqueID = d.spot_id
        LEFT JOIN model mo ON mo.UniqueID = COALESCE(s.model_id, d.manual_model_id)
        WHERE d.UniqueID=?""", (defect_id,)).fetchone()
    if not d:
        return None
    code, num, gun_id = d
    if code and num not in (None, ''):
        return point_station(db, code, num)[0]
    return gun_station(db, gun_id)[0]


# ── Сверка (wb_issue): запрос ИТО на рассмотрение ─────────────────────────────
ISSUE_KINDS = {
    'station_not_in_directory': 'Станции из WB нет в справочнике станций',
    'wb_no_station':            'В строке WB не указана станция',
    'g_not_in_directory':       'Пистолета из WB нет в Перечне (справочнике пистолетов)',
    'wb_spot_no_gun':           'Точка контактной сварки в WB без G-номера',
    'dup_g_num':                'G-номер задублирован в Перечне',
    'point_two_stations':       'У точки в WB несколько станций',
    'gun_multi_station':        'Пистолет в WB стоит на разных станциях',
    'gun_not_in_wb':            'Пистолет есть в Перечне, но его нет в WB',
    'defect_not_in_wb':         'Открытый дефект: станция не определяется по WB',
    'register_station_mismatch': 'Станция пистолета по Перечню не совпадает с WB',
    'register_no_station':      'Пистолет в Перечне: станция не определяется',
    'register_dup_g':           'G-номер повторяется в Перечне',
    'gun_not_in_register':      'Пистолета нет в Перечне (а на сайте он есть)',
}


def _collect_issues(db):
    """Текущие проблемы данных: {issue_key: dict(колонок wb_issue)}."""
    issues = {}

    def add(key, kind, **kw):
        issues[key] = dict(kind=kind, **kw)

    # всё сопоставление — по рабочим ключам (weld_point_key); в Сверку — сырые значения,
    # как их ввели (их узнают в Excel), кроме сводных строк по ключу станции / G-номеру
    keyed = ('SELECT w.model_code, w.spot_number, w.gun_mntc, w.welding_type, w.station_id, w.gun_id, '
             'k.model_key, k.station_key, k.g_num FROM weld_point w '
             'LEFT JOIN weld_point_key k ON k.weld_point_id = w.id')
    matcher = StationMatcher(db)
    unmatched = defaultdict(int)
    for _c, _n, _m, _w, station_id, _g, model_key, st_key, _gn in db.execute(keyed + ' WHERE w.station_id IS NULL'):
        if st_key is not None and matcher.match(model_key, st_key) is None:
            unmatched[(model_key, st_key)] += 1
    for (code, st), n in unmatched.items():
        add(f'st:{code}:{st}', 'station_not_in_directory', model_code=code, wb_station=st,
            where_found='WB', rows_count=n)

    for code, num, *_rest in db.execute(keyed + ' WHERE k.station_key IS NULL'):
        add(f'nost:{code}:{num}', 'wb_no_station', model_code=code, spot_number=num, where_found='WB', rows_count=1)

    gnums = {g for (g,) in db.execute('SELECT g_num FROM gun')}
    missing_g = defaultdict(lambda: [0, set()])
    for code, num, mntc, wtype, _s, _g, _mk, _sk, g in db.execute(keyed + ' WHERE w.gun_id IS NULL'):
        if g is not None and g not in gnums:
            missing_g[g][0] += 1
            missing_g[g][1].add(code)
        elif g is None and (wtype or '').upper() in SPOT_WELDING_TYPES:
            add(f'nog:{code}:{num}', 'wb_spot_no_gun', model_code=code, spot_number=num,
                details=mntc, where_found='WB', rows_count=1)
    for g, (n, codes) in missing_g.items():
        add(f'g:{g}', 'g_not_in_directory', g_num=g, model_code=', '.join(sorted(codes)),
            where_found='WB', rows_count=n)

    for g, n in db.execute('SELECT g_num, COUNT(*) FROM gun GROUP BY g_num HAVING COUNT(*) > 1'):
        add(f'dupg:{g}', 'dup_g_num', g_num=g, where_found='Перечень', rows_count=n)

    _collect_register_issues(db, add)

    names = {sid: nm for sid, nm in db.execute('SELECT UniqueID, station_name FROM station')}
    for code, num, ids in db.execute("""
            SELECT k.model_key, k.spot_key, GROUP_CONCAT(DISTINCT w.station_id)
            FROM weld_point w JOIN weld_point_key k ON k.weld_point_id = w.id
            WHERE w.station_id IS NOT NULL AND k.spot_key IS NOT NULL
            GROUP BY k.model_key, k.spot_key HAVING COUNT(DISTINCT w.station_id) > 1"""):
        add(f'p2:{code}:{num}', 'point_two_stations', model_code=code, spot_number=num, where_found='WB',
            details=' / '.join(names.get(int(i), i) for i in ids.split(',')))

    for gid, g, ids in db.execute("""
            SELECT wp.gun_id, g.g_num, GROUP_CONCAT(DISTINCT wp.station_id) FROM weld_point wp
            JOIN gun g ON g.UniqueID = wp.gun_id
            WHERE wp.station_id IS NOT NULL GROUP BY wp.gun_id HAVING COUNT(DISTINCT wp.station_id) > 1"""):
        add(f'gm:{gid}', 'gun_multi_station', gun_id=gid, g_num=g, where_found='WB',
            details=' / '.join(names.get(int(i), i) for i in ids.split(',')))

    plan = {gid for (gid,) in db.execute('SELECT DISTINCT gun_id FROM maintenance_schedule')}
    for gid, g in db.execute('SELECT UniqueID, g_num FROM gun WHERE UniqueID NOT IN '
                             '(SELECT gun_id FROM weld_point WHERE gun_id IS NOT NULL)'):
        add(f'nowb:{gid}', 'gun_not_in_wb', gun_id=gid, g_num=g,
            where_found='Перечень, план ТО' if gid in plan else 'Перечень')

    from app.defect_flow import OPEN_STATUSES
    ph = ','.join('?' * len(OPEN_STATUSES))
    for (did,) in db.execute(f"SELECT UniqueID FROM defects WHERE COALESCE(status,'registered') IN ({ph})",
                             OPEN_STATUSES).fetchall():
        if defect_station(db, did) is None:
            add(f'def:{did}', 'defect_not_in_wb', defect_id=did, where_found='Дефект')
    return issues


def _collect_register_issues(db, add):
    """Перечень оборудования (Excel цеха) против WB и справочника пистолетов.
    Сверка строки с WB считается здесь же и сохраняется в equipment_link.wb_status —
    колонка «Сходится с WB» в Перечне читает готовый результат (одно правило, без SQL-копии).
    Пока Перечень пуст (ещё не вставлен) — молчим, чтобы не завалить Сверку."""
    from app.equipment import same_station
    reg = db.execute('SELECT el.item_id, el.g_num, el.gun_id, el.reg_station, el.station_id, ei.location '
                     'FROM equipment_link el JOIN equipment_item ei ON ei.id = el.item_id '
                     'WHERE el.g_num IS NOT NULL ORDER BY ei.row_order, ei.id').fetchall()
    if not reg:
        return
    counts = defaultdict(int)
    for row in reg:
        counts[row[1]] += 1
    for g, n in counts.items():
        if n > 1:
            add(f'regdup:{g}', 'register_dup_g', g_num=g, where_found='Перечень', rows_count=n)
    wb_guns, wb_names = set(), {}
    for gid, names in db.execute('SELECT gun_id, station_names FROM v_wb_gun'):
        wb_guns.add(gid)
        if names:
            wb_names[gid] = set(names.split(','))
    seen, status = set(), []
    for item_id, g, gid, reg_station, reg_station_id, location in reg:
        if reg_station_id is None:
            st = 'no_station'
        elif gid not in wb_guns:
            st = 'no_wb'
        elif gid not in wb_names:
            st = 'wb_unknown'                              # в WB есть, станция там не распознана
        elif any(same_station(reg_station, n) for n in wb_names[gid]):
            st = 'ok'
        else:
            st = 'mismatch'
        status.append((st, item_id))
        if g in seen:                                      # повтор G — в Сверку по первой строке
            continue
        seen.add(g)
        if st == 'no_station':
            add(f'regnost:{g}', 'register_no_station', g_num=g, gun_id=gid, where_found='Перечень',
                details=f'«Станция» в Перечне: {location or "пусто"}')
        elif st == 'mismatch':
            add(f'regst:{g}', 'register_station_mismatch', g_num=g, gun_id=gid, where_found='Перечень / WB',
                wb_station=' / '.join(sorted(wb_names[gid])), details=f'по Перечню: {reg_station}')
    db.executemany('UPDATE equipment_link SET wb_status=? WHERE item_id=? AND wb_status IS NOT ?',
                   [(st, iid, st) for st, iid in status])
    for gid, g in db.execute('SELECT UniqueID, g_num FROM gun'):
        if g not in counts:
            add(f'noreg:{gid}', 'gun_not_in_register', gun_id=gid, g_num=g, where_found='ТО / дефекты')


_ISSUE_COLS = ('kind', 'model_code', 'spot_number', 'g_num', 'gun_id', 'defect_id',
               'wb_station', 'details', 'where_found', 'rows_count')

# Статусы строки Сверки. «accepted» — ИТО принял как есть (законный случай, например
# пистолет действительно на двух станциях): не переоткрывается, пока проблема не исчезнет.
ISSUE_STATUSES = {'new': 'Новое', 'in_review': 'У инженера', 'assigned': 'Распределено',
                  'accepted': 'Принято как есть', 'resolved': 'Исправлено'}
OPEN_ISSUE_STATUSES = ('new', 'in_review', 'assigned')


def open_issue_count(db):
    ph = ','.join('?' * len(OPEN_ISSUE_STATUSES))
    return db.execute(f'SELECT COUNT(*) FROM wb_issue WHERE status IN ({ph})', OPEN_ISSUE_STATUSES).fetchone()[0]


def rebuild_issues(db):
    """Пересобрать Сверку: новые проблемы — добавить (или переоткрыть закрытые),
    исчезнувшие — закрыть сами («исправлено»). Статус/ответственного/комментарий,
    выставленные ИТО, не трогаем. Возвращает число открытых (требующих разбора) проблем."""
    now = datetime.now().isoformat(timespec='seconds')
    current = _collect_issues(db)
    existing = {k: (i, st) for i, k, st in db.execute('SELECT id, issue_key, status FROM wb_issue')}
    for key, it in current.items():
        vals = [it.get(c) for c in _ISSUE_COLS]
        if key in existing:
            iid, st = existing[key]
            reopen = st == 'resolved'
            db.execute('UPDATE wb_issue SET ' + ', '.join(f'{c}=?' for c in _ISSUE_COLS) +
                       ', last_seen=?' + (", status='new', resolved_at=NULL" if reopen else '') + ' WHERE id=?',
                       (*vals, now, iid))
        else:
            db.execute('INSERT INTO wb_issue (issue_key, ' + ', '.join(_ISSUE_COLS) +
                       ', status, first_seen, last_seen) VALUES (?' + ',?' * len(_ISSUE_COLS) + ", 'new', ?, ?)",
                       (key, *vals, now, now))
    gone = [iid for k, (iid, st) in existing.items() if k not in current and st != 'resolved']
    for iid in gone:
        db.execute("UPDATE wb_issue SET status='resolved', resolved_at=? WHERE id=?", (now, iid))
    return open_issue_count(db)
