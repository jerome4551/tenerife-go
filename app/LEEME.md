# `app/`: Tenerife Go para las tiendas

La misma aplicación que `../index.html`, dentro de un envoltorio nativo
(Capacitor 8) para la App Store. No hay otra app: `tools/app_preparar.js`
copia aquí (`www/`) lo que viaja en el móvil y le pone a `index.html` una
sola línea, `window.TGO_NATIVO = true`. Con ella la app no registra service
worker (todo va dentro del paquete: el mapa, los lugares, las guaguas, el
cielo, los idiomas y la librería de la cuenta), no ofrece instalarse, esconde los dos botones de avisos push,
el de la cuenta y el de «Continuar como invitado» (WKWebView no tiene Web
Push), y pide a la web viva los datos
que cambian a diario (precios, avisos de AEMET, elementos de los satélites),
con los de dentro de respaldo. En la web esa marca no existe y nada cambia.

| Qué | Dónde |
|---|---|
| Lo que viaja en la app | `www/` (lo monta `node ../tools/app_preparar.js`; no entra en git) |
| La configuración de Capacitor | `capacitor.config.json` (`appId`, `appName`, `webDir`) |
| Lo que el proyecto de Xcode necesita y Capacitor no trae | `ios/plantillas/`: el fragmento del `Info.plist` (permisos, idiomas, cifrado exento, orientaciones), `<idioma>.lproj/InfoPlist.strings` (las frases de los permisos en los diez idiomas, sacadas de la política de privacidad), `PrivacyInfo.xcprivacy`, `AppIcon-1024.png`, `Splash-2732.png` y `aplicar.sh`, que lo pone todo en su sitio |
| El proyecto de Xcode | `ios/App/` (lo genera `npm run ios:anadir`: «npx cap add ios» con las plantillas apartadas un momento, porque Capacitor no arranca si ya existe `ios/`; no entra en git) |
| Los pasos enteros, lo que hay que decidir y lo que falta | `../LANZAMIENTO-APP-STORE.md` |
| La ficha de la tienda en los diez idiomas | `../datos/app-store/ficha.json` (`node ../tools/auditar_app_store.js` la coteja) |
| Las capturas para la tienda | `node ../tools/capturas_app_store.js PUERTO`, con `www/` servido en ese puerto (la app de la tienda, con la marca; si no la ve, para) |
| La App Store sin Mac | `../.github/workflows/app-store.yml` (una máquina macOS de GitHub), `fastlane/Fastfile` (match, gym, pilot, deliver), `Gemfile`, `ios/plantillas/incluir.rb`; la ficha y las capturas en el formato de `deliver`, con `node ../tools/app_store_metadata.js` |

Sin Mac: `LANZAMIENTO-APP-STORE.md` §9 (Actions → «App Store» → Run workflow). En un Mac con Xcode 26 y Node 22:

```
cd app
npm install
node ../tools/app_preparar.js          # monta www/
npm run ios:anadir                     # genera ios/App/ (SPM) y pasa aplicar.sh: permisos, idiomas, privacidad, icono, arranque
npx cap open ios                       # Xcode: Team, firma, Archive, TestFlight
```

Cada vez que cambie algo en la raíz: `node ../tools/app_preparar.js && npx cap sync ios`.

Lo que comprueba `bash ../tools/auditar.sh` (sin Mac): que `www/` tiene todo
lo que la app pide y nada más, que las plantillas son las de hoy
(`app_preparar.js --comprobar`), que con la marca la app se comporta como
debe en un navegador (`probar_app.js`) y que la ficha cabe en lo que pide
App Store Connect (`auditar_app_store.js`).
