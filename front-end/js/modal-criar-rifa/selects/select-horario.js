// selects/select-horario.js

import { popularSelect } from '../utils/select-utils.js';

// ===============================
// POPULAR SELECT DE HORÁRIO
// ===============================
export async function popularSelectHorario(opcoes) {
    const selectId = "horario";
    const jsonKey = "horarios-disponiveis";
    
    return popularSelect(selectId, jsonKey, opcoes);
}

export default popularSelectHorario;