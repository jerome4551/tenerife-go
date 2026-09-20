# Planificador de día · decidido y pendiente

**20 de septiembre de 2026.** Las 16 referencias rotas de `suggestionIds` están
resueltas con tus decisiones, más dos faros del sur que estaban en la lista del
norte. Las tres zonas ofrecen **exactamente lo que listan**.

```
        antes          ahora
norte   80 de 91  ->   77 de 77
sur     63 de 67  ->   64 de 64
cumbre  20 de 21  ->   21 de 21
```

**Ninguno de los 16 ids existió jamás como ficha**: `git log -S` sobre todo el
historial de `index.html` no encuentra ni uno. Se escribieron mal el día que se
creó la lista. No había nada que restaurar.

---

## 1 · Cerrado con tu decisión

| id | zona | qué se ha hecho |
|---|---|---|
| `santiago-teide` | norte | **quitado, sin sustituto** |
| `buenavista` | centro | **quitado, sin sustituto** |
| `guachinche` | norte | **quitado** |
| `fajana` | norte | **quitado**, y anotado abajo como candidata a alta |
| `farola-mar-santa-cruz` | norte | **quitado**, con la regla que diste escrita abajo |
| `faro-rasca` | norte | **quitado del norte**, sigue en el sur |
| `faro-abona` | norte | **quitado del norte**, sigue en el sur |

Y de la tanda anterior, ya aplicadas: diez quitadas sin perder nada (la zona ya
ofrecía el sitio con otro id) y una cambiada, `los-cristianos` →
`nucleo-los-cristianos`.

**Tu regla del patrón, comprobada.** Dijiste que las listas usan `ciudad-*`
para las cabeceras municipales y `nucleo-*` solo para núcleos que no lo son.
Se cumple: los **30** `ciudad-*` son cabeceras, y de los **41** `nucleo-*`,
**25** son núcleos que no son cabecera (Bajamar, Los Cristianos, Taganana, San
Andrés, La Caleta, Las Galletas…). Los otros 16 son el duplicado del que
hablas. Con dos excepciones que salen abajo.

**Los dos faros, confirmado por la coordenada:** `faro-rasca` está en
28.0012, −16.6943 (Punta de la Rasca, Arona) y `faro-abona` en
28.148, −16.4272 (Arico). Los dos estaban en las **dos** listas.

## 2 · `farola-mar-santa-cruz` · la regla, corregida

Tenías razón y yo lo dije mal: **el parche «auditoria-mar-8» no crea ese id**.
Conserva `faro-santa-cruz-puerto` y solo le cambia el `name`, los textos y la
coordenada. Así que la referencia no vuelve sola. Lo que hay que hacer cuando
se resuelva esa ficha:

- **Si sale APLICADA** → poner **`faro-santa-cruz-puerto`** en la lista norte,
  en el sitio donde estaba la rota.
- **Si queda PENDIENTE** → no poner nada, que es lo que hay ahora. Sugerir la
  ficha vieja sería mandar a alguien a un pin que está **444 m mar adentro**.

Hoy `faro-santa-cruz-puerto` **no está en ninguna de las tres listas**, que es
lo correcto mientras siga pendiente.

## 3 · Candidata a alta: Playa de la Fajana (Los Realejos)

Quitada de la lista y anotada aquí. Lo que hay:

- **Existe**, pero **no tiene ficha** en la app. Buscado «fajana» en los 803
  ids, los 803 nombres, los alias y las descripciones: cero resultados.
- **No entra hasta tener coordenada de fuente oficial** — Censo de aguas de
  baño, Ayuntamiento de Los Realejos o Turismo de Tenerife. Aquí no se
  inventan.
- **Que no se confunda con La Fajana de Barlovento**, que es un complejo de
  tres piscinas naturales en el noreste de **La Palma**. Otro sitio y otra
  isla.

## 4 · A revisar en otra tanda, sin tocar: `charco-verde-realejos`

No se ha tocado, como dijiste. Lo que se ve desde aquí:

- Su coordenada es **28.3963, −16.659**, y su `cat` dice «Piscina Natural ·
  Los Realejos».
- Ese punto cae **a poco más de 1 km al oeste del casco de San Juan de la
  Rambla**, o sea en otro municipio.
- El control de costa lo mide a **297 m de la orilla**, tierra adentro, que
  para una piscina natural ya es raro de por sí.

## 5 · La tanda de los duplicados · HECHA

Confirmado y con una corrección al alza: **eran 17 pares, no 16**. El
decimoséptimo no salía por nombre —`ciudad-vilaflor` se llama «Vilaflor de
Chasna» y `nucleo-vilaflor` «Vilaflor»— sino midiendo la distancia, que era
**0 m**.

**Borrados los 17 `nucleo-*`.** Se queda el `ciudad-*`, que es la versión
buena: texto más largo en 16 de los 17 y más etiquetas.

| cabecera | se queda | borrado |
|---|---|---|
| Arafo | `ciudad-arafo` | ~~`nucleo-arafo`~~ |
| Arico | `ciudad-arico` | ~~`nucleo-arico`~~ |
| Buenavista del Norte | `ciudad-buenavista` | ~~`nucleo-buenavista`~~ |
| El Rosario | `ciudad-rosario` | ~~`nucleo-el-rosario`~~ |
| El Sauzal | `ciudad-sauzal` | ~~`nucleo-el-sauzal`~~ |
| El Tanque | `ciudad-tanque` | ~~`nucleo-el-tanque`~~ |
| Fasnia | `ciudad-fasnia` | ~~`nucleo-fasnia`~~ |
| Granadilla de Abona | `ciudad-granadilla` | ~~`nucleo-granadilla`~~ |
| La Guancha | `ciudad-guancha` | ~~`nucleo-la-guancha`~~ |
| La Matanza de Acentejo | `ciudad-matanza` | ~~`nucleo-la-matanza`~~ |
| La Victoria de Acentejo | `ciudad-victoria` | ~~`nucleo-la-victoria`~~ |
| Los Silos | `ciudad-silos` | ~~`nucleo-los-silos`~~ |
| San Juan de la Rambla | `ciudad-san-juan-rambla` | ~~`nucleo-san-juan-rambla`~~ |
| Santa Úrsula | `ciudad-santa-ursula` | ~~`nucleo-santa-ursula`~~ |
| Santiago del Teide | `ciudad-santiago-teide` | ~~`nucleo-santiago-teide`~~ |
| Tegueste | `ciudad-tegueste` | ~~`nucleo-tegueste`~~ |
| Vilaflor | `ciudad-vilaflor` | ~~`nucleo-vilaflor`~~ |

**786 lugares**, los nueve `idiomas/*.json` a 786, paridad exacta, 0 ids
huérfanos. Probado en el navegador: los 17 pueblos salen **una sola vez** y
los 17 se siguen encontrando buscándolos.

### No era sólo deduplicar: la tanda borrada tenía errores

| ficha borrada | decía | dice la que se queda |
|---|---|---|
| `nucleo-la-victoria` | «los guanches derrotaron **definitivamente** a los conquistadores en 1495» | «donde **los conquistadores se vengaron** en 1495» |
| `nucleo-la-matanza` | vinos «**DO Ycoden-Daute-Isora**» | comarca de guachinches (La Matanza es DO Tacoronte-Acentejo) |
| `nucleo-los-silos` | «festival de **teatro callejero**» | «Festival del **Cuento** Internacional en diciembre» |

El de La Victoria se contradecía con la propia app: `ciudad-matanza` dice que
los guanches ganaron en 1494 y `ciudad-victoria` que los conquistadores se
desquitaron en 1495 —que es la pareja coherente, y la histórica—. La ficha
borrada decía lo contrario del mismo año.

### Lo que sí se ha perdido, por si lo quieres recuperar

Datos que estaban sólo en la ficha borrada. Si quieres alguno, dímelo y lo
añado al texto de la que se queda, en los diez idiomas:

| dato | estaba en |
|---|---|
| Radazul y su puerto deportivo | `nucleo-el-rosario` |
| el barrio de Charco del Pino | `nucleo-granadilla` |
| las fiestas del Carmen | `nucleo-arafo` |
| el parapente | `nucleo-arico` |
| los aguacates y las flores tropicales | `nucleo-santa-ursula` |
| la iglesia de San Juan Bautista, del XVI | `nucleo-san-juan-rambla` |
| el mar de nubes y las aguas minerales | `nucleo-vilaflor` |
| a 15 min de La Laguna | `nucleo-tegueste` |

### Las referencias: ninguna, salvo dos comentarios

No estaban en ningún `suggestionIds` ni en ninguna tabla. Sólo aparecían en
**dos comentarios** que documentan de dónde salió la coordenada de una parada
de TITSA. Como el par estaba a 0 m, se reapuntaron al gemelo y el comentario
sigue siendo cierto.

### El fallo que casi cuela

El primer borrado se llevó **18** fichas, no 17. El script buscaba el final de
cada objeto con la línea en blanco que lo separa del siguiente, y
`nucleo-torviscas` va **pegada** a `nucleo-vilaflor` sin línea entre las dos.
Se vio porque `places[]` quedó en 785 y los nueve `idiomas/*.json` en 786.
Ahora el final del objeto es lo que llegue primero —la línea en blanco o el
principio de la ficha siguiente— y **el script se niega a escribir si el número
de fichas que desaparecen no es exactamente el que se pidió**.

### Queda de esa misma familia

- **Guía de Isora es cabecera y sólo existe como `nucleo-guia-isora`.** Por eso
  hay 30 `ciudad-*` y no 31. Rompe tu regla por el otro lado.
- **`nucleo-puerto-cruz-old`**, con sufijo `-old`, a 69 m de
  `ciudad-puerto-cruz`. Se llama «La Ranilla (Puerto Cruz)», que es un barrio
  real, pero el sufijo canta.

## 5b · La búsqueda no ignora las tildes

Salió comprobando lo anterior: **«santa ursula» sin tilde no encuentra nada**.
`updateSearchSuggestions` hace `p.name.toLowerCase().includes(query)` sin
plegar acentos.

**226 de las 786 fichas son invisibles si escribes sin tilde**: El Médano,
Playa de las Américas, Chío, Fañabé, Roques de García, Güímar… Sólo 7 se
salvan porque tienen un alias sin tildes.

La app está en diez idiomas y buena parte de quien la usa teclea en un móvil
extranjero, sin tildes. **No lo he tocado** —cambia el comportamiento de la
búsqueda y merece su propia tanda— pero es de las cosas más gordas que quedan.

## 6 · Dos controles nuevos, los dos inventario

Ninguno suspende. Salen impresos cada vez para que no sean un silencio.

**Rótulos repetidos dentro de una zona** — dos fichas con el mismo nombre se
leen como un duplicado en el catálogo:

| zona | rótulo | las dos fichas |
|---|---|---|
| norte | «Mesa del Mar» | `mesa-mar` (piscinas) · `nucleo-mesa-mar` (municipio) |
| sur | «Playa San Juan» | `san-juan` (playa) · `nucleo-playa-san-juan` (municipio) |

**Sitios ofrecidos en más de una zona** — de aquí salieron los dos faros del
sur que estaban en el norte, y Masca, que estaba en el norte y en el sur.
Quedan **8**, y las ocho son a propósito:

```
masca                   south + cumbre  ┐
mirador-maska           south + cumbre  │ el circuito MASCA-TEIDE,
ruta-masca-playa        south + cumbre  │ que es una excursion
acantilados-gigantes    south + cumbre  │ de un dia de verdad
riscos-chio             south + cumbre  │
ciudad-santiago-teide   south + cumbre  ┘
ciudad-vilaflor         south + cumbre    1.400 m, puerta sur del parque
ciudad-rosario          north + cumbre    su ficha dice «Cumbre Dorsal»
```

### Masca, resuelta

**Estaba en norte y sur, y el norte era el error.** No había que elegir: en la
costa oeste las listas tienen una costura clara y Masca cae por debajo.

```
lat      ficha                    zona           su propia cat
28.374   montana-taco             norte          Volcán · La Laguna
28.3718  ciudad-buenavista        norte          Isla Baja · Teno
28.371   charco-diablo            norte          Piscinas · Buenavista
28.3655  ciudad-silos             norte          Pueblo · Isla Baja
28.3421  faro-teno                norte          Buenavista del Norte
───────────────────── la costura ─────────────────────
28.306   mirador-maska            sur + cumbre   Mirador · Teno
28.3054  masca                    ← estaba en norte y sur
28.2974  ciudad-santiago-teide    sur + cumbre   Pueblo de Montaña · Oeste
28.2947  ruta-masca-playa         sur + cumbre   Barranco · Masca
28.2744  acantilados-gigantes     sur + cumbre   Acantilados · Oeste
28.2456  nucleo-los-gigantes      sur            Puerto · Oeste
```

Su mirador está a **70 m**, su barranco y su propio municipio están en el sur.
Masca era la única ficha del sitio que además estaba en el norte. **Fuera del
norte** — y ahora también en cumbre, con el circuito.

### Y aquí me equivoqué: la zona Cumbre no es solo el parque

Quité `acantilados-gigantes`, `mirador-maska` y `ruta-masca-playa` de la zona
Cumbre razonando que un acantilado que se ve desde un barco no es cumbre.
Estaba mirando la geografía y no la excursión: **el circuito Masca–Teide
existe**, es una salida de un día real, y esas tres son su tramo de bajada.
Devueltas.

Y de paso entró **`masca`**, que nunca había estado: la lista ofrecía el
mirador del pueblo y su barranco, pero no el pueblo. La cumbre pasa de 17 a
**21**, con el racimo en el orden en que se recorre —pueblo, mirador,
barranco, acantilados—.

**El porqué está escrito dentro del control**, en `auditar_datos.js`, para que
no vuelva a pasar: las seis fichas del circuito aparecen ahí nombradas, con la
nota de que ya se quitaron una vez por no saberlo y hubo que devolverlas.
