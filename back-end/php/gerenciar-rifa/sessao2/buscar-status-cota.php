<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();

header("Content-Type: application/json; charset=UTF-8");

function responder($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// ===============================
// VERIFICA SESSÃO
// ===============================
if (!isset($_SESSION['n_serial_selecionada'])) {
    responder([
        'success' => false,
        'error' => 'Número serial não encontrado na sessão.'
    ]);
}

$n_serial = $_SESSION['n_serial_selecionada'];

// ===============================
// RECEBE NÚMERO DA COTA (POST)
// ===============================
$input = json_decode(file_get_contents('php://input'), true);
$numero = trim($input['numero'] ?? '');

if ($numero === '') {
    responder([
        'success' => false,
        'error' => 'Número da cota inválido.'
    ]);
}

// ===============================
// CONEXÃO
// ===============================
require_once __DIR__ . '/../../conexao.php';
$conn = conectarRifas();

if (!$conn) {
    responder([
        'success' => false,
        'error' => 'Erro ao conectar ao banco.'
    ]);
}

// ===============================
// CONSULTA
// ===============================
$sql = "
    SELECT cota_disponive, cota_reservada, cota_paga
    FROM rifas
    WHERE n_serial = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $n_serial);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    responder([
        'success' => false,
        'error' => 'Rifa não encontrada.'
    ]);
}

$rifa = $result->fetch_assoc();

// ===============================
// FUNÇÃO DE PARSE JSON
// ===============================
function parseJsonOrEmptyArray($json) {
    if (is_null($json)) return [];
    if (is_string($json)) {
        $trim = trim($json);
        if ($trim === '' || strtolower($trim) === 'null') return [];
    }

    $decoded = json_decode($json, true);
    return is_array($decoded) ? $decoded : [];
}

// ===============================
// CONVERTE COTAS
// ===============================
$disponiveis = parseJsonOrEmptyArray($rifa['cota_disponive']);
$reservadas  = parseJsonOrEmptyArray($rifa['cota_reservada']);
$pagas       = parseJsonOrEmptyArray($rifa['cota_paga']);

// ===============================
// VERIFICA STATUS DA COTA
// ===============================
$status = 'indefinido';

if (in_array($numero, $pagas, true)) {
    $status = 'paga';

} elseif (in_array($numero, $reservadas, true)) {
    $status = 'reservada';

} elseif (in_array($numero, $disponiveis, true)) {
    $status = 'disponivel';
}

// ===============================
// RESPOSTA
// ===============================
responder([
    'success' => true,
    'numero'  => $numero,
    'status'  => $status
]);