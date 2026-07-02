"""Окружение Alembic.

URL к БД определяется так:
1. если задан явно (программный запуск из app.migrations) — используем его;
2. иначе берём путь из app.config.DB_PATH (для запуска через CLI `alembic ...`).
"""
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Корень проекта — в sys.path, чтобы импортировать app.config при CLI-запуске.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

config = context.config

if not config.get_main_option('sqlalchemy.url'):
    from app.config import get_config
    db_path = get_config().DB_PATH
    config.set_main_option('sqlalchemy.url', f'sqlite:///{db_path}')

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = None  # схема ведётся вручную (raw SQL), autogenerate не используем


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option('sqlalchemy.url'),
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, render_as_batch=True)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
