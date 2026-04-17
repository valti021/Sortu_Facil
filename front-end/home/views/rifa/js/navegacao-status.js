// navegacao-status.js
// Gerencia estado, abas, contadores e orquestra a renderização das rifas.

let estadoAtual = "ativa";
let offsetAtual = 0;
const limite = 4;

// Elementos DOM
let tabs = [];
let contadorAtivas, contadorAdiadas, contadorCanceladas, contadorConcluidas;
let tituloTexto, botaoCriar, btnCarregarMais;

// Referências para o módulo de renderização (carregado dinamicamente)
let renderRifas = null;

function atualizarContadores(dados) {
    if (contadorAtivas) contadorAtivas.textContent = dados.ativa ?? 0;
    if (contadorAdiadas) contadorAdiadas.textContent = dados.adiada ?? 0;
    if (contadorCanceladas) contadorCanceladas.textContent = dados.cancelada ?? 0;
    if (contadorConcluidas) contadorConcluidas.textContent = dados.concluida ?? 0;
}

async function carregarStatus() {
    const isDemo = localStorage.getItem('isDemo') === 'true';

    if (isDemo) {
        if (window.rifasDemo) {
            try {
                const dados = await window.rifasDemo.carregarStatus();
                atualizarContadores(dados);
            } catch (err) {
                console.error('Erro em carregarStatus (demo):', err);
            }
        } else {
            atualizarContadores({ ativa: 0, adiada: 0, cancelada: 0, concluida: 0 });
        }
    } else {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token não encontrado");

            const response = await fetch("../../back-end/api/raffle.php", {
                method: 'POST', // 🔥 AGORA É POST
                headers: {
                    "Content-Type": "application/json", // 🔥 JSON
                    "Authorization": `Bearer ${token}` // 🔥 TOKEN
                },
                mode: 'cors',

                // 🔥 PADRÃO DA SUA API
                body: JSON.stringify({
                    action: "status" // 👈 ação que o PHP espera
                })
            });

            const dados = await response.json();
            atualizarContadores(dados);

        } catch (err) {
            console.error('Erro em carregarStatus:', err);
        }
    }
}

// Função que carrega mais rifas (delega para o módulo de renderização)
async function carregarMaisRifas() {
    if (!renderRifas) {
        console.warn("Módulo render-rifas ainda não carregado");
        return;
    }
    await renderRifas.renderizarRifas(estadoAtual, offsetAtual, limite);
}

// Troca de aba
function trocarStatus(status, texto) {
    estadoAtual = status;
    offsetAtual = 0;
    if (tituloTexto) tituloTexto.textContent = texto;
    if (botaoCriar) botaoCriar.style.display = (status === "ativa") ? "inline-flex" : "none";

    // Limpa a lista imediatamente e recarrega
    if (renderRifas) {
        renderRifas.limparLista();
        carregarMaisRifas();
    } else {
        // Se o módulo ainda não carregou, aguarda um pouco
        setTimeout(() => trocarStatus(status, texto), 50);
    }
}

// Inicialização principal
export async function init() {
    if (document.readyState === 'loading')
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));

    // Capturar elementos
    tabs = document.querySelectorAll(".status-vendedor li");
    contadorAtivas = document.getElementById("rifas-ativas");
    contadorAdiadas = document.getElementById("rifas-adiadas");
    contadorCanceladas = document.getElementById("rifas-canceladas");
    contadorConcluidas = document.getElementById("rifas-concluidas");
    tituloTexto = document.getElementById("titulo-texto");
    botaoCriar = document.getElementById("btn-criar-rifa-icone");
    btnCarregarMais = document.getElementById("btn-carregar-mais");

    // Carrega dinamicamente o módulo de renderização
    try {
        const modulo = await import('./render-rifas.js');
        renderRifas = modulo;
        // Inicializa o renderizador (passa elementos DOM de que ele precisa)
        renderRifas.inicializarElementos();
    } catch (err) {
        console.error("Erro ao carregar render-rifas.js:", err);
        return;
    }

    // Configurar abas
    if (tabs.length) {
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("ativo"));
                tab.classList.add("ativo");
                const status = tab.dataset.status;
                const texto = tab.textContent.split(":")[0].trim();
                trocarStatus(status, texto);
            });
        });
        tabs[0].classList.add("ativo");
        trocarStatus("ativa", "Ativas");
    }

    // Botão "Carregar mais"
    if (btnCarregarMais) {
        btnCarregarMais.addEventListener("click", () => carregarMaisRifas());
    }

    // Carregar contadores iniciais
    await carregarStatus();
}

export function destroy() {
    // Limpeza se necessário
    if (btnCarregarMais) btnCarregarMais.removeEventListener("click", carregarMaisRifas);
    if (renderRifas && renderRifas.destroy) renderRifas.destroy();
}