// selects/select-quantidade-premio.js

// ===============================
// FORMATAR TEXTO DA OPTION
// ===============================
function formatarQuantidadePremio(valor) {
    const numero = Number(valor);
    if (isNaN(numero) || numero <= 0) return null;

    if (numero === 1) {
        return 'Apenas 1 premiação';
    }

    return `${numero} premiações`;
}

// ===============================
// POPULAR SELECT DE QUANTIDADE DE PRÊMIO
// ===============================
export async function popularSelectQuantidadePremio(opcoes) {
    const selectId = "quantidade_premios";
    const jsonKey = "quantidade-premio";

    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`⚠️ Select #${selectId} não encontrado`);
        return;
    }

    // Limpa o select
    select.innerHTML = "";

    // Option base
    const optBase = document.createElement("option");
    optBase.value = "";
    optBase.textContent = "Selecione...";
    select.appendChild(optBase);

    if (!opcoes[jsonKey] || !Array.isArray(opcoes[jsonKey])) {
        console.warn(`⚠️ Nenhuma opção encontrada para ${jsonKey}`);
        return;
    }

    // Popula com texto tratado
    opcoes[jsonKey].forEach(valor => {
        const texto = formatarQuantidadePremio(valor);
        if (!texto) return;

        const option = document.createElement("option");
        option.value = valor;        // ✅ value puro
        option.textContent = texto;  // ✅ texto tratado

        select.appendChild(option);
    });

    console.log(`✅ Select #${selectId} populado com ${opcoes[jsonKey].length} opções`);
}

export default popularSelectQuantidadePremio;
