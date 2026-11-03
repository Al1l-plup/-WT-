"""Дефекты: закрыть этапы, зависшие открытыми после серийного повтора.

Баг (исправлен в defect_flow.reopen_as_serial): повтор на точке, пока закрытие ждало ОТК
(pending_otk), открывал новый этап у отдела-закрывшего, а этап ОТК оставался открытым
навсегда — у дефекта два открытых этапа, «в работе» у контролёра не снималось, и отдел не
мог взять дефект.

Данные: открытый этап, за которым у дефекта есть более поздний этап, — зависший (по
процессу открытым бывает только последний этап). Закрывается моментом входа в следующий
этап с outcome serial_repeat. У этих дефектов снимается «в работе», если взявший не из
отдела текущего этапа. Иначе ничего не меняется. Правки — в Журнал, автор «миграция 0027».
Revision ID: 0027, Revises: 0026.
"""
from alembic import op

revision = '0027'
down_revision = '0026'
branch_labels = None
depends_on = None

NOTE = 'Повтор на точке — возврат отделу, закрывшему дефект (закрыто миграцией 0027)'


def repair_open_stages(run):
    """Закрыть зависшие открытые этапы и снять зависшее «в работе». run — execute
    соединения (sqlite3 conn.execute или SQLAlchemy exec_driver_sql). → id дефектов."""
    stale = run("""
        SELECT s.UniqueID, s.defect_id,
               (SELECT n.entered_at FROM defect_stage n
                 WHERE n.defect_id = s.defect_id AND n.UniqueID > s.UniqueID
                 ORDER BY n.UniqueID LIMIT 1)
        FROM defect_stage s
        WHERE s.left_at IS NULL
          AND EXISTS (SELECT 1 FROM defect_stage n WHERE n.defect_id = s.defect_id AND n.UniqueID > s.UniqueID)
        ORDER BY s.UniqueID""").fetchall()
    for sid, _did, close_at in stale:
        run("UPDATE defect_stage SET left_at=?, outcome='serial_repeat', note=COALESCE(note, ?) WHERE UniqueID=?",
            (close_at, NOTE, sid))
    defects = sorted({did for _sid, did, _at in stale})
    for did in defects:
        run("""UPDATE defects SET assigned_worker_id=NULL
               WHERE UniqueID=? AND assigned_worker_id IS NOT NULL
                 AND COALESCE((SELECT w.department FROM worker w WHERE w.UniqueID = defects.assigned_worker_id), '')
                     <> COALESCE(defects.current_stage_dept, '')""", (did,))
    return defects


def upgrade():
    conn = op.get_bind()
    since = conn.exec_driver_sql('SELECT COALESCE(MAX(id), 0) FROM change_log').fetchone()[0]
    if repair_open_stages(conn.exec_driver_sql):
        conn.exec_driver_sql("UPDATE change_log SET author='миграция 0027', batch_id='migration-0027' "
                             'WHERE id>? AND author IS NULL', (since,))


def downgrade():
    pass   # исправление данных: прежнее состояние (два открытых этапа) — ошибочное, не восстанавливаем
