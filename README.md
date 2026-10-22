# Tenerife Go

Guía de Tenerife en forma de PWA: un mapa con lugares de toda la isla y la
red entera de guaguas y tranvía, traducida a diez idiomas, que funciona sin
conexión una vez cargada.

Publicada en GitHub Pages: <https://jerome4551.github.io/tenerife-go/>

---

## Qué hay en el repositorio

| Fichero | Qué es |
|---|---|
| `index.html` | **La aplicación**: HTML, CSS y JavaScript en un solo fichero, y dentro los 980 lugares. Medido el 21 de octubre de 2026, con el panel del cielo, «Apunta al cielo», lo que piden las reseñas, los satélites, la noche guiada y el modo nativo de la App Store: 35.200 líneas, 2,4 MB (745 kB con gzip). |
| `datos/titsa.js` | La red de guaguas y tranvía: las 183 líneas y las 2.514 marquesinas, con sus notas de origen. Solo datos; lo carga `index.html`. |
| `modulos/cielo.js` | El panel 🔭 «Cielo de Tenerife»: su código y sus textos en los diez idiomas. No se carga al arrancar: lo pide `index.html` la primera vez que alguien abre el panel. |
| `datos/cielo.json` | El catálogo del cielo: estrellas, constelaciones, cielo profundo, dobles, variables y lluvias de estrellas, solo números y designaciones. Lo hace `tools/cielo_construir.js`. |
| `datos/satelites.json` | Los elementos orbitales (TLE) de la Estación Espacial Internacional, de Tiangong y del Hubble, de CelesTrak, con su época. Los renueva el robot `tools/satelites_traer.py` dos veces al día; el panel calcula con ellos los pasos visibles. |
| `datos/planetas.json` | Las cifras de la NASA (NSSDCA) de los ocho planetas, la Luna y el Sol —diámetro, día, año sideral, lunas, temperatura, gravedad, anillos, masa, densidad—, con la fecha de cada tabla. El panel del cielo lleva una copia (`CIELO_PLANETAS`) para la ficha del planeta y las curiosidades. |
| `sw.js` | Service worker. Caché offline y notificaciones push. |
| `manifest.webmanifest` | Manifiesto PWA: iconos, color de tema, `display: standalone`. |
| `enviar-notificacion.js` | Script de Node que envía la notificación diaria. Corre en GitHub Actions, nunca en el navegador. |
| `frases.json` | Las 365 frases de la notificación diaria, una por día del año. |
| `vendor/` | Leaflet 1.9.4 y Leaflet.markercluster 1.5.3, alojados aquí en vez de en un CDN; las dos librerías del mapa sin conexión (`pmtiles.js` y `protomaps-leaflet.js`), las tipografías, Astronomy Engine (MIT), el motor de cálculo del panel del cielo, y satellite.js 7.1.0 (MIT), el SGP4 de los pasos de los satélites, compilado desde su fuente por `tools/satelites_construir.js` (se pide solo al abrir el panel). |
| `supabase/*.sql` | Las tablas y sus políticas de seguridad, para poder recrear el proyecto. |
| `.github/workflows/` | Los robots: la notificación diaria, los avisos de AEMET, los precios de las gasolineras, el mapa y los elementos orbitales de los satélites (`satelites.yml`, dos veces al día). Y `app-store.yml`, que no es un robot: se lanza a mano y compila, firma y sube la app a TestFlight y su ficha a App Store Connect en una máquina macOS de GitHub (la App Store sin Mac). |
| `tools/` | Los controles y las herramientas; `bash tools/auditar.sh` los pasa todos. Entre ellos, `verificar_red.js` (la red de guaguas), `extract_js.py`, `gtfs_red.py` y `auditar_readme.js`, que coteja las cifras de este fichero. |
| `app/` | La misma aplicación para la App Store: el proyecto de Capacitor (`capacitor.config.json`, `package.json`), las plantillas de iOS (permisos en los diez idiomas, manifiesto de privacidad, icono, arranque) y `LEEME.md`. `tools/app_preparar.js` monta `app/www/` desde la raíz; `datos/app-store/ficha.json` es la ficha de la tienda en los diez idiomas. Los pasos, en `LANZAMIENTO-APP-STORE.md`. |
| `AUDITORIA-FINAL.md` | Estado del proyecto, auditoría, lo que falta y las trampas conocidas. |

Es un monolito a propósito, no un proyecto a medio modularizar. No hay
build, ni dependencias que instalar, ni paso de compilación: se sirve
`index.html` y funciona. Las piezas aparte son dos. La red de guaguas, que son
datos y no código: 1 MB que solo se usa con las guaguas y que dentro de la
página había que leer y compilar en cada apertura. Y el panel del cielo
(`modulos/cielo.js`, con su motor y su catálogo), que se pide solo cuando
alguien lo abre: dentro de `index.html` habría sumado unos 100 kB comprimidos
a la primera descarga de todo el mundo.

### Probarlo en local

```
python3 -m http.server 8801
```

Y abrir `http://localhost:8801/index.html`. Hace falta un servidor —no
vale abrir el fichero directamente— porque el service worker y el
manifiesto necesitan un origen `http://`.

---

## Los datos

### Lugares

Los lugares viven en el array `places[]` dentro de `index.html`, en
castellano. Cada uno es un objeto así:

```js
{ id:"teresitas", category:"playa", cats:["parking"],
  name:"Playa Las Teresitas", emoji:"🏝️", lat:28.5097, lng:-16.1847,
  parking:{ gratis:true, aviso:{ es:"…" } },
  desc:{ es:"…" },
  cat:{ es:"…" },
  tags:["Arena Sahara","Familiar","Santa Cruz"] }
```

- `category` es la principal. `cats[]` añade categorías extra: así una
  playa puede aparecer también en el filtro de parkings sin duplicar el
  pin en el mapa.
- Los otros nueve idiomas de `desc`, `cat` y `aviso` viven en
  `idiomas/<idioma>.json`, una línea por lugar; el polaco se escribe en
  `idiomas/pl-lugares/` y se monta con `tools/lugares_idioma.js montar pl`.
  Si a un idioma le falta uno, ese lugar sale en otro idioma sin avisar: lo
  vigilan los controles de `tools/auditar.sh`.
- El `id` se usa dentro de manejadores `onclick`, así que solo puede
  llevar letras, dígitos, punto y guion.

Reparto actual: 43 categorías en 11 pestañas de filtro. Las que más lugares
tienen, contando solo la categoría principal de cada uno: gasolineras (211),
playas (74), parkings (40), gastronomía (38), senderismo (37) y
supermercados (36). Todas estas cifras las coteja `tools/auditar_readme.js`
contra los datos: si cambian y este fichero no, la auditoría se pone en rojo.

### Idiomas

Dos estructuras distintas, y conviene no confundirlas:

- **`LANGS`** — 130 claves de interfaz por idioma, en mapas planos:
  `LANGS.es.searchPlaceholder`. Dentro va `categories`, con el nombre de
  las 43 categorías.
- **`UI_TX`** — el formato inverso, `{clave: {idioma: texto}}`, para lo
  que se fue añadiendo después. Se lee con `tx(clave, vars)`.

Al cambiar de idioma, `setLang()` repinta marcadores, filtros, panel del
mar, panel de baño y panel de guaguas. **Una sección nueva tiene que
repintarse ahí también**: si no, se queda en el idioma anterior hasta
recargar. El panel de guaguas llevaba tiempo sin estar en esa lista y
sus rótulos de grupo se quedaban colgados.

Una categoría sin nombre en un idioma **no da error: el chip
desaparece**. Ese silencio ya escondió los parkings una vez, y seis
categorías en italiano otra. Merece la pena comprobarlo al añadir una.

### Guaguas y tranvía

La red vive en **`datos/titsa.js`**, fuera de `index.html` desde el 9 de octubre
de 2026: 1 MB que el móvil ya no tiene que leer y compilar dentro de la página.
Lo carga su propia etiqueta, justo antes del código; el service worker lo
precarga y lo sirve red primero; y si no llegara, la app arranca igual, sin
guaguas (`TITSA_SIN_DATOS`). Son **solo datos**: `tools/verificar_red.js`
comprueba que no entre código ahí y que `index.html` lo cargue.

`TITSA_LINES` tiene **183 líneas y 6.263 paradas**: las 181 del GTFS oficial de
TITSA más L1 y L2 del tranvía. Ese número **no se escribe en ninguna parte**: el
subtítulo del panel lleva `{n}` en los diez idiomas y el render lo sustituye por
`TITSA_LINES.length`.

**Las paradas no se guardan en la línea.** `TITSA_PARADAS` es un catálogo de
2.514 marquesinas físicas, con los `stop_id` del GTFS agrupados por par
ida/vuelta en el campo `s`. Cada línea guarda `paradas` como lista de claves y
`terminales` como par, y un IIFE de `index.html` —donde empieza el código de
las guaguas— los hidrata a objetos al arrancar. **Un script que lea el fichero
sin hidratar no falla: devuelve `undefined`.** `tools/cargar.js` lee la red ya
hidratada. Y para barrer el fuente buscando textos o idiomas, `tools/fuente.js`
(o `.py`): `index.html` solo ya no es todo el fuente.

Cada línea lleva además `via`: el trazado real de la carretera, sacado de
`shapes.txt` y simplificado con Douglas-Peucker a 12 m. Son 26.593 puntos entre
las 183. Se dibuja como **una sola polilínea**; trocearla subía el botón de
aeropuerto de 31 a 467 ms.

`frecuencia` y `precio` son texto libre, y `parseFrequencyMinutes()` saca de ahí
los minutos de espera para el planificador. Reconoce tres formas, por este
orden: horas (`~1 h`), rangos y valores en minutos (`30-60 min`, `30 min`) y
expediciones al día (`4 salidas/día`, `L-V, pocas salidas/día`). Lo último no es
una frecuencia sino un horario, así que reparte los viajes en una jornada de
12 h; sin cifra asume 2. Antes caía al valor por defecto y **una guagua que pasa
una vez al día se ofrecía como si viniera cada media hora**. Si no reconoce nada
usa 30 minutos. Las nocturnas (`Madrugada`) siguen cayendo en ese valor por
defecto: es lo que queda por hacer aquí.

**Todas las líneas llevan `precio`.** TITSA no cobra por línea sino por
trayecto: en las 130 que llevan `precioDesde`, el importe es el mínimo y se
pinta con «desde»; las otras 53 llevan el suyo. El porqué está en «El precio»,
en `AUDITORIA-FINAL.md`. Si algún día falta el campo, `busPrecioTexto()` no se
inventa nada: devuelve vacío.

El planificador agrupa las paradas por coordenada redondeada a cuatro decimales,
así que **dos líneas solo hacen transbordo si comparten la coordenada exacta**.
Como todas las paradas salen ahora del mismo catálogo, eso ya no depende de
copiar coordenadas a mano. Alcalá llegó a figurar con dos coordenadas separadas
3,7 km y el planificador la trataba como dos pueblos.

Día y noche sí son nodos distintos a propósito: las búho paran en los cruces de
la autopista (`Cruce Arico`) y las diurnas en el casco (`Arico`), a kilómetros de
distancia. No se deben unificar.

Lo que distingue dos entradas con el mismo número es el `id` —`bus-711` frente a
`bus-711N`—, que es lo que usan todas las búsquedas del código; `numero` solo se
pinta. Hoy no hay ningún número compartido por dos líneas.

Las líneas se agrupan en el panel por `tipo`: `tranvia`, `norte`, `sur`,
`aeropuerto`, `teide`, `municipal`, `nocturna` y `lanzadera`.

### El cielo de Tenerife

El panel 🔭 tiene cinco pestañas: **esta noche** (el índice de la noche de
0 a 10 con su fórmula a la vista, Sol, Luna, nubes, las horas dorada y azul,
planetas, Vía Láctea y lo mejor para ver a simple vista, con prismáticos y
con telescopio), el **calendario** (lluvias de estrellas, eclipses,
oposiciones, conjunciones, retrógrados, equinoccios y las fases de cada mes,
con «añadir a mi calendario» en cada evento), el **catálogo** por
instrumento, la **carta del cielo** y **dónde ir**. Tiene luz roja para la
noche, y cualquier noche se elige con 📅.

**La carta** pinta el cielo como se ve: el color del crepúsculo hacia donde
se puso el Sol, la Vía Láctea, cada estrella con el color de su temperatura
(B−V, Ballesteros 2012) y apagándose hacia el horizonte (extinción de las
cumbres canarias, 0,113 mag por masa de aire), la Luna con su fase bien
girada y sus mares (Gazetteer de la UAI), el suelo y los puntos cardinales.
Se arrastra, se pellizca, corre la noche con ▶, se guarda o comparte con 📸
y, tocando cualquier astro, sale su **ficha**: dónde está ahora, cuándo sale
y se pone, su recorrido de esa noche pintado en la carta si se pide, y lo
que se sabe de él calculado de datos con fuente —la luz que ves salió hace N
años, su clase y color, cuánto brilla en soles, las lunas de Júpiter ahora,
los anillos de Saturno— más el resumen de Wikipedia en el idioma del lector
(CC BY-SA) o, si no hay artículo en ese idioma, el aviso de que no lo hay,
pedido al abrirla y guardado 30 días en el móvil.

**«Apunta al cielo»** es la carta a pantalla completa orientada con los
sensores del móvil (brújula, giroscopio, acelerómetro; en iOS pide permiso
en el mismo toque): se levanta el móvil hacia una estrella y el círculo del
centro dice cuál es. Con 📷 la imagen de la cámara va detrás; con 🔍 se
busca un astro y una flecha lleva hasta él, y el móvil vibra al centrarlo.
La brújula marca el norte magnético: se corrige con la declinación del
WMM2025 en Izaña (`datos/cielo.json`, `declinacion`, calculada por
`tools/cielo_wmm.js` y comprobada contra la tabla de prueba de la NOAA).
Como la brújula de cualquier móvil se descalibra sola —es la queja número
uno de todas las apps del cielo—, la primera vez sale una guía de 20
segundos (lejos de imanes, el ocho en el aire) y el chip «Comprobar la
brújula» pone la Luna, el Sol, un planeta o la estrella más brillante en el
círculo y, al tocar «Ya», mide cuánto se desvía y la corrige; en iOS el chip
de los sensores lleva además la precisión que da el sistema (±N°). Si aun
así no cuadra se arrastra el cielo hasta que encaje. Nada de la cámara ni de
los sensores sale del móvil (política de privacidad, 2).

**Tu noche guiada.** Arriba de «Esta noche», las paradas de la noche
calculadas de lo que está en el cielo a esa hora (ahora, si ya es de noche;
si no, media hora después de la noche cerrada): la Luna si está, los
planetas más brillantes, tres estrellas con nombre, lo mejor a simple
vista, la Vía Láctea si no hay Luna, el primer paso de satélite y la lluvia
de estrellas activa; cada una con dónde está, qué es y «Llévame», que abre
«Apunta al cielo» con la flecha puesta en ella. Es la respuesta a «los
principiantes no saben dónde mirar», la queja que las reseñas repiten.

**El sistema solar hoy**, al final de «Esta noche»: las órbitas y las
posiciones reales vistas desde encima del polo norte del Sol (Astronomy
Engine), «Hasta Marte» o «Hasta Neptuno», con la noche de la Tierra y
Tenerife sobre ella; se toca un planeta y dice a cuánto está del Sol y de
nosotros, cuánto tarda su luz, a cuántos grados del Sol se ve y dónde está
ahora; el tiempo corre un mes por segundo. `tools/auditar_cielo.js` coteja
cada posición con los elementos keplerianos de la JPL
(`tools/elementos_planetas.json`) calculados aparte.

**La luz roja** tiñe toda la pantalla (no solo el panel) y lleva un
regulador de brillo, en el panel y en «Apunta al cielo»; la barra del
sistema se pone en rojo oscuro; y si se abre el panel de noche con la luz
blanca, una pista lo ofrece una vez. **Sin cobertura**, el panel sigue
calculándolo todo: «Esta noche» dice qué falta sin red (las nubes y
Wikipedia) y de cuándo son los elementos de los satélites, y «Dónde ir»
comprueba antes de subir que los ficheros del panel están guardados en el
móvil.

**Los avisos no llegan solos y se quitan de verdad.** En cada evento del
calendario, «Añadir a mi calendario» crea un `.ics` (RFC 5545, con alarma el
día antes) que abre el calendario del móvil, y «Recordármelo en la app» lo
apunta en el móvil para enseñarlo arriba del todo los dos días de antes.
Nada por defecto, nada en ningún servidor, y «Quitar todos los avisos» los
quita.

**«¿Sabías que…?», con su fuente.** Cada ficha lleva una curiosidad y, al
final, de dónde sale, como enlace: la de cada planeta trae además la hoja de
la NASA (diámetro en Tierras, cuánto dura su día y su año, lunas conocidas,
temperatura, gravedad, anillos; `datos/planetas.json`, de la Planetary Fact
Sheet de la NSSDCA) y una frase que solo combina esas cifras —Venus gira al
revés y tarda más en dar una vuelta sobre sí mismo que al Sol, Saturno
flotaría, Urano rueda tumbado, la luz tarda 4 h 11 min en llegar a
Neptuno—; la Luna, el perigeo y el apogeo que vienen, la misma cara, los
3,8 cm al año y las huellas del Apolo; el Sol, la Sun Fact Sheet (y en «El
sistema solar hoy», la hoja de cada planeta, la Tierra incluida, lleva la
suya plegada); las estrellas y objetos del sur (Canopus, Omega Centauri…), al norte de qué
latitud ya no salen y a qué altura culminan aquí, y la Polar, que su altura
es la latitud; la Estación Espacial, Tiangong y el Hubble, lo que dicen la
NASA, Wikipedia y The Planetary Society; cada lluvia del calendario, de qué
cometa o asteroide son restos (lista de la IMO) y su historia (NASA, AMS,
Wikipedia; las Perseidas, «lágrimas de San Lorenzo», UCM), plegada tras
«¿Sabías que…?». «Para fotos» añade la luz zodiacal en su temporada
(febrero-marzo al anochecer, septiembre-octubre de madrugada, con si la Luna
molesta esa noche; Britannica) y la sombra triangular del Teide con la hora
de la puesta (TWAN, APOD). `tools/auditar_cielo.js` (parte 13) comprueba que
la copia es la del JSON, que los períodos cumplen la tercera ley de Kepler
con la *a* de la JPL, que cada comparación de las frases se cumple en sus
cifras, el perigeo contra la distancia del motor, la geometría del sur y la
luz zodiacal con la Luna recalculada aparte.

**Todo lo que cambia se calcula en el móvil**, en hora de Canarias y para el
Observatorio del Teide (la ficha `observatorio`, a 2.390 m): ninguna fecha
está escrita en el fuente, así que el calendario de 2031 sale igual de bien
que el de este año. Lo calcula Astronomy Engine (`vendor/`); las lluvias,
desde la longitud solar de su máximo según la IMO. Las nubes de esta noche
vienen de Open-Meteo, como el resto del tiempo, y si no hay dato la tarjeta
no sale. Los cometas no se predicen: cambian de un día para otro, y el panel
lleva a las fuentes que los siguen.

**La Estación Espacial y los satélites brillantes** sí: la tarjeta de esta
noche y el filtro «🛰️ Satélites» del calendario dan los pasos visibles desde
el Teide de la Estación Espacial Internacional, de la estación china Tiangong
y del telescopio Hubble en las próximas siete noches —a qué hora y por dónde
aparece, lo más alto que sube, dónde se pierde o entra en la sombra de la
Tierra, cuánto dura y cómo brilla—, y cada paso se ve en la carta y en
«Apunta al cielo», con su ficha, su `.ics` (alarma media hora antes) y su
aviso. Un paso «visible» es el de siempre en las tablas de pasos: más de 10°
sobre el horizonte, satélite al Sol y cielo ya oscuro (Sol a más de 6° bajo
el horizonte). Lo calcula el móvil con SGP4 (`vendor/satellite.js`, MIT,
compilado desde su fuente con commit fijado y cotejado con los 33 casos de
verificación oficiales) a partir de los elementos orbitales de
`datos/satelites.json`, que un robot (`.github/workflows/satelites.yml`,
`tools/satelites_traer.py`) renueva dos veces al día de CelesTrak: comprueba
cada línea (longitud, número de catálogo, suma de control) y, si algo no
cuadra, no escribe nada. Con elementos de más de 7 días el panel no enseña
pasos y dice por qué. Starlink no está: son trenes de días. Nada sale del
móvil: lee el fichero de su propio dominio.

**Lo fijo vive en `datos/cielo.json`**, que se rehace desde sus fuentes con
commit fijado (HYG, OpenNGC, d3-celestial, Stellarium, el Bright Star
Catalogue de Yale, los coeficientes del WMM2025):

```
bash tools/cielo_fuentes.sh /tmp/fuentes-cielo
node tools/cielo_construir.js /tmp/fuentes-cielo
node tools/cielo_uai.js /tmp/fuentes-cielo
```

`tools/cielo_uai.js` escribe en `modulos/cielo.js` la tabla `CIELO_UAI`: el
nombre en chino, chino tradicional y búlgaro de las estrellas de la carta con
nombre de la UAI que no están en el catálogo, sacado de las traducciones de
Stellarium, con la misma regla que `CIELO_EST`. Lo que Stellarium no traduce
se queda con el nombre de la UAI (y va en `idiomas/pantalla-aceptado.json`).

El nivel de cada objeto —simple vista, prismáticos o telescopio— **no se
escribe a mano**: sale de su magnitud y de la altura máxima a la que llega
desde Tenerife.

**Los textos van en `modulos/cielo.js`** (`CIELO_UI` y las tablas `CIELO_*`),
con la misma forma que `UI_TX`; solo las siete filas que hacen falta antes de
cargarlo (el botón, el título, «cargando») están en `index.html`. Lo que dicen
de leyes, certificaciones y sitios lleva encima su fuente.
`tools/auditar_cielo.js` comprueba los textos contra el código y el catálogo,
abre las cinco pestañas en los diez idiomas, coteja los cálculos con el IMCCE,
la IMO y otros, y abre el panel con el servidor apagado. Como el módulo no
tiene etiqueta, se declara con un comentario `CARGA-PEREZOSA:` para que
`tools/fuente.js` lo pegue al fuente y las herramientas de idiomas lo vean.

---

## Servicios externos

| Servicio | Para qué | Si falla |
|---|---|---|
| OpenStreetMap · ArcGIS | Teselas del mapa | El mapa se queda gris |
| Open-Meteo | Clima y microclimas, y las nubes de esta noche en el panel del cielo | No se muestra el tiempo; en el cielo, sin la tarjeta de nubes |
| Marine Open-Meteo | Estado del mar en 7 costas | El panel 🌊 avisa de que no hay datos |
| Nominatim | Búsqueda de direcciones | La búsqueda por texto no responde |
| OSRM | Rutas A→B | No se calculan rutas |
| Wikipedia | Fotos de los lugares; en el cielo, el resumen del astro que se abre | Las fichas salen sin foto; la del astro, sin resumen (lo ya leído se guarda 30 días) |
| Supabase | Cuentas y favoritos, anuncios, panel admin, suscripciones push (la tienda está oculta: `TIENDA_ACTIVA = false`) | Esas secciones quedan vacías |

Los dos paneles que dependen del tiempo —el del mar y el de «Báñate aquí
hoy»— **se ocultan si no hay dato real**. Es deliberado: una
recomendación inventada manda a alguien al agua.

---

## Supabase

Siete tablas. El esquema y las políticas están en `supabase/`.

| Tabla | Quién puede leer | Quién puede escribir |
|---|---|---|
| `anuncios` | cualquiera, si `visible = true` | solo admin |
| `anuncios_privado` | solo admin (datos de facturación) | solo admin |
| `souvenirs`, `excursiones` | cualquiera, si `visible = true` | solo admin |
| `favorites` | cada usuario los suyos | cada usuario los suyos |
| `push_subs` | **nadie desde el cliente** | alta mediante función |
| `admins` | RLS activa sin políticas: nadie | nadie |

«Admin» es la función `es_admin()`, que comprueba si el `auth.uid()`
está en `admins`. Es `SECURITY DEFINER` con `search_path` fijo.

**El panel de administración no es un control de seguridad.** Es una
comodidad de interfaz; quien manda es la RLS del servidor. Si se añade
una tabla nueva, la protección va en la política, no en el JavaScript.

---

## Notificación diaria

Cadena completa, y los tres eslabones tienen que estar:

1. **La app** pide permiso y suscribe el dispositivo
   (`pushManager.subscribe`), y guarda la suscripción llamando a
   `guardar_push_sub()`. La tarjeta que lo propone solo sale con la app
   instalada en la pantalla de inicio: en iOS es obligatorio y en Android es
   lo sensato. El botón «Activar notificaciones» de Cuenta está siempre, con
   la sesión iniciada y sin cuenta (en «Continuar como invitado»): la
   suscripción no va unida a ninguna cuenta.
2. **El workflow** se lanza nueve veces, de las 00:07 a las 07:07 UTC,
   porque GitHub retrasa sus crons varias horas. Envía el primero que cae
   dentro de la ventana (de 7 a 16 h en Canarias): coge la frase del día de
   `frases.json` y la envía firmada con las claves VAPID; `push_sends`
   impide que salga dos veces el mismo día. Borra las suscripciones que
   devuelven 404 o 410.
3. **El service worker** escucha `push` y muestra la notificación, y
   `notificationclick` enfoca la app si ya está abierta.

Si falta el paso 3 no se ve nada: el navegador enseña su propio mensaje
genérico y Chrome puede acabar cancelando la suscripción.

Las claves privadas —VAPID y `service_role`— viven **solo en GitHub
Secrets**. Nunca en el repositorio.

---

## Seguridad: qué protege y qué no

**La clave de Supabase incrustada es la `anon`, y es pública por
diseño.** Está en el HTML a la vista y no pasa nada: lo que protege los
datos es la RLS. Lo que nunca puede aparecer aquí es la `service_role`.

**La CSP lleva `'unsafe-inline'` en `script-src`**, y no es un descuido:
la app tiene manejadores `onclick` por todas partes y sin eso no
arranca. La consecuencia práctica es que **la CSP no frena un XSS**.
Quien lo frena es el escapado, y por eso importa tanto.

Al escribir HTML:

- `escapeHtml()` para el texto, `escapeAttr()` para los atributos.
- **Nunca metas un dato dentro de un `onclick`.** Ni escapado. El
  navegador convierte `&#39;` en `'` *antes* de compilar el JavaScript,
  así que el escapado se deshace justo antes de ejecutarse. Usa
  `data-algo="…"` y engánchalo con `addEventListener`.
- Los enlaces externos, por `bindExternalLink()`, que valida el
  protocolo y añade `noopener`.

**Leaflet y MarkerCluster están alojados aquí**, no en un CDN: al ser
del mismo origen los cubre `script-src 'self'`, y el mapa arranca aunque
el CDN esté caído. El SDK de Supabase también, desde el 22 de octubre de
2026 (`vendor/supabase.js`, la versión exacta con su `integrity`): ningún
script viene ya de un CDN.

Estas cabeceras **no** funcionan dentro de un `<meta>` y el navegador
las ignora: `X-Content-Type-Options`, `Permissions-Policy` y
`frame-ancestors`. Contra el clickjacking hay un guardia en JavaScript,
porque GitHub Pages no permite cabeceras propias.

### Lo que está pendiente

Conocido y sin resolver:

- **Las coordenadas GPS exactas del usuario** se envían a
  `router.project-osrm.org`, que es un servidor de demostración público,
  y a `nominatim.openstreetmap.org`, cuya política de uso además pide un
  User-Agent identificable.
- **`leaflet.markercluster` desborda la pila** en `zoomToShowLayer` con
  ciertos marcadores. Es anterior a la revisión de seguridad y sigue
  ahí.
- **`push_subs`**: se verificó que tiene RLS activa, una sola política de
  INSERT y ninguna de SELECT, pero el cuerpo exacto no está volcado en
  `supabase/favorites.sql`. Las dos consultas para completarlo están
  escritas al final de ese fichero.
- **El idioma de la notificación diaria**: la app vuelve a mandar la
  suscripción cuando se cambia de idioma, pero `guardar_push_sub()` no toca
  una que ya existe, y la frase sigue llegando en el idioma con que se
  activó. Lo arregla `supabase/push-idioma.sql` (probado en un PostgreSQL
  16), que hay que ejecutar una vez en Supabase.

---

## La app para las tiendas

Desde el 21 de octubre de 2026 la misma PWA se empaqueta para la App Store
con Capacitor (`app/`, `LANZAMIENTO-APP-STORE.md`). No hay una segunda app:
`tools/app_preparar.js` copia a `app/www/` lo que `index.html` pide en el
móvil (medido el 22 de octubre de 2026: 96 ficheros, 26,0 MB, con los dos
mapas) y le pone a `index.html` una sola línea, `window.TGO_NATIVO = true`.
Con esa marca la app no registra service worker (todo viaja dentro, también
la librería de la cuenta), no ofrece instalarse,
esconde los dos botones de avisos push, el de la cuenta y el de
«Continuar como invitado» (WKWebView no tiene Web Push), y pide a
la web viva los datos que cambian a diario —precios, avisos de AEMET,
elementos de los satélites— con los de dentro de respaldo
(`tgoFetchDatos`, en la cabecera de `index.html`). Y dice lo que es verdad
dentro de ella: el asistente lleva su propia respuesta en tres preguntas
—sin conexión, instalar la app y la frase de cada mañana—
(`faq/fuente/nativo/`), y el aviso del cielo sin permiso de cámara o de
sensores no manda a los ajustes del navegador. En la web la marca no
existe y nada cambia: `tools/probar_app.js` abre las dos en Chromium y lo
comprueba. Las frases de los permisos de iOS salen de la política de
privacidad de cada idioma, y `tools/auditar_app_store.js` coteja la ficha de
la tienda con los límites de Apple, con las cifras de hoy y con el nombre
que cada función lleva en la app. Compilar,
firmar y subir no necesita un Mac en casa: `.github/workflows/app-store.yml`
y `app/fastlane/Fastfile` lo hacen en una máquina macOS de GitHub (gratis en
repositorios públicos), y `tools/app_store_metadata.js` pone la ficha y las
capturas en el formato que `fastlane deliver` sube. Lo que Jerome tiene que
decidir y hacer desde el móvil, y el paso a paso con Mac y sin él, está en
`LANZAMIENTO-APP-STORE.md`.

---

## Antes de dar por buena una tanda de cambios

Por orden de lo que más ha dolido:

1. **Cero `pageerrors`** al cargar. Un error de sintaxis dentro de
   `places[]` se lleva por delante la aplicación entera.
2. **Los diez idiomas**, no solo el español. Cambiar de idioma en vivo y
   mirar que la sección nueva se repinta.
3. **Ningún idioma vacío** en `desc` ni en `cat`, y ninguna categoría
   sin nombre: las dos cosas fallan en silencio.
4. **Ids únicos** y coordenadas dentro de la isla.
5. **Los avisos ⚠️ traducidos.** Si el español avisa de algo y la
   traducción no, quien lee en otro idioma no se entera.

Y una regla sobre los datos: **si no hay fuente, no se inventa el
dato**. Ya se retiró una función que generaba avisos meteorológicos
ficticios y los mostraba como si fueran oficiales. Es mejor una ficha
incompleta que una que miente.
