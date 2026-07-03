"""Тесты Excel-редактора: серверная сортировка, пакетное сохранение, откат пакета."""


def _gun(client, gid):
    rows = client.get('/api/admin/table/gun?limit=1000').get_json()['rows']
    return next((r['gun_type'] for r in rows if r['UniqueID'] == gid), None)


def test_sort_param(client):
    r = client.get('/api/admin/table/gun?sort=g_num&dir=desc&limit=3').get_json()
    nums = [x['g_num'] for x in r['rows']]
    assert nums == sorted(nums, reverse=True)


def test_batch_apply_single_batch_id(client):
    changes = [
        {'op': 'update', 'pk': 1, 'values': {'gun_type': 'BATCH_A'}},
        {'op': 'insert', 'values': {'g_num': 88888, 'gun_type': 'BATCH_NEW'}},
    ]
    res = client.post('/api/admin/table/gun/batch', json={'changes': changes, 'author': 'alibek'}).get_json()
    assert res['status'] == 'success' and res['update'] == 1 and res['insert'] == 1
    bid = res['batch_id']
    assert _gun(client, 1) == 'BATCH_A'

    hist = client.get('/api/admin/history?table=gun').get_json()['entries']
    in_batch = [e for e in hist if e['batch_id'] == bid]
    assert len(in_batch) == 2  # обе правки под одним пакетом


def test_revert_batch_restores_all(client):
    orig = _gun(client, 1)
    changes = [
        {'op': 'update', 'pk': 1, 'values': {'gun_type': 'ZZZ'}},
        {'op': 'insert', 'values': {'g_num': 77777, 'gun_type': 'TMP'}},
    ]
    bid = client.post('/api/admin/table/gun/batch', json={'changes': changes}).get_json()['batch_id']
    assert _gun(client, 1) == 'ZZZ'

    r = client.post(f'/api/admin/history/batch/{bid}/revert', json={}).get_json()
    assert r['status'] == 'success' and r['reverted'] == 2
    assert _gun(client, 1) == orig
    assert client.get('/api/admin/table/gun?q=TMP').get_json()['total'] == 0


def test_batch_validation(client):
    r = client.post('/api/admin/table/gun/batch',
                    json={'changes': [{'op': 'update', 'pk': 1, 'values': {'nope': 'x'}}]})
    assert r.status_code == 400
