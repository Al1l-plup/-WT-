"""Аутентификация: регистрация, вход, выход, щит «вход обязателен»."""
from tests.conftest import TEST_USER


def test_anonymous_redirected(anon_client):
    r = anon_client.get('/')
    assert r.status_code == 302 and '/login' in r.headers['Location']
    r = anon_client.get('/admin')
    assert r.status_code == 302 and '/login' in r.headers['Location']


def test_anonymous_api_401(anon_client):
    r = anon_client.get('/api/admin/docs')
    assert r.status_code == 401
    assert r.get_json()['message'] == 'Требуется вход'


def test_login_register_pages_public(anon_client):
    assert anon_client.get('/login').status_code == 200
    assert anon_client.get('/register').status_code == 200
    deps = anon_client.get('/api/departments').get_json()
    assert 'ИТО' in deps and 'ОТК' in deps


def test_register_login_me(app):
    c = app.test_client()
    r = c.post('/register', data=TEST_USER)
    assert r.status_code == 302  # редирект на главную = вход выполнен
    me = c.get('/api/me').get_json()
    assert me['auth'] and me['name'] == 'Тестов Т.' and me['dept'] == 'ИТО'
    # выход и повторный вход по паролю
    c.get('/logout')
    assert c.get('/api/me').status_code == 401
    r = c.post('/login', data={'login': TEST_USER['login'], 'password': TEST_USER['password']})
    assert r.status_code == 302
    assert c.get('/api/me').get_json()['auth'] is True


def test_wrong_password_and_duplicate_login(app):
    c = app.test_client()
    c.post('/register', data=TEST_USER)
    c.get('/logout')
    r = c.post('/login', data={'login': TEST_USER['login'], 'password': 'wrong'})
    assert 'Неверный логин или пароль'.encode() in r.data
    r = c.post('/register', data=TEST_USER)  # повторная регистрация того же логина
    assert 'уже занят'.encode() in r.data


def test_author_from_session(client):
    client.put('/api/admin/table/gun/1', json={'values': {'gun_type': 'AUTHTEST'}})
    e = client.get('/api/admin/history?limit=1').get_json()['entries'][0]
    assert e['author'] == 'Тестов Т.'  # автор — из входа, не из тела запроса
