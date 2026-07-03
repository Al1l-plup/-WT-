"""Одноразовая очистка фактов (ТО и дефекты) с бэкапом БД.

Удаляет накопленные записи из maintenance, defects и maintenance_daily_task,
СОХРАНЯЯ все справочники (бренды, станции, пистолеты, точки, параметры,
welding_setup, сотрудники, планы ТО). Перед удалением делает копию БД.

Запуск:  python scripts/reset_facts.py [путь_к_БД]
По умолчанию путь — data/welding_shop.db в корне проекта.
"""
import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
DEFAULT_DB = ROOT / 'data' / 'welding_shop.db'
FACT_TABLES = ('maintenance', 'defects', 'maintenance_daily_task')


def main() -> None:
    db_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DB
    if not db_path.exists():
        sys.exit(f'БД не найдена: {db_path}')

    # 1) Бэкап
    backup_dir = db_path.parent / 'backups'
    backup_dir.mkdir(exist_ok=True)
    stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = backup_dir / f'{db_path.stem}_{stamp}.db'
    shutil.copy(db_path, backup_path)
    print(f'Бэкап: {backup_path}')

    # 2) Очистка фактов
    con = sqlite3.connect(db_path)
    try:
        from app.audit import drop_audit_triggers
        drop_audit_triggers(con)  # массовое удаление — не засоряем журнал версий
    except Exception:
        pass
    before = {t: con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0] for t in FACT_TABLES}
    for t in FACT_TABLES:
        con.execute(f'DELETE FROM {t}')
    con.execute(
        "DELETE FROM sqlite_sequence WHERE name IN ('maintenance','defects','maintenance_daily_task')"
    )
    con.commit()
    con.execute('VACUUM')
    con.commit()
    after = {t: con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0] for t in FACT_TABLES}
    con.close()

    for t in FACT_TABLES:
        print(f'  {t}: {before[t]} -> {after[t]}')
    print('Готово. Справочники не тронуты.')


if __name__ == '__main__':
    main()
