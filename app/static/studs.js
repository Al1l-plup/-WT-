/* Вкладка «Шпильки».
 *
 * Запись (оператор сборки): фото верхнего QR контрольной карты → текст QR читается прямо в
 * телефоне (jsQR, фото QR никуда не отправляется) → сервер разбирает VIN и модель
 * (app.studs.parse_card_qr) → схема модели открывается сама → тап по шпильке → фото
 * шпильки → запись на сервере. Шаг (VIN, выбранная шпилька) хранится в localStorage:
 * если Android выгрузит Chrome во время съёмки, оператор продолжит с того же места.
 *
 * Журнал: ИТО/УЗК разбирают записи по фото — категория, источник, комментарий.
 *
 * 3D-схема шпилек (фрейм /studs/map/app/?ctx=record, app/static/stud-map/) — на той же вкладке,
 * только шпильки с номерами, без дефектов (карта дефектов — «Аналитика» → «Шпильки»): без машины —
 * любая модель; после QR — 3D модели этой машины. Шпильку выбирают в 3D или на А-листе (картинки
 * схем раздела): нажатие в 3D приходит сюда (window.__smRecordStud во фрейме) и открывает ту же
 * запись с фото. Номер на карте — номер цеха.
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
  const NUMS_STORE = 'studs-map-nums';     // список шпилек под картой: '1' — раскрыт (по умолчанию свёрнут)
  const ZOOMS = [1, 1.6, 2.5, 4];
  const VIN_AT_START = /^[A-HJ-NPR-Z0-9]{17}/; // нижний QR = VIN; верхний начинается с VIN
  const AUTO_MODEL = false;                    // модель по началу VIN — выключено (модель — по верхнему QR)

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

  // qr — сырой текст QR карты (уходит с записью), token — модель из него (пусто: нижний QR или VIN руками),
  // noScheme — модель знакома, но схемы шпилек для неё нет
  function blank() { return { vin: '', vinKey: '', qr: '', token: '', noScheme: false, scheme: '', view: '', sel: null, cam: 0, t: 0, recView: '3d' }; }
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
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* старый браузер — через <img> */ }
    }
    return loadImg(file);
  }

  // <img> поворачивает снимок по EXIF во всех браузерах одинаково (naturalWidth — уже повёрнутый)
  async function loadImg(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
  }
  const imgW = img => img.naturalWidth || img.width;
  const imgH = img => img.naturalHeight || img.height;

  function vinFromText(text) {
    const m = VIN_AT_START.exec(String(text || '').trim().toUpperCase());
    return m ? m[0] : null;
  }

  // Нужен ВЕРХНИЙ QR (VIN + модель, поля через «|»): нижний (только VIN) берём, лишь если
  // верхнего на снимке не нашлось. found — все прочитанные коды; → {vin, text, card} или null.
  function pickCard(found) {
    const top = found.find(t => vinFromText(t) && t.includes('|'));
    if (top) return { vin: vinFromText(top), text: top, card: true };
    const vinOnly = found.find(t => vinFromText(t));
    return vinOnly ? { vin: vinFromText(vinOnly), text: vinOnly, card: false } : null;
  }

  // Встроенный распознаватель браузера (BarcodeDetector: Chrome на Android) — надёжнее jsQR на
  // бликах, наклоне и снимке с экрана. Нет его (iPhone, компьютер) — false.
  async function detectNative(img, found) {
    if (!('BarcodeDetector' in window)) return false;
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (!formats.includes('qr_code')) return false;
      const codes = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(img);
      codes.forEach(c => { if (c.rawValue) found.push(c.rawValue); });
      return true;
    } catch { return false; }
  }

  // Уменьшение снимка: smooth — ступенями по 2 раза со сглаживанием (одним шагом 12 Мп → 1200 px
  // Safari берёт отдельные пиксели, мелкий шум и муар экрана сливаются в мусор); без smooth — одним
  // шагом, как браузер умеет (на чётком снимке так QR находится быстрее).
  function drawScaled(ctx, img, sx, sy, sw, sh, tw, th, smooth) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = smooth ? 'high' : 'low';
    let src = img;
    while (smooth && sw / tw > 2 && sh / th > 2) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(sw / 2));
      c.height = Math.max(1, Math.round(sh / 2));
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = 'high';
      x.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
      src = c; sx = 0; sy = 0; sw = c.width; sh = c.height;
    }
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, tw, th);
  }

  // Лёгкое размытие кадра (3×3, в сером): jsQR сбивается на «зерне» — шуме камеры 12 Мп и муаре
  // экрана; после размытия на 1 пиксель тот же кадр читается. Своё, без ctx.filter (его нет в старом Safari).
  function softened(d) {
    const w = d.width, h = d.height, s = d.data, n = w * h;
    const g = new Float32Array(n), t = new Float32Array(n), out = new Uint8ClampedArray(n * 4);
    for (let i = 0, p = 0; p < n; i += 4, p++) g[p] = 0.299 * s[i] + 0.587 * s[i + 1] + 0.114 * s[i + 2];
    for (let y = 0; y < h; y++) {
      const r = y * w;
      for (let x = 0; x < w; x++) t[r + x] = (g[r + (x ? x - 1 : 0)] + g[r + x] + g[r + (x < w - 1 ? x + 1 : x)]) / 3;
    }
    for (let y = 0; y < h; y++) {
      const up = (y ? y - 1 : 0) * w, r = y * w, dn = (y < h - 1 ? y + 1 : y) * w;
      for (let x = 0; x < w; x++) {
        const v = (t[up + x] + t[r + x] + t[dn + x]) / 3, i = (r + x) * 4;
        out[i] = out[i + 1] = out[i + 2] = v;
        out[i + 3] = 255;
      }
    }
    return out;
  }

  // Для подсказки, если не прочитано: что «увидел» телефон — миниатюра кадра, яркость и контраст.
  function frameStats(cv, d, info) {
    let n = 0, sum = 0, sq = 0;
    for (let i = 0; i < d.data.length; i += 64) {
      const v = 0.3 * d.data[i] + 0.59 * d.data[i + 1] + 0.11 * d.data[i + 2];
      n++; sum += v; sq += v * v;
    }
    const mean = sum / n;
    info.light = Math.round(mean);
    info.contrast = Math.round(Math.sqrt(Math.max(0, sq / n - mean * mean)));
    try {
      const t = document.createElement('canvas'), k = 240 / Math.max(cv.width, cv.height);
      t.width = Math.round(cv.width * k); t.height = Math.round(cv.height * k);
      t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height);
      info.preview = t.toDataURL('image/jpeg', 0.7);
    } catch { /* без миниатюры */ }
  }

  // jsQR: кадр целиком в нескольких масштабах, затем середина и части (на снимке всей карты два QR и
  // много мелочи — по частям код находится надёжнее). Между попытками отдаём поток (прогресс).
  async function scanJsQR(img, found, info, onStep, invert) {
    const W = imgW(img), H = imgH(img);
    // [x, y, ширина, высота участка, до скольких px уменьшить, со сглаживанием]
    const plan = [[0, 0, W, H, 1200, false], [0, 0, W, H, 1200, true], [0, 0, W, H, 800, true],
      [0, 0, W, H, 2000, false], [0, 0, W, H, 1600, true]];
    for (const [f, smooth] of [[0.75, true], [0.55, false]]) {           // середина кадра — туда обычно целятся
      plan.push([(1 - f) / 2 * W, (1 - f) / 2 * H, f * W, f * H, 1400, smooth]);
    }
    const SOFTEN_FIRST = plan.length;   // кадр целиком и середина — ещё и с лёгким размытием
    for (const [f, steps] of [[0.6, [0, 0.4]], [0.4, [0, 0.3, 0.6]]]) {
      for (const fy of steps) for (const fx of steps) plan.push([fx * W, fy * H, f * W, f * H, 1400, false]);
    }
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    for (let i = 0; i < plan.length; i++) {
      info.tries++;
      if (onStep) onStep(info.tries);
      await new Promise(r => setTimeout(r, 0));
      const [sx, sy, sw, sh, max, smooth] = plan[i];
      const k = Math.min(1, max / Math.max(sw, sh));
      cv.width = Math.max(1, Math.round(sw * k));
      cv.height = Math.max(1, Math.round(sh * k));
      drawScaled(ctx, img, sx, sy, sw, sh, cv.width, cv.height, smooth);
      const d = ctx.getImageData(0, 0, cv.width, cv.height);
      if (i === 0 && !info.preview) frameStats(cv, d, info);
      const opts = { inversionAttempts: invert ? 'attemptBoth' : 'dontInvert' };
      let r = window.jsQR(d.data, cv.width, cv.height, opts);
      if (!(r && r.data) && i < SOFTEN_FIRST) r = window.jsQR(softened(d), cv.width, cv.height, opts);
      if (r && r.data) {
        found.push(r.data);
        const c = pickCard(found);
        if (c && c.card) return;               // верхний QR найден — дальше не ищем
      }
    }
  }

  // Чтение QR контрольной карты: встроенный распознаватель → jsQR по снимку → ещё раз jsQR по
  // снимку, загруженному через <img>, со светлым кодом на тёмном тоже (Safari на iPhone поворачивает
  // снимок по EXIF не везде одинаково). info (размер снимка, попытки, способ) — для подсказки,
  // если не прочитано. → {vin, text, card, info}
  async function readQr(file, onStep) {
    const found = [], info = { size: '', tries: 0, how: 'jsQR' };
    const done = () => { const c = pickCard(found); return c && c.card; };
    let img = await loadImage(file);
    try {
      info.size = imgW(img) + '×' + imgH(img);
      if (await detectNative(img, found)) info.how = 'BarcodeDetector + jsQR';
      if (!done()) await scanJsQR(img, found, info, onStep, false);
    } finally { if (img.close) img.close(); }
    if (!done()) {
      try {
        img = await loadImg(file);
        await scanJsQR(img, found, info, onStep, true);
      } catch { /* <img> не открыл снимок — остаётся то, что нашлось */ }
    }
    const c = pickCard(found);
    return c ? { ...c, info } : { vin: null, text: found[found.length - 1] || null, info };
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

  // ── 3D-карта шпилек (фрейм) ────────────────────────────────────────────────

  let mapSt = null;              // /api/stud-map/status: есть ли схемы 3D, схема → модель карты
  let mapFrame = null;
  let mapSent;                   // что последним передано карте: модель машины или null (машины нет)

  async function loadMapStatus() {
    try {
      const r = await fetch('/api/stud-map/status');
      mapSt = r.ok ? await r.json() : null;
    } catch { mapSt = null; }
  }
  const mapModelOf = code => (mapSt && mapSt.scheme_model && mapSt.scheme_model[code]) || '';
  const has3d = () => !!(mapFrame && S.scheme && mapModelOf(S.scheme));
  function mapWin() { try { return mapFrame && mapFrame.contentWindow; } catch { return null; } }

  function initMap() {
    if (!mapSt || !mapSt.has_schemes) return;
    mapFrame = document.createElement('iframe');
    mapFrame.className = 'sm-frame';
    mapFrame.title = 'Карта шпилек';
    mapFrame.allow = 'fullscreen';          // кнопка «во весь экран» в карте
    mapFrame.allowFullscreen = true;
    mapFrame.addEventListener('load', () => {
      mapSent = undefined;
      const w = mapWin();
      if (w) w.__smRecordStud = ({ no }) => onMapPick(no);   // без машины — из карточки «Записать дефект»
      if (w && w.SM && w.SM.onChange) w.SM.onChange(renderNums);
      syncMap();
      if (mapFsWanted) showMap();
    });
    mapFrame.src = '/studs/map/app/?ctx=record';
    $('smBox').replaceChildren(mapFrame);
  }

  // Карта во весь экран (на iPhone — растянутое окно карты) закрывает карточку записи с фото — выйти.
  function exitMapFullscreen() {
    const w = mapWin();
    if (!w) return;
    const d = w.document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else if (d.querySelector('#stage.fs, #lay.fs')) (d.getElementById('fsBtn') || {}).click?.();
    } catch { /* карта ещё грузится */ }
  }

  // Машина выбрана (QR или модель выбрана руками) — на телефоне её 3D сразу во весь экран: осмотреть,
  // нажать шпильку → карта сама выйдет из «во весь экран» и откроет запись с фото (onMapPick).
  // Под ней страница уже прокручена к карте — после выхода оператор там же.
  let mapFsWanted = false;                  // карта ещё грузится — развернуть, как загрузится
  function showMap() {
    if (!has3d() || window.innerWidth >= 700) return;
    $('mapCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const w = mapWin();
    if (w && w.SM && w.SM.fullscreen) { mapFsWanted = false; w.SM.fullscreen(); } else mapFsWanted = true;
  }

  // Нажали шпильку в 3D: номер на карте — номер цеха (label) в схеме этой машины
  function onMapPick(no) {
    exitMapFullscreen();
    if (!S.vinKey || !schemeByCode[S.scheme]) {     // машины ещё нет — сначала QR
      say($('qrStatus'), 'info', `Шпилька №${esc(no)}: сначала сфотографируйте <b>верхний QR</b> машины — откроется её 3D, там и запишите.`);
      $('carCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const s = C.studs.find(x => x.scheme_code === S.scheme && String(x.label) === String(no));
    if (!s) { toast(`Шпильки №${no} нет в схеме ${S.scheme} на сайте — сообщите WeldTeam`, true); return; }
    S.view = s.view_key;                    // на А-листе откроется её вид
    selectStud(s.stud_no);
  }

  // Без машины — карта дефектов; машина с моделью — 3D этой модели для записи (или А-лист).
  // «3D / Схемы» и список номеров — у самой карты (внутри фрейма и под ним); А-лист раздела
  // (картинки схем из базы) — только если 3D-карты этой модели нет.
  function syncMap() {
    const sc = S.vinKey && schemeByCode[S.scheme];
    const three = !!sc && has3d();
    const card = $('mapCard');
    if (sc) card.hidden = !has3d();
    else card.hidden = !!S.vinKey || !mapSt;          // машина без модели — сначала выбрать модель
    $('mapTitle').textContent = sc ? '3D · ' + sc.title : '3D-схема шпилек';
    $('viewMode').hidden = true;
    // подсказка — только с машиной (без машины карта говорит сама за себя)
    $('mapHint').textContent = 'Нажмите на шпильку, которой нет на машине (в 3D, на «Схемах» или номер в списке ниже). Повернуть — пальцем, приблизить — двумя пальцами.';
    $('mapHint').hidden = !three;
    $('smBox').hidden = !!sc && !three;
    renderNums();
    const note = !mapFrame && mapSt && !mapSt.has_schemes
      ? 'Схемы 3D-карты не установлены на сервере (папка data\stud_map) — см. docs/STUD_MAP.md.' : '';
    $('mapNote').textContent = note;
    $('mapNote').hidden = !note;
    if (!mapFrame) return;
    const want = sc ? mapModelOf(S.scheme) : null;
    const w = mapWin();
    if (want !== mapSent && w && w.SM) {
      mapSent = want;
      w.SM.setRecord(want);
    }
    markMapDone();
  }

  // Записанные по этой машине шпильки — в 3D зелёные номерки с ✓ (как ✓ на А-листе).
  // Номер на карте — номер цеха (label).
  function markMapDone() {
    const w = mapWin();
    if (!w || !w.SM || !w.SM.setDone) return;
    w.SM.setDone(S.vinKey ? carRecords.map(r => r.stud_label) : []);
    renderNums();
  }

  // Под картой — номера шпилек того, что на ней сейчас: лист «Схем» или вся модель в 3D (кнопки
  // листов — переключают «Схемы»). Нажатие на номер — как нажатие на шпильку на карте.
  // Записанные по машине — зелёные с ✓, выбранная — выделена.
  // Станции: короткое имя — как на кнопках карты (FF, RF…); станция шпильки — из каталога
  // (своя, из реестра цеха или по месту на 3D — app/stud_map_data.py: guess_station).
  const ST_SHORT = { 'FRONT FLOOR': 'FF', 'REAR FLOOR': 'RF', 'WHEEL HOUSE': 'WH', 'FR WHEEL HOUSE': 'FWH', 'ENGINE COMP': 'EC', 'BODY SIDE': 'BS' };
  let mapStation = null, mapStationModel = null;   // выбранная станция в списке номеров (null — все)
  let mapStationOnMap = null;                       // станция, нажатая над картой (FF, RF…) — последняя увиденная

  function stationsOf(model) {                       // {номер на карте: станция} для модели карты
    const scheme = Object.keys((mapSt && mapSt.scheme_model) || {}).find(k => mapSt.scheme_model[k] === model);
    const out = {};
    (C ? C.studs : []).forEach(s => { if (s.scheme_code === scheme && s.station) out[String(s.label)] = s.station; });
    return out;
  }

  function renderNums() {
    const w = mapWin(), box = $('mapNums');
    const info = w && w.SM && w.SM.info ? w.SM.info() : null;
    if (!info || $('mapCard').hidden || $('smBox').hidden) { box.hidden = true; return; }
    box.hidden = false;
    const all = info.views.reduce((n, v) => n + v.count, 0);
    $('mapViews').innerHTML = `<button type="button" data-v3d aria-pressed="${info.mode === '3d'}">3D · вся модель<span class="cnt">${all}</span></button>` +
      info.views.map(v => `<button type="button" data-sheet="${esc(v.name)}" aria-pressed="${info.view === v.name}">${esc(v.name)}<span class="cnt">${v.count}</span></button>`).join('');
    // фильтр по станции: на «Записать» — номера только этой станции (в 3D камера едет к ней)
    if (mapStationModel !== info.model) { mapStation = null; mapStationModel = info.model; }
    if (info.station !== mapStationOnMap) { mapStationOnMap = info.station; if (info.station) mapStation = info.station; }
    const st = stationsOf(info.model), counts = {};
    info.nums.forEach(n => { const k = st[String(n)]; if (k) counts[k] = (counts[k] || 0) + 1; });
    if (mapStation && !counts[mapStation]) mapStation = null;
    $('mapStations').innerHTML = `<button type="button" data-st="" aria-pressed="${!mapStation}">Все станции<span class="cnt">${info.nums.length}</span></button>` +
      Object.keys(ST_SHORT).filter(k => counts[k]).map(k =>
        `<button type="button" data-st="${esc(k)}" title="${esc(k)}" aria-pressed="${mapStation === k}">${ST_SHORT[k]}<span class="cnt">${counts[k]}</span></button>`).join('');
    const nums = mapStation ? info.nums.filter(n => st[String(n)] === mapStation) : info.nums;
    $('mapNumTitle').textContent = '· ' + (info.view ? info.view : 'вся модель') + (mapStation ? ' · ' + mapStation : '') + ' · ' + nums.length;
    const done = new Set(S.vinKey ? carRecords.map(r => String(r.stud_label)) : []);
    const sel = S.sel && studByNo[S.sel] ? String(studByNo[S.sel].label) : null;
    $('mapNumGrid').innerHTML = nums.map(n => {
      const k = String(n);
      return `<button type="button" data-no="${n}" class="${done.has(k) ? 'done' : ''}" aria-pressed="${k === sel}">${n}${done.has(k) ? ' ✓' : ''}</button>`;
    }).join('');
  }

  // Список под картой (листы, станции, номера) — свёрнут под кнопкой «Список шпилек»; раскрыт или нет — запоминается
  function setNumsOpen(open, remember) {
    $('mapNumsBody').hidden = !open;
    $('mapNumsBtn').setAttribute('aria-expanded', String(open));
    if (remember) { try { localStorage.setItem(NUMS_STORE, open ? '1' : '0'); } catch { /* ок */ } }
  }

  // ── запись: машина ─────────────────────────────────────────────────────────

  // Машина: { qr } — весь текст QR карты (VIN и модель разбирает сервер) или { vin } — VIN руками.
  async function takeCar({ qr, vin }) {
    const q = qr != null ? 'qr=' + encodeURIComponent(qr) : 'vin=' + encodeURIComponent(vin);
    const res = await fetch('/api/studs/vin?' + q).then(readJson);
    if (res.status !== 'success') throw new Error(res.message || 'VIN не принят');
    forget();
    S.vin = res.vin || vin;          // сырой VIN: как в QR / как введён
    S.vinKey = res.vin_key;
    S.qr = qr || '';
    S.token = res.model_token || '';
    S.noScheme = !!res.no_scheme;
    // Модель — по верхнему QR (модель знакома → scheme_source 'qr'). По началу VIN — только
    // подсказка сервера, автоопределение по ней выключено (AUTO_MODEL).
    const auto = res.scheme_source === 'qr' || (AUTO_MODEL && res.scheme_source === 'vin');
    S.scheme = auto && schemeByCode[res.scheme_code] ? res.scheme_code : '';
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
      const r = await readQr(file, i => say(st, 'info', `Читаю QR… ${i}`));
      if (!r.vin) {
        const i = r.info || {};
        say(st, 'warn', 'QR не прочитан. Снимите ближе — чтобы <b>верхний QR</b> занимал почти весь кадр, без бликов. Или введите VIN вручную.' +
          (r.text ? `<br><span class="text-sm">Прочитан другой код: ${esc(r.text.slice(0, 60))}</span>` : '') +
          // для разбора, почему не читается: размер снимка, сколько участков проверено, чем, что «увидел» телефон
          `<br><span class="text-sm text-muted">снимок ${esc(i.size)} · проверено участков: ${i.tries} · ${esc(i.how)}` +
          (i.light != null ? ` · яркость ${i.light} · контраст ${i.contrast}` : '') + '</span>' +
          (i.preview ? `<br><img src="${i.preview}" alt="Что увидел телефон" style="max-width:160px;max-height:200px;margin-top:6px;border-radius:6px;border:1px solid var(--border)">` : ''));
        return;
      }
      say(st, '', '');
      await takeCar({ qr: r.text });
      const sc = schemeByCode[S.scheme];
      toast('VIN ' + S.vinKey + (sc ? ' · ' + sc.title : ''));
      showMap();
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
      syncMap();
      return;
    }
    $('vinText').textContent = S.vinKey;   // на экране — стандартный вид; на сервер уходит как введено
    const sc = schemeByCode[S.scheme];
    $('schemeText').innerHTML = sc ? `${esc(sc.title)} <small>· ${esc(sc.code)}</small>` : '';
    $('schemePick').hidden = !!sc;
    $('changeModelBtn').hidden = !sc;
    if (!sc) $('schemePickNote').innerHTML = pickNote();
    $('schemeBtns').innerHTML = C.schemes.map(s =>
      `<button class="btn btn-ghost" type="button" data-scheme="${esc(s.code)}">${esc(s.title)}<br><small class="text-muted">${esc(s.code)}</small></button>`).join('');
    // А-лист (картинки схем раздела) — по выбору или если 3D этой модели нет
    const sheet = !!sc && !has3d();
    $('schemeCard').hidden = !sheet;
    if (sheet) { renderViews(); renderMap(true); }
    renderCarRecords();
    if (S.sel && sc) openSheet(); else closeSheet();
    syncMap();
  }

  // почему модель не определилась сама — и что сделать в следующий раз
  function pickNote() {
    if (S.noScheme) {
      return `Для модели <b>${esc(S.token)}</b> схемы шпилек на сайте нет. Сообщите WeldTeam. Если схема другой модели точно подходит — выберите её:`;
    }
    if (S.qr && S.token) {
      return `Модель <b>${esc(S.token)}</b> из QR ещё не знакома — выберите её один раз, дальше схема откроется сама:`;
    }
    if (S.qr) {
      return 'Это <b>нижний</b> QR — в нём только VIN. В следующий раз снимайте <b>верхний</b> QR (справа, «Multifilling + OTTC») — модель определится сама. Сейчас выберите модель:';
    }
    return 'Выберите модель машины:';
  }

  function pickScheme(code) {
    if (!schemeByCode[code]) return;
    S.scheme = code;
    S.view = (viewsOf(code)[0] || {}).view_key || '';
    S.sel = null;
    save();
    renderCar();
    showMap();
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
    markMapDone();
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
    renderNums();
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
      if (S.qr) fd.append('card_qr', S.qr);   // сырой текст QR: сервер сверит VIN и запомнит новую модель
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

  // ── модели из QR (WeldTeam): модель верхнего QR → схема ────────────────────

  function renderTokenList() {
    $('tokenCard').hidden = !C.can_manage;
    if (!C.can_manage) return;
    const rows = C.model_tokens || [];
    $('tokenList').innerHTML = rows.length ? rows.map(t => {
      const sc = schemeByCode[t.scheme_code];
      const who = t.who ? `запомнил ${esc(t.who)}` : 'задано заранее';
      const target = t.scheme_code ? esc(sc ? sc.title : t.scheme_code) : '<i>схемы шпилек нет</i>';
      return `<li><span><code>${esc(t.token)}</code> → ${target} <span class="text-muted text-sm">· ${who}, ${esc(fmtTime(t.created_at))}</span></span>
        <button class="btn btn-ghost btn-sm" type="button" data-forget="${esc(t.token)}">забыть</button></li>`;
    }).join('') : '<li class="text-muted">Пока ни одной</li>';
  }

  async function forgetToken(token) {
    if (!confirm(`Забыть модель ${token}? При следующем скане её выберут заново. Записи журнала не изменятся.`)) return;
    try {
      const res = await fetch('/api/studs/model-tokens/' + encodeURIComponent(token), { method: 'DELETE' }).then(readJson);
      say($('tokenStatus'), res.status === 'success' ? 'success' : 'danger', esc(res.message || 'Ошибка'));
      if (res.status === 'success') { await loadCatalog(); renderTokenList(); }
    } catch {
      say($('tokenStatus'), 'danger', 'Нет связи с сервером — не изменено');
    }
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
      try { await takeCar({ vin: raw }); $('vinForm').hidden = true; $('vinInput').value = ''; say($('qrStatus'), '', ''); } catch (err) { say($('qrStatus'), 'warn', esc(err.message)); }
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
    setNumsOpen((() => { try { return localStorage.getItem(NUMS_STORE) === '1'; } catch { return false; } })(), false);
    $('mapNumsBtn').addEventListener('click', () => setNumsOpen($('mapNumsBody').hidden, true));
    $('mapViews').addEventListener('click', e => {
      const w = mapWin(), b = e.target.closest('button');
      if (!b || !w || !w.SM) return;
      if (b.hasAttribute('data-v3d')) w.SM.show3d(); else w.SM.showView(b.dataset.sheet);
    });
    $('mapStations').addEventListener('click', e => {
      const b = e.target.closest('button[data-st]');
      if (!b) return;
      mapStation = b.dataset.st || null;
      const w = mapWin(), info = w && w.SM && w.SM.info ? w.SM.info() : null;
      if (mapStation && info && info.mode === '3d' && w.SM.station) w.SM.station(mapStation);   // камера к станции
      renderNums();
    });
    $('mapNumGrid').addEventListener('click', e => {
      const w = mapWin(), b = e.target.closest('button[data-no]');
      if (b && w && w.SM && w.SM.pick) w.SM.pick(+b.dataset.no);
    });
    $('viewMode').addEventListener('click', e => {
      const b = e.target.closest('button[data-v]');
      if (!b || b.dataset.v === S.recView) return;
      S.recView = b.dataset.v;
      save();
      renderCar();
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
      renderNums();
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
    $('tokenList').addEventListener('click', e => {
      const b = e.target.closest('[data-forget]');
      if (b) forgetToken(b.dataset.forget);
    });
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
    // фильтры журнала переживают переход в другой раздел сайта (static/page-state.js);
    // модель — после того, как список моделей заполнен
    if (window.PageState) {
      const LOG_FILTERS = ['fStatus', 'fScheme', 'fQ', 'fFrom', 'fTo'];
      PageState.restoreFields('studs-log', LOG_FILTERS);
      PageState.trackFields('studs-log', LOG_FILTERS);
    }
    renderImgList();
    renderTokenList();
    await loadMapStatus();
    initMap();

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
