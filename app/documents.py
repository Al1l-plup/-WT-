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
"""

# ── общие колонки Weld Balance (показываем ВСЕ колонки Excel; ничего не теряем) ──
# Реальные поля weld_point — редактируемые; «прочие» колонки Excel лежат в raw_extra (JSON) —
# показываем их read-only через json_extract. Столбцы «Вариант 1-4» — символы-пометки из Excel
# (какой Вариант = 2WD/4WD/ToD, в данных не подписано — по запросу переименуем).
_WB_COLUMNS = [
    {'label': 'Лист №', 'field': 'sh_num', 'expr': 'wp.sh_num', 'edit': True, 'table': 'weld_point', 'col': 'sh_num'},
    {'label': 'Зона', 'field': 'zone', 'expr': 'wp.zone', 'edit': True, 'table': 'weld_point', 'col': 'zone'},
    {'label': 'Станция', 'field': 'wb_station', 'expr': 'wp.wb_station', 'edit': True, 'table': 'weld_point', 'col': 'wb_station'},
    {'label': '№ процесса', 'field': 'process_no', 'expr': 'wp.process_no', 'edit': True, 'table': 'weld_point', 'col': 'process_no'},
    {'label': 'Операция', 'field': 'operation_name', 'expr': 'wp.operation_name', 'edit': True, 'table': 'weld_point', 'col': 'operation_name'},
    {'label': 'Этап', 'field': 'stage_no', 'expr': 'wp.stage_no', 'edit': True, 'table': 'weld_point', 'col': 'stage_no'},
    {'label': 'Тип сварки', 'field': 'welding_type', 'expr': 'wp.welding_type', 'edit': True, 'table': 'weld_point', 'col': 'welding_type'},
    {'label': 'Тип клещей', 'field': 'gun_type', 'expr': 'wp.gun_type', 'edit': True, 'table': 'weld_point', 'col': 'gun_type'},
    {'label': 'Клещи (G)', 'field': 'gun_mntc', 'expr': 'wp.gun_mntc', 'edit': True, 'table': 'weld_point', 'col': 'gun_mntc'},
    {'label': '№ точки', 'field': 'spot_number', 'expr': 'wp.spot_number', 'edit': True, 'table': 'weld_point', 'col': 'spot_number'},
    {'label': 'Сторона', 'field': 'side', 'expr': 'wp.side', 'edit': True, 'table': 'weld_point', 'col': 'side'},
    {'label': 'Модель', 'field': 'model_id', 'expr': 'wp.model_id', 'edit': True, 'table': 'weld_point', 'col': 'model_id', 'fk': 'model'},
    {'label': 'Вариант (Models)', 'field': 'model_variant', 'expr': 'wp.model_variant', 'edit': True, 'table': 'weld_point', 'col': 'model_variant'},
    {'label': 'Ст. толщина', 'field': 'std_thickness', 'expr': 'wp.std_thickness', 'edit': True, 'table': 'weld_point', 'col': 'std_thickness'},
    {'label': 'Покрытие', 'field': 'coating', 'expr': 'wp.coating', 'edit': True, 'table': 'weld_point', 'col': 'coating'},
    {'label': 'Наггет', 'field': 'nugget', 'expr': 'wp.nugget', 'edit': True, 'table': 'weld_point', 'col': 'nugget'},
    {'label': 'Проверка', 'field': 'check_mark', 'expr': 'wp.check_mark', 'edit': True, 'table': 'weld_point', 'col': 'check_mark'},
    {'label': 'Важность', 'field': 'important', 'expr': 'wp.important', 'edit': True, 'table': 'weld_point', 'col': 'important'},
    {'label': 'Доступ зубила', 'field': 'chisel_access', 'expr': 'wp.chisel_access', 'edit': True, 'table': 'weld_point', 'col': 'chisel_access'},
    {'label': 'SPEC', 'field': 'spec', 'expr': 'wp.spec', 'edit': True, 'table': 'weld_point', 'col': 'spec'},
    {'label': 'Change Index', 'field': 'change_index', 'expr': 'wp.change_index', 'edit': True, 'table': 'weld_point', 'col': 'change_index'},
    {'label': 'WP stack info', 'field': 'wp_stack_info', 'expr': 'wp.wp_stack_info', 'edit': True, 'table': 'weld_point', 'col': 'wp_stack_info'},
    {'label': 'Вариант 1', 'field': 'variant_1', 'expr': 'wp.variant_1', 'edit': True, 'table': 'weld_point', 'col': 'variant_1'},
    {'label': 'Вариант 2', 'field': 'variant_2', 'expr': 'wp.variant_2', 'edit': True, 'table': 'weld_point', 'col': 'variant_2'},
    {'label': 'Вариант 3', 'field': 'variant_3', 'expr': 'wp.variant_3', 'edit': True, 'table': 'weld_point', 'col': 'variant_3'},
    {'label': 'Вариант 4', 'field': 'variant_4', 'expr': 'wp.variant_4', 'edit': True, 'table': 'weld_point', 'col': 'variant_4'},
    {'label': 'X', 'field': 'coord_x', 'expr': 'wp.coord_x', 'edit': True, 'table': 'weld_point', 'col': 'coord_x'},
    {'label': 'Y', 'field': 'coord_y', 'expr': 'wp.coord_y', 'edit': True, 'table': 'weld_point', 'col': 'coord_y'},
    {'label': 'Z', 'field': 'coord_z', 'expr': 'wp.coord_z', 'edit': True, 'table': 'weld_point', 'col': 'coord_z'},
    {'label': 'Клещи id', 'field': 'gun_id', 'expr': 'wp.gun_id', 'edit': False},
    {'label': 'Точка id', 'field': 'spot_id', 'expr': 'wp.spot_id', 'edit': False},
    {'label': 'Файл-источник', 'field': 'source_file', 'expr': 'wp.source_file', 'edit': False},
    {'label': 'STUCK', 'field': 'x_stuck', 'expr': "json_extract(wp.raw_extra,'$.stuck')", 'edit': False},
    {'label': 'Проверка 2', 'field': 'x_check2', 'expr': "json_extract(wp.raw_extra,'$.check2')", 'edit': False},
    {'label': 'All points', 'field': 'x_allpts', 'expr': "json_extract(wp.raw_extra,'$.check_all_points')", 'edit': False},
    {'label': 'Work process', 'field': 'x_wproc', 'expr': "json_extract(wp.raw_extra,'$.check_work_process')", 'edit': False},
    {'label': 'A-лист пересм.', 'field': 'x_alist', 'expr': "json_extract(wp.raw_extra,'$.a_list_revised')", 'edit': False},
    {'label': 'Coord Laser', 'field': 'x_laser', 'expr': "json_extract(wp.raw_extra,'$.coord_laser')", 'edit': False},
    {'label': 'Служебн. 1', 'field': 'x_m1', 'expr': "json_extract(wp.raw_extra,'$.mark1')", 'edit': False},
    {'label': 'Служебн. 2', 'field': 'x_m2', 'expr': "json_extract(wp.raw_extra,'$.mark2')", 'edit': False},
    {'label': 'Служебн. 3', 'field': 'x_m3', 'expr': "json_extract(wp.raw_extra,'$.mark3')", 'edit': False},
    # Порядок строки в документе (как в листе Excel). Скрыт в UI, но редактируем —
    # вставка/перемещение строк в гриде меняет его через обычный batch.
    {'label': '#', 'field': 'row_order', 'expr': 'wp.row_order', 'edit': True,
     'table': 'weld_point', 'col': 'row_order', 'hidden': True},
]

# Отдельный Weld Balance на каждую базовую модель (фильтр по файлу-источнику).
# Внутри A01 — модификации 2WD/4WD, внутри P01 — ToD/NOT-ToD (столбцы «Вариант 1-4»).
# Третий элемент — source_file для строк, СОЗДАННЫХ в редакторе (попадает под фильтр документа).
_WB_MODELS = [
    ('weld_balance_a01', 'WB · A01 (Jolion 2WD/4WD)', "wp.source_file LIKE '%A01%'", 'manual A01'),
    ('weld_balance_p01', 'WB · P01 (Tank ToD)', "wp.source_file LIKE '%P01%'", 'manual P01'),
    ('weld_balance_a13t', 'WB · A13T (Tiggo2)', "wp.source_file LIKE '%A13T%'", 'manual A13T'),
    ('weld_balance_cs55', 'WB · CS55 (Changan)', "wp.source_file LIKE '%cs55%'", 'manual cs55'),
]


def _wb_doc(title, where, manual_src):
    return {
        'title': title,
        'base': 'FROM weld_point wp LEFT JOIN model m ON wp.model_id=m.UniqueID',
        'where': where,
        'pks': {'weld_point': 'wp.id'},
        'primary': 'weld_point',
        'order': 'wp.row_order, wp.id',
        'child': {'table': 'weld_point_part', 'fk_col': 'weld_point_id', 'title': 'Детали точки'},
        # значения по умолчанию для строк, создаваемых через редактор (NOT NULL + фильтр документа)
        'insert_defaults': {'source_file': manual_src},
        'columns': _WB_COLUMNS,
    }


DOCUMENTS = {}

# ── Перечень оборудования ──
DOCUMENTS['equipment'] = {
    'title': 'Перечень оборудования',
    'base': """FROM gun g
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID=gta.gun_id AND gta.is_active=1
        LEFT JOIN trans t ON gta.transformer_id=t.UniqueID
        LEFT JOIN transformer_station_assignment tsa ON t.UniqueID=tsa.transformer_id AND tsa.is_active=1
        LEFT JOIN station st ON tsa.station_id=st.UniqueID
        LEFT JOIN brand b ON st.brand_id=b.UniqueID""",
    'pks': {'gun': 'g.UniqueID', 'transformer_station_assignment': 'tsa.UniqueID'},
    'primary': 'gun',
    'order': 'g.g_num',
    'columns': [
        {'label': 'Номер (G)', 'field': 'g_num', 'expr': 'g.g_num', 'edit': True, 'table': 'gun', 'col': 'g_num'},
        {'label': 'Тип клещей', 'field': 'gun_type', 'expr': 'g.gun_type', 'edit': True, 'table': 'gun', 'col': 'gun_type'},
        {'label': 'Станция', 'field': 'station_id', 'expr': 'tsa.station_id', 'edit': True,
         'table': 'transformer_station_assignment', 'col': 'station_id', 'fk': 'station'},
        {'label': 'Линия', 'field': 'brand', 'expr': "COALESCE(b.brand,'—')", 'edit': False},
        {'label': 'Трансформатор', 'field': 'transID', 'expr': "COALESCE(t.transID,'—')", 'edit': False},
    ],
}

# ── Weld Balance — 4 документа по моделям ──
for _did, _title, _where, _src in _WB_MODELS:
    DOCUMENTS[_did] = _wb_doc(_title, _where, _src)

# ── Параметры сварки (программы) ──
DOCUMENTS['parameters'] = {
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
        {'label': 'Клещи (G)', 'field': 'guns', 'edit': False,
         'expr': "(SELECT GROUP_CONCAT(DISTINCT g.g_num) FROM welding_setup ws "
                 "JOIN gun g ON ws.gun_id=g.UniqueID WHERE ws.parameter_id=p.UniqueID AND ws.is_active=1)"},
    ],
}


def doc_list():
    return [{'id': k, 'title': v['title']} for k, v in DOCUMENTS.items()]
