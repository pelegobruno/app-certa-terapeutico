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
   SPLASH → MENU (CONTROLE ÚNICO)
========================= */
window.addEventListener("load", () => {
  const splash = document.getElementById("splashApp");

  // Mostra splash
  mostrarTela("splashApp");

  // Após o tempo configurado, oculta splash e mostra menu
  setTimeout(() => {
    splash?.classList.add("oculto"); // anima fade-out (CSS)
    
    // pequeno delay para finalizar fade
    setTimeout(() => {
      mostrarTela("menuApp");
    }, 600);
  }, TEMPO_SPLASH);
});

/* =========================
   NAVEGAÇÃO ENTRE TELAS / JOGOS
========================= */

// Abre o TIMER (menu → timer)
function abrirTimer() {
  window.location.href = "games/timer/index.html";
}

// Abre qualquer jogo pelo nome da pasta
function abrirJogo(nome) {
  window.location.href = `games/${nome}/index.html`;
}

/* =========================
   SERVICE WORKER (PWA)
========================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("PWA ativo"))
      .catch(err => console.error("Erro no SW:", err));
  });
}
