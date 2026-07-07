/* Excel-подобный редактор таблицы (vanilla, без зависимостей).
   Правка в ячейках, навигация клавиатурой, копирование/вставка TSV (в т.ч. из Excel),
   отметка изменений (dirty), сбор нормализованного diff для сохранения одним пакетом.
   Копипаст через native copy/paste-события — работает и по HTTP в локальной сети.

   opts.columns: [{name|field, label?, editable?, fk?, pk?}]
   opts.pk:      имя первичного ключа (generic-режим) или undefined (документ с __pk_<table>)
   opts.fkMaps:  {colName: Map(строкаId -> подпись)} — показывать подписи FK вместо id */
class Sheet {
  constructor(container, opts) {
    this.el = container;
    this.pk = opts.pk;
    this.fkLoader = opts.fkLoader || (async () => null);
    this.fkMaps = opts.fkMaps || {};
    this.cols = (opts.columns || []).map(c => ({
      name: c.field || c.name,
      label: c.label || c.field || c.name,
      fk: c.fk || null,
      pk: !!c.pk,
      editable: c.editable !== undefined ? c.editable : !c.pk,
    }));
    this.setData(opts.rows || []);
    this._bind();
  }

  setData(rows) {
    this.rows = rows.map(r => Object.assign({}, r));
    this.orig = this.rows.map(r => Object.assign({}, r));
    this.state = this.rows.map(() => 'clean');
    this.active = { r: 0, c: 0 };
    this.sel = { r1: 0, c1: 0, r2: 0, c2: 0 };
    this.render();
  }

  _canEdit(c, r) { return c.editable && !(c.pk && this.state[r] !== 'new'); }

  // ── нормализованный diff изменений ──────────────────────────────────────
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

  // generic-формат (режим «Все таблицы»): [{op, pk, values}]
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
    this.render(); this._focusCell(this.rows.length - 1, this.cols.findIndex(c => c.editable && !c.pk));
  }
  toggleDelete(r) {
    if (this.state[r] === 'new') { this.rows.splice(r, 1); this.orig.splice(r, 1); this.state.splice(r, 1); }
    else this.state[r] = this.state[r] === 'deleted' ? 'clean' : 'deleted';
    this.render();
  }

  // ── рендер ──────────────────────────────────────────────────────────────
  render() {
    let h = '<table class="sheet"><thead><tr><th class="rownum"></th>';
    for (const c of this.cols)
      h += `<th data-c-name="${c.name}">${this._esc(c.label)}${c.fk ? ' 🔗' : ''}${c.pk ? ' 🔑' : ''}${!c.editable ? ' 🔒' : ''}</th>`;
    h += '<th class="rownum"></th></tr><tr class="filter"><th></th>';
    this.cols.forEach((c, ci) => {
      // выпадающий список уникальных значений колонки (можно выбрать или ввести по названию)
      const vals = [...new Set(this.rows.map(r => this._dispRaw(r, c)).filter(v => v !== ''))].sort().slice(0, 1000);
      const dl = `dl_${ci}_${Math.random().toString(36).slice(2, 7)}`;
      h += `<th><input data-f="${c.name}" list="${dl}" placeholder="фильтр ▾">` +
           `<datalist id="${dl}">${vals.map(v => `<option value="${this._esc(v)}"></option>`).join('')}</datalist></th>`;
    });
    h += '<th></th></tr></thead><tbody>';
    this.rows.forEach((row, r) => {
      h += `<tr data-r="${r}" class="${this.state[r]}"><td class="rownum">${r + 1}</td>`;
      this.cols.forEach((c, ci) => {
        h += `<td data-r="${r}" data-c="${ci}" class="${!c.editable ? 'ro ' : ''}${this._dirtyCell(r, ci) ? 'dirty' : ''}">${this._disp(row, c)}</td>`;
      });
      h += `<td class="rownum"><button class="delrow" data-r="${r}">${this.state[r] === 'deleted' ? '↺' : '✕'}</button></td></tr>`;
    });
    this.el.innerHTML = h + '</tbody></table>';
    this._applyFilter(); this._paint();
  }
  _esc(v) { return v === null || v === undefined ? '' : String(v).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }
  _dispRaw(row, c) {
    let v = row[c.name];
    if (c.fk && this.fkMaps[c.name] && this.fkMaps[c.name].has(String(v))) v = this.fkMaps[c.name].get(String(v));
    return v === null || v === undefined ? '' : String(v);
  }
  _disp(row, c) { return this._esc(this._dispRaw(row, c)); }
  _dirtyCell(r, ci) {
    if (this.state[r] !== 'clean') return false;
    const n = this.cols[ci].name;
    return String((this.orig[r] || {})[n] ?? '') !== String(this.rows[r][n] ?? '');
  }
  _td(r, c) { return this.el.querySelector(`td[data-r="${r}"][data-c="${c}"]`); }

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
    this._paint(); const td = this._td(r, c); if (td) td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    this.el.focus();
  }

  async _startEdit(initial) {
    const { r, c } = this.active; const col = this.cols[c];
    if (!this._canEdit(col, r)) return;
    const td = this._td(r, c); if (!td) return;
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
      this.rows[r][col.name] = input.value;
      input.remove();
      if (move) this._move(move.dr, move.dc); else this._paint();
      this._renderCell(r, c); this._onChange();
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit({ dr: 1, dc: 0 }); }
      else if (e.key === 'Tab') { e.preventDefault(); commit({ dr: 0, dc: e.shiftKey ? -1 : 1 }); }
      else if (e.key === 'Escape') { e.preventDefault(); input.remove(); this._renderCell(r, c); this.el.focus(); }
      e.stopPropagation();
    };
    input.onblur = () => { if (input.parentNode) commit(null); };
  }
  _renderCell(r, c) {
    const td = this._td(r, c); if (!td) return;
    td.innerHTML = this._disp(this.rows[r], this.cols[c]);
    td.classList.toggle('dirty', this._dirtyCell(r, c));
  }

  _move(dr, dc, extend) {
    let r = this.active.r + dr, c = this.active.c + dc;
    r = Math.max(0, Math.min(this.rows.length - 1, r)); c = Math.max(0, Math.min(this.cols.length - 1, c));
    this.active = { r, c };
    if (extend) { this.sel.r2 = r; this.sel.c2 = c; } else this.sel = { r1: r, c1: c, r2: r, c2: c };
    this._paint(); const td = this._td(r, c); if (td) td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  _copyTSV() {
    const { r1, c1, r2, c2 } = this._normSel(); const out = [];
    for (let r = r1; r <= r2; r++) {
      const line = []; for (let c = c1; c <= c2; c++) line.push(this.rows[r][this.cols[c].name] ?? '');
      out.push(line.join('\t'));
    }
    return out.join('\n');
  }
  _pasteTSV(text) {
    const grid = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map(l => l.split('\t'));
    const { r: r0, c: c0 } = this.active;
    grid.forEach((line, dr) => line.forEach((val, dc) => {
      const r = r0 + dr, c = c0 + dc;
      if (r < this.rows.length && c < this.cols.length && this._canEdit(this.cols[c], r)) {
        this.rows[r][this.cols[c].name] = val; this._renderCell(r, c);
      }
    }));
    this._onChange();
  }
  _clearSel() {
    const { r1, c1, r2, c2 } = this._normSel();
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++)
      if (this._canEdit(this.cols[c], r)) { this.rows[r][this.cols[c].name] = ''; this._renderCell(r, c); }
    this._onChange();
  }
  _onChange() { if (this.onChange) this.onChange(this.dirtyCount()); }

  _bind() {
    this.el.tabIndex = 0;
    this.el.addEventListener('mousedown', (e) => {
      const del = e.target.closest('.delrow'); const td = e.target.closest('td[data-c]');
      if (del) { this.toggleDelete(+del.dataset.r); this._onChange(); return; }
      if (!td) return;
      const r = +td.dataset.r, c = +td.dataset.c;
      this.active = { r, c };
      if (e.shiftKey) { this.sel.r2 = r; this.sel.c2 = c; } else this.sel = { r1: r, c1: c, r2: r, c2: c };
      this._paint(); this.el.focus();
      if (this.onSelect) this.onSelect(r, this.rows[r]);
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
    this.el.querySelectorAll('tbody tr').forEach(tr => {
      const r = +tr.dataset.r;
      const show = Object.entries(filters).every(([col, val]) => this._dispRaw(this.rows[r], this.cols.find(c => c.name === col)).toLowerCase().includes(val));
      tr.style.display = show ? '' : 'none';
    });
  }
}
window.Sheet = Sheet;
