# Bloque 3 · Las 53 coordenadas puestas a ojo

Una coordenada con **3 decimales** en los dos ejes es una cuadrícula de unos
**110 m**; con 2, de **1,1 km**. Que los dos ejes caigan redondos a la vez por
casualidad es una entre un millón: son marcadores puestos a mano, no
coordenadas sacadas de una fuente.

**Pero 110 m no significan lo mismo en los 53 sitios**, y ésa es la primera
conclusión de mirarlos uno a uno.

| grupo | qué son | cuántos | qué hace falta |
|---|---|---|---|
| 1 | **zonas y recorridos**: un punto es un rótulo | **16** | tu visto bueno para declararlas y dejar de contarlas |
| 2 | el OSM del repositorio **tiene el sitio** | **4** | tu visto bueno y las aplico |
| 3 | puntos concretos **sin fuente aquí** | **33** | Overpass, o la coordenada publicada |

---

## 1 · Las 16 que no son un error: un punto es un rótulo

El Parque Rural de Anaga son **14.419 hectáreas**. La Caldera de Las Cañadas
tiene **16 km** de diámetro. Un sendero es un recorrido, no un punto. Pedirles
6 decimales es pedirles algo que no tienen: su coordenada es dónde se pone la
chincheta, y 110 m arriba o abajo no cambian nada.

| id | qué es |
|---|---|
| `anaga` | Parque Rural de Anaga |
| `corona-forestal` | Parque Natural Corona Forestal, el mayor de Canarias |
| `caldeira-canadas` | la caldera entera |
| `riscos-chio` | paisaje volcánico |
| `lajiales-fasnia` | malpaís |
| `sendero-la-orotava` | recorrido |
| `prtf-6-chamorga-roque-bermejo` | sendero circular |
| `gr131-tramo1-esperanza-caldera` | tramo de GR |
| `bici-bc5-vilaflor` | ruta MTB |
| `acc-paseo-cristianos` | paseo marítimo |
| `acc-paseo-garachico` | paseo costero |
| `deporte-costa-adeje-paseo` | paseo marítimo |
| `kayak-punta-teno` | tramo de costa |
| `escal-guaria` | zona de escalada |
| `escal-canada-capricho` | zona de escalada |
| `nucleo-torviscas` | barrio |

**Lo que propongo**: declararlas en `datos/verificado.json` con su motivo, como
ya se hace con las etiquetas sin traducir o con `whale-watching`, y que
`auditar_redondeo.py` las liste aparte en vez de contarlas como pendientes. La
exención queda **escrita**, no callada. Con eso las «53 a ojo» pasan a ser
**37**, y son 37 de verdad.

Si crees que alguna de las 16 sí es un punto —el `bici-bc2-inicio` lo he
dejado fuera justamente por eso, porque dice «inicio»— dímelo y la saco.

---

## 2 · Las 4 que el OSM del repositorio resuelve

De los 37 puntos concretos, **solo 4** tienen en el extracto un elemento que
es **el sitio mismo**, y no el barrio de al lado:

| id | qué hay en OSM | a | coordenada |
|---|---|---|---|
| `cueva-viento` | «Cueva del Viento Centro de Visitantes» | **2 m** | `28.352021, -16.703998` |
| `turismo-cv-pedregales` | «Centro de Visitantes Los Pedregales» | **21 m** | `28.342036, -16.850790` |
| `mirador-pico-ingles` | «Pico del Inglés» (peak) | **59 m** | `28.533461, -16.264299` |
| `montana-amarilla` | «Monumento Natural de Montaña Amarilla» | **71 m** | `28.011007, -16.635275` |

Las dos primeras son el edificio exacto. Las dos últimas son el accidente
geográfico: el mirador está en el pico y la ficha es de la montaña, así que la
coordenada del elemento es mejor que la redonda — pero si prefieres dejarlas,
se dejan.

**Y dos que NO propongo, aunque estén cerca**, porque no son lo mismo:
`deporte-orotava-parque` tiene el «Skatepark La Orotava» a 86 m y
`pp-izana` el «Observatorio Atmosférico de Izaña» a 39 m. Un skatepark no es
el parque deportivo municipal y un observatorio no es el despegue de
parapente. Son vecinos, no el sitio.

---

## 3 · Las 33 que necesitan una fuente, y dónde está

Aquí está la lección de la Farola, y vale para todo este bloque:

> **Que algo no esté en el extracto no quiere decir que no esté en OSM.**

El extracto es a **z14** y se deja casi todos los POIs pequeños. Lo que
encuentra alrededor de estas 33 es el **barrio**, el **hotel de al lado** o la
**plaza**, no el negocio:

| id | lo más cercano con su nombre | a |
|---|---|---|
| `golf-amarilla` | «Amarilla Golf» (golf_course) | 1.917 m |
| `lidl-la-laguna` | «Lidl» | 1.703 m |
| `mercadona-el-medano` | «Mercadona» | 2.903 m |
| `mercadona-granadilla` | «Mercadona» | 1.034 m |
| `hiperdino-los-realejos` | «Skatepark Los Realejos» | 338 m |
| `buceo-los-gigantes`, `kayak-los-gigantes`, `pesca-los-gigantes` | el barrio «Los Gigantes» | 182 m |
| `gas-tf1-candelaria` | el pueblo de Candelaria | 900 m |
| `ar-las-hayas` | **nada** en 4 km | — |

Los cuatro primeros son interesantes: **el elemento existe en el extracto pero
está a 1-3 km del pin**. O el pin está mal, o es otra sucursal. No lo decido
yo.

**Éste es el bloque donde Overpass más rendiría.** Con el volcado, los Lidl,
los HiperDino, las gasolineras y los centros de buceo salen casi todos: son
POIs con nombre y marca, justo lo que el extracto a z14 tira y Overpass tiene.

### La lista completa de las 33

`ar-las-hayas` · `bici-agua-vilaflor` · `bici-bc2-inicio` ·
`buceo-los-gigantes` · `buceo-puerto-cruz` · `deporte-orotava-parque` ·
`deporte-skatepark-laguna-copernico` · `deporte-valle-san-lorenzo-kenguru` ·
`gas-tf1-adeje` · `gas-tf1-candelaria` · `gas-tf5-icod` · `golf-amarilla` ·
`hiperdino-arona-montaneta` · `hiperdino-los-realejos` · `kayak-los-gigantes` ·
`lidl-granadilla` · `lidl-la-laguna` · `mercadillo-santa-cruz` ·
`mercadona-el-medano` · `mercadona-granadilla` · `minimarket-24h-las-americas` ·
`mir-cardon-guia-isora` · `mir-rambleta-teide` · `mirador-pino-galdo` ·
`parkinson-tf-granadilla` · `parque-canino-laguna-via-ronda` ·
`pesca-los-gigantes` · `pp-el-tanque` · `pp-guimar` · `pp-izana` ·
`puerto-granadilla-comercial` · `sala-westerdahl` · `tea-tenerife`

---

## Lo que necesito de ti

1. **¿Declaro las 16 zonas?** Un sí y las 53 pasan a 37.
2. **¿Aplico las 4 del OSM?** Un sí y pasan a 33.
3. **Para las 33**: el volcado de Overpass, o las coordenadas publicadas de las
   que te resulten fáciles. Si me dices por dónde empezar —las 7 de
   supermercado, las 3 de gasolinera— las voy cerrando por tandas.

---

*Las distancias salen de `tools/buscar_en_osm.py` y `tools/osm_cerca.py`, que
leen el mapa del propio repositorio. La cuenta de las redondas sale de
`tools/auditar_redondeo.py`. Ninguna cifra está escrita a mano.*
