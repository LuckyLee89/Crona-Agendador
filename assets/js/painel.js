document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('linkForm');
  const resultado = document.getElementById('resultado');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const cpf = data.cpf.replace(/\D/g, '');
    const nome = encodeURIComponent(data.nome.trim());
    const local = encodeURIComponent(data.local.trim());
    const date = data.data;

    const base = window.location.origin + '/index.html';
    const link = `${base}?cpf=${cpf}&nome=${nome}&local=${local}&data=${date}`;

    resultado.innerHTML = `
      <div class="p-4 bg-gray-50 border rounded-xl">
        <p class="font-medium text-green-700">✅ Link gerado com sucesso!</p>
        <p class="mt-2 break-all text-sm text-gray-800">${link}</p>
        <button id="copyLink" class="mt-3 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded">Copiar link</button>
      </div>
    `;

    document.getElementById('copyLink').onclick = () => {
      navigator.clipboard.writeText(link);
      resultado.innerHTML += `<p class="text-green-600 mt-2">📋 Link copiado!</p>`;
    };
  });
});
