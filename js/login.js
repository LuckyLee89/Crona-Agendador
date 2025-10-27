const { SUPABASE_URL, SUPABASE_KEY } = window.env;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async e => {
  e.preventDefault();
  msg.textContent = 'Entrando...';

  const email = form.email.value.trim();
  const password = form.password.value.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    msg.textContent = '❌ ' + error.message;
    msg.className = 'text-center text-sm text-rose-600 mt-4';
    return;
  }

  msg.textContent = '✅ Login realizado!';
  localStorage.setItem('adminSession', JSON.stringify(data.session));

  // Redireciona
  window.location.href = 'painel_admin.html';
});
