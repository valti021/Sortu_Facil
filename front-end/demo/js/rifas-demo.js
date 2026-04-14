/**
 * Módulo para simulação de dados em modo demo
 * Carrega dados de arquivos JSON locais e simula respostas do servidor
 */

// Caminhos para os arquivos JSON (relativos à pasta demo)
const CAMINHO_DADOS_TERCIARIOS = '../demo/dados/dados-terciarios.json';
const CAMINHO_DADOS_SECUNDARIOS = '../demo/dados/dados-secundarios-rifas.json';
const CAMINHO_DADOS_PRIMARIOS = '../demo/dados/dados-primarios-rifas.json';

/**front-end/demo/dados/dados-terciarios.json
 * Carrega dados terciários (contagens de status) para demo
 * Simula a resposta de ../php/contar-rifas.php
 */
async function carregarStatusDemo() {
    try {
        const response = await fetch(CAMINHO_DADOS_TERCIARIOS);
        const dados = await response.json();
        console.log('✓ Dados terciários carregados (demo):', dados);
        return dados; // Ex.: { ativa: 8, adiadas: 1, ... }
    } catch (error) {
        console.error('Erro ao carregar dados terciários (demo):', error);
        return { ativa: 0, adiadas: 0, cancelada: 0, concluida: 0 }; // Fallback
    }
}

/**
 * Carrega rifas para demo baseado no status
 * Simula a resposta de ../php/buscar-rifas.php?status=${status}&offset=${offset}
 * Usa dados-primarios-rifas.json, que agora tem a estrutura exata do servidor
 */
async function carregarRifasDemo(status, offset, limite) {
    try {
        const response = await fetch(CAMINHO_DADOS_PRIMARIOS);
        const rifas = await response.json();

        // Mapeia o status do parâmetro para o status no JSON
        const mapStatus = {
            'ativa': 'active',
            'adiada': 'postponed',
            'cancelada': 'canceled',
            'concluida': 'finished'
        };
        const statusFiltrar = mapStatus[status] || 'active';

        // Filtra por status
        const rifasFiltradas = rifas.filter(rifa => {
            const cardKey = Object.keys(rifa)[0];
            const dados = rifa[cardKey];
            return dados.status === statusFiltrar;
        });

        // Simula paginação
        const start = offset;
        const end = start + limite;
        const rifasPaginadas = rifasFiltradas.slice(start, end);

        // Substitui imgs pelos caminhos locais definidos no campo img
        // Isso garante que no modo demo nunca sejam usadas URLs do servidor
        rifasPaginadas.forEach(obj => {
            const dados = obj[Object.keys(obj)[0]];
            if (dados.img && typeof dados.img === 'object') {
                dados.imgs = Object.keys(dados.img)
                    .filter(k => /^img-\d+$/.test(k))
                    .sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
                    .map(k => dados.img[k]);
            }
        });

        console.log(`✓ Rifas carregadas (demo) para status ${status}:`, rifasPaginadas);
        return rifasPaginadas;
    } catch (error) {
        console.error('Erro ao carregar rifas (demo):', error);
        return [];
    }
}

/**
 * Carrega dados primários de uma rifa para demo
 * Simula a resposta de ../php/gerenciar-rifa/dados-primario.php
 */
async function getDadosPrimariosDemo(id) {
    try {
        const response = await fetch(CAMINHO_DADOS_PRIMARIOS);
        const rifas = await response.json();

        // Encontra a rifa pelo ID (card-{id})
        const rifa = rifas.find(r => Object.keys(r)[0] === `card-${id}`);
        if (rifa) {
            // Para demo, usa um n_serial fixo ou baseado no ID
            const n_serial = `DEMO-${id}-SERIAL`; // Ex.: DEMO-124-SERIAL
            console.log('✓ Dados primários carregados (demo):', { success: true, n_serial, error: null });
            return { success: true, n_serial, error: null };
        } else {
            return { success: false, error: 'Rifa não encontrada (demo)' };
        }
    } catch (error) {
        console.error('Erro ao carregar dados primários (demo):', error);
        return { success: false, error: 'Erro ao carregar (demo)' };
    }
}

// Torna as funções acessíveis globalmente para rifas-lista.js
window.rifasDemo = {
    carregarStatus: carregarStatusDemo,
    carregarRifas: carregarRifasDemo,
    getDadosPrimarios: getDadosPrimariosDemo
};