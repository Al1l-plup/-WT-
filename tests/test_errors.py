"""Проверка обработки ошибок: клиенту не утекают внутренние детали, а справочники загружены."""


def test_api_error_does_not_leak_internals(client):
    # Отсутствует обязательное поле worker_id → внутри обработчика возникает исключение,
    # которое должно вернуться клиенту обобщённым сообщением (без текста исключения/трейсбека).
    r = client.post('/api/defects/take', json={})
    assert r.status_code == 500
    body = r.get_json()
    assert body['status'] == 'error'
    assert body['message'] == 'Внутренняя ошибка сервера'
    raw = r.get_data(as_text=True)
    assert 'KeyError' not in raw
    assert 'Traceback' not in raw


def test_unknown_route_keeps_real_status(client):
    # Несуществующий маршрут должен отдавать 404, а не 500.
    assert client.get('/nope-not-here').status_code == 404
    assert client.get('/favicon.ico').status_code == 404
    # Для /api/* — тот же 404, но в формате JSON {status:error}.
    r = client.get('/api/nope-not-here')
    assert r.status_code == 404
    assert r.get_json()['status'] == 'error'
    assert 'Traceback' not in r.get_data(as_text=True)


def test_wrong_method_keeps_405(client):
    # Неверный HTTP-метод на существующем маршруте → 405, не 500.
    assert client.post('/api/brands').status_code == 405


def test_seed_data_loaded(client):
    # Косвенно проверяет, что init_db собрал БД из seed (справочники не пусты).
    brands = client.get('/api/brands').get_json()
    assert isinstance(brands, list) and len(brands) >= 1
