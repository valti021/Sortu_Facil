async function carregarUsuario() {
    try {

        // ── 1. Pega o token do localStorage ──────────────────────
        const token = localStorage.getItem('token');

        // Se não existe token, nem tenta: manda direto pro login
        if (!token) {
            window.location.href = "../front-end/index.html";
            return;
        }

        // ── 2. Envia o token no cabeçalho Authorization ──────────
        //
        //  O padrão é:  "Bearer <token>"
        //  O back-end lê esse cabeçalho e valida a assinatura.
        const resposta = await fetch("../../back-end-sortu-facil/api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                action: "sessao" // Informa ao back-end que queremos validar a sessão
            })
        });

        const dados = await resposta.json();

        // ── 3. Verifica a resposta ────────────────────────────────
        if (!dados.logado) {
            // Token inválido, expirado ou sessão encerrada no servidor
            // Remove o token inútil do localStorage e manda pro login
            localStorage.removeItem('token');
            window.location.href = "../front-end/index.html";
            return;
        }

        // ── 4. Exibe os dados do usuário no HTML ──────────────────
        const nome        = typeof dados.nome      === "string" ? dados.nome      : "";
        const sobrenome   = typeof dados.sobrenome === "string" ? dados.sobrenome : "";
        const nomeCompleto = `${nome} ${sobrenome}`.trim();

        document.getElementById("nomeUsuario").textContent  = nomeCompleto || "Usuário";
        document.getElementById("emailUsuario").textContent = dados.email  || "";

    } catch (e) {
        console.error("Erro ao carregar usuário:", e);
    }
}

document.addEventListener("DOMContentLoaded", carregarUsuario);
