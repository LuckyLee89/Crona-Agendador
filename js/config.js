(function () {
  const env = window.env || {};

  // Endpoints de Edge Functions (públicos)
  const LOOKUP =
    env.LOOKUP ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/lookup_cpf';
  const LIST =
    env.LIST ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/list_slots';
  const SUBMIT =
    env.SUBMIT ||
    'https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/submit_consent';

  const { SUPABASE_URL, SUPABASE_KEY } = window.env;
  window.supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  window.CronaConfig = Object.freeze({
    LOOKUP,
    LIST,
    SUBMIT,
    SUPABASE_URL,
    SUPABASE_KEY,
    TABLE_SLOTS: 'slots',
  });
})();
