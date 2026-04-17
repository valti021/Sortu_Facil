const loginForm = document.getElementById('form-login');
const cadastroForm = document.getElementById('form-cadastro');
const ladoEsquerdoContent = document.querySelector('.lado-esquerdo-content');

// --- Conteúdo para o lado esquerdo ---
const loginContent = {
    title: "Bem-vindo de volta!",
    description: "Faça login para acessar sua conta e aproveitar todos os recursos disponíveis. Seus dados estão seguros conosco.",
    icon: "fas fa-sign-in-alt"
};

const cadastroContent = {
    title: "Junte-se a nós!",
    description: "Crie sua conta agora mesmo e comece a explorar todas as funcionalidades. É rápido, fácil e seguro.",
    icon: "fas fa-user-plus"
};

function atualizarLadoEsquerdo(mostrarCadastro) {
    const content = mostrarCadastro ? cadastroContent : loginContent;
    if (ladoEsquerdoContent) {
        ladoEsquerdoContent.innerHTML = `
            <i class="${content.icon}" style="font-size: 48px; margin-bottom: 20px;"></i>
            <h1>${content.title}</h1>
            <p>${content.description}</p>
        `;
        ladoEsquerdoContent.classList.remove('active');
        setTimeout(() => ladoEsquerdoContent.classList.add('active'), 50);
    }
}

function criarElementosDecorativos() {
    const ladoEsquerdo = document.querySelector('.lado-esquerdo');
    document.querySelectorAll('.decorative-element').forEach(el => el.remove());
    for (let i = 0; i < 3; i++) {
        const elemento = document.createElement('div');
        elemento.className = 'decorative-element';
        ladoEsquerdo.appendChild(elemento);
    }
}

function setupPasswordToggle() {
    document.querySelectorAll('input[type="password"]').forEach(field => {
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.innerHTML = '<i class="far fa-eye"></i>';

        const inputGroup = field.parentElement;
        if (!inputGroup.classList.contains('input-group')) {
            const newInputGroup = document.createElement('div');
            newInputGroup.className = 'input-group';
            field.parentNode.insertBefore(newInputGroup, field);
            newInputGroup.appendChild(field);
            newInputGroup.appendChild(toggleButton);
        } else {
            inputGroup.appendChild(toggleButton);
        }

        toggleButton.addEventListener('click', function () {
            const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
            field.setAttribute('type', type);
            this.querySelector('i').className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
        });
    });
}

// --- Exibição inicial dos formulários ---
let mostrarCadastroInicialmente = false;
if (mostrarCadastroInicialmente) {
    loginForm.style.display = "none";
    cadastroForm.style.display = "block";
    atualizarLadoEsquerdo(true);
} else {
    loginForm.style.display = "block";
    cadastroForm.style.display = "none";
    atualizarLadoEsquerdo(false);
}

document.getElementById('mostrar-cadastro').onclick = (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    cadastroForm.style.display = "block";
    atualizarLadoEsquerdo(true);
};

document.getElementById('mostrar-login').onclick = (e) => {
    e.preventDefault();
    cadastroForm.style.display = "none";
    loginForm.style.display = "block";
    atualizarLadoEsquerdo(false);
};


// ── UTILITÁRIO: parse seguro de JSON ─────────────────────────
//
// Tenta converter a resposta para JSON.
// Se o servidor retornar HTML (ex: erro 500 do PHP) ou qualquer
// conteúdo não-JSON, lança um erro com mensagem clara em vez de
// deixar a página quebrar silenciosamente.
//
async function parsearRespostaJSON(response) {
    const texto = await response.text();
    try {
        return JSON.parse(texto);
    } catch {
        console.error('Resposta não-JSON recebida do servidor:', texto);
        throw new Error('O servidor retornou uma resposta inesperada. Tente novamente ou contate o suporte.');
    }
}


// ── UTILITÁRIO: exibir mensagem de erro ──────────────────────
//
// Centraliza a exibição de erros nos elementos de feedback
// de cada formulário.
//
function exibirErro(elementoId, mensagem) {
    const el = document.getElementById(elementoId);
    if (el) {
        el.textContent = mensagem;
        el.style.display = 'block';
    }
}


// ── LEMBRAR LOGIN ────────────────────────────────────────────
//
// Salva ou remove o email no localStorage dependendo do checkbox.
// Chamado apenas após login bem-sucedido.
//
function gerenciarLembrarLogin(email, lembrar) {
    if (lembrar) {
        localStorage.setItem('lembrar_email', email);
    } else {
        localStorage.removeItem('lembrar_email');
    }
}

// Preenche o campo de email e marca o checkbox caso haja email salvo.
// Chamado no DOMContentLoaded.
//
function restaurarLembrarLogin() {
    const emailSalvo = localStorage.getItem('lembrar_email');
    if (emailSalvo) {
        const campoEmail  = document.getElementById('login-email');
        const checkbox    = document.getElementById('remember-me');
        if (campoEmail) campoEmail.value = emailSalvo;
        if (checkbox)   checkbox.checked = true;
    }
}


// ── LOGIN ────────────────────────────────────────────────────

async function enviarLogin(event) {
    event.preventDefault();

    const email      = document.getElementById('login-email').value.trim();
    const password   = document.getElementById('login-password').value.trim();
    const lembrar    = document.getElementById('remember-me')?.checked ?? false;
    const erroParagrafo = document.getElementById('erro-login');

    erroParagrafo.style.display = 'none';
    erroParagrafo.textContent   = '';

    try {
        const formData = new FormData();
        formData.append('action', 'login'); // 👈 NOVO
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch('../back-end/api/account.php', {
            method: 'POST',
            body: formData
        });



        // Ponto 1 e 2: parse seguro — distingue "sem conexão" de "resposta inválida"
        const data = await parsearRespostaJSON(response);

        if (data.status === 'success') {

            // Ponto 3: verifica se o token veio antes de redirecionar
            if (data.status === 'success') {
                if (!data.token || data.token.trim() === '') {
                    exibirErro('erro-login', 'Erro de autenticação: token não recebido.');
                    return;
                }
                gerenciarLembrarLogin(email, lembrar);
                localStorage.setItem('token', data.token);
                window.location.href = '/sortu_facil/front-end/estrutura-principal/autenticador.html'; // ← front decide
            }

        } else {
            exibirErro('erro-login', data.message || 'Erro desconhecido. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro na requisição de login:', error);

        // Ponto 2: distingue erro de rede de erro de resposta inválida
        if (!navigator.onLine) {
            exibirErro('erro-login', 'Sem conexão com a internet. Verifique sua rede e tente novamente.');
        } else {
            exibirErro('erro-login', error.message || 'Erro ao comunicar com o servidor. Tente novamente.');
        }
    }
}


// ── CADASTRO ─────────────────────────────────────────────────

async function enviarCadastro(event) {
    event.preventDefault();

    const errorElement = document.getElementById('erro-cadastro');
    errorElement.style.display = 'none';
    errorElement.textContent   = '';

    try {
        const formData = new FormData(cadastroForm);
        formData.append('action', 'cadastro'); // 👈 NOVO

        const response = await fetch('../back-end/api/account.php', {
            method: 'POST',
            body: formData
        });

        // Ponto 1 e 2: parse seguro — distingue "sem conexão" de "resposta inválida"
        const data = await parsearRespostaJSON(response);

        if (data.status === 'success') {

            // Ponto 3: se o cadastro retornar token, valida antes de redirecionar
            if (data.status === 'success') {
                if (data.token) {
                    if (data.token.trim() === '') {
                        exibirErro('erro-cadastro', 'Erro de autenticação: token inválido.');
                        return;
                    }
                    localStorage.setItem('token', data.token);
                }
                window.location.href = '/sortu_facil/front-end/estrutura-principal/autenticador.html'; // ← front decide
            }

        } else {
            exibirErro('erro-cadastro', data.message || 'Erro desconhecido. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro na requisição de cadastro:', error);

        // Ponto 2: distingue erro de rede de erro de resposta inválida
        if (!navigator.onLine) {
            exibirErro('erro-cadastro', 'Sem conexão com a internet. Verifique sua rede e tente novamente.');
        } else {
            exibirErro('erro-cadastro', error.message || 'Erro ao comunicar com o servidor. Tente novamente.');
        }
    }
}


// ── DOMContentLoaded ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

    if (loginForm)    loginForm.addEventListener('submit', enviarLogin);
    if (cadastroForm) cadastroForm.addEventListener('submit', enviarCadastro);

    criarElementosDecorativos();
    setupPasswordToggle();
    restaurarLembrarLogin();

    const fileInput       = document.getElementById('imagem_perfil');
    const previewContainer = document.getElementById('profile-preview');
    const previewImage    = document.getElementById('preview-image');

    if (previewContainer && !previewContainer.querySelector('.icon-placeholder')) {
        const iconPlaceholder = document.createElement('i');
        iconPlaceholder.className = 'fas fa-user icon-placeholder';
        previewContainer.appendChild(iconPlaceholder);
    }

    if (previewContainer) {
        previewContainer.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) {
                previewImage.src = '';
                previewContainer.classList.remove('has-image');
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Por favor, selecione uma imagem nos formatos JPG, PNG ou GIF.');
                this.value = '';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', function () {
                window.cropperFunctions.openCropModal(reader.result);
            });
            reader.readAsDataURL(file);
        });
    }

    if (ladoEsquerdoContent) {
        ladoEsquerdoContent.classList.add('active');
    }
});