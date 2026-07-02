"""Историческая неизменность: после правки справочников прошлые карточки не меняются.

Проверяем главную гарантию snapshot-подхода: если после записи ТО/дефекта изменить
привязку точки, ярлык пистолета или параметры — исторические записи остаются прежними.
"""
import sqlite3


def _sample(app):
    """Взять реальный активный набор точка↔пистолет↔параметр из справочников."""
    db = sqlite3.connect(app.config['DB_PATH'])
    db.row_factory = sqlite3.Row
    row = db.execute("""
        SELECT ws.gun_id, ws.spot_id, ws.parameter_id,
               s.spot_number, s.model_id,
               p.heat_1, p.heat_2, p.pressure
        FROM welding_setup ws
        JOIN spot s ON ws.spot_id = s.UniqueID
        JOIN parameters p ON ws.parameter_id = p.UniqueID
        WHERE ws.is_active = 1 AND p.heat_1 > 0
        LIMIT 1
    """).fetchone()
    worker = db.execute("SELECT UniqueID FROM worker WHERE is_active=1 LIMIT 1").fetchone()
    db.close()
    assert row is not None, "нет активной связки spot↔gun↔parameter в справочниках"
    return dict(row), worker['UniqueID']


def test_defect_display_frozen_after_spot_and_gun_edit(client, app):
    s, _ = _sample(app)

    # 1) Регистрируем дефект по существующей точке
    r = client.post('/api/defects/register', json={
        'model_id': s['model_id'], 'spot_number': s['spot_number'], 'problem_code': 'CR',
    })
    assert r.status_code == 200 and r.get_json()['status'] == 'success'

    def board_row():
        data = client.get('/api/defects/all').get_json()
        rows = [d for d in data['open'] if d['problem_code'] == 'CR']
        assert rows, "зарегистрированный дефект не найден на доске"
        return rows[0]

    before = board_row()
    assert str(before['spot_number']) == str(s['spot_number'])

    # 2) Меняем номер точки и тип пистолета в справочнике
    r1 = client.put(f"/api/explorer/spot/{s['spot_id']}", json={'spot_number': 987654})
    assert r1.status_code == 200
    r2 = client.put(f"/api/explorer/gun/{s['gun_id']}", json={'gun_type': 'ИЗМЕНЁННЫЙ_ТИП'})
    assert r2.status_code == 200

    # 3) Историческая карточка дефекта НЕ изменилась
    after = board_row()
    assert str(after['spot_number']) == str(s['spot_number']) == str(before['spot_number'])
    assert after['gun_model'] == before['gun_model']
    assert after['model_name'] == before['model_name']
    assert after['brand'] == before['brand']
    assert after['station_name'] == before['station_name']


def test_maintenance_display_frozen_after_gun_edit(client, app):
    s, worker_id = _sample(app)

    target_heat = s['heat_2'] if (s['heat_1'] > 0 and s['heat_2'] > 0) else (s['heat_1'] or s['heat_2'])
    pres_daN = round((s['pressure'] or 0) / 10)

    r = client.post('/api/maintenance', json={
        'gun_id': s['gun_id'], 'parameter_id': s['parameter_id'], 'worker_id': worker_id,
        'first_weld': target_heat, 'second_weld': target_heat, 'third_weld': target_heat,
        'first_pressure': pres_daN, 'second_pressure': pres_daN, 'third_pressure': pres_daN,
    })
    assert r.status_code == 200, r.get_json()
    assert r.get_json()['status'] == 'success'

    def hist_row():
        rows = client.get(f"/api/gun/{s['gun_id']}/history").get_json()['maintenance']
        assert rows, "запись ТО не найдена в истории пистолета"
        return rows[0]

    before = hist_row()

    # Меняем ярлык пистолета и параметры (новая версия уставок)
    client.put(f"/api/explorer/gun/{s['gun_id']}", json={'gun_type': 'ДРУГОЙ_ТИП'})
    client.post('/api/parameters/update', json={
        'gun_id': s['gun_id'], 'parameter_id': s['parameter_id'], 'param_heat_1': 999,
    })

    after = hist_row()
    assert after['surname'] == before['surname']
    assert after['mode'] == before['mode']
    assert after['heat_1'] == before['heat_1']
    assert after['heat_2'] == before['heat_2']


def test_snapshot_columns_populated(client, app):
    s, worker_id = _sample(app)
    client.post('/api/defects/register', json={
        'model_id': s['model_id'], 'spot_number': s['spot_number'], 'problem_code': 'SN',
    })
    db = sqlite3.connect(app.config['DB_PATH'])
    db.row_factory = sqlite3.Row
    d = db.execute(
        "SELECT snap_spot_number, snap_model_name, snap_g_num FROM defects "
        "WHERE problem_code='SN' ORDER BY UniqueID DESC LIMIT 1"
    ).fetchone()
    db.close()
    assert d['snap_spot_number'] is not None
    assert d['snap_model_name'] is not None
