"""Процесс дефектов 4M: цепочка согласования, этапы, фото, серийность, маршруты.

Добавляет:
- в ``defects``: current_stage_dept, stage_index, delegated_from_dept, closed_by_dept,
  is_serial, return_count, serial_of, stage_entered_at;
- ``defect_stage``   — история этапов (вход/выход, причина, контрмера, итог, исполнитель);
- ``defect_photo``   — фото дефекта (путь к файлу, кто, когда, на каком этапе);
- ``defect_occurrence`` — появления/фиксации (для серийных — несколько на дефект);
- ``defect_route``   — конфиг цепочки по коду дефекта (редактируется в Редакторе);
- ``defect_config``  — параметры процесса (окно серийности в днях).

Маршрут по умолчанию: Производство → WeldTeam → ИТО; для EO и MN — Производство → ИТО.
Окно серийности — 2 дня. Всё редактируемо.

Revision ID: 0010
Revises: 0009
Create Date: 2026-10-15
"""
from alembic import op

revision = '0010'
down_revision = '0009'
branch_labels = None
depends_on = None

# Начальные цепочки согласования: code -> [отделы по порядку]. '*' — по умолчанию.
DEFAULT_ROUTES = {
    '*':  ['Производство', 'WeldTeam', 'ИТО'],
    'EO': ['Производство', 'ИТО'],
    'MN': ['Производство', 'ИТО'],
}
SERIAL_WINDOW_DAYS = 2


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def _has_table(conn, table):
    return conn.exec_driver_sql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone() is not None


def upgrade() -> None:
    conn = op.get_bind()

    # ── новые поля defects ────────────────────────────────────────────────
    add = {
        'current_stage_dept':  "TEXT",
        'stage_index':         "INTEGER NOT NULL DEFAULT 0",
        'delegated_from_dept': "TEXT",
        'closed_by_dept':      "TEXT",
        'is_serial':           "INTEGER NOT NULL DEFAULT 0",
        'return_count':        "INTEGER NOT NULL DEFAULT 0",
        'serial_of':           "INTEGER",
        'stage_entered_at':    "TEXT",
    }
    for col, decl in add.items():
        if not _has_column(conn, 'defects', col):
            op.execute(f'ALTER TABLE defects ADD COLUMN {col} {decl}')

    # ── история этапов ────────────────────────────────────────────────────
    if not _has_table(conn, 'defect_stage'):
        op.execute("""
            CREATE TABLE defect_stage (
                UniqueID     INTEGER PRIMARY KEY AUTOINCREMENT,
                defect_id    INTEGER NOT NULL REFERENCES defects(UniqueID),
                dept         TEXT    NOT NULL,
                entered_at   TEXT    NOT NULL,
                left_at      TEXT,
                outcome      TEXT,           -- closed | passed | returned | to_oto | oto_done | reopened
                cause        TEXT,
                countermeasure TEXT,
                note         TEXT,
                actor_id     INTEGER REFERENCES worker(UniqueID)
            )""")
        op.execute("CREATE INDEX ix_defect_stage_defect ON defect_stage(defect_id)")

    # ── фото ──────────────────────────────────────────────────────────────
    if not _has_table(conn, 'defect_photo'):
        op.execute("""
            CREATE TABLE defect_photo (
                UniqueID    INTEGER PRIMARY KEY AUTOINCREMENT,
                defect_id   INTEGER NOT NULL REFERENCES defects(UniqueID),
                path        TEXT    NOT NULL,
                uploaded_by INTEGER REFERENCES worker(UniqueID),
                stage_dept  TEXT,
                ts          TEXT    NOT NULL
            )""")
        op.execute("CREATE INDEX ix_defect_photo_defect ON defect_photo(defect_id)")

    # ── появления (фиксации) ──────────────────────────────────────────────
    if not _has_table(conn, 'defect_occurrence'):
        op.execute("""
            CREATE TABLE defect_occurrence (
                UniqueID      INTEGER PRIMARY KEY AUTOINCREMENT,
                defect_id     INTEGER NOT NULL REFERENCES defects(UniqueID),
                occ_date      TEXT    NOT NULL,
                registered_by INTEGER REFERENCES worker(UniqueID)
            )""")
        op.execute("CREATE INDEX ix_defect_occurrence_defect ON defect_occurrence(defect_id)")

    # ── конфиг маршрута ───────────────────────────────────────────────────
    if not _has_table(conn, 'defect_route'):
        op.execute("""
            CREATE TABLE defect_route (
                UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
                code     TEXT    NOT NULL,
                position INTEGER NOT NULL,
                dept     TEXT    NOT NULL,
                UNIQUE(code, position)
            )""")
    # сид маршрутов (идемпотентно: только если таблица пуста)
    if conn.exec_driver_sql("SELECT COUNT(*) FROM defect_route").fetchone()[0] == 0:
        for code, depts in DEFAULT_ROUTES.items():
            for pos, dept in enumerate(depts):
                conn.exec_driver_sql(
                    "INSERT INTO defect_route (code, position, dept) VALUES (?, ?, ?)", (code, pos, dept))

    # ── конфиг процесса ───────────────────────────────────────────────────
    if not _has_table(conn, 'defect_config'):
        op.execute("""
            CREATE TABLE defect_config (
                key   TEXT PRIMARY KEY,
                value TEXT
            )""")
    conn.exec_driver_sql(
        "INSERT OR IGNORE INTO defect_config (key, value) VALUES ('serial_window_days', ?)",
        (str(SERIAL_WINDOW_DAYS),))


def downgrade() -> None:
    conn = op.get_bind()
    for t in ('defect_stage', 'defect_photo', 'defect_occurrence', 'defect_route', 'defect_config'):
        op.execute(f'DROP TABLE IF EXISTS {t}')
    for col in ('stage_entered_at', 'serial_of', 'return_count', 'is_serial',
                'closed_by_dept', 'delegated_from_dept', 'stage_index', 'current_stage_dept'):
        try:
            op.execute(f'ALTER TABLE defects DROP COLUMN {col}')
        except Exception:  # noqa: BLE001 — старый SQLite без DROP COLUMN
            pass
    _ = conn
