"""Шпильки: 3D-карта дефектов шпилек — на странице «Шпильки» (/studs), во фрейме.

* /studs/map                  — прежний адрес отдельной вкладки «Визуализация» → /studs.
* /studs/map/app/...          — сама карта: код из app/static/stud-map/ (в git), схемы из
                                data/stud_map/ (НЕ в git — чертежи OEM). Всё — только для вошедших.
* /studs/map/app/defects.json — данные карты, собираются на лету: Excel-реестр цеха из папки
                                данных (data/stud_map/register.xlsx, если лежит) + записи раздела
                                «Шпильки» (QR машины → шпилька → фото).
* /api/stud-map/status        — установлены ли схемы, есть ли данные, что с реестром.

Реестр через сайт не загружается: файл кладут в папку данных на сервере
(или scripts/stud_map_update.py — проверит и положит). Пересборка — сама, когда файл поменялся.
Доступ — как у раздела «Шпильки» (app/permissions.py: blueprint stud_map → studs).
"""
import datetime as dt
import json
import os
import threading

from flask import Blueprint, Response, abort, current_app, jsonify, redirect, request, send_from_directory

from app import stud_map_data as smd
from app import studs as st
from app.db import get_db

bp = Blueprint('stud_map', __name__)

_cache = {}                 # путь реестра → ((mtime_ns, size), data, notes, error)
_cache_lock = threading.Lock()

_SITE_SQL = """
    SELECT d.id, d.created_at, d.vin_key, d.scheme_code, d.stud_no, s.shop_no,
           COALESCE(NULLIF(d.station, ''), NULLIF(s.station, '')) AS station, d.category, d.source
    FROM stud_defect d LEFT JOIN stud s ON s.stud_no = d.stud_no
    ORDER BY d.id
"""


def _data_dir():
    """data/stud_map/ рядом с БД (в тестах — во временной папке)."""
    return os.path.join(os.path.dirname(current_app.config['DB_PATH']), 'stud_map')


def _code_dir():
    return os.path.join(current_app.static_folder, 'stud-map')


def _register():
    """(data, notes, error, mtime) реестра из папки данных; разбирается заново, только когда файл
    поменялся. Нет файла — (None, [], None, None); файл не реестр — error с причиной."""
    path = os.path.join(_data_dir(), smd.REGISTER_FILE)
    try:
        stt = os.stat(path)
    except OSError:
        return None, [], None, None
    key = (stt.st_mtime_ns, stt.st_size)
    mtime = dt.datetime.fromtimestamp(stt.st_mtime).isoformat(timespec='seconds')
    with _cache_lock:
        hit = _cache.get(path)
        if hit and hit[0] == key:
            return (*hit[1:], mtime)
        try:
            data, notes = smd.build(path, source_name=smd.REGISTER_FILE)
            res = (data, notes, None)
        except smd.RegisterError as e:
            current_app.logger.warning('Карта шпилек: реестр %s не прочитан: %s', path, e)
            res = (None, [], str(e))
        _cache[path] = (key, *res)
    return (*res, mtime)


def _site(register):
    """Строки карты из записей раздела «Шпильки» + что пропущено."""
    records = [dict(r) for r in get_db().execute(_SITE_SQL)]
    locs = smd.locations(register['rows']) if register else {}
    return smd.site_rows(records, sources=st.SOURCES, locations=locs)


@bp.route('/studs/map')
def page():
    return redirect('/studs')


@bp.route('/studs/map/app/')
def app_index():
    resp = send_from_directory(_code_dir(), 'index.html', max_age=0)
    resp.headers['Cache-Control'] = 'no-cache'
    return resp


@bp.route('/studs/map/app/defects.json')
def defects():
    register, _notes, _err, _mtime = _register()
    rows, _skipped = _site(register)
    data = smd.combine(register, rows)
    resp = Response(json.dumps(data, ensure_ascii=False, separators=(',', ':')), mimetype='application/json')
    resp.headers['Cache-Control'] = 'no-cache'       # записи сайта и новый реестр — сразу на карте
    return resp


@bp.route('/studs/map/app/<path:fname>')
def app_file(fname):
    """Файл карты: схемы — из data/stud_map/, всё остальное (JS, шрифты) — из static."""
    top = fname.split('/', 1)[0]
    if fname in smd.DATA_FILES or ('/' in fname and top in smd.DATA_DIRS):
        resp = send_from_directory(_data_dir(), fname, max_age=0 if fname.endswith('.json') else 3600)
        if fname.endswith('.json'):
            resp.headers['Cache-Control'] = 'no-cache'
        return resp
    if top in smd.DATA_DIRS or fname.startswith('.') or fname.endswith('.gz') or fname.endswith('.xlsx'):
        abort(404)
    # скрипт карты (~530 КБ) — заранее сжатая копия .gz (~140 КБ), если браузер её принимает
    if fname.startswith('app.') and fname.endswith('.js') and 'gzip' in request.headers.get('Accept-Encoding', '') \
            and os.path.isfile(os.path.join(_code_dir(), fname + '.gz')):
        resp = send_from_directory(_code_dir(), fname + '.gz', max_age=31536000, mimetype='text/javascript')
        resp.headers['Content-Encoding'] = 'gzip'
        resp.headers['Vary'] = 'Accept-Encoding'
        return resp
    return send_from_directory(_code_dir(), fname, max_age=31536000 if fname.startswith('app.') else 3600)


@bp.route('/api/stud-map/status')
def status():
    d = _data_dir()
    register, notes, error, mtime = _register()
    site, skipped = _site(register)
    reg = None
    if register or error:
        reg = {'file': smd.REGISTER_FILE, 'updated': mtime, 'error': error, 'notes': notes,
               'rows': len(register['rows']) if register else 0}
    return jsonify({
        'has_schemes': all(os.path.isfile(os.path.join(d, f)) for f in ('body.json', 'views.json')),
        'has_data': bool(register or site),
        'register': reg,
        'site_rows': len(site),
        'site_skipped': dict(skipped),
        # схема раздела «Шпильки» → модель карты (номер шпильки у них общий — номер цеха)
        'scheme_model': smd.SCHEME_MODEL,
    })
