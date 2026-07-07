/* Excel-подобный редактор таблицы (vanilla, без зависимостей) с ВИРТУАЛЬНЫМ СКРОЛЛОМ.
   Все строки держим в памяти (фильтр/выпадающий список — по всей таблице), но в DOM рендерим
   только видимое окно ~50 строк → таблица любого размера грузится мгновенно.
   Правка в ячейках, навигация клавиатурой, копирование/вставка TSV (в т.ч. из Excel), отметка dirty,
   сбор нормализованного diff для сохранения одним пакетом.

   opts.columns: [{name|field, label?, editable?, fk?, pk?}]; opts.pk: имя PK (generic) или undefined (документ);
   opts.fkMaps: {colName: Map(id->подпись)}. Индексация в UI — по позиции в отфильтрованном представлении
   (this.view[vr] = фактический индекс строки в this.rows). */
class Sheet {
  constructor(container, opts) {
    this.el = container;
    this.pk = opts.pk;
    this.fkLoader = opts.fkLoader || (async () => null);
    this.fkMaps = opts.fkMaps || {};
    this.rowH = 23;
    this._first = 0; this._last = 0;
    this.cols = (opts.columns || []).map(c => ({
      name: c.field || c.name,
      label: c.label || c.field || c.name,
      fk: c.fk || null,
      pk: !!c.pk,
      editable: c.editable !== undefined ? c.editable : !c.pk,
    }));
    this._bind();
    this.setData(opts.rows || []);
  }

  setData(rows) {
    this.rows = rows.map(r => Object.assign({}, r));
    this.orig = this.rows.map(r => Object.assign({}, r));
    this.state = this.rows.map(() => 'clean');
    this.view = this.rows.map((_, i) => i);
    this.active = { r: 0, c: 0 };
    this.sel = { r1: 0, c1: 0, r2: 0, c2: 0 };
    this.render();
  }

  _actual(vr) { return this.view[vr]; }
  _canEdit(c, vr) { const r = this.view[vr]; return c.editable && !(c.pk && this.state[r] !== 'new'); }

  // ── diff / сохранение (по фактическим строкам, не зависит от фильтра) ──────
  diff() {
    const out = [];
    this.rows.forEach((row, i) => {
      const st = this.state[i];
      const pkValues = {};
      for (const k in row) if (k.startsWith('__pk_')) pkValues[k.slice(5)] = row[k];
      if (this.pk != null && row[this.pk] != null) pkValues[this.pk] = row[this.pk];
      if (st === 'deleted') { out.push({ state: 'deleted', pkValues }); return; }
      const changed = {};
      this.cols.forEach(c => {
        if (!c.editable || c.pk) return;
        if (String((this.orig[i] || {})[c.name] ?? '') !== String(row[c.name] ?? ''))
          changed[c.name] = row[c.name] === '' ? null : row[c.name];
      });
      if (st === 'new' || Object.keys(changed).length) out.push({ state: st, pkValues, changed });
    });
    return out;
  }
  dirtyCount() { return this.diff().length; }
  getChanges() {
    return this.diff().map(d => {
      if (d.state === 'deleted') return { op: 'delete', pk: d.pkValues[this.pk] };
      if (d.state === 'new') return { op: 'insert', values: d.changed };
      return { op: 'update', pk: d.pkValues[this.pk], values: d.changed };
    }).filter(x => x.op !== 'delete' || x.pk != null);
  }

  addRow(preset) {
    const row = Object.assign({}, preset || {});
    this.cols.forEach(c => { if (!(c.name in row)) row[c.name] = ''; });
    this.rows.push(row); this.orig.push({}); this.state.push('new');
    this.render();
    this.el.scrollTop = this.el.scrollHeight;
    this._focus(this.view.length - 1, this.cols.findIndex(c => c.editable && !c.pk));
  }
  toggleDelete(vr) {
    const r = this.view[vr];
    if (this.state[r] === 'new') { this.rows.splice(r, 1); this.orig.splice(r, 1); this.state.splice(r, 1); }
    else this.state[r] = this.state[r] === 'deleted' ? 'clean' : 'deleted';
    this.render(); this._onChange();
  }

  // ── рендер: скелет (thead+datalists) один раз, тело — окном на скролл ──────
  render() {
    this.view = this.rows.map((_, i) => i);
    let head = '<thead><tr><th class="rownum"></th>';
    for (const c of this.cols)
      head += `<th data-c-name="${c.name}">${this._esc(c.label)}${c.fk ? ' 🔗' : ''}${c.pk ? ' 🔑' : ''}${!c.editable ? ' 🔒' : ''}</th>`;
    head += '<th class="rownum"></th></tr><tr class="filter"><th></th>';
    this.cols.forEach((c, ci) => {
      const vals = [...new Set(this.rows.map(r => this._dispRaw(r, c)).filter(v => v !== ''))].sort().slice(0, 1000);
      const dl = `dl_${ci}_${Math.random().toString(36).slice(2, 7)}`;
      head += `<th><input data-f="${c.name}" list="${dl}" placeholder="фильтр ▾">` +
              `<datalist id="${dl}">${vals.map(v => `<option value="${this._esc(v)}"></option>`).join('')}</datalist></th>`;
    });
    head += '<th></th></tr></thead>';
    this.el.innerHTML = `<table class="sheet">${head}<tbody></tbody></table>`;
    this.tbody = this.el.querySelector('tbody');
    this.el.scrollTop = 0;
    this._renderBody();
    const tr = this.tbody.querySelector('tr[data-r]');
    if (tr && tr.offsetHeight && Math.abs(tr.offsetHeight - this.rowH) > 1) { this.rowH = tr.offsetHeight; this._renderBody(); }
  }

  _renderBody() {
    const rowH = this.rowH, total = this.view.length, buf = 8;
    const scrollTop = this.el.scrollTop, viewH = this.el.clientHeight || 400;
    const first = Math.max(0, Math.floor(scrollTop / rowH) - buf);
    const last = Math.min(total, Math.ceil((scrollTop + viewH) / rowH) + buf);
    const span = this.cols.length + 2;
    let h = '';
    if (first > 0) h += `<tr class="spacer" style="height:${first * rowH}px"><td colspan="${span}"></td></tr>`;
    for (let vr = first; vr < last; vr++) h += this._rowHtml(vr);
    if (last < total) h += `<tr class="spacer" style="height:${(total - last) * rowH}px"><td colspan="${span}"></td></tr>`;
    this.tbody.innerHTML = h;
    this._first = first; this._last = last;
    this._paint();
  }
  _rowHtml(vr) {
    const r = this.view[vr], st = this.state[r];
    let h = `<tr data-r="${vr}" class="${st}"><td class="rownum">${vr + 1}</td>`;
    this.cols.forEach((c, ci) => {
      h += `<td data-r="${vr}" data-c="${ci}" class="${!c.editable ? 'ro ' : ''}${this._dirty(r, ci) ? 'dirty' : ''}">${this._disp(this.rows[r], c)}</td>`;
    });
    return h + `<td class="rownum"><button class="delrow" data-r="${vr}">${st === 'deleted' ? '↺' : '✕'}</button></td></tr>`;
  }
  _esc(v) { return v === null || v === undefined ? '' : String(v).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }
  _dispRaw(row, c) {
    let v = row[c.name];
    if (c.fk && this.fkMaps[c.name] && this.fkMaps[c.name].has(String(v))) v = this.fkMaps[c.name].get(String(v));
    return v === null || v === undefined ? '' : String(v);
  }
  _disp(row, c) { return this._esc(this._dispRaw(row, c)); }
  _dirty(r, ci) {
    if (this.state[r] !== 'clean') return false;
    const n = this.cols[ci].name;
    return String((this.orig[r] || {})[n] ?? '') !== String(this.rows[r][n] ?? '');
  }
  _td(vr, c) { return this.el.querySelector(`td[data-r="${vr}"][data-c="${c}"]`); }

  _paint() {
    this.el.querySelectorAll('td.sel,td.active').forEach(td => td.classList.remove('sel', 'active'));
    const { r1, c1, r2, c2 } = this._normSel();
    for (let vr = Math.max(r1, this._first); vr < Math.min(r2 + 1, this._last); vr++)
      for (let c = c1; c <= c2; c++) { const td = this._td(vr, c); if (td) td.classList.add('sel'); }
    const a = this._td(this.active.r, this.active.c); if (a) a.classList.add('active');
  }
  _normSel() {
    return { r1: Math.min(this.sel.r1, this.sel.r2), r2: Math.max(this.sel.r1, this.sel.r2),
             c1: Math.min(this.sel.c1, this.sel.c2), c2: Math.max(this.sel.c1, this.sel.c2) };
  }
  _ensureVisible(vr) {
    const top = vr * this.rowH, bot = top + this.rowH;
    if (top < this.el.scrollTop) this.el.scrollTop = top;
    else if (bot > this.el.scrollTop + this.el.clientHeight) this.el.scrollTop = bot - this.el.clientHeight;
    if (vr < this._first || vr >= this._last) this._renderBody();
  }
  _focus(vr, c) {
    vr = Math.max(0, Math.min(this.view.length - 1, vr));
    c = Math.max(0, Math.min(this.cols.length - 1, c));
    this.active = { r: vr, c }; this.sel = { r1: vr, c1: c, r2: vr, c2: c };
    this._ensureVisible(vr); this._paint(); this.el.focus();
  }

  async _startEdit(initial) {
    const vr = this.active.r, c = this.active.c, col = this.cols[c], r = this.view[vr];
    if (!this._canEdit(col, vr)) return;
    const td = this._td(vr, c); if (!td) return;
    let input;
    if (col.fk) {
      const fo = await this.fkLoader(col.fk);
      input = document.createElement('select');
      input.innerHTML = '<option value="">—</option>' +
        (fo ? fo.options.map(o => `<option value="${o.id}"${String(o.id) === String(this.rows[r][col.name]) ? ' selected' : ''}>${o.id} · ${this._esc(o.label)}</option>`).join('') : '');
    } else {
      input = document.createElement('input');
      input.value = initial != null ? initial : (this.rows[r][col.name] ?? '');
    }
    input.className = 'celledit';
    td.textContent = ''; td.appendChild(input); input.focus(); if (input.select) input.select();
    const commit = (move) => {
      this.rows[r][col.name] = input.value; input.remove();
      this._renderCell(vr, c);
      if (move) this._move(move.dr, move.dc); else this._paint();
      this._onChange();
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit({ dr: 1, dc: 0 }); }
      else if (e.key === 'Tab') { e.preventDefault(); commit({ dr: 0, dc: e.shiftKey ? -1 : 1 }); }
      else if (e.key === 'Escape') { e.preventDefault(); input.remove(); this._renderCell(vr, c); this.el.focus(); }
      e.stopPropagation();
    };
    input.onblur = () => { if (input.parentNode) commit(null); };
  }
  _renderCell(vr, c) {
    const td = this._td(vr, c); if (!td) return;
    const r = this.view[vr];
    td.innerHTML = this._disp(this.rows[r], this.cols[c]);
    td.classList.toggle('dirty', this._dirty(r, c));
  }

  _move(dr, dc, extend) {
    const vr = Math.max(0, Math.min(this.view.length - 1, this.active.r + dr));
    const c = Math.max(0, Math.min(this.cols.length - 1, this.active.c + dc));
    this.active = { r: vr, c };
    if (extend) { this.sel.r2 = vr; this.sel.c2 = c; } else this.sel = { r1: vr, c1: c, r2: vr, c2: c };
    this._ensureVisible(vr); this._paint();
  }

  _copyTSV() {
    const { r1, c1, r2, c2 } = this._normSel(); const out = [];
    for (let vr = r1; vr <= r2; vr++) {
      const r = this.view[vr], line = [];
      for (let c = c1; c <= c2; c++) line.push(this.rows[r][this.cols[c].name] ?? '');
      out.push(line.join('\t'));
    }
    return out.join('\n');
  }
  _pasteTSV(text) {
    const grid = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map(l => l.split('\t'));
    const vr0 = this.active.r, c0 = this.active.c;
    grid.forEach((line, dr) => line.forEach((val, dc) => {
      const vr = vr0 + dr, c = c0 + dc;
      if (vr < this.view.length && c < this.cols.length && this._canEdit(this.cols[c], vr)) {
        this.rows[this.view[vr]][this.cols[c].name] = val; this._renderCell(vr, c);
      }
    }));
    this._onChange();
  }
  _clearSel() {
    const { r1, c1, r2, c2 } = this._normSel();
    for (let vr = r1; vr <= r2; vr++) for (let c = c1; c <= c2; c++)
      if (this._canEdit(this.cols[c], vr)) { this.rows[this.view[vr]][this.cols[c].name] = ''; this._renderCell(vr, c); }
    this._onChange();
  }
  _onChange() { if (this.onChange) this.onChange(this.dirtyCount()); }

  _bind() {
    this.el.tabIndex = 0;
    let raf = 0;
    this.el.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; this._renderBody(); }); });
    this.el.addEventListener('mousedown', (e) => {
      const del = e.target.closest('.delrow'); const td = e.target.closest('td[data-c]');
      if (del) { this.toggleDelete(+del.dataset.r); return; }
      if (!td) return;
      const vr = +td.dataset.r, c = +td.dataset.c;
      this.active = { r: vr, c };
      if (e.shiftKey) { this.sel.r2 = vr; this.sel.c2 = c; } else this.sel = { r1: vr, c1: c, r2: vr, c2: c };
      this._paint(); this.el.focus();
      if (this.onSelect) this.onSelect(vr, this.rows[this.view[vr]]);
    });
    this.el.addEventListener('dblclick', (e) => { if (e.target.closest('td[data-c]')) this._startEdit(); });
    this.el.addEventListener('click', (e) => {
      const th = e.target.closest('th[data-c-name]'); if (th && this.onSort) this.onSort(th.dataset.cName);
    });
    this.el.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.f !== undefined) this._applyFilter(); });
    this.el.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.dataset.f !== undefined) return;
      const k = e.key;
      if (k === 'ArrowUp') { e.preventDefault(); this._move(-1, 0, e.shiftKey); }
      else if (k === 'ArrowDown') { e.preventDefault(); this._move(1, 0, e.shiftKey); }
      else if (k === 'ArrowLeft') { e.preventDefault(); this._move(0, -1, e.shiftKey); }
      else if (k === 'ArrowRight') { e.preventDefault(); this._move(0, 1, e.shiftKey); }
      else if (k === 'Tab') { e.preventDefault(); this._move(0, e.shiftKey ? -1 : 1); }
      else if (k === 'Enter' || k === 'F2') { e.preventDefault(); this._startEdit(); }
      else if (k === 'Delete') { e.preventDefault(); this._clearSel(); }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { this._startEdit(k); }
    });
    document.addEventListener('copy', (e) => {
      if (!this.el.contains(document.activeElement) && document.activeElement !== this.el) return;
      e.preventDefault(); e.clipboardData.setData('text/plain', this._copyTSV());
    });
    document.addEventListener('paste', (e) => {
      if (!this.el.contains(document.activeElement) && document.activeElement !== this.el) return;
      e.preventDefault(); this._pasteTSV(e.clipboardData.getData('text/plain'));
    });
  }
  _applyFilter() {
    const filters = {};
    this.el.querySelectorAll('input[data-f]').forEach(i => { if (i.value.trim()) filters[i.dataset.f] = i.value.trim().toLowerCase(); });
    const cols = this.cols;
    this.view = [];
    for (let r = 0; r < this.rows.length; r++) {
      let ok = true;
      for (const col in filters) { const c = cols.find(x => x.name === col); if (!this._dispRaw(this.rows[r], c).toLowerCase().includes(filters[col])) { ok = false; break; } }
      if (ok) this.view.push(r);
    }
    this.active = { r: 0, c: this.active.c }; this.sel = { r1: 0, c1: this.active.c, r2: 0, c2: this.active.c };
    this.el.scrollTop = 0; this._renderBody();
  }
}
window.Sheet = Sheet;
