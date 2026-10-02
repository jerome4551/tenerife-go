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

### Acentos que el registro se come y para los que no tengo fuente

Los dejo como el registro los escribe. **Dime si quieres que los ponga** y los
cambio de una vez:

`El Carreton` (polígono de Granadilla) · `San Andres` · `Vía Penetracion` ·
`Guia` (localidad de La Matanza) · y los nombres de persona de las calles
(`Felix Benitez`, `Dominguez`, `Jesus Hernandez Guzman`, `Panama` ya resuelto
porque el propio registro lo escribe «Panamá» en otro asiento).

## Lo que queda

**29 sesiones**, 178 altas. La siguiente por número es la **02, La Laguna (28)**.

---

## Lo que necesito de ti antes de seguir

1. **Los precios aparte, ¿te vale?** Es la única forma de que el modo de «las 10
   más baratas» no mienta.
2. Las **14 fichas que sí casan** pasan al estilo nuevo en la **sesión 91**, como
   me dijiste.

*`python3 tools/gasolineras_plan.py` rehace las 31 tandas desde el registro.*
