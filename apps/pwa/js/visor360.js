'use strict';
/* Ficha de peleador: silueta 360 de demostración y visor que se arrastra para girar. */

/* ================= Silueta 360 del peleador (demo sin video) ================= */
const silCache = {};
function getOff(key, w, h) {
  let c = silCache[key];
  if (!c || c.width !== w || c.height !== h) { c = document.createElement('canvas'); c.width = w; c.height = h; silCache[key] = c; }
  return c;
}
function drawFighter(ctx, W, H, theta, bulk) {
  bulk = bulk || 1;
  const s = H / 104, cx = W / 2, ground = H - 2;
  const cos = Math.cos(theta), sin = Math.sin(theta);
  const pr = (x, y, z) => ({ x: cx + (x * cos + z * sin) * s, y: ground - (100 - y) * s, z: -x * sin + z * cos });
  const mask = getOff('mask', W, H), m = mask.getContext('2d');
  m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, W, H);
  m.fillStyle = '#000'; m.strokeStyle = '#000'; m.lineCap = 'round'; m.lineJoin = 'round';
  const limb = (pts, wd) => { m.lineWidth = wd * s; m.beginPath(); pts.forEach((p, i) => i ? m.lineTo(p.x, p.y) : m.moveTo(p.x, p.y)); m.stroke(); };
  // piernas en guardia (pie adelantado)
  limb([pr(-5, 55, 0), pr(-8, 77, 4), pr(-9, 98, 7)], 9 * bulk);
  limb([pr(5, 55, 0), pr(9, 77, -3), pr(10, 98, -8)], 9 * bulk);
  // torso
  const sw = 14.5 * bulk, sd = 6 * bulk, ww = 7.6 * bulk, wd = 4.6 * bulk;
  const hs = Math.abs(sw * cos) + Math.abs(sd * sin), hw = Math.abs(ww * cos) + Math.abs(wd * sin);
  m.lineWidth = 6 * s; m.beginPath();
  m.moveTo(cx - hs * s, ground - 73 * s); m.lineTo(cx + hs * s, ground - 73 * s);
  m.lineTo(cx + hw * s, ground - 46 * s); m.lineTo(cx - hw * s, ground - 46 * s); m.closePath(); m.fill(); m.stroke();
  limb([pr(0, 20, 0.5), pr(0, 27, 0.5)], 6);
  const hd = pr(0, 14.5, 1.5); m.beginPath(); m.arc(hd.x, hd.y, 7.2 * s, 0, 7); m.fill();
  // brazos en guardia
  const arms = [
    [pr(-12.5 * bulk, 28, 0), pr(-11, 40, 6), pr(-5, 25, 15)],
    [pr(12.5 * bulk, 28, 0), pr(11.5, 41, 4), pr(6, 27, 9)]
  ];
  arms.forEach(a => { limb(a, 6 * bulk); m.beginPath(); m.arc(a[2].x, a[2].y, 6 * s, 0, 7); m.fill(); });
  // estilizado: brillo + degradado con luz de borde
  const out = getOff('out', W, H), o = out.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H);
  o.globalCompositeOperation = 'source-over'; o.drawImage(mask, 0, 0);
  o.globalCompositeOperation = 'source-in';
  const lx = cx + (sin > 0 ? 1 : -1) * 18 * s;
  const g = o.createLinearGradient(cx - 22 * s, 0, cx + 22 * s, 0);
  const rim = 0.35 + 0.55 * Math.abs(cos);
  g.addColorStop(0, `rgba(200,255,46,${0.25 + 0.4 * (sin < 0 ? Math.abs(sin) : 0)})`);
  g.addColorStop(0.18, '#151a10'); g.addColorStop(0.62, '#20271a');
  g.addColorStop(1, `rgba(200,255,46,${rim})`);
  o.fillStyle = g; o.fillRect(0, 0, W, H);
  o.globalCompositeOperation = 'source-atop';
  const gr = o.createRadialGradient(lx, ground - 70 * s, 2, lx, ground - 70 * s, 40 * s);
  gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  o.fillStyle = gr; o.fillRect(0, 0, W, H);
  // short de marca
  o.fillStyle = '#c8ff2e';
  o.beginPath(); o.moveTo(cx - (hw + 1.5) * s, ground - 47 * s); o.lineTo(cx + (hw + 1.5) * s, ground - 47 * s);
  o.lineTo(cx + (hw + 4) * s, ground - 34 * s); o.lineTo(cx - (hw + 4) * s, ground - 34 * s); o.closePath(); o.fill();
  o.fillStyle = '#0d1203'; o.fillRect(cx - (hw + 2) * s, ground - 47 * s, (hw + 2) * 2 * s, 2.2 * s);
  o.globalCompositeOperation = 'source-over';
  // brazos al frente con volumen propio para que se lean sobre el torso
  arms.forEach(a => {
    if (a[2].z < 0) return;
    o.lineCap = 'round'; o.lineJoin = 'round';
    o.strokeStyle = 'rgba(200,255,46,.55)'; o.lineWidth = (6 * bulk + 1.4) * s;
    o.beginPath(); a.forEach((p, i) => i ? o.lineTo(p.x, p.y) : o.moveTo(p.x, p.y)); o.stroke();
    o.strokeStyle = '#262f1c'; o.lineWidth = 6 * bulk * s;
    o.beginPath(); a.forEach((p, i) => i ? o.lineTo(p.x, p.y) : o.moveTo(p.x, p.y)); o.stroke();
  });
  // sombra del cuello para separar cabeza y torso
  o.globalCompositeOperation = 'source-atop';
  o.fillStyle = 'rgba(0,0,0,.45)'; o.fillRect(cx - 4 * s, ground - 80 * s, 8 * s, 4 * s);
  o.globalCompositeOperation = 'source-over';
  // guantes visibles (solo si están frente al cuerpo)
  arms.forEach(a => {
    const gl = a[2]; if (gl.z < -3) return;
    const gg = o.createRadialGradient(gl.x - 2 * s, gl.y - 2 * s, 1, gl.x, gl.y, 6.5 * s);
    gg.addColorStop(0, '#e6ff8a'); gg.addColorStop(1, '#8fc11a');
    o.fillStyle = gg; o.beginPath(); o.arc(gl.x, gl.y, 6 * s, 0, 7); o.fill();
  });
  ctx.save(); ctx.shadowColor = 'rgba(200,255,46,.55)'; ctx.shadowBlur = 28; ctx.drawImage(out, 0, 0); ctx.restore();
  ctx.drawImage(out, 0, 0);
  // sombra en el piso
  ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx, ground - 1, 24 * s, 3 * s, 0, 0, 7); ctx.fill(); ctx.restore();
}

/* Visor de 360: arrastra para recorrer los cuadros del video del mes */
function mountViewer(stage, source) {
  const canvas = stage.querySelector('canvas');
  const scrub = stage.querySelector('.frame-scrub');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(stage.clientWidth * dpr), H = Math.round(stage.clientHeight * dpr);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const N = source.type === 'frames' ? source.frames.length : 72;
  let idx = source.start || 0, auto = source.auto !== false, lastTouch = 0, running = true;
  let imgs = null;
  if (source.type === 'frames') imgs = source.frames.map(src => { const im = new Image(); im.src = src; return im; });
  let photo = null;
  if (source.type === 'photo') { photo = new Image(); photo.onload = () => draw(); photo.src = source.src; }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (source.type === 'demo') drawFighter(ctx, W, H, (idx / N) * Math.PI * 2, source.bulk);
    else if (source.type === 'frames') {
      const im = imgs[Math.floor(idx) % N];
      if (im && im.complete && im.naturalWidth) {
        const r = Math.min(W / im.naturalWidth, H / im.naturalHeight);
        const w = im.naturalWidth * r, h = im.naturalHeight * r;
        ctx.drawImage(im, (W - w) / 2, H - h, w, h);
      }
    } else if (photo && photo.complete && photo.naturalWidth) {
      const r = Math.min(W / photo.naturalWidth, H / photo.naturalHeight) * 0.98;
      const w = photo.naturalWidth * r, h = photo.naturalHeight * r;
      ctx.save(); ctx.shadowColor = 'rgba(200,255,46,.45)'; ctx.shadowBlur = 30;
      ctx.drawImage(photo, (W - w) / 2, H - h, w, h); ctx.restore();
    }
    if (scrub) scrub.style.width = (source.type === 'photo' ? 0 : ((Math.floor(idx) % N) + 1) / N * 100) + '%';
  }
  let x0 = 0, i0 = 0, dragging = false;
  if (source.type !== 'photo') {
    stage.addEventListener('pointerdown', e => { dragging = true; x0 = e.clientX; i0 = idx; lastTouch = Date.now(); try { stage.setPointerCapture(e.pointerId); } catch (er) { } });
    stage.addEventListener('pointermove', e => {
      if (!dragging) return;
      const per = stage.clientWidth / N * 1.6;
      idx = ((i0 + (e.clientX - x0) / per) % N + N) % N; lastTouch = Date.now(); draw();
    });
    const end = () => { dragging = false; lastTouch = Date.now(); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { idx = (idx + 1) % N; lastTouch = Date.now(); draw(); }
      if (e.key === 'ArrowLeft') { idx = (idx - 1 + N) % N; lastTouch = Date.now(); draw(); }
    });
  }
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick() {
    if (!running || !stage.isConnected) return;
    if (auto && !reduce && !dragging && Date.now() - lastTouch > 3500 && source.type !== 'photo') { idx = (idx + (source.type === 'frames' ? 0.35 : 0.45)) % N; draw(); }
    requestAnimationFrame(tick);
  }
  draw(); if (imgs) imgs.forEach(im => { im.onload = () => { if (Math.floor(idx) % N === imgs.indexOf(im)) draw(); }; });
  requestAnimationFrame(tick);
  return { stop() { running = false; }, set(i) { idx = i; draw(); }, get count() { return N; } };
}
function fighterSource(m, mode) {
  if (mode === 'foto') return m.photo ? { type: 'photo', src: m.photo } : { type: 'demo', auto: false, start: 6 };
  const v = latestVideo(m);
  return v ? { type: 'frames', frames: v.frames } : { type: 'demo' };
}
const latestVideo = m => (m.videos || []).slice().sort((a, b) => a.month < b.month ? 1 : -1)[0];
const stageHTML = (h, hint) => `<div class="fighter-stage" tabindex="0" aria-label="Visor 360: arrastra para girar" style="${h ? 'height:' + h + 'px' : ''}"><canvas></canvas><div class="frame-scrub"></div>${hint ? `<div class="fighter-hint">${I.drag}${hint}</div>` : ''}</div>`;
