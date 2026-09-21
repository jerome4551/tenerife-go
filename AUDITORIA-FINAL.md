# Estado del proyecto y auditoría

**20 de septiembre de 2026.** Documento único: dónde está la app, qué se ha
comprobado y qué falta. Sustituye al registro por fechas que había antes, y a
`BLOQUE-2.md` y `COORDENADAS.md`, cuyas listas están cerradas.

Todas las cifras salen de ejecutar la app o barrer el fichero. Ninguna está
recordada. Se vuelven a sacar con lo que hay en `tools/`.

```
index.html   md5 22244b3cdbb92c98b22bfe369b5aef7a
             3.185.352 bytes · 932.564 comprimidos · 37.290 líneas
idiomas/     9 ficheros de lugares · 2.485.833 bytes · 76 a 95 kB comprimidos
             + etiquetas/    · 9 ficheros con los chips del globo
             + privacidad/   · 10 ficheros con la política, 54 claves cada uno
             + glosario-cat/ · 7, y no hacen falta los diez: no se cargan en la
               app, los lee tools/completar_cat.js al construir
             + pl-lugares/ y pl-fuente/ · el polaco por bloques, revisable
faq/         10 ficheros · 69 respuestas del asistente en cada idioma
             el móvil baja solo el suyo
             + fuente/ · los bloques tal y como llegaron, y el bulgaro aparte
```

---

# 1 · Qué hay

| | |
|---|---|
| Lugares | **787**, con descripción y categoría en 10 idiomas |
| Líneas | **183** — las 181 del GTFS de TITSA + L1 y L2 del tranvía |
| Paradas | **6.263** referencias sobre un catálogo de **2.514** marquesinas |
| Idiomas | es · en · fr · de · it · nl · zh · zht · bg · **pl** — los diez terminados |
| Ficheros | **235** versionados (88 en `idiomas/`, 51 en `tools/`, 34 en `vendor/` —con las 21 fuentes—, 29 en `faq/`, 24 en la raíz, 4 en `supabase/`, 3 en `mapa/`, 2 en `.github/`) |
| Descarga | **946 kB** en castellano · **1.052 kB** en el peor caso (búlgaro) · 1.040 kB en polaco. Sale de `python3 tools/peso_descarga.py`, no de la memoria |

## Qué lineas paran en cada marquesina

`TITSA_PARADAS[clave].l` es la lista de líneas que sirven esa parada, sacada de
**todos** los patrones del GTFS. Es lo que leen el buscador y el globo del mapa.

**No se puede deducir de las secuencias**: cada línea guarda un recorrido y
TITSA publica 861 patrones para 181 líneas, así que lo que solo hace una
variante desaparece. Y la unión de los patrones **no se puede escribir en
`paradas`**: si un patrón hace A-B-C y otro A-D-C, el conjunto {A,B,C,D} no
tiene un orden, y `paradas` es un trayecto que usa el planificador. Escribirla
ahí inventaría un recorrido que ninguna guagua hace.

```
paradas visibles en el buscador   2.304 → 2.514
referencias línea-parada          5.827 → 7.348
paradas que ganan alguna línea      787   ·   que pierden: 0
```

## El tranvía, cerrado

La secuencia **no está deducida**: las paradas del CSV de Metropolitano son
vértices de la polilínea que publica la propia empresa, así que el orden se lee
del trazado.

```
L1   21 paradas · 20 son vértice exacto (< 0,5 m) · 12,47 km  (oficial 12,5)
L2    6 paradas ·  6 son vértice exacto           ·  3,42 km  (oficial 3,6)
```

**Padre Anchieta** es la única que no es vértice, y no hay nada que preguntar:
cae **entre los vértices 48 y 49, en un tramo recto de 503 m** por la avenida de
la Trinidad. En un tramo así de largo y recto la polilínea no necesita punto
intermedio, y la parada queda en medio. Está a **4,0 m del eje de la vía**, que
es la separación del andén — el mismo orden que el resto de la red, donde el
peor caso de las guaguas son 61 m y no se discute.

Los 135 m que llegué a escribir eran la distancia **al vértice**, que es la
medida equivocada. Ver la trampa 2.

## El precio: TITSA cobra por kilómetro, no por línea

No hay zonas: **hay tarifa kilométrica**, con un mínimo, y la web oficial pide
línea, parada de origen y parada de destino para calcularla. La consecuencia es
que **ninguna línea interurbana de más de dos paradas tiene un precio único**:
tres paradas ya son tres precios.

La clasificación no se deduce: la da el propio operador en `route_color` de
`routes.txt`.

```
75AD1C  interurbana         125   tarifa kilométrica  → «desde 1,45 €» + enlace
3F8FCF  urbana Santa Cruz    37   tarifa urbana plana → importe único
4F1780  urbana La Laguna     14   tarifa urbana plana → importe único
5C0A8A  lanzadera ULL         4   kilométrica
E83642  la 449                1   kilométrica
```

**130 líneas dicen «desde» y 51 llevan importe plano.** El enlace de cada una va
a su página oficial, donde está la calculadora por origen y destino; la URL sale
del `route_url` del GTFS y se deriva del número, verificada contra las 181.

Dos datos que están en la tarifa y no en el GTFS: los trayectos de más de 20 km
llevan **10 % de descuento en el billete de ida y vuelta** —está en el panel de
pago, en los 8 idiomas— y las líneas **342 y 348 al Teide están excluidas de la
tarjeta ten+**, que va en su `nota`.

## La red, línea por línea

```
tranvía        2      norte     46      sur         52
aeropuerto     6      teide      3      municipal   62
nocturna       8      lanzadera  4
```

**Cobertura del GTFS: 181 de 181.** Ni un número del `routes.txt` oficial falta,
y lo único que la app tiene y el GTFS no son L1 y L2, que son de Metropolitano.

**Las 183 líneas tienen trazado real de carretera** (`via`), sacado de
`shapes.txt` y simplificado con Douglas-Peucker a 12 m: 26.593 puntos. Ninguna
se dibuja ya como recta entre paradas.

```
paradas a más de 200 m de su propio trazado    4 de 6.263
mediana del peor caso por línea               19 m
tranvía                                       L1 4 m · L2 0 m
```

Las cuatro son ramales de un patrón que el shape elegido no recorre —una línea
tiene varios y aquí se dibuja uno—: 449 «Barranco de Ajabo» 605 m, 121 «San
Francisco Javier» 433 m y 010 «Aeropuerto Sur Salidas» 243 m.

**Los 22 saltos de más de 8 km entre paradas seguidas van por carretera real.**
La 343 hace 54 km del aeropuerto Norte al Sur sin parada intermedia y la vía lo
dibuja. Cero tramos dibujados como recta.

## Cómo se construyó

`TITSA_PARADAS` es el catálogo: una entrada por marquesina física, con los
`stop_id` del GTFS agrupados por par ida/vuelta en el campo `s`. Los 3.906
`stop_id` de `stops.txt` tienen su clave. Cada línea guarda `paradas` como lista
de claves y `terminales` como par, y un IIFE los hidrata al arrancar.

La regla del patrón, escrita en el comentario de cada línea regenerada: **el
recorrido con más paradas; empate, el de más viajes**. Choca a propósito con la
trampa 18 de más abajo, así que en las 40 líneas rehechas en agosto se
comprobaron las cabeceras una a una contra la secuencia real antes de aceptarlas.

---

# 2 · Auditoría

## Codificación · limpia

```
NFC puro · 0 U+FFFD · 0 controles · 0 CRLF · 0 tabuladores · 0 subrogados
invisibles: 2 NBSP + 8 ZWJ, todos deliberados
emojis: 2.894, 250 distintos
32 scripts en línea, los 32 compilan · sw.js y enviar-notificacion.js correctos
```

Los 2 NBSP son tipografía francesa (`Un tour rapide ?`) y los 8 ZWJ son la
familia 👨‍👩‍👧.

## La política de privacidad · lo que decía y lo que la app hace

Decía dos cosas que no eran ciertas, en los diez idiomas:

- «No realizamos perfilado, **publicidad** ni cesión de datos a terceros.»
- «No usamos cookies de rastreo **ni de terceros. No hay publicidad**.»

Y la app carga **Google Analytics 4** (`G-5Q3G5RW067`) desde
`googletagmanager.com`, y tiene un **módulo de anuncios** con plan de promoción
mensual. Ninguna de las dos cosas aparecía en «Datos que recogemos».

Comprobado en el navegador antes de escribir una palabra:

```
rechazar → 0 peticiones a Google, nunca. tgo_consent = denied
aceptar  → carga gtag/js. analytics_storage: granted
           ad_storage · ad_user_data · ad_personalization: denied siempre
```

O sea que el consentimiento **sí** está bien hecho: GA no se carga hasta que se
acepta y las señales publicitarias quedan denegadas. Lo que estaba mal era el
texto, que negaba lo que sí pasa y no nombraba a nadie.

La política nueva tiene diez apartados y **54 claves en los diez idiomas, 540
textos**. Lo que se añade: qué recibe Google y cuándo; que la promoción de
negocios existe y que **no usa datos del usuario**; la suscripción de
notificaciones, que se guarda en Supabase y no se mencionaba; y una lista de
los nueve terceros a los que llegan datos, con qué recibe cada uno —el mapa
revela qué zona miras, OSRM recibe origen y destino, Nominatim lo que escribes
al buscar una dirección—.

El texto vive en `idiomas/privacidad/<lang>.json` y lo vuelca
`tools/generar_privacidad.py`. Editarlo suelto dentro de 37.000 líneas de HTML
es como se quedó diciendo que no había publicidad. Los números de apartado van
**fuera** del texto traducido: renumerar no puede obligar a retocar diez
traducciones.

El aviso de cookies decía «estadísticas anónimas». No lo son: Google Analytics
recibe la IP y pone sus propias cookies, así que son seudónimas. Pedir el
consentimiento contando otra cosa es pedirlo mal. Ahora nombra el servicio.

**Dos cosas que no son de redacción y no he tocado:**

1. La política prometía borrar la cuenta «desde Ajustes → Cuenta → Eliminar
   cuenta». **Esa opción no existe**: las únicas apariciones de esa frase en
   todo el fuente son la propia política. El texto nuevo dice la verdad —se
   borra escribiendo—, que es válido, pero el botón sigue sin estar.
2. El formulario «Anúnciate» contesta «✅ ¡Solicitud recibida! Te contactaremos
   en menos de 48 horas» y **solo escribe en el `localStorage` del propio
   visitante** (`// Por ahora guardamos en localStorage hasta tener Supabase
   listo`). No lo recibe nadie. Un dueño de negocio deja su correo creyendo que
   se ha apuntado.

## El punto ciego · una segunda forma de fila de idioma

`barrido_idiomas.js` busca objetos con `es`, `en`, `fr` como claves directas.
Las 23 categorías del mapa y los 11 grupos del panel de filtros no se escriben
así: usan `{labelEs:…, labelEn:…, labelZht:…}`, con el idioma en el **sufijo**.
**34 filas que ninguna herramienta de idioma miraba nunca.** Estaban completas
en los nueve idiomas por casualidad —nadie las tocaba— y el idioma décimo las
dejó al descubierto: `poner_idioma.js` les metió un `pl: "?"` literal que
habría salido en el menú del mapa.

Arreglado en los dos sentidos: las 34 tienen su `labelPl`, y el barrido
aprende la forma con sufijo —cualquier base, no solo `label`—, así que si
mañana alguien escribe `tituloEs`/`tituloEn` lo ve el primer día. El total de
filas pasa de 581 a 615 sin que se haya añadido ni una: son las que no se
estaban mirando.

## El asistente no entendía «dónde está» fuera del castellano

Mismo fallo que las categorías, un piso más abajo. `CHAT_WHERE`, `CHAT_WHAT`,
`CHAT_NEAR` y `CHAT_COUNT_Q` están en castellano y en inglés y en nada más:

```
antes                              después
[de] Wo ist Masca      → kb        → poi
[fr] Où est Masca      → kb        → poi
[bg] Къде е Маска      → fallback  → poi
[pl] Gdzie jest Masca  → —         → poi
[bg] колко места има   → fallback  → count
```

El vocabulario de cada idioma viaja en `faq/<lang>.json`, que ese idioma ya se
descarga. Las listas de dentro **no se tocan** y se siguen mirando con la
comparación de siempre: lo que funcionaba en castellano y en inglés se comporta
igual aunque el fichero no llegue nunca.

**Y una regla mía que estaba mal y salió aquí.** La «frase descolocada» pedía
dos palabras cualesquiera de tres letras o más. En castellano colaba porque
`CHAT_STOP` tiene las vacías del castellano y del inglés; en alemán y en
búlgaro no hay nada que filtre las de relleno, así que:

- «Was kann man hier machen» casaba con «kann man zu fuss hochgehen» por
  *kann* y *man*, y contestaba cómo se sube al Teide a pie.
- «какво да видя наблизо» casaba con «какво да видя за няколко дни» por dos
  palabras, y contestaba el plan de tres días.

Ahora tienen que estar **todas** las palabras de la clave de tres letras o
más. Cuesta un caso —una forma flexionada polaca que comparte dos de tres
palabras— y ese caso está escrito en `tools/probar_faq.js` con el motivo, para
que nadie afloje la regla creyendo que arregla algo. Se prefiere una respuesta
de menos a una respuesta equivocada.

Contra las 52 preguntas de la batería en castellano e inglés: **0 cambian de
entrada**. Contra 34 preguntas en los diez idiomas: 34 correctas.

## El polaco · terminado, el idioma número diez

Los bloques del asistente venían redactados en polaco y la prueba de
aceptación pedía «guaguas en polaco», pero la app no tenía ese idioma: no
estaba en `LANGS`, ni en `idiomas/`, ni en el menú. Añadirlo eran **3.408
textos**, contados, y están todos:

```
LANGS.pl                          168   hecho
resto de la interfaz              814   hecho   (614 filas en 45 tablas)
idiomas/pl.json                 1.705   hecho   (786 lugares, en 9 bloques)
idiomas/etiquetas/pl.json         685   hecho
idiomas/glosario-cat/pl.json       --   no hace falta: no se carga en la app,
                                        es una entrada de completar_cat.js en
                                        tiempo de construcción, y el búlgaro
                                        tampoco lo lleva
```

`idiomas/pl.json` sale con **786 lugares y 1.705 textos**, la misma cuenta
exacta que `bg.json` y `zht.json`. `tools/lugares_idioma.js montar pl` no
escribe si un id o un campo no cuadra con `index.html`, así que la paridad no
es una impresión: es la condición para que el fichero exista.

**Y ya se ofrece.** `IDIOMAS_INCOMPLETOS` queda vacía —no borrada: el día que
entre el idioma once vuelve a hacer falta, y de contarla sale el número que el
usuario lee—, y con ella se fue la marca `data-incompleto="pl"` del menú, que
ya no escondía nada. El selector enseña los diez y cada uno marca el suyo.

Y una cifra que el idioma nuevo puso al descubierto: **«toda la app en 9
idiomas» estaba escrita a mano en los diez idiomas**, en el tour y en la
respuesta del asistente, más la ficha JSON-LD. Veinte sitios que había que
acordarse de tocar. Ahora los textos llevan `{L}` y el número sale de
`nIdiomasListos()`, que es `SUPPORTED_LANGS` menos `IDIOMAS_INCOMPLETOS`. Al
terminar el polaco los veinte pasaron de nueve a diez solos, sin tocar una
línea. La única que sigue escrita es la de JSON-LD, que es estática: decía
nueve y el control de datos la cantó —`cifras de idiomas en la interfaz que no
son 10: 1 de 1`— en el mismo momento en que la lista se vació.

`tools/poner_idioma.js` es lo que mete un idioma en las 614 filas: las
localiza con acorn —no a mano, están repartidas por 37.000 líneas y muchas sin
nombre de tabla al que agarrarse— y escribe de atrás hacia delante para que
los desplazamientos no se muevan bajo los pies. Si el número de textos no
cuadra con el número de filas no escribe nada: más vale no tocar el fichero
que dejarlo con los textos corridos una posición. La traducción vive en
`idiomas/pl-fuente/`, revisable aparte del HTML.

`wikiTitleOverrides` se queda sin polaco a propósito, como ya se queda sin
italiano y sin chino: son títulos EXACTOS de artículos que existen en cada
Wikipedia, y uno inventado no devuelve el artículo, devuelve nada. Desde aquí
no se pueden comprobar —el proxy responde 403 a `wikipedia.org`— así que no se
escriben.

## Terminar el polaco destapó cuatro controles que no podían ponerse rojos

Antes de ofrecer el idioma había que pasarlo por los controles, y ahí salió lo
de verdad: **los controles no lo miraban**. No porque fallaran, sino porque la
lista de idiomas estaba escrita a mano dentro de cada uno y se había quedado en
nueve. Un control que da verde sobre lo que no ha mirado es peor que no
tenerlo, porque da permiso para seguir.

**Las listas a mano.** Nueve sitios repetían `['es','en',…,'bg']`:
`barrido_idiomas.js`, `inventario_idiomas.js`, cinco veces en `auditar_web.js`,
`auditar_mapa.js` y el bucle de `auditar.sh`. Todas salen ahora de
`SUPPORTED_LANGS` leída del fuente —dentro del navegador se alcanza por su
nombre, que no está en `window`— y si no la encuentran paran en vez de seguir
con una lista vacía. `IDI_BASE` **no** se toca: esa es la huella que
IDENTIFICA una tabla de idiomas, y meterle un idioma nuevo es justo lo que
cegó el control cuando entró el búlgaro.

El efecto se ve en una cifra: `barrido_idiomas.js pl` decía «total mirado 636»
donde con `bg` decía 2.377. La lista de ficheros externos también estaba a
mano y se quedaba en `bg`, así que `idiomas/pl.json` no lo abría nadie y los
1.741 textos se contaban como cero **sin decir una palabra**. Ahora sale de la
misma lista, y quitando el fichero el control lo canta: `FICHEROS DE IDIOMA QUE
FALTAN: pl`.

**Las tuberías de `auditar.sh`.** `node tools/probar_faq.js | tail -3` devuelve
el estado de `tail`, no el de la herramienta: esa batería de 28 preguntas no
podía suspender la auditoría. Lo mismo `verificar_red.js | grep …`. Y
`node --check sw.js && echo ok` se comía el fallo en el `&&`. Los tres se
probaron inyectando la avería: con `probar_faq.js` devolviendo 1, con `sw.js`
roto y con `verificar_red.js` en rojo, la auditoría daba **VERDE**. Ahora da
rojo en los tres casos. El bucle por idioma no llevaba cuenta ninguna, además
de tragarse un `TypeError`.

**Y lo que apareció cuando por fin miraron.** `auditar_idioma.js pl` sacó 85
hallazgos. Ninguno era un error de traducción: eran diez idiomas de reglas y
uno nuevo que no encajaba en ellas.

| | qué pasaba | qué se hizo |
|---|---|---|
| 53 CIFRAS | el polaco deja el siglo en romano —«z XVII wieku»— y la regla de siglos conocía `century`, `Jahrhundert`, `siècle`, `secolo`, `eeuw`, `век`… pero no `wiek` | se añade la marca polaca. El sufijo sigue siendo OBLIGATORIO: sin él la regla convertiría «PADI 5★ IDC» en 601 |
| 17 CIFRAS | «24 horas» en polaco es `całodobowy`, `całą dobę`: no lleva cifra. Alemán y búlgaro escriben «24h» y «24 ч» y por eso pasaban | se convierte la palabra **en la cifra**, no se borra: si el polaco promete 24 horas donde el castellano no las promete, sigue cantando |
| 1 CIFRA | «50 millones» → «50 milionów» | al expansor de millones le faltaban las formas polacas |
| 5 HORAS | el castellano escribe «10-18h» y yo había escrito «10-18»: sin marca no es un horario, y así tiene que ser —«10-15 min» no es una apertura— | se corrige **el polaco**, no la regla: «10:00-18:00» es igual de natural y además más claro para quien lo lee |
| 27 IGUAL | *guachinche*, *karting*, *zoo*, *marina*, *skatepark* se escriben igual en polaco | se declaran, como ya las declaran el inglés, el italiano y el neerlandés |
| 1 espacio | `admPhLat` traía un espacio doble **del castellano**, y el polaco lo copió | se quita en los dos. El control no mira el castellano —es la referencia—, así que la copia delató al original |

Después: **los diez idiomas a 0 hallazgos**. Y para que no sea un cero de los
que no miran, se le metieron cuatro averías de verdad al polaco —un siglo
cambiado, media hora corrida, diez millones de más y una promesa de 24 horas
que el castellano no hace— y las cantó las cuatro.

También aprendieron a contar dos rótulos que estaban escritos: «los 8
renderizados» cuando ya eran diez, y «las 7 claves … en los 8 idiomas». Un
rótulo con el número a mano envejece igual que una lista.

## Auditoría del búlgaro y el polaco · lo que ningún control miraba

El usuario abrió la app y vio el polaco en el menú **pero no en la pantalla de
bienvenida**. Tenía razón, y el fallo no era el botón que faltaba: era que
**todos los controles de idioma de este proyecto fotografían la página
quieta**. Lo que se pinta al abrir algo, o lo que se reescribe al tocar, no
lo ve ninguno.

Salió esto, todo comprobado en el navegador a 390×844 y en los dos idiomas:

**1 · Dos listas de idiomas en el marcado, no una.** El desplegable de la barra
(`.lang-option`) y los chips de la bienvenida (`.v19-w-lang`). El control
miraba el desplegable. Ahora compara **las dos** contra `SUPPORTED_LANGS`: el
desplegable por orden —`setLang` marca por índice— y los chips por
`data-lang`. Y el `n >= 9` que tenía era un número escrito: con nueve
opciones y diez idiomas daba OK.

**2 · El saludo del asistente, apilado y congelado.** Iba atado a
`chatHistory.length===0`, y `chatHistory` solo guarda lo que se habla: el
saludo del bot no entra. La condición era cierta **siempre**, así que cada
apertura del panel añadía otro saludo —al tercer toque había tres— y se
quedaba en el idioma en que se pintó la primera vez. Un usuario polaco abría
el asistente y leía **el saludo en castellano con la cabecera en polaco al
lado**. Ahora la burbuja se marca y se recuerda su idioma: si nadie ha
hablado se repinta, y si hay conversación **no se toca**, porque reescribir
lo que alguien ya leyó en otro idioma es cambiarle el historial por detrás.

**3 · Cinco rótulos que se vuelven castellanos al usar la app.** Están bien al
arrancar —por eso daban verde— y se reescriben en cuanto alguien toca:

| rótulo | quién lo machacaba |
|---|---|
| el chip «Solo este» de las categorías | se crea al vuelo con un literal dentro del `innerHTML` |
| «+N más — sigue escribiendo» del buscador | igual, al pintar las sugerencias |
| la pista 🅰️/🅱️ de la ruta | el marcado la pinta traducida con `data-tx` y `activatePick()` la machacaba |
| «Pagar» / «Añadir a la cesta» de la reserva | `updateBookingCTA()` |
| el botón del planificador con varias actividades | `dpApplyUiTexts()` lo deja traducido y `dpiSelectZone` lo machacaba |

Las siete filas nuevas están en los diez idiomas. Las dos últimas son el
mismo patrón y el más traicionero: **empieza traducido y se vuelve castellano
al usarlo**, que es exactamente lo que una foto de la página quieta no puede
ver.

**4 · La respuesta del asistente sobre cambiar idioma decía tres cosas falsas**:
«elige entre 8» nombrando ocho, «los 700+ lugares» con 786 dentro, y «este
asistente responde en español e inglés por ahora» cuando responde en los
diez. El control de cifras no la cazaba porque el 8 no iba pegado a la
palabra «idiomas». Las respuestas de `CHAT_KB` pasan ahora por `chatFmt`,
igual que `countAns`, así que esa lleva `{L}` y `{N}`: en el navegador dice
10 y 786.

**Los controles nuevos.** Dos, y los dos **tocan** en vez de mirar:

```
=== el saludo del asistente ===
  OK  tres aperturas dejan UN saludo, no tres   (1)
  OK  el saludo y su remite siguen al idioma en los diez
  OK  con conversacion por medio no se reescribe   (3 -> 3)

=== texto que se vuelve castellano al USAR la app ===
  OK  seis rotulos que se reescriben al tocar siguen en su idioma
```

El segundo pide **búlgaro**, que cambia de alfabeto: si después de usar la app
queda alfabeto latino donde debería haber cirílico, alguien lo reescribió. Los
dos se probaron devolviendo las averías: el del saludo canta «tres aperturas
→ 3» y el de tocar lista los cinco rótulos uno a uno.

**Lo que sí estaba bien**, y conviene decirlo: 0 errores de página en los dos
idiomas, 0 textos vacíos, 0 `undefined`, 0 `{marcador}` sin sustituir, 0
recortes con puntos suspensivos, y las 1.741 fichas y las 685 etiquetas
completas en ambos. El único desbordamiento horizontal que aparece —el botón
de idioma de la barra, 5 px fuera a 390 px de ancho— **sale igual en
castellano**, así que no es del idioma y se deja anotado aquí sin tocarlo.

## Lo que escribe el administrador, en el idioma de quien mira

Un anuncio, una excursión o un souvenir los escribe el administrador **una
vez y en castellano**, desde el panel. Se pintaban tal cual en los diez
idiomas: la app entera en cirílico y la tarjeta en castellano.

Y no se arregla pidiéndole que lo escriba diez veces. Hace falta un sitio
donde guardar la traducción y un camino para meterla.

**Dónde vive.** Una columna `i18n jsonb` en `anuncios`, `souvenirs` y
`excursiones` (`supabase/tienda-i18n.sql`), con la forma
`{"bg": {"name": "…", "desc": "…"}, …}`. Con diez columnas por campo la
tabla crecería a cada idioma nuevo; así entra el once sin migrar nada. Y
sobre todo **la traducción viaja con la fila**: no hay una segunda petición
que pueda fallar, ni un fichero aparte que se desincronice, ni nada que
pedir cuando el móvil está sin cobertura. El castellano **no se duplica**
ahí: es el original y vive donde siempre, así que se corrige en un sitio.

Las policies no se tocan: son por FILA, no por columna, y la columna nueva
hereda su regla. Quien puede leer la fila lee su traducción y solo el
administrador la escribe. La facturación sigue en `anuncios_privado`, sin
lectura pública.

**Lo que se traduce solo, sin traductor ninguno.** No todo el texto es
prosa libre:

| campo | qué se hace | por qué |
|---|---|---|
| `diff` | tabla de tres valores en los diez idiomas | el formulario solo deja elegir Fácil / Media / Alta: no hay nada que mantener |
| `duration` | se lee la cifra y la unidad y se pinta con las claves de siempre | «4 horas» → «4 часа» → «4 godz.», «90 min», «2 días» |
| `location` | **no se traduce** | es un nombre propio; traducir «Anaga» sería inventarse un topónimo |
| `name`, `desc`, `tagline`, `info` | por `i18n` | prosa libre: no hay regla que la traduzca |

Lo que no encaje en el patrón de duración se devuelve **tal cual**. Más vale
enseñar lo que el administrador escribió que adivinar.

**El respaldo nunca deja un hueco**: idioma → inglés → castellano, el mismo
de `tx()`. Una fila sin traducir sale en castellano, que es lo que había,
no en blanco.

**Y el panel lo dice en voz alta.** Cada fila de la lista del administrador
lleva ahora su estado —«🌐 Sin traducir: en fr de…» en ámbar, o «🌐
Traducido a los 10» en verde— en vez de que se descubra abriendo la app en
búlgaro. La lista del panel sigue enseñando **el original**: ahí el
administrador tiene que ver lo que él escribió, no una traducción que luego
no sabría corregir. El globo del mapa sí traduce, que lo lee el turista.

**El puente.** `tools/tienda_i18n.js`:

```
node tools/tienda_i18n.js sacar > pendiente.json     # lo que falta, con el castellano al lado
node tools/tienda_i18n.js meter pendiente.json       # lo sube
```

`meter` **funde, no reemplaza**: subir un idioma no puede borrar los otros
nueve. Y un hueco vacío no se sube: pisaría lo que hubiera con una cadena
vacía y la app caería al castellano creyendo que no hay traducción. Las
credenciales salen del entorno, nunca del fichero.

**Lo que esta herramienta NO hace es traducir sola**, y es a propósito:
traducir automáticamente significa mandar el texto del administrador a un
servicio de terceros, y eso cuesta dinero y sale de su servidor. Es una
decisión suya, no de una herramienta.

**El control.** No hay Supabase en la auditoría, así que se inyectan filas
como las que devuelve el servidor —una traducida, una sin traducir y una
que intenta colar HTML— y se comprueban las tres cosas a la vez:

```
=== la tienda, en el idioma de quien mira ===
  OK  traduce lo traducido, cae al castellano lo que no, y la duracion y
      la dificultad salen solas
  OK  el camino nuevo no se salta el escapado   (img 0 · svg 0 · script 0)
```

Esa segunda línea importa tanto como la primera: el camino nuevo pasa por
`innerHTML` igual que el viejo, y un texto que llega de la base de datos en
otro idioma sigue siendo texto que alguien escribió.

## «La app es muy lenta» · el arranque esperaba a Google

Lo primero fue medir, no adivinar. Con CPU de móvil (4× más lenta):

| qué se toca | tarda |
|---|---|
| abrir la tienda, una ficha, el asistente, categorías | **0-3 ms** |
| pintar todos los marcadores | 1 ms |
| filtrar, el dado, mover y hacer zoom en el mapa | 0-70 ms |
| cambiar de idioma | 57-60 ms |

O sea que **la app no es lenta usándola**: es lenta **arrancando**. Y el
perfil de CPU lo dijo: 2.331 ms en `(program)` —parsear y compilar— y
**20 peticiones a servidores de fuera antes de terminar de cargar**.

De esas veinte, dos estaban en el `<head>` y **frenaban la app antes de
pintar nada**:

1. **`<script src="cdn.jsdelivr.net/…supabase.js">` sin `defer`.** Un script
   así PARA el parseo del HTML hasta que jsDelivr contesta: en un móvil son
   DNS + TLS + 120 kB antes de que el navegador siga leyendo el documento. Y
   nadie lo necesita durante el parseo: `initSupabase()` corre en
   `DOMContentLoaded`, y un `defer` se ejecuta **antes** de eso. Una palabra.

2. **`<link>` a `fonts.googleapis.com`.** Una hoja de estilo de otro dominio
   bloquea el primer pintado, y detrás vienen los `woff2` desde un tercer
   dominio. Además **la app es offline-first y las fuentes no lo eran**: sin
   cobertura el turista veía la app con la tipografía del sistema. Y era una
   petición a Google desde su navegador en cada carga.

Las fuentes viven ahora en `vendor/fuentes/`, las trae
`tools/bajar_fuentes.sh` y el service worker precachea **latin y latin-ext**
—las que necesitan los nueve idiomas de alfabeto latino; el polaco usa
latin-ext—. El cirílico del búlgaro y el vietnamita se quedan fuera del
precache a propósito: son 63 kB que la mayoría no pide nunca y el manejador
normal los guarda la primera vez que alguien los usa.

**La CSP se estrecha de paso**: fuera `fonts.googleapis.com` de `style-src` y
`fonts.gstatic.com` de `font-src`. Un tercero menos al que dejar entrar.

**Medido, mediana de varias cargas:**

| | antes | ahora |
|---|---|---|
| primer pintado, CPU normal | 836 ms | **324 ms** |
| primer pintado, CPU móvil | 788 ms | **516 ms** |
| primer pintado, CPU móvil + 5G | 948 ms | **544 ms** |

Y sin conexión la app conserva su tipografía, que antes perdía.

**Lo que NO se tocó, y por qué.** Los cuatro `<script>` de `./vendor/`
—Leaflet, MarkerCluster, PMTiles, Protomaps— también bloquean, y se quedan:
`map = L.map(…)` corre en el nivel superior de un script en línea, o sea
**durante** el parseo, así que Leaflet tiene que estar ya. Aplazarlos pide
mover la creación del mapa a una función, que es otra faena con otro riesgo.
Son del propio origen y el service worker los precachea, así que desde la
segunda visita salen del caché. El control los **lista aparte** en vez de
callarlos: una exención escrita no es un silencio.

**El control**, que mira el `<head>` y cuenta lo que el navegador pidió de
verdad —eso no se ve en la página ya cargada—:

```
=== el arranque no espera a nadie de fuera ===
  OK  ningun script DE FUERA para el parseo del HTML
      (del propio origen y precacheados, si bloquean: leaflet.js …)
  OK  ninguna hoja de estilo viene de otro dominio
  OK  cero peticiones de fuentes a Google   (0)
  OK  las fuentes del proyecto cargan   (11 cargadas)
```

Probado devolviendo las dos averías: canta las cuatro líneas.

**Lo que queda pendiente y está medido.** `index.html` son 929 kB
comprimidos y de ahí salen ~700 ms de compilar JavaScript. Dentro hay
1,5 MB de **datos** —`TITSA_LINES` 783 kB, `places[]` 496 kB,
`TITSA_PARADAS` 277 kB— que el motor parsea como código. Pasarlos a
`<script type="application/json">` y leerlos con `JSON.parse` —que el
parser de JS ni mira— da, medido en un experimento: DCL 2.188 → 1.938 ms,
compilar 711 → 620 ms, y 40 kB menos comprimidos. No se ha hecho todavía
porque **quince herramientas leen y ESCRIBEN `const places = [` con cirugía
fina**, y moverlo sin moverlas es como el proyecto ya aprendió con los
idiomas: el control deja de mirar y da verde.

## «Organiza tu día» devolvía el itinerario en castellano

La app en búlgaro, el itinerario en castellano: el título, la descripción de
cada parada, los rótulos de tránsito y dos de los tres botones.

La causa es una línea que se repetía en los **dos** renderizadores del
planificador:

```js
place.desc.es || place.desc.en      // el castellano PRIMERO
```

`localized()` es lo que usa el resto de la app y respeta el idioma; aquí se
pedía el castellano a mano. Y alrededor, todo escrito a pelo: los ocho tipos
de día («✨ Lo mejor de hoy»), los cuatro modos de moverse («En bici ~20
min»), la lista rotatoria `DP_TRANSIT`, «📍 Ver mapa», «🔄 Otro», «Pausa
comida» y los `title=` de los dos botones.

**24 filas nuevas × 10 idiomas = 240 textos**, en `DP_UI`, que ya existía y
ya llevaba los diez. `DP_TRANSIT` pasa a llevar **clave en vez de texto**:
escrito a pelo volvería a envejecer solo.

**Y un fallo de escapado que iba de regalo.** La descripción se cortaba
**después** de escaparla:

```js
escapeHtml(texto).slice(0, 100) + '…'
```

Un corte a los 100 caracteres puede caer **dentro** de un `&quot;` y dejar
`&qu` en pantalla. Ahora se corta el texto crudo y se escapa después, que es
el orden que no parte nada. Y la elipsis solo se pone si de verdad se cortó.

**El control** genera un itinerario **de verdad** en los dos renderizadores,
pide búlgaro —que cambia de alfabeto— y mira lo que queda en pantalla; lo que
siga en alfabeto latino, o es nombre propio o no está traducido. Además mete
una descripción trampa con comillas justo en el punto de corte, para que el
orden escapar/cortar no se pueda volver a invertir:

```
=== el itinerario de «organiza tu dia» ===
  OK  titulo, descripcion, botones y transito salen en el idioma de quien mira
```

Probado devolviendo las averías: canta el título y las dos descripciones,
una por cada renderizador.

## Un control retirado: `cifras_idioma.py`

Dos controles miraban lo mismo y no se ponían de acuerdo. `auditar_idioma.js`
daba **0 hallazgos en los diez idiomas**; `cifras_idioma.py` daba 24 en
inglés, 23 en francés, 23 en alemán y 16 en chino.

Se miraron **una a una**. Ni una sola era real:

| idioma | qué cantaba | por qué no es un error |
|---|---|---|
| en · fr · de | `922` vs `34922` | el castellano escribe «922 57 48 06» y los demás le añaden el prefijo **+34** |
| zh · zht | `27000` vs `27`, `100000` vs nada | el chino escribe las miriadas con 万: 2,7万 son 27.000 |

`auditar_idioma.js` ya sabía las dos cosas —tiene `sacarTelefonos()` y
`sinMiriadas()`— y además mira **todas** las cifras, no solo las de tres
dígitos, más las horas, los marcadores, las etiquetas HTML y el alfabeto.

`cifras_idioma.py` nació para el polaco, antes de que `auditar_idioma.js`
supiera polaco. Ahora lo sabe, así que el otro sobra: **hace estrictamente
menos y grita cinco veces de cada cinco**. Un control que llora lobo se
ignora, y el día que cante algo de verdad nadie lo mirará.

Antes de retirarlo se comprobó el reemplazo: se metieron dos erratas de
verdad en el búlgaro —un año 1988 → 1998 y una cifra 540 → 560— y
`auditar_idioma.js` cantó las dos:

```
  CIFRAS                  2
     sendero-sentidos.desc  … 340,540,76,77 vs … 340,560,76,77
     camel-park.desc        10,1988,20 vs 10,1998,20
```

Queda escrito aquí para que nadie vuelva a construirlo.

## El plural estaba mal en los diez idiomas

`plural()` tenía una sola regla para todos: `n === 1 ? singular : plural`. Y
cuatro filas más ni siquiera llevaban forma singular. Lo que salía en
pantalla:

| | antes | ahora |
|---|---|---|
| es | «Máx. **1 personas**» · «**1 días**» | Máx. 1 persona · 1 día |
| en | «Max. **1 people**» · «**1 days**» | Max. 1 person · 1 day |
| bg | «Макс. **1 души**» · «**1 дни**» | Макс. 1 човек · 1 ден |
| pl | «**5 miejsca**» · «**5 wyniki**» · «Maks. **1 osób**» | 5 miejsc · 5 wyników · Maks. 1 osoba |

El polaco es el caso que rompe la regla de dos formas: tiene **tres**.

```
1 miejsce   ·   2-4 miejsca   ·   5+ miejsc
```

Y no es «números pequeños y grandes»: la regla de CLDR mira la **decena**. 12
y 112 acaban en 2 **pero** están en la decena del 11 al 14 → *miejsc*. 22 acaba
en 2 y no está → *miejsca*. Esos son los casos que separan una regla escrita a
ojo de una buena, y son los que prueba el control. Ninguno sale del número de
lugares: un caso de prueba atado al corpus caduca cada vez que entra o sale una
ficha.

**Cómo quedó.** `PLURAL_FORMA` tiene la regla de cada idioma —el polaco la
suya, el chino «siempre una», el resto por el camino de siempre— y la usan
**`plural()` y `tx()`**, que antes no sabía nada de plurales. Una fila con
`|` lleva alternativas **enteras** («Máx. {n} persona|Máx. {n} personas»),
no solo el sustantivo, porque así vale para cualquier forma de frase. Si un
idioma escribe **menos** formas de las que su regla pide —el neerlandés
«{n} uur» y el polaco «{n} godz.» son invariables— se coge la última que
haya: degradar a lo que ya había, nunca a un hueco.

**Y obligó a corregir un control.** `auditar_idioma.js` compara los
`{marcadores}` de cada texto, y contándolos en toda la cadena empezó a
cantar cinco idiomas: el castellano escribe dos `{n}` —uno por forma— y el
francés uno. El número de formas es cosa del idioma; lo que tiene que
cuadrar es que **cada forma** lleve los mismos marcadores. Ahora se parte
por `|` y se comprueba forma a forma, así que sigue cazando lo de verdad:
una forma polaca a la que le falte el `{n}` sale como
`FORMAS-DESCUADRADAS`, comprobado.

## Un control retirado: `cifras_idioma.py`

Dos controles miraban lo mismo y no se ponían de acuerdo. `auditar_idioma.js`
daba **0 hallazgos en los diez idiomas**; `cifras_idioma.py` daba 24 en
inglés, 23 en francés, 23 en alemán y 16 en chino.

Se miraron una a una. **Ni una era real:**

| idioma | qué cantaba | por qué no es un error |
|---|---|---|
| en · fr · de | `922` vs `34922` | el castellano escribe «922 57 48 06» y los demás le añaden el prefijo **+34** |
| zh · zht | `27000` vs `27`, `100000` vs nada | el chino escribe las miriadas con 万: 2,7万 son 27.000 |

`auditar_idioma.js` ya sabía las dos cosas —tiene `sacarTelefonos()` y
`sinMiriadas()`— y además mira **todas** las cifras, no solo las de tres
dígitos, más las horas, los marcadores, las etiquetas y el alfabeto.

`cifras_idioma.py` nació para el polaco, antes de que `auditar_idioma.js`
supiera polaco. Ahora lo sabe: el otro **hace estrictamente menos y grita
cinco de cada cinco veces**. Un control que llora lobo se ignora, y el día
que cante algo de verdad nadie lo mirará.

Antes de retirarlo se comprobó el reemplazo: dos erratas de verdad en el
búlgaro —año 1988 → 1998 y cifra 540 → 560— y `auditar_idioma.js` cantó
las dos. Queda escrito aquí para que nadie vuelva a construirlo.

## Lo que se ejercitó por primera vez

**`tools/tienda_i18n.js`**, que se escribió sin poder probarlo contra un
Supabase de verdad. Se montó uno de mentira que habla PostgREST y se pasó
el circuito entero:

| se probó | resultado |
|---|---|
| `sacar` lista lo que falta | 3 filas de 4; salta la que ya está completa |
| `meter` **funde**, no reemplaza | subí búlgaro y polaco y el `en.name` que ya había **siguió ahí** |
| un hueco vacío no pisa lo que hay | `en.name: ""` **no** borró el «BBQ» del servidor |
| una fila sin nada escrito | se salta, no se sube |
| idioma que no está en `SUPPORTED_LANGS` | para y lo dice |
| campo que esa tabla no tiene | para y lo dice |
| tabla inventada | para y lo dice |
| sin credenciales | para y dice cómo ponerlas |
| la clave en la salida | **0 apariciones** |

Y salió un fallo: **con el servidor caído escupía la traza de `undici`** en
vez de decir qué pasaba. Corregido: ahora dice el servidor y sugiere mirar
`SUPABASE_URL`.

**La app sin el SQL ejecutado.** Se prometió que aguanta y no se había
comprobado. Se le pasaron filas tal cual las devuelve un Supabase **sin la
columna `i18n`**, y otra sin la propiedad siquiera: **0 errores de página**,
el texto libre cae al castellano —como antes— y la duración y la dificultad
**ya traducen igualmente**.

## Accesibilidad: lo mínimo, que nunca se había mirado

No es una auditoría WCAG entera. Son las cosas que dejan a alguien fuera
del todo:

```
  OK  todo lo que se pulsa tiene nombre accesible   (0 sin el)
  OK  todo campo de formulario tiene etiqueta       (0 sin ella)
  OK  toda imagen visible declara alt               (0 sin el)
  --  zonas tocables menores de 24x24: 21 (6 no son enlaces) — se informa, no falla
```

Se encontró **un campo sin nombre**: el `<input type="date">` de la reserva.
Un lector de pantalla decía «selector de fecha» y quien no ve la pantalla
no sabía de qué fecha. Corregido, con su `aria-label` en los diez idiomas.

Las **zonas tocables pequeñas se informan y no fallan**, a propósito: 15 de
las 21 son enlaces dentro de una frase, que WCAG 2.2 exime. Las otras seis
—`map-legend-close` 17×15, `multifilter-toast-close` 16×14,
`booking-people-btn` 24×19, `cart-item-remove` 23×29— sí están por debajo
del mínimo, pero agrandarlas es tocar el diseño y esa no es una decisión de
una auditoría. **Queda anotado.**

## Lo que se miró y estaba bien

La letra china: las fuentes del proyecto son latinas y cirílicas, y el chino
cae a la del sistema. Es lo correcto —una CJK son megas— y se comprobó que
hay glifos, no cuadros vacíos. El búlgaro tiene su cirílico en los títulos
(Cormorant Garamond lo trae); el cuerpo (DM Sans) cae al sistema porque
**esa familia no existe en cirílico**, ni aquí ni cuando venía de Google.

## Lugares en el mar · y el control que llevaba midiendo en espejo

El usuario abrió el mapa y vio pines en el agua: un Lidl, un parking, una
ermita, un faro. Tenía razón, y el hueco era claro: **`auditar_ubicacion.py`
solo mira las 99 playas y charcos, y solo comprueba que no estén LEJOS del
agua**. Lo contrario —un supermercado metido en el mar— no lo miraba nadie.

**El detector nuevo.** `tools/auditar_en_el_mar.py` comprueba, contra la capa
`earth` del OSM que ya lleva el proyecto, que cada lugar de tierra esté
**dentro** de tierra. No geocodifica ni pregunta a nadie: la respuesta sale
de un dato que ya estaba en el repositorio.

Y mide **cuánto**, no solo sí o no: el polígono a z14 está generalizado, así
que un punto a tres metros de la orilla puede caer del lado equivocado por el
propio dibujo. A 2 km es un error de dato; a 3 m es el dibujo.

**Dos trampas que costaron encontrar.**

1. **El eje Y viene volteado.** `mapbox_vector_tile.decode()` devuelve la `y`
   con el origen abajo, no arriba como el MVT crudo. No se adivinó: se
   probaron **las dos convenciones sobre los 804 lugares**. Sin voltear, 139
   caían fuera de tierra —entre ellos el Hospital del Norte, que está en
   Icod—; volteando, 22. Cuando una da 139 y la otra 22, no hay duda.

2. **Los agujeros cuentan.** El océano viene como un polígono con la tierra
   recortada dentro. Aplanando todos los anillos por igual, caer en un
   agujero —o sea, estar en tierra— contaba como estar en el agua.

**Y aquí está lo gordo: `auditar_ubicacion.py` tenía el mismo fallo del eje.**
Llevaba midiendo **contra una costa en espejo** y dando verde. Al corregirlo:

| | antes (en espejo) | ahora |
|---|---|---|
| mediana de playa al agua | 82 m | **22 m** |
| cuartil 3 | 159 m | **36 m** |
| máximo | 573 m | **202 m** |

Las playas están mucho más cerca del agua de lo que decía, que es justo lo
que uno espera de una playa. El control daba verde midiendo otra cosa.

**Lo corregido, con su fuente escrita.** Solo donde OpenStreetMap tiene el
sitio **con el mismo nombre y un tipo compatible**:

| lugar | de | a | evidencia |
|---|---|---|---|
| `golf-del-sur` | 28.0170, −16.5770 | 28.03749, −16.60762 | OSM `golf_course` «Golf del Sur» |
| `lidl-santa-cruz` | 28.4500, −16.2600 | 28.45818, −16.25843 | OSM `supermarket` «Lidl», el más cercano al centro |
| `nucleo-los-gigantes` | 28.2475, −16.8422 | 28.24564, −16.84014 | OSM `neighbourhood` «Los Gigantes» |
| `wc-gigantes` | 28.2475, −16.8422 | 28.24564, −16.84014 | ídem |
| `nucleo-san-andres` | 28.50291, −16.19195 | 28.50550, −16.19250 | OSM `locality` «San Andrés» |
| `nucleo-costa-adeje` | 28.0910, −16.7450 | 28.08698, −16.73580 | OSM `neighbourhood` «Costa Adeje» |

**Lo que NO se ha tocado, y por qué.** Cuatro seguían mal y **la auditoría se
quedaba en rojo por ellos**, que es lo honesto: estaban mal y no debían dar
verde. OSM no tenía el dato y aquí no se inventan coordenadas:

| lugar | estaba a | lo que decía OSM |
|---|---|---|
| `montana-colorada` «Montaña Colorada (Fasnia)» | 2.220 m mar adentro | hay **cinco** «Montaña Colorada» en la isla y **ninguna cerca de Fasnia**; la más próxima está a 4,5 km y se llama Montaña de Fasnia |
| `windsurf-el-poris` | 1.003 m | la playa más cercana está a 1,5 km; no sabía cuál de las tres es el spot |
| `faro-santa-cruz-puerto` | 444 m | **cero faros** en toda la capa de POIs de OSM |
| `pk-poris-abona` | 82 m | **ningún parking** de OSM a menos de 1,5 km |

De esas cuatro, el parche **auditoria-mar-8** resolvió las dos primeras. Va
abajo, con lo que quedó fuera y por qué.

## El parche «auditoria-mar-8» · 2 aplicadas de 8, y las 6 que no

El parche traía 1 baja y 7 coordenadas, cada una con su fuente, sus límites y
una regla explícita: *«Cero improvisación. Si te falta un insumo —la costa de
la auditoría, el shapefile municipal del Cabildo o la red—, las fichas que lo
necesitan quedan PENDIENTE.»* El bloque JSON llegó íntegro (sha256
`bcecdadd…b321b`, el que el parche pedía) y las 8 pasaron la pre-comprobación
de que nada había cambiado desde la auditoría.

**Aplicadas.**

| ficha | qué se hizo | cómo |
|---|---|---|
| `montana-colorada` | **baja**: la ficha, su id en `suggestionIds` de `south`, y sus textos en los nueve `idiomas/*.json` | ninguna fuente la sitúa en Fasnia; el Monumento Natural del mismo nombre es otro sitio, en Granadilla y Vilaflor, de hasta 1.524 m |
| `windsurf-el-poris` | 28.1540, −16.4160 → **28.152765, −16.432303** | coordenada oficial de Playa Grande (Turismo de Tenerife); cayó a 8 m en el agua, así que corrió su `si_falla`: empujada 8 m a tierra sobre el **segmento** de costa, 16 m de desplazamiento (el límite eran 40) |

La parada TITSA «Montaña Colorada» de Granadilla de Abona **no se ha tocado**:
el parche avisaba de que es otra cosa, y lo es.

**Las seis pendientes, y el insumo que falta.** Las seis pasan por
**Overpass**, bloqueado desde aquí por la política de salida (`403` en los dos
endpoints del parche). El detalle está en `COORDENADAS-PENDIENTES.md`.

| ficha | se mete | por qué sigue pendiente |
|---|---|---|
| `faro-santa-cruz-puerto` | 444 m | la coordenada de la Farola del Mar cae en tierra pero **a 1,4 m** de la costa, y el parche exige **3 m o más**; al no pasar, manda su `si_falla`, que es Overpass |
| `pk-poris-abona` | 82 m | `calle_mas_cercana` → Overpass |
| `lidl-puerto-cruz` | 46 m | `osm_lidl` → Overpass **y** el shapefile municipal del Cabildo |
| `pk-bajamar-piscinas` | 28 m | `calle_mas_cercana` → Overpass (el ancla sí cuadra: `piscinas-bajamar` está exactamente donde el parche esperaba) |
| `whale-watching` | 23 m | el empuje a tierra sí sale sin red —daría 28.077710, −16.736308, 33 m de los 60 permitidos— pero su `comprobacion_marina` es **obligatoria** y es Overpass |
| `ermita-san-telmo` | 19 m | `osm_elemento` → Overpass |

El faro merece una nota, porque es el caso que más fácil habría sido dar por
bueno: **cae en tierra**. Si el test hubiera sido «¿está en tierra?» habría
pasado. El parche pedía «en tierra **y a 3 m o más** de la costa», y a 1,4 m
eso es el dibujo generalizado del polígono, no una posición comprobada. Es
justo el margen que separa medir de aparentar que se mide.

**El formato del parche ha quedado atrás.** Pedía los textos con los ocho
idiomas dentro de `index.html`. Hoy `index.html` lleva **solo el castellano**
y los otros nueve viven en `idiomas/<idioma>.json`, que lo pisarían al cargar;
y la app tiene **diez** idiomas, así que al parche le faltan **búlgaro y
polaco**. Aplicado tal cual, un búlgaro seguiría leyendo la descripción de un
faro que ya no existe. Cuando lleguen las coordenadas, el castellano irá a
`index.html`, los ocho del parche a sus ficheros, y el búlgaro y el polaco se
traducen aquí, como el resto del corpus.

## Coordenadas provisionales · el inventario que no suspende

`tools/auditar_redondeo.py` lista dos cosas y **no falla nunca**:

- **13 de 787** fichas tienen lat **y** lng con 3 decimales o menos. Eso no es
  una coordenada tomada de una fuente: es un marcador puesto a ojo, y tres
  decimales son ~110 m de lado. Así fue como un Lidl acabó en el mar. (El
  parche esperaba «al menos 60, entre ellas 9 supermercados y 3 gasolineras»,
  cifras de la copia antigua: hoy queda **1 supermercado y ninguna
  gasolinera**.)
- **8 de 111** fichas de playa, piscinas, surf o windsurf están en tierra a
  más de 150 m de la costa. `piscinas-poris`, que el parche señalaba como
  sospechosa, está a **46 m**: no lo es.

No falla porque ninguna de las dos listas es un error por sí sola —un mirador
con la coordenada redondeada está bien donde está—. Quien falla cuando la
imprecisión tiene consecuencias es `auditar_en_el_mar.py`. Esto es el
inventario de lo que hay que ir puliendo, impreso entero para que no sea un
silencio.

## El planificador de día ofrecía 16 sitios que no existen

Al quitar `montana-colorada` había que sacar su id de `suggestionIds` de la
zona `south`, y al comprobar que no quedaba ninguna referencia suelta
aparecieron **16 más que ya estaban rotas**. El código las traga sin decir
nada:

```js
zone.suggestionIds.forEach(id => {
  const place = places.find(p => p.id === id);
  if (!place) return;          // <-- aqui se pierde, sin error
```

No hay hueco ni error en pantalla: simplemente hay sitios que el usuario nunca
ve ofrecidos. El norte daba 80 de 91, el sur 63 de 67 y el centro 20 de 21.

**Ninguno de los 16 ids existió jamás como ficha.** `git log -S` sobre el
historial completo de `index.html` no encuentra ni uno solo. No fue un
renombrado que dejó cabos sueltos: se escribieron mal el día que se creó la
lista. Eso cambia el arreglo — no había nada que restaurar.

```
        antes          ahora
norte   80 de 91  ->   80 de 80
sur     63 de 67  ->   64 de 64
centro  20 de 21  ->   20 de 20
```

**Diez se han quitado sin perder nada**: la misma zona ya ofrecía ese sitio con
otro id (`taganana`→`nucleo-taganana`, `arico`→`ciudad-arico`, y así). Dos no se
veían por el id: `faro-buenavista` es `faro-teno`, cuya propia ficha lleva
`cat: "Faro Histórico · Buenavista del Norte"`; y `el-sauzal`/`los-silos` ya
estaban como `ciudad-sauzal` y `ciudad-silos`, sin el artículo.

**Una se ha cambiado**: `los-cristianos` → `nucleo-los-cristianos`, la única
ficha de localidad con ese nombre en toda la app, que la zona no ofrecía de
ninguna otra forma.

**Cinco se han resuelto quitándolas**, decididas una a una:

| id | por qué fuera |
|---|---|
| `santiago-teide` | Santiago del Teide no es zona norte, y `ciudad-santiago-teide` ya sale en sur y centro |
| `buenavista` (centro) | Buenavista del Norte ya está en el norte; el centro ya tiene Masca con `mirador-maska` y `ruta-masca-playa` |
| `guachinche` | elegir uno de los veinte sería a dedo, y los guachinches abren por temporadas: dato perecedero que no se fija en una sugerencia. Siguen accesibles por su categoría |
| `fajana` | es la Playa de la Fajana (Los Realejos). Existe, pero no tiene ficha y no hay fuente oficial con coordenada. Queda de candidata a alta |
| `farola-mar-santa-cruz` | ver abajo |

**Y aquí me equivoqué.** Escribí que `farola-mar-santa-cruz` «vuelve sola» con
el parche «auditoria-mar-8». No es cierto: **el parche no crea ese id**,
conserva `faro-santa-cruz-puerto` y solo le cambia el `name`, los textos y la
coordenada. La regla correcta es: si esa ficha sale APLICADA, la referencia se
sustituye por `faro-santa-cruz-puerto`; si queda PENDIENTE, no se pone nada,
porque sugerirla sería mandar a alguien a un pin 444 m mar adentro. Hoy
`faro-santa-cruz-puerto` no está en ninguna lista, que es lo correcto.

**Dos faros del sur estaban en la lista del norte.** `faro-rasca` está en
28.0012, −16.6943 (Punta de la Rasca, Arona) y `faro-abona` en 28.148, −16.4272
(Arico), y los dos aparecían en las **dos** listas. Fuera del norte.

El detalle de todo está en `PLANIFICADOR-PENDIENTE.md`.

**El guardia que casi no se pone.** El primer arreglo cambiaba `el-sauzal` por
`nucleo-el-sauzal`, que existe. Al mirar el diff se vio que la lista ya llevaba
`ciudad-sauzal`: el catálogo habría mostrado **el mismo pueblo dos veces**. Por
id no se veía —`el-sauzal` contra `ciudad-sauzal` no casan por patrón—, por
nombre sí. El script de arreglo compara ahora por nombre normalizado, y el
control lista los rótulos repetidos que ya había: «Mesa del Mar» (`mesa-mar` y
`nucleo-mesa-mar`) en el norte y «Playa San Juan» (`san-juan` y
`nucleo-playa-san-juan`) en el sur. No suspende —una playa y un pueblo pueden
llamarse igual— pero en una lista de sugerencias se leen como un duplicado.

**El control está puesto**, en `auditar_datos.js`, junto al que ya hacía lo
mismo con `PLAYAS_ORIENTACION`: *«filas que apuntan a un POI inexistente»*. Y
se ha probado en el navegador, zona por zona: **77, 64 y 17 fichas pintadas**,
ningún nombre vacío, 0 errores de página.

Lleva además dos líneas de inventario que no suspenden. Una son los rótulos
repetidos. La otra, **los sitios ofrecidos en más de una zona**, y esa ha
resultado ser la más productiva: de ahí salieron los dos faros del sur que
estaban en el norte, y después seis más.

**`masca` estaba en norte y sur.** No había que elegir: en la costa oeste las
listas tienen una costura entre el Faro de Teno (28.3421, norte) y Masca
(28.3054), y todo lo de debajo es sur. Su mirador está a **70 m**, su barranco
y su propio municipio (`ciudad-santiago-teide`) ya estaban en el sur. Masca era
la única ficha del sitio en las dos listas. Fuera del norte.

**Y tres no eran «Cumbre».** La zona Cumbre es el Parque Nacional y sus
puertas: Teide, Roques de García, Llano de Ucanca, el Observatorio, Vilaflor a
1.400 m. Estaban ahí `acantilados-gigantes` —cuya propia ficha dice
«acantilados de hasta 600 m, la forma más espectacular de verlos es **desde el
mar en barco**»—, `mirador-maska` («Mirador · Teno») y `ruta-masca-playa`, el
barranco que baja hasta la playa. Las tres seguían además en el sur, que es
donde caen. La cumbre pasa de 20 a 17.

Quedan **4** en dos zonas y las cuatro se sostienen: `ciudad-rosario` (su ficha
dice «Cumbre Dorsal»), `riscos-chio` (las lavas del Chío de 1798, con vistas al
Teide) y las dos puertas del parque, `ciudad-santiago-teide` a 925 m y
`ciudad-vilaflor` a 1.400 m.

## Las 17 cabeceras municipales que salían dos veces

De los empates del planificador salió algo mayor: **17 cabeceras municipales
tenían dos fichas**, una `ciudad-*` y otra `nucleo-*`, con **la misma
coordenada exacta**. Eso eran dos pins apilados en el mapa y dos resultados en
la búsqueda para el mismo pueblo.

Dieciséis se veían por el nombre, que era idéntico —Arafo, Arico, Buenavista
del Norte, El Rosario, El Sauzal, El Tanque, Fasnia, Granadilla, La Guancha, La
Matanza, La Victoria, Los Silos, San Juan de la Rambla, Santa Úrsula, Santiago
del Teide y Tegueste—. **El decimoséptimo no**: `ciudad-vilaflor` se llama
«Vilaflor de Chasna» y `nucleo-vilaflor` «Vilaflor», y sólo apareció midiendo
la distancia, que era **0 m**.

El criterio que los ordena: `ciudad-*` para las cabeceras municipales,
`nucleo-*` sólo para núcleos que no lo son. Se cumple en los **30** `ciudad-*`
y en **23** de los `nucleo-*` que quedan.

**Se han borrado los 17 `nucleo-*`**, y no era sólo deduplicar: la tanda
`nucleo-*` era una generación anterior y más pobre —texto más corto en 16 de
los 17, menos etiquetas— **y con errores**. Tres que se van con ella:

| ficha borrada | lo que decía | lo que dice la que se queda |
|---|---|---|
| `nucleo-la-victoria` | «donde los guanches derrotaron **definitivamente** a los conquistadores en 1495» | «donde **los conquistadores se vengaron** en 1495» |
| `nucleo-la-matanza` | vinos «**DO Ycoden-Daute-Isora**» | comarca vinícola de guachinches (La Matanza es DO Tacoronte-Acentejo; Ycoden-Daute-Isora es la de Icod) |
| `nucleo-los-silos` | «festival de **teatro callejero**» | «Festival del **Cuento** Internacional en diciembre» |

El de La Victoria se contradecía con la propia app: `ciudad-matanza` dice que
los guanches ganaron en 1494 y `ciudad-victoria` que los conquistadores se
desquitaron en 1495, que es la pareja coherente y la histórica. La ficha
borrada decía lo contrario del mismo año.

**Lo que sí se pierde**, y queda anotado por si se quiere recuperar en la
ficha que se queda: Radazul y su puerto deportivo (`nucleo-el-rosario`), el
barrio de Charco del Pino (`nucleo-granadilla`), las fiestas del Carmen
(`nucleo-arafo`), el parapente (`nucleo-arico`), los aguacates y flores
tropicales (`nucleo-santa-ursula`), la iglesia de San Juan Bautista del XVI
(`nucleo-san-juan-rambla`), el mar de nubes y las aguas minerales
(`nucleo-vilaflor`) y los 15 min a La Laguna (`nucleo-tegueste`).

**Las referencias.** Los 17 no estaban en ninguna lista de `suggestionIds` ni
en ninguna tabla. Sólo aparecían en **dos comentarios** que documentan de dónde
salió la coordenada de una parada de TITSA; como el par estaba a 0 m, se
reapuntaron al gemelo y el comentario sigue siendo cierto.

**El fallo que casi cuela, otra vez.** El primer borrado se llevó **18**
fichas, no 17: el script buscaba el final de cada objeto con la línea en blanco
que lo separa del siguiente, y `nucleo-torviscas` va **pegada** a
`nucleo-vilaflor` sin línea entre las dos. Se vio porque `places[]` quedó en
785 y los nueve `idiomas/*.json` en 786. Ahora el final del objeto es lo que
llegue primero —la línea en blanco o el principio de la ficha siguiente— y el
script se niega a escribir si el número de fichas que desaparecen no es
exactamente el que se pidió.

De las dos cosas que quedaban de esa familia, una ya está hecha:
`nucleo-puerto-cruz-old` **no duplicaba nada** y es hoy `nucleo-la-ranilla`
(más abajo). Sigue pendiente **Guía de Isora, que es cabecera municipal y sólo
existe como `nucleo-guia-isora`** —por eso hay 30 `ciudad-*` y no 31—.

## Y un control que empezó a cantar por haber borrado

Al borrar las 17 fichas, `auditar_cirilico.py` se puso en rojo con una
variante nueva: **«Пино» (1) se parece a «Пико» (7)**. No era una errata de
transliteración: «Пино» es *pino*, el árbol, en «Пино през горския пръстен», y
«Пико» es Pico Viejo y Pico del Inglés. Dos palabras castellanas distintas que
se diferencian en una letra.

Lo interesante es **por qué apareció ahora**. El control caza la variante rara
que se parece a una frecuente, y «Пино» tenía dos apariciones: la segunda era
«Чарко дел Пино» —el barrio de Charco del Pino— dentro de `nucleo-granadilla`,
una de las fichas duplicadas. Al borrarla, «Пино» bajó a una sola aparición y
cruzó el umbral de «rara».

Declarada con su motivo en el bloque `CIRILICO-OK` del fuente, que es donde
viven las excepciones de ese control. De paso, ese bloque decía «Estas tres son
legítimas» y listaba **cuatro**: ahora no dice ningún número, porque la lista
ya se cuenta sola y un número al lado caduca en cuanto entra otra.

## La búsqueda ya no depende de las tildes

«santa ursula» sin tilde no encontraba nada. `updateSearchSuggestions` hacía
`p.name.toLowerCase().includes(query)` sin plegar acentos, y **227 de las 787
fichas llevan tilde o eñe en el nombre**: El Médano, Playa de las Américas,
Chío, Fañabé, Roques de García, Güímar. Sólo 7 se salvaban por tener un alias
sin tildes.

Se pliegan **los dos lados**, lo tecleado y el texto, en los tres filtros de
lugares, en el buscador de líneas y en el de paradas. Así valen las dos formas
y ninguna deja de funcionar: quien escribe sin tildes encuentra, y quien las
escribe también.

**El detalle que casi rompe el resaltado.** El idioma de plegar acentos es
`normalize('NFD').replace(/\p{M}/gu, '')` — y `\p{M}` se lleva también el
**selector de variación de los emoji** (U+FE0F), que **cambia el largo** de la
cadena. `highlight()` busca sobre el texto plegado y corta sobre el original,
así que necesita que los índices coincidan. Con `\p{M}`, 38 cadenas del
fichero cambiaban de largo —«Teléfono de la Esperanza (24h) ☎️», los avisos con
⚠️—. Acotado a `[\u0300-\u036f]`, los diacríticos latinos, **las 10.798
cadenas del fichero miden lo mismo antes y después**.

**Y un control se quedó ciego, y cantó.** `auditar_datos.js` contaba «filtros
del buscador que leen alias» buscando el patrón viejo
`p.alias.toLowerCase().includes(searchQuery)`. Al cambiar la forma de la
comparación pasó de 3 a 0 y suspendió — que es lo que tenía que hacer: un
control que no reconoce el código que vigila no está vigilando nada. Se le
actualizó el patrón y se le añadió un hermano que comprueba que **no quede
ninguna comparación sin plegar**, porque plegar sólo un lado cambiaría un fallo
por el contrario.

## Charco Verde estaba en el municipio equivocado

La ficha decía «Piscina Natural · Los Realejos» y el charco está en **La
Guancha**, en la zona de Punta de Marrero. No hizo falta creer a nadie: las
paradas de TITSA traen municipio, y de las seis más cercanas al punto **cuatro
son de La Guancha** —la más próxima se llama «Santa Catalina», que es justo el
barrio costero desde donde se baja—.

La coordenada también estaba mal: 28.3963, −16.659 caía **297 m tierra
adentro**. La buena, 28.400000, −16.658890, queda a **43 m de la costa**.

Y el texto decía **«acceso fácil y gratuito, muy popular entre familias»** de
un sitio al que no llega carretera, al que se baja por un sendero sin
señalizar, y cuyos últimos metros sobre roca volcánica son empinados y
resbaladizos. Reescrito en los diez idiomas con el acceso real y el aviso de
que el charco sólo renueva el agua con oleaje fuerte.

**Y se ha renombrado a `charco-verde-guancha`.** El id viejo decía
«realejos» de un sitio que está en otro municipio, y eso es información
incorrecta, no una fealdad. **Cuesta algo y se sabe**: los ids viajan en los
favoritos guardados, en `localStorage` y sincronizados, así que quien lo
tuviera guardado lo pierde. Decisión tomada sabiéndolo.

El renombrado tocó **tres sitios** en `index.html` —la ficha, la lista del
planificador y `PLAYAS_ORIENTACION`—, los nueve `idiomas/*.json` y un bloque
del polaco. El script se negaba a escribir si no encontraba exactamente esos
tres, que es lo que impide un renombrado a medias: un id a medio cambiar deja
el sitio sin texto traducido y sin orientación, y ninguna de las dos cosas da
error.

## `nucleo-puerto-cruz-old` era La Ranilla

No duplicaba nada. Es **La Ranilla**, el barrio pesquero de Puerto de la Cruz,
con contenido propio —casas de colores, tapas de pescado, ambiente bohemio— y
está a 69 m del centro porque es el barrio de al lado. El sufijo `-old` era un
resto. Renombrada a **`nucleo-la-ranilla`**.

De paso se le arreglaron los textos, que es donde estaba lo de verdad:

- El nombre y la categoría decían «Puerto Cruz», abreviado. Ahora dicen
  **«Puerto de la Cruz»**, el nombre entero, en los diez idiomas —el búlgaro y
  los dos chinos ya lo escribían completo; eran los seis de alfabeto latino los
  que lo cortaban—.
- **El francés y el alemán se dejaban «sin masificación turística»**, la última
  frase, que sí estaba en los otros ocho. Añadida.
- El neerlandés llevaba un compuesto forzado, «Bohemienachtige»; corregido.
- Y el francés de la categoría decía «Quartier Pêcheur», que no es francés:
  **«Quartier de Pêcheurs»**.

## Alta: Playa de La Fajana (Los Realejos)

Playa salvaje de arena negra dentro del Paisaje Protegido de la Rambla de
Castro, célebre por la cascada que cae directamente sobre la arena.
28.398211, −16.587652: **en tierra, a 4 m de la costa**, y las **seis** paradas
de TITSA más cercanas son de Los Realejos.

**La orientación no se pudo medir en el punto.** `ori` alimenta el cálculo de
si una playa está resguardada del viento de hoy, así que un rumbo inventado le
dice a alguien que está protegida cuando le entra de cara. Midiendo la
dirección tierra-mar en cinco puntos a lo largo de la costa salió una
**dispersión de 154°** —dos de los cinco caen en agua: la costa se curva ahí—.
Se usa la de `playa-rambla`, a **614 m** en el mismo tramo, que es `N`, como
las siete vecinas más cercanas. Marcada `deducida:true`, igual que ellas.

## Los ocho datos de las fichas borradas, verificados uno a uno

Al borrar las 17 duplicadas se perdían ocho datos que sólo estaban en la ficha
borrada. Ninguna fuente externa era alcanzable —Wikipedia, eldia.es,
tenerife.es y webtenerife.com dan `000`—, así que se verificó **contra el
propio dato de la app**. Sobreviven dos:

| dato | veredicto |
|---|---|
| Radazul y su puerto deportivo | **SÍ**: la app tiene cuatro fichas de Radazul, entre ellas `puerto-radazul` «Puerto Deportivo Radazul». Añadido a `ciudad-rosario` |
| a 15 min de La Laguna (Tegueste) | **SÍ** en lo esencial: **12 líneas** de TITSA unen Tegueste con La Laguna, a 4,4 km. El «15 min» exacto no se puede verificar, así que se añade el hecho, no el número: «bien conectado con La Laguna en guagua» |
| parapente en Arico | **NO**: la app tiene **seis** despegues de parapente —Taucho, Ifonche, Izaña, La Corona, El Tanque y Güímar— y **ninguno en Arico**. El dato borrado contradecía al propio inventario |
| Charco del Pino con arquitectura colonial | **NO**: no hay ficha de Charco del Pino y lo de la arquitectura no se puede verificar |
| fiestas del Carmen en Arafo | **NO**: no aparece en ninguna ficha, y la Virgen del Carmen es patrona de marineros mientras que Arafo no tiene costa |
| aguacates de Santa Úrsula | **NO**: el único sitio de la app que habla de aguacates es `nucleo-valle-guerra`, otro municipio |
| iglesia de San Juan Bautista del XVI | **NO**: la app tiene la de La Orotava y el Castillo de San Juan Bautista, no ésta |
| mar de nubes y aguas de Vilaflor | **NO**: «mar de nubes» sólo sale en dos fichas de La Orotava |

**Dos de ocho.** De los seis que caen, uno estaba **activamente equivocado** y
los otros cinco eran afirmaciones que nadie podía respaldar. Perderlos fue
ganar.

## La línea de costa vive en un solo sitio

La geometría de tierra/mar estaba copiada en tres ficheros, y **una de las
copias se quedó con el eje Y sin voltear durante semanas**, midiendo contra
una costa en espejo y dando verde. Ahora está en `tools/costa.py` y la
importan `auditar_en_el_mar.py`, `auditar_redondeo.py` y
`fijar_coordenada.py`. Un error en la costa vuelve a ser un error en un sitio.


**Los ocho puertos y marinas se listan aparte, no se callan.** Un puerto está
en el agua por definición, así que se miden igual y se informan en su propio
apartado: que la exención esté escrita y no sea un silencio. Un **faro** sí
cuenta como fallo: se construye en tierra o sobre un dique.

## El asistente · 69 respuestas en 10 idiomas, y por qué no bastaba traducirlas

`CHAT_KB` tiene 79 entradas y todas están escritas en castellano y en nada
más. A un alemán que preguntaba por el permiso del Teide se le contestaba en
castellano, y no había forma de notarlo desde fuera: la respuesta llegaba
igual, solo que en otro idioma. Las 69 entradas nuevas vienen redactadas en
los diez, cada una con sus propias claves de búsqueda, y viven en
`faq/<idioma>.json` porque el móvil solo necesita el suyo: 13 kB
comprimidos en vez de los 130 de las diez juntas.

Al enchufarlas salieron tres cosas que no eran de los datos sino del motor, y
las tres dejaban al usuario sin respuesta sin que nada pareciera roto:

**`chatNorm` borraba el cirílico y el chino enteros.** El filtro era
`[^a-z0-9\s]`, así que `chatNorm('плажове')` y `chatNorm('海滩')` devolvían la
cadena vacía. El asistente no podía entender una sola palabra en búlgaro ni en
chino por muy bien escritas que estuvieran las respuestas. Ahora conserva
cualquier letra o cifra, del alfabeto que sea. NFD separa la tilde de la letra
y el `replace` siguiente se la lleva —eso es lo que hace que «wejście»
encuentre «wejscie»—, pero **NFD no descompone las letras con trazo**: la ł
polaca, la ø danesa y la ß alemana no son letra más acento, son otro carácter,
y hay que doblarlas a mano o el polaco se queda sin media lengua.

**Una clave de varias palabras exigía el orden exacto.** Un alemán escribe
«Genehmigung für den Teide» y la clave es «teide genehmigung»: las dos
palabras están, el orden no. Eso no puntuaba nada y la pregunta se iba a la
entrada castellana de `CHAT_KB`, que puntuaba 2 por el token «teide» suelto.
Ahora la frase descolocada puntúa, menos que la frase entera, y hacen falta
dos palabras de tres letras o más. Las vacías no llegan: `tokset` se
construye sin las de `CHAT_STOP`.

**El vocabulario de las categorías estaba en castellano y en inglés.** Quien
escribía «海滩» o «плажове» no encontraba las playas, y no era que la respuesta
no estuviera traducida: es que no había respuesta. El nombre de cada categoría
ya estaba escrito en los ocho idiomas dentro de `LANGS.categories`, que es lo
que sale en el menú del mapa; ahora la búsqueda lo consulta. Una sola fuente,
ningún vocabulario nuevo que mantener, y el día que alguien corrija un rótulo
la búsqueda se corrige con él.

Y una cuarta que solo se vio porque el control la buscó: **119 botones de
seguimiento de 621 no llevaban a ninguna parte.** Los botones mandan su propio
texto a `processUserMessage`, así que un rótulo que no case con las claves de
la entrada a la que apunta es un botón que se pulsa y contesta otra cosa. El
rótulo se añade ahora a las claves de su propia entrada, al cargar y no en el
JSON, porque es un dato que ya está escrito y duplicarlo sería mantener dos.

`tools/auditar_faq.js` no se conforma con que el JSON esté bien formado: coge
cada entrada, le hace su propia pregunta al buscador de verdad —el de
`index.html`, no una copia— y comprueba que le contesta ella. 621 de 621. Una
respuesta perfectamente traducida a la que no se llega nunca no sirve de nada,
y eso no se ve leyendo el fichero.

Dos desempates decididos a mano, y escritos aquí para que no se deshagan solos:
«help», «hilfe», «aiuto» y «pomoc» se las queda emergencias, no la ayuda de la
app —quien escribe eso puede estar pidiendo ayuda de verdad, y el manual está
a un toque en la barra de abajo; al revés no—; e «insolación» y «golpe de
calor» se las queda la entrada de salud, no la del sol, que habla de crema y
de índice UV. Contra una batería de 52 preguntas en castellano e inglés, esas
dos son las únicas dos que cambian de entrada: el resto va donde iba.

La entrada del Teide de `CHAT_KB` decía que el permiso de la cima era gratuito
y que se reservaba en `reservasparquesnacionales.es`. **Las dos cosas dejaron
de ser ciertas.** Queda ahí la versión corta y correcta —Tenerife ON, tarifa
en la franja del teleférico, plazas los lunes a las 07:00— porque es la que
sale si el fichero del idioma no ha llegado; el detalle está en las quince
entradas del bloque del Teide.

**Lo que falta:** el polaco. Los bloques vienen redactados en él y
`faq/pl.json` existe, pero la app no tiene polaco: no está en `LANGS`, ni en
`idiomas/`, ni en el menú. Las respuestas están; la app todavía no sabe
enseñarlas.

## Idiomas · 33 tablas, 813 filas (y 2.416 filas, dentro y fuera del fuente)

Las tablas se declaran con `const`, así que **no están en `window`**: hay que
alcanzarlas por nombre desde el ámbito global, y las que viven dentro de una
función hay que sacarlas del fuente. Un barrido que solo recorra `window`
encuentra 2 de 31.

El módulo PWA —banner de instalar, aviso de versión nueva y el panel de la ⓘ
entero— **iba fijo en español en los ocho idiomas**: 25 textos. Ya está en
`PWA_TX`, con la misma forma que `UI_TX`, así que la auditoría de idiomas lo
recorre sola. Y con el control ampliado salieron 12 más sueltos por la app
(tienda, GPS, portapapeles, «Cómo llegar»), también traducidos.

**Y en septiembre salieron 10 más**, que el control seguía sin ver por tres
agujeros distintos, no por uno:

| se escapaba porque | ejemplo | dónde salía |
|---|---|---|
| iba por `innerHTML`, y el control solo miraba `textContent` | «Sin foto en Wikipedia», en rojo | 270 fichas, casi siempre |
| es una palabra suelta: ni acento ni dos palabras funcionales | `⏳ Calculando…` | botón de calcular ruta |
| el `\|\|` de un respaldo **dos líneas más arriba** lo daba por traducido | «Servicio no configurado todavía.» | entrar y registrarse |

El tercero era el peor: el control miraba 140 caracteres hacia atrás a pelo,
así que un `L().authErrorEmail || 'Email inválido'` de otra sentencia lo
callaba. Ahora el contexto **se corta en la sentencia**.

Dos no eran solo de idioma. `addSouvenirToCart` sacaba el nombre del souvenir
quitando del título la palabra «PRÓXIMAMENTE» —que `applyUiTx` traduce—, así
que en inglés el producto entraba en la cesta como *Camiseta Tenerife Go
COMING SOON*, **con un id distinto en cada idioma**: el mismo artículo abría
una línea nueva por idioma en vez de sumar unidades. Medido, no deducido:

```
antes   es camiseta-tenerife-go · en camiseta-tenerife-go-coming-soon · zht camiseta-tenerife-go-即將推出
ahora   los tres  camiseta-tenerife-go
```

Y el botón volvía al literal `'Comprar'` 1,5 s después del clic, pisando el
rótulo que había puesto `tx('shopBuy')`: `Buy → ✓ Added → Comprar`.

**El propio control tenía un punto ciego, y era el peor posible.** Para dar
una entrada por fila pedía que tuviera `es` **y** `en`. Consecuencia: una fila
a la que le faltaba precisamente el inglés no la veía nadie. En
`wikiTitleOverrides` hay cuatro así —`teresitas`, `el-duque`, `benijo` y
`playa-americas`— y el control decía **15 filas incompletas donde hay 19**.
Era más ciego cuanto peor estaba el dato. Ahora basta con `es`; de que el
objeto sea una tabla y no otra cosa se encarga el umbral del 60 %.

Las 19 filas incompletas están **todas** en `wikiTitleOverrides`, y no son un
fallo: si falta el título en un idioma se pide el de `es` a la Wikipedia de
ese idioma, no está, y se cae a `es.wikipedia.org`, que sí lo tiene. Es lo
mismo que ya pasa con los otros 786 lugares, que no tienen override ninguno.
El techo es de calidad, no de corrección: rellenarlas pide comprobar contra
Wikipedia qué artículo existe en cada idioma, y **un título inventado no se
nota** —da la misma foto en castellano que da ahora—, así que no se rellenan
a ojo.

**Wikipedia no tiene dominio `zht`.** El chino tradicional y el simplificado
comparten `zh.wikipedia.org`. Quien leía en tradicional pedía
`zht.wikipedia.org`, que no resuelve, perdía el intento en su idioma y
acababa siempre en la Wikipedia en castellano. Era el único de los ocho al
que le pasaba.

| control | resultado |
|---|---|
| Claves que el código pide y no existen en los 8 | **0** de 69 |
| `{marcadores}` descuadrados | **0** |
| Etiquetas HTML descuadradas · cadenas vacías | **0 · 0** |
| Espacios dobles reales | **0** |
| Signos latinos pegados a un hanzi | **0** |
| Los 8 renderizados: botones vacíos · `undefined` | **0 · 0** |

Lo que salta y **no** es fallo, comprobado uno a uno: el alemán abrevia `Min.`
con punto, el italiano escribe `circa` sin él, las fechas van `25.4.2024` /
`25-4-2024` / `2024年4月25日`, y los decimales `1.5 km` frente a `1,5 km`.

**zh contra zht.** De los 104 pares que OpenCC quiere cambiar, **101 son
vocabulario de Taiwán**, que es lo correcto: 網路/網絡, 資料/數據, 檔案/文件,
登入/登錄, 帳戶/賬戶, 公車/公交, 路線/線路, 儲存/保存, 搜尋/搜索, 應用程式/應用,
選單/菜單, 圖示/圖標, 資訊/信息, 造訪/訪問, 即時/實時, 目前/當前, 字元/字符,
裝置/設備, 轉乘/換乘, 大眾運輸/公共交通, 收件匣/收件箱. Los otros tres son
`LANGS.code` 簡/繁, `TTS_LOCALE` zh-CN/zh-TW y `LANGS.flag` 🇨🇳/🌏, deliberados.

`zht` se construye copiando `zh` y aplicando `ZHT_OVERRIDES`. **Una clave que
falte no da error: muestra chino simplificado en silencio**, y ninguna
comprobación de «claves ausentes» lo detecta. Por eso la comparación se hace
carácter a carácter con OpenCC, no por presencia.

`wikiTitleOverrides` no está en los 8 a propósito: `getWikiTitle` cae a `es` y
`fetchWikiPhoto` prueba `[idioma, 'es']`.

## Seguridad

Regresión con datos hostiles —rótulo `<img src=x onerror=…>`, color
`red" onload="…`, panel apuntando a `evil.com`— sobre el panel admin, la cadena
souvenir→cesta, los anuncios y el bloque de guaguas:

```
payload renderizado como texto            sí
<img> inyectados · elementos con on*      0 · 0
window.PWNED                              false
panel evil.com · javascript: · http://    rechazados
panel https://metrotenerife.com.evil.com  rechazado
panel https://opendata.metrotenerife.com  aceptado
```

```
eval · new Function · document.write       0 · 0 · 0
target="_blank" sin rel=noopener           0 de 9
__proto__ / constructor[]                  0
interpolaciones sin escapar en guaguas     0
```

Lo que un `grep` marca y **no** es hallazgo, verificado en cada caso:
`safeDirUrl` es `escapeAttr(…)` de la línea de arriba; `renderLineBadge` valida
el color con `/^#[0-9a-f]{3,8}$/i`; el `window.open` de WhatsApp sí pasa
`'noopener,noreferrer'`; los colores que van a `style` son datos propios y los
69 de línea y 93 de lugar son todos `#rrggbb`.

`frame-ancestors` sigue ausente de la CSP porque **desde `<meta>` no es
aplicable** y GitHub Pages no deja poner cabeceras: por eso el antiframe está en
JavaScript. `'unsafe-inline'` en `script-src` es inevitable con manejadores
inline por toda la app, así que **el escapado correcto es la defensa principal,
no la secundaria**.

## Integridad de datos

| control | resultado |
|---|---|
| Ids de línea repetidos · números compartidos | **0 · 0** |
| Ids de parada repetidos | **0** de 6.263 |
| Referencias huérfanas al catálogo (paradas) | **0** |
| Referencias huérfanas en `suggestionIds` (planificador de día) | **0** de 164 |
| Paradas o lugares fuera de Tenerife | **0** |
| Parada repetida consecutiva en una línea | **0** |
| `via` con punto mal formado | **0** de 26.593 |
| Lugares completos (id, nombre, categoría, coordenada, color, emoji) | **786** |
| Ids de lugar que cumplen `[a-z0-9-]` | **786** |
| Con calidad de agua, y su año | **46** · 46 |
| Con alias de búsqueda, que los 3 filtros leen | **58** |
| Con aviso `warn`, y su tipo existe en `WARN_I18N` | **115** · 0 huérfanos |
| De esos, `warn:"mar"` | **49** |
| URLs de lugar sin cifrar | **0** de 16 |

Lo que aparece y **viene de TITSA tal cual**: las paradas 5279 «La Romántica» y
5280 «Geranios» comparten coordenada exacta en `stops.txt`, y 73 paradas no
traen municipio.

Y una consecuencia del diseño: **7 líneas marcan más de 2 paradas como
terminal**, porque `esTerminal` va por `stop_id` y esas líneas pasan por su
propia cabecera a mitad de recorrido. El 🏁 sale donde toca.

## Rendimiento

```
botón de aeropuerto sur      7 líneas · 169 capas · 128 ms
las 183 de golpe             6.448 capas · 2,4 s   (caso extremo, la UI no lo hace)
índice del planificador       6.263 paradas, sin degradación medible
carga completa                0 errores de página
```

Dibujar la `via` como **una sola polilínea** en vez de trocearla es lo que
sostiene esto: trocear subía el botón de aeropuerto de 31 a 467 ms y dejaba 986
capas con solo 6 líneas. El troceo se conserva únicamente para el caso sin
`via`, que hoy no se da en ninguna línea.

**Los arreglos de septiembre no cuestan.** El mismo guion, el mismo servidor,
cinco arranques cada uno, contra los dos ficheros seguidos:

```
                      antes            ahora
arranque mediana      664 ms           678 ms      (643-684  /  658-710)
montón de JavaScript  19,2 MB          19,2 MB
8 cambios de idioma   124 ms           137 ms
```

Los 14 ms de diferencia caen **dentro del margen de las propias tiradas**, que
se solapan. Lo que se añadió son 7 filas de traducción; lo que se quitó, tres
plantillas de HTML de depuración.

**El peso es el problema real, y no es el GTFS.** De los 1,27 MB comprimidos,
más de la mitad son los textos de `places` en ocho idiomas, de los que cada
usuario lee uno. Servir solo el idioma activo ahorraría del orden de 900 kB sin
comprimir, pero rompe el fichero único y el funcionamiento sin conexión: es una
decisión de arquitectura, no un arreglo.

---

# 3 · Lo que falta

## Un charco que no existía · resuelto quitándolo

`charco-infierno-arafo` medía **10,2 km al mar**, contra menos de 614 m los
otros 99 puntos de baño: dos grupos separados, y de eso sí se puede afirmar
cuál está mal. Lo cazó el control nuevo de `auditar_ubicacion.py`, que mide
contra el anillo de costa de GSHHG —solo mar— además de contra la capa `water`
de OSM, que incluye balsas y embalses y tenía una a 279 m.

**Y al buscarlo, no existe.** Ni en Google Places ni en la web abierta hay un
«Charco del Infierno» en Arafo. Los dos que llevan ese nombre son el de
Almogía (Málaga), que es un río de otra provincia, y el **Barranco** del
Infierno de Adeje, que es un barranco de senderismo en la otra punta de la
isla —y ese sí está en la app, como `sendero-barranco-infierno`, categoría
`senderismo`, en Adeje—.

Así que no era una coordenada mal escrita: era un punto inventado, con
descripción y etiquetas verosímiles («piscina natural en la costa de Arafo»,
`Costa`, `Atlántico`). **Se ha quitado.** No se corrige lo que no existe.

```
lugares  805 → 804    charcos 27 → 26    warn 116 → 115    warn:"mar" 50 → 49
```

Entró en `4f491e8`, con el lote de las zonas de baño. Los otros 39 de ese lote
pasan la medida contra la costa, pero **pasar la medida de sitio no demuestra
que el sitio exista**: eso solo se comprueba contra una fuente, y esa
comprobación no la hace ninguna herramienta del repositorio.

## Bloqueado por terceros

- ~~horarios de socorrista~~ **resuelto hasta donde se puede.** La tabla
  oficial está congelada en septiembre de 2023, y ya se sabe **por qué**: la
  comunicación anual que la alimentaba dejó de ser obligatoria al anularse el
  decreto. **No van a llegar datos de 2024, 2025 ni 2026** mientras no se
  apruebe el nuevo modelo. Confirmado por la Subdirección de Protección Civil
  y Emergencias, agosto de 2026.

  Lo que hace la app ya es lo correcto y no hay que cambiarlo: etiqueta neutra
  —«🚩 Bandera y socorristas (oficial)»— y enlace al visor oficial **centrado
  en la playa**, sin horarios grabados. Un horario del 23 escrito en la ficha
  sería peor que no ponerlo.

  Lo que sí queda contado, para que no vuelva a aparecer un número sin lista
  detrás —el «13» que decía esta línea no tenía ninguna—:

  ```
  99 zonas de baño   ·   24 con socorrista   ·   14 sin él   ·   61 sin dato
  ```

  `lifeguard` tiene tres estados y `false` **afirma** que no hay socorrista:
  ausente no afirma nada, y por eso los 61 se quedan callados. Y el horario,
  si algún día llega, **no cabe en ninguna ficha: el campo no existe.**

- ~~la secuencia del tranvía~~ **cerrado, ver abajo**.

### La orientación de playa no es un campo publicado

Comprobado abriendo cada fuente, no supuesto. Esto cierra la pregunta «¿habrá
por ahí una base de datos con esto?», que si no se vuelve a hacer cada pocos
meses:

| fuente | veredicto |
|---|---|
| **surf-forecast.com** | **sirve, con techo.** 26 spots en Tenerife, ~12 coinciden con puntos de baño nuestros. De ahí salen las 11 filas verificadas. Las playas abrigadas —las que la gente usa para bañarse— no son spots y no tienen ficha |
| **AEMET, predicción de playas** | no. Cubre todas las playas oficiales, pero el viento va **solo en intensidad, sin rumbo**. Comprobado en la ficha de San Marcos (código 3802201) |
| **MITECO, Guía de Playas** | no. Base completa del Estado, ~3.000 playas, nueve secciones por ficha, y la orientación no es ninguna |
| **Catálogo del Decreto 116/2018** | no para esto. Clasifica libre / peligrosa / prohibida y asigna grado de protección; no es un catálogo de características físicas |
| **los 27 charcos** | ninguna fuente los cubre. No son playas censadas ni rompientes |

**Dónde sí vive el dato: los Planes de Seguridad y Salvamento (PSS)**, uno por
playa o zona de baño, firmados por técnico habilitado e inscritos en el
Registro Autonómico de la Dirección General de Seguridad y Emergencias. Su
capítulo 1 describe emplazamiento y análisis de riesgo, que es exactamente
donde están la orientación, los vientos dominantes y las corrientes. No son
datos abiertos: se accede por sede electrónica y están pensados para técnicos
de entidades locales.

**Y es el mismo canal que los 13 horarios de socorrista.** Un PSS trae las dos
cosas, así que una sola petición cierra los dos bloqueos que quedan.

**El decreto que sostenía todo eso está anulado**, y conviene tener claro qué
cae y qué no:

| | |
|---|---|
| **cae** | el deber de redactar y actualizar los PSS · el Catálogo · la comunicación anual de horarios de socorrismo, que es el artículo que citaba nuestra carta anterior |
| **no cae** | los **126 planes** que llegaron a elaborarse y registrarse, de los 365 que hacían falta sobre 750 zonas de baño de Canarias. Son documentos que existen |

**Y el canal ya no se adivina: lo dio la propia administración.** La
Subdirección de Protección Civil y Emergencias indicó que las peticiones de
datos de playas van por el **portal web de GESPLAN**, a la atención de la
**Directora Técnica del Encargo de Playas** — que es además quien tiene los
servicios ArcGIS `cat_playas_zbm`, donde estarían la orientación y el
socorrismo. Una vía nominal señalada por quien lleva el dato vale más que un
procedimiento formal dirigido a quien no lo lleva.

El borrador está en `SOLICITUD-GESPLAN.md`. No cita ningún artículo: por ese
canal no hace falta fundamento legal, y no citar nada es la única forma segura
de no volver a citar algo derogado.

**La atribución ya está puesta.** La administración pide indicar fuente **y
origen**, siendo el origen el portal de donde salen los datos. `banderasFuente`
nombra ahora las dos cosas en los ocho idiomas: la Subdirección como fuente y
el portal Infoplayas Canarias como origen.

## Se puede hacer, hace falta un dato

- ~~73 paradas sin municipio~~ **cerrado**: cruzadas con los límites
  municipales del Cabildo. Las 2.514 tienen municipio y son los 31 de la isla.
- ~~precios que afirman lo que TITSA no cobra~~ **cerrado**: ver abajo.

## Decisión pendiente

- ~~351 rótulos repetidos sin distinguir~~ **cerrado**: la fila del buscador
  pinta el municipio. «Cementerio» daba cinco filas con texto idéntico y ahora
  da cero. Los 351 rótulos siguen ahí —son sitios distintos de verdad— pero ya
  se distinguen.
- ~~210 marquesinas invisibles~~ **cerrado**, y resultó ser mayor: el catálogo
  lleva ahora un índice `parada → líneas` sacado de cruzar los **861 patrones**
  del GTFS. **787 paradas ganan servicio** —las 210 que no salían y 577 que sí
  salían con la lista de líneas incompleta— y las referencias pasan de 5.827 a
  **7.348**. Ninguna pierde nada.
- ~~El detalle OSM: z14 o z15~~ **cerrado: z14, y no provisionalmente.**
  El disparador que quedaba —«medir la carga en 5G y en una barra»— ya está
  medido, y sin subir a Anaga con el móvil: Chromium estrangula la red de
  verdad por CDP. `node tools/carga_mapa.js` lo repite.

  ```
  red               Mbps    z14 real   z15 (regla 3)   montaje
  5G bueno           100       1,3 s           2,7 s      5 ms
  5G normal           50       2,1 s           4,6 s      3 ms
  4G bueno            20       5,0 s          10,7 s      3 ms
  4G flojo             5      19,2 s          41,2 s      3 ms
  una barra            2      48,0 s         102,8 s      3 ms
  muy mala señal     0,5     191,8 s         410,4 s      3 ms
  ```

  **El montaje son 3 ms.** Leer la cabecera y construir el lector sobre el Blob
  no cuesta nada: la espera **es transferencia y solo transferencia**. Por eso
  el tamaño manda de forma tan directa.

  **En una barra, z14 ya hace esperar 48 segundos. z15 pasaría de minuto y
  medio.** Y ese es justo el sitio donde el mapa sin conexión existe: en Anaga
  y en Teno, donde no hay cobertura. Doblarlo para ganar portales y huellas de
  edificio no se sostiene.

  **La cifra de 24,5 MB para z15 nunca se midió** —era un número recordado, y
  la columna de z15 es regla de tres sobre él—. Pero no hace falta medirla para
  decidir: aunque z15 fuese solo 1,5×, en una barra serían 72 segundos. La
  conclusión no depende del factor exacto.

  Lo que sí reabriría esto no es el tamaño: es **cambiar la arquitectura**. Si
  algún día la app dejara de bajar el fichero entero a un Blob y pidiera rangos,
  el coste dejaría de ser proporcional al tamaño y la pregunta sería otra.

- ~~Las 7 tarjetas de la tienda~~ **cerrado: van en los ocho idiomas.**
  Eran **31 cadenas**, no las 7 descripciones que dije: 7 títulos, 7
  descripciones y 17 detalles. Descontando los nombres propios —Santa Cruz,
  Los Cristianos, Anaga— y `shopMaxPeople`, que ya existía, salen **20 claves
  nuevas × 8 = 160 celdas**, y las filas de traducción pasan de 435 a **455**.

  El mecanismo es nuevo y hacía falta: `applyUiTx` sabía repintar una cadena
  compartida —`each('.badge-soon', …)`— pero aquí cada tarjeta tiene texto
  propio. Ahora cada nodo lleva su clave en `data-tx`, y el número en
  `data-tx-n` cuando la cadena tiene `{n}`. Son 28 nodos. El nombre del
  producto va en un `span` propio dentro del título, porque el título lleva
  dentro la etiqueta PROXIMAMENTE y pisarlo entero se la llevaría por delante.

  **Y al traducir los nombres volvió a entrar el mismo fallo de la cesta, por
  otra puerta.** El id del artículo salía del nombre, así que con el nombre
  traducido pasaba a haber un id por idioma —`camiseta-tenerife-go` en
  castellano, `tenerife-go-t-shirt` en inglés— y el mismo producto abría una
  línea nueva en cada uno. Es la segunda vez: la primera fue la etiqueta
  PROXIMAMENTE colándose en el nombre. **Lo cazó el control que se escribió
  entonces.** Ahora el id sale de `data-souvenir-id`, que no se traduce nunca.

  La cesta además guardaba el nombre del momento, así que quien añadía en
  castellano y cambiaba de idioma se la encontraba a medias. Guarda la clave y
  pinta en el idioma de quien mira.

- ~~Los 19 títulos de Wikipedia por idioma~~ **cerrado: se quedan.** Caen a
  `es.wikipedia.org`, que es lo mismo que hacen los otros 786 lugares, y un
  título inventado no se notaría: daría la misma foto en castellano que da
  ahora. Rellenarlos de verdad pide comprobar artículo por artículo qué existe
  en cada idioma.
- ~~Las playas sin orientación~~ **cerrado: las 99 zonas de baño la tienen.**
  Las 65 que faltaban entraron en septiembre. Procedencia, que no es la misma
  en las tres tandas y por eso se escribe en el propio código:

  ```
  11  respaldo publicado, comprobado abriendo la fuente una por una
   1  piscina-hidalgo-norte, heredada de punta-hidalgo por vecindad (490 m)
  53  deduccion de un modelo de lenguaje, auditada y contrastada aqui
  ```

  **Las 65 van con `deducida: true`, incluidas las 11 con fuente**: el dato
  publicado es el rumbo del oleaje, no el de la playa, y la conversión
  arrastra la misma tolerancia de ±45° que el resto.

  **Contraste independiente, medido antes de aplicarlas.** El método del agua
  coincide con las 65 en 64, y con las 53 sin fuente en las 53. El de la arena
  coincide en 33 de las 38 que se atreve a contestar. **No hay ni una en la
  que discrepen los dos a la vez.**

  **Y una corrección que cambia el veredicto anterior.** Aquí se dijo que el
  método del agua sacaba «6 de 12» y no valía. Ese 6 era con **rumbo exacto**;
  el umbral que se fijó después —≥ 10 de 12 **dentro de 45°**— es otra medida.
  Con la misma vara para los dos:

  ```
  metodo del AGUA    10 de 12 dentro de 45 grados   APRUEBA   (azar 4,5 · p = 0,0016)
  metodo de la ARENA  7 de 12                        no aprueba
  ```

  Y falla exactamente en las dos que estaban anunciadas: `playa-amarilla` y
  `teresitas`, las dos a 90°. Es el caso que se escribió de antemano —«si
  falla solo en esas dos, aprueba, y además apunta a que las escritas a mano
  son las equivocadas»—. Los tres métodos geométricos dicen `SE` para
  Teresitas y lo escrito a mano dice `NE`.

- **`badWind` vacío en las 65, y no es una concesión.** La rama de `deducida`
  de `scorePlaya` **no lee `badWind`**: puntúa por el ángulo de `ori`. Para
  una entrada deducida ese campo es peso muerto. El control nuevo comprueba
  que esa rama **se ejecuta**, porque el objeto que se puntúa se copia campo a
  campo en dos sitios y si `deducida` no llega, las 87 vuelven a puntuar por
  texto sin que falle nada.

- **Tres para mirar si alguien conoce el sitio:** `playa-grande-abades` (el
  spot de la fuente se llama «Porís de Abona (Playa Grande)» y nuestro POI
  dice «(Abades)»: pueden ser dos playas distintas), `benijo` (la fuente da N
  y NW a la vez) y `piscina-gigantes` (ONO cae entre W y NW).

- **Cómo está hoy.** Contado:
  los **99 puntos de baño** (73 playas + 26 charcos) tienen orientación: **87
  `deducida` y 12 escritas a mano**. De las 34, **22 son `deducida`** —del abanico de
  rayos, que mira a 4, 6 y 8 km y por eso es ciego a lo que abriga en el primer
  kilómetro— y **12 están escritas a mano**, que son las fiables. Una lleva
  `noBano`, así que candidatas reales hay 33.

  El recomendador recorre `Object.keys(PLAYAS_ORIENTACION)`, así que antes una
  playa sin fila no era candidata. Ahora lo son las 98 (99 menos
  `playa-los-patos`, que lleva `noBano`).

  Troya, Los Cristianos y Porís entran aquí: son las tres de `ff0f7191`, tienen
  panel de mar y no puntúan.

  **Se rellenan a mano, punto por punto.** No es una tarea bloqueada por un
  dato que no llega: es una tarea que pide conocer el sitio, y la lista está
  preparada para que se pueda hacer poco a poco. Cada fila que entre aparece
  en «¿dónde me baño hoy?» sin tocar nada más.

## Cómo llegaron las playas a 73

Reconstruido del historial, porque la cuenta «39 + 31 = 70» se queda corta y
la diferencia no es un error: son tres fichas que **cambiaron de categoría**,
no que se añadieran.

```
c337d4bc   39 playa · 18 piscinas · 765 lugares
ff0f7191   42        · 18         · 765          +3, sin lugares nuevos
3a6e7356   73        · 27         · 805          +31 playas +9 charcos = 40
hoy        73        · 26         · 786          -1: charco-infierno-arafo, que no existe
                                                 -1: montana-colorada (parche auditoria-mar-8)
```

Las tres de `ff0f7191` son `acc-playa-troya`, `acc-playa-los-cristianos` y
`acc-playa-poris` —el propio asunto del commit las llama «las tres playas que
no puntuaban»—, y son **las mismas tres** que siguen fuera de
`PLAYAS_ORIENTACION` en la lista de decisiones. Pasaron a categoría `playa`
para recibir panel de mar; puntuar en «¿dónde me baño hoy?» necesita su
orientación, que sigue bloqueada.

## Cerrado

- **Las 35 líneas sin verificar**: 22 regeneradas del GTFS y 13 borradas por no
  existir en él. Ya no queda ninguna línea con paradas escritas a mano.
- **Las 18 paradas de `COORDENADAS.md`**: 15 están en la red, y «Realejo Alto»,
  «Suárez Guerra» y «Adeje casco» **no existen con ese nombre en `stops.txt`**.
- **Las 14 filas de `BLOQUE-2.md`**: resueltas por la reconstrucción.
- **`stop_code` / `stop_desc`**: confirmados ausentes del GTFS de TITSA.
- **El mapa sin conexión**: el service worker ya guarda las teselas que el
  usuario ha mirado, en un caché propio que sobrevive a las actualizaciones,
  con tope de 1.200 (la isla entera de z8 a z13 son **600 teselas contadas**
  sobre la caja de navegación del mapa). Red primero y caché de respaldo, así
  que con conexión se comporta exactamente igual que antes.

## El mapa sin conexión, en bloques

Guardar las teselas que el usuario ya ha mirado arregla el caso del avión,
pero no el de alguien que instala la app y se va al monte. Para eso el mapa
tiene que **venir dentro**.

| bloque | qué | estado |
|---|---|---|
| 1 | el motor: `pmtiles` 4.5.0 y `protomaps-leaflet` 5.1.0 en `vendor/`, precargados | hecho |
| 2 | `mapa/tenerife-base.pmtiles`, generado con datos que ya estaban aquí | hecho |
| 3 | la capa vectorial en Leaflet, que entra sola cuando no hay conexión | hecho |
| 4 | descarga opcional de un `.pmtiles` de OSM para el detalle fino | **hecho, con el fichero dentro**: 11,4 MB, build 20260905, z0–z14 |

**Por qué `protomaps-leaflet` y no MapLibre.** MapLibre obliga a rehacer el
mapa entero y con él los 786 marcadores, los clusters y las 183 polilíneas.
Esto es una capa más de Leaflet 1.9.4, la que ya usa la app.

**Sin peticiones por rango.** El fichero pesa 1,1 MB y se pide entero de una
vez, con una fuente propia de cuatro líneas sobre un `Blob`. Así vale en
cualquier hosting estático, lo guarda el service worker como un recurso más y
funciona sin conexión desde el primer arranque. Con rangos dependería de que
el servidor haga *byte serving*, que desde aquí no se puede comprobar.

**La prueba que cuenta.** `tools/auditar_mapa.js` termina haciendo lo que le
pasó al usuario: abrir la app con cobertura, cortar la red de verdad
(`setOffline`, no un evento simulado) y volver a abrirla. Sale la app entera,
la capa se pone sola en la isla, el `.pmtiles` se lee del caché y **se pintan
12 teselas** con los 786 lugares encima. Sin una sola excepción.

**Cuándo entra.** Con conexión no cambia nada: se arranca en Calles y el
fichero **ni se descarga**. La capa entra sola en dos casos —arrancar sin red,
o seis fallos seguidos de teselas, que ya no es un hueco suelto— y se va sola
cuando vuelve la red. Con dos reglas para no pelearse con el usuario: **si
elige capa a mano, no se le cambia nunca más**, y se recuerda cuál tenía para
devolvérsela.

**Medido con el fichero de verdad en la mano** (build 20260905, z0–z14):
**11,4 MB**, compatibilidad **100 %**, y senderos —`path`, `footway`, `track`,
`steps`— en los cinco puntos que muestrea el verificador, Teide y Anaga
incluidos. Se dibuja al 99,7–99,9 % de píxeles pintados. Y los metadatos del
build dicen `version: 4.15.2`: **basemap v4**, la misma generación por la que
filtra nuestro estilo. La duda de v4 contra 5.x queda cerrada con el dato
delante, no con un razonamiento.

**El detalle de OSM (bloque 4).** La maquinaria está entera y probada:
mirar si el fichero existe (`HEAD`, sin gastar datos), descargarlo con barra
de progreso, guardarlo en su propio caché, releerlo, estilarlo con el *flavor*
`light` de Protomaps —que **sí pinta senderos**, `kind: path`— y borrarlo. Se
enciende **solo** el día que aparezca `mapa/tenerife-osm.pmtiles` en el
repositorio: mientras no esté, la sección ni se ve y la app usa el mapa base.

Ese fichero lo tiene que generar una persona: desde este contenedor el proxy
no deja salir a Geofabrik, Overpass ni Protomaps. Cómo, en «Fuera del repo».

**Qué lleva y qué no.** Costa (GSHHG), red viaria (los `via` de las 183 líneas,
trazado real del GTFS) y 54 núcleos con su nombre. **No lleva senderos ni
curvas de nivel**: no están en ningún dato que tengamos. Y la costa de GSHHG
tiene 250–500 m de error en las calas —lo midió el control de orientación—,
así que sirve para saber dónde está el mar, no para saber si pisas la arena.
Para el detalle fino está el bloque 4, que es opcional.
- **Las 4 playas descolocadas más de 300 m**: Almáciga (1.090 m), Benijo
  (829 m), La Rambla de Castro (2.152 m) y Puerto Santiago (420 m), más los
  3 satélites que las acompañan. Anaga estaba corrida un puesto al oeste: el pin
  de Benijo era exactamente el de Almáciga. El orden oeste→este vuelve a ser
  Roque de las Bodegas → Almáciga → Benijo, con 1.278 m y 829 m entre vecinas.

---

## El botón búlgaro fuera del menú, y algo peor detrás

Reportado con dos capturas: la opción «🇧🇬 Българ…» flotando en la cabecera,
saliéndose de la pantalla, y el botón de idioma marcando la bandera búlgara.

**La opción se insertó fuera del desplegable.** Al añadirla busqué el cierre
del bloque de `zht` contando dos `</div>`: el primero cerraba la opción y el
segundo cerraba **`.lang-dropdown`**, así que el bloque quedó detrás del menú,
como elemento suelto de la cabecera. HTML válido, cero errores, y solo se ve
mirando el móvil.

**Y detrás había algo con más alcance.** Esconder la opción con `display:none`
no toca los dos caminos por los que se entra en un idioma:

```
localStorage 'tg_lang'      quien ya lo habia elegido seguia dentro
navigator.language          UN MOVIL EN BULGARO ARRANCABA SOLO EN EL
```

Lo segundo es lo grave: no hacía falta haber elegido nada. Cualquiera con el
teléfono en búlgaro entraba en la versión a medias.

Ahora manda **una sola lista**, `IDIOMAS_INCOMPLETOS`, declarada antes de que
se resuelva el idioma de arranque, y hace tres cosas: esconde la opción en los
dos selectores, hace que `setLang` la rechace, y evita arrancar en ella —
borrando además la preferencia guardada, para desatascar a quien ya la tenía.
Terminar el búlgaro será vaciar esa lista, no ir quitando estilos por el HTML.

Comprobado en los cuatro arranques:

```
móvil en español                     -> es
MÓVIL EN BÚLGARO, sin elegir nada    -> en
alguien con bg ya guardado           -> es, y se le borra la preferencia
móvil en alemán                      -> de, sin tocarlo
```

Tres controles nuevos: que cada opción terminada marque la suya, que **ninguna
opción viva fuera del desplegable**, y que los idiomas sin terminar no se vean
ni se queden puestos.

## Lo que encontró verificar el bloque 1 antes de seguir

**El bloque 1 se publicó, y estuvo mal publicarlo así.** Medido en el
navegador: quien elegía búlgaro veía **2 cadenas en cirílico de 82 visibles**.
El resto no caía a inglés, caía a **castellano**, porque `tx()` hacía
`e[currentLang] || e.es` mientras `localized()` ya hacía `en → es`. Dos cadenas
de respaldo distintas para el mismo problema.

Dos arreglos:

- **El respaldo va a inglés antes que a castellano**, en las siete funciones
  que lo hacían: `tx`, el `g()` de `applyUiTx`, `marTx`, `pushTx` y los tres
  sitios donde el buscador lee `p.cat`. No es cosa del búlgaro: **le pasaba a
  cualquier idioma al que le faltara una fila**.
- **El búlgaro se retira de los dos selectores** hasta que esté completo, con
  `data-incompleto` y sin borrar nada. Ofrecer un idioma a medias es peor que
  no ofrecerlo. El control lo sigue exigiendo, así que esconderlo no lo
  esconde del arnés.

### Y una superficie que ningún control ha mirado nunca

El control de literales solo mira **JavaScript**. El texto escrito directamente
en el HTML no lo ha revisado nadie. Medido poniendo la app en chino y contando
lo que sigue con acentos castellanos, fuera de `<script>`, `<style>` y del
panel de administración:

```
151 nodos de texto   ·  de ellos 70 son nombres de línea de TITSA
 27 atributos        ·  title / aria-label / placeholder
```

Los 70 nombres de línea **son correctos**: son nombres propios y la regla del
proyecto dice no tocar `nombre`. De los 81 restantes, buena parte son el valor
inicial de elementos que se rellenan al abrirse —los tres `*-toast-msg`, por
ejemplo— y no llegan a verse.

**Los 27 atributos sí son un fallo claro**: `title="Mi ubicación"`,
`aria-label="Volver atrás"`, `title="Categorías"`, `placeholder="Buscar parada
o línea..."`… Nadie los actualiza nunca, así que los globos de ayuda y lo que
lee un lector de pantalla están **en castellano en los nueve idiomas**. Es
accesibilidad, no decoración.

**Sin arreglar todavía**, y no se mezcla con el búlgaro: son dos trabajos
distintos y juntarlos es cómo se cuelan los fallos.

## Auditoría antes del bloque 3

**Nada perdido en ningún idioma.** Comparado contra el estado anterior al
búlgaro, tabla por tabla e idioma por idioma:

```
LANGS          es en fr de it nl zh   128 -> 128 claves, ninguna perdida ni cambiada
AUTH_STRINGS   es en fr de it nl zh    33 ->  33
UI_TX          los ocho               116 -> 116      ·   bg: 0 -> 116
```

Importaba comprobarlo: `Object.assign` no fusiona en profundidad y una fila mal
escrita se habría llevado los ocho idiomas por delante sin dar error.

**Las 276 cadenas búlgaras, una a una:**

```
idénticas al castellano       2   los emoji sueltos 📞 y 🕐 · correcto
sin una letra cirílica        1   el ejemplo de correo · corregido a vashiat@email.com
{marcadores} descuadrados     0
emoji que no coinciden        0
espacios dobles · vacías      0 · 0
```

### Y el bloque 3 es más grande de lo que decía

Forzando la app a búlgaro, de 82 cadenas visibles: **28 en cirílico, 44 en
inglés** —el respaldo funcionando— **y 10 todavía en castellano**. Dos de esas
diez son correctas: la firma «By Jérôme B» y un toast que se rellena al
mostrarse. Las otras ocho no están en las 29 tablas del bloque 3: son **texto
escrito en el HTML**.

| lo que falta | tamaño |
|---|---|
| las 29 tablas | **183 filas** |
| la política de privacidad | **225 palabras**, y es texto legal |
| `title` / `aria-label` / `placeholder` | **27 atributos** |
| el banner de publicidad y un título del panel de reservas | 2 cadenas |

El banner de «Sin conexión» **sí** está cubierto: tiene su propia tabla de 8
idiomas y entra con las 183. Menos mal, porque es el mensaje de la función por
la que existe esta app.

La política de privacidad es lo que más peso tiene y no es decoración: es el
texto que dice qué se hace con los datos de la gente, y hoy solo lo entiende
quien lea castellano.

## El búlgaro · bloque 1 de 3, la maquinaria

**Corrección: la auditoría NO se pone roja por esto, y yo escribí que sí.** Las
filas incompletas se imprimen pero no tumban nada —igual que las 19 de
`wikiTitleOverrides`, que están incompletas a propósito—. Lo que estaba en rojo
aquel día era otro control: la cifra de filas del documento, que se había
quedado atrás.

Así que lo que impide que un idioma a medias llegue a nadie **no es la
auditoría**: es `IDIOMAS_INCOMPLETOS` y los tres controles del selector. El
recuento de filas que faltan sale de `node tools/inventario_idiomas.js bg`.

```
bloque 1  maquinaria + LANGS.bg              128 filas   HECHO
bloque 2  AUTH_STRINGS + UI_TX               149 filas   HECHO
bloque 3  las otras 29 tablas                183 filas
                                             ─────
                                             460 filas de interfaz
después   places[]: 1.741 cadenas, 1.566 distintas, 219.800 caracteres
```

Lo que cuesta, **medido quitando el neerlandés entero y comprimiendo**, no
estimado: **231 kB sin comprimir, 80 kB comprimido, un +6,5 %**.

**Y añadir un idioma cegó al control que vigila los idiomas.** Hay dos listas
donde parecía haber una: la que **identifica** una tabla de idiomas y la que
tiene que estar **completa**. Al meter `bg` en la única que había, las tablas
«por idioma» dejaron de reconocerse —la detección exige que estén todos— y el
informe pasó de 31 tablas y 460 filas a **11 y 199**: 261 filas dejaron de
vigilarse. Ahora son `IDI_BASE` para detectar e `IDI` para exigir, y hay dos
copias de esa distinción porque una corre en Node y otra dentro del navegador.

**Dos sitios que no eran obvios.** El botón BG de la pantalla de bienvenida
funcionaba, pero el selector que se usa a diario es otro control —el
desplegable `.lang-option`— y ese no se había tocado. Y su resaltado va **por
índice**: `SUPPORTED_LANGS[i]` contra el orden del HTML, así que reordenar las
opciones pone el tick en el idioma equivocado sin que falle nada. Hay control
nuevo: pide cada uno de los nueve idiomas y comprueba que se marque ese.

Y un comentario que enumeraba «(es, en, fr, de, it, nl, zh)» cuando ya había
nueve: una lista repetida a mano envejece sola, así que se retiró.

## Por qué uno la recibe y otro no

El 9 de septiembre, con el arreglo ya puesto, el envío salió limpio:

```
Resumen -> enviados: 4 | fallidos: 0 | caducados limpiados: 0
```

**Cero fallos y cero caducadas: el servidor no es el problema.** Lo que dice
ese resumen es otra cosa — que en toda la app hay **4 suscripciones**. Quien no
la recibe es, casi seguro, quien no llegó a darse de alta.

Y ahí había un fallo de verdad. `pushInit()` **no ofrece nada** salvo que se
cumplan cuatro condiciones: navegador con push, **app instalada en la pantalla
de inicio**, no haber preguntado ya, y **tres visitas**. Es una decisión de
producto razonable. El problema es la otra puerta: el botón «Activar
notificaciones» de la cuenta **está siempre visible**, y no lo tapaba nadie.

En iPhone, Safari **no expone `Notification` hasta que la app está en la
pantalla de inicio**. Así que quien lo pulsara desde el navegador entraba en
`pushSuscribir`, reventaba en la primera línea y recibía:

> No se pudo activar. Inténtalo más tarde.

**Esperar no arregla nada**, y el mensaje mandaba justo a eso. La instrucción
que lo desbloquea —añadir la app a la pantalla de inicio— no aparecía por
ningún lado.

Ahora el botón se desactiva y dice el motivo, en los ocho idiomas:

```
navegador con push          boton activo, sin mensaje
iPhone en Safari suelto     desactivado + «añade la app a la pantalla de inicio»
navegador sin push          desactivado + «este navegador no admite notificaciones»
```

Se distingue **sin husmear el user-agent**: `standalone` en `navigator` solo lo
trae Safari de iOS. Probado en el navegador con las tres situaciones montadas
antes de que cargue la página.

De paso, tres textos que iban fijos en castellano para los ocho idiomas: el
rótulo del botón, «Activando…» y «Notificaciones activadas ✓». Los tres se le
escaparon al control de literales porque no llevan acento ni dos palabras
funcionales — la misma rendija de siempre.

## La notificación diaria estuvo once días sin salir, en verde

Reportado el 8 de septiembre: «hace más de una semana que no recibo
notificaciones». Diagnosticado abriendo las ejecuciones reales, no el código.

**GitHub no lanza los cron a su hora.** Medido sobre las ejecuciones del 29 de
agosto al 8 de septiembre: salen entre **4 y 6 horas tarde**, todos los días.

```
cron puesto      08:07 · 08:37 · 09:07 · 09:37 UTC
salio de verdad  12:49 · 13:02 · 13:32 · 13:47 UTC   (8 de septiembre)
                 14:11 · 14:25 · 15:01 · 15:09 UTC   (7 de septiembre)
```

Y el guion tenía su propia ventana, `TARGET_HOURS='9,10'` en hora de Canarias.
Las ejecuciones caían a las 13-16h, así que la ventana las rechazaba **todas**:

```
Hora Canarias: 2026-09-08 14h
No es hora de enviar (permitidas: 9, 10). Salgo.
```

**El paso duraba 0 segundos y el job terminaba en «success».** Once días.

Tres arreglos, y el tercero es el que importa:

1. **Los cron se adelantan** a 04:07-07:07 UTC. Con 5 h de retraso aterrizan
   entre las 11 y las 15 de Canarias; si algún día GitHub va puntual,
   aterrizan entre las 6 y las 10.
2. **La ventana se ensancha** a 7-16h. No era ella la que impedía enviar dos
   veces —eso lo hace `push_sends`, que tiene el día como clave única y
   devuelve 409 al segundo intento—, así que puede ser ancha sin riesgo.
3. **Interruptor de hombre muerto.** El guion consulta cuándo fue el último
   envío y, si hace más de 2 días, escribe `::error::` y sale con 1: la
   ejecución se pone **roja** y GitHub avisa por correo. Un fallo que deja el
   job en verde no lo ve nadie, y este llevaba once días demostrándolo.

La comprobación va **antes** de la ventana horaria a propósito: puesta
después, una ejecución fuera de hora saldría por su `return` y nunca llegaría
a mirar nada. Y el aviso de racha va justo después de marcar el día, no en el
resumen final, porque allí se lo saltaba el `return` de «nadie suscrito».

Probado en los cinco casos con el reloj congelado y la base simulada
(`node tools/simular_notificacion.js`): la ejecución real de ayer con la
ventana vieja sale roja y con el diagnóstico; con la nueva, envía; fuera de
ventana y con retraso, roja; fuera de ventana y al día, verde y callada; e
instalación nueva sin ningún envío previo, verde —no hay falsa alarma—.

---

# 4 · Trampas, por si alguien vuelve a tocar esto

1. **Leer `TITSA_LINES` en crudo no da paradas.** `paradas` es una lista de
   claves y solo se convierte en objetos al hidratar. Un script que mida `p.lat`
   sin hidratar **no falla: devuelve `undefined` y da cifras falsas**. Pasó tres
   veces, una dando «0 de 14» donde eran 7. Usa un cargador que hidrate siempre.
2. **La distancia de un punto a una polilínea es siempre al SEGMENTO, nunca al
   vértice.** Y el error no es uniforme: **infla tanto más cuanto más recto y
   largo es el tramo**, que es justo donde el trazado es más fiel. Este mismo
   fallo ha producido **tres falsos bloqueantes**: las cuatro guaguas del primer
   bloque, las «paradas a 1,5 km de su línea» que al segmento eran 0 m, y Padre
   Anchieta —135 m al vértice, 4,0 m a la vía, en un tramo recto de 503 m—, que
   llegué a dejar escrito como «no lo resuelve ningún fichero público» sin
   volver a medirlo con el criterio ya corregido.
   La medida correcta tiene nombre propio en `tools/cargar.js`,
   **`distanciaAVia(punto, via)`**, para no volver a escribir el bucle a mano.
3. **El trip canónico no es siempre el que más paradas tiene.** Un refuerzo
   escolar puede tener más que el recorrido completo: la 103 acabó sin llegar a
   Santa Cruz. Si se elige por número de paradas, hay que comprobar después que
   las cabeceras declaradas siguen ahí.
4. **`stop_times.txt` acumula todos los días de servicio a la vez.** Calcular el
   intervalo sobre el fichero entero da basura: la 475 salía «102 min» teniendo
   25 viajes en 12 horas. Hay que fijar **un día** con `calendar_dates.txt`.
5. **El nombre oficial de una línea también caduca.** La 920 se llama
   `INTERCAMBIADOR PLAZA DE ESPAÑA …` y ninguna de sus 19 paradas se llama Plaza
   de España; la 412 se llama `… LOS ABRIGOS` y no tiene ni una parada allí.
   Manda la secuencia, no el `route_long_name`.
6. **`zht` que falta no da error: muestra `zh`.** No hay comprobación de claves
   ausentes que lo pille. Se compara carácter a carácter.
7. **OpenCC sobre-avisa.** `s2t` impone preferencias de variante (里/裏, 台/臺,
   岩/巖) que son las dos válidas en tradicional. De 21 caracteres marcados una
   vez, 18 eran correctos.
8. **La regla de colapso es el `stop_id`, no el rótulo.** Un rótulo repetido con
   dos coordenadas casi nunca es problema de rótulos: con «Añaza» y «El
   Bailadero» la coordenada vieja no era ninguna marquesina.
9. **El `stopId` va sin sufijo aunque el `id` lo lleve.** Es el que agrupa en el
   buscador y el que usa el filtro de aeropuerto.
10. **Promediar la coordenada de un grupo la saca de la marquesina.** Guardar el
    punto medio de un par ida/vuelta movió 683 claves hasta 40 m. Se guarda la
    del `stop_id` líder.
11. **El filtro de aeropuerto está en dos funciones.** `activateAirportLines` es
    el que enciende las líneas; arreglar solo `updateAirportQuickButtons` deja
    los botones bien pintados y sin efecto.
12. **`scorePlaya` no recibe la entrada de `PLAYAS_ORIENTACION`**: el objeto se
    copia campo a campo dos veces. Un criterio que no se propague **deja de
    ejecutarse sin que nada falle**. Ya pasó con `deducida` y con `lifeguard`.
13. **El abanico de rayos mira a 4, 6 y 8 km**, así que es ciego a lo que abriga
    en el primer kilómetro. Por eso hay 12 entradas escritas a mano.
14. **El caché de 30 min** del panel de baño hace que una prueba mienta si no se
    limpia `tgo_bano_cache_v2` entre escenarios.
15. **Playa Jardín tiene DOS fichas**: `playa-jardin` y `surf-playa-jardin`.
16. **Los ids de lugar son la barrera de los `onclick` inline.** Los manejadores
    inline solo son seguros porque los 786 ids cumplen `[a-z0-9-]`.
17. **`index.html` suelto no es la app.** Leaflet vive en `vendor/`.
18. **Contar cadenas en un fichero de 4 MB es mal método.** Varias
    comprobaciones fallaron por contar la palabra dentro del comentario que la
    explica, o por suponer el número en vez de medirlo.
19. **Un comentario que describe lo que el código ya no hace es peor que no
    tenerlo — y borrarlo sin comprobarlo es igual de malo.** Se quitaron 9
    comentarios «Falta X» dándolos por obsoletos; **4 seguían siendo ciertos**.
20. **No dejar arreglos de circunstancia.** Se metieron tres cambios en el
    contador de portada persiguiendo un «0 lugares» que era un visor sin
    JavaScript. Se revirtieron.
21. **Una norma publicada no es una norma vigente.** El Decreto 116/2018 fue
    anulado (TS 27/9/2023, BOC 82, 25/4/2024) y se usó como fuente para la
    leyenda de banderas. **Y vuelve a aparecer**: en septiembre de 2026, como
    fundamento de que existan los Planes de Seguridad y Salvamento, que es
    donde vive la orientación de playa y donde están los horarios de
    socorrista. Los planes existen; la obligación citada en presente, no
    consta. Una norma anulada no deja de citarse sola: hay que ir a mirarlo
    cada vez que reaparece.
22. **Un nombre de sitio no es un dato** hasta que tiene coordenada y esa
    coordenada cae donde debe. Si no está en `stops.txt`, no entra.
23. **Ordenar paradas proyectándolas sobre `via` no funciona.** Probado contra
    las 183 líneas cuyo orden ya se conoce: solo 84 lo recuperan. **86 de 183
    pasan dos o más veces por la misma parada** y 28 son circulares; una parada
    repetida tiene una posición sobre la vía y dos sitios en la secuencia.
24. **La unión de patrones no es un camino.** Si un patrón hace A-B-C y otro
    A-D-C, {A,B,C,D} no tiene orden. La pregunta «qué líneas paran aquí» es un
    índice, no una secuencia, y se resuelve aparte.
25. **La herramienta de auditoría vive en `tools/`, no en el scratchpad.** El
    contenedor se reaprovisiona y se lleva el scratchpad entero; el repo es lo
    único que sobrevive. Pasó una vez y hubo que reescribir todo el arnés.
26. **Al reaprovisionar, el clon se sitúa en la rama designada, no en `main`.**
    Parece que el trabajo se ha perdido y no es así: está en `origin/main`.
    Se comprueba con `git log --oneline -3 origin/main` antes de tocar nada.
27. **La auditoría de idiomas solo ve las tablas.** Un literal en español
    metido en una plantilla no lo caza ninguna comprobación de claves: las
    cabeceras del buscador decían «17 paradas» en los ocho idiomas y tres
    textos del planificador iban en español fijo. Lo vi en una captura, no en
    el arnés. Ahora hay un control de literales visibles sin `L_`/`tx()`.
28. **Un número en la interfaz tiene que ser el que se pinta.** La cabecera
    contaba 17 coincidencias y la lista se recortaba a 15 sin decirlo.
29. **Un control que da un falso positivo acaba enseñando a ignorarlo.** El
    barrido marcaba `window.open` sin `noopener` porque el regex cortaba en el
    primer `)`, dentro de `encodeURIComponent(...)`. Se equilibran los
    paréntesis: un aviso que siempre es mentira es peor que no tenerlo.
30. **Que un parche verifique su método no verifica su resultado.** El cruce de
    municipios traía tres comprobaciones correctas del shapefile —bbox, área,
    31 municipios— y aun así asignaba **Tegueste al revés**: quería mover a La
    Laguna 15 paradas que ya estaban bien, entre ellas la parada llamada
    «Tegueste», y se dejaba otras 30. Se rehizo el cruce entero por separado.
    El control que lo caza no es repetir el método: es que **cero paradas caigan
    en dos polígonos** y que las 2.514 caigan en alguno.
31. **Una ficha de playa no viaja sola: arrastra sus satélites.** El convenio
    del fichero es que la webcam, la ficha de surf y la de accesibilidad
    comparten la coordenada exacta de su playa —hay **114 pares** así—. Mover
    solo la playa deja el satélite en el sitio viejo: al corregir Benijo, su
    webcam y su pico de surf se habrían quedado clavados **encima de Almáciga**,
    dos chinchetas con «Benijo» escrito sobre la playa de al lado. Antes de
    mover un `lat`/`lng` se listan los POI a menos de 80 m.
32. **La coordenada se contrasta con un dato ajeno, no con el mapa de memoria.**
    Las paradas de TITSA sirven de testigo independiente: el pin viejo de
    Almáciga estaba a 78 m de la marquesina «Las Bajas» y a 1.118 m de «Playa de
    Almáciga»; el nuevo, a 31 m de esta última. Y la geometría `via` prueba que
    un punto cae en tierra: la calzada está en tierra, y los cuatro nuevos
    quedan a 24, 338, 211 y 47 m de una carretera real.
33. **Una tolerancia de un rumbo entero no es un control.** Con 8 rumbos,
    aceptar «separación ≤ 45°» deja pasar un método corrido un puesto entero,
    que es justo el error a cazar. `tools/orientacion.py` informa por separado
    el acierto exacto: 10 de 22, frente a 16 de 22 con la tolerancia ancha.
34. **La resolución de la costa manda sobre el algoritmo.** El corte es limpio:
    todas las orientaciones que el método acierta están a ≤ 210 m del polígono
    de GSHHG y todas las que falla, a ≥ 247 m. Cinco playas están 250–541 m
    tierra adentro del polígono, así que las dos normales caen en tierra y no
    hay lado de mar; Las Américas cae **fuera**, en lo que GSHHG cree mar.
    Afinar el radio no lo arregla: de 100 a 800 m el techo es 13 de 22.
35. **Lo que la app promete offline hay que probarlo offline.** `sw.js` tenía
    las teselas del mapa en la lista de «no cachear nunca», junto a las APIs
    del tiempo, con el argumento de «siempre fresco». Una tesela no es un dato
    vivo: es contenido, como la Wikipedia, que esa misma lista ya dejaba pasar.
    Resultado: en un avión la app arrancaba entera —fichas, buscador, líneas—
    y **el mapa salía en blanco**, que es lo único que no se puede sustituir.
    Ninguna auditoría lo vio porque todas se pasan con red.
36. **Un botón que no encuentra su caché miente sin fallar.** «Vaciar caché del
    mapa» filtraba por el prefijo `tenerife-tiles-`, que no ha existido nunca:
    decía «Caché del mapa vaciada» y no borraba nada. Es el mismo fallo que ya
    se había corregido en `CLEAR_CACHES` y que se quedó a medias.
37. **El caché del mapa tiene que sobrevivir a las actualizaciones.** El
    manejador de `activate` borra todo caché cuyo nombre no sea el suyo; si las
    teselas vivieran ahí, cada versión nueva dejaría al usuario sin mapa
    offline justo cuando actualiza. Por eso van en `tgo-teselas-v1`, aparte, y
    `activate` lo respeta expresamente.
38. **Una respuesta opaca no es `ok`.** Las capas no piden CORS, así que lo que
    llega al service worker es `type:'opaque'`, `status:0`, `ok:false`. El
    `guardable()` de siempre la rechaza, así que aunque se quitara la
    exclusión no se habría guardado ni una tesela. Hay que aceptarla aparte —y
    `Cache.put()` sí la admite, comprobado en Chromium con un segundo puerto,
    que ya cuenta como otro origen.
42. **Un fichero binario generado tiene que salir igual cada vez.**
    `mapa/tenerife-base.pmtiles` daba 4 bytes distintos entre dos
    generaciones seguidas, y eso son 1,1 MB de diff binario en el repositorio
    cada vez que se regenere sin que haya cambiado un dato. Es la hora que
    gzip mete dentro de cada bloque, y dos de ellos —el directorio raíz y los
    metadatos— los comprime la propia librería PMTiles, donde no se puede
    pasar `mtime`. Se fuerza para todo el proceso. **No era el
    `PYTHONHASHSEED`**: se probó con la semilla fija y salían los mismos 4
    bytes. El control lo mira **sobre el fichero**, no sobre el generador:
    222 bloques gzip, ninguno con hora.
43. **La lista de capas estaba escrita cuatro veces.** En `setLang`, en
    `setStyleFromMenu`, en `cycleMapLayer` y en el HTML. Así es exactamente
    como se añade una quinta y se olvida una. Ahora vive en `LAYER_IDS` y las
    etiquetas salen de `etiquetasCapas()`.
44. **`let` no se hoistea: tiene zona muerta temporal.** El arranque sin red
    llamaba a `irAIslaSinRed()` desde antes de la línea que declara
    `_capaElegidaAMano`, así que habría reventado justo en el único caso que
    importa. Las dos llamadas de arranque van después de las declaraciones.
45. **Una prueba puede medir el contenedor en vez del código.** El control de
    «al volver la red, vuelve la capa que había» fallaba: volvía a Calles, las
    teselas de OSM no se alcanzan desde aquí, fallaban seis veces y el propio
    automatismo devolvía a la isla. Correcto, pero no era lo que se quería
    medir. Se le da a la capa una URL local que sí responde, y así el único
    camino vivo es el que se prueba.
46. **`caches.open()` crea el caché con solo mirarlo.** Preguntar si había
    mapa detallado dejaba un caché vacío en cada arranque, que se contaba en
    «Cachés activas» y reaparecía justo después de borrarlo. Primero
    `caches.has()`, y solo entonces `open()`.
47. **Un banco de pruebas que se queda puesto es un mapa falso servido como
    bueno.** El bloque 4 se prueba copiando `tools/datos/prueba-osm.pmtiles`
    a `mapa/tenerife-osm.pmtiles`. Se retira en un `finally`, y además la
    auditoría empieza comprobando que lo que hay ahí no lleva la marca
    `BANCO DE PRUEBAS` de una ejecución anterior que muriera a medias.
48. **Contar lienzos no es ver el mapa.** Si el esquema del `.pmtiles` y el
    del estilo no son de la misma generación, los lienzos se crean y salen
    **vacíos**: mapa en blanco sin un solo error. Comparar números de versión
    no sirve —no siempre están y no dicen lo que importa—. Se mide: se cuentan
    los píxeles que no son el color de fondo que declara el propio estilo. Un
    fichero de OpenMapTiles da 9 lienzos y **0,00 %**; uno bueno, 99,99 %.
49. **Un `except` amplio convierte un fallo de programación en un aviso.** En
    `verificar_osm.py`, la sección que lee tiles envolvía también sus
    conclusiones: un `TypeError` al escribirlas salió como AVISO y el script
    terminó en verde. Pasó de verdad mientras se editaba. El `try` cubre ahora
    solo la lectura.
50. **El centro de la caja de Tenerife es la caldera del Teide.** Muestrear
    ahí para comprobar que hay senderos da un bloqueante falso. Se miran cinco
    puntos y basta con que uno los traiga.
51. **Una mayúscula que no da error.** El censo publica la calidad del agua
    como «Excelente»; el código la indexa por `excelente`. Tal cual, la
    insignia **no sale y no falla nada**. Se normaliza al importar y hay un
    control que rechaza cualquier valor fuera de los tres.
52. **Una guarda que mira solo el trozo emparejado no es una guarda.** Al
    añadir `aguaCalidadAnio` a las fichas que no lo tenían, la comprobación
    de «¿ya lo lleva?» miraba `m.group(0)`, que era solo `aguaCalidad:"…"` y
    nunca contiene el año: 15 fichas se llevaron el campo dos veces. JS lo
    tolera —gana el último—, así que no falló nada. Se vio contando
    apariciones (61) contra fichas (46).
53. **`lifeguard: null` es «no se sabe», y eso hay que dejarlo dicho.**
    `badgeSocorristas` solo pinta con `true` o con `false`, así que `null` no
    afirma nada. Es deliberado: una reseña que menciona socorristas no es
    fuente. El control acepta solo esos tres valores, para que nadie lo
    convierta en `false` por parecer más limpio.
54. **Un número escrito a mano en un control se pone rojo solo.** «y los 765
    lugares siguen encima» se puso en rojo al entrar 40 playas. El número
    sale ahora del propio fichero.
55. **`Range` no hace falta aquí, pero eso hay que probarlo.** PMTiles suele
    leer por rangos, y sin *byte serving* el mapa sale en blanco sin error. La
    app construye la capa sobre un `Blob` y nunca sobre una URL, así que no
    depende de ello —pero basta con que alguien pase una URL para que la
    dependencia vuelva sin que nada falle en local. El control graba **todas**
    las peticiones mientras se carga la capa y falla si alguna lleva `Range`.
56. **Un plural construido a mano dentro de una plantilla se escapa de todo.**
    `` `${n} lugar${n !== 1 ? 'es' : ''}` `` no tiene acentos ni dos palabras
    funcionales, así que ninguna de las dos reglas del control lo veía, y no
    es una clave que falte: es un literal. Había **tres** en el buscador de
    lugares —el contador de la barra, el de la hoja de categorías y la
    cabecera de sugerencias—, en español para los ocho idiomas. Hay un
    control específico para esa forma, y las claves nuevas separan singular y
    plural con `|`, que el chino resuelve con una sola forma.
57. **Una cifra en un documento caduca sin que nada avise.** «31 tablas, 404
    filas» se quedó atrás dos veces en una tarde. Ahora `auditar_web.js`
    coteja ese par contra `AUDITORIA-FINAL.md` y tumba la auditoría si no
    coinciden: saltó en el acto al añadir dos claves.
58. **Cincuenta avisos de seguridad que no se veían.** `warn:"mar"` no
    pintaba nada en ninguna playa: el banner se suprimía si el POI tenía
    panel de mar, «porque el aviso ya se muestra dentro del desplegable». No
    era cierto. El panel lo lleva **todo** POI costero, tenga aviso o no, así
    que no distingue nada; lo que enseña es un texto **genérico por idioma**,
    no el de esa ficha —el que dice «Mar con oleaje y corrientes»—; va
    plegado; y su contenido depende de la API marina, así que **sin conexión
    no sale nada**. Justo lo contrario de lo que un aviso de seguridad tiene
    que hacer. Ahora el banner se pinta siempre, y el genérico del panel se
    calla cuando la ficha trae el suyo. Hay control en navegador: se abren
    dos fichas, una con aviso y otra sin él.
59. **Un comentario puede ser la causa del fallo, no solo su síntoma.** Ese
    `return` llevaba al lado una explicación que sonaba razonable y que era
    falsa, y por eso nadie la miró. La trampa 19 decía que un comentario
    obsoleto es peor que ninguno; este además justificaba el error.
39. **Un control estrecho enseña que no hay nada que buscar.** El de literales
    en español solo miraba `.textContent`/`.innerText`/`.placeholder` y una
    lista de sustantivos. Los 25 textos del módulo PWA iban por `innerHTML`,
    `confirm()` y `alert()`, así que pasaba en verde con el panel entero en
    español. Ahora mira también los diálogos y los atributos, y decide si un
    texto es español por acentos o por dos palabras funcionales: `'⏳
    Localizando…'` no tiene ninguna palabra de ninguna lista.
40. **Y ahora tumba la auditoría.** Un aviso que solo se imprime acaba
    ignorándose, y esto es exactamente lo que se cuela sin que nadie lo mire.
    El panel de administración queda fuera a propósito —va solo en español— y
    se localiza por sus marcas, no por número de línea, que se mueve solo.
41. **Un elemento que se crea una vez se queda en el idioma de entonces.** El
    banner de instalar y el aviso de versión nueva se cachean en una variable
    y se reutilizan. El texto se pinta aparte y se vuelve a pintar cada vez que
    se muestran; y se construye con nodos y `textContent`, no con `innerHTML`,
    para dejar el DOM igual que antes —un `<b>` y un nodo de texto suelto—, que
    es de lo que depende el CSS del banner.

42. **`innerHTML` pinta texto igual que `textContent`.** El control de
    literales en español no lo miraba, y por ahí salían el «Sin foto en
    Wikipedia» de 270 fichas y los dos rótulos de espera del panel de rutas.
    Ahora `CTX` cubre `innerHTML`, `insertAdjacentHTML` y los avisadores.
43. **Un contexto medido en caracteres cruza sentencias.** Mirar 140
    caracteres hacia atrás para ver si hay un `||` de respaldo hacía que un
    literal quedara excusado por el respaldo de **otra** sentencia. El
    contexto se corta ahora en el `;`, la llave o el salto de línea.
44. **Un `showMessage(elemento, tipo, texto)` no se caza nombrando la
    función.** La expresión regular se para en el primer literal de la
    llamada —`'error'`—, lo descarta por no ser español y no mira el
    siguiente, que es el que se lee. Hay que recorrer **todos** los literales
    de la llamada.
45. **Quitar una palabra traducida buscándola en español solo funciona en
    español.** `titulo.replace('PRÓXIMAMENTE','')` no quitaba nada en los
    otros siete, y el texto de la etiqueta se colaba en el nombre y en el id
    del producto. Se quita **el nodo**, no la palabra.
46. **Un control que revienta no es un control.** El bloque nuevo llamaba a
    `wikiDominio()` a pelo: contra el código viejo lanzaba `ReferenceError`,
    tumbaba el proceso y se llevaba por delante los otros tres resultados del
    mismo bloque. Con `typeof` delante, dice MAL y los otros tres se leen.
47. **Un mensaje de depuración enseñado a todo el mundo deja de ser de
    depuración.** El «Sin foto en Wikipedia» rojo llevaba un comentario que
    decía «(para debug)», y el CSS ya traía `.popup-photo.hidden` desde el
    principio para ese caso. Lo mismo con el `Error: ${err.message}` crudo:
    ni está traducido ni le dice nada a quien está en la playa. Va a la
    consola, que es donde se depura.
48. **Una mezcla en tiempo de ejecución esconde la verdad a las
    herramientas.** Las 116 filas búlgaras de `UI_TX` iban en un
    `Object.assign` detrás de la tabla: el navegador las veía y los cuatro
    controles que leen el fuente, no. Da igual que funcione: lo que no se
    puede medir no se puede defender.
49. **Un inventario que busca `const NOMBRE = {` solo encuentra tablas con
    nombre.** El glosario canario, las tarjetas del planificador y los seis
    logros viven dentro de listas, y con 47 filas en español el informe decía
    «completo». Ahora se recorre el fichero entero buscando la forma, no el
    nombre.
50. **`typeof === 'string'` no es «tiene idioma».** Cinco filas valen una
    lista, no una cadena: salían como hueco estuvieran puestas o no. Un
    control que da el mismo resultado en los dos casos no está midiendo nada.
51. **La misma clave puede tener dos formas según el idioma.** Las respuestas
    rápidas del chat son texto suelto en `es` y `en`, y pares
    `['visible','consulta']` en los otros seis. Copiar la forma de `es` deja
    los botones mudos sin dar error. La forma se comprueba contra `zht`.
52. **Un texto traducido no sirve si nadie repinta.** El modal de cuenta, el
    aviso de cookies, «Cómo moverse», el glosario, los botones GPX y
    microclimas tenían sus nueve idiomas y se quedaban en el de arranque:
    pintan una vez y sus funciones no se alcanzan desde `setLang`. Una lista
    de llamadas al final de `setLang` no vale, porque crece de una en una y
    el módulo siguiente se queda fuera. Ahora cada uno se apunta a `TG_IDIOMA`.
53. **Buscar por el último idioma no encuentra al que le falta el último
    idioma.** El barrido localizaba las filas por la clave `zht`. Una fila sin
    `zht` no tiene `zht`: no salía ni completa ni incompleta. Con eso, 84
    horarios daban verde teniendo el chino sin traducir. Se busca por `es`,
    que es el original y lo tienen todas.
54. **Una excepción que vive en la cabeza no es una excepción, es un control
    roto.** Las 15 filas de `wikiTitleOverrides` no se traducen a propósito, y
    el informe salía rojo cada vez hasta que uno se acostumbra a ignorarlo. La
    excepción se declara ahora en el fuente, al lado de la tabla, y la
    herramienta la lee.
55. **Una clave que es un contador global se desalinea sola.** El control
    comparaba la página en dos idiomas apuntando cada nodo con un número
    correlativo. Al cambiar de idioma un panel se rehace, el número se
    desplaza, las dos fotos dejan de casar y los nodos se saltan **en
    silencio**: la política de privacidad entera desapareció del informe sin
    que nadie la tocara. La clave tiene que ser una posición estable, y el
    informe tiene que decir cuántos nodos se quedaron sin pareja.
56. **Clasificar por el nombre de la etiqueta mete todo en el mismo saco.** La
    zona de cada nodo se decidía comparando su id, o su clase, o su etiqueta,
    contra una lista. Todo `<span>` sin clase acababa contado como política de
    privacidad. Se decide con el elemento en la mano, con `contains`.
57. **Un margen de tolerancia tapa justo lo que se busca.** El control de
    `data-tx` admitía hasta cuatro nodos iguales al castellano porque no sabía
    distinguir «Total» —que se escribe igual— de un nodo muerto. Mirando la
    tabla sí se distingue, y entonces el límite puede ser cero.
58. **`UI_TX` no es un objeto, son once.** Se declara con
    `Object.assign({...},{...},{...})` y recibe diez `Object.assign` más.
    Escribir en el primero deja las otras diez partes sin idioma, en silencio.

## El búlgaro · bloque 3, y lo que había debajo

Las 173 filas que faltaban entraron **en el fuente**, fila por fila, detrás de
`zht`. No con un `Object.assign` detrás de la tabla, que era lo que había hecho
en el bloque 2 con las 116 de `UI_TX`: eso funciona en el navegador, pero
`inventario_idiomas.js`, `barrido_idiomas.js` y `auditar_seguridad.py` leen el
fichero, y veían 116 filas sin búlgaro sin poder distinguirlas de un hueco de
verdad. **Un control que no puede ver la verdad es peor que el hueco**: da
verde sobre lo que no ha mirado. Las 116 están ahora también dentro de su fila
y la mezcla en ejecución ya no existe.

El trabajo no lo hace la mano: `node tools/meter_idioma.js bg plan.json`.

### Lo que encontró el barrido, y no era poco

`inventario_idiomas.js` busca `const NOMBRE = {`, así que **solo ve tablas con
nombre**. No veía las filas metidas dentro de listas. Con el búlgaro «completo»
según ese informe, seguían en español:

| dónde | filas | qué es |
|---|---|---|
| `GL_DATA` | 14 | el glosario canario entero (guagua, chacho, gofio…) |
| `DP_CARDS` | 14 | las tarjetas de categoría del planificador |
| `DP_TIME` + `DP_TRANSPORT` | 8 | cuánto tiempo tienes, cómo te mueves |
| `VIS_BADGES` + `SUMMIT` | 6 | los nombres de los seis logros |
| notas de línea TITSA | 5 | horarios del 348, el 342, el 111, el 473 |

`tools/barrido_idiomas.js` ya no busca tablas: recorre el fichero de una pasada
y recoge **todo objeto que tenga los ocho idiomas base como claves directas**,
tenga nombre o no. Son 1.875 filas: 218 de interfaz y 1.657 de `places[]`.

### Lo que el inventario daba por bueno sin mirarlo

La prueba de «tiene idioma» era `typeof === 'string'`. Hay filas cuyo valor es
una lista —`I18N.steps`, `CHAT_STR.qrHome`, `HM_T.items`, `DP_STEP_TITLE`, el
cartel de sin conexión—: salían como hueco estuvieran o no, y **no había forma
de distinguir un caso del otro**. Ahora vale cualquier valor cuya *forma*
coincida con la de alguno de los idiomas base, y la forma distinta se cuenta
aparte.

Eso importaba de verdad en un sitio: las respuestas rápidas del chat son
`['texto visible', 'consulta en castellano']` en todos los idiomas menos `es` y
`en`. Una fila búlgara con la forma de `es` habría dejado los seis botones
mudos — se pintan, se tocan y el asistente no entiende nada. La comprobación de
forma se hace contra `zht`, no contra `es`.

### La cifra de idiomas se mueve sola

«Toda la app en 8 idiomas» y «con fichas en 8 idiomas» están escritas **en cada
idioma**: 19 literales. El día que el búlgaro deje de estar a medias pasan a ser
nueve y nadie se va a acordar. `auditar_datos.js` saca los terminados de
`SUPPORTED_LANGS` menos `IDIOMAS_INCOMPLETOS` —los dos están en el fuente— y
compara. Se mira **solo dentro de literales de texto**: un comentario que diga
«7 idiomas» puede ser cierto porque habla de otro momento.

### Lo que queda en español en los nueve idiomas

`tools/auditar_sin_traducir.js` pinta la página en español, apunta cada nodo,
pide el búlgaro y vuelve a mirar. El búlgaro se escribe en cirílico, así que lo
traducido cambia de alfabeto; lo que sigue igual es **o un nombre propio o un
hueco**, y los nombres propios salen de `places[]`, `TITSA_LINES` y el catálogo
de paradas, no de una lista a mano.

Quedaban **244 textos distintos** que no cambiaban, y la mitad no era falta de
traducción sino que nadie avisaba de que el idioma había cambiado.

### Seis paneles se quedaban en el idioma de arranque

Medido con el navegador en alemán y con el navegador en inglés, pidiendo
después otro idioma:

| panel | con el navegador en español | con el navegador en inglés |
|---|---|---|
| aviso de cookies | «Usamos cookies…» | «We use cookies…» |
| modal de cuenta entero (15 textos) | «Tu cuenta», «Entrar»… | «Your account», «Log in»… |
| «Cómo moverse» | «Cómo moverse» | «Getting around» |
| glosario canario | «Habla como un canario» | «Speak like a Canarian» |
| botón GPX del día | «Descargar ruta del día» | «Download day route» |
| microclimas y fiestas | siempre en español | siempre en español |

Ninguno cambiaba al elegir otro idioma. **No faltaban traducciones**: cada uno
vive dentro de su propia función, pinta su texto una vez al arrancar y sus
funciones no se alcanzan desde `setLang`.

El final de `setLang` tenía una lista de llamadas escrita a mano que había ido
creciendo de una en una según se descubrían. Una lista así envejece sola: el
módulo siguiente se queda fuera y nadie lo nota. Ahora hay un registro,
`TG_IDIOMA`, cada módulo se apunta al definirse y `setLang` los llama a todos.
Un módulo que reviente no se lleva por delante a los demás.

Quedan **260 textos distintos** que siguen sin cambiar. Esos sí son texto fijo
en castellano, y salen igual en los nueve idiomas desde antes del búlgaro: 45
son frecuencias de línea («🕐 L-V, 3 salidas/día»), 51 la política de
privacidad y el resto rótulos, `aria-label` y `title` repartidos por la app.

---

## La auditoría completa de septiembre, y los 84 horarios que nadie veía

El barrido buscaba las filas de idioma **por la clave `zht`**, por ser la
última de las ocho. Parecía cómodo y dejaba fuera justo lo que hay que
encontrar: *una fila a la que le falta `zht` no tiene `zht`*, así que no
aparecía ni como completa ni como hueco. Ahora se busca por `es`, que lo tiene
toda fila de idioma porque el castellano es el original.

Con eso salieron **99 filas incompletas en los ocho idiomas base**, ninguna del
búlgaro:

| campo | filas | qué les faltaba |
|---|---|---|
| `hours` de lugar | 51 | chino simplificado y tradicional |
| `hours` de lugar | 33 | italiano, neerlandés y los dos chinos |
| `wikiTitleOverrides` | 15 | a propósito |

Son **107 lugares con horario y 52 textos distintos**, porque se repiten
(«Urgencias 24h · 365 días» sale en 11 hospitales). Un turista chino leía
`L-V 9:00–17:00` en 84 fichas. Traducidos los 52 textos, los 107 lugares están
completos en los nueve idiomas.

`tools/meter_idioma.js` aprendió a localizar una fila **por lo que dice en
castellano** y a meter varios idiomas de una vez, cada uno en su sitio del
orden `es,en,fr,de,it,nl,zh,zht,bg`. Es lo que hará falta para `places[]`.

### Una excepción declarada se lee en el fuente, no en la herramienta

`wikiTitleOverrides` no son textos: son los títulos **exactos** de artículos que
ya existen en cada Wikipedia. Un título inventado no devuelve el artículo,
devuelve nada. Esa excepción estaba antes en la cabeza de quien leía el
informe, y el control salía rojo cada vez hasta acostumbrarse a ignorarlo.
Ahora se declara al lado de la tabla con un comentario `SIN-TRADUCIR:
<nombre>` y las herramientas lo leen: quien lee el código ve por qué, y el
control vuelve a significar algo.

### Lo que sí está en verde

| bloque | resultado |
|---|---|
| sintaxis | 32 scripts en línea, `sw.js` y `enviar-notificacion.js`, 0 fallos |
| red TITSA | 8 controles · 183 líneas · 6.263 paradas · 2.514 del catálogo |
| datos | 786 lugares · 99 orientaciones · 0 fuera de la caja de Tenerife |
| codificación | NFC puro · 0 mojibake · 0 U+FFFD · 0 CRLF · 0 tabuladores |
| inyección | 0 `eval` · 0 `new Function` · 0 `document.write` · 0 `_blank` sin `noopener` |
| mapa sin conexión | 76 controles · 99,77 % de píxeles pintados · 12 teselas sin red |
| service worker | 21 controles |
| idiomas | 1.971 filas · 0 incompletas en los ocho base |

### La maquinaria de los bloques 1 y 2, comprobada en el navegador

| pieza | resultado |
|---|---|
| `LANGS` | 161 filas · los nueve idiomas sin un solo hueco |
| `UI_TX` | 116 filas · los nueve idiomas sin un solo hueco |
| pedir un idioma a medias | `bg` → `en`, no → `es` |
| Wikipedia por idioma | `zht` pide `zh.wikipedia.org`, que existe |
| `schema.org` | declara `bg` |
| selector | 9 opciones · 0 fuera del desplegable · 8 visibles |
| repintado por idioma | 8 módulos registrados |
| errores de página | 0 |

Los dos únicos invisibles del fichero son **dos espacios duros en francés**
(«Un tour rapide ?», «C'est parti !»), que es la tipografía correcta, y ocho
`ZWJ` de emoji compuestos.

`frame-ancestors` sigue AUSENTE de la CSP y **no es un descuido**: la
especificación prohíbe expresamente ponerlo en un `<meta>` y GitHub Pages no
deja mandar cabeceras. El anti-clickjacking lo hace un script que va antes que
nada. El día que haya un Cloudflare o un Netlify delante, hay que emitirla de
verdad ahí.

---

## Los 260 textos fijos en castellano, resueltos

Eran los que salían igual en los nueve idiomas desde antes del búlgaro. Ya no
queda ninguno: `tools/auditar_sin_traducir.js` da **0 en la interfaz y 0 en la
política de privacidad**.

| qué era | cuántos | cómo se resolvió |
|---|---|---|
| frecuencias de línea | 48 textos | tabla aparte, aplicada al pintar |
| nombres y lugares de fiesta | 20 | dentro del dato, como los demás |
| rótulos, `title`, `aria-label`, `placeholder` | 140 | `data-tx*` + `UI_TX` |
| rótulos de categoría | 34 | les faltaban `labelZht` y `labelBg` a las 34 |
| política de privacidad | 32 | `data-tx` + `UI_TX` |
| aviso de tienda y formulario de negocio | 11 | `data-tx` + `UI_TX` |

**El campo `frecuencia` no se ha tocado.** La clave de `FREQ_I18N` es su valor
en castellano y el valor son los otros ocho idiomas, así que el dato sigue
exactamente igual y el turista chino deja de leer «30 min» y «4 salidas/día»
en castellano en las 179 tarjetas de línea.

El mecanismo `data-tx` solo sabía repintar el texto de un elemento. Ahora
también `title`, `aria-label` y `placeholder`, con las mismas claves y el
mismo barrido: un ciego en alemán oía «Cerrar paradas cercanas».

### Tres cosas que estaban mal y no se veían

**Las fechas de las fiestas salían en castellano en dos idiomas.** `FI_LOCALE`
no tenía `zht` ni `bg` y el respaldo era `'es-ES'`: en chino tradicional y en
búlgaro se leía «14 sept 2027».

**Los once rótulos de grupo de categorías, igual.** `getCatGroupLabel` no
conocía `labelZht` ni `labelBg` y caía a `labelEs`. Ninguna de las 34 entradas
los tenía, y seis no tenían tampoco italiano, neerlandés ni chino.

**Y el control mentía dos veces.** Las dos son la misma clase de fallo: un
control que da verde sobre lo que no ha mirado.

1. *La clave de cada nodo era un contador global.* Bastaba con que el cambio de
   idioma añadiera o quitara un nodo —`fiRender` rehace las 18 fiestas— para
   que todo lo de después se desplazara un número. Las dos fotos dejaban de
   casar, el nodo anterior no se encontraba y se saltaba en silencio: la
   política de privacidad entera **desapareció del informe** de una ejecución a
   la siguiente sin que nadie la tocara. Ahora la clave es el camino del
   elemento más la posición del nodo dentro de su propio padre, y el informe
   dice cuántos nodos se han quedado sin pareja.
2. *La zona se decidía por el nombre del elemento.* Se comparaba el id —o la
   clase, o el nombre de la etiqueta si no había ninguna de las dos— contra una
   lista sacada del panel. Con eso, **todo `<span>` suelto de la aplicación
   contaba como política de privacidad**, porque el panel también tiene spans
   sin clase. Al arreglarlo aparecieron diez textos más que llevaban ahí desde
   siempre. Ahora la zona se decide con el elemento en la mano.

### El eslogan se queda en castellano, y no es un descuido

«Somos parte de ti» lo traduje sin mirar, y hay que deshacerlo: en la pantalla
de bienvenida ese eslogan **está grabado dentro del arte de la marca**, una
imagen, no texto. Traducirlo en la barra superior hacía que el logotipo y la
barra dijeran cosas distintas en la misma pantalla. El módulo de bienvenida ya
lo tenía decidido y escrito desde antes; la decisión estaba, yo no la vi.

### Un `data-tx` se coló dentro de una cadena de JavaScript

El marcado masivo busca un texto y le pega el atributo al elemento que lo
contiene. Si ese texto vive dentro de una **cadena de JavaScript** —y hay HTML
dentro de cadenas, como el panel de instalar la app— el atributo entra **en el
dato**, no en el marcado: la frase ya está traducida entera por idioma y encima
lleva una marca pidiendo que se traduzca un trozo.

Pasó una vez, en `TX.ios`, y lo destapó de rebote el control que compara las
etiquetas HTML de cada traducción con las del castellano: el castellano tenía
un `<b>` de más y los otros ocho idiomas no. Ahora `auditar_seguridad.py` lo
caza directo, y tumba la auditoría: ningún `data-tx` puede vivir dentro de un
`<script>`.

### Lo que no se traduce se declara donde está

Hay texto que no cambia y no es un fallo: la marca, la firma del autor, los
créditos de OpenStreetMap, Leaflet, Open-Meteo y AEMET, los nueve idiomas
escritos cada uno en su propia lengua, los códigos de dos letras, las siglas
(GPS, GPX), las unidades y el panel de administrador. Son **39 sitios**, y la
razón va escrita al lado de cada uno con `data-sin-traducir="<motivo>"`. Si esa
lista viviera dentro de la herramienta envejecería sin que nadie la viera.

El control de `data-tx` también dejó de admitir margen. Antes toleraba hasta
cuatro nodos iguales al castellano porque no sabía distinguir una coincidencia
legítima —«Total» se escribe igual en inglés— de un nodo que no se repinta.
Ahora mira la tabla: si dice cosas distintas y en pantalla sale lo mismo, es un
fallo, y el límite es cero.

---

## El búlgaro dentro de `places[]`

`places[]` tiene 1.705 filas de idioma repartidas en cuatro campos: `desc`
(786), `cat` (786), `hours` (107) y `parking.aviso` (26). Es el bloque más
grande del proyecto: **190.388 caracteres** solo en las descripciones.

**Las 786 categorías están.** 670 textos distintos, en seis tandas. Los
topónimos se transliteran al cirílico, como ya se hizo en el chat y en las
notas de línea; las marcas y los códigos se quedan en latín: HiperDino, Lidl,
Mercadona, PADI, PR-TF, GR-131, TF-1, BC-5, D.O., SCS, BIC.

`tools/meter_idioma.js` aprendió a **filtrar por campo**. Sin eso, un texto que
sirva de categoría y de descripción se escribiría en el sitio equivocado sin
dar ningún error.

### Revisar no es leerlo otra vez

Releer 686 traducciones propias no encuentra nada: se lee lo que se quiso
escribir. `tools/revisar_traduccion.py` mira lo que se puede **perder sin que
nadie lo note**, que es lo que de verdad hace daño en la playa:

| qué busca | por qué importa |
|---|---|
| un ⚠️ que desaparece | el aviso de peligro deja de estar |
| una cifra que cambia | 300 plazas pasan a ser 30 |
| un horario distinto | el turista llega y está cerrado |
| una traducción sin cirílico | se quedó sin traducir |
| castellano dentro del búlgaro | media frase sin traducir |
| letras de otro alfabeto | se cuela una `ј` serbia o una `і` ucraniana |
| una traducción mucho más corta | se ha comido una frase |

Probado contra los cuatro fallos metidos a mano: los caza los cuatro. Lo que
**sí** se queda en castellano a propósito y el control respeta: la dirección
postal detrás del 📍 —hay que poder leerla en la calle y teclearla en el GPS—
y los nombres propios.

Cazó tres erratas mías antes de que entraran: `Каняда с` partido en dos
palabras, `Ла Granja` con los dos alfabetos mezclados y `извајани` con la `ј`
serbia en vez de la `я` búlgara.

### Latín pegado al cirílico dentro de la misma palabra

El revisor aprendió una comprobación más, y siguió mordiendo: la `c`, la `o`,
la `a`, la `e` y la `p` **se ven igual en los dos alfabetos**, así que al
teclear se cuelan y a ojo son invisibles. `Лас Дееcас` llevaba una `c` latina.
No se nota leyendo, pero es otra cadena: el buscador no la encuentra y el
lector de pantalla cambia de idioma a mitad de palabra.

Paró seis en el resto de las tandas: `Лас Дееcас`, `мontverde`, `риба вieja`,
`Ла Монтанieта`, `коregidor` y `Емeterio`. Y una de cifra: `Стопроцентово`
había escrito en letra el `100%` del original.

## La errata muda al transliterar un nombre propio

Transliterar se hace a mano y la errata **no se ve**: `Гранадиля` y `Гранадия`
suenan casi igual. Pero son dos cadenas distintas, el buscador no las encuentra
juntas y, como cada una vive en una ficha diferente, **nunca se ven una al lado
de la otra**.

`tools/auditar_cirilico.py` busca variantes raras muy parecidas a una
frecuente. Encontró tres: una mía de la tanda, cuatro `Фаняабе` y dos
`Гранадиля` mal escritas de tandas anteriores, y `Лас Галетас` donde el resto
del fichero pone `Лас Гайетас`.

Dos decisiones costaron más que el control:

**Qué es nombre propio.** En búlgaro la mayúscula no dice nada, porque toda
frase abre con una. Lo que sí vale: un nombre propio **no se escribe nunca en
minúscula**. El primer intento filtraba por posición —saltar la palabra que
abre frase— y con eso 17 de las 24 `Гранадиля` no se miraban siquiera. Una
errata aparece **una sola vez**: si justo esa vez abre frase, el control se
queda ciego. Ese filtro está fuera.

**Qué diferencia es errata.** El búlgaro declina por el final y el castellano
hace el plural igual (`Америка`/`Америкас`, `Уебкамера`/`Уебкамери`), así que
una diferencia que esté **solo en la última letra** no se mira. La errata de
transliteración cae en medio de la palabra.

Tres parecidas que sí son distintas quedan declaradas con `CIRILICO-OK` junto a
`IDIOMAS_INCOMPLETOS`: `Америка` (el continente), `Каняда` (el singular de
`Ла Каняда дел Капричо`) y `Кармел` (la Virgen del Carmen en búlgaro es del
monte Carmelo; el sitio de Anaga es `Крус дел Кармен`).

Probado inyectando las tres erratas reales: las caza y vuelve a verde. **La
primera versión no cazaba dos de las tres**, y el motivo era que mi propio
comentario en el fuente escribía las formas malas como ejemplo, así que el
control se perdonaba a sí mismo. Ahora se quitan los comentarios antes de
mirar, y el comentario ya no escribe formas malas.

## El bloque 4b, cerrado

| | |
|---|---|
| `desc` | 786 de 786 |
| `cat` | 786 de 786 |
| `hours` | 107 de 107 |
| `parking.aviso` | 25 textos — **no estaban en la cuenta** |

Los 25 avisos de aparcamiento vivían en `parking.aviso`, no en `desc`, así que
no salían en ninguna cuenta de descripciones. Los encontró el barrido, no yo.

El barrido cierra en **2.160 de 2.160** filas: 419 de interfaz, 1.741 en
`places[]`, cero huecos. Solo quedan las 15 exentas por declaración
(`wikiTitleOverrides`, títulos exactos de artículo de Wikipedia).

De paso, una errata del **castellano** que apareció al traducir la playa de
Martiánez: *«El baño es exposto»* por *expuesto*.

## El arranque hablaba castellano en los ocho idiomas

Al mirar la app ya arrancada en búlgaro, el botón de capas del mapa decía
**«Calles»**. No era del búlgaro: pasaba en los ocho idiomas que no son el
castellano.

Los textos de interfaz tienen **dos caminos** y solo uno estaba cuidado:

- **`setLang`**, cuando el usuario toca el selector. Ese estaba bien.
- **el arranque**, cuando la app se construye ya en el idioma del móvil —a
  propósito, porque `setLang` rehace todos los marcadores y arrancar hacía el
  trabajo dos veces—. Ese solo llamaba a `applyUiTx()`, que repasa los nodos
  con `data-tx`. Todo lo que `setLang` escribe **a mano leyendo `LANGS`** se
  quedaba con el castellano del marcado.

Eran ocho nodos: los cuatro rótulos de capa del mapa más el activo, el
*placeholder* del buscador, el título de los microclimas, el de las fiestas y
su nota de fechas móviles. Tampoco se fijaba el `lang` del documento, así que
un lector de pantalla leía búlgaro con reglas de castellano.

**No se ve probando a mano**: en cuanto tocas el selector se arregla y no vuelve
a pasar en esa sesión. Lo sufría justo quien nunca lo toca.

El arreglo no parchea nodo a nodo. Los dos bloques de texto salen de `setLang` a
`pintarRotulosIdioma()` y `repintarModulosIdioma()`, y los llaman los dos
caminos. Van separadas porque en medio hay trabajo caro —`rebuildCategoryList`,
`updateMarkers`— que el arranque no debe repetir, y así el orden de `setLang` no
se mueve ni un paso.

`tools/auditar_arranque.js` carga la página **dos veces por idioma** —arrancando
en él, y arrancando en castellano y cambiando— y compara las dos fotos. No
necesita saber qué textos son: `setLang` es la referencia. Los idiomas los lee
del fuente, así que el día que entre uno nuevo lo mira sin que nadie toque la
herramienta.

Probado quitando el arreglo: **45 textos distintos**. Y comprobado además en
valores absolutos, no solo en que las dos fotos coincidan, porque dos caminos
igual de rotos también coinciden.

## Los idiomas de los lugares salen del fichero

`places[]` guardaba **1.741 filas de idioma** en cuatro campos —`desc`, `cat`,
`hours` y `parking.aviso`—: **1.862 kB de los 2.020** que pesan los nueve
idiomas, el 92 %. Ahora en `index.html` se queda el castellano y los otros ocho
viven en `idiomas/<lang>.json`, que se piden solo cuando hacen falta.

Medido comprimido, que es lo que viaja:

| | gzip |
|---|---|
| antes, todo junto, para todo el mundo | 1.492 kB |
| quien va en castellano | **856 kB** |
| el peor caso, búlgaro (856 + 94) | **951 kB** |

**Solo `places[]`.** Los otros 158 kB —`LANGS`, `UI_TX` y las tablas pequeñas—
se quedan dentro a propósito: esos se ven en el primer pintado y no pueden
parpadear. Una descripción de lugar no se ve hasta que alguien abre un globo.
Sacarlos daría un 8 % más a cambio de que la barra de abajo saliera en
castellano un instante.

### Por qué además se guarda en el aparato

Un `fetch` **no puede** acabar antes de que siga analizándose el documento: su
`.then` es siempre una tarea posterior. Medido, el fichero llega a los 760 ms y
para entonces el mapa ya tiene marcadores, así que habría parpadeo en **cada**
visita.

`localStorage` sí se lee de forma síncrona. La primera vez se baja por red —y
ahí la pantalla de bienvenida está delante— y se guarda; de la segunda en
adelante los textos entran antes de que exista un solo marcador. Comprobado:
visita 1 entra por `repintando`, visitas 2 y 3 por `antesDeMontar`.

Se guarda **un** idioma, no nueve: cada fichero ocupa entre 240 y 420 kB y
`localStorage` tiene unos 5 MB para todo el origen, donde viven también los
favoritos del usuario y los ajustes de la app. Llenarlo de traducciones dejaría
sin sitio a lo que de verdad importa.

Las dos formas de hacerlo síncrono están descartadas a propósito:
`document.write` tiene un control en contra en `auditar_seguridad.py`, y un
`XMLHttpRequest` síncrono congela la página el tiempo que tarde la red.

Si falla, los textos de lugar salen en castellano —contenido legible, no un
hueco— y se reintenta solo cuando vuelve la conexión.

### Lo que casi sale mal, dos veces

**`typeof places` lanza.** `places` es un `const` declarado más abajo en el
mismo `<script>`: antes de su línea está en zona muerta temporal y `typeof`
**no** devuelve `'undefined'`, lanza `ReferenceError`. Con eso, la segunda
visita —la primera que trae datos de `localStorage`— reventaba el bloque
entero: sin `places`, sin mapa y sin nada.

**Dos controles dieron verde sobre lo que ya no miraban.** Al mudar los textos,
`barrido_idiomas.js` pasó de mirar 2.160 filas a mirar 419, y
`auditar_cirilico.py` de 1.136 nombres propios a 353. Los dos dijeron que todo
estaba bien. No lo estaba: lo que faltaba había salido de su vista. Un control
que aprueba lo que ya no mira **da permiso para seguir**, que es el peor
resultado posible. Los dos leen ahora los ficheros y cantan si falta alguno.

### Lo que hace que mover 13.928 textos sea seguro

`tools/partir_idiomas.js` no escribe nada hasta volver a montar `places[]`
desde el fuente recortado más los ocho ficheros y compararlo campo a campo con
el original: **15.669 campos, 0 distintos**. Lleva además un seguro contra la
segunda pasada, que escribiría ocho ficheros vacíos encima de los buenos.

`tools/auditar_idiomas_fuera.js` es el control permanente: que el castellano
siga dentro, que los ocho ficheros tengan esas mismas 1.741 filas, que no
hablen de lugares ni campos que no existen, y que el navegador las pegue de
verdad y en la segunda visita **antes** de montar el mapa. Probado metiendo las
cinco faltas posibles —lugar que falta, campo que falta, id inventado, campo
inventado y texto vacío—: las caza todas.

`meter_idioma.js` ya no escribe dentro de `places[]`: habría dos copias del
mismo texto y ganaría una u otra según el orden.

El service worker sirve `idiomas/*.json` **con red primero**, como el armazón,
porque son la misma cosa: con `cached || fetch` una versión nueva de la app
jamás vería las traducciones nuevas. No se sube la versión del caché: obligaría
a todos a volver a bajarse el mapa base de 1,1 MB sin ninguna necesidad.

### Un rótulo que estaba en dos tablas

Lo encontró el control del arranque, y no tiene que ver con la partición:
«mostrar todos» vivía en `LANGS.showAll` **y** en `UI_TX.catMostrarTodos`, y en
neerlandés no decían lo mismo — *«Alle tonen»* y *«Alles tonen»*—. Cuál se veía
dependía del orden en que corrieran los escritores.

Los dos botones ya llevaban `data-tx`, así que sobraban las tres escrituras
desde `LANGS`. Se quitan, y la clave `showAll`, que se queda sin ningún lector,
sale de las nueve tablas: una clave muerta es justo lo que alguien vuelve a
enchufar más adelante.

Y el control de `data-tx` dentro de un `<script>` ya no mira los comentarios.
Saltaba con el comentario que explica por qué un elemento lleva `data-tx`; un
control así se acaba esquivando escribiendo peores comentarios. Comprobado que
sigue cazando el fallo de verdad, el `data-tx` dentro de una cadena.

### Lo que no se ha podido comprobar desde aquí

Que GitHub Pages sirva `idiomas/*.json`. El proxy de este entorno responde 403
a `github.io`, así que la comprobación es local: servidor propio, service worker
real, tres visitas seguidas y una sin red ninguna. Pages publica directo desde
`main` y no hay flujo de despliegue que filtre carpetas, pero **queda por ver en
el sitio publicado**.

---

## El búlgaro, dentro

`IDIOMAS_INCOMPLETOS` queda vacía y las dos marcas `data-incompleto="bg"` salen
del marcado: decían lo contrario de lo que pasa ahora. Las **19 cifras** de la
interfaz pasan de 8 a 9 idiomas, y con ellas los comentarios que cuentan
cuántos hay hoy; los que narran un fallo pasado se quedan como estaban, que
eran ciertos entonces.

La audioguía ya lo tenía resuelto: `TTS_LOCALE` lleva `bg: 'bg-BG'` y
`hasVoiceFor()` esconde el botón cuando el aparato no tiene voz para el idioma,
en vez de leer cirílico con voz castellana.

---

---

## Una a una las nueve, y lo que salió debajo

El encargo era mirar cada idioma entero, uno por uno. Empezaron saliendo **371
hallazgos** repartidos por los ocho idiomas traducidos; acabaron en **cero**.
No porque se bajara el listón: el control encontró de todo, y casi la mitad de
lo que encontró no se veía de ninguna otra manera.

### Lo que faltaba en los textos

Las **91 descripciones francesas** que decían menos que el castellano, en diez
tandas, cierran el recuento: las nueve lenguas están a `0 de 771`. Lo que se
devolvió no era adorno —el horario de Proyecto Hombre, la iglesia anglicana de
1890 del parque Taoro, la calle y la web de Párkinson Tenerife, el 24h de
atención a mujeres de Adeje, la restauración de 2020 de la Casa de Anchieta, la
dirección del Teléfono de la Esperanza, El Médano y el horario del Lidl de
Granadilla, el «no es necesario denunciar» de CAVIS en chino y en inglés.

### Las 439 etiquetas de categoría

La etiqueta `cat` es la lista que sale debajo de cada ficha: `Golf · 9 Hoyos ·
Arona · Principiantes · Familias`. **Al traducir se cayeron trozos por el
camino** en 439 fichas de siete idiomas. El francés se había quedado en `Golf ·
9 Trous · Arona · Débutants`, sin el «Familias»; el italiano en `Golf · 18
Buche · Par 72`, sin el municipio y sin el «Lujo».

El búlgaro no perdió ni una. Eso es lo que cierra la duda: **no es una
fatalidad de traducir, es que se cayeron**.

`tools/completar_cat.js` las devuelve **sin inventarse nada**. El glosario sale
del propio catálogo: de las fichas donde el número de trozos sí cuadra se lee
la pareja castellano→idioma, posición a posición. Lo que no aparece en ninguna
ficha cuadrada —«Apoyo», «Familias», «PADI»— va en un suplemento a mano,
`idiomas/glosario-cat/<lang>.json`, **que cede si choca con el catálogo**: lo
que ya está traducido y en uso pesa más que lo que se escriba en el suplemento.

Y conserva lo escrito: solo mete los huecos. Rehacer la etiqueta entera con el
glosario parecía más limpio y era peor —el neerlandés dice «Laurierbos», que es
su palabra, y el glosario la habría cambiado por el latín «Laurisilva»—.

El control nuevo **TROZOS** cuenta los trozos de `cat` y de `hours`. El de
longitud, que era lo que había, cantaba 38 de los 439.

### Las averías del propio control

Esto es lo que más costó y lo que más valía. Un control que da verde sobre lo
que no ha mirado es peor que no tenerlo.

**El `\b` de JavaScript es del alfabeto inglés.** Apareció tres veces:

1. En la regla de «`s.` + número romano», la «é» de `dénivelés. Départ` no es
   letra para `\b`, así que había frontera de palabra justo antes de la `s`
   final; la regla se comía ese `s.` y con `/i` encima leía la `D` de `Départ`
   como 500. **Salían un 500 y un 501 que no estaban escritos en ninguna
   parte**, y el control comparaba un texto que se había inventado él mismo.
2. Detrás de la «ч» búlgara y del 时 chino nunca hay frontera, así que esas dos
   lenguas **no tenían ni un horario que se leyera**: `от 9 до 22 ч` era, para
   el control, un texto sin horas.
3. Lo mismo en el desarme de «millones».

Ahora, en las tres, `(?<!\p{L})` y `(?![\p{L}\p{N}])` con la bandera `u`.

**La regla de rangos arrancaba dentro de otra cifra.** En `9h15-14h` leía
`15-14h` y apuntaba una apertura a las tres de la tarde; en `8h30-21h` leía
`0-21h` y abría a medianoche. Ninguna de las dos estaba escrita.

**El reloj a la francesa.** El francés escribe `10h00` y `8h30-21h`; sin
leerlo, cada horario salía dos veces, como hora que falta y como cifra que
sobra: 48 avisos de un tirón. Se lee **en los dos lados de la comparación y
solo cuando el idioma comparado es el francés**. Eso es lo que lo hace
honrado: `1h40` es una duración y la regla la lee mal, pero la lee mal **igual
en el castellano y en el francés**, los dos salen idénticos y no nace ningún
hallazgo. Un error simétrico se anula; el intento anterior era asimétrico y por
eso mentía.

**En `cat` no se leen horas.** Las seis etiquetas del catálogo con pinta de
horario —`PR-TF 8 · Anaga (Exigente · 14 km · 5-6h)`— son las seis la duración
de un sendero. Comprobado sobre las 771: ninguna lleva hora de apertura.

**El «uur» neerlandés fuera de las marcas de rango**, por lo mismo que la
palabra «horas» nunca estuvo: en neerlandés es la hora del reloj *y* la hora de
duración, así que `5-6 uur` de un sendero se leía como de cinco a seis de la
mañana. Nueve senderos cantados en los que el neerlandés decía exactamente lo
mismo que el castellano.

### Lo que el chino escribe distinto y no está mal

- **Los números, en chino.** `约五百米` es «unos 500 m» y `四十多公里` es «más de
  40 km». Se coge cada número **que ya está en el castellano**, se escribe como
  lo escribiría el chino, y si esa forma aparece se pasa a cifras. Al revés
  —convertir cualquier secuencia de 一二三十百— inventaría números donde no los
  hay: `一起` es «juntos», `十分` es «muy», `第一` es «primero». Y solo la
  primera aparición: `百佳` son las 100 mejores pero `百年` es centenario.
- **Los meses, con número.** `12月` es diciembre y `4-6月` es de abril a junio.
  Se quita el `N月` del chino **solo si el castellano nombra ese mes**.
- **El descuento, al revés.** En chino un descuento se dice por lo que se paga:
  `9折` es pagar el 90%, o sea un 10% de descuento, y `5折` es la mitad.
- **El 点 es la marca de la hora**, como el «Uhr» alemán.

### Dos cifras que el castellano escribía distinto del resto

Y eso no era cosa del control, era del texto:

- `Fuego solo hasta 20h` → `hasta las 20:00`, como el resto de horarios del
  catálogo. Se alinearon las nueve lenguas.
- `Ctra. Gral. Las Cañadas km 9,200` → `km 9,2`, que es lo que son. Leído como
  estaba parecía el kilómetro nueve mil doscientos.

### Descuidos de traducción que aparecieron al mirar las etiquetas

El alemán ponía **«Kalistheniks»**, que no existe en alemán, y «Minimarket» en
vez de «Minimarkt». El francés, **«Real Club Nautique»**, medio en castellano y
medio en francés, y «Minimarket» en vez de «Supérette». El búlgaro,
**«Минголф»** sin la и. El chino mezclaba `MTB阿纳加` donde el resto del chino
dice 山地车. Y la Calle Flor de Pascua era `花街` —«calle de las flores»—, que
en chino además suena a barrio de alterne; ahora `一品红街`.

Ninguno de esos cuatro se habría visto con una lista común de «palabras que se
escriben igual»: **`IGUAL_OK` se declara por idioma a propósito**. «Farmacia»
vale en italiano y no vale en alemán.

### El resultado, y la prueba de que el control sigue vivo

```
              antes   ahora
  en            39      0
  fr            39      0
  de            54      0
  it           108      0
  nl            54      0
  zh            50      0
  zht           50      0
  bg            27      0
```

Probado rompiendo a propósito una ficha de cada tipo en alemán: **las cinco
categorías cantan** —cifra quitada, horario cambiado, trozo de `cat` perdido,
trozo de `hours` perdido, descripción recortada— y la etiqueta declarada `Zoo ·
Puerto de la Cruz` **no** canta, que es lo que se le pide.

### Dos reglas que se probaron y no se quedaron

Anotadas en el fuente con sus números, para que nadie las reintente a ciegas:

- Leer `Nh` en todos los idiomas, no solo en francés: `nl 54→89`, `zh 50→85`,
  `bg 27→62`, `it 108→117`, `de 54→58`.
- Leer el «hasta 20h» del castellano por la preposición que lleva delante:
  arreglaba 4 y rompía 8, porque el idioma de enfrente muchas veces escribe
  «fino alle 20» sin marca ninguna.

Y una tercera, en `faltan_textos.js`: **el corte no se toca**. Al vaciar la
lista del chino quedaron once descripciones completas por debajo del umbral, y
diez eran aparcamientos: el castellano de las fichas `pk-*` usa registro
administrativo —«línea de estacionamiento público en superficie y batería»— y
el chino lo dice entero con muchos menos caracteres. Medido: la mediana de los
`pk-*` en chino es 0,26 y la del resto 0,32, mientras que por longitud del
texto la mediana no se mueve. Lo que desplaza la proporción es el **registro**,
no el tamaño. Subir el corte taparía también las que sí están cortadas, y una
excepción para `pk-*` sería peor: dejaría de mirar justo donde ya se sabe que
la proporción engaña. Once fichas que leer no son un problema; un cribado que
no canta, sí.

---

## El barrido de idiomas estaba ciego a medio fichero

Al preguntar «¿está todo traducido?» la respuesta correcta resultó ser **no**,
y el motivo era el control, no la traducción.

`barrido_idiomas.js` recorría `index.html` con una pila de llaves, saltando lo
que hubiera entre comillas. Parece suficiente y no lo es. En

```js
.replace(/"/g, '&quot;')
```

la comilla que va **dentro de la expresión regular** abría una cadena que no se
cerraba hasta la siguiente comilla, 7.849 caracteres más allá. Con las
plantillas de acento invertido pasaba lo mismo y peor: **un solo salto se comió
97.094 caracteres**, de la línea 29.907 a la 31.021.

Consecuencia: el barrido contaba **419 filas** de interfaz y daba `sin bg: 0`.
Las filas eran **515** y a **93** les faltaba el búlgaro. Verde sobre lo que no
había mirado, que es el peor resultado que puede dar un control, y van tres
veces en este proyecto.

### Ahora se analiza el JavaScript de verdad

Con `acorn` —que ya venía con eslint— en vez de contar llaves. Se recorre el
AST de cada `<script>` y se recoge todo objeto literal con una clave `es` de
texto. Si acorn no estuviera, la herramienta **revienta**: volver a contar
llaves a ojo no es una alternativa aceptable. Los `<script>` que no son
JavaScript —el `ld+json` de la cabecera— se cuentan y se dicen, no se ignoran
en silencio.

### Lo que estaba sin traducir

| | filas | faltaban |
|---|---|---|
| `CHAT_CATS` · categorías del asistente | 39 | fr de it nl zh zht bg |
| `MAR_COSTAS` · nombres de costa | 7 | bg |
| `MAR_NIVELES` · estado del mar y su consejo | 8 | bg |
| `MC_ZONES` · zonas del selector | 6 | zht bg |
| `FIESTAS` · descripción | 18 | bg |

**318 textos.** Los de `MAR_NIVELES` son avisos de seguridad: «No te metas al
agua ni te acerques a la orilla rocosa» salía en castellano a un búlgaro.

### Las categorías del chat no se traducen: se leen

`CHAT_CATS` guardaba su propia copia del nombre en castellano e inglés, y el
chat hacía `currentLang==='es' ? c.es : c.en`. Un alemán, un chino o un búlgaro
veían el nombre **en inglés** incrustado en una frase que por lo demás iba en su
idioma.

La solución no fue añadir siete idiomas a cada fila —eso son 273 textos
duplicados que nadie iba a mantener— sino **leer el nombre de donde ya estaba**:
`LANGS[idioma].categories`, la misma tabla que nombra las categorías del menú
del mapa, completa en los nueve desde siempre. Las 38 copias sobrantes se
borran; lo que queda en `CHAT_CATS` es la clave y el vocabulario de búsqueda,
que no son texto de interfaz.

Al hacerlo salió un fallo que nadie había visto: **la categoría `pueblo` no
existe**. Las fichas usan `municipio`, así que el chat detectaba «pueblos»,
respondía y no encontraba ni un sitio. Ahora la clave es `municipio`, y con
ella el nombre traducido aparece solo.

### Y un control nuevo: ENLACE

Un correo o una web no se traducen: o están igual, o no están. El cribado de
longitud puede no enterarse —el inglés de `acc-adissur` se había dejado el
correo de la asociación y seguía teniendo largo de sobra para pasar—. Doce
fichas del castellano llevan correo o web; el control comprueba que estén en
las ocho traducciones. Nada más nacer encontró cuatro huecos: el correo de
ADISSUR en inglés, `parkinsontenerife.org` en inglés, los dos dominios de
alquiler de bicis en inglés y `tenerifeon.es` en alemán.

### Estado

```
filas de idioma en todo el proyecto ....... 2.217
  interfaz, dentro de index.html .......... 476
  fichas, en idiomas/*.json ............... 1.741
completas en los nueve idiomas ............ 2.217
exentas por declaración en el fuente ...... 18   (wikiTitleOverrides, TTS_LOCALE)
```

Las 18 exentas son los títulos exactos de artículo de Wikipedia y los códigos
de voz: un título inventado no devuelve el artículo, y `bg-BG` no se traduce.
El panel de administrador sigue en castellano por decisión, declarado en el
marcado.

---

## El panel de administrador y los chips del globo

Quedaban dos bloques en castellano. Los dos se veían.

### El panel de administrador

Iba en castellano **por decisión**, declarada en el marcado. Ahora entra en el
mismo mecanismo que el resto —`data-tx`, `data-tx-ph`, `data-tx-title`,
`data-tx-aria` y `tx()` para lo que se genera desde JavaScript—, sin maquinaria
nueva: **104 claves**, 62 de marcado y 42 de avisos. De 64 nodos sin traducir a
**0**.

Al mirarlo aparecieron tres cosas que no se buscaban:

- `29,99€/mes` estaba dentro de una exención que decía «cifra con la moneda».
  La cifra no se traduce; **el «/mes» sí**. Ahora son dos piezas.
- Tres listas vacías y los botones **Visible / Oculto / Borrar** se generaban
  desde plantillas y tampoco se traducían.
- El panel decía «Business name \*» en castellano porque el navegador de
  pruebas estaba en inglés — falsa alarma, comprobada y descartada.

### Las etiquetas del globo

Cada ficha lleva `tags`, y salen como chips debajo del nombre. Vivían **solo en
castellano**: en búlgaro el globo decía «Уебкамера на живо» y justo debajo
«Webcam · En directo · Teide».

Ningún control las miraba, y el motivo es interesante: **no son un objeto
`{es:…}`**, son texto suelto dentro de un array. Todos los controles de idioma
buscaban pares clave-valor.

```
etiquetas distintas ....................... 1.173
  reconocidas solas como nombre de sitio .. 251
  declaradas sin traducir, con motivo ..... 243
  traducidas a los ocho idiomas ........... 679   (5.432 textos)
```

Las traducidas viven en `idiomas/etiquetas/<lang>.json`, ~15 kB por idioma, que
baja con el que el usuario elige. Si el fichero no ha llegado, la etiqueta sale
en castellano igual que antes y se repinta al llegar: nunca a medias.

Las 243 declaradas van con su motivo en
`idiomas/etiquetas-sin-traducir.json`, en seis grupos —nombre de sitio, de
edificio, marca o persona, código de carretera o sendero, cifra o medida—.

### Lo que enseñó el control al escribirlo

**Primera versión: «todas sus palabras salen en algún nombre de ficha» valía
como nombre propio.** Demasiado ancho. «Casa del Vino» hacía que **Vino** pasara
por nombre propio, y con el «Museo» de Museo Etnográfico, la «Farmacia» de
Farmacia Anaga y la «Webcam» de Webcam Teide igual: **243 etiquetas corrientes
se colaban como si fueran sitios** y el control las daba por buenas sin haberlas
mirado. Ahora solo cuenta como sitio lo que el catálogo nombra como zona.

**Segunda: guardar solo lo que cambia.** Si el italiano decía «Cala» como el
castellano, se omitía la fila. Entonces el hueco tenía dos lecturas —«se escribe
igual» y «se me olvidó»— y eso un control no se lo puede permitir. Ahora se
guarda todo: **falta = falta**.

**Tercera, probada y quitada:** detectar el olvido comparando idiomas —«si el
alemán la tradujo y el italiano no, el italiano se la olvidó»—. Sale mal por el
italiano, que comparte con el castellano media lengua: *faro*, *costa*, *vino*,
*cresta*, *alto*, *remoto* y *religioso* son italiano correcto y los cantaba
todos, junto con «Bus» en tres idiomas, «Zoo» en tres, «Marina» en cuatro y
«Lava» en dos. **Veintinueve avisos y ni uno bueno.**

Lo que sí es exacto y se queda: en chino y búlgaro, que no usan alfabeto latino,
dejar el castellano es **siempre** un olvido salvo un código como `4x4` o `BMX`.
Probado rompiendo una etiqueta a propósito en búlgaro y en alemán.

---

# 5 · Cómo se vuelve a medir

```bash
bash tools/auditar.sh                # todo: sintaxis, red, datos, seguridad, idiomas
```

Y cada bloque por separado, si hace falta:

| | |
|---|---|
| `tools/cargar.js` | cargador comun: devuelve la red **ya hidratada** |
| `tools/verificar_red.js` | los 10 controles de la red |
| `tools/auditar_datos.js` | catálogo, líneas, trazado y lugares |
| `tools/auditar_seguridad.py` | inyección, CSP, codificación, textos fijos y tipografía china |
| `tools/auditar_xss.js` | regresión con datos hostiles, en navegador |
| `tools/auditar_web.js` | idiomas, arranque y rendimiento, en navegador |
| `tools/extract_js.py` | extrae los `<script>` para `node --check` |
| `tools/gtfs_red.py` | regenera la red desde un GTFS completo |
| `tools/orientacion.py` | deduce orientación de playa desde la costa · **suspendido por su propio control** |
| `tools/auditar_sw.js` | el service worker en un ámbito falso: mapa sin conexión, tope y actualizaciones |
| `tools/auditar_mapa.js` | el mapa sin conexión, bloque a bloque |
| `tools/mapa_base.py` | genera `mapa/tenerife-base.pmtiles` desde los datos del propio repositorio |
| `tools/mapa_prueba_osm.py` | banco de pruebas con el esquema de Protomaps, para poder probar el bloque 4 |
| `tools/verificar_osm.py` | revisa un `.pmtiles` de OSM antes de subirlo · 7 pasos |
| `tools/verificar_estilo.js` | mide si ese fichero **se ve** con el estilo que lleva la app |
| `tools/inventario_idiomas.js` | las tablas de idioma con nombre y qué le falta a un idioma |
| `tools/barrido_idiomas.js` | **todas** las filas de idioma del fuente, analizando el JavaScript con acorn en vez de contar llaves |
| `tools/meter_idioma.js` | mete un idioma dentro de cada fila, detrás de `zht` |
| `tools/auditar_sin_traducir.js` | el texto que no cambia al pasar de español a búlgaro |
| `tools/revisar_traduccion.py` | revisa una tanda traducida antes de meterla: avisos, cifras, horarios y alfabeto |
| `tools/auditar_cirilico.py` | la errata muda al transliterar: una variante rara muy parecida a una frecuente |
| `tools/auditar_arranque.js` | el texto que se queda en el idioma de **arranque**, comparando contra `setLang` |
| `tools/partir_idiomas.js` | la mudanza de los ocho idiomas de `places[]` a `idiomas/*.json` |
| `tools/auditar_idiomas_fuera.js` | que lo mudado esté entero y el navegador lo pegue antes de montar el mapa |
| `tools/auditar_etiquetas.js` | los chips del globo: traducidos, declarados con motivo, o reconocidos como nombre de sitio |
| `tools/auditar_idioma.js` | un idioma entero contra el castellano: cifras, horarios, teléfonos, trozos de etiqueta, alfabeto |
| `tools/faltan_textos.js` | **cribado**, no veredicto: descripciones más cortas de lo esperado contra la mediana de ese idioma |
| `tools/meter_descripcion.py` | mete descripciones rehechas comprobando que el texto es **de ese lugar** |
| `tools/completar_cat.js` | devuelve a las etiquetas `cat` los trozos que perdieron, con el glosario del propio catálogo |

`tools/gtfs_red.py` regenera la red desde un GTFS completo. Necesita
`routes.txt`, `trips.txt`, `stops.txt`, `stop_times.txt` y `shapes.txt`; con
`calendar_dates.txt` además saca horarios y frecuencias de un día real.

## Fuera del repo — hay que mirarlo en Supabase

- **RLS es la única defensa de `favorites`.** El cliente envía `user_id` él
  mismo. Sin una policy `auth.uid() = user_id` en INSERT, UPDATE, DELETE **y**
  SELECT, cualquiera con la clave `anon` —que es pública por diseño— puede leer
  o escribir los favoritos de otros.
- **`push_subs` debe ser insert-only.** Si esa policy no existe, la lista de
  endpoints push es descargable.
- **El panel admin no es un control de seguridad.** El hash vive en el
  `localStorage` del propio dispositivo y todo el gate es cliente. No pasa nada
  mientras los datos sigan siendo locales, pero no debe convertirse en la puerta
  de nada que viva en el servidor.
- **Privacidad**: las coordenadas GPS exactas del usuario se envían a
  `router.project-osrm.org` (servidor de demostración público) y a
  `nominatim.openstreetmap.org`, cuya política pide un User-Agent identificable.
