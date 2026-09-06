# `mapa/` — los mapas que la app lleva encima

## `tenerife-base.pmtiles` — está y se genera aquí

1,1 MB. **Viaja dentro de la app**, en el precache del service worker, así que
funciona sin conexión desde el primer arranque y sin descargar nada.

Lo genera `python3 tools/mapa_base.py` con datos que ya están en el
repositorio: la costa de GSHHG, el trazado real de las 183 líneas del GTFS de
TITSA y 54 núcleos con su nombre. **No lleva senderos ni curvas de nivel**,
porque no están en ningún dato nuestro.

No hace falta tocarlo salvo que cambien esos datos. Si se regenera, sale byte
a byte igual.

## `tenerife-osm.pmtiles` — no está; hay que generarlo

Es el detalle fino: senderos, edificios, usos del suelo. **La app ya sabe
usarlo**: en cuanto este fichero aparezca aquí, el panel de la ⓘ ofrece
descargarlo y la capa «Isla offline» pasa a dibujarlo. No hay que tocar
ninguna línea de código.

Mientras no esté, no se ve nada de eso y la app usa el mapa base.

### Requisitos

| | |
|---|---|
| esquema | **Protomaps basemap** (`earth`, `water`, `roads`, `places`…). Con otro esquema el fichero es válido y **el mapa sale en blanco**, sin ningún error. |
| caja | `-16.98,27.90,-16.08,28.65` — la caja de navegación de la app |
| zoom máximo | 14 como mínimo. z15 si cabe. |
| tamaño | **25 MB** si se sube arrastrando en la web de GitHub; hasta **100 MB** solo por `git push` desde línea de comandos. Por encima de 100 MB, GitHub rechaza el push: baja un nivel de zoom. |

### Cómo · con el workflow, que es lo que hay que usar

`.github/workflows/generar-mapa.yml`. En el repositorio: pestaña **Actions** →
**Generar mapa offline (PMTiles)** → **Run workflow**. Desde el móvil, en
Safari, vale igual.

| campo | |
|---|---|
| `maxzoom` | `14` por defecto; `15` da más detalle de sendero |
| `fecha_build` | vacío = busca el build más reciente que responda, hasta 12 días atrás |
| `solo_probar` | `true` = genera y verifica pero **no** hace commit |

El runner tiene la salida a red que hace falta para leer por rangos un fichero
de más de 100 GB, y como el commit lo hace `git`, el tope de 25 MB de subir
arrastrando tampoco aplica. Tarda unos minutos y al terminar deja un resumen
con el **tamaño** y la **compatibilidad del paso 7**.

Tres cosas que no deja pasar: si el fichero supera 100 MB falla y no
commitea; si el verificador falla, tampoco —un mapa en blanco no entra en el
repositorio—; y si el fichero es idéntico al que ya estaba, no crea un commit
vacío.

**Cuidado con el nombre del binario.** Los assets de `go-pmtiles` no siguen un
patrón: en la misma release, `go-pmtiles-1.31.2_Darwin_arm64.zip` va con guion
y `go-pmtiles_1.31.2_Linux_x86_64.tar.gz` con guion bajo. El workflow no
adivina: le pregunta a la API qué existe y coge el de Linux x86_64.

### Cómo · a mano, si algún día hace falta

    pmtiles extract <url-del-build-diario> tenerife-osm.pmtiles \
      --bbox=-16.98,27.90,-16.08,28.65 --maxzoom=14

### Antes de subirlo

    python3 tools/verificar_osm.py ruta/al/tenerife-osm.pmtiles index.html

El segundo argumento es opcional y comprueba lo primero de todo: que la app
que va a consumir el fichero **tenga lector**. El navegador no lee PMTiles por
su cuenta; sin `protomaps-leaflet` (o `pmtiles` + MapLibre) cargado, dejar el
`.pmtiles` en el repositorio no hace absolutamente nada. También imprime el
md5 del `index.html`, que es lo que hay que mirar antes de dar por buena
cualquier lista de parches anclados.

Siete pasos. Los seis primeros miran el fichero: formato, **esquema**, caja,
zoom, tamaño, y que dentro haya senderos de verdad —muestreando La Laguna,
Anaga, Teide, Adeje y La Orotava, no el centro de la caja, que en Tenerife cae
en mitad de la caldera—.

El séptimo mira **el par**: monta la capa con el `vendor/protomaps-leaflet.js`
que corre en el móvil y cuenta los píxeles que no son fondo.

    node tools/verificar_estilo.js ruta/al/fichero.pmtiles     # suelto

Esto es lo que resuelve el problema de las generaciones. Los *builds* y el
paquete de estilos avanzan por su cuenta, y si no se entienden el mapa sale en
blanco **sin dar ningún error**. Comparar números de versión no sirve: no
siempre están y no dicen lo que importa. Medir sí. Un fichero de OpenMapTiles
da 9 lienzos y **0,00 % pintado**; uno bueno, 99,99 %.

Si pasa, se copia aquí como `tenerife-osm.pmtiles` y se sube.

### Sobre la generación del esquema

Los *builds* diarios son **basemap v4**. Y el estilo que lleva la app también:
`vendor/protomaps-leaflet.js` filtra por `kind`, `kind_detail` y `min_zoom`, y
**no tiene ni una** aparición de `pmap:kind` ni `pmap:min_zoom`, que eran los
nombres de la generación anterior. Medido, no supuesto, y hay un control en
`tools/auditar_mapa.js` que lo vuelve a medir en cada auditoría.

Cuidado con una confusión que cuesta cara: **5.1.0 es la versión de la
librería `protomaps-leaflet`, no la del esquema.** No se usa el paquete
`@protomaps/basemaps` para nada, así que no hay nada que fijar a la serie 4.

### Lo que cuesta el fichero entero

La capa se monta sobre un `Blob`, así que el fichero **se descarga completo
antes de pintar nada**. Eso no es gratis y conviene tenerlo delante:

- Es **una sola vez**, explícita, con barra de progreso y sobre wifi si el
  usuario quiere. Después sale del caché y no se vuelve a pedir.
- El `Blob` que devuelve la Cache Storage está **respaldado en disco**:
  `blob.slice()` lee solo el trozo pedido, así que la memoria no crece con el
  tamaño del fichero. No es lo mismo que tenerlo en un `ArrayBuffer`.
- A cambio, no depende de que el *hosting* haga *byte serving*, que es un
  fallo silencioso menos.

Si algún día el fichero se va por encima de lo razonable, la salida es
alojarlo fuera y volver a rangos de verdad — y entonces sí hace falta la
comprobación de la sección siguiente. Por eso está escrita.

### Sobre las peticiones por rango

PMTiles normalmente lee el archivo a trozos con cabeceras `Range`, y eso
obliga a que el *hosting* haga *byte serving*. Si no lo hace: mapa en blanco,
sin error.

**Tenerife Go no depende de eso**, a propósito. La capa se construye con
`new pmtiles.PMTiles(fuenteBlob(...))` sobre el fichero entero ya descargado,
nunca con una URL, así que las lecturas por rango las resuelve `blob.slice()`
dentro del navegador. Hay un control permanente en `tools/auditar_mapa.js` que
graba **todas** las peticiones mientras se carga la capa y falla si alguna
lleva `Range` — para que nadie reintroduzca la dependencia pasando una URL
suelta, que en local funcionaría igual.

Si algún día el fichero se sirviera desde otro sitio:

    python3 tools/verificar_osm.py https://…/x.pmtiles --solo-cabeceras
