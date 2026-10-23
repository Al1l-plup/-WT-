"""API процесса дефектов 4M: регистрация→цепочка, действия этапа, ОТО, RBAC, фото."""
import io
import sqlite3


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
    # кросс-процесс требует комментарий: pass без note → 400
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'pass'}).status_code == 400
    # Производство (текущий этап) передаёт дальше (с комментарием) → WeldTeam
    r = prod.post(f'/api/defects/{did}/act', json={'action': 'pass', 'note': 'параметры в норме'}).get_json()
    assert r['status'] == 'success' and 'WeldTeam' in r['message']
    # теперь Производство не на этапе → 403
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'close', 'countermeasure': 'x'}).status_code == 403
    # закрытие требует контрмеру
    assert wt.post(f'/api/defects/{did}/act', json={'action': 'close'}).status_code == 400
    # WeldTeam закрывает (с VIN) → на согласование ОТК (pending_otk)
    assert wt.post(f'/api/defects/{did}/act',
                   json={'action': 'close', 'cause': 'c', 'countermeasure': 'm', 'vin': 'XW8Z0001'}).get_json()['status'] == 'success'
    # ОТК согласует закрытие → закрыто окончательно
    assert otk.post(f'/api/defects/{did}/act', json={'action': 'otk_approve'}).get_json()['status'] == 'success'
    # переоткрывать может только WeldTeam, и тоже с комментарием
    assert ito.post(f'/api/defects/{did}/act', json={'action': 'reopen'}).status_code == 403
    assert wt.post(f'/api/defects/{did}/act', json={'action': 'reopen'}).status_code == 400
    assert wt.post(f'/api/defects/{did}/act',
                   json={'action': 'reopen', 'reason': 'повтор'}).get_json()['status'] == 'success'


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


def test_cross_process_actions_require_comment(register_client):
    """Любое кросс-процессное действие требует комментарий: pass / bounce / delegate_oto / reopen.
    Комментарий сохраняется в этапе (виден в таймлайне)."""
    otk = register_client(department='ОТК')
    did = _reg(otk, 70070)['defect_id']
    prod = register_client(department='Производство', login='cc_prod@x.kz')
    wt = register_client(department='WeldTeam', login='cc_wt@x.kz')
    # bounce без комментария (отдел выбран) → 400
    assert prod.post(f'/api/defects/{did}/act',
                     json={'action': 'bounce', 'to_dept': 'Производство'}).status_code == 400
    # delegate_oto без комментария → 400
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'delegate_oto'}).status_code == 400
    # pass без комментария → 400, с комментарием → успех
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'pass'}).status_code == 400
    assert prod.post(f'/api/defects/{did}/act',
                     json={'action': 'pass', 'note': 'оператор ок'}).get_json()['status'] == 'success'
    # закрыли на WeldTeam (с VIN) → pending_otk; ОТК согласует → closed
    wt.post(f'/api/defects/{did}/act', json={'action': 'close', 'countermeasure': 'm', 'vin': 'V1'})
    otk.post(f'/api/defects/{did}/act', json={'action': 'otk_approve'})
    assert wt.post(f'/api/defects/{did}/act', json={'action': 'reopen'}).status_code == 400
    assert wt.post(f'/api/defects/{did}/act',
                   json={'action': 'reopen', 'reason': 'повтор на линии'}).get_json()['status'] == 'success'
    # комментарии осели в истории этапов
    det = wt.get(f'/api/defects/{did}').get_json()
    assert any((s.get('note') or '').strip() for s in det['stages'])


def test_close_requires_vin_and_otk_approval(register_client):
    """Закрытие требует VIN и уходит на согласование ОТК; ОТК согласует → closed,
    не согласует → возврат отделу, который закрывал (+возврат в счётчик)."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='vin_prod@x.kz')
    # ── ветка «ОТК согласовал» ── (VIN принимается; требование VIN по станции см. test_defect_station_vin)
    did = _reg(otk, 70080)['defect_id']
    assert prod.post(f'/api/defects/{did}/act',
                     json={'action': 'close', 'countermeasure': 'm', 'vin': 'XW8ABC1234'}).get_json()['status'] == 'success'
    det = otk.get(f'/api/defects/{did}').get_json()
    assert det['defect']['status'] == 'pending_otk' and det['defect']['current_stage_dept'] == 'ОТК'
    assert det['defect']['vin'] == 'XW8ABC1234'
    board = otk.get('/api/defects/all').get_json()
    assert any(d['UniqueID'] == did for d in board['open'])            # в открытых, ещё не в закрытых
    assert not any(d['UniqueID'] == did for d in board['closed'])
    assert next(d for d in board['open'] if d['UniqueID'] == did)['mine'] is True   # во входящих у ОТК
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'otk_approve'}).status_code == 403  # не ОТК
    assert otk.post(f'/api/defects/{did}/act', json={'action': 'otk_approve'}).get_json()['status'] == 'success'
    assert any(d['UniqueID'] == did for d in otk.get('/api/defects/all').get_json()['closed'])

    # ── ветка «ОТК не согласовал» → возврат закрывшему ──
    did2 = _reg(otk, 70081)['defect_id']
    prod.post(f'/api/defects/{did2}/act', json={'action': 'close', 'countermeasure': 'm', 'vin': 'Z'})
    assert otk.post(f'/api/defects/{did2}/act', json={'action': 'otk_reject'}).status_code == 400   # нужен комментарий
    # при reject обязательно фото — приложим (попадёт на этап ОТК)
    otk.post(f'/api/defects/{did2}/photo',
             data={'photo': (io.BytesIO(b'\x89PNG\r\n\x1a\nx'), 'r.png')}, content_type='multipart/form-data')
    r = otk.post(f'/api/defects/{did2}/act', json={'action': 'otk_reject', 'reason': 'точка дефектная'}).get_json()
    assert r['status'] == 'success' and 'Производство' in r['message']
    det2 = prod.get(f'/api/defects/{did2}').get_json()
    assert det2['defect']['status'] == 'in_review' and det2['defect']['current_stage_dept'] == 'Производство'
    assert det2['defect']['return_count'] == 1


def test_otk_reject_requires_photo(register_client):
    """ОТК при «не согласовано» обязан приложить фото (+ комментарий)."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='rp_prod@x.kz')
    did = _reg(otk, 70090)['defect_id']
    assert prod.post(f'/api/defects/{did}/act',
                     json={'action': 'close', 'countermeasure': 'ок', 'vin': 'X'}).get_json()['status'] == 'success'
    # reject без фото → 400 (комментарий есть, фото нет)
    assert otk.post(f'/api/defects/{did}/act',
                    json={'action': 'otk_reject', 'reason': 'точка не держит'}).status_code == 400
    # приложить фото (попадёт на этап ОТК) → reject проходит
    otk.post(f'/api/defects/{did}/photo',
             data={'photo': (io.BytesIO(b'\x89PNG\r\n\x1a\nx'), 'r.png')}, content_type='multipart/form-data')
    assert otk.post(f'/api/defects/{did}/act',
                    json={'action': 'otk_reject', 'reason': 'точка не держит'}).get_json()['status'] == 'success'


def test_otk_reject_photo_flag_off(register_client, app):
    """Флаг require_reject_photo='0' (правится в Редакторе) → фото при reject не требуется."""
    c = sqlite3.connect(app.config['DB_PATH'])
    c.execute("UPDATE defect_config SET value='0' WHERE key='require_reject_photo'")
    c.commit()
    c.close()
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='rpf_prod@x.kz')
    did = _reg(otk, 70091)['defect_id']
    prod.post(f'/api/defects/{did}/act', json={'action': 'close', 'countermeasure': 'ок', 'vin': 'X'})
    assert otk.post(f'/api/defects/{did}/act',
                    json={'action': 'otk_reject', 'reason': 'x'}).get_json()['status'] == 'success'   # без фото ок


def test_pass_to_unresolved(register_client):
    otk = register_client(department='ОТК')
    did = _reg(otk, 70040)['defect_id']
    prod = register_client(department='Производство', login='un_prod@x.kz')
    wt = register_client(department='WeldTeam', login='un_wt@x.kz')
    ito = register_client(department='ИТО', login='un_ito@x.kz')
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'pass', 'note': 'не оператор'}).get_json()['status'] == 'success'  # →WeldTeam
    assert wt.post(f'/api/defects/{did}/act', json={'action': 'pass', 'note': 'параметры ок'}).get_json()['status'] == 'success'   # →ИТО
    r = ito.post(f'/api/defects/{did}/act', json={'action': 'pass', 'note': 'причина не найдена'}).get_json()                       # конец цепочки
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


def test_photo_required_on_registration(app):
    """При require_defect_photo='1' (из defect_config, правится в Редакторе) регистрация без
    фото отклоняется (400); с фото (multipart) — проходит и фото прикрепляется."""
    db = sqlite3.connect(app.config['DB_PATH'])
    db.execute("INSERT OR REPLACE INTO defect_config (key, value) VALUES ('require_defect_photo', '1')")
    db.commit()
    db.close()
    c = app.test_client()
    c.post('/register', data={'surname': 'Ф', 'name': 'О', 'department': 'ОТК',
                              'login': 'photoreq@x.kz', 'password': 'test1234', 'password2': 'test1234'})
    # без фото → 400
    r = c.post('/api/defects/register_manual', json={'g_num': 70900, 'problem_code': 'CR'})
    assert r.status_code == 400 and 'фото' in r.get_json()['message'].lower()
    # с фото (multipart) → успех + фото в карточке
    data = {'g_num': '70900', 'problem_code': 'CR', 'photo': (io.BytesIO(b'\x89PNG\r\n\x1a\nx'), 'd.png')}
    j = c.post('/api/defects/register_manual', data=data, content_type='multipart/form-data').get_json()
    assert j['status'] == 'success'
    assert len(c.get(f"/api/defects/{j['defect_id']}").get_json()['photos']) == 1


def test_registration_sets_created_at(client):
    """Время поступления дефекта фиксируется (created_at — ISO datetime со временем)."""
    did = client.post('/api/defects/register_manual',
                      json={'g_num': 70950, 'problem_code': 'CR'}).get_json()['defect_id']
    ca = client.get(f'/api/defects/{did}').get_json()['defect']['created_at']
    assert ca and 'T' in ca   # не только дата, но и время


def test_board_no_duplicate_on_multi_assignment(client, app):
    """Дефект на гане с НЕСКОЛЬКИМИ активными назначениями трансформатора не должен
    дублироваться в доске (регрессия: джойн gun→трансформатор→станция размножал строки)."""
    db = sqlite3.connect(app.config['DB_PATH'])
    gun_id, gnum = db.execute('SELECT UniqueID, g_num FROM gun LIMIT 1').fetchone()
    trans = [r[0] for r in db.execute('SELECT UniqueID FROM trans LIMIT 2').fetchall()]
    if len(trans) < 2:
        return
    for t in trans:   # два активных назначения этому гану → раньше дефект дублировался
        db.execute("""INSERT INTO gun_transformer_assignment
            (start_date, end_date, is_active, comments, gun_id, transformer_id)
            VALUES (date('now'), NULL, 1, '', ?, ?)""", (gun_id, t))
    db.commit()
    did = client.post('/api/defects/register_manual',
                      json={'g_num': gnum, 'problem_code': 'CR'}).get_json()['defect_id']
    board = client.get('/api/defects/all').get_json()
    assert sum(1 for d in board['open'] if d['UniqueID'] == did) == 1   # ровно один раз


def test_board_mine_flag_and_priority(register_client, app):
    otk = register_client(department='ОТК')
    _reg(otk, 70060)   # встаёт на Производство
    prod = register_client(department='Производство', login='mine_prod@x.kz')
    board = prod.get('/api/defects/all').get_json()
    assert board['my_dept'] == 'Производство'
    mine = [d for d in board['open'] if d['mine']]
    assert mine and all(d['current_stage_dept'] == 'Производство' for d in mine)
