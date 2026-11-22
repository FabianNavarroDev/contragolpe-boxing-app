'use strict';
/* Acceso: registro e inicio de sesión (historia #1).
   Prototipo: la sesión se guarda en el navegador. El socio entra con su teléfono y el gym con un PIN.
   En producción esto se conecta a un servicio de autenticación (Supabase Auth o Firebase Auth). */
const SESSION_KEY = 'contragolpe_session';
const GYM_PIN = '2026'; // PIN de demostración del panel del gym
let session = loadSession();

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
}
function saveSession() {
  try { session ? localStorage.setItem(SESSION_KEY, JSON.stringify(session)) : localStorage.removeItem(SESSION_KEY); } catch (e) { }
}
const onlyDigits = s => String(s || '').replace(/\D/g, '');

/* ¿La sesión actual permite entrar a la vista de este rol? */
function canEnter(role) {
  if (!session) return false;
  if (role === 'admin') return !!session.admin;
  if (session.socio && mById(session.socio)) { S.me = session.socio; return true; }
  return false;
}

function lockedView(role) {
  return `<section class="card empty stack" style="text-align:center">
    <p class="h-sec">${role === 'admin' ? 'Panel del gym' : 'App del socio'}</p>
    <p class="small muted">Inicia sesión para continuar.</p>
    <button type="button" class="btn primary block" data-act="login" data-r="${role}">${I.user}Iniciar sesión</button>
  </section>`;
}

function openLogin(role) {
  closeAll();
  let tab = role === 'admin' ? 'admin' : 'socio';
  const demo = S.members[0];
  const l = pushLayer(`<div class="full" role="dialog" aria-modal="true" aria-label="Iniciar sesión">
    <div class="full-head"><h2>Contragolpe</h2></div>
    <div class="full-body">
      <section><p class="eyebrow lime">Bienvenido</p><h1 class="h-display">Inicia sesión</h1></section>
      <div class="seg" role="group" aria-label="Tipo de acceso" id="lgTabs">
        <button type="button" data-t="socio">Soy socio</button><button type="button" data-t="admin">Soy del gym</button>
      </div>
      <form id="lgSocio" class="card stack">
        <div class="field"><label for="lgPhone">Teléfono registrado</label><input class="input num" id="lgPhone" type="tel" required placeholder="33 1234 5678" autocomplete="tel"></div>
        <button class="btn primary block" type="submit">${I.check}Entrar</button>
        <p class="small muted">Demo: prueba con ${esc(demo.phone)} (${esc(demo.name)}).</p>
        <button type="button" class="btn ghost block" id="lgNew">${I.plus}Soy nuevo: crear mi cuenta</button>
      </form>
      <form id="lgAdmin" class="card stack" hidden>
        <div class="field"><label for="lgPin">PIN del gym</label><input class="input num" id="lgPin" type="password" inputmode="numeric" maxlength="8" required></div>
        <button class="btn primary block" type="submit">${I.check}Entrar al panel</button>
        <p class="small muted">Demo: el PIN es ${GYM_PIN}.</p>
      </form>
      <p class="small muted" id="lgMsg" role="alert"></p>
    </div></div>`);
  const el = l.el, msg = t => { $('#lgMsg', el).textContent = t; };
  const setTab = t => {
    tab = t; msg('');
    $$('#lgTabs button', el).forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t));
    $('#lgSocio', el).hidden = t !== 'socio'; $('#lgAdmin', el).hidden = t !== 'admin';
  };
  $$('#lgTabs button', el).forEach(b => b.onclick = () => setTab(b.dataset.t));
  setTab(tab);
  $('#lgSocio', el).onsubmit = e => {
    e.preventDefault();
    const ph = onlyDigits($('#lgPhone', el).value);
    const m = S.members.find(x => onlyDigits(x.phone) === ph);
    if (!m) { msg('No encontramos ese teléfono. Revisa el número o crea tu cuenta.'); return; }
    session = Object.assign({}, session, { socio: m.id }); saveSession();
    closeAll(); go(firstRoute('socio')); toast(`¡Bienvenido, ${firstName(m.name)}!`, 'lime');
  };
  $('#lgAdmin', el).onsubmit = e => {
    e.preventDefault();
    if ($('#lgPin', el).value !== GYM_PIN) { msg('PIN incorrecto.'); return; }
    session = Object.assign({}, session, { admin: true }); saveSession();
    closeAll(); go(firstRoute('admin')); toast('Sesión del gym iniciada.', 'lime');
  };
  $('#lgNew', el).onclick = openRegister;
}

/* Registro del socio desde la app: la cuenta nace sin membresía activa y se activa al pagar. */
function openRegister() {
  const l = sheet(`<h3 class="h-sec">Crear mi cuenta</h3><form id="rgForm" class="stack">
    <div class="field"><label for="rg_name">Nombre completo</label><input class="input" id="rg_name" required maxlength="40" autofocus></div>
    <div class="grid2">
      <div class="field"><label for="rg_alias">Apodo</label><input class="input" id="rg_alias" maxlength="20" placeholder="Opcional"></div>
      <div class="field"><label for="rg_phone">Teléfono</label><input class="input" id="rg_phone" type="tel" required placeholder="33 1234 5678"></div>
      <div class="field"><label for="rg_age">Edad</label><input class="input" id="rg_age" type="number" min="6" max="90" required></div>
      <div class="field"><label for="rg_w">Peso (kg)</label><input class="input" id="rg_w" type="number" step="0.1" min="20" max="200" required></div>
    </div>
    <div class="field"><label for="rg_guard">Guardia</label><select class="input" id="rg_guard"><option>Ortodoxa</option><option>Zurda</option></select></div>
    <p class="small muted" id="rgMsg" role="alert"></p>
    <button class="btn primary block" type="submit">${I.plus}Crear cuenta</button></form>`);
  $('#rgForm', l.el).onsubmit = e => {
    e.preventDefault();
    const v = k => $('#rg_' + k, l.el).value.trim();
    const ph = onlyDigits(v('phone'));
    if (ph.length < 10) { $('#rgMsg', l.el).textContent = 'El teléfono debe tener 10 dígitos.'; return; }
    if (S.members.some(x => onlyDigits(x.phone) === ph)) { $('#rgMsg', l.el).textContent = 'Ese teléfono ya tiene cuenta. Inicia sesión.'; return; }
    const w = Number(v('w')), now = new Date().toISOString(), id = 'm' + Date.now().toString(36);
    S.members.push({ id, name: v('name'), alias: v('alias') || firstName(v('name')), age: Number(v('age')), nat: 'México', weight: w, cat: categoryFor(w), expYears: 0, guard: v('guard'), reach: 170, height: 170, plan: 'mensual', since: now, expires: now, phone: v('phone'), xp: 0, coins: 100, streak: 0, attendance: [], totalSessions: 0, rounds: 0, spar: { w: 0, l: 0, d: 0 }, weightLog: [{ d: now, kg: w }], photo: null, videos: [], notes: '' });
    save();
    session = Object.assign({}, session, { socio: id }); saveSession();
    closeAll(); go(firstRoute('socio'));
    toast('Cuenta creada. Activa tu membresía desde "Membresía".', 'lime');
  };
}

function logout() {
  confirmSheet('¿Cerrar sesión?', 'Tendrás que volver a entrar con tu teléfono o el PIN del gym.', 'Cerrar sesión', () => {
    session = null; saveSession(); openLogin(S.role);
  });
}
