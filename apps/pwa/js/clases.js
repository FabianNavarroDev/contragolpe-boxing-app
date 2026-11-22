'use strict';
/* Clases: horario semanal, reservas con lista de espera y agenda del gym. */

function nextClassFor(memberId) {
  const now = new Date();
  for (let off = 0; off < 7; off++) {
    const day = (now.getDay() + off) % 7;
    const list = S.classes.filter(c => c.day === day && c.booked.includes(memberId)).sort((a, b) => a.time.localeCompare(b.time));
    for (const c of list) {
      const [hh, mm] = c.time.split(':').map(Number);
      const when = new Date(t0() + off * DAY); when.setHours(hh, mm);
      if (when > now) return { c, when };
    }
  }
  return null;
}

function vClases() {
  const m = me();
  const todayDow = new Date().getDay();
  if (ui.classDay == null) ui.classDay = todayDow === 0 ? 1 : todayDow;
  const days = [1, 2, 3, 4, 5, 6].map(d => {
    const off = (d - todayDow + 7) % 7; const date = new Date(t0() + off * DAY);
    return `<button type="button" data-act="classDay" data-d="${d}" aria-pressed="${ui.classDay === d}"><span>${DOW[d]}</span><b class="num">${date.getDate()}</b></button>`;
  }).join('');
  const list = S.classes.filter(c => c.day === ui.classDay).sort((a, b) => a.time.localeCompare(b.time));
  const mine = S.classes.filter(c => c.booked.includes(m.id)).length;
  return `
    <section><p class="eyebrow">Horario semanal</p><h1 class="h-display">Clases</h1></section>
    <div class="days">${days}</div>
    <p class="small muted">${mine} clase${mine === 1 ? '' : 's'} reservada${mine === 1 ? '' : 's'} esta semana. Reserva hasta 1 h antes; si se llena, entras a lista de espera.</p>
    <section class="stack">
      ${list.length ? list.map(c => {
        const booked = c.booked.includes(m.id), waiting = c.wait.includes(m.id), full = c.booked.length >= c.cap;
        const pct = c.booked.length / c.cap;
        return `<article class="card class-card">
          <div class="class-time num">${c.time}<small>${c.dur} min</small></div>
          <div class="stack">
            <div class="row between"><p class="name">${esc(c.name)}</p>${booked ? '<span class="pill lime">Reservada</span>' : waiting ? '<span class="pill warn">En espera</span>' : full ? '<span class="pill danger">Llena</span>' : ''}</div>
            <p class="small muted">${esc(c.coach)} · ${esc(c.level)}</p>
            <div class="row"><div class="bar ${pct >= 1 ? 'danger' : pct > .8 ? 'warn' : ''}" style="flex:1"><i style="width:${Math.min(100, pct * 100)}%"></i></div><span class="small num">${c.booked.length}/${c.cap}</span></div>
            <button type="button" class="btn sm ${booked || waiting ? '' : 'primary'}" data-act="book" data-id="${c.id}">${booked ? 'Cancelar reserva' : waiting ? 'Salir de la espera' : full ? 'Unirme a lista de espera' : 'Reservar lugar'}</button>
          </div></article>`;
      }).join('') : '<div class="card empty">No hay clases este día.</div>'}
    </section>`;
}

function vAgenda() {
  const todayDow = new Date().getDay();
  if (ui.agendaDay == null) ui.agendaDay = todayDow === 0 ? 1 : todayDow;
  const list = S.classes.filter(c => c.day === ui.agendaDay).sort((a, b) => a.time.localeCompare(b.time));
  const totalCap = S.classes.reduce((a, c) => a + c.cap, 0), totalB = S.classes.reduce((a, c) => a + c.booked.length, 0);
  return `
  <section class="row between"><div><p class="eyebrow">Ocupación semanal ${Math.round(totalB / totalCap * 100)}%</p><h1 class="h-display">Agenda</h1></div>
    <button type="button" class="btn primary sm" data-act="addClass">${I.plus}Clase</button></section>
  <div class="days">${[1, 2, 3, 4, 5, 6].map(d => `<button type="button" data-act="agendaDay" data-d="${d}" aria-pressed="${ui.agendaDay === d}"><span>${DOW[d]}</span><b>${S.classes.filter(c => c.day === d).length}</b></button>`).join('')}</div>
  <section class="stack">${list.length ? list.map(c => {
    const pct = c.booked.length / c.cap;
    return `<button type="button" class="card class-card" style="text-align:left;width:100%" data-act="classRoster" data-id="${c.id}">
      <div class="class-time num">${c.time}<small>${c.dur} min</small></div>
      <div class="stack"><div class="row between"><p class="name">${esc(c.name)}</p><span class="small num">${c.booked.length}/${c.cap}</span></div>
      <p class="small muted">${esc(c.coach)} · ${esc(c.level)}${c.wait.length ? ' · ' + c.wait.length + ' en espera' : ''}</p>
      <div class="bar ${pct >= 1 ? 'danger' : pct > .8 ? 'warn' : ''}"><i style="width:${Math.min(100, pct * 100)}%"></i></div></div></button>`;
  }).join('') : '<div class="card empty">No hay clases programadas.</div>'}</section>`;
}

function openAddClass() {
  const l = sheet(`<h3 class="h-sec">Nueva clase</h3><form id="acForm" class="stack">
    <div class="field"><label for="ac_n">Nombre</label><input class="input" id="ac_n" required maxlength="30" placeholder="Ej. Box técnico"></div>
    <div class="grid2">
      <div class="field"><label for="ac_c">Coach</label><input class="input" id="ac_c" required maxlength="25" placeholder="Coach Memo"></div>
      <div class="field"><label for="ac_d">Día</label><select class="input" id="ac_d">${[1, 2, 3, 4, 5, 6].map(d => `<option value="${d}" ${d === ui.agendaDay ? 'selected' : ''}>${DOW[d]}</option>`).join('')}</select></div>
      <div class="field"><label for="ac_t">Hora</label><input class="input" id="ac_t" type="time" value="19:00" required></div>
      <div class="field"><label for="ac_cap">Cupo</label><input class="input" id="ac_cap" type="number" min="1" max="60" value="16" required></div>
      <div class="field"><label for="ac_dur">Duración (min)</label><input class="input" id="ac_dur" type="number" min="15" max="180" step="15" value="60" required></div>
      <div class="field"><label for="ac_l">Nivel</label><select class="input" id="ac_l"><option>Todos</option><option>Principiante</option><option>Intermedio+</option><option>Niños 8–14</option></select></div>
    </div>
    <button class="btn primary block" type="submit">${I.plus}Agregar al horario</button></form>`);
  $('#acForm', l.el).onsubmit = e => {
    e.preventDefault(); const v = k => $('#ac_' + k, l.el).value.trim();
    S.classes.push({ id: uid('k'), name: v('n'), coach: v('c'), day: Number(v('d')), time: v('t'), dur: Number(v('dur')), cap: Number(v('cap')), level: v('l'), booked: [], wait: [] });
    ui.agendaDay = Number(v('d')); save(); popLayer(); render(); toast('Clase agregada. Ya aparece en la app de los socios.', 'lime');
  };
}
function openRoster(id) {
  const c = S.classes.find(x => x.id === id);
  const l = sheet(`<div class="row between"><div><p class="eyebrow">${DOW[c.day]} ${c.time} · ${esc(c.coach)}</p><h3 class="h-sec">${esc(c.name)}</h3></div><span class="pill plain num">${c.booked.length}/${c.cap}</span></div>
    <div class="list">${c.booked.length ? c.booked.map(b => { const m = mById(b); return m ? `<div class="list-item">${avatar(m)}<div class="grow"><p class="t">${esc(m.name)}</p><p class="s">${stats(m).checkedToday ? 'Ya llegó hoy' : 'Reservado'}</p></div></div>` : ''; }).join('') : '<p class="empty">Sin reservas.</p>'}</div>
    ${c.wait.length ? `<p class="eyebrow">Lista de espera</p><div class="list">${c.wait.map(b => { const m = mById(b); return m ? `<div class="list-item">${avatar(m)}<div class="grow"><p class="t">${esc(m.name)}</p></div></div>` : ''; }).join('')}</div>` : ''}
    <button type="button" class="btn danger block" id="rDel">${I.trash}Eliminar clase</button>`);
  $('#rDel', l.el).onclick = () => confirmSheet('¿Eliminar clase?', `Se avisará a ${c.booked.length} socios con reserva.`, 'Eliminar', () => { S.classes = S.classes.filter(x => x.id !== id); save(); closeAll(); render(); toast('Clase eliminada.'); });
}
