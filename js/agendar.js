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

  const { SUPABASE_FUNCTIONS_URL } = window.CronaConfig || {};

  // 🔹 1. Carrega as datas disponíveis via Edge Function
  async function loadDatas(cpf) {
    dataEl.disabled = true;
    dataEl.innerHTML = '<option>Carregando datas…</option>';

    try {
      const res = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/list_slots${cpf ? `?cpf=${cpf}` : ''}`,
      );
      const json = await res.json();

      if (!json.ok || !json.items?.length) {
        dataEl.innerHTML = '<option>Sem datas disponíveis</option>';
        return;
      }

      dataEl.innerHTML =
        '<option value="">Selecione</option>' +
        json.items
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
      dataEl.disabled = false;
    } catch (err) {
      console.error(err);
      dataEl.innerHTML = '<option>Erro ao carregar</option>';
    }
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

  // 🔹 2. Clique do botão "Continuar"
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
      // 🧠 Consulta a Edge Function lookup_cpf
      const resp = await fetch(`${SUPABASE_FUNCTIONS_URL}/lookup_cpf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfDigits, slot_data }),
      });

      const result = await resp.json();
      console.log('[lookup_cpf]', result);

      if (result.status === 'SIGNED_FOR_DATE') {
        window.location.href = 'ja-assinou.html';
        return;
      }

      // Se já cadastrado mas não assinou, ou for novo → ir para termo
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
