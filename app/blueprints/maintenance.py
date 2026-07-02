"""Техническое обслуживание и планирование ТО."""
from datetime import date, datetime

from flask import Blueprint, jsonify, request

from app.db import get_db

bp = Blueprint('maintenance', __name__)


@bp.route('/api/maintenance', methods=['POST'])
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
            except Exception:
                pass
        db.commit()
        return jsonify({'status': 'success', 'message': 'Карточка ТО сохранена!', 'maintenance_id': new_id})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@bp.route('/api/maintenance/<int:record_id>', methods=['DELETE'])
def delete_maintenance(record_id):
    db = get_db()
    try:
        db.execute('DELETE FROM maintenance WHERE UniqueId=?', (record_id,))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Запись ТО удалена'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@bp.route('/api/maintenance/analytics')
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


@bp.route('/api/maintenance/schedule')
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


@bp.route('/api/maintenance/daily')
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


@bp.route('/api/maintenance/daily', methods=['POST'])
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


@bp.route('/api/maintenance/daily/<int:task_id>/take', methods=['POST'])
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


@bp.route('/api/maintenance/daily/<int:task_id>/done', methods=['POST'])
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


@bp.route('/api/maintenance/daily/<int:task_id>', methods=['DELETE'])
def cancel_daily_task(task_id):
    db = get_db()
    try:
        db.execute("UPDATE maintenance_daily_task SET status='cancelled' WHERE id=?", (task_id,))
        db.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@bp.route('/api/maintenance/progress')
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
