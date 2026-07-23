"""Ролевой доступ по отделам (RBAC).

Матрица (кроме админа-суперпользователя, который может всё + панель «Пользователи»):

| Отдел         | Разделы (видит)                     | Может менять        |
|---------------|-------------------------------------|---------------------|
| WeldTeam      | все                                 | да, везде           |
| ИТО           | Главная, Обзор, Редактор, Журнал     | да (Редактор+Обзор) |
| ОТК           | все                                 | нет (только чтение) |
| Производство  | все                                 | нет (только чтение) |

Проверка идёт по «разделам» (features). Каждый эндпоинт относится к разделу
(по имени blueprint + несколько явных исключений). Право на раздел — 'r'
(только чтение) или 'w' (чтение+запись). Метод записи (POST/PUT/DELETE) при
праве 'r' запрещён. Неотнесённые эндпоинты (auth.me, logout, смена своего
пароля) доступны любому вошедшему.
"""

WRITE_METHODS = {'POST', 'PUT', 'DELETE', 'PATCH'}

# Разделы сайта.
AREAS = ('home', 'maintenance', 'defects', 'analytics', 'workers',
         'explorer', 'editor', 'catalog')

# Страницы (path → раздел) — для гейта страниц и построения навигации.
# 'useradmin' — только админ.
PAGES = [
    ('/', 'home', 'Главная'),
    ('/maintenance', 'maintenance', 'ТО'),
    ('/defects', 'defects', 'Дефекты'),
    ('/analytics', 'analytics', 'Аналитика'),
    ('/workers', 'workers', 'Сотрудники'),
    ('/explorer', 'explorer', 'Обзор'),
    ('/admin', 'editor', 'Редактор'),
    ('/history', 'editor', 'Журнал'),
    ('/users', 'useradmin', 'Пользователи'),
]

# Явные исключения endpoint → раздел (переопределяют маппинг по blueprint).
_ENDPOINT_AREA = {
    'pages.index': 'home',
    'pages.maintenance': 'maintenance',
    'pages.defects_page': 'defects',
    'pages.analytics_page': 'analytics',
    'pages.workers_page': 'workers',
    'pages.explorer_page': 'explorer',
    'admin.admin_page': 'editor',
    'admin.history_page': 'editor',
    'analytics.stats': 'home',   # /api/stats — плитки на Главной, нужны всем вошедшим
}

# blueprint → раздел (для остальных эндпоинтов).
_BP_AREA = {
    'maintenance': 'maintenance',
    'defects': 'defects',
    'analytics': 'analytics',
    'workers': 'workers',
    'explorer': 'explorer',
    'admin': 'editor',
    'catalog': 'catalog',
    'admin_users': 'useradmin',
}

# Права отдела на разделы: 'w' — чтение+запись, 'r' — только чтение,
# отсутствие ключа — раздел недоступен вовсе.
_ALL_R = {a: 'r' for a in AREAS}
_ALL_W = {a: 'w' for a in AREAS}
DEPARTMENT_PERMS = {
    'WeldTeam': _ALL_W,
    'ИТО': {'home': 'r', 'editor': 'w', 'explorer': 'w', 'catalog': 'r'},
    'ОТК': _ALL_R,
    'Производство': _ALL_R,
}


def area_for_endpoint(endpoint: str | None) -> str | None:
    """Раздел эндпоинта или None — если эндпоинт не под контролем прав (доступен всем вошедшим)."""
    if not endpoint:
        return None
    if endpoint in _ENDPOINT_AREA:
        return _ENDPOINT_AREA[endpoint]
    return _BP_AREA.get(endpoint.split('.', 1)[0])


def can_access(dept: str | None, is_admin: bool, endpoint: str | None, method: str) -> bool:
    """Разрешён ли данному пользователю (отдел + флаг админа) вызов эндпоинта."""
    if is_admin:
        return True
    area = area_for_endpoint(endpoint)
    if area is None:
        return True                      # неотнесённое — любому вошедшему
    if area == 'useradmin':
        return False                     # панель пользователей — только админ
    perm = DEPARTMENT_PERMS.get(dept, {}).get(area)
    if perm is None:
        return False                     # раздел недоступен отделу
    if method.upper() in WRITE_METHODS and perm != 'w':
        return False                     # запись при праве «только чтение»
    return True


def visible_pages(dept: str | None, is_admin: bool) -> list[str]:
    """Список путей страниц, которые пользователь может открыть (для навигации)."""
    out = []
    for path, area, _label in PAGES:
        if area == 'useradmin':
            if is_admin:
                out.append(path)
        elif is_admin or DEPARTMENT_PERMS.get(dept, {}).get(area) is not None:
            out.append(path)
    return out


def is_readonly(dept: str | None, is_admin: bool) -> bool:
    """True, если отдел не может ничего менять (ОТК/Производство)."""
    if is_admin:
        return False
    perms = DEPARTMENT_PERMS.get(dept, {})
    return bool(perms) and 'w' not in perms.values()
