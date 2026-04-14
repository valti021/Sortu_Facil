<?php
// gestor-de-rifa/php/modal-opcoes-rifa.php

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=UTF-8');

// ==========================
// Verificar conexão
// ==========================
if (!file_exists(__DIR__ . '/conexao.php')) {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/conexao.php';
$conn = conectarSorteios();

if (!$conn) {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
    exit;
}

// ==========================
// Estrutura base do JSON
// ==========================
$json = [
    "visibilidade"             => [],
    "tema-da-rifa"             => [],
    "dia-semana-disponivel"    => [],
    "mes-disponivel"           => [],
    "ano-disponives"           => [],
    "horarios-disponiveis"     => [],
    "metodos-depagamento"      => [],
    "tipo-de-sorteio"          => [],
    "quantidade-premio"        => [],
    "quantidade-de-dezenas"    => []
];

// ==========================
// Consulta (somente ativos)
// ==========================
$sql = "
    SELECT
        visibilidade,
        tema,
        dia_semana,
        mes,
        ano,
        horario_sorteio,
        metodo_pagamento,
        tipo_sorteio,
        quantidade_premio,
        quantidade_dezenas
    FROM agenda_sorteios
    WHERE status = 'ativo'
";

$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {

        if (!empty($row['visibilidade'])) {
            $json['visibilidade'][] = (string)$row['visibilidade'];
        }

        if (!empty($row['tema'])) {
            $json['tema-da-rifa'][] = (string)$row['tema'];
        }

        if (!empty($row['dia_semana'])) {
            $json['dia-semana-disponivel'][] = (string)$row['dia_semana'];
        }

        if (!empty($row['mes'])) {
            $json['mes-disponivel'][] = (string)$row['mes'];
        }

        if (!empty($row['ano'])) {
            $json['ano-disponives'][] = (string)$row['ano'];
        }

        if (!empty($row['horario_sorteio'])) {
            $json['horarios-disponiveis'][] = substr((string)$row['horario_sorteio'], 0, 5);
        }

        if (!empty($row['metodo_pagamento'])) {
            $json['metodos-depagamento'][] = (string)$row['metodo_pagamento'];
        }

        if (!empty($row['tipo_sorteio'])) {
            $json['tipo-de-sorteio'][] = (string)$row['tipo_sorteio'];
        }

        if (!empty($row['quantidade_premio'])) {
            $json['quantidade-premio'][] = (string)$row['quantidade_premio'];
        }

        if (!empty($row['quantidade_dezenas'])) {
            $json['quantidade-de-dezenas'][] = (string)$row['quantidade_dezenas'];
        }
    }
}

// ==========================
// Remover duplicados
// ==========================
foreach ($json as $key => $values) {
    $json[$key] = array_values(array_unique($values));
}

// ==========================
// Resposta final
// ==========================
echo json_encode([ $json ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// ==========================
$conn->close();
