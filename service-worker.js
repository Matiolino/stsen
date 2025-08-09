// Simple cache-first service worker for STS
const CACHE_NAME = 'sts-cache-v9';
const CORE_ASSETS = [
  '/sts-web/',                 // start URL on GitHub Pages
  '/sts-web/index.html',
  '/sts-web/eqsol.json',
  '/sts-web/about-credits.html',
  '/sts-web/manifest.webmanifest',
  '/sts-web/icons/sts-192.png',
  '/sts-web/icons/sts-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Cache-first for same-origin requests
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Put a copy in cache (best-effort)
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      }).catch(() => cached); // fallback
    })
  );
});


