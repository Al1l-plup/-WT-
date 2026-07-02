# WeldTeam Database — Data Map

## Database
- **File:** `BD/WeldTeam_DataBase.db` (SQLite, ~15MB)
- **Schema SQL:** `BD/create DB.sql`
- **Seed data:** `BD/Insert Data.sql`, `BD/Insert Data Chery.sql`
- **Diagram:** `BD/Database WT.drawio`

---

## Tables & Schema

### brand
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| brand | VARCHAR(10) | NOT NULL |

**Data:** Chery, GWM, Changan

---

### trans (Transformers)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| transID | VARCHAR(20) | NOT NULL |
| type | VARCHAR(2) | CHECK IN('AC','DC') NOT NULL |

---

### worker (Workers/Employees)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| surname | VARCHAR(20) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| father_name | VARCHAR(255) | - |
| position | VARCHAR(30) | NOT NULL |
| email | VARCHAR(50) | - |
| password | VARCHAR(10) | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | - |
| is_active | BOOL | - |

**Positions:** начальник участка, старший техник-технолог, техник-технолог

---

### parameters (Welding Parameters)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| pressure | INTEGER | NOT NULL |
| squeeze_time | INTEGER | NOT NULL |
| up_slope_time | INTEGER | NOT NULL |
| weld_1 | INTEGER | NOT NULL |
| heat_1 | INTEGER | NOT NULL |
| cool_1 | INTEGER | NOT NULL |
| weld_2 | INTEGER | NOT NULL |
| heat_2 | INTEGER | NOT NULL |
| hold | INTEGER | NOT NULL |
| turn_R | DECIMAL(3,1) | NOT NULL |
| mode | VARCHAR | - (режим: A, B, ...) |

**Data:** 547 записей

---

### station (Welding Stations)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| station_name | VARCHAR(20) | NOT NULL |
| brand_id | INTEGER | FK → brand.UniqueID |

**Data:** 47 Chery stations, 100+ GWM stations, 40+ Changan stations

---

### model (Car Models)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| model_name | VARCHAR(20) | NOT NULL |
| model_code | VARCHAR(10) | NOT NULL |
| type | VARCHAR(10) | NOT NULL |
| brand_id | INTEGER | FK → brand.UniqueID |

**Data:** Tiggo2 (Chery), Jolion 2WD/4WD (GWM), Tank 300 (GWM), CS55 (Changan)

---

### gun (Welding Guns)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| g_num | INTEGER | NOT NULL |
| model | VARCHAR(20) | NOT NULL |

---

### spot (Welding Spots)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| spot_number | INTEGER | NOT NULL |
| model_id | INTEGER | FK → model.UniqueID |

---

### maintenance (Gun Maintenance / ТО)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueId | INTEGER | PK AUTOINCREMENT |
| first_weld | INTEGER | NOT NULL |
| second_weld | INTEGER | NOT NULL |
| third_weld | INTEGER | NOT NULL |
| first_pressure | INTEGER | NOT NULL |
| second_pressure | INTEGER | NOT NULL |
| third_pressure | INTEGER | NOT NULL |
| to_date | DATE | NOT NULL |
| worker_id | INTEGER | FK → worker.UniqueID |
| gun_id | INTEGER | FK → gun.UniqueID |

---

### defects (Defects / Дефекты)
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| problem_code | VARCHAR(3) | NOT NULL |
| root_cause | TEXT | NOT NULL |
| solution | TEXT | NOT NULL |
| df_date | DATE | NOT NULL |
| worker_name | INTEGER | FK → worker.UniqueID |
| spot_id | INTEGER | FK → spot.UniqueID |
| gun_id | INTEGER | FK → gun.UniqueID |

---

### transformer_station_assignment
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| start_date | DATE | NOT NULL |
| end_date | DATE | - |
| is_active | BOOL | NOT NULL |
| comment | TEXT | - |
| transformer_id | INTEGER | FK → trans.UniqueID |
| station_id | INTEGER | FK → station.UniqueID |

---

### gun_transformer_sssignment *(typo in original — 3 s's)*
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| start_date | DATE | NOT NULL |
| end_date | DATE | - |
| is_active | BOOL | NOT NULL |
| comments | TEXT | NOT NULL |
| gun_id | INTEGER | FK → gun.UniqueID |
| transformer_id | INTEGER | FK → trans.UniqueID |

---

### welding_setup
| Column | Type | Constraints |
|--------|------|-------------|
| UniqueID | INTEGER | PK AUTOINCREMENT |
| comments | TEXT | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | - |
| is_active | BOOL | NOT NULL |
| spot_id | INTEGER | FK → spot.UniqueID |
| gun_id | INTEGER | FK → gun.UniqueID |
| parameter_id | INTEGER | FK → parameters.UniqueID |

---

## Entity Relationships

```
brand ──< station
brand ──< model ──< spot ──< welding_setup >── gun
                              welding_setup >── parameters
worker ──< maintenance >── gun
worker ──< defects >── spot
               defects >── gun
trans ──< transformer_station_assignment >── station
trans ──< gun_transformer_sssignment >── gun
```

---

## Business Scenarios (from scenario.docx)

### Spot (Точка)
- Create new spot on a gun
- Transfer spot from one gun to another
- Assign new parameter to spot (set is_active=false on old welding_setup row, create new)

### Parameters (Параметры)
- Create welding parameters

### Defect (Дефект)
- Create defect record
- Delete defect record

### Maintenance / ТО
- Create gun maintenance record
- Delete gun maintenance record

### Transformer (Трансформатор)
- Create transformer
- Update: end_date, is_active, comment

### Worker (Работник)
- Create worker
- Update: end_date

---

## Key Notes
- `is_active` pattern used for soft-deactivation across: worker, transformer_station_assignment, gun_transformer_assignment, welding_setup
- Transferring a spot = deactivate old welding_setup + create new one with different gun_id
- Database is SQLite (file-based, no server needed)
- **welding_setup**: 13 796 записей — точная связь spot→gun→parameters заполнена (14.05.2026)
- **parameters**: 547 записей с полем mode (A/B/...)
- Таблица в БД: gun_transformer_assignment (2 буквы s, не 3)
