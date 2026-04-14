<?php
session_start();

require_once __DIR__ .  '/../security/gerar-token.php'; // ← Importa as funções gerarToken() e validarToken()
require_once __DIR__ . '/../db_config/conexao.php'; // ← Importa a função conectarUsuarios()

header('Content-Type: application/json; charset=utf-8');


if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Erro na conexão com o banco de dados"
    ]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Método de requisição inválido"
    ]);
    exit();
}

$email        = isset($_POST['email'])    ? trim($_POST['email'])    : '';
$senhaDigitada = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($email) || empty($senhaDigitada)) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "E-mail e senha são obrigatórios"
    ]);
    exit();
}

if (!preg_match('/^[0-9]{8}$/', $senhaDigitada)) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Formato de senha inválido"
    ]);
    exit();
}

$sql = "SELECT 
            id, nome, sobrenome, email, senha,
            permissoes, assinatura, imagem_perfil,status_atividade
        FROM usuarios
        WHERE email = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "E-mail não encontrado"
    ]);
    exit();
}

$usuario = $res->fetch_assoc();

if (!password_verify($senhaDigitada, $usuario['senha'])) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Senha incorreta"
    ]);
    exit();
}

// ── Login bem-sucedido ───────────────────────────────────────

// ✅ Atualiza status para "online"
$updateSql = "UPDATE usuarios SET status_atividade = 'online' WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("i", $usuario['id']);
$updateStmt->execute();

// ── Login bem-sucedido ───────────────────────────────────────

// 1. Gera o token com os dados do usuário
$token = gerarToken([
    'id'           => $usuario['id'],
    'nome'         => $usuario['nome'],
    'sobrenome'    => $usuario['sobrenome'],
    'email'        => $usuario['email'],
    'permissao'    => $usuario['permissoes'],
    'assinatura'   => $usuario['assinatura'],
    'imagem_perfil'=> $usuario['imagem_perfil'],
    'status_atividade' => $usuario['status_atividade']
]);

// 2. Salva o token na sessão do servidor
//    Isso permite invalidar o token no logout,
//    mesmo antes de ele expirar.
$_SESSION['login_ok'] = true;
$_SESSION['token']    = $token;
$_SESSION['id']       = $usuario['id'];

// 3. Retorna o token para o front-end — o redirecionamento é responsabilidade do front
http_response_code(200);
echo json_encode([
    "status"  => "success",
    "message" => "Login realizado com sucesso",
    "token"   => $token
]);

$conn->close();
