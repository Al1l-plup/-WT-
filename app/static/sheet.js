/* Excel-подобный редактор таблицы (vanilla, без зависимостей): виртуальный скролл,
   правка в ячейках, навигация клавиатурой, копипаст TSV, undo/redo, контекстное меню,
   вставка/удаление/перемещение строк со сдвигом порядка, заливка (Ctrl+D / Ctrl+Enter),
   визуальное объединение одинаковых соседних ячеек. Пакет изменений — существующим diff().

   Порядок строк: если среди колонок есть скрытая редактируемая 'row_order' (WB-документы),
   вставка «между» и перемещение честно меняют её (fractional ordering) и переживают перезагрузку.

   opts.columns: [{name|field, label?, editable?, fk?, pk?, hidden?}]
   opts.pk: имя PK (generic) или undefined (документ с __pk_<table>)
   opts.fkMaps: {colName: Map(id->подпись)}. Индексация UI — по view (this.view[vr] = факт. индекс). */
class Sheet {
  constructor(container, opts) {
    this.el = container;
    this.pk = opts.pk;
    this.fkLoader = opts.fkLoader || (async () => null);
    this.fkMaps = opts.fkMaps || {};
    this.rowH = 23;
    this._first = 0; this._last = 0;
    this.allCols = (opts.columns || []).map(c => ({
      name: c.field || c.name,
      label: c.label || c.field || c.name,
      fk: c.fk || null,
      pk: !!c.pk,
      hidden: !!c.hidden,
      editable: c.editable !== undefined ? c.editable : !c.pk,
    }));
    this.cols = this.allCols.filter(c => !c.hidden);          // видимые
    const ord = this.allCols.find(c => c.hidden && c.editable && c.name === 'row_order');
    this.orderField = ord ? ord.name : null;                   // поле порядка (WB)
    this.mergeView = false;                                    // «объединять одинаковые»
    this.undoStack = []; this.redoStack = [];
    this.cutSet = null;                                        // Set факт. индексов вырезанных строк
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
    this.undoStack = []; this.redoStack = []; this.cutSet = null;
    this.render();
  }

  _filtered() { return this.view.length !== this.rows.length; }
  _canEdit(c, vr) { const r = this.view[vr]; return c.editable && !(c.pk && this.state[r] !== 'new'); }

  // ── undo/redo ───────────────────────────────────────────────────────────
  _push(cmd) {
    this.undoStack.push(cmd);
    if (this.undoStack.length > 300) this.undoStack.shift();
    this.redoStack = [];
    if (this.onUndoState) this.onUndoState(this.canUndo(), this.canRedo());
  }
  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
  undo() {
    const cmd = this.undoStack.pop(); if (!cmd) return;
    cmd.undo(); this.redoStack.push(cmd);
    this._afterMutate();
  }
  redo() {
    const cmd = this.redoStack.pop(); if (!cmd) return;
    cmd.redo(); this.undoStack.push(cmd);
    this._afterMutate();
  }
  _afterMutate() {
    this.view = this.rows.map((_, i) => i);
    this._applyFilter(true);
    this._onChange();
    if (this.onUndoState) this.onUndoState(this.canUndo(), this.canRedo());
  }

  // универсальная мутация ячеек (правка/паста/заливка/очистка) с undo
  _setCells(list) { // list: [{r, name, val}] — r ФАКТИЧЕСКИЙ индекс
    const changes = [];
    for (const it of list) {
      const old = this.rows[it.r][it.name];
      if (String(old ?? '') === String(it.val ?? '')) continue;
      changes.push({ r: it.r, name: it.name, old, val: it.val });
      this.rows[it.r][it.name] = it.val;
    }
    if (!changes.length) return false;
    const self = this;
    this._push({
      undo() { for (const ch of changes) self.rows[ch.r][ch.name] = ch.old; },
      redo() { for (const ch of changes) self.rows[ch.r][ch.name] = ch.val; },
    });
    return true;
  }

  // ── diff / сохранение ───────────────────────────────────────────────────
  diff() {
    const out = [];
    this.rows.forEach((row, i) => {
      const st = this.state[i];
      const pkValues = {};
      for (const k in row) if (k.startsWith('__pk_')) pkValues[k.slice(5)] = row[k];
      if (this.pk != null && row[this.pk] != null) pkValues[this.pk] = row[this.pk];
      if (st === 'deleted') { out.push({ state: 'deleted', pkValues }); return; }
      const changed = {};
      this.allCols.forEach(c => {
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

  // ── строки: вставка / удаление / перемещение ────────────────────────────
  _orderBetween(vrAbove, vrBelow, n) {
    // n значений порядка между строками view[vrAbove] и view[vrBelow]
    const of = this.orderField;
    const prev = vrAbove >= 0 ? Number(this.rows[this.view[vrAbove]][of]) : null;
    const next = vrBelow < this.view.length ? Number(this.rows[this.view[vrBelow]][of]) : null;
    const lo = (prev !== null && !isNaN(prev)) ? prev : ((next !== null && !isNaN(next)) ? next - n - 1 : 0);
    const hi = (next !== null && !isNaN(next)) ? next : lo + n + 1;
    const step = (hi - lo) / (n + 1);
    return Array.from({ length: n }, (_, i) => lo + step * (i + 1));
  }
  insertRows(atVr, n, preset) { // вставить n новых строк ПЕРЕД позицией atVr
    if (this._filtered()) { alert('Сначала снимите фильтр — вставка между строками при фильтре неоднозначна.'); return; }
    n = Math.max(1, n | 0);
    const rowsData = [];
    const orders = this.orderField ? this._orderBetween(atVr - 1, atVr, n) : null;
    for (let i = 0; i < n; i++) {
      const row = Object.assign({}, preset || {});
      this.allCols.forEach(c => { if (!(c.name in row)) row[c.name] = ''; });
      if (orders) row[this.orderField] = orders[i];
      rowsData.push(row);
    }
    const at = atVr; // фильтр пуст → view == identity
    const self = this;
    const doIns = () => { self.rows.splice(at, 0, ...rowsData); self.orig.splice(at, 0, ...rowsData.map(() => ({}))); self.state.splice(at, 0, ...rowsData.map(() => 'new')); };
    const doDel = () => { self.rows.splice(at, n); self.orig.splice(at, n); self.state.splice(at, n); };
    doIns();
    this._push({ undo: doDel, redo: doIns });
    this._afterMutate();
    this._focus(atVr, this.cols.findIndex(c => c.editable && !c.pk));
  }
  addRow(preset) { // в конец (кнопка «+ строка»)
    if (this.orderField && !preset?.[this.orderField]) {
      preset = Object.assign({}, preset);
      const last = this.rows.length ? Number(this.rows[this.rows.length - 1][this.orderField]) : 0;
      preset[this.orderField] = (isNaN(last) ? this.rows.length : last) + 1;
    }
    const row = Object.assign({}, preset || {});
    this.allCols.forEach(c => { if (!(c.name in row)) row[c.name] = ''; });
    const self = this;
    const doIns = () => { self.rows.push(row); self.orig.push({}); self.state.push('new'); };
    const doDel = () => { self.rows.pop(); self.orig.pop(); self.state.pop(); };
    doIns();
    this._push({ undo: doDel, redo: doIns });
    this._afterMutate();
    this.el.scrollTop = this.el.scrollHeight;
    this._focus(this.view.length - 1, this.cols.findIndex(c => c.editable && !c.pk));
  }
  toggleDeleteRange(vr1, vr2) { // пометить выделенные строки удалёнными / вернуть
    const rs = []; for (let vr = vr1; vr <= vr2; vr++) rs.push(this.view[vr]);
    const self = this;
    const before = rs.map(r => self.state[r]);
    const isNew = rs.filter(r => self.state[r] === 'new').sort((a, b) => b - a);
    const doIt = () => {
      for (const r of rs) if (self.state[r] !== 'new') self.state[r] = self.state[r] === 'deleted' ? 'clean' : 'deleted';
      for (const r of isNew) { self.rows.splice(r, 1); self.orig.splice(r, 1); self.state.splice(r, 1); }
    };
    // undo для new-строк сложен (восстановление позиций) — храним снимки
    const snapRows = isNew.map(r => ({ r, row: this.rows[r] }));
    const undoIt = () => {
      for (const s of snapRows.slice().reverse()) { self.rows.splice(s.r, 0, s.row); self.orig.splice(s.r, 0, {}); self.state.splice(s.r, 0, 'new'); }
      rs.forEach((r, i) => { if (before[i] !== 'new') self.state[r] = before[i]; });
    };
    doIt();
    this._push({ undo: undoIt, redo: doIt });
    this._afterMutate();
  }
  moveRows(vr1, vr2, delta) { // сдвинуть блок выделенных строк на delta позиций
    if (!this.orderField) { alert('Перемещение доступно только в документах Weld Balance (есть порядок строк).'); return; }
    if (this._filtered()) { alert('Сначала снимите фильтр.'); return; }
    const n = vr2 - vr1 + 1;
    let target = vr1 + delta;
    if (target < 0 || vr2 + delta >= this.rows.length) return;
    const self = this, of = this.orderField;
    const oldOrders = [];
    for (let r = 0; r < this.rows.length; r++) oldOrders.push(this.rows[r][of]);
    const block = this.rows.splice(vr1, n), blockO = this.orig.splice(vr1, n), blockS = this.state.splice(vr1, n);
    this.rows.splice(target, 0, ...block); this.orig.splice(target, 0, ...blockO); this.state.splice(target, 0, ...blockS);
    // новые порядки для блока: между соседями в новой позиции
    this.view = this.rows.map((_, i) => i);
    const orders = this._orderBetween(target - 1, target + n, n);
    for (let i = 0; i < n; i++) this.rows[target + i][of] = orders[i];
    const snapNew = this.rows.map(r => r[of]);
    const rowsAfter = this.rows.slice(), origAfter = this.orig.slice(), stateAfter = this.state.slice();
    const rowsBefore = (() => { const a = rowsAfter.slice(); const blk = a.splice(target, n); a.splice(vr1, 0, ...blk); return a; })();
    const origBefore = (() => { const a = origAfter.slice(); const blk = a.splice(target, n); a.splice(vr1, 0, ...blk); return a; })();
    const stateBefore = (() => { const a = stateAfter.slice(); const blk = a.splice(target, n); a.splice(vr1, 0, ...blk); return a; })();
    this._push({
      undo() { self.rows = rowsBefore.slice(); self.orig = origBefore.slice(); self.state = stateBefore.slice(); self.rows.forEach((r, i) => r[of] = oldOrders[i]); },
      redo() { self.rows = rowsAfter.slice(); self.orig = origAfter.slice(); self.state = stateAfter.slice(); self.rows.forEach((r, i) => r[of] = snapNew[i]); },
    });
    this._afterMutate();
    this.active = { r: target, c: this.active.c };
    this.sel = { r1: target, c1: 0, r2: target + n - 1, c2: this.cols.length - 1 };
    this._ensureVisible(target); this._paint();
  }
  cutRows(vr1, vr2) {
    if (!this.orderField) { alert('Вырезание строк доступно в документах Weld Balance.'); return; }
    if (this._filtered()) { alert('Сначала снимите фильтр.'); return; }
    this.cutSet = { vr1, vr2 };
    this._renderBody();
  }
  pasteCutBefore(atVr) {
    if (!this.cutSet) return;
    const { vr1, vr2 } = this.cutSet; this.cutSet = null;
    if (atVr >= vr1 && atVr <= vr2 + 1) { this._renderBody(); return; }
    const delta = atVr > vr2 ? atVr - vr2 - 1 : atVr - vr1;
    this.moveRows(vr1, vr2, delta);
  }

  // ── заливка ──────────────────────────────────────────────────────────────
  fillDown() { // Ctrl+D: значение верхней ячейки каждого столбца — вниз по выделению
    const { r1, c1, r2, c2 } = this._normSel();
    const list = [];
    for (let c = c1; c <= c2; c++) {
      const col = this.cols[c];
      const src = this.rows[this.view[r1]][col.name];
      for (let vr = r1 + 1; vr <= r2; vr++)
        if (this._canEdit(col, vr)) list.push({ r: this.view[vr], name: col.name, val: src });
    }
    if (this._setCells(list)) this._afterMutate();
  }
  fillSelection(val) { // залить всё выделение одним значением (Ctrl+Enter)
    const { r1, c1, r2, c2 } = this._normSel();
    const list = [];
    for (let vr = r1; vr <= r2; vr++)
      for (let c = c1; c <= c2; c++)
        if (this._canEdit(this.cols[c], vr)) list.push({ r: this.view[vr], name: this.cols[c].name, val });
    if (this._setCells(list)) this._afterMutate();
  }

  setMergeView(on) { this.mergeView = !!on; this._renderBody(); }

  // ── рендер ──────────────────────────────────────────────────────────────
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
    const cut = this.cutSet && vr >= this.cutSet.vr1 && vr <= this.cutSet.vr2 ? ' cut' : '';
    let h = `<tr data-r="${vr}" class="${st}${cut}"><td class="rownum" data-rn="${vr}">${vr + 1}</td>`;
    this.cols.forEach((c, ci) => {
      let cls = (!c.editable ? 'ro ' : '') + (this._dirty(r, ci) ? 'dirty ' : '');
      let text = this._disp(this.rows[r], c);
      if (this.mergeView && text !== '') {
        const prev = vr > 0 ? this._dispRaw(this.rows[this.view[vr - 1]], c) : null;
        const next = vr + 1 < this.view.length ? this._dispRaw(this.rows[this.view[vr + 1]], c) : null;
        if (prev !== null && prev === this._dispRaw(this.rows[r], c)) { cls += 'mergehide '; text = ''; }
        if (next !== null && next === this._dispRaw(this.rows[r], c)) cls += 'mergedown ';
      }
      h += `<td data-r="${vr}" data-c="${ci}" class="${cls}">${text}</td>`;
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

  // ── редактирование ячейки ────────────────────────────────────────────────
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
    const commit = (move, fillAll) => {
      input.remove();
      if (fillAll) this.fillSelection(input.value);
      else { if (this._setCells([{ r, name: col.name, val: input.value }])) {} this._renderCell(vr, c); }
      if (move) this._move(move.dr, move.dc); else this._paint();
      this._onChange();
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(null, true); }
      else if (e.key === 'Enter') { e.preventDefault(); commit({ dr: 1, dc: 0 }); }
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

  // ── копипаст ─────────────────────────────────────────────────────────────
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
    const vr0 = this.active.r, c0 = this.active.c, list = [];
    grid.forEach((line, dr) => line.forEach((val, dc) => {
      const vr = vr0 + dr, c = c0 + dc;
      if (vr < this.view.length && c < this.cols.length && this._canEdit(this.cols[c], vr))
        list.push({ r: this.view[vr], name: this.cols[c].name, val });
    }));
    if (this._setCells(list)) this._afterMutate();
  }
  _clearSel() {
    const { r1, c1, r2, c2 } = this._normSel(), list = [];
    for (let vr = r1; vr <= r2; vr++) for (let c = c1; c <= c2; c++)
      if (this._canEdit(this.cols[c], vr)) list.push({ r: this.view[vr], name: this.cols[c].name, val: '' });
    if (this._setCells(list)) this._afterMutate();
  }
  _onChange() { if (this.onChange) this.onChange(this.dirtyCount()); }

  // ── контекстное меню ─────────────────────────────────────────────────────
  _menu(x, y) {
    this._closeMenu();
    const { r1, r2 } = this._normSel();
    const n = r2 - r1 + 1;
    const items = [];
    if (this.orderField) {
      items.push({ t: `Вставить строку выше (${n})`, f: () => this.insertRows(r1, n) });
      items.push({ t: `Вставить строку ниже (${n})`, f: () => this.insertRows(r2 + 1, n) });
      items.push({ t: '—' });
      items.push({ t: `Вырезать строки (${n})`, f: () => this.cutRows(r1, r2) });
      if (this.cutSet) items.push({ t: 'Вставить вырезанные выше текущей', f: () => this.pasteCutBefore(this.active.r) });
      items.push({ t: 'Сдвинуть выше (Alt+↑)', f: () => this.moveRows(r1, r2, -1) });
      items.push({ t: 'Сдвинуть ниже (Alt+↓)', f: () => this.moveRows(r1, r2, 1) });
      items.push({ t: '—' });
    }
    items.push({ t: `Удалить/вернуть строки (${n})`, f: () => this.toggleDeleteRange(r1, r2) });
    items.push({ t: 'Заливка вниз (Ctrl+D)', f: () => this.fillDown() });
    items.push({ t: 'Залить выделение значением…', f: () => { const v = prompt('Значение для всего выделения:'); if (v !== null) this.fillSelection(v); } });
    items.push({ t: '—' });
    items.push({ t: 'Копировать (Ctrl+C)', f: () => document.execCommand('copy') });
    items.push({ t: 'Очистить (Delete)', f: () => this._clearSel() });
    const m = document.createElement('div');
    m.id = 'sheetmenu';
    m.innerHTML = items.map((it, i) => it.t === '—' ? '<hr>' : `<div class="mi" data-i="${i}">${it.t}</div>`).join('');
    document.body.appendChild(m);
    const mw = 260;
    m.style.left = Math.min(x, window.innerWidth - mw - 8) + 'px';
    m.style.top = Math.min(y, window.innerHeight - m.offsetHeight - 8) + 'px';
    m.addEventListener('mousedown', (e) => {
      const mi = e.target.closest('.mi'); if (!mi) return;
      e.preventDefault(); e.stopPropagation();
      const it = items[+mi.dataset.i];
      this._closeMenu(); it.f();
    });
    setTimeout(() => document.addEventListener('mousedown', this._menuCloser = () => this._closeMenu(), { once: true }), 0);
  }
  _closeMenu() { const m = document.getElementById('sheetmenu'); if (m) m.remove(); }

  // ── события ──────────────────────────────────────────────────────────────
  _bind() {
    this.el.tabIndex = 0;
    let raf = 0;
    this.el.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; this._renderBody(); }); });
    this.el.addEventListener('mousedown', (e) => {
      if (e.button === 2) return;
      const del = e.target.closest('.delrow'); const td = e.target.closest('td[data-c]'); const rn = e.target.closest('td.rownum[data-rn]');
      if (del) { const vr = +del.dataset.r; this.toggleDeleteRange(vr, vr); return; }
      if (rn) { // выделение целой строки
        const vr = +rn.dataset.rn;
        if (e.shiftKey) { this.sel.r2 = vr; this.sel.c1 = 0; this.sel.c2 = this.cols.length - 1; }
        else { this.active = { r: vr, c: 0 }; this.sel = { r1: vr, c1: 0, r2: vr, c2: this.cols.length - 1 }; }
        this._paint(); this.el.focus();
        return;
      }
      if (!td) return;
      const vr = +td.dataset.r, c = +td.dataset.c;
      this.active = { r: vr, c };
      if (e.shiftKey) { this.sel.r2 = vr; this.sel.c2 = c; } else this.sel = { r1: vr, c1: c, r2: vr, c2: c };
      this._paint(); this.el.focus();
      if (this.onSelect) this.onSelect(vr, this.rows[this.view[vr]]);
    });
    this.el.addEventListener('contextmenu', (e) => {
      const td = e.target.closest('td[data-c], td.rownum[data-rn]');
      if (!td) return;
      e.preventDefault();
      const vr = +(td.dataset.r ?? td.dataset.rn);
      const { r1, r2 } = this._normSel();
      if (vr < r1 || vr > r2) { // клик вне выделения — переносим выделение
        const c = +(td.dataset.c ?? 0);
        this.active = { r: vr, c }; this.sel = { r1: vr, c1: c, r2: vr, c2: c }; this._paint();
      }
      this._menu(e.clientX, e.clientY);
    });
    this.el.addEventListener('dblclick', (e) => { if (e.target.closest('td[data-c]')) this._startEdit(); });
    this.el.addEventListener('click', (e) => {
      const th = e.target.closest('th[data-c-name]'); if (th && this.onSort) this.onSort(th.dataset.cName);
    });
    this.el.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.f !== undefined) this._applyFilter(); });
    this.el.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.dataset.f !== undefined) return;
      const k = e.key;
      if ((k === 'z' || k === 'Z' || k === 'я' || k === 'Я') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); }
      else if ((k === 'y' || k === 'Y' || k === 'н' || k === 'Н') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); this.redo(); }
      else if ((k === 'd' || k === 'D' || k === 'в' || k === 'В') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); this.fillDown(); }
      else if (k === 'ArrowUp' && e.altKey) { e.preventDefault(); const s = this._normSel(); this.moveRows(s.r1, s.r2, -1); }
      else if (k === 'ArrowDown' && e.altKey) { e.preventDefault(); const s = this._normSel(); this.moveRows(s.r1, s.r2, 1); }
      else if (k === 'ArrowUp') { e.preventDefault(); this._move(-1, 0, e.shiftKey); }
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
  _applyFilter(keepScroll) {
    const filters = {};
    this.el.querySelectorAll('input[data-f]').forEach(i => { if (i.value.trim()) filters[i.dataset.f] = i.value.trim().toLowerCase(); });
    const cols = this.cols;
    this.view = [];
    for (let r = 0; r < this.rows.length; r++) {
      let ok = true;
      for (const col in filters) { const c = cols.find(x => x.name === col); if (!this._dispRaw(this.rows[r], c).toLowerCase().includes(filters[col])) { ok = false; break; } }
      if (ok) this.view.push(r);
    }
    if (!keepScroll) { this.active = { r: 0, c: this.active.c }; this.sel = { r1: 0, c1: this.active.c, r2: 0, c2: this.active.c }; this.el.scrollTop = 0; }
    this._renderBody();
  }
}
window.Sheet = Sheet;
