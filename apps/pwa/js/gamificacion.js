'use strict';
/* Gamificación: insignias, retos, duelos con gráficas, ranking, tienda de premios y entregas. */

const BADGES = [
  { id: 'first', name: 'Primer round', icon: 'glove', test: m => m.totalSessions >= 1 },
  { id: 'streak7', name: 'Racha de 7', icon: 'flame', test: m => Math.max(m.streak, m.bestStreak || 0) >= 7 },
  { id: 'streak21', name: 'Racha de 21', icon: 'flame', test: m => Math.max(m.streak, m.bestStreak || 0) >= 21 },
  { id: 's100', name: '100 sesiones', icon: 'medal', test: m => m.totalSessions >= 100 },
  { id: 's300', name: '300 sesiones', icon: 'medal', test: m => m.totalSessions >= 300 },
  { id: 'early', name: 'Madrugador', icon: 'sun', test: (m, s) => s.early >= 5 },
  { id: 'spar', name: '10 sparrings', icon: 'swords', test: m => m.spar.w + m.spar.l + m.spar.d >= 10 },
  { id: 'vet', name: '1 año en CG', icon: 'star', test: m => Date.now() - new Date(m.since).getTime() > 365 * DAY },
  { id: 'duel', name: 'Ganó un duelo', icon: 'trophy', test: m => (m.duelWins || 0) >= 1 },
  { id: 'shop', name: 'Primer canje', icon: 'gift', test: m => S.redemptions.some(r => r.memberId === m.id) },
  { id: 'r1000', name: '1,000 rounds', icon: 'timer', test: m => m.rounds >= 1000 },
  { id: 'share', name: 'Embajador', icon: 'share', test: m => (m.shared || 0) >= 1 }
];
const earned = m => { const s = stats(m); return new Set(BADGES.filter(b => b.test(m, s)).map(b => b.id)); };

function challengeValue(ch, m, st) {
  st = st || stats(m);
  if (ch.metric === 'streak') return m.streak;
  return st[ch.metric] || 0;
}

function challengeRow(ch, m, st) {
  const v = challengeValue(ch, m, st), pct = clamp(v / ch.goal, 0, 1);
  const claimed = (m.claimed || []).includes(ch.id);
  return `<div class="card row">
    <div class="progress-ring" style="--p:${Math.round(pct * 100)}" data-l="${Math.round(pct * 100)}%"></div>
    <div style="flex:1;min-width:0"><p style="font-weight:700">${esc(ch.title)}</p><p class="small muted num">${Math.min(v, ch.goal)} / ${ch.goal} · +${ch.reward} golpes</p></div>
    ${claimed ? '<span class="pill ok">Cobrado</span>' : pct >= 1 ? `<button type="button" class="btn primary sm" data-act="claim" data-id="${ch.id}">Cobrar</button>` : ''}
  </div>`;
}

function duelSeries(memberId, metric) {
  const m = mById(memberId), st = stats(m);
  const ms = monthStart(), days = Math.round((t0() - ms) / DAY) + 1;
  const counts = new Array(days).fill(0);
  st.att.filter(d => d >= ms).forEach(d => { const i = Math.round((startOfDay(d).getTime() - ms) / DAY); if (i >= 0 && i < days) counts[i] += metric === 'monthRounds' ? st.avgR : 1; });
  if (metric === 'monthRounds') (m.roundLog || []).forEach(r => { const t = new Date(r.ts).getTime(); if (t >= ms) { const i = Math.round((startOfDay(t).getTime() - ms) / DAY); if (counts[i] != null) counts[i] += r.n; } });
  let acc = 0; return counts.map(c => Math.round(acc += c));
}
function duelCard(d, compact) {
  const a = mById(d.a), b = mById(d.b);
  const va = stats(a)[d.metric], vb = stats(b)[d.metric];
  const tot = va + vb || 1;
  const lead = va === vb ? 'Empate' : (va > vb ? firstName(a.name) : firstName(b.name)) + ' va arriba';
  const cid = 'duel_' + d.id + (compact ? '_c' : '');
  if (!compact) mount(() => {
    const sa = duelSeries(d.a, d.metric), sb = duelSeries(d.b, d.metric);
    drawChart(document.getElementById(cid), { type: 'line', height: 150, labels: sa.map((_, i) => String(i + 1)), series: [{ data: sb, color: '#8f9887', width: 2, dash: [5, 4] }, { data: sa, color: '#c8ff2e', fill: 'rgba(200,255,46,.18)' }], endLabels: [firstName(b.name), firstName(a.name)] });
  });
  return `<section class="card duel stack">
    <div class="row between"><p class="eyebrow lime">Duelo · ${esc(d.label)}</p><span class="pill plain">${d.stake} golpes</span></div>
    <div class="duel-vs">
      <div class="who"><b class="num">${nf(va)}</b><span>${esc(firstName(a.name))} "${esc(a.alias)}"</span></div>
      <div class="vs">VS</div>
      <div class="who"><b class="num" style="color:var(--muted)">${nf(vb)}</b><span>${esc(firstName(b.name))} "${esc(b.alias)}"</span></div>
    </div>
    <div class="duel-bar"><i style="width:${va / tot * 100}%;background:var(--lime)"></i><i style="width:${vb / tot * 100}%;background:#59614f"></i></div>
    <p class="small muted">${esc(lead)} · termina ${relDays(d.ends)}</p>
    ${compact ? '' : `<div class="chart-wrap"><canvas id="${cid}" role="img" aria-label="Avance acumulado del duelo en el mes"></canvas></div>`}
  </section>`;
}

function vRetos() {
  const m = me(), st = stats(m);
  const tabs = [['retos', 'Retos'], ['duelos', 'Duelos'], ['ranking', 'Ranking']].map(([k, l]) => `<button type="button" data-act="retosTab" data-t="${k}" aria-pressed="${ui.retosTab === k}">${l}</button>`).join('');
  let body = '';
  if (ui.retosTab === 'retos') {
    body = `<p class="small muted">Completa retos para ganar golpes y canjearlos por agua, electrolitos, merch y más.</p>
      ${S.challenges.map(ch => `<article class="stack">${challengeRow(ch, m, st)}<p class="small muted" style="padding:0 4px">${esc(ch.desc)} Termina ${relDays(ch.ends)}.</p></article>`).join('')}`;
  } else if (ui.retosTab === 'duelos') {
    const mine = S.duels.filter(d => d.a === m.id || d.b === m.id);
    body = `<button type="button" class="btn primary block" data-act="newDuel">${I.swords}Retar a un compañero</button>
      ${mine.length ? mine.map(d => duelCard(d, false)).join('') : '<div class="card empty">Aún no tienes duelos activos.</div>'}`;
  } else {
    const metrics = [['monthAttendance', 'Asistencias'], ['monthRounds', 'Rounds'], ['xp', 'XP total'], ['streak', 'Racha']];
    const val = mm => ui.rankMetric === 'xp' ? mm.xp : ui.rankMetric === 'streak' ? mm.streak : stats(mm)[ui.rankMetric];
    const rows = S.members.filter(x => x.plan !== 'infantil').map(x => ({ x, v: val(x) })).sort((a, b) => b.v - a.v);
    const myPos = rows.findIndex(r => r.x.id === m.id) + 1;
    body = `<div class="chips">${metrics.map(([k, l]) => `<button type="button" class="chip" data-act="rankMetric" data-k="${k}" aria-pressed="${ui.rankMetric === k}">${l}</button>`).join('')}</div>
      <div class="card"><p class="eyebrow">Tu posición</p><p class="h-display num" style="font-size:44px">#${myPos} <span class="eyebrow">de ${rows.length}</span></p></div>
      <div class="card">${rows.slice(0, 12).map((r, i) => `<div class="rank-row ${i < 3 ? 'top' : ''} ${r.x.id === m.id ? 'me' : ''}">
        <span class="pos num">${i + 1}</span>${avatar(r.x)}<div style="min-width:0"><p style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.x.name)}</p><p class="small muted">"${esc(r.x.alias)}" · ${esc(r.x.cat)}</p></div><span class="val num">${nf(r.v)}</span></div>`).join('')}
        ${myPos > 12 ? `<div class="rank-row me"><span class="pos num">${myPos}</span>${avatar(m)}<div><p style="font-weight:700">${esc(m.name)}</p></div><span class="val num">${nf(val(m))}</span></div>` : ''}</div>`;
  }
  return `<section><p class="eyebrow">Compite con tu gym</p><h1 class="h-display">Retos</h1></section>
    <div class="seg" role="group" aria-label="Sección">${tabs}</div>${body}`;
}

function vTienda() {
  const m = me();
  const mine = S.redemptions.filter(r => r.memberId === m.id).sort((a, b) => b.ts.localeCompare(a.ts));
  return `
  <section><p class="eyebrow">Gana entrenando</p><h1 class="h-display">Premios</h1></section>
  <section class="wallet">
    <p class="l">Tus golpes</p><p class="v num">${nf(m.coins)}</p>
    <p class="small" style="font-weight:600">Check-in +20 · cada 5 días de racha +50 · retos y duelos</p>
  </section>
  <section class="shop">
    ${S.rewards.map(r => {
      const can = m.coins >= r.cost && r.stock > 0;
      return `<article class="item">
        <div class="art">${I[r.icon] || I.gift}</div>
        <span class="pill plain" style="justify-self:start">${esc(r.tag)}</span>
        <p class="nm">${esc(r.name)}</p>
        <div class="row between"><span class="cost num">${nf(r.cost)}</span><span class="small muted">${r.stock > 0 ? r.stock + ' disp.' : 'Agotado'}</span></div>
        <div class="bar"><i style="width:${Math.min(100, m.coins / r.cost * 100)}%"></i></div>
        <button type="button" class="btn sm ${can ? 'primary' : ''}" data-act="redeem" data-id="${r.id}" ${can ? '' : 'disabled'}>${can ? 'Canjear' : r.stock > 0 ? 'Te faltan ' + nf(r.cost - m.coins) : 'Agotado'}</button>
      </article>`;
    }).join('')}
  </section>
  <section class="card stack">
    <h2 class="h-sec">Mis canjes</h2>
    ${mine.length ? `<div class="list">${mine.map(r => { const rw = S.rewards.find(x => x.id === r.rewardId) || { name: '—' }; return `<div class="list-item"><div class="grow"><p class="t">${esc(rw.name)}</p><p class="s">Código ${r.code} · ${fmtDate(r.ts)}</p></div><span class="pill ${r.status === 'entregado' ? 'ok' : 'warn'}">${r.status}</span></div>`; }).join('')}</div>` : '<p class="empty">Todavía no canjeas premios.</p>'}
    <p class="small muted">Muestra el código en recepción para recoger tu premio.</p>
  </section>`;
}

function vEntregas() {
  const pend = S.redemptions.filter(r => r.status === 'pendiente');
  const done = S.redemptions.filter(r => r.status === 'entregado').slice(-5).reverse();
  return `
  <section><p class="eyebrow">Recompensas y retos</p><h1 class="h-display">Premios</h1></section>
  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Por entregar</h2><span class="pill warn">${pend.length}</span></div>
    ${pend.length ? `<div class="list">${pend.map(r => { const m = mById(r.memberId), rw = S.rewards.find(x => x.id === r.rewardId); return `<div class="list-item">${avatar(m)}<div class="grow"><p class="t">${esc(rw ? rw.name : '—')}</p><p class="s">${esc(m.name)} · ${r.code} · ${fmtDate(r.ts)}</p></div><button type="button" class="btn primary sm" data-act="deliver" data-id="${r.id}">Entregar</button></div>`; }).join('')}</div>` : '<p class="empty">Todo entregado.</p>'}
  </section>
  <section class="card stack">
    <h2 class="h-sec">Inventario</h2>
    <div class="list">${S.rewards.map(r => `<div class="list-item"><div class="avatar alt" style="color:var(--lime)">${I[r.icon] || I.gift}</div><div class="grow"><p class="t">${esc(r.name)}</p><p class="s num">${nf(r.cost)} golpes</p></div>
      <div class="row" style="gap:6px"><button type="button" class="icon-btn" data-act="stock" data-id="${r.id}" data-d="-1" aria-label="Quitar 1">−</button><b class="num" style="min-width:26px;text-align:center">${r.stock}</b><button type="button" class="icon-btn" data-act="stock" data-id="${r.id}" data-d="1" aria-label="Agregar 1">+</button></div></div>`).join('')}</div>
  </section>
  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Retos activos</h2><button type="button" class="link" data-act="addChallenge">Nuevo reto</button></div>
    <div class="list">${S.challenges.map(ch => { const done = S.members.filter(m => challengeValue(ch, m) >= ch.goal).length; return `<div class="list-item"><div class="grow"><p class="t">${esc(ch.title)}</p><p class="s">${done} socios lo completaron · +${ch.reward} golpes</p></div><button type="button" class="icon-btn" data-act="delChallenge" data-id="${ch.id}" aria-label="Eliminar reto">${I.trash}</button></div>`; }).join('')}</div>
  </section>
  ${done.length ? `<section class="card stack"><h2 class="h-sec">Entregados recientes</h2><div class="list">${done.map(r => { const m = mById(r.memberId), rw = S.rewards.find(x => x.id === r.rewardId); return `<div class="list-item"><div class="grow"><p class="t">${esc(rw ? rw.name : '—')}</p><p class="s">${esc(m ? m.name : '')} · ${r.code}</p></div><span class="pill ok">entregado</span></div>`; }).join('')}</div></section>` : ''}`;
}

function openNewDuel() {
  const m = me();
  const rivals = S.members.filter(x => x.id !== m.id && x.plan !== 'infantil').sort((a, b) => a.name.localeCompare(b.name));
  const l = sheet(`<h3 class="h-sec">Nuevo duelo</h3><form id="ndForm" class="stack">
    <div class="field"><label for="ndR">Rival</label><select class="input" id="ndR">${rivals.map(r => `<option value="${r.id}">${esc(r.name)} "${esc(r.alias)}"</option>`).join('')}</select></div>
    <div class="field"><label for="ndM">Se gana por</label><select class="input" id="ndM"><option value="monthAttendance">Asistencias del mes</option><option value="monthRounds">Rounds del mes</option></select></div>
    <div class="field"><label for="ndS">Apuesta en golpes (tienes ${nf(m.coins)})</label><input class="input num" id="ndS" type="number" min="50" step="50" max="${m.coins}" value="${Math.min(200, m.coins)}" required></div>
    <p class="small muted">Gana quien lleve más al cierre del mes. El ganador se lleva la apuesta de ambos y la insignia "Ganó un duelo".</p>
    <button class="btn primary block" type="submit">${I.swords}Enviar reto</button></form>`);
  $('#ndForm', l.el).onsubmit = e => {
    e.preventDefault();
    const stake = Number($('#ndS', l.el).value);
    if (stake > m.coins) { toast('No tienes suficientes golpes para esa apuesta.'); return; }
    const metric = $('#ndM', l.el).value;
    const monthEnd = new Date(); monthEnd.setMonth(monthEnd.getMonth() + 1, 0); monthEnd.setHours(23, 59);
    S.duels.unshift({ id: uid('d'), a: m.id, b: $('#ndR', l.el).value, metric, label: metric === 'monthRounds' ? 'Rounds del mes' : 'Asistencias del mes', ends: monthEnd.toISOString(), stake, status: 'activo' });
    save(); popLayer(); ui.retosTab = 'duelos'; render(); toast('Reto enviado. Le llegará una notificación a tu rival.', 'lime');
  };
}

function openAddChallenge() {
  const l = sheet(`<h3 class="h-sec">Nuevo reto</h3><form id="chForm" class="stack">
    <div class="field"><label for="ch_t">Título</label><input class="input" id="ch_t" required maxlength="40" placeholder="Ej. 12 sesiones antes del día 15"></div>
    <div class="grid2">
      <div class="field"><label for="ch_m">Métrica</label><select class="input" id="ch_m"><option value="monthAttendance">Asistencias del mes</option><option value="monthRounds">Rounds del mes</option><option value="streak">Racha de días</option><option value="early">Check-ins antes de 8 am</option></select></div>
      <div class="field"><label for="ch_g">Meta</label><input class="input" id="ch_g" type="number" min="1" value="12" required></div>
      <div class="field"><label for="ch_r">Premio (golpes)</label><input class="input" id="ch_r" type="number" min="10" step="10" value="300" required></div>
    </div>
    <div class="field"><label for="ch_d">Descripción</label><input class="input" id="ch_d" maxlength="90" placeholder="Qué tienen que hacer"></div>
    <button class="btn primary block" type="submit">${I.trophy}Publicar reto</button></form>`);
  $('#chForm', l.el).onsubmit = e => {
    e.preventDefault(); const v = k => $('#ch_' + k, l.el).value.trim();
    const end = new Date(); end.setMonth(end.getMonth() + 1, 0); end.setHours(23, 59);
    S.challenges.push({ id: uid('ch'), title: v('t'), metric: v('m'), goal: Number(v('g')), reward: Number(v('r')), ends: end.toISOString(), desc: v('d') || 'Reto especial del gym.' });
    save(); popLayer(); render(); toast('Reto publicado para todos los socios.', 'lime');
  };
}
