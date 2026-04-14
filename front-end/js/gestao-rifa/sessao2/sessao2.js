(function(){
  const endpoint = '../php/gerenciar-rifa/sessao2/sessao2.php';
  const folder = '../js/gestao-rifa/sessao2/';

  function loadScript(path){
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = path;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load '+path));
      document.head.appendChild(s);
    });
  }

  async function init(){
    try{
      const res = await fetch(endpoint, { method: 'POST', credentials: 'same-origin' });
      const data = await res.json();
      if (!data || !data.success){
        console.error('sessao2: erro', data && data.error);
        return;
      }

      // Carregar sub-scripts
      await loadScript(folder + 'nome-rifa.js');
      await loadScript(folder + 'montar-tabela.js');
      await loadScript(folder + 'status-cota.js');

      // Aplicar nome
      if (window.nomeRifa && typeof window.nomeRifa.setTitle === 'function'){
        window.nomeRifa.setTitle(data.nome || '');
      }

      // Montar tabela
      const imageBase = '../midia/estrutura-25/';
      if (window.montarTabela && typeof window.montarTabela.build === 'function'){
        window.montarTabela.build(data.quantidade_dezenas || 0, imageBase);
      }

      // Aplicar status
      if (window.statusCota && typeof window.statusCota.apply === 'function'){
        window.statusCota.apply({
          disponiveis: data.cotas ? data.cotas.disponiveis : null,
          reservadas: data.cotas ? data.cotas.reservadas : null,
          pagas: data.cotas ? data.cotas.pagas : null
        });
      }

    }catch(err){
      console.error('sessao2 init error', err);
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
