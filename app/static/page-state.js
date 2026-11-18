/* Состояние страницы между переходами по разделам сайта: фильтры, сортировка, вкладка.
 *
 * Хранится в sessionStorage: живёт, пока открыта вкладка браузера, — переход в другой раздел
 * и обратно, обновление страницы его не стирают; закрыли браузер — завтра с чистого листа
 * (вчерашний фильтр не прячет сегодняшние данные). Это только удобство: без хранилища
 * (приватный режим, запрет сайта) страница работает как раньше, с пустыми фильтрами.
 *
 *   PageState.load(key) / save(key, obj) / clear(key)        — своё состояние страницы (JSON)
 *   PageState.restoreFields(key, ids)                         — вернуть значения полей фильтра
 *   const snap = PageState.trackFields(key, ids)              — запоминать их при вводе;
 *     snap() — запомнить сейчас (после программной смены значений, например «Сбросить»)
 */
(function () {
  'use strict';
  const PREFIX = 'wt-ps:';
  const VERSION = 1;          // поменять формат — поднять версию: старое состояние просто не подхватится

  function load(key) {
    try {
      const o = JSON.parse(sessionStorage.getItem(PREFIX + key) || 'null');
      return o && o.v === VERSION ? o.d : null;
    } catch { return null; }
  }
  function save(key, data) {
    try { sessionStorage.setItem(PREFIX + key, JSON.stringify({ v: VERSION, d: data })); } catch { /* нет хранилища */ }
  }
  function clear(key) {
    try { sessionStorage.removeItem(PREFIX + key); } catch { /* нет хранилища */ }
  }

  function readFields(ids) {
    const o = {};
    ids.forEach(id => { const el = document.getElementById(id); if (el) o[id] = el.value; });
    return o;
  }
  // Значение списка ставим, только если такой вариант в нём есть (модель удалили — фильтр не ломает страницу).
  function restoreFields(key, ids) {
    const s = load(key);
    if (!s) return false;
    let any = false;
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !(id in s)) return;
      if (el.tagName === 'SELECT' && ![...el.options].some(o => o.value === s[id])) return;
      el.value = s[id];
      any = true;
    });
    return any;
  }
  function trackFields(key, ids) {
    const snap = () => save(key, Object.assign(load(key) || {}, readFields(ids)));
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('change', snap); el.addEventListener('input', snap); }
    });
    return snap;
  }

  window.PageState = { load, save, clear, restoreFields, trackFields };
})();
