"""Telegram-уведомления = «Мои входящие» в виде пингов. Адресация (зоны / WeldTeam
только на своём этапе / ОТК-опенер), outbox и отправка. Сеть мокаем."""
import sqlite3
from datetime import date, datetime, timedelta
from datetime import time as dtime

from app import defect_flow as df
from app.notifications import enqueue_stage_arrival, process_outbox, process_reminders, send_telegram


def _db(app):
    return sqlite3.connect(app.config['DB_PATH'])


def _mk_defect(otk, g=96500):
    return otk.post('/api/defects/register_manual',
                    json={'g_num': g, 'problem_code': 'CR'}).get_json()['defect_id']


def _setup(app, register_client):
    """ОТК-регистратор(tg), Производство A(UB)/B(MB)/C(без зон)/D(UB, без tg), WeldTeam(tg)."""
    otk = register_client(department='ОТК', login='n_otk@weldteam.kz')
    register_client(department='Производство', login='n_a@weldteam.kz')
    register_client(department='Производство', login='n_b@weldteam.kz')
    register_client(department='Производство', login='n_c@weldteam.kz')
    register_client(department='Производство', login='n_d@weldteam.kz')
    register_client(department='WeldTeam',     login='n_wt@weldteam.kz')
    did = _mk_defect(otk)

    db = _db(app)
    wid = lambda lg: db.execute('SELECT UniqueID FROM worker WHERE login=?', (lg,)).fetchone()[0]
    ids = {lg: wid(lg) for lg in ('n_otk@weldteam.kz', 'n_a@weldteam.kz', 'n_b@weldteam.kz',
                                  'n_c@weldteam.kz', 'n_d@weldteam.kz', 'n_wt@weldteam.kz')}
    bname = db.execute('SELECT brand FROM brand WHERE UniqueID=1').fetchone()[0]
    db.execute("INSERT INTO worker_area (worker_id,brand_id,segment) VALUES (?,1,'UB')", (ids['n_a@weldteam.kz'],))
    db.execute("INSERT INTO worker_area (worker_id,brand_id,segment) VALUES (?,1,'MB')", (ids['n_b@weldteam.kz'],))
    db.execute("INSERT INTO worker_area (worker_id,brand_id,segment) VALUES (?,1,'UB')", (ids['n_d@weldteam.kz'],))
    db.execute('UPDATE worker SET tg_chat_id=? WHERE UniqueID=?', ('111', ids['n_otk@weldteam.kz']))
    db.execute('UPDATE worker SET tg_chat_id=? WHERE UniqueID=?', ('201', ids['n_a@weldteam.kz']))
    db.execute('UPDATE worker SET tg_chat_id=? WHERE UniqueID=?', ('202', ids['n_b@weldteam.kz']))
    db.execute('UPDATE worker SET tg_chat_id=? WHERE UniqueID=?', ('203', ids['n_c@weldteam.kz']))
    db.execute('UPDATE worker SET tg_chat_id=? WHERE UniqueID=?', ('301', ids['n_wt@weldteam.kz']))
    db.execute('UPDATE defects SET snap_brand=?, snap_station_name=? WHERE UniqueID=?', (bname, 'CH-UB-90', did))
    db.execute('DELETE FROM notification_outbox')   # очистим авто-постановку
    db.commit()
    return did, ids, db


def _chats(db):
    return sorted(r[0] for r in db.execute("SELECT chat_id FROM notification_outbox"))


def test_enqueue_production_stage_by_zone(register_client, app):
    did, ids, db = _setup(app, register_client)
    n = enqueue_stage_arrival(db, did, 'Производство'); db.commit()
    # A (UB совпал) + C (без зон). НЕ B (MB), НЕ D (без tg), НЕ WeldTeam (чужой этап), НЕ ОТК
    assert _chats(db) == ['201', '203']
    assert n == 2


def test_enqueue_weldteam_only_on_its_stage(register_client, app):
    did, ids, db = _setup(app, register_client)
    enqueue_stage_arrival(db, did, 'WeldTeam'); db.commit()
    # WeldTeam без зон → по всем станциям, но только на этапе WeldTeam. Производство/ОТК молчат
    assert _chats(db) == ['301']


def test_enqueue_otk_goes_to_opener_only(register_client, app):
    did, ids, db = _setup(app, register_client)
    enqueue_stage_arrival(db, did, 'ОТК'); db.commit()
    assert _chats(db) == ['111']               # только открывший контролёр, без WeldTeam


def test_open_stage_triggers_enqueue(register_client, app):
    """Боевой путь: регистрация (→ _open_stage) ставит уведомление адресату первого этапа."""
    otk = register_client(department='ОТК', login='o_live@weldteam.kz')
    db = _db(app)
    first = df.route_for(db, 'CR')[0]
    db.close()
    if first == 'ОТК':
        db = _db(app); db.execute("UPDATE worker SET tg_chat_id='900' WHERE login='o_live@weldteam.kz'"); db.commit(); db.close()
    else:
        register_client(department=first, login='first_live@weldteam.kz')   # без зон → совпадёт
        db = _db(app); db.execute("UPDATE worker SET tg_chat_id='900' WHERE login='first_live@weldteam.kz'"); db.commit(); db.close()
    did = _mk_defect(otk, g=96777)
    db = _db(app)
    rows = db.execute("SELECT COUNT(*) FROM notification_outbox WHERE chat_id='900' AND defect_id=?", (did,)).fetchone()[0]
    db.close()
    assert rows >= 1


def test_process_outbox_marks_sent_and_failed(register_client, app):
    did, ids, db = _setup(app, register_client)
    enqueue_stage_arrival(db, did, 'Производство'); db.commit()
    calls = []
    ok_sender = lambda token, chat, text: (calls.append(chat) or (True, None))
    assert process_outbox(db, token='x', sender=ok_sender) == 2
    assert db.execute("SELECT COUNT(*) FROM notification_outbox WHERE status='sent'").fetchone()[0] == 2
    assert db.execute("SELECT COUNT(*) FROM notification_outbox WHERE status='pending'").fetchone()[0] == 0

    enqueue_stage_arrival(db, did, 'ОТК'); db.commit()          # +1 pending (опенер 111)
    fail_sender = lambda token, chat, text: (False, 'boom')
    for _ in range(6):
        process_outbox(db, token='x', sender=fail_sender)
    assert db.execute("SELECT COUNT(*) FROM notification_outbox WHERE status='failed'").fetchone()[0] >= 1
    assert db.execute("SELECT COUNT(*) FROM notification_outbox WHERE status='pending'").fetchone()[0] == 0
    db.close()


def test_send_telegram_without_token_is_safe():
    ok, err = send_telegram('', '123', 'hi')
    assert ok is False and err == 'no token'


# ── привязка (Фаза 2) ──────────────────────────────────────────────────────────
def test_link_from_update_binds_and_rejects(client, app):
    from app.notifications import link_from_update
    db = _db(app)
    wid = db.execute("SELECT UniqueID FROM worker WHERE login='test@weldteam.kz'").fetchone()[0]
    db.execute("UPDATE worker SET tg_link_code='abc123' WHERE UniqueID=?", (wid,)); db.commit()
    chat, reply = link_from_update(db, {'message': {'chat': {'id': 999}, 'text': '/start nope'}})
    assert chat == 999 and 'не найден' in reply.lower()         # неверный код — не привязывает
    chat, reply = link_from_update(db, {'message': {'chat': {'id': 555}, 'text': '/start abc123'}})
    assert chat == 555 and 'подключены' in reply.lower()        # верный — привязывает
    row = db.execute('SELECT tg_chat_id, tg_link_code FROM worker WHERE UniqueID=?', (wid,)).fetchone()
    assert row[0] == '555' and row[1] is None                   # chat_id записан, код стёрт
    db.close()


def test_tg_link_and_unlink_endpoints(client, app):
    app.config['TG_BOT_USERNAME'] = 'weldteam_bot'
    j = client.post('/api/tg/link').get_json()
    assert j['status'] == 'success' and j['link'].startswith('https://t.me/weldteam_bot?start=')
    db = _db(app)
    code = db.execute("SELECT tg_link_code FROM worker WHERE login='test@weldteam.kz'").fetchone()[0]
    assert code and code in j['link']
    db.execute("UPDATE worker SET tg_chat_id='777' WHERE login='test@weldteam.kz'"); db.commit(); db.close()
    assert client.post('/api/tg/unlink').get_json()['status'] == 'success'
    db = _db(app)
    assert db.execute("SELECT tg_chat_id FROM worker WHERE login='test@weldteam.kz'").fetchone()[0] is None
    db.close()


def test_tg_link_without_username_is_503(client, app):
    app.config['TG_BOT_USERNAME'] = ''
    assert client.post('/api/tg/link').status_code == 503


def test_me_exposes_tg_fields(client, app):
    me = client.get('/api/me').get_json()
    assert me['tg_available'] is False and me['tg_connected'] is False
    db = _db(app)
    db.execute("UPDATE worker SET tg_chat_id='888' WHERE login='test@weldteam.kz'"); db.commit(); db.close()
    assert client.get('/api/me').get_json()['tg_connected'] is True


# ── напоминания (Фаза 3) ──────────────────────────────────────────────────────
def _reminder_setup(app, register_client):
    """Дефект на открытом этапе с подключённым получателем (chat 900). Возвращает (did, db)."""
    otk = register_client(department='ОТК', login='r_otk@weldteam.kz')
    db = _db(app)
    first = df.route_for(db, 'CR')[0]
    db.close()
    link_login = 'r_otk@weldteam.kz' if first == 'ОТК' else 'r_first@weldteam.kz'
    if first != 'ОТК':
        register_client(department=first, login=link_login)
    db = _db(app)
    db.execute('UPDATE worker SET tg_chat_id=? WHERE login=?', ('900', link_login)); db.commit(); db.close()
    did = otk.post('/api/defects/register_manual', json={'g_num': 96800, 'problem_code': 'CR'}).get_json()['defect_id']
    db = _db(app)
    db.execute('DELETE FROM notification_outbox')   # убрать первичный пинг — проверяем именно напоминание
    db.commit()
    return did, db


def _set_last_notified(db, did, when_dt):
    db.execute('UPDATE defect_stage SET last_notified_at=? WHERE defect_id=? AND left_at IS NULL',
               (when_dt.isoformat(timespec='seconds'), did)); db.commit()


def _pings(db, did):
    return db.execute("SELECT COUNT(*) FROM notification_outbox WHERE chat_id='900' AND defect_id=?", (did,)).fetchone()[0]


def test_reminder_fires_when_due_and_in_window(register_client, app):
    did, db = _reminder_setup(app, register_client)
    now_dt = datetime.combine(date.today(), dtime(10, 0))        # 10:00 — в окне 07:30–16:30
    _set_last_notified(db, did, now_dt - timedelta(hours=2))      # пинг был 2ч назад → пора
    assert process_reminders(db, now_dt=now_dt) == 1
    assert _pings(db, did) >= 1
    db.close()


def test_reminder_skipped_outside_window(register_client, app):
    did, db = _reminder_setup(app, register_client)
    now_dt = datetime.combine(date.today(), dtime(6, 0))         # до 07:30
    _set_last_notified(db, did, now_dt - timedelta(hours=2))
    assert process_reminders(db, now_dt=now_dt) == 0
    assert _pings(db, did) == 0
    db.close()


def test_reminder_skipped_when_claimed(register_client, app):
    did, db = _reminder_setup(app, register_client)
    now_dt = datetime.combine(date.today(), dtime(10, 0))
    _set_last_notified(db, did, now_dt - timedelta(hours=2))
    db.execute('UPDATE defects SET assigned_worker_id=(SELECT UniqueID FROM worker LIMIT 1) WHERE UniqueID=?', (did,))
    db.commit()
    assert process_reminders(db, now_dt=now_dt) == 0
    assert _pings(db, did) == 0
    db.close()


def test_reminder_skipped_when_not_due(register_client, app):
    did, db = _reminder_setup(app, register_client)
    now_dt = datetime.combine(date.today(), dtime(10, 0))
    _set_last_notified(db, did, now_dt - timedelta(minutes=10))   # всего 10 мин назад
    assert process_reminders(db, now_dt=now_dt) == 0
    assert _pings(db, did) == 0
    db.close()
