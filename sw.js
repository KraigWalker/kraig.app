!function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/",n(n.s=0)}([function(e,t,n){"use strict";const r="987dftjvd654gfd";self.addEventListener("activate",e=>{e.waitUntil(async function(e){self.registration.navigationPreload&&await self.registration.navigationPreload.enable(),caches.keys().then(e=>{var t=e.filter(e=>0!==e.indexOf("kw-app-"+r)),n=t.map(e=>{console.log("deleting: "+e),caches.delete(e)});return Promise.all(n)}).then(()=>self.clients.claim())})}),self.addEventListener("install",e=>{e.waitUntil(caches.open(`kw-app-${r}`).then(e=>{e.addAll(["/offline/index.html","/404/index.html"])}).then(()=>self.skipWaiting()))}),self.addEventListener("fetch",function(e){e.respondWith(caches.match(e.request).then(function(t){return t||fetch(e.request).then(function(e){return 404===e.status?caches.match("/404/index.html"):e})}).catch(function(){return caches.match("/offline/index.html")}))})}]);