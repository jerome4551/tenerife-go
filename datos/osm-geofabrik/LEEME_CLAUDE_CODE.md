# Tenerife Go · Datos OSM + municipios de Tenerife (para Claude Code)

Generado 2026-09-27. Es un paquete de **datos**: no modifica `index.html`.

## 1. Origen

| Fuente | Detalle |
|---|---|
| OpenStreetMap | Extracto Geofabrik `canary-islands-260926-free` (GPKG), datos a **2026-09-26T20:22:51Z**. Licencia **ODbL 1.0**: todo lo derivado que se muestre en la app lleva «© OpenStreetMap contributors». |
| Límites municipales | `20151123_municip_shp.zip` (aportado por Jerome): 181 polígonos, 31 municipios, DBF fechado 23/11/2015, WGS 84 / UTM 28N. |
| Nombres de municipio | INE, vía Idescat «Códigos territoriales», provincia 38 (consulta 27/09/2026). |

Recorte: bbox lng −17.05…−16.00, lat 27.90…28.65 (el mismo bbox de validación de la app). En ese recuadro solo hay Tenerife.

## 2. Reglas (no negociables)

1. **OSM no es fuente oficial.** Sirve para contrastar coordenadas y localizar candidatos. Ningún POI entra, cambia o se borra por un dato OSM sin verificación contra fuente oficial y OK de Jerome.
2. Cambios a la app: JSON indexado por `id` (`altas` / `correcciones_coordenada` con antes-después / `modificaciones`). Nada anclado a md5.
3. Si un ancla no cuadra o un script PARA: informar y parar. No improvisar.
4. 34 nombres OSM llevan comilla doble ASCII (`"`) y 2 llevan salto de línea o acento grave (`osm-n4272342216`, `osm-n6363238477`). Escapar siempre si algún nombre se inyecta en JS: una `"` sin escapar rompe la app.
5. Ficheros de trabajo: no enlazarlos desde `index.html` ni añadirlos a `sw.js` sin instrucción expresa.
6. Tras cualquier cambio en `index.html`, pipeline habitual: `node --check` 32/32, termina en `</html>`, 0 eval, 0 console.log, `escapeHtml`×1 y `escapeAttr`×1, ids únicos, bbox, paridad zh/zht.

## 3. Contenido

| Fichero | Registros | Bytes | md5 |
|---|---|---|---|
| `osm/osm_pois_tenerife.json` | 14.281 POIs | 3.953.459 | `7580e4e2c0935f79e0d96c36ac63f1cc` |
| `osm/osm_lugares_tenerife.json` | 1.445 lugares | 320.638 | `a798c538b9e1105fb9d3d686135598b3` |
| `osm/resumen_extraccion.json` | recuentos por capa/clase + controles | 24.759 | `83828967538cabda38aa7189fbb64bff` |
| `municipios/municipios_tenerife.geojson` | 31 municipios, completo | 3.282.096 | `d535932c759f562984798f517421fa2c` |
| `municipios/municipios_tenerife_simplificado.geojson` | 31 municipios, DP 5 m | 519.590 | `5d83a7fb5679eee04a9e1f22b781b563` |
| `scripts/geo_utils.py` | utilidades stdlib | 16.906 | `2b17ea4cb023afb0f576a732da07265b` |
| `scripts/extraer_tenerife.py` | regenera todo | 33.044 | `874c8e79b2ce3eb414f10159d93c997f` |
| `scripts/auditar_places_osm.js` | auditoría (solo lectura) | 10.772 | `b07da79a074e571ce31997ae7d9e12a0` |

Aparte, fuera del repo (89 MB, supera el límite de 25 MB de subida web de GitHub): `tenerife-osm-completo-2026-09-26.gpkg`, las 20 capas OSM recortadas (edificios, calles, usos del suelo, agua, espacios protegidos…). md5 `67af723e34d313f5f3ff3759fabc655a`.

## 4. Esquemas

### `osm/osm_pois_tenerife.json`

`{"_meta": {…}, "pois": {"<id>": {…}, …}}`, un registro por línea.

| Campo | Contenido |
|---|---|
| id (clave) | `osm-n<ID>` nodo · `osm-a<ID>` área (way o relation: el extracto free no lo distingue) |
| `name` | nombre OSM; vacío solo en clases útiles sin nombre (miradores, aseos, fuentes de agua, cajeros, farmacias…) |
| `grupo` | playa, mirador, naturaleza, cultura, religioso, ocio, alojamiento, gastronomia, salud, transporte, servicios, compras |
| `cat_app` | categoría de la app **sugerida**, solo si la correspondencia es 1:1 (tabla §5); `null` si es ambigua |
| `fclass` | clases Geofabrik; varias si el objeto lleva varias etiquetas; la primera manda |
| `lat`, `lng` | WGS84, 6 decimales. En polígonos: punto **garantizado dentro** (centroide si cae dentro; si no, punto interior) |
| `ine`, `muni` | código INE y nombre del municipio |
| `muni_metodo` | `poligono` · `costa` (fuera del polígono, municipio más cercano, con `muni_dist_m`) · `mar` (no hay ninguno) |
| `geom`, `punto` | `punto` / `poligono`; `punto` = `centroide` o `interior` |
| `bbox`, `area_m2` | solo polígonos: `[minLng,minLat,maxLng,maxLat]` y superficie aproximada |
| `capas`, `osm` | capas Geofabrik de origen; `node/ID` o `area/ID` |
| `posible_dup` | ids con mismo nombre y mismo grupo a menos de 150 m (casi siempre nodo + polígono del mismo sitio). No se ha fusionado nada |

Inclusión: todas las clases con nombre, más las útiles aunque no tengan nombre. Fuera: mobiliario urbano (bancos, papeleras, contenedores, farolas, pasos de peatones…), depósitos y pozos de agua, colegios, y **paradas de guagua y tranvía** (la app ya usa GTFS TITSA y Metropolitano, que son oficiales). Todo sigue en el GPKG completo.

Ejemplo:
```json
"osm-a2108892": {"name":"Playa de Benijo","grupo":"playa","cat_app":"playa","fclass":["beach"],"lat":28.576001,"lng":-16.185851,"ine":"38038","muni":"Santa Cruz de Tenerife","muni_metodo":"costa","muni_dist_m":16,"geom":"poligono","punto":"centroide","bbox":[-16.188066,28.57537,-16.184108,28.577125],"area_m2":22508,"capas":["natural_a"],"osm":"area/2108892"}
```

### `osm/osm_lugares_tenerife.json`

Mismos campos salvo `grupo`, `cat_app` y `posible_dup`. `fclass`: city 1, town 21, village 56, suburb 185, hamlet 444, locality 734, farm 2, region 1, island 1. La población OSM se omite a propósito (dato perecedero).

### `municipios/*.geojson`

FeatureCollection de 31 Feature `MultiPolygon` (RFC 7946, exterior antihorario), `id` = código INE.
`properties`: `cod_ine`, `nombre` («La Orotava»), `nombre_ine` («Orotava, La»), `nombre_shp` (valor del DBF, sin tildes y abreviado: «Guimar», «La Laguna», «Vilaflor»), `area_km2`, `partes`, `partes_roque`. **Usar `cod_ine` como clave.**

- Completo (143.723 vértices): para punto-en-polígono.
- Simplificado, Douglas-Peucker 5 m (22.430 vértices): **solo para pintar**; con él, 9 de 14.191 puntos cambian de municipio.

## 5. `cat_app` sugerida (solo correspondencias 1:1)

| fclass OSM | cat_app | nº |
|---|---|---|
| peak, volcano | montana | 559 |
| viewpoint, observation_tower | mirador | 493 |
| supermarket | supermercado | 370 |
| pharmacy | farmacia | 295 |
| beach | playa | 261 |
| fuel | gasolinera | 202 |
| parking (solo con nombre) | parking | 153 |
| camp_site | camping | 70 |
| museum | museo | 49 |
| hospital | hospital | 41 |
| marketplace | mercadillo | 35 |
| veterinary | veterinario | 35 |
| marina | puerto_ocio | 21 |
| lighthouse | faros | 13 |
| golf_course | golf | 12 |
| zoo | animales | 6 |

Sin 1:1 (`cat_app: null`): `tourist_info` (mezcla oficinas y paneles), `picnic_site` (no equivale a barbacoa), `clinic`/`doctors` (no equivale a centro de salud público), `swimming_pool` (casi todas privadas), lugares de culto y el resto.

## 6. Controles ya medidos

- POIs y lugares: ids únicos, 0 fuera de bbox, 0 NaN.
- UTM 28N → WGS84 (stdlib, series de Krüger): reproduce el ejemplo publicado de Snyder (1987) al decímetro; ida y vuelta < 0,1 µm; el área de cada polígono coincide con `AREA_GIS` del DBF (diferencia < 5·10⁻⁶).
- Punto-en-polígono contra el GeoJSON completo reproduce la asignación municipal 14.191/14.191.
- Asignación de POIs: 14.191 dentro de polígono, 90 en costa (máximo 209 m del límite), 0 en mar.
- Contraste con los límites municipales de OSM: coincide el 99,36 % (15.527). Los 88 que difieren están en bordes entre municipios; el grupo mayor, en la cumbre: La Orotava ↔ Los Realejos 16, Fasnia ↔ La Orotava 13, Arico ↔ La Orotava 6 (Los Realejos mide 51,53 km² en el oficial y 56,49 km² en OSM). Manda el oficial. Mediana de desplazamiento entre centroides oficial y OSM: 17,6 m.
- GPKG completo: `integrity_check` ok, `application_id` GPKG, recuentos correctos por capa.

## 7. TAREA 1 · Auditoría de coordenadas de `places` (SOLO LECTURA)

1. Ejecutar sobre el `index.html` **vigente** del repo, nunca sobre una copia antigua:
   ```
   node scripts/auditar_places_osm.js ../index.html osm/osm_pois_tenerife.json osm/osm_lugares_tenerife.json auditoria
   ```
   (rutas relativas a esta carpeta; ajustar si está en otro sitio).
2. Si el script PARA (ancla `const places = [` ausente o repetida, array ilegible, lat/lng no numéricos): informar a Jerome y parar.
3. Entregar a Jerome: el resumen por estado, `auditoria/auditoria_places_osm.csv` y las discrepancias ordenadas de mayor a menor distancia, cada una con su enlace `osm_mapa`.
4. **No corregir ninguna coordenada.** Cada caso se verifica contra fuente oficial y Jerome aprueba. Las correcciones aprobadas se entregan como `correcciones_coordenada` (JSON indexado por id, antes/después).

Estados: `ok` ≤ 150 m · `revisar` ≤ 500 m · `discrepancia` > 500 m (para ciudad/municipio: 1.000 / 2.500 m, porque su centro es difuso) · `sin_match` (no hay objeto OSM comparable; no implica error) · `no_comparable` (categorías sin equivalente OSM: surf, buceo, webcam, accesible, senderismo…).
Emparejado: solo fclass compatibles con la categoría. Por nombre (Jaccard ponderado ≥ 0,6) hasta 5 km; por nombre parcial solo hasta 500 m. En polígonos se mide la distancia a su bbox.

Prueba de humo, sobre una copia antigua del proyecto (765 places, md5 `c803068c…`): ok 272 · revisar 29 · discrepancia 14 · sin_match 255 · no_comparable 195. Vuelve a detectar Benijo a 565 m, el desplazamiento ya identificado en la auditoría de playas: el método funciona.

## 8. Otros usos (solo si Jerome lo pide)

- Capa o filtro por municipio: simplificado para pintar; completo + `cod_ine` para asignar.
- Atribución municipal de los POIs de la app por punto-en-polígono (misma técnica que las paradas TITSA).
- Buscador «cerca de…» con `osm_lugares_tenerife.json`.
- Candidatos a alta por categoría (miradores, faros, museos…), cada uno verificado en fuente oficial antes de entrar.

## 9. Regenerar con un extracto más reciente

```
python3 scripts/extraer_tenerife.py --gpkg canary-islands-AAMMDD-free_gpkg.zip --municip 20151123_municip_shp.zip --out salida [--gpkg-completo]
```
Solo biblioteca estándar de Python, unos 20 s. Descarga diaria: `https://download.geofabrik.de/africa/canary-islands-latest-free.gpkg.zip`
