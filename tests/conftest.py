"""Общие фикстуры для тестов.

Тесты самодостаточны: эталонная БД собирается из миграций Alembic + db/seed.sql
(как в scripts/init_db.py) один раз за сессию, а каждый тест получает её свежую копию.
Закоммиченная бинарная БД для тестов НЕ требуется — прогон воспроизводим в CI.
"""
import shutil

import pytest

from app import create_app
from app.config import TestingConfig
from scripts.init_db import init_db


@pytest.fixture(scope='session')
def template_db(tmp_path_factory):
    """Собрать эталонную БД (схема + справочники) один раз за сессию."""
    db_path = tmp_path_factory.mktemp('db') / 'template.db'
    init_db(db_path, force=True)
    return db_path


@pytest.fixture()
def app(template_db, tmp_path):
    db_copy = tmp_path / 'test.db'
    shutil.copy(template_db, db_copy)

    class _Config(TestingConfig):
        DB_PATH = str(db_copy)
        RUN_MIGRATIONS = False  # копия эталона уже мигрирована

    yield create_app(_Config)


@pytest.fixture()
def client(app):
    return app.test_client()
