"""Песочница для живой проверки сайта: сервер на КОПИИ базы (агенты tester и qa, превью).

Реальная data/welding_shop.db только читается: снимок берётся через sqlite backup (корректно
и при работающем сервере), фото копируются рядом — всё, что проверка создаст или удалит,
остаётся в песочнице и выбрасывается вместе с ней. При старте копия мигрирует, как
настоящий сервер, — так проверяются и новые миграции. Telegram выключен, сервер слушает
только 127.0.0.1. Тестовый админ песочницы — логин qa-admin@x.kz (ADMIN_EMAIL).

Запуск:
    python scripts/qa_server.py            # свежая копия и сервер (порт — PORT, иначе 5000)
    python scripts/qa_server.py --keep     # сервер на уже созданной копии
    python scripts/qa_server.py --clean    # удалить песочницу
"""
import argparse
import os
import shutil
import sqlite3
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REAL_DB = ROOT / 'data' / 'welding_shop.db'
SANDBOX = Path(os.environ.get('WELDTEAM_QA_SANDBOX') or Path(tempfile.gettempdir()) / 'weldteam-qa')
MARKER = '.qa-sandbox'          # удаляем только папку, которую создали сами
QA_ADMIN = 'qa-admin@x.kz'
BANNER = 'QA-SANDBOX DB:'       # агент ищет эту строку в логах, прежде чем что-то делать


def make_sandbox(src_db=REAL_DB, sandbox=SANDBOX):
    """Свежая копия БД и фото в папке песочницы. → путь к копии БД."""
    src_db, sandbox = Path(src_db).resolve(), Path(sandbox).resolve()
    if sandbox == src_db.parent or sandbox in src_db.parents:
        raise ValueError(f'Песочница не может быть папкой реальной БД: {sandbox}')
    clean(sandbox)
    sandbox.mkdir(parents=True, exist_ok=True)
    (sandbox / MARKER).write_text(str(src_db), encoding='utf-8')
    db = sandbox / src_db.name
    src = sqlite3.connect(f'{src_db.as_uri()}?mode=ro', uri=True)
    dst = sqlite3.connect(db)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    uploads = src_db.parent / 'uploads'
    if uploads.is_dir():
        shutil.copytree(uploads, sandbox / 'uploads', dirs_exist_ok=True)
    return db


def clean(sandbox=SANDBOX):
    """Удалить песочницу (только с меткой MARKER). → True, если было что удалить."""
    sandbox = Path(sandbox)
    if not (sandbox / MARKER).is_file():
        return False
    shutil.rmtree(sandbox)
    return True


def main(argv=None):
    p = argparse.ArgumentParser(description='Сайт WeldTeam на копии БД для живой проверки')
    p.add_argument('--keep', action='store_true', help='не пересоздавать копию, если она есть')
    p.add_argument('--clean', action='store_true', help='удалить песочницу и выйти')
    args = p.parse_args(argv)
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except Exception:  # noqa: BLE001 — старый поток без reconfigure: не критично
            pass
    if args.clean:
        print('Песочница удалена' if clean() else 'Песочницы нет')
        return 0
    db = (SANDBOX / REAL_DB.name).resolve()
    if not (args.keep and (SANDBOX / MARKER).is_file() and db.is_file()):
        db = make_sandbox()
    # до импорта приложения: конфиг читает окружение при импорте, .env его не перекрывает
    os.environ.update({'WELDTEAM_DB_PATH': str(db), 'WELDTEAM_TG_BOT_TOKEN': '',
                       'HOST': '127.0.0.1', 'ADMIN_EMAIL': QA_ADMIN})
    sys.path.insert(0, str(ROOT))
    from waitress import serve

    from app import create_app
    app = create_app()
    if Path(app.config['DB_PATH']).resolve() == REAL_DB.resolve():
        raise SystemExit('Отказ: приложение смотрит в реальную БД')
    print(f'{BANNER} {db}', flush=True)
    serve(app, host='127.0.0.1', port=int(app.config['PORT']), threads=8)
    return 0


if __name__ == '__main__':
    sys.exit(main())
