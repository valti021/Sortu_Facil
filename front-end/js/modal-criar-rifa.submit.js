/**
 * Modal Criar Rifa - Envio do Formulário
 * Responsável por: enviar formulário ao backend e gerenciar respostas
 */
document.addEventListener("modalCriarRifa:enviarFormulario", (event) => {
    console.log("📤 Enviando formulário...");

    const form = event.detail.form;
    if (!form) {
        console.error("❌ Formulário não encontrado no evento");
        return;
    }

    enviarFormulario(form);
});

function prepararFormDataComPremios(form) {
    const formData = new FormData(form);
    
    // Adicionar dados dos prêmios dinâmicos (já estão no form)
    
    // Adicionar quantidade de prêmios
    const quantidadePremios = document.getElementById("quantidade_premios");
    if (quantidadePremios && quantidadePremios.value) {
        formData.set('quantidade_premios', quantidadePremios.value);
    }
    
    return formData;
}


// ====================================
// FUNÇÃO PRINCIPAL DE ENVIO
// ====================================
function enviarFormulario(form) {
    const formData = prepararFormDataComPremios(form);
    
    // Obter imagens recortadas do módulo de imagem
    let imagensRecortadas = [];
    if (window.ImagemUtils && window.ImagemUtils.obterImagensRecortadas) {
        imagensRecortadas = window.ImagemUtils.obterImagensRecortadas();
    }
    
    console.log('📸 Imagens recortadas encontradas:', imagensRecortadas.length);
    imagensRecortadas.forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img.nome} - Tamanho: ${img.data.length} chars`);
    });
    
    // Adicionar dados das imagens recortadas
    imagensRecortadas.forEach((imagem, index) => {
        formData.append(`imagem_${index}`, imagem.data);
        formData.append(`imagem_nome_${index}`, imagem.nome);
    });
    
    console.log('📤 FormData preparado com imagens:', imagensRecortadas.length);
    
    // Mostrar loading no botão
    const botaoSubmit = form.querySelector('.botao-salvar-rifa');
    const textoOriginal = botaoSubmit ? botaoSubmit.textContent : 'Criar Rifa';
    const btnFechar = document.getElementById("fechar-modal-rifa");
    
    if (botaoSubmit) {
        botaoSubmit.textContent = 'Enviando...';
        botaoSubmit.disabled = true;
    }
    
    if (btnFechar) {
        btnFechar.style.pointerEvents = 'none';
    }

    

    //Local de saida de todos os dados, alterar para o caminho que esteja funcionando!
    fetch('../php/criar-rifa-php/tratamento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.text().then(text => {
            try {
                const data = JSON.parse(text);
                data.status = response.status;
                return data;
            } catch (e) {
                throw new Error(`Resposta não é JSON: ${text.substring(0, 100)}`);
            }
        });
    })
    .then(data => {
        console.log('Resposta do servidor:', data);
        
        if (data.status === 200 && data.tipo === 'sucesso') {
            // ✅ Sucesso
            mostrarSucesso(data.mensagem || 'Rifa criada com sucesso!');
            setTimeout(() => {
                window.location.href = 'main.html?reload=' + Date.now();
            }, 1500);
        } else {
            // ❌ Erro - mostrar mensagem do backend
            exibirErroGeral(data.mensagem || 'Erro ao criar rifa. Tente novamente.');
            restaurarBotoes();
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        exibirErroGeral('Erro ao conectar com o servidor. Verifique sua conexão.');
        restaurarBotoes();
    });

    function restaurarBotoes() {
        if (botaoSubmit) {
            botaoSubmit.textContent = textoOriginal;
            botaoSubmit.disabled = false;
        }
        
        if (btnFechar) {
            btnFechar.style.pointerEvents = 'auto';
        }
    }
}

// ====================================
// FUNÇÕES AUXILIARES DE FEEDBACK
// ====================================
function exibirErroGeral(mensagem) {
    const erroGeralDiv = document.getElementById('erro-geral');
    if (!erroGeralDiv) return;
    
    erroGeralDiv.textContent = mensagem;
    erroGeralDiv.style.display = 'block';
    
    const form = document.getElementById("form-criar-rifa");
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        erroGeralDiv.style.display = 'none';
    }, 10000);
}

function mostrarSucesso(mensagem) {
    const sucessoDiv = document.createElement('div');
    sucessoDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    sucessoDiv.textContent = mensagem;
    document.body.appendChild(sucessoDiv);
    
    setTimeout(() => {
        sucessoDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => sucessoDiv.remove(), 300);
    }, 3000);
}

// Adicionar CSS de animações (se ainda não existir)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
if (!document.head.querySelector('style[data-submit]')) {
    style.setAttribute('data-submit', 'true');
    document.head.appendChild(style);
}

console.log("✅ Módulo de submit inicializado");
