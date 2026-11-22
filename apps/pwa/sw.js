/* Service worker: la app abre sin conexión una vez instalada */
const CACHE = 'contragolpe-v4';
const ASSETS = ['./', './index.html', './styles.css', './js/core.js', './js/acceso.js', './js/perfil.js', './js/visor360.js', './js/socio.js', './js/gym.js', './js/checkin.js', './js/clases.js', './js/video-mes.js', './js/gamificacion.js', './js/panel.js', './js/compartir.js', './js/main.js', './data.js', './manifest.json', './icon.svg', './vendor/qrcode.min.js', './vendor/jsQR.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res;
  }).catch(() => caches.match('./index.html'))));
});
