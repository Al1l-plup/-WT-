# WeldTeam MES

Веб-приложение для цеха точечной сварки: учёт технического обслуживания (ТО)
сварочных пистолетов, доска дефектов с рабочим процессом, аналитика и обзор
данных по пистолетам/станциям/точкам.

Раньше рабочая версия («temp server») лежала глубоко внутри старой монорепы и была
одним файлом на 1500 строк. Этот репозиторий — та же логика, приведённая к
нормальной структуре: приложение-фабрика Flask, маршруты разбиты на blueprints,
конфигурация вынесена в `.env`, зависимости зафиксированы, добавлены тесты.

## Стек

- **Python 3.11+**
- **Flask 3** — веб-фреймворк, шаблоны Jinja2
- **Waitress** — продакшн WSGI-сервер (кроссплатформенный, работает на Windows)
- **SQLite** — БД (файл `data/welding_shop.db`, в git не хранится — собирается из миграций + seed)
- **Alembic** — версионируемые миграции схемы
- **python-dotenv** — конфигурация через `.env`
- Фронтенд — серверные шаблоны + чистый CSS/JS (без сборки)

## Возможности

- **ТО** — карточки обслуживания пистолетов, валидация тока/давления, планирование
  на месяц, ежедневные задачи, прогресс выполнения плана.
- **Дефекты** — регистрация (по точке или вручную), взятие в работу, закрытие с
  контрмерой, «обогащение» (создание точки/уставки), 3-статусный workflow
  (`registered` → `in_work` → `closed`).
- **Аналитика** — дефекты по кодам и станциям за период, общая статистика.
- **Explorer** — карточки пистолетов, станций и точек с историей.
- **Сотрудники** — справочник, добавление/деактивация.

## Структура проекта

```
app/                    # пакет приложения
├── __init__.py         # create_app() — фабрика приложения
├── config.py           # конфигурация (профили dev/prod/testing, чтение .env)
├── db.py               # соединение с SQLite (через flask.g)
├── migrations.py       # запуск Alembic-миграций (upgrade head) при старте
├── errors.py           # единая обработка ошибок API (без утечки деталей клиенту)
├── snapshots.py        # заморозка контекста фактов (историческая целостность)
├── constants.py        # справочник кодов дефектов
├── blueprints/         # маршруты по разделам (pages, catalog, maintenance, …)
├── templates/          # Jinja2-шаблоны
└── static/             # CSS/JS
migrations/             # Alembic: env.py + versions/ (0001 baseline, 0002 drop-temp, 0003 weld_balance)
alembic.ini             # конфигурация Alembic
db/                     # schema.sql, seed.sql (справочники), ERD (.drawio), SQL-скрипты
data/welding_shop.db    # БД (SQLite) — НЕ в git, собирается scripts/init_db.py
scripts/                # init_db, dump_seed, reset_facts, import_weld_balance, merge …
docs/                   # документация (BEST_PRACTICES.md, презентации)
tests/                  # pytest: smoke + инвариантные (self-contained)
.github/workflows/      # CI (ruff + pytest)
wsgi.py / run.py        # запуск: продакшн (Waitress) / разработка (Flask)
requirements*.txt       # зависимости (prod / dev)
ЗАПУСК.bat              # запуск в один клик под Windows
```

## Установка

Нужен установленный Python 3.11+.

```bash
# 1. Клонировать и перейти в проект
git clone https://github.com/Al1l-plup/-WT-.git
cd -WT-

# 2. Создать виртуальное окружение
python -m venv .venv

# 3. Активировать
#   Windows (PowerShell):
.venv\Scripts\Activate.ps1
#   Windows (cmd):
#   .venv\Scripts\activate.bat
#   Linux/macOS:
#   source .venv/bin/activate

# 4. Установить зависимости
pip install -r requirements.txt

# 5. Создать .env из примера (необязательно, есть значения по умолчанию)
copy .env.example .env      # Windows
# cp .env.example .env      # Linux/macOS

# 6. Собрать базу данных (схема из миграций + справочники из db/seed.sql)
python scripts/init_db.py
```

> База `data/welding_shop.db` в репозитории не хранится — её собирает `scripts/init_db.py`
> из миграций Alembic и `db/seed.sql`. Факты (ТО, дефекты) при этом пустые.

## Запуск

**Разработка** (авто-перезагрузка, отладка):

```bash
python run.py
```

**Продакшн** (Waitress, устойчив к нагрузке, доступен по локальной сети):

```bash
python wsgi.py
```

Под Windows можно просто запустить `ЗАПУСК.bat` (использует `.venv`, если создано).

После старта откройте <http://127.0.0.1:5000>. Для входа с телефона/планшета в
той же сети используйте адрес вида `http://<IP-компьютера>:5000` (Waitress печатает
его при запуске).

## Тесты

```bash
pip install -r requirements-dev.txt
pytest
```

Тесты **самодостаточны**: собирают эталонную БД из миграций + `db/seed.sql` во временной
папке, поэтому не зависят от боевой БД и воспроизводимы в CI.

## Основные эндпоинты

| Раздел | Метод | Путь |
|--------|-------|------|
| Страницы | GET | `/`, `/maintenance`, `/defects`, `/analytics`, `/workers`, `/explorer` |
| Справочники | GET | `/api/brands`, `/api/stations`, `/api/guns/<station_id>`, `/api/parameters/<gun_id>`, `/api/models`, `/api/defect_codes` |
| ТО | POST/GET | `/api/maintenance`, `/api/maintenance/schedule`, `/api/maintenance/daily`, `/api/maintenance/progress` |
| Дефекты | POST/GET | `/api/defects/register`, `/api/defects/all`, `/api/defects/take`, `/api/defects/close`, `/api/defects/enrich` |
| Аналитика | GET | `/api/analytics/defects`, `/api/stats` |
| Сотрудники | GET/POST/PUT/DELETE | `/api/workers` |
| Explorer | GET/PUT | `/api/explorer/gun/<id>`, `/api/explorer/station/<id>`, `/api/explorer/spot/<id>` |

## База данных и миграции

- Файл `data/welding_shop.db` (SQLite) **в git не хранится** — собирается `scripts/init_db.py`
  из миграций Alembic + `db/seed.sql`. Так репозиторий остаётся лёгким, а данные воспроизводимы.
- **Схема** ведётся миграциями Alembic (`migrations/`). При старте приложение автоматически
  приводит БД к последней ревизии (`app/migrations.py::run_migrations` → `alembic upgrade head`).
  Существующая «унаследованная» БД без Alembic автоматически «штампуется» baseline-ревизией.
- **Справочные данные** — в `db/seed.sql` (генерируется `scripts/dump_seed.py` из БД).
  Человекочитаемая схема — `db/schema.sql`; ERD и SQL-скрипты — в `db/`.

### Работа с миграциями

```bash
# создать новую ревизию (после правки схемы), затем описать шаги в файле версии
alembic revision -m "описание"

# применить/откатить
alembic upgrade head
alembic downgrade -1

# пересобрать seed из текущей БД (после изменения справочных данных)
python scripts/dump_seed.py
```

### Импорт Weld Balance (полные инженерные данные)

Полный weld balance (5 файлов `.xlsm` по моделям) заносится в нормализованный слой
`weld_point` / `weld_point_part` / `wb_material` (существующие таблицы не изменяются):

```bash
# отчёт без записи (объёмы, % связок gun/spot, варианты)
python scripts/import_weld_balance.py "путь/к/Weld balance 3 brands"
# запись в БД (идемпотентно по source_file); best-effort связи с gun/spot/station
python scripts/import_weld_balance.py "путь/к/Weld balance 3 brands" --apply
```

Данные weld balance в git не коммитятся (загружаются импортёром из Excel). Сами таблицы
создаются миграцией `0003`. Модель **CS65** (Changan) создаётся импортёром и есть в seed.

## Как участвовать в разработке

См. [CONTRIBUTING.md](CONTRIBUTING.md) — рабочий процесс git, ветки, коммиты,
и [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md) — правила разработки и тестирования.
