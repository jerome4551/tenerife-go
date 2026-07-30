// Tenerife Go SW v3 - Fix black bands + fast - 2026-07-29
const CACHE = 'tgo-v3-2026-07-29-fast-fix';
const CORE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('supabase.co') || url.hostname.includes('nominatim') || url.hostname.includes('openstreetmap') || url.hostname.includes('arcgisonline')) {
    return; // no cachear mapas ni apis - siempre fresco
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Network first for index.html to get updates fast
      if (e.request.url.endsWith('index.html') || e.request.url.endsWith('/')) {
        return fetch(e.request).then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(() => cached);
      }
      return cached || fetch(e.request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});
