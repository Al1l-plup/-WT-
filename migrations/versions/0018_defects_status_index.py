"""Индекс defects(status) — ускоряет доску дефектов.

Доска /api/defects/all фильтрует дефекты по статусу тремя выборками
(open / unresolved / closed). Без индекса каждая делает полный скан таблицы
defects; с ростом числа закрытых дефектов это единственное место, которое
деградирует. Индекс превращает фильтр по статусу в поиск по индексу.

Чисто производительностное изменение: НЕ меняет данные и НЕ меняет результат
запросов (те же строки, тот же порядок — ORDER BY остаётся). Приложение не
трогается. Операция обратима (downgrade удаляет индекс), данные целы.

Идемпотентно (CREATE INDEX IF NOT EXISTS) — безопасно при повторном прогоне.
Построение берёт краткую блокировку таблицы; на реальных объёмах (десятки–тысячи
строк) это доли миллисекунды, а деплой и так перезапускает сервис.

Revision ID: 0018
Revises: 0017
Create Date: 2026-10-28
"""
from alembic import op

revision = '0018'
down_revision = '0017'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE INDEX IF NOT EXISTS ix_defects_status ON defects(status)')


def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS ix_defects_status')
