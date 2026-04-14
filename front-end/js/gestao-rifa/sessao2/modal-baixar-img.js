document.addEventListener('DOMContentLoaded', () => {
  const abrirBtn = document.querySelector('.fa-download');
  const containerModal = document.getElementById('modal-compartilhar');

  if (!abrirBtn || !containerModal) return;

  let modalCarregado = false;

  abrirBtn.addEventListener('click', async () => {
    // Carrega o HTML do modal apenas uma vez
    if (!modalCarregado) {
      const response = await fetch('modal-compartilhar.html');
      const html = await response.text();
      containerModal.innerHTML = html;
      modalCarregado = true;

      registrarEventosModal();
    }

    document.querySelector('#modal-compartilhar .modal').style.display = 'flex';
  });

  function registrarEventosModal() {
    const modal = document.querySelector('#modal-compartilhar .modal');
    const fechar = document.getElementById('fechar-modal-compartilhar');
    const copiar = document.getElementById('copiar-link');
    const baixar = document.getElementById('baixar-img');
    const input = document.getElementById('link-rifa');

    if (!modal) return;

    fechar?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    copiar?.addEventListener('click', () => {
      input.select();
      navigator.clipboard.writeText(input.value);
      console.log('Link copiado');
    });

    baixar?.addEventListener('click', () => {
      console.log('Baixar imagem clicado');
    });

    // Clique fora fecha o modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});