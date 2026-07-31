-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · Anuncios de negocios partner
--  ───────────────────────────────────────────────────────────────────
--  Ejecutar UNA VEZ en Supabase → SQL Editor → New query → Run.
--
--  Que resuelve: hasta ahora los anuncios vivian en el localStorage del
--  movil del administrador, asi que un negocio que pagara su ficha solo
--  la veia en ese dispositivo y en ningun otro. Con esto los anuncios
--  pasan a estar en el servidor y los ve todo el mundo.
--
--  Y de paso el panel deja de "protegerse" con una contrasena guardada
--  en el propio navegador (que cualquiera podia saltarse desde la
--  consola): quien decide quien es administrador es ahora Postgres, no
--  el cliente. Aunque alguien fuerce el panel a abrirse, la base de
--  datos rechaza cualquier escritura que no venga de un admin.
-- ═══════════════════════════════════════════════════════════════════


-- ── 1. Quien es administrador ──────────────────────────────────────
-- Tabla deliberadamente minima. Con RLS activada y SIN ninguna policy,
-- nadie puede leerla ni escribirla desde la app: solo se toca desde el
-- panel de Supabase (o con la service_role, que nunca sale del servidor).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nota       text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;


-- ── 2. Funcion de comprobacion ─────────────────────────────────────
-- SECURITY DEFINER porque necesita leer `admins`, que esta cerrada a
-- cal y canto. Solo devuelve un booleano sobre QUIEN LLAMA, asi que no
-- filtra nada: no revela la lista de admins ni permite consultar por
-- otro usuario. El search_path fijo evita que se le cuele una tabla
-- `admins` falsa desde otro esquema.
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke execute on function public.es_admin() from anon;
grant  execute on function public.es_admin() to authenticated;


-- ── 3. Los anuncios (datos publicos) ───────────────────────────────
-- Aqui NO va nada confidencial: todo lo de esta tabla lo puede leer
-- cualquier visitante. Lo que se cobra a cada negocio va en la tabla
-- de abajo, separada a proposito.
create table if not exists public.anuncios (
  id          uuid primary key default gen_random_uuid(),
  emoji       text,
  name        text not null,
  category    text not null default 'recomendacion',
  tagline     text,
  contact     text,
  zone        text,
  lat         double precision not null,
  lng         double precision not null,
  promo_text  text,
  promo_until date,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),

  -- Misma validacion que hace el formulario, pero aqui no se puede
  -- saltar tocando el JavaScript: las coordenadas tienen que caer
  -- dentro de Tenerife.
  constraint anuncios_lat_tenerife check (lat between 27.9 and 28.7),
  constraint anuncios_lng_tenerife check (lng between -17.0 and -16.0),
  constraint anuncios_name_no_vacio check (length(btrim(name)) > 0)
);

create index if not exists anuncios_visible_idx on public.anuncios (visible);

alter table public.anuncios enable row level security;

-- Lectura: cualquiera ve los anuncios marcados como visibles.
create policy "anuncios visibles son publicos"
  on public.anuncios for select
  to anon, authenticated
  using (visible = true);

-- Escritura (y lectura de los ocultos): solo administradores.
-- Las policies se suman, asi que un admin ve tanto los visibles por la
-- de arriba como los ocultos por esta.
create policy "solo admin gestiona anuncios"
  on public.anuncios for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());


-- ── 4. Facturacion (datos privados) ────────────────────────────────
-- Lo que paga cada negocio va en su propia tabla, sin ninguna policy
-- de lectura publica. Si estuviera como una columna mas de `anuncios`,
-- la policy de lectura publica la expondria: cualquiera con la clave
-- anon (que es publica por diseno) podria ver cuanto paga cada cliente.
create table if not exists public.anuncios_privado (
  anuncio_id  uuid primary key references public.anuncios(id) on delete cascade,
  price_month numeric(10,2) not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.anuncios_privado enable row level security;

create policy "solo admin ve facturacion"
  on public.anuncios_privado for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());


-- ── 5. Permisos de tabla ───────────────────────────────────────────
-- La RLS filtra FILAS, pero antes hay que tener permiso sobre la tabla.
-- Se conceden explicitamente para no depender de los default privileges
-- del proyecto.
grant select                         on public.anuncios         to anon, authenticated;
grant insert, update, delete         on public.anuncios         to authenticated;
grant select, insert, update, delete on public.anuncios_privado to authenticated;


-- ═══════════════════════════════════════════════════════════════════
--  ULTIMO PASO — DARTE DE ALTA COMO ADMINISTRADOR
--  ───────────────────────────────────────────────────────────────────
--  Sin esto el panel no se abre para nadie, ni siquiera para ti.
--
--  1. Registrate en la app con tu email (pestana "Crear cuenta") y
--     confirma el correo.
--  2. Vuelve aqui y ejecuta esto poniendo TU email:
--
--       insert into public.admins (user_id, nota)
--       select id, 'Jerome'
--       from auth.users
--       where email = 'tu-email@ejemplo.com'
--       on conflict (user_id) do nothing;
--
--  3. Comprueba que ha entrado:
--
--       select u.email, a.nota
--       from public.admins a join auth.users u on u.id = a.user_id;
--
--  Para quitarle el acceso a alguien basta con borrar su fila de
--  `admins`: el cambio es inmediato, sin tocar la app.
-- ═══════════════════════════════════════════════════════════════════
