/* Вкладка «Шпильки».
 *
 * Запись (оператор сборки): фото QR контрольной карты → VIN читается прямо в телефоне
 * (jsQR, фото QR никуда не отправляется) → схема модели по VIN → тап по шпильке → фото
 * шпильки → запись на сервере. Шаг (VIN, выбранная шпилька) хранится в localStorage:
 * если Android выгрузит Chrome во время съёмки, оператор продолжит с того же места.
 *
 * Журнал: ИТО/УЗК разбирают записи по фото — категория, источник, комментарий.
 */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const readJson = r => r.json().catch(() => ({ status: 'error', message: `Сервер не принял запрос (код ${r.status})` }));

  const COLOURS = { yellow: '#ffd400', blue: '#00b0f0', green: '#00d000', red: '#ff2020', white: '#ffffff', pink: '#ff66cc', orange: '#ff8c00' };
  const COLOUR_NAMES = { yellow: 'жёлтый', blue: 'синий', green: 'зелёный', red: 'красный', white: 'белый', pink: 'розовый', orange: 'оранжевый' };
  const STORE = 'studs-v1';
  const STORE_TTL = 15 * 60 * 1000;          // шаг оператора помнится 15 минут
  const TAB_STORE = 'studs-tab';
  const ZOOMS = [1, 1.6, 2.5, 4];
  const VIN_AT_START = /^[A-HJ-NPR-Z0-9]{17}/; // нижний QR = VIN; верхний начинается с VIN
  const AUTO_MODEL = false;                    // модель по VIN — выключено, выбирает оператор

  let C = null;                  // каталог с сервера
  let schemeByCode = {};
  let studByNo = {};
  let partByKey = {};            // картинки «вид шпильки»: деталь_цвет → {has_image, img_v}
  let S = blank();               // шаг оператора (переживает перезапуск страницы)
  let zoom = 1;
  let zoomChosen = false;        // масштаб по умолчанию выбирается один раз по ширине экрана
  let carRecords = [];
  let pendingPhoto = null;
  let sending = false;
  let logRows = [];
  let revRec = null;

  function blank() { return { vin: '', vinKey: '', scheme: '', view: '', sel: null, cam: 0, t: 0 }; }
  function save() { S.t = Date.now(); try { localStorage.setItem(STORE, JSON.stringify(S)); } catch { /* приватный режим */ } }
  function restore() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (s && Date.now() - (s.t || 0) < STORE_TTL) return Object.assign(blank(), s);
    } catch { /* повреждено — начинаем заново */ }
    return null;
  }
  function forget() { S = blank(); try { localStorage.removeItem(STORE); } catch { /* ок */ } }

  let toastTimer = 0;
  function toast(msg, isErr) {
    const t = $('toast');
    t.textContent = msg;
    t.className = isErr ? 'err' : '';
    t.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, isErr ? 6000 : 3500);
  }
  function say(el, type, html) { el.innerHTML = html ? `<div class="alert alert-${type}">${html}</div>` : ''; }
  const fmtTime = ts => (ts || '').replace('T', ' ').slice(0, 16);

  // ── чтение QR в телефоне ───────────────────────────────────────────────────

  async function loadImage(file) {
    if (window.createImageBitmap) {
      try { return await createImageBitmap(file); } catch { /* старый браузер — через <img> */ }
    }
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
  }

  function vinFromText(text) {
    const m = VIN_AT_START.exec(String(text || '').trim().toUpperCase());
    return m ? m[0] : null;
  }

  // Кадр целиком в двух масштабах, затем по частям: на снимке всей карты два QR и много
  // мелочи — по частям код находится надёжнее. Между попытками отдаём поток (прогресс).
  async function readQr(file, onStep) {
    const img = await loadImage(file);
    const W = img.width, H = img.height;
    const plan = [[0, 0, W, H, 1200], [0, 0, W, H, 2000]];
    for (const [f, steps] of [[0.6, [0, 0.4]], [0.4, [0, 0.3, 0.6]]]) {
      for (const fy of steps) for (const fx of steps) plan.push([fx * W, fy * H, f * W, f * H, 1400]);
    }
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    let other = null;
    try {
      for (let i = 0; i < plan.length; i++) {
        if (onStep) onStep(i + 1, plan.length);
        await new Promise(r => setTimeout(r, 0));
        const [sx, sy, sw, sh, max] = plan[i];
        const k = Math.min(1, max / Math.max(sw, sh));
        cv.width = Math.max(1, Math.round(sw * k));
        cv.height = Math.max(1, Math.round(sh * k));
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
        const d = ctx.getImageData(0, 0, cv.width, cv.height);
        const r = window.jsQR(d.data, cv.width, cv.height, { inversionAttempts: 'dontInvert' });
        if (r && r.data) {
          const vin = vinFromText(r.data);
          if (vin) return { vin, text: r.data };
          other = r.data;
        }
      }
    } finally { if (img.close) img.close(); }
    return { vin: null, text: other };
  }

  // Фото шпильки: до 2000 px по длинной стороне (для разбора хватает, диск сервера бережём).
  async function shrinkPhoto(file) {
    try {
      const img = await loadImage(file);
      const k = Math.min(1, 2000 / Math.max(img.width, img.height));
      if (k === 1 && file.size < 1.5e6 && /jpe?g/i.test(file.type)) { if (img.close) img.close(); return file; }
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k);
      cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      if (img.close) img.close();
      const blob = await new Promise(res => cv.toBlob(res, 'image/jpeg', 0.85));
      return blob ? new File([blob], 'stud.jpg', { type: 'image/jpeg' }) : file;
    } catch { return file; }
  }

  // ── каталог ────────────────────────────────────────────────────────────────

  async function loadCatalog() {
    const r = await fetch('/api/studs/catalog');
    if (!r.ok) throw new Error(r.status);
    C = await r.json();
    schemeByCode = {};
    studByNo = {};
    partByKey = {};
    C.schemes.forEach(s => { schemeByCode[s.code] = s; });
    C.studs.forEach(s => { studByNo[s.stud_no] = s; });
    (C.parts || []).forEach(p => { partByKey[p.key] = p; });
  }
  const viewsOf = code => (schemeByCode[code] || { views: [] }).views;
  const studsOf = viewKey => C.studs.filter(s => s.view_key === viewKey);
  // то же правило, что app.studs.part_image_key: деталь_цвет
  const partKey = s => (s.part && s.colour ? `${s.part}_${s.colour}` : '');
  function partPicUrl(key) {
    const p = partByKey[key];
    return p && p.has_image ? `/api/studs/parts/${encodeURIComponent(key)}/image?v=${p.img_v}` : '';
  }

  // ── запись: машина ─────────────────────────────────────────────────────────

  async function lookupVin(raw) {
    const r = await fetch('/api/studs/vin?vin=' + encodeURIComponent(raw)).then(readJson);
    if (r.status !== 'success') throw new Error(r.message || 'VIN не принят');
    return r;
  }

  async function takeVin(raw) {
    const res = await lookupVin(raw);
    forget();
    S.vin = raw;
    S.vinKey = res.vin_key;
    // Модель оператор пока выбирает сам (решение Алибека 2026-11-10: как VIN разных брендов
    // различаются — выясняем по записям). Сервер всё равно подсказывает схему по началу VIN —
    // включить автоопределение = AUTO_MODEL = true.
    S.scheme = AUTO_MODEL && res.scheme_code && schemeByCode[res.scheme_code] ? res.scheme_code : '';
    S.view = S.scheme ? (viewsOf(S.scheme)[0] || {}).view_key || '' : '';
    save();
    carRecords = [];
    renderCar();
    loadCarRecords();
  }

  async function onQrFile(file) {
    const st = $('qrStatus');
    say(st, 'info', 'Читаю QR…');
    try {
      const r = await readQr(file, (i, n) => say(st, 'info', `Читаю QR… ${i}/${n}`));
      if (!r.vin) {
        say(st, 'warn', 'QR не прочитан. Снимите ближе — чтобы <b>нижний QR</b> занимал почти весь кадр, без бликов. Или введите VIN вручную.' +
          (r.text ? `<br><span class="text-sm">Прочитан другой код: ${esc(r.text.slice(0, 60))}</span>` : ''));
        return;
      }
      say(st, '', '');
      await takeVin(r.vin);
      toast('VIN прочитан: ' + r.vin);
    } catch (e) {
      say(st, 'danger', esc(e.message && !/^\d+$/.test(e.message) ? e.message : 'Не удалось прочитать фото — попробуйте ещё раз'));
    }
  }

  function renderCar() {
    const has = !!S.vinKey;
    $('carEmpty').hidden = has;
    $('carSet').hidden = !has;
    if (!has) {
      $('schemeCard').hidden = true;
      $('carRecordsCard').hidden = true;
      closeSheet();
      return;
    }
    $('vinText').textContent = S.vinKey;   // на экране — стандартный вид; на сервер уходит как введено
    const sc = schemeByCode[S.scheme];
    $('schemeText').innerHTML = sc ? `${esc(sc.title)} <small>· ${esc(sc.code)}</small>` : '';
    $('schemePick').hidden = !!sc;
    $('changeModelBtn').hidden = !sc;
    $('schemeBtns').innerHTML = C.schemes.map(s =>
      `<button class="btn btn-ghost" type="button" data-scheme="${esc(s.code)}">${esc(s.title)}<br><small class="text-muted">${esc(s.code)}</small></button>`).join('');
    $('schemeCard').hidden = !sc;
    if (sc) { renderViews(); renderMap(true); }
    renderCarRecords();
    if (S.sel && sc) openSheet(); else closeSheet();
  }

  function pickScheme(code) {
    if (!schemeByCode[code]) return;
    S.scheme = code;
    S.view = (viewsOf(code)[0] || {}).view_key || '';
    S.sel = null;
    save();
    renderCar();
  }

  // ── запись: схема ──────────────────────────────────────────────────────────

  function renderViews() {
    $('viewChips').innerHTML = viewsOf(S.scheme).map(v =>
      `<button type="button" data-view="${esc(v.view_key)}" aria-pressed="${v.view_key === S.view}">${esc(v.title)}<span class="cnt">${studsOf(v.view_key).length}</span></button>`).join('');
  }

  function doneSet() { return new Set(carRecords.map(r => r.stud_no)); }

  function renderMap(center) {
    const v = viewsOf(S.scheme).find(x => x.view_key === S.view);
    const map = $('map');
    if (!v) { map.innerHTML = ''; $('legend').innerHTML = ''; return; }
    const pic = v.has_image
      ? `<img src="/api/studs/views/${encodeURIComponent(v.view_key)}/image?v=${v.img_v}" alt="${esc(v.title)}" width="${v.width}" height="${v.height}" draggable="false">`
      : `<div class="noimg" style="aspect-ratio:${v.width}/${v.height}">Картинка этого вида ещё не загружена на сервер (Журнал → «Картинки схем»). Кружки шпилек стоят на своих местах.</div>`;
    const done = doneSet();
    const marks = studsOf(v.view_key).map(s =>
      `<button type="button" class="mk${s.stud_no === S.sel ? ' sel' : ''}${done.has(s.stud_no) ? ' done' : ''}" data-no="${s.stud_no}"
         style="left:${s.x}%;top:${s.y}%;--c:${COLOURS[s.colour] || '#ffd400'}" aria-label="Шпилька ${esc(s.label)}"><i></i><span>${esc(s.label)}</span></button>`).join('');
    map.innerHTML = pic + marks;
    renderLegend(v);
    chooseDefaultZoom();
    applyZoom(zoom, false);
    if (center) centerMap();
  }

  // Телефон: схема во всю ширину — кружки налезают друг на друга; сразу крупнее, листать пальцем.
  // Выбирается один раз, когда рамка уже видна (при открытии страницы вкладка ещё скрыта — ширина 0).
  function chooseDefaultZoom() {
    if (zoomChosen) return false;
    const w = $('mapWrap').offsetWidth;
    if (!w) return false;
    zoom = w < 600 ? 2.5 : 1;
    zoomChosen = true;
    return true;
  }

  // Легенда под схемой, как в Excel цеха: кружок цвета + примерный вид шпильки + деталь + сколько на виде.
  function renderLegend(v) {
    const groups = new Map();
    studsOf(v.view_key).forEach(s => {
      const key = partKey(s) || `?_${s.colour || ''}`;
      const g = groups.get(key) || { key, part: s.part, colour: s.colour, n: 0 };
      g.n++;
      groups.set(key, g);
    });
    $('legend').innerHTML = [...groups.values()].sort((a, b) => b.n - a.n).map(g => {
      const pic = partPicUrl(g.key);
      const colour = COLOUR_NAMES[g.colour] || g.colour || '';
      return `<div class="lg">
        <span class="lg-dot" style="--c:${COLOURS[g.colour] || '#ffd400'}" title="${esc(colour)}"><i></i></span>
        ${pic ? `<img class="lg-pic" src="${pic}" alt="Вид шпильки ${esc(g.part)}" loading="lazy">` : ''}
        <span><b>${esc(g.part || 'деталь не указана')}</b><small>${esc(colour)} · ${g.n} шт.</small></span>
      </div>`;
    }).join('');
  }

  // Отметки (выбрана / уже записана) — без перерисовки картинки: прокрутка и масштаб остаются.
  function refreshMarks() {
    const done = doneSet();
    document.querySelectorAll('#map .mk').forEach(b => {
      const no = +b.dataset.no;
      b.classList.toggle('done', done.has(no));
      b.classList.toggle('sel', no === S.sel);
    });
  }

  function centerMap() {
    const w = $('mapWrap');
    w.scrollLeft = (w.scrollWidth - w.clientWidth) / 2;
    w.scrollTop = (w.scrollHeight - w.clientHeight) / 2;
  }

  // Ширина схемы при масштабе 1: вся картинка видна целиком — и по ширине, и по высоте рамки
  // (на компьютере высокие виды иначе уходят под полосу прокрутки).
  // Считается от рамки без полос прокрутки (box-sizing: border-box), чтобы не зависеть от того,
  // показана ли сейчас полоса. 0 — рамка скрыта, размер ещё неизвестен.
  function fitWidth() {
    const w = $('mapWrap');
    const cs = getComputedStyle(w);
    const full = w.offsetWidth - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
    if (full <= 0) return 0;
    const v = viewsOf(S.scheme).find(x => x.view_key === S.view);
    const maxH = parseFloat(cs.maxHeight) - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth);
    if (!v || !v.width || !v.height || !(maxH > 0)) return full;
    return Math.max(1, Math.min(full, Math.floor((maxH - 1) * v.width / v.height)));
  }

  function applyZoom(z, keepCenter = true) {
    const w = $('mapWrap');
    const map = $('map');
    const cx = keepCenter && w.scrollWidth ? (w.scrollLeft + w.clientWidth / 2) / w.scrollWidth : 0.5;
    const cy = keepCenter && w.scrollHeight ? (w.scrollTop + w.clientHeight / 2) / w.scrollHeight : 0.5;
    zoom = z;
    const base = fitWidth();
    map.style.width = base ? Math.round(base * z) + 'px' : (z * 100) + '%';
    map.classList.toggle('labels', $('labelsChk').checked || z >= 2.5);
    if (keepCenter) {
      w.scrollLeft = cx * w.scrollWidth - w.clientWidth / 2;
      w.scrollTop = cy * w.scrollHeight - w.clientHeight / 2;
    }
    $('zoomOut').disabled = z <= ZOOMS[0];
    $('zoomIn').disabled = z >= ZOOMS[ZOOMS.length - 1];
  }

  function selectStud(no) {
    S.sel = no;
    S.cam = 0;
    save();
    refreshMarks();
    say($('sendStatus'), '', '');
    pendingPhoto = null;
    openSheet();
  }

  function openSheet(note) {
    const s = studByNo[S.sel];
    if (!s) { closeSheet(); return; }
    const v = viewsOf(S.scheme).find(x => x.view_key === s.view_key);
    $('selNo').textContent = s.label;
    $('selMeta').textContent = [s.part, v && v.title, s.station ? 'станция ' + s.station : '',
      String(s.label).endsWith('?') ? 'номер уточняется в цехе' : ''].filter(Boolean).join(' · ');
    const pic = partPicUrl(partKey(s));
    $('selPic').hidden = !pic;
    if (pic) $('selPic').src = pic; else $('selPic').removeAttribute('src');
    $('sheet').hidden = false;
    if (note) say($('sendStatus'), 'warn', note);
  }

  function closeSheet() { $('sheet').hidden = true; }

  // ── запись: фото и отправка ────────────────────────────────────────────────

  function startPhoto(inputId) {
    S.cam = 1;                       // если Chrome выгрузят во время съёмки — увидим после перезапуска
    save();
    const inp = $(inputId);
    inp.value = '';
    inp.click();
  }

  async function onPhotoFile(file) {
    S.cam = 0;
    save();
    pendingPhoto = file;
    await send();
  }

  async function send() {
    if (sending || !pendingPhoto || !S.sel) return;
    sending = true;
    const btn = $('photoBtn');
    btn.disabled = true;
    say($('sendStatus'), 'info', 'Отправляю фото…');
    try {
      const fd = new FormData();
      fd.append('vin', S.vin);
      fd.append('scheme_code', S.scheme);
      fd.append('stud_no', String(S.sel));
      fd.append('photo', await shrinkPhoto(pendingPhoto));
      const res = await fetch('/api/studs/records', { method: 'POST', body: fd }).then(readJson);
      if (res.status !== 'success') { say($('sendStatus'), 'danger', esc(res.message || 'Не записано')); return; }
      pendingPhoto = null;
      if (res.record && !carRecords.some(r => r.id === res.record.id)) carRecords.unshift(res.record);
      toast((res.duplicate ? '' : '✓ ') + res.message);
      S.sel = null;
      save();
      closeSheet();
      refreshMarks();
      renderCarRecords();
      updateNewCount();
    } catch {
      say($('sendStatus'), 'danger', 'Нет связи с сервером — запись не сохранена. <button class="btn btn-sm btn-primary" type="button" id="retryBtn">Отправить ещё раз</button>');
    } finally {
      sending = false;
      btn.disabled = false;
    }
  }

  async function loadCarRecords() {
    if (!S.vinKey) return;
    try {
      const r = await fetch('/api/studs/records?limit=100&vin=' + encodeURIComponent(S.vinKey)).then(readJson);
      if (r.status === 'success') { carRecords = r.records; renderCarRecords(); refreshMarks(); }
    } catch { /* оффлайн — список подтянется позже */ }
  }

  function canDelete(r) {
    if (!C) return false;
    if (C.is_admin) return true;
    if (r.created_by !== C.uid || r.reviewed_at) return false;
    return Date.now() - new Date(r.created_at).getTime() < C.own_delete_minutes * 60000;
  }

  function renderCarRecords() {
    const card = $('carRecordsCard');
    card.hidden = !S.vinKey || !carRecords.length;
    $('carRecords').innerHTML = carRecords.map(r =>
      `<li><span><b>${esc(r.stud_label)}</b> ·${esc(fmtTime(r.created_at))} · ${esc(r.operator || '')}</span>
         ${canDelete(r) ? `<button class="btn btn-ghost btn-sm" type="button" data-del="${r.id}">Удалить</button>` : ''}</li>`).join('');
  }

  async function deleteRecord(id, after) {
    if (!confirm('Удалить эту запись вместе с фото?')) return false;
    const r = await fetch('/api/studs/records/' + id, { method: 'DELETE' }).then(readJson).catch(() => ({ status: 'error', message: 'Нет связи с сервером' }));
    if (r.status !== 'success') { toast(r.message || 'Не удалено', true); return false; }
    carRecords = carRecords.filter(x => x.id !== id);
    logRows = logRows.filter(x => x.id !== id);
    toast('Запись удалена');
    if (after) after();
    return true;
  }

  // ── журнал ─────────────────────────────────────────────────────────────────

  function logQuery(extra) {
    const p = new URLSearchParams();
    p.set('status', $('fStatus').value);
    if ($('fScheme').value) p.set('scheme', $('fScheme').value);
    if ($('fQ').value.trim()) p.set('q', $('fQ').value.trim());
    if ($('fFrom').value) p.set('date_from', $('fFrom').value);
    if ($('fTo').value) p.set('date_to', $('fTo').value);
    Object.entries(extra || {}).forEach(([k, v]) => p.set(k, v));
    return '/api/studs/records?' + p.toString();
  }

  async function loadLog() {
    const body = $('logBody');
    try {
      const r = await fetch(logQuery()).then(readJson);
      if (r.status !== 'success') throw new Error(r.message);
      logRows = r.records;
      renderLog();
      if ($('fStatus').value === 'new' && !$('fScheme').value && !$('fQ').value.trim() && !$('fFrom').value && !$('fTo').value) setNewCount(logRows.length);
    } catch {
      body.innerHTML = '<tr class="empty-row"><td colspan="9">Не удалось загрузить журнал. <button class="btn btn-ghost btn-sm" type="button" id="logRetry">↻ Повторить</button></td></tr>';
    }
  }

  function renderLog() {
    const body = $('logBody');
    if (!logRows.length) {
      body.innerHTML = `<tr class="empty-row"><td colspan="9">${$('fStatus').value === 'new' ? 'Все записи разобраны' : 'Записей нет'}</td></tr>`;
      return;
    }
    body.innerHTML = logRows.map(r => `<tr data-id="${r.id}">
      <td data-label="Когда">${esc(fmtTime(r.created_at))}</td>
      <td data-label="VIN"><span style="font-family:ui-monospace,Consolas,monospace">${esc(r.vin)}</span></td>
      <td data-label="Модель">${esc(r.scheme_title || r.scheme_code)}</td>
      <td data-label="Шпилька"><b>${esc(r.stud_label)}</b><span class="text-muted text-sm">${esc(r.view_title || '')}</span></td>
      <td data-label="Станция">${esc(r.station || '—')}</td>
      <td data-label="Оператор">${esc(r.operator || '—')}</td>
      <td data-label="Фото">${r.has_photo ? `<img class="sp-thumb" loading="lazy" src="/api/studs/records/${r.id}/photo" alt="Фото шпильки ${esc(r.stud_label)}">` : '—'}</td>
      <td data-label="Категория">${r.category ? esc(r.category_label) : '<span class="badge bw">не разобрано</span>'}</td>
      <td data-label="Источник">${esc(r.source_label || '—')}</td></tr>`).join('');
  }

  function setNewCount(n) {
    const b = $('newCount');
    b.hidden = !(C && C.can_review && n);
    b.textContent = n >= 2000 ? '2000+' : n;
  }

  async function updateNewCount() {
    if (!C || !C.can_review) return;
    try {
      const r = await fetch('/api/studs/records?status=new&limit=2000').then(readJson);
      if (r.status === 'success') setNewCount(r.records.length);
    } catch { /* не критично */ }
  }

  // Диалог разбора: «назад» на Android закрывает диалог, а не уводит со страницы.
  function openReview(rec) {
    revRec = rec;
    const dlg = $('revDlg');
    $('revTitle').textContent = `Шпилька ${rec.stud_label} ·${rec.scheme_title || rec.scheme_code}`;
    $('revPhoto').src = rec.has_photo ? `/api/studs/records/${rec.id}/photo` : '';
    $('revPhoto').hidden = !rec.has_photo;
    const info = [['Когда', fmtTime(rec.created_at)], ['VIN', rec.vin], ['Вид', rec.view_title], ['Артикул', rec.part],
      ['Станция', rec.station || '—'], ['Оператор', rec.operator || '—']];
    if (rec.reviewed_at) info.push(['Разобрал', `${rec.reviewer || '—'} · ${fmtTime(rec.reviewed_at)}`]);
    $('revInfo').innerHTML = info.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v || '—')}</dd>`).join('');
    const opts = (map, cur) => '<option value="">— не выбрано —</option>' +
      Object.entries(map).map(([k, v]) => `<option value="${esc(k)}"${k === cur ? ' selected' : ''}>${esc(v)}</option>`).join('');
    $('revCat').innerHTML = opts(C.categories, rec.category);
    $('revSrc').innerHTML = opts(C.sources, rec.source);
    $('revComment').value = rec.comment || '';
    const can = C.can_review;
    ['revCat', 'revSrc', 'revComment'].forEach(id => { $(id).disabled = !can; });
    $('revSave').hidden = !can;
    $('revDelete').hidden = !canDelete(rec);
    say($('revStatus'), 'info', can ? '' : 'Категорию и источник ставят ИТО и УЗК.');
    if (!dlg.open) {
      dlg.showModal();
      history.pushState({ studsDlg: 1 }, '');
    }
  }

  function closeReview() {
    if (history.state && history.state.studsDlg) history.back();
    else if ($('revDlg').open) $('revDlg').close();
  }

  async function saveReview() {
    const btn = $('revSave');
    if (btn.disabled || !revRec) return;
    btn.disabled = true;
    try {
      const res = await fetch('/api/studs/records/' + revRec.id, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: $('revCat').value, source: $('revSrc').value, comment: $('revComment').value }),
      }).then(readJson);
      if (res.status !== 'success') { say($('revStatus'), 'danger', esc(res.message || 'Не сохранено')); return; }
      toast('Сохранено');
      closeReview();
      loadLog();
    } catch {
      say($('revStatus'), 'danger', 'Нет связи с сервером — не сохранено, повторите');
    } finally { btn.disabled = false; }
  }

  // ── картинки схем (WeldTeam) ───────────────────────────────────────────────

  function renderImgList() {
    $('imgCard').hidden = !C.can_manage;
    if (!C.can_manage) return;
    const badge = has => (has ? '<span class="badge bs">загружена</span>' : '<span class="badge bd">нет</span>');
    const views = C.schemes.flatMap(s => s.views.map(v =>
      `<li><span><code>${esc(v.view_key)}</code> · ${esc(s.title)} — ${esc(v.title)}</span><span>${badge(v.has_image)}</span></li>`));
    const models = {};
    C.studs.forEach(s => {
      const k = partKey(s);
      const t = (schemeByCode[s.scheme_code] || {}).title || s.scheme_code;
      if (k) (models[k] = models[k] || new Set()).add(t);
    });
    const parts = (C.parts || []).map(p =>
      `<li><span><code>${esc(p.key)}</code> · вид шпильки ${esc(p.part)}, кружок ${esc(COLOUR_NAMES[p.colour] || p.colour)} — ${esc([...(models[p.key] || [])].join(', '))}</span><span>${badge(p.has_image)}</span></li>`);
    $('imgList').innerHTML = views.join('') + (parts.length ? '<li class="sp-imgs-h"><b>Вид шпилек (легенда под схемой)</b></li>' + parts.join('') : '');
  }

  async function uploadImages() {
    const files = $('imgFiles').files;
    if (!files.length) { say($('imgStatus'), 'warn', 'Выберите файлы картинок'); return; }
    const btn = $('imgUpload');
    btn.disabled = true;
    say($('imgStatus'), 'info', 'Загружаю…');
    try {
      const fd = new FormData();
      [...files].forEach(f => fd.append('images', f));
      const res = await fetch('/api/studs/views/images', { method: 'POST', body: fd }).then(readJson);
      const skipped = (res.skipped || []).map(s => `${esc(s.name)} — ${esc(s.reason)}`).join('<br>');
      say($('imgStatus'), res.status === 'success' ? 'success' : 'danger', esc(res.message || 'Ошибка') + (skipped ? '<br>' + skipped : ''));
      await loadCatalog();
      renderImgList();
      if (S.scheme) renderMap();
      $('imgFiles').value = '';
    } catch {
      say($('imgStatus'), 'danger', 'Нет связи с сервером — не загружено');
    } finally { btn.disabled = false; }
  }

  // ── вкладки ────────────────────────────────────────────────────────────────

  function showTab(tab) {
    const log = tab === 'log';
    $('tabRec').hidden = log;
    $('tabLog').hidden = !log;
    $('tabRecBtn').setAttribute('aria-selected', String(!log));
    $('tabLogBtn').setAttribute('aria-selected', String(log));
    try { localStorage.setItem(TAB_STORE, tab); } catch { /* ок */ }
    if (log) loadLog();
  }

  // ── события ────────────────────────────────────────────────────────────────

  function wire() {
    $('tabRecBtn').addEventListener('click', () => showTab('rec'));
    $('tabLogBtn').addEventListener('click', () => showTab('log'));

    $('qrBtn').addEventListener('click', () => { $('fileQrCam').value = ''; $('fileQrCam').click(); });
    $('qrGalleryBtn').addEventListener('click', () => { $('fileQrGal').value = ''; $('fileQrGal').click(); });
    ['fileQrCam', 'fileQrGal'].forEach(id => $(id).addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (f) onQrFile(f);
    }));
    $('vinManualBtn').addEventListener('click', () => { $('vinForm').hidden = false; $('vinInput').focus(); });
    $('vinForm').addEventListener('submit', async e => {
      e.preventDefault();
      const raw = $('vinInput').value.trim();
      if (!raw) return;
      try { await takeVin(raw); $('vinForm').hidden = true; $('vinInput').value = ''; say($('qrStatus'), '', ''); } catch (err) { say($('qrStatus'), 'warn', esc(err.message)); }
    });

    $('schemeBtns').addEventListener('click', e => {
      const b = e.target.closest('[data-scheme]');
      if (b) pickScheme(b.dataset.scheme);
    });
    $('changeModelBtn').addEventListener('click', () => {
      $('schemePickNote').textContent = 'Выберите другую модель:';
      $('schemePick').hidden = false;
    });
    $('newCarBtn').addEventListener('click', () => {
      forget();
      carRecords = [];
      say($('qrStatus'), '', '');
      renderCar();
      window.scrollTo({ top: 0 });
    });

    $('viewChips').addEventListener('click', e => {
      const b = e.target.closest('[data-view]');
      if (!b) return;
      S.view = b.dataset.view;
      save();
      renderViews();
      renderMap(true);
    });
    $('map').addEventListener('click', e => {
      const b = e.target.closest('.mk');
      if (b) selectStud(+b.dataset.no);
    });
    $('zoomIn').addEventListener('click', () => applyZoom(ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(zoom) + 1)]));
    $('zoomOut').addEventListener('click', () => applyZoom(ZOOMS[Math.max(0, ZOOMS.indexOf(zoom) - 1)]));
    $('labelsChk').addEventListener('change', () => applyZoom(zoom, false));
    // поворот телефона / изменение окна / рамка стала видимой — пересчитать размер схемы
    let wrapW = 0;
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        const bw = $('mapWrap').offsetWidth;
        if (bw === wrapW) return;
        wrapW = bw;                       // скрыта → 0: при показе пересчитаем, даже если ширина та же
        if (!bw || !S.view) return;
        const first = chooseDefaultZoom();
        applyZoom(zoom, !first);
        if (first) centerMap();
      }).observe($('mapWrap'));
    }

    $('photoBtn').addEventListener('click', () => startPhoto('filePhotoCam'));
    $('photoGalleryBtn').addEventListener('click', () => startPhoto('filePhotoGal'));
    ['filePhotoCam', 'filePhotoGal'].forEach(id => $(id).addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (f) onPhotoFile(f); else { S.cam = 0; save(); }
    }));
    $('selCancelBtn').addEventListener('click', () => {
      S.sel = null; S.cam = 0; save();
      document.querySelectorAll('#map .mk.sel').forEach(b => b.classList.remove('sel'));
      closeSheet();
    });
    $('sendStatus').addEventListener('click', e => { if (e.target.id === 'retryBtn') send(); });
    $('carRecords').addEventListener('click', e => {
      const b = e.target.closest('[data-del]');
      if (b) deleteRecord(+b.dataset.del, () => { renderCarRecords(); refreshMarks(); });
    });

    ['fStatus', 'fScheme', 'fFrom', 'fTo'].forEach(id => $(id).addEventListener('change', loadLog));
    let qTimer = 0;
    $('fQ').addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(loadLog, 350); });
    $('logBody').addEventListener('click', e => {
      if (e.target.id === 'logRetry') { loadLog(); return; }
      const tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      const rec = logRows.find(r => r.id === +tr.dataset.id);
      if (rec) openReview(rec);
    });
    $('revClose').addEventListener('click', closeReview);
    $('revDlg').addEventListener('cancel', e => { e.preventDefault(); closeReview(); });
    window.addEventListener('popstate', () => { if ($('revDlg').open) $('revDlg').close(); });
    $('revSave').addEventListener('click', saveReview);
    $('revDelete').addEventListener('click', async () => {
      if (revRec && await deleteRecord(revRec.id)) { closeReview(); renderLog(); }
    });
    $('imgUpload').addEventListener('click', uploadImages);
    window.addEventListener('hashchange', () => {
      if (location.hash === '#log' || location.hash === '#rec') showTab(location.hash.slice(1));
    });
  }

  async function init() {
    wire();
    try {
      await loadCatalog();
    } catch {
      $('loadAlert').innerHTML = '<div class="alert alert-danger">Не удалось загрузить схемы. <button class="btn btn-ghost btn-sm" type="button" onclick="location.reload()">↻ Повторить</button></div>';
      return;
    }
    $('fScheme').innerHTML = '<option value="">Все модели</option>' +
      C.schemes.map(s => `<option value="${esc(s.code)}">${esc(s.title)}</option>`).join('');
    renderImgList();

    const prev = restore();
    if (prev && prev.vinKey) {
      S = prev;
      if (S.scheme && !schemeByCode[S.scheme]) S.scheme = '';
      if (S.sel && !studByNo[S.sel]) S.sel = null;
      renderCar();
      loadCarRecords();
      if (S.sel && S.cam) {
        openSheet('Страница перезапустилась во время съёмки — телефону не хватило памяти. Снимите ещё раз или сфотографируйте камерой телефона и выберите фото из галереи.');
        S.cam = 0;
        save();
      }
    } else {
      renderCar();
    }

    let tab = location.hash === '#log' ? 'log' : location.hash === '#rec' ? 'rec' : null;
    if (!tab) { try { tab = localStorage.getItem(TAB_STORE); } catch { tab = null; } }
    if (!tab) tab = C.can_review ? 'log' : 'rec';
    showTab(tab);
    if (tab !== 'log') updateNewCount();
  }

  // для проверок в браузере/тестах: чтение VIN из текста QR
  window.StudsQR = { vinFromText, readQr };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
