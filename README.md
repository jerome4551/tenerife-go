# Tenerife Go

Guía de Tenerife en forma de PWA: un mapa con lugares de toda la isla y la
red entera de guaguas y tranvía, traducida a diez idiomas, que funciona sin
conexión una vez cargada.

Publicada en GitHub Pages, en su dominio: <https://tenerifego.app/> (desde el
28 de octubre de 2026; la dirección de antes,
<https://jerome4551.github.io/tenerife-go/>, lleva a la nueva)

---

## Qué hay en el repositorio

| Fichero | Qué es |
|---|---|
| `index.html` | **La aplicación**: HTML, CSS y JavaScript en un solo fichero, y dentro los 980 lugares (979 entre el 31 de octubre, cuando se quitó una bodega cerrada, y el 8 de noviembre, cuando entró la etapa 2 del GR-131). Medido el 24 de octubre de 2026, con el panel del cielo, «Apunta al cielo», lo que piden las reseñas, los satélites, la noche guiada, el modo nativo de la App Store, el perfil y el botón SOS con sus robots encendidos: 35.785 líneas, 2,5 MB (763 kB con gzip). |
| `datos/titsa.js` | La red de guaguas y tranvía: las 183 líneas y las 2.514 marquesinas, con sus notas de origen. Solo datos; lo carga `index.html`. |
| `modulos/cielo.js` | El panel 🔭 «Cielo de Tenerife»: su código y sus textos en los diez idiomas. No se carga al arrancar: lo pide `index.html` la primera vez que alguien abre el panel. |
| `modulos/perfil.js` | La pantalla «Su perfil», la que abre «Cuenta»: el avatar y el nombre y, en tres pestañas, Viaje (el avatar y su isla con los logros), Cuerpo (la tarjeta que abre «Su cuerpo», con su personaje en pequeño; los datos con el IMC y la evolución del peso y de los kilómetros que anota la persona) y Cuenta (con la nube solo con permiso). Su código, sus estilos y sus textos en los diez idiomas. Se pide la primera vez que alguien toca «Cuenta». |
| `modulos/avatares.js` | Los 235 avatares del perfil, dibujos SVG propios en 47 sets de cinco: uno por cada idioma de la app, el de Tenerife, que se abre con 10 visitas comprobadas, y uno por cada uno de 36 países de Europa. Y 49 de oro, uno por set y tres en Tenerife, que solo se cogen el día de su fiesta (la fecha la calcula el móvil, sin red) y se quedan. Todos se mueven un segundo al tocarlos. Se pide al abrir el perfil, o al arrancar si ya hay uno elegido, para el botón de la cuenta. |
| `modulos/cuerpo.js` | «Su cuerpo», a pantalla completa encima del perfil, con su flecha de vuelta: arriba, la escena (el cielo que pasa del alba al día según se cumple la semana, un sol con un rayo por cada día activo (con series o con movimiento), el Teide, el mar de nubes y Las Cañadas con sus tajinastes; en dos temas, Día y Noche, que se eligen en la propia pantalla) y, dentro de ella, un personaje grande, en 3D si el navegador tiene WebGL 2 (`modulos/cuerpo3d.js`) y, si no o mientras llega, en SVG propio, con el aspecto que elige cada persona y «Girar» para verlo de espaldas; unos 35 músculos en 12 grupos, que se iluminan en rosa, naranja y amarillo con las series anotadas en los últimos 7 días, sobre un maniquí que lleva la cabeza de la persona: un toque en un músculo abre su hoja, y «+ 1 serie» anota una; las tres metas de la semana (los días con fuerza, los minutos de movimiento y los grupos trabajados, con las cifras de la OMS para adultos y de 5 a 17 años), la semana día a día y «Anotar movimiento», catorce deportes, cada uno con sus datos (los minutos y la intensidad, moderada o intensa, que para la meta de un adulto cuenta por dos, como dice la OMS; la distancia, en kilómetros o, a nado, en metros; el desnivel en el monte y corriendo), con la semana por deporte (las veces, el tiempo, la distancia, el ritmo o la velocidad, el desnivel y, tras bucear, lo que aconseja la DAN antes de volar); «Hoy en la isla», el tiempo de una de seis zonas de la isla que elige la persona (Open-Meteo: el índice UV con su categoría de la OMS, la temperatura, el mar, el viento, la lluvia o la nieve), los avisos de AEMET vigentes que la tocan y el consejo del día (lo que le falta a la semana y, desde un UV de 3, las horas de sombra alrededor del mediodía solar, calculadas para la zona); «Cruce la isla», el GR 131 de La Esperanza a Arona (85,55 km) con los kilómetros anotados a pie y, si la persona lo elige, en bici (por el agua la isla se rodea, no se cruza: el nado y el kayak suman a la semana, no a la travesía), sobre el mapa de la isla con su relieve y su suelo (`datos/cuerpo/isla-relieve-dia.webp` y `-noche.webp`, que pinta `tools/cuerpo_isla_relieve.py` con el relieve del 3D y la capa landuse del mapa OSM), las seis paradas en su sitio y una curva entre ellas (si llega el trazado oficial, `datos/cuerpo/gr131-trazado.json`, se dibuja ese), y un compañero que avanza con los kilómetros (a pie, senderista, presa canario o lagarto tizón; en bici, de carretera, de montaña o eléctrica), según lo último anotado; «Senderos de la isla», los senderos de la guía (las fichas de senderismo) por zonas, para marcar los que se hacen hasta el 100 %, con un punto por sendero en el mapa; los 12 grupos en una rejilla; «Sus sellos», once sellos que se consiguen una vez y se quedan con su fecha (el primer paso, los días de fuerza y los minutos de la semana, el sol entero, los 12 grupos, 10 km de travesía y las cinco paradas del GR 131), con una tarjeta que celebra cada uno; «Su postal», una imagen de la semana (la escena, el personaje y las tres cifras) para guardarla en el carrete o compartirla desde el móvil; «Las cifras», con la recomendación de su edad, la referencia de las 10 series por semana del ACSM para los adultos y las fuentes; la biblioteca de 533 ejercicios, con sus pasos y sus fuentes; «Su deporte», el entreno según el deporte que practica cada persona (ocho deportes y «Otro deporte»); «Comida», un diario por raciones, como las cuenta la AESAN, apagado hasta que la persona lo enciende; y «Preguntar», un asistente que responde sin conexión con 178 respuestas escritas de antemano, cada una con sus fuentes. Lo anotado se queda en el dispositivo. Su código, sus estilos y sus textos en los diez idiomas; lo hace el `construir.py` de su entrega. Lo abre la tarjeta de la pestaña Cuerpo del perfil (que lo pide al enseñarse, para dibujar el personaje en pequeño); si no llega, la tarjeta lo dice al tocar «Abrir». |
| `modulos/cuerpo3d.js` | El personaje de «Su cuerpo» en 3D: un motor propio sobre WebGL 2, sin bibliotecas, que dibuja un cuerpo de MakeHuman (CC0) con su pelo, su ropa, su calzado, sus gafas, su audífono y su prótesis, y encima el mapa de los 35 músculos; respira, parpadea y sonríe al anotar una serie, y se gira con el dedo. Lo pide `modulos/cuerpo.js` al abrir «Su cuerpo», si el navegador tiene WebGL 2 (el iPhone, desde iOS 15); si no, o mientras llega, queda el dibujo en SVG. Todo se calcula en el dispositivo. 30 kB comprimidos. |
| `datos/cuerpo3d/` | Los datos del personaje en 3D: los seis cuerpos (silueta × complexión), los seis peinados, las zapatillas, los ojos, las cejas y las pestañas, las texturas, el mapa de músculos y los gestos, en 71 ficheros sueltos (2,6 MB en total) con la huella de su contenido en el nombre, y `indice.json`, que los nombra. La pantalla pide solo los del aspecto elegido (unos 0,8 MB) y, al entrar en «Aspecto», el resto; el service worker los guarda al usarlos. Los hace `tools/cuerpo3d/construir3d.py` con los datos de MakeHuman (CC0; `tools/cuerpo3d/LEEME.md` dice de dónde sale cada pieza) y los empaqueta `tools/cuerpo3d/empaqueta3d.py`. |
| `datos/cuerpo/` | Los datos de «Su cuerpo»: los 533 ejercicios (`ejercicios.json`, con sus grupos, su material, su nivel y sus fuentes, y `ejercicios-<idioma>.json`, con su nombre y sus pasos), las 178 respuestas del asistente (`asistente-<idioma>.json`) y las guías de los deportes (`deportes-<idioma>.json`), uno por idioma. La pantalla pide solo los de su idioma, al abrir la biblioteca o la hoja de un grupo, «Preguntar» o un deporte, y el service worker los guarda al usarlos. |
| `modulos/emergencias.js` | El panel «Emergencias» del botón SOS: qué hacer ante una erupción, un terremoto u otra emergencia en Tenerife y a quién llamar, con sus fuentes oficiales y sus textos en los diez idiomas. Se pide al abrirlo y el service worker lo guarda desde el primer día; la barra del 112 está en `index.html` y llama aunque el módulo no llegue. |
| `modulos/isla3d.js` | «La isla en 3D», el botón «3D» del mapa: el relieve de verdad de la isla con el mapa encima, los nombres, la luz del sol de ahora con sus sombras (o la luna) y los gestos, en WebGL a mano y sin bibliotecas, con sus textos en los diez idiomas. Se pide al tocar el botón y el service worker lo guarda con el relieve, para que abra sin conexión. |
| `mapa/tenerife-relieve*.png` y `.json` | El relieve de «La isla en 3D»: una celda de 60 m del MDT05 del IGN (el terreno de los vuelos LiDAR, 5 m) o, si ese no sale, del Copernicus DEM GLO-30 (ESA / Unión Europea), con la costa del mapa detallado. Lo hace `tools/relieve_construir.py` desde el workflow «Generar relieve 3D»; mientras no exista, el botón no sale. El de ahora, del 1 de noviembre de 2026, sale del Copernicus DEM: la API del IGN solo da trozos de 0,01° y no dio tiempo a bajar la isla entera (`AUDITORIA-FINAL.md`). Qué es cada fichero, la licencia y cómo se rehace: `mapa/RELIEVE.md`. |
| `datos/cielo.json` | El catálogo del cielo: estrellas, constelaciones, cielo profundo, dobles, variables y lluvias de estrellas, solo números y designaciones. Lo hace `tools/cielo_construir.js`. |
| `datos/satelites.json` | Los elementos orbitales (TLE) de la Estación Espacial Internacional, de Tiangong y del Hubble, de CelesTrak, con su época. Los renueva el robot `tools/satelites_traer.py` dos veces al día; el panel calcula con ellos los pasos visibles. |
| `datos/planetas.json` | Las cifras de la NASA (NSSDCA) de los ocho planetas, la Luna y el Sol —diámetro, día, año sideral, lunas, temperatura, gravedad, anillos, masa, densidad—, con la fecha de cada tabla. El panel del cielo lleva una copia (`CIELO_PLANETAS`) para la ficha del planeta y las curiosidades. |
| `datos/constelaciones.json` | Las 88 constelaciones de la UAI: área y puesto por tamaño, origen y estrella más brillante (las dos tablas de la UAI en Wikipedia), la página de donde sale la curiosidad de cada una (Star Tales de Ian Ridpath; Orión, Wikipedia) y lo que dice esa página, entre «» (`cita`). El panel del cielo lleva una copia sin las citas (`CIELO_CONS`). |
| `idiomas/cielo/<idioma>.json` | Las curiosidades de las 88 constelaciones, un fichero por idioma (de 16 a 19 kB comprimido): el panel del cielo pide solo el del idioma de quien mira. |
| `sw.js` | Service worker. Caché offline y notificaciones push. |
| `manifest.webmanifest` | Manifiesto PWA: iconos, color de tema, `display: standalone`. |
| `enviar-notificacion.js` | Script de Node que envía la notificación diaria. Corre en GitHub Actions, nunca en el navegador. |
| `frases.json` | Las 365 frases de la notificación diaria, una por día del año. |
| `vendor/` | Leaflet 1.9.4 y Leaflet.markercluster 1.5.3, alojados aquí en vez de en un CDN; las dos librerías del mapa sin conexión (`pmtiles.js` y `protomaps-leaflet.js`), las tipografías, Astronomy Engine (MIT), el motor de cálculo del panel del cielo, y satellite.js 7.1.0 (MIT), el SGP4 de los pasos de los satélites, compilado desde su fuente por `tools/satelites_construir.js` (se pide solo al abrir el panel). |
| `supabase/*.sql` | Las tablas y sus políticas de seguridad, para poder recrear el proyecto. |
| `.github/workflows/` | Los robots: la notificación diaria, los avisos de AEMET, los precios de las gasolineras, el mapa y los elementos orbitales de los satélites (`satelites.yml`, dos veces al día); y los cuatro del panel de emergencias: los terremotos del IGN cerca de Tenerife (`sismos-ign.yml`, cada hora), el semáforo del boletín semanal de INVOLCAN (`semaforo-involcan.yml`, cuatro veces al día), las alertas del Gobierno de Canarias (`alertas-canarias.yml`, cada hora) y el vigía de las páginas oficiales del panel (`vigia-sos.yml`, los lunes). Y dos que no son robots: «Generar relieve 3D» (`generar-relieve.yml`), que se lanza a mano y hace el relieve de «La isla en 3D», y `app-store.yml`: se lanza a mano y compila, firma y sube la app a TestFlight y su ficha a App Store Connect en una máquina macOS de GitHub (la App Store sin Mac). Y `comprobar-dominio.yml`, que tampoco es un robot: se lanza a mano y mira desde fuera que la web responde bien en su dominio (`tenerifego.app`). |
| `tools/` | Los controles y las herramientas; `bash tools/auditar.sh` los pasa todos. Entre ellos, `verificar_red.js` (la red de guaguas), `extract_js.py`, `gtfs_red.py` y `auditar_readme.js`, que coteja las cifras de este fichero. |
| `app/` | La misma aplicación para la App Store: el proyecto de Capacitor (`capacitor.config.json`, `package.json`), las plantillas de iOS (permisos en los diez idiomas, manifiesto de privacidad, icono, arranque) y `LEEME.md`. `tools/app_preparar.js` monta `app/www/` desde la raíz; `datos/app-store/ficha.json` es la ficha de la tienda en los diez idiomas. Los pasos, en `LANZAMIENTO-APP-STORE.md`. |
| `AUDITORIA-FINAL.md` | Estado del proyecto, auditoría, lo que falta y las trampas conocidas. |

Es un monolito a propósito, no un proyecto a medio modularizar. No hay
build, ni dependencias que instalar, ni paso de compilación: se sirve
`index.html` y funciona. Las piezas aparte son siete. La red de guaguas, que son
datos y no código: 1 MB que solo se usa con las guaguas y que dentro de la
página había que leer y compilar en cada apertura. El panel del cielo
(`modulos/cielo.js`, con su motor y su catálogo), que se pide solo cuando
alguien lo abre: dentro de `index.html` habría sumado unos 100 kB comprimidos
a la primera descarga de todo el mundo. El perfil (`modulos/perfil.js` y
sus avatares, `modulos/avatares.js`), que se pide la primera vez que alguien
toca «Cuenta», por lo mismo. Y el panel de emergencias
(`modulos/emergencias.js`, 236 kB comprimidos, con sus textos en los diez
idiomas), que el service worker guarda desde el primer día para que abra sin
conexión. Y «Su cuerpo» (`modulos/cuerpo.js`, 216 kB comprimidos), que se
pide al abrir la pestaña Cuerpo del perfil, cuya tarjeta lo abre. Sus datos van aparte, en
`datos/cuerpo/`, y cada fichero se pide al usarlo. Comprimidos, los ejercicios
pesan de 24 a 48 kB por fichero, las respuestas del asistente de 139 a 177 kB
por idioma y los deportes de 10 a 13 kB. Y el personaje de «Su cuerpo» en 3D
(`modulos/cuerpo3d.js`, 30 kB comprimidos, y sus datos en `datos/cuerpo3d/`),
que la pantalla pide al abrirse si el navegador tiene WebGL 2: el motor, el
índice y solo las piezas del aspecto elegido, unos 0,8 MB de los 2,6 que hay.
Y «La isla en 3D»
(`modulos/isla3d.js`, con su relieve en `mapa/`), que se pide al tocar «3D» y
que el service worker también guarda desde el primer día.

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
playas (74), parkings (40), senderismo (38), gastronomía (37) y
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

**Y en voz alta.** «Leer en voz alta» lee la noche guiada parada a parada
con las voces del propio móvil, las mismas de la audioguía de los lugares
(`speechSynthesis`): «Parada 2 de 8. Saturno. Planeta, en Ballena. Mire
hacia el este, a 18 grados sobre el horizonte…», y deja 30 segundos para
buscarla antes de la siguiente; «Pausa» la detiene, «Seguir» la vuelve a
leer y «Siguiente» no espera. Así se mira el cielo y no la pantalla. Lo que
se oye es lo que pone la tarjeta, más la entrada, la hora de las paradas que
tienen la suya (un paso de satélite, una lluvia cuyo radiante sube más
tarde), «Mire hacia…, a … grados» y «Fin de la noche guiada». Solo usa voces
instaladas en el dispositivo (`localService`), así que lee sin red y el
texto no sale del móvil; si no hay ninguna para el idioma, lo dice y explica
que se puede instalar en los ajustes. Mientras lee, la pantalla no se apaga
(con ella apagada el móvil deja de leer); se para al cerrar el panel o al
cambiar de noche o de idioma, y se queda en pausa al abrir «Apunta al
cielo», al salir de «Esta noche» o si la página deja de verse. No guarda
nada. `tools/auditar_cielo.js` (parte 15) lo comprueba con una voz falsa
que apunta cada frase, en los diez idiomas, y que lo que se oye concuerda
con el número («1 grado», «32 stopnie», «5 przystanków»).

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

**«Dónde ir», con las normas del Parque.** Los cinco sitios que recomienda
Turismo de Tenerife, Izaña (el Observatorio se visita de día y con reserva;
de noche, no) y el Museo de la Ciencia y el Cosmos; el brillo del cielo que
mide el IAC en el Observatorio del Teide (21,20 magnitudes por segundo de
arco cuadrado) y la ruta de paneles entre El Portillo y Chío. Y las normas
del Parque Nacional para la noche, del Plan Rector de Uso y Gestión
(Decreto 182/2025): dónde se puede montar un telescopio, qué luces se
permiten (el láser, solo en las observaciones guiadas), que no se acampa ni
se duerme en el coche y que el vivac se reserva antes en Tenerife ON. El
consejo de antes de subir enlaza la predicción de AEMET para el Teide. Toda
la letra del panel va a 11 px como mínimo, lo que pide Apple para iOS.
`tools/auditar_cielo.js` (partes 16a y 16) lo coteja con sus fuentes y lo
mide en la pantalla, en los diez idiomas.

**Los avisos no llegan solos y se quitan de verdad.** En cada evento del
calendario, «Añadir a mi calendario» crea un `.ics` (RFC 5545, con alarma el
día antes) que abre el calendario del móvil, y «Recordármelo en la app» lo
apunta en el móvil para enseñarlo arriba del todo los dos días de antes.
Nada por defecto, nada en ningún servidor, y «Quitar todos los avisos» los
quita.

**«¿Sabía que…?», con su fuente.** Cada ficha lleva una curiosidad y, al
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
«¿Sabía que…?». «Para fotos» añade la luz zodiacal en su temporada
(febrero-marzo al anochecer, septiembre-octubre de madrugada, con si la Luna
molesta esa noche; Britannica) y la sombra triangular del Teide con la hora
de la puesta (TWAN, APOD). `tools/auditar_cielo.js` (parte 13) comprueba que
la copia es la del JSON, que los períodos cumplen la tercera ley de Kepler
con la *a* de la JPL, que cada comparación de las frases se cumple en sus
cifras, el perigeo contra la distancia del motor, la geometría del sur y la
luz zodiacal con la Luna recalculada aparte.

**Las 88 constelaciones, con su historia.** La ficha de cada constelación
dice de dónde viene («una de las 48 constelaciones de Ptolomeo», «dibujada
por los navegantes Keyser y De Houtman», «introducida por Lacaille desde el
cabo de Buena Esperanza»…) y cuánto ocupa («594 grados cuadrados, la n.º 26
de 88»), de las dos tablas de la UAI en Wikipedia (`datos/constelaciones.json`),
y «¿Sabía que…?» con una curiosidad de cada una en los diez idiomas —quién
la puso en el cielo, su mito, lo que merece la pena mirar—, escrita a partir
de su página en Star Tales de Ian Ridpath (Orión, de Wikipedia), con las
fuentes como enlace. Van un fichero por idioma (`idiomas/cielo/`), y cada
móvil baja solo el suyo; lo que dice cada página, entre «», queda en la
`cita` de `datos/constelaciones.json`. `tools/auditar_cielo.js` (parte 14) coteja la copia,
que las áreas sumen la esfera, el origen y la estrella más brillante con el
catálogo, los nombres que la UAI ha aprobado después de Star Tales (Uridim,
Alaybasan) y lo que cuatro de ellas dicen de Tenerife con la latitud.

**Todo lo que cambia se calcula en el móvil**, en hora de Canarias y para el
Observatorio del Teide (la ficha `observatorio`, a 2.390 m): ninguna fecha
está escrita en el fuente, así que el calendario de 2031 sale igual de bien
que el de este año. Lo calcula Astronomy Engine (`vendor/`); las lluvias,
desde la longitud solar de su máximo según la IMO, y si la Luna (a más del
30 %) está arriba parte de la noche, se dice desde cuándo o hasta cuándo hay
cielo oscuro: las Perseidas de 2027, «Buenas condiciones desde que se pone
la Luna (03:58)». Las nubes de esta noche
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

### Emergencias (SOS)

El botón **SOS** de la barra de abajo, entre Rutas y Asistente, abre qué hacer
ante una emergencia en Tenerife —volcán, terremoto, maremoto, incendio,
temporal o un problema en el mar— y a quién llamar. Se hizo el 22 de octubre
de 2026, el día del simulacro VOLCANEX, que mandó a los móviles de la isla un
ES-Alert con un semáforo naranja simulado; esa misma tarde se le sumaron el
maremoto y los otros riesgos, el mar y «la app atenta»; y por la noche, todo
verificado línea a línea contra su fuente oficial vigente («No quiero nada
inventado. Ni que no sea de actualidad más»), los primeros auxilios, el fuego
en un edificio, el apagón y las aglomeraciones.

**La app no decide nunca si hay peligro ni de qué color está el semáforo.**
«Qué pasa ahora» enseña lo oficial, con su fecha y su fuente: los avisos de
AEMET para Tenerife (los mismos que la app ya baja; tocar uno abre el
panel de los avisos) y, con sus robots encendidos, las alertas del Gobierno de
Canarias, el semáforo del último boletín de INVOLCAN y los terremotos del IGN.
Debajo, siempre, los enlaces a cada fuente, y el recordatorio de que si hay
una emergencia en la zona llega un ES-Alert. Si hay algo, una franja arriba
del panel lo resume: los avisos de AEMET, un semáforo que no sea verde, las
alertas de las últimas 24 horas o un terremoto de magnitud 3 o más. No hay
notificaciones push.

- **El 112 no depende del módulo.** La barra roja «Llamar al 112» (`tel:112`)
  y las ocho filas de texto que hacen falta antes de cargarlo están en
  `index.html`. Si `modulos/emergencias.js` no llega, el panel lo dice,
  ofrece reintentar y el 112 sigue ahí.
- **Sin conexión desde el primer día**: el módulo va en `CORE` y el service
  worker lo sirve de la caché al instante, con la red por detrás. En una
  emergencia la red puede ir saturada y el panel no puede esperarla.
- **Veinticinco guías.** «Qué hacer si…», diecinueve en siete grupos: si se
  lo piden las autoridades (evacuar, no salir de casa), si alguien se
  encuentra mal (primeros auxilios: la reanimación, el atragantamiento, el
  infarto, el ictus, una hemorragia, las quemaduras), en el mar (alguien en
  apuros en el agua, con socorrista y sin él; las picaduras; la playa y sus
  siete banderas), el volcán (el semáforo, la ceniza, los gases), el
  terremoto y el maremoto, el incendio, el tiempo y la montaña (incendio,
  lluvias e inundaciones, viento y tormentas, calor y calima, montaña), y en
  el edificio y en la calle (fuego en un edificio, apagón, fiestas y
  aglomeraciones). Y seis para prepararse: la mochila (quince cosas que se
  marcan y se guardan solo en el móvil), el plan familiar, si está de
  visita, ES-Alert, los planes oficiales y los canales oficiales; además,
  «Hospitales en el mapa».
- **Los planes oficiales**: los nueve del Gobierno de Canarias (PLATECA,
  PEVOLCA, PESICAN, INFOCA, PEFMA, PEINCA, PEMERCA, RISQCAN y RADICAN), el
  plan estatal de maremotos (BOE, 2021), el plan insular del Cabildo (PEIN) y
  los de los ayuntamientos, con sus puntos de encuentro; y las directrices
  estatales de riesgo volcánico y de terremotos de octubre de 2026.
- **Cada guía lleva debajo sus fuentes, 90 en total, comprobadas línea a
  línea el 22 de octubre de 2026**: el PEVOLCA, las directrices básicas de
  riesgo volcánico y de terremotos (Órdenes INT/1071/2026 e INT/1069/2026),
  la guía de Protección Civil para las familias (2025), el plan estatal de
  maremotos, los consejos del Gobierno de Canarias, 112 Canarias, INVOLCAN,
  el IGN, la IVHHN, el Ministerio de Sanidad, las guías de 2025 del Consejo
  Europeo de Resucitación, el NHS, la Asociación Española de Pediatría,
  Salvamento Marítimo, la norma canaria de las playas, Tenerife ON, la AESAN
  y el Servicio de Información Toxicológica. Lo que no se pudo comprobar en
  una fuente oficial vigente no está.
- **A quién llamar**: con el 112, las coordenadas del GPS para leérselas
  (no se guardan ni se envían); el 012 para informarse, por su número largo
  (+34 922 470 012), que vale también desde un móvil extranjero; el
  900 202 202 de Salvamento Marítimo (en el mar, también el canal 16 de
  VHF); y el Servicio de Información Toxicológica (+34 91 562 04 20).
- `#sos` abre el panel, `#sos-<guía>` una guía (`#sos-maremoto`), y en Android
  el icono tiene el atajo «SOS».
- Los textos, de usted en los diez idiomas, van en `modulos/emergencias.js`
  (`EMERG_UI`); se declara con `CARGA-PEREZOSA:` para que `tools/fuente.js`
  lo pegue al fuente y las herramientas de idiomas lo vean. Los titulares de
  las alertas del Gobierno se enseñan como los da él, en castellano, y en
  los otros idiomas una línea lo dice.

Cuatro robots lo tienen al día (se encendieron después de lanzar cada uno a
mano y comprobar lo que escribe). Tres le dan al panel lo que pasa: los terremotos de los últimos diez días cerca de
Tenerife, del canal del IGN (`tools/sismos_ign.py`); el semáforo del
boletín semanal de INVOLCAN (`tools/semaforo_involcan.py`); y las alertas
del Gobierno de Canarias, del canal de su categoría «Alertas»
(`tools/alertas_canarias.py`). Con ellos encendidos, el panel enseña cada
dato con su fecha y su fuente, lo esconde cuando envejece (6 horas los
terremotos y las alertas, 8 días el boletín), y el botón SOS lleva un punto
solo con un boletín que no sea verde o con un terremoto de magnitud 3 o
más en las últimas 24 horas. Si algo no cuadra, no escriben nada. El
cuarto, el vigía (`tools/vigia_sos.py`), no toca la app: una vez por semana
mira las páginas oficiales de las que sale lo que dice el panel y, si una
cambia —un plan nuevo, un consejo distinto— o deja de responder, abre una
incidencia en GitHub para que una persona lo revise.

`tools/auditar_emergencias.js` comprueba en Node las filas, las fuentes de
cada guía, los enlaces, el armazón, el service worker y el manifiesto;
`tools/probar_emergencias.js` abre el panel en un navegador en los diez
idiomas, sin el módulo y sin conexión.

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
| Supabase | Cuentas y favoritos, el perfil en la cuenta (solo con permiso), anuncios, panel admin, suscripciones push (la tienda está oculta: `TIENDA_ACTIVA = false`) | Esas secciones quedan vacías; el perfil sigue en el dispositivo y se sube cuando vuelve |

**Los créditos de Open-Meteo.** Junto a cada dato suyo (el panel del mar,
los microclimas, «El mar aquí» y el mar de los charcos en el globo, y las
nubes y el índice de la noche en el panel del cielo, también escrito en la
imagen que se comparte) va el crédito que pide su licencia: «Open-Meteo.com»
y «CC BY 4.0» con sus enlaces, quien hace los modelos (DWD, NOAA y ECMWF para
el tiempo) y, con el mar, la frase de Copernicus Marine, «Generated using
E.U. Copernicus Marine Service Information». Son nombres propios y una
fórmula de licencia: iguales en todos los idiomas. Lo vigila `probar_play.js`.

Los dos paneles que dependen del tiempo —el del mar y el de «Báñate aquí
hoy»— **se ocultan si no hay dato real**. Es deliberado: una
recomendación inventada manda a alguien al agua.

---

## Supabase

Once tablas. El esquema y las políticas están en `supabase/`.

| Tabla | Quién puede leer | Quién puede escribir |
|---|---|---|
| `anuncios` | cualquiera, si `visible = true` | solo admin |
| `anuncios_privado` | solo admin (datos de facturación) | solo admin |
| `souvenirs`, `excursiones` | cualquiera, si `visible = true` | solo admin |
| `favorites` | cada usuario los suyos | cada usuario los suyos |
| `perfiles` | cada usuario el suyo | cada usuario el suyo; la fila es su permiso: la crea «Acepto» y retirarlo la borra (`perfil.sql`) |
| `pesos`, `caminatas` | cada usuario los suyos | cada usuario los suyos, y solo con su fila de `perfiles`: caen con ella |
| `push_subs` | **nadie desde el cliente** | alta mediante función (`guardar_push_sub`) |
| `push_sends` | **nadie desde el cliente** | solo el servidor (`enviar-notificacion.js`): un día, una fila, para no enviar dos veces |
| `admins` | RLS activa sin políticas: nadie | nadie |

«Admin» es la función `es_admin()`, que comprueba si el `auth.uid()`
está en `admins`. Es `SECURITY DEFINER` con `search_path` fijo, y solo la
pueden ejecutar `authenticated` y `service_role`: sin sesión, no.

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
   lo sensato. El botón «Activar notificaciones» está siempre: en el perfil
   (lo que abre «Cuenta»), con sesión y sin ella, y en la ficha de la cuenta
   (con la sesión iniciada y en «Continuar como invitado»). La suscripción no
   va unida a ninguna cuenta.
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
