"""Фаза 4: аналитика процесса 4M — время этапов по отделам, возвраты, серийные."""
import sqlite3

from app import defect_flow as df


def _clean_spots(conn, n):
    return [r[0] for r in conn.execute("""SELECT UniqueID FROM spot
        WHERE UniqueID NOT IN (SELECT spot_id FROM defects WHERE spot_id IS NOT NULL)
        LIMIT ?""", (n,)).fetchall()]


def test_process_analytics(client, app):
    c = sqlite3.connect(app.config['DB_PATH'])
    sp = _clean_spots(c, 2)

    # дефект 1: Производство → (pass) WeldTeam → (close)
    d1 = df.register_occurrence(c, problem_code='CR', spot_id=sp[0], registered_by=1)['defect_id']
    df.act_pass(c, d1, actor_id=1)
    df.act_close(c, d1, 'WeldTeam', 2, 'причина', 'контрмера')

    # дефект 2: Производство → (pass) WeldTeam → (bounce к Производству)
    d2 = df.register_occurrence(c, problem_code='BT', spot_id=sp[1], registered_by=1)['defect_id']
    df.act_pass(c, d2, actor_id=1)
    df.act_bounce(c, d2, actor_id=2, to_dept='Производство', reason='уточнить оператора')
    c.commit()

    res = client.get('/api/analytics/process?date_from=2000-01-01&date_to=2100-01-01').get_json()
    depts = {x['dept']: x for x in res['by_dept']}
    assert 'Производство' in depts and 'WeldTeam' in depts
    assert depts['WeldTeam']['closed'] >= 1                 # WeldTeam закрыл d1
    assert depts['Производство']['stages_done'] >= 2         # Производство прошло этапы в обоих
    assert depts['WeldTeam']['returned'] >= 1               # WeldTeam вернул d2
    assert res['returns_total'] >= 1
    # d2 сейчас на Производстве (после возврата) — попадает в текущую загрузку
    assert depts['Производство']['open_now'] >= 1
    # время этапа посчитано (число, не null) для завершённых
    assert isinstance(depts['WeldTeam']['avg_hours'], (int, float))
    assert 'serial' in res and 'unresolved' in res
