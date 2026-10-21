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
| Caché sin conexión | El service worker (`sw.js`) guarda `index.html`, el módulo del cielo, el mapa de la isla… | No hay service worker: todo viaja dentro del paquete (24,5 MB, 94 ficheros). WKWebView no registra service workers en el esquema `capacitor://`. |
| Datos que cambian a diario (precios, avisos de AEMET, elementos de los satélites) | Red primero, caché de respaldo (el service worker) | `tgoFetchDatos()`: primero la copia viva de `https://jerome4551.github.io/tenerife-go/datos/…` con 8 s de plazo; si no llega, no responde o se corta, la copia que viaja dentro (la del día en que se montó la app). |
| «Instalar la app», botón flotante de la PWA | Salen | No salen: ya está instalada. |
| Avisos push | Web Push con `sw.js` | WKWebView no tiene Web Push: los dos botones «Activar notificaciones» (el de la cuenta y el de «Continuar como invitado») y sus mensajes van ocultos. Los avisos nativos (APNs) son otro trabajo (§8). |
| El mapa detallado (`tenerife-osm.pmtiles`, 12 MB) | Se descarga desde la app y se guarda en Cache Storage | Viaja dentro: «nada que descargar ni borrar». |
| Confirmar el correo de la cuenta | Supabase vuelve a la web | Vuelve a la web viva (`capacitor://localhost` no es una dirección a la que volver). |
| Compartir un lugar | El enlace de la web | El enlace de la web viva (ya lo hacía con `capacitor://`). |
| «Antes de subir al Teide» (el cielo, «Dónde ir») | Mira en la caché del móvil los seis ficheros del panel | «Guardado en el móvil» siempre: viajan en el paquete. |
| La CSP | `connect-src 'self' …` | `connect-src` lleva además `https://jerome4551.github.io`, para esos datos. |
| El asistente | Sus respuestas | En tres, la suya (`faq/fuente/nativo/respuestas.json`, diez idiomas): «¿Funciona sin conexión?» (desde la primera vez; «Satélite» y «Topo» con red), «¿Cómo instalo la app?» (ya está instalada: nada de navegador ni de otras plataformas, directriz 2.3.10) y «¿Puedo recibir una frase cada mañana?» (no manda notificaciones). |
| Sin permiso para la cámara o los sensores | «Se puede dar en los ajustes del navegador» | Sin esa frase (`cieloCamaraPermisoApp`, `cieloSensoresPermisoApp`): dónde se vuelve a dar en iOS se mira en el iPhone (§7, 1). |

Todo lo demás (el mapa, las 183 líneas, los 980 lugares, el cielo entero
con «Apunta al cielo», los satélites, la noche guiada, el sistema solar, la
luz roja, los diez idiomas) es el mismo código y se comporta igual.
`tools/probar_app.js` lo comprueba en Chromium: con la marca y sin ella.

## 2. Lo que está hecho aquí y auditado (sin Mac)

| Fichero | Qué |
|---|---|
| `index.html` | El bloque `TGO-NATIVO` de la cabecera (`TGO_NATIVO`, `TGO_BASE_VIVA`, `tgoFetchDatos`) y las ocho puertas que miran la marca (service worker, «instalada» —que quita el banner—, botón flotante, push, mapa detallado ×2, correo de confirmación, enlace de compartir); `connect-src`. En la web nada cambia (`probar_app.js` lo mira). |
| `modulos/cielo.js` | Los elementos de los satélites se piden con `tgoFetchDatos` si existe (`pedir`); `cacheListo()` da «guardado» con la marca. |
| `tools/app_preparar.js` | Monta `app/www/` (lista cerrada de lo que viaja; nada de carpetas de trabajo ni controles) y escribe las plantillas de iOS que salen de la política de privacidad; `--comprobar` coteja que no falta nada de lo que `index.html`, las dos páginas fijas y `sw.js` piden, que `www/index.html` es el de la raíz más esa línea, y que las plantillas son las de hoy. |
| `app/capacitor.config.json`, `app/package.json`, `app/LEEME.md`, `.gitignore` | El proyecto de Capacitor (8.x; `app/www/`, `app/ios/App/` y `node_modules/` fuera de git). |
| `app/ios/plantillas/Info.plist.fragmento.plist` | Lo que el `Info.plist` de Capacitor no trae: los tres permisos con las frases de la política (castellano), los diez idiomas (`CFBundleLocalizations`), `ITSAppUsesNonExemptEncryption = false` (solo HTTPS), las orientaciones. |
| `app/ios/plantillas/<idioma>.lproj/InfoPlist.strings` | Las frases de la ubicación, los sensores y la cámara en los diez idiomas, **sacadas de `idiomas/privacidad/<idioma>.json`**: el permiso dice lo mismo que la política. Si la política cambia y no se vuelve a pasar el preparador, `auditar.sh` para. |
| `app/ios/plantillas/PrivacyInfo.xcprivacy` | El manifiesto de privacidad: sin rastreo, sin dominios de rastreo, y los datos que la política dice que salen (correo e id de usuario ligados a la cuenta, los favoritos, las coordenadas de una ruta o del tiempo, el texto de una búsqueda, y con el aviso de cookies aceptado el uso, el país aproximado y el identificador de Google Analytics). |
| `app/ios/plantillas/AppIcon-1024.png`, `Splash-2732.png` | El icono a 1024 **ampliado del de 512** (§4) y el arranque cuadrado (el de 2048×2732 centrado sobre su fondo). |
| `app/ios/plantillas/aplicar.sh` | Lo pone todo en el proyecto que genera `npx cap add ios` (PlistBuddy, copias). Comprobado en seco: aquí no hay Mac. |
| `datos/app-store/ficha.json` | La ficha de la tienda en los diez idiomas: nombre, subtítulo, texto promocional, descripción, palabras clave, y las direcciones, el copyright y la categoría. Cada frase dice solo lo que la app hace. |
| `tools/auditar_app_store.js` | La ficha contra los límites de Apple (30/30/170/4000 caracteres, 100 bytes de palabras clave), contra las directrices (ni otras plataformas, ni otras apps, ni «número uno», ni promesas que la app no cumple: fotos, push, «sin anuncios») y contra lo que hay (980 lugares, 183 líneas, siete costas, diez idiomas, las fuentes del README), en cada idioma y en su idioma. |
| `tools/capturas_app_store.js` | Las capturas en los tamaños obligatorios (iPhone 1206×2622, iPad 2064×2752), siete por aparato, de la app de verdad: el mapa de la isla, una ficha, las paradas cerca, «Organiza tu día», «Esta noche», «Apunta al cielo» y el sistema solar. Sin rótulos: si Jerome los quiere, se ponen encima. |
| `tools/probar_app.js` | El modo nativo en Chromium (§1) y la web sin la marca. |
| `tools/auditar.sh` | Los tres controles nuevos. |

## 3. Lo que Jerome tiene que decidir o aportar

1. **La cuenta de desarrollador.** El Apple Developer Program cuesta 99 USD
   por año de membresía (o el equivalente en moneda local). Como persona
   física o autónomo, la app sale en la tienda con el nombre del
   desarrollador. Con la cuenta: Xcode firma, TestFlight y App Store
   Connect.
2. **El identificador de la app** (`appId` de `capacitor.config.json`,
   propuesto `com.tenerifego.app`). Se escribe al revés de un dominio, no
   hace falta tener el dominio, pero **no se puede cambiar después de
   publicar**. Si Jerome registra un dominio para la Fase 2 de Google Play
   (el documento «De la PWA a Google Play»), mejor ese (`es.tenerifego.app`,
   por ejemplo) antes de la primera subida.
3. **El icono a 1024×1024.** App Store Connect lo pide a ese tamaño y sin
   transparencia; el del repositorio es de 512 y el de la plantilla está
   ampliado. Se ve bien, pero el original a 1024 (o el vectorial del que
   salió) lo dejaría exacto: `app/ios/plantillas/AppIcon-1024.png`.
4. **Los datos de contacto de la revisión** (nombre, correo, teléfono en
   formato internacional, `+34…`). El de la política (`privacidad.html`) ya
   es público: Jérôme Bourgeois · tenerife.go.app@gmail.com.
5. **Si se quieren rótulos en las capturas** («Funciona sin conexión», «El
   cielo del Teide»…), en los diez idiomas, encima de las capturas de
   `capturas_app_store.js`. Sin rótulos también valen.
6. **El riesgo de la directriz 4.2** («Minimum Functionality»: la app tiene
   que ir «más allá de una web reempaquetada»). Tenerife Go no carga nada de
   fuera: todo viaja dentro, funciona sin red, usa la cámara, la brújula y
   los sensores, calcula el cielo en el móvil. Eso es lo que se le dice al
   revisor en las notas (§5.5). Si aun así la rechazan por 4.2, el camino es
   responder con esa lista y, si insisten, añadir una pieza nativa (los
   avisos APNs del §8 serían la primera).

## 4. En el Mac, paso a paso

Hace falta un Mac con **Xcode 26.0 o más** (Capacitor 8 lo exige; desde el
28 de abril de 2026 Apple exige además que todo lo que se suba esté
compilado con el SDK de iOS 26), **Node 22 o más** y la cuenta del punto 3.1
metida en Xcode (Settings → Accounts).

```
git clone https://github.com/jerome4551/tenerife-go && cd tenerife-go/app
npm install                              # @capacitor/core, cli e ios 8.x
node ../tools/app_preparar.js            # monta www/ (94 ficheros, 24,5 MB)
npx cap add ios                          # genera ios/App/ (Swift Package Manager; CocoaPods: --packagemanager CocoaPods)
bash ios/plantillas/aplicar.sh           # permisos, idiomas, privacidad, icono, arranque
npx cap open ios                         # Xcode
```

En Xcode, una vez:

1. Target **App** → General: *Team* (la cuenta), *Bundle Identifier* igual
   que `appId`, *Minimum Deployments* iOS 15.0 (lo que Capacitor 8 admite),
   *Version* 1.0.0 y *Build* 1.
2. Si `aplicar.sh` avisó de que los `.lproj` o `PrivacyInfo.xcprivacy` no
   están en el proyecto: File → *Add Files to "App"…*, marcando el target.
   Project → Info → *Localizations*: los diez idiomas.
3. Signing & Capabilities: solo *Automatically manage signing*. La app no
   usa ninguna capacidad (ni push, ni mapas de Apple, ni compras).
4. Un iPhone conectado o el simulador: ▶. La primera pantalla es la
   bienvenida con los diez idiomas, como en la web.
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
  Ministerio y de la AEMET, con su procedencia en cada fichero).
- *Age Rating*: el cuestionario entero en «No / Ninguno» → 4+.
- *Pricing*: Free; *Availability*: todos los países.
- *App Privacy*: §5.4. *Privacy Policy URL*:
  `https://jerome4551.github.io/tenerife-go/privacidad.html`.

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
| bg | **No existe el búlgaro** en App Store Connect: en Bulgaria la tienda enseña la ficha de English (U.K.). La app, dentro, sí va en búlgaro. La ficha en búlgaro queda en `ficha.json` por si Apple la añade. |

Campos y límites (los coteja `auditar_app_store.js`): *Name* 2–30, *Subtitle*
≤ 30, *Promotional Text* ≤ 170 (se puede cambiar sin nueva versión),
*Description* ≤ 4000 en texto plano, *Keywords* ≤ 100 **bytes** (en chino y
búlgaro cada letra son 2 o 3), *Support URL* y *Marketing URL* de
`ficha.json`, *Copyright* «2026 Jérôme Bourgeois». *What's New* no existe en
la primera versión.

### 5.3 Las capturas

`node tools/capturas_app_store.js 8766 --idiomas=todos` deja en
`capturas-app-store/<idioma>/` siete capturas de iPhone (1206×2622, la
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
| Other User Content (favoritos) | Sí (con cuenta) | Sí | No | App Functionality | «Favoritos: los identificadores de los lugares que guardas. Con cuenta se sincronizan» |
| Precise Location | Sí (al pedir una ruta o el tiempo) | No | No | App Functionality | «Si pides una ruta en coche, las coordenadas de origen y destino se envían al servicio de rutas»; «Open-Meteo: las coordenadas del lugar o de la zona cuya previsión consultas» |
| Search History | Sí (al buscar una dirección) | No | No | App Functionality | «Nominatim: el texto que escribes al buscar una dirección» |
| Product Interaction | Sí, **solo si se acepta el aviso de cookies** | No | No | Analytics | «Google Analytics 4, y no se carga hasta que aceptas el aviso de cookies» |
| Coarse Location | Sí, **solo si se acepta el aviso de cookies** | No | No | Analytics | «Google Analytics … recibe datos de navegación —pantallas vistas, idioma, país aproximado, tipo de dispositivo— y tu dirección IP». Apple: «Declare the relevant data types based on how you use IP address, such as precise location, coarse location, device ID» |
| Device ID | Sí, **solo si se acepta el aviso de cookies** | No | No | Analytics | «Google Analytics instala sus propias cookies», y llevan un identificador (no el publicitario, el IDFA) |
| Crash Data, Photos, Contacts, Purchases, Advertising Data… | No | | | | la cámara y los sensores «no salen del móvil»; sin el IDFA; sin SDK de fallos |

Analytics va en tres filas porque Apple pide declarar también lo que recogen
los terceros cuyo código va en la app («including the practices of
third-party partners whose code you integrate into your app»), y la
excepción de lo opcional no vale: Analytics recoge cada vez que se usa la
app, no «only in infrequent cases» (developer.apple.com/app-store/app-privacy-details,
leído el 21 de octubre de 2026).

*Do you or your third-party partners use data for tracking?*: **No**
(Consent Mode v2 con las señales publicitarias denegadas siempre; ninguna
red publicitaria). Apple dice que el manifiesto del propio paquete no tiene
que cubrir los SDK de terceros: Capacitor trae el suyo.

### 5.5 App Review Information

- *Sign-in required*: **No**. La cuenta es opcional (directriz 5.1.1 (v):
  la app se usa sin iniciar sesión, y se puede borrar desde dentro:
  «Cuenta» → «Eliminar cuenta», y `borrar-cuenta.html`).
- *Contact*: los del punto 3.4.
- *Notes* (hasta 4000 bytes, en el idioma que sea). Propuesta, en inglés:

> Tenerife Go is a free travel guide for the island of Tenerife. Everything ships inside the app and works offline: the island map (vector tiles bundled), 980 places, the 183 bus and tram lines, and a night-sky module computed on the device (Astronomy Engine) with an AR view that uses the camera, compass and motion sensors. No content is loaded from a remote web view; only small daily data files (fuel prices, weather warnings, satellite orbital elements) are refreshed from our site when online, with bundled copies as fallback.
> Permissions are optional and asked in context: location (map and routes), camera and motion (only inside "Point at the sky"). The account is optional (email + password, our own system) and can be deleted from inside the app (Account → Delete account). No in-app purchases, no subscriptions, no third-party ad networks; a few local businesses are labelled as sponsored. Privacy policy: https://jerome4551.github.io/tenerife-go/privacidad.html

### 5.6 Antes de pulsar *Submit for Review*

TestFlight en un iPhone de verdad (§7), la ficha en los diez idiomas que
existen, las capturas, App Privacy, *Export Compliance* contestado por el
`ITSAppUsesNonExemptEncryption = false` del `Info.plist` (solo HTTPS: cifrado
exento), *Content Rights*, *Advertising Identifier*: **No** (la app no usa el
IDFA).

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

1. **Permisos**: al abrir «Apunta al cielo», iOS pide los sensores y, con
   📷, la cámara, cada uno con la frase de la política en el idioma del
   móvil; al tocar «GPS», la ubicación. Rechazar y volver a aceptar en
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
   la web viva), no los del día en que se montó la app.
6. **Enlaces de fuera** (Wikipedia, «Cómo llegar en coche», TITSA, la
   política): se abren en Safari, no dentro de la app sin forma de volver.
   `tel:112` llama. Compartir un lugar: la hoja de iOS, con el enlace de la
   web.
7. **La cuenta**: crear una, el correo de confirmación vuelve a la web viva
   (abre Safari); entrar en la app; un favorito sincroniza; «Eliminar
   cuenta» la borra.
8. **La barra de estado y el borde inferior** en un iPhone con Dynamic
   Island y en un iPad: nada tapado (la cabecera ya respeta
   `env(safe-area-inset-top)`), y la luz roja pone en rojo lo que se ve.
9. Vertical y apaisado, iPhone e iPad.

## 8. Lo que es otro trabajo (y no bloquea la primera versión)

- **Avisos nativos (APNs)**: la frase diaria de `enviar-notificacion.js`
  llega hoy por Web Push a la web; en la app harían falta `@capacitor/push-notifications`,
  la clave APNs en la cuenta de Apple y un envío aparte. Hasta entonces, el
  botón va oculto en la app.
- **Enlaces universales** (`https://jerome4551.github.io/tenerife-go/#lugar=…`
  abriendo la app en vez de Safari): `apple-app-site-association` en la
  raíz del dominio, que GitHub Pages sirve si se mete en `.well-known/`;
  entra con la Fase 2 (dominio propio) del documento de Google Play.
- **Google Play**: el TWA de PWABuilder (el documento de Jerome «De la
  PWA a Google Play», tres fases; la Fase 1 está en `AUDITORIA-FINAL.md`),
  que no necesita nada de esto: la PWA tal cual.
- **Sign in with Apple**: no se exige (§6); si algún día se añade Google
  Sign-In, entonces sí.

## 9. Fuentes (leídas el 21 de octubre de 2026)

- Capacitor 8: Xcode 26.0+, Node 22+, SPM por defecto, iOS 15:
  capacitorjs.com/docs/getting-started/environment-setup y
  capacitorjs.com/docs/updating/8-0; iOS 15+ y WKWebView: capacitorjs.com/docs/ios.
- Xcode 26 obligatorio desde el 28 de abril de 2026:
  capawesome.io/blog/xcode-26-requirement-for-capacitor-apps.
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
