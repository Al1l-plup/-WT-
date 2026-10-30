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


def test_mine_filtered_by_zones(register_client, app):
    """«Мои входящие» = мой этап И мои участки (бренд+участок). Дефект без участка — виден всем.
    У кого зоны не заданы (или WeldTeam/админ) — ограничения нет, только этап."""
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='zn_prod@x.kz')
    db = _db(app)
    wid = db.execute("SELECT UniqueID FROM worker WHERE login='zn_prod@x.kz'").fetchone()[0]
    bname = db.execute("SELECT brand FROM brand WHERE UniqueID=1").fetchone()[0]   # бренд с id=1
    db.execute("INSERT INTO worker_area (worker_id,brand_id,segment) VALUES (?,1,'UB')", (wid,))  # зона: бренд#1 / UB
    db.commit()
    db.close()

    def mk(g, brand, station):
        did = otk.post('/api/defects/register_manual', json={'g_num': g, 'problem_code': 'CR'}).get_json()['defect_id']
        c = _db(app)
        c.execute("UPDATE defects SET snap_brand=?, snap_station_name=? WHERE UniqueID=?", (brand, station, did))
        c.commit(); c.close()
        return did

    in_zone = mk(96610, bname, 'CA-UB-60')    # бренд#1 / UB → в моей зоне
    off_seg = mk(96611, bname, 'CA-MB-60')    # бренд#1 / MB → участок не мой
    no_area = mk(96612, None, None)           # без станции/участка → виден всем

    board = prod.get('/api/defects/all').get_json()
    assert board['zoned'] is True
    def m(did):
        return next(x for x in board['open'] if x['UniqueID'] == did)['mine']
    assert m(in_zone) is True
    assert m(off_seg) is False                # мой этап, но участок MB не в зонах
    assert m(no_area) is True                 # без участка — всегда виден
    assert next(x for x in board['open'] if x['UniqueID'] == in_zone)['segment'] == 'UB'

    # у ОТК зон нет → ограничения по зонам нет (zoned=False); но эти дефекты на этапе Производства, не ОТК
    ob = otk.get('/api/defects/all').get_json()
    assert ob['zoned'] is False
    assert next(x for x in ob['open'] if x['UniqueID'] == in_zone)['mine'] is False
