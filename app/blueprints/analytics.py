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


@bp.route('/api/stats')
def get_stats():
    db = get_db()
    maint  = db.execute('SELECT COUNT(*) FROM maintenance').fetchone()[0]
    open_d = db.execute("SELECT COUNT(*) FROM defects WHERE COALESCE(status,'registered') IN ('registered','in_work')").fetchone()[0]
    total  = db.execute('SELECT COUNT(*) FROM defects').fetchone()[0]
    return jsonify({'maintenance_records': maint, 'defects_open': open_d, 'defects_total': total})
