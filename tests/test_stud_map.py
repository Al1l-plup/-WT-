"""Шпильки: 3D-карта дефектов шпилек на странице «Шпильки» — файлы карты, данные (Excel-реестр из
папки данных + записи сайта), запись по QR в 3D, права."""
import datetime as dt
import io
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
from pathlib import Path

import openpyxl
import pytest

from app import stud_map_data as smd

ROOT = Path(__file__).resolve().parents[1]
VIN = 'MXMDB21B1TK003922'                     # Chery Tiggo 2 Pro (схема A13T) — с контрольной карты
JPEG = b'\xff\xd8\xff\xe0' + b'\x00' * 64      # достаточно сигнатуры: сервер смотрит содержимое


def _data_dir(app):
    return os.path.join(os.path.dirname(app.config['DB_PATH']), 'stud_map')


def _bundle_name(app):
    """Скрипт карты app.<хеш>.js (не его .gz-копия: порядок os.listdir в Linux не алфавитный)."""
    names = [n for n in os.listdir(os.path.join(app.static_folder, 'stud-map'))
             if n.startswith('app.') and n.endswith('.js')]
    assert len(names) == 1, names
    return names[0]


def _register_xlsx(rows=None, sheet='Реестр дефектов', weekly=None):
    """Мини-реестр в формате цеха: колонки A..O как в Stud_Defect_Register_BS.
    weekly — (заголовки недель, объёмы) для листа «WEEKLY ANALYSIS»."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet
    ws.append(['№', 'Кузов', 'Модель', 'Дата', '', '', '', '', 'Категория', 'Источник', 'Станция', 'Кол-во', '', '', '№ шпильки'])
    for r in rows if rows is not None else [
        (1, '06723', 'A13T', dt.datetime(2026, 11, 10), 'Склейка / Stick Weld (SW)', 'Кузовной цех', 'FRONT FLOOR', 2, 300),
        (2, '7604', 'CS55p', dt.datetime(2026, 11, 16), 'Отсутствует / Missing', 'Кузовной цех', 'REAR FLOOR', 1, None),
    ]:
        n, body, model, date, cat, src, loc, qty, stud = r
        ws.append([n, body, model, date, None, None, None, None, cat, src, loc, qty, None, None, stud])
    if weekly:
        wa = wb.create_sheet('WEEKLY ANALYSIS')
        wa.append(['Показатель', *weekly[0]])
        wa.append(['Объём производства', *weekly[1]])
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf


def _build(tmp_path, rows, **kw):
    p = tmp_path / 'r.xlsx'
    p.write_bytes(_register_xlsx(rows, **kw).getvalue())
    return smd.build(p)


def _row(i, cat='Погнута / Bent', model='A01', body='777', date=dt.datetime(2026, 11, 3), qty=1, stud=None, loc='FRONT FLOOR'):
    return (i, body, model, date, cat, 'Кузовной цех', loc, qty, stud)


def _put_register(app, content, bump=0):
    """Положить реестр в папку данных карты (как его кладут на сервере). bump — сдвиг времени файла,
    чтобы замена файла была видна, даже если запись прошла в ту же долю секунды."""
    d = _data_dir(app)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, smd.REGISTER_FILE)
    with open(p, 'wb') as f:
        f.write(content.getvalue() if hasattr(content, 'getvalue') else content)
    if bump:
        t = os.stat(p).st_mtime + bump
        os.utime(p, (t, t))
    return p


def _db(app):
    con = sqlite3.connect(app.config['DB_PATH'])
    con.row_factory = sqlite3.Row
    return con


def _post_record(c, stud_no=4021, scheme='A13T', vin=VIN):
    return c.post('/api/studs/records', data={'vin': vin, 'scheme_code': scheme, 'stud_no': str(stud_no),
                                              'photo': (io.BytesIO(JPEG), 'p.jpg')},
                  content_type='multipart/form-data').get_json()


def _defects(c):
    r = c.get('/studs/map/app/defects.json')
    assert r.status_code == 200 and r.headers['Cache-Control'] == 'no-cache'
    return json.loads(r.get_data(as_text=True))


# ── страница и файлы карты ───────────────────────────────────────────────────

def test_anonymous_gets_nothing(anon_client):
    assert anon_client.get('/studs/map').status_code == 302
    assert anon_client.get('/studs/map/app/defects.json').status_code == 302
    assert anon_client.get('/api/stud-map/status').status_code == 401


def test_old_map_address_goes_to_studs(client):
    """Отдельной вкладки «Визуализация» больше нет: старый адрес ведёт на «Шпильки»."""
    r = client.get('/studs/map')
    assert r.status_code == 302 and r.headers['Location'].endswith('/studs')


def test_page_and_code(client):
    r = client.get('/studs/map/app/')
    html = r.get_data(as_text=True)
    assert r.status_code == 200 and 'Карта дефектов шпилек' in html
    js = _bundle_name(client.application)
    assert client.get('/studs/map/app/' + js).status_code == 200
    # сжатая копия скрипта — только с Accept-Encoding: gzip, и распаковывается в тот же файл
    import gzip as _gz
    plain = client.get('/studs/map/app/' + js, headers={'Accept-Encoding': 'identity'})
    zipped = client.get('/studs/map/app/' + js, headers={'Accept-Encoding': 'gzip, deflate'})
    assert plain.headers.get('Content-Encoding') is None
    assert zipped.headers['Content-Encoding'] == 'gzip' and 'javascript' in zipped.headers['Content-Type']
    assert _gz.decompress(zipped.data) == plain.data and len(zipped.data) < len(plain.data) / 2
    assert client.get('/studs/map/app/' + js + '.gz').status_code == 404
    # в «Аналитике» карты нет
    assert '/studs/map' not in client.get('/analytics').get_data(as_text=True)


def test_studs_page_record_and_map_together(client):
    """«Записать» и карта — одна вкладка: машина по QR, ниже карта (3D для записи / карта дефектов),
    рядом — А-лист раздела; вторая вкладка — «Журнал»."""
    page = client.get('/studs').get_data(as_text=True)
    assert '>Запись и карта<' in page and 'id="tabLogBtn"' in page
    assert 'tabMapBtn' not in page and 'href="/studs/map"' not in page
    assert page.index('id="carCard"') < page.index('id="mapCard"') < page.index('id="schemeCard"')
    assert 'id="smBox"' in page and 'data-v="3d"' in page and 'data-v="sheet"' in page
    assert '.sm-frame.sm-fs{position:fixed' in page                  # «во весь экран» на iPhone
    assert 'Загрузить реестр' not in page and 'smUpload' not in page
    src = re.search(r'<script src="/static/studs\.js\?v=(\d+)"></script>', page)
    assert src and int(src.group(1)) >= 14
    js = (ROOT / 'app' / 'static' / 'studs.js').read_text(encoding='utf-8')
    # нажатие в 3D → та же запись с фото; номер карты — номер цеха (label); модель — по схеме
    assert "mapFrame.src = '/studs/map/app/'" in js and "fetch('/api/stud-map/status')" in js
    assert 'w.__smRecordStud = ({ no }) => onMapPick(no)' in js and 'w.SM.setRecord(want)' in js
    assert 'String(x.label) === String(no)' in js
    assert 'сначала сфотографируйте <b>верхний QR</b> машины' in js       # без машины — сначала QR


def test_data_comes_from_server_folder_not_git(app, client):
    st = client.get('/api/stud-map/status').get_json()
    assert st['has_data'] is False and st['has_schemes'] is False and st['register'] is None and st['site_rows'] == 0
    data = _defects(client)
    assert data['rows'] == [] and data['source'] == 'данных пока нет'
    d = _data_dir(app)
    os.makedirs(os.path.join(d, 'body'))
    with open(os.path.join(d, 'body', 'x.webp'), 'wb') as f:
        f.write(b'RIFF0000WEBP')
    for name in ('body.json', 'views.json'):
        with open(os.path.join(d, name), 'w', encoding='utf-8') as f:
            f.write('{}')
    assert client.get('/studs/map/app/body/x.webp').data == b'RIFF0000WEBP'
    assert client.get('/studs/map/app/views.json').status_code == 200
    assert client.get('/api/stud-map/status').get_json()['has_schemes'] is True


@pytest.mark.parametrize('path', ['body/..%2F..%2Fwelding_shop.db', '..%2F..%2Fconfig.py', 'body/', 'img/../../test.db',
                                  'register.xlsx'])
def test_no_path_traversal(app, client, path):
    _put_register(app, _register_xlsx())
    assert client.get('/studs/map/app/' + path).status_code == 404


# ── реестр из папки данных (без загрузки через сайт) ─────────────────────────

def test_register_from_data_folder(app, client):
    _put_register(app, _register_xlsx())
    data = _defects(client)
    a13t = next(x for x in data['rows'] if x['model'] == 'A13T')
    assert a13t['body_no'] == '6723' and a13t['week'] == '2026-W46' and a13t['stud_no'] == 300
    assert a13t['category'] == 'Непровар (SW)' and a13t['location'] == 'FRONT FLOOR'
    assert data['source'].startswith('register.xlsx')
    st = client.get('/api/stud-map/status').get_json()
    assert st['has_data'] is True and st['register']['rows'] == 2 and st['register']['error'] is None
    assert any('2 строк' in n for n in st['register']['notes'])
    # реестр заменили — карта пересобирается сама
    _put_register(app, _register_xlsx([_row(i) for i in range(1, 4)]), bump=5)
    assert len(_defects(client)['rows']) == 3


def test_bad_register_reported(app, client):
    _put_register(app, b'not excel')
    st = client.get('/api/stud-map/status').get_json()
    assert 'Excel' in st['register']['error'] and st['has_data'] is False
    assert _defects(client)['rows'] == []                            # карта не падает


def test_no_upload_from_site(client):
    r = client.post('/api/stud-map/register', data={'file': (_register_xlsx(), 'r.xlsx')}, content_type='multipart/form-data')
    assert r.status_code in (404, 405)


def test_update_script_checks_and_places_register(tmp_path):
    reg = tmp_path / 'Stud_Defect_Register_BS_rev12.xlsx'
    reg.write_bytes(_register_xlsx().getvalue())
    out = tmp_path / 'stud_map'
    r = subprocess.run([sys.executable, str(ROOT / 'scripts' / 'stud_map_update.py'), str(reg), str(out)],
                       capture_output=True, text=True, encoding='utf-8', env={**os.environ, 'PYTHONIOENCODING': 'utf-8'})
    assert r.returncode == 0, r.stderr
    assert (out / smd.REGISTER_FILE).read_bytes() == reg.read_bytes() and sorted(os.listdir(out)) == [smd.REGISTER_FILE]
    bad = tmp_path / 'bad.xlsx'
    bad.write_bytes(b'not excel')
    r = subprocess.run([sys.executable, str(ROOT / 'scripts' / 'stud_map_update.py'), str(bad), str(tmp_path / 'x')],
                       capture_output=True, text=True, encoding='utf-8', env={**os.environ, 'PYTHONIOENCODING': 'utf-8'})
    assert r.returncode != 0 and not (tmp_path / 'x' / smd.REGISTER_FILE).exists()


# ── записи сайта на карте ────────────────────────────────────────────────────

def test_site_records_on_map(app, client):
    """Запись по QR (машина → шпилька → фото) сразу на карте; категория — после разбора ИТО/УЗК."""
    with _db(app) as con:
        shop_no = con.execute('SELECT shop_no FROM stud WHERE stud_no=4021').fetchone()['shop_no']
    # в реестре эта шпилька — на REAR FLOOR: станция записи сайта берётся оттуда
    _put_register(app, _register_xlsx([_row(1, model='A13T', stud=int(shop_no), loc='REAR FLOOR')]))
    rec = _post_record(client)['record']
    data = _defects(client)
    site = [x for x in data['rows'] if x.get('site_id')]
    assert len(site) == 1 and len(data['rows']) == 2 and 'записи сайта — 1' in data['source']
    x = site[0]
    today = dt.date.fromisoformat(rec['created_at'][:10])
    assert (x['model'], x['stud_no'], x['studs'], x['mass']) == ('A13T', int(shop_no), 1, False)
    assert x['category'] == 'Не указано' and x['body_no'] == '…' + VIN[-6:]
    assert x['week'] == '{}-W{:02d}'.format(*today.isocalendar()[:2]) and x['location'] == 'REAR FLOOR'
    r = client.patch(f'/api/studs/records/{rec["id"]}', json={'category': 'shifted', 'source': 'body'})
    assert r.get_json()['status'] == 'success'
    x = next(x for x in _defects(client)['rows'] if x.get('site_id'))
    assert x['category'] == 'Смещение' and x['source'] == 'Кузовной цех'
    st = client.get('/api/stud-map/status').get_json()
    assert st['site_rows'] == 1 and st['has_data'] is True


def test_site_rows_rules():
    def rec(i, scheme='A13T', shop='300', vin='MXMDB21B1TK000001', cat=None, station=None, day='2026-11-20'):
        return {'id': i, 'created_at': day + 'T08:00:00', 'vin_key': vin, 'scheme_code': scheme, 'stud_no': 4000 + i,
                'shop_no': shop, 'station': station, 'category': cat, 'source': None}
    records = ([rec(i) for i in range(1, 11)]                              # 10 шпилек одной машины за день
               + [rec(11, scheme='XX'), rec(12, shop='6024?'), rec(13, cat='stick', vin='MXMDB21B1TK000002', station='RF')])
    rows, skipped = smd.site_rows(records, locations={('A13T', 300): 'FRONT FLOOR'})
    assert len(rows) == 11 and skipped == {'схема без карты': 1, 'номер шпильки уточняется': 1}
    assert all(x['mass'] for x in rows[:10]) and not rows[10]['mass']       # «массовое» — по VIN машины
    assert rows[0]['location'] == 'FRONT FLOOR' and rows[10]['location'] == 'RF'
    assert rows[10]['category'] == 'Непровар (SW)' and rows[0]['week'] == '2026-W47'


def test_scheme_model_matches_catalog(app):
    """У каждой схемы раздела есть модель карты; номера шпилек — общие (номер цеха)."""
    with _db(app) as con:
        schemes = {r['code'] for r in con.execute('SELECT code FROM stud_scheme')}
    assert schemes == set(smd.SCHEME_MODEL) and set(smd.SCHEME_MODEL.values()) == set(smd.BRAND)


def test_read_only_department_sees_map(register_client):
    """ОТО в «Шпильках» только читает — карту и её данные видит."""
    c = register_client(department='ОТО')
    assert c.get('/studs').status_code == 200
    assert c.get('/studs/map/app/').status_code == 200
    assert c.get('/studs/map/app/defects.json').status_code == 200
    assert c.get('/api/stud-map/status').status_code == 200


# ── разбор реестра ───────────────────────────────────────────────────────────

def test_build_marks_mass_events(tmp_path):
    data, notes = _build(tmp_path, [_row(i, stud=6000 + i) for i in range(1, 11)])
    assert len(data['rows']) == 10 and all(x['mass'] for x in data['rows'])
    assert any('10 строк' in n for n in notes)


def test_no_body_number_is_never_mass(tmp_path):
    """Записи без номера кузова — не «один кузов»: не склеиваются и массовыми не помечаются."""
    data, _ = _build(tmp_path, [_row(i, body=None) for i in range(1, 13)] + [_row(13, body='000')])
    assert len(data['rows']) == 13 and not any(x['mass'] for x in data['rows'])
    assert all(x['body_no'] is None for x in data['rows'])


def test_categories(tmp_path):
    rows = [_row(1, 'Смещение шпильки / Displacement'), _row(2, 'displacement'), _row(3, '  смещение '),
            _row(4, 'Склейка (SW)'), _row(5, None), _row(6, 'Перегрев'), _row(7, 'Перегрев'),
            _row(8, 'Stick Weld (SW)'), _row(9, 'непровар (sw)')]
    data, notes = _build(tmp_path, rows)
    cats = [x['category'] for x in data['rows']]
    assert cats == ['Смещение'] * 3 + ['Непровар (SW)', 'Не указано', 'Не указано', 'Не указано'] + ['Непровар (SW)'] * 2
    assert [x.get('category_raw') for x in data['rows']][4:7] == [None, 'Перегрев', 'Перегрев']
    assert any('«Перегрев» — 2' in n for n in notes)
    assert set(cats) <= set(smd.CATEGORIES)


def test_map_knows_every_category(app):
    """Каждая категория реестра и записей сайта есть в карте (иначе её записи пропадают, а карточка
    шпильки падает)."""
    from app import studs as st
    assert set(smd.SITE_CAT) == set(st.CATEGORIES) and set(smd.SITE_CAT.values()) <= set(smd.CATEGORIES)
    js = open(os.path.join(app.static_folder, 'stud-map', _bundle_name(app)), encoding='utf-8').read()
    for cat in smd.CATEGORIES:
        esc = ''.join(c if ord(c) < 128 else (f'\\x{ord(c):02X}' if ord(c) < 256 else f'\\u{ord(c):04X}') for c in cat)
        assert f'key:"{cat}"' in js or f'key:"{esc}"' in js, cat


def test_models_normalized_and_skips_reported(tmp_path):
    rows = [_row(1, model='A13T '), _row(2, model='cs55P'), _row(3, model='H6'), _row(4, model='H6'),
            _row(5, qty=None), _row(6, date='вчера')]
    data, notes = _build(tmp_path, rows)
    assert [x['model'] for x in data['rows']] == ['A13T', 'CS55p']
    text = '; '.join(notes)
    assert 'H6 — 2' in text and 'без количества шпилек: 1' in text and 'без даты' in text


def test_week_has_year(tmp_path):
    """Неделя — с годом: на стыке лет порядок верный, одинаковые номера недель разных лет не склеиваются."""
    rows = [_row(1, date=dt.datetime(2026, 11, 10)), _row(2, date=dt.datetime(2026, 12, 30)),
            _row(3, date=dt.datetime(2027, 1, 5)), _row(4, date=dt.datetime(2027, 11, 16))]
    data, notes = _build(tmp_path, rows, weekly=(['W53', 'W01', 'Итого'], [900, 1000, 1900]))
    weeks = [x['week'] for x in data['rows']]
    assert weeks == ['2026-W46', '2026-W53', '2027-W01', '2027-W46'] == sorted(weeks)
    assert data['volumeAll'] == {'2026-W53': 900, '2027-W01': 1000}
    assert any(n.startswith('нет выпуска') and '2026-W46' in n for n in notes)


def test_weekly_volume_years_from_order(tmp_path):
    """Год у недель листа выпуска выводится из порядка колонок; явный год в заголовке — главнее."""
    rows = [_row(1, date=dt.datetime(2026, 12, 22)), _row(2, date=dt.datetime(2027, 1, 12))]
    data, _ = _build(tmp_path, rows, weekly=(['W51', 'W52', 'W53', 'W01', 'W02', '2027-W03'], [1, 2, 3, 4, 5, 6]))
    assert data['volumeAll'] == {'2026-W51': 1, '2026-W52': 2, '2026-W53': 3,
                                 '2027-W01': 4, '2027-W02': 5, '2027-W03': 6}


def test_volume_sheets(tmp_path):
    """Необязательные листы «Выпуск» (по неделям и моделям) и «Шпильки на станциях»."""
    rows = [_row(1, date=dt.datetime(2026, 12, 30)), _row(2, model='A13T', date=dt.datetime(2027, 1, 5))]
    wb = openpyxl.load_workbook(_register_xlsx(rows))
    ws = wb.create_sheet('Выпуск')
    for r in (['Неделя', 'A01', 'A13T шт'], ['W53', 100, 50], [None, None, None], ['W01', 110, 0]):
        ws.append(r)
    st = wb.create_sheet('Шпильки на станциях')
    for r in (['Модель', 'Станция', 'Шпилек'], ['a13t', 'FRONT FLOOR', 40], ['H6', 'X', 5]):
        st.append(r)
    p = tmp_path / 'r.xlsx'
    wb.save(p)
    data, _ = smd.build(p)
    assert data['volume'] == {'A01': {'2026-W53': 100, '2027-W01': 110}, 'A13T': {'2026-W53': 50}}
    assert data['stationStuds'] == {'A13T': {'FRONT FLOOR': 40}}


# ── код карты ────────────────────────────────────────────────────────────────

def test_third_party_licenses(app):
    """three.js (MIT) и шрифты (SIL OFL) можно распространять только вместе с текстом лицензии."""
    root = os.path.join(app.static_folder, 'stud-map')
    js = open(os.path.join(root, _bundle_name(app)), encoding='utf-8').read()
    three = open(os.path.join(root, 'three.LICENSE.txt'), encoding='utf-8').read()
    # REVISION three.js стоит перед константой MOUSE — имя переменной после сборки любое
    rev = re.search(r'="(\d{3})",[\w$]+=\{LEFT:0,MIDDLE:1,RIGHT:2', js)
    assert rev and rev.group(1) == '147', 'three.js в бандле другой версии — обновите three.LICENSE.txt и docs/STUD_MAP.md'
    assert 'The MIT License' in three and 'three.js authors' in three
    licenses = {'ibm-plex-sans': 'IBM-Plex.LICENSE.txt', 'ibm-plex-mono': 'IBM-Plex.LICENSE.txt',
                'manrope': 'Manrope.OFL.txt'}
    for font in os.listdir(os.path.join(root, 'fonts')):
        if not font.endswith('.woff2'):
            continue
        family = re.sub(r'-(cyrillic|latin)-\d+-\w+\.woff2$', '', font)
        assert family in licenses, f'{font}: положите рядом лицензию шрифта и допишите её сюда'
        text = open(os.path.join(root, 'fonts', licenses[family]), encoding='utf-8').read()
        assert 'SIL OPEN FONT LICENSE Version 1.1' in text, licenses[family]


def test_map_page_script_and_theme(client):
    """index.html карты подключает существующий app.*.js (при правке сборки файл переименовывают —
    его кешируют на год), фон 3D-сцены берётся из темы сайта, модель выбирают в плашке вверху."""
    code = os.path.join(client.application.static_folder, 'stud-map')
    html = client.get('/studs/map/app/').get_data(as_text=True)
    src = re.search(r'<script src="(app\.[0-9a-f]+\.js)" defer>', html).group(1)
    assert src in os.listdir(code) and src + '.gz' in os.listdir(code)
    assert [n for n in os.listdir(code) if n.startswith('app.') and n.endswith('.js')] == [src]   # старых сборок нет
    with open(os.path.join(code, src), encoding='utf-8') as f:
        bundle = f.read()
    assert 'window.__smBg' in bundle
    # категория дефекта фильтрует сводку/«Виды дефектов»/«Станции» и счётчики недель и моделей; есть кнопка «Все»
    assert '_().filter(g).filter(_e=>l.cats.has(_e.category))' in bundle
    assert 'let x=_().filter(k=>l.cats.has(k.category));' in bundle and 'g(N)&&l.cats.has(N.category)' in bundle
    assert 'N.dataset.all="1"' in bundle
    # неизвестная категория не роняет карту, неделя с годом подписывается коротко
    assert '__oc=r=>ai[r]||ai[' in bundle and '__wf=k=>' in bundle
    # «все шпильки вида» по умолчанию выключено; переключатель — в меню «⋯» карты, флажок на панели скрыт
    assert 'ghost:!1,' in bundle and 'id="ghostToggle"' in html and '<input type="checkbox" id="ghost" hidden' in html
    # кнопки «Весь кузов / станции» спрятаны за «⋯» у «Видов дефектов»
    assert 'id="cbMore"' in html and 'id="catBase" role="group" aria-label="Процент — от шпилек" hidden' in html
    # «во весь экран» без Fullscreen API (iPhone): окно карты растягивается на всю страницу
    assert 'window.frameElement' in html and "fe.classList.toggle('sm-fs', on)" in html
    assert "getAttribute('data-theme')" in html and ':root[data-theme="dark"]' in html
    assert '.s-model { display: none !important; }' in html and "querySelectorAll('#models .chip')" in html
    # телефон: всё, на что нажимают, — от 44px
    assert '@media (pointer: coarse)' in html and 'min-height: 44px' in html


def test_layout_mode(client):
    """Режим «Запись»: 3D — общее с картой дефектов (флажок в той же сборке, второго 3D нет). Во фрейме
    страницы «Шпильки» без машины — обычная карта, по умолчанию «Запись» (где какие шпильки) с кнопкой
    «Дефекты»; машина по QR — модель и режим задаёт страница (window.SM), нажатие уходит ей."""
    code = os.path.join(client.application.static_folder, 'stud-map')
    html = client.get('/studs/map/app/').get_data(as_text=True)
    assert 'id="recBtn"' in html and '>Запись<' in html and '<div class="lay" id="lay" hidden>' in html
    assert html.index('id="vtitle"') < html.index('id="recBtn"') < html.index('id="viewSeg"') < html.index('id="stBar"')
    assert 'data-v="3d"' in html and 'data-v="sheet"' in html and 'id="recCard"' in html
    assert re.search(r'<script src="layout\.js\?v=\d+" defer></script>', html)
    assert '.sm-rec .panel' in html                                   # аналитика в «Записи» скрыта
    assert 'html.sm-car #recBtn' in html and 'html.sm-embed #recBtn' not in html   # кнопка скрыта только с машиной
    js = client.get('/studs/map/app/layout.js').get_data(as_text=True)
    assert "fetch('views.json'" in js and 'window.__smRec = rec' in js and 'window.__smPick' in js
    assert 'window.SM = {' in js and 'setRecord(model)' in js and "classList.toggle('sm-embed', embedded)" in js
    assert "root.classList.toggle('sm-car', carMode)" in js
    assert 'if (carMode && hook) { hook({ model: mapModel() || S.model, no, part: s && s.part }); return; }' in js
    assert "(embedded ? 'rec' : 'defects')" in js                   # во фрейме сначала — где какие шпильки
    src = re.search(r'<script src="(app\.[0-9a-f]+\.js)" defer>', html).group(1)
    with open(os.path.join(code, src), encoding='utf-8') as f:
        bundle = f.read()
    # в той же сборке: «Запись» — все шпильки обычным видом с номерами, нажатие сообщается странице
    assert 'window.__smRec?"ok":"ghost"' in bundle and 'window.__smPick&&window.__smPick(p.no,p)' in bundle
    assert 'window.__smRedraw=()=>qi(!1)' in bundle and bundle.count('new Ts') == 1   # одна 3D-сцена
    assert 'B.n>=2||window.__smRec||' in bundle                        # номера видны и в обзоре (без наложений)
    assert 'N="copper",' in bundle and 'color:13924366' in bundle      # все шпильки золотистые, насыщенный цвет
    assert 'function vr(p){}' in bundle                                 # без всплывающих подсказок у станций


@pytest.mark.skipif(shutil.which('node') is None, reason='node недоступен')
@pytest.mark.parametrize('path', [('app', 'static', 'stud-map', 'layout.js'), ('app', 'static', 'studs.js')])
def test_scripts_have_no_syntax_errors(path):
    r = subprocess.run(['node', '--check', os.path.join(*path)], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
