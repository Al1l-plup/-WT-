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
VIN = 'MXMDB21B9TK193362'                     # Chery Tiggo 4 (A13T) — с контрольной карты
TOP_QR = VIN + 'CRT19-BE4TD62NS-----|TC_KZ_E-KZ.0774.00047|CHERY_TIGGO_4|1798 кг|1044 кг|854 кг|'
JPEG = b'\xff\xd8\xff\xe0' + b'\x00' * 64      # достаточно сигнатуры: сервер смотрит содержимое
PNG = b'\x89PNG\r\n\x1a\n' + b'\x00' * 64
BLOCKS = {'P01G': (1001, 1099), 'A01': (2001, 2092), 'CS55': (3001, 3042), 'A13T': (4001, 4093)}


def _db(app):
    con = sqlite3.connect(app.config['DB_PATH'])
    con.row_factory = sqlite3.Row
    return con


def _post_record(c, vin=VIN, scheme='A13T', stud_no=4021, photo=JPEG, name='p.jpg'):
    data = {'vin': vin, 'scheme_code': scheme, 'stud_no': str(stud_no)}
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
    assert len(rows) == 326
    for r in rows:
        lo, hi = BLOCKS[r['scheme_code']]
        assert lo <= r['stud_no'] <= hi
        assert r['vs'] == r['scheme_code']
        assert 0 <= r['x'] <= 100 and 0 <= r['y'] <= 100
    counts = {}
    for r in rows:
        counts[r['scheme_code']] = counts.get(r['scheme_code'], 0) + 1
    assert counts == {'P01G': 99, 'A01': 92, 'CS55': 42, 'A13T': 93}


def test_catalog_api(client):
    d = client.get('/api/studs/catalog').get_json()
    assert [s['code'] for s in d['schemes']] == ['P01G', 'A01', 'CS55', 'A13T']
    assert len(d['studs']) == 326
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


# ── запись оператора ─────────────────────────────────────────────────────────

def test_create_record_keeps_raw_vin_and_saves_photo(app, client):
    raw = 'mxmdb21b9tk193362'
    res = _post_record(client, vin=raw).get_json()
    assert res['status'] == 'success'
    rec = res['record']
    assert rec['vin'] == raw and rec['vin_key'] == VIN       # сырое как ввели + рабочий ключ
    assert rec['stud_no'] == 4021 and rec['scheme_code'] == 'A13T' and rec['has_photo']
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
    assert {r['stud_no'] for r in q('q=4030')} == {4030}
    assert len(q('vin=' + VIN)) == 2
    assert len(q('q=LVVDB')) == 1
    assert len(q('scheme=A01')) == 0


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
