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
| tamaño | **por debajo de 100 MB**: GitHub rechaza el push por encima. Por encima de 80 MB, bajar un nivel de zoom. |

### Cómo

En la página de *builds* de Protomaps se dibuja la caja y se descarga el
extracto. También se puede con la herramienta de línea de comandos
`go-pmtiles`, que saca el trozo del build diario por rangos sin bajarse el
planeta:

    pmtiles extract <url-del-build-diario> tenerife-osm.pmtiles \
      --bbox=-16.98,27.90,-16.08,28.65 --maxzoom=14

### Antes de subirlo

    python3 tools/verificar_osm.py ruta/al/tenerife-osm.pmtiles

Comprueba el esquema, la caja, el zoom, el tamaño y que dentro haya senderos.
Si pasa, se copia aquí como `tenerife-osm.pmtiles` y se sube.
