"""Движок процесса дефектов 4M: цепочка согласования, этапы, серийность, ОТО.

Чистая логика над соединением sqlite (работает и с get_db(), и с обычным connection —
используется и из эндпоинтов, и из тестов). Снимок нового дефекта (snapshot_defect)
делает register_occurrence — ДО входа в цепочку, чтобы маршрут, уведомления и VIN сразу
видели зафиксированную станцию; commit делает вызывающий эндпоинт.

Статусы defects.status:
  registered — только что создан (транзиентно), сразу входит в цепочку;
  in_review  — на рассмотрении у отдела current_stage_dept;
  at_oto      — передан в ОТО (оборудование); delegated_from_dept — кому вернуть;
  pending_otk — закрыт отделом, ждёт перепроверки точки в ОТК (closed_by_dept — кто закрыл, vin — на чём);
  unresolved  — дошёл до конца цепочки без решения (на недельный разбор);
  closed      — закрыт окончательно (ОТК согласовал закрытие).

Серийность: повтор на той же точке в той же ГРУППЕ кодов в пределах окна (дней).
Группы: {MN}, {EO}, {все остальные вместе}. Пример (точка 124): BT→LP→BN = серия;
BT→MN = не серия. Достаточно 2-й фиксации.
"""
import re
from datetime import date, datetime

from app.normalize import code_key, station_key
from app.snapshots import SNAP_REGISTRATION, snapshot_defect

OTO = 'ОТО'
OTK = 'ОТК'

# Статусы «открытого» дефекта: вкладка «Все открытые» на доске и плитка «Открытых»
# на Главной считают именно их. Единый источник правды — не дублировать список строк
# по эндпоинтам (иначе он разъезжается: см. баг «плитка Открытых = 0»).
OPEN_STATUSES = ('registered', 'in_work', 'in_review', 'at_oto', 'pending_otk')


def _now():
    return datetime.now().isoformat(timespec='seconds')


def series_group(code):
    c = (code or '').strip().upper()
    if c == 'MN':
        return 'MN'
    if c == 'EO':
        return 'EO'
    return 'OTHER'


def _days_between(d1, d2):
    try:
        return abs((date.fromisoformat(str(d2)[:10]) - date.fromisoformat(str(d1)[:10])).days)
    except (TypeError, ValueError):
        return 10 ** 9


# ── конфиг маршрута / параметров ─────────────────────────────────────────────
def route_for(conn, code):
    """Упорядоченный список отделов цепочки для кода дефекта (иначе '*')."""
    code = (code or '').strip().upper()
    rows = conn.execute('SELECT dept FROM defect_route WHERE code=? ORDER BY position', (code,)).fetchall()
    if not rows:
        rows = conn.execute("SELECT dept FROM defect_route WHERE code='*' ORDER BY position").fetchall()
    return [r[0] for r in rows]


def serial_window_days(conn):
    r = conn.execute("SELECT value FROM defect_config WHERE key='serial_window_days'").fetchone()
    try:
        return int(r[0]) if r else 2
    except (TypeError, ValueError):
        return 2


# ── VIN по типу станции ──────────────────────────────────────────────────────
def station_segment(name):
    """Сегмент-токен имени станции: 'GW-MB-150'→'MB', 'GW-BS R-40'→'BS'. Пусто → ''."""
    if not name:
        return ''
    parts = str(name).split('-')
    if len(parts) < 2:
        return ''
    toks = parts[1].split()
    return toks[0].strip().upper() if toks else ''          # 'GW--10' / 'GW- -10' — участка нет


def vin_required_segments(conn):
    """Множество сегментов станций, при которых закрытие требует VIN (по умолчанию MB/UB).
    Редактируется в «Редакторе» → «Параметры дефектов» (defect_config.vin_required_segments)."""
    r = conn.execute("SELECT value FROM defect_config WHERE key='vin_required_segments'").fetchone()
    raw = r[0] if r and r[0] else 'MB,UB'
    return {s.strip().upper() for s in raw.split(',') if s.strip()}


def station_name_for(conn, defect_id):
    """Имя станции дефекта — ТОЛЬКО из снимка (как было в день дефекта). Не зафиксирована
    → None: сегодняшний WB историю дефекта не переписывает (он — station_now_for)."""
    r = conn.execute('SELECT snap_station_name FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()
    return r[0] if r and r[0] else None


def station_now_for(conn, defect_id):
    """Станция точки/пистолета дефекта по СЕГОДНЯШНЕМУ Weld Balance — подсказка в карточке,
    когда станция дефекта не зафиксирована. Нет в WB / неоднозначно → None."""
    from app.wb_source import defect_station
    sid = defect_station(conn, defect_id)
    r = conn.execute('SELECT station_name FROM station WHERE UniqueID=?', (sid,)).fetchone() if sid else None
    return r[0] if r else None


def vin_required(conn, defect_id):
    """Нужен ли VIN при закрытии этого дефекта: True только для станций MB/UB (по конфигу).
    Подсборка и неизвестная станция → False (хватит контрмеры/комментария; время — автоматом)."""
    return station_segment(station_name_for(conn, defect_id)) in vin_required_segments(conn)


def config_flag(conn, key, default=True):
    """Булев флаг из defect_config (редактируется в Редакторе). '0'/'false'/'no'/'off'/'' → False."""
    r = conn.execute('SELECT value FROM defect_config WHERE key=?', (key,)).fetchone()
    if not r or r[0] is None:
        return bool(default)
    return str(r[0]).strip().lower() not in ('0', 'false', 'no', 'off', '')


# ── зоны ответственности (бренд + участок) ───────────────────────────────────
def base_segment(seg):
    """Базовый код участка: 'EC2'→'EC', 'RF1'→'RF', 'MB'→'MB', 'INR+WH'→'INR+WH' (хвостовые цифры отбрасываем)."""
    return re.sub(r'\d+$', '', seg or '').strip()


_SIDES = ('L', 'R')


def station_side(name):
    """Сторона станции: 'GW-BS L-10' → 'L', 'GW-BS-R-10' → 'R', 'GW-MB-150' → ''.
    Имя сначала приводится рабочим ключом (normalize.code_key): регистр, двойные пробелы,
    кириллические двойники и разные тире не влияют."""
    k = code_key(name)
    if not k:
        return ''
    parts = k.split('-')
    if len(parts) < 2:
        return ''
    toks = parts[1].split()
    if len(toks) > 1 and toks[1] in _SIDES:
        return toks[1]
    if len(toks) == 1 and len(parts) > 3 and parts[2] in _SIDES:
        return parts[2]
    return ''


def defect_area(station_name):
    """Участок дефекта по имени станции: базовый код и сторона, если она есть.
    'GW-BS L-10'→'BS-L', 'CH-WH2 R-20'→'WH-R', 'GW-EC2-10'→'EC', 'GW-MB-150'→'MB'.
    Левая и правая стороны — разные участки (решение 2026-11-09)."""
    base = base_segment(station_segment(code_key(station_name) or ''))
    side = station_side(station_name)
    return f'{base}-{side}' if base and side else base


def area_covered(zone, area):
    """Зона-участок покрывает участок дефекта: 'BS' — обе стороны (BS-L и BS-R),
    'BS-L' — только левую. 'INR' не покрывает 'INR+WH-L': это другой участок."""
    return bool(zone and area) and (area == zone or area.startswith(zone + '-'))


# Зона сотрудника — одно из трёх: участок целиком ('EC', 'BS'), сторона ('BS-L') или станция —
# рабочий ключ станции из normalize.station_key ('EC1-10', 'BS L-10', 'MB-150'). У станции
# в конце номер через дефис, у участка и стороны — никогда: так их и различаем.
_STATION_ZONE_RE = re.compile(r'-\d+$')


def is_station_zone(zone):
    return bool(zone and _STATION_ZONE_RE.search(zone))


def station_zone(station_name):
    """Станция дефекта как зона: 'GW-EC1-10' → 'EC1-10', 'GW-BS L-10' → 'BS L-10'; нет станции → ''."""
    k = station_key(station_name)
    return k if is_station_zone(k) else ''


def area_base(area):
    """Участок без стороны: 'BS-L' → 'BS', 'INR+WH-R' → 'INR+WH', 'EC' → 'EC'."""
    return area[:-2] if area and area[-2:] in ('-L', '-R') else (area or '')


def zone_covers(zone, area, station=''):
    """Зона покрывает дефект с этим участком и станцией."""
    if is_station_zone(zone):
        return bool(station) and zone == station
    return area_covered(zone, area)


def in_zones(zone_pairs, brand_txt, area, station=''):
    """Попадает ли дефект (бренд, участок, станция) в зоны сотрудника. zone_pairs = {(имя бренда, зона)}.
    Одна проверка для «Моих входящих» и для уведомлений. Дефект без участка виден всем;
    бренд не известен — сравниваем только участок и станцию."""
    if not area:
        return True
    unknown_brand = not brand_txt or brand_txt == '—'
    return any((unknown_brand or b == brand_txt) and zone_covers(z, area, station) for b, z in zone_pairs)


def segments_by_brand(conn):
    """{brand_id: [участки дефектов]} — из станций: 'BS-L', 'BS-R', 'EC', …"""
    out = {}
    for bid, name in conn.execute('SELECT brand_id, station_name FROM station'):
        seg = defect_area(name)
        if seg:
            out.setdefault(bid, set()).add(seg)
    return {bid: sorted(v) for bid, v in out.items()}


def _natural(s):
    return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', s)]


def zone_tree(conn):
    """Выбор зон по брендам: участок → стороны → станции (из справочника станций).
    {brand_id: [{'code': 'EC', 'stations': ['EC1-10', …], 'sides': []},
                {'code': 'BS', 'stations': [], 'sides': [{'code': 'BS-L', 'stations': ['BS L-10', …]}, …]}]}"""
    raw = {}
    for bid, name in conn.execute('SELECT brand_id, station_name FROM station'):
        area = defect_area(name)
        if not area:
            continue
        node = raw.setdefault(bid, {}).setdefault(area_base(area), {'stations': set(), 'sides': {}})
        bucket = node['stations'] if area == area_base(area) else node['sides'].setdefault(area, set())
        st = station_zone(name)
        if st:
            bucket.add(st)
    return {bid: [{'code': base,
                   'stations': sorted(n['stations'], key=_natural),
                   'sides': [{'code': s, 'stations': sorted(n['sides'][s], key=_natural)} for s in sorted(n['sides'])]}
                  for base, n in sorted(areas.items())]
            for bid, areas in raw.items()}


def _zone_parents(tree):
    """{brand_id: {зона: родитель}}: станция → сторона или участок, сторона → участок."""
    out = {}
    for bid, areas in tree.items():
        p = out.setdefault(bid, {})
        for a in areas:
            p[a['code']] = None
            for st in a['stations']:
                p[st] = a['code']
            for side in a['sides']:
                p[side['code']] = a['code']
                for st in side['stations']:
                    p[st] = side['code']
    return out


def zone_choices(conn):
    """{brand_id: [все допустимые зоны]}: участки, стороны и станции."""
    return {bid: sorted(p, key=_natural) for bid, p in _zone_parents(zone_tree(conn)).items()}


def clean_zone_map(conn, areas_map):
    """Проверить и упростить выбор зон {brand_id: [зоны]} → (map, неизвестные).
    Выбран участок или сторона целиком — станции внутри лишние. Неизвестный бренд или зона — в ошибки.
    Ввод приводится рабочим ключом; старая запись вида 'EC2' понимается как участок 'EC'."""
    parents = _zone_parents(zone_tree(conn))
    out, unknown = {}, []
    for bid, segs in (areas_map or {}).items():
        try:
            bid = int(bid)
        except (TypeError, ValueError):
            unknown.append(str(bid))
            continue
        par = parents.get(bid, {})
        codes = set()
        for s in segs or []:
            c = code_key(s)
            if not c:
                continue
            if c not in par and base_segment(c) in par and not is_station_zone(c):
                c = base_segment(c)
            if c in par:
                codes.add(c)
            else:
                unknown.append(c)

        def covered(c):
            p = par.get(c)
            while p:
                if p in codes:
                    return True
                p = par.get(p)
            return False
        codes = {c for c in codes if not covered(c)}
        if codes:
            out[bid] = sorted(codes, key=_natural)
    return out, unknown


def worker_areas(conn, worker_id):
    """Множество (brand_id, segment) — зоны ответственности сотрудника (пусто = нет ограничений)."""
    return {(r[0], r[1]) for r in conn.execute(
        'SELECT brand_id, segment FROM worker_area WHERE worker_id=?', (worker_id,))}


def brands_with_areas(conn):
    """Для формы выбора зон: {'brands': [{id, name}], 'tree': участок → стороны → станции,
    'areas': {brand_id: [все допустимые зоны]}}."""
    brands = [{'id': r[0], 'name': r[1]} for r in conn.execute('SELECT UniqueID, brand FROM brand ORDER BY UniqueID')]
    tree = zone_tree(conn)
    return {'brands': brands, 'tree': tree,
            'areas': {bid: sorted(p, key=_natural) for bid, p in _zone_parents(tree).items()}}


def worker_areas_map(conn, worker_id):
    """{brand_id: [участки]} сотрудника — для отображения/редактирования."""
    out = {}
    for bid, seg in conn.execute('SELECT brand_id, segment FROM worker_area WHERE worker_id=? ORDER BY segment', (worker_id,)):
        out.setdefault(bid, []).append(seg)
    return out


def set_worker_areas(conn, worker_id, areas_map):
    """Переписать зоны сотрудника: areas_map = {brand_id: [зоны]}. Удаляет старые, вставляет новые.
    Неизвестные участки не сохраняет; проверить выбор заранее — clean_zone_map."""
    clean, _unknown = clean_zone_map(conn, areas_map)
    conn.execute('DELETE FROM worker_area WHERE worker_id=?', (worker_id,))
    for bid, segs in clean.items():
        for seg in segs:
            conn.execute('INSERT OR IGNORE INTO worker_area (worker_id, brand_id, segment) VALUES (?,?,?)',
                         (worker_id, bid, seg))


# ── этапы (defect_stage) ─────────────────────────────────────────────────────
def _open_stage(conn, defect_id, dept, actor_id=None, note=None):
    conn.execute('INSERT INTO defect_stage (defect_id, dept, entered_at, actor_id, note) VALUES (?,?,?,?,?)',
                 (defect_id, dept, _now(), actor_id, note))
    # Уведомления (outbox) — кому дефект прилетел в «Мои входящие». Пишется в ту же
    # транзакцию. Доставка — фоном. Уведомления НИКОГДА не ломают рабочий процесс:
    # любые ошибки (нет таблицы/колонок и т.п.) гасим и логируем.
    try:
        from app.notifications import enqueue_stage_arrival
        enqueue_stage_arrival(conn, defect_id, dept)
    except Exception:  # noqa: BLE001
        import logging
        logging.getLogger(__name__).warning('enqueue уведомления не удался', exc_info=True)


def _close_open_stage(conn, defect_id, outcome, actor_id=None, cause=None, countermeasure=None, note=None):
    row = conn.execute(
        'SELECT UniqueID FROM defect_stage WHERE defect_id=? AND left_at IS NULL ORDER BY UniqueID DESC LIMIT 1',
        (defect_id,)).fetchone()
    if not row:
        return
    conn.execute("""UPDATE defect_stage
                      SET left_at=?, outcome=?, actor_id=COALESCE(?,actor_id),
                          cause=COALESCE(?,cause), countermeasure=COALESCE(?,countermeasure), note=COALESCE(?,note)
                    WHERE UniqueID=?""",
                 (_now(), outcome, actor_id, cause, countermeasure, note, row[0]))


def _code_and_current(conn, defect_id):
    r = conn.execute('SELECT problem_code, current_stage_dept FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()
    return (r[0], r[1]) if r else (None, None)


# ── вход в цепочку ───────────────────────────────────────────────────────────
def enter_chain(conn, defect_id, actor_id=None):
    code = conn.execute('SELECT problem_code FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()[0]
    chain = route_for(conn, code)
    if not chain:
        conn.execute("UPDATE defects SET status='unresolved', current_stage_dept=NULL WHERE UniqueID=?", (defect_id,))
        return None
    first = chain[0]
    conn.execute("""UPDATE defects SET status='in_review', current_stage_dept=?, stage_index=0, stage_entered_at=?
                    WHERE UniqueID=?""", (first, _now(), defect_id))
    _open_stage(conn, defect_id, first, actor_id)
    return first


# ── действия на этапе ────────────────────────────────────────────────────────
def act_close(conn, defect_id, dept, actor_id, cause, countermeasure, vin):
    """Контрмера принята → закрытие отделом. Закрытие НЕ финальное: дефект уходит на
    перепроверку точки в ОТК (статус pending_otk). vin — на каком авто отдел проверил и
    решил закрыть («с какого решено»). Пишем и в legacy-поля root_cause/solution."""
    _close_open_stage(conn, defect_id, 'closed', actor_id, cause=cause, countermeasure=countermeasure)
    conn.execute("""UPDATE defects SET status='pending_otk', closed_by_dept=?, worker_solve_id=?,
                      root_cause=?, solution=?, vin=?, current_stage_dept=?, stage_entered_at=?
                    WHERE UniqueID=?""",
                 (dept, actor_id, cause or '', countermeasure or '', vin or '', OTK, _now(), defect_id))
    _open_stage(conn, defect_id, OTK, None)


def act_otk_approve(conn, defect_id, actor_id, note=None):
    """ОТК перепроверил точку и согласовал закрытие → дефект закрыт окончательно."""
    _close_open_stage(conn, defect_id, 'otk_approved', actor_id, note=note)
    conn.execute("UPDATE defects SET status='closed', current_stage_dept=NULL WHERE UniqueID=?", (defect_id,))


def act_otk_reject(conn, defect_id, actor_id, reason):
    """ОТК не согласовал закрытие → возврат отделу, который закрывал (как доработка, +возврат)."""
    _close_open_stage(conn, defect_id, 'otk_rejected', actor_id, note=reason)
    back = conn.execute('SELECT closed_by_dept FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()[0]
    if not back:
        code = conn.execute('SELECT problem_code FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()[0]
        chain = route_for(conn, code)
        back = chain[0] if chain else None
    conn.execute("""UPDATE defects SET status='in_review', current_stage_dept=?, stage_entered_at=?,
                      return_count=return_count+1 WHERE UniqueID=?""", (back, _now(), defect_id))
    _open_stage(conn, defect_id, back, None)
    return back


def act_pass(conn, defect_id, actor_id, note=None):
    """Причина не выявлена → следующий отдел цепочки; если цепочка кончилась → unresolved."""
    code, curdept = _code_and_current(conn, defect_id)
    _close_open_stage(conn, defect_id, 'passed', actor_id, note=note)
    chain = route_for(conn, code)
    idx = chain.index(curdept) if curdept in chain else -1
    nxt = idx + 1
    if 0 <= nxt < len(chain):
        conn.execute("UPDATE defects SET current_stage_dept=?, stage_index=?, stage_entered_at=? WHERE UniqueID=?",
                     (chain[nxt], nxt, _now(), defect_id))
        _open_stage(conn, defect_id, chain[nxt], None)
        return chain[nxt]
    conn.execute("UPDATE defects SET status='unresolved', current_stage_dept=NULL WHERE UniqueID=?", (defect_id,))
    return None


def act_bounce(conn, defect_id, actor_id, to_dept, reason):
    """Вернуть на доработку к ВЫБРАННОМУ отделу (возврат → в статистику)."""
    code, _ = _code_and_current(conn, defect_id)
    _close_open_stage(conn, defect_id, 'returned', actor_id, note=reason)
    chain = route_for(conn, code)
    idx = chain.index(to_dept) if to_dept in chain else 0
    conn.execute("""UPDATE defects SET status='in_review', current_stage_dept=?, stage_index=?,
                      stage_entered_at=?, return_count=return_count+1
                    WHERE UniqueID=?""", (to_dept, idx, _now(), defect_id))
    _open_stage(conn, defect_id, to_dept, None)


def act_delegate_oto(conn, defect_id, dept, actor_id, reason):
    """Передать заявку в ОТО (оборудование). Запоминаем, кому вернуть после контрмеры ОТО."""
    _close_open_stage(conn, defect_id, 'to_oto', actor_id, note=reason)
    conn.execute("""UPDATE defects SET status='at_oto', delegated_from_dept=?, current_stage_dept=?, stage_entered_at=?
                    WHERE UniqueID=?""", (dept, OTO, _now(), defect_id))
    _open_stage(conn, defect_id, OTO, None)


def act_oto_countermeasure(conn, defect_id, actor_id, countermeasure):
    """ОТО дал контрмеру → управление возвращается отделу-отправителю."""
    _close_open_stage(conn, defect_id, 'oto_done', actor_id, countermeasure=countermeasure)
    back = conn.execute('SELECT delegated_from_dept FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()[0]
    if not back:
        code = conn.execute('SELECT problem_code FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()[0]
        chain = route_for(conn, code)
        back = chain[0] if chain else None
    conn.execute("UPDATE defects SET status='in_review', current_stage_dept=?, stage_entered_at=? WHERE UniqueID=?",
                 (back, _now(), defect_id))
    _open_stage(conn, defect_id, back, None)
    return back


# ── серийность / регистрация ─────────────────────────────────────────────────
def find_serial_parent(conn, spot_id, code, when):
    """Недавний дефект на ТОЙ ЖЕ точке в ТОЙ ЖЕ группе в пределах окна — иначе None.
    Недельное правило: повтор на точке = серия ВСЕГДА, независимо от статуса прежнего
    (открыт он или уже закрыт). Берём самый свежий подходящий дефект на точке."""
    if not spot_id:
        return None
    grp = series_group(code)
    win = serial_window_days(conn)
    rows = conn.execute("""SELECT UniqueID, problem_code, df_date FROM defects
                           WHERE spot_id=?
                           ORDER BY df_date DESC, UniqueID DESC LIMIT 30""", (spot_id,)).fetchall()
    for did, pcode, ddate in rows:
        if series_group(pcode) != grp:
            continue
        last = conn.execute('SELECT MAX(occ_date) FROM defect_occurrence WHERE defect_id=?', (did,)).fetchone()[0]
        if _days_between(last or ddate, when) <= win:
            return did
    return None


COMMENT_MAX = 500   # комментарий контролёра к выявлению (символов)


def clean_comment(raw):
    """Комментарий контролёра: обрезать пробелы и длину; пустой → None (поле необязательное)."""
    text = str(raw or '').strip()[:COMMENT_MAX].strip()
    return text or None


def add_occurrence(conn, defect_id, when, registered_by, comment=None):
    """Выявление дефекта: дата, контролёр, его комментарий. Каждое выявление — отдельная
    запись (первое и каждый повтор серии): по ним контролёр видит «что нашёл я за день»."""
    conn.execute('INSERT INTO defect_occurrence (defect_id, occ_date, registered_by, comment) VALUES (?,?,?,?)',
                 (defect_id, when, registered_by, clean_comment(comment)))


def merge_into_open(conn, parent_id, when, registered_by, comment=None):
    """Повтор на ещё ОТКРЫТОМ дефекте: доливаем появление и помечаем серийным, этап/статус
    не трогаем (дефект уже у кого-то на рассмотрении) — новую карточку не плодим."""
    conn.execute('UPDATE defects SET is_serial=1 WHERE UniqueID=?', (parent_id,))
    add_occurrence(conn, parent_id, when, registered_by, comment)


def reopen_as_serial(conn, parent_id, when, registered_by, comment=None):
    """Переоткрыть родителя как серийный: вернуть отделу-закрывшему (для ОТО-кейса — отделу,
    что передавал в ОТО). Считается возвратом + серией; добавляем новое появление.
    Родитель на согласовании ОТК ещё держит открытый этап ОТК — он закрывается повтором
    (serial_repeat), иначе у дефекта два открытых этапа. Этап сменился → «в работе» снимается."""
    row = conn.execute('SELECT closed_by_dept, delegated_from_dept, problem_code FROM defects WHERE UniqueID=?',
                        (parent_id,)).fetchone()
    closed_by, deleg, code = row[0], row[1], row[2]
    chain = route_for(conn, code)
    back = closed_by or deleg or (chain[0] if chain else None)
    _close_open_stage(conn, parent_id, 'serial_repeat', note='Повтор на точке — возврат отделу, закрывшему дефект')
    conn.execute("""UPDATE defects SET status='in_review', is_serial=1, current_stage_dept=?,
                      return_count=return_count+1, stage_entered_at=?, assigned_worker_id=NULL
                    WHERE UniqueID=?""", (back, _now(), parent_id))
    _open_stage(conn, parent_id, back, None)
    add_occurrence(conn, parent_id, when, registered_by, comment)
    return back


def register_occurrence(conn, *, problem_code, spot_id=None, gun_id=None, registered_by=None,
                        when=None, manual_spot_number=None, manual_model_id=None, comment=None):
    """Зафиксировать дефект. Серийный повтор на той же точке (в окне, та же группа):
    — если прежний дефект уже закрыт/не выявлен → переоткрыть его как серийный;
    — если он ещё открыт → долить появление в него (не плодя карточку).
    Иначе — создать новый и завести в цепочку. Возвращает {defect_id, serial, stage, repeat}:
    repeat — 'reopened' (переоткрыт) / 'merged' (долит в открытый) / None (новый дефект).
    comment — необязательный комментарий контролёра, хранится у этого выявления."""
    when = when or date.today().isoformat()
    code = (problem_code or '').strip().upper()
    parent = find_serial_parent(conn, spot_id, code, when)
    if parent:
        pstatus = conn.execute('SELECT COALESCE(status,"") FROM defects WHERE UniqueID=?', (parent,)).fetchone()[0]
        if pstatus in ('closed', 'pending_otk', 'unresolved'):
            back = reopen_as_serial(conn, parent, when, registered_by, comment)   # закрытый/не выявленный → переоткрыть
            repeat = 'reopened'
        else:
            merge_into_open(conn, parent, when, registered_by, comment)           # ещё открыт → долить в него
            back = conn.execute('SELECT current_stage_dept FROM defects WHERE UniqueID=?', (parent,)).fetchone()[0]
            repeat = 'merged'
        return {'defect_id': parent, 'serial': True, 'stage': back, 'repeat': repeat}
    cur = conn.execute("""INSERT INTO defects
            (problem_code, root_cause, solution, df_date, created_at, spot_id, gun_id, status,
             manual_spot_number, manual_model_id, worker_register_id)
            VALUES (?, '', '', ?, ?, ?, ?, 'registered', ?, ?, ?)""",
                       (code, when, _now(), spot_id, gun_id, manual_spot_number, manual_model_id, registered_by))
    did = cur.lastrowid
    add_occurrence(conn, did, when, registered_by, comment)
    # Снимок — один раз, до цепочки: уведомления/VIN сразу видят станцию. Серийный повтор
    # (выше) снимок прежней карточки не трогает — у неё история своего дня.
    snapshot_defect(conn, did, SNAP_REGISTRATION)
    stage = enter_chain(conn, did, registered_by)
    return {'defect_id': did, 'serial': False, 'stage': stage, 'repeat': None}


def reopen(conn, defect_id, actor_id=None, note=None):
    """Переоткрыть закрытый дефект (аварийный клапан WeldTeam) — вернуть отделу, что
    закрывал (для ОТО-кейса — отделу, передававшему в ОТО). note — причина переоткрытия."""
    row = conn.execute('SELECT closed_by_dept, delegated_from_dept, problem_code FROM defects WHERE UniqueID=?',
                        (defect_id,)).fetchone()
    chain = route_for(conn, row[2])
    back = row[0] or row[1] or (chain[0] if chain else None)
    conn.execute("UPDATE defects SET status='in_review', current_stage_dept=?, stage_entered_at=? WHERE UniqueID=?",
                 (back, _now(), defect_id))
    _open_stage(conn, defect_id, back, actor_id, note=note)
    return back


# ── права на действие (владение этапом) ──────────────────────────────────────
def can_act_stage(current_stage_dept, dept, is_admin=False):
    """Действовать на этапе может отдел текущего этапа; админ (WeldTeam) — аварийный клапан."""
    if is_admin:
        return True
    return bool(current_stage_dept) and dept == current_stage_dept


# ── приоритет для сортировки списка (0 — выше всех) ──────────────────────────
def defect_priority(is_b_point, is_serial):
    if is_b_point:
        return 0        # точки группы B — немедленно, первыми
    if is_serial:
        return 1        # серийные — вторыми
    return 2
