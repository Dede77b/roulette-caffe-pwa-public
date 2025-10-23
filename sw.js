// Service Worker per Roulette del Caffè
const CACHE_NAME = 'roulette-caffe-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // Lascia passare POST/PUT ecc.

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached; // Cache first per asset statici
      return fetch(req).then((res) => {
        // Metti in cache una copia delle risorse ottenute via GET
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => {
        // Fallback offline opzionale: puoi restituire una pagina offline
        // return caches.match('./offline.html');
      });
    })
  );
});
