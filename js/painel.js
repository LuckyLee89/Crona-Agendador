document.addEventListener('DOMContentLoaded', async () => {
  // Corrigido: o id do form é "linkForm" (não "painelForm")
  const form = document.getElementById('linkForm');
  const msg = document.getElementById('resultado'); // corresponde ao <div id="resultado">
  if (!form) return;

  // Supabase config
  const cfg = window.env || {};
  const supa = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  // Máscaras
  const cpfEl = form.querySelector('input[name="cpf"]');
  if (window.IMask && cpfEl) {
    IMask(cpfEl, { mask: '000.000.000-00' });
  }

  // Evento de submit
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const cpf = cpfEl.value.replace(/\D/g, '');
    const nome = form.nome.value.trim();
    const local = form.local.value.trim();
    const data = form.data.value.trim();

    // Validação simples
    if (!cpf || !nome || !local || !data) {
      msg.textContent = 'Preencha todos os campos.';
      msg.className = 'text-sm text-rose-600 mt-2';
      return;
    }

    // Feedback inicial
    msg.textContent = 'Gerando link...';
    msg.className = 'text-sm text-gray-600 mt-2';

    try {
      // Gera link sem salvar nada no banco
      const link = `${
        window.location.origin
      }/agendar.html?cpf=${cpf}&nome=${encodeURIComponent(
        nome,
      )}&local=${encodeURIComponent(local)}&data=${encodeURIComponent(data)}`;

      // Exibe link na tela
      msg.innerHTML = `
        <p class="text-emerald-700 font-semibold mt-2">Link gerado com sucesso!</p>
        <a href="${link}" target="_blank" class="text-blue-600 underline break-all block mt-1">${link}</a>
        <button id="copyBtn" class="mt-3 px-3 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">
          Copiar Link
        </button>
      `;

      // Adiciona evento ao botão de copiar
      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(link);
          copyBtn.textContent = 'Copiado!';
          setTimeout(() => (copyBtn.textContent = 'Copiar Link'), 2000);
        });
      }

      msg.className = 'text-sm text-emerald-700 mt-2';
    } catch (err) {
      console.error(err);
      msg.textContent = 'Erro ao gerar link.';
      msg.className = 'text-sm text-rose-600 mt-2';
    }
  });
});
