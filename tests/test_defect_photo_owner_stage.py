"""Фото дефекта ложится на шаг ТОГО, КТО ЕГО СНЯЛ, а не на этап, где сейчас дефект.

Баг: фото регистрации сохранялось уже после входа дефекта в цепочку и показывалось так,
будто его сняло Производство; снимок УЗК при повторе на согласовании закрытия попадал на этап
отдела, который отправил дефект на закрытие. Теперь:
- регистрация (и каждый повтор серии) → фото у своего выявления (шаг УЗК);
- из карточки: открыт этап отдела загрузившего → этот этап; УЗК вне своего этапа → последнее
  выявление; WeldTeam/админ (аварийный клапан) → текущий открытый этап.
"""
import io
import sqlite3


def _png(name='p.png'):
    return (io.BytesIO(b'\x89PNG\r\n\x1a\nx'), name)


def _upload(c, did):
    return c.post(f'/api/defects/{did}/photo', data={'photo': _png()}, content_type='multipart/form-data')


def _act(c, did, action, **extra):
    c.post(f'/api/defects/{did}/act', json={'action': 'claim'})
    return c.post(f'/api/defects/{did}/act', json={'action': action, **extra})


def _detail(c, did):
    return c.get(f'/api/defects/{did}').get_json()


def _stage(det, dept, open_=None):
    """Последний этап отдела (open_=True — только открытый)."""
    rows = [s for s in det['stages'] if s['dept'] == dept and (open_ is None or (not s['left_at']) == open_)]
    return rows[-1]


def _free_spot(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    try:
        return db.execute("""SELECT model_id, spot_number FROM spot
                             WHERE UniqueID NOT IN (SELECT spot_id FROM defects WHERE spot_id IS NOT NULL)
                               AND model_id IS NOT NULL AND COALESCE(spot_number,'') <> ''
                             LIMIT 1""").fetchone()
    finally:
        db.close()


def _reg_spot(c, model_id, num, code, photo=False):
    data = {'model_id': str(model_id), 'spot_number': str(num), 'problem_code': code}
    if photo:
        data['photo'] = _png('reg.png')
        return c.post('/api/defects/register', data=data, content_type='multipart/form-data').get_json()
    return c.post('/api/defects/register', json=data).get_json()


def test_registration_photo_belongs_to_occurrence_not_production(register_client):
    otk = register_client(department='ОТК')
    j = otk.post('/api/defects/register_manual', data={'g_num': '91001', 'problem_code': 'CR', 'photo': _png()},
                 content_type='multipart/form-data').get_json()
    det = _detail(otk, j['defect_id'])
    ph = det['photos'][0]
    assert ph['occurrence_id'] == det['occurrences'][0]['id']     # у выявления УЗК
    assert ph['stage_id'] is None and ph['stage_dept'] == 'ОТК'   # не на этапе Производства
    assert ph['by']                                               # кто снял — виден в карточке


def test_card_upload_goes_to_uploaders_own_step(register_client):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='po_prod@x.kz')
    ito = register_client(department='ИТО', login='po_ito@x.kz')
    did = otk.post('/api/defects/register_manual', json={'g_num': 91010, 'problem_code': 'CR'}).get_json()['defect_id']
    det = _detail(prod, did)
    prod_stage = _stage(det, 'Производство', open_=True)['stage_id']
    occ_id = det['occurrences'][0]['id']

    # куда ляжет фото — сервер говорит заранее (кнопка в карточке — там же)
    assert det['photo_target'] == {'stage_id': prod_stage, 'occurrence_id': None}
    assert _detail(otk, did)['photo_target'] == {'stage_id': None, 'occurrence_id': occ_id}
    assert _detail(ito, did)['photo_target'] is None              # не его этап — добавлять нельзя
    assert _upload(ito, did).status_code == 403

    assert _upload(prod, did).get_json()['status'] == 'success'
    assert _upload(otk, did).get_json()['status'] == 'success'    # УЗК досылает снимок, пока дефект у Производства
    p_prod, p_otk = _detail(otk, did)['photos']
    assert (p_prod['stage_id'], p_prod['stage_dept'], p_prod['occurrence_id']) == (prod_stage, 'Производство', None)
    assert (p_otk['stage_id'], p_otk['stage_dept'], p_otk['occurrence_id']) == (None, 'ОТК', occ_id)


def test_otk_photo_at_closing_goes_to_otk_stage_not_closer(register_client):
    """УЗК на согласовании закрытия: фото — на этап УЗК, а не на этап отдела, что закрыл."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='pc_prod@x.kz')
    did = otk.post('/api/defects/register_manual', json={'g_num': 91020, 'problem_code': 'CR'}).get_json()['defect_id']
    assert _act(prod, did, 'close', countermeasure='подтянули', vin='X').get_json()['status'] == 'success'
    otk_stage = _stage(_detail(otk, did), 'ОТК', open_=True)['stage_id']
    assert _detail(otk, did)['photo_target'] == {'stage_id': otk_stage, 'occurrence_id': None}
    assert _upload(otk, did).get_json()['status'] == 'success'
    assert _act(otk, did, 'otk_approve').get_json()['status'] == 'success'
    ph = _detail(otk, did)['photos'][0]
    assert (ph['stage_id'], ph['stage_dept']) == (otk_stage, 'ОТК')


def test_reject_photo_lands_on_otk_stage_and_stays_there(register_client):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='pr_prod@x.kz')
    did = otk.post('/api/defects/register_manual', json={'g_num': 91030, 'problem_code': 'CR'}).get_json()['defect_id']
    _act(prod, did, 'close', countermeasure='m', vin='X')
    _upload(otk, did)
    assert _act(otk, did, 'otk_reject', reason='точка не держит').get_json()['status'] == 'success'
    det = _detail(otk, did)
    ph = det['photos'][0]
    assert ph['stage_id'] == _stage(det, 'ОТК')['stage_id']                    # на этапе «не согласовано»
    assert ph['stage_id'] != _stage(det, 'Производство', open_=True)['stage_id']  # не у получившего возврат


def test_series_repeat_photo_on_pending_otk_goes_to_new_occurrence(register_client, app):
    """Повтор на точке, пока закрытие ждёт УЗК: дефект возвращается закрывшему отделу, а фото
    повтора — у нового выявления, а не на этапе этого отдела."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='ps_prod@x.kz')
    model_id, num = _free_spot(app)
    did = _reg_spot(otk, model_id, num, 'BT')['defect_id']
    _act(prod, did, 'close', countermeasure='m', vin='X')
    r = _reg_spot(otk, model_id, num, 'LP', photo=True)
    assert r['status'] == 'success' and r['serial'] and r['defect_id'] == did
    det = _detail(otk, did)
    assert det['defect']['current_stage_dept'] == 'Производство'
    ph = det['photos'][0]
    assert ph['occurrence_id'] == det['occurrences'][1]['id']          # второе выявление
    assert ph['stage_id'] is None and ph['stage_dept'] == 'ОТК'
    assert ph['can_delete'] is True                                    # автор может убрать, пока отдел не взялся


def test_series_merge_photo_goes_to_new_occurrence(register_client, app):
    otk = register_client(department='ОТК')
    model_id, num = _free_spot(app)
    did = _reg_spot(otk, model_id, num, 'BT')['defect_id']
    r = _reg_spot(otk, model_id, num, 'LP', photo=True)                 # дефект ещё у Производства — долит
    assert r['defect_id'] == did
    det = _detail(otk, did)
    assert det['photos'][0]['occurrence_id'] == det['occurrences'][1]['id']


def test_registration_photo_frozen_once_defect_moves_on(register_client):
    """Автор удаляет своё фото выявления, пока следующий отдел не закрыл свой этап."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='pf_prod@x.kz')
    mk = lambda g: otk.post('/api/defects/register_manual',  # noqa: E731
                            data={'g_num': g, 'problem_code': 'CR', 'photo': _png()},
                            content_type='multipart/form-data').get_json()['defect_id']
    did = mk('91040')
    pid = _detail(otk, did)['photos'][0]['UniqueID']
    assert _detail(prod, did)['photos'][0]['can_delete'] is False                 # получатель не автор
    assert prod.delete(f'/api/defects/{did}/photo/{pid}').status_code == 403
    assert _detail(otk, did)['photos'][0]['can_delete'] is True
    assert otk.delete(f'/api/defects/{did}/photo/{pid}').get_json()['status'] == 'success'

    did2 = mk('91041')
    pid2 = _detail(otk, did2)['photos'][0]['UniqueID']
    _act(prod, did2, 'pass', note='не наше')                                       # дефект ушёл дальше
    assert _detail(otk, did2)['photos'][0]['can_delete'] is False
    assert otk.delete(f'/api/defects/{did2}/photo/{pid2}').status_code == 403


def test_weldteam_valve_photo_goes_to_current_open_stage(register_client):
    otk = register_client(department='ОТК')
    wt = register_client(department='WeldTeam', login='pv_wt@x.kz')
    did = otk.post('/api/defects/register_manual', json={'g_num': 91050, 'problem_code': 'CR'}).get_json()['defect_id']
    assert _upload(wt, did).get_json()['status'] == 'success'
    det = _detail(otk, did)
    assert det['photos'][0]['stage_id'] == _stage(det, 'Производство', open_=True)['stage_id']


def test_occurrence_photo_column_comes_from_migration(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    try:
        cols = {r[1] for r in db.execute('PRAGMA table_info(defect_photo)')}
        idx = {r[1] for r in db.execute('PRAGMA index_list(defect_photo)')}
    finally:
        db.close()
    assert {'occurrence_id', 'taken_at_stage_id'} <= cols and 'ix_defect_photo_occurrence' in idx
