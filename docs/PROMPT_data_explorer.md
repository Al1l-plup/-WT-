# Промт: вкладка "Обзор данных" + комментарии к уставкам

> Скопировать целиком и вставить в новый чат с Claude Code.  
> Все пути и схема БД актуальны на 2026-06-02. Перед началом прочти `PROGRESS.md` чтобы понять текущее состояние проекта.

---

## Контекст

**Проект:** WeldTeam MES — Flask-приложение для управления сваркой.  
**Корень:** `C:\Users\al.galimov\WeldTeam\BD\extracted_28_05\BD\web site\temp_server\`  
**БД:** `welding_shop.db` (SQLite, `row_factory = sqlite3.Row`)  
**Запуск:** `ЗАПУСК_Flask.bat` → Waitress на порту 5000  
**Документация состояния:** `PROGRESS.md` (читай в первую очередь)

**Иерархия данных в БД:**
```
brand (3 шт.) ──< station ──< (через transformer_station_assignment + gun_transformer_assignment) ──< gun
                                                                                                       │
model (6 шт.) ──< spot (16 680) ──< welding_setup (связь spot ↔ gun ↔ parameter) ─────────────────────┘
                                          │
                                          ├─ is_active (1/0) — активная уставка
                                          ├─ start_date / end_date — период действия
                                          ├─ comments — заметки (использовать для комментариев!)
                                          └─ auto_created — флаг авто-создания
maintenance ──> gun_id, parameter_id, worker_id, to_date, замеры (3×ток + 3×давление в Ньютонах)
defects     ──> spot_id, gun_id, problem_code, status, root_cause, solution, df_date
```

**Ключевые особенности схемы:**
- `gun.gun_type` (не `gun.model`!) — тип клещей (`AC`, `DC`, `Ручной ввод`)
- `gun.g_num` — пользовательский номер пистолета (G.001…G.999)
- `spot.model_id` — точки уникальны в пределах модели (НЕ бренда!)
- `parameters.pressure` — в Ньютонах (отображать ÷10 → daN)
- Все денормализованные связи `gun ↔ station` идут через `gun_transformer_assignment` и `transformer_station_assignment` (с `is_active=1`)

---

## Задача

### Часть 1 — Новая вкладка `/explorer` (Обзор данных)

Создать страницу с **переключателем сущностей** (3 режима в одной вкладке):

1. **🔫 Пистолет** — выбор по `g_num`, показывать всё что с ним связано
2. **🏭 Станция** — выбор по бренду → станции, показывать все пистолеты на ней + дефекты
3. **🎯 Точка** — выбор по модели → номеру точки, показывать всё что её касается

#### 1.1 Режим "Пистолет" (`gun-explorer`)

**Селектор:** поиск по `g_num` (как на /maintenance) ИЛИ каскад бренд → станция → пистолет.

**Карточки/секции на странице:**

| Секция | Источник данных | Поля |
|--------|----------------|------|
| **Паспорт пистолета** | `gun` + `gun_transformer_assignment` + `transformer_station_assignment` + `station` + `brand` | g_num, gun_type, текущий бренд, текущая станция, дата установки на станцию |
| **Активные уставки** | `welding_setup` + `parameters` (WHERE `welding_setup.gun_id=? AND is_active=1`) | mode, pressure (daN), turn_R, weld_1, heat_1, weld_2, heat_2, comments |
| **История уставок (архив)** | все `welding_setup` для этого `gun_id` ORDER BY `start_date DESC` | start_date, end_date, is_active, mode, основные параметры, **comments** (видеть комментарии при изменении!) |
| **История ТО** | `maintenance` WHERE `gun_id=?` ORDER BY `to_date DESC` | to_date, ср.ток, ср.давление (daN), worker, parameter_id (ссылка на конкретную уставку из архива) |
| **Точки которые варит пистолет** | `welding_setup` JOIN `spot` JOIN `model` WHERE `gun_id=? AND is_active=1` | spot_number, model_name + type, welding_type |
| **Дефекты** | `defects` WHERE `gun_id=?` ORDER BY `df_date DESC` | df_date, problem_code, status, spot_number, model, root_cause, solution |
| **Прогресс ТО по плану** | `maintenance_schedule` JOIN `maintenance_daily_task` для текущего месяца | месяц, plan_type, факт выполнения |

#### 1.2 Режим "Станция" (`station-explorer`)

**Селектор:** бренд → станция.

**Секции:**

| Секция | Источник |
|--------|----------|
| **Паспорт станции** | `station` + `brand` |
| **Все пистолеты на станции** | через `transformer_station_assignment` + `gun_transformer_assignment` WHERE `is_active=1` — список с `g_num`, `gun_type`, активной уставкой |
| **Сводка дефектов по станции** | `defects` JOIN `welding_setup` JOIN `spot` через активный welding_setup; группировка по коду дефекта |
| **История ТО на станции** | `maintenance` JOIN `gun` → станция (последние 20) |
| **Точки на станции** | `welding_setup` JOIN `spot` JOIN `model` WHERE станция совпадает — показать какие модели/точки производятся |

#### 1.3 Режим "Точка" (`spot-explorer`)

**Селектор:** модель → номер точки (с автодополнением). ИЛИ глобальный поиск точки по модели+номеру.

**Секции:**

| Секция | Источник |
|--------|----------|
| **Паспорт точки** | `spot` + `model` + `brand` (через model.brand_id) |
| **Активная связь** | `welding_setup` WHERE `spot_id=? AND is_active=1` — пистолет, уставка |
| **История связей** | все `welding_setup` для `spot_id` (когда какой пистолет варил эту точку, **с comments!**) |
| **Дефекты на точке** | `defects` WHERE `spot_id=?` ИЛИ `manual_spot_number=? AND manual_model_id=?` ORDER BY df_date DESC |
| **Косвенно — ТО пистолета** | через активный `gun_id` → последние ТО (информативно) |

---

### Часть 2 — Комментарии к изменению уставок

**Где менять:** на странице `/maintenance` есть кнопка "⚠ Обновить уставки техпроцесса" (`updateParamBtn`).  
**Что добавить:**

1. **В форму обновления уставок** — добавить поле `<textarea id="paramComment">` с лейблом "Комментарий к изменению (зачем меняем?)"
2. **Backend (`/api/parameters/update`)** — при обновлении параметра:
   - Текущий `welding_setup` помечать `is_active=0`, `end_date=DATE('now')`
   - Создать НОВУЮ запись в `parameters` с новыми значениями
   - Создать НОВУЮ запись в `welding_setup` с `is_active=1`, `start_date=DATE('now')`, `comments=<введённый комментарий>`, ссылающуюся на новые `parameters.UniqueID`
   - Если комментарий пустой — записывать `'(без комментария)'`
3. **Архив уставок (на той же странице /maintenance в "История выбранных клещей")** — таблица `t_params` должна показывать колонку `comments` для каждой записи архива

**Важно:** не редактировать существующую запись `parameters` напрямую — всегда создавать новую и менять `is_active` в `welding_setup`. Это даёт нормальный аудит-trail.

---

### Часть 3 — Редактирование с каскадом на /explorer

На вкладке /explorer добавить **режим редактирования** для администратора:

1. **Кнопка-замочек "✏ Редактировать"** в верху каждой основной карточки (паспорт пистолета/станции/точки).
2. **Что можно менять:**
   - **Пистолет:** `g_num`, `gun_type`, переназначить на другую станцию (через `gun_transformer_assignment` — деактивировать старую, создать новую). Также активные уставки (открыть форму с комментарием — как в Части 2).
   - **Станция:** `station_name`, `brand_id`
   - **Точка:** `spot_number`, `model_id`, `welding_type`, переназначить пистолет (как у пистолета, через `welding_setup`)
3. **Каскадное обновление UI:** после сохранения — перезагрузить ВСЕ связанные карточки на странице (не только редактируемую). Например, если поменяли `gun.g_num` → обновить:
   - Карточка-паспорт
   - Все списки "пистолетов" в селекторах
   - Возможно, кэш моделей в JS

4. **Защита от мусора:**
   - Не давать удалять пистолет/точку если есть `maintenance` или `defects` (показывать ошибку: "связано с N записями ТО и M дефектами")
   - Перед сохранением — preview изменений (что было / что станет)
   - Опционально: журнал изменений в новую таблицу `entity_change_log` (entity_type, entity_id, field, old_value, new_value, changed_at, worker_id)

---

## Технические требования

### Backend (`app.py`)

Добавить новые endpoints:

```python
# Регистрация страницы
@app.route('/explorer')
def explorer_page(): return render_template('explorer.html')

# Пистолет: всё про конкретный gun_id
@app.route('/api/explorer/gun/<int:gun_id>')
def explorer_gun(gun_id):
    # passport, active_setup, setup_history (с comments!),
    # maintenance_history, spots_welded, defects, schedule_progress
    ...

# Станция
@app.route('/api/explorer/station/<int:station_id>')
def explorer_station(station_id):
    # passport, guns_on_station, defects_summary, recent_maintenance, models_produced
    ...

# Точка
@app.route('/api/explorer/spot/<int:spot_id>')
def explorer_spot(spot_id):
    # passport, active_link, link_history (с comments!), defects, gun_recent_maintenance
    ...

# Поиск точки: model_id + spot_number → spot_id
@app.route('/api/spots/find')  # ?model_id=X&spot_number=Y → {UniqueID, ...}

# Список станций по бренду — уже есть /api/stations/<brand_id>
# Список точек по модели — нужен новый
@app.route('/api/spots/by_model/<int:model_id>')  # для автодополнения

# Редактирование
@app.route('/api/explorer/gun/<int:gun_id>', methods=['PUT'])
@app.route('/api/explorer/station/<int:station_id>', methods=['PUT'])
@app.route('/api/explorer/spot/<int:spot_id>', methods=['PUT'])
# Обновить /api/parameters/update — принимать поле comment и писать его в новый welding_setup.comments
```

### Frontend

**Файл:** `templates/explorer.html` (новый).

**Структура:**
- Nav как на других страницах (добавить ссылку `<a class="nav-link" href="/explorer">Обзор</a>` во ВСЕ templates)
- Сверху — переключатель режимов: 3 кнопки (`view-btn`) "Пистолет / Станция / Точка"
- Под ним — соответствующий селектор (с автокомплитом если возможно)
- Дальше — карточки данных (использовать существующие классы `.card`, `.tbl`, `.tbl-mobile`, `.badge`, `.stat`)
- Каждая карточка с заголовком (`.card-title`) и (если applicable) кнопкой-замочком "✏" в правом верхнем углу

**Стили:**
- Использовать существующие CSS-переменные и классы из `static/style.css`
- Адаптивность для мобильных — все таблицы должны иметь класс `tbl-mobile` и в JS-рендере `data-label="..."` для каждого `<td>` (см. примеры в `defects.html`, `maintenance.html`)

### Изменения в `maintenance.html`

1. В блоке `paramCard` (форма "Обновить уставки техпроцесса") добавить:
   ```html
   <div class="fgroup">
     <label class="lbl">Комментарий к изменению</label>
     <textarea id="paramComment" placeholder="Например: после ТО снизили ток..."></textarea>
   </div>
   ```
2. В `updateParamBtn` обработчике — добавить `param_comment: document.getElementById('paramComment').value`.
3. В `t_params` рендере (история уставок) добавить колонку `Комментарий` с `data-label="Комментарий"`.

### Изменения в `app.py` для `/api/parameters/update`

Сейчас этот endpoint редактирует существующую запись `parameters` напрямую. Переписать так:
1. Найти текущий активный `welding_setup` для `gun_id`
2. Деактивировать его: `UPDATE welding_setup SET is_active=0, end_date=DATE('now') WHERE UniqueID=?`
3. Создать новую запись `parameters` со всеми новыми значениями
4. Создать новую запись `welding_setup` (`is_active=1`, `start_date=DATE('now')`, `spot_id=<тот же>`, `gun_id=<тот же>`, `parameter_id=<новый>`, `comments=<комментарий пользователя>`, `auto_created=0`)
5. Вернуть `{status: 'success', new_parameter_id, new_setup_id}`

**Важно:** если у пистолета НЕСКОЛЬКО активных `welding_setup` (разные точки) — продумать как обрабатывать. Скорее всего нужно создавать новые `welding_setup` для каждой связки spot↔gun, либо обновлять параметр без пересоздания welding_setup, а только добавлять запись в новую таблицу `parameter_change_log` (gun_id, parameter_id, old_values_json, new_values_json, comment, changed_at, worker_id).

**Рекомендация:** для простоты и аудита сделать ТРЕТИЙ путь — создавать запись в новой таблице `parameter_change_log`:
```sql
CREATE TABLE IF NOT EXISTS parameter_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parameter_id INTEGER NOT NULL,
    gun_id INTEGER,
    changed_at TEXT DEFAULT (datetime('now')),
    worker_id INTEGER,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    comment TEXT
)
```
Тогда `parameters` обновляется на месте (как сейчас), но КАЖДОЕ изменение каждого поля логируется отдельно. В архиве уставок показывать данные из этой таблицы (с комментарием).

**Дать пользователю выбрать какой подход реализовать перед началом работы.**

---

## Чеклист реализации

- [ ] Добавить `parameter_change_log` ИЛИ продумать пересоздание `welding_setup` (спросить у пользователя)
- [ ] Прописать миграции в `_migrate()`
- [ ] Endpoint `/api/parameters/update` — записывать комментарий
- [ ] `maintenance.html` — поле комментария в форме + колонка в архиве
- [ ] Endpoint `/api/explorer/gun/<id>` со всеми связанными данными
- [ ] Endpoint `/api/explorer/station/<id>`
- [ ] Endpoint `/api/explorer/spot/<id>`
- [ ] Endpoint `/api/spots/by_model/<id>` + `/api/spots/find`
- [ ] PUT-endpoints для редактирования трёх сущностей
- [ ] Шаблон `templates/explorer.html`
- [ ] Ссылка `<a href="/explorer">Обзор</a>` во всех 5 шаблонах в nav
- [ ] Селектор режима + соответствующий поиск
- [ ] Карточки для каждого режима (паспорт + связанные данные)
- [ ] Все таблицы — `tbl-mobile` + `data-label` в JS-рендере
- [ ] Режим редактирования с предпросмотром
- [ ] Каскадное обновление UI после сохранения
- [ ] Защита от удаления/перепривязки если есть связанные записи
- [ ] Обновить `PROGRESS.md`: добавить новую вкладку, новые endpoints, новые колонки/таблицы

---

## Что не делать

- НЕ удалять существующие endpoints — только добавлять и расширять
- НЕ менять способ хранения давления (всё ещё в Ньютонах, конвертация только в UI)
- НЕ убирать lazy enrichment для дефектов
- НЕ менять `gun.gun_type` обратно на `model` — конфликт с таблицей `model`
- НЕ создавать MD-файлы документации без явной просьбы
- НЕ добавлять комментарии в код кроме случаев когда логика неочевидна

## Перед началом — задать вопрос пользователю

> Какой способ логирования изменений уставок предпочесть:  
> **A)** Полное пересоздание `welding_setup` (новая запись со всеми параметрами, старая помечается `is_active=0`) — даёт чистый аудит, но создаёт много записей  
> **B)** Отдельная таблица `parameter_change_log` (parameters обновляется на месте, лог изменений отдельно) — меньше дубликатов, гибче запросы  
> **C)** Гибрид — параметры обновляются на месте + комментарий пишется в существующий `welding_setup.comments` через append с датой
