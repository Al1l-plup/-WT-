"""Снимок дефекта: откуда и когда он записан; история станций WB по датам.

* defects.snap_source — кто записал snap_*-колонки: registration (при регистрации),
  correction (исправление ОТК / WeldTeam, правка пистолета в Редакторе), manual (дефект
  внесён строкой в Редакторе), wb_fill (дозаполнено синхронизацией WB). NULL — не известно.
* defects.snap_dated — 1: взятое из WB — на дату дефекта (по истории связок и станций);
  0: по WB на момент записи, истории за день дефекта нет. NULL — не известно.
* defects.snap_at — когда снимок записан (ISO, локальное время сервера).
* wb_station_history — станция точки WB (model_key, spot_key) и пистолета (gun_id) по
  периодам [valid_from, valid_to). Сам WB истории не хранит: приложение фиксирует
  изменения, как только их видит (app/wb_source.record_station_history); учёт — с даты
  первой записи, раньше история «молчит».

Данные: снимки, дозаполненные синхронизацией WB до этой миграции (с 2026-11-02 она
писала мимо Журнала и по сегодняшнему WB), помечаются wb_fill / snap_dated=0 — по
Журналу видно, что значения появились не из записанной человеком правки. Правка — в
Журнал, автор «миграция 0026».
Revision ID: 0026, Revises: 0025.
"""
import json
from collections import defaultdict

from alembic import op

revision = '0026'
down_revision = '0025'
branch_labels = None
depends_on = None

# Дозаполнение дефектов из WB (коммит 2842812) — единственный писатель снимка мимо Журнала.
FILL_SINCE = '2026-11-02'
_SNAP = ('gun_id', 'snap_g_num', 'snap_station_id')


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def _triple(js):
    if js is None:
        return None
    d = json.loads(js)
    return tuple(d.get(k) for k in _SNAP)


def unlogged_fill_ids(defects, log):
    """id дефектов, чей текущий снимок (пистолет, G, станция) записан мимо Журнала.

    defects — [(id, gun_id, snap_g_num, snap_station_id)]; log — [(row_pk, ts, before_json,
    after_json)] записей Журнала по defects в порядке id. Идём по Журналу: «до» записи не
    совпало с «после» предыдущей — между ними меняли мимо Журнала; текущее не совпало с
    последним «после» — меняли после. Дефекты без Журнала (заведены до него) не трогаем."""
    by_pk = defaultdict(list)
    for pk, ts, before, after in log:
        by_pk[str(pk)].append((ts, _triple(before), _triple(after)))
    out = []
    for did, *now in defects:
        entries = by_pk.get(str(did))
        if not entries or all(v is None for v in now):
            continue
        state, origin = None, None
        for ts, b, a in entries:
            if b is not None and state is not None and b != state:
                state, origin = b, ('fill' if ts >= FILL_SINCE else None)
            if a is not None and a != (b if b is not None else state):
                state, origin = a, 'logged'
            elif a is not None:
                state = a
        if state != tuple(now):
            origin = 'fill'
        if origin == 'fill':
            out.append(did)
    return out


def upgrade():
    conn = op.get_bind()
    for col, typ in (('snap_source', 'TEXT'), ('snap_dated', 'INTEGER'), ('snap_at', 'TEXT')):
        if not _has_column(conn, 'defects', col):
            op.execute(f'ALTER TABLE defects ADD COLUMN {col} {typ}')
    op.execute("""
        CREATE TABLE IF NOT EXISTS wb_station_history (
            id          INTEGER PRIMARY KEY,
            model_key   TEXT,
            spot_key    TEXT,
            gun_id      INTEGER,
            station_id  INTEGER NOT NULL,
            valid_from  TEXT NOT NULL,
            valid_to    TEXT
        )""")
    op.execute('CREATE INDEX IF NOT EXISTS ix_wb_station_history_point '
               'ON wb_station_history (model_key, spot_key, valid_from)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_wb_station_history_gun ON wb_station_history (gun_id, valid_from)')
    # не больше одного действующего периода на точку / пистолет
    op.execute('CREATE UNIQUE INDEX IF NOT EXISTS ux_wb_station_history_open ON wb_station_history '
               "(COALESCE(model_key, ''), COALESCE(spot_key, ''), COALESCE(gun_id, 0)) WHERE valid_to IS NULL")

    defects = conn.exec_driver_sql('SELECT UniqueID, gun_id, snap_g_num, snap_station_id FROM defects '
                                   'WHERE snap_source IS NULL').fetchall()
    log = conn.exec_driver_sql("SELECT row_pk, ts, before_json, after_json FROM change_log "
                               "WHERE table_name='defects' ORDER BY id").fetchall()
    ids = unlogged_fill_ids(defects, log)
    if ids:
        since = conn.exec_driver_sql('SELECT COALESCE(MAX(id), 0) FROM change_log').fetchone()[0]
        conn.exec_driver_sql("UPDATE defects SET snap_source='wb_fill', snap_dated=0 WHERE UniqueID IN "
                             '(SELECT value FROM json_each(?))', (json.dumps(ids),))
        conn.exec_driver_sql("UPDATE change_log SET author='миграция 0026', batch_id='migration-0026' "
                             'WHERE id>? AND author IS NULL', (since,))


def downgrade():
    op.execute('DROP TABLE IF EXISTS wb_station_history')
    # колонки defects остаются (SQLite < 3.35 не удаляет колонки); пустые/служебные — безвредны
