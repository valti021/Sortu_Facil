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

const cacheAbas = {} // 👈 cache das abas

async function carregarAba(nome) {
  const aba = abas[nome]
  if (!aba) return

  const container = document.getElementById('conteudo-aba')

  // 🔥 1. Se já tiver no cache → usa direto (SEM spinner)
  if (cacheAbas[nome]) {
    container.innerHTML = cacheAbas[nome]

    if (moduloAtivo?.destroy) moduloAtivo.destroy()

    const mod = await aba.module()
    moduloAtivo = mod
    if (mod.init) mod.init()

    return
  }

  // 🔄 2. Mostra spinner enquanto carrega
  container.innerHTML = `
    <div class="spinner-container">
        <div class="spinner"></div>
    </div>
  `

  try {
    // 📡 3. Busca HTML
    const resposta = await fetch(aba.view)
    const html = await resposta.text()

    // 💾 salva no cache
    cacheAbas[nome] = html

    // 🧹 limpa módulo anterior
    if (moduloAtivo?.destroy) moduloAtivo.destroy()

    // 🖥️ renderiza
    container.innerHTML = html

    // 📦 carrega JS da aba
    const mod = await aba.module()
    moduloAtivo = mod
    if (mod.init) mod.init()

  } catch (erro) {
    container.innerHTML = `<p>Erro ao carregar conteúdo 😢</p>`
    console.error(erro)
  }
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