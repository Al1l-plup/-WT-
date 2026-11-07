"""Мобильная вёрстка и доступность: обязательные мета-теги на всех страницах,
анти-зум iOS у полей ввода, тач-цели, подписи иконочных кнопок.

Проверяем сам HTML/CSS (не рендер браузера) — это дёшево и ловит регрессию,
когда добавили новую страницу и забыли viewport/theme-color.
"""
import pathlib
import re
import shutil
import subprocess

import pytest

TEMPLATES = sorted(pathlib.Path('app/templates').glob('*.html'))
STYLE = pathlib.Path('app/static/style.css').read_text(encoding='utf-8')


@pytest.mark.parametrize('tpl', TEMPLATES, ids=lambda p: p.name)
def test_page_has_mobile_meta(tpl):
    """Каждая страница: язык, кодировка, viewport и theme-color."""
    html = tpl.read_text(encoding='utf-8')
    assert '<html lang="ru">' in html, 'нет lang — скринридер не выберет язык'
    assert 'charset="UTF-8"' in html
    assert 'name="viewport" content="width=device-width, initial-scale=1.0"' in html, \
        'без viewport страница отрендерится «десктопной» и будет мелкой на телефоне'
    assert 'name="theme-color"' in html, 'адресная строка браузера не будет в тон теме'
    # масштабирование пальцами не запрещаем (WCAG 1.4.4)
    assert 'user-scalable=no' not in html and 'maximum-scale' not in html


@pytest.mark.parametrize('tpl', TEMPLATES, ids=lambda p: p.name)
def test_icon_button_has_accessible_name(tpl):
    """Кнопка темы — только иконка, ей нужна текстовая подпись для скринридера."""
    html = tpl.read_text(encoding='utf-8')
    if 'id="themeToggle"' not in html:
        pytest.skip('на странице нет переключателя темы')
    btn = html[html.index('id="themeToggle"') - 60:html.index('id="themeToggle"') + 120]
    assert 'aria-label' in btn


# Канонический набор вкладок общей шапки (порядок как в index.html).
# «Пользователи» здесь нет: её добавляет theme.js только админу.
CANONICAL_NAV = ('/', '/maintenance', '/defects', '/analytics',
                 '/workers', '/explorer', '/admin', '/history')
NAV_TEMPLATES = [t for t in TEMPLATES if 'class="nav-links"' in t.read_text(encoding='utf-8')]


@pytest.mark.parametrize('tpl', NAV_TEMPLATES, ids=lambda p: p.name)
def test_nav_is_consistent_across_pages(tpl):
    """Шапка продублирована в каждом шаблоне (техдолг: нет base.html). Пока так —
    каждая страница с навигацией обязана давать доступ ко ВСЕМ вкладкам, иначе с
    одной страницы нельзя перейти на другую (реальный баг: users.html терял 4 вкладки)."""
    html = tpl.read_text(encoding='utf-8')
    missing = [h for h in CANONICAL_NAV if f'href="{h}"' not in html]
    assert not missing, f'{tpl.name}: в шапке нет вкладок {missing}'


def test_inputs_are_16px_on_mobile():
    """iOS Safari зумит страницу, если шрифт поля < 16px. Правило должно покрывать
    ВСЕ текстовые поля, включая date/email/password и <input> без type."""
    mobile = STYLE[STYLE.index('@media (max-width: 640px)'):]
    assert 'font-size: 16px !important' in mobile
    # общий селектор, а не только text/number
    assert 'input:not([type=checkbox])' in mobile


def test_touch_targets_at_least_44px():
    """Тач-цели ≥44px (Apple HIG / WCAG 2.5.5) — в цеху нажимают пальцем в перчатке."""
    mobile = STYLE[STYLE.index('@media (max-width: 640px)'):]
    # точный селектор с открывающей скобкой: '.nav-link {' не совпадёт с '.nav-links {'
    for rule in ('.nav-link {', '.btn-theme {', '.btn {', '.btn-sm {'):
        assert rule in mobile, f'нет мобильного правила для {rule}'
        block = mobile[mobile.index(rule):mobile.index(rule) + 260]
        assert 'min-height: 44px' in block, f'{rule} тач-цель меньше 44px'


# ── Доска дефектов на телефоне: строки и отдельные окна ──────────────────────
DEFECTS = pathlib.Path('app/templates/defects.html').read_text(encoding='utf-8')
COMPACT_QUERY = '(max-width: 768px), (max-width: 950px) and (max-height: 500px) and (pointer: coarse)'


def test_defects_phone_condition_same_in_css_and_script():
    """CSS и скрипт должны решать одинаково, телефон это или нет, — иначе строка откроет
    не то окно. Лёжа телефон остаётся телефоном: фильтры не должны требовать поворота."""
    assert f'@media {COMPACT_QUERY}' in DEFECTS
    assert f"window.matchMedia('{COMPACT_QUERY}')" in DEFECTS


def test_defects_board_is_rows_not_cards():
    """Карточки .tbl-mobile занимали по полэкрана на дефект; нужны строки."""
    assert 'tbl-mobile' not in DEFECTS
    block = DEFECTS[DEFECTS.index(f'@media {COMPACT_QUERY}'):]
    assert '.dtable td{height:32px' in block


def test_defects_rows_are_numbered_by_position():
    """№ — место строки в текущем виде, а не номер дефекта: после фильтра снова 1, 2, 3."""
    fn = DEFECTS[DEFECTS.index('function renderRows'):DEFECTS.index('window.toggleCard')]
    assert 'rows.map((d, i) =>' in fn and '<td class="rn" data-label="№">${i + 1}</td>' in fn
    assert fn.count('colspan="${COLS.length + 1}"') == 2, 'колонка № не учтена в объединённых ячейках'


def test_defects_phone_row_shows_gun_number():
    """G-номер виден в строке на телефоне стоя, до открытия карточки."""
    narrow = DEFECTS[DEFECTS.index('@media (max-width: 640px){'):]
    hidden = narrow[:narrow.index('display:none')]
    assert '[data-col=g]' not in hidden
    assert '.dtable th[data-col=spot],.dtable th[data-col=g]{width:10%}' in narrow


def test_defects_column_filters_reachable_without_table_header():
    """Заголовки с кнопками ▾ на телефоне скрыты — у каждой колонки должен быть другой вход
    в фильтр, в вертикальном положении телефона (раньше только поворотом)."""
    assert 'id="fOpen"' in DEFECTS and 'id="fColBtns"' in DEFECTS and 'id="fSort"' in DEFECTS
    assert "$('fColBtns').innerHTML = COLS.map(" in DEFECTS
    # панель фильтра — поверх окна фильтров
    mob = DEFECTS[DEFECTS.index('#dbfilter.mob{'):]
    assert 'position:fixed' in mob[:200] and 'z-index:400' in mob[:200]


def test_defects_sheet_is_accessible_and_closes_by_back_button():
    assert "el.setAttribute('role', 'dialog')" in DEFECTS
    assert "el.setAttribute('aria-modal', 'true')" in DEFECTS
    assert "history.pushState({sheet: true}" in DEFECTS, 'кнопка «назад» телефона уйдёт со страницы'
    start = DEFECTS.index("addEventListener('popstate'")
    pop = DEFECTS[start:DEFECTS.index("document.addEventListener('click'", start)]
    assert 'hideSheet();' in pop, '«назад» должна закрывать окно'
    assert 'closeColFilter();' in pop, '«назад» при открытой панели значений закрывает только её'
    assert 'Загружаем карточку дефекта' in DEFECTS and 'aria-live="polite"' in DEFECTS


def test_defects_rows_work_from_keyboard():
    """Строка открывается не только касанием: tabindex + Enter/пробел (WCAG 2.1.1)."""
    assert 'tabindex="0"' in DEFECTS and "e.key === 'Enter'" in DEFECTS


def test_defects_registration_sends_once_and_reports_lost_connection():
    """Двойное нажатие «Зафиксировать» записывало ложную серию, обрыв связи проходил молча."""
    assert 'if (btn.disabled) return;' in DEFECTS
    assert "btn.textContent = 'Сохраняем…'" in DEFECTS
    assert DEFECTS.count('submitDefect($(') == 2, 'обе формы фиксации должны идти через одну отправку'
    assert "fetch('/api/defects/register'" not in DEFECTS and "fetch('/api/defects/register_manual'" not in DEFECTS
    assert 'неизвестно, записан ли дефект' in DEFECTS


def test_defects_writes_from_card_are_not_silent():
    """Правка этапа, исправление, удаление идут через send(): отказ и обрыв связи видны."""
    for call in ('/photo/${pid}`', '/correct`', '/stage/${sid}`', '/act`, jsonReq', 'send(id, `/api/defects/${id}`'):
        assert call in DEFECTS, call
    for path in ('/photo/${pid}`', '/correct`', '/stage/${sid}`'):
        assert f'fetch(`/api/defects/${{did}}{path}' not in DEFECTS, f'{path} мимо send()'


def test_defects_photo_upload_checks_server_answer():
    """Отказ сервера при загрузке фото показывается, а отказ ОТК без фото дальше не идёт."""
    fn = DEFECTS[DEFECTS.index('async function uploadPhotos'):DEFECTS.index('// ── init ──')]
    assert "res.status !== 'success'" in fn and 'throw new UploadError' in fn


def test_defects_list_stays_fresh_after_correction():
    fn = DEFECTS[DEFECTS.index('window.correctDefect'):DEFECTS.index('window.saveStage')]
    assert 'loadBoard()' in fn


def test_defects_filter_backdrop_catches_taps():
    """Тень касание не ловит: оно нажимало кнопку под панелью и незаметно меняло даты."""
    assert '100vmax' not in DEFECTS
    assert '.dbf-back{' in DEFECTS and "back.addEventListener('click', closeColFilter)" in DEFECTS


def test_defects_phone_table_cannot_widen_page():
    """Длинное значение лёжа расширяло страницу, и телефон уменьшал весь интерфейс."""
    block = DEFECTS[DEFECTS.index(f'@media {COMPACT_QUERY}'):]
    assert '.dtable{table-layout:fixed}' in block[:block.index('@media (max-width: 640px)')]


def test_defects_phone_list_keeps_screen_for_rows():
    """Минимум 20 строк: подсказка о зонах под списком, приглашение Telegram можно убрать."""
    assert '(compact ? zoneNote' in DEFECTS and 'id="tgHideBtn"' in DEFECTS
    assert 'try { tgDismissed = localStorage' in DEFECTS, 'без хранилища страница не должна падать'


def test_defects_phone_buttons_are_44px_in_every_window():
    block = DEFECTS[DEFECTS.index(f'@media {COMPACT_QUERY}'):]
    assert '.dpage .btn,.fsheet .btn{min-height:44px;min-width:44px}' in block
    landscape = STYLE[STYLE.index('@media (max-width: 950px) and (pointer: coarse)'):]
    assert 'min-height: 44px' in landscape[:200]


def test_header_is_44px_on_phone_in_any_orientation():
    """Лёжа правила ≤640px не действуют: «выйти» было 8×18 px, а короткие ссылки уже 44 px."""
    start = STYLE.index('@media (max-width: 950px) and (pointer: coarse)')
    coarse = STYLE[start:STYLE.index('/* ── PHONE ≤640px', start)]
    assert '.nav-brand { display: flex; align-items: center; min-height: 44px; }' in coarse
    links = coarse[coarse.index('.nav-link,'):]
    assert links.index('a[href="/logout"]') < links.index('}')
    rule = links[:links.index('}')]
    assert 'min-height: 44px' in rule and 'min-width: 44px' in rule
    # без запрета сжатия полоса ужимает ссылки до 44px, и подписи наезжают друг на друга
    assert 'flex-shrink: 0' in rule


# ── Отдел «ОТК» на сайте называется «УЗК»: значение в данных и логике прежнее ─────────────────
_OTK_KEY_USES = (
    r"(?:===|==|!==)\s*'ОТК'",                # сравнение в логике
    r'value="ОТК"',                            # значение поля, подпись рядом другая
    r'data-dept="ОТК"',
    r"const DEPTS = \[[^\]]*\]",               # список значений, подпись через deptLabel
)


def _visible_otk(text):
    """Сколько раз «ОТК» попадёт на экран: без комментариев и без значений для логики."""
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    text = re.sub(r'(?m)(^|\s)//.*$', '', text)
    for pattern in _OTK_KEY_USES:
        text = re.sub(pattern, '', text)
    return text.count('ОТК')


@pytest.mark.parametrize('path', sorted(pathlib.Path('app/templates').glob('*.html')) + [
    pathlib.Path('app/static/photo-mark.js'), pathlib.Path('app/static/sheet.js'), pathlib.Path('app/static/editor-embed.js'),
], ids=lambda p: p.name)
def test_department_shown_as_uzk_on_site(path):
    assert _visible_otk(path.read_text(encoding='utf-8')) == 0, 'новый текст на сайте: отдел называется УЗК'


def test_department_label_is_the_same_in_python_and_browser():
    from app.constants import DEPARTMENTS, DEPT_LABELS, dept_label
    theme = pathlib.Path('app/static/theme.js').read_text(encoding='utf-8')
    assert DEPT_LABELS == {'ОТК': 'УЗК'} and "d === 'ОТК' ? 'УЗК' : d" in theme
    assert 'ОТК' in DEPARTMENTS, 'в данных и правах значение прежнее'
    assert dept_label('ОТК') == 'УЗК' and dept_label('ИТО') == 'ИТО' and dept_label(None) is None


PHOTO_MARK = pathlib.Path('app/static/photo-mark.js').read_text(encoding='utf-8')


def test_photo_editor_runs_before_page_back_button_handler():
    """«Назад» в редакторе закрывает редактор: его обработчик должен сработать раньше окна карточки."""
    assert DEFECTS.index('/static/photo-mark.js') < DEFECTS.index("window.addEventListener('popstate'")
    assert 'e.stopImmediatePropagation()' in PHOTO_MARK[PHOTO_MARK.index("addEventListener('popstate'"):]


def test_every_defect_photo_field_goes_through_photo_editor():
    """Редактор подхватывает поле по accept: поле без него останется без камеры и пометок."""
    fields = re.findall(r'<input type="file"[^>]*>', DEFECTS)
    assert len(fields) == 4
    assert all('accept="image/*"' in f for f in fields)
    assert "el.accept.startsWith('image')" in PHOTO_MARK


def test_android_gets_own_camera_or_gallery_choice():
    """Окно выбора файла на Android может не предлагать камеру. На iPhone выбор уже встроен."""
    assert '/Android/i.test(navigator.userAgent)' in PHOTO_MARK
    assert "setAttribute('capture', 'environment')" in PHOTO_MARK and "removeAttribute('capture')" in PHOTO_MARK


def test_photo_editor_only_on_touch_and_never_loses_marks_silently():
    assert "matchMedia('(pointer: coarse)')" in PHOTO_MARK, 'компьютер должен работать как раньше'
    assert 'canReplaceFiles' in PHOTO_MARK[PHOTO_MARK.index("addEventListener('change'"):]
    assert '.pm-stage canvas{display:block;touch-action:none}' in DEFECTS, 'палец будет листать, а не рисовать'


@pytest.mark.skipif(shutil.which('node') is None, reason='node недоступен')
def test_photo_editor_script_has_no_syntax_errors():
    r = subprocess.run([shutil.which('node'), '--check', 'app/static/photo-mark.js'], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr


@pytest.mark.skipif(shutil.which('node') is None, reason='node недоступен')
def test_defects_page_script_has_no_syntax_errors(tmp_path):
    """Скрипт страницы — без сборки: опечатка в нём ломает всю доску, а pytest её не видит."""
    scripts = re.findall(r'<script>(.*?)</script>', DEFECTS, re.S)
    assert scripts
    for i, src in enumerate(scripts):
        assert '{{' not in src and '{%' not in src, 'скрипт зависит от шаблона — проверка неполна'
        path = tmp_path / f's{i}.js'
        path.write_text(src, encoding='utf-8')
        r = subprocess.run([shutil.which('node'), '--check', str(path)], capture_output=True, text=True)
        assert r.returncode == 0, r.stderr


def test_accessibility_and_safe_area_basics():
    """Фокус с клавиатуры, «меньше движения», безопасные зоны iPhone, анти-зум поворота."""
    assert ':focus-visible' in STYLE, 'нет видимого фокуса для клавиатуры (WCAG 2.4.7)'
    assert 'prefers-reduced-motion' in STYLE, 'не уважается системная настройка (WCAG 2.3.3)'
    assert 'env(safe-area-inset-bottom)' in STYLE and 'env(safe-area-inset-left)' in STYLE
    assert 'text-size-adjust' in STYLE
    assert 'color-scheme' in STYLE, 'нативные контролы будут светлыми в тёмной теме'
