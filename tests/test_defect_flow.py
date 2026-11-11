"""Движок процесса дефектов 4M: маршрут, этапы, ОТО, серийность (app/defect_flow.py)."""
import importlib.util
import sqlite3
from pathlib import Path

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


def test_close_goes_through_otk_then_closed(app):
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)['defect_id']
    df.act_close(c, did, dept='Производство', actor_id=5, cause='ошибка оператора',
                 countermeasure='переобучение', vin='XW8ZZZ0001')
    # закрыто отделом → на согласовании ОТК (не финал), сохранены legacy-поля и VIN
    assert c.execute("""SELECT status, closed_by_dept, root_cause, solution, vin, current_stage_dept
                        FROM defects WHERE UniqueID=?""", (did,)).fetchone() == \
        ('pending_otk', 'Производство', 'ошибка оператора', 'переобучение', 'XW8ZZZ0001', 'ОТК')
    # ОТК согласовал → закрыто окончательно
    df.act_otk_approve(c, did, actor_id=7)
    assert c.execute('SELECT status, current_stage_dept FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('closed', None)


def test_otk_reject_returns_to_closing_dept(app):
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='CR', spot_id=sp, registered_by=1)['defect_id']
    df.act_close(c, did, dept='Производство', actor_id=5, cause='x', countermeasure='y', vin='Z1')
    back = df.act_otk_reject(c, did, actor_id=7, reason='точка всё ещё дефектная')
    assert back == 'Производство'
    assert c.execute('SELECT status, current_stage_dept, return_count FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('in_review', 'Производство', 1)


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
    df.act_close(c, r1['defect_id'], dept='Производство', actor_id=1, cause='x', countermeasure='y', vin='Z1')
    # повтор LP на той же точке (та же группа OTHER) в окне → серия, переоткрытие родителя
    r2 = df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2)
    assert r2['serial'] is True and r2['defect_id'] == r1['defect_id']
    assert c.execute('SELECT status, is_serial, current_stage_dept, return_count FROM defects WHERE UniqueID=?',
                     (r1['defect_id'],)).fetchone() == ('in_review', 1, 'Производство', 1)
    assert c.execute('SELECT COUNT(*) FROM defect_occurrence WHERE defect_id=?',
                     (r1['defect_id'],)).fetchone()[0] == 2       # второе появление, нового дефекта нет


def test_serial_while_pending_otk_closes_otk_stage(app):
    """Повтор, пока закрытие ждёт ОТК: этап ОТК закрывается (outcome serial_repeat), открыт
    ровно один этап — у отдела-закрывшего, и «в работе» у контролёра снимается."""
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)['defect_id']
    df.act_close(c, did, dept='Производство', actor_id=5, cause='x', countermeasure='y', vin='Z1')
    c.execute('UPDATE defects SET assigned_worker_id=7 WHERE UniqueID=?', (did,))   # контролёр взял на проверку
    r = df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2)
    assert r['defect_id'] == did and r['stage'] == 'Производство'
    assert c.execute('SELECT dept, outcome FROM defect_stage WHERE defect_id=? ORDER BY UniqueID',
                     (did,)).fetchall() == [('Производство', 'closed'), ('ОТК', 'serial_repeat'),
                                            ('Производство', None)]
    assert c.execute('SELECT COUNT(*) FROM defect_stage WHERE defect_id=? AND left_at IS NULL',
                     (did,)).fetchone()[0] == 1
    assert c.execute('SELECT status, current_stage_dept, assigned_worker_id FROM defects WHERE UniqueID=?',
                     (did,)).fetchone() == ('in_review', 'Производство', None)


def test_serial_after_closed_has_single_open_stage(app):
    """Повтор после окончательного закрытия: открытого этапа не было — закрывать нечего."""
    c = _conn(app); sp = _clean_spot(c)
    did = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)['defect_id']
    df.act_close(c, did, dept='Производство', actor_id=5, cause='x', countermeasure='y', vin='Z1')
    df.act_otk_approve(c, did, actor_id=7)
    df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2)
    assert c.execute('SELECT dept, outcome FROM defect_stage WHERE defect_id=? ORDER BY UniqueID',
                     (did,)).fetchall() == [('Производство', 'closed'), ('ОТК', 'otk_approved'),
                                            ('Производство', None)]


def _m0027():
    path = Path(__file__).resolve().parents[1] / 'migrations' / 'versions' / '0027_close_stale_open_stages.py'
    spec = importlib.util.spec_from_file_location('m0027', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_migration_0027_closes_stale_open_stages(app):
    """Данные, оставленные багом: этап ОТК открыт, следом открыт этап отдела, «в работе» —
    контролёр. Миграция закрывает этап ОТК моментом входа в следующий и снимает «в работе»;
    исправные дефекты не трогает."""
    c = _conn(app)
    otk_w, prod_w = [r[0] for r in c.execute('SELECT UniqueID FROM worker ORDER BY UniqueID LIMIT 2')]
    c.execute("UPDATE worker SET department='ОТК' WHERE UniqueID=?", (otk_w,))
    c.execute("UPDATE worker SET department='Производство' WHERE UniqueID=?", (prod_w,))
    spots = [r[0] for r in c.execute("""SELECT UniqueID FROM spot WHERE UniqueID NOT IN
                                        (SELECT spot_id FROM defects WHERE spot_id IS NOT NULL) LIMIT 2""")]
    bad = df.register_occurrence(c, problem_code='BT', spot_id=spots[0], registered_by=1)['defect_id']
    df.act_close(c, bad, dept='Производство', actor_id=5, cause='x', countermeasure='y', vin='Z1')
    # как делал старый reopen_as_serial: новый этап поверх открытого этапа ОТК, «в работе» не снято
    c.execute("INSERT INTO defect_stage (defect_id, dept, entered_at) VALUES (?, 'Производство', '2026-11-03T09:00:00')",
              (bad,))
    c.execute("""UPDATE defects SET status='in_review', current_stage_dept='Производство', assigned_worker_id=?
                 WHERE UniqueID=?""", (otk_w, bad))
    ok = df.register_occurrence(c, problem_code='BT', spot_id=spots[1], registered_by=1)['defect_id']
    c.execute('UPDATE defects SET assigned_worker_id=? WHERE UniqueID=?', (prod_w, ok))   # взял свой отдел

    assert _m0027().repair_open_stages(c.execute) == [bad]
    assert c.execute('SELECT dept, left_at, outcome FROM defect_stage WHERE defect_id=? ORDER BY UniqueID',
                     (bad,)).fetchall()[1:] == [('ОТК', '2026-11-03T09:00:00', 'serial_repeat'),
                                                ('Производство', None, None)]
    assert c.execute('SELECT assigned_worker_id FROM defects WHERE UniqueID=?', (bad,)).fetchone()[0] is None
    assert c.execute('SELECT assigned_worker_id FROM defects WHERE UniqueID=?', (ok,)).fetchone()[0] == prod_w
    assert c.execute('SELECT COUNT(*) FROM defect_stage WHERE defect_id=? AND left_at IS NULL', (ok,)).fetchone()[0] == 1
    assert _m0027().repair_open_stages(c.execute) == []                  # повторный прогон — нечего чинить


def test_serial_merges_into_open_parent(app):
    """Недельное правило: повтор на той же точке, пока прежний дефект ещё ОТКРЫТ, доливается
    в него (серийный, +появление), а не плодит новую карточку."""
    c = _conn(app); sp = _clean_spot(c)
    r1 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)   # не закрываем
    assert c.execute('SELECT status FROM defects WHERE UniqueID=?', (r1['defect_id'],)).fetchone()[0] == 'in_review'
    r2 = df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2)   # та же группа OTHER, в окне
    assert r2['serial'] is True and r2['defect_id'] == r1['defect_id']               # слилось в тот же дефект
    is_serial, status = c.execute('SELECT is_serial, status FROM defects WHERE UniqueID=?',
                                  (r1['defect_id'],)).fetchone()
    assert is_serial == 1 and status == 'in_review'                                  # помечен серийным, этап не изменился
    assert c.execute('SELECT COUNT(*) FROM defect_occurrence WHERE defect_id=?',
                     (r1['defect_id'],)).fetchone()[0] == 2                          # два появления
    assert c.execute('SELECT COUNT(*) FROM defects WHERE spot_id=?', (sp,)).fetchone()[0] == 1   # новой карточки нет


def test_occurrence_comment_kept_per_registration(app):
    """Комментарий контролёра хранится у ВЫЯВЛЕНИЯ: повтор серии (слияние в открытый и
    переоткрытие закрытого) пишет свой комментарий и не затирает первый."""
    c = _conn(app); sp = _clean_spot(c)
    r1 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1, comment='  подрез с краю  ')
    df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2, comment='')          # слияние, без комм.
    df.act_close(c, r1['defect_id'], dept='Производство', actor_id=1, cause='x', countermeasure='y', vin='Z1')
    df.act_otk_approve(c, r1['defect_id'], 1, None)
    r3 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=3, comment='снова, 2 машины')
    assert r3['repeat'] == 'reopened' and r3['defect_id'] == r1['defect_id']
    rows = c.execute('SELECT registered_by, comment FROM defect_occurrence WHERE defect_id=? ORDER BY UniqueID',
                     (r1['defect_id'],)).fetchall()
    assert rows == [(1, 'подрез с краю'), (2, None), (3, 'снова, 2 машины')]


def test_clean_comment():
    assert df.clean_comment(None) is None and df.clean_comment('   ') is None
    assert df.clean_comment(' ок ') == 'ок'
    assert len(df.clean_comment('я' * 900)) == df.COMMENT_MAX


def test_serial_different_group_is_new(app):
    c = _conn(app); sp = _clean_spot(c)
    r1 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1)
    df.act_close(c, r1['defect_id'], dept='Производство', actor_id=1, cause='x', countermeasure='y', vin='Z1')
    r2 = df.register_occurrence(c, problem_code='MN', spot_id=sp, registered_by=2)   # другая группа
    assert r2['serial'] is False and r2['defect_id'] != r1['defect_id']


def test_serial_outside_window_is_new(app):
    c = _conn(app); sp = _clean_spot(c)
    r1 = df.register_occurrence(c, problem_code='BT', spot_id=sp, registered_by=1, when='2026-01-01')
    df.act_close(c, r1['defect_id'], dept='Производство', actor_id=1, cause='x', countermeasure='y', vin='Z1')
    r2 = df.register_occurrence(c, problem_code='LP', spot_id=sp, registered_by=2, when='2026-01-11')  # >неделя
    assert r2['serial'] is False and r2['defect_id'] != r1['defect_id']


def test_can_act_stage():
    assert df.can_act_stage('Производство', 'Производство') is True
    assert df.can_act_stage('Производство', 'WeldTeam') is False
    assert df.can_act_stage('Производство', 'ОТК', is_admin=True) is True   # аварийный клапан
    assert df.can_act_stage(None, 'Производство') is False
