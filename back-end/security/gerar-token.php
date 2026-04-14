<?php
// ============================================================
//  gerar-token.php
//  Gera e valida JWT manualmente, sem biblioteca externa.
//
//  Como o JWT funciona:
//  1. header  → tipo do token e algoritmo (base64url)
//  2. payload → dados do usuário + quando expira (base64url)
//  3. assinatura → HMAC-SHA256 do header+payload com a chave secreta
//
//  Resultado final: "header.payload.assinatura"
// ============================================================

// ⚠️  TROQUE ESSA CHAVE por uma string longa e aleatória.
//     Ela é o "segredo" que garante que só o SEU servidor
//     consegue criar tokens válidos.
//     Sugestão: gere com  php -r "echo bin2hex(random_bytes(32));"
define('JWT_SECRET', getenv('chave_de_seguranca_jwt')); // Substitua pela sua chave secreta real

// Tempo de validade do token em segundos (1 hora = 3600)
define('JWT_EXPIRACAO', 3600);


// ── Helpers base64url ────────────────────────────────────────
// O JWT usa base64url (diferente do base64 normal):
// substitui + por -, / por _ e remove o = do final.

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    // Adiciona o padding (=) de volta antes de decodificar
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}


// ── Geração do token ─────────────────────────────────────────

function gerarToken(array $dadosUsuario): string {

    // 1. Header: diz que é JWT e usa o algoritmo HS256
    $header = base64url_encode(json_encode([
        'alg' => 'HS256',
        'typ' => 'JWT'
    ]));

    // 2. Payload: dados do usuário + tempo de expiração
    //    "iat" = issued at (quando foi gerado)
    //    "exp" = expiration (quando expira)
    $agora = time();
    $payload = base64url_encode(json_encode([
        'iat'         => $agora,
        'exp'         => $agora + JWT_EXPIRACAO,
        'id'          => $dadosUsuario['id'],
        'email'       => $dadosUsuario['email'],
        'nome'        => $dadosUsuario['nome'],
        'sobrenome'   => $dadosUsuario['sobrenome'],
        'permissao'   => $dadosUsuario['permissao'],
        'assinatura'  => $dadosUsuario['assinatura'],
        'imagem_perfil' => $dadosUsuario['imagem_perfil']
    ]));

    // 3. Assinatura: HMAC-SHA256 de "header.payload" com a chave secreta
    $assinatura = base64url_encode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    // Junta tudo: "header.payload.assinatura"
    return "$header.$payload.$assinatura";
}


// ── Validação do token ───────────────────────────────────────

function validarToken(string $token): array|false {

    // Divide nas 3 partes
    $partes = explode('.', $token);
    if (count($partes) !== 3) {
        return false; // Formato inválido
    }

    [$header, $payload, $assinaturaRecebida] = $partes;

    // Recalcula a assinatura esperadaphp -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    $assinaturaEsperada = base64url_encode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    // Compara de forma segura (evita timing attacks)
    if (!hash_equals($assinaturaEsperada, $assinaturaRecebida)) {
        return false; // Assinatura não bate → token adulterado ou chave errada
    }

    // Decodifica o payload
    $dados = json_decode(base64url_decode($payload), true);

    // Verifica se expirou
    if (!isset($dados['exp']) || time() > $dados['exp']) {
        return false; // Token expirado
    }

    return $dados; // Tudo OK → retorna os dados do usuário
}
