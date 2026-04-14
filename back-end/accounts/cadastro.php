<?php
session_start();

require_once __DIR__ .  '/../security/gerar-token.php'; // ← Importa as funções gerarToken() e validarToken()

header('Content-Type: application/json; charset=utf-8');

// ---------------- CONEXÃO ----------------
require_once __DIR__ . '/../db_config/conexao.php'; // ← Importa a função conectarUsuarios()

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro de conexão com o banco de dados"
    ]);
    exit();
}

// Só aceita POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Método de requisição inválido"
    ]);
    exit();
}

// ---------------- DADOS ----------------
$nome          = isset($_POST['nome']) ? trim($_POST['nome']) : '';
$sobrenome     = isset($_POST['sobrenome']) ? trim($_POST['sobrenome']) : '';
$email         = isset($_POST['email']) ? trim($_POST['email']) : '';
$senhaDigitada = isset($_POST['senha']) ? trim($_POST['senha']) : '';

$permissao  = "usuario";
$assinatura = "inativa";

// ---------------- VALIDAÇÕES ----------------
if (empty($nome) || empty($sobrenome)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Nome e sobrenome são obrigatórios"
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "E-mail inválido"
    ]);
    exit();
}

if (!preg_match('/^[0-9]{8}$/', $senhaDigitada)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "A senha deve conter exatamente 8 números"
    ]);
    exit();
}

// ---------------- VERIFICA EMAIL ----------------
$checkEmail = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$checkEmail->bind_param("s", $email);
$checkEmail->execute();

if ($checkEmail->get_result()->num_rows > 0) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Este e-mail já está cadastrado"
    ]);
    exit();
}

// ---------------- GERAR IDENTIFICADOR ----------------
function gerarIdentificador($nome, $sobrenome, $conn) {
    $letras = strtoupper(
        substr($nome, 0, 1) .
        substr($sobrenome, 0, 1) .
        substr($sobrenome, -1, 1)
    );

    do {
        $numeros = str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $identificador = $letras . $numeros;

        $check = $conn->prepare(
            "SELECT id FROM usuarios WHERE identificador = ?"
        );
        $check->bind_param("s", $identificador);
        $check->execute();

    } while ($check->get_result()->num_rows > 0);

    return $identificador;
}

$identificador = gerarIdentificador($nome, $sobrenome, $conn);

// ---------------- IMAGEM DE PERFIL ----------------
$imagemPadrao  = "midia/padrao/perfil-default.png";
$imagemCaminho = $imagemPadrao;

if (!empty($_FILES['imagem_perfil']['name'])) {

    $arquivo = $_FILES['imagem_perfil'];
    $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    $permitidas = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array($extensao, $permitidas)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Formato de imagem inválido"
        ]);
        exit();
    }

    if ($arquivo['size'] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Imagem maior que 2MB"
        ]);
        exit();
    }

    $pasta = "midia/" . $identificador;
    if (!is_dir($pasta)) {
        mkdir($pasta, 0755, true);
    }

    $nomeArquivo = strtolower($nome) . "-perfil." . $extensao;
    $destino = $pasta . "/" . $nomeArquivo;

    if (!move_uploaded_file($arquivo['tmp_name'], $destino)) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Erro ao salvar imagem"
        ]);
        exit();
    }

    $imagemCaminho = "/" . $destino;
}

// ---------------- INSERÇÃO ----------------
$senhaHash = password_hash($senhaDigitada, PASSWORD_DEFAULT);

$sql = "INSERT INTO usuarios
(nome, sobrenome, email, senha, permissoes, assinatura, identificador, imagem_perfil)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao preparar a inserção"
    ]);
    exit();
}

$stmt->bind_param(
    "ssssssss",
    $nome,
    $sobrenome,
    $email,
    $senhaHash,
    $permissao,
    $assinatura,
    $identificador,
    $imagemCaminho
);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao criar cadastro"
    ]);
    exit();
}

$novoId = $stmt->insert_id;

// ✅ Marca como online após cadastro
$updateSql = "UPDATE usuarios SET status_atividade = 'online' WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("i", $novoId);
$updateStmt->execute();

// ── Cadastro bem-sucedido ────────────────────────────────────

// 1. Gera o token com os dados do usuário
$token = gerarToken([
    'id'           => $novoId,
    'nome'         => $nome,
    'sobrenome'    => $sobrenome,
    'email'        => $email,
    'permissao'    => $permissao,
    'assinatura'   => $assinatura,
    'imagem_perfil' => $imagemCaminho
]);

// 2. Salva o token na sessão do servidor
//    Isso permite invalidar o token no logout,
//    mesmo antes de ele expirar.
$_SESSION['cadastro_ok']   = true;
$_SESSION['id']            = $novoId;
$_SESSION['token']         = $token;
$_SESSION['usuario']       = $nome;
$_SESSION['sobrenome']     = $sobrenome;
$_SESSION['email']         = $email;
$_SESSION['permissao']     = $permissao;
$_SESSION['assinatura']    = $assinatura;
$_SESSION['imagem_perfil'] = $imagemCaminho;

// 3. Retorna o token para o front-end — o redirecionamento é responsabilidade do front
http_response_code(201);
echo json_encode([
    "status"  => "success",
    "message" => "Cadastro realizado com sucesso",
    "token"   => $token
]);
$conn->close();

