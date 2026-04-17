// render-rifas.js
let listaRifas, blocoSemRifas, msgSemRifas, cardBase, btnMaisBox;

export function inicializarElementos() {
    listaRifas = document.getElementById("lista-rifas");
    blocoSemRifas = document.getElementById("bloco-sem-rifas");
    msgSemRifas = document.getElementById("mensagem-sem-rifas");
    cardBase = document.querySelector(".rifa-card-example");
    btnMaisBox = document.getElementById("carregar-mais");

    if (cardBase) cardBase.style.display = "none";
    if (listaRifas) listaRifas.innerHTML = "";
}

export function limparLista() {
    if (listaRifas) listaRifas.innerHTML = "";
}

function limitarTexto(texto, limite = 25) {
    if (!texto) return "";
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite).trim() + "...";
}

export async function renderizarRifas(status, offset, limite) {
    if (!listaRifas) {
        console.warn("Elementos não inicializados. Chame inicializarElementos() primeiro.");
        return;
    }

    const isDemo = localStorage.getItem('isDemo') === 'true';
    let promiseRifas;

    if (isDemo) {
        promiseRifas = window.rifasDemo
            ? window.rifasDemo.carregarRifas(status, offset, limite)
            : Promise.resolve([]);
    } else {
        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const body = JSON.stringify({
            action: "listar",
            status: status,
            offset: offset,
            limite: limite
        });

        promiseRifas = fetch("../../back-end/api/raffle.php", {
            method: 'POST',
            headers,
            mode: 'cors',
            body: body
        })
        .then(res => res.text())
        .then(text => {
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                    return parsed;
                } else if (parsed && parsed.success === false) {
                    console.error("Erro da API:", parsed.error);
                    return [];
                } else {
                    console.warn("Resposta inesperada:", parsed);
                    return [];
                }
            } catch {
                console.error("JSON inválido:", text);
                throw new Error("JSON inválido");
            }
        });
    }

    try {
        const rifas = await promiseRifas;

        if (!Array.isArray(rifas)) {
            console.error("Resposta não é um array:", rifas);
            listaRifas.style.display = "none";
            blocoSemRifas.style.display = "block";
            msgSemRifas.innerHTML = "Erro ao carregar rifas: formato inválido.";
            if (btnMaisBox) btnMaisBox.style.display = "none";
            return;
        }

        if (rifas.length === 0) {
            if (offset === 0) {
                listaRifas.style.display = "none";
                blocoSemRifas.style.display = "block";
                msgSemRifas.innerHTML = `Nenhuma rifa em <strong>${status}</strong>.`;
                if (btnMaisBox) btnMaisBox.style.display = "none";
            } else {
                if (btnMaisBox) btnMaisBox.style.display = "none";
            }
            return;
        }

        listaRifas.style.display = "grid";
        blocoSemRifas.style.display = "none";

        rifas.forEach(obj => {
            const cardKey = Object.keys(obj)[0];
            const dados = obj[cardKey];
            const cardId = cardKey.replace("card-", "");
            const card = cardBase.cloneNode(true);
            card.style.display = "block";

            // Título
            const titleElem = card.querySelector(".title");
            if (titleElem) titleElem.textContent = limitarTexto(dados.title, 25);

            // Descrição
            const descElem = card.querySelector(".descricao .texto");
            if (descElem) descElem.textContent = dados.description ?? "";

            // Preço
            const priceElem = card.querySelector(".price");
            if (priceElem) priceElem.textContent = dados.price ?? "0,00";

            // Tickets vendidos
            const soldElem = card.querySelector(".tickets-sold");
            if (soldElem) soldElem.innerHTML = `<i class="fas fa-ticket-alt"></i> ${dados["tickets-sold"] ?? "0/0"}`;

            // Data do sorteio
            const dateElem = card.querySelector(".draw-date");
            if (dateElem) dateElem.innerHTML = `<i class="far fa-calendar"></i> ${dados["draw-date"] ?? ""}`;

            // Imagens
            const imgContainer = card.querySelector(".img-container");
            const paginacao = card.querySelector(".indentificador-de-paginacao");
            if (imgContainer) imgContainer.innerHTML = "";
            if (paginacao) paginacao.innerHTML = "";

            let imagens = [];
            if (Array.isArray(dados.imgs) && dados.imgs.length > 0) {
                imagens = dados.imgs.slice();
            } else if (dados.img && typeof dados.img === 'object') {
                const keys = Object.keys(dados.img).filter(k => /^img-\d+$/.test(k));
                keys.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));
                keys.forEach(k => imagens.push(dados.img[k]));
            }
            if (!imagens.length) imagens = [""];

            let imgIndex = 0;
            const imgElement = document.createElement("img");
            imgElement.src = imagens[0];
            imgContainer.appendChild(imgElement);

            const dots = [];
            imagens.forEach((_, idx) => {
                const dot = document.createElement("span");
                if (idx === 0) dot.classList.add("ativo");
                dot.addEventListener("click", () => {
                    imgIndex = idx;
                    atualizarImagem();
                });
                paginacao.appendChild(dot);
                dots.push(dot);
            });

            function atualizarImagem() {
                imgElement.src = imagens[imgIndex];
                dots.forEach(d => d.classList.remove("ativo"));
                if (dots[imgIndex]) dots[imgIndex].classList.add("ativo");
            }

            const btnLeft = card.querySelector(".btn-left");
            const btnRight = card.querySelector(".btn-right");

            if (imagens.length > 1) {
                btnLeft.onclick = () => {
                    imgIndex = (imgIndex - 1 + imagens.length) % imagens.length;
                    atualizarImagem();
                };
                btnRight.onclick = () => {
                    imgIndex = (imgIndex + 1) % imagens.length;
                    atualizarImagem();
                };
            } else {
                btnLeft.style.display = "none";
                btnRight.style.display = "none";
                paginacao.style.display = "none";
            }

            // ==========================================================
            // 🔥 LINK GERENCIAR – AGORA SEM REQUISIÇÃO, APENAS REDIRECIONA
            // ==========================================================
            const gerenciarLink = card.querySelector(".gerenciar");
            if (gerenciarLink) {
                // Usa o n_serial se disponível, senão usa o ID numérico
                const serial = dados.n_serial || cardId;
                gerenciarLink.href = `informacoes-gestao.html?serial=${encodeURIComponent(serial)}`;
                // Remove qualquer comportamento anterior (como o href="#")
                gerenciarLink.removeAttribute("onclick");
                // Garante que não haja evento de clique conflitante
                // (já que o href fará o redirecionamento normalmente)
            }

            listaRifas.appendChild(card);
        });

        if (btnMaisBox) {
            btnMaisBox.style.display = (rifas.length < limite) ? "none" : "block";
        }
    } catch (err) {
        console.error("Erro ao carregar rifas:", err);
        listaRifas.style.display = "none";
        blocoSemRifas.style.display = "block";
        msgSemRifas.textContent = "Erro ao carregar rifas.";
    }
}

export function destroy() {
    // Limpeza se necessário
}