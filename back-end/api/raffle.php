<?php

// 🔥 Permitir métodos (mesmo com proteção do servidor, isso aqui evita 405)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// 🔥 Responder preflight (IMPORTANTE pra POST com fetch)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🔥 Bloquear métodos não permitidos (evita erro estranho depois)
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Método não permitido"
    ]);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

// aceita tanto JSON quanto FormData
$inputJSON = json_decode(file_get_contents("php://input"), true);

// fallback pra FormData (teu caso atual)
$action = $_POST['action'] ?? $inputJSON['action'] ?? null;

if (!$action) {
    echo json_encode([
        "status" => "error",
        "message" => "Ação não informada"
    ]);
    exit;
}

switch ($action) {

    case "status":
        require_once __DIR__ . '/../raffle/status.php';
        break;

    case "listar":
        require_once __DIR__ . '/../raffle/list_raffles.php';
        break;


    default:
        echo json_encode([
            "status" => "error",
            "message" => "Ação inválida"
        ]);
}