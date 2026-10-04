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

## La DISA de Pedro de Valdivia, de vuelta · 3 de octubre

Jerome lo confirma con la web de la propia DISA (disagrupo.es): «E.S. DISA LAS
DELICIAS», abierta de lunes a domingo de 07:00 a 22:00, el mismo horario que da
el registro. Vuelve a la app (878 → 879). El aviso no se borra: pasa a
`confirmadas_tras_espera`, con la fuente y la fecha.

## Sesión 06 · Granadilla de Abona · HECHA el 3 de octubre

**9 altas** de 11. La app pasa de 879 a **888 lugares**. Revisor: 9 fichas,
**0 hallazgos**.

* Una ya la cubría `gas-tf1-granadilla` (Repsol, a 22 m): se enlaza.
* **Una queda en espera:** la **Repsol de la «Vía Lado Aire» del aeropuerto**
  Tenerife Sur. En un aeropuerto el «lado aire» es la zona restringida, al otro
  lado del control. El registro la marca como venta al público, y cerca hay un
  restaurante y un alquiler de coches, pero su dirección dice lo contrario. Si es
  restringida y entra, alguien conduce hasta una barrera; si es pública y espera,
  falta una estación un día. **Necesito que me confirmes si se puede entrar.**
  (La otra Repsol del aeropuerto, la del acceso, está a 2,4 km y sí entra.)

**Tu regla del km, ampliada con cuidado.** Los dos Repsol gemelos dicen
«CARRETERA TF-1 KM. 54», pero el TF-1 ahí es autopista. Mi primera versión daba
por hecho que todo el TF-1 y todo el TF-5 son autopista, y le ponía el km a dos
estaciones del TF-5 en La Guancha y San Juan de la Rambla que están **más allá**
de donde termina la autopista del Norte. Corregido: el tramo de autopista sale
**del propio registro** (del km más bajo al más alto de las estaciones que él
llama «AUTOPISTA»/«AUTOVÍA»). TF-1: km 34 a 65,5. TF-5: km 16 a 25. Cambian
3 nombres: los gemelos («… km 54») y una Moeve de Arico («… km 44,2»).

**Los gemelos del km 54 no son la misma estación:** el registro los pone en
**lados opuestos** de la autopista (margen derecho e izquierdo) y con horarios
distintos (06:00-00:00 y 24 h). Llevan el IDEESS en el nombre porque «sentido
sur» no es un nombre propio y en el nombre se quedaría sin traducir.

**Para la sesión 91:** la ficha antigua «BP Guaza (**TF-1 km 21**)» está, según
el registro, en la «CARRETERA GENERAL GUAZA **TF-66** KM. 79». No está en el
TF-1.

## La Repsol del «lado aire», dentro · 3 de octubre

Jerome manda la web de Repsol (abierta 24 horas, margen derecho como el
registro) y Google. Ninguna de las dos dice si se puede **entrar**, que era la
duda; lo dice el mapa: está a 106 m de un enlace de la autopista y a 134 m del
TF-1, junto a la TF-644 y a una calle pública, a 2,4 km de la terminal. «Lado
aire» es el lado de la vía que da al aeropuerto: igual que la Repsol «LADO
AIRE» de Gran Canaria, que está en la autovía GC-1. (El campo «Tipo Venta» del
registro no servía: las 495 de Canarias son «P», porque la descarga solo trae
las de venta al público.) 888 → **889 lugares**.

## Revisión de los bloques 05 y 06 · 3 de octubre

Registro sin cambios; revisor, 0 hallazgos. Lo que salió al mirar lo que el
revisor **no** miraba:

**1. Las fichas no tenían dirección.** El LEEME la pedía («coordenadas,
dirección y horario, del registro») y las 110 nuevas salieron sin la línea 📍:
el nombre lleva la calle, pero no el portal ni el código postal. Ahora sí:
«Calle Charfa, 28, 38670 Adeje», y cuando la localidad no es el municipio,
«Calle Libertad, 38108 Taco, San Cristóbal de La Laguna». Una dirección no se
traduce, igual que en las 94 fichas que ya la tenían. Al hacerla salió un fallo
mío: el registro escribe los km con coma decimal y el decimal salía como portal
(«Icod-S/C, 8 km 38,8»); corregido antes de aplicar.

**2. Siete tildes más**, de palabras que solo salen en las direcciones: Alcalá,
Américas, Baldíos, Chío, Jerónimo, Porís, Sofía.

**3. Las fichas antiguas enlazadas enseñaban datos falsos** y no los miraba
nadie:

| ficha | decía | el registro |
|---|---|---|
| Repsol TF-1 Granadilla | **24 h** · 📍 TF-1 **km 31** | **06:00-00:00** · TF-1 **km 54** |
| BP Guaza | 📍 **TF-1 km 21** | **TF-66 km 79** |
| Repsol La Laguna Norte | 📍 TF-5 km 8 | Calle Libertad, Taco |
| Cepsa La Laguna Sur | 📍 TF-2 km 2 | Avenida El Paso, 108 |
| DISA TF-5 km 46 | L-V 06:15-22:15 · S-D 07:00-22:00 | L-D 06:00-22:00 · Calle Los Barros, 33 |

La de Granadilla es la peligrosa: a las tres de la mañana está cerrada. La de 24
h es su gemela del otro lado de la autopista; la ficha antigua mezcló las dos.
Corregidos **solo el horario y la dirección**, desde el registro, y quitada la
etiqueta «24H» de Granadilla. El nombre y la descripción siguen para la sesión
91, como dijiste. El revisor mira ya el horario y la dirección de las antiguas:
con Granadilla otra vez a 24 h, salta.

**4. La regla del LEEME de «parar si el municipio de la captura no cuadra con el
polígono»:** comprobada en las 50 capturas que casan con una sola estación. Cero
discrepancias.

**5. Teléfonos:** el LEEME dice «solo el de la captura y solo con OK de Jerome».
No se ha puesto ninguno.

## Los puntos cardinales, en castellano en los diez idiomas · 3 de octubre

Al mirar la ficha de Granadilla en italiano salió la etiqueta «SUR». No era de
las gasolineras: «Norte» (191 fichas), «Sur» (153), «Oeste», «Noroeste», «Este»,
«Sureste», «Centro» e «Interior» salían en castellano en toda la app, en el
globo y en la ficha. La auditoría las tomaba por nombres de sitio porque alguna
ficha lleva «… · Sur» detrás del punto volado. El glosario estaba a medias
(«Nordeste» y «Suroeste» sí estaban). Añadidas las 72 traducciones con el mismo
estilo, y la auditoría ya no acepta un punto cardinal como nombre de sitio:
probada en rojo sin ellas y en verde con ellas.

## Sesión 07 · La Orotava · HECHA el 3 de octubre

**9 altas** de 10. La app pasa de 889 a **898 lugares**. La otra la cubría
`gas-tf21-aguamansa` (Cepsa La Cañada, a 12 m): se enlaza, y su horario y su
dirección pasan a ser los del registro (decía «L-S 07:00-21:00 · Consultar
festivos»; el registro, «L-D 06:00-00:00»). Revisor: 9 fichas, **0 hallazgos**.
Retoques de forma: «Albañilería» con tilde y «C 820» como «C-820».

**El aviso del Teide, en su sitio** (con tu OK). La Cepsa La Cañada decía
«⚠️ **ÚLTIMA** gasolinera antes del Parque Nacional del Teide subiendo por la
TF-21», y la **Repsol Barroso** está unos 1,3 km más arriba por la misma
carretera. El aviso pasa a la Repsol, con los mismos textos que ya tenía la Cepsa
en los diez idiomas, sin escribir nada nuevo, y con su categoría «⚠️ Última
Gasolinera · Repsol» y las etiquetas «Última» e «Importante». La Cepsa queda
como «Cepsa La Cañada (TF-21)», «Gasolinera · Subida Teide», con su dirección y
combustibles. El aviso de la Repsol vive en `datos/gasolineras/avisos.json`, así
que un `--rehacer` desde el registro no lo borra, y el revisor comprueba que la
descripción empiece por él.

De paso cazé un fallo del aplicador: al ver etiquetas nuevas en una ficha las
declaraba todas «nombres propios sin traducir», y así declaró «Montaña»,
«Importante» y «Última», que **sí** están traducidas. Deshecho; ahora solo
declara las que no estén en los glosarios, y nunca un código de carretera.

## Sesión 08 · San Miguel de Abona · HECHA el 3 de octubre

**10 altas**, ninguna ficha antigua en el municipio. La app pasa de 898 a **908
lugares**. Revisor: 10 fichas, **0 hallazgos**, 10 de 10 estaciones con su
ficha. Los diez nombres y direcciones salieron limpios del registro con las
reglas que ya había; no hizo falta ninguna nueva.

## Revisión de los bloques 07 y 08 · 3 de octubre

Registro sin cambios. Revisor: 19 fichas, **0 hallazgos**, 20 de 20 estaciones
con su ficha. Dos pruebas nuevas:

**1. Cada pin junto a una vía con coches** (OSM, solo como contraste): los 20, a
menos de 33 m. Ninguna coordenada del registro apunta a un sitio raro. De paso:
el registro dice «Calle Molinos de **Golfo**» (Plenergy, La Orotava) y OSM
«Molinos de **Gofio**». OSM no es fuente oficial; **pregunta abierta**.

**2. Tus capturas contra el registro.** No hay ninguna de La Orotava ni de San
Miguel, así que lo pasé por las de los bloques anteriores: de 50 capturas con
una sola estación, en **6 el horario de Google no casa**:

| estación | Google | registro |
|---|---|---|
| Shell El Ramonal (SC) | cierra 22:00 | 24 h |
| Cepsa, C/ Filipinas (SC) | cierra 23:00 | **solo L-V 07:00-15:00** |
| Océano, C/ Panamá (SC) | 24 h | 06:00-22:00 |
| DISA Hogar Taxista (SC) | cierra 16:00 | L-S 07-21 · D 08-13 |
| Cepsa Palo Blanco (Los Realejos) | 24 h | 07:00-22:00 |
| DISA Vistabella (La Laguna) | cierra 21:45 | 22:00 (despreciable) |

El registro manda (LEEME) y la app enseña el suyo; no se cambia nada. Es una
lista para comprobar en la web de cada marca.

**3. En la app**, la Repsol del aviso del Teide en castellano, alemán y chino
(el aviso, arriba del todo), la Cepsa ya sin él, y una de San Miguel en búlgaro:
todas bien, nada fuera de la pantalla, cero errores.

## Sesión 09 · Arafo · HECHA el 3 de octubre

**6 altas** de 7. La app pasa de 908 a **914 lugares**. Revisor: 6 fichas, **0
hallazgos**, 7 de 7 con su ficha. La séptima la cubría la antigua «BP Güímar
(TF-1)», a 14 m: se enlaza, y su horario pasa de **07:00-22:00** a lo que dice el
registro, **24 h**. Otra antigua con el horario mal.

**Para la sesión 91:** esa ficha se llama «BP **Güímar** (TF-1)» y lleva la
etiqueta «Güímar», pero está en **Arafo** (Polígono Plan Parcial El Carretón), y
el registro no dice TF-1.

Retoque de forma: «ACCESO CARRETERA A LA HIDALGA, **0**»: un cero no es un
portal; ahora cuenta como «sin número».

### Dos puntos ciegos del control del municipio

El control solo lee los trozos de la categoría y el paréntesis final del nombre.
No mira el **cuerpo del nombre** ni las **etiquetas**, y solo reconoce el nombre
**entero** del municipio. Medido: 22 etiquetas en 20 fichas nombran otro
municipio que el del polígono. Casi todas tienen sentido (un sendero de Vilaflor
a Arona, el HiperDino de Santiago del Teide etiquetado «El Tanque» porque es el
súper de ese pueblo), así que convertirlo en un control que falla solo daría
falsas alarmas. Pero salió una que no cuadra:

* **«HiperDino San Juan de la Rambla»** tiene el pin **234 m dentro de Los
  Realejos**. Su categoría dice «San Juan **Rambla**», abreviado, y por eso el
  control no lo vio. O el súper está en Los Realejos junto a la raya, o el pin
  está desplazado (tiene cuatro decimales, de los puestos a ojo). **Pregunta
  abierta**, no es de las gasolineras.

## Tus respuestas del 3 de octubre

* **«Molinos de Gofio»**: la errata era del registro. Va en `correcciones-registro.json`
  como errata con fuente (tu captura de Google y OSM), así que se sigue aplicando
  cada vez que se descarga el registro. Ahora: «Plenergy · Calle Molinos de Gofio».
* **Moeve de la C/ Filipinas**: Google da ahora L-V 07:00-15:00, sábado y domingo
  cerrado, **lo mismo que el registro**. La app tenía razón; la captura antigua
  era la equivocada.
* **HiperDino de San Juan de la Rambla**: Google da como más cercanos tres
  SuperDino de Icod y Los Realejos, y en el sitio del pin no hay nada a 300 m en
  el mapa. Todo apunta a que **no existe**, como el Mercadona de El Médano.
  **Borrada** con tu OK (919 lugares), documentada en
  `datos/entregas/baja-hiperdino-san-juan-rambla.json`.

## Sesión 10 · Guía de Isora · HECHA el 3 de octubre

**6 altas** de 7. La app pasa de 914 a **920 lugares**. Revisor: 6 fichas, **0
hallazgos**, 7 de 7 con su ficha.

La séptima la cubría la antigua «Shell Guía de Isora (TF-82)», a **166 m** de la
Shell de la Avenida de Isora, 86, la única a menos de 600 m. Tu LEEME tiene la
regla exacta: misma marca a 150-300 m, **coordenada del registro**, con antes y
después. Hecho con `fijar_coordenada.py` (comprueba que cae en tierra y apunta la
fuente en `verificado.json`): de 28.2137, -16.7829 a 28.212417, -16.782028. Su
horario era «todos los días 07:00-22:00» y el registro da L-S 06:00-22:00 · D
07:00-17:00: corregido.

El aplicador paraba a partir de 50 m, más estricto que tu LEEME sin motivo. Ahora
usa tus umbrales: misma marca a ≤150 m, se enlaza; a 150-300 m, se enlaza y se
corrige el pin; otra marca o sin marca, para.

**Para la sesión 91:** su descripción dice «Shell en la TF-82, Guía de Isora **km
120**», y el km 120 es la **otra** Shell, la de Tejina de Guía.

Retoque de forma: «AVENIDA AV ISORA» era la avenida repetida y abreviada; ahora
«Shell · Avenida Isora».

## Sesión 11 · Güímar · HECHA el 3 de octubre

**6 altas**, sin ficha antigua en el municipio (la «BP Güímar» antigua está en
Arafo y se enlazó en la 09). La app pasa de 919 a **925 lugares**. Revisor: 6
fichas, **0 hallazgos**.

Un fallo de la plantilla, arreglado antes de aplicar: la regla que pone la
grafía del Cabildo a un municipio dentro de una calle comparaba sin acentos solo
por un lado, y «GÜIMAR» (con diéresis y sin la tilde de la í) no casaba nunca:
salía «Polígono Industrial Valle de **Güimar**». Ahora compara sin acentos por
los dos lados: «Valle de **Güímar**». No cambia ningún otro nombre.

## Revisión de los bloques 10 y 11 · 3 de octubre

Registro sin cambios; revisor: 12 fichas, **0 hallazgos**, 13 de 13 estaciones.

* **Pins:** los 13, a menos de 43 m de una vía con coches.
* **La captura «sin registro» sí estaba.** IMG_3481, «Océano Güímar», era la única
  de tus 62 que no se había encontrado en el registro. Google la pone en
  «Manzana 13, Parcela 10» y el registro en «POLÍGONO INDUSTRIAL VALLE DE GÜÍMAR
  MZ. 13, PC. 10»: es la Océano 12479, que ya está en la app. No casaba porque
  Google le da el código postal 38508 y el registro 38500, y la captura no traía
  municipio. **De tus 62 capturas no falta ninguna estación.**
* **Duplicados con otras categorías:** ninguno. Las 6 fichas de otra categoría a
  menos de 40 m de una gasolinera son cosas distintas que están al lado (un
  Mercadona, buceo y pesca del Puerto Colón, un mercadillo...).
* **La marca «Océano» salía traducida** en las etiquetas: «Ocean», «海洋»,
  «Океан». Dos campos de golf usan la etiqueta «Océano» para el mar y el
  glosario la traduce, cosa correcta para ellos. Ahora un nombre propio (marca o
  municipio) no va como etiqueta si el glosario traduce esa palabra como otra
  cosa: la marca ya está en el nombre y en la categoría, que no pasan por el
  glosario. Era la única que chocaba. Las 7 Océano, rehechas; el revisor lo
  vigila, y lo cazó en las 7 antes de arreglarlo.
* En la app: la Shell antigua de Guía de Isora con su pin ya en el sitio del
  registro, y la Océano de Güímar en castellano y en chino tradicional.

## Sesión 12 · Tacoronte · HECHA el 3 de octubre

**5 altas** de 6. La app pasa de 925 a **930 lugares**. La sexta la cubría la
antigua «Cepsa Tacoronte (TF-5)», a 1 m: se enlaza, y su horario pasa de
«06:00-23:00 · todos los días» a lo que dice el registro, **24 h**. Otra antigua
con el horario mal. Revisor: 5 fichas, **0 hallazgos**.

### Kilómetros imposibles en las direcciones

Salían «Carretera General Norte **km 386**» y «… del Norte **km 152**» en
Tacoronte. Ninguna carretera de Tenerife llega a eso. El campo KM del registro a
veces no es un kilómetro, y ahora se tira en tres casos que se ven en los propios
datos, sin adivinar:

* **copia del portal**: «GUAZA,**380** KM. **380**», «DEL NORTE, **173** KM.
  **173**». Antes se quitaba el portal y se dejaba el km: justo al revés.
* **copia de la carretera**: «(TF-**152** … KM. **152**».
* **imposible, ≥ 130**: el km más alto con carretera identificable en el registro
  es el **120** (Tejina de Guía). Quedaban 13200, 386, 320, 213, 194, 186, 136 y
  132. Alguno será un decimal perdido (13200 sería el 13,2), pero no se sabe
  cuál: se quita y no se pone nada.

Cambian **11 direcciones** y ningún nombre; las 6 de municipios ya hechos se
rehicieron (Arona, La Orotava, La Laguna, Santa Cruz).

Y una errata del registro: «CARRETERA GRAL. PUERTO **CUZ**-LAS ARENAS» (Puerto de
la Cruz). Corregida a «Cruz» con tu OK, como errata con fuente en
`correcciones-registro.json`.

## Sesión 13 · Arico · HECHA el 3 de octubre

**4 altas** de 5. La app pasa de 930 a **934 lugares**. Revisor: 4 fichas, **0
hallazgos**.

La quinta la cubría la antigua «Estación Abades (TF-1 km 44)», a 1 m de la
«ESTACIÓN ABADES KM 44» del registro. Ninguna de las dos tiene marca, y el
emparejador lo trataba como «marca distinta» y paraba. Ahora, sin marca en
ninguna de las dos, son la misma si el nombre propio del rótulo («Abades») está en
el nombre de la ficha. El revisor tiene la misma regla, escrita aparte. Su horario
decía «L-V 06:00-22:00 · S 07:00-22:00 · D 08:00-21:00» y el registro da **24 h**:
corregido. Es la sexta antigua con el horario mal de las diez enlazadas.

## Las 14 antiguas, con el horario del registro · 3 de octubre

Pediste arreglar el horario sin esperar a cada sesión. Las 4 que faltaban, todas
mal:

| ficha antigua | decía | el registro |
|---|---|---|
| BP Puerto de la Cruz | **24 h** | 06:30-22:30 |
| DISA El Bohío | L-V 06:15-22:15 · S · D | **24 h** |
| Repsol El Sauzal | 06:00-23:00 | 06:00-22:00 |
| DISA Vilaflor | solo L-V 07:00-21:00 | L-S 07:00-21:00 · **D 08:00-14:00** |

En total, **11 de las 14** antiguas tenían el horario mal (te dije «6 de 10»
cuando eran 7 de 10). Ahora las 14 están enlazadas con su estación (`--enlazar-antiguas`,
con las reglas del LEEME) y con horario y dirección del registro. La BP de Puerto
de la Cruz decía además «TF-5 km 30» y es la Carretera del Botánico km 6.

## Revisión de los bloques 12 y 13 · 3 de octubre

Registro sin cambios; revisor: 9 fichas, **0 hallazgos**, 11 de 11 estaciones.
Los 11 pins, a menos de 20 m de una vía con coches. Ningún duplicado nuevo con
otras categorías. En el mapa la carretera de Tacoronte es la «Carretera General
del Norte · TF-152», que confirma que el «KM. 152» del registro era el número de
la carretera copiado. En la app: la Estación Abades, una de Arico en chino, una
de Tacoronte en francés y la BP de Puerto de la Cruz en italiano, bien.

## Sesiones 14 y 15 · Icod de los Vinos y Puerto de la Cruz · HECHAS el 3 de octubre

Pediste «sigue con el 15, no dejes nada en el camino»: se hicieron la 14 y la 15.

* **Icod de los Vinos: 5 altas**, sin ficha antigua.
* **Puerto de la Cruz: 4 altas** de 5; la quinta es la antigua «BP Puerto de la
  Cruz», enlazada esta misma tarde. Aquí entra la errata corregida («Puerto
  **Cruz**-Las Arenas») y sin el «km 132» imposible.

La app pasa de 934 a **943 lugares** (934 + 5 + 4, comprobado a mano). Revisor:
9 fichas, **0 hallazgos**, 10 de 10 estaciones.

**Para la sesión 91:** «BP Puerto de la Cruz (**TF-5 km 30**)» está, según el
registro, en la Carretera del Botánico km 6.

## Sesión 16 · El Sauzal · HECHA el 3 de octubre

**4 altas** de 5; la quinta es la antigua «Repsol El Sauzal», ya enlazada. La app
pasa de 943 a **947 lugares**. Revisor: 4 fichas, **0 hallazgos**.

Un fallo mío, arreglado antes de aplicar: «CARRERA GENERAL DEL NORTE, **20,450**»
salía «…, **20**». Un número con decimales no es un portal, es un punto
kilométrico (las de al lado, en la misma carretera, son el 20,65 y el 20,400).
No se convierte en km porque el registro no lo dice: se quita. Cambia también una
de Candelaria («…, 14.1»), que aún no está aplicada.

«**CARRERA** GENERAL DEL NORTE» (aquí) y «**CARRERA** GENERAL LAS GALLETAS»
(Arona): con tu OK, errata con fuente, «Carretera». La DISA de Ravelo pasa a
llamarse «DISA · Carretera General del Norte (**Ravelo**)», para no confundirse con
la otra DISA de El Sauzal ni con la de Tacoronte.

## Sesión 17 · Candelaria · HECHA el 3 de octubre

**4 altas**, sin ficha antigua. La app pasa de 947 a **951 lugares**. Revisor: 4
fichas, **0 hallazgos**. Los cuatro nombres, limpios con las reglas que ya había
(«AVENIDA AVDA. MARÍTIMA» → «Avenida Marítima»).

## Revisión de los bloques 15, 16 y 17 · 4 de octubre

Pediste revisar la 15 y la 16 y «seguir con la 17», que ya estaba hecha: se
revisaron las tres.

* **Registro:** el último es del 2 de octubre; el workflow no se ha vuelto a
  lanzar. Revisor contra ese registro: 12 fichas, **0 hallazgos**, 14 de 14
  estaciones con su ficha, y las dos antiguas enlazadas (Puerto de la Cruz y El
  Sauzal) bien.
* **Pins:** los 14, a menos de 20 m de una vía con coches.
* **Tus dos capturas de El Sauzal cuadran con el registro:** la BP cierra a las
  23:00 en las dos fuentes (el registro añade que el domingo a las 22:00) y la
  Cepsa a las 22:00 en las dos.
* **Duplicados con otras categorías:** ninguno nuevo.
* **En la app:** la DISA de Ravelo con su nombre nuevo (inglés), la de la
  Avenida Marítima de Candelaria (polaco) y la Shell de «Puerto Cruz» (búlgaro),
  bien, nada fuera de la pantalla.

## Sesión 18 · Santiago del Teide · HECHA el 4 de octubre

**4 altas**, sin ficha antigua. La app pasa de 951 a **955 lugares**. Revisor: 4
fichas, **0 hallazgos**.

La DISA de la «CARRETERA AVENIDA GENERAL FRANCO 3 KM. 82,9», **comprobada**: tu
Street View de julio de 2026 en 28.293833, -16.815583, que es exactamente la
coordenada del registro, enseña una DISA. Se usa el IDEESS 9664, la coordenada del
registro y la dirección tal cual: es el texto oficial, aunque el nombre de la calle
sea antiguo.

## Sesión 19 · Fasnia · HECHA el 4 de octubre

**3 altas**, sin ficha antigua. La app pasa de 955 a **958 lugares**. Revisor: 3
fichas, **0 hallazgos**. Las dos de la autovía con su código y su km («BP · Autovía
TF-1 km 36,5», «Moeve · Autovía TF-1 km 34»).

## Revisión de los bloques 18 y 19 · 4 de octubre

Registro del 2 de octubre, sin cambios. Revisor: 7 fichas, **0 hallazgos**, 7 de 7
estaciones. Pins: los 7, a menos de 22 m de una vía con coches. Una vecindad
nueva con otra categoría: el centro de salud de Santiago del Teide, a 23 m de la
DISA; una cosa distinta al lado, no un duplicado. En la app, tres fichas (alemán,
chino, neerlandés): bien.

**Prueba nueva: el km de las estaciones del TF-1, en orden.** El TF-1 empieza en
Santa Cruz, así que a más km, más lejos de Santa Cruz. Nueve de diez van en
orden. Una no:

| estación | km del registro | en línea recta de Santa Cruz |
|---|---|---|
| Moeve, Fasnia | 34 | 32,5 km |
| **BP Fasnia** | **36,5** | **31,1 km** |
| Repsol, Arico | 39 | 37,3 km |

La BP está **al norte** de la Moeve, las dos a unos 60 m de la autopista, así que
va antes por el TF-1 y su km tendría que ser menor que 34; por la relación de las
otras nueve, hacia el **km 33**. Y en su pin OSM tiene una **Repsol** a 1 m. O OSM
está desfasado (cambió de Repsol a BP) o la coordenada apunta a otra estación.
**Resuelto con tu Street View** (agosto de 2026): en 28.222694, -16.414139 está
la **BP**; la Repsol de OSM estaba desfasada. Con la posición comprobada, el «km
36,5» queda contradicho: se quita del nombre y de la dirección y no se pone otro,
porque el bueno (hacia el 33) lo deduciría yo y ninguna fuente lo dice. Va como
dato, `km_contradicho` en `correcciones-registro.json`, con tu captura de prueba.
Ahora es «**BP · Autovía TF-1**».

## Sesión 20 · La Guancha · HECHA el 4 de octubre

**3 altas**, sin ficha antigua. La app pasa de 958 a **961 lugares**. Revisor: 3
fichas, **0 hallazgos**. La Tgas de la «TF-5 km 49» no lleva el km en el nombre:
está fuera del tramo que el registro llama autopista (km 16 a 25); ahí la TF-5 ya
es carretera normal.

## Sesión 21 · La Matanza de Acentejo · HECHA el 4 de octubre

**2 altas** de 3; la tercera es la antigua «DISA El Bohío (TF-5 km 25)», ya
enlazada, y su km coincide con el del registro. La app pasa de 961 a **963
lugares**. Revisor: 2 fichas, **0 hallazgos**.

## Revisión de los bloques 20 y 21 · 4 de octubre

Registro del 2 de octubre, sin cambios. Revisor: 5 fichas, **0 hallazgos**, 6 de 6
estaciones, y la antigua de El Bohío enlazada bien (54 m, misma marca). Pins: los
6, a menos de 40 m de una vía con coches; la Tgas de La Guancha, a 21 m de la
**TF-5** de OSM, así que el «TF-5» de su nombre es verdad. El «(Guía)» de la Shell
de La Matanza es un sitio de allí: el pin está a 3 m de la «Calle Toscas de Guía».
Ningún duplicado con otras categorías. En la app, cuatro fichas (francés,
italiano, chino tradicional, polaco): bien, nada fuera de la pantalla, cero
errores.

**Prueba nueva: el km en orden por la TF-5 y por la Carretera General del
Norte**, como la del TF-1. En la TF-5, seis de siete en orden; en la Carretera
General, nueve de diez. Las dos que no, **las dos de Tacoronte** (sesión 12):

| estación | km del registro | lo que dice su posición |
|---|---|---|
| BP, «Autopista El Torreón» | **11** | 1,5 km **después** de la Moeve del km 16. Y el km 11 de la TF-5 cae en **La Laguna**: Tacoronte empieza hacia el 15 |
| Tgas, «Carretera General del Norte» | **79** | **antes** que las de El Sauzal (km 20,4 y 20,65); la serie va del 20,4 al 52,7 de Icod |

Aquí no hay duda de qué estación es: la coordenada, el municipio y el CP del
registro dicen Tacoronte, y OSM tiene en los pins una «BP Los Naranjeros» (0 m) y
una «Tgas» (8 m). **Propuesta:** quitar los dos km como en Fasnia, sin poner otro.
Hasta tu OK se quedan los del registro.

**Para la sesión 91:** en chino tradicional, El Bohío dice «拉馬坦薩» en la
categoría y «La Matanza», en castellano, en la etiqueta.

## Sesión 22 · El Rosario · HECHA el 4 de octubre

**3 altas**, sin ficha antigua. La app pasa de 963 a **966 lugares**. Revisor: 3
fichas, **0 hallazgos**. Contraste con OSM: la Pcan, a 21 m de la **TF-24**, así
que el «TF-24» de su nombre es verdad, y su km 5,5 va en orden con el 2,2 de la
Pcan de La Laguna. La Moeve está en la Carretera General del Sur (TF-28), **no**
en la TF-1, y su nombre no dice TF-1. La Tgas, a 9 m de la Calle Isaac Peral.

**Un fallo de la plantilla, arreglado antes de aplicar.** El registro escribe
«C/ LA CAMPANA, S/N (**CTRA. GRAL. DEL SUR km 4**)» y salía «Calle La Campana km
4»: una calle no tiene km 4, ese km es de la carretera del paréntesis. Ahora
sale «Calle La Campana (Carretera General del Sur km 4)». De las 212 cambian
solo 3 direcciones: esta, la Shell de Tejina de Guía (ya en la app, rehecha:
«Tejina de Guía (Carretera General km 120)») y la 7827 de Los Silos, que aún no
está. Cuando el paréntesis es solo el tramo («TF-66(GUAZA-GALLE KM. 2»), el km
sigue siendo de la carretera de fuera. El revisor lo controla ya; probado
metiendo el fallo a propósito.

## Sesión 23 · Tegueste · HECHA el 4 de octubre

**3 altas**, sin ficha antigua. La app pasa de 966 a **969 lugares**. Revisor: 3
fichas, **0 hallazgos**. Contraste con OSM: la BP y la Tgas, a menos de 30 m de la
**TF-13**; la DISA, a 20 m de la **TF-154**. Los «TF» de los nombres son verdad. El
«KM. 320» de la BP no sale: esa carretera no llega a 320.

**Pregunta: horarios de «solo lunes».** El registro da a la Tgas «**L**: 06:00-23:00»,
o sea, solo el lunes, y la ficha lo enseña así («Mon 06:00-23:00» en inglés). No
es la única: hay **6 más ya en la app** con el mismo «L» a secas.

| estación | registro |
|---|---|
| Tgas, Tegueste (7728) | L 06:00-23:00 |
| Moeve, Arico (7696) | L 06:00-22:00 |
| Shell, Puerto de la Cruz (8754) | L 24 h |
| Moeve, Puerto de la Cruz (7624) | L 06:00-00:00 |
| Repsol, Los Realejos (7685) | L 06:00-00:00 |
| Repsol, Geneto, La Laguna (7675) | L 24 h |
| Pcan, La Laguna (11562) | L 06:00-23:00 |

Tus capturas de Google: la Repsol de Geneto, «Abierto 24 horas»; la Tgas, abierta
hasta las 23:00 el día de la captura (no consta qué día era). Lo más probable es
que abran todos los días, pero el registro no lo dice y no me toca ponerlo.
**¿Se dejan como dice el registro, se miran en la web de cada marca o se quita el
horario en esas siete?** Mientras, se quedan como dice el registro.

## Tus horarios de «solo lunes» · 4 de octubre

Aplicados como dato, con tu nota de fuente (`horarios` en
`correcciones-registro.json`). Valen mientras el registro siga diciendo lo mismo;
si cambia, manda el nuevo. Ahora abren **todos los días**: Tgas Tegueste
(06:00-23:00), Moeve Arico (06:00-22:00, por tu captura), Shell y Moeve de Puerto
de la Cruz (24 h y 06:00-00:00), Repsol Geneto (24 h) y Pcan Guamasa (**06:00-21:30**,
no 23:00). De las 212 cambian solo esos seis horarios.

**La Repsol de Los Realejos, no.** Tu captura «Repsol Palo Blanco, Carr. la
Ferruja, 52» es la **otra** Repsol, la 7684 de la TF-326: el paraje de La Ferruja
está a 110 m de ella y a 1,6 km de la de la nota (7685, Calle Piñera, Cruz
Santa). La 7684 ya tiene en el registro «L-D 06:30-00:00», lo mismo que Google.
La 7685 se queda con «L 06:00-00:00» y el revisor la avisa.

## Revisión de los bloques 22 y 23 · 4 de octubre

Registro del 2 de octubre, sin cambios. Revisor, con todas: 191 fichas, **0
hallazgos**. Pins: los 6, a menos de 31 m de su vía. Vecindad: el mercadillo de
Tegueste, a 45 m de la Tgas; otra cosa, no un duplicado.

**Lo que no se ve: el horario.** Al abrir las fichas para mirar los horarios
nuevos, no salen: **la app no enseña el horario de las gasolineras en ningún
sitio**. La hoja de detalle solo pinta la dirección, y el globo del mapa pinta
horario y dirección solo para hospitales, centros de salud, farmacias y
veterinarios. Les pasa igual a 18 oficinas de turismo y 18 campings. El dato
está, en los diez idiomas, pero nadie lo ve. Te dije que «la ficha lo enseña así»:
**no era verdad**, lo enseñan los datos, no la pantalla. **Pregunta:** ¿se pinta?

**Prueba nueva: el código postal contra el municipio.** Un mismo CP en dos
municipios es normal si son vecinos (38108, Taco: La Laguna y Santa Cruz; 38660,
Las Américas: Adeje y Arona). Dos no lo son:

| CP | dónde lo pone el registro |
|---|---|
| **38420** | Moeve y Pcan de **El Rosario** (sesión 22) · Repsol de **San Juan de la Rambla**, a 30 km |
| **38260** | dos de **Abades** (Arico) · dos de **Tejina** (La Laguna), a 50 km |

Para la Moeve de La Campana, tu captura (IMG_3459) dice **38109**, el mismo que
el registro da a la Tgas del mismo polígono, a 550 m. Para las otras no hay
captura. **Pregunta:** ¿se cambia (con fuente) o se quita el CP? Mientras, el del
registro.

## Sesión 24 · Santa Úrsula · HECHA el 4 de octubre

**2 altas**, sin ficha antigua. La app pasa de 969 a **971 lugares**. Revisor: 2
fichas, **0 hallazgos**. En OSM, la Repsol a 9 m y la Shell a 6 m de sus pins. El
«KM. 213» de la Repsol es el número de su carretera (la TF-213) copiado en el
campo del km, como el 152 de Tacoronte: no sale. El km 31 de la Shell va en orden
con los de la Carretera General del Norte.

## Tus respuestas del 4 de octubre, por la tarde («Sí y sigue 25»)

**El horario ya se ve.** En la ficha (móvil) y en el globo del mapa (ordenador),
encima de la dirección y en el idioma de la pantalla: «🕐 Mon-Sun 06:00-21:30».
Solo para las fichas que salen del **registro oficial** (las que llevan IDEESS,
las gasolineras). Las 18 oficinas de turismo y los 18 campings también tienen
horario guardado, pero **no se pinta**: no tiene fuente (`REVISION-LUGARES.md`:
«horarios, precios y teléfonos… no hay contra qué contrastarlos») y tres oficinas
(Santa Cruz, Puerto de la Cruz, Adeje) tienen exactamente el mismo, de plantilla.
Lo de los campings ni siquiera es un horario («Permiso previo obligatorio ·
reserva en Tenerife ON»). La auditoría lo controla: el horario de una gasolinera
tiene que salir en su idioma, y el de un camping no tiene que salir (probado
metiendo los dos fallos).

**Tacoronte, sin los km contradichos:** «BP · Autopista El Torreón» (fuera el km
11) y la Tgas sin el km 79 en la dirección. Como en Fasnia, en `km_contradicho`.

**El CP de la Moeve de La Campana:** 38420 → **38109**, con tu captura y el CP que
el registro da a la Tgas de su polígono. Las otras tres (la Pcan de La Esperanza
y las dos de Abades) siguen con el del registro: no hay fuente para el bueno.

## Sesión 25 · Buenavista del Norte · HECHA el 4 de octubre

**1 alta**, sin ficha antigua. La app pasa de 971 a **972 lugares**. Revisor: 1
ficha, **0 hallazgos**. En OSM, la DISA a 6 m del pin, en la TF-42.

## Revisión de los bloques 24, 25 y 26 · 4 de octubre

Registro del 2 de octubre, sin cambios. Revisor: 4 fichas, **0 hallazgos**, 4 de 4
estaciones. Pins: los 4, a menos de 25 m de su vía y a menos de 16 m de una
gasolinera de OSM. Ningún duplicado con otras categorías. En la app, Garachico
(italiano), Santa Úrsula (chino tradicional) y Buenavista (alemán), con su
horario ya a la vista: bien.

**Prueba nueva 1: la app contra la plantilla de hoy.** Cada una de las 194 fichas
generadas, campo a campo y en los diez idiomas, contra lo que la plantilla
genera ahora: **0 diferencias**. Ningún cambio de regla se ha quedado sin
aplicar en ningún municipio, tampoco en Garachico, que se hizo el 2 de octubre.

**Prueba nueva 2: la marca del registro contra OSM.** 17 de 212 tienen en OSM, a
menos de 60 m, otra marca. Las dos que ya se comprobaron daban la razón al
registro (la BP de Fasnia, por tu Street View; la DISA de Las Delicias, por la
web de DISA). En el bloque 26: **Garachico**, «E.S. LA CALETA» en el registro y
«Estación de Servicio Moeve Garachico» en OSM. Manda el registro y no se cambia
nada; la lista entera está en `sesiones.json` (`marca_contra_osm`) por si quieres
mirar alguna.

**Para tu OK, cuatro mayúsculas** (como las tildes):

| ahora | propuesta | por qué |
|---|---|---|
| Avenida Juan Méndez **El** Viejo | Juan Méndez **el** Viejo | sobrenombre: el artículo va en minúscula (OSM lo escribe así) |
| Acceso Carretera a **la** Hidalga | a **La** Hidalga | el artículo es parte del nombre del pueblo; el propio registro dice «La Hidalga» |
| Carretera General a **las** Galletas-Chafiras | a **Las** Galletas | ídem |
| Carretera a **los** Abrigos | a **Los** Abrigos | ídem |

## Sesión 27 · San Juan de la Rambla · HECHA el 4 de octubre

**1 alta**, sin ficha antigua. La app pasa de 972 a **973 lugares**. Revisor: 1
ficha, **0 hallazgos**. En OSM, a 16 m de la **TF-5** y a 6 m de una Repsol: el
«TF-5» del nombre es verdad. Su km 46,3 va en orden con el 49 de La Guancha. Sin
km en el nombre: ahí la TF-5 ya no es el tramo que el registro llama autopista.

## La Repsol de Cruz Santa · 4 de octubre

Tu captura (Google Maps, «C. El Mocan, 1A, 38413 Cruz Santa») es de la 7685: la
Calle el Mocán está a 32 m de su pin y a 1,6 km de la otra Repsol. Su horario
pasa de «L 06:00-00:00» (solo el lunes, del registro) a **L-V 06:00-22:00 · S-D
07:00-22:00**. Ya no queda ningún horario de un solo día sin comprobar.

## Sesión 28 · Los Silos · HECHA el 4 de octubre

**1 alta**, sin ficha antigua. La app pasa de 973 a **974 lugares**. Revisor: 1
ficha, **0 hallazgos**. En OSM, una DISA a 3 m del pin. La dirección sale con el
km en su paréntesis: «Calle Félix Benítez de Lugo (General TF-142 km 11)».

**Pregunta: ¿«TF-142» es «TF-42»?** En OSM no hay ninguna TF-142 en toda la
isla. La calle de la gasolinera es la **TF-42a**, el ramal de la TF-42 por Los
Silos, y la estación de Garachico, 2,7 km antes por la TF-42, está en el km 8,9:
el km 11 cuadra con la TF-42. El nombre no lleva el número; la dirección lleva el
texto del registro hasta tu OK.

## Tu «Ok» del 4 de octubre

* **Errata «TF-142» → «TF-42»** (Los Silos): «Calle Félix Benítez de Lugo
  (General **TF-42** km 11)».
* **Las cuatro mayúsculas**: «Avenida Juan Méndez **el** Viejo», «Acceso Carretera
  a **La** Hidalga», «Carretera General a **Las** Galletas-Chafiras», «Carretera a
  **Los** Abrigos». Van como dato (`mayusculas` en `correcciones-registro.json`).
  De las 212 cambian solo esas cinco fichas.

## Sesión 29 · El Tanque · HECHA el 4 de octubre

**1 alta**, sin ficha antigua. La app pasa de 974 a **975 lugares**. Revisor: 1
ficha, **0 hallazgos**. En OSM, a 26 m de la **TF-82** y a 11 m de una Repsol: el
«TF-82» del nombre es verdad. Su km 8 es el de una TF-82 que empieza en Icod; las
otras TF-82 del registro llevan los km antiguos de la C-820 (Santiago del Teide
82,9 y 84,95; Guía de Isora 96). Dos escalas, las dos del registro: no se toca.

**Pregunta: la Moeve de Icod (sesión 14) no está en la TF-82.** Se llama «Moeve ·
Carretera TF-82» porque el registro dice «CARRETERA TF-82 KM. 53,6», pero en OSM
está a 19 m de la **TF-42** y a 2,3 km de la TF-82. Su km 53,6 es de la antigua
C-820: la otra Moeve de Icod, a 0,7 km, es «CARRETERA GENERAL C-820 KM. 52,7».
**Propuesta:** errata «CARRETERA TF-82» → «CARRETERA GENERAL C-820», como su
vecina. Quedarían «Moeve · Carretera General C-820 km 53,6» y «… km 52,7».

## La Moeve de Icod · 4 de octubre

Comprobado por ti en la web de Moeve: «ICOD DE LOS VINOS», «**C-820 PK 53,5**»,
la misma posición que el registro (a menos de 2 m) y el mismo horario. El
registro cambió «C-820» por «TF-82» y dejó el km viejo, pero ese tramo de Icod
no es la TF-82. Errata con fuente: «CARRETERA TF-82 KM. 53,6» → «CARRETERA GENERAL
C-820 KM. 53,6». Ahora «**Moeve · Carretera General C-820 km 53,6**» y su vecina
«**… km 52,7**» (llevan el km para no llamarse igual). El km es el del registro.

## Sesión 30 · La Victoria de Acentejo · HECHA el 4 de octubre

**1 alta**, la última. La app pasa de 975 a **976 lugares**. Revisor: 1 ficha, **0
hallazgos**. En OSM, una Shell a 3 m del pin, en la Carretera General del Norte;
su km 27 va en orden. **Las 212 estaciones del registro tienen ficha.**

## Verificación de los bloques 00 a 31 · 4 de octubre

Pediste verificar cada bloque antes de la 31. Dos herramientas nuevas, para poder
repetirlo con cada registro nuevo: `tools/verificar_bloques.py` (informe entero en
`datos/gasolineras/verificacion-bloques.md`) y `tools/verificar_fichas_app.js`, que
abre en la app las 212 fichas y sus 212 globos en los diez idiomas (ya está en la
auditoría; probado metiendo dos fallos).

**Lo que está bien, en los 32 bloques:**

* **212 estaciones, 212 fichas** (198 nuevas y 14 antiguas), una por estación,
  todas de venta al público y con su IDEESS. El municipio del polígono = el del
  registro en las 212.
* **Revisor independiente: 0 hallazgos.** **Plantilla: 0 diferencias** (ningún
  cambio de regla sin aplicar).
* **Tus 62 capturas tienen todas su ficha.**
* **En pantalla: 2.120 fichas y 2.120 globos, bien**: nombre, categoría,
  descripción y horario en su idioma, etiquetas traducidas, dirección, nada
  fuera de la pantalla.
* LEEME en las 198 nuevas: ni Cepsa (todas Moeve), ni teléfonos, ni precios ni
  valoraciones, ni comillas. `sesiones.json` cuadra con la app.
* Bloque 00: el vocabulario de la plantilla, leído palabra a palabra en los diez
  idiomas, bien.

**Fallos: 5, los cinco del mismo tipo que Icod**: un código de carretera en el
nombre que **no pasa junto al pin** (y que, salvo la TF-21, no existe en toda la
isla según OSM). Propuesta, como errata del registro:

| ficha | ahora | propuesta | prueba |
|---|---|---|---|
| Moeve, Santa Cruz | Autopista **TF-21** km 3,5 | Autopista **TF-1** km 3,5 | tu captura: «Autop. del Sur, PK 3,5»; TF-1 a 30 m |
| Shell, Puerto de la Cruz | Carretera Martiánez **TF-131** | **TF-31** | TF-31 a 12 m (como TF-142 → TF-42) |
| DISA, Arico Nuevo | Carretera **TF-822** | **TF-28** | TF-28 a 12 m; mezcla de C-822 y TF-28, como Icod |
| DISA, Playa San Juan | Carretera General **TF-623** | **TF-47** | TF-47 a 46 m; su km 13 cuadra con el 2,7 de la TF-47 en Armeñime |
| BP, Taco | Carretera **TF-411** | **TF-194**? | TF-194 a 20 m; pero tu captura de Google también dice TF-411 |

Simulado: solo cambian esas cinco fichas.

**Coordenadas que no cuadran con OSM** (el registro manda; no se toca sin fuente):

* **Moeve «Llano Azul», Arona:** el pin del registro cae junto al Monkey Park, a
  118 m de cualquier vía; OSM tiene una Moeve a 496 m, en la TF-662 de su
  dirección («Guaza-Los Cristianos»). La web de Moeve da coordenadas (como en
  Icod): es la mejor fuente.
* **DISA Ofra, La Laguna:** el pin del registro está en la Carretera La Cuesta-Taco
  de su dirección, pero tu captura la pone en la **Calle Zerolo, 6**, donde OSM
  tiene una Disa, a 1,2 km.
* Menos claras (el pin del registro sí está en la carretera de su dirección): BP
  Ten Bel, BP Aeropuerto Sur, Repsol Arafo, Repsol Barroso, Repsol Porís.

**Nombres con el IDEESS:** las dos DISA de la Autovía de San Andrés salen
«(10995)» y «(7879)»; el registro las llama «**Balneario II**» y «**Balneario I**».
Propuesta: usar eso. La pareja de Repsol del TF-1 km 54, en la 91.

**Para la sesión 91** (las 14 antiguas): tres se llaman «**Cepsa**» (es Moeve);
cuatro llevan un TF que no es el suyo; siete llevan un **teléfono** sin captura ni
OK (no se enseña, pero el LEEME no lo quiere); y lo apuntado en cada sesión.

**Para mirar, sin fallo:** dos escalas de km en la TF-82 y en la Carretera
General del Sur (las dos del registro); 17 marcas distintas en OSM (las dos
comprobadas daban la razón al registro); 3 CP sin fuente para el bueno.

## Tus respuestas del 4 de octubre, por la noche

**Los cinco códigos de carretera** («si estás seguro, cámbialas»). Solo los que
tienen dos pruebas que no dependen una de otra:

| ficha | ahora | pruebas |
|---|---|---|
| Moeve, Santa Cruz | «Autopista **TF-1** km 3,5» | tu captura («Autop. del Sur») y la TF-1 a 30 m |
| DISA, Arico Nuevo | «Carretera **TF-28**» | su km 50 cae en la serie de la Carretera General del Sur del propio registro; la TF-28 a 12 m |
| DISA, Playa San Juan | «Carretera General **TF-47**» | su km 13 cuadra con el 2,7 de la TF-47 en Armeñime; la TF-47 a 46 m |
| BP, Taco | sigue «**TF-411**» | la web de DISA llama así a esa carretera, igual que Google y el registro |
| Shell, Puerto de la Cruz | sigue «**TF-131**» | solo tengo OSM: **falta una segunda fuente** |

**Las dos coordenadas.** Tus capturas confirman la dirección y el horario de la
Moeve Llano Azul (24 h) y de la DISA Ofra (06:00-22:00), que son los del
registro. Pero ninguna trae la posición, así que los pins no se tocan: hace falta
un Street View en el pin del registro (como en Fasnia) o las coordenadas de la
web de la operadora (como en Icod).

**Nombres sin IDEESS.** «DISA · Autovía Santa Cruz-San Andrés (Balneario I)» y
«(Balneario II)», como las llama el registro; y la pareja de Repsol del TF-1 km
54, «(margen derecho)» y «(margen izquierdo)», el campo Margen del registro tal
cual. Ya no queda ningún nombre con un número.

## Sesión 91 · las 14 antiguas · HECHA el 4 de octubre

Rehechas desde el registro, como las demás: **conservan su id** (favoritos y
enlaces siguen valiendo) **y su pin** (el LEEME lo dio por bueno, misma marca a
menos de 150 m); nombre, categoría, descripción, horario, dirección, etiquetas y
color salen de la plantilla, en los diez idiomas. Con eso se van:

* los tres «**Cepsa**» (ahora Moeve);
* los cuatro **TF que no eran el suyo** («BP Guaza (TF-1 km 21)» está en la
  TF-66: ahora «BP · Carretera General Guaza TF-66»);
* los siete **teléfonos** que no salían de ninguna captura;
* las frases que nadie podía comprobar («Buen punto de parada», «Amplia y
  luminosa», «pueblo más alto de España»).

Lo que sí valía se queda, con su porqué: **Vilaflor** lleva ahora el aviso de
«última gasolinera antes del Teide por el sur», como la Barroso por el norte (el
registro no tiene ninguna estación más arriba de Vilaflor). El francés del aviso
de la Barroso decía menos que los otros nueve: completado.

De paso, tres etiquetas mal traducidas: «Última» en chino era «末班» (último
servicio de autobús), ahora «最后一个»; «Importante» en inglés era «Major», ahora
«Important»; y en polaco «Ważne». El revisor aprendió el campo Margen (y caza el
margen contrario) y el verificador compara ya las 14 antiguas con la plantilla.

## Sesión 31 · Vilaflor · HECHA el 4 de octubre

Sin altas: su estación es la antigua de Vilaflor, verificada y rehecha en la 91.

## Lo que queda

* **Shell de Puerto de la Cruz:** «TF-131» o «TF-31». Una segunda fuente.
* **Moeve Llano Azul y DISA Ofra:** la posición (Street View en el pin del
  registro, o las coordenadas de la web de Moeve y de DISA).
* **DISA Vilaflor:** «Carretera General 821» es la antigua C-821, hoy la TF-21
  (a 14 m). ¿Errata a «TF-21»?
* **Sesión 92:** el fichero diario de precios y el modo de las 10 más baratas.

## Lo que necesito de ti antes de seguir

1. **Los precios aparte, ¿te vale?** Es la única forma de que el modo de «las 10
   más baratas» no mienta.
2. Las **14 fichas que sí casan** pasan al estilo nuevo en la **sesión 91**, como
   me dijiste.

*`python3 tools/gasolineras_plan.py` rehace las 31 tandas desde el registro.*
