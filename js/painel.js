document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('painelForm');
  const msg = document.getElementById('msg');
  const linkBox = document.getElementById('linkBox');
  const linkOut = document.getElementById('linkOut');
  const copyBtn = document.getElementById('copyBtn');

  // Lê de env.js OU de CronaConfig, o que existir
  const cfg = window.env || window.CronaConfig || {};
  const SUPABASE_URL = cfg.SUPABASE_URL;
  const SUPABASE_KEY = cfg.SUPABASE_KEY;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Máscara CPF (só aplica se IMask está carregado)
  const cpfEl = form.querySelector('input[name="cpf"]');
  if (window.IMask && cpfEl) IMask(cpfEl, { mask: '000.000.000-00' });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.textContent = '';

    const nome = form.nome.value.trim();
    const cpf = form.cpf.value.replace(/\D/g, '');
    const data = form.data.value.trim();
    const local = form.local.value.trim();
    const vagas = Number(form.vagas.value || 0);

    if (!nome || !cpf || !data || !local) {
      msg.textContent = 'Preencha todos os campos obrigatórios.';
      msg.className = 'text-rose-700';
      return;
    }

    msg.textContent = 'Salvando no Supabase...';
    msg.className = 'text-gray-600';

    const { error } = await client.from('slots').insert([
      {
        data,
        local,
        ativo: true,
        vagas_restantes: vagas,
        criador_nome: nome,
        criador_cpf: cpf,
      },
    ]);

    if (error) {
      msg.textContent = 'Erro ao salvar agendamento.';
      msg.className = 'text-rose-700';
      console.error(error);
      return;
    }

    const link = `${
      window.location.origin
    }/Crona-Agendador/agendar.html?data=${encodeURIComponent(
      data,
    )}&local=${encodeURIComponent(local)}`;

    linkOut.value = link;
    linkBox.classList.remove('hidden');
    msg.textContent = 'Agendamento criado com sucesso!';
    msg.className = 'text-emerald-700';
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(linkOut.value);
    msg.textContent = 'Link copiado!';
    msg.className = 'text-emerald-700';
  });
});
