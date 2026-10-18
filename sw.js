/* Fariborz Aref · Labs: offline support.
   Pages are fetched from the network first, so updates appear immediately;
   the cache is used only when the visitor is offline. */
const CACHE = 'fa-labs-v2';
const ASSETS = [
  './',
  './index.html',
  './inequality.html',
  './methods.html',
  './courses.html',
  './404.html',
  './assets/css/labs.css',
  './assets/js/labs.js',
  './assets/js/inequality.js',
  './assets/js/methods.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return resp;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
