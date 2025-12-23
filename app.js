/* =========================
   TELAS DO APP
========================= */
const telas = ["splashApp", "menuApp"];

/* =========================
   CONFIGURAÇÃO DO SPLASH
========================= */
/*
  ⏱️ CONTROLE AQUI O TEMPO DO SPLASH (em milissegundos)

  2000 = rápido
  3000 = padrão
  4000 = leitura confortável
  6000 = bem calmo (crianças)
*/
const TEMPO_SPLASH = 6000;

/* =========================
   FUNÇÃO PARA TROCAR TELAS
========================= */
function mostrarTela(id) {
  telas.forEach(t => {
    const el = document.getElementById(t);
    if (el) el.classList.remove("ativa");
  });

  const alvo = document.getElementById(id);
  if (alvo) alvo.classList.add("ativa");
}

/* =========================
   INICIALIZAÇÃO DO APP
========================= */
window.addEventListener("load", () => {
  const splash = document.getElementById("splashApp");

  /* === SPLASH === */
  if (splash) {
    mostrarTela("splashApp");

    setTimeout(() => {
      splash.classList.add("oculto");

      setTimeout(() => {
        mostrarTela("menuApp");
      }, 600);
    }, TEMPO_SPLASH);
  } else {
    // fallback se splash não existir
    mostrarTela("menuApp");
  }

  /* === SERVICE WORKER (PWA) === */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(err => console.error("Erro no Service Worker:", err));
  }
});

/* =========================
   NAVEGAÇÃO ENTRE JOGOS
========================= */

// Abre o TIMER (menu → timer)
function abrirTimer() {
  window.location.href = "./games/timer/index.html";
}

// Abre qualquer jogo pelo nome da pasta
function abrirJogo(nome) {
  window.location.href = `./games/${nome}/index.html`;
}
