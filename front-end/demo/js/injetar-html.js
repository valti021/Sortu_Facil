// injetar-html.js
document.addEventListener('DOMContentLoaded', function() {
    fetch('demo/index.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const demoDiv = doc.querySelector('.demo');
            document.getElementById('mensagem-demo').appendChild(demoDiv);
        });
});