"""Точка входа для локальной разработки (встроенный сервер Flask).

Запуск:  python run.py
Для продакшн-развёртывания используйте wsgi.py (Waitress).
"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
