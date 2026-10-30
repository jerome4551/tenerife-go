# Google Play: lo que se rellena en Play Console

La app de Google Play es la web (`https://tenerifego.app/`) dentro de Chrome:
una *Trusted Web Activity* hecha con PWABuilder. Lo que la web cambia, la app
lo tiene a la vez, sin subir otra versión. Este documento dice qué contestar
en cada pantalla de Play Console, con la frase de la política de privacidad
que lo respalda. Lo que cambie en la app y toque a una respuesta de aquí se
cambia también aquí.

Hecho ya: el dominio (30 de octubre), el identificador `tenerifego.app`, la
política (`privacidad.html`), la página para borrar la cuenta
(`borrar-cuenta.html`), borrarla desde la app, la tienda y AdSense fuera de la
vista, el crédito de OpenStreetMap y el de Open-Meteo (`AUDITORIA-FINAL.md`).

## 1. Antes de la ficha

- **Cuenta de desarrollador.** En las cuentas personales nuevas, Google pide
  una **prueba cerrada con al menos 12 testers durante 14 días seguidos**
  antes de dejar pedir el acceso a producción (ayuda de Play Console,
  answer/14151465). Los 14 días cuentan desde que los 12 están dentro: cuanto
  antes se suba la prueba cerrada, antes se puede publicar.
- **PWABuilder → Android:** *Package ID* **`tenerifego.app`** (no el que
  propone, que da la vuelta al dominio, `app.tenerifego…`: Jerome, «Yo quiero
  tenerifego.app»); *App
  name* y *Launcher name*, «Tenerife Go». La clave de firma la crea y la guarda
  Jerome: no entra en el repositorio ni en ningún mensaje. Del zip, lo único
  que hace falta aquí es **`assetlinks.json`** (o la huella SHA-256).
- **Fase 3, el enlace con la web.** `assetlinks.json` va en
  `https://tenerifego.app/.well-known/assetlinks.json`; sin él, la app enseña
  arriba la barra de Chrome con la dirección. Con la firma de apps de Google
  Play (en Play Console, *Integridad de la app → Firma de apps*), Google vuelve
  a firmar la app con su clave: su huella SHA-256 también tiene que estar en
  ese fichero. Las dos huellas, de Jerome; el fichero, aquí.

## 2. La ficha (Presencia en Play Store → Ficha principal de Play Store)

- **Idioma predeterminado:** español (España), `es-ES`. Luego, *Gestionar
  traducciones → Añadir tus propias traducciones*: `en-GB`, `en-US`, `fr-FR`,
  `de-DE`, `it-IT`, `nl-NL`, `zh-CN`, `zh-TW`, `bg` y `pl-PL`.
- **Los textos** (nombre, descripción breve y completa), en
  `datos/google-play/ficha.json`, sacados de la ficha de la App Store sin texto
  nuevo. Para copiarlos, un idioma cada vez:

      node tools/google_play_ficha.js --ver es-ES

  La completa es la de la App Store sin la frase de los negocios patrocinados
  (ver «Anuncios»); la breve, su texto promocional sin «en su bolsillo», que no
  cabe en 80 caracteres. `auditar.sh` coteja que sigan siendo eso y los
  límites de Play (nombre 30, breve 80, completa 4000).
- **Gráficos, cada idioma con los suyos** (si no, Play enseña los de `es-ES` a
  todo el mundo, en castellano):
  - icono, 512 × 512: `icon-512.png`;
  - gráfico de funciones, 1024 × 500, PNG de 24 bits sin transparencia: el
    logotipo y el cielo de la app con los nombres en su idioma;
  - capturas de teléfono, 1080 × 1920 (9:16; Play no deja que el lado largo
    pase del doble del corto, así que las del iPhone no valen): siete por
    idioma, de la app de verdad.

  Se hacen así (quedan en `capturas-google-play/<idioma>/`, fuera de git):

      node tools/app_preparar.js
      python3 -m http.server 8766 --directory app/www &
      node tools/capturas_app_store.js 8766 --play --idiomas=todos
      node tools/grafico_play.js 8766 --idiomas=todos
- **Categoría:** Viajes y guías locales.
- **Contacto:** `tenerife.go.app@gmail.com` (el de la política) y la web
  `https://tenerifego.app/`.

## 3. Contenido de la aplicación (Política → Contenido de la aplicación)

- **Política de privacidad:** `https://tenerifego.app/privacidad.html`.
- **Anuncios: No.** Hoy no hay ningún negocio patrocinado (Jerome, 30 de
  octubre: «De momento no tenemos ninguno»). Para Google, un contenido
  patrocinado dentro de la app es un anuncio. **El día que haya el primero,
  tres cosas a la vez:** aquí, «Sí, contiene anuncios»; en Open-Meteo, el plan
  de pago, porque su API gratuita es solo para apps sin anuncios ni
  suscripciones («Websites or apps that have subscriptions or display
  advertisements» es uso comercial); y en la ficha, la frase de los
  patrocinados de vuelta (quitarla de `PATROCINIO` en
  `tools/google_play_ficha.js` y `--escribir`).
- **Acceso a la aplicación:** todas las funciones, sin restricciones. La
  cuenta es opcional y la crea cualquiera; el panel de administración no es
  una función para el público.
- **Público objetivo:** de 13 años en adelante (13-15, 16-17 y 18 o más); no
  a menores de 13, que pondría la app bajo la política de familias. La
  política pide 14 años para guardar el perfil en la cuenta (§2, «Perfil»).
- **Clasificación de contenido** (cuestionario de IARC). Lo que hay en la
  app, para contestar cada pregunta tal como venga: sin violencia, sin
  contenido sexual, sin lenguaje malsonante, sin apuestas; **sí nombra
  alcohol**: hay fichas de bodegas y guachinches (43 lugares nombran vino,
  bodega o guachinche), sin venderlo; los usuarios no se comunican entre sí
  ni comparten contenido; la ubicación no se comparte con otros usuarios; sin
  compras.
- **ID de publicidad:** No, si el paquete de PWABuilder no declara el permiso
  `AD_ID` (Play Console lo dice al subirlo si lo lleva): Google Analytics, en
  la web, va con cookies, no con el ID de publicidad de Android.
- **Apps gubernamentales, funciones financieras, noticias:** no.
- **Declaración de apps de salud.** La pide Google a todas las apps, también a
  las que no tienen nada de salud. El perfil (opcional) guarda peso, peso
  objetivo, altura y los kilómetros que se anoten (§2, «Perfil»: «el peso y la
  altura son datos de salud»). En el formulario, eso es **Actividad y forma
  física** (incluye «measuring body composition and weight») y **Nutrición y
  control del peso** («supporting weight loss or weight management goals»).
  La app tiene también el panel de emergencias (SOS: los teléfonos y los
  avisos oficiales): si la descripción de **Emergencias y primeros auxilios**
  lo cubre, marcarla también. Esa descripción no se ha podido leer desde
  aquí.

## 4. Seguridad de los datos

Lo que va al formulario sale de la política (`privacidad.html`, §2 a §5).
La app de Google Play es la web: **lleva Google Analytics si se acepta el
aviso de cookies** (la de la App Store, no). Por eso aparecen aquí datos que en
la App Store no están.

- ¿Recoge o comparte datos de usuario? **Sí.**
- ¿Van cifrados en tránsito? **Sí** (todo va por HTTPS: §9).
- ¿Se puede pedir que se borren? **Sí:** desde la app («Cuenta» → «Eliminar
  cuenta») y en `https://tenerifego.app/borrar-cuenta.html`, que es la URL
  que pide el formulario para borrar la cuenta.
- Cómo se crea la cuenta: con correo y contraseña.

Ningún dato se **comparte** (en el sentido de Google): Supabase y Google
Analytics los tratan por cuenta de la app, y lo que va a OSRM y a Nominatim
sale porque la persona lo pide (una ruta, una dirección). Todos son
**opcionales**. No se marca ninguno como «tratado de forma efímera»: eso
depende de cómo lo traten esos servicios, y no se puede comprobar.

| Tipo de datos (Play) | Qué es en la app | Para qué | Política |
|---|---|---|---|
| Ubicación precisa | origen y destino de una ruta en coche, a OSRM | Funciones de la app | §2 Geolocalización, §5 |
| Ubicación aproximada | el país que Google Analytics saca de la IP, si se aceptan las cookies | Analíticas | §3 |
| Correo electrónico | el de la cuenta (Supabase) | Gestión de la cuenta | §2 Cuenta |
| ID de usuario | el de la cuenta (Supabase) | Gestión de la cuenta | §2 Cuenta |
| Nombre | el nombre o apodo del perfil, en la cuenta con su permiso | Funciones de la app | §2 Perfil |
| Otra información personal | el año de nacimiento del perfil, en la cuenta con su permiso | Funciones de la app | §2 Perfil |
| Información de salud | peso, peso objetivo y altura, en la cuenta con consentimiento expreso | Funciones de la app | §2 Perfil |
| Información de actividad física | los kilómetros que anote, en la cuenta con su permiso | Funciones de la app | §2 Perfil |
| Interacciones con la app | las pantallas vistas, a Google Analytics, si se aceptan las cookies | Analíticas | §3 |
| Historial de búsqueda en la app | el texto de una dirección que se busca, a Nominatim | Funciones de la app | §5 |
| Otras acciones | los favoritos, con cuenta | Funciones de la app | §2 Favoritos |
| ID de dispositivo u otros | la suscripción a las notificaciones (dirección de envío y claves) y la cookie de Google Analytics | Funciones de la app; Analíticas | §2 Notificaciones, §3 |

No se recogen: fotos ni vídeos (la cámara no sale del móvil), audio,
archivos, calendario (los `.ics` se crean en el móvil), contactos, mensajes,
datos financieros, historial web, ni diagnósticos (la app no manda informes de
errores). Las visitas comprobadas se quedan en el móvil (§2 Perfil).

## 5. Prueba cerrada y producción

1. Antes, en el móvil, con la app de la prueba: crear una cuenta de usar y
   tirar y borrarla con «Cuenta» → «Eliminar cuenta». Si no la borra, falta
   `supabase/borrar-cuenta.sql` en Supabase, y Google revisa que se pueda.
2. *Probar y publicar → Pruebas cerradas*: una lista con los correos de los
   testers (12 como mínimo), subir el `.aab` de PWABuilder y mandar a
   revisión.
3. Los testers se apuntan desde el enlace de la prueba y la instalan desde
   Google Play. Catorce días seguidos con 12 dentro.
4. Entonces, *Panel → Solicitar acceso a producción*; Google pregunta por la
   prueba (cómo se hizo, qué se cambió) y, con el visto bueno, producción.

Cada paso de *Enviar a revisión* lo pulsa Jerome.
