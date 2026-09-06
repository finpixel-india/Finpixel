const CACHE = 'finpixel-shell-v3';
const APP_SHELL = ['/', '/favicon.svg', '/manifest.webmanifest', '/icons/finpixel-192.png', '/icons/finpixel-512.png', '/icons/finpixel-nav.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Bypass cache for APIs, Range requests, and media streaming files
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    request.headers.has('range') ||
    request.destination === 'audio' ||
    request.destination === 'video' ||
    /\.(mp3|wav|m4a|ogg|mp4|webm)$/i.test(url.pathname)
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put('/', copy));
      return response;
    }).catch(() => caches.match('/')));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && response.status === 200) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});

