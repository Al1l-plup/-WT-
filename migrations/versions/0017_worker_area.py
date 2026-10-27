"""Зоны ответственности сотрудников: worker → (бренд, участок).

Сотрудники Производства/ИТО отвечают за участки (сегменты станций: MB, UB, EC...) отдельно
по каждому бренду. Таблица worker_area хранит набор (worker_id, brand_id, segment). segment —
базовый код участка (EC1/EC2 → EC, цифры в хвосте отбрасываются). Используется для адресации
дефектов в «Мои входящие»: сотрудник видит только дефекты своих (бренд+участок); если зон нет
— видит всё своего отдела (мягкий режим). Собственный UniqueID — чтобы работал аудит.

Revision ID: 0017
Revises: 0016
Create Date: 2026-10-23
"""
from alembic import op

revision = '0017'
down_revision = '0016'
branch_labels = None
depends_on = None


def _has_table(conn, table):
    return conn.exec_driver_sql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone() is not None


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_table(conn, 'worker_area'):
        op.execute("""
            CREATE TABLE worker_area (
                UniqueID  INTEGER PRIMARY KEY,
                worker_id INTEGER NOT NULL REFERENCES worker(UniqueID),
                brand_id  INTEGER NOT NULL REFERENCES brand(UniqueID),
                segment   TEXT    NOT NULL,
                UNIQUE(worker_id, brand_id, segment)
            )""")
        op.execute('CREATE INDEX ix_worker_area_worker ON worker_area(worker_id)')


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS worker_area')
