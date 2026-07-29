// supabase/functions/admin-add-place/index.ts
// Edge Function con service_role - MÁXIMA SEGURIDAD
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://jerome4551.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  try {
    // 1. Verificar JWT del usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No auth');
    
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) throw new Error('No autorizado');
    if (user.email !== 'tenerife.go.app@gmail.com') throw new Error('No eres admin');
    
    // 2. Validar body estrictamente
    const { id, lat, lng } = await req.json();
    if (!id || !/^[a-z0-9-]{3,50}$/.test(id)) throw new Error('ID inválido');
    if (typeof lat !== 'number' || lat < 27 || lat > 29) throw new Error('Lat inválida');
    if (typeof lng !== 'number' || lng < -17 || lng > -15) throw new Error('Lng inválida');
    
    // 3. Usar service_role solo aquí
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // 4. Insertar en tabla de lugares pendientes (no directa)
    const { error } = await supabaseAdmin.from('places_pending').insert({ id, lat, lng, created_by: user.id });
    if (error) throw error;
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
