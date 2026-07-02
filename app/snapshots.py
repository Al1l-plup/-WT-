"""Снимки контекста для исторической целостности.

При записи ТО или дефекта мы «замораживаем» человекочитаемый контекст (пистолет,
станция, бренд, модель, точка, исполнитель, уставки) прямо в строку факта — в
колонки ``snap_*``. Дальнейшее редактирование справочников (перепривязка точки/
пистолета, смена параметров) не меняет прошлые записи, потому что чтение идёт из
снимка, а не из живых JOIN-ов.

Функции вычисляют контекст «как сейчас» теми же связями, что и обычные чтения,
и обновляют колонки ``snap_*`` у указанной записи.
"""
import sqlite3


def snapshot_maintenance(db: sqlite3.Connection, maintenance_id: int) -> None:
    """Заморозить контекст записи ТО в её snap_*-колонки."""
    row = db.execute("""
        SELECT
            g.g_num                          AS g_num,
            g.gun_type                       AS gun_type,
            st.UniqueID                      AS station_id,
            st.station_name                  AS station_name,
            b.UniqueID                       AS brand_id,
            b.brand                          AS brand,
            w.surname                        AS worker_surname,
            p.mode                           AS mode,
            p.pressure                       AS pressure,
            p.heat_1                         AS heat_1,
            p.heat_2                         AS heat_2,
            p.turn_R                         AS turn_R
        FROM maintenance m
        LEFT JOIN gun g ON m.gun_id = g.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID = gta.gun_id AND gta.is_active = 1
        LEFT JOIN trans t ON gta.transformer_id = t.UniqueID
        LEFT JOIN transformer_station_assignment tsa ON t.UniqueID = tsa.transformer_id AND tsa.is_active = 1
        LEFT JOIN station st ON tsa.station_id = st.UniqueID
        LEFT JOIN brand b ON st.brand_id = b.UniqueID
        LEFT JOIN worker w ON m.worker_id = w.UniqueID
        LEFT JOIN parameters p ON m.parameter_id = p.UniqueID
        WHERE m.UniqueId = ?
        LIMIT 1
    """, (maintenance_id,)).fetchone()
    if not row:
        return
    db.execute("""
        UPDATE maintenance SET
            snap_g_num=?, snap_gun_type=?, snap_station_id=?, snap_station_name=?,
            snap_brand_id=?, snap_brand=?, snap_worker_surname=?,
            snap_mode=?, snap_pressure=?, snap_heat_1=?, snap_heat_2=?, snap_turn_R=?
        WHERE UniqueId=?
    """, (row['g_num'], row['gun_type'], row['station_id'], row['station_name'],
          row['brand_id'], row['brand'], row['worker_surname'],
          row['mode'], row['pressure'], row['heat_1'], row['heat_2'], row['turn_R'],
          maintenance_id))


def snapshot_defect(db: sqlite3.Connection, defect_id: int) -> None:
    """Заморозить контекст дефекта в его snap_*-колонки.

    Модель берётся от привязанной точки, а если точки нет (ручной ввод) —
    из ``manual_model_id``. Часть полей может быть пустой до обогащения (enrich).
    """
    row = db.execute("""
        SELECT
            COALESCE(s.spot_number, d.manual_spot_number) AS spot_number,
            mo.UniqueID                                   AS model_id,
            mo.model_name                                 AS model_name,
            mo.type                                       AS model_type,
            b.UniqueID                                    AS brand_id,
            b.brand                                       AS brand,
            st.UniqueID                                   AS station_id,
            st.station_name                               AS station_name,
            g.g_num                                       AS g_num,
            g.gun_type                                    AS gun_type
        FROM defects d
        LEFT JOIN spot s ON d.spot_id = s.UniqueID
        LEFT JOIN model mo ON mo.UniqueID = COALESCE(s.model_id, d.manual_model_id)
        LEFT JOIN brand b ON mo.brand_id = b.UniqueID
        LEFT JOIN gun g ON d.gun_id = g.UniqueID
        LEFT JOIN gun_transformer_assignment gta ON g.UniqueID = gta.gun_id AND gta.is_active = 1
        LEFT JOIN trans t ON gta.transformer_id = t.UniqueID
        LEFT JOIN transformer_station_assignment tsa ON t.UniqueID = tsa.transformer_id AND tsa.is_active = 1
        LEFT JOIN station st ON tsa.station_id = st.UniqueID
        WHERE d.UniqueID = ?
        LIMIT 1
    """, (defect_id,)).fetchone()
    if not row:
        return
    db.execute("""
        UPDATE defects SET
            snap_spot_number=?, snap_model_id=?, snap_model_name=?, snap_model_type=?,
            snap_brand_id=?, snap_brand=?, snap_station_id=?, snap_station_name=?,
            snap_g_num=?, snap_gun_type=?
        WHERE UniqueID=?
    """, (str(row['spot_number']) if row['spot_number'] is not None else None,
          row['model_id'], row['model_name'], row['model_type'],
          row['brand_id'], row['brand'], row['station_id'], row['station_name'],
          row['g_num'], row['gun_type'],
          defect_id))
