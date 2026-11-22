'use strict';
/* Panel del gym: métricas, asistencia, ingresos, riesgo de abandono, avisos y configuración. */

function dailySeries(days, fn) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) { const d = t0() - i * DAY; out.push({ d, v: fn(d, d + DAY) }); }
  return out;
}
function vAdmin() {
  const today = t0();
  const active = S.members.filter(m => stats(m).status !== 'vencido');
  const ciToday = S.checkins.filter(c => new Date(c.ts).getTime() >= today);
  const ser = dailySeries(30, (a, b) => S.checkins.filter(c => { const t = new Date(c.ts).getTime(); return t >= a && t < b; }).length);
  const opened = ser.filter(s => new Date(s.d).getDay() !== 0 && s.d !== today);
  const avg = opened.reduce((a, s) => a + s.v, 0) / (opened.length || 1);
  const ms = monthStart();
  const prevMs = new Date(ms); prevMs.setMonth(prevMs.getMonth() - 1);
  const dayOfMonth = new Date().getDate();
  const revMonth = S.payments.filter(p => new Date(p.ts).getTime() >= ms).reduce((a, p) => a + p.amount, 0);
  const revPrev = S.payments.filter(p => { const t = new Date(p.ts); return t.getTime() >= prevMs.getTime() && t.getTime() < ms && t.getDate() <= dayOfMonth; }).reduce((a, p) => a + p.amount, 0);
  const delta = revPrev ? (revMonth - revPrev) / revPrev : 0;
  const expiring = S.members.filter(m => { const s = stats(m); return s.status === 'por vencer'; });
  const risk = S.members.filter(m => stats(m).risk).sort((a, b) => stats(b).daysSince - stats(a).daysSince);
  const hours = new Array(16).fill(0);
  S.checkins.filter(c => new Date(c.ts).getTime() >= today - 30 * DAY).forEach(c => { const h = new Date(c.ts).getHours() - 6; if (h >= 0 && h < 16) hours[h]++; });
  const hmax = Math.max(...hours, 1);
  const revSer = dailySeries(30, (a, b) => S.payments.filter(p => { const t = new Date(p.ts).getTime(); return t >= a && t < b; }).reduce((x, p) => x + p.amount, 0));
  mount(() => {
    drawChart($('#ciChart'), { type: 'bar', height: 150, labels: ser.map(s => String(new Date(s.d).getDate())), series: [{ data: ser.map(s => s.v), color: '#c8ff2e', dim: 'rgba(200,255,46,.45)' }] });
    let acc = 0; const cum = revSer.map(s => acc += s.v);
    drawChart($('#revChart'), { type: 'line', height: 140, labels: revSer.map(s => String(new Date(s.d).getDate())), series: [{ data: cum, color: '#c8ff2e', fill: 'rgba(200,255,46,.15)' }], yFmt: v => '$' + Math.round(v / 1000) + 'k' });
    if (ui.liveSim) {
      const iv = setInterval(() => {
        if (currentRoute() !== 'admin') return;
        const pool = S.members.filter(m => { const s = stats(m); return !s.checkedToday && s.status !== 'vencido' && m.id !== S.me; });
        if (!pool.length) return;
        const x = pool[Math.floor(Math.random() * pool.length)];
        doCheckin(x.id, 'kiosco');
      }, 15000);
      viewCleanups.push(() => clearInterval(iv));
    }
    viewCleanups.push(on('checkin', e => { if (currentRoute() === 'admin' && !layers.length) { toast(`${e.detail.member.name} acaba de entrar`); render(); } }));
  });
  const feed = ciToday.slice().sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 6);
  return `
  <section class="row between"><div><p class="eyebrow">${new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 class="h-display">Panel</h1></div>
    <button type="button" class="btn primary sm" data-act="kiosk">${I.monitor}Kiosco QR</button></section>
  <section class="kpis">
    <div class="kpi"><p class="l">Socios activos</p><p class="v num">${active.length}</p><p class="d">de ${S.members.length} registrados</p></div>
    <div class="kpi"><p class="l">Check-ins hoy</p><p class="v num">${ciToday.length}</p><p class="d ${ciToday.length >= avg ? 'up' : ''}">promedio ${avg.toFixed(1)} por día</p></div>
    <div class="kpi"><p class="l">Ingresos del mes</p><p class="v num">${money(revMonth)}</p><p class="d ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta * 100).toFixed(0)}% vs mismo corte</p></div>
    <div class="kpi ${expiring.length ? 'alert' : ''}"><p class="l">Vencen en 7 días</p><p class="v num">${expiring.length}</p><p class="d">${money(expiring.reduce((a, m) => a + planById(m.plan).price, 0))} por renovar</p></div>
  </section>

  <section class="card stack">
    <div class="row between"><h2 class="h-sec"><span class="live-dot"></span>En vivo</h2>
      <label class="small muted row" style="gap:6px"><input type="checkbox" id="liveSim" ${ui.liveSim ? 'checked' : ''} data-change="liveSim"> Simular entradas</label></div>
    ${feed.length ? feed.map(c => { const m = mById(c.memberId); return m ? `<div class="feed-item">${avatar(m)}<div style="min-width:0"><p style="font-weight:700">${esc(m.name)}</p><p class="small muted">${esc(planById(m.plan).name)} · racha ${m.streak}</p></div><span class="time num">${fmtTime(c.ts)}</span></div>` : ''; }).join('') : '<p class="empty">Sin entradas todavía hoy.</p>'}
  </section>

  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Asistencia 30 días</h2><span class="small muted">check-ins por día</span></div>
    <div class="chart-wrap"><canvas id="ciChart" role="img" aria-label="Check-ins diarios de los últimos 30 días"></canvas></div>
  </section>

  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Horas pico</h2><span class="small muted">últimos 30 días</span></div>
    <div class="hours">${hours.map(v => `<i style="height:${Math.max(3, v / hmax * 100)}%;opacity:${0.35 + 0.65 * v / hmax}" title="${v} entradas"></i>`).join('')}</div>
    <div class="hours-l num">${hours.map((_, i) => `<span>${(i + 6) % 2 === 0 ? i + 6 : ''}</span>`).join('')}</div>
  </section>

  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Ingresos acumulados</h2><span class="small muted">30 días</span></div>
    <div class="chart-wrap"><canvas id="revChart" role="img" aria-label="Ingresos acumulados de los últimos 30 días"></canvas></div>
  </section>

  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Riesgo de abandono</h2><span class="pill warn">${risk.length}</span></div>
    <p class="small muted">Socios con membresía vigente que llevan 10 días o más sin venir.</p>
    ${risk.length ? `<div class="list">${risk.slice(0, 6).map(m => `<div class="list-item">${avatar(m)}<div class="grow"><p class="t">${esc(m.name)}</p><p class="s">Última visita ${stats(m).daysSince >= 999 ? 'sin registro' : relDays(stats(m).last)}</p></div><button type="button" class="btn sm" data-act="msgMember" data-id="${m.id}">${I.msg}Escribir</button></div>`).join('')}</div>` : '<p class="empty">Nadie en riesgo. Buen trabajo.</p>'}
  </section>

  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Por renovar</h2><button type="button" class="link" data-act="go" data-r="socios">Ver socios</button></div>
    ${expiring.length ? `<div class="list">${expiring.map(m => `<button type="button" class="list-item" data-act="member" data-id="${m.id}">${avatar(m)}<div class="grow"><p class="t">${esc(m.name)}</p><p class="s">${esc(planById(m.plan).name)} · vence ${relDays(m.expires)}</p></div>${statusPill('por vencer')}</button>`).join('')}</div>` : '<p class="empty">Ninguna membresía vence esta semana.</p>'}
  </section>`;
}

function vAjustes() {
  return `
  <section><p class="eyebrow">Comunicación y configuración</p><h1 class="h-display">Avisos</h1></section>
  <form class="card stack" id="noticeForm">
    <h2 class="h-sec">Publicar aviso</h2>
    <div class="field"><label for="nTitle">Título</label><input class="input" id="nTitle" required maxlength="60" placeholder="Ej. Velada interna este sábado"></div>
    <div class="field"><label for="nBody">Mensaje</label><textarea class="input" id="nBody" rows="3" required maxlength="240" placeholder="Lo que verán todos los socios en la app"></textarea></div>
    <div class="field"><label for="nTag">Tipo</label><select class="input" id="nTag"><option>Evento</option><option>Horario</option><option>Promoción</option><option>Aviso</option></select></div>
    <button class="btn primary block" type="submit">${I.mega}Enviar a todos los socios</button>
  </form>
  <section class="card stack"><h2 class="h-sec">Avisos publicados</h2>
    <div class="list">${S.notices.map(n => `<div class="list-item"><div class="grow"><p class="t">${esc(n.title)}</p><p class="s">${esc(n.tag || 'Aviso')} · ${fmtDate(n.ts)}</p></div><button type="button" class="icon-btn" data-act="delNotice" data-id="${n.id}" aria-label="Eliminar aviso">${I.trash}</button></div>`).join('')}</div>
  </section>
  <section class="card stack"><h2 class="h-sec">Planes y precios</h2>
    ${S.plans.map(p => `<div class="row"><p style="flex:1;font-weight:600">${esc(p.name)} <span class="small muted">· ${p.days} día${p.days === 1 ? '' : 's'}</span></p><input class="input num" style="width:110px;text-align:right" type="number" min="0" step="10" value="${p.price}" data-change="planPrice" data-id="${p.id}" aria-label="Precio ${esc(p.name)}"></div>`).join('')}
  </section>
  <section class="card stack"><h2 class="h-sec">Check-in</h2>
    <div class="field"><label for="delay">Segundos para mostrar la ficha después del check-in</label>
    <input type="range" id="delay" min="2" max="30" value="${S.gym.checkinDelay}" data-change="delay"><p class="small muted num" id="delayV">${S.gym.checkinDelay} s (la propuesta original es 30 s; 4 s para demostración)</p></div>
  </section>
  <button type="button" class="btn ghost block" data-act="reset">${I.rotate}Reiniciar datos de demostración</button>`;
}

function openNotices() {
  S.notices.forEach(n => { if (!S.readNotices.includes(n.id)) S.readNotices.push(n.id); }); save();
  sheet(`<h3 class="h-sec">Avisos del gym</h3>${S.notices.length ? S.notices.map(n => `<div class="card notice stack"><p class="eyebrow lime">${esc(n.tag || 'Aviso')} · ${fmtDate(n.ts)}</p><p class="t">${esc(n.title)}</p><p class="small muted">${esc(n.body)}</p></div>`).join('') : '<p class="empty">Sin avisos.</p>'}`);
  render();
}
