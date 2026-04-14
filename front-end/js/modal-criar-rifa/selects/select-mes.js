// selects/select-mes.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE MÊS
// ===============================
export async function popularSelectMes(opcoes) {
    const selectId = "mes";
    const jsonKey = "mes-disponivel";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

export default popularSelectMes;