"""Окно серийности дефектов — до недели (7 дней).

Повтор дефекта на той же точке в той же группе кодов в пределах этого окна считается
серийным. По умолчанию было 2 дня — расширяем до 7, чтобы ловить повторяемость за смену/
неделю. Меняем только если значение ещё дефолтное (2) — ручную настройку из «Редактора»
не затираем.

Revision ID: 0011
Revises: 0010
Create Date: 2026-10-21
"""
from alembic import op

revision = '0011'
down_revision = '0010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    # поднять до 7 только если всё ещё дефолт (2) — не трогаем, если админ уже менял
    conn.exec_driver_sql("UPDATE defect_config SET value='7' WHERE key='serial_window_days' AND value='2'")
    # на всякий случай создать, если строки нет
    conn.exec_driver_sql("INSERT OR IGNORE INTO defect_config (key, value) VALUES ('serial_window_days', '7')")


def downgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql("UPDATE defect_config SET value='2' WHERE key='serial_window_days' AND value='7'")
