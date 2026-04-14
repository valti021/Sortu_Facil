/**
 * Modal Criar Rifa - Gerenciamento de Imagem Avançado
 * Responsável por: múltiplas imagens, recorte obrigatório, preview dinâmico
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("🖼️ Inicializando gerenciamento de imagem avançado...");

    // ====================================
    // CONFIGURAÇÕES GLOBAIS
    // ====================================
    const CONFIG = {
        TAMANHO_RECORTE: { width: 1080, height: 1080 },
        TAMANHO_MAXIMO_MB: 5,
        TIPOS_PERMITIDOS: ['image/jpeg', 'image/jpg', 'image/png']
    };

    // ====================================
    // ELEMENTOS DO DOM
    // ====================================
    const imagemInput = document.getElementById('imagem');
    const uploadArea = document.getElementById('uploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const erroImagemDiv = document.getElementById('erro-imagem');
    const quantidadePremios = document.getElementById('quantidade_premios');
    const campoPremiosDois = document.getElementById('campo-premio-dois');

    // ====================================
    // ESTADO DA APLICAÇÃO
    // ====================================
    let estadoImagens = {
        imagens: [], // Array de { id, file, croppedData, preview }
        recorteAtivo: null, // id da imagem sendo recortada
        modalRecorte: null, // referência do modal de recorte
        cropper: null // instância do Cropper.js
    };

    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    function inicializar() {
        if (!imagemInput || !uploadArea) {
            console.error("❌ Elementos de imagem não encontrados");
            return;
        }

        configurarEventListeners();
        criarModalRecorte();
        atualizarInterfaceUpload();

        console.log("✅ Gerenciamento de imagem avançado inicializado");
    }

    // ====================================
    // CONFIGURAÇÃO DE EVENT LISTENERS
    // ====================================
    function configurarEventListeners() {
        // Upload de imagem
        imagemInput.addEventListener('change', function(e) {
            processarArquivos(this.files);
        });

        // Drag and Drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('active');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            if (!this.contains(e.relatedTarget)) {
                this.classList.remove('active');
            }
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('active');
            
            if (e.dataTransfer.files.length > 0) {
                imagemInput.files = e.dataTransfer.files;
                processarArquivos(e.dataTransfer.files);
            }
        });

        // Clique na área de upload
        const browseButton = uploadArea.querySelector('.browse-button');
        if (browseButton) {
            browseButton.addEventListener('click', function(e) {
                e.preventDefault();
                imagemInput.click();
            });
        }

        // Monitorar mudança na quantidade de prêmios
        if (quantidadePremios) {
            quantidadePremios.addEventListener('change', function() {
                atualizarInterfaceUpload();
                limparImagensExcedentes();
                validarQuantidadeImagens();
            });
        }
    }

    // ====================================
    // GERENCIAMENTO DE IMAGENS
    // ====================================
    function processarArquivos(files) {
        const quantidadeNecessaria = quantidadePremios ? parseInt(quantidadePremios.value) : 1;
        
        // Limitar ao número necessário
        const arquivos = Array.from(files).slice(0, quantidadeNecessaria - estadoImagens.imagens.length);
        
        if (arquivos.length === 0) return;

        arquivos.forEach((file, index) => {
            // Validar arquivo
            if (!validarArquivo(file)) return;

            // Criar objeto de imagem
            const imagemId = Date.now() + index;
            const novaImagem = {
                id: imagemId,
                file: file,
                croppedData: null,
                preview: null,
                status: 'pendente'
            };

            estadoImagens.imagens.push(novaImagem);
            
            // Gerar preview inicial
            gerarPreview(novaImagem);
            
            // Abrir modal de recorte automaticamente
            setTimeout(() => {
                abrirModalRecorte(novaImagem.id);
            }, 300);
        });

        atualizarInterfaceUpload();
        validarQuantidadeImagens();
    }

    function validarArquivo(file) {
        // Validar tamanho
        const tamanhoMaximo = CONFIG.TAMANHO_MAXIMO_MB * 1024 * 1024;
        if (file.size > tamanhoMaximo) {
            exibirErroImagem(`A imagem "${file.name}" excede o limite de ${CONFIG.TAMANHO_MAXIMO_MB} MB.`);
            return false;
        }

        // Validar tipo
        if (!CONFIG.TIPOS_PERMITIDOS.includes(file.type)) {
            exibirErroImagem(`Formato inválido para "${file.name}"! Use apenas JPG, JPEG ou PNG.`);
            return false;
        }

        return true;
    }

    function gerarPreview(imagem) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagem.preview = e.target.result;
            atualizarPreviews();
        };
        reader.readAsDataURL(imagem.file);
    }

    function limparImagensExcedentes() {
        const quantidadeNecessaria = quantidadePremios ? parseInt(quantidadePremios.value) : 1;
        
        if (estadoImagens.imagens.length > quantidadeNecessaria) {
            estadoImagens.imagens = estadoImagens.imagens.slice(0, quantidadeNecessaria);
            atualizarPreviews();
        }
    }

    function removerImagem(id) {
        estadoImagens.imagens = estadoImagens.imagens.filter(img => img.id !== id);
        
        // Se havia um recorte ativo para esta imagem, limpar
        if (estadoImagens.recorteAtivo === id) {
            estadoImagens.recorteAtivo = null;
        }
        
        atualizarInterfaceUpload();
        atualizarPreviews();
        validarQuantidadeImagens();
    }

    // ====================================
    // INTERFACE DO USUÁRIO
    // ====================================
    function atualizarInterfaceUpload() {
        const quantidadeNecessaria = quantidadePremios ? parseInt(quantidadePremios.value) : 1;
        const imagensCarregadas = estadoImagens.imagens.length;
        const imagensRecortadas = estadoImagens.imagens.filter(img => img.croppedData).length;

        // Atualizar texto da área de upload
        if (uploadArea) {
            const uploadTitle = uploadArea.querySelector('.upload-title');
            const uploadSubtitle = uploadArea.querySelector('.upload-subtitle');
            const browseButton = uploadArea.querySelector('.browse-button');
            const formatsInfo = uploadArea.querySelector('.formats-info');

            if (uploadTitle) {
                if (imagensCarregadas >= quantidadeNecessaria) {
                    uploadTitle.textContent = `Todas as ${quantidadeNecessaria} imagem(ns) carregada(s)`;
                    if (uploadSubtitle) uploadSubtitle.style.display = 'none';
                    if (browseButton) browseButton.style.display = 'none';
                    if (formatsInfo) formatsInfo.textContent = `${imagensRecortadas}/${quantidadeNecessaria} recortada(s)`;
                } else {
                    uploadTitle.textContent = `Arraste a${quantidadeNecessaria > 1 ? 's' : ''} imagem(ns) aqui`;
                    if (uploadSubtitle) uploadSubtitle.style.display = 'block';
                    if (browseButton) browseButton.style.display = 'block';
                    if (formatsInfo) formatsInfo.textContent = `Faltam ${quantidadeNecessaria - imagensCarregadas} imagem(ns) | ${imagensRecortadas}/${quantidadeNecessaria} recortada(s)`;
                }
            }
        }

        // Atualizar informações do arquivo
        if (fileInfo) {
            if (estadoImagens.imagens.length > 0) {
                fileInfo.innerHTML = estadoImagens.imagens.map((img, index) => {
                    const statusIcon = img.croppedData ? '✅' : '✂️';
                    return `<div class="file-item" data-id="${img.id}">
                        <span>${statusIcon} ${img.file.name}</span>
                        <button class="btn-remover" data-id="${img.id}">×</button>
                    </div>`;
                }).join('');
                
                fileInfo.classList.add('show');
                
                // Adicionar event listeners para botões de remover
                fileInfo.querySelectorAll('.btn-remover').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        removerImagem(id);
                    });
                });
            } else {
                fileInfo.classList.remove('show');
                fileInfo.innerHTML = '';
            }
        }
    }

    function atualizarPreviews() {
        if (!previewContainer) return;

        // Limpar previews antigos
        previewContainer.innerHTML = '<label style="margin-bottom: 10px; display: block;">Pré-visualização das imagens:</label>';
        
        if (estadoImagens.imagens.length === 0) {
            previewContainer.classList.remove('show');
            return;
        }

        // Criar grid de previews
        const grid = document.createElement('div');
        grid.className = 'previews-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 10px;
        `;

        estadoImagens.imagens.forEach((imagem, index) => {
            const previewCard = document.createElement('div');
            previewCard.className = 'preview-card';
            previewCard.style.cssText = `
                border: 2px solid ${imagem.croppedData ? '#4CAF50' : '#FF9800'};
                border-radius: 8px;
                padding: 10px;
                text-align: center;
                background: #f8f9fa;
                position: relative;
                cursor: pointer;
            `;
            previewCard.setAttribute('data-id', imagem.id);

            const img = document.createElement('img');
            img.src = imagem.croppedData || imagem.preview;
            img.style.cssText = `
                width: 100%;
                height: 120px;
                object-fit: contain;
                border-radius: 4px;
                margin-bottom: 8px;
            `;

            const label = document.createElement('div');
            label.textContent = `Prêmio ${index + 1}`;
            label.style.cssText = `
                font-size: 12px;
                color: ${imagem.croppedData ? '#4CAF50' : '#757575'};
                font-weight: 600;
                margin-bottom: 5px;
            `;

            const status = document.createElement('div');
            status.textContent = imagem.croppedData ? 'Recortado' : 'Precisa recortar';
            status.style.cssText = `
                font-size: 11px;
                color: ${imagem.croppedData ? '#4CAF50' : '#FF9800'};
                font-weight: 500;
            `;

            const btnRecortar = document.createElement('button');
            btnRecortar.textContent = imagem.croppedData ? '✏️ Editar recorte' : '✂️ Recortar';
            btnRecortar.style.cssText = `
                margin-top: 8px;
                padding: 4px 8px;
                font-size: 11px;
                background: ${imagem.croppedData ? '#4CAF50' : '#FF9800'};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
            `;
            btnRecortar.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalRecorte(imagem.id);
            });

            const btnRemover = document.createElement('button');
            btnRemover.innerHTML = '×';
            btnRemover.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                width: 24px;
                height: 24px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                removerImagem(imagem.id);
            });

            previewCard.appendChild(label);
            previewCard.appendChild(img);
            previewCard.appendChild(status);
            previewCard.appendChild(btnRecortar);
            previewCard.appendChild(btnRemover);
            grid.appendChild(previewCard);

            // Clique no card para recortar
            previewCard.addEventListener('click', (e) => {
                if (e.target !== btnRecortar && e.target !== btnRemover) {
                    abrirModalRecorte(imagem.id);
                }
            });
        });

        previewContainer.appendChild(grid);
        previewContainer.classList.add('show');
    }

    // ====================================
    // MODAL DE RECORTE
    // ====================================
    function criarModalRecorte() {
        estadoImagens.modalRecorte = document.getElementById('modal-recorte-imagem');

        if (!estadoImagens.modalRecorte) {
            console.warn('Modal de recorte não encontrado no HTML. Insira o markup em estrutura-principal/modal-criar-rifa.html');
            return;
        }

        // Configurar event listeners do modal
        const fecharBtn = document.getElementById('fechar-modal-recorte');
        const cancelarBtn = document.getElementById('btn-cancelar-recorte');
        const aplicarBtn = document.getElementById('btn-aplicar-recorte');

        if (fecharBtn) fecharBtn.addEventListener('click', fecharModalRecorte);
        if (cancelarBtn) cancelarBtn.addEventListener('click', fecharModalRecorte);
        if (aplicarBtn) aplicarBtn.addEventListener('click', aplicarRecorte);

        // Fechar modal ao clicar fora
        estadoImagens.modalRecorte.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalRecorte();
            }
        });
    }

    function abrirModalRecorte(imagemId) {
        const imagem = estadoImagens.imagens.find(img => img.id === imagemId);
        if (!imagem || !estadoImagens.modalRecorte) return;

        estadoImagens.recorteAtivo = imagemId;
        
        // Atualizar número do prêmio no modal
        const premioNumero = document.getElementById('recorte-premio-numero');
        if (premioNumero) {
            const index = estadoImagens.imagens.findIndex(img => img.id === imagemId);
            premioNumero.textContent = index + 1;
        }

        // Mostrar modal
        estadoImagens.modalRecorte.style.display = 'flex';

        // Inicializar cropper após o modal estar visível
        setTimeout(() => {
            inicializarCropper(imagem);
        }, 100);
    }

    function fecharModalRecorte() {
        if (estadoImagens.modalRecorte) {
            estadoImagens.modalRecorte.style.display = 'none';
        }
        
        if (estadoImagens.cropper) {
            estadoImagens.cropper.destroy();
            estadoImagens.cropper = null;
        }
        
        estadoImagens.recorteAtivo = null;
    }

    function inicializarCropper(imagem) {
        const container = document.getElementById('container-recorte');
        const preview = document.getElementById('preview-recorte');
        
        if (!container || !preview) return;

        // Limpar container
        container.innerHTML = '';
        
        // Criar imagem para o cropper
        const img = document.createElement('img');
        img.id = 'imagem-recorte';
        img.src = imagem.preview;
        img.style.maxWidth = '100%';
        container.appendChild(img);

        // Inicializar Cropper.js
        estadoImagens.cropper = new Cropper(img, {
            aspectRatio: 1, // Quadrado
            viewMode: 1,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            minCropBoxWidth: 100,
            minCropBoxHeight: 100,
            ready() {
                // Definir tamanho mínimo do crop box baseado na proporção 1080x1080
                const canvasData = this.cropper.getCanvasData();
                const minSize = Math.min(canvasData.width, canvasData.height) * 0.3;
                
                this.cropper.setCropBoxData({
                    width: minSize,
                    height: minSize
                });
                
                // Centralizar crop box
                this.cropper.setCropBoxData({
                    left: (canvasData.width - minSize) / 2,
                    top: (canvasData.height - minSize) / 2
                });
            },
            crop(event) {
                // Atualizar preview
                if (preview.firstChild && preview.firstChild.tagName === 'IMG') {
                    preview.removeChild(preview.firstChild);
                }
                
                const croppedImg = document.createElement('img');
                croppedImg.src = estadoImagens.cropper.getCroppedCanvas().toDataURL();
                croppedImg.style.width = '100%';
                croppedImg.style.height = '100%';
                croppedImg.style.objectFit = 'contain';
                preview.appendChild(croppedImg);
            }
        });
    }

    function aplicarRecorte() {
        if (!estadoImagens.cropper || !estadoImagens.recorteAtivo) return;

        const imagem = estadoImagens.imagens.find(img => img.id === estadoImagens.recorteAtivo);
        if (!imagem) return;

        // Obter canvas recortado
        const canvas = estadoImagens.cropper.getCroppedCanvas({
            width: CONFIG.TAMANHO_RECORTE.width,
            height: CONFIG.TAMANHO_RECORTE.height,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (!canvas) {
            exibirErroImagem('Erro ao gerar recorte. Tente novamente.');
            return;
        }

        // Converter para blob
        canvas.toBlob((blob) => {
            if (!blob) return;

            // Atualizar imagem com dados recortados
            const reader = new FileReader();
            reader.onload = function(e) {
                imagem.croppedData = e.target.result;
                
                // Atualizar preview
                imagem.preview = e.target.result;
                
                // Atualizar interface
                atualizarInterfaceUpload();
                atualizarPreviews();
                validarQuantidadeImagens();
                
                // Fechar modal
                fecharModalRecorte();
                
                // Mostrar mensagem de sucesso
                exibirMensagemSucesso('Recorte aplicado com sucesso!');
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
    }

    // ====================================
    // VALIDAÇÕES
    // ====================================
    function validarQuantidadeImagens() {
        const quantidadeNecessaria = quantidadePremios ? parseInt(quantidadePremios.value) : 1;
        const imagensCarregadas = estadoImagens.imagens.length;
        const imagensRecortadas = estadoImagens.imagens.filter(img => img.croppedData).length;

        // Limpar erros anteriores
        if (erroImagemDiv) {
            erroImagemDiv.style.display = 'none';
            erroImagemDiv.textContent = '';
        }

        if (uploadArea) {
            uploadArea.style.borderColor = '';
            uploadArea.style.boxShadow = '';
        }

        // Validar quantidade carregada
        if (imagensCarregadas < quantidadeNecessaria) {
            const mensagem = `É necessário carregar ${quantidadeNecessaria} imagem(ns). Carregadas: ${imagensCarregadas}`;
            exibirErroImagem(mensagem, false);
            return false;
        }

        // Validar recortes
        if (imagensRecortadas < quantidadeNecessaria) {
            const mensagem = `É necessário recortar ${quantidadeNecessaria - imagensRecortadas} imagem(ns) restante(s).`;
            exibirErroImagem(mensagem, false);
            return false;
        }

        // Tudo validado
        if (erroImagemDiv) {
            erroImagemDiv.style.display = 'none';
            erroImagemDiv.textContent = '';
        }

        if (uploadArea) {
            uploadArea.style.borderColor = '#4CAF50';
            uploadArea.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        }

        return true;
    }

    // ====================================
    // UTILIDADES
    // ====================================
    function exibirErroImagem(mensagem, isError = true) {
        if (erroImagemDiv) {
            erroImagemDiv.textContent = mensagem;
            erroImagemDiv.style.display = 'block';
            erroImagemDiv.style.color = isError ? '#d32f2f' : '#FF9800';
        }
        
        if (uploadArea && isError) {
            uploadArea.style.borderColor = isError ? '#d32f2f' : '#FF9800';
            uploadArea.style.boxShadow = `0 0 0 2px rgba(${isError ? '211, 47, 47' : '255, 152, 0'}, 0.2)`;
        }
    }

    function exibirMensagemSucesso(mensagem) {
        // Criar toast de sucesso
        const toast = document.createElement('div');
        toast.textContent = mensagem;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10001;
            animation: slideIn 0.3s;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);

        // Adicionar animação se não existir
        if (!document.querySelector('style[data-toast-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-toast-animation', 'true');
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
            document.head.appendChild(style);
        }
    }

    function formatarTamanho(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ====================================
    // API PÚBLICA
    // ====================================
    function obterImagensRecortadas() {
        return estadoImagens.imagens
            .filter(img => img.croppedData)
            .map(img => ({
                data: img.croppedData,
                nome: img.file.name
            }));
    }

    function resetarImagens() {
        estadoImagens = {
            imagens: [],
            recorteAtivo: null,
            modalRecorte: estadoImagens.modalRecorte,
            cropper: null
        };
        
        atualizarInterfaceUpload();
        atualizarPreviews();
        
        if (imagemInput) {
            imagemInput.value = '';
        }
    }

    // ====================================
    // EXPORTAÇÃO
    // ====================================
    window.ImagemUtils = {
        exibirErroImagem,
        formatarTamanho,
        obterImagensRecortadas,
        resetarImagens,
        validarQuantidadeImagens: () => validarQuantidadeImagens()
    };

    // ====================================
    // INICIAR
    // ====================================
    inicializar();
});

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
    // GERENCIAMENTO DE CAMPO PIX
    // ====================================
    const modeloPagamento = document.getElementById("modelo_pagamento");
    if (modeloPagamento) {
        modeloPagamento.addEventListener("change", function () {
            const campoPix = document.getElementById("campo-pix");
            const chavePixInput = document.getElementById("chave_pix");

            if (this.value === "pix") {
                if (campoPix) campoPix.style.display = "block";
            } else {
                if (campoPix) campoPix.style.display = "none";
                if (chavePixInput) chavePixInput.value = "";
            }
        });
    }

    // ====================================
    // GERENCIAMENTO DE QUANTIDADE DE PRÊMIOS
    // ====================================
       // const quantidadePremios = document.getElementById("quantidade_premios");
       // const campoPremiosDois = document.getElementById("campo-premio-dois");
     //   const nomePremiosDois = document.getElementById("nome_premio_dois");

      //  if (quantidadePremios) {
     //       quantidadePremios.addEventListener("change", function () {
    //            if (this.value === "2") {
                // Mostrar o 2º prêmio
     //               if (campoPremiosDois) campoPremiosDois.style.display = "block";
     //               if (nomePremiosDois) nomePremiosDois.setAttribute("required", "required");
                
                // Atualizar validação de imagens
      //              if (window.ImagemUtils) {
       //                 window.ImagemUtils.validarQuantidadeImagens();
            //        }
      //          } else {
                // Ocultar o 2º prêmio
          //          if (campoPremiosDois) campoPremiosDois.style.    //display = "none";
          //          if (nomePremiosDois) {
         //               nomePremiosDois.removeAttribute    //("required");
           //             nomePremiosDois.value = "";
              //      }
                
                // Atualizar validação de imagens
           //         if (window.ImagemUtils) {
        //                window.ImagemUtils.validarQuantidadeImagens();
        //            }
     //           }
     //       });
     //   }

    // ====================================
    // VALIDAÇÃO DO FORMULÁRIO ANTES DE ENVIAR
    // ====================================
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar imagens antes de enviar
            if (window.ImagemUtils && !window.ImagemUtils.validarQuantidadeImagens()) {
                exibirErroGeral('Complete o carregamento e recorte de todas as imagens antes de criar a rifa.');
                return;
            }
            
            // Se passar na validação, enviar o formulário
            console.log('✅ Formulário validado, enviando...');
            // Aqui você adicionaria o código para enviar o formulário
        });
    }

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

    function exibirErroGeral(mensagem) {
        // Criar ou reutilizar elemento de erro geral
        let erroGeral = document.getElementById('erro-geral-form');
        if (!erroGeral) {
            erroGeral = document.createElement('div');
            erroGeral.id = 'erro-geral-form';
            erroGeral.style.cssText = `
                background: #ffebee;
                color: #d32f2f;
                padding: 12px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                animation: fadeIn 0.3s;
            `;
            form.prepend(erroGeral);
        }
        
        erroGeral.textContent = mensagem;
        
        // Rolar para o erro
        erroGeral.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (erroGeral && erroGeral.parentNode) {
                erroGeral.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    if (erroGeral && erroGeral.parentNode) {
                        erroGeral.parentNode.removeChild(erroGeral);
                    }
                }, 300);
            }
        }, 5000);
    }

    // ====================================
    // EXPORTAÇÃO
    // ====================================
    window.FormUtils = {
        removerMensagemErroCampo,
        adicionarMensagemErroCampo,
        exibirErroGeral
    };

    console.log("✅ Gerenciamento de formulário inicializado");
});