// selects/select-dia-semana.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE DIA DA SEMANA
// ===============================
export async function popularSelectDiaSemana(opcoes) {
    const selectId = "dia_semana";
    const jsonKey = "dia-semana-disponivel";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

export default popularSelectDiaSemana;