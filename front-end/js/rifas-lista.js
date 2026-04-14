// ======================================================================
//  CARREGA QUANTIDADE DE RIFAS POR STATUS
// ======================================================================
function carregarStatus() {
    const isDemo = localStorage.getItem('isDemo') === 'true';

    if (isDemo) {
        // Modo demo: usa dados locais via rifas-demo.js
        if (window.rifasDemo) {
            window.rifasDemo.carregarStatus().then(dados => {
                document.getElementById("rifas-ativas").textContent     = dados.ativa ?? 0;
                document.getElementById("rifas-adiadas").textContent    = dados.adiada ?? 0;
                document.getElementById("rifas-canceladas").textContent = dados.cancelada ?? 0;
                document.getElementById("rifas-concluidas").textContent = dados.concluida ?? 0;
            }).catch(err => console.error('Erro em carregarStatus (demo):', err));
        } else {
            console.warn('rifasDemo não carregado - fallback para zeros');
            document.getElementById("rifas-ativas").textContent     = 0;
            document.getElementById("rifas-adiadas").textContent    = 0;
            document.getElementById("rifas-canceladas").textContent = 0;
            document.getElementById("rifas-concluidas").textContent = 0;
        }
    } else {
        // Modo normal: fetch com token JWT e CORS
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        } else {
            console.warn("Token não encontrado - requisição pode falhar");
        }

        fetch("http://localhost/SortuFacil/back-end-sortu-facil/php/contar-rifas.php", {
            method: 'GET',
            headers: headers,
            mode: 'cors'  // Política de CORS para compatibilidade cross-origin
        })
            .then(res => res.json())
            .then(dados => {
                document.getElementById("rifas-ativas").textContent     = dados.ativa ?? 0;
                document.getElementById("rifas-adiadas").textContent    = dados.adiada ?? 0;
                document.getElementById("rifas-canceladas").textContent = dados.cancelada ?? 0;
                document.getElementById("rifas-concluidas").textContent = dados.concluida ?? 0;
            })
            .catch(err => console.error('Erro em carregarStatus:', err));
    }
}

// ======================================================================
//  CONTROLE DE PAGINAÇÃO
// ======================================================================
let estadoAtual = "ativa";
let offsetAtual = 0;
const limite = 4;

document.addEventListener("DOMContentLoaded", () => {
    // Verifica modo demo e carrega rifas-demo.js se necessário
    const isDemo = localStorage.getItem('isDemo') === 'true';
    if (isDemo) {
        const script = document.createElement('script');
        script.src = '../demo/js/rifas-demo.js';
        script.onload = () => {
            console.log('✓ rifas-demo.js carregado para modo demo');
            inicializarInterface();
        };
        script.onerror = () => {
            console.error('Erro ao carregar rifas-demo.js');
            inicializarInterface(); // Fallback sem demo
        };
        document.head.appendChild(script);
    } else {
        inicializarInterface();
    }

    function inicializarInterface() {
        const tabs        = document.querySelectorAll(".status-vendedor li");
        const tituloTexto = document.getElementById("titulo-texto");
        const lista       = document.getElementById("lista-rifas");
        const blocoSem    = document.getElementById("bloco-sem-rifas");
        const msgSem      = document.getElementById("mensagem-sem-rifas");
        const botaoCriar  = document.getElementById("btn-criar-rifa-icone");
        const btnMaisBox  = document.getElementById("carregar-mais");
        const btnMais     = document.getElementById("btn-carregar-mais");

        // CARD BASE (HTML PRONTO)
        const cardBase = document.querySelector(".rifa-card-example");
        cardBase.style.display = "none";

    // ==================================================================
    //  BUSCAR RIFAS
    // ==================================================================
    function carregarMaisRifas() {
        const isDemo = localStorage.getItem('isDemo') === 'true';

        let promiseRifas;

        if (isDemo) {
            // Modo demo: usa dados locais via rifas-demo.js
            if (window.rifasDemo) {
                promiseRifas = window.rifasDemo.carregarRifas(estadoAtual, offsetAtual, limite);
            } else {
                console.warn('rifasDemo não carregado - sem rifas');
                promiseRifas = Promise.resolve([]);
            }
        } else {
            // Modo normal: fetch com token JWT e CORS
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else {
                console.warn("Token não encontrado - requisição pode falhar");
            }

            promiseRifas = fetch(`http://localhost/SortuFacil/back-end-sortu-facil/php/buscar-rifas.php?status=${estadoAtual}&offset=${offsetAtual}`, {
                method: 'GET',
                headers: headers,
                mode: 'cors'  // Política de CORS
            })
                .then(res => res.text())
                .then(text => {
                    try {
                        return JSON.parse(text);
                    } catch {
                        console.error("Resposta inválida:", text);
                        throw new Error("JSON inválido");
                    }
                });
        }

        promiseRifas
            .then(rifas => {

                if (rifas.length === 0) {
                    if (offsetAtual === 0) {
                        lista.style.display = "none";
                        blocoSem.style.display = "block";
                        msgSem.innerHTML = `Nenhuma rifa em <strong>${estadoAtual}</strong>.`;
                        btnMaisBox.style.display = "none";
                        botaoCriar.style.display = (estadoAtual === "ativa") ? "inline-flex" : "none";
                    } else {
                        btnMaisBox.style.display = "none";
                    }
                    return;
                }

                lista.style.display = "grid";
                blocoSem.style.display = "none";

                rifas.forEach(obj => {

                    const cardKey = Object.keys(obj)[0];
                    const dados   = obj[cardKey];
                    const cardId  = cardKey.replace("card-", "");

                    function limitarTexto(texto, limite = 25) {
                        if (!texto) return "";
                        if (texto.length <= limite) return texto;

                        return texto.substring(0, limite).trim() + "...";
                    }


                    // CLONA CARD PRONTO
                    const card = cardBase.cloneNode(true);
                    card.style.display = "block";

                    // TÍTULO
                    card.querySelector(".title").textContent = limitarTexto(dados.title, 25);


                    // DESCRIÇÃO
                    card.querySelector(".descricao .texto").textContent =
                        dados.description ?? "";

                    // PREÇO
                    card.querySelector(".price").textContent =
                        dados.price ?? "0,00";

                    // VENDIDOS
                    card.querySelector(".tickets-sold").innerHTML =
                        `<i class="fas fa-ticket-alt"></i> ${dados["tickets-sold"] ?? "0/0"}`;

                    // DATA
                    card.querySelector(".draw-date").innerHTML =
                        `<i class="far fa-calendar"></i> ${dados["draw-date"] ?? ""}`;

                    // IMAGENS
                    const imgContainer = card.querySelector(".img-container");
                    const paginacao    = card.querySelector(".indentificador-de-paginacao");

                    imgContainer.innerHTML = "";
                    paginacao.innerHTML = "";

                    let imagens = [];

                    // Prioriza `imgs` (array) enviado pelo backend
                    if (Array.isArray(dados.imgs) && dados.imgs.length > 0) {
                        imagens = dados.imgs.slice();
                    } else if (dados.img && typeof dados.img === 'object') {
                        // Compatibilidade: monta array a partir de img-1, img-2, ...
                        const keys = Object.keys(dados.img).filter(k => /^img-\d+$/.test(k));
                        keys.sort((a, b) => {
                            const na = parseInt(a.split('-')[1], 10);
                            const nb = parseInt(b.split('-')[1], 10);
                            return na - nb;
                        });
                        keys.forEach(k => imagens.push(dados.img[k]));
                    }

                    if (!Array.isArray(imagens) || imagens.length === 0) {
                        imagens = [""];
                    }

                    let imgIndex = 0;

                    const img = document.createElement("img");
                    img.src = imagens[0] ?? "";
                    imgContainer.appendChild(img);

                    // CRIA BOLINHAS
                    imagens.forEach((_, index) => {
                        const dot = document.createElement("span");
                        if (index === 0) dot.classList.add("ativo");

                        dot.addEventListener("click", () => {
                            imgIndex = index;
                            atualizarImagem();
                        });

                        paginacao.appendChild(dot);
                    });

                    const dots = paginacao.querySelectorAll("span");

                    function atualizarImagem() {
                        img.src = imagens[imgIndex];
                        dots.forEach(d => d.classList.remove("ativo"));
                        dots[imgIndex].classList.add("ativo");
                    }

                    const btnLeft  = card.querySelector(".btn-left");
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
                        btnLeft.style.display  = "none";
                        btnRight.style.display = "none";
                        paginacao.style.display = "none";
                    }


                    // LINK GERENCIAR — primeiro checa com o backend para obter o n_serial
                    const gerenciarLink = card.querySelector(".gerenciar");
                    gerenciarLink.href = "#";
                    gerenciarLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        gerenciarLink.classList.add("loading");

                        const isDemo = localStorage.getItem('isDemo') === 'true';

                        let promiseDados;

                        if (isDemo) {
                            // Modo demo: usa dados locais
                            if (window.rifasDemo) {
                                promiseDados = window.rifasDemo.getDadosPrimarios(cardId);
                            } else {
                                promiseDados = Promise.resolve({ success: false, error: 'rifasDemo não carregado' });
                            }
                        } else {
                            // Modo normal: fetch com token JWT e CORS
                            const token = localStorage.getItem("token");
                            const headers = { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" };
                            if (token) {
                                headers["Authorization"] = `Bearer ${token}`;
                            }

                            promiseDados = fetch(`http://localhost/SortuFacil/back-end-sortu-facil/php/gerenciar-rifa/dados-primario.php`, {
                                method: "POST",
                                headers: headers,
                                body: `id=${encodeURIComponent(cardId)}`,
                                mode: 'cors'  // Política de CORS
                            })
                                .then(res => res.json());
                        }

                        promiseDados
                            .then(data => {
                                gerenciarLink.classList.remove("loading");
                                if (data && data.success) {
                                    const serial = data.n_serial;
                                    window.location.href = `informacoes-gestao.html?serial=${encodeURIComponent(serial)}`;
                                } else {
                                    const msg = (data && data.error) ? data.error : "Erro ao carregar a rifa.";
                                    alert(msg);
                                }
                            })
                            .catch(() => {
                                gerenciarLink.classList.remove("loading");
                                alert("Erro ao conectar com o servidor.");
                            });
                    });

                    lista.appendChild(card);
                });

                offsetAtual += limite;
                btnMaisBox.style.display = (rifas.length < limite) ? "none" : "block";
            })
            .catch(() => {
                lista.style.display = "none";
                blocoSem.style.display = "block";
                msgSem.textContent = "Erro ao carregar rifas.";
            });
    }

    // ==================================================================
    //  TROCA STATUS
    // ==================================================================
    function trocarStatus(status, texto) {
        estadoAtual = status;
        offsetAtual = 0;
        lista.innerHTML = "";
        tituloTexto.textContent = texto;
        botaoCriar.style.display = (status === "ativa") ? "inline-flex" : "none";
        carregarMaisRifas();
    }

    // ==================================================================
    //  EVENTOS
    // ==================================================================
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("ativo"));
            tab.classList.add("ativo");
            trocarStatus(tab.dataset.status, tab.textContent.split(":")[0].trim());
        });
    });

    btnMais.addEventListener("click", carregarMaisRifas);

    // ==================================================================
    //  INIT
    // ==================================================================
    carregarStatus();
    tabs[0].classList.add("ativo");
    trocarStatus("ativa", "Ativas");
    } // Fecha inicializarInterface
}); // Fecha DOMContentLoaded
