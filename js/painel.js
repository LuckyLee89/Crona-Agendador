document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('linkForm');
  const msg = document.getElementById('resultado');
  if (!form) return;

  const cfg = window.env || {};
  const supa = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  const cpfEl = form.querySelector('input[name="cpf"]');
  if (window.IMask && cpfEl) IMask(cpfEl, { mask: '000.000.000-00' });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const cpf = cpfEl.value.replace(/\D/g, '');
    const nome = form.nome.value.trim();
    const local = form.local.value.trim();
    const data = form.data.value.trim();

    if (!cpf || !nome || !local || !data) {
      msg.textContent = 'Preencha todos os campos.';
      msg.className = 'text-sm text-rose-600 mt-2';
      return;
    }

    msg.textContent = 'Gerando link...';
    msg.className = 'text-sm text-gray-600 mt-2';

    try {
      // 🔧 Caminho completo (ajuste o nome conforme o repositório no GitHub Pages)
      const base = `${window.location.origin}/Crona-Agendador`;
      const link = `${base}/agendar.html?cpf=${cpf}&nome=${encodeURIComponent(
        nome,
      )}&local=${encodeURIComponent(local)}&data=${encodeURIComponent(data)}`;

      msg.innerHTML = `
        <p class="text-emerald-700 font-semibold mt-2">Link gerado com sucesso!</p>
        <a href="${link}" target="_blank" class="text-blue-600 underline break-all block mt-1">${link}</a>
        <button id="copyBtn" class="mt-3 px-3 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">
          Copiar Link
        </button>
      `;

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
