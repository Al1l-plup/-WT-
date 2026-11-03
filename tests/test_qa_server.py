"""Песочница живой проверки (scripts/qa_server.py): копия БД и фото, реальная БД не трогается."""
import sqlite3

import pytest

from scripts import qa_server


def _real(tmp_path):
    data = tmp_path / 'data'
    (data / 'uploads' / 'defects').mkdir(parents=True)
    (data / 'uploads' / 'defects' / 'p.jpg').write_bytes(b'jpg')
    db = data / 'welding_shop.db'
    c = sqlite3.connect(db)
    c.execute('CREATE TABLE t (x)')
    c.execute('INSERT INTO t VALUES (1)')
    c.commit()
    c.close()
    return db


def test_sandbox_is_a_copy(tmp_path):
    real = _real(tmp_path)
    box = tmp_path / 'box'
    db = qa_server.make_sandbox(real, box)
    assert db == (box / 'welding_shop.db').resolve()
    c = sqlite3.connect(db)
    c.execute('INSERT INTO t VALUES (2)')
    c.commit()
    c.close()
    assert sqlite3.connect(real).execute('SELECT COUNT(*) FROM t').fetchone()[0] == 1   # реальная не изменилась
    assert (box / 'uploads' / 'defects' / 'p.jpg').read_bytes() == b'jpg'


def test_sandbox_is_fresh_each_time(tmp_path):
    real, box = _real(tmp_path), tmp_path / 'box'
    db = qa_server.make_sandbox(real, box)
    c = sqlite3.connect(db)
    c.execute('INSERT INTO t VALUES (2)')
    c.commit()
    c.close()
    db = qa_server.make_sandbox(real, box)
    assert sqlite3.connect(db).execute('SELECT COUNT(*) FROM t').fetchone()[0] == 1


def test_sandbox_never_in_real_data_dir(tmp_path):
    real = _real(tmp_path)
    with pytest.raises(ValueError):
        qa_server.make_sandbox(real, real.parent)
    with pytest.raises(ValueError):
        qa_server.make_sandbox(real, tmp_path)


def test_clean_removes_only_marked_folder(tmp_path):
    real, box = _real(tmp_path), tmp_path / 'box'
    qa_server.make_sandbox(real, box)
    assert qa_server.clean(box) is True and not box.exists()
    other = tmp_path / 'other'
    other.mkdir()
    assert qa_server.clean(other) is False and other.exists()
    assert qa_server.clean(real.parent) is False and real.exists()
