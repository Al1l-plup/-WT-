"""Мобильная вёрстка и доступность: обязательные мета-теги на всех страницах,
анти-зум iOS у полей ввода, тач-цели, подписи иконочных кнопок.

Проверяем сам HTML/CSS (не рендер браузера) — это дёшево и ловит регрессию,
когда добавили новую страницу и забыли viewport/theme-color.
"""
import pathlib

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


def test_accessibility_and_safe_area_basics():
    """Фокус с клавиатуры, «меньше движения», безопасные зоны iPhone, анти-зум поворота."""
    assert ':focus-visible' in STYLE, 'нет видимого фокуса для клавиатуры (WCAG 2.4.7)'
    assert 'prefers-reduced-motion' in STYLE, 'не уважается системная настройка (WCAG 2.3.3)'
    assert 'env(safe-area-inset-bottom)' in STYLE and 'env(safe-area-inset-left)' in STYLE
    assert 'text-size-adjust' in STYLE
    assert 'color-scheme' in STYLE, 'нативные контролы будут светлыми в тёмной теме'
