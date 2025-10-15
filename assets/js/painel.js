document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('linkForm');
  const resultado = document.getElementById('resultado');

  form.addEventListener('submit', e => {
    e.preventDefault();
    resultado.innerHTML = '<p class="text-gray-500">Gerando link...</p>';

    const data = Object.fromEntries(new FormData(form).entries());
    const cpf = data.cpf.replace(/\D/g, '');
    const nome = encodeURIComponent(data.nome.trim());
    const local = encodeURIComponent(data.local.trim());
    const date = data.data;
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('linkForm');
      const resultado = document.getElementById('resultado');

      form.addEventListener('submit', e => {
        e.preventDefault();
        resultado.innerHTML = '<p class="text-gray-500">Gerando link...</p>';

        const data = Object.fromEntries(new FormData(form).entries());
        const cpf = data.cpf.replace(/\D/g, '');
        const nome = encodeURIComponent(data.nome.trim());
        const local = encodeURIComponent(data.local.trim());
        const date = data.data;

        const base = window.location.origin + '/Crona-Agendador/agendar.html';
        const link = `${base}?cpf=${cpf}&nome=${nome}&local=${local}&data=${date}`;

        resultado.innerHTML = `
      <div class="bg-green-50 border border-green-300 rounded-xl p-4 text-left mt-4">
        <p class="font-semibold text-green-700 mb-2">✅ Link gerado com sucesso!</p>
        <p class="break-all text-sm text-gray-800">${link}</p>
        <button
          id="copyLink"
          class="mt-3 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700"
        >
          Copiar link
        </button>
      </div>
    `;

        document.getElementById('copyLink').onclick = () => {
          navigator.clipboard.writeText(link);
          resultado.innerHTML += `<p class="text-green-600 mt-2 text-sm">📋 Link copiado!</p>`;
        };
      });
    });

    const base = window.location.origin + '/Crona-Agendador/agendar.html';
    const link = `${base}?cpf=${cpf}&nome=${nome}&local=${local}&data=${date}`;

    resultado.innerHTML = `
      <div class="bg-green-50 border border-green-300 rounded-xl p-4 text-left mt-4">
        <p class="font-semibold text-green-700 mb-2">✅ Link gerado com sucesso!</p>
        <p class="break-all text-sm text-gray-800">${link}</p>
        <button
          id="copyLink"
          class="mt-3 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700"
        >
          Copiar link
        </button>
      </div>
    `;

    document.getElementById('copyLink').onclick = () => {
      navigator.clipboard.writeText(link);
      resultado.innerHTML += `<p class="text-green-600 mt-2 text-sm">📋 Link copiado!</p>`;
    };
  });
});
