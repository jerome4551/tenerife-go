// Tenerife Go SW v6 - endurecido + notificaciones - 2026-08-07
/* Subir la version no es cosmetico: el manejador de 'activate' borra todo
   cache cuyo nombre no sea este. Hace falta para tirar las respuestas del
   tiempo que la v5 dejo guardadas para siempre. Si se quedara en v5, quien
   ya tenga la app instalada seguiria viendo la prevision del dia que la
   abrio por primera vez. */
const CACHE = 'tgo-v7-2026-09-01-teselas';

/* El cache del mapa va aparte y a proposito.

   Aparte del CACHE de la app porque el manejador de 'activate' borra todo
   cache cuyo nombre no sea el suyo: si las teselas vivieran ahi, cada
   actualizacion de la app dejaria al usuario otra vez sin mapa offline.
   Aqui sobreviven a las subidas de version; solo se van con el boton de
   vaciar del panel de informacion.

   El tope es por numero de teselas, no por bytes: una respuesta opaca no
   deja leer su tamano. La isla entera de z8 a z13 son 600 teselas contadas
   sobre la caja de navegacion del mapa, asi que 1.200 deja sitio de sobra
   para todo eso y para lo que se haya mirado de cerca. */
const TESELAS = 'tgo-teselas-v1';
const TESELAS_TOPE = 1200;
const CORE = [
  './', './index.html', './manifest.webmanifest',
  // Leaflet y MarkerCluster ya no vienen de un CDN: viven en ./vendor/.
  // Al ser del propio origen se precachean aqui, asi el mapa tambien
  // arranca sin conexion.
  './vendor/leaflet.js', './vendor/leaflet.css',
  './vendor/leaflet.markercluster.js', './vendor/MarkerCluster.css',
  // El motor del mapa vectorial. Va aqui desde el primer momento para que
  // cuando haga falta ya este: sin conexion no se puede ir a buscarlo.
  './vendor/pmtiles.js', './vendor/protomaps-leaflet.js',
  /* El mapa base de la isla: 1,1 MB de costa, red viaria y nucleos, hecho
     con datos que ya estaban en el repositorio. Va en el precache a
     proposito, no en una descarga aparte: quien se pierde en el monte no
     tuvo antes la precaucion de pulsar "descargar mapa". */
  './mapa/tenerife-base.pmtiles'
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
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== TESELAS).map(k => caches.delete(k))))
      .then(() => recortarTeselas())
      .then(() => self.clients.claim())
  );
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

/* Una tesela del mapa, y solo eso.

   El patron de OSM tiene que dejar fuera a nominatim.openstreetmap.org, que
   es un geocodificador y no se cachea. Por eso se compara el dominio entero
   y no con includes('openstreetmap'), que cogia a los dos. */
function esTesela(url) {
  return /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname)
      || url.hostname === 'server.arcgisonline.com';
}

/* El recorte no puede correr en cada tesela: keys() recorre el cache entero
   y al mover el mapa entran teselas a docenas. Corre cada 50 y ademas en
   cada 'activate'. El service worker puede morirse entre medias y reiniciar
   la cuenta, asi que el tope es un techo aproximado, no exacto: lo que
   importa es que exista y que 'activate' lo aplique siempre. */
let _desdeRecorte = 0;
function recortarTeselas() {
  return caches.open(TESELAS)
    .then(c => c.keys().then(ks => {
      if (ks.length <= TESELAS_TOPE) return;
      // keys() devuelve en orden de insercion: se van las mas viejas.
      return Promise.all(ks.slice(0, ks.length - TESELAS_TOPE).map(k => c.delete(k)));
    }))
    .catch(() => {});
}

function guardarTesela(req, res) {
  const copia = res.clone();
  return caches.open(TESELAS)
    .then(c => c.put(req, copia))
    .then(() => { if (++_desdeRecorte >= 50) { _desdeRecorte = 0; return recortarTeselas(); } })
    .catch(() => {});
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

  /* El mapa: red primero, cache de respaldo.

     Estaba en la lista de "no cachear nunca" junto a las APIs del tiempo,
     con el argumento de "siempre fresco". Pero una tesela no es un dato
     vivo: es contenido, igual que la Wikipedia, que esa lista ya deja pasar.
     Era el motivo de que la app se abriera sin mapa en un avion —el resto
     respondia y lo unico que importa, no— y de que "Mapa interactivo
     offline" fuera mentira.

     Se pide siempre a la red primero, asi que con conexion se comporta
     exactamente igual que antes. La politica de teselas de OSM pide
     respetar sus cabeceras de caducidad y de eso ya se encarga el cache
     HTTP del navegador, que es por donde pasa este fetch. Sin conexion sale
     lo que el usuario ya haya mirado. Y una tesela mala que se colara nunca
     se queda pegada: en linea se vuelve a pedir siempre.

     Se guarda tambien la respuesta opaca (type 'opaque', status 0). Las
     capas de index.html no piden CORS y no se les toca: cambiar crossOrigin
     arriesga romper el mapa en linea, que hoy funciona, y no hay forma de
     comprobar desde aqui que los dos servidores manden las cabeceras. Una
     opaca no se puede mirar por dentro, pero para servirsela a un <img>
     vale igual. */
  if (esTesela(url)) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && (res.type === 'opaque' || guardable(res))) e.waitUntil(guardarTesela(req, res));
        return res;
      }).catch(() => caches.open(TESELAS)
        .then(c => c.match(req))
        .then(r => r || Response.error()))
    );
    return;
  }

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
  if (url.hostname.includes('supabase.co') || url.hostname.includes('nominatim') ||
      EN_VIVO.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) {
    return; // no cachear apis, tiempo ni rutas - siempre fresco
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

/* ── MENSAJES DESDE LA APP ─────────────────────────────────────────
   index.html lleva tiempo mandando tres mensajes por postMessage y aqui
   no habia nadie escuchando, asi que los tres caian al vacio:

     SKIP_WAITING  lo manda el boton "hay una version nueva". Sin esto el
                   service worker nuevo se quedaba esperando y la app solo
                   se actualizaba por el recargar de emergencia de 1,5 s.
     GET_VERSION   por eso la pantalla de informacion enseñaba "?".
     CLEAR_CACHES  el boton de limpiar cache. Este es el peor de los tres:
                   la app esperaba 2 segundos, no recibia respuesta, y se
                   iba a un plan B que borra las caches cuyo nombre empieza
                   por "tenerife-". La nuestra se llama "tgo-...". No
                   coincidia ninguna. O sea que el boton decia que habia
                   limpiado y no borraba absolutamente nada.

   Se responde siempre por e.ports[0], que es el canal que abre la app. */
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
    return;
  }
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
    /* El tag hace que una notificacion nueva sustituya a la anterior en vez
       de amontonarse. Por defecto sigue siendo 'tgo-diaria', que es lo que
       se quiere para la frase de cada dia.

       Pero ahora puede venir en el mensaje: un aviso puntual -el eclipse-
       no debe borrar la frase del dia ni que la frase del dia siguiente lo
       borre a el. Cada cosa con su tag. */
    tag: (typeof d.tag === 'string' && d.tag) ? d.tag.slice(0, 40) : 'tgo-diaria',
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
