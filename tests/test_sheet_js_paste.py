"""Регрессия клиентского парсера вставки (sheet.js Sheet._parseClipboard).

Ctrl+V из Excel содержит ячейки с переводами строк (длинные описания), заключённые
в кавычки. Наивный split по \\n/\\t рвал такие строки и сдвигал колонки — из-за этого
большая вставка «съезжала» и теряла строки. Тест гоняет настоящий код sheet.js в Node
(со стабами браузера); если Node нет — пропускается."""
import os
import shutil
import subprocess

import pytest

_NODE = shutil.which('node')
_HARNESS = os.path.join(os.path.dirname(__file__), 'js', 'parse_clipboard.check.js')


@pytest.mark.skipif(_NODE is None, reason='node недоступен — JS-тест парсера вставки пропущен')
def test_clipboard_parser_keeps_multiline_cells():
    r = subprocess.run([_NODE, _HARNESS], capture_output=True, text=True)
    assert r.returncode == 0, f'JS-парсер вставки упал:\n{r.stdout}\n{r.stderr}'
