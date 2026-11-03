"""Логи приложения не глушатся миграциями при старте.

Alembic в migrations/env.py настраивает логирование из alembic.ini (fileConfig). По умолчанию
fileConfig отключает все уже созданные логгеры — а логгер приложения и waitress (wsgi.py)
создаются до миграций: ошибки API (api_error) и итог синхронизации WB пропадали из лога.
"""
import logging
import shutil

from app import create_app
from app.config import TestingConfig


def test_startup_migrations_keep_app_and_server_loggers(template_db, tmp_path):
    db = tmp_path / 'test.db'
    shutil.copy(template_db, db)
    waitress = logging.getLogger('waitress')       # wsgi.py импортирует waitress до create_app
    waitress.disabled = False
    logging.getLogger('app').disabled = False

    class _Config(TestingConfig):
        DB_PATH = str(db)
        RUN_MIGRATIONS = True                      # миграции при старте, как на сервере
        AUDIT_ENABLED = False

    app = create_app(_Config)
    assert app.logger.disabled is False
    assert waitress.disabled is False


def test_app_log_line_is_not_duplicated(app):
    """У логгера приложения свой обработчик — через root строки не дублируются."""
    assert app.logger.handlers and app.logger.propagate is False
