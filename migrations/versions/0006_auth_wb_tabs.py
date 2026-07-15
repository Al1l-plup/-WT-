"""auth + wb_tabs: логин пользователя и настраиваемые вкладки Weld Balance

- wb_tab — вкладки Weld Balance (хранятся в БД, создаются из редактора «+ вкладка»);
  наполняется 4 текущими вкладками (конфигурация приложения — уместно в миграции).
- worker.login — логин для входа (уникальный частичный индекс: старые NULL не конфликтуют).

Revision ID: 0006
Revises: 0005
Create Date: 2026-07-16
"""
from alembic import op

revision = '0006'
down_revision = '0005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE wb_tab (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT NOT NULL,
            match_token TEXT NOT NULL UNIQUE,
            manual_src  TEXT NOT NULL,
            position    INTEGER NOT NULL DEFAULT 0
        )
    """)
    for pos, (title, token, manual) in enumerate([
        ('WB · A01 (Jolion 2WD/4WD)', 'A01', 'manual A01'),
        ('WB · P01 (Tank ToD)', 'P01', 'manual P01'),
        ('WB · A13T (Tiggo2)', 'A13T', 'manual A13T'),
        ('WB · CS55 (Changan)', 'cs55', 'manual cs55'),
    ]):
        op.execute(f"INSERT OR IGNORE INTO wb_tab (title, match_token, manual_src, position) "
                   f"VALUES ('{title}', '{token}', '{manual}', {pos})")
    op.execute("ALTER TABLE worker ADD COLUMN login TEXT")
    op.execute("CREATE UNIQUE INDEX ux_worker_login ON worker(login) WHERE login IS NOT NULL")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ux_worker_login")
    op.execute("ALTER TABLE worker DROP COLUMN login")
    op.execute("DROP TABLE IF EXISTS wb_tab")
