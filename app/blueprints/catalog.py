"""Справочники: бренды, станции, пистолеты, параметры, модели, точки."""
from flask import Blueprint, jsonify, request

from app.db import get_db
from app.errors import api_error

bp = Blueprint('catalog', __name__)


@bp.route('/api/brands')
def get_brands():
    db = get_db()
    rows = db.execute('SELECT UniqueID, brand FROM brand').fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/stations')
def get_all_stations():
    db = get_db()
    brand_id = request.args.get('brand_id', '').strip()
    if brand_id:
        rows = db.execute('SELECT UniqueID, station_name FROM station WHERE brand_id=? ORDER BY station_name', (int(brand_id),)).fetchall()
    else:
        rows = db.execute('SELECT UniqueID, station_name, brand_id FROM station ORDER BY station_name').fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/stations/<int:brand_id>')
def get_stations(brand_id):
    db = get_db()
    rows = db.execute('SELECT UniqueID, station_name FROM station WHERE brand_id=? ORDER BY station_name', (brand_id,)).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/guns/<int:station_id>')
def get_guns(station_id):
    db = get_db()
    rows = db.execute("""
        SELECT DISTINCT g.UniqueID, g.g_num, g.gun_type as model
        FROM gun g
        JOIN gun_transformer_assignment gta ON g.UniqueID = gta.gun_id
        JOIN transformer_station_assignment tsa ON gta.transformer_id = tsa.transformer_id
        WHERE tsa.station_id=? AND gta.is_active=1 AND tsa.is_active=1
    """, (station_id,)).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/parameters/<int:gun_id>')
def get_parameters(gun_id):
    db = get_db()
    params = db.execute("""
        SELECT DISTINCT p.UniqueID, p.mode, p.pressure, p.squeeze_time, p.up_slope_time,
               p.weld_1, p.heat_1, p.cool_1, p.weld_2, p.heat_2, p.hold, p.turn_R
        FROM parameters p
        JOIN welding_setup ws ON p.UniqueID = ws.parameter_id
        WHERE ws.gun_id=? AND ws.is_active=1
    """, (gun_id,)).fetchall()
    workers = db.execute('SELECT UniqueID, surname, name FROM worker WHERE is_active=1').fetchall()
    return jsonify({'parameters': [dict(p) for p in params], 'workers': [dict(w) for w in workers]})


@bp.route('/api/guns/by_number/<int:g_num>')
def get_gun_by_number(g_num):
    db = get_db()
    gun = db.execute('SELECT UniqueID, g_num, gun_type as model FROM gun WHERE g_num=?', (g_num,)).fetchone()
    if not gun:
        return jsonify({'status': 'empty', 'message': f'Пистолет №{g_num} не найден'})
    params = db.execute("""
        SELECT DISTINCT p.UniqueID, COALESCE(p.mode,'?') as mode, p.pressure,
               p.squeeze_time, p.up_slope_time, p.weld_1, p.heat_1, p.cool_1,
               p.weld_2, p.heat_2, p.hold, p.turn_R
        FROM parameters p
        JOIN welding_setup ws ON p.UniqueID = ws.parameter_id
        WHERE ws.gun_id=? AND ws.is_active=1
    """, (gun['UniqueID'],)).fetchall()
    workers = db.execute('SELECT UniqueID, surname, name FROM worker WHERE is_active=1').fetchall()
    return jsonify({'status': 'success', 'gun': dict(gun),
                    'parameters': [dict(p) for p in params],
                    'workers': [dict(w) for w in workers]})


@bp.route('/api/gun/<int:gun_id>/history')
def get_gun_history(gun_id):
    db = get_db()
    m_logs = db.execute("""
        SELECT m.UniqueId, m.to_date,
               m.first_weld, m.second_weld, m.third_weld,
               m.first_pressure, m.second_pressure, m.third_pressure,
               COALESCE(m.snap_worker_surname, w.surname) as surname,
               COALESCE(m.snap_mode, p.mode, '—') as mode,
               COALESCE(m.snap_heat_1, p.heat_1, 0) as heat_1,
               COALESCE(m.snap_heat_2, p.heat_2, 0) as heat_2
        FROM maintenance m
        LEFT JOIN worker w ON m.worker_id = w.UniqueID
        LEFT JOIN parameters p ON m.parameter_id = p.UniqueID
        WHERE m.gun_id=? ORDER BY m.to_date DESC, m.UniqueId DESC LIMIT 5
    """, (gun_id,)).fetchall()
    d_logs = db.execute("""
        SELECT d.UniqueID, d.df_date, d.problem_code, d.root_cause, d.solution,
               COALESCE(d.snap_spot_number, s.spot_number) as spot_number,
               COALESCE(w_reg.surname,'—') as registered_by,
               COALESCE(w_solv.surname,'В процессе') as solved_by
        FROM defects d
        LEFT JOIN spot s ON d.spot_id = s.UniqueID
        LEFT JOIN worker w_reg ON d.worker_register_id = w_reg.UniqueID
        LEFT JOIN worker w_solv ON d.worker_solve_id = w_solv.UniqueID
        WHERE d.gun_id=? ORDER BY d.df_date DESC, d.UniqueID DESC LIMIT 5
    """, (gun_id,)).fetchall()
    p_logs = db.execute("""
        SELECT ws.start_date, ws.end_date, ws.is_active, ws.comments, p.mode, p.pressure,
               p.squeeze_time, p.up_slope_time, p.weld_1, p.heat_1, p.cool_1,
               p.weld_2, p.heat_2, p.hold, p.turn_R
        FROM welding_setup ws
        JOIN parameters p ON ws.parameter_id = p.UniqueID
        WHERE ws.gun_id=?
        GROUP BY ws.parameter_id, ws.start_date
        ORDER BY ws.start_date DESC, ws.is_active DESC LIMIT 10
    """, (gun_id,)).fetchall()
    return jsonify({'maintenance': [dict(m) for m in m_logs],
                    'defects': [dict(d) for d in d_logs],
                    'params': [dict(p) for p in p_logs]})


@bp.route('/api/parameters/update', methods=['POST'])
def update_parameters_direct():
    data = request.json or {}
    db = get_db()
    cur = db.cursor()
    try:
        orig = cur.execute('SELECT * FROM parameters WHERE UniqueID=?', (int(data['parameter_id']),)).fetchone()
        turn_r = float(str(data.get('param_turn_R') or orig['turn_R']).replace(',','.'))
        # pressure comes in as daN → convert to N
        pressure_N = int(float(data.get('param_pressure') or 0) * 10) or orig['pressure']
        cur.execute("""
            INSERT INTO parameters (pressure, squeeze_time, up_slope_time, weld_1, heat_1, cool_1,
                                    weld_2, heat_2, hold, turn_R, mode)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (pressure_N,
              int(data.get('param_squeeze_time') or orig['squeeze_time']),
              int(data.get('param_up_slope_time') or orig['up_slope_time']),
              int(data.get('param_weld_1')  or orig['weld_1']),
              int(data.get('param_heat_1')  or orig['heat_1']),
              int(data.get('param_cool_1')  or orig['cool_1']),
              int(data.get('param_weld_2')  or orig['weld_2']),
              int(data.get('param_heat_2')  or orig['heat_2']),
              int(data.get('param_hold')    or orig['hold']),
              turn_r, orig['mode']))
        new_id = cur.lastrowid
        cur.execute("UPDATE welding_setup SET is_active=0, end_date=DATE('now') WHERE gun_id=? AND parameter_id=? AND is_active=1",
                    (int(data['gun_id']), int(data['parameter_id'])))
        comment = (data.get('param_comment') or '').strip() or 'Прямое обновление уставок ТО'
        cur.execute("""
            INSERT INTO welding_setup (comments, start_date, end_date, is_active, spot_id, gun_id, parameter_id)
            SELECT ?, DATE('now'), NULL, 1, spot_id, ?, ?
            FROM welding_setup WHERE gun_id=? AND parameter_id=? LIMIT 1
        """, (comment, int(data['gun_id']), new_id, int(data['gun_id']), int(data['parameter_id'])))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Уставки обновлены!'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/models')
def get_models():
    db = get_db()
    brand_id = request.args.get('brand_id', '').strip()
    if brand_id:
        rows = db.execute(
            'SELECT UniqueID, model_name, model_code, type, brand_id FROM model WHERE brand_id=? ORDER BY model_name',
            (int(brand_id),)
        ).fetchall()
    else:
        rows = db.execute('SELECT UniqueID, model_name, model_code, type, brand_id FROM model ORDER BY model_name').fetchall()
    result = []
    for r in rows:
        d = dict(r)
        t = d.get('type') or ''
        d['display_name'] = f"{d['model_name']} {t}".strip() if t.lower() != 'single' else d['model_name']
        result.append(d)
    return jsonify(result)


@bp.route('/api/defect_codes')
def get_defect_codes():
    db = get_db()
    rows = db.execute('SELECT code, name FROM defect_code ORDER BY code').fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/spots/search')
def search_spot():
    spot_number = request.args.get('spot_number','').strip()
    model_id    = request.args.get('model_id','').strip()
    if not spot_number or not model_id:
        return jsonify({'status': 'error', 'message': 'Введите номер точки и модель авто'}), 400
    db = get_db()
    rows = db.execute("""
        SELECT s.UniqueID as spot_id, s.spot_number, st.station_name,
               g.g_num, g.gun_type as gun_model, g.UniqueID as gun_id,
               t.transID as trans_name,
               p.UniqueID as parameter_id, p.mode, p.pressure, p.squeeze_time,
               p.up_slope_time, p.weld_1, p.heat_1, p.cool_1, p.weld_2, p.heat_2, p.hold, p.turn_R
        FROM spot s
        JOIN model m ON s.model_id = m.UniqueID
        LEFT JOIN brand b ON m.brand_id = b.UniqueID
        JOIN welding_setup ws ON s.UniqueID = ws.spot_id AND ws.is_active=1
        JOIN gun g ON ws.gun_id = g.UniqueID
        LEFT JOIN parameters p ON ws.parameter_id = p.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN trans t ON gta.transformer_id=t.UniqueID
        LEFT JOIN transformer_station_assignment tsa ON t.UniqueID=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        WHERE s.spot_number=? AND s.model_id=?
    """, (spot_number, model_id)).fetchall()
    if not rows:
        return jsonify({'status': 'empty', 'message': 'Точка не найдена'}), 200
    workers = db.execute('SELECT UniqueID, surname, name FROM worker WHERE is_active=1').fetchall()
    defects = db.execute("""
        SELECT d.UniqueID, d.problem_code, COALESCE(d.description,'') as description,
               d.root_cause, d.solution, d.df_date,
               COALESCE(d.status,'registered') as status,
               w_reg.surname as reg_surname, w_solv.surname as solv_surname
        FROM defects d
        LEFT JOIN worker w_reg ON d.worker_register_id = w_reg.UniqueID
        LEFT JOIN worker w_solv ON d.worker_solve_id = w_solv.UniqueID
        WHERE d.spot_id=? ORDER BY d.df_date DESC, d.UniqueID DESC
    """, (rows[0]['spot_id'],)).fetchall()
    all_d = [dict(d) for d in defects]
    return jsonify({'status': 'success', 'data': [dict(r) for r in rows],
                    'workers': [dict(w) for w in workers],
                    'open_defects':   [d for d in all_d if d['status'] in ('registered','in_work')],
                    'closed_defects': [d for d in all_d if d['status'] == 'closed']})


@bp.route('/api/guns/get_or_create', methods=['POST'])
def get_or_create_gun():
    data  = request.json or {}
    g_num = data.get('g_num')
    if not g_num:
        return jsonify({'status': 'error', 'message': 'g_num обязателен'}), 400
    db  = get_db()
    gun = db.execute('SELECT UniqueID, g_num, gun_type as model FROM gun WHERE g_num=?', (int(g_num),)).fetchone()
    if gun:
        return jsonify({'status': 'found', 'gun': dict(gun)})
    try:
        cur = db.cursor()
        cur.execute("INSERT INTO gun (g_num, gun_type) VALUES (?, 'Ручной ввод')", (int(g_num),))
        new_id = cur.lastrowid
        db.commit()
        return jsonify({'status': 'created',
                        'gun': {'UniqueID': new_id, 'g_num': int(g_num), 'model': 'Ручной ввод'}})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/spots/by_model/<int:model_id>')
def spots_by_model(model_id):
    db = get_db()
    rows = db.execute("""
        SELECT UniqueID, spot_number
        FROM spot WHERE model_id=?
        ORDER BY CAST(spot_number AS INTEGER), spot_number
        LIMIT 1000
    """, (model_id,)).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/spots/find')
def find_spot():
    model_id    = request.args.get('model_id', '').strip()
    spot_number = request.args.get('spot_number', '').strip()
    if not model_id or not spot_number:
        return jsonify({'status': 'error', 'message': 'model_id и spot_number обязательны'}), 400
    db = get_db()
    spot = db.execute(
        'SELECT UniqueID, spot_number FROM spot WHERE spot_number=? AND model_id=?',
        (spot_number, int(model_id))
    ).fetchone()
    if not spot:
        return jsonify({'status': 'empty', 'message': 'Точка не найдена'})
    return jsonify({'status': 'success', 'spot': dict(spot)})
