/**
 * Modal Criar Rifa - Gerenciamento do Formulário
 * Responsável por: validação de campos, mostrar/ocultar campos dinâmicos
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("📋 Inicializando gerenciamento de formulário...");

    const form = document.getElementById("form-criar-rifa");
    if (!form) {
        console.error("❌ Formulário não encontrado");
        return;
    }

    // ====================================
    // GERENCIAMENTO DE QUANTIDADE DE PRÊMIOS
    // ====================================
    const quantidadePremios = document.getElementById("quantidade_premios");
    const campoPremiosDois = document.getElementById("campo-premio-dois");
    const nomePremiosDois = document.getElementById("nome_premio_dois");

    if (quantidadePremios) {
        quantidadePremios.addEventListener("change", function () {
            if (this.value === "2") {
                // Mostrar o 2º prêmio
                if (campoPremiosDois) campoPremiosDois.style.display = "block";
            } else {
                // Ocultar o 2º prêmio
                if (campoPremiosDois) campoPremiosDois.style.display = "none";
                if (nomePremiosDois) {
                    nomePremiosDois.value = "";
                }
            }
        });
    }

    // ====================================
    // GERENCIAMENTO DO CAMPO PIX
    // ====================================
    function configurarCampoPIX() {
        const selectPagamento = document.getElementById("modelo_pagamento");
        const campoPix = document.getElementById("campo-pix");
        const inputChavePix = document.getElementById("chave_pix");

        if (!selectPagamento || !campoPix || !inputChavePix) {
            console.log("ℹ️ Campos de PIX não encontrados ou modal ainda não está visível");
            return;
        }

        console.log("💰 Configurando campo PIX...");

        // Oculta o campo PIX inicialmente
        campoPix.style.display = "none";

        // Função para verificar se é PIX
        function deveMostrarCampoPIX(valorSelecionado) {
            if (!valorSelecionado) return false;
            
            // Converte para minúsculas e remove espaços extras
            const valor = valorSelecionado.toLowerCase().trim();
            
            // Verifica se contém "pix" em qualquer parte do texto
            return valor.includes("pix");
        }

        // Função para gerenciar a visibilidade do campo PIX
        function gerenciarCampoPIX() {
            const valorSelecionado = selectPagamento.value;
            const ePix = deveMostrarCampoPIX(valorSelecionado);

            if (ePix) {
                // Mostrar campo PIX
                campoPix.style.display = "block";
                
                // Adiciona uma pequena animação
                campoPix.style.animation = "fadeIn 0.3s ease";
                
                // Foca no campo após um pequeno delay
                setTimeout(() => {
                    inputChavePix.focus();
                }, 200);
                
                console.log("✅ Campo PIX exibido");
            } else {
                // Ocultar campo PIX
                campoPix.style.display = "none";
                inputChavePix.value = ""; // Limpa o campo
                
                console.log("❌ Campo PIX ocultado");
            }
        }

        // Adiciona event listener para mudanças no select
        selectPagamento.addEventListener("change", gerenciarCampoPIX);

        // Verifica o estado inicial (útil para edição ou formulários pré-preenchidos)
        setTimeout(() => {
            gerenciarCampoPIX();
        }, 100);

        // Para lidar com atualizações dinâmicas do select
        selectPagamento.addEventListener("select:atualizado", gerenciarCampoPIX);

        // Expor função para uso externo se necessário
        window.gerenciarCampoPIX = gerenciarCampoPIX;

        console.log("✅ Gerenciamento de PIX configurado");
    }

    // Configurar o campo PIX quando o DOM estiver pronto
    setTimeout(configurarCampoPIX, 300);

    // ====================================
    // LIMPAR ERROS AO INTERAGIR COM CAMPOS
    // ====================================
    form.querySelectorAll('input, select, textarea').forEach(campo => {
        campo.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
            removerMensagemErroCampo(this);
        });
        
        campo.addEventListener('change', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
            removerMensagemErroCampo(this);
            
            // Se for o campo de pagamento, revalida o PIX
            if (this.id === "modelo_pagamento" && window.gerenciarCampoPIX) {
                window.gerenciarCampoPIX();
            }
        });
    });

    // ====================================
    // FUNÇÕES AUXILIARES
    // ====================================
    function removerMensagemErroCampo(campo) {
        if (!campo) return;
        const erroExistente = campo.parentNode.querySelector('.mensagem-erro-campo');
        if (erroExistente) {
            erroExistente.remove();
        }
    }

    function adicionarMensagemErroCampo(campo, mensagem) {
        if (!campo) return;
        
        removerMensagemErroCampo(campo);
        
        const erroDiv = document.createElement('div');
        erroDiv.className = 'mensagem-erro-campo';
        erroDiv.style.cssText = `
            color: #d32f2f;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
            font-family: 'Poppins', sans-serif;
            animation: fadeIn 0.3s ease;
        `;
        erroDiv.textContent = mensagem;
        
        campo.parentNode.insertBefore(erroDiv, campo.nextSibling);
    }

    // Função para validar o formulário considerando campos dinâmicos
    function validarFormularioDinamico() {
        let valido = true;
        
        // Validação do campo PIX (se visível)
        const selectPagamento = document.getElementById("modelo_pagamento");
        const campoPix = document.getElementById("campo-pix");
        const inputChavePix = document.getElementById("chave_pix");
        
        if (selectPagamento && campoPix && inputChavePix) {
            const valorSelecionado = selectPagamento.value.toLowerCase();
            const campoPixVisivel = campoPix.style.display !== "none";
            
            if (campoPixVisivel && valorSelecionado.includes("pix") && !inputChavePix.value.trim()) {
                adicionarMensagemErroCampo(inputChavePix, "Por favor, informe a chave PIX");
                inputChavePix.style.borderColor = "#d32f2f";
                inputChavePix.style.boxShadow = "0 0 0 2px rgba(211, 47, 47, 0.2)";
                valido = false;
            }
        }
        
        return valido;
    }

    // Expor funções globais para outros módulos
    window.FormUtils = {
        removerMensagemErroCampo,
        adicionarMensagemErroCampo,
        validarFormularioDinamico,
        configurarCampoPIX
    };

    console.log("✅ Gerenciamento de formulário inicializado");
});