"""Общие фикстуры для тестов.

Тесты самодостаточны: эталонная БД собирается из миграций Alembic + db/seed.sql
(как в scripts/init_db.py) один раз за сессию, а каждый тест получает её свежую копию.
Закоммиченная бинарная БД для тестов НЕ требуется — прогон воспроизводим в CI.
"""
import shutil
import sqlite3

import pytest

from app import create_app
from app.audit import ensure_audit_triggers
from app.config import TestingConfig
from scripts.init_db import init_db


@pytest.fixture(scope='session')
def template_db(tmp_path_factory):
    """Собрать эталонную БД (схема + справочники + триггеры аудита) один раз за сессию."""
    db_path = tmp_path_factory.mktemp('db') / 'template.db'
    init_db(db_path, force=True)
    con = sqlite3.connect(db_path)
    ensure_audit_triggers(con)  # чтобы копии уже содержали журнал версий
    con.close()
    return db_path


@pytest.fixture()
def app(template_db, tmp_path):
    db_copy = tmp_path / 'test.db'
    shutil.copy(template_db, db_copy)

    class _Config(TestingConfig):
        DB_PATH = str(db_copy)
        RUN_MIGRATIONS = False   # копия эталона уже мигрирована
        AUDIT_ENABLED = False    # триггеры уже в копии — не пересоздаём

    yield create_app(_Config)


# По умолчанию тест-клиент — из отдела WeldTeam (полный доступ ко всем разделам),
# чтобы тесты функций не упирались в ролевые ограничения. RBAC проверяется отдельно
# (tests/test_permissions.py) через фабрику register_client с нужным отделом.
TEST_USER = {'surname': 'Тестов', 'name': 'Тест', 'department': 'WeldTeam',
             'login': 'test@weldteam.kz', 'password': 'test1234', 'password2': 'test1234'}


@pytest.fixture()
def anon_client(app):
    """Клиент без входа (для проверки щита аутентификации)."""
    return app.test_client()


@pytest.fixture()
def client(app):
    """Клиент с выполненным входом (вход обязателен на весь сайт)."""
    c = app.test_client()
    c.post('/register', data=TEST_USER)
    return c


@pytest.fixture()
def register_client(app):
    """Фабрика: зарегистрировать и залогинить пользователя нужного отдела.

    Использование: `c = register_client(department='ОТК')` → вошедший клиент ОТК.
    Логин генерируется уникальным; для админа передайте его почту явным login.
    """
    counter = {'n': 0}

    def _make(department='WeldTeam', login=None, surname='Роль', name='Тест'):
        counter['n'] += 1
        login = login or f'user{counter["n"]}@weldteam.kz'
        c = app.test_client()
        c.post('/register', data={'surname': surname, 'name': name, 'department': department,
                                  'login': login, 'password': 'test1234', 'password2': 'test1234'})
        return c

    return _make
