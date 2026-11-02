"""Сырые данные → рабочие ключи (app/normalize.py).

* weld_point_key — рабочие ключи строки Weld Balance: модель, № точки, номер пистолета,
  код станции, вычисленные из СЫРЫХ колонок weld_point по единым правилам
  (app/normalize.py). Сырые колонки weld_point не меняются никогда — что вставили из
  Excel, то и лежит. Ключи пересчитывает приложение при каждом сохранении WB и при
  синхронизации (app/wb_source.refresh_wb_keys); в Журнал не пишутся (AUDIT_EXCLUDE).
* v_wb_point — группировка точек WB по рабочим ключам (model_key, spot_key) вместо
  сравнения сырого текста (миграция 0024 нормализовала в SQL — второе место правил).
* equipment_link.wb_status — результат сверки строки Перечня с WB (ok / mismatch /
  no_wb / no_station), считается приложением (app/equipment.refresh_register_wb_status).

Ключи заполняет приложение при первом старте после миграции. Идемпотентно.
Revision ID: 0025, Revises: 0024.
"""
from alembic import op

revision = '0025'
down_revision = '0024'
branch_labels = None
depends_on = None

V_WB_POINT = """
CREATE VIEW v_wb_point AS
SELECT k.model_key                                                              AS model_key,
       k.spot_key                                                               AS spot_key,
       COUNT(DISTINCT w.station_id)                                             AS n_stations,
       CASE WHEN COUNT(DISTINCT w.station_id) = 1 THEN MIN(w.station_id) END    AS station_id,
       COUNT(DISTINCT w.gun_id)                                                 AS n_guns,
       CASE WHEN COUNT(DISTINCT w.gun_id) = 1 THEN MIN(w.gun_id) END            AS gun_id
FROM weld_point w
JOIN weld_point_key k ON k.weld_point_id = w.id
WHERE k.spot_key IS NOT NULL
GROUP BY k.model_key, k.spot_key
"""

# представление из 0024 — для отката
_KEY = ("(CASE WHEN TRIM(spot_number) GLOB '[0-9]*' AND TRIM(spot_number) NOT GLOB '*[^0-9.]*' "
        "AND CAST(TRIM(spot_number) AS REAL) = CAST(CAST(TRIM(spot_number) AS REAL) AS INTEGER) "
        "THEN CAST(CAST(CAST(TRIM(spot_number) AS REAL) AS INTEGER) AS TEXT) ELSE TRIM(spot_number) END)")
V_WB_POINT_0024 = f"""
CREATE VIEW v_wb_point AS
SELECT UPPER(TRIM(model_code)) AS model_code, {_KEY} AS spot_number,
       COUNT(DISTINCT station_id) AS n_stations,
       CASE WHEN COUNT(DISTINCT station_id) = 1 THEN MIN(station_id) END AS station_id,
       COUNT(DISTINCT gun_id) AS n_guns,
       CASE WHEN COUNT(DISTINCT gun_id) = 1 THEN MIN(gun_id) END AS gun_id
FROM weld_point
WHERE spot_number IS NOT NULL AND TRIM(spot_number) <> ''
GROUP BY UPPER(TRIM(model_code)), {_KEY}
"""


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade():
    op.execute("""
        CREATE TABLE IF NOT EXISTS weld_point_key (
            weld_point_id  INTEGER PRIMARY KEY,
            model_key      TEXT,
            spot_key       TEXT,
            g_num          INTEGER,
            station_key    TEXT
        )""")
    op.execute('CREATE INDEX IF NOT EXISTS ix_weld_point_key_point ON weld_point_key (model_key, spot_key)')
    op.execute('CREATE INDEX IF NOT EXISTS ix_weld_point_key_g ON weld_point_key (g_num)')
    if not _has_column(op.get_bind(), 'equipment_link', 'wb_status'):
        op.execute('ALTER TABLE equipment_link ADD COLUMN wb_status TEXT')
    op.execute('DROP VIEW IF EXISTS v_wb_point')
    op.execute(V_WB_POINT)


def downgrade():
    op.execute('DROP VIEW IF EXISTS v_wb_point')
    op.execute(V_WB_POINT_0024)
    op.execute('DROP INDEX IF EXISTS ix_weld_point_key_g')
    op.execute('DROP INDEX IF EXISTS ix_weld_point_key_point')
    op.execute('DROP TABLE IF EXISTS weld_point_key')
    # equipment_link.wb_status остаётся (SQLite < 3.35 не удаляет колонки; производная, безвредна)
