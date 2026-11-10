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


def vin_prefix(key: str) -> str:
    return (key or '')[:VIN_PREFIX_LEN]


def can_review(dept, is_admin) -> bool:
    return bool(is_admin) or dept in REVIEW_DEPTS


def can_manage_schemes(dept, is_admin) -> bool:
    return bool(is_admin) or dept in SCHEME_ADMIN_DEPTS
