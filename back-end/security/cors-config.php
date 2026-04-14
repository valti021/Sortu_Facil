<?php

$origens_permitidas = [
    'http://127.0.0.1:5500',       // dev HTTP
    'https://127.0.0.1:5501',      // dev HTTPS (caso use)
    'https://valti021.github.io'   // produção
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Verifica o domínio ignorando o protocolo (http ou https)
foreach ($origens_permitidas as $permitida) {
    $dominioPermitido  = preg_replace('#^https?://#', '', $permitida);
    $dominioRequisicao = preg_replace('#^https?://#', '', $origin);

    if ($dominioRequisicao === $dominioPermitido) {
        header("Access-Control-Allow-Origin: $origin");
        break;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}