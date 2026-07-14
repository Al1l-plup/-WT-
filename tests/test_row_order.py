"""Порядок строк Weld Balance (row_order): миграция, сортировка документа, вставка «между»."""
import sqlite3


def _ins(db, id_, zone, order):
    db.execute("INSERT INTO weld_point (id, source_file, zone, row_order) VALUES (?,?,?,?)",
               (id_, 'Weld_Balance_Table_A13T test', zone, order))


def test_migration_backfills_row_order(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    cols = [c[1] for c in db.execute("PRAGMA table_info(weld_point)")]
    assert 'row_order' in cols
    db.execute("INSERT INTO weld_point (id, source_file) VALUES (500,'x')")
    db.commit()
    # у новых строк row_order задаёт приложение/импортёр; колонка есть и индексируется
    assert db.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name='ix_weld_point_row_order'").fetchone()[0] == 1


def test_document_sorted_by_row_order(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    _ins(db, 1, 'первая', 10.0)
    _ins(db, 2, 'третья', 30.0)
    _ins(db, 3, 'вторая', 20.0)
    db.commit()
    rows = client.get('/api/admin/doc/weld_balance_a13t?limit=10').get_json()['rows']
    assert [r['zone'] for r in rows] == ['первая', 'вторая', 'третья']


def test_reorder_via_batch(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    _ins(db, 1, 'A', 1.0)
    _ins(db, 2, 'B', 2.0)
    db.commit()
    # переместим B выше A: row_order = 0.5 (fractional ordering, как делает грид)
    res = client.post('/api/admin/doc/weld_balance_a13t/batch', json={'changes': [
        {'op': 'update', 'field': 'row_order', 'value': 0.5, 'row_pks': {'weld_point': 2}}]}).get_json()
    assert res['status'] == 'success'
    rows = client.get('/api/admin/doc/weld_balance_a13t?limit=10').get_json()['rows']
    assert [r['zone'] for r in rows] == ['B', 'A']


def test_insert_between_via_batch(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    _ins(db, 1, 'A', 1.0)
    _ins(db, 2, 'C', 2.0)
    db.commit()
    res = client.post('/api/admin/doc/weld_balance_a13t/batch', json={'changes': [
        {'op': 'insert', 'values': {'zone': 'B', 'row_order': 1.5,
                                    'wb_station': 's', 'spot_number': '9'}}]}).get_json()
    assert res['status'] == 'success'
    # insert_defaults проставил source_file → строка попала в свой документ и встала МЕЖДУ A и C
    rows = client.get('/api/admin/doc/weld_balance_a13t?limit=10').get_json()['rows']
    assert [r['zone'] for r in rows] == ['A', 'B', 'C']
    b = next(r for r in rows if r['zone'] == 'B')
    assert b['source_file'] == 'manual A13T' and b['row_order'] == 1.5


def test_row_order_hidden_column_exposed(client):
    cols = client.get('/api/admin/doc/weld_balance_a13t?limit=1').get_json()['columns']
    ro = next(c for c in cols if c['field'] == 'row_order')
    assert ro['hidden'] is True and ro['editable'] is True
