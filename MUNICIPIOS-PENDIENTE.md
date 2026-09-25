# Bloque 1 · Las 10 fichas que dicen un municipio que no les toca

Este es el bloque **más urgente** y por eso va solo. Es exactamente el mismo
fallo que te enfadó con *Charco Verde*: una ficha que **dice estar en un sitio
donde no está**. Quien busca por municipio no la encuentra, y quien la lee se
cree un dato falso.

De las 787 fichas, **520 nombran un municipio** y **473** se pueden contrastar
con las paradas de TITSA que ya están en el repositorio (las otras 45 no tienen
3 paradas a 1,5 km, así que no hay con qué comparar y salen como *sin
comprobar*, no como buenas). De esas 473, **10 no cuadraban en firme**.

| grupo | qué pasa | cuántas | estado |
|---|---|---|---|
| A | el punto está bien, **lo que miente es el texto** | 4 | ✅ **APLICADO** (parche `municipios-bloque1-A`) |
| B | el municipio está bien, **lo que miente es el punto** | 3 | ⏳ falta la **coordenada buena** |
| C | la ficha **se contradice a sí misma** | 3 | ⏳ falta decidir **cuál de los dos** |

**Quedan 6.** Son las de los grupos B y C.

---

## Cómo mandarme las respuestas

Del grupo B, una línea por sitio con `id lat lng`. Se aplican con

```
python3 tools/fijar_coordenada.py --fichero nuevas.txt
```

que comprueba cada una antes de escribir (que el id exista, que caiga en
Tenerife, que caiga en tierra y cuántos metros se mueve), **apunta la fuente en
`datos/verificado.json`** y no escribe nada si alguna falla.

Para sacar una coordenada en Google Maps: pulsación larga sobre el punto → los
dos números → el primero es `lat`, el segundo `lng`.

---

## Grupo A · HECHO (4)

Dijiste «sí a los 4» y mandaste el parche `municipios-bloque1-A`
(sha256 `594fa5ed…`, comprobado antes de tocar nada). Aplicado y validado.

| id | decía | dice ahora | campos cambiados |
|---|---|---|---|
| `buceo-tabaiba` | Santa Cruz | **El Rosario** | nombre, etiquetas, `cat` ×10, `desc` ×10 |
| `parque-tabaiba-baja` | Santa Cruz | **El Rosario** | etiquetas, `cat` ×10, `desc` ×10 |
| `kayak-radazul` | Santa Cruz | **El Rosario** | nombre, etiquetas, `cat` ×10 |
| `mir-cruz-hilda` | Santiago del Teide (Tamaimo) | **Buenavista del Norte (Masca)** | nombre, etiquetas, `cat` ×10, `desc` ×10 |

### La prueba del polígono: lo que pediste y lo que hay

Pediste *point-in-polygon* contra **el shapefile municipal del Cabildo «que ya
está en el repo»**. **No está.** Lo he comprobado: en el repositorio no hay
ningún fichero de límites municipales, y el municipio de las paradas de TITSA
tampoco sale de un polígono — `tools/gtfs_red.py` se lo copia a cada parada del
índice de TITSA más cercano, a menos de 3 km. Bajarlo tampoco se puede:
Overpass, Nominatim, IDECanarias y los portales de datos abiertos dan `000`
desde aquí.

Lo que sí hay en el repositorio es el mapa OSM, y dentro **las rayas
municipales** (`boundaries`, `admin_level` 8). No son polígonos —son líneas
sueltas, recortadas por tesela— así que no se puede preguntar «dentro de quién
cae». Pero sí se puede preguntar **lo único que hacía falta**, que es justo el
riesgo que tú señalabas:

> ¿hay una raya municipal **entre el punto y las paradas que lo rodean**?

Está en `tools/municipio_raya.py`, y esto es lo que devuelve:

| id | paradas de apoyo | raya más cercana | hueco del dato | rayas en medio |
|---|---|---|---|---|
| `buceo-tabaiba` | 8 hasta 561 m, todas El Rosario | 909 m | 911 m | **0** |
| `parque-tabaiba-baja` | 8 hasta 510 m, todas El Rosario | 987 m | 994 m | **0** |
| `kayak-radazul` | 8 hasta 433 m, todas El Rosario | 1.618 m | 1.618 m | **0** |
| `mir-cruz-hilda` | 8 hasta 1.780 m, todas Buenavista | 2.166 m | 2.224 m | **0** |

Tu ejemplo — «una parada a 67 m puede caer al otro lado de una raya» — queda
contestado con número: **la raya más cercana al mirador está a 2.166 m**.

**Y está calibrado, no dado por bueno.** De las 849 parejas de paradas vecinas
de municipio distinto a menos de 1,5 km, **805 (94,8 %)** tienen de verdad una
raya en medio: el dato pierde 1 de cada 19 cruces. Por eso una ficha solo se
cierra si **ni una raya ni un hueco** caen dentro del círculo que abarca las
paradas de apoyo. Probado al revés: sobre las 5 fichas que están de verdad en
un borde, el control canta (7, 5 y 8 rayas en medio, y en las otras dos la raya
a 172 m y a 1.294 m, dentro del círculo) y se niega a concluir.

Si algún día entra el polígono oficial, esto se rehace con él. Queda apuntado
en `datos/verificado.json`, sección `municipio_por_raya`, con la fuente de cada
una.

### Lo que el parche no traía, y hubo que poner

1. **Venía en 8 idiomas y la app tiene 10.** Faltaban búlgaro y polaco en todo:
   los `cat`, los `desc` y el texto nuevo del mirador. Escritos, con la
   ortografía que ya usan otras fichas del repositorio (`puerto-radazul`,
   `playa-radazul` y `playa-nea` para «Ел Росарио / El Rosario»;
   `charco-faro-buenavista` para «Буенависта дел Норте»).
2. **Su propia validación no se podía cumplir con lo que traía.** El punto 5
   exige que en las tres fichas de El Rosario no quede «Santa Cruz» en `cat`;
   en `buceo-tabaiba` el parche no listaba el `cat` de italiano ni de
   neerlandés, y los dos lo llevaban.
3. **Cuatro fragmentos no existían tal cual.** En el `desc` de `buceo-tabaiba`
   el parche pedía sustituir, y el fichero dice otra cosa:

   | idioma | el parche buscaba | lo que hay de verdad | lo que se escribió |
   |---|---|---|---|
   | fr | `Tabaiba Baja, nord-est de Santa Cruz:` | `…, au nord-est de Santa Cruz,` | `…, au sud-ouest de Santa Cruz,` |
   | de | `…, Nordosten von Santa Cruz:` | `…, nordöstlich von Santa Cruz,` | `…, südwestlich von Santa Cruz,` |
   | it | `…, nord-est di Santa Cruz:` | `…, a nord-est di Santa Cruz,` | `…, a sud-ovest di Santa Cruz,` |
   | nl | `…, noordoost van Santa Cruz:` | `…, ten noordoosten van Santa Cruz,` | `…, ten zuidwesten van Santa Cruz,` |

   Por la letra del parche esa ficha quedaba PENDIENTE. Se ha aplicado **el
   mismo cambio que pedía** (noreste → suroeste) sobre la frase que de verdad
   está, y se deja escrito aquí para que puedas vetarlo.

### Un fallo que salió de rebote

Al corregir el mirador, `tools/auditar_municipio.js` lo marcó como
contradicción: decía que el nombre «(Masca)» significaba *Santiago del Teide*.
**Su tabla de alias estaba mal**: tenía «Masca» como alias de Santiago del
Teide. Las **tres** paradas del catálogo que llevan «Masca» en el nombre son de
**Buenavista del Norte**. Corregido.

---

## Grupo B · El municipio está bien y el punto miente (3)

Aquí el texto es correcto y **la coordenada está caída en otro pueblo**. Lo que
necesito es el punto de verdad. **No lo deduzco yo**: eso sería inventar.

Con la herramienta nueva ya no es «parece que está fuera»: los dos primeros
están **dentro del otro municipio con margen**, no en la raya.
`mercadillo-la-victoria` tiene 8 paradas de La Matanza a su alrededor y la raya
más cercana a 1.089 m; `ar-la-quebrada`, 8 de La Laguna y la raya a 847 m. Son
puntos desplazados, no casos de borde.

### B1 · `mercadillo-la-victoria` — Mercadillo de La Victoria de Acentejo
- **Ahora**: `28.448, -16.4579`.
- **Qué pasa**: a **35 m** tiene la parada **«La Matanza»**, de **La Matanza de
  Acentejo**, y las 8 paradas de alrededor son todas de La Matanza. El punto
  está en el pueblo de al lado. La parada de La Victoria de Acentejo más
  cercana («La Pólvora») queda a **1,53 km al suroeste**.
- **Necesito**: dónde se pone el mercadillo de La Victoria.

### B2 · `ar-la-quebrada` — Área Recreativa La Quebrada
- **Ahora**: `28.501, -16.323` — coordenada **a ojo**, con 3 decimales.
- **Qué pasa**: a **89 m** tiene la parada **«Manuel de Falla»**, y las
  siguientes son «Joaquín Turina», «Enrique Granados», «Chopin»: **calles de
  un barrio de La Laguna**, no un área recreativa de monte. La parada de
  Tegueste más cercana («Pedro Álvarez») está a **1,81 km al norte**.
- **Necesito**: el punto del área recreativa. (Hay una parada «La Quebrada»
  en el catálogo, pero es de **Santa Cruz** y está a **8,3 km al este**: no es
  esta, y por eso no la uso.)

### B3 · `cavis-violencia-sexual-tenerife` — CAVIS, Violencia Sexual
- **Ahora**: `28.4708, -16.2885`.
- **Qué pasa**: la ficha da la dirección **«Santa Cruz, calle Franco de Medina
  41»**, pero el punto cae con las 8 paradas de alrededor en **La Laguna**
  (la más cercana, «Breña Alta», a 72 m).
- **Por qué este me corre más que los otros dos**: es un teléfono y una puerta
  de **atención a víctimas**. Que el mapa lleve a otro sitio no es una errata.
- **Necesito**: la coordenada de Franco de Medina 41. Si la dirección también
  ha cambiado, la dirección nueva.

---

## Grupo C · La ficha se contradice a sí misma (3)

Aquí **no es cuestión de coordenada**: la ficha dice dos cosas distintas en el
nombre y en el texto, así que una de las dos está mal sí o sí. Necesito que
elijas.

### C1 · `casa-capitanes-generales` — es la más gorda de las tres
- **El nombre** dice «Casa de los Capitanes Generales **(La Laguna)**» y el
  punto (`28.4876, -16.3148`) cae a **116 m de la parada «Plaza del
  Adelantado»**, en La Laguna.
- **La descripción** habla de otro edificio: «Plaza de la **Candelaria** de
  Santa Cruz», «sede del **Ayuntamiento de Santa Cruz de Tenerife**». Y el
  `cat` y las etiquetas dicen Santa Cruz.
- O sea: **nombre y punto apuntan a un edificio y el texto describe otro**.
- **Necesito que me digas cuál de los dos quieres**, y el otro lo damos de alta
  aparte si te interesa:
  - **(a)** el de **La Laguna**, Plaza del Adelantado → hay que **reescribir la
    descripción entera** en los diez idiomas.
  - **(b)** el de **Santa Cruz**, Plaza de la Candelaria → hay que **cambiar el
    nombre y la coordenada**.

### C2 · `rcg-tenerife` — Real Club de Golf de Tenerife
- **El nombre** dice «(Tacoronte)». **La descripción, el `cat` y las etiquetas**
  dicen «San Lázaro (**La Laguna**)».
- **El punto** (`28.4872, -16.3793`) tiene las tres paradas más cercanas en
  **Tacoronte** («El Rodeo» a 263 m, «El Boquerón» a 579 m, «El Trazo» a
  724 m) y las de La Laguna ya a **más de 950 m**.
- Está **en el límite de los dos municipios**, así que aquí las paradas no
  mandan solas.
- **Necesito**: si el club es de **Tacoronte** o de **La Laguna**. Luego lo
  dejo dicho igual en los cuatro sitios de la ficha.

### C3 · `guachinche-cordero` — Guachinche El Cordero
- **La ficha** dice «Arona» en el `cat` y en la dirección: «TF-652 nº 8, El
  Monte o **Guargacho (Arona)**».
- **El punto** (`28.0454, -16.6292`) tiene las 8 paradas de alrededor en **San
  Miguel de Abona**, la más cercana «Catú» a 116 m.
- **Por qué no lo decido yo**: **Guargacho está partido**. En el catálogo hay
  dos paradas «Guargacho» de **San Miguel de Abona** y una «Guargacho Bajo» de
  **Arona**. El guachinche puede caer a un lado o al otro de esa raya.
- **Necesito**: si El Cordero es de **Arona** o de **San Miguel de Abona**.

---

## Lo que NO está en este bloque

**5 fichas en el borde municipal** salen avisadas pero **no suspenden**, porque
en un límite las paradas se mezclan y un control que canta en cada borde se
acaba ignorando: `mir-la-corona-guimar`, `mir-lomo-molino`, `montana-taco`,
`playa-caleton-sauzal`, `pr-tf-52-monte-agua`. Si quieres, las miramos después
de estas 10.

Y los bloques que vienen detrás, por orden, cuando cerremos este:

1. **6 lugares con el pin en el agua** — ya tienen su lista en
   `COORDENADAS-PENDIENTES.md`. Dos son de verdad (444 m y 82 m mar adentro) y
   cuatro son precisión del dibujo de la costa.
2. **55 coordenadas puestas a ojo**, sin verificar (de 787).
3. **3 orientaciones de playa** que quedaron abiertas: `playa-grande-abades`,
   `benijo`, `piscina-gigantes`. *(El resto de orientaciones está CERRADO: no
   se vuelve a preguntar.)*
4. **La ficha de Playa La Fajana**: falta confirmar su `ori`.
5. Cosas de la app, sin datos que buscar: 6 zonas tocables por debajo de
   24×24 px, el «Eliminar cuenta» que no existe y el formulario «Anúnciate»
   que hoy solo escribe en el navegador.

---

*Las cifras de este documento salen de `node tools/auditar_municipio.js`, que
entra en `tools/auditar.sh`. Ninguna está escrita a mano.*
