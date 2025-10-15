// js/painel.js
// Cria um slot no Supabase e gera o link de agendamento.
// Campos: nome, cpf, data, local, vagas_restantes (opcional).
// Requer SUPABASE_URL e SUPABASE_KEY configurados em env.js.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('linkForm');
  const resultado = document.getElementById('resultado');

  const cpfEl = document.getElementById('cpf');
  if (cpfEl && window.IMask) IMask(cpfEl, { mask: '000.000.000-00' });

  // Inicializa Supabase (só se existir chave)
  const { SUPABASE_URL, SUPABASE_KEY, TABLE_SLOTS } = window.CronaConfig || {};
  const hasSupabase = !!(SUPABASE_URL && SUPABASE_KEY);
  let supabase = null;

  if (hasSupabase && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultado.innerHTML = '<p class="text-gray-500">Gerando agendamento…</p>';

    const nome  = form.nome.value.trim();
    const cpf   = (form.cpf.value || '').replace(/\D/g, '');
    const data  = form.data.value.trim();
    const local = form.local.value.trim();
    const vagas = form.vagas?.value ? parseInt(form.vagas.value, 10) : null;

    if (!nome || cpf.length !== 11 || !data || !local) {
      resultado.innerHTML = '<p class="text-red-600">Preencha os campos corretamente (CPF com 11 dígitos).</p>';
      return;
    }

    try {
      // Se o Supabase estiver configurado, insere o slot
      if (supabase) {
        const payload = { data, local, ativo: true };
        if (!Number.isNaN(vagas) && vagas !== null) payload.vagas_restantes = vagas;

        const { error } = await supabase.from(TABLE_SLOTS).insert([payload]);
        if (error) throw error;
      }

      // Gera link para o participante
      const base = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '') + 'agendar.html';
      const link =
        `${base}?cpf=${cpf}&nome=${encodeURIComponent(nome)}&data=${encodeURIComponent(data)}&local=${encodeURIComponent(local)}`;

      resultado.innerHTML = `
        <div class="bg-green-50 border border-green-300 rounded-xl p-4 text-left">
          <p class="font-semibold text-green-700 mb-2">✅ Agendamento criado!</p>
          <p class="break-all text-sm text-gray-800">${link}</p>
          <button id="copyLink" class="mt-3 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700">
            Copiar link
          </button>
          ${supabase ? '' : '<p class="mt-2 text-xs text-amber-700">Obs.: Supabase não configurado (modo demo). Gere o env.js para salvar no banco.</p>'}
        </div>`;

      document.getElementById('copyLink')?.addEventListener('click', () => {
        navigator.clipboard.writeText(link);
      });
    } catch (err) {
      console.error(err);
      resultado.innerHTML = `<p class="text-red-600">Erro ao criar agendamento: ${err.message || err}</p>`;
    }
  });
});
