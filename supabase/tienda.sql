-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · Souvenirs y excursiones
--  ───────────────────────────────────────────────────────────────────
--  Ejecutar UNA VEZ en Supabase → SQL Editor → New query → Run.
--  DESPUES de supabase/anuncios.sql, porque reutiliza la funcion
--  public.es_admin() y la tabla public.admins que crea aquel.
--
--  Mismo patron que los anuncios: lectura publica de lo visible,
--  escritura solo para administradores. Asi las tres pestanas del panel
--  se comportan igual y lo que publicas lo ve todo el mundo, no solo el
--  movil donde lo creaste.
--
--  El fichero se puede volver a ejecutar sin errores.
-- ═══════════════════════════════════════════════════════════════════


-- ── Souvenirs ──────────────────────────────────────────────────────
-- La columna se llama `descripcion` y no `desc` porque DESC es palabra
-- reservada de SQL (la de ORDER BY ... DESC).
create table if not exists public.souvenirs (
  id          uuid primary key default gen_random_uuid(),
  emoji       text,
  name        text not null,
  descripcion text,
  info        text,
  price       numeric(10,2) not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint souvenirs_name_no_vacio check (length(btrim(name)) > 0),
  constraint souvenirs_price_no_negativo check (price >= 0)
);

create index if not exists souvenirs_visible_idx on public.souvenirs (visible);

alter table public.souvenirs enable row level security;

-- Una policy por rol y por accion (5 de noviembre de 2026,
-- tienda_una_politica_por_rol_y_accion.sql). Antes, quien tenia sesion
-- pasaba por dos al leer: la publica y la del admin, que era "for all". El
-- linter de Supabase lo marcaba (lint 0006, multiple_permissive_policies).
-- Lo que cada uno puede ver y tocar es lo mismo que antes:
--   · sin sesion (anon): los visibles;
--   · con sesion: los visibles y, si es admin, tambien los ocultos;
--   · crear, cambiar y borrar: solo el admin.
-- es_admin() va dentro de (select ...): se calcula una vez por consulta, no
-- en cada fila. La de anon no la llama: anon no puede ejecutarla.
drop policy if exists "souvenirs visibles son publicos" on public.souvenirs;
create policy "souvenirs visibles son publicos"
  on public.souvenirs for select
  to anon
  using (visible = true);

drop policy if exists "souvenirs visibles, y todos para admin" on public.souvenirs;
create policy "souvenirs visibles, y todos para admin"
  on public.souvenirs for select
  to authenticated
  using (visible = true or (select public.es_admin()));

-- La de antes, que lo hacia todo junto (for all): fuera.
drop policy if exists "solo admin gestiona souvenirs" on public.souvenirs;

drop policy if exists "solo admin crea souvenirs" on public.souvenirs;
create policy "solo admin crea souvenirs"
  on public.souvenirs for insert
  to authenticated
  with check ((select public.es_admin()));

drop policy if exists "solo admin cambia souvenirs" on public.souvenirs;
create policy "solo admin cambia souvenirs"
  on public.souvenirs for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

drop policy if exists "solo admin borra souvenirs" on public.souvenirs;
create policy "solo admin borra souvenirs"
  on public.souvenirs for delete
  to authenticated
  using ((select public.es_admin()));


-- ── Excursiones ────────────────────────────────────────────────────
create table if not exists public.excursiones (
  id           uuid primary key default gen_random_uuid(),
  emoji        text,
  name         text not null,
  descripcion  text,
  duration     text,
  location     text,
  diff         text,
  contact      text,
  price        numeric(10,2) not null default 0,
  max_personas integer not null default 0,
  visible      boolean not null default true,
  created_at   timestamptz not null default now(),
  constraint excursiones_name_no_vacio check (length(btrim(name)) > 0),
  constraint excursiones_price_no_negativo check (price >= 0),
  constraint excursiones_max_no_negativo check (max_personas >= 0)
);

create index if not exists excursiones_visible_idx on public.excursiones (visible);

alter table public.excursiones enable row level security;

-- Como los souvenirs: una policy por rol y por accion.
drop policy if exists "excursiones visibles son publicas" on public.excursiones;
create policy "excursiones visibles son publicas"
  on public.excursiones for select
  to anon
  using (visible = true);

drop policy if exists "excursiones visibles, y todas para admin" on public.excursiones;
create policy "excursiones visibles, y todas para admin"
  on public.excursiones for select
  to authenticated
  using (visible = true or (select public.es_admin()));

-- La de antes, que lo hacia todo junto (for all): fuera.
drop policy if exists "solo admin gestiona excursiones" on public.excursiones;

drop policy if exists "solo admin crea excursiones" on public.excursiones;
create policy "solo admin crea excursiones"
  on public.excursiones for insert
  to authenticated
  with check ((select public.es_admin()));

drop policy if exists "solo admin cambia excursiones" on public.excursiones;
create policy "solo admin cambia excursiones"
  on public.excursiones for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

drop policy if exists "solo admin borra excursiones" on public.excursiones;
create policy "solo admin borra excursiones"
  on public.excursiones for delete
  to authenticated
  using ((select public.es_admin()));


-- ── Permisos de tabla ──────────────────────────────────────────────
-- La RLS filtra FILAS, pero antes hay que poder tocar la tabla.
grant select                 on public.souvenirs   to anon, authenticated;
grant insert, update, delete on public.souvenirs   to authenticated;
grant select                 on public.excursiones to anon, authenticated;
grant insert, update, delete on public.excursiones to authenticated;


-- ═══════════════════════════════════════════════════════════════════
--  Comprobacion rapida (debe devolver las dos tablas con rowsecurity=t):
--
--    select tablename, rowsecurity
--    from pg_tables
--    where schemaname = 'public'
--      and tablename in ('souvenirs','excursiones','anuncios');
-- ═══════════════════════════════════════════════════════════════════
