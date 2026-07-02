"""Точка входа для продакшн-запуска через WSGI-сервер Waitress.

Запуск:  python wsgi.py
Сервер поднимается на HOST:PORT из конфигурации (по умолчанию 0.0.0.0:5000)
и доступен как с этого компьютера, так и по локальной сети (с телефона/планшета).
"""
import logging
import socket

from waitress import serve

from app import create_app

logging.basicConfig(level=logging.INFO)

app = create_app()


def get_local_ip() -> str:
    """Определить реальный IP-адрес компьютера в локальной сети."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


if __name__ == '__main__':
    host = app.config['HOST']
    port = app.config['PORT']
    local_ip = get_local_ip()
    print("---------------------------------------------------------")
    print(f"  ПРОМЫШЛЕННЫЙ СЕРВЕР WAITRESS ЗАПУЩЕН НА ПОРТУ {port}     ")
    print("  Сервер активен круглые сутки и защищён от зависаний    ")
    print(f"👉 ДЛЯ ВХОДА С ТЕЛЕФОНА ВВЕДИТЕ: http://{local_ip}:{port}")
    print(f"👉 ДЛЯ ВХОДА С КОМПЬЮТЕРА ВВЕДИТЕ: http://127.0.0.1:{port}")
    print("---------------------------------------------------------")
    serve(app, host=host, port=port, threads=8, channel_timeout=30)
