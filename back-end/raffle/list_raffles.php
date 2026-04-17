<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once '../security/gerar-token.php';
require_once "../db_config/conexao.php";

header("Content-Type: application/json; charset=UTF-8");

function responder($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// ======================================================
// 1. VALIDAÇÃO DO TOKEN (igual ao original)
// ======================================================
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
    responder(['error' => 'Token não fornecido']);
}

$dadosToken = validarToken($tokenRecebido);
if (!$dadosToken) {
    responder(['error' => 'Token inválido']);
}

$conn = conectardb();
if (!$conn) {
    responder(['error' => 'Erro na conexão com o banco']);
}

$email = $dadosToken['email'];

// ======================================================
// 2. DETERMINAR AÇÃO (via GET ou POST JSON)
// ======================================================
$action = null;
$input = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    $action = $input['action'] ?? null;
} else {
    // Fallback para GET (caso alguém use diretamente)
    $action = $_GET['action'] ?? null;
}

// Se nenhuma ação for informada, assume-se "listar" para compatibilidade
if (!$action) {
    $action = 'listar';
}

// ======================================================
// 3. ROTEAMENTO DAS AÇÕES
// ======================================================
switch ($action) {
    case 'listar':
        // Parâmetros: status, offset, limite (vindos do JSON ou GET)
        $status = $input['status'] ?? $_GET['status'] ?? 'ativa';
        $offset = isset($input['offset']) ? (int)$input['offset'] : (isset($_GET['offset']) ? (int)$_GET['offset'] : 0);
        $limit  = isset($input['limite']) ? (int)$input['limite'] : (isset($_GET['limite']) ? (int)$_GET['limite'] : 4);

        // ==================================================
        // BUSCA DAS RIFAS (código original adaptado)
        // ==================================================
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
            responder(['error' => 'Erro na preparação da consulta']);
        }

        $stmt->bind_param("ssii", $email, $status, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();

        $saida = [];

        while ($r = $result->fetch_assoc()) {
            $id      = (int)$r['id'];
            $serial  = $r['n_serial'];

            // Data
            $dataSorteio = null;
            if (!empty($r['data_sorteio'])) {
                $d = new DateTime($r['data_sorteio'], new DateTimeZone('America/Sao_Paulo'));
                $dataSorteio = $d->format('d/m/Y');
            }

            // Status (mapeamento)
            $mapStatus = [
                'ativa'      => 'active',
                'adiada'     => 'postponed',
                'cancelada'  => 'canceled',
                'concluida'  => 'finished'
            ];
            $statusFinal = $mapStatus[$r['status']] ?? 'active';

            // Imagens
            $basePath = $_SERVER['DOCUMENT_ROOT'] . "/site-um/gestor-de-rifa/";
            $baseUrl  = "http://localhost/site-um/gestor-de-rifa/";
            $imgErro  = $baseUrl . "midia/erro-imagem/img-quebrada.png";

            $images = json_decode($r['img'], true);
            if (!is_array($images)) $images = [];

            $validImages = [];
            foreach ($images as $imgPath) {
                if (!empty($imgPath) && file_exists($basePath . $imgPath)) {
                    $validImages[] = $baseUrl . $imgPath;
                }
            }
            if (empty($validImages)) $validImages[] = $imgErro;

            $imgMap = [];
            foreach ($validImages as $i => $url) {
                $imgMap["img-" . ($i + 1)] = $url;
            }

            // Vendas
            $vendidos = 0;
            $qVenda = $conn->prepare("SELECT vendidos FROM vendas WHERE n_serial = ? LIMIT 1");
            if ($qVenda) {
                $qVenda->bind_param("s", $serial);
                $qVenda->execute();
                $qVenda->bind_result($vendidos);
                $qVenda->fetch();
                $qVenda->close();
            }

            $total = (int)$r['tipo_quantidade_dezenas'];
            $preco = number_format((float)$r['valor_dezena'], 2, ',', '.');

            $saida[] = [
                "card-$id" => [
                    "status"        => $statusFinal,
                    "title"         => $r['nome_rifa'],
                    "img"           => $imgMap,
                    "imgs"          => $validImages,
                    "description"   => $r['descricao'],
                    "price"         => $preco,
                    "tickets-sold"  => "$vendidos/$total",
                    "draw-date"     => $dataSorteio
                ]
            ];
        }

        responder($saida);
        break;

    case 'status':
        // Retorna contagem de rifas por status para o usuário logado
        $statusList = ['ativa', 'adiada', 'cancelada', 'concluida'];
        $counts = [];

        foreach ($statusList as $st) {
            $stmt = $conn->prepare("SELECT COUNT(*) FROM rifas WHERE email = ? AND status = ?");
            $stmt->bind_param("ss", $email, $st);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            $counts[$st] = (int)$count;
            $stmt->close();
        }

        responder($counts);
        break;

    case 'detalhes':
        // Retorna o n_serial de uma rifa específica (para o link "Gerenciar")
        $id = $input['id'] ?? $_GET['id'] ?? 0;
        if (!$id) {
            responder(['success' => false, 'error' => 'ID não informado']);
        }

        $stmt = $conn->prepare("SELECT n_serial FROM rifas WHERE id = ? AND email = ?");
        $stmt->bind_param("is", $id, $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            responder(['success' => true, 'n_serial' => $row['n_serial']]);
        } else {
            responder(['success' => false, 'error' => 'Rifa não encontrada']);
        }
        break;

    default:
        responder(['error' => 'Ação inválida']);
        break;
}