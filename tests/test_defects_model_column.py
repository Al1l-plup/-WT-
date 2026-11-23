"""Модель дефекта на доске: у бренда бывает несколько моделей (Changan — CS55/CS65, GWM —
Jolion/Tank), а номер точки — внутри модели. Доска показывает код, как в цехе (A13T, CS55),
с исполнением, если их у модели несколько (A01 2WD); карточка — полностью: «Tiggo2 (A13T)».
Модель — из снимка дефекта (какой была машина в день дефекта)."""
import sqlite3

from app.blueprints.defects import _model_full, _model_label


def test_model_label_is_shop_code_plus_variant():
    assert _model_label('A13T', 'Tiggo2', 'single') == 'A13T'
    assert _model_label('CS55', 'CS55', 'single') == 'CS55'
    assert _model_label('A01', 'Jolion', '4WD') == 'A01 4WD'           # два исполнения — различаем
    assert _model_label('P01G', 'Tank 300', 'NOT ToD') == 'P01G NOT ToD'
    assert _model_label('', 'Tiggo2', '') == 'Tiggo2'                  # без кода — название
    assert _model_label('', '—', '') == '' and _model_label(None, None, None) == ''   # модели нет


def test_model_full_for_card():
    assert _model_full('A13T', 'Tiggo2', 'single') == 'Tiggo2 (A13T)'
    assert _model_full('A01', 'Jolion', '2WD') == 'Jolion 2WD (A01)'
    assert _model_full('CS55', 'CS55', 'single') == 'CS55'             # код = название — без повтора
    assert _model_full('', '—', '') == ''


def _spot_with_model(app):
    db = sqlite3.connect(app.config['DB_PATH'])
    try:
        return db.execute("""SELECT s.model_id, s.spot_number, m.model_code, m.model_name, m.type
                             FROM spot s JOIN model m ON m.UniqueID = s.model_id
                             WHERE COALESCE(s.spot_number,'') <> ''
                               AND s.UniqueID NOT IN (SELECT spot_id FROM defects WHERE spot_id IS NOT NULL)
                             LIMIT 1""").fetchone()
    finally:
        db.close()


def test_board_and_card_show_model_of_defect(register_client, app):
    otk = register_client(department='ОТК')
    model_id, num, code, name, mtype = _spot_with_model(app)
    did = otk.post('/api/defects/register', json={'model_id': model_id, 'spot_number': str(num),
                                                   'problem_code': 'CR'}).get_json()['defect_id']
    row = next(r for r in otk.get('/api/defects/all').get_json()['open'] if r['UniqueID'] == did)
    assert row['model'] == _model_label(code, name, mtype) and row['model']
    det = otk.get(f'/api/defects/{did}').get_json()['defect']
    assert det['model'] == row['model']
    assert det['model_full'] == _model_full(code, name, mtype)


def test_defect_without_model_has_empty_model(register_client):
    otk = register_client(department='ОТК')
    did = otk.post('/api/defects/register_manual', json={'g_num': 93001, 'problem_code': 'CR'}).get_json()['defect_id']
    row = next(r for r in otk.get('/api/defects/all').get_json()['open'] if r['UniqueID'] == did)
    assert row['model'] == ''
