-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · Migración tienda_una_politica_por_rol_y_accion
--  ───────────────────────────────────────────────────────────────────
--  5 de noviembre de 2026. YA ESTÁ APLICADA en la base de datos: la
--  pegó Jerome en el SQL Editor de Supabase (al conector le hacía falta una
--  confirmación que no le llegaba). Este fichero es su registro.
--  Se puede volver a ejecutar sin errores, pero no hace falta.
--
--  Lo que arregla: el aviso del linter de Supabase «Multiple Permissive
--  Policies» (lint 0006) en anuncios, souvenirs y excursiones. Quien tenía
--  sesión pasaba por dos policies al leer: la pública y la del admin, que
--  era «for all». Ahora hay una por rol y por acción.
--
--  Lo que cada uno puede ver y tocar es lo mismo que antes:
--  · sin sesión (anon): lo visible;
--  · con sesión: lo visible y, si es admin, también lo oculto;
--  · crear, cambiar y borrar: solo el admin.
--  es_admin() va dentro de (select …): se calcula una vez por consulta. La
--  policy de anon no la llama, porque anon no puede ejecutarla
--  (linter_es_admin_sin_public_y_politicas_select_auth_uid.sql).
--
--  Probado antes en un Postgres 16 local con lo que trae Supabase: 18
--  comprobaciones (el admin crea, cambia, borra y ve lo oculto; con sesión y
--  sin ser admin, solo lo visible y nada de escribir; sin sesión, igual; la
--  facturación, cerrada), las mismas antes y después; el lint, imitado con
--  pg_policies, encontraba justo las tres que daba Supabase antes y ninguna
--  después. El orden: en cada tabla, primero las nuevas, y al final se quita
--  la de antes y la pública pasa a ser solo de anon; en ningún momento hay
--  menos permisos que antes.
--
--  Comprobado después en la base de datos: el linter ya no da ningún aviso
--  de rendimiento, y como visitante (la clave pública de la app) la tienda
--  se ve igual que antes: 0 anuncios, 1 souvenir y 1 excursión visibles.
--
--  Lo mismo está ya en anuncios.sql y tienda.sql.
-- ═══════════════════════════════════════════════════════════════════

-- ── anuncios ──
drop policy if exists "anuncios visibles, y todos para admin" on public.anuncios;
create policy "anuncios visibles, y todos para admin" on public.anuncios
  for select to authenticated
  using (visible = true or (select public.es_admin()));
drop policy if exists "solo admin crea anuncios" on public.anuncios;
create policy "solo admin crea anuncios" on public.anuncios
  for insert to authenticated
  with check ((select public.es_admin()));
drop policy if exists "solo admin cambia anuncios" on public.anuncios;
create policy "solo admin cambia anuncios" on public.anuncios
  for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));
drop policy if exists "solo admin borra anuncios" on public.anuncios;
create policy "solo admin borra anuncios" on public.anuncios
  for delete to authenticated
  using ((select public.es_admin()));
drop policy if exists "solo admin gestiona anuncios" on public.anuncios;
alter policy "anuncios visibles son publicos" on public.anuncios
  to anon;

-- ── souvenirs ──
drop policy if exists "souvenirs visibles, y todos para admin" on public.souvenirs;
create policy "souvenirs visibles, y todos para admin" on public.souvenirs
  for select to authenticated
  using (visible = true or (select public.es_admin()));
drop policy if exists "solo admin crea souvenirs" on public.souvenirs;
create policy "solo admin crea souvenirs" on public.souvenirs
  for insert to authenticated
  with check ((select public.es_admin()));
drop policy if exists "solo admin cambia souvenirs" on public.souvenirs;
create policy "solo admin cambia souvenirs" on public.souvenirs
  for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));
drop policy if exists "solo admin borra souvenirs" on public.souvenirs;
create policy "solo admin borra souvenirs" on public.souvenirs
  for delete to authenticated
  using ((select public.es_admin()));
drop policy if exists "solo admin gestiona souvenirs" on public.souvenirs;
alter policy "souvenirs visibles son publicos" on public.souvenirs
  to anon;

-- ── excursiones ──
drop policy if exists "excursiones visibles, y todas para admin" on public.excursiones;
create policy "excursiones visibles, y todas para admin" on public.excursiones
  for select to authenticated
  using (visible = true or (select public.es_admin()));
drop policy if exists "solo admin crea excursiones" on public.excursiones;
create policy "solo admin crea excursiones" on public.excursiones
  for insert to authenticated
  with check ((select public.es_admin()));
drop policy if exists "solo admin cambia excursiones" on public.excursiones;
create policy "solo admin cambia excursiones" on public.excursiones
  for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));
drop policy if exists "solo admin borra excursiones" on public.excursiones;
create policy "solo admin borra excursiones" on public.excursiones
  for delete to authenticated
  using ((select public.es_admin()));
drop policy if exists "solo admin gestiona excursiones" on public.excursiones;
alter policy "excursiones visibles son publicas" on public.excursiones
  to anon;
