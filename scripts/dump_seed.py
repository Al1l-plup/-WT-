"""Пересобрать db/seed.sql (справочные данные) из существующей БД.

Выгружает data-only INSERT-ы для справочников (без фактов ТО/дефектов и без temp-таблиц)
в порядке зависимостей внешних ключей. Схему НЕ выгружает — она задаётся миграциями Alembic.

Запуск:  python scripts/dump_seed.py [путь_к_БД]
По умолчанию путь — data/welding_shop.db, вывод — db/seed.sql.
"""
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DB = ROOT / 'data' / 'welding_shop.db'
OUT = ROOT / 'db' / 'seed.sql'

# Справочники в порядке вставки (родители раньше детей).
CATALOG_TABLES = [
    'brand', 'trans', 'station', 'model', 'gun', 'spot', 'parameters',
    'welding_setup', 'gun_transformer_assignment', 'transformer_station_assignment',
    'worker', 'maintenance_schedule', 'defect_code', 'wb_tab',
]


def _sql_value(v) -> str:
    if v is None:
        return 'NULL'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, bytes):
        return "X'" + v.hex() + "'"
    return "'" + str(v).replace("'", "''") + "'"


def main() -> None:
    db_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DB
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row

    OUT.parent.mkdir(exist_ok=True)
    with OUT.open('w', encoding='utf-8', newline='\n') as f:
        f.write('-- Справочные данные WeldTeam MES (сгенерировано scripts/dump_seed.py).\n')
        f.write('-- Схема создаётся миграциями Alembic; здесь только данные справочников.\n')
        f.write('PRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n')
        for table in CATALOG_TABLES:
            cols = [r[1] for r in con.execute(f'PRAGMA table_info("{table}")')]
            if not cols:
                continue
            collist = ', '.join(f'"{c}"' for c in cols)
            rows = con.execute(f'SELECT * FROM "{table}"').fetchall()
            f.write(f'\n-- {table}: {len(rows)} rows\n')
            # wb_tab также наполняется миграцией 0006 — OR IGNORE исключает дубли при init_db
            verb = 'INSERT OR IGNORE' if table == 'wb_tab' else 'INSERT'
            for row in rows:
                values = ', '.join(_sql_value(row[c]) for c in cols)
                f.write(f'{verb} INTO "{table}" ({collist}) VALUES ({values});\n')
        f.write('\nCOMMIT;\nPRAGMA foreign_keys=ON;\n')
    con.close()
    print(f'seed → {OUT}')


if __name__ == '__main__':
    main()
