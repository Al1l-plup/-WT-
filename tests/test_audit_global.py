"""Глобальный аудит: автор правок из ЛЮБОЙ вкладки + контроль внешних ключей.

Раньше автор в журнале проставлялся только для правок из «Редактора»; правки из
ТО/Дефектов/Обзора/Сотрудников логировались без автора. Теперь автор из сессии
проставляется единым хуком для всех путей записи. Плюс включён контроль FK —
удаление записи, на которую ссылаются, блокируется, а не оставляет «висячие» ссылки.
"""
import sqlite3


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def test_author_stamped_outside_editor(client, app):
    """Правка через вкладку «Сотрудники» (не редактор) попадает в журнал с автором."""
    r = client.post('/api/workers', json={'surname': 'Аудит', 'name': 'Тест', 'department': 'ОТК'})
    assert r.status_code == 200
    row = _db(app).execute(
        "SELECT author FROM change_log WHERE table_name='worker' ORDER BY id DESC LIMIT 1").fetchone()
    assert row and row[0] == 'Тестов Т.'   # автор — из сессии вошедшего


def test_author_stamped_in_explorer_edit(client, app):
    """Правка карточки в «Обзоре» (PUT ганa) тоже пишет автора в журнал."""
    client.put('/api/explorer/gun/1', json={'gun_type': 'AUD'})
    row = _db(app).execute(
        "SELECT author FROM change_log WHERE table_name='gun' ORDER BY id DESC LIMIT 1").fetchone()
    assert row and row[0] == 'Тестов Т.'


def test_editor_author_not_overwritten(client, app):
    """Редактор ставит автора сам — глобальный хук его не затирает (пишет лишь NULL)."""
    client.put('/api/admin/table/gun/1', json={'values': {'gun_type': 'ED'}})
    row = _db(app).execute(
        "SELECT author FROM change_log WHERE table_name='gun' ORDER BY id DESC LIMIT 1").fetchone()
    assert row and row[0] == 'Тестов Т.'   # автор один, не задвоен/не перезатёрт


def test_foreign_keys_enforced_on_delete(client, app):
    """Удаление записи, на которую ссылаются (бренд → станция), заблокировано контролем FK."""
    bid = client.post('/api/admin/table/brand', json={'values': {'brand': 'FKТест'}}).get_json()['id']
    client.post('/api/admin/table/station', json={'values': {'station_name': 'FK-СТ', 'brand_id': bid}})
    r = client.delete(f'/api/admin/table/brand/{bid}')
    assert r.status_code != 200                                   # удаление связанного бренда отклонено
    # бренд на месте — «висячих» ссылок не образовалось
    assert _db(app).execute('SELECT COUNT(*) FROM brand WHERE UniqueID=?', (bid,)).fetchone()[0] == 1


def test_foreign_keys_allow_delete_of_unreferenced(client, app):
    """Не связанную запись удалить можно (контроль FK не мешает нормальной работе)."""
    bid = client.post('/api/admin/table/brand', json={'values': {'brand': 'FKСвободный'}}).get_json()['id']
    r = client.delete(f'/api/admin/table/brand/{bid}')
    assert r.status_code == 200
    assert _db(app).execute('SELECT COUNT(*) FROM brand WHERE UniqueID=?', (bid,)).fetchone()[0] == 0
