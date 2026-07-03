"""Декларативная конфигурация «документов» редактора БД.

Вместо сырых таблиц пользователь видит 3 понятных документа цеха с русскими заголовками.
Каждый документ — это SQL-представление (base = FROM + JOIN) с колонками, у каждой из которых:
  label   — заголовок для человека
  field   — ключ в строке / имя для записи
  expr    — SQL-выражение для SELECT (алиасится AS field)
  edit    — можно ли редактировать
  table/col — куда писать (для редактируемых колонок; связанное редактирование)
  fk      — имя связанной таблицы (для выпадающего списка)
`pks` — выражения первичных ключей участвующих таблиц (алиасятся как __pk_<table>),
чтобы при сохранении знать, какую строку какой таблицы обновлять.
"""

DOCUMENTS = {
    # ── Перечень оборудования: клещи + активная станция/линия/трансформатор ──
    'equipment': {
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
    },

    # ── Weld Balance: точки сварки (детали — под-таблицей weld_point_part) ──
    'weld_balance': {
        'title': 'Weld Balance',
        'base': 'FROM weld_point wp LEFT JOIN model m ON wp.model_id=m.UniqueID',
        'pks': {'weld_point': 'wp.id'},
        'primary': 'weld_point',
        'order': 'wp.id',
        'child': {'table': 'weld_point_part', 'fk_col': 'weld_point_id', 'title': 'Детали точки'},
        'columns': [
            {'label': 'Модель', 'field': 'model_id', 'expr': 'wp.model_id', 'edit': True, 'table': 'weld_point', 'col': 'model_id', 'fk': 'model'},
            {'label': '№ точки', 'field': 'spot_number', 'expr': 'wp.spot_number', 'edit': True, 'table': 'weld_point', 'col': 'spot_number'},
            {'label': 'Зона', 'field': 'zone', 'expr': 'wp.zone', 'edit': True, 'table': 'weld_point', 'col': 'zone'},
            {'label': 'Станция', 'field': 'wb_station', 'expr': 'wp.wb_station', 'edit': True, 'table': 'weld_point', 'col': 'wb_station'},
            {'label': 'Операция', 'field': 'operation_name', 'expr': 'wp.operation_name', 'edit': True, 'table': 'weld_point', 'col': 'operation_name'},
            {'label': 'Этап', 'field': 'stage_no', 'expr': 'wp.stage_no', 'edit': True, 'table': 'weld_point', 'col': 'stage_no'},
            {'label': 'Тип сварки', 'field': 'welding_type', 'expr': 'wp.welding_type', 'edit': True, 'table': 'weld_point', 'col': 'welding_type'},
            {'label': 'Сторона', 'field': 'side', 'expr': 'wp.side', 'edit': True, 'table': 'weld_point', 'col': 'side'},
            {'label': 'Клещи (G)', 'field': 'gun_mntc', 'expr': 'wp.gun_mntc', 'edit': True, 'table': 'weld_point', 'col': 'gun_mntc'},
            {'label': 'Ст. толщина', 'field': 'std_thickness', 'expr': 'wp.std_thickness', 'edit': True, 'table': 'weld_point', 'col': 'std_thickness'},
            {'label': 'Наггет', 'field': 'nugget', 'expr': 'wp.nugget', 'edit': True, 'table': 'weld_point', 'col': 'nugget'},
            {'label': 'Вариант', 'field': 'model_variant', 'expr': 'wp.model_variant', 'edit': True, 'table': 'weld_point', 'col': 'model_variant'},
            {'label': 'X', 'field': 'coord_x', 'expr': 'wp.coord_x', 'edit': True, 'table': 'weld_point', 'col': 'coord_x'},
            {'label': 'Y', 'field': 'coord_y', 'expr': 'wp.coord_y', 'edit': True, 'table': 'weld_point', 'col': 'coord_y'},
            {'label': 'Z', 'field': 'coord_z', 'expr': 'wp.coord_z', 'edit': True, 'table': 'weld_point', 'col': 'coord_z'},
            {'label': 'Файл-источник', 'field': 'source_file', 'expr': 'wp.source_file', 'edit': False},
        ],
    },

    # ── Параметры сварки (программы) ──
    'parameters': {
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
    },
}


def doc_list():
    return [{'id': k, 'title': v['title']} for k, v in DOCUMENTS.items()]
