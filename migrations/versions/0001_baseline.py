"""baseline: полная текущая схема WeldTeam MES

Создаёт все таблицы в том виде, в каком схема сложилась к моменту внедрения Alembic
(включая колонки, добавленные прежними ALTER, и snapshot-колонки snap_*).

Revision ID: 0001
Revises:
Create Date: 2026-07-02
"""
from alembic import op

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

# CREATE-выражения сняты с рабочей БД (sqlite_master) — точная текущая схема.
_TABLES = [
    # brand
    'CREATE TABLE brand (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    brand VARCHAR(10) NOT NULL\r\n)',
    # defect_code
    'CREATE TABLE defect_code (\n            code TEXT PRIMARY KEY,\n            name TEXT NOT NULL\n        )',
    # defects
    "CREATE TABLE defects (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    problem_code VARCHAR(3) NOT NULL,\r\n    root_cause TEXT NOT NULL,\r\n    solution TEXT NOT NULL,\r\n    df_date DATE NOT NULL,\r\n    worker_solve_id INTEGER,\r\n    spot_id INTEGER,\r\n    gun_id INTEGER, worker_register_id INTEGER REFERENCES worker(UniqueID), description TEXT, status TEXT DEFAULT 'registered', assigned_worker_id INTEGER, manual_spot_number TEXT, manual_brand_id INTEGER, auto_created_spot_id INTEGER, manual_model_id INTEGER, snap_spot_number TEXT, snap_model_id INTEGER, snap_model_name TEXT, snap_model_type TEXT, snap_brand_id INTEGER, snap_brand TEXT, snap_station_id INTEGER, snap_station_name TEXT, snap_g_num INTEGER, snap_gun_type TEXT,\r\n    FOREIGN KEY (worker_solve_id) REFERENCES worker(UniqueID),\r\n    FOREIGN KEY (spot_id) REFERENCES spot(UniqueID),\r\n    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID)\r\n)",
    # gun
    'CREATE TABLE gun (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    g_num INTEGER NOT NULL,\r\n    gun_type VARCHAR(20) NOT NULL\r\n)',
    # gun_transformer_assignment
    'CREATE TABLE "gun_transformer_assignment" (\n\t"UniqueID"\tINTEGER,\n\t"start_date"\tDATE NOT NULL,\n\t"end_date"\tDATE,\n\t"is_active"\tBOOL NOT NULL,\n\t"comments"\tTEXT NOT NULL,\n\t"gun_id"\tINTEGER,\n\t"transformer_id"\tINTEGER,\n\tPRIMARY KEY("UniqueID" AUTOINCREMENT),\n\tFOREIGN KEY("gun_id") REFERENCES "gun"("UniqueID"),\n\tFOREIGN KEY("transformer_id") REFERENCES "trans"("UniqueID")\n)',
    # maintenance
    'CREATE TABLE maintenance (\r\n    UniqueId INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    first_weld INTEGER NOT NULL,\r\n    second_weld INTEGER NOT NULL,\r\n    third_weld INTEGER NOT NULL,\r\n    first_pressure INTEGER NOT NULL,\r\n    second_pressure INTEGER NOT NULL,\r\n    third_pressure INTEGER NOT NULL,\r\n    to_date DATE NOT NULL,\r\n    worker_id INTEGER,\r\n    gun_id INTEGER, parameter_id INTEGER REFERENCES parameters(UniqueID), snap_g_num INTEGER, snap_gun_type TEXT, snap_station_id INTEGER, snap_station_name TEXT, snap_brand_id INTEGER, snap_brand TEXT, snap_worker_surname TEXT, snap_mode TEXT, snap_pressure INTEGER, snap_heat_1 INTEGER, snap_heat_2 INTEGER, snap_turn_R REAL,\r\n    FOREIGN KEY (worker_id) REFERENCES worker(UniqueID),\r\n    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID)\r\n)',
    # maintenance_daily_task
    "CREATE TABLE maintenance_daily_task (\n    id                       INTEGER PRIMARY KEY AUTOINCREMENT,\n    gun_id                   INTEGER NOT NULL,\n    task_date                TEXT NOT NULL,\n    status                   TEXT DEFAULT 'pending',\n    assigned_worker_id       INTEGER,\n    created_by_worker_id     INTEGER,\n    completed_maintenance_id INTEGER,\n    notes                    TEXT,\n    created_at               TEXT DEFAULT (datetime('now'))\n)",
    # maintenance_schedule
    'CREATE TABLE maintenance_schedule (\n    id           INTEGER PRIMARY KEY AUTOINCREMENT,\n    gun_id       INTEGER NOT NULL,\n    brand_id     INTEGER NOT NULL,\n    month_number INTEGER NOT NULL,\n    plan_type    TEXT,\n    UNIQUE(gun_id, month_number)\n)',
    # model
    'CREATE TABLE model (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    model_name VARCHAR(20) NOT NULL,\r\n    model_code VARCHAR(10) NOT NULL,\r\n    type VARCHAR(10) NOT NULL,\r\n    brand_id INTEGER,\r\n    FOREIGN KEY (brand_id) REFERENCES brand(UniqueID)\r\n)',
    # param_temp
    'CREATE TABLE "param_temp" (\n\t"g_num"\tINTEGER,\n\t"pressure"\tINTEGER,\n\t"squeeze_time"\tINTEGER,\n\t"up_slope_time"\tINTEGER,\n\t"weld_1"\tINTEGER,\n\t"heat_1"\tINTEGER,\n\t"cool_1"\tINTEGER,\n\t"weld_2"\tINTEGER,\n\t"heat_2"\tINTEGER,\n\t"hold"\tINTEGER,\n\t"turn_R"\tTEXT,\n\t"field12"\tTEXT,\n\t"field13"\tTEXT,\n\t"field14"\tTEXT,\n\t"field15"\tTEXT,\n\t"field16"\tTEXT,\n\t"field17"\tTEXT,\n\t"field18"\tTEXT,\n\t"field19"\tTEXT,\n\t"field20"\tTEXT,\n\t"field21"\tTEXT,\n\t"field22"\tTEXT\n)',
    # parameters
    'CREATE TABLE parameters (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n\tpressure INTEGER NOT NULL,\r\n    squeeze_time INTEGER NOT NULL,\r\n    up_slope_time INTEGER NOT NULL,\r\n    weld_1 INTEGER NOT NULL,\r\n    heat_1 INTEGER NOT NULL,\r\n    cool_1 INTEGER NOT NULL,\r\n    weld_2 INTEGER NOT NULL,\r\n    heat_2 INTEGER NOT NULL,\r\n    hold INTEGER NOT NULL,\r\n    turn_R DECIMAL(3,1) NOT NULL\r\n\t\r\n, mode TEXT)',
    # spot
    'CREATE TABLE spot (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    spot_number INTEGER NOT NULL,\r\n    model_id INTEGER, welding_type VARCHAR(5),\r\n    FOREIGN KEY (model_id) REFERENCES model(UniqueID)\r\n)',
    # spot_gun_temp
    'CREATE TABLE "spot_gun_temp" (\n\t"g_num"\tINTEGER,\n\t"spot"\tINTEGER,\n\t"model_id"\tINTEGER\n)',
    # station
    'CREATE TABLE station (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    station_name VARCHAR(20) NOT NULL,\r\n    brand_id INTEGER,\r\n    FOREIGN KEY (brand_id) REFERENCES brand(UniqueID)\r\n)',
    # temp_import
    'CREATE TABLE "temp_import" (\n\t"field1"\tTEXT,\n\t"field2"\tTEXT\n)',
    # temp_import_guns
    'CREATE TABLE "temp_import_guns" (\n\t"field1"\tTEXT,\n\t"field2"\tTEXT\n)',
    # trans
    "CREATE TABLE trans (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    transID VARCHAR(20) NOT NULL,\r\n    type VARCHAR(2) CHECK (type IN('AC', 'DC')) NOT NULL\r\n)",
    # transformer_station_assignment
    'CREATE TABLE transformer_station_assignment (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    start_date DATE NOT NULL,\r\n    end_date DATE,\r\n\tis_active BOOL NOT NULL,\r\n    comment TEXT,\r\n    transformer_id INTEGER,\r\n    station_id INTEGER,\r\n    FOREIGN KEY (transformer_id) REFERENCES trans(UniqueID),\r\n    FOREIGN KEY (station_id) REFERENCES station(UniqueID)\r\n)',
    # welding_setup
    'CREATE TABLE welding_setup (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    comments TEXT NOT NULL,\r\n\tstart_date DATE NOT NULL,\r\n\tend_date DATE,\r\n\tis_active BOOL NOT NULL,\r\n    spot_id INTEGER,\r\n    gun_id INTEGER,\r\n    parameter_id INTEGER, auto_created INTEGER DEFAULT 0,\r\n    FOREIGN KEY (spot_id) REFERENCES spot(UniqueID),\r\n    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID),\r\n    FOREIGN KEY (parameter_id) REFERENCES parameters(UniqueID)\r\n)',
    # worker
    "CREATE TABLE worker (\r\n    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,\r\n    surname VARCHAR(20) NOT NULL,\r\n    name VARCHAR(255) NOT NULL,\r\n    father_name VARCHAR(255),\r\n    position VARCHAR(30) NOT NULL,\r\n    email VARCHAR(50),\r\n    password VARCHAR(10) NOT NULL,\r\n    start_date DATE NOT NULL,\r\n    end_date DATE,\r\n\tis_active BOOL\r\n, department TEXT DEFAULT 'WeldTeam')",
]

_TABLE_NAMES = [
    'brand',
    'defect_code',
    'defects',
    'gun',
    'gun_transformer_assignment',
    'maintenance',
    'maintenance_daily_task',
    'maintenance_schedule',
    'model',
    'param_temp',
    'parameters',
    'spot',
    'spot_gun_temp',
    'station',
    'temp_import',
    'temp_import_guns',
    'trans',
    'transformer_station_assignment',
    'welding_setup',
    'worker',
]


def upgrade() -> None:
    for ddl in _TABLES:
        op.execute(ddl)


def downgrade() -> None:
    for name in reversed(_TABLE_NAMES):
        op.execute(f'DROP TABLE IF EXISTS "{name}"')
