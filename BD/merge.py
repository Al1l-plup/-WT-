#!/usr/bin/env python3
"""
merge.py — Безопасная инкрементальная актуализация production SQLite БД WeldTeam.

Usage:
    python merge.py --old OLD.db --new NEW.db --out work.db [--apply] [--promote]

Без --apply  → только отчёт (dry-run), файл work.db НЕ изменяется.
С  --apply   → merge выполняется на work.db, прод НЕ трогается.
С  --promote → атомарно заменяет old (прод) на work.db (только после --apply).
"""

import sqlite3
import os
import sys
import argparse
import datetime
import logging
import shutil

# ── Константы ────────────────────────────────────────────────────────────────

SKIP_TABLES = {
    'temp_import', 'temp_import_guns', 'param_temp',
    'spot_gun_temp', 'sqlite_sequence',
}

# Таблицы, где старая БД является источником истины — из новой ничего не импортируем
OLD_AUTHORITY = {'defects', 'maintenance'}

# Бизнес-ключи: поля, однозначно идентифицирующие запись (без UniqueID)
BKEYS = {
    'brand':      ['brand'],
    'model':      ['model_code'],
    'station':    ['station_name'],
    'worker':     ['email'],
    'trans':      ['transID'],
    'gun':        ['g_num'],
    'parameters': ['pressure', 'squeeze_time', 'up_slope_time',
                   'weld_1', 'heat_1', 'cool_1',
                   'weld_2', 'heat_2', 'hold', 'turn_R', 'mode'],
    'spot':       ['spot_number', 'model_id'],
    'welding_setup':                  ['spot_id', 'gun_id', 'start_date'],
    'gun_transformer_assignment':     ['gun_id', 'transformer_id'],
    'transformer_station_assignment': ['transformer_id', 'station_id'],
}

# Порядок слияния (сначала справочники, потом зависимые таблицы)
MERGE_ORDER = [
    'brand', 'model', 'station', 'worker', 'trans', 'gun', 'parameters',
    'spot', 'welding_setup',
    'gun_transformer_assignment', 'transformer_station_assignment',
]

# Защищённые поля: предпочитать значение из СТАРОЙ, если оно не пусто
PROTECTED = {'comments', 'comment', 'root_cause', 'solution', 'end_date', 'is_active'}

# Таблицы, где записи версионируются по is_active (не UPDATE, а close+insert)
VERSIONED = {'welding_setup', 'gun_transformer_assignment', 'transformer_station_assignment'}

TS = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')

# ── Логирование ───────────────────────────────────────────────────────────────

def setup_logging(out_dir: str) -> logging.Logger:
    log_path = os.path.join(out_dir, f'merge_log_{TS}.txt')
    fmt = '%(asctime)s [%(levelname)s] %(message)s'
    # Файловый хендлер — всегда UTF-8
    file_h = logging.FileHandler(log_path, encoding='utf-8')
    file_h.setFormatter(logging.Formatter(fmt))
    # Консольный хендлер — безопасная кодировка для Windows (cp1251 / utf-8)
    try:
        stream_h = logging.StreamHandler(
            open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1, closefd=False)
        )
    except Exception:
        stream_h = logging.StreamHandler(sys.stdout)
        stream_h.stream.reconfigure(errors='replace') if hasattr(stream_h.stream, 'reconfigure') else None
    stream_h.setFormatter(logging.Formatter(fmt))
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)
    root.addHandler(file_h)
    root.addHandler(stream_h)
    log = logging.getLogger('merge')
    log.info(f'Log: {log_path}')
    return log


# ── Утилиты SQLite ────────────────────────────────────────────────────────────

def open_db(path: str, readonly: bool = False) -> sqlite3.Connection:
    uri = f'file:{path}{"?mode=ro" if readonly else ""}' if readonly else path
    conn = sqlite3.connect(uri, uri=readonly, timeout=30)
    conn.row_factory = sqlite3.Row
    if not readonly:
        conn.execute('PRAGMA journal_mode=WAL')
        conn.execute('PRAGMA busy_timeout=10000')
        conn.execute('PRAGMA foreign_keys=ON')
    return conn


def online_backup(src_path: str, dst_path: str, log: logging.Logger) -> None:
    """Консистентный бэкап через SQLite Backup API (безопасно при активных соединениях)."""
    log.info(f'Online-backup: {src_path} → {dst_path}')
    src = sqlite3.connect(src_path)
    dst = sqlite3.connect(dst_path)
    src.backup(dst, pages=256)
    dst.close()
    src.close()
    log.info('Backup завершён.')


def table_columns(conn: sqlite3.Connection, table: str) -> dict:
    """Возвращает {col_name: (type, notnull, dflt_value, pk)}."""
    return {
        r['name']: (r['type'], r['notnull'], r['dflt_value'], r['pk'])
        for r in conn.execute(f'PRAGMA table_info("{table}")')
    }


def user_tables(conn: sqlite3.Connection) -> list:
    return [
        r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' "
            "AND name NOT LIKE 'sqlite_%' ORDER BY name"
        )
    ]


def db_objects(conn: sqlite3.Connection) -> dict:
    """Возвращает {name: sql} для индексов, триггеров, вью."""
    return {
        r[0]: r[1]
        for r in conn.execute(
            "SELECT name, sql FROM sqlite_master "
            "WHERE type IN ('index','trigger','view') AND sql IS NOT NULL"
        )
    }


def null_or_empty(v) -> bool:
    return v is None or (isinstance(v, str) and v.strip() == '')


# ── 1. Сравнение схем ─────────────────────────────────────────────────────────

def compare_schemas(old: sqlite3.Connection, new: sqlite3.Connection,
                    log: logging.Logger) -> dict:
    """
    Возвращает {table: {added_in_old, only_in_new, type_diff, common}}.
    Останавливается (SystemExit) при type_diff в общих столбцах — требует подтверждения.
    """
    old_tables = set(user_tables(old))
    new_tables = set(user_tables(new))
    log.info('── Сравнение схем ───────────────────────────────────────')

    only_old_tables = old_tables - new_tables - SKIP_TABLES
    only_new_tables = new_tables - old_tables - SKIP_TABLES
    if only_old_tables:
        log.info(f'  Таблицы только в СТАРОЙ: {sorted(only_old_tables)}')
    if only_new_tables:
        log.info(f'  Таблицы только в НОВОЙ (будут проигнорированы): {sorted(only_new_tables)}')

    schema_diff = {}
    has_type_diff = False
    for tbl in sorted(old_tables & new_tables - SKIP_TABLES):
        old_cols = table_columns(old, tbl)
        new_cols = table_columns(new, tbl)
        added_in_old = set(old_cols) - set(new_cols)
        only_in_new  = set(new_cols) - set(old_cols)
        common       = set(old_cols) & set(new_cols)
        type_diff    = {c for c in common if old_cols[c][0] != new_cols[c][0]}
        schema_diff[tbl] = {
            'added_in_old': added_in_old,
            'only_in_new':  only_in_new,
            'type_diff':    type_diff,
            'common':       common,
            'old_cols':     old_cols,
        }
        if added_in_old or only_in_new or type_diff:
            log.info(f'  [{tbl}]')
            if added_in_old: log.info(f'    added_in_old (сохраняем): {sorted(added_in_old)}')
            if only_in_new:  log.info(f'    only_in_new  (игнорируем): {sorted(only_in_new)}')
            if type_diff:    log.warning(f'    TYPE_DIFF: {sorted(type_diff)} — остановитесь!')
            has_type_diff = has_type_diff or bool(type_diff)
        else:
            log.debug(f'  [{tbl}] identical')

    if has_type_diff:
        log.error('Обнаружены расхождения типов столбцов. Проверьте и запустите снова.')
        sys.exit(1)

    log.info('Схемы совместимы. Расхождений типов нет.')
    return schema_diff


# ── 2. ID-карты (new_uid → old_uid) ──────────────────────────────────────────

def build_id_map(old: sqlite3.Connection, new: sqlite3.Connection,
                 table: str, log: logging.Logger) -> dict:
    """
    Строит словарь {new_uid: old_uid} по бизнес-ключу таблицы.
    Используется для перевода FK в зависимых таблицах.

    parameters исключён: поля параметров не уникальны (разные UniqueID могут иметь
    одинаковые значения), поэтому бизнес-ключ вызывает коллизии. Для parameters UID
    в обеих БД совпадают → translate_fk возвращает сырой UID (который и есть правильный).
    """
    bkey = BKEYS.get(table)
    if not bkey:
        return {}
    simple_tables = {'brand', 'model', 'station', 'worker', 'trans', 'gun'}
    if table not in simple_tables:
        return {}

    old_rows = {
        tuple(str(r[k]) for k in bkey): r['UniqueID']
        for r in old.execute(f'SELECT * FROM "{table}"')
    }
    id_map = {}
    for r in new.execute(f'SELECT * FROM "{table}"'):
        k = tuple(str(r[k]) for k in bkey)
        if k in old_rows:
            id_map[r['UniqueID']] = old_rows[k]
    log.debug(f'  id_map[{table}]: {len(id_map)} совпадений')
    return id_map


# ── 3. Merge одной таблицы ────────────────────────────────────────────────────

def translate_fk(val, id_map: dict, table: str, col: str):
    """Переводит FK-значение из пространства new → old через id_map."""
    if val is None:
        return None
    translated = id_map.get(val)
    if translated is None:
        # Значение уже корректно (или FK 1:1 совпадает — возможно при идентичных данных)
        return val
    return translated


def merge_table(old: sqlite3.Connection, new: sqlite3.Connection,
                table: str, schema_info: dict, id_maps: dict,
                apply: bool, log: logging.Logger) -> dict:
    """
    Мержит таблицу new → old.
    Возвращает {'inserted': n, 'updated': n, 'versioned': n, 'skipped': n}.
    """
    stats = {'inserted': 0, 'updated': 0, 'versioned': 0, 'skipped': 0}

    if table in OLD_AUTHORITY:
        old_count = old.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
        new_count = new.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
        log.info(f'  [{table}] OLD_AUTHORITY: old={old_count}, new={new_count} → пропускаем импорт из новой')
        return stats

    info = schema_info.get(table, {})
    # Работаем только со столбцами СТАРОЙ БД (без only_in_new)
    old_cols_all = list(info.get('old_cols', {}).keys())
    if not old_cols_all:
        # Таблица только в старой — ничего не делаем
        return stats

    bkey = BKEYS.get(table)
    if not bkey:
        log.warning(f'  [{table}] Нет бизнес-ключа — пропускаем')
        return stats

    # FK-столбцы: нужно переводить через id_maps
    FK_MAP = {
        'model_id':       ('model',   id_maps.get('model', {})),
        'brand_id':       ('brand',   id_maps.get('brand', {})),
        'station_id':     ('station', id_maps.get('station', {})),
        'gun_id':         ('gun',     id_maps.get('gun', {})),
        'transformer_id': ('trans',   id_maps.get('trans', {})),
        'spot_id':        ('spot',    id_maps.get('spot', {})),
        'parameter_id':   ('parameters', id_maps.get('parameters', {})),
        'worker_id':      ('worker',  id_maps.get('worker', {})),
        'worker_name':    ('worker',  id_maps.get('worker', {})),
    }

    # Загружаем старые строки с ключами по бизнес-ключу
    def bkey_of_old_row(r):
        return tuple(str(r[k]) if r[k] is not None else 'NULL' for k in bkey)

    old_index = {}
    for r in old.execute(f'SELECT * FROM "{table}"'):
        k = bkey_of_old_row(r)
        old_index[k] = dict(r)

    new_rows = list(new.execute(f'SELECT * FROM "{table}"'))
    log.info(f'  [{table}] new={len(new_rows)} строк, old_indexed={len(old_index)}')

    for new_row in new_rows:
        # Переводим FK-значения new → old
        translated = {}
        for col in old_cols_all:
            v = new_row[col] if col in new_row.keys() else None
            if col in FK_MAP:
                ref_table, ref_map = FK_MAP[col]
                v = translate_fk(v, ref_map, table, col)
            translated[col] = v

        # Вычисляем бизнес-ключ по переведённым значениям
        bk = tuple(str(translated.get(k, 'NULL')) if translated.get(k) is not None else 'NULL'
                   for k in bkey)

        old_row = old_index.get(bk)

        if old_row is None:
            # ── INSERT ──────────────────────────────────────────────────
            insert_cols = [c for c in old_cols_all if c != 'UniqueID']
            vals = [translated.get(c) for c in insert_cols]
            placeholders = ','.join('?' * len(insert_cols))
            col_list = ','.join(f'"{c}"' for c in insert_cols)
            sql = f'INSERT INTO "{table}" ({col_list}) VALUES ({placeholders})'
            log.debug(f'    INSERT [{table}] bkey={bk}')
            if apply:
                cur = old.execute(sql, vals)
                new_uid = new_row['UniqueID'] if 'UniqueID' in new_row.keys() else None
                if new_uid is not None and table in BKEYS:
                    if table not in id_maps:
                        id_maps[table] = {}
                    id_maps[table][new_uid] = cur.lastrowid
            stats['inserted'] += 1

        else:
            # ── UPDATE или VERSIONING ────────────────────────────────────
            if table in VERSIONED and old_row.get('is_active') == 1:
                # Проверяем: есть ли существенные изменения в НЕ-защищённых полях?
                changed = []
                for col in old_cols_all:
                    if col in ('UniqueID', *bkey):
                        continue
                    if col in PROTECTED:
                        continue
                    old_v = old_row.get(col)
                    new_v = translated.get(col)
                    if str(old_v) != str(new_v) and not (null_or_empty(old_v) and null_or_empty(new_v)):
                        changed.append((col, old_v, new_v))
                if changed:
                    changed_desc = ', '.join(f'{c}: {o!r}->{n!r}' for c, o, n in changed[:3])
                    log.debug(f'    VERSIONED [{table}] bkey={bk}: {changed_desc}')
                    if apply:
                        old.execute(
                            f'UPDATE "{table}" SET is_active=0, end_date=DATE("now") '
                            f'WHERE UniqueID=?', (old_row['UniqueID'],)
                        )
                        insert_cols = [c for c in old_cols_all if c != 'UniqueID']
                        vals = [translated.get(c) for c in insert_cols]
                        placeholders = ','.join('?' * len(insert_cols))
                        col_list = ','.join(f'"{c}"' for c in insert_cols)
                        old.execute(f'INSERT INTO "{table}" ({col_list}) VALUES ({placeholders})', vals)
                    stats['versioned'] += 1
                else:
                    stats['skipped'] += 1
            else:
                # Обычный UPDATE
                update_parts = []
                update_vals  = []
                for col in old_cols_all:
                    if col in ('UniqueID', *bkey):
                        continue
                    old_v = old_row.get(col)
                    new_v = translated.get(col)
                    if col in PROTECTED:
                        # Перезаписываем только если в старой пусто, а в новой есть
                        if null_or_empty(old_v) and not null_or_empty(new_v):
                            update_parts.append(f'"{col}"=?')
                            update_vals.append(new_v)
                        continue
                    if str(old_v) != str(new_v) and not (null_or_empty(old_v) and null_or_empty(new_v)):
                        update_parts.append(f'"{col}"=?')
                        update_vals.append(new_v)
                if update_parts:
                    update_vals.append(old_row['UniqueID'])
                    sql = f'UPDATE "{table}" SET {", ".join(update_parts)} WHERE UniqueID=?'
                    log.debug(f'    UPDATE [{table}] bkey={bk} cols={[p.split("=")[0] for p in update_parts]}')
                    if apply:
                        old.execute(sql, update_vals)
                    stats['updated'] += 1
                else:
                    stats['skipped'] += 1

    return stats


# ── 4. Проверки после merge ───────────────────────────────────────────────────

def run_checks(conn: sqlite3.Connection, old_objects: dict, log: logging.Logger) -> bool:
    ok = True

    # Integrity check
    result = conn.execute('PRAGMA integrity_check').fetchall()
    if result[0][0] != 'ok':
        log.error(f'integrity_check FAILED: {result}')
        ok = False
    else:
        log.info('integrity_check: ok')

    # FK check
    fk_errors = conn.execute('PRAGMA foreign_key_check').fetchall()
    if fk_errors:
        log.error(f'foreign_key_check FAILED: {fk_errors}')
        ok = False
    else:
        log.info('foreign_key_check: ok')

    # Проверяем наличие всех индексов/триггеров/вью старой БД
    current_objects = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type IN ('index','trigger','view') AND sql IS NOT NULL"
    )}
    missing = set(old_objects.keys()) - current_objects
    if missing:
        log.warning(f'Отсутствуют объекты из старой схемы: {missing}')
        ok = False
    else:
        log.info(f'Все объекты схемы ({len(old_objects)}) на месте.')

    return ok


def fix_sequences(conn: sqlite3.Connection, log: logging.Logger):
    """Выставляем sqlite_sequence в max(UniqueID) по каждой таблице."""
    tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).fetchall()
    for (tbl,) in tables:
        pk_col = None
        for r in conn.execute(f'PRAGMA table_info("{tbl}")'):
            if r['pk'] == 1:
                pk_col = r['name']
                break
        if pk_col is None:
            continue
        try:
            max_id = conn.execute(f'SELECT MAX("{pk_col}") FROM "{tbl}"').fetchone()[0]
            if max_id is None:
                continue
            existing = conn.execute(
                'SELECT seq FROM sqlite_sequence WHERE name=?', (tbl,)
            ).fetchone()
            if existing:
                conn.execute('UPDATE sqlite_sequence SET seq=? WHERE name=?', (max_id, tbl))
            else:
                conn.execute('INSERT INTO sqlite_sequence(name,seq) VALUES(?,?)', (tbl, max_id))
            log.debug(f'  sqlite_sequence[{tbl}] = {max_id}')
        except Exception as e:
            log.debug(f'  sqlite_sequence[{tbl}] skip: {e}')


# ── 5. Promote (подмена прода) ────────────────────────────────────────────────

def promote(old_path: str, work_path: str, backup_path: str, log: logging.Logger):
    if not os.path.exists(work_path):
        log.error(f'work.db не найден: {work_path}')
        sys.exit(1)
    if not os.path.exists(backup_path):
        log.error(f'Бэкап не найден: {backup_path} — сначала запустите без --promote')
        sys.exit(1)
    log.info('═══ PROMOTE: подмена прод-БД ════════════════════════════')
    log.info(f'  Бэкап:  {backup_path}')
    log.info(f'  Work:   {work_path}')
    log.info(f'  Prod:   {old_path}')
    # Атомарная замена через rename
    old_wal = old_path + '-wal'
    old_shm = old_path + '-shm'
    for extra in [old_wal, old_shm]:
        if os.path.exists(extra):
            os.remove(extra)
    shutil.copy2(work_path, old_path)
    log.info('PROMOTE завершён. Сайт можно перезапускать.')


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='WeldTeam DB safe merge')
    parser.add_argument('--old',     required=True,  help='Старая (production) БД')
    parser.add_argument('--new',     required=True,  help='Новая БД (источник улучшений)')
    parser.add_argument('--out',     required=True,  help='Рабочая копия (work.db)')
    parser.add_argument('--apply',   action='store_true', help='Применить merge на work.db')
    parser.add_argument('--promote', action='store_true', help='Заменить прод на work.db')
    args = parser.parse_args()

    out_dir = os.path.dirname(os.path.abspath(args.out)) or '.'
    log = setup_logging(out_dir)

    log.info('═══ WeldTeam DB Merge ══════════════════════════════════')
    log.info(f'  OLD:  {args.old}')
    log.info(f'  NEW:  {args.new}')
    log.info(f'  OUT:  {args.out}')
    log.info(f'  Mode: {"APPLY" if args.apply else "DRY-RUN"} {"+ PROMOTE" if args.promote else ""}')

    for p in [args.old, args.new]:
        if not os.path.exists(p):
            log.error(f'Файл не найден: {p}')
            sys.exit(1)

    # ── 1. Backup ──────────────────────────────────────────────────────────────
    backup_path = os.path.join(
        out_dir, f'backup_{TS}_{os.path.basename(args.old)}'
    )
    if not os.path.exists(backup_path):
        online_backup(args.old, backup_path, log)
    else:
        log.info(f'Бэкап уже существует: {backup_path}')

    # ── 2. Рабочая копия ──────────────────────────────────────────────────────
    if args.apply:
        if os.path.exists(args.out):
            os.remove(args.out)
        shutil.copy2(backup_path, args.out)
        log.info(f'Рабочая копия: {args.out}')
    else:
        log.info(f'DRY-RUN: work.db не создаётся/не изменяется.')

    # ── 3. Сравнение схем ─────────────────────────────────────────────────────
    old_conn = open_db(args.old, readonly=True)
    new_conn = open_db(args.new, readonly=True)
    schema_diff = compare_schemas(old_conn, new_conn, log)
    old_objects  = db_objects(old_conn)

    # ── 4. DIFF данных (отчёт) ────────────────────────────────────────────────
    log.info('── Счётчики строк ───────────────────────────────────────')
    all_tables = [t for t in MERGE_ORDER if t not in SKIP_TABLES]
    for tbl in sorted(user_tables(old_conn)):
        if tbl in SKIP_TABLES: continue
        no = old_conn.execute(f'SELECT COUNT(*) FROM "{tbl}"').fetchone()[0]
        nn_row = new_conn.execute(f'SELECT COUNT(*) FROM "{tbl}"').fetchone() \
                 if tbl in user_tables(new_conn) else None
        nn = nn_row[0] if nn_row else '—'
        diff_str = f'{nn-no:+}' if isinstance(nn, int) else '—'
        flag = ' ← OLD_AUTHORITY' if tbl in OLD_AUTHORITY else ''
        log.info(f'  {tbl:40} old={no:6}  new={str(nn):6}  diff={diff_str}{flag}')

    old_conn.close()
    new_conn.close()

    if not args.apply:
        log.info('═══ DRY-RUN завершён. Для применения добавьте --apply ═══')
        return

    # ── 5. Merge в транзакции ─────────────────────────────────────────────────
    log.info('── Начало merge ─────────────────────────────────────────')
    work_conn = open_db(args.out)
    new_conn  = open_db(args.new, readonly=True)

    id_maps = {}   # {table: {new_uid: old_uid}}
    total_stats = {'inserted': 0, 'updated': 0, 'versioned': 0, 'skipped': 0}

    try:
        work_conn.execute('BEGIN IMMEDIATE')

        for tbl in MERGE_ORDER:
            if tbl in SKIP_TABLES:
                continue
            if tbl not in schema_diff:
                log.warning(f'  [{tbl}] нет в schema_diff, пропуск')
                continue

            log.info(f'  Обрабатываем: {tbl}')
            stats = merge_table(work_conn, new_conn, tbl, schema_diff,
                                id_maps, apply=True, log=log)
            log.info(f'    → inserted={stats["inserted"]} updated={stats["updated"]} '
                     f'versioned={stats["versioned"]} skipped={stats["skipped"]}')
            for k in total_stats:
                total_stats[k] += stats[k]

            # Строим id_map для справочных таблиц (нужен для FK-resolution ниже)
            if tbl not in id_maps:
                id_maps[tbl] = build_id_map(work_conn, new_conn, tbl, log)

        # Пересчёт sqlite_sequence
        log.info('── Пересчёт sqlite_sequence ─────────────────────────')
        fix_sequences(work_conn, log)

        work_conn.commit()
        log.info('COMMIT выполнен.')

    except Exception as e:
        work_conn.rollback()
        log.error(f'ROLLBACK: {e}')
        raise

    # ── 6. Проверки ───────────────────────────────────────────────────────────
    log.info('── Проверки целостности ─────────────────────────────────')
    checks_ok = run_checks(work_conn, old_objects, log)

    # Проверка: only_in_old строки не потеряны (defects, maintenance и т.п.)
    old_check = open_db(args.old, readonly=True)
    for tbl in OLD_AUTHORITY:
        if tbl not in user_tables(old_check): continue
        old_cnt  = old_check.execute(f'SELECT COUNT(*) FROM "{tbl}"').fetchone()[0]
        work_cnt = work_conn.execute(f'SELECT COUNT(*) FROM "{tbl}"').fetchone()[0]
        if work_cnt < old_cnt:
            log.error(f'ПОТЕРЯ ДАННЫХ: {tbl} — старых={old_cnt}, в work={work_cnt}')
            checks_ok = False
        else:
            log.info(f'  {tbl}: old={old_cnt} → work={work_cnt} ✓')
    old_check.close()
    new_conn.close()
    work_conn.close()

    # ── 7. Итог ───────────────────────────────────────────────────────────────
    log.info('── Итог merge ───────────────────────────────────────────')
    log.info(f'  Вставлено:    {total_stats["inserted"]}')
    log.info(f'  Обновлено:    {total_stats["updated"]}')
    log.info(f'  Версионировано: {total_stats["versioned"]}')
    log.info(f'  Пропущено:    {total_stats["skipped"]}')
    log.info(f'  Проверки:     {"OK" if checks_ok else "ОШИБКИ — см. лог"}')

    if not checks_ok:
        log.error('Проверки не прошли. Прод НЕ заменяем. Проверьте лог.')
        sys.exit(1)

    # ── 8. Promote (отдельный шаг) ────────────────────────────────────────────
    if args.promote:
        promote(args.old, args.out, backup_path, log)
    else:
        log.info('═══ Merge на work.db применён. ══════════════════════')
        log.info('Чтобы заменить прод, выполните:')
        log.info(f'  1. Остановите/переведите сайт в read-only')
        log.info(f'  2. python merge.py --old "{args.old}" --new "{args.new}" '
                 f'--out "{args.out}" --apply --promote')
        log.info(f'  3. Запустите сайт, проверьте')
        log.info(f'  Бэкап сохранён: {backup_path}')


if __name__ == '__main__':
    main()
