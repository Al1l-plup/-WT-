"""Шпильки: модель машины по QR контрольной карты.

* stud_model_token — «модель из QR → схема шпилек». У Chery и Changan в верхнем QR
  («Multifilling + OTTC QR») третье поле — модель (CHERY_TIGGO2_PRO, CHANGAN_CS55PLUS).
  Известная модель сразу открывает свою схему, оператор модель не выбирает.
  scheme_code NULL — модель известна, но схемы шпилек для неё нет (CHERY_TIGGO_4 — кузов T19):
  выбор оператора её не «научит» чужой схеме. Незнакомую модель оператор выбирает один раз —
  первая запись её запоминает.
* stud_defect.card_qr — сырой текст QR, по которому записана машина (VIN и модель берутся из
  него одной функцией app.studs.parse_card_qr); при ручном вводе VIN — пусто.
* Схема A13T — Chery Tiggo 2 Pro (код комплектации на карте CRA13T…), а не Tiggo 4 (CRT19…):
  0028 назвала её «Chery Tiggo 4» — название исправляется (только если его не меняли руками).

Новая таблица, колонка и название одной схемы — записи журнала не меняются.
Revision ID: 0031, Revises: 0030.
"""
from alembic import op

revision = '0031'
down_revision = '0030'
branch_labels = None
depends_on = None

# по контрольным картам цеха (2026-11-12)
SEED = (('CHERY_TIGGO2_PRO', 'A13T'), ('CHANGAN_CS55PLUS', 'CS55'), ('CHERY_TIGGO_4', None))
A13T_TITLE_OLD, A13T_TITLE_NEW = 'Chery Tiggo 4', 'Chery Tiggo 2 Pro'


def _has_column(conn, table, col):
    return any(r[1] == col for r in conn.exec_driver_sql(f'PRAGMA table_info({table})').fetchall())


def upgrade():
    conn = op.get_bind()
    op.execute("""
        CREATE TABLE IF NOT EXISTS stud_model_token (
            token       TEXT PRIMARY KEY,
            scheme_code TEXT REFERENCES stud_scheme(code),
            created_at  TEXT NOT NULL,
            created_by  INTEGER
        )""")
    for token, scheme in SEED:
        conn.exec_driver_sql("INSERT OR IGNORE INTO stud_model_token (token, scheme_code, created_at) "
                             "VALUES (?, ?, datetime('now', 'localtime'))", (token, scheme))
    if not _has_column(conn, 'stud_defect', 'card_qr'):
        op.execute('ALTER TABLE stud_defect ADD COLUMN card_qr TEXT')
    # переименование схемы видно в Журнале правок — подписываем, как 0027
    since = conn.exec_driver_sql('SELECT COALESCE(MAX(id), 0) FROM change_log').fetchone()[0]
    conn.exec_driver_sql("UPDATE stud_scheme SET title=? WHERE code='A13T' AND title=?",
                         (A13T_TITLE_NEW, A13T_TITLE_OLD))
    conn.exec_driver_sql("UPDATE change_log SET author='миграция 0031', batch_id='migration-0031' "
                         'WHERE id>? AND author IS NULL', (since,))


def downgrade():
    conn = op.get_bind()
    conn.exec_driver_sql("UPDATE stud_scheme SET title=? WHERE code='A13T' AND title=?",
                         (A13T_TITLE_OLD, A13T_TITLE_NEW))
    op.execute('DROP TABLE IF EXISTS stud_model_token')
    # триггеры аудита (app.audit) ссылаются на колонку и не дали бы её удалить;
    # приложение пересоздаёт их при старте по текущей схеме
    for op_name in ('ins', 'upd', 'del'):
        op.execute(f'DROP TRIGGER IF EXISTS "audit_stud_defect_{op_name}"')
    try:
        op.execute('ALTER TABLE stud_defect DROP COLUMN card_qr')
    except Exception:  # noqa: BLE001 — старый SQLite без DROP COLUMN: поле безвредно
        pass
