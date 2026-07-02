"""Собрать базу данных WeldTeam MES с нуля.

Шаги: создать пустую БД → применить миграции Alembic (схема) → загрузить справочники
из db/seed.sql. Факты (ТО, дефекты) остаются пустыми.

Запуск:
    python scripts/init_db.py            # создать data/welding_shop.db (если ещё нет)
    python scripts/init_db.py --force    # пересоздать, даже если файл существует
    python scripts/init_db.py путь.db    # в указанный файл
"""
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.migrations import run_migrations  # noqa: E402

DEFAULT_DB = ROOT / 'data' / 'welding_shop.db'
SEED = ROOT / 'db' / 'seed.sql'
_COUNT_TABLES = ['brand', 'station', 'gun', 'spot', 'parameters', 'welding_setup',
                 'worker', 'maintenance_schedule', 'defect_code']


def init_db(db_path: Path, force: bool = False) -> None:
    if db_path.exists():
        if not force:
            sys.exit(f'БД уже существует: {db_path} (используйте --force для пересоздания)')
        db_path.unlink()
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # 1) схема через миграции
    run_migrations(str(db_path))

    # 2) справочные данные
    if SEED.exists():
        con = sqlite3.connect(db_path)
        con.executescript(SEED.read_text(encoding='utf-8'))
        con.commit()
        for t in _COUNT_TABLES:
            print(f'  {t}: {con.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]}')
        con.close()
    else:
        print(f'ВНИМАНИЕ: {SEED} не найден — БД создана без справочных данных.')

    print(f'Готово: {db_path}')


def main() -> None:
    args = [a for a in sys.argv[1:]]
    force = '--force' in args
    args = [a for a in args if a != '--force']
    db_path = Path(args[0]) if args else DEFAULT_DB
    init_db(db_path, force=force)


if __name__ == '__main__':
    main()
