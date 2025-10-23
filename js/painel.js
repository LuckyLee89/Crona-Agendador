document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('linkForm');
  const msg = document.getElementById('resultado');
  const filtro = document.createElement('div');
  filtro.className = 'flex flex-col md:flex-row gap-3 mt-8';
  const tabela = document.createElement('table');
  tabela.className = 'w-full text-sm text-left border mt-4 hidden';
  document.querySelector('.bg-white.rounded-lg').appendChild(filtro);
  document.getElementById('painelAgendamentos').appendChild(tabela);

  const { CREATE_SLOT, LIST, TOGGLE_SLOT } = window.CronaConfig;

  const supa = window.supa;

  let intervalId = null; // para o auto-refresh

  // ===================== FORM: criar agendamento =====================
  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.textContent = 'Criando agendamento...';
    msg.className = 'text-sm text-gray-600 mt-2';

    const data = form.data.value.trim();
    const local = form.local.value.trim();
    const horario_inicio = form.horario_inicio?.value || '09:00';
    const horario_fim = form.horario_fim?.value || '10:00';
    const vagas_totais = parseInt(form.vagas?.value || '1', 10);

    try {
      const resp = await fetch(CREATE_SLOT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.CronaConfig.SUPABASE_KEY}`,
          apikey: window.CronaConfig.SUPABASE_KEY,
        },
        body: JSON.stringify({
          data,
          local,
          horario_inicio,
          horario_fim,
          vagas_totais,
        }),
      });

      const json = await resp.json();
      if (!json.ok) throw new Error(json.error || 'Erro ao criar agendamento.');

      msg.innerHTML = `
  <div id="linkBox" class="p-3 border border-emerald-200 bg-emerald-50 rounded-lg mt-4">
    <p class="text-emerald-700 font-semibold">Agendamento criado com sucesso!</p>
    <a href="${json.link}" target="_blank"
       class="text-blue-600 underline break-all block mt-1">${json.link}</a>
    <button id="copyBtn" 
      class="mt-3 px-3 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">
      Copiar Link
    </button>
  </div>
`;
      document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(json.link);
        msg.querySelector('#copyBtn').textContent = 'Copiado!';
      });

      // Aguarda 1s antes de atualizar lista, sem apagar o link
      setTimeout(() => carregarSlots(), 10000);

      await carregarSlots();
    } catch (err) {
      console.error(err);
      msg.textContent = 'Erro ao criar agendamento.';
      msg.className = 'text-sm text-rose-600 mt-2';
    }
  });

  // ===================== FILTROS =====================
  filtro.innerHTML = `
    <input type="date" id="filtroData"
      class="rounded-lg border-gray-300 px-3 py-2 flex-1 focus:ring-black focus:border-black"
    />
    <input type="text" id="filtroLocal"
      placeholder="Filtrar por local..."
      class="rounded-lg border-gray-300 px-3 py-2 flex-1 focus:ring-black focus:border-black"
    />
    <button id="btnFiltrar"
      class="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800">Filtrar</button>
    <button id="btnLimpar"
      class="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 hover:bg-gray-300">Limpar</button>
  `;

  const btnFiltrar = document.getElementById('btnFiltrar');
  const btnLimpar = document.getElementById('btnLimpar');
  const filtroData = document.getElementById('filtroData');
  const filtroLocal = document.getElementById('filtroLocal');

  btnFiltrar.addEventListener('click', carregarSlots);
  btnLimpar.addEventListener('click', () => {
    filtroData.value = '';
    filtroLocal.value = '';
    carregarSlots();
  });

  // ===================== FUNÇÃO: carregar lista =====================
  async function carregarSlots(silent = false) {
    if (!silent) {
      msg.textContent = 'Carregando agendamentos...';
      msg.className = 'text-sm text-gray-600 mt-2';
    }

    try {
      const resp = await fetch(LIST);
      const data = await resp.json();
      if (!data.ok) throw new Error('Erro ao listar agendamentos.');

      let slots = data.slots || [];

      // filtros locais
      if (filtroData.value)
        slots = slots.filter(s => s.data === filtroData.value);
      if (filtroLocal.value)
        slots = slots.filter(s =>
          s.local.toLowerCase().includes(filtroLocal.value.toLowerCase()),
        );

      if (slots.length === 0) {
        tabela.classList.add('hidden');
        msg.textContent = 'Nenhum agendamento encontrado.';
        msg.className = 'text-sm text-gray-500 mt-2';
        return;
      }

      msg.textContent = '';
      tabela.classList.remove('hidden');

      tabela.innerHTML = `
        <thead class="bg-gray-100 text-gray-800">
          <tr>
            <th class="px-3 py-2 border">Data</th>
            <th class="px-3 py-2 border">Local</th>
            <th class="px-3 py-2 border">Horário</th>
            <th class="px-3 py-2 border">Vagas</th>
            <th class="px-3 py-2 border">Status</th>
            <th class="px-3 py-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${slots
            .map(
              s => `
              <tr class="hover:bg-gray-50 transition">
                <td class="px-3 py-2 border">${s.data}</td>
                <td class="px-3 py-2 border">${s.local}</td>
                <td class="px-3 py-2 border">${s.horario_inicio}–${
                s.horario_fim
              }</td>
                <td class="px-3 py-2 border font-semibold ${
                  s.vagas_restantes === 0 ? 'text-rose-600' : 'text-emerald-700'
                }">
                  ${s.vagas_restantes}/${s.vagas_totais}
                </td>
                <td class="px-3 py-2 border">
                  <span class="px-2 py-1 text-xs rounded-full ${
                    s.ativo
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }">
                    ${s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td class="px-3 py-2 border flex flex-wrap gap-2">
                  <a href="${s.link}" target="_blank"
                    class="text-blue-600 underline text-sm">Abrir</a>
                  <button class="text-sm text-red-600 hover:underline" data-id="${
                    s.id
                  }" data-active="${s.ativo}">
                    ${s.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>`,
            )
            .join('')}
        </tbody>
      `;

      tabela
        .querySelectorAll('button[data-id]')
        .forEach(btn => btn.addEventListener('click', toggleStatus));
    } catch (err) {
      console.error('❌', err);
      msg.textContent = 'Erro ao listar agendamentos.';
      msg.className = 'text-sm text-rose-600 mt-2';
    }
  }
  // ===================== TOGGLE STATUS (via Edge Function segura) =====================
  async function toggleStatus(e) {
    const id = e.target.dataset.id;
    const ativo = e.target.dataset.active === 'true';
    const novoStatus = !ativo;

    msg.textContent = 'Atualizando status...';
    msg.className = 'text-sm text-gray-600 mt-2';

    try {
      const resp = await fetch(window.CronaConfig.TOGGLE_SLOT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo: novoStatus }),
      });

      const json = await resp.json();
      if (!json.ok) throw new Error(json.error || 'Erro ao alterar status.');

      msg.textContent = `Agendamento ${
        novoStatus ? 'ativado' : 'desativado'
      } com sucesso!`;
      msg.className = 'text-sm text-emerald-700 mt-2';
      await carregarSlots();
    } catch (err) {
      console.error('❌ Erro ao alterar status:', err);
      msg.textContent = 'Erro ao alterar status.';
      msg.className = 'text-sm text-rose-600 mt-2';
    }
  }

  // ===================== AUTO REFRESH =====================
  async function iniciarAutoRefresh(intervalo = 15000) {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      console.log('🔄 Atualizando lista automaticamente...');
      carregarSlots(true);
    }, intervalo);
  }

  // inicialização
  await carregarSlots();
  iniciarAutoRefresh(15000); // 15 segundos
});
