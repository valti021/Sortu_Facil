<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();

header("Content-Type: application/json; charset=UTF-8");

// DEFINA O FUSO HORÁRIO EXPLICITAMENTE
date_default_timezone_set('America/Sao_Paulo'); // Horário de Brasília

function responder($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ===============================
   VALIDAÇÃO DA SESSÃO
================================ */
if (!isset($_SESSION['n_serial_selecionada'])) {
    responder([
        'success' => false,
        'error' => 'Número serial não encontrado na sessão.'
    ]);
}

$n_serial = $_SESSION['n_serial_selecionada'];

/* ===============================
   CONEXÃO
================================ */
require_once __DIR__ . '/../../conexao.php';
$conn = conectarRifas();

if (!$conn) {
    responder([
        'success' => false,
        'error' => 'Erro ao conectar ao banco.'
    ]);
}

/* ===============================
   CONSULTA
================================ */
$sql = "
SELECT 
    cota_disponive,
    cota_reservada,
    cota_paga,
    tipo_quantidade_dezenas,
    status,
    data_sorteio,
    img
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

/* ===============================
   TRATAMENTO DAS IMAGENS
================================ */

// Caminhos base
$basePath = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/";
$baseUrl  = "http://localhost/site-um/gestor-de-rifa/";
$imgErro  = $baseUrl . "midia/erro-imagem/img-quebrada.png";

// Resultado final
$validImages = [];
$imgMap = [];

// Decodifica o JSON da coluna img
$imgsJson = json_decode($rifa['img'], true);

if (is_array($imgsJson)) {
    foreach ($imgsJson as $index => $relativePath) {

        // Normaliza a barra (segurança)
        $relativePath = str_replace('\\', '/', $relativePath);

        // Caminho físico no servidor
        $fullPath = $basePath . $relativePath;

        // Verifica se o arquivo existe
        if (file_exists($fullPath)) {
            $url = $baseUrl . $relativePath;
        } else {
            $url = $imgErro;
        }

        // Formato novo (array simples)
        $validImages[] = $url;

        // Formato antigo (img-1, img-2...)
        $imgMap['img-' . ($index + 1)] = $url;
    }
} else {
    // Caso não tenha imagens válidas
    $validImages[] = $imgErro;
    $imgMap['img-1'] = $imgErro;
}


/* ===============================
   FUNÇÃO PARA CONTAR GRUPOS
================================ */
function contarGrupos($json) {
    if (is_null($json)) {
        return 0;
    }

    if (is_string($json)) {
        $trim = trim($json);
        if ($trim === '' || strtolower($trim) === 'null') {
            return 0;
        }
    }

    $dados = json_decode($json, true);

    if (is_array($dados)) {
        return count($dados);
    }

    return 0;
}

/* ===============================
   PROCESSAMENTO DAS COTAS
================================ */
$cotas_disponiveis = contarGrupos($rifa['cota_disponive']);
$cotas_reservadas  = contarGrupos($rifa['cota_reservada']);
$cotas_pagas       = contarGrupos($rifa['cota_paga']);
$cotas_totais      = intval($rifa['tipo_quantidade_dezenas']);

/* ===============================
   DATA E HORA DO SERVIDOR
================================ */
$dataHoraAtual = date('Y-m-d H:i:s');

// DEBUG: Adicione esta linha para verificar
error_log("HORA DO SERVIDOR: " . $dataHoraAtual . " | Timezone: " . date_default_timezone_get());

/* ===============================
   RESPOSTA FINAL
================================ */
responder([
    'success' => true,
    'n_serial' => $n_serial,

    /* Estado da rifa */
    'status' => $rifa['status'],
    'data_sorteio' => $rifa['data_sorteio'],

    /* Hora oficial do servidor */
    'servidor' => [
        'data_hora_completa' => $dataHoraAtual,
        'data'   => date('Y-m-d'),
        'hora'   => date('H'),
        'minuto' => date('i'),
        'segundo'=> date('s'),
        'timezone' => date_default_timezone_get()
    ],

    /* Cotas */
    'cotas' => [
        'disponiveis' => $cotas_disponiveis,
        'reservadas'  => $cotas_reservadas,
        'pagas'       => $cotas_pagas,
        'totais'      => $cotas_totais
    ],

    /* ---------------- IMAGENS ---------------- */
    // compatibilidade com código antigo
    'img'  => $imgMap,

    // formato novo e recomendado
    'imgs' => $validImages
]);
