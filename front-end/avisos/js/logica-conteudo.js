// ─── js2.js — Atualização de Conteúdo ────────────────────────────
// Responsabilidade: alterar as informações dentro do bloco já injetado
// pelo js1.js, antes de o pop-up ser exibido ao usuário.

// ✏️ EDITE AQUI durante os testes:
const DADOS_AVISO = {
  tipo:      "Aviso:",
  mensagem:  "Nossa plataforma está em fase de desenvolvimento. Você também está usando uma conta demo, então não se assuste se encontrar algo estranho por aqui. Obrigado por testar e nos ajudar a melhorar!"
};

// ─────────────────────────────────────────────────────────────────
function atualizarConteudo() {
  const elTipo     = document.getElementById("tipo");
  const elConteudo = document.getElementById("conteudo");

  if (!elTipo || !elConteudo) {
    console.error("[js2] Elementos do pop-up não encontrados. O js1 já injetou o bloco?");
    return;
  }

  elTipo.textContent = DADOS_AVISO.tipo;

  // Preserva o elemento <samp> e adiciona a mensagem ao lado
  elConteudo.innerHTML = `<samp id="tipo">${DADOS_AVISO.tipo}</samp> ${DADOS_AVISO.mensagem}`;

  console.log("[js2] Conteúdo do pop-up atualizado.");
}
