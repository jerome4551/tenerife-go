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

## 5b · Las tildes · HECHO

Ahora **sirven las dos formas**. Se pliegan los acentos en los dos lados, lo
tecleado y el texto, en los tres filtros de lugares, en el buscador de líneas
y en el de paradas. Quien escribe «el medano» encuentra, y quien escribe «El
Médano» también.

Probado en el navegador, 14 casos, con y sin tilde: El Médano, Santa Úrsula,
Américas, Güímar, Fañabé, García, Chío. Los 14 bien, y el `<mark>` amarillo
cae encima de la palabra con su tilde puesta.

**Lo que casi rompe el resaltado.** El idioma habitual para quitar acentos es
`normalize('NFD').replace(/\p{M}/gu,'')`, y `\p{M}` se lleva también el
selector de variación de los emoji (U+FE0F), que **cambia el largo** de la
cadena. El resaltado busca sobre el texto plegado y corta sobre el original,
así que necesita que los índices coincidan. Con `\p{M}`, 38 cadenas cambiaban
de largo —«Teléfono de la Esperanza (24h) ☎️», los avisos con ⚠️—. Acotado a
los diacríticos latinos, las **10.798 cadenas del fichero miden lo mismo**.

## 6 · Charco Verde · HECHO, y estaba peor de lo que parecía

Con tus datos:

| | antes | ahora |
|---|---|---|
| municipio | Los Realejos | **La Guancha** |
| coordenada | 28.3963, −16.659 (297 m tierra adentro) | **28.400000, −16.658890** (43 m de la costa) |
| acceso | «acceso fácil y gratuito, muy popular entre familias» | sin carretera, sendero sin señalizar, últimos metros empinados y resbaladizos |

**El municipio lo verifiqué sin creerte a ciegas**: las paradas de TITSA traen
municipio, y de las seis más cercanas al punto **cuatro son de La Guancha**. La
más próxima se llama **«Santa Catalina»**, que es justo el barrio costero desde
donde dices que se aparca.

Lo de «acceso fácil, popular entre familias» era lo más grave: mandaba familias
a un descenso por roca volcánica. Reescrito en los diez idiomas con el acceso
real y el aviso de que el charco sólo renueva el agua con oleaje fuerte.

**Renombrado a `charco-verde-guancha`**, como pediste. Tocó tres sitios en
`index.html` —la ficha, la lista del planificador y `PLAYAS_ORIENTACION`—, los
nueve `idiomas/*.json` y un bloque del polaco; el script se negaba a escribir
si no encontraba exactamente esos tres, que es lo que evita un renombrado a
medias. **Quien lo tuviera en favoritos lo pierde**, que es lo que aceptaste.

## 7 · Playa de La Fajana · DADA DE ALTA

`playa-fajana-realejos`, 28.398211, −16.587652. Verificado: **en tierra, a 4 m
de la costa**, y las **seis** paradas de TITSA más cercanas son de Los Realejos.
Texto en los diez idiomas con lo que diste: playa salvaje de arena negra dentro
del Paisaje Protegido de la Rambla de Castro, célebre por la cascada que cae
directamente sobre la arena.

**Dos cosas que decides tú:**

1. **La orientación.** Puse `ori:'N'`, la de `playa-rambla`, a 614 m en el
   mismo tramo, marcada `deducida` igual que ella. Medirla en el punto exacto
   **no vale**: la costa se curva ahí y salió una dispersión de 154°. `ori`
   alimenta el cálculo de si la playa está resguardada del viento de hoy, así
   que si sabes hacia dónde mira de verdad, dímelo.
2. **El aviso de mar.** No le he puesto `warn:"mar"`, porque eso lo decides tú
   y porque su vecina `playa-rambla` tampoco lo lleva. Una playa salvaje del
   norte con cascada quizá lo merezca: tú dirás.

**Y una advertencia sobre la captura que mandaste.** Esa es **la de La Palma**,
no la de Tenerife. La pantalla dice «Piscina» y la foto son piscinas
rectangulares construidas; lo que tú describes en Los Realejos es una playa
salvaje de arena negra con una cascada. Son sitios distintos, y es justo la
confusión de la que me avisaste tú: La Fajana de Barlovento. **He usado las
coordenadas de tu texto, no las de la captura.**

## 8 · Los ocho datos borrados, verificados uno a uno

Sin red a ninguna fuente —Wikipedia, eldia.es, tenerife.es y webtenerife.com
dan `000`—, así que verifiqué **contra el propio dato de la app**.

| dato | veredicto |
|---|---|
| Radazul y su puerto deportivo | **SÍ** · la app tiene cuatro fichas de Radazul, entre ellas `puerto-radazul` «Puerto Deportivo Radazul». **Añadido a `ciudad-rosario`** |
| a 15 min de La Laguna (Tegueste) | **SÍ en lo esencial** · **12 líneas** de TITSA unen Tegueste con La Laguna, a 4,4 km. El «15 min» exacto no se puede verificar, así que **añadí el hecho y no el número**: «bien conectado con La Laguna en guagua» |
| parapente en Arico | **NO** · la app tiene **seis** despegues de parapente —Taucho, Ifonche, Izaña, La Corona, El Tanque, Güímar— y **ninguno en Arico**. El dato borrado contradecía al propio inventario de la app |
| Charco del Pino con arquitectura colonial | **NO** · no hay ficha de Charco del Pino, y lo de la arquitectura no se puede verificar desde aquí |
| fiestas del Carmen en Arafo | **NO** · no sale en ninguna ficha, y la Virgen del Carmen es patrona de marineros mientras que Arafo no tiene costa |
| aguacates de Santa Úrsula | **NO** · el único sitio de la app que habla de aguacates es `nucleo-valle-guerra`, otro municipio |
| iglesia de San Juan Bautista del XVI | **NO** · la app tiene la de La Orotava y el Castillo de San Juan Bautista, no ésta |
| mar de nubes y aguas de Vilaflor | **NO** · «mar de nubes» sólo sale en dos fichas de La Orotava |

**Dos de ocho.** De los seis que caen, **uno estaba activamente equivocado** y
los otros cinco eran afirmaciones que nadie podía respaldar. Si tienes fuente
para alguno, me la pasas y entra.

## 9 · Puerto de la Cruz · HECHO

`nucleo-puerto-cruz-old` **no duplicaba nada**: es **La Ranilla**, el barrio
pesquero, con contenido propio —casas de colores, tapas de pescado, ambiente
bohemio— a 69 m del centro porque es el barrio de al lado. El `-old` era un
resto. Renombrada a **`nucleo-la-ranilla`**.

Y al mirarla de cerca aparecieron tres cosas de verdad en los textos:

| | antes | ahora |
|---|---|---|
| nombre y categoría | «Puerto **Cruz**», abreviado | **«Puerto de la Cruz»**, entero, en los diez |
| francés y alemán | se dejaban la última frase, «sin masificación turística», que sí estaba en los otros ocho | añadida |
| neerlandés | «Bohemienachtige», compuesto forzado | «Bohemien-achtige» |
| francés, categoría | «Quartier **Pêcheur**» | **«Quartier de Pêcheurs»** |

El búlgaro y los dos chinos ya escribían «Puerto de la Cruz» entero: eran los
seis de alfabeto latino los que lo cortaban.

## 10 · Los diez idiomas, revisados

De las cinco fichas que he tocado en esta tanda —`charco-verde-guancha`,
`playa-fajana-realejos`, `nucleo-la-ranilla`, `ciudad-rosario` y
`ciudad-tegueste`— se han comprobado, en los diez idiomas y en `desc` y `cat`:

- que no estén vacías
- que cada idioma use **su** alfabeto: ni ideogramas fuera del chino, ni
  cirílico fuera del búlgaro, y que el chino y el búlgaro **sí** lo lleven
- espacios dobles y espacios al borde
- que ninguna traducción sea sospechosamente corta respecto al castellano
- que todas acaben en punto
- que el texto esté en NFC
- que las categorías lleven el separador « · »

**Sin un solo fallo.** Y `auditar_idioma.js`, que es el control gordo, da
**0 hallazgos en los diez**.

*(Así se cazó, en la tanda anterior, un carácter chino que se me había colado
dentro del búlgaro de la Fajana: «който пада直 върху пясъка».)*

## 11 · Lo único que sigue pendiente

**Guía de Isora.** Es cabecera municipal y lleva `category:"municipio"` cuando
las otras 30 llevan `"ciudad"`. Por eso hay 30 `ciudad-*` y no 31.

- **Lo barato y sin riesgo**: cambiarle `category` a `"ciudad"`. Una palabra,
  el id no se toca, los favoritos no se rompen.
- **Lo caro**: además reescribir su texto al estilo más rico de las
  `ciudad-*`, que son diez idiomas y necesitaría de dónde sacar lo nuevo. El
  que tiene ahora es correcto, sólo más corto.

Y de antes, sin tocar:

- **La orientación de la Playa de La Fajana.** Puse `N`, deducida de
  `playa-rambla` a 614 m. Si sabes hacia dónde mira de verdad, dímelo.
- **El aviso de mar de la Fajana.** Sin `warn:"mar"`, porque eso lo decides tú
  y su vecina tampoco lo lleva.
- **Las 13 coordenadas redondeadas** y las 8 costeras tierra adentro, que
  `auditar_redondeo.py` lista cada vez.
- **Las 6 coordenadas del parche «auditoria-mar-8»**, que necesitan Overpass.
