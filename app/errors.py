"""Единая обработка ошибок API.

Правило: клиенту НЕ отдаём внутренние детали (текст исключения) — только обобщённое
сообщение и корректный статус-код. Подробности (со стектрейсом) пишем в лог.
"""
from flask import current_app, jsonify

GENERIC_MESSAGE = 'Внутренняя ошибка сервера'


def api_error(exc: Exception | None = None, message: str = GENERIC_MESSAGE, code: int = 500):
    """Залогировать исключение и вернуть безопасный JSON-ответ об ошибке.

    :param exc: пойманное исключение (логируется со стектрейсом), либо None.
    :param message: сообщение для клиента (без внутренних деталей).
    :param code: HTTP-статус.
    """
    if exc is not None:
        current_app.logger.exception('API error: %s', exc)
    return jsonify({'status': 'error', 'message': message}), code


def register_error_handlers(app) -> None:
    """Глобальные обработчики: логируем непойманные исключения, отдаём обобщённый ответ."""

    @app.errorhandler(Exception)
    def _handle_uncaught(exc):  # noqa: ANN001
        app.logger.exception('Unhandled exception: %s', exc)
        return jsonify({'status': 'error', 'message': GENERIC_MESSAGE}), 500
