"""Шпильки → «Визуализация»: 3D-карта дефектов шпилек.

* /studs/map                  — вкладка «Визуализация» раздела «Шпильки» (шапка сайта + те же
                                вкладки «Записать / Журнал / Визуализация» + карта во фрейме).
* /studs/map/app/...          — сама карта: код из app/static/stud-map/ (в git),
                                данные и схемы из data/stud_map/ (НЕ в git — чертежи OEM и
                                реестр цеха). Всё — только для вошедших (общий щит входа).
* /api/stud-map/status        — есть ли данные, откуда и когда обновлены, можно ли загружать.
* /api/stud-map/register POST — загрузить новый Excel-реестр (WeldTeam/админ) → defects.json.
Доступ — как у раздела «Шпильки» (app/permissions.py: blueprint stud_map → studs);
загрузку реестра дополнительно ограничивает сам эндпоинт (WeldTeam/админ).
"""
import json
import os
import tempfile

from flask import Blueprint, abort, current_app, jsonify, render_template, request, send_from_directory, session

from app import stud_map_data as smd

bp = Blueprint('stud_map', __name__)

UPLOAD_DEPTS = frozenset({'WeldTeam'})
_EXCEL_EXT = ('.xlsx', '.xlsm')


def _data_dir():
    """data/stud_map/ рядом с БД (в тестах — во временной папке)."""
    return os.path.join(os.path.dirname(current_app.config['DB_PATH']), 'stud_map')


def _code_dir():
    return os.path.join(current_app.static_folder, 'stud-map')


def _can_upload():
    return bool(session.get('is_admin')) or session.get('dept') in UPLOAD_DEPTS


@bp.route('/studs/map')
def page():
    return render_template('stud_map.html')


@bp.route('/studs/map/app/')
def app_index():
    resp = send_from_directory(_code_dir(), 'index.html', max_age=0)
    resp.headers['Cache-Control'] = 'no-cache'
    return resp


@bp.route('/studs/map/app/<path:fname>')
def app_file(fname):
    """Файл карты: данные/схемы — из data/stud_map/, всё остальное (JS, шрифты) — из static."""
    top = fname.split('/', 1)[0]
    if fname in smd.DATA_FILES or ('/' in fname and top in smd.DATA_DIRS):
        resp = send_from_directory(_data_dir(), fname, max_age=0 if fname.endswith('.json') else 3600)
        if fname.endswith('.json'):
            resp.headers['Cache-Control'] = 'no-cache'   # после загрузки реестра — сразу новые данные
        return resp
    if top in smd.DATA_DIRS or fname.startswith('.') or fname.endswith('.gz'):
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
    info = {'has_data': os.path.isfile(os.path.join(d, 'defects.json')),
            'has_schemes': all(os.path.isfile(os.path.join(d, f)) for f in ('body.json', 'views.json')),
            'can_upload': _can_upload(), 'source': None, 'updated': None, 'updated_by': None}
    if info['has_data']:
        try:
            with open(os.path.join(d, 'defects.json'), encoding='utf-8') as f:
                meta = json.load(f)
            info.update(source=meta.get('source'), updated=meta.get('updated'), updated_by=meta.get('updated_by'),
                        rows=len(meta.get('rows', [])))
        except (OSError, ValueError):
            info['has_data'] = False
    return jsonify(info)


@bp.route('/api/stud-map/register', methods=['POST'])
def upload_register():
    """Новый реестр шпилек (Excel) → пересчёт данных карты. Только WeldTeam/админ."""
    if not _can_upload():
        return jsonify({'status': 'error', 'message': 'Загружать реестр может WeldTeam'}), 403
    f = request.files.get('file')
    name = os.path.basename((f.filename or '') if f else '')
    if not f or not name.lower().endswith(_EXCEL_EXT):
        return jsonify({'status': 'error', 'message': 'Нужен файл Excel (.xlsx) — реестр дефектов шпилек'}), 400
    d = _data_dir()
    os.makedirs(d, exist_ok=True)
    fd, tmp = tempfile.mkstemp(suffix='.xlsx', dir=d)
    os.close(fd)
    try:
        f.save(tmp)
        try:
            data, notes = smd.build(tmp, source_name=name)
        except smd.RegisterError as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
        data['updated_by'] = session.get('uname')
        smd.write(data, d)
        os.replace(tmp, os.path.join(d, 'register.xlsx'))   # последний загруженный реестр — для повторной сборки
        current_app.logger.info('Карта шпилек: загружен реестр %s (%s)', name, session.get('uname'))
        return jsonify({'status': 'ok', 'notes': notes, 'rows': len(data['rows'])})
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
