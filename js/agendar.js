document.addEventListener('DOMContentLoaded', async () => {
  const cpfEl = document.getElementById('cpf');
  const dataEl = document.getElementById('slot_data');
  const msgEl = document.getElementById('msg');
  const btn = document.getElementById('consultar');

  if (window.IMask && cpfEl) IMask(cpfEl, { mask: '000.000.000-00' });

  const params = new URLSearchParams(window.location.search);
  const forcedDate = params.get('data');
  const forcedLocal = params.get('local');
  const forcedNome = params.get('nome');

  const { SUPABASE_URL, SUPABASE_KEY } = window.CronaConfig || {};
  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );

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
            `<option value="${s.data}">
          ${s.data} — ${s.local}${
              s.vagas_restantes
                ? ` (${s.vagas_restantes} vaga${
                    s.vagas_restantes > 1 ? 's' : ''
                  } restantes)`
                : ''
            }
        </option>`,
        )
        .join('');
  }

  if (!forcedDate) await loadDatas();
  else {
    const opt = document.createElement('option');
    opt.value = forcedDate;
    opt.textContent = forcedDate;
    opt.selected = true;
    dataEl.appendChild(opt);
    dataEl.disabled = true;
  }

  btn.addEventListener('click', async () => {
    const cpfDigits = cpfEl.value.replace(/\D/g, '');
    const slot_data = dataEl.value.trim();
    const slot_local = forcedLocal || '';

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
        .from('termos_assinados')
        .select('*')
        .eq('cpf', cpfDigits)
        .eq('slot_data', slot_data)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.assinado) {
        window.location.href = 'ja-assinou.html';
        return;
      }

      const prefill = {
        cpf: cpfDigits,
        nome: forcedNome || '',
        slot_data,
        slot_local,
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
