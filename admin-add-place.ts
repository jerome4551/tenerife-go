<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login - Tenerife Go</title>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://*.supabase.co">
<link rel="stylesheet" href="../styles.css">
</head>
<body class="admin-login">
  <div class="login-card">
    <h1>🔐 Tenerife Go Admin</h1>
    <p>Solo acceso con Supabase Auth real</p>
    <form id="loginForm">
      <input type="email" id="email" placeholder="tenerife.go.app@gmail.com" required autocomplete="email">
      <input type="password" id="password" placeholder="Contraseña mínimo 12 chars" required minlength="12" autocomplete="current-password">
      <button type="submit">Entrar</button>
    </form>
    <p id="error" style="color:red"></p>
  </div>
<script type="module">
import { loginAdmin } from '../js/auth.js';
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');
  errorEl.textContent = '';
  try {
    await loginAdmin(email, password);
    window.location.href = './index.html';
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
</script>
</body>
</html>
