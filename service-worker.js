/* SpireWrought Sprite Forge V5.4 offline app shell.
 * Installed Android app URL must be a persistent HTTPS host, never 127.0.0.1.
 */
const CACHE = 'spirewrought-sprite-forge-v5.4-effects';
const PREFIX = 'spirewrought-sprite-forge-';
const HOME = new URL('./index.html', self.registration.scope).href;
const OPTIONAL = ['./manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // A real, successfully cached editor is required before activation.
    const page = await fetch(new Request(HOME, {cache: 'reload'}));
    if (!page.ok) throw new Error('Could not cache Sprite Forge index.html');
    await cache.put(HOME, page.clone());
    // Missing optional assets must not prevent the app from working offline.
    await Promise.allSettled(OPTIONAL.map(async path => {
      const url = new URL(path, self.registration.scope).href;
      const response = await fetch(new Request(url, {cache: 'reload'}));
      if (response.ok) await cache.put(url, response.clone());
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(PREFIX) && key !== CACHE)
      .map(key => caches.delete(key)));
    await caches.delete('sprite-forge-v5-2026-11-23');
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(HOME);
      if (cached) return cached;
      try {
        const network = await fetch(request);
        if (network.ok) await cache.put(HOME, network.clone());
        return network;
      } catch (err) {
        return new Response('<h2>Sprite Forge is not cached yet</h2><p>Connect to the GitHub Pages site once to finish offline setup.</p>',
          {status: 503, headers: {'Content-Type': 'text/html; charset=utf-8'}});
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch(err) {
      return Response.error();
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SPRITE_FORGE_OFFLINE_CHECK') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const ready = !!(await cache.match(HOME));
      if (event.ports && event.ports[0]) event.ports[0].postMessage({ready});
    })());
  }
});
