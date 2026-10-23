"""ОТК при «не согласовано» обязан приложить фото (настройка в Редакторе).

Добавляет в ``defect_config`` строку ``require_reject_photo='1'`` — при возврате закрытия
от ОТК (``otk_reject``) требуется фото (чем ОТК подтверждает, что точка не закрыта), помимо
обязательного комментария. Флаг правится в «Редакторе» → «Параметры дефектов» ('1' вкл / '0' выкл).

Revision ID: 0015
Revises: 0014
Create Date: 2026-10-23
"""
from alembic import op

revision = '0015'
down_revision = '0014'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql(
        "INSERT OR IGNORE INTO defect_config (key, value) VALUES ('require_reject_photo', '1')")


def downgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql("DELETE FROM defect_config WHERE key='require_reject_photo'")
