"""Движок процесса дефектов 4M: цепочка согласования, этапы, серийность, ОТО.

Чистая логика над соединением sqlite (работает и с get_db(), и с обычным connection —
используется и из эндпоинтов, и из тестов). Снимок (snapshot_defect) и commit делает
вызывающий эндпоинт.

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
from datetime import date, datetime

OTO = 'ОТО'
OTK = 'ОТК'


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
    return parts[1].split()[0].strip().upper()


def vin_required_segments(conn):
    """Множество сегментов станций, при которых закрытие требует VIN (по умолчанию MB/UB).
    Редактируется в «Редакторе» → «Параметры дефектов» (defect_config.vin_required_segments)."""
    r = conn.execute("SELECT value FROM defect_config WHERE key='vin_required_segments'").fetchone()
    raw = r[0] if r and r[0] else 'MB,UB'
    return {s.strip().upper() for s in raw.split(',') if s.strip()}


def station_name_for(conn, defect_id):
    """Имя станции дефекта: снимок snap_station_name; иначе live через gun→трансформатор→станцию.
    Для ручных/пистолетных дефектов может быть None (станция не определена)."""
    r = conn.execute('SELECT snap_station_name FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()
    if r and r[0]:
        return r[0]
    r2 = conn.execute("""SELECT st.station_name
        FROM defects d JOIN gun g ON d.gun_id=g.UniqueID
        JOIN gun_transformer_assignment gta ON gta.gun_id=g.UniqueID AND gta.is_active=1
        JOIN transformer_station_assignment tsa ON tsa.transformer_id=gta.transformer_id AND tsa.is_active=1
        JOIN station st ON st.UniqueID=tsa.station_id
        WHERE d.UniqueID=? LIMIT 1""", (defect_id,)).fetchone()
    return r2[0] if r2 else None


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


# ── этапы (defect_stage) ─────────────────────────────────────────────────────
def _open_stage(conn, defect_id, dept, actor_id=None, note=None):
    conn.execute('INSERT INTO defect_stage (defect_id, dept, entered_at, actor_id, note) VALUES (?,?,?,?,?)',
                 (defect_id, dept, _now(), actor_id, note))


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
    """Недавно ЗАКРЫТЫЙ дефект на той же точке в той же группе в пределах окна — иначе None."""
    if not spot_id:
        return None
    grp = series_group(code)
    win = serial_window_days(conn)
    rows = conn.execute("""SELECT UniqueID, problem_code, df_date FROM defects
                           WHERE spot_id=? AND COALESCE(status,'') IN ('closed','pending_otk')
                           ORDER BY df_date DESC, UniqueID DESC LIMIT 30""", (spot_id,)).fetchall()
    for did, pcode, ddate in rows:
        if series_group(pcode) != grp:
            continue
        last = conn.execute('SELECT MAX(occ_date) FROM defect_occurrence WHERE defect_id=?', (did,)).fetchone()[0]
        if _days_between(last or ddate, when) <= win:
            return did
    return None


def reopen_as_serial(conn, parent_id, when, registered_by):
    """Переоткрыть родителя как серийный: вернуть отделу-закрывшему (для ОТО-кейса — отделу,
    что передавал в ОТО). Считается возвратом + серией; добавляем новое появление."""
    row = conn.execute('SELECT closed_by_dept, delegated_from_dept, problem_code FROM defects WHERE UniqueID=?',
                        (parent_id,)).fetchone()
    closed_by, deleg, code = row[0], row[1], row[2]
    chain = route_for(conn, code)
    back = closed_by or deleg or (chain[0] if chain else None)
    conn.execute("""UPDATE defects SET status='in_review', is_serial=1, current_stage_dept=?,
                      return_count=return_count+1, stage_entered_at=?
                    WHERE UniqueID=?""", (back, _now(), parent_id))
    _open_stage(conn, parent_id, back, None)
    conn.execute('INSERT INTO defect_occurrence (defect_id, occ_date, registered_by) VALUES (?,?,?)',
                 (parent_id, when, registered_by))
    return back


def register_occurrence(conn, *, problem_code, spot_id=None, gun_id=None, registered_by=None,
                        when=None, manual_spot_number=None, manual_model_id=None):
    """Зафиксировать дефект: если это серийный повтор — переоткрыть родителя; иначе создать
    новый и завести в цепочку. Возвращает {defect_id, serial, stage}."""
    when = when or date.today().isoformat()
    code = (problem_code or '').strip().upper()
    parent = find_serial_parent(conn, spot_id, code, when)
    if parent:
        back = reopen_as_serial(conn, parent, when, registered_by)
        return {'defect_id': parent, 'serial': True, 'stage': back}
    cur = conn.execute("""INSERT INTO defects
            (problem_code, root_cause, solution, df_date, spot_id, gun_id, status,
             manual_spot_number, manual_model_id, worker_register_id)
            VALUES (?, '', '', ?, ?, ?, 'registered', ?, ?, ?)""",
                       (code, when, spot_id, gun_id, manual_spot_number, manual_model_id, registered_by))
    did = cur.lastrowid
    conn.execute('INSERT INTO defect_occurrence (defect_id, occ_date, registered_by) VALUES (?,?,?)',
                 (did, when, registered_by))
    stage = enter_chain(conn, did, registered_by)
    return {'defect_id': did, 'serial': False, 'stage': stage}


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
