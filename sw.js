!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/",n(n.s=0)}([function(e,t,n){"use strict";(function(e){const t="8u8dfsdgu78fs";self.addEventListener("activate",e=>{e.waitUntil(async function(e){self.registration.navigationPreload&&await self.registration.navigationPreload.enable(),caches.keys().then(e=>{var n=e.filter(e=>0!==e.indexOf("kw-app-"+t)),r=n.map(e=>{console.log("deleting: "+e),caches.delete(e)});return Promise.all(r)}).then(()=>self.clients.claim())})}),self.addEventListener("install",e=>{self.skipWaiting(),e.waitUntil(caches.open(`kw-app-${t}`).then(e=>{e.addAll(["/offline/index.html","/404/index.html"]).then(()=>console.log("preloaded critical pages")).catch(e=>{console.error("unable to preload critical pages"),console.error(e)})}))}),addEventListener("fetch",function(e){const n=new URL(e.request.url);n.origin!==location.origin||"/"!==n.pathname&&!/^\/20\d\d\/[a-z0-9-]+\/$/.test(n.pathname)?e.respondWith(caches.match(e.request).then(function(n){return n||fetch(e.request).then(function(n){return caches.open("kw-app-"+t).then(function(t){return t.put(e.request.url,n.clone()),n})}).catch(function(e){return caches.open("kw-app-"+t).then(function(e){return e.match("/offline/index.html")})})})):e.respondWith(function(e){const t=new ReadableStream({start(t){const n=new URL(e.url),r=fetch(n).then(e=>e.ok||404==e.status?e:caches.match("/404/index.html")).catch(e=>caches.match("/offline/index.html"));function o(e){const n=e.getReader();return n.read().then(function e(r){if(!r.done)return t.enqueue(r.value),n.read().then(e)})}startFetch.then(e=>o(e.body)).then(()=>r).then(e=>o(e.body)).then(()=>t.close())}});return new Response(t,{headers:{"Content-Type":"text/html; charset=utf-8"}})}(e.request))})}).call(this,n(1))},function(e,t){var n,r,o=e.exports={};function i(){throw new Error("setTimeout has not been defined")}function c(){throw new Error("clearTimeout has not been defined")}function u(e){if(n===setTimeout)return setTimeout(e,0);if((n===i||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:i}catch(e){n=i}try{r="function"==typeof clearTimeout?clearTimeout:c}catch(e){r=c}}();var a,l=[],s=!1,f=-1;function h(){s&&a&&(s=!1,a.length?l=a.concat(l):f=-1,l.length&&d())}function d(){if(!s){var e=u(h);s=!0;for(var t=l.length;t;){for(a=l,l=[];++f<t;)a&&a[f].run();f=-1,t=l.length}a=null,s=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===c||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function p(e,t){this.fun=e,this.array=t}function m(){}o.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];l.push(new p(e,t)),1!==l.length||s||u(d)},p.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=m,o.addListener=m,o.once=m,o.off=m,o.removeListener=m,o.removeAllListeners=m,o.emit=m,o.prependListener=m,o.prependOnceListener=m,o.listeners=function(e){return[]},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}}]);