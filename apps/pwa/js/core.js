'use strict';

/* Contragolpe Boxing App — núcleo: iconos, utilidades, estado, reglas, capas, gráficas y router.
   Vanilla JS (PWA), sin build. Estado local en localStorage (modo demostración). */
const { buildSeed, categoryFor, DAY, startOfDay, uid, mulberry32 } = window.CG_DATA;

/* ================= Iconos ================= */
const P = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3M12 13v4M9 21h6M10 17h4v4h-4z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8c-2-4-6-4-6-1 0 1 1 1 6 1zM12 8c2-4 6-4 6-1 0 1-1 1-6 1z"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 21h4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c1-4 4-6 7-6s6 2 7 6M16 4a4 4 0 0 1 0 8M22 21c-.5-3-2-5-4-5.5"/>',
  mega: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM17 8a5 5 0 0 1 0 8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  check: '<path d="M5 12l5 5 9-11"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-6 1-9z"/>',
  glove: '<path d="M7 10V7a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v6a5 5 0 0 1-5 5h-2l-1 3H7v-5a3 3 0 0 1-2-3 2 2 0 0 1 2-3zM10 10h5"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  water: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  shirt: '<path d="M8 3L3 6l2 5 3-1v11h8V10l3 1 2-5-5-3c-1 2-2.5 3-4 3S9 5 8 3z"/>',
  wrap: '<rect x="4" y="6" width="16" height="12" rx="6"/><path d="M8 6v12M12 6v12M16 6v12"/>',
  ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 7v10"/>',
  cap: '<path d="M3 15a9 7 0 0 1 18 0zM21 15h-6M12 8V6"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
  rotate: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  msg: '<path d="M4 5h16v11H8l-4 4z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8 3l4 6 4-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  swords: '<path d="M14 4h6v6L9 21l-3-3zM10 4H4v6l3 3M15 15l3 3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  upload: '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  drag: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M4 12h16"/>',
  scale: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 9a5 5 0 0 1 8 0l-3 3"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
  door: '<path d="M14 3H5v18h9M10 12h11M17 8l4 4-4 4"/>'
};
const I = new Proxy({}, { get: (_, k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || ''}</svg>` });

/* ================= Utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + Math.round(n).toLocaleString('es-MX');
const nf = n => Math.round(n).toLocaleString('es-MX');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const t0 = () => startOfDay(Date.now()).getTime();
const fmtDate = (d, o) => new Date(d).toLocaleDateString('es-MX', o || { day: 'numeric', month: 'short' });
const fmtTime = d => new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DOW1 = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const firstName = n => n.split(' ')[0];
function relDays(d) {
  const diff = Math.round((startOfDay(d).getTime() - t0()) / DAY);
  if (diff === 0) return 'hoy'; if (diff === -1) return 'ayer'; if (diff === 1) return 'mañana';
  return diff < 0 ? `hace ${-diff} días` : `en ${diff} días`;
}
const isNative = () => { try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) { return false; } };
const bus = new EventTarget();
const emit = (t, d) => bus.dispatchEvent(new CustomEvent(t, { detail: d }));
const on = (t, f) => { bus.addEventListener(t, f); return () => bus.removeEventListener(t, f); };

/* ================= Estado ================= */
const KEY = 'contragolpe_app_v3';
let S = load();
const ui = { classDay: null, retosTab: 'retos', rankMetric: 'monthAttendance', socioFilter: 'todos', socioQuery: '', agendaDay: null, fighterMode: 'video', liveSim: true };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const p = JSON.parse(raw); if (p && p.version === 3) return p; }
  } catch (e) { /* almacenamiento no disponible */ }
  return buildSeed();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) {
    try {
      const copy = JSON.parse(JSON.stringify(S));
      copy.members.forEach(m => { m.videos = []; });
      localStorage.setItem(KEY, JSON.stringify(copy));
      if (!save.warned) { toast('Los videos quedan solo en esta sesión: el almacenamiento del navegador está lleno.'); save.warned = true; }
    } catch (e2) { /* sin almacenamiento */ }
  }
}
function resetDemo() {
  try { localStorage.removeItem(KEY); } catch (e) { }
  S = buildSeed(); closeAll(); location.hash = 'inicio'; render(); toast('Demo reiniciada con datos de ejemplo.', 'lime');
}

const me = () => S.members.find(m => m.id === S.me);
const mById = id => S.members.find(m => m.id === id);
const planById = id => S.plans.find(p => p.id === id) || { name: id, price: 0, days: 30 };

/* ================= Reglas de negocio ================= */
const LEVELS = [[3, 'Novato'], [6, 'Amateur'], [9, 'Contendiente'], [13, 'Retador'], [18, 'Campeón'], [999, 'Leyenda']];
function levelOf(xp) {
  const level = Math.floor(Math.sqrt(xp / 150)) + 1;
  const base = 150 * (level - 1) ** 2, next = 150 * level ** 2;
  const title = LEVELS.find(([max]) => level <= max)[1];
  return { level, title, base, next, pct: (xp - base) / (next - base), toNext: next - xp };
}
function monthStart() { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); }

function stats(m) {
  const ms = monthStart(), today = t0();
  const att = m.attendance.map(a => new Date(a).getTime()).sort((a, b) => a - b);
  const monthAtt = att.filter(d => d >= ms);
  const avgR = m.totalSessions ? m.rounds / m.totalSessions : 6;
  const timerMonth = (m.roundLog || []).filter(r => new Date(r.ts).getTime() >= ms).reduce((a, r) => a + r.n, 0);
  const last = att.length ? att[att.length - 1] : null;
  const daysSince = last ? Math.round((today - startOfDay(last).getTime()) / DAY) : 999;
  const daysLeft = Math.ceil((new Date(m.expires).getTime() - Date.now()) / DAY);
  const status = daysLeft < 0 ? 'vencido' : daysLeft <= 7 ? 'por vencer' : 'activo';
  return {
    monthAttendance: monthAtt.length,
    monthRounds: Math.round(monthAtt.length * avgR) + timerMonth,
    early: monthAtt.filter(d => new Date(d).getHours() < 8).length,
    last, daysSince, checkedToday: daysSince === 0, daysLeft, status,
    risk: status !== 'vencido' && daysSince >= 10,
    last30: att.filter(d => d >= today - 30 * DAY).length,
    lvl: levelOf(m.xp), avgR, att
  };
}
const statusPill = st => `<span class="pill ${st === 'activo' ? 'ok' : st === 'por vencer' ? 'warn' : 'danger'}">${st}</span>`;

const avatar = (m, cls) => `<span class="avatar ${cls || 'alt'}">${m.photo ? `<img src="${m.photo}" alt="">` : initials(m.name)}</span>`;

/* ================= Capas (hojas, pantallas completas) ================= */
const app = $('#app');
const layers = [];
function pushLayer(html) {
  const el = document.createElement('div');
  el.className = 'overlay open';
  el.innerHTML = html;
  app.appendChild(el);
  const layer = { el, cleanups: [] };
  layers.push(layer);
  const f = el.querySelector('[autofocus]'); if (f) setTimeout(() => f.focus(), 50);
  return layer;
}
function popLayer() { const l = layers.pop(); if (!l) return; l.cleanups.forEach(f => { try { f(); } catch (e) { } }); l.el.remove(); }
function closeAll() { while (layers.length) popLayer(); }
const sheet = html => pushLayer(`<div class="sheet-backdrop" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`);
const full = (title, body, right) => pushLayer(`<div class="full" role="dialog" aria-modal="true"><div class="full-head"><button type="button" class="icon-btn" data-act="close" aria-label="Cerrar">${I.back}</button><h2>${title}</h2>${right || ''}</div><div class="full-body">${body}</div></div>`);
function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.innerHTML = (kind === 'lime' ? I.check : I.bell) + `<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3200);
}
function confirmSheet(title, body, okLabel, onOk) {
  sheet(`<h3 class="h-sec">${title}</h3><p class="muted">${body}</p><div class="grid2"><button type="button" class="btn" data-act="close">Cancelar</button><button type="button" class="btn primary" id="cfOk">${okLabel}</button></div>`);
  const l = layers[layers.length - 1];
  $('#cfOk', l.el).onclick = () => { popLayer(); onOk(); };
}

/* ================= Gráficas en canvas ================= */
function sizeCanvas(c, h) {
  const dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth || c.parentElement.clientWidth || 300;
  c.style.height = h + 'px';
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
function drawChart(c, cfg) {
  if (!c) return;
  const { ctx, w, h } = sizeCanvas(c, cfg.height || 160);
  const padL = 34, padR = 10, padT = 10, padB = 22;
  const all = cfg.series.flatMap(s => s.data);
  let max = Math.max(1, ...all), min = cfg.min != null ? cfg.min : 0;
  if (cfg.autoMin) { min = Math.min(...all); const span = max - min || 1; min -= span * 0.25; max += span * 0.15; }
  const n = cfg.labels.length;
  const X = i => padL + (cfg.type === 'bar' ? ((i + 0.5) * (w - padL - padR) / n) : (n === 1 ? (w - padL - padR) / 2 : i * (w - padL - padR) / (n - 1)));
  const Y = v => padT + (1 - (v - min) / (max - min || 1)) * (h - padT - padB);
  ctx.font = '600 11px "Barlow Condensed", sans-serif';
  ctx.textBaseline = 'middle';
  for (let k = 0; k <= 3; k++) {
    const v = min + (max - min) * k / 3, y = Y(v);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.fillStyle = '#8f9887'; ctx.textAlign = 'right';
    ctx.fillText(cfg.yFmt ? cfg.yFmt(v) : (Math.round(v * 10) / 10).toString(), padL - 6, y);
  }
  const step = Math.ceil(n / (cfg.maxLabels || 7));
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  cfg.labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) { ctx.fillStyle = '#8f9887'; ctx.fillText(l, X(i), h - padB + 7); } });
  cfg.series.forEach((s, si) => {
    if (cfg.type === 'bar') {
      const bw = Math.max(2, (w - padL - padR) / n * 0.62);
      s.data.forEach((v, i) => {
        ctx.fillStyle = i === n - 1 ? s.color : (s.dim || s.color);
        const y = Y(v), x = X(i) - bw / 2;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, bw, Y(min) - y, [3, 3, 0, 0]); else ctx.rect(x, y, bw, Y(min) - y); ctx.fill();
      });
    } else {
      if (s.fill) {
        const g = ctx.createLinearGradient(0, padT, 0, h - padB);
        g.addColorStop(0, s.fill); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X(0), Y(min));
        s.data.forEach((v, i) => ctx.lineTo(X(i), Y(v))); ctx.lineTo(X(s.data.length - 1), Y(min)); ctx.fill();
      }
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2.5; ctx.lineJoin = 'round'; ctx.setLineDash(s.dash || []);
      ctx.beginPath(); s.data.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))); ctx.stroke(); ctx.setLineDash([]);
      const li = s.data.length - 1;
      ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(X(li), Y(s.data[li]), 4.5, 0, 7); ctx.fill();
      ctx.strokeStyle = '#090a08'; ctx.lineWidth = 2; ctx.stroke();
      if (cfg.endLabels) {
        ctx.font = '700 12px "Barlow Condensed", sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillStyle = s.color; ctx.fillText(cfg.endLabels[si], X(li) - 7, Y(s.data[li]) - 5);
        ctx.font = '600 11px "Barlow Condensed", sans-serif';
      }
    }
  });
}


/* ================= Router ================= */

let viewCleanups = [];
let mounts = [];
const mount = f => mounts.push(f);
function currentRoute() {
  const h = (location.hash || '').slice(1);
  return ROUTES[h] ? h : firstRoute(S.role);
}
const firstRoute = role => Object.keys(ROUTES).find(k => ROUTES[k].role === role);
function go(r) { if (location.hash.slice(1) === r) render(); else location.hash = r; }
function render() {
  viewCleanups.forEach(f => { try { f(); } catch (e) { } }); viewCleanups = [];
  const r = currentRoute(), route = ROUTES[r];
  S.role = route.role;
  $('#roleSocio').setAttribute('aria-pressed', S.role === 'socio');
  $('#roleAdmin').setAttribute('aria-pressed', S.role === 'admin');
  $('#brandSub').textContent = S.role === 'admin' ? 'Panel del gym' : 'Boxing Gym';
  const top = $('#topAction');
  top.style.visibility = '';
  if (S.role === 'socio' && ACTIONS.notices) {
    const unread = S.notices.filter(n => !S.readNotices.includes(n.id)).length;
    top.innerHTML = I.bell + (unread ? '<span class="dot-badge"></span>' : '');
    top.dataset.act = 'notices'; top.setAttribute('aria-label', 'Avisos del gym');
  } else if (S.role === 'admin' && ACTIONS.kiosk) {
    top.innerHTML = I.qr; top.dataset.act = 'kiosk'; top.setAttribute('aria-label', 'Abrir kiosco de check-in');
  } else { top.innerHTML = ''; top.removeAttribute('data-act'); top.style.visibility = 'hidden'; }
  $('#tabbar').innerHTML = Object.entries(ROUTES).filter(([, v]) => v.role === S.role).map(([k, v]) =>
    `<button type="button" data-act="go" data-r="${k}" ${k === r ? 'aria-current="page"' : ''}>${I[v.icon]}<span>${v.label}</span></button>`).join('');
  mounts = [];
  const view = $('#view');
  const locked = !canEnter(S.role);
  view.innerHTML = locked ? lockedView(S.role) : route.render();
  if (locked) mounts = [];
  if (render.lastRoute !== r) view.scrollTop = 0;
  render.lastRoute = r;
  const ms = mounts; mounts = []; ms.forEach(f => f());
}
window.addEventListener('hashchange', () => { closeAll(); render(); });
