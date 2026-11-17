-- ═══════════════════════════════════════════════════════════════════
--  TENERIFE GO · Borrar la propia cuenta desde la app
--  ───────────────────────────────────────────────────────────────────
--  Ejecutar UNA VEZ en Supabase → SQL Editor → New query → Run.
--  Ejecutado el 5 de noviembre de 2026: lo pegó Jerome en el SQL Editor.
--
--  Que resuelve: Google Play exige que, si la app deja crear cuenta, se
--  pueda borrar desde la app (LANZAMIENTO-PLAY.md 1.2). La app llama a
--  esta funcion desde Cuenta → «Eliminar cuenta».
--
--  Que se borra: la fila de auth.users de QUIEN LLAMA, y nada mas por
--  nombre. Lo que cuelga de ella cae solo, porque las tres tablas que la
--  apuntan lo hacen con «on delete cascade»:
--    · public.favorites (favorites.sql)
--    · public.admins    (anuncios.sql)
--    · public.perfiles  (perfil.sql), y detras pesos y caminatas
--  push_subs no va con la cuenta: guardar_push_sub() da de alta la
--  suscripcion con la clave anon, sin id de usuario.
--  Supabase no deja borrar a un usuario dueño de objetos de Storage; la
--  app no usa Storage.
--
--  Una cuenta de administrador NO se borra desde aqui: la funcion devuelve
--  false y la app manda a borrar-cuenta.html. La de Jerome no se va por un
--  toque en el movil.
--
--  Devuelve true si borro y false si no (sin sesion, o administrador).
--
--  El cuerpo va entre comillas simples y no con $$, como en anuncios.sql:
--  al copiar y pegar, los $$ llegan al editor como \$\$.
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.borrar_mi_cuenta()
returns boolean
language sql
volatile
security definer
set search_path = public
as 'with borrado as (
      delete from auth.users
      where id = auth.uid()
        and not exists (select 1 from public.admins a where a.user_id = auth.uid())
      returning 1)
    select count(*) = 1 from borrado';

revoke execute on function public.borrar_mi_cuenta() from public, anon;
grant  execute on function public.borrar_mi_cuenta() to authenticated;


-- ── LA PRUEBA, ANTES DE DARLO POR BUENO ────────────────────────────
-- Lo comprobado el 5 de noviembre de 2026:
--   · en la base de datos, postgres (el dueño de la funcion) puede borrar en
--     auth.users, y todo lo que apunta a auth.users borra en cascada (o, en
--     una tabla interna de Supabase, pone null): ninguna da el 23503 de abajo;
--   · en un Postgres local, 13 pruebas: sin sesion no se puede llamar; una
--     cuenta de admin no se borra (false); quien llama se va con sus
--     favoritos, su perfil, sus pesos y sus caminatas, y otra cuenta queda
--     intacta; una sesion de una cuenta que ya no existe, false;
--   · en la base de datos, solo la ejecutan authenticated y service_role;
--     desde fuera y sin sesion: «permission denied» (401).
-- Lo que no se puede comprobar sin una sesion de verdad es el paso entero
-- desde la app. La documentacion de Supabase borra usuarios con
-- auth.admin.deleteUser(), desde un servidor y con la service_role. Por eso:
--   1. Crear una cuenta de usar y tirar en la app y entrar con ella.
--   2. Cuenta → «Eliminar cuenta» → «Sí, eliminar mi cuenta».
--   3. Comprobar en Authentication → Users que ya no esta.
-- Si falla, el error dice por que:
--   · «permission denied»: la funcion no puede borrar ahi. La salida es una
--     Edge Function con deleteUser().
--   · 23503: una tabla apunta a auth.users sin «on delete cascade».
-- En los dos casos: parar y avisar. Mientras tanto la app no borra nada y
-- enseña el enlace a borrar-cuenta.html (por correo).
