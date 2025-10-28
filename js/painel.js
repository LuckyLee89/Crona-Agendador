document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(
    window.env.SUPABASE_URL,
    window.env.SUPABASE_KEY,
  );

  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const { data: fresh } = await supabase.auth.refreshSession();
    session = fresh?.session || null;
  }

  if (!session) {
    console.warn('⚠️ Nenhuma sessão encontrada — redirecionando para login.');
    localStorage.clear();
    window.location.href = 'login_criador.html';
    return;
  }

  const token = session.access_token;
  const userEmail = session.user.email;

  const msg = document.getElementById('resultado');
  const form = document.getElementById('linkForm');
  const tabela = document.createElement('table');
  tabela.className = 'w-full text-sm text-left border mt-4 hidden';
  const painel = document.getElementById('painelAgendamentos');

  const filtroContainer = document.createElement('div');
  filtroContainer.className = 'mt-6 w-full';
  const filtro = document.createElement('div');
  filtro.className = 'w-full space-y-4';
  filtroContainer.appendChild(filtro);
  painel.appendChild(filtroContainer);
  painel.appendChild(tabela);

  const { CREATE_SLOTS, LIST, TOGGLE_SLOT, CREATE_LINK } = window.CronaConfig;
  let intervalId = null;

  // ===================== LOGOUT =====================
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', async () => {
      btnSair.disabled = true;
      btnSair.textContent = 'Saindo...';
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }

  // ===================== FORM =====================
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
      const resp = await fetch(CREATE_SLOTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data,
          local,
          horario_inicio,
          horario_fim,
          vagas_totais,
          email_criador: userEmail,
        }),
      });

      const json = await resp.json();
      if (!json.ok) throw new Error(json.error || 'Erro ao criar agendamento.');

      // 🔗 Gera o link após criar o slot
      const slotId = json.id;
      const linkResp = await fetch(CREATE_LINK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slotId }),
      });
      const linkJson = await linkResp.json();

      if (!linkJson.ok)
        throw new Error(linkJson.error || 'Erro ao gerar link.');

      msg.textContent = 'Agendamento criado com sucesso!';
      msg.className = 'text-sm text-emerald-700 mt-2';

      await carregarSlots();
      if (!intervalId) iniciarAutoRefresh(15000);
    } catch (err) {
      console.error(err);
      msg.textContent = 'Erro ao criar agendamento.';
      msg.className = 'text-sm text-rose-600 mt-2';
    }
  });

  // ===================== FILTROS =====================
  filtro.innerHTML = `
    <div class="w-full mt-8 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <input type="date" id="filtroData"
          class="rounded-xl border-gray-300 px-4 py-2 w-full focus:ring-black focus:border-black" />
        <input type="text" id="filtroLocal" placeholder="Filtrar por local..."
          class="rounded-xl border-gray-300 px-4 py-2 w-full focus:ring-black focus:border-black" />
      </div>
      <div class="flex gap-3 w-full">
        <button id="btnFiltrar"
          class="flex-1 bg-black text-white font-semibold rounded-xl py-2 hover:bg-gray-800 transition">
          Filtrar
        </button>
        <button id="btnLimpar"
          class="flex-1 bg-gray-200 text-gray-800 font-semibold rounded-xl py-2 hover:bg-gray-300 transition">
          Limpar
        </button>
      </div>
    </div>
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

  // ===================== LISTA =====================
  async function carregarSlots(silent = false) {
    if (!silent) {
      msg.textContent = 'Carregando agendamentos...';
      msg.className = 'text-sm text-gray-600 mt-2';
    }

    try {
      const resp = await fetch(LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json();
      if (!data.ok) throw new Error('Erro ao listar agendamentos.');

      let slots = data.slots || [];
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
              }">${s.vagas_restantes}/${s.vagas_totais}</td>
              <td class="px-3 py-2 border">
                <span class="px-2 py-1 text-xs rounded-full ${
                  s.ativo
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-200 text-gray-600'
                }">${s.ativo ? 'Ativo' : 'Inativo'}</span>
              </td>
              <td class="px-3 py-2 border flex flex-wrap gap-2">
                ${
                  s.link
                    ? `
                      <a href="${s.link}" target="_blank"
                        class="text-blue-600 underline text-sm">Abrir</a>
                      <button class="text-sm text-gray-600 hover:text-black copyLink"
                        data-link="${s.link}">Copiar</button>
                    `
                    : '<span class="text-gray-400 italic text-sm">Sem link</span>'
                }
                <button class="text-sm text-red-600 hover:underline"
                  data-id="${s.id}" data-active="${s.ativo}">
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

      // Copiar link
      tabela.querySelectorAll('.copyLink').forEach(btn => {
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(btn.dataset.link);
          btn.textContent = 'Copiado!';
          setTimeout(() => (btn.textContent = 'Copiar'), 2000);
        });
      });
    } catch (err) {
      console.error('❌', err);
      msg.textContent = 'Erro ao listar agendamentos.';
      msg.className = 'text-sm text-rose-600 mt-2';
    }
  }

  async function toggleStatus(e) {
    const id = e.target.dataset.id;
    const ativo = e.target.dataset.active === 'true';
    const novoStatus = !ativo;

    msg.textContent = 'Atualizando status...';
    msg.className = 'text-sm text-gray-600 mt-2';

    try {
      const resp = await fetch(TOGGLE_SLOT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

  function iniciarAutoRefresh(intervalo = 15000) {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      console.log('🔄 Atualizando lista automaticamente...');
      carregarSlots(true);
    }, intervalo);
  }

  await carregarSlots();
  iniciarAutoRefresh(15000);
});
