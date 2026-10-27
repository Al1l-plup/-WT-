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

from app import defect_flow as df
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
    admin_email = _admin_email()
    users = []
    for r in rows:
        d = dict(r)
        # корневой админ (по почте) всегда админ — его роль менять/снимать нельзя
        d['is_root'] = (d.get('login') or '').lower() == admin_email
        d['areas'] = df.worker_areas_map(db, d['UniqueID'])   # {brand_id: [участки]}
        users.append(d)
    return jsonify({'departments': DEPARTMENTS, 'users': users, 'areas_ref': df.brands_with_areas(db)})


@bp.route('/api/areas')
def areas():
    """Справочник участков по брендам (для формы зон ответственности)."""
    return jsonify(df.brands_with_areas(get_db()))


@bp.route('/api/admin/users/<int:uid>/areas', methods=['PUT'])
def set_user_areas(uid):
    """Назначить зоны ответственности сотруднику: {areas: {brand_id: [участки]}}."""
    db = get_db()
    if not _get_user(db, uid):
        return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 404
    amap = (request.json or {}).get('areas') or {}
    try:
        df.set_worker_areas(db, uid, amap)
        db.commit()
        return jsonify({'status': 'success', 'areas': df.worker_areas_map(db, uid)})
    except Exception as e:
        db.rollback()
        return api_error(e)


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
    """Сменить отдел / активность / роль аккаунта (доступ раздаёт отдел; роль admin —
    передача админских прав другому пользователю). Корневой админ (по ADMIN_EMAIL)
    всегда остаётся админом — его роль здесь менять нельзя."""
    db = get_db()
    u = _get_user(db, uid)
    if not u:
        return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 404
    data = request.get_json(silent=True) or {}
    is_root = (u['login'] or '').lower() == _admin_email()

    if 'is_active' in data:
        active = 1 if data['is_active'] else 0
        if not active and is_root:
            return jsonify({'status': 'error', 'message': 'Нельзя деактивировать админский аккаунт'}), 400
        db.execute('UPDATE worker SET is_active=? WHERE UniqueID=?', (active, uid))

    if 'department' in data:
        dept = data['department']
        if dept not in DEPARTMENTS:
            return jsonify({'status': 'error', 'message': 'Неизвестный отдел'}), 400
        db.execute('UPDATE worker SET department=? WHERE UniqueID=?', (dept, uid))

    if 'role' in data:
        role = data['role']
        if role not in ('admin', 'user'):
            return jsonify({'status': 'error', 'message': 'Роль: admin или user'}), 400
        if is_root:
            return jsonify({'status': 'error', 'message': 'Роль корневого админа (по почте) менять нельзя'}), 400
        db.execute('UPDATE worker SET role=? WHERE UniqueID=?', (role, uid))

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    # если админ сменил СВОЙ отдел — обновим сессию, чтобы навигация не рассинхронилась
    if uid == session.get('uid') and 'department' in data:
        session['dept'] = data['department']
    return jsonify({'status': 'success'})
