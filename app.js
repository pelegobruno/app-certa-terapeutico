/* =========================
   TELAS DO APP
========================= */
const telas = ["splashApp", "menuApp"];

/* =========================
   CONFIGURAÇÃO DO SPLASH
========================= */
const TEMPO_SPLASH = 3000; // Reduzido para 3 segundos

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
   REGISTRO DO SERVICE WORKER
========================= */
function registrarServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js", { scope: "./" })
        .then(registration => {
          console.log("✅ Service Worker registrado com sucesso:", registration.scope);
          
          // Verifica se há uma nova versão disponível
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            console.log("🔄 Nova versão do Service Worker encontrada!");
            
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("📱 Nova versão pronta! Recarregue para atualizar.");
                // Aqui você pode mostrar um botão para atualizar
              }
            });
          });
        })
        .catch(error => {
          console.error("❌ Falha ao registrar Service Worker:", error);
        });
    });
  }
}

/* =========================
   INICIALIZAÇÃO DO APP
========================= */
function inicializarApp() {
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
}

/* =========================
   NAVEGAÇÃO ENTRE JOGOS
========================= */
function abrirJogo(nome) {
  // Verifica se o jogo existe
  const jogosDisponiveis = [
    'timer', 'cobra', 'memoria', 'velha', 
    'caca-palavras', 'forca', 'xadrez'
  ];
  
  if (!jogosDisponiveis.includes(nome)) {
    console.error(`Jogo "${nome}" não encontrado`);
    alert(`O jogo "${nome}" não está disponível no momento.`);
    return;
  }
  
  // Navega para o jogo
  window.location.href = `./games/${nome}/index.html`;
}

/* =========================
   EVENT LISTENERS
========================= */
window.addEventListener("DOMContentLoaded", () => {
  // Inicializa o app
  inicializarApp();
  
  // Registra o Service Worker
  registrarServiceWorker();
  
  // Previne comportamento padrão de links
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "A" && e.target.href.includes("#")) {
      e.preventDefault();
    }
  });
});

/* =========================
   FUNÇÕES GLOBAIS
========================= */
window.mostrarTela = mostrarTela;
window.abrirJogo = abrirJogo;

// Verifica se está rodando como PWA
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
  console.log("📱 Rodando como PWA instalado");
  document.body.classList.add("pwa-mode");
}