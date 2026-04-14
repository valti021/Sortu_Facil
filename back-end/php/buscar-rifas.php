<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../cors-config.php';
require_once __DIR__ . '/../gerar-token.php';
require_once __DIR__ . '/conexao.php';

header("Content-Type: application/json; charset=UTF-8");

function responder($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
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
    responder([]);
}

$dadosToken = validarToken($tokenRecebido);
if (!$dadosToken) {
    responder([]);
}

$conn = conectardb();

if (!$conn) {
    responder([]);
}

$email  = $dadosToken['email'];
$status = $_GET['status'] ?? 'ativa';

$limit  = 4;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

// ======================================================
// BUSCA DAS RIFAS
// ======================================================
$sql = "
    SELECT 
        id,
        n_serial,
        nome_rifa,
        data_sorteio,
        tipo_quantidade_dezenas,
        valor_dezena,
        descricao,
        img,
        quantidade_premios,
        status
    FROM rifas
    WHERE email = ? AND status = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    responder([]);
}

$stmt->bind_param("ssii", $email, $status, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$saida = [];

while ($r = $result->fetch_assoc()) {

    $id      = (int)$r['id'];
    $serial  = $r['n_serial'];

    // ---------------- DATA ----------------
    $dataSorteio = null;
    if (!empty($r['data_sorteio'])) {
        $d = new DateTime($r['data_sorteio'], new DateTimeZone('America/Sao_Paulo'));
        $dataSorteio = $d->format('d/m/Y');
    }

    // ---------------- STATUS ----------------
    $mapStatus = [
        'ativa'      => 'active',
        'adiada'     => 'postponed',
        'cancelada'  => 'canceled',
        'concluida'  => 'finished'
    ];
    $statusFinal = $mapStatus[$r['status']] ?? 'active';

    // ---------------- IMAGENS ----------------
    $basePath = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/";
    $baseUrl  = "http://localhost/site-um/gestor-de-rifa/";
    $imgErro  = $baseUrl . "midia/erro-imagem/img-quebrada.png";

    $images = json_decode($r['img'], true);
    if (!is_array($images)) {
        $images = [];
    }

    $validImages = [];
    foreach ($images as $imgPath) {
        if (!empty($imgPath) && file_exists($basePath . $imgPath)) {
            $validImages[] = $baseUrl . $imgPath;
        }
    }

    if (empty($validImages)) {
        $validImages[] = $imgErro;
    }

    // Mantém compatibilidade com o front-end que espera chaves "img-1", "img-2"...
    $imgMap = [];
    foreach ($validImages as $i => $url) {
        $imgMap["img-" . ($i + 1)] = $url;
    }

    // ---------------- VENDIDOS (CORRETO) ----------------
    $vendidos = 0;
    $qVenda = $conn->prepare("
        SELECT vendidos 
        FROM vendas 
        WHERE n_serial = ?
        LIMIT 1
    ");
    if ($qVenda) {
        $qVenda->bind_param("s", $serial);
        $qVenda->execute();
        $qVenda->bind_result($vendidos);
        $qVenda->fetch();
        $qVenda->close();
    }

    $total = (int)$r['tipo_quantidade_dezenas'];

    // ---------------- PREÇO ----------------
    $preco = number_format((float)$r['valor_dezena'], 2, ',', '.');

    // ---------------- JSON FINAL ----------------
    $saida[] = [
        "card-$id" => [
            "status"        => $statusFinal,
            "title"         => $r['nome_rifa'],
            // `img` old format (object with img-1, img-2...) for compatibility
            "img" => $imgMap,
            // `imgs` new format (indexed array) for future use
            "imgs" => $validImages,
            "description"   => $r['descricao'],
            "price"         => $preco,
            "tickets-sold"  => "$vendidos/$total",
            "draw-date"     => $dataSorteio
        ]
    ];
}

responder($saida);
