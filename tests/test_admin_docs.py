"""Тесты документов редактора: список, связанная запись, под-таблица деталей."""
import sqlite3


def test_docs_list(client):
    ids = [d['id'] for d in client.get('/api/admin/docs').get_json()]
    assert ids == ['equipment', 'weld_balance', 'parameters']


def test_equipment_linked_edit(client, app):
    eq = client.get('/api/admin/doc/equipment?limit=50').get_json()
    assert any(c['label'] == 'Станция' and c['editable'] and c['fk'] == 'station' for c in eq['columns'])
    row = next(r for r in eq['rows'] if r['__pk_transformer_station_assignment'])
    tsa, gun = row['__pk_transformer_station_assignment'], row['__pk_gun']
    new_st = 2 if row['station_id'] != 2 else 3
    res = client.post('/api/admin/doc/equipment/batch', json={'changes': [
        {'op': 'update', 'field': 'station_id', 'value': new_st, 'row_pks': {'transformer_station_assignment': tsa}},
        {'op': 'update', 'field': 'gun_type', 'value': 'DOCT', 'row_pks': {'gun': gun}},
    ], 'author': 'alibek'}).get_json()
    assert res['status'] == 'success'
    bid = res['batch_id']

    # обе правки — под одним пакетом, в двух РАЗНЫХ таблицах (связанное редактирование)
    hist = client.get('/api/admin/history').get_json()['entries']
    tables = {e['table_name'] for e in hist if e['batch_id'] == bid}
    assert tables == {'gun', 'transformer_station_assignment'}

    db = sqlite3.connect(app.config['DB_PATH'])
    assert db.execute("SELECT station_id FROM transformer_station_assignment WHERE UniqueID=?", (tsa,)).fetchone()[0] == new_st
    assert db.execute("SELECT gun_type FROM gun WHERE UniqueID=?", (gun,)).fetchone()[0] == 'DOCT'


def test_parameters_doc_edit(client, app):
    d = client.get('/api/admin/doc/parameters?limit=3').get_json()
    labels = [c['label'] for c in d['columns']]
    assert 'Ток 1' in labels and 'Клещи (G)' in labels
    pid = d['rows'][0]['__pk_parameters']
    res = client.post('/api/admin/doc/parameters/batch', json={'changes': [
        {'op': 'update', 'field': 'heat_1', 'value': 1234, 'row_pks': {'parameters': pid}}]}).get_json()
    assert res['status'] == 'success'
    db = sqlite3.connect(app.config['DB_PATH'])
    assert db.execute("SELECT heat_1 FROM parameters WHERE UniqueID=?", (pid,)).fetchone()[0] == 1234


def test_weld_balance_doc_and_child(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    db.execute("INSERT INTO weld_point (id, source_file, spot_number) VALUES (1,'x','5')")
    db.execute("INSERT INTO weld_point_part (weld_point_id, layer_no, part_name) VALUES (1,1,'A')")
    db.execute("INSERT INTO weld_point_part (weld_point_id, layer_no, part_name) VALUES (1,2,'B')")
    db.commit()

    wb = client.get('/api/admin/doc/weld_balance?limit=10').get_json()
    assert wb['child']['table'] == 'weld_point_part' and wb['child']['fk_col'] == 'weld_point_id'
    assert any(c['label'] == '№ точки' for c in wb['columns'])

    res = client.post('/api/admin/doc/weld_balance/batch', json={'changes': [
        {'op': 'update', 'field': 'zone', 'value': 'ZONE1', 'row_pks': {'weld_point': 1}}]}).get_json()
    assert res['status'] == 'success'
    assert db.execute("SELECT zone FROM weld_point WHERE id=1").fetchone()[0] == 'ZONE1'

    parts = client.get('/api/admin/table/weld_point_part?filter_col=weld_point_id&filter_val=1').get_json()
    assert parts['total'] == 2


def test_unknown_doc(client):
    assert client.get('/api/admin/doc/nope').status_code == 404
