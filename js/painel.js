document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('painelForm');
  const msg = document.getElementById('msg');
  const linkBox = document.getElementById('linkBox');
  const linkOut = document.getElementById('linkOut');
  const copyBtn = document.getElementById('copyBtn');

  const cfg = window.env || {};
  const supa = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  // Máscaras
  const cpfEl = form.querySelector('input[name="cpf"]');
  const dataEl = form.querySelector('input[name="data"]');
  if (window.IMask) {
    IMask(cpfEl, { mask: '000.000.000-00' });
    IMask(dataEl, { mask: '00/00/0000' });
  }

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

    msg.textContent = 'Salvando...';
    msg.className = 'text-sm text-gray-600 mt-2';

    try {
      const { error } = await supa
        .from('slots')
        .insert([{ cpf, nome, local, data, ativo: true }]);
      if (error) throw error;

      const link = `${
        window.location.origin
      }/agendar.html?cpf=${cpf}&nome=${encodeURIComponent(
        nome,
      )}&local=${encodeURIComponent(local)}&data=${encodeURIComponent(data)}`;
      linkOut.href = link;
      linkOut.textContent = link;
      linkBox.classList.remove('hidden');
      msg.textContent = 'Agendamento criado com sucesso!';
      msg.className = 'text-sm text-emerald-600 mt-2';
    } catch (err) {
      msg.textContent = 'Erro ao salvar agendamento.';
      msg.className = 'text-sm text-rose-600 mt-2';
      console.error(err);
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(linkOut.textContent);
    copyBtn.textContent = 'Copiado!';
    setTimeout(() => (copyBtn.textContent = 'Copiar Link'), 2000);
  });
});
