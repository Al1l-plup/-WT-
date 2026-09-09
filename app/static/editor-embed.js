/* Встраиваемый редактор «документа» на движке sheet.js — тот же грид, что в /admin,
   но компактной панелью и без вкладок. Используется на /maintenance и /defects,
   чтобы записи ТО/дефектов правились как в «Редакторе» (правка ячеек, копипаст,
   добавление/удаление строк), с полным аудитом (change_log) и откатом в Журнале.

   Использование:  await mountFactEditor(hostElOrSelector, 'maintenance');
   Права: чтение/запись определяет сервер по разделу «Редактор» (RBAC). Для отделов
   «только чтение» грид открывается без кнопок сохранения/добавления. */
(function () {
  const jget = async u => {
    const r = await fetch(u);
    if (!r.ok) throw new Error(`${u} → HTTP ${r.status}`);
    return r.json();
  };
  const hdr = () => ({ 'Content-Type': 'application/json' });
  const enc = encodeURIComponent;

  let mePromise = null;
  const getMe = () => (mePromise = mePromise || jget('/api/me').catch(() => ({})));

  // FK-опции (id → подпись). Первая не-PK колонка справочника = подпись (как в admin.html).
  const fkCache = {};
  async function fkLoader(tbl) {
    if (!fkCache[tbl]) {
      const d = await jget(`/api/admin/table/${tbl}?limit=1000`);
      const label = d.columns.map(c => c.name).find(n => n !== d.pk) || d.pk;
      fkCache[tbl] = { options: d.rows.map(r => ({ id: r[d.pk], label: r[label] })) };
    }
    return fkCache[tbl];
  }

  window.mountFactEditor = async function (host, docId) {
    host = typeof host === 'string' ? document.querySelector(host) : host;
    if (!host || typeof Sheet === 'undefined') return null;

    const me = await getMe();
    const readonly = !!me.readonly;
    host.classList.add('fed');
    host.innerHTML =
      `<div class="fed-bar">
         <input class="fed-q" placeholder="поиск по записям…">
         ${readonly ? '' : '<button class="btn btn-ghost btn-sm" data-a="add" type="button">+ строка</button>'}
         <button class="btn btn-ghost btn-sm" data-a="undo" type="button" title="Отменить (Ctrl+Z)" disabled>↶</button>
         <button class="btn btn-ghost btn-sm" data-a="redo" type="button" title="Вернуть (Ctrl+Y)" disabled>↷</button>
         ${readonly ? '' : '<button class="btn btn-primary btn-sm" data-a="save" type="button">Сохранить <span class="fed-cnt"></span></button>'}
         <button class="btn btn-ghost btn-sm" data-a="reload" type="button">Обновить</button>
         <span class="badge fed-page"></span>
       </div>
       <div class="fed-msg" hidden></div>
       <div class="grid fed-grid"></div>`;

    const q = host.querySelector('.fed-q');
    const gridEl = host.querySelector('.fed-grid');
    const msgEl = host.querySelector('.fed-msg');
    const cntEl = host.querySelector('.fed-cnt');
    const pageEl = host.querySelector('.fed-page');
    const btn = a => host.querySelector(`[data-a="${a}"]`);

    let sheet = null, primary = null, sort = '', dir = 'asc';
    const page = 0, pageSize = 100000;  // грузим всё: фильтр/сортировка идут по всем строкам

    const msg = (t, kind) => { msgEl.hidden = !t; msgEl.textContent = t || ''; msgEl.className = 'fed-msg' + (kind ? ' ' + kind : ''); };
    const setCnt = () => { if (cntEl) cntEl.textContent = sheet && sheet.dirtyCount() ? `(${sheet.dirtyCount()})` : ''; };
    const guard = () => { const d = sheet && sheet.dirtyCount(); return !d || confirm('Есть несохранённые изменения. Отменить их?'); };

    async function load() {
      try {
        const s = sort ? `&sort=${sort}&dir=${dir}` : '';
        const d = await jget(`/api/admin/doc/${docId}?limit=${pageSize}&offset=${page * pageSize}&q=${enc(q.value.trim())}${s}`);
        primary = d.primary;
        let cols = d.columns;
        if (readonly) cols = cols.map(c => ({ ...c, editable: false }));
        const fkMaps = {};
        for (const c of cols) if (c.fk) {
          const fo = await fkLoader(c.fk);
          fkMaps[c.field] = new Map(fo.options.map(o => [String(o.id), o.label]));
        }
        sheet = new Sheet(gridEl, {
          columns: cols, rows: d.rows, fkLoader, fkMaps,
          naturalOrder: sort === '', storageKey: 'fed-' + docId, sortField: sort, sortDir: dir,
        });
        sheet.onChange = setCnt;
        sheet.onUndoState = (u, r) => { if (btn('undo')) btn('undo').disabled = !u; if (btn('redo')) btn('redo').disabled = !r; };
        sheet.onSort = col => {
          if (!guard()) return;
          if (sort === col) { if (dir === 'asc') dir = 'desc'; else { sort = ''; dir = 'asc'; } }
          else { sort = col; dir = 'asc'; }
          load();
        };
        const from = d.total ? page * pageSize + 1 : 0, to = Math.min((page + 1) * pageSize, d.total);
        pageEl.textContent = `${from}–${to} из ${d.total}`;
        setCnt(); msg('');
      } catch (e) { msg('Не удалось загрузить редактор: ' + e.message, 'err'); }
    }

    async function save() {
      const changes = [];
      for (const dd of sheet.diff()) {
        if (dd.state === 'deleted') changes.push({ op: 'delete', pk: dd.pkValues[primary] });
        else if (dd.state === 'new') changes.push({ op: 'insert', values: dd.changed });
        else for (const f in dd.changed) changes.push({ op: 'update', field: f, value: dd.changed[f], row_pks: dd.pkValues });
      }
      if (!changes.length) { msg('Нет изменений'); return; }
      try {
        const res = await (await fetch(`/api/admin/doc/${docId}/batch`, { method: 'POST', headers: hdr(), body: JSON.stringify({ changes }) })).json();
        if (res.status === 'success') { for (const k in fkCache) delete fkCache[k]; msg('Сохранено', 'ok'); load(); }
        else msg(res.message || 'Ошибка сохранения', 'err');
      } catch (e) { msg('Ошибка: ' + e.message, 'err'); }
    }

    host.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      const act = a.dataset.a;
      if (act === 'add') sheet && sheet.addRow();
      else if (act === 'undo') sheet && sheet.undo();
      else if (act === 'redo') sheet && sheet.redo();
      else if (act === 'save') save();
      else if (act === 'reload') { if (guard()) load(); }
    });
    let qt;
    q.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => { if (guard()) load(); }, 400); });

    await load();
    return { reload: load };
  };
})();
