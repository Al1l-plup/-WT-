"""Управление сотрудниками."""
from flask import Blueprint, jsonify, request

from app.db import get_db
from app.errors import api_error

bp = Blueprint('workers', __name__)


@bp.route('/api/workers')
def get_workers():
    db = get_db()
    rows = db.execute("""
        SELECT UniqueID, surname, name, father_name, position, department, is_active
        FROM worker ORDER BY department, surname
    """).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/workers', methods=['POST'])
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
        return api_error(e)


@bp.route('/api/workers/<int:worker_id>', methods=['PUT'])
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
        return api_error(e)


@bp.route('/api/workers/<int:worker_id>', methods=['DELETE'])
def delete_worker(worker_id):
    db = get_db()
    try:
        db.execute('UPDATE worker SET is_active=0 WHERE UniqueID=?', (worker_id,))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Сотрудник деактивирован'})
    except Exception as e:
        db.rollback()
        return api_error(e)
