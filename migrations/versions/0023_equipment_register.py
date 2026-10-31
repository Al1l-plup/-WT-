"""Перечень оборудования = Excel-файл цеха 1:1 (вставка Ctrl+V, как в Weld Balance).

* equipment_item — строка Перечня ровно по колонкам Excel «Перечень оборудования»:
  ID, Наименование, Тип, Замечание, Бренд, Участок, Станция, Подразделение, Категория
  (+ row_order — порядок строк листа). ID в файле НЕ уникален (кондукторы, дубли G) —
  ключ суррогатный, повтор G-номера уходит в «Сверку». Правится людьми → в Журнале.
* equipment_link — производные связи строки Перечня (G-номер, пистолет, станция по
  Перечню через трансформатор/робот). Пересобирается приложением после каждого
  сохранения Перечня (app/equipment.py) — в Журнал не пишется (AUDIT_EXCLUDE).

Справочник пистолетов (gun) и трансформатор пистолета наполняются из Перечня; станция
пистолета для дефектов и ТО — по-прежнему только из Weld Balance (расхождение — в Сверке).

Идемпотентно (IF NOT EXISTS). Revision ID: 0023, Revises: 0022.
"""
from alembic import op

revision = '0023'
down_revision = '0022'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        CREATE TABLE IF NOT EXISTS equipment_item (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            item_code   TEXT,
            name        TEXT,
            item_type   TEXT,
            note        TEXT,
            brand       TEXT,
            area        TEXT,
            location    TEXT,
            dept        TEXT,
            category    TEXT,
            row_order   REAL
        )""")
    op.execute('CREATE INDEX IF NOT EXISTS ix_equipment_item_code ON equipment_item (item_code)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_equipment_item_order ON equipment_item (row_order)')
    op.execute("""
        CREATE TABLE IF NOT EXISTS equipment_link (
            item_id      INTEGER PRIMARY KEY,
            g_num        INTEGER,
            gun_id       INTEGER,
            reg_station  TEXT,
            station_id   INTEGER
        )""")
    op.execute('CREATE INDEX IF NOT EXISTS ix_equipment_link_gun ON equipment_link (gun_id)')


def downgrade():
    op.execute('DROP TABLE IF EXISTS equipment_link')
    op.execute('DROP INDEX IF EXISTS ix_equipment_item_order')
    op.execute('DROP INDEX IF EXISTS ix_equipment_item_code')
    op.execute('DROP TABLE IF EXISTS equipment_item')
