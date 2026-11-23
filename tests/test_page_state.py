"""Вид страниц (фильтры, сортировка, вкладка) переживает переход в другой раздел сайта.

Запрос Алибека 2026-11-17: «поставил фильтр в Редакторе, зашёл в Дефекты, вернулся — всё
сбросилось». Состояние — в sessionStorage через static/page-state.js; здесь проверяется, что
страницы его подключают и восстанавливают в правильный момент (живая проверка — в браузере).
"""
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
TPL = ROOT / 'app' / 'templates'
HELPER = ROOT / 'app' / 'static' / 'page-state.js'
PAGES = ['admin', 'defects', 'history', 'reconciliation', 'analytics', 'studs']


def _html(name):
    return (TPL / f'{name}.html').read_text(encoding='utf-8')


def test_helper_uses_session_storage_safely():
    src = HELPER.read_text(encoding='utf-8')
    assert 'sessionStorage' in src and 'localStorage' not in src     # до закрытия браузера, не навсегда
    assert src.count('try {') >= 3                                   # без хранилища — не падаем
    assert 'window.PageState = { load, save, clear, restoreFields, trackFields }' in src


@pytest.mark.skipif(shutil.which('node') is None, reason='node недоступен')
def test_helper_syntax():
    r = subprocess.run([shutil.which('node'), '--check', str(HELPER)], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr


@pytest.mark.parametrize('name', PAGES)
def test_page_loads_helper_before_using_it(name):
    html = _html(name)
    inc = html.find('/static/page-state.js')
    assert inc != -1, f'{name}.html не подключает page-state.js'
    if name == 'studs':                                              # там PageState использует studs.js
        assert inc < html.find('/static/studs.js')
    else:
        assert inc < html.find('PageState.')


def test_defects_restores_before_first_request_and_saves_on_render():
    html = _html('defects')
    assert html.index('restoreDefUi();') < html.index('loadBoard();\n  openFromHash();')
    body = html[html.index('function renderRows(){'):]
    assert body.index('saveDefUi();') < body.index('const rows = currentRows()')
    assert 'if (!uiRestored) return;' in html                       # ранняя перерисовка не затирает


def test_editor_reapplies_view_after_table_is_built():
    html = _html('admin')
    for fn in ('async function loadDoc(', 'async function loadRaw('):
        body = html[html.index(fn):]
        body = body[:body.index('\n}\n')]
        assert body.index('wireSheet(sheet);') < body.index('applyEd();'), fn
    assert "window.addEventListener('pagehide', saveEd)" in html     # прокрутка — при уходе со страницы


def test_sheet_exposes_view_state():
    src = (ROOT / 'app' / 'static' / 'sheet.js').read_text(encoding='utf-8')
    assert 'getViewState()' in src and 'setViewState(st)' in src
    # каждое изменение фильтра/сортировки сообщает странице
    assert len(re.findall(r'this\._viewChanged\(\)', src)) >= 4
