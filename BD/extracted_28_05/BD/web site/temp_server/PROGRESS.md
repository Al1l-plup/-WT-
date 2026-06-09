# WeldTeam MES — Карточка прогресса проекта

> **Обновлено:** 2026-06-02  
> **Версия:** Flask + SQLite (порт 5000)  
> **Путь:** `C:\Users\al.galimov\WeldTeam\BD\extracted_28_05\BD\web site\temp_server\`

---

## Стек технологий

| Компонент | Решение |
|-----------|---------|
| Backend | Python · Flask + Waitress (WSGI) |
| База данных | SQLite — `welding_shop.db` |
| Frontend | HTML + Vanilla JS + CSS (без фреймворков) |
| Графики | Chart.js (CDN) |
| Запуск | `ЗАПУСК_Flask.bat` → `wsgi.py` |
| Python | `C:\...\pythoncore-3.14-64\python.exe` |

---

## Состояние базы данных (на 2026-06-02)

| Таблица | Записей | Примечание |
|---------|---------|------------|
| `gun` | 569 | Сварочные клещи |
| `spot` | 16 680 | Точки сварки (привязаны к модели) |
| `model` | 6 | Tiggo2, Jolion 2WD, 4WD, Tank 300 NOT ToD, Tank 300 ToD, CS55 |
| `maintenance_schedule` | 2 606 | Годовой план ТО (3 бренда × 12 мес.) |
| `maintenance` | 7 | Выполненных ТО (4 в этом месяце) |
| `maintenance_daily_task` | 15 | Задач на сегодня |
| `defect_code` | 16 | CR, SN, LP, BN, SW, P, MI, BT, IE, MS, ME, EMU, MN, NA, EO, BE |
| `defects` | 13 | 3 открытых / 10 закрытых |
| `worker` | 6 | Активных сотрудников |

---

## Страницы приложения

| Маршрут | Страница | Назначение |
|---------|----------|------------|
| `/` | Главная | Счётчики: ТО, открытые/все дефекты |
| `/maintenance` | ТО | Планирование, ввод замеров, аналитика |
| `/defects` | Дефекты | Регистрация, доска, закрытие |
| `/analytics` | Аналитика | График по кодам, фильтры, таблица по станциям |
| `/workers` | Сотрудники | CRUD сотрудников по отделам |

---

## Выполненные задачи

### ✅ Миграция данных
- Перенос из старой React-БД (`WeldTeam_DataBase.db`) в `welding_shop.db`
- Импорт годового плана ТО из Excel (`import_schedule.py`) — 2606 записей
- Бэкфилл статусов дефектов: `registered` / `in_work` / `closed`

### ✅ Тёмная/светлая тема
- CSS-переменные + `localStorage` (`wt-theme`)
- Работает на всех 5 страницах

### ✅ Вкладка ТО (`/maintenance`)
- Аналитика по умолчанию + переход в режим ввода замеров
- Каскадный выбор: бренд → станция → пистолет
- Ручной поиск пистолета по G.NUM (с созданием если нет в БД)
- Валидация: ток ±100 А, давление ±500 N (±50 daN) от уставок
- Давление: хранится в **N**, вводится/отображается в **daN** (÷10)
- История выбранных клещей (ТО + дефекты + архив уставок)
- Обновление уставок техпроцесса прямо на странице
- **Ежедневный план ТО:** доска задач, назначение, взять в работу, завершить
- Прогресс выполнения плана по брендам (с выбором месяца)
- При записи ТО из задачи — автоматически помечает задачу `done`

### ✅ Вкладка Дефекты (`/defects`)
- Регистрация: модель авто → номер точки → код дефекта (из БД)
- **Lazy enrichment:** если точка не найдена в БД — дефект регистрируется с `spot_id=NULL` + `manual_spot_number` + `manual_model_id`; при закрытии можно уточнить модель и номер пистолета → точка и уставка создаются в БД автоматически
- **Workflow:** `registered` → **Закрыть** (первопричина + контрмера + сотрудник) → `closed` *(промежуточный шаг "Взять в работу" убран)*
- Мануальный ввод по G.NUM (без поиска точки в БД)
- Доска открытых дефектов + история закрытых (последние 50)
- Удаление дефекта с откатом автоматически созданных записей в БД
- Коды дефектов — из таблицы `defect_code` (не хардкод в Python)

### ✅ Вкладка Аналитика (`/analytics`)
- Фильтры: период (месяц / 3м / 6м / год / свой) + модель авто + станция
- Диаграмма-пончик (Chart.js) по кодам дефектов
- Таблица разбивки по станциям

### ✅ Вкладка Сотрудники (`/workers`)
- Добавление / редактирование / деактивация
- Фильтр по отделам: ОТК / WeldTeam / Производство

### ✅ Архитектурные исправления
| Проблема | Решение |
|----------|---------|
| Точки уникальны по **модели**, не по бренду | `spot.model_id` вместо `brand_id` везде |
| `gun.model` конфликтовал с таблицей `model` | Переименовано в `gun.gun_type` через миграцию |
| `DEFECT_DICTIONARY` хардкодом в Python | Перенесено в таблицу `defect_code` |
| `manual_brand_id` — мёртвая колонка | Заменено на `manual_model_id` |
| Magic string `comments='auto_defect_enrich'` | Заменено флагом `welding_setup.auto_created=1` |
| `search_spot` INNER JOIN — обогащённые точки не видны | Исправлено на LEFT JOIN |
| `solution='В процессе устранения'` — placeholder | Заменено пустой строкой |
| Выпадающий список: два одинаковых "Jolion" | `display_name = model_name + type` (API `/api/models`) |
| ТО-план исчезал после записи ТО | `loadDailyTasks` теперь использует дату из `planTaskDate` |

### ✅ Мобильная версия
- Навигация: горизонтальный скролл ссылок на телефоне
- Таблицы (дефекты, ТО, аналитика, сотрудники): карточки на ≤640px с подписями
- Кнопки: минимум 42px высота (Apple / Material Design)
- Инпуты: `font-size: 16px` — блокирует iOS Safari auto-zoom
- Форма регистрации дефекта: одна колонка на телефоне
- Протестировано: iPhone (Safari), Android (Chrome)

---

## API-эндпоинты

### Дефекты
| Метод | URL | Действие |
|-------|-----|----------|
| GET | `/api/defects/all` | Все открытые + закрытые + сотрудники |
| POST | `/api/defects/register` | Регистрация по модели + точке |
| POST | `/api/defects/register_manual` | Регистрация по G.NUM |
| POST | `/api/defects/close` | Закрыть (опц. обогащение + причина + контрмера) |
| DELETE | `/api/defects/<id>` | Удалить (с откатом auto_created) |

### Техобслуживание
| Метод | URL | Действие |
|-------|-----|----------|
| POST | `/api/maintenance` | Сохранить замеры ТО (опц. task_id) |
| GET | `/api/maintenance/analytics` | Статистика |
| GET | `/api/maintenance/schedule` | Месячный план |
| GET | `/api/maintenance/progress` | Прогресс выполнения |
| GET/POST | `/api/maintenance/daily` | Задачи на дату |
| POST | `/api/maintenance/daily/<id>/take` | Взять задачу |
| DELETE | `/api/maintenance/daily/<id>` | Отменить задачу |

### Справочники
| URL | Возвращает |
|-----|-----------|
| `/api/models` | Модели авто с `display_name` и `brand_id` |
| `/api/defect_codes` | Коды дефектов из БД |
| `/api/brands` | Бренды (производственные линии) |
| `/api/stations/<brand_id>` | Станции бренда |
| `/api/guns/<station_id>` | Пистолеты станции |
| `/api/parameters/<gun_id>` | Уставки + сотрудники |
| `/api/workers` | Все сотрудники |
| `/api/gun/<id>/history` | История клещей |

---

## Схема БД — ключевые связи

```
brand (1) ──< station (many) ──< gun (many)
                                    │
model (1) ──< spot (many) ──────< welding_setup (link spot↔gun)
                                    │
defects ──> spot_id (nullable)      │
        ──> gun_id                  │
        ──> manual_model_id         │ (если точка не в БД)
        ──> manual_spot_number      │

maintenance ──> gun_id
            ──> parameter_id (из welding_setup)
            ──> worker_id

maintenance_schedule ──> gun_id, brand_id, month_number
maintenance_daily_task ──> gun_id, completed_maintenance_id
```

### Колонки добавленные через `_migrate()` (не были в оригинале)
| Таблица | Колонка | Зачем |
|---------|---------|-------|
| `defects` | `status` | Workflow: registered / in_work / closed |
| `defects` | `assigned_worker_id` | Кто расследует |
| `defects` | `manual_spot_number` | Номер точки при lazy enrichment |
| `defects` | `manual_model_id` | Модель при lazy enrichment |
| `defects` | `auto_created_spot_id` | Для отката при удалении дефекта |
| `defects` | `manual_brand_id` | ⚠ Устаревшая (заменена на manual_model_id) |
| `welding_setup` | `auto_created` | Флаг: запись создана автоматически при обогащении |
| `gun` | `gun_type` | Тип клещей (переименовано из `model`) |
| `worker` | `department` | ОТК / WeldTeam / Производство |
| — | `defect_code` (таблица) | Словарь кодов дефектов |
| — | `maintenance_schedule` (таблица) | Годовой план ТО |
| — | `maintenance_daily_task` (таблица) | Оперативные задачи на день |

---

## Известные ограничения / не сделано

| # | Описание | Приоритет |
|---|----------|-----------|
| 1 | 23 пистолета из GWM Excel не найдены в таблице `gun` | Средний |
| 2 | Нет кнопки удаления записи ТО (DELETE /api/maintenance/<id> есть, UI нет) | Низкий |
| 3 | `manual_brand_id` — мёртвая колонка (нельзя удалить без пересоздания таблицы в SQLite) | Технический долг |
| 4 | Нет экспорта в Excel/PDF | Будущее |
| 5 | Нет авторизации/ролей | Будущее |

---

## Запуск

```bat
ЗАПУСК_Flask.bat
```

Доступно на: `http://localhost:5000` и `http://[IP]:5000` (локальная сеть)
