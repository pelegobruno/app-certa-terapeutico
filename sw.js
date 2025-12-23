const CACHE_NAME = "jogos-terapeuticos-v3";
const STATIC_CACHE = "static-v3";
const FONT_CACHE = "fonts-v1";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.json",
  "./assets/imagens/certa-a-png.png"
];

/* =========================
   INSTALL
========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

/* =========================
   ACTIVATE
========================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (![STATIC_CACHE, FONT_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", event => {
  const request = event.request;

  // 👉 FONTES: cache dinâmico
  if (request.destination === "font") {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(response => {
          if (response) return response;

          return fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
      )
    );
    return;
  }

  // 👉 ARQUIVOS NORMAIS
  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
  );
});
