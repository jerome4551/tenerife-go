-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · La notificacion diaria, en el idioma que tiene la app
--  ───────────────────────────────────────────────────────────────────
--  Ejecutar UNA VEZ en Supabase → SQL Editor → New query → Run.
--
--  Que resuelve: la suscripcion se guarda con el idioma de la app en el
--  momento de activarla. Si despues se cambia de idioma, la app vuelve a
--  mandar la suscripcion con el idioma nuevo (al cambiarlo, desde el 21 de
--  octubre de 2026, y cada vez que se abre), pero guardar_push_sub() no
--  toca una suscripcion que ya existe: el comentario de pushReSync() en
--  index.html lo dice («si ya estaba guardada, el servidor lo ignora») y la
--  app da por bueno el 409 que devuelve. Asi que la frase de cada manana
--  sigue llegando en el primer idioma.
--
--  Que cambia:
--    · guardar_push_sub() pone el idioma nuevo en la suscripcion que ya
--      existe, y da de alta la que no. De una que ya existe SOLO cambia el
--      idioma: sus claves no se tocan desde el cliente.
--    · Acepta los diez idiomas de la app. Uno que no sea de ellos se guarda
--      como 'es', que es lo que enviar-notificacion.js le mandaria igual.
--    · Si push_subs tiene una restriccion sobre lang que no admite el
--      bulgaro o el polaco (los dos ultimos idiomas que entraron), se
--      cambia por una con los diez. Si no la tiene, no se crea ninguna.
--
--  El cuerpo actual de la funcion no se llego a volcar (supabase/
--  favorites.sql, «PENDIENTE DE VOLCAR»), asi que se quita la que haya, con
--  la firma que tenga, y se crea esta. Antes de ejecutar, si se quiere ver
--  como esta, estas tres consultas solo leen (pegar el resultado en
--  favorites.sql, en su sitio):
--
--    select pg_get_functiondef(p.oid)
--      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--     where n.nspname = 'public' and p.proname = 'guardar_push_sub';
--
--    select conname, pg_get_constraintdef(oid)
--      from pg_constraint where conrelid = 'public.push_subs'::regclass;
--
--    select lang, count(*) from public.push_subs group by lang order by 2 desc;
--
--  Y despues, para comprobarlo: con la app instalada y las notificaciones
--  activadas, cambiar de idioma y volver a mirar la ultima consulta: ese
--  movil ya cuenta en el idioma nuevo.
--
--  Los cuerpos van entre comillas simples y no con $$, como en anuncios.sql
--  y borrar-cuenta.sql: al copiar y pegar, los $$ llegan al editor como \$\$.
-- ═══════════════════════════════════════════════════════════════════

-- 1 · La restriccion de idioma, si hay una y se queda corta
do '
declare
  r record;
  quitadas int := 0;
begin
  for r in select conname, pg_get_constraintdef(oid) as def
             from pg_constraint
            where conrelid = ''public.push_subs''::regclass
              and contype = ''c''
              and pg_get_constraintdef(oid) ilike ''%lang%''
  loop
    if position(''bg'' in r.def) = 0 or position(''pl'' in r.def) = 0 then
      execute ''alter table public.push_subs drop constraint '' || quote_ident(r.conname);
      quitadas := quitadas + 1;
    end if;
  end loop;
  if quitadas > 0 then
    alter table public.push_subs add constraint push_subs_lang_diez
      check (lang is null or lang in (''es'',''en'',''fr'',''de'',''it'',''nl'',''zh'',''zht'',''bg'',''pl''));
  end if;
end';

-- 2 · Fuera la funcion de ahora, con la firma que tenga
do '
declare
  r record;
begin
  for r in select p.oid::regprocedure as f
             from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = ''public'' and p.proname = ''guardar_push_sub''
  loop
    execute ''drop function '' || r.f::text;
  end loop;
end';

-- 3 · La nueva: alta, o el idioma al dia si ya estaba
create function public.guardar_push_sub(p_endpoint text, p_p256dh text, p_auth text, p_lang text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as '
declare
  l text := case when p_lang in (''es'',''en'',''fr'',''de'',''it'',''nl'',''zh'',''zht'',''bg'',''pl'')
                 then p_lang else ''es'' end;
begin
  if p_endpoint is null or p_endpoint !~ ''^https://'' or length(p_endpoint) > 1000
     or coalesce(length(p_p256dh), 0) = 0 or length(p_p256dh) > 200
     or coalesce(length(p_auth), 0) = 0 or length(p_auth) > 100 then
    raise exception ''suscripcion no valida'' using errcode = ''22023'';
  end if;
  update public.push_subs set lang = l where endpoint = p_endpoint;
  if not found then
    insert into public.push_subs (endpoint, p256dh, auth, lang)
    values (p_endpoint, p_p256dh, p_auth, l);
  end if;
end';

revoke all on function public.guardar_push_sub(text, text, text, text) from public;
grant execute on function public.guardar_push_sub(text, text, text, text) to anon, authenticated;
