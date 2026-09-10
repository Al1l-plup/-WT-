"""Доска дефектов: регистрация, работа, закрытие."""
from flask import Blueprint, jsonify, request, session

from app.db import get_db
from app.errors import api_error
from app.snapshots import snapshot_defect

bp = Blueprint('defects', __name__)


def _current_worker_id():
    """Кто регистрирует дефект — текущий вошедший пользователь (worker.UniqueID из сессии).
    Доп. информации от пользователя не требуется, поэтому проставляем автоматически."""
    return session.get('uid')


@bp.route('/api/defects/register', methods=['POST'])
def register_defect():
    data = request.json or {}
    model_id     = data.get('model_id', '')
    spot_number  = str(data.get('spot_number', '')).strip()
    problem_code = str(data.get('problem_code', '')).strip().upper()

    if not model_id or not spot_number or not problem_code:
        return jsonify({'status': 'error', 'message': 'Укажите модель авто, номер точки и код дефекта'}), 400

    db = get_db()
    row = db.execute("""
        SELECT s.UniqueID as spot_id, ws.gun_id, s.spot_number
        FROM spot s
        JOIN welding_setup ws ON s.UniqueID = ws.spot_id AND ws.is_active = 1
        WHERE s.spot_number=? AND s.model_id=?
        LIMIT 1
    """, (spot_number, int(model_id))).fetchone()

    if not row:
        try:
            cur = db.cursor()
            cur.execute("""
                INSERT INTO defects (problem_code, root_cause, solution, df_date,
                                    spot_id, gun_id, status, manual_spot_number, manual_model_id, worker_register_id)
                VALUES (?, '', '', DATE('now'), NULL, NULL, 'registered', ?, ?, ?)
            """, (problem_code, spot_number, int(model_id), _current_worker_id()))
            snapshot_defect(db, cur.lastrowid)
            db.commit()
            return jsonify({'status': 'success',
                            'message': f'Дефект {problem_code} зарегистрирован. ⚠ Точка №{spot_number} не найдена в БД — уточните данные при взятии в работу.',
                            'found_in_db': False})
        except Exception as e:
            db.rollback()
            return api_error(e)

    try:
        cur = db.cursor()
        cur.execute("""
            INSERT INTO defects
                (problem_code, root_cause, solution, df_date, spot_id, gun_id, status, worker_register_id)
            VALUES (?, '', '', DATE('now'), ?, ?, 'registered', ?)
        """, (problem_code, row['spot_id'], row['gun_id'], _current_worker_id()))
        snapshot_defect(db, cur.lastrowid)
        db.commit()
        return jsonify({'status': 'success', 'message': f'Дефект {problem_code} на точке №{spot_number} зафиксирован'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/add', methods=['POST'])
def add_defect():
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
               CASE WHEN d.spot_id IS NULL AND d.manual_spot_number IS NOT NULL THEN 1 ELSE 0 END as needs_enrichment
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
    open_rows = db.execute(base + """
        WHERE COALESCE(d.status,'registered') IN ('registered','in_work')
        ORDER BY CASE COALESCE(d.status,'registered') WHEN 'registered' THEN 0 ELSE 1 END,
                 d.df_date DESC, d.UniqueID DESC
    """).fetchall()
    closed_rows = db.execute(base + """
        WHERE COALESCE(d.status,'registered') = 'closed'
        ORDER BY d.df_date DESC, d.UniqueID DESC LIMIT 50
    """).fetchall()
    workers = db.execute('SELECT UniqueID, surname, name FROM worker WHERE is_active=1').fetchall()
    return jsonify({'open': [dict(r) for r in open_rows],
                    'closed': [dict(r) for r in closed_rows],
                    'workers': [dict(w) for w in workers]})


@bp.route('/api/defects/take', methods=['POST'])
def take_defect():
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
    db = get_db()
    try:
        defect = db.execute(
            'SELECT auto_created_spot_id FROM defects WHERE UniqueID=?', (defect_id,)
        ).fetchone()
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
        return jsonify({'status': 'success', 'message': 'Дефект удалён'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/defects/enrich', methods=['POST'])
def enrich_defect():
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
    data         = request.json or {}
    g_num        = data.get('g_num')
    problem_code = str(data.get('problem_code', '')).strip().upper()
    if not g_num or not problem_code:
        return jsonify({'status': 'error', 'message': 'Укажите номер пистолета и код дефекта'}), 400
    db  = get_db()
    gun = db.execute('SELECT UniqueID FROM gun WHERE g_num=?', (int(g_num),)).fetchone()
    if not gun:
        try:
            cur = db.cursor()
            cur.execute("INSERT INTO gun (g_num, gun_type) VALUES (?, 'Ручной ввод')", (int(g_num),))
            gun_id = cur.lastrowid
            db.commit()
        except Exception as e:
            db.rollback()
            return api_error(e)
    else:
        gun_id = gun['UniqueID']
    try:
        cur = db.cursor()
        cur.execute("""
            INSERT INTO defects (problem_code, root_cause, solution, df_date, spot_id, gun_id, status, worker_register_id)
            VALUES (?, '', '', DATE('now'), NULL, ?, 'registered', ?)
        """, (problem_code, gun_id, _current_worker_id()))
        snapshot_defect(db, cur.lastrowid)
        db.commit()
        return jsonify({'status': 'success',
                        'message': f'Дефект {problem_code} на пистолете №{g_num} зафиксирован'})
    except Exception as e:
        db.rollback()
        return api_error(e)
