<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();

header("Content-Type: application/json; charset=UTF-8");

function responder($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['n_serial_selecionada'])) {
    responder([
        'success' => false,
        'error' => 'Número serial não encontrado na sessão.'
    ]);
}

$n_serial = $_SESSION['n_serial_selecionada'];

require_once __DIR__ . '/../../conexao.php';
$conn = conectarRifas();

if (!$conn) {
    responder([
        'success' => false,
        'error' => 'Erro ao conectar ao banco.'
    ]);
}

$sql = "SELECT nome_rifa , tipo_quantidade_dezenas, cota_disponive, cota_reservada, cota_paga FROM rifas WHERE n_serial = ? LIMIT 1";
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

function parseJsonOrNull($json) {
    if (is_null($json)) return null;
    if (is_string($json)) {
        $trim = trim($json);
        if ($trim === '' || strtolower($trim) === 'null') return null;
    }
    $decoded = json_decode($json, true);
    if (is_array($decoded)) return $decoded;
    return null;
}

$disponiveis = parseJsonOrNull($rifa['cota_disponive']);
$reservadas = parseJsonOrNull($rifa['cota_reservada']);
$pagas = parseJsonOrNull($rifa['cota_paga']);
$qtd = intval($rifa['tipo_quantidade_dezenas']);

responder([
    'success' => true,
    'n_serial' => $n_serial,
    'nome' => $rifa['nome_rifa'],
    'quantidade_dezenas' => $qtd,
    'cotas' => [
        'disponiveis' => $disponiveis,
        'reservadas' => $reservadas,
        'pagas' => $pagas
    ]
]);

?>
