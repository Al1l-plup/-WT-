"""Перечень оборудования — Excel-файл цеха 1:1 → справочник пистолетов и их трансформаторы.

Правила (решение пользователя 2026-10-31):
* Перечень заполняют люди — вставкой из Excel (Ctrl+V), как Weld Balance. Колонки те же,
  что в файле: ID, Наименование, Тип, Замечание, Бренд, Участок, Станция, Подразделение,
  Категория (таблица equipment_item, миграция 0023);
* из Перечня сайт берёт пистолеты: строка с ID вида G.001 → номер G, «Тип» → тип клещей;
  «Станция» строки пистолета — это ID его трансформатора (или робота) → трансформатор
  пистолета (ручной атрибут, история привязок сохраняется);
* «станция по Перечню» — по цепочке строк: пистолет → трансформатор/робот → станция.
  Это справочная информация: для дефектов и ТО станция — только из Weld Balance;
  расхождение Перечня и WB — строка «Сверки» (её разбирает ИТО);
* пистолеты, которых в Перечне нет, НЕ удаляются (на них ссылаются ТО и дефекты) — Сверка.

Всё работает молча: вставке из Excel ничто не мешает, проблемы копятся в Сверке.
"""
import re
from collections import Counter
from datetime import date

_G_ID_RE = re.compile(r'^G[.\s]*0*(\d+)$', re.I)
_TAIL_RE = re.compile(r'-[^-]+$')        # «CH-MB-250-R2501» → «CH-MB-250» (робот → станция)
_NO_PLACE = {'', 'НЕТ', '-', '—'}


def gun_number(item_code):
    """ID строки Перечня → номер пистолета: 'G.001' → 1; не пистолет → None."""
    m = _G_ID_RE.match((item_code or '').strip())
    return int(m.group(1)) if m else None


def _norm(text):
    return re.sub(r'\s+', ' ', str(text or '').strip()).upper()


def is_transformer(name):
    return 'трансформатор' in (name or '').lower()


def _trans_type(name):
    """«AC трансформатор» → AC, «DC/DС трансформатор» (бывает кириллическая С) → DC."""
    up = (name or '').upper()
    return 'DC' if 'DC' in up or 'DС' in up else 'AC'


class Resolver:
    """Станция строки Перечня по цепочке «Станция» → строка Перечня с таким ID → … →
    станция из справочника станций. Робот без своей строки — по коду (срезаем хвост)."""

    def __init__(self, items, stations):
        self.by_code = {}
        for it in items:                                   # дубль ID — берём первую строку листа
            self.by_code.setdefault(_norm(it['item_code']), it)
        self.stations = {_norm(name): (sid, name) for sid, name in stations}

    def station(self, location):
        """(station_id | None, название станции или последний текст цепочки | None)."""
        text, seen = location, set()
        for _ in range(4):
            key = _norm(text)
            if key in _NO_PLACE:
                return None, None
            if key in self.stations:
                return self.stations[key]
            item = self.by_code.get(key)
            if item is None or key in seen:
                break
            seen.add(key)
            text = item['location']
        key = _norm(text)
        if key in _NO_PLACE:
            return None, None
        for _ in range(2):
            shorter = _TAIL_RE.sub('', key)
            if shorter == key:
                break
            key = shorter
            if key in self.stations:
                return self.stations[key]
        return None, str(text).strip()


def set_gun_transformer(db, gun_id, transformer_id, comment, today=None):
    """Трансформатор пистолета (ручной атрибут). None — снять привязку. Тот же — без
    изменений. Смена — старая привязка закрывается датой (история сохраняется)."""
    today = today or date.today().isoformat()
    active = {r[0] for r in db.execute('SELECT transformer_id FROM gun_transformer_assignment '
                                       'WHERE gun_id=? AND is_active=1', (gun_id,))}
    if active == ({transformer_id} if transformer_id is not None else set()):
        return False
    db.execute('UPDATE gun_transformer_assignment SET is_active=0, end_date=? WHERE gun_id=? AND is_active=1',
               (today, gun_id))
    if transformer_id is not None:
        db.execute('INSERT INTO gun_transformer_assignment (start_date, end_date, is_active, comments, '
                   'gun_id, transformer_id) VALUES (?, NULL, 1, ?, ?, ?)', (today, comment, gun_id, transformer_id))
    return True


def sync_register(db):
    """Перечень → справочник пистолетов, трансформаторы пистолетов, производные связи
    (equipment_link). Вызывается после сохранения Перечня (в той же транзакции — правки
    справочников попадают в тот же пакет Журнала). Пустой Перечень ничего не трогает.
    Возвращает счётчики."""
    # без опоры на row_factory: соединение синхронизации при старте — «голое» sqlite3
    items = [dict(zip(('id', 'item_code', 'name', 'item_type', 'location'), r)) for r in db.execute(
        'SELECT id, item_code, name, item_type, location FROM equipment_item ORDER BY row_order, id')]
    db.execute('DELETE FROM equipment_link')
    stats = Counter()
    if not items:
        return dict(stats)
    res = Resolver(items, db.execute('SELECT UniqueID, station_name FROM station').fetchall())
    guns = {}
    for uid, g in db.execute('SELECT UniqueID, g_num FROM gun ORDER BY UniqueID'):
        guns.setdefault(g, uid)                            # дубль G в справочнике — первый
    trans = {}
    for uid, tid in db.execute('SELECT UniqueID, transID FROM trans ORDER BY UniqueID'):
        trans.setdefault(_norm(tid), uid)

    def trans_id(item):
        key = _norm(item['item_code'])
        if key not in trans:
            trans[key] = db.execute('INSERT INTO trans (transID, type) VALUES (?, ?)',
                                    (str(item['item_code']).strip(), _trans_type(item['name']))).lastrowid
            stats['transformers_added'] += 1
        return trans[key]

    today, seen_g, links = date.today().isoformat(), set(), []
    for it in items:
        if is_transformer(it['name']):
            trans_id(it)                                   # трансформаторы — в справочник
        sid, sname = res.station(it['location'])
        g = gun_number(it['item_code'])
        gun_id = guns.get(g) if g is not None else None
        if g is not None and g not in seen_g:              # повтор G в Перечне — по первой строке (и в Сверку)
            seen_g.add(g)
            gtype = (it['item_type'] or '').strip()
            if gun_id is None:
                gun_id = guns[g] = db.execute('INSERT INTO gun (g_num, gun_type) VALUES (?, ?)',
                                              (g, gtype)).lastrowid
                stats['guns_added'] += 1
            elif gtype and db.execute('SELECT gun_type FROM gun WHERE UniqueID=?', (gun_id,)).fetchone()[0] != gtype:
                db.execute('UPDATE gun SET gun_type=? WHERE UniqueID=?', (gtype, gun_id))
                stats['guns_updated'] += 1
            place = res.by_code.get(_norm(it['location']))
            tid = trans_id(place) if place and is_transformer(place['name']) else None
            if set_gun_transformer(db, gun_id, tid, 'по Перечню оборудования', today):
                stats['transformers_relinked'] += 1
        links.append((it['id'], g, gun_id, sname, sid))
    db.executemany('INSERT INTO equipment_link (item_id, g_num, gun_id, reg_station, station_id) '
                   'VALUES (?, ?, ?, ?, ?)', links)
    stats['items'] = len(items)
    return dict(stats)


def same_station(a, b):
    """Одна и та же станция в разных написаниях справочника: 'GW-INR+WH L-10' = 'GW-INR L-10'
    (то же правило, что при сопоставлении текста WB — wb_source.StationMatcher)."""
    return _norm(a).replace('+WH', '') == _norm(b).replace('+WH', '')
