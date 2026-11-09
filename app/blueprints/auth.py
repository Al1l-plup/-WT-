"""Аутентификация: регистрация, вход, выход, смена своего пароля.

Вход обязателен на весь сайт (щит — before_request в create_app). Пароли — только хеши
(werkzeug), в открытом виде не хранятся и не показываются. Пользователь = запись в worker
(login, password=hash, department из DEPARTMENTS, role). Сессия: uid / uname («Фамилия И.») /
dept / role / is_admin — по ним считаются права (app/permissions.py) и берётся автор правок.

Аккаунт с логином = ADMIN_EMAIL автоматически получает роль admin при входе/регистрации.
"""
import json
import re
import secrets

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

from app import defect_flow as df
from app.constants import DEPARTMENTS, dept_label
from app.db import get_db
from app.errors import api_error
from app.permissions import can_edit_docs, is_readonly, visible_pages

# Логин — почта, любая: проверяем только форму адреса, домен не ограничен (не только рабочая;
# планируется рассылка уведомлений об изменениях).
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


def refresh_identity() -> bool:
    """Сверить сессию с БД и освежить её (вызывается щитом на каждый запрос).

    Перечитывает текущего пользователя по session['uid'] и обновляет отдел/роль/флаги
    в сессии из свежей строки worker — поэтому смена отдела/роли/сброс пароля админом
    применяются сразу, без перелогина. Возвращает False, если учётка удалена или
    деактивирована (щит тогда закрывает доступ и чистит сессию)."""
    uid = session.get('uid')
    if not uid:
        return False
    row = get_db().execute('SELECT * FROM worker WHERE UniqueID=?', (uid,)).fetchone()
    if not row or not row['is_active']:
        return False
    _set_session(row)
    return True


@bp.route('/api/departments')
def departments():
    return jsonify(DEPARTMENTS)


@bp.route('/api/me')
def me():
    if not session.get('uid'):
        return jsonify({'auth': False}), 401
    dept, is_admin = session.get('dept'), bool(session.get('is_admin'))
    db = get_db()
    tg = db.execute('SELECT tg_chat_id FROM worker WHERE UniqueID=?', (session['uid'],)).fetchone()
    return jsonify({
        'auth': True,
        'uid': session['uid'],
        'name': session.get('uname'),
        'dept': dept,
        'role': session.get('role', 'user'),
        'is_admin': is_admin,
        'readonly': is_readonly(dept, is_admin),
        'can_edit_docs': can_edit_docs(dept, is_admin),
        'pages': visible_pages(dept, is_admin),
        'must_change': bool(session.get('must_change')),
        # Telegram-уведомления: доступен ли бот (настроен) и подключён ли этот пользователь
        'tg_available': bool(current_app.config.get('TG_BOT_TOKEN') and current_app.config.get('TG_BOT_USERNAME')),
        'tg_connected': bool(tg and tg[0]),
        # обязательно ли фото при фиксации дефекта (из defect_config, правится в Редакторе)
        'require_defect_photo': df.config_flag(get_db(), 'require_defect_photo',
                                               current_app.config.get('REQUIRE_DEFECT_PHOTO', False)),
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
    areas = df.brands_with_areas(get_db())   # {brands:[...], areas:{brand_id:[участки]}} — для блока «Зона ответственности»
    if request.method == 'GET':
        return render_template('register.html', departments=DEPARTMENTS, dept_label=dept_label,
                               areas_json=json.dumps(areas, ensure_ascii=False))
    data = request.form

    def err(msg):
        return render_template('register.html', departments=DEPARTMENTS, dept_label=dept_label, error=msg, form=data,
                               areas_json=json.dumps(areas, ensure_ascii=False))

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
        return err('Логин должен быть адресом почты (например, name@mail.ru) — на неё будут приходить уведомления')
    if len(pw1) < 4:
        return err('Пароль — минимум 4 символа')
    if pw1 != pw2:
        return err('Пароли не совпадают')

    db = get_db()
    if db.execute('SELECT 1 FROM worker WHERE login=?', (login_,)).fetchone():
        return err('Такой логин уже занят')
    # зоны ответственности (бренд + участок) — только у Производства/ИТО
    zones = {}
    if dept in ZONE_DEPTS:
        picked = {b['id']: data.getlist(f"area_{b['id']}") for b in areas['brands']}
        zones, unknown = df.clean_zone_map(db, {k: v for k, v in picked.items() if v})
        if unknown:
            return err('Неизвестные участки: ' + ', '.join(unknown))
    role = 'admin' if login_ == _admin_email() else 'user'
    try:
        cur = db.execute(
            "INSERT INTO worker (surname, name, father_name, position, department, email, password, "
            "start_date, is_active, login, role, must_change_password) "
            "VALUES (?,?,?,?,?,?,?,DATE('now'),1,?,?,0)",
            (surname, name, father, data.get('position', ''), dept,
             login_,  # почта дублируется в email — для будущей рассылки
             generate_password_hash(pw1), login_, role))
        wid = cur.lastrowid
        if zones:
            df.set_worker_areas(db, wid, zones)
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    row = db.execute('SELECT * FROM worker WHERE UniqueID=?', (wid,)).fetchone()
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


# ── Личный кабинет: свои данные, зоны, почта, пароль ─────────────────────────
# Отдел здесь не меняется: от него зависят права, его меняет администратор.
ZONE_DEPTS = ('Производство', 'ИТО')     # у этих отделов «Мои входящие» и уведомления идут по зонам
_MAX_TEXT = 100


def _profile_row(db):
    return db.execute('SELECT * FROM worker WHERE UniqueID=?', (session['uid'],)).fetchone()


def _fail(msg, code=400):
    return jsonify({'status': 'error', 'message': msg}), code


@bp.route('/profile')
def profile_page():
    return render_template('profile.html')


@bp.route('/api/profile')
def profile_get():
    db = get_db()
    r = _profile_row(db)
    return jsonify({
        'surname': r['surname'] or '', 'name': r['name'] or '', 'father_name': r['father_name'] or '',
        'position': r['position'] or '', 'email': r['login'] or '',
        'department': r['department'], 'department_label': dept_label(r['department']),
        'has_zones': r['department'] in ZONE_DEPTS,
        'areas': df.worker_areas_map(db, r['UniqueID']),
        'areas_ref': df.brands_with_areas(db),
        'is_root': (r['login'] or '').lower() == _admin_email(),
    })


@bp.route('/api/profile', methods=['PUT'])
def profile_update():
    """Свои ФИО, должность и (Производство/ИТО) зоны ответственности. Текст хранится как введён."""
    data = request.get_json(silent=True) or {}
    surname, name = (data.get('surname') or '').strip(), (data.get('name') or '').strip()
    father, position = (data.get('father_name') or '').strip(), (data.get('position') or '').strip()
    if not surname or not name:
        return _fail('Укажите фамилию и имя')
    if max(len(surname), len(name), len(father), len(position)) > _MAX_TEXT:
        return _fail(f'Слишком длинное значение: не больше {_MAX_TEXT} символов')
    db = get_db()
    r = _profile_row(db)
    zones = None
    if 'areas' in data:
        if r['department'] not in ZONE_DEPTS:
            return _fail(f'У отдела «{dept_label(r["department"])}» зон ответственности нет: '
                         'вам видны все дефекты на этапе отдела')
        zones, unknown = df.clean_zone_map(db, data.get('areas') or {})
        if unknown:
            return _fail('Неизвестные участки: ' + ', '.join(unknown))
    try:
        db.execute('UPDATE worker SET surname=?, name=?, father_name=?, position=? WHERE UniqueID=?',
                   (surname, name, father, position, r['UniqueID']))
        if zones is not None:
            df.set_worker_areas(db, r['UniqueID'], zones)
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    _set_session(_profile_row(db))
    return jsonify({'status': 'success', 'message': 'Данные сохранены', 'name': session['uname'],
                    'areas': df.worker_areas_map(db, r['UniqueID'])})


def _check_current_password(row, data):
    return bool(row['password']) and check_password_hash(row['password'], data.get('current_password') or '')


@bp.route('/api/profile/email', methods=['POST'])
def profile_email():
    """Сменить почту = логин. Нужен текущий пароль: иначе чужой, оставшийся в браузере, уведёт учётку."""
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    db = get_db()
    r = _profile_row(db)
    if not _check_current_password(r, data):
        return _fail('Неверный текущий пароль')
    if (r['login'] or '').lower() == _admin_email():
        return _fail('Почта администратора задаётся в настройках сервера (ADMIN_EMAIL)')
    if not EMAIL_RE.match(email):
        return _fail('Укажите адрес почты, например name@mail.ru')
    if email == (r['login'] or '').lower():
        return _fail('Это уже ваша почта')
    if email == _admin_email():
        return _fail('Эта почта закреплена за администратором')
    if db.execute('SELECT 1 FROM worker WHERE login=? AND UniqueID<>?', (email, r['UniqueID'])).fetchone():
        return _fail('Эта почта уже занята')
    try:
        db.execute('UPDATE worker SET login=?, email=? WHERE UniqueID=?', (email, email, r['UniqueID']))
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    _set_session(_profile_row(db))
    return jsonify({'status': 'success', 'message': 'Почта изменена: входите с новой', 'email': email})


@bp.route('/api/profile/password', methods=['POST'])
def profile_password():
    data = request.get_json(silent=True) or {}
    pw1, pw2 = data.get('password') or '', data.get('password2') or ''
    db = get_db()
    r = _profile_row(db)
    if not _check_current_password(r, data):
        return _fail('Неверный текущий пароль')
    if len(pw1) < 4:
        return _fail('Новый пароль — минимум 4 символа')
    if pw1 != pw2:
        return _fail('Новые пароли не совпадают')
    try:
        db.execute('UPDATE worker SET password=?, must_change_password=0 WHERE UniqueID=?',
                   (generate_password_hash(pw1), r['UniqueID']))
        db.commit()
    except Exception as e:
        db.rollback()
        return api_error(e)
    session['must_change'] = False
    return jsonify({'status': 'success', 'message': 'Пароль изменён'})


@bp.route('/api/tg/link', methods=['POST'])
def tg_link():
    """Сгенерировать одноразовый код привязки и вернуть ссылку на бота t.me/<бот>?start=<код>."""
    username = current_app.config.get('TG_BOT_USERNAME')
    if not username:
        return jsonify({'status': 'error',
                        'message': 'Бот Telegram не настроен. Обратитесь к администратору.'}), 503
    code = secrets.token_urlsafe(8)
    db = get_db()
    db.execute('UPDATE worker SET tg_link_code=? WHERE UniqueID=?', (code, session['uid']))
    db.commit()
    return jsonify({'status': 'success', 'link': f'https://t.me/{username}?start={code}'})


@bp.route('/api/tg/unlink', methods=['POST'])
def tg_unlink():
    """Отключить Telegram у текущего пользователя (стереть chat_id и код)."""
    db = get_db()
    db.execute('UPDATE worker SET tg_chat_id=NULL, tg_link_code=NULL WHERE UniqueID=?', (session['uid'],))
    db.commit()
    return jsonify({'status': 'success'})


@bp.route('/logout')
def logout():
    session.clear()
    return redirect('/login')
