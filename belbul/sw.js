/* BELBUL — Tenerife Living · service worker v1 · 2026-08-16

   Subir el numero de version no es cosmetico: el manejador de 'activate'
   borra toda cache cuyo nombre no sea este. Es la unica forma de que a
   quien ya tenga la app instalada le llegue una version nueva del
   contenido legal o de las tarifas.

   La app no consulta ninguna API: todo -textos, propiedades, tipos
   impositivos- viaja dentro de index.html. Por eso aqui no hay lista de
   dominios "en vivo" que excluir; basta con no cachear nada de fuera. */

const CACHE = 'belbul-v1-2026-08-16';

/* El nucleo: lo imprescindible para que la app arranque sin conexion.
   Las fuentes solo se precachean en su version latina, que es la que usan
   espanol, ingles y frances. El cirilico del bulgaro y los acentos raros
   del latin-ext se guardan cuando de verdad hagan falta (mas abajo), para
   no cargar 600 KB de tipografia en la primera visita de nadie. */
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.jpg',
  './mark.jpg',
  './icon-192.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './fonts/Cinzel-600-belbul.woff2',
  './fonts/Jost-300-latin.woff2',
  './fonts/Jost-400-latin.woff2',
  './fonts/Jost-500-latin.woff2',
  './fonts/Jost-600-latin.woff2',
  './fonts/PlayfairDisplay-600-latin.woff2',
  './fonts/PlayfairDisplay-700-latin.woff2',
  './fonts/PlayfairDisplay-400i-latin.woff2',
  './fonts/PlayfairDisplay-500i-latin.woff2'
];

self.addEventListener('install', e => {
  /* Uno a uno en vez de addAll: addAll es atomico y un solo fichero que
     faltara -o un 404 pasajero- tumbaria la instalacion entera. */
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))
    )).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Que se puede guardar.

   Para la app se exige ademas que sea del propio origen y sin redirigir:
   si no, una pagina de error de GitHub Pages o el portal cautivo del wifi
   de un hotel se graban como si fueran la app y se siguen mostrando sin
   conexion hasta limpiar la cache a mano. */
function guardableShell(res) {
  return res && res.ok && res.type === 'basic' && !res.redirected;
}
function guardable(res) {
  return res && res.ok && res.type === 'basic';
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

  // Solo GET: cache.put() con un POST lanza excepcion.
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Solo http/https: con chrome-extension:// y similares, cache.put falla.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Nada de terceros. Hoy la app no pide nada fuera -las fuentes se
  // sirven desde aqui, que antes venian del CDN de Google y por eso no
  // arrancaba bien sin conexion-, y conviene que siga siendo asi.
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(cached => {
      /* La app, primero de la red: asi un cambio en los tipos impositivos
         o en el marco legal llega en la siguiente carga y no en la
         siguiente semana. Sin conexion cae a la copia guardada. */
      if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
        return fetch(req).then(res => {
          if (guardableShell(res)) guardar(req, res);
          return res;
        }).catch(() => cached || caches.match('./index.html'));
      }
      /* Todo lo demas -fuentes, iconos, imagenes- primero de la cache:
         no cambia nunca sin cambiar tambien de version de cache. Aqui es
         donde acaban guardandose el cirilico y el latin-ext la primera
         vez que alguien mira la app en bulgaro. */
      return cached || fetch(req).then(res => {
        if (guardable(res)) guardar(req, res);
        return res;
      });
    })
  );
});

/* Permite a la app forzar la actualizacion sin esperar a que se cierren
   todas las pestanas, y preguntar que version tiene instalada. */
self.addEventListener('message', e => {
  const d = e.data || {};
  const responder = msg => { try { if (e.ports && e.ports[0]) e.ports[0].postMessage(msg); } catch (_) {} };

  if (d.type === 'SKIP_WAITING') { self.skipWaiting(); responder({ ok: true }); return; }
  if (d.type === 'GET_VERSION')  { responder({ version: CACHE }); return; }
  if (d.type === 'CLEAR_CACHES') {
    e.waitUntil(
      caches.keys()
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => responder({ ok: true }))
        .catch(() => responder({ ok: false }))
    );
  }
});
