// selects/select-visibilidade.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE VISIBILIDADE
// ===============================
export async function popularSelectVisibilidade(opcoes) {
    const selectId = "visibilidade";
    const jsonKey = "visibilidade";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

// Exporta função individual se quiser usar diretamente
export default popularSelectVisibilidade;