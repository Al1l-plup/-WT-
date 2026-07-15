"""Тесты генерик-редактора БД (admin API): CRUD, журнал, откат, валидация."""


def _gun1(client):
    rows = client.get('/api/admin/table/gun?limit=500').get_json()['rows']
    return next(r['gun_type'] for r in rows if r['UniqueID'] == 1)


def test_tables_list(client):
    data = client.get('/api/admin/tables').get_json()
    assert any(t['name'] == 'gun' for t in data)
    assert all('change_log' != t['name'] for t in data)  # системные не показываем


def test_update_logs_and_revert(client):
    orig = _gun1(client)
    r = client.put('/api/admin/table/gun/1', json={'values': {'gun_type': 'EDIT'}, 'author': 'alibek'})
    assert r.status_code == 200 and r.get_json()['status'] == 'success'
    assert _gun1(client) == 'EDIT'

    hist = client.get('/api/admin/history?table=gun').get_json()
    assert hist['total'] >= 1 and hist['entries'][0]['author'] == 'Тестов Т.'  # автор — из сессии входа
    cid = hist['entries'][0]['id']

    assert client.post(f'/api/admin/history/{cid}/revert', json={}).get_json()['status'] == 'success'
    assert _gun1(client) == orig


def test_insert_and_delete(client):
    r = client.post('/api/admin/table/brand', json={'values': {'brand': 'НовыйБренд'}})
    assert r.status_code == 200
    new_id = r.get_json()['id']
    rows = client.get('/api/admin/table/brand?q=Новый').get_json()['rows']
    assert any(x['UniqueID'] == new_id for x in rows)
    assert client.delete(f'/api/admin/table/brand/{new_id}').get_json()['status'] == 'success'


def test_restore_point_rollback(client):
    orig = _gun1(client)
    rp = client.post('/api/admin/restore-points', json={'name': 'cp1'}).get_json()['id']
    client.put('/api/admin/table/gun/1', json={'values': {'gun_type': 'ZZ'}})
    client.post('/api/admin/table/brand', json={'values': {'brand': 'Temp'}})
    r = client.post(f'/api/admin/restore-points/{rp}/rollback', json={}).get_json()
    assert r['status'] == 'success' and r['reverted'] == 2
    assert _gun1(client) == orig


def test_validation_and_guards(client):
    assert client.put('/api/admin/table/gun/1', json={'values': {'nope': 'x'}}).status_code == 400
    assert client.get('/api/admin/table/change_log').status_code == 404
    assert client.get('/api/admin/table/no_such_table').status_code == 404
