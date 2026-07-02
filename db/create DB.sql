CREATE TABLE brand (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(10) NOT NULL
);

CREATE TABLE trans (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    transID VARCHAR(20) NOT NULL,
    type VARCHAR(2) CHECK (type IN('AC', 'DC')) NOT NULL
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
	
);


-------------------------------------------------------------------



CREATE TABLE station (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    station_name VARCHAR(20) NOT NULL,
    brand_id INTEGER,
    FOREIGN KEY (brand_id) REFERENCES brand(UniqueID)
);

CREATE TABLE model (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(20) NOT NULL,
    model_code VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL,
    brand_id INTEGER,
    FOREIGN KEY (brand_id) REFERENCES brand(UniqueID)
);

CREATE TABLE gun (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    g_num INTEGER NOT NULL,
    model VARCHAR(20) NOT NULL
);

CREATE TABLE spot (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    spot_number INTEGER NOT NULL,
    model_id INTEGER,
    FOREIGN KEY (model_id) REFERENCES model(UniqueID)
);




--------------------------------------


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
    gun_id INTEGER,
    FOREIGN KEY (worker_id) REFERENCES worker(UniqueID),
    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID)
);

CREATE TABLE defects (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_code VARCHAR(3) NOT NULL,
    root_cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    df_date DATE NOT NULL,
    worker_name INTEGER,
    spot_id INTEGER,
    gun_id INTEGER,
    FOREIGN KEY (worker_name) REFERENCES worker(UniqueID),
    FOREIGN KEY (spot_id) REFERENCES spot(UniqueID),
    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID)
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

CREATE TABLE gun_transformer_sssignment (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date DATE NOT NULL,
    end_date DATE,
	is_active BOOL NOT NULL,
    comments TEXT NOT NULL,
    gun_id INTEGER,
    transformer_id INTEGER,
    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID),
    FOREIGN KEY (transformer_id) REFERENCES trans(UniqueID)
);

CREATE TABLE welding_setup (
    UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
    comments TEXT NOT NULL,
	start_date DATE NOT NULL,
	end_date DATE,
	is_active BOOL NOT NULL,
    spot_id INTEGER,
    gun_id INTEGER,
    parameter_id INTEGER,
    FOREIGN KEY (spot_id) REFERENCES spot(UniqueID),
    FOREIGN KEY (gun_id) REFERENCES gun(UniqueID),
    FOREIGN KEY (parameter_id) REFERENCES parameters(UniqueID)
);
