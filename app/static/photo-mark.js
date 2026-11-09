/* Фото дефекта с телефона: выбор «камера / галерея» (все сенсорные, кроме iPhone) и простой редактор пометок.

   Работает с любым <input type="file" accept="image/*"> на странице. Код страницы видит обычный
   выбранный файл: с пометками, если их нарисовали, иначе исходный. Подключать ДО основного скрипта
   страницы: обработчик кнопки «назад» здесь должен сработать раньше, чем у окна карточки.

   - Встроенный редактор телефона браузер открыть не может, поэтому редактор свой.
   - На Android окно выбора файла может не предлагать камеру (Android 14+ открывает галерею),
     поэтому выбор источника свой. На iPhone такой выбор уже встроен в браузер, второй не нужен.
   - Сайт работает по HTTP, поэтому камера открывается через capture: это не требует HTTPS. */
(function () {
  'use strict';

  const MAX_DIM = 1600;        // как в compressImage страницы: при отправке размер уже не изменится
  const JPEG_QUALITY = 0.92;   // страница сожмёт ещё раз при отправке, здесь качество не теряем
  const INK = '#ff1744';
  const INK_CSS_PX = 4;        // толщина линии на экране

  const coarse = window.matchMedia('(pointer: coarse)');
  // iPhone и iPad: выбор «снять / медиатека» встроен в браузер, второй не нужен. iPad в режиме
  // «как на компьютере» называет себя Mac, но выдаёт себя касаниями. Остальные сенсорные — свой
  // выбор: по названию браузера Android не узнать (версия для ПК в Chrome называет себя Linux).
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  // без окон dialog кнопка работает по-старому: иначе нажатие ничего бы не открыло
  const hasDialog = typeof HTMLDialogElement === 'function' && typeof HTMLDialogElement.prototype.showModal === 'function';
  // без этого нельзя подменить файл в поле: редактор не открываем, иначе пометки пропадут молча
  const canReplaceFiles = (() => { try { new DataTransfer(); return true; } catch { return false; } })();
  const isPhotoInput = el => el instanceof HTMLInputElement && el.type === 'file' && el.accept.startsWith('image');

  // ── Окно поверх всего. Лежит в истории браузера: «назад» закрывает его, а не карточку под ним ──
  let shown = null;        // {el, onDismiss}
  let skipPop = false;     // свой history.back() при закрытии кнопкой: странице о нём знать незачем

  function show(el, onDismiss) {
    shown = {el, onDismiss};
    el.showModal();
    history.pushState({photoDialog: true}, '', location.href);
  }
  function hide() {
    if (!shown) return;
    const {el} = shown;
    shown = null;
    if (el.open) el.close();
    skipPop = true;
    history.back();
  }
  function dismiss() {
    const d = shown;
    if (d) { hide(); d.onDismiss(); }
  }
  window.addEventListener('popstate', e => {
    if (skipPop) { skipPop = false; e.stopImmediatePropagation(); return; }
    if (!shown) return;
    const d = shown;
    shown = null;
    if (d.el.open) d.el.close();
    e.stopImmediatePropagation();
    d.onDismiss();
  });
  function makeDialog(className, label, html) {
    const el = document.createElement('dialog');
    el.className = className;
    el.setAttribute('aria-label', label);
    el.innerHTML = html;
    el.addEventListener('cancel', e => { e.preventDefault(); dismiss(); });       // Esc, «назад» в новых Chrome
    el.addEventListener('close', () => { if (shown && shown.el === el) dismiss(); });
    el.addEventListener('keydown', e => e.stopPropagation());                     // Esc не закроет окно страницы под ним
    document.body.appendChild(el);
    return el;
  }

  // ── Камера и нехватка оперативной памяти ──
  // Пока открыта камера, Android может выгрузить Chrome из памяти. Вернувшись, Chrome открывает
  // страницу заново и пишет «Не удалось завершить операцию (недостаточно памяти)» — снимок теряется,
  // и сайт это никак не предотвратит (камера внутри страницы требует HTTPS). Поэтому помечаем запуск
  // камеры: страница открылась заново с пометкой — объясняем, что делать, и запоминаем телефон,
  // чтобы в следующий раз подсказать в окне выбора. Карточку дефекта страница откроет сама (#d…).
  const CAM_PENDING = 'pm-camera-pending', CAM_FAILED = 'pm-camera-failed';
  const CAM_FRESH_MS = 10 * 60 * 1000, CAM_REMEMBER_MS = 30 * 24 * 3600 * 1000;
  const store = {                                // без хранилища (приватный режим) — просто без подсказок
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* нет хранилища */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* нет хранилища */ } },
  };
  const cameraFailedHere = () => Date.now() - (+store.get(CAM_FAILED) || 0) < CAM_REMEMBER_MS;
  let cameraWaiting = false;

  function cameraStarted() {
    store.set(CAM_PENDING, String(Date.now()));
    cameraWaiting = true;
  }
  function cameraDone() {
    store.del(CAM_PENDING);
    cameraWaiting = false;
  }
  function showCameraNote() {
    const el = document.createElement('dialog');
    el.className = 'pm-note';
    el.setAttribute('aria-labelledby', 'pmNoteTitle');
    el.innerHTML = `<h3 id="pmNoteTitle">Фото не прикрепилось</h3>
      <p>Пока была открыта камера, телефону не хватило оперативной памяти, и браузер перезапустился.
         Свободное место на телефоне тут ни при чём.</p>
      <p><b>Как добавить фото:</b> сфотографируйте обычной камерой телефона, затем нажмите
         «Добавить фото» → «Выбрать из галереи». Помогает и закрыть другие приложения.</p>
      <button type="button" class="btn btn-primary">Понятно</button>`;
    el.querySelector('button').addEventListener('click', () => { el.close(); el.remove(); });
    el.addEventListener('close', () => el.remove());             // Esc или «назад» в новых Chrome
    document.body.appendChild(el);
    el.showModal();
  }
  // страница открылась заново, пока ждали снимок с камеры
  const pendingAt = +store.get(CAM_PENDING);
  if (pendingAt) {
    store.del(CAM_PENDING);
    if (Date.now() - pendingAt < CAM_FRESH_MS) {
      store.set(CAM_FAILED, String(Date.now()));
      if (hasDialog) showCameraNote();
    }
  }
  // вернулись с камеры, а страница жива — Chrome не выгружался; снимок придёт событием change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !cameraWaiting) return;
    store.del(CAM_PENDING);
    setTimeout(() => {
      if (!cameraWaiting) return;                // снимок пришёл
      cameraWaiting = false;                     // не пришёл: отменили съёмку или Chrome всё же сбился
      if (typeof window.toast === 'function') {
        window.toast('Фото не пришло? Если телефон пишет «недостаточно памяти» — снимите камерой телефона и выберите из галереи');
      }
    }, 4000);
  });

  // ── Телефон (кроме iPhone): одна кнопка, дальше выбор источника ──
  let chooser = null, chooserInput = null, passClick = false;

  function onChooserClick(e) {
    const btn = e.target.closest('button');
    if (!btn) {                                  // касание мимо кнопок: закрываем, только если вне окна
      const r = chooser.getBoundingClientRect();
      if (e.target !== chooser || (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)) return;
    }
    const input = chooserInput, src = btn && btn.dataset.src;
    hide();
    if (!src) return;
    if (src === 'camera') { input.setAttribute('capture', 'environment'); cameraStarted(); }
    else input.removeAttribute('capture');
    passClick = true;
    input.click();
    passClick = false;
  }
  function openChooser(input) {
    if (!chooser) {
      chooser = makeDialog('pm-choose', 'Добавить фото', `
        <button type="button" class="btn btn-primary" data-src="camera">📷 Сделать фото</button>
        <p class="pm-hint" hidden>На этом телефоне камера из браузера уже срывалась из-за нехватки памяти.
           Надёжнее: снимите камерой телефона и выберите фото из галереи.</p>
        <button type="button" class="btn btn-ghost" data-src="gallery">🖼 Выбрать из галереи</button>
        <button type="button" class="btn btn-ghost">Отмена</button>`);
      chooser.addEventListener('click', onChooserClick);
    }
    chooser.querySelector('.pm-hint').hidden = !cameraFailedHere();
    chooserInput = input;
    show(chooser, () => {});
  }
  document.addEventListener('click', e => {
    if (passClick || !hasDialog || !coarse.matches || isIOS || !isPhotoInput(e.target)) return;
    e.preventDefault();
    openChooser(e.target);
  }, true);

  // ── Редактор: рисование пальцем, отмена последней линии, готово ──
  function buildEditor() {
    const el = makeDialog('pm-edit', 'Пометки на фото', `
      <div class="pm-head">
        <button type="button" class="pm-x" aria-label="Не добавлять фото">✕</button>
        <span class="pm-title" aria-live="polite"></span>
      </div>
      <div class="pm-stage"><canvas aria-label="Фото: проведите пальцем, чтобы отметить место"></canvas></div>
      <div class="pm-foot">
        <button type="button" class="btn btn-ghost pm-undo">↶ Отменить</button>
        <button type="button" class="btn btn-primary pm-done">Готово</button>
      </div>`);
    const stage = el.querySelector('.pm-stage'), cv = el.querySelector('canvas'), ctx = cv.getContext('2d');
    const title = el.querySelector('.pm-title'), undo = el.querySelector('.pm-undo'), done = el.querySelector('.pm-done');
    let img = null, strokes = [], current = null, finish = null, source = null;

    function fit() {                             // фото целиком на экране, в том числе после поворота
      if (!img) return;
      const box = stage.getBoundingClientRect();
      const s = Math.min(box.width / cv.width, box.height / cv.height);
      cv.style.width = Math.floor(cv.width * s) + 'px';
      cv.style.height = Math.floor(cv.height * s) + 'px';
    }
    function dot(p) { ctx.beginPath(); ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); }
    function line(a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    function paint() {
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      strokes.forEach(s => { dot(s[0]); s.forEach((p, i) => { if (i) line(s[i - 1], p); }); });
    }
    function position(e) {
      const r = cv.getBoundingClientRect();
      return {x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height};
    }

    cv.addEventListener('pointerdown', e => {
      if (!e.isPrimary || !img) return;          // второй палец не рисует
      e.preventDefault();
      cv.setPointerCapture(e.pointerId);
      current = [position(e)];
      strokes.push(current);
      dot(current[0]);
      undo.disabled = false;
    });
    cv.addEventListener('pointermove', e => {
      if (!current || !e.isPrimary) return;
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];   // быстрый штрих — без углов
      (events.length ? events : [e]).forEach(ev => {
        const p = position(ev);
        line(current[current.length - 1], p);
        current.push(p);
      });
    });
    const endStroke = () => { current = null; };
    cv.addEventListener('pointerup', endStroke);
    cv.addEventListener('pointercancel', endStroke);

    undo.addEventListener('click', () => {
      strokes.pop();
      undo.disabled = !strokes.length;
      paint();
    });
    done.addEventListener('click', () => {
      if (!finish) return;
      if (!strokes.length) { finish(source); return; }       // без пометок уходит исходный файл
      done.disabled = true;
      const name = source.name.replace(/\.[^.]+$/, '') + '.jpg', original = source;
      cv.toBlob(blob => {
        done.disabled = false;
        if (!blob) {
          if (typeof window.toast === 'function') window.toast('Не удалось сохранить пометки: фото добавлено без них');
          finish(original);
          return;
        }
        finish(new File([blob], name, {type: 'image/jpeg'}));
      }, 'image/jpeg', JPEG_QUALITY);
    });
    el.querySelector('.pm-x').addEventListener('click', () => {
      if (strokes.length && !window.confirm('Выйти без сохранения пометок?')) return;
      dismiss();
    });
    window.addEventListener('resize', fit);

    return {
      el,
      cancel() { if (finish) finish(null); },
      edit(file, prefix) {
        return new Promise(resolve => {
          const url = URL.createObjectURL(file), image = new Image();
          source = file; strokes = []; current = null; img = null;
          undo.disabled = done.disabled = true;
          title.textContent = 'Загружаем фото…';
          finish = result => {
            finish = null; img = null; source = null;
            URL.revokeObjectURL(url);
            cv.width = cv.height = 0;                // большой холст не держим в памяти телефона
            resolve(result);
          };
          image.onerror = () => { if (finish) finish(file); };   // браузер не умеет этот формат: фото уходит как есть
          image.onload = () => {
            if (!finish) return;                     // пока грузилось, окно уже закрыли
            const k = Math.min(1, MAX_DIM / Math.max(image.width, image.height));
            cv.width = Math.round(image.width * k);
            cv.height = Math.round(image.height * k);
            img = image;
            fit();
            ctx.strokeStyle = ctx.fillStyle = INK;
            ctx.lineCap = ctx.lineJoin = 'round';
            ctx.lineWidth = Math.max(2, Math.round(INK_CSS_PX * cv.width / parseFloat(cv.style.width)));
            paint();
            title.textContent = prefix + 'Отметьте место пальцем';
            done.disabled = false;
          };
          image.src = url;
        });
      },
    };
  }

  let editor = null, passChange = false;

  function setFiles(input, files) {
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));
    input.files = dt.files;
    passChange = true;                           // дальше событие идёт обычным путём, к обработчикам страницы
    input.dispatchEvent(new Event('change', {bubbles: true}));
    passChange = false;
  }
  async function markAll(input, files) {
    editor = editor || buildEditor();
    let cancelled = false;
    show(editor.el, () => { cancelled = true; editor.cancel(); });
    const out = [];
    for (let i = 0; i < files.length && !cancelled; i++) {
      const prefix = files.length > 1 ? `Фото ${i + 1} из ${files.length}. ` : '';
      const file = await editor.edit(files[i], prefix);
      if (file) out.push(file);
    }
    if (!cancelled) hide();
    setFiles(input, cancelled ? [] : out);       // отмена отменяет весь выбор: фото не добавляются
  }
  document.addEventListener('change', e => {
    const input = e.target;
    if (isPhotoInput(input) && input.files.length) cameraDone();   // снимок дошёл до страницы
    if (passChange || !canReplaceFiles || !hasDialog || !coarse.matches || !isPhotoInput(input) || !input.files.length) return;
    e.stopImmediatePropagation();                // страница получит событие после редактора
    markAll(input, [...input.files]);
  }, true);
})();
