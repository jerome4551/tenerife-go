# Bloque 2 · Los lugares con el pin en el agua — CERRADO

De los 787, **6 caían fuera de tierra** contra la capa `earth` del OSM del
repositorio. **No queda ninguna.**

| id | antes | ahora |
|---|---|---|
| `faro-santa-cruz-puerto` | 444 m mar adentro | **en tierra, 4,8 m del borde** (Wikidata) |
| `ermita-san-telmo` | 19 m | **en tierra, 18,0 m** (Wikidata) |
| `pk-poris-abona` | 82 m | **en tierra, 46,8 m** |
| `lidl-puerto-cruz` | 46 m | **en tierra, 232 m** |
| `pk-bajamar-piscinas` | 28 m | **en tierra, 33,5 m** |
| `whale-watching` | 23 m | igual, **exento por id y con el motivo escrito** |
| `puerto-colon-adeje` | 150 m, en mar abierto | **58 m, en la dársena** |

```
lugares medidos contra la capa earth de OSM.: 787
de tierra y FUERA de tierra.................: 0
```

---

## Lo que enseñó este bloque, y queda escrito en la herramienta

**Que algo no esté en el extracto no quiere decir que no esté en OSM.**
`tools/osm_cerca.py` dio **0 faros en toda la isla** y 0 nombres con «faro» o
«farola» — y la Farola del Mar está en OSM, en el way 193798986, enlazada
desde Wikidata. Lo mismo con la ermita. Un 0 del extracto significa «no lo
trae», nunca «no existe», y así hay que decirlo al informar. Está ahora en la
cabecera de la herramienta, para que no se me vuelva a escapar.

Y la segunda, del mismo palo: **los POIs que en OSM son una vía o un polígono
llegan al extracto como un punto de rótulo.** El «Paseo de San Telmo» está a
218 m de su rótulo, y la zona peatonal que es ese mismo paseo, a 31 m. La
distancia al rótulo no es la distancia al sitio.

---

## Las dos de Wikidata

### `faro-santa-cruz-puerto` — Farola del Mar
- **Wikidata Q5966669**: `28.469439, -16.245831`. La misma ficha da el
  elemento de OSM: **way 193798986**.
- Esa coordenada cae **en el agua** contra la capa `earth` a z14, a 7,6 m del
  borde, así que corrió tu regla: empujar hasta 5 m tierra adentro sin moverse
  más de 15.
- **El mejor margen alcanzable dentro de esos 15 m es 4,78 m**, y se alcanza
  justo en el tope. Resultado: `28.469309, -16.245872`, en tierra, **4,8 m de
  margen**, a 15 m de Wikidata y a 4,7 m del pin anterior.
- El muelle es estrecho y el polígono a z14 está generalizado: por eso empujar
  12 m no da 12 m de margen. Se midió en cada paso, no se supuso.
- Apuntado en `verificado.json`: **cuando haya Overpass, leer el way 193798986
  y usar su geometría** en vez del empuje.

### `ermita-san-telmo`
- **Wikidata Q2220075**: `28.417550, -16.545617`. **En tierra, a 18,0 m del
  borde**, así que se usa tal cual, sin empujar. Se mueve **155 m al este**
  del pin viejo — exactamente los 155 m que decías.
- ⚠️ **El control de sensatez: una condición pasa y la otra no se pudo evaluar
  como estaba escrita.**
  - «a 150 m o menos de la Playa de San Telmo» → **90 m** ✅
  - «y del Paseo de San Telmo» → **218 m** ❌ … pero el Paseo **no está en el
    extracto como vía, sino como un punto de rótulo**. Un paseo marítimo
    reducido a un punto no dice a qué distancia pasa su recorrido.
  - Lo que sí hay pegado al punto de Wikidata: una **zona peatonal a 31 m** y
    la **«Avenida Cristóbal Colón» a 98 m**, que son ese mismo paseo.
- **Lo he aplicado** porque tu propio mensaje ya hacía la comprobación de
  sensatez —«está a 155 m al este del pin actual y a 98 m del punto oficial de
  la Playa de San Telmo, cuadra con que la ermita esté junto a esa playa»— y
  mis medidas reproducen las tuyas. **Si prefieres que lo revierta hasta tener
  Overpass, dilo y lo revierto en un minuto.**

---


## La regla de los aparcamientos, escrita y ejecutable

> La vía rodada **con nombre** más cercana al ancla que cumpla **la distancia
> máxima** y **el margen de 3 m** contra la costa.

Las dos condiciones son la regla entera: una vía a 2,9 m del borde no vale
aunque sea la más cercana, porque cualquier retoque del dibujo de la costa la
devuelve al agua. Y con nombre, porque el extracto a z14 **no trae `access` ni
`service`**: de una calle sin nombre no se puede saber si es la entrada a una
casa; una con nombre es pública con seguridad.

No se queda escrita en un documento, que es donde las reglas se olvidan. Es un
modo de `tools/osm_cerca.py`:

```
python3 tools/osm_cerca.py 28.164247,-16.431573 80 --aparcamiento
```

```
   35 m  residential (sin nombre)             borde  40.0 m  sin nombre
   58 m  residential Calle Martín Rodríguez   borde  46.8 m  ELEGIDA
   79 m  service     (sin nombre)             borde  66.4 m  sin nombre
-> Calle Martín Rodríguez, a 58 m del ancla y 46.8 m del borde
```

Las descartadas se imprimen igual, con el motivo, para que se vea lo que la
regla está dejando fuera.

---

## Lo que se cerró, una a una

### `pk-poris-abona` → Calle Martín Rodríguez
`28.164729, -16.431796`. A 58 m del ancla oficial (límite 80) y **46,8 m del
borde**. La ficha oficial de la Playa El Porís da su dirección en esa misma
calle. Se descarta la vía sin nombre que quedaba a 35 m.

### `pk-bajamar-piscinas` → Avenida del Sol
`28.555878, -16.344250`. A 63 m del ancla (límite 150) y **33,5 m del borde**.
La vía de servicio de 30 m no cumple el margen (2,9 m) y la regla entera la
descarta.

### `lidl-puerto-cruz`
`28.398370, -16.541677`, el único Lidl a menos de 2,5 km. A **81 m** de la
«Carretera Gral. Icod-Santa Cruz» — la dirección del establecimiento es
Ctra. General Icod-Santa Cruz s/n, vía de servicio Las Arenas, 38400 **Puerto
de la Cruz**. Está pegado a la raya con La Orotava y hay directorios que lo
sitúan allí; manda la dirección postal, y la comprobación de rayas coincide:
8 paradas sin raya en medio, todas de Puerto de la Cruz.

### `whale-watching` → se queda, exento y con el motivo escrito
Está dentro de la marina, a 52 m de su punto en OSM. La exención **no** se hace
por categoría —está en `familia`, y exentar la categoría entera dejaría de
mirar decenas de fichas que sí tienen que estar en tierra—: va por id, con su
motivo, y el control **lo imprime siempre**. Una exención que no se lee es un
silencio.

### `puerto-colon-adeje` → a la dársena
`28.078257, -16.736845`, el punto de la marina en OSM. Sus 150 m eran mar
abierto; ahora son 58 m, dentro del puerto.

Y el control aprende algo de esto: los exentos **a más de 150 m** se imprimen
siempre, aunque no suspendan. Un puerto está en el agua por definición, pero
no a cualquier distancia, y la exención no puede servir para esconder un pin
puesto en mar abierto.

---

## Lo único que queda mirar

### `puertito-poris-abona` — 241 m
Tienes razón: un embarcadero pequeño no tiene dársena de 241 m. Está exento
por categoría, así que no suspende, pero el control ahora **imprime siempre**
los exentos a más de 150 m para que no se pueda esconder detrás de la
exención. Lo busqué en el extracto y **no hay nada**: 0 muelles, marinas o
puertos en 600 m, y en 350 m lo único con nombre es la «Urbanización Llanos
del Porís» a 347 m. En toda la isla el extracto lleva 17 muelles y 10 puertos
— pero, como acabamos de aprender, eso no prueba que ahí no haya uno en OSM.
**Hace falta Overpass o la coordenada publicada.**

El otro que pasa de 150 m es `puerto-granadilla-comercial` (216 m), y ése sí
es un puerto industrial con dique largo.

---

## Cómo se aplican, cuando lleguen

```
python3 tools/fijar_coordenada.py --fichero nuevas.txt
```

Comprueba cada una antes de escribir —que el id exista, que caiga en Tenerife,
que caiga **en tierra**, y cuántos metros se mueve—, **apunta la fuente en
`datos/verificado.json`** y no escribe nada si alguna falla.

---

*Las distancias de este documento salen de `tools/osm_cerca.py`,
`tools/costa.py`, `tools/auditar_en_el_mar.py` y `tools/municipio_raya.py`.
Ninguna está escrita a mano.*
