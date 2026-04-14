<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../cors-config.php';
require_once __DIR__ . '/../../gerar-token.php';

session_start();
header("Content-Type: application/json; charset=UTF-8");

function responder($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

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
    responder(['success' => false, 'error' => 'Usuário não autenticado.']);
}

$dadosToken = validarToken($tokenRecebido);
if (!$dadosToken) {
    responder(['success' => false, 'error' => 'Usuário não autenticado.']);
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
if ($id <= 0) {
    responder(['success' => false, 'error' => 'ID da rifa não informado.']);
}

require_once __DIR__ . '/../conexao.php';
$conn = conectarRifas();
if (!$conn) {
    responder(['success' => false, 'error' => 'Erro de conexão com o banco de dados.']);
}

$email = $dadosToken['email'];

$sql = "SELECT n_serial, nome_rifa FROM rifas WHERE id = ? AND email = ? LIMIT 1";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    responder(['success' => false, 'error' => 'Erro na preparação da consulta.']);
}

$stmt->bind_param("is", $id, $email);
$stmt->execute();
$stmt->bind_result($n_serial, $nome_rifa);
if (!$stmt->fetch()) {
    $stmt->close();
    responder(['success' => false, 'error' => 'Rifa não encontrada ou sem permissão.']);
}

$stmt->close();

// Compartilha o serial selecionado na sessão para uso posterior
$_SESSION['n_serial_selecionada'] = $n_serial;

responder([
    'success' => true,
    'n_serial' => $n_serial,
    'nome_rifa' => $nome_rifa
]);

?>
