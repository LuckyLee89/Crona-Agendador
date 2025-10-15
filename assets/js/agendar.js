document.addEventListener('DOMContentLoaded', () => {
  const cpfEl = document.getElementById('cpf');
  const dataEl = document.getElementById('slot_data');
  const msgEl = document.getElementById('msg');

  IMask(cpfEl, { mask: '000.000.000-00' });

  const params = new URLSearchParams(window.location.search);
  const forcedDate = params.get('data');
  const sigParam = params.get('sig');

  const { LOOKUP, LIST } = window.CronaConfig || {};

  async function loadDatas() {
    dataEl.disabled = true;
    dataEl.innerHTML = '<option value="">Carregando datas…</option>';
    try {
      const r = await fetch(LIST);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Falha ao listar');
      const items = j.items || [];
      if (!items.length) {
        dataEl.innerHTML = '<option value="">Sem datas ativas</option>';
        return;
      }
      dataEl.innerHTML =
        '<option value="">Selecione</option>' +
        items
          .map(it => {
            const label =
              it.vagas_restantes == null
                ? `${it.data}${it.local ? ' — ' + it.local : ''}`
                : `${it.data}${it.local ? ' — ' + it.local : ''} (${
                    it.vagas_restantes
                  } vagas)`;
            return `<option value="${it.data}">${label}</option>`;
          })
          .join('');
      dataEl.disabled = false;
      if (forcedDate && [...dataEl.options].some(o => o.value === forcedDate)) {
        dataEl.value = forcedDate;
      }
    } catch (e) {
      console.error(e);
      dataEl.innerHTML = '<option value="">Erro ao carregar datas</option>';
    }
  }
  loadDatas();

  document.getElementById('consultar').addEventListener('click', async () => {
    const cpfDigits = (cpfEl.value || '').replace(/\D/g, '');
    const slot_data = (dataEl.value || '').trim();
    if (cpfDigits.length !== 11) {
      msgEl.textContent = 'CPF inválido.';
      msgEl.className = 'mt-3 text-sm text-rose-700';
      return;
    }
    if (!slot_data) {
      msgEl.textContent = 'Selecione a data do agendamento.';
      msgEl.className = 'mt-3 text-sm text-rose-700';
      return;
    }
    msgEl.textContent = 'Verificando…';
    msgEl.className = 'mt-3 text-sm text-gray-600';
    try {
      const r = await fetch(LOOKUP, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cpf: cpfDigits,
          slot_data,
          sig: sigParam || null,
        }),
      });
      const j = await r.json();
      if (j.status === 'SIGNED_FOR_DATE') {
        window.location.href = 'pages/ja-assinou.html';
        return;
      }
      const basePrefill = {
        cpf: cpfDigits,
        slot_data,
        _ts: Date.now(),
        sig: sigParam || null,
      };
      const prefill =
        j.status === 'REGISTERED_NOT_SIGNED' && j.data
          ? { ...j.data, ...basePrefill }
          : basePrefill;
      sessionStorage.setItem('prefill', JSON.stringify(prefill));
      window.location.href = 'pages/termo.html';
    } catch (e) {
      console.error(e);
      msgEl.textContent = 'Erro ao consultar. Tente novamente.';
      msgEl.className = 'mt-3 text-sm text-rose-700';
    }
  });
});
