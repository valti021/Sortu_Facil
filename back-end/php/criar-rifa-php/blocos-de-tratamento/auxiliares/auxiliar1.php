<?php
/**************************************************
 * AUXILIAR - ARQUIVOS DA RIFA
 * Criação de pastas, imagens e rollback
 **************************************************/

if (!isset($payloadArquivos)) {
    return [
        "status"   => "erro",
        "mensagem" => "Payload de arquivos não recebido."
    ];
}

$acao   = $payloadArquivos["acao"] ?? "processar";
$serial = $payloadArquivos["serial"] ?? null;

$pastaBase = __DIR__ . "/../../../../uploads/rifas/{$serial}/";

/* ===============================
   FUNÇÃO DE ROLLBACK
================================ */
if (!function_exists('rollbackArquivos')) {
    function rollbackArquivos($serial) {
        global $pastaBase;
        if (is_dir($pastaBase)) {
            $arquivos = glob($pastaBase . "*");
            foreach ($arquivos as $arquivo) {
                @unlink($arquivo);
            }
            @rmdir($pastaBase);
        }
    }
}

/* ===============================
   ROLLBACK
================================ */
if ($acao === "rollback") {
    rollbackArquivos($serial);
    return [
        "status" => "rollback_ok"
    ];
}

/* ===============================
   VALIDAÇÕES INICIAIS
================================ */
if (!$serial || !isset($payloadArquivos["bloco4"])) {
    return [
        "status"   => "erro",
        "mensagem" => "Dados insuficientes para processar imagens."
    ];
}

$bloco3 = $payloadArquivos["bloco3"];
$bloco4 = $payloadArquivos["bloco4"];
$imagens = $bloco4["imagens"] ?? null;

if (!$imagens || !is_array($imagens) || count($imagens) === 0) {
    return [
        "status"   => "erro",
        "mensagem" => "Nenhuma imagem recebida."
    ];
}

/* ===============================
   CRIAÇÃO DA PASTA
================================ */
if (!is_dir($pastaBase)) {
    if (!mkdir($pastaBase, 0777, true)) {
        return [
            "status"   => "erro",
            "mensagem" => "Não foi possível criar a pasta de imagens."
        ];
    }
}

/* ===============================
   PROCESSAMENTO DAS IMAGENS
================================ */
$caminhos = [];

foreach ($imagens as $index => $imagem) {

    $tmp = $imagem["tmp_name"];
    $nome = $imagem["name"];

    if (!file_exists($tmp)) {
        // rollback imediato
        rollbackArquivos($serial);
        return [
            "status"   => "erro",
            "mensagem" => "Arquivo temporário da imagem " . ($index + 1) . " não encontrado."
        ];
    }

    $ext = $imagem['ext'] ?? 'png';

    $nomeFinal = "premio_" . ($index + 1) . "." . $ext;
    $destino  = $pastaBase . $nomeFinal;

    if (!rename($tmp, $destino)) {
        // rollback
        rollbackArquivos($serial);
        return [
            "status"   => "erro",
            "mensagem" => "Erro ao salvar imagem " . ($index + 1) . "."
        ];
    }

    $caminhos[] = "uploads/rifas/{$serial}/{$nomeFinal}";
}

/* ===============================
   SUCESSO
================================ */
return [
    "status"  => "sucesso",
    "imagens" => $caminhos,
    "premios_json" => json_encode($bloco3["nomes_premios_validados"], JSON_UNESCAPED_UNICODE)
];
