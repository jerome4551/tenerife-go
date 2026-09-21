# Revisión de los 787 lugares

**21 de septiembre de 2026.** Generado con `node tools/informe_lugares.js`.
Barre los 787, no una muestra. Lo que no se puede comprobar desde aquí sale
contado y listado, no callado.

## 1 · Con cuánta precisión está escrita cada coordenada

Decimales **significativos** —los ceros de la derecha no cuentan— del eje
menos preciso de cada ficha. Es la cuenta entera de los 787, no un umbral:

| decimales | cuadrícula | fichas |
|---|---|---|
| 1 | ~11 km | **2** |
| 2 | ~1,1 km | **31** |
| 3 | ~110 m | **144** |
| 4 | ~11 m | **559** |
| 5 | ~1 m | **12** |
| 6 | ~10 cm | **13** |
| 7 | ~1 cm | **25** |
| 15 |  | **1** |

Dos cifras, y las dos importan:

- **177 fichas tienen al menos un eje con 3 decimales o menos.** De esas,
  unas 79 saldrían así por puro azar —el cuarto decimal es un cero una vez de
  cada diez—, así que ese número no señala fichas concretas.
- **55 tienen los DOS ejes con 3 decimales o menos.** Que los dos caigan a la
  vez por casualidad es una entre un millón: ahí no hay azar que valga, son
  marcadores puestos a ojo. **Ésta es la lista sobre la que se puede actuar**,
  y va entera abajo.

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

### Las otras 35, con 3 decimales (~110 m)

| id | qué es | escrita | municipio |
|---|---|---|---|
| `acc-paseo-cristianos` | Paseo Los Cristianos–Las Américas ♿ | 28.0560, -16.7260 | Arona |
| `acc-paseo-garachico` | Paseo Costero Garachico ♿ | 28.3720, -16.7640 | Garachico |
| `ar-la-quebrada` | Área Recreativa La Quebrada | 28.5010, -16.3230 | San Cristóbal de La Laguna |
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

**15 pares.** A esa distancia los dos pines se solapan en el mapa.

- 11 m · `puertito-los-abrigos` y `zona-mariscos-los-abrigos`
- 11 m · `pesca-los-abrigos` y `zona-mariscos-los-abrigos`
- 11 m · `turismo-sct` y `pk-plaza-espana`
- 11 m · `ciudad-candelaria` y `pk-plaza-patrona-candelaria`
- 15 m · `mirador-pico-ingles` y `bici-puerto-pico-ingles`
- 15 m · `ciudad-matanza` y `mercadillo-la-victoria`
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
    de esos, comprobados contra las paradas..... 473
    y con menos de 3 paradas a 1,5 km: no se puede 45
  no declaran municipio......................... 267

  LA FICHA SE CONTRADICE A SI MISMA............. 2
      rcg-tenerife                  cat dice «San Cristóbal de La Laguna»  vs  nombre dice «Tacoronte»
                                      alrededor: Tacoronte, San Cristóbal de La Laguna  ·  El Rodeo a 263 m
      casa-capitanes-generales      cat dice «Santa Cruz de Tenerife»  vs  nombre dice «San Cristóbal de La Laguna»
                                      alrededor: San Cristóbal de La Laguna  ·  Plaza del Adelantado a 116 m

  EL MUNICIPIO NO CUADRA, y es firme............ 8
      ar-la-quebrada                dice «Tegueste»  ·  alrededor: San Cristóbal de La Laguna x8
                                      28.501, -16.323  ·  parada mas cerca: Manuel de Falla (89 m)
      buceo-tabaiba                 dice «Santa Cruz de Tenerife»  ·  alrededor: El Rosario x8
                                      28.402, -16.3312  ·  parada mas cerca: Tabaiba (177 m)
      cavis-violencia-sexual-tenerifedice «Santa Cruz de Tenerife»  ·  alrededor: San Cristóbal de La Laguna x8
                                      28.4708, -16.2885  ·  parada mas cerca: Breña Alta (72 m)
      guachinche-cordero            dice «Arona»  ·  alrededor: San Miguel de Abona x8
                                      28.0454, -16.6292  ·  parada mas cerca: Catú (116 m)
      kayak-radazul                 dice «Santa Cruz de Tenerife»  ·  alrededor: El Rosario x8
                                      28.401, -16.3235  ·  parada mas cerca: Colón (56 m)
      mercadillo-la-victoria        dice «La Victoria de Acentejo»  ·  alrededor: La Matanza de Acentejo x8
                                      28.448, -16.4579  ·  parada mas cerca: La Matanza (35 m)
      mir-cruz-hilda                dice «Santiago del Teide»  ·  alrededor: Buenavista del Norte x6
                                      28.3129, -16.8457  ·  parada mas cerca: Cruz de Hilda (67 m)
      parque-tabaiba-baja           dice «Santa Cruz de Tenerife»  ·  alrededor: El Rosario x8
                                      28.4036, -16.3318  ·  parada mas cerca: Tabaiba (11 m)

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

*** 10 ficha(s) con el municipio fuera de sitio, en firme ***

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
