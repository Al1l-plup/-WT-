"""Доска дефектов: регистрация, цепочка согласования 4M (этапы/ОТО/серийность), фото."""
import os
import uuid

from flask import Blueprint, current_app, jsonify, request, send_file, session

from app import defect_flow as df
from app.db import get_db
from app.errors import api_error
from app.snapshots import snapshot_defect

bp = Blueprint('defects', __name__)

_IMG_EXT = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


def _current_worker_id():
    """Кто регистрирует дефект — текущий вошедший пользователь (worker.UniqueID из сессии)."""
    return session.get('uid')


def _ctx():
    """(uid, dept, is_admin, privileged). privileged = админ или WeldTeam (аварийный клапан)."""
    dept = session.get('dept')
    is_admin = bool(session.get('is_admin'))
    return session.get('uid'), dept, is_admin, (is_admin or dept == 'WeldTeam')


def _denied():
    return jsonify({'status': 'error', 'message': 'Нет прав: дефект сейчас не на вашем этапе'}), 403


def _photo_dir():
    d = os.path.join(os.path.dirname(current_app.config['DB_PATH']), 'uploads', 'defects')
    os.makedirs(d, exist_ok=True)
    return d


def _photo_stage(db, defect_id):
    """(stage_id, stage_dept) этапа, на котором ДОБАВЛЯЕТСЯ фото: текущий открытый этап
    дефекта (left_at IS NULL); иначе — последний этап; иначе — current_stage_dept."""
    r = db.execute("""SELECT UniqueID, dept FROM defect_stage
                      WHERE defect_id=? AND left_at IS NULL ORDER BY UniqueID DESC LIMIT 1""", (defect_id,)).fetchone()
    if not r:
        r = db.execute('SELECT UniqueID, dept FROM defect_stage WHERE defect_id=? ORDER BY UniqueID DESC LIMIT 1',
                       (defect_id,)).fetchone()
    if r:
        return r['UniqueID'], r['dept']
    cur = db.execute('SELECT current_stage_dept FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()
    return None, (cur['current_stage_dept'] if cur else None)


def _del_photo_file(fname):
    """Удалить файл фото с диска (безопасно: только по basename в папке фото)."""
    try:
        p = os.path.join(_photo_dir(), os.path.basename(fname or ''))
        if fname and os.path.isfile(p):
            os.remove(p)
    except OSError:
        pass


def _can_edit_own(owner_dept, current_stage_dept, my_dept, is_admin):
    """Править/удалять СВОЁ (записи/фото своего отдела), пока дефект на МОЁМ этапе; после
    передачи — заморожено. Эти ограничения обходит ТОЛЬКО реальный админ (не WeldTeam-как-отдел)."""
    return bool(is_admin) or (owner_dept is not None and owner_dept == my_dept and current_stage_dept == my_dept)


def _denied_edit():
    return jsonify({'status': 'error',
                    'message': 'Править можно только свои записи/фото и только пока дефект на вашем этапе'}), 403


def _valid_photo(f):
    return bool(f and f.filename and os.path.splitext(f.filename)[1].lower() in _IMG_EXT)


def _reg_input():
    """Поля регистрации + список валидных фото. Поддержка multipart (форма ОТК с фото)
    и JSON (программно/тесты)."""
    if (request.content_type or '').startswith('multipart/'):
        return request.form, [f for f in request.files.getlist('photo') if _valid_photo(f)]
    return (request.get_json(silent=True) or {}), []


def _save_photos(db, defect_id, photos, uid):
    """Сохранить фото, пометив их ЭТАПОМ ДЕФЕКТА (где оно добавлено), а не отделом загрузившего."""
    sid, sdept = _photo_stage(db, defect_id)
    for f in photos:
        ext = os.path.splitext(f.filename)[1].lower()
        fname = f'{defect_id}_{uuid.uuid4().hex}{ext}'
        f.save(os.path.join(_photo_dir(), fname))
        db.execute('INSERT INTO defect_photo (defect_id, path, uploaded_by, stage_dept, stage_id, ts) VALUES (?,?,?,?,?,?)',
                   (defect_id, fname, uid, sdept, sid, df._now()))


def _photo_required_error(db, photos):
    """Response-кортеж, если фото при регистрации обязательно, но его нет; иначе None.
    Флаг require_defect_photo — из defect_config (правится в Редакторе); дефолт — из config."""
    default = current_app.config.get('REQUIRE_DEFECT_PHOTO', False)
    if df.config_flag(db, 'require_defect_photo', default) and not photos:
        return jsonify({'status': 'error', 'message': 'Приложите фото дефекта — при фиксации это обязательно'}), 400
    return None


@bp.route('/api/defects/register', methods=['POST'])
def register_defect():
    uid, dept, _is_admin, priv = _ctx()
    if not (dept == 'ОТК' or priv):
        return jsonify({'status': 'error', 'message': 'Регистрировать дефекты может ОТК'}), 403
    data, photos = _reg_input()
    model_id     = data.get('model_id', '')
    spot_number  = str(data.get('spot_number', '')).strip()
    problem_code = str(data.get('problem_code', '')).strip().upper()

    if not model_id or not spot_number or not problem_code:
        return jsonify({'status': 'error', 'message': 'Укажите модель авто, номер точки и код дефекта'}), 400
    err = _photo_required_error(get_db(), photos)
    if err:
        return err

    db = get_db()
    row = db.execute("""
        SELECT s.UniqueID as spot_id, ws.gun_id
        FROM spot s
        JOIN welding_setup ws ON s.UniqueID = ws.spot_id AND ws.is_active = 1
        WHERE s.spot_number=? AND s.model_id=?
        LIMIT 1
    """, (spot_number, int(model_id))).fetchone()
    try:
        if row:
            res = df.register_occurrence(db, problem_code=problem_code, spot_id=row['spot_id'],
                                         gun_id=row['gun_id'], registered_by=uid)
            msg = f'Дефект {problem_code} на точке №{spot_number} зафиксирован → отдел «{res["stage"]}»'
        else:
            res = df.register_occurrence(db, problem_code=problem_code, registered_by=uid,
                                         manual_spot_number=spot_number, manual_model_id=int(model_id))
            msg = (f'Дефект {problem_code} зарегистрирован → отдел «{res["stage"]}». '
                   f'⚠ Точка №{spot_number} не найдена в БД — уточните при рассмотрении.')
        if res['serial']:
            msg = (f'⚠ ПОВТОР (серийный)! Дефект {problem_code} на точке №{spot_number} '
                   f'вернулся отделу «{res["stage"]}» на перерассмотрение.')
        _save_photos(db, res['defect_id'], photos, uid)
        snapshot_defect(db, res['defect_id'])
        db.commit()
        return jsonify({'status': 'success', 'message': msg, 'serial': res['serial'],
                        'stage': res['stage'], 'defect_id': res['defect_id'], 'found_in_db': bool(row)})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/add', methods=['POST'])
def add_defect():
    if not _ctx()[3]:
        return jsonify({'status': 'error', 'message': 'Устаревшее действие доступно только WeldTeam'}), 403
    data = request.json or {}
    db = get_db()
    try:
        cur = db.cursor()
        cur.execute("""
            INSERT INTO defects (problem_code, description, root_cause, solution, df_date,
                                 worker_register_id, worker_solve_id, spot_id, gun_id, status)
            VALUES (?, '', '', 'В процессе устранения', DATE('now'), ?, NULL, ?, ?, 'registered')
        """, (data['problem_code'], _current_worker_id(), int(data['spot_id']), int(data['gun_id'])))
        snapshot_defect(db, cur.lastrowid)
        db.commit()
        return jsonify({'status': 'success', 'message': 'Карточка дефекта сохранена!'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/all')
def defects_all():
    db = get_db()
    base = """
        SELECT d.UniqueID, d.df_date, d.problem_code,
               COALESCE(d.status,'registered')             as status,
               COALESCE(d.root_cause,'')                   as root_cause,
               COALESCE(d.solution,'')                     as solution,
               COALESCE(d.snap_spot_number, s.spot_number, d.manual_spot_number, '—') as spot_number,
               COALESCE(d.snap_brand, b.brand, enrich_b.brand, '—')     as brand,
               COALESCE(d.snap_model_name, m.model_name, enrich_m.model_name, '—') as model_name,
               COALESCE(d.snap_model_type, m.type, enrich_m.type, '')   as model_type,
               COALESCE(d.snap_g_num, g.g_num, 0)          as g_num,
               COALESCE(d.snap_gun_type, g.gun_type,'—')   as gun_model,
               COALESCE(d.snap_station_name, d_st.station_name,'—')     as station_name,
               COALESCE(w_asgn.surname,'')                 as asgn_surname,
               COALESCE(w_solv.surname,'')                 as solv_surname,
               d.manual_spot_number,
               d.manual_model_id,
               COALESCE(enrich_m.model_name, '')           as manual_model_name,
               CASE WHEN d.spot_id IS NULL AND d.manual_spot_number IS NOT NULL THEN 1 ELSE 0 END as needs_enrichment,
               d.current_stage_dept,
               d.delegated_from_dept,
               COALESCE(d.is_serial,0)                     as is_serial,
               COALESCE(d.return_count,0)                  as return_count,
               CASE WHEN EXISTS(SELECT 1 FROM weld_point wp WHERE wp.spot_id=d.spot_id AND wp.important='B')
                    THEN 1 ELSE 0 END                      as is_b_point,
               (SELECT COUNT(*) FROM defect_photo dp WHERE dp.defect_id=d.UniqueID) as photo_count
        FROM defects d
        LEFT JOIN spot   s       ON d.spot_id             = s.UniqueID
        LEFT JOIN model  m       ON s.model_id             = m.UniqueID
        LEFT JOIN brand  b       ON m.brand_id             = b.UniqueID
        LEFT JOIN model  enrich_m ON d.manual_model_id    = enrich_m.UniqueID
        LEFT JOIN brand  enrich_b ON enrich_m.brand_id    = enrich_b.UniqueID
        LEFT JOIN gun    g       ON d.gun_id               = g.UniqueID
        LEFT JOIN gun_transformer_assignment d_gta ON g.UniqueID=d_gta.gun_id AND d_gta.is_active=1
        LEFT JOIN transformer_station_assignment d_tsa ON d_gta.transformer_id=d_tsa.transformer_id AND d_tsa.is_active=1
        LEFT JOIN station d_st   ON d_tsa.station_id      = d_st.UniqueID
        LEFT JOIN worker w_asgn  ON d.assigned_worker_id  = w_asgn.UniqueID
        LEFT JOIN worker w_solv  ON d.worker_solve_id     = w_solv.UniqueID
    """
    # GROUP BY d.UniqueID — одна строка на дефект: иначе джойн gun→трансформатор→станция
    # размножает дефект, если у гана несколько активных назначений трансформатора.
    # Приоритет списка: 1) точки B → 2) серийные → 3) остальные.
    priority = """GROUP BY d.UniqueID
                  ORDER BY CASE WHEN is_b_point THEN 0 WHEN is_serial THEN 1 ELSE 2 END,
                           d.df_date DESC, d.UniqueID DESC"""
    open_rows = db.execute(base + """
        WHERE COALESCE(d.status,'registered') IN ('registered','in_work','in_review','at_oto','pending_otk')
    """ + priority).fetchall()
    unresolved_rows = db.execute(base + """
        WHERE COALESCE(d.status,'') = 'unresolved'
    """ + priority).fetchall()
    closed_rows = db.execute(base + """
        WHERE COALESCE(d.status,'registered') = 'closed'
        GROUP BY d.UniqueID
        ORDER BY d.df_date DESC, d.UniqueID DESC LIMIT 50
    """).fetchall()
    workers = db.execute('SELECT UniqueID, surname, name FROM worker WHERE is_active=1').fetchall()
    mydept = session.get('dept')

    def row(r):
        d = dict(r)
        d['mine'] = bool(d.get('current_stage_dept') and d['current_stage_dept'] == mydept)
        return d

    return jsonify({'open': [row(r) for r in open_rows],
                    'unresolved': [row(r) for r in unresolved_rows],
                    'closed': [row(r) for r in closed_rows],
                    'my_dept': mydept,
                    'privileged': bool(session.get('is_admin') or mydept == 'WeldTeam'),
                    'workers': [dict(w) for w in workers]})


@bp.route('/api/defects/take', methods=['POST'])
def take_defect():
    if not _ctx()[3]:
        return jsonify({'status': 'error', 'message': 'Устаревшее действие доступно только WeldTeam'}), 403
    data = request.json or {}
    db = get_db()
    try:
        db.execute("""
            UPDATE defects SET status='in_work', assigned_worker_id=?, root_cause=?
            WHERE UniqueID=? AND COALESCE(status,'registered')='registered'
        """, (int(data['worker_id']), data.get('root_cause',''), int(data['defect_id'])))
        if db.execute('SELECT changes()').fetchone()[0] == 0:
            return jsonify({'status': 'error', 'message': 'Дефект уже взят в работу или не найден'}), 400
        db.commit()
        return jsonify({'status': 'success', 'message': 'Дефект взят в работу!'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/update', methods=['POST'])
def update_defect():
    if not _ctx()[3]:
        return jsonify({'status': 'error', 'message': 'Устаревшее действие доступно только WeldTeam'}), 403
    data = request.json or {}
    db = get_db()
    try:
        db.execute("""
            UPDATE defects SET solution=?, worker_solve_id=?, status='closed'
            WHERE UniqueID=?
        """, (data['solution'], int(data['worker_solve_id']), int(data['defect_id'])))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Дефект закрыт!'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/close', methods=['POST'])
def close_defect():
    if not _ctx()[3]:
        return jsonify({'status': 'error', 'message': 'Устаревшее действие доступно только WeldTeam'}), 403
    data            = request.json or {}
    defect_id       = data.get('defect_id')
    worker_solve_id = data.get('worker_solve_id')
    root_cause      = data.get('root_cause', '')
    solution        = data.get('solution', '')
    model_id        = data.get('model_id')
    gun_num         = data.get('gun_num')

    if not defect_id or not worker_solve_id:
        return jsonify({'status': 'error', 'message': 'Обязательны: defect_id, worker_solve_id'}), 400
    if not solution:
        return jsonify({'status': 'error', 'message': 'Введите контрмеру/решение'}), 400

    db = get_db()
    defect = db.execute(
        'SELECT manual_spot_number, spot_id FROM defects WHERE UniqueID=?',
        (int(defect_id),)
    ).fetchone()
    if not defect:
        return jsonify({'status': 'error', 'message': 'Дефект не найден'}), 404

    needs_enrichment = defect['spot_id'] is None and defect['manual_spot_number']
    try:
        cur = db.cursor()
        if needs_enrichment and model_id and gun_num:
            spot_number = defect['manual_spot_number']
            gun = db.execute('SELECT UniqueID FROM gun WHERE g_num=?', (int(gun_num),)).fetchone()
            if gun:
                gun_id = gun['UniqueID']
            else:
                cur.execute("INSERT INTO gun (g_num, gun_type) VALUES (?, 'Ручной ввод')", (int(gun_num),))
                gun_id = cur.lastrowid
            existing_spot = db.execute(
                'SELECT UniqueID FROM spot WHERE spot_number=? AND model_id=?',
                (spot_number, int(model_id))
            ).fetchone()
            if existing_spot:
                spot_id = existing_spot['UniqueID']
                new_spot = False
            else:
                cur.execute('INSERT INTO spot (spot_number, model_id) VALUES (?, ?)', (spot_number, int(model_id)))
                spot_id = cur.lastrowid
                new_spot = True
            cur.execute("""
                INSERT INTO welding_setup (comments, start_date, is_active, auto_created, spot_id, gun_id, parameter_id)
                VALUES ('', DATE('now'), 1, 1, ?, ?, NULL)
            """, (spot_id, gun_id))
            cur.execute("""
                UPDATE defects
                SET spot_id=?, gun_id=?, status='closed',
                    worker_solve_id=?, root_cause=?, solution=?,
                    auto_created_spot_id=?
                WHERE UniqueID=?
            """, (spot_id, gun_id, int(worker_solve_id), root_cause, solution,
                  spot_id if new_spot else None, int(defect_id)))
        else:
            cur.execute("""
                UPDATE defects SET solution=?, root_cause=?, worker_solve_id=?, status='closed'
                WHERE UniqueID=?
            """, (solution, root_cause, int(worker_solve_id), int(defect_id)))
        # Перезаписать снимок: при обогащении у дефекта появились точка/пистолет
        snapshot_defect(db, int(defect_id))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Дефект закрыт!'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/<int:defect_id>', methods=['DELETE'])
def delete_defect(defect_id):
    if not _ctx()[3]:
        return jsonify({'status': 'error', 'message': 'Устаревшее действие доступно только WeldTeam'}), 403
    db = get_db()
    try:
        defect = db.execute(
            'SELECT auto_created_spot_id FROM defects WHERE UniqueID=?', (defect_id,)
        ).fetchone()
        # почистить связанные фото (файлы + строки) — FK без каскада, иначе остаются orphan
        photo_files = [r[0] for r in db.execute(
            'SELECT path FROM defect_photo WHERE defect_id=?', (defect_id,)).fetchall()]
        db.execute('DELETE FROM defect_photo WHERE defect_id=?', (defect_id,))
        db.execute('DELETE FROM defect_stage WHERE defect_id=?', (defect_id,))
        db.execute('DELETE FROM defect_occurrence WHERE defect_id=?', (defect_id,))
        db.execute('DELETE FROM defects WHERE UniqueID=?', (defect_id,))

        if defect and defect['auto_created_spot_id']:
            sid = defect['auto_created_spot_id']
            db.execute(
                "DELETE FROM welding_setup WHERE spot_id=? AND auto_created=1", (sid,)
            )
            still_used = db.execute(
                'SELECT COUNT(*) FROM welding_setup WHERE spot_id=?', (sid,)
            ).fetchone()[0]
            if still_used == 0:
                db.execute('DELETE FROM spot WHERE UniqueID=?', (sid,))

        db.commit()
        for fn in photo_files:
            _del_photo_file(fn)
        return jsonify({'status': 'success', 'message': 'Дефект удалён'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/enrich', methods=['POST'])
def enrich_defect():
    if not _ctx()[3]:
        return jsonify({'status': 'error', 'message': 'Устаревшее действие доступно только WeldTeam'}), 403
    data       = request.json or {}
    defect_id  = data.get('defect_id')
    model_id   = data.get('model_id')
    gun_num    = data.get('gun_num')
    worker_id  = data.get('worker_id')
    root_cause = data.get('root_cause', '')

    if not defect_id or not model_id or not gun_num or not worker_id:
        return jsonify({'status': 'error', 'message': 'Обязательны: defect_id, model_id, gun_num, worker_id'}), 400

    db = get_db()
    defect = db.execute(
        'SELECT manual_spot_number, manual_brand_id, spot_id FROM defects WHERE UniqueID=?',
        (int(defect_id),)
    ).fetchone()
    if not defect:
        return jsonify({'status': 'error', 'message': 'Дефект не найден'}), 404
    if defect['spot_id'] is not None:
        return jsonify({'status': 'error', 'message': 'Дефект уже привязан к точке'}), 400

    spot_number = defect['manual_spot_number']

    try:
        cur = db.cursor()

        # Find or create gun
        gun = db.execute('SELECT UniqueID FROM gun WHERE g_num=?', (int(gun_num),)).fetchone()
        if gun:
            gun_id = gun['UniqueID']
        else:
            cur.execute("INSERT INTO gun (g_num, gun_type) VALUES (?, 'Ручной ввод')", (int(gun_num),))
            gun_id = cur.lastrowid

        # Find or create spot
        existing_spot = db.execute(
            'SELECT UniqueID FROM spot WHERE spot_number=? AND model_id=?',
            (spot_number, int(model_id))
        ).fetchone()
        if existing_spot:
            spot_id = existing_spot['UniqueID']
            new_spot = False
        else:
            cur.execute(
                'INSERT INTO spot (spot_number, model_id) VALUES (?, ?)',
                (spot_number, int(model_id))
            )
            spot_id = cur.lastrowid
            new_spot = True

        # Create welding_setup linking spot → gun (no parameter for now)
        cur.execute("""
            INSERT INTO welding_setup (comments, start_date, is_active, auto_created, spot_id, gun_id, parameter_id)
            VALUES ('', DATE('now'), 1, 1, ?, ?, NULL)
        """, (spot_id, gun_id))

        # Update defect
        cur.execute("""
            UPDATE defects
            SET spot_id=?, gun_id=?, status='in_work',
                assigned_worker_id=?, root_cause=?,
                auto_created_spot_id=?
            WHERE UniqueID=?
        """, (spot_id, gun_id, int(worker_id), root_cause,
              spot_id if new_spot else None, int(defect_id)))

        # Перезаписать снимок: у дефекта появились точка/пистолет
        snapshot_defect(db, int(defect_id))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Точка создана, дефект взят в работу!'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/register_manual', methods=['POST'])
def register_defect_manual():
    uid, dept, _is_admin, priv = _ctx()
    if not (dept == 'ОТК' or priv):
        return jsonify({'status': 'error', 'message': 'Регистрировать дефекты может ОТК'}), 403
    data, photos = _reg_input()
    g_num        = data.get('g_num')
    problem_code = str(data.get('problem_code', '')).strip().upper()
    if not g_num or not problem_code:
        return jsonify({'status': 'error', 'message': 'Укажите номер пистолета и код дефекта'}), 400
    err = _photo_required_error(get_db(), photos)
    if err:
        return err
    db  = get_db()
    try:
        gun = db.execute('SELECT UniqueID FROM gun WHERE g_num=?', (int(g_num),)).fetchone()
        if gun:
            gun_id = gun['UniqueID']
        else:
            gun_id = db.execute("INSERT INTO gun (g_num, gun_type) VALUES (?, 'Ручной ввод')",
                                (int(g_num),)).lastrowid
        res = df.register_occurrence(db, problem_code=problem_code, gun_id=gun_id, registered_by=uid)
        _save_photos(db, res['defect_id'], photos, uid)
        snapshot_defect(db, res['defect_id'])
        db.commit()
        return jsonify({'status': 'success', 'stage': res['stage'], 'serial': res['serial'], 'defect_id': res['defect_id'],
                        'message': f'Дефект {problem_code} на пистолете №{g_num} зафиксирован → отдел «{res["stage"]}»'})
    except Exception as e:
        db.rollback()
        return api_error(e)


# ── Цепочка согласования: действия на этапе ──────────────────────────────────
@bp.route('/api/defects/<int:defect_id>/act', methods=['POST'])
def defect_act(defect_id):
    """Единая точка действий: close | pass | bounce | delegate_oto | oto | reopen.
    Право действия проверяется по текущему этапу (владение) + WeldTeam=аварийный клапан."""
    uid, dept, _is_admin, priv = _ctx()
    data = request.json or {}
    action = (data.get('action') or '').strip()
    db = get_db()
    d = db.execute('SELECT status, current_stage_dept FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()
    if not d:
        return jsonify({'status': 'error', 'message': 'Дефект не найден'}), 404
    status, cur_dept = d['status'], d['current_stage_dept']
    acting = cur_dept or dept
    try:
        if action == 'close':
            if not df.can_act_stage(cur_dept, dept, priv):
                return _denied()
            cm = (data.get('countermeasure') or '').strip()
            if not cm:
                return jsonify({'status': 'error', 'message': 'Укажите контрмеру'}), 400
            vin = (data.get('vin') or '').strip()
            if df.vin_required(db, defect_id) and not vin:
                return jsonify({'status': 'error',
                                'message': 'Станция MB/UB — укажите VIN (на каком авто проверили и решили закрыть)'}), 400
            df.act_close(db, defect_id, acting, uid, (data.get('cause') or '').strip(), cm, vin)
            msg = 'Закрыто отделом — отправлено на согласование в ОТК'
        elif action == 'otk_approve':
            if status != 'pending_otk':
                return jsonify({'status': 'error', 'message': 'Дефект не на согласовании ОТК'}), 400
            if not df.can_act_stage(cur_dept, dept, priv):
                return _denied()
            df.act_otk_approve(db, defect_id, uid, (data.get('note') or '').strip() or None)
            msg = 'ОТК согласовал закрытие — дефект закрыт'
        elif action == 'otk_reject':
            if status != 'pending_otk':
                return jsonify({'status': 'error', 'message': 'Дефект не на согласовании ОТК'}), 400
            if not df.can_act_stage(cur_dept, dept, priv):
                return _denied()
            reason = (data.get('reason') or '').strip()
            if not reason:
                return jsonify({'status': 'error',
                                'message': 'Добавьте комментарий — почему закрытие не согласовано'}), 400
            if df.config_flag(db, 'require_reject_photo', True):
                sid, _ = _photo_stage(db, defect_id)      # текущий открытый этап = ОТК
                has_photo = db.execute('SELECT 1 FROM defect_photo WHERE defect_id=? AND stage_id=? LIMIT 1',
                                       (defect_id, sid)).fetchone()
                if not has_photo:
                    return jsonify({'status': 'error',
                                    'message': 'Приложите фото — подтвердите, что точка не закрыта'}), 400
            back = df.act_otk_reject(db, defect_id, uid, reason)
            msg = f'Закрытие не согласовано — возврат отделу «{back}»'
        elif action == 'pass':
            if not df.can_act_stage(cur_dept, dept, priv):
                return _denied()
            note = (data.get('note') or '').strip()
            if not note:
                return jsonify({'status': 'error',
                                'message': 'Добавьте комментарий — что проверили и почему передаёте дальше'}), 400
            nxt = df.act_pass(db, defect_id, uid, note)
            msg = (f'Передано отделу «{nxt}»' if nxt
                   else 'Причина не выявлена — дефект в списке «не выявленные» (на недельный разбор)')
        elif action == 'bounce':
            if not df.can_act_stage(cur_dept, dept, priv):
                return _denied()
            to = (data.get('to_dept') or '').strip()
            if not to:
                return jsonify({'status': 'error', 'message': 'Выберите отдел для возврата'}), 400
            reason = (data.get('reason') or '').strip()
            if not reason:
                return jsonify({'status': 'error', 'message': 'Добавьте комментарий — причину возврата'}), 400
            df.act_bounce(db, defect_id, uid, to, reason)
            msg = f'Возвращено отделу «{to}» на доработку'
        elif action == 'delegate_oto':
            if not df.can_act_stage(cur_dept, dept, priv):
                return _denied()
            reason = (data.get('reason') or '').strip()
            if not reason:
                return jsonify({'status': 'error',
                                'message': 'Добавьте комментарий для ОТО — что проверить/отрегулировать'}), 400
            df.act_delegate_oto(db, defect_id, acting, uid, reason)
            msg = 'Заявка передана в ОТО (оборудование)'
        elif action == 'oto':
            if not (status == 'at_oto' and (dept == df.OTO or priv)):
                return _denied()
            cm = (data.get('countermeasure') or '').strip()
            if not cm:
                return jsonify({'status': 'error', 'message': 'Укажите контрмеру ОТО'}), 400
            back = df.act_oto_countermeasure(db, defect_id, uid, cm)
            msg = f'Контрмера ОТО принята — возврат отделу «{back}»'
        elif action == 'reopen':
            if not priv:
                return jsonify({'status': 'error', 'message': 'Переоткрывать дефекты может только WeldTeam'}), 403
            if status != 'closed':
                return jsonify({'status': 'error', 'message': 'Переоткрыть можно только закрытый дефект'}), 400
            reason = (data.get('reason') or '').strip()
            if not reason:
                return jsonify({'status': 'error', 'message': 'Добавьте комментарий — причину переоткрытия'}), 400
            back = df.reopen(db, defect_id, uid, reason)
            msg = f'Дефект переоткрыт → отдел «{back}»'
        else:
            return jsonify({'status': 'error', 'message': 'Неизвестное действие'}), 400
        snapshot_defect(db, defect_id)
        db.commit()
        return jsonify({'status': 'success', 'message': msg})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/<int:defect_id>')
def defect_detail(defect_id):
    """Карточка дефекта: сам дефект + история этапов + появления + фото."""
    db = get_db()
    d = db.execute("""
        SELECT d.UniqueID, d.df_date, d.problem_code, COALESCE(d.status,'registered') as status,
               d.current_stage_dept, d.delegated_from_dept, d.closed_by_dept,
               COALESCE(d.is_serial,0) as is_serial, COALESCE(d.return_count,0) as return_count,
               COALESCE(d.vin,'') as vin, COALESCE(d.created_at, d.df_date, '') as created_at,
               COALESCE(d.manual_model_id, d.snap_model_id) as model_id,
               COALESCE(d.root_cause,'') as root_cause, COALESCE(d.solution,'') as solution,
               COALESCE(d.snap_spot_number, s.spot_number, d.manual_spot_number, '—') as spot_number,
               COALESCE(d.snap_model_name, m.model_name, '—') as model_name,
               COALESCE(d.snap_g_num, g.g_num, 0) as g_num,
               CASE WHEN EXISTS(SELECT 1 FROM weld_point wp WHERE wp.spot_id=d.spot_id AND wp.important='B')
                    THEN 1 ELSE 0 END as is_b_point
        FROM defects d
        LEFT JOIN spot s ON d.spot_id=s.UniqueID
        LEFT JOIN model m ON s.model_id=m.UniqueID
        LEFT JOIN gun g ON d.gun_id=g.UniqueID
        WHERE d.UniqueID=?""", (defect_id,)).fetchone()
    if not d:
        return jsonify({'status': 'error', 'message': 'Дефект не найден'}), 404
    stages = db.execute("""
        SELECT st.UniqueID as stage_id, st.dept, st.entered_at, st.left_at, st.outcome,
               COALESCE(st.cause,'') as cause, COALESCE(st.countermeasure,'') as countermeasure,
               COALESCE(st.note,'') as note, COALESCE(w.surname,'') as actor
        FROM defect_stage st LEFT JOIN worker w ON st.actor_id=w.UniqueID
        WHERE st.defect_id=? ORDER BY st.UniqueID""", (defect_id,)).fetchall()
    occ = db.execute('SELECT occ_date FROM defect_occurrence WHERE defect_id=? ORDER BY UniqueID',
                     (defect_id,)).fetchall()
    photos = db.execute('SELECT UniqueID, stage_dept, stage_id, ts FROM defect_photo WHERE defect_id=? ORDER BY UniqueID',
                        (defect_id,)).fetchall()
    return jsonify({'status': 'success', 'defect': dict(d),
                    'stages': [dict(r) for r in stages],
                    'occurrences': [r['occ_date'] for r in occ],
                    'photos': [dict(p) for p in photos],
                    'vin_required': df.vin_required(db, defect_id),
                    'station_name': df.station_name_for(db, defect_id),
                    'my_dept': session.get('dept'),
                    'privileged': bool(session.get('is_admin') or session.get('dept') == 'WeldTeam')})


@bp.route('/api/defects/<int:defect_id>/photo', methods=['POST'])
def defect_photo_upload(defect_id):
    """Фото дефекта: любой на своём этапе (+ ОТК/WeldTeam). Изображения, хранятся в data/uploads/defects."""
    uid, dept, _is_admin, priv = _ctx()
    db = get_db()
    d = db.execute('SELECT current_stage_dept FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()
    if not d:
        return jsonify({'status': 'error', 'message': 'Дефект не найден'}), 404
    if not (priv or dept == 'ОТК' or dept == d['current_stage_dept']):
        return _denied()
    f = request.files.get('photo')
    if not f or not f.filename:
        return jsonify({'status': 'error', 'message': 'Файл не передан'}), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in _IMG_EXT:
        return jsonify({'status': 'error', 'message': 'Только изображения (jpg/png/webp/gif)'}), 400
    try:
        sid, sdept = _photo_stage(db, defect_id)
        fname = f'{defect_id}_{uuid.uuid4().hex}{ext}'
        f.save(os.path.join(_photo_dir(), fname))
        db.execute('INSERT INTO defect_photo (defect_id, path, uploaded_by, stage_dept, stage_id, ts) VALUES (?,?,?,?,?,?)',
                   (defect_id, fname, uid, sdept, sid, df._now()))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Фото добавлено'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/<int:defect_id>/photo/<int:photo_id>', methods=['DELETE'])
def defect_photo_delete(defect_id, photo_id):
    """Удалить своё фото (фото своего отдела), пока дефект на этапе моего отдела. Только
    реальный админ удаляет любое. Чистит и файл."""
    _uid, dept, is_admin, _priv = _ctx()
    db = get_db()
    p = db.execute("""SELECT dp.path, dp.stage_dept, d.current_stage_dept
                      FROM defect_photo dp JOIN defects d ON d.UniqueID=dp.defect_id
                      WHERE dp.UniqueID=? AND dp.defect_id=?""", (photo_id, defect_id)).fetchone()
    if not p:
        return jsonify({'status': 'error', 'message': 'Фото не найдено'}), 404
    if not _can_edit_own(p['stage_dept'], p['current_stage_dept'], dept, is_admin):
        return _denied_edit()
    try:
        db.execute('DELETE FROM defect_photo WHERE UniqueID=?', (photo_id,))
        db.commit()
        _del_photo_file(p['path'])
        return jsonify({'status': 'success', 'message': 'Фото удалено'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/<int:defect_id>/stage/<int:stage_id>', methods=['PATCH', 'POST'])
def defect_stage_edit(defect_id, stage_id):
    """Правка комментария СВОЕГО этапа (cause/countermeasure/note), пока дефект на моём
    этапе (этап не закрыт). Чужой/замороженный этап — только реальный админ. Правка — в аудит."""
    _uid, dept, is_admin, _priv = _ctx()
    data = request.json or {}
    db = get_db()
    st = db.execute("""SELECT s.dept, s.left_at, d.current_stage_dept
                       FROM defect_stage s JOIN defects d ON d.UniqueID=s.defect_id
                       WHERE s.UniqueID=? AND s.defect_id=?""", (stage_id, defect_id)).fetchone()
    if not st:
        return jsonify({'status': 'error', 'message': 'Этап не найден'}), 404
    frozen = st['left_at'] is not None            # этап закрыт и передан дальше → заморожен
    if not (is_admin or (st['dept'] == dept and not frozen)):
        return _denied_edit()
    fields = {k: (data.get(k) or '').strip() for k in ('cause', 'countermeasure', 'note') if k in data}
    if not fields:
        return jsonify({'status': 'error', 'message': 'Нечего менять: передайте cause/countermeasure/note'}), 400
    try:
        sets = ', '.join(f'{k}=?' for k in fields)
        db.execute(f'UPDATE defect_stage SET {sets} WHERE UniqueID=?', (*fields.values(), stage_id))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Запись этапа обновлена'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/<int:defect_id>/correct', methods=['POST'])
def defect_correct(defect_id):
    """ОТК исправляет справочные данные дефекта (код/модель/номер точки), пока дефект ВОЗВРАЩЁН
    на этап ОТК (bounce в ОТК). Точку перепривязываем как при регистрации, снимок переснимаем.
    Можно приложить фото (ляжет на текущий этап ОТК). Реальный админ — всегда."""
    uid, dept, is_admin, _priv = _ctx()
    data, photos = _reg_input()
    db = get_db()
    d = db.execute('SELECT current_stage_dept FROM defects WHERE UniqueID=?', (defect_id,)).fetchone()
    if not d:
        return jsonify({'status': 'error', 'message': 'Дефект не найден'}), 404
    if not (is_admin or (dept == 'ОТК' and d['current_stage_dept'] == 'ОТК')):
        return jsonify({'status': 'error',
                        'message': 'Исправлять данные может ОТК, пока дефект возвращён на этап ОТК'}), 403
    code = str(data.get('problem_code', '')).strip().upper()
    spot_number = str(data.get('spot_number', '')).strip()
    model_id = data.get('model_id')
    if not code or not spot_number or not model_id:
        return jsonify({'status': 'error', 'message': 'Укажите код, модель и номер точки'}), 400
    try:
        row = db.execute("""SELECT s.UniqueID as spot_id, ws.gun_id FROM spot s
                            JOIN welding_setup ws ON s.UniqueID = ws.spot_id AND ws.is_active = 1
                            WHERE s.spot_number=? AND s.model_id=? LIMIT 1""",
                         (spot_number, int(model_id))).fetchone()
        if row:
            db.execute("""UPDATE defects SET problem_code=?, spot_id=?, gun_id=?,
                            manual_spot_number=NULL, manual_model_id=NULL WHERE UniqueID=?""",
                       (code, row['spot_id'], row['gun_id'], defect_id))
        else:
            db.execute("""UPDATE defects SET problem_code=?, spot_id=NULL, gun_id=NULL,
                            manual_spot_number=?, manual_model_id=? WHERE UniqueID=?""",
                       (code, spot_number, int(model_id), defect_id))
        if photos:
            _save_photos(db, defect_id, photos, uid)
        snapshot_defect(db, defect_id)
        db.commit()
        msg = 'Данные исправлены' if row else 'Данные исправлены (точка не найдена в БД — сохранена как ручная)'
        return jsonify({'status': 'success', 'message': msg, 'found_in_db': bool(row)})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/photo/<int:photo_id>')
def defect_photo_get(photo_id):
    db = get_db()
    p = db.execute('SELECT path FROM defect_photo WHERE UniqueID=?', (photo_id,)).fetchone()
    if not p:
        return jsonify({'status': 'error', 'message': 'Фото не найдено'}), 404
    path = os.path.join(_photo_dir(), os.path.basename(p['path']))
    if not os.path.exists(path):
        return jsonify({'status': 'error', 'message': 'Файл отсутствует'}), 404
    return send_file(path)
