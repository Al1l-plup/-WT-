"""Журнал версий (аудит) и откат изменений.

Механизм: на каждой редактируемой таблице стоят триггеры AFTER INSERT/UPDATE/DELETE,
которые пишут снимок строки (before/after в JSON) в таблицу change_log. Триггеры
«чистые» — используют только NEW/OLD и datetime(), поэтому не зависят от контекста
соединения и не ломают bulk-скрипты. Автора правки проставляет приложение уже после
операции (stamp_audit). Откат — обратные операции по записям журнала (логируются тоже).
"""
import json
import sqlite3

# Таблицы, которые НЕ аудируем и не даём редактировать генерик-редактором.
AUDIT_EXCLUDE = {'change_log', 'restore_point', 'alembic_version', 'sqlite_sequence'}


def _q(ident: str) -> str:
    return '"' + ident.replace('"', '""') + '"'


def editable_tables(db: sqlite3.Connection) -> list[str]:
    """Пользовательские таблицы, доступные для аудита/редактирования."""
    return [r[0] for r in db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        if r[0] not in AUDIT_EXCLUDE]


def table_meta(db: sqlite3.Connection, table: str):
    """Вернуть (pk_col, [колонки]) по PRAGMA. pk — первая колонка с флагом pk."""
    cols = list(db.execute(f'PRAGMA table_info({_q(table)})'))  # cid,name,type,notnull,dflt,pk
    names = [c[1] for c in cols]
    pk = next((c[1] for c in cols if c[5]), None)
    return pk, names


def _json_object(prefix: str, cols: list[str]) -> str:
    parts = ", ".join(f"'{c}', {prefix}.{_q(c)}" for c in cols)
    return f"json_object({parts})"


def _triggers_for(table: str, pk: str, cols: list[str]) -> list[str]:
    q, pkq = _q(table), _q(pk)
    newj, oldj = _json_object('NEW', cols), _json_object('OLD', cols)
    return [
        f'CREATE TRIGGER {_q("audit_" + table + "_ins")} AFTER INSERT ON {q} BEGIN '
        f"INSERT INTO change_log(table_name,row_pk,op,before_json,after_json) "
        f"VALUES ('{table}', NEW.{pkq}, 'INSERT', NULL, {newj}); END",
        f'CREATE TRIGGER {_q("audit_" + table + "_upd")} AFTER UPDATE ON {q} BEGIN '
        f"INSERT INTO change_log(table_name,row_pk,op,before_json,after_json) "
        f"VALUES ('{table}', OLD.{pkq}, 'UPDATE', {oldj}, {newj}); END",
        f'CREATE TRIGGER {_q("audit_" + table + "_del")} AFTER DELETE ON {q} BEGIN '
        f"INSERT INTO change_log(table_name,row_pk,op,before_json,after_json) "
        f"VALUES ('{table}', OLD.{pkq}, 'DELETE', {oldj}, NULL); END",
    ]


def drop_audit_triggers(db: sqlite3.Connection) -> None:
    """Снять все триггеры аудита (для bulk-загрузок, чтобы не засорять журнал)."""
    names = [r[0] for r in db.execute(
        "SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE 'audit\\_%' ESCAPE '\\'")]
    for n in names:
        db.execute(f'DROP TRIGGER IF EXISTS {_q(n)}')
    db.commit()


def ensure_audit_triggers(db: sqlite3.Connection) -> None:
    """Пересоздать триггеры аудита по текущей схеме (идемпотентно)."""
    drop_audit_triggers(db)
    for t in editable_tables(db):
        pk, cols = table_meta(db, t)
        if not pk:
            continue
        for stmt in _triggers_for(t, pk, cols):
            db.execute(stmt)
    db.commit()


# ── журнал/откат ────────────────────────────────────────────────────────────
def max_change_id(db: sqlite3.Connection) -> int:
    return db.execute("SELECT COALESCE(MAX(id),0) FROM change_log").fetchone()[0]


def stamp_audit(db, author, batch_id, since_id, is_revert=0) -> None:
    """Проставить автора/пакет на записях журнала, созданных после since_id."""
    db.execute("UPDATE change_log SET author=?, batch_id=?, is_revert=? WHERE id>? AND author IS NULL",
               (author, batch_id, is_revert, since_id))


def _apply_inverse(db: sqlite3.Connection, table: str, row_pk, op: str, before_json: str) -> None:
    pk, _ = table_meta(db, table)
    q, pkq = _q(table), _q(pk)
    if op == 'UPDATE':
        before = json.loads(before_json)
        sets = ', '.join(f'{_q(k)}=?' for k in before)
        db.execute(f'UPDATE {q} SET {sets} WHERE {pkq}=?', list(before.values()) + [row_pk])
    elif op == 'INSERT':
        db.execute(f'DELETE FROM {q} WHERE {pkq}=?', (row_pk,))
    elif op == 'DELETE':
        before = json.loads(before_json)
        keys = ', '.join(_q(k) for k in before)
        ph = ', '.join('?' * len(before))
        db.execute(f'INSERT INTO {q} ({keys}) VALUES ({ph})', list(before.values()))


def revert_change(db: sqlite3.Connection, change_id: int, author: str | None = None) -> bool:
    """Откатить одну запись журнала (обратная операция). Сам откат логируется."""
    row = db.execute("SELECT table_name,row_pk,op,before_json FROM change_log WHERE id=?",
                     (change_id,)).fetchone()
    if not row:
        return False
    since = max_change_id(db)
    _apply_inverse(db, row[0], row[1], row[2], row[3])
    stamp_audit(db, author or 'revert', f'revert-{change_id}', since, is_revert=1)
    db.commit()
    return True


def create_restore_point(db, name, author=None, note=None) -> int:
    """Создать точку восстановления = запомнить текущий max(change_log.id)."""
    cur = db.execute("INSERT INTO restore_point(name,last_change_id,author,note) VALUES (?,?,?,?)",
                     (name, max_change_id(db), author, note))
    db.commit()
    return cur.lastrowid


def rollback_to(db: sqlite3.Connection, restore_point_id: int, author: str | None = None) -> int:
    """Откатить БД к состоянию точки восстановления (обратные операции всех правок после неё)."""
    rp = db.execute("SELECT last_change_id FROM restore_point WHERE id=?", (restore_point_id,)).fetchone()
    if not rp:
        return 0
    entries = db.execute(
        "SELECT table_name,row_pk,op,before_json FROM change_log WHERE id>? ORDER BY id DESC",
        (rp[0],)).fetchall()
    since = max_change_id(db)
    for e in entries:
        _apply_inverse(db, e[0], e[1], e[2], e[3])
    stamp_audit(db, author or 'rollback', f'rollback-rp{restore_point_id}', since, is_revert=1)
    db.commit()
    return len(entries)
