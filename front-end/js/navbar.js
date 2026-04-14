document.addEventListener("DOMContentLoaded", () => {
    // ✅ NOVO: Verifica se está em modo demo
    const isDemo = localStorage.getItem('isDemo') === 'true';
    if (isDemo) {
        console.log('✓ Modo demo ativo - ignorando verificação de permissão com servidor');
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
    } else {
        console.warn("Token não encontrado no localStorage - requisição pode falhar");
    }

    fetch("http://localhost/SortuFacil/back-end-sortu-facil/php/getUser.php", {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json())
        .then(dados => {
            if (!dados.logado) return;

            const linkMaster = document.getElementById("link-master");

            // Exibe APENAS se for master
            if (dados.permissao === "master") {
                linkMaster.hidden = false;
            } else {
                linkMaster.hidden = true;
            }
        })
        .catch(err => {
            console.error("Erro ao verificar permissão:", err);
        });
});