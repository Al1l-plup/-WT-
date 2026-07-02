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
- **SQLite** — БД (файл `data/welding_shop.db`)
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
├── migrations.py       # идемпотентные миграции схемы (запуск при старте)
├── constants.py        # справочник кодов дефектов
├── blueprints/         # маршруты по разделам
│   ├── pages.py        # HTML-страницы
│   ├── catalog.py      # бренды/станции/пистолеты/параметры/модели/точки
│   ├── maintenance.py  # ТО и планирование
│   ├── defects.py      # доска дефектов
│   ├── analytics.py    # аналитика и статистика
│   ├── workers.py      # сотрудники
│   └── explorer.py     # обзор данных
├── templates/          # Jinja2-шаблоны
└── static/             # CSS/JS
data/welding_shop.db    # база данных (SQLite)
db/                     # SQL-скрипты создания/наполнения схемы, ERD (.drawio)
scripts/                # обслуживание БД (merge.py, import_schedule.py, ...)
docs/                   # документация, презентации
tests/                  # smoke-тесты (pytest)
wsgi.py                 # запуск в продакшн (Waitress)
run.py                  # запуск для разработки (встроенный сервер Flask)
requirements.txt        # зависимости
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
```

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

Тесты работают с копией БД во временной папке — боевая база не изменяется.

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

## База данных

- Файл: `data/welding_shop.db` (SQLite), коммитится в репозиторий.
- Схема приводится к актуальной автоматически при старте (`app/migrations.py`).
- SQL создания/наполнения и ERD-схема — в папке `db/`.

## Как участвовать в разработке

См. [CONTRIBUTING.md](CONTRIBUTING.md) — рабочий процесс git, ветки, коммиты.
