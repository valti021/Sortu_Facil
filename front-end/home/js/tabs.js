// tabs.js
const abas = {
  rifa: {
    view: './views/rifa/index.html',
    module: () => import('../views/rifa/js/rifa.js'),
  },
  bingo: {
    view: './views/bingo/index.html',
    module: () => import('../views/bingo/js/bingo.js'),
  },
}

let moduloAtivo = null

async function carregarAba(nome) {
  const aba = abas[nome]
  if (!aba) return

  // 1. Busca e injeta o HTML
  const resposta = await fetch(aba.view)
  const html = await resposta.text()
  document.getElementById('conteudo-aba').innerHTML = html

  // 2. Destrói o módulo anterior se ele expõe um destroy()
  if (moduloAtivo?.destroy) moduloAtivo.destroy()

  // 3. Importa e inicializa o módulo da aba
  const mod = await aba.module()
  moduloAtivo = mod
  if (mod.init) mod.init()
}

function ativarAba(nome) {
  // Atualiza visual dos links
  document.querySelectorAll('#nav-aba a').forEach(link => {
    link.classList.toggle('ativa', link.dataset.aba === nome)
  })
  carregarAba(nome)
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('#nav-aba a')

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      ativarAba(link.dataset.aba)
    })
  })

  // Pega o primeiro da lista, seja lá qual for
  const primeiraAba = links[0]?.dataset.aba
  if (primeiraAba) ativarAba(primeiraAba)
})