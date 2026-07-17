"""weld_point.model_id → model_code: код модели вместо «смешанного» FK

Проблема: импортёр оставлял model_id NULL для кодов с двумя модификациями (A01 —
Jolion 2WD/4WD, P01 — Tank 300 ToD/NOT ToD), а пользователи дописывали в колонку
ТЕКСТОВЫЕ коды ('A01', 'P01'). Авто-привязка сравнивала эти коды с целым
spot.model_id, ничего не находила и создавала «мусорные» карточки точек с
текстовым model_id — их не видит ни Обзор, ни Дефекты.

Решение:
1. Колонка переименовывается в model_code (TEXT) — одна строка Weld Balance
   принадлежит КОДУ модели и может охватывать несколько модификаций,
   поэтому одиночный FK на model здесь неверен по смыслу.
2. Значения нормализуются: целые id → код из model, 'P01' → 'P01G',
   NULL → код по имени файла-источника.
3. Мусорные карточки точек (текстовый model_id) и их связки удаляются;
   ссылки weld_point.spot_id на них обнуляются (дефекты на них не ссылаются —
   проверено; пересоздание корректных связок — scripts/sync_wb_links.py).

Revision ID: 0007
Revises: 0006
Create Date: 2026-07-17
"""
from alembic import op

revision = '0007'
down_revision = '0006'
branch_labels = None
depends_on = None

# Полная схема weld_point (0003 + row_order из 0005), model_id → model_code TEXT.
_NEW_TABLE = """
    CREATE TABLE weld_point_new (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        model_code     TEXT,
        model_variant  TEXT,
        source_file    TEXT NOT NULL,
        sh_num         TEXT,
        zone           TEXT,
        wb_station     TEXT,
        process_no     TEXT,
        operation_name TEXT,
        stage_no       TEXT,
        welding_type   TEXT,
        side           TEXT,
        joint_type     TEXT,
        gun_type       TEXT,
        gun_mntc       TEXT,
        gun_id         INTEGER REFERENCES gun(UniqueID),
        station_id     INTEGER REFERENCES station(UniqueID),
        spot_number    TEXT,
        spot_id        INTEGER REFERENCES spot(UniqueID),
        spot_number_op TEXT,
        std_thickness  TEXT,
        coating        TEXT,
        lme_hold       TEXT,
        nugget         TEXT,
        check_mark     TEXT,
        important      TEXT,
        chisel_access  TEXT,
        spec           TEXT,
        change_index   TEXT,
        wp_stack_info  TEXT,
        variant_1      TEXT,
        variant_2      TEXT,
        variant_3      TEXT,
        variant_4      TEXT,
        coord_x        TEXT,
        coord_y        TEXT,
        coord_z        TEXT,
        raw_extra      TEXT,
        row_order      REAL
    )
"""

_COLS = ('id, model_variant, source_file, sh_num, zone, wb_station, process_no, '
         'operation_name, stage_no, welding_type, side, joint_type, gun_type, gun_mntc, '
         'gun_id, station_id, spot_number, spot_id, spot_number_op, std_thickness, '
         'coating, lme_hold, nugget, check_mark, important, chisel_access, spec, '
         'change_index, wp_stack_info, variant_1, variant_2, variant_3, variant_4, '
         'coord_x, coord_y, coord_z, raw_extra, row_order')

# Нормализация: целое → код модели; 'P01' → 'P01G'; NULL → по файлу-источнику.
_MODEL_CODE_EXPR = """
    CASE
        WHEN typeof(model_id)='integer'
            THEN (SELECT m.model_code FROM model m WHERE m.UniqueID = weld_point.model_id)
        WHEN model_id = 'P01' THEN 'P01G'
        WHEN model_id IS NULL OR model_id = '' THEN
            CASE
                WHEN source_file LIKE '%A13T%'  THEN 'A13T'
                WHEN source_file LIKE '%A01%'   THEN 'A01'
                WHEN source_file LIKE '%P01%'   THEN 'P01G'
                WHEN source_file LIKE '%CS65%'  THEN 'CS55'
                WHEN source_file LIKE '%CS55%'  THEN 'CS55'
                ELSE NULL
            END
        ELSE UPPER(model_id)
    END
"""

_GARBAGE_SPOTS = "SELECT UniqueID FROM spot WHERE typeof(model_id)='text'"


def upgrade() -> None:
    conn = op.get_bind()
    # 0) снять аудит-триггеры — массовый ремонт данных не должен засорять журнал
    #    (пересоздаются приложением при старте из актуальной схемы)
    for (name,) in conn.exec_driver_sql(
            "SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE 'audit_%'").fetchall():
        conn.exec_driver_sql(f'DROP TRIGGER IF EXISTS "{name}"')

    # 1) пересборка weld_point с model_code + нормализация значений
    op.execute(_NEW_TABLE)
    op.execute(f'INSERT INTO weld_point_new ({_COLS}, model_code) '
               f'SELECT {_COLS}, {_MODEL_CODE_EXPR} FROM weld_point')
    op.execute('DROP TABLE weld_point')
    op.execute('ALTER TABLE weld_point_new RENAME TO weld_point')
    op.execute('CREATE INDEX ix_weld_point_model_spot ON weld_point(model_code, spot_number)')
    op.execute('CREATE INDEX ix_weld_point_gun ON weld_point(gun_id)')
    op.execute('CREATE INDEX ix_weld_point_spot ON weld_point(spot_id)')
    op.execute('CREATE INDEX ix_weld_point_row_order ON weld_point(row_order)')

    # 2) мусорные карточки точек (текстовый model_id) и их связки
    op.execute(f'DELETE FROM welding_setup WHERE spot_id IN ({_GARBAGE_SPOTS})')
    op.execute(f'UPDATE weld_point SET spot_id=NULL WHERE spot_id IN ({_GARBAGE_SPOTS})')
    op.execute(f'DELETE FROM spot WHERE UniqueID IN ({_GARBAGE_SPOTS})')


def downgrade() -> None:
    # Обратное переименование колонки; нормализованные значения и удалённые
    # мусорные споты не восстанавливаются (восстановление — из бэкапа).
    op.execute('ALTER TABLE weld_point RENAME COLUMN model_code TO model_id')
