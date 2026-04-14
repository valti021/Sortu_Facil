// selects/select-pagamento.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE PAGAMENTO
// ===============================
export async function popularSelectPagamento(opcoes) {
    const selectId = "modelo_pagamento";
    const jsonKey = "metodos-depagamento";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

export default popularSelectPagamento;