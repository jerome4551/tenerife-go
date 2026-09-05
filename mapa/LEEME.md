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

### Cómo

En la página de *builds* de Protomaps se dibuja la caja y se descarga el
extracto. También se puede con la herramienta de línea de comandos
`go-pmtiles`, que saca el trozo del build diario por rangos sin bajarse el
planeta:

    pmtiles extract <url-del-build-diario> tenerife-osm.pmtiles \
      --bbox=-16.98,27.90,-16.08,28.65 --maxzoom=14

### Antes de subirlo

    python3 tools/verificar_osm.py ruta/al/tenerife-osm.pmtiles

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
