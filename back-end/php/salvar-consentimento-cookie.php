<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

$consent = isset($_POST['consent']) ? trim($_POST['consent']) : null;
if(!$consent){
    echo json_encode(['success'=>false,'message'=>'Consentimento não informado']);
    exit;
}

// salva cookie no servidor (resposta para browser também definirá cookie)
setcookie('cookie_consent', $consent, time() + (365*24*60*60), '/');
$_SESSION['cookie_consent'] = $consent;

// Se quiser, aqui você pode atualizar o banco de dados do usuário se estiver autenticado.
// Exemplo (não ativado): if(isset($_SESSION['user_id'])) { /* atualizar tabela */ }

echo json_encode(['success'=>true,'consent'=>$consent]);
