"""Шпильки → «Визуализация» (3D-карта дефектов шпилек): страница, файлы карты, загрузка реестра, права."""
import datetime as dt
import io
import json
import os
import re
import shutil
import subprocess

import openpyxl
import pytest

from app import stud_map_data as smd


def _data_dir(app):
    return os.path.join(os.path.dirname(app.config['DB_PATH']), 'stud_map')


def _register_xlsx(rows=None, sheet='Реестр дефектов'):
    """Мини-реестр в формате цеха: колонки A..O как в Stud_Defect_Register_BS."""
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
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf


def test_anonymous_gets_nothing(anon_client):
    assert anon_client.get('/studs/map').status_code == 302
    assert anon_client.get('/studs/map/app/defects.json').status_code == 302
    assert anon_client.get('/api/stud-map/status').status_code == 401


def html_page(client):
    return client.get('/studs/map').get_data(as_text=True)


def test_page_and_code(client):
    r = client.get('/studs/map')
    assert r.status_code == 200 and 'Шпильки' in r.get_data(as_text=True)
    r = client.get('/studs/map/app/')
    html = r.get_data(as_text=True)
    assert r.status_code == 200 and 'Карта дефектов шпилек' in html
    js = next(n for n in os.listdir(os.path.join(client.application.static_folder, 'stud-map')) if n.startswith('app.') and n.endswith('.js'))
    assert client.get('/studs/map/app/' + js).status_code == 200
    # сжатая копия скрипта — только с Accept-Encoding: gzip, и распаковывается в тот же файл
    import gzip as _gz
    plain = client.get('/studs/map/app/' + js, headers={'Accept-Encoding': 'identity'})
    zipped = client.get('/studs/map/app/' + js, headers={'Accept-Encoding': 'gzip, deflate'})
    assert plain.headers.get('Content-Encoding') is None
    assert zipped.headers['Content-Encoding'] == 'gzip' and 'javascript' in zipped.headers['Content-Type']
    assert _gz.decompress(zipped.data) == plain.data and len(zipped.data) < len(plain.data) / 2
    assert client.get('/studs/map/app/' + js + '.gz').status_code == 404
    # вкладка «Визуализация» — третья на странице «Шпильки» (после «Записать» и «Журнал»),
    # а в «Аналитике» карты нет
    studs = client.get('/studs').get_data(as_text=True)
    assert 'href="/studs/map"' in studs and 'Визуализация' in studs
    assert studs.index('tabRecBtn') < studs.index('tabLogBtn') < studs.index('tabMapBtn')
    assert '/studs/map' not in client.get('/analytics').get_data(as_text=True)
    # со страницы карты — обратно на «Записать» и «Журнал»
    assert 'href="/studs#rec"' in html_page(client) and 'href="/studs#log"' in html_page(client)


def test_data_comes_from_server_folder_not_git(app, client):
    assert client.get('/studs/map/app/defects.json').status_code == 404
    st = client.get('/api/stud-map/status').get_json()
    assert st['has_data'] is False and st['has_schemes'] is False and st['can_upload'] is True
    d = _data_dir(app)
    os.makedirs(os.path.join(d, 'body'), exist_ok=True)
    with open(os.path.join(d, 'body', 'x.webp'), 'wb') as f:
        f.write(b'RIFF0000WEBP')
    for name in ('body.json', 'views.json'):
        with open(os.path.join(d, name), 'w', encoding='utf-8') as f:
            f.write('{}')
    assert client.get('/studs/map/app/body/x.webp').data == b'RIFF0000WEBP'
    assert client.get('/studs/map/app/views.json').status_code == 200
    assert client.get('/api/stud-map/status').get_json()['has_schemes'] is True


@pytest.mark.parametrize('path', ['body/..%2F..%2Fwelding_shop.db', '..%2F..%2Fconfig.py', 'body/', 'img/../../test.db'])
def test_no_path_traversal(client, path):
    assert client.get('/studs/map/app/' + path).status_code == 404


def test_upload_register(app, client):
    r = client.post('/api/stud-map/register', data={'file': (_register_xlsx(), 'Stud_Defect_Register_BS_rev12.xlsx')},
                    content_type='multipart/form-data')
    j = r.get_json()
    assert r.status_code == 200 and j['status'] == 'ok' and j['rows'] == 2
    data = json.loads(client.get('/studs/map/app/defects.json').get_data(as_text=True))
    a13t = next(x for x in data['rows'] if x['model'] == 'A13T')
    assert a13t['body_no'] == '6723' and a13t['week'] == 'W46' and a13t['stud_no'] == 300 and a13t['category'] == 'Непровар (SW)'
    assert data['source'].startswith('Stud_Defect_Register_BS_rev12.xlsx')
    st = client.get('/api/stud-map/status').get_json()
    assert st['has_data'] is True and st['rows'] == 2 and st['updated']
    assert os.path.isfile(os.path.join(_data_dir(app), 'register.xlsx'))
    assert not [n for n in os.listdir(_data_dir(app)) if n.endswith('.tmp')]


def test_upload_rejects_bad_files(client):
    r = client.post('/api/stud-map/register', data={'file': (io.BytesIO(b'hello'), 'a.txt')}, content_type='multipart/form-data')
    assert r.status_code == 400
    r = client.post('/api/stud-map/register', data={'file': (io.BytesIO(b'not excel'), 'a.xlsx')}, content_type='multipart/form-data')
    assert r.status_code == 400 and 'Excel' in r.get_json()['message']
    r = client.post('/api/stud-map/register', data={'file': (_register_xlsx(sheet='Лист1'), 'a.xlsx')}, content_type='multipart/form-data')
    assert r.status_code == 400 and 'Реестр дефектов' in r.get_json()['message']


def test_only_weldteam_uploads(register_client):
    c = register_client(department='ОТК')
    assert c.get('/studs/map').status_code == 200            # смотреть может любой отдел
    assert c.get('/studs/map/app/').status_code == 200
    assert c.get('/api/stud-map/status').get_json()['can_upload'] is False
    r = c.post('/api/stud-map/register', data={'file': (_register_xlsx(), 'r.xlsx')}, content_type='multipart/form-data')
    assert r.status_code == 403


def test_build_marks_mass_events(tmp_path):
    rows = [(i, '777', 'A01', dt.datetime(2026, 11, 3), 'Погнута / Bent', 'Кузовной цех', 'FRONT FLOOR', 1, 6000 + i)
            for i in range(1, 11)]
    p = tmp_path / 'r.xlsx'
    p.write_bytes(_register_xlsx(rows).getvalue())
    data, notes = smd.build(p)
    assert len(data['rows']) == 10 and all(x['mass'] for x in data['rows'])
    assert any('10 строк' in n for n in notes)


def test_read_only_department_sees_map(register_client):
    """ОТО в «Шпильках» только читает — карту видит, реестр не загружает."""
    c = register_client(department='ОТО')
    assert c.get('/studs/map').status_code == 200
    assert c.get('/api/stud-map/status').get_json()['can_upload'] is False
    r = c.post('/api/stud-map/register', data={'file': (_register_xlsx(), 'r.xlsx')}, content_type='multipart/form-data')
    assert r.status_code == 403


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
    # «все шпильки вида» по умолчанию выключено; переключатель — в меню «⋯» карты, флажок на панели скрыт
    assert 'ghost:!1,' in bundle and 'id="ghostToggle"' in html and '<input type="checkbox" id="ghost" hidden' in html
    # кнопки «Весь кузов / станции» спрятаны за «⋯» у «Видов дефектов»
    assert 'id="cbMore"' in html and 'id="catBase" role="group" aria-label="Процент — от шпилек" hidden' in html
    # «во весь экран» без Fullscreen API (iPhone): окно карты растягивается на всю страницу
    assert 'window.frameElement' in html and "fe.classList.toggle('sm-fs', on)" in html
    assert '.sm-frame.sm-fs{position:fixed' in html_page(client)
    assert "getAttribute('data-theme')" in html and ':root[data-theme="dark"]' in html
    assert '.s-model { display: none !important; }' in html and "querySelectorAll('#models .chip')" in html
    # на «Визуализации» нет заголовка раздела — только строка вкладок над картой
    page = html_page(client)
    assert 'class="page-head"' not in page and 'Недостающие шпильки' not in page
    # строки «файл · дата · кто» нет — это подсказка маленькой кнопки «Обновить реестр» (её видят WeldTeam/админ)
    assert 'smSource' not in page and '↻ Обновить реестр' in page and 'id="smUpload" hidden' in page


def test_layout_mode(client):
    """Режим «Запись»: кнопка справа от модели; 3D — общее с картой дефектов (флажок в той же сборке,
    второго 3D нет), А-лист — отдельный блок без дефектов; код режима — layout.js."""
    code = os.path.join(client.application.static_folder, 'stud-map')
    html = client.get('/studs/map/app/').get_data(as_text=True)
    assert 'id="recBtn"' in html and '>Запись<' in html and '<div class="lay" id="lay" hidden>' in html
    assert html.index('id="vtitle"') < html.index('id="recBtn"') < html.index('id="viewSeg"') < html.index('id="stBar"')
    assert 'data-v="3d"' in html and 'data-v="sheet"' in html and 'id="recCard"' in html
    assert re.search(r'<script src="layout\.js\?v=\d+" defer></script>', html)
    assert '.sm-rec .panel' in html                                   # аналитика в «Записи» скрыта
    js = client.get('/studs/map/app/layout.js').get_data(as_text=True)
    assert "fetch('views.json'" in js and 'window.__smRec = rec' in js and 'window.__smPick' in js
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
def test_layout_script_has_no_syntax_errors():
    path = os.path.join('app', 'static', 'stud-map', 'layout.js')
    assert subprocess.run(['node', '--check', path], capture_output=True).returncode == 0
