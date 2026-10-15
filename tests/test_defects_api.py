"""API процесса дефектов 4M: регистрация→цепочка, действия этапа, ОТО, RBAC, фото."""
import io


def _reg(otk, g_num, code='CR'):
    return otk.post('/api/defects/register_manual', json={'g_num': g_num, 'problem_code': code}).get_json()


def test_register_enters_chain_otk_only(register_client):
    otk = register_client(department='ОТК')
    r = _reg(otk, 70001)
    assert r['status'] == 'success' and r['stage'] == 'Производство' and r['defect_id']
    # ИТО/Производство регистрировать не могут — это ОТК
    for dep in ('ИТО', 'Производство'):
        c = register_client(department=dep, login=f'reg_{dep}@x.kz')
        assert c.post('/api/defects/register_manual', json={'g_num': 70002, 'problem_code': 'CR'}).status_code == 403


def test_stage_flow_and_rbac(register_client):
    otk = register_client(department='ОТК')
    did = _reg(otk, 70010)['defect_id']
    ito = register_client(department='ИТО', login='flow_ito@x.kz')
    prod = register_client(department='Производство', login='flow_prod@x.kz')
    wt = register_client(department='WeldTeam', login='flow_wt@x.kz')

    # не на этапе ИТО → 403
    assert ito.post(f'/api/defects/{did}/act', json={'action': 'close', 'countermeasure': 'x'}).status_code == 403
    # Производство (текущий этап) передаёт дальше → WeldTeam
    r = prod.post(f'/api/defects/{did}/act', json={'action': 'pass'}).get_json()
    assert r['status'] == 'success' and 'WeldTeam' in r['message']
    # теперь Производство не на этапе → 403
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'close', 'countermeasure': 'x'}).status_code == 403
    # закрытие требует контрмеру
    assert wt.post(f'/api/defects/{did}/act', json={'action': 'close'}).status_code == 400
    # WeldTeam закрывает
    assert wt.post(f'/api/defects/{did}/act',
                   json={'action': 'close', 'cause': 'c', 'countermeasure': 'm'}).get_json()['status'] == 'success'
    # переоткрывать может только WeldTeam
    assert ito.post(f'/api/defects/{did}/act', json={'action': 'reopen'}).status_code == 403
    assert wt.post(f'/api/defects/{did}/act', json={'action': 'reopen'}).get_json()['status'] == 'success'


def test_oto_delegation_api(register_client):
    otk = register_client(department='ОТК')
    did = _reg(otk, 70020)['defect_id']
    prod = register_client(department='Производство', login='oto_prod@x.kz')
    oto = register_client(department='ОТО', login='oto_oto@x.kz')
    assert prod.post(f'/api/defects/{did}/act',
                     json={'action': 'delegate_oto', 'reason': 'несоосность'}).get_json()['status'] == 'success'
    r = oto.post(f'/api/defects/{did}/act',
                 json={'action': 'oto', 'countermeasure': 'отрегулировали ось'}).get_json()
    assert r['status'] == 'success' and 'Производство' in r['message']


def test_pass_to_unresolved(register_client):
    otk = register_client(department='ОТК')
    did = _reg(otk, 70040)['defect_id']
    prod = register_client(department='Производство', login='un_prod@x.kz')
    wt = register_client(department='WeldTeam', login='un_wt@x.kz')
    ito = register_client(department='ИТО', login='un_ito@x.kz')
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'pass'}).get_json()['status'] == 'success'  # →WeldTeam
    assert wt.post(f'/api/defects/{did}/act', json={'action': 'pass'}).get_json()['status'] == 'success'     # →ИТО
    r = ito.post(f'/api/defects/{did}/act', json={'action': 'pass'}).get_json()                               # конец цепочки
    assert r['status'] == 'success' and 'не выявлен' in r['message'].lower()
    # попал в список «не выявленные»
    board = otk.get('/api/defects/all').get_json()
    assert any(d['UniqueID'] == did for d in board['unresolved'])


def test_detail_and_photo(register_client):
    otk = register_client(department='ОТК')
    did = _reg(otk, 70050)['defect_id']
    # фото (картинка) грузит ОТК
    data = {'photo': (io.BytesIO(b'\x89PNG\r\n\x1a\nfake'), 'defect.png')}
    r = otk.post(f'/api/defects/{did}/photo', data=data, content_type='multipart/form-data').get_json()
    assert r['status'] == 'success'
    # не-изображение отклоняется
    bad = {'photo': (io.BytesIO(b'xx'), 'note.txt')}
    assert otk.post(f'/api/defects/{did}/photo', data=bad,
                    content_type='multipart/form-data').status_code == 400
    # карточка: этап Производство в истории + 1 фото
    det = otk.get(f'/api/defects/{did}').get_json()
    assert det['status'] == 'success'
    assert det['defect']['current_stage_dept'] == 'Производство'
    assert any(s['dept'] == 'Производство' and s['left_at'] is None for s in det['stages'])
    assert len(det['photos']) == 1
    pid = det['photos'][0]['UniqueID']
    assert otk.get(f'/api/defects/photo/{pid}').status_code == 200


def test_board_mine_flag_and_priority(register_client, app):
    otk = register_client(department='ОТК')
    _reg(otk, 70060)   # встаёт на Производство
    prod = register_client(department='Производство', login='mine_prod@x.kz')
    board = prod.get('/api/defects/all').get_json()
    assert board['my_dept'] == 'Производство'
    mine = [d for d in board['open'] if d['mine']]
    assert mine and all(d['current_stage_dept'] == 'Производство' for d in mine)
