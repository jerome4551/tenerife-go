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

var VERSION      = 'v1.3.0';
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


/* ── NOTIFICACIONES ───────────────────────────────────────────────
   Solo llegan a quien instalo la app y acepto expresamente. En iOS no
   hay otra via: el Push API solo existe para apps de pantalla de
   inicio, y el permiso debe pedirse tras una accion del usuario.      */

/* Datos para reenganchar la suscripcion si el navegador la rota.
   La clave publica y la clave anon son publicas (ya estan en index.html);
   la tabla push_subs solo admite altas gracias a RLS. */
var SW_VAPID_PUB = 'BJZPN4_lITIaqCcITXNGsLLYj0z3Pbe1Ni0ayXMlsqKUXY1vydDpHIuSyA4nTF0fxlb27Bnq6O0Bij467k_iy-I';
var SW_SB_URL    = 'https://aupjvdrubjytryzqirdn.supabase.co';
var SW_SB_KEY    = 'sb_publishable_s046jzmX04KG2_F_VEf97w_R-9gr1ms';

function swB64(base64) {
  var pad = '='.repeat((4 - base64.length % 4) % 4);
  var b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  var raw = atob(b64);
  var arr = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

self.addEventListener('push', function (event) {
  var d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) {
    try { d = { body: event.data.text() }; } catch (e2) { d = {}; }
  }
  var titulo = d.title || 'Tenerife Go';
  var opciones = {
    body: d.body || '',
    icon: d.icon || './icon-192.png',
    badge: './icon-192.png',
    tag: d.tag || 'tgo-diario',      // sustituye a la anterior, no acumula
    renotify: false,
    data: { url: d.url || './index.html' },
    lang: d.lang || 'es'
  };
  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var destino = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (lista) {
        // Si la app ya esta abierta, se trae al frente en vez de duplicarla
        for (var i = 0; i < lista.length; i++) {
          if ('focus' in lista[i]) return lista[i].focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(destino);
      })
  );
});

/* Si el navegador rota la suscripcion, se vuelve a suscribir con la clave
   VAPID y se guarda la nueva en Supabase (misma tabla que el cliente).
   Antes apuntaba a './__resub', que no existe en GitHub Pages: el aviso
   se perdia y el dispositivo dejaba de recibir sin que nadie lo supiera. */
self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: swB64(SW_VAPID_PUB)
    })
      .then(function (nueva) {
        var j = nueva.toJSON();
        if (!j || !j.keys) return;
        return fetch(SW_SB_URL + '/rest/v1/push_subs?on_conflict=endpoint', {
          method: 'POST',
          headers: {
            'apikey': SW_SB_KEY,
            'Authorization': 'Bearer ' + SW_SB_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=ignore-duplicates'
          },
          body: JSON.stringify({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth })
        }).catch(function () {});
      })
      .catch(function () {})
  );
});
