"""Weld Balance — единственный источник станции точки и пистолета; «Сверка» (wb_issue).

Сценарий строится через Редактор (как у пользователя: строки WB вставляются в документ),
станции берутся из справочника тестовой БД (Chery = префикс CH-, модель A13T)."""
import sqlite3

from app.audit import drop_audit_triggers
from app.wb_source import StationMatcher, rebuild_issues, sync_wb_on_start, wb_station_code
from tests.test_admin_docs import wb_doc


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def _chery_stations(app, n=2):
    """n станций Chery (бренд 1) вида CH-XXX → [(id, полное имя, код без префикса)]."""
    rows = _db(app).execute("SELECT UniqueID, station_name FROM station WHERE brand_id=1 "
                            "AND station_name LIKE 'CH-%' ORDER BY UniqueID LIMIT ?", (n,)).fetchall()
    return [(sid, name, name[3:]) for sid, name in rows]


def _gun(client, g):
    return client.post('/api/admin/table/gun', json={'values': {'g_num': g, 'gun_type': 'X'}}).get_json()['id']


def _wb_row(client, g, spot, station_text):
    doc = wb_doc(client, 'A13T')
    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [{'op': 'insert', 'values': {
        'gun_mntc': f'G.{g}', 'spot_number': str(spot), 'model_code': 'A13T', 'wb_station': station_text}}]})
    assert r.get_json()['status'] == 'success', r.get_json()


def test_station_code_normalization():
    assert wb_station_code('MB-250 ROBOT RESPOT') == 'MB-250'
    assert wb_station_code('wh l-40') == 'WH L-40'
    assert wb_station_code('WH2 R-10 something') == 'WH2 R-10'
    assert wb_station_code('  ') is None and wb_station_code(None) is None


def test_matcher_is_brand_scoped_and_knows_aliases(app):
    db = _db(app)
    (sid, name, code), = _chery_stations(app, 1)
    m = StationMatcher(db)
    assert m.match('A13T', f'{code} ROBOT SOMETHING') == sid        # Chery-модель → Chery-станция
    assert m.match('A01', code) != sid                              # A01 = GWM: чужой бренд не берём
    assert m.match('A13T', 'NOPE-999') is None


def test_wb_save_sets_station_and_gun_station_comes_from_wb(client, app):
    (sid, name, code), = _chery_stations(app, 1)
    gid = _gun(client, 93001)
    _wb_row(client, 93001, 93001, f'{code} ROBOT')
    db = _db(app)
    assert db.execute("SELECT station_id FROM weld_point WHERE spot_number='93001'").fetchone()[0] == sid
    assert db.execute('SELECT station_id FROM v_wb_gun WHERE gun_id=?', (gid,)).fetchone()[0] == sid
    # Перечень показывает рядом станцию из WB (на дефекты и ТО влияет только она)
    client.post('/api/admin/doc/equipment/batch', json={'changes': [{'op': 'insert', 'values': {
        'item_code': 'G.93001', 'name': 'AC пистолет', 'item_type': 'X', 'location': 'НЕ ВАЖНО'}}]})
    row = next(r for r in client.get('/api/admin/doc/equipment?limit=100000').get_json()['rows']
               if r['item_code'] == 'G.93001')
    assert row['wb_station_name'] == name
    # выбор пистолетов по станции при вводе ТО — по WB
    assert any(g['UniqueID'] == gid for g in client.get(f'/api/guns/{sid}').get_json())
    assert not any(g['UniqueID'] == gid for g in client.get('/api/guns/0').get_json())   # не «потеряшка»


def test_defect_station_from_wb_and_frozen_after_actions(register_client, client, app):
    (sid, name, code), (sid2, name2, code2) = _chery_stations(app, 2)
    _gun(client, 93002)
    _wb_row(client, 93002, 93002, code)
    otk = register_client(department='ОТК', login='wbs_otk@weldteam.kz')
    did = otk.post('/api/defects/register', json={'model_id': 1, 'spot_number': '93002',
                                                  'problem_code': 'CR'}).get_json()['defect_id']
    db = _db(app)
    assert db.execute('SELECT snap_station_id, snap_station_name FROM defects WHERE UniqueID=?',
                      (did,)).fetchone() == (sid, name)
    # WB поменяли — у ЗАРЕГИСТРИРОВАННОГО дефекта станция не «плывёт» ни сама, ни после
    # действия на этапе (раньше снимок переснимался после каждого действия)
    wp = db.execute("SELECT id FROM weld_point WHERE spot_number='93002'").fetchone()[0]
    client.post(f'/api/admin/doc/{wb_doc(client, "A13T")}/batch', json={'changes': [
        {'op': 'update', 'field': 'wb_station', 'value': code2, 'row_pks': {'weld_point': wp}}]})
    stage = _db(app).execute('SELECT current_stage_dept FROM defects WHERE UniqueID=?', (did,)).fetchone()[0]
    actor = register_client(department=stage, login='wbs_actor@weldteam.kz')
    assert actor.post(f'/api/defects/{did}/act', json={'action': 'claim'}).get_json()['status'] == 'success'
    assert actor.post(f'/api/defects/{did}/act', json={'action': 'pass', 'note': 'проверили'}).status_code == 200
    assert _db(app).execute('SELECT snap_station_id FROM defects WHERE UniqueID=?', (did,)).fetchone()[0] == sid


def test_point_with_two_stations_registers_without_station_and_goes_to_reconciliation(register_client, client, app):
    (sid, _n, code), (sid2, _n2, code2) = _chery_stations(app, 2)
    _gun(client, 93003)
    _gun(client, 93004)
    _wb_row(client, 93003, 93005, code)      # точка 93005: две строки WB на разных станциях
    _wb_row(client, 93004, 93005, code2)
    otk = register_client(department='ОТК', login='wbs_otk2@weldteam.kz')
    did = otk.post('/api/defects/register', json={'model_id': 1, 'spot_number': '93005',
                                                  'problem_code': 'CR'}).get_json()['defect_id']
    db = _db(app)
    assert db.execute('SELECT snap_station_id FROM defects WHERE UniqueID=?', (did,)).fetchone()[0] is None
    rebuild_issues(db)
    db.commit()
    kinds = {k for (k,) in db.execute("SELECT kind FROM wb_issue WHERE status<>'resolved'")}
    assert 'point_two_stations' in kinds and 'defect_not_in_wb' in kinds


def test_reconciliation_autoresolves_and_keeps_engineer_decisions(client, app):
    db = _db(app)
    rebuild_issues(db)
    db.commit()
    gid = _gun(client, 93006)                       # пистолет есть в Перечне, нет в WB
    db = _db(app)
    rebuild_issues(db)
    db.execute("UPDATE wb_issue SET status='in_review', comment='смотрю' WHERE issue_key=?", (f'nowb:{gid}',))
    db.commit()
    rebuild_issues(db)                              # повторная сборка не трогает решение ИТО
    db.commit()
    assert db.execute("SELECT status, comment FROM wb_issue WHERE issue_key=?",
                      (f'nowb:{gid}',)).fetchone() == ('in_review', 'смотрю')
    (sid, _n, code), = _chery_stations(app, 1)
    _wb_row(client, 93006, 93006, code)             # добавили пистолет в WB → проблема ушла сама
    db = _db(app)
    rebuild_issues(db)
    db.commit()
    assert db.execute("SELECT status FROM wb_issue WHERE issue_key=?", (f'nowb:{gid}',)).fetchone()[0] == 'resolved'


def test_sync_on_start_relinks_g_numbers_and_is_idempotent(client, app):
    (sid, _n, code), = _chery_stations(app, 1)
    _wb_row(client, 93007, 93007, code)             # G.93007 ещё нет в Перечне → gun_id пустой
    db = _db(app)
    assert db.execute("SELECT gun_id FROM weld_point WHERE spot_number='93007'").fetchone()[0] is None
    gid = _gun(client, 93007)                       # пистолет добавили в Перечень позже
    db = _db(app)
    drop_audit_triggers(db)
    res = sync_wb_on_start(db)
    assert res['relinked'] >= 1
    assert db.execute("SELECT gun_id, station_id FROM weld_point WHERE spot_number='93007'").fetchone() == (gid, sid)
    again = sync_wb_on_start(db)
    assert again['relinked'] == 0 and again['stations_updated'] == 0


def test_lost_guns_pseudo_station_for_maintenance(client, app):
    gid = _gun(client, 93008)                       # нет в WB
    stations = client.get('/api/stations/1?with_lost=1').get_json()
    assert stations[-1]['UniqueID'] == 0 and 'не из WB' in stations[-1]['station_name']
    assert all(s['UniqueID'] != 0 for s in client.get('/api/stations/1').get_json())   # без флага — нет
    assert any(g['UniqueID'] == gid for g in client.get('/api/guns/0').get_json())


def test_matcher_ignores_model_code_case_and_spaces(app):
    (sid, _n, code), = _chery_stations(app, 1)
    assert StationMatcher(_db(app)).match(' a13t ', code) == sid


def test_sync_step_failure_does_not_block_stations(client, app, monkeypatch):
    """Раньше сбой довязки G откатывал ВСЮ синхронизацию — станции оставались пустыми."""
    import app.documents as documents
    from app.wb_source import sync_wb
    (sid, _n, code), = _chery_stations(app, 1)
    _wb_row(client, 93011, 93011, code)              # G.93011 нет в Перечне → строка ждёт довязки
    _gun(client, 93011)
    db = _db(app)
    db.execute("UPDATE weld_point SET station_id=NULL WHERE spot_number='93011'")
    db.commit()

    def boom(_db, _ids):
        raise RuntimeError('сбой довязки')
    monkeypatch.setattr(documents, 'resolve_weld_point_links', boom)
    res = sync_wb(db)
    db.commit()
    assert res['relink_failed'] >= 1 and 'сбой довязки' in res['errors'][0]
    assert db.execute("SELECT station_id FROM weld_point WHERE spot_number='93011'").fetchone()[0] == sid
    assert res['open_issues'] is not None             # Сверка тоже пересобрана


def test_run_wb_sync_keeps_journal_clean_and_triggers_back(client, app):
    from app.wb_source import run_wb_sync
    (sid, _n, code), = _chery_stations(app, 1)
    _wb_row(client, 93012, 93012, code)
    db = _db(app)

    def trig():
        return db.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='trigger' AND name LIKE 'audit_%'").fetchone()[0]
    n_trig = trig()
    db.execute("UPDATE weld_point SET station_id=NULL WHERE spot_number='93012'")
    db.commit()
    log_before = db.execute('SELECT MAX(id) FROM change_log').fetchone()[0]
    res = run_wb_sync(app.config['DB_PATH'], audit=True, trigger='test')
    assert res['ok'] and res['stations_updated'] >= 1, res
    db = _db(app)
    assert db.execute("SELECT station_id FROM weld_point WHERE spot_number='93012'").fetchone()[0] == sid
    assert db.execute('SELECT MAX(id) FROM change_log').fetchone()[0] == log_before   # производное — не в Журнал
    assert trig() == n_trig                                                            # триггеры журнала на месте
