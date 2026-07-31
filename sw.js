// Tenerife Go SW v4 - endurecido - 2026-07-31
const CACHE = 'tgo-v4-2026-07-31-secure';
const CORE = [
  './', './index.html', './manifest.webmanifest',
  // Leaflet y MarkerCluster ya no vienen de un CDN: viven en ./vendor/.
  // Al ser del propio origen se precachean aqui, asi el mapa tambien
  // arranca sin conexion.
  './vendor/leaflet.js', './vendor/leaflet.css',
  './vendor/leaflet.markercluster.js', './vendor/MarkerCluster.css'
];

self.addEventListener('install', e => {
  // Uno a uno en vez de addAll: addAll es atomico y un solo fichero que
  // faltara tumbaria toda la instalacion.
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))
    )).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});

/* Que se puede guardar en el cache.

   Para la app (index.html) se exige ademas que sea del propio origen y
   sin redirecciones: antes valia cualquier respuesta, asi que una pagina
   de error 404/500 de GitHub Pages, o el portal cautivo del wifi de un
   hotel, quedaban grabados como si fueran la app y se seguian mostrando
   sin conexion hasta limpiar el cache a mano. */
function guardableShell(res) {
  return res && res.ok && res.type === 'basic' && !res.redirected;
}
function guardable(res) {
  return res && res.ok && (res.type === 'basic' || res.type === 'cors');
}

/* El clon hay que hacerlo YA, no dentro del .then: para cuando ese
   callback corre, el navegador puede haber empezado a leer el cuerpo y
   res.clone() lanza "Response body is already used". */
function guardar(req, res) {
  const copia = res.clone();
  caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
}

self.addEventListener('fetch', e => {
  const req = e.request;

  // Solo GET. Un POST (login, guardar favoritos) no se toca; ademas
  // cache.put() con un POST lanza excepcion.
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Solo http/https: con chrome-extension:// y similares, cache.put falla.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (url.hostname.includes('supabase.co') || url.hostname.includes('nominatim') || url.hostname.includes('openstreetmap') || url.hostname.includes('arcgisonline')) {
    return; // no cachear mapas ni apis - siempre fresco
  }

  e.respondWith(
    caches.match(req).then(cached => {
      // Network first for index.html to get updates fast
      if (req.url.endsWith('index.html') || req.url.endsWith('/')) {
        return fetch(req).then(res => {
          if (guardableShell(res)) guardar(req, res);
          return res;
        }).catch(() => cached);
      }
      return cached || fetch(req).then(res => {
        if (guardable(res)) guardar(req, res);
        return res;
      });
    })
  );
});
