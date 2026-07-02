"""Smoke-тесты: ключевые эндпоинты отвечают 200 и возвращают ожидаемую форму данных."""
import pytest

PAGES = ['/', '/maintenance', '/defects', '/analytics', '/workers', '/explorer']


@pytest.mark.parametrize('path', PAGES)
def test_pages_render(client, path):
    r = client.get(path)
    assert r.status_code == 200
    body = r.data.lower()
    assert b'<html' in body or b'<!doctype' in body


def test_brands_list(client):
    r = client.get('/api/brands')
    assert r.status_code == 200
    assert isinstance(r.get_json(), list)


def test_stats_shape(client):
    r = client.get('/api/stats')
    assert r.status_code == 200
    assert {'maintenance_records', 'defects_open', 'defects_total'} <= r.get_json().keys()


def test_defects_all_shape(client):
    r = client.get('/api/defects/all')
    assert r.status_code == 200
    assert {'open', 'closed', 'workers'} <= r.get_json().keys()


def test_workers_list(client):
    r = client.get('/api/workers')
    assert r.status_code == 200
    assert isinstance(r.get_json(), list)


def test_schedule_list(client):
    r = client.get('/api/maintenance/schedule')
    assert r.status_code == 200
    assert isinstance(r.get_json(), list)


def test_analytics_defects_shape(client):
    r = client.get('/api/analytics/defects')
    assert r.status_code == 200
    assert 'by_code' in r.get_json()


def test_defect_codes_seeded(client):
    r = client.get('/api/defect_codes')
    assert r.status_code == 200
    codes = [row['code'] for row in r.get_json()]
    assert 'CR' in codes  # наполняется миграцией из DEFECT_DICTIONARY


def test_worker_add_roundtrip(client):
    r = client.post('/api/workers', json={'surname': 'Тестов', 'name': 'Тест', 'department': 'WeldTeam'})
    assert r.status_code == 200
    workers = client.get('/api/workers').get_json()
    assert any(w['surname'] == 'Тестов' for w in workers)
