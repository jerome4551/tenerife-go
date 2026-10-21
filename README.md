# Tenerife Go

Guía de Tenerife en forma de PWA: un mapa con lugares de toda la isla y la
red entera de guaguas y tranvía, traducida a diez idiomas, que funciona sin
conexión una vez cargada.

Publicada en GitHub Pages: <https://jerome4551.github.io/tenerife-go/>

---

## Qué hay en el repositorio

| Fichero | Qué es |
|---|---|
| `index.html` | **La aplicación**: HTML, CSS y JavaScript en un solo fichero, y dentro los 980 lugares. Medido el 17 de octubre de 2026, ya con el panel del cielo: 34.500 líneas, 2,4 MB (723 kB con gzip). |
| `datos/titsa.js` | La red de guaguas y tranvía: las 183 líneas y las 2.514 marquesinas, con sus notas de origen. Solo datos; lo carga `index.html`. |
| `modulos/cielo.js` | El panel 🔭 «Cielo de Tenerife»: su código y sus textos en los diez idiomas. No se carga al arrancar: lo pide `index.html` la primera vez que alguien abre el panel. |
| `datos/cielo.json` | El catálogo del cielo: estrellas, constelaciones, cielo profundo, dobles, variables y lluvias de estrellas, solo números y designaciones. Lo hace `tools/cielo_construir.js`. |
| `sw.js` | Service worker. Caché offline y notificaciones push. |
| `manifest.webmanifest` | Manifiesto PWA: iconos, color de tema, `display: standalone`. |
| `enviar-notificacion.js` | Script de Node que envía la notificación diaria. Corre en GitHub Actions, nunca en el navegador. |
| `frases.json` | Las 365 frases de la notificación diaria, una por día del año. |
| `vendor/` | Leaflet 1.9.4 y Leaflet.markercluster 1.5.3, alojados aquí en vez de en un CDN; las dos librerías del mapa sin conexión (`pmtiles.js` y `protomaps-leaflet.js`), las tipografías y Astronomy Engine (MIT), el motor de cálculo del panel del cielo. |
| `supabase/*.sql` | Las tablas y sus políticas de seguridad, para poder recrear el proyecto. |
| `.github/workflows/` | El cron de la notificación diaria. |
| `tools/` | Los controles y las herramientas; `bash tools/auditar.sh` los pasa todos. Entre ellos, `verificar_red.js` (la red de guaguas), `extract_js.py`, `gtfs_red.py` y `auditar_readme.js`, que coteja las cifras de este fichero. |
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

El panel 🔭 tiene cinco pestañas: **esta noche** (Sol, Luna, planetas, Vía
Láctea y lo mejor para ver a simple vista, con prismáticos y con telescopio),
el **calendario** (lluvias de estrellas, eclipses, oposiciones, conjunciones,
equinoccios), el **catálogo** por instrumento, la **carta del cielo** y
**dónde ir**. Tiene luz roja para la noche.

**Todo lo que cambia se calcula en el móvil**, en hora de Canarias y para el
Observatorio del Teide (la ficha `observatorio`, a 2.390 m): ninguna fecha
está escrita en el fuente, así que el calendario de 2031 sale igual de bien
que el de este año. Lo calcula Astronomy Engine (`vendor/`); las lluvias,
desde la longitud solar de su máximo según la IMO. Las nubes de esta noche
vienen de Open-Meteo, como el resto del tiempo, y si no hay dato la tarjeta
no sale. Cometas y satélites no se predicen: cambian de un día para otro, y
el panel lleva a la aplicación de la NASA para la Estación Espacial.

**Lo fijo vive en `datos/cielo.json`**, que se rehace desde sus fuentes con
commit fijado (HYG, OpenNGC, d3-celestial, Stellarium, el Bright Star
Catalogue de Yale):

```
bash tools/cielo_fuentes.sh /tmp/fuentes-cielo
node tools/cielo_construir.js /tmp/fuentes-cielo
```

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
| Wikipedia | Fotos de los lugares | Las fichas salen sin foto |
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
el CDN esté caído. El SDK de Supabase, que es el único script que
queda de un CDN, viene de jsDelivr con versión exacta y `integrity`.

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
