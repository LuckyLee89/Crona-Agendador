import { log, warn, error } from './loggerHelper.js';

document.addEventListener('DOMContentLoaded', async () => {
  const cpfEl = document.getElementById('cpf');
  const dataEl = document.getElementById('slot_data');
  const msgEl = document.getElementById('msg');
  const btn = document.getElementById('consultar');

  if (window.IMask && cpfEl) IMask(cpfEl, { mask: '000.000.000-00' });

  const params = new URLSearchParams(window.location.search);
  const forcedDate = params.get('data');
  const forcedLocal = params.get('local');
  const forcedSlot = params.get('slot');

  const { LIST_PUBLIC, LOOKUP } = window.CronaConfig;

  async function loadDatas(cpf) {
    dataEl.disabled = true;
    dataEl.innerHTML = '<option value="">Carregando datas...</option>';

    try {
      const res = await fetch(cpf ? `${LIST_PUBLIC}?cpf=${cpf}` : LIST_PUBLIC);
      const json = await res.json();

      if (!json.ok || !json.slots?.length) {
        dataEl.innerHTML =
          '<option value="">Nenhum agendamento disponível</option>';
        return;
      }

      const ativos = json.slots.filter(s => s.ativo && s.vagas_restantes > 0);
      if (ativos.length === 0) {
        dataEl.innerHTML =
          '<option value="">Nenhum agendamento disponível</option>';
        return;
      }

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
      error('❌ Erro ao carregar datas', err);
      dataEl.innerHTML = '<option value="">Erro ao carregar datas</option>';
    }
  }

  if (forcedSlot) {
    try {
      const res = await fetch(`${LIST_PUBLIC}?slot=${forcedSlot}`);
      const json = await res.json();

      if (json.ok && json.slots?.length > 0) {
        const s = json.slots[0];
        dataEl.innerHTML = `<option value="${s.data}" selected>
          ${s.data} — ${s.local} (${s.vagas_restantes || s.vagas_totais})
        </option>`;
        dataEl.disabled = true;

        sessionStorage.setItem(
          'slotInfo',
          JSON.stringify({
            data: s.data,
            local: s.local,
            horario_inicio: s.horario_inicio,
            horario_fim: s.horario_fim,
          }),
        );
      } else {
        await loadDatas();
      }
    } catch (err) {
      error('Erro ao carregar slot forçado:', err);
      await loadDatas();
    }
  } else if (forcedDate) {
    const opt = document.createElement('option');
    opt.value = forcedDate;
    opt.textContent = forcedDate;
    opt.selected = true;
    dataEl.appendChild(opt);
    dataEl.disabled = true;
  } else {
    await loadDatas();
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
      const resp = await fetch(LOOKUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfDigits, slot_data }),
      });

      const result = await resp.json();
      log('[lookup_cpf]', result);

      if (result.status === 'SIGNED_FOR_DATE') {
        window.location.href = 'ja-assinou.html';
        return;
      }

      const slotInfo = JSON.parse(sessionStorage.getItem('slotInfo') || '{}');
      let prefill = {
        cpf: cpfDigits,
        slot_data: slotInfo.data || slot_data,
        slot_local: slotInfo.local || slot_local,
        horario_inicio: slotInfo.horario_inicio || '',
        horario_fim: slotInfo.horario_fim || '',
        _ts: Date.now(),
      };

      if (result.data) {
        prefill = { ...prefill, ...result.data };
      }

      sessionStorage.setItem('prefill', JSON.stringify(prefill));
      window.location.href = 'termo.html';
    } catch (e) {
      error(e);
      msgEl.textContent = 'Erro ao consultar. Tente novamente.';
      msgEl.className = 'mt-3 text-sm text-rose-700';
    }
  });
});
