"""Шпильки: рабочие ключи VIN, категории дефекта, правила доступа.

VIN хранится как прочитан с QR/введён (сырое значение), а вся логика — по рабочему
ключу vin_key(): одна функция обработки входа (как normalize.py для Weld Balance).
"""
import re

# Буквы VIN по ISO 3779: без I, O, Q.
_VIN_RE = re.compile(r'[A-HJ-NPR-Z0-9]{17}')
VIN_PREFIX_LEN = 8        # WMI (3) + описательная часть (5) — без контрольной цифры и серийника

# Категории — из ручного реестра цеха («Stud Defect Register»). Код — в БД, подпись — на экране.
CATEGORIES = {
    'broken': 'Сломана (по резьбе)',
    'missing': 'Отсутствует',
    'torn': 'Сорвана (сварка ок)',
    'bent': 'Погнута',
    'shifted': 'Смещение шпильки',
    'stick': 'Склейка',
}
SOURCES = {
    'body': 'Кузовной цех',
    'supplier': 'Поставщик (Китай)',
    'paint': 'Цех окраски',
    'other': 'Другое',
}

# Кто разбирает записи (ставит категорию/источник): ИТО и УЗК (ключ отдела — 'ОТК') + WeldTeam.
REVIEW_DEPTS = frozenset({'ИТО', 'ОТК', 'WeldTeam'})
# Кто загружает картинки схем.
SCHEME_ADMIN_DEPTS = frozenset({'WeldTeam'})
# Своя ошибочная запись удаляется автором в течение этого времени, пока её не разобрали.
OWN_DELETE_MINUTES = 60
# Повтор той же шпильки той же машины в это окно — не новая запись (двойное нажатие, повтор
# отправки после обрыва связи).
DUPLICATE_WINDOW_MINUTES = 10


def vin_key(raw) -> str:
    """Рабочий ключ VIN: верхний регистр, только буквы и цифры. Сырое значение не меняется."""
    return re.sub(r'[^0-9A-Z]', '', str(raw or '').upper())


def is_valid_vin(key: str) -> bool:
    """17 знаков, допустимых в VIN (I, O, Q не бывает)."""
    return bool(_VIN_RE.fullmatch(key or ''))


def vin_from_qr(text) -> str | None:
    """VIN из текста QR контрольной карты.

    Нижний QR («QR VIN номера») — ровно VIN; верхний начинается с VIN и продолжается
    комплектацией. Берём VIN, если он стоит в начале текста или занимает его целиком."""
    key = str(text or '').strip().upper()
    m = _VIN_RE.match(key)
    return m.group(0) if m else None


CARD_QR_MAX = 500                                  # сырой текст QR в записи (символов)
_MODEL_TOKEN_RE = re.compile(r'[A-Z0-9][A-Z0-9_.\-]{1,39}')


def parse_card_qr(text) -> dict:
    """Текст QR контрольной карты → {'vin': VIN | None, 'model_token': модель | None}.

    Верхний QR («Multifilling + OTTC QR»): VIN (17) + код комплектации | № ОТТС | МОДЕЛЬ |
    массы…, например «MXMDB21B1TK003922CRA13TBE4GC82NS-----BLCHW---|TC_KZ_E-KZ.0774.00037|CHERY_TIGGO2_PRO|…».
    Нижний («QR VIN номера») — только VIN, модели в нём нет. Одна функция разбора входа:
    сам текст QR хранится в записи как есть, логика — только по её результату."""
    raw = str(text or '').strip()
    fields = raw.split('|')
    token = re.sub(r'\s+', '_', fields[2].strip().upper()) if len(fields) >= 3 else ''
    return {'vin': vin_from_qr(raw), 'model_token': token if _MODEL_TOKEN_RE.fullmatch(token) else None}


def vin_prefix(key: str) -> str:
    return (key or '')[:VIN_PREFIX_LEN]


def part_image_key(part, colour) -> str | None:
    """Ключ картинки «примерный вид шпильки» для легенды: номер детали + цвет кружка
    (09170071_blue). Цвет входит в ключ: в Excel цеха одна деталь с разными кружками
    показана разными картинками (у Jolion зелёные 09170071 — короче синих)."""
    part, colour = (part or '').strip(), (colour or '').strip()
    return f'{part}_{colour}' if part and colour else None


def can_review(dept, is_admin) -> bool:
    return bool(is_admin) or dept in REVIEW_DEPTS


def can_manage_schemes(dept, is_admin) -> bool:
    return bool(is_admin) or dept in SCHEME_ADMIN_DEPTS
