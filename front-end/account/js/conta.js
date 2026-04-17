document.addEventListener("DOMContentLoaded", () => {

    const btnAbrir = document.getElementById("abrir-modal-conta");
    const containerModal = document.getElementById("container-modal-conta");

    btnAbrir.addEventListener("click", (e) => {
        e.preventDefault();
        carregarModalConta();
    });

    function carregarModalConta() {
        // Se o modal já foi carregado, só abre
        const modalExistente = document.getElementById("modal-conta");
        if (modalExistente) {
            abrirModalConta();
            return;
        }

        // Carrega o HTML do modal
        fetch("../account/modals/conta.html")
            .then(res => {
                if (!res.ok) throw new Error("Erro ao carregar modal");
                return res.text();
            })
            .then(html => {
                containerModal.innerHTML = html;
                
                // Configura os eventos do modal
                configurarModal();
                
                // Abre o modal
                abrirModalConta();
            })
            .catch(err => {
                console.error("Erro ao carregar modal:", err);
                containerModal.innerHTML = '<div class="modal-error">Erro ao carregar modal. Tente novamente.</div>';
            });
    }

    function configurarModal() {
        const modal = document.getElementById("modal-conta");
        const modalClose = document.querySelector(".modal-close");
        
        if (!modal || !modalClose) return;
        
        // Fechar com X
        modalClose.addEventListener("click", () => {
            modal.style.display = "none";
        });
        
        // Fechar clicando fora
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
        
        // Fechar com ESC
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.style.display === "flex") {
                modal.style.display = "none";
            }
        });
        
        // Evitar fechar ao clicar dentro do conteúdo
        const modalContent = document.querySelector(".modal-content");
        if (modalContent) {
            modalContent.addEventListener("click", (event) => {
                event.stopPropagation();
            });
        }
    }

        function abrirModalConta() {
            const modal = document.getElementById("modal-conta");
            const modalBody = document.querySelector(".modal-body");

            modalBody.innerHTML = document.getElementById("template-loading").innerHTML;
            modal.style.display = "flex";

            const isDemo = localStorage.getItem('isDemo') === 'true';

            // 🟢 MODO DEMO
            if (isDemo) {
                const demoUser = JSON.parse(localStorage.getItem('demoUser'));

                if (!demoUser) {
                    mostrarErro("Dados demo inválidos");
                    return;
                }

                exibirDadosUsuario({ ...demoUser, logado: true }, true);
                return;
            }

            // 🔵 MODO NORMAL
            const token = localStorage.getItem("token");

            if (!token) {
                exibirDadosUsuario({ logado: false }, false);
                return;
            }

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            fetch("../../back-end/api/account.php", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    action: "sessao"
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Erro no servidor");
                return res.json();
            })
            .then(usuario => {
                if (!usuario.logado) {
                    localStorage.removeItem("token");
                }

                exibirDadosUsuario(usuario, false);
            })
            .catch(err => {
                console.error(err);
                mostrarErro("Erro ao validar sessão");
            });
    }

    function exibirDadosUsuario(usuario, isDemo) {
        const modalBody = document.querySelector(".modal-body");

        if (!usuario.logado) {
            modalBody.innerHTML = document.getElementById("template-nao-logado").innerHTML;
            return;
        }

        modalBody.innerHTML = document.getElementById("template-logado").innerHTML;

        const nomeCompleto = `${usuario.nome} ${usuario.sobrenome}`.trim();

        document.getElementById("user-nome-completo").textContent = nomeCompleto;
        document.getElementById("user-email").textContent = usuario.email;

        const img = document.getElementById("user-imagem");
        img.src = usuario.imagem_perfil || "img/default.jpg";
        img.alt = `Foto de ${nomeCompleto}`;

        document.getElementById("btn-logout").addEventListener("click", () => {

            // 🟢 DEMO
            if (isDemo) {
                localStorage.removeItem('isDemo');
                localStorage.removeItem('demoUser');
                localStorage.removeItem('token');

                window.location.href = "../index.html";
                return;
            }

            // 🔵 NORMAL
            const token = localStorage.getItem("token");

            // 🔥 REMOVE IMEDIATAMENTE (resolve teu bug)
            localStorage.removeItem("token");

            fetch("../../back-end-sortu-facil/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: "logout"
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log("Logout servidor:", data);
            })
            .catch(err => {
                console.error("Erro no logout:", err);
            })
            .finally(() => {
                // 🔥 sempre redireciona
                window.location.href = "../index.html";
            });
        });
    }

    

    // Adiciona CSS para erro
    const style = document.createElement('style');
    style.textContent = `
        .modal-error {
            padding: 20px;
            color: var(--cor-vermelho);
            background: rgba(255, 0, 0, 0.1);
            border-radius: 8px;
            text-align: center;
            margin: 20px;
        }
    `;
    document.head.appendChild(style);
});