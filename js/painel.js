document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('linkForm');
  const msg = document.getElementById('resultado');
  if (!form) return;

  // Supabase
  const cfg = window.env || {};
  const supa = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  // Máscara CPF
  const cpfEl = form.querySelector('input[name="cpf"]');
  if (window.IMask && cpfEl) IMask(cpfEl, { mask: '000.000.000-00' });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const cpf = (form.cpf.value || '').replace(/\D/g, '');
    const local = form.local.value.trim();
    const data = form.data.value.trim();

    if (!nome || !cpf || !local || !data) {
      msg.textContent = 'Preencha todos os campos.';
      msg.className = 'text-sm text-rose-600 mt-2';
      return;
    }

    msg.textContent = 'Gerando link...';
    msg.className = 'text-sm text-gray-600 mt-2';

    try {
      const { error } = await supa
        .from('slots')
        .insert([{ cpf, nome, local, data, ativo: true }]);
      if (error) throw error;

      // Monta link completo (ajuste o nome do repositório se necessário)
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
      copyBtn?.addEventListener('click', () => {
        navigator.clipboard.writeText(link);
        copyBtn.textContent = 'Copiado!';
        setTimeout(() => (copyBtn.textContent = 'Copiar Link'), 2000);
      });
    } catch (err) {
      console.error(err);
      msg.textContent = 'Erro ao gerar link.';
      msg.className = 'text-sm text-rose-600 mt-2';
    }
  });
});
