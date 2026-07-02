"""Идемпотентные миграции схемы БД.

Выполняются один раз при старте приложения (из фабрики ``create_app``).
Все операции безопасны для повторного запуска: ``ALTER TABLE`` оборачиваются
в try/except, справочные таблицы создаются через ``CREATE TABLE IF NOT EXISTS``,
а наполнение справочника — через ``INSERT OR IGNORE``.
"""
import sqlite3

from app.constants import DEFECT_DICTIONARY


def run_migrations(db_path: str) -> None:
    """Привести схему БД по указанному пути к актуальному виду."""
    c = sqlite3.connect(db_path)
    for ddl in [
        "ALTER TABLE defects ADD COLUMN description TEXT",
        "ALTER TABLE defects ADD COLUMN status TEXT DEFAULT 'registered'",
        "ALTER TABLE defects ADD COLUMN assigned_worker_id INTEGER",
        "ALTER TABLE worker  ADD COLUMN department TEXT DEFAULT 'WeldTeam'",
        "ALTER TABLE defects ADD COLUMN manual_spot_number TEXT",
        "ALTER TABLE defects ADD COLUMN manual_brand_id INTEGER",
        "ALTER TABLE defects ADD COLUMN manual_model_id INTEGER",
        "ALTER TABLE defects ADD COLUMN auto_created_spot_id INTEGER",
        "ALTER TABLE welding_setup ADD COLUMN auto_created INTEGER DEFAULT 0",
        "ALTER TABLE gun RENAME COLUMN model TO gun_type",
        # --- Snapshot-колонки: замораживают контекст на момент записи (историческая целостность) ---
        "ALTER TABLE maintenance ADD COLUMN snap_g_num INTEGER",
        "ALTER TABLE maintenance ADD COLUMN snap_gun_type TEXT",
        "ALTER TABLE maintenance ADD COLUMN snap_station_id INTEGER",
        "ALTER TABLE maintenance ADD COLUMN snap_station_name TEXT",
        "ALTER TABLE maintenance ADD COLUMN snap_brand_id INTEGER",
        "ALTER TABLE maintenance ADD COLUMN snap_brand TEXT",
        "ALTER TABLE maintenance ADD COLUMN snap_worker_surname TEXT",
        "ALTER TABLE maintenance ADD COLUMN snap_mode TEXT",
        "ALTER TABLE maintenance ADD COLUMN snap_pressure INTEGER",
        "ALTER TABLE maintenance ADD COLUMN snap_heat_1 INTEGER",
        "ALTER TABLE maintenance ADD COLUMN snap_heat_2 INTEGER",
        "ALTER TABLE maintenance ADD COLUMN snap_turn_R REAL",
        "ALTER TABLE defects ADD COLUMN snap_spot_number TEXT",
        "ALTER TABLE defects ADD COLUMN snap_model_id INTEGER",
        "ALTER TABLE defects ADD COLUMN snap_model_name TEXT",
        "ALTER TABLE defects ADD COLUMN snap_model_type TEXT",
        "ALTER TABLE defects ADD COLUMN snap_brand_id INTEGER",
        "ALTER TABLE defects ADD COLUMN snap_brand TEXT",
        "ALTER TABLE defects ADD COLUMN snap_station_id INTEGER",
        "ALTER TABLE defects ADD COLUMN snap_station_name TEXT",
        "ALTER TABLE defects ADD COLUMN snap_g_num INTEGER",
        "ALTER TABLE defects ADD COLUMN snap_gun_type TEXT",
        """CREATE TABLE IF NOT EXISTS defect_code (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )""",
        """CREATE TABLE IF NOT EXISTS maintenance_schedule (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            gun_id       INTEGER NOT NULL,
            brand_id     INTEGER NOT NULL,
            month_number INTEGER NOT NULL,
            plan_type    TEXT,
            UNIQUE(gun_id, month_number)
        )""",
        """CREATE TABLE IF NOT EXISTS maintenance_daily_task (
            id                       INTEGER PRIMARY KEY AUTOINCREMENT,
            gun_id                   INTEGER NOT NULL,
            task_date                TEXT NOT NULL,
            status                   TEXT DEFAULT 'pending',
            assigned_worker_id       INTEGER,
            created_by_worker_id     INTEGER,
            completed_maintenance_id INTEGER,
            notes                    TEXT,
            created_at               TEXT DEFAULT (datetime('now'))
        )""",
    ]:
        try:
            c.execute(ddl)
            c.commit()
        except Exception:
            pass
    c.execute("UPDATE defects SET status='closed'     WHERE status IS NULL AND solution != 'В процессе устранения'")
    c.execute("UPDATE defects SET status='registered' WHERE status IS NULL")
    c.execute("UPDATE worker  SET department='WeldTeam' WHERE department IS NULL")
    for code, name in DEFECT_DICTIONARY.items():
        try:
            c.execute("INSERT OR IGNORE INTO defect_code (code, name) VALUES (?,?)", (code, name))
        except Exception:
            pass
    c.commit()
    c.close()
