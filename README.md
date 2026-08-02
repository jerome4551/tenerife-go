# Tenerife Go

Guía de Tenerife en forma de PWA: un mapa con 760 lugares verificados,
traducida a 8 idiomas, que funciona sin conexión una vez cargada.

Publicada en GitHub Pages: <https://jerome4551.github.io/tenerife-go/>

---

## Qué hay en el repositorio

| Fichero | Qué es |
|---|---|
| `index.html` | **La aplicación entera**: 27.780 líneas, 3 MB. HTML, CSS y JavaScript en un solo fichero, y dentro también los datos de los 760 lugares. |
| `sw.js` | Service worker. Caché offline y notificaciones push. |
| `manifest.webmanifest` | Manifiesto PWA: iconos, color de tema, `display: standalone`. |
| `enviar-notificacion.js` | Script de Node que envía la notificación diaria. Corre en GitHub Actions, nunca en el navegador. |
| `frases.json` | Las 365 frases de la notificación diaria, una por día del año. |
| `vendor/` | Leaflet 1.9.4 y Leaflet.markercluster 1.5.3, alojados aquí en vez de en un CDN. |
| `supabase/*.sql` | Las tablas y sus políticas de seguridad, para poder recrear el proyecto. |
| `.github/workflows/` | El cron de la notificación diaria. |

Es un monolito a propósito, no un proyecto a medio modularizar. No hay
build, ni dependencias que instalar, ni paso de compilación: se sirve
`index.html` y funciona.

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

Los 760 lugares viven en el array `places[]` dentro de `index.html`.
Cada uno es un objeto así:

```js
{ id:"teresitas", category:"playa", cats:["parking"],
  name:"Playa Las Teresitas", emoji:"🏝️", lat:28.5097, lng:-16.1847,
  parking:{ gratis:true, aviso:{ es:"…", en:"…" /* 8 idiomas */ } },
  desc:{ es:"…", en:"…", fr:"…", de:"…", it:"…", nl:"…", zh:"…", zht:"…" },
  cat:{ /* mismos 8 idiomas */ },
  tags:["Arena Sahara","Familiar","Santa Cruz"] }
```

- `category` es la principal. `cats[]` añade categorías extra: así una
  playa puede aparecer también en el filtro de parkings sin duplicar el
  pin en el mapa.
- `desc` y `cat` llevan **los 8 idiomas siempre**. Si falta uno, el
  lugar se ve incompleto en ese idioma.
- El `id` se usa dentro de manejadores `onclick`, así que solo puede
  llevar letras, dígitos, punto y guion.

Reparto actual: 42 categorías repartidas en 11 grupos de filtro. Las más
pobladas son municipios (41), parkings (42, contando los que van como
atributo de otro lugar), gastronomía (39), supermercados (38),
senderismo (37) y playas (35).

### Idiomas

Dos estructuras distintas, y conviene no confundirlas:

- **`LANGS`** — 137 claves de interfaz por idioma, en mapas planos:
  `LANGS.es.searchPlaceholder`. Dentro va `categories`, con el nombre de
  las 42 categorías.
- **`UI_TX`** — el formato inverso, `{clave: {idioma: texto}}`, para lo
  que se fue añadiendo después. Se lee con `tx(clave, vars)`.

Al cambiar de idioma, `setLang()` repinta marcadores, filtros, panel del
mar y panel de baño. **Una sección nueva tiene que repintarse ahí
también**: si no, se queda en el idioma anterior hasta recargar.

Una categoría sin nombre en un idioma **no da error: el chip
desaparece**. Ese silencio ya escondió los parkings una vez, y seis
categorías en italiano otra. Merece la pena comprobarlo al añadir una.

### Guaguas

`TITSA_LINES` tiene 35 líneas con 216 paradas. Cada línea lleva
`frecuencia` y `precio` como texto libre; `parseFrequencyMinutes()` saca
de ahí los minutos de espera para el planificador de rutas, y si no
encuentra ningún número usa 30 minutos, que es el lado prudente.

Las paradas son una simplificación del recorrido, no la lista completa:
varias líneas cubren todo su trayecto con tres o cuatro.

El planificador agrupa las paradas por coordenada redondeada a cuatro
decimales, así que **dos líneas solo hacen transbordo si comparten la
coordenada exacta**. Por eso las paradas repetidas se copian de
`places[]` en vez de reescribirlas a mano: Alcalá figuraba con dos
coordenadas distintas separadas 3,7 km y el planificador la trataba como
dos sitios.

Un mismo número puede salir dos veces, una de día y otra de noche: la
101, la 711 y la 473 lo hacen. Lo que distingue las entradas es el `id`
—`bus-711` frente a `bus-711N`—, que es lo que usan todas las búsquedas
del código; `numero` solo se pinta.

---

## Servicios externos

| Servicio | Para qué | Si falla |
|---|---|---|
| OpenStreetMap · ArcGIS | Teselas del mapa | El mapa se queda gris |
| Open-Meteo | Clima y microclimas | No se muestra el tiempo |
| Marine Open-Meteo | Estado del mar en 7 costas | El panel 🌊 avisa de que no hay datos |
| Nominatim | Búsqueda de direcciones | La búsqueda por texto no responde |
| OSRM | Rutas A→B | No se calculan rutas |
| Wikipedia | Fotos de los lugares | Las fichas salen sin foto |
| Supabase | Favoritos, tienda, panel admin, suscripciones push | Esas secciones quedan vacías |

Los dos paneles que dependen del tiempo —el del mar y el de «Báñate aquí
hoy»— **se ocultan si no hay dato real**. Es deliberado: una
recomendación inventada manda a alguien al agua.

---

## Supabase

Cinco tablas. El esquema y las políticas están en `supabase/`.

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
   `guardar_push_sub()`. Solo se ofrece si la app está instalada en la
   pantalla de inicio: en iOS es obligatorio y en Android es lo sensato.
2. **El workflow** corre cuatro veces cada mañana, coge la frase del día
   de `frases.json` y la envía firmada con las claves VAPID. Borra las
   suscripciones que devuelven 404 o 410.
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
- **No hay pantallas de bienvenida en iOS.** Había 11 etiquetas
  apuntando a `splash-*.png` que nunca existieron; se retiraron. Para
  recuperarlas hay que crear antes las imágenes.
- **`leaflet.markercluster` desborda la pila** en `zoomToShowLayer` con
  ciertos marcadores. Es anterior a la revisión de seguridad y sigue
  ahí.
- **`push_subs`**: se verificó que tiene RLS activa, una sola política de
  INSERT y ninguna de SELECT, pero el cuerpo exacto no está volcado en
  `supabase/favorites.sql`. Las dos consultas para completarlo están
  escritas al final de ese fichero.

---

## Antes de dar por buena una tanda de cambios

Por orden de lo que más ha dolido:

1. **Cero `pageerrors`** al cargar. Un error de sintaxis dentro de
   `places[]` se lleva por delante la aplicación entera.
2. **Los 8 idiomas**, no solo el español. Cambiar de idioma en vivo y
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
