const CACHE_NAME = "jogos-terapeuticos-v6";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/app.css",
  "/app.js",
  "/manifest.json",

  // IMAGENS PRINCIPAIS
  "/assets/imagens/certa-a-png.png",
  "/assets/imagens/pwa/certa-a-png-192.png",
  "/assets/imagens/pwa/certa-a-png-512.png"
];

/* =========================
   INSTALL
========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES);
    })
  );

  // força ativação imediata
  self.skipWaiting();
});

/* =========================
   ACTIVATE
========================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );

  // garante controle da página
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // fallback básico: volta para index se offline
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
