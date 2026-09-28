# Bloque 4 · El municipio que no cuadra con el polígono

Era el único bloque en rojo. **Eran 16 y son 13**, porque tres no eran fallo de
las fichas sino de mi control. Eso va primero, porque es lo que cambia la cifra.

> **Al día 28 de septiembre: LAS 13 RESUELTAS. El bloque queda a cero.**
> Aplicadas las 7 del grupo A, `sendero-roque-conde` (8),
> `super-mercadona-tacoronte` (9), `ar-las-lajas` (10), `camping-las-lajas` (11) y
> la baja de `guachinche-san-juan-rambla` (12) y `escal-guaria` (13).
> Todo al final del documento.

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

## A · El texto miente (8) — ~~LAS 7 RESUELTAS~~, ver el final

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

## B · El pin miente (1) — ~~RESUELTA~~

`super-mercadona-tacoronte`, aplicada. Ver el final del documento.

---

## C · Sobre la raya (3) — ~~LAS TRES RESUELTAS~~

`ar-las-lajas`, `camping-las-lajas` y `guachinche-san-juan-rambla`. Ver el final
del documento.

## D · Sin nada que lo respalde (1) — ~~RESUELTA~~, ver el final

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
2. **Grupo D (1)** — `escal-guaria` necesita que alguien que conozca el sector
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

---

## Aplicado · 9 · `super-mercadona-tacoronte` (28 de septiembre)

El único del bloque donde **mentía el pin** y no el texto. Jerome lo confirmó con
una captura de **Google Street View de junio de 2026**, con el rótulo de
MERCADONA y la entrada a la vista.

- **El pin** pasa de `28.47320, -16.41980` (El Sauzal, a 270 m de la raya) a
  **`28.478611, -16.413250`**, la coordenada del propio visor
  (28°28'43.0"N 16°24'47.7"W). Se mueve **879 m**. Comprobado con el polígono:
  cae en **Tacoronte**.
- Esa coordenada coincide **a 1,2 m** con el nodo de OSM `node/903016696`, que
  era el candidato que yo había propuesto. Se usa la de Jerome, que es la que
  lleva la foto del rótulo detrás.
- **El texto no se toca**: «Mercadona en Tacoronte, zona vinícola» siempre fue
  correcto, y el `cat` también.

Escrita con `tools/fijar_coordenada.py`, que la comprobó antes (existe el id,
está dentro de la caja, cae en tierra) y apuntó la fuente sola en
`datos/verificado.json`.

---

## Aplicado · 10 y 11 · Las Lajas (28 de septiembre)

**El Cabildo dice Adeje, no Vilaflor.** La condición que puse —que mandaba la
ficha oficial— se cumplió al revés de como yo esperaba: Tenerife ON sitúa el área
recreativa en **Lomo de Los Pegueros, Adeje** y la zona de acampada en **Altos de
Adeje, Adeje**. El shapefile coincide.

**Y cada una tiene ya su pin.** Los publica el Cabildo en el enlace «Acceso»:

| | antes | después | se mueve | a la raya de Vilaflor |
|---|---|---|---|---|
| `ar-las-lajas` | `28.1895, -16.6645` | **`28.190285, -16.666189`** | 187 m | 237 m |
| `camping-las-lajas` | el mismo punto | **`28.190608, -16.665057`** | 135 m | 139 m |

Quedan a **117 m** una de otra, que es lo que las separa en Tenerife ON. El pin
que compartían estaba a sólo 55 m de la raya.

**Los datos tampoco cuadraban con el Cabildo:**

- `ar-las-lajas` decía «1.400 m», «el pueblo más alto de España» y «42 mesas».
  Fuera las tres. Ahora: **por encima de los 1.500 m**, **aforo de 475 plazas**,
  mesas, fogones y área infantil; **los aseos sólo abren fines de semana y
  festivos, de 10:00 a 17:30**; **el agua de la fuente NO es potable**; estancia
  de sol a sol, y los grupos y entidades con reserva.
- `camping-las-lajas` decía «acampada gratuita». La ficha oficial no lo dice, así
  que fuera. Ahora: **aforo de 30 plazas**, **reserva obligatoria para todos** en
  Tenerife ON, **de 12:00 a 12:00** y **máximo 7 días**, y el agua tampoco es
  potable. Nombre «Zona Acampada Las Lajas (Adeje)» y dirección «Altos de Adeje,
  Adeje».

**La zona de autocaravanas** (11 plazas, Altos de Adeje) no entra como ficha
nueva: se cuenta dentro del área recreativa, que es lo que pediste. Su coordenada
(`28.190088, -16.664950`) queda apuntada en la entrega por si algún día la
quieres aparte.

En los 10 idiomas, con búlgaro y polaco desde el castellano.

---

## Aplicado · 12 · `guachinche-san-juan-rambla`, de baja (28 de septiembre)

No hay dirección que buscar: nombre genérico —**la única de las 20 fichas de
guachinche sin nombre propio**—, sin dirección ni teléfono, descripción genérica
y ningún guachinche que se llame así. **Regla de cero datos inventados.**

Borrada de `index.html`, de los nueve ficheros de idioma y de
`idiomas/pl-lugares/`. Ninguna de sus seis etiquetas se queda huérfana: las usan
otras fichas.

**Son 786.** El contador de `auditar_datos.js` está movido a mano con el motivo
escrito —es un tope a propósito, para que una baja no pase inadvertida— y las dos
cifras «787 puntos de interés» y «787 lugares» que había en el fuente, al día. El
control las cazó solo en cuanto borré la ficha.

### Una corrección mía

Escribí que el pin estaba «junto al **Barranco de Ruiz, que es justo la raya**».
**No lo comprobé.** El pin caía 446 m dentro de Los Realejos y el cauce queda a
441 m. Los 448 m y 524 m que di eran distancias a **bares de OSM**, no al límite
municipal. La corrección es de Jerome.

---

## Aplicado · las 7 del grupo A (28 de septiembre)

Jerome dijo que sí a las siete. En todas **el pin estaba bien y el municipio del
texto estaba mal**, así que no se toca ninguna coordenada.

| ficha | de | a |
|---|---|---|
| `mir-chivisaya` | Güímar | **Candelaria** |
| `mir-lomo-molino` | Garachico | **El Tanque** |
| `playa-caleton-sauzal` | El Sauzal | **La Matanza** |
| `minigolf-precise-resort` | Puerto de la Cruz | **Los Realejos** |
| `montana-taco` | La Laguna | **Buenavista del Norte** |
| `charco-golete` | Candelaria | **Güímar** |
| `pp-el-tanque` | El Tanque | **Los Silos** |

En los 10 idiomas, cambiando `cat`, `tags` y, donde lo llevaban, el `name`, el
`alias` y la descripción. Los topónimos que no son el municipio se quedan: el
**Valle y el Malpaís de Güímar** siguen en `mir-chivisaya` (es lo que se ve desde
allí) y el **Roque de Garachico** sigue en `mir-lomo-molino`.

### Una no era sólo el municipio

**`montana-taco`.** La descripción entera era la del **otro Taco**, el barrio de
La Laguna: «en el corazón del municipio de La Laguna», «un pulmón verde entre la
ciudad», «vistas al aeropuerto, La Laguna y la costa noreste», «sendero sencillo
de 45 minutos desde la ciudad». Nada de eso vale para una montaña de Buenavista
del Norte que está a 45 km.

**No invento una descripción nueva.** Se deja sólo lo que tiene fuente —cono
volcánico (OSM `node/652422882`, a 247 m), Buenavista del Norte (polígono del
Cabildo), junto a Los Silos (711 m al elemento más cercano)— y se avisa
explícitamente de que son dos sitios con el mismo nombre. Los tags de senderismo
se van con el sendero que no consta en ninguna parte.

**Si quieres una descripción completa de la Montaña de Taco, hace falta una
fuente.**

> **28 de septiembre, por la tarde: llegó la fuente.** Jerome mandó el artículo
> de Wikipedia «Montaña de Taco (embalse)». Ver más abajo.



### Y dos detalles

- **`playa-caleton-sauzal`** conserva el id, que es opaco y cambiarlo arrastraría
  referencias por todo el repositorio. El `alias` mantiene «El Sauzal» para que
  quien la busque así la siga encontrando.
- **`pp-el-tanque`** conserva el nombre «Despegue El Tanque», que es como lo
  llaman los pilotos, y ahora el texto lo dice: el despegue está en Tierra del
  Trigo, término de Los Silos.

---

## Aplicado · 13 · `escal-guaria` (28 de septiembre, noche)

**El texto tenía razón y el pin estaba a 6,9 km.** Es el caso contrario al que yo
suponía cuando la puse en el grupo D.

Jerome mandó la ficha de **theCrag** de la escuela «Guaria» y la información de
acceso. Las tres coordenadas que trae caen todas en **Guía de Isora**, y no de
milagro: a más de 3 km de la raya por dentro.

| | coordenada | polígono | a la raya de Guía de Isora |
|---|---|---|---|
| el pin viejo | `28.145, -16.717` | **Adeje** | 3.600 m (por fuera) |
| las paredes | `28.19667, -16.75611` | **Guía de Isora** | 3.162 m (por dentro) |
| inicio del sendero | `28.197601, -16.760102` | **Guía de Isora** | 3.276 m |
| aparcamiento de Acojeja | `28.196091, -16.763203` | **Guía de Isora** | 3.152 m |

**El pin va a las paredes**, que es lo que la ficha describe. Se mueve **6.907 m**.
El aparcamiento y el inicio del sendero quedan apuntados en el registro, en
`coordenada_de_zona`.

Y OSM lo corrobora desde otro lado: la **«Montaña de Tejina»** (peak) está a
848 m del punto nuevo, en Guía de Isora, y todo lo que hay en 1,5 km alrededor es
de Guía de Isora.

### Por qué no lo vi

Escribí que «Guaría no existe en OSM en toda la isla». Era cierto y **no servía
de nada**: el paquete de Geofabrik tiene **cero elementos de escalada en toda
Tenerife**. Su silencio no probaba nada, igual que con la Farola. Lo que sí
debería haberme hecho dudar es que el pin tuviera tres decimales y estuviera
declarado como rótulo: un rótulo mal puesto no se nota.

### Lo que la ficha cuenta ahora

Todo de theCrag y de lo que mandó Jerome:

- **Más de 130 vías** en seis sectores: Entrada, Peter Punk, Comando 25, Utah,
  Big Wall y Tralla.
- Roca volcánica, **las líneas más largas de la isla**, muchas por encima de los
  **35 m**. Nivel medio-alto: **hay poco por debajo de 6a**.
- **PERMISO OBLIGATORIO del Cabildo**, por internet, con **cupo diario de 70
  personas**. Antes la ficha decía «código QR in situ», que no es como se pide.
- **De febrero a junio se cierran vías** por la nidificación del **halcón
  tagarote**.
- Orientación sur y sol todo el día: mejor madrugar.
- **Se aparca en Acojeja sin bloquear portones ni accesos a las fincas** —la
  relación con los vecinos es delicada— y se sube a pie entre 15 y 30 minutos.

Fuera el rango «5c-8a», que theCrag contradice: su histograma va de 4a a 8c.

En los 10 idiomas.

---

## El bloque 4 queda cerrado

**0 fichas con el municipio fuera de sitio.** De las 16 del principio: 3 eran
fallo de mi control, 12 se corrigieron y 1 se dio de baja.

---

## Aplicado · `montana-taco`, con la fuente que faltaba (28 de septiembre)

Wikipedia en español, «Montaña de Taco (embalse)». Con eso la ficha deja de tener
una descripción mínima y pasa a contar lo que de verdad es.

**La coordenada**, que el artículo publica: `28°22'26"N 16°50'01"O` →
**`28.373889, -16.833611`**. Se mueve 15 m. Y confirma de paso lo que dice el
texto del artículo: **el punto cae a 0 m de la raya de Los Silos**. Está
literalmente en el límite, como dice Wikipedia — «entre los límites de los
municipios de Buenavista del Norte y Los Silos»—. El polígono lo asigna a
Buenavista del Norte, que es lo que lleva la ficha.

**Lo que ahora cuenta la ficha**, todo del artículo:

- Es un **volcán extinto** entre Buenavista del Norte y Los Silos.
- En el cráter de su cono hay un **embalse**. La montaña fue **cantera de picón**
  y entre **1983 y 1985** se convirtió en balsa: la **primera y la mayor** del
  Plan de Balsas del Norte de Tenerife.
- **821.700 m³**, **13,7 m** de profundidad máxima, **6,49 hectáreas** de lámina
  de agua.
- **El acceso está parcialmente restringido**: sólo lo tiene autorizado el
  personal de mantenimiento. Esto es lo más importante para quien use la app: es
  una ficha de un sitio al que no se puede subir sin más.
- Y se mantiene el aviso de que no es el barrio de Taco de La Laguna.

`cat` pasa a «Volcán y Embalse · Buenavista del Norte» y los tags recogen
**Cráter**, **Embalse**, **Los Silos** y **Acceso Restringido**. «Embalse» y
«Acceso Restringido» son etiquetas nuevas: van con su fila en los nueve
glosarios, insertadas en su sitio para no reordenar el fichero entero.

En los 10 idiomas.
