const telaOpcoes = document.querySelector("#tela-opcoes");
const telaAdicionar = document.querySelector("#tela-adicionar");
const telaJogo = document.querySelector("#tela-jogo");

const palavrasDiv = document.querySelector("#palavras");
const errosDiv = document.querySelector("#palavras-incorretas");
const forca = document.getElementsByClassName("elementos-da-forca");

const addPalavra = document.querySelector("#adicionar-area");
const addDica = document.querySelector("#adicionar-area-dica");

/* =========================
   BANCO DE PALAVRAS
========================= */
let palavras = [
  { palavra: "ROSA", dica: "FLOR" },
  { palavra: "ABACAXI", dica: "FRUTA" },
  { palavra: "BRASIL", dica: "PAIS" }
];

/* =========================
   ESTADO DO JOGO
========================= */
let palavraAtual;
let letrasCorretas = [];
let letrasErradas = [];
let erros = 0;
const TOTAL_PNG = 10; // 0.png até 9.png

/* =========================
   CONTROLE DE TELAS
========================= */
function Tela(opcao) {
  if (opcao === 1) iniciarJogo();
  if (opcao === 2) {
    telaOpcoes.style.display = "none";
    telaAdicionar.style.display = "block";
  }
  if (opcao === 3 && salvar()) iniciarJogo();
  if (opcao === 4) {
    telaAdicionar.style.display = "none";
    telaOpcoes.style.display = "block";
  }
  if (opcao === 5) iniciarJogo();
  if (opcao === 6) {
    telaJogo.style.display = "none";
    telaOpcoes.style.display = "block";
  }
}

/* =========================
   INICIAR JOGO
========================= */
function iniciarJogo() {
  telaOpcoes.style.display = "none";
  telaAdicionar.style.display = "none";
  telaJogo.style.display = "block";

  resetar();
  criarTabuleiro();
  document.body.onkeydown = tecla;
}

/* =========================
   TABULEIRO
========================= */
function criarTabuleiro() {
  palavrasDiv.innerHTML = "";

  palavraAtual.palavra.split("").forEach(letra => {
    const div = document.createElement("div");
    div.className = "container-letra";

    const span = document.createElement("span");
    span.className = "digitado";
    span.textContent = letra;
    span.style.display = "none";

    const img = document.createElement("img");
    img.src = "imagens/forca/Palavra.png";
    img.className = "campo-da-letra";

    div.appendChild(span);
    div.appendChild(img);
    palavrasDiv.appendChild(div);
  });

  criarDica();
}

/* =========================
   DICA
========================= */
function criarDica() {
  remover(".container-dica");
  const d = document.createElement("div");
  d.className = "container-dica";
  d.innerText = "DICA: " + palavraAtual.dica;
  errosDiv.before(d);
}

/* =========================
   TECLADO
========================= */
function tecla(e) {
  if (!/^[a-zA-Z]$/.test(e.key)) return;
  if (erros >= TOTAL_PNG) return;

  const letra = e.key.toUpperCase();
  if (letrasCorretas.includes(letra) || letrasErradas.includes(letra)) return;

  if (palavraAtual.palavra.includes(letra)) {
    letrasCorretas.push(letra);
    revelarLetra(letra);
    verificarVitoria();
  } else {
    letrasErradas.push(letra);
    erros++;
    atualizarErros();
    desenharForca();
  }
}

/* =========================
   REVELAR LETRA
========================= */
function revelarLetra(letra) {
  document.querySelectorAll(".digitado").forEach(span => {
    if (span.textContent === letra) {
      span.style.display = "block";
    }
  });
}

/* =========================
   ERROS
========================= */
function atualizarErros() {
  errosDiv.innerText = "Erros: " + letrasErradas.join(" ");
}

/* =========================
   FORCA (1 ERRO = 1 PNG)
========================= */
function desenharForca() {
  if (erros > 0 && erros <= TOTAL_PNG) {
    forca[erros - 1].style.display = "block";
  }

  if (erros === TOTAL_PNG) {
    finalizar("Você perdeu!");
  }
}

/* =========================
   VITÓRIA
========================= */
function verificarVitoria() {
  const letrasUnicas = [...new Set(palavraAtual.palavra)];
  if (letrasUnicas.every(l => letrasCorretas.includes(l))) {
    finalizar("Você ganhou!");
  }
}

/* =========================
   FINALIZAR JOGO
========================= */
function finalizar(msg) {
  document.body.onkeydown = null;
  remover(".container-mensagem");

  const m = document.createElement("div");
  m.className = "container-mensagem";
  m.innerText = msg;
  telaJogo.appendChild(m);
}

/* =========================
   UTILIDADES
========================= */
function salvar() {
  if (addPalavra.value && addDica.value) {
    palavras.push({
      palavra: addPalavra.value.toUpperCase(),
      dica: addDica.value.toUpperCase()
    });
    addPalavra.value = "";
    addDica.value = "";
    return true;
  }
  return false;
}

function resetar() {
  letrasCorretas = [];
  letrasErradas = [];
  erros = 0;

  palavraAtual = palavras[Math.floor(Math.random() * palavras.length)];
  errosDiv.innerHTML = "";

  remover(".container-dica");
  remover(".container-mensagem");

  for (let p of forca) p.style.display = "none";
}

function remover(sel) {
  const e = document.querySelector(sel);
  if (e) e.remove();
}
