"""«Как устроены данные» (app/data_map.py): пояснения Редактора не должны врать.

Тексты говорят на языке сайта — вкладки и колонки, которые видит пользователь. Тест
следит, чтобы ссылки вели на существующие вкладки, а колонки в ««…»» реально были
в документе (переименовали колонку — текст надо поправить)."""
import re
import sqlite3

from app.data_map import ABOUT, GROUPS, SITE_TABS, about_key
from app.documents import get_documents
from app.permissions import PAGES
from app.wb_source import ISSUE_KINDS


def _docs(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    db.row_factory = sqlite3.Row
    return get_documents(db)


def test_every_document_is_explained(app):
    groups = {g[0] for g in GROUPS}
    docs = _docs(app)
    assert any(k.startswith('weld_balance_') for k in docs)
    for doc_id in docs:
        a = ABOUT.get(about_key(doc_id))
        assert a, f'нет пояснения для документа {doc_id}'
        assert a['group'] in groups
        for key in ('source', 'edit', 'who', 'note', 'feeds'):
            assert a[key], f'{doc_id}: пустое «{key}»'


def test_links_and_issue_kinds_are_real():
    pages = {p for p, _a, _l in PAGES}
    assert set(SITE_TABS) <= pages
    for key, a in ABOUT.items():
        for href, what in a['feeds']:
            assert href in SITE_TABS, f'{key}: вкладка {href} не на «Карте данных»'
            assert what.strip()
        assert set(a['issue_kinds']) <= set(ISSUE_KINDS), key


def test_quoted_columns_exist_in_document(app):
    """«Колонка» в «что правят» и в правиле — это реальная колонка документа."""
    docs = _docs(app)
    for doc_id, cfg in docs.items():
        a = ABOUT[about_key(doc_id)]
        labels = {c['label'] for c in cfg['columns']}
        for text in (a['edit'], a['note']):
            for name in re.findall(r'«([^»]+)»', text):
                assert name in labels, f'{doc_id}: в тексте «{name}», а такой колонки нет'


def test_doc_list_has_groups_and_feed_titles(client):
    docs = client.get('/api/admin/docs').get_json()
    eq = next(d for d in docs if d['id'] == 'equipment')
    assert eq['group'] == 'refs'
    assert {'href': '/maintenance', 'tab': 'ТО'}.items() <= next(
        f for f in eq['about']['feeds'] if f['href'] == '/maintenance').items()
    assert all(d['group'] == 'source' for d in docs if d['id'].startswith('weld_balance_'))


def test_data_map_endpoint_counts_and_tabs(client, register_client):
    d = client.get('/api/admin/data-map').get_json()
    assert [g['key'] for g in d['groups']] == [g[0] for g in GROUPS]
    tabs = {t['href']: t for t in d['tabs']}
    assert '/defects' in tabs and '/maintenance' in tabs
    # вкладки WB сведены в один пункт «Weld Balance» и идут первыми (эталон)
    first = tabs['/defects']['items'][0]
    assert first['doc_title'] == 'Weld Balance' and all(x['doc'].startswith('weld_balance_') for x in first['docs'])
    assert d['docs']['equipment']['rows'] >= 0 and d['docs']['parameters']['rows'] >= 1
    assert d['docs']['equipment']['issues_link'].startswith('/reconciliation?kinds=')
    # «Карта данных» — для всех отделов (раздел Редактора на чтение)
    assert register_client(department='ОТК').get('/api/admin/data-map').status_code == 200


def test_columns_carry_origin(client):
    cols = {c['label']: c for c in client.get('/api/admin/doc/equipment?limit=1').get_json()['columns']}
    assert cols['Станция (по WB)']['origin'] == 'wb'
    assert cols['Станция (по Перечню)']['origin'] == 'auto'
    assert cols['ID']['origin'] is None                   # вводится вручную (как в Excel)
