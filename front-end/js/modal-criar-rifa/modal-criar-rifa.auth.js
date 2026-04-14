// ===============================
// ESTADO DE LOGIN
// ===============================
let loginVerificado = false;
let usuarioLogado = false;
let modalContaCarregado = false;

// ===============================
// VERIFICAR LOGIN
// ===============================
async function verificarLogin(forceCheck = false) {
    if (loginVerificado && !forceCheck) return usuarioLogado;

    try {
        const response = await fetch("../php/getUser.php", {
            headers: { "Cache-Control": "no-cache" }
        });

        const dados = await response.json();
        usuarioLogado = dados.logado === true;
        loginVerificado = true;

        return usuarioLogado;
    } catch {
        usuarioLogado = false;
        loginVerificado = true;
        return false;
    }
}

// ===============================
// LIMPAR CACHE
// ===============================
function limparCacheLogin() {
    loginVerificado = false;
    usuarioLogado = false;
}

// ===============================
// CARREGAR MODAL-CONTA.HTML
// ===============================
async function carregarModalConta() {
    if (modalContaCarregado) return;

    try {
        const response = await fetch("modal-conta.html");
        if (!response.ok) throw new Error("Erro ao carregar modal-conta.html");

        const html = await response.text();
        document.body.insertAdjacentHTML("beforeend", html);

        modalContaCarregado = true;
        console.log("✅ modal-conta.html carregado");

    } catch (e) {
        console.error("❌ Não foi possível carregar modal-conta.html", e);
    }
}

// ===============================
// ABRIR MODAL CONTA
// ===============================
async function abrirModalConta() {
    // garante que o HTML existe
    await carregarModalConta();

    const modal = document.getElementById("modal-conta");
    const modalBody = modal?.querySelector(".modal-body");

    if (!modal || !modalBody) {
        console.error("Modal conta não encontrado no DOM");
        return;
    }

    modalBody.innerHTML = "";

    const logado = await verificarLogin();

    if (!logado) {
        // 🔥 USA APENAS O TEMPLATE NÃO LOGADO
        const template = document.getElementById("template-nao-logado");
        modalBody.innerHTML = template.innerHTML;
    } else {
        const template = document.getElementById("template-logado");
        modalBody.innerHTML = template.innerHTML;
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // fechar modal
    const close = modal.querySelector(".modal-close");
    if (close) {
        close.onclick = () => {
            modal.style.display = "none";
            document.body.style.overflow = "";
        };
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "";
        }
    };
}

// ===============================
// EXPORT
// ===============================
export {
    verificarLogin,
    abrirModalConta,
    limparCacheLogin
};
