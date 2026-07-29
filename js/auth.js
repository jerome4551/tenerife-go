// Tenerife Go - Auth Seguro v2
// Admin real con Supabase Auth, no localStorage isAdmin

import { supabase } from './supabase-client.js';

const ADMIN_EMAIL = 'tenerife.go.app@gmail.com'; // Cambia por tu email real

export async function loginAdmin(email, password) {
  // Validación estricta
  if (!email || !password) throw new Error('Email y contraseña requeridos');
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) throw new Error('Email inválido');
  if (password.length < 8) throw new Error('Contraseña mínimo 8 caracteres');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  
  // Verificar que es admin
  if (data.user.email !== ADMIN_EMAIL) {
    await supabase.auth.signOut();
    throw new Error('No eres administrador');
  }
  
  return data.user;
}

export async function checkAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
  localStorage.removeItem('tgo_admin');
}

// Protección de rutas admin
export function requireAdmin() {
  return checkAdmin().then(user => {
    if (!user) {
      window.location.href = '/admin/login.html';
      throw new Error('No autorizado');
    }
    return user;
  });
}
