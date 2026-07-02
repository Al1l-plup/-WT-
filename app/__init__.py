"""Фабрика приложения WeldTeam MES.

Создаёт и настраивает экземпляр Flask: загружает конфигурацию, применяет
миграции БД, регистрирует закрытие соединения и все blueprints.
"""
from flask import Flask

from app.config import Config, get_config
from app.db import close_db
from app.migrations import run_migrations


def create_app(config: type[Config] | None = None) -> Flask:
    """Собрать и вернуть настроенное приложение Flask.

    :param config: класс конфигурации; по умолчанию выбирается по FLASK_ENV.
    """
    app = Flask(__name__)
    app.config.from_object(config or get_config())

    if app.config.get('RUN_MIGRATIONS'):
        run_migrations(app.config['DB_PATH'])

    app.teardown_appcontext(close_db)

    from app.blueprints import register_blueprints
    register_blueprints(app)

    return app
