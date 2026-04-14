// modal-criar-rifa.controller.js

// Importa os módulos necessários
import * as Auth from './modal-criar-rifa.auth.js';
import * as Selects from './selects/selects-loader.js';
import { mostrarErro } from './utils/select-utils.js';

// Estados globais
let modalCarregado = false;

// ===============================
// CARREGAR MODAL DE CRIAR RIFA SOB DEMANDA
// ===============================
async function carregarModal() {
    console.log("🔄 Iniciando carregamento do modal de criar rifa...");
    
    // Verificar login antes de prosseguir
    const estaLogado = await Auth.verificarLogin();
    
    if (!estaLogado) {
        console.log("⚠️ Usuário não está logado. Abrindo modal conta...");
        await Auth.abrirModalConta();
        return;
    }

    console.log("✅ Usuário autenticado. Carregando modal de criar rifa...");

    // Se modal já foi carregado, apenas abre
    if (modalCarregado) {
        abrirModal();
        return;
    }

    try {
        const response = await fetch("modal-criar-rifa.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar modal: ${response.status}`);
        }

        const html = await response.text();
        document.body.insertAdjacentHTML("beforeend", html);

        modalCarregado = true;

        configurarFechamento();
        abrirModal();
        buscarDadosSessao();
        await Selects.carregarTodosSelects();

        // 🔔 Evento global para outros módulos inicializarem
        document.dispatchEvent(new CustomEvent("modalCriarRifa:carregado"));

        console.log("✅ Modal de criar rifa carregado com sucesso");

    } catch (erro) {
        console.error("❌ Falha ao carregar modal de criar rifa:", erro);
        mostrarErro("Não foi possível carregar o formulário de criação de rifa. Por favor, tente novamente.");
    }
}

// ===============================
// BUSCAR DADOS DA SESSÃO (Adaptado para seu PHP)
// ===============================
async function buscarDadosSessao() {
    console.log("🔄 Buscando dados da sessão...");
    
    try {
        const response = await fetch("../php/getUser.php");
        
        if (!response.ok) {
            throw new Error(`Erro na sessão: ${response.status}`);
        }
        
        const s = await response.json();
        
        // Verificar se usuário está logado (baseado no seu PHP)
        if (!s.logado) {
            console.warn("⚠️ Sessão expirada durante o uso do modal");
            fecharModal();
            await Auth.abrirModalConta();
            return;
        }

        
        // Mapeamento dos dados da sessão
        const emailLabel = document.getElementById("email-label");
        const organizadorLabel = document.getElementById("organizador-label");
        
        if (emailLabel) {
            // Usa 'email' do seu PHP
            emailLabel.textContent = s.email || "desconhecido";
            console.log(`📧 Email carregado: ${s.email}`);
        }
        
        // Concatena nome + sobrenome (do seu PHP)
        const nomeCompleto = `${s.nome || ''} ${s.sobrenome || ''}`.trim();
        if (organizadorLabel) {
            organizadorLabel.textContent = nomeCompleto || "desconhecido";
            console.log(`👤 Nome carregado: ${nomeCompleto}`);
        }
        
        console.log("✅ Dados da sessão carregados com sucesso");
        
    } catch (err) {
        console.error("⚠️ Erro ao buscar dados da sessão:", err);
        mostrarErro("Erro ao carregar dados do usuário");
    }
}

// ===============================
// ABRIR MODAL DE CRIAR RIFA
// ===============================
function abrirModal() {
    const modal = document.getElementById("modal-criar-rifa");
    if (!modal) {
        console.error("❌ Modal não encontrado para abrir");
        return;
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    console.log("📂 Modal de criar rifa aberto com sucesso");
}

// ===============================
// FECHAR MODAL DE CRIAR RIFA
// ===============================
function fecharModal() {
    const modal = document.getElementById("modal-criar-rifa");
    if (!modal) return;

    modal.style.display = "none";
    document.body.style.overflow = "";

    console.log("📁 Modal de criar rifa fechado");
    
    // Limpar formulário se existir
    const formulario = modal.querySelector("form");
    if (formulario) {
        formulario.reset();
    }
}

// ===============================
// CONFIGURAR FECHAMENTO DO MODAL
// ===============================
function configurarFechamento() {
    const modal = document.getElementById("modal-criar-rifa");
    const btnFechar = document.getElementById("fechar-modal-rifa");

    if (!modal) {
        console.error("❌ Modal não encontrado para configurar fechamento");
        return;
    }

    if (btnFechar) {
        btnFechar.addEventListener("click", fecharModal);
        console.log("✅ Botão de fechar configurado");
    }

    // Fechar ao clicar fora do conteúdo
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            fecharModal();
        }
    });
}

// ===============================
// CONFIGURAR BOTÕES DE ABERTURA
// ===============================
function configurarBotoesAbertura() {
    const btnIcone = document.getElementById("btn-criar-rifa-icone");
    const btnTexto = document.getElementById("btn-criar-rifa");
    
    console.log("🔧 Configurando botões de abertura...");
    console.log("🔘 Botão ícone encontrado:", !!btnIcone);
    console.log("🔘 Botão texto encontrado:", !!btnTexto);

    [btnIcone, btnTexto].forEach((btn, index) => {
        if (!btn) {
            console.warn(`⚠️ Botão ${index === 0 ? 'ícone' : 'texto'} não encontrado`);
            return;
        }
        
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🎯 Botão ${index === 0 ? 'ícone' : 'texto'} clicado`);
            
            // Adiciona feedback visual
            btn.style.transform = "scale(0.95)";
            btn.style.opacity = "0.8";
            
            setTimeout(() => {
                btn.style.transform = "";
                btn.style.opacity = "";
            }, 200);
            
            await carregarModal();
        });
    });

    console.log("✅ Botões de abertura configurados com sucesso");
}

// ===============================
// INICIALIZAÇÃO
// ===============================
function inicializar() {
    console.log("🚀 Inicializando modal-criar-rifa.controller.js");
    
    // Pré-verifica login em background
    Auth.verificarLogin().then(logado => {
        if (logado) {
            console.log("👤 Usuário já está logado");
        } else {
            console.log("👤 Usuário não está logado");
        }
    });
    
    configurarBotoesAbertura();
    
    // Evento para forçar nova verificação de login
    document.addEventListener("loginStatusChanged", () => {
        console.log("🔄 Status de login alterado, limpando cache...");
        Auth.limparCacheLogin();
    });
    
    console.log("✅ Sistema de modal de criar rifa inicializado");
}

// Inicia o sistema quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", inicializar);

// Exporta funções públicas
export {
    carregarModal,
    abrirModal,
    fecharModal,
    configurarFechamento
};