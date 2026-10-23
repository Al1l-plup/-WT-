"""VIN при закрытии требуется только для станций MB/UB (настройка в Редакторе).

Добавляет в ``defect_config`` строку ``vin_required_segments='MB,UB'`` — список сегментов
имени станции (``GW-MB-150`` → сегмент ``MB``), при которых закрытие требует VIN. Для
подсборок (прочие сегменты) и неизвестной станции VIN не требуется — хватит комментария
(время этапа пишется автоматически). Настройка правится в «Редакторе» → «Параметры дефектов»
без программиста. Схему менять не нужно (defect_config — key/value).

Revision ID: 0014
Revises: 0013
Create Date: 2026-10-23
"""
from alembic import op

revision = '0014'
down_revision = '0013'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql(
        "INSERT OR IGNORE INTO defect_config (key, value) VALUES ('vin_required_segments', 'MB,UB')")


def downgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql("DELETE FROM defect_config WHERE key='vin_required_segments'")
