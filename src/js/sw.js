'use strict';
const SW_VERSION ='987dvd654gfd';

self.addEventListener('activate', event => {
    event.waitUntil(async function(event) {
      // Feature-detect
      if (self.registration.navigationPreload) {
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
      }
      onActivate(event).then( () => self.clients.claim() )
    })
});


function onActivate (event,) {
  return caches.keys()
    .then(cacheKeys => {
      var oldCacheKeys = cacheKeys.filter(key =>
        key.indexOf('kw-app-' + SW_VERSION) !== 0
      );
      var deletePromises = oldCacheKeys.map(oldKey => caches.delete(oldKey));
      return Promise.all(deletePromises);
    });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(`kw-app-${SW_VERSION}`).then(cache => {
      cache.addAll([
        '/offline/index.html'
      ])
    }).then(() => self.skipWaiting())
  )
});

self.addEventListener('fetch', event => {
  event.respondWith(async function() {
    // Respond from the cache if we can
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;

    // Else, use the preloaded response, if it's there
    const response = await event.preloadResponse;
    if (response) return response;

    // Else try the network.
    return fetch(event.request)
      .then(response => response)
      .catch(error => {
        if(event.request.headers.get('Accept').includes('text/html')) {
          // show offline page
          console.log('offline fallback');
          return caches.match('/offline/index.html');
        }
      }
    );
  }());
});