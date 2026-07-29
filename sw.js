// Tenerife Go SW v2 - Offline real
const CACHE = 'tgo-v2-2026-07-28';
const CORE = ['./', './index.html', './styles.css', './js/app.js', './js/config.js', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // No cachear supabase ni nominatim
  if (url.hostname.includes('supabase.co') || url.hostname.includes('nominatim')) {
    return fetch(e.request);
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
