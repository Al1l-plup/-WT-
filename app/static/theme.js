// Apply saved theme immediately (before paint)
(function () {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('wt-theme') || 'dark');
})();

function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const update = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀' : '🌙';
    btn.title = dark ? 'Светлая тема' : 'Тёмная тема';
    // подпись для скринридера (кнопка — только иконка) и состояние переключателя
    btn.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    btn.setAttribute('aria-pressed', String(!dark));
    // цвет адресной строки браузера на телефоне — в тон текущей темы (цвет шапки)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#161b22' : '#ffffff');
  };
  update();
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wt-theme', next);
    update();
  });
}
document.addEventListener('DOMContentLoaded', initThemeToggle);

// Блок текущего пользователя в навигации (единый для всех страниц).
// На страницах входа/регистрации nav нет — блок просто не рисуется.
document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  try {
    const r = await fetch('/api/me');
    if (!r.ok) return;
    const me = await r.json();
    const span = document.createElement('span');
    span.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;opacity:.85;margin-left:6px;white-space:nowrap';
    span.innerHTML = `👤 ${me.name} · ${me.dept || '—'} <a href="/logout" style="color:inherit;opacity:.7" title="Выйти">⎋</a>`;
    const btn = document.getElementById('themeToggle');
    nav.insertBefore(span, btn);
  } catch (e) { /* оффлайн/аноним — молча */ }
});
