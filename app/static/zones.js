/* Выбор зон ответственности: бренд → участки. Один и тот же на регистрации, в личном
   кабинете и у администратора (страница «Пользователи»).

   Участок со сторонами показывается так: «BS целиком», «BS-L», «BS-R». «Целиком» покрывает
   обе стороны: стороны тогда отмечены и недоступны, на сервер уходит только «BS».
   Справочник ref = {brands: [{id, name}], areas: {brand_id: ['BS', 'BS-L', 'BS-R', 'EC', …]}}. */
const ZonePicker = (function () {
  'use strict';

  const esc = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s == null ? '' : s));
  const list = (map, id) => (map && (map[id] || map[String(id)])) || [];

  function chip(brandId, code, label, checked, name, extra) {
    const nm = name ? ` name="${esc(name(brandId))}"` : '';
    return `<label class="zp-chip"><input type="checkbox"${nm} data-brand="${esc(brandId)}" value="${esc(code)}"` +
           `${checked ? ' checked' : ''}${extra || ''}><span>${esc(label)}</span></label>`;
  }

  // стороны отмечены и недоступны, пока выбран участок целиком; сняли «целиком» — стороны свободны
  function sync(group, changed) {
    const all = group.querySelector('input[data-whole]');
    if (!all) return;
    group.querySelectorAll('input[data-side]').forEach(c => {
      if (all.checked) { c.checked = true; c.disabled = true; }
      else if (c.disabled) { c.disabled = false; if (changed === all) c.checked = false; }
    });
  }

  /** Нарисовать выбор. have = {brand_id: [зоны]}; name(brandId) — имя поля для обычной формы. */
  function render(host, ref, have, {name = null} = {}) {
    host.innerHTML = (ref.brands || []).map(b => {
      const codes = list(ref.areas, b.id);
      const mine = new Set(list(have, b.id));
      const bases = codes.filter(c => !c.includes('-'));
      const items = bases.map(base => {
        const sides = codes.filter(c => c.startsWith(base + '-'));
        if (!sides.length) return chip(b.id, base, base, mine.has(base), name);
        const whole = mine.has(base);
        return `<span class="zp-group">${chip(b.id, base, base + ' целиком', whole, name, ' data-whole')}` +
               sides.map(s => chip(b.id, s, s, whole || mine.has(s), name, ' data-side')).join('') + '</span>';
      }).join('');
      return `<div class="zp-brand"><div class="zp-title">${esc(b.name)}</div>` +
             `<div class="zp-list">${items || '<span class="zp-empty">нет участков</span>'}</div></div>`;
    }).join('');
    host.querySelectorAll('.zp-group').forEach(sync);
    host.onchange = e => { const g = e.target.closest('.zp-group'); if (g) sync(g, e.target); };
  }

  /** Выбранное: {brand_id: [зоны]}; стороны под «целиком» не входят. */
  function read(host) {
    const out = {};
    host.querySelectorAll('input[type=checkbox]:checked:not(:disabled)').forEach(c => {
      (out[c.dataset.brand] = out[c.dataset.brand] || []).push(c.value);
    });
    return out;
  }

  return {render, read};
})();
