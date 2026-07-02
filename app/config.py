"""Конфигурация приложения.

Значения читаются из переменных окружения (файл ``.env`` в корне проекта,
см. ``.env.example``). Есть три профиля: разработка, продакшн и тесты.
Профиль выбирается переменной ``FLASK_ENV`` (``development`` | ``production``).
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# Корень проекта = папка на уровень выше пакета app/.
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'

# Загружаем .env (если есть) до чтения переменных окружения.
load_dotenv(BASE_DIR / '.env')


class Config:
    """Базовая конфигурация — общие настройки."""

    # Путь к БД: по умолчанию data/welding_shop.db, можно переопределить через WELDTEAM_DB_PATH.
    DB_PATH = os.environ.get('WELDTEAM_DB_PATH', str(DATA_DIR / 'welding_shop.db'))

    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-insecure-change-me')

    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', '5000'))

    # Запускать миграции БД при старте приложения.
    RUN_MIGRATIONS = True

    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    # В тестах путь к БД задаёт фикстура (копия боевой базы во временный файл).


_CONFIG_BY_NAME = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}


def get_config(name: str | None = None) -> type[Config]:
    """Вернуть класс конфигурации по имени профиля (или по FLASK_ENV)."""
    name = (name or os.environ.get('FLASK_ENV', 'development')).lower()
    return _CONFIG_BY_NAME.get(name, DevelopmentConfig)
