# Bloque 2 · Los lugares con el pin en el agua

De los 787, **6 caían fuera de tierra** contra la capa `earth` del OSM que ya
lleva el repositorio. **Quedan 2**, y las dos por falta de una fuente, no por
falta de trabajo.

| id | antes | ahora | estado |
|---|---|---|---|
| `faro-santa-cruz-puerto` | 444 m mar adentro | **en tierra, 6,4 m del borde** | ✅ |
| `pk-poris-abona` | 82 m | **en tierra, 46,8 m** | ✅ |
| `lidl-puerto-cruz` | 46 m | **en tierra, 232 m** | ✅ |
| `pk-bajamar-piscinas` | 28 m | **en tierra, 33,5 m** | ✅ |
| `whale-watching` | 23 m | igual, **exento con su motivo escrito** | ✅ |
| `ermita-san-telmo` | 19 m | igual | ⏳ falta la coordenada |

Y de los que estaban «en el agua a propósito», uno no lo estaba:

| id | antes | ahora | estado |
|---|---|---|---|
| `puerto-colon-adeje` | 150 m, en mar abierto | **58 m, en la dársena** | ✅ |
| `puertito-poris-abona` | 241 m | igual | ⏳ no hay muelle en el extracto |

**Los parches pedían Overpass y el shapefile del Cabildo. Ninguno de los dos
se puede abrir desde aquí, y aun así cinco se han cerrado**: el dato que
pedían ya estaba dentro del repositorio.

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

### `faro-santa-cruz-puerto` → Farola del Mar
- Coordenada publicada de la Farola (`28.46935, -16.24581`; Wikipedia,
  contrastada con una foto geolocalizada en Commons a 21 m), **empujada 5 m
  tierra adentro**: `28.469307, -16.245824`. Queda a **6,4 m del borde** y
  cumple el margen de 3 m del propio parche. Se mueve **1.968 m** del pin
  viejo, que estaba en mitad de la dársena.
- Nombre, descripción, `cat` y etiquetas nuevos, del parche `auditoria-mar-8`.
  Venía en 8 idiomas; **el búlgaro y el polaco los he escrito yo** desde el
  castellano, y pasan las mismas comprobaciones: mismas cifras (1862, 31,
  1863), mismos trozos de `cat`, alfabeto correcto.
- «Farola del Mar» y «Muelle de Enlace» quedan declaradas como nombre propio.

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

## Lo que queda: dos, y las dos por una fuente que no tengo

### `ermita-san-telmo` — 18,6 m
La ermita **no está en el extracto**. Sí están la «Playa de San Telmo» (65 m) y
el «Paseo de San Telmo» (70 m), así que el barrio es el correcto, pero las dos
iglesias más cercanas —«Nuestra Señora de la Peña de Francia» (129 m) y «San
Francisco» (272 m)— no son la ermita. Con 18,6 m, empujarla al borde sería
ponerla en el paseo, no en el edificio. **Hace falta la coordenada de la ermita
o el volcado de Overpass.**

### `puertito-poris-abona` — 241 m
Tienes razón: un embarcadero pequeño no tiene dársena de 241 m. Lo he buscado
en el OSM del repositorio y **no hay nada**: 0 elementos de tipo muelle, marina
o puerto en 600 m, y en 350 m lo único con nombre es la «Urbanización Llanos
del Porís», a 347 m. En toda la isla el extracto lleva 17 muelles y 10 puertos,
así que no los está filtrando: es que ahí no hay ninguno. **Hace falta
Overpass.**

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
