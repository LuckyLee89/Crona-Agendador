document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get('nome') || '';
  const cpf = params.get('cpf') || '';
  const data = params.get('data') || '';
  const local = params.get('local') || '';

  const cpfEl = document.getElementById('cpf');
  const nomeEl = document.getElementById('nome');
  const dataEl = document.getElementById('slot_data');
  const localEl = document.getElementById('local');
  IMask(cpfEl, { mask: '000.000.000-00' });

  if (nomeEl && nome) nomeEl.value = nome;
  if (cpfEl && cpf) cpfEl.value = cpf;
  if (dataEl && data) dataEl.value = data;
  if (localEl && local) localEl.value = local;
});
