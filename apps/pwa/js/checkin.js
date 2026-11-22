'use strict';
/* Check-in con QR rotativo, escáner, banner "preparándose para entrenar", kiosco de recepción y timer de rounds. */

/* Check-in: suma XP, golpes (moneda), racha e insignias */
function doCheckin(memberId, source) {
  const m = mById(memberId); if (!m) return { error: 'Socio no encontrado' };
  const st = stats(m);
  if (st.checkedToday) return { already: true, member: m };
  if (st.status === 'vencido') return { expired: true, member: m };
  const beforeLvl = st.lvl.level;
  const beforeBadges = earned(m);
  const now = new Date();
  // racha: cuenta si el último día entrenado fue ayer, o anteayer cuando ayer fue domingo
  let gap = st.daysSince;
  if (gap === 2 && new Date(Date.now() - DAY).getDay() === 0) gap = 1;
  m.streak = gap === 1 ? m.streak + 1 : 1;
  m.bestStreak = Math.max(m.bestStreak || 0, m.streak);
  m.attendance.push(now.toISOString());
  m.totalSessions += 1;
  let xp = 50, coins = 20;
  if (now.getHours() < 8) { xp += 15; }
  const streakBonus = m.streak > 1 && m.streak % 5 === 0 ? 50 : 0;
  coins += streakBonus;
  m.xp += xp; m.coins += coins;
  S.checkins.push({ id: uid('c'), memberId, ts: now.toISOString(), source });
  const after = earned(m);
  const newBadges = BADGES.filter(b => after.has(b.id) && !beforeBadges.has(b.id));
  const lvlNow = levelOf(m.xp).level;
  save();
  const res = { ok: true, member: m, xp, coins, streakBonus, streak: m.streak, newBadges, levelUp: lvlNow > beforeLvl ? lvlNow : 0, ts: now };
  emit('checkin', res);
  return res;
}

/* Código QR rotativo del kiosco: cambia cada 30 s */
function kioskCode(offset) {
  const win = Math.floor(Date.now() / 30000) + (offset || 0);
  const r = mulberry32(S.kioskSeed + win * 7919)();
  return String(Math.floor(r * 900000) + 100000);
}
const qrPayload = code => `CONTRAGOLPE|CHECKIN|${code}`;
function validatePayload(text) {
  const parts = String(text || '').split('|');
  if (parts[0] !== 'CONTRAGOLPE' || parts[1] !== 'CHECKIN') return { ok: false, msg: 'Ese QR no es de Contragolpe. Escanea el código de la recepción.' };
  if (parts[2] === kioskCode(0) || parts[2] === kioskCode(-1)) return { ok: true };
  return { ok: false, msg: 'El código ya caducó. Escanea el que está en pantalla ahora.' };
}

/* ================= Vistas: SOCIO ================= */
function weekStrip(m) {
  const now = new Date(t0()); const dow = (now.getDay() + 6) % 7; // lunes = 0
  const monday = now.getTime() - dow * DAY;
  const days = new Set(m.attendance.map(a => startOfDay(a).getTime()));
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = monday + i * DAY, isToday = d === t0(), onDay = days.has(d);
    html += `<div>${['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}<i class="${onDay ? 'on' : ''} ${isToday ? 'today' : ''}">${onDay ? I.check : ''}</i></div>`;
  }
  return `<div class="streak-days" aria-label="Asistencias de esta semana">${html}</div>`;
}

// ---- Escáner QR ----
function pseudoQR(canvas, text) {
  const n = 25, ctx = canvas.getContext('2d'), sz = canvas.width / n;
  const rnd = mulberry32([...text].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#000';
  const finder = (x, y) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { const e = i === 0 || j === 0 || i === 6 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5); if (e) ctx.fillRect((x + i) * sz, (y + j) * sz, sz, sz); } };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const inF = (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9); if (!inF && rnd() < 0.5) ctx.fillRect(i * sz, j * sz, sz, sz); }
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
}
function drawQR(target, text, size) {
  target.innerHTML = '';
  if (window.QRCode) {
    try {
      const tmp = document.createElement('div');
      new window.QRCode(tmp, { text, width: size, height: size, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
      const c = tmp.querySelector('canvas');
      if (c) { const copy = document.createElement('canvas'); copy.width = c.width; copy.height = c.height; copy.getContext('2d').drawImage(c, 0, 0); target.appendChild(copy); return; }
    } catch (e) { }
  }
  const c = document.createElement('canvas'); c.width = c.height = size; pseudoQR(c, text); target.appendChild(c);
}

function openScanner() {
  const m = me(), st = stats(m);
  if (st.status === 'vencido') { confirmSheet('Membresía vencida', 'Renueva tu plan para registrar tu entrada. Puedes pagar en recepción o desde la app.', 'Renovar', () => openMembership()); return; }
  if (st.checkedToday) { showReady({ member: m, already: true }); return; }
  const l = pushLayer(`<div class="scanner" role="dialog" aria-modal="true" aria-label="Escanear QR de entrada">
    <div class="full-head" style="border:0;background:transparent"><button type="button" class="icon-btn" data-act="close" aria-label="Cerrar">${I.x}</button><h2>Check-in</h2></div>
    <div class="scanner-cam"><video playsinline muted style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none"></video>
      <canvas class="fake-qr" width="250" height="250"></canvas>
      <div class="viewfinder"><i></i><i></i><i></i><i></i><div class="scanline"></div></div></div>
    <div class="scan-status">
      <p class="h-sec" id="scanTitle">Apunta al QR de recepción</p>
      <p class="small muted" id="scanMsg">Buscando código…</p>
      <div class="grid2">
        <label class="btn" for="qrFile">${I.image}Foto del QR</label>
        <button type="button" class="btn primary" id="simScan">${I.qr}Simular lectura</button>
      </div>
      <input type="file" id="qrFile" accept="image/*" hidden>
    </div></div>`);
  const root = l.el.querySelector('.scanner');
  const fake = root.querySelector('.fake-qr');
  drawQR({ innerHTML: '', appendChild: c => { fake.getContext('2d').drawImage(c, 0, 0, 250, 250); } }, qrPayload(kioskCode(0)), 250);
  let done = false, stream = null, loop = null;
  const msg = t => { $('#scanMsg', root).textContent = t; };
  function finish(payload) {
    if (done) return;
    const v = validatePayload(payload);
    if (!v.ok) { msg(v.msg); return; }
    done = true; root.classList.add('hit');
    if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { }
    const res = doCheckin(m.id, 'app');
    setTimeout(() => { popLayer(); successThenReady(res); render(); }, 450);
  }
  // cámara real (funciona al publicarse con HTTPS fuera del visor)
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.jsQR) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(s => {
      if (!l.el.isConnected) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s; const v = root.querySelector('video'); v.srcObject = s; v.style.display = 'block'; fake.style.display = 'none'; v.play();
      const c = document.createElement('canvas'), cx = c.getContext('2d', { willReadFrequently: true });
      loop = setInterval(() => {
        if (!v.videoWidth) return; c.width = v.videoWidth / 2; c.height = v.videoHeight / 2;
        cx.drawImage(v, 0, 0, c.width, c.height);
        const r = window.jsQR(cx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        if (r) finish(r.data);
      }, 280);
      msg('Cámara activa. Centra el código en el recuadro.');
    }).catch(() => { msg('Cámara no disponible aquí: usa una foto del QR o simula la lectura.'); });
  } else msg('Usa una foto del QR o simula la lectura.');
  l.cleanups.push(() => { if (stream) stream.getTracks().forEach(t => t.stop()); clearInterval(loop); });
  $('#simScan', root).onclick = () => { msg('Código detectado…'); finish(qrPayload(kioskCode(0))); };
  $('#qrFile', root).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    msg('Leyendo imagen…');
    const img = new Image(); img.onload = () => {
      const c = document.createElement('canvas'); const r = Math.min(1, 1000 / Math.max(img.width, img.height));
      c.width = img.width * r; c.height = img.height * r; const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, c.width, c.height);
      const out = window.jsQR ? window.jsQR(cx.getImageData(0, 0, c.width, c.height).data, c.width, c.height) : null;
      if (out) finish(out.data); else msg('No encontré un QR en la foto. Intenta con mejor luz y más cerca.');
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  };
}

function successThenReady(res) {
  if (res.expired) { toast('Tu membresía está vencida.'); return; }
  const delay = S.gym.checkinDelay;
  const l = pushLayer(`<div class="full" style="place-items:center;grid-template-rows:1fr;text-align:center">
    <div class="stack" style="padding:24px">
      <div style="width:86px;height:86px;border-radius:50%;background:var(--lime);color:var(--lime-ink);display:grid;place-items:center;margin:0 auto">${I.check.replace('stroke-width="2"', 'stroke-width="3" style="width:44px;height:44px"')}</div>
      <h2 class="h-display">Entrada registrada</h2>
      <p class="muted">${fmtTime(res.ts)} · ${esc(S.gym.name)}</p>
      <p class="eyebrow" style="margin-top:22px">Tu ficha sale en pantalla en</p>
      <div class="countdown num" id="cd">${delay}</div>
      <button type="button" class="btn" id="skip">Ver ahora</button>
    </div></div>`);
  let n = delay;
  const iv = setInterval(() => { n--; const el = $('#cd', l.el); if (el) el.textContent = n; if (n <= 0) go2(); }, 1000);
  function go2() { clearInterval(iv); if (layers[layers.length - 1] === l) popLayer(); showReady(res); }
  l.cleanups.push(() => clearInterval(iv));
  $('#skip', l.el).onclick = go2;
}

function readyHTML(m, res, kiosk) {
  const st = stats(m);
  const stripe = 'PREPARÁNDOSE PARA ENTRENAR · ' + m.alias.toUpperCase() + ' · ';
  return `<div class="ready" role="dialog" aria-modal="true" aria-label="Banner de entrada">
    <div class="ready-stage">${stageHTML(0, '')}<div class="ready-stripe"><span>${esc(stripe.repeat(6))}</span></div>
      ${kiosk ? '' : `<button type="button" class="icon-btn" data-act="close" aria-label="Cerrar" style="position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;z-index:3">${I.x}</button>`}</div>
    <div class="ready-info">
      <p class="eyebrow lime">"${esc(m.alias)}" · ${esc(m.cat)} · Nivel ${st.lvl.level}</p>
      <h2 class="h-display" style="font-size:44px">${esc(m.name)}</h2>
      <div class="grid3">
        <div class="stat-tile"><div class="l">Racha</div><div class="v num">${m.streak}<small>días</small></div></div>
        <div class="stat-tile"><div class="l">Sesiones</div><div class="v num">${nf(m.totalSessions)}</div></div>
        <div class="stat-tile"><div class="l">Récord</div><div class="v num" style="font-size:22px">${m.spar.w}-${m.spar.l}-${m.spar.d}</div></div>
      </div>
      ${res && res.ok ? `<div class="reward-pop"><span class="pill lime">+${res.xp} XP</span><span class="pill lime">+${res.coins} golpes</span>${res.levelUp ? `<span class="pill lime">¡Subiste a nivel ${res.levelUp}!</span>` : ''}${res.newBadges.map(b => `<span class="pill lime">Insignia: ${b.name}</span>`).join('')}</div>` : res && res.already ? '<p class="small muted">Ya registraste tu entrada hoy. ¡A entrenar!</p>' : ''}
      ${kiosk ? '' : `<div class="grid2">
        <button type="button" class="btn" data-act="timer">${I.timer}Timer de rounds</button>
        <button type="button" class="btn primary" data-act="shareCard">${I.share}Compartir</button>
      </div>`}
    </div></div>`;
}
function showReady(res) {
  const m = res.member;
  const l = pushLayer(readyHTML(m, res, false));
  const stage = l.el.querySelector('.fighter-stage');
  requestAnimationFrame(() => mountViewer(stage, m.photo ? { type: 'photo', src: m.photo } : fighterSource(m, 'video')));
}

// ---- Timer de rounds ----
let audioCtx = null;
function beep(freq, dur, times, gap) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < (times || 1); i++) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      const t = audioCtx.currentTime + i * (gap || 0.25);
      o.type = 'triangle'; o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
    }
  } catch (e) { }
}
function openTimer() {
  const cfg = { rounds: 6, work: 180, rest: 60 };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem('cg_timer') || '{}')); } catch (e) { }
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const l = full('Timer de rounds', `<div id="tBody"></div>`);
  const body = $('#tBody', l.el);
  const fullEl = l.el.querySelector('.full');
  let run = null;
  function setup() {
    fullEl.classList.remove('rest');
    body.innerHTML = `
      <div class="stack">
        ${[['rounds', 'Rounds', 1, 1, 15, v => v], ['work', 'Duración del round', 30, 30, 300, fmt], ['rest', 'Descanso', 15, 15, 120, fmt]].map(([k, lab, step, min, max, f]) => `
        <div class="field"><label>${lab}</label><div class="stepper"><button type="button" data-k="${k}" data-d="-${step}" data-min="${min}" data-max="${max}" aria-label="Menos">−</button><b class="num" id="v_${k}">${f(cfg[k])}</b><button type="button" data-k="${k}" data-d="${step}" data-min="${min}" data-max="${max}" aria-label="Más">+</button></div></div>`).join('')}
      </div>
      <div class="chips">${[['Amateur', 3, 180, 60], ['Pro', 12, 180, 60], ['Saco HIIT', 8, 120, 30], ['Sombra', 4, 120, 45]].map(p => `<button type="button" class="chip" data-p="${p.slice(1).join(',')}">${p[0]}</button>`).join('')}</div>
      <p class="small muted">Total: <b class="num" id="tTot"></b>. Al terminar se suman tus rounds a tu ficha y a los retos.</p>
      <button type="button" class="btn primary block" id="tStart">${I.play}Empezar</button>`;
    const upd = () => { $('#v_rounds', body).textContent = cfg.rounds; $('#v_work', body).textContent = fmt(cfg.work); $('#v_rest', body).textContent = fmt(cfg.rest); $('#tTot', body).textContent = Math.round((cfg.rounds * cfg.work + (cfg.rounds - 1) * cfg.rest) / 60) + ' min'; };
    upd();
    $$('.stepper button', body).forEach(b => b.onclick = () => { const k = b.dataset.k; cfg[k] = clamp(cfg[k] + Number(b.dataset.d), Number(b.dataset.min), Number(b.dataset.max)); upd(); });
    $$('[data-p]', body).forEach(b => b.onclick = () => { const [r, w, rs] = b.dataset.p.split(',').map(Number); Object.assign(cfg, { rounds: r, work: w, rest: rs }); upd(); });
    $('#tStart', body).onclick = start;
  }
  function start() {
    try { localStorage.setItem('cg_timer', JSON.stringify(cfg)); } catch (e) { }
    beep(880, 0.6, 3, 0.3);
    run = { round: 1, phase: 'work', end: Date.now() + cfg.work * 1000, paused: false, left: 0, done: 0, warned: false };
    body.innerHTML = `<div class="timer-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" stroke="#23271e" stroke-width="8" fill="none"/><circle id="tArc" cx="60" cy="60" r="54" stroke="#c8ff2e" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="339.3" stroke-dashoffset="0"/></svg>
      <div class="center"><p class="phase" id="tPhase">Round 1</p><p class="time num" id="tTime"></p><p class="small muted num" id="tSub"></p></div></div>
      <div class="grid2"><button type="button" class="btn" id="tPause">${I.pause}Pausa</button><button type="button" class="btn danger" id="tStop">${I.x}Terminar</button></div>`;
    $('#tPause', body).onclick = () => {
      if (!run) return; run.paused = !run.paused;
      if (run.paused) { run.left = run.end - Date.now(); $('#tPause', body).innerHTML = I.play + 'Seguir'; }
      else { run.end = Date.now() + run.left; $('#tPause', body).innerHTML = I.pause + 'Pausa'; }
    };
    $('#tStop', body).onclick = () => finish(true);
    tick(); run.iv = setInterval(tick, 200);
  }
  function tick() {
    if (!run || run.paused) return;
    let ms = run.end - Date.now();
    if (run.phase === 'work' && ms <= 10000 && !run.warned) { run.warned = true; beep(1400, 0.08, 2, 0.15); }
    if (ms <= 0) {
      if (run.phase === 'work') {
        run.done++;
        if (run.round >= cfg.rounds) { beep(660, 0.7, 3, 0.35); return finish(false); }
        run.phase = 'rest'; run.end = Date.now() + cfg.rest * 1000; beep(660, 0.5, 2, 0.3); fullEl.classList.add('rest');
      } else { run.round++; run.phase = 'work'; run.warned = false; run.end = Date.now() + cfg.work * 1000; beep(880, 0.6, 3, 0.3); fullEl.classList.remove('rest'); }
      ms = run.end - Date.now();
    }
    const total = (run.phase === 'work' ? cfg.work : cfg.rest) * 1000;
    const arc = $('#tArc', body); if (!arc) return;
    arc.style.stroke = run.phase === 'work' ? '#c8ff2e' : '#67b7ff';
    arc.setAttribute('stroke-dashoffset', String(339.3 * (1 - ms / total)));
    $('#tTime', body).textContent = fmt(Math.ceil(ms / 1000));
    $('#tPhase', body).textContent = run.phase === 'work' ? `Round ${run.round}` : 'Descanso';
    $('#tPhase', body).style.color = run.phase === 'work' ? 'var(--lime)' : 'var(--info)';
    $('#tSub', body).textContent = `${run.round} de ${cfg.rounds}`;
  }
  function finish(stopped) {
    if (!run) return; clearInterval(run.iv);
    const n = run.done; run = null;
    if (n > 0) {
      const m = me(); m.rounds += n; m.xp += n * 5; m.coins += n * 2;
      (m.roundLog = m.roundLog || []).push({ ts: new Date().toISOString(), n }); save();
    }
    fullEl.classList.remove('rest');
    body.innerHTML = `<div class="stack" style="text-align:center;padding-top:30px">
      <p class="eyebrow lime">${stopped ? 'Sesión terminada' : 'Sesión completa'}</p>
      <p class="h-display num" style="font-size:80px">${n}</p><p class="eyebrow">rounds registrados</p>
      ${n ? `<div class="reward-pop" style="justify-content:center"><span class="pill lime">+${n * 5} XP</span><span class="pill lime">+${n * 2} golpes</span></div>` : ''}
      <button type="button" class="btn primary block" id="tAgain">Configurar otra sesión</button></div>`;
    $('#tAgain', body).onclick = setup;
    render();
  }
  l.cleanups.push(() => { if (run) clearInterval(run.iv); });
  setup();
}

// ---- Kiosco de recepción ----
function openKiosk() {
  const l = pushLayer(`<div class="kiosk" role="dialog" aria-modal="true" aria-label="Kiosco de check-in">
    <div class="row between"><button type="button" class="icon-btn" data-act="close" aria-label="Salir del kiosco">${I.x}</button>
      <div class="brand-txt" style="text-align:center"><b>CONTRAGOLPE</b><span>Check-in</span></div><span style="width:38px"></span></div>
    <div style="display:grid;align-content:center;gap:14px">
      <p class="h-display" style="font-size:30px">Escanea con la app</p>
      <div class="qr-box" id="kQR"></div>
      <div><p class="eyebrow">Código de respaldo</p><p class="code num" id="kCode"></p><div class="kiosk-ring"><i id="kBar"></i></div><p class="small muted" style="margin-top:6px">El código cambia cada 30 s para evitar fotos compartidas.</p></div>
    </div>
    <div class="stack"><div id="kFeed" style="text-align:left"></div><button type="button" class="btn block" id="kSim">${I.qr}Simular socio escaneando</button></div>
  </div>`);
  const el = l.el;
  let lastCode = '';
  const feed = () => {
    const today = S.checkins.filter(c => new Date(c.ts).getTime() >= t0()).sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 3);
    $('#kFeed', el).innerHTML = `<p class="eyebrow" style="margin-bottom:4px">Últimas entradas · ${S.checkins.filter(c => new Date(c.ts).getTime() >= t0()).length} hoy</p>` + today.map(c => { const m = mById(c.memberId); return m ? `<div class="feed-item">${avatar(m)}<p style="font-weight:700;flex:1">${esc(m.name)}</p><span class="time num">${fmtTime(c.ts)}</span></div>` : ''; }).join('');
  };
  const tick = () => {
    const code = kioskCode(0);
    if (code !== lastCode) { lastCode = code; drawQR($('#kQR', el), qrPayload(code), 240); $('#kCode', el).textContent = code.slice(0, 3) + ' ' + code.slice(3); }
    const left = 30000 - (Date.now() % 30000);
    $('#kBar', el).style.width = (left / 30000 * 100) + '%';
  };
  tick(); feed();
  const iv = setInterval(tick, 250);
  let bannerTimer = null;
  const showBanner = res => {
    if (!res.ok) return;
    feed();
    const b = document.createElement('div'); b.style.cssText = 'position:absolute;inset:0;z-index:5';
    b.innerHTML = readyHTML(res.member, res, true);
    el.querySelector('.kiosk').appendChild(b);
    mountViewer(b.querySelector('.fighter-stage'), res.member.photo ? { type: 'photo', src: res.member.photo } : fighterSource(res.member, 'video'));
    clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.remove(), 6500);
    b.onclick = () => b.remove();
  };
  const off = on('checkin', e => setTimeout(() => showBanner(e.detail), S.gym.checkinDelay * 1000));
  $('#kSim', el).onclick = () => {
    const pool = S.members.filter(m => { const s = stats(m); return !s.checkedToday && s.status !== 'vencido'; });
    if (!pool.length) { toast('Todos los socios vigentes ya entraron hoy.'); return; }
    const m = pool[Math.floor(Math.random() * pool.length)];
    doCheckin(m.id, 'kiosco');
    toast(`${m.name} escaneó. Su ficha aparece en ${S.gym.checkinDelay} s.`);
  };
  l.cleanups.push(() => { clearInterval(iv); clearTimeout(bannerTimer); off(); render(); });
}
