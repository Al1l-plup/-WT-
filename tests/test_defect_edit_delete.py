"""Правка/удаление записей и фото с правами по этапу (п.2 бэклога) + привязка фото к этапу.

Правило: править/удалять СВОЁ (фото/запись своего отдела), пока дефект на МОЁМ этапе;
после передачи дальше — заморожено; чужой отдел — нельзя; админ (WeldTeam) — всё и везде.
"""
import io


def _png():
    return (io.BytesIO(b'\x89PNG\r\n\x1a\nx'), 'p.png')


def _reg(otk, g, code='CR'):
    return otk.post('/api/defects/register_manual', json={'g_num': g, 'problem_code': code}).get_json()


def _upload(c, did):
    return c.post(f'/api/defects/{did}/photo', data={'photo': _png()}, content_type='multipart/form-data')


def test_photo_tagged_with_stage_not_uploader(register_client):
    """Фото помечается ЭТАПОМ ДЕФЕКТА (Производство), а не отделом загрузившего (ОТК)."""
    otk = register_client(department='ОТК')
    data = {'g_num': '90001', 'problem_code': 'CR', 'photo': _png()}
    j = otk.post('/api/defects/register_manual', data=data, content_type='multipart/form-data').get_json()
    det = otk.get(f"/api/defects/{j['defect_id']}").get_json()
    ph = det['photos'][0]
    assert ph['stage_dept'] == 'Производство'      # этап дефекта, НЕ ОТК (загрузивший)
    assert ph['stage_id']                          # привязан к конкретному этапу


def test_photo_delete_own_on_stage(register_client):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='pd_prod@x.kz')
    ito = register_client(department='ИТО', login='pd_ito@x.kz')
    did = _reg(otk, 90010)['defect_id']            # на Производстве
    _upload(prod, did)                             # фото Производства на своём этапе
    pid = otk.get(f'/api/defects/{did}').get_json()['photos'][0]['UniqueID']
    assert ito.delete(f'/api/defects/{did}/photo/{pid}').status_code == 403   # чужой отдел — нельзя
    assert prod.delete(f'/api/defects/{did}/photo/{pid}').get_json()['status'] == 'success'  # своё на своём этапе
    assert len(otk.get(f'/api/defects/{did}').get_json()['photos']) == 0


def test_photo_frozen_after_handoff_admin_can(register_client):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='fz_prod@x.kz')
    wt = register_client(department='WeldTeam', login='fz_wt@x.kz')
    did = _reg(otk, 90020)['defect_id']
    _upload(prod, did)
    pid = otk.get(f'/api/defects/{did}').get_json()['photos'][0]['UniqueID']
    prod.post(f'/api/defects/{did}/act', json={'action': 'pass', 'note': 'ок'})   # → WeldTeam, фото заморожено
    assert prod.delete(f'/api/defects/{did}/photo/{pid}').status_code == 403       # после передачи нельзя
    assert wt.delete(f'/api/defects/{did}/photo/{pid}').get_json()['status'] == 'success'  # админ — всегда


def test_stage_comment_edit_permissions(register_client):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='se_prod@x.kz')
    ito = register_client(department='ИТО', login='se_ito@x.kz')
    wt = register_client(department='WeldTeam', login='se_wt@x.kz')
    did = _reg(otk, 90030)['defect_id']
    det = otk.get(f'/api/defects/{did}').get_json()
    sid = [s for s in det['stages'] if not s['left_at']][0]['stage_id']   # открытый этап Производства
    # чужой отдел не правит
    assert ito.patch(f'/api/defects/{did}/stage/{sid}', json={'note': 'x'}).status_code == 403
    # свой открытый этап — можно
    assert prod.patch(f'/api/defects/{did}/stage/{sid}',
                      json={'note': 'замечание цеха', 'cause': 'оператор'}).get_json()['status'] == 'success'
    st = [s for s in otk.get(f'/api/defects/{did}').get_json()['stages'] if s['stage_id'] == sid][0]
    assert st['note'] == 'замечание цеха' and st['cause'] == 'оператор'
    # после передачи этап заморожен: свой отдел уже не правит, админ — правит
    prod.post(f'/api/defects/{did}/act', json={'action': 'pass', 'note': 'передаём'})
    assert prod.patch(f'/api/defects/{did}/stage/{sid}', json={'note': 'поздно'}).status_code == 403
    assert wt.patch(f'/api/defects/{did}/stage/{sid}', json={'note': 'админ поправил'}).get_json()['status'] == 'success'


def test_delete_defect_cleans_photos(client, app):
    """DELETE дефекта чистит и фото (строки + файлы), а не оставляет orphan."""
    import os
    import sqlite3
    did = client.post('/api/defects/register_manual', json={'g_num': 90040, 'problem_code': 'CR'}).get_json()['defect_id']
    _upload(client, did)
    db = sqlite3.connect(app.config['DB_PATH'])
    fname = db.execute('SELECT path FROM defect_photo WHERE defect_id=?', (did,)).fetchone()[0]
    updir = os.path.join(os.path.dirname(app.config['DB_PATH']), 'uploads', 'defects')
    assert os.path.isfile(os.path.join(updir, fname))
    assert client.delete(f'/api/defects/{did}').get_json()['status'] == 'success'
    db2 = sqlite3.connect(app.config['DB_PATH'])
    assert db2.execute('SELECT COUNT(*) FROM defect_photo WHERE defect_id=?', (did,)).fetchone()[0] == 0
    assert not os.path.isfile(os.path.join(updir, fname))   # файл удалён
