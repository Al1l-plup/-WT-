"""Грид Weld Balance = зеркало Excel: порядок колонок под Ctrl+V, запись деталей
слоёв (weld_point_part) и служебных колонок (raw_extra) через плоские колонки."""
import sqlite3

from tests.test_admin_docs import wb_doc


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def test_wb_columns_mirror_excel_order(client):
    """Первые 53 колонки идут в порядке листа Excel; заблокированные — в конце."""
    doc = wb_doc(client, 'A13T')
    cols = client.get(f'/api/admin/doc/{doc}?limit=1').get_json()['columns']
    fields = [c['field'] for c in cols]
    # начало (col0-10) и «Models» на позиции 52 — как в Excel
    assert fields[:11] == ['sh_num', 'zone', 'wb_station', 'process_no', 'operation_name',
                           'stage_no', 'welding_type', 'gun_type', 'gun_mntc', 'spot_number', 'side']
    # детали слоёв на позициях 11-25
    assert fields[11:26] == [f'part{lyr}_{s}' for lyr in (1, 2, 3)
                             for s in ('name', 'num', 'mat', 'coat', 'thk')]
    assert fields[52] == 'model_variant'
    # заблокированные/внутренние поля — после 53-й колонки
    tail = {c['field']: c['editable'] for c in cols[53:]}
    assert tail['gun_id'] is False and tail['spot_id'] is False and tail['source_file'] is False
    assert 'model_code' in tail  # внутреннее поле в конце, не среди 53 «эксельных»


def test_wb_insert_writes_parts_and_raw(client, app):
    """Вставка строки с плоскими колонками деталей и служебными → weld_point_part + raw_extra."""
    doc = wb_doc(client, 'A13T')
    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [{'op': 'insert', 'values': {
        'gun_mntc': 'G.1', 'spot_number': '95001', 'model_code': 'A13T', 'zone': 'pastez',
        'part1_name': 'PLATE A', 'part1_mat': 'HC340', 'part1_thk': '1.4',
        'part2_name': 'BEAM B', 'part2_mat': 'HC340', 'part2_coat': 'GI',
        'x_stuck': '3', 'x_m1': 'mark-one', 'x_allpts': 'TPQC'}}]})
    assert r.get_json()['status'] == 'success'

    db = _db(app)
    wp_id = db.execute("SELECT id FROM weld_point WHERE zone='pastez'").fetchone()[0]
    parts = db.execute("""SELECT p.layer_no, p.part_name, m.name, p.coating, p.thickness
                          FROM weld_point_part p LEFT JOIN wb_material m ON p.material_id=m.id
                          WHERE p.weld_point_id=? ORDER BY p.layer_no""", (wp_id,)).fetchall()
    assert parts == [(1, 'PLATE A', 'HC340', None, '1.4'),
                     (2, 'BEAM B', 'HC340', 'GI', None)]
    # материал дедуплицирован (один wb_material на два слоя)
    assert db.execute("SELECT COUNT(*) FROM wb_material WHERE name='HC340'").fetchone()[0] == 1
    # служебные колонки Excel ушли в raw_extra
    raw = db.execute("SELECT json_extract(raw_extra,'$.stuck'), json_extract(raw_extra,'$.mark1'), "
                     "json_extract(raw_extra,'$.check_all_points') FROM weld_point WHERE id=?",
                     (wp_id,)).fetchone()
    assert raw == ('3', 'mark-one', 'TPQC')

    # и всё это читается обратно через грид (плоские колонки)
    row = next(r for r in client.get(f'/api/admin/doc/{doc}?q=pastez&limit=5').get_json()['rows']
               if r['zone'] == 'pastez')
    assert row['part1_name'] == 'PLATE A' and row['part1_mat'] == 'HC340'
    assert row['x_stuck'] == '3' and row['x_allpts'] == 'TPQC'


def test_wb_update_part_and_clear_raw(client, app):
    doc = wb_doc(client, 'A13T')
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [{'op': 'insert', 'values': {
        'spot_number': '95002', 'model_code': 'A13T', 'zone': 'upd',
        'part1_name': 'OLD', 'x_stuck': '9'}}]})
    db = _db(app)
    wp_id = db.execute("SELECT id FROM weld_point WHERE zone='upd'").fetchone()[0]

    # правка детали слоя 1 и очистка служебной колонки
    r = client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'update', 'field': 'part1_name', 'value': 'NEW', 'row_pks': {'weld_point': wp_id}},
        {'op': 'update', 'field': 'part1_mat', 'value': 'STEEL9', 'row_pks': {'weld_point': wp_id}},
        {'op': 'update', 'field': 'x_stuck', 'value': '', 'row_pks': {'weld_point': wp_id}}]})
    assert r.get_json()['status'] == 'success'

    db = _db(app)
    part = db.execute("""SELECT p.part_name, m.name FROM weld_point_part p
                         LEFT JOIN wb_material m ON p.material_id=m.id
                         WHERE p.weld_point_id=? AND p.layer_no=1""", (wp_id,)).fetchone()
    assert part == ('NEW', 'STEEL9')  # деталь обновлена, материал заведён и привязан
    stuck = db.execute("SELECT json_extract(raw_extra,'$.stuck') FROM weld_point WHERE id=?",
                       (wp_id,)).fetchone()[0]
    assert stuck is None  # пустое значение удалило ключ из raw_extra


def test_wb_paste_full_excel_row(client, app):
    """Смоделировать Ctrl+V строки из Excel: значения по позициям попадают в свои поля,
    включая детали и служебные, без сдвига колонок."""
    doc = wb_doc(client, 'A13T')
    # завести пустую строку и получить её pk
    client.post(f'/api/admin/doc/{doc}/batch', json={'changes': [
        {'op': 'insert', 'values': {'zone': 'rowpaste', 'model_code': 'A13T'}}]})
    db = _db(app)
    wp_id = db.execute("SELECT id FROM weld_point WHERE zone='rowpaste'").fetchone()[0]

    # «вставка» = набор update по полям (как формирует sheet.js из TSV)
    pasted = {'sh_num': '1', 'wb_station': 'EC2-15', 'gun_mntc': 'G.1', 'spot_number': '95003',
              'part1_name': 'P1', 'part3_thk': '2.0', 'x_stuck': '7', 'coord_x': '-1.5',
              'model_variant': 'A13T'}
    changes = [{'op': 'update', 'field': f, 'value': v, 'row_pks': {'weld_point': wp_id}}
               for f, v in pasted.items()]
    assert client.post(f'/api/admin/doc/{doc}/batch', json={'changes': changes}).get_json()['status'] == 'success'

    row = next(r for r in client.get(f'/api/admin/doc/{doc}?q=rowpaste&limit=5').get_json()['rows']
               if r['zone'] == 'rowpaste')
    for f, v in pasted.items():
        assert str(row[f]) == v, f'{f}: {row[f]!r} != {v!r}'
