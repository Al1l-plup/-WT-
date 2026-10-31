"""Telegram-уведомления о событиях дефектов (outbox-паттерн).

Поток данных:
1. Смена этапа дефекта (defect_flow._open_stage) вызывает enqueue_stage_arrival(),
   которая в ТОЙ ЖЕ транзакции пишет строки в notification_outbox — по одной на
   получателя. Падение Telegram/сети здесь ни на что не влияет: это локальная запись.
2. Фоновый поток (start_sender) периодически берёт pending-строки и шлёт в Telegram
   с ретраями, помечая sent/failed. Доставка полностью отвязана от HTTP-запроса.

Кому слать — ровно «Мои входящие», но в виде уведомления: работник получает пинг,
когда дефект попадает в его «входящие» (его текущий этап согласования):
работникам отдела этапа, у кого дефект попадает в их участок (бренд+участок) или у кого
зоны не заданы. У ОТК и WeldTeam зон нет → пинг получает весь отдел (по всем станциям),
но только когда дефект на ИХ этапе. Так у ОТК: проверить закрытие может любой
контролёр — пинг тоже всем ОТК (а не только открывшему).
Шлём только тем, кто подключил Telegram (worker.tg_chat_id задан) и активен.

Без токена (config TG_BOT_TOKEN пуст) фоновый поток не стартует, а send_telegram
возвращает ошибку «no token» — очередь просто копится/спит, ничего не ломается.
"""
import json
import logging
import os
import sqlite3
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from datetime import time as dtime

from app.defect_flow import OPEN_STATUSES, _now, defect_area, station_name_for, worker_areas

log = logging.getLogger(__name__)

_MAX_ATTEMPTS = 5


# ── адресация ────────────────────────────────────────────────────────────────
def _compose_message(code, spot, seg, dept, site_url=''):
    """Короткий пинг: что за дефект и куда зайти (+ ссылка на сайт, если задана)."""
    head = f'🔧 Дефект {code}' if code else '🔧 Новый дефект'
    if spot and str(spot) != '—':
        head += f', точка {spot}'
    if seg:
        head += f' · участок {seg}'
    msg = f'{head} — этап «{dept}». Загляните: Дефекты → Мои входящие.'
    if site_url:
        msg += f'\n{site_url.rstrip("/")}/defects'
    return msg


def _in_zone(zone_pairs, zone_segs, brand_txt, seg):
    """True, если дефект (бренд+участок) попадает в зоны работника — как на доске."""
    if not seg:
        return True                                   # дефект без участка виден всем
    if (brand_txt, seg) in zone_pairs:
        return True
    if (not brand_txt or brand_txt == '—') and seg in zone_segs:
        return True
    return False


def resolve_recipients(conn, defect_id, dept, brand_txt, seg):
    """{worker_id: chat_id} — кому слать уведомление о попадании дефекта на этап dept.
    = ровно те, у кого дефект сейчас в «Мои входящие» (та же логика, что mine на доске):
    работники этапа, у кого дефект попадает в их участок, или у кого зоны не заданы."""
    recipients = {}
    brand_name = {bid: name for bid, name in conn.execute('SELECT UniqueID, brand FROM brand')}
    for wid, chat in conn.execute('SELECT UniqueID, tg_chat_id FROM worker '
                                  'WHERE department=? AND is_active=1 AND tg_chat_id IS NOT NULL', (dept,)):
        zones = worker_areas(conn, wid)
        if not zones:
            recipients[wid] = chat                    # зоны не заданы → весь отдел по всем станциям
        else:
            pairs = {(brand_name.get(b), s) for (b, s) in zones}
            segs = {s for (_b, s) in zones}
            if _in_zone(pairs, segs, brand_txt, seg):
                recipients[wid] = chat
    return recipients


def enqueue_stage_arrival(conn, defect_id, dept):
    """Поставить в очередь уведомления о попадании дефекта на этап dept. Пишет в ту же
    транзакцию, что и смена этапа. Возвращает число поставленных уведомлений."""
    if not dept:
        return 0
    info = conn.execute("""
        SELECT d.problem_code,
               COALESCE(d.snap_brand, b.brand, eb.brand)                      AS brand,
               COALESCE(d.snap_spot_number, s.spot_number, d.manual_spot_number) AS spot
        FROM defects d
        LEFT JOIN spot  s  ON d.spot_id = s.UniqueID
        LEFT JOIN model m  ON s.model_id = m.UniqueID
        LEFT JOIN brand b  ON m.brand_id = b.UniqueID
        LEFT JOIN model em ON d.manual_model_id = em.UniqueID
        LEFT JOIN brand eb ON em.brand_id = eb.UniqueID
        WHERE d.UniqueID=?""", (defect_id,)).fetchone()
    if not info:
        return 0
    code, brand_txt, spot = info
    seg = defect_area(station_name_for(conn, defect_id))
    # анкор часового ритма напоминаний на текущем открытом этапе (ставится и при первом
    # пинге, и при каждом повторном — даже если подключённых получателей сейчас нет)
    conn.execute('UPDATE defect_stage SET last_notified_at=? WHERE defect_id=? AND left_at IS NULL',
                 (_now(), defect_id))
    recipients = resolve_recipients(conn, defect_id, dept, brand_txt, seg)
    if not recipients:
        return 0
    text = _compose_message(code, spot, seg, dept, os.environ.get('WELDTEAM_SITE_URL', ''))
    now = _now()
    for wid, chat in recipients.items():
        conn.execute("INSERT INTO notification_outbox "
                     "(created_at, worker_id, chat_id, text, defect_id, status, attempts) "
                     "VALUES (?,?,?,?,?, 'pending', 0)", (now, wid, str(chat), text, defect_id))
    return len(recipients)


# ── отправка ─────────────────────────────────────────────────────────────────
def send_telegram(token, chat_id, text, timeout=10):
    """Отправить сообщение в Telegram. Возвращает (ok, error). Сеть/ошибки не бросает."""
    if not token:
        return (False, 'no token')
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    data = urllib.parse.urlencode({'chat_id': str(chat_id), 'text': text}).encode()
    req = urllib.request.Request(url, data=data, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode())
            return (True, None) if body.get('ok') else (False, str(body.get('description') or body)[:300])
    except urllib.error.HTTPError as e:
        try:
            desc = json.loads(e.read().decode()).get('description')
        except Exception:
            desc = None
        return (False, f'HTTP {e.code}: {desc or e.reason}'[:300])
    except Exception as e:                                        # noqa: BLE001 — сеть не должна бросать
        return (False, str(e)[:300])


def process_outbox(conn, token, limit=50, max_attempts=_MAX_ATTEMPTS, sender=None):
    """Разослать pending-уведомления. sender инъектируется в тестах. Возвращает число
    успешно отправленных."""
    sender = sender or send_telegram
    rows = conn.execute("SELECT id, chat_id, text FROM notification_outbox "
                        "WHERE status='pending' AND attempts < ? ORDER BY id LIMIT ?",
                        (max_attempts, limit)).fetchall()
    sent = 0
    for rid, chat, text in rows:
        ok, err = sender(token, chat, text)
        if ok:
            conn.execute("UPDATE notification_outbox SET status='sent', sent_at=?, "
                         "attempts=attempts+1, last_error=NULL WHERE id=?", (_now(), rid))
            sent += 1
        else:
            conn.execute("UPDATE notification_outbox SET attempts=attempts+1, last_error=?, "
                         "status=CASE WHEN attempts+1 >= ? THEN 'failed' ELSE 'pending' END "
                         "WHERE id=?", (str(err)[:300], max_attempts, rid))
        conn.commit()
    return sent


# ── напоминания о непринятых дефектах ─────────────────────────────────────────
def _parse_hhmm(s):
    h, m = str(s).split(':')
    return dtime(int(h), int(m))


def _within_window(now_dt, remind_from, remind_to):
    """True, если локальное время now_dt попадает в окно [from, to] (одни сутки)."""
    return _parse_hhmm(remind_from) <= now_dt.time() <= _parse_hhmm(remind_to)


def process_reminders(conn, now_dt=None, remind_from='07:30', remind_to='16:30', interval_min=60):
    """Повторно пингануть этапы, где дефект не взят в работу (assigned_worker_id IS NULL),
    этап открыт и прошло >= interval_min с последнего пинга. Только в окне [from, to].
    Возвращает число напомненных этапов. now_dt — для тестов (по умолчанию локальное сейчас)."""
    now_dt = now_dt or datetime.now()
    if not _within_window(now_dt, remind_from, remind_to):
        return 0
    cutoff = (now_dt - timedelta(minutes=interval_min)).isoformat(timespec='seconds')
    placeholders = ','.join('?' * len(OPEN_STATUSES))
    rows = conn.execute(f"""
        SELECT d.UniqueID, d.current_stage_dept
        FROM defects d
        JOIN defect_stage s ON s.defect_id = d.UniqueID AND s.left_at IS NULL
        WHERE d.assigned_worker_id IS NULL
          AND COALESCE(d.status,'registered') IN ({placeholders})
          AND COALESCE(s.last_notified_at, s.entered_at) <= ?
    """, (*OPEN_STATUSES, cutoff)).fetchall()
    for did, dept in rows:
        enqueue_stage_arrival(conn, did, dept)   # повторный пинг + сдвиг last_notified_at
    conn.commit()
    return len(rows)


_reminder_started = False


def start_reminder_scheduler(app, tick=60):
    """Фоновый тик напоминаний (раз в tick секунд). Без токена и в тестах — no-op."""
    global _reminder_started
    token = app.config.get('TG_BOT_TOKEN')
    if not token or app.config.get('TESTING') or _reminder_started:
        return
    _reminder_started = True
    db_path = app.config['DB_PATH']
    frm = app.config.get('TG_REMIND_FROM', '07:30')
    to = app.config.get('TG_REMIND_TO', '16:30')
    interval = app.config.get('TG_REMIND_INTERVAL_MIN', 60)

    def loop():
        while True:
            try:
                conn = sqlite3.connect(db_path)
                try:
                    process_reminders(conn, remind_from=frm, remind_to=to, interval_min=interval)
                finally:
                    conn.close()
            except Exception:                                    # noqa: BLE001
                log.warning('Тик напоминаний упал', exc_info=True)
            time.sleep(tick)

    threading.Thread(target=loop, name='tg-reminders', daemon=True).start()
    log.info('Планировщик напоминаний запущен (окно %s–%s, интервал %s мин)', frm, to, interval)


# ── привязка аккаунта (long-polling, без вебхука/HTTPS) ───────────────────────
def link_from_update(conn, update):
    """Обработать одно обновление Telegram. На `/start <код>` привязывает chat_id к
    работнику по tg_link_code. Возвращает (chat_id, ответный_текст) или (None, None)."""
    msg = (update or {}).get('message') or {}
    chat = (msg.get('chat') or {}).get('id')
    text = (msg.get('text') or '').strip()
    if not chat or not text.startswith('/start'):
        return (None, None)
    parts = text.split(maxsplit=1)
    code = parts[1].strip() if len(parts) > 1 else ''
    if not code:
        return (chat, 'Откройте «Подключить Telegram» на сайте — ссылка содержит код привязки.')
    row = conn.execute('SELECT UniqueID, surname, name FROM worker '
                       'WHERE tg_link_code=? AND is_active=1', (code,)).fetchone()
    if not row:
        return (chat, 'Код не найден или устарел. Сгенерируйте новую ссылку на сайте.')
    conn.execute('UPDATE worker SET tg_chat_id=?, tg_link_code=NULL WHERE UniqueID=?', (str(chat), row[0]))
    conn.commit()
    return (chat, f'Готово, {row[1]} {row[2]}! Уведомления о дефектах подключены. Отключить — на сайте.')


def _get_updates(token, offset, timeout):
    url = f'https://api.telegram.org/bot{token}/getUpdates?timeout={timeout}'
    if offset is not None:
        url += f'&offset={offset}'
    with urllib.request.urlopen(urllib.request.Request(url), timeout=timeout + 10) as resp:
        body = json.loads(resp.read().decode())
    return body.get('result', []) if body.get('ok') else []


_poller_started = False


def start_poller(app, timeout=25):
    """Фоновый long-polling для привязки (/start <код>). Без токена и в тестах — no-op."""
    global _poller_started
    token = app.config.get('TG_BOT_TOKEN')
    if not token or app.config.get('TESTING') or _poller_started:
        return
    _poller_started = True
    db_path = app.config['DB_PATH']

    def loop():
        offset = None
        while True:
            try:
                for upd in _get_updates(token, offset, timeout):
                    offset = upd.get('update_id', 0) + 1
                    conn = sqlite3.connect(db_path)
                    try:
                        chat, reply = link_from_update(conn, upd)
                    finally:
                        conn.close()
                    if chat and reply:
                        send_telegram(token, chat, reply)
            except Exception:                                    # noqa: BLE001
                log.warning('Telegram getUpdates/привязка упали', exc_info=True)
                time.sleep(3)

    threading.Thread(target=loop, name='tg-poller', daemon=True).start()
    log.info('Telegram-поллер привязки запущен')


# ── фоновый отправитель ────────────────────────────────────────────────────────
_sender_started = False


def start_sender(app, interval=5):
    """Запустить фоновый поток-отправитель (один раз). Без токена и в тестах — no-op."""
    global _sender_started
    token = app.config.get('TG_BOT_TOKEN')
    if not token or app.config.get('TESTING') or _sender_started:
        return
    _sender_started = True
    db_path = app.config['DB_PATH']

    def loop():
        while True:
            try:
                conn = sqlite3.connect(db_path)
                try:
                    process_outbox(conn, token)
                finally:
                    conn.close()
            except Exception:                                    # noqa: BLE001
                log.warning('Цикл отправки уведомлений упал', exc_info=True)
            time.sleep(interval)

    threading.Thread(target=loop, name='tg-outbox-sender', daemon=True).start()
    log.info('Telegram-отправитель запущен (интервал %ss)', interval)
