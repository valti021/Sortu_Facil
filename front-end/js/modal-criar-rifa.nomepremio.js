/**
 * Modal Criar Rifa - Gerenciamento de Campos de Nome de Prêmios
 * Responsável por: clonar/injetar campos dinâmicos de nome de prêmios
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("🏆 Inicializando gerenciamento dinâmico de prêmios...");

    // ====================================
    // ELEMENTOS DO DOM
    // ====================================
    const quantidadePremios = document.getElementById("quantidade_premios");
    let containerPremios;

    // ====================================
    // ESTADO DA APLICAÇÃO
    // ====================================
    let estadoPremios = {
        camposAtivos: [],
        templateOriginal: null
    };

    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    function inicializar() {
        if (!quantidadePremios) {
            console.error("❌ Select de quantidade de prêmios não encontrado");
            return;
        }

        // Encontrar o template original
        estadoPremios.templateOriginal = document.querySelector(".nome-premio");
        
        if (!estadoPremios.templateOriginal) {
            console.error("❌ Template '.nome-premio' não encontrado no HTML");
            return;
        }

        // Esconder o template original
        estadoPremios.templateOriginal.style.display = "none";
        estadoPremios.templateOriginal.classList.add("template-original");

        // Criar ou obter container
        containerPremios = criarOuObterContainerPremios();

        // Configurar opções do select
        configurarSelectQuantidade();

        // Configurar evento do select
        configurarEventListeners();

        // Inicializar com valor atual
        if (quantidadePremios.value) {
            atualizarCamposPremios(parseInt(quantidadePremios.value));
        }

        console.log("✅ Gerenciamento dinâmico de prêmios inicializado");
    }

    // ====================================
    // CONFIGURAÇÃO DO SELECT
    // ====================================
    function configurarSelectQuantidade() {
        if (quantidadePremios.innerHTML.includes("Carregando...") || quantidadePremios.options.length <= 1) {
            quantidadePremios.innerHTML = "";
            
            for (let i = 1; i <= 5; i++) {
                const option = document.createElement("option");
                option.value = i.toString();
                option.textContent = i + (i === 1 ? " Prêmio" : " Prêmios");
                quantidadePremios.appendChild(option);
            }
        }
    }

    // ====================================
    // CONFIGURAÇÃO DE EVENT LISTENERS
    // ====================================
    function configurarEventListeners() {
        quantidadePremios.addEventListener("change", function() {
            const quantidade = parseInt(this.value);
            if (!isNaN(quantidade) && quantidade > 0) {
                atualizarCamposPremios(quantidade);
            }
        });
    }

    // ====================================
    // GERENCIAMENTO DE CAMPOS DINÂMICOS
    // ====================================
    function atualizarCamposPremios(quantidade) {
        // Limpar campos existentes
        limparCamposPremios();

        // Criar novos campos
        for (let i = 0; i < quantidade; i++) {
            criarCampoPremio(i + 1);
        }

        // Adicionar ao container
        adicionarCamposAoContainer();

        // Atualizar validação de imagens se existir
        if (window.ImagemUtils && window.ImagemUtils.validarQuantidadeImagens) {
            window.ImagemUtils.validarQuantidadeImagens();
        }
    }

    function criarCampoPremio(numero) {
        // Clonar o template original
        const novoCampo = estadoPremios.templateOriginal.cloneNode(true);
        
        // Mostrar o campo clonado
        novoCampo.style.display = "block";
        novoCampo.classList.remove("template-original");
        novoCampo.classList.add("campo-premio-clonado");
        novoCampo.dataset.numeroPremio = numero;

        // Atualizar elementos internos
        const label = novoCampo.querySelector("label");
        const samp = novoCampo.querySelector(".qt-premio");
        const input = novoCampo.querySelector("input.nome");

        // Atualizar label
        if (label) {
            let idCampo;
            if (numero === 1) {
                idCampo = 'nome_premio_um';
            } else if (numero === 2) {
                idCampo = 'nome_premio_dois';
            } else {
                idCampo = `nome_premio_${numero}`;
            }
            label.setAttribute("for", idCampo);
            if (samp) {
                samp.textContent = numero;
            }
        }

        // Atualizar input
        if (input) {
            let nameCampo;
            if (numero === 1) {
                nameCampo = 'nome_premio_um';
            } else if (numero === 2) {
                nameCampo = 'nome_premio_dois';
            } else {
                nameCampo = `nome_premio_${numero}`;
            }
            input.id = `nome_premio_${numero}`;
            input.name = nameCampo;
            input.placeholder = `Ex: ${obterExemploPremio(numero)}`;
            input.value = "";
            input.required = true;
            input.dataset.numero = numero;
            
            // Configurar eventos
            input.addEventListener("input", function() {
                validarCampoPremio(this);
            });
        }

        // Adicionar ao estado
        estadoPremios.camposAtivos.push({
            numero: numero,
            elemento: novoCampo,
            input: input
        });

        return novoCampo;
    }

    function limparCamposPremios() {
        // Remover elementos do DOM
        estadoPremios.camposAtivos.forEach(campo => {
            if (campo.elemento && campo.elemento.parentNode === containerPremios) {
                containerPremios.removeChild(campo.elemento);
            }
        });

        // Limpar estado
        estadoPremios.camposAtivos = [];
    }

    function adicionarCamposAoContainer() {
        if (!containerPremios) return;

        // Limpar container (exceto o template original)
        const filhosParaRemover = Array.from(containerPremios.children).filter(child => 
            !child.classList.contains("template-original")
        );
        
        filhosParaRemover.forEach(child => child.remove());

        // Adicionar campos ativos
        estadoPremios.camposAtivos.forEach(campo => {
            containerPremios.appendChild(campo.elemento);
        });
    }

    // ====================================
    // CONTAINER DE PRÊMIOS
    // ====================================
    function criarOuObterContainerPremios() {
        let container = document.querySelector(".container-premios");
        
        if (!container) {
            const selectQuantidade = document.getElementById("quantidade_premios");
            if (!selectQuantidade || !selectQuantidade.parentNode) return null;
            
            container = document.createElement("div");
            container.className = "container-premios";
            
            // Inserir após o select
            selectQuantidade.parentNode.insertBefore(container, selectQuantidade.nextSibling);
            
            // Mover o template original para dentro do container
            const templateOriginal = document.querySelector(".nome-premio");
            if (templateOriginal) {
                container.appendChild(templateOriginal);
            }
        }
        
        return container;
    }

    // ====================================
    // VALIDAÇÃO DE CAMPOS
    // ====================================
    function validarCampoPremio(input) {
        if (!input) return false;

        const valor = input.value.trim();
        const numero = input.dataset.numero;

        // Limpar erros anteriores
        limparErroCampo(input);

        // Validações básicas
        if (valor.length === 0) {
            exibirErroCampo(input, `O nome do ${numero}º prêmio é obrigatório`);
            return false;
        }

        if (valor.length < 2) {
            exibirErroCampo(input, `Mínimo 2 caracteres`);
            return false;
        }

        if (valor.length > 50) {
            exibirErroCampo(input, `Máximo 50 caracteres`);
            return false;
        }

        return true;
    }

    function validarTodosCamposPremios() {
        let valido = true;
        const erros = [];

        estadoPremios.camposAtivos.forEach(campo => {
            if (campo.input && !validarCampoPremio(campo.input)) {
                valido = false;
                erros.push(`nome_premio_${campo.numero}`);
            }
        });

        return { valido, erros };
    }

    function exibirErroCampo(input, mensagem) {
        if (!input) return;

        // Estilizar input
        input.style.borderColor = "#d32f2f";

        // Remover erro anterior
        limparErroCampo(input);

        // Criar elemento de erro
        const erroDiv = document.createElement("div");
        erroDiv.className = "mensagem-erro-premio";
        erroDiv.textContent = mensagem;

        // Inserir após o input
        const parent = input.parentNode;
        if (parent) {
            parent.insertBefore(erroDiv, input.nextSibling);
        }
    }

    function limparErroCampo(input) {
        if (!input) return;

        // Restaurar estilo
        input.style.borderColor = "";

        // Remover mensagem de erro
        const parent = input.parentNode;
        if (parent) {
            const erroDiv = parent.querySelector(".mensagem-erro-premio");
            if (erroDiv) {
                erroDiv.remove();
            }
        }
    }

    // ====================================
    // UTILIDADES
    // ====================================
    function obterExemploPremio(numero) {
        const exemplos = [
            "Carro 0km", "Moto Nova", "Smartphone", "Notebook", "TV 4K",
            "Viagem", "Eletrônicos", "Prêmio em Dinheiro", "Relógio", "Console"
        ];
        return exemplos[(numero - 1) % exemplos.length];
    }

    function obterDadosPremios() {
        return estadoPremios.camposAtivos.map(campo => ({
            numero: campo.numero,
            nome: campo.input ? campo.input.value.trim() : ""
        }));
    }

    function prepararDadosParaEnvio(formData) {
        estadoPremios.camposAtivos.forEach(campo => {
            if (campo.input && campo.input.value.trim()) {
                formData.append(campo.input.name, campo.input.value.trim());
            }
        });
        return formData;
    }

    // ====================================
    // INTEGRAÇÃO COM OUTROS MÓDULOS
    // ====================================
    function integrarComValidacaoPrincipal() {
        if (!window.ValidacaoUtils) return;

        const validacaoOriginal = window.ValidacaoUtils.validarFormulario;
        
        if (validacaoOriginal) {
            window.ValidacaoUtils.validarFormulario = function() {
                const erros = validacaoOriginal();
                
                const validacaoPremios = validarTodosCamposPremios();
                if (!validacaoPremios.valido) {
                    validacaoPremios.erros.forEach(campoErro => {
                        erros.push(`Campo "${campoErro.replace('_', ' ')}" inválido`);
                    });
                }
                
                return erros;
            };
        }
    }

    function integrarComSubmit() {
        const form = document.getElementById("form-criar-rifa");
        if (!form) return;

        form.addEventListener("submit", function(e) {
            const validacaoPremios = validarTodosCamposPremios();
            if (!validacaoPremios.valido) {
                e.preventDefault();
                
                // Destacar campos inválidos
                validacaoPremios.erros.forEach(campoErro => {
                    const input = document.getElementById(campoErro);
                    if (input) {
                        input.style.borderColor = "#d32f2f";
                    }
                });
                
                // Exibir erro geral
                const erroGeralDiv = document.getElementById('erro-geral');
                if (erroGeralDiv) {
                    erroGeralDiv.textContent = "Preencha todos os nomes dos prêmios";
                    erroGeralDiv.style.display = 'block';
                }
            }
        }, true);
    }

    // ====================================
    // API PÚBLICA
    // ====================================
    window.NomePremioUtils = {
        validarCamposPremios: () => validarTodosCamposPremios(),
        validarCampo: (input) => validarCampoPremio(input),
        obterDadosPremios: () => obterDadosPremios(),
        prepararParaEnvio: (formData) => prepararDadosParaEnvio(formData),
        atualizarQuantidade: (quantidade) => atualizarCamposPremios(quantidade),
        limparCampos: () => limparCamposPremios(),
        obterQuantidade: () => estadoPremios.camposAtivos.length,
        obterCampos: () => estadoPremios.camposAtivos.map(c => ({
            id: c.input ? c.input.id : null,
            name: c.input ? c.input.name : null,
            numero: c.numero,
            valor: c.input ? c.input.value : ""
        }))
    };

    // ====================================
    // INICIALIZAÇÃO FINAL
    // ====================================
    inicializar();
    integrarComValidacaoPrincipal();
    integrarComSubmit();
});