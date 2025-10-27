(function () {
  const env = window.env || {};

  // 🧩 Endpoints públicos das Edge Functions
  const LOOKUP =
    env.LOOKUP ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/lookup_cpf';

  const LIST =
    env.LIST ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/list_slots';

  const LIST_PUBLIC =
    env.LIST_PUBLIC ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/list_slots_publico';

  const SUBMIT =
    env.SUBMIT ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/submit_consent';

  const CREATE_LINK =
    env.CREATE_LINK ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/create_link';

  const TOGGLE_SLOT =
    env.TOGGLE_SLOT ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/toggle_slot';

  const CREATE_SLOTS =
    env.CREATE_SLOTS ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/create_slots';

  // 🔑 Criação do cliente Supabase
  const { SUPABASE_URL, SUPABASE_KEY } = window.env;
  window.supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 🌐 Objeto global de configuração
  window.CronaConfig = Object.freeze({
    LOOKUP,
    LIST,
    LIST_PUBLIC,
    SUBMIT,
    CREATE_LINK,
    TOGGLE_SLOT,
    CREATE_SLOTS,
    SUPABASE_URL,
    SUPABASE_KEY,
    TABLE_SLOTS: 'slots',
  });
})();
