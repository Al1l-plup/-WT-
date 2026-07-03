"""Низкоуровневые тесты журнала версий: триггеры, откат записи, точки восстановления."""
import sqlite3

from app import audit


def _conn(app):
    return sqlite3.connect(app.config['DB_PATH'])


def test_triggers_log_insert_update_delete(app):
    c = _conn(app)
    c.execute("INSERT INTO brand(UniqueID, brand) VALUES (90,'T')"); c.commit()
    c.execute("UPDATE brand SET brand='T2' WHERE UniqueID=90"); c.commit()
    c.execute("DELETE FROM brand WHERE UniqueID=90"); c.commit()
    ops = [r[0] for r in c.execute(
        "SELECT op FROM change_log WHERE table_name='brand' AND row_pk='90' ORDER BY id")]
    assert ops == ['INSERT', 'UPDATE', 'DELETE']
    # before/after заполнены корректно
    upd = c.execute("SELECT before_json, after_json FROM change_log "
                    "WHERE table_name='brand' AND op='UPDATE'").fetchone()
    assert '"brand":"T"' in upd[0] and '"brand":"T2"' in upd[1]


def test_revert_change_restores_value(app):
    c = _conn(app)
    orig = c.execute("SELECT gun_type FROM gun WHERE UniqueID=1").fetchone()[0]
    c.execute("UPDATE gun SET gun_type='Z' WHERE UniqueID=1"); c.commit()
    cid = c.execute("SELECT MAX(id) FROM change_log WHERE table_name='gun'").fetchone()[0]
    assert audit.revert_change(c, cid) is True
    assert c.execute("SELECT gun_type FROM gun WHERE UniqueID=1").fetchone()[0] == orig


def test_restore_point_rollback(app):
    c = _conn(app)
    orig = c.execute("SELECT gun_type FROM gun WHERE UniqueID=1").fetchone()[0]
    rp = audit.create_restore_point(c, 'cp')
    c.execute("UPDATE gun SET gun_type='A' WHERE UniqueID=1"); c.commit()
    c.execute("INSERT INTO brand(UniqueID, brand) VALUES (91,'X')"); c.commit()
    n = audit.rollback_to(c, rp)
    assert n == 2
    assert c.execute("SELECT gun_type FROM gun WHERE UniqueID=1").fetchone()[0] == orig
    assert c.execute("SELECT COUNT(*) FROM brand WHERE UniqueID=91").fetchone()[0] == 0
