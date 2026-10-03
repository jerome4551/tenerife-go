# Las 212 gasolineras · el plan

## Primero, dos números y una regla tuya

**Son 31 municipios, no 38.** Tenerife tiene 31, y el registro tiene estación en
**los 31**. Así que el corte sale solo: **31 tandas**.

```
212 estaciones en el registro
 14 ya tienen ficha en la app
198 son altas
```

*(La app tiene 20 fichas de gasolinera; sólo 14 corresponden a una estación real
del registro. Las otras 6 son las que ya sabemos.)*

### Y la regla

En tu propio LEEME está escrito:

> **Nunca precios ni valoraciones en la app: son datos perecederos.**

Tu plan de las 10 más baratas cada 24 h es exactamente precios. **No te digo que
no**: te digo que la regla tenía razón y que por eso hay que hacerlo de otra
manera. Un precio escrito dentro de `index.html` es un precio que miente al día
siguiente, y en gasolina mentir sale caro.

**Lo que propongo, que te da lo que quieres sin romper la regla:**

| | dónde vive | quién lo actualiza |
|---|---|---|
| las 212 fichas: nombre, marca, dirección, horario, coordenada, IDEESS | `index.html` | nosotros, una vez |
| **los precios** | `datos/precios-gasolineras.json`, **aparte** | el flujo de Actions, **cada día** |

El fichero de precios es pequeño —IDEESS y precio— y **lleva su fecha dentro**.
La app lo lee al arrancar; si no puede, o si la fecha es vieja, **no enseña
precio y lo dice**. Así nunca verás un precio de hace tres semanas presentado
como el de hoy.

El flujo que escribiste ya hace el 90 %: sólo hay que ponerle `schedule` diario
y un segundo paso que extraiga los precios. El `IDEESS` que guardamos en cada
ficha es lo que las une.

---

## El problema de verdad: 198 × 10 idiomas

Son **1.980 textos**. Escritos uno a uno no se acaban nunca y, peor, saldrían
desiguales.

**Pero una gasolinera no necesita prosa.** Mira lo que hay que decir:

```
name  Moeve · Avenida Los Majuelos            ← marca y calle: nombres propios
cat   Gasolinera · Moeve · La Laguna          ← UNA palabra traducible
desc  Moeve en Avenida Los Majuelos, 108,
      La Laguna. Abierto L-D 24 h.            ← «en», «Abierto», y los días
tags  Gasolinera · Moeve · La Laguna · 24 h   ← ya existen o son nombres propios
```

**Lo traducible son unas diez palabras y los siete días de la semana.** Se
traducen **una vez**, se revisan **una vez**, y las 198 fichas se rellenan con
los datos del registro. Eso es una plantilla, no una traducción automática: lo
que se revisa es el molde, y el molde es corto.

Los horarios del registro vienen así:

```
L-D: 24H
L-V: 05:30-22:00; S: 06:30-22:00; D: 08:00-22:00
```

Hace falta un formateador que los pase a cada idioma. Son **7 días × 10 idiomas =
70 palabras**, más dos o tres conectores. También se revisa una vez.

---

## Lo que pesa

| | hoy | después |
|---|---|---|
| `index.html` | 3,19 MB | **+92 kB** |
| `idiomas/` | 2,50 MB | **+342 kB** |

Un 3 % y un 14 %. Asumible, pero conviene saberlo antes, no después.

---

## Las 31 tandas

Ya están escritas, una por municipio, en `datos/gasolineras/plan/`. Cada una trae
sus estaciones con rótulo, dirección, horario, coordenada, IDEESS y **si la app ya
la tiene**.

| tanda | municipio | total | ya | nuevas |
|---|---|---|---|---|
| 01 | Santa Cruz de Tenerife | 33 | 0 | **33** |
| 02 | San Cristóbal de La Laguna | 28 | 2 | 26 |
| 03 | Arona | 15 | 1 | 14 |
| 04 | Adeje | 14 | 0 | 14 |
| 05 | Los Realejos | 13 | 1 | 12 |
| 06 | Granadilla de Abona | 11 | 2 | 9 |
| 07 | La Orotava | 10 | 1 | 9 |
| 08 | San Miguel de Abona | 10 | 0 | 10 |
| 09 | Arafo | 7 | 1 | 6 |
| 10 | Guía de Isora | 7 | 1 | 6 |
| 11–31 | los otros 21 | 64 | 5 | 59 |

### El orden que propongo

**Empezar por una pequeña, no por Santa Cruz.** Por ejemplo **Vilaflor (1
estación, y ya la tenemos)** o **Garachico (1)**: con una sola ficha se asienta
la plantilla, se traduce el molde, se pasa la auditoría entera y se ve si algo
chirría. Equivocarse en 1 ficha cuesta cinco minutos; en 33, una tarde.

Cuando el molde esté probado, las grandes van casi solas.

---

## Un emparejamiento que corregí antes de enseñártelo

La primera versión del plan decía **18 estaciones «ya en la app»**. Eran 18
emparejamientos pero **sólo 14 fichas**: hay pines con dos o tres estaciones
alrededor. El de `gas-tf1-guimar` tiene un **BP a 14 m**, una **H2EXAGON a 224 m**
y una **PLENERGY a 194 m**, y las tres se daban por «ya cubiertas». Las otras dos
siguen necesitando su ficha.

Corregido: cada ficha de la app reclama **una sola** estación, la más cercana.
Ahora son 14 y 14, sin repetir ninguna.

---

# Sesión 00 · la plantilla · HECHA el 2 de octubre

Probada sobre **Garachico**, que tiene una sola estación. La app pasa de 779 a
**780 lugares** y la auditoría está en verde.

## Las decisiones, y por qué

**El nombre es «marca · calle».** No lo elegí a ojo, lo conté sobre las 212:

| nombre | distintos | chocan |
|---|---|---|
| marca + **calle** | **210** | 2 |
| marca + localidad | 162 | 80 |
| marca + municipio | 124 | 133 |

Con el municipio salían **quince «DISA · Santa Cruz de Tenerife»** seguidos, que
no le sirven a nadie. A los 2 que seguían chocando se les añade la localidad, y
si aún chocan, el km; dos REPSOL tienen la **misma dirección exacta** del
registro («CARRETERA TF-1 KM. 54», a 83 m una de otra) y sólo se distinguen por
su IDEESS. Resultado: **212 nombres, los 212 distintos**, el más largo de 56
caracteres (el tope que ya tenía la app era 66).

**Los topónimos se quedan en castellano en los diez idiomas.** «Garachico» y
«Carretera Icod-Buenavista» no se traducen ni se transcriben al chino ni al
búlgaro. Tres razones:

* es lo que pone en las señales y en Google Maps, que es donde el conductor lo
  va a leer;
* **no existe transcripción revisada** de los 31 municipios: `idiomas/glosario-cat`
  no tiene búlgaro ni polaco, y del chino sólo cubre 4 de 31. Escribirlas yo
  sería inventármelas;
* es la regla que la app ya tiene escrita en `tools/auditar_idioma.js:408`.

El control de alfabeto pide que el chino **tenga** han y el búlgaro **tenga**
cirílico, no que no tengan latín: lo cumplen las palabras traducidas de
alrededor.

**La descripción no lleva ni verbo ni preposición**, y es a propósito. «Oferuje
benzyna 95» está mal en polaco (pide acusativo), el francés necesita artículo
(«sur la Carretera») y el castellano también («en **la** carretera»), y el
artículo depende del tipo de vía. Una etiqueta y una lista en nominativo no
declina nada y es correcta en los diez:

> Carretera Icod-Buenavista, Garachico. Combustibles: gasolina 95, gasolina 98 y
> gasóleo A.

**Los combustibles salen de qué campos «Precio \*» traen dato**, porque el campo
viene vacío cuando la estación no sirve ese combustible. **Ningún precio entra en
la ficha**: caduca en 24 h.

## El campo «Dirección» del registro viene sucio: 24 de 212

Tipo de vía repetido («CARRETERA CARRETERA GENERAL DEL SUR»), paréntesis sin
cerrar («TF-66(GUAZA-GALLE KM. 2»), un «  EN  » usado de separador («AVENIDA AYYO
DE  EN  ADEJE»), el artículo pospuesto («CALLE MILAGROSA (LA)», «CARRETERA
ROSARIO (DEL)», «AVENIDA PASO EL»), «S/N» en medio de la frase y dos erratas
(«CARRETEA», «S7N»). Son un conjunto **cerrado**: las reglas de limpieza se
comprobaron mirando las 212 salidas una a una. El texto original no se pierde:
va en `direccion_registro`.

Lo que **no** he tocado: los acentos de los nombres de persona de las calles
(«Felix Benitez», «Dominguez»), porque ahí no tengo fuente y no voy a adivinar.
Sí he puesto la grafía oficial del Cabildo donde aparece un municipio
(«GÜIMAR» → «Güímar») y el acento de «Polígono», que es palabra común.

**Una cosa para que la confirmes:** el polígono de Granadilla sale como **«El
Carreton»**, sin acento, porque así lo escribe el registro y no tengo fuente para
los nombres de sitio por debajo del municipio. Si me dices que es «El Carretón»,
lo cambio en las dos fichas que lo llevan.

## Las herramientas que deja

```
python3 tools/gasolinera_ficha.py --vocabulario    las 12 palabras y los 7 dias
python3 tools/gasolinera_ficha.py --municipio X    las fichas, sin tocar nada
python3 tools/gasolinera_alta.py X --ver           que haria
python3 tools/gasolinera_alta.py X                 lo hace
node tools/lugares_idioma.js montar pl
bash tools/auditar.sh
```

`gasolinera_alta.py` **no pisa nada** (si el id ya está, lo dice y no lo toca) y
**no deja a medias**: si falla a mitad, devuelve los ficheros como estaban.

De paso arreglé `lugares_idioma.js`: escribía `pl.json` con otro formato que los
otros nueve idiomas, así que añadir **una** ficha daba un diff de **3.249
líneas** en el que no se ve lo que ha cambiado. Ahora da una línea.

## Sesión 01 · Santa Cruz de Tenerife · HECHA el 2 de octubre

**33 altas.** La app pasa de 780 a **813 lugares**, 48 gasolineras. Auditoría en
verde.

### Tu regla del código de vía, aplicada

De las 212, **50 traen un código TF** en la dirección del registro y **15 son
autopista o autovía** (acceso directo). A esas 15 les va el código **y el km**,
que es como se encuentran: «Repsol · Autovía TF-1 km 39», «DISA · Autopista TF-5
km 25», «Moeve · Autopista TF-21 km 3,5». A las que el registro **no** les da
código, no se lo pongo: seis dicen sólo «Autopista del Sur» o «Autopista Tenerife
Sur» y así se quedan. El código oficial lleva guion, así que «TF1» del registro
se escribe «TF-1», igual que en las 14 fichas antiguas y en las líneas de TITSA.

### El control del municipio cazó un defecto de diseño mío

Usaba la **localidad** para desempatar nombres repetidos. El registro pone
localidad «EL ROSARIO» en una estación que el polígono del Cabildo sitúa **599 m
dentro de Santa Cruz**: la ficha se llamaba «DISA · Carretera General del Sur
(El Rosario)» y **afirmaba un municipio que no es el suyo**. No era un dato malo,
era mi plantilla. Corregido: si la localidad es el nombre de otro municipio, se
desempata por el km. Ahora es «DISA · Carretera General del Sur km 9,2».

De paso: cuando la localidad **sí** es el municipio, se escribe como lo escribe
el Cabildo. El registro pone «GUIMAR» y «SANTA URSULA» sin acento.

### Dos pares que el registro no distingue

Llevan el IDEESS en el nombre porque no hay nada más con que separarlos:

* los dos **DISA de la Autovía Santa Cruz-San Andrés** — misma dirección, sin km;
* en Granadilla, los dos **REPSOL de la «CARRETERA TF-1 KM. 54»**, a 83 m uno de
  otro (los dos sentidos de la autopista, casi seguro).

### Acentos y erratas del registro · con el OK de Jerome (2 de octubre)

Están en un fichero de **datos**, `datos/gasolineras/correcciones-registro.json`,
no en el código: así se siguen aplicando cada vez que el registro se descarga.

* **27 palabras con tilde segura**: Andrés, Ángel, Benítez, Botánico, Cáceres,
  Carretón, Cristóbal, Díaz, Domínguez, Dublín, Félix, González, Gorrín, Guía,
  Guzmán, Hernández, Hipólito, Jesús, Marítima, Martiánez, Médano, Méndez,
  Penetración, Pérez, Príncipes, República, Torreón.
* **Los topónimos guanches no se tocan** (Adjona, Atogo, Axaentemir, Chajofe,
  Tamaimo, Guaza…): no llevan tilde y no me toca ponérsela.
* **Abreviaturas pegadas**: «CTRA.GRAL.ADEJE» salía «Carreteragral.adeje»; ahora
  «Carretera General Adeje a Guía de Isora». Igual «CRA.GRAL.LA ZAMORA».
* **«TF 154»** con espacio es la TF-154. «MANZ-» es la manzana: se corta.
* **Ilegible**: «DELPORTEZUELO ALS TODCAS» (Tegueste) seguramente es «del
  Portezuelo a Las Toscas», pero «Todcas» por «Toscas» sería adivinar. **Se
  corta**, y la ficha se queda en «DISA · Carretera TF-154», que es lo que el
  registro sí dice claro.

Cambian **36 nombres** de las 212. Cinco ya estaban en la app (Santa Cruz) y se
reescribieron con `gasolinera_alta.py --rehacer`, que re-sincroniza una ficha
con el registro por su IDEESS y **para** si el bloque viejo no es uno de los
que generó ella.

## Sesión 02 · La Laguna · HECHA el 2 de octubre

**26 altas** de 28. La app pasa de 813 a **839 lugares**. Auditoría en verde.

Las otras **2 ya las cubrían fichas antiguas** y no se duplican: a
`gas-tf2-lalaguna` (CEPSA Los Andenes, a 7 m) y a `gas-tf5-lalaguna` (REPSOL de
la Calle Libertad, a 4 m) se les pone sólo el `ideess`, un enlace invisible. El
nombre al estilo nuevo se les cambia en su turno, la sesión 91.

**Tu regla de la autopista, una más:** «CR AUTOPISTA DEL NORTE, KM. 10,2» no se
reconocía como autopista porque empieza por «CR». Ahora es «BP · Autopista del
Norte km 10,2».

**Un fallo mío que cazaron los controles.** Al re-sincronizar La Laguna después
de enlazar las dos antiguas, sus dos estaciones se dieron de alta **otra vez**:
una ficha enlazada ya no «reclama» por distancia, y el aplicador sólo reconocía
como «ya en la app» las fichas con el id que genera él. Salieron 841 lugares en
vez de 839 y la cifra se puso roja. Corregido: una estación está cubierta si
**cualquier** ficha lleva su IDEESS. Y el control de gasolineras ya vigilaba
«dos fichas con el mismo IDEESS»: lo comprobé inyectando uno, y da FALLO.

### Lo que pasará con las 14 antiguas en sus sesiones

Ninguna se queda sin emparejar, así que **no hay riesgo de duplicado**. 11 se
enlazarán solas (misma marca, a menos de 50 m). Tres **pararán** para mirarlas
contigo:

| ficha | estación | por qué para |
|---|---|---|
| `gas-tf1-abades` | 7726, Arico, a 1 m | el nombre de la ficha no dice marca |
| `gas-tf5-el-bohio` | 9635, La Matanza, a 54 m | pasa de 50 m |
| `gas-tf82-guia-isora` | 9176, Guía de Isora, a 166 m | el pin está lejos |

Y una curiosidad para la sesión 91: `gas-tf1-guimar` («BP Güímar (TF-1)») está
en realidad en **Arafo**, según el polígono del Cabildo.

## Revisión de los bloques 01 y 02 · 2 de octubre

Con un revisor **independiente**, `tools/revisar_gasolineras.py`: no importa
nada de la plantilla, lee el registro crudo y compara ficha por ficha. Si usara
el código de la plantilla, solo comprobaría que la plantilla está de acuerdo
consigo misma. Ya va dentro de `auditar.sh`.

**60 fichas** (las 59 de los dos bloques y Garachico): coordenada, municipio,
horario, marca, que ninguna palabra del nombre salga de fuera del registro, los
diez idiomas, ni un precio, y cada estación con **una** ficha (Santa Cruz 33/33,
La Laguna 28/28). Todo bien salvo una cosa:

**Faltaban combustibles.** El registro tiene 23 campos de precio y la plantilla
miraba 5. Se dejaba el **diésel renovable** (39 estaciones de la isla), la
**gasolina 95 premium** (2) y el **gas natural comprimido** (1). En los dos
bloques eran **13 fichas** que decían menos de lo que el registro sabe.
Añadidos, en los diez idiomas, y las 13 re-sincronizadas. El **AdBlue** (23
estaciones) no va: es un aditivo, no un combustible.

El revisor se probó metiéndole **seis fallos distintos** a propósito
(coordenada movida, horario cambiado, palabra inventada en el nombre, día en
castellano en inglés, combustible quitado, un precio en francés): los seis,
cazados.

### Y al mirar las fichas en un navegador de verdad, tres fallos de la app

Ninguno lo trajeron las gasolineras: estaban en **las 839 fichas**.

1. **En la ficha abierta, las etiquetas salían en castellano en los diez
   idiomas** («GASOLINERA · INTERIOR · SUR · MONTAÑA»). El globo del mapa las
   traducía; la ficha no.
2. **El botón decía «Favorito» en los diez idiomas**, también en inglés: la
   traducción no existía en ninguno y salía siempre el texto de reserva.
3. **Inglés → castellano → inglés dejaba todas las etiquetas en castellano**,
   también las del mapa, hasta cambiar a un tercer idioma.

Y uno más pequeño: con un **enlace compartido** en otro idioma, la ficha se abre
antes de que lleguen los textos y se quedaba en castellano hasta cerrarla.
Ahora se repinta sola.

Controles nuevos para que no vuelvan: `auditar_reservas.py` (cualquier
`L.clave || 'texto en castellano'` tiene que tener la clave en los diez
idiomas: habría cazado «Favorito») y la ficha abierta dentro de
`auditar_desborde.js`, con ida y vuelta por el castellano. Probados quitando
cada arreglo por separado: rojo las tres veces.

## Sesión 03 · Arona · HECHA el 2 de octubre

**14 altas** de 15. La app pasa de 839 a **853 lugares**. La otra estación ya la
cubría `gas-tf1-guaza` (BP, a 10 m): sólo se le pone el `ideess`. Revisor: 14
fichas campo a campo, **0 hallazgos**, 15 de 15 estaciones con su ficha.

Antes de aplicar, tres nombres que no valían y que eran fallos de mi limpieza,
arreglados como reglas generales y no como parches:

* «**CRTRA.** VALLE SAN LORENZO - LAS GALLETAS» salía «Tgas · Carretera» a
  secas: el punto de la abreviatura parecía fin de frase. Ahora cualquier
  abreviatura de vía con punto se desata antes de cortar.
* «CALLE AVENIDA DE LOS PUEBLOS», «CALLE BULEVAR CHAJOFE»: dos tipos de vía
  seguidos; vale el segundo, como ya pasaba con «CR AUTOPISTA».
* «Nº2» es el número del portal, no la calle.

Cambian 9 nombres de las 212, ninguno de los municipios ya aplicados.

Lo que **no** he tocado: «**CARRERA** GENERAL LAS GALLETAS» es casi seguro una
errata de «Carretera», pero cambiarla sería adivinar. Y «Moeve · Carretera
General» (km 136, Valle de San Lorenzo) es pobre, pero es todo lo que dice el
registro.

## El AdBlue · 3 de octubre, a petición de Jerome

Va en la ficha de las **23 estaciones** que lo venden según el registro. No es un
combustible —es un aditivo para el escape de los diésel—, así que no va en la
lista de «Combustibles» sino aparte, con la misma forma de etiqueta y dos
puntos, que no declina nada en ningún idioma:

> Autopista TF-1 km 65,5, Arona. Combustibles: gasolina 95, gasolina 98, gasóleo
> A y gasóleo premium. **Además: AdBlue.**

«AdBlue» es lo que pone en el surtidor y se escribe igual en los diez. El
revisor exige las dos cosas: que lo diga **quien lo vende** y que **no** lo diga
quien no lo vende. Antes de re-sincronizar dio 70 hallazgos (7 fichas × 10
idiomas); después, 0.

## Sesión 04 · Adeje · HECHA el 3 de octubre

**14 altas**, ninguna ficha antigua en Adeje. La app pasa de 853 a **867
lugares**. Revisor: 14 fichas campo a campo, **0 hallazgos**, 14 de 14
estaciones con su ficha. Ya hay 9 fichas que dicen AdBlue.

«Avenida **de** Ayyo» (Plenergy) y «Avenida Ayyo» (Repsol, Shell) conviven
porque así lo escribe el registro; al ser marcas distintas no se confunden.

## Revisión de los bloques 03 y 04 · 3 de octubre

El registro no ha cambiado. El revisor vuelve a dar **28 fichas, 0 hallazgos**,
pero repetirlo no es revisar: busqué lo que el revisor **no** miraba.

**1. Un error mío en el bloque 01, que salió al cruzar con tus capturas.** El
LEEME de las capturas decía de la **DISA de Pedro de Valdivia** (Santa Cruz,
IMG_3428): «Google dice “fuera de servicio por obras”. **No dar de alta sin
confirmar que está operativa.**» Y la di de alta. El aviso estaba escrito en
prosa y ninguna herramienta lo leía. El registro la trae con precios, pero eso
no prueba que esté abierta: su gasóleo (1,769 €) está muy por encima del más
barato de la isla (1,519 €), que es lo que cabe esperar de un precio que nadie
actualiza.

**Retirada.** Y para que no se vuelva a colar, el aviso es ahora un **dato**
(`en_espera` en `correcciones-registro.json`) que leen la plantilla (no la
genera), el aplicador (un `--rehacer` de Santa Cruz no la mete), el revisor y el
control, que **se pone rojo si una estación en espera tiene ficha**. Probado:
con la ficha dentro, rojo; retirada, verde. Era el único aviso así en todo el
LEEME. **Necesito que me confirmes si está abierta.**

Para retirarla sin tocar cinco ficheros a mano, el aplicador tiene ahora
`--retirar <IDEESS>`, el gemelo del alta.

**2. Las fichas antiguas enlazadas no las miraba nadie.** Contaban como
«estación con su ficha» sin comprobar el enlace. Ahora el revisor mide la
distancia y la marca: `gas-tf1-guaza` a 10 m, `gas-tf5-lalaguna` a 4 m,
`gas-tf2-lalaguna` a 7 m, las tres de la misma marca.

**3. En la app, de verdad.** Cinco fichas difíciles abiertas en un móvil de
360 px (la de AdBlue con nombre de autopista, la de nombre más largo de Adeje y
la antigua de Guaza, en castellano, chino, alemán, búlgaro e inglés): todas se
abren, nada se sale de la pantalla, cero errores, y las etiquetas y el botón ya
en su idioma.

La app queda en **866 lugares** (867 menos la retirada). Auditoría en verde.

## Sesión 05 · Los Realejos · HECHA el 3 de octubre

**12 altas** de 13. La app pasa de 866 a **878 lugares**. La otra ya la cubría
`gas-tf5-los-realejos` (DISA, a 36 m): sólo se enlaza. Revisor: 12 fichas,
**0 hallazgos**, 13 de 13 estaciones con su ficha.

Un nombre arreglado antes de aplicar: «CARRETERA CRT GRAL ICOD-S/C.PK 38.8»
salía «Carretera Crt General Icod-S/c.pk 38.8». «CRT» es otra abreviatura de
carretera, «PK» es el punto kilométrico, y «S/C» (Santa Cruz) **no se
despliega** —sería interpretar— pero se escribe «S/C» y no «S/c». Ahora:
«Tgas · Carretera General Icod-S/C». No cambia ningún otro nombre.

No se toca «La Zamora **22**»: un número suelto puede ser el portal o una
carretera (la «General 821» es la antigua C-821), y no sé cuál es.

**Para la sesión 91:** la antigua se llama «DISA **TF-5 km 46**» y el registro la
pone en la **Calle Los Barros, 33**. Antes de dejarle el TF-5 en el nombre hay
que mirar si de verdad tiene acceso directo desde la autopista, que es tu regla.

## Lo que queda

**25 sesiones**, 112 altas. La siguiente es la **06, Granadilla de Abona (11)**.

---

## Lo que necesito de ti antes de seguir

1. **Los precios aparte, ¿te vale?** Es la única forma de que el modo de «las 10
   más baratas» no mienta.
2. Las **14 fichas que sí casan** pasan al estilo nuevo en la **sesión 91**, como
   me dijiste.

*`python3 tools/gasolineras_plan.py` rehace las 31 tandas desde el registro.*
