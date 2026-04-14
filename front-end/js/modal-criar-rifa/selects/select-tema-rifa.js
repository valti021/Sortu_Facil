// selects/select-tema-rifa.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE TEMA DA RIFA
// ===============================
export async function popularSelectTemaRifa(opcoes) {
    const selectId = "tema_rifa";
    const jsonKey = "tema-da-rifa";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

export default popularSelectTemaRifa;