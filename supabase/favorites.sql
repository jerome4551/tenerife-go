-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · Favoritos y avisos push
--  ───────────────────────────────────────────────────────────────────
--  favorites y push_subs ya existian en el proyecto antes de la revision
--  de seguridad; push_sends, desde la notificacion diaria. Se documentan
--  aqui para que la configuracion sea reproducible: si algun dia se
--  recrea el proyecto, sin esto habria que reinventar las policies de
--  memoria.
--
--  Las tres, volcadas de la base de datos el 5 de noviembre de 2026
--  (columnas, claves, RLS, policies y permisos). Lo de `favorites` ya
--  estaba verificado (pg_policies, julio 2026); push_subs y push_sends,
--  al final.
-- ═══════════════════════════════════════════════════════════════════


-- ── favorites ──────────────────────────────────────────────────────
-- Por que importa: el cliente manda el user_id el mismo
-- (pushFavoriteToCloud en index.html), asi que sin estas policies
-- cualquiera con la clave anon —que es publica por diseno— podria leer
-- o escribir los favoritos de otra persona. Quien lo impide es el
-- servidor, no el JavaScript.
--
-- La condicion va en `using` para leer/borrar y en `with check` para
-- insertar/actualizar: `using` filtra las filas que ya existen y
-- `with check` valida las que entran.
--
-- auth.uid() va dentro de (select ...) desde el 4 de noviembre de 2026
-- (linter_es_admin_sin_public_y_politicas_select_auth_uid.sql): a secas, la
-- policy lo vuelve a calcular en cada fila; asi, una vez por consulta. Lo
-- que deja ver y tocar es lo mismo (aviso auth_rls_initplan del linter).

create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  place_id   text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.favorites enable row level security;

drop policy if exists favorites_own_select on public.favorites;
create policy favorites_own_select on public.favorites
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists favorites_own_insert on public.favorites;
create policy favorites_own_insert on public.favorites
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Hace falta porque el cliente usa upsert(): sin policy de UPDATE, al
-- marcar como favorito algo que ya estaba (dos dispositivos a la vez)
-- la rama ON CONFLICT DO UPDATE se rechaza.
drop policy if exists favorites_own_update on public.favorites;
create policy favorites_own_update on public.favorites
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists favorites_own_delete on public.favorites;
create policy favorites_own_delete on public.favorites
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.favorites to authenticated;
-- anon, nada sobre la tabla: asi esta en la base de datos (5 de noviembre de 2026).
revoke all on public.favorites from anon;

-- Los topes (23 de octubre de 2026). La RLS no deja tocar los favoritos de otra cuenta, pero
-- con una cuenta cualquiera se podían meter en los propios tantos como se quisiera, a mano,
-- contra la API, y con un place_id tan largo como cupiera, hasta llenar la base de datos del
-- proyecto. Ahora:
--   · place_id, de 1 a 80 caracteres (los de la app van de 3 a 43);
--   · como mucho 1.000 favoritos por cuenta (la app tiene 980 lugares, y lee los favoritos
--     de una vez: Supabase da como mucho 1.000 filas por consulta).
-- El check va con NOT VALID: no repasa las filas que ya hay, solo las nuevas y las cambiadas.
-- El tope se cuenta una vez por subida, al acabar (con las filas que entraron, en «nuevas»).
-- Lo que ya está se puede volver a subir (la app sube con upsert, y eso no suma filas).
alter table public.favorites drop constraint if exists favorites_place_id_largo;
alter table public.favorites add constraint favorites_place_id_largo
  check (char_length(place_id) between 1 and 80) not valid;

create or replace function public.favoritos_tope() returns trigger
language plpgsql
set search_path = public
as '
begin
  if exists (select 1 from public.favorites f
              where f.user_id in (select n.user_id from nuevas n)
              group by f.user_id having count(*) > 1000) then
    raise exception ''demasiados favoritos en esta cuenta'' using errcode = ''54000'';
  end if;
  return null;
end';

-- Es de disparador: nadie la llama a mano, y nadie más que el disparador puede.
revoke execute on function public.favoritos_tope() from public, anon, authenticated;

drop trigger if exists favorites_tope on public.favorites;
create trigger favorites_tope after insert on public.favorites
  referencing new table as nuevas
  for each statement execute function public.favoritos_tope();


-- ═══════════════════════════════════════════════════════════════════
--  push_subs y push_sends — los avisos push
--  ───────────────────────────────────────────────────────────────────
--  push_subs: una fila por movil suscrito. Las altas entran SOLO por
--  guardar_push_sub() (push-idioma.sql), que comprueba lo que llega
--  (endpoint https, largos) y pone el tope de 50.000. Es security
--  definer: no necesita ninguna policy ni permiso de tabla. Por eso anon y
--  authenticated no tienen nada sobre push_subs, desde el 5 de noviembre
--  de 2026 (push_subs_solo_por_guardar_push_sub.sql): antes, la policy
--  "push_subs alta anon" (insert, with check true) dejaba meter filas
--  directas sin pasar por la funcion. Las claves de cada suscripcion
--  (p256dh, auth) no se pueden leer desde el cliente; solo el servidor,
--  con la service_role (enviar-notificacion.js), las lee y borra las que
--  ya no valen.
--
--  push_sends: un dia, una fila. enviar-notificacion.js marca el dia
--  ANTES de enviar; si ya esta, la clave primaria da 409 y no se envia
--  dos veces. RLS sin ninguna policy: solo el servidor la lee y la
--  escribe. El linter de Supabase lo cuenta como «RLS Enabled No Policy»,
--  igual que admins, y esta bien asi.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.push_subs (
  id         bigint generated always as identity primary key,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  lang       text not null default 'es',
  created_at timestamptz not null default now()
);

alter table public.push_subs enable row level security;

drop policy if exists "push_subs alta anon" on public.push_subs;
revoke all on public.push_subs from anon, authenticated;

create table if not exists public.push_sends (
  sent_date  date primary key,
  created_at timestamptz not null default now()
);

alter table public.push_sends enable row level security;
