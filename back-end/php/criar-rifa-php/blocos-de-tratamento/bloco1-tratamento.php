<?php
/**************************************************
 * BLOCO 1 - TRATAMENTO DE DADOS PRINCIPAIS
 * - Valida sessão
 * - Valida nome, sobrenome e e-mail
 * - Monta nome completo do organizador
 * - Valida título, descrição e tema da rifa
 **************************************************/

// ===============================
// SEGURANÇA DE CONTEXTO
// ===============================
if (!isset($dadosSessao, $bloco1, $conn)) {
    throw new Exception("Erro interno: dados do bloco 1 não recebidos.");
}

// ===============================
// DADOS DA SESSÃO
// ===============================
$nomeUsuario      = trim($_SESSION['usuario'] ?? '');
$sobrenomeUsuario = trim($_SESSION['sobrenome'] ?? '');
$emailUsuario     = trim($_SESSION['email'] ?? '');

// ===============================
// VALIDAÇÕES DE SESSÃO
// ===============================
if (empty($nomeUsuario)) {
    throw new Exception("Nome do usuário não encontrado na sessão.");
}

if (empty($sobrenomeUsuario)) {
    throw new Exception("Sobrenome do usuário não encontrado na sessão.");
}

if (empty($emailUsuario)) {
    throw new Exception("E-mail do usuário não encontrado na sessão.");
}

if (!filter_var($emailUsuario, FILTER_VALIDATE_EMAIL)) {
    throw new Exception("E-mail do usuário inválido.");
}

// ===============================
// MONTAR NOME COMPLETO
// ===============================
$nomeCompleto = "{$nomeUsuario} {$sobrenomeUsuario}";

// ===============================
// DADOS DA RIFA
// ===============================
$nomeRifa  = trim($bloco1['nome_rifa'] ?? '');
$descricao = trim($bloco1['descricao'] ?? '');
$temaRifa  = trim($bloco1['tema_rifa'] ?? '');

// ===============================
// VALIDAÇÃO DO TÍTULO
// ===============================
if (empty($nomeRifa)) {
    throw new Exception("O título da rifa é obrigatório.");
}

$qtTitulo = mb_strlen($nomeRifa, 'UTF-8');

if ($qtTitulo > 25) {
    throw new Exception(
        "O título da rifa deve ter no máximo 25 caracteres. Atual: {$qtTitulo}."
    );
}

// ===============================
// VALIDAÇÃO DA DESCRIÇÃO
// ===============================
if (empty($descricao)) {
    throw new Exception("A descrição da rifa é obrigatória.");
}

$qtDescricao = mb_strlen($descricao, 'UTF-8');

if ($qtDescricao > 100) {
    throw new Exception(
        "A descrição da rifa deve ter no máximo 100 caracteres. Atual: {$qtDescricao}."
    );
}

// ===============================
// VALIDAÇÃO DO TEMA
// ===============================
if (empty($temaRifa)) {
    throw new Exception("O tema da rifa é obrigatório.");
}

// ===============================
// VALIDAÇÃO DO TEMA NO BANCO
// ===============================
$sql = "
    SELECT 1
    FROM sorteios.agenda_sorteios
    WHERE tema = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    throw new Exception("Erro interno ao preparar validação do tema.");
}

$stmt->bind_param("s", $temaRifa);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    throw new Exception("A opção de tema selecionada é inválida.");
}

$stmt->close();

// ===============================
// SAÍDA PADRONIZADA DO BLOCO 1
// ===============================
$dadosRifaBase = [
    "email"        => $emailUsuario,
    "organizador"  => $nomeCompleto,
    "nome_rifa"    => $nomeRifa,
    "descricao"    => $descricao,
    "tema_rifa"    => $temaRifa
];

// ===============================
// BLOCO 1 FINALIZADO COM SUCESSO
// ===============================
// Nenhum echo
// Nenhum return
// Nenhum header
