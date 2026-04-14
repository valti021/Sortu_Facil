// ─── js1.js — Captura e Injeção ───────────────────────────────────
// Responsabilidade: fazer fetch do HTML "acessório", extrair o bloco
// do pop-up e injetá-lo no container do HTML principal.
// Após a injeção, dispara o js2.js (conteúdo) e js3.js (controle).

// ✏️ EDITE AQUI durante os testes:
const ARQUIVO_ACESSORIO = "../avisos/html/pop-up-avisos.html";  // nome/caminho do HTML acessório
const SELETOR_BLOCO     = "#cont-avisos"; // seletor do bloco dentro do acessório

// ─────────────────────────────────────────────────────────────────
const container = document.getElementById("pop-up-avisos");

async function capturarEInjetar() {
  try {
    const resposta = await fetch(ARQUIVO_ACESSORIO);

    if (!resposta.ok) {
      throw new Error(`Não foi possível carregar "${ARQUIVO_ACESSORIO}": ${resposta.status}`);
    }

    const textoHTML = await resposta.text();

    // Cria um documento temporário para parsear o HTML do acessório
    const parser   = new DOMParser();
    const docTemp  = parser.parseFromString(textoHTML, "text/html");
    const bloco    = docTemp.querySelector(SELETOR_BLOCO);

    if (!bloco) {
      throw new Error(`Bloco "${SELETOR_BLOCO}" não encontrado em "${ARQUIVO_ACESSORIO}".`);
    }

    // Injeta o bloco no container do HTML principal
    container.innerHTML = bloco.outerHTML;

    // Dispara o js2 (atualiza conteúdo) antes de exibir ao usuário
    atualizarConteudo();

    // Dispara o js3 (controle de exibição e clique)
    iniciarControle();

  } catch (erro) {
    console.error("[js1] Erro na captura/injeção:", erro);
  }
}

// Inicia tudo quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", capturarEInjetar);
