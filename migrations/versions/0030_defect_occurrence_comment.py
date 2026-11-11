"""Дефекты: комментарий контролёра к выявлению + индексы для отчёта контролёра.

* defect_occurrence.comment — необязательный комментарий, который контролёр УЗК пишет при
  регистрации. Хранится у ВЫЯВЛЕНИЯ (а не у карточки): при серии комментарий второго
  контролёра не затирает комментарий первого.
* ix_defect_occurrence_reg (registered_by, occ_date) — вкладка «Контролёр»: мои выявления за день;
  ix_defect_occurrence_date (occ_date) — фильтр по датам и «закрытые за сегодня».

Только новая колонка и индексы — существующие данные не меняются.
Revision ID: 0030, Revises: 0029.
"""
from alembic import op

revision = '0030'
down_revision = '0029'
branch_labels = None
depends_on = None


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade():
    conn = op.get_bind()
    if not _has_column(conn, 'defect_occurrence', 'comment'):
        op.execute('ALTER TABLE defect_occurrence ADD COLUMN comment TEXT')
    op.execute('CREATE INDEX IF NOT EXISTS ix_defect_occurrence_reg ON defect_occurrence (registered_by, occ_date)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_defect_occurrence_date ON defect_occurrence (occ_date)')


def downgrade():
    op.execute('DROP INDEX IF EXISTS ix_defect_occurrence_date')
    op.execute('DROP INDEX IF EXISTS ix_defect_occurrence_reg')
    # триггеры аудита (app.audit) ссылаются на колонку и не дали бы её удалить;
    # приложение пересоздаёт их при старте по текущей схеме
    for op_name in ('ins', 'upd', 'del'):
        op.execute(f'DROP TRIGGER IF EXISTS "audit_defect_occurrence_{op_name}"')
    try:
        op.execute('ALTER TABLE defect_occurrence DROP COLUMN comment')
    except Exception:  # noqa: BLE001 — старый SQLite без DROP COLUMN: поле безвредно
        pass
