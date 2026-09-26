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
| A | el punto está bien, **lo que miente es el texto** | 4 | ✅ `municipios-bloque1-A` |
| B | el punto o el texto, según la ficha | 3 | ✅ `municipios-bloque1-B` |
| C | la ficha **se contradice a sí misma** | 3 | ✅ `municipios-bloque1-C` |

**Las diez, cerradas.** El control pasa de **10 hallazgos a 0**: cero
contradicciones y cero municipios fuera de sitio en firme. El área
`municipio_de_cada_ficha` del registro queda en **cerrado**, con su techo
escrito: no se vuelve a preguntar.

Quedan dos cosas menores, al final de este documento.

---

## Cómo se cerró cada una

Los tres parches traían su hash canónico y los tres coincidieron antes de
tocar nada: `594fa5ed…`, `cf3094e6…` y `30ff04bd…`.

Lo aplicado se apunta en `datos/verificado.json`, sección
`municipio_por_raya`, con la fuente de cada ficha, y se vuelve a comprobar
solo en cada auditoría: `python3 tools/municipio_raya.py`.

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

## Grupo B · HECHO (3)

Parche `municipios-bloque1-B`, hash `cf3094e6…` comprobado antes de tocar nada.

| id | antes | después | se mueve | método |
|---|---|---|---|---|
| `ar-la-quebrada` | `28.501, -16.323` | `28.532070, -16.300711` | **4.068 m** | fija (Tenerife ON, Cabildo) |
| `mercadillo-la-victoria` | `28.448, -16.4579` | `28.433028, -16.471258` | **2.109 m** | **derivado** |
| `cavis-violencia-sexual-tenerife` | `28.4708, -16.2885` | *no se mueve* | 0 m | portal **no verificado** |

### La CAVIS la tenías tú bien y yo mal

La puse en el grupo B —«el municipio está bien y miente el punto»— y era al
revés: la dirección de calle Franco de Medina 41 está en **La Cuesta, San
Cristóbal de La Laguna**, así que el punto era coherente y lo que mentía era el
texto. **Mover el pin a Santa Cruz habría mandado a las víctimas al sitio
equivocado.** Corregido: texto nuevo en los diez idiomas, con las tres sedes y
los seis teléfonos oficiales, y el pin donde estaba.

El pin no se ha podido geocodificar: la regla pedía CartoCiudad (IGN) o OSM y
desde aquí los dos dan `000`. Se aplicó la última rama de tu propia regla —el
pin se queda si el municipio del punto actual es La Laguna—, y lo es: de las 14
paradas más cercanas **ninguna** tiene una raya municipal en medio y la primera
está a 72 m. Queda apuntado como **portal no verificado**: el municipio está
probado, el número 41 de la calle no.

### El mercadillo: los tres pasos, resueltos sin Overpass

Overpass está cerrado desde aquí, pero **el dato de OSM que pedías ya está en
el repositorio**. Los tres pasos se resolvieron contra él con
`tools/osm_cerca.py`, que es nuevo:

| paso | qué pedía | qué salió |
|---|---|---|
| 1 | «Casa de la Castaña», exactamente 1 | **1**: museo en `28.432695, -16.471387` |
| 2 | `amenity=marketplace` a 250 m | **0** — y **15** en toda la isla, así que el extracto no los está filtrando: OSM no tiene el mercadillo |
| 3 | `terrero\|lucha` a 400 m, exactamente 1 | **1**: Terrero Municipal de Lucha y Deportes, `28.433360, -16.471129`, a **78 m** de C (≤ 250) |

Punto medio de los dos: `28.433028, -16.471258`. **Método derivado**, apuntado
como tal en `datos/verificado.json`: si aparece la coordenada publicada, se
cambia.

Y el punto nuevo da **La Victoria de Acentejo**: 6 paradas sin raya en medio,
todas de La Victoria, y las 8 de La Matanza y Santa Úrsula cortadas por una
raya. El viejo estaba a 15 m de `ciudad-matanza`, como decías: era la
coordenada del casco de La Matanza copiada.

### La Quebrada

La coordenada del Cabildo da **Tegueste**, como pedías. De las 14 paradas más
cercanas **solo una** no tiene raya municipal en medio: «Cruce el Moquinal»
(Tegueste) a 380 m — el mismo cruce que nombra la ficha oficial. Las 13 de La
Laguna están todas al otro lado de una raya. Quitado «Muy tranquila» en los
diez idiomas.

> ⚠️ **Una cosa que dejo sin tocar y que hay que decidir:** la ficha conserva
> la etiqueta **«Tranquila»**. El parche no lista `tags` para esta ficha y no
> me invento lo que no pides, pero contradice lo que acabamos de quitar. ¿La
> borro?

### Lo que el parche no traía, y dos cosas que traía mal

**Venía en 8 idiomas y la app tiene 10.** Escritos el búlgaro y el polaco de
los textos nuevos de la CAVIS —con los seis teléfonos, el 112 y el 016,
comprobado uno a uno— y del recorte de La Quebrada.

Y al pasar la auditoría saltaron **siete idiomas en rojo**, los dos por culpa
del texto del parche:

1. **El `cat` de la CAVIS venía con dos trozos y el castellano tiene tres.**
   «Violences Sexuelles · La Laguna» frente a «Violencia Sexual · Atención · La
   Laguna». La app parte el `cat` por el punto volado y enseña los trozos, así
   que a seis idiomas les faltaba uno. Recuperado el del medio, que la ficha ya
   tenía: *Accueil · Beratung · Assistenza · Hulp · 服务 · 服務*.
2. **El «24» de «Las 24 horas» no cuadraba en cinco idiomas.** En francés e
   italiano salía dos veces («24 h/24», «24 ore su 24») y en alemán, búlgaro y
   polaco ninguna («Rund um die Uhr», «Денонощно», «Całodobowo»). El control
   exige las mismas cifras que el castellano, y tiene razón: una cifra que está
   en una lengua y no en otra es información perdida. Reescritas las cinco para
   que el 24 salga una vez y siga sonando natural.

Después de las dos correcciones, los diez idiomas dan **0 hallazgos**.

---

## Grupo C · HECHO (3)

Parche `municipios-bloque1-C`, hash `30ff04bd…`. **Ningún pin se movió**: en
las tres, la elección confirma lo que el punto ya decía.

| id | elección | pin | campos cambiados |
|---|---|---|---|
| `casa-capitanes-generales` | **La Laguna** | igual | `desc` ×10, `cat` ×10, etiquetas |
| `rcg-tenerife` | **Tacoronte** | igual | `desc` ×10, `cat` ×10, etiquetas |
| `guachinche-cordero` | **San Miguel de Abona** | igual | `desc` ×10, `cat` ×10, etiquetas |

### C1 · La Casa de los Capitanes, y una confirmación que no esperaba

El nombre y el punto eran de La Laguna y la descripción hablaba de otro
edificio —Plaza de la Candelaria, 1741-1750, Ayuntamiento de Santa Cruz—.
Sustituida entera con los datos del Ayuntamiento de La Laguna: los seis
Capitanes Generales entre 1705 y 1723, Diego de Alvarado-Bracamonte, la
fachada a la Plaza del Adelantado y el BIC de 1981.

El paso de afinado pedía Overpass con `name~"Capitanes"`. En el OSM del
repositorio **no hay ningún elemento así a 200 m** — pero **sí está el
edificio, con su otro nombre**: «Casa de Alvarado-Bracamonte» (*manor*), a
**23 m** del pin. Por debajo de los 40 m que pedía tu regla, así que el pin se
queda igual; y de paso confirma que está donde tiene que estar. Es el mismo
nombre que abre la descripción nueva.

### C2 · El club está en Tacoronte y el pin también

La regla decía: si el polígono da La Laguna, geocodificar la dirección del
club. **No hizo falta**: el punto ya da Tacoronte —5 paradas sin raya en medio,
todas de Tacoronte, y 9 cortadas por una raya—, así que esa rama no llegó a
aplicarse. «San Lázaro (La Laguna)» fuera de los diez idiomas, y dentro los
600 m de altitud.

### C3 · El guachinche, y la contradicción que llevaba dentro

El punto está en San Miguel de Abona con margen: 13 de las 14 paradas más
cercanas sin raya en medio, **todas** de San Miguel, la primera «Catú» a 116 m,
y la raya a 988 m. Fuera «Arona».

Y fuera también lo que se contradecía o caduca, como pedías: decía **abierto
todos los días y a la vez «solo fines de semana»**; fuera el horario, fuera la
nota con el número de reseñas, y fuera la cabra guisada y el vino propio, que
la web del restaurante no menciona. Los platos son ahora los suyos: carnes a la
brasa, papas arrugadas, mojo y queso asado. El teléfono se queda.

### Lo que el parche no traía, y tres cosas que traía mal

1. **Venía en 8 idiomas y la app tiene 10.** Escritos el búlgaro y el polaco de
   los tres textos nuevos.
2. **El `cat` de la Casa de los Capitanes venía corto en seis idiomas**: 3 o 4
   trozos donde el castellano tiene 5. Completados con el trozo que la ficha ya
   tenía (*Mairie · Rathaus · Municipio · Gemeentehuis · 市政厅 · 市政廳*).
3. **El fragmento francés de `rcg-tenerife` no existía tal cual.** Pedía
   sustituir «Entouré d'arbres indigènes.» y lo que hay es «Situé à San Lázaro
   (La Laguna), entouré d'un bois d'arbres indigènes.». Aplicado el mismo
   cambio sobre la frase de verdad.
4. **El siglo.** Escribí «seventeenth / siebzehnten / zeventiende / 十七» para
   evitar una cifra que el castellano no tiene… y me equivoqué: el control
   **convierte «XVII» a 17**, así que el que se quedaba sin el dato era el
   idioma. Devueltos a «17th century», «17. Jahrhunderts», «17e eeuw» y
   «17世纪». El búlgaro y el polaco llevan el número romano, que también
   cuenta.

Y un efecto de rebote que conviene saber: el `cat` castellano terminaba en
«Ayuntamiento», y de ahí el control de etiquetas sacaba que «Ayuntamiento» era
un nombre de sitio. Al cambiarlo por «Alcaldía», esa etiqueta se quedó sin
respaldo en otra ficha. Traducida a los nueve idiomas, junto con «Patrimonio de
la Humanidad»; «Plaza del Adelantado» y «Alvarado-Bracamonte» quedan declaradas
como nombre propio.

---

## La verificación del bloque entero

Antes de pasar al siguiente, se repasó el bloque completo, no solo lo que
tocaban los parches. **Salió un fallo gordo que ningún control miraba.**

### El polaco tenía una fuente detrás, y se había quedado atrás

El polaco es el único idioma que se escribió por bloques: `idiomas/pl-lugares/`
(9 ficheros) se juntan con `node tools/lugares_idioma.js montar pl` y **vuelcan
`idiomas/pl.json`**. O sea: no es una copia de consulta, es la **fuente**.

Todas las correcciones de polaco de este mes se hicieron tocando solo
`pl.json`. La fuente se quedó con el texto viejo, así que **el día que alguien
volviera a montar el polaco, todo eso volvía atrás**: Tabaiba y Radazul otra
vez en Santa Cruz, el mirador otra vez en Santiago del Teide, la CAVIS otra vez
en Santa Cruz. Y en silencio, porque la app no falla cuando un texto es
correcto pero viejo.

Eran **21 campos de 12 fichas** —16 de este bloque y 5 de antes
(`charco-verde-guancha`, `ciudad-rosario`, `ciudad-tegueste`,
`nucleo-la-ranilla`)— y una ficha entera que no estaba, `playa-fajana-realejos`.
Sincronizada la fuente y comprobado que montar el polaco ahora da exactamente
el mismo `pl.json`.

Control nuevo, `tools/auditar_fuente_pl.js`, probado volviendo a meter el
fallo: con la fuente desfasada canta el campo y el bloque donde está.

### Lo demás que se comprobó, ficha por ficha

| qué | resultado |
|---|---|
| El municipio descartado, en **todos** los ficheros que nombran la ficha (index.html, los 9 idiomas, la fuente del polaco) | **0 restos** |
| Referencias a los 10 ids fuera de su ficha (planificador, listas) | **1 aparición cada uno**: solo su ficha, ninguna referencia rota |
| La base del asistente | ninguna de las 10 aparece con su municipio viejo |
| Las 2 coordenadas movidas, ¿crean un duplicado? | no: el vecino más cercano queda a 763 m y a 114 m |
| ¿Siguen en tierra? | sí; las 6 del agua son las de siempre |
| `ar-la-quebrada`, ¿sigue en Anaga como dice su texto? | sí: sus vecinos a menos de 900 m son los senderos PR-TF 11 y PR-TF 10 de Cruz del Carmen |
| `mercadillo-la-victoria`, ¿cae en el pueblo? | sí: `ciudad-victoria` a 114 m |
| Los diez idiomas | 0 hallazgos en los diez |
| Cirílico | 0 variantes sospechosas |

### Y dos cifras que se escribían a mano

- `REVISION-LUGARES.md` llevaba la fecha **escrita**: decía «21 de septiembre»
  con el contenido ya cambiado. Ahora la calcula al generarse.
- El registro guardaba a mano «130 verificadas» y «55 a ojo» del área
  `coordenadas`. Ya eran **132** y **54**. Esas cifras salen fuera del registro:
  las cuenta el informe al generarse.

---

## Lo que queda de este bloque

Nada que dependa de ti. La etiqueta «Tranquila» de `ar-la-quebrada` ya está
borrada: contradecía el «Muy tranquila» que el parche B quitó del texto en los
diez idiomas. Las otras **10 fichas** que usan esa etiqueta la conservan, así
que la fila del glosario sigue en uso.

Sigue abierto, como aviso y sin suspender, lo de siempre: **las 5 fichas en el
borde municipal**. En un límite las paradas se mezclan y un control que canta
en cada borde se acaba ignorando. Son `mir-la-corona-guimar`,
`mir-lomo-molino`, `montana-taco`, `playa-caleton-sauzal` y
`pr-tf-52-monte-agua`. Con la herramienta afinada, dos ya tienen respuesta
—`montana-taco` da Buenavista del Norte diciendo La Laguna, y
`playa-caleton-sauzal` da La Matanza diciendo El Sauzal— y las otras tres no se
pueden cerrar desde aquí. Si quieres, son la tanda siguiente.

---

## Los bloques que vienen detrás, por orden

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

*Las cifras de este documento salen de `node tools/auditar_municipio.js` y
`python3 tools/municipio_raya.py`, que entran en `tools/auditar.sh`. Ninguna
está escrita a mano.*
