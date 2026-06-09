from flask import Flask, render_template, jsonify, request, g
import sqlite3
from datetime import datetime, date

app = Flask(__name__)
DB_PATH = 'welding_shop.db'

DEFECT_DICTIONARY = {
    'CR': 'Crack / Трещина',
    'SN': 'Small Nugget / Малое ядро',
    'LP': 'Lack of Penetration / Непровар',
    'BN': 'Burnt Nugget / Выжженное ядро',
    'SW': 'Stick Weld / Склейка (тонкое ядро)',
    'P':  'Porosity / Поры',
    'MI': 'Metal Inclusion / Металлические включения',
    'BT': 'Burn-through / Прожог',
    'IE': 'Excessive Indentation / Чрезмерная усадка',
    'MS': 'Metal Spatter / Брызги металла',
    'ME': 'Metal Extrusion / Выдавливание металла',
    'EMU':'Excess Metal Upset / Избыточный наплыв',
    'MN': 'Missing Nugget / Отсутствует точка',
    'NA': 'No Access / Нет доступа',
    'EO': 'Weld Spot Edge Offset / Смещение от края',
    'BE': 'Loss of backwall echo / Потеря донного сигнала'
}


def _migrate():
    c = sqlite3.connect(DB_PATH)
    for ddl in [
        "ALTER TABLE defects ADD COLUMN description TEXT",
        "ALTER TABLE defects ADD COLUMN status TEXT DEFAULT 'registered'",
        "ALTER TABLE defects ADD COLUMN assigned_worker_id INTEGER",
        "ALTER TABLE worker  ADD COLUMN department TEXT DEFAULT 'WeldTeam'",
        "ALTER TABLE defects ADD COLUMN manual_spot_number TEXT",
        "ALTER TABLE defects ADD COLUMN manual_brand_id INTEGER",
        "ALTER TABLE defects ADD COLUMN manual_model_id INTEGER",
        "ALTER TABLE defects ADD COLUMN auto_created_spot_id INTEGER",
        "ALTER TABLE welding_setup ADD COLUMN auto_created INTEGER DEFAULT 0",
        "ALTER TABLE gun RENAME COLUMN model TO gun_type",
        """CREATE TABLE IF NOT EXISTS defect_code (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )""",
        """CREATE TABLE IF NOT EXISTS maintenance_schedule (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            gun_id       INTEGER NOT NULL,
            brand_id     INTEGER NOT NULL,
            month_number INTEGER NOT NULL,
            plan_type    TEXT,
            UNIQUE(gun_id, month_number)
        )""",
        """CREATE TABLE IF NOT EXISTS maintenance_daily_task (
            id                       INTEGER PRIMARY KEY AUTOINCREMENT,
            gun_id                   INTEGER NOT NULL,
            task_date                TEXT NOT NULL,
            status                   TEXT DEFAULT 'pending',
            assigned_worker_id       INTEGER,
            created_by_worker_id     INTEGER,
            completed_maintenance_id INTEGER,
            notes                    TEXT,
            created_at               TEXT DEFAULT (datetime('now'))
        )""",
    ]:
        try: c.execute(ddl); c.commit()
        except: pass
    c.execute("UPDATE defects SET status='closed'     WHERE status IS NULL AND solution != 'В процессе устранения'")
    c.execute("UPDATE defects SET status='registered' WHERE status IS NULL")
    c.execute("UPDATE worker  SET department='WeldTeam' WHERE department IS NULL")
    for code, name in DEFECT_DICTIONARY.items():
        try: c.execute("INSERT OR IGNORE INTO defect_code (code, name) VALUES (?,?)", (code, name))
        except: pass
    c.commit()
    c.close()
_migrate()


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH, check_same_thread=False)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def teardown_db(exc):
    db = g.pop('db', None)
    if db: db.close()


# ── СТРАНИЦЫ ────────────────────────────────────────────────────────
@app.route('/')
def index(): return render_template('index.html')

@app.route('/maintenance')
def maintenance(): return render_template('maintenance.html')

@app.route('/defects')
def defects_page(): return render_template('defects.html')

@app.route('/analytics')
def analytics_page(): return render_template('analytics.html')

@app.route('/workers')
def workers_page(): return render_template('workers.html')


# ── БРЕНДЫ / СТАНЦИИ / ПИСТОЛЕТЫ / ПАРАМЕТРЫ ────────────────────────
@app.route('/api/brands')
def get_brands():
    db = get_db()
    rows = db.execute('SELECT UniqueID, brand FROM brand').fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/stations')
def get_all_stations():
    db = get_db()
    brand_id = request.args.get('brand_id', '').strip()
    if brand_id:
        rows = db.execute('SELECT UniqueID, station_name FROM station WHERE brand_id=? ORDER BY station_name', (int(brand_id),)).fetchall()
    else:
        rows = db.execute('SELECT UniqueID, station_name, brand_id FROM station ORDER BY station_name').fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/stations/<int:brand_id>')
def get_stations(brand_id):
    db = get_db()
    rows = db.execute('SELECT UniqueID, station_name FROM station WHERE brand_id=? ORDER BY station_name', (brand_id,)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/guns/<int:station_id>')
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

@app.route('/api/parameters/<int:gun_id>')
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

@app.route('/api/guns/by_number/<int:g_num>')
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


# ── ИСТОРИЯ КЛЕЩЕЙ ───────────────────────────────────────────────────
@app.route('/api/gun/<int:gun_id>/history')
def get_gun_history(gun_id):
    db = get_db()
    m_logs = db.execute("""
        SELECT m.UniqueId, m.to_date,
               m.first_weld, m.second_weld, m.third_weld,
               m.first_pressure, m.second_pressure, m.third_pressure,
               w.surname,
               COALESCE(p.mode,'—') as mode,
               COALESCE(p.heat_1,0) as heat_1, COALESCE(p.heat_2,0) as heat_2
        FROM maintenance m
        LEFT JOIN worker w ON m.worker_id = w.UniqueID
        LEFT JOIN parameters p ON m.parameter_id = p.UniqueID
        WHERE m.gun_id=? ORDER BY m.to_date DESC, m.UniqueId DESC LIMIT 5
    """, (gun_id,)).fetchall()
    d_logs = db.execute("""
        SELECT d.UniqueID, d.df_date, d.problem_code, d.root_cause, d.solution, s.spot_number,
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


# ── ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ ────────────────────────────────────────
@app.route('/api/maintenance', methods=['POST'])
def save_maintenance():
    data = request.json or {}
    try:
        gun_id   = int(data.get('gun_id')       or 0)
        param_id = int(data.get('parameter_id') or 0)
        w1 = int(data.get('first_weld')  or 0)
        w2 = int(data.get('second_weld') or 0)
        w3 = int(data.get('third_weld')  or 0)
        # Pressure input is in daN → convert to N for storage
        p1_N = int(data.get('first_pressure')  or 0) * 10
        p2_N = int(data.get('second_pressure') or 0) * 10
        p3_N = int(data.get('third_pressure')  or 0) * 10
    except (ValueError, TypeError):
        return jsonify({'status': 'error', 'message': 'Некорректный формат замеров'}), 400

    db = get_db()
    param = db.execute('SELECT heat_1, heat_2, pressure FROM parameters WHERE UniqueID=?', (param_id,)).fetchone()
    if not param and param_id:
        return jsonify({'status': 'error', 'message': 'Режим не найден'}), 400

    if param:
        avg_weld = (w1 + w2 + w3) / 3.0
        target_heat = param['heat_2'] if (param['heat_1'] > 0 and param['heat_2'] > 0) else (param['heat_1'] or param['heat_2'])
        if abs(avg_weld - target_heat) > 100:
            return jsonify({'status': 'validation_error',
                            'message': f'Ток отклонён! Средний ({round(avg_weld,1)} А) отклоняется от уставки ({target_heat} А) более чем на ±100 А.'}), 400

        avg_pres_N = (p1_N + p2_N + p3_N) / 3.0
        target_pres_N = param['pressure']
        if target_pres_N and abs(avg_pres_N - target_pres_N) > 500:
            return jsonify({'status': 'validation_error',
                            'message': f'Давление отклонено! Среднее ({round(avg_pres_N/10,1)} daN) отклоняется от уставки ({round(target_pres_N/10,1)} daN) более чем на ±50 daN.'}), 400

    try:
        cur = db.cursor()
        cur.execute("""
            INSERT INTO maintenance
                (first_weld, second_weld, third_weld, first_pressure, second_pressure, third_pressure,
                 to_date, worker_id, gun_id, parameter_id)
            VALUES (?,?,?,?,?,?,DATE('now'),?,?,?)
        """, (w1, w2, w3, p1_N, p2_N, p3_N,
              int(data.get('worker_id') or 0), gun_id, param_id))
        new_id = cur.lastrowid
        task_id = data.get('task_id')
        if task_id:
            try:
                wid = int(data.get('worker_id') or 0) or None
                cur.execute("""UPDATE maintenance_daily_task
                               SET status='done', completed_maintenance_id=?, assigned_worker_id=?
                               WHERE id=?""",
                            (new_id, wid, int(task_id)))
            except: pass
        db.commit()
        return jsonify({'status': 'success', 'message': 'Карточка ТО сохранена!', 'maintenance_id': new_id})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/maintenance/<int:record_id>', methods=['DELETE'])
def delete_maintenance(record_id):
    db = get_db()
    try:
        db.execute('DELETE FROM maintenance WHERE UniqueId=?', (record_id,))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Запись ТО удалена'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/maintenance/analytics')
def maintenance_analytics():
    db = get_db()
    by_brand = db.execute("""
        SELECT COALESCE(b.brand,'Без линии') as brand, COUNT(m.UniqueId) as cnt
        FROM maintenance m JOIN gun g ON m.gun_id=g.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        LEFT JOIN brand b ON st.brand_id=b.UniqueID
        GROUP BY b.UniqueID ORDER BY cnt DESC
    """).fetchall()
    by_month = db.execute("""
        SELECT strftime('%Y-%m',to_date) as month, COUNT(*) as cnt
        FROM maintenance GROUP BY month ORDER BY month DESC LIMIT 6
    """).fetchall()
    recent = db.execute("""
        SELECT m.UniqueId, m.to_date,
               ROUND((m.first_weld+m.second_weld+m.third_weld)/3.0) as avg_weld,
               ROUND((m.first_pressure+m.second_pressure+m.third_pressure)/3.0) as avg_pres_N,
               g.g_num, g.gun_type as gun_model,
               COALESCE(w.surname,'—') as worker_surname,
               COALESCE(b.brand,'—') as brand
        FROM maintenance m JOIN gun g ON m.gun_id=g.UniqueID
        LEFT JOIN worker w ON m.worker_id=w.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        LEFT JOIN brand b ON st.brand_id=b.UniqueID
        ORDER BY m.to_date DESC, m.UniqueId DESC LIMIT 15
    """).fetchall()
    total = db.execute('SELECT COUNT(*) FROM maintenance').fetchone()[0]
    this_month = db.execute(
        "SELECT COUNT(*) FROM maintenance WHERE strftime('%Y-%m',to_date)=strftime('%Y-%m','now')"
    ).fetchone()[0]
    return jsonify({'total': total, 'this_month': this_month,
                    'by_brand': [dict(r) for r in by_brand],
                    'by_month': [dict(r) for r in by_month],
                    'recent':   [dict(r) for r in recent]})


# ── УСТАВКИ ──────────────────────────────────────────────────────────
@app.route('/api/parameters/update', methods=['POST'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── ДЕФЕКТЫ — РЕГИСТРАЦИЯ ────────────────────────────────────────────
@app.route('/api/defects/register', methods=['POST'])
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
            db.execute("""
                INSERT INTO defects (problem_code, root_cause, solution, df_date,
                                    spot_id, gun_id, status, manual_spot_number, manual_model_id)
                VALUES (?, '', '', DATE('now'), NULL, NULL, 'registered', ?, ?)
            """, (problem_code, spot_number, int(model_id)))
            db.commit()
            return jsonify({'status': 'success',
                            'message': f'Дефект {problem_code} зарегистрирован. ⚠ Точка №{spot_number} не найдена в БД — уточните данные при взятии в работу.',
                            'found_in_db': False})
        except Exception as e:
            db.rollback()
            return jsonify({'status': 'error', 'message': str(e)}), 500

    try:
        db.execute("""
            INSERT INTO defects
                (problem_code, root_cause, solution, df_date, spot_id, gun_id, status)
            VALUES (?, '', '', DATE('now'), ?, ?, 'registered')
        """, (problem_code, row['spot_id'], row['gun_id']))
        db.commit()
        return jsonify({'status': 'success', 'message': f'Дефект {problem_code} на точке №{spot_number} зафиксирован'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/defects/add', methods=['POST'])
def add_defect():
    data = request.json or {}
    db = get_db()
    try:
        db.execute("""
            INSERT INTO defects (problem_code, description, root_cause, solution, df_date,
                                 worker_register_id, worker_solve_id, spot_id, gun_id, status)
            VALUES (?, '', '', 'В процессе устранения', DATE('now'), NULL, NULL, ?, ?, 'registered')
        """, (data['problem_code'], int(data['spot_id']), int(data['gun_id'])))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Карточка дефекта сохранена!'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── ДЕФЕКТЫ — ВСЕ (открытые + закрытые) ────────────────────────────
@app.route('/api/defects/all')
def defects_all():
    db = get_db()
    base = """
        SELECT d.UniqueID, d.df_date, d.problem_code,
               COALESCE(d.status,'registered')             as status,
               COALESCE(d.root_cause,'')                   as root_cause,
               COALESCE(d.solution,'')                     as solution,
               COALESCE(s.spot_number, d.manual_spot_number, '—') as spot_number,
               COALESCE(b.brand, enrich_b.brand, '—')     as brand,
               COALESCE(m.model_name, enrich_m.model_name, '—') as model_name,
               COALESCE(m.type, enrich_m.type, '')         as model_type,
               COALESCE(g.g_num, 0)                        as g_num,
               COALESCE(g.gun_type,'—')                    as gun_model,
               COALESCE(d_st.station_name,'—')             as station_name,
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


# ── ДЕФЕКТЫ — ВЗЯТЬ В РАБОТУ / ЗАКРЫТЬ / УДАЛИТЬ ────────────────────
@app.route('/api/defects/take', methods=['POST'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/defects/update', methods=['POST'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/defects/close', methods=['POST'])
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
        db.commit()
        return jsonify({'status': 'success', 'message': 'Дефект закрыт!'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/defects/<int:defect_id>', methods=['DELETE'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── ОБОГАЩЕНИЕ ДЕФЕКТА (создать точку + уставку в БД) ────────────────
@app.route('/api/models')
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


@app.route('/api/defect_codes')
def get_defect_codes():
    db = get_db()
    rows = db.execute('SELECT code, name FROM defect_code ORDER BY code').fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/defects/enrich', methods=['POST'])
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
            auto_created_spot_id_only = True
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

        db.commit()
        return jsonify({'status': 'success', 'message': 'Точка создана, дефект взят в работу!'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── АНАЛИТИКА ДЕФЕКТОВ ───────────────────────────────────────────────
@app.route('/api/analytics/defects')
def analytics_defects():
    db = get_db()
    model_id   = request.args.get('model_id', '').strip()
    station_id = request.args.get('station_id', '').strip()
    date_from  = request.args.get('date_from', '').strip()
    date_to    = request.args.get('date_to', '').strip()

    if not date_from:
        date_from = datetime.now().strftime('%Y-%m-01')
    if not date_to:
        date_to = datetime.now().strftime('%Y-%m-31')

    cond   = ['d.df_date BETWEEN ? AND ?']
    params = [date_from, date_to]

    if model_id:
        cond.append('s.model_id = ?'); params.append(int(model_id))
    if station_id:
        cond.append('st.UniqueID = ?'); params.append(int(station_id))

    where = ' AND '.join(cond)
    joins = """
        FROM defects d
        LEFT JOIN spot s   ON d.spot_id   = s.UniqueID
        LEFT JOIN model m  ON s.model_id  = m.UniqueID
        LEFT JOIN brand b  ON m.brand_id  = b.UniqueID
        LEFT JOIN gun g    ON d.gun_id    = g.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
    """

    by_code = db.execute(f"""
        SELECT d.problem_code as code, COUNT(*) as cnt,
               COALESCE(dc.name, d.problem_code) as name
        {joins}
        LEFT JOIN defect_code dc ON d.problem_code = dc.code
        WHERE {where}
        GROUP BY d.problem_code ORDER BY cnt DESC
    """, params).fetchall()

    by_station = db.execute(f"""
        SELECT COALESCE(st.station_name,'—') as station,
               COALESCE(b.brand,'—') as brand,
               d.problem_code as code, COUNT(*) as cnt
        {joins} WHERE {where}
        GROUP BY st.UniqueID, d.problem_code ORDER BY station, cnt DESC
    """, params).fetchall()

    total = db.execute(f"SELECT COUNT(*) {joins} WHERE {where}", params).fetchone()[0]

    return jsonify({'total': total, 'date_from': date_from, 'date_to': date_to,
                    'by_code': [{'code': r['code'], 'name': r['name'], 'count': r['cnt']} for r in by_code],
                    'by_station': [dict(r) for r in by_station]})


# ── ПОИСК ТОЧКИ (legacy, для корректировки уставок) ─────────────────
@app.route('/api/spots/search')
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


# ── СОТРУДНИКИ ───────────────────────────────────────────────────────
@app.route('/api/workers')
def get_workers():
    db = get_db()
    rows = db.execute("""
        SELECT UniqueID, surname, name, father_name, position, department, is_active
        FROM worker ORDER BY department, surname
    """).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/workers', methods=['POST'])
def add_worker():
    data = request.json or {}
    if not data.get('surname') or not data.get('name') or not data.get('department'):
        return jsonify({'status': 'error', 'message': 'Фамилия, имя и отдел обязательны'}), 400
    db = get_db()
    try:
        db.execute("""
            INSERT INTO worker (surname, name, father_name, position, department,
                                email, password, start_date, is_active)
            VALUES (?,?,?,?,?,?,?,DATE('now'),1)
        """, (data['surname'], data['name'], data.get('father_name',''),
              data.get('position',''), data['department'], '', ''))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Сотрудник добавлен'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/workers/<int:worker_id>', methods=['PUT'])
def update_worker(worker_id):
    data = request.json or {}
    db = get_db()
    try:
        if 'is_active' in data:
            db.execute('UPDATE worker SET is_active=? WHERE UniqueID=?',
                       (int(data['is_active']), worker_id))
        else:
            db.execute("""
                UPDATE worker SET surname=?, name=?, father_name=?, position=?, department=?
                WHERE UniqueID=?
            """, (data['surname'], data['name'], data.get('father_name',''),
                  data.get('position',''), data.get('department',''), worker_id))
        db.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/workers/<int:worker_id>', methods=['DELETE'])
def delete_worker(worker_id):
    db = get_db()
    try:
        db.execute('UPDATE worker SET is_active=0 WHERE UniqueID=?', (worker_id,))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Сотрудник деактивирован'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── ПЛАНИРОВАНИЕ ТО ──────────────────────────────────────────────────
@app.route('/api/maintenance/schedule')
def get_maintenance_schedule():
    db = get_db()
    brand_id   = request.args.get('brand_id', '').strip()
    month      = request.args.get('month', '').strip() or str(datetime.now().month)
    today      = date.today().isoformat()

    cond   = ['ms.month_number = ?']
    params = [int(month)]
    if brand_id:
        cond.append('ms.brand_id = ?'); params.append(int(brand_id))

    rows = db.execute(f"""
        SELECT ms.id as schedule_id, ms.gun_id, ms.brand_id, ms.month_number, ms.plan_type,
               g.g_num, g.gun_type as model,
               b.brand,
               COALESCE(st.station_name, '—') as station_name,
               mdt.id as task_id, COALESCE(mdt.status,'') as task_status,
               COALESCE(w.surname,'') as task_worker
        FROM maintenance_schedule ms
        JOIN gun   g ON ms.gun_id   = g.UniqueID
        JOIN brand b ON ms.brand_id = b.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        LEFT JOIN maintenance_daily_task mdt
               ON ms.gun_id = mdt.gun_id AND mdt.task_date = ? AND mdt.status != 'cancelled'
        LEFT JOIN worker w ON mdt.assigned_worker_id = w.UniqueID
        WHERE {' AND '.join(cond)}
        ORDER BY b.brand, COALESCE(st.station_name,'я'), g.g_num
    """, [today] + params).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/maintenance/daily')
def get_daily_tasks():
    db = get_db()
    task_date = request.args.get('date', '').strip() or date.today().isoformat()

    rows = db.execute("""
        SELECT mdt.id, mdt.gun_id, mdt.task_date, mdt.status,
               g.g_num, g.gun_type as gun_model,
               COALESCE(st.station_name,'—') as station_name,
               COALESCE(b.brand,'—') as brand,
               COALESCE(w_asgn.surname,'') as worker_surname,
               COALESCE(w_asgn.name,'')    as worker_name,
               COALESCE(ms.plan_type,'—')  as plan_type
        FROM maintenance_daily_task mdt
        JOIN gun g ON mdt.gun_id = g.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN transformer_station_assignment tsa ON gta.transformer_id=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        LEFT JOIN brand  b  ON st.brand_id=b.UniqueID
        LEFT JOIN worker w_asgn ON mdt.assigned_worker_id=w_asgn.UniqueID
        LEFT JOIN maintenance_schedule ms
               ON mdt.gun_id=ms.gun_id
              AND ms.month_number=CAST(strftime('%m', mdt.task_date) AS INTEGER)
        WHERE mdt.task_date=? AND mdt.status != 'cancelled'
        ORDER BY mdt.status, mdt.id
    """, (task_date,)).fetchall()

    workers = db.execute('SELECT UniqueID, surname, name FROM worker WHERE is_active=1').fetchall()
    return jsonify({'tasks': [dict(r) for r in rows],
                    'workers': [dict(w) for w in workers],
                    'date': task_date})


@app.route('/api/maintenance/daily', methods=['POST'])
def create_daily_tasks():
    data    = request.json or {}
    gun_ids = data.get('gun_ids', [])
    task_date = data.get('date', date.today().isoformat())
    created_by = data.get('created_by_worker_id')

    if not gun_ids:
        return jsonify({'status': 'error', 'message': 'Не выбраны клещи'}), 400

    db = get_db()
    created = skipped = 0
    for gid in gun_ids:
        exists = db.execute(
            "SELECT id FROM maintenance_daily_task WHERE gun_id=? AND task_date=? AND status!='cancelled'",
            (int(gid), task_date)
        ).fetchone()
        if exists:
            skipped += 1
            continue
        db.execute(
            "INSERT INTO maintenance_daily_task (gun_id, task_date, status, created_by_worker_id) VALUES (?,?,'pending',?)",
            (int(gid), task_date, int(created_by) if created_by else None)
        )
        created += 1
    db.commit()
    msg = f'Назначено {created} задач' + (f', пропущено {skipped} (уже есть)' if skipped else '')
    return jsonify({'status': 'success', 'message': msg})


@app.route('/api/maintenance/daily/<int:task_id>/take', methods=['POST'])
def take_daily_task(task_id):
    data      = request.json or {}
    worker_id = data.get('worker_id')
    db = get_db()
    try:
        db.execute("""
            UPDATE maintenance_daily_task
            SET status='in_work', assigned_worker_id=?
            WHERE id=? AND status='pending'
        """, (int(worker_id) if worker_id else None, task_id))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Задача взята в работу'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/maintenance/daily/<int:task_id>/done', methods=['POST'])
def complete_daily_task(task_id):
    data = request.json or {}
    db   = get_db()
    try:
        db.execute("""
            UPDATE maintenance_daily_task
            SET status='done', completed_maintenance_id=?
            WHERE id=?
        """, (data.get('maintenance_id'), task_id))
        db.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/maintenance/daily/<int:task_id>', methods=['DELETE'])
def cancel_daily_task(task_id):
    db = get_db()
    try:
        db.execute("UPDATE maintenance_daily_task SET status='cancelled' WHERE id=?", (task_id,))
        db.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── РУЧНОЕ СОЗДАНИЕ ПИСТОЛЕТА ────────────────────────────────────────
@app.route('/api/guns/get_or_create', methods=['POST'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── МАНУАЛЬНАЯ РЕГИСТРАЦИЯ ДЕФЕКТА (без точки в БД) ──────────────────
@app.route('/api/defects/register_manual', methods=['POST'])
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
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        gun_id = gun['UniqueID']
    try:
        db.execute("""
            INSERT INTO defects (problem_code, root_cause, solution, df_date, spot_id, gun_id, status)
            VALUES (?, '', '', DATE('now'), NULL, ?, 'registered')
        """, (problem_code, gun_id))
        db.commit()
        return jsonify({'status': 'success',
                        'message': f'Дефект {problem_code} на пистолете №{g_num} зафиксирован'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── ПРОГРЕСС ВЫПОЛНЕНИЯ ПЛАНА ТО ─────────────────────────────────────
@app.route('/api/maintenance/progress')
def maintenance_progress():
    db    = get_db()
    month = int(request.args.get('month', datetime.now().month))
    year  = int(request.args.get('year',  datetime.now().year))
    prefix = f'{year}-{month:02d}'

    scheduled = db.execute("""
        SELECT b.brand, b.UniqueID as brand_id, COUNT(DISTINCT ms.gun_id) as total
        FROM maintenance_schedule ms JOIN brand b ON ms.brand_id = b.UniqueID
        WHERE ms.month_number = ?
        GROUP BY b.UniqueID ORDER BY b.brand
    """, (month,)).fetchall()

    done = db.execute("""
        SELECT ms.brand_id, COUNT(DISTINCT mdt.gun_id) as cnt
        FROM maintenance_daily_task mdt
        JOIN maintenance_schedule ms
          ON mdt.gun_id = ms.gun_id
         AND ms.month_number = CAST(strftime('%m', mdt.task_date) AS INTEGER)
        WHERE mdt.task_date LIKE ? AND mdt.status = 'done'
        GROUP BY ms.brand_id
    """, (prefix + '%',)).fetchall()

    done_map = {r['brand_id']: r['cnt'] for r in done}
    brands   = []
    for s in scheduled:
        bid = s['brand_id']
        total = s['total']
        comp  = done_map.get(bid, 0)
        brands.append({'brand': s['brand'], 'total': total,
                        'done': comp, 'remaining': max(0, total - comp)})

    return jsonify({
        'month': month, 'year': year, 'brands': brands,
        'total_planned':   sum(b['total']     for b in brands),
        'total_done':      sum(b['done']      for b in brands),
        'total_remaining': sum(b['remaining'] for b in brands),
    })


# ── ГЛАВНАЯ СТАТИСТИКА ───────────────────────────────────────────────
@app.route('/api/stats')
def get_stats():
    db = get_db()
    maint  = db.execute('SELECT COUNT(*) FROM maintenance').fetchone()[0]
    open_d = db.execute("SELECT COUNT(*) FROM defects WHERE COALESCE(status,'registered') IN ('registered','in_work')").fetchone()[0]
    total  = db.execute('SELECT COUNT(*) FROM defects').fetchone()[0]
    return jsonify({'maintenance_records': maint, 'defects_open': open_d, 'defects_total': total})


# ── ОБЗОР ДАННЫХ (EXPLORER) ──────────────────────────────────────────
@app.route('/explorer')
def explorer_page(): return render_template('explorer.html')


@app.route('/api/explorer/gun/<int:gun_id>')
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
               COALESCE(w.surname,'—') as worker
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
               COALESCE(s.spot_number, d.manual_spot_number, '—') as spot_number,
               COALESCE(mo.model_name,'—') as model_name,
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


@app.route('/api/explorer/gun/<int:gun_id>', methods=['PUT'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/explorer/station/<int:station_id>')
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


@app.route('/api/explorer/station/<int:station_id>', methods=['PUT'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/explorer/spot/<int:spot_id>')
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


@app.route('/api/explorer/spot/<int:spot_id>', methods=['PUT'])
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
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/spots/by_model/<int:model_id>')
def spots_by_model(model_id):
    db = get_db()
    rows = db.execute("""
        SELECT UniqueID, spot_number
        FROM spot WHERE model_id=?
        ORDER BY CAST(spot_number AS INTEGER), spot_number
        LIMIT 1000
    """, (model_id,)).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/spots/find')
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
