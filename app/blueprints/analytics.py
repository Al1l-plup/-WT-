"""Аналитика дефектов и общая статистика."""
from datetime import datetime

from flask import Blueprint, jsonify, request

from app.db import get_db

bp = Blueprint('analytics', __name__)


@bp.route('/api/analytics/defects')
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

    # Аналитика считается по «замороженному» расположению на момент записи (snapshot),
    # поэтому прошлые периоды не меняются при перепривязке точек/пистолетов.
    cond   = ['d.df_date BETWEEN ? AND ?']
    params = [date_from, date_to]

    if model_id:
        cond.append('d.snap_model_id = ?'); params.append(int(model_id))
    if station_id:
        cond.append('d.snap_station_id = ?'); params.append(int(station_id))

    where = ' AND '.join(cond)
    joins = " FROM defects d "

    by_code = db.execute(f"""
        SELECT d.problem_code as code, COUNT(*) as cnt,
               COALESCE(dc.name, d.problem_code) as name
        {joins}
        LEFT JOIN defect_code dc ON d.problem_code = dc.code
        WHERE {where}
        GROUP BY d.problem_code ORDER BY cnt DESC
    """, params).fetchall()

    by_station = db.execute(f"""
        SELECT COALESCE(d.snap_station_name,'—') as station,
               COALESCE(d.snap_brand,'—') as brand,
               d.problem_code as code, COUNT(*) as cnt
        {joins} WHERE {where}
        GROUP BY d.snap_station_id, d.problem_code ORDER BY station, cnt DESC
    """, params).fetchall()

    total = db.execute(f"SELECT COUNT(*) {joins} WHERE {where}", params).fetchone()[0]

    return jsonify({'total': total, 'date_from': date_from, 'date_to': date_to,
                    'by_code': [{'code': r['code'], 'name': r['name'], 'count': r['cnt']} for r in by_code],
                    'by_station': [dict(r) for r in by_station]})


@bp.route('/api/analytics/process')
def analytics_process():
    """Аналитика процесса 4M: среднее время этапа по отделам, текущая загрузка,
    возвраты (bounce), серийные и не выявленные дефекты."""
    db = get_db()
    date_from = request.args.get('date_from', '').strip() or datetime.now().strftime('%Y-%m-01')
    date_to   = request.args.get('date_to', '').strip() or datetime.now().strftime('%Y-%m-31')
    rng = (date_from, date_to)

    # Среднее время этапа по отделам (завершённые этапы дефектов периода). Таймстемпы ISO
    # (с 'T') → приводим к виду SQLite для julianday; разница в часах.
    by_dept = db.execute("""
        SELECT st.dept AS dept,
               ROUND(AVG((julianday(replace(st.left_at,'T',' ')) - julianday(replace(st.entered_at,'T',' '))) * 24.0), 1) AS avg_hours,
               COUNT(*) AS stages_done,
               SUM(CASE WHEN st.outcome='closed'   THEN 1 ELSE 0 END) AS closed_cnt,
               SUM(CASE WHEN st.outcome='returned' THEN 1 ELSE 0 END) AS returned_cnt
        FROM defect_stage st JOIN defects d ON st.defect_id = d.UniqueID
        WHERE st.left_at IS NOT NULL AND d.df_date BETWEEN ? AND ?
        GROUP BY st.dept ORDER BY stages_done DESC
    """, rng).fetchall()

    # Текущая загрузка — сколько дефектов СЕЙЧАС на этапе отдела (без фильтра дат).
    wl = {r['dept']: r['cnt'] for r in db.execute("""
        SELECT current_stage_dept AS dept, COUNT(*) AS cnt FROM defects
        WHERE COALESCE(status,'') IN ('in_review','at_oto') AND current_stage_dept IS NOT NULL
        GROUP BY current_stage_dept""").fetchall()}

    dept_rows = [{'dept': r['dept'], 'avg_hours': r['avg_hours'], 'stages_done': r['stages_done'],
                  'closed': r['closed_cnt'], 'returned': r['returned_cnt'], 'open_now': wl.get(r['dept'], 0)}
                 for r in by_dept]
    for dept, cnt in wl.items():                       # отделы с загрузкой, но без завершённых этапов
        if not any(x['dept'] == dept for x in dept_rows):
            dept_rows.append({'dept': dept, 'avg_hours': None, 'stages_done': 0,
                              'closed': 0, 'returned': 0, 'open_now': cnt})

    serial = db.execute("SELECT COUNT(*) FROM defects WHERE is_serial=1 AND df_date BETWEEN ? AND ?", rng).fetchone()[0]
    returns_t = db.execute("""SELECT COUNT(*) FROM defect_stage st JOIN defects d ON st.defect_id=d.UniqueID
                              WHERE st.outcome='returned' AND d.df_date BETWEEN ? AND ?""", rng).fetchone()[0]
    unresolved = db.execute("SELECT COUNT(*) FROM defects WHERE COALESCE(status,'')='unresolved'").fetchone()[0]

    serial_list = db.execute("""
        SELECT d.problem_code AS code,
               COALESCE(d.snap_spot_number, s.spot_number, d.manual_spot_number, '—') AS spot,
               COALESCE(d.return_count,0) AS returns, d.df_date AS date,
               COALESCE(d.current_stage_dept,'—') AS stage
        FROM defects d LEFT JOIN spot s ON d.spot_id=s.UniqueID
        WHERE d.is_serial=1 AND d.df_date BETWEEN ? AND ?
        ORDER BY d.return_count DESC, d.df_date DESC LIMIT 20""", rng).fetchall()

    return jsonify({'date_from': date_from, 'date_to': date_to, 'by_dept': dept_rows,
                    'serial': serial, 'unresolved': unresolved, 'returns_total': returns_t,
                    'serial_list': [dict(r) for r in serial_list]})


@bp.route('/api/stats')
def get_stats():
    db = get_db()
    def one(q): return db.execute(q).fetchone()[0]
    maint  = one('SELECT COUNT(*) FROM maintenance')
    open_d = one("SELECT COUNT(*) FROM defects WHERE COALESCE(status,'registered') IN ('registered','in_work')")
    total  = one('SELECT COUNT(*) FROM defects')
    # «масштаб» системы для плиток Главной
    points = one('SELECT COUNT(*) FROM weld_point')
    guns   = one('SELECT COUNT(*) FROM gun')
    models = one('SELECT COUNT(DISTINCT model_code) FROM model')
    return jsonify({'maintenance_records': maint, 'defects_open': open_d, 'defects_total': total,
                    'weld_points': points, 'guns': guns, 'models': models})
