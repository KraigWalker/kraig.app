'use strict';
const SW_VERSION ='kuoilgj';

self.addEventListener('activate', event => {
    event.waitUntil(async function() {
      // Feature-detect
      if (self.registration.navigationPreload) {
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
      }
    }());
  });

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(`kw-app-${SW_VERSION}`).then(cache => {
        cache.addAll([
          '/offline.html'
        ])
      })
    )
  })

self.addEventListener('fetch', event => {
  event.respondWith(async function() {
    // Respond from the cache if we can
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;

    // Else, use the preloaded response, if it's there
    const response = await event.preloadResponse;
    if (response) return response;

    // Else try the network.
    return fetch(event.request).then(response => response).catch(
      error => {
        if(request.headers.get('Accept').includes('text/html')) {
          // show offline page
          return caches.match('/offline.html');
        }
      }
    );
  }());
});