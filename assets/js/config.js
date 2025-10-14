
// Public runtime config (safe to expose — NO secrets here)
window.CronaConfig = Object.freeze({
  LOOKUP: "https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/lookup_cpf",
  LIST:   "https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/list_slots",
  SUBMIT: "https://qrtjuypghjbyrbepwvbb.supabase.co/functions/v1/submit_consent",
});
