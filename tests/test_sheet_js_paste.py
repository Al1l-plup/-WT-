"""Регрессия клиентской логики грида sheet.js (Node, со стабами браузера).

Покрывает:
- Sheet._parseClipboard — разбор буфера Excel/TSV с кавычками: Ctrl+V из Excel содержит
  ячейки с переводами строк (длинные описания) в кавычках; наивный split по \\n/\\t рвал
  такие строки и сдвигал колонки (большая вставка «съезжала» и теряла строки).
- Sheet._jumpEdge — Ctrl+стрелка: прыжок к краю блока данных (как в Excel).
Если Node нет — тест пропускается."""
import os
import shutil
import subprocess

import pytest

_NODE = shutil.which('node')
_HARNESS = os.path.join(os.path.dirname(__file__), 'js', 'parse_clipboard.check.js')


@pytest.mark.skipif(_NODE is None, reason='node недоступен — JS-тесты грида пропущены')
def test_sheet_js_grid_logic():
    r = subprocess.run([_NODE, _HARNESS], capture_output=True, text=True)
    assert r.returncode == 0, f'JS-логика грида упала:\n{r.stdout}\n{r.stderr}'
