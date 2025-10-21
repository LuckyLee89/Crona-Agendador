document.addEventListener('DOMContentLoaded', async () => {
  const cpfEl = document.getElementById('cpf');
  const localEl = document.getElementById('slot_local');
  const dataEl = document.getElementById('slot_data');
  const msgEl = document.getElementById('msg');
  const btn = document.getElementById('consultar');

  const cpfInput = document.getElementById('cpf');
  if (window.IMask && cpfInput) IMask(cpfInput, { mask: '000.000.000-00' });

  // Params (quando vem de link)
  const params = new URLSearchParams(window.location.search);
  const forcedDate = params.get('data');
  const forcedLocal = params.get('local');
  const sigParam = params.get('sig');

  // Config Supabase
  const { SUPABASE_URL, SUPABASE_KEY } = window.CronaConfig || {};
  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );

  // Se vier via link, trava campos e preenche
  if (forcedDate) {
    dataEl.value = forcedDate;
    dataEl.disabled = true;
  } else {
    await loadDatas();
  }

  if (forcedLocal) {
    localEl.value = decodeURIComponent(forcedLocal);
    localEl.disabled = true;
  }

  async function loadDatas() {
    dataEl.disabled = true;
    dataEl.innerHTML = '<option>Carregando datas…</option>';

    const { data, error } = await supabaseClient
      .from('slots')
      .select('*')
      .eq('ativo', true)
      .order('data', { ascending: true });

    if (error || !data?.length) {
      dataEl.innerHTML = '<option>Sem datas disponíveis</option>';
      return;
    }

    dataEl.innerHTML =
      '<option value="">Selecione</option>' +
      data
        .map(
          s =>
            `<option value="${s.data}">${s.data} — ${s.local} (${
              s.vagas_restantes ?? 0
            } vagas)</option>`,
        )
        .join('');

    dataEl.disabled = false;
  }

  btn.addEventListener('click', async () => {
    const cpfDigits = cpfEl.value.replace(/\D/g, '');
    const slot_data = dataEl.value.trim();

    if (cpfDigits.length !== 11) {
      msgEl.textContent = 'CPF inválido.';
      msgEl.className = 'mt-3 text-sm text-rose-700';
      return;
    }
    if (!slot_data) {
      msgEl.textContent = 'Selecione uma data.';
      msgEl.className = 'mt-3 text-sm text-rose-700';
      return;
    }

    msgEl.textContent = 'Verificando...';
    msgEl.className = 'mt-3 text-sm text-gray-600';

    try {
      const { data, error } = await supabaseClient
        .from('participantes')
        .select('*')
        .eq('cpf', cpfDigits)
        .eq('slot_data', slot_data)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.assinado) {
        window.location.href = 'ja-assinou.html';
        return;
      }

      const prefill = {
        cpf: cpfDigits,
        slot_data,
        sig: sigParam || null,
        _ts: Date.now(),
      };
      sessionStorage.setItem('prefill', JSON.stringify(prefill));
      window.location.href = 'termo.html';
    } catch (e) {
      console.error(e);
      msgEl.textContent = 'Erro ao consultar. Tente novamente.';
      msgEl.className = 'mt-3 text-sm text-rose-700';
    }
  });
});
