"""Полная синхронизация Weld Balance → карточки/связки (welding_setup).

Weld Balance — источник правды для привязок «точка ↔ клещи», которые видят
Обзор, Дефекты и уставки. Скрипт приводит связки в полное соответствие WB:

1. resolve_weld_point_links для ВСЕХ строк weld_point — создаёт недостающие
   карточки точек (по коду модели, во всех модификациях: A01 → Jolion 2WD и 4WD)
   и активные связки; закрывает датой устаревшие пары затронутых точек.
2. Глобальный проход: закрывает датой активные связки, которые Weld Balance
   больше не подтверждает — только на моделях, покрытых WB, и только связки,
   созданные загрузками/из WB ('Первоначальная загрузка…', 'создано из Weld
   Balance'). Ручные связки (обогащение дефектов) не трогаются.

Запуск:
    python scripts/sync_wb_links.py            # dry-run: отчёт, БЕЗ записи
    python scripts/sync_wb_links.py --apply    # применить (сначала бэкап!)

Аудит-триггеры на время прогона снимаются (bulk-операция; журнал не засоряется),
приложение пересоздаст их при старте.
"""
import sqlite3
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from app.audit import drop_audit_triggers  # noqa: E402
from app.documents import resolve_weld_point_links  # noqa: E402

DB_PATH = ROOT / 'data' / 'welding_shop.db'

# Глобальному закрытию подлежат только связки от загрузок/WB — ручные не трогаем.
_CLOSABLE = ("(ws.comments LIKE 'Первоначальная загрузка%' "
             "OR ws.comments = 'создано из Weld Balance')")

_STALE_LINKS = f"""
    SELECT ws.UniqueID FROM welding_setup ws
    JOIN spot s ON ws.spot_id = s.UniqueID
    JOIN model m ON s.model_id = m.UniqueID
    WHERE ws.is_active = 1 AND ws.gun_id IS NOT NULL AND {_CLOSABLE}
      AND m.model_code IN (SELECT DISTINCT UPPER(model_code) FROM weld_point
                           WHERE model_code IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM weld_point wp
                      WHERE UPPER(wp.model_code) = UPPER(m.model_code)
                        AND wp.gun_id = ws.gun_id
                        AND CAST(wp.spot_number AS REAL) = CAST(s.spot_number AS REAL))
"""


def _counts(db):
    return {
        'спотов': db.execute('SELECT COUNT(*) FROM spot').fetchone()[0],
        'активных связок': db.execute(
            'SELECT COUNT(*) FROM welding_setup WHERE is_active=1').fetchone()[0],
    }


def sync(db: sqlite3.Connection, apply: bool) -> None:
    drop_audit_triggers(db)
    before = _counts(db)
    stale_before = len(db.execute(_STALE_LINKS).fetchall())

    # 1) пере-привязка всех строк WB (карточки + связки + точечные закрытия)
    wp_ids = [r[0] for r in db.execute('SELECT id FROM weld_point')]
    print(f'Строк Weld Balance: {len(wp_ids)} — пере-привязка…')
    resolve_weld_point_links(db, wp_ids)

    # 2) глобальное закрытие связок, не подтверждённых WB
    today = date.today().isoformat()
    stale = [r[0] for r in db.execute(_STALE_LINKS).fetchall()]
    db.executemany('UPDATE welding_setup SET is_active=0, end_date=? WHERE UniqueID=?',
                   [(today, i) for i in stale])

    after = _counts(db)
    print()
    print(f'{"":24}{"было":>10} {"стало":>10}')
    for k in before:
        print(f'  {k:22}{before[k]:>10} {after[k]:>10}')
    print(f'  закрыто устаревших связок (глобально): {len(stale)} '
          f'(до пере-привязки было {stale_before})')
    print()
    print('== активные связки по моделям (после) ==')
    for r in db.execute("""SELECT m.model_name || ' ' || COALESCE(m.type,''), COUNT(*)
                           FROM welding_setup ws JOIN spot s ON ws.spot_id=s.UniqueID
                           JOIN model m ON s.model_id=m.UniqueID
                           WHERE ws.is_active=1 GROUP BY m.UniqueID"""):
        print(f'  {r[0]:22} {r[1]}')

    if apply:
        db.commit()
        print('\nПрименено. Перезапустите сервер (пересоздаст аудит-триггеры).')
    else:
        db.rollback()
        print('\nDRY-RUN: изменения НЕ записаны. Запустите с --apply для применения.')


if __name__ == '__main__':
    apply = '--apply' in sys.argv
    path = next((a for a in sys.argv[1:] if not a.startswith('--')), str(DB_PATH))
    con = sqlite3.connect(path)
    try:
        sync(con, apply)
    finally:
        con.close()
