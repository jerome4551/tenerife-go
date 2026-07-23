/* ══════════════════════════════════════════════════════════════════
   TENERIFE GO — Service Worker
   ──────────────────────────────────────────────────────────────────
   Responsabilidades:
     1. Guardar la app (index.html) para que abra sin conexion.
     2. Guardar las teselas del mapa que el usuario ya ha visitado.
     3. Responder a los mensajes que envia la app:
        GET_VERSION · CLEAR_CACHES · SKIP_WAITING

   REGLA DE ORO: nunca interceptar las APIs en vivo (clima, Supabase,
   rutas, Wikipedia, analitica). Si se cachearan, el usuario veria el
   tiempo de ayer o datos obsoletos. Esas peticiones pasan de largo.

   Al cambiar la app, subir tambien este archivo con VERSION nueva.
   ══════════════════════════════════════════════════════════════════ */
'use strict';

var VERSION      = 'v1.0.0';
var CACHE_SHELL  = 'tenerife-go-shell-' + VERSION;
var CACHE_TILES  = 'tenerife-tiles-v1';   // se conserva entre versiones
var MAX_TILES    = 3000;                  // tope para no llenar el movil

/* Ficheros minimos de la app. Se mantiene corto a proposito: si uno
   fallara, toda la instalacion fallaria. Los extras se cachean solos
   conforme se usan. */
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest'
];

/* Dominios de datos en vivo: NUNCA se interceptan ni se cachean. */
var LIVE_APIS = [
  'supabase.co',
  'nominatim.openstreetmap.org',
  'router.project-osrm.org',
  'aemet.es',
  'open-meteo.com',
  'wikipedia.org',
  'wikimedia.org',
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com'
];

function isLiveApi(url) {
  for (var i = 0; i < LIVE_APIS.length; i++) {
    if (url.hostname.indexOf(LIVE_APIS[i]) !== -1) return true;
  }
  return false;
}

function isMapTile(url) {
  return url.hostname.indexOf('tile.openstreetmap.org') !== -1 ||
         url.hostname.indexOf('tile.opentopomap.org')   !== -1 ||
         /\/tiles?\//.test(url.pathname) && /\.(png|jpg|jpeg|webp)$/i.test(url.pathname);
}

/* ── Instalacion: guardar la app ─────────────────────────────────── */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then(function(cache) {
        // addAll es atomico: si uno falla, falla todo. Por eso vamos
        // uno a uno y toleramos ausencias (ej. manifest aun no subido).
        return Promise.all(SHELL.map(function(u) {
          return cache.add(new Request(u, { cache: 'reload' }))
                      .catch(function() { /* recurso opcional */ });
        }));
      })
      .then(function() { return self.skipWaiting(); })
      .catch(function() { /* nunca bloquear la instalacion */ })
  );
});

/* ── Activacion: limpiar versiones viejas ────────────────────────── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        // Borrar shells antiguos; conservar las teselas del usuario
        if (k.indexOf('tenerife-go-shell-') === 0 && k !== CACHE_SHELL) {
          return caches.delete(k);
        }
        return null;
      }));
    }).then(function() {
      return self.clients.claim();
    }).catch(function() {})
  );
});

/* ── Limitar el numero de teselas guardadas ──────────────────────── */
function trimTileCache(cache) {
  cache.keys().then(function(keys) {
    if (keys.length <= MAX_TILES) return;
    // Borrar las mas antiguas (las primeras que entraron)
    var excess = keys.length - MAX_TILES;
    for (var i = 0; i < excess; i++) cache.delete(keys[i]);
  }).catch(function() {});
}

/* ── Intercepcion de peticiones ──────────────────────────────────── */
self.addEventListener('fetch', function(event) {
  var req = event.request;

  // Solo GET. Nunca tocar POST/PUT (login, guardado de favoritos...).
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Solo http/https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Datos en vivo: pasar de largo, sin tocar.
  if (isLiveApi(url)) return;

  /* 1) Navegacion (abrir la app): red primero, cache de respaldo.
        Asi siempre ve la ultima version si hay internet, y si no,
        abre igualmente desde el movil. */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function(res) {
          var copy = res.clone();
          caches.open(CACHE_SHELL).then(function(c) {
            c.put('./index.html', copy);
          }).catch(function() {});
          return res;
        })
        .catch(function() {
          return caches.match('./index.html', { ignoreSearch: true })
                 .then(function(hit) {
                   return hit || caches.match('./');
                 });
        })
    );
    return;
  }

  /* 2) Teselas del mapa: cache primero (son inmutables).
        Es lo que hace que el mapa funcione sin cobertura. */
  if (isMapTile(url)) {
    event.respondWith(
      caches.match(req).then(function(hit) {
        if (hit) return hit;
        return fetch(req).then(function(res) {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            var copy = res.clone();
            caches.open(CACHE_TILES).then(function(c) {
              c.put(req, copy);
              trimTileCache(c);
            }).catch(function() {});
          }
          return res;
        }).catch(function() {
          // Sin conexion y sin tesela guardada: dejar el hueco gris
          return new Response('', { status: 504, statusText: 'offline' });
        });
      })
    );
    return;
  }

  /* 3) Recursos propios (mismo origen): cache primero, red de respaldo. */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(function(hit) {
        if (hit) return hit;
        return fetch(req).then(function(res) {
          if (res && res.status === 200) {
            var copy = res.clone();
            caches.open(CACHE_SHELL).then(function(c) {
              c.put(req, copy);
            }).catch(function() {});
          }
          return res;
        });
      }).catch(function() {
        return fetch(req);
      })
    );
    return;
  }

  /* 4) Resto (CDN de Leaflet, fuentes...): red primero, cache de respaldo. */
  event.respondWith(
    fetch(req).then(function(res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE_SHELL).then(function(c) {
          c.put(req, copy);
        }).catch(function() {});
      }
      return res;
    }).catch(function() {
      return caches.match(req);
    })
  );
});

/* ── Mensajes desde la app ───────────────────────────────────────── */
self.addEventListener('message', function(event) {
  var data = event.data || {};
  var port = event.ports && event.ports[0];

  if (data.type === 'GET_VERSION') {
    if (port) port.postMessage({ version: VERSION });
    return;
  }

  if (data.type === 'CLEAR_CACHES') {
    caches.keys().then(function(keys) {
      return Promise.all(keys
        .filter(function(k) { return k.indexOf('tenerife-') === 0; })
        .map(function(k) { return caches.delete(k); }));
    }).then(function() {
      if (port) port.postMessage({ cleared: true });
    }).catch(function() {
      if (port) port.postMessage({ cleared: false });
    });
    return;
  }

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
});
