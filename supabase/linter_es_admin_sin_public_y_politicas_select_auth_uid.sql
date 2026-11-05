-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · Migración linter_es_admin_sin_public_y_politicas_select_auth_uid
--  ───────────────────────────────────────────────────────────────────
--  4 de noviembre de 2026. YA ESTÁ APLICADA en la base de datos: este
--  fichero es su registro. Se puede volver a ejecutar sin errores, pero no
--  hace falta.
--
--  Lo que arregla, de los avisos del linter de Supabase (Advisors):
--
--  · es_admin() se podía ejecutar sin sesión (lint 0028: «This SECURITY
--    DEFINER function is callable without signing in»). anuncios.sql se la
--    quitaba a anon, pero Postgres da EXECUTE a PUBLIC al crear una
--    función, y anon la seguía teniendo por ahí («You almost always want to
--    revoke from PUBLIC as well, because Postgres' default-grant lives
--    there», dice Supabase). Ahora la ejecutan solo authenticated (su uso
--    normal: devuelve false salvo a quien está en admins) y service_role.
--
--  · auth_rls_initplan (lint 0003): con auth.uid() a secas, la política
--    lo vuelve a calcular en cada fila; dentro de (select …), una vez por
--    consulta. Lo que deja ver y tocar es lo mismo («with no impact on the
--    result set», dice Supabase): cada cuenta, solo lo suyo.
--
--  Comprobado en la base de datos después (Jerome, 5 de noviembre de
--  2026): el aviso «ejecutable por anónimos» de es_admin() y los de
--  auth_rls_initplan ya no salen en el linter.
--
--  Lo que sigue saliendo en el linter, y se queda así:
--  · guardar_push_sub() se puede ejecutar sin sesión: a propósito, es como
--    se dan de alta los avisos push (push-idioma.sql).
--  · es_admin() se puede ejecutar con sesión: es su uso normal.
--  · la protección de contraseñas filtradas: solo en el plan Pro.
--  · admins y push_sends, sin políticas: solo las lee el servidor.
--  · las tres políticas duplicadas de la tienda: un aviso de rendimiento
--    menor.
--
--  Lo mismo está ya en anuncios.sql, favorites.sql y perfil.sql, que son
--  los que rehacen el proyecto desde cero.
-- ═══════════════════════════════════════════════════════════════════

revoke execute on function public.es_admin() from public;
grant execute on function public.es_admin() to authenticated, service_role;

alter policy favorites_own_select on public.favorites using ((select auth.uid()) = user_id);
alter policy favorites_own_insert on public.favorites with check ((select auth.uid()) = user_id);
alter policy favorites_own_update on public.favorites using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy favorites_own_delete on public.favorites using ((select auth.uid()) = user_id);

-- «Y las mismas cuatro para perfiles, pesos y caminatas» (Jerome), con los
-- nombres que les da perfil.sql:
alter policy perfiles_own_select on public.perfiles using ((select auth.uid()) = user_id);
alter policy perfiles_own_insert on public.perfiles with check ((select auth.uid()) = user_id);
alter policy perfiles_own_update on public.perfiles using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy perfiles_own_delete on public.perfiles using ((select auth.uid()) = user_id);

alter policy pesos_own_select on public.pesos using ((select auth.uid()) = user_id);
alter policy pesos_own_insert on public.pesos with check ((select auth.uid()) = user_id);
alter policy pesos_own_update on public.pesos using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy pesos_own_delete on public.pesos using ((select auth.uid()) = user_id);

alter policy caminatas_own_select on public.caminatas using ((select auth.uid()) = user_id);
alter policy caminatas_own_insert on public.caminatas with check ((select auth.uid()) = user_id);
alter policy caminatas_own_update on public.caminatas using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy caminatas_own_delete on public.caminatas using ((select auth.uid()) = user_id);
