# `mapa/tenerife-relieve*` — el relieve de «La isla en 3D»

Tres ficheros que usa `modulos/isla3d.js` (el botón «3D» del mapa) y que hace
`tools/relieve_construir.py`. Viajan en el precache del service worker y dentro
de la app de las tiendas: el 3D abre sin conexión desde el primer arranque.

| fichero | qué |
|---|---|
| `tenerife-relieve.png` | RGB, una celda de 60 m por píxel (1.405 × 1.169), en la malla de Web Mercator de las teselas del mapa. **R y G**: la altura en decímetros (`R*256+G`; 0 es mar). **B**: la distancia a la costa con signo, 4 m por unidad, 128 en la costa y más hacia tierra. |
| `tenerife-relieve-ao.png` | Gris: la fracción de cielo que se ve desde cada celda (*sky-view factor*), con la que el 3D oscurece barrancos y calderas. 255 en el mar. |
| `tenerife-relieve.json` | La malla (esquina, paso, tamaño), las escalas, la fuente (el MDT05 del IGN o el Copernicus DEM) con lo que entró y su sha256, su licencia y su crédito palabra por palabra, los nombres que se pintan encima (pueblos, macizos y cimas de OSM), el relleno de la orilla si lo hubo (ver abajo) y los controles: sumas y 24 muestras con las que el módulo comprueba que el PNG se ha leído sin tocar un valor. |

Y la **huella** del relieve (los 16 primeros caracteres del sha256 del `.json`,
o `ninguno` mientras no exista) en dos líneas: `const RELIEVE_HUELLA = '…';`
en `sw.js` y `var RELIEVE_HUELLA = '…';` en el bloque del 3D de `index.html`.
La de `sw.js` hace que, con un relieve nuevo, los móviles que ya tienen la app
vuelvan a instalar el service worker y lo bajen al precache (y, con
`ninguno`, que el precache no lo pida); la de `index.html` le dice a la app si
hay relieve sin preguntar a nadie (con `ninguno`, el botón no sale y no se
pide nada: en la app de las tiendas sería un 404).

## De dónde sale

- **Las alturas, primero del IGN** (desde el 31 de octubre de 2026 por la
  tarde; Jerome: «Fuentes 3D la mejor pero gratis»): el Modelo Digital del
  Terreno con paso de malla de 5 metros (MDT05) del Instituto Geográfico
  Nacional, de los vuelos LiDAR del PNOA (1.ª cobertura): el **terreno**, sin
  árboles ni edificios, con una exactitud vertical de 50 cm según su metadato.
  Lo baja `tools/relieve_ign.py` de la API de coberturas de la IDEE
  (`api-coverages.idee.es`, colección `EL.ElevationGridCoverage_4258_5_C`, sin
  cuenta), a trozos de 0,04° (y en cuatro más pequeños si uno no sale), solo
  los que tocan tierra, y lo deja en un mosaico de bloques de 3 × 3 píxeles
  (unos 14 m). Antes de usarlo se compara con el Copernicus DEM en las celdas
  de tierra: si la diferencia mediana pasa de 15 m o la media de su valor
  absoluto de 40 m, no se usa (un dato mal georreferenciado o de otro sitio se
  va a cientos de metros). El de Copernicus es de superficie, así que en los
  bosques y en las ciudades el del IGN queda unos metros más bajo, que es lo
  que tiene que salir.
- **Si el IGN no sale, del Copernicus DEM GLO-30** (ESA / Unión Europea), una
  altura cada segundo de arco, del registro de datos abiertos de AWS (sin
  cuenta). La isla va de 27,998° N (la punta de Rasca, en la costa del mapa) a
  28,59° N: casi entera en la tesela `Copernicus_DSM_COG_10_N28_00_W017_00_DEM`;
  la punta de Rasca, unos 200 m al sur de 28° N, cae en la `N27_00_W017`, que
  se pide también. Si esa no existe, las pocas celdas de la orilla que se
  quedan sin modelo toman la altura de la celda con modelo más cercana, y el
  `.json` lo apunta (`relleno`: cuántas, dónde y a qué distancia). Más de 300
  celdas, o alguna a más de 600 m de una con modelo, y la herramienta para: es
  que falta una tesela.
- Con las dos, cada celda de 60 m es la media de los píxeles del modelo que
  caen en ella, y el `.json` dice de cuál sale (`fuente.id`: `ign-mdt05` o
  `copernicus-glo30`), con lo que se bajó (`fuente.descarga`, con el IGN) y la
  comparación (`fuente.cotejo`).
- **La costa**: la capa `earth` de `mapa/tenerife-osm.pmtiles` (z13), la misma
  que dibuja el mapa detallado y que usa `tools/costa.py`. Donde dice mar, la
  altura es 0; donde dice tierra, al menos 0,1 m.
- **Los nombres**: las capas `places` y `pois` del mismo fichero. Los pueblos y
  ciudades que ya tiene la app (`places[]`, «ciudad» y «municipio») mandan sobre
  los de OSM; el Teide, con la altitud oficial de su ficha (3.715 m).

## La licencia

**IGN**: CC BY 4.0, uso comercial incluido. Para una obra derivada (aquí, el
MDT05 pasado a celdas de 60 m y con la costa de OSM), las condiciones de uso
del IGN piden «Obra derivada de <producto> <fecha> CC-BY 4.0 <productor>»,
visible al pie del mapa, y la misma atribución en los metadatos; el metadato
del MDT05 en la IDEE (`spaignMDT05`) da «MDT05-cob1 2008-2015 CC-BY 4.0
scne.es». El 3D enseña, siempre entero (es corto): «Obra derivada de
MDT05-cob1 2008-2015 CC-BY 4.0 scne.es», y lo lleva el `.json`.

**Copernicus**, si el relieve sale de él: «Licence for Copernicus DEM instance
COP-DEM-GLO-30-F Global 30m Full, Free & Open»
([PDF](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM/resources/license/License-COPDEM-30.pdf)).
Permite usarlo, adaptarlo y enseñarlo al público gratis. Su artículo 6 pide a
quien lo enseña, palabra por palabra:

- 6(b), la nota de los datos **adaptados** (aquí van remuestreados a 60 m y con
  la costa de OSM): «produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014
  and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the
  European Union and ESA; all rights reserved»;
- 6(c), que nadie a cargo de Copernicus responde del uso: «The organisations in
  charge of the Copernicus programme by law or by delegation do not incur any
  liability for any use of the Copernicus WorldDEM-30»;
- 6(d), no dar a entender que Copernicus respalda la app.

El 3D enseña las dos notas enteras al abrirse y las pliega a una línea al
primer gesto; «ⓘ» las vuelve a abrir.

Con las dos, «© OpenStreetMap» enlazado a su página de derechos (como el mapa
plano). El crédito sale de la fuente que dice el `.json`, pero el texto no: va
en `modulos/isla3d.js` (`DEM_FUENTES`: `IGN_NOTA`, `DEM_NOTA`,
`DEM_RESPONSABILIDAD`) y en `tools/relieve_construir.py` (`FUENTES`), y un
relieve con otra fuente no se dibuja. `tools/auditar_isla3d.js` coteja las
copias, y `--comprobar` las del `.json`.

## Cómo se rehace

Con el workflow **Generar relieve 3D** (`.github/workflows/generar-relieve.yml`):
repositorio → Actions → Run workflow. Desde el móvil, en Safari, vale igual.
Baja las teselas de Copernicus y el MDT05 del IGN (con 40 minutos de tope),
construye con el IGN (y lo compara con Copernicus) y, si eso no sale, con
Copernicus; pasa
`--comprobar` y hace commit (el relieve y la huella de `sw.js` y de
`index.html`) solo si algo cambia. El resumen dice de qué fuente salió y por
qué. Con `fuente` = `copernicus`, solo Copernicus; con `solo_probar` =
`true`, todo menos el commit. Tiene que estar en `main` para que GitHub deje
lanzarlo.

A mano, con red:

    pip install numpy pillow scipy rasterio
    python3 tools/relieve_ign.py dem-ign
    python3 tools/relieve_construir.py dem-ign/ign-mdt05-tenerife.tif --fuente ign-mdt05 \
        --registro dem-ign/ign-mdt05-tenerife.json --cotejar Copernicus_DSM_COG_10_N2*_DEM.tif
    python3 tools/relieve_construir.py --comprobar

o solo con Copernicus, con las teselas ya bajadas:

    python3 tools/relieve_construir.py Copernicus_DSM_COG_10_N28_00_W017_00_DEM.tif Copernicus_DSM_COG_10_N27_00_W017_00_DEM.tif

`--comprobar` lo pasa `tools/auditar.sh`: la huella de `sw.js` y de `index.html`
es la del relieve (o `ninguno` sin él), la malla es la de la herramienta, los
sha256 y las sumas son los del `.json`, la fuente es una de las dos y su
crédito va palabra por palabra (con el IGN, también que lleva la comparación
con Copernicus y que pasa), sin perfil de color ni gamma en los PNG (un navegador cambiaría los
valores), altura y costa de acuerdo celda a celda, la superficie de tierra cerca
de los 2.034,38 km² oficiales, el borde de la malla es mar y la celda más alta
cae junto a la cumbre del Teide de la ficha.
