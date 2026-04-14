document.addEventListener("DOMContentLoaded", () => {
    carregarDadosSessao1();
});

async function carregarDadosSessao1() {
    try {
        const response = await fetch(
            "../php/gerenciar-rifa/sessao1/sessao1-dados.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!data.success) {
            console.error(data.error);
            return;
        }

        // SERIAL
        document.getElementById("serial-number").textContent = data.n_serial;

        // COTAS
        document.getElementById("cotas-disponiveis").textContent = data.cotas.disponiveis;
        document.getElementById("cotas-reservadas").textContent  = data.cotas.reservadas;
        document.getElementById("cotas-pagas").textContent       = data.cotas.pagas;

        // COTAS TOTAIS (repetidas no HTML)
        document.querySelectorAll(".cotas-totais").forEach(el => {
            el.textContent = data.cotas.totais;
        });

    } catch (error) {
        console.error("Erro ao carregar dados da sessão 1:", error);
    }
}
