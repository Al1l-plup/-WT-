"""Закрытие дефекта через согласование ОТК + VIN.

Добавляет в ``defects`` поле ``vin`` — VIN (или последние 4), на котором отдел проверил
и решил закрыть дефект («с какого решено»). Указывается при закрытии.

Схему под новый статус менять не нужно: ``status`` — TEXT, добавляется значение
``pending_otk`` (закрыто отделом, ждёт перепроверки точки в ОТК). ОТК согласует → ``closed``;
не согласует → возврат отделу, который закрывал.

Revision ID: 0012
Revises: 0011
Create Date: 2026-10-23
"""
from alembic import op

revision = '0012'
down_revision = '0011'
branch_labels = None
depends_on = None


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, 'defects', 'vin'):
        op.execute('ALTER TABLE defects ADD COLUMN vin TEXT')


def downgrade() -> None:
    # SQLite не умеет DROP COLUMN в старых версиях — оставляем поле (безвредно).
    pass
