"""Вкладки WB из БД, авто-привязка точек, редактирование G-номеров параметра."""
import sqlite3

from tests.test_admin_docs import wb_doc


def test_create_and_delete_wb_tab(client):
    r = client.post('/api/admin/wb-tabs', json={'title': 'WB · CS65 (Changan)', 'token': 'CS65X'}).get_json()
    assert r['status'] == 'success'
    doc_id = r['doc_id']
    docs = client.get('/api/admin/docs').get_json()
    assert any(d['id'] == doc_id for d in docs)
    # вставка строки в новую вкладку получает свой manual_src
    res = client.post(f'/api/admin/doc/{doc_id}/batch', json={'changes': [
        {'op': 'insert', 'values': {'zone': 'z1', 'row_order': 1}}]}).get_json()
    assert res['status'] == 'success'
    row = client.get(f'/api/admin/doc/{doc_id}?limit=5').get_json()['rows'][0]
    assert row['source_file'] == 'manual CS65X'
    # удалить непустую нельзя
    tab_id = next(d['wb_tab_id'] for d in docs if d['id'] == doc_id)
    assert client.delete(f'/api/admin/wb-tabs/{tab_id}').status_code == 400
    # очистили строку → удаляется
    client.post(f'/api/admin/doc/{doc_id}/batch', json={'changes': [
        {'op': 'delete', 'pk': row['__pk_weld_point']}]})
    assert client.delete(f'/api/admin/wb-tabs/{tab_id}').get_json()['status'] == 'success'


def test_wb_tab_validation(client):
    assert client.post('/api/admin/wb-tabs', json={'title': 'x', 'token': 'плохой токен'}).status_code == 400
    assert client.post('/api/admin/wb-tabs', json={'title': '', 'token': 'OK1'}).status_code == 400
    client.post('/api/admin/wb-tabs', json={'title': 'x', 'token': 'DUP1'})
    assert client.post('/api/admin/wb-tabs', json={'title': 'y', 'token': 'DUP1'}).status_code == 400


def test_weld_point_autolink(client, app):
    # строка WB с «Клещи (G)»=G.1 и модель Tiggo2 (id=1) + № точки 17 → авто gun_id/spot_id
    doc = wb_doc(client, 'A13T')
    res = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.1', 'model_id': 1, 'spot_number': '17',
                                    'zone': 'autolink', 'row_order': 1}}]}).get_json()
    assert res['status'] == 'success'
    db = sqlite3.connect(app.config['DB_PATH'])
    row = db.execute("SELECT gun_id, spot_id FROM weld_point WHERE zone='autolink'").fetchone()
    gun1 = db.execute('SELECT UniqueID FROM gun WHERE g_num=1').fetchone()[0]
    spot17 = db.execute('SELECT UniqueID FROM spot WHERE model_id=1 AND spot_number=17').fetchone()[0]
    assert row == (gun1, spot17)


def test_parameter_guns_sync(client, app):
    pid = client.get('/api/admin/doc/parameters?limit=1').get_json()['rows'][0]['__pk_parameters']
    # назначаем клещи G.5 и G.6
    res = client.post('/api/admin/doc/parameters/batch', json={'changes': [
        {'op': 'update', 'field': 'guns', 'value': '5, 6', 'row_pks': {'parameters': pid}}]}).get_json()
    assert res['status'] == 'success'
    db = sqlite3.connect(app.config['DB_PATH'])
    active = {r[0] for r in db.execute(
        'SELECT g.g_num FROM welding_setup ws JOIN gun g ON ws.gun_id=g.UniqueID '
        'WHERE ws.parameter_id=? AND ws.is_active=1', (pid,))}
    assert active == {5, 6}
    # меняем на только G.5 — G.6 деактивируется
    client.post('/api/admin/doc/parameters/batch', json={'changes': [
        {'op': 'update', 'field': 'guns', 'value': 'G.5', 'row_pks': {'parameters': pid}}]})
    active = {r[0] for r in db.execute(
        'SELECT g.g_num FROM welding_setup ws JOIN gun g ON ws.gun_id=g.UniqueID '
        'WHERE ws.parameter_id=? AND ws.is_active=1', (pid,))}
    assert active == {5}
    # несуществующий номер → 400 с сообщением
    r = client.post('/api/admin/doc/parameters/batch', json={'changes': [
        {'op': 'update', 'field': 'guns', 'value': '99999', 'row_pks': {'parameters': pid}}]})
    assert r.status_code == 400 and 'не найдены' in r.get_json()['message']
