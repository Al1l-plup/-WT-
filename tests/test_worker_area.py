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


def test_left_and_right_are_different_areas():
    """Решение 2026-11-09: BS-L и BS-R — разные участки, и так у всех участков со сторонами."""
    assert df.defect_area('GW-BS L-10') == 'BS-L' and df.defect_area('CH-BS R-40') == 'BS-R'
    assert df.defect_area('CH-WH2 R-20') == 'WH-R'            # номер участка отбрасываем, сторону — нет
    assert df.defect_area('GW-INR+WH L-10') == 'INR+WH-L'
    assert df.defect_area('CA-HL L-10') == 'HL-L' and df.defect_area('GW-HL-10') == 'HL'
    assert df.defect_area('GW-FR WH 1-10') == 'FR'            # «WH» здесь не сторона
    assert df.defect_area('GW-EC2-10') == 'EC' and df.defect_area('GW-MB-150') == 'MB'
    # рабочий ключ: регистр, двойные пробелы, кириллические двойники и тире на результат не влияют
    assert df.defect_area('gw-bs  l-10') == 'BS-L' and df.defect_area('GW–ВS R–10') == 'BS-R'
    assert df.defect_area('GW-BS-R-10') == 'BS-R'
    assert df.defect_area(None) == '' and df.defect_area('—') == '' and df.defect_area('') == ''
    assert df.station_segment('GW-BS R-40') == 'BS'           # для VIN станция по-прежнему «BS»


def test_whole_area_covers_both_sides():
    assert df.area_covered('BS', 'BS-L') and df.area_covered('BS', 'BS-R') and df.area_covered('BS', 'BS')
    assert not df.area_covered('BS-L', 'BS-R') and not df.area_covered('BS-L', 'BS')
    assert not df.area_covered('INR', 'INR+WH-L')              # другой участок, не сторона
    zones = {('GWM', 'BS'), ('Chery', 'WH-L')}
    assert df.in_zones(zones, 'GWM', 'BS-R') and df.in_zones(zones, 'Chery', 'WH-L')
    assert not df.in_zones(zones, 'Chery', 'WH-R') and not df.in_zones(zones, 'Chery', 'BS-L')
    assert df.in_zones(zones, None, 'BS-L')                    # бренд не известен — только участок
    assert df.in_zones(zones, 'Chery', '')                     # без участка — виден всем


def test_zone_choices_offer_whole_and_sides(app):
    c = _db(app)
    choices = df.zone_choices(c)
    chery = choices[1]
    assert {'BS', 'BS-L', 'BS-R', 'MB'} <= set(chery)
    assert 'BS' not in df.segments_by_brand(c)[1], 'у дефекта всегда сторона: BS-L или BS-R'
    clean, unknown = df.clean_zone_map(c, {'1': ['BS', 'BS-L', 'mb'], '2': ['XX'], 'abc': ['MB']})
    assert clean == {1: ['BS', 'MB']} and sorted(unknown) == ['XX', 'abc']   # стороны под «целиком» лишние


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


def test_mine_by_side_and_whole_area(register_client, app):
    """Зона BS-L — только левая сторона; зона BS (целиком) — обе. Уведомления — по тому же правилу."""
    from app.notifications import resolve_recipients
    otk = register_client(department='ОТК')
    left = register_client(department='Производство', login='side_l@x.kz')
    whole = register_client(department='Производство', login='side_all@x.kz')
    db = _db(app)
    bname = db.execute('SELECT brand FROM brand WHERE UniqueID=1').fetchone()[0]
    ids = {lg: db.execute('SELECT UniqueID FROM worker WHERE login=?', (lg,)).fetchone()[0]
           for lg in ('side_l@x.kz', 'side_all@x.kz')}
    db.execute("INSERT INTO worker_area (worker_id,brand_id,segment) VALUES (?,1,'BS-L')", (ids['side_l@x.kz'],))
    db.execute("INSERT INTO worker_area (worker_id,brand_id,segment) VALUES (?,1,'BS')", (ids['side_all@x.kz'],))
    db.execute('UPDATE worker SET tg_chat_id=? WHERE UniqueID IN (?,?)', ('1', *ids.values()))
    db.commit()
    db.close()

    def mk(g, station):
        did = otk.post('/api/defects/register_manual', json={'g_num': g, 'problem_code': 'CR'}).get_json()['defect_id']
        c = _db(app)
        c.execute('UPDATE defects SET snap_brand=?, snap_station_name=? WHERE UniqueID=?', (bname, station, did))
        c.commit(); c.close()
        return did

    bs_l, bs_r = mk(96620, 'CH-BS L-20'), mk(96621, 'CH-BS R-20')

    def mine(cl, did):
        return next(x for x in cl.get('/api/defects/all').get_json()['open'] if x['UniqueID'] == did)

    assert mine(left, bs_l)['segment'] == 'BS-L' and mine(left, bs_r)['segment'] == 'BS-R'
    assert mine(left, bs_l)['mine'] is True and mine(left, bs_r)['mine'] is False
    assert mine(whole, bs_l)['mine'] is True and mine(whole, bs_r)['mine'] is True
    c = _db(app)
    for did, expect in ((bs_l, set(ids.values())), (bs_r, {ids['side_all@x.kz']})):
        got = set(resolve_recipients(c, did, 'Производство', bname, df.defect_area(df.station_name_for(c, did))))
        assert expect <= got and not (set(ids.values()) - expect) & got
