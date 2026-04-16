document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('#nav-aba ul')
  const links = document.querySelectorAll('#nav-aba a')

  function atualizarIndicador(nome) {
    nav.classList.remove('rifa', 'bingo')
    nav.classList.add(nome)
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      const aba = link.dataset.aba
      atualizarIndicador(aba)
    })
  })

  // inicial
  const primeira = links[0]?.dataset.aba
  if (primeira) atualizarIndicador(primeira)
})