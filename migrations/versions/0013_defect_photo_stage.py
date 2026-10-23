"""Фото дефекта фиксируется на этапе, где добавлено.

Добавляет ``defect_photo.stage_id`` — ссылку на конкретный этап (``defect_stage.UniqueID``),
на котором было добавлено фото. Раньше в ``stage_dept`` писался отдел ЗАГРУЗИВШЕГО (сессии),
а не этап дефекта — теперь и ``stage_dept``, и ``stage_id`` берутся из текущего открытого
этапа дефекта. Нужно для прав «править/удалять своё фото, пока дефект на моём этапе» и для
анализа (на каком шаге сделан снимок).

Revision ID: 0013
Revises: 0012
Create Date: 2026-10-23
"""
from alembic import op

revision = '0013'
down_revision = '0012'
branch_labels = None
depends_on = None


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, 'defect_photo', 'stage_id'):
        op.execute('ALTER TABLE defect_photo ADD COLUMN stage_id INTEGER')


def downgrade() -> None:
    pass
