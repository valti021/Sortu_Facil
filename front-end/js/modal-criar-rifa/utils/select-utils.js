// utils/select-utils.js

// ===============================
// FUNÇÃO GENÉRICA PARA POPULAR SELECT
// ===============================
export function popularSelect(selectId, jsonKey, opcoes) {
    return new Promise((resolve, reject) => {
        try {
            const select = document.getElementById(selectId);
            if (!select) {
                console.warn(`⚠️ Select #${selectId} não encontrado`);
                resolve();
                return;
            }

            // Limpa tudo
            select.innerHTML = "";

            // Option base
            const optBase = document.createElement("option");
            optBase.value = "";
            optBase.textContent = "Selecione...";
            select.appendChild(optBase);

            // Verifica se existem opções para este select
            if (!opcoes[jsonKey] || !Array.isArray(opcoes[jsonKey])) {
                console.warn(`⚠️ Nenhuma opção encontrada para ${jsonKey}`);
                resolve();
                return;
            }

            // Popula com as opções
            opcoes[jsonKey].forEach(valor => {
                const option = document.createElement("option");
                option.value = valor;
                option.textContent = valor;
                select.appendChild(option);
            });

            console.log(`✅ Select #${selectId} populado com ${opcoes[jsonKey].length} opções`);
            resolve();

        } catch (erro) {
            console.error(`❌ Erro ao popular select ${selectId}:`, erro);
            reject(erro);
        }
    });
}

// ===============================
// MOSTRAR MENSAGEM DE ERRO
// ===============================
export function mostrarErro(mensagem) {
    console.error("❌ Erro:", mensagem);
    
    // Cria um toast de erro
    const alerta = document.createElement("div");
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    alerta.textContent = mensagem;
    document.body.appendChild(alerta);
    
    // Remove após 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (alerta.parentNode) {
                    alerta.remove();
                }
            }, 300);
        }
    }, 5000);
}

// ===============================
// VALIDAR SELECT OBRIGATÓRIO
// ===============================
export function validarSelectObrigatorio(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return false;
    
    if (!select.value) {
        select.style.borderColor = "#dc3545";
        return false;
    }
    
    select.style.borderColor = "";
    return true;
}

// ===============================
// RESETAR TODOS OS SELECTS
// ===============================
export function resetarTodosSelects() {
    const selectsIds = [
        "visibilidade",
        "tema_rifa", 
        "dia_semana",
        "mes",
        "ano",
        "horario",
        "modelo_pagamento",
        "tipo_sorteio",
        "quantidade_premios",
        "tipo_quantidade_dezenas"
    ];
    
    selectsIds.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.value = "";
            select.style.borderColor = "";
        }
    });
    
    console.log("🔄 Todos os selects resetados");
}