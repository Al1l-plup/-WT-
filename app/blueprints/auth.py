"""Аутентификация: регистрация, вход, выход.

Вход обязателен на весь сайт (щит — before_request в create_app). Пароли — только хеши
(werkzeug). Пользователь = запись в worker (login, password=hash, department из DEPARTMENTS).
Сессия: uid / uname («Фамилия И.») / dept — автор правок в журнале берётся из неё.
"""
import re

from flask import Blueprint, jsonify, redirect, render_template, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from app.constants import DEPARTMENTS
from app.db import get_db
from app.errors import api_error

# Логин — рабочая почта (планируется рассылка уведомлений об изменениях).
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')

bp = Blueprint('auth', __name__)


def _display_name(surname: str, name: str) -> str:
    return f'{surname} {name[:1]}.' if name else surname


@bp.route('/api/departments')
def departments():
    return jsonify(DEPARTMENTS)


@bp.route('/api/me')
def me():
    if not session.get('uid'):
        return jsonify({'auth': False}), 401
    return jsonify({'auth': True, 'uid': session['uid'],
                    'name': session.get('uname'), 'dept': session.get('dept')})


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    data = request.form
    login_ = (data.get('login') or '').strip().lower()
    password = data.get('password') or ''
    db = get_db()
    row = db.execute('SELECT UniqueID, surname, name, department, password, is_active '
                     'FROM worker WHERE login=?', (login_,)).fetchone()
    if not row or not row['password'] or not check_password_hash(row['password'], password):
        return render_template('login.html', error='Неверный логин или пароль')
    if not row['is_active']:
        return render_template('login.html', error='Учётная запись деактивирована')
    session.permanent = True
    session['uid'] = row['UniqueID']
    session['uname'] = _display_name(row['surname'], row['name'])
    session['dept'] = row['department']
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
    login_ = (data.get('login') or '').strip()
    pw1, pw2 = data.get('password') or '', data.get('password2') or ''

    if not surname or not name:
        return err('Укажите фамилию и имя')
    if dept not in DEPARTMENTS:
        return err('Выберите отдел из списка')
    login_ = login_.lower()
    if not EMAIL_RE.match(login_):
        return err('Логин должен быть адресом почты (например, name@company.com) — на неё будут приходить уведомления')
    if len(pw1) < 4:
        return err('Пароль — минимум 4 символа')
    if pw1 != pw2:
        return err('Пароли не совпадают')

    db = get_db()
    if db.execute('SELECT 1 FROM worker WHERE login=?', (login_,)).fetchone():
        return err('Такой логин уже занят')
    try:
        cur = db.execute(
            "INSERT INTO worker (surname, name, father_name, position, department, email, password, "
            "start_date, is_active, login) VALUES (?,?,?,?,?,?,?,DATE('now'),1,?)",
            (surname, name, father, data.get('position', ''), dept,
             login_,  # почта дублируется в email — для будущей рассылки
             generate_password_hash(pw1), login_))
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    session.permanent = True
    session['uid'] = cur.lastrowid
    session['uname'] = _display_name(surname, name)
    session['dept'] = dept
    return redirect('/')


@bp.route('/logout')
def logout():
    session.clear()
    return redirect('/login')
