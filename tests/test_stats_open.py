"""Плитка «Открытых дефектов» на Главной (/api/stats) должна учитывать 4M-статусы
(in_review / at_oto / pending_otk), а не только registered/in_work — иначе показывает 0."""
import sqlite3


def test_stats_open_counts_4m_statuses(client, app):
    db = sqlite3.connect(app.config['DB_PATH'])
    before = client.get('/api/stats').get_json()['defects_open']
    # дефект в статусе in_review — «открытый» по логике доски, но старый запрос его не считал
    db.execute("INSERT INTO defects (problem_code, root_cause, solution, df_date, status) "
               "VALUES ('CR','','',DATE('now'),'in_review')")
    db.execute("INSERT INTO defects (problem_code, root_cause, solution, df_date, status) "
               "VALUES ('CR','','',DATE('now'),'at_oto')")
    db.commit()
    db.close()
    after = client.get('/api/stats').get_json()['defects_open']
    assert after == before + 2


def test_stats_open_matches_board_open_set(client, app):
    from app.defect_flow import OPEN_STATUSES
    db = sqlite3.connect(app.config['DB_PATH'])
    _in = ','.join('?' * len(OPEN_STATUSES))
    expected = db.execute(f"SELECT COUNT(*) FROM defects WHERE COALESCE(status,'registered') IN ({_in})",
                          OPEN_STATUSES).fetchone()[0]
    db.close()
    assert client.get('/api/stats').get_json()['defects_open'] == expected
