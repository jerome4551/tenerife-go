# Bloque 1 · Las 10 fichas que dicen un municipio que no les toca

Este es el bloque **más urgente** y por eso va solo. Es exactamente el mismo
fallo que te enfadó con *Charco Verde*: una ficha que **dice estar en un sitio
donde no está**. Quien busca por municipio no la encuentra, y quien la lee se
cree un dato falso.

De las 787 fichas, **520 nombran un municipio** y **473** se pueden contrastar
con las paradas de TITSA que ya están en el repositorio (las otras 45 no tienen
3 paradas a 1,5 km, así que no hay con qué comparar y salen como *sin
comprobar*, no como buenas). De esas 473, **10 no cuadran en firme**.

**No hay que buscar las 10.** Están separadas en tres grupos, y solo dos
necesitan que mires algo:

| grupo | qué pasa | cuántas | qué necesito de ti |
|---|---|---|---|
| A | el punto está bien, **lo que miente es el texto** | 4 | un **sí** y lo cambio |
| B | el municipio está bien, **lo que miente es el punto** | 3 | la **coordenada buena** |
| C | la ficha **se contradice a sí misma** | 3 | **cuál de los dos** es el sitio |

---

## Cómo mandarme las respuestas

Del grupo A basta con «sí» o «no» a cada uno.

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

## Grupo A · El punto está bien y el texto miente (4)

Aquí **no hace falta que busques nada**: la prueba ya está dentro del
repositorio. Las paradas de TITSA traen su municipio, y en estos cuatro hay una
parada **con el mismo nombre del sitio, pegada al punto**. Solo te pido el
visto bueno porque cambiar el texto de una ficha es decisión tuya, no mía.

### A1 · `buceo-tabaiba` — Buceo Tabaiba, Pecio El Peñón
- **Dice**: Santa Cruz (en el nombre, en el `cat` y en las etiquetas).
- **Está en**: `28.402, -16.3312`.
- **Prueba**: la parada **«Tabaiba» a 177 m** es de **El Rosario**, y las 8
  paradas más cercanas son todas de El Rosario. Hay tres paradas llamadas
  «Tabaiba» y las tres son de El Rosario.
- **Y además**: su propia descripción dice «Tabaiba Baja, **al noreste de
  Santa Cruz**». Medido contra la propia ficha de Santa Cruz de la app
  (`28.4671, -16.2472`), el punto queda **10,9 km al suroeste**.
- **Propongo**: Santa Cruz → **El Rosario**, y «noreste» → «suroeste».

### A2 · `parque-tabaiba-baja` — Parque Canino Tabaiba Baja
- **Dice**: Santa Cruz. · **Está en**: `28.4036, -16.3318`.
- **Prueba**: la parada **«Tabaiba» a 11 m** es de **El Rosario**. Once metros.
- **Propongo**: Santa Cruz → **El Rosario**.

### A3 · `kayak-radazul` — Kayak Radazul
- **Dice**: Santa Cruz. · **Está en**: `28.401, -16.3235`.
- **Prueba**: la parada **«Colón» a 56 m** es de **El Rosario**, y las **cinco**
  paradas que llevan «Radazul» en el nombre (incluidas «Radazul Alto» y
  «Puerto de Radazul») son **todas de El Rosario**.
- **Propongo**: Santa Cruz → **El Rosario**.

### A4 · `mir-cruz-hilda` — Mirador Cruz de Hilda
- **Dice**: Santiago del Teide. · **Está en**: `28.3129, -16.8457`.
- **Prueba**: hay una parada llamada **«Cruz de Hilda» a 67 m** y es de
  **Buenavista del Norte**. Las siguientes son «El Turrón» (482 m) y **«Masca»
  (884 m)**, también de Buenavista.
- **Ojo con la descripción**: dice «en la carretera de Santiago del Teide a
  **Tamaimo**», pero lo que tiene al lado es Masca: la parada «Masca» está a
  **0,9 km**, la de «Santiago del Teide Norte» a **3,3 km** y la de «Tamaimo
  Norte» a **5,2 km**. Si me confirmas el municipio, dime también si reescribo
  esa frase.
- **Propongo**: Santiago del Teide → **Buenavista del Norte**.

---

## Grupo B · El municipio está bien y el punto miente (3)

Aquí el texto es correcto y **la coordenada está caída en otro pueblo**. Lo que
necesito es el punto de verdad. **No lo deduzco yo**: eso sería inventar.

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
