# WeldTeam MES — карта данных (Data Map)

Карта схемы БД: таблицы, ключевые колонки, связи и инварианты. Источник истины —
`db/schema.sql` (человекочитаемая схема) и миграции Alembic (`migrations/versions/`).
Объёмы и состояние данных — в [PROGRESS.md §3](PROGRESS.md); здесь — структура.

## Где что лежит

- **БД:** `data/welding_shop.db` (SQLite) — в git **не хранится**, собирается
  `python scripts/init_db.py` из миграций + `db/seed.sql`.
- **Схема (SQL):** `db/schema.sql` · **справочники:** `db/seed.sql`
  (пересобрать из БД: `python scripts/dump_seed.py`).
- **ERD:** `db/*.drawio`.
- **Миграции схемы:** `migrations/versions/0001…0009` (см. [PROGRESS.md §4](PROGRESS.md)).

> Соглашение: у большинства таблиц PK — `UniqueID INTEGER` (историческое; у части
> новых таблиц — `id`). «Мягкое» удаление/архив — через `is_active` + `start_date/end_date`,
> строки не удаляются физически.

---

## 1. Справочники оборудования и изделий

### brand — бренды
`UniqueID` · `brand` — **Chery, GWM, Changan**.

### model — модели (и модификации)
`UniqueID` · `model_name` · `model_code` · `type` · `brand_id → brand`.
Один `model_code` может охватывать несколько модификаций (`type`), точка привязана к коду.

| model_name | model_code | type |
|-----------|-----------|------|
| Tiggo2 | A13T | single |
| Jolion | A01 | 2WD / 4WD |
| Tank 300 | P01G | ToD / NOT ToD |
| CS55 | CS55 | single |
| CS65 | CS65 | single |

### station — станции
`UniqueID` · `station_name` · `brand_id → brand`.

### trans — трансформаторы
`UniqueID` · `transID` · `type` (`AC`/`DC`).

### gun — сварочные клещи
`UniqueID` · `g_num` (пользовательский номер, вид `G.001`) · **`gun_type`** (`AC` / `DC` /
`Ручной ввод`). ⚠️ Именно `gun_type`, **не** `model` — не путать с таблицей `model`.

### spot — точки сварки
`UniqueID` · `spot_number` · `model_id → model` · `welding_type`.
Точки уникальны **в пределах модели** (не бренда).

### parameters — программы (уставки) сварки
`UniqueID` · `pressure` (в Ньютонах, в UI ÷10 → daN) · `squeeze_time` · `up_slope_time` ·
`weld_1/heat_1/cool_1` · `weld_2/heat_2` · `hold` · `turn_R` · `mode` (режим A/B/…).

### defect_code — справочник кодов дефектов
`UniqueID` · код + расшифровка. 16 кодов (CR, SN, LP, BN, SW, P, MI, BT, IE, MS, ME, EMU, MN, NA, EO, BE).

---

## 2. Связи оборудования (цепочка gun → станция)

Клещи не привязаны к станции напрямую — связь идёт через трансформатор, с историей
(`is_active`, `start_date`/`end_date`):

```
gun ──< gun_transformer_assignment >── trans ──< transformer_station_assignment >── station
```

### gun_transformer_assignment
`UniqueID` · `gun_id → gun` · `transformer_id → trans` · `start_date` · `end_date` ·
`is_active` · `comments`.

### transformer_station_assignment
`UniqueID` · `transformer_id → trans` · `station_id → station` · `start_date` · `end_date` ·
`is_active` · `comment`.

### welding_setup — связка точка ↔ клещи ↔ программа
`UniqueID` · `spot_id → spot` · `gun_id → gun` · `parameter_id → parameters` ·
`is_active` · `start_date` · `end_date` · `comments` · `auto_created`.
Активная связка — `is_active=1`. Перенос точки/смена программы = деактивировать старую
строку (`is_active=0`, `end_date`) и создать новую — так копится аудит-trail.

---

## 3. Факты (ТО и дефекты) — с исторической заморозкой

Факты **неизменяемы**: при записи контекст «замораживается» в `snap_*`-колонки, чтобы
позднейшие правки справочников не «переписывали» прошлое (см. `app/snapshots.py`).

### maintenance — записи ТО клеща
Замеры: `first/second/third_weld` (ток) · `first/second/third_pressure` (Ньютоны) ·
`to_date` · `worker_id → worker` · `gun_id → gun` · `parameter_id → parameters`.
Заморозка: `snap_g_num`, `snap_gun_type`, `snap_station_id/name`, `snap_brand_id/brand`,
`snap_worker_surname`, `snap_mode`, `snap_pressure`, `snap_heat_1/2`, `snap_turn_R`.

### defects — дефекты
`problem_code → defect_code` · `root_cause` · `solution` · `description` · `df_date` ·
`status` (`registered` → `in_work` → `closed`).
Люди: `worker_register_id`, `assigned_worker_id`, `worker_solve_id` (все → `worker`).
Привязка: `spot_id → spot`, `gun_id → gun`; ручной ввод без точки в БД —
`manual_spot_number`, `manual_model_id`, `manual_brand_id`; авто-созданная точка —
`auto_created_spot_id`. Заморозка: `snap_spot_number`, `snap_model_id/name/type`,
`snap_brand_id/brand`, `snap_station_id/name`, `snap_g_num`, `snap_gun_type`.

---

## 4. Планирование ТО

### maintenance_schedule — годовой план
`id` · `gun_id → gun` · `brand_id → brand` · `month_number` (1–12) · `plan_type`.

### maintenance_daily_task — ежедневные задачи
`id` · `gun_id → gun` · `task_date` · `status` · `assigned_worker_id` ·
`created_by_worker_id` · `completed_maintenance_id → maintenance` · `notes` · `created_at`.

---

## 5. Weld Balance (инженерный слой, источник правды привязок)

Импортируется из `.xlsm` (`scripts/import_weld_balance.py`), нормализован. Таблицы
созданы миграцией `0003`; `model_code` вместо `model_id` — миграция `0007`.

### weld_point — строки Weld Balance (зеркало листа «Welds»)
`id` · `model_code` · `model_variant` · `source_file` · `sh_num` · `zone` · `wb_station` ·
`process_no` · `operation_name` · `stage_no` · `welding_type` · `side` · `joint_type` ·
`gun_type` · `gun_mntc` · `gun_id → gun` · `station_id → station` · `spot_number` ·
`spot_id → spot` · `std_thickness` · `coating` · `nugget` · `variant_1…4` ·
`coord_x/y/z` · `raw_extra` (служебные колонки листа) · `row_order` (порядок как в Excel).

### weld_point_part — детали слоёв точки
Нормализованные слои (`weld_point_id`, `layer_no`, материал/толщина). Индекс
`(weld_point_id, layer_no)` — миграция `0008`.

### wb_material — справочник материалов · ### wb_tab — вкладки WB
`wb_tab`: `id` · `title` · `match_token` · `manual_src` · `position` (динамические вкладки
по моделям: A01, P01, A13T, CS55).

---

## 6. Журнал версий и точки восстановления (аудит)

Каждая правка в редакторе БД пишется триггерами SQLite (миграция `0004`; триггеры
создаёт приложение из текущей схемы — `app/audit.py`).

### change_log
`id` · `ts` (datetime по умолчанию) · `table_name` · `row_pk` · `op` (INSERT/UPDATE/DELETE) ·
`before_json` · `after_json` · `author` · `batch_id` (пакет правок) · `is_revert` · `note`.
Автор проставляется из сессии для **всех** вкладок (глобальный хук в `app/__init__.py`).

### restore_point
`id` · `name` · `created_at` · `last_change_id` · `author` · `note` — именованный слепок
момента, к которому можно откатить всю базу.

---

## 7. Пользователи и доступ

### worker — сотрудники и учётные записи
`UniqueID` · `surname` · `name` · `father_name` · `position` · `email` · `password`
(хеш `werkzeug`, **не** открытый) · `start_date` · `end_date` · `is_active` ·
`department` (WeldTeam / ИТО / ОТК / Производство — определяет права, см. `app/permissions.py`) ·
`login` (рабочая почта, уникальна) · `role` (`user`/`admin`) · `must_change_password`
(флаг обязательной смены после сброса).

Роль `admin` поднимается автоматически при входе по `ADMIN_EMAIL`. Пароли не показываются:
админ их **сбрасывает** — система выдаёт одноразовый временный (миграции `0006`, `0009`).

---

## Карта связей

```
brand ──< station ──< transformer_station_assignment >── trans ──< gun_transformer_assignment >── gun
brand ──< model ──< spot ──< welding_setup >── gun
                                   │
                                   └── welding_setup >── parameters
worker ──< maintenance >── gun (>── parameters)
worker ──< defects >── spot / gun            (manual_* — дефект без точки в БД)
brand ──< maintenance_schedule >── gun
gun   ──< maintenance_daily_task
model_code ──< weld_point ──< weld_point_part        (gun_id/spot_id/station_id — best-effort связи)
change_log / restore_point — аудит правок редактора (по всем таблицам)
```

## Инварианты (кратко)

- **`gun.gun_type`, не `gun.model`** — тип клещей; `model` — отдельная таблица изделий.
- Точка уникальна **в пределах модели** (`spot.model_id`), не бренда.
- `parameters.pressure` — в **Ньютонах**; в daN конвертируется только в UI (÷10).
- Связь `gun ↔ станция` — всегда через активные (`is_active=1`) назначения трансформатора.
- Факты (ТО/дефекты) читаются из `snap_*` с `COALESCE`-fallback — история не «плывёт».
- Перенос/смена связки — новая строка + деактивация старой, а не правка на месте.
