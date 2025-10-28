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

    let query = supabase
      .from('slots')
      .select('*')
      .order('data', { ascending: true });

    if (filtros.data) query = query.eq('data', filtros.data);
    if (filtros.local) query = query.ilike('local', `%${filtros.local}%`);
    if (filtros.email)
      query = query.ilike('email_criador', `%${filtros.email}%`);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      msg.textContent = 'Erro ao carregar agendamentos.';
      return;
    }

    if (!data || data.length === 0) {
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
          ${data
            .map(
              slot => `
            <tr class="border-t">
              <td class="px-3 py-2">${slot.data}</td>
              <td class="px-3 py-2">${slot.local}</td>
              <td class="px-3 py-2">${slot.horario_inicio} — ${
                slot.horario_fim
              }</td>
              <td class="px-3 py-2">${slot.vagas_restantes}/${
                slot.vagas_totais
              }</td>
              <td class="px-3 py-2 text-center">
                <span class="px-2 py-1 rounded-lg text-xs ${
                  slot.ativo
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }">
                  ${slot.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td class="px-3 py-2 text-center flex justify-center gap-2 flex-wrap">
                ${
                  slot.link
                    ? `
                      <a href="${slot.link}" target="_blank"
                        class="text-blue-600 underline text-sm">Abrir</a>
                      <button class="text-sm text-gray-600 hover:text-black copyLink"
                        data-link="${slot.link}">Copiar</button>
                    `
                    : '<span class="text-gray-400 italic text-sm">Sem link</span>'
                }
                <button
                  data-id="${slot.id}"
                  class="toggleAtivo text-sm text-blue-600 hover:underline"
                >
                  ${slot.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    `;
    msg.textContent = '';

    document.querySelectorAll('.toggleAtivo').forEach(btn =>
      btn.addEventListener('click', async e => {
        const id = e.target.dataset.id;
        const slot = data.find(s => String(s.id) === String(id));
        if (!slot) {
          alert('Erro: agendamento não encontrado.');
          return;
        }
        const novoStatus = !slot.ativo;
        try {
          const resp = await fetch(
            'https://qrtjuypghjbyrbepwvbb.functions.supabase.co/functions/v1/toggle_slot',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: slot.id, ativo: novoStatus }),
            },
          );
          const result = await resp.json();
          if (!result.ok) {
            console.error(result.error);
            alert('Erro ao atualizar status.');
          } else {
            alert(
              `Agendamento ${
                novoStatus ? 'ativado' : 'desativado'
              } com sucesso!`,
            );
            carregarSlots();
          }
        } catch (err) {
          console.error('Erro ao chamar função toggle_slot:', err);
          alert('Erro de conexão com o servidor.');
        }
      }),
    );

    // Copiar link
    document.querySelectorAll('.copyLink').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.link);
        btn.textContent = 'Copiado!';
        setTimeout(() => (btn.textContent = 'Copiar'), 2000);
      });
    });
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
