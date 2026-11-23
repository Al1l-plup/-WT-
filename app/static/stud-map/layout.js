/* Шпильки → «Визуализация» → режим «Запись»: все шпильки с номерами, без дефектов и аналитики.
 *
 * Для оператора: какая шпилька где и под каким номером; каждая шпилька нажимается (дальше —
 * запись дефекта по ней, куда именно — решается; точка подключения — window.__smRecordStud).
 *
 * Два вида «Записи»:
 *  • 3D — та же сцена, что у карты дефектов (app.*.js), без второго 3D: флажок window.__smRec
 *    переключает её на «все шпильки с номерами»; класс html.sm-rec прячет аналитику и всё,
 *    что про дефекты. Нажатие на шпильку → window.__smPick(no) → карточка поверх 3D.
 *  • А-лист — чертежи цеха (img/<вид>-1200|2048.webp) с напечатанными номерами: вкладки видов,
 *    масштаб, поиск по номеру, нажатие на номер → карточка. Данные — views.json.
 *
 * Кнопка справа от модели: «Запись» ↔ «Дефекты»; переключатель [3D | А-лист]. Выбор
 * запоминается (localStorage 'stud-map.mode', 'stud-map.recView'). Модель общая.
 * Без сборки и библиотек: обычный JS, подключён в index.html после app.*.js.
 *
 * Где открыта (?ctx в адресе фрейма): record — «Шпильки» → «Записать»: только «Запись» (где какие
 * шпильки), без дефектов, вместо А-листа — «Схемы» (чертёж цеха на 3D, тот же режим карты);
 * analytics — «Аналитика» → «Шпильки»: только карта дефектов; без ctx — всё.
 *
 * Во фрейме страницы «Шпильки» (/studs) — два состояния, их задаёт страница через window.SM:
 *   SM.setRecord(null)   — машины нет: «Запись» любой модели (где какие шпильки, 3D / А-лист карты);
 *                          нажатие на шпильку — своя карточка, её «Записать дефект» уходит странице;
 *   SM.setRecord('A13T') — машина по QR (html.sm-car): 3D «Записи» этой модели, модель и режим не
 *                          переключаются, нажатие на шпильку сразу уходит странице.
 * Страница ставит window.__smRecordStud({model, no, part}); SM.setDone([290, 291]) — записанные
 * по машине шпильки: в «Записи» их номерки зелёные с ✓ (window.__smDone в сборке).
 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const SVG = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs) => {
    const e = document.createElementNS(SVG, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* нет доступа */ } },
  };
  const ZMIN = 1, ZMAX = 6;
  const HIT_W = 0.03, HIT_H = 0.026;          // «кнопка» на подписи, доля ширины/высоты чертежа
  const DOTS = '<span class="ic3" aria-hidden="true"><i style="background:var(--c-stick)"></i>'
    + '<i style="background:var(--c-missing)"></i><i style="background:var(--c-broken)"></i></span>';

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('.app'), lay = $('lay'), recBtn = $('recBtn');
    if (!app || !lay || !recBtn) return;
    const root = document.documentElement;
    const canvas = $('layCanvas'), wrap = $('layWrap'), img = $('layImg'), svg = $('laySvg');
    const S = { data: null, model: null, view: null, zoom: 1, sel: null, hiRes: false, mode: 'defects', recView: '3d' };
    // во фрейме страницы «Шпильки»: машина по QR (carMode) — модель и режим задаёт страница (window.SM)
    const embedded = (() => { try { return window.parent !== window && !!window.frameElement; } catch (e) { return false; } })();
    root.classList.toggle('sm-embed', embedded);
    const ctx = new URLSearchParams(location.search).get('ctx');
    root.classList.toggle('sm-record', ctx === 'record');
    root.classList.toggle('sm-analytics', ctx === 'analytics');
    let carMode = false;

    // ── данные ────────────────────────────────────────────────────────────────
    const load = async () => {
      if (S.data) return S.data;
      const r = await fetch('views.json', { credentials: 'same-origin' });
      if (!r.ok) throw new Error('views.json: ' + r.status);
      S.data = await r.json();
      return S.data;
    };
    const modelsOf = () => S.data.models.filter((m) => S.data.views.some((v) => v.model === m.id));
    const viewsOf = (m) => S.data.views.filter((v) => v.model === m);
    const studCount = (m) => new Set(viewsOf(m).flatMap((v) => v.studs.map((s) => s.no))).size;
    const label = (m) => { const x = S.data && S.data.models.find((q) => q.id === m); return x ? x.brand + ' ' + x.id : m; };
    // модель карты (3D) — по выбранной кнопке скрытого блока #models («Chery A13T»)
    const mapModel = () => {
      if (!S.data) return null;
      const c = document.querySelector('#models .chip[aria-pressed="true"] span');
      const t = c ? c.textContent.trim() : ($('vtitle') ? $('vtitle').textContent.trim() : '');
      const m = S.data.models.find((q) => q.brand + ' ' + q.id === t);
      return m ? m.id : null;
    };
    const syncMapModel = () => {
      const want = label(S.model);
      const chip = [...document.querySelectorAll('#models .chip')].find((c) => {
        const s = c.querySelector('span');
        return s && s.textContent.trim() === want;
      });
      if (chip && chip.getAttribute('aria-pressed') !== 'true') chip.click();
    };

    // ── карточка шпильки (3D и А-лист): номер, тип, картинка, листы, «Записать дефект» ──
    const studCard = (model, no, opt) => {
      opt = opt || {};
      const views = viewsOf(model).filter((v) => v.studs.some((q) => q.no === no));
      const st = views.length ? views[0].studs.find((q) => q.no === no) : null;
      const pn = (opt.part || (st && st.part)) || '';
      const part = (S.data.parts && S.data.parts[pn]) || { pn, name: '' };
      const card = el('div', 'card'), head = el('div', 'head');
      const ph = el('img', 'photo'); ph.alt = part.pn; ph.src = 'parts/' + part.pn + '.png';
      ph.onerror = () => { ph.remove(); };
      const t = el('div');
      t.append(el('div', 'title', 'Шпилька №' + no), el('div', 'pn', part.pn), el('div', 'muted', part.name || ''));
      head.append(ph, t);
      if (opt.onClose) {
        const x = el('button', 'x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Закрыть');
        x.addEventListener('click', opt.onClose);
        head.appendChild(x);
      }
      card.appendChild(head);
      if (opt.note) card.appendChild(el('p', 'note', opt.note));
      const others = views.filter((v) => v !== opt.exceptView);
      if (others.length) {
        const row = el('div', 'acts');
        row.append(el('span', 'muted', ctx === 'record' ? 'На схеме:' : opt.exceptView ? 'Есть и на А-листе:' : 'На А-листе:'));
        others.forEach((v) => {
          const b = el('button', 'btn', v.name); b.type = 'button';
          // на «Записать» вместо А-листа — «Схемы» на этом листе
          b.addEventListener('click', () => (ctx === 'record' ? window.SM.showView(v.name) : openSheet(model, v, no)));
          row.appendChild(b);
        });
        card.appendChild(row);
      }
      // запись дефекта по шпильке — подключается позже (куда записывать — решается)
      const acts = el('div', 'acts'), rec = el('button', 'btn rec', 'Записать дефект');
      rec.type = 'button';
      const hook = typeof window.__smRecordStud === 'function' ? window.__smRecordStud : null;
      rec.disabled = !hook;
      rec.title = hook ? 'Записать дефект по этой шпильке' : 'Запись дефекта по шпильке — в разработке';
      rec.addEventListener('click', () => { if (hook) hook({ model, no, part: part.pn }); });
      acts.appendChild(rec);
      card.appendChild(acts);
      return card;
    };

    // ── 3D «Записи»: карточка поверх сцены по нажатию на шпильку ──────────────
    const recCard = $('recCard');
    const hideRecCard = () => { recCard.hidden = true; recCard.replaceChildren(); };
    window.__smPick = (no, s) => {
      if (S.mode !== 'rec' || (S.recView !== '3d' && ctx !== 'record')) return;   // на «Записать» — и на «Схемах»
      const hook = typeof window.__smRecordStud === 'function' ? window.__smRecordStud : null;
      if (carMode && hook) { hook({ model: mapModel() || S.model, no, part: s && s.part }); return; }
      if (!S.data) return;
      const m = mapModel() || S.model;
      recCard.replaceChildren(studCard(m, no, { part: s && s.part, onClose: hideRecCard }));
      recCard.hidden = false;
    };
    if ($('vtitle')) new MutationObserver(hideRecCard).observe($('vtitle'), { childList: true, characterData: true, subtree: true });

    // ── А-лист: масштаб и прокрутка ───────────────────────────────────────────
    const baseW = () => {
      if (!S.view) return canvas.clientWidth;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      return Math.max(120, Math.min(cw, ch * S.view.w / S.view.h));   // чертёж целиком
    };
    const pickRes = () => {
      const need = baseW() * S.zoom * (window.devicePixelRatio || 1) > 1300;
      if (need && !S.hiRes && S.view) { S.hiRes = true; img.src = S.view.img + '-2048.webp'; }
    };
    // ax, ay — точка внутри окна чертежа (px), которая не должна сдвинуться
    const setZoom = (z, ax, ay) => {
      z = Math.min(ZMAX, Math.max(ZMIN, z));
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      ax = ax == null ? cw / 2 : ax; ay = ay == null ? ch / 2 : ay;
      const w0 = wrap.offsetWidth || 1, h0 = wrap.offsetHeight || 1;
      const px = (canvas.scrollLeft + ax - wrap.offsetLeft) / w0, py = (canvas.scrollTop + ay - wrap.offsetTop) / h0;
      S.zoom = z;
      wrap.style.width = Math.round(baseW() * z) + 'px';
      canvas.scrollLeft = px * wrap.offsetWidth + wrap.offsetLeft - ax;
      canvas.scrollTop = py * wrap.offsetHeight + wrap.offsetTop - ay;
      $('layZoomV').textContent = Math.round(z * 100) + '%';
      pickRes();
    };
    const centerOn = (nx, ny) => {
      canvas.scrollLeft = nx * wrap.offsetWidth + wrap.offsetLeft - canvas.clientWidth / 2;
      canvas.scrollTop = ny * wrap.offsetHeight + wrap.offsetTop - canvas.clientHeight / 2;
    };

    // ── А-лист: отрисовка ─────────────────────────────────────────────────────
    const renderTabs = () => {
      $('layViews').replaceChildren(...viewsOf(S.model).map((v) => {
        const b = el('button', 'tab');
        b.type = 'button'; b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(v === S.view));
        b.append(el('span', '', v.name), el('span', 'n', String(v.studs.length)));
        b.addEventListener('click', () => { if (v !== S.view) showView(v); });
        return b;
      }));
    };
    const renderSvg = () => {
      const v = S.view;
      svg.setAttribute('viewBox', `0 0 ${v.w} ${v.h}`);
      const hits = sv('g', { class: 'lay-hits' }), hi = sv('g', { class: 'lay-hi' });
      v.studs.forEach((s) => {
        const [lx, ly] = s.label || s.pts[0];
        const r = sv('rect', {
          x: (lx - HIT_W / 2) * v.w, y: (ly - HIT_H / 2) * v.h, width: HIT_W * v.w, height: HIT_H * v.h,
          rx: 0.004 * v.w, class: 'lay-hit', 'data-no': s.no,
        });
        const t = sv('title'); t.textContent = 'Шпилька №' + s.no; r.appendChild(t);
        hits.appendChild(r);
      });
      const s = S.sel != null && v.studs.find((q) => q.no === S.sel);
      if (s) {
        const [lx, ly] = s.label || s.pts[0];
        s.pts.forEach(([px, py]) => {
          if (s.label) hi.appendChild(sv('line', { x1: lx * v.w, y1: ly * v.h, x2: px * v.w, y2: py * v.h, class: 'lay-line' }));
          hi.appendChild(sv('circle', { cx: px * v.w, cy: py * v.h, r: 0.014 * v.w, class: 'lay-ring' }));
          hi.appendChild(sv('circle', { cx: px * v.w, cy: py * v.h, r: 0.014 * v.w, class: 'lay-ring2' }));
        });
        hi.appendChild(sv('rect', {
          x: (lx - HIT_W / 2) * v.w, y: (ly - HIT_H / 2) * v.h, width: HIT_W * v.w, height: HIT_H * v.h,
          rx: 0.004 * v.w, class: 'lay-box',
        }));
      }
      svg.replaceChildren(hits, hi);
    };
    const renderNums = () => {
      const nums = [...new Set(S.view.studs.map((s) => s.no))].sort((a, b) => a - b);
      $('layCount').textContent = '· ' + nums.length;
      $('layNums').replaceChildren(...nums.map((no) => {
        const b = el('button', '', String(no));
        b.type = 'button'; b.setAttribute('aria-pressed', String(no === S.sel));
        b.addEventListener('click', () => select(no, { zoom: 2 }));
        return b;
      }));
    };
    const renderInfo = () => {
      const box = $('layInfo');
      if (S.sel == null) {
        box.replaceChildren(el('p', 'empty', 'Нажмите на номер на чертеже, в списке или найдите по номеру.'));
        return;
      }
      const same = S.view.studs.find((q) => q.no === S.sel);
      const sameType = same ? S.view.studs.filter((q) => q.part === same.part).length : 0;
      box.replaceChildren(studCard(S.model, S.sel, {
        exceptView: S.view, note: `${label(S.model)} · ${S.view.name} · таких шпилек на листе: ${sameType}`,
      }));
    };
    const showView = (v, keepSel) => {
      S.view = v; S.hiRes = false;
      if (!keepSel) S.sel = null;
      img.alt = 'А-лист ' + label(S.model) + ' — ' + v.name;
      img.src = v.img + '-1200.webp';
      wrap.style.aspectRatio = v.w + ' / ' + v.h;
      S.zoom = 1; wrap.style.width = Math.round(baseW()) + 'px';
      canvas.scrollLeft = 0; canvas.scrollTop = 0;
      $('layZoomV').textContent = '100%';
      pickRes(); renderTabs(); renderSvg(); renderNums(); renderInfo();
    };
    const setModel = (m) => {
      S.model = m; S.sel = null;
      $('layModel').textContent = label(m);
      showView(viewsOf(m)[0]);
    };
    // выбрать шпильку на А-листе: перейти на её лист (если на этом её нет), подсветить, приблизить
    const select = (no, opt) => {
      opt = opt || {};
      const v = S.view && S.view.studs.some((q) => q.no === no) ? S.view : viewsOf(S.model).find((x) => x.studs.some((q) => q.no === no));
      if (!v) return false;
      if (v !== S.view) showView(v, true);
      S.sel = no;
      renderSvg(); renderNums(); renderInfo();
      if (opt.zoom && S.zoom < opt.zoom) setZoom(opt.zoom);
      const [px, py] = v.studs.find((q) => q.no === no).pts[0];
      centerOn(px, py);
      return true;
    };

    // ── А-лист: выпадающий список моделей (как у 3D) ─────────────────────────
    const mBtn = $('layModel'), mMenu = el('div', 'mmenu');
    mMenu.id = 'layModelMenu'; mMenu.hidden = true;
    mMenu.setAttribute('role', 'listbox'); mMenu.setAttribute('aria-label', 'Модель');
    $('layBar').appendChild(mMenu);
    const mClose = (focus) => {
      if (mMenu.hidden) return;
      mMenu.hidden = true; mBtn.setAttribute('aria-expanded', 'false');
      if (focus) mBtn.focus();
    };
    const mOpen = () => {
      mMenu.replaceChildren(...modelsOf().map((m) => {
        const on = m.id === S.model, b = el('button');
        b.type = 'button'; b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(on));
        b.append(el('span', '', m.brand + ' ' + m.id), el('span', 'n', studCount(m.id) + ' шп.'));
        b.addEventListener('click', () => { mClose(true); if (!on) { setModel(m.id); syncMapModel(); } });
        return b;
      }));
      const r = mBtn.getBoundingClientRect(), s = $('layBar').getBoundingClientRect();
      mMenu.style.left = Math.round(r.left - s.left) + 'px';
      mMenu.style.top = Math.round(r.bottom - s.top + 6) + 'px';
      mMenu.hidden = false; mBtn.setAttribute('aria-expanded', 'true');
      (mMenu.querySelector('[aria-selected="true"]') || mMenu.firstElementChild).focus();
    };
    mBtn.addEventListener('click', () => (mMenu.hidden ? mOpen() : mClose()));
    mBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); mOpen(); }
    });
    mMenu.addEventListener('keydown', (e) => {
      const items = [...mMenu.children], i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); mClose(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
    document.addEventListener('pointerdown', (e) => {
      if (!mMenu.hidden && !mMenu.contains(e.target) && !mBtn.contains(e.target)) mClose();
    });

    // ── А-лист: поиск по номеру ───────────────────────────────────────────────
    const msg = (t) => { $('layMsg').textContent = t || ''; };
    $('layFind').addEventListener('submit', (e) => {
      e.preventDefault();
      const no = parseInt(($('layQ').value || '').replace(/\D/g, ''), 10);
      if (!no) { msg('Введите номер шпильки.'); return; }
      if (select(no, { zoom: 2.5 })) { msg(''); $('layQ').blur(); return; }
      const elsewhere = modelsOf().find((m) => m.id !== S.model && viewsOf(m.id).some((v) => v.studs.some((q) => q.no === no)));
      if (elsewhere) {
        setModel(elsewhere.id); syncMapModel(); select(no, { zoom: 2.5 });
        msg(`Шпилька №${no} — у модели ${label(elsewhere.id)}: переключил модель.`);
      } else {
        msg(`Шпильки №${no} нет на А-листах ${label(S.model)}.`);
      }
    });

    // ── А-лист: нажатия, масштаб пальцами / колёсиком ─────────────────────────
    svg.addEventListener('click', (e) => {
      const r = e.target.closest && e.target.closest('.lay-hit');
      if (r) select(+r.dataset.no);
    });
    $('layIn').addEventListener('click', () => setZoom(S.zoom * 1.5));
    $('layOut').addEventListener('click', () => setZoom(S.zoom / 1.5));
    $('layZoomV').addEventListener('click', () => setZoom(1));
    canvas.addEventListener('dblclick', (e) => {
      if (e.target.closest && e.target.closest('.lay-hit')) return;
      const r = canvas.getBoundingClientRect();
      setZoom(S.zoom < 2 ? 2.5 : 1, e.clientX - r.left, e.clientY - r.top);
    });
    canvas.addEventListener('wheel', (e) => {            // щипок на тачпаде Mac и Ctrl+колёсико
      if (!e.ctrlKey) return;
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      setZoom(S.zoom * Math.exp(-e.deltaY / 200), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    let pinch = null;                                   // щипок двумя пальцами на телефоне
    const tdist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) pinch = { d: tdist(e.touches), z: S.zoom };
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      setZoom(pinch.z * tdist(e.touches) / pinch.d, mx, my);
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => { if (e.touches.length < 2) pinch = null; });
    window.addEventListener('resize', () => { if (!lay.hidden && S.view) setZoom(S.zoom); });

    // ── А-лист: во весь экран (на iPhone — растягиваем окно карты, см. index.html) ──
    const fsBtn = $('layFs');
    const fsOn = () => !!(document.fullscreenElement || document.webkitFullscreenElement) || lay.classList.contains('fs');
    const fsSync = () => {
      const on = fsOn();
      fsBtn.setAttribute('aria-pressed', String(on));
      fsBtn.title = on ? 'Выйти из полноэкранного режима (Esc)' : 'Во весь экран';
      setTimeout(() => { if (S.view && !lay.hidden) setZoom(S.zoom); }, 60);
    };
    const pseudo = (on) => {
      lay.classList.toggle('fs', on);
      root.style.overflow = on ? 'hidden' : '';
      fsSync();
    };
    const fsExit = () => {
      if (lay.classList.contains('fs')) pseudo(false);
      if (document.fullscreenElement === lay) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    };
    fsBtn.addEventListener('click', () => {
      if (lay.classList.contains('fs')) return pseudo(false);
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
      }
      const req = lay.requestFullscreen || lay.webkitRequestFullscreen;
      if (!req || !(document.fullscreenEnabled || document.webkitFullscreenEnabled)) return pseudo(true);
      try { const p = req.call(lay); if (p && p.catch) p.catch(() => pseudo(true)); } catch (err) { pseudo(true); }
    });
    document.addEventListener('fullscreenchange', fsSync);
    document.addEventListener('webkitfullscreenchange', fsSync);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lay.classList.contains('fs')) pseudo(false); });

    // ── режимы: «Дефекты» | «Запись» → [3D | А-лист] ─────────────────────────
    const redraw3d = () => {
      if (window.__smRedraw) window.__smRedraw();
      window.dispatchEvent(new Event('resize'));          // высота сцены меняется — пересчитать
    };
    const paint = () => {
      const rec = S.mode === 'rec';
      recBtn.classList.toggle('has-ic', rec);
      recBtn.innerHTML = rec ? DOTS + '<span class="vmode-t">Дефекты</span>' : '<span class="vmode-t">Запись</span>';
      recBtn.setAttribute('aria-label', rec ? 'Дефекты' : 'Запись');
      recBtn.title = rec ? 'Вернуться к карте дефектов' : 'Запись: все шпильки с номерами, без дефектов';
      $('viewSeg').hidden = !rec;
      ['viewSeg', 'laySeg'].forEach((id) => $(id).querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.v === S.recView));
      }));
    };
    const apply = async () => {
      const rec = S.mode === 'rec', sheet = rec && S.recView === 'sheet' && ctx !== 'record';
      const schemes = rec && S.recView === 'sheet' && ctx === 'record';
      window.__smRec = rec;
      root.classList.toggle('sm-rec', rec);
      if (rec && !S.data) { try { await load(); } catch (err) { msg('Не удалось загрузить схемы: ' + err.message); } }
      if (rec && !sheet && $('mode2d') && $('mode2d').getAttribute('aria-pressed') === 'true' && $('modeBody')) $('modeBody').click();
      hideRecCard();
      if (!sheet) fsExit();
      lay.hidden = !sheet; app.hidden = sheet;
      paint();
      if (sheet && S.data) {
        const want = mapModel() || S.model || modelsOf()[0].id;
        if (want !== S.model || !S.view) setModel(want); else setZoom(S.zoom);
      } else {
        if (rec && S.model) syncMapModel();
        if (ctx === 'record' && rec) {                       // «3D» — кузов, «Схемы» — чертежи цеха на 3D
          const want = $(schemes ? 'mode3d' : 'modeBody');
          if (want && want.getAttribute('aria-pressed') !== 'true') want.click();
        }
        redraw3d();
      }
      notify();
    };
    const openSheet = async (model, view, no) => {
      S.mode = 'rec'; S.recView = 'sheet';
      store.set('stud-map.mode', 'rec'); store.set('stud-map.recView', 'sheet');
      await apply();
      if (model && model !== S.model) setModel(model);
      if (view && view !== S.view) showView(view);
      if (no != null) select(no, { zoom: 2 });
    };
    const setMode = (mode, recView) => {
      if (mode) S.mode = mode;
      if (recView) S.recView = recView;
      store.set('stud-map.mode', S.mode); store.set('stud-map.recView', S.recView);
      apply();
    };
    recBtn.addEventListener('click', () => setMode(S.mode === 'rec' ? 'defects' : 'rec'));
    $('layBack').addEventListener('click', () => setMode('defects'));
    ['viewSeg', 'laySeg'].forEach((id) => $(id).addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]');
      if (b && b.dataset.v !== S.recView) {
        if (b.dataset.v === '3d' && S.model) syncMapModel();
        setMode('rec', b.dataset.v);
      }
    }));

    // 3D строится после загрузки данных карты — ждём кнопки моделей, потом включаем режим
    const whenReady = (fn) => {
      const t0 = Date.now();
      const wait = () => (document.querySelector('#models .chip') || Date.now() - t0 > 15000 ? fn() : setTimeout(wait, 150));
      wait();
    };

    // режим: «Записать» — всегда «Запись», «Аналитика» — всегда «Дефекты»; иначе — как в прошлый раз
    // (без выбора: во фрейме — «Запись», отдельно открытая карта — «Дефекты»); «3D / А-лист» — как в прошлый раз
    const restoreMode = () => {
      const m = store.get('stud-map.mode');
      S.mode = ctx === 'record' ? 'rec' : ctx === 'analytics' ? 'defects'
        : m === 'rec' || m === 'defects' ? m : (embedded ? 'rec' : 'defects');
      S.recView = store.get('stud-map.recView') === 'sheet' ? 'sheet' : '3d';
    };

    // «Схемы»: вкладки листов строит сборка (#views; на «Записать» они скрыты вместе с панелью)
    const sheetTab = (name) => [...document.querySelectorAll('#views .tab')]
      .find((t) => (t.querySelector('span') || t).textContent.trim() === name);
    const currentSheet = () => {
      const t = document.querySelector('#views .tab[aria-selected="true"] span');
      return t ? t.textContent.trim() : null;
    };
    // странице — что поменялось на карте (модель, режим, лист); не чаще раза в 80 мс
    const listeners = [];
    let notifyTimer = 0;
    const notify = () => {
      clearTimeout(notifyTimer);
      notifyTimer = setTimeout(() => listeners.forEach((cb) => { try { cb(); } catch (e) { /* страница ушла */ } }), 80);
    };
    if ($('views')) new MutationObserver(notify).observe($('views'), { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    // кнопка станции (FF, RF…) на «Схемах» сама переводит карту в 3D к этой станции — на «Записать»
    // переключатель «3D / Схемы» и список номеров должны это увидеть
    const modeSync = () => {
      if (ctx !== 'record' || S.mode !== 'rec' || !$('mode3d')) return;
      const v = $('mode3d').getAttribute('aria-pressed') === 'true' ? 'sheet' : '3d';
      if (v !== S.recView) { S.recView = v; store.set('stud-map.recView', v); paint(); }
      notify();
    };
    ['modeBody', 'mode3d'].forEach((id) => { if ($(id)) new MutationObserver(modeSync).observe($(id), { attributes: true, attributeFilter: ['aria-pressed'] }); });
    // нажали станцию над картой — список номеров на странице переключится на неё
    if ($('stBar')) new MutationObserver(notify).observe($('stBar'), { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
    if ($('vtitle')) new MutationObserver(notify).observe($('vtitle'), { childList: true, characterData: true, subtree: true });

    // для страницы «Шпильки»: model — модель карты ('A13T', 'P01'…) машины из QR; null — машины нет
    let want = null;
    window.SM = {
      setRecord(model) {
        want = model || null;
        whenReady(() => {
          carMode = !!want;
          root.classList.toggle('sm-car', carMode);
          if (want) { S.model = want; S.mode = 'rec'; S.recView = '3d'; } else restoreMode();
          apply();
        });
      },
      // что сейчас на карте — для списка номеров под ней (страница «Записать»):
      // {model, mode: '3d'|'sheet', view: имя листа «Схем» или null, views: [{name, count}], nums: [...]}
      info() {
        if (!S.data) return null;
        const m = mapModel() || S.model;
        if (!m) return null;
        const vs = viewsOf(m), schemes = S.recView === 'sheet';
        const cur = schemes ? currentSheet() : null;
        const v = cur && vs.find((x) => x.name === cur);
        const nums = [...new Set((v ? [v] : vs).flatMap((x) => x.studs.map((q) => q.no)))].sort((p, q) => p - q);
        const st = document.querySelector('#stBar button[aria-pressed="true"]');
        return { model: m, mode: schemes ? 'sheet' : '3d', view: v ? v.name : null, nums, station: st ? st.dataset.loc : null,
          views: vs.map((x) => ({ name: x.name, count: new Set(x.studs.map((q) => q.no)).size })) };
      },
      onChange(cb) { listeners.push(cb); },
      // камера к станции (как кнопки FF, RF… над картой); на «Схемах» карта сама перейдёт в 3D
      station(loc) {
        const btn = document.querySelector(`#stBar button[data-loc="${loc}"]`);
        if (btn) btn.click();
        return !!btn;
      },
      show3d() { if (S.recView !== '3d') { S.recView = '3d'; store.set('stud-map.recView', '3d'); apply(); } },
      // «Схемы» на нужном листе
      async showView(name) {
        if (S.recView !== 'sheet') { S.recView = 'sheet'; store.set('stud-map.recView', 'sheet'); await apply(); }
        for (let i = 0; i < 20 && !sheetTab(name); i++) await new Promise((r) => setTimeout(r, 100));
        const t = sheetTab(name);
        if (t && t.getAttribute('aria-selected') !== 'true') t.click();
      },
      // шпилька из списка под картой: на «Схемах» — сначала её лист; дальше как нажатие на шпильку в 3D
      async pick(no) {
        const m = mapModel() || S.model;
        if (S.recView === 'sheet' && S.data && m) {
          const vs = viewsOf(m), cur = currentSheet();
          const on = vs.find((x) => x.name === cur && x.studs.some((q) => q.no === no)) || vs.find((x) => x.studs.some((q) => q.no === no));
          if (on && on.name !== cur) await window.SM.showView(on.name);
        }
        if (window.__smPick) window.__smPick(no, {});
      },
      // записанные по машине шпильки (номера на карте) — в «Записи» зелёные номерки с ✓
      setDone(nums) {
        window.__smDone = new Set((nums || []).map(Number).filter((n) => Number.isFinite(n)));
        if (window.__smRec && window.__smRedraw) window.__smRedraw();
      },
      ready: () => !!document.querySelector('#models .chip'),
      // «во весь экран» по просьбе страницы (после QR машины на телефоне) — как кнопка карты.
      // Без нажатия пользователя браузер разворачивать не даёт — тогда карта растягивает своё окно
      // на весь экран страницы (как на iPhone, см. index.html: #stage.fs → iframe.sm-fs)
      fullscreen() {
        whenReady(() => {
          if ($('stage').classList.contains('fs') || document.fullscreenElement || document.webkitFullscreenElement) return;
          const b = $('fsBtn');
          if (b) b.click();
        });
      },
    };

    if (ctx === 'record') {                                 // вместо А-листа — «Схемы»
      const b = $('viewSeg').querySelector('[data-v="sheet"]');
      if (b) { b.textContent = 'Схемы'; b.title = 'Схемы цеха на 3D: чертёж с номерами шпилек'; }
    }
    restoreMode();
    paint();
    if (S.mode === 'rec') whenReady(apply);
  });
})();
