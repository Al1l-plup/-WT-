"""«Сверка» — потеряшки и противоречия данных относительно Weld Balance.

WB — единственный источник станции точки и пистолета (app/wb_source.py). Здесь —
всё, что не сходится; это запрос ИТО на рассмотрение: статус, ответственный,
комментарий. Видят все отделы — работа базы прозрачна (права: app/permissions.py,
раздел 'reconciliation': просмотр всем, изменение — ИТО/WeldTeam/админ).

Наполняется и закрывается автоматически (rebuild_issues) при старте, после сохранения
документов Редактора и при открытии страницы; решения ИТО при этом не затираются.
"""
from flask import Blueprint, jsonify, render_template, request, session

from app.db import get_db
from app.errors import api_error
from app.wb_source import ISSUE_KINDS, ISSUE_STATUSES, OPEN_ISSUE_STATUSES, open_issue_count, rebuild_issues

bp = Blueprint('reconciliation', __name__)


def _can_edit():
    return bool(session.get('is_admin')) or session.get('dept') in ('ИТО', 'WeldTeam')


@bp.route('/reconciliation')
def reconciliation_page():
    return render_template('reconciliation.html')


@bp.route('/api/wb-issues')
def list_issues():
    """Список строк Сверки (перед выдачей — пересборка, чтобы было актуально)."""
    db = get_db()
    try:
        rebuild_issues(db)
        db.commit()
    except Exception as e:  # noqa: BLE001
        db.rollback()
        return api_error(e)
    status = request.args.get('status', 'open')
    where, params = '', []
    if status == 'open':
        where = f"WHERE i.status IN ({','.join('?' * len(OPEN_ISSUE_STATUSES))})"
        params = list(OPEN_ISSUE_STATUSES)
    elif status in ISSUE_STATUSES:
        where, params = 'WHERE i.status = ?', [status]
    rows = db.execute(f"""
        SELECT i.id, i.kind, i.model_code, i.spot_number, COALESCE(i.g_num, g.g_num) AS g_num,
               i.defect_id, i.wb_station, i.details, i.where_found, i.rows_count, i.status,
               i.assignee_id, i.comment, i.first_seen, i.resolved_at,
               TRIM(COALESCE(w.surname,'') || ' ' || COALESCE(w.name,'')) AS assignee_name
        FROM wb_issue i
        LEFT JOIN gun g ON g.UniqueID = i.gun_id
        LEFT JOIN worker w ON w.UniqueID = i.assignee_id
        {where}
        ORDER BY CASE i.status WHEN 'new' THEN 0 WHEN 'in_review' THEN 1 WHEN 'assigned' THEN 2
                               WHEN 'accepted' THEN 3 ELSE 4 END,
                 i.kind, i.model_code, i.spot_number, i.g_num""", params).fetchall()
    ph = ','.join('?' * len(OPEN_ISSUE_STATUSES))
    by_kind = {k: n for k, n in db.execute(
        f'SELECT kind, COUNT(*) FROM wb_issue WHERE status IN ({ph}) GROUP BY kind', OPEN_ISSUE_STATUSES)}
    engineers = db.execute("SELECT UniqueID, TRIM(surname || ' ' || COALESCE(name,'')) AS name FROM worker "
                           "WHERE department='ИТО' AND is_active=1 ORDER BY surname").fetchall()
    # jsonify сортирует ключи словарей — порядок статусов «по ходу разбора» отдаём списком
    return jsonify({'issues': [dict(r) for r in rows],
                    'kinds': ISSUE_KINDS, 'statuses': ISSUE_STATUSES, 'status_order': list(ISSUE_STATUSES),
                    'open_by_kind': by_kind, 'open_total': sum(by_kind.values()),
                    'engineers': [dict(e) for e in engineers], 'can_edit': _can_edit()})


@bp.route('/api/wb-issues/summary')
def issues_summary():
    """Счётчик открытых строк Сверки (для навигации) — без пересборки, дёшево."""
    return jsonify({'open': open_issue_count(get_db())})


@bp.route('/api/wb-issues/<int:issue_id>', methods=['PUT'])
def update_issue(issue_id):
    """ИТО: статус / ответственный / комментарий строки Сверки."""
    if not _can_edit():
        return jsonify({'status': 'error', 'message': 'Разбирать Сверку может ИТО'}), 403
    data = request.json or {}
    db = get_db()
    if not db.execute('SELECT 1 FROM wb_issue WHERE id=?', (issue_id,)).fetchone():
        return jsonify({'status': 'error', 'message': 'Строка Сверки не найдена'}), 404
    sets, vals = [], []
    if 'status' in data:
        if data['status'] not in ISSUE_STATUSES or data['status'] == 'resolved':
            return jsonify({'status': 'error', 'message': '«Исправлено» ставится само, когда данные сошлись'}), 400
        sets.append('status=?'); vals.append(data['status'])
    if 'comment' in data:
        sets.append('comment=?'); vals.append((data.get('comment') or '').strip()[:1000] or None)
    if 'assignee_id' in data:
        aid = data.get('assignee_id') or None
        if aid is not None and not db.execute('SELECT 1 FROM worker WHERE UniqueID=? AND is_active=1',
                                              (int(aid),)).fetchone():
            return jsonify({'status': 'error', 'message': 'Сотрудник не найден'}), 400
        sets.append('assignee_id=?'); vals.append(int(aid) if aid else None)
    if not sets:
        return jsonify({'status': 'error', 'message': 'Нечего менять'}), 400
    try:
        db.execute(f'UPDATE wb_issue SET {", ".join(sets)} WHERE id=?', (*vals, issue_id))
        db.commit()
        return jsonify({'status': 'success'})
    except Exception as e:  # noqa: BLE001
        db.rollback()
        return api_error(e)
