document.addEventListener('DOMContentLoaded', () => {
  // ---------------- Status + Ano ----------------
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

  // ---------------- Máscaras ----------------
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

  // Helper para aplicar máscara
  const setWithMask = (name, val) => {
    const el = document.querySelector(`[name="${name}"]`);
    if (!el || val === undefined || val === null || val === '') return;
    const v = String(val);

    if (name === 'cpf' && cpfMask) {
      cpfMask.unmaskedValue = v.replace(/\D/g, '');
      return;
    }
    if (name === 'telefone' && telMask) {
      telMask.unmaskedValue = v.replace(/\D/g, '');
      return;
    }
    if (name === 'emergencia_telefone' && eTelMask) {
      eTelMask.unmaskedValue = v.replace(/\D/g, '');
      return;
    }
    if (name === 'rg' && rgMask) {
      rgMask.unmaskedValue = v.replace(/[^0-9X]/gi, '').toUpperCase();
      return;
    }
    el.value = v;
  };

  // ---------------- PREFILL (sessionStorage) ----------------
  let pre = null;
  try {
    pre = JSON.parse(sessionStorage.getItem('prefill') || 'null');
    if (pre) {
      setWithMask('cpf', pre.cpf);
      setWithMask('nome', pre.nome);
      setWithMask('rg', pre.rg);
      setWithMask('data_nascimento', pre.data_nascimento);
      setWithMask('email', pre.email);
      setWithMask('telefone', pre.telefone);
      setWithMask('emergencia_nome', pre.emergencia_nome);
      setWithMask('emergencia_telefone', pre.emergencia_telefone);
      setWithMask('condicoes_saude', pre.condicoes_saude);
      setWithMask('medicamentos', pre.medicamentos);
      setWithMask('alergias', pre.alergias);

      // data e local vindos do link
      const d = pre.slot_data || pre.cerimonia_data || '';
      const l = pre.slot_local || pre.cerimonia_local || '';
      const displayEl = document.getElementById('cerimonia_data_display');
      const hiddenEl = document.getElementById('cerimonia_data');
      if (displayEl) displayEl.value = d;
      if (hiddenEl) hiddenEl.value = d;
      setWithMask('cerimonia_local', l);

      cpfMask?.updateValue();
      telMask?.updateValue();
      eTelMask?.updateValue();
      rgMask?.updateValue();
    }
  } catch (e) {
    console.warn('Prefill inválido', e);
    pre = null;
  }

  // ---------------- Elementos principais ----------------
  const form = document.getElementById('termoForm');
  const btn = document.getElementById('submitBtn');
  const canvas = document.getElementById('signature');
  const clearBtn = document.getElementById('clearSig');
  if (!form || !btn || !canvas || !clearBtn) return;

  // ---------------- Assinatura (canvas) ----------------
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let hasSignature = false;

  function sizeCanvasToCSS() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    hasSignature = false;
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX ?? 0;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY ?? 0;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault?.();
    drawing = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    hasSignature = true;
    setStatus('Desenhando...');
  }

  function moveDraw(e) {
    if (!drawing) return;
    e.preventDefault?.();
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    drawing = false;
    if (hasSignature) setStatus('Assinatura registrada.');
  }

  canvas.addEventListener('pointerdown', startDraw);
  canvas.addEventListener('pointermove', moveDraw);
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw);
  window.addEventListener('resize', sizeCanvasToCSS);
  clearBtn.addEventListener('click', () => {
    sizeCanvasToCSS();
    setStatus('Quadro limpo.');
  });

  sizeCanvasToCSS();

  // ---------------- Assinatura digitada ----------------
  let sigMode = 'draw';
  const radios = document.querySelectorAll('input[name="sigMode"]');
  const typedBox = document.getElementById('typedBox');
  const typedName = document.getElementById('typedName');
  const makeSigBtn = document.getElementById('makeSigBtn');

  if (radios.length) {
    radios.forEach(r =>
      r.addEventListener('change', () => {
        sigMode = r.value;
        sizeCanvasToCSS();
        if (typedBox) typedBox.classList.toggle('hidden', sigMode !== 'type');
      }),
    );
  }

  function drawTyped(name) {
    if (!name) return;
    sizeCanvasToCSS();
    const size = Math.max(20, Math.floor(canvas.height * 0.3));
    const fontStack = `"Pacifico", "Allura", cursive`;
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size}px ${fontStack}`;
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    hasSignature = true;
    setStatus('Assinatura gerada pelo nome.');
  }

  if (makeSigBtn && typedName) {
    makeSigBtn.addEventListener('click', () => {
      const name = typedName.value.trim();
      if (!name) return alert('Digite seu nome completo.');
      drawTyped(name);
    });
  }

  // ---------------- Form Helpers ----------------
  function formToJSON(formEl) {
    const fd = new FormData(formEl);
    const obj = {};
    for (const [k, v] of fd.entries()) obj[k] = v;
    obj.aceitou_termo = !!fd.get('aceitou_termo');
    obj.consentiu_lgpd = !!fd.get('consentiu_lgpd');
    return obj;
  }

  // ---------------- SUBMIT ----------------
  form.addEventListener('submit', async e => {
    e.preventDefault();
    setStatus('Validando...');

    if (sigMode === 'type' && typedName && !typedName.value.trim()) {
      setStatus('Digite o nome e clique em "Gerar assinatura".', false);
      return;
    }
    if (!hasSignature) {
      setStatus('Assine no quadro ou gere sua assinatura digitada.', false);
      return;
    }

    const data = formToJSON(form);
    if (!data.nome || !data.cpf || !data.email) {
      setStatus('Preencha os campos obrigatórios.', false);
      return;
    }

    btn.disabled = true;
    setStatus('Enviando...');

    try {
      const pngDataUrl = canvas.toDataURL('image/png');
      const cpfDigits = data.cpf.replace(/\D/g, '');

      const payload = {
        participante: {
          cpf: cpfDigits,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          rg: data.rg,
        },
        termo: {
          cerimonia_data: data.cerimonia_data,
          cerimonia_local: data.cerimonia_local,
          aceitou_termo: !!data.aceitou_termo,
          consentiu_lgpd: !!data.consentiu_lgpd,
          signature_type: sigMode,
        },
        assinatura_png_base64: pngDataUrl,
      };

      const FN_SUBMIT =
        'https://msroqrlrwtvylxecbmgm.functions.supabase.co/submit_termo';
      const resp = await fetch(FN_SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await resp.json();
      if (!resp.ok || !j.ok) throw new Error(j.error || 'Falha ao enviar');

      setStatus('Assinado e enviado com sucesso!');
      sessionStorage.removeItem('prefill');
      setTimeout(() => (window.location.href = 'sucesso.html'), 800);
    } catch (err) {
      console.error(err);
      setStatus('Erro ao enviar. Tente novamente.', false);
    } finally {
      btn.disabled = false;
    }
  });
});
