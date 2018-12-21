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
      // the problem we have right now is cloudlfare gives us a stream,
      // not just a big ol' file...
      cache.addAll([
        '/offline/index.html',
        '/404/index.html'
      ])
      .then(() => console.log('preloaded critical pages'))
      .catch((e) => {
        console.error('unable to preload critical pages');
        console.error(e);
      })
    })
  )
});

addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;     // if valid response is found in cache return it
        } else {
          return fetch(event.request)     //fetch from internet
            .then(function(res) {
              return caches.open('kw-app-' + SW_VERSION)
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());    //save the response for future
                  return res;   // return the fetched data
                })
            })
            .catch(function(err) {       // fallback mechanism
              return caches.open('kw-app-' + SW_VERSION)
                .then(function(cache) {
                  return cache.match('/offline/index.html');
                });
            });
        }
      })
  );
});      
