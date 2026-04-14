// ─── js3.js — Controle de Exibição e Persistência ────────────────
// Responsabilidade: exibir/ocultar o pop-up, cronometrar, ouvir o
// clique em "entendi" e gravar/ler o estado no localStorage.
// Interage diretamente com o container injetado pelo js1.js.

// ✏️ EDITE AQUI durante os testes:
const TEMPO_VISIVEL_MS = 25 * 1000;  // tempo que o pop-up fica na tela (25s)
const INTERVALO_MS     = 60 * 1000;  // intervalo para reaparecer (1min)
const CHAVE_STORAGE    = "aviso_confirmado"; // chave usada no localStorage

// ─────────────────────────────────────────────────────────────────
let timerOcultar = null;
let timerRepetir = null;

function exibir() {
  const container = document.getElementById("pop-up-avisos");
  if (!container) return;

  container.style.display = "block";

  // Agenda ocultamento automático após TEMPO_VISIVEL_MS
  clearTimeout(timerOcultar);
  timerOcultar = setTimeout(ocultar, TEMPO_VISIVEL_MS);
}

function ocultar() {
  const container = document.getElementById("pop-up-avisos");
  if (!container) return;

  container.style.display = "none";

  // Se o usuário ainda não confirmou, agenda a próxima exibição
  if (!usuarioConfirmou()) {
    clearTimeout(timerRepetir);
    timerRepetir = setTimeout(exibir, INTERVALO_MS);
    console.log("[js3] Usuário não confirmou. Reagendando exibição...");
  }
}

function onEntendi() {
  clearTimeout(timerOcultar);
  clearTimeout(timerRepetir);

  // Grava no localStorage que o usuário confirmou
  localStorage.setItem(CHAVE_STORAGE, "true");

  const container = document.getElementById("pop-up-avisos");
  if (container) container.style.display = "none";

  console.log("[js3] Aviso confirmado pelo usuário. Ciclo encerrado.");
}

function usuarioConfirmou() {
  return localStorage.getItem(CHAVE_STORAGE) === "true";
}

function iniciarControle() {
  // Se o usuário já confirmou em sessão anterior, não exibe
  if (usuarioConfirmou()) {
	container.style.display = "none";
    console.log("[js3] Aviso já foi confirmado anteriormente. Nada a exibir.");
    return;
  }

  // Liga o botão "entendi"
  const btnEntendi = document.getElementById("entendi");
  if (btnEntendi) {
    btnEntendi.addEventListener("click", onEntendi);
  } else {
    console.error("[js3] Botão #entendi não encontrado.");
  }

  exibir();
}
