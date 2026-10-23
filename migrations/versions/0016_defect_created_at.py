"""Время регистрации дефекта (created_at) + обязательность фото при регистрации — в конфиг.

- Добавляет ``defects.created_at`` (TEXT, ISO datetime) — точное время, когда дефект поступил
  (зарегистрирован). Этапы уже со временем (entered_at/left_at), это — момент регистрации.
  Старым строкам проставляем created_at = df_date (дата без времени — лучше, чем пусто).
- Переносит флаг «фото обязательно при регистрации» в defect_config (require_defect_photo),
  чтобы правился в «Редакторе» без программиста. Значение по умолчанию '0' (сейчас выключено;
  включить — поставить '1' в Редакторе).

Revision ID: 0016
Revises: 0015
Create Date: 2026-10-23
"""
from alembic import op

revision = '0016'
down_revision = '0015'
branch_labels = None
depends_on = None


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, 'defects', 'created_at'):
        op.execute('ALTER TABLE defects ADD COLUMN created_at TEXT')
    conn.exec_driver_sql('UPDATE defects SET created_at = df_date WHERE created_at IS NULL')
    conn.exec_driver_sql(
        "INSERT OR IGNORE INTO defect_config (key, value) VALUES ('require_defect_photo', '0')")


def downgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql("DELETE FROM defect_config WHERE key='require_defect_photo'")
