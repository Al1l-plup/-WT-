"""Вкладка «Шпильки»: каталог, VIN, запись оператора, разбор ИТО/УЗК, удаление, картинки схем, права."""
import io
import os
import shutil
import sqlite3
import subprocess
from pathlib import Path

import pytest

from app import studs as st

ROOT = Path(__file__).resolve().parents[1]
ADMIN_EMAIL = 'al.galimov@astana-motors.kz'
VIN = 'MXMDB21B9TK193362'                     # Chery Tiggo 4 (кузов T19) — с контрольной карты
TOP_QR = VIN + 'CRT19-BE4TD62NS-----|TC_KZ_E-KZ.0774.00047|CHERY_TIGGO_4|1798 кг|1044 кг|854 кг|'
# верхние QR с контрольных карт цеха (2026-11-12): Tiggo 2 Pro — схема A13T, CS55 Plus — CS55
T2P_QR = 'MXMDB21B1TK003922CRA13TBE4GC82NS-----BLCHW---|TC_KZ_E-KZ.0774.00037|CHERY_TIGGO2_PRO|1662 кг|977 кг|785 кг||'
CS55_QR = 'MXMASE2E1TK008261CHCS553JL7D72SC-----BL9MC---|TC KZ E-KZ.0774.00057|CHANGAN_CS55PLUS|1835 кг|991 кг|844 кг||'
JPEG = b'\xff\xd8\xff\xe0' + b'\x00' * 64      # достаточно сигнатуры: сервер смотрит содержимое
PNG = b'\x89PNG\r\n\x1a\n' + b'\x00' * 64
# внутренние номера (stud_no) по моделям; 0029 добавила A01 2093–2094 и A13T 4094–4095
BLOCKS = {'P01G': (1001, 1099), 'A01': (2001, 2094), 'CS55': (3001, 3042), 'A13T': (4001, 4095)}
SHOP_RANGES = {'P01G': (7011, 7120), 'A01': (6001, 6094), 'CS55': (8001, 8043), 'A13T': (278, 1105)}


def _db(app):
    con = sqlite3.connect(app.config['DB_PATH'])
    con.row_factory = sqlite3.Row
    return con


def _post_record(c, vin=VIN, scheme='A13T', stud_no=4021, photo=JPEG, name='p.jpg', card_qr=None):
    data = {'vin': vin, 'scheme_code': scheme, 'stud_no': str(stud_no)}
    if card_qr is not None:
        data['card_qr'] = card_qr
    if photo is not None:
        data['photo'] = (io.BytesIO(photo), name)
    return c.post('/api/studs/records', data=data, content_type='multipart/form-data')


# ── каталог ──────────────────────────────────────────────────────────────────

def test_catalog_seeded_in_number_blocks(app):
    with _db(app) as con:
        schemes = {r['code'] for r in con.execute('SELECT code FROM stud_scheme')}
        assert schemes == set(BLOCKS)
        models = {r[0] for r in con.execute('SELECT model_code FROM model')}
        assert schemes <= models, 'код схемы = model.model_code'
        assert con.execute('SELECT COUNT(*) FROM stud_view').fetchone()[0] == 18
        rows = con.execute('SELECT s.stud_no, s.scheme_code, s.x, s.y, v.scheme_code AS vs '
                           'FROM stud s JOIN stud_view v ON v.view_key=s.view_key').fetchall()
    assert len(rows) == 330
    for r in rows:
        lo, hi = BLOCKS[r['scheme_code']]
        assert lo <= r['stud_no'] <= hi
        assert r['vs'] == r['scheme_code']
        assert 0 <= r['x'] <= 100 and 0 <= r['y'] <= 100
    counts = {}
    for r in rows:
        counts[r['scheme_code']] = counts.get(r['scheme_code'], 0) + 1
    assert counts == {'P01G': 99, 'A01': 94, 'CS55': 42, 'A13T': 95}


def test_shop_numbers(app):
    """0029: номер цеха у каждой шпильки, уникален, в диапазоне модели; повтор в Excel — со знаком «?»."""
    with _db(app) as con:
        rows = con.execute('SELECT stud_no, scheme_code, shop_no, view_key, part, colour FROM stud').fetchall()
        assert con.execute("SELECT COUNT(*) FROM pragma_index_list('stud') WHERE name='ux_stud_shop_no' "
                           "AND [unique]=1").fetchone()[0] == 1
    shop = {r['stud_no']: r['shop_no'] for r in rows}
    assert all(shop.values()) and len(set(shop.values())) == 330
    for r in rows:
        lo, hi = SHOP_RANGES[r['scheme_code']]
        assert lo <= int(r['shop_no'].rstrip('?')) <= hi, dict(r)
    assert sorted(v for v in shop.values() if v.endswith('?')) == ['6024?', '6055?', '7035?']
    # сверено глазами по чертежам: выноски арок Tank, пары колец Tiggo, сдвинутые кружки боков Tiggo
    assert {k: shop[k] for k in (1052, 1068, 4058, 4059, 4060, 4061, 4088, 3001)} == {
        1052: '7086', 1068: '7109', 4058: '774', 4059: '768', 4060: '775', 4061: '769', 4088: '837', 3001: '8001'}
    assert (shop[1014], shop[1049], shop[2093], shop[2032]) == ('7035', '7035?', '6024', '6024?')
    new = {r['stud_no']: (r['view_key'], r['part'], r['colour']) for r in rows if r['stud_no'] in (2093, 2094, 4094, 4095)}
    assert new == {2093: ('A01-ec-in', '09170071', 'blue'), 2094: ('A01-ec-in', '09170071', 'blue'),
                   4094: ('A13T-top', 'N90068401', 'yellow'), 4095: ('A13T-top', 'N90068401', 'yellow')}


def test_shop_numbers_not_overwritten_on_rerun(app):
    """Повторный прогон данных 0029 не затирает номер, поправленный позже (правки цеха важнее)."""
    import importlib.util
    spec = importlib.util.spec_from_file_location('m0029', ROOT / 'migrations/versions/0029_stud_shop_numbers.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    with _db(app) as con:
        con.execute("UPDATE stud SET shop_no='7034' WHERE stud_no=1049")
        mod.apply_shop_numbers(con.execute, mod.load_data())
        assert con.execute('SELECT shop_no FROM stud WHERE stud_no=1049').fetchone()[0] == '7034'
        assert con.execute('SELECT COUNT(*) FROM stud').fetchone()[0] == 330


def test_catalog_api(client):
    d = client.get('/api/studs/catalog').get_json()
    assert [s['code'] for s in d['schemes']] == ['P01G', 'A01', 'CS55', 'A13T']
    assert len(d['studs']) == 330
    by_no = {s['stud_no']: s for s in d['studs']}
    assert by_no[1052]['label'] == '7086' and by_no[1049]['label'] == '7035?'
    assert all(not v['has_image'] for s in d['schemes'] for v in s['views'])
    assert d['categories']['missing'] == 'Отсутствует'
    assert d['can_review'] is True            # тест-клиент — WeldTeam


# ── VIN ──────────────────────────────────────────────────────────────────────

def test_vin_helpers():
    assert st.vin_from_qr(VIN) == VIN                       # нижний QR — ровно VIN
    assert st.vin_from_qr(TOP_QR) == VIN                    # верхний — VIN + комплектация
    assert st.vin_from_qr('hello') is None
    assert st.vin_key(' mxmdb21b9tk-193362 ') == VIN        # рабочий ключ; сырое не меняем
    assert st.is_valid_vin(VIN)
    assert not st.is_valid_vin('MXMDB21B9TK19336')          # 16 знаков
    assert not st.is_valid_vin('MXMDB21B9TK19336O')         # O в VIN не бывает
    assert st.vin_prefix(VIN) == 'MXMDB21B'


def test_vin_lookup_learns_scheme_from_first_record(client):
    assert client.get('/api/studs/vin?vin=123').status_code == 400
    r = client.get('/api/studs/vin?vin=' + VIN.lower()).get_json()
    assert r['vin_key'] == VIN and r['scheme_code'] is None
    assert _post_record(client).get_json()['status'] == 'success'
    other = 'MXMDB21B9TK000001'                             # та же модель, другая машина
    assert client.get('/api/studs/vin?vin=' + other).get_json()['scheme_code'] == 'A13T'


# ── модель по верхнему QR карты ──────────────────────────────────────────────

def test_parse_card_qr():
    assert st.parse_card_qr(TOP_QR) == {'vin': VIN, 'model_token': 'CHERY_TIGGO_4'}   # верхний: VIN + модель
    # реальный текст с телефона (2026-11-12): «ТС» кириллицей и «||» в конце — модель всё равно 3-е поле
    real = VIN + 'CRT19-BE4TD62NS-----|ТС_KZ_E-KZ.0774.00047|CHERY_TIGGO_4|1798 кг|1044 кг|854 кг||'
    assert st.parse_card_qr(real) == {'vin': VIN, 'model_token': 'CHERY_TIGGO_4'}
    assert st.parse_card_qr(VIN) == {'vin': VIN, 'model_token': None}                 # нижний: только VIN
    assert st.parse_card_qr('hello|x|tank 300') == {'vin': None, 'model_token': 'TANK_300'}   # без VIN сервер откажет
    assert st.parse_card_qr('hello|x|y')['model_token'] is None                       # 1 знак — не модель
    assert st.parse_card_qr(VIN + 'X|TC|haval jolion |1 кг|')['model_token'] == 'HAVAL_JOLION'
    assert st.parse_card_qr(VIN + 'X|TC|<script>|')['model_token'] is None             # мусор моделью не считаем


def test_vin_lookup_by_top_qr_opens_scheme(client):
    look = lambda qr: client.get('/api/studs/vin', query_string={'qr': qr}).get_json()  # noqa: E731
    r = look(T2P_QR)
    assert (r['vin'], r['model_token']) == ('MXMDB21B1TK003922', 'CHERY_TIGGO2_PRO')
    assert (r['scheme_code'], r['scheme_source'], r['no_scheme']) == ('A13T', 'qr', False)   # сразу, без выбора
    assert (look(CS55_QR)['scheme_code'], look(CS55_QR)['scheme_source']) == ('CS55', 'qr')
    r = look(VIN)                                                                     # нижний QR — только VIN
    assert r['model_token'] is None and r['scheme_source'] is None
    assert client.get('/api/studs/vin', query_string={'qr': 'https://example.kz'}).status_code == 400


def test_tiggo4_has_no_scheme_and_is_not_learned(client):
    """Tiggo 4 (T19) — модель известна, схемы шпилек нет. Подсказки по началу VIN нет (у Tiggo 4 и
    Tiggo 2 Pro оно одинаковое), а ручной выбор оператора не привязывает Tiggo 4 к чужой схеме."""
    assert _post_record(client, vin='MXMDB21B1TK003922', card_qr=T2P_QR).get_json()['status'] == 'success'
    r = client.get('/api/studs/vin', query_string={'qr': TOP_QR}).get_json()
    assert (r['model_token'], r['scheme_code'], r['scheme_source'], r['no_scheme']) == ('CHERY_TIGGO_4', None, None, True)
    assert _post_record(client, card_qr=TOP_QR).get_json()['status'] == 'success'     # оператор выбрал A13T вручную
    tokens = {t['token']: t['scheme_code'] for t in client.get('/api/studs/catalog').get_json()['model_tokens']}
    assert tokens['CHERY_TIGGO_4'] is None                                          # не «научился»


def test_a13t_scheme_is_tiggo2_pro(client):
    schemes = {s['code']: s['title'] for s in client.get('/api/studs/catalog').get_json()['schemes']}
    assert schemes['A13T'] == 'Chery Tiggo 2 Pro'                                   # код комплектации CRA13T…


def test_unknown_model_from_qr_learned_from_first_record(app, client):
    """Незнакомую модель из QR оператор выбирает один раз — первая запись её запоминает,
    следующая машина этой модели открывает схему сама. Сырой текст QR — в записи."""
    vin = 'LGWEF6A57MH000001'
    qr = vin + 'XX01-TEST|TC_KZ_E-KZ.0000.00001|NEW_MODEL_X|1500 кг|'                # выдуманная модель
    r = client.get('/api/studs/vin', query_string={'qr': qr}).get_json()
    assert r['model_token'] == 'NEW_MODEL_X' and r['scheme_code'] is None and not r['no_scheme']
    res = _post_record(client, vin=vin, scheme='A01', stud_no=2001, card_qr=qr).get_json()
    assert res['status'] == 'success'
    other = 'LGWEF6A57MH000002' + qr[17:]                                            # другая машина той же модели
    r = client.get('/api/studs/vin', query_string={'qr': other}).get_json()
    assert r['scheme_code'] == 'A01' and r['scheme_source'] == 'qr'
    with _db(app) as con:
        assert con.execute('SELECT card_qr FROM stud_defect WHERE id=?', (res['record']['id'],)).fetchone()[0] == qr


def test_card_qr_must_match_vin(client):
    r = _post_record(client, card_qr='LVVDB21B9TC193362|x|CHERY_TIGGO_4|')            # QR другой машины
    assert r.status_code == 400 and 'не совпадает' in r.get_json()['message']
    assert _post_record(client, card_qr=TOP_QR).get_json()['status'] == 'success'


def test_model_tokens_admin(client, register_client):
    tokens = {t['token']: t['scheme_code'] for t in client.get('/api/studs/catalog').get_json()['model_tokens']}
    assert tokens == {'CHERY_TIGGO2_PRO': 'A13T', 'CHANGAN_CS55PLUS': 'CS55',      # задано миграцией 0031
                      'CHERY_TIGGO_4': None}                                        # известна, схемы нет
    prod = register_client(department='Производство', login='tok_prod@x.kz')
    assert prod.get('/api/studs/catalog').get_json()['model_tokens'] == []           # список — только WeldTeam
    assert prod.delete('/api/studs/model-tokens/CHERY_TIGGO2_PRO').status_code == 403
    assert client.delete('/api/studs/model-tokens/CHERY_TIGGO2_PRO').get_json()['status'] == 'success'
    assert client.delete('/api/studs/model-tokens/CHERY_TIGGO2_PRO').status_code == 404
    r = client.get('/api/studs/vin', query_string={'qr': T2P_QR}).get_json()
    assert r['model_token'] == 'CHERY_TIGGO2_PRO' and r['scheme_source'] != 'qr'     # забыта — выберут заново


# ── запись оператора ─────────────────────────────────────────────────────────

def test_create_record_keeps_raw_vin_and_saves_photo(app, client):
    raw = 'mxmdb21b9tk193362'
    res = _post_record(client, vin=raw).get_json()
    assert res['status'] == 'success'
    rec = res['record']
    assert rec['vin'] == raw and rec['vin_key'] == VIN       # сырое как ввели + рабочий ключ
    assert rec['stud_no'] == 4021 and rec['scheme_code'] == 'A13T' and rec['has_photo']
    assert rec['stud_label'] == '300' and res['message'] == 'Записано: шпилька 300'   # людям — номер цеха
    with _db(app) as con:
        photo = con.execute('SELECT photo FROM stud_defect WHERE id=?', (rec['id'],)).fetchone()['photo']
    path = Path(app.config['DB_PATH']).parent / 'uploads' / 'studs' / 'photos' / photo
    assert path.is_file() and path.read_bytes() == JPEG
    assert client.get(f"/api/studs/records/{rec['id']}/photo").status_code == 200


@pytest.mark.parametrize('kw, msg', [
    ({'photo': None}, 'фото'),
    ({'photo': b'not an image at all'}, 'снимок'),
    ({'vin': 'ABC'}, 'VIN'),
    ({'stud_no': 1001}, 'не с этой схемы'),        # шпилька Tank на схеме Tiggo
    ({'stud_no': 9999}, 'Нет такой шпильки'),
])
def test_create_record_validation(client, kw, msg):
    r = _post_record(client, **kw)
    assert r.status_code == 400
    assert msg in r.get_json()['message']


def test_duplicate_within_window_is_not_a_new_record(app, client):
    first = _post_record(client).get_json()
    again = _post_record(client).get_json()
    assert again['duplicate'] is True and again['record']['id'] == first['record']['id']
    with _db(app) as con:
        assert con.execute('SELECT COUNT(*) FROM stud_defect').fetchone()[0] == 1
        con.execute("UPDATE stud_defect SET created_at='2020-01-01T08:00:00'")
    assert _post_record(client).get_json().get('duplicate') is None   # окно прошло — новая запись


def test_png_photo_accepted(client):
    assert _post_record(client, photo=PNG, name='x.png').get_json()['status'] == 'success'


# ── журнал и разбор ──────────────────────────────────────────────────────────

def test_records_filters(client):
    _post_record(client, stud_no=4021)
    _post_record(client, stud_no=4030)
    _post_record(client, vin='LVVDB21B9TC193362', stud_no=4030)
    q = lambda s: client.get('/api/studs/records?' + s).get_json()['records']  # noqa: E731
    assert len(q('status=all')) == 3
    assert {r['stud_no'] for r in q('q=300')} == {4021}              # поиск по номеру цеха
    assert q('q=4021') == []                                        # внутренний номер людям не виден
    assert len(q('vin=' + VIN)) == 2
    assert len(q('q=LVVDB')) == 1
    assert len(q('scheme=A01')) == 0
    _post_record(client, scheme='P01G', stud_no=1014)                # 7035
    _post_record(client, scheme='P01G', stud_no=1049)                # 7035? — повтор в Excel цеха
    assert {r['stud_label'] for r in q('q=7035')} == {'7035', '7035?'}
    assert {r['stud_label'] for r in q('q=7035%3F')} == {'7035', '7035?'}


def test_review_by_uzk_and_forbidden_for_production(client, register_client):
    rid = _post_record(client).get_json()['record']['id']
    prod = register_client(department='Производство')
    r = prod.patch(f'/api/studs/records/{rid}', json={'category': 'missing'})
    assert r.status_code == 403
    uzk = register_client(department='ОТК')
    assert uzk.patch(f'/api/studs/records/{rid}', json={'category': 'zzz'}).status_code == 400
    res = uzk.patch(f'/api/studs/records/{rid}', json={'category': 'missing', 'source': 'body', 'comment': 'нет'}).get_json()
    assert res['status'] == 'success'
    rec = res['record']
    assert rec['category'] == 'missing' and rec['category_label'] == 'Отсутствует'
    assert rec['source_label'] == 'Кузовной цех' and rec['reviewed_at'] and rec['reviewer']
    assert client.get('/api/studs/records?status=new').get_json()['records'] == []
    cleared = uzk.patch(f'/api/studs/records/{rid}', json={}).get_json()['record']
    assert cleared['category'] is None and cleared['reviewed_at'] is None


# ── удаление ─────────────────────────────────────────────────────────────────

def test_delete_rules(app, client, register_client):
    prod = register_client(department='Производство')
    rid = _post_record(prod).get_json()['record']['id']
    other = register_client(department='Производство')
    assert other.delete(f'/api/studs/records/{rid}').status_code == 403          # чужая
    with _db(app) as con:
        con.execute("UPDATE stud_defect SET created_at='2020-01-01T08:00:00' WHERE id=?", (rid,))
    assert prod.delete(f'/api/studs/records/{rid}').status_code == 403           # окно прошло
    admin = register_client(department='WeldTeam', login=ADMIN_EMAIL)
    assert admin.delete(f'/api/studs/records/{rid}').get_json()['status'] == 'success'

    rid2 = _post_record(prod, stud_no=4022).get_json()['record']['id']
    with _db(app) as con:
        photo = con.execute('SELECT photo FROM stud_defect WHERE id=?', (rid2,)).fetchone()['photo']
    path = Path(app.config['DB_PATH']).parent / 'uploads' / 'studs' / 'photos' / photo
    assert path.is_file()
    assert prod.delete(f'/api/studs/records/{rid2}').get_json()['status'] == 'success'   # своя, в окне
    assert not path.exists()


def test_reviewed_record_not_deletable_by_author(client, register_client):
    prod = register_client(department='Производство')
    rid = _post_record(prod).get_json()['record']['id']
    client.patch(f'/api/studs/records/{rid}', json={'category': 'bent'})
    assert prod.delete(f'/api/studs/records/{rid}').status_code == 403


# ── картинки схем ────────────────────────────────────────────────────────────

def test_view_images_upload(app, client, register_client):
    prod = register_client(department='Производство')
    up = lambda c, files: c.post('/api/studs/views/images', content_type='multipart/form-data',  # noqa: E731
                                 data={'images': [(io.BytesIO(b), n) for n, b in files]})
    assert up(prod, [('A13T-top.jpg', JPEG)]).status_code == 403
    res = up(client, [('A13T-top.jpg', JPEG), ('nope.jpg', JPEG), ('A01-top.jpg', b'text')]).get_json()
    assert res['saved'] == ['A13T-top']
    assert {s['name'] for s in res['skipped']} == {'nope.jpg', 'A01-top.jpg'}
    assert client.get('/api/studs/views/A13T-top/image').status_code == 200
    assert client.get('/api/studs/views/A01-top/image').status_code == 404
    views = {v['view_key']: v for s in client.get('/api/studs/catalog').get_json()['schemes'] for v in s['views']}
    assert views['A13T-top']['has_image'] and not views['A01-top']['has_image']
    res = up(client, [('A13T-top.png', PNG)]).get_json()                 # замена другим форматом
    assert res['saved'] == ['A13T-top']
    d = Path(app.config['DB_PATH']).parent / 'uploads' / 'studs' / 'views'
    assert sorted(os.listdir(d)) == ['A13T-top.png']


def test_part_image_key():
    assert st.part_image_key('09170071', 'blue') == '09170071_blue'
    assert st.part_image_key(' A11-5100365 ', 'red') == 'A11-5100365_red'
    assert st.part_image_key('', 'red') is None and st.part_image_key('09170071', None) is None


def test_part_images_for_legend(app, client, register_client):
    """Вид шпильки для легенды: деталь_цвет, загружается той же кнопкой, что и схемы."""
    parts = {p['key']: p for p in client.get('/api/studs/catalog').get_json()['parts']}
    assert len(parts) == 12                                   # все пары деталь+цвет каталога
    assert {'09170071_blue', '09170071_green', 'A11-5100365_red', 'A11-5100365_pink'} <= set(parts)
    assert not any(p['has_image'] for p in parts.values())
    up = lambda c, files: c.post('/api/studs/views/images', content_type='multipart/form-data',  # noqa: E731
                                 data={'images': [(io.BytesIO(b), n) for n, b in files]})
    prod = register_client(department='Производство')
    assert up(prod, [('09170071_blue.png', PNG)]).status_code == 403
    res = up(client, [('09170071_blue.png', PNG), ('A13T-top.jpg', JPEG), ('09170071_black.png', PNG)]).get_json()
    assert sorted(res['saved']) == ['09170071_blue', 'A13T-top']           # схема и шпилька — одним махом
    assert [s['name'] for s in res['skipped']] == ['09170071_black.png']   # нет такого цвета у детали
    assert client.get('/api/studs/parts/09170071_blue/image').status_code == 200
    assert client.get('/api/studs/parts/09170071_green/image').status_code == 404
    assert client.get('/api/studs/parts/..%2F..%2Fwelding_shop/image').status_code == 404
    parts = {p['key']: p for p in client.get('/api/studs/catalog').get_json()['parts']}
    assert parts['09170071_blue']['has_image'] and parts['09170071_blue']['img_v'] > 0
    root = Path(app.config['DB_PATH']).parent / 'uploads' / 'studs'
    assert os.listdir(root / 'parts') == ['09170071_blue.png']
    assert os.listdir(root / 'views') == ['A13T-top.jpg']


# ── права и страница ─────────────────────────────────────────────────────────

def test_rbac_oto_reads_only(register_client):
    oto = register_client(department='ОТО')
    assert oto.get('/studs').status_code == 200
    assert oto.get('/api/studs/catalog').status_code == 200
    assert _post_record(oto).status_code == 403
    assert '/studs' in oto.get('/api/me').get_json()['pages']


def test_production_can_record(register_client):
    prod = register_client(department='Производство')
    assert _post_record(prod).get_json()['status'] == 'success'
    assert prod.get('/api/studs/catalog').get_json()['can_review'] is False


def test_page_and_static():
    html = (ROOT / 'app/templates/studs.html').read_text(encoding='utf-8')
    assert html.index('/static/vendor/jsQR.js') < html.index('/static/studs.js')
    assert 'capture="environment"' in html                    # камера сразу, без выбора
    assert (ROOT / 'app/static/vendor/jsQR.LICENSE.txt').is_file()
    theme = (ROOT / 'app/static/theme.js').read_text(encoding='utf-8')
    assert "a[href=\"/studs\"]" in theme                      # вкладка в шапке всех страниц
    gi = (ROOT / '.gitignore').read_text(encoding='utf-8')
    assert 'data/uploads/' in gi                               # чертежи и фото не попадают в git


@pytest.mark.skipif(shutil.which('node') is None, reason='node недоступен')
def test_studs_js_syntax_and_vin_parsing():
    path = ROOT / 'app/static/studs.js'
    r = subprocess.run([shutil.which('node'), '--check', str(path)], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    src = path.read_text(encoding='utf-8')
    assert "/^[A-HJ-NPR-Z0-9]{17}/" in src                    # то же правило, что app.studs.vin_from_qr
    assert 'const AUTO_MODEL = false' in src                  # модель пока выбирает оператор (решение 2026-11-10)
    # масштаб 1 = схема целиком в рамке; масштаб телефона выбирается, когда рамка уже видна
    assert 'Math.round(base * z)' in src and 'ResizeObserver' in src and 'chooseDefaultZoom()' in src
    # ключ картинки шпильки — то же правило, что app.studs.part_image_key
    assert "`${s.part}_${s.colour}`" in src and 'renderLegend(v)' in src
    # машина — по ВСЕМУ тексту верхнего QR (VIN и модель разбирает сервер), сырой QR уходит с записью
    assert 'takeCar({ qr: r.text })' in src and "fd.append('card_qr', S.qr)" in src
    assert "r.data.includes('|')" in src                    # из двух QR на снимке берём верхний
