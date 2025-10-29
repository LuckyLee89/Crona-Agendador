// ======================== TERMO.JS (versão depurável corrigida) ========================
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Termo.js iniciado');

  // status + ano
  const statusEl = document.getElementById('status');
  const setStatus = (msg, ok = true) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = ok
      ? 'text-sm text-emerald-700'
      : 'text-sm text-rose-700';
    console.log('📢 STATUS:', msg);
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

  console.log('🧩 Máscaras aplicadas:', { cpfMask, rgMask, telMask, eTelMask });

  // prefill (sessionStorage)
  // ===== PREFILL COM DEBUG =====
  try {
    const pre = JSON.parse(sessionStorage.getItem('prefill') || 'null');
    console.log('🧠 Prefill encontrado no sessionStorage:', pre);

    if (pre) {
      const setVal = (name, value) => {
        const el = document.querySelector(`[name="${name}"]`);
        if (el) {
          el.value = value ?? '';
          console.log(`✅ Campo preenchido: ${name} =`, value);
        } else {
          console.warn(`⚠️ Campo não encontrado no HTML: ${name}`);
        }
      };

      // Campos básicos
      setVal('nome', pre.nome);
      if (cpfMask) cpfMask.unmaskedValue = pre.cpf || '';
      setVal('rg', pre.rg);
      setVal('email', pre.email);
      setVal('data_nascimento', pre.data_nascimento);
      setVal('telefone', pre.telefone);
      setVal('emergencia_nome', pre.emergencia_nome);
      setVal('emergencia_telefone', pre.emergencia_telefone);
      setVal('condicoes_saude', pre.condicoes_saude);
      setVal('medicamentos', pre.medicamentos);
      setVal('alergias', pre.alergias);
      setVal('slot_local', pre.slot_local);

      // Data (campo visual e oculto)
      const dEl = document.getElementById('slot_data_display');
      const hiddenData = document.getElementById('slot_data');
      if (dEl && hiddenData) {
        dEl.value = pre.slot_data || '';
        hiddenData.value = pre.slot_data || '';
        dEl.readOnly = true;
        dEl.classList.add('bg-gray-100', 'cursor-not-allowed');
      }

      console.log('✅ Todos os campos tentados preencher.');
    } else {
      console.log('❌ Nenhum prefill encontrado no sessionStorage');
    }
  } catch (err) {
    console.error('💥 Erro ao carregar prefill:', err);
  }

  // query params (data/local)
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

  // assinatura canvas
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

  // ===================== AUTOPREENCHIMENTO POR CPF =====================
  cpfInput.addEventListener('blur', async () => {
    const cpf = cpfMask.unmaskedValue;
    const slotData = document.querySelector('[name="slot_data"]').value;
    if (!cpf || cpf.length !== 11 || !slotData) return;

    setStatus('Buscando dados do participante...');
    console.log('🔎 Buscando CPF:', cpf, 'para data', slotData);

    try {
      const resp = await fetch(
        'https://qrtjuypghjbyrbepwvbb.functions.supabase.co/functions/v1/lookup_cpf',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf, slot_data: slotData }),
        },
      );

      const result = await resp.json();
      console.log('🔍 lookup_cpf RESULTADO:', result);

      if (result.status === 'SIGNED_FOR_DATE') {
        setStatus('Este CPF já assinou o termo para esta data.', false);
        document.getElementById('submitBtn').disabled = true;
        return;
      }

      if (result.status === 'SIGNED_PREVIOUSLY' && result.data) {
        const p = result.data;
        console.log('📄 Dados recebidos (SIGNED_PREVIOUSLY):', p);

        setTimeout(() => {
          const safeSet = (name, value) => {
            const el = document.querySelector(`[name="${name}"]`);
            if (el && value) el.value = value;
          };

          safeSet('nome', p.nome);
          safeSet('rg', p.rg);
          safeSet('email', p.email);
          safeSet('emergencia_nome', p.emergencia_nome);
          safeSet('condicoes_saude', p.condicoes_saude);
          safeSet('medicamentos', p.medicamentos);
          safeSet('alergias', p.alergias);
          safeSet('data_nascimento', p.data_nascimento);

          // Campos com máscara
          if (telMask && p.telefone) {
            telMask.value = p.telefone;
            console.log('📞 Telefone preenchido via máscara:', p.telefone);
          }
          if (eTelMask && p.emergencia_telefone) {
            eTelMask.value = p.emergencia_telefone;
            console.log(
              '🚑 Telefone emergência via máscara:',
              p.emergencia_telefone,
            );
          }
          if (cpfMask && p.cpf) {
            cpfMask.value = p.cpf;
            console.log('🪪 CPF confirmado:', p.cpf);
          }

          setStatus(
            'Dados carregados automaticamente do último termo assinado.',
            true,
          );
        }, 200);

        return;
      }

      if (result.status === 'REGISTERED_NOT_SIGNED' && result.data) {
        const p = result.data;
        console.log('🟢 Participante existente, sem termo:', p);
        document.querySelector('[name="nome"]').value = p.nome || '';
        document.querySelector('[name="rg"]').value = p.rg || '';
        document.querySelector('[name="email"]').value = p.email || '';
        if (telMask && p.telefone) telMask.value = p.telefone;
        if (eTelMask && p.emergencia_telefone)
          eTelMask.value = p.emergencia_telefone;
        document.querySelector('[name="condicoes_saude"]').value =
          p.condicoes_saude || '';
        document.querySelector('[name="medicamentos"]').value =
          p.medicamentos || '';
        document.querySelector('[name="alergias"]').value = p.alergias || '';
        setStatus('Dados carregados automaticamente.', true);
      } else {
        setStatus('CPF não encontrado. Preencha os dados normalmente.', false);
        console.log('⚪ Novo participante, sem registros prévios.');
      }
    } catch (err) {
      console.error('❌ Erro lookup_cpf:', err);
      setStatus('Erro ao buscar CPF.', false);
    }
  });

  // submit
  const { SUBMIT } = window.CronaConfig;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const localInput = form.querySelector('[name="slot_local"]');
    if (!localInput.value.trim()) {
      return setStatus(
        'Informe o local do agendamento antes de enviar.',
        false,
      );
    }

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

      console.log('📤 Enviando termo:', obj);

      const resp = await fetch(SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...obj,
          created_at: new Date().toISOString(),
        }),
      });

      const j = await resp.json();
      console.log('✅ Resposta envio:', j);

      if (!resp.ok || !j.ok) throw new Error(j.error || 'Falha ao enviar');

      setStatus('Assinado e enviado com sucesso!');
      sessionStorage.removeItem('prefill');
      setTimeout(() => (window.location.href = 'sucesso.html'), 1000);
    } catch (err) {
      console.error('❌ Erro ao enviar termo:', err);
      setStatus('Erro ao enviar. Tente novamente.', false);
    } finally {
      btn.disabled = false;
    }
  });
});
