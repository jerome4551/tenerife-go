// Tenerife Go - Supabase Cliente Seguro v2
// Máxima seguridad: sin service_role, solo anon con RLS

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://aupjvdrubjytryzqirdn.supabase.co';
// La anon key se debe inyectar via variable de entorno en build
// Para dev, usar localStorage temporal pero nunca hardcodear en repo publico
const ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                 localStorage.getItem('tgo_anon_key') || 
                 'TU_ANON_KEY_AQUI';

export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'X-Client-Info': 'tenerife-go-v2-secure' }
  }
});

// Helpers seguros
export async function getFavorites(userId) {
  if (!userId) throw new Error('userId requerido');
  const { data, error } = await supabase
    .from('favorites')
    .select('place_id, created_at')
    .eq('user_id', userId); // RLS own_select asegura que solo ve los suyos
  if (error) throw error;
  return data;
}

export async function addFavorite(userId, placeId) {
  if (!userId || !placeId) throw new Error('Datos incompletos');
  // Validación de entrada estricta
  if (!/^[a-z0-9-]{3,50}$/.test(placeId)) throw new Error('placeId inválido');
  
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, place_id: placeId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFavorite(userId, placeId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
  if (error) throw error;
}

export async function subscribePush(subscription) {
  // Validar subscription object
  if (!subscription || !subscription.endpoint) throw new Error('Subscription inválida');
  if (!subscription.endpoint.startsWith('https://')) throw new Error('Endpoint debe ser HTTPS');
  
  const { error } = await supabase
    .from('push_subs')
    .insert({ 
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      created_at: new Date().toISOString()
    });
  if (error) throw error;
}
