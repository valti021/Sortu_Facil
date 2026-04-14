// ── CONFIGURAÇÃO CONTA DEMO ────────────────────────────────────



let DEMO_USER = null;
const DEMO_TOKEN = "demo_token_" + Date.now();

// ── FUNÇÕES AUXILIARES ──────────────────────────────────────

/**
 * Detecta o caminho correto do JSON baseado na localização atual
 */
function obterCaminhoJSON() {
    // Obtém o caminho absoluto do script atual
    const scripts = document.querySelectorAll('script[src*="demo/js/login.js"]');
    
    for (let script of scripts) {
        const src = script.src;

        
        if (src.includes('demo/js/login.js')) {
            // Estamos em /front-end/, então o JSON está em demo/dados/usuario.json
            const caminhoAbsoluto = src.replace('demo/js/login.js', 'demo/dados/usuario.json');

            return caminhoAbsoluto;
        }
    }
    
    // Fallback: tenta caminho relativo

    return 'dados/usuario.json';
}

// ── FUNÇÕES DEMO ────────────────────────────────────────────────

/**
 * Carrega os dados do usuário demo a partir do JSON
 */
async function carregarDadosDemo() {
    try {
        const caminhoJSON = obterCaminhoJSON();


        
        const resposta = await fetch(caminhoJSON);

        
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}: ${resposta.statusText}`);
        
        const dadosBrutos = await resposta.text();

        
        DEMO_USER = JSON.parse(dadosBrutos);
        DEMO_USER.isDemo = true; // Adiciona flag de demo
        

        return DEMO_USER;
    } catch (error) {
        console.error('❌ Erro ao carregar dados demo:', error);
        console.error('❌ Detalhes do erro:', error.message);
        alert('Erro ao carregar dados de demonstração: ' + error.message);
        return null;
    }
}

/**
 * Faz login em uma conta demo
 * Salva os dados no localStorage com a flag de demo
 */
function fazerLoginDemo() {
    try {
        if (!DEMO_USER) {
            console.error('❌ Dados demo não carregados');
            alert('Dados de demo não disponíveis. Tente novamente.');
            return;
        }
        
        localStorage.setItem('token', DEMO_TOKEN);
        localStorage.setItem('isDemo', 'true');
        localStorage.setItem('demoUser', JSON.stringify(DEMO_USER));
        



        
        // Aguarda um pouco para garantir que os dados foram salvos
        setTimeout(() => {
            window.location.href = '../front-end/estrutura-principal/main.html';
        }, 200);
    } catch (error) {
        console.error('❌ Erro ao fazer login demo:', error);
        alert('Erro ao realizar login demo. Tente novamente.');
    }
}

/**
 * Faz logout da conta demo
 * Remove os dados do localStorage
 */
function fazerLogoutDemo() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('isDemo');
        localStorage.removeItem('demoUser');
        

        return true;
    } catch (error) {
        console.error('❌ Erro ao fazer logout demo:', error);
        return false;
    }
}

/**
 * Verifica se o usuário atual está em modo demo
 */
function estaEmModoDemo() {
    return localStorage.getItem('isDemo') === 'true';
}

/**
 * Retorna os dados do usuário demo armazenados
 */
function obterDadosDemoArmazenados() {
    try {
        const dados = localStorage.getItem('demoUser');
        return dados ? JSON.parse(dados) : null;
    } catch (error) {
        console.error('❌ Erro ao obter dados demo:', error);
        return null;
    }
}

// ── INICIALIZAÇÃO ────────────────────────────────────────────

async function inicializarDemo() {

    
    // Verifica se estamos em um servidor local (não file://)
    if (window.location.protocol === 'file:') {
        console.error('❌ ERRO: O sistema demo deve ser executado em um servidor local!');
        console.error('💡 Solução: Use um servidor local como Live Server do VS Code ou python -m http.server');
        alert('ERRO: Abra esta página através de um servidor local (não diretamente no navegador).\n\nUse Live Server no VS Code ou execute:\npython -m http.server 8000');
        return;
    }
    
    // Carrega dados do JSON primeiro
    await carregarDadosDemo();

    // Configura o botão imediatamente se o DOM já estiver pronto
    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', () => {

            configurarBotao();
        });
    } else {

        configurarBotao();
    }

    // Também adiciona um timeout de segurança para garantir que o botão seja configurado
    setTimeout(() => {
        if (!document.querySelector('.demo .btn').hasAttribute('data-configurado')) {

            configurarBotao();
        }
    }, 1000);
}

function configurarBotao() {


    // Procura por botão com classe 'btn' dentro da div 'demo'
    const divDemo = document.querySelector('.demo');


    // Se a div demo não existe, apenas sai sem avisar (pode estar em outra página)
    if (!divDemo) {

        return;
    }

    const btnTesteAgora = divDemo.querySelector('.btn');


    if (!btnTesteAgora) {

        return;
    }


    
    // Marca o botão como configurado para evitar reconfiguração
    btnTesteAgora.setAttribute('data-configurado', 'true');
    

    
    btnTesteAgora.addEventListener('click', (e) => {
        e.preventDefault();


        
        // Remove o estilo visual ao clicar
        btnTesteAgora.style.border = '';
        btnTesteAgora.style.backgroundColor = '';
        
        fazerLoginDemo();
    });

    // Adiciona um log para confirmar que o event listener foi adicionado

}

// Inicia o sistema
inicializarDemo();
