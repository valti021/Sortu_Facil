document.addEventListener('DOMContentLoaded', () => {
    const URL_API = '../php/gerenciar-rifa/sessao1/sessao1-dados.php';
    const URL_MODAL = '../estrutura-principal/modal-finalizar-rifa.html';

    const containerTabela = document.querySelector('.conteiner-tabela-cota');
    if (!containerTabela) return;

    /* ===============================
       FUNÇÕES AUXILIARES
    ================================ */
    function formatarDataHoraBR(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();

        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');

        return `${d}/${m}/${y} - ${h}:${min}:${s}`;
    }

    function calcularTempoRestante(dataAtual, dataSorteio) {
        let diff = Math.max(0, dataSorteio - dataAtual);

        const dia = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff %= (1000 * 60 * 60 * 24);

        const hora = Math.floor(diff / (1000 * 60 * 60));
        diff %= (1000 * 60 * 60);

        const minuto = Math.floor(diff / (1000 * 60));
        const segundo = Math.floor((diff % (1000 * 60)) / 1000);

        return { dia, hora, minuto, segundo };
    }

    /* ===============================
       BUSCA DADOS DO BACKEND
    ================================ */
    fetch(URL_API, {
        method: 'POST',
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) return;

        // 🚦 rifa precisa estar ATIVA
        if (data.status !== 'ativa') return;

        const cotasTotais = Number(data.cotas.totais);
        const cotasPagas = Number(data.cotas.pagas);

        const dataSorteio = new Date(data.data_sorteio.replace(' ', 'T'));
        const dataAtualServidor = new Date(
            data.servidor.data_hora_completa.replace(' ', 'T')
        );

        let modoModal = null;

        /* ===============================
           DEFINIÇÃO DO MODO
        ================================ */
        const minutosParaSorteio =
            (dataSorteio.getTime() - dataAtualServidor.getTime()) / (60 * 1000);

        // 🟧 ADIAR
        if (
            cotasPagas < cotasTotais &&
            minutosParaSorteio <= 30 &&
            minutosParaSorteio > 0
        ) {
            modoModal = 'adiar';
        }

        // 🔴 CANCELAR
        else if (dataAtualServidor >= dataSorteio && cotasPagas < cotasTotais) {
            modoModal = 'cancelar';
        }

        // 🚫 NADA
        else if (dataAtualServidor >= dataSorteio && cotasPagas === cotasTotais) {
            return;
        }

        // 🟩 FINALIZAR
        else if (cotasPagas === cotasTotais && dataAtualServidor < dataSorteio) {
            modoModal = 'finalizar';
        }

        if (!modoModal) return;

        /* ===============================
           CARREGA MODAL
        ================================ */
        fetch(URL_MODAL)
            .then(res => res.text())
            .then(html => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html;
                wrapper.dataset.modo = modoModal;

                containerTabela.style.position = 'relative';
                containerTabela.appendChild(wrapper);

                /* ===============================
                   MODAL ATIVO (FINALIZAR / ADIAR)
                ================================ */
                const modalAtivo =
                    (modoModal === 'finalizar' && wrapper.querySelector('.modal-finalizar-rifa')) ||
                    (modoModal === 'adiar' && wrapper.querySelector('.modal-finalizar-adiar'));

                if (modalAtivo) {
                    // 📅 Data do sorteio
                    const elData = modalAtivo.querySelector('.data-horario-sorteio');
                    if (elData) {
                        elData.textContent = formatarDataHoraBR(dataSorteio);
                    }

                    // ⏱ Cronômetro
                    const elDia = modalAtivo.querySelector('.dia');
                    const elHora = modalAtivo.querySelector('.hora');
                    const elMinuto = modalAtivo.querySelector('.minuto');
                    const elSegundo = modalAtivo.querySelector('.segundo');

                    function atualizarCronometro() {
                        const agora = new Date();
                        const tempo = calcularTempoRestante(agora, dataSorteio);

                        if (elDia) elDia.textContent = `${tempo.dia}d`;
                        if (elHora) elHora.textContent = `${tempo.hora}h`;
                        if (elMinuto) elMinuto.textContent = `${tempo.minuto}m`;
                        if (elSegundo) elSegundo.textContent = `${tempo.segundo}s`;
                    }

                    atualizarCronometro();
                    setInterval(atualizarCronometro, 1000);
                }

                /* ===============================
                   FECHAR MODAL (SÓ ADIAR)
                ================================ */
                if (modoModal === 'adiar') {
                    const btnFechar = wrapper.querySelector('.fa-xmark');

                    if (btnFechar) {
                        btnFechar.addEventListener('click', () => {
                            wrapper.remove();
                        });
                    }
                }
            });
    })
    .catch(err => {
        console.error('Erro na lógica de finalização da rifa:', err);
    });
});