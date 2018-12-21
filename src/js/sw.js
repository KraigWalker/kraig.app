'use strict';
const SW_VERSION ='8u8u78fs';

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


function onActivate (event) {
  return caches.keys()
    .then(cacheKeys => {
      var oldCacheKeys = cacheKeys.filter(key =>
        key.indexOf('kw-app-' + SW_VERSION) !== 0
      );
      var deletePromises = oldCacheKeys.map(oldKey => { 
        console.log('deleting: ' + oldKey); 
        caches.delete(oldKey)
      });
      return Promise.all(deletePromises);
    });
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(`kw-app-${SW_VERSION}`).then(cache => {
      cache.addAll([
        '/offline/index.html',
        '/404/index.html'
      ]).then(() => console.log('preloaded critical pages'))
    })
  )
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Try the cache
    caches.open('kw-app' + SW_VERSION).then(function(cache){
      cache.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('return successful response from cache');
          return response;
        }
        return fetch(event.request).then(function(response) {
          console.log('returning network fetch')
          return response;
        })
          .catch(function(response) {
            if (response.status === 404) {
              console.log('404');
              return cache.match('/404/index.html');
            }
            // If both fail, show a generic fallback:
            return caches.open('kw-app-' + SW_VERSION)
              .then(function(cache) { 
                console.log('handling offline')
                cache.match('/offline/index.html');
              })
        })
      })
    })
    )
  }
);
