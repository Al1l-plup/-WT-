"""Общие фикстуры для тестов.

Каждый тест работает с ОТДЕЛЬНОЙ копией боевой БД во временной папке —
боевая база data/welding_shop.db при тестах не изменяется.
"""
import shutil
from pathlib import Path

import pytest

from app import create_app
from app.config import TestingConfig

REAL_DB = Path(__file__).resolve().parent.parent / 'data' / 'welding_shop.db'


@pytest.fixture()
def app(tmp_path):
    db_copy = tmp_path / 'test.db'
    shutil.copy(REAL_DB, db_copy)

    class _Config(TestingConfig):
        DB_PATH = str(db_copy)

    yield create_app(_Config)


@pytest.fixture()
def client(app):
    return app.test_client()
