// js/agendar.js
// Página de confirmação: lê os parâmetros (cpf, nome, data, local),
// aplica máscara e trava data/local. Continua seu fluxo para LOOKUP/LIST.
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get('nome') || '';
  const cpf = params.get('cpf') || '';
  const data = params.get('data') || '';
  const local = params.get('local') || '';

  const cpfEl   = document.getElementById('cpf');
  const nomeEl  = document.getElementById('nome');
  const dataEl  = document.getElementById('slot_data');
  const localEl = document.getElementById('local');
  const msgEl   = document.getElementById('msg');

  // Máscara
  if (cpfEl && window.IMask) IMask(cpfEl, { mask: '000.000.000-00' });

  // Preenche
  if (nomeEl && nome) nomeEl.value = nome;
  if (cpfEl  && cpf)  cpfEl.value  = cpf;
  if (dataEl && data) { dataEl.value = data; dataEl.setAttribute('readonly', 'readonly'); dataEl.classList.add('bg-gray-100'); }
  if (localEl && local){ localEl.value = local; localEl.setAttribute('readonly', 'readonly'); localEl.classList.add('bg-gray-100'); }

  // Mantém integração atual: apenas valida campos antes de seguir
  const btn = document.getElementById('consultar');
  btn?.addEventListener('click', () => {
    const cpfDigits = (cpfEl?.value || '').replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      if (msgEl) { msgEl.textContent = 'CPF inválido.'; msgEl.className = 'mt-3 text-sm text-rose-700'; }
      return;
    }
    if (!data) {
      if (msgEl) { msgEl.textContent = 'Data inválida.'; msgEl.className = 'mt-3 text-sm text-rose-700'; }
      return;
    }
    // O restante do fluxo (lookup -> prefill -> redirecionar) é feito em seu script original.
  });
});
