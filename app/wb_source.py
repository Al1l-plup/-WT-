"""Weld Balance — единственный источник станции точки и пистолета.

Правило (решение 2026-10-31):
* станция точки и пистолета берётся ТОЛЬКО из WB: строка weld_point.wb_station
  (текст из Excel) сопоставляется со справочником station в рамках бренда модели и
  хранится в weld_point.station_id;
* цепочка «пистолет → трансформатор → станция» для станции НЕ используется:
  трансформатор — ручная характеристика пистолета в Перечне;
* чего нет в WB или что в WB противоречиво — «потеряшки»: на сайте явно «нет в WB»,
  а в таблице wb_issue («Сверка») — запрос ИТО на рассмотрение.

Всё здесь работает молча: вставке WB из Excel ничего не мешает, проблемы копятся
в Сверке. Представления v_wb_point / v_wb_gun (миграция 0022) — та же логика в SQL,
чтобы любое чтение станции шло из одного места.
"""
import re
from collections import defaultdict
from datetime import datetime

_WB_STATION_RE = re.compile(r'^([A-Z]+\d*(?: (?:[LR]|\d))?-\d+)')
_BRAND_PREFIX_RE = re.compile(r'^(CH|GW|CA)-')
_G_RE = re.compile(r'G[.\s]*0*(\d+)', re.I)
# Контактная сварка — у неё обязан быть пистолет G. CO2/шпилька/автосварка — без G.
SPOT_WELDING_TYPES = ('PSW', 'RSW')


def parse_g(text):
    """'G.153' / 'G 033' → 153 / 33; нет номера → None."""
    m = _G_RE.search(text or '')
    return int(m.group(1)) if m else None


def wb_station_code(text):
    """Код станции из текста WB: 'MB-250 ROBOT RESPOT' → 'MB-250', 'WH L-40' → 'WH L-40'."""
    if not text or not str(text).strip():
        return None
    s = str(text).strip().upper()
    m = _WB_STATION_RE.match(s)
    return m.group(1) if m else s


def _dir_code(name):
    return _BRAND_PREFIX_RE.sub('', (name or '').strip().upper())


def _model_key(code):
    """Код модели без учёта регистра и пробелов: 'a01 ' и 'A01' — одна модель."""
    return (code or '').strip().upper()


class StationMatcher:
    """Сопоставление текста станции WB со справочником station (в рамках бренда модели).
    Справочники читаются один раз — для пакетной обработки тысяч строк."""

    def __init__(self, db):
        self.brands = defaultdict(set)
        for code, bid in db.execute('SELECT model_code, brand_id FROM model'):
            self.brands[_model_key(code)].add(bid)
        self.stations = defaultdict(list)
        for sid, name, bid in db.execute('SELECT UniqueID, station_name, brand_id FROM station'):
            self.stations[bid].append((sid, _dir_code(name)))

    def match(self, model_code, text):
        """station_id или None (нет текста / нет такой станции / неоднозначно)."""
        code = wb_station_code(text)
        if code is None:
            return None
        cands = [s for b in self.brands.get(_model_key(model_code), ()) for s in self.stations[b]]
        exact = [sid for sid, c in cands if c == code]
        if len(exact) == 1:
            return exact[0]
        if exact:
            return None
        # варианты написания: 'FR WH 1-10' ↔ 'WH 1-10', 'INR+WH L-10' ↔ 'INR L-10'
        alias = [sid for sid, c in cands if c.endswith(' ' + code) or c.replace('+WH', '') == code]
        return alias[0] if len(alias) == 1 else None


def sync_wb_stations(db, wp_ids=None, matcher=None):
    """Проставить weld_point.station_id по тексту станции. Пишет только изменившиеся
    строки (идемпотентно). Возвращает число обновлённых строк."""
    matcher = matcher or StationMatcher(db)
    sql = 'SELECT id, model_code, wb_station, station_id FROM weld_point'
    rows = (db.execute(sql).fetchall() if wp_ids is None else
            [r for i in wp_ids for r in db.execute(sql + ' WHERE id=?', (i,)).fetchall()])
    changed = 0
    for wid, code, text, cur in rows:
        sid = matcher.match(code, text)
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
    out = []
    for wid, mntc in db.execute('SELECT id, gun_mntc FROM weld_point WHERE gun_id IS NULL'):
        g = parse_g(mntc)
        if g is not None and len(by_g.get(g, [])) == 1:
            out.append(wid)
    return out


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
    # Перечень (Excel цеха) → пистолеты: сначала он, чтобы новые G сразу довязались в WB
    _, register = _step(db, 'register', lambda: sync_register(db), errors)
    for wid in relinkable_gun_rows(db):
        ok, _ = _step(db, 'wb_relink', lambda w=wid: resolve_weld_point_links(db, [w]), errors)
        if ok:
            relinked += 1
        else:
            failed += 1
            errors[-1] = f'строка WB #{wid} — {errors[-1]}'
    _, stations = _step(db, 'wb_stations', lambda: sync_wb_stations(db), errors)
    _, open_issues = _step(db, 'wb_issues', lambda: rebuild_issues(db), errors)
    return {'register': register, 'relinked': relinked, 'relink_failed': failed, 'stations_updated': stations,
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
POINT_WB_JOIN = """
        LEFT JOIN v_wb_point wp ON wp.model_code = m.model_code AND wp.spot_number = CAST(s.spot_number AS TEXT)
        LEFT JOIN station wst ON wst.UniqueID = wp.station_id"""
POINT_WB_STATION_NAME = ("CASE WHEN wp.model_code IS NULL THEN '⚠ нет в WB' "
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
    r = db.execute('SELECT COUNT(DISTINCT station_id), MIN(station_id) FROM weld_point '
                   'WHERE model_code=? AND TRIM(spot_number)=?', (model_code, str(spot_number).strip())).fetchone()
    n = r[0] or 0
    return (r[1] if n == 1 else None), n


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

    matcher = StationMatcher(db)
    unmatched = defaultdict(int)
    for code, text in db.execute('SELECT model_code, wb_station FROM weld_point WHERE station_id IS NULL'):
        if wb_station_code(text) is None:
            continue
        if matcher.match(code, text) is None:
            unmatched[(code, wb_station_code(text))] += 1
    for (code, st), n in unmatched.items():
        add(f'st:{code}:{st}', 'station_not_in_directory', model_code=code, wb_station=st,
            where_found='WB', rows_count=n)

    for code, num in db.execute("SELECT model_code, spot_number FROM weld_point "
                                "WHERE TRIM(COALESCE(wb_station,''))=''"):
        add(f'nost:{code}:{num}', 'wb_no_station', model_code=code, spot_number=num, where_found='WB', rows_count=1)

    gnums = {g for (g,) in db.execute('SELECT g_num FROM gun')}
    missing_g = defaultdict(lambda: [0, set()])
    for code, num, mntc, wtype in db.execute('SELECT model_code, spot_number, gun_mntc, welding_type '
                                             'FROM weld_point WHERE gun_id IS NULL'):
        g = parse_g(mntc)
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
            SELECT model_code, TRIM(spot_number), GROUP_CONCAT(DISTINCT station_id) FROM weld_point
            WHERE station_id IS NOT NULL GROUP BY model_code, TRIM(spot_number)
            HAVING COUNT(DISTINCT station_id) > 1"""):
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
    Пока Перечень пуст (ещё не вставлен) — молчим, чтобы не завалить Сверку."""
    from app.equipment import same_station
    reg = db.execute('SELECT el.g_num, el.gun_id, el.reg_station, el.station_id, ei.location '
                     'FROM equipment_link el JOIN equipment_item ei ON ei.id = el.item_id '
                     'WHERE el.g_num IS NOT NULL ORDER BY ei.row_order, ei.id').fetchall()
    if not reg:
        return
    counts = defaultdict(int)
    for row in reg:
        counts[row[0]] += 1
    for g, n in counts.items():
        if n > 1:
            add(f'regdup:{g}', 'register_dup_g', g_num=g, where_found='Перечень', rows_count=n)
    wb_names = {gid: set(names.split(',')) for gid, names in db.execute(
        'SELECT gun_id, station_names FROM v_wb_gun WHERE station_names IS NOT NULL')}
    seen = set()
    for g, gid, reg_station, reg_station_id, location in reg:
        if g in seen:                                      # повтор G — по первой строке
            continue
        seen.add(g)
        if reg_station_id is None:
            add(f'regnost:{g}', 'register_no_station', g_num=g, gun_id=gid, where_found='Перечень',
                details=f'«Станция» в Перечне: {location or "пусто"}')
        elif gid in wb_names and not any(same_station(reg_station, n) for n in wb_names[gid]):
            add(f'regst:{g}', 'register_station_mismatch', g_num=g, gun_id=gid, where_found='Перечень / WB',
                wb_station=' / '.join(sorted(wb_names[gid])), details=f'по Перечню: {reg_station}')
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
