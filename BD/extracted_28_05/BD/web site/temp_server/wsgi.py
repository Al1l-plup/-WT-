from waitress import serve
from app import app
import logging
import socket

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('waitress')

# Функция автоматического определения реального IP-адреса компьютера
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

local_ip = get_local_ip()

print("---------------------------------------------------------")
print("  ПРОМЫШЛЕННЫЙ СЕРВЕР WAITRESS ЗАПУЩЕН НА ПОРТУ 5000     ")
print("  Сервер активен круглые сутки и защищен от зависаний    ")
print(f"👉 ДЛЯ ВХОДА С ТЕЛЕФОНА ВВЕДИТЕ: http://{local_ip}:5000")
print(f"👉 ДЛЯ ВХОДА С КОМПЬЮТЕРА ВВЕДИТЕ: http://127.0.0.1:5000")
print("---------------------------------------------------------")

# Запуск сервера на порту 5000
serve(app, host='0.0.0.0', port=5000, threads=8, channel_timeout=30)