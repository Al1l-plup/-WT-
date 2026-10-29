"""Индекс defects(status) → выражение-индекс COALESCE(status,'registered').

0018 создала ix_defects_status ON defects(status). Но доска /api/defects/all
фильтрует по COALESCE(d.status,'registered') (открытые/закрытые/не выявлено),
а обычный индекс по «голому» столбцу планировщик для такого выражения
использовать не может — получался полный SCAN таблицы. Пересоздаём индекс
как ВЫРАЖЕНИЕ-индекс по тому же COALESCE — тогда фильтр по статусу становится
поиском (SEARCH), а не сканом, и ускорение из 0018 реально работает.

Проверено на копии БД (EXPLAIN QUERY PLAN): open / closed / unresolved →
«SEARCH d USING COVERING INDEX ix_defects_status (<expr>=?)»; наборы строк
до и после идентичны — изменение чисто производительностное, данные и
результаты запросов не меняются. Операция обратима (downgrade возвращает
обычный индекс). Идемпотентно (IF EXISTS / IF NOT EXISTS).

Revision ID: 0019
Revises: 0018
Create Date: 2026-10-29
"""
from alembic import op

revision = '0019'
down_revision = '0018'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('DROP INDEX IF EXISTS ix_defects_status')
    op.execute("CREATE INDEX IF NOT EXISTS ix_defects_status ON defects(COALESCE(status, 'registered'))")


def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS ix_defects_status')
    op.execute('CREATE INDEX IF NOT EXISTS ix_defects_status ON defects(status)')
