/* Excel-подобный редактор таблицы (vanilla, без зависимостей).
   Правка в ячейках, навигация клавиатурой, копирование/вставка TSV (в т.ч. из Excel),
   отметка изменений (dirty), сбор пакета изменений для сохранения одним запросом.
   Копипаст через native copy/paste-события — работает и по HTTP в локальной сети. */
class Sheet {
  constructor(container, opts) {
    this.el = container;
    this.pk = opts.pk;
    this.cols = opts.columns;                 // [{name, pk, fk}]
    this.fkLoader = opts.fkLoader || (async () => null);
    this.setData(opts.rows || []);
    this._bind();
  }

  setData(rows) {
    this.rows = rows.map(r => Object.assign({}, r));
    this.orig = this.rows.map(r => Object.assign({}, r));  // копия для вычисления dirty
    this.state = this.rows.map(() => 'clean');              // clean | new | deleted
    this.active = { r: 0, c: 0 };
    this.sel = { r1: 0, c1: 0, r2: 0, c2: 0 };
    this.render();
  }

  // ── изменения для сохранения ──────────────────────────────────────────────
  getChanges() {
    const out = [];
    this.rows.forEach((row, i) => {
      const st = this.state[i];
      if (st === 'deleted') {
        if (row[this.pk] != null && row[this.pk] !== '') out.push({ op: 'delete', pk: row[this.pk] });
      } else if (st === 'new') {
        const values = {};
        this.cols.forEach(c => { if (!c.pk && row[c.name] != null && row[c.name] !== '') values[c.name] = row[c.name]; });
        out.push({ op: 'insert', values });
      } else {
        const values = {};
        this.cols.forEach(c => {
          if (c.pk) return;
          const a = this.orig[i][c.name], b = row[c.name];
          if (String(a ?? '') !== String(b ?? '')) values[c.name] = b === '' ? null : b;
        });
        if (Object.keys(values).length) out.push({ op: 'update', pk: row[this.pk], values });
      }
    });
    return out;
  }
  dirtyCount() { return this.getChanges().length; }

  addRow() {
    const row = {}; this.cols.forEach(c => row[c.name] = c.pk ? '' : '');
    this.rows.push(row); this.orig.push({}); this.state.push('new');
    this.render(); this._focusCell(this.rows.length - 1, 1);
  }
  toggleDelete(r) {
    if (this.state[r] === 'new') { this.rows.splice(r, 1); this.orig.splice(r, 1); this.state.splice(r, 1); }
    else this.state[r] = this.state[r] === 'deleted' ? 'clean' : 'deleted';
    this.render();
  }

  // ── рендер ──────────────────────────────────────────────────────────────
  render() {
    const cols = this.cols;
    let h = '<table class="sheet"><thead><tr><th class="rownum"></th>';
    for (const c of cols)
      h += `<th data-c-name="${c.name}" title="${c.pk ? 'PK' : ''}${c.fk ? '→ ' + c.fk.table : ''}">${c.name}${c.fk ? ' 🔗' : ''}${c.pk ? ' 🔑' : ''}</th>`;
    h += '<th class="rownum"></th></tr>';
    // строка быстрого фильтра (клиентская)
    h += '<tr class="filter"><th></th>';
    for (const c of cols) h += `<th><input data-f="${c.name}" placeholder="фильтр"></th>`;
    h += '<th></th></tr></thead><tbody>';
    this.rows.forEach((row, r) => {
      const st = this.state[r];
      h += `<tr data-r="${r}" class="${st}">`;
      h += `<td class="rownum">${r + 1}</td>`;
      cols.forEach((c, ci) => {
        h += `<td data-r="${r}" data-c="${ci}" class="${this._dirtyCell(r, ci) ? 'dirty' : ''}">${this._disp(row, c)}</td>`;
      });
      h += `<td class="rownum"><button class="delrow" data-r="${r}" title="удалить/вернуть">${st === 'deleted' ? '↺' : '✕'}</button></td>`;
      h += '</tr>';
    });
    h += '</tbody></table>';
    this.el.innerHTML = h;
    this._applyFilter();
    this._paint();
  }
  _disp(row, c) {
    const v = row[c.name];
    return v === null || v === undefined ? '' : String(v).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
  }
  _dirtyCell(r, ci) {
    if (this.state[r] !== 'clean') return false;
    const name = this.cols[ci].name;
    return String(this.orig[r][name] ?? '') !== String(this.rows[r][name] ?? '');
  }
  _td(r, c) { return this.el.querySelector(`td[data-r="${r}"][data-c="${c}"]`); }

  // ── выделение/подсветка ──────────────────────────────────────────────────
  _paint() {
    this.el.querySelectorAll('td.sel,td.active').forEach(td => td.classList.remove('sel', 'active'));
    const { r1, c1, r2, c2 } = this._normSel();
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) { const td = this._td(r, c); if (td) td.classList.add('sel'); }
    const a = this._td(this.active.r, this.active.c); if (a) a.classList.add('active');
  }
  _normSel() {
    return { r1: Math.min(this.sel.r1, this.sel.r2), r2: Math.max(this.sel.r1, this.sel.r2),
             c1: Math.min(this.sel.c1, this.sel.c2), c2: Math.max(this.sel.c1, this.sel.c2) };
  }
  _focusCell(r, c) {
    r = Math.max(0, Math.min(this.rows.length - 1, r));
    c = Math.max(0, Math.min(this.cols.length - 1, c));
    this.active = { r, c }; this.sel = { r1: r, c1: c, r2: r, c2: c };
    this._paint();
    const td = this._td(r, c); if (td) td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    this.el.focus();
  }

  // ── редактирование ячейки ────────────────────────────────────────────────
  async _startEdit(initial) {
    const { r, c } = this.active; const col = this.cols[c];
    if (col.pk && this.state[r] !== 'new') return;   // PK у существующей строки не меняем
    const td = this._td(r, c); if (!td) return;
    let input;
    if (col.fk) {
      const fo = await this.fkLoader(col.fk.table);
      input = document.createElement('select');
      input.innerHTML = '<option value="">—</option>' +
        (fo ? fo.options.map(o => `<option value="${o.id}"${String(o.id) === String(this.rows[r][col.name]) ? ' selected' : ''}>${o.id} · ${o.label}</option>`).join('') : '');
    } else {
      input = document.createElement('input');
      input.value = initial != null ? initial : (this.rows[r][col.name] ?? '');
    }
    input.className = 'celledit';
    td.textContent = ''; td.appendChild(input); input.focus();
    if (input.select) input.select();
    const commit = (move) => {
      this._setCell(r, c, input.value);
      input.remove();
      if (move) this._move(move.dr, move.dc); else this._paint();
      this._renderCell(r, c);
      this._onChange();
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit({ dr: 1, dc: 0 }); }
      else if (e.key === 'Tab') { e.preventDefault(); commit({ dr: 0, dc: e.shiftKey ? -1 : 1 }); }
      else if (e.key === 'Escape') { e.preventDefault(); input.remove(); this._renderCell(r, c); this.el.focus(); }
      e.stopPropagation();
    };
    input.onblur = () => { if (input.parentNode) commit(null); };
  }
  _setCell(r, c, val) {
    const col = this.cols[c];
    if (col.pk && this.state[r] !== 'new') return;
    this.rows[r][col.name] = val;
  }
  _renderCell(r, c) {
    const td = this._td(r, c); if (!td) return;
    td.innerHTML = this._disp(this.rows[r], this.cols[c]);
    td.classList.toggle('dirty', this._dirtyCell(r, c));
  }

  // ── навигация ────────────────────────────────────────────────────────────
  _move(dr, dc, extend) {
    let r = this.active.r + dr, c = this.active.c + dc;
    r = Math.max(0, Math.min(this.rows.length - 1, r));
    c = Math.max(0, Math.min(this.cols.length - 1, c));
    this.active = { r, c };
    if (extend) { this.sel.r2 = r; this.sel.c2 = c; } else this.sel = { r1: r, c1: c, r2: r, c2: c };
    this._paint();
    const td = this._td(r, c); if (td) td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  // ── копирование/вставка ──────────────────────────────────────────────────
  _copyTSV() {
    const { r1, c1, r2, c2 } = this._normSel(); const out = [];
    for (let r = r1; r <= r2; r++) {
      const line = [];
      for (let c = c1; c <= c2; c++) line.push(this.rows[r][this.cols[c].name] ?? '');
      out.push(line.join('\t'));
    }
    return out.join('\n');
  }
  _pasteTSV(text) {
    const grid = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map(l => l.split('\t'));
    const { r: r0, c: c0 } = this.active;
    grid.forEach((line, dr) => line.forEach((val, dc) => {
      const r = r0 + dr, c = c0 + dc;
      if (r < this.rows.length && c < this.cols.length) { this._setCell(r, c, val); this._renderCell(r, c); }
    }));
    this._onChange();
  }

  _onChange() { if (this.onChange) this.onChange(this.dirtyCount()); }

  // ── обработчики ──────────────────────────────────────────────────────────
  _bind() {
    this.el.tabIndex = 0;
    this.el.addEventListener('mousedown', (e) => {
      const td = e.target.closest('td[data-c]'); const del = e.target.closest('.delrow');
      if (del) { this.toggleDelete(+del.dataset.r); this._onChange(); return; }
      if (!td) return;
      const r = +td.dataset.r, c = +td.dataset.c;
      if (e.shiftKey) { this.active = { r, c }; this.sel.r2 = r; this.sel.c2 = c; }
      else { this.active = { r, c }; this.sel = { r1: r, c1: c, r2: r, c2: c }; }
      this._paint(); this.el.focus();
    });
    this.el.addEventListener('dblclick', (e) => { if (e.target.closest('td[data-c]')) this._startEdit(); });
    this.el.addEventListener('click', (e) => {
      const th = e.target.closest('th[data-c-name]');
      if (th && this.onSort) this.onSort(th.dataset.cName);
    });
    this.el.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.f !== undefined) this._applyFilter(); });
    this.el.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.dataset.f !== undefined) return; // фильтр-инпуты
      const k = e.key;
      if (k === 'ArrowUp') { e.preventDefault(); this._move(-1, 0, e.shiftKey); }
      else if (k === 'ArrowDown') { e.preventDefault(); this._move(1, 0, e.shiftKey); }
      else if (k === 'ArrowLeft') { e.preventDefault(); this._move(0, -1, e.shiftKey); }
      else if (k === 'ArrowRight') { e.preventDefault(); this._move(0, 1, e.shiftKey); }
      else if (k === 'Tab') { e.preventDefault(); this._move(0, e.shiftKey ? -1 : 1); }
      else if (k === 'Enter' || k === 'F2') { e.preventDefault(); this._startEdit(); }
      else if (k === 'Delete') { e.preventDefault(); this._clearSel(); }
      else if ((k === 'c' || k === 'C') && (e.ctrlKey || e.metaKey)) { /* обрабатывает событие copy */ }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { this._startEdit(k); }
    });
    // native copy/paste (работает по http в локальной сети)
    document.addEventListener('copy', (e) => {
      if (!this.el.contains(document.activeElement) && document.activeElement !== this.el) return;
      e.preventDefault(); e.clipboardData.setData('text/plain', this._copyTSV());
    });
    document.addEventListener('paste', (e) => {
      if (!this.el.contains(document.activeElement) && document.activeElement !== this.el) return;
      e.preventDefault(); this._pasteTSV(e.clipboardData.getData('text/plain'));
    });
  }
  _clearSel() {
    const { r1, c1, r2, c2 } = this._normSel();
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) { this._setCell(r, c, ''); this._renderCell(r, c); }
    this._onChange();
  }
  _applyFilter() {
    const filters = {};
    this.el.querySelectorAll('input[data-f]').forEach(i => { if (i.value.trim()) filters[i.dataset.f] = i.value.trim().toLowerCase(); });
    this.el.querySelectorAll('tbody tr').forEach(tr => {
      const r = +tr.dataset.r;
      const show = Object.entries(filters).every(([col, val]) => String(this.rows[r][col] ?? '').toLowerCase().includes(val));
      tr.style.display = show ? '' : 'none';
    });
  }
}
window.Sheet = Sheet;
