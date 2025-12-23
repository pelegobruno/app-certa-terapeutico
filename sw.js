const CACHE_NAME = "jogos-terapeuticos-v4";
const STATIC_CACHE = "static-v4";
const FONT_CACHE = "fonts-v1";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.json",
  "./sw.js",
  "./assets/imagens/certa-a-png.png",
  "./assets/imagens/pwa/certa-a-png-192.png",
  "./assets/imagens/pwa/certa-a-png-512.png",
  "./assets/fontes/turtles/Turtles.ott" // Caminho corrigido
];

/* =========================
   INSTALL
========================= */
self.addEventListener("install", event => {
  console.log("[Service Worker] Instalando...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("[Service Worker] Cacheando arquivos estáticos");
      return cache.addAll(STATIC_FILES).catch(err => {
        console.error("[Service Worker] Falha ao cachear:", err);
      });
    })
  );
  self.skipWaiting();
});

/* =========================
   ACTIVATE
========================= */
self.addEventListener("activate", event => {
  console.log("[Service Worker] Ativando...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== FONT_CACHE) {
            console.log("[Service Worker] Removendo cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", event => {
  const request = event.request;
  
  // Ignora requisições que não são GET
  if (request.method !== "GET") return;
  
  // URLs do mesmo origem
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then(response => {
      // Retorna do cache se encontrado
      if (response) {
        return response;
      }

      // Busca na rede
      return fetch(request).then(networkResponse => {
        // Não cacheamos respostas inválidas
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        // Cache dinâmico para recursos importantes
        const responseToCache = networkResponse.clone();
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback para páginas de jogo
        if (request.url.includes("/games/") && request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});

/* =========================
   MESSAGE HANDLER (para atualizações)
========================= */
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});