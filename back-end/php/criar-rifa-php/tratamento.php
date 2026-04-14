<?php
/**************************************************
 * TRATAMENTO CENTRAL - CRIAR RIFA
 * Pipeline de validação por blocos
 **************************************************/

require_once __DIR__ . "/../conexao.php";

session_start();
header("Content-Type: application/json; charset=UTF-8");

// ===============================
// VALIDAR MÉTODO
// ===============================
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "tipo" => "erro_geral",
        "mensagem" => "Método inválido."
    ]);
    exit;
}

// ===============================
// VALIDAR AUTENTICAÇÃO
// ===============================
if (!isset($_SESSION["email"], $_SESSION["usuario"])) {
    http_response_code(401);
    echo json_encode([
        "tipo" => "erro_geral",
        "mensagem" => "Usuário não autenticado."
    ]);
    exit;
}

// ===============================
// CONEXÃO COM BANCO
// ===============================
$conn = conectarRifas();

// ===============================
// DADOS FIXOS DE SESSÃO
// ===============================
$dadosSessao = [
    "email"       => $_SESSION["email"],
    "usuario"    => $_SESSION["usuario"],
    "sobrenome"  => $_SESSION["sobrenome"] ?? ''
];

// ===============================
// BLOCO 1 - DADOS PRINCIPAIS
// ===============================
$bloco1 = [
    "nome_rifa" => trim($_POST["nome_rifa"] ?? ''),
    "descricao" => trim($_POST["descricao"] ?? ''),
    "tema_rifa" => trim($_POST["tema_rifa"] ?? ''),
];

// ===============================
// BLOCO 2 - SELECTS
// ===============================
$bloco2 = [
    "tipo_quantidade_dezenas" => $_POST["tipo_quantidade_dezenas"] ?? '',
    "valor_dezena"            => $_POST["valor_dezena"] ?? '',
    "tipo_sorteio"            => $_POST["tipo_sorteio"] ?? '',
    "data_sorteio"            => $_POST["data_sorteio"] ?? '',
    "horario_sorteio"         => $_POST["horario_sorteio"] ?? '',
    "dia_semana"              => $_POST["dia_semana"] ?? '',
    "visibilidade"            => $_POST["visibilidade"] ?? '',
    "modelo_pagamento"        => $_POST["modelo_pagamento"] ?? '',
    "chave_pix"               => $_POST["chave_pix"] ?? '',
];

// ===============================
// BLOCO 3 - PRÊMIOS
// ===============================
$nomesPremios = [];

foreach ($_POST as $key => $value) {
    if (strpos($key, 'nome_premio_') === 0) {
        $nomesPremios[$key] = trim($value);
    }
}

$bloco3 = [
    "quantidade_premios" => (int) ($_POST["quantidade_premios"] ?? 1),
    "valor_premio"       => (float) ($_POST["valor_premio"] ?? 0),
    "nomes_premios"      => $nomesPremios,
];

// ===============================
// BLOCO 4 - IMAGENS
// ===============================
$bloco4 = [];

// ===============================
// BLOCO 5 - FINANCEIRO
// ===============================
$bloco5 = [
    "lucro_final" => (float) ($_POST["lucro_final"] ?? 0),
    "valor_dezena"            => $_POST["valor_dezena"] ?? '',
    "tipo_quantidade_dezenas" => $_POST["tipo_quantidade_dezenas"] ?? '',
    "valor_premio"       => (float) ($_POST["valor_premio"] ?? 0),
];

// ===============================
// PIPELINE DE VALIDAÇÃO
// ===============================
try {

    // BLOCO 1
    require __DIR__ . "/blocos-de-tratamento/bloco1-tratamento.php";

    // BLOCO 2
    require __DIR__ . "/blocos-de-tratamento/bloco2-selects.php";

    // BLOCO 3
    require __DIR__ . "/blocos-de-tratamento/bloco3-premios.php";

    // BLOCO 4
    require __DIR__ . "/blocos-de-tratamento/bloco4-imagens.php";

    // BLOCO 5
    require __DIR__ . "/blocos-de-tratamento/bloco5-banco.php";

    // ===============================
    // BLOCO 6 - SALVAMENTO FINAL
    // ===============================
    $dadosParaSalvar = [
        "sessao" => $dadosSessao,
        "bloco1" => $bloco1,
        "bloco2" => $bloco2,
        "bloco3" => $bloco3,
        "bloco4" => $bloco4,
        "bloco5" => $bloco5,
    ];

    require __DIR__ . "/blocos-de-tratamento/bloco6-salvar.php";

    // O bloco 6 deve dar echo no JSON final
    exit;

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        "tipo" => "erro_geral",
        "mensagem" => $e->getMessage()
    ]);
    exit;

} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
