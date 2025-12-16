const telas = ["personagem", "tempo", "execucao"];

let personagemSelecionado = "";
let intervaloTempo = null;
let intervaloMovimento = null;

let tempoTotal = 0;
let tempoRestante = 0;

let posicaoX = 0;
let direcao = 1;

/* =========================
   TROCA DE TELAS
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

/* 🔴 ESTA FUNÇÃO FALTAVA */
function voltarMenuJogos() {
  window.location.href = "app/index.html";
}

/* =========================
   INICIAR TIMER
========================= */
function iniciar(minutos) {
  mostrarTela("execucao");

  const btnVoltar = document.getElementById("btnVoltarTempo");
  if (btnVoltar) btnVoltar.style.display = "none";

  const img = document.getElementById("personagemAtivo");
  const vitoria = document.getElementById("personagemVitoria");
  const cenario = document.getElementById("cenario");
  const contador = document.getElementById("contador");
  const ponteiro = document.querySelector(".ponteiro");

  /* RESET TOTAL */
  clearInterval(intervaloTempo);
  clearInterval(intervaloMovimento);

  img.style.display = "block";
  img.style.opacity = "1";
  img.style.transform = "scaleX(1)";
  img.style.left = "0px";
  img.style.bottom = "0px";

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
