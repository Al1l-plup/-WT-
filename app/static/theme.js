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

// Навигация по правам + блок текущего пользователя (единый для всех страниц).
// На страницах входа/регистрации nav нет — код просто не выполняется.
// Сервер всё равно проверяет доступ (before_request-щит) — здесь только скрываем
// то, что пользователю недоступно, чтобы не показывать «мёртвые» вкладки.
document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  const btn = document.getElementById('themeToggle');
  try {
    const r = await fetch('/api/me');
    if (!r.ok) return;
    const me = await r.json();
    const allowed = new Set(me.pages || []);

    // 1) недоступные отделу вкладки НЕ прячем (чтобы не «пропадали загадочно»),
    //    а помечаем замком и делаем некликабельными — видно, что это ограничение прав.
    //    Сервер всё равно закрывает доступ (before_request-щит).
    nav.querySelectorAll('a.nav-link[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('/') && !allowed.has(href)) {
        a.classList.add('nav-locked');
        a.setAttribute('aria-disabled', 'true');
        a.title = 'Недоступно вашему отделу';
        if (!a.querySelector('.lock')) {
          const lk = document.createElement('span');
          lk.className = 'lock'; lk.textContent = ' 🔒';
          a.appendChild(lk);
        }
        a.addEventListener('click', e => { e.preventDefault(); }, true);
      }
    });

    // 2) админу — вкладка «Пользователи»
    if (me.is_admin && !nav.querySelector('a[href="/users"]')) {
      const link = document.createElement('a');
      link.className = 'nav-link';
      link.href = '/users';
      link.textContent = 'Пользователи';
      if (location.pathname === '/users') link.classList.add('active');
      nav.insertBefore(link, btn);
    }

    // 3) блок пользователя (+ бейдж «только чтение» для ОТК/Производства)
    const ro = me.readonly
      ? '<span title="Ваш отдел не может менять данные" style="background:color-mix(in srgb,var(--warn) 25%,transparent);border:1px solid var(--warn);border-radius:5px;padding:1px 6px;font-size:11px">только чтение</span> '
      : '';
    const span = document.createElement('span');
    span.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;opacity:.85;margin-left:6px;white-space:nowrap';
    span.innerHTML = `${ro}👤 ${me.name} · ${me.dept || '—'} <a href="/logout" style="color:inherit;opacity:.7" title="Выйти">⎋</a>`;
    nav.insertBefore(span, btn);
  } catch (e) { /* оффлайн/аноним — молча */ }
});
