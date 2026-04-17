/**
 * rifa.js — Maestro da aba Rifa
 * Responsável por: orquestrar o carregamento de todos os módulos da aba.
 * Cada módulo é chamado de forma isolada — se um quebrar, os outros continuam.
 */

// ─── Caminhos dos módulos (ajuste conforme sua estrutura de pastas) ────────
const MODULOS = [
  './navegacao-status.js',
  './views/rifa/js/modal-criar-rifa_imagem.js',
  './views/rifa/js/modal-criar-rifa_calculo.js',
  './views/rifa/js/modal-criar-rifa_form.js',
  './views/rifa/js/modal-criar-rifa_nomepremio.js',
  './views/rifa/js/modal-criar-rifa_agenda.js',
  './views/rifa/js/modal-criar-rifa_validacao.js',
  './views/rifa/js/modal-criar-rifa_submit.js',
];

// ─── Função para carregar script demo se necessário ──────────────────────
function carregarScriptDemo() {
  return new Promise((resolve, reject) => {
    const isDemo = localStorage.getItem('isDemo') === 'true';
    if (!isDemo) {
      resolve();
      return;
    }
    // Verifica se já foi carregado
    if (window.rifasDemo) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = '../demo/js/rifas-demo.js';
    script.onload = () => {
      console.log('✓ rifas-demo.js carregado para modo demo');
      resolve();
    };
    script.onerror = () => {
      console.error('Erro ao carregar rifas-demo.js');
      reject(new Error('Falha ao carregar rifas-demo.js'));
    };
    document.head.appendChild(script);
  });
}

// ─── Injeta um <script> no DOM e retorna uma Promise ──────────────────────
async function carregarModulo(src) {
  try {
    const mod = await import(src);
    if (mod.init) {
      await mod.init();
    }
    return mod;
  } catch (err) {
    console.error(`❌ Falha ao carregar módulo: ${src}`, err);
    return null;
  }
}

// ─── Carrega cada módulo de forma isolada ─────────────────────────────────
async function carregarTodosModulos() {
  for (const src of MODULOS) {
    try {
      await carregarModulo(src);
    } catch (err) {
      // Um módulo quebrou — registra o erro mas continua os próximos
      console.error(err.message);
    }
  }
}

// ─── API pública exigida pelo tabs.js ─────────────────────────────────────
export async function init() {
  console.log('🎟️ rifa.js: init() — carregando script demo se necessário...');
  await carregarScriptDemo();
  console.log('🎟️ rifa.js: carregando módulos...');
  await carregarTodosModulos();
  console.log('🎟️ rifa.js: todos os módulos processados.');
}

export function destroy() {
  // Remove os scripts injetados ao sair da aba (libera memória)
  document.querySelectorAll('script[data-modulo-rifa]').forEach(s => s.remove());
  console.log('🎟️ rifa.js: destroy() — módulos removidos.');
}