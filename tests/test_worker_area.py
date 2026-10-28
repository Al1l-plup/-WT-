"""Зоны ответственности сотрудников (бренд+участок): регистрация, назначение админом,
фильтр «Мои входящие» по (бренд+участок). Базовый код участка (EC1/EC2 → EC)."""
import sqlite3

from app import defect_flow as df


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def test_base_segment_and_segments_by_brand(app):
    assert df.base_segment('EC2') == 'EC'
    assert df.base_segment('RF1') == 'RF'
    assert df.base_segment('MB') == 'MB'
    assert df.base_segment('INR+WH') == 'INR+WH'     # нет хвостовой цифры — не трогаем
    assert df.defect_area('GW-MB-150') == 'MB' and df.defect_area('CH-EC2-10') == 'EC'
    c = _db(app)
    by_brand = df.segments_by_brand(c)
    assert 1 in by_brand and 'MB' in by_brand[1] and 'UB' in by_brand[1]   # Chery
    assert 'EC' in by_brand[2]                                             # GWM: EC1/EC2 → EC (сгруппировано)
    assert all(not any(ch.isdigit() for ch in s) for segs in by_brand.values() for s in segs if s != 'INR+WH')


def test_registration_saves_areas(app):
    c = app.test_client()
    c.post('/register', data={'surname': 'Ц', 'name': 'Р', 'department': 'Производство',
                              'login': 'areareg@x.kz', 'password': 'test1234', 'password2': 'test1234',
                              'area_1': ['MB', 'UB'], 'area_2': ['EC']})
    db = _db(app)
    wid = db.execute("SELECT UniqueID FROM worker WHERE login='areareg@x.kz'").fetchone()[0]
    rows = set(db.execute('SELECT brand_id, segment FROM worker_area WHERE worker_id=?', (wid,)).fetchall())
    assert rows == {(1, 'MB'), (1, 'UB'), (2, 'EC')}


def test_admin_assigns_areas(register_client, app):
    admin = register_client(department='WeldTeam', login='al.galimov@astana-motors.kz')
    register_client(department='Производство', login='az_prod@x.kz')
    db = _db(app)
    wid = db.execute("SELECT UniqueID FROM worker WHERE login='az_prod@x.kz'").fetchone()[0]
    db.close()
    r = admin.put(f'/api/admin/users/{wid}/areas', json={'areas': {'1': ['MB'], '3': ['UB']}})
    assert r.get_json()['status'] == 'success'
    users = admin.get('/api/admin/users').get_json()['users']
    u = next(x for x in users if x['UniqueID'] == wid)
    assert u['areas']['1'] == ['MB'] and u['areas']['3'] == ['UB']
    # перезапись: пустой набор очищает
    admin.put(f'/api/admin/users/{wid}/areas', json={'areas': {}})
    db = _db(app)
    assert db.execute('SELECT COUNT(*) FROM worker_area WHERE worker_id=?', (wid,)).fetchone()[0] == 0


def test_board_exposes_segment_and_mine_is_stage_based(register_client, app):
    """«Мои входящие» = дефекты этапа моего отдела (без авто-фильтра по зонам — его отменили).
    В выдаче есть участок (segment) для ручного фильтра по участку."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='flt_prod@x.kz')
    did = otk.post('/api/defects/register_manual', json={'g_num': 96600, 'problem_code': 'CR'}).get_json()['defect_id']
    db = _db(app)
    db.execute("UPDATE defects SET snap_brand_id=1, snap_station_name='CA-MB-60' WHERE UniqueID=?", (did,))
    wid = db.execute("SELECT UniqueID FROM worker WHERE login='flt_prod@x.kz'").fetchone()[0]
    # даже с зоной Chery:UB (не MB) — дефект остаётся «мой» (авто-фильтр по зонам убран)
    db.execute("INSERT INTO worker_area (worker_id,brand_id,segment) VALUES (?,1,'UB')", (wid,))
    db.commit()
    db.close()
    row = next(x for x in prod.get('/api/defects/all').get_json()['open'] if x['UniqueID'] == did)
    assert row['mine'] is True                 # на этапе Производства → мой, независимо от зон
    assert row['segment'] == 'MB'              # участок доступен для фильтра (CA-MB-60 → MB)
    # ОТК не на этапе → не его (это про этап, не про зоны)
    assert next(x for x in otk.get('/api/defects/all').get_json()['open'] if x['UniqueID'] == did)['mine'] is False
