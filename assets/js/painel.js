document.addEventListener('DOMContentLoaded', async () => {
  const cpfEl = document.getElementById('cpf');
  const form = document.getElementById('linkForm');
  const msg = document.getElementById('resultado');
  IMask(cpfEl, { mask: '000.000.000-00' });

  const { SUPABASE_URL, SUPABASE_KEY } = window.CronaConfig;
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.innerHTML = '<p class="text-gray-500">Gerando agendamento...</p>';

    const nome = form.nome.value.trim();
    const cpf = form.cpf.value.replace(/\D/g, '');
    const data = form.data.value.trim();
    const local = form.local.value.trim();

    try {
      const { error } = await supabase.from('slots').insert([{ data, local, ativo: true }]);
      if (error) throw error;

      const base = window.location.origin + '/Crona-Agendador/agendar.html';
      const link = `${base}?cpf=${cpf}&nome=${encodeURIComponent(nome)}&data=${encodeURIComponent(data)}&local=${encodeURIComponent(local)}`;

      msg.innerHTML = `
        <div class="bg-green-50 border border-green-300 rounded-xl p-4 text-left">
          <p class="font-semibold text-green-700 mb-2">✅ Agendamento criado com sucesso!</p>
          <p class="break-all text-sm text-gray-800">${link}</p>
          <button id="copyLink" class="mt-3 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700">Copiar link</button>
        </div>`;
      document.getElementById('copyLink').onclick = () => navigator.clipboard.writeText(link);
    } catch (err) {
      msg.innerHTML = `<p class="text-red-600">Erro ao criar agendamento: ${err.message}</p>`;
    }
  });
});
