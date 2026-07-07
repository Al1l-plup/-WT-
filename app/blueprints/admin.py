"""Генерик-редактор БД + журнал версий (аудит) с откатом.

Позволяет просматривать/менять/добавлять/удалять строки любой пользовательской таблицы.
Каждое изменение фиксируется в change_log (через триггеры), автор проставляется здесь.
ВНИМАНИЕ: аутентификации пока нет — доступ открыт (журнал+откат страхуют). Auth — отдельный этап.
"""
import uuid

from flask import Blueprint, jsonify, render_template, request

from app.audit import (
    create_restore_point,
    editable_tables,
    max_change_id,
    revert_batch,
    revert_change,
    rollback_to,
    stamp_audit,
    table_meta,
)
from app.db import get_db
from app.documents import DOCUMENTS, doc_list
from app.errors import api_error

bp = Blueprint('admin', __name__)

DEFAULT_LIMIT = 50


def _q(ident: str) -> str:
    return '"' + ident.replace('"', '""') + '"'


def _author() -> str:
    data = request.get_json(silent=True) or {}
    return request.headers.get('X-Author') or data.get('author') or 'anonymous'


def _require_table(db, name: str):
    """Вернуть (pk, columns) или None, если таблица недоступна для редактирования."""
    if name not in editable_tables(db):
        return None
    return table_meta(db, name)


def _fk_map(db, table: str) -> dict:
    fks = {}
    for r in db.execute(f'PRAGMA foreign_key_list({_q(table)})'):
        fks[r[3]] = {'table': r[2], 'column': r[4]}  # from -> {ref table, ref col}
    return fks


# ── страницы ────────────────────────────────────────────────────────────────
@bp.route('/admin')
def admin_page():
    return render_template('admin.html')


@bp.route('/history')
def history_page():
    return render_template('history.html')


# ── список таблиц ────────────────────────────────────────────────────────────
@bp.route('/api/admin/tables')
def list_tables():
    db = get_db()
    out = []
    for t in editable_tables(db):
        cnt = db.execute(f'SELECT COUNT(*) FROM {_q(t)}').fetchone()[0]
        out.append({'name': t, 'rows': cnt})
    return jsonify(out)


# ── чтение таблицы ───────────────────────────────────────────────────────────
@bp.route('/api/admin/table/<name>')
def read_table(name):
    db = get_db()
    meta = _require_table(db, name)
    if not meta:
        return jsonify({'status': 'error', 'message': 'Таблица недоступна'}), 404
    pk, cols = meta
    fks = _fk_map(db, name)
    limit = min(int(request.args.get('limit', DEFAULT_LIMIT)), 100000)
    offset = int(request.args.get('offset', 0))
    q = request.args.get('q', '').strip()
    sort = request.args.get('sort', '').strip()
    direction = 'DESC' if request.args.get('dir', 'asc').lower() == 'desc' else 'ASC'

    conds, params = [], []
    if q:
        conds.append('(' + ' OR '.join(f'{_q(c)} || \'\' LIKE ?' for c in cols) + ')')
        params += [f'%{q}%'] * len(cols)
    fcol = request.args.get('filter_col', '').strip()
    if fcol in cols:
        conds.append(f'{_q(fcol)}=?')
        params.append(request.args.get('filter_val', ''))
    where = ' WHERE ' + ' AND '.join(conds) if conds else ''

    order = f' ORDER BY {_q(sort)} {direction}' if sort in cols else ''
    total = db.execute(f'SELECT COUNT(*) FROM {_q(name)}{where}', params).fetchone()[0]
    rows = db.execute(
        f'SELECT * FROM {_q(name)}{where}{order} LIMIT ? OFFSET ?', params + [limit, offset]
    ).fetchall()
    columns = [{'name': c, 'pk': c == pk, 'fk': fks.get(c)} for c in cols]
    return jsonify({'table': name, 'pk': pk, 'columns': columns,
                    'rows': [dict(r) for r in rows], 'total': total,
                    'limit': limit, 'offset': offset})


# ── запись (insert/update/delete) с фиксацией автора ─────────────────────────
def _stamp_commit(db, since, batch):
    stamp_audit(db, _author(), batch, since)
    db.commit()


@bp.route('/api/admin/table/<name>', methods=['POST'])
def insert_row(name):
    db = get_db()
    meta = _require_table(db, name)
    if not meta:
        return jsonify({'status': 'error', 'message': 'Таблица недоступна'}), 404
    _pk, cols = meta
    values = (request.get_json(silent=True) or {}).get('values', {})
    bad = [c for c in values if c not in cols]
    if bad:
        return jsonify({'status': 'error', 'message': f'Неизвестные колонки: {bad}'}), 400
    keys = list(values)
    try:
        since, batch = max_change_id(db), uuid.uuid4().hex
        if keys:
            sql = (f'INSERT INTO {_q(name)} ({", ".join(_q(k) for k in keys)}) '
                   f'VALUES ({", ".join("?" * len(keys))})')
            cur = db.execute(sql, [values[k] for k in keys])
        else:
            cur = db.execute(f'INSERT INTO {_q(name)} DEFAULT VALUES')
        _stamp_commit(db, since, batch)
        return jsonify({'status': 'success', 'id': cur.lastrowid})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/admin/table/<name>/<pk_val>', methods=['PUT'])
def update_row(name, pk_val):
    db = get_db()
    meta = _require_table(db, name)
    if not meta:
        return jsonify({'status': 'error', 'message': 'Таблица недоступна'}), 404
    pk, cols = meta
    values = (request.get_json(silent=True) or {}).get('values', {})
    values = {k: v for k, v in values.items() if k != pk}  # PK не меняем
    bad = [c for c in values if c not in cols]
    if bad:
        return jsonify({'status': 'error', 'message': f'Неизвестные колонки: {bad}'}), 400
    if not values:
        return jsonify({'status': 'error', 'message': 'Нет полей для обновления'}), 400
    try:
        since, batch = max_change_id(db), uuid.uuid4().hex
        sets = ', '.join(f'{_q(k)}=?' for k in values)
        db.execute(f'UPDATE {_q(name)} SET {sets} WHERE {_q(pk)}=?',
                   list(values.values()) + [pk_val])
        _stamp_commit(db, since, batch)
        return jsonify({'status': 'success'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/admin/table/<name>/<pk_val>', methods=['DELETE'])
def delete_row(name, pk_val):
    db = get_db()
    meta = _require_table(db, name)
    if not meta:
        return jsonify({'status': 'error', 'message': 'Таблица недоступна'}), 404
    pk, _cols = meta
    try:
        since, batch = max_change_id(db), uuid.uuid4().hex
        db.execute(f'DELETE FROM {_q(name)} WHERE {_q(pk)}=?', (pk_val,))
        _stamp_commit(db, since, batch)
        return jsonify({'status': 'success'})
    except Exception as e:
        db.rollback()
        return api_error(e)


# ── пакетное сохранение (Excel-редактор) ────────────────────────────────────
@bp.route('/api/admin/table/<name>/batch', methods=['POST'])
def batch_apply(name):
    db = get_db()
    meta = _require_table(db, name)
    if not meta:
        return jsonify({'status': 'error', 'message': 'Таблица недоступна'}), 404
    pk, cols = meta
    changes = (request.get_json(silent=True) or {}).get('changes', [])
    for ch in changes:
        bad = [c for c in ch.get('values', {}) if c not in cols]
        if bad:
            return jsonify({'status': 'error', 'message': f'Неизвестные колонки: {bad}'}), 400
    try:
        since, batch = max_change_id(db), uuid.uuid4().hex
        counts = {'insert': 0, 'update': 0, 'delete': 0}
        for ch in changes:
            op = ch.get('op')
            if op == 'update':
                vals = {k: v for k, v in ch.get('values', {}).items() if k != pk}
                if not vals:
                    continue
                sets = ', '.join(f'{_q(k)}=?' for k in vals)
                db.execute(f'UPDATE {_q(name)} SET {sets} WHERE {_q(pk)}=?',
                           list(vals.values()) + [ch.get('pk')])
            elif op == 'insert':
                vals = ch.get('values', {})
                keys = list(vals)
                if keys:
                    db.execute(f'INSERT INTO {_q(name)} ({", ".join(_q(k) for k in keys)}) '
                               f'VALUES ({", ".join("?" * len(keys))})', [vals[k] for k in keys])
                else:
                    db.execute(f'INSERT INTO {_q(name)} DEFAULT VALUES')
            elif op == 'delete':
                db.execute(f'DELETE FROM {_q(name)} WHERE {_q(pk)}=?', (ch.get('pk'),))
            else:
                continue
            counts[op] += 1
        stamp_audit(db, _author(), batch, since)
        db.commit()
        return jsonify({'status': 'success', 'batch_id': batch, **counts})
    except Exception as e:
        db.rollback()
        return api_error(e)


# ── документы (Перечень оборудования / Weld Balance / Параметры) ─────────────
@bp.route('/api/admin/docs')
def list_docs():
    return jsonify(doc_list())


def _doc_read(db, cfg, args):
    cols = cfg['columns']
    pk_sel = [f'{expr} AS "__pk_{tbl}"' for tbl, expr in cfg['pks'].items()]
    col_sel = [f'({c["expr"]}) AS "{c["field"]}"' for c in cols]
    base = cfg['base']

    q = args.get('q', '').strip()
    conds, params = [], []
    if cfg.get('where'):
        conds.append(f"({cfg['where']})")
    if q:
        conds.append('(' + ' OR '.join(f'({c["expr"]}) || \'\' LIKE ?' for c in cols) + ')')
        params += [f'%{q}%'] * len(cols)
    where = ' WHERE ' + ' AND '.join(conds) if conds else ''

    sort = args.get('sort', '').strip()
    direction = 'DESC' if args.get('dir', 'asc').lower() == 'desc' else 'ASC'
    sort_expr = next((c['expr'] for c in cols if c['field'] == sort), None)
    order = f' ORDER BY {sort_expr} {direction}' if sort_expr else f' ORDER BY {cfg["order"]}'

    limit = min(int(args.get('limit', 200)), 100000)
    offset = int(args.get('offset', 0))
    total = db.execute(f'SELECT COUNT(*) {base}{where}', params).fetchone()[0]
    rows = db.execute(f'SELECT {", ".join(pk_sel + col_sel)} {base}{where}{order} LIMIT ? OFFSET ?',
                      params + [limit, offset]).fetchall()
    columns = [{'field': c['field'], 'label': c['label'], 'editable': bool(c.get('edit')), 'fk': c.get('fk')}
               for c in cols]
    return {'title': cfg['title'], 'columns': columns, 'rows': [dict(r) for r in rows],
            'total': total, 'primary': cfg['primary'], 'child': cfg.get('child'),
            'limit': limit, 'offset': offset}


@bp.route('/api/admin/doc/<doc_id>')
def read_doc(doc_id):
    cfg = DOCUMENTS.get(doc_id)
    if not cfg:
        return jsonify({'status': 'error', 'message': 'Документ не найден'}), 404
    return jsonify(_doc_read(get_db(), cfg, request.args))


@bp.route('/api/admin/doc/<doc_id>/batch', methods=['POST'])
def batch_doc(doc_id):
    cfg = DOCUMENTS.get(doc_id)
    if not cfg:
        return jsonify({'status': 'error', 'message': 'Документ не найден'}), 404
    db = get_db()
    editable = {c['field']: c for c in cfg['columns'] if c.get('edit')}
    primary = cfg['primary']
    changes = (request.get_json(silent=True) or {}).get('changes', [])
    try:
        since, batch = max_change_id(db), uuid.uuid4().hex
        updates = {}  # (table, pk_value) -> {col: value}
        for ch in changes:
            op = ch.get('op')
            if op == 'update':
                c = editable.get(ch.get('field'))
                if not c:
                    continue
                pkval = (ch.get('row_pks') or {}).get(c['table'])
                if pkval in (None, ''):
                    continue  # связанной строки нет (напр. станция не назначена) — пропускаем
                updates.setdefault((c['table'], pkval), {})[c['col']] = ch.get('value')
            elif op == 'insert':
                vals = {editable[f]['col']: v for f, v in (ch.get('values') or {}).items()
                        if f in editable and editable[f]['table'] == primary}
                keys = list(vals)
                if keys:
                    db.execute(f'INSERT INTO {_q(primary)} ({", ".join(_q(k) for k in keys)}) '
                               f'VALUES ({", ".join("?" * len(keys))})', [vals[k] for k in keys])
                else:
                    db.execute(f'INSERT INTO {_q(primary)} DEFAULT VALUES')
            elif op == 'delete':
                pkcol, _ = table_meta(db, primary)
                db.execute(f'DELETE FROM {_q(primary)} WHERE {_q(pkcol)}=?', (ch.get('pk'),))
        for (tbl, pkval), colvals in updates.items():
            pkcol, _ = table_meta(db, tbl)
            sets = ', '.join(f'{_q(k)}=?' for k in colvals)
            db.execute(f'UPDATE {_q(tbl)} SET {sets} WHERE {_q(pkcol)}=?', list(colvals.values()) + [pkval])
        stamp_audit(db, _author(), batch, since)
        db.commit()
        return jsonify({'status': 'success', 'batch_id': batch, 'rows_updated': len(updates)})
    except Exception as e:
        db.rollback()
        return api_error(e)


# ── журнал изменений ─────────────────────────────────────────────────────────
@bp.route('/api/admin/history')
def history():
    db = get_db()
    table = request.args.get('table', '').strip()
    limit = min(int(request.args.get('limit', 100)), 500)
    offset = int(request.args.get('offset', 0))
    cond, params = '', []
    if table:
        cond = ' WHERE table_name=?'
        params = [table]
    total = db.execute(f'SELECT COUNT(*) FROM change_log{cond}', params).fetchone()[0]
    rows = db.execute(
        f'SELECT id, ts, table_name, row_pk, op, before_json, after_json, author, is_revert, batch_id '
        f'FROM change_log{cond} ORDER BY id DESC LIMIT ? OFFSET ?', params + [limit, offset]
    ).fetchall()
    return jsonify({'total': total, 'entries': [dict(r) for r in rows]})


@bp.route('/api/admin/history/<int:change_id>/revert', methods=['POST'])
def revert(change_id):
    db = get_db()
    try:
        ok = revert_change(db, change_id, author=_author())
        if not ok:
            return jsonify({'status': 'error', 'message': 'Запись журнала не найдена'}), 404
        return jsonify({'status': 'success', 'message': 'Изменение откачено'})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/admin/history/batch/<batch_id>/revert', methods=['POST'])
def revert_batch_ep(batch_id):
    db = get_db()
    try:
        n = revert_batch(db, batch_id, author=_author())
        if not n:
            return jsonify({'status': 'error', 'message': 'Пакет не найден'}), 404
        return jsonify({'status': 'success', 'reverted': n, 'message': f'Откачено изменений: {n}'})
    except Exception as e:
        db.rollback()
        return api_error(e)


# ── точки восстановления ─────────────────────────────────────────────────────
@bp.route('/api/admin/restore-points')
def list_restore_points():
    db = get_db()
    rows = db.execute(
        'SELECT id, name, created_at, last_change_id, author, note FROM restore_point ORDER BY id DESC'
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/admin/restore-points', methods=['POST'])
def add_restore_point():
    db = get_db()
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'status': 'error', 'message': 'Укажите название точки'}), 400
    try:
        rp_id = create_restore_point(db, name, author=_author(), note=data.get('note'))
        return jsonify({'status': 'success', 'id': rp_id})
    except Exception as e:
        db.rollback()
        return api_error(e)


@bp.route('/api/admin/restore-points/<int:rp_id>/rollback', methods=['POST'])
def rollback_restore_point(rp_id):
    db = get_db()
    try:
        n = rollback_to(db, rp_id, author=_author())
        return jsonify({'status': 'success', 'message': f'Откачено изменений: {n}', 'reverted': n})
    except Exception as e:
        db.rollback()
        return api_error(e)
