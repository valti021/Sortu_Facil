// selects/select-ano.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE ANO
// ===============================
export async function popularSelectAno(opcoes) {
    const selectId = "ano";
    const jsonKey = "ano-disponives";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

export default popularSelectAno;