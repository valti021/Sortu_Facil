<?php
/**************************************************
 * BLOCO AUXILIAR 3 - REGISTRO INICIAL DE VENDAS
 * Função: Criar controle de dezenas vendidas
 * Banco: rifas
 * Tabela: vendas
 **************************************************/

// ===============================
// VERIFICAÇÃO DOS DADOS RECEBIDOS / AÇÕES
// ===============================

if (!isset($payloadAux3) || !isset($conn)) {
    return [
        "status" => "erro",
        "mensagem" => "Payload do auxiliar 3 ou conexão não foi recebido."
    ];
}

$acao = $payloadAux3["acao"] ?? "criar";
$n_serial = $payloadAux3["serial"] ?? null;
$quantidade_dezenas = $payloadAux3["quantidade_dezenas"] ?? null;

if ($acao === "criar") {
    if (empty($n_serial)) {
        return ["status" => "erro", "mensagem" => "Número serial da rifa não informado."];
    }

    if (!is_numeric($quantidade_dezenas) || $quantidade_dezenas <= 0) {
        return ["status" => "erro", "mensagem" => "Quantidade de dezenas inválida."];
    }

    // quantidade de casas baseada no total de dezenas
    $casas = strlen((string) $quantidade_dezenas);

    // vendidos começa com zeros (ex: 000, 0000, 00000)
    $vendidos_inicial = str_pad("0", $casas, "0", STR_PAD_LEFT);

    // INSERÇÃO NO BANCO
    $sql = "
        INSERT INTO rifas.vendas (
            n_serial,
            vendidos
        ) VALUES (?, ?)
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        return [
            "status" => "erro",
            "mensagem" => "Erro ao preparar inserção do controle de vendas: " . $conn->error
        ];
    }

    $stmt->bind_param(
        "ss",
        $n_serial,
        $vendidos_inicial
    );

    if (!$stmt->execute()) {
        $erro = $stmt->error;
        $stmt->close();
        return ["status" => "erro", "mensagem" => "Erro ao criar controle de vendas da rifa: " . $erro];
    }

    $stmt->close();

    return ["status" => "sucesso", "mensagem" => "Controle de vendas criado."];

} elseif ($acao === "rollback") {

    if (empty($n_serial)) {
        return ["status" => "erro", "mensagem" => "Número serial obrigatório para rollback."];
    }

    $sql = "DELETE FROM rifas.vendas WHERE n_serial = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return ["status" => "erro", "mensagem" => "Erro ao preparar rollback: " . $conn->error];
    }

    $stmt->bind_param("s", $n_serial);
    if (!$stmt->execute()) {
        $erro = $stmt->error;
        $stmt->close();
        return ["status" => "erro", "mensagem" => "Erro ao executar rollback do controle de vendas: " . $erro];
    }

    $stmt->close();
    return ["status" => "sucesso", "mensagem" => "Rollback do controle de vendas efetuado."];

} else {
    return ["status" => "erro", "mensagem" => "Ação desconhecida para auxiliar3: " . $acao];
}
