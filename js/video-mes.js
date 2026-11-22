'use strict';
/* Video del mes: extracción de cuadros para el visor 360 y comparación de progreso entre meses. */

// ---- Video del mes: extrae cuadros para el visor 360 ----
async function extractFrames(file, n, onProgress) {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
  await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('No se pudo leer el video. Prueba con MP4 o MOV.')); setTimeout(() => rej(new Error('El video tardó demasiado en cargar.')), 15000); });
  const dur = v.duration;
  if (!isFinite(dur) || dur < 1) throw new Error('El video debe durar al menos 1 segundo.');
  const H = 520, r = H / v.videoHeight, W = Math.round(v.videoWidth * r);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  const frames = [];
  for (let i = 0; i < n; i++) {
    const t = Math.min(dur - 0.05, (dur * i) / n);
    await new Promise(res => { const h = () => { v.removeEventListener('seeked', h); res(); }; v.addEventListener('seeked', h); v.currentTime = t; });
    ctx.drawImage(v, 0, 0, W, H);
    frames.push(c.toDataURL('image/jpeg', 0.7));
    onProgress((i + 1) / n);
  }
  URL.revokeObjectURL(url);
  return frames;
}
function openVideo() {
  const m = me();
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const l = full('Video del mes', `
    <p class="muted">Cada mes grábate girando sobre tu eje. La app lo separa en cuadros para que puedas girar tu ficha deslizando el dedo y comparar tu progreso mes a mes.</p>
    <div class="card stack small">
      <p class="eyebrow lime">Cómo grabarlo</p>
      <p>1. Fondo liso y buena luz, cámara fija a la altura del pecho.</p>
      <p>2. Gira despacio una vuelta completa en guardia, de 8 a 12 segundos.</p>
      <p>3. Que se vea todo el cuerpo, de la cabeza a los pies.</p>
    </div>
    <div class="field"><label for="nFrames">Cuadros: <b class="num" id="nfV">48</b> (más cuadros = giro más fluido, archivo más pesado)</label><input type="range" id="nFrames" min="24" max="72" step="12" value="48"></div>
    <label class="btn primary block" for="vidFile">${I.upload}Elegir video de ${esc(monthLabel)}</label>
    <input type="file" id="vidFile" accept="video/*" hidden>
    <div id="vProg" hidden class="stack"><div class="bar"><i style="width:0%"></i></div><p class="small muted" id="vMsg">Procesando…</p></div>
    <div id="vPrev"></div>
    <section class="stack"><h3 class="h-sec">Mis videos</h3><div id="vList"></div></section>`);
  const el = l.el;
  $('#nFrames', el).oninput = e => { $('#nfV', el).textContent = e.target.value; };
  const list = () => {
    const vs = (m.videos || []).slice().sort((a, b) => a.month < b.month ? 1 : -1);
    $('#vList', el).innerHTML = vs.length ? `<div class="list">${vs.map(v => `<div class="list-item"><div class="grow"><p class="t">${esc(v.label)}</p><p class="s">${v.frames.length} cuadros</p></div><button type="button" class="icon-btn" data-del="${v.month}" aria-label="Eliminar video">${I.trash}</button></div>`).join('')}</div>` : '<p class="empty">Aún no subes videos. Mientras tanto se muestra la silueta 360 de demostración.</p>';
    $$('[data-del]', el).forEach(b => b.onclick = () => { m.videos = m.videos.filter(v => v.month !== b.dataset.del); save(); list(); render(); });
  };
  list();
  $('#vidFile', el).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    const prog = $('#vProg', el); prog.hidden = false;
    const bar = prog.querySelector('i');
    try {
      const frames = await extractFrames(f, Number($('#nFrames', el).value), p => { bar.style.width = (p * 100).toFixed(0) + '%'; $('#vMsg', el).textContent = `Extrayendo cuadros… ${Math.round(p * 100)}%`; });
      m.videos = (m.videos || []).filter(v => v.month !== monthKey);
      m.videos.push({ month: monthKey, label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), frames });
      m.xp += 40; save();
      $('#vMsg', el).textContent = 'Listo. Arrastra para girar. +40 XP por tu video del mes.';
      $('#vPrev', el).innerHTML = `<div class="fighter">${stageHTML(360, 'Arrastra para girar')}</div>`;
      mountViewer($('#vPrev .fighter-stage', el), { type: 'frames', frames });
      list(); ui.fighterMode = 'video'; render();
    } catch (err) { $('#vMsg', el).textContent = err.message; }
  };
}

function openCompare() {
  const m = me();
  let vids = (m.videos || []).slice().sort((a, b) => a.month < b.month ? -1 : 1);
  const demo = vids.length < 2;
  const opts = demo ? [{ label: 'Hace 3 meses (demo)', src: { type: 'demo', bulk: 0.9, auto: false } }, { label: 'Este mes (demo)', src: { type: 'demo', bulk: 1.06, auto: false } }]
    : vids.map(v => ({ label: v.label, src: { type: 'frames', frames: v.frames, auto: false } }));
  let a = 0, b = opts.length - 1;
  const l = full('Comparar progreso', `
    ${demo ? '<p class="small muted">Sube al menos dos videos del mes para comparar los tuyos. Esto es una demostración con la silueta.</p>' : ''}
    <div class="grid2">${['A', 'B'].map(k => `<select class="input" id="sel${k}" aria-label="Mes ${k}">${opts.map((o, i) => `<option value="${i}">${esc(o.label)}</option>`).join('')}</select>`).join('')}</div>
    <div class="compare"><div class="cell" id="cA">${stageHTML(0, '')}</div><div class="cell" id="cB">${stageHTML(0, '')}</div></div>
    <div class="field"><label for="cmpR">Gira ambos al mismo ángulo</label><input type="range" id="cmpR" min="0" max="1000" value="80"></div>
    <p class="small muted">Compara postura, guardia y volumen muscular desde el mismo ángulo.</p>`);
  const el = l.el;
  $('#selA', el).value = a; $('#selB', el).value = b;
  let va, vb;
  const setup = () => {
    $('#cA', el).innerHTML = stageHTML(0, ''); $('#cB', el).innerHTML = stageHTML(0, '');
    const sa = el.querySelector('#cA .fighter-stage'), sb = el.querySelector('#cB .fighter-stage');
    sa.style.height = sb.style.height = '100%';
    va = mountViewer(sa, opts[a].src); vb = mountViewer(sb, opts[b].src); sync();
  };
  const sync = () => { const r = Number($('#cmpR', el).value) / 1000; va.set(Math.floor(r * (va.count - 1))); vb.set(Math.floor(r * (vb.count - 1))); };
  $('#cmpR', el).oninput = sync;
  $('#selA', el).onchange = e => { a = Number(e.target.value); setup(); };
  $('#selB', el).onchange = e => { b = Number(e.target.value); setup(); };
  requestAnimationFrame(setup);
}
