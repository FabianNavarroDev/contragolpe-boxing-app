'use strict';
/* Vistas del socio: pantalla de inicio y membresía (pagos y renovación). */

function vInicio() {
  const m = me(), st = stats(m), lv = st.lvl;
  const todayTxt = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const lastToday = st.checkedToday ? fmtTime(st.last) : null;
  return `
  <section class="hello">
    <div><p class="eyebrow">${esc(todayTxt)}</p><h1 class="h-display">Hola, <em>${esc(firstName(m.name))}</em></h1></div>
    <button type="button" class="avatar" data-act="go" data-r="perfil" aria-label="Ver mi ficha">${m.photo ? `<img src="${m.photo}" alt="">` : initials(m.name)}</button>
  </section>

  <section class="card stack">
    <p class="eyebrow lime">Tu membresía</p>
    <div class="row" style="flex-wrap:wrap;gap:6px">${statusPill(st.status)}<span class="pill plain">${esc(planById(m.plan).name)} · ${st.daysLeft >= 0 ? 'vence ' + relDays(m.expires) : 'venció ' + relDays(m.expires)}</span></div>
    <p class="small muted">${st.last ? 'Última visita registrada ' + relDays(st.last) + '.' : 'Aún no hay visitas registradas.'}</p>
  </section>

  <section class="quick" aria-label="Accesos rápidos">
    <button type="button" data-act="membership">${I.card}Membresía</button>
  </section>

  <section class="grid2">
    <div class="stat-tile"><div class="l">Este mes</div><div class="v num">${st.monthAttendance}<small>sesiones</small></div></div>
    <div class="stat-tile"><div class="l">Rounds mes</div><div class="v num">${nf(st.monthRounds)}<small>rds</small></div></div>
  </section>




  <button type="button" class="btn ghost block small" data-act="logout">${I.x}Cerrar sesión</button>
  `;
}

// ---- Membresía ----
function openMembership(memberId, adminMode) {
  const m = memberId ? mById(memberId) : me();
  const st = stats(m);
  const pays = S.payments.filter(p => p.memberId === m.id).sort((a, b) => b.ts.localeCompare(a.ts));
  let plan = m.plan, method = 'Tarjeta';
  const l = sheet(`
    <div class="row between"><div><p class="eyebrow">Membresía</p><h3 class="h-sec">${esc(m.name)}</h3></div>${statusPill(st.status)}</div>
    <p class="muted">Plan ${esc(planById(m.plan).name)} · ${st.daysLeft >= 0 ? 'vence' : 'venció'} el ${fmtDate(m.expires, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <div class="field"><label>Renovar con</label><div class="chips" id="planChips">${S.plans.filter(p => p.id !== 'visita').map(p => `<button type="button" class="chip" data-p="${p.id}" aria-pressed="${p.id === plan}">${esc(p.name)} · ${money(p.price)}</button>`).join('')}</div></div>
    <div class="field"><label>Método de pago</label><div class="seg" id="paySeg">${['Tarjeta', 'Efectivo', 'Transferencia'].map(x => `<button type="button" data-m="${x}" aria-pressed="${x === method}">${x}</button>`).join('')}</div></div>
    <button type="button" class="btn primary block" id="payBtn"></button>
    ${adminMode ? '' : '<p class="small muted">Demo: el cobro con tarjeta se conecta a Stripe o Mercado Pago en producción.</p>'}
    <div><p class="eyebrow">Historial de pagos</p><div class="list">${pays.length ? pays.slice(0, 6).map(p => `<div class="list-item"><div class="grow"><p class="t">${esc(planById(p.plan).name)}</p><p class="s">${fmtDate(p.ts, { day: 'numeric', month: 'short', year: 'numeric' })} · ${esc(p.method || '')}</p></div><b class="num">${money(p.amount)}</b></div>`).join('') : '<p class="empty">Sin pagos registrados.</p>'}</div></div>`);
  const el = l.el;
  const upd = () => { const p = planById(plan); $('#payBtn', el).innerHTML = `${I.card}${adminMode ? 'Registrar pago' : 'Pagar'} ${money(p.price)}`; };
  upd();
  $$('#planChips .chip', el).forEach(b => b.onclick = () => { plan = b.dataset.p; $$('#planChips .chip', el).forEach(x => x.setAttribute('aria-pressed', x === b)); upd(); });
  $$('#paySeg button', el).forEach(b => b.onclick = () => { method = b.dataset.m; $$('#paySeg button', el).forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('#payBtn', el).onclick = () => {
    const p = planById(plan);
    const base = Math.max(Date.now(), new Date(m.expires).getTime());
    m.expires = new Date(base + p.days * DAY).toISOString(); m.plan = plan;
    S.payments.push({ id: uid('p'), memberId: m.id, amount: p.price, plan, ts: new Date().toISOString(), method });
    save(); popLayer(); render();
    toast(`Pago de ${money(p.price)} registrado. Vigente hasta ${fmtDate(m.expires, { day: 'numeric', month: 'long' })}.`, 'lime');
  };
}
