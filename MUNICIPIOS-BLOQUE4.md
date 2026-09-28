# Bloque 4 · El municipio que no cuadra con el polígono

Era el único bloque en rojo. **Eran 16 y son 13**, porque tres no eran fallo de
las fichas sino de mi control. Eso va primero, porque es lo que cambia la cifra.

> **Al día 28 de septiembre: 1 resuelta, quedan 12.**
> `sendero-roque-conde` (la 8) no era ni texto ni pin de los de aquí: la ficha es
> **la subida y no la cumbre**, así que Arona era correcto y lo que estaba mal era
> el pin. Aplicada — ver el final del documento.

---

## 0 · Tres de las 16 las cantaba yo mal

`auditar_municipio.js` tenía una tabla de alias para que «Pto. Cruz» o
«Realejos» casaran con el nombre oficial. Dentro de esa tabla se me habían
colado dos nombres que **no son de un municipio**:

| alias | mandaba a | lo que es de verdad |
|---|---|---|
| `Las Américas` | Arona | zona turística **partida entre Arona y Adeje** |
| `Teno` | Buenavista del Norte | el **macizo**, repartido entre varios municipios |

No lo digo yo, lo dicen los propios puntos de la app:

- **10 fichas** nombran «Las Américas»: **8 caen en Arona y 2 en Adeje**
  (`bici-alquiler-sur`, `wc-troya`). La raya parte la zona por el medio.
- **7 fichas** nombran «Teno»: **6 caen en Buenavista del Norte y 1 en Los
  Silos** (`pr-tf-52-monte-agua`).

Si un mismo nombre manda a dos municipios distintos, no es el nombre de uno. El
control estaba acusando a tres fichas de mentir cuando las que decían la verdad
eran ellas. La cabecera del propio fichero ya avisaba de esto —«donde no hay
paradas, el Teide, **Teno**, Anaga profundo, no hay con qué comparar»— y aun así
Teno estaba en la tabla de alias.

**Lo que he hecho.** Los saco de `ALIAS` y los meto en `ZONAS`, con su propio
apartado en el informe: **14 fichas** que nombran una zona y ningún municipio.
Ni pasan ni fallan: se cuentan y se listan una por una. No les invento la lista
de municipios a los que pertenece cada zona, porque no la tengo.

```
  que nombran un municipio.................... 506
    de esos, comprobados contra el POLIGONO      496
    y con el punto en el agua                     10
  solo nombran una zona de varios municipios.... 14
  no declaran municipio......................... 267
                                                ----
                                                 787
```

**Comprobado que no tapa nada**: le he metido a `bici-alquiler-sur` un
«Garachico» en el `cat` junto a «Las Américas», y el control lo canta igual
(14 en vez de 13). El apartado nuevo no es un cajón para esconder.

---

## Las 13 que quedan

El polígono del Cabildo dice dónde cae el punto. Lo que aporta el paquete de
OSM que trajiste es lo otro: **si el pin está en el sitio**. Con las dos cosas
se separan solas.

| grupo | qué pasa | cuántas |
|---|---|---|
| A | **el texto miente**: el pin está bien y OSM lo confirma | **8** |
| B | **el pin miente**: el sitio está en otra parte | **1** |
| C | sobre la raya: lo decide la fuente oficial, no el polígono | **3** |
| D | nada que lo respalde en ninguna dirección | **1** |

---

## A · El texto miente (8)

En las ocho, OSM tiene **el sitio mismo** cerca del pin, en **el mismo
municipio que dice el polígono**, y —esto es lo que lo cierra— el elemento de
OSM está él mismo **lejos de la raya** del municipio que dice la ficha. No es
un pin que se cayó al otro lado por unos metros.

| id | dice | es de | qué hay en OSM | y a cuánto de la raya de lo que dice |
|---|---|---|---|---|
| `mir-chivisaya` | Güímar | **Candelaria** | «Mirador de Chivisaya» a **1 m** | 4,3 km |
| `mir-lomo-molino` | Garachico | **El Tanque** | «Mirador Lomo Molino» a **12 m**, «El Montero» a 12 m y el rótulo a 32 m | 112 m |
| ~~`sendero-roque-conde`~~ | — | — | **RESUELTA de otra manera**, ver el final | — |
| `playa-caleton-sauzal` | El Sauzal | **La Matanza de Acentejo** | «El Caletón» (caserío) a **28 m** | 1,2 km |
| `minigolf-precise-resort` | Puerto de la Cruz | **Los Realejos** | «Precise Resort Tenerife» a **67 m** | 58 m |
| `montana-taco` | San Cristóbal de La Laguna | **Buenavista del Norte** | «Montaña de Taco» (volcán) a **247 m** | 45 km |
| `charco-golete` | Candelaria | **Güímar** | «La Caleta» (caserío) a **319 m** | 7,3 km |
| `pp-el-tanque` | El Tanque | **Los Silos** | «La Tierra del Trigo» (caserío) a 1,4 km | 659 m |

### Dos son el mismo error: dos sitios con el mismo nombre

**`montana-taco`.** Hay un **barrio de Taco** y una **Montaña de Taco**, y no
tienen nada que ver. Las paradas de TITSA del repo ponen «Taco» y «Cruce de
Taco» en La Laguna y «Las Moraditas de Taco» en Santa Cruz — ése es el barrio.
La montaña está en Buenavista del Norte, **a 45 km**. La ficha se quedó con el
municipio del otro Taco.

**`charco-golete`.** La ficha dice «Charco pequeño en **La Caleta de
Candelaria**». Pero **no hay ninguna La Caleta en Candelaria**: ni en OSM, ni
entre las 2.514 paradas del catálogo. La que sí existe, a 319 m del pin, es
**La Caleta de Güímar**. El resto de la descripción («justo bajo la autopista»)
encaja con ese sitio.

### Una lleva la prueba escrita dentro

**`pp-el-tanque`.** La descripción dice: «Despegue de parapente en El Tanque
(**Tierra del Trigo**)». La Tierra del Trigo es **de Los Silos** — es la única
de la isla en OSM, y está 659 m dentro de Los Silos. La propia ficha se
contradice: el paréntesis dice la verdad y el nombre del municipio no.

---

## B · El pin miente (1)

### `super-mercadona-tacoronte`
- Dice **Tacoronte**; el pin cae en **El Sauzal**, a 270 m de la raya.
- OSM tiene un **«Mercadona» a 880 m** (`28.478618, -16.413241`), dentro de
  Tacoronte y **553 m** por dentro de la raya. El siguiente está a 2,4 km,
  también en Tacoronte. En todo el km alrededor del pin actual no hay ningún
  Mercadona.
- La descripción («Mercadona en Tacoronte, zona vinícola») es correcta.
  **Aquí lo que sobra es la coordenada**, no el texto. Dime que es ése y la
  muevo.

---

## C · Sobre la raya: decide la fuente oficial (3)

### `ar-las-lajas` y `camping-las-lajas`
- Las dos dicen **Vilaflor** y **comparten exactamente el mismo punto**
  (`28.1895, -16.6645`), 55 m dentro de Adeje.
- OSM pone los tres elementos en Adeje: la zona de acampada 117 m dentro y el
  área recreativa 241 m dentro. En 1 km alrededor **no hay un solo elemento de
  Vilaflor**.
- Pero `camping-las-lajas` lleva escrito `address: "Las Lajas, Vilaflor,
  Tenerife"`, y es **zona de acampada del Cabildo**: su propia ficha oficial
  dice a qué municipio la adscribe, y eso manda sobre OSM.
- Aparte del municipio: **son dos fichas con un solo pin**, y OSM tiene el área
  recreativa y la acampada separadas 127 m. Habría que darle a cada una la
  suya.

### `guachinche-san-juan-rambla`
- Dice **San Juan de la Rambla**; cae 446 m dentro de Los Realejos.
- El pin está junto al **Barranco de Ruiz, que es justo la raya**: lo más
  cercano de Los Realejos está a 448 m y lo más cercano de San Juan de la
  Rambla a 524 m. Casi empatados.
- El guachinche no está en OSM. Hace falta su dirección real.

---

## D · Sin nada que lo respalde (1)

### `escal-guaria`
- Dice **Guía de Isora**; cae en Adeje, a **3,6 km** de Guía de Isora.
- «Guaría» **no existe en OSM**, ni como sector ni como topónimo, en toda la
  isla. Y en 1 km alrededor del pin **todo es de Adeje** (Los Llanos, Boca del
  Paso, el PR-TF 71 Camino de Teresme); no aparece nada de Guía de Isora.
- 3,6 km es demasiado para un error de borde: o el pin está mal puesto, o el
  municipio del texto está mal. OSM no puede decir cuál, y yo tampoco.

---

## Lo que necesito de ti

1. **Grupo A (7, era 8)** — ¿cambio el texto al municipio que dice el polígono?
   Con eso el bloque baja de 12 a 5. ~~`sendero-roque-conde`~~ ya está resuelta.
2. **Grupo B (1)** — ¿el Mercadona de Tacoronte es el de
   `28.478618, -16.413241`?
3. **Grupo C (3)** — Las Lajas la decide el Cabildo; el guachinche, su
   dirección. Y de paso: ¿le doy pin propio a cada una de las dos de Las Lajas?
4. **Grupo D (1)** — `escal-guaria` necesita que alguien que conozca el sector
   diga si está en Adeje o en Guía de Isora.

Nada de esto está aplicado. Como en los bloques 1, 2 y 3: **OSM no es fuente
oficial** (LEEME §2.1), aquí solo sirve para localizar y contrastar. Ninguna
ficha se toca sin tu OK.

---

*Todo lo de aquí se regenera con `node tools/auditar_municipio.js` (polígono del
Cabildo, vía `tools/municipio.py`) y `python3 tools/geofabrik_cerca.py`
(paquete de OSM en `datos/osm-geofabrik/`). Ninguna cifra está escrita a mano.*

---

## Aplicado · 8 · `sendero-roque-conde` (28 de septiembre)

**No era del grupo A.** La ficha es **la subida**, no la cumbre, así que el
municipio **no cambia**: Arona es correcto. Lo que estaba mal era el pin, que
apuntaba al pico.

- **El pin** pasa de `28.1042, -16.6986` (la cima, en Adeje, a 13 m del pico de
  OSM) a **`28.100997, -16.687583`**, el inicio publicado por el **Ayuntamiento
  de Adeje** («Inicio: Calle Vento (Arona)»). Se mueve **1.138 m**. Comprobado
  con el polígono: cae en **Arona**, a 354 m de la raya.
- **Los datos de la ruta** no coincidían con ninguna fuente oficial. Fuera
  «circular», «7,5 km», «3 horas», «+410 m», «Difícil», «1.001 m», «menceyato de
  Abona» y «cuerdas». Entra, del Ayuntamiento de Adeje: **lineal, 3,7 km hasta la
  cima, 2 h, dificultad media, cotas 596–999 m, +484 m de desnivel, vuelta por el
  mismo camino**. Y se dice que **la cima está en Adeje, pasado el Barranco del
  Rey**, que es el límite.
- **La etiqueta «Difícil» pasa a «Medio»**, que es como escriben la dificultad
  media las otras 21 rutas y ya tenía fila en el glosario. «1001m» se va con la
  cota.
- **De paso**: el `cat` italiano decía «Cumbre», en castellano, desde siempre.
  Ningún control lo miraba porque la vigilancia de etiquetas es de los chips del
  globo, no del primer tramo del `cat`. Queda «Cima».

En los 10 idiomas, con búlgaro y polaco traducidos desde el castellano y
pasando las mismas comprobaciones. La entrega, con antes y después por id, está
en `datos/entregas/bloque4-08-sendero-roque-conde.json`.

**Lo que no he tocado y por qué:**

- El inicio del **Cabildo** (Plaza del Cristo de la Salud, unos 650 m antes) no
  se usa porque **no hay coordenada publicada de la plaza**. La de Vento es la
  única. Si aparece, se cambia.
- **`sendero-guajara`** está igual: pin en la cumbre, a 59 m del pico, y su
  propio texto dice «Inicio en el Parador de Las Cañadas». **No lo he tocado**:
  hace falta tu decisión y una coordenada de inicio con fuente.
- **Alcance de la regla «senderismo = pin en el inicio», medido**: de las 37
  fichas de senderismo, sólo **2** tienen un pico de OSM a menos de 300 m del
  pin — `sendero-guajara` (59 m) y `ruta-pico-viejo` (137 m, Pico Viejo
  Occidental). Las otras 35 ya apuntan a otra cosa. Fijar la regla toca **dos
  fichas, no treinta**.
