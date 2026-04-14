<?php
require_once '../cors-config.php';
require_once '../gerar-token.php';
require_once "conexao.php";

header('Content-Type: application/json; charset=UTF-8');

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
    http_response_code(401);
    echo json_encode(["error" => "token_ausente"]);
    exit;
}

$dadosToken = validarToken($tokenRecebido);

if (!$dadosToken) {
    http_response_code(401);
    echo json_encode(["error" => "token_invalido_ou_expirado"]);
    exit;
}

$conn = conectardb();

$email = $dadosToken['email'];

$statuses = ["ativa", "adiada", "cancelada", "concluida"];
$resultado = [];

foreach ($statuses as $s) {
    $sql = "SELECT COUNT(*) AS total FROM rifas WHERE email = ? AND status = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $s);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $resultado[$s] = $res["total"];
}

echo json_encode($resultado);
exit;
