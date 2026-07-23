"""Ролевой доступ по отделам (RBAC) и админ-панель.

Матрица: WeldTeam — всё; ИТО — Редактор+Обзор (запись), остальное скрыто;
ОТК/Производство — всё только для чтения; админ (по почте) — всё + Пользователи.
"""
ADMIN_EMAIL = 'al.galimov@astana-motors.kz'


# ── WeldTeam: полный доступ ───────────────────────────────────────────────────
def test_weldteam_full_access(register_client):
    c = register_client(department='WeldTeam')
    me = c.get('/api/me').get_json()
    assert me['readonly'] is False and me['is_admin'] is False
    assert set(me['pages']) >= {'/', '/maintenance', '/defects', '/analytics',
                                '/workers', '/explorer', '/admin', '/history'}
    assert '/users' not in me['pages']            # не админ — панели пользователей нет
    assert c.get('/maintenance').status_code == 200
    # запись разрешена везде
    assert c.post('/api/admin/table/gun', json={'values': {'g_num': 90101, 'gun_type': 'X'}}).status_code == 200


# ── ИТО: только Редактор + Обзор, но с записью ───────────────────────────────
def test_ito_editor_and_explorer_only(register_client):
    c = register_client(department='ИТО')
    me = c.get('/api/me').get_json()
    assert me['readonly'] is False
    assert set(me['pages']) == {'/', '/explorer', '/admin', '/history'}
    # страницы вне доступа → 403
    assert c.get('/maintenance').status_code == 403
    assert c.get('/defects').status_code == 403
    assert c.get('/analytics').status_code == 403
    # свои страницы открываются
    assert c.get('/admin').status_code == 200
    assert c.get('/explorer').status_code == 200
    # запись в Редакторе и Обзоре разрешена
    assert c.post('/api/admin/table/gun', json={'values': {'g_num': 90102, 'gun_type': 'X'}}).status_code == 200
    assert c.put('/api/explorer/gun/1', json={'values': {'gun_type': 'ITO'}}).status_code == 200
    # запись в чужой области (Дефекты) запрещена
    assert c.post('/api/defects/register', json={'model_id': 1, 'spot_number': 1, 'problem_code': 'CR'}).status_code == 403


# ── ОТК / Производство: видят всё, менять нельзя ─────────────────────────────
def test_otk_read_only(register_client):
    c = register_client(department='ОТК')
    me = c.get('/api/me').get_json()
    assert me['readonly'] is True
    assert '/maintenance' in me['pages'] and '/admin' in me['pages']   # видит всё
    assert c.get('/maintenance').status_code == 200                    # просмотр открыт
    assert c.get('/admin').status_code == 200
    # любая запись запрещена (400≠; именно 403 от щита прав)
    assert c.post('/api/admin/table/gun', json={'values': {'g_num': 90103, 'gun_type': 'X'}}).status_code == 403
    assert c.post('/api/maintenance', json={}).status_code == 403
    assert c.put('/api/explorer/gun/1', json={'values': {'gun_type': 'x'}}).status_code == 403


def test_proizvodstvo_read_only(register_client):
    c = register_client(department='Производство')
    me = c.get('/api/me').get_json()
    assert me['readonly'] is True
    assert c.post('/api/admin/table/gun', json={'values': {'g_num': 90104, 'gun_type': 'X'}}).status_code == 403


# ── Панель пользователей — только админ ──────────────────────────────────────
def test_useradmin_only_for_admin(register_client):
    weld = register_client(department='WeldTeam')
    assert weld.get('/users').status_code == 403
    assert weld.get('/api/admin/users').status_code == 403

    admin = register_client(department='WeldTeam', login=ADMIN_EMAIL, surname='Галимов', name='Алибек')
    me = admin.get('/api/me').get_json()
    assert me['is_admin'] is True and me['role'] == 'admin' and '/users' in me['pages']
    assert admin.get('/users').status_code == 200
    data = admin.get('/api/admin/users').get_json()
    assert 'departments' in data and any(u['login'] == ADMIN_EMAIL for u in data['users'])


# ── Сброс пароля: временный + принудительная смена ───────────────────────────
def test_password_reset_flow(app, register_client):
    admin = register_client(department='WeldTeam', login=ADMIN_EMAIL)
    register_client(department='ОТК', login='otk1@weldteam.kz')  # целевой пользователь
    uid = next(u['UniqueID'] for u in admin.get('/api/admin/users').get_json()['users']
               if u['login'] == 'otk1@weldteam.kz')

    r = admin.post(f'/api/admin/users/{uid}/reset-password')
    body = r.get_json()
    assert r.status_code == 200 and body['login'] == 'otk1@weldteam.kz'
    temp = body['temp_password']
    assert temp and len(temp) >= 8

    # старый пароль больше не работает
    fresh = app.test_client()
    assert fresh.post('/login', data={'login': 'otk1@weldteam.kz', 'password': 'test1234'}).status_code == 200  # рендер формы с ошибкой
    assert fresh.get('/api/me').status_code == 401  # вход не выполнен

    # вход по временному → принудительная смена пароля
    r = fresh.post('/login', data={'login': 'otk1@weldteam.kz', 'password': temp})
    assert r.status_code == 302 and '/change-password' in r.headers['Location']
    assert fresh.get('/api/me').get_json()['must_change'] is True
    # до смены пароля другие разделы закрыты
    assert fresh.get('/explorer').status_code == 302  # редирект на смену пароля
    # сменил пароль → доступ восстановлен, флаг снят
    r = fresh.post('/change-password', data={'password': 'newpass1', 'password2': 'newpass1'})
    assert r.status_code == 302
    assert fresh.get('/api/me').get_json()['must_change'] is False


def test_non_admin_cannot_reset(register_client):
    weld = register_client(department='WeldTeam')
    assert weld.post('/api/admin/users/1/reset-password').status_code == 403


def test_admin_cannot_be_deactivated(register_client):
    admin = register_client(department='WeldTeam', login=ADMIN_EMAIL)
    uid = next(u['UniqueID'] for u in admin.get('/api/admin/users').get_json()['users']
               if u['login'] == ADMIN_EMAIL)
    r = admin.put(f'/api/admin/users/{uid}', json={'is_active': False})
    assert r.status_code == 400 and 'админ' in r.get_json()['message'].lower()
