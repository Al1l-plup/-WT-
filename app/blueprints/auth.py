"""Аутентификация: регистрация, вход, выход, смена своего пароля.

Вход обязателен на весь сайт (щит — before_request в create_app). Пароли — только хеши
(werkzeug), в открытом виде не хранятся и не показываются. Пользователь = запись в worker
(login, password=hash, department из DEPARTMENTS, role). Сессия: uid / uname («Фамилия И.») /
dept / role / is_admin — по ним считаются права (app/permissions.py) и берётся автор правок.

Аккаунт с логином = ADMIN_EMAIL автоматически получает роль admin при входе/регистрации.
"""
import re

from flask import (
    Blueprint,
    current_app,
    jsonify,
    redirect,
    render_template,
    request,
    session,
)
from werkzeug.security import check_password_hash, generate_password_hash

from app.constants import DEPARTMENTS
from app.db import get_db
from app.errors import api_error
from app.permissions import is_readonly, visible_pages

# Логин — рабочая почта (планируется рассылка уведомлений об изменениях).
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')

bp = Blueprint('auth', __name__)


def _display_name(surname: str, name: str) -> str:
    return f'{surname} {name[:1]}.' if name else surname


def _admin_email() -> str:
    return (current_app.config.get('ADMIN_EMAIL') or '').lower()


def _set_session(row) -> None:
    """Записать данные пользователя в сессию (единый источник прав и автора правок)."""
    login = (row['login'] or '').lower()
    role = row['role'] if 'role' in row.keys() else 'user'
    is_admin = role == 'admin' or login == _admin_email()
    session.permanent = True
    session['uid'] = row['UniqueID']
    session['uname'] = _display_name(row['surname'], row['name'])
    session['dept'] = row['department']
    session['login'] = login
    session['role'] = 'admin' if is_admin else 'user'
    session['is_admin'] = is_admin
    session['must_change'] = bool(row['must_change_password']) if 'must_change_password' in row.keys() else False


@bp.route('/api/departments')
def departments():
    return jsonify(DEPARTMENTS)


@bp.route('/api/me')
def me():
    if not session.get('uid'):
        return jsonify({'auth': False}), 401
    dept, is_admin = session.get('dept'), bool(session.get('is_admin'))
    return jsonify({
        'auth': True,
        'uid': session['uid'],
        'name': session.get('uname'),
        'dept': dept,
        'role': session.get('role', 'user'),
        'is_admin': is_admin,
        'readonly': is_readonly(dept, is_admin),
        'pages': visible_pages(dept, is_admin),
        'must_change': bool(session.get('must_change')),
    })


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    data = request.form
    login_ = (data.get('login') or '').strip().lower()
    password = data.get('password') or ''
    db = get_db()
    row = db.execute('SELECT * FROM worker WHERE login=?', (login_,)).fetchone()
    if not row or not row['password'] or not check_password_hash(row['password'], password):
        return render_template('login.html', error='Неверный логин или пароль')
    if not row['is_active']:
        return render_template('login.html', error='Учётная запись деактивирована')
    # аккаунт админа поднимаем до роли admin при совпадении почты
    if login_ == _admin_email() and (row['role'] if 'role' in row.keys() else 'user') != 'admin':
        db.execute("UPDATE worker SET role='admin' WHERE UniqueID=?", (row['UniqueID'],))
        db.commit()
        row = db.execute('SELECT * FROM worker WHERE UniqueID=?', (row['UniqueID'],)).fetchone()
    _set_session(row)
    if session.get('must_change'):
        return redirect('/change-password')
    return redirect('/')


@bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html', departments=DEPARTMENTS)
    data = request.form

    def err(msg):
        return render_template('register.html', departments=DEPARTMENTS, error=msg, form=data)

    surname = (data.get('surname') or '').strip()
    name = (data.get('name') or '').strip()
    father = (data.get('father_name') or '').strip()
    dept = (data.get('department') or '').strip()
    login_ = (data.get('login') or '').strip().lower()
    pw1, pw2 = data.get('password') or '', data.get('password2') or ''

    if not surname or not name:
        return err('Укажите фамилию и имя')
    if dept not in DEPARTMENTS:
        return err('Выберите отдел из списка')
    if not EMAIL_RE.match(login_):
        return err('Логин должен быть адресом почты (например, name@company.com) — на неё будут приходить уведомления')
    if len(pw1) < 4:
        return err('Пароль — минимум 4 символа')
    if pw1 != pw2:
        return err('Пароли не совпадают')

    db = get_db()
    if db.execute('SELECT 1 FROM worker WHERE login=?', (login_,)).fetchone():
        return err('Такой логин уже занят')
    role = 'admin' if login_ == _admin_email() else 'user'
    try:
        cur = db.execute(
            "INSERT INTO worker (surname, name, father_name, position, department, email, password, "
            "start_date, is_active, login, role, must_change_password) "
            "VALUES (?,?,?,?,?,?,?,DATE('now'),1,?,?,0)",
            (surname, name, father, data.get('position', ''), dept,
             login_,  # почта дублируется в email — для будущей рассылки
             generate_password_hash(pw1), login_, role))
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    row = db.execute('SELECT * FROM worker WHERE UniqueID=?', (cur.lastrowid,)).fetchone()
    _set_session(row)
    return redirect('/')


@bp.route('/change-password', methods=['GET', 'POST'])
def change_password():
    """Смена собственного пароля. Обязательна после сброса админом (временный пароль)."""
    if not session.get('uid'):
        return redirect('/login')
    forced = bool(session.get('must_change'))
    if request.method == 'GET':
        return render_template('change_password.html', forced=forced)
    data = request.form
    pw1, pw2 = data.get('password') or '', data.get('password2') or ''

    def err(msg):
        return render_template('change_password.html', forced=forced, error=msg)

    if len(pw1) < 4:
        return err('Пароль — минимум 4 символа')
    if pw1 != pw2:
        return err('Пароли не совпадают')
    db = get_db()
    try:
        db.execute('UPDATE worker SET password=?, must_change_password=0 WHERE UniqueID=?',
                   (generate_password_hash(pw1), session['uid']))
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    session['must_change'] = False
    return redirect('/')


@bp.route('/logout')
def logout():
    session.clear()
    return redirect('/login')
