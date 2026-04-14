<?php

require_once __DIR__ . '/../security/gerar-token.php';
require_once __DIR__ . '/../db_config/conexao.php';

header("Content-Type: application/json; charset=UTF-8");

// ── 1. Pegar token ─────────────────────────

$tokenRecebido = null;
$cabecalho = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

if (empty($cabecalho) && function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $cabecalho = $headers['Authorization'] ?? '';
}

if (!empty($cabecalho) && str_starts_with($cabecalho, 'Bearer ')) {
    $tokenRecebido = substr($cabecalho, 7);
}

if (!$tokenRecebido) {
    echo json_encode(["status" => "erro", "mensagem" => "Token ausente"]);
    exit();
}

// ── 2. Validar token ───────────────────────

$dadosToken = validarToken($tokenRecebido);

if (!$dadosToken) {
    echo json_encode(["status" => "erro", "mensagem" => "Token inválido"]);
    exit();
}

// ── 3. Atualizar para offline ─────────────

$userId = $dadosToken['id'];

$sql = "UPDATE usuarios SET status_atividade = 'offline' WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();

// ── 4. Resposta ───────────────────────────

echo json_encode([
    "status" => "sucesso",
    "mensagem" => "Logout realizado com sucesso"
]);
exit();