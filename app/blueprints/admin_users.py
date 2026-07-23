"""Панель администратора: управление учётными записями.

Доступна только админу (session.is_admin — по ADMIN_EMAIL/роли; гейт в create_app).
Пароли в открытом виде НЕ хранятся и НЕ показываются (только хеши). Вместо «просмотра
пароля» админ его сбрасывает: система генерирует одноразовый ВРЕМЕННЫЙ пароль, показывает
его админу один раз, а пользователь обязан задать свой при следующем входе.
"""
import secrets
import string

from flask import Blueprint, current_app, jsonify, render_template, request, session
from werkzeug.security import generate_password_hash

from app.constants import DEPARTMENTS
from app.db import get_db
from app.errors import api_error

bp = Blueprint('admin_users', __name__)

# Без похожих символов (0/O, 1/l/I) — временный пароль диктуют/переписывают вручную.
_TEMP_ALPHABET = string.ascii_lowercase.replace('l', '') + '23456789'


def _gen_temp_password(n: int = 10) -> str:
    return ''.join(secrets.choice(_TEMP_ALPHABET) for _ in range(n))


def _admin_email() -> str:
    return (current_app.config.get('ADMIN_EMAIL') or '').lower()


@bp.route('/users')
def users_page():
    return render_template('users.html')


@bp.route('/api/admin/users')
def list_users():
    db = get_db()
    rows = db.execute("""
        SELECT UniqueID, surname, name, father_name, position, department,
               login, email, role, is_active, must_change_password, start_date
        FROM worker
        WHERE login IS NOT NULL AND login <> ''
        ORDER BY is_active DESC, department, surname
    """).fetchall()
    return jsonify({'departments': DEPARTMENTS, 'users': [dict(r) for r in rows]})


def _get_user(db, uid):
    return db.execute('SELECT UniqueID, login, role, is_active FROM worker WHERE UniqueID=?',
                      (uid,)).fetchone()


@bp.route('/api/admin/users/<int:uid>/reset-password', methods=['POST'])
def reset_password(uid):
    """Сбросить пароль: выдать одноразовый временный, пользователь сменит его при входе."""
    db = get_db()
    u = _get_user(db, uid)
    if not u:
        return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 404
    temp = _gen_temp_password()
    try:
        db.execute('UPDATE worker SET password=?, must_change_password=1 WHERE UniqueID=?',
                   (generate_password_hash(temp), uid))
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    # временный пароль возвращается ОДИН раз — в БД он уже только хешем
    return jsonify({'status': 'success', 'login': u['login'], 'temp_password': temp})


@bp.route('/api/admin/users/<int:uid>', methods=['PUT'])
def update_user(uid):
    """Сменить отдел / активность аккаунта. Роль admin управляется по ADMIN_EMAIL, не здесь."""
    db = get_db()
    u = _get_user(db, uid)
    if not u:
        return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 404
    data = request.get_json(silent=True) or {}
    is_self_admin = (u['login'] or '').lower() == _admin_email()

    if 'is_active' in data:
        active = 1 if data['is_active'] else 0
        if not active and is_self_admin:
            return jsonify({'status': 'error', 'message': 'Нельзя деактивировать админский аккаунт'}), 400
        db.execute('UPDATE worker SET is_active=? WHERE UniqueID=?', (active, uid))

    if 'department' in data:
        dept = data['department']
        if dept not in DEPARTMENTS:
            return jsonify({'status': 'error', 'message': 'Неизвестный отдел'}), 400
        db.execute('UPDATE worker SET department=? WHERE UniqueID=?', (dept, uid))

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    # если админ сменил СВОЙ отдел — обновим сессию, чтобы навигация не рассинхронилась
    if uid == session.get('uid') and 'department' in data:
        session['dept'] = data['department']
    return jsonify({'status': 'success'})
