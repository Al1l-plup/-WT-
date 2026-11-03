"""Снимки контекста для исторической целостности.

При записи ТО или дефекта мы «замораживаем» человекочитаемый контекст (пистолет,
станция, бренд, модель, точка, исполнитель, уставки) прямо в строку факта — в
колонки ``snap_*``. Дальнейшее редактирование справочников (перепривязка точки/
пистолета, смена параметров) не меняет прошлые записи, потому что чтение идёт из
снимка, а не из живых JOIN-ов.

Функции вычисляют контекст «как сейчас» теми же связями, что и обычные чтения,
и обновляют колонки ``snap_*`` у указанной записи.

Станция берётся ТОЛЬКО из Weld Balance (app/wb_source.py, представление v_wb_gun),
а не через трансформатор: трансформатор — ручная характеристика пистолета.

Дефект: снимок пишется один раз при регистрации (app/defect_flow.register_occurrence) и
переписывается только исправлением данных человеком. Откуда снимок — defects.snap_source,
на дату ли дефекта взято из WB — defects.snap_dated (миграция 0026).
"""
import sqlite3
from datetime import datetime

from app.wb_source import defect_station_on

# defects.snap_source — кто записал снимок дефекта (миграция 0026)
SNAP_REGISTRATION = 'registration'   # при регистрации
SNAP_CORRECTION = 'correction'       # исправление данных (ОТК / WeldTeam / Редактор)
SNAP_MANUAL = 'manual'               # дефект внесён строкой в Редакторе
SNAP_WB_FILL = 'wb_fill'             # дозаполнено синхронизацией WB (app/wb_source.fill_defects_from_wb)
_NOTE = {SNAP_CORRECTION: 'данные исправлены', SNAP_MANUAL: 'внесено вручную', SNAP_WB_FILL: 'дозаполнено по WB'}


def snap_note(source, at, dated=None):
    """Пометка для карточки: откуда снимок, если не с регистрации, и не по сегодняшнему ли
    WB он взят (snap_dated=0). Обычная регистрация → ''."""
    base = _NOTE.get(source)
    if not base:
        return ''
    when = datetime.fromisoformat(at).strftime('%d.%m.%Y') if at else ''
    text = f'{base} {when}'.strip()
    if dated == 0:
        text += ' — станция и пистолет по WB на тот момент, не на дату дефекта (истории за тот день нет)'
    return text


def snapshot_maintenance(db: sqlite3.Connection, maintenance_id: int) -> None:
    """Заморозить контекст записи ТО в её snap_*-колонки."""
    row = db.execute("""
        SELECT
            g.g_num                          AS g_num,
            g.gun_type                       AS gun_type,
            vg.station_id                    AS station_id,
            -- пистолет на нескольких станциях WB: станции нет, показываем все (это в Сверке)
            COALESCE(st.station_name, REPLACE(vg.station_names, ',', ' / ')) AS station_name,
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
        LEFT JOIN v_wb_gun vg ON vg.gun_id = g.UniqueID
        LEFT JOIN station st ON st.UniqueID = vg.station_id
        LEFT JOIN brand b ON b.UniqueID = COALESCE(st.brand_id,
             (SELECT st2.brand_id FROM weld_point w2 JOIN station st2 ON st2.UniqueID = w2.station_id
               WHERE w2.gun_id = g.UniqueID LIMIT 1))
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


def snapshot_defect(db: sqlite3.Connection, defect_id: int, source: str) -> None:
    """Заморозить контекст дефекта в его snap_*-колонки; source — SNAP_REGISTRATION /
    SNAP_CORRECTION / SNAP_MANUAL (кто снимает — в snap_source, когда — в snap_at).

    Модель берётся от привязанной точки, а если точки нет (ручной ввод) —
    из ``manual_model_id``. Пистолет — тот, что записан на дефекте (gun_id).
    Станция — строго по WB на ДАТУ дефекта (точка, а без точки — пистолет;
    wb_source.defect_station_on): исправление старого дефекта берёт станцию его дня из
    истории, а если истории за тот день нет — сегодняшнюю, и snap_dated=0. Неоднозначно
    или нет в WB → пусто, дефект в Сверке. Снимок делается при регистрации и исправлении
    данных — НЕ на каждом действии и не при серийном повторе, поэтому станция на
    дефекте не «плывёт».
    """
    row = db.execute("""
        SELECT
            COALESCE(s.spot_number, d.manual_spot_number) AS spot_number,
            mo.UniqueID                                   AS model_id,
            mo.model_name                                 AS model_name,
            mo.type                                       AS model_type,
            b.UniqueID                                    AS brand_id,
            b.brand                                       AS brand,
            g.g_num                                       AS g_num,
            g.gun_type                                    AS gun_type,
            d.df_date                                     AS df_date
        FROM defects d
        LEFT JOIN spot s ON d.spot_id = s.UniqueID
        LEFT JOIN model mo ON mo.UniqueID = COALESCE(s.model_id, d.manual_model_id)
        LEFT JOIN brand b ON mo.brand_id = b.UniqueID
        LEFT JOIN gun g ON d.gun_id = g.UniqueID
        WHERE d.UniqueID = ?
        LIMIT 1
    """, (defect_id,)).fetchone()
    if not row:
        return
    # по позициям, а не по именам: вызывается и с get_db() (Row), и с обычным connection
    spot_number, model_id, model_name, model_type, brand_id, brand, g_num, gun_type, df_date = tuple(row)
    # пистолет выбрал вызывающий (на дату дефекта — _resolve_spot_gun, или человек);
    # dated здесь — про станцию: из истории дня дефекта или из сегодняшнего WB
    station_id, dated = defect_station_on(db, defect_id, df_date)
    st = db.execute('SELECT station_name FROM station WHERE UniqueID=?', (station_id,)).fetchone() if station_id else None
    db.execute("""
        UPDATE defects SET
            snap_spot_number=?, snap_model_id=?, snap_model_name=?, snap_model_type=?,
            snap_brand_id=?, snap_brand=?, snap_station_id=?, snap_station_name=?,
            snap_g_num=?, snap_gun_type=?, snap_source=?, snap_dated=?, snap_at=?
        WHERE UniqueID=?
    """, (str(spot_number) if spot_number is not None else None,
          model_id, model_name, model_type,
          brand_id, brand, station_id, st[0] if st else None,
          g_num, gun_type, source, int(dated), datetime.now().isoformat(timespec='seconds'),
          defect_id))
