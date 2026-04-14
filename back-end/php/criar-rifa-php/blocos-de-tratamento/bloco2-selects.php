<?php
/**************************************************
 * BLOCO 2 - CONFIGURAÇÕES DO SORTEIO
 * - Valida selects
 * - Valida valores
 * - Valida dependências (Pix)
 **************************************************/

// ===============================
// SEGURANÇA DE CONTEXTO
// ===============================
if (!isset($conn) || !($conn instanceof mysqli)) {
    throw new Exception("Erro interno: conexão com o banco não disponível.");
}

if (!isset($bloco2) || !is_array($bloco2)) {
    throw new Exception("Erro interno: dados do sorteio não recebidos.");
}

// ===============================
// VARIÁVEIS
// ===============================
$tipo_quantidade_dezenas = trim($bloco2["tipo_quantidade_dezenas"] ?? '');
$valor_dezena            = (float) ($bloco2["valor_dezena"] ?? 0);
$tipo_sorteio            = trim($bloco2["tipo_sorteio"] ?? '');
$data_sorteio            = trim($bloco2["data_sorteio"] ?? '');
$horario_sorteio         = trim($bloco2["horario_sorteio"] ?? '');
$dia_semana              = trim($bloco2["dia_semana"] ?? '');
$visibilidade            = trim($bloco2["visibilidade"] ?? '');
$modelo_pagamento        = trim($bloco2["modelo_pagamento"] ?? '');
$chave_pix               = trim($bloco2["chave_pix"] ?? '');

// ===============================
// FUNÇÃO AUXILIAR
// ===============================
function existeNoBanco(mysqli $conn, string $coluna, string $valor): bool {
    $sql = "SELECT 1 FROM sorteios.agenda_sorteios WHERE {$coluna} = ? LIMIT 1";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Erro interno ao validar dados do sorteio.");
    }

    $stmt->bind_param("s", $valor);
    $stmt->execute();
    $stmt->store_result();

    $existe = $stmt->num_rows > 0;
    $stmt->close();

    return $existe;
}

// ===============================
// VALIDAÇÕES
// ===============================

// Valor da dezena
if ($valor_dezena < 1 || $valor_dezena > 50) {
    throw new Exception("O valor da dezena deve estar entre R$ 1,00 e R$ 50,00.");
}

// Quantidade de dezenas
if (empty($tipo_quantidade_dezenas) || 
    !existeNoBanco($conn, "quantidade_dezenas", $tipo_quantidade_dezenas)) {
    throw new Exception("Quantidade de dezenas inválida.");
}

// Tipo de sorteio
if (empty($tipo_sorteio) || 
    !existeNoBanco($conn, "tipo_sorteio", $tipo_sorteio)) {
    throw new Exception("Tipo de sorteio inválido.");
}

// Dia da semana
if (empty($dia_semana) || 
    !existeNoBanco($conn, "dia_semana", $dia_semana)) {
    throw new Exception("Dia da semana inválido.");
}

// Visibilidade
if (empty($visibilidade) || 
    !existeNoBanco($conn, "visibilidade", $visibilidade)) {
    throw new Exception("Visibilidade inválida.");
}

// Modelo de pagamento
if (empty($modelo_pagamento) || 
    !existeNoBanco($conn, "metodo_pagamento", $modelo_pagamento)) {
    throw new Exception("Método de pagamento inválido.");
}

// Pix obrigatório - VERIFICAÇÃO CORRIGIDA
// Converte para minúsculas para comparação case-insensitive
$modelo_pagamento_lower = strtolower($modelo_pagamento);

if (strpos($modelo_pagamento_lower, 'pix') !== false) {
    // Remove espaços em branco e verifica se está vazio
    $chave_pix_limpa = trim($chave_pix);
    
    if (empty($chave_pix_limpa)) {
        throw new Exception("A chave PIX é obrigatória quando o pagamento é via PIX.");
    }
    
    // Validações adicionais para a chave PIX
    if (strlen($chave_pix_limpa) < 11) {
        throw new Exception("A chave PIX deve ter no mínimo 11 caracteres.");
    }
    
    if (strlen($chave_pix_limpa) > 140) {
        throw new Exception("A chave PIX deve ter no máximo 140 caracteres.");
    }
    
    // Valida formato (telefone, CPF, email, etc.)
    if (!validarChavePIX($chave_pix_limpa)) {
        throw new Exception("A chave PIX informada não é válida. Use CPF, telefone ou email válido.");
    }
}

// Data e horário
if (empty($data_sorteio) || empty($horario_sorteio)) {
    throw new Exception("Data e horário do sorteio são obrigatórios.");
}

function validarChavePIX(string $chave): bool {
    $chave = trim($chave);
    
    // Remove caracteres não numéricos para CPF e telefone
    $chave_numerica = preg_replace('/[^0-9]/', '', $chave);
    
    // Se é numérica, valida como CPF ou telefone
    if (ctype_digit($chave_numerica)) {
        $len = strlen($chave_numerica);
        if ($len === 11) {
            // Pode ser CPF ou telefone
            return validarCPF($chave_numerica) || preg_match('/^[1-9]{2}9?[0-9]{8}$/', $chave_numerica);
        } elseif ($len === 10) {
            // Telefone
            return preg_match('/^[1-9]{2}9?[0-9]{8}$/', $chave_numerica);
        }
    }
    
    // Validação para email
    if (filter_var($chave, FILTER_VALIDATE_EMAIL)) {
        return true;
    }
    
    // Validação para chave aleatória (UUID ou similar)
    if (preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i', $chave)) {
        return true;
    }
    
    return false;
}

// ===============================
// FUNÇÃO PARA VALIDAR CPF
// ===============================
function validarCPF(string $cpf): bool {
    // Extrai somente os números
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
    // Verifica se foi informado todos os digitos corretamente
    if (strlen($cpf) != 11) {
        return false;
    }
    
    // Verifica se foi informada uma sequência de digitos repetidos. Ex: 111.111.111-11
    if (preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    // Faz o cálculo para validar o CPF
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    
    return true;
}

// ===============================
// SAÍDA PADRONIZADA DO BLOCO 2
// ===============================
$dadosSorteio = [
    "tipo_quantidade_dezenas" => $tipo_quantidade_dezenas,
    "valor_dezena"            => $valor_dezena,
    "tipo_sorteio"            => $tipo_sorteio,
    "data_sorteio"            => $data_sorteio,
    "horario_sorteio"         => $horario_sorteio,
    "dia_semana"              => $dia_semana,
    "visibilidade"            => $visibilidade,
    "modelo_pagamento"        => $modelo_pagamento,
    "chave_pix"               => $chave_pix
];

// Nenhum echo
// Nenhum return