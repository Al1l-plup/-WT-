"""«Сверка» с WB (/reconciliation, /api/wb-issues): видят все отделы, разбирает ИТО.

Строки Сверки собираются автоматически (app/wb_source.rebuild_issues) — здесь проверяем
выдачу, права и то, что «Исправлено» нельзя поставить руками."""
import sqlite3

from tests.test_admin_docs import wb_doc
from tests.test_equipment_register import paste
from tests.test_wb_source import _chery_stations, _gun, _wb_row


def _issue_id(app, gid):
    return sqlite3.connect(app.config['DB_PATH']).execute(
        'SELECT id FROM wb_issue WHERE issue_key=?', (f'nowb:{gid}',)).fetchone()[0]


def _issue(client, kind, **match):
    return next(i for i in client.get('/api/wb-issues').get_json()['issues']
                if i['kind'] == kind and all(i[k] == v for k, v in match.items()))


def _doc_rows(client, doc, issues):
    d = client.get(f'/api/admin/doc/{doc}?limit=100000&issues={issues}').get_json()
    return d['total'], d['rows']


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


def test_every_kind_explains_what_to_do(client):
    d = client.get('/api/wb-issues').get_json()
    assert set(d['help']) == set(d['kinds']) and all(d['help'].values())


def test_wb_issue_links_to_exactly_its_rows_in_editor(client, app):
    (_sid, _name, code), = _chery_stations(app, 1)
    _wb_row(client, 94060, 94061, code)                      # G.94060 нет в Перечне → строка Сверки
    _wb_row(client, 94062, 94063, code)                      # другая проблема — в фильтр не попадёт
    it = _issue(client, 'g_not_in_directory', g_num=94060)
    doc = wb_doc(client, 'A13T')
    assert it['targets'] == [{'doc': doc, 'title': it['targets'][0]['title'], 'n': 1}]
    assert it['cluster'] == f'A13T · {code}'                 # группа: модель · станция WB
    total, rows = _doc_rows(client, doc, it['id'])
    assert total == 1 and rows[0]['spot_number'] == '94061'
    other = _issue(client, 'g_not_in_directory', g_num=94062)
    assert _doc_rows(client, doc, f"{it['id']},{other['id']}")[0] == 2       # ссылка группы — объединение
    assert _doc_rows(client, doc, '99999999')[0] == 0         # проблема ушла — строк нет
    assert _doc_rows(client, doc, 'abc')[0] == 0              # мусор в ссылке — ничего лишнего не показываем
    assert _doc_rows(client, 'equipment', it['id'])[0] == 0  # в Перечне этой проблемы нет


def test_register_issue_links_to_register_row(client, app):
    paste(client, ('G.94070', 'AC пистолет', 'T', None, 'Chery', 'Линия 1', 'НЕПОНЯТНО', 'ОТО', 'A'))
    it = _issue(client, 'register_no_station', g_num=94070)
    assert it['cluster'] == 'Перечень · Chery · Линия 1'
    assert [t['doc'] for t in it['targets']] == ['equipment'] and it['targets'][0]['n'] == 1
    total, rows = _doc_rows(client, 'equipment', it['id'])
    assert total == 1 and rows[0]['item_code'] == 'G.94070'


def test_gun_without_rows_has_no_editor_link_but_passport(client):
    gid = _gun(client, 94075)                                # только в справочнике: ни Перечня, ни WB
    it = _issue(client, 'gun_not_in_wb', gun_id=gid)
    assert it['targets'] == [] and it['cluster'] == 'Справочник пистолетов · в Перечне строки нет'


def test_bulk_update_group(register_client, client, app):
    g1, g2 = _gun(client, 94080), _gun(client, 94081)
    ito = register_client(department='ИТО', surname='Групповой')
    d = ito.get('/api/wb-issues').get_json()
    eng = next(e for e in d['engineers'] if e['name'].startswith('Групповой'))
    ids = [_issue_id(app, g1), _issue_id(app, g2)]
    r = ito.put('/api/wb-issues/bulk', json={'ids': ids, 'status': 'in_review', 'assignee_id': eng['UniqueID']})
    assert r.status_code == 200 and r.get_json()['updated'] == 2, r.get_json()
    got = {i['id']: (i['status'], i['assignee_id']) for i in ito.get('/api/wb-issues').get_json()['issues']}
    assert got[ids[0]] == got[ids[1]] == ('in_review', eng['UniqueID'])
    assert ito.put('/api/wb-issues/bulk', json={'ids': ids, 'assignee_id': None}).status_code == 200   # снять
    assert ito.put('/api/wb-issues/bulk', json={'ids': ids, 'status': 'resolved'}).status_code == 400
    assert ito.put('/api/wb-issues/bulk', json={'ids': [], 'status': 'new'}).status_code == 400
    assert ito.put('/api/wb-issues/bulk', json={'ids': ids}).status_code == 400
    assert register_client(department='ОТК').put('/api/wb-issues/bulk',
                                                 json={'ids': ids, 'status': 'new'}).status_code == 403
