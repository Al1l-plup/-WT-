"""#3: сессия сверяется с БД на каждый запрос — деактивация и смена отдела/роли
применяются сразу, без перелогина пользователя."""
import sqlite3


def _uid(app, login):
    db = sqlite3.connect(app.config['DB_PATH'])
    r = db.execute("SELECT UniqueID FROM worker WHERE login=?", (login,)).fetchone()
    db.close()
    return r[0]


def test_deactivated_user_loses_access_without_relogin(register_client, app):
    admin = register_client(department='WeldTeam', login='al.galimov@astana-motors.kz')
    user = register_client(department='ИТО', login='rv_user@weldteam.kz')
    assert user.get('/api/me').status_code == 200               # активен — работает
    uid = _uid(app, 'rv_user@weldteam.kz')
    assert admin.put(f'/api/admin/users/{uid}', json={'is_active': False}).status_code == 200
    # та же сессия пользователя — доступ закрыт сразу
    assert user.get('/api/me').status_code == 401
    assert user.get('/api/defects/all').status_code == 401


def test_department_change_applies_without_relogin(register_client, app):
    admin = register_client(department='WeldTeam', login='al.galimov@astana-motors.kz')
    user = register_client(department='ИТО', login='rv_user2@weldteam.kz')
    assert user.get('/api/me').get_json()['dept'] == 'ИТО'
    uid = _uid(app, 'rv_user2@weldteam.kz')
    assert admin.put(f'/api/admin/users/{uid}', json={'department': 'Производство'}).status_code == 200
    assert user.get('/api/me').get_json()['dept'] == 'Производство'   # без перелогина
