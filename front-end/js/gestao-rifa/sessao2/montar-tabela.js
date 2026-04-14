// montar-tabela.js
window.montarTabela = {
  build: function(quantity, imageBase){
    const tbody = document.getElementById('tabela-body');
    if (!tbody) return;

    const template = tbody.querySelector('.linha-modelo');
    if (!template) return;


    template.style.display = 'none';
    const old = tbody.querySelectorAll('.gerada');
    old.forEach(n => n.remove());

    const maxIndex = Math.max(0, (quantity - 1));

    const displayMax = (quantity === 25) ? quantity : maxIndex;
    const width = Math.max(2, String(displayMax).length);

    // mapeamento de nomes para opção 25
    const animais = {
      1: 'Avestruz', 2: 'Águia', 3: 'Burro', 4: 'Borboleta', 5: 'Cachorro',
      6: 'Cabra', 7: 'Carneiro', 8: 'Camelo', 9: 'Cobra', 10: 'Coelho',
      11: 'Cavalo', 12: 'Elefante', 13: 'Galo', 14: 'Gato', 15: 'Jacaré',
      16: 'Leão', 17: 'Macaco', 18: 'Porco', 19: 'Pavão', 20: 'Peru',
      21: 'Touro', 22: 'Tigre', 23: 'Urso', 24: 'Veado', 25: 'Vaca'
    };

    for (let i = 0; i < quantity; i++){

      const num = (quantity === 25) ? String(i + 1).padStart(width, '0') : String(i).padStart(width, '0');
      const tr = template.cloneNode(true);
      tr.classList.add('gerada');
      tr.style.display = '';

      const td = tr.querySelector('td.celula');
      if (td){
        td.setAttribute('data-number', num);
        const span = td.querySelector('.texto');
        if (span) {
          span.textContent = num;
          if (quantity === 25) {
            span.style.gridColumn = '2';
            span.style.gridRow = '1';
            span.style.justifySelf = 'start';
            span.style.alignSelf = 'start';
          } else {
            span.style.gridColumn = '1 / span 2';
            span.style.gridRow = '2';
            span.style.justifySelf = 'center';
            span.style.alignSelf = 'center';
          }
        }
        const img = td.querySelector('img.imagem');
        if (img){
          img.alt = num;
          if (quantity === 25) {
            img.style.display = '';
            img.src = imageBase + num + '.png';
            img.onerror = function(){
              this.onerror = null;
              this.src = imageBase + num + '.jpg';
              this.onerror = function(){ this.style.display = 'none'; };
            };
          } else {
            img.style.display = 'none';
            img.removeAttribute('src');
          }
        }

        // Preencher grupo de 4 dezenas (blocos não sobrepostos) quando for opção de 25
        const grupo = td.querySelector('.grupo-25');
        if (grupo){
          if (quantity === 25){
            const totalDezenas = quantity * 4; // e.g. 25 * 4 = 100 (00..99)
            const groupWidth = Math.max(2, String(Math.max(0, totalDezenas - 1)).length);
            for (let g = 0; g < 4; g++){

              const val = i * 4 + g;
              const par = grupo.querySelector('.par' + (g+1));
              if (par){
                if (val < totalDezenas){
                  par.textContent = String(val).padStart(groupWidth, '0');
                  par.style.display = '';
                } else {
                  par.textContent = '';
                  par.style.display = 'none';
                }
              }
            }
            grupo.style.display = '';
          } else {
            // esconder o grupo quando não for a grade de 25
            grupo.style.display = 'none';
            const ps = grupo.querySelectorAll('samp');
            ps.forEach(p => { p.textContent = ''; p.style.display = 'none'; });
          }
        }

        // Injetar nome do animal quando for opção 25
        const nomeEl = td.querySelector('.nome-animal');
        if (nomeEl){
          if (quantity === 25){
            // num é '01'..'25' — converter para índice
            const idx = parseInt(num, 10);
            nomeEl.textContent = animais[idx] || '';
            nomeEl.style.display = nomeEl.textContent ? '' : 'none';
          } else {
            nomeEl.textContent = '';
            nomeEl.style.display = 'none';
          }
        }
      }

      tbody.appendChild(tr);
    }
  }
};
