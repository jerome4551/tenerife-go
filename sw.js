// Tenerife Go SW v6 - endurecido + notificaciones - 2026-08-07
/* Subir la version no es cosmetico: el manejador de 'activate' borra todo
   cache cuyo nombre no sea este. Hace falta para tirar las respuestas del
   tiempo que la v5 dejo guardadas para siempre. Si se quedara en v5, quien
   ya tenga la app instalada seguiria viendo la prevision del dia que la
   abrio por primera vez. */
const CACHE = 'tgo-v6-2026-08-07-vivo';
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

  /* Lo que NO se cachea nunca.

     A la lista de siempre -supabase, mapas y geocodificador- se le anaden
     el tiempo y las rutas, que es de donde venia un fallo que no se veia.

     Las URLs del tiempo no llevan fecha: el panel del sol pide siempre
     exactamente
       api.open-meteo.com/v1/forecast?latitude=<las 6 zonas>&current=...
     byte a byte la misma cadena hoy, manana y dentro de un mes. Como este
     manejador responde `cached || fetch(req)`, en cuanto esa respuesta
     entraba una vez en el cache ya no se volvia a preguntar a la red jamas.
     La app tiene su propio cache de 30 minutos y lo hace bien: cuando
     caducaba, llamaba a fetch... y el service worker le devolvia la misma
     prevision del primer dia. De ahi que saliera "la misma prevision
     durante muchos dias".

     Afecta a lo mismo en el estado del mar, el "donde me bano" y los
     avisos de AEMET, y a las rutas de OSRM.

     Aqui no se pone caducidad ni se cambia a red-primero: no hace falta.
     Cada modulo ya guarda su ultima lectura buena en localStorage con 30
     minutos de vida y tira de ella en el catch si no hay red. El cache del
     service worker solo estorbaba. Lo que si se queda cacheado es
     Wikipedia: eso es contenido, no un dato vivo, y ahi ayuda sin mentir. */
  const EN_VIVO = ['open-meteo.com', 'aemet.es', 'project-osrm.org'];
  if (url.hostname.includes('supabase.co') || url.hostname.includes('nominatim') || url.hostname.includes('openstreetmap') || url.hostname.includes('arcgisonline') ||
      EN_VIVO.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) {
    return; // no cachear mapas, apis, tiempo ni rutas - siempre fresco
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

/* ── NOTIFICACIONES ────────────────────────────────────────────────
   Sin estos dos manejadores la cadena de la notificacion diaria se
   cortaba en el ultimo paso: la app suscribia el dispositivo, el
   workflow enviaba el aviso con las claves VAPID... y aqui no habia
   nadie escuchando. El navegador acaba mostrando su propio mensaje
   generico de "este sitio se actualizo en segundo plano", y Chrome
   puede llegar a cancelar la suscripcion si eso se repite.

   El servidor manda {title, body, url, lang} desde
   enviar-notificacion.js. Se leen con tolerancia: si el cuerpo no es
   JSON valido se usa el texto tal cual, y si no hay nada se cae a un
   titulo por defecto, porque una notificacion vacia es peor que una
   escueta. */
self.addEventListener('push', e => {
  let d = {};
  if (e.data) {
    try { d = e.data.json() || {}; }
    catch (_) { try { d = { body: e.data.text() }; } catch (__) { d = {}; } }
  }
  const titulo = d.title || 'Tenerife Go';
  const opciones = {
    body: d.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    lang: d.lang || 'es',
    // Una sola notificacion diaria: el tag hace que la nueva sustituya
    // a la anterior en vez de amontonarse en la bandeja.
    tag: 'tgo-diaria',
    renotify: true,
    data: { url: d.url || './index.html' }
  };
  e.waitUntil(self.registration.showNotification(titulo, opciones));
});

/* Al tocar la notificacion: si la app ya esta abierta se trae al frente
   en vez de abrir una pestana mas. */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
      for (const c of lista) {
        if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow(destino);
    })
  );
});
