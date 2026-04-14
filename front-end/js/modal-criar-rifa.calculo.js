/**
 * Modal Criar Rifa - Cálculo de Lucro/Arrecadação
 * Responsável por: calcular lucro, arrecadação e validações numéricas
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("🧮 Inicializando cálculo...");

    const quantidadeInput = document.getElementById("tipo_quantidade_dezenas");
    const valorDezenaInput = document.getElementById("valor_dezena");
    const valorPremioInput = document.getElementById("valor_premio");

    if (!quantidadeInput || !valorDezenaInput || !valorPremioInput) {
        console.error("❌ Elementos de cálculo não encontrados");
        return;
    }

    // ====================================
    // CONFIGURAR EVENTOS DE CÁLCULO
    // ====================================
    valorDezenaInput.addEventListener('input', calcular);
    quantidadeInput.addEventListener('change', calcular);
    valorPremioInput.addEventListener('input', calcular);

    // Inicializar valores padrão
    valorDezenaInput.value = 0;
    valorPremioInput.value = 0;

    // Chamar cálculo inicial
    calcular();

    // ====================================
    // FUNÇÃO PRINCIPAL DE CÁLCULO
    // ====================================
    function calcular() {
        const quantidade = parseInt(quantidadeInput.value) || 0;
        const valorDezena = parseFloat(valorDezenaInput.value) || 0;
        const valorPremio = parseFloat(valorPremioInput.value) || 0;

        const totalArrecadacao = quantidade * valorDezena;
        const lucro = totalArrecadacao - valorPremio;

        // Enviar para hidden do form
        const lucroFinal = document.getElementById("lucro_final");
        if (lucroFinal) lucroFinal.value = lucro;

        // Atualizar valores na interface
        atualizarValoresInterface(quantidade, valorDezena, valorPremio, totalArrecadacao, lucro);

        console.log("🧮 Cálculo realizado:", {
            quantidade,
            valorDezena,
            valorPremio,
            totalArrecadacao,
            lucro
        });
    }

    function atualizarValoresInterface(quantidade, valorDezena, valorPremio, totalArrecadacao, lucro) {
        // Atualizar valores nos spans
        const qtdNumeros = document.getElementById("qtd-numeros");
        const valorDezenaSpan = document.getElementById("valor-dezena");
        const valorPremioSpan = document.getElementById("valor-premio");
        
        if (qtdNumeros) qtdNumeros.textContent = quantidade;
        if (valorDezenaSpan) valorDezenaSpan.textContent = valorDezena.toFixed(2);
        if (valorPremioSpan) valorPremioSpan.textContent = valorPremio.toFixed(2);

        // Esconder todas as mensagens inicialmente
        const msgCompleto = document.getElementById("msg-completo");
        const msgSemPremio = document.getElementById("msg-sem-premio");
        const msgSemDezena = document.getElementById("msg-sem-dezena");
        const detalhesCalculo = document.getElementById("detalhes-calculo");
        
        if (msgCompleto) msgCompleto.style.display = "none";
        if (msgSemPremio) msgSemPremio.style.display = "none";
        if (msgSemDezena) msgSemDezena.style.display = "none";
        if (detalhesCalculo) detalhesCalculo.style.display = "none";

        // Regras de exibição
        if (valorDezena > 0 && valorPremio > 0) {
            // Cálculo completo
            if (detalhesCalculo) detalhesCalculo.style.display = "block";
            
            const arrecadacaoTotal = document.getElementById("arrecadacao-total");
            const valorPremioCalculo = document.getElementById("valor-premio-calculo");
            const valorLucro = document.getElementById("valor-lucro");
            const lucroTexto = document.getElementById("lucro-estimado-texto");
            
            if (arrecadacaoTotal) arrecadacaoTotal.textContent = totalArrecadacao.toFixed(2);
            if (valorPremioCalculo) valorPremioCalculo.textContent = valorPremio.toFixed(2);
            if (valorLucro) valorLucro.textContent = Math.abs(lucro).toFixed(2);

            if (lucroTexto) {
                if (lucro >= 0) {
                    lucroTexto.style.color = "#2e7d32";
                    lucroTexto.textContent = "Lucro estimado:";
                } else {
                    lucroTexto.style.color = "#c62828";
                    lucroTexto.textContent = "Prejuízo estimado:";
                }
            }

        } else if (valorDezena > 0) {
            // Só o valor da dezena preenchido
            if (msgSemPremio) msgSemPremio.style.display = "block";
            const arrecadacaoSemPremio = document.getElementById("arrecadacao-sem-premio");
            if (arrecadacaoSemPremio) arrecadacaoSemPremio.textContent = totalArrecadacao.toFixed(2);

        } else if (valorPremio > 0) {
            // Só o valor do prêmio preenchido
            if (msgSemDezena) msgSemDezena.style.display = "block";
            const valorPremioFixo = document.getElementById("valor-premio-fixo");
            if (valorPremioFixo) valorPremioFixo.textContent = valorPremio.toFixed(2);

        } else {
            // Nenhum dos dois preenchidos
            if (msgCompleto) msgCompleto.style.display = "block";
        }
    }

    // Expor função de cálculo globalmente
    window.CalculoUtils = {
        calcular
    };

    console.log("✅ Cálculo inicializado");
});
