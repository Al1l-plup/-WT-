-- Схема WeldTeam MES (справочно; источник истины — миграции Alembic в migrations/).

CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL, 
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

CREATE TABLE brand (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(10) NOT NULL
);

CREATE TABLE defect_code (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );

CREATE TABLE defects (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_code VARCHAR(3) NOT NULL,
    root_cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    df_date DATE NOT NULL,
    worker_solve_id INTEGER,
    spot_id INTEGER,
    gun_id INTEGER, worker_register_id INTEGER REFERENCES worker(UniqueID), description TEXT, status TEXT DEFAULT 'registered', assigned_worker_id INTEGER, manual_spot_number TEXT, manual_brand_id INTEGER, auto_created_spot_id INTEGER, manual_model_id INTEGER, snap_spot_number TEXT, snap_model_id INTEGER, snap_model_name TEXT, snap_model_type TEXT, snap_brand_id INTEGER, snap_brand TEXT, snap_station_id INTEGER, snap_station_name TEXT, snap_g_num INTEGER, snap_gun_type TEXT,
    FOREIGN KEY (worker_solve_id) REFERENCES worker(UniqueID),
    FOREIGN KEY (spot_id) REFERENCES spot(UniqueID),
    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID)
);

CREATE TABLE gun (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    g_num INTEGER NOT NULL,
    gun_type VARCHAR(20) NOT NULL
);

CREATE TABLE "gun_transformer_assignment" (
	"UniqueID"	INTEGER,
	"start_date"	DATE NOT NULL,
	"end_date"	DATE,
	"is_active"	BOOL NOT NULL,
	"comments"	TEXT NOT NULL,
	"gun_id"	INTEGER,
	"transformer_id"	INTEGER,
	PRIMARY KEY("UniqueID" AUTOINCREMENT),
	FOREIGN KEY("gun_id") REFERENCES "gun"("UniqueID"),
	FOREIGN KEY("transformer_id") REFERENCES "trans"("UniqueID")
);

CREATE TABLE maintenance (
    UniqueId INTEGER PRIMARY KEY AUTOINCREMENT,
    first_weld INTEGER NOT NULL,
    second_weld INTEGER NOT NULL,
    third_weld INTEGER NOT NULL,
    first_pressure INTEGER NOT NULL,
    second_pressure INTEGER NOT NULL,
    third_pressure INTEGER NOT NULL,
    to_date DATE NOT NULL,
    worker_id INTEGER,
    gun_id INTEGER, parameter_id INTEGER REFERENCES parameters(UniqueID), snap_g_num INTEGER, snap_gun_type TEXT, snap_station_id INTEGER, snap_station_name TEXT, snap_brand_id INTEGER, snap_brand TEXT, snap_worker_surname TEXT, snap_mode TEXT, snap_pressure INTEGER, snap_heat_1 INTEGER, snap_heat_2 INTEGER, snap_turn_R REAL,
    FOREIGN KEY (worker_id) REFERENCES worker(UniqueID),
    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID)
);

CREATE TABLE maintenance_daily_task (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    gun_id                   INTEGER NOT NULL,
    task_date                TEXT NOT NULL,
    status                   TEXT DEFAULT 'pending',
    assigned_worker_id       INTEGER,
    created_by_worker_id     INTEGER,
    completed_maintenance_id INTEGER,
    notes                    TEXT,
    created_at               TEXT DEFAULT (datetime('now'))
);

CREATE TABLE maintenance_schedule (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    gun_id       INTEGER NOT NULL,
    brand_id     INTEGER NOT NULL,
    month_number INTEGER NOT NULL,
    plan_type    TEXT,
    UNIQUE(gun_id, month_number)
);

CREATE TABLE model (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(20) NOT NULL,
    model_code VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL,
    brand_id INTEGER,
    FOREIGN KEY (brand_id) REFERENCES brand(UniqueID)
);

CREATE TABLE parameters (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
	pressure INTEGER NOT NULL,
    squeeze_time INTEGER NOT NULL,
    up_slope_time INTEGER NOT NULL,
    weld_1 INTEGER NOT NULL,
    heat_1 INTEGER NOT NULL,
    cool_1 INTEGER NOT NULL,
    weld_2 INTEGER NOT NULL,
    heat_2 INTEGER NOT NULL,
    hold INTEGER NOT NULL,
    turn_R DECIMAL(3,1) NOT NULL
	
, mode TEXT);

CREATE TABLE spot (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    spot_number INTEGER NOT NULL,
    model_id INTEGER, welding_type VARCHAR(5),
    FOREIGN KEY (model_id) REFERENCES model(UniqueID)
);

CREATE TABLE station (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    station_name VARCHAR(20) NOT NULL,
    brand_id INTEGER,
    FOREIGN KEY (brand_id) REFERENCES brand(UniqueID)
);

CREATE TABLE trans (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    transID VARCHAR(20) NOT NULL,
    type VARCHAR(2) CHECK (type IN('AC', 'DC')) NOT NULL
);

CREATE TABLE transformer_station_assignment (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date DATE NOT NULL,
    end_date DATE,
	is_active BOOL NOT NULL,
    comment TEXT,
    transformer_id INTEGER,
    station_id INTEGER,
    FOREIGN KEY (transformer_id) REFERENCES trans(UniqueID),
    FOREIGN KEY (station_id) REFERENCES station(UniqueID)
);

CREATE TABLE welding_setup (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    comments TEXT NOT NULL,
	start_date DATE NOT NULL,
	end_date DATE,
	is_active BOOL NOT NULL,
    spot_id INTEGER,
    gun_id INTEGER,
    parameter_id INTEGER, auto_created INTEGER DEFAULT 0,
    FOREIGN KEY (spot_id) REFERENCES spot(UniqueID),
    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID),
    FOREIGN KEY (parameter_id) REFERENCES parameters(UniqueID)
);

CREATE TABLE worker (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    surname VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    position VARCHAR(30) NOT NULL,
    email VARCHAR(50),
    password VARCHAR(10) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
	is_active BOOL
, department TEXT DEFAULT 'WeldTeam');
