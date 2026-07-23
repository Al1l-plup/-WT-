"""Фабрика приложения WeldTeam MES.

Создаёт и настраивает экземпляр Flask: загружает конфигурацию, применяет
миграции БД, регистрирует закрытие соединения и все blueprints.
"""
import logging
import sqlite3
from datetime import timedelta

from flask import Flask, jsonify, redirect, render_template, request, session

from app.audit import ensure_audit_triggers
from app.config import Config, get_config
from app.db import close_db
from app.errors import register_error_handlers
from app.migrations import run_migrations
from app.permissions import can_access

# Эндпоинты, доступные без входа (страницы входа/регистрации и статика).
_PUBLIC_ENDPOINTS = {'auth.login', 'auth.register', 'auth.logout', 'auth.departments', 'static'}
# Доступны вошедшему всегда — даже при обязательной смене пароля (чтобы её и выполнить/выйти).
_ALWAYS_ALLOWED = {'auth.change_password', 'auth.logout', 'auth.me', 'static'}


def create_app(config: type[Config] | None = None) -> Flask:
    """Собрать и вернуть настроенное приложение Flask.

    :param config: класс конфигурации; по умолчанию выбирается по FLASK_ENV.
    """
    app = Flask(__name__)
    app.config.from_object(config or get_config())

    _configure_logging(app)

    if app.config.get('RUN_MIGRATIONS'):
        run_migrations(app.config['DB_PATH'])

    # Триггеры журнала версий (аудит) — актуализируем по текущей схеме при старте.
    if app.config.get('AUDIT_ENABLED', True):
        _con = sqlite3.connect(app.config['DB_PATH'])
        try:
            ensure_audit_triggers(_con)
        finally:
            _con.close()

    app.teardown_appcontext(close_db)

    register_error_handlers(app)

    # Вход обязателен на весь сайт: без сессии API получает 401, страницы — редирект на /login.
    app.permanent_session_lifetime = timedelta(days=int(app.config.get('SESSION_DAYS', 30)))

    @app.before_request
    def _require_login():
        ep = request.endpoint
        if ep in _PUBLIC_ENDPOINTS or ep is None:
            return None
        # 1) вход обязателен
        if not session.get('uid'):
            if request.path.startswith('/api/'):
                return jsonify({'status': 'error', 'message': 'Требуется вход'}), 401
            return redirect('/login')
        # 2) обязательная смена пароля (после сброса админом — временный пароль)
        if session.get('must_change') and ep not in _ALWAYS_ALLOWED:
            if request.path.startswith('/api/'):
                return jsonify({'status': 'error', 'message': 'Требуется смена пароля'}), 403
            return redirect('/change-password')
        # 3) ролевой доступ по отделу
        if not can_access(session.get('dept'), bool(session.get('is_admin')), ep, request.method):
            if request.path.startswith('/api/'):
                return jsonify({'status': 'error', 'message': 'Недостаточно прав'}), 403
            return render_template('forbidden.html'), 403
        return None

    from app.blueprints import register_blueprints
    register_blueprints(app)

    return app


def _configure_logging(app: Flask) -> None:
    """Настроить логирование приложения по уровню из конфигурации."""
    level = getattr(logging, str(app.config.get('LOG_LEVEL', 'INFO')).upper(), logging.INFO)
    if not app.logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        ))
        app.logger.addHandler(handler)
    app.logger.setLevel(level)
