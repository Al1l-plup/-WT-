"""Weld Balance — единственный источник станции точки и пистолета + «Сверка».

* v_wb_point — станция/пистолет точки (модель + №) по WB. station_id задан, только
  если у точки в WB ровно одна станция (иначе NULL — неоднозначно, это в Сверке).
* v_wb_gun — станция пистолета по WB. station_id — только если станция одна;
  station_names — все станции пистолета в WB (для показа «несколько станций»).
  Цепочка пистолет → трансформатор → станция для станции больше не используется:
  трансформатор — ручная характеристика пистолета.
* wb_issue — «Сверка»: потеряшки и противоречия данных, запрос ИТО на рассмотрение.
  Наполняется и закрывается автоматически (app/wb_source.rebuild_issues); статус,
  ответственного и комментарий ведёт ИТО. Исключена из аудита (высокая оборачиваемость).
* Индексы weld_point под выборки «станция пистолета» и «пистолеты станции».

Заполнение weld_point.station_id делает приложение при старте (app/wb_source.py,
идемпотентно) и при каждом сохранении WB — логика сопоставления живёт в одном месте.

Идемпотентно (IF NOT EXISTS / DROP VIEW IF EXISTS). Revision ID: 0022, Revises: 0021.
"""
from alembic import op

revision = '0022'
down_revision = '0021'
branch_labels = None
depends_on = None

V_WB_POINT = """
CREATE VIEW v_wb_point AS
SELECT model_code,
       TRIM(spot_number)                                                    AS spot_number,
       COUNT(DISTINCT station_id)                                           AS n_stations,
       CASE WHEN COUNT(DISTINCT station_id) = 1 THEN MIN(station_id) END    AS station_id,
       COUNT(DISTINCT gun_id)                                               AS n_guns,
       CASE WHEN COUNT(DISTINCT gun_id) = 1 THEN MIN(gun_id) END            AS gun_id
FROM weld_point
WHERE spot_number IS NOT NULL AND TRIM(spot_number) <> ''
GROUP BY model_code, TRIM(spot_number)
"""

V_WB_GUN = """
CREATE VIEW v_wb_gun AS
SELECT w.gun_id                                                             AS gun_id,
       COUNT(DISTINCT w.station_id)                                         AS n_stations,
       CASE WHEN COUNT(DISTINCT w.station_id) = 1 THEN MIN(w.station_id) END AS station_id,
       GROUP_CONCAT(DISTINCT st.station_name)                               AS station_names
FROM weld_point w
LEFT JOIN station st ON st.UniqueID = w.station_id
WHERE w.gun_id IS NOT NULL
GROUP BY w.gun_id
"""


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS wb_issue (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_key   TEXT    NOT NULL UNIQUE,      -- отпечаток проблемы: тип + объект
            kind        TEXT    NOT NULL,
            model_code  TEXT,
            spot_number TEXT,
            g_num       INTEGER,
            gun_id      INTEGER,
            defect_id   INTEGER,
            wb_station  TEXT,
            details     TEXT,
            where_found TEXT,                         -- WB / Перечень / план ТО / Дефект
            rows_count  INTEGER,
            status      TEXT    NOT NULL DEFAULT 'new', -- new | in_review | assigned | resolved
            assignee_id INTEGER,
            comment     TEXT,
            first_seen  TEXT    NOT NULL,
            last_seen   TEXT    NOT NULL,
            resolved_at TEXT
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS ix_wb_issue_status ON wb_issue(status)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_wb_issue_kind ON wb_issue(kind)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_weld_point_gun_station ON weld_point(gun_id, station_id)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_weld_point_station ON weld_point(station_id)')
    op.execute('DROP VIEW IF EXISTS v_wb_point')
    op.execute(V_WB_POINT)
    op.execute('DROP VIEW IF EXISTS v_wb_gun')
    op.execute(V_WB_GUN)


def downgrade() -> None:
    op.execute('DROP VIEW IF EXISTS v_wb_gun')
    op.execute('DROP VIEW IF EXISTS v_wb_point')
    op.execute('DROP INDEX IF EXISTS ix_weld_point_station')
    op.execute('DROP INDEX IF EXISTS ix_weld_point_gun_station')
    op.execute('DROP INDEX IF EXISTS ix_wb_issue_kind')
    op.execute('DROP INDEX IF EXISTS ix_wb_issue_status')
    op.execute('DROP TABLE IF EXISTS wb_issue')
