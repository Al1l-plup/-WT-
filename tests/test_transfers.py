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
    doc = wb_doc(client, 'A13T')

    # строка WB c G.91001 → авто-создание карточки точки + активной связки welding_setup
    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.91001', 'spot_number': '88001', 'model_code': 'A13T'}}]})
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


def _active(db, spot_id, gun_id):
    return db.execute('SELECT COUNT(*) FROM welding_setup WHERE spot_id=? AND gun_id=? AND is_active=1',
                      (spot_id, gun_id)).fetchone()[0]


def test_point_clear_g_closes_link(client, app):
    """Очистили «Клещи (G)» у точки → связка закрывается датой, в Обзоре точки на гане меньше."""
    g1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 91003, 'gun_type': 'X'}}).get_json()['id']
    doc = wb_doc(client, 'A13T')
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.91003', 'spot_number': '88002', 'model_code': 'A13T'}}]})
    db = _db(app)
    wp_id, spot_id = db.execute("SELECT id, spot_id FROM weld_point WHERE spot_number='88002'").fetchone()
    assert _active(db, spot_id, g1) == 1

    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'gun_mntc', 'value': '', 'row_pks': {'weld_point': wp_id}}]})
    assert r.get_json()['status'] == 'success'
    db = _db(app)
    assert _active(db, spot_id, g1) == 0
    old = db.execute('SELECT is_active, end_date FROM welding_setup WHERE spot_id=? AND gun_id=?',
                     (spot_id, g1)).fetchone()
    assert old[0] == 0 and old[1] is not None
    assert db.execute('SELECT gun_id FROM weld_point WHERE id=?', (wp_id,)).fetchone()[0] is None


def test_row_delete_closes_link(client, app):
    """Удалили строку WB → неподтверждённая связка закрывается датой."""
    g1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 91004, 'gun_type': 'X'}}).get_json()['id']
    doc = wb_doc(client, 'A13T')
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.91004', 'spot_number': '88003', 'model_code': 'A13T'}}]})
    db = _db(app)
    wp_id, spot_id = db.execute("SELECT id, spot_id FROM weld_point WHERE spot_number='88003'").fetchone()
    assert _active(db, spot_id, g1) == 1

    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [{'op': 'delete', 'pk': wp_id}]})
    assert r.get_json()['status'] == 'success'
    db = _db(app)
    assert _active(db, spot_id, g1) == 0


def test_duplicate_wb_rows_keep_link(client, app):
    """Две строки WB на одну точку+клещи: правка одной не закрывает связку, пока живёт вторая."""
    g1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 91005, 'gun_type': 'X'}}).get_json()['id']
    doc = wb_doc(client, 'A13T')
    for _ in range(2):
        client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
            {'op': 'insert', 'values': {'gun_mntc': 'G.91005', 'spot_number': '88004', 'model_code': 'A13T'}}]})
    db = _db(app)
    rows = db.execute("SELECT id, spot_id FROM weld_point WHERE spot_number='88004'").fetchall()
    assert len(rows) == 2
    spot_id = rows[0][1]
    assert _active(db, spot_id, g1) == 1  # связка одна, не дублируется

    # очистили G только в ПЕРВОЙ строке — вторая всё ещё подтверждает пару
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'gun_mntc', 'value': '', 'row_pks': {'weld_point': rows[0][0]}}]})
    assert _active(_db(app), spot_id, g1) == 1

    # удалили и вторую строку — теперь пара не подтверждена, связка закрыта
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [{'op': 'delete', 'pk': rows[1][0]}]})
    assert _active(_db(app), spot_id, g1) == 0


def test_multi_model_code_links_both_modifications(client, app):
    """Код A01 = Jolion 2WD и 4WD: строка WB создаёт карточку и связку в ОБЕИХ модификациях,
    перенос на другие клещи тоже отрабатывает в обеих."""
    g1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 91006, 'gun_type': 'X'}}).get_json()['id']
    g2 = client.post('/api/admin/table/gun', json={'values': {'g_num': 91007, 'gun_type': 'X'}}).get_json()['id']
    doc = wb_doc(client, 'A01')
    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.91006', 'spot_number': '88005', 'model_code': 'A01'}}]})
    assert r.get_json()['status'] == 'success'

    db = _db(app)
    spots = db.execute("""SELECT s.UniqueID FROM spot s JOIN model m ON s.model_id=m.UniqueID
                          WHERE m.model_code='A01' AND s.spot_number=88005""").fetchall()
    assert len(spots) == 2  # карточка в каждой модификации
    for (sid,) in spots:
        assert _active(db, sid, g1) == 1

    wp_id = db.execute("SELECT id FROM weld_point WHERE spot_number='88005'").fetchone()[0]
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'gun_mntc', 'value': 'G.91007', 'row_pks': {'weld_point': wp_id}}]})
    db = _db(app)
    for (sid,) in spots:
        assert _active(db, sid, g1) == 0  # старые клещи закрыты в обеих модификациях
        assert _active(db, sid, g2) == 1  # новые активны в обеих


def test_g_roundtrip_keeps_welding_program(client, app):
    """Смена G туда-обратно НЕ теряет программу сварки (parameter_id наследуется)."""
    g1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 92001, 'gun_type': 'X'}}).get_json()['id']
    client.post('/api/admin/table/gun', json={'values': {'g_num': 92002, 'gun_type': 'X'}})
    doc = wb_doc(client, 'A13T')
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.92001', 'spot_number': '89001', 'model_code': 'A13T'}}]})
    db = _db(app)
    wp_id, spot_id = db.execute("SELECT id, spot_id FROM weld_point WHERE spot_number='89001'").fetchone()
    # назначить программу связке (точка, G.92001) — как первоначальная загрузка
    param = db.execute('SELECT UniqueID FROM parameters LIMIT 1').fetchone()[0]
    con = sqlite3.connect(app.config['DB_PATH'])
    con.execute('UPDATE welding_setup SET parameter_id=? WHERE spot_id=? AND gun_id=? AND is_active=1',
                (param, spot_id, g1))
    con.commit(); con.close()

    # перенос на G.92002, затем обратно на G.92001
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'gun_mntc', 'value': 'G.92002', 'row_pks': {'weld_point': wp_id}}]})
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'gun_mntc', 'value': 'G.92001', 'row_pks': {'weld_point': wp_id}}]})

    db = _db(app)
    # ровно одна активная связка точки, на G.92001, с восстановленной программой
    act = db.execute('SELECT gun_id, parameter_id FROM welding_setup WHERE spot_id=? AND is_active=1',
                     (spot_id,)).fetchall()
    assert act == [(g1, param)]


def test_stray_active_link_closed_on_edit(client, app):
    """«Застрявшая» активная связка (третьи клещи, которых нет в WB) закрывается
    при следующей синхронизации точки — в Обзоре остаётся один активный ган."""
    g1 = client.post('/api/admin/table/gun', json={'values': {'g_num': 92003, 'gun_type': 'X'}}).get_json()['id']
    stray = client.post('/api/admin/table/gun', json={'values': {'g_num': 92004, 'gun_type': 'X'}}).get_json()['id']
    doc = wb_doc(client, 'A13T')
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'gun_mntc': 'G.92003', 'spot_number': '89002', 'model_code': 'A13T'}}]})
    db = _db(app)
    wp_id, spot_id = db.execute("SELECT id, spot_id FROM weld_point WHERE spot_number='89002'").fetchone()
    # вручную «подвесить» вторую активную связку на клещи, которых нет в WB
    con = sqlite3.connect(app.config['DB_PATH'])
    con.execute("INSERT INTO welding_setup (comments, start_date, is_active, auto_created, spot_id, gun_id, parameter_id) "
                "VALUES ('создано из Weld Balance', '2026-01-01', 1, 1, ?, ?, NULL)", (spot_id, stray))
    con.commit(); con.close()
    assert _active(_db(app), spot_id, stray) == 1  # две активные до правки

    # любая правка строки WB запускает синхронизацию точки
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'zone', 'value': 'touch', 'row_pks': {'weld_point': wp_id}}]})

    db = _db(app)
    assert _active(db, spot_id, stray) == 0   # застрявшая закрыта
    assert _active(db, spot_id, g1) == 1      # подтверждённая WB осталась
    active_guns = db.execute('SELECT gun_id FROM welding_setup WHERE spot_id=? AND is_active=1',
                             (spot_id,)).fetchall()
    assert active_guns == [(g1,)]             # ровно один активный ган
