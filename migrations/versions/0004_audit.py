"""audit: журнал изменений (change_log) и точки восстановления (restore_point)

Только таблицы. Триггеры аудита создаёт приложение из текущей схемы (app/audit.py),
чтобы они адаптировались к изменениям схемы и не мешали bulk-загрузкам.

Revision ID: 0004
Revises: 0003
Create Date: 2026-07-03
"""
from alembic import op

revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None

_TABLES = [
    """
    CREATE TABLE change_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        ts          TEXT NOT NULL DEFAULT (datetime('now')),
        table_name  TEXT NOT NULL,
        row_pk      TEXT,
        op          TEXT NOT NULL,
        before_json TEXT,
        after_json  TEXT,
        author      TEXT,
        batch_id    TEXT,
        is_revert   INTEGER NOT NULL DEFAULT 0,
        note        TEXT
    )
    """,
    """
    CREATE TABLE restore_point (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT NOT NULL,
        created_at     TEXT NOT NULL DEFAULT (datetime('now')),
        last_change_id INTEGER NOT NULL,
        author         TEXT,
        note           TEXT
    )
    """,
]

_INDEXES = [
    "CREATE INDEX ix_change_log_table_row ON change_log(table_name, row_pk)",
    "CREATE INDEX ix_change_log_batch ON change_log(batch_id)",
]


def upgrade() -> None:
    for ddl in _TABLES:
        op.execute(ddl)
    for ddl in _INDEXES:
        op.execute(ddl)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS restore_point")
    op.execute("DROP TABLE IF EXISTS change_log")
