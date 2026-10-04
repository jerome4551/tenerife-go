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

## Lo que queda

**9 sesiones**, 13 altas. La siguiente es la **22-el-rosario** (3).

## Lo que necesito de ti antes de seguir

1. **Los precios aparte, ¿te vale?** Es la única forma de que el modo de «las 10
   más baratas» no mienta.
2. Las **14 fichas que sí casan** pasan al estilo nuevo en la **sesión 91**, como
   me dijiste.

*`python3 tools/gasolineras_plan.py` rehace las 31 tandas desde el registro.*
