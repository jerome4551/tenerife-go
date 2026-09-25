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
| B | el punto o el texto, según la ficha | 3 | ✅ **APLICADO** (parche `municipios-bloque1-B`) |
| C | la ficha **se contradice a sí misma** | 3 | ⏳ falta decidir **cuál de los dos** |

**Quedan 3**, las del grupo C. El control de municipio baja de **10 a 3**.

---

## Cómo mandarme las respuestas

Del grupo C basta con decirme cuál de los dos sitios es.

Si algún día mandas coordenadas, una línea por sitio con `id lat lng`. Se aplican con

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

## Grupo C · Las 3 que quedan

Aquí **no es cuestión de coordenada**: la ficha dice dos cosas distintas, así
que una de las dos está mal sí o sí.

Con la herramienta de las rayas ya sé **en qué municipio cae el punto de cada
una**, y eso reduce mucho lo que te toca a ti: en dos de las tres solo hace
falta que me confirmes que **el pin está en el sitio**, y el resto lo arreglo.

### C1 · `casa-capitanes-generales` — la única que es de verdad una decisión
- **El nombre** dice «Casa de los Capitanes Generales **(La Laguna)**» y el
  punto (`28.4876, -16.3148`) cae **firmemente en La Laguna**: de las 14
  paradas más cercanas, **ninguna** tiene raya en medio, la primera a 116 m
  («Plaza del Adelantado»), y la raya más cercana está a **2.310 m**.
- **La descripción** habla de otro edificio: «Plaza de la **Candelaria** de
  Santa Cruz», «sede del **Ayuntamiento de Santa Cruz de Tenerife**». Y el
  `cat` y las etiquetas dicen Santa Cruz.
- O sea: **nombre y punto apuntan a un edificio y el texto describe otro.**
- **Necesito que elijas**, y el otro lo damos de alta aparte si te interesa:
  - **(a)** el de **La Laguna**, Plaza del Adelantado → hay que **reescribir la
    descripción entera** en los diez idiomas.
  - **(b)** el de **Santa Cruz**, Plaza de la Candelaria → hay que **cambiar el
    nombre y la coordenada**.

### C2 · `rcg-tenerife` — el punto está en Tacoronte
- El nombre dice «(Tacoronte)»; la descripción, el `cat` y las etiquetas dicen
  «San Lázaro (**La Laguna**)».
- **El punto está en Tacoronte**: 5 paradas sin raya en medio, todas de
  Tacoronte (la primera a 262 m), y 9 cortadas por una raya. La raya está a
  551 m. **El que acierta es el nombre**; el texto es el que miente.
- **Solo necesito que me confirmes que el pin está en el club.** Si sí, cambio
  `cat`, descripción y etiquetas a Tacoronte en los diez idiomas y esta se
  cierra.

### C3 · `guachinche-cordero` — el punto está en San Miguel de Abona
- La ficha dice «Arona» en el `cat` y en la dirección: «TF-652 nº 8, El Monte o
  **Guargacho (Arona)**».
- Dije que Guargacho estaba partido y que por eso no lo decidía. **Con las
  rayas ya no hay duda sobre el punto**: 13 de las 14 paradas más cercanas no
  tienen raya en medio y **todas son de San Miguel de Abona** (la primera a
  116 m); la raya está a **988 m**. El pin no está en la raya, está dentro.
- **Solo necesito que me confirmes que el pin está en el guachinche.** Si sí,
  cambio Arona → San Miguel de Abona y esta se cierra. Si el guachinche está
  en otro sitio, mándame dónde.

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
