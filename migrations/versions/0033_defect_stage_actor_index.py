"""Дефекты: индекс этапов по исполнителю — вкладка «Отработанные мной».

* ix_defect_stage_actor (actor_id, left_at) — доска дефектов при каждой загрузке выбирает
  действия текущего сотрудника на этапах (закрыл, передал, вернул, …); без индекса — полный
  просмотр таблицы этапов.

Только индекс — данные не меняются.
Revision ID: 0033, Revises: 0032.
"""
from alembic import op

revision = '0033'
down_revision = '0032'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('CREATE INDEX IF NOT EXISTS ix_defect_stage_actor ON defect_stage (actor_id, left_at)')


def downgrade():
    op.execute('DROP INDEX IF EXISTS ix_defect_stage_actor')
