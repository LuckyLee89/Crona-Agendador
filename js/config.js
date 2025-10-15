// js/config.js
// Configuração central do Crona. Segura para portfólio.
// Use um arquivo local 'env.js' (não comitar) para definir suas chaves reais.
// Exemplo em 'env-example.js'.
(function () {
  const env = (window.env || {});

  // Endpoints de Edge Functions (públicos)
  const LOOKUP   = env.LOOKUP   || "https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/lookup_cpf";
  const LIST     = env.LIST     || "https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/list_slots";
  const SUBMIT   = env.SUBMIT   || "https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/submit_consent";

  // Supabase SDK (requer ANON KEY, nunca service_role no front)
  const SUPABASE_URL = env.SUPABASE_URL || "https://qrtjuypghjbyrbepwvbb.supabase.co";
  const SUPABASE_KEY = env.SUPABASE_KEY || ""; // deixe vazio no repo público

  window.CronaConfig = Object.freeze({
    LOOKUP, LIST, SUBMIT,
    SUPABASE_URL, SUPABASE_KEY,
    TABLE_SLOTS: "slots",
  });
})();
