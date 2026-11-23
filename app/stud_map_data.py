"""3D-карта дефектов шпилек: данные карты (defects.json) из двух источников.

1. Excel-реестр цеха «Stud_Defect_Register_BS_rev*.xlsx» — лист «Реестр дефектов» (+ выпуск из
   листов «WEEKLY ANALYSIS» и «Graphs», необязательно — «Выпуск» и «Шпильки на станциях»).
   Файл лежит в папке данных на сервере (data/stud_map/register.xlsx); через сайт не загружается.
2. Записи раздела «Шпильки» (таблица stud_defect): QR машины → шпилька → фото (site_rows).

Данные реестра (номера кузовов, дефекты) и схемы OEM в git НЕ хранятся — они лежат на
сервере в data/stud_map/ (рядом с БД) и отдаются только вошедшим пользователям.

Неделя — ISO-неделя С ГОДОМ: '2026-W46' (без года недели разных лет склеивались, а после
нового года W01 вставала перед W46). Карта показывает её коротко — «W46».
"""
import datetime as dt
import os
import re
import warnings
from collections import Counter

BRAND = {'A01': 'GWM', 'P01': 'GWM', 'CS55p': 'Changan', 'A13T': 'Chery'}
# Схема раздела «Шпильки» (stud_scheme.code) → модель карты. Номера шпилек у них общие:
# номер на карте = номер цеха (stud.shop_no).
SCHEME_MODEL = {'A13T': 'A13T', 'A01': 'A01', 'P01G': 'P01', 'CS55': 'CS55p'}
# Категория в реестре («рус / англ») → короткое имя на карте. Список коротких имён должен
# совпадать со списком категорий карты (key:"…" в app/static/stud-map/app.*.js) — это проверяет тест.
CAT = {
    'Склейка / Stick Weld (SW)': 'Непровар (SW)',   # «склейка» — это непровар (Stick Weld)
    'Отсутствует / Missing': 'Отсутствует',
    'Сломана (по резьбе) / Broken (thread)': 'Сломана по резьбе',
    'Погнута / Bent': 'Погнута',
    'Сорвана (сварка ок) / Torn off (weld ok)': 'Сорвана (сварка ок)',
    'Смещение шпильки / Displacement': 'Смещение',
}
UNKNOWN_CAT = 'Не указано'
CATEGORIES = tuple(CAT.values()) + (UNKNOWN_CAT,)
# Категория записи сайта (app.studs.CATEGORIES, ставят ИТО/УЗК при разборе) → категория карты.
# Запись, которую ещё не разобрали, на карте — «Не указано».
SITE_CAT = {
    'stick': 'Непровар (SW)',
    'missing': 'Отсутствует',
    'broken': 'Сломана по резьбе',
    'bent': 'Погнута',
    'torn': 'Сорвана (сварка ок)',
    'shifted': 'Смещение',
}
MASS_MIN = 10            # кузов с ≥10 дефектными шпильками за день — «массовое событие»
REGISTER_SHEET = 'Реестр дефектов'
REGISTER_FILE = 'register.xlsx'   # реестр в папке данных карты (data/stud_map/)

# Файлы карты, которые лежат в data/stud_map/ (не в git). Остальное — код в app/static/stud-map/.
# defects.json — не файл: собирается на лету (реестр + записи сайта).
DATA_FILES = ('body.json', 'views.json')
DATA_DIRS = ('body', 'img', 'parts')


class RegisterError(ValueError):
    """Файл не похож на реестр дефектов шпилек (сообщение — для пользователя)."""


def _norm(v):
    """Ключ для сравнения текста из Excel: без регистра, лишних пробелов и «ё»."""
    return re.sub(r'\s+', ' ', str(v)).strip().lower().replace('ё', 'е')


# Категорию узнаём по полной записи реестра, по русской или английской половине
# и по короткому имени карты: «Смещение шпильки», «Displacement», «смещение» → «Смещение».
_CAT_LOOKUP = {}
for _full, _short in CAT.items():
    for _k in (_full, _short, *_full.split(' / ')):
        _CAT_LOOKUP[_norm(_k)] = _short
_CAT_LOOKUP[_norm(UNKNOWN_CAT)] = UNKNOWN_CAT
_CAT_LOOKUP[_norm('Склейка (SW)')] = 'Непровар (SW)'   # прежнее короткое имя на карте

# Модель — без учёта регистра и пробелов: «A13T », «cs55P», «CS55 p» → ключ BRAND.
_MODEL_LOOKUP = {_norm(m).replace(' ', ''): m for m in BRAND}


def _category(v):
    """(категория карты, исходный текст или None). Нераспознанное → «Не указано» + исходный текст."""
    if v is None or str(v).strip() == '':
        return UNKNOWN_CAT, None
    cat = _CAT_LOOKUP.get(_norm(v))
    return (cat, None) if cat else (UNKNOWN_CAT, str(v).strip())


def _model(v):
    return _MODEL_LOOKUP.get(_norm(v).replace(' ', '')) if v not in (None, '') else None


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


def _week_key(d):
    """Дата → ISO-неделя с годом: '2026-W46'."""
    y, w, _ = d.isocalendar()
    return f'{y}-W{w:02d}'


def _week_parts(v):
    """W43 / 2026-W43 / 43 / '43' / 43.0 → (год или None, 43); не неделя → None."""
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return (None, int(v)) if float(v).is_integer() and 1 <= v <= 53 else None
    m = re.fullmatch(r'\s*(?:(\d{4})\s*-?\s*)?W?\s*(\d{1,2})(?:\.0)?\s*', str(v), re.IGNORECASE)
    if not m or not 1 <= int(m[2]) <= 53:
        return None
    return (int(m[1]) if m[1] else None, int(m[2]))


def _with_years(parts, row_weeks):
    """Недели листа выпуска (по порядку, слева направо / сверху вниз) → ключи '2026-W46'.

    Год, если в ячейке его нет, выводится из порядка: когда номер недели уменьшается
    (…W52, W53, W01…) — начался следующий год. Стартовый год подбирается так, чтобы недели
    выпуска лучше всего совпали с неделями строк реестра."""
    years = sorted({int(k[:4]) for k in row_weeks}) or [dt.date.today().year]
    candidates = list(dict.fromkeys([years[0]] + [y + dy for y in years for dy in (-1, 0)]))

    def walk(start):
        out, year, prev = [], start, None
        for p in parts:
            if p is None:
                out.append(None)
                continue
            y, n = p
            if y is not None:
                year = y
            elif prev is not None and n < prev:
                year += 1
            prev = n
            out.append(f'{year}-W{n:02d}')
        return out

    return max((walk(y) for y in candidates), key=lambda ks: sum(k in row_weeks for k in ks if k))


def _sheet(books, name):
    """Лист по имени (без учёта регистра/пробелов) — в первой книге, где он есть."""
    for wb in books:
        for sn in wb.sheetnames:
            if sn.strip().lower() == name.lower():
                return wb[sn]
    return None


def _load(path):
    import openpyxl  # ленивый импорт: нужен только при обновлении данных

    with warnings.catch_warnings():
        warnings.simplefilter('ignore')   # openpyxl ругается на расширения/проверку данных Excel
        return openpyxl.load_workbook(path, data_only=True)


def _weeks_label(keys):
    """'2026-W45', '2026-W46' → 'W45, W46 (2026)'; разные годы — полностью."""
    keys = sorted(keys)
    if len({k[:4] for k in keys}) == 1:
        return ', '.join(k[5:] for k in keys) + f' ({keys[0][:4]})'
    return ', '.join(keys)


def build(register_path, extra_path=None, source_name=None):
    """Собрать данные карты из реестра. Возвращает (data, notes): data — dict для defects.json,
    notes — список строк-пояснений (что найдено / чего не хватает / что пропущено)."""
    try:
        reg = _load(register_path)
    except Exception as e:  # noqa: BLE001 — битый/не тот файл → понятная ошибка пользователю
        raise RegisterError('Не удалось открыть файл как Excel (.xlsx)') from e
    books = ([_load(extra_path)] if extra_path else []) + [reg]
    ws = _sheet([reg], REGISTER_SHEET)
    if ws is None:
        raise RegisterError(f'В файле нет листа «{REGISTER_SHEET}»')

    rows, bad_date, no_qty = [], 0, 0
    other_models, raw_cats = Counter(), Counter()
    for r in ws.iter_rows(min_row=2, values_only=True):
        r = list(r) + [None] * max(0, 15 - len(r))
        n, vin, model, date = r[0], r[1], r[2], r[3]
        cat, source, loc, qty, stud_no = r[8], r[9], r[10], r[11], r[14]
        if vin in (None, '') and model in (None, '') and date is None:
            continue                                   # пустая строка
        m = _model(model)
        if m is None:
            other_models[str(model).strip() if model not in (None, '') else '(пусто)'] += 1
            continue
        q = _num(qty)
        if not q:
            no_qty += 1
            continue
        d = _date(date)
        if d is None:
            bad_date += 1
            continue
        body = str(vin).strip().lstrip('0') if vin not in (None, '') else ''
        sn = _num(stud_no)
        category, raw = _category(cat)
        row = {
            'n': n, 'body_no': body or None, 'model': m, 'brand': BRAND[m],
            'date': d.isoformat(), 'week': _week_key(d), 'category': category,
            'source': source or 'Не указано', 'location': loc or 'Не указано', 'studs': int(q),
            'stud_no': int(sn) if sn is not None else None,
        }
        if raw:
            row['category_raw'] = raw
            raw_cats[raw] += 1
        rows.append(row)
    if not rows:
        raise RegisterError(f'На листе «{REGISTER_SHEET}» нет ни одной строки дефекта')

    _mark_mass(rows)

    row_weeks = {x['week'] for x in rows}
    volume, station = {}, {}
    ws_v = _sheet(books, 'Выпуск')
    if ws_v is not None:
        hdr = [str(c).strip() if c is not None else '' for c in next(ws_v.iter_rows(min_row=1, max_row=1, values_only=True))]
        cols = {i: m for i, h in enumerate(hdr) for m in BRAND if h.split()[0:1] == [m] or h == m}
        body_rows = [r for r in ws_v.iter_rows(min_row=2, values_only=True) if r]
        for r, w in zip(body_rows, _with_years([_week_parts(r[0]) for r in body_rows], row_weeks), strict=True):
            for i, m in cols.items():
                v = _num(r[i]) if i < len(r) else None
                if w and v and v > 0:
                    volume.setdefault(m, {})[w] = int(v)
    ws_s = _sheet(books, 'Шпильки на станциях')
    if ws_s is not None:
        for r in ws_s.iter_rows(min_row=2, values_only=True):
            r = list(r) + [None] * 3
            m, st, v = _model(r[0]), (str(r[1]).strip() if r[1] else None), _num(r[2])
            if m and st and v and v > 0:
                station.setdefault(m, {})[st] = int(v)

    # Выпуск из самого реестра: «WEEKLY ANALYSIS» — «Объём производства» по неделям (все модели),
    # скрытый лист «Graphs» — «Выпущено» по моделям за весь период.
    volume_all, volume_model_total = {}, {}
    wa = _sheet(books, 'WEEKLY ANALYSIS')
    if wa is not None:
        grid = [list(r) for r in wa.iter_rows(values_only=True)]
        hdr = next((r for r in grid if any(_week_parts(c) for c in r[1:] if isinstance(c, str))), None)
        vol = next((r for r in grid if r and isinstance(r[0], str) and r[0].strip().lower().startswith('объём производства')), None)
        if hdr and vol:
            parts = [_week_parts(h) if isinstance(h, str) else None for h in hdr[1:]]
            for w, v in zip(_with_years(parts, row_weeks), vol[1:], strict=False):   # строки листа бывают разной длины
                q = _num(v)
                if w and q and q > 0:
                    volume_all[w] = int(q)
    gr = _sheet(books, 'Graphs')
    if gr is not None:
        grid = [list(r) for r in gr.iter_rows(values_only=True)]
        for i, r in enumerate(grid):
            if 'Модель' in r and 'Выпущено' in r:
                cm, cv = r.index('Модель'), r.index('Выпущено')
                for rr in grid[i + 1:]:
                    m, q = _model(rr[cm]), _num(rr[cv])
                    if m and q and q > 0:
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
    if no_qty:
        notes.append(f'пропущено строк без количества шпилек: {no_qty}')
    if bad_date:
        notes.append(f'пропущено строк без даты (или дата не распознана): {bad_date}')
    if other_models:
        notes.append('пропущены модели, которых нет на карте: '
                     + ', '.join(f'{k} — {v}' for k, v in other_models.most_common()))
    if raw_cats:
        notes.append(f'нераспознанные категории (показаны как «{UNKNOWN_CAT}»): '
                     + ', '.join(f'«{k}» — {v}' for k, v in raw_cats.most_common()))
    notes.append('недели: ' + _weeks_label(row_weeks))
    miss = sorted(w for w in row_weeks if w not in volume_all)
    if volume_all and miss:
        notes.append('нет выпуска (WEEKLY ANALYSIS) за ' + _weeks_label(miss))
    if not volume_all:
        notes.append('выпуск по неделям не найден (лист WEEKLY ANALYSIS) — проценты не считаются')
    return data, notes


def _mark_mass(rows):
    """«Массовое событие» — один кузов за день с ≥ MASS_MIN дефектными шпильками. Без номера
    кузова его не определить: такие строки не склеиваем в общий «кузов ?» и массовыми не помечаем."""
    tot = Counter()
    for x in rows:
        if x['body_no']:
            tot[(x['model'], x['body_no'], x['date'])] += x['studs']
    for x in rows:
        x['mass'] = bool(x['body_no']) and tot[(x['model'], x['body_no'], x['date'])] >= MASS_MIN


def site_rows(records, sources=None, locations=None):
    """Записи раздела «Шпильки» → строки карты. Возвращает (rows, skipped).

    records — словари с полями id, created_at, vin_key, scheme_code, stud_no, shop_no,
    station, category, source (stud_defect + номер цеха и станция шпильки из stud).
    Номер на карте — номер цеха; запись со схемой без карты или с неуточнённым номером
    («6024?» — на карте его нет) пропускается и попадает в skipped.
    Кузов — последние 6 знаков VIN (номера кузова цеха у записи сайта нет).
    Станция — у шпильки в схеме, иначе — та, что чаще у этой шпильки в реестре (locations)."""
    rows, skipped = [], Counter()
    for r in records:
        m = SCHEME_MODEL.get(r['scheme_code'])
        no = str(r['shop_no'] if r['shop_no'] not in (None, '') else r['stud_no'])
        if m is None:
            skipped['схема без карты'] += 1
            continue
        if not no.isdigit():
            skipped['номер шпильки уточняется'] += 1
            continue
        d = dt.date.fromisoformat(str(r['created_at'])[:10])
        loc = r['station'] or (locations or {}).get((m, int(no))) or 'Не указано'
        rows.append({
            'n': None, 'site_id': r['id'], 'body_no': '…' + str(r['vin_key'])[-6:], 'model': m, 'brand': BRAND[m],
            'date': d.isoformat(), 'week': _week_key(d), 'category': SITE_CAT.get(r['category'] or '', UNKNOWN_CAT),
            'source': (sources or {}).get(r['source'] or '') or 'Не указано', 'location': loc, 'studs': 1,
            'stud_no': int(no),
        })
    _mark_mass(rows)
    return rows, skipped


def locations(rows):
    """{(модель, № шпильки): станция} — самая частая станция шпильки в строках реестра."""
    seen = {}
    for x in rows:
        if x.get('stud_no') is not None and x.get('location') not in (None, 'Не указано'):
            seen.setdefault((x['model'], x['stud_no']), Counter())[x['location']] += 1
    return {k: c.most_common(1)[0][0] for k, c in seen.items()}


def combine(register, site):
    """Данные карты: реестр (dict из build или None) + строки записей сайта."""
    data = dict(register) if register else {}
    data['rows'] = list(data.get('rows', [])) + list(site)
    parts = [register['source']] if register else []
    if site:
        parts.append(f'записи сайта — {len(site)}')
    data['source'] = ' + '.join(parts) or 'данных пока нет'
    data['updated'] = dt.datetime.now().isoformat(timespec='seconds')
    return data
