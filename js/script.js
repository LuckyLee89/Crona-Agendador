document.addEventListener('DOMContentLoaded', () => {
  // status + ano
  const statusEl = document.getElementById('status');
  const setStatus = (msg, ok = true) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = ok
      ? 'text-sm text-emerald-700'
      : 'text-sm text-rose-700';
  };
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // máscaras
  const cpfInput = document.querySelector('input[name="cpf"]');
  const rgInput = document.querySelector('input[name="rg"]');
  const telInput = document.querySelector('input[name="telefone"]');
  const eTelInput = document.querySelector('input[name="emergencia_telefone"]');

  const cpfMask = cpfInput ? IMask(cpfInput, { mask: '000.000.000-00' }) : null;
  const rgMask = rgInput
    ? IMask(rgInput, {
        mask: '00.000.000-A',
        definitions: { A: /[0-9Xx]/ },
        prepare: s => s.toUpperCase(),
      })
    : null;
  const telMask = telInput
    ? IMask(telInput, { mask: '(00) 00000-0000' })
    : null;
  const eTelMask = eTelInput
    ? IMask(eTelInput, { mask: '(00) 00000-0000' })
    : null;

  // prefill
  try {
    const pre = JSON.parse(sessionStorage.getItem('prefill') || 'null');
    if (pre) {
      const setVal = (name, value) => {
        const el = document.querySelector(`[name="${name}"]`);
        if (el && value) el.value = value;
      };

      setVal('nome', pre.nome);
      if (cpfMask) cpfMask.unmaskedValue = pre.cpf || '';
      setVal('slot_local', pre.slot_local);
      setVal('slot_data', pre.slot_data);

      const dEl = document.getElementById('slot_data_display');
      if (dEl) {
        dEl.value = pre.slot_data || '';
        dEl.readOnly = true;
        dEl.classList.add('bg-gray-100', 'cursor-not-allowed');
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar prefill', err);
  }

  // Se vier via querystring (ex: ?data=2025-11-02&local=Sala%203)
  const params = new URLSearchParams(window.location.search);
  if (params.has('data')) {
    const dataVal = params.get('data');
    const dataEl = document.getElementById('slot_data_display');
    const hiddenData = document.getElementById('slot_data');
    if (dataEl && hiddenData) {
      dataEl.value = dataVal;
      hiddenData.value = dataVal;
      dataEl.readOnly = true;
      dataEl.classList.add('bg-gray-100', 'cursor-not-allowed');
    }
  }
  if (params.has('local')) {
    const localVal = decodeURIComponent(params.get('local'));
    const localEl = document.querySelector('[name="slot_local"]');
    if (localEl) {
      localEl.value = localVal;
      localEl.readOnly = true;
      localEl.classList.add('bg-gray-100', 'cursor-not-allowed');
    }
  }

  // assinatura
  const form = document.getElementById('termoForm');
  const btn = document.getElementById('submitBtn');
  const canvas = document.getElementById('signature');
  const clearBtn = document.getElementById('clearSig');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let hasSignature = false;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111827';
    hasSignature = false;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const getPos = e => {
    const r = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: x - r.left, y: y - r.top };
  };
  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    hasSignature = true;
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  canvas.addEventListener('pointerup', () => (drawing = false));
  clearBtn.addEventListener('click', () => {
    resizeCanvas();
    setStatus('Quadro limpo.');
  });

  // assinatura digitada
  let sigMode = 'draw';
  const radios = document.querySelectorAll('input[name="sigMode"]');
  const typedBox = document.getElementById('typedBox');
  const typedName = document.getElementById('typedName');
  const makeSigBtn = document.getElementById('makeSigBtn');

  radios.forEach(r =>
    r.addEventListener('change', () => {
      sigMode = r.value;
      resizeCanvas();
      typedBox.classList.toggle('hidden', sigMode !== 'type');
    }),
  );

  const drawTyped = name => {
    if (!name) return;
    resizeCanvas();
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '28px "Pacifico", "Allura", cursive';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    hasSignature = true;
  };
  makeSigBtn.addEventListener('click', () => {
    const name = typedName.value.trim();
    if (!name) return alert('Digite seu nome completo.');
    drawTyped(name);
  });

  typedName.addEventListener('input', () => {
    if (sigMode === 'type' && typedName.value.trim().length > 0) {
      drawTyped(typedName.value.trim());
    }
  });

  // submit
  const { SUBMIT } = window.CronaConfig;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!hasSignature) return setStatus('Assine antes de enviar.', false);
    btn.disabled = true;
    setStatus('Enviando...');

    try {
      const assinatura = canvas.toDataURL('image/png');
      const data = new FormData(form);
      const obj = {};
      for (const [k, v] of data.entries()) obj[k] = v;
      obj.assinatura = assinatura;
      obj.sigMode = sigMode;

      const resp = await fetch(SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...obj,
          created_at: new Date().toISOString(),
        }),
      });
      const j = await resp.json();
      if (!resp.ok || !j.ok) throw new Error(j.error || 'Falha ao enviar');

      setStatus('Assinado e enviado com sucesso!');
      sessionStorage.removeItem('prefill');
      setTimeout(() => (window.location.href = 'sucesso.html'), 1000);
    } catch (err) {
      console.error(err);
      setStatus('Erro ao enviar. Tente novamente.', false);
    } finally {
      btn.disabled = false;
    }
  });
});
