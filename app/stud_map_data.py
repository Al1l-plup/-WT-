"""3D-карта дефектов шпилек: сборка defects.json из Excel-реестра цеха.

Источник — «Stud_Defect_Register_BS_rev*.xlsx», лист «Реестр дефектов» (+ выпуск из листов
«WEEKLY ANALYSIS» и «Graphs», необязательно — листы «Выпуск» и «Шпильки на станциях»).
Результат — JSON, который читает карта (app/static/stud-map/): строки дефектов + выпуск.

Данные реестра (номера кузовов, дефекты) и схемы OEM в git НЕ хранятся — они лежат на
сервере в data/stud_map/ (рядом с БД) и отдаются только вошедшим пользователям.
"""
import datetime as dt
import json
import os
import re
import warnings

BRAND = {'A01': 'GWM', 'P01': 'GWM', 'CS55p': 'Changan', 'A13T': 'Chery'}
CAT = {
    'Склейка / Stick Weld (SW)': 'Непровар (SW)',   # «склейка» — это непровар (Stick Weld)
    'Отсутствует / Missing': 'Отсутствует',
    'Сломана (по резьбе) / Broken (thread)': 'Сломана по резьбе',
    'Погнута / Bent': 'Погнута',
    'Сорвана (сварка ок) / Torn off (weld ok)': 'Сорвана (сварка ок)',
    'Смещение шпильки / Displacement': 'Смещение',
}
MASS_MIN = 10            # кузов с ≥10 дефектными шпильками за день — «массовое событие»
REGISTER_SHEET = 'Реестр дефектов'

# Файлы карты, которые лежат в data/stud_map/ (не в git). Остальное — код в app/static/stud-map/.
DATA_FILES = ('defects.json', 'body.json', 'views.json')
DATA_DIRS = ('body', 'img', 'parts')


class RegisterError(ValueError):
    """Файл не похож на реестр дефектов шпилек (сообщение — для пользователя)."""


def _date(v):
    if isinstance(v, dt.datetime):
        return v.date()
    if isinstance(v, dt.date):
        return v
    if isinstance(v, str):
        m = re.fullmatch(r'\s*(\d{1,2})[./](\d{1,2})[./](\d{4})\s*', v)
        if m:
            try:
                return dt.date(int(m[3]), int(m[2]), int(m[1]))
            except ValueError:
                return None
    return None


def _num(v):
    try:
        return float(v) if v not in (None, '') else None
    except (TypeError, ValueError):
        return None


def _week_key(v):
    """W43 / 2026-W43 / 43 / '43' -> 'W43'."""
    if v is None:
        return None
    t = str(v).strip().upper().split('-')[-1].replace('W', '').replace('.0', '')
    return f'W{int(t):02d}' if t.isdigit() else None


def _sheet(books, name):
    """Лист по имени (без учёта регистра/пробелов) — в первой книге, где он есть."""
    for wb in books:
        for sn in wb.sheetnames:
            if sn.strip().lower() == name.lower():
                return wb[sn]
    return None


def build(register_path, extra_path=None, source_name=None):
    """Собрать данные карты из реестра. Возвращает (data, notes): data — dict для defects.json,
    notes — список строк-пояснений (что найдено / чего не хватает)."""
    import openpyxl  # ленивый импорт: нужен только при обновлении данных

    warnings.filterwarnings('ignore', module='openpyxl')
    try:
        reg = openpyxl.load_workbook(register_path, data_only=True)
    except Exception as e:  # noqa: BLE001 — битый/не тот файл → понятная ошибка пользователю
        raise RegisterError('Не удалось открыть файл как Excel (.xlsx)') from e
    books = ([openpyxl.load_workbook(extra_path, data_only=True)] if extra_path else []) + [reg]
    ws = _sheet([reg], REGISTER_SHEET)
    if ws is None:
        raise RegisterError(f'В файле нет листа «{REGISTER_SHEET}»')

    rows, skipped = [], 0
    for r in ws.iter_rows(min_row=2, values_only=True):
        r = list(r) + [None] * max(0, 15 - len(r))
        n, vin, model, date = r[0], r[1], r[2], r[3]
        cat, source, loc, qty, stud_no = r[8], r[9], r[10], r[11], r[14]
        if vin in (None, '') and model in (None, '') and date is None:
            continue
        if not qty or model not in BRAND:
            continue
        d = _date(date)
        q = _num(qty)
        if d is None or not q:
            skipped += 1
            continue
        body = str(vin).strip().lstrip('0') if vin not in (None, '') else ''
        sn = _num(stud_no)
        rows.append({
            'n': n, 'body_no': body or None, 'model': model, 'brand': BRAND[model],
            'date': d.isoformat(), 'week': f'W{d.isocalendar()[1]:02d}',
            'category': CAT.get((cat or '').strip(), (cat or '').strip() or 'Не указано'),
            'source': source or 'Не указано', 'location': loc or 'Не указано', 'studs': int(q),
            'stud_no': int(sn) if sn is not None else None,
        })
    if not rows:
        raise RegisterError(f'На листе «{REGISTER_SHEET}» нет ни одной строки дефекта')

    tot = {}
    for x in rows:
        k = f"{x['model']}|{x['body_no'] or '?'}|{x['date']}"
        tot[k] = tot.get(k, 0) + x['studs']
    for x in rows:
        x['mass'] = tot[f"{x['model']}|{x['body_no'] or '?'}|{x['date']}"] >= MASS_MIN

    volume, station = {}, {}
    ws_v = _sheet(books, 'Выпуск')
    if ws_v is not None:
        hdr = [str(c).strip() if c is not None else '' for c in next(ws_v.iter_rows(min_row=1, max_row=1, values_only=True))]
        cols = {i: m for i, h in enumerate(hdr) for m in BRAND if h.split()[0:1] == [m] or h == m}
        for r in ws_v.iter_rows(min_row=2, values_only=True):
            w = _week_key(r[0])
            for i, m in cols.items():
                v = _num(r[i]) if i < len(r) else None
                if w and v and v > 0:
                    volume.setdefault(m, {})[w] = int(v)
    ws_s = _sheet(books, 'Шпильки на станциях')
    if ws_s is not None:
        for r in ws_s.iter_rows(min_row=2, values_only=True):
            r = list(r) + [None] * 3
            m, st, v = (str(r[0]).strip() if r[0] else None), (str(r[1]).strip() if r[1] else None), _num(r[2])
            if m in BRAND and st and v and v > 0:
                station.setdefault(m, {})[st] = int(v)

    # Выпуск из самого реестра: «WEEKLY ANALYSIS» — «Объём производства» по неделям (все модели),
    # скрытый лист «Graphs» — «Выпущено» по моделям за весь период.
    volume_all, volume_model_total = {}, {}
    wa = _sheet(books, 'WEEKLY ANALYSIS')
    if wa is not None:
        grid = [list(r) for r in wa.iter_rows(values_only=True)]
        hdr = next((r for r in grid if any(_week_key(c) for c in r[1:] if isinstance(c, str))), None)
        vol = next((r for r in grid if r and isinstance(r[0], str) and r[0].strip().lower().startswith('объём производства')), None)
        if hdr and vol:
            for h, v in zip(hdr[1:], vol[1:]):
                w, q = (_week_key(h) if isinstance(h, str) else None), _num(v)
                if w and q and q > 0:
                    volume_all[w] = int(q)
    gr = _sheet(books, 'Graphs')
    if gr is not None:
        grid = [list(r) for r in gr.iter_rows(values_only=True)]
        for i, r in enumerate(grid):
            if 'Модель' in r and 'Выпущено' in r:
                cm, cv = r.index('Модель'), r.index('Выпущено')
                for rr in grid[i + 1:]:
                    m, q = rr[cm], _num(rr[cv])
                    if m in BRAND and q and q > 0:
                        volume_model_total[m] = int(q)
                break

    name = source_name or os.path.basename(str(register_path))
    data = {'source': f'{name} — лист «{REGISTER_SHEET}»', 'rows': rows,
            'updated': dt.datetime.now().isoformat(timespec='seconds')}
    if volume_all:
        data['volumeAll'] = volume_all
    if volume_model_total:
        data['volumeModelTotal'] = volume_model_total
    if volume:
        data['volume'] = volume
    if station:
        data['stationStuds'] = station

    notes = [f'{len(rows)} строк, {sum(x["studs"] for x in rows)} дефектных шпилек']
    if skipped:
        notes.append(f'пропущено строк без даты/количества: {skipped}')
    weeks = sorted({x['week'] for x in rows})
    notes.append('недели: ' + ', '.join(weeks))
    miss = [w for w in weeks if w not in volume_all]
    if volume_all and miss:
        notes.append('нет выпуска (WEEKLY ANALYSIS) за ' + ', '.join(miss))
    if not volume_all:
        notes.append('выпуск по неделям не найден (лист WEEKLY ANALYSIS) — проценты не считаются')
    return data, notes


def write(data, out_dir):
    """Записать defects.json атомарно (карта никогда не читает недописанный файл)."""
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, 'defects.json')
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(tmp, path)
    return path
