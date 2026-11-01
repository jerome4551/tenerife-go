# Bloque 3 · Las 53 coordenadas puestas a ojo

Una coordenada con **3 decimales** en los dos ejes es una cuadrícula de unos
**110 m**; con 2, de **1,1 km**. Que los dos ejes caigan redondos a la vez por
casualidad es una entre un millón: son marcadores puestos a mano, no
coordenadas sacadas de una fuente.

**Pero 110 m no significan lo mismo en los 53 sitios**, y ésa es la primera
conclusión de mirarlos uno a uno.

| grupo | qué son | cuántos | estado |
|---|---|---|---|
| 1 | **zonas y recorridos**: un punto es un rótulo | 16 | ✅ declaradas |
| 2 | el OSM del repositorio **tiene el sitio** | 4 | ✅ aplicadas |
| 3a | primera tanda: el elemento es **único y comprobable** | 4 | ✅ aplicadas |
| 3b | puntos concretos **sin fuente aquí** | **29** | Overpass, o la coordenada publicada |

**De 53 a 29.** El control y el informe dicen los dos la misma cifra, que es la
que cuentan, no la que escribí yo.

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

**HECHO.** Declaradas en `datos/verificado.json`, sección
`coordenada_de_zona`, **una a una con su motivo**, como ya se hace con
`whale-watching` o con las etiquetas sin traducir. `auditar_redondeo.py` las
lista aparte con ese motivo en vez de contarlas como pendientes, y el informe
hace la misma cuenta: la exención queda **escrita**, no callada.

`bici-bc2-inicio` se quedó fuera a propósito, porque dice «inicio» y eso sí es
un punto. Si crees que alguna de las 16 también lo es, dímelo y la saco.

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

**HECHAS las cuatro.** Las dos primeras son el edificio exacto; las dos
últimas, el accidente geográfico: el mirador está en el pico y la ficha es de
la montaña.

**Y dos que NO propongo, aunque estén cerca**, porque no son lo mismo:
`deporte-orotava-parque` tiene el «Skatepark La Orotava» a 86 m y
`pp-izana` el «Observatorio Atmosférico de Izaña» a 39 m. Un skatepark no es
el parque deportivo municipal y un observatorio no es el despegue de
parapente. Son vecinos, no el sitio.

---

## 3a · La primera tanda: 4 más, con el elemento único y comprobado

Empecé por lo que se podía cerrar sin inventar: **los casos en que OSM tiene el
sitio y se puede demostrar que es ése y no otro.** La regla que usé:

> El elemento vale si es **el único con ese nombre** en el radio que importa
> **y** cae en el municipio que la ficha declara.

| id | elemento en OSM | se movía | por qué es seguro |
|---|---|---|---|
| `golf-amarilla` | «Amarilla Golf» (golf_course) | **1.917 m** | es el **único** con ese nombre en toda la isla, y cae en **San Miguel de Abona**, que es lo que dice la ficha |
| `mercadona-granadilla` | «Mercadona» (supermarket) | **1.034 m** | el **único Mercadona en 6 km**, y cae en **Granadilla de Abona** |
| `tea-tenerife` | «Tenerife Espacio de las Artes» (arts_centre) | 45 m | el **nombre exacto** de la ficha, único en la isla |
| `deporte-orotava-parque` | «Complejo Deportivo El Mayorazgo» (sports_centre) | **1 m** | el pin ya estaba encima; lo que le faltaban eran los decimales |

Y una corrección a lo que te dije ayer: propuse **no** tocar
`deporte-orotava-parque` porque lo más cercano que había encontrado era el
«Skatepark La Orotava» a 86 m, que no es lo mismo. Buscando por tipo en vez de
por nombre apareció el complejo deportivo **a 1 m**. El que no servía era mi
método de búsqueda, no el dato.

---

## 3b · Las 29 que quedan, y por qué

El extracto **sí tiene las marcas**: 45 elementos «Mercadona», 23 «Lidl», 29
«HiperDino», **424 supermercados** en total. Lo que pasa es que la tienda que
busca cada ficha **no está**:

| id | el más cercano de su marca | a |
|---|---|---|
| `mercadona-el-medano` | «Mercadona» | 2.890 m (está en San Isidro, no en El Médano) |
| `hiperdino-los-realejos` | «HiperDino Express» | 3.141 m |
| `hiperdino-arona-montaneta` | «HiperDino» | 4.426 m |
| `lidl-granadilla` | «Lidl» | 6.764 m |
| `lidl-la-laguna` | dos «Lidl», a 1.703 m y 2.012 m | **los dos en La Laguna**: el municipio no desempata |

**Las gasolineras son el caso claro de filtrado**: el extracto tiene **56
estaciones** en toda la isla, y Tenerife tiene muchas más. Por eso `gas-tf1-adeje`
no encuentra ningún Repsol a menos de 4 km.

Y hay siete que **no aparecen con ningún nombre parecido en toda la isla**:
`sala-westerdahl`, `ar-las-hayas`, `mirador-pino-galdo`, `buceo-puerto-cruz`,
`buceo-los-gigantes`, `deporte-valle-san-lorenzo-kenguru`,
`parkinson-tf-granadilla`. Un centro de buceo o una unidad de una asociación no
son POIs que z14 conserve.

**Overpass resolvería la mayoría de estas 29**: son POIs con nombre y marca,
justo lo que el extracto tira.

### La lista de las 29

`ar-las-hayas` · `bici-agua-vilaflor` · `bici-bc2-inicio` ·
`buceo-los-gigantes` · `buceo-puerto-cruz` ·
`deporte-skatepark-laguna-copernico` · `deporte-valle-san-lorenzo-kenguru` ·
`gas-tf1-adeje` · `gas-tf1-candelaria` · `gas-tf5-icod` ·
`hiperdino-arona-montaneta` · `hiperdino-los-realejos` · `kayak-los-gigantes` ·
`lidl-granadilla` · `lidl-la-laguna` · `mercadillo-santa-cruz` ·
`mercadona-el-medano` · `minimarket-24h-las-americas` ·
`mir-cardon-guia-isora` · `mir-rambleta-teide` · `mirador-pino-galdo` ·
`parkinson-tf-granadilla` · `parque-canino-laguna-via-ronda` ·
`pesca-los-gigantes` · `pp-el-tanque` · `pp-guimar` · `pp-izana` ·
`puerto-granadilla-comercial` · `sala-westerdahl`

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
