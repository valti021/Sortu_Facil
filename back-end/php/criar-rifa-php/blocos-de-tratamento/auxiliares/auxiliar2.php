<?php
/**************************************************
 * AUXILIAR - JSON DOS PRÊMIOS
 * Estruturação segura e padronizada
 **************************************************/

if (!isset($bloco3)) {
    return [
        "status"   => "erro",
        "mensagem" => "Dados dos prêmios não recebidos."
    ];
}

$quantidade = $bloco3["quantidade_premios"] ?? 0;
$valor      = $bloco3["valor_premio"] ?? 0;
$nomes      = $bloco3["nomes_premios"] ?? [];

if ($quantidade <= 0 || empty($nomes)) {
    return [
        "status"   => "erro",
        "mensagem" => "Estrutura de prêmios inválida."
    ];
}

/* ===============================
   MONTAGEM DO JSON
================================ */
$premios = [];

$contador = 1;
foreach ($nomes as $nome) {

    if (trim($nome) === "") {
        return [
            "status"   => "erro",
            "mensagem" => "Nome de prêmio vazio detectado."
        ];
    }

    $premios[] = [
        "ordem" => $contador,
        "nome"  => trim($nome),
        "valor" => (float) $valor
    ];

    $contador++;
}

/* ===============================
   SUCESSO
================================ */
return [
    "status"       => "sucesso",
    "premios_json" => json_encode($premios, JSON_UNESCAPED_UNICODE)
];
