'use strict';
/* Tarjeta de peleador para redes sociales (1080 × 1920) y compartir. */

// ---- Tarjeta para redes (1080×1920) ----
function buildShareCard(m) {
  return new Promise(resolve => {
    const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), st = stats(m);
    x.fillStyle = '#090a08'; x.fillRect(0, 0, W, H);
    const rg = x.createRadialGradient(W / 2, 700, 50, W / 2, 700, 800); rg.addColorStop(0, 'rgba(200,255,46,.35)'); rg.addColorStop(1, 'rgba(200,255,46,0)');
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(200,255,46,.06)'; x.lineWidth = 3;
    for (let i = -H; i < W + H; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H * 0.58, H); x.stroke(); }
    x.font = '400 250px Anton, Impact, sans-serif'; x.textAlign = 'center';
    x.strokeStyle = 'rgba(200,255,46,.3)'; x.lineWidth = 3; x.strokeText(m.alias.toUpperCase(), W / 2, 380);
    const finish = () => {
      x.save(); x.translate(0, 1180); x.rotate(-0.07); x.fillStyle = '#c8ff2e'; x.fillRect(-50, 0, W + 100, 92);
      x.fillStyle = '#0d1203'; x.font = '400 60px Anton, Impact, sans-serif'; x.textAlign = 'left';
      x.fillText('CONTRAGOLPE BOXING · LISTO PARA PELEAR ·', 30, 70); x.restore();
      x.textAlign = 'left'; x.fillStyle = '#c8ff2e'; x.font = '600 46px "Barlow Condensed", sans-serif';
      x.fillText('"' + m.alias.toUpperCase() + '"   NIVEL ' + st.lvl.level + ' · ' + st.lvl.title.toUpperCase(), 70, 1370);
      x.fillStyle = '#f1f5ea'; x.font = '400 120px Anton, Impact, sans-serif'; x.fillText(m.name.toUpperCase(), 70, 1495, W - 140);
      const cells = [['PESO', m.weight + ' KG'], ['CATEGORÍA', m.cat.toUpperCase()], ['GUARDIA', m.guard.toUpperCase()], ['RACHA', m.streak + ' DÍAS'], ['SESIONES', nf(m.totalSessions)], ['RÉCORD', m.spar.w + '-' + m.spar.l + '-' + m.spar.d]];
      cells.forEach((cc, i) => {
        const cx = 70 + (i % 3) * 320, cy = 1560 + Math.floor(i / 3) * 140;
        x.fillStyle = '#8f9887'; x.font = '600 32px "Barlow Condensed", sans-serif'; x.fillText(cc[0], cx, cy + 30);
        x.fillStyle = '#f1f5ea'; x.font = '700 56px "Barlow Condensed", sans-serif'; x.fillText(cc[1], cx, cy + 92);
      });
      x.fillStyle = '#c8ff2e'; x.font = '700 40px "Barlow Condensed", sans-serif'; x.textAlign = 'center';
      x.fillText(S.gym.handle + '  ·  ' + S.gym.city.toUpperCase(), W / 2, H - 50);
      resolve(c.toDataURL('image/png'));
    };
    if (m.photo) {
      const im = new Image(); im.onload = () => {
        const r = Math.min(900 / im.width, 900 / im.height); const w = im.width * r, h = im.height * r;
        x.save(); x.shadowColor = 'rgba(200,255,46,.5)'; x.shadowBlur = 50; x.drawImage(im, (W - w) / 2, 1200 - h, w, h); x.restore(); finish();
      }; im.onerror = finish; im.src = m.photo;
    } else {
      const off = document.createElement('canvas'); off.width = 900; off.height = 900;
      drawFighter(off.getContext('2d'), 900, 900, 0.55, 1); x.drawImage(off, 90, 300); finish();
    }
  });
}
async function openShare() {
  const m = me();
  const l = sheet(`<h3 class="h-sec">Tu tarjeta de peleador</h3><p class="small muted">Formato historia de Instagram (1080 × 1920). Etiqueta a ${esc(S.gym.handle)}.</p><div id="shPrev" class="empty">Generando…</div>
    <div class="grid2"><a class="btn" id="shDl" download="contragolpe-${esc(m.alias.toLowerCase().replace(/\s+/g, '-'))}.png">${I.upload}Descargar</a><button type="button" class="btn primary" id="shCopy">${I.copy}Copiar texto</button></div>
    <p class="small muted">Si la descarga no inicia, mantén presionada la imagen para guardarla.</p>`);
  const url = await buildShareCard(m);
  if (!l.el.isConnected) return;
  $('#shPrev', l.el).outerHTML = `<img class="share-preview" src="${url}" alt="Tarjeta de peleador de ${esc(m.name)}">`;
  $('#shDl', l.el).href = url;
  $('#shDl', l.el).onclick = async e => {
    m.shared = (m.shared || 0) + 1; save();
    // App nativa (APK / iOS): guarda la imagen y abre el menú para compartir (Instagram, WhatsApp, galería…)
    if (isNative()) {
      e.preventDefault();
      try {
        const { Filesystem, Share } = window.Capacitor.Plugins;
        const name = 'contragolpe-' + Date.now() + '.png';
        const res = await Filesystem.writeFile({ path: name, data: url.split(',')[1], directory: 'CACHE' });
        await Share.share({ title: 'Mi ficha Contragolpe', text: `${m.name} "${m.alias}" ${S.gym.handle}`, files: [res.uri] });
      } catch (err) { toast('No se pudo compartir la imagen: ' + (err && err.message ? err.message : 'error')); }
    }
  };
  $('#shCopy', l.el).onclick = async () => {
    const txt = `${m.name} "${m.alias}" · Nivel ${stats(m).lvl.level} · ${m.streak} días de racha en ${S.gym.name} 🥊 ${S.gym.handle}`;
    try { await navigator.clipboard.writeText(txt); toast('Texto copiado. Pégalo en tu historia.', 'lime'); m.shared = (m.shared || 0) + 1; save(); }
    catch (e) { toast('No se pudo copiar. Selecciona el texto manualmente.'); }
  };
}
