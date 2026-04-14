/**
 * Modal Criar Rifa - Validação de Formulário
 * Responsável por: validar campos do frontend e exibir erros
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("✔️ Inicializando validação de formulário...");

    const form = document.getElementById("form-criar-rifa");
    if (!form) {
        console.error("❌ Formulário não encontrado");
        return;
    }

    // ====================================
    // LISTENERS DO FORMULÁRIO
    // ====================================
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Limpar erros anteriores
        limparErros();
        
        // Validar todos os campos
        const erros = validarFormulario();
        
        if (erros.length > 0) {
            exibirErros(erros);
            return;
        }

        // Se passou em todas as validações, emitir evento para enviar
        document.dispatchEvent(new CustomEvent("modalCriarRifa:enviarFormulario", {
            detail: { form }
        }));
    });

    // ====================================
    // FUNÇÃO PRINCIPAL DE VALIDAÇÃO
    // ====================================
    function validarFormulario() {
        // Validações desabilitadas - backend já trata as validações
        return [];
    }




    function exibirErros(erros) {
        const erroGeralDiv = document.getElementById('erro-geral');
        if (!erroGeralDiv) return;
        
        const mensagem = erros.join(' ');
        erroGeralDiv.textContent = mensagem;
        erroGeralDiv.style.display = 'block';
        
        // Rolar para o topo do formulário
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            erroGeralDiv.style.display = 'none';
        }, 10000);
    }

    function limparErros() {
        const erroGeralDiv = document.getElementById('erro-geral');
        if (erroGeralDiv) erroGeralDiv.style.display = 'none';

        const erroImagemDiv = document.getElementById('erro-imagem');
        if (erroImagemDiv) erroImagemDiv.style.display = 'none';
        
        // Limpar estilo da área de upload
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.style.borderColor = '';
            uploadArea.style.boxShadow = '';
        }
        
        // Limpar estilos de erro dos campos
        form.querySelectorAll('input, select, textarea').forEach(campo => {
            campo.style.borderColor = '';
            campo.style.boxShadow = '';
            
            if (window.FormUtils) {
                window.FormUtils.removerMensagemErroCampo(campo);
            }
        });
    }

    // Expor funções globalmente
    window.ValidacaoUtils = {
        validarFormulario,
        exibirErros,
        limparErros
    };

    // Adicionar CSS de animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .mensagem-erro-campo {
            color: #d32f2f;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
            font-family: 'Poppins', sans-serif;
            animation: fadeIn 0.3s ease;
        }
        
        .mensagem-erro-campo:before {
            content: "⚠ ";
            margin-right: 4px;
        }
    `;
    if (!document.head.querySelector('style[data-validacao]')) {
        style.setAttribute('data-validacao', 'true');
        document.head.appendChild(style);
    }

    console.log("✅ Validação de formulário inicializada");
});
