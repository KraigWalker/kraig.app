addEventListener("fetch", event => {
  event.respondWith(fetchAndStream(event.request))
  event.passThroughOnException()
});

async function fetchAndStream(request) {
let response = await fetch(request)
let contentType = response.headers.get('content-type')

if (!contentType || !contentType.startsWith("text/html")) {
  setCommonHeaders(response);
  response.headers.set('cache-control', 'max-age=31536000, immutable')
  return response
}
let { readable, writable } = new TransformStream()
let newResponse = new Response(readable, response)
//newResponse.headers.set('cache-control', 'max-age=0')
streamTransformBody(response.body, writable)
setCommonHeaders(newResponse);
return newResponse
}

async function handleTemplate(encoder, templateKey) {
const linkRegex = /(esi:include.*src="(.*?)".*\/)/gm
let result = linkRegex.exec(templateKey);
let esi;
if (!result) {
  return encoder.encode(`<${templateKey}>`);
}
if (result[2]) {
  esi = await subRequests(result[2]);
}
return encoder.encode(
  `${esi}`
);
}

async function subRequests(target){
const init = {
          method: 'GET',
          headers: {
              'user-agent': 'cloudflare'
          }
      }
let response = await fetch(target, init)
let text = await response.text()

return text
}

async function streamTransformBody(readable, writable) {
const startTag = "<".charCodeAt(0);
const endTag = ">".charCodeAt(0);
let reader = readable.getReader();
let writer = writable.getWriter();

let templateChunks = null;
while (true) {
  let { done, value } = await reader.read();
  if (done) break;
  while (value.byteLength > 0) {
    if (templateChunks) {
      let end = value.indexOf(endTag);
      if (end === -1) {
        templateChunks.push(value);
        break;
      } else {
        templateChunks.push(value.subarray(0, end));
        await writer.write(await translate(templateChunks));
        templateChunks = null;
        value = value.subarray(end + 1);
      }
    }
    let start = value.indexOf(startTag);
    if (start === -1) {
      await writer.write(value);
      break;
    } else {
      await writer.write(value.subarray(0, start));
      value = value.subarray(start + 1);
      templateChunks = [];
    }
  }
}
await writer.close();
}

async function translate(chunks) {
const decoder = new TextDecoder();

let templateKey = chunks.reduce(
  (accumulator, chunk) =>
    accumulator + decoder.decode(chunk, { stream: true }),
  ""
);
templateKey += decoder.decode();

return handleTemplate(new TextEncoder(), templateKey);
}

function setCommonHeaders(response) {
// Add headers.
response.headers.delete("Access-Control-Allow-Origin")
response.headers.delete("x-github-request-id")
response.headers.delete("x-served-by")
response.headers.delete("x-timer")
response.headers.delete("x-fastly-request-id")
response.headers.delete("x-cache")
response.headers.delete("x-cache-hits")
response.headers.delete("via")
response.headers.append("Access-Control-Allow-Origin","https://kraig.app")
response.headers.delete("Expires")
response.headers.delete("Vary")
response.headers.append("Vary","Origin, Accept-Encoding")
response.headers.append("Referrer-Policy","no-referrer")
response.headers.append("X-Frame-Options","SAMEORIGIN")
response.headers.append("X-XSS-Protection","1; mode=block")
response.headers.append("Feature-Policy","geolocation 'none'")
response.headers.append("Content-Security-Policy","default-src https://kraig.app:* 'unsafe-inline';")
response.headers.delete("Content-MD5")
response.headers.delete('Cache-Tag');
}
