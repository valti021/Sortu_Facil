// nome-rifa.js
window.nomeRifa = {
  setTitle: function(name){
    const el = document.getElementById('titulo-rifa');
    if (!el) return;
    el.textContent = name || '';
  }
};
