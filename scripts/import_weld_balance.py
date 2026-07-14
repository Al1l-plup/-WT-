"""Импорт полного Weld Balance из .xlsm в БД (нормализованный слой).

Читает лист ``Welds`` каждого файла и наполняет weld_point / weld_point_part / wb_material.
Существующие таблицы не изменяет; связи с model/gun/station/spot — best-effort (nullable).

Использование:
    python scripts/import_weld_balance.py "<dir с .xlsm>"            # dry-run (отчёт, без записи)
    python scripts/import_weld_balance.py "<dir>" --apply           # запись в data/welding_shop.db
    python scripts/import_weld_balance.py "<dir>" --apply --db X.db  # в указанную БД

Колонки листа Welds (0..51 одинаковы во всех файлах; [52] 'Models' — только у мультимодельных).
Всё неучтённое пишется в weld_point.raw_extra (JSON), чтобы не терять данные.
"""
import argparse
import glob
import json
import os
import re
import sqlite3
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from app.migrations import run_migrations  # noqa: E402

HEADER_ROW = 2   # заголовок листа Welds
DATA_ROW = 3     # данные с этой строки
EMPTY_STOP = 100 # столько подряд пустых строк = конец данных

BAD = {'#N/A', '#REF!', '#VALUE!', '#DIV/0!', '#NAME?', '#NULL!', ''}

# Фиксированный индекс колонки -> поле weld_point (проверяется валидацией заголовка).
IDX = {
    'sh_num': 0, 'zone': 1, 'wb_station': 2, 'process_no': 3, 'operation_name': 4,
    'stage_no': 5, 'welding_type': 6, 'gun_type': 7, 'gun_mntc': 8, 'spot_number': 9,
    'side': 10, 'std_thickness': 27, 'coating': 28, 'lme_hold': 29, 'nugget': 30,
    'check_mark': 31, 'important': 32, 'chisel_access': 33, 'change_index': 38,
    'spec': 39, 'wp_stack_info': 41, 'variant_1': 45, 'variant_2': 46, 'variant_3': 47,
    'variant_4': 48, 'coord_x': 49, 'coord_y': 50, 'coord_z': 51, 'model_variant': 52,
}
# Детали: layer_no -> (name, number, material, coating, thk).
PART_GROUPS = {1: (11, 12, 13, 14, 15), 2: (16, 17, 18, 19, 20), 3: (21, 22, 23, 24, 25)}
# Неучтённые колонки -> ключ в raw_extra.
RAW_EXTRA = {26: 'stuck', 34: 'mark1', 35: 'mark2', 36: 'mark3', 37: 'coord_laser',
             40: 'check2', 42: 'check_all_points', 43: 'check_work_process',
             44: 'a_list_revised'}
# Проверка заголовка: индекс -> подстрока, которая обязана присутствовать.
HEADER_CHECK = {7: 'ПИСТОЛЕТА', 9: 'ТОЧКИ', 13: 'МАТЕР', 49: 'X'}

# Токен в имени файла -> model_code в БД. Порядок важен: 'CS55' раньше 'CS65'
# ('CS655' в имени содержит подстроку 'CS65'); P01 в БД имеет код 'P01G'.
FILE_TOKENS = [('A13T', 'A13T'), ('A01', 'A01'), ('P01', 'P01G'), ('CS55', 'CS55'), ('CS65', 'CS65')]

# Некорректные файлы — пропускаем при импорте. Файл changan «cs65» оказался полной копией «cs55»
# (дубликат), поэтому импортируем только cs55. Точный маркер 'cs65.xlsm' не задевает 'cs55.xlsm'
# и платформенный код 'CS655'. Удалите отсюда, когда появится корректный отдельный файл cs65.
SKIP_FILES = ['cs65.xlsm']

WELD_POINT_COLS = [
    'model_id', 'model_variant', 'source_file', 'sh_num', 'zone', 'wb_station', 'process_no',
    'operation_name', 'stage_no', 'welding_type', 'side', 'joint_type', 'gun_type', 'gun_mntc',
    'gun_id', 'station_id', 'spot_number', 'spot_id', 'spot_number_op', 'std_thickness', 'coating',
    'lme_hold', 'nugget', 'check_mark', 'important', 'chisel_access', 'spec', 'change_index',
    'wp_stack_info', 'variant_1', 'variant_2', 'variant_3', 'variant_4', 'coord_x', 'coord_y',
    'coord_z', 'raw_extra', 'row_order',
]


def clean(v):
    """Привести значение ячейки к строке или None (мусорные значения Excel -> None)."""
    if v is None:
        return None
    if isinstance(v, str):
        v = v.strip()
        return None if v in BAD else v
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


def file_model_code(path: str) -> str | None:
    name = os.path.basename(path).upper()
    for token, code in FILE_TOKENS:
        if token in name:
            return code
    return None


def validate_header(ws, path: str) -> None:
    header = next(ws.iter_rows(min_row=HEADER_ROW, max_row=HEADER_ROW, values_only=True))
    for idx, must in HEADER_CHECK.items():
        cell = str(header[idx] or '').upper()
        if must.upper() not in cell:
            raise ValueError(f"{os.path.basename(path)}: заголовок col{idx}={cell!r} не содержит {must!r} "
                             f"— структура листа Welds отличается, импорт остановлен.")


def parse_file(path: str) -> dict:
    """Разобрать один файл -> {'code', 'rows': [record...]}. record без DB-связей."""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb['Welds']
    validate_header(ws, path)
    code = file_model_code(path)
    src = os.path.basename(path)

    rows = []
    empty = 0
    for r in ws.iter_rows(min_row=DATA_ROW, max_row=ws.max_row, values_only=True):
        key = [clean(r[i]) for i in (6, 7, 8, 9)]  # welding_type, gun_type, mntc, spot
        if not any(key):
            empty += 1
            if empty >= EMPTY_STOP:
                break
            continue
        empty = 0

        def g(field):
            i = IDX[field]
            return clean(r[i]) if i < len(r) else None

        rec = {c: None for c in WELD_POINT_COLS}
        rec['source_file'] = src
        for field in IDX:
            rec[field] = g(field)
        # детали
        parts = []
        for layer, cols in PART_GROUPS.items():
            pn, pnum, pmat, pcoat, pthk = (clean(r[c]) if c < len(r) else None for c in cols)
            if any((pn, pnum, pmat, pthk)):
                parts.append({'layer_no': layer, 'part_name': pn, 'part_number': pnum,
                              'material': pmat, 'coating': pcoat, 'thickness': pthk})
        rec['_parts'] = parts
        # raw_extra
        extra = {}
        for i, keyname in RAW_EXTRA.items():
            val = clean(r[i]) if i < len(r) else None
            if val is not None:
                extra[keyname] = val
        rec['raw_extra'] = json.dumps(extra, ensure_ascii=False) if extra else None
        rec['row_order'] = float(len(rows) + 1)  # порядок строки листа Excel
        rows.append(rec)

    wb.close()
    return {'code': code, 'src': src, 'rows': rows}


# ── связи с БД ──────────────────────────────────────────────────────────────
def resolve_model_map(db):
    """model_code -> [UniqueID...] из справочника model."""
    m = {}
    for uid, code in db.execute("SELECT UniqueID, model_code FROM model"):
        m.setdefault((code or '').upper(), []).append(uid)
    return m


def link_row(db, rec, model_ids, gun_cache, spot_cache):
    # model_id: если у кода одна модель — ставим; если несколько (A01/P01) — оставляем NULL (+variant)
    rec['model_id'] = model_ids[0] if len(model_ids) == 1 else None
    # gun по MNTC G.NNN -> g_num
    mntc = rec.get('gun_mntc') or ''
    mm = re.search(r'G[.\s]*0*(\d+)', mntc)
    if mm:
        gnum = int(mm.group(1))
        rec['gun_id'] = gun_cache.get(gnum)
    # spot по (model_id, spot_number)
    sn = rec.get('spot_number')
    if rec['model_id'] is not None and sn is not None:
        try:
            rec['spot_id'] = spot_cache.get((rec['model_id'], int(float(sn))))
        except (ValueError, TypeError):
            pass


def build_caches(db):
    gun_cache = {gnum: uid for uid, gnum in db.execute("SELECT UniqueID, g_num FROM gun")}
    spot_cache = {(mid, num): uid for uid, num, mid in
                  db.execute("SELECT UniqueID, spot_number, model_id FROM spot")}
    return gun_cache, spot_cache


def ensure_cs65(db, apply: bool) -> int | None:
    row = db.execute("SELECT UniqueID FROM model WHERE UPPER(model_code)='CS65'").fetchone()
    if row:
        return row[0]
    if not apply:
        return None
    brand = db.execute("SELECT UniqueID FROM brand WHERE brand='Changan'").fetchone()
    cur = db.execute(
        "INSERT INTO model (model_name, model_code, type, brand_id) VALUES ('CS65','CS65','single',?)",
        (brand[0] if brand else None,))
    db.commit()
    return cur.lastrowid


# ── основной процесс ────────────────────────────────────────────────────────
def run(directory: str, db_path: str, apply: bool) -> None:
    files = sorted(glob.glob(os.path.join(directory, '*.xlsm')) +
                   glob.glob(os.path.join(directory, '*.xlsx')))
    skipped = [f for f in files if any(s.upper() in os.path.basename(f).upper() for s in SKIP_FILES)]
    files = [f for f in files if f not in skipped]
    for f in skipped:
        print(f'ПРОПУЩЕН (некорректный): {os.path.basename(f)}')
    if not files:
        sys.exit(f'Нет .xlsm/.xlsx в {directory}')

    run_migrations(db_path)  # гарантируем схему
    db = sqlite3.connect(db_path)
    if apply:
        from app.audit import drop_audit_triggers
        drop_audit_triggers(db)  # bulk-загрузка — не засоряем журнал версий
    model_map = resolve_model_map(db)
    gun_cache, spot_cache = build_caches(db)
    materials = {n: mid for mid, n in db.execute("SELECT id, name FROM wb_material")}

    total = 0
    print(f"{'файл':45} {'строк':>6} {'model':>12} {'gun%':>6} {'spot%':>7}  варианты")
    for path in files:
        data = parse_file(path)
        code = data['code']
        model_ids = model_map.get((code or '').upper(), [])
        if code == 'CS65' and not model_ids:
            cs = ensure_cs65(db, apply)
            model_ids = [cs] if cs else []
        rows = data['rows']
        gmatch = smatch = 0
        variants = {}
        for rec in rows:
            link_row(db, rec, model_ids, gun_cache, spot_cache)
            if rec['gun_id']:
                gmatch += 1
            if rec['spot_id']:
                smatch += 1
            v = rec.get('model_variant')
            if v:
                variants[v] = variants.get(v, 0) + 1
        n = len(rows)
        total += n
        gp = f"{100*gmatch//n if n else 0}%"
        sp = f"{100*smatch//n if n else 0}%"
        vs = ', '.join(f'{k}:{c}' for k, c in list(variants.items())[:4]) or '—'
        print(f"{data['src'][:45]:45} {n:6} {str(model_ids):>12} {gp:>6} {sp:>7}  {vs}")

        if apply:
            _write(db, data['src'], rows, materials)

    if apply:
        db.commit()
        print(f"\nЗАПИСАНО. weld_point={db.execute('SELECT COUNT(*) FROM weld_point').fetchone()[0]}, "
              f"weld_point_part={db.execute('SELECT COUNT(*) FROM weld_point_part').fetchone()[0]}, "
              f"wb_material={db.execute('SELECT COUNT(*) FROM wb_material').fetchone()[0]}")
    else:
        print(f"\nDRY-RUN: всего строк {total}. Записи нет (добавьте --apply).")
    db.close()


def _material_id(db, materials, name):
    if not name:
        return None
    if name not in materials:
        cur = db.execute("INSERT INTO wb_material (name) VALUES (?)", (name,))
        materials[name] = cur.lastrowid
    return materials[name]


def _write(db, src, rows, materials):
    # идемпотентность: перезаписываем этот источник
    db.execute("DELETE FROM weld_point_part WHERE weld_point_id IN "
               "(SELECT id FROM weld_point WHERE source_file=?)", (src,))
    db.execute("DELETE FROM weld_point WHERE source_file=?", (src,))
    for rec in rows:
        vals = [rec[c] for c in WELD_POINT_COLS]
        ph = ','.join('?' * len(WELD_POINT_COLS))
        cur = db.execute(f"INSERT INTO weld_point ({','.join(WELD_POINT_COLS)}) VALUES ({ph})", vals)
        wp_id = cur.lastrowid
        for p in rec['_parts']:
            db.execute(
                "INSERT INTO weld_point_part (weld_point_id, layer_no, part_name, part_number, "
                "material_id, coating, thickness) VALUES (?,?,?,?,?,?,?)",
                (wp_id, p['layer_no'], p['part_name'], p['part_number'],
                 _material_id(db, materials, p['material']), p['coating'], p['thickness']))


def main() -> None:
    ap = argparse.ArgumentParser(description='Импорт Weld Balance (.xlsm) в БД.')
    ap.add_argument('directory', help='папка с файлами .xlsm')
    ap.add_argument('--apply', action='store_true', help='записать в БД (иначе dry-run)')
    ap.add_argument('--db', default=str(ROOT / 'data' / 'welding_shop.db'), help='путь к БД')
    args = ap.parse_args()
    run(args.directory, args.db, args.apply)


if __name__ == '__main__':
    main()
