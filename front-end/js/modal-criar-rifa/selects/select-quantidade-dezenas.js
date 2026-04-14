// selects/select-quantidade-dezenas.js

// ===============================
// TRATAR TEXTO DA OPTION
// ===============================
function formatarQuantidadeDezenas(valor) {
    const numero = Number(valor);
    if (isNaN(numero) || numero <= 0) return null;

    const digitos = String(numero).length;

    // início: 00 para até 2 dígitos, depois cresce
    const zerosInicio = digitos <= 2 ? 2 : digitos - 1;
    const inicio = '0'.repeat(zerosInicio);

    // final: valor - 1 com padding correto
    const final = String(numero - 1).padStart(digitos - 1, '0');

    return `${numero} Números (${inicio}-${final})`;
}

// ===============================
// POPULAR SELECT DE QUANTIDADE DE DEZENAS
// ===============================
export async function popularSelectQuantidadeDezenas(opcoes) {
    const selectId = "tipo_quantidade_dezenas";
    const jsonKey = "quantidade-de-dezenas";

    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`⚠️ Select #${selectId} não encontrado`);
        return;
    }

    // Limpa tudo
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

    // Popula com tratamento personalizado
    opcoes[jsonKey].forEach(valor => {
        const texto = formatarQuantidadeDezenas(valor);
        if (!texto) return;

        const option = document.createElement("option");
        option.value = valor;        // ✅ value sempre puro
        option.textContent = texto;  // ✅ texto tratado

        select.appendChild(option);
    });

    console.log(`✅ Select #${selectId} populado com ${opcoes[jsonKey].length} opções`);
}

export default popularSelectQuantidadeDezenas;
