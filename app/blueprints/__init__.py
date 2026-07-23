"""Регистрация всех blueprints приложения.

Каждый модуль в этом пакете объявляет объект ``bp`` (Flask Blueprint) со своей
группой маршрутов. Здесь они собираются и подключаются к приложению.
"""
from flask import Flask

from app.blueprints import (
    admin,
    admin_users,
    analytics,
    auth,
    catalog,
    defects,
    explorer,
    maintenance,
    pages,
    workers,
)

_BLUEPRINTS = (
    auth.bp,
    pages.bp,
    catalog.bp,
    maintenance.bp,
    defects.bp,
    analytics.bp,
    workers.bp,
    explorer.bp,
    admin.bp,
    admin_users.bp,
)


def register_blueprints(app: Flask) -> None:
    """Подключить все blueprints к приложению."""
    for bp in _BLUEPRINTS:
        app.register_blueprint(bp)
