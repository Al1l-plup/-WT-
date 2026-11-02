"""v_wb_point: номер точки и код модели нормализованы.

В WB номер точки — текст из Excel, его вставляют по-разному: «0020», «20», «20.0».
В карточке точки (spot) номер — число 20. Раньше v_wb_point сравнивала текст как есть,
и при номерах с нулями точка дефекта не находилась в WB → у дефекта пропадали станция
и участок (сервер, 2026-11-02). Теперь ключ точки — нормализованный номер (то же правило,
что app/wb_source.spot_key), код модели — UPPER(TRIM()).

Только представление (данные не меняются). Revision ID: 0024, Revises: 0023.
"""
from alembic import op

revision = '0024'
down_revision = '0023'
branch_labels = None
depends_on = None

# = app.wb_source.spot_key_sql('spot_number'); в миграции — текстом (миграции не зависят от кода приложения)
_KEY = ("(CASE WHEN TRIM(spot_number) GLOB '[0-9]*' AND TRIM(spot_number) NOT GLOB '*[^0-9.]*' "
        "AND CAST(TRIM(spot_number) AS REAL) = CAST(CAST(TRIM(spot_number) AS REAL) AS INTEGER) "
        "THEN CAST(CAST(CAST(TRIM(spot_number) AS REAL) AS INTEGER) AS TEXT) ELSE TRIM(spot_number) END)")

V_WB_POINT = f"""
CREATE VIEW v_wb_point AS
SELECT UPPER(TRIM(model_code))                                              AS model_code,
       {_KEY}                                                               AS spot_number,
       COUNT(DISTINCT station_id)                                           AS n_stations,
       CASE WHEN COUNT(DISTINCT station_id) = 1 THEN MIN(station_id) END    AS station_id,
       COUNT(DISTINCT gun_id)                                               AS n_guns,
       CASE WHEN COUNT(DISTINCT gun_id) = 1 THEN MIN(gun_id) END            AS gun_id
FROM weld_point
WHERE spot_number IS NOT NULL AND TRIM(spot_number) <> ''
GROUP BY UPPER(TRIM(model_code)), {_KEY}
"""

V_WB_POINT_0022 = """
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


def upgrade():
    op.execute('DROP VIEW IF EXISTS v_wb_point')
    op.execute(V_WB_POINT)


def downgrade():
    op.execute('DROP VIEW IF EXISTS v_wb_point')
    op.execute(V_WB_POINT_0022)
