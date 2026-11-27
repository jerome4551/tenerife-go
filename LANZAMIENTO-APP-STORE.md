# De la PWA a la App Store

Jerome, 21 de octubre de 2026: «P4. Quiero competir en lo mejor». Las apps
del cielo con las que se compite (`APPS-DEL-CIELO-COMPETENCIA.md`) están en
la App Store; Tenerife Go tiene que estar donde la gente busca al bajar del
avión. Este documento es el camino entero: lo que ya está hecho y auditado
aquí, lo que solo se puede hacer en un Mac con Xcode, lo que Jerome tiene que
decidir o aportar, y lo que se mira en App Store Connect campo a campo. Las
cifras y las reglas de Apple llevan la página de donde salen y el día en que
se leyó (al final).

## 1. Qué es la app de la tienda

**La misma aplicación.** No hay una segunda app que mantener: `app/www/` es
`index.html` y lo que pide en el móvil, copiado tal cual por
`tools/app_preparar.js`, dentro de un envoltorio nativo (Capacitor 8, un
WKWebView). La única diferencia con la web es una línea que el preparador
pone al principio de `index.html`: `window.TGO_NATIVO = true`. Con ella:

| Qué | En la web | En la app de la tienda |
|---|---|---|
| Caché sin conexión | El service worker (`sw.js`) guarda `index.html`, el módulo del cielo, el mapa de la isla… | No hay service worker: todo lo de la app viaja dentro del paquete (26,0 MB, 96 ficheros): el mapa, los lugares, las guaguas, el cielo entero, los idiomas y, desde el 22 de octubre, la librería de la cuenta (`vendor/supabase.js`, la misma versión y la misma huella que antes venía de jsDelivr). WKWebView no registra service workers en el esquema `capacitor://`. |
| Datos que cambian a diario (precios, avisos de AEMET, elementos de los satélites) | Red primero, caché de respaldo (el service worker) | `tgoFetchDatos()`: primero la copia viva de `https://tenerifego.app/datos/…` con 8 s de plazo, leída entera y comprobada (que sea JSON); si no llega, no responde bien, se corta a medias o no es JSON (un portal cautivo), la copia que viaja dentro (la del día en que se montó la app). |
| «Instalar la app», botón flotante de la PWA | Salen | No salen: ya está instalada. |
| Avisos push | Web Push con `sw.js` | WKWebView no tiene Web Push: los dos botones «Activar notificaciones» (el de la cuenta y el de «Continuar como invitado») y sus mensajes van ocultos, y `pushInit()` no pregunta nunca. Los avisos nativos (APNs) son otro trabajo (§8). |
| Google Analytics y el aviso de cookies | No hay desde el 30 de octubre de 2026 (hasta entonces, GA4 solo si se aceptaba el aviso). Al abrir, se borran la respuesta al aviso y las cookies `_ga` que quedaran de antes | No hay: hasta el 30 de octubre la marca lo apagaba, y desde ese día no está en ninguna parte. La política lo dice («La app no usa Google Analytics ni ninguna otra herramienta de estadísticas», `ppStatsNo`). Para saber cuánto se usa, App Store Connect tiene su propia analítica (*App Analytics*). |
| El mapa detallado (`tenerife-osm.pmtiles`, 12 MB) | Se descarga desde la app y se guarda en Cache Storage | Viaja dentro: «nada que descargar ni borrar». |
| Confirmar el correo de la cuenta | Supabase vuelve a la web | Vuelve a la web viva (`capacitor://localhost` no es una dirección a la que volver). |
| Compartir un lugar | El enlace de la web | El enlace de la web viva (ya lo hacía con `capacitor://`). |
| «Antes de subir al Teide» (el cielo, «Dónde ir») | Mira en la caché del móvil los seis ficheros del panel | «Guardado en el móvil» siempre: viajan en el paquete. |
| La CSP | `connect-src 'self' …` | `connect-src` lleva además `https://tenerifego.app`, para esos datos. |
| El asistente | Sus respuestas | En cuatro, la suya (`faq/fuente/nativo/respuestas.json`, once idiomas): «¿Funciona sin conexión?» (desde la primera vez; «Satélite» y «Topo» con red), «¿Cómo instalo la app?» (ya está instalada: nada de navegador ni de otras plataformas, directriz 2.3.10), «¿Qué datos guarda la app?» (sin las notificaciones, que en la app no hay) y «¿Puedo recibir una frase cada mañana?» (no manda notificaciones). |
| Sin permiso para la cámara o los sensores | «Se puede dar en los ajustes del navegador» | Sin esa frase (`cieloCamaraPermisoApp`, `cieloSensoresPermisoApp`): dónde se vuelve a dar en iOS se mira en el iPhone (§7, 1). |

Todo lo demás (el mapa, las 183 líneas, los 1043 lugares, el cielo entero
con «Apunta al cielo», los satélites, la noche guiada, el sistema solar, la
luz roja, los once idiomas) es el mismo código y se comporta igual.
`tools/probar_app.js` lo comprueba en Chromium: con la marca y sin ella.

## 2. Lo que está hecho aquí y auditado (sin Mac)

| Fichero | Qué |
|---|---|
| `index.html` | El bloque `TGO-NATIVO` de la cabecera (`TGO_NATIVO`, `TGO_BASE_VIVA`, `tgoFetchDatos`) y las diez puertas que miran la marca (service worker, «instalada» —que quita el banner—, botón flotante, el botón de push y `pushInit`, mapa detallado ×2, correo de confirmación, enlace de compartir y las respuestas del asistente; las tres de Google Analytics —su configuración, `tgoLoadGA()` y el aviso de cookies— se fueron con él el 30 de octubre de 2026); `connect-src`. En la web nada cambia (`probar_app.js` lo mira). |
| `modulos/cielo.js` | Los elementos de los satélites se piden con `tgoFetchDatos` si existe (`pedir`); `cacheListo()` da «guardado» con la marca. |
| `tools/app_preparar.js` | Monta `app/www/` (lista cerrada de lo que viaja; nada de carpetas de trabajo ni controles) y escribe las plantillas de iOS que salen de la política de privacidad; `--comprobar` coteja que no falta nada de lo que `index.html`, las dos páginas fijas y `sw.js` piden, que `www/index.html` es el de la raíz más esa línea, y que las plantillas son las de hoy. |
| `app/capacitor.config.json`, `app/package.json`, `app/LEEME.md`, `.gitignore` | El proyecto de Capacitor (8.x; `app/www/`, `app/ios/App/` y `node_modules/` fuera de git). |
| `app/ios/plantillas/Info.plist.fragmento.plist` | Lo que el `Info.plist` de Capacitor no trae: los tres permisos con las frases de la política (castellano), los once idiomas (`CFBundleLocalizations`), `ITSAppUsesNonExemptEncryption = false` (solo HTTPS), las orientaciones. |
| `app/ios/plantillas/<idioma>.lproj/InfoPlist.strings` | Las frases de la ubicación, los sensores y la cámara en los once idiomas, **sacadas de `idiomas/privacidad/<idioma>.json`**: el permiso dice lo mismo que la política. Si la política cambia y no se vuelve a pasar el preparador, `auditar.sh` para. |
| `app/ios/plantillas/PrivacyInfo.xcprivacy` | El manifiesto de privacidad: sin rastreo, sin dominios de rastreo, y los datos que la política dice que salen (correo e id de usuario ligados a la cuenta, los favoritos, las coordenadas de una ruta o del tiempo y el texto de una búsqueda); sin analítica, porque en la app no hay Google Analytics. |
| `app/ios/plantillas/AppIcon-1024.png`, `Splash-2732.png` | El icono a 1024 **ampliado del de 512** (§3, punto 3) y el arranque cuadrado (el de 2048×2732 centrado sobre su fondo). |
| `app/ios/plantillas/aplicar.sh` | Lo pone todo en el proyecto que genera `npx cap add ios` (PlistBuddy, copias). Comprobado en seco: aquí no hay Mac. |
| `datos/app-store/ficha.json` | La ficha de la tienda en los once idiomas: nombre, subtítulo, texto promocional, descripción, palabras clave, y las direcciones, el copyright y la categoría. Cada frase dice solo lo que la app hace. |
| `tools/auditar_app_store.js` | La ficha contra los límites de Apple (30/30/170/4000 caracteres, 100 bytes de palabras clave, ninguna de dos letras, ningún nombre de otra empresa o app en ellas), contra las directrices (ni otras plataformas, ni otras apps, ni «número uno», ni promesas que la app no cumple: fotos, push, «sin anuncios», en los once idiomas) y contra lo que hay (1043 lugares, 183 líneas, siete costas, once idiomas, las fuentes del README, los nombres de «Apunta al cielo» y de «Organiza tu día» tal como los dice la app en cada idioma, sin prometer la hora de la guagua ni el municipio de cada lugar), en cada idioma y en su idioma; y la variante en-US. |
| `tools/capturas_app_store.js` | Las capturas en los tamaños obligatorios (iPhone 1206×2622, iPad 2064×2752), siete por aparato, de la app de verdad: el mapa de la isla, un lugar (la hoja en el iPhone, el globo en el iPad), las paradas cerca, «Organiza tu día», «Esta noche», «Apunta al cielo» y el sistema solar; si un estado no llega a lo que dice, para. Sin rótulos: si Jerome los quiere, se ponen encima. |
| `tools/probar_app.js` | El modo nativo en Chromium (§1) y la web sin la marca. |
| `tools/auditar.sh` | Los tres controles nuevos. |

## 3. Lo que Jerome tiene que decidir o aportar

1. **La cuenta de desarrollador.** El Apple Developer Program cuesta 99 USD
   por año de membresía (o el equivalente en moneda local). Como persona
   física o autónomo, la app sale en la tienda con el nombre del
   desarrollador. Con la cuenta: Xcode firma, TestFlight y App Store
   Connect.
2. **El identificador de la app** (`appId` de `capacitor.config.json`):
   **`tenerifego.app`**, decidido por Jerome el 30 de octubre de 2026 («Yo
   quiero tenerifego.app»), el mismo que el dominio y el mismo en Google
   Play. **No se puede cambiar después de publicar.** Lo habitual es
   escribirlo con el dominio al revés, pero es una recomendación: Apple
   solo pide letras, números, guiones y puntos, y Android, al menos dos
   partes separadas por un punto que empiecen por letra.
3. **El icono a 1024×1024.** App Store Connect lo pide a ese tamaño y sin
   transparencia; el del repositorio es de 512 y el de la plantilla está
   ampliado. Se ve bien, pero el original a 1024 (o el vectorial del que
   salió) lo dejaría exacto: `app/ios/plantillas/AppIcon-1024.png`.
4. **Los datos de contacto de la revisión** (nombre, correo, teléfono en
   formato internacional, `+34…`). El de la política (`privacidad.html`) ya
   es público: Jérôme Bourgeois · tenerife.go.app@gmail.com.
   Y, para la vía sin Mac (§9): la clave API de App Store Connect, el Team
   ID, un repositorio privado para la firma y los secretos en GitHub; todo
   desde el móvil.
5. **Si se quieren rótulos en las capturas** («Funciona sin conexión», «El
   cielo del Teide»…), en los once idiomas, encima de las capturas de
   `capturas_app_store.js`. Sin rótulos también valen.
6. **El riesgo de la directriz 4.2** («Minimum Functionality»: la app tiene
   que ir «más allá de una web reempaquetada»). Tenerife Go no carga su
   contenido de fuera: el mapa, los lugares, las guaguas y el cielo viajan
   dentro y funcionan sin red; usa la cámara, la brújula y los sensores y
   calcula el cielo en el móvil. De fuera vienen los datos del día y lo
   que se consulta en vivo (el tiempo y el mar; y,
   al pedirlo, las rutas, las direcciones, los precios del Ministerio y
   Wikipedia). Eso es lo que se le dice al revisor en las notas (§5.5). Si aun así la rechazan por 4.2, el camino es
   responder con esa lista y, si insisten, añadir una pieza nativa (los
   avisos APNs del §8 serían la primera).

## 4. En el Mac, paso a paso (sin Mac: §9)

Hace falta un Mac con **Xcode 26.0 o más** (Capacitor 8 lo exige; desde el
28 de abril de 2026 Apple exige además que todo lo que se suba esté
compilado con el SDK de iOS 26), **Node 22 o más** y la cuenta del punto 3.1
metida en Xcode (Settings → Accounts).

```
git clone https://github.com/jerome4551/tenerife-go && cd tenerife-go/app
npm install                              # @capacitor/core, cli e ios 8.x
node ../tools/app_preparar.js            # monta www/ (96 ficheros, 26,0 MB)
npm run ios:anadir                       # «npx cap add ios» (Swift Package Manager) y aplicar.sh: permisos, idiomas, privacidad, icono, arranque
npx cap open ios                         # Xcode
```

`npx cap add ios` a secas no arranca: Capacitor para si ya existe la carpeta
`ios/` («ios platform already exists»), y en ella viven las plantillas.
`npm run ios:anadir` las aparta un momento, genera el proyecto, las devuelve y
pasa `aplicar.sh` (comprobado el 22 de octubre de 2026 con Capacitor 8.5.3).

En Xcode, una vez:

1. Target **App** → General: *Team* (la cuenta), *Bundle Identifier* igual
   que `appId`, *Minimum Deployments* iOS 15.0 (lo que Capacitor 8 admite),
   *Version* 1.0.0 y *Build* 1.
2. Si `aplicar.sh` avisó de que los `.lproj` o `PrivacyInfo.xcprivacy` no
   están en el proyecto: File → *Add Files to "App"…*, marcando el target.
   Project → Info → *Localizations*: los once idiomas.
3. Signing & Capabilities: solo *Automatically manage signing*. La app no
   usa ninguna capacidad (ni push, ni mapas de Apple, ni compras).
4. Un iPhone conectado o el simulador: ▶. La primera pantalla es la
   bienvenida con los once idiomas, como en la web.
5. Product → **Archive** → *Distribute App* → *App Store Connect* → Upload.
   Antes, en el organizador, *Generate Privacy Report*: tiene que decir lo
   mismo que `PrivacyInfo.xcprivacy` (§5.4).

Cada vez que cambie algo en la raíz (un lugar, un texto, el módulo del
cielo): `node ../tools/app_preparar.js && npx cap sync ios`, subir el *Build*
en uno, Archive. Los datos que cambian a diario no necesitan nueva versión:
la app los pide a la web viva.

## 5. En App Store Connect, campo a campo

### 5.1 La app

- *Platforms*: iOS. *Name*: Tenerife Go. *Primary language*: Spanish
  (Spain). *Bundle ID*: el de 3.2. *SKU*: `tenerife-go`.
- *Category*: Travel; secundaria Navigation (`ficha.json`). *Content
  Rights* («¿contiene, muestra o accede a contenido de terceros?»): **sí**,
  y se tienen los derechos: datos con licencia abierta y su atribución en
  la app (OpenStreetMap, ODbL; el GTFS de TITSA; los resúmenes de Wikipedia
  con su enlace; los catálogos astronómicos y las librerías de
  `vendor/LICENSE-*`; los precios y los avisos son datos públicos del
  Ministerio y de la AEMET, con su procedencia en cada fichero). En App
  Store Connect en español (24 de noviembre de 2026): «Información de la
  app» → «Derechos sobre el contenido» → «Configurar la información de
  derechos sobre el contenido»; queda «Sí, esta app tiene los derechos
  necesarios sobre su contenido de terceros». No pide ningún documento.
- *Age Rating* (el cuestionario nuevo, con las edades de iOS 26: 4+, 9+,
  13+, 16+ y 18+): todo «No / Ninguno» salvo dos respuestas, las dos por
  «Su cuerpo» (`modulos/cuerpo.js`). *Health or Wellness Topics*: **sí**
  (ejercicios, rutinas y el diario de raciones; Apple: «self-care or
  lifestyle recommendations… calorie tracking, dieting advice, or exercise
  recommendations», 9+). *Medical or Treatment Information*:
  **infrecuente** (donde toca la salud manda al médico o al
  dietista-nutricionista, y en las respuestas que lo piden lleva el 112 o
  el 024, `datos/cuerpo/asistente-*.json`; Apple:
  «guidance around the management of medical conditions or health and
  wellness… emergency medical care», 13+). Sale **13+**. *Advertising*: no,
  mientras no haya negocios patrocinados de pago (con ellos, sí, y no sube
  la edad). *Unrestricted Web Access*: no (los enlaces de fuera se abren en
  Safari, no en un navegador dentro de la app, que daría 16+). Hasta el 23
  de noviembre de 2026 aquí ponía «todo No → 4+», que era de antes de «Su
  cuerpo». El 24 de noviembre de 2026, en el cuestionario en español (siete
  pasos; el 3 es «Medicina o bienestar»), el primer intento dio 16+ (Brasil,
  A16; Corea, 15+). En la tabla de Apple para iOS 26
  (developer.apple.com/help/app-store-connect/reference/age-ratings), a 16+
  solo llevan el acceso web sin restricciones, la información médica
  frecuente y los temas sugerentes frecuentes; se repasó el cuestionario
  (el acceso web, en «No») y salió **13+**: 172 países; Vietnam y la
  República de Corea, 12+; Brasil, A12. La «URL de edades idóneas», vacía.
- *Pricing*: Free; *Availability*: todos los países **menos China
  continental**. Para China continental, App Store Connect pide (dos avisos
  en la página de la app, 23 de noviembre de 2026) el justificante de una
  evaluación de seguridad con su informe y una declaración de servicios de
  contenido generado por IA (AIGC) con su información de registro, para las
  apps nuevas desde el primer día: trámites ante el gobierno chino. Se quita
  en la app → *Pricing and Availability* («Precio y disponibilidad») → la
  disponibilidad → «China continental». La ficha en chino sigue llegando a
  Taiwán, Hong Kong, Singapur y al resto de países. Hecho el 24 de
  noviembre de 2026. En el iPhone no se encontró en el menú de secciones,
  y se abrió con su dirección:
  `https://appstoreconnect.apple.com/apps/6838506206/distribution/pricing`.
  «Calendario de precios» → «Añadir precios»: país o región base, España
  (EUR); 0,00 €, y 0 en todos. «Disponibilidad de la app» → «Configurar
  disponibilidad»: todos menos China continental; queda «Disponibles: 174»
  y «1 No disponible». La «Categoría fiscal», la que viene. En «Información
  de la app» no hace falta nada de «Documentación sobre encriptación» (el
  `Info.plist` ya lo dice, §5.6), «Notificaciones del servidor de App
  Store» ni «Secreto compartido específico de la app» (son de las compras
  dentro de la app, y no hay).
- *App Privacy*: §5.4. *Privacy Policy URL*:
  `https://tenerifego.app/privacidad.html`.

### 5.2 La ficha, por idioma

De `datos/app-store/ficha.json`, idioma a idioma. Las localizaciones que
existen en App Store Connect y a qué idioma de la app corresponden:

| Idioma de la app | Localización de la tienda |
|---|---|
| es | Spanish (Spain) |
| en | English (U.K.) y English (U.S.) (la misma ficha) |
| fr | French |
| de | German |
| it | Italian |
| nl | Dutch |
| zh | Chinese (Simplified) |
| zht | Chinese (Traditional) |
| pl | Polish |
| ro | Romanian |
| bg | **No existe el búlgaro** en App Store Connect: en Bulgaria la tienda enseña la ficha de English (U.K.). La app, dentro, sí va en búlgaro. La ficha en búlgaro queda en `ficha.json` por si Apple la añade. |

Campos y límites (los coteja `auditar_app_store.js`): *Name* 2–30, *Subtitle*
≤ 30, *Promotional Text* ≤ 170 (se puede cambiar sin nueva versión),
*Description* ≤ 4000 en texto plano, *Keywords* ≤ 100 **bytes** (en chino y
búlgaro cada letra son 2 o 3), *Support URL* y *Marketing URL* de
`ficha.json`, *Copyright* «2026 Jérôme Bourgeois». *What's New* no existe en
la primera versión.

### 5.3 Las capturas

Con `app/www/` servido en el 8766 (`node tools/app_preparar.js` y
`python3 -m http.server 8766 --directory app/www`: la app de la tienda, con
la marca; la raíz es la web, sin el mapa detallado dentro y con el botón
flotante de la PWA, ⓘ, y la herramienta para si no ve la marca),
`node tools/capturas_app_store.js 8766 --idiomas=todos` (`--solo=ficha` rehace
solo un estado) deja en `capturas-app-store/<idioma>/` siete capturas de
iPhone (1206×2622, la
pantalla «con Dynamic Island, mediana», la obligatoria) y siete de iPad
(2064×2752, la de 13", obligatoria si la app va en iPad). PNG sin
transparencia, hasta diez por tamaño; Apple escala las demás pantallas desde
estas. Se suben en el orden del nombre (1 el mapa… 7 el sistema solar). Las
capturas son de la app de verdad; la noche del cielo es la de las Gemínidas
de 2026 (fija para que salgan iguales en cada pasada) y el mapa es el de la
isla que viaja dentro.

### 5.4 App Privacy (las respuestas, con la frase de la política de donde salen)

Apple pregunta por los datos que **salen del dispositivo**. Lo que la
política ya dice (`idiomas/privacidad/es.json`), y es lo que declara
`PrivacyInfo.xcprivacy`:

| Dato | ¿Se recoge? | Ligado a la identidad | Para rastrear | Finalidad | De la política |
|---|---|---|---|---|---|
| Email Address | Sí (cuenta opcional) | Sí | No | App Functionality | «Cuenta (opcional): correo electrónico y contraseña. Los gestiona Supabase» |
| User ID | Sí (cuenta opcional) | Sí | No | App Functionality | la cuenta de Supabase |
| Other User Content (favoritos; y del perfil, el avatar y las unidades) | Sí (con cuenta) | Sí | No | App Functionality | «Favoritos: los identificadores de los lugares que guardas. Con cuenta se sincronizan» |
| Name (Contact Info: «Such as first or last name») | Sí (el nombre o apodo del perfil, en la cuenta solo con permiso) | Sí | No | App Functionality | el perfil (`ppDatosPerfil`, bloque 5 del perfil): se guarda en la cuenta solo si la persona lo activa y toca «Acepto» |
| Health («any other user provided health or medical data») | Sí (la altura, el peso objetivo y los pesos del perfil, en la cuenta solo con permiso) | Sí | No | App Functionality | lo mismo; el permiso dice que el peso y la altura son datos de salud y que se da expresamente |
| Fitness («exercise data») | Sí (los kilómetros que se anotan, en la cuenta solo con permiso) | Sí | No | App Functionality | lo mismo |
| Precise Location | Sí (al pedir una ruta o el tiempo) | No | No | App Functionality | «Si pides una ruta en coche, las coordenadas de origen y destino se envían al servicio de rutas»; «Open-Meteo: las coordenadas del lugar o de la zona cuya previsión consultas» |
| Search History | Sí (al buscar una dirección) | No | No | App Functionality | «Nominatim: el texto que escribes al buscar una dirección» |
| Product Interaction, Coarse Location, Device ID, Crash Data, Photos, Contacts, Purchases, Advertising Data… | No | | | | «La app no usa Google Analytics ni ninguna otra herramienta de estadísticas» (`ppStatsNo`); la cámara y los sensores «no salen del móvil»; sin el IDFA; sin SDK de fallos |

Sin analítica: desde el 22 de octubre de 2026 la app de la tienda no llevaba
Google Analytics, y desde el 30 no está en ninguna parte, tampoco en la web;
`app_preparar.js` y `probar_app.js` lo comprueban, y la política lo dice. Si
algún día se quisiera medir el uso dentro de la app, habría que declarar Product
Interaction, Coarse Location y Device ID (Analytics): Apple pide declarar
también lo que recogen los terceros cuyo código va en la app («including
the practices of third-party partners whose code you integrate into your
app»), y la excepción de lo opcional no vale para algo que recoge cada vez
que se usa la app (developer.apple.com/app-store/app-privacy-details,
leído el 21 de octubre de 2026).

Las tres del perfil (Name, Health, Fitness) solo salen del móvil si la
persona lo pide en «Cuenta» y toca «Acepto» (`supabase/perfil.sql`; la
fila de `perfiles` es ese permiso). Apple las define en
developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacycollecteddatatypes/nsprivacycollecteddatatype
(leído el 22 de octubre de 2026); las visitas comprobadas no salen del
móvil y no se declaran.

*Do you or your third-party partners use data for tracking?*: **No** (ni
analítica ni ninguna red publicitaria dentro de la app). Apple dice que el manifiesto del propio paquete no tiene
que cubrir los SDK de terceros: Capacitor trae el suyo.

### 5.5 App Review Information

- *Sign-in required*: **No**. La cuenta es opcional (directriz 5.1.1 (v):
  la app se usa sin iniciar sesión, y se puede borrar desde dentro:
  «Cuenta» → «Eliminar cuenta», y `borrar-cuenta.html`).
- *Contact*: los del punto 3.4.
- *Notes* (hasta 4000 bytes, en el idioma que sea). Propuesta, en inglés:

> Tenerife Go is a free travel guide for the island of Tenerife. All of its content ships inside the app and works offline: the island map (vector tiles bundled), 1043 places, the 183 bus and tram lines, and a night-sky module computed on the device (Astronomy Engine) with an AR view that uses the camera, compass and motion sensors. The app does not load its interface from a remote web view. What it does fetch over the network: small daily data files (fuel prices, weather warnings, satellite orbital elements) from our site, with bundled copies as fallback; weather and sea forecasts (Open-Meteo); and, when the user asks for them, live fuel prices (Spanish Ministry open data), driving routes (OSRM), address search (Nominatim) and Wikipedia summaries.
> Permissions are optional and asked in context: location (map and routes), camera and motion (only inside "Point at the sky"). The account is optional (email + password, our own system) and can be deleted from inside the app (Account → Delete account). The "Your body" section (exercises, training routines, a portion diary) works on the device and cites its sources; where it touches on health, it refers people to a doctor, or to 112 in an emergency. No in-app purchases, no subscriptions, no third-party ad networks; a local business that pays for a promotion is labelled as sponsored (there are none at the moment). Privacy policy: https://tenerifego.app/privacidad.html

### 5.6 Antes de pulsar *Submit for Review*

TestFlight en un iPhone de verdad (§7), la ficha en las once localizaciones
de §5.2, las capturas, App Privacy, *Export Compliance* contestado por el
`ITSAppUsesNonExemptEncryption = false` del `Info.plist` (solo HTTPS: cifrado
exento), *Content Rights*, *Advertising Identifier*: **No** (la app no usa el
IDFA).

El botón está en la página de la versión,
`https://appstoreconnect.apple.com/apps/6838506206/distribution/ios/version/inflight`:
arriba, «Añadir para revisión», y luego «Enviar a revisión». El 24 de
noviembre de 2026 acabó en «1 artículo enviado. La revisión puede tardar
hasta 48 horas. Recibirás un correo electrónico cuando se haya
completado».

Y dos cosas que se vieron el 23 de noviembre de 2026: la disponibilidad sin
China continental (§5.1), y los avisos de la subida. En TestFlight →
*Build Uploads* («Cargas de compilaciones»), una compilación con avisos
queda «Finalizado» con un triángulo amarillo, y se leen tocando el estado.
La 1.0.0 (4) trae uno solo, leído el 24 de noviembre: «90725: SDK version
issue. This app was built with the iOS 26.5 SDK. Starting April 2027, iOS
and iPadOS apps must be built with the iOS 27 SDK or later, included in
Xcode 27 or later, in order to be uploaded to App Store Connect or
submitted for distribution». No para nada hoy (la compilación está «Lista
para enviar»); antes de abril de 2027, el flujo tiene que compilar con
Xcode 27 (§8).

## 6. Lo que las directrices miran, y cómo está

| Directriz | Cómo está Tenerife Go |
|---|---|
| 4.2 Minimum Functionality («beyond a repackaged website») | Todo dentro, sin red, cámara, brújula y sensores, cálculo en el móvil; nada se carga de una web remota. Las notas del §5.5 lo dicen. Es el riesgo que queda (3.6). |
| 4.8 Login Services | Solo se exige otro servicio de acceso si la app usa un login de terceros o social; Tenerife Go «exclusively uses your company's own account setup and sign-in systems» (correo y contraseña en Supabase): no hace falta. |
| 5.1.1 (v) Account Sign-In | Se usa sin cuenta; con cuenta, se borra desde la app. |
| 5.1.1 (i)–(iii) Privacy | Política con dirección propia, permisos con su frase en cada idioma, nada se pide hasta que hace falta. |
| 2.3.10 Accurate Metadata | La ficha no nombra otras plataformas ni otras apps (`auditar_app_store.js` lo impide), y las capturas son de la app. |
| 2.5.4 (background) | No hay modos en segundo plano. |
| 5.2 Intellectual Property | Datos públicos con licencia y procedencia (`AUDITORIA-FINAL.md`, README). |

## 7. Probar en un iPhone de verdad (TestFlight), lo que ningún control puede

1. **Permisos**: al abrir «Apunta al cielo», los sensores (WebKit los pide
   con su propio aviso, o Capacitor los concede; comprobar cuál de los dos
   pasa) y, con 📷, la cámara; al tocar «GPS», la ubicación. La cámara y la
   ubicación tienen que salir con la frase de la política en el idioma del
   móvil (las de `InfoPlist.strings`). Rechazar y volver a aceptar en
   Ajustes. Si la cámara y los sensores se vuelven a dar ahí, el aviso de
   la app puede decirlo (hoy, dentro de la app, solo dice que el cielo
   funciona igual).
2. **La cámara en «Apunta al cielo»** (`getUserMedia` existe en WKWebView
   desde iOS 14.3): las estrellas sobre la imagen, y 📸 compone la captura
   y la comparte.
3. **La brújula** con la Luna o el Sol (`PARA-CLAUDE-CODE-4.md`), y la
   comprobación de la brújula.
4. **Modo avión** con la app recién instalada (sin haberla abierto nunca
   con red): el mapa de la isla, las guaguas, el cielo entero con los
   satélites (los elementos de dentro, con su fecha en el aviso), la noche
   guiada, el sistema solar. «Dónde ir» → «Antes de subir al Teide».
5. **Con red**: los precios y los avisos de AEMET son los de hoy (los pide a
   la web viva), no los del día en que se montó la app. Es la única
   comprobación real de que GitHub Pages deja esa petición desde
   `capacitor://localhost` (responde `Access-Control-Allow-Origin: *` en los
   sitios públicos; desde aquí no se ha podido comprobar y ningún control
   automático lo cubre: Playwright no aplica CORS). Si no la dejara, la app
   no se rompería: caería a la copia de dentro, sin avisar.
6. **Enlaces de fuera** (Wikipedia, «Cómo llegar en coche», TITSA, la
   política): se abren en Safari, no dentro de la app sin forma de volver.
   `tel:112` llama. Compartir un lugar: la hoja de iOS, con el enlace de la
   web.
7. **La cuenta**: crear una, el correo de confirmación vuelve a la web viva
   (abre Safari); entrar en la app; un favorito sincroniza; «Eliminar
   cuenta» la borra.
   Para probarla con una dirección nueva sin otro buzón:
   `tenerife.go.app+prueba@gmail.com` (Gmail la deja en el buzón de
   siempre; para Supabase es otra cuenta). Con una dirección que ya tiene
   cuenta, Supabase no manda nada, a propósito (en su registro,
   `user_repeated_signup`), y la app dice lo mismo que con una nueva.
   Después de «Eliminar cuenta», el registro de Supabase trae un `/logout`
   con 403 («User from sub claim in JWT does not exist»): es el esperado, el
   `signOut` de `vendor/supabase.js` llama a `/logout` y no cuenta el 401,
   el 403 ni el 404. El campo `referer` de ese registro no dice desde dónde
   se hizo (la app o la web): es el `redirect_to` o la *Site URL*.
   **El perfil**: «Cuenta» abre «Su perfil»; «Descargar datos del perfil»
   abre la hoja de compartir con `tenerife-go-perfil.json`, como 📸 en el
   cielo (en WKWebView no se ha podido probar desde aquí).
8. **La barra de estado y el borde inferior** en un iPhone con Dynamic
   Island y en un iPad: nada tapado (la cabecera ya respeta
   `env(safe-area-inset-top)`), y la luz roja pone en rojo lo que se ve.
9. Vertical y apaisado, iPhone e iPad.

## 8. Lo que es otro trabajo (y no bloquea la primera versión)

- **Avisos nativos (APNs)**: la frase diaria de `enviar-notificacion.js`
  llega hoy por Web Push a la web; en la app harían falta `@capacitor/push-notifications`,
  la clave APNs en la cuenta de Apple y un envío aparte. Hasta entonces, el
  botón va oculto en la app.
- **Enlaces universales** (`https://tenerifego.app/#lugar=…` abriendo la
  app en vez de Safari): `apple-app-site-association` en la raíz del
  dominio, dentro de `.well-known/` (con Jekyll hay que incluir la carpeta a
  mano, o publicar sin Jekyll). Desde el 28 de octubre de 2026 la app tiene
  su dominio, `tenerifego.app`, así que ya se puede; sigue sin ser necesario
  para la primera versión.
- **Google Play**: el TWA de PWABuilder (el documento de Jerome «De la
  PWA a Google Play», tres fases; la Fase 1 está en `AUDITORIA-FINAL.md`),
  que no necesita nada de esto: la PWA tal cual.
- **Sign in with Apple**: no se exige (§6); si algún día se añade Google
  Sign-In, entonces sí.
- **Xcode 27, antes de abril de 2027** (el aviso 90725, §5.6): desde
  entonces Apple no acepta compilaciones hechas con un SDK anterior al de
  iOS 27. La máquina `macos-26` del flujo trae de Xcode 26.0 a 26.6 y
  ninguno 27 (el registro del 23 de noviembre). GitHub tiene una imagen
  aparte, `runs-on: xcode-27` (solo arm64, sobre macOS 27), general desde
  el 15 de octubre de 2026 (github.blog/changelog, «Xcode 27 runner image
  generally available»): el trabajo `testflight` pasa a esa etiqueta y el
  paso «Xcode 26» a elegir el Xcode 27 más alto que no sea beta. Se prueba
  con una compilación nueva en TestFlight antes de la versión que la
  necesite.

## 9. Sin Mac: desde el móvil, con una máquina macOS prestada

Todo el proyecto se ha llevado desde el móvil, y la App Store también se
puede. El Mac solo hace falta para *abrir Xcode*; compilar, firmar y subir lo
hace igual una máquina macOS en la nube, y GitHub la presta en los
repositorios públicos sin coste («Use of the standard GitHub-hosted runners is
free and unlimited on public repositories»; `tenerife-go` es público). El
flujo `.github/workflows/app-store.yml` y `app/fastlane/Fastfile` hacen, paso
a paso, lo del §4: montar `app/www/`, generar el proyecto de Capacitor,
aplicar las plantillas (y meter los `.lproj` y el manifiesto en el proyecto
con `incluir.rb`, lo que en Xcode sería «Add Files»), firmar, archivar y subir
a TestFlight; y, desde Linux, subir la ficha en las once localizaciones y las
capturas con `deliver`. Se lanza a mano desde la pestaña Actions del
repositorio (desde el móvil también), eligiendo `alta`, `testflight`, `ficha`
o `todo`. Nada pulsa «Submit for Review».

Lo que no vale sin Mac: Xcode Cloud («You need to configure your first Xcode
Cloud workflow in Xcode»). Lo comprobado el 22 de octubre, en una sesión con
npm y RubyGems: `npm install` (Capacitor 8.5.3), `npm run ios:anadir` (genera
el proyecto en Linux y devuelve las plantillas), `incluir.rb` contra el
proyecto que genera y el Fastfile con fastlane 2.241.1, parámetro a
parámetro (`AUDITORIA-FINAL.md`). Tres cosas no habrían arrancado y están
corregidas: `cap add` con la carpeta `ios/` ya creada, la ruta del proyecto
en `incluir.rb` y el alta con la clave API (abajo, el paso 6). Y una habría
salido mal sin pararse: las capturas se hacían de la web, no de la app de la
tienda (sin el mapa detallado, con el botón flotante de la PWA); ahora salen de
`app/www/`, y la herramienta para si no ve la marca. Lo que solo se ve en
GitHub: la firma, el archivo y las subidas; la primera ejecución es la
prueba, y sus registros dicen dónde para si para.

### 9.1 Lo que hace Jerome, desde el móvil

1. **El alta en el Apple Developer Program, desde el iPhone**, con la app
   «Apple Developer» de la App Store: «An iPhone or iPad with Touch ID, Face
   ID, or passcode enabled»; pide el Apple Account con verificación en dos
   pasos, el nombre legal y una foto del DNI o del pasaporte; 99 USD al año
   como suscripción. Apple tarda horas o días en aprobarlo.
2. **La clave API de App Store Connect** (web, appstoreconnect.apple.com →
   Users and Access → Integrations → App Store Connect API). La primera vez,
   el titular de la cuenta pulsa **Request Access**, marca la casilla de los
   términos y *Submit* (Apple: «the Account Holder must request access to the
   API»); luego *Team Keys* → *Generate API Key* (o «+»), papel *Admin*. Se
   descarga **una sola vez**, con el enlace «Descargar» de la clave, un
   fichero `AuthKey_XXXXXXXXXX.p8` (en el iPhone va a Archivos → Descargas);
   apuntar el *Key ID* y el *Issuer ID*.
3. **El Team ID**: developer.apple.com/account → Membership details.
4. **Un repositorio privado vacío en GitHub** para el certificado y el perfil
   cifrados (por ejemplo `tenerife-go-firma`), y un token de GitHub
   *fine-grained* solo para ese repositorio: Settings → Developer settings →
   Personal access tokens → Fine-grained tokens → *Only select
   repositories*: `tenerife-go-firma`; *Repository permissions* →
   *Contents*: «Read and write». Uno clásico con permiso `repo` también
   vale, pero abre todos los repositorios de la cuenta. El token va tal
   cual en el secreto `MATCH_GIT_TOKEN`, sin convertirlo en nada: el flujo
   hace con él lo que pide match. Si caduca, se genera otro y se cambia el
   secreto. Desde el iPhone, el 23 de noviembre de 2026, la página del
   *fine-grained* no pasó de su ventana de confirmación («Generate token» no
   hacía nada, tampoco con «Solicitar sitio web de escritorio»): se usó uno
   clásico (github.com/settings/tokens/new, solo `repo`, sin caducidad), que
   abre los dos repositorios de la cuenta. Un token no se pega nunca en un
   chat; si pasa, *Regenerate token* y se cambia el secreto.
5. **Los secretos**, en `tenerife-go` → Settings → Secrets and variables →
   Actions → New repository secret:

| Secreto | Qué |
|---|---|
| `ASC_KEY_ID` | el Key ID de la clave API |
| `ASC_ISSUER_ID` | el Issuer ID |
| `ASC_KEY_P8` | el contenido entero del `.p8` (con las líneas BEGIN y END). Desde el iPhone: Archivos → Descargas → ••• → Opciones de visualización → Mostrar todas las extensiones; renombrar el `.p8` a `.txt`, abrirlo, Seleccionar todo, Copiar. Si falta, `alta` para con «OpenSSL::PKey::ECError: invalid curve name», y en el registro `ASC_KEY_P8:` sale vacío |
| `APPLE_TEAM_ID` | el Team ID |
| `MATCH_GIT_URL` | `https://github.com/jerome4551/tenerife-go-firma.git` |
| `MATCH_GIT_TOKEN` | el token del punto 4, tal cual. La autorización que pide match (base64 de «jerome4551:token») la calcula el flujo y la tapa en los registros: el token no pasa por ningún conversor, ni por un chat |
| `MATCH_PASSWORD` | una contraseña larga inventada: con ella se cifra el certificado |
| `ASC_REVIEW_NAME`, `ASC_REVIEW_PHONE`, `ASC_REVIEW_EMAIL` | el contacto de la revisión (`Jérôme Bourgeois`, `+34…`, el correo) |

   Y una **variable** (no secreto) `MATCH_READONLY` que se pone a `1`
   **después** de la primera ejecución de `testflight` (la primera crea el
   certificado y el perfil; las siguientes solo los leen).

6. En orden: Actions → «App Store» → Run workflow → `alta`: crea el
   identificador (el Bundle ID) y mira si existe la ficha. La primera vez
   acaba en rojo diciendo que falta la ficha, y es lo esperado. Entonces,
   una sola vez, en App Store Connect (la web): Apps → «+» → *New App*: iOS,
   nombre «Tenerife Go», idioma Spanish (Spain), el Bundle ID
   `tenerifego.app`, SKU `tenerife-go`, acceso completo. La API de
   Apple no deja crear la ficha, y fastlane solo podría entrando con el
   Apple ID y la verificación en dos pasos, que un runner no tiene. Otra vez
   `alta` (ahora en verde); luego `testflight`; luego `ficha`. Cada
   ejecución deja sus registros; si algo para, el registro lo dice y se
   arregla en el repositorio.
7. En el iPhone, la app **TestFlight**: instalar el build y pasar el §7.
8. En App Store Connect (web): revisar la ficha que subió `deliver`
   (textos, capturas), contestar *App Privacy* con la tabla del §5.4, la
   clasificación por edades (§5.1: 13+), *Content Rights*, el precio
   (gratis) y los países (todos menos China continental, §5.1), leer los
   avisos de la subida (§5.6) y pulsar **Submit for Review**. Antes, una
   vez por cuenta, el DSA de la Unión Europea: *Business* («Negocio») →
   *Agreements* → *Compliance*, decir si se es comerciante; si se es, Apple
   comprueba y publica en la ficha de los países de la UE la dirección (o
   un apartado de correos), el teléfono y el correo. Apple lo pregunta al
   enviar una app nueva, aunque no se distribuya en la UE.

### 9.2 Lo que hace Claude Code (con npm)

- Hecho el 22 de octubre: `npm install` en `app/` y **`app/package-lock.json`
  en git** (Capacitor 8.5.3, 98 paquetes): el runner instala lo mismo cada
  vez.
- `npx cap add ios` funciona también en Linux (el CLI no exige Xcode ni
  macOS), con las plantillas apartadas (§4). El workflow genera el proyecto
  en cada ejecución, y `app/ios/`, salvo las plantillas, queda fuera de git.
- Si la primera ejecución para en algo del proyecto de Xcode (el nombre del
  esquema, la versión mínima de iOS, el grupo `App` que `incluir.rb` espera),
  el registro del workflow dice qué; se corrige en `app/fastlane/Fastfile`,
  `app/ios/plantillas/aplicar.sh` o `incluir.rb` y se vuelve a lanzar.

### 9.3 Lo que hace el flujo, y de dónde sale cada pieza

| Paso | Herramienta | Comprobado en |
|---|---|---|
| Máquina macOS con Xcode 26 | `runs-on: macos-26` (arm64, M1), gratis en repos públicos; el Xcode 26 más alto que no sea beta (Apple no acepta binarios de un Xcode beta) | docs.github.com, runners |
| `app/www/`, proyecto, plantillas | `tools/app_preparar.js`, `npx cap add ios` (con las plantillas apartadas), `aplicar.sh`, `incluir.rb` (gema `xcodeproj`, viene con fastlane) | aquí, el 22 de octubre: Capacitor 8.5.3 en Linux e `incluir.rb` (xcodeproj 1.28.1) contra el proyecto que genera; `aplicar.sh`, en seco (PlistBuddy solo lo hay en un Mac) |
| Certificado y perfil sin Mac | `fastlane match` con la clave API (crea el certificado de distribución y el perfil; «App Store Connect API key doesn't work» solo para los Developer ID, que no hacen falta); `setup_ci`, un llavero temporal en el runner; el token del repositorio de la firma, tal cual en un secreto | docs.fastlane.tools/actions/match |
| Archivo firmado | `build_app` (gym): `-exportMethod app-store`, firma manual con el perfil de match, versión de `package.json` y build = número de ejecución | docs.fastlane.tools |
| TestFlight | `upload_to_testflight` (pilot) con la clave API | docs.fastlane.tools |
| Ficha y capturas | las capturas, de `app/www/` (la app de la tienda, con la marca); `tools/app_store_metadata.js` escribe `fastlane/metadata/<loc>/*.txt` y `fastlane/screenshots/<loc>/`; `deliver` las sube (las once localizaciones de §5.2; deliver conoce 1206×2622 y 2064×2752) | docs.fastlane.tools/actions/deliver; `app_screenshot.rb` |
| El identificador | el Bundle ID con la clave API (Spaceship, la API oficial de App Store Connect); la ficha, a mano una vez (§9.1, paso 6) | fastlane 2.241.1: `create_app_online` no tiene `api_key` (produce entra con el Apple ID) |

### 9.4 Dónde está (24 de noviembre de 2026)

Hecho el 23 de noviembre de 2026, desde el iPhone de Jerome y con los
registros de cada ejecución del flujo «App Store»:

- El Apple Developer Program, aprobado y pagado; la clave API (papel
  *Admin*) con su `.p8`; el Team ID; y el DSA, contestado («Has completado
  todos los requisitos reglamentarios»).
- `tenerife-go-firma`, privado, y el token clásico del punto 4; los diez
  secretos; la variable `MATCH_READONLY` a `1`.
- `alta`: una primera en rojo porque faltaba el secreto `ASC_KEY_P8`; luego
  el identificador `tenerifego.app` creado y el rojo esperado por la ficha;
  la ficha «Tenerife Go», creada a mano en App Store Connect (su id de
  Apple, 6838506206); y `alta` otra vez, en verde.
- `testflight`: match creó el certificado de distribución y el perfil
  («match AppStore tenerifego.app») y los guardó cifrados en
  `tenerife-go-firma`; la compilación 1.0.0 (4), con Xcode 26.6, subida y
  procesada («Lista para enviar»), con un aviso de Apple, el 90725 (el SDK
  de iOS 27 desde abril de 2027, §5.6 y §8), que hoy no para nada.
- TestFlight: el grupo interno «Yo», con Jerome; la app instalada en su
  iPhone y probada en lo básico (la bienvenida, el permiso de la ubicación,
  «Apunta al cielo», el modo avión y un enlace de fuera): «va bien». Del
  §7 quedan la brújula (3), los datos del día con red (5), la cuenta (7) y
  la barra de estado (8).
- `ficha`: paró en las capturas antes de subir nada (el plan de «Organice
  su día» con la semilla 67 ya no comía); corregido con la semilla 42 en
  `tools/capturas_app_store.js`.

Y el 24 de noviembre de 2026:

- `ficha` n.º 6, en verde (de 13:15 a 13:42 UTC, sobre `0c993da`): la
  ficha en los diez idiomas y las 140 capturas, subidas («Successfully
  uploaded screenshots to App Store Connect»).
- En App Store Connect, desde el iPhone: la compilación 1.0.0 (4) en la
  versión 1.0.0; la información para la revisión, la que dejó `ficha` (sin
  cuenta de prueba: no hace falta entrar); la publicación, automática;
  *App Privacy*, con las ocho filas del §5.4 (el *User ID* quedó al
  principio sin ligar a la identidad y se corrigió); la edad, **13+**;
  *Content Rights*; gratis; y 174 países, sin China continental (los tres,
  §5.1).
- Del §7, en el iPhone de Jerome (iPhone 15 Pro Max, iOS 27.2.1, con
  Dynamic Island): la cuenta (7), con una dirección nueva, de punta a
  punta. En el registro de Supabase, de 16:32 a 16:33 UTC: `/signup` y
  `mail.send`, `/verify`, `login`; y «Eliminar cuenta» la borró (ya no
  está en `auth.users`). Y la barra de estado y el borde de abajo (8):
  nada tapado.
- **Enviada a revisión** a las 16:40, hora de Canarias (en noviembre, UTC+0):
  «1 artículo enviado. La revisión puede tardar hasta 48 horas».

Falta la respuesta de Apple: llega por correo y, en App Store Connect, el
estado pasa de «Esperando revisión» a «En revisión» y a aprobada, o a
rechazada con su mensaje en «Revisión de apps». Si la aprueban, sale sola
(la publicación es automática). Del §7 quedan la brújula (3), los datos
del día con red (5), el iPad (8) y el apaisado (9): no paran la revisión, y lo que
salga irá en la 1.0.1. Y, para las versiones de después de abril de 2027,
Xcode 27 (§8).

## 10. Fuentes (leídas el 21 de octubre de 2026)

- GitHub Actions: runners macOS estándar gratis en repositorios públicos,
  etiquetas `macos-26`/`macos-latest`: docs.github.com/en/actions/reference/runners/github-hosted-runners.
- El alta desde el iPhone con la app Apple Developer: developer.apple.com/support/app-account.
- Xcode Cloud exige Xcode para el primer workflow:
  developer.apple.com/documentation/xcode/configuring-your-first-xcode-cloud-workflow.
- fastlane match (certificados con la clave API, salvo Developer ID) y deliver
  (carpetas de metadatos y capturas, localizaciones): docs.fastlane.tools/actions/match
  y …/deliver; los tamaños que deliver reconoce: fastlane/deliver/lib/deliver/app_screenshot.rb.
- Comprobado el 22 de octubre en el código instalado: fastlane 2.241.1
  (produce entra con `Spaceship::ConnectAPI.login`; `setup_ci` crea el
  llavero y pone `MATCH_READONLY`; match deja
  `sigh_<app>_appstore_profile-name`; deliver conoce 1206×2622 y 2064×2752 y
  traduce «Travel» y «Navigation»), y @capacitor/cli 8.5.3
  (`dist/tasks/add.js`: `cap add` para si ya existe la carpeta de la
  plataforma).
- `npx cap add ios` sin macOS: cli/src/tasks/add.ts y cli/src/ios/common.ts de
  github.com/ionic-team/capacitor (CocoaPods solo si se elige, y solo en Mac).
- Capacitor 8: Xcode 26.0+, Node 22+, SPM por defecto, iOS 15:
  capacitorjs.com/docs/getting-started/environment-setup y
  capacitorjs.com/docs/updating/8-0; iOS 15+ y WKWebView: capacitorjs.com/docs/ios.
- Xcode 26 y el SDK de iOS 26 obligatorios desde el 28 de abril de 2026:
  developer.apple.com/news/upcoming-requirements («SDK minimum
  requirements», «Since April 28, 2026»); y capawesome.io/blog/xcode-26-requirement-for-capacitor-apps.
- Apple Developer Program, 99 USD al año: developer.apple.com/support/compare-memberships.
- Localizaciones de App Store Connect (sin búlgaro):
  developer.apple.com/help/app-store-connect/reference/app-store-localizations.
- Tamaños de capturas: developer.apple.com/help/app-store-connect/reference/screenshot-specifications.
- Límites de la ficha: developer.apple.com/help/app-store-connect/reference/app-information
  y …/app-information/platform-version-information.
- Manifiesto de privacidad (claves, tipos de dato y finalidades):
  developer.apple.com/documentation/bundleresources/describing-data-use-in-privacy-manifests
  y las listas de `NSPrivacyCollectedDataType` y `NSPrivacyCollectedDataTypePurposes`.
- Directrices de revisión (2.3.10, 4.2, 4.8, 5.1.1): developer.apple.com/app-store/review/guidelines.
- `getUserMedia` en WKWebView desde iOS 14.3: webkit.org/blog/11353/mediarecorder-api.
- Leídas el 23 de noviembre de 2026: el acceso a la API, que pide el titular
  antes de la primera clave (developer.apple.com/help/app-store-connect/get-started/app-store-connect-api);
  el DSA de la UE (…/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements);
  las edades y sus preguntas (…/reference/age-ratings); y los dos avisos de
  China continental, en la página de la app en App Store Connect. El 24: el
  aviso 90725 de la compilación 1.0.0 (4), en App Store Connect, y la imagen
  `xcode-27` de GitHub (github.blog/changelog/2026-10-16-xcode-27-runner-image-generally-available).
