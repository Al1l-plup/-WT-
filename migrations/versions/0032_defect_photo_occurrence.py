"""Фото дефекта ложится на шаг ЗАГРУЗИВШЕГО: фото регистрации — к выявлению УЗК.

* defect_photo.occurrence_id — ссылка на выявление (defect_occurrence): фото, снятое УЗК при
  регистрации (и при каждом повторе серии), принадлежит этому выявлению, а не этапу отдела,
  к которому дефект ушёл после регистрации. Раньше фото регистрации сохранялось уже после
  входа в цепочку и показывалось так, будто его сняло Производство (или отдел, закрывший
  дефект, — при повторе на согласовании УЗК).
* defect_photo.taken_at_stage_id — на каком этапе был дефект в момент снимка (открытый этап
  при сохранении). Для фото выявления это «до какого шага автор может его удалить»: пока
  этот этап открыт. Время тут не годится — шаги могут уложиться в одну секунду.
* ix_defect_photo_occurrence — фото выявления в карточке.

Только новые колонки и индекс — существующие фото не переносятся (данные не меняются).
Revision ID: 0032, Revises: 0031.
"""
from alembic import op

revision = '0032'
down_revision = '0031'
branch_labels = None
depends_on = None

_COLUMNS = (
    ('occurrence_id', 'INTEGER REFERENCES defect_occurrence(UniqueID)'),
    ('taken_at_stage_id', 'INTEGER REFERENCES defect_stage(UniqueID)'),
)


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade():
    conn = op.get_bind()
    for col, decl in _COLUMNS:
        if not _has_column(conn, 'defect_photo', col):
            op.execute(f'ALTER TABLE defect_photo ADD COLUMN {col} {decl}')
    op.execute('CREATE INDEX IF NOT EXISTS ix_defect_photo_occurrence ON defect_photo (occurrence_id)')


def downgrade():
    op.execute('DROP INDEX IF EXISTS ix_defect_photo_occurrence')
    # триггеры аудита (app.audit) ссылаются на колонки и не дали бы их удалить;
    # приложение пересоздаёт их при старте по текущей схеме
    for op_name in ('ins', 'upd', 'del'):
        op.execute(f'DROP TRIGGER IF EXISTS "audit_defect_photo_{op_name}"')
    for col, _decl in reversed(_COLUMNS):
        try:
            op.execute(f'ALTER TABLE defect_photo DROP COLUMN {col}')
        except Exception:  # noqa: BLE001 — старый SQLite без DROP COLUMN: поле безвредно
            pass
