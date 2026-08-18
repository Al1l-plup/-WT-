"""Доступ к SQLite-базе через контекст запроса Flask.

Соединение создаётся лениво при первом обращении в рамках запроса и хранится
в ``flask.g``; закрывается автоматически по завершении запроса.
"""
import sqlite3

from flask import current_app, g


def get_db() -> sqlite3.Connection:
    """Вернуть соединение с БД для текущего запроса (создаётся при необходимости)."""
    if 'db' not in g:
        g.db = sqlite3.connect(current_app.config['DB_PATH'], check_same_thread=False)
        g.db.row_factory = sqlite3.Row
        # Контроль ссылочной целостности: удаление записи, на которую ссылаются
        # (напр. ган с уставками/дефектами), блокируется, а не оставляет «висячие»
        # ссылки. Включается на каждое соединение (в SQLite по умолчанию выключено).
        g.db.execute('PRAGMA foreign_keys = ON')
    return g.db


def close_db(exc=None) -> None:
    """Закрыть соединение с БД (регистрируется как teardown_appcontext)."""
    db = g.pop('db', None)
    if db:
        db.close()
