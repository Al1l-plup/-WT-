/* Выбор зон ответственности: бренд → участок → (сторона) → станции. Один и тот же на
   регистрации, в личном кабинете и у администратора (страница «Пользователи»).

   Отвечаешь за весь участок — одна галочка «EC целиком». Не за весь — раскрываешь участок
   и отмечаешь станции (EC1-10, EC2-10…). У участков со сторонами есть ещё «BS-L целиком».
   Выбранное «целиком» покрывает всё внутри: вложенные галочки отмечены и недоступны, на
   сервер уходит только сам участок или сторона.
   Справочник ref = {brands: [{id, name}], tree: {brand_id: [{code, stations: [], sides: [{code, stations}]}]}}. */
const ZonePicker = (function () {
  'use strict';

  const esc = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s == null ? '' : s));
  const list = (map, id) => (map && (map[id] || map[String(id)])) || [];

  function chip(brandId, code, label, mine, name, level) {
    const nm = name ? ` name="${esc(name(brandId))}"` : '';
    return `<label class="zp-chip"><input type="checkbox"${nm} data-brand="${esc(brandId)}" data-level="${level}" ` +
           `value="${esc(code)}"${mine.has(code) ? ' checked' : ''}><span>${esc(label)}</span></label>`;
  }

  function stationsHtml(brandId, stations, mine, name) {
    return stations.length
      ? `<div class="zp-list">${stations.map(s => chip(brandId, s, s, mine, name, 'station')).join('')}</div>` : '';
  }

  function areaHtml(brandId, a, mine, name) {
    const inner = stationsHtml(brandId, a.stations, mine, name) + a.sides.map(sd =>
      `<div class="zp-side">${chip(brandId, sd.code, sd.code + ' целиком', mine, name, 'side')}` +
      `${stationsHtml(brandId, sd.stations, mine, name)}</div>`).join('');
    const nested = a.stations.length + a.sides.reduce((n, sd) => n + 1 + sd.stations.length, 0);
    const what = a.sides.length ? 'стороны и станции' : 'станции';
    const open = [...a.stations, ...a.sides.flatMap(sd => [sd.code, ...sd.stations])].some(c => mine.has(c));
    return `<div class="zp-area">${chip(brandId, a.code, a.code + ' целиком', mine, name, 'area')}` +
      (nested ? `<details class="zp-more"${open ? ' open' : ''}><summary>${what} <span class="zp-count"></span></summary>${inner}</details>` : '') +
      '</div>';
  }

  // «целиком» отмечено — всё внутри отмечено и недоступно; сняли «целиком» — внутри снова свободно
  function lock(parent, children, changed) {
    children.forEach(c => {
      if (parent.checked) { c.checked = true; c.disabled = true; }
      else if (c.disabled) { c.disabled = false; if (changed === parent) c.checked = false; }
    });
  }

  function sync(area, changed) {
    const all = area.querySelector('input[data-level=area]');
    lock(all, area.querySelectorAll('.zp-more input'), changed);
    if (!all.checked) {
      area.querySelectorAll('.zp-side').forEach(sd =>
        lock(sd.querySelector('input[data-level=side]'), sd.querySelectorAll('input[data-level=station]'), changed));
    }
    const count = area.querySelector('.zp-count');
    if (count) {
      const n = area.querySelectorAll('.zp-more input:checked:not(:disabled)').length;
      count.textContent = all.checked ? '· все' : (n ? `· выбрано ${n}` : '');
    }
  }

  /** Нарисовать выбор. have = {brand_id: [зоны]}; name(brandId) — имя поля для обычной формы. */
  function render(host, ref, have, {name = null} = {}) {
    host.innerHTML = (ref.brands || []).map(b => {
      const areas = list(ref.tree, b.id);
      const mine = new Set(list(have, b.id));
      return `<div class="zp-brand"><div class="zp-title">${esc(b.name)}</div>` +
        (areas.length ? areas.map(a => areaHtml(b.id, a, mine, name)).join('') : '<span class="zp-empty">нет участков</span>') +
        '</div>';
    }).join('');
    host.querySelectorAll('.zp-area').forEach(a => sync(a));
    host.onchange = e => { const a = e.target.closest('.zp-area'); if (a) sync(a, e.target); };
  }

  /** Выбранное: {brand_id: [зоны]}; то, что покрыто «целиком», не входит. */
  function read(host) {
    const out = {};
    host.querySelectorAll('input[type=checkbox]:checked:not(:disabled)').forEach(c => {
      (out[c.dataset.brand] = out[c.dataset.brand] || []).push(c.value);
    });
    return out;
  }

  return {render, read};
})();
