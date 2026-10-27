"""VIN при закрытии зависит от станции: MB/UB → VIN обязателен; подсборка/неизвестно → не нужен.

Классификация по сегменту имени станции (GW-MB-150 → MB), список сегментов — в defect_config
('vin_required_segments', по умолчанию 'MB,UB'), правится в Редакторе.
"""
import sqlite3

from app import defect_flow as df


def _conn(app):
    c = sqlite3.connect(app.config['DB_PATH'])
    c.row_factory = sqlite3.Row
    return c


def test_station_segment_parse():
    assert df.station_segment('GW-MB-150') == 'MB'
    assert df.station_segment('CH-UB-90') == 'UB'
    assert df.station_segment('GW-BS R-40') == 'BS'       # подсборка с L/R
    assert df.station_segment('GW-INR+WH L-10') == 'INR+WH'
    assert df.station_segment('') == '' and df.station_segment(None) == ''


def test_vin_required_by_segment(app):
    c = _conn(app)
    assert df.vin_required_segments(c) == {'MB', 'UB'}     # дефолт из миграции 0014
    # подготовим дефект и подменим снимок станции
    did = df.register_occurrence(c, problem_code='CR', gun_id=None, registered_by=1)['defect_id']
    for name, need in [('GW-MB-150', True), ('CA-UB-60', True), ('GW-BS R-40', False), ('GW-WH L-10', False)]:
        c.execute('UPDATE defects SET snap_station_name=? WHERE UniqueID=?', (name, did))
        assert df.vin_required(c, did) is need, name
    # станция неизвестна (NULL, без привязки гана) → VIN не требуется
    c.execute('UPDATE defects SET snap_station_name=NULL, gun_id=NULL WHERE UniqueID=?', (did,))
    assert df.vin_required(c, did) is False


def _reg(otk, g, code='CR'):
    return otk.post('/api/defects/register_manual', json={'g_num': g, 'problem_code': code}).get_json()


def _set_station(app, did, name):
    c = sqlite3.connect(app.config['DB_PATH'])
    c.execute('UPDATE defects SET snap_station_name=? WHERE UniqueID=?', (name, did))
    c.commit()
    c.close()


def test_close_mb_station_requires_vin(register_client, app):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='mbv_prod@x.kz')
    did = _reg(otk, 95001)['defect_id']
    _set_station(app, did, 'GW-MB-150')                   # станция MB → VIN обязателен
    prod.post(f'/api/defects/{did}/act', json={'action': 'claim'})   # взять в работу (строгий режим)
    assert prod.post(f'/api/defects/{did}/act', json={'action': 'close', 'countermeasure': 'ок'}).status_code == 400
    assert prod.post(f'/api/defects/{did}/act',
                     json={'action': 'close', 'countermeasure': 'ок', 'vin': 'XW8MB1'}).get_json()['status'] == 'success'


def test_close_subassembly_no_vin(register_client, app):
    otk = register_client(department='ОТК')
    prod = register_client(department='Производство', login='sub_prod@x.kz')
    did = _reg(otk, 95002)['defect_id']
    _set_station(app, did, 'GW-BS R-40')                  # подсборка → хватит контрмеры, без VIN
    prod.post(f'/api/defects/{did}/act', json={'action': 'claim'})   # взять в работу (строгий режим)
    r = prod.post(f'/api/defects/{did}/act', json={'action': 'close', 'countermeasure': 'подтянули'}).get_json()
    assert r['status'] == 'success'
    # и карточка говорит фронту, что VIN не нужен
    det = otk.get(f'/api/defects/{did}').get_json()
    assert det['vin_required'] is False


def test_detail_reports_vin_required_for_mb(register_client, app):
    otk = register_client(department='ОТК')
    did = _reg(otk, 95003)['defect_id']
    _set_station(app, did, 'CH-UB-90')
    det = otk.get(f'/api/defects/{did}').get_json()
    assert det['vin_required'] is True and det['station_name'] == 'CH-UB-90'
