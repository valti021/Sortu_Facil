// cell-click.js
window.cellClick = {
  selectedNumbers: new Map(),
  currentMode: null,
  selectionCallback: null,

  init() {
    const tbody = document.getElementById('tabela-body');
    if (!tbody) return;

    tbody.addEventListener('click', (ev) => this.handleClick(ev, tbody));
    console.log('cellClick: inicializado');
  },

  async handleClick(ev, tbody) {
    const td = ev.target.closest('td.celula');
    if (!td || !tbody.contains(td)) return;

    if (td.dataset.loading === '1') return;
    td.dataset.loading = '1';  // Marca que a célula está processando

    const numero =
      td.dataset.number ||
      td.querySelector('.texto')?.textContent.trim();

    if (!numero) {
      td.dataset.loading = '0';
      return;
    }

    try {
      // Envia a requisição para verificar o status da cota
      const response = await fetch(
        '/site-um/gestor-de-rifa/php/gerenciar-rifa/sessao2/buscar-status-cota.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numero })
        }
      );

      if (!response.ok) throw new Error('Erro na requisição');

      const { status, numero: numeroResposta } = await response.json();

      console.log("Status da cota:", status);  // Adicionando log para ver o status no JS

      // Se a cota estiver paga, não permite seleção
      if (status === 'paga') {
        console.log(`Cota ${numeroResposta} está paga. Não pode ser selecionada.`);
        return;
      }

      // Se o número já está selecionado, desmarque-o
      if (this.selectedNumbers.has(numero)) {
        this.deselect(td, numero, status);
      } else {
        // Caso contrário, selecione o número
        this.select(td, numero, status);
      }

    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      td.dataset.loading = '0';  // Libera a célula para novos cliques
    }
  },

  select(td, numero, status) {
    // Impede a seleção de números com status 'pago'
    if (status === 'pago') {
      console.log(`Número ${numero} não pode ser selecionado porque está pago.`);
      return;
    }

    // Se for o primeiro número selecionado, define o modo
    if (this.selectedNumbers.size === 0) {
      this.currentMode = status;
    }

    // Garante que só números com o mesmo status sejam selecionados
    if (this.currentMode !== status) {
      console.log(`Não pode misturar ${this.currentMode} com ${status}`);
      return;
    }

    // Adiciona o número ao mapa de selecionados
    this.selectedNumbers.set(numero, status);

    // Torna o marcador visível e define a classe do status
    this.renderCheckmark(td, status);

    // Notifica outros módulos sobre a seleção
    this.notify(numero, status, 'add');
  },

  deselect(td, numero, status) {
    // Remove o número da seleção
    this.selectedNumbers.delete(numero);

    // Remove o marcador visual
    this.removeCheckmark(td);

    // Notifica a remoção da seleção
    this.notify(numero, status, 'remove');

    // Se não houver mais números selecionados, reseta o modo
    if (this.selectedNumbers.size === 0) {
      this.currentMode = null;
    }
  },

  renderCheckmark(td, status) {
    // Remove qualquer marcador existente
    this.removeCheckmark(td);

    // Seleciona o marcador dentro da célula
    const marcador = td.querySelector('.marcador');

    // Torna o marcador visível
    marcador.style.display = 'flex';  // Torna o marcador visível

    // Adiciona a classe de status correspondente ao marcador
    marcador.className = 'marcador';  // Reseta as classes
    marcador.classList.add(status);  // Adiciona a classe do status (disponivel, reservado, pago)
  },

  removeCheckmark(td) {
    // Seleciona o marcador e o esconde
    const marcador = td.querySelector('.marcador');
    if (marcador) {
      marcador.style.display = 'none';  // Esconde o marcador
    }
  },

  setSelectionCallback(cb) {
    this.selectionCallback = cb;
  },

  notify(numero, status, action) {
    // Notifica outros módulos (se houver callback)
    if (typeof this.selectionCallback === 'function') {
      this.selectionCallback(numero, status, action);
    }
  },

  getSelectedNumbers() {
    // Retorna todos os números selecionados
    return Array.from(this.selectedNumbers.entries());
  },

  clearSelections() {
    // Limpa todas as seleções
    document.querySelectorAll('.marcador').forEach(m => m.style.display = 'none');
    this.selectedNumbers.forEach((status, numero) => {
      this.notify(numero, status, 'remove');
    });
    this.selectedNumbers.clear();
    this.currentMode = null;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.cellClick.init();
});