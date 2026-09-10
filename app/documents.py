"""Декларативная конфигурация «документов» редактора БД.

Вместо сырых таблиц пользователь видит понятные документы цеха с русскими заголовками.
Каждый документ — это SQL-представление (base = FROM + JOIN [+ where]) с колонками, у каждой:
  label   — заголовок для человека
  field   — ключ в строке / имя для записи
  expr    — SQL-выражение для SELECT (алиасится AS field)
  edit    — можно ли редактировать
  table/col — куда писать (для редактируемых колонок; связанное редактирование)
  fk      — имя связанной таблицы (для выпадающего списка)
`pks` — выражения первичных ключей участвующих таблиц (алиасятся как __pk_<table>).
`where` — доп. постоянное условие (напр. фильтр Weld Balance по модели/файлу).
Вкладки Weld Balance хранятся в таблице wb_tab (создаются кнопкой «+ вкладка») —
документы собираются функцией get_documents(db).
"""
import re

# ── колонки Weld Balance = ТОЧНОЕ зеркало листа «Welds» Excel (колонка-в-колонку,
#    col0..col52), чтобы Ctrl+V из Excel вставлялся 1:1 без сдвига столбцов. Детали
#    слоёв (Excel col11-25) пишутся в под-таблицу weld_point_part через setter
#    'wb_part'; служебные колонки Excel (STUCK, метки «!», Laser, доп. проверки)
#    хранятся в raw_extra (JSON) и редактируются через setter 'raw_extra'. Внутренние
#    поля (Клещи id, Точка id, Модель-код, порядок) заблокированы и вынесены В КОНЕЦ,
#    чтобы не занимать позиции вставки. Порядок первых 53 колонок менять нельзя —
#    он привязан к структуре Excel (см. scripts/import_weld_balance.py::IDX).


def _wp(label, field, **extra):
    """Прямое поле weld_point (редактируемое)."""
    return {'label': label, 'field': field, 'expr': f'wp.{field}', 'edit': True,
            'table': 'weld_point', 'col': field, **extra}


def _raw(label, field, key):
    """Служебная колонка Excel — хранится в weld_point.raw_extra по ключу key."""
    return {'label': label, 'field': field, 'edit': True, 'setter': 'raw_extra', 'raw_key': key,
            'expr': f"json_extract(wp.raw_extra,'$.{key}')"}


# Деталь слоя: пишется в weld_point_part (layer_no=слой). Материал — имя из wb_material.
_PART_FIELDS = [('НАИМЕНОВАНИЕ', 'name', 'part_name'), ('НОМЕР ДЕТАЛИ', 'num', 'part_number'),
                ('МАТЕРИАЛ', 'mat', 'material'), ('ПОКРЫТИЕ', 'coat', 'coating'),
                ('Т-НА', 'thk', 'thickness')]


def _part_cols(layer):
    cols = []
    for label, short, part_field in _PART_FIELDS:
        expr = (f'm{layer}.name' if part_field == 'material' else f'p{layer}.{part_field}')
        cols.append({'label': f'{label} {layer}', 'field': f'part{layer}_{short}', 'edit': True,
                     'setter': 'wb_part', 'part_layer': layer, 'part_field': part_field, 'expr': expr})
    return cols


_WB_COLUMNS = [
    _wp('Лист №', 'sh_num'),                    # Excel col0
    _wp('Зона', 'zone'),                        # col1
    _wp('Станция', 'wb_station'),               # col2
    _wp('№ процесса', 'process_no'),            # col3
    _wp('Операция', 'operation_name'),          # col4
    _wp('Этап', 'stage_no'),                    # col5
    _wp('Тип сварки', 'welding_type'),          # col6
    _wp('Тип клещей', 'gun_type'),              # col7
    _wp('Клещи (G)', 'gun_mntc',                # col8
        hint='Формат G.043 — по номеру точка автоматически привяжется к клещам. '
             'СМЕНА номера = ПЕРЕНОС точки: старая связка закроется датой, создастся новая.'),
    _wp('№ точки', 'spot_number',               # col9
        hint='Номер уникален в пределах модели. Вместе с «Модель (код)» создаёт/находит карточку точки.'),
    _wp('Сторона', 'side'),                     # col10
    *_part_cols(1),                             # col11-15  (деталь слоя 1)
    *_part_cols(2),                             # col16-20  (деталь слоя 2)
    *_part_cols(3),                             # col21-25  (деталь слоя 3)
    _raw('STUCK', 'x_stuck', 'stuck'),          # col26
    _wp('Ст. толщина', 'std_thickness'),        # col27
    _wp('Покрытие', 'coating'),                 # col28
    _wp('LME (hold)', 'lme_hold'),              # col29
    _wp('Наггет', 'nugget'),                    # col30
    _wp('Проверка', 'check_mark'),              # col31
    _wp('Важность', 'important'),               # col32
    _wp('Доступ зубила', 'chisel_access'),      # col33
    _raw('Служебн. 1', 'x_m1', 'mark1'),        # col34
    _raw('Служебн. 2', 'x_m2', 'mark2'),        # col35
    _raw('Служебн. 3', 'x_m3', 'mark3'),        # col36
    _raw('Coord Laser', 'x_laser', 'coord_laser'),  # col37
    _wp('Change Index', 'change_index'),        # col38
    _wp('SPEC', 'spec'),                        # col39
    _raw('Проверка 2', 'x_check2', 'check2'),   # col40
    _wp('WP stack info', 'wp_stack_info'),      # col41
    _raw('All points', 'x_allpts', 'check_all_points'),   # col42
    _raw('Work process', 'x_wproc', 'check_work_process'),  # col43
    _raw('A-лист пересм.', 'x_alist', 'a_list_revised'),   # col44
    _wp('Вариант 1', 'variant_1'),              # col45
    _wp('Вариант 2', 'variant_2'),              # col46
    _wp('Вариант 3', 'variant_3'),              # col47
    _wp('Вариант 4', 'variant_4'),              # col48
    _wp('X', 'coord_x'),                        # col49
    _wp('Y', 'coord_y'),                        # col50
    _wp('Z', 'coord_z'),                        # col51
    _wp('Вариант (Models)', 'model_variant'),   # col52
    # ── заблокированные/внутренние поля — В КОНЦЕ (не входят в вставку из Excel) ──
    {'label': 'Модель (код)', 'field': 'model_code', 'expr': 'wp.model_code', 'edit': True,
     'table': 'weld_point', 'col': 'model_code',
     'hint': 'Код модели: A13T, A01, P01G, CS55, CS65. Код + № точки → карточка точки (создаётся, если её нет). '
             'Коды с двумя модификациями (A01 — Jolion 2WD/4WD, P01G — Tank ToD/NOT ToD) привязывают точку к ОБЕИМ.'},
    {'label': 'Клещи id', 'field': 'gun_id', 'expr': 'wp.gun_id', 'edit': False},
    {'label': 'Точка id', 'field': 'spot_id', 'expr': 'wp.spot_id', 'edit': False},
    {'label': 'Файл-источник', 'field': 'source_file', 'expr': 'wp.source_file', 'edit': False},
    # Порядок строки в документе (как в листе Excel). Скрыт в UI, но редактируем —
    # вставка/перемещение строк в гриде меняет его через обычный batch.
    {'label': '#', 'field': 'row_order', 'expr': 'wp.row_order', 'edit': True,
     'table': 'weld_point', 'col': 'row_order', 'hidden': True},
]

# Кол-во колонок, соответствующих листу Excel (col0..col52) — на них рассчитана вставка.
WB_EXCEL_COLUMN_COUNT = 53

# JOIN'ы деталей слоёв 1-3 (по одной строке weld_point_part на слой — дублей нет)
# и их материалов, чтобы плоские колонки деталей читались одним запросом.
_WB_BASE = """FROM weld_point wp
        LEFT JOIN weld_point_part p1 ON p1.weld_point_id=wp.id AND p1.layer_no=1
        LEFT JOIN weld_point_part p2 ON p2.weld_point_id=wp.id AND p2.layer_no=2
        LEFT JOIN weld_point_part p3 ON p3.weld_point_id=wp.id AND p3.layer_no=3
        LEFT JOIN wb_material m1 ON p1.material_id=m1.id
        LEFT JOIN wb_material m2 ON p2.material_id=m2.id
        LEFT JOIN wb_material m3 ON p3.material_id=m3.id"""


def _wb_doc(title, where, manual_src):
    return {
        'title': title,
        'base': _WB_BASE,
        'where': where,
        'pks': {'weld_point': 'wp.id'},
        'primary': 'weld_point',
        'order': 'wp.row_order, wp.id',
        'child': {'table': 'weld_point_part', 'fk_col': 'weld_point_id', 'title': 'Детали точки'},
        # значения по умолчанию для строк, создаваемых через редактор (NOT NULL + фильтр документа)
        'insert_defaults': {'source_file': manual_src},
        'columns': _WB_COLUMNS,
    }


# ── статические документы ──
_EQUIPMENT_DOC = {
    'title': 'Перечень оборудования',
    'base': """FROM gun g
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN trans t ON gta.transformer_id=t.UniqueID
        LEFT JOIN transformer_station_assignment tsa ON t.UniqueID=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        LEFT JOIN brand b ON st.brand_id=b.UniqueID""",
    'pks': {'gun': 'g.UniqueID'},
    'primary': 'gun',
    'order': 'g.g_num',
    'columns': [
        {'label': 'Номер (G)', 'field': 'g_num', 'expr': 'g.g_num', 'edit': True, 'table': 'gun', 'col': 'g_num',
         'hint': 'Уникальный номер клещей. Дубликаты запрещены.'},
        {'label': 'Тип клещей', 'field': 'gun_type', 'expr': 'g.gun_type', 'edit': True, 'table': 'gun', 'col': 'gun_type'},
        # ПЕРЕНОС ГАНА: выбираете трансформатор (в т.ч. другой станции) — старая привязка
        # закрывается датой, создаётся новая; станция/линия пересчитываются, точки едут с ганом.
        {'label': 'Трансформатор', 'field': 'transformer_id', 'expr': 'gta.transformer_id', 'edit': True,
         'fk': 'trans', 'setter': 'gun_transformer',
         'hint': 'Перенос гана: выберите трансформатор (можно другой станции) — старая привязка закроется датой, точки переедут вместе с ганом.'},
        {'label': 'Станция', 'field': 'station_name', 'expr': "COALESCE(st.station_name,'—')", 'edit': False,
         'hint': 'Вычисляется по трансформатору. Для переноса гана меняйте «Трансформатор».'},
        {'label': 'Линия', 'field': 'brand', 'expr': "COALESCE(b.brand,'—')", 'edit': False},
    ],
}

_PARAMETERS_DOC = {
    'title': 'Параметры сварки',
    'base': 'FROM parameters p',
    'pks': {'parameters': 'p.UniqueID'},
    'primary': 'parameters',
    'order': 'p.UniqueID',
    'columns': [
        {'label': 'Режим', 'field': 'mode', 'expr': 'p.mode', 'edit': True, 'table': 'parameters', 'col': 'mode'},
        {'label': 'Давление (N)', 'field': 'pressure', 'expr': 'p.pressure', 'edit': True, 'table': 'parameters', 'col': 'pressure'},
        {'label': 'Сжатие', 'field': 'squeeze_time', 'expr': 'p.squeeze_time', 'edit': True, 'table': 'parameters', 'col': 'squeeze_time'},
        {'label': 'Наклон', 'field': 'up_slope_time', 'expr': 'p.up_slope_time', 'edit': True, 'table': 'parameters', 'col': 'up_slope_time'},
        {'label': 'Сварка 1', 'field': 'weld_1', 'expr': 'p.weld_1', 'edit': True, 'table': 'parameters', 'col': 'weld_1'},
        {'label': 'Ток 1', 'field': 'heat_1', 'expr': 'p.heat_1', 'edit': True, 'table': 'parameters', 'col': 'heat_1'},
        {'label': 'Охлажд.', 'field': 'cool_1', 'expr': 'p.cool_1', 'edit': True, 'table': 'parameters', 'col': 'cool_1'},
        {'label': 'Сварка 2', 'field': 'weld_2', 'expr': 'p.weld_2', 'edit': True, 'table': 'parameters', 'col': 'weld_2'},
        {'label': 'Ток 2', 'field': 'heat_2', 'expr': 'p.heat_2', 'edit': True, 'table': 'parameters', 'col': 'heat_2'},
        {'label': 'Проковка', 'field': 'hold', 'expr': 'p.hold', 'edit': True, 'table': 'parameters', 'col': 'hold'},
        {'label': 'Поворот R', 'field': 'turn_R', 'expr': 'p.turn_R', 'edit': True, 'table': 'parameters', 'col': 'turn_R'},
        # Виртуальная редактируемая колонка: список G-номеров через запятую.
        # Запись идёт не в колонку, а через setter — синхронизацию welding_setup (см. admin.batch_doc).
        {'label': 'Клещи (G)', 'field': 'guns', 'edit': True, 'setter': 'parameter_guns',
         'hint': 'Номера клещей через запятую (5, 6 или G.5 G.6). Добавленные привяжутся к программе, убранные — отвяжутся (с датой).',
         'expr': "(SELECT GROUP_CONCAT(DISTINCT g.g_num) FROM welding_setup ws "
                 "JOIN gun g ON ws.gun_id=g.UniqueID WHERE ws.parameter_id=p.UniqueID AND ws.is_active=1)"},
    ],
}

# ── Записи ТО и Дефекты: тот же редактор во вкладках /maintenance и /defects.
#    Факты правятся с полным аудитом (change_log) и откатом. snap_*-колонки (заморозка
#    исторического контекста) в документ НЕ выводим — они остаются как «как было записано»
#    и не меняются при правке ссылок. FK-выпадашки: клещи/сотрудник (мало строк). Точку у
#    дефекта показываем только для чтения (spot — 17k строк, выпадашка непрактична; смену
#    привязки делают в «Редакторе»/через Weld Balance).
_MAINTENANCE_DOC = {
    'title': 'Записи ТО',
    'base': 'FROM maintenance m',
    'pks': {'maintenance': 'm.UniqueId'},
    'primary': 'maintenance',
    'order': 'm.to_date DESC, m.UniqueId DESC',
    'columns': [
        {'label': 'Дата ТО', 'field': 'to_date', 'expr': 'm.to_date', 'edit': True,
         'table': 'maintenance', 'col': 'to_date', 'hint': 'Формат ГГГГ-ММ-ДД'},
        {'label': 'Клещи (G)', 'field': 'gun_id', 'expr': 'm.gun_id', 'edit': True,
         'table': 'maintenance', 'col': 'gun_id', 'fk': 'gun'},
        {'label': 'Сотрудник', 'field': 'worker_id', 'expr': 'm.worker_id', 'edit': True,
         'table': 'maintenance', 'col': 'worker_id', 'fk': 'worker'},
        {'label': 'Ток 1', 'field': 'first_weld', 'expr': 'm.first_weld', 'edit': True, 'table': 'maintenance', 'col': 'first_weld'},
        {'label': 'Ток 2', 'field': 'second_weld', 'expr': 'm.second_weld', 'edit': True, 'table': 'maintenance', 'col': 'second_weld'},
        {'label': 'Ток 3', 'field': 'third_weld', 'expr': 'm.third_weld', 'edit': True, 'table': 'maintenance', 'col': 'third_weld'},
        {'label': 'Давление 1 (N)', 'field': 'first_pressure', 'expr': 'm.first_pressure', 'edit': True, 'table': 'maintenance', 'col': 'first_pressure'},
        {'label': 'Давление 2 (N)', 'field': 'second_pressure', 'expr': 'm.second_pressure', 'edit': True, 'table': 'maintenance', 'col': 'second_pressure'},
        {'label': 'Давление 3 (N)', 'field': 'third_pressure', 'expr': 'm.third_pressure', 'edit': True, 'table': 'maintenance', 'col': 'third_pressure'},
    ],
}

_DEFECTS_DOC = {
    'title': 'Дефекты',
    'base': """FROM defects d
        LEFT JOIN spot s ON d.spot_id=s.UniqueID
        LEFT JOIN model mo ON s.model_id=mo.UniqueID""",
    'pks': {'defects': 'd.UniqueID'},
    'primary': 'defects',
    'order': 'd.df_date DESC, d.UniqueID DESC',
    'columns': [
        {'label': 'Дата', 'field': 'df_date', 'expr': 'd.df_date', 'edit': True,
         'table': 'defects', 'col': 'df_date', 'hint': 'Формат ГГГГ-ММ-ДД'},
        {'label': 'Код дефекта', 'field': 'problem_code', 'expr': 'd.problem_code', 'edit': True,
         'table': 'defects', 'col': 'problem_code', 'fk': 'defect_code'},
        {'label': 'Статус', 'field': 'status', 'expr': 'd.status', 'edit': True,
         'table': 'defects', 'col': 'status', 'hint': 'registered / in_work / closed'},
        {'label': 'Точка', 'field': 'spot_disp', 'edit': False,
         'expr': "CASE WHEN d.spot_id IS NOT NULL THEN s.spot_number || COALESCE(' · ' || mo.model_name,'') "
                 "WHEN d.manual_spot_number IS NOT NULL THEN d.manual_spot_number || ' (ручной)' ELSE '—' END",
         'hint': 'Только для чтения: смену привязки точки делайте в «Редакторе»/Weld Balance.'},
        {'label': 'Клещи (G)', 'field': 'gun_id', 'expr': 'd.gun_id', 'edit': True,
         'table': 'defects', 'col': 'gun_id', 'fk': 'gun'},
        {'label': 'Ручной № точки', 'field': 'manual_spot_number', 'expr': 'd.manual_spot_number', 'edit': True,
         'table': 'defects', 'col': 'manual_spot_number', 'hint': 'Для дефекта без карточки точки в БД.'},
        {'label': 'Зарегистрировал', 'field': 'worker_register_id', 'expr': 'd.worker_register_id', 'edit': True,
         'table': 'defects', 'col': 'worker_register_id', 'fk': 'worker',
         'hint': 'Проставляется автоматически — кто зафиксировал дефект (вошедший пользователь).'},
        {'label': 'Закрыл', 'field': 'worker_solve_id', 'expr': 'd.worker_solve_id', 'edit': True,
         'table': 'defects', 'col': 'worker_solve_id', 'fk': 'worker'},
        {'label': 'Причина', 'field': 'root_cause', 'expr': 'd.root_cause', 'edit': True, 'table': 'defects', 'col': 'root_cause'},
        {'label': 'Решение', 'field': 'solution', 'expr': 'd.solution', 'edit': True, 'table': 'defects', 'col': 'solution'},
        # «Назначен» (assigned_worker_id) и «Описание» (description) убраны из редактора:
        # рабочий процесс их не собирает, доп. информации от пользователя не требуют.
    ],
}

# Токен вкладки WB: только буквы/цифры/._- (защита от SQL-инъекции в LIKE-фильтре).
TOKEN_RE = re.compile(r'^[A-Za-z0-9_.\-]+$')


def get_documents(db) -> dict:
    """Собрать документы: Перечень оборудования + WB-вкладки из таблицы wb_tab + Параметры."""
    docs = {'equipment': _EQUIPMENT_DOC}
    for tab_id, title, token, manual in db.execute(
            'SELECT id, title, match_token, manual_src FROM wb_tab ORDER BY position, id'):
        if not TOKEN_RE.match(token or ''):
            continue  # некорректный токен не должен попадать в SQL
        docs[f'weld_balance_{tab_id}'] = _wb_doc(
            title, f"wp.source_file LIKE '%{token}%'", manual) | {'wb_tab_id': tab_id}
    docs['parameters'] = _PARAMETERS_DOC
    docs['maintenance'] = _MAINTENANCE_DOC
    docs['defects'] = _DEFECTS_DOC
    return docs


def doc_list(db):
    return [{'id': k, 'title': v['title'], 'wb_tab_id': v.get('wb_tab_id')}
            for k, v in get_documents(db).items()]


def _parse_spot_num(spot_number):
    """'17' / '17.0' → 17; мусор → None."""
    try:
        return int(float(spot_number))
    except (ValueError, TypeError):
        return None


def _model_ids_for_code(db, code):
    """Код модели → id всех её модификаций (A01 → Jolion 2WD и 4WD)."""
    if not code:
        return []
    return [r[0] for r in db.execute(
        'SELECT UniqueID FROM model WHERE UPPER(model_code)=UPPER(?)', (code,))]


def _identity_spots(db, spot_id):
    """Все карточки этой «точки» во всех модификациях кода (по образцу spot_id).

    Идентичность точки = (код модели, № точки): A01-строка описывает точку сразу
    в Jolion 2WD и 4WD, поэтому проверять/закрывать связки надо в обеих."""
    if spot_id is None:
        return []
    row = db.execute('SELECT spot_number, model_id FROM spot WHERE UniqueID=?', (spot_id,)).fetchone()
    if not row:
        return []
    siblings = [r[0] for r in db.execute(
        """SELECT s.UniqueID FROM spot s
           JOIN model m1 ON s.model_id=m1.UniqueID
           JOIN model m2 ON m1.model_code=m2.model_code
           WHERE m2.UniqueID=(SELECT model_id FROM spot WHERE UniqueID=?) AND s.spot_number=?""",
        (spot_id, row[0]))]
    return siblings or [spot_id]


def _pair_backed_by_wb(db, spot_id, gun_id):
    """Пара (точка, клещи) подтверждена, если ХОТЬ ОДНА строка WB этой точки
    (по коду модели и номеру) указывает на эти клещи."""
    return db.execute(
        """SELECT 1 FROM weld_point wp
           JOIN spot s ON s.UniqueID=?
           JOIN model m ON s.model_id=m.UniqueID
           WHERE UPPER(wp.model_code)=UPPER(m.model_code) AND wp.gun_id=?
             AND CAST(wp.spot_number AS REAL)=CAST(s.spot_number AS REAL)
           LIMIT 1""", (spot_id, gun_id)).fetchone() is not None


# Связки, которыми управляет WB-синхронизация (загрузки + авто-связки). Ручные
# привязки (напр. обогащение дефектов) под это условие не подпадают и не трогаются.
_WB_LINK_ORIGIN = ("(comments LIKE 'Первоначальная загрузка%' "
                   "OR comments = 'создано из Weld Balance')")


def _ensure_active_link(db, spot_id, gun_id, today) -> None:
    """Гарантировать РОВНО одну активную связку (точка, клещи), сохранив программу сварки.

    parameter_id наследуется от прежней связки той же пары (точка, клещи) — в т.ч. от
    первоначальной загрузки, — чтобы Ток/Режим не терялись при переносе точки туда-обратно.
    Прежняя авто-связка этой пары РЕАКТИВИРУЕТСЯ (а не плодится новая), чтобы история
    связей не засорялась дубликатами."""
    inh = db.execute("SELECT parameter_id FROM welding_setup WHERE spot_id=? AND gun_id=? "
                     "AND parameter_id IS NOT NULL ORDER BY start_date DESC, UniqueID DESC LIMIT 1",
                     (spot_id, gun_id)).fetchone()
    param = inh[0] if inh else None
    act = db.execute("SELECT UniqueID, parameter_id FROM welding_setup WHERE spot_id=? AND gun_id=? "
                     "AND is_active=1 ORDER BY UniqueID DESC LIMIT 1", (spot_id, gun_id)).fetchone()
    if act:
        if act[1] is None and param is not None:  # активная есть, но программа утеряна — вернуть
            db.execute('UPDATE welding_setup SET parameter_id=? WHERE UniqueID=?', (param, act[0]))
        return
    arch = db.execute("SELECT UniqueID FROM welding_setup WHERE spot_id=? AND gun_id=? AND is_active=0 "
                      "AND comments='создано из Weld Balance' ORDER BY start_date DESC, UniqueID DESC LIMIT 1",
                      (spot_id, gun_id)).fetchone()
    if arch:
        db.execute('UPDATE welding_setup SET is_active=1, end_date=NULL, start_date=?, '
                   'parameter_id=COALESCE(parameter_id, ?) WHERE UniqueID=?', (today, param, arch[0]))
    else:
        db.execute("INSERT INTO welding_setup (comments, start_date, is_active, auto_created, "
                   "spot_id, gun_id, parameter_id) VALUES ('создано из Weld Balance', ?, 1, 1, ?, ?, ?)",
                   (today, spot_id, gun_id, param))


def _close_if_unbacked(db, spot_id, gun_id, today):
    """Закрыть активную WB-связку датой, если Weld Balance её больше не подтверждает."""
    if spot_id is None or gun_id is None or _pair_backed_by_wb(db, spot_id, gun_id):
        return
    db.execute('UPDATE welding_setup SET is_active=0, end_date=? '
               'WHERE spot_id=? AND gun_id=? AND is_active=1 AND ' + _WB_LINK_ORIGIN,
               (today, spot_id, gun_id))


def _close_unbacked_links(db, spot_ids, today):
    """Закрыть ВСЕ активные WB-связки указанных карточек, не подтверждённые Weld Balance.
    Так уходят «застрявшие» клещи (третий ган точки, которого нет ни в одной строке WB)."""
    for sid in spot_ids:
        for (gid,) in db.execute('SELECT DISTINCT gun_id FROM welding_setup '
                                 'WHERE spot_id=? AND is_active=1 AND gun_id IS NOT NULL',
                                 (sid,)).fetchall():
            _close_if_unbacked(db, sid, gid, today)


def close_removed_wb_rows(db, removed) -> None:
    """После УДАЛЕНИЯ строк WB закрыть связки, которые больше ничем не подтверждены.

    removed — кортежи (model_code, spot_number, gun_id), снятые ДО удаления строк."""
    from datetime import date
    today = date.today().isoformat()
    for code, spot_number, gun_id in removed:
        num = _parse_spot_num(spot_number)
        if gun_id is None or num is None:
            continue
        for mid in _model_ids_for_code(db, code):
            s = db.execute('SELECT UniqueID FROM spot WHERE model_id=? AND spot_number=?',
                           (mid, num)).fetchone()
            if s:
                _close_if_unbacked(db, s[0], gun_id, today)


def resolve_weld_point_links(db, wp_ids) -> None:
    """Синхронизация строки Weld Balance с «карточками» БД — WB является источником
    правды для привязок точка↔клещи (их видят Обзор, Дефекты, уставки):

    1. 'Клещи (G)' G.NNN → карточка клещей (gun.g_num) → gun_id.
    2. (Код модели, № точки) → карточка точки в КАЖДОЙ модификации кода
       (A01 → Jolion 2WD и 4WD); нет карточки — создаётся.
    3. Активная связка welding_setup создаётся для каждой карточки точки.
    4. Прежние связки этой точки (старые клещи, старый номер/модель, очищенный G),
       не подтверждённые больше ни одной строкой WB, закрываются датой —
       история сохраняется в welding_setup и в Журнале.

    Клещи с несуществующим номером не создаём (опечатка вероятнее) — остаётся NULL.
    """
    from datetime import date
    today = date.today().isoformat()
    for wp_id in wp_ids:
        row = db.execute('SELECT gun_mntc, model_code, spot_number, welding_type, gun_id, spot_id '
                         'FROM weld_point WHERE id=?', (wp_id,)).fetchone()
        if not row:
            continue
        gun_mntc, code, spot_number, welding_type = row[0], row[1], row[2], row[3]
        old_spot_id = row[5]
        # 1) клещи
        gun_id = None
        m = re.search(r'G[.\s]*0*(\d+)', gun_mntc or '')
        if m:
            g = db.execute('SELECT UniqueID FROM gun WHERE g_num=?', (int(m.group(1)),)).fetchone()
            gun_id = g[0] if g else None
        # 2) карточки точки во всех модификациях кода: найти или создать
        new_spots = []
        num = _parse_spot_num(spot_number)
        if num is not None:
            for mid in _model_ids_for_code(db, code):
                s = db.execute('SELECT UniqueID FROM spot WHERE model_id=? AND spot_number=?',
                               (mid, num)).fetchone()
                if s:
                    new_spots.append(s[0])
                else:
                    cur = db.execute('INSERT INTO spot (spot_number, model_id, welding_type) VALUES (?,?,?)',
                                     (num, mid, welding_type))
                    new_spots.append(cur.lastrowid)
        # 3) активные связки точка↔клещи (их видят Обзор/Дефекты) с сохранением программы
        if gun_id is not None:
            for sid in new_spots:
                _ensure_active_link(db, sid, gun_id, today)
        db.execute('UPDATE weld_point SET gun_id=?, spot_id=? WHERE id=?',
                   (gun_id, new_spots[0] if new_spots else None, wp_id))
        # 4) закрыть ВСЕ активные связки затронутых карточек, не подтверждённые WB
        #    (старые/новые карточки + «застрявшие» третьи клещи). Проверка идёт по уже
        #    обновлённой строке, поэтому смена G, номера, модели, очистка G и удаление
        #    строки закрывают ровно то, что устарело.
        affected = set(_identity_spots(db, old_spot_id)) | set(new_spots)
        _close_unbacked_links(db, affected, today)
