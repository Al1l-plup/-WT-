"""«Сверка» с WB (/reconciliation, /api/wb-issues): видят все отделы, разбирает ИТО.

Строки Сверки собираются автоматически (app/wb_source.rebuild_issues) — здесь проверяем
выдачу, права и то, что «Исправлено» нельзя поставить руками."""
import sqlite3

from tests.test_wb_source import _gun


def _issue_id(app, gid):
    return sqlite3.connect(app.config['DB_PATH']).execute(
        'SELECT id FROM wb_issue WHERE issue_key=?', (f'nowb:{gid}',)).fetchone()[0]


def test_everyone_sees_reconciliation_but_only_ito_edits(register_client, client, app):
    gid = _gun(client, 94001)                                   # в Перечне, нет в WB
    otk = register_client(department='ОТК')
    assert otk.get('/reconciliation').status_code == 200
    d = otk.get('/api/wb-issues').get_json()
    assert d['can_edit'] is False and d['open_by_kind'].get('gun_not_in_wb', 0) >= 1
    assert any(i['g_num'] == 94001 and i['kind'] == 'gun_not_in_wb' for i in d['issues'])
    assert otk.get('/api/wb-issues/summary').get_json()['open'] == d['open_total']
    iid = _issue_id(app, gid)
    assert otk.put(f'/api/wb-issues/{iid}', json={'comment': 'x'}).status_code == 403
    for dept in ('Производство', 'ОТО'):
        assert register_client(department=dept).put(f'/api/wb-issues/{iid}', json={'comment': 'x'}).status_code == 403


def test_ito_sets_status_assignee_comment(register_client, client, app):
    gid = _gun(client, 94002)
    ito = register_client(department='ИТО', surname='Инженеров')
    d = ito.get('/api/wb-issues').get_json()
    assert d['can_edit'] is True
    eng = next(e for e in d['engineers'] if e['name'].startswith('Инженеров'))
    iid = _issue_id(app, gid)
    r = ito.put(f'/api/wb-issues/{iid}', json={'status': 'assigned', 'assignee_id': eng['UniqueID'],
                                               'comment': '  G94002 списан, убрать из Перечня  '})
    assert r.status_code == 200, r.get_json()
    row = next(i for i in ito.get('/api/wb-issues').get_json()['issues'] if i['id'] == iid)
    assert (row['status'], row['assignee_id'], row['comment']) == ('assigned', eng['UniqueID'],
                                                                   'G94002 списан, убрать из Перечня')
    # «Принято как есть» уводит строку из «требуют разбора», но она не теряется
    assert ito.put(f'/api/wb-issues/{iid}', json={'status': 'accepted'}).status_code == 200
    assert all(i['id'] != iid for i in ito.get('/api/wb-issues').get_json()['issues'])
    assert any(i['id'] == iid for i in ito.get('/api/wb-issues?status=accepted').get_json()['issues'])


def test_resolved_is_automatic_and_input_validated(register_client, client, app):
    gid = _gun(client, 94003)
    ito = register_client(department='ИТО')
    ito.get('/api/wb-issues')
    iid = _issue_id(app, gid)
    assert ito.put(f'/api/wb-issues/{iid}', json={'status': 'resolved'}).status_code == 400
    assert ito.put(f'/api/wb-issues/{iid}', json={'status': 'bogus'}).status_code == 400
    assert ito.put(f'/api/wb-issues/{iid}', json={'assignee_id': 99999999}).status_code == 400
    assert ito.put(f'/api/wb-issues/{iid}', json={}).status_code == 400
    assert ito.put('/api/wb-issues/99999999', json={'comment': 'x'}).status_code == 404
    # снять ответственного / очистить комментарий
    assert ito.put(f'/api/wb-issues/{iid}', json={'assignee_id': None, 'comment': ''}).status_code == 200


def test_sync_button_rights_and_status(register_client, client):
    assert register_client(department='ОТК').post('/api/wb-issues/sync').status_code == 403
    ito = register_client(department='ИТО')
    r = ito.post('/api/wb-issues/sync')
    assert r.status_code == 200, r.get_json()
    assert r.get_json()['sync']['ok'] is True
    d = ito.get('/api/wb-issues').get_json()
    assert d['sync']['trigger'] and d['health']['wb_rows'] >= 0
    # не-ИТО видит итог, но без текстов ошибок
    assert 'errors' not in register_client(department='Производство').get('/api/wb-issues').get_json()['sync']
