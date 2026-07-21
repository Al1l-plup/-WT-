"""Обзор данных: пистолеты, станции, точки."""
from flask import Blueprint, jsonify, request

from app.db import get_db
from app.errors import api_error

bp = Blueprint('explorer', __name__)


@bp.route('/api/explorer/gun/<int:gun_id>')
def explorer_gun(gun_id):
    db = get_db()
    gun = db.execute("""
        SELECT g.UniqueID, g.g_num, g.gun_type,
               COALESCE(st.UniqueID, 0)       as station_id,
               COALESCE(st.station_name, '—') as station_name,
               COALESCE(b.UniqueID, 0)         as brand_id,
               COALESCE(b.brand, '—')          as brand
        FROM gun g
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN trans t ON gta.transformer_id=t.UniqueID
        LEFT JOIN transformer_station_assignment tsa ON t.UniqueID=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        LEFT JOIN brand b ON st.brand_id=b.UniqueID
        WHERE g.UniqueID=?
    """, (gun_id,)).fetchone()
    if not gun:
        return jsonify({'status': 'error', 'message': 'Пистолет не найден'}), 404

    active_setups = db.execute("""
        SELECT ws.UniqueID as setup_id, ws.comments, ws.start_date,
               p.UniqueID as parameter_id, p.mode, p.pressure, p.turn_R,
               p.weld_1, p.heat_1, p.cool_1, p.weld_2, p.heat_2, p.hold,
               s.spot_number, mo.model_name, mo.type as model_type
        FROM welding_setup ws
        LEFT JOIN parameters p ON ws.parameter_id=p.UniqueID
        LEFT JOIN spot s ON ws.spot_id=s.UniqueID
        LEFT JOIN model mo ON s.model_id=mo.UniqueID
        WHERE ws.gun_id=? AND ws.is_active=1
        ORDER BY mo.model_name, ws.start_date DESC
    """, (gun_id,)).fetchall()

    setup_history = db.execute("""
        SELECT ws.UniqueID as setup_id, ws.start_date, ws.end_date, ws.is_active,
               ws.comments, ws.auto_created,
               p.mode, p.pressure, p.turn_R, p.weld_1, p.heat_1, p.weld_2, p.heat_2,
               s.spot_number, mo.model_name, mo.type as model_type
        FROM welding_setup ws
        LEFT JOIN parameters p ON ws.parameter_id=p.UniqueID
        LEFT JOIN spot s ON ws.spot_id=s.UniqueID
        LEFT JOIN model mo ON s.model_id=mo.UniqueID
        WHERE ws.gun_id=?
        ORDER BY ws.start_date DESC, ws.UniqueID DESC
        LIMIT 30
    """, (gun_id,)).fetchall()

    maint_history = db.execute("""
        SELECT m.UniqueId, m.to_date,
               ROUND((m.first_weld+m.second_weld+m.third_weld)/3.0)            as avg_weld,
               ROUND((m.first_pressure+m.second_pressure+m.third_pressure)/3.0) as avg_pres_N,
               COALESCE(m.snap_worker_surname, w.surname, '—') as worker
        FROM maintenance m
        LEFT JOIN worker w ON m.worker_id=w.UniqueID
        WHERE m.gun_id=?
        ORDER BY m.to_date DESC, m.UniqueId DESC LIMIT 20
    """, (gun_id,)).fetchall()

    spots = db.execute("""
        SELECT s.UniqueID as spot_id, s.spot_number, mo.model_name, mo.type as model_type
        FROM welding_setup ws
        JOIN spot s ON ws.spot_id=s.UniqueID
        JOIN model mo ON s.model_id=mo.UniqueID
        WHERE ws.gun_id=? AND ws.is_active=1
        ORDER BY mo.model_name, CAST(s.spot_number AS INTEGER)
    """, (gun_id,)).fetchall()

    defects = db.execute("""
        SELECT d.UniqueID, d.df_date, d.problem_code, COALESCE(d.status,'registered') as status,
               COALESCE(d.snap_spot_number, s.spot_number, d.manual_spot_number, '—') as spot_number,
               COALESCE(d.snap_model_name, mo.model_name,'—') as model_name,
               COALESCE(d.root_cause,'') as root_cause,
               COALESCE(d.solution,'') as solution
        FROM defects d
        LEFT JOIN spot s ON d.spot_id=s.UniqueID
        LEFT JOIN model mo ON s.model_id=mo.UniqueID
        WHERE d.gun_id=?
        ORDER BY d.df_date DESC, d.UniqueID DESC LIMIT 20
    """, (gun_id,)).fetchall()

    maint_count = db.execute('SELECT COUNT(*) FROM maintenance WHERE gun_id=?', (gun_id,)).fetchone()[0]
    def_count   = db.execute('SELECT COUNT(*) FROM defects WHERE gun_id=?', (gun_id,)).fetchone()[0]

    return jsonify({
        'gun': dict(gun),
        'active_setups': [dict(r) for r in active_setups],
        'setup_history': [dict(r) for r in setup_history],
        'maintenance': [dict(r) for r in maint_history],
        'spots': [dict(r) for r in spots],
        'defects': [dict(r) for r in defects],
        'maintenance_count': maint_count,
        'defect_count': def_count,
    })


@bp.route('/api/explorer/gun/<int:gun_id>', methods=['PUT'])
def update_gun(gun_id):
    data = request.json or {}
    db = get_db()
    maint_count = db.execute('SELECT COUNT(*) FROM maintenance WHERE gun_id=?', (gun_id,)).fetchone()[0]
    def_count   = db.execute('SELECT COUNT(*) FROM defects WHERE gun_id=?', (gun_id,)).fetchone()[0]
    try:
        fields, values = [], []
        if 'g_num' in data:
            existing = db.execute('SELECT UniqueID FROM gun WHERE g_num=? AND UniqueID!=?',
                                  (int(data['g_num']), gun_id)).fetchone()
            if existing:
                return jsonify({'status': 'error',
                                'message': f'Пистолет №{data["g_num"]} уже существует'}), 400
            fields.append('g_num=?'); values.append(int(data['g_num']))
        if 'gun_type' in data:
            fields.append('gun_type=?'); values.append(data['gun_type'])
        if fields:
            values.append(gun_id)
            db.execute(f'UPDATE gun SET {", ".join(fields)} WHERE UniqueID=?', values)
        db.commit()
        return jsonify({'status': 'success', 'message': 'Пистолет обновлён',
                        'maintenance_count': maint_count, 'defect_count': def_count})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/explorer/station/<int:station_id>')
def explorer_station(station_id):
    db = get_db()
    station = db.execute("""
        SELECT st.UniqueID, st.station_name, b.UniqueID as brand_id, b.brand
        FROM station st JOIN brand b ON st.brand_id=b.UniqueID
        WHERE st.UniqueID=?
    """, (station_id,)).fetchone()
    if not station:
        return jsonify({'status': 'error', 'message': 'Станция не найдена'}), 404

    guns = db.execute("""
        SELECT DISTINCT g.UniqueID, g.g_num, g.gun_type,
               p.mode, p.pressure, p.heat_1, p.heat_2
        FROM gun g
        JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN welding_setup ws ON g.UniqueID=ws.gun_id AND ws.is_active=1
        LEFT JOIN parameters p ON ws.parameter_id=p.UniqueID
        WHERE tsa.station_id=?
        ORDER BY g.g_num
    """, (station_id,)).fetchall()

    defects_summary = db.execute("""
        SELECT d.problem_code, COUNT(*) as cnt,
               COALESCE(dc.name, d.problem_code) as name
        FROM defects d
        JOIN gun g ON d.gun_id=g.UniqueID
        JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN defect_code dc ON d.problem_code=dc.code
        WHERE tsa.station_id=?
        GROUP BY d.problem_code ORDER BY cnt DESC
    """, (station_id,)).fetchall()

    recent_maint = db.execute("""
        SELECT m.to_date, g.g_num,
               ROUND((m.first_weld+m.second_weld+m.third_weld)/3.0) as avg_weld,
               COALESCE(w.surname,'—') as worker
        FROM maintenance m
        JOIN gun g ON m.gun_id=g.UniqueID
        JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN worker w ON m.worker_id=w.UniqueID
        WHERE tsa.station_id=?
        ORDER BY m.to_date DESC, m.UniqueId DESC LIMIT 20
    """, (station_id,)).fetchall()

    models_on_station = db.execute("""
        SELECT DISTINCT mo.model_name, mo.type as model_type, COUNT(s.UniqueID) as spot_count
        FROM welding_setup ws
        JOIN gun g ON ws.gun_id=g.UniqueID
        JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        JOIN spot s ON ws.spot_id=s.UniqueID
        JOIN model mo ON s.model_id=mo.UniqueID
        WHERE tsa.station_id=? AND ws.is_active=1
        GROUP BY mo.UniqueID ORDER BY mo.model_name
    """, (station_id,)).fetchall()

    return jsonify({
        'station': dict(station),
        'guns': [dict(r) for r in guns],
        'defects_summary': [dict(r) for r in defects_summary],
        'recent_maintenance': [dict(r) for r in recent_maint],
        'models': [dict(r) for r in models_on_station],
    })


@bp.route('/api/explorer/station/<int:station_id>', methods=['PUT'])
def update_station(station_id):
    data = request.json or {}
    db = get_db()
    try:
        fields, values = [], []
        if 'station_name' in data:
            fields.append('station_name=?'); values.append(data['station_name'])
        if 'brand_id' in data:
            fields.append('brand_id=?'); values.append(int(data['brand_id']))
        if fields:
            values.append(station_id)
            db.execute(f'UPDATE station SET {", ".join(fields)} WHERE UniqueID=?', values)
        db.commit()
        return jsonify({'status': 'success', 'message': 'Станция обновлена'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/explorer/spot/<int:spot_id>')
def explorer_spot(spot_id):
    db = get_db()
    spot = db.execute("""
        SELECT s.UniqueID, s.spot_number,
               mo.UniqueID as model_id, mo.model_name, mo.type as model_type,
               b.brand
        FROM spot s
        JOIN model mo ON s.model_id=mo.UniqueID
        LEFT JOIN brand b ON mo.brand_id=b.UniqueID
        WHERE s.UniqueID=?
    """, (spot_id,)).fetchone()
    if not spot:
        return jsonify({'status': 'error', 'message': 'Точка не найдена'}), 404

    active_link = db.execute("""
        SELECT ws.UniqueID as setup_id, ws.comments, ws.start_date,
               g.UniqueID as gun_id, g.g_num, g.gun_type,
               p.mode, p.pressure, p.turn_R, p.heat_1, p.heat_2,
               COALESCE(st.station_name,'—') as station_name
        FROM welding_setup ws
        JOIN gun g ON ws.gun_id=g.UniqueID
        LEFT JOIN parameters p ON ws.parameter_id=p.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        WHERE ws.spot_id=? AND ws.is_active=1
        ORDER BY ws.start_date DESC, ws.UniqueID DESC
        LIMIT 1
    """, (spot_id,)).fetchone()

    link_history = db.execute("""
        SELECT ws.UniqueID as setup_id, ws.start_date, ws.end_date, ws.is_active,
               ws.comments, ws.auto_created,
               g.g_num, g.gun_type,
               p.mode, p.pressure, p.heat_1, p.heat_2
        FROM welding_setup ws
        JOIN gun g ON ws.gun_id=g.UniqueID
        LEFT JOIN parameters p ON ws.parameter_id=p.UniqueID
        WHERE ws.spot_id=?
        ORDER BY ws.start_date DESC, ws.UniqueID DESC LIMIT 15
    """, (spot_id,)).fetchall()

    defects = db.execute("""
        SELECT d.UniqueID, d.df_date, d.problem_code, COALESCE(d.status,'registered') as status,
               COALESCE(d.root_cause,'') as root_cause,
               COALESCE(d.solution,'') as solution,
               COALESCE(w.surname,'—') as solved_by
        FROM defects d
        LEFT JOIN worker w ON d.worker_solve_id=w.UniqueID
        WHERE d.spot_id=?
        ORDER BY d.df_date DESC, d.UniqueID DESC LIMIT 20
    """, (spot_id,)).fetchall()

    gun_maint = []
    if active_link:
        gun_maint = db.execute("""
            SELECT m.to_date,
                   ROUND((m.first_weld+m.second_weld+m.third_weld)/3.0)            as avg_weld,
                   ROUND((m.first_pressure+m.second_pressure+m.third_pressure)/3.0) as avg_pres_N,
                   COALESCE(w.surname,'—') as worker
            FROM maintenance m
            LEFT JOIN worker w ON m.worker_id=w.UniqueID
            WHERE m.gun_id=?
            ORDER BY m.to_date DESC, m.UniqueId DESC LIMIT 5
        """, (active_link['gun_id'],)).fetchall()

    return jsonify({
        'spot': dict(spot),
        'active_link': dict(active_link) if active_link else None,
        'link_history': [dict(r) for r in link_history],
        'defects': [dict(r) for r in defects],
        'gun_maintenance': [dict(r) for r in gun_maint],
    })


@bp.route('/api/explorer/spot/<int:spot_id>', methods=['PUT'])
def update_spot(spot_id):
    data = request.json or {}
    db = get_db()
    try:
        fields, values = [], []
        if 'spot_number' in data:
            fields.append('spot_number=?'); values.append(str(data['spot_number']))
        if 'model_id' in data:
            fields.append('model_id=?'); values.append(int(data['model_id']))
        if fields:
            values.append(spot_id)
            db.execute(f'UPDATE spot SET {", ".join(fields)} WHERE UniqueID=?', values)
        db.commit()
        return jsonify({'status': 'success', 'message': 'Точка обновлена'})
    except Exception as e:
        db.rollback()
        return api_error(e)
