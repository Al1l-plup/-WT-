"""Движок процесса дефектов 4M: маршрут, этапы, ОТО, серийность (app/defect_flow.py)."""
import sqlite3

from app import defect_flow as df


def _conn(app):
    return sqlite3.connect(app.config['DB_PATH'])


def _clean_spot(conn):
    """Точка без существующих дефектов — чтобы сид не влиял на серийность."""
    return conn.execute("""SELECT UniqueID FROM spot
                           WHERE UniqueID NOT IN (SELECT spot_id FROM defects WHERE spot_id IS NOT NULL)
                           LIMIT 1""").fetchone()[0]


def test_route_for(app):
    c = _conn(app)
    assert df.route_for(c, 'CR') == ['Производство', 'WeldTeam', 'ИТО']   # по умолчанию
    assert df.route_for(c, 'EO') == ['Производство', 'ИТО']               # WeldTeam пропущен
    assert df.route_for(c, 'MN') == ['Производство', 'ИТО']
    assert df.route_for(c, 'ZZZ') == ['Производство', 'WeldTeam', 'ИТО']  # неизвестный → default


def test_series_group():
    assert df.series_group('MN') == 'MN'
    assert df.series_group('EO') == 'EO'
    assert df.series_group('BT') == df.series_group('LP') == 'OTHER'
    assert df.series_group('MN') != df.series_group('EO') != df.series_group('BT')


def test_register_enters_chain(app):
    c = _conn(app); sp = _clean_spot(c)
    r = df.register_occurrence(c, problem_code='CR', spot_id=sp, registered_by=1)
    assert r['serial'] is False and r['stage'] == 'Производство'
    assert c.execute('SELECT status, current_stage_dept, stage_index FROM defects WHERE UniqueID=?',
                     (r['defect_id'],)).fetchone() == ('in_review', 'Производство', 0)
    assert c.execute('SELECT dept, left_at FROM defect_stage WHERE defect_id=?',
                     (r['defect_id'],)).fetchall() == [('Производство', None)]
    assert c.execute('SELECT COUNT(*) FROM defect_occurrence WHERE defect_id=?',
                     (r['defect_id'],)).fetchone()[0] == 1


def test_pass_through_to_unresolved(app):
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='CR', spot_id=sp, registered_by=1)['defect_id']
    assert df.act_pass(c, did, actor_id=1) == 'WeldTeam'
    assert df.act_pass(c, did, actor_id=2) == 'ИТО'
    assert df.act_pass(c, did, actor_id=3) is None            # цепочка кончилась
    assert c.execute('SELECT status, current_stage_dept FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('unresolved', None)


def test_close_sets_legacy_fields(app):
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)['defect_id']
    df.act_close(c, did, dept='Производство', actor_id=5, cause='ошибка оператора', countermeasure='переобучение')
    assert c.execute('SELECT status, closed_by_dept, root_cause, solution FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('closed', 'Производство', 'ошибка оператора', 'переобучение')


def test_bounce_to_chosen_dept(app):
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='CR', spot_id=sp, registered_by=1)['defect_id']
    df.act_pass(c, did, 1)                                    # → WeldTeam
    df.act_bounce(c, did, actor_id=2, to_dept='Производство', reason='уточнить оператора')
    assert c.execute('SELECT current_stage_dept, return_count FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('Производство', 1)


def test_oto_delegate_and_return(app):
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='CR', spot_id=sp, registered_by=1)['defect_id']
    df.act_delegate_oto(c, did, dept='Производство', actor_id=1, reason='несоосность клещей')
    assert c.execute('SELECT status, current_stage_dept, delegated_from_dept FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('at_oto', 'ОТО', 'Производство')
    assert df.act_oto_countermeasure(c, did, actor_id=9, countermeasure='отрегулировали ось') == 'Производство'
    assert c.execute('SELECT status, current_stage_dept FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('in_review', 'Производство')


def test_serial_same_group_reopens_parent(app):
    c = _conn(app); sp = _clean_spot(c)
    r1 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)
    df.act_close(c, r1['defect_id'], dept='Производство', actor_id=1, cause='x', countermeasure='y')
    # повтор LP на той же точке (та же группа OTHER) в окне → серия, переоткрытие родителя
    r2 = df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2)
    assert r2['serial'] is True and r2['defect_id'] == r1['defect_id']
    assert c.execute('SELECT status, is_serial, current_stage_dept, return_count FROM defects WHERE UniqueID=?',
                     (r1['defect_id'],)).fetchone() == ('in_review', 1, 'Производство', 1)
    assert c.execute('SELECT COUNT(*) FROM defect_occurrence WHERE defect_id=?',
                     (r1['defect_id'],)).fetchone()[0] == 2       # второе появление, нового дефекта нет


def test_serial_different_group_is_new(app):
    c = _conn(app); sp = _clean_spot(c)
    r1 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)
    df.act_close(c, r1['defect_id'], dept='Производство', actor_id=1, cause='x', countermeasure='y')
    r2 = df.register_occurrence(c, problem_code='MN', spot_id=sp, registered_by=2)   # другая группа
    assert r2['serial'] is False and r2['defect_id'] != r1['defect_id']


def test_serial_outside_window_is_new(app):
    c = _conn(app); sp = _clean_spot(c)
    r1 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1, when='2026-01-01')
    df.act_close(c, r1['defect_id'], dept='Производство', actor_id=1, cause='x', countermeasure='y')
    r2 = df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2, when='2026-01-11')  # >2 дней
    assert r2['serial'] is False and r2['defect_id'] != r1['defect_id']


def test_can_act_stage():
    assert df.can_act_stage('Производство', 'Производство') is True
    assert df.can_act_stage('Производство', 'WeldTeam') is False
    assert df.can_act_stage('Производство', 'ОТК', is_admin=True) is True   # аварийный клапан
    assert df.can_act_stage(None, 'Производство') is False
