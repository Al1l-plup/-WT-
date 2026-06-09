"""
Импорт плана ТО из Excel History Sheets → таблица maintenance_schedule в DB.
Запускать один раз: python import_schedule.py
"""
import sqlite3, openpyxl, re, os

DB   = r'C:\Users\al.galimov\WeldTeam\BD\extracted_28_05\BD\web site\temp_server\welding_shop.db'
DIR  = r'C:\Users\al.galimov\WeldTeam\ВОПРОСЫ К CLAUDE CODE'

FILES = [
    ('History Sheet Chery.xlsx',    1),
    ('History Sheet GWM.xlsx',      2),
    ('History Sheet Changan.xlsx',  3),
]
EQUIPMENT = {'AC пистолет', 'DC пистолет'}

db = sqlite3.connect(DB)
db.execute('''CREATE TABLE IF NOT EXISTS maintenance_schedule (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    gun_id       INTEGER NOT NULL,
    brand_id     INTEGER NOT NULL,
    month_number INTEGER NOT NULL,
    plan_type    TEXT,
    UNIQUE(gun_id, month_number)
)''')
db.commit()

inserted, replaced, skipped_equip, not_found = 0, 0, 0, []

for fname, brand_id in FILES:
    path = os.path.join(DIR, fname)
    brand_label = fname.replace('History Sheet ', '').replace('.xlsx', '')
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active

    for row in ws.iter_rows(min_row=4, values_only=True):
        equip = row[2]
        raw_id = row[3]

        if equip not in EQUIPMENT:
            skipped_equip += 1
            continue
        if not raw_id:
            continue
        m = re.match(r'G\.(\d+)', str(raw_id))
        if not m:
            continue

        g_num = int(m.group(1))
        gun_row = db.execute('SELECT UniqueID FROM gun WHERE g_num=?', (g_num,)).fetchone()
        if not gun_row:
            not_found.append((brand_label, g_num, raw_id))
            continue
        gun_id = gun_row[0]

        for month in range(1, 13):
            col = 4 + (month - 1) * 3  # 0-indexed plan_type column
            plan_type = row[col] if col < len(row) else None
            if not plan_type:
                continue
            existing = db.execute(
                'SELECT id FROM maintenance_schedule WHERE gun_id=? AND month_number=?',
                (gun_id, month)
            ).fetchone()
            db.execute(
                'INSERT OR REPLACE INTO maintenance_schedule (gun_id, brand_id, month_number, plan_type) VALUES (?,?,?,?)',
                (gun_id, brand_id, month, str(plan_type))
            )
            if existing:
                replaced += 1
            else:
                inserted += 1

db.commit()
db.close()

print(f'Inserted:  {inserted}')
print(f'Replaced:  {replaced}')
print(f'Not found in gun table ({len(set(x[1] for x in not_found))} unique g_nums):')
shown = set()
for brand, gnum, orig in not_found:
    if gnum not in shown:
        print(f'  {brand}: {orig} (g_num={gnum})')
        shown.add(gnum)
    if len(shown) >= 20:
        print(f'  ... и ещё {len(set(x[1] for x in not_found)) - 20}')
        break
