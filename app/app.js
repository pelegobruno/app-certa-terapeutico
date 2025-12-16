const telas = ["splashApp", "menuApp"];

function mostrarTela(id) {
  telas.forEach(t => {
    document.getElementById(t).classList.remove("ativa");
  });
  document.getElementById(id).classList.add("ativa");
}

/* =========================
   SPLASH → MENU (ÚNICO CONTROLE)
========================= */
window.addEventListener("load", () => {
  mostrarTela("splashApp");

  setTimeout(() => {
    mostrarTela("menuApp");
  }, 2500);
});

/* =========================
   NAVEGAÇÃO
========================= */
function abrirTimer() {
  window.location.href = "../index.html";
}

function abrirJogo(nome) {
  window.location.href = `games/${nome}/index.html`;
}
