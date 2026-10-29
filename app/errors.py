"""Единая обработка ошибок.

Правило: клиенту НЕ отдаём внутренние детали (текст исключения) — только обобщённое
сообщение и корректный статус-код. Подробности (со стектрейсом) пишем в лог.

Два обработчика:
* HTTPException (404/405/403/…) — штатные HTTP-ошибки. Отдаём ИХ настоящий код,
  а не 500. Для /api/* — JSON, для обычных страниц — стандартный ответ Werkzeug.
* Exception — всё остальное (непредвиденные ошибки) → лог со стектрейсом + 500.
"""
from flask import current_app, jsonify, request
from werkzeug.exceptions import HTTPException

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
    """Глобальные обработчики ошибок."""

    @app.errorhandler(HTTPException)
    def _handle_http(exc):  # noqa: ANN001
        # Штатная HTTP-ошибка (404, 405, 403, …) — сохраняем её настоящий код,
        # НЕ превращаем в 500. Это ожидаемое поведение, стектрейс не логируем.
        if request.path.startswith('/api/'):
            return jsonify({'status': 'error', 'message': exc.name}), exc.code
        return exc  # для страниц — стандартный HTML-ответ Werkzeug с верным кодом

    @app.errorhandler(Exception)
    def _handle_uncaught(exc):  # noqa: ANN001
        # Непредвиденное (не-HTTP) исключение → лог со стектрейсом + обобщённый 500.
        app.logger.exception('Unhandled exception: %s', exc)
        return jsonify({'status': 'error', 'message': GENERIC_MESSAGE}), 500
