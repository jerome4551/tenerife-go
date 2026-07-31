-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · Favoritos y suscripciones push
--  ───────────────────────────────────────────────────────────────────
--  Estas dos tablas ya existian en el proyecto antes de la revision de
--  seguridad. Se documentan aqui para que la configuracion sea
--  reproducible: si algun dia se recrea el proyecto, sin esto habria
--  que reinventar las policies de memoria.
--
--  Lo de `favorites` esta verificado contra la base de datos real
--  (pg_policies, julio 2026). Lo de `push_subs` esta al final, con lo
--  que se comprobo y lo que falta por volcar.
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
  using (auth.uid() = user_id);

drop policy if exists favorites_own_insert on public.favorites;
create policy favorites_own_insert on public.favorites
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Hace falta porque el cliente usa upsert(): sin policy de UPDATE, al
-- marcar como favorito algo que ya estaba (dos dispositivos a la vez)
-- la rama ON CONFLICT DO UPDATE se rechaza.
drop policy if exists favorites_own_update on public.favorites;
create policy favorites_own_update on public.favorites
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists favorites_own_delete on public.favorites;
create policy favorites_own_delete on public.favorites
  for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.favorites to authenticated;


-- ═══════════════════════════════════════════════════════════════════
--  push_subs — PENDIENTE DE VOLCAR
--  ───────────────────────────────────────────────────────────────────
--  Comprobado en la base de datos real:
--    · RLS activada (rowsecurity = true)
--    · una sola policy, de INSERT, llamada "push_subs alta anon"
--    · NINGUNA policy de SELECT
--
--  Esa ausencia de SELECT es justo lo que el codigo da por hecho: la
--  lista de endpoints push no se puede descargar desde el cliente, solo
--  la lee el servidor con la service_role (enviar-notificacion.js).
--  Las altas entran por la funcion guardar_push_sub().
--
--  No se reproduce aqui el cuerpo exacto de la policy ni el de la
--  funcion porque no se llegaron a volcar, y escribirlos de memoria
--  seria peor que no tenerlos. Para completarlo, ejecutar y pegar el
--  resultado en este fichero:
--
--    select policyname, cmd, roles, qual, with_check
--    from pg_policies
--    where schemaname = 'public' and tablename = 'push_subs';
--
--    select pg_get_functiondef(oid)
--    from pg_proc
--    where proname = 'guardar_push_sub';
-- ═══════════════════════════════════════════════════════════════════
