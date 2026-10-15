"""Фаза 3: маршруты и параметры дефектов редактируются как документы «Редактора»,
а движок (defect_flow) подхватывает изменения на лету."""
import sqlite3

from app import defect_flow as df


def _conn(app):
    return sqlite3.connect(app.config['DB_PATH'])


def test_route_and_config_docs_listed(client):
    ids = [d['id'] for d in client.get('/api/admin/docs').get_json()]
    assert 'defect_route' in ids and 'defect_config' in ids


def test_edit_route_changes_chain(client, app):
    d = client.get('/api/admin/doc/defect_route').get_json()
    assert [c['field'] for c in d['columns']] == ['code', 'position', 'dept']
    # поменять 2-й этап маршрута по умолчанию (WeldTeam) на ОТО
    wt = next(r for r in d['rows'] if r['code'] == '*' and r['position'] == 1)
    res = client.post('/api/admin/doc/defect_route/batch', json={'changes': [
        {'op': 'update', 'field': 'dept', 'value': 'ОТО', 'row_pks': {'defect_route': wt['__pk_defect_route']}}]}).get_json()
    assert res['status'] == 'success'
    assert df.route_for(_conn(app), 'CR') == ['Производство', 'ОТО', 'ИТО']   # цепочка изменилась на лету


def test_add_route_row(client, app):
    # добавить персональный маршрут для кода BT: только Производство
    res = client.post('/api/admin/doc/defect_route/batch', json={'changes': [
        {'op': 'insert', 'values': {'code': 'BT', 'position': 0, 'dept': 'Производство'}}]}).get_json()
    assert res['status'] == 'success'
    assert df.route_for(_conn(app), 'BT') == ['Производство']


def test_edit_serial_window(client, app):
    d = client.get('/api/admin/doc/defect_config').get_json()
    row = next(r for r in d['rows'] if r['key'] == 'serial_window_days')
    res = client.post('/api/admin/doc/defect_config/batch', json={'changes': [
        {'op': 'update', 'field': 'value', 'value': '5', 'row_pks': {'defect_config': row['__pk_defect_config']}}]}).get_json()
    assert res['status'] == 'success'
    assert df.serial_window_days(_conn(app)) == 5
