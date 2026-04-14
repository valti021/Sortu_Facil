document.addEventListener('DOMContentLoaded', () => {
    const URL_SESSAO = 'http://localhost/SortuFacil/back-end-sortu-facil/api.php';
    const URL_MODAL  = '../estrutura-principal/modal-conta.html';
    const URL_REDIRECT = '../index.html'; // página de destino se não logado

    verificarSessao();

    async function verificarSessao() {
        try {
            // ✅ NOVO: Verifica se está em modo demo
            const isDemo = localStorage.getItem('isDemo') === 'true';
            if (isDemo) {
                console.log('✓ Sessão demo ativa - ignorando verificação com servidor');
                return;
            }

            // Recuperar token do localStorage
            const token = localStorage.getItem("token");
            
            // Preparar headers com o token JWT
            const headers = {
                "Content-Type": "application/json"
            };
            
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(URL_SESSAO, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    action: "sessao"
                })
            });

            const data = await response.json();

            if (data.logado === false) {
                abrirModalNaoLogado();
            }

        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
        }
    }

    async function abrirModalNaoLogado() {
        if (!document.getElementById('modal-conta')) {
            await carregarModalHTML();
        }

        const modal = document.getElementById('modal-conta');
        const modalBody = modal.querySelector('.modal-body');
        const template = document.getElementById('template-nao-logado');

        if (!template) {
            console.error('Template não logado não encontrado');
            return;
        }

        modalBody.innerHTML = template.innerHTML;
        modal.classList.add('modal-bloqueado');
        modal.style.display = 'flex';
        modal.style.backdropFilter = 'blur(10px)';
        modal.style.zIndex = '9999';
        modal.style.height = '100vh';


        configurarBloqueioTotal(modal);
    }

    async function carregarModalHTML() {
        const response = await fetch(URL_MODAL);
        const html = await response.text();

        const container = document.createElement('div');
        container.innerHTML = html;

        document.body.appendChild(container);
    }

    function configurarBloqueioTotal(modal) {
        const btnClose = modal.querySelector('.modal-close');

        // Se clicar no X → redireciona
        if (btnClose) {
            btnClose.onclick = (e) => {
                e.preventDefault();
                redirecionar();
            };
        }

        // Se clicar fora do modal → redireciona
        modal.onclick = (e) => {
            if (e.target === modal) {
                redirecionar();
            }
        };

        // Bloqueia ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                redirecionar();
            }
        });
    }

    function redirecionar() {
        window.location.href = URL_REDIRECT;
    }
});
