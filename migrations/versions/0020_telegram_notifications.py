"""Telegram-уведомления: привязка работника к чату + очередь рассылки (outbox).

Добавляет:
* worker.tg_chat_id   — id чата Telegram работника (NULL = не подключён);
* worker.tg_link_code — одноразовый код для привязки по ссылке t.me/<бот>?start=<код>;
* notification_outbox — очередь исходящих уведомлений (outbox-паттерн): событие
  пишется в ту же транзакцию, что и смена этапа дефекта, а фоновый отправитель
  доставляет его в Telegram с ретраями. Так падение/недоступность Telegram НИКОГДА
  не ломает и не тормозит рабочий процесс дефектов.

Очередь исключена из аудита (app/audit.py AUDIT_EXCLUDE) — высокая оборачиваемость.

Downgrade: удаляет очередь и индекс. Две nullable-колонки в worker оставляем
(безвредны; DROP COLUMN в SQLite конфликтует с триггерами аудита на worker).

Revision ID: 0020
Revises: 0019
Create Date: 2026-10-29
"""
from alembic import op

revision = '0020'
down_revision = '0019'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('ALTER TABLE worker ADD COLUMN tg_chat_id TEXT')
    op.execute('ALTER TABLE worker ADD COLUMN tg_link_code TEXT')
    op.execute("""
        CREATE TABLE IF NOT EXISTS notification_outbox (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT    NOT NULL,
            worker_id  INTEGER,
            chat_id    TEXT    NOT NULL,
            text       TEXT    NOT NULL,
            defect_id  INTEGER,
            status     TEXT    NOT NULL DEFAULT 'pending',   -- pending | sent | failed
            attempts   INTEGER NOT NULL DEFAULT 0,
            last_error TEXT,
            sent_at    TEXT
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS ix_outbox_status ON notification_outbox(status)')


def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS ix_outbox_status')
    op.execute('DROP TABLE IF EXISTS notification_outbox')
    # worker.tg_chat_id / tg_link_code — оставляем (nullable, безвредны).
