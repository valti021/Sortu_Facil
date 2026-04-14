<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../protected/');
$dotenv->load();

/**
 * Configuração do banco
 */
$host = $_ENV['database_host'];
$user = $_ENV['database_user'];
$pass = $_ENV['database_password'];
$database = $_ENV['database_name'];

// Função para conectar ao banco
function conectardb() {
    global $host, $user, $pass, $database;

    $conn = new mysqli($host, $user, $pass, $database);

    if ($conn->connect_error) {
        die("Erro na conexão ao banco: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");
    return $conn;
}

$conn = conectardb();
?>
