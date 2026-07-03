"""weld_balance: нормализованный слой полного Weld Balance

Новые таблицы (фундамент под будущие фичи weld balance). Существующие таблицы не трогаем.
- wb_material     — справочник материалов (уникальные значения).
- weld_point      — одна строка на точку weld balance (полный набор атрибутов из листа Welds),
                    best-effort связи с model/gun/station/spot (nullable).
- weld_point_part — детали, соединяемые в точке (нормализация повторяющихся групп деталь×3).

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-03
"""
from alembic import op

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None

_TABLES = [
    """
    CREATE TABLE wb_material (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
    """,
    """
    CREATE TABLE weld_point (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id       INTEGER REFERENCES model(UniqueID),
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
        raw_extra      TEXT
    )
    """,
    """
    CREATE TABLE weld_point_part (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        weld_point_id INTEGER NOT NULL REFERENCES weld_point(id) ON DELETE CASCADE,
        layer_no      INTEGER NOT NULL,
        part_name     TEXT,
        part_number   TEXT,
        material_id   INTEGER REFERENCES wb_material(id),
        coating       TEXT,
        thickness     TEXT
    )
    """,
]

_INDEXES = [
    "CREATE INDEX ix_weld_point_model_spot ON weld_point(model_id, spot_number)",
    "CREATE INDEX ix_weld_point_gun ON weld_point(gun_id)",
    "CREATE INDEX ix_weld_point_spot ON weld_point(spot_id)",
    "CREATE INDEX ix_weld_point_part_wp ON weld_point_part(weld_point_id)",
]

_DROP = ['weld_point_part', 'weld_point', 'wb_material']


def upgrade() -> None:
    for ddl in _TABLES:
        op.execute(ddl)
    for ddl in _INDEXES:
        op.execute(ddl)


def downgrade() -> None:
    for name in _DROP:
        op.execute(f'DROP TABLE IF EXISTS "{name}"')
