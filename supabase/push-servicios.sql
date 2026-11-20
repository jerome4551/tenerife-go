-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · guardar_push_sub() solo da de alta los servicios de
--  avisos de los navegadores
--  ───────────────────────────────────────────────────────────────────
--  20 de noviembre de 2026 (prueba de los dos moviles, bloque 5; Jerome:
--  «5 si»).
--
--  Lo que arregla: guardar_push_sub() la puede llamar cualquiera, tambien
--  sin cuenta (la clave anon, que va en la app), y daba de alta cualquier
--  direccion que empezara por https://, hasta el tope de 50.000 filas
--  (push-idioma.sql). Con direcciones inventadas se podia llenar ese tope:
--  las suscripciones de verdad dejarian de entrar («demasiadas
--  suscripciones») y enviar-notificacion.js intentaria enviar a todas, una
--  a una, alargando el envio de cada manana.
--
--  Lo que cambia: ademas de lo que ya comprobaba, la direccion tiene que
--  ser de uno de los servicios de avisos de los navegadores, con su
--  barra «/» justo despues del nombre (ni puerto, ni usuario, ni otro
--  dominio que lo contenga):
--    · fcm.googleapis.com: Chrome, Opera para Android y Samsung Internet
--      (Chrome for Developers: los tres usan FCM, y «if the origin is
--      fcm.googleapis.com, it's working»);
--    · updates.push.services.mozilla.com: Firefox (autopush, el servidor
--      de avisos de Mozilla);
--    · cualquier subdominio de push.apple.com: Safari, tambien el del
--      iPhone (Apple: «allow URLs from any subdomain of push.apple.com»);
--      no solo web.push.apple.com;
--    · cualquier subdominio de notify.windows.com: Edge en Windows (WNS;
--      Microsoft: el canal tiene que ser del dominio notify.windows.com).
--  Una que no sea de ellos: 22023, «servicio de avisos no reconocido», y
--  no se guarda nada. Lo demas, igual que en push-idioma.sql: el idioma
--  nuevo en la que ya estaba, las diez lenguas de la app, el tope.
--
--  Antes de aplicarlo (20 de noviembre, solo contando filas): 5
--  suscripciones, las 5 de esos servicios. Nadie se queda sin avisos.
--  Y enviar-notificacion.js no envia a una fila de otro sitio (la misma
--  lista) y corta la conexion que se queda 10 s callada.
--
--  Probado antes en un PostgreSQL 16 local (ver AUDITORIA-FINAL.md): con
--  la funcion de antes, una direccion inventada entraba; con esta, no, y
--  siguen entrando las de los cuatro servicios.
--
--  YA ESTA APLICADA: el 20 de noviembre de 2026, con el conector de
--  Supabase (migracion guardar_push_sub_solo_servicios_de_avisos). Este
--  fichero es su registro. Comprobado despues: la funcion tiene la regla,
--  sigue siendo security definer con search_path = public y con los mismos
--  permisos; una direccion inventada da 22023 y no se guarda (siguen las 5
--  suscripciones), tambien desde fuera, con la clave publica de la app
--  (HTTP 400, «servicio de avisos no reconocido»).
--
--  Los cuerpos van entre comillas simples y no con $$, como en
--  push-idioma.sql: al copiar y pegar, los $$ llegan al editor como \$\$.
--  Se puede volver a ejecutar sin errores: la firma es la misma, asi que
--  «create or replace» la cambia sin tocar sus permisos, que se vuelven a
--  poner igual al final.
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.guardar_push_sub(p_endpoint text, p_p256dh text, p_auth text, p_lang text)
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
  if p_endpoint !~* ''^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|([a-z0-9-]+\.)+push\.apple\.com|([a-z0-9-]+\.)+notify\.windows\.com)/'' then
    raise exception ''servicio de avisos no reconocido'' using errcode = ''22023'';
  end if;
  if not exists (select 1 from public.push_subs where endpoint = p_endpoint)
     and (select count(*) from public.push_subs) >= 50000 then
    raise exception ''demasiadas suscripciones'' using errcode = ''54000'';
  end if;
  update public.push_subs set lang = l where endpoint = p_endpoint;
  if not found then
    insert into public.push_subs (endpoint, p256dh, auth, lang)
    values (p_endpoint, p_p256dh, p_auth, l);
  end if;
end';

revoke all on function public.guardar_push_sub(text, text, text, text) from public;
grant execute on function public.guardar_push_sub(text, text, text, text) to anon, authenticated;
