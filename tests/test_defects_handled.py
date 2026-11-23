"""Вкладка «Отработанные мной»: каждый видит дефекты, с которыми он что-то сделал.

Сервер отдаёт в каждой строке доски acts — действия ТЕКУЩЕГО сотрудника: на этапах (закрыл,
передал дальше, вернул, в ОТО, контрмера ОТО, согласовал / не согласовал закрытие) и
регистрации. Закрытые, отработанные за период, но не попавшие в список «Закрытые» (там 50
последних), приходят в handled_extra.
"""
import datetime
import sqlite3


def _reg(otk, g_num, code='CR'):
    return otk.post('/api/defects/register_manual', json={'g_num': g_num, 'problem_code': code}).get_json()


def _act(c, did, action, **extra):
    c.post(f'/api/defects/{did}/act', json={'action': 'claim'})
    return c.post(f'/api/defects/{did}/act', json={'action': action, **extra}).get_json()


def _board(c, qs=''):
    return c.get('/api/defects/all' + qs).get_json()


def _row(board, did):
    for key in ('open', 'unresolved', 'closed', 'handled_extra'):
        for r in board[key]:
            if r['UniqueID'] == did:
                return r
    return None


def _whats(board, did):
    r = _row(board, did)
    return [a['what'] for a in r['acts']] if r else None


def test_each_person_sees_own_actions_on_any_stage(register_client):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='h_prod@x.kz')
    wt = register_client(department='WeldTeam', login='h_wt@x.kz')
    ito = register_client(department='ИТО', login='h_ito@x.kz')
    did = _reg(otk, 92001)['defect_id']
    assert _act(prod, did, 'pass', note='не наше')['status'] == 'success'          # → WeldTeam
    assert _act(wt, did, 'close', cause='c', countermeasure='m', vin='X')['status'] == 'success'
    assert _act(otk, did, 'otk_approve')['status'] == 'success'                    # закрыт

    today = datetime.date.today().isoformat()
    assert _whats(_board(prod), did) == ['passed']
    assert _whats(_board(wt), did) == ['closed']
    assert _whats(_board(otk), did) == ['registered', 'otk_approved']           # регистрация + согласование
    assert _whats(_board(ito), did) == []                                       # ИТО ничего не делал
    assert all(a['date'] == today for a in _row(_board(otk), did)['acts'])


def test_oto_returns_and_rejection_are_counted(register_client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    db.execute("UPDATE defect_config SET value='0' WHERE key='require_reject_photo'")   # фото при отказе не нужно
    db.commit()
    db.close()
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='h2_prod@x.kz')
    oto = register_client(department='ОТО', login='h2_oto@x.kz')
    wt = register_client(department='WeldTeam', login='h2_wt@x.kz')
    did = _reg(otk, 92010)['defect_id']
    assert _act(prod, did, 'delegate_oto', reason='клещи')['status'] == 'success'
    assert _act(oto, did, 'oto', countermeasure='отрегулировали')['status'] == 'success'
    assert _act(prod, did, 'pass', note='дальше')['status'] == 'success'           # → WeldTeam
    assert _act(wt, did, 'bounce', to_dept='Производство', reason='проверьте ещё')['status'] == 'success'
    assert _act(prod, did, 'close', countermeasure='m', vin='X')['status'] == 'success'
    assert _act(otk, did, 'otk_reject', reason='не держит')['status'] == 'success'
    assert _whats(_board(prod), did) == ['to_oto', 'passed', 'closed']
    assert _whats(_board(oto), did) == ['oto_done']
    assert _whats(_board(wt), did) == ['returned']
    assert _whats(_board(otk), did) == ['registered', 'otk_rejected']


def test_system_closure_and_claim_are_not_actions(register_client, app):
    """Взять в работу — не действие; этап, закрытый системой (повтор на точке, serial_repeat),
    не считается за того, кто его открыл."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='h3_prod@x.kz')
    did = _reg(otk, 92020)['defect_id']
    prod.post(f'/api/defects/{did}/act', json={'action': 'claim'})
    assert _whats(_board(prod), did) == []
    uid = prod.get('/api/me').get_json()['uid']
    db = sqlite3.connect(app.config['DB_PATH'])
    db.execute("""INSERT INTO defect_stage (defect_id, dept, entered_at, left_at, outcome, actor_id)
                  VALUES (?, 'Производство', '2026-01-01T08:00:00', ?, 'serial_repeat', ?)""",
               (did, datetime.datetime.now().isoformat(timespec='seconds'), uid))
    db.commit()
    db.close()
    assert _whats(_board(prod), did) == []


def test_closed_handled_outside_top50_comes_in_handled_extra(register_client, app):
    """Закрытый давно зарегистрированный дефект, который я согласовал сегодня, не входит в 50
    последних закрытых — приходит отдельно, вкладку «Закрытые» не трогает."""
    otk = register_client(department='ОТК')
    uid = otk.get('/api/me').get_json()['uid']
    now = datetime.datetime.now().isoformat(timespec='seconds')
    db = sqlite3.connect(app.config['DB_PATH'])
    ins = "INSERT INTO defects (problem_code, root_cause, solution, df_date, status) VALUES ('CR','','',?,'closed')"
    occ = 'INSERT INTO defect_occurrence (defect_id, occ_date, registered_by) VALUES (?,?,NULL)'
    for _ in range(55):                                   # 55 закрытых свежее целевого
        db.execute(occ, (db.execute(ins, ('2020-01-01',)).lastrowid, '2020-01-01'))
    target = db.execute(ins, ('2000-01-01',)).lastrowid
    db.execute(occ, (target, '2000-01-01'))
    db.execute("""INSERT INTO defect_stage (defect_id, dept, entered_at, left_at, outcome, actor_id)
                  VALUES (?, 'ОТК', '2000-01-02T08:00:00', ?, 'otk_approved', ?)""", (target, now, uid))
    db.commit()
    db.close()

    b = _board(otk)
    assert target not in {r['UniqueID'] for r in b['closed']}                       # «Закрытые» как были
    assert target in {r['UniqueID'] for r in b['handled_extra']}
    assert _whats(b, target) == ['otk_approved']
    today = datetime.date.today().isoformat()
    b = _board(otk, f'?date_from={today}&date_to={today}')
    assert target in {r['UniqueID'] for r in b['handled_extra']}
    b = _board(otk, '?date_from=2001-01-01&date_to=2001-12-31')                     # в тот период — не отрабатывал
    assert target not in {r['UniqueID'] for r in b['handled_extra']}


def test_actor_index_comes_from_migration(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    try:
        idx = {r[1] for r in db.execute('PRAGMA index_list(defect_stage)')}
    finally:
        db.close()
    assert 'ix_defect_stage_actor' in idx
