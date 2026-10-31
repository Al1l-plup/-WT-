"""Перечень оборудования = Excel цеха 1:1 (app/equipment.py, миграция 0023).

Вставка строк как из Excel → справочник пистолетов, трансформатор пистолета, станция
«по Перечню» по цепочке; расхождения с WB — в Сверку, без блокировок вставки."""
import sqlite3

from app.wb_source import rebuild_issues
from tests.test_wb_source import _chery_stations, _wb_row

COLS = ('item_code', 'name', 'item_type', 'note', 'brand', 'area', 'location', 'dept', 'category')


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def paste(client, *rows):
    """Строки как из Excel (ID … Категория) → вставка в Перечень одним пакетом."""
    r = client.post('/api/admin/doc/equipment/batch', json={'changes': [
        {'op': 'insert', 'values': dict(zip(COLS, row))} for row in rows]})
    assert r.get_json()['status'] == 'success', r.get_json()
    return r.get_json()


def _row(client, code):
    return next(r for r in client.get('/api/admin/doc/equipment?limit=100000').get_json()['rows']
                if r['item_code'] == code)


def test_columns_match_excel_and_paste_creates_gun(client, app):
    cols = client.get('/api/admin/doc/equipment?limit=1').get_json()['columns']
    editable = [c['label'] for c in cols if c['editable'] and not c['hidden']]
    assert editable == ['ID', 'Наименование', 'Тип', 'Замечание', 'Бренд', 'Участок', 'Станция',
                        'Подразделение', 'Категория']                       # ровно как в Excel
    (sid, name, _code), = _chery_stations(app, 1)
    res = paste(client,
                ('CH-T94001', 'AC трансформатор', 'PTB200', None, 'Chery', 'Линия', name, 'ОТО', 'A'),
                ('G.94001', 'AC пистолет', 'UCH-TEST', None, 'Chery', 'Линия', 'CH-T94001', 'ОТО', 'A'),
                ('BAL-1', 'Балансиры пружинные', 'X', None, 'Chery', 'Линия', name, 'ОТО', 'C'))
    db = _db(app)
    gid, gtype = db.execute('SELECT UniqueID, gun_type FROM gun WHERE g_num=94001').fetchone()
    assert gtype == 'UCH-TEST'
    tid = db.execute("SELECT UniqueID FROM trans WHERE transID='CH-T94001'").fetchone()[0]
    assert db.execute('SELECT transformer_id, comments FROM gun_transformer_assignment '
                      'WHERE gun_id=? AND is_active=1', (gid,)).fetchall() == [(tid, 'по Перечню оборудования')]
    row = _row(client, 'G.94001')
    assert row['reg_station'] == name                                      # пистолет → трансформатор → станция
    assert row['wb_station_name'] == '⚠ нет в WB' and row['wb_match'] == '⚠ нет в WB'
    assert _row(client, 'BAL-1')['wb_station_name'] == ''                  # не пистолет — сравнивать нечего
    # пистолет, трансформатор и строки Перечня — одним пакетом Журнала
    tables = {e['table_name'] for e in client.get('/api/admin/history').get_json()['entries']
              if e['batch_id'] == res['batch_id']}
    assert {'equipment_item', 'gun', 'trans', 'gun_transformer_assignment'} <= tables


def test_transformer_change_keeps_history(client, app):
    (sid, name, _code), = _chery_stations(app, 1)
    paste(client,
          ('CH-T94011', 'AC трансформатор', 'P', None, 'Chery', 'L', name, 'ОТО', 'A'),
          ('CH-T94012', 'DC трансформатор', 'P', None, 'Chery', 'L', name, 'ОТО', 'A'),
          ('G.94010', 'AC пистолет', 'T', None, 'Chery', 'L', 'CH-T94011', 'ОТО', 'A'))
    db = _db(app)
    gid = db.execute('SELECT UniqueID FROM gun WHERE g_num=94010').fetchone()[0]
    item = db.execute("SELECT id FROM equipment_item WHERE item_code='G.94010'").fetchone()[0]
    r = client.post('/api/admin/doc/equipment/batch', json={'changes': [
        {'op': 'update', 'field': 'location', 'value': 'CH-T94012', 'row_pks': {'equipment_item': item}}]})
    assert r.get_json()['status'] == 'success'
    db = _db(app)
    hist = db.execute('SELECT t.transID, a.is_active, a.end_date IS NOT NULL FROM gun_transformer_assignment a '
                      'JOIN trans t ON t.UniqueID = a.transformer_id WHERE a.gun_id=? ORDER BY a.UniqueID',
                      (gid,)).fetchall()
    assert hist == [('CH-T94011', 0, 1), ('CH-T94012', 1, 0)]             # старая закрыта датой
    assert db.execute("SELECT type FROM trans WHERE transID='CH-T94012'").fetchone()[0] == 'DC'


def test_robot_location_resolves_station_by_code(client, app):
    (sid, name, _code), = _chery_stations(app, 1)
    paste(client, ('G.94020', 'SV пистолет', 'S', None, 'Chery', 'L', f'{name}-R2501', 'ОТО', 'A'))
    assert _row(client, 'G.94020')['reg_station'] == name                  # робот без строки → по коду


def test_register_vs_wb_goes_to_reconciliation_without_blocking(client, app):
    (sid, name, code), (sid2, name2, code2) = _chery_stations(app, 2)
    _wb_row(client, 94030, 94030, code2)                                   # WB: G.94030 на второй станции
    paste(client,
          ('CH-T94030', 'AC трансформатор', 'P', None, 'Chery', 'L', name, 'ОТО', 'A'),
          ('G.94030', 'AC пистолет', 'T', None, 'Chery', 'L', 'CH-T94030', 'ОТО', 'A'),
          ('G.94031', 'AC пистолет', 'T', None, 'Chery', 'L', 'НЕПОНЯТНО', 'ОТО', 'A'),
          ('G.94031', 'AC пистолет', 'T', None, 'Chery', 'L', 'НЕПОНЯТНО', 'ОТО', 'A'))   # повтор G
    # WB-строка G.94030 довязалась к пистолету, созданному Перечнем, тем же сохранением
    db = _db(app)
    gid = db.execute('SELECT UniqueID FROM gun WHERE g_num=94030').fetchone()[0]
    assert db.execute("SELECT gun_id FROM weld_point WHERE spot_number='94030'").fetchone()[0] == gid
    row = _row(client, 'G.94030')
    assert (row['reg_station'], row['wb_station_name'], row['wb_match']) == (name, name2, '⚠ другая станция')
    kinds = {k: (g, det) for k, g, det in db.execute(
        "SELECT kind, g_num, details FROM wb_issue WHERE status<>'resolved' AND kind LIKE 'register%'")}
    assert kinds['register_station_mismatch'] == (94030, f'по Перечню: {name}')
    assert 'register_no_station' in kinds and 'register_dup_g' in kinds


def test_empty_register_is_silent(client, app):
    db = _db(app)
    rebuild_issues(db)
    db.commit()
    assert db.execute("SELECT COUNT(*) FROM wb_issue WHERE kind LIKE 'register%' OR kind='gun_not_in_register'"
                      ).fetchone()[0] == 0


def test_startup_sync_recomputes_register(client, app):
    """Перечень пересчитывается и при старте сервера (там «голое» соединение sqlite3)."""
    from app.wb_source import run_wb_sync
    (sid, name, _code), = _chery_stations(app, 1)
    paste(client, ('CH-T94040', 'AC трансформатор', 'P', None, 'Chery', 'L', name, 'ОТО', 'A'),
          ('G.94040', 'AC пистолет', 'T', None, 'Chery', 'L', 'CH-T94040', 'ОТО', 'A'))
    res = run_wb_sync(app.config['DB_PATH'], audit=True, trigger='test')
    assert res['ok'], res
    assert res['register']['items'] >= 2
    assert _row(client, 'G.94040')['reg_station'] == name


def test_station_spelling_variants_are_same():
    from app.equipment import same_station
    assert same_station('GW-INR+WH L-10', 'gw-inr l-10')
    assert not same_station('GW-EC2-10', 'GW-EC2-15')
