// Tenerife Go - Config segura
// NUNCA expongas service_role, solo anon key y con RLS activado
export const SUPABASE_URL = 'https://aupjvdrubjytryzqirdn.supabase.co';
export const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI'; // se inyecta via env en build, no hardcodeada

// Limites para evitar baneo OSM
export const NOMINATIM_EMAIL = 'tenerife.go.app@gmail.com';
export const DEBOUNCE_MS = 400;
export const MAX_PLACES_PER_CATEGORY = 150;
