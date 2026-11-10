"""Шпильки: номера цеха + 4 новые шпильки из обновлённого Excel цеха.

* stud.shop_no — номер шпильки, который дал цех (его видят оператор и ИТО/УЗК; уникален).
  stud.stud_no остаётся внутренним ключом: на него ссылаются записи журнала, поэтому правка
  номера цеха — это правка данных, а не перенумерация записей.
  Номер со знаком «?» (7035?, 6055?, 6024?) в Excel цеха стоит на двух шпильках — уточняется.
* 4 новых кружка цеха: Jolion, моторный отсек изнутри — 6024, 6032; Tiggo, вид сверху — 311, 748
  (теперь жёлтых N90068401 сверху 45, как в легенде Excel).

Данные — migrations/data/0029_stud_shop_numbers.json. Существующие данные не меняются:
номер ставится только туда, где его ещё нет; новые шпильки — INSERT OR IGNORE.

Журнал правок: это справочные данные каталога (как посев 0028), в change_log им не место —
к тому же старые триггеры аудита stud не знают новой колонки и записали бы 330 «правок» без
разницы. Поэтому триггеры аудита stud снимаются; приложение пересоздаёт их при старте
(app.audit.ensure_audit_triggers — уже с shop_no).
Revision ID: 0029, Revises: 0028.
"""
import json
import os

from alembic import op

revision = '0029'
down_revision = '0028'
branch_labels = None
depends_on = None

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', '0029_stud_shop_numbers.json')


def load_data(path=DATA):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def _drop_stud_audit_triggers():
    """Триггеры аудита stud (имена — app.audit._triggers_for); приложение пересоздаст их при старте."""
    for op_name in ('ins', 'upd', 'del'):
        op.execute(f'DROP TRIGGER IF EXISTS "audit_stud_{op_name}"')


def apply_shop_numbers(run, data):
    """Новые шпильки и номера цеха. Уже проставленный номер не затирается (правки цеха важнее)."""
    for row in data['new_studs']:
        *stud, shop_no = row
        run('INSERT OR IGNORE INTO stud (stud_no, scheme_code, view_key, x, y, part, colour, note) '
            'VALUES (?,?,?,?,?,?,?,?)', tuple(stud))
        run('UPDATE stud SET shop_no=? WHERE stud_no=? AND shop_no IS NULL', (shop_no, stud[0]))
    for stud_no, shop_no in data['shop_no'].items():
        run('UPDATE stud SET shop_no=? WHERE stud_no=? AND shop_no IS NULL', (shop_no, int(stud_no)))


def upgrade():
    conn = op.get_bind()
    _drop_stud_audit_triggers()
    if not _has_column(conn, 'stud', 'shop_no'):
        op.execute('ALTER TABLE stud ADD COLUMN shop_no TEXT')
    apply_shop_numbers(conn.exec_driver_sql, load_data())
    op.execute('CREATE UNIQUE INDEX IF NOT EXISTS ux_stud_shop_no ON stud (shop_no) WHERE shop_no IS NOT NULL')


def downgrade():
    conn = op.get_bind()
    _drop_stud_audit_triggers()       # триггеры с shop_no не дали бы удалить колонку
    op.execute('DROP INDEX IF EXISTS ux_stud_shop_no')
    # новые шпильки убираем, только если по ним нет записей журнала
    for row in load_data()['new_studs']:
        conn.exec_driver_sql('DELETE FROM stud WHERE stud_no=? AND NOT EXISTS '
                             '(SELECT 1 FROM stud_defect WHERE stud_defect.stud_no = stud.stud_no)', (row[0],))
    try:
        op.execute('ALTER TABLE stud DROP COLUMN shop_no')
    except Exception:  # noqa: BLE001 — старый SQLite без DROP COLUMN: поле безвредно
        pass
