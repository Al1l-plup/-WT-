"""drop temp tables: удалить неиспользуемые технические таблицы импорта

param_temp, spot_gun_temp, temp_import, temp_import_guns — остатки разовых импортов,
в коде приложения не используются. Убираем для чистоты схемы.

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-02
"""
from alembic import op

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None

_TEMP_TABLES = ['param_temp', 'spot_gun_temp', 'temp_import', 'temp_import_guns']


def upgrade() -> None:
    for name in _TEMP_TABLES:
        op.execute(f'DROP TABLE IF EXISTS "{name}"')


def downgrade() -> None:
    # Таблицы-мусор не восстанавливаем (структура не важна).
    pass
