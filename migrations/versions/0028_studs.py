"""Шпильки: каталог шпилек по схемам моделей и журнал недостающих шпилек.

* stud_scheme — схема шпилек модели; code = model.model_code (A13T, A01, P01G, CS55).
* stud_view — вид схемы (картинка). Сама картинка в git не хранится (чертежи OEM) —
  загружается на сервер через вкладку «Шпильки» в data/uploads/studs/views/<view_key>.jpg.
* stud — шпилька: уникальный номер на всех машинах (Tank 1001+, Jolion 2001+, CS55 3001+,
  Tiggo 4001+), место на картинке вида в процентах, артикул, станция (заполнит цех).
* stud_vin_prefix — какой схеме принадлежит начало VIN (первые 8 знаков); пополняется
  само: новый VIN оператор один раз относит к модели.
* stud_defect — запись оператора: VIN (как прочитан + рабочий ключ), шпилька, фото, кто/когда;
  категорию и источник ставят позже ИТО/УЗК по фото.

Каталог — migrations/data/0028_stud_catalog.json (собран из «Stud Defect Register_BS_rev1.xlsx»).
Идемпотентно (IF NOT EXISTS / INSERT OR IGNORE). Revision ID: 0028, Revises: 0027.
"""
import json
import os

from alembic import op

revision = '0028'
down_revision = '0027'
branch_labels = None
depends_on = None

CATALOG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', '0028_stud_catalog.json')


def load_catalog(path=CATALOG):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def seed_catalog(run, cat):
    """Заполнить справочники шпилек (INSERT OR IGNORE — правки цеха не затираются)."""
    for s in cat['schemes']:
        run('INSERT OR IGNORE INTO stud_scheme (code, title, brand, sort_order) VALUES (?,?,?,?)',
            (s['code'], s['title'], s['brand'], s['sort_order']))
    for v in cat['views']:
        run('INSERT OR IGNORE INTO stud_view (view_key, scheme_code, title, width, height, sort_order) '
            'VALUES (?,?,?,?,?,?)',
            (v['view_key'], v['scheme_code'], v['title'], v['width'], v['height'], v['sort_order']))
    for row in cat['studs']:
        run('INSERT OR IGNORE INTO stud (stud_no, scheme_code, view_key, x, y, part, colour, note) '
            'VALUES (?,?,?,?,?,?,?,?)', tuple(row))


def upgrade():
    op.execute("""
        CREATE TABLE IF NOT EXISTS stud_scheme (
            code        TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            brand       TEXT NOT NULL,
            sort_order  INTEGER NOT NULL DEFAULT 0
        )""")
    op.execute("""
        CREATE TABLE IF NOT EXISTS stud_view (
            view_key    TEXT PRIMARY KEY,
            scheme_code TEXT NOT NULL REFERENCES stud_scheme(code),
            title       TEXT NOT NULL,
            width       INTEGER NOT NULL,
            height      INTEGER NOT NULL,
            sort_order  INTEGER NOT NULL DEFAULT 0
        )""")
    op.execute("""
        CREATE TABLE IF NOT EXISTS stud (
            stud_no     INTEGER PRIMARY KEY,
            scheme_code TEXT NOT NULL REFERENCES stud_scheme(code),
            view_key    TEXT NOT NULL REFERENCES stud_view(view_key),
            x           REAL NOT NULL,
            y           REAL NOT NULL,
            part        TEXT,
            colour      TEXT,
            station     TEXT,
            note        TEXT,
            active      INTEGER NOT NULL DEFAULT 1
        )""")
    op.execute('CREATE INDEX IF NOT EXISTS ix_stud_view ON stud (view_key)')
    op.execute("""
        CREATE TABLE IF NOT EXISTS stud_vin_prefix (
            prefix      TEXT PRIMARY KEY,
            scheme_code TEXT NOT NULL REFERENCES stud_scheme(code),
            created_at  TEXT NOT NULL,
            created_by  INTEGER
        )""")
    op.execute("""
        CREATE TABLE IF NOT EXISTS stud_defect (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at  TEXT NOT NULL,
            created_by  INTEGER,
            vin         TEXT NOT NULL,
            vin_key     TEXT NOT NULL,
            scheme_code TEXT NOT NULL REFERENCES stud_scheme(code),
            stud_no     INTEGER NOT NULL REFERENCES stud(stud_no),
            station     TEXT,
            photo       TEXT,
            category    TEXT,
            source      TEXT,
            comment     TEXT,
            reviewed_by INTEGER,
            reviewed_at TEXT
        )""")
    op.execute('CREATE INDEX IF NOT EXISTS ix_stud_defect_created ON stud_defect (created_at)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_stud_defect_vin ON stud_defect (vin_key)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_stud_defect_stud ON stud_defect (stud_no)')

    conn = op.get_bind()
    seed_catalog(conn.exec_driver_sql, load_catalog())


def downgrade():
    for ix in ('ix_stud_defect_stud', 'ix_stud_defect_vin', 'ix_stud_defect_created', 'ix_stud_view'):
        op.execute(f'DROP INDEX IF EXISTS {ix}')
    for t in ('stud_defect', 'stud_vin_prefix', 'stud', 'stud_view', 'stud_scheme'):
        op.execute(f'DROP TABLE IF EXISTS {t}')
