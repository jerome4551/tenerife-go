# Bloque 5 · Las 29 coordenadas puestas a ojo

Es lo único que queda en el inventario después de cerrar el municipio. Y **no es
lo que yo decía**.

Las llamaba «imprecisas», como si fueran el punto bueno redondeado a una
cuadrícula de 110 m. Al buscar cada sitio por su nombre en el paquete de OSM, la
mayoría no son eso: **están en otro lado**, a kilómetros.

| grupo | qué pasa | cuántas |
|---|---|---|
| A | el sitio está en OSM **encima del pin**: sólo falta precisión | **2** |
| B | el sitio está en OSM **lejos**: el pin está mal | **3** |
| C | **marcas**: en el pin no hay nada de esa marca | **7** |
| D | el paquete **no cubre la marca**: no se puede decir nada | **2** |
| E | **tres fichas, un solo pin** | **3** |
| F | no hay con qué: rótulo de zona, o OSM no lo tiene | **12** |

**Nada de esto está aplicado.** OSM no es fuente oficial (LEEME §2.1): esto dice
**dónde mirar**, no qué escribir.

---

## A · Sólo falta precisión (2)

El elemento de OSM está encima del pin. Son las dos únicas donde «redondeada» era
la palabra correcta.

| ficha | pin | lo que hay en OSM |
|---|---|---|
| `sala-westerdahl` | `28.418, -16.55` | «Museo de Arte Contemporáneo Eduardo Westerdahl» a **5 m** |
| `mir-rambleta-teide` | `28.27, -16.639` | «La Rambleta» a **20 m** y «El cráter de la Rambleta» a 19 m |

---

## B · El sitio está en OSM, pero lejos (3)

### `ar-las-hayas` — a **2,1 km**
- OSM tiene **«Área Recreativa Las Hayas»**, nombre exacto, en Icod de los Vinos,
  a `2.129 m` del pin. Y al lado la «Zona de Acampada de Las Hayas».
- En el pin **no hay nada en 300 m**.
- Es el mismo caso que Las Lajas: un área recreativa del Cabildo con ficha
  oficial. **Tenerife ON publica su coordenada**, igual que publicó las otras dos.

### `deporte-skatepark-laguna-copernico` — a **447 m**
- OSM tiene «SkatePark del Parque de La Vega» a 447 m, y otros dos skateparks en
  La Laguna a 3,2 y 4,7 km.
- La ficha dice **C/ Copérnico**. Hay que comprobar si el del Parque de La Vega es
  ése o es otro distinto: en el pin actual hay una tienda de precocinados.

### `parque-canino-laguna-via-ronda` — a **1,3 km**
- OSM tiene «Parque Canino para Perros menores de 10 kg» a `1.289 m`.
- En el pin hay una librería y el Centro de Salud de La Laguna.
- La ficha dice **Vía Ronda**; hay que ver si es ese mismo parque.

---

## C · Las marcas: en el pin no hay nada de esa marca (7)

Aquí el argumento no es «OSM dice que está allí», sino algo más fuerte: **en el
pin no hay ninguna gasolinera ni ningún supermercado de esa marca**, y el paquete
sí cubre bien esas marcas.

| ficha | qué hay **en el pin** | la marca más cercana | en el municipio que dice |
|---|---|---|---|
| `gas-tf1-adeje` | un restaurante a 10 m, tres bares | Repsol a **4,8 km** | 2 Repsol en Adeje |
| `gas-tf5-icod` | «Deportivo» a 199 m, un club de pádel a 220 m | Repsol a **6,8 km** | **0 Repsol en Icod**, pero 1 DISA a 694 m |
| `lidl-granadilla` | nada en 300 m | Lidl a **6,8 km** | 2 Lidl en Granadilla |
| `lidl-la-laguna` | el Archivo Histórico Provincial a 51 m | Lidl a **1,7 km** | 3 Lidl en La Laguna |
| `mercadona-el-medano` | nada con nombre; El Cabezo a 247 m | Mercadona a **2,9 km** | 3 Mercadona en Granadilla |
| `hiperdino-arona-montaneta` | el **Centro de Salud de Arona** a 18 m | HiperDino a **4,4 km** | — |
| `hiperdino-los-realejos` | «Los Barros» a 172 m y una gasolinera DISA a 179 m | HiperDino a **3,1 km**, en Puerto de la Cruz | **0 HiperDino en Los Realejos** (de 46 en la isla) |

**Dos merecen mirada aparte:**

- **`gas-tf5-icod`** dice «Repsol Icod de los Vinos». En Icod **no hay ningún
  Repsol** en el paquete, pero sí un **DISA a 694 m del pin**. Puede que lo que
  esté mal no sea el pin sino **la marca**.
- **`hiperdino-los-realejos`**: de los 46 HiperDino de la isla, **ninguno está en
  Los Realejos**. O la ficha se refiere a uno de Puerto de la Cruz, o hay que
  mirar si existe.

---

## D · El paquete no cubre la marca (2)

Aquí no puedo decir nada, y decirlo es la respuesta.

- **`gas-tf1-candelaria`** «Cepsa Candelaria (TF-1)». En todo el paquete hay
  **una sola Cepsa**, y está a 47 km, en Guía de Isora. En Tenerife hay decenas.
  El extracto no las trae: su silencio no significa nada.
- **`minimarket-24h-las-americas`** «Seven Ways Supermarket 24h». Esa marca **no
  aparece** en el paquete.

---

## E · Tres fichas con el mismo pin (3)

`buceo-los-gigantes`, `kayak-los-gigantes` y `pesca-los-gigantes` comparten
exactamente `28.244, -16.84`.

- El pin **está en el pueblo correcto**: «Los Gigantes» a 104 m y el «Club de
  buceo marina los gigantes» a 340 m.
- Pero son **tres negocios distintos en un punto redondo**. Como Las Lajas antes
  de separarlas.
- Los tres salen del puerto deportivo; la marina está en OSM y se puede usar de
  referencia, pero cada uno tendrá su local.

---

## F · No hay con qué (12)

`parkinson-tf-granadilla` · `buceo-puerto-cruz` · `bici-agua-vilaflor` ·
`bici-bc2-inicio` · `deporte-valle-san-lorenzo-kenguru` · `mercadillo-santa-cruz` ·
`mir-cardon-guia-isora` · `mirador-pino-galdo` · `pp-el-tanque` · `pp-guimar` ·
`pp-izana` · `puerto-granadilla-comercial`

Son de tres clases:

- **Rótulos de verdad**: `bici-bc2-inicio` es el arranque de una ruta MTB,
  `puerto-granadilla-comercial` es un puerto industrial cerrado al público,
  `mercadillo-santa-cruz` es un rastro callejero de los domingos. Puede que lo
  suyo sea **declararlos como zona**, como hicimos con los 15 que ya lo están, y
  dejar de contarlos aquí.
- **Despegues de parapente** (`pp-el-tanque`, `pp-guimar`, `pp-izana`): OSM no
  tiene despegues. El de Izaña tiene «Izaña» a 364 m, así que el pin es
  razonable; los otros dos no tienen nada cerca.
- **Los que OSM sencillamente no trae**: la sede de Párkinson Tenerife, el centro
  de buceo Atlantik (el pin cae en un Telepizza), el punto de agua de Vilaflor, la
  calistenia de Valle San Lorenzo, el Mirador del Cardón y el del Pino Galdo.
  Para éstos hace falta la dirección o la web del sitio.

---

## Lo que propongo

1. **Empezar por el grupo C, las 7 marcas.** Son las más fáciles de cerrar
   —tienen dirección publicada— y las que más molestan: mandar a alguien a un
   Lidl que está a 7 km es peor que no tener la ficha.
2. **`ar-las-hayas` la cierra el Cabildo**, igual que Las Lajas: Tenerife ON
   publica la coordenada del área recreativa.
3. **Las tres de Los Gigantes**, decidir si cada una lleva su punto.
4. **El grupo F**, decidir cuáles pasan a rótulo declarado y cuáles hace falta
   buscar de verdad.
5. Y las dos del grupo D **quedan escritas como no comprobables desde aquí**,
   que es el resultado honesto.

---

*Todo se regenera con `python3 tools/candidatos.py --a-ojo`, que saca la lista de
`auditar_redondeo.py` y busca cada ficha en `datos/osm-geofabrik/`. Ninguna cifra
está escrita a mano. **Que algo no salga ahí no prueba que no exista**: el paquete
tiene cero elementos de escalada en toda la isla y Guaría tiene 130 vías.*
