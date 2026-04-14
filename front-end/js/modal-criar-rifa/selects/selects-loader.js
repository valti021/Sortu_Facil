// selects/selects-loader.js

// Importa todos os módulos de select
import { popularSelectVisibilidade } from './select-visibilidade.js';
import { popularSelectTemaRifa } from './select-tema-rifa.js';
import { popularSelectDiaSemana } from './select-dia-semana.js';
import { popularSelectMes } from './select-mes.js';
import { popularSelectAno } from './select-ano.js';
import { popularSelectHorario } from './select-horario.js';
import { popularSelectPagamento } from './select-pagamento.js';
import { popularSelectTipoSorteio } from './select-tipo-sorteio.js';
import { popularSelectQuantidadePremio } from './select-quantidade-premio.js';
import { popularSelectQuantidadeDezenas } from './select-quantidade-dezenas.js';

// ===============================
// CARREGAR TODOS OS SELECTS
// ===============================
export async function carregarTodosSelects() {
    console.log("🔄 Carregando todos os selects...");
    
    try {
        // Busca opções do servidor
        const response = await fetch("../php/modal-criar-rifa.php", {
            headers: { 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar opções: ${response.status}`);
        }

        const dados = await response.json();

        if (!Array.isArray(dados) || !dados[0]) {
            throw new Error("Estrutura de JSON inválida");
        }

        const opcoes = dados[0];

        // Executa todos os populadores em paralelo
        await Promise.all([
            popularSelectVisibilidade(opcoes),
            popularSelectTemaRifa(opcoes),
            popularSelectDiaSemana(opcoes),
            popularSelectMes(opcoes),
            popularSelectAno(opcoes),
            popularSelectHorario(opcoes),
            popularSelectPagamento(opcoes),
            popularSelectTipoSorteio(opcoes),
            popularSelectQuantidadePremio(opcoes),
            popularSelectQuantidadeDezenas(opcoes)
        ]);

        console.log("🎉 Todos os selects carregados com sucesso");

    } catch (erro) {
        console.error("❌ Erro ao carregar opções da rifa:", erro);
        throw erro; // Re-lança o erro para ser tratado no controller
    }
}

// Exporta também funções individuais se necessário
export {
    popularSelectVisibilidade,
    popularSelectTemaRifa,
    popularSelectDiaSemana,
    popularSelectMes,
    popularSelectAno,
    popularSelectHorario,
    popularSelectPagamento,
    popularSelectTipoSorteio,
    popularSelectQuantidadePremio,
    popularSelectQuantidadeDezenas
};