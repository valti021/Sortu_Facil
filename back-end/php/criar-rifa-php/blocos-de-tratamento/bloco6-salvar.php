<?php
/**************************************************
 * BLOCO 6 - SALVAMENTO FINAL DA RIFA
 * Orquestra arquivos, rollback e banco
 **************************************************/

if (!isset($dadosParaSalvar, $conn)) {
    throw new Exception("Dados insuficientes para salvar a rifa.");
}

/* ===============================
   FUNÇÃO: GERAR SERIAL
================================ */
function gerarSerialRifa(): string {
    $letras = '';
    for ($i = 0; $i < 3; $i++) {
        $letras .= chr(rand(65, 90));
    }

    return sprintf(
        '%s-%s-%s-314.%02d',
        $letras,
        date('d'),
        date('m'),
        rand(0, 99)
    );
}

$n_serial = gerarSerialRifa();

/* ===============================
   CHAMADA DO AUXILIAR 1 (IMAGENS / PRÊMIOS)
================================ */
$payloadArquivos = [
    "acao"   => "processar",
    "serial" => $n_serial,
    "bloco3" => $dadosParaSalvar["bloco3"],
    "bloco4" => $dadosParaSalvar["bloco4"]
];

$arquivoAuxiliar1 = __DIR__ . "/auxiliares/auxiliar1.php";
$responseAux1    = require $arquivoAuxiliar1;

if (
    !is_array($responseAux1) ||
    ($responseAux1["status"] ?? "") !== "sucesso"
) {
    throw new Exception(
        $responseAux1["mensagem"] ?? "Falha ao processar arquivos da rifa."
    );
}

/* ===============================
   DADOS RETORNADOS DO AUXILIAR 1
================================ */
$caminhosImagens = $responseAux1["imagens"] ?? null;
$jsonPremios     = $responseAux1["premios_json"] ?? null;

if (!$caminhosImagens || !$jsonPremios) {

    $rollbackPayload = $payloadArquivos;
    $rollbackPayload["acao"] = "rollback";
    require $arquivoAuxiliar1;

    throw new Exception("Erro interno ao estruturar imagens ou prêmios.");
}

/* =====================================================
   🔥 NOVO PONTO — CHAMADA DO AUXILIAR 3 (CONTADOR)
===================================================== */
$payloadAux3 = [
    "acao"               => "criar",
    "serial"             => $n_serial,
    "quantidade_dezenas" => $dadosParaSalvar["bloco2"]["tipo_quantidade_dezenas"]
];

$arquivoAuxiliar3 = __DIR__ . "/auxiliares/auxiliar3.php";
$responseAux3    = require $arquivoAuxiliar3;

if (
    !is_array($responseAux3) ||
    ($responseAux3["status"] ?? "") !== "sucesso"
) {

    // rollback auxiliar 1
    $rollbackPayload = $payloadArquivos;
    $rollbackPayload["acao"] = "rollback";
    require $arquivoAuxiliar1;

    // rollback auxiliar 3
    $payloadAux3["acao"] = "rollback";
    require $arquivoAuxiliar3;

    throw new Exception(
        $responseAux3["mensagem"] ?? "Falha ao inicializar contador da rifa."
    );
}

/* ===============================
   AJUSTE DATA/HORA
================================ */
$dataFront = $dadosParaSalvar["bloco2"]["data_sorteio"] ?? '';
$horaFront = $dadosParaSalvar["bloco2"]["horario_sorteio"] ?? '';

if (!empty($dataFront) && !empty($horaFront)) {
    if (!preg_match('/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/', $dataFront)) {
        if (
            preg_match('/^\d{4}-\d{2}-\d{2}$/', $dataFront) &&
            preg_match('/^\d{1,2}:\d{2}$/', $horaFront)
        ) {
            $combined = sprintf('%s %s:00', $dataFront, $horaFront);
            $dt = DateTime::createFromFormat(
                'Y-m-d H:i:s',
                $combined,
                new DateTimeZone('America/Sao_Paulo')
            );
            if ($dt) {
                $dadosParaSalvar["bloco2"]["data_sorteio"] = $dt->format('Y-m-d H:i:s');
            }
        }
    }
}

/* ===============================
   SALVAR NO BANCO PRINCIPAL
================================ */
try {

    $status = "ativa";
    $imagens_json = json_encode($caminhosImagens, JSON_UNESCAPED_UNICODE);

    $sql = "INSERT INTO rifas (
        email,
        organizador,
        status,
        nome_rifa,
        descricao,
        tema_rifa,
        tipo_quantidade_dezenas,
        valor_dezena,
        tipo_sorteio,
        data_sorteio,
        dia_semana_sorteio,
        visibilidade,
        modelo_pagamento,
        chave_pix,
        lucro_final,
        quantidade_premios,
        valor_premio,
        nome_premios,
        img,
        n_serial
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "sssssssdssssssdsssss",
        $dadosParaSalvar["sessao"]["email"],
        $dadosParaSalvar["sessao"]["usuario"],
        $status,
        $dadosParaSalvar["bloco1"]["nome_rifa"],
        $dadosParaSalvar["bloco1"]["descricao"],
        $dadosParaSalvar["bloco1"]["tema_rifa"],
        $dadosParaSalvar["bloco2"]["tipo_quantidade_dezenas"],
        $dadosParaSalvar["bloco2"]["valor_dezena"],
        $dadosParaSalvar["bloco2"]["tipo_sorteio"],
        $dadosParaSalvar["bloco2"]["data_sorteio"],
        $dadosParaSalvar["bloco2"]["dia_semana"],
        $dadosParaSalvar["bloco2"]["visibilidade"],
        $dadosParaSalvar["bloco2"]["modelo_pagamento"],
        $dadosParaSalvar["bloco2"]["chave_pix"],
        $dadosParaSalvar["bloco5"]["lucro_final"],
        $dadosParaSalvar["bloco3"]["quantidade_premios"],
        $dadosParaSalvar["bloco3"]["valor_premio"],
        $jsonPremios,
        $imagens_json,
        $n_serial
    );

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    $rifaId = $conn->insert_id;
    $stmt->close();

} catch (Exception $e) {

    // rollback auxiliar 1
    $payloadArquivos["acao"] = "rollback";
    require $arquivoAuxiliar1;

    // rollback auxiliar 3
    $payloadAux3["acao"] = "rollback";
    require $arquivoAuxiliar3;

    throw new Exception(
        "Não foi possível criar a rifa no momento. Tente novamente mais tarde."
    );
}

/* =====================================================
   🔥 NOVO PONTO — CHAMADA DO AUXILIAR 4 (COTAS)
   Gera as cotas disponíveis em JSON e grava nas colunas
   cota_disponive, cota_reservada, cota_paga usando n_serial
===================================================== */
$payloadAux4 = [
    "acao" => "criar",
    "serial" => $n_serial,
    "quantidade_dezenas" => $dadosParaSalvar["bloco2"]["tipo_quantidade_dezenas"]
];

$arquivoAuxiliar4 = __DIR__ . "/auxiliares/auxiliar4.php";
$responseAux4 = require $arquivoAuxiliar4;

if (!is_array($responseAux4) || ($responseAux4["status"] ?? "") !== "sucesso") {

    // rollback auxiliar 1
    $payloadArquivos["acao"] = "rollback";
    require $arquivoAuxiliar1;

    // rollback auxiliar 3
    $payloadAux3["acao"] = "rollback";
    require $arquivoAuxiliar3;

    // apagar registro criado na tabela rifas
    try {
        $del = $conn->prepare("DELETE FROM rifas WHERE id = ? LIMIT 1");
        if ($del) {
            $del->bind_param("i", $rifaId);
            $del->execute();
            $del->close();
        }
    } catch (Exception $e) {
        // ignorar erro no delete, já vamos lançar a exceção com a mensagem do auxiliar
    }

    throw new Exception(
        $responseAux4["mensagem"] ?? "Falha ao inicializar cotas da rifa."
    );

}

/* ===============================
   RESPOSTA FINAL
================================ */
echo json_encode([
    "tipo"     => "sucesso",
    "mensagem" => "Rifa criada com sucesso!",
    "rifa_id"  => $rifaId
]);
