# Revisión de los 787 lugares

**26 de septiembre de 2026.** Generado con `node tools/informe_lugares.js`.
Barre los 787, no una muestra. Lo que no se puede comprobar desde aquí sale
contado y listado, no callado.

## 0 · El estado de cada área, de un vistazo

Lo primero, porque es lo que evita repetir trabajo. **Un área en «cerrado»
no se vuelve a pedir.** Cerrado no quiere decir perfecto: quiere decir que
la verificación se hizo, que se agotó lo que se podía comprobar y que el
techo está escrito. Un área cerrada con un dato deducido **está cerrada**:
el «deducida» es el resultado honesto, no una tarea pendiente.

| área | estado | qué hay |
|---|---|---|
| `orientacion_playa` | **cerrado** | verificadas abriendo la fuente 11 · heredadas por vecindad 1 · deduccion auditada 53 · escritas a mano antes 12 · total en la tabl |
| `calidad_del_agua` | **cerrado** | 46 fichas con aguaCalidad y su ano. El ano va en el dato para que se vea cuando caduca. |
| `bandera_azul` | **cerrado** | 11 fichas con blueFlag:true, cifra exacta comprobada contra la lista. |
| `red_titsa` | **cerrado** | 183 lineas, 6.263 referencias de parada sobre 2.514 marquesinas, trazados regenerados del GTFS. La parada mas lejos de su trazado, |
| `idiomas` | **cerrado** | Diez idiomas. auditar_idioma.js da 0 hallazgos en los diez sobre 1.705 textos de lugar y 544 de interfaz cada uno. 0 etiquetas sin |
| `asistente` | **cerrado** | 69 respuestas x 10 idiomas = 690, y se llega a las 690 desde el buscador del asistente. |
| `mapa_sin_conexion` | **cerrado** | 76 controles en verde, 99,77 % de pixeles pintados con el estilo de la app, 12 teselas sin red. |
| `coordenadas` | abierto | 132 verificadas con su fuente · 655 sin mirar · 54 puestas a ojo |
| `municipio_de_cada_ficha` | **cerrado** | 520 declaran municipio, 475 comprobados, 45 sin paradas suficientes, 267 no declaran ninguno. 0 contradicciones y 0 municipios fue |
| `lugares_en_el_mar` | abierto | 781 de 787 caen en tierra contra la capa earth de OSM. |

**Lo único que queda por hacer está en las 2 áreas abiertas:**

- **`coordenadas`** — Las que estan escritas con 3 decimales significativos o menos en los dos ejes, o sea puestas a ojo. El informe las cuenta y las lista una a una.
- **`lugares_en_el_mar`** — 6 en el agua, las del parche auditoria-mar-8. Necesitan Overpass, que esta bloqueado en el entorno de trabajo.

### Las 8 cerradas, con su techo escrito

**`orientacion_playa`** · 2026-09-08
- qué se hizo: Se buscaron fuentes publicadas para la orientacion de las 65 zonas de bano que no la tenian, y se auditaron una por una las que produjo un modelo de lenguaje.
- **el techo**: La orientacion de playa NO es un campo publicado en ninguna base de datos oficial espanola ni canaria. No es una suposicion: se comprobo abriendo cada fuente.
- fuentes que se abrieron y no sirven:
  - **surf-forecast.com** — SIRVE pero solo cubre rompientes: 26 spots en Tenerife, ~12 coinciden con puntos de bano. De ahi salen las 11 verificadas. Las playas abrigadas, que son las que la gente usa para banarse, no son spots de surf y no tienen ficha.
  - **AEMET prediccion de playas** — NO SIRVE. Sus campos son cielo, viento SOLO EN INTENSIDAD (sin rumbo), mar de fondo, temperatura, agua, UV y mareas. Comprobado abriendo la ficha de San Marcos (3802201).
  - **MITECO Guia de Playas** — NO SIRVE. Base completa del Estado, ~3.000 playas, nueve secciones y la orientacion no es ninguna.
  - **Catalogo Decreto 116/2018 (Canarias)** — El decreto fue ANULADO por el Tribunal Supremo. Todo lo que se apoyara en el ha perdido su base legal.
- método automático: PROBADO Y RECHAZADO. tools/orientacion_playa.py deduce ori del poligono de arena de OSM. Reproduce 7 de las 12 escritas a mano y el umbral, fijado antes de mirar, era 10. Segun ORDENorientaciones.md: «si sale que no, se para y la respuesta queda cerrada para siempre».
- auditoría: Las 4 filas que el modelo dijo tener respaldo en surf-forecast se abrieron una por una: las 4 dicen lo que decia. Se cazo un error real de 90 grados (playa-grande-abades, SE -> NE) y una contradiccion en el badWind de Poris, por la que badWind va vacio en las 65.
- resultado: verificadas abriendo la fuente 11 · heredadas por vecindad 1 · deduccion auditada 53 · escritas a mano antes 12 · total en la tabla 100
- precisión: El dato es fiable a +-45 grados, no mas. La verificacion con surf-forecast caza errores de 90 grados pero no distingue N de NW.
- lo único que quedó abierto de esta área:
  - playa-grande-abades: corregida de SE a NE, pero puede ser una playa distinta de la de Poris
  - benijo: la fuente da N y NW a la vez
  - piscina-gigantes: el modelo dijo W y luego NW; las dos caen dentro del +-45 de la fuente

**`calidad_del_agua`** · 2026-09-05
- fuente: Censo Nacional de Zonas de Aguas de Bano 2025, Servicio Canario de la Salud. 49 zonas en Tenerife.
- resultado: 46 fichas con aguaCalidad y su ano. El ano va en el dato para que se vea cuando caduca.

**`bandera_azul`** · 2026-08-31
- fuente: Galardones Bandera Azul 2026, Gobierno de Canarias. 11 en Tenerife.
- resultado: 11 fichas con blueFlag:true, cifra exacta comprobada contra la lista.

**`red_titsa`** · 2026-08-21
- fuente: GTFS oficial de TITSA (routes.txt, trips.txt, stop_times.txt) y CSV oficial de Metropolitano de Tenerife para el tranvia.
- resultado: 183 lineas, 6.263 referencias de parada sobre 2.514 marquesinas, trazados regenerados del GTFS. La parada mas lejos de su trazado, a menos de 200 m.

**`idiomas`** · 2026-09-21
- resultado: Diez idiomas. auditar_idioma.js da 0 hallazgos en los diez sobre 1.705 textos de lugar y 544 de interfaz cada uno. 0 etiquetas sin traducir ni declarar. 0 textos que se queden en el idioma de arranque.

**`asistente`** · 2026-09-18
- resultado: 69 respuestas x 10 idiomas = 690, y se llega a las 690 desde el buscador del asistente.

**`mapa_sin_conexion`** · 2026-09-12
- resultado: 76 controles en verde, 99,77 % de pixeles pintados con el estilo de la app, 12 teselas sin red.

**`municipio_de_cada_ficha`** · 2026-09-25
- qué se hizo: Cruce de lo que cada ficha declara con el municipio de las paradas de TITSA de alrededor, sobre los 787.
- **el techo**: El poligono municipal del Cabildo NO esta en el repositorio y no se puede bajar desde aqui (Overpass, Nominatim, IDECanarias y los portales de datos abiertos dan 000). La prueba que se usa son las rayas municipales admin_level 8 del mapa OSM del propio repositorio, con tools/municipio_raya.py, calibrado: de 849 parejas de paradas vecinas de municipio distinto a menos de 1,5 km, 805 (94,8%) tienen de verdad una raya en medio.
- resultado: 520 declaran municipio, 475 comprobados, 45 sin paradas suficientes, 267 no declaran ninguno. 0 contradicciones y 0 municipios fuera de sitio en firme.
- lo único que quedó abierto de esta área:
  - 5 fichas en el borde municipal: se avisan y no suspenden, porque en un limite las paradas se mezclan y un control que cante en cada borde se acaba ignorando. Son mir-la-corona-guimar, mir-lomo-molino, montana-taco, playa-caleton-sauzal y pr-tf-52-monte-agua.

## 0 · Lo verificado, separado de lo que no

Esto es lo primero porque es lo que faltaba. Antes se comprobaba un sitio y
la comprobación no se guardaba en ninguna parte: se quedaba en los mensajes
y en los commits. El siguiente control volvía a sacarlo en la lista, y
parecía que todo fallaba siempre.

| | fichas |
|---|---|
| **Coordenada verificada**, con su fuente apuntada en `datos/verificado.json` | **132** |
| Coordenada nunca comprobada por nadie | **655** |

**Lo que no está verificado no es que esté mal: es que nadie lo ha mirado
todavía.** Son dos cosas distintas y este informe no las mezcla.

De dónde viene cada una:

| id | fecha | de dónde sale |
|---|---|---|
| `abama` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-piscina-jover` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-duque` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-fanabe` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-las-vistas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-los-cristianos` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-poris` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-teresitas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-torviscas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `acc-playa-troya` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `alcala` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `almaciga` | 2026-09-01 | Cuatro playas vuelven a su sitio, y sus satélites con ellas |
| `ar-la-quebrada` | 2026-09-25 | Parche municipios-bloque1-B (sha256 cf3094e6...). Tenerife ON (Cabildo de Tenerife), ficha oficial del area recreativa: enlace de acceso 28.532069688519, -16.300710533935. Acceso por el Camino de El Batan (TF-143), km 0,4, Cruce El Moquinal. Se mueve 4.068 m desde el punto viejo, que caia en un barrio de La Laguna. |
| `bano-valleseco-bloque` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `benijo` | 2026-09-01 | Cuatro playas vuelven a su sitio, y sus satélites con ellas |
| `bollullo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `charco-abrigos` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `charco-archile` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `charco-chochos` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `charco-diablo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `charco-don-gabino` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `charco-faro-buenavista` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `charco-golete` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `charco-gomero` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `charco-laja` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `charco-laja-bajamar` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `charco-roque` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `charco-verde-guancha` | 2026-09-21 | El Dia + duenno del proyecto: 28°24'00"N 16°39'32"W. Municipio contrastado con las paradas de TITSA (4 de las 6 mas cercanas son de La Guancha, la mas proxima «Santa Catalina») |
| `charco-viento` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `el-duque` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `el-medano` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `el-pris` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `fanabe` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `golf-del-sur` | 2026-09-19 | OpenStreetMap, golf_course «Golf del Sur» |
| `las-vistas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `lidl-santa-cruz` | 2026-09-19 | OpenStreetMap, supermarket «Lidl», el mas cercano al centro |
| `mercadillo-la-victoria` | 2026-09-25 | Parche municipios-bloque1-B, metodo DERIVADO (no hay coordenada publicada). Punto medio entre «Casa de la Castana» (museo, OSM, 28.432695,-16.471387) y «Terrero Municipal de Lucha y Deportes» (OSM, 28.433360,-16.471129), separados 78 m, que es como el Ayuntamiento situa el mercadillo. Los tres pasos del parche se resolvieron con el OSM del propio repositorio (tools/osm_cerca.py) porque Overpass esta cerrado desde aqui: paso 1 exactamente 1 elemento, paso 2 ningun amenity=marketplace a 250 m (y 15 en toda la isla, asi que el extracto no los filtra), paso 3 exactamente 1. Se mueve 2.109 m. DERIVADO, no medido: si aparece la coordenada publicada, se cambia. |
| `mesa-mar` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `nucleo-costa-adeje` | 2026-09-19 | OpenStreetMap, neighbourhood «Costa Adeje» |
| `nucleo-los-gigantes` | 2026-09-19 | OpenStreetMap, neighbourhood «Los Gigantes» |
| `nucleo-playa-san-juan` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `nucleo-san-andres` | 2026-09-19 | OpenStreetMap, locality «San Andres» |
| `piscina-gigantes` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `piscina-guimar` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `piscina-hidalgo-norte` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `piscina-jover-tejina` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `piscinas-alcala-jaquita` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `piscinas-bajamar` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `piscinas-garachico` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `piscinas-muelle` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `piscinas-poris` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-abriguitos` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-agua-dulce` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-americas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-antequera` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-barqueros-buenavista` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-beril` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-bobo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-cabezo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-cabezo-medano` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-caleton-sauzal` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-callao` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-callao-arona` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-camison` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-candelaria` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-castillo-pcruz` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-charcada` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-chimisay` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-confital` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-diego-hernandez` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-enramada` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-fajana-realejos` | 2026-09-21 | Ficha de la playa con UTM 28N X 344.464,66 Y 3.142.340,56 y DMS 28°23'53.6"N 16°35'15.6"W. Coincide al septimo decimal con la que ya traia la ficha |
| `playa-galletas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-grande-abades` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-guincho` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-guios` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-igueste-san-andres` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-jaca` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-jaquita` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-jaquita-medano` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-jardin` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-la-caleta-adeje` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-las-aguas` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-las-bajas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-las-gaviotas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-los-patos` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-martianez` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-muelle-garachico` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-nea` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-pinta` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-puertito` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-puertito-adeje` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-puertito-guimar` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-puerto-santiago` | 2026-09-01 | Cuatro playas vuelven a su sitio, y sus satélites con ellas |
| `playa-punta-fraile` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-punta-larga` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-radazul` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-rambla` | 2026-09-01 | Cuatro playas vuelven a su sitio, y sus satélites con ellas |
| `playa-rincon` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-rojas` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-roques-rambla` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-san-telmo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Baño 2025 (nombre oficial y calidad del agua) · Google Places (coordenada)  [playastenerife.json · altas] |
| `playa-socorro` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `playa-socorro-guimar` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-tabaiba` | 2026-09-06 | Google Places (nombre, coordenada y contenido de las reseñas)  [playastenerife.json · altas] |
| `playa-torviscas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `puerto-guimar` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `punta-hidalgo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `roque-bodegas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `ruta-anaga-taganana` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `san-juan` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `san-marcos` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `sendero-roque-bodegas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `surf-almaciga` | 2026-09-01 | Cuatro playas vuelven a su sitio, y sus satélites con ellas |
| `surf-benijo` | 2026-09-01 | Cuatro playas vuelven a su sitio, y sus satélites con ellas |
| `surf-bollullo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `surf-callao-salvaje` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `surf-playa-socorro` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `tejita` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `teresitas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-benijo` | 2026-09-01 | Cuatro playas vuelven a su sitio, y sus satélites con ellas |
| `wc-duque` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-garachico` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-gigantes` | 2026-09-19 | OpenStreetMap, neighbourhood «Los Gigantes» (misma que nucleo-los-gigantes) |
| `wc-las-vistas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-medano` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-punta-hidalgo` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-san-juan` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-teresitas` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `wc-troya` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |
| `windsurf-el-poris` | 2026-09-20 | Turismo de Tenerife, ficha Playa Grande (Arico), DMS y UTM 28N; empujada 8 m a tierra sobre el segmento de costa |
| `windsurf-la-tejita` | 2026-09-06 | Censo Nacional de Zonas de Aguas de Bano 2025 · Bandera Azul 2026 · Google Places (listas de playas y charcos, «ninguna coordenada estimada»)  [listasplayascharcos.md] |

**Estas no se vuelven a pedir.** `auditar_redondeo.py` las deja en paz aunque
estén escritas con pocos decimales: la precisión de una fuente es la que es.

Y no hace falta acordarse de apuntarlas: `tools/fijar_coordenada.py` escribe
el apunte solo cuando aplica una coordenada, con la fuente que se le pase
detrás de la `#`. Si no se le da fuente, avisa de que no la apunta.

### De dónde salen las 132

No se han inventado: se han sacado de los ficheros de fuente que ya se
habían entregado y aplicado, y **se ha comprobado que la coordenada de hoy
sigue siendo la que traía la fuente**. De 119 así, ninguna había cambiado
después y ninguna había desaparecido.

| fichero de origen | qué traía |
|---|---|
| `playastenerife.json` | 40 altas y 4 correcciones de coordenada, cada una con su campo `fuente`: Censo Nacional de Zonas de Aguas de Baño 2025 del Servicio Canario de la Salud, Bandera Azul 2026 y Google Places |
| `listasplayascharcos.md` | las tablas de playas y charcos con su coordenada, bajo la línea «**ninguna coordenada estimada**» |

**Una precisión, para no decir más de lo que es.** `listasplayascharcos.md`
lista las playas por nombre y coordenada, no por id, así que el
emparejamiento se hizo por **coordenada exacta**. Una ficha que comparte
punto con una playa verificada —su webcam, su ficha de accesibilidad, el
spot de surf que está en esa misma arena— hereda la verificación **del
punto**. Lo verificado es que ese punto es el de esa playa; que la ficha
deba estar ahí es otra cosa y no se afirma.
| `parche2coordenadas.md` | las 4 de Anaga y Rambla de Castro que estaban corridas, con la comprobación cruzada contra `mir-rambla-castro` |
| el historial de git | las 14 corregidas a propósito, con el commit que dice por qué |

### Una cosa que conviene saber: las orientaciones de playa

De las **100** filas de `PLAYAS_ORIENTACION`, **88 son deducidas**, no
verificadas. Lo dice el propio fichero que las trajo,
`orientaciones65.json`: *«las 65 las produjo un modelo de lenguaje
(Gemini). 11 tienen respaldo publicado que verifiqué abriendo la fuente, 1
se hereda por vecindad de una verificada, y 53 son deducción auditada por
coherencia con las vecinas»*. Por eso van todas con `deducida:true`, que es
lo honesto.

`ori` alimenta el cálculo de si una playa está resguardada del viento de
hoy. **No es un dato decorativo.** Las 12 escritas a mano sí están
comprobadas; de las otras 88, once tienen respaldo y el fichero no dice
cuáles, así que desde aquí no se pueden separar.

### Lo que SÍ tiene fuente oficial dentro de la propia ficha

| dato | fichas |
|---|---|
| Calidad del agua del censo de zonas de baño, con su año | **46** |
| Bandera Azul declarada | **11** |
| Socorrista declarado (sí o no, no «se desconoce») | **39** |
| Orientación de playa escrita a mano (las otras 88 son deducidas) | **12** |

## 1 · Con cuánta precisión está escrita cada coordenada

Decimales **significativos** —los ceros de la derecha no cuentan— del eje
menos preciso de cada ficha. Es la cuenta entera de los 787, no un umbral:

| decimales | cuadrícula | fichas |
|---|---|---|
| 1 | ~11 km | **2** |
| 2 | ~1,1 km | **31** |
| 3 | ~110 m | **142** |
| 4 | ~11 m | **559** |
| 5 | ~1 m | **13** |
| 6 | ~10 cm | **14** |
| 7 | ~1 cm | **25** |
| 15 |  | **1** |

**54 fichas tienen los dos ejes con 3 decimales o menos**: eso no es una
coordenada sacada de una fuente, es un marcador puesto a ojo. Que los dos
caigan a la vez por casualidad es una entre un millón.

### Las 20 peores: algún eje con 2 decimales o menos (~1,1 km)

| id | qué es | escrita | municipio |
|---|---|---|---|
| `anaga` | Parque Rural de Anaga | 28.5460, -16.1800 | Santa Cruz de Tenerife |
| `ar-las-hayas` | Área Recreativa Las Hayas | 28.3500, -16.6900 | Icod de los Vinos |
| `bici-bc5-vilaflor` | BC-5 Pinares de Vilaflor — MTB Moderado | 28.1570, -16.6400 | Vilaflor |
| `buceo-los-gigantes` | 🤿 Buceo Los Gigantes — Diving Centre | 28.2440, -16.8400 | Santiago del Teide |
| `caldeira-canadas` | Cañadas del Teide — Caldera | 28.2200, -16.6200 | La Orotava |
| `corona-forestal` | Corona Forestal | 28.2600, -16.5800 | La Orotava |
| `gas-tf1-candelaria` | Cepsa Candelaria (TF-1) | 28.3530, -16.3800 | Candelaria |
| `kayak-los-gigantes` | 🛶 Kayak & SUP Los Gigantes — Acantilados | 28.2440, -16.8400 | Santiago del Teide |
| `lajiales-fasnia` | Los Lajiales de Fasnia | 28.2100, -16.4350 | Fasnia |
| `lidl-puerto-cruz` | Lidl Puerto de la Cruz | 28.4200, -16.5450 | Puerto de la Cruz |
| `mercadona-el-medano` | Mercadona El Médano | 28.0500, -16.5380 | Granadilla de Abona |
| `minimarket-24h-las-americas` | Seven Ways Supermarket 24h (Las Américas) | 28.066, -16.73 | Adeje |
| `mir-rambleta-teide` | Mirador La Rambleta (Teide · 3.555 m) | 28.27, -16.639 | La Orotava |
| `mirador-pino-galdo` | Mirador del Pino Galdo | 28.5600, -16.2650 | Santa Cruz de Tenerife |
| `nucleo-torviscas` | Torviscas | 28.0840, -16.7300 | Adeje |
| `pesca-los-gigantes` | 🎣 Pesca Deportiva Los Gigantes | 28.2440, -16.8400 | Santiago del Teide |
| `pp-el-tanque` | 🪂 Parapente — Despegue El Tanque (Noroeste) | 28.3450, -16.8100 | El Tanque |
| `pp-guimar` | 🪂 Parapente — Ladera de Güímar (Este) | 28.3100, -16.4050 | Güímar |
| `sala-westerdahl` | Sala Eduardo Westerdahl (Puerto de la Cruz) | 28.418, -16.55 | Puerto de la Cruz |
| `sendero-la-orotava` | Sendero Teide — La Orotava (TF-7) | 28.3650, -16.5900 | Los Realejos |

### Las otras 34, con 3 decimales (~110 m)

| id | qué es | escrita | municipio |
|---|---|---|---|
| `acc-paseo-cristianos` | Paseo Los Cristianos–Las Américas ♿ | 28.0560, -16.7260 | Arona |
| `acc-paseo-garachico` | Paseo Costero Garachico ♿ | 28.3720, -16.7640 | Garachico |
| `bici-agua-vilaflor` | Vilaflor — Agua y Descanso Ciclistas (1.400 m) | 28.1570, -16.6340 | Vilaflor |
| `bici-bc2-inicio` | BC-2 Ruta MTB Principiantes — Corona Forestal | 28.3720, -16.4890 | La Orotava |
| `buceo-puerto-cruz` | 🤿 Buceo Puerto de la Cruz — Centro Atlantik | 28.4150, -16.5480 | Puerto de la Cruz |
| `cueva-viento` | Cueva del Viento | 28.352, -16.704 | Icod de los Vinos |
| `deporte-costa-adeje-paseo` | Paseo Marítimo Costa Adeje — Fitness | 28.0850, -16.7350 | Adeje |
| `deporte-orotava-parque` | La Orotava — Parque Deportivo Municipal | 28.394, -16.531 | La Orotava |
| `deporte-skatepark-laguna-copernico` | Skatepark La Laguna (C/ Copérnico) | 28.4930, -16.3150 | San Cristóbal de La Laguna |
| `deporte-valle-san-lorenzo-kenguru` | Valle San Lorenzo — Calistenia Kenguru Pro | 28.091, -16.649 | Arona |
| `escal-canada-capricho` | 🧗 Escalada Cañada del Capricho (Teide) | 28.2440, -16.5880 | La Orotava |
| `escal-guaria` | 🧗 Escalada Guaría (Guía de Isora) | 28.1450, -16.7170 | Adeje |
| `gas-tf1-adeje` | Repsol Costa Adeje (TF-1 km 15) | 28.0830, -16.7320 | Adeje |
| `gas-tf5-icod` | Repsol Icod de los Vinos (TF-5) | 28.3680, -16.7050 | Icod de los Vinos |
| `golf-amarilla` | Amarilla Golf (San Miguel de Abona) | 28.0310, -16.5960 | San Miguel de Abona |
| `gr131-tramo1-esperanza-caldera` | GR-131 Anaga-Chasna · Tramo 1: La Esperanza — Área Rec. La Caldera | 28.4530, -16.4080 | El Sauzal |
| `hiperdino-arona-montaneta` | HiperDino Arona (La Montañeta) | 28.0980, -16.6820 | Arona |
| `hiperdino-los-realejos` | HiperDino Los Realejos | 28.3920, -16.5820 | Los Realejos |
| `kayak-punta-teno` | 🛶 Kayak Punta de Teno — Costa Virgen (Noroeste) | 28.342, -16.923 | Buenavista del Norte |
| `lidl-granadilla` | Lidl Granadilla de Abona | 28.1340, -16.5580 | Granadilla de Abona |
| `lidl-la-laguna` | Lidl La Laguna (La Cuesta-Taco) | 28.4720, -16.3080 | San Cristóbal de La Laguna |
| `mercadillo-santa-cruz` | Rastro de Santa Cruz | 28.4580, -16.2490 | Santa Cruz de Tenerife |
| `mercadona-granadilla` | Mercadona Granadilla de Abona | 28.1270, -16.5760 | Granadilla de Abona |
| `mir-cardon-guia-isora` | Mirador del Cardón (Guía de Isora) | 28.1870, -16.7520 | Guía de Isora |
| `mirador-pico-ingles` | Mirador Pico del Inglés | 28.533, -16.264 | Santa Cruz de Tenerife |
| `montana-amarilla` | Montaña Amarilla | 28.011, -16.636 | Arona |
| `parkinson-tf-granadilla` | Párkinson Tenerife — Unidad Granadilla 🤝 | 28.122, -16.579 | Granadilla de Abona |
| `parque-canino-laguna-via-ronda` | Parque Canino La Laguna (Vía Ronda) 🐾 | 28.4850, -16.3180 | San Cristóbal de La Laguna |
| `pp-izana` | 🪂 Parapente — Despegue Izaña (2.200 m) | 28.3090, -16.4990 | — |
| `prtf-6-chamorga-roque-bermejo` | PR-TF 6 · Chamorga — Roque Bermejo — Draguillo (circular) | 28.5740, -16.1370 | Santa Cruz de Tenerife |
| `puerto-granadilla-comercial` | Puerto de Granadilla (Comercial) | 28.073, -16.499 | Granadilla de Abona |
| `riscos-chio` | Paisaje Volcánico de Chío | 28.2060, -16.7450 | Guía de Isora |
| `tea-tenerife` | TEA — Tenerife Espacio de las Artes | 28.464, -16.251 | Santa Cruz de Tenerife |
| `turismo-cv-pedregales` | Centro de Visitantes Los Pedregales (Teno) | 28.342, -16.851 | Buenavista del Norte |

## 2 · Fichas que comparten coordenada exacta

**65 grupos, 144 fichas.** La mayoría es a propósito: una playa y su
webcam, una playa y su ficha de accesibilidad, un área recreativa y su
zona de acampada, un puerto y los tres negocios que salen de él.

### 42 grupos que se explican solos

Son pares o tríos donde las acompañantes llevan prefijo conocido (`wc-`,
`acc-`, `camping-`, `surf-`, `deporte-`, `bici-`, `kayak-`, `buceo-`,
`pesca-`). No son un error.

- `teide` = `wc-teide-hoy`
- `teresitas` = `acc-playa-teresitas` = `wc-teresitas`
- `el-duque` = `acc-playa-duque` = `wc-duque`
- `benijo` = `surf-benijo` = `wc-benijo`
- `el-medano` = `wc-medano`
- `bollullo` = `surf-bollullo`
- `las-vistas` = `acc-playa-las-vistas` = `wc-las-vistas`
- `playa-socorro` = `surf-playa-socorro`
- `tejita` = `windsurf-la-tejita`
- `fanabe` = `acc-playa-fanabe`
- `almaciga` = `surf-almaciga`
- `punta-hidalgo` = `wc-punta-hidalgo`
- `sendero-chinyero` = `bici-chinyero-ruta`
- `siam-park` = `acc-siam-park`
- `nucleo-los-cristianos` = `wc-los-cristianos`
- `mirador-teide` = `wc-teide-parque`
- `piscinas-garachico` = `wc-garachico`
- `piscina-jover-tejina` = `acc-piscina-jover`
- `lago-martianez` = `deporte-puerto-cruz-piscina` = `wc-martianez`
- `loro-parque` = `acc-loro-parque`
- `playa-callao` = `surf-callao-salvaje`
- `playa-torviscas` = `acc-playa-torviscas`
- `puertito-los-abrigos` = `pesca-los-abrigos`
- `kayak-la-caleta` = `nucleo-la-caleta`
- `bici-agua-la-esperanza` = `ciudad-rosario`
- `bici-ruta-norte-garachico` = `ciudad-garachico`
- `bici-ruta-norte-buenavista` = `ciudad-buenavista`
- `bici-circular-santa-cruz` = `ciudad-santa-cruz`
- `bici-mtb-arico-volcan` = `ciudad-arico`
- `bici-puerto-bailadero` = `mir-bailadero`
- `ar-la-caldera` = `camping-la-caldera`
- `ar-ramon-caminero` = `camping-ramon-caminero`
- `ar-las-calderetas` = `camping-las-calderetas`
- `ar-la-tahona` = `camping-la-tahona`
- `ar-arenas-negras` = `camping-arenas-negras`
- `ar-san-jose-llanos` = `camping-san-jose-llanos`
- `ar-el-lagar` = `camping-el-lagar`
- `ar-las-lajas` = `camping-las-lajas`
- `ar-los-pedregales` = `camping-los-pedregales`
- `ar-el-contador` = `camping-el-contador`
- `ciudad-orotava` = `wc-orotava`
- `nucleo-los-gigantes` = `wc-gigantes`

### 23 grupos que conviene mirar

Aquí dos fichas distintas comparten punto sin que el prefijo lo explique.
Puede ser correcto —dos cosas en el mismo sitio— o una coordenada copiada.

- `bosque-esperanza` = `ar-las-raices` = `camping-las-raices`  ·  `28.4198,-16.3784`
- `mirador-la-ruleta` = `mirador-ruleta-canadas`  ·  `28.2231,-16.6313`
- `san-juan` = `nucleo-playa-san-juan` = `wc-san-juan`  ·  `28.1816,-16.8171`
- `cumbre-dorsal` = `mir-la-jardina`  ·  `28.5241,-16.2881`
- `sendero-sentidos` = `sendero-bosque-enigmas` = `bici-anaga-cruz-carmen` = `turismo-cv-cruz-carmen`  ·  `28.53115,-16.27984`
- `sendero-afur-taganana` = `prtf-9-afur-carboneras`  ·  `28.5554,-16.2481`
- `sendero-roque-bodegas` = `roque-bodegas`  ·  `28.569,-16.2051`
- `gr131-tramo2-portillo-guajara` = `acc-teide-portillo` = `turismo-cv-portillo`  ·  `28.3045,-16.5666`
- `mercado-lagunero` = `mercadillo-la-laguna`  ·  `28.4929,-16.3135`
- `parque-garcia-sanabria` = `deporte-garcia-sanabria` = `parque-garcia-sanabria-pet`  ·  `28.472,-16.2535`
- `parque-la-granja` = `deporte-parque-granja` = `parque-la-granja-sct`  ·  `28.4631,-16.2653`
- `park-montillo` = `parque-el-montillo`  ·  `28.4454,-16.4542`
- `mujer-san-miguel` = `ciudad-san-miguel`  ·  `28.0968,-16.616`
- `playa-puertito` = `playa-cabezo`  ·  `28.2906,-16.3779`
- `puerto-guimar` = `playa-puertito-guimar`  ·  `28.2951,-16.3758`
- `puerto-mesa-del-mar` = `nucleo-mesa-mar`  ·  `28.5025,-16.4234`
- `buceo-los-gigantes` = `kayak-los-gigantes` = `pesca-los-gigantes`  ·  `28.244,-16.84`
- `buceo-los-cristianos` = `kayak-los-cristianos` = `pesca-deportiva-los-cristianos`  ·  `28.049,-16.7195`
- `buceo-puerto-colon` = `pesca-deportiva-puerto-colon`  ·  `28.0795,-16.738`
- `deporte-medano-playa` = `bici-ruta-medano-teide`  ·  `28.0475,-16.539`
- `deporte-sc-plaza-espana` = `wc-plaza-espana`  ·  `28.4674,-16.2502`
- `faro-punta-hidalgo` = `mir-punta-hidalgo`  ·  `28.5763,-16.3287`
- `acc-playa-troya` = `wc-troya`  ·  `28.0682,-16.7329`

## 3 · Pares a menos de 25 m que no comparten coordenada

**14 pares.** A esa distancia los dos pines se solapan en el mapa.

- 11 m · `puertito-los-abrigos` y `zona-mariscos-los-abrigos`
- 11 m · `pesca-los-abrigos` y `zona-mariscos-los-abrigos`
- 11 m · `turismo-sct` y `pk-plaza-espana`
- 11 m · `ciudad-candelaria` y `pk-plaza-patrona-candelaria`
- 15 m · `mirador-pico-ingles` y `bici-puerto-pico-ingles`
- 15 m · `kayak-punta-teno` y `faro-teno`
- 20 m · `deporte-arona-multideporte` y `super-hiperdino-arona-pueblo`
- 22 m · `sendero-sentidos` y `acc-sendero-sentidos`
- 22 m · `sendero-bosque-enigmas` y `acc-sendero-sentidos`
- 22 m · `bici-anaga-cruz-carmen` y `acc-sendero-sentidos`
- 22 m · `acc-sendero-sentidos` y `turismo-cv-cruz-carmen`
- 22 m · `pk-plaza-europa-pc` y `playa-san-telmo`
- 23 m · `cs-arona` y `hiperdino-arona-montaneta`
- 24 m · `parkinson-tf-silos` y `mercadillo-los-silos`

## 4 · El municipio que dice la ficha, contra donde cae el punto

Las 2.514 paradas de TITSA del repositorio traen municipio. Para cada ficha
que declara uno —en un tramo del `cat` o en el paréntesis del nombre— se
miran las paradas de alrededor. Si el municipio declarado no sale en
**ninguna**, el punto no está donde el texto dice.

Salida de `node tools/auditar_municipio.js`:

```
=== el municipio que dice la ficha, contra donde cae el punto ===
  lugares....................................... 787
    que nombran un municipio.................... 520
    de esos, comprobados contra las paradas..... 475
    y con menos de 3 paradas a 1,5 km: no se puede 45
  no declaran municipio......................... 267

  LA FICHA SE CONTRADICE A SI MISMA............. 0

  EL MUNICIPIO NO CUADRA, y es firme............ 0

  en el borde: se avisa, no suspende............ 5
      mir-la-corona-guimar          dice «Güímar»  ·  alrededor: Arafo x3
                                      28.3312, -16.4321  ·  parada mas cerca: Madrid (1282 m)
      mir-lomo-molino               dice «Garachico»  ·  alrededor: El Tanque x8
                                      28.3595, -16.7858  ·  parada mas cerca: Iglesia Cruz Grande (522 m)
      montana-taco                  dice «San Cristóbal de La Laguna»  ·  alrededor: Los Silos x5, Buenavista del Norte x3
                                      28.374, -16.8337  ·  parada mas cerca: Las Canteras (723 m)
      playa-caleton-sauzal          dice «El Sauzal»  ·  alrededor: La Matanza de Acentejo x7
                                      28.4583, -16.464  ·  parada mas cerca: La Montaña (1111 m)
      pr-tf-52-monte-agua           dice «Buenavista del Norte»  ·  alrededor: El Tanque x5, Santiago del Teide x2, Los Silos x1
                                      28.3192, -16.809  ·  parada mas cerca: Puerto de Erjos (435 m)

ninguna ficha nombra un municipio que no le toque

```

**Ojo con estas:** son indicios fuertes, no sentencias. Un mirador en un
puerto de montaña o un sendero que cruza dos términos caen en el borde por
definición. Lo que sí es firme:

- `parque-tabaiba-baja` tiene la parada «Tabaiba» a **11 m** y dice Santa
  Cruz; las ocho de alrededor son de El Rosario.
- `kayak-radazul` y `buceo-tabaiba`, lo mismo: Radazul y Tabaiba son de El
  Rosario y las dos fichas dicen Santa Cruz.
- `casa-capitanes-generales` **se contradice sola**: el nombre dice La
  Laguna y el `cat` dice Santa Cruz. Está en la Plaza del Adelantado, a
  116 m de la parada de ese nombre, en La Laguna.
- `mercadillo-la-victoria` está a **15 m de `ciudad-matanza`** (ver el
  apartado 3): lo que está mal no es el texto, es la coordenada.

## 5 · Lo que NO se puede comprobar desde aquí, y por qué

Esto es la parte que faltaba en las revisiones anteriores y la que hacía
que cada semana saliera una lista nueva.

| no se puede | por qué |
|---|---|
| **Que una coordenada sea la correcta** | sólo se comprueba que caiga en tierra, dentro de Tenerife y en el municipio que dice. Un punto puede cumplir las tres cosas y estar a 300 m del sitio |
| **Que el sitio exista** | pasó con `charco-infierno-arafo` y con `montana-colorada`, que se dieron de baja. No hay forma de saberlo sin una fuente de fuera |
| **Horarios, precios y teléfonos** | cambian y no hay contra qué contrastarlos |
| **Lo que dice cada descripción** | que un pueblo sea «famoso por sus aguacates» no se puede verificar con lo que hay dentro del repositorio |
| **El municipio de 45 fichas** | están a más de 1,5 km de cualquier parada, o tienen menos de tres alrededor: el Teide, Teno, Anaga profundo |
| **El municipio de 267 fichas más** | no declaran ninguno en el `cat` ni en el nombre, así que no hay nada que contrastar |

**Las fuentes de fuera están bloqueadas** en este entorno: Wikipedia,
tenerife.es, webtenerife.com, eldia.es y los dos endpoints de Overpass dan
`000` o `403`. Todo lo de arriba sale de cruzar datos que ya estaban dentro
del repositorio.

## 6 · Lo que sí queda comprobado sobre los 787

| comprobación | resultado |
|---|---|
| Caen dentro de la caja de Tenerife | **787 de 787** |
| Caen en tierra (capa `earth` de OSM) | **781**; 6 en el agua, que son las del parche del mar |
| Ids únicos y con el formato `[a-z0-9-]` | **787** |
| Tienen `desc` y `cat` en los diez idiomas | **787** |
| Referencias huérfanas desde el planificador | **0** de 162 |
| Zonas de baño sin orientación | **0** de 112 |
| `lifeguard` con un valor que no sea true/false/null | **0** |
| Colores fuera de `#rrggbb` | **0** |
| Avisos `warn` cuyo tipo no existe | **0** |
