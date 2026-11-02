"""Обработка ввода (app/normalize.py): сырые данные → рабочие ключи.

Принцип: сырые данные хранятся как ввели и не меняются; логика сайта работает только
по ключам. Здесь — правила ключей и то, что сырые колонки WB после сохранения целы."""
import sqlite3

from app.normalize import clean, code_key, g_id_number, g_number, spot_int, spot_key, station_key
from tests.test_wb_source import _chery_stations, _gun, _wb_row


def test_clean_spaces():
    assert clean('  G.153  \t') == 'G.153'                  # неразрывный пробел, таб
    assert clean('A\n  B') == 'A B'
    assert clean('   ') is None and clean(None) is None


def test_code_key_case_lookalikes_dashes():
    assert code_key(' ch-ec2-10 ') == 'CH-EC2-10'
    assert code_key('СН-ЕС2-10') == 'CH-EC2-10'                  # кириллица, похожая на латиницу
    assert code_key('CH - EC2 – 10') == 'CH-EC2-10'               # пробелы вокруг дефиса, тире
    assert code_key('CH-B- 1') == 'CH-B-1'
    assert code_key('') is None


def test_spot_key_numbers_in_any_form():
    assert spot_key('0020') == spot_key(' 20 ') == spot_key('20.0') == spot_key(20) == '20'
    assert spot_key('20a') == '20A' and spot_key('1.2.3') == '1.2.3'
    assert spot_key(None) is None and spot_key('  ') is None
    assert spot_int('0020') == 20 and spot_int('20A') is None


def test_g_number_prefix_variants():
    for raw in ('G.153', 'g.153', 'G 153', 'G-153', 'G№153', 'G.0153', ' G.153 ', 'G.153 / RH'):
        assert g_number(raw) == 153, raw
    assert g_number('GW-B-12') is None and g_number('') is None
    assert g_id_number('G.001') == 1 and g_id_number('GW-EC2-10-T1') is None
    assert g_id_number('G.001 (резерв)') is None                  # ID Перечня — только целиком G-номер


def test_station_key_brand_prefix_and_tail():
    assert station_key('GW-EC2-15') == station_key('EC2-15') == station_key('ec2-15 ROBOT') == 'EC2-15'
    assert station_key('CH-WH L-40') == 'WH L-40'
    assert station_key('INR+WH L-10') == 'INR+WH L-10'


def test_raw_wb_input_is_kept_and_keys_are_derived(client, app):
    """Сырые колонки WB после сохранения — ровно как ввели; ключи — отдельно (weld_point_key)."""
    (sid, name, code), = _chery_stations(app, 1)
    gid = _gun(client, 93040)
    _wb_row(client, 93040, '0093041', f'  {code.lower()}  robot ')   # как бывает при вставке из Excel
    db = sqlite3.connect(app.config['DB_PATH'])
    wid, raw_spot, raw_station, raw_g = db.execute(
        "SELECT id, spot_number, wb_station, gun_mntc FROM weld_point WHERE spot_number LIKE '%93041'").fetchone()
    assert (raw_spot, raw_station, raw_g) == ('0093041', f'  {code.lower()}  robot ', 'G.93040')   # не тронуты
    assert db.execute('SELECT model_key, spot_key, g_num, station_key FROM weld_point_key WHERE weld_point_id=?',
                      (wid,)).fetchone() == ('A13T', '93041', 93040, code)
    assert db.execute('SELECT gun_id, station_id FROM weld_point WHERE id=?', (wid,)).fetchone() == (gid, sid)
    # прозрачность: в документе WB видно, как сайт понял строку
    from tests.test_admin_docs import wb_doc
    row = next(r for r in client.get(f'/api/admin/doc/{wb_doc(client, "A13T")}?limit=100000').get_json()['rows']
               if r['__pk_weld_point'] == wid)
    assert (row['k_spot'], row['k_g'], row['k_station']) == ('93041', 93040, name)
