"""Личный кабинет: свои ФИО, должность, зоны, почта, пароль. И хеши паролей не утекают через
Редактор и Журнал (их видят все отделы, а пароль от 4 символов подбирается перебором)."""
import json
import sqlite3

import pytest


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def _worker(app, login):
    c = _db(app)
    c.row_factory = sqlite3.Row
    return c.execute('SELECT * FROM worker WHERE login=?', (login,)).fetchone()


def test_profile_needs_login(anon_client):
    assert anon_client.get('/api/profile').status_code == 401
    assert anon_client.get('/profile').status_code == 302


@pytest.mark.parametrize('dept', ['ОТК', 'Производство', 'ОТО'])
def test_every_department_opens_own_profile(register_client, dept):
    c = register_client(department=dept)
    assert c.get('/profile').status_code == 200
    p = c.get('/api/profile').get_json()
    assert p['department'] == dept and p['has_zones'] is (dept == 'Производство')
    assert 'password' not in p


def test_update_name_position_and_header(register_client, app):
    c = register_client(department='ОТК', login='pf_name@x.kz')
    r = c.put('/api/profile', json={'surname': ' Петров ', 'name': 'Пётр', 'father_name': '', 'position': 'Контролёр'})
    assert r.get_json()['status'] == 'success' and r.get_json()['name'] == 'Петров П.'
    w = _worker(app, 'pf_name@x.kz')
    assert (w['surname'], w['name'], w['position'], w['department']) == ('Петров', 'Пётр', 'Контролёр', 'ОТК')
    assert c.get('/api/me').get_json()['name'] == 'Петров П.'
    assert c.put('/api/profile', json={'surname': '', 'name': 'Пётр'}).status_code == 400
    assert c.put('/api/profile', json={'surname': 'П' * 101, 'name': 'Пётр'}).status_code == 400


def test_department_is_not_changed_from_profile(register_client, app):
    c = register_client(department='Производство', login='pf_dept@x.kz')
    c.put('/api/profile', json={'surname': 'А', 'name': 'Б', 'department': 'WeldTeam'})
    assert _worker(app, 'pf_dept@x.kz')['department'] == 'Производство'


def test_own_zones(register_client, app):
    c = register_client(department='Производство', login='pf_zone@x.kz')
    r = c.put('/api/profile', json={'surname': 'А', 'name': 'Б', 'areas': {'1': ['BS', 'BS-R', 'MB'], '2': ['BS-L']}})
    assert r.get_json()['status'] == 'success'
    assert r.get_json()['areas'] == {'1': ['BS', 'MB'], '2': ['BS-L']} or r.get_json()['areas'] == {1: ['BS', 'MB'], 2: ['BS-L']}
    wid = _worker(app, 'pf_zone@x.kz')['UniqueID']
    rows = set(_db(app).execute('SELECT brand_id, segment FROM worker_area WHERE worker_id=?', (wid,)))
    assert rows == {(1, 'BS'), (1, 'MB'), (2, 'BS-L')}
    bad = c.put('/api/profile', json={'surname': 'А', 'name': 'Б', 'areas': {'1': ['НЕТТАКОГО']}})
    assert bad.status_code == 400
    assert set(_db(app).execute('SELECT brand_id, segment FROM worker_area WHERE worker_id=?', (wid,))) == rows
    # без ключа areas зоны не трогаются
    c.put('/api/profile', json={'surname': 'А', 'name': 'Б'})
    assert set(_db(app).execute('SELECT brand_id, segment FROM worker_area WHERE worker_id=?', (wid,))) == rows


def test_zones_only_for_departments_with_zones(register_client):
    c = register_client(department='ОТК')
    assert c.put('/api/profile', json={'surname': 'А', 'name': 'Б', 'areas': {'1': ['MB']}}).status_code == 400


def test_change_email_needs_current_password(register_client, app):
    c = register_client(department='ОТК', login='pf_mail@x.kz')
    register_client(department='ОТК', login='taken@x.kz')
    assert c.post('/api/profile/email', json={'email': 'new@x.kz', 'current_password': 'wrong'}).status_code == 400
    assert c.post('/api/profile/email', json={'email': 'taken@x.kz', 'current_password': 'test1234'}).status_code == 400
    assert c.post('/api/profile/email', json={'email': 'не почта', 'current_password': 'test1234'}).status_code == 400
    # чужая почта администратора не достанется никому: с ней вход дал бы права админа
    assert c.post('/api/profile/email', json={'email': app.config['ADMIN_EMAIL'],
                                              'current_password': 'test1234'}).status_code == 400
    r = c.post('/api/profile/email', json={'email': ' New@X.kz ', 'current_password': 'test1234'})
    assert r.get_json()['status'] == 'success'
    w = _worker(app, 'new@x.kz')
    assert w is not None and w['email'] == 'new@x.kz' and _worker(app, 'pf_mail@x.kz') is None
    fresh = app.test_client()
    fresh.post('/login', data={'login': 'new@x.kz', 'password': 'test1234'})
    assert fresh.get('/api/me').status_code == 200


def test_root_admin_email_is_fixed(register_client, app):
    admin = register_client(department='WeldTeam', login=app.config['ADMIN_EMAIL'])
    r = admin.post('/api/profile/email', json={'email': 'other@x.kz', 'current_password': 'test1234'})
    assert r.status_code == 400


def test_change_password(register_client, app):
    c = register_client(department='ОТК', login='pf_pw@x.kz')
    body = {'current_password': 'test1234', 'password': 'newpass', 'password2': 'newpass'}
    assert c.post('/api/profile/password', json={**body, 'current_password': 'nope'}).status_code == 400
    assert c.post('/api/profile/password', json={**body, 'password2': 'other'}).status_code == 400
    assert c.post('/api/profile/password', json={**body, 'password': 'abc', 'password2': 'abc'}).status_code == 400
    assert c.post('/api/profile/password', json=body).get_json()['status'] == 'success'
    old, new = app.test_client(), app.test_client()
    old.post('/login', data={'login': 'pf_pw@x.kz', 'password': 'test1234'})
    new.post('/login', data={'login': 'pf_pw@x.kz', 'password': 'newpass'})
    assert old.get('/api/me').status_code == 401 and new.get('/api/me').status_code == 200


# ── хеши паролей не видны ни в Редакторе, ни в Журнале ─────────────────────────────
def test_editor_does_not_show_or_write_password(register_client, app):
    reader = register_client(department='ОТК')                 # «только чтение», но Редактор читает
    rows = reader.get('/api/admin/table/worker?limit=500').get_json()['rows']
    assert rows and all('password' not in r and 'tg_link_code' not in r for r in rows)
    editor = register_client(department='ИТО', login='pf_ito@x.kz')
    wid = _worker(app, 'pf_ito@x.kz')['UniqueID']
    r = editor.put(f'/api/admin/table/worker/{wid}', json={'values': {'password': 'x'}})
    assert r.status_code == 400 and _worker(app, 'pf_ito@x.kz')['password'] != 'x'


def test_journal_keeps_no_password_hashes(register_client, app):
    c = register_client(department='ОТК', login='pf_log@x.kz')
    c.put('/api/profile', json={'surname': 'Журналов', 'name': 'Ж'})
    c.post('/api/profile/password', json={'current_password': 'test1234', 'password': 'pass5678', 'password2': 'pass5678'})
    db = _db(app)
    wid = _worker(app, 'pf_log@x.kz')['UniqueID']
    logs = db.execute("SELECT before_json, after_json FROM change_log WHERE table_name='worker' AND row_pk=?",
                      (str(wid),)).fetchall() or db.execute(
        "SELECT before_json, after_json FROM change_log WHERE table_name='worker' AND row_pk=?", (wid,)).fetchall()
    assert logs, 'правка ФИО должна попасть в журнал'
    snaps = [json.loads(x) for pair in logs for x in pair if x]
    assert all('password' not in s and 'tg_link_code' not in s for s in snaps)
    assert not any('scrypt' in str(v) or 'pbkdf2' in str(v) for s in snaps for v in s.values())
    assert len(logs) == 2, 'регистрация и правка ФИО; смена одного пароля журнал не засоряет'
    # старые записи (до этого правила) отдаются без хеша
    db.execute("INSERT INTO change_log(table_name,row_pk,op,before_json,after_json) VALUES ('worker',?, 'UPDATE', ?, ?)",
               (wid, json.dumps({'UniqueID': wid, 'password': 'scrypt:old'}), json.dumps({'UniqueID': wid, 'password': 'scrypt:new'})))
    db.commit()
    entries = c.get('/api/admin/history?table=worker&limit=1000').get_json()['entries']
    assert entries and all('scrypt' not in (e['before_json'] or '') + (e['after_json'] or '') for e in entries)
