"""Обновить данные карты дефектов шпилек («Шпильки» → «Визуализация») из Excel-реестра.

То же, что кнопка «Обновить реестр» на странице /studs/map, — для запуска
на сервере вручную (например, если сайт недоступен).

Запуск (из папки проекта):
    .venv\\Scripts\\python scripts\\stud_map_update.py "D:\\Реестр\\Stud_Defect_Register_BS_rev12.xlsx"
    python scripts/stud_map_update.py реестр.xlsx [папка_данных]      # по умолчанию data/stud_map
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app import stud_map_data as smd  # noqa: E402


def main(argv):
    if len(argv) < 2:
        sys.exit(__doc__)
    src = Path(argv[1])
    out = Path(argv[2]) if len(argv) > 2 else ROOT / 'data' / 'stud_map'
    if not src.is_file():
        sys.exit(f'Нет файла: {src}')
    try:
        data, notes = smd.build(src)
    except smd.RegisterError as e:
        sys.exit(f'Ошибка: {e}')
    path = smd.write(data, out)
    print(f'Готово -> {path}')
    for n in notes:
        print(' -', n)


if __name__ == '__main__':
    main(sys.argv)
