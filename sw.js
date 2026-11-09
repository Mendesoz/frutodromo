// Frutódromo: funciona offline. Primeiro tenta a rede (pra pegar atualizações); sem internet, usa o que está guardado.
const CACHE = "frutodromo-v19";
const FILES = ["./", "./index.html", "./css/style.css", "./js/game.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // clima (Open-Meteo) sempre direto da rede: previsão velha guardada poderia virar alerta falso
  if (new URL(e.request.url).hostname === "api.open-meteo.com") return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
