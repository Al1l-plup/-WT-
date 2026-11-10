"""Вкладка «Шпильки»: оператор сборки записывает недостающую шпильку (VIN с QR + тап по
схеме + фото), ИТО/УЗК разбирают записи по фото (категория, источник).

QR читается в телефоне (static/vendor/jsQR.js) — фото QR на сервер не приходит, только VIN.
Картинки схем (чертежи OEM) в git не хранятся: data/uploads/studs/views/<view_key>.<ext>.
"""
import os
import uuid
from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, render_template, request, send_file, session

from app import studs as st
from app.db import get_db
from app.defect_flow import _now
from app.errors import api_error

bp = Blueprint('studs', __name__)

_IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp')
_MAGIC = ((b'\xff\xd8\xff', '.jpg'), (b'\x89PNG\r\n\x1a\n', '.png'))


def _ctx():
    return session.get('uid'), session.get('dept'), bool(session.get('is_admin'))


def _err(msg, code=400):
    return jsonify({'status': 'error', 'message': msg}), code


def _dir(kind):
    d = os.path.join(os.path.dirname(current_app.config['DB_PATH']), 'uploads', 'studs', kind)
    os.makedirs(d, exist_ok=True)
    return d


def _image_kind(head: bytes) -> str | None:
    """Расширение по содержимому файла (не по имени): jpg/png/webp или None."""
    for magic, ext in _MAGIC:
        if head.startswith(magic):
            return ext
    if head[:4] == b'RIFF' and head[8:12] == b'WEBP':
        return '.webp'
    return None


def _view_image_path(view_key):
    d = _dir('views')
    for ext in _IMG_EXT:
        p = os.path.join(d, view_key + ext)
        if os.path.isfile(p):
            return p
    return None


def _ts_minus(minutes):
    return (datetime.now() - timedelta(minutes=minutes)).isoformat(timespec='seconds')


# ── страница ────────────────────────────────────────────────────────────────

@bp.route('/studs')
def page():
    return render_template('studs.html')


# ── каталог ─────────────────────────────────────────────────────────────────

@bp.route('/api/studs/catalog')
def catalog():
    """Схемы, виды и шпильки целиком (несколько сотен строк) — страница грузит один раз."""
    uid, dept, is_admin = _ctx()
    db = get_db()
    schemes = [dict(r) for r in db.execute(
        'SELECT code, title, brand FROM stud_scheme ORDER BY sort_order, code')]
    views = {}
    for r in db.execute('SELECT view_key, scheme_code, title, width, height FROM stud_view ORDER BY sort_order'):
        v = dict(r)
        v['has_image'] = _view_image_path(v['view_key']) is not None
        views.setdefault(v['scheme_code'], []).append(v)
    for s in schemes:
        s['views'] = views.get(s['code'], [])
    studs = [dict(r) for r in db.execute(
        'SELECT stud_no, scheme_code, view_key, x, y, part, colour, station FROM stud WHERE active=1 ORDER BY stud_no')]
    return jsonify({
        'schemes': schemes, 'studs': studs,
        'categories': st.CATEGORIES, 'sources': st.SOURCES,
        'can_review': st.can_review(dept, is_admin),
        'can_manage': st.can_manage_schemes(dept, is_admin),
        'uid': uid, 'is_admin': is_admin, 'own_delete_minutes': st.OWN_DELETE_MINUTES,
    })


@bp.route('/api/studs/vin')
def vin_lookup():
    """VIN → рабочий ключ и схема (если начало VIN уже знакомо)."""
    key = st.vin_key(request.args.get('vin'))
    if not st.is_valid_vin(key):
        return _err('VIN — 17 знаков: латинские буквы (кроме I, O, Q) и цифры')
    r = get_db().execute('SELECT scheme_code FROM stud_vin_prefix WHERE prefix=?', (st.vin_prefix(key),)).fetchone()
    return jsonify({'status': 'success', 'vin_key': key, 'scheme_code': r['scheme_code'] if r else None})


@bp.route('/api/studs/views/<view_key>/image')
def view_image(view_key):
    p = _view_image_path(os.path.basename(view_key))
    if not p:
        return _err('Картинка схемы не загружена', 404)
    return send_file(p, max_age=3600)


@bp.route('/api/studs/views/images', methods=['POST'])
def view_images_upload():
    """Загрузить картинки видов: имя файла = ключ вида (A13T-top.jpg). WeldTeam/админ."""
    _uid, dept, is_admin = _ctx()
    if not st.can_manage_schemes(dept, is_admin):
        return _err('Картинки схем загружает WeldTeam', 403)
    files = request.files.getlist('images')
    if not files:
        return _err('Файлы не переданы')
    db = get_db()
    known = {r[0] for r in db.execute('SELECT view_key FROM stud_view')}
    saved, skipped = [], []
    for f in files:
        name = os.path.basename(f.filename or '')
        key = os.path.splitext(name)[0]
        if key not in known:
            skipped.append({'name': name, 'reason': 'нет такого вида'})
            continue
        head = f.stream.read(16)
        f.stream.seek(0)
        ext = _image_kind(head)
        if not ext:
            skipped.append({'name': name, 'reason': 'не картинка (нужен JPG/PNG/WEBP)'})
            continue
        d = _dir('views')
        for old in _IMG_EXT:
            p = os.path.join(d, key + old)
            if os.path.isfile(p):
                os.remove(p)
        f.save(os.path.join(d, key + ext))
        saved.append(key)
    msg = f'Загружено картинок: {len(saved)}' + (f', пропущено: {len(skipped)}' if skipped else '')
    return jsonify({'status': 'success' if saved else 'error', 'message': msg, 'saved': saved, 'skipped': skipped})


# ── записи ──────────────────────────────────────────────────────────────────

_RECORD_SQL = """
    SELECT d.id, d.created_at, d.created_by, d.vin, d.vin_key, d.scheme_code, d.stud_no, d.station,
           d.photo IS NOT NULL AND d.photo <> '' AS has_photo,
           d.category, d.source, d.comment, d.reviewed_at,
           sc.title AS scheme_title, v.title AS view_title, s.part,
           TRIM(COALESCE(w.surname,'') || ' ' || COALESCE(w.name,'')) AS operator,
           TRIM(COALESCE(rw.surname,'') || ' ' || COALESCE(rw.name,'')) AS reviewer
    FROM stud_defect d
    LEFT JOIN stud s ON s.stud_no = d.stud_no
    LEFT JOIN stud_view v ON v.view_key = s.view_key
    LEFT JOIN stud_scheme sc ON sc.code = d.scheme_code
    LEFT JOIN worker w ON w.UniqueID = d.created_by
    LEFT JOIN worker rw ON rw.UniqueID = d.reviewed_by
"""


def _record(db, rid):
    r = db.execute(_RECORD_SQL + ' WHERE d.id=?', (rid,)).fetchone()
    return _row_out(r) if r else None


def _row_out(r):
    d = dict(r)
    d['has_photo'] = bool(d['has_photo'])
    d['category_label'] = st.CATEGORIES.get(d['category'] or '', d['category'] or '')
    d['source_label'] = st.SOURCES.get(d['source'] or '', d['source'] or '')
    return d


@bp.route('/api/studs/records')
def records():
    """Журнал. Фильтры: status=new (без категории) | all, scheme, vin (рабочий ключ),
    q — номер шпильки или часть VIN, date_from/date_to (YYYY-MM-DD). Новые сверху."""
    where, args = [], []
    if request.args.get('status') == 'new':
        where.append("COALESCE(d.category,'') = ''")
    if request.args.get('scheme'):
        where.append('d.scheme_code = ?')
        args.append(request.args['scheme'])
    if request.args.get('vin'):
        where.append('d.vin_key = ?')
        args.append(st.vin_key(request.args['vin']))
    q = (request.args.get('q') or '').strip()
    if q:
        if q.isdigit() and len(q) <= 5:
            where.append('(d.stud_no = ? OR d.vin_key LIKE ?)')
            args += [int(q), f'%{q}%']
        else:
            where.append('d.vin_key LIKE ?')
            args.append(f'%{st.vin_key(q)}%')
    if request.args.get('date_from'):
        where.append('d.created_at >= ?')
        args.append(request.args['date_from'])
    if request.args.get('date_to'):
        where.append('d.created_at < ?')
        args.append(request.args['date_to'] + 'T99')
    try:
        limit = max(1, min(int(request.args.get('limit', 300)), 2000))
    except ValueError:
        limit = 300
    sql = _RECORD_SQL + (' WHERE ' + ' AND '.join(where) if where else '') + ' ORDER BY d.id DESC LIMIT ?'
    rows = [_row_out(r) for r in get_db().execute(sql, (*args, limit))]
    return jsonify({'status': 'success', 'records': rows})


@bp.route('/api/studs/records', methods=['POST'])
def record_create():
    """Новая запись: VIN (как прочитан), схема, номер шпильки, фото шпильки (обязательно).

    Новое начало VIN запоминается за выбранной схемой. Та же шпилька той же машины в
    течение DUPLICATE_WINDOW_MINUTES — не дубль, а уже существующая запись."""
    uid, _dept, _is_admin = _ctx()
    form = request.form
    raw_vin = (form.get('vin') or '').strip()
    key = st.vin_key(raw_vin)
    if not st.is_valid_vin(key):
        return _err('VIN — 17 знаков: латинские буквы (кроме I, O, Q) и цифры')
    scheme = (form.get('scheme_code') or '').strip()
    try:
        stud_no = int(form.get('stud_no') or 0)
    except ValueError:
        return _err('Номер шпильки — число')
    db = get_db()
    stud = db.execute('SELECT stud_no, scheme_code, station FROM stud WHERE stud_no=? AND active=1',
                      (stud_no,)).fetchone()
    if not stud:
        return _err('Нет такой шпильки')
    if stud['scheme_code'] != scheme:
        return _err('Шпилька не с этой схемы — обновите страницу')
    dup = db.execute('SELECT id FROM stud_defect WHERE vin_key=? AND stud_no=? AND created_at>=? '
                     'ORDER BY id DESC LIMIT 1', (key, stud_no, _ts_minus(st.DUPLICATE_WINDOW_MINUTES))).fetchone()
    if dup:
        return jsonify({'status': 'success', 'message': f'Шпилька {stud_no} на этой машине уже записана',
                        'duplicate': True, 'record': _record(db, dup['id'])})
    f = request.files.get('photo')
    if not f or not f.filename:
        return _err('Сделайте фото шпильки')
    head = f.stream.read(16)
    f.stream.seek(0)
    ext = _image_kind(head)
    if not ext:
        return _err('Фото не похоже на снимок (нужен JPG/PNG/WEBP)')
    fname = f'{uuid.uuid4().hex}{ext}'
    path = os.path.join(_dir('photos'), fname)
    try:
        f.save(path)
        now = _now()
        cur = db.execute('INSERT INTO stud_defect (created_at, created_by, vin, vin_key, scheme_code, stud_no, station, photo) '
                         'VALUES (?,?,?,?,?,?,?,?)', (now, uid, raw_vin, key, scheme, stud_no, stud['station'], fname))
        db.execute('INSERT OR IGNORE INTO stud_vin_prefix (prefix, scheme_code, created_at, created_by) VALUES (?,?,?,?)',
                   (st.vin_prefix(key), scheme, now, uid))
        db.commit()
        return jsonify({'status': 'success', 'message': f'Записано: шпилька {stud_no}',
                        'record': _record(db, cur.lastrowid)})
    except Exception as e:  # noqa: BLE001
        db.rollback()
        try:
            os.remove(path)
        except OSError:
            pass
        return api_error(e)


@bp.route('/api/studs/records/<int:rid>/photo')
def record_photo(rid):
    r = get_db().execute('SELECT photo FROM stud_defect WHERE id=?', (rid,)).fetchone()
    if not r or not r['photo']:
        return _err('Фото не найдено', 404)
    p = os.path.join(_dir('photos'), os.path.basename(r['photo']))
    if not os.path.isfile(p):
        return _err('Файл фото отсутствует', 404)
    return send_file(p, max_age=86400)


@bp.route('/api/studs/records/<int:rid>', methods=['PATCH'])
def record_review(rid):
    """Разбор по фото: категория, источник, комментарий. ИТО, УЗК, WeldTeam, админ."""
    uid, dept, is_admin = _ctx()
    if not st.can_review(dept, is_admin):
        return _err('Разбирают записи ИТО и УЗК', 403)
    body = request.get_json(silent=True) or {}
    category = (body.get('category') or '').strip() or None
    source = (body.get('source') or '').strip() or None
    comment = (body.get('comment') or '').strip()[:500] or None
    if category and category not in st.CATEGORIES:
        return _err('Неизвестная категория')
    if source and source not in st.SOURCES:
        return _err('Неизвестный источник')
    db = get_db()
    if not db.execute('SELECT 1 FROM stud_defect WHERE id=?', (rid,)).fetchone():
        return _err('Запись не найдена', 404)
    try:
        reviewed = category or source or comment
        db.execute('UPDATE stud_defect SET category=?, source=?, comment=?, reviewed_by=?, reviewed_at=? WHERE id=?',
                   (category, source, comment, uid if reviewed else None, _now() if reviewed else None, rid))
        db.commit()
        return jsonify({'status': 'success', 'message': 'Сохранено', 'record': _record(db, rid)})
    except Exception as e:  # noqa: BLE001
        db.rollback()
        return api_error(e)


@bp.route('/api/studs/records/<int:rid>', methods=['DELETE'])
def record_delete(rid):
    """Удалить ошибочную запись: автор — в течение OWN_DELETE_MINUTES и пока её не разобрали;
    админ — любую. Фото удаляется вместе с записью."""
    uid, _dept, is_admin = _ctx()
    db = get_db()
    r = db.execute('SELECT created_by, created_at, reviewed_at, photo FROM stud_defect WHERE id=?', (rid,)).fetchone()
    if not r:
        return _err('Запись не найдена', 404)
    if not is_admin:
        if r['created_by'] != uid:
            return _err('Удалить можно только свою запись', 403)
        if r['reviewed_at']:
            return _err('Запись уже разобрана — удалить может только администратор', 403)
        if r['created_at'] < _ts_minus(st.OWN_DELETE_MINUTES):
            return _err(f'Свою запись можно удалить в течение {st.OWN_DELETE_MINUTES} минут', 403)
    try:
        db.execute('DELETE FROM stud_defect WHERE id=?', (rid,))
        db.commit()
    except Exception as e:  # noqa: BLE001
        db.rollback()
        return api_error(e)
    if r['photo']:
        try:
            os.remove(os.path.join(_dir('photos'), os.path.basename(r['photo'])))
        except OSError:
            pass
    return jsonify({'status': 'success', 'message': 'Запись удалена'})
