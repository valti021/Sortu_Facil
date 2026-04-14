document.addEventListener('DOMContentLoaded', () => {

    const ENDPOINT = '../php/gerenciar-rifa/sessao1/sessao1-dados.php';

    const imgElement   = document.querySelector('.imagem-rifa');
    const container    = document.querySelector('.imagem-rifa-container');
    const btnAnterior  = document.querySelector('.controle-anterior');
    const btnProximo   = document.querySelector('.controle-proximo');
    const controles    = document.querySelector('.controles-imagem');
    const indicadores  = document.querySelector('.indicadores-imagem');

    if (!imgElement || !container) return;

    let imagens = [];
    let indexAtual = 0;

    /* ===============================
       BUSCAR DADOS DO BACKEND
    ================================ */
    fetch(ENDPOINT, { method: 'POST' })
        .then(res => res.json())
        .then(data => {

            if (!data.success || !Array.isArray(data.imgs)) {
                console.warn('Imagens não encontradas');
                return;
            }

            imagens = data.imgs;

            // Define imagem inicial
            imgElement.src = imagens[0];

            // Se só tiver uma imagem, não ativa slider
            if (imagens.length <= 1) {
                controles.style.display = 'none';
                indicadores.style.display = 'none';
                return;
            }

            // Ativa slider
            controles.style.display = 'flex';
            criarIndicadores();
            atualizarIndicadores();
        })
        .catch(err => {
            console.error('Erro ao buscar imagens:', err);
        });

    /* ===============================
       FUNÇÕES DO SLIDER
    ================================ */

    function mostrarImagem(index) {
        indexAtual = index;
        imgElement.src = imagens[indexAtual];
        atualizarIndicadores();
    }

    function proximaImagem() {
        indexAtual = (indexAtual + 1) % imagens.length;
        mostrarImagem(indexAtual);
    }

    function imagemAnterior() {
        indexAtual = (indexAtual - 1 + imagens.length) % imagens.length;
        mostrarImagem(indexAtual);
    }

    /* ===============================
       INDICADORES
    ================================ */

    function criarIndicadores() {
        indicadores.innerHTML = '';

        imagens.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('indicador');
            dot.dataset.index = i;

            dot.addEventListener('click', () => {
                mostrarImagem(i);
            });

            indicadores.appendChild(dot);
        });
    }

    function atualizarIndicadores() {
        const dots = indicadores.querySelectorAll('.indicador');
        dots.forEach(dot => dot.classList.remove('ativo'));

        if (dots[indexAtual]) {
            dots[indexAtual].classList.add('ativo');
        }
    }

    /* ===============================
       EVENTOS
    ================================ */

    btnProximo.addEventListener('click', proximaImagem);
    btnAnterior.addEventListener('click', imagemAnterior);

});
