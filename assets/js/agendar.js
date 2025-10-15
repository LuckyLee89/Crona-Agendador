document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('agendarForm');
  const msg = document.getElementById('msg');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const cpf = form.cpf.value.trim();
    const data = form.data.value.trim();
    if (!cpf || !data) return (msg.textContent = 'Preencha CPF e data.');

    const prefill = { cpf, slot_data: data, _ts: Date.now() };
    sessionStorage.setItem('prefill', JSON.stringify(prefill));
    window.location.href = 'pages/termo.html';
  });
});
