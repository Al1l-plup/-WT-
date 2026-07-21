"""Композитный индекс weld_point_part(weld_point_id, layer_no)

Грид Weld Balance стал зеркалом листа Excel: плоские колонки деталей слоёв
1-3 читаются через LEFT JOIN weld_point_part по (weld_point_id, layer_no).
Индекс делает каждый join одним поиском (было — по одному weld_point_id).

Revision ID: 0008
Revises: 0007
Create Date: 2026-07-17
"""
from alembic import op

revision = '0008'
down_revision = '0007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE INDEX IF NOT EXISTS ix_weld_point_part_wp_layer '
               'ON weld_point_part(weld_point_id, layer_no)')


def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS ix_weld_point_part_wp_layer')
