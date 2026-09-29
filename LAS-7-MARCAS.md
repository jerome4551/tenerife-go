# Las 7 marcas del bloque 5

> **29 de septiembre: tres resueltas con las capturas de Jerome.**
> `lidl-granadilla` y `lidl-la-laguna` aplicadas; `mercadona-el-medano`
> **de baja**, porque en El Médano no hay ningún Mercadona. Al final del
> documento. **Quedan 4.**

No he podido llegar a ninguna fuente oficial: los buscadores de tiendas de Lidl,
Mercadona, HiperDino, Repsol y Cepsa dan `000` desde aquí, igual que Overpass y
Nominatim. Así que lo he hecho al revés: **he cruzado lo que cada ficha dice de sí
misma con la red de calles del mapa del repositorio.**

Y eso ha dado más de lo que esperaba. Cuatro de las siete llevan **la calle
escrita en su propia descripción**, y ahí es donde se ve quién miente.

> **Corrección a lo que te mandé ayer:** puse `mercadona-el-medano` en el saco de
> «el pin está a 2,9 km». **No es verdad.** Ver la número 2.

---

## 1 · `lidl-granadilla` — la ficha se delata sola

**Está resuelta con los datos de la propia app.**

- Su descripción dice: «Supermercado Lidl en Granadilla de Abona, **Avenida de la
  Democracia**. Cerca del Aeropuerto Sur y de El Médano.»
- Esa avenida está a **6.828 m del pin**.
- El Lidl que OSM tiene en Granadilla está a **70 m de esa misma avenida**.
- Y el pin actual cae en el **casco viejo de Granadilla**: Calle Acaymo, Camino
  Real, Carretera General del Sur. Nada en 300 m.

El texto y el pin dicen dos sitios distintos, y el texto trae la calle.

**Candidato:** `28.073287, -16.549583`
**Lo que necesito:** tu OK. Es el mismo caso que el Mercadona de Tacoronte.

---

## 2 · `mercadona-el-medano` — me equivoqué, el pin está casi bien

- Su descripción dice: «Mercadona en El Médano (**Av. José Miguel Galván Bello**)».
- Esa avenida está a **231 m del pin**. No a 3 km.
- El Mercadona que OSM tiene a 2.839 m **es otro**: está en San Isidro, no en El
  Médano.
- O sea: **OSM sencillamente no trae el Mercadona de El Médano**, y el pin está
  descolocado unos 200 m, no tres kilómetros.

Ayer la metí en el grupo C diciendo que el pin estaba mal por 2,9 km. **Eso era
mío, no del dato.** Comparé con «el Mercadona más cercano» sin mirar si era el
mismo.

**Lo que necesito:** una coordenada del Mercadona de la Av. José Miguel Galván
Bello. Con una captura como la de Tacoronte vale.

---

## 3 · `lidl-la-laguna` — apunta al candidato, pero no lo cierra

- Su descripción dice: «**Ctra. General La Cuesta-Taco km 1,1**».
- Esa carretera está a **1.935 m del pin** y a **1.018 m del candidato**.
- El pin cae en la **zona universitaria**: Calle Osa Mayor, Camino la Hornera,
  Calle Rector Ángel M. Gutiérrez, Calle Andrómeda. Encima tiene el **Archivo
  Histórico Provincial**, a 51 m.
- El candidato está en **Taco**, junto a la Avenida La Libertad.

El candidato está más cerca de la carretera que la ficha nombra, pero a 1 km
tampoco. **Ninguno de los dos está en el km 1,1.**

**Candidato:** `28.457152, -16.303379`
**Lo que necesito:** confirmar cuál de los Lidl de La Laguna es. Hay tres.

---

## 4 · `gas-tf1-adeje` — el pin está junto a la autopista, pero no hay gasolinera

- Ficha: «Repsol Costa Adeje (**TF-1 km 15**)», teléfono **922 71 00 50**, 24 h.
- El pin está a **277 m de la TF-1**, así que la autopista encaja.
- Pero **encima del pin hay un restaurante a 10 m y tres bares**. Ninguna
  gasolinera, de ninguna marca.
- El Repsol más cercano está a **4,8 km**, también junto a la TF-1 (a 370 m).

Aquí lo que decidiría es el **kilómetro 15**, y los mojones no están en el mapa.

**Candidato:** `28.125907, -16.738147`
**Lo que necesito:** o el km, o una llamada al 922 71 00 50, o una mirada.

---

## 5 · `gas-tf5-icod` — puede que lo que esté mal sea la marca

- Ficha: «Repsol Icod de los Vinos (**TF-5 km 55**)», teléfono **922 81 20 35**.
- En **todo Icod de los Vinos no hay ningún Repsol** en el paquete. De los 25 de
  la isla, el más cercano está a **6,8 km**, en San Juan de la Rambla.
- Pero sí hay un **DISA a 694 m del pin**, y es la única gasolinera de Icod que
  aparece.
- El pin está a 474 m de la TF-5.

**Lo que necesito:** saber si esa gasolinera es Repsol o DISA. Si es DISA, lo que
hay que cambiar es el nombre de la ficha, no la coordenada.

---

## 6 · `hiperdino-arona-montaneta` — ni el pin ni el barrio tienen respaldo

- Ficha: «HiperDino Arona (**La Montañeta**)».
- El pin cae **encima del Centro de Salud de Arona**, a 18 m. Al lado, un
  «Supermercado Arona» a 30 m, que no es un HiperDino.
- El HiperDino más cercano está a **4,4 km**, en Adeje.
- Y «La Montañeta» aparece en OSM en Garachico, El Rosario, Candelaria, Arafo y
  El Sauzal. **En Arona, ninguna.**

**Lo que necesito:** si existe ese HiperDino y dónde. Es la que menos agarre
tiene de las siete.

---

## 7 · `hiperdino-los-realejos` — ¿existe?

- De los **46 HiperDino de la isla, ninguno está en Los Realejos**.
- El más cercano está a **3,1 km** y está en **Puerto de la Cruz**.
- En el pin hay «Los Barros» a 172 m y una gasolinera DISA a 179 m.

**Lo que necesito:** decidir si la ficha se refiere a uno de Puerto de la Cruz
—y entonces hay que cambiarle el nombre y el municipio— o si hay que darla de
baja, como el guachinche.

---

## Resumen de lo que te pido

| | ficha | qué hace falta |
|---|---|---|
| 1 | `lidl-granadilla` | sólo tu OK: la propia ficha da la calle |
| 2 | `mercadona-el-medano` | una coordenada de la Av. José Miguel Galván Bello |
| 3 | `lidl-la-laguna` | cuál de los tres Lidl de La Laguna es |
| 4 | `gas-tf1-adeje` | el km 15, o una mirada |
| 5 | `gas-tf5-icod` | ¿Repsol o DISA? |
| 6 | `hiperdino-arona-montaneta` | si existe y dónde |
| 7 | `hiperdino-los-realejos` | si existe, o baja |

Nada aplicado. **OSM no es fuente oficial** y las calles salen del mismo mapa:
esto dice dónde mirar, no qué escribir.

---

*Se regenera con `python3 tools/candidatos.py <id>` y
`python3 tools/osm_cerca.py <lat,lng> <radio> --via`. Ninguna cifra está escrita
a mano.*

---

## Aplicado · 29 de septiembre

Jerome mandó las fichas de la propia empresa (Lidl en Google) y la orden sobre el
Mercadona.

### `lidl-granadilla` — se mueve 6.828 m

```
antes    28.134,    -16.558      el casco viejo: Calle Acaymo, Camino Real
                                 sin ningún supermercado en 1 km
después  28.073287, -16.549583   Av. de la Democracia, San Isidro (38611)
```

**La ficha ya lo decía.** Su descripción nombraba la Avenida de la Democracia
desde el principio; el pin decía otra cosa. La captura lo confirma.

Se añade «San Isidro» al texto en los 10 idiomas: el Lidl está en San Isidro, que
es del municipio de Granadilla de Abona pero no del casco.

### `lidl-la-laguna` — se mueve 1.712 m

```
antes    28.472,    -16.308      la zona universitaria: Calle Osa Mayor,
                                 Camino la Hornera, Archivo Histórico a 51 m
después  28.457152, -16.303379   Calle Ntra. Sra. de la Ternura 1, Taco (38108)
```

La dirección que la ficha llevaba escrita —«Ctra. General La Cuesta-Taco km 1,1»—
**no era la suya**. La de la empresa es calle Nuestra Señora de la Ternura 1, y el
elemento de OSM está a 29 m de esa calle. Corregido el texto en los 10 idiomas.

### `mercadona-el-medano` — de baja

**En El Médano no hay ningún Mercadona.** El que salía al buscar es el de San
Isidro, a 2,9 km.

Y aquí se cierra mi error del día 28: dije que el pin estaba mal por 2,9 km, luego
me corregí diciendo que estaba bien por 231 m. **Las dos veces me equivocaba en lo
mismo**: comparaba con «el Mercadona más cercano» sin preguntarme si existía uno
allí. No existe.

Borrada de `index.html`, de los nueve ficheros de idioma y de `pl-lugares/`. **Son
785.** El contador de `auditar_datos.js` movido a mano con el motivo, y la cifra
del schema.org al día.

---

## Dos altas posibles, que no hago sin que lo digas

- **El supermercado de El Médano.** Dijiste «deja sólo el HiperDino de El Médano»,
  pero **la app no tiene ninguna ficha de HiperDino allí**: el único supermercado
  que había en El Médano era ese Mercadona. OSM tiene un **«SuperDino» a 367 m** de
  donde estaba el pin (`28.046743, -16.537422`), que es del mismo grupo. Si lo
  quieres, es un alta — y hace falta saber si el rótulo dice SuperDino o HiperDino.
- **El segundo Lidl de Granadilla.** Tu captura enseña también un «Lidl, C.
  Tenerife, 39, 38612 Granadilla», el del casco. No está en OSM y la app no lo
  tiene. Sería otro alta.
