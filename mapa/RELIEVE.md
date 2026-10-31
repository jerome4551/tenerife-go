# `mapa/tenerife-relieve*` — el relieve de «La isla en 3D»

Tres ficheros que usa `modulos/isla3d.js` (el botón «3D» del mapa) y que hace
`tools/relieve_construir.py`. Viajan en el precache del service worker y dentro
de la app de las tiendas: el 3D abre sin conexión desde el primer arranque.

| fichero | qué |
|---|---|
| `tenerife-relieve.png` | RGB, una celda de 60 m por píxel (1.405 × 1.169), en la malla de Web Mercator de las teselas del mapa. **R y G**: la altura en decímetros (`R*256+G`; 0 es mar). **B**: la distancia a la costa con signo, 4 m por unidad, 128 en la costa y más hacia tierra. |
| `tenerife-relieve-ao.png` | Gris: la fracción de cielo que se ve desde cada celda (*sky-view factor*), con la que el 3D oscurece barrancos y calderas. 255 en el mar. |
| `tenerife-relieve.json` | La malla (esquina, paso, tamaño), las escalas, las teselas de origen con su sha256, la licencia y sus dos notas, los nombres que se pintan encima (pueblos, macizos y cimas de OSM), el relleno de la orilla si lo hubo (ver abajo) y los controles: sumas y 24 muestras con las que el módulo comprueba que el PNG se ha leído sin tocar un valor. |

Y la **huella** del relieve (los 16 primeros caracteres del sha256 del `.json`,
o `ninguno` mientras no exista) en dos líneas: `const RELIEVE_HUELLA = '…';`
en `sw.js` y `var RELIEVE_HUELLA = '…';` en el bloque del 3D de `index.html`.
La de `sw.js` hace que, con un relieve nuevo, los móviles que ya tienen la app
vuelvan a instalar el service worker y lo bajen al precache (y, con
`ninguno`, que el precache no lo pida); la de `index.html` le dice a la app si
hay relieve sin preguntar a nadie (con `ninguno`, el botón no sale y no se
pide nada: en la app de las tiendas sería un 404).

## De dónde sale

- **Las alturas**: Copernicus DEM GLO-30 (ESA / Unión Europea), una altura cada
  segundo de arco, del registro de datos abiertos de AWS (sin cuenta). La isla
  va de 27,998° N (la punta de Rasca, en la costa del mapa) a 28,59° N: casi
  entera en la tesela `Copernicus_DSM_COG_10_N28_00_W017_00_DEM`; la punta de
  Rasca, unos 200 m al sur de 28° N, cae en la `N27_00_W017`, que se pide
  también. Si esa no existe, las pocas celdas de la orilla que se quedan sin
  modelo toman la altura de la celda con modelo más cercana, y el `.json` lo
  apunta (`relleno`: cuántas, dónde y a qué distancia). Más de 300 celdas, o
  alguna a más de 600 m de una con modelo, y la herramienta para: es que falta
  una tesela. Cada celda de 60 m es la media de los píxeles del modelo que
  caen en ella.
- **La costa**: la capa `earth` de `mapa/tenerife-osm.pmtiles` (z13), la misma
  que dibuja el mapa detallado y que usa `tools/costa.py`. Donde dice mar, la
  altura es 0; donde dice tierra, al menos 0,1 m.
- **Los nombres**: las capas `places` y `pois` del mismo fichero. Los pueblos y
  ciudades que ya tiene la app (`places[]`, «ciudad» y «municipio») mandan sobre
  los de OSM; el Teide, con la altitud oficial de su ficha (3.715 m).

## La licencia

«Licence for Copernicus DEM instance COP-DEM-GLO-30-F Global 30m Full, Free &
Open» ([PDF](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM/resources/license/License-COPDEM-30.pdf)).
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

El 3D enseña las dos notas enteras al abrirse, con «© OpenStreetMap» enlazado a
su página de derechos (como el mapa plano), y las pliega a una línea al primer
gesto; «ⓘ» las vuelve a abrir. Están en tres sitios, iguales:
`modulos/isla3d.js` (`DEM_NOTA`, `DEM_RESPONSABILIDAD`),
`tools/relieve_construir.py` (`NOTA_6B`, `NOTA_6C`) y el `.json`. Las coteja
`tools/auditar_isla3d.js`.

## Cómo se rehace

Con el workflow **Generar relieve 3D** (`.github/workflows/generar-relieve.yml`):
repositorio → Actions → Run workflow. Desde el móvil, en Safari, vale igual.
Baja las teselas, construye, pasa `--comprobar` y hace commit (el relieve y la
huella de `sw.js` y de `index.html`) solo si algo cambia. Tiene que estar en
`main` para que GitHub deje lanzarlo.

A mano, con las teselas ya bajadas:

    pip install numpy pillow scipy
    python3 tools/relieve_construir.py Copernicus_DSM_COG_10_N28_00_W017_00_DEM.tif Copernicus_DSM_COG_10_N27_00_W017_00_DEM.tif
    python3 tools/relieve_construir.py --comprobar

`--comprobar` lo pasa `tools/auditar.sh`: la huella de `sw.js` y de `index.html`
es la del relieve (o `ninguno` sin él), la malla es la de la herramienta, los
sha256 y las sumas son los del `.json`, las notas de la licencia palabra por
palabra, sin perfil de color ni gamma en los PNG (un navegador cambiaría los
valores), altura y costa de acuerdo celda a celda, la superficie de tierra cerca
de los 2.034,38 km² oficiales, el borde de la malla es mar y la celda más alta
cae junto a la cumbre del Teide de la ficha.
