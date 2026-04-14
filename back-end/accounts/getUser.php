<?php

require_once __DIR__ .  '/../security/gerar-token.php';

header("Content-Type: application/json; charset=UTF-8");


// ── 1. Lê o token do cabeçalho Authorization ─────────────────

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
    echo json_encode(["logado" => false, "motivo" => "token_ausente"]);
    exit();
}


// ── 2. Valida assinatura e expiração ─────────────────────────
//
//  Com front e back em origens diferentes (Live Server x XAMPP),
//  o cookie de sessão PHP não é enviado pelo navegador, então
//  a verificação de $_SESSION não funciona nesse setup.
//
//  A assinatura JWT já é suficiente: se alguém tentar forjar um
//  token sem conhecer a JWT_SECRET, a assinatura não vai bater.

$dadosToken = validarToken($tokenRecebido);

if (!$dadosToken) {
    echo json_encode(["logado" => false, "motivo" => "token_invalido_ou_expirado"]);
    exit();
}


// ── 3. Tudo válido → retorna os dados ────────────────────────

$caminhoImagem = $dadosToken['imagem_perfil'] ?? null;
$imagemPerfil  = "http://localhost/SortuFacil/back-end-sortu-facil/midia/erro-img-perfil/icone-perfil.jpg";

if (!empty($caminhoImagem)) {
    $caminhoCompleto = $_SERVER['DOCUMENT_ROOT'] . "/SortuFacil/back-end-sortu-facil/" . $caminhoImagem;
    if (file_exists($caminhoCompleto)) {
        $imagemPerfil = "http://localhost/SortuFacil/back-end-sortu-facil/" . $caminhoImagem;
    }
}




echo json_encode([
    "logado"        => true,
    "id"            => $dadosToken['id'],
    "nome"          => $dadosToken['nome'],
    "sobrenome"     => $dadosToken['sobrenome'],
    "email"         => $dadosToken['email'],
    "permissao"     => $dadosToken['permissao'],
    "assinatura"    => $dadosToken['assinatura'],
    "imagem_perfil" => $imagemPerfil,
]);
exit();
