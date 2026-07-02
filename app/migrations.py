"""Применение миграций схемы через Alembic.

`run_migrations(db_path)` приводит схему БД к последней ревизии (`alembic upgrade head`).
Вызывается из фабрики приложения при старте (флаг RUN_MIGRATIONS) и из scripts/init_db.py.

Особый случай — «унаследованная» БД: у существующей боевой базы схема уже соответствует
ревизии 0001 (baseline), но нет таблицы alembic_version. Такую БД сначала «штампуем»
ревизией 0001, затем догоняем до head, чтобы не пытаться пересоздать существующие таблицы.
"""
import sqlite3
from pathlib import Path

from alembic import command
from alembic.config import Config as AlembicConfig

BASE_DIR = Path(__file__).resolve().parent.parent
ALEMBIC_INI = BASE_DIR / 'alembic.ini'


def _alembic_config(db_path: str) -> AlembicConfig:
    cfg = AlembicConfig(str(ALEMBIC_INI))
    cfg.set_main_option('script_location', str(BASE_DIR / 'migrations'))
    cfg.set_main_option('sqlalchemy.url', f'sqlite:///{db_path}')
    return cfg


def _is_legacy_db(db_path: str) -> bool:
    """True, если БД уже содержит схему (таблица brand), но не под управлением Alembic."""
    if not Path(db_path).exists():
        return False
    con = sqlite3.connect(db_path)
    try:
        has_alembic = con.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='alembic_version'"
        ).fetchone()
        has_schema = con.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='brand'"
        ).fetchone()
    finally:
        con.close()
    return bool(has_schema) and not bool(has_alembic)


def run_migrations(db_path: str) -> None:
    """Привести схему БД по указанному пути к последней ревизии Alembic."""
    cfg = _alembic_config(db_path)
    if _is_legacy_db(db_path):
        command.stamp(cfg, '0001')
    command.upgrade(cfg, 'head')
