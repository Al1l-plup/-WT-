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


# ── статические документы ──
_EQUIPMENT_DOC = {
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
         'expr': "(SELECT GROUP_CONCAT(DISTINCT g.g_num) FROM welding_setup ws "
                 "JOIN gun g ON ws.gun_id=g.UniqueID WHERE ws.parameter_id=p.UniqueID AND ws.is_active=1)"},
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
    return docs


def doc_list(db):
    return [{'id': k, 'title': v['title'], 'wb_tab_id': v.get('wb_tab_id')}
            for k, v in get_documents(db).items()]


def resolve_weld_point_links(db, wp_ids) -> None:
    """Авто-привязка строк Weld Balance к справочникам (как делает импортёр):
    'Клещи (G)' G.NNN → gun.g_num → gun_id;  (model_id, № точки) → spot → spot_id.
    Не нашли — оставляем NULL (не ошибка)."""
    for wp_id in wp_ids:
        row = db.execute('SELECT gun_mntc, model_id, spot_number FROM weld_point WHERE id=?',
                         (wp_id,)).fetchone()
        if not row:
            continue
        gun_mntc, model_id, spot_number = row[0], row[1], row[2]
        gun_id = None
        m = re.search(r'G[.\s]*0*(\d+)', gun_mntc or '')
        if m:
            g = db.execute('SELECT UniqueID FROM gun WHERE g_num=?', (int(m.group(1)),)).fetchone()
            gun_id = g[0] if g else None
        spot_id = None
        if model_id is not None and spot_number not in (None, ''):
            try:
                s = db.execute('SELECT UniqueID FROM spot WHERE model_id=? AND spot_number=?',
                               (model_id, int(float(spot_number)))).fetchone()
                spot_id = s[0] if s else None
            except (ValueError, TypeError):
                pass
        db.execute('UPDATE weld_point SET gun_id=?, spot_id=? WHERE id=?', (gun_id, spot_id, wp_id))
