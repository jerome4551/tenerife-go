-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · El perfil y los progresos en la nube, con permiso
--  ───────────────────────────────────────────────────────────────────
--  Va al repositorio como supabase/perfil.sql. Ejecutar UNA VEZ en
--  Supabase → SQL Editor → New query → Run.
--
--  Jerome, 22 de octubre de 2026: «lo hacemos con permiso del usuario».
--  · Una fila en perfiles solo existe si la persona dio su permiso expreso
--    en el perfil (consentido_en). Sin ella no puede haber pesos ni
--    caminatas: las dos cuelgan de perfiles.
--  · Retirar el permiso = borrar su fila de perfiles; pesos y caminatas
--    caen solos (on delete cascade).
--  · Borrar la cuenta (borrar_mi_cuenta, borrar-cuenta.sql) borra la fila
--    de auth.users, y todo esto cae detrás.
--
--  Lo que se guarda es lo mismo que la app valida al leer localStorage:
--  nombre de 24 letras como mucho, avatar con forma de id del catálogo,
--  unidades, altura de 80 a 250 cm, año de nacimiento, objetivo de 20 a
--  400 kg; pesos de 20 a 400 kg, uno por día; caminatas de 0,1 a 200 km,
--  con su id; y como mucho 2.000 pesos y 2.000 caminatas por cuenta (los
--  topes, al final). Las visitas comprobadas NO suben: son lugares y fechas,
--  y se quedan en el móvil.
--
--  Igual que en favorites.sql: la condición va en «using» para leer y
--  borrar y en «with check» para insertar y actualizar; ninguna policy para
--  anon. Sin el signo del dólar en este fichero: al copiar y pegar desde el
--  móvil llega con una barra delante y rompe el SQL (borrar-cuenta.sql).
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.perfiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  consentido_en  timestamptz not null default now(),
  nombre         text,
  avatar         text,
  unidades       text not null default 'metric',
  altura_cm      numeric,
  nacimiento     integer,
  objetivo_kg    numeric,
  creado         date,
  updated_at     timestamptz not null default now(),
  constraint perfiles_nombre     check (nombre is null or char_length(nombre) <= 24),
  constraint perfiles_avatar     check (avatar is null or (char_length(avatar) between 4 and 24 and avatar ~ '^[a-z]{2,3}-' and avatar !~ '[^a-z-]')),
  constraint perfiles_unidades   check (unidades in ('metric', 'imperial')),
  constraint perfiles_altura     check (altura_cm is null or altura_cm between 80 and 250),
  constraint perfiles_nacimiento check (nacimiento is null or nacimiento between 1900 and 2100),
  constraint perfiles_objetivo   check (objetivo_kg is null or objetivo_kg between 20 and 400)
);

create table if not exists public.pesos (
  user_id  uuid not null references public.perfiles(user_id) on delete cascade,
  fecha    date not null,
  kg       numeric not null,
  primary key (user_id, fecha),
  constraint pesos_kg check (kg between 20 and 400)
);

create table if not exists public.caminatas (
  user_id  uuid not null references public.perfiles(user_id) on delete cascade,
  id       text not null,
  fecha    date not null,
  km       numeric not null,
  primary key (user_id, id),
  constraint caminatas_id check (char_length(id) between 8 and 64),
  constraint caminatas_km check (km between 0.1 and 200)
);

alter table public.perfiles  enable row level security;
alter table public.pesos     enable row level security;
alter table public.caminatas enable row level security;

-- ── perfiles ──
drop policy if exists perfiles_own_select on public.perfiles;
create policy perfiles_own_select on public.perfiles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists perfiles_own_insert on public.perfiles;
create policy perfiles_own_insert on public.perfiles
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists perfiles_own_update on public.perfiles;
create policy perfiles_own_update on public.perfiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists perfiles_own_delete on public.perfiles;
create policy perfiles_own_delete on public.perfiles
  for delete to authenticated
  using (auth.uid() = user_id);

-- ── pesos ──
drop policy if exists pesos_own_select on public.pesos;
create policy pesos_own_select on public.pesos
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists pesos_own_insert on public.pesos;
create policy pesos_own_insert on public.pesos
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists pesos_own_update on public.pesos;
create policy pesos_own_update on public.pesos
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists pesos_own_delete on public.pesos;
create policy pesos_own_delete on public.pesos
  for delete to authenticated
  using (auth.uid() = user_id);

-- ── caminatas ──
drop policy if exists caminatas_own_select on public.caminatas;
create policy caminatas_own_select on public.caminatas
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists caminatas_own_insert on public.caminatas;
create policy caminatas_own_insert on public.caminatas
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists caminatas_own_update on public.caminatas;
create policy caminatas_own_update on public.caminatas
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists caminatas_own_delete on public.caminatas;
create policy caminatas_own_delete on public.caminatas
  for delete to authenticated
  using (auth.uid() = user_id);

-- Los permisos, justos. Supabase da por defecto todos los permisos de las tablas nuevas de
-- public a anon y a authenticated, también TRUNCATE, que no pasa por la RLS. Así que primero
-- se quitan todos y después authenticated recibe solo las cuatro operaciones (la RLS de arriba
-- dice sobre qué filas). anon, nada: aunque un día se apagase la RLS, no podría tocarlas.
revoke all on public.perfiles, public.pesos, public.caminatas from anon, authenticated;
grant select, insert, update, delete on public.perfiles, public.pesos, public.caminatas to authenticated;

-- Los topes (23 de octubre de 2026, como los de favorites.sql). La RLS no deja tocar lo de
-- otra cuenta, pero con una cuenta cualquiera se podían meter en las propias tantos pesos y
-- caminatas como se quisiera, a mano, contra la API, hasta llenar la base de datos del
-- proyecto. Ahora:
--   · cada peso y cada caminata, con una fecha entre 1900 y 2100;
--   · como mucho 2.000 pesos y 2.000 caminatas por cuenta (un peso al día son más de cinco
--     años). La app tampoco deja anotar más, y los lee por páginas: Supabase da como mucho
--     1.000 filas por consulta.
-- El tope se cuenta una vez por subida, al acabar (con las filas que entraron, en «nuevas»).
-- Lo que ya está se puede volver a subir (la app sube con upsert, y eso no suma filas).
alter table public.pesos drop constraint if exists pesos_fecha;
alter table public.pesos add constraint pesos_fecha
  check (fecha between date '1900-01-01' and date '2100-12-31');
alter table public.caminatas drop constraint if exists caminatas_fecha;
alter table public.caminatas add constraint caminatas_fecha
  check (fecha between date '1900-01-01' and date '2100-12-31');

create or replace function public.pesos_tope() returns trigger
language plpgsql
set search_path = public
as '
begin
  if exists (select 1 from public.pesos p
              where p.user_id in (select n.user_id from nuevas n)
              group by p.user_id having count(*) > 2000) then
    raise exception ''demasiados pesos en esta cuenta'' using errcode = ''54000'';
  end if;
  return null;
end';

create or replace function public.caminatas_tope() returns trigger
language plpgsql
set search_path = public
as '
begin
  if exists (select 1 from public.caminatas c
              where c.user_id in (select n.user_id from nuevas n)
              group by c.user_id having count(*) > 2000) then
    raise exception ''demasiadas caminatas en esta cuenta'' using errcode = ''54000'';
  end if;
  return null;
end';

-- Son de disparador: nadie las llama a mano, y nadie más que el disparador puede.
revoke execute on function public.pesos_tope() from public, anon, authenticated;
revoke execute on function public.caminatas_tope() from public, anon, authenticated;

drop trigger if exists pesos_tope on public.pesos;
create trigger pesos_tope after insert on public.pesos
  referencing new table as nuevas
  for each statement execute function public.pesos_tope();

drop trigger if exists caminatas_tope on public.caminatas;
create trigger caminatas_tope after insert on public.caminatas
  referencing new table as nuevas
  for each statement execute function public.caminatas_tope();
