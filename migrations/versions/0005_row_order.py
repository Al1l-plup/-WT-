"""row_order: порядок строк Weld Balance как в листе Excel

Добавляет weld_point.row_order (REAL) — позицию строки в документе. Заполняется по id
(id соответствует порядку импорта строк листа Excel). Дробные значения позволяют вставку
строк «между» без перенумерации (fractional ordering).

Revision ID: 0005
Revises: 0004
Create Date: 2026-07-09
"""
from alembic import op

revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE weld_point ADD COLUMN row_order REAL")
    op.execute("UPDATE weld_point SET row_order = id")
    op.execute("CREATE INDEX ix_weld_point_row_order ON weld_point(row_order)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_weld_point_row_order")
    op.execute("ALTER TABLE weld_point DROP COLUMN row_order")
