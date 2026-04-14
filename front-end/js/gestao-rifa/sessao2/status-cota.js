// status-cota.js
window.statusCota = {
  apply: function (obj) {
    const disponiveis = Array.isArray(obj?.disponiveis) ? obj.disponiveis : [];
    const reservadas  = Array.isArray(obj?.reservadas)  ? obj.reservadas  : [];
    const pagas       = Array.isArray(obj?.pagas)       ? obj.pagas       : [];

    const dispSet = new Set(disponiveis);
    const resSet  = new Set(reservadas);
    const pagSet  = new Set(pagas);

    const tbody = document.getElementById('tabela-body');
    if (!tbody) return;

    const cells = tbody.querySelectorAll('td.celula[data-number]');

    cells.forEach(td => {
      const num = td.getAttribute('data-number');

      // Limpa estados
      td.classList.remove('disponivel', 'reservada', 'paga');

      if (pagSet.has(num)) {
        td.classList.add('paga');

      } else if (resSet.has(num)) {
        td.classList.add('reservada');

      } else if (
        dispSet.has(num) ||
        (dispSet.size === 0 && resSet.size === 0 && pagSet.size === 0)
      ) {
        td.classList.add('disponivel');
      }
    });
  }
};
