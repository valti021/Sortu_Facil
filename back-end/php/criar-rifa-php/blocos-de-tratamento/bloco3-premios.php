<?php
/**************************************************
 * BLOCO 3 - VALIDAÇÃO DOS PRÊMIOS
 * Função: Validar quantidade de prêmios, valores e nomes
 **************************************************/

// ===============================
// VERIFICAÇÃO: QUANTIDADE DE PRÊMIOS
// ===============================

// Primeiro, verifica se a quantidade de prêmios existe na tabela de configurações
$quantidade_premios = intval($bloco3["quantidade_premios"] ?? 1);
$valor_premio = floatval($bloco3["valor_premio"] ?? 0);

$sql_quantidade = "SELECT id FROM sorteios.agenda_sorteios WHERE quantidade_premio = ?";
$stmt_quantidade = $conn->prepare($sql_quantidade);

if (!$stmt_quantidade) {
    throw new Exception("Erro ao preparar consulta de quantidade de prêmios: " . $conn->error);
}

$stmt_quantidade->bind_param("i", $quantidade_premios);
$stmt_quantidade->execute();
$result_quantidade = $stmt_quantidade->get_result();

if ($result_quantidade->num_rows === 0) {
    $stmt_quantidade->close();
    throw new Exception("Quantidade de prêmios selecionada não é válida. Por favor, selecione uma opção disponível.");
}

$stmt_quantidade->close();

// ===============================
// VERIFICAÇÃO: VALOR DO PRÊMIO
// ===============================

if ($valor_premio < 1) {
    throw new Exception("O valor do prêmio não pode ser menor que R$ 1,00.");
}

// ===============================
// VERIFICAÇÃO: NOMES DOS PRÊMIOS
// ===============================

$nomesPremios = $bloco3["nomes_premios"] ?? [];

// 1. Verificar se a quantidade de nomes enviada bate com a quantidade de prêmios escolhida
$quantidadeNomesEnviados = count($nomesPremios);

if ($quantidadeNomesEnviados !== $quantidade_premios) {
    throw new Exception(
        "Quantidade de nomes de prêmios (" . $quantidadeNomesEnviados . ") " .
        "não corresponde à quantidade de prêmios selecionada (" . $quantidade_premios . ")."
    );
}

// 2. Verificar cada nome individualmente
$nomesValidos = [];
$indicePremio = 1;

foreach ($nomesPremios as $key => $nomePremio) {
    $nomeLimpo = trim($nomePremio);
    
    // Verificar se o campo não está vazio
    if (empty($nomeLimpo)) {
        throw new Exception("O nome do prêmio " . $indicePremio . " não pode estar vazio.");
    }
    
    // Verificar comprimento (máximo 150 caracteres contando espaços)
    if (strlen($nomeLimpo) > 50) {
        throw new Exception(
            "O nome do prêmio " . $indicePremio . " excede o limite de 50 caracteres. " .
            "Atual: " . strlen($nomeLimpo) . " caracteres."
        );
    }
    
    // Verificar se tem pelo menos algum caractere válido (não apenas espaços)
    if (strlen(trim($nomeLimpo)) === 0) {
        throw new Exception("O nome do prêmio " . $indicePremio . " não pode conter apenas espaços.");
    }
    
    // Adicionar ao array de nomes válidos
    $nomesValidos[] = [
        'indice' => $indicePremio,
        'nome' => $nomeLimpo
    ];
    
    $indicePremio++;
}

// ===============================
// ATUALIZAR BLOCO 3 COM OS DADOS VALIDADOS
// ===============================

$bloco3["quantidade_premios"] = $quantidade_premios;
$bloco3["valor_premio"] = $valor_premio;
$bloco3["nomes_premios_validados"] = $nomesValidos;

// ===============================
// PRONTO PARA PRÓXIMO BLOCO
// ===============================

// Se chegou até aqui sem exceções, todas as validações passaram
// O bloco 3 está validado e os dados estão prontos para uso nos próximos blocos

// Não precisa retornar nada, apenas não lançar exceções se tudo estiver OK
?>