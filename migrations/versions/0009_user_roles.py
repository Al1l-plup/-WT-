"""Ролевой доступ: worker.role + worker.must_change_password

- role: 'admin' | 'user'. Админ (по ADMIN_EMAIL) управляет пользователями и
  сбрасывает пароли. Базовые права остальных определяются отделом (см.
  app/permissions.py), поэтому отдельная роль на отдел не нужна.
- must_change_password: после сброса пароля админом пользователь входит по
  временному паролю и обязан задать свой (флаг снимается при смене).

Аккаунт с логином al.galimov@astana-motors.kz помечается ролью admin
(идемпотентно; приложение также поднимает эту роль при входе по совпадению почты).

Revision ID: 0009
Revises: 0008
Create Date: 2026-07-23
"""
from alembic import op

revision = '0009'
down_revision = '0008'
branch_labels = None
depends_on = None

ADMIN_EMAIL = 'al.galimov@astana-motors.kz'


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, 'worker', 'role'):
        op.execute("ALTER TABLE worker ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")
    if not _has_column(conn, 'worker', 'must_change_password'):
        op.execute('ALTER TABLE worker ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0')
    # пометить существующий админский аккаунт (если уже зарегистрирован)
    op.execute(f"UPDATE worker SET role='admin' WHERE LOWER(login)='{ADMIN_EMAIL}'")


def downgrade() -> None:
    # SQLite < 3.35 не умеет DROP COLUMN; на новых — можно, но откат ролей не требуется.
    for col in ('must_change_password', 'role'):
        try:
            op.execute(f'ALTER TABLE worker DROP COLUMN {col}')
        except Exception:  # noqa: BLE001 — старый SQLite: оставляем колонку
            pass
