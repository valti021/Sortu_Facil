<?php
// gestor-de-rifa/php/modal-data-rifa.php

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=UTF-8');

// Verificar se conexao.php existe
if (!file_exists(__DIR__ . '/conexao.php')) {
    echo json_encode([
        'success' => false,
        'erro' => 'Arquivo de conexão não encontrado'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

require_once __DIR__ . '/conexao.php';

// Conectar ao banco de sorteios
$conn = conectarSorteios();

// Verificar se $conn foi definido
if (!isset($conn)) {
    echo json_encode([
        'success' => false,
        'erro' => 'Falha ao conectar ao banco de sorteios'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // ==========================
    // Mapeamento dos dias da semana
    // ==========================
    $diasSemana = [
        0 => 'Domingo',
        1 => 'Segunda-feira',
        2 => 'Terça-feira',
        3 => 'Quarta-feira',
        4 => 'Quinta-feira',
        5 => 'Sexta-feira',
        6 => 'Sábado'
    ];
    
    // ==========================
    // Consulta ao banco (MySQLi)
    // ==========================
    $sql = "
        SELECT 
            dia_semana,
            mes,
            ano,
            horario_sorteio
        FROM agenda_sorteios
        WHERE status = 'ativo'
        ORDER BY 
            ano,
            FIELD(mes, 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'),
            dia_semana, 
            horario_sorteio
    ";

    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Erro na consulta: " . $conn->error);
    }
    
    // ==========================
    // Tratamento dos dados
    // ==========================
    $agenda = [];
    $anosSet = [];

    while ($row = $result->fetch_assoc()) {
        $diaNumero = (int) $row['dia_semana'];

        $anoValor = null;
        if (isset($row['ano']) && $row['ano'] !== '') {
            $anoValor = (int) $row['ano'];
            $anosSet[$anoValor] = true;
        }

        $agenda[] = [
            'dia_semana_numero' => $diaNumero,
            'dia_semana_nome'   => $diasSemana[$diaNumero] ?? 'Desconhecido',
            'mes'               => $row['mes'],
            'ano'               => $anoValor,
            'horario'           => substr($row['horario_sorteio'], 0, 5)
        ];
    }
    
    // Liberar resultado
    $result->free();
    
    // ==========================
    // Anos disponíveis (vindo do banco)
    // ==========================
    $anosDisponiveis = [];
    if (!empty($anosSet)) {
        $anosDisponiveis = array_map('intval', array_keys($anosSet));
        sort($anosDisponiveis);
    } else {
        // Fallback: manter comportamento anterior caso não haja anos no BD
        $anoAtual = (int) date('Y');
        $anosDisponiveis = [
            $anoAtual,
            $anoAtual + 1,
            $anoAtual + 2
        ];
    }
    
    // ==========================
    // Resposta final
    // ==========================
    $response = [
        'success' => true,
        'agenda' => $agenda,
        'anos'   => $anosDisponiveis,
        'total'  => count($agenda)
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'erro' => $e->getMessage(),
        'agenda' => [],
        'anos' => []
    ], JSON_UNESCAPED_UNICODE);
} finally {
    // Fechar conexão se existir
    if (isset($conn)) {
        $conn->close();
    }
}