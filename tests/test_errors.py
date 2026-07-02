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


def test_seed_data_loaded(client):
    # Косвенно проверяет, что init_db собрал БД из seed (справочники не пусты).
    brands = client.get('/api/brands').get_json()
    assert isinstance(brands, list) and len(brands) >= 1
