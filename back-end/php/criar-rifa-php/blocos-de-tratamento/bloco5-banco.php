<?php
/**************************************************
 * BLOCO 5 - TRATAMENTO FINANCEIRO
 * - Valida cálculo do lucro final
 * - Impede manipulação de valores no front-end
 **************************************************/

// ===============================
// SEGURANÇA DE CONTEXTO
// ===============================
if (!isset($bloco5)) {
    throw new Exception("Erro interno: dados do bloco 5 não recebidos.");
}

// ===============================
// COLETA E NORMALIZAÇÃO DOS DADOS
// ===============================
$lucroFinal   = (float) ($bloco5['lucro_final'] ?? 0);
$valorDezena  = (float) ($bloco5['valor_dezena'] ?? 0);
$qtdDezenas   = (int)   ($bloco5['tipo_quantidade_dezenas'] ?? 0);
$valorPremio  = (float) ($bloco5['valor_premio'] ?? 0);

// ===============================
// VALIDAÇÕES BÁSICAS
// ===============================
if ($valorDezena <= 0 || $qtdDezenas <= 0) {
    http_response_code(422);
    echo json_encode([
        "tipo" => "erro_bloco_5",
        "mensagem" => "Valores inválidos para cálculo das dezenas."
    ]);
    exit;
}

if ($valorPremio < 0) {
    http_response_code(422);
    echo json_encode([
        "tipo" => "erro_bloco_5",
        "mensagem" => "Valor do prêmio inválido."
    ]);
    exit;
}

// ===============================
// CÁLCULO REAL DO LUCRO
// ===============================
$totalArrecadado = $valorDezena * $qtdDezenas;
$lucroCalculado  = $totalArrecadado - $valorPremio;

// ===============================
// PREVENÇÃO DE ERROS DE FLOAT
// ===============================
// Trabalhamos com 2 casas decimais (dinheiro)
$lucroCalculado = round($lucroCalculado, 2);
$lucroFinal     = round($lucroFinal, 2);

// ===============================
// VALIDAR LUCRO NEGATIVO
// ===============================
if ($lucroCalculado < 0) {
    http_response_code(422);
    echo json_encode([
        "tipo" => "erro_bloco_5",
        "mensagem" => "Ops, parece que o seu lucro final é negativo. Refaça ou reajuste os valores."
    ]);
    exit;
}

// ===============================
// VALIDAR MANIPULAÇÃO DE CÁLCULO
// ===============================
if ($lucroCalculado !== $lucroFinal) {
    http_response_code(422);
    echo json_encode([
        "tipo" => "erro_bloco_5",
        "mensagem" => "Ops, parece que houve um erro de cálculo do lucro final. Tente novamente."
    ]);
    exit;
}

// ===============================
// BLOCO 5 VALIDADO COM SUCESSO
// ===============================
// Nenhum echo
// Nenhum return
// Fluxo segue normalmente
