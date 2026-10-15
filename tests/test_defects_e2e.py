"""Сквозной прогон процесса дефектов 4M через HTTP как разные отделы — все варианты
взаимодействия: цепочка, права по этапу, закрытие, передача, возврат, ОТО, EO/MN-маршрут,
не выявленные, серийность, переоткрытие, фото, приоритет доски, аналитика."""
import io
import sqlite3


def _clients(register_client):
    mk = lambda dep, lg: register_client(department=dep, login=lg)  # noqa: E731
    return {
        'otk':  mk('ОТК', 'e2e_otk@x.kz'),
        'prod': mk('Производство', 'e2e_prod@x.kz'),
        'wt':   mk('WeldTeam', 'e2e_wt@x.kz'),
        'ito':  mk('ИТО', 'e2e_ito@x.kz'),
        'oto':  mk('ОТО', 'e2e_oto@x.kz'),
    }


def _b_spot(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    return db.execute("""SELECT s.spot_number, s.model_id FROM spot s
        JOIN welding_setup ws ON ws.spot_id=s.UniqueID AND ws.is_active=1
        WHERE EXISTS(SELECT 1 FROM weld_point wp WHERE wp.spot_id=s.UniqueID AND wp.important='B')
        LIMIT 1""").fetchone()


def _reg_gun(c, g, code='CR'):
    return c.post('/api/defects/register_manual', json={'g_num': g, 'problem_code': code}).get_json()


def _reg_spot(c, model_id, spot, code='CR'):
    return c.post('/api/defects/register', json={'model_id': model_id, 'spot_number': str(spot),
                                                  'problem_code': code}).get_json()


def _act(c, did, action, **kw):
    return c.post(f'/api/defects/{did}/act', json={'action': action, **kw})


# ── 1. Полная цепочка + права по этапу на каждом шаге ────────────────────────
def test_e2e_full_chain_and_stage_rbac(register_client):
    u = _clients(register_client)
    # регистрировать может только ОТК
    assert u['prod'].post('/api/defects/register_manual', json={'g_num': 80001, 'problem_code': 'CR'}).status_code == 403
    r = _reg_gun(u['otk'], 80001)
    did = r['defect_id']
    assert r['stage'] == 'Производство'

    # этап Производство: ИТО/WeldTeam(не их этап, но WT привилегирован)/ОТО
    assert _act(u['ito'], did, 'close', countermeasure='x').status_code == 403      # не их этап
    assert _act(u['oto'], did, 'pass').status_code == 403
    # Производство передаёт дальше → WeldTeam
    assert _act(u['prod'], did, 'pass').get_json()['message'].find('WeldTeam') >= 0
    # теперь Производство уже не на этапе
    assert _act(u['prod'], did, 'pass').status_code == 403
    # WeldTeam закрывает (нужна контрмера)
    assert _act(u['wt'], did, 'close').status_code == 400
    assert _act(u['wt'], did, 'close', cause='перегрев', countermeasure='снизили ток').get_json()['status'] == 'success'
    # закрытый — в закрытых
    assert any(d['UniqueID'] == did for d in u['otk'].get('/api/defects/all').get_json()['closed'])


# ── 2. Возврат (bounce) + передача в ОТО и возврат отправителю ──────────────
def test_e2e_bounce_and_oto(register_client):
    u = _clients(register_client)
    did = _reg_gun(u['otk'], 80002)['defect_id']
    _act(u['prod'], did, 'pass')                                   # → WeldTeam
    # WeldTeam возвращает Производству
    assert _act(u['wt'], did, 'bounce', to_dept='Производство', reason='уточнить оператора').get_json()['status'] == 'success'
    det = u['otk'].get(f'/api/defects/{did}').get_json()
    assert det['defect']['current_stage_dept'] == 'Производство' and det['defect']['return_count'] == 1
    # Производство передаёт в ОТО (оборудование)
    assert _act(u['prod'], did, 'delegate_oto', reason='несоосность клещей').get_json()['status'] == 'success'
    # ОТО действует; чужой отдел по ОТО-этапу — нет
    assert _act(u['ito'], did, 'oto', countermeasure='x').status_code == 403
    assert _act(u['oto'], did, 'oto', countermeasure='отрегулировали ось').get_json()['message'].find('Производство') >= 0
    # вернулось отправителю (Производство) — оно закрывает
    assert _act(u['prod'], did, 'close', cause='ось', countermeasure='ок').get_json()['status'] == 'success'


# ── 3. Маршрут EO (WeldTeam пропущен) + «не выявлено» в конце цепочки ────────
def test_e2e_eo_route_and_unresolved(register_client):
    u = _clients(register_client)
    did = _reg_gun(u['otk'], 80003, code='EO')['defect_id']        # EO: Производство → ИТО
    # WeldTeam не в цепочке; Производство передаёт → ИТО (не WeldTeam)
    assert _act(u['prod'], did, 'pass').get_json()['message'].find('ИТО') >= 0
    # ИТО не выявил → конец цепочки → «не выявлен»
    assert _act(u['ito'], did, 'pass').get_json()['message'].lower().find('не выявл') >= 0
    assert any(d['UniqueID'] == did for d in u['otk'].get('/api/defects/all').get_json()['unresolved'])


# ── 4. Серийность (та же группа) + переоткрытие только WeldTeam ──────────────
def test_e2e_serial_and_reopen(register_client, app):
    bs = _b_spot(app)
    if not bs:
        return
    spot, model_id = bs
    u = _clients(register_client)
    r1 = _reg_spot(u['otk'], model_id, spot, code='CR')
    did = r1['defect_id']
    # Производство закрывает
    assert _act(u['prod'], did, 'close', cause='x', countermeasure='y').get_json()['status'] == 'success'
    # повтор на той же точке той же группой (LP) → серийный, переоткрытие того же дефекта
    r2 = _reg_spot(u['otk'], model_id, spot, code='LP')
    assert r2['serial'] is True and r2['defect_id'] == did
    board = u['otk'].get('/api/defects/all').get_json()
    row = next(d for d in board['open'] if d['UniqueID'] == did)
    assert row['is_serial'] == 1 and row['is_b_point'] == 1        # серийный И точка B
    # первым в списке должна идти точка B
    assert board['open'][0]['is_b_point'] == 1

    # закрыть и переоткрыть: только WeldTeam
    _act(u['prod'], did, 'close', cause='x', countermeasure='y')
    assert _act(u['ito'], did, 'reopen').status_code == 403
    assert _act(u['wt'], did, 'reopen').get_json()['status'] == 'success'


# ── 5. Фото: загрузка (сжатый JPEG), счётчик, отдача ────────────────────────
def test_e2e_photo(register_client):
    u = _clients(register_client)
    did = _reg_gun(u['otk'], 80005)['defect_id']
    png = b'\x89PNG\r\n\x1a\n' + b'0' * 64
    r = u['otk'].post(f'/api/defects/{did}/photo',
                      data={'photo': (io.BytesIO(png), 'd.png')}, content_type='multipart/form-data')
    assert r.get_json()['status'] == 'success'
    det = u['otk'].get(f'/api/defects/{did}').get_json()
    assert len(det['photos']) == 1
    pid = det['photos'][0]['UniqueID']
    assert u['prod'].get(f'/api/defects/photo/{pid}').status_code == 200       # видно другим отделам
    board = u['otk'].get('/api/defects/all').get_json()
    assert next(d for d in board['open'] if d['UniqueID'] == did)['photo_count'] == 1


# ── 6. Аналитика процесса отражает активность ───────────────────────────────
def test_e2e_process_analytics(register_client):
    u = _clients(register_client)
    did = _reg_gun(u['otk'], 80006)['defect_id']
    _act(u['prod'], did, 'pass')                                   # Производство прошло
    _act(u['wt'], did, 'close', cause='c', countermeasure='m')     # WeldTeam закрыл
    res = u['otk'].get('/api/analytics/process?date_from=2000-01-01&date_to=2100-01-01').get_json()
    depts = {x['dept']: x for x in res['by_dept']}
    assert depts['WeldTeam']['closed'] >= 1 and depts['Производство']['stages_done'] >= 1
    assert 'serial' in res and 'returns_total' in res and 'unresolved' in res
