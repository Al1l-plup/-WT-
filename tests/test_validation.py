"""Валидация ввода: уникальный G-номер клещей, уникальная точка в модели, формат числа."""
import sqlite3


def _models(app, n=2):
    db = sqlite3.connect(app.config['DB_PATH'])
    return [r[0] for r in db.execute('SELECT UniqueID FROM model LIMIT ?', (n,))]


def test_gun_duplicate_gnum_rejected(client):
    r = client.post('/api/admin/table/gun', json={'values': {'g_num': 90001, 'gun_type': 'X'}})
    assert r.status_code == 200
    r = client.post('/api/admin/table/gun', json={'values': {'g_num': 90001, 'gun_type': 'X'}})
    assert r.status_code == 400
    assert 'уже существуют' in r.get_json()['message']


def test_gun_gnum_must_be_integer(client):
    r = client.post('/api/admin/table/gun', json={'values': {'g_num': 'abc', 'gun_type': 'X'}})
    assert r.status_code == 400
    assert 'целым числом' in r.get_json()['message']


def test_gun_update_own_gnum_ok_taken_rejected(client):
    id1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 90002, 'gun_type': 'X'}}).get_json()['id']
    id2 = client.post('/api/admin/table/gun', json={'values': {'g_num': 90003, 'gun_type': 'X'}}).get_json()['id']
    # свой же номер при правке — не дубль (exclude_pk)
    r = client.put(f'/api/admin/table/gun/{id1}', json={'values': {'g_num': 90002, 'gun_type': 'Y'}})
    assert r.status_code == 200
    # чужой занятый номер — дубль
    r = client.put(f'/api/admin/table/gun/{id2}', json={'values': {'g_num': 90002}})
    assert r.status_code == 400


def test_spot_unique_within_model_only(client, app):
    m1, m2 = _models(app)
    r = client.post('/api/admin/table/spot', json={'values': {'spot_number': 77001, 'model_id': m1}})
    assert r.status_code == 200
    # тот же номер в той же модели — запрещено
    r = client.post('/api/admin/table/spot', json={'values': {'spot_number': 77001, 'model_id': m1}})
    assert r.status_code == 400
    assert 'уже есть в этой модели' in r.get_json()['message']
    # тот же номер в ДРУГОЙ модели — можно
    r = client.post('/api/admin/table/spot', json={'values': {'spot_number': 77001, 'model_id': m2}})
    assert r.status_code == 200


def test_doc_batch_insert_validated(client):
    """Валидация работает и в редакторе документов (batch), а не только в generic-CRUD."""
    client.post('/api/admin/table/gun', json={'values': {'g_num': 90004, 'gun_type': 'X'}})
    r = client.post('/api/admin/doc/equipment/batch', json={'changes': [
        {'op': 'insert', 'values': {'g_num': 90004, 'gun_type': 'X'}}]})
    assert r.status_code == 400
    assert 'уже существуют' in r.get_json()['message']


def test_doc_batch_update_validated(client, app):
    m1, _ = _models(app)
    client.post('/api/admin/table/spot', json={'values': {'spot_number': 77002, 'model_id': m1}})
    sid = client.post('/api/admin/table/spot',
                      json={'values': {'spot_number': 77003, 'model_id': m1}}).get_json()['id']
    # generic-update точки на занятый в модели номер — 400, запись не прошла
    r = client.put(f'/api/admin/table/spot/{sid}', json={'values': {'spot_number': 77002}})
    assert r.status_code == 400
    db = sqlite3.connect(app.config['DB_PATH'])
    assert db.execute('SELECT spot_number FROM spot WHERE UniqueID=?', (sid,)).fetchone()[0] == 77003
