/* =========================
   VARIÁVEIS GLOBAIS
========================= */

const telas = ["personagem", "tempo", "execucao"];

let personagemSelecionado = "";

let intervaloTempo = null;
let intervaloMovimento = null;

let tempoTotal = 0;
let tempoRestante = 0;

let posicaoX = 0;
let direcao = 1;

/* =========================
   CONFIGURAÇÃO DO SPLASH
========================= */

const TEMPO_IMAGEM_SPLASH = 2000; // tempo do logo (ms)
const TEMPO_TOTAL_SPLASH  = 5000; // tempo total até entrar no jogo (ms)

/* =========================
   SPLASH (APENAS NO REFRESH)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const splashImg = document.getElementById("splashImg");
  const splashTexto = document.getElementById("splashTexto");

  // Se não existir splash, entra direto no jogo
  if (!splash) {
    mostrarTela("personagem");
    return;
  }

  // Etapa 1 – mostra imagem
  setTimeout(() => {
    splashImg.style.display = "none";
    splashTexto.style.display = "block";
  }, TEMPO_IMAGEM_SPLASH);

  // Etapa 2 – entra no jogo
  setTimeout(() => {
    splash.classList.remove("ativa");
    mostrarTela("personagem");
  }, TEMPO_TOTAL_SPLASH);
});

/* =========================
   CONTROLE DE TELAS
========================= */

function mostrarTela(id) {
  telas.forEach(telaId => {
    const el = document.getElementById(telaId);
    if (el) el.classList.remove("ativa");
  });

  const alvo = document.getElementById(id);
  if (alvo) alvo.classList.add("ativa");

  // 🎮 Ativa animação estilo Crash
  if (id === "personagem") {
    animarTituloPersonagem();
  }
}

/* =========================
   NAVEGAÇÃO
========================= */

function escolherPersonagem(nome) {
  personagemSelecionado = nome;
  mostrarTela("tempo");
}

function voltarPersonagem() {
  mostrarTela("personagem");
}

function voltarTempo() {
  mostrarTela("tempo");
}

/* Caso exista menu externo */
function voltarMenu() {
  window.location.href = "../../index.html";
}

/* =========================
   INICIAR TIMER
========================= */

function iniciar(minutos) {
  mostrarTela("execucao");

  const btnVoltar = document.getElementById("btnVoltarTempo");
  const img = document.getElementById("personagemAtivo");
  const vitoria = document.getElementById("personagemVitoria");
  const cenario = document.getElementById("cenario");
  const contador = document.getElementById("contador");
  const ponteiro = document.querySelector(".ponteiro");

  if (btnVoltar) btnVoltar.style.display = "none";

  /* RESET TOTAL */
  clearInterval(intervaloTempo);
  clearInterval(intervaloMovimento);

  img.style.display = "block";
  img.style.opacity = "1";
  img.style.left = "0px";
  img.style.bottom = "0px";
  img.style.transform = "scaleX(1)";

  if (vitoria) vitoria.style.display = "none";
  if (ponteiro) ponteiro.style.transform = "translateX(-50%) rotate(0deg)";

  img.src = `assets/gifs/${personagemSelecionado}.gif`;

  tempoTotal = minutos * 60;
  tempoRestante = tempoTotal;

  posicaoX = 0;
  direcao = 1;

  contador.textContent = tempoRestante;
  contador.style.color = "green";

  const alturaLinha = 14;
  const alturaMax = cenario.offsetHeight - img.offsetHeight - alturaLinha;
  const larguraMax = cenario.offsetWidth - img.offsetWidth;

  /* =========================
     CONTAGEM + SUBIDA
  ========================= */

  intervaloTempo = setInterval(() => {
    tempoRestante--;
    if (tempoRestante < 0) tempoRestante = 0;

    contador.textContent = tempoRestante;

    if (tempoRestante <= 10) contador.style.color = "red";
    else if (tempoRestante <= 30) contador.style.color = "orange";
    else contador.style.color = "green";

    const progresso = 1 - tempoRestante / tempoTotal;
    img.style.bottom = progresso * alturaMax + "px";

    if (ponteiro) {
      ponteiro.style.transform =
        `translateX(-50%) rotate(${progresso * 360}deg)`;
    }

    /* FINAL */
    if (tempoRestante === 0) {
      clearInterval(intervaloTempo);
      clearInterval(intervaloMovimento);

      img.style.display = "none";

      if (vitoria) {
        vitoria.src = `assets/vitoria/${personagemSelecionado}.png`;
        vitoria.style.display = "block";
      }

      if (btnVoltar) btnVoltar.style.display = "inline-block";
    }
  }, 1000);

  /* =========================
     MOVIMENTO HORIZONTAL
  ========================= */

  intervaloMovimento = setInterval(() => {
    posicaoX += direcao * 4;

    if (posicaoX >= larguraMax) {
      direcao = -1;
      img.style.transform = "scaleX(-1)";
    }

    if (posicaoX <= 0) {
      direcao = 1;
      img.style.transform = "scaleX(1)";
    }

    img.style.left = posicaoX + "px";
  }, 30);
}

/* =========================
   EFEITO TEXTO CRASH STYLE
========================= */

function animarTituloPersonagem() {
  const titulo = document.querySelector(".titulo-personagem");
  if (!titulo) return;

  const texto = titulo.textContent;
  titulo.textContent = "";

  [...texto].forEach((letra, index) => {
    const span = document.createElement("span");
    span.textContent = letra === " " ? "\u00A0" : letra;
    span.style.animationDelay = `${index * 0.06}s`;
    titulo.appendChild(span);
  });
}
