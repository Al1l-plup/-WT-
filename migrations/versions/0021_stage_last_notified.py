"""Отметка последнего уведомления на этапе — для почасовых напоминаний.

defect_stage.last_notified_at хранит момент последнего пинга по текущему открытому
этапу. Планировщик напоминаний (app/notifications.process_reminders) раз в час (в окне
07:30–16:30) повторяет уведомление по этапам, где дефект ещё не взят в работу
(assigned_worker_id IS NULL) и этап открыт, пока его не возьмут/закроют/он не уйдёт
дальше. Колонка ставится при каждом пинге (первичном и повторном) и так держит ритм.

Revision ID: 0021
Revises: 0020
Create Date: 2026-10-29
"""
from alembic import op

revision = '0021'
down_revision = '0020'
branch_labels = None
depends_on = None


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade() -> None:
    # Идемпотентно (см. 0020): повторный прогон / прогон после downgrade не падает.
    if not _has_column(op.get_bind(), 'defect_stage', 'last_notified_at'):
        op.execute('ALTER TABLE defect_stage ADD COLUMN last_notified_at TEXT')


def downgrade() -> None:
    # SQLite DROP COLUMN конфликтует с триггерами аудита на defect_stage; колонка
    # nullable и безвредна — оставляем.
    pass
