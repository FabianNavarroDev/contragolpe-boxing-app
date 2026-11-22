'use strict';
/* Arranque: rutas, acciones (delegación de eventos) e inicio de la app. Se carga al final. */

const ROUTES = {
  inicio: { role: 'socio', label: 'Inicio', icon: 'home', render: vInicio },
  clases: { role: 'socio', label: 'Clases', icon: 'cal', render: vClases },
  retos: { role: 'socio', label: 'Retos', icon: 'trophy', render: vRetos },
  tienda: { role: 'socio', label: 'Premios', icon: 'gift', render: vTienda },
  perfil: { role: 'socio', label: 'Mi ficha', icon: 'user', render: vPerfil },
  admin: { role: 'admin', label: 'Panel', icon: 'chart', render: vAdmin },
  socios: { role: 'admin', label: 'Socios', icon: 'users', render: vSocios },
  agenda: { role: 'admin', label: 'Agenda', icon: 'cal', render: vAgenda },
  entregas: { role: 'admin', label: 'Premios', icon: 'gift', render: vEntregas },
  ajustes: { role: 'admin', label: 'Avisos', icon: 'mega', render: vAjustes }
};

/* ================= Acciones (delegación) ================= */
const ACTIONS = {
  go: d => go(d.r),
  role: d => { const r = d.r === 'admin' ? 'admin' : 'socio'; if (canEnter(r)) go(firstRoute(r)); else openLogin(r); },
  login: d => openLogin(d.r),
  logout: () => logout(),
  close: () => popLayer(),
  notices: openNotices,
  kiosk: openKiosk,
  scan: openScanner,
  readyAgain: () => showReady({ member: me(), already: true }),
  timer: () => { closeAll(); openTimer(); },
  video: openVideo,
  photo: openPhoto,
  compare: openCompare,
  shareCard: openShare,
  membership: () => openMembership(),
  editProfile: openEditProfile,
  logWeight: openLogWeight,
  reset: () => confirmSheet('¿Reiniciar la demo?', 'Se borran los cambios hechos en este navegador y se cargan los datos de ejemplo.', 'Reiniciar', resetDemo),
  fMode: d => { ui.fighterMode = d.m; render(); },
  classDay: d => { ui.classDay = Number(d.d); render(); },
  agendaDay: d => { ui.agendaDay = Number(d.d); render(); },
  retosTab: d => { ui.retosTab = d.t; render(); },
  rankMetric: d => { ui.rankMetric = d.k; render(); },
  socioFilter: d => { ui.socioFilter = d.k; render(); },
  newDuel: openNewDuel,
  member: d => openMember(d.id),
  msgMember: d => openMsg(d.id),
  addMember: openAddMember,
  addClass: openAddClass,
  classRoster: d => openRoster(d.id),
  addChallenge: openAddChallenge,
  book: d => {
    const c = S.classes.find(x => x.id === d.id), id = S.me;
    if (c.booked.includes(id)) {
      c.booked = c.booked.filter(x => x !== id);
      if (c.wait.length) { const next = c.wait.shift(); c.booked.push(next); }
      toast('Reserva cancelada.');
    } else if (c.wait.includes(id)) { c.wait = c.wait.filter(x => x !== id); toast('Saliste de la lista de espera.'); }
    else if (c.booked.length >= c.cap) { c.wait.push(id); toast(`Estás en lista de espera (lugar ${c.wait.length}). Te avisamos si se libera.`); }
    else { c.booked.push(id); toast(`Lugar reservado: ${c.name} ${DOW[c.day]} ${c.time}.`, 'lime'); }
    save(); render();
  },
  claim: d => {
    const m = me(), ch = S.challenges.find(x => x.id === d.id);
    m.claimed = m.claimed || []; if (m.claimed.includes(ch.id)) return;
    m.claimed.push(ch.id); m.coins += ch.reward; m.xp += 100; save(); render();
    toast(`¡Reto cumplido! +${ch.reward} golpes y +100 XP.`, 'lime');
  },
  redeem: d => {
    const m = me(), r = S.rewards.find(x => x.id === d.id);
    confirmSheet(`Canjear ${esc(r.name)}`, `Se descontarán ${nf(r.cost)} golpes. Te quedarán ${nf(m.coins - r.cost)}.`, 'Canjear', () => {
      if (m.coins < r.cost || r.stock < 1) return;
      m.coins -= r.cost; r.stock -= 1;
      const code = 'CG-' + (1000 + Math.floor(Math.random() * 8999));
      S.redemptions.push({ id: uid('x'), memberId: m.id, rewardId: r.id, ts: new Date().toISOString(), code, status: 'pendiente' });
      save(); render();
      sheet(`<div style="text-align:center" class="stack"><p class="eyebrow lime">Canje confirmado</p><p class="h-display">${esc(r.name)}</p><p class="muted">Muestra este código en recepción</p><p class="h-display num" style="font-size:56px;color:var(--lime);letter-spacing:4px">${code}</p><button type="button" class="btn primary block" data-act="close">Listo</button></div>`);
    });
  },
  deliver: d => { const r = S.redemptions.find(x => x.id === d.id); r.status = 'entregado'; r.deliveredAt = new Date().toISOString(); save(); render(); toast(`Entregado: ${r.code}.`, 'lime'); },
  stock: d => { const r = S.rewards.find(x => x.id === d.id); r.stock = Math.max(0, r.stock + Number(d.d)); save(); render(); },
  delChallenge: d => confirmSheet('¿Eliminar reto?', 'Los socios dejarán de verlo en la app.', 'Eliminar', () => { S.challenges = S.challenges.filter(x => x.id !== d.id); save(); render(); }),
  delNotice: d => { S.notices = S.notices.filter(x => x.id !== d.id); save(); render(); }
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
  if (el.dataset.change === 'delay') { S.gym.checkinDelay = Number(el.value); const v = $('#delayV'); if (v) v.textContent = `${el.value} s (la propuesta original es 30 s; 4 s para demostración)`; save(); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.change === 'liveSim') { ui.liveSim = el.checked; render(); }
  if (el.dataset.change === 'planPrice') { const p = S.plans.find(x => x.id === el.dataset.id); p.price = Math.max(0, Number(el.value) || 0); save(); toast(`Precio de ${p.name} actualizado: ${money(p.price)}.`, 'lime'); }
});
document.addEventListener('submit', e => {
  if (e.target.id === 'noticeForm') {
    e.preventDefault();
    S.notices.unshift({ id: uid('n'), title: $('#nTitle').value.trim(), body: $('#nBody').value.trim(), tag: $('#nTag').value, ts: new Date().toISOString() });
    save(); render(); toast('Aviso enviado a todos los socios.', 'lime');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && layers.length) popLayer(); });
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (!layers.length) render(); }, 250); });

/* PWA: registra el service worker cuando la app se sirve desde la web (en la app nativa no hace falta) */
if (isNative()) {
  document.documentElement.classList.add('native');
  try { const sb = window.Capacitor.Plugins.StatusBar; if (sb) { sb.setStyle({ style: 'DARK' }); sb.setBackgroundColor && sb.setBackgroundColor({ color: '#090a08' }); } } catch (e) { }
  try { const sp = window.Capacitor.Plugins.SplashScreen; if (sp) sp.hide(); } catch (e) { }
} else if ('serviceWorker' in navigator && location.protocol === 'https:') {
  try { navigator.serviceWorker.register('sw.js').catch(() => { }); } catch (e) { }
}

render();
if (!session) openLogin('socio');
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!layers.length) render(); });
