'use strict';
/* Vistas del gym (administración): lista de socios, detalle, alta y mensajes. */

function vSocios() {
  const all = S.members.map(m => ({ m, s: stats(m) }));
  const filters = [['todos', 'Todos', () => true], ['activo', 'Activos', x => x.s.status === 'activo'], ['por vencer', 'Por vencer', x => x.s.status === 'por vencer'], ['vencido', 'Vencidos', x => x.s.status === 'vencido'], ['riesgo', 'En riesgo', x => x.s.risk]];
  const f = filters.find(x => x[0] === ui.socioFilter) || filters[0];
  const q = ui.socioQuery.trim().toLowerCase();
  const list = all.filter(f[2]).filter(x => !q || (x.m.name + ' ' + x.m.alias + ' ' + x.m.phone).toLowerCase().includes(q)).sort((a, b) => a.m.name.localeCompare(b.m.name));
  return `
  <section class="row between"><div><p class="eyebrow">${S.members.length} registrados</p><h1 class="h-display">Socios</h1></div>
    <button type="button" class="btn primary sm" data-act="addMember">${I.plus}Nuevo</button></section>
  <div class="search">${I.search}<input class="input" id="socioQ" type="search" placeholder="Buscar por nombre, apodo o teléfono" value="${esc(ui.socioQuery)}" data-input="socioQ" aria-label="Buscar socios"></div>
  <div class="chips">${filters.map(([k, l, fn]) => `<button type="button" class="chip" data-act="socioFilter" data-k="${k}" aria-pressed="${ui.socioFilter === k}">${l}<span class="n">${all.filter(fn).length}</span></button>`).join('')}</div>
  <section class="card" id="socioList" style="padding:4px 14px">
    ${list.length ? list.map(({ m, s }) => `<button type="button" class="list-item" data-act="member" data-id="${m.id}">${avatar(m)}<div class="grow"><p class="t">${esc(m.name)}</p><p class="s">${esc(planById(m.plan).name)} · ${s.last30} visitas en 30 días${s.risk ? ' · <span style="color:var(--warn)">sin venir ' + s.daysSince + ' días</span>' : ''}</p></div>${statusPill(s.status)}</button>`).join('') : '<p class="empty">Sin resultados.</p>'}
  </section>
  <button type="button" class="btn ghost block small" data-act="logout">${I.x}Cerrar sesión</button>`;
}

/* ---- Admin: detalle de socio ---- */
function heat(m) {
  const set = new Set(m.attendance.map(a => startOfDay(a).getTime()));
  let cells = '';
  for (let i = 34; i >= 0; i--) { const d = t0() - i * DAY; cells += `<i title="${fmtDate(d)}" style="display:block;aspect-ratio:1;border-radius:4px;background:${set.has(d) ? 'var(--lime)' : new Date(d).getDay() === 0 ? 'transparent' : 'var(--surface-3)'}"></i>`; }
  return `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:240px">${cells}</div>`;
}
function openMember(id) {
  const m = mById(id), st = stats(m);
  const l = sheet(`
    <div class="row">${avatar(m, '')}<div style="flex:1;min-width:0"><h3 class="h-sec">${esc(m.name)}</h3><p class="small muted">"${esc(m.alias)}" · ${esc(m.cat)} · ${esc(m.phone)}</p></div>${statusPill(st.status)}</div>
    <div class="grid3">
      <div class="stat-tile"><div class="l">30 días</div><div class="v num">${st.last30}</div></div>
      <div class="stat-tile"><div class="l">Racha</div><div class="v num">${m.streak}</div></div>
      <div class="stat-tile"><div class="l">Nivel</div><div class="v num">${st.lvl.level}</div></div>
    </div>
    <div><p class="eyebrow" style="margin-bottom:6px">Asistencia últimas 5 semanas</p>${heat(m)}</div>
    <div class="card small stack"><div class="row between"><span class="muted">Plan</span><b>${esc(planById(m.plan).name)} · ${money(planById(m.plan).price)}</b></div>
      <div class="row between"><span class="muted">Vence</span><b>${fmtDate(m.expires, { day: 'numeric', month: 'long', year: 'numeric' })}</b></div>
      <div class="row between"><span class="muted">Socio desde</span><b>${fmtDate(m.since, { month: 'long', year: 'numeric' })}</b></div>
      <div class="row between"><span class="muted">Última visita</span><b>${st.last ? relDays(st.last) : 'sin registro'}</b></div>
      <div class="row between"><span class="muted">Golpes</span><b class="num">${nf(m.coins)}</b></div>
    </div>
    <div class="grid2">
      <button type="button" class="btn primary" id="mdPay">${I.card}Registrar pago</button>
      <button type="button" class="btn" id="mdCi" ${st.checkedToday ? 'disabled' : ''}>${I.door}${st.checkedToday ? 'Ya entró hoy' : 'Check-in manual'}</button>
      <button type="button" class="btn" id="mdMsg">${I.msg}Mensaje</button>
      <button type="button" class="btn danger" id="mdDel">${I.trash}Dar de baja</button>
    </div>`);
  const el = l.el;
  $('#mdPay', el).onclick = () => { popLayer(); openMembership(m.id, true); };
  $('#mdCi', el).onclick = () => { const r = doCheckin(m.id, 'recepción'); popLayer(); render(); toast(r.expired ? 'Membresía vencida: registra un pago primero.' : `Entrada registrada: ${m.name}.`, r.expired ? '' : 'lime'); };
  $('#mdMsg', el).onclick = () => { popLayer(); openMsg(m.id); };
  $('#mdDel', el).onclick = () => confirmSheet('¿Dar de baja?', `Se eliminará a ${esc(m.name)} y su historial de esta demo.`, 'Dar de baja', () => {
    S.members = S.members.filter(x => x.id !== m.id); S.classes.forEach(c => { c.booked = c.booked.filter(b => b !== m.id); });
    if (S.me === m.id) S.me = S.members[0].id; save(); closeAll(); render(); toast('Socio dado de baja.');
  });
}
function openMsg(id) {
  const m = mById(id), st = stats(m);
  const txt = st.risk ? `¡Hola ${firstName(m.name)}! Te extrañamos en Contragolpe 🥊 Llevas ${st.daysSince} días sin venir y tu racha te espera. Esta semana tenemos Box técnico a las 7:00 y 19:00. ¿Te apartamos lugar?`
    : st.status !== 'activo' ? `¡Hola ${firstName(m.name)}! Tu membresía ${st.status === 'vencido' ? 'venció' : 'vence'} el ${fmtDate(m.expires, { day: 'numeric', month: 'long' })}. Renueva desde la app o en recepción y conserva tus golpes y tu racha 💪`
      : `¡Hola ${firstName(m.name)}! Gracias por entrenar en Contragolpe 🥊`;
  const phone = '52' + m.phone.replace(/\D/g, '');
  const l = sheet(`<h3 class="h-sec">Mensaje a ${esc(firstName(m.name))}</h3>
    <div class="field"><label for="msgT">Texto</label><textarea class="input" id="msgT" rows="5">${esc(txt)}</textarea></div>
    <div class="grid2"><button type="button" class="btn" id="msgCopy">${I.copy}Copiar</button><a class="btn primary" id="msgWa" href="https://wa.me/${phone}?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${I.msg}WhatsApp</a></div>
    <p class="small muted">Teléfono: ${esc(m.phone)}</p>`);
  const ta = $('#msgT', l.el);
  ta.oninput = () => { $('#msgWa', l.el).href = `https://wa.me/${phone}?text=${encodeURIComponent(ta.value)}`; };
  $('#msgCopy', l.el).onclick = async () => { try { await navigator.clipboard.writeText(ta.value); toast('Mensaje copiado.', 'lime'); } catch (e) { ta.select(); toast('Selecciona y copia el texto.'); } };
}
function openAddMember() {
  const l = sheet(`<h3 class="h-sec">Nuevo socio</h3><form id="amForm" class="stack">
    <div class="field"><label for="am_name">Nombre completo</label><input class="input" id="am_name" required maxlength="40" autofocus></div>
    <div class="grid2">
      <div class="field"><label for="am_alias">Apodo</label><input class="input" id="am_alias" maxlength="20" placeholder="Opcional"></div>
      <div class="field"><label for="am_phone">Teléfono</label><input class="input" id="am_phone" type="tel" required placeholder="33 1234 5678"></div>
      <div class="field"><label for="am_age">Edad</label><input class="input" id="am_age" type="number" min="6" max="90" required></div>
      <div class="field"><label for="am_w">Peso (kg)</label><input class="input" id="am_w" type="number" step="0.1" min="20" max="200" required></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="am_guard">Guardia</label><select class="input" id="am_guard"><option>Ortodoxa</option><option>Zurda</option></select></div>
      <div class="field"><label for="am_plan">Plan</label><select class="input" id="am_plan">${S.plans.map(p => `<option value="${p.id}" ${p.id === 'mensual' ? 'selected' : ''}>${esc(p.name)} · ${money(p.price)}</option>`).join('')}</select></div>
    </div>
    <button class="btn primary block" type="submit">${I.plus}Dar de alta y cobrar</button></form>`);
  $('#amForm', l.el).onsubmit = e => {
    e.preventDefault();
    const v = k => $('#am_' + k, l.el).value.trim();
    const plan = planById(v('plan')), w = Number(v('w'));
    const id = 'm' + Date.now().toString(36);
    const now = new Date().toISOString();
    S.members.push({ id, name: v('name'), alias: v('alias') || firstName(v('name')), age: Number(v('age')), nat: 'México', weight: w, cat: categoryFor(w), expYears: 0, guard: v('guard'), reach: 170, height: 170, plan: plan.id, since: now, expires: new Date(Date.now() + plan.days * DAY).toISOString(), phone: v('phone'), xp: 0, coins: 100, streak: 0, attendance: [], totalSessions: 0, rounds: 0, spar: { w: 0, l: 0, d: 0 }, weightLog: [{ d: now, kg: w }], photo: null, videos: [], notes: '' });
    S.payments.push({ id: uid('p'), memberId: id, amount: plan.price, plan: plan.id, ts: now, method: 'Efectivo' });
    save(); popLayer(); render(); toast(`${v('name')} dado de alta. Recibe 100 golpes de bienvenida.`, 'lime');
  };
}
