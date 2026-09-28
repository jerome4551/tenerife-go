# Las 7 preguntas del grupo A

Son la **misma pregunta siete veces**: en todas, el pin está donde debe y el
municipio que dice el texto está mal. Puedes contestarlas de golpe con un «sí a
las 7», o una por una.

**La pregunta:** ¿le pongo a la ficha el municipio que dice el polígono del
Cabildo?

Debajo de cada una está **por qué creo que el pin está bien**: qué tiene OSM al
lado, y a qué distancia está ese elemento de la raya del municipio que la ficha
nombra hoy. Si un elemento está a 4 km de esa raya, no es un pin que se cayó al
otro lado por unos metros.

---

### 1 · `mir-chivisaya` — Güímar → **Candelaria**

- OSM tiene el **«Mirador de Chivisaya» a 1 m** del pin, en Candelaria.
- Ese mirador está a **4,3 km** de la raya de Güímar.
- Alrededor: «Chivisaya» (caserío) a 363 m, también Candelaria.

**¿Lo cambio a Candelaria?**

---

### 2 · `mir-lomo-molino` — Garachico → **El Tanque**

- OSM tiene **tres cosas encima del pin**, todas en El Tanque: el «Mirador Lomo
  Molino» a **12 m**, el restaurante «El Montero» a **12 m** y el rótulo
  «Mirador "Lomo Molino"» a **32 m**.
- El mirador está a **112 m** de la raya de Garachico, o sea que es un borde.
  Pero lo más cercano que OSM tiene **de Garachico está a 630 m**, y sin nombre.
  Tres elementos de El Tanque encima del pin contra nada de Garachico.

**¿Lo cambio a El Tanque?**

---

### 3 · `playa-caleton-sauzal` — El Sauzal → **La Matanza de Acentejo**

- OSM tiene el caserío **«El Caletón» a 28 m**, en La Matanza, y la playa «La
  playa es tuya» a 38 m, también La Matanza.
- El caserío está a **1,2 km** de la raya de El Sauzal.
- En 1 km alrededor **no hay un solo elemento de El Sauzal**.

**¿Lo cambio a La Matanza de Acentejo?** (Ojo: el nombre de la ficha es «Playa
del Caletón · El Sauzal», así que habría que tocarlo también.)

---

### 4 · `minigolf-precise-resort` — Puerto de la Cruz → **Los Realejos**

- OSM tiene el hotel **«Precise Resort Tenerife» a 67 m**, en Los Realejos, que
  es el resort del que el minigolf forma parte.
- El hotel está a **58 m** de la raya de Puerto de la Cruz, y ahí sí hay cosas
  del otro lado cerca: el estadio de béisbol Néstor Pérez a **177 m**, ya en
  Puerto de la Cruz. **Es el más ajustado de los siete.** Lo que decide, a mi
  juicio, es que el elemento que da nombre a la ficha —el propio resort— cae del
  lado de Los Realejos.

**¿Lo cambio a Los Realejos?** Si prefieres dejar éste como está, lo entiendo:
un minigolf de un resort que se anuncia como de Puerto de la Cruz puede querer
seguir diciéndolo aunque la raya pase por medio.

---

### 5 · `montana-taco` — La Laguna → **Buenavista del Norte**

Ésta es la más gorda: **44,7 km** de diferencia.

- **Hay dos Tacos y no tienen nada que ver.** El *barrio* de Taco está en La
  Laguna: las paradas de TITSA del repositorio ponen «Taco» y «Cruce de Taco» en
  La Laguna, y «Las Moraditas de Taco» en Santa Cruz.
- La *montaña* está en Buenavista del Norte: OSM tiene la **«Montaña de Taco»
  (volcán) a 247 m** del pin, y está a **45 km** de la raya de La Laguna.
- La ficha se quedó con el municipio del otro Taco.

**¿Lo cambio a Buenavista del Norte?**

---

### 6 · `charco-golete` — Candelaria → **Güímar**

- La ficha dice «Charco pequeño en **La Caleta de Candelaria**». Pero **no hay
  ninguna La Caleta en Candelaria**: ni en OSM, ni entre las 2.514 paradas del
  catálogo de TITSA.
- La que sí existe es **La Caleta de Güímar**, un caserío que OSM tiene **a
  319 m** del pin, a **7,3 km** de la raya de Candelaria.
- Todo lo que hay en 1 km alrededor es de Güímar, y la parada más cercana es
  «Punta Prieta», a 209 m, también Güímar.
- El resto de la descripción («justo bajo la autopista») encaja con ese sitio.

**¿Lo cambio a Güímar?** Aquí hay que tocar también la descripción, que nombra
«La Caleta de Candelaria».

---

### 7 · `pp-el-tanque` — El Tanque → **Los Silos**

**Esta ficha lleva la prueba escrita dentro.** Su descripción dice: «Despegue de
parapente en **El Tanque (Tierra del Trigo)**».

- **La Tierra del Trigo es de Los Silos.** Es la única de la isla en OSM
  (`node/1437814532`) y está **659 m** por dentro de Los Silos.
- El pin cae en Los Silos, a 1,1 km de la raya de El Tanque.
- En 1 km alrededor todo es de Los Silos: «Las Juncias» a 333 m, «Cuevas Negras»
  a 363 m.
- El paréntesis dice la verdad y el nombre del municipio no.

**¿Lo cambio a Los Silos?**

---

## Lo que pasa si dices que sí a las siete

El bloque baja de **8 a 1**: quedaría sólo `escal-guaria`, que necesita a alguien
que conozca el sector.

*(Al 28 de septiembre, Las Lajas y el guachinche ya están resueltos: las dos de
Las Lajas eran de Adeje y el guachinche se dio de baja.)*

En las tres que además tienen el municipio metido en el nombre o en la
descripción —la 3, la 6 y la 7— lo cambio también, y en los diez idiomas.

---

*Las distancias salen de `node tools/auditar_municipio.js` (polígono del Cabildo)
y `python3 tools/geofabrik_cerca.py` (paquete de OSM). Ninguna está escrita a
mano. **OSM no es fuente oficial**: aquí sólo sirve para enseñar que el pin está
en el sitio que la ficha describe. El municipio lo decide el polígono.*
