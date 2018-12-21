'use strict';
const SW_VERSION ='ugfehifcbewhfbqey';

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
        '/404.html'
      ])
      .then(() => console.log('preloaded critical pages'))
      .catch((e) => {
        console.error('unable to preload critical pages');
        console.error(e);
      })
    })
  )
});

function createPageStream(request) {
  const stream = new ReadableStream({
    start(controller) {
      const url = new URL(request.url);
      //url.pathname += 'include'; -- the body url is the request url plus 'include'

      const middleFetch = fetch(url).then(response => {
        if (!response.ok && response.status != 404) {
          // todo: replace with a genuine error page
          return caches.match('/404.html');
        }
        return response;
      }).catch(err => caches.match('/offline/index.html'));

      function pushStream(stream) {
        const reader = stream.getReader();

        return reader.read().then(function process(result) {
          if (result.done) return;
          controller.enqueue(result.value);
          return reader.read().then(process);
        });
      }
        middleFetch
        .then(response => pushStream(response.body))
        .then(() => controller.close());
    }
  });

  return new Response(stream, {
    headers: {'Content-Type': 'text/html; charset=utf-8'}
  });
}

addEventListener('fetch', function(event) {

  const url = new URL(event.request.url);

  if (url.origin === location.origin) {
    // home or article pages
    if (url.pathname === '/' || /^\/20\d\d\/[a-z0-9-]+\/$/.test(url.pathname)) {
      event.respondWith(createPageStream(event.request));
      return;
    }
  }

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
