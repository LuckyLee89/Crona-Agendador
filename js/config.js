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

  // Supabase SDK (requer ANON KEY, nunca service_role no front)
  const SUPABASE_URL =
    env.SUPABASE_URL || 'https://qrtjuypghjbyrbepwvbb.supabase.co';
  const SUPABASE_KEY =
    env.SUPABASE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydGp1eXBnaGpieXJiZXB3dmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDYzOTEsImV4cCI6MjA3NjAyMjM5MX0._dMoLlT3CXjwzIyBwM4v8hJqmhP2z3N3p4n2JqnGdBg'; // deixe vazio no repo público

  window.CronaConfig = Object.freeze({
    LOOKUP,
    LIST,
    SUBMIT,
    SUPABASE_URL,
    SUPABASE_KEY,
    TABLE_SLOTS: 'slots',
  });
})();
