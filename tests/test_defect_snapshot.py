"""Карточка дефекта хранит историю: пистолет и станция — как были в день дефекта.

Снимок (snap_*) пишется один раз при регистрации, переписывается только исправлением
ввода человеком; синхронизация WB дозаполняет пустое — пистолет на дату дефекта по
истории связок welding_setup — и пишет это в Журнал. Доска, карточка, VIN, уведомления
читают станцию только из снимка; сегодняшний WB — лишь подсказка в карточке."""
import importlib.util
import json
from pathlib import Path

from app import defect_flow as df
from app.snapshots import SNAP_CORRECTION, snap_note, snapshot_defect
from app.wb_source import (
    WB_SYNC_AUTHOR,
    fill_defects_from_wb,
    gun_on_date,
    rebuild_issues,
    record_station_history,
    run_wb_sync,
    station_on_date,
)
from tests.test_admin_docs import wb_doc
from tests.test_wb_source import _chery_stations, _db, _gun, _wb_row


def _register(otk, spot):
    r = otk.post('/api/defects/register', json={'model_id': 1, 'spot_number': str(spot), 'problem_code': 'CR'})
    assert r.get_json()['status'] == 'success', r.get_json()
    return r.get_json()['defect_id']


def _move_wb_station(client, app, spot, station_text):
    wp = _db(app).execute('SELECT id FROM weld_point WHERE spot_number=?', (str(spot),)).fetchone()[0]
    r = client.post(f'/api/admin/doc/{wb_doc(client, "A13T")}/batch', json={'changes': [
        {'op': 'update', 'field': 'wb_station', 'value': station_text, 'row_pks': {'weld_point': wp}}]})
    assert r.get_json()['status'] == 'success', r.get_json()


def _board_row(client, did):
    d = client.get('/api/defects/all').get_json()
    return next(x for k in ('open', 'unresolved', 'closed') for x in d[k] if x['UniqueID'] == did)


def test_board_and_card_read_station_only_from_snapshot(register_client, client, app):
    (_sid, name, code), (_sid2, name2, code2) = _chery_stations(app, 2)
    _gun(client, 93101)
    _wb_row(client, 93101, 93101, code)
    did = _register(register_client(department='ОТК', login='snap_otk1@weldteam.kz'), 93101)
    _move_wb_station(client, app, 93101, code2)             # точку в WB перенесли на другую станцию
    assert _board_row(client, did)['station_name'] == name   # а дефект — как было в его день
    det = client.get(f'/api/defects/{did}').get_json()
    assert (det['station_name'], det['station_now'], det['snap_note']) == (name, None, '')
    # старая карточка без зафиксированной станции: сегодняшний WB не выдаётся за факт
    db = _db(app)
    db.execute('UPDATE defects SET snap_station_id=NULL, snap_station_name=NULL WHERE UniqueID=?', (did,))
    db.commit()
    row = _board_row(client, did)
    assert row['station_name'] == '—' and row['segment'] == ''
    det = client.get(f'/api/defects/{did}').get_json()
    assert det['station_name'] is None and det['station_now'] == name2 and det['vin_required'] is False


def test_serial_repeat_does_not_resnap_the_old_card(register_client, client, app):
    (sid, _n, code), (_sid2, _n2, code2) = _chery_stations(app, 2)
    _gun(client, 93102)
    _wb_row(client, 93102, 93102, code)
    otk = register_client(department='ОТК', login='snap_otk2@weldteam.kz')
    did = _register(otk, 93102)
    db = _db(app)
    assert db.execute('SELECT snap_station_id, snap_source FROM defects WHERE UniqueID=?',
                      (did,)).fetchone() == (sid, 'registration')
    db.execute("UPDATE defects SET snap_at='2026-01-01T00:00:00' WHERE UniqueID=?", (did,))   # метка «не трогали»
    db.commit()
    _move_wb_station(client, app, 93102, code2)
    r = otk.post('/api/defects/register', json={'model_id': 1, 'spot_number': '93102', 'problem_code': 'CR'}).get_json()
    assert r['serial'] and r['defect_id'] == did
    assert _db(app).execute('SELECT snap_station_id, snap_at FROM defects WHERE UniqueID=?',
                            (did,)).fetchone() == (sid, '2026-01-01T00:00:00')


def test_snapshot_is_taken_before_the_chain(client, app, monkeypatch):
    """Уведомление о первом этапе уходит внутри регистрации — станция уже должна быть в снимке."""
    import app.notifications as notifications
    (_sid, name, code), = _chery_stations(app, 1)
    _gun(client, 93103)
    _wb_row(client, 93103, 93103, code)
    seen = []
    monkeypatch.setattr(notifications, 'enqueue_stage_arrival',
                        lambda conn, did, dept: seen.append(df.station_name_for(conn, did)))
    c = _db(app)
    spot = c.execute('SELECT UniqueID FROM spot WHERE model_id=1 AND spot_number=93103').fetchone()[0]
    df.register_occurrence(c, problem_code='CR', spot_id=spot, registered_by=1)
    assert seen == [name]


def test_sync_fills_gun_as_of_defect_date_and_logs_it(register_client, client, app):
    """Сервер: точку перевесили на другой пистолет — старому дефекту нужен тогдашний."""
    (sid, _name, code), = _chery_stations(app, 1)
    old, new = _gun(client, 93104), _gun(client, 93105)
    _wb_row(client, 93105, 93106, code)                     # сегодня точку 93106 варит G.93105
    did = _register(register_client(department='ОТК', login='snap_fill@weldteam.kz'), 93106)
    db = _db(app)
    spot = db.execute('SELECT spot_id FROM defects WHERE UniqueID=?', (did,)).fetchone()[0]
    # история связок: до 23.07 точку варил G.93104, с 23.07 — G.93105
    db.execute("UPDATE welding_setup SET start_date='2026-07-23' WHERE spot_id=? AND gun_id=?", (spot, new))
    db.execute("INSERT INTO welding_setup (comments, start_date, end_date, is_active, auto_created, spot_id, gun_id) "
               "VALUES ('создано из Weld Balance', '2026-05-14', '2026-07-23', 0, 1, ?, ?)", (spot, old))
    # дефект от 22.07 без пистолета и станции (как регистрировались до исправления сопоставления WB)
    db.execute("UPDATE defects SET df_date='2026-07-22', gun_id=NULL, snap_g_num=NULL, snap_gun_type=NULL, "
               'snap_station_id=NULL, snap_station_name=NULL WHERE UniqueID=?', (did,))
    db.commit()
    assert gun_on_date(db, spot, '2026-07-22') == (old, 1)
    assert gun_on_date(db, spot, '2026-07-23') == (new, 1)   # в день переноса — уже новый
    assert gun_on_date(db, spot, '2026-05-13') == (None, 0)  # история молчит
    log_before = db.execute('SELECT MAX(id) FROM change_log').fetchone()[0]
    res = run_wb_sync(app.config['DB_PATH'], audit=True, trigger='test')
    assert res['ok'] and res['defects_filled'] >= 1, res
    db = _db(app)
    assert db.execute('SELECT gun_id, snap_g_num, snap_station_id, snap_source FROM defects WHERE UniqueID=?',
                      (did,)).fetchone() == (old, 93104, sid, 'wb_fill')
    authors = {a for (a,) in db.execute("SELECT author FROM change_log WHERE id>? AND table_name='defects' "
                                        'AND row_pk=?', (log_before, did))}
    assert authors == {WB_SYNC_AUTHOR}                       # видно в Журнале и откатывается пакетом
    assert client.get(f'/api/defects/{did}').get_json()['snap_note'].startswith('дозаполнено по WB')


def test_editor_gun_fix_updates_snapshot(register_client, client, app):
    _gun(client, 93107)
    g2 = _gun(client, 93108)
    otk = register_client(department='ОТК', login='snap_ed@weldteam.kz')
    did = otk.post('/api/defects/register_manual', json={'g_num': 93107, 'problem_code': 'CR'}).get_json()['defect_id']
    r = client.post('/api/admin/doc/defects/batch', json={'changes': [
        {'op': 'update', 'field': 'gun_id', 'value': g2, 'row_pks': {'defects': did}}]})
    assert r.get_json()['status'] == 'success', r.get_json()
    assert _db(app).execute('SELECT snap_g_num, snap_source FROM defects WHERE UniqueID=?',
                            (did,)).fetchone() == (93108, 'correction')
    assert _board_row(client, did)['g_num'] == 93108         # раньше доска так и показывала старый G
    # правка причины снимок не трогает
    client.post('/api/admin/doc/defects/batch', json={'changes': [
        {'op': 'update', 'field': 'root_cause', 'value': 'x', 'row_pks': {'defects': did}}]})
    assert _db(app).execute('SELECT snap_g_num FROM defects WHERE UniqueID=?', (did,)).fetchone()[0] == 93108


def test_fixed_station_defect_not_in_reconciliation_after_wb_change(register_client, client, app):
    (_sid, _n, code), = _chery_stations(app, 1)
    _gun(client, 93109)
    _wb_row(client, 93109, 93109, code)
    did = _register(register_client(department='ОТК', login='snap_rec@weldteam.kz'), 93109)
    _move_wb_station(client, app, 93109, 'NOPE-999')         # в WB станция теперь не распознаётся
    db = _db(app)
    rebuild_issues(db)
    db.commit()
    assert not db.execute("SELECT 1 FROM wb_issue WHERE issue_key=? AND status<>'resolved'",
                          (f'def:{did}',)).fetchone()        # у дефекта станция его дня есть


# ── история станций WB по датам ───────────────────────────────────────────────
def _fresh_history(app):
    """Своя история с выдуманными датами: стираем записанное сохранениями в тесте."""
    db = _db(app)
    db.execute('DELETE FROM wb_station_history')
    return db


def _set_wb_station(db, spot, sid):
    """Станция строки WB «как после синхронизации» — без Редактора (он пишет историю сегодняшней датой)."""
    db.execute('UPDATE weld_point SET station_id=? WHERE spot_number=?', (sid, str(spot)))


def test_station_history_periods(client, app):
    (a, _na, code), (b, _nb, _c2) = _chery_stations(app, 2)
    gid = _gun(client, 93110)
    _wb_row(client, 93110, 93110, code)
    db = _fresh_history(app)
    assert record_station_history(db, today='2026-08-01') >= 2              # точка и пистолет
    assert station_on_date(db, '2026-08-01', 'A13T', '93110') == (a, True)
    assert station_on_date(db, '2026-07-31', 'A13T', '93110') == (None, False)   # учёт ещё не начат
    assert station_on_date(db, '2026-08-01', gun_id=gid) == (a, True)
    assert record_station_history(db, today='2026-08-03') == 0               # ничего не менялось
    _set_wb_station(db, 93110, b)
    record_station_history(db, today='2026-08-05')
    assert station_on_date(db, '2026-08-04', 'A13T', '93110') == (a, True)
    assert station_on_date(db, '2026-08-05', 'A13T', '93110') == (b, True)   # в день переноса — новая
    assert station_on_date(db, '2026-08-04', gun_id=gid) == (a, True)
    # вернули в тот же день — однодневного «B» в истории не остаётся
    _set_wb_station(db, 93110, a)
    record_station_history(db, today='2026-08-05')
    assert station_on_date(db, '2026-08-05', 'A13T', '93110') == (a, True)
    assert db.execute("SELECT COUNT(*) FROM wb_station_history WHERE model_key='A13T' AND spot_key='93110' "
                      'AND station_id=?', (b,)).fetchone()[0] == 0
    # точку убрали из WB (станции нет) — период закрыт: на эту дату станции нет, и это знание
    _set_wb_station(db, 93110, None)
    record_station_history(db, today='2026-08-09')
    assert station_on_date(db, '2026-08-10', 'A13T', '93110') == (None, True)


def test_fill_takes_station_of_defect_day_or_says_it_is_not(register_client, client, app):
    (a, name_a, code), (b, name_b, _c2) = _chery_stations(app, 2)
    _gun(client, 93111)
    _wb_row(client, 93111, 93111, code)
    otk = register_client(department='ОТК', login='snap_hist@weldteam.kz')
    d_old, d_new = _register(otk, 93111), None
    _gun(client, 93112)
    _wb_row(client, 93112, 93112, code)
    d_new = _register(otk, 93112)
    db = _fresh_history(app)
    record_station_history(db, today='2026-08-01')                          # учёт начат 01.08, обе точки на A
    _set_wb_station(db, 93111, b)
    _set_wb_station(db, 93112, b)
    record_station_history(db, today='2026-08-05')                          # с 05.08 — на B (и сегодня)
    db.execute("UPDATE defects SET df_date='2026-08-03', snap_station_id=NULL, snap_station_name=NULL "
               'WHERE UniqueID=?', (d_new,))
    db.execute("UPDATE defects SET df_date='2026-07-01', snap_station_id=NULL, snap_station_name=NULL "
               'WHERE UniqueID=?', (d_old,))
    fill_defects_from_wb(db)
    db.commit()
    row = db.execute('SELECT snap_station_name, snap_source, snap_dated FROM defects WHERE UniqueID=?', (d_new,)).fetchone()
    assert row == (name_a, 'wb_fill', 1)                                    # станция дня дефекта, не сегодняшняя
    row = db.execute('SELECT snap_station_name, snap_source, snap_dated FROM defects WHERE UniqueID=?', (d_old,)).fetchone()
    assert row == (name_b, 'wb_fill', 0)                                    # истории за 01.07 нет — сегодняшняя
    note = client.get(f'/api/defects/{d_old}').get_json()['snap_note']
    assert 'не на дату дефекта' in note


def test_correction_takes_station_of_defect_day(register_client, client, app):
    (a, name_a, code), (b, _nb, _c2) = _chery_stations(app, 2)
    _gun(client, 93113)
    _wb_row(client, 93113, 93113, code)
    did = _register(register_client(department='ОТК', login='snap_corr@weldteam.kz'), 93113)
    db = _fresh_history(app)
    record_station_history(db, today='2026-08-01')
    _set_wb_station(db, 93113, b)
    record_station_history(db, today='2026-08-05')
    db.execute("UPDATE defects SET df_date='2026-08-02' WHERE UniqueID=?", (did,))
    snapshot_defect(db, did, SNAP_CORRECTION)
    assert db.execute('SELECT snap_station_id, snap_source, snap_dated FROM defects WHERE UniqueID=?',
                      (did,)).fetchone() == (a, 'correction', 1)


def test_editor_inserted_defect_gets_snapshot(client, app):
    g = _gun(client, 93114)
    r = client.post('/api/admin/doc/defects/batch', json={'changes': [{'op': 'insert', 'values': {
        'df_date': '2026-11-01', 'problem_code': 'CR', 'gun_id': g, 'root_cause': '', 'solution': ''}}]})
    assert r.get_json()['status'] == 'success', r.get_json()
    row = _db(app).execute("SELECT snap_g_num, snap_source FROM defects WHERE gun_id=? AND df_date='2026-11-01'",
                           (g,)).fetchone()
    assert row == (93114, 'manual')


def test_snap_note_wording():
    assert snap_note('registration', '2026-11-02T10:00:00', 1) == ''
    assert snap_note(None, None, None) == ''
    assert snap_note('wb_fill', '2026-11-02T10:00:00', 1) == 'дозаполнено по WB 02.11.2026'
    assert snap_note('wb_fill', None, 0).startswith('дозаполнено по WB — ')     # до 0026: дата не известна
    assert 'не на дату дефекта' in snap_note('correction', '2026-11-02T10:00:00', 0)


# ── миграция 0026: какие старые снимки дозаполнила синхронизация мимо Журнала ─
def _m0026():
    path = Path(__file__).resolve().parents[1] / 'migrations' / 'versions' / '0026_defect_snapshot_source.py'
    spec = importlib.util.spec_from_file_location('m0026', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _j(gun, g, st):
    return json.dumps({'gun_id': gun, 'snap_g_num': g, 'snap_station_id': st, 'status': 'x'})


def test_migration_finds_snapshots_written_past_the_journal():
    m = _m0026()
    empty, full = _j(None, None, None), _j(7, 70, 3)
    defects = [(1, 7, 70, 3), (2, 7, 70, 3), (3, 7, 70, 3), (4, 7, 70, 3), (5, 7, 70, 3), (6, 8, 80, 4)]
    log = [
        ('1', '2026-10-01 08:00:00', None, empty), ('1', '2026-10-01 08:00:00', empty, full),   # человек
        ('2', '2026-10-31 08:00:00', None, empty),
        ('2', '2026-11-02 09:00:00', full, full),            # «до» уже заполнено — дозаполнили мимо Журнала
        ('3', '2026-10-31 08:00:00', None, empty),           # после последней записи — мимо Журнала
        ('5', '2026-07-01 08:00:00', None, empty),
        ('5', '2026-08-01 08:00:00', full, full),            # мимо Журнала, но до дозаполнения — не оно
        ('6', '2026-10-31 08:00:00', None, empty),
        ('6', '2026-11-02 09:00:00', full, full),            # дозаполнили…
        ('6', '2026-11-02 10:00:00', full, _j(8, 80, 4)),    # …а потом человек исправил
    ]
    assert sorted(m.unlogged_fill_ids(defects, log)) == [2, 3]   # 4 — без Журнала: не трогаем
