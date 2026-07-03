"""Фабрика приложения WeldTeam MES.

Создаёт и настраивает экземпляр Flask: загружает конфигурацию, применяет
миграции БД, регистрирует закрытие соединения и все blueprints.
"""
import logging
import sqlite3

from flask import Flask

from app.audit import ensure_audit_triggers
from app.config import Config, get_config
from app.db import close_db
from app.errors import register_error_handlers
from app.migrations import run_migrations


def create_app(config: type[Config] | None = None) -> Flask:
    """Собрать и вернуть настроенное приложение Flask.

    :param config: класс конфигурации; по умолчанию выбирается по FLASK_ENV.
    """
    app = Flask(__name__)
    app.config.from_object(config or get_config())

    _configure_logging(app)

    if app.config.get('RUN_MIGRATIONS'):
        run_migrations(app.config['DB_PATH'])

    # Триггеры журнала версий (аудит) — актуализируем по текущей схеме при старте.
    if app.config.get('AUDIT_ENABLED', True):
        _con = sqlite3.connect(app.config['DB_PATH'])
        try:
            ensure_audit_triggers(_con)
        finally:
            _con.close()

    app.teardown_appcontext(close_db)

    register_error_handlers(app)

    from app.blueprints import register_blueprints
    register_blueprints(app)

    return app


def _configure_logging(app: Flask) -> None:
    """Настроить логирование приложения по уровню из конфигурации."""
    level = getattr(logging, str(app.config.get('LOG_LEVEL', 'INFO')).upper(), logging.INFO)
    if not app.logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        ))
        app.logger.addHandler(handler)
    app.logger.setLevel(level)
