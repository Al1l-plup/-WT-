/* Excel-подобный редактор таблицы (vanilla, без зависимостей), v3.
   Виртуальный скролл · правка в ячейках (устойчивая к прокрутке) · drag-выделение мышью ·
   несмежное выделение Ctrl+кликом · буквы колонок A/B/C (клик = выделить колонку) ·
   изменение ширины колонок мышью (запоминается) · маркер автозаполнения (fill handle) ·
   undo/redo · контекстное меню · вставка/перемещение строк (row_order) · заливки · копипаст TSV ·
   визуальное объединение одинаковых. Сохранение — пакетом через diff() (как раньше).

   opts: columns[{name|field,label?,editable?,fk?,pk?,hidden?}], pk?, fkMaps?, fkLoader?,
         naturalOrder? (false → вставка между/перемещение заблокированы), storageKey? (ширины колонок).
   Выделение: this.sels = [{r1,c1,r2,c2}] (последний — активный), active={r,c}. Индексация — по view. */
class Sheet {
  constructor(container, opts) {
    this.el = container;
    this.pk = opts.pk;
    this.fkLoader = opts.fkLoader || (async () => null);
    this.fkMaps = opts.fkMaps || {};
    this.naturalOrder = opts.naturalOrder !== false;
    this.storageKey = opts.storageKey || null;
    this.sortField = opts.sortField || '';
    this.sortDir = opts.sortDir || 'asc';
    // Excel-подобные фильтр и сортировка — на клиенте (все строки уже загружены).
    this.colFilters = {};   // {имя_колонки: Set(разрешённых отображаемых значений)}
    this._sort = opts.sortField ? { col: opts.sortField, dir: opts.sortDir === 'desc' ? 'desc' : 'asc' } : null;
    this.rowH = 23;
    this._first = 0; this._last = 0;
    this.allCols = (opts.columns || []).map(c => ({
      name: c.field || c.name,
      label: c.label || c.field || c.name,
      fk: c.fk || null,
      pk: !!c.pk,
      hidden: !!c.hidden,
      hint: c.hint || null,
      editable: c.editable !== undefined ? c.editable : !c.pk,
    }));
    this.cols = this.allCols.filter(c => !c.hidden);
    const ord = this.allCols.find(c => c.hidden && c.editable && c.name === 'row_order');
    this.orderField = ord ? ord.name : null;
    this.mergeView = false;
    this.undoStack = []; this.redoStack = [];
    this.cutSet = null;
    this._editing = null;           // {vr, c, value} — открытый редактор ячейки
    this._widths = this._loadWidths();
    Sheet._injectCSS();
    // один живой экземпляр на контейнер: прежний отписываем (иначе события двоятся)
    if (container.__sheet) container.__sheet.destroy();
    container.__sheet = this;
    this._bind();
    this.setData(opts.rows || []);
  }

  destroy() {
    this._closeMenu();
    this._closeFilter();
    if (this._ac) this._ac.abort();  // снимает ВСЕ обработчики (el и document)
    if (this.el.__sheet === this) this.el.__sheet = null;
  }

  setData(rows) {
    this.rows = rows.map(r => Object.assign({}, r));
    this.orig = this.rows.map(r => Object.assign({}, r));
    this.state = this.rows.map(() => 'clean');
    this.view = this.rows.map((_, i) => i);
    this.active = { r: 0, c: 0 };
    this.sels = [{ r1: 0, c1: 0, r2: 0, c2: 0 }];
    this.undoStack = []; this.redoStack = []; this.cutSet = null; this._editing = null;
    this.render();
    this._emitActive();
  }

  // ── утилиты выделения ─────────────────────────────────────────────────────
  _activeSel() { return this.sels[this.sels.length - 1]; }
  _normOf(s) { return { r1: Math.min(s.r1, s.r2), r2: Math.max(s.r1, s.r2), c1: Math.min(s.c1, s.c2), c2: Math.max(s.c1, s.c2) }; }
  _normSel() { return this._normOf(this._activeSel()); }
  _allSels() { return this.sels.map(s => this._normOf(s)); }
  _setSingleSel(vr, c) { this.active = { r: vr, c }; this.sels = [{ r1: vr, c1: c, r2: vr, c2: c }]; }
  _filtered() { return this.view.length !== this.rows.length; }
  _rowOpsAllowed() { return this.orderField && !this._filtered() && this.naturalOrder; }
  _rowOpsBlockReason() {
    if (!this.orderField) return 'Доступно в документах Weld Balance (там есть порядок строк)';
    if (this._filtered()) return 'Снимите фильтр — позиция вставки при фильтре неоднозначна';
    if (this._sort) return 'Уберите сортировку (клик по заголовку до сброса) — порядок вставки неоднозначен';
    if (!this.naturalOrder) return 'Уберите сортировку — порядок вставки неоднозначен';
    return null;
  }
  _canEdit(c, vr) { const r = this.view[vr]; return c.editable && !(c.pk && this.state[r] !== 'new'); }
  static colLetter(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = (i - m - 1) / 26; } return s; }
  cellAddr(vr, c) { return Sheet.colLetter(c) + (vr + 1); }
  _emitActive() {
    if (!this.onActive) return;
    const { r, c } = this.active;
    const col = this.cols[c], row = this.rows[this.view[r]];
    this.onActive(this.cellAddr(r, c), row ? (row[col?.name] ?? '') : '', col ? this._canEdit(col, r) : false);
  }
  setActiveValue(val) { // применить значение из строки адреса (formula bar)
    const { r, c } = this.active, col = this.cols[c];
    if (!col || !this._canEdit(col, r)) return;
    if (this._setCells([{ r: this.view[r], name: col.name, val }])) this._afterMutate();
  }

  // ── undo/redo ─────────────────────────────────────────────────────────────
  _push(cmd) {
    this.undoStack.push(cmd);
    if (this.undoStack.length > 300) this.undoStack.shift();
    this.redoStack = [];
    if (this.onUndoState) this.onUndoState(true, false);
  }
  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
  undo() { const c = this.undoStack.pop(); if (!c) return; c.undo(); this.redoStack.push(c); this._afterMutate(); }
  redo() { const c = this.redoStack.pop(); if (!c) return; c.redo(); this.undoStack.push(c); this._afterMutate(); }
  _afterMutate() {
    this.view = this.rows.map((_, i) => i);
    this._recompute(true);
    this._onChange();
    if (this.onUndoState) this.onUndoState(this.canUndo(), this.canRedo());
    this._emitActive();
  }
  _setCells(list) {
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

  // ── diff / сохранение ─────────────────────────────────────────────────────
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

  // ── строки ───────────────────────────────────────────────────────────────
  _orderBetween(vrAbove, vrBelow, n) {
    const of = this.orderField;
    const prev = vrAbove >= 0 ? Number(this.rows[this.view[vrAbove]][of]) : null;
    const next = vrBelow < this.view.length ? Number(this.rows[this.view[vrBelow]][of]) : null;
    const lo = (prev !== null && !isNaN(prev)) ? prev : ((next !== null && !isNaN(next)) ? next - n - 1 : 0);
    const hi = (next !== null && !isNaN(next)) ? next : lo + n + 1;
    const step = (hi - lo) / (n + 1);
    return Array.from({ length: n }, (_, i) => lo + step * (i + 1));
  }
  insertRows(atVr, n, preset) {
    const reason = this._rowOpsBlockReason();
    if (reason) { alert(reason); return; }
    n = Math.max(1, n | 0);
    const rowsData = [];
    const orders = this._orderBetween(atVr - 1, atVr, n);
    for (let i = 0; i < n; i++) {
      const row = Object.assign({}, preset || {});
      this.allCols.forEach(c => { if (!(c.name in row)) row[c.name] = ''; });
      row[this.orderField] = orders[i];
      rowsData.push(row);
    }
    const at = atVr, self = this;
    const doIns = () => { self.rows.splice(at, 0, ...rowsData); self.orig.splice(at, 0, ...rowsData.map(() => ({}))); self.state.splice(at, 0, ...rowsData.map(() => 'new')); };
    const doDel = () => { self.rows.splice(at, n); self.orig.splice(at, n); self.state.splice(at, n); };
    doIns();
    this._push({ undo: doDel, redo: doIns });
    this._afterMutate();
    this._focus(atVr, this.cols.findIndex(c => c.editable && !c.pk));
  }
  addRow(preset) {
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
  toggleDeleteRange(vr1, vr2) {
    const rs = []; for (let vr = vr1; vr <= vr2; vr++) rs.push(this.view[vr]);
    const self = this;
    const before = rs.map(r => self.state[r]);
    const isNew = rs.filter(r => self.state[r] === 'new').sort((a, b) => b - a);
    const snapRows = isNew.map(r => ({ r, row: this.rows[r] }));
    const doIt = () => {
      for (const r of rs) if (self.state[r] !== 'new') self.state[r] = self.state[r] === 'deleted' ? 'clean' : 'deleted';
      for (const r of isNew) { self.rows.splice(r, 1); self.orig.splice(r, 1); self.state.splice(r, 1); }
    };
    const undoIt = () => {
      for (const s of snapRows.slice().reverse()) { self.rows.splice(s.r, 0, s.row); self.orig.splice(s.r, 0, {}); self.state.splice(s.r, 0, 'new'); }
      rs.forEach((r, i) => { if (before[i] !== 'new') self.state[r] = before[i]; });
    };
    doIt();
    this._push({ undo: undoIt, redo: doIt });
    this._afterMutate();
  }
  moveRows(vr1, vr2, delta) {
    const reason = this._rowOpsBlockReason();
    if (reason) { alert(reason); return; }
    const n = vr2 - vr1 + 1;
    const target = vr1 + delta;
    if (target < 0 || vr2 + delta >= this.rows.length) return;
    const self = this, of = this.orderField;
    const oldOrders = this.rows.map(r => r[of]);
    const block = this.rows.splice(vr1, n), blockO = this.orig.splice(vr1, n), blockS = this.state.splice(vr1, n);
    this.rows.splice(target, 0, ...block); this.orig.splice(target, 0, ...blockO); this.state.splice(target, 0, ...blockS);
    this.view = this.rows.map((_, i) => i);
    const orders = this._orderBetween(target - 1, target + n, n);
    for (let i = 0; i < n; i++) this.rows[target + i][of] = orders[i];
    const rowsAfter = this.rows.slice(), origAfter = this.orig.slice(), stateAfter = this.state.slice();
    const newOrders = this.rows.map(r => r[of]);
    const unmove = arr => { const a = arr.slice(); const blk = a.splice(target, n); a.splice(vr1, 0, ...blk); return a; };
    const rowsBefore = unmove(rowsAfter), origBefore = unmove(origAfter), stateBefore = unmove(stateAfter);
    this._push({
      undo() { self.rows = rowsBefore.slice(); self.orig = origBefore.slice(); self.state = stateBefore.slice(); self.rows.forEach((r, i) => r[of] = oldOrders[i]); },
      redo() { self.rows = rowsAfter.slice(); self.orig = origAfter.slice(); self.state = stateAfter.slice(); self.rows.forEach((r, i) => r[of] = newOrders[i]); },
    });
    this._afterMutate();
    this.active = { r: target, c: this.active.c };
    this.sels = [{ r1: target, c1: 0, r2: target + n - 1, c2: this.cols.length - 1 }];
    this._ensureVisible(target); this._paint();
  }
  cutRows(vr1, vr2) {
    const reason = this._rowOpsBlockReason();
    if (reason) { alert(reason); return; }
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

  // ── заливки (по всем прямоугольникам выделения) ──────────────────────────
  fillDown() {
    const list = [];
    for (const s of this._allSels())
      for (let c = s.c1; c <= s.c2; c++) {
        const col = this.cols[c];
        const src = this.rows[this.view[s.r1]][col.name];
        for (let vr = s.r1 + 1; vr <= s.r2; vr++)
          if (this._canEdit(col, vr)) list.push({ r: this.view[vr], name: col.name, val: src });
      }
    if (this._setCells(list)) this._afterMutate();
  }
  fillSelection(val) {
    const list = [];
    for (const s of this._allSels())
      for (let vr = s.r1; vr <= s.r2; vr++)
        for (let c = s.c1; c <= s.c2; c++)
          if (this._canEdit(this.cols[c], vr)) list.push({ r: this.view[vr], name: this.cols[c].name, val });
    if (this._setCells(list)) this._afterMutate();
  }
  fillRange(srcSel, toVr) { // маркер автозаполнения: продлить вниз/вверх (копия или прогрессия)
    const s = this._normOf(srcSel);
    const list = [];
    const down = toVr > s.r2;
    const from = down ? s.r2 + 1 : toVr, to = down ? toVr : s.r1 - 1;
    for (let c = s.c1; c <= s.c2; c++) {
      const col = this.cols[c];
      const srcVals = []; for (let vr = s.r1; vr <= s.r2; vr++) srcVals.push(this.rows[this.view[vr]][col.name]);
      const nums = srcVals.map(Number);
      const numeric = srcVals.length >= 2 && srcVals.every(v => v !== '' && v !== null && !isNaN(Number(v)));
      const step = numeric ? nums[nums.length - 1] - nums[nums.length - 2] : 0;
      let k = 0;
      const seq = [];
      for (let vr = from; vr <= to; vr++) { seq.push(vr); k++; }
      (down ? seq : seq.reverse()).forEach((vr, i) => {
        let val;
        if (numeric) val = String((down ? nums[nums.length - 1] + step * (i + 1) : nums[0] - step * (i + 1)));
        else val = srcVals[i % srcVals.length];
        if (this._canEdit(col, vr)) list.push({ r: this.view[vr], name: col.name, val });
      });
    }
    if (this._setCells(list)) this._afterMutate();
    const ns = down ? { r1: s.r1, c1: s.c1, r2: toVr, c2: s.c2 } : { r1: toVr, c1: s.c1, r2: s.r2, c2: s.c2 };
    this.sels = [ns]; this._paint();
  }

  setMergeView(on) { this.mergeView = !!on; this._renderBody(); }

  // ── ширины колонок ────────────────────────────────────────────────────────
  _loadWidths() {
    if (!this.storageKey) return {};
    try { return JSON.parse(localStorage.getItem('wt-colw-' + this.storageKey) || '{}'); } catch { return {}; }
  }
  _saveWidths() {
    if (this.storageKey) localStorage.setItem('wt-colw-' + this.storageKey, JSON.stringify(this._widths));
  }
  _colWidth(c) { return this._widths[c.name] || Math.max(70, Math.min(220, (c.label.length * 8) + 34)); }
  _totalWidth() { return 46 + 34 + this.cols.reduce((s, c) => s + this._colWidth(c), 0); }
  setColWidth(ci, w) {
    this._widths[this.cols[ci].name] = Math.max(40, Math.min(600, Math.round(w)));
    this._saveWidths();
    const col = this.el.querySelector(`col[data-ci="${ci}"]`);
    if (col) col.style.width = this._widths[this.cols[ci].name] + 'px';
    const t = this.el.querySelector('table.sheet');
    if (t) t.style.width = this._totalWidth() + 'px';
    this._positionHandle();
  }
  autoWidth(ci) {
    const col = this.cols[ci];
    let max = col.label.length;
    for (let vr = this._first; vr < Math.min(this._last, this._first + 60); vr++)
      max = Math.max(max, this._dispRaw(this.rows[this.view[vr]], col).length);
    this.setColWidth(ci, Math.min(420, max * 7.5 + 24));
  }

  // ── рендер ───────────────────────────────────────────────────────────────
  render() {
    this.view = this.rows.map((_, i) => i);
    // colgroup (фиксированные ширины)
    let cg = '<colgroup><col style="width:46px">';
    this.cols.forEach((c, ci) => cg += `<col data-ci="${ci}" style="width:${this._colWidth(c)}px">`);
    cg += '<col style="width:34px"></colgroup>';
    // строка букв A/B/C
    let letters = '<tr class="letters"><th class="rownum corner">⬥</th>';
    this.cols.forEach((c, ci) => letters += `<th class="letter" data-l="${ci}">${Sheet.colLetter(ci)}<span class="colresize" data-rs="${ci}"></span></th>`);
    letters += '<th class="rownum"></th></tr>';
    // строка заголовков
    let head = '<tr><th class="rownum"></th>';
    for (const c of this.cols) {
      const ci = this.cols.indexOf(c);
      const mark = this._sort && this._sort.col === c.name ? (this._sort.dir === 'desc' ? ' ↓' : ' ↑') : '';
      const hint = c.hint ? `<span class="colhint" data-hint="${this._esc(c.hint)}" title="${this._esc(c.hint)}">❓</span>` : '';
      head += `<th data-c-name="${c.name}" title="клик — сортировка (А→Я → Я→А → сброс)">${this._esc(c.label)}${c.fk ? ' 🔗' : ''}${c.pk ? ' 🔑' : ''}${!c.editable ? ' 🔒' : ''}${mark}${hint}<span class="colresize" data-rs="${ci}"></span></th>`;
    }
    head += '<th class="rownum"></th></tr>';
    // строка фильтров: кнопка-воронка на колонку (открывает Excel-подобную форму)
    let filt = '<tr class="filter"><th></th>';
    this.cols.forEach((c) => {
      const on = this.colFilters[c.name] ? ' on' : '';
      filt += `<th class="fcell"><button class="filterbtn${on}" data-fcol="${this._esc(c.name)}" title="Фильтр и сортировка">▾</button></th>`;
    });
    filt += '<th></th></tr>';
    this.el.innerHTML = `<table class="sheet" style="width:${this._totalWidth()}px">${cg}<thead>${letters}${head}${filt}</thead><tbody></tbody></table>` +
                        `<div class="fillhandle" style="display:none"></div>`;
    this.tbody = this.el.querySelector('tbody');
    this.handle = this.el.querySelector('.fillhandle');
    this.el.scrollTop = 0;
    this._renderBody();
    const tr = this.tbody.querySelector('tr[data-r]');
    if (tr && tr.offsetHeight && Math.abs(tr.offsetHeight - this.rowH) > 1) { this.rowH = tr.offsetHeight; this._renderBody(); }
  }
  _renderBody() {
    // сохранить открытый редактор (значение) — прокрутка не должна терять ввод
    const ce = this.el.querySelector('.celledit');
    if (ce && this._editing) { this._editing.value = ce.value; ce.onblur = null; }
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
    // восстановить редактор, если его ячейка снова видима
    if (this._editing && this._editing.vr >= first && this._editing.vr < last) this._mountEditor();
  }
  _rowHtml(vr) {
    const r = this.view[vr], st = this.state[r];
    const cut = this.cutSet && vr >= this.cutSet.vr1 && vr <= this.cutSet.vr2 ? ' cut' : '';
    let h = `<tr data-r="${vr}" class="${st}${cut}"><td class="rownum" data-rn="${vr}">${vr + 1}</td>`;
    this.cols.forEach((c, ci) => {
      let cls = (!c.editable ? 'ro ' : '') + (this._dirty(r, ci) ? 'dirty ' : '');
      let text = this._disp(this.rows[r], c);
      if (this.mergeView && text !== '') {
        const raw = this._dispRaw(this.rows[r], c);
        const prev = vr > 0 ? this._dispRaw(this.rows[this.view[vr - 1]], c) : null;
        const next = vr + 1 < this.view.length ? this._dispRaw(this.rows[this.view[vr + 1]], c) : null;
        if (prev !== null && prev === raw) { cls += 'mergehide '; text = ''; }
        if (next !== null && next === raw) cls += 'mergedown ';
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
    for (const s of this._allSels())
      for (let vr = Math.max(s.r1, this._first); vr < Math.min(s.r2 + 1, this._last); vr++)
        for (let c = s.c1; c <= s.c2; c++) { const td = this._td(vr, c); if (td) td.classList.add('sel'); }
    const a = this._td(this.active.r, this.active.c); if (a) a.classList.add('active');
    this._positionHandle();
  }
  _positionHandle() { // маркер автозаполнения в правом нижнем углу активного прямоугольника
    if (!this.handle) return;
    const s = this._normSel();
    const td = this._td(s.r2, s.c2);
    if (!td) { this.handle.style.display = 'none'; return; }
    const t = td.offsetParent === this.el ? td : td; // offset относительно таблицы внутри скролл-контейнера
    this.handle.style.display = 'block';
    this.handle.style.left = (td.offsetLeft + td.offsetWidth - 4) + 'px';
    this.handle.style.top = (td.offsetTop + td.offsetHeight - 4) + 'px';
  }
  _normSelPaintless() { return this._normSel(); }
  _ensureVisible(vr) {
    const top = vr * this.rowH, bot = top + this.rowH;
    if (top < this.el.scrollTop) this.el.scrollTop = top;
    else if (bot > this.el.scrollTop + this.el.clientHeight) this.el.scrollTop = bot - this.el.clientHeight;
    if (vr < this._first || vr >= this._last) this._renderBody();
  }
  _focus(vr, c) {
    vr = Math.max(0, Math.min(this.view.length - 1, vr));
    c = Math.max(0, Math.min(this.cols.length - 1, c));
    this._setSingleSel(vr, c);
    this._ensureVisible(vr); this._paint(); this.el.focus();
    this._emitActive();
  }

  // ── редактирование ячейки (устойчивое к прокрутке) ───────────────────────
  async _startEdit(initial) {
    const vr = this.active.r, c = this.active.c, col = this.cols[c];
    if (!col || !this._canEdit(col, vr)) return;
    const r = this.view[vr];
    this._editing = { vr, c, value: initial != null ? String(initial) : String(this.rows[r][col.name] ?? ''), fresh: initial != null };
    await this._mountEditor();
  }
  async _mountEditor() {
    const ed = this._editing; if (!ed) return;
    const col = this.cols[ed.c], r = this.view[ed.vr];
    const td = this._td(ed.vr, ed.c); if (!td) return;
    if (td.querySelector('.celledit')) return;
    let input;
    if (col.fk) {
      const fo = await this.fkLoader(col.fk);
      if (!this._editing) return; // отменили пока грузился справочник
      input = document.createElement('select');
      input.innerHTML = '<option value="">—</option>' +
        (fo ? fo.options.map(o => `<option value="${o.id}"${String(o.id) === String(this.rows[r][col.name]) ? ' selected' : ''}>${o.id} · ${this._esc(o.label)}</option>`).join('') : '');
    } else {
      input = document.createElement('input');
      input.value = ed.value;
    }
    input.className = 'celledit';
    td.textContent = ''; td.appendChild(input); input.focus();
    // курсор в конец текста (для дозаписи), без выделения всего содержимого —
    // двойной клик / F2 открывают ячейку с готовой к правке строкой, как в Excel
    if (input.setSelectionRange) input.setSelectionRange(input.value.length, input.value.length);
    input.oninput = () => { if (this._editing) this._editing.value = input.value; };
    const commit = (move, fillAll) => {
      input.onblur = null; input.remove();
      const val = input.value;
      this._editing = null;
      if (fillAll) this.fillSelection(val);
      else { this._setCells([{ r, name: col.name, val }]); this._renderCell(ed.vr, ed.c); }
      if (move) this._move(move.dr, move.dc); else this._paint();
      this._onChange(); this._emitActive();
    };
    this._commitEdit = commit;
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(null, true); }
      else if (e.key === 'Enter') { e.preventDefault(); commit({ dr: 1, dc: 0 }); }
      else if (e.key === 'Tab') { e.preventDefault(); commit({ dr: 0, dc: e.shiftKey ? -1 : 1 }); }
      else if (e.key === 'Escape') { e.preventDefault(); input.onblur = null; input.remove(); this._editing = null; this._renderCell(ed.vr, ed.c); this.el.focus(); }
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
    const s = this._activeSel();
    if (extend) { s.r2 = vr; s.c2 = c; } else this.sels = [{ r1: vr, c1: c, r2: vr, c2: c }];
    this._ensureVisible(vr); this._paint(); this._emitActive();
  }

  // ── копипаст ─────────────────────────────────────────────────────────────
  _copyTSV() {
    const s = this._normSel(); const out = [];
    // ячейку с табом/переводом строки/кавычкой заключаем в "..." (кавычки удваиваем) —
    // чтобы вставка обратно (в Excel или сюда) не разъехалась по колонкам/строкам
    const q = v => { v = String(v ?? ''); return /[\t\n\r"]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    for (let vr = s.r1; vr <= s.r2; vr++) {
      const r = this.view[vr], line = [];
      for (let c = s.c1; c <= s.c2; c++) line.push(q(this.rows[r][this.cols[c].name]));
      out.push(line.join('\t'));
    }
    return out.join('\r\n');
  }
  // Разбор буфера обмена Excel/TSV с учётом кавычек: ячейка с табом/переводом строки/
  // кавычкой заключена в "...", внутренняя кавычка удвоена (""). Такой разбор НЕ рвёт
  // многострочные ячейки (длинные описания) на несколько строк и не сдвигает колонки.
  static _parseClipboard(text) {
    const rows = []; let row = [], field = '', inQ = false, atStart = true;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '\r') continue;                                              // CRLF→LF везде (в т.ч. внутри кавычек)
      if (inQ) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += ch;
        continue;
      }
      if (ch === '"' && atStart) { inQ = true; atStart = false; continue; }   // кавычка только в начале ячейки
      if (ch === '\t') { row.push(field); field = ''; atStart = true; continue; }
      if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; atStart = true; continue; }
      field += ch; atStart = false;
    }
    row.push(field); rows.push(row);
    // убрать единственную пустую хвостовую строку (Excel добавляет перевод строки в конце)
    if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
    return rows;
  }
  _pasteTSV(text) {
    const grid = Sheet._parseClipboard(text);
    if (!grid.length || (grid.length === 1 && grid[0].length === 1 && grid[0][0] === '')) return;
    const vr0 = this.active.r, c0 = this.active.c, self = this, of = this.orderField;
    // Как в Excel: если данных больше, чем строк — дотянуть недостающие строки в хвост.
    // Автодобавление только когда вставка расширяет конец (без фильтра и сортировки —
    // иначе позиция неоднозначна и сохраняем прежнее поведение «по существующим»).
    let need = vr0 + grid.length - this.view.length;
    if (need < 0 || this._filtered() || this._sort || !this.naturalOrder) need = 0;
    const startIdx = this.rows.length, newRows = [];
    if (need > 0) {
      let base = this.rows.length;                 // порядок новых строк — за максимумом существующих
      if (of) { const mx = Math.max(0, ...this.rows.map(r => Number(r[of])).filter(v => !isNaN(v))); base = mx; }
      for (let i = 0; i < need; i++) {
        const row = {}; this.allCols.forEach(c => { row[c.name] = ''; });
        if (of) row[of] = base + 1 + i;              // порядок строк (Weld Balance)
        newRows.push(row);
        this.rows.push(row); this.orig.push({}); this.state.push('new');
      }
      this.view = this.rows.map((_, i) => i);
    }
    // записать значения (в существующие и новые строки), собрать undo
    const cells = [];
    grid.forEach((line, dr) => line.forEach((val, dc) => {
      const vr = vr0 + dr, c = c0 + dc;
      if (vr >= self.view.length || c >= self.cols.length) return;
      const col = self.cols[c];
      if (!self._canEdit(col, vr)) return;
      const ridx = self.view[vr], old = self.rows[ridx][col.name];
      if (String(old ?? '') !== String(val ?? '')) { cells.push({ ridx, name: col.name, old, val }); self.rows[ridx][col.name] = val; }
    }));
    if (!need && !cells.length) return;
    this._push({
      undo() { for (const ch of cells) self.rows[ch.ridx][ch.name] = ch.old; if (need) { self.rows.splice(startIdx, need); self.orig.splice(startIdx, need); self.state.splice(startIdx, need); } self.view = self.rows.map((_, i) => i); },
      redo() { for (let i = 0; i < need; i++) { self.rows.push(newRows[i]); self.orig.push({}); self.state.push('new'); } for (const ch of cells) self.rows[ch.ridx][ch.name] = ch.val; self.view = self.rows.map((_, i) => i); },
    });
    this._afterMutate();
    const r2 = Math.min(vr0 + grid.length - 1, this.view.length - 1), c2 = Math.min(c0 + grid[0].length - 1, this.cols.length - 1);
    this.sels = [{ r1: vr0, c1: c0, r2, c2 }]; this.active = { r: vr0, c: c0 }; this._paint();
  }
  _clearSel() {
    const list = [];
    for (const s of this._allSels())
      for (let vr = s.r1; vr <= s.r2; vr++) for (let c = s.c1; c <= s.c2; c++)
        if (this._canEdit(this.cols[c], vr)) list.push({ r: this.view[vr], name: this.cols[c].name, val: '' });
    if (this._setCells(list)) this._afterMutate();
  }
  _onChange() { if (this.onChange) this.onChange(this.dirtyCount()); }

  // ── контекстное меню ─────────────────────────────────────────────────────
  _menu(x, y) {
    this._closeMenu();
    const s = this._normSel();
    const n = s.r2 - s.r1 + 1;
    const rowReason = this._rowOpsBlockReason();
    const items = [
      { t: `Вставить строку выше (${n})`, f: () => this.insertRows(s.r1, n), dis: rowReason },
      { t: `Вставить строку ниже (${n})`, f: () => this.insertRows(s.r2 + 1, n), dis: rowReason },
      { t: '—' },
      { t: `Вырезать строки (${n})`, f: () => this.cutRows(s.r1, s.r2), dis: rowReason },
      this.cutSet ? { t: 'Вставить вырезанные выше текущей', f: () => this.pasteCutBefore(this.active.r) } : null,
      { t: 'Сдвинуть выше (Alt+↑)', f: () => this.moveRows(s.r1, s.r2, -1), dis: rowReason },
      { t: 'Сдвинуть ниже (Alt+↓)', f: () => this.moveRows(s.r1, s.r2, 1), dis: rowReason },
      { t: '—' },
      { t: `Удалить/вернуть строки (${n})`, f: () => this.toggleDeleteRange(s.r1, s.r2) },
      { t: 'Заливка вниз (Ctrl+D)', f: () => this.fillDown() },
      { t: 'Залить выделение значением…', f: () => { const v = prompt('Значение для всего выделения:'); if (v !== null) this.fillSelection(v); } },
      { t: '—' },
      { t: 'Копировать (Ctrl+C)', f: () => document.execCommand('copy') },
      { t: 'Очистить (Delete)', f: () => this._clearSel() },
    ].filter(Boolean);
    const m = document.createElement('div');
    m.id = 'sheetmenu';
    m.innerHTML = items.map((it, i) => it.t === '—' ? '<hr>' :
      `<div class="mi${it.dis ? ' dis' : ''}" data-i="${i}"${it.dis ? ` title="${this._esc(it.dis)}"` : ''}>${it.t}</div>`).join('');
    document.body.appendChild(m);
    m.style.left = Math.min(x, window.innerWidth - 270) + 'px';
    m.style.top = Math.min(y, window.innerHeight - m.offsetHeight - 8) + 'px';
    m.addEventListener('mousedown', (e) => {
      const mi = e.target.closest('.mi'); if (!mi || mi.classList.contains('dis')) { e.stopPropagation(); return; }
      e.preventDefault(); e.stopPropagation();
      const it = items[+mi.dataset.i];
      this._closeMenu(); it.f();
    });
    this._menuEsc = (e) => { if (e.key === 'Escape') this._closeMenu(); };
    this._menuDown = (e) => { if (!m.contains(e.target)) this._closeMenu(); };
    document.addEventListener('keydown', this._menuEsc);
    document.addEventListener('mousedown', this._menuDown);
  }
  _closeMenu() {
    const m = document.getElementById('sheetmenu'); if (m) m.remove();
    if (this._menuEsc) { document.removeEventListener('keydown', this._menuEsc); this._menuEsc = null; }
    if (this._menuDown) { document.removeEventListener('mousedown', this._menuDown); this._menuDown = null; }
  }

  // ── события ──────────────────────────────────────────────────────────────
  _bind() {
    this.el.tabIndex = 0;
    this.el.style.position = 'relative';
    this._ac = new AbortController();
    const sig = { signal: this._ac.signal };
    let raf = 0;
    this.el.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; this._renderBody(); }); }, sig);

    // drag-состояния
    this._drag = null; // {mode:'cells'|'rows'|'cols'|'fill'|'resize', ...}

    this.el.addEventListener('mousedown', (e) => {
      if (e.button === 2) return;
      // если открыт редактор — сначала коммит
      if (this._editing && this._commitEdit && !e.target.closest('.celledit')) this._commitEdit(null);
      const rs = e.target.closest('.colresize');
      if (rs) { // изменение ширины колонки
        e.preventDefault();
        const ci = +rs.dataset.rs;
        this._drag = { mode: 'resize', ci, startX: e.clientX, startW: this._colWidth(this.cols[ci]) };
        return;
      }
      if (e.target.closest('.fillhandle')) { // маркер автозаполнения
        e.preventDefault();
        this._drag = { mode: 'fill', src: Object.assign({}, this._activeSel()), toVr: this._normSel().r2 };
        return;
      }
      const del = e.target.closest('.delrow');
      if (del) { const vr = +del.dataset.r; this.toggleDeleteRange(vr, vr); return; }
      const letter = e.target.closest('th.letter');
      if (letter) { // выделение колонки
        const ci = +letter.dataset.l;
        this.active = { r: this._first, c: ci };
        this.sels = [{ r1: 0, c1: ci, r2: this.view.length - 1, c2: ci }];
        this._drag = { mode: 'cols', c0: ci };
        this._paint(); this.el.focus(); this._emitActive();
        return;
      }
      const rn = e.target.closest('td.rownum[data-rn]');
      if (rn) { // выделение строки
        const vr = +rn.dataset.rn;
        if (e.shiftKey) { const s = this._activeSel(); s.r2 = vr; s.c1 = 0; s.c2 = this.cols.length - 1; }
        else { this.active = { r: vr, c: 0 }; this.sels = [{ r1: vr, c1: 0, r2: vr, c2: this.cols.length - 1 }]; this._drag = { mode: 'rows', r0: vr }; }
        this._paint(); this.el.focus(); this._emitActive();
        return;
      }
      const td = e.target.closest('td[data-c]');
      if (!td) return;
      const vr = +td.dataset.r, c = +td.dataset.c;
      if (e.ctrlKey || e.metaKey) {          // несмежное выделение: новый прямоугольник
        this.active = { r: vr, c };
        this.sels.push({ r1: vr, c1: c, r2: vr, c2: c });
      } else if (e.shiftKey) {               // расширение активного
        this.active = { r: vr, c };
        const s = this._activeSel(); s.r2 = vr; s.c2 = c;
      } else {
        this._setSingleSel(vr, c);
        this._drag = { mode: 'cells' };
      }
      this._paint(); this.el.focus(); this._emitActive();
      if (this.onSelect) this.onSelect(vr, this.rows[this.view[vr]]);
    }, sig);

    this.el.addEventListener('mousemove', (e) => {
      if (!this._drag) return;
      const d = this._drag;
      if (d.mode === 'resize') { this.setColWidth(d.ci, d.startW + e.clientX - d.startX); return; }
      // автоскролл у кромок
      const rect = this.el.getBoundingClientRect();
      if (e.clientY > rect.bottom - 18) this.el.scrollTop += this.rowH;
      else if (e.clientY < rect.top + 60 && this.el.scrollTop > 0) this.el.scrollTop -= this.rowH;
      const td = e.target.closest && e.target.closest('td[data-c], td.rownum[data-rn]');
      if (!td) return;
      const vr = +(td.dataset.r ?? td.dataset.rn);
      if (d.mode === 'cells' && td.dataset.c !== undefined) {
        const s = this._activeSel(); s.r2 = vr; s.c2 = +td.dataset.c; this.active = { r: vr, c: +td.dataset.c };
        this._paint();
      } else if (d.mode === 'rows') {
        const s = this._activeSel(); s.r1 = d.r0; s.r2 = vr; s.c1 = 0; s.c2 = this.cols.length - 1;
        this._paint();
      } else if (d.mode === 'fill') {
        d.toVr = vr;
        // визуально расширяем выделение
        const src = this._normOf(d.src);
        this.sels = [vr > src.r2 ? { r1: src.r1, c1: src.c1, r2: vr, c2: src.c2 }
                     : vr < src.r1 ? { r1: vr, c1: src.c1, r2: src.r2, c2: src.c2 } : d.src];
        this._paint();
      } else if (d.mode === 'cols') {
        const s = this._activeSel(); s.c2 = td.dataset.c !== undefined ? +td.dataset.c : s.c2;
        this._paint();
      }
    }, sig);
    document.addEventListener('mouseup', () => {
      const d = this._drag; this._drag = null;
      if (d && d.mode === 'fill') {
        const src = this._normOf(d.src);
        if (d.toVr > src.r2 || d.toVr < src.r1) this.fillRange(d.src, d.toVr);
        else { this.sels = [d.src]; this._paint(); }
      }
    }, sig);
    this.el.addEventListener('dblclick', (e) => {
      const rs = e.target.closest('.colresize');
      if (rs) { this.autoWidth(+rs.dataset.rs); return; }
      if (e.target.closest('td[data-c]')) this._startEdit();
    }, sig);
    this.el.addEventListener('click', (e) => {
      if (e.target.closest('.colresize')) return;
      const fb = e.target.closest('.filterbtn');
      if (fb) { this._openFilter(fb.dataset.fcol, fb); return; }   // Excel-подобная форма фильтра
      const hintEl = e.target.closest('.colhint');
      if (hintEl) { alert(hintEl.dataset.hint); return; }   // подсказка колонки, не сортировка
      const th = e.target.closest('th[data-c-name]'); if (th) this._cycleSort(th.dataset.cName);
    }, sig);
    this.el.addEventListener('contextmenu', (e) => {
      const td = e.target.closest('td[data-c], td.rownum[data-rn]');
      if (!td) return;
      e.preventDefault();
      const vr = +(td.dataset.r ?? td.dataset.rn);
      const s = this._normSel();
      if (vr < s.r1 || vr > s.r2) {
        const c = +(td.dataset.c ?? 0);
        this._setSingleSel(vr, c); this._paint(); this._emitActive();
      }
      this._menu(e.clientX, e.clientY);
    }, sig);
    this.el.addEventListener('keydown', (e) => {
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
      else if (k === 'PageDown') { e.preventDefault(); this._move(Math.round(this.el.clientHeight / this.rowH) - 2, 0, e.shiftKey); }
      else if (k === 'PageUp') { e.preventDefault(); this._move(-(Math.round(this.el.clientHeight / this.rowH) - 2), 0, e.shiftKey); }
      else if (k === 'Tab') { e.preventDefault(); this._move(0, e.shiftKey ? -1 : 1); }
      else if (k === 'Enter' || k === 'F2') { e.preventDefault(); this._startEdit(); }
      else if (k === 'Delete') { e.preventDefault(); this._clearSel(); }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { this._startEdit(k); }
    }, sig);
    document.addEventListener('copy', (e) => {
      if (!this.el.contains(document.activeElement) && document.activeElement !== this.el) return;
      e.preventDefault(); e.clipboardData.setData('text/plain', this._copyTSV());
    }, sig);
    document.addEventListener('paste', (e) => {
      if (!this.el.contains(document.activeElement) && document.activeElement !== this.el) return;
      e.preventDefault(); this._pasteTSV(e.clipboardData.getData('text/plain'));
    }, sig);
  }
  // ── фильтр + сортировка (клиентские, Excel-подобные) ─────────────────────
  // Натуральное сравнение: числа как числа (9 < 10), затем текст (рус. алфавит), пустые — в конце.
  _cmp(a, b) {
    if (a === b) return 0;
    if (a === '') return 1;
    if (b === '') return -1;
    const na = Number(a), nb = Number(b);
    const aN = a.trim() !== '' && !isNaN(na), bN = b.trim() !== '' && !isNaN(nb);
    if (aN && bN) return na - nb;
    if (aN) return -1;
    if (bN) return 1;
    return a.localeCompare(b, 'ru');
  }
  // Пересобрать this.view из строк: применить фильтры-множества, затем сортировку.
  _recompute(keepScroll) {
    const active = Object.keys(this.colFilters);
    const idx = [];
    for (let r = 0; r < this.rows.length; r++) {
      let ok = true;
      for (const name of active) {
        const c = this.cols.find(x => x.name === name);
        if (c && !this.colFilters[name].has(this._dispRaw(this.rows[r], c))) { ok = false; break; }
      }
      if (ok) idx.push(r);
    }
    if (this._sort) {
      const c = this.cols.find(x => x.name === this._sort.col);
      if (c) { const d = this._sort.dir === 'desc' ? -1 : 1; idx.sort((x, y) => d * this._cmp(this._dispRaw(this.rows[x], c), this._dispRaw(this.rows[y], c))); }
    }
    this.view = idx;
    if (!keepScroll) { this._setSingleSel(0, this.active.c); this.el.scrollTop = 0; this._emitActive(); }
    this._renderBody();
  }
  _markFilterBtns() {
    this.el.querySelectorAll('.filterbtn').forEach(b => b.classList.toggle('on', !!this.colFilters[b.dataset.fcol]));
  }
  _cycleSort(name) {           // клик по заголовку: А→Я → Я→А → сброс
    if (!this._sort || this._sort.col !== name) this._sort = { col: name, dir: 'asc' };
    else if (this._sort.dir === 'asc') this._sort = { col: name, dir: 'desc' };
    else this._sort = null;
    this.render(); this._recompute();
  }
  _setSort(name, dir) { this._sort = { col: name, dir }; this.render(); this._recompute(); }

  _openFilter(name, btn) {
    this._closeFilter(); this._closeMenu();
    const col = this.cols.find(c => c.name === name);
    if (!col) return;
    const seen = new Set(), vals = [];
    for (const row of this.rows) { const v = this._dispRaw(row, col); if (!seen.has(v)) { seen.add(v); vals.push(v); } }
    vals.sort((a, b) => this._cmp(a, b));
    const CAP = 3000, capped = vals.length > CAP, shown = vals.slice(0, CAP);
    const cur = this.colFilters[name];                    // Set | undefined
    const isOn = v => cur ? cur.has(v) : true;
    const lbl = v => v === '' ? '(Пустые)' : v;
    const p = document.createElement('div'); p.id = 'sheetfilter';
    p.innerHTML =
      '<div class="sf-sort"><button data-sort="asc">А → Я ↑</button><button data-sort="desc">Я → А ↓</button></div>' +
      '<input class="sf-search" placeholder="Поиск значения…">' +
      '<label class="sf-all"><input type="checkbox" class="sf-allbox"> (Выделить все)</label>' +
      '<div class="sf-list">' +
        shown.map(v => `<label class="sf-item"><input type="checkbox"${isOn(v) ? ' checked' : ''}> ${this._esc(lbl(v))}</label>`).join('') +
      '</div>' +
      (capped ? `<div class="sf-empty">Показаны первые ${CAP} значений — уточните поиском</div>` : '') +
      '<div class="sf-actions"><button class="sf-ok">Применить</button><button class="sf-cancel">Отмена</button><button class="sf-clear">Сброс</button></div>';
    document.body.appendChild(p);
    const r = btn.getBoundingClientRect();
    p.style.left = Math.min(r.left, window.innerWidth - 272) + 'px';
    p.style.top = Math.min(r.bottom + 4, window.innerHeight - p.offsetHeight - 8) + 'px';

    const listEl = p.querySelector('.sf-list'), search = p.querySelector('.sf-search'), allbox = p.querySelector('.sf-allbox');
    const items = () => [...listEl.querySelectorAll('.sf-item')];
    const visible = () => items().filter(it => it.style.display !== 'none');
    const syncAll = () => { const v = visible(), on = v.filter(it => it.firstChild.checked).length; allbox.checked = on > 0 && on === v.length; allbox.indeterminate = on > 0 && on < v.length; };
    syncAll(); search.focus();
    search.oninput = () => { const q = search.value.trim().toLowerCase(); items().forEach((it, i) => { it.style.display = lbl(shown[i]).toLowerCase().includes(q) ? '' : 'none'; }); syncAll(); };
    allbox.onchange = () => { visible().forEach(it => it.firstChild.checked = allbox.checked); };
    listEl.onchange = syncAll;
    p.querySelector('.sf-ok').onclick = () => {
      const picked = new Set();
      items().forEach((it, i) => { if (it.firstChild.checked) picked.add(shown[i]); });
      if (!capped && picked.size === shown.length) delete this.colFilters[name];   // всё выбрано → фильтра нет
      else this.colFilters[name] = picked;
      this._closeFilter(); this._markFilterBtns(); this._recompute();
    };
    p.querySelector('.sf-cancel').onclick = () => this._closeFilter();
    p.querySelector('.sf-clear').onclick = () => { delete this.colFilters[name]; this._closeFilter(); this._markFilterBtns(); this._recompute(); };
    p.querySelectorAll('.sf-sort button').forEach(b => b.onclick = () => { this._closeFilter(); this._setSort(name, b.dataset.sort); });

    this._filterEsc = (e) => { if (e.key === 'Escape') this._closeFilter(); };
    this._filterDown = (e) => { if (!p.contains(e.target) && !e.target.closest('.filterbtn')) this._closeFilter(); };
    document.addEventListener('keydown', this._filterEsc);
    document.addEventListener('mousedown', this._filterDown);
    this._filterEl = p;
  }
  _closeFilter() {
    if (this._filterEl) { this._filterEl.remove(); this._filterEl = null; }
    if (this._filterEsc) { document.removeEventListener('keydown', this._filterEsc); this._filterEsc = null; }
    if (this._filterDown) { document.removeEventListener('mousedown', this._filterDown); this._filterDown = null; }
  }

  static _injectCSS() {
    if (document.getElementById('sheet-x-css')) return;
    const s = document.createElement('style'); s.id = 'sheet-x-css';
    s.textContent =
      '.filterbtn{border:1px solid var(--border);background:var(--bg);color:var(--muted,#888);border-radius:4px;font-size:11px;line-height:1;padding:2px 6px;cursor:pointer;width:100%}' +
      '.filterbtn:hover{border-color:var(--accent);color:var(--accent)}' +
      '.filterbtn.on{background:var(--accent);color:#fff;border-color:var(--accent)}' +
      '#sheetfilter{position:fixed;z-index:100;width:262px;background:var(--card);border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,.28);padding:8px;font-size:13px;color:inherit;display:flex;flex-direction:column;gap:7px}' +
      '#sheetfilter .sf-sort{display:flex;gap:6px}' +
      '#sheetfilter .sf-sort button{flex:1;padding:6px;border:1px solid var(--border);background:var(--bg);color:inherit;border-radius:6px;cursor:pointer;font-size:12px}' +
      '#sheetfilter .sf-sort button:hover{border-color:var(--accent);color:var(--accent)}' +
      '#sheetfilter .sf-search{padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:inherit;font-size:13px;width:100%;box-sizing:border-box}' +
      '#sheetfilter .sf-all{display:flex;align-items:center;gap:7px;padding:2px;font-weight:600;border-bottom:1px solid var(--border);padding-bottom:6px;cursor:pointer}' +
      '#sheetfilter .sf-list{max-height:210px;overflow-y:auto;overflow-x:hidden}' +
      '#sheetfilter .sf-item{display:flex;align-items:center;gap:7px;min-height:24px;padding:2px 4px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}' +
      '#sheetfilter .sf-item input,#sheetfilter .sf-all input{flex:0 0 auto;width:15px;height:15px;margin:0}' +
      '#sheetfilter .sf-item:hover{background:color-mix(in srgb,var(--accent) 12%,transparent)}' +
      '#sheetfilter .sf-actions{display:flex;gap:6px;border-top:1px solid var(--border);padding-top:7px}' +
      '#sheetfilter .sf-actions button{padding:6px 10px;border:1px solid var(--border);background:var(--bg);color:inherit;border-radius:6px;cursor:pointer;font-size:12px}' +
      '#sheetfilter .sf-ok{background:var(--accent);color:#fff;border-color:var(--accent)}' +
      '#sheetfilter .sf-clear{margin-left:auto}' +
      '#sheetfilter .sf-empty{color:var(--muted,#888);font-size:11.5px;padding:2px}';
    document.head.appendChild(s);
  }
}
window.Sheet = Sheet;
