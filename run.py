"""Точка входа для локальной разработки (встроенный сервер Flask).

Запуск:  python run.py
Для продакшн-развёртывания используйте wsgi.py (Waitress).
"""
import sys

# На Windows консоль по умолчанию cp1251 — логи dev-сервера с кириллицей/«→» иначе
# падают UnicodeEncodeError (и при debug=True ломают запрос). Пишем консоль в UTF-8.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding='utf-8', errors='replace')
    except Exception:  # noqa: BLE001 — старый поток без reconfigure: не критично
        pass

from app import create_app  # noqa: E402 — после настройки кодировки консоли

app = create_app()

if __name__ == '__main__':
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
