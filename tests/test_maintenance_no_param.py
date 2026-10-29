"""ТО для ручного пистолета без активной уставки: сохраняем с parameter_id=NULL,
а не 0 — иначе внешний ключ parameters(UniqueID) падает и запись ТО отдаёт 500."""
import sqlite3


def _ids(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    gun_id = db.execute('SELECT UniqueID FROM gun LIMIT 1').fetchone()[0]
    worker_id = db.execute("SELECT UniqueID FROM worker WHERE login='test@weldteam.kz'").fetchone()[0]
    db.close()
    return gun_id, worker_id


def test_maintenance_without_parameter_saves_null(client, app):
    gun_id, worker_id = _ids(app)
    # parameter_id не передаём (ручной пистолет без уставки)
    r = client.post('/api/maintenance', json={
        'gun_id': gun_id, 'worker_id': worker_id,
        'first_weld': 5000, 'second_weld': 5000, 'third_weld': 5000,
        'first_pressure': 300, 'second_pressure': 300, 'third_pressure': 300,
    })
    assert r.status_code == 200, r.get_json()
    assert r.get_json()['status'] == 'success'
    mid = r.get_json()['maintenance_id']
    db = sqlite3.connect(app.config['DB_PATH'])
    pid = db.execute('SELECT parameter_id FROM maintenance WHERE UniqueID=?', (mid,)).fetchone()[0]
    db.close()
    assert pid is None   # NULL (нет режима), не 0


def test_maintenance_bad_parameter_still_rejected(client, app):
    gun_id, worker_id = _ids(app)
    # несуществующий режим (не 0) по-прежнему явно отклоняется, а не молча пишется
    r = client.post('/api/maintenance', json={
        'gun_id': gun_id, 'worker_id': worker_id, 'parameter_id': 999999,
        'first_weld': 5000, 'second_weld': 5000, 'third_weld': 5000,
        'first_pressure': 300, 'second_pressure': 300, 'third_pressure': 300,
    })
    assert r.status_code == 400
    assert r.get_json()['status'] == 'error'
