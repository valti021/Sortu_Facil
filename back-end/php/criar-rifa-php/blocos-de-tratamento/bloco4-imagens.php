<?php
/**************************************************
 * BLOCO 4 - TRATAMENTO DE IMAGENS
 * Apenas valida dados enviados ao backend
 **************************************************/

// ===============================
// CONFIGURAÇÕES
// ===============================
$FORMATOS_PERMITIDOS = ['image/png', 'image/jpeg'];
$MAX_LARGURA  = 1080;
$MAX_ALTURA   = 1080;
$MAX_PESO_MB  = 5;
$MAX_PESO     = $MAX_PESO_MB * 1024 * 1024; // bytes

// ===============================
// COLETAR IMAGENS DO $_POST (BASE64)
// ===============================
$imagens = [];
$i = 0;
while (isset($_POST['imagem_' . $i])) {
    $base64 = $_POST['imagem_' . $i];
    $nome = $_POST['imagem_nome_' . $i] ?? 'imagem_' . $i . '.png';

    // Decodificar base64
    $data = explode(',', $base64);
    if (count($data) !== 2) {
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "Imagem " . ($i + 1) . " em formato inválido."
        ]);
        exit;
    }
    $imageData = base64_decode($data[1]);
    if (!$imageData) {
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "Falha ao decodificar imagem " . ($i + 1) . "."
        ]);
        exit;
    }

    // Salvar temporariamente
    $tempFile = tempnam(sys_get_temp_dir(), 'img');
    file_put_contents($tempFile, $imageData);

    // Detectar MIME type
    $mimeType = mime_content_type($tempFile);
    if (!in_array($mimeType, $FORMATOS_PERMITIDOS)) {
        unlink($tempFile);
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "Imagem " . ($i + 1) . " deve ser PNG ou JPG."
        ]);
        exit;
    }

    // Extensão baseada no MIME
    $ext = ($mimeType === 'image/jpeg') ? 'jpg' : 'png';

    $imagens[] = [
        'name'     => $nome,
        'type'     => $mimeType,
        'tmp_name' => $tempFile,
        'error'    => UPLOAD_ERR_OK,
        'size'     => strlen($imageData),
        'ext'      => $ext, // para usar depois
    ];

    $i++;
}

// ===============================
// QUANTIDADE ENVIADA VS QUANTIDADE DE PRÊMIOS
// ===============================
$quantidadeEnviada = count($imagens);
$quantidadePremios = (int) ($bloco3['quantidade_premios'] ?? 1);

if ($quantidadeEnviada !== $quantidadePremios) {
    http_response_code(422);
    echo json_encode([
        "tipo" => "erro_bloco_4",
        "mensagem" => "A quantidade de imagens enviadas (" . $quantidadeEnviada . ") deve corresponder à quantidade de prêmios (" . $quantidadePremios . ")."
    ]);
    exit;
}

// ===============================
// VALIDAR CADA IMAGEM
// ===============================
foreach ($imagens as $index => $imagem) {

    // -------- ERRO DE UPLOAD --------
    if ($imagem['error'] !== UPLOAD_ERR_OK) {
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "Erro ao enviar a imagem " . ($index + 1) . "."
        ]);
        exit;
    }

    // -------- PESO --------
    if ($imagem['size'] > $MAX_PESO) {
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "A imagem " . ($index + 1) . " excede o tamanho máximo de {$MAX_PESO_MB}MB."
        ]);
        exit;
    }

    // -------- MIME TYPE REAL (NÃO CONFIA NO BROWSER) --------
    $mimeType = $imagem['type']; // já detectado

    if (!in_array($mimeType, $FORMATOS_PERMITIDOS)) {
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "A imagem " . ($index + 1) . " deve ser PNG ou JPG."
        ]);
        exit;
    }

    // -------- DIMENSÕES --------
    $dimensoes = getimagesize($imagem['tmp_name']);

    if (!$dimensoes) {
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "Imagem " . ($index + 1) . " inválida ou corrompida."
        ]);
        exit;
    }

    [$largura, $altura] = $dimensoes;

    if ($largura > $MAX_LARGURA || $altura > $MAX_ALTURA) {
        http_response_code(422);
        echo json_encode([
            "tipo" => "erro_bloco_4",
            "mensagem" => "A imagem " . ($index + 1) . " não pode ultrapassar 1080x1080 pixels."
        ]);
        exit;
    }
}

// ===============================
// BLOCO 4 VALIDADO COM SUCESSO
// ===============================
$bloco4["imagens"] = $imagens;
// Não retorna nada
// Fluxo segue normalmente
