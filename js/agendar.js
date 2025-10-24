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
  const forcedSlot = params.get('slot');
  const { LIST, LOOKUP } = window.CronaConfig;

  // 🔹 1. Carrega as datas disponíveis via função list_slots
  async function loadDatas(cpf) {
    dataEl.disabled = true;
    dataEl.innerHTML = '<option value="">Carregando datas...</option>';

    try {
      const res = await fetch(cpf ? `${LIST}?cpf=${cpf}` : LIST);
      const json = await res.json();

      if (!json.ok || !json.slots?.length) {
        dataEl.innerHTML =
          '<option value="">Nenhum agendamento disponível</option>';
        return;
      }

      // ✅ filtra apenas os agendamentos ativos com vagas
      const ativos = json.slots.filter(s => s.ativo && s.vagas_restantes > 0);

      if (ativos.length === 0) {
        dataEl.innerHTML =
          '<option value="">Nenhum agendamento disponível</option>';
        return;
      }

      // ✅ monta o select
      dataEl.innerHTML =
        '<option value="">Selecione uma data...</option>' +
        ativos
          .map(
            s => `
            <option value="${s.data}">
              ${s.data} — ${s.local} (${s.vagas_restantes}/${s.vagas_totais})
            </option>`,
          )
          .join('');

      dataEl.disabled = false;
    } catch (err) {
      console.error('❌ Erro ao carregar datas', err);
      dataEl.innerHTML = '<option value="">Erro ao carregar datas</option>';
    }
  }

  // Se veio com ?data=XYZ na URL → usa fixo
  if (!forcedDate) await loadDatas();
  else {
    if (forcedSlot) {
      try {
        const res = await fetch(`${LIST}?slot=${forcedSlot}`);
        const json = await res.json();

        if (json.ok && json.slot) {
          const opt = document.createElement('option');
          opt.value = json.slot.data;
          opt.textContent = `${json.slot.data} — ${json.slot.local}`;
          opt.selected = true;
          dataEl.appendChild(opt);
          dataEl.disabled = true;
        } else {
          await loadDatas();
        }
      } catch (err) {
        console.error('Erro ao carregar slot forçado:', err);
        await loadDatas();
      }
    } else if (!forcedDate) {
      await loadDatas();
    } else {
      const opt = document.createElement('option');
      opt.value = forcedDate;
      opt.textContent = forcedDate;
      opt.selected = true;
      dataEl.appendChild(opt);
      dataEl.disabled = true;
    }
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
      const resp = await fetch(LOOKUP, {
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

      // Se já cadastrado mas não assinou, ou for novo → vai pro termo
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
