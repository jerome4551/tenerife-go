-- ═══════════════════════════════════════════════════════════════════
--  Traducciones de lo que escribe el administrador
--  ------------------------------------------------------------------
--  Ejecutar DESPUES de anuncios.sql y tienda.sql. Se puede volver a
--  ejecutar entero sin romper nada.
--
--  EL PROBLEMA QUE RESUELVE. El nombre, la descripcion y el eslogan de
--  un anuncio, una excursion o un souvenir los escribe el
--  administrador UNA vez, en castellano, y hasta ahora se pintaban tal
--  cual en los diez idiomas: un turista bulgaro veia la app entera en
--  cirilico y la tarjeta en castellano.
--
--  POR QUE UNA COLUMNA JSONB Y NO DIEZ COLUMNAS. Con diez columnas por
--  campo la tabla crece a cada idioma nuevo y hay que migrarla; con un
--  jsonb entra el idioma once sin tocar el esquema. Y sobre todo: la
--  traduccion VIAJA CON LA FILA. No hay una segunda peticion que pueda
--  fallar, ni un fichero aparte que se quede desincronizado, ni nada
--  que pedir cuando el movil esta sin cobertura.
--
--  FORMA:  { "en": {"name":"...","desc":"..."}, "bg": {...}, ... }
--  Las claves de idioma son las de SUPPORTED_LANGS menos 'es', que es
--  lo que ya hay en las columnas de siempre. Los campos que lleva cada
--  tabla los dice el comentario de cada bloque.
--
--  EL CASTELLANO NO SE DUPLICA aqui. Es el original y vive donde
--  siempre: si alguien lo corrige, se corrige en un solo sitio.
-- ═══════════════════════════════════════════════════════════════════

-- ── Anuncios · campos: name, tagline ───────────────────────────────
alter table public.anuncios
  add column if not exists i18n jsonb not null default '{}'::jsonb;

-- ── Souvenirs · campos: name, desc, info ───────────────────────────
alter table public.souvenirs
  add column if not exists i18n jsonb not null default '{}'::jsonb;

-- ── Excursiones · campos: name, desc, duration ─────────────────────
--  `location` NO se traduce: es un nombre propio -Santa Cruz, Anaga-
--  y traducirlo seria inventarse un topónimo.
--  `diff` tampoco: es una de tres opciones fijas del formulario y la
--  app la traduce sola desde una tabla, sin pasar por aqui.
alter table public.excursiones
  add column if not exists i18n jsonb not null default '{}'::jsonb;


-- ── Que sea un objeto, no cualquier cosa ───────────────────────────
--  Sin esto un `i18n` podria llegar siendo un numero o una lista y el
--  navegador tendria que defenderse de su propia base de datos.
alter table public.anuncios     drop constraint if exists anuncios_i18n_objeto;
alter table public.anuncios     add  constraint anuncios_i18n_objeto
  check (jsonb_typeof(i18n) = 'object');
alter table public.souvenirs    drop constraint if exists souvenirs_i18n_objeto;
alter table public.souvenirs    add  constraint souvenirs_i18n_objeto
  check (jsonb_typeof(i18n) = 'object');
alter table public.excursiones  drop constraint if exists excursiones_i18n_objeto;
alter table public.excursiones  add  constraint excursiones_i18n_objeto
  check (jsonb_typeof(i18n) = 'object');


-- ── Permisos ───────────────────────────────────────────────────────
--  No hace falta tocar nada: las policies de anuncios.sql y tienda.sql
--  son por FILA, no por columna, asi que la columna nueva hereda su
--  regla. Quien puede leer la fila lee su traduccion, y solo el
--  administrador puede escribirla.
--
--  Y no hay dato privado aqui: es el mismo texto publico de la tarjeta
--  en otro idioma. La facturacion sigue en anuncios_privado, que no
--  tiene policy de lectura publica.
