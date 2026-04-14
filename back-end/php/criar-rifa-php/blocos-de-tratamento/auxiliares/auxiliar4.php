<?php
/*
 * auxiliar4.php
 * Recebe via $payloadAux4:
 *  - acao: 'criar' | 'rollback'
 *  - serial: n_serial da rifa
 *  - quantidade_dezenas: inteiro
 *
 * Retorna array com 'status' => 'sucesso'|'erro' e opcional 'mensagem'
 */

if (!isset($payloadAux4) || !isset($conn)) {
    return [
        "status" => "erro",
        "mensagem" => "Payload ou conexão não fornecida ao auxiliar4."
    ];
}

$acao = $payloadAux4['acao'] ?? '';
$n_serial = $payloadAux4['serial'] ?? null;
$quantidade = isset($payloadAux4['quantidade_dezenas']) ? intval($payloadAux4['quantidade_dezenas']) : 0;

try {
    if (empty($n_serial)) {
        throw new Exception('Serial inválido.');
    }

    if ($acao === 'criar') {

        if ($quantidade <= 0) {
            throw new Exception('Quantidade de dezenas inválida.');
        }

        // determinar largura (zero-padding) usando (quantidade - 1)
        $maxIndex = $quantidade - 1;
        $width = max(1, strlen((string)$maxIndex));

        $arr = [];
        if ($quantidade === 25) {
            // Para opção 25, gravar dezenas de 01 a 25 (não 00..24)
            for ($i = 1; $i <= $quantidade; $i++) {
                $arr[] = str_pad((string)$i, $width, '0', STR_PAD_LEFT);
            }
        } else {
            for ($i = 0; $i < $quantidade; $i++) {
                $arr[] = str_pad((string)$i, $width, '0', STR_PAD_LEFT);
            }
        }

        $json = json_encode($arr, JSON_UNESCAPED_UNICODE);

        // Atualiza a tabela rifas: cota_disponive = json, reservada=null, paga=null
        $sql = "UPDATE rifas SET cota_disponive = ?, cota_reservada = NULL, cota_paga = NULL WHERE n_serial = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Falha ao preparar statement: ' . $conn->error);
        }
        $stmt->bind_param('ss', $json, $n_serial);
        if (!$stmt->execute()) {
            $err = $stmt->error;
            $stmt->close();
            throw new Exception('Falha ao executar update: ' . $err);
        }
        $stmt->close();

        return ["status" => "sucesso"];

    } elseif ($acao === 'rollback') {

        // limpar colunas (setar para NULL)
        $sql = "UPDATE rifas SET cota_disponive = NULL, cota_reservada = NULL, cota_paga = NULL WHERE n_serial = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            return ["status" => "erro", "mensagem" => 'Falha ao preparar rollback: ' . $conn->error];
        }
        $stmt->bind_param('s', $n_serial);
        if (!$stmt->execute()) {
            $err = $stmt->error;
            $stmt->close();
            return ["status" => "erro", "mensagem" => 'Falha ao executar rollback: ' . $err];
        }
        $stmt->close();

        return ["status" => "sucesso"];

    } else {
        return ["status" => "erro", "mensagem" => "Ação inválida no auxiliar4: {$acao}"];
    }

} catch (Exception $ex) {
    return ["status" => "erro", "mensagem" => $ex->getMessage()];
}
