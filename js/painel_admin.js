document.addEventListener('DOMContentLoaded', async () => {
  const painel = document.getElementById('painelAdmin');
  const msg = document.getElementById('msg');
  const btnFiltrar = document.getElementById('btnFiltrar');
  const btnLimpar = document.getElementById('btnLimpar');

  const supabase = window.supabase.createClient(
    window.env.SUPABASE_URL,
    window.env.SUPABASE_KEY,
  );

  const session = JSON.parse(localStorage.getItem('adminSession'));
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // ===================== LOGOUT =====================
  const btnSairAdmin = document.getElementById('btnSairAdmin');
  if (btnSairAdmin) {
    btnSairAdmin.addEventListener('click', async () => {
      btnSairAdmin.disabled = true;
      btnSairAdmin.textContent = 'Saindo...';
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }

  async function carregarSlots(filtros = {}) {
    msg.textContent = 'Carregando agendamentos...';

    // pegue o token como no painel comum, se ainda não tiver
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      msg.textContent = 'Sessão expirada — faça login novamente.';
      return;
    }

    try {
      const resp = await fetch(window.CronaConfig.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const payload = await resp.json();
      if (!payload.ok) throw new Error('Falha ao listar agendamentos');

      // aplica filtros do admin
      let rows = payload.slots || [];
      if (filtros.data) rows = rows.filter(s => s.data === filtros.data);
      if (filtros.local)
        rows = rows.filter(s =>
          s.local.toLowerCase().includes(filtros.local.toLowerCase()),
        );
      if (filtros.email)
        rows = rows.filter(s =>
          (s.email_criador || '')
            .toLowerCase()
            .includes(filtros.email.toLowerCase()),
        );

      if (!rows.length) {
        painel.innerHTML =
          '<p class="text-center text-gray-500">Nenhum agendamento encontrado.</p>';
        msg.textContent = '';
        return;
      }

      painel.innerHTML = `
      <table class="w-full border border-gray-200 rounded-xl text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-3 py-2 text-left">Data</th>
            <th class="px-3 py-2 text-left">Local</th>
            <th class="px-3 py-2 text-left">Horário</th>
            <th class="px-3 py-2 text-left">Vagas</th>
            <th class="px-3 py-2 text-center">Ativo</th>
            <th class="px-3 py-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              s => `
            <tr class="border-t">
              <td class="px-3 py-2">${s.data}</td>
              <td class="px-3 py-2">${s.local}</td>
              <td class="px-3 py-2">${s.horario_inicio} — ${s.horario_fim}</td>
              <td class="px-3 py-2">${s.vagas_restantes}/${s.vagas_totais}</td>
              <td class="px-3 py-2 text-center">
                <span class="px-2 py-1 rounded-lg text-xs ${
                  s.ativo
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }">
                  ${s.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td class="px-3 py-2 text-center flex justify-center gap-2 flex-wrap">
                ${
                  s.link
                    ? `
                  <a href="${s.link}" target="_blank" class="text-blue-600 underline text-sm">Abrir</a>
                  <button class="text-sm text-gray-600 hover:text-black copyLink" data-link="${s.link}">Copiar</button>
                `
                    : '<span class="text-gray-400 italic text-sm">Sem link</span>'
                }
                <button data-id="${s.id}" data-active="${
                s.ativo
              }" class="toggleAtivo text-sm text-blue-600 hover:underline">
                  ${s.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
      msg.textContent = '';

      // ações
      painel.querySelectorAll('.copyLink').forEach(btn => {
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(btn.dataset.link);
          btn.textContent = 'Copiado!';
          setTimeout(() => (btn.textContent = 'Copiar'), 2000);
        });
      });
      painel.querySelectorAll('.toggleAtivo').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id = e.currentTarget.dataset.id;
          const ativo = e.currentTarget.dataset.active === 'true';
          try {
            const r = await fetch(window.CronaConfig.TOGGLE_SLOT, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id, ativo: !ativo }),
            });
            const j = await r.json();
            if (!j.ok) throw new Error(j.error || 'Falha ao atualizar');
            carregarSlots(filtros);
          } catch (err) {
            console.error(err);
            alert('Erro ao atualizar status.');
          }
        });
      });
    } catch (err) {
      console.error(err);
      msg.textContent = 'Erro ao carregar agendamentos.';
    }
  }
  btnFiltrar.addEventListener('click', () => {
    const filtros = {
      data: document.getElementById('filtroData').value || null,
      local: document.getElementById('filtroLocal').value || null,
      email: document.getElementById('filtroEmail').value || null,
    };
    carregarSlots(filtros);
  });

  btnLimpar.addEventListener('click', () => {
    document.getElementById('filtroData').value = '';
    document.getElementById('filtroLocal').value = '';
    document.getElementById('filtroEmail').value = '';
    carregarSlots();
  });

  carregarSlots();
});
