"""Редактор записей ТО/дефектов, встроенный во вкладки /maintenance и /defects.

Это те же «документы» редактора (app/documents.py) на общем движке doc-API —
проверяем состав колонок, правку/вставку/удаление фактов с аудитом (change_log),
FK-колонки и что привязка точки у дефекта отдаётся только для чтения.
"""
import sqlite3


def _first_id(db, table):
    return db.execute(f'SELECT UniqueID FROM {table} LIMIT 1').fetchone()[0]


def test_maintenance_doc_columns(client):
    d = client.get('/api/admin/doc/maintenance').get_json()
    by = {c['field']: c for c in d['columns']}
    assert d['primary'] == 'maintenance'
    assert by['gun_id']['fk'] == 'gun' and by['gun_id']['editable']
    assert by['worker_id']['fk'] == 'worker'
    assert by['to_date']['editable'] and by['first_weld']['editable']


def test_defects_doc_columns(client):
    d = client.get('/api/admin/doc/defects').get_json()
    fields = {c['field'] for c in d['columns']}
    by = {c['field']: c for c in d['columns']}
    assert d['primary'] == 'defects'
    assert by['problem_code']['fk'] == 'defect_code'   # выпадашка кодов дефектов
    assert by['gun_id']['fk'] == 'gun'
    assert not by['spot_disp']['editable']             # точка — только чтение
    assert 'worker_register_id' in fields              # регистратор остаётся (автозаполняется)
    assert 'assigned_worker_id' not in fields          # «Назначен» убран из редактора
    assert 'description' not in fields                 # «Описание» убрано из редактора


def test_registrar_autofilled_on_register(client, app):
    """«Зарегистрировал» проставляется автоматически = текущий вошедший пользователь."""
    db = sqlite3.connect(app.config['DB_PATH'])
    me_uid = db.execute("SELECT UniqueID FROM worker WHERE login='test@weldteam.kz'").fetchone()[0]
    g_num = db.execute('SELECT g_num FROM gun LIMIT 1').fetchone()[0]
    res = client.post('/api/defects/register_manual', json={'g_num': g_num, 'problem_code': 'CR'}).get_json()
    assert res['status'] == 'success'
    reg = db.execute('SELECT worker_register_id FROM defects ORDER BY UniqueID DESC LIMIT 1').fetchone()[0]
    assert reg == me_uid


def test_maintenance_insert_update_delete_audited(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    gun, worker = _first_id(db, 'gun'), _first_id(db, 'worker')
    # вставка новой записи ТО через документ
    res = client.post('/api/admin/doc/maintenance/batch', json={'changes': [
        {'op': 'insert', 'values': {
            'to_date': '2026-09-09', 'gun_id': gun, 'worker_id': worker,
            'first_weld': 100, 'second_weld': 110, 'third_weld': 120,
            'first_pressure': 2000, 'second_pressure': 2000, 'third_pressure': 2000}}]}).get_json()
    assert res['status'] == 'success'
    mid = db.execute('SELECT UniqueId FROM maintenance ORDER BY UniqueId DESC LIMIT 1').fetchone()[0]

    # правка значения
    res = client.post('/api/admin/doc/maintenance/batch', json={'changes': [
        {'op': 'update', 'field': 'first_weld', 'value': 777, 'row_pks': {'maintenance': mid}}]}).get_json()
    assert res['status'] == 'success'
    assert db.execute('SELECT first_weld FROM maintenance WHERE UniqueId=?', (mid,)).fetchone()[0] == 777

    # аудит записан с автором (из сессии входа = Тестов)
    hist = client.get('/api/admin/history?table=maintenance').get_json()['entries']
    assert any(e['op'] == 'UPDATE' and 'Тестов' in (e['author'] or '') for e in hist)

    # удаление
    res = client.post('/api/admin/doc/maintenance/batch', json={'changes': [
        {'op': 'delete', 'pk': mid}]}).get_json()
    assert res['status'] == 'success'
    assert db.execute('SELECT COUNT(*) FROM maintenance WHERE UniqueId=?', (mid,)).fetchone()[0] == 0


def test_defects_insert_and_edit_via_doc(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    code = db.execute('SELECT code FROM defect_code LIMIT 1').fetchone()[0]
    worker = _first_id(db, 'worker')
    res = client.post('/api/admin/doc/defects/batch', json={'changes': [
        {'op': 'insert', 'values': {
            'df_date': '2026-09-09', 'problem_code': code, 'status': 'closed',
            'root_cause': 'причина', 'solution': 'решение', 'worker_register_id': worker}}]}).get_json()
    assert res['status'] == 'success'
    did = db.execute('SELECT UniqueID FROM defects ORDER BY UniqueID DESC LIMIT 1').fetchone()[0]

    res = client.post('/api/admin/doc/defects/batch', json={'changes': [
        {'op': 'update', 'field': 'root_cause', 'value': 'исправлено', 'row_pks': {'defects': did}}]}).get_json()
    assert res['status'] == 'success'
    assert db.execute('SELECT root_cause FROM defects WHERE UniqueID=?', (did,)).fetchone()[0] == 'исправлено'


def test_fact_docs_field_labels(client):
    """Русские метки записей ТО/дефектов доступны Журналу (из документов)."""
    d = client.get('/api/admin/field-labels').get_json()
    assert d['fields']['maintenance']['to_date'] == 'Дата ТО'
    assert d['fields']['defects']['problem_code'] == 'Код дефекта'
