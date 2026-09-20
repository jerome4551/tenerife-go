# Coordenadas que faltan

Del parche **auditoria-mar-8** quedan **seis** lugares con el pin en el agua.
Para cada uno hace falta la coordenada de verdad: **aquí no se inventan**.

Cómo mandarlas: cualquier formato vale, pero lo más cómodo es una línea por
sitio con `id lat lng`. Se aplican con

```
python3 tools/fijar_coordenada.py --fichero nuevas.txt
```

que **comprueba cada una antes de escribir** (que el id exista, que caiga
dentro de Tenerife, que **caiga en tierra**, y cuántos metros se mueve) y no
escribe nada si alguna falla.

Para sacar una coordenada en Google Maps: pulsación larga sobre el punto →
aparecen los dos números → el primero es `lat`, el segundo `lng`.

---

## Por qué siguen pendientes

El parche traía la receta para calcular las seis, pero las seis pasan por
**Overpass**, el servicio de consultas de OpenStreetMap, y desde aquí está
**bloqueado por la política de salida** (`403` en los dos endpoints del
parche). El parche lo previó: *«Si te falta un insumo —la costa de la
auditoría, el shapefile municipal del Cabildo o la red—, las fichas que lo
necesitan quedan PENDIENTE.»* Así que no se ha improvisado ninguna.

Hay dos maneras de desatascarlas:

1. **La coordenada a mano**, como hasta ahora: tú la miras y me la pasas.
2. **El volcado de Overpass**: si ejecutas las consultas del parche desde tu
   máquina y me pasas el JSON, el cálculo sale entero de él, sin red.

---

## Las seis

### 1 · `faro-santa-cruz-puerto` — Faro del Puerto de Santa Cruz
- **Ahora**: `28.4789, -16.2289` → **444 m mar adentro**
- **El parche propone**: convertirla en la **Farola del Mar** (el faro
  histórico del Muelle de Enlace) en `28.46935, -16.24581`, con texto nuevo.
- **Por qué no se ha aplicado**: esa coordenada **cae en tierra pero a 1,4 m
  de la costa**, y el propio parche exige **3 m o más** (`margen_tierra_m`).
  Al no pasar el test manda su `si_falla`, que es una consulta a Overpass.
- **Lo que necesito**: o el volcado de Overpass, o un punto de la Farola a
  más de 3 m del borde. *(Ojo: la Farola es un sitio real y bien
  documentado; lo que falla es el margen, no la fuente.)*
- **Además**: el texto del parche viene en **8 idiomas** y la app tiene
  **10**. Ver «El formato del parche» más abajo.

### 2 · `pk-poris-abona` — Aparcamiento Porís de Abona
- **Ahora**: `28.1631, -16.4308` → **82 m mar adentro**
- **El parche propone**: la vía rodada más cercana al ancla
  `28.164247, -16.431573` (ficha oficial de Playa El Porís), a 80 m como
  mucho.
- **Necesita**: Overpass (`highway` alrededor de 150 m).

### 3 · `lidl-puerto-cruz` — Lidl Puerto de la Cruz
- **Ahora**: `28.4200, -16.5450` → **46 m mar adentro**
- **El parche propone**: el Lidl de la Carretera Icod-Santa Cruz, elegido
  entre los candidatos de OSM.
- **Necesita**: Overpass **y** el **shapefile municipal del Cabildo**, que
  tampoco tengo. Dos insumos, ninguno de los dos aquí.

### 4 · `pk-bajamar-piscinas` — Aparcamiento Piscinas Naturales de Bajamar
- **Ahora**: `28.5562, -16.3458` → **28 m mar adentro**
- **El parche propone**: la vía rodada más cercana a las piscinas.
- **El ancla sí cuadra**: `piscinas-bajamar` está en `28.5564, -16.3445`,
  que es **exactamente** lo que el parche esperaba (tolerancia 30 m).
- **Necesita**: Overpass.

### 5 · `whale-watching` — Whale Watching (Puerto Colón)
- **Ahora**: `28.0780, -16.7364` → **23 m mar adentro**
- **El parche propone**: empujarlo a tierra 10 m. Ese cálculo **sí sale sin
  red**: daría `28.077710, -16.736308`, que se mueve 33 m (el límite son 60)
  y cae en tierra.
- **Por qué no se ha aplicado**: el parche le pone además una
  `comprobacion_marina` **obligatoria** —que el punto quede dentro de la
  marina «Colón» de OSM o a 50 m— y eso es Overpass. Sin esa comprobación la
  ficha queda PENDIENTE por su propia regla.

### 6 · `ermita-san-telmo` — Ermita de San Telmo
- **Ahora**: `28.4176, -16.5472` → **19 m mar adentro**
- **El parche propone**: el edificio de la ermita en OSM, contrastado con la
  dirección oficial (calle San Telmo 5), con texto nuevo que quita lo de «el
  barrio de La Ranilla».
- **Necesita**: Overpass.

---

## El formato del parche, para la próxima

El parche pide los textos así:

```
desc:{ es:"…", en:"…", fr:"…", de:"…", it:"…", nl:"…", zh:"…", zht:"…" },
```

Eso era el formato **antiguo**. Hoy:

- `index.html` lleva **solo el castellano** en `desc` y `cat`; los otros
  nueve idiomas viven en `idiomas/<idioma>.json`. Meter los ocho en
  `index.html` no rompería nada, pero **no se vería**: el fichero de idioma
  los pisa al cargar.
- La app tiene **diez** idiomas. Al parche le faltan **búlgaro y polaco**.
  Si se aplicara tal cual, un búlgaro seguiría leyendo la descripción vieja
  del faro que ya no existe.

Cuando llegue la coordenada del faro o de la ermita, el castellano va a
`index.html`, los ocho del parche a sus `idiomas/*.json`, y **el búlgaro y
el polaco los traduzco yo** a partir del castellano, como el resto del
corpus.

---

## Los ocho que están en el agua a propósito

No hace falta tocarlos, pero **dime si prefieres que el pin vaya en el
muelle** en vez de en la dársena. Hoy el control los lista aparte y no los
cuenta como fallo.

| id | se mete | qué es |
|---|---|---|
| `puertito-poris-abona` | 241 m | embarcadero de Porís |
| `puerto-granadilla-comercial` | 216 m | puerto industrial, sin acceso público |
| `puerto-colon-adeje` | 150 m | puerto deportivo de Costa Adeje |
| `puerto-los-cristianos` | 47 m | puerto de ferris |
| `puerto-garachico` | 14 m | puerto de Garachico |
| `puerto-marina-tenerife-sc` | 5 m | Marina Tenerife |
| `piscina-hidalgo-norte` | 3 m | piscina natural |
| `puertito-fasnia` | 1 m | puertito de Fasnia |

---

## Ya corregidas, por si quieres revisarlas

Del parche **auditoria-mar-8**:

| id | de | a | cómo |
|---|---|---|---|
| ~~`montana-colorada`~~ | 28.2215, −16.3869 | **dada de baja** | no hay fuente que la sitúe en Fasnia |
| `windsurf-el-poris` | 28.1540, −16.4160 | **28.152765, −16.432303** | Playa Grande (Turismo de Tenerife) + 8 m a tierra |

De la tanda anterior, con el dato de OpenStreetMap:

| id | de | a |
|---|---|---|
| `golf-del-sur` | 28.0170, −16.5770 | **28.03749, −16.60762** |
| `lidl-santa-cruz` | 28.4500, −16.2600 | **28.45818, −16.25843** |
| `nucleo-los-gigantes` | 28.2475, −16.8422 | **28.24564, −16.84014** |
| `wc-gigantes` | 28.2475, −16.8422 | **28.24564, −16.84014** |
| `nucleo-san-andres` | 28.50291, −16.19195 | **28.50550, −16.19250** |
| `nucleo-costa-adeje` | 28.0910, −16.7450 | **28.08698, −16.73580** |
