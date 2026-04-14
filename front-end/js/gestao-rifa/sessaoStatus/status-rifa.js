document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("status");

    if (!statusEl) return;

    fetch("../php/gerenciar-rifa/sessao1/sessao1-dados.php", {
        method: "GET",
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            statusEl.textContent = "INDISPONÍVEL";
            statusEl.style.color = "#999";
            return;
        }

        if (!data.status) {
            statusEl.textContent = "NÃO DEFINIDO";
            statusEl.style.color = "#999";
            return;
        }

        // 1️⃣ caixa alta
        const status = data.status.toUpperCase();
        statusEl.textContent = status;

        // 2️⃣ reset básico de cor
        statusEl.style.color = "#000";

        // 3️⃣ cores por status
        switch (status) {
            case "ATIVA":
                statusEl.style.color = "green";
                break;

            case "ADIADA":
                statusEl.style.color = "orange";
                break;

            case "CANCELADA":
                statusEl.style.color = "red";
                break;

            case "CONCLUIDA":
                statusEl.style.color = "blue";
                break;

            default:
                statusEl.style.color = "#555";
        }
    })
    .catch(err => {
        console.error("Erro ao buscar status da rifa:", err);
        statusEl.textContent = "ERRO";
        statusEl.style.color = "red";
    });
});