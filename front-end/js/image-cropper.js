/**
 * Sistema de Recorte de Imagem com Cropper.js
 * Permite que o usuário recorte imagens em formato quadrado (1080x1080)
 */

let cropper = null;
let originalFile = null;

// Elementos do DOM
const cropModal = document.getElementById('crop-modal');
const cropImage = document.getElementById('crop-image');
const closeCropModalBtn = document.getElementById('close-crop-modal');
const cancelCropBtn = document.getElementById('cancel-crop');
const confirmCropBtn = document.getElementById('confirm-crop');

/**
 * Abre o modal de recorte
 * @param {string} imageSrc - URL da imagem em base64
 */
function openCropModal(imageSrc) {
    cropImage.src = imageSrc;
    cropModal.classList.add('active');

    // Inicializar cropper.js se ainda não estiver inicializado
    if (!cropper) {
        cropper = new Cropper(cropImage, {
            aspectRatio: 1, // Proporção 1:1 (quadrado)
            viewMode: 1,
            guides: true,
            grid: true,
            responsive: true,
            restore: true,
            background: true,
            highlight: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: true,
            autoCropArea: 0.8,
            modal: true,
        });
    } else {
        // Se já existir um cropper, substituir a imagem
        cropper.replace(imageSrc);
    }
}

/**
 * Fecha o modal de recorte
 */
function closeCropModal() {
    cropModal.classList.remove('active');
    // Não destruir o cropper para reutilizá-lo depois
}

/**
 * Confirma o recorte e atualiza a pré-visualização
 */
function confirmCrop() {
    if (!cropper) return;

    // Obter canvas com a imagem recortada
    const canvas = cropper.getCroppedCanvas({
        maxWidth: 1080,
        maxHeight: 1080,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    // Converter canvas para arquivo e atualizar preview
    canvas.toBlob((blob) => {
        // Criar URL para o blob
        const croppedImageUrl = URL.createObjectURL(blob);

        // Atualizar a pré-visualização
        const previewImage = document.getElementById('preview-image');
        const previewContainer = document.getElementById('profile-preview');

        previewImage.src = croppedImageUrl;
        previewContainer.classList.add('has-image');

        // Criar um File object para ser enviado no formulário
        const file = new File([blob], 'profile-image.png', { type: 'image/png' });
        
        // Atualizar o input file com a imagem recortada
        const fileInput = document.getElementById('imagem_perfil');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // Fechar modal
        closeCropModal();
    }, 'image/png', 1);
}

/**
 * Cancela o recorte
 */
function cancelCrop() {
    closeCropModal();
    // Resetar o input file
    const fileInput = document.getElementById('imagem_perfil');
    fileInput.value = '';
}

// Event Listeners para o modal
if (closeCropModalBtn) {
    closeCropModalBtn.addEventListener('click', cancelCrop);
}

if (cancelCropBtn) {
    cancelCropBtn.addEventListener('click', cancelCrop);
}

if (confirmCropBtn) {
    confirmCropBtn.addEventListener('click', confirmCrop);
}

// Fechar modal ao clicar fora do conteúdo
if (cropModal) {
    cropModal.addEventListener('click', (e) => {
        if (e.target === cropModal) {
            cancelCrop();
        }
    });
}

// Exportar funções para uso em outros scripts
window.cropperFunctions = {
    openCropModal,
    closeCropModal,
    confirmCrop,
    cancelCrop
};
