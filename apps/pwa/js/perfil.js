'use strict';
/* Ficha de peleador del socio: vista de perfil, foto con quitado de fondo, edición de datos y registro de peso. */
function vPerfil() {
  const m = me(), st = stats(m), lv = st.lvl;
  const got = earned(m);
  const years = ((Date.now() - new Date(m.since).getTime()) / (365 * DAY));
  const mode = ui.fighterMode;
  mount(() => {
    const stage = $('#view .fighter-stage');
    if (stage) mountViewer(stage, fighterSource(m, mode));
    const wl = m.weightLog.slice(-6);
    drawChart($('#wChart'), { type: 'line', height: 140, autoMin: true, labels: wl.map(w => fmtDate(w.d, { month: 'short' })), series: [{ data: wl.map(w => w.kg), color: '#c8ff2e', fill: 'rgba(200,255,46,.16)' }], yFmt: v => v.toFixed(0) });
  });
  const v = latestVideo(m);
  return `
  <article class="fighter">
    <div class="fighter-toggle" role="group" aria-label="Vista de la ficha">
      <button type="button" data-act="fMode" data-m="foto" aria-pressed="${mode === 'foto'}">Foto</button>
      <button type="button" data-act="fMode" data-m="video" aria-pressed="${mode === 'video'}">Video del mes</button>
    </div>
    <div class="fighter-bigname" aria-hidden="true">${esc(m.alias)}</div>
    ${stageHTML(0, mode === 'video' ? (v ? 'Arrastra · ' + v.label : 'Demo 360 · arrastra para girar') : (m.photo ? '' : 'Sube tu foto para tu ficha'))}
    <div class="fighter-id">
      <p class="alias">"${esc(m.alias)}"</p>
      <h1 class="name">${esc(m.name)}</h1>
      <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px"><span class="pill lime">Nivel ${lv.level} · ${lv.title}</span><span class="pill plain">${esc(m.cat)}</span><span class="pill plain">${m.streak} días de racha</span></div>
    </div>
    <div class="tale">
      <div><span>Edad · Nacionalidad</span><b>${m.age} · ${esc(m.nat)}</b></div>
      <div><span>Peso · Categoría</span><b class="num">${m.weight} kg · ${esc(m.cat)}</b></div>
      <div><span>Experiencia</span><b>${m.expYears} año${m.expYears === 1 ? '' : 's'}</b></div>
      <div><span>Guardia</span><b>${esc(m.guard)}</b></div>
      <div><span>Alcance · Estatura</span><b class="num">${m.reach} · ${m.height} cm</b></div>
      <div><span>Antigüedad CG</span><b class="num">${years >= 1 ? years.toFixed(1) + ' años' : Math.round(years * 12) + ' meses'}</b></div>
    </div>
    <div class="record">
      <div><b class="w num">${m.spar.w}</b><span>Ganados</span></div>
      <div><b class="num">${m.spar.l}</b><span>Perdidos</span></div>
      <div><b class="num">${m.spar.d}</b><span>Empates</span></div>
    </div>
  </article>

  <section class="grid2">
    <button type="button" class="btn" data-act="photo">${I.image}Foto de ficha</button>
    <button type="button" class="btn" data-act="video">${I.video}Video del mes</button>
    <button type="button" class="btn" data-act="editProfile">${I.edit}Editar ficha</button>
    <button type="button" class="btn primary" data-act="shareCard">${I.share}Compartir</button>
  </section>

  <section class="grid3">
    <div class="stat-tile"><div class="l">Sesiones</div><div class="v num">${nf(m.totalSessions)}</div></div>
    <div class="stat-tile"><div class="l">Rounds</div><div class="v num">${nf(m.rounds)}</div></div>
    <div class="stat-tile"><div class="l">XP</div><div class="v num">${nf(m.xp)}</div></div>
  </section>

  <section class="stack">
    <div class="sec-head"><h2 class="h-sec">Insignias</h2><span class="small muted">${got.size}/${BADGES.length}</span></div>
    <div class="badges">${BADGES.map(b => `<div class="badge ${got.has(b.id) ? '' : 'locked'}"><div class="ic">${I[b.icon]}</div><span>${b.name}</span></div>`).join('')}</div>
  </section>

  <section class="card stack">
    <div class="sec-head"><h2 class="h-sec">Progreso de peso</h2><button type="button" class="link" data-act="logWeight">Registrar</button></div>
    <div class="chart-wrap"><canvas id="wChart" role="img" aria-label="Peso de los últimos meses"></canvas></div>
    <button type="button" class="btn block" data-act="compare">${I.rotate}Comparar video del mes</button>
  </section>

  <section class="card stack">
    <div class="row between"><div><p class="eyebrow">Membresía</p><p style="font-weight:700">${esc(planById(m.plan).name)} · ${money(planById(m.plan).price)}</p><p class="small muted">Vence ${fmtDate(m.expires, { day: 'numeric', month: 'long' })}</p></div>${statusPill(st.status)}</div>
    <button type="button" class="btn block" data-act="membership">${I.card}Ver pagos y renovar</button>
  </section>
  <button type="button" class="btn ghost block small" data-act="reset">${I.rotate}Reiniciar datos de demostración</button>
  `;
}

// ---- Foto de ficha con quitado de fondo y auto-recorte ----
function removeBackground(img, tol, feather) {
  const maxS = 720, r = Math.min(1, maxS / Math.max(img.width, img.height));
  const W = Math.round(img.width * r), H = Math.round(img.height * r);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, W, H);
  const id = ctx.getImageData(0, 0, W, H), d = id.data;
  // color promedio del borde
  let br = 0, bg = 0, bb = 0, cnt = 0;
  const samp = (x, y) => { const i = (y * W + x) * 4; br += d[i]; bg += d[i + 1]; bb += d[i + 2]; cnt++; };
  for (let x = 0; x < W; x += 2) { samp(x, 0); samp(x, H - 1); }
  for (let y = 0; y < H; y += 2) { samp(0, y); samp(W - 1, y); }
  br /= cnt; bg /= cnt; bb /= cnt;
  const dist = (i, r2, g2, b2) => Math.hypot(d[i] - r2, d[i + 1] - g2, d[i + 2] - b2);
  const bgMask = new Uint8Array(W * H);
  const stack = [];
  const T = tol, Tn = tol * 0.45;
  const push = (x, y) => { const p = y * W + x; if (!bgMask[p] && dist(p * 4, br, bg, bb) < T) { bgMask[p] = 1; stack.push(p); } };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const p = stack.pop(), x = p % W, y = (p / W) | 0, i = p * 4;
    const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
    for (const [nx, ny] of nb) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx; if (bgMask[q]) continue;
      const j = q * 4;
      if (dist(j, br, bg, bb) < T || dist(j, d[i], d[i + 1], d[i + 2]) < Tn) { bgMask[q] = 1; stack.push(q); }
    }
  }
  // alfa + erosión 1px (quita el halo) + suavizado
  let a = new Float32Array(W * H);
  for (let p = 0; p < W * H; p++) a[p] = bgMask[p] ? 0 : 1;
  const er = new Float32Array(a);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const p = y * W + x; if (a[p] && (!a[p - 1] || !a[p + 1] || !a[p - W] || !a[p + W])) er[p] = 0; }
  a = er;
  for (let pass = 0; pass < feather; pass++) {
    const b2 = new Float32Array(a);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const p = y * W + x; b2[p] = (a[p] * 4 + a[p - 1] + a[p + 1] + a[p - W] + a[p + W]) / 8; }
    a = b2;
  }
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let p = 0; p < W * H; p++) {
    d[p * 4 + 3] = Math.round(a[p] * 255);
    if (a[p] > 0.5) { const x = p % W, y = (p / W) | 0; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  ctx.putImageData(id, 0, 0);
  if (maxX <= minX) return { url: c.toDataURL('image/png'), ratio: 0 };
  const pad = 8; minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
  const o = document.createElement('canvas'); o.width = maxX - minX + 1; o.height = maxY - minY + 1;
  o.getContext('2d').drawImage(c, minX, minY, o.width, o.height, 0, 0, o.width, o.height);
  const fg = a.reduce((s, v) => s + (v > 0.5 ? 1 : 0), 0) / (W * H);
  return { url: o.toDataURL('image/png'), ratio: fg };
}
function openPhoto() {
  const m = me();
  let src = null, out = null;
  const l = full('Foto de ficha', `
    <p class="muted">Sube una foto de cuerpo completo en guardia. La app quita el fondo y recorta tu silueta automáticamente.</p>
    <label class="btn primary block" for="phFile">${I.upload}Elegir foto</label><input type="file" id="phFile" accept="image/*" hidden>
    <div class="bg-tool stack" id="phTool" hidden>
      <canvas id="phCanvas" width="600" height="600"></canvas>
      <div class="field"><label for="phTol">Sensibilidad del fondo: <b class="num" id="phTolV">60</b></label><input type="range" id="phTol" min="15" max="140" value="60"></div>
      <div class="field"><label for="phFea">Suavizado del borde: <b class="num" id="phFeaV">2</b></label><input type="range" id="phFea" min="0" max="5" value="2"></div>
      <p class="small muted" id="phMsg"></p>
      <div class="grid2"><button type="button" class="btn" id="phOrig">Usar sin recorte</button><button type="button" class="btn primary" id="phSave">${I.check}Guardar</button></div>
    </div>
    ${m.photo ? `<button type="button" class="btn ghost block danger" id="phDel">${I.trash}Quitar foto actual</button>` : ''}
    <p class="small muted">Para mejores resultados: fondo liso y de color distinto a tu ropa. En producción este paso usa un modelo de segmentación en el servidor para bordes perfectos.</p>`);
  const el = l.el;
  const cv = $('#phCanvas', el);
  const process = () => {
    if (!src) return;
    const tol = Number($('#phTol', el).value), fea = Number($('#phFea', el).value);
    $('#phTolV', el).textContent = tol; $('#phFeaV', el).textContent = fea;
    out = removeBackground(src, tol, fea);
    const im = new Image(); im.onload = () => {
      const ctx = cv.getContext('2d'); cv.width = 600; cv.height = 600; ctx.clearRect(0, 0, 600, 600);
      const r = Math.min(580 / im.width, 580 / im.height); ctx.drawImage(im, (600 - im.width * r) / 2, 600 - im.height * r - 10, im.width * r, im.height * r);
    }; im.src = out.url;
    $('#phMsg', el).textContent = out.ratio < 0.05 ? 'Se quitó casi todo. Baja la sensibilidad.' : out.ratio > 0.85 ? 'No se detectó el fondo. Sube la sensibilidad o usa un fondo más liso.' : 'Ajusta la sensibilidad hasta que el borde se vea limpio.';
  };
  let t;
  const deb = () => { clearTimeout(t); t = setTimeout(process, 120); };
  $('#phTol', el).oninput = deb; $('#phFea', el).oninput = deb;
  $('#phFile', el).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const img = new Image(); img.onload = () => { src = img; $('#phTool', el).hidden = false; process(); }; img.src = URL.createObjectURL(f);
  };
  $('#phSave', el).onclick = () => { if (!out) return; m.photo = out.url; save(); ui.fighterMode = 'foto'; popLayer(); render(); toast('Foto de ficha actualizada.', 'lime'); };
  $('#phOrig', el).onclick = () => {
    if (!src) return; const c = document.createElement('canvas'); const r = Math.min(1, 720 / Math.max(src.width, src.height));
    c.width = src.width * r; c.height = src.height * r; c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    m.photo = c.toDataURL('image/jpeg', 0.85); save(); ui.fighterMode = 'foto'; popLayer(); render(); toast('Foto guardada sin recorte.', 'lime');
  };
  const del = $('#phDel', el); if (del) del.onclick = () => { m.photo = null; save(); popLayer(); render(); };
}

function openEditProfile() {
  const m = me();
  const fields = [['name', 'Nombre', 'text'], ['alias', 'Apodo', 'text'], ['age', 'Edad', 'number'], ['nat', 'Nacionalidad', 'text'], ['weight', 'Peso (kg)', 'number'], ['height', 'Estatura (cm)', 'number'], ['reach', 'Alcance (cm)', 'number'], ['expYears', 'Años de experiencia', 'number']];
  const l = sheet(`<h3 class="h-sec">Editar ficha</h3><form id="epForm" class="stack">
    <div class="grid2">${fields.map(([k, lab, t]) => `<div class="field"><label for="ep_${k}">${lab}</label><input class="input" id="ep_${k}" type="${t}" ${t === 'number' ? 'step="0.1" min="0"' : 'maxlength="40"'} value="${esc(m[k])}" required></div>`).join('')}</div>
    <div class="field"><label for="ep_guard">Guardia</label><select class="input" id="ep_guard">${['Ortodoxa', 'Zurda', 'Ambidiestra'].map(g => `<option ${g === m.guard ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
    <button class="btn primary block" type="submit">${I.check}Guardar cambios</button></form>`);
  $('#epForm', l.el).onsubmit = e => {
    e.preventDefault();
    fields.forEach(([k, , t]) => { const v = $('#ep_' + k, l.el).value.trim(); m[k] = t === 'number' ? Number(v) : v; });
    m.guard = $('#ep_guard', l.el).value; m.cat = categoryFor(m.weight);
    const key = new Date().toISOString().slice(0, 7);
    const last = m.weightLog[m.weightLog.length - 1];
    if (last && last.d.slice(0, 7) === key) last.kg = m.weight; else m.weightLog.push({ d: new Date().toISOString(), kg: m.weight });
    save(); popLayer(); render(); toast('Ficha actualizada.', 'lime');
  };
}
function openLogWeight() {
  const m = me();
  const l = sheet(`<h3 class="h-sec">Registrar peso</h3><form id="lwForm" class="stack"><div class="field"><label for="lwKg">Peso de hoy (kg)</label><input class="input num" id="lwKg" type="number" step="0.1" min="25" max="200" value="${m.weight}" required autofocus></div><button class="btn primary block" type="submit">Guardar</button></form>`);
  $('#lwForm', l.el).onsubmit = e => {
    e.preventDefault(); const kg = Number($('#lwKg', l.el).value);
    m.weight = kg; m.cat = categoryFor(kg);
    const key = new Date().toISOString().slice(0, 7), last = m.weightLog[m.weightLog.length - 1];
    if (last && last.d.slice(0, 7) === key) last.kg = kg; else m.weightLog.push({ d: new Date().toISOString(), kg });
    save(); popLayer(); render(); toast(`Peso registrado: ${kg} kg (${m.cat}).`, 'lime');
  };
}
