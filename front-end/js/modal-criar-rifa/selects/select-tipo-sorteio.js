// selects/select-tipo-sorteio.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE TIPO DE SORTEIO
// ===============================
export async function popularSelectTipoSorteio(opcoes) {
    const selectId = "tipo_sorteio";
    const jsonKey = "tipo-de-sorteio";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

export default popularSelectTipoSorteio;