"""Переносы: ган на другой трансформатор/станцию, точка на другие клещи.

История не теряется: старые привязки закрываются датой (is_active=0, end_date),
новые создаются активными — это видно и в Обзоре, и в Журнале.
"""
import sqlite3

from tests.test_admin_docs import wb_doc


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def test_gun_transfer_via_transformer(client, app):
    db = _db(app)
    gid, old_trans, gta_id = db.execute(
        'SELECT gun_id, transformer_id, UniqueID FROM gun_transformer_assignment '
        'WHERE is_active=1 AND transformer_id IS NOT NULL LIMIT 1').fetchone()
    new_trans = db.execute('SELECT UniqueID FROM trans WHERE UniqueID!=? LIMIT 1',
                           (old_trans,)).fetchone()[0]

    r = client.post('/api/admin/doc/equipment/batch', json={'changes': [
        {'op': 'update', 'field': 'transformer_id', 'value': new_trans, 'row_pks': {'gun': gid}}]})
    assert r.get_json()['status'] == 'success'

    db = _db(app)
    # старая привязка закрыта датой, история сохранена
    old = db.execute('SELECT is_active, end_date FROM gun_transformer_assignment WHERE UniqueID=?',
                     (gta_id,)).fetchone()
    assert old[0] == 0 and old[1] is not None
    # новая привязка активна и указывает на выбранный трансформатор
    new = db.execute('SELECT transformer_id, comments FROM gun_transformer_assignment '
                     'WHERE gun_id=? AND is_active=1', (gid,)).fetchall()
    assert len(new) == 1 and new[0][0] == new_trans and 'перенос' in new[0][1]

    # документ показывает новый трансформатор у этого гана
    rows = client.get('/api/admin/doc/equipment?limit=100000').get_json()['rows']
    row = next(r for r in rows if r['__pk_gun'] == gid)
    assert row['transformer_id'] == new_trans


def test_gun_transfer_unknown_transformer_rejected(client, app):
    gid = _db(app).execute('SELECT UniqueID FROM gun LIMIT 1').fetchone()[0]
    r = client.post('/api/admin/doc/equipment/batch', json={'changes': [
        {'op': 'update', 'field': 'transformer_id', 'value': 999999, 'row_pks': {'gun': gid}}]})
    assert r.status_code == 400
    assert 'не найден' in r.get_json()['message']


def test_point_transfer_via_g_change(client, app):
    # два свежих гана с уникальными G-номерами
    g1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 91001, 'gun_type': 'X'}}).get_json()['id']
    g2 = client.post('/api/admin/table/gun', json={'values': {'g_num': 91002, 'gun_type': 'X'}}).get_json()['id']
    m1 = _db(app).execute('SELECT UniqueID FROM model LIMIT 1').fetchone()[0]
    doc = wb_doc(client, 'A13T')

    # строка WB c G.91001 → авто-создание карточки точки + активной связки welding_setup
    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.91001', 'spot_number': '88001', 'model_id': m1}}]})
    assert r.get_json()['status'] == 'success'

    db = _db(app)
    wp_id, spot_id = db.execute(
        "SELECT id, spot_id FROM weld_point WHERE spot_number='88001'").fetchone()
    assert spot_id is not None
    assert db.execute('SELECT 1 FROM welding_setup WHERE spot_id=? AND gun_id=? AND is_active=1',
                      (spot_id, g1)).fetchone()

    # смена «Клещи (G)» = ПЕРЕНОС точки на другие клещи
    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'gun_mntc', 'value': 'G.91002', 'row_pks': {'weld_point': wp_id}}]})
    assert r.get_json()['status'] == 'success'

    db = _db(app)
    old = db.execute('SELECT is_active, end_date FROM welding_setup WHERE spot_id=? AND gun_id=?',
                     (spot_id, g1)).fetchone()
    assert old[0] == 0 and old[1] is not None  # старая связка закрыта датой
    assert db.execute('SELECT 1 FROM welding_setup WHERE spot_id=? AND gun_id=? AND is_active=1',
                      (spot_id, g2)).fetchone()  # новая активна
    assert db.execute('SELECT gun_id FROM weld_point WHERE id=?', (wp_id,)).fetchone()[0] == g2
