"""Тесты документов редактора: список, связанная запись, под-таблица деталей."""
import sqlite3


def wb_doc(client, token_part):
    """Найти id WB-документа по фрагменту названия (вкладки теперь динамические, из wb_tab)."""
    docs = client.get('/api/admin/docs').get_json()
    return next(d['id'] for d in docs if token_part in d['title'])


def test_docs_list(client):
    docs = client.get('/api/admin/docs').get_json()
    ids = [d['id'] for d in docs]
    assert ids[0] == 'equipment'
    # equipment, WB-вкладки, parameters, затем документы фактов ТО/дефектов
    for expected in ('parameters', 'maintenance', 'defects'):
        assert expected in ids
    titles = ' '.join(d['title'] for d in docs)
    for t in ('A01', 'P01', 'A13T', 'CS55'):
        assert t in titles  # 4 вкладки WB из wb_tab


def test_equipment_linked_edit(client, app):
    eq = client.get('/api/admin/doc/equipment?limit=50').get_json()
    # перенос гана — через редактируемый «Трансформатор»; «Станция» вычисляется и read-only
    assert any(c['label'] == 'Трансформатор' and c['editable'] and c['fk'] == 'trans' for c in eq['columns'])
    assert any(c['label'] == 'Станция' and not c['editable'] for c in eq['columns'])
    row = next(r for r in eq['rows'] if r['transformer_id'])
    gun, old_trans = row['__pk_gun'], row['transformer_id']
    db = sqlite3.connect(app.config['DB_PATH'])
    new_trans = db.execute('SELECT UniqueID FROM trans WHERE UniqueID!=? LIMIT 1', (old_trans,)).fetchone()[0]
    res = client.post('/api/admin/doc/equipment/batch', json={'changes': [
        {'op': 'update', 'field': 'transformer_id', 'value': new_trans, 'row_pks': {'gun': gun}},
        {'op': 'update', 'field': 'gun_type', 'value': 'DOCT', 'row_pks': {'gun': gun}},
    ]}).get_json()
    assert res['status'] == 'success'
    bid = res['batch_id']

    # обе правки — под одним пакетом, в двух РАЗНЫХ таблицах (связанное редактирование)
    hist = client.get('/api/admin/history').get_json()['entries']
    tables = {e['table_name'] for e in hist if e['batch_id'] == bid}
    assert tables == {'gun', 'gun_transformer_assignment'}

    assert db.execute("SELECT transformer_id FROM gun_transformer_assignment WHERE gun_id=? AND is_active=1",
                      (gun,)).fetchone()[0] == new_trans
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
    # source_file с 'A13T' попадает в документ weld_balance_a13t
    db.execute("INSERT INTO weld_point (id, source_file, spot_number) VALUES (1,'Weld_Balance_Table_A13T test','5')")
    db.execute("INSERT INTO weld_point_part (weld_point_id, layer_no, part_name) VALUES (1,1,'A')")
    db.execute("INSERT INTO weld_point_part (weld_point_id, layer_no, part_name) VALUES (1,2,'B')")
    db.commit()

    wb = client.get(f'/api/admin/doc/{wb_doc(client, "A13T")}?limit=10').get_json()
    assert wb['child']['table'] == 'weld_point_part' and wb['child']['fk_col'] == 'weld_point_id'
    assert any(c['label'] == '№ точки' for c in wb['columns'])
    assert any(r['__pk_weld_point'] == 1 for r in wb['rows'])  # фильтр по модели пропустил A13T-строку

    res = client.post(f'/api/admin/doc/{wb_doc(client, "A13T")}/batch', json={'changes': [
        {'op': 'update', 'field': 'zone', 'value': 'ZONE1', 'row_pks': {'weld_point': 1}}]}).get_json()
    assert res['status'] == 'success'
    assert db.execute("SELECT zone FROM weld_point WHERE id=1").fetchone()[0] == 'ZONE1'

    parts = client.get('/api/admin/table/weld_point_part?filter_col=weld_point_id&filter_val=1').get_json()
    assert parts['total'] == 2


def test_weld_balance_model_filter(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    db.execute("INSERT INTO weld_point (id, source_file, zone) VALUES (10,'Weld_Balance_Table_A01 julion','a01')")
    db.execute("INSERT INTO weld_point (id, source_file, zone) VALUES (11,'Weld_Balance_Table_P01 tank','p01')")
    db.commit()
    a01 = client.get(f'/api/admin/doc/{wb_doc(client, "A01")}?limit=100').get_json()['rows']
    ids = {r['__pk_weld_point'] for r in a01}
    assert 10 in ids and 11 not in ids  # A01-документ не содержит P01-строк


def test_unknown_doc(client):
    assert client.get('/api/admin/doc/nope').status_code == 404


def test_field_labels(client):
    d = client.get('/api/admin/field-labels').get_json()
    assert d['fields']['weld_point']['zone'] == 'Зона'
    assert d['fields']['gun']['gun_type'] == 'Тип клещей'
    assert d['tables']['weld_point'] == 'Weld Balance'


def test_natural_sort(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    for i, sn in enumerate(['10', '9', '100', '2']):
        db.execute("INSERT INTO weld_point (source_file, spot_number, row_order) VALUES ('A13T ns', ?, ?)",
                   (sn, 1000 + i))
    db.commit()
    rows = client.get(f'/api/admin/doc/{wb_doc(client, "A13T")}?sort=spot_number&dir=asc&limit=10').get_json()['rows']
    nums = [r['spot_number'] for r in rows if r['spot_number'] in ('2', '9', '10', '100')]
    assert nums == ['2', '9', '10', '100']  # числа как числа, а не как текст


def test_history_author_filter(client):
    client.put('/api/admin/table/gun/1', json={'values': {'gun_type': 'AF1'}})
    hits = client.get('/api/admin/history?author=Тестов').get_json()  # автор — из сессии входа
    assert hits['total'] >= 1 and all('Тестов' in e['author'] for e in hits['entries'])
    miss = client.get('/api/admin/history?author=нет-такого').get_json()
    assert miss['total'] == 0
