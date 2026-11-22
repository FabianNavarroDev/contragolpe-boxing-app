'use strict';
/* Arranque: rutas, acciones (delegación de eventos) e inicio de la app. Se carga al final. */

const ROUTES = {
  inicio: { role: 'socio', label: 'Inicio', icon: 'home', render: vInicio },
  socios: { role: 'admin', label: 'Socios', icon: 'users', render: vSocios },
};

/* ================= Acciones (delegación) ================= */
const ACTIONS = {
  go: d => go(d.r),
  role: d => { const r = d.r === 'admin' ? 'admin' : 'socio'; if (canEnter(r)) go(firstRoute(r)); else openLogin(r); },
  login: d => openLogin(d.r),
  logout: () => logout(),
  close: () => popLayer(),
  membership: () => openMembership(),
  reset: () => confirmSheet('¿Reiniciar la demo?', 'Se borran los cambios hechos en este navegador y se cargan los datos de ejemplo.', 'Reiniciar', resetDemo),
  socioFilter: d => { ui.socioFilter = d.k; render(); },
  member: d => openMember(d.id),
  msgMember: d => openMsg(d.id),
  addMember: openAddMember,
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset, el, e); }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.input === 'socioQ') {
    ui.socioQuery = el.value; const pos = el.selectionStart; render();
    const n = $('#socioQ'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) { } }
  }
});
document.addEventListener('change', e => {
  const el = e.target;
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && layers.length) popLayer(); });
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (!layers.length) render(); }, 250); });

/* PWA: registra el service worker cuando la app se sirve desde la web (en la app nativa no hace falta) */
if (isNative()) {
  document.documentElement.classList.add('native');
  try { const sb = window.Capacitor.Plugins.StatusBar; if (sb) { sb.setStyle({ style: 'DARK' }); sb.setBackgroundColor && sb.setBackgroundColor({ color: '#090a08' }); } } catch (e) { }
  try { const sp = window.Capacitor.Plugins.SplashScreen; if (sp) sp.hide(); } catch (e) { }
}

render();
if (!session) openLogin('socio');
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!layers.length) render(); });
