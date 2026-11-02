"""Обработка ввода: сырые данные → рабочие ключи. ЕДИНСТВЕННОЕ место с этими правилами.

Сырые данные (то, что человек вставил из Excel или ввёл в форму) хранятся КАК ЕСТЬ и
никогда не меняются. Для логики сайта (сопоставления, поиски, сравнения) из них
вычисляются рабочие ключи — здесь, по одним правилам. Сравнивать сырой текст напрямую
нельзя: «0020» и «20», «G.153» и «G 153», «CH-EC2-10» с кириллической «С» — одно и то же.

Правила (все функции: None/пусто → None):
* clean       — пробелы: неразрывные, табы, переводы строк → один пробел; края обрезаны;
* code_key    — коды (модель, ID оборудования, станция, трансформатор): clean + ВЕРХНИЙ
                регистр + кириллические двойники → латиница + без пробелов вокруг «-»;
* spot_key    — № точки: число в любом виде («0020», «20», «20.0») → «20», иначе code_key;
* g_number    — номер пистолета из текста «Клещи (G)»: «G.153», «G 033», «G-7», «G№12» → int;
* g_id_number — номер пистолета, если ВЕСЬ ID строки Перечня — G-номер («G.001» → 1);
* station_key — станция из текста WB: код станции без приставки бренда и хвоста
                («MB-250 ROBOT RESPOT» → «MB-250», «GW-EC2-15» → «EC2-15»).
"""
import re

_WS_RE = re.compile(r'[\s   ]+')
_DASH_RE = re.compile(r'\s*[-‐-―−]\s*')       # дефис/тире/минус любого вида
# кириллица, которую путают с латиницей при наборе кодов (CH, EC2, T1…)
_LOOKALIKE = str.maketrans('АВСЕНКМОРТХУ', 'ABCEHKMOPTXY')
_SPOT_NUM_RE = re.compile(r'[0-9][0-9.]*')
_G_RE = re.compile(r'G[\s.\-_№#]*0*(\d+)')
_G_ID_RE = re.compile(r'G[\s.\-_№#]*0*(\d+)')
_BRAND_PREFIX_RE = re.compile(r'^(CH|GW|CA)-')
_STATION_RE = re.compile(r'^([A-Z]+\d*(?: (?:[LR]|\d))?-\d+)')


def clean(raw):
    if raw is None:
        return None
    s = _WS_RE.sub(' ', str(raw)).strip()
    return s or None


def code_key(raw):
    s = clean(raw)
    if s is None:
        return None
    return _DASH_RE.sub('-', s.upper().translate(_LOOKALIKE))


def spot_key(raw):
    s = clean(raw)
    if s is None:
        return None
    if _SPOT_NUM_RE.fullmatch(s):
        try:
            f = float(s)
        except ValueError:
            return s
        if f.is_integer():
            return str(int(f))
    return code_key(s)


def spot_int(raw):
    """№ точки числом (для карточки точки): «0020» → 20; не число → None."""
    k = spot_key(raw)
    return int(k) if k is not None and k.isdigit() else None


def g_number(raw):
    k = code_key(raw)
    m = _G_RE.search(k) if k else None
    return int(m.group(1)) if m else None


def g_id_number(raw):
    k = code_key(raw)
    m = _G_ID_RE.fullmatch(k) if k else None
    return int(m.group(1)) if m else None


def station_key(raw):
    k = code_key(raw)
    if k is None:
        return None
    k = _BRAND_PREFIX_RE.sub('', k)
    m = _STATION_RE.match(k)
    return m.group(1) if m else k
