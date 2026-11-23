"""Проверить Excel-реестр шпилек и положить его в папку данных карты (data/stud_map/register.xlsx).

Карта дефектов шпилек (страница «Шпильки») берёт реестр из этой папки сама и пересобирает данные,
когда файл поменялся. Можно просто скопировать файл туда под именем register.xlsx — скрипт
сначала проверяет, что это реестр (лист «Реестр дефектов»), и показывает, что в нём найдено и что
пропущено; карта при этом не увидит битый или чужой файл.

Запуск (из папки проекта):
    .venv\\Scripts\\python scripts\\stud_map_update.py "D:\\Реестр\\Stud_Defect_Register_BS_rev12.xlsx"
    python scripts/stud_map_update.py реестр.xlsx [папка_данных]      # по умолчанию data/stud_map

Сайт читает данные из папки stud_map РЯДОМ С БАЗОЙ (DB_PATH). Если база лежит не в data/
проекта, укажите папку вторым аргументом: <папка базы>\\stud_map.
"""
import os
import shutil
import sys
import tempfile
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
        _data, notes = smd.build(src)
    except smd.RegisterError as e:
        sys.exit(f'Ошибка: {e}')
    out.mkdir(parents=True, exist_ok=True)
    dst = out / smd.REGISTER_FILE
    if src.resolve() != dst.resolve():
        fd, tmp = tempfile.mkstemp(suffix='.xlsx', dir=out)     # сайт не прочитает недописанный файл
        os.close(fd)
        try:
            shutil.copyfile(src, tmp)
            os.replace(tmp, dst)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
    print(f'Готово -> {dst}')
    for n in notes:
        print(' -', n)
    if out.resolve() != (ROOT / 'data' / 'stud_map').resolve():
        print('Папка не data/stud_map проекта — сайт увидит реестр, только если база (DB_PATH) лежит рядом с ней.')


if __name__ == '__main__':
    main(sys.argv)
