# Estado del proyecto y auditoría

**20 de septiembre de 2026.** Documento único: dónde está la app, qué se ha
comprobado y qué falta. Sustituye al registro por fechas que había antes, y a
`BLOQUE-2.md` y `COORDENADAS.md`, cuyas listas están cerradas.

Todas las cifras salen de ejecutar la app o barrer el fichero. Ninguna está
recordada. Se vuelven a sacar con lo que hay en `tools/`.

```
index.html   md5 9a1eb23ca66c2749cdb91886b33acfbe
             3.185.808 bytes · 932.792 comprimidos · 37.290 líneas
idiomas/     9 ficheros de lugares · 2.489.750 bytes · 76 a 95 kB comprimidos
             + etiquetas/    · 9 ficheros con los chips del globo
             + privacidad/   · 10 ficheros con la política, 54 claves cada uno
             + glosario-cat/ · 7, y no hacen falta los diez: no se cargan en la
               app, los lee tools/completar_cat.js al construir
             + pl-lugares/ y pl-fuente/ · el polaco por bloques, revisable
faq/         10 ficheros · 122 respuestas del asistente en cada idioma
             el móvil baja solo el suyo
             + fuente/ · los bloques tal y como llegaron, y el bulgaro aparte
```

---

# 1 · Qué hay

| | |
|---|---|
| Lugares | **980**, con descripción y categoría en 10 idiomas (lo coteja `auditar_datos.js`) |
| Líneas | **183** — las 181 del GTFS de TITSA + L1 y L2 del tranvía |
| Paradas | **6.263** referencias sobre un catálogo de **2.514** marquesinas |
| Idiomas | es · en · fr · de · it · nl · zh · zht · bg · **pl** — los diez terminados |
| Ficheros | **427** versionados el 17 de octubre: 112 en `tools/`, 111 en `idiomas/`, 65 en `datos/`, 47 en `faq/`, 41 en la raíz, 36 en `vendor/` —con las 21 tipografías—, 5 en `supabase/`, 5 en `.github/`, 3 en `mapa/`, 1 en `modulos/` y 1 en `registro/` |
| Descarga | **1.034 kB** en castellano · **1.148 kB** en el peor caso (búlgaro) · 1.134 kB en polaco, el 21 de octubre, con el cielo de `cielo-camara` y lo de `main` de ese día juntos (el panel del cielo suma 10 kB, con «Apunta al cielo», la ficha y lo que piden las reseñas; lo demás lo pide al abrirlo). Sale de `python3 tools/peso_descarga.py`, no de la memoria |

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

## El cielo de Tenerife · un panel nuevo, y todo lo que enseña se calcula (17 de octubre)

Jerome pidió «todo lo que se puede observar desde Tenerife», con lluvias de
estrellas, eclipses, cometas y satélites, a partir de una guía en PDF que él
mismo describía como general, «no un inventario literal», y pidiendo un
catálogo que distinga lo que se ve **a simple vista, con prismáticos y con
telescopio**. Es el botón 🔭 de la barra, con cinco pestañas: esta noche, el
calendario, el catálogo, la carta del cielo y dónde ir.

**Nada de lo que caduca está escrito.** Sol, Luna, planetas, la Vía Láctea,
eclipses, lluvias, oposiciones y conjunciones se calculan en el móvil, en hora
de Canarias y para el Observatorio del Teide (la ficha `observatorio`, a
2.390 m), con Astronomy Engine (MIT, `vendor/`). Las lluvias salen de la
longitud solar de su máximo según la IMO, así que el calendario de 2031 sale
igual que el de este año. Lo fijo —2.683 estrellas para la carta, 51 con
nombre, 88 constelaciones, 200 objetos de cielo profundo que asoman, 28
sistemas dobles, 14 variables y 11 lluvias— está en `datos/cielo.json`, que
rehace `tools/cielo_construir.js` desde fuentes con commit fijado
(`tools/cielo_fuentes.sh`). El nivel de cada objeto no se escribe a mano: sale
de su magnitud corregida por la altura máxima a la que llega desde aquí.

**Cometas y satélites no se predicen.** Un cometa se descubre, se apaga o se
rompe de una semana a otra, y la Estación Espacial cambia de órbita: el panel
lo dice y lleva a la aplicación de la NASA para verla. La web «Spot the
Station» que citaba el PDF ya no existe: la NASA la cerró el 12 de junio de
2025 y queda su aplicación.

### Lo que decía el PDF y no es así

**47 Tucanae no se ve desde Tenerife.** Con declinación −72° no pasa nunca de
−10° bajo el horizonte de Izaña. El catálogo no la saca, y
`auditar_cielo.js` lo vigila.

### El peso: nada al arrancar, y sin conexión en el Teide

El panel entero —código y textos en diez idiomas— va en `modulos/cielo.js` y
se pide la primera vez que alguien lo abre. Dentro de `index.html` habrían
sido unos 100 kB comprimidos más en la primera descarga de todo el mundo; lo
que sí va en `index.html` (el botón, el marco del panel, el cargador y siete
filas de texto) son 9 kB. El service worker precachea el módulo, el motor y el
catálogo al instalar la app, sin que nadie haya abierto el panel: donde se usa
es en Las Cañadas, que es donde no hay cobertura.

```
lo que se pide al abrir el panel       comprimido
  modulos/cielo.js                     106 kB
  vendor/astronomy.browser.min.js       47 kB
  datos/cielo.json                      61 kB
lo que suma index.html                   9 kB
```

Un módulo sin etiqueta no lo ve ninguna herramienta que lea `index.html`, y
lleva 504 filas de texto. Se declara junto a su cargador con
`CARGA-PEREZOSA: modulos/cielo.js` y `tools/fuente.js` y `fuente.py` lo pegan
al fuente detrás de los demás (`perezosos()`); `ficheros()` sigue siendo solo
lo que se carga al arrancar, que es lo que cuenta `peso_descarga.py`.
`auditar_web.js` y `auditar_letras.js` pasan a leer el fuente entero.

### Los cálculos, contra lo que publican otros

Con el motor que lleva la app y el calendario del panel tal cual, desde un
día fijo:

| | Fuente | Lo publicado | La app |
|---|---|---|---|
| Eclipse de Sol, 2 ago. 2027, Güímar | snowy.es | 78,72 % · 07:32:53 · 08:33:40 · 09:41:36 UTC · Sol a 26,0° | 78,78 % · −6 s · −8 s · −10 s · 25,9° |
| Eclipse total de Luna, 31 dic. 2028 | IMCCE | P1 14:03:54 … P4 19:40:12 UTC | los siete contactos entre −39 s y +13 s; en Izaña la Luna sale ya eclipsada |
| Gemínidas 2026, máximo | IMO (Star Walk) | 14 dic., hacia las 14:00 UTC | 13:49 |
| Cuadrántidas 2027, máximo | Star Walk | 4 ene., hacia las 3:30 UTC | 3:34 |
| Marte y Júpiter | Sky Tonight | 1,193°, en Leo, 16 nov. 2026 | 1,194°, en Leo |

snowy.es no publica la coordenada que usa para Güímar: se calcula en la de la
ficha `ciudad-guimar`. El panel lo calcula en Izaña, a unos 10 km, y ahí da
78,8 % con los contactos a 20 s o menos.

### Textos con fuente

Las descripciones del catálogo se reescribieron contra su fuente, que va
encima de cada una en `modulos/cielo.js`. Cuatro decían más de lo que dice la
fuente: Andrómeda «de lo más lejano que se ve a simple vista» (la NASA dice que
se ve a simple vista desde un cielo oscuro, no eso), las Pléyades «decenas con
prismáticos» (el Royal Observatory dice seis a simple vista y que los
prismáticos abarcan el cúmulo entero), ω Centauri «el mayor de la Vía Láctea»
(ESA/Hubble: «el más grande y brillante del cielo») y Albireo «el contraste más
famoso» (Sky & Telescope: los colores son reales, no un efecto del contraste).
Y la Doble Doble decía «con prismáticos se ven dos» cuando el catálogo la pone
a simple vista: con buena vista se separa sin nada (BBC Sky at Night).

Los nombres de estrellas y constelaciones salen de las traducciones de
Stellarium; las designaciones (M35 · NGC 2168, β Mon) no se traducen y van
marcadas con `data-sin-traducir`. `barrido_pantallas.js` las cantó en chino y
en búlgaro (73 en cada uno) donde salían como nombre de algo sin nombre
corriente; ahora van marcadas también ahí.

### Lo que encontraron las capturas, y ningún control veía

Antes de darlo por terminado se miraron las pantallas una a una, y salieron
dos cosas que estaban bien escritas y decían algo falso:

- **Las 51 estrellas «variaban».** Sirio decía «Su brillo varía entre mag.
  0,9 y −0,3». Al cargar, el panel guarda en `.v` el vector de cada objeto,
  y la variabilidad del catálogo venía en un campo que también se llamaba
  `v`: se pisaba, y las cifras eran las componentes del vector. Solo siete
  varían (Betelgeuse, Aldebarán, Antares, Alnilam, la Polar, Algol y Mira).
  El campo se llama ahora `vr`, y dos controles nuevos lo vigilan: ningún
  registro del catálogo trae un campo `v`, y **cada una de las 381 fichas
  dice lo que dice `datos/cielo.json`** —altura, brillo, tamaño, periodo,
  separación, estrellas de cada constelación—, leído en crudo.
- **La noche sin Luna sumaba cinco minutos de más.** «6 h 15 min» para
  00:39–06:49: se contaban muestras de cinco minutos. Y los tramos se
  quedaban cortos en las puntas: el 13 de diciembre la Luna se pone a las
  22:06 y el tramo empezaba a las 22:10. Ahora los bordes son los de verdad
  —la hora exacta de la noche cerrada, y la salida o puesta de la Luna
  interpolada entre dos muestras— y el total es la suma de los tramos que se
  enseñan: 22:06–06:25, 8 h 19 min.

Un `undefined` se ve; una cifra equivocada es un texto perfecto. Por eso los
dos controles comparan con el dato, no con la forma.

### Los controles, y las averías con las que se probaron

- **`auditar_cielo.js`**, nuevo, en `auditar.sh`: el catálogo es el que sale
  de las fuentes; el observador es el mismo en el módulo, el catálogo, el
  constructor y la ficha; las 513 filas con los diez idiomas, sus
  `{marcadores}` por forma de plural y el alfabeto de cada uno; cada fila que
  pide el código existe y no sobra ninguna (también las que se arman en
  tiempo de ejecución, por familias leídas del código); la carga perezosa; el
  nivel de lo que cualquier guía da por sabido; los cálculos de la tabla de
  arriba; las cinco pestañas con sus filtros en los diez idiomas a 320 y a
  390 px (500 vistas); cada ficha del catálogo contra el dato; la noche sin
  Luna contra sus tramos; la luz roja, la carta y el cambio de idioma con el
  panel abierto; y el panel abierto **con el servidor apagado**.
- **`auditar_sw.js` · 9c**: los tres ficheros entran en el precache al
  instalar, salen del caché sin red, y el módulo y el catálogo van red
  primero.
- **`barrido_pantallas.js`**: las cinco pestañas, con el detalle de cada
  objeto abierto.
- `auditar.sh` compila también `modulos/cielo.js`.
- El tour pasa a 18 pasos: el del 🔭, detrás del de las fiestas
  (`auditar_tour.js` lo recorre en los diez idiomas y cuatro móviles).

Cada control nuevo se vio fallar antes de darlo por bueno:

| Avería | Lo que cantó |
|---|---|
| `datos/cielo.json` fuera del precache | `auditar_sw.js` 3 MAL; `auditar_cielo.js`: el caché no lo tiene y, con el servidor apagado, «Failed to fetch» |
| `modulos/cielo.js` sin red primero | `auditar_sw.js`: la versión nueva no llega |
| Las Gemínidas con la longitud solar 1° desplazada | el máximo sale el 15 a las 13:25; y `--comprobar`: el catálogo no es el que sale de las fuentes |
| Una fila borrada (`cieloLuna`) | la cuenta del fuente y la del navegador, a 320 y a 390 px |
| Un `{n}` suelto en una fila polaca | la fila, y «texto roto: {n}» en las vistas en polaco |
| La variabilidad otra vez en `v` | «ningún registro trae un campo v», y las 51 fichas: «dice que varía y en el catálogo no varía» |
| El total sin Luna contado por muestras | las cuatro noches de prueba, cinco minutos de más |

**Montado en `main` el 17 de octubre por Claude Code**, como pedía Jerome:

- Las dos copias del cambio, con su huella: el parche
  (`53d0d1373de6…0e44`) y el bundle (`fb3cf081527e…7d42`). El bundle trae el
  commit original, `e93f3c9`; su diff y el del parche aplicado son el mismo,
  byte a byte.
- Aplicado sobre `main` en `0398d65` (un commit del robot de AEMET por
  delante de `9ebc3e5`), limpio: queda como `7f90ab3`.
- Antes de ejecutar nada: sin cambios en la CSP; el módulo se carga del propio
  origen; lo único que pide fuera es la nubosidad a Open-Meteo, con las
  coordenadas fijas de Izaña y no las de nadie; los enlaces, por
  `bindExternalLink()`. `vendor/astronomy.browser.min.js` y su licencia,
  idénticos byte a byte a los de cosinekitty/astronomy en `865d3da7`.
- Con `tools/requisitos.txt` instalado, `auditar.sh` entero sobre `7f90ab3`:
  **AUDITORIA EN VERDE**, ahora también con `auditar_ubicacion.py`,
  `auditar_en_el_mar.py` e `informe_lugares.js`, que en la otra sesión no se
  pudieron ejecutar. `auditar_cielo.js`, 49 controles en verde; el tour, 18
  pasos en los diez idiomas y cuatro móviles.
- GitHub Pages publicó `7f90ab3` sin errores. Desde este contenedor no se
  llega a la web publicada; el panel se miró con los mismos ficheros en
  local: las cinco pestañas en los diez idiomas, sin un error.

## «Apunta al cielo», la carta nueva y la ficha de cada astro (20 de octubre)

Jerome, con el panel ya montado: «mira las app disponibles para tener
información estelares como Stellarium y mucho más. Son mucho más detalladas.
Busca un poco en todas las app disponibles las funciones útiles y modos más
creativos y reales. Como ejemplo ahora estoy en mi terraza, veo una estrella,
abro la app, cámara y me dice cuál es, con toda su información y hechos
interesantes. También el mapa es horrible pero horrible. Algo guapo que deja
soñar como las estrellas».

### Lo que hacen las otras, y lo que entra

Se miraron las fichas de Stellarium Mobile, Star Walk 2, Sky Guide, SkyView,
SkySafari y Night Sky. Lo que todas tienen y la gente usa: la vista que sigue
al móvil (sensores), la cámara detrás como realidad aumentada, la búsqueda con
una flecha que lleva hasta el astro, el cielo pintado con atmósfera y Vía
Láctea, el tiempo que corre, la ficha con datos y una explicación, y la luz
roja. Lo que no entra, y por qué: satélites y la Estación (órbitas que cambian
cada semana: el panel sigue llevando a la aplicación de la NASA), el cielo de
otros planetas, los paquetes de pago (más estrellas, más objetos, 3D) y la
cuenta de usuario. Tenerife Go es gratis y sin cuenta, y el PDF de partida
pedía lo que se ve desde Tenerife.

### Lo que entra, y de dónde sale cada cosa

- **La carta, pintada como se ve.** Proyección estereográfica (la de
  Stellarium) centrada en donde se mira; el color del cielo según la altura
  del Sol y con el crepúsculo encendido hacia donde se puso; la Vía Láctea de
  d3-celestial como niebla, más densa y cálida hacia Sagitario; cada estrella
  con el color de su temperatura (B−V → kelvin, Ballesteros 2012; kelvin →
  color, cuerpo negro por las funciones de la CIE 1931 en la aproximación de
  Wyman, Sloan y Shirley 2013, matriz sRGB), con halo, centelleo y apagándose
  hacia el horizonte con la extinción de las cumbres canarias (0,113 mag por
  masa de aire, mediana de 2.850 noches: Guerrero et al. 1998; masa de aire de
  Kasten y Young 1989); la Luna con su fase bien girada —el lado iluminado
  hacia el Sol, su norte hacia el polo de la eclíptica— y sus mares (centro y
  diámetro del Gazetteer of Planetary Nomenclature de la UAI/USGS, consultado
  el 18 de octubre; Mare Frigoris no, porque es una franja y como mancha
  redonda sería falsa); el suelo con bruma y los puntos cardinales. Se
  arrastra, se pellizca, corre con ▶ (20 minutos de cielo por segundo) y
  «todo el cielo» es el planisferio de antes. El centelleo se para si el
  móvil pide menos movimiento (`prefers-reduced-motion`).
- **«Apunta al cielo».** La carta a pantalla completa, orientada con la API
  DeviceOrientation (W3C): en Android `deviceorientationabsolute`, en iOS
  `deviceorientation` más `webkitCompassHeading`, con el permiso pedido en el
  mismo toque del botón, como exige iOS. El círculo del centro nombra lo que
  hay (lo más brillante a menos de 4°; si no hay nada, la constelación), y
  tocando el nombre o cualquier astro sale su ficha en una hoja. 🔍 busca
  cualquier cosa del catálogo y una flecha en el borde dice a cuántos grados
  queda; al centrarlo, el móvil vibra. 📷 pone la imagen de la cámara de
  atrás debajo (proyección gnomónica, la de un objetivo, partiendo de los
  26 mm equivalentes de la cámara principal de casi todos los móviles y
  ajustable con dos dedos, que se recuerda). Sin sensores (un ordenador, o
  sin permiso) funciona a mano y lo dice. La pantalla no se apaga (Wake
  Lock), el botón «atrás» del móvil cierra la vista y no la app, y con la
  app en segundo plano la cámara se apaga.
- **La brújula marca el norte magnético.** Apple lo documenta así para
  `webkitCompassHeading` («relative to magnetic north») y Chrome en Android
  da lo mismo. En Izaña la diferencia son unos 3,6° al oeste: la distancia
  entre dos estrellas, así que sin corregirla la app nombraría la de al lado.
  Se corrige con el World Magnetic Model 2025 (NOAA y BGS, dominio público):
  `tools/cielo_wmm.js` implementa el cálculo del informe técnico del WMM
  (geodésica a geocéntrica, Legendre seminormalizadas de Schmidt hasta grado
  12, armónicos esféricos), se comprueba contra la tabla de valores de prueba
  que publica la NOAA (12 filas, a 0,01° y 0,1 nT; y contra las 100 de
  pygeomag, a 0,005°) y escribe en `datos/cielo.json` la declinación en Izaña
  el 1 de enero de cada año de 2025 a 2030 (−3,87° a −3,08°), que el panel
  interpola. Los coeficientes, `WMM_2025.COF`, los baja `cielo_fuentes.sh` con
  commit fijado (de pygeomag, MIT, que los copia tal cual de la NOAA). Un móvil
  sin calibrar o con hierros cerca se arregla arrastrando el cielo hasta que
  cuadre, y el ajuste se recuerda. El IGN tiene la tabla del observatorio de
  Güímar, pero termina en 1992 (TEN-TABLA1A.pdf) y su mapa de declinaciones
  de 2020 no cubre Canarias: no sirven.
- **La ficha.** Dónde está ahora, cuándo sale, culmina y se pone esta noche
  (o «nunca se pone desde Tenerife»), y lo que se sabe de él, calculado de
  datos con fuente: la distancia en años luz y el año en que salió la luz
  que se ve (HYG), la clase de luminosidad y el color del tipo espectral
  (sistema MK; la tabla de colores de Harvard), la temperatura del color
  (Ballesteros 2012, redondeada a la centena y dicha como «unos»), cuánto
  brilla en soles (la luminosidad visual de HYG, dos cifras), si es la más
  brillante de su constelación y cuánto varía; para la Luna la fase, su edad
  desde la última luna nueva, la distancia y lo que tarda su luz; para los
  planetas la distancia, lo que tarda la luz, la elongación y la fase de
  Mercurio y Venus, la inclinación de los anillos de Saturno y **las cuatro
  lunas de Júpiter como se ven ahora con prismáticos** (Astronomy Engine,
  teoría L1.2 de Lieske, con el tiempo que tarda la luz), dibujadas y con las
  que quedan detrás del planeta dichas aparte. Las 2.683 estrellas de la carta
  llevan ahora su distancia, su designación de Bayer o Flamsteed y su tipo
  espectral, y 274 su nombre de la UAI: tocar una estrella sin nombre
  corriente («7 Cet») da también su ficha.
- **Wikipedia, en el idioma del lector.** Al abrir la ficha se pide el
  resumen (API REST, `page/summary`) partiendo del artículo en inglés —la
  designación en latín («Alpha Orionis») lleva siempre a la estrella, el
  nombre a secas a veces a otra cosa; «Messier 42», «NGC 7000», los nombres
  de OpenNGC— y comprobando que sea de astronomía (su descripción corta); de
  ahí, por los enlaces entre idiomas (`prop=langlinks`), al del idioma de
  quien lee; si Wikipedia dice que no lo hay, la ficha lo dice en ese idioma
  y no enseña nada en inglés (desde la noche del 21, por Jerome; abajo), y
  si falla la red no dice nada. Texto plano
  (`textContent`), cada URL validada con `isSafeWikiUrl`, la foto por
  `img-src https:`, la licencia CC BY-SA 4.0 al pie, y lo leído se guarda 30
  días en el móvil (`tgo_cielo_wiki_v1`, hasta 80 resúmenes): en el Teide,
  sin cobertura, lo ya visto sigue saliendo. Nada del catálogo depende de
  ello: sin red, la ficha sale entera menos ese bloque.
- **Privacidad.** `Permissions-Policy` pasa `camera`, `accelerometer`,
  `gyroscope` y `magnetometer` de `()` a `(self)` (el micrófono sigue en
  `()`); la política, en los diez idiomas, dice en «Qué datos se tratan» que
  la orientación del móvil y la cámara se usan solo en «Apunta al cielo», en
  el dispositivo, sin guardar ni enviar nada, que Wikipedia recibe el título
  del astro, y que la luz roja, el ajuste de la brújula y los resúmenes se
  quedan en el móvil. Para Google Play: la app pide permiso de cámara y de
  sensores de movimiento cuando se usa esa función; en «Seguridad de los
  datos» no hay nada nuevo que declarar, porque nada sale del dispositivo.

### Lo que se midió

- `modulos/cielo.js` pasa de 106 a 151 kB comprimidos (79 filas de texto
  más en diez idiomas, 329 en `CIELO_UI`) y `datos/cielo.json` de 61 a 86 kB
  (los tres campos nuevos de cada estrella de la carta). Los dos se piden al
  abrir el panel, no al arrancar; lo que suma `index.html` siguen siendo
  9 kB. Descarga: 1.017 kB en castellano, 1.130 en búlgaro.
- La vista con sensores pinta a 60 cuadros, a 30 con la cámara; el color del
  cielo y la Vía Láctea se calculan en baja resolución y se escalan, y las
  estrellas son 27 «manchas» pintadas una vez (una por color).

### Los controles

- **`auditar_cielo.js`, parte 9** (85 controles en total con las fuentes bajadas, 81 sin ellas; eran 51 y 49): la
  declinación del catálogo es WMM-2025 de 2025 a 2030 y el panel la
  interpola; `cielo_wmm.js` da la tabla de la NOAA; cada estrella de la carta
  trae sus ocho campos y 274 nombres de la UAI; **la ficha dice lo que dan el
  catálogo y el motor**, calculado aquí aparte (la temperatura con la misma
  fórmula, la luminosidad y la distancia con dos cifras, la distancia de la
  Luna y de Júpiter con el motor, las cuatro lunas con su geometría), para
  Betelgeuse, Sirio, la Luna, el Sol, Júpiter, M42, Orión y 7 Cet, y las seis
  fichas en los diez idiomas con los mismos datos; Wikipedia con una
  respuesta falsa: el resumen en alemán por los enlaces entre idiomas, un
  `<script>` en el texto que sale como texto, una foto con URL `javascript:`
  rechazada, el francés sin artículo que lo dice en francés (antes caía al
  inglés), el italiano sin red que no dice nada, una
  desambiguación y un homónimo que no es de astronomía que no salen, y que
  solo se pidió el resumen y los enlaces; **los sensores simulados** con los
  eventos de la API apuntando al planeta más brillante que esté arriba (el
  rumbo magnético, con la declinación): el círculo lo nombra, 60° a un lado
  ya no, buscado en 🔍 la flecha dice a cuántos grados queda (contra la
  separación angular calculada aquí, ±3°) y al volver «¡Ahí está!»; la
  cámara falsa de Chromium arranca detrás, se sigue pintando encima y se
  apaga; la hoja con la ficha; pasar a mano; cerrar. Y el camino de iOS:
  con `deviceorientation` relativo y `webkitCompassHeading`, la diferencia se
  toma con el móvil inclinado hacia delante y lleva al rumbo de la brújula.
  En lo fijo: `Permissions-Policy`, la cámara sin audio, la política de
  privacidad, lo que se pide fuera contra la CSP, `origin=*`, `seguraWiki()`
  y ningún `innerHTML`.
- **`barrido_pantallas.js`**: cuatro estados más en los diez idiomas: la
  ficha de una estrella, de la Luna y de un objeto en la carta, y «Apunta al
  cielo» con los sensores simulados, la búsqueda y la hoja.
- `auditar_web.js` coteja las 1.505 filas; `auditar_readme.js`, las cifras
  del README; `generar_privacidad.py --comprobar`, la política.

Averías con las que se vieron fallar antes de darlos por buenos: el
`[hidden]` que `display: flex` pisaba (la hora, la hoja y la búsqueda salían
siempre: lo cantó la captura, y ahora `#cielo-vista [hidden]` manda); la
prueba de los sensores con `beta` 50 en vez de 130 (la cámara mira al suelo:
«bajo el horizonte»); «Betelgeuse es la más brillante de Orión» (es Rigel, y
el control lo dice ahora al revés); el aviso y el objetivo pisándose arriba;
y los botones de rumbo de la carta que se quedaban en «S» al arrastrar.

`auditar.sh` entero sobre el árbol del commit, el 21 de octubre: **AUDITORIA
EN VERDE**, cero bloques en rojo; los tres de `pmtiles` (`auditar_ubicacion`,
`auditar_en_el_mar`, `informe_lugares`) no se pudieron ejecutar en esta
sesión, como el 17, y no tocan nada de esto. `auditar_cielo.js`, 85 en verde;
`barrido_pantallas.js`, 93 pantallas y fichas en los diez idiomas con 0
textos sin traducir y 0 errores; el tour, 18 pasos. Queda por hacer lo que
ningún control puede: probarlo en un móvil de verdad, con sus sensores y su
cámara (los pasos, en la nota para Claude Code).

## Lo que piden las reseñas de las apps del cielo, y un error del día 20 (21 de octubre)

Jerome, con el informe de las dos tiendas delante
(`APPS-DEL-CIELO-COMPETENCIA.md`: 26 apps, las quejas de cada una, lo que la
gente pide): «Revisa los bloques que me enviaste. Ajústalos con las nuevas
informaciones que tenemos. Sin errores. Tú mismo viste las quejas. Pasaremos
primero y gratis».

### El error del día 20: la Luna llena dejaba el cielo a oscuras

Al repasar la carta antes de tocar nada: la claridad que la Luna mete en el
cielo (`lunaLuz`, que aclara el fondo, apaga la Vía Láctea y deja ver menos
estrellas) se calculaba como `(1 − cos fase) / 2`, y el ángulo de fase del
motor vale **0° con Luna llena** y 180° con nueva (comprobado con el motor:
el 26 de octubre, llena, 4,6°; el 9 de noviembre, nueva, 175°). Así que la
carta aclaraba el cielo con Luna nueva y lo dejaba negro con Luna llena, al
revés. Las capturas del día 20 no lo cantaron porque esa noche la Luna
estaba al 70 %: a medio camino, la cifra era parecida en los dos sentidos.
Corregido a `(1 + cos fase) / 2`, y desde hoy un control pinta la misma
vista con Luna llena alta y con Luna nueva y exige que la primera salga más
clara (media del lienzo 35,6 frente a 24,2). El dibujo de la fase de la Luna
(`pintarLuna`) ya iba bien: usa el mismo ángulo con la convención correcta.

De paso: «esta noche» cambiaba a la noche siguiente a mediodía, así que
quien abría el panel en el desayuno veía la noche pasada. Ahora cambia a las
7 de la mañana (el Sol sale en Izaña entre las 7:01 y las 8:12 todo el año,
calculado con el motor).

### Lo que entra, ordenado por lo que más castigan las reseñas

- **La brújula (queja número uno de todas, y ninguna la resuelve de cara a
  quien mira).** La primera vez que se abre «Apunta al cielo» sale una guía
  de 20 segundos: lejos de imanes y metal (la funda con imán, el coche, una
  barandilla), el ocho en el aire (dos o tres veces: lo que pide Google Maps
  en Android al calibrar la brújula; el magnetómetro gira por todos los
  ejes), y comprobar con un astro; y
  dice que la brújula marca el norte magnético, con la declinación de hoy
  calculada (3,7° al oeste hoy), que Tenerife Go ya corrige. «Entendido» la
  guarda vista (`tgo_cielo_guia`). El chip **«🎯 Comprobar la brújula»**
  elige la referencia (el Sol si está a más de 8° —con el aviso de no
  mirarlo—, la Luna si se ve, el planeta más brillante a más de 10°, o la
  estrella más brillante a más de 15°), la señala con la flecha y pide
  ponerla en el círculo y tocar «Ya»: entonces mide la diferencia en acimut
  entre donde la brújula dice que se apunta y donde está el astro de verdad,
  la suma al ajuste (el mismo que se arrastra a mano, guardado en el móvil)
  y lo dice («Brújula corregida: iba 10° desviada»; «iba bien: solo 1° de
  desvío»; a más de 25° del círculo, «acércalo más»; si la altura difiere
  más de 6°, el móvil no está nivelado y lo dice). El chip de los sensores
  lleva ✓ cuando se ha comprobado y, en iOS, la precisión que da el sistema
  (`webkitCompassAccuracy`, «±15°»; Android no la da, por eso la
  comprobación). Star Walk 2 no deja recalibrar; Sky Map «dejó de poder
  calibrarse»; SkyView «apuntaba en la dirección contraria»: aquí un toque.
- **Los avisos (lo que la gente no consigue apagar en Star Walk).** Ninguno
  por defecto. En cada evento del calendario, **«📅 Añadir a mi calendario»**
  crea un `.ics` (RFC 5545: líneas de 75 octetos plegadas con CRLF y espacio,
  comas y puntos y coma escapados, fechas en UTC, `GEO` de Izaña, `VALARM`
  un día antes con el título) y lo pasa a la hoja de compartir del sistema o
  lo descarga: ese sí avisa, desde el calendario del móvil. **«🔔
  Recordármelo en la app»** lo apunta en `localStorage` (`tgo_cielo_avisos_v1`,
  solo el identificador y la hora) y los dos días de antes sale arriba del
  todo en «Esta noche» con «¡Esta noche!» o «¡Mañana!»; «Mis avisos» en el
  calendario los lista con «Quitar» y **«Quitar todos los avisos»**, que
  los quita de verdad. Y se dice por qué nada despierta a nadie: una web sin
  servidor no puede notificar sola, y Tenerife Go no tiene ninguno ni quiere
  datos.
- **El índice de la noche, con la fórmula a la vista** (Sky Tonight lo
  esconde y se lo reprochan). 10 puntos por una noche cerrada entera sin
  Luna; se descuenta la parte de la noche cerrada con la Luna arriba en
  proporción a lo iluminada que esté (`min(1, 0,2 + iluminación)`: una Luna
  al 20 % apenas molesta, una llena lo apaga todo), y la media prevista de
  nubes medias y altas (Open-Meteo, la de la tarjeta de nubes) lo baja en esa
  proporción; sin previsión no se cuentan y se dice. De 9 a 10 «excelente»,
  7-8 «buena», 5-6 «regular», 3-4 «floja», 0-2 «mala». El 13 de diciembre
  de 2026 (Gemínidas, Luna al 21 % un rato) sale 9; el 24 (llena) 0; el 9 de
  noviembre (nueva) 10. **«📤 Compartir»** genera una imagen de 1080 × 1350
  con la carta de esa noche (la misma, mirando al sur a media noche
  cerrada), el índice, las tres líneas, «qué mirar» (el planeta más
  brillante, dos objetos a simple vista, la Vía Láctea si se ve) y el pie de
  Tenerife Go, y la pasa a la hoja de compartir o la descarga. Nada pasa por
  ningún servidor.
- **La fecha libre** (la pide todo el mundo en todas): 📅 junto a ‹ ›, en
  «Esta noche» y en la carta, abre el selector de fecha del sistema
  (`showPicker`; donde no lo haya, el campo queda a la vista). Cambiarla
  deja la carta al empezar la noche cerrada de ese día.
- **El recorrido del astro** (lo piden a Stellarium; lo tienen Sky Tonight y
  SkyView): en la ficha, «🛤️ Ver su recorrido esta noche» pinta en la carta
  —y en la vista— su camino de mediodía a mediodía, cada 10 minutos, con un
  punto y la hora en cada hora en punto, hasta 3,5° bajo el horizonte.
- **Capturar y compartir** (SkyView, Star Tracker, Sky Tonight): 📸 en la
  carta y en la vista compone lo pintado (con la imagen de la cámara debajo
  si está puesta) y un pie con lo que se mira, la fecha y la hora, y de
  dónde sale; a la hoja de compartir o descarga.
- **Las horas para fotos** (PhotoPills): hora dorada de la tarde y de la
  mañana (centro del Sol entre 6° sobre el horizonte y 4° por debajo) y hora
  azul (entre 4° y 6° por debajo), las definiciones de PhotoPills
  (photopills.com/glossary), en alturas geométricas como los crepúsculos;
  y la ventana de la Vía Láctea.
- **Las fases del mes**: el filtro «🌙 Fases de la Luna» del calendario,
  con las cuatro de cada mes a su hora de Canarias (van en su filtro: cuatro
  al mes taparían lo demás en «Todo»).
- **Los retrógrados** (Sky Tonight los añadió en julio de 2026): «Mercurio
  empieza a retrogradar» y «vuelve a ir hacia delante», para Mercurio, Venus,
  Marte, Júpiter y Saturno, por el cambio de signo de la velocidad en
  longitud eclíptica geocéntrica (muestras diarias, bisección al minuto, con
  160 días de margen para que cada principio sepa su final), con la
  constelación y la explicación: es perspectiva, un planeta adelanta al otro.
  Los 14 puntos estacionarios hasta octubre de 2027 coinciden a ±1,5 días
  con las dos tablas publicadas que se encontraron (cafeastrology.com y
  farmersalmanac.com, que coinciden entre sí).

Lo que **no** entra, porque es lo que las reseñas castigan: suscripción,
anuncios, cuenta, rastreo, avisos por defecto, descargas de cientos de
megas, dibujos que tapan las estrellas, luz roja escondida, «IA» de pago.

### Lo que se midió

- `modulos/cielo.js` pasa de 151 a 182 kB comprimidos (67 filas de texto más
  en diez idiomas, 396 en `CIELO_UI`, más el código y, desde hoy, las notas
  de fuentes de cada fila dentro del módulo); se sigue pidiendo al abrir el
  panel. `index.html`: 34.700 líneas, 731 kB con gzip (eran 726). Descarga:
  1.019 kB en castellano (1.017), 1.133 en búlgaro (1.130): los estilos
  nuevos. (Medido en su rama, sobre el `main` del 18. Junto con el `main`
  del 21: 35.100 líneas y 742 kB con gzip; descarga 1.034 y 1.148 kB.)
- La política de privacidad, en los diez idiomas: los avisos y la guía se
  quedan en el móvil; los `.ics` y las imágenes se crean en el móvil y van
  al calendario o a la hoja de compartir; la cámara solo entra en una
  captura si se toca 📸.

### Los controles

- **`auditar_cielo.js`, parte 10** (116 controles en total con las fuentes
  bajadas; eran 85; 118 desde el cambio de Wikipedia de esa noche): los 14 retrógrados contra las dos tablas; las fases, las
  mismas que da `SearchMoonQuarter` aparte y la llena del 31-12-2028 a menos
  de 2 h del máximo del eclipse del IMCCE (16:48 frente a 16:52); las horas
  dorada y azul, con el centro del Sol calculado aparte a 6°, −4° y −6°
  (±0,05°) en invierno y en verano; el índice recalculado aparte en tres
  noches (creciente fina, llena y nueva) y su tarjeta; los dos `.ics`
  (Gemínidas, eclipse de 2027) parseados: CRLF, 75 octetos, `DTSTART` y
  `DTEND` en UTC donde toca, `VALARM`, escapes, `UID`; un aviso puesto, el
  botón que pasa a «Quitar», `localStorage`, «Mis avisos», la víspera arriba
  del todo con el reloj de la página puesto en el 12 de diciembre
  (`page.clock`), y «Quitar todos» que vacía; la fecha libre (y una fecha
  mal escrita que no cambia nada); el recorrido de Júpiter y de Betelgeuse,
  cada punto a menos de 0,02° del motor aparte, y pintado (píxeles dorados
  de más) y quitado; las capturas como PNG de verdad (la firma del fichero)
  y la descarga con su nombre cuando no hay hoja de compartir, la imagen
  del índice de 1080 × 1350; la guía (tres pasos, «Entendido», no vuelve a
  salir); el chip «Comprobar la brújula»; **la comprobación con los
  sensores simulados 10° desviados**: a 40° «Ya» no corrige y lo dice, con
  la referencia en el círculo mide −10,0°, corrige el ajuste, lo guarda, lo
  dice, el chip queda con ✓ y el círculo ya nombra al astro; la captura con
  la cámara falsa debajo; la precisión de iOS en el chip; y la Luna llena
  que aclara el cielo. En lo fijo: la privacidad en los diez idiomas, la
  fórmula de `lunaLuz`, el corte de las 7, y las búsquedas del Sol a 6° y −4°.
- **`barrido_pantallas.js`**: cuatro estados más en los diez idiomas: la guía,
  la comprobación de la brújula, las fases y los avisos (la tarjeta «Mis
  avisos» y los botones de cada evento). En total, 97 pantallas y fichas en los diez idiomas, 0 textos sin traducir y 0 errores de página.
- `auditar_idioma.js` en los nueve idiomas, 0 hallazgos; `auditar_web.js`
  coteja las 1.572 filas; `generar_privacidad.py --comprobar`, la política;
  `auditar_readme.js`, las cifras del README.

Averías con las que se vieron fallar los controles antes de darlos por
buenos: la prueba del recorrido leía un lienzo que `TG_CIELO.ver('mapa')`
había sustituido (siempre 137 píxeles: ahora lee el vivo); las horas para
fotos se cotejaban con la altura refractada (6,14° en vez de 6°: el motor
busca la geométrica, como los crepúsculos, y así se dice); la víspera de
un aviso no se puede ver sin mover el reloj de la página; y
`castellano_suelto.js` tomó «ics» por castellano dentro del chino y del
búlgaro: es el formato del fichero, y va con `pdf` y `gpx` en su lista de
unidades y formatos.

`auditar.sh` entero sobre el árbol del commit, el 21 de octubre, dos veces
(la segunda tras la última corrección): **cero bloques en rojo**. La línea
«AUDITORIA EN VERDE» no la imprime porque los tres controles de `pmtiles`
(`auditar_ubicacion`, `auditar_en_el_mar`, `informe_lugares`) no se pudieron
ejecutar en esta sesión, como el 17 y el 20 (falta el módulo de Python; no
tocan nada de esto): Claude Code tiene que verlos pasar con
`pip install -r tools/requisitos.txt`. Queda lo que ningún control puede: el
móvil de verdad (la brújula comprobada con la Luna, el `.ics` abriendo el
calendario, la hoja de compartir de la captura); los pasos, en la nota para
Claude Code.

## La Estación Espacial y los satélites brillantes, calculados en el móvil (21 de octubre, por la tarde)

Jerome: «Sigue». El bloque siguiente de la lista que salió del informe de
las tiendas: «¿cuándo pasa la Estación?» es la pregunta más repetida de
cualquier noche, y hasta hoy el panel la despachaba mandando a la aplicación
de la NASA (cuyas reseñas son las de siempre: no abre, los avisos no llegan,
pide cuenta). Ahora se calcula aquí, en el móvil, sin cuenta y sin red una
vez abierto.

### Lo que entra

- **Los pasos visibles desde el Teide** de la Estación Espacial
  Internacional, de la estación china Tiangong y del telescopio Hubble en
  las próximas siete noches: una tarjeta en «Esta noche», el filtro «🛰️
  Satélites» del calendario (agrupado por noche), «Ver en el mapa del
  cielo» (la carta en el máximo del paso, con el satélite pintado, su estela
  de un minuto y su nombre; apagado si está en la sombra de la Tierra),
  «Apunta al cielo» (lo nombra en el círculo y lo encuentra la búsqueda,
  por «Hubble» o por «ISS»), la ficha (a qué altura vuela y a qué
  velocidad, a cuántos kilómetros está ahora, si está en la sombra, cómo
  brilla, el próximo paso visible, la fecha de los elementos y Wikipedia),
  «Añadir a mi calendario» con la alarma **media hora antes** (un paso dura
  minutos; la víspera no sirve) y «Recordármelo en la app».
- **Qué es un paso visible**: la regla de las tablas de pasos de siempre.
  El satélite a más de 10° sobre el horizonte, iluminado por el Sol (fuera
  de la umbra de la Tierra, con el modelo de umbra y penumbra del motor) y
  el cielo ya oscuro (Sol a más de 6° bajo el horizonte): la noche va de
  Sol −6° por la tarde a Sol −6° por la mañana. De cada paso: cuándo y por
  dónde **aparece** (a 10°), o **sale de la sombra de la Tierra**, o **ya
  está arriba al oscurecer**; **lo más alto** que sube, con su rumbo;
  cuándo **se pierde** (a 10°), o **entra en la sombra**, o **se pierde en
  el amanecer**; cuánto dura. Todo a un segundo: barrido cada 20 s y
  bisección en los extremos. Lo que se dice del brillo es con palabras y
  con fuente («el tercer objeto más brillante del cielo», que es como la
  NASA describe la Estación en Spot the Station; Tiangong como las
  estrellas más brillantes; el Hubble como una estrella corriente, y desde
  Tenerife puede pasar casi por el cenit: su órbita está inclinada 28,47°
  y el Teide a 28,30° de latitud).
- **Los elementos orbitales** (`datos/satelites.json`): las dos líneas
  (TLE) de cada uno con su época, de CelesTrak (el servicio público de
  T. S. Kelso con el catálogo de la Fuerza Espacial de EE. UU.). Cambian
  cada día por el rozamiento con la atmósfera, así que los renueva un robot
  (`.github/workflows/satelites.yml`, `tools/satelites_traer.py`) dos veces
  al día, tres peticiones por pasada (CelesTrak pide no abusar). Comprueba
  cada línea —69 caracteres, el número de catálogo que toca, la suma de
  control módulo 10— y, si algo no cuadra o la descarga falla, **no escribe
  nada**: el fichero se queda con sus últimos elementos buenos; nunca
  sustituye un elemento por otro de época anterior; y con los mismos
  elementos no reescribe el fichero (el robot no deja commits vacíos). El
  panel no enseña pasos con elementos de más de **7 días** (hacia atrás o
  hacia delante de la época) y lo dice en la tarjeta, en el calendario y en
  la ficha. El móvil lee el fichero de su propio dominio: CelesTrak no
  manda cabeceras CORS para una web cualquiera y, aunque las mandara, no es
  cosa de pedirle los elementos desde cada móvil. **Nada sale del móvil**,
  así que la política de privacidad no cambia. El service worker precachea
  el motor y los elementos, y los elementos los pide primero a la red para
  tenerlos frescos.
- **El motor**: SGP4/SDP4 de satellite.js 7.1.0 (MIT), con las
  transformaciones TEME → ECF → acimut y altura, el Sol y la sombra de la
  Tierra. El repositorio de satellite.js no trae ninguna versión compilada
  y npm no llega a todas las máquinas donde se audita esto, así que
  `tools/satelites_construir.js` lo compila desde el TypeScript del commit
  fijado en `tools/satelites_fuentes.sh` (sin la parte WASM, que el panel
  no usa) y lo junta en un fichero sin dependencias, `vendor/satellite.js`
  (124 kB, 30 comprimidos), que se pide al abrir el panel. Se cotejó con
  los **33 casos de verificación oficiales** de SGP4 (SGP4-VER.TLE y
  tcppver.out, los de Vallado, Crawford, Hujsak y Kelso, AIAA 2006-6753,
  tal como los distribuye python-sgp4, commit fijado): 667 instantes,
  desviación máxima 1,15e-7 km (constantes WGS72 y modo «i», como los
  vectores). Un extracto (tres instantes de cada caso) va en
  `tools/sgp4_verificacion.json` para que cualquier máquina compruebe el
  motor sin bajar nada.
- **Esta semana, desde el Teide** (elementos del 20 de octubre; es lo que
  sale en la app con el reloj puesto en el 21 a las 19:00): 10 pasos en 6
  noches, 5 de Tiangong (el jueves 22 a las 20:14, hasta 84°, casi por el
  cenit) y 5 del Hubble; **ninguno de la Estación Espacial**, y está bien
  que no salga: recalculado aparte, sus pasos de estos días por encima de
  10° caen entre la 1 y las 4 de la madrugada con la Estación dentro de la
  sombra de la Tierra, o de día (entre las 9 y las 12). La séptima noche
  (la del 27) no sale porque los elementos tendrían más de 7 días, y el
  calendario lo dice; con el robot en marcha, los elementos son del día.
- Starlink no está: son trenes de días que luego se dispersan, y dan más
  quejas que alegrías. La nota del calendario sobre satélites se reescribe
  (la app de la NASA queda para contrastar, no como única fuente).
- 30 filas de texto nuevas en los diez idiomas (`CIELO_UI` pasa a 426). El
  rumbo lleva ya su preposición en cada idioma («hacia el oeste», «in the
  west», «im Westen»...), así que las frases de los pasos van «…a las
  21:11, {rumbo}».

### Lo que se midió

- `modulos/cielo.js` pasa de 182 a 196 kB comprimidos (30 filas de texto y
  el código de los pasos); `vendor/satellite.js` son 30 kB comprimidos más
  y `datos/satelites.json`, 0,7; los tres se piden al abrir el panel. La
  primera descarga no cambia: 1.019 kB en castellano, 1.133 en búlgaro
  (`peso_descarga.py`).
- Calcular los pasos de las siete noches (tres satélites, unas 6.000
  posiciones) tarda 65 ms en el Chromium de la auditoría, tras hacer que
  bajo los 9° solo se calcule la altura (eran 440 ms): en un móvil
  corriente, menos de un segundo, una vez por sesión.

### Los controles

- **`auditar_cielo.js`, partes 11a y 11** (148 controles en total con las
  fuentes bajadas; eran 116). Sin navegador: `vendor/satellite.js` dice
  venir del commit fijado, con su licencia, y carga en Node; el motor da
  los 97 vectores del extracto a 1e-6 km y 1e-7 km/s (desviación máxima
  5e-9 km); con las fuentes bajadas (`bash tools/satelites_fuentes.sh`, y
  hace falta `tsc`), el motor, la licencia y el extracto son byte a byte los
  que salen de ellas y los 667 instantes pasan; `datos/satelites.json`
  (los tres objetos, las líneas con su suma de control, la época la de la
  línea 1, no posterior a «obtenido», y el motor los traga); el robot sin
  red, cuatro veces: con las mismas líneas escribe lo mismo que hay, con
  las mismas no reescribe, con una cifra cambiada sale con error y no toca
  el fichero, con elementos de tres días antes avisa y se queda con los que
  había; el flujo (dos crones, a mano, solo `datos/satelites.json`, permiso
  de escritura, sin solaparse), el service worker, y que el módulo lea los
  elementos y el motor de su propio dominio y no llame a CelesTrak. En el
  navegador, con el reloj de la página a las 18:00 UTC del día siguiente a
  la época más nueva (así el control vale el día que se corra, con los
  elementos que haya): los tres cargan; hay pasos; **cada paso cumple la
  regla** (aparece y se pierde a 10° o en la sombra o con el Sol a −6°, el
  máximo es el más alto, al Sol en los tres instantes con la fracción de
  sombra recalculada, el Sol del Teide bajo −6°, en orden, por venir); **la
  lista entera recalculada aparte**, en Node, con otra geometría (GMST y
  Sol de Astronomy Engine, ECEF y acimut/altura a mano, umbra cilíndrica):
  los mismos 10 pasos a ±10 s y ±1,5° en el máximo, todos los de más de un
  minuto de allí están en la app, y acimut y altura en cada máximo a
  0,03°; la tarjeta (tantas filas como pasos esa noche, tres botones cada
  una, de dónde salen los elementos y cómo se calcula); el calendario (los
  10 agrupados en 6 noches, y la nota de las noches sin elementos de menos
  de 7 días); «Ver en el mapa» (la pestaña, la selección, la hora del
  máximo y el satélite pintado: píxeles a 255); «Apunta al cielo» con los
  sensores simulados hacia el satélite (lo nombra en el círculo); la
  búsqueda por «Hubble» y por «ISS» (y la flecha); la ficha de cada uno con
  la hora del próximo paso; el `.ics` (`DTSTART` y `DTEND` de la aparición
  a la desaparición, `TRIGGER:-PT30M` y su texto, `SUMMARY`, `UID`) y el
  aviso puesto y quitado; diez días después de la época, sin elementos
  nuevos, la tarjeta, el calendario y la ficha dicen que los pasos solo se
  calculan hasta 7 días y no enseñan ninguno ni posición; y los diez
  idiomas (tarjeta, calendario, fichas y `.ics`) sin texto roto, sin
  palabras repetidas y cada uno en su idioma.
- **`barrido_pantallas.js`**: dos estados más en los diez idiomas, el
  calendario con el filtro «Satélites» y la ficha de la Estación en la
  carta. En total, 99 pantallas y fichas en los diez idiomas, 0 textos sin
  traducir y 0 errores de página.
- `auditar_web.js` coteja las 1.602 filas; `barrido_idiomas.js`, 3.743
  dentro y fuera; `castellano_suelto.js`, `auditar_claves_tx.js`,
  `auditar_sw.js`, `auditar_readme.js`, `auditar_letras.js`,
  `auditar_frases.js`, `auditar_cirilico.py`, `auditar_etiquetas.js`,
  `auditar_fuente_pl.js`, `auditar_datos.js` y `auditar_seguridad.py`, en
  verde.

Averías con las que se vieron fallar los controles antes de darlos por
buenos: la bisección de los extremos (`afinar`) solo afinaba hacia delante,
así que la aparición salía hasta 20 s tarde (20:11:33 por 20:11:21: lo
destapó la lista recalculada aparte); el máximo no miraba el extremo mismo
cuando el paso acaba en la sombra subiendo; el rumbo salía dos veces
(«hacia el hacia el oeste»); un paso que ya está en marcha cuando oscurece
decía «aparece» a 43° (ahora «ya arriba al oscurecer»); «fiables» en
francés, que `castellano_suelto.js` toma por castellano; la alarma del
`.ics` a un día, para un paso de minutos; y el robot reescribía el fichero
con los mismos elementos, un commit vacío cada doce horas.

`auditar.sh` entero sobre el árbol del commit, el 21 de octubre por la
tarde: **cero bloques en rojo**; los tres controles de `pmtiles` siguen sin
poder ejecutarse aquí (falta el módulo de Python; Claude Code tiene que
verlos pasar con `pip install -r tools/requisitos.txt`). Queda lo que ningún
control puede: un paso de verdad, mirado desde el Teide, y la hora que da
Spot the Station o Heavens-Above para el mismo paso; los pasos, en la nota
para Claude Code.

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

## «Vi cosas no traducidas» · lo que se ve en pantalla (7 de octubre)

Jerome lo vio en el móvil y ningún control lo había visto: los de idioma miran
el fuente (tablas, filas, ficheros), y el único que mira la pantalla
(`auditar_sin_traducir.js`) solo abre la página de arranque y solo en búlgaro.
Un barrido nuevo, `tools/barrido_pantallas.js`, abre 75 paneles y fichas en
los diez idiomas y busca castellano que no sea nombre propio. Encontró:

- **200 etiquetas de ficha en castellano en los nueve idiomas**: «Permiso»,
  «Teleférico», «Familia», «Lujo», «Gratuito», «Acantilados», «18 Hoyos»…
  `auditar_etiquetas.js` las daba por **nombres de sitio** porque alguna ficha
  las lleva detrás del punto volado en su categoría («Golf · Lujo»). Es el
  mismo agujero que ya dejó pasar «Norte» y «Sur», con cien palabras más. Se
  arregló con datos que ya estaban en la app: la categoría de cada ficha ya
  traía esas palabras traducidas en los nueve idiomas, así que **106 se
  traducen igual que su categoría** (con nueve correcciones a mano donde el
  emparejamiento salía mal, como «Intermedio» → neerlandés «Gevorderd», que es
  avanzado) y **94 nombres propios** (pueblos, marcas, personas, códigos) se
  declaran con su motivo. El control ya no tiene la vía «nombre de sitio»: se
  traduce o se declara.
- **«Süd», en alemán, en los botones de los aeropuertos** del panel de guaguas
  en italiano, neerlandés, chino, búlgaro y polaco: el código escribía
  «Sur / South / Sud» y para todo lo demás «Süd», encima de la traducción
  buena que el botón ya traía.
- **«Mostrando»** en la barra del filtro en italiano. Es italiano correcto, pero
  es la palabra castellana y se lee como un hueco: ahora «Visualizzati».

Las 975 fichas, abiertas una a una en los diez idiomas, quedan sin castellano
fuera de nombres propios. Lo que no es un hueco va en
`idiomas/pantalla-aceptado.json` con su motivo (hoy, cuatro romerías en
francés, donde la preposición también es «de»). *(El 10 de octubre se
tradujeron y el fichero se quedó sin ellas: ver «Todo traducido, y otra vez
idioma por idioma».)* Probado metiendo otra vez el
«Süd» y el «Mostrando»: los dos en rojo.

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

## «Empieza a ponerse más lenta» · el mapa fabricaba 975 globos cada vez

**9 de octubre.** Jerome: «Mírame si puede hacer que la app se va más rápido
que empieza a ponerse más lenta». Medido otra vez antes de tocar nada: CPU de
móvil (4× más lenta), servidor local, en castellano.

**Lo que pesaba.** Cada vez que el mapa se rehacía —al arrancar, al poner o
quitar una categoría— se fabricaba el HTML del globo de **todos** los lugares
que se ven, los 975 sin filtro, aunque nadie abriera ninguno. Y al arrancar se
rehacía varias veces: la primera, y otra cada vez que llegaba algo por red
—los precios de las gasolineras; en otro idioma, también las etiquetas y los
textos de los lugares—.

**Y lo empeoré yo**, en las sesiones 92 a 94: cada globo de gasolinera creaba
su propio formateador de fecha y de euros (`Intl`), que en un móvil cuesta
milisegundos cada uno; con 211 gasolineras, 830 ms. Y los precios, que llegan
a los 1,5 s de abrir la app, rehacían el mapa entero: un parón justo cuando
uno empieza a tocar.

**Lo que cambia:**

1. **El globo se fabrica al abrirlo** (`htmlGlobo`). El marcador lleva una
   función y Leaflet la llama cada vez que se abre el globo: sale con el
   idioma, los favoritos, las etiquetas y los precios de ese momento, sin
   rehacer el mapa para nada de eso.
2. Los formateadores de la fecha de los precios y del euro se crean una vez
   por idioma, no por gasolinera; los de la fecha y la hora de Canarias, una
   vez.
3. **Nada rehace el mapa si no cambia lo que se ve.** Los precios, solo con el
   filtro «las más baratas» puesto, que es lo único de los marcadores que
   depende de ellos. Las etiquetas, nunca: solo salen en el globo y en la
   ficha. Los textos de los lugares, solo con una búsqueda escrita, porque el
   buscador mira la categoría traducida. Cambiar de idioma sí lo rehace: así
   se cierra el globo que estuviera abierto en el idioma de antes.

**Medido.** Lo que tarda en rehacerse el mapa al tocar categorías, mediana de
tres:

| | antes | ahora |
|---|---|---|
| quitar «playa» (vuelven los 975) | 416 ms | **60 ms** |
| poner «gasolinera» | 240 ms | **42 ms** |
| poner tres categorías | 253 ms | **23 ms** |
| limpiar los filtros | 585 ms | **55 ms** |
| todas las veces que se hace al arrancar | 959 ms | **172 ms** |

El arranque, mediana de cinco cargas:

| | antes | ahora |
|---|---|---|
| JavaScript ejecutándose | 1.621 ms | **924 ms** |
| tareas largas, sumadas | 2.719 ms | **2.058 ms** |
| memoria de JavaScript | 17,0 MB | **11,7 MB** |
| veces que se hace el mapa en 5 s, castellano / búlgaro | 2 / 3 | **1 / 1** |

El `DOMContentLoaded` casi no se mueve (3.234 → 3.056 ms, dentro de lo que
varía de una carga a otra): lo que queda del arranque es **leer** el
fichero, no hacer cosas. La tabla de la sección anterior decía «pintar todos
los marcadores: 1 ms»; `updateMarkers()` vuelve en eso porque solo programa
el trabajo para 60 ms después. Con el trabajo dentro, eran los 416-585 ms de
arriba.

**El control**, en `tools/auditar_web.js`. Mete un contador en
`_updateMarkersImpl` en la copia que sirve —no en el fichero—, arranca en
castellano y en búlgaro —que baja etiquetas y textos por red— y cuenta las
veces que se hace el mapa en cinco segundos. Y mira que el globo sea una
función, no un HTML hecho de antemano:

```
=== el mapa no se rehace de mas ===
  OK  arrancando en es el mapa se hace UNA vez   (1 en 5 s, idioma es)
  OK  el globo se fabrica al abrirlo, no al hacer el mapa
  --  rehacerlo con 975 marcadores: 26 ms — se informa, no falla
  OK  arrancando en bg el mapa se hace UNA vez   (1 en 5 s, idioma bg)
  OK  el globo se fabrica al abrirlo, no al hacer el mapa
  --  rehacerlo con 975 marcadores: 20 ms — se informa, no falla
```

Probado devolviendo las averías una a una: los precios que rehacen el mapa
(canta en los dos idiomas), el globo hecho de antemano (canta en los dos), las
etiquetas que lo rehacen (canta en búlgaro) y la función con otro nombre (dice
que no puede contar, en vez de contar cero y dar verde). Contra la versión de
antes: 2 y 3 veces, y los dos globos en rojo.

**Lo que quedaba, medido.** `index.html` son 3,3 MB y 2,9 MB de eso
son JavaScript en línea, que el móvil tiene que leer y compilar para
arrancar. Los datos de TITSA son 1,06 MB de ese JavaScript —`TITSA_LINES`
785 kB, `TITSA_PARADAS` 278 kB— y solo se usan con las guaguas. Dos
experimentos, mediana de cinco:

| primera visita | DOMContentLoaded | la tarea más larga |
|---|---|---|
| como está | 2.718 ms | 965 ms |
| TITSA en un fichero aparte, tal cual, con sus comentarios | **2.370 ms** | **607 ms** |

Y con el navegador abierto, a la cuarta carga: 1.491 → 1.228 ms.

El otro experimento, TITSA como JSON dentro de `index.html`, ganaba algo más
(2.906 → 2.402 ms), pero **se descarta**: `TITSA_LINES` lleva 309 líneas de
comentarios con el origen de cada dato —qué es del GTFS, qué se ancló a mano y
por qué— y el JSON no admite comentarios. `TITSA_PARADAS` no lleva ninguno.

El fichero aparte pedía tocar `index.html`, `sw.js` y las herramientas que
leen la red, así que se le preguntó a Jerome. Dijo que sí, el mismo día: «Si
hazlo cuidado no romper nada». Hecho en la sección siguiente.

## La red de guaguas, en su propio fichero

**9 de octubre.** `TITSA_PARADAS` y `TITSA_LINES` salen de `index.html` a
`datos/titsa.js`, **tal cual**: las 5.954 líneas, comentarios de origen
incluidos, desde el comentario «DATOS DE LÍNEAS» hasta el `];` que cierra las
líneas. La hidratación de las paradas se queda en `index.html`: es código.

**Que no cambió ni un dato.** El trozo de antes —1.069.598 bytes— está entero
al final de `datos/titsa.js`; evaluados, los dos dan exactamente los mismos
objetos (2.514 marquesinas, 183 líneas); e `index.html` solo gana 24 líneas
—la nota en el sitio de los datos, la etiqueta y el respaldo— y no pierde
ninguna otra. Antes de cortar se comprobó con acorn que en ese trozo no había
más que las dos declaraciones y que eran literales puros.

**Cómo se carga.** Una etiqueta `src` normal —ni `defer` ni `async`— justo
antes del bloque de código principal, que usa la red en cuanto empieza; las dos
constantes quedan en el ámbito global igual que cuando vivían dentro. Si el
fichero no llegara —sin red y sin caché—, un bloquecito detrás de la etiqueta
las pone vacías y marca `TITSA_SIN_DATOS`: **la app arranca igual, sin
guaguas**, en vez de pararse en la primera línea que las tocara. Probado
bloqueando el fichero: 975 lugares, cero errores de página, cero líneas.

**Sin conexión.** `sw.js` lo precarga (`CORE`) y lo sirve **red primero**,
como `index.html`: con `cached || fetch` una red nueva no llegaría nunca a quien
ya tuviera la vieja. Probado con el service worker de verdad en Chromium:

```
primera visita con red      service worker activo, datos/titsa.js en caché
recarga en modo avión       183 líneas, 2.514 marquesinas, panel de guaguas
                            con sus 183 filas, aeropuerto sur 7 · 0 errores
```

Y el caso de quien ya tiene la app instalada con el service worker de antes:
abre con red y le llega la versión nueva al momento; la vuelve a abrir sin
conexión y siguen las 183 líneas, cero errores.

**Medido**, CPU de móvil (4×), primera visita, mediana de cinco, dos tandas:

| | antes | ahora |
|---|---|---|
| `DOMContentLoaded` | 3.151 / 3.013 ms | **2.487 / 2.531 ms** |
| la tarea más larga | 1.102 / 1.058 ms | **624 / 645 ms** |
| tareas largas, sumadas | 2.109 / 2.013 ms | **1.604 / 1.631 ms** |

Con el navegador abierto, a la cuarta carga: 1.662 → 1.094 ms. La descarga no
cambia: 970 kB en castellano y 1.082 kB en búlgaro, ahora repartidos entre
`index.html` (687 kB) y `datos/titsa.js` (270 kB).

### Lo que encontró la mudanza en las herramientas

Se pasaron todas las herramientas sin navegador **antes y después**, y se
compararon las salidas línea a línea. Las que leían la red de `index.html`
reventaron, que es lo bueno: `cargar.js` y todo lo que lo usa, de Node y de
Python, y `verificar_red.js`. Pero tres siguieron en verde **mirando menos**:

```
barrido_idiomas.js     2.964 filas -> 2.959    las notas de 5 líneas
auditar_idioma.js      557 textos  -> 477
auditar_cirilico.py    1.161 nombres -> 1.160
```

`tools/fuente.js` y `tools/fuente.py` devuelven ahora el fuente entero:
`index.html` con los ficheros propios que carga —los `<script src>` que no son
de `vendor/`— pegados al final, sin mover sus números de línea. Los usan esas
tres y `auditar_seguridad.py`, que mira la codificación también en
`datos/titsa.js`. Con eso vuelven a 2.964 y 1.161, y la de seguridad da la
misma salida que antes, byte a byte.

**El 557 era mentira desde antes.** `auditar_idioma.js` buscaba las filas
recorriendo el fichero carácter a carácter, contando comillas y llaves, y
pasaba por el HTML, el CSS y expresiones regulares con comillas dentro. Iba
desincronizado, y el bloque de TITSA lo volvía a poner en fase por casualidad:
sin él dejó de ver 75 textos de la propia `index.html` —«Comenzar»,
«Cerrar», el panel de información—. Ahora analiza el JavaScript con acorn,
como `barrido_idiomas.js`, y ve **659 filas, entre ellas las 578 que veía
antes**: 81 que no había mirado nunca. El mismo análisis sobre el fichero de
antes y sobre el de ahora da exactamente las mismas 659.

Esas 81 traían once avisos, todos de dos clases:

- **`FI_LOCALE`**, los códigos de idioma con los que se escriben las fechas de
  las fiestas (`'zh-CN'`, `'bg-BG'`). No son texto: se declara
  `SIN-TRADUCIR` a su lado, igual que `TTS_LOCALE`.
- **Nombres de fiesta que salen igual que en castellano**: «Virgen del Carmen»
  en inglés y alemán, «Fiestas del Cristo» en inglés, y en francés
  «Carnaval de Santa Cruz» y las cuatro «Romería de…», que
  `idiomas/pantalla-aceptado.json` ya aceptaba por el mismo motivo. Se
  declaran en `IGUAL_UI` con su razón. **No se cambió ningún texto**: salían
  así en la app y así siguen. *(Ya no: el 10 de octubre se tradujeron todos
  menos «Carnaval de Santa Cruz» en francés, que es francés. Ver «Todo
  traducido, y otra vez idioma por idioma».)*

Y al declarar `FI_LOCALE`, las exentas del barrido saltaron de 18 a 58: la
regla que decidía dónde acaba una tabla exenta se alargaba fila a fila y se
tragaba las fiestas que van debajo. Ahora acaba donde acaba su objeto, según
el analizador. Siguen siendo 18, pero no las mismas: las tres tablas de
códigos y los 15 títulos de Wikipedia. Antes, dos de las 18 eran «Escuchar» y
«Parar» de la audioguía, que se vigilan ahora y están bien en los diez.

### Los controles nuevos, y las averías con las que se probaron

| control | qué mira | avería | canta |
|---|---|---|---|
| `verificar_red.js` | la red no está también en `index.html` | `const TITSA_PARADAS` vuelto a meter | sí |
| | `index.html` carga el fichero, una vez, sin `defer` ni `async` | etiqueta quitada · con `defer` | sí · sí |
| | y antes del primer código que usa la red | | |
| | `datos/titsa.js` son las dos constantes y nada más | un `console.log` al final | sí |
| `auditar_sw.js` | está en el precache | quitado de `CORE` | sí |
| | red primero, y sin red la última guardada | servido con caché primero | sí |
| `auditar_web.js` | la red llega al navegador, hidratada | la etiqueta apunta a `titsa2.js` | sí |
| | los scripts propios que bloquean, de verdad en el precache | el mismo | sí |
| `barrido_idiomas.js` | las notas de `datos/titsa.js` | una nota sin búlgaro | sí |

`auditar_web.js` decía de los scripts que bloquean «del propio origen y
precacheados» sin mirarlo, y solo miraba los del `<head>`; ahora mira todos y
lo comprueba contra `sw.js`.

**Lo que no ve ninguna herramienta, y hay que saber.** `faltan_pl.js`,
`poner_idioma.js` y `meter_idioma.js` —las que meten un idioma nuevo— trabajan
solo sobre `index.html`. Las notas de las líneas, si algún día entra otro
idioma, van a mano en `datos/titsa.js`. No se pierden: el barrido las canta.

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

## El parche «auditoria-mar-8» · de 2 aplicadas de 8 a 7 de 8

El parche traía 1 baja y 7 coordenadas, cada una con su fuente, sus límites y
una regla explícita: *«Cero improvisación. Si te falta un insumo —la costa de
la auditoría, el shapefile municipal del Cabildo o la red—, las fichas que lo
necesitan quedan PENDIENTE.»* El bloque JSON llegó íntegro (sha256
`bcecdadd…b321b`) y las 8 pasaron la pre-comprobación.

En septiembre se aplicaron **dos** y quedaron **seis**, todas esperando
Overpass. En el bloque 2 se cerraron **cinco más**, y ninguna con Overpass: el
dato que los parches pedían **ya estaba dentro del repositorio**, en el
extracto OSM del mapa. Lo saca `tools/osm_cerca.py`.

| ficha | qué se hizo | cómo |
|---|---|---|
| `montana-colorada` | **baja**: la ficha, su id en `suggestionIds` de `south`, y sus textos en los nueve `idiomas/*.json` | ninguna fuente la sitúa en Fasnia |
| `windsurf-el-poris` | 28.1540, −16.4160 → **28.152765, −16.432303** | coordenada oficial de Playa Grande, empujada 8 m a tierra sobre el **segmento** de costa |
| `faro-santa-cruz-puerto` | 444 m → **en tierra, 4,8 m del borde** | **Wikidata Q5966669**, que además da el elemento de OSM: way 193798986. Esa coordenada cae en el agua a z14 (7,6 m), así que se empujó hacia tierra: dentro del tope de 15 m el mejor margen alcanzable es **4,78 m**, medido en cada paso porque el muelle es estrecho y el polígono está generalizado. Nombre, textos, `cat` y etiquetas nuevos en los diez idiomas |
| `pk-poris-abona` | 82 m → **46,8 m en tierra** | «Calle Martín Rodríguez», a 58 m del ancla oficial (límite 80). La regla de aparcamientos, abajo |
| `pk-bajamar-piscinas` | 28 m → **33,5 m en tierra** | «Avenida del Sol», a 63 m del ancla (límite 150) |
| `lidl-puerto-cruz` | 46 m → **232 m en tierra** | el único Lidl a menos de 2,5 km, a 81 m de la «Carretera Gral. Icod-Santa Cruz» que nombraba el parche, y en Puerto de la Cruz según la dirección postal y la comprobación de rayas |
| `whale-watching` | 23 m → **se queda** | está dentro de la marina, a 52 m de su punto en OSM. Exento POR ID, con el motivo escrito, no por categoría |
| `ermita-san-telmo` | 19 m → **en tierra, 18,0 m** | **Wikidata Q2220075**, en tierra, se usa tal cual. Se mueve 155 m al este |

La parada TITSA «Montaña Colorada» de Granadilla de Abona **no se ha tocado**:
el parche avisaba de que es otra cosa, y lo es.

### La regla de los aparcamientos, escrita y ejecutable

> La vía rodada **con nombre** más cercana al ancla que cumpla **la distancia
> máxima** y **el margen de 3 m** contra la costa.

Las dos condiciones son la regla entera: en Bajamar la vía más cercana estaba
a 30 m del ancla pero a **2,9 m del borde**, y la regla la descarta. Y con
nombre, porque el extracto a z14 no trae `access` ni `service`: de una calle
sin nombre no se sabe si es la entrada a una casa. No se queda escrita en un
documento, que es donde las reglas se olvidan: es
`tools/osm_cerca.py --aparcamiento`, e imprime también lo que descarta.

### Y lo que enseñó el bloque

**Que algo no esté en el extracto no quiere decir que no esté en OSM.**
`tools/osm_cerca.py` dio **0 faros en toda la isla** y 0 nombres con «faro» o
«farola» — y la Farola está en OSM, en el way 193798986, enlazada desde
Wikidata. Lo mismo con la ermita. Un 0 del extracto significa «no lo trae»,
nunca «no existe». Está escrito en la cabecera de la herramienta.

Y la segunda: **los POIs que en OSM son una vía o un polígono llegan al
extracto como un punto de rótulo**. El «Paseo de San Telmo» está a 218 m de su
rótulo y la zona peatonal que es ese mismo paseo, a 31 m. La distancia al
rótulo no es la distancia al sitio.

### Y un exento que no lo era

`puerto-colon-adeje` estaba **150 m en mar abierto**, no en la dársena, y la
exención por categoría lo tapaba. Movido al punto de la marina en OSM: 58 m.
Ahora el control imprime siempre los exentos **a más de 150 m** —quedan
`puertito-poris-abona` (241 m) y `puerto-granadilla-comercial` (216 m)— porque
un puerto está en el agua por definición, pero no a cualquier distancia, y la
exención no puede servir para esconder un pin puesto en mar abierto.

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

- **55 de 787** fichas tienen lat **y** lng con 3 decimales significativos o
  menos. Eso no es
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

## Un número escrito en letra desaparece

Al escribir la Playa La Fajana en los diez idiomas, `auditar_idioma.js` puso
en rojo el francés, el italiano y el neerlandés. El motivo: el castellano dice
«unos **30** minutos a pie» y esos tres lo decían en letra —«une trentaine»,
«una trentina», «een halfuur»—, así que **la cifra desaparecía**. El control
compara los números de cada traducción con los del castellano: encontraba el
130 y el 20 de las dimensiones, y el 30 no.

No es una manía tipográfica. Un dato de acceso —media hora andando— es de los
que deciden si alguien se mete en un sendero con niños, y tiene que estar igual
de claro en los diez. Escritos como cifra.

## Lo verificado no se guardaba en ninguna parte

Ésta es la causa de fondo, y es un fallo de diseño. **Se comprobaba un sitio y
la comprobación se quedaba en los mensajes y en el commit.** Nada en el dato
decía «esto ya está mirado», así que el siguiente control volvía a sacarlo en
la lista. Trabajo de meses que había que volver a hacer, y la sensación —
justa— de que todo falla siempre.

Ahora hay un registro: **`datos/verificado.json`**, una entrada por id con la
fecha y **de dónde sale**. Sin fuente no se apunta: una marca de «verificado»
sin fuente calla el control y no deja rastro de por qué.

**Arranca con 130, y no salen de la nada.** Salen de los ficheros de fuente
que ya se habían entregado meses atrás y se aplicaron sin dejar constancia:

| de dónde | qué traía |
|---|---|
| `playastenerife.json` | 40 altas y 4 correcciones de coordenada, **cada una con su campo `fuente`**: Censo Nacional de Zonas de Aguas de Baño 2025 del Servicio Canario de la Salud, Bandera Azul 2026 y Google Places |
| `listasplayascharcos.md` | las tablas de playas y charcos con su coordenada, bajo la línea «**ninguna coordenada estimada**» |
| `parche2coordenadas.md` | las 4 de Anaga y Rambla de Castro que estaban corridas, con la comprobación cruzada contra `mir-rambla-castro` |
| el historial de git | las 14 corregidas a propósito, con el commit que dice por qué |

Y no se han dado por buenas sin más: **de las 119 que traían coordenada se
comprobó que la de hoy siga siendo la de la fuente.** Ninguna había cambiado
después y ninguna había desaparecido.

**Una precisión, para no decir más de lo que es.** `listasplayascharcos.md`
lista por nombre, no por id, así que el emparejamiento fue por **coordenada
exacta**. Una ficha que comparte punto con una playa verificada —su webcam, su
ficha de accesibilidad, el spot de surf de esa misma arena— hereda la
verificación **del punto**. Lo verificado es que ese punto es el de esa playa;
que la ficha deba estar ahí es otra cosa y no se afirma.

## Las orientaciones de playa están CERRADAS, y yo las reabrí

Aquí me equivoqué, y es el mismo error de fondo: presenté como pendiente un
trabajo que estaba hecho.

**La verificación se hizo, y se hizo a fondo.** Se abrieron una por una las
fuentes que podrían publicar la orientación de una playa, y ninguna la publica:

| fuente | qué pasó al abrirla |
|---|---|
| **surf-forecast.com** | sirve, pero sólo cubre rompientes: 26 spots en Tenerife, ~12 coinciden con puntos de baño. De ahí salen las 11 verificadas. Las playas abrigadas, que son las que la gente usa para bañarse, no son spots de surf y no tienen ficha |
| **AEMET, predicción de playas** | no sirve: sus campos son cielo, viento **sólo en intensidad, sin rumbo**, mar de fondo, temperatura, agua, UV y mareas. Comprobado abriendo la ficha de San Marcos (3802201) |
| **MITECO, Guía de Playas** | no sirve: la base completa del Estado, ~3.000 playas, nueve secciones, y la orientación no es ninguna |
| **Catálogo del Decreto 116/2018** | el decreto está **anulado por el Tribunal Supremo**; lo que se apoye en él ha perdido su base legal |

Y el trabajo del modelo se auditó: las 4 filas que decía tener respaldo se
abrieron una por una —las 4 decían lo que decía—, **se cazó un error real de
90°** (`playa-grande-abades`, SE → NE) y una contradicción en el `badWind` de
Porís, por la que `badWind` va vacío en las 65.

**Y el método automático se probó y se rechazó.** `tools/orientacion_playa.py`
deduce `ori` del polígono de arena de OSM y reproduce **7 de las 12** escritas
a mano, cuando el umbral, fijado antes de mirar, era 10. Lo que decía la orden
de trabajo: *«está diseñado para poder salir que NO, y si sale que no, se para
y **la respuesta queda cerrada para siempre**»*.

Así que `deducida:true` **es el resultado**, no una tarea. El techo es que el
dato es fiable a ±45° y no más, y está escrito. De esa área sólo quedaron
abiertas tres filas concretas: `playa-grande-abades`, `benijo` y
`piscina-gigantes`.

## El registro pasa a cubrir ÁREAS, no sólo coordenadas

Ése era el agujero. `datos/verificado.json` guardaba coordenada por coordenada,
así que un área entera —las orientaciones— no tenía dónde constar como hecha, y
volvía a salir. Ahora el registro lleva una sección `areas` con el estado de
cada una, **su techo escrito** y lo que quedó abierto:

```
cerrado   orientacion_playa · calidad_del_agua · bandera_azul · red_titsa
          idiomas · asistente · mapa_sin_conexion
abierto   coordenadas · municipio_de_cada_ficha · lugares_en_el_mar
```

**Un área en «cerrado» no se vuelve a pedir.** Cerrado no quiere decir
perfecto: quiere decir que la verificación se hizo, que se agotó lo que se
podía comprobar y que el techo está escrito. Un área cerrada con un dato
deducido está cerrada.

`REVISION-LUGARES.md` abre con esa tabla, para que lo primero que se lea sea
qué está hecho y no qué falla.

Y no hay que acordarse de escribirlo. **`tools/fijar_coordenada.py` apunta el
registro él solo** cuando aplica una coordenada, tomando como fuente lo que
vaya detrás de la `#` en el fichero de entrada; si no se le da fuente, escribe
la coordenada pero avisa de que no la apunta. Si hay que acordarse a mano, no
se apunta: eso ya se probó.

`auditar_redondeo.py` lee el registro y **deja en paz lo verificado** aunque
esté escrito con pocos decimales: la precisión de una fuente es la que es.

## El estado real de las coordenadas, sacado del historial

Recorriendo los 106 commits que tocan `index.html` y comparando las
coordenadas de cada uno con el anterior, sale el mapa exacto de lo que se ha
tocado nunca:

```
entraron en el PRIMER commit y nadie ha tocado su coordenada ..... 725
dadas de alta despues ............................................  48
con la coordenada corregida a proposito, con su motivo ...........  14
```

**El 92 % de las coordenadas viene de la importación inicial y no las ha
mirado nadie.** No es que el trabajo de estos meses haya fallado: es que ese
trabajo fue otro —los diez idiomas con sus 1.705 filas cada uno, la red de
TITSA regenerada del GTFS, el mapa sin conexión, las 690 respuestas del
asistente— y todo eso **está comprobado y en verde**. Las coordenadas nunca
formaron parte de él.

Decirlo así es la diferencia entre «mucho está fallando» y «esto de aquí está
hecho, esto otro no se ha empezado». Son la misma realidad y no significan lo
mismo.

## Por qué cada auditoría sacaba una lista nueva

El dueño del proyecto lo dijo con razón: cada revisión aparecía con algo que
la anterior no había visto. La causa no era mala suerte.

**Los controles miraban la FORMA del dato y no el dato.** Comprobaban cuántos
decimales tiene una coordenada, si cae en tierra, si está dentro de la caja de
Tenerife, si el id cumple `[a-z0-9-]`. Todo eso lo pasa un punto que está a un
municipio de distancia del sitio que describe. `charco-verde-realejos` cumplía
las cuatro y estaba en La Guancha diciendo Los Realejos.

Y encima el de los decimales **contaba caracteres**, así que «28.3720» le
parecían cuatro decimales cuando son tres y un cero de adorno: se dejaba 42 de
55.

Lo que faltaba era **cruzar cada ficha con el resto del repositorio**, que es
donde está la única verdad comprobable sin salir a la red. De ahí sale
`tools/auditar_municipio.js` y el informe completo de
`tools/informe_lugares.js`, que barre los 787 y **separa tres cosas que nunca
hay que mezclar**: lo comprobado y correcto, lo comprobado y mal, y lo que no
se puede comprobar desde aquí, con su motivo. Esa tercera columna es la que
faltaba, y es la que hacía que cada semana apareciera una lista nueva.

## Dos controles llevaban dos días rotos y parecían hallazgos

`auditar.sh` contaba en el mismo sitio un control que **encuentra algo** y un
control que **no ha llegado a mirar nada**: los dos salen con estado distinto de
cero. En un contenedor nuevo faltaban `pmtiles` y `mapbox_vector_tile`, así que
`auditar_ubicacion.py` y `auditar_en_el_mar.py` reventaban con un `Traceback`, y
el resumen decía **«3 bloque(s) con fallo»** como si hubiera tres cosas que
mirar. Eran una.

**Un control roto es peor que uno en rojo**: el rojo enseña algo, el roto no
enseña nada y lo parece.

Arreglado en dos sitios:

- `auditar.sh` detecta el `Traceback` de Python y la pila de Node, lo cuenta
  aparte y lo dice con otro nombre: *«NO SE PUDO EJECUTAR: le falta algo. No es
  un hallazgo.»* Los tres controles que filtran su salida a mano
  (`verificar_red.js`, `probar_faq.js` y el bucle de `auditar_idioma.js`) pasan
  por la misma comprobación.
- `tools/requisitos.txt`, que antes no existía: las dependencias de Python no
  estaban declaradas en ninguna parte.

Probado desinstalando `pmtiles` otra vez: la auditoría separa **2 rotos y 1
fallo** donde antes decía 3 y ya está.

Con los dos controles funcionando, **el único bloque en rojo del proyecto es el
del municipio**.

## El municipio · 0 fuera de sitio, 15 que solo nombran una zona

La primera version cruzaba lo que cada ficha declara —un tramo del `cat` o el
paréntesis del nombre— con el municipio de **las paradas de TITSA de
alrededor**. Daba **0 hallazgos en firme** y el área se cerró.

Era una aproximación, y estaba tapando trabajo. Con el **polígono municipal del
Cabildo** en el repositorio, la comprobación pasó a ser point-in-polygon exacto
y aparecieron **16**. De esas:

- **3 eran fallo del control, no de las fichas.** En la tabla de alias se
  habían colado dos nombres que no son de un municipio: `Las Américas`, que
  está partida entre **Arona y Adeje** (de las 10 fichas que la nombran, 8 caen
  en Arona y 2 en Adeje), y `Teno`, que es el **macizo** (de las 7 que lo
  nombran, 6 caen en Buenavista del Norte y 1 en Los Silos). Un nombre que
  manda a dos municipios distintos no es el nombre de uno. Ahora van a `ZONAS`,
  con su propio apartado: **no pasan y no fallan, se cuentan y se listan**.
- **13 son de verdad**, repartidas en `MUNICIPIOS-BLOQUE4.md`: 8 donde miente el
  texto, 1 donde miente el pin, 3 sobre la raya que decide la fuente oficial y 1
  sin nada que la respalde. **Las 13 están resueltas y el bloque queda a cero:**
  `sendero-roque-conde` no era ni una cosa ni la otra — la ficha es **la subida,
  no la cumbre**, así que Arona era correcto y lo que estaba mal era el pin, que
  apuntaba al pico. Se mueve al inicio publicado por el Ayuntamiento de Adeje,
  Calle Vento (Arona), y de paso se corrigen los datos de la ruta, que no
  coincidían con ninguna fuente oficial. Y `super-mercadona-tacoronte` era el
  caso contrario, el único donde **mentía el pin**: Jerome confirmó la tienda con
  una captura de Street View, y el punto se mueve 879 m hasta ella, ya dentro de
  Tacoronte. Las dos de **Las Lajas** resultaron ser de Adeje y no de Vilaflor —lo
  dice el propio Cabildo en Tenerife ON— y además dejaron de compartir un único
  pin: cada una tiene ahora la coordenada que publica su ficha oficial. Y
  `guachinche-san-juan-rambla` **se da de baja**: nombre genérico, sin dirección
  ni teléfono y sin ningún guachinche que se llame así. Son **786**. Y las **7 del
  grupo A** llevan ya el municipio que dice el polígono. Una de ellas no era sólo
  el municipio: la descripción entera de `montana-taco` era la del **otro Taco**,
  el barrio de La Laguna —«un pulmón verde entre la ciudad», «vistas al
  aeropuerto», «sendero de 45 minutos desde la ciudad»—, todo ello a 45 km de la
  montaña. No se inventa una nueva: se deja **sólo lo que tiene fuente** y se
  avisa de la confusión de nombres. Y la última, `escal-guaria`, resultó ser el
  caso contrario al que yo suponía: **el texto tenía razón y el pin estaba a
  6,9 km**. Guaría está en Guía de Isora, en el Monumento Natural de la Montaña
  de Tejina, y el punto apuntaba a los altos de Adeje.

**El área vuelve a estar ABIERTA.** Un área no puede estar cerrada mientras su
control está en rojo. Las cifras no se escriben aquí a mano: las cuenta
`node tools/auditar_municipio.js`, que además **coteja este titular** y se pone
rojo si se queda viejo.

### Las cuatro cerradas, y con qué

`buceo-tabaiba`, `parque-tabaiba-baja` y `kayak-radazul` decían **Santa Cruz**
y son de **El Rosario**; `mir-cruz-hilda` decía **Santiago del Teide** y es de
**Buenavista del Norte**. Las cuatro venían con la respuesta del dueño y un
parche (`municipios-bloque1-A`), que exigía una cosa razonable: **la prueba
tiene que ser el polígono, no la parada de al lado**, porque una parada a 67 m
puede caer al otro lado de una raya.

**El polígono municipal del Cabildo no está en el repositorio.** Se buscó: no
hay ningún fichero de límites, y el municipio de las paradas tampoco sale de un
polígono —`gtfs_red.py` se lo copia del índice de TITSA más cercano, a menos de
3 km—. Bajarlo tampoco se puede: Overpass, Nominatim, IDECanarias y los
portales de datos abiertos dan `000` desde aquí.

Lo que sí hay es el mapa OSM del propio repositorio, con las **rayas
municipales** (`boundaries`, `admin_level` 8). No son polígonos —son líneas
sueltas, recortadas por tesela— así que no se puede preguntar «dentro de quién
cae». Pero sí lo único que hacía falta, que es justo el riesgo señalado:
**¿hay una raya entre el punto y las paradas que lo rodean?** Eso es
`tools/municipio_raya.py`, hoy sustituido por el polígono de verdad:

| id | paradas de apoyo | raya más cercana | hueco del dato | rayas en medio |
|---|---|---|---|---|
| `buceo-tabaiba` | 8 hasta 561 m, todas El Rosario | 909 m | 911 m | 0 |
| `parque-tabaiba-baja` | 8 hasta 510 m, todas El Rosario | 987 m | 994 m | 0 |
| `kayak-radazul` | 8 hasta 433 m, todas El Rosario | 1.618 m | 1.618 m | 0 |
| `mir-cruz-hilda` | 8 hasta 1.780 m, todas Buenavista | 2.166 m | 2.224 m | 0 |

**Calibrado, no dado por bueno.** De las 849 parejas de paradas vecinas de
municipio distinto a menos de 1,5 km, **805 (94,8 %)** tienen de verdad una
raya en medio: el dato pierde 1 de cada 19 cruces. Por eso una ficha solo se
cierra si **ni una raya ni un hueco** caen dentro del círculo que abarca las
paradas de apoyo. Probado al revés sobre las cinco del borde: el control canta
(7, 5 y 8 rayas en medio; en las otras dos, la raya a 172 m y a 1.294 m, dentro
del círculo) y se niega a concluir. Queda apuntado en `datos/verificado.json`,
sección `municipio_por_raya`.

### El alias que estaba mal

Al corregir el mirador, el control lo marcó como contradicción: leía «(Masca)»
como *Santiago del Teide*. **Su tabla de alias tenía «Masca» en el municipio
equivocado.** Las **tres** paradas del catálogo que llevan «Masca» en el nombre
son de **Buenavista del Norte**. Corregido.

### Las tres del segundo parche

`ar-la-quebrada` se movio **4.068 m** a la coordenada que publica Tenerife ON
(Cabildo): el punto viejo caia entre calles de un barrio de La Laguna. De las
14 paradas mas cercanas **solo una** no tiene raya en medio, «Cruce el
Moquinal» (Tegueste) a 380 m, que es el mismo cruce que nombra la ficha
oficial; las 13 de La Laguna estan al otro lado de una raya.

`mercadillo-la-victoria` se movio **2.109 m**. No hay coordenada publicada, asi
que el metodo es **DERIVADO** y queda escrito como tal: punto medio entre la
«Casa de la Castaña» y el «Terrero Municipal de Lucha y Deportes», separados
78 m, que es como el Ayuntamiento situa el mercadillo. Los tres pasos del
parche pedian Overpass, que esta cerrado desde aqui, y se resolvieron contra el
OSM del propio repositorio con `tools/osm_cerca.py`: paso 1 exactamente 1
elemento, paso 2 ningun `amenity=marketplace` a 250 m -y 15 en toda la isla,
asi que el extracto no los filtra: OSM no tiene ese mercadillo-, paso 3
exactamente 1. El punto nuevo da La Victoria de Acentejo.

`cavis-violencia-sexual-tenerife` **no se movio, y ese era el fallo mio**: la
tenia como «el punto miente». Segun el Instituto Canario de Igualdad, calle
Franco de Medina 41 esta en La Cuesta, San Cristobal de La Laguna, asi que el
punto era coherente y lo que mentia era el texto. Mover el pin a Santa Cruz
habria mandado a las victimas al sitio equivocado. Texto nuevo en los diez
idiomas con las tres sedes y los seis telefonos oficiales. El pin no se pudo
geocodificar -CartoCiudad y OSM dan 000 desde aqui-, asi que se aplico la
ultima rama de la regla: el municipio del punto actual es La Laguna (14
paradas, ninguna con raya en medio, la primera a 72 m) y el pin se queda,
apuntado como PORTAL NO VERIFICADO.

### Las tres del tercer parche

Las tres se contradecian solas, y en las tres **el pin ya estaba bien**: lo que
mentia era el texto. Ninguna coordenada se movio.

`casa-capitanes-generales` es de **La Laguna**: el nombre y el punto lo decian
y la descripcion hablaba de otro edificio -Plaza de la Candelaria, 1741-1750,
Ayuntamiento de Santa Cruz-. Sustituida entera. El paso de afinado pedia
Overpass con `name~Capitanes` y en el OSM del repositorio no hay ninguno a
200 m, pero SI esta el edificio con su otro nombre, «Casa de
Alvarado-Bracamonte», a **23 m** del pin: por debajo de los 40 m de la regla,
asi que el pin se queda, y de paso queda confirmado.

`rcg-tenerife` es de **Tacoronte**, que es lo que dice el propio club. La regla
mandaba geocodificar si el poligono daba La Laguna: no hizo falta, el punto ya
da Tacoronte.

`guachinche-cordero` es de **San Miguel de Abona**. Ademas se le quitaron los
datos que se contradecian: decia abierto todos los dias y a la vez «solo fines
de semana».

### Lo que sigue abierto: nada en firme

**Las cinco del borde no suspenden.** Un mirador en un puerto de montaña o un
sendero que cruza dos terminos caen en el borde por definicion, y un control
que cante en cada borde se ignora a la semana. Se listan igual: callarlas seria
el fallo contrario. Con la herramienta afinada, dos ya tienen respuesta
-`montana-taco` da Buenavista del Norte diciendo La Laguna, y
`playa-caleton-sauzal` da La Matanza diciendo El Sauzal- y las otras tres no se
pueden cerrar desde aqui.

Y queda una etiqueta: `ar-la-quebrada` conserva «Tranquila», que contradice el
«Muy tranquila» que se quito del texto. El parche no listaba `tags` para esa
ficha y no se toco.

El detalle de las diez, con lo que decidio cada parche, esta en
`MUNICIPIOS-BLOQUE1.md`.

## El control de coordenadas a ojo se dejaba 42

`auditar_redondeo.py` decía **13**. Son **55**.

Contaba los decimales **escritos**, y una coordenada puesta a ojo se escribe
«28.372» y luego alguien la deja en **«28.3720»** para que case con el formato
de las demás. Contando caracteres eso parecen cuatro decimales y el control la
dejaba pasar; es el mismo punto con un cero de adorno, y sigue siendo una
cuadrícula de 110 m. Ahora cuenta decimales **significativos**, quitando los
ceros de la derecha.

De las 55, **20 tienen sólo dos decimales**, que es una cuadrícula de
**1,1 km**: `anaga`, `caldeira-canadas`, `corona-forestal`, `mir-rambleta-teide`
—el mirador del Teide a 3.555 m—, los tres de Los Gigantes, `lidl-puerto-cruz`
—que es una de las seis del parche del mar—, `mercadona-el-medano`…

La lista entera, con qué es cada una y en qué municipio cae, está en
`COORDENADAS-A-OJO.md`.

Y el aviso que se lleva: **un control que mira la forma del dato y no su
contenido se equivoca en silencio**. Éste llevaba dos días dando 13 y nadie lo
hubiera mirado dos veces si no llega a pedirse la lista.

## Guía de Isora ya es una `ciudad`

Era la excepción que quedaba: cabecera municipal con `category:"municipio"`
cuando las otras 30 llevan `"ciudad"`. Por eso había 30 `ciudad-*` y no 31.
Cambiada la categoría —una palabra—, el id no se toca y los favoritos no se
rompen. **31 cabeceras, 31 `ciudad`.**

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

## Idiomas · 43 tablas, 1605 filas (y 3.746 filas, dentro y fuera del fuente)

*(Cifras del 12 de octubre: 34 filas nuevas de `UI_TX` para los avisos de
AEMET, 3 del asistente para «socorro», 6 para ordenar los favoritos y 2 para
«ayuda», y una menos de la privacidad (AEMET ya no recibe nada del
dispositivo). Esa noche, 17 más del tour y de Rutas y dos menos: la frase
falsa de la guagua del Teide y el rótulo de pestaña que no se veía. El 13,
una más (sin guagua entre dos paradas) y seis menos de «Organiza tu día»: los
cuatro tiempos fijos entre paradas y dos títulos que ya no usa nadie. Esa
tarde, tres más: el título y el «atrás» del paso Norte o Sur, y el aviso de
que en esa zona no hay más lugares. El 16, 21 menos: las de las siete
tarjetas inventadas de la tienda y su hueco de AdSense, que se borraron. El
17, el panel del cielo: 10 tablas y 514 filas más. Las de
`modulos/cielo.js` (`CIELO_UI` con 250, las ocho tablas de nombres con 254 y
`CIELO_LOCALE`), que `tools/fuente.js` pega al fuente, y en `UI_TX` las siete
filas del botón y las dos del tour. El 20, «Apunta al cielo», la carta nueva
y la ficha: 87 más (79 de `CIELO_UI`, que pasa a 329 y pierde una que ya no
pedía nadie; las cuatro lunas de Júpiter en `CIELO_CUERPO`; y en la política
de privacidad los sensores y la cámara, cuatro). El 21, lo que piden las
reseñas: 67 más en `CIELO_UI`, que pasa a 396, y esa tarde 30 más de los
satélites, hasta 426; y, de los avisos de AEMET, una
más: las dos de «Báñate hoy aquí» con un aviso costero, y una menos, la de la
✕ de la píldora de avisos, que ya no existe; esa tarde, dos más: «Toda la
isla» y «Toda la costa» en la línea de los avisos. El
11 de octubre el tour dejó de ser una
tabla propia y sus textos son 37 filas de `UI_TX`. `auditar_web.js` coteja las
dos primeras. La tercera es el «total mirado, dentro y fuera» de
`barrido_idiomas.js`, contado el 21 de octubre (3.045 antes del cielo, 3.559
el 17); no la coteja nadie.)*

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
| Referencias huérfanas en `suggestionIds` (planificador de día) | **0** de 162 |
| Paradas o lugares fuera de Tenerife | **0** |
| Parada repetida consecutiva en una línea | **0** |
| `via` con punto mal formado | **0** de 26.593 |
| Lugares completos (id, nombre, categoría, coordenada, color, emoji) | **980** |
| Ids de lugar que cumplen `[a-z0-9-]` | **980** |
| Con calidad de agua, y su año | **46** · 46 |
| Con alias de búsqueda, que los 3 filtros leen | **58** |
| Con aviso `warn`, y su tipo existe en `WARN_I18N` | **116** · 0 huérfanos |
| De esos, `warn:"mar"` | **50** |
| URLs de lugar sin cifrar | **0** de 16 |

Cada cifra de esta tabla, y las dos del texto de abajo (los filtros del alias
y las líneas con más de dos terminales), las coteja `auditar_datos.js`: si una
cambia y la tabla no, se pone en rojo. Hasta el 18 de octubre decía «0 de 164»
y «786» con 162 y 980.

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
59. **El fuente ya no es solo `index.html`.** Desde el 9 de octubre de 2026 la
    red de guaguas vive en `datos/titsa.js`, y lleva textos en diez idiomas
    —las notas de algunas líneas— y nombres en cirílico. Una herramienta que
    barra `index.html` a pelo no los ve y da verde: al mudarlos, el barrido de
    idiomas pasó de 2.964 filas a 2.959 sin cambiar de color. Para barrer el
    fuente, `tools/fuente.js` (o `.py`): devuelve `index.html` con los
    ficheros propios que carga pegados al final, sin mover sus líneas.
60. **Una tabla declarada exenta acaba donde acaba su objeto.** El barrido
    alargaba la exención fila a fila mientras hubiera otra a menos de 4.000
    caracteres: al declarar `FI_LOCALE`, una sola línea de códigos de idioma,
    se tragó las 40 filas de las fiestas que van debajo. Y antes ya se había
    tragado «Escuchar» y «Parar» de la audioguía, detrás de `TTS_LOCALE`.

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

## Todo traducido, y otra vez idioma por idioma (10 de octubre)

Jerome: «Si traduce todo ya y de nuevo hace auditorio con cada idioma. Una por
una no dejar nada atrás». Todos los controles estaban en verde, y aun así
quedaba castellano dentro de los nueve idiomas. Ninguno leía las palabras:
`auditar_idioma.js` compara cifras, horas, avisos y marcadores;
`auditar_etiquetas.js` mira que cada etiqueta tenga fila;
`barrido_pantallas.js` busca texto **igual** al castellano, y «Malpaís» por
«Malpais» no es igual.

### Lo que quedaba

- **Palabras castellanas sueltas** dentro del texto traducido: «ermitas» en
  inglés, «fincas» y «barrancos» en francés, «laguneros» en alemán e
  italiano, «monteverde» en seis idiomas, «Malpaís» en las etiquetas de tres,
  «lonja», «morcilla», «avenidas», «gorrillas»…
- **127 frases enteras** que el castellano dice y la traducción no, sobre todo
  en francés y alemán: se tradujeron antes de que el castellano creciera.
- **109 descripciones resumidas**: las mismas frases, sin los datos. La
  reunión abierta del último lunes de Alcohólicos Anónimos, la calle del
  servicio de atención a las mujeres, las muletas anfibias de las playas
  accesibles.
- **Los nombres de fiesta que `IGUAL_UI` daba por buenos**: las cuatro
  «Romería de…» en francés, alemán, italiano y neerlandés, «Virgen del Carmen»
  en inglés y alemán y «Fiestas del Cristo» en inglés. Ahora son «Pèlerinage
  de San Isidro», «San-Isidro-Wallfahrt», «Our Lady of Mount Carmel»… En
  `IGUAL_UI` quedan las marcas («Friendly Zone 🐾», «🏪 Tenerife Go Shop»,
  «Pack Tenerife Go») y «Carnaval de Santa Cruz» en francés, que es francés.
  Y `idiomas/pantalla-aceptado.json` se queda sin las cuatro romerías
  francesas.
- **Etiquetas del catálogo**: seis fichas de buceo llevaban «Buceo» y
  «Diving», y seis de parapente «Parapente» y «Paragliding»: en castellano
  salía el inglés, y en los otros nueve el mismo chip dos veces
  («Plongée · Plongée»). El kayak de Los Gigantes llevaba «SUP» y «Paddle
  surf», que son lo mismo. Y en el castellano de las etiquetas, «Iconic»,
  «Sport Climbing» y «Multi-Pitch». En total, 19 etiquetas puestas o quitadas
  en 17 fichas.
- **Siete erratas del castellano**: «relictico», «eufórbias», «statuas»,
  «peláficos», «Waterfalls» y «Picnic area.» —inglés dentro del castellano— y
  «fuerte y gustoso» dicho del viento, que es «fuerte y racheado».

### Cuánto, idioma por idioma

Textos que cambian contra el commit anterior (una descripción es un texto;
una pregunta del asistente son dos, la pregunta y la respuesta):

| idioma | fichas | etiquetas | asistente | resto de la app | total |
|---|---:|---:|---:|---:|---:|
| inglés | 39 | 5 | 4 | 5 | 53 |
| francés | 133 | 11 | 9 | 7 | 160 |
| alemán | 99 | 4 | 4 | 8 | 115 |
| italiano | 62 | 9 | 11 | 10 | 92 |
| neerlandés | 45 | 6 | 6 | 10 | 67 |
| chino simplificado | 3 | 6 | 1 | 0 | 10 |
| chino tradicional | 4 | 6 | 1 | 0 | 11 |
| búlgaro | 14 | 11 | 4 | 4 | 33 |
| polaco | 26 | 14 | 4 | 11 | 55 |
| **total** | | | | | **596** |

### Lo que se queda en castellano a propósito

Regla de Jerome: «Si no se traduce se deja en castellano». Va en
`idiomas/castellano-aceptado.json`, cada cosa con su motivo, revisado palabra
por palabra:

- los **platos** (papas arrugadas, mojo, gofio, escaldón, almogrote,
  sancocho, ropa vieja…): es su nombre. En chino va el nombre y detrás lo que
  es: «mojo辣酱», «gofio烤粉»;
- **guachinche**, que el asistente explica;
- **la lección**: «guagua es el autobús» en el asistente, «había fleje de
  gente» en el glosario canario;
- **romería, mencey, murga y comparsa** donde el texto las explica a
  continuación;
- las **plantas con nombre local** (viñátigo, píjara, retama, tabaiba, cardón)
  y el nombre científico *Euphorbia canariensis*;
- **ten+**, la tarjeta de transporte, y una **dirección postal** copiada tal
  cual para poder encontrar el sitio;
- las palabras que **el idioma escribe igual**: «primates», «barracudas» o
  «tropicales» en francés, «finca» en alemán y neerlandés (Duden, Van Dale).

Una entrada que ya no hace falta **suspende** el control: lo aceptado deja de
mirarse, y una entrada de más solo sirve para tapar la próxima vez.

### El control nuevo: `tools/castellano_suelto.js`

En `auditar.sh` desde hoy. Lee todo lo que lee el usuario en cada idioma
—fichas, etiquetas, asistente, privacidad y las filas de idioma de todo el
fuente: 4.233 textos por idioma, 4.028 en chino tradicional— y busca:

- **letras y signos** del castellano que el idioma no usa (á í ó ú ñ, «¿», «¡»;
  el polaco sí usa la «ó»);
- **palabras corrientes** del castellano: romería, barranco, malpaís, ermita,
  finca, mirador…;
- **palabras copiadas**: en minúscula, con plural castellano, igual que en el
  castellano de ese mismo texto y que el idioma no usa en ningún otro sitio.
  Así salieron «fincas», «escalones» o «laguneros» sin conocerlas de antemano;
- en búlgaro, el castellano pasado tal cual al cirílico («ромерия»,
  «кардонал»); en búlgaro y chino, las palabras en alfabeto latino;
- **frases de menos**: la descripción con menos frases que el castellano;
- **fichas resumidas**: mucho más cortas de lo normal en ese idioma.

Antes de buscar quita los nombres propios, sacados del propio catálogo
(fichas, paradas y líneas de TITSA, etiquetas declaradas) y por su forma
(«Calle Chile», «Barranco del Rey»). **Un nombre del catálogo solo se quita si
el castellano de ese mismo texto lo tiene**: un nombre que la traducción copia
del original está en el original.

### Las averías del propio control

| # | avería | canta |
|---|---|---|
| 1 | «ermitas» otra vez en una ficha inglesa | sí: palabra castellana |
| 2 | una ficha francesa pierde su última frase | sí: 3 frases en castellano, 2 en francés |
| 3 | la etiqueta francesa «Malpais» vuelve a «Malpaís» | sí (**en la primera ronda, no**) |
| 4 | «Romería», con mayúscula, en una ficha alemana | sí (**en la primera ronda, no**) |
| 5 | «кардонал» en una ficha búlgara | sí: castellano en cirílico |
| 6 | «mirador» en una ficha china | sí (**en la primera ronda, no**) |
| 7 | una palabra aceptada que no sale en ningún texto | sí: sobra |
| 8 | una ficha alemana resumida a la mitad | sí: frases de menos |
| 9 | «escalones», que no está en ninguna lista, en inglés | sí: copiada del castellano |
| 10 | «¿Czym jest romería?» en el asistente polaco | sí (en la primera ronda la avería no llegó a meterse, y al mirar por qué salió que **la regla no podía cantar**) |
| 11 | «barranco» pegado al chino tradicional, sin espacios | sí: alfabeto latino |
| 12 | vuelve «Cumbre Dorsal» en alemán | sí: palabra castellana |
| 13 | una aceptación por trozo del castellano que ya no hace falta | sí: sobra |
| 14 | «¡Oh là là !» en el glosario francés | sí: signo castellano |
| 15 | dos etiquetas de la misma ficha iguales en italiano (`auditar_etiquetas.js`) | sí: 2 fichas |
| 16 | la misma etiqueta dos veces en el castellano (`auditar_etiquetas.js`) | sí: en los diez idiomas |

En la primera ronda, de diez averías **tres pasaron sin cantar** y otra no
llegó a meterse (apuntaba a un fichero que no era). Detrás de esas cuatro había
cuatro reglas que no miraban nada aunque estaban escritas:

1. **El alfabeto latino en búlgaro y chino no saltaba nunca.** La expresión de
   los códigos («TF-5») iba junta con la de las unidades, que lleva la bandera
   «i», y así casaba con **cualquier** palabra en minúscula. Arreglada,
   salieron 93 casos en búlgaro y en los dos chinos, y ninguno era un resto:
   nombres de platos y plantas, «ten+», la dirección, la lección del
   asistente, y códigos («lat/lng», «supabase/tienda.sql», «wi-fi») que ahora
   se reconocen como código. Lo demás se aceptó uno a uno, con su motivo.
2. **«¿» y «¡» se buscaban dentro de cada palabra**, y las palabras solo
   tienen letras: no podía saltar. Arreglada, encontró «¡Ños, ale gorąco!» en
   el glosario polaco. El polaco no abre las exclamaciones: ahora «Ños, ale
   gorąco!», y «Ños» se queda porque es la palabra que se enseña.
3. **El catálogo borraba sus nombres aunque el castellano no los tuviera.** La
   etiqueta «Malpais» traducida «Malpaís» se escapaba porque «Malpaís» es el
   nombre de dos paradas de guagua. Arreglada, encontró «Cumbre Dorsal» en
   alemán donde el castellano dice «cumbre dorsal», en minúscula: es una
   descripción, no un nombre. Ahora «zentraler Bergkamm», como «central ridge»
   en inglés y «crête centrale» en francés.
4. **En alemán**, que escribe con mayúscula todos los sustantivos, las
   palabras corrientes con tilde («die Romería») no se miraban.

Y una quinta, al repasar lo que salía: en chino no hay espacios, y «配mojo辣酱»
era para el control una sola palabra, con la latina dentro. Ahora se mira cada
tramo latino por separado.

Una lección que se repite (ya pasó con `auditar_etiquetas.js`): **un control
en verde no dice nada hasta que se le ha visto en rojo**. Las cuatro reglas
estaban escritas, comentadas y en verde.

### El mismo chip dos veces

Nuevo en `auditar_etiquetas.js`: una ficha con dos etiquetas que en algún
idioma dicen lo mismo. Pasa al poner las etiquetas —«Buceo» y «Diving» en la
misma ficha salían «Plongée · Plongée» en francés— y al traducir: «Charco» y
«Piscina Natural» eran las dos «Naturalny basen» en polaco. Hoy, 0 en los diez
idiomas.

Y una que se arregló mal la primera vez. El kayak de Los Gigantes llevaba
«SUP» y «Paddle surf», y en chino las dos eran 桨板. Para que no salieran dos
veces se dejó «SUP» sin traducir en chino, y la auditoría completa lo cazó:
`barrido_pantallas.js` vio «SUP» en letras latinas en las fichas chinas, igual
que en los idiomas latinos. `auditar_etiquetas.js` no podía verlo, porque
cuatro mayúsculas pasan por código, como «BMX». El arreglo bueno es el de
«Diving»: «SUP» y «Paddle surf» son la misma actividad, así que la ficha se
queda con «SUP», como las otras dos que la llevan, y el chino vuelve a decir
桨板.

### Lo que no se ha tocado, para que lo decida Jerome

*(Decidido el 11 de octubre: ver «Lo que no tenía fuente, decidido por
Jerome».)*

Son datos del castellano, y sin fuente no se cambian:

- **Golf Costa Adeje** dice «3 recorridos de 9 hoyos: Mar, Lago y Montana».
  «Montana» parece errata de «Montaña», pero los nombres no se han podido
  confirmar: las fuentes que salen hablan de un campo de 18 hoyos «Costa
  Adeje» y otro de 9, «Los Lagos». El inglés y el chino los traducen (Sea,
  Lake and Mountain); el resto los deja como nombres.
- **Costa del Silencio** termina en «Tendedero submarino popular.»: no se
  entiende qué quiere decir. Las traducciones lo siguen como pueden.
- **Pico del Inglés — Subida desde San Andrés** dice «Coordenadas
  verificadas por OpenStreetMap y Wikipedia». Según el LEEME de OSM, OSM no es fuente oficial.
- **Mirador del Cardón** llama al cardón «el cactus endémico más emblemático
  de Canarias»; es una euforbia, no un cactus.
- **Pesca Deportiva Los Gigantes** pone «wahoo, peto» como si fueran dos peces: son
  el mismo (el Diccionario histórico del español de Canarias da «peto» por
  wahoo).
- **PR-TF 3 · Chinamada** habla de «ovejas pediguey autóctonas»: no se ha encontrado esa
  raza.
- «Pets Friendly», en el castellano y el inglés del filtro de mascotas, se ha
  dejado como está; en polaco era lo mismo, y ahora es «Przyjazne
  zwierzętom».
- «fuerte y gustoso» → «fuerte y racheado», el viento de **El Porís de
  Abona**: las nueve traducciones ya decían racheado («gusty», «rafaleux»,
  «böig»…), así que «gustoso» era el inglés *gusty* mal pasado. Se ha
  corregido, pero conviene que lo vea.

## Lo que no tenía fuente, decidido por Jerome (11 de octubre)

El repaso del 10 de octubre dejó siete cosas sin tocar, para que las
decidiera Jerome. Las decidió con fuentes (la web oficial de Golf Costa Adeje
y sus dos recorridos, la entrevista de Andalucía Golf, Turismo de Tenerife,
Hello Canary Islands, el Jardín de Flora Canaria de la ULL, ICCAT y el
catálogo de razas del Ministerio de Agricultura), y así quedan, en los diez
idiomas:

| | decisión | qué cambia |
|---|---|---|
| 1 | **Golf Costa Adeje**: texto nuevo, solo con datos oficiales | Antigua finca de plataneras con bancales y muros de piedra; 27 hoyos = recorrido Championship (18, par 72) + Los Lagos (9, par 33); Tenerife Open del European Tour en 2021. Fuera «Mar, Lago y Montana», que no existen, y la «BMW Golf Cup» de 1999, que no sale en la web oficial, con su etiqueta «BMW Cup». La ficha de **Los Lagos**: «6 lagos», no «5 obstáculos de agua» |
| 2 | **Costa del Silencio**: fuera «Tendedero submarino popular», sin sustituto | Cada traducción había hecho de esa frase una cosa distinta: «popular diving spot» en inglés, «lugar de pesca submarina» en búlgaro y polaco |
| 3 | **Pico del Inglés**: fuera «Coordenadas verificadas por OpenStreetMap y Wikipedia», y la coordenada a fuente oficial | La frase estaba en los diez idiomas, no solo en castellano e inglés. Coordenada: ver abajo. Altitud **980 m** en las dos fichas y en el sendero PR-TF 2 de Taborno, que también decía 992: texto, nombre de la ficha de la bici, `cat` y la etiqueta «980 m» |
| 4 | **Mirador del Cardón** (Guía de Isora): fuera la ficha | No figura en el listado oficial de miradores de Turismo de Tenerife ni en otra fuente; el único con ese nombre está en Gran Canaria |
| 5 | **Pesca Los Gigantes**: solo «peto» en castellano; fuera los horarios del chárter y lo que dice de sí mismo | Peto y wahoo son la misma especie (*Acanthocybium solandri*): las traducciones ya decían un solo «wahoo». Fuera las 09:30 y 13:30, los «más de 30 años» y los «dos únicos campeonatos», el «30+ años» de la etiqueta de categoría y los chips «30 años» y «Nashira Uno» |
| 6 | **Chinamada**: fuera la granja de ovejas | «Pediguey» es casi seguro el pelibuey (la oveja Canaria de Pelo), pero nada sitúa una granja en Chinamada |
| 7 | **Filtro de mascotas**: «Con mascotas» y «Pet-friendly» | Solo castellano e inglés |

### Pico del Inglés, a la coordenada oficial

Turismo de Tenerife da para el mirador UTM huso 28 X 376352, Y 3156846.
Pasado a WGS84 con `pyproj` —EPSG:32628 y EPSG:4083, REGCAN95, dan lo
mismo— es **28.5325194, -16.2637869**: el 28.5325, -16.2638 de Jerome, a 2,5 m.
Se escribe con seis decimales (28.532519, -16.263787) en las dos fichas, el
mirador y la subida en bici, que acaba en él, con `tools/fijar_coordenada.py`,
que comprueba que cae en tierra y apunta la fuente en `datos/verificado.json`.

La bici se mueve **71 m**. El mirador, **116 m**, no 57: desde el 27 de
septiembre estaba en el pico «Pico del Inglés» de OSM, que no es el punto que
da Turismo de Tenerife. El punto oficial cae en Santa Cruz de Tenerife, el
municipio que dice la ficha de la bici (`python3 tools/municipio.py --punto
28.532519,-16.263787`, contra el polígono del Cabildo).

### Lo que la ficha retirada se llevó consigo

- Sale de `index.html`, de los nueve idiomas y de su bloque polaco.
- Sus etiquetas «El Cardón» (declarada como nombre) y «Cardones» no las usaba
  ninguna otra ficha: fuera. Y «canariensis», aceptada en
  `castellano-aceptado.json` solo por ella, también: `castellano_suelto.js`
  la cantó como sobrante, que es para lo que está.
- **975 → 974 lugares**, a mano y con su porqué en `auditar_datos.js`, en el
  schema.org (`featureList`) y en un comentario del código. El comentario lo
  encontró el control de cifras exactas: un «975 lugares» escrito en cualquier
  sitio del fichero cuenta.

### El «wahoo» en las otras dos fichas de pesca

La regla de Jerome —wahoo en inglés, peto en castellano— vale también para
**Puerto Colón** y **Los Cristianos**, que decían «wahoo» en el texto
castellano. Ahora dicen «peto», y el chip castellano «Wahoo» de las tres es
«Peto». Los otros idiomas siguen con wahoo; el chip búlgaro decía «Вахо» y su
propia descripción «уаху»: ahora «Уаху».

### El filtro de mascotas y la huella

Jerome escribió «Con mascotas 🐾». El grupo ya pinta su icono 🐾 **delante** del
rótulo, en el panel y en la pestaña, así que con la huella dentro del texto
saldría «🐾 Con mascotas 🐾». El rótulo es el texto y en pantalla sale
**«🐾 Con mascotas»** y **«🐾 Pet-friendly»**. Se cambió también
`catGrpMascotas`, una clave que ya no usa nadie, para que no quede
«Pets Friendly» en ninguna parte.

### Y de paso

- El chino llamaba al Pico del Inglés de dos maneras: 英格勒斯峰 en la bici y
  英国人峰 en el sendero de Taborno. Ahora las dos 英格勒斯峰, que es como la
  app escribe los nombres propios (transcritos: 塔沃尔诺, 塞科谷).
- `REVISION-LUGARES.md` llevaba sin regenerarse desde el 27 de septiembre:
  decía 146 coordenadas verificadas y en el registro había 156. Regenerado,
  con las dos de hoy: 157.
- Las etiquetas «Teide» y «Fañabé» de Golf Costa Adeje no salen en el texto
  oficial nuevo. No se han tocado: lo decide Jerome.

## El tour de bienvenida, rehecho (11 de octubre)

Jerome: «Prepara el tour de nuevo que añadimos cosas. Verifica que se traduce
en cada idioma. Sin errores. Animado pero explícito».

### Lo que decía el de antes

- «**Más de 700 lugares verificados**», con 975 en el mapa, y sin poder decir
  «verificados» de todos.
- «Cada punto tiene **fotos**, descripción, **el tiempo allí** y cómo llegar»:
  las fotos solo salen en algunas categorías, y el tiempo del sitio solo en la
  costa (el mar, el viento y el UV).
- «Filtra: naturaleza, **gastronomía**, cultura, deporte»: gastronomía no es
  ningún grupo del filtro.
- Nada de lo nuevo: ni las gasolineras con su precio oficial ni el botón ⛽.
- Los textos de los pasos iban en **listas dentro de un objeto propio**, y
  ninguna lista la leía ningún control de idioma. Por eso estuvieron un mes
  así sin que nada lo viera.

### El de ahora

- **13 pasos.** Nuevo el del botón ⛽ de la gasolinera más barata, con la
  etiqueta «Nuevo». Los demás, reescritos para decir **qué hace cada botón y
  cómo**, y nada que no sea verdad: en la costa, el estado del mar; en
  cualquier marcador, qué es, su horario si lo tiene y cómo llegar en coche o
  en guagua.
- **Las cifras se cuentan** al abrir cada paso: los lugares del mapa (974),
  los idiomas (10), las costas del panel del mar (7) y los pasos (13). En
  polaco, el número de lugares lleva sus tres formas de plural.
- **Animado**: el foco late alrededor del botón, la tarjeta entra en cada
  paso, el icono salta, una barra de progreso se llena arriba y «Nuevo»
  brilla. Con «reducir movimiento» del sistema, todo quieto.
- **Explícito**: «4/13» en cada tarjeta, flechas del teclado y Escape.
- **Quien vio el tour de antes** lo ve ofrecido una vez más, como «¡Hay
  novedades!». Se guarda la versión vista; las herramientas que lo saltan
  guardan «99».
- **Los textos son 37 filas de `UI_TX`** en los diez idiomas, que leen ya
  todos los controles de idioma (`castellano_suelto.js`, `auditar_idioma.js`,
  `barrido_idiomas.js`…). Los que estaban bien se han conservado: el mismo
  «Marker» o «marqueurs», y en el título de los logros, el nombre que el
  botón ya tenía en cada idioma.

### Tres fallos que salieron al probarlo

1. **«En las 0 costas».** `MAR_COSTAS` no es global: vive dentro del bloque
   del mar. El tour lee el número por la única salida de ese bloque,
   `window.TGO_MAR.costas`, como pide su propio comentario.
2. **El hueco del paso 12, abierto en el 13.** En el último paso no hay botón
   que señalar, pero el estilo en línea del paso anterior seguía mandando y
   los trofeos se veían sin oscurecer detrás de la tarjeta. **Ya pasaba en
   el tour de antes.**
3. **«Los geht's!» partido en dos líneas** en un móvil de 320 px: el botón
   «Saltar» del último paso estaba oculto pero ocupando su sitio.

El primero lo destapó el propio control nuevo, que no encontraba
`MAR_COSTAS` para comparar. Los otros dos no los veía: salieron en las
capturas de pantalla. Ahora el control mira las dos cosas, y se ha probado
devolviéndolas a su sitio (abajo).

### Y el asistente decía lo mismo

La respuesta de ayuda del asistente («Tenerife GO en 30 segundos», en
`CHAT_KB`) repetía los dos errores: «700+ lugares» y «en cada ficha: clima
actual, audio». La ficha no lleva ni tiempo ni audio. Ahora dice lo mismo que
el tour. Sigue **solo en castellano**, como todo `CHAT_KB`, y las respuestas
traducidas no tienen ninguna de ayuda: quien escribe «tutorial» o «manual» en
otro idioma recibe esta, en castellano. Pasarla a la base traducida, en los
diez idiomas, queda propuesto.

### El control nuevo: `tools/auditar_tour.js`

En `auditar.sh`, después del barrido de pantallas. Abre la app como alguien
nuevo en cada idioma (elige el idioma en la bienvenida y entra) y recorre el
tour entero en **cuatro tamaños de móvil** (320×568, 360×640, 390×844 y
412×915). En cada paso mira que el texto no tenga nada por sustituir, que el
foco caiga en su botón, que la tarjeta quepa entera en la pantalla sin
taparlo, que no se salga ni se parta ningún texto y que no quede abierto el
hueco del paso anterior. Comprueba las cifras contra la propia app, que al
terminar quede guardada la versión y que quien vio el tour de antes vea las
novedades. Y al final compara los idiomas entre sí: **nada igual al
castellano** en los otros nueve **ni al inglés** en los otros ocho, porque si
a una fila le falta un idioma, `tx()` pone el inglés y todo lo demás daría
verde. Tarda unos dos minutos y medio.

| # | avería | canta |
|---|---|---|
| 1 | al paso de la gasolinera le falta el polaco | sí: sale el inglés, «igual que el inglés» |
| 2 | el paso de la gasolinera apunta a un botón que no existe | sí: foco en el centro |
| 3 | vuelve el hueco del paso 12 abierto en el 13 | sí |
| 4 | vuelve «Los geht's!» partido en dos líneas | sí: alemán, 320 px |
| 5 | al terminar se guarda la versión vieja | sí: «1» |
| 6 | el título del dado en castellano, en italiano | sí: «igual que el castellano» |
| 7 | «{N}» en vez de «{n}» en el castellano | sí: texto roto, y no dice los 974 lugares |
| 8 | la tarjeta se pone encima del botón | sí: «tapa el botón que señala» (la primera vez tumbó la prueba: ahora un botón que no se puede pulsar se apunta y se sigue) |
| 9 | quien vio el tour viejo recibe la pregunta de alguien nuevo | sí: sin la etiqueta de novedades |

## El asistente, entero en los diez idiomas (12 de octubre)

Jerome: «Es más que importante de traducir toda hasta el tout».

### Lo que había

El asistente tenía **dos** bases de respuestas. Las 69 de `faq/<idioma>.json`,
en los diez idiomas, y `CHAT_KB`: **79 respuestas escritas solo en castellano**
dentro de `index.html`, que el buscador miraba **en cualquier idioma**. Bastaba
con que una de ellas sumara un punto más que la traducida para contestar en
castellano. Lo hacían, entre otras, «Teide» o «Anaga» en alemán, «help» en
inglés y, sin que nadie escribiera nada, **el botón «Meilleures plages»** del
francés (y sus equivalentes en los otros ocho idiomas): los botones de
sugerencia mandan por dentro la consulta en castellano («mejores playas»), y
esa consulta caía en la respuesta castellana de las playas.

### Antes de traducir, comprobarlo todo

Traducir `CHAT_KB` tal cual habría puesto en diez idiomas lo que no era
verdad. Cada respuesta se miró contra el código (las de la app) o contra
fuente oficial o la ficha del propio lugar (las de viaje). Lo que estaba mal:

| decía | lo que hay |
|---|---|
| «toca el **corazón**» para guardar un favorito | en el globo es la estrella ☆ «Añadir a favoritos»; el corazón es el de la barra de abajo |
| «cuantos más lugares **(y más variados)** visites, más trofeos» | los logros solo cuentan cuántos, y hay uno especial por la cumbre del Teide |
| «**cada ficha** tiene el botón Escuchar» | lo tiene el globo, y solo si el móvil tiene voz para ese idioma |
| «instálala y va **100 % offline**» | funciona sin red una vez abierta con conexión, instalada o no; lo en directo no |
| «despliega los **38+ tipos** de lugar» | cifra sin contar: no se escribe |
| «en la ficha, **el tiempo que hace AHORA** allí» · «cada ficha muestra el tiempo real de ESE punto» | el tiempo está en el termómetro de arriba, por zonas; en el globo, solo el mar en la costa |
| «cuando AEMET emite avisos, **la app los refleja**» | ver «Para Jerome», abajo: no llegan |
| «están en **78** lugares sensibles» | son 116, contados; no se escribe la cifra |
| el planificador: «eliges zona — **Norte, Sur o Mezcla**» | se elige el tiempo que tienes, qué te apetece y cómo te mueves |
| la cuenta: «**solo pedimos el email**» | email y contraseña |
| «si me sueltas una palabra canaria, **te la explico**» | el asistente no lee el glosario; tiene la respuesta de palabras canarias |
| «si instalaste hace tiempo, **borra y vuelve a añadir**» | la app avisa «Nueva versión disponible» y se recarga |
| la tienda: «hay excursiones con guía, transporte y seguro: Teide, ballenas, **Masca, estrellas**» | todo está «PRÓXIMAMENTE», no se puede reservar ni pagar, y ni Masca ni estrellas existen |
| banderas: «roja, prohibido; amarilla, precaución» | la app ya tiene la leyenda oficial en el globo de cada playa (Protección Civil; el Decreto 116/2018 está anulado): se usa esa |
| la 111: «**ya no entra** en la terminal del Aeropuerto Sur» | los datos oficiales de TITSA de la app la ponen en la parada de la terminal, la misma que la 10 y la 40, y también en el Enlace: no se pudo saber qué expedición para dónde, y se quedó solo lo seguro |
| precios (bono 10 €, ten+ 2 €, teleférico 23,50 €, Barranco del Infierno 13 € —la ficha dice 11 €—, Twin Ticket 78 €…), horarios, empresas recomendadas, «el mejor parque acuático del mundo según TripAdvisor» | fuera: la misma política que el bloque C1, que llegó así |

### Lo que hay ahora

- **121 respuestas en cada idioma** (las 69 de antes y 52 nuevas), en
  `faq/fuente/` con el mismo formato que los bloques que llegaron: **G1** la
  app (22), **H1** seguridad y salud (7), **H2** comer y beber (7) y **H3**
  planes, naturaleza y clima (16). Cada entrada lleva en `comprobado` de dónde
  sale cada dato. El búlgaro, en `faq/fuente/bg/`, como siempre.
- De las 79 de `CHAT_KB`: **24** eran preguntas que ya estaban traducidas y se
  quitan sin más; **53** pasan, como 52 entradas, a los bloques nuevos; **2**
  eran de lugares concretos (el Paisaje Lunar; Siam Park y Loro Parque) y las
  contesta su ficha del mapa, que ya está en los diez idiomas. `CHAT_KB` ya no
  existe, y el buscador tiene una sola fuente.
- **Claves de búsqueda que se habrían perdido** al quitarla («bus», «tram», «la
  gomera», «ballena», «siesta»…): 48 en castellano para entradas de los
  bloques que llegaron, en `faq/fuente/claves/es.json`, aparte, porque esos
  bloques se quedan como llegaron; las de las entradas nuevas, dentro de su
  bloque. De paso, 6 en chino y polaco para «aeropuerto Sur/Norte». De las
  **471 claves** que tenía `CHAT_KB`, **430** siguen llevando a una respuesta;
  las **41** que no, a propósito: palabras sueltas que se llevarían otras
  preguntas («coche», «sol», «seguro», «buscar», «comprar», «chino», «tour»),
  nombres de empresa («fred olsen», «twin ticket») y lo que no se pudo
  comprobar (las propinas, las autocaravanas, «alertas aemet»).
- **La de «algo falla»** lleva debajo el botón para escribirle a Jerome, como
  antes: `"contacto": true` en el bloque, `"c": 1` en el fichero.
- **Los botones que citan las respuestas son los de la pantalla**, en cada
  idioma: «Añadir a favoritos», «Zu Favoriten hinzufügen», «加入收藏»… 390
  citas, comprobadas.
- **Las zonas en cada idioma.** La bienvenida francesa invita a pedir «plages
  dans le nord», pero el asistente solo entendía norte/sur en castellano e
  inglés y devolvía la isla entera. Ahora cada idioma trae sus zonas en
  `faq/fuente/intenciones/` («nord», «im Süden», «na północy», «北部»…). En
  francés «est» es también el verbo de «où est…»: solo cuenta como zona si es
  la respuesta entera.
- **Textos fijos del asistente:** «{N} lugares **verificados**» en los diez
  idiomas, lo mismo que se quitó del tour, ya no lo dice. Y el **polaco** tiene
  tres plurales: con 974 lugares decía «974 miejsc» y es «974 miejsca». La
  bienvenida, la cuenta y la respuesta de «no sé» llevan las tres formas, y
  `chatFmt` coge la del número, como `tx()`. «Tienes 1 lugares» tampoco sale ya
  en ningún idioma.

### Encontrado de paso, y arreglado

**«Instalar la app» en francés y alemán, sin acentos ni diéresis:** «(carre
avec fleche)», «Sur l’ecran d’accueil», «waehle», «Oeffne… das Menue». Se
escribió así «para evitar problemas de codificación» que el fichero no tiene.
Corregido, y con control nuevo (`tools/auditar_letras.js`): busca formas que
no existen en ningún idioma de la app escritas así. Sobre el fichero de antes
encuentra las 9.

### Los controles

- `auditar_faq.js`: que **nadie vuelva a meter** una base de respuestas fuera
  de `faq/` (ni `CHAT_KB` ni `answer:'…'` escrito en el núcleo); que **ninguna
  respuesta ni rótulo** sea el del castellano en otro idioma ni el del inglés
  fuera del inglés; que **cada botón citado** siga llamándose así en la
  pantalla de ese idioma; y, ahora como fallo, que **el botón de seguimiento de
  cada entrada lleve a ella** (antes se toleraba que cayera en otra; al meter
  las 52 nuevas salieron 4, todas por claves nuevas, y se arreglaron).
- `probar_faq.js`: de 28 a **66** preguntas: lo que antes contestaba `CHAT_KB`
  en castellano, una por idioma, y las zonas de los diez idiomas.
- `probar_movil.js`, la app entera en un móvil: de 3 a **9** consultas (el
  botón «Meilleures plages», «help», «Teide» en alemán, el botón de contacto,
  el plural polaco de la bienvenida…), y ahora **dentro de `auditar.sh`**.
- `castellano_suelto.js` en verde: las palabras canarias que las respuestas
  citan a propósito («picón», «panza de burro», «ños» del glosario, «conejo en
  salmorejo»…) van en `idiomas/castellano-aceptado.json`, cada una solo para su
  respuesta.

| # | avería | canta |
|---|---|---|
| 1 | la respuesta alemana del Teide, la del castellano | sí: «la respuesta es la del castellano» |
| 2 | el rótulo italiano de la calima, el del inglés | sí: «el rótulo es el del inglés» |
| 3 | el botón «Zu Favoriten hinzufügen» cambia de nombre en la app | sí: las dos respuestas que lo citan |
| 4 | vuelve `CHAT_KB` a `index.html` | sí, por las dos reglas |
| 5 | una clave nueva le roba a tei-14 su botón «¿Puedo ir con niños?» | sí |
| 6 | la bienvenida polaca vuelve a una sola forma («974 miejsc») | sí: «974 pide miejsca» |
| 7 | la de «algo falla» pierde el botón de contacto | sí: «falta el botón de escribirle a Jerome» |

### Para Jerome

1. **Los avisos de AEMET no llegan.** El módulo los pide desde el navegador a
   `aemet.es/xml/municipios/localidad_38038.xml`, que es la previsión de un
   municipio, no los avisos, y AEMET no contesta a peticiones de otra web. No
   enseña nada falso (si no llega nada, no pinta nada), pero la función no
   funciona. El asistente ya no la promete.
2. **La respuesta exc-03** (bloque E2, tal como llegó) dice «guarda los sitios
   en favoritos y **te los ordeno por distancia**»: el asistente no ordena
   favoritos. No se ha tocado; propongo quitar esa frase.
3. **Dos fichas dicen que Anaga es «Patrimonio Mundial» / «Patrimonio de la
   Humanidad»** (`bici-anaga-cruz-carmen`, `acc-sendero-sentidos`): Anaga es
   Reserva de la Biosfera. Sin tocar hasta tu OK.
4. El schema.org que leen los buscadores dice «más de 700 lugares
   **verificados**» y «alertas meteorológicas», y su lista de idiomas no tiene
   el polaco.
5. «socorro» a secas abre la ficha de la Playa El Socorro (gana el nombre del
   sitio); «pedir socorro», «emergencia» o «112» van a la de emergencias.


## Los cinco puntos del 12 de octubre por la tarde

Jerome contestó a los cinco «Para Jerome» de la sección anterior. Están los
cinco hechos, en los diez idiomas y con control.

### 1 · Los avisos de AEMET, que de verdad funcionen

> «¿Cómo no funciona? La tenemos por meses ahí y no viste que no funciona.
> Soluciónalo. ¿Y cómo deja datos correctos si no tiene acceso?»

**Por qué no funcionó nunca.** La app pedía desde el navegador
`aemet.es/xml/municipios/localidad_38038.xml`, que es la previsión de Santa
Cruz y no trae avisos; y aemet.es no deja que otra web lea sus ficheros (no
manda cabeceras CORS). La petición fallaba siempre, la lista salía vacía y la
píldora no salía nunca. «No hay avisos» y «no funciona» se pintaban igual:
nada. Por eso nadie lo vio.

**Lo que hay ahora.**

| pieza | qué hace |
|---|---|
| fuente | el canal oficial y sin clave del Plan Meteoalerta para **la isla de Tenerife**: `CAP_AFAP6596_RSS.xml` (listado en aemet.es/es/rss_info/avisos/coo). Su primer elemento es un `.tar.gz` con todos los avisos vigentes en CAP 1.2 |
| formato | Plan Meteoalerta, anexo 3 (`METEOALERTA_ANX3_CAP.pdf`, 31-may-2022): nivel verde (= sin aviso), amarillo, naranja o rojo; 9 fenómenos en Canarias; zonas 659601 Norte, 659602 Área metropolitana, 659603 Este, sur y oeste, y con una C, su costa; un mensaje que caduca al emitirse es una retirada, no un aviso |
| `.github/workflows/avisos-aemet.yml` | 24 líneas de cron (minuto :41), una por hora, como las gasolineras |
| `tools/avisos_aemet.py` | baja el canal y el `.tar.gz`, quita los verdes, las retiradas, los sustituidos y los caducados, y escribe `datos/avisos-aemet.json` con la hora de la comprobación. **Si algo falla no escribe nada.** Si AEMET dice «No hay avisos» y aquí sale alguno, para. Sin cambios, solo reescribe cada 3 horas para renovar la hora |
| la app | lee `datos/avisos-aemet.json` de su propio dominio (red primero en `sw.js`). Píldora del color del peor aviso solo cuando hay alguno; panel con nivel, fenómeno, parámetro, zona y horas en el idioma de la app; el texto de AEMET en inglés para el inglés y en castellano para los demás, y la etiqueta lo dice. Una línea en el panel del tiempo 🌡️ y los costeros en el del mar 🌊 |

**Sin acceso (la pregunta de Jerome).** No se inventa ni se rellena nada:

- si GitHub no puede bajarlo, el fichero se queda con su última comprobación
  buena **y su hora**;
- la app enseña siempre esa hora («Comprobado: 16:41»); a las **6 horas** sin
  comprobar deja de decir «sin avisos» y dice «No se han podido comprobar los
  avisos desde las 10:41: puede haber cambios», con el enlace a aemet.es;
- cada aviso lleva su fin oficial, y la app lo quita a su hora con el reloj del
  móvil aunque el fichero no se haya renovado;
- si el fichero no llega (sin red y sin copia), lo dice y manda a aemet.es.

AEMET sale de la CSP y de la política de privacidad: el móvil ya no le pide
nada, así que ya no recibe ni la IP.

**Probado.** El flujo, lanzado a mano en GitHub el 12/10 a las 15:19 UTC: bajó
el canal de verdad, lo leyó y, sin cambios, no reescribió («la última
comprobación escrita es de hace 27 min»). `tools/probar_avisos_aemet.py`:
**24 de 24** con copias reales de AEMET guardadas en `tools/pruebas/aemet/` (el
estado de Tenerife del 11/10 y un aviso amarillo real de Mallorca puesto en
una zona de Tenerife). `tools/probar_avisos.js`: **75 de 75** en un navegador,
en los diez idiomas. Fallos metidos a propósito:

| # | avería | canta |
|---|---|---|
| 1 | sin la regla de las 6 horas | sí, 9 casos («dice que no se ha podido comprobar», «NO dice sin avisos») |
| 2 | un aviso se enseña después de su fin | sí, 2 |
| 3 | el nombre alemán de «lluvias» en castellano | sí: «sin rótulos en castellano» |
| 4 | el inglés recibe el texto en castellano | sí |
| 5 | «sin avisos» aunque la comprobación sea vieja | sí, 3 |

### 2 · El asistente ordena los favoritos

exc-03 decía «guarda los sitios en favoritos y te los ordeno por distancia
para no cruzar la isla dos veces», y no sabía. Ahora «ordena mis favoritos por
distancia» (y «favoritos cerca de mí», «sort my favourites», «按距离排列我的收藏»…,
en los diez idiomas) los pone en orden **desde donde está la persona**: cada
vez el más cercano de los que quedan, y luego se deshacen las idas y vueltas
(2-opt: si dar la vuelta a un tramo acorta el recorrido, se le da; el
recorrido resultante no se cruza). Sin ubicación, o si el navegador no
contesta en 8 segundos, empieza por un extremo y lo dice. Distancias en línea
recta, y lo dice. Sin favoritos, dice el botón con su rótulo de la pantalla.
«Favoritos» a secas sigue explicando cómo se guardan (app-02), que ahora lleva
el botón «Ordena mis favoritos por distancia» (app-23, nueva: 122 respuestas).

`probar_faq.js`: 17 frases en los diez idiomas. `probar_movil.js`: 6 casos en
un navegador, con un oráculo que no usa el código de la app (están todos, el
recorrido no es más largo que el de «el más cercano cada vez» y no se cruza).
Fallos metidos: sin la mejora 2-opt (canta el caso de seis favoritos buscado
entre los lugares reales donde «el más cercano» se cruza), sin el límite de 8
s, sin el vocabulario de los otros ocho idiomas, y el orden al revés. Los
cuatro, en rojo.

### 3 · Anaga es Reserva de la Biosfera, no Patrimonio Mundial

`bici-anaga-cruz-carmen` y `acc-sendero-sentidos`, en los diez idiomas: «Reserva
de la Biosfera de la UNESCO desde 2015» (Ministerio para la Transición
Ecológica, programa MAB, ficha «Macizo de Anaga»: declarada el 9 de junio de
2015), con los mismos términos que ya usaba la ficha de Anaga en cada idioma.
En Tenerife son Patrimonio Mundial La Laguna (1999) y el Parque Nacional del
Teide (2007). Control nuevo en `auditar_datos.js`: ninguno de los 58 lugares de
Anaga puede decir «Patrimonio Mundial» en ningún idioma (probado metiendo
«UNESCO-Weltnaturerbe» en el alemán: canta).

### 4 · El schema.org

`inLanguage` con `pl`; «más de 700 lugares verificados» → «974 lugares»;
«alertas AEMET» → «avisos meteorológicos de AEMET», que ahora es verdad.
Controles nuevos en `auditar_datos.js`: ninguna cifra redonda de lugares en lo
que se lee (va la contada), la cabecera no dice «verificados», y el schema.org
declara todos los idiomas de la app. Probado con el texto viejo: los tres cantan.

### 5 · «socorro»: el asistente propone y la gente elige

Cuando lo escrito es a la vez una palabra de emergencias y el nombre de un
lugar («socorro»: dos playas y un sitio de surf), propone 📞 Llamar al 112,
🆘 Emergencia y 🏄 Playa El Socorro, en el idioma de la app; primero lo de la
emergencia, por si lo es. «pedir socorro», «auxilio», «emergencia», «112»,
policía, bomberos, accidente… van directos al 112, en los diez idiomas
(«socorro» y «auxilio» también fuera del castellano, por si un turista los
escribe). No se ha quitado ninguna palabra de las que ya había. 7 casos en
`probar_movil.js`, con los botones pulsados.

### Lo que Jerome contestó, hecho el mismo día

1. **Tejina.** La ficha `nucleo-tejina` decía «(septiembre, Patrimonio de la
   Humanidad UNESCO), espectacular tradición popular única en el mundo», en
   los diez idiomas. Jerome trajo la fuente: **Decreto 71/2003, de 12 de mayo,
   por el que se declara Bien de Interés Cultural, con categoría de ámbito
   local, la Fiesta de los Corazones de Tejina** (BOC n.º 102, de 29 de mayo
   de 2003, disposición 931). Comprobado en el propio BOC, bajado desde
   GitHub: el índice de ese número trae la disposición 931 con ese título,
   palabra por palabra, y el decreto dispone «Declarar Bien de Interés
   Cultural con categoría de Ámbito Local, la Fiesta de los Corazones de
   Tejina» («Dado en Las Palmas de Gran Canaria, a 12 de mayo de 2003»). La
   fecha está en su anexo: «en el día de su patrono, San Bartolomé, el 24 de
   agosto». La ficha dice solo «agosto», como quiso Jerome, para no fijar un
   día. Texto nuevo de Jerome en ocho idiomas; el búlgaro y el polaco,
   traducidos de su castellano con los términos que ya usaba la ficha. Fuera
   «septiembre», «UNESCO» y «única en el mundo» (ninguna fuente lo respalda);
   la etiqueta «UNESCO» pasa a «San Bartolomé», traducida en los nueve
   ficheros de etiquetas. Control: `auditar_datos.js` canta si la ficha vuelve
   a citar la UNESCO o el Patrimonio Mundial en cualquier idioma o en las
   etiquetas (probado metiendo el chino viejo y la etiqueta: canta las dos).
2. **«ayuda» a secas** (Jerome: «sí»): «ayuda», «¡ayuda!», «necesito ayuda»,
   «help», «Hilfe», «aide», «aiuto», «hulp», «pomoc», «помощ», «帮助»… escrito
   solo, propone 📞 Llamar al 112, 🆘 Emergencia y ❓ Ayuda con la app, en el
   idioma de la app. Frases enteras: «pedir ayuda» va directo al 112 y «ayuda
   con la app» a cómo funciona. Ninguna palabra de emergencia se ha quitado.
   `probar_faq.js` 19 frases (102 de 102); `probar_movil.js` 4 casos (25 de
   25). Fallos metidos: sin la regla, sin el vocabulario de los otros ocho
   idiomas, y los botones en otro orden: los tres en rojo.

### Visto al hacer las capturas para Jerome

1. **Un emoji repetido en dos botones, en los diez idiomas.** El botón «Cómo
   llegar en bus» de cada ficha decía «🚏 🚏 Cómo llegar en bus» desde el 18
   de septiembre: el botón trae su 🚏 y `openDetailSheet` le ponía
   `nearbyHowToBtn`, que trae otro (es el texto del globo y de la lista de
   cerca, donde va solo). Ahora le pone la fila de su `data-tx`
   (`detComoLlegarBus`), la misma que pone el cambio de idioma. En alemán esa
   fila decía «Mit dem Bus hin»; pasa a «Mit dem Bus dorthin», que es lo que
   se leía hasta hoy. En la tienda, el botón de la cesta vacía decía «🛒 🛒»:
   ahora «🛒 0», como al cargar la página.
   Control nuevo en `barrido_pantallas.js`: un botón o enlace con el mismo
   emoji dos veces seguidas, en cada pantalla, en cada ficha y en su globo.
   Son dos nodos de texto, así que el barrido de textos no podía verlo. Con la
   versión de antes canta los dos, en castellano y en alemán («🚏 🚏» en las 44
   fichas que abre); con la de ahora, 0. Probado además en el navegador: un
   solo 🚏 y en su idioma en los diez, también al cambiar de idioma con la
   ficha abierta.

### Para Jerome

1. **GitHub no lanza los cron a su hora** (lo mismo que con las gasolineras): la
   comprobación de avisos es «más o menos cada hora». Si algún día se retrasa
   más de 6 horas, la app lo dice.
2. **El botón «Cómo llegar en bus» de la ficha** dice ahora lo de su fila,
   también en inglés, francés, italiano, neerlandés y chino («Get there by
   bus», «Y aller en bus», «Come arrivare in autobus», «Met de bus
   ernaartoe», «乘公交前往», «搭公車前往»), y no el texto del globo («How to
   get there by bus», «Comment y aller en bus»…). Las dos son traducciones
   buenas; si prefieres las del globo, es cambiar la fila.

## El tour explica el botón Rutas (12 de octubre, por la noche)

Jerome: «El tour debería explicar más sobre el botón ruta y sus funciones».

**Los pasos nuevos.** El tour pasa de 13 a 17 pasos (los cuenta `STEPS`; la
pregunta del principio dice el número sola). Detrás de «Tu barra de viaje»:

1. **El botón Rutas**, con el foco en el botón de la barra: las tres
   herramientas.
2. **Organiza tu día**: el tour abre el panel en esa pestaña y la señala.
   Tiempo, qué te apetece y cómo te mueves; itinerario ordenado por
   cercanía, con pausa para comer si es medio día o día completo; cambiar
   paradas, guardar, compartir y GPX.
3. **Ruta del día**: Norte, Sur o Cumbre; «+» para añadir; «Mi ruta»
   numerada; centrar en el mapa o ver la información; 🗓️+ trae aquí el
   itinerario de «Organiza tu día».
4. **De A a B**: origen y destino tocando un marcador, escribiendo una
   dirección o con el GPS; en coche, minutos y kilómetros; en guagua, la
   línea de TITSA, el transbordo si hace falta y lo que se camina; si a esa
   hora no pasa ninguna, su horario.

Cada frase está comprobada contra el código, y cada pestaña se nombra como
sale en pantalla en cada idioma. El tour cierra el panel al pasar a otro
paso, al saltarlo y al terminar, si lo abrió él. En 320×568 los textos de
«Organiza tu día» y «A→B» no cabían en francés, alemán y neerlandés (la
tarjeta tapaba la pestaña): se acortaron en los diez idiomas sin quitar
ninguna función.

**Lo que salió al usar Rutas de verdad.** Para escribir el tour hubo que
usar cada pestaña con datos, y eso no lo hacía ningún control:

1. **De noche, «A→B» decía que no había guagua entre La Laguna y el Puerto
   de la Cruz.** El planificador solo miraba las 8 paradas más cercanas al
   origen y al destino, y en el centro de La Laguna las 8 son de guaguas
   urbanas: la 102, que circula hasta las 23:40, no entraba. Ahora mira, de
   cada línea, su parada más cercana a pie. A horas fijas, antes → ahora:

   | Trayecto | Hora | Antes | Ahora |
   |---|---|---|---|
   | La Laguna → Puerto de la Cruz | 21:55 | ninguna | 102 |
   | La Laguna → Puerto de la Cruz | 03:00 | ninguna | 104 (nocturna) |
   | La Laguna → Puerto de la Cruz | 10:00 | 206 + 100, ~80 min | 100 directa, ~73 min |
   | Los Cristianos → Santa Cruz | 12:00 | 112 + 909, ~93 min | 112 directa, ~90 min |

   Cada plan tarda 50 ms como mucho.
2. **Y lo decía con la frase de la guagua del Teide**: «La guagua 206, 104,
   100, 203, 204, 271 al Teide sale una vez al día y ya ha salido hoy ().
   Mañana vuelve a haber.» Falsa para esas líneas, con la hora vacía, y la
   104 todavía no había salido. Ahora dice el horario de las líneas que unen
   los dos puntos, sacado de sus datos: «100 (06:15–21:30) · …», y la del
   Teide «348 (09:30, vuelta 16:00)», con «vuelta» traducida.
3. **En castellano en los diez idiomas**: «Toca un marcador del mapa como
   Origen»; «Calcular ruta» en cuanto se calculaba una; «No hay paradas a
   menos de 2 km del origen» (ahora con el tope del código, 2,6 km a pie);
   el texto que se comparte del itinerario («Mi día en Tenerife — », sin la
   duración), y «transbordo». Y «min» escrito a mano en el trayecto en
   guagua y en las paradas del itinerario: en chino y en búlgaro no es su
   unidad (分钟, 分鐘, мин). Y el coche ponía los kilómetros con punto en
   todos los idiomas («35.2 km» en castellano) y la estimación sin conexión
   como «50~ min»: ahora «35,2 km» con la coma o el punto de cada idioma, y
   «~50 min».
4. **La pestaña «Organiza tu día» tenía dos rótulos que se pisaban**
   (`dpTitulo` y `tabPlanner`): se veía siempre el primero, y el asistente
   citaba el segundo, «Tag planen» por «Plane deinen Tag», y lo mismo en
   francés, italiano y chino. Fuera `tabPlanner`. Con ellos salieron otros
   rótulos que el asistente citaba con un nombre que no sale en pantalla
   («Uitkijkpunten», «Punti Panoramici», «Cómo llegar» en neerlandés y
   chino): 15, corregidos. Y mov-08 decía «Toca “Cómo llegar” en cualquier
   ficha y te calculo la ruta real»: ese botón de la ficha enseña las
   paradas cercanas. La ruta en coche es «🚗 Cómo llegar en coche», en el
   globo, y se abre en Google Maps o, en iPhone, en el mapa de Apple.
   Corregida en los diez idiomas.
5. **Un fallo mío por el camino**: al quitar la frase del Teide se fue
   también la fila de «No hay líneas que conecten estos dos puntos», que iba
   en la misma línea. Lo vio el recuento de filas; ahora lo ve un control.

**Controles nuevos**, cada uno probado metiendo el fallo:

- `tools/probar_rutas.js`, 98 casos: trayectos conocidos a hora fija y, en
  los diez idiomas, lo que se ve al usar A→B (aviso, botón, sin parada,
  fuera de horario, ninguna línea, minutos, kilómetros del coche) y lo que
  se comparte del itinerario. Volver a las 8 paradas, el botón en castellano y la frase del
  Teide: los tres en rojo.
- `barrido_pantallas.js`: seis estados de Rutas usadas (itinerario y lo que
  se comparte, ruta del día con paradas, A→B eligiendo origen, calculada,
  sin parada cerca y fuera de horario); 82 pantallas por idioma. Con la
  versión de antes canta los cinco textos en castellano. «Toca», «marcador»
  y «origen» entran en su lista de palabras: «Toca un marcador del mapa como
  Origen» no llevaba tilde ni ninguna de las que había.
- `auditar_tour.js`: espera a que el panel haya entrado para medir, y mira
  que se cierre al terminar y al saltar el tour.
- `auditar_faq.js`: todo lo que una respuesta cita entre «» y es un rótulo
  de la app tiene que salir con el rótulo de cada idioma, aunque no esté
  declarado en el índice (198 citas). Con la base de antes, 5 en rojo.
- `tools/auditar_claves_tx.js`: cada `tx('…')` con la clave escrita tiene
  su fila (153). Quitando otra vez la de «No hay líneas…», en rojo.

### Para Jerome

1. *(Hecho el 13 de octubre: ver «Organiza tu día», más abajo.)*
   **Entre parada y parada, el itinerario de «Organiza tu día» pone siempre
   el mismo tiempo**: «En guagua ~25 min», «En coche ~15 min», «A pie ~15
   min», «En bici ~20 min». No se calcula: es un rótulo fijo, y del Teide a
   Arico en guagua «~25 min» es falso. Propuesta: calcularlo con lo que la
   app ya tiene. En coche, la misma estimación que usa A→B sin conexión; a
   pie, la distancia por 1,3 a 4,5 km/h, como el planificador de guaguas;
   en guagua, ese planificador entre las dos paradas, y si no hay guagua,
   decirlo; en bici no hay velocidad comprobada, así que solo los
   kilómetros. Por eso el tour no habla de esos tiempos.
2. **El tour no se vuelve a ofrecer** a quien ya vio el de ayer: sigue en la
   versión 2. Para que salga a todos como novedad hay que cambiar también la
   frase de novedades, que hoy habla de la gasolinera más barata.
3. **El planificador de guaguas busca como mucho un transbordo**. Los
   Cristianos → Masca dice «No hay líneas que conecten estos dos puntos»,
   y con dos transbordos se llega: hay 26 combinaciones en los datos, por
   ejemplo 473 → 460 → 355.

## Senderismo, en la pestaña Deporte (13 de octubre)

Jerome: «Senderismo quiero la categoría en deportes». En el botón de
categorías, Senderismo deja la pestaña «Naturaleza & Playas» y pasa a la
primera de «Deporte», en los diez idiomas (las pestañas salen de
`CAT_GROUPS`). Sus 38 lugares no cambian; solo la pestaña.

Control nuevo en `auditar_datos.js`: cada categoría del mapa en una
pestaña y en una sola (43 categorías, 11 pestañas), ninguna pestaña con una
categoría que no existe, y Senderismo en Deporte, como lo decidió Jerome.
Con la versión de antes, en rojo.

En «Organiza tu día», la tarjeta «Naturaleza · Rutas, volcanes» seguía
proponiendo senderos. *Cambiado el mismo día, a petición de Jerome: ver
abajo.*

## «Organiza tu día»: Senderismo en Deporte, tramos calculados y los diez idiomas (13 de octubre)

Jerome: «Cámbialo también en organiza tu día. Verifica el mismo tiempo todo
los idioma en organiza tu día».

1. **Senderismo pasa a la tarjeta Deporte**, como en el botón de categorías.
   Los subtítulos dicen lo que hay de verdad, en los diez idiomas:
   «Deporte · Senderismo, ciclismo, golf» y «Naturaleza · Bosques, volcanes»
   (Anaga, La Esperanza, la Corona Forestal, y paisajes volcánicos y
   montañas), que ya no dice «Rutas».
2. **El tiempo entre paradas se calcula.** Era un rótulo fijo para cualquier
   tramo («En guagua ~25 min», «En coche ~15 min», «A pie ~15 min», «En bici
   ~20 min»). Ahora:
   - en coche, la estimación de A→B sin conexión (factor de rodeo y velocidad
     media de las carreteras de Tenerife): «~14 min · 8,5 km»;
   - a pie, la distancia por el rodeo de las aceras a 4,5 km/h, como el
     planificador de guaguas: «~7 min · 0,5 km»;
   - en guagua, ese planificador entre las dos paradas: la línea, o las dos
     del transbordo, y el tiempo con lo que se camina y se espera («~46 min ·
     345», «~93 min · 100 + 224»), a cualquier hora porque el itinerario no
     la tiene; si no hay, «Sin guagua directa ni con un transbordo»;
   - en bici no hay velocidad comprobada: solo los kilómetros («9,0 km»).

   El texto del tramo era casi transparente (solo decía un rótulo fijo):
   ahora se lee.
3. **El título del itinerario**: solo ocho de las catorce tarjetas tenían
   título. Con «Deporte», «Aventura» o «Con perro» salía «Tu itinerario», y
   con varias elegidas el nombre interno en castellano para los diez idiomas
   («🌿 Natur · deporte»). Ahora, el nombre de la tarjeta tal y como sale en
   el paso 2: «🚴 Deporte · 🏄 Aventura · 🐕 Con perro».
4. **Con un itinerario a la vista, cambiar de idioma lo dejaba en el
   anterior** (título, acciones de cada parada, tramos, descripciones). Ahora
   se vuelve a pintar.

Control nuevo, `tools/probar_organiza.js` (418 casos): los cuatro pasos en
los diez idiomas, con el azar fijo para que el itinerario sea el mismo en
todos; cada tramo calculado otra vez por su cuenta y comparado; el título con
las catorce tarjetas y con tres a la vez; el cambio de idioma con el
itinerario abierto, y ningún texto con letras igual que en castellano (salvo
nombres de sitio, «Picnic & BBQ» y el italiano «Cultura»). Fallos metidos: el
tiempo fijo, el nombre interno en el título, sin repintar al cambiar de
idioma y Senderismo otra vez en Naturaleza: los cuatro en rojo.

Queda en el código un planificador anterior (`dp-overlay`, `openDayPlanner`)
con sus propios tiempos fijos. No lo abre nada: el único botón que lo abría
estaba en un bloque que ya no se monta. No se ve en ningún idioma.

### Para Jerome

1. **Nombres de lugar con emoji dentro**: 87 de los 974. En 28 el nombre
   empieza por su propio emoji («🧗 Escalada Arico», «🤿 Buceo Los
   Gigantes», «🪂 Parapente — Despegue Taucho»…), y donde la app pone el
   emoji delante del nombre (el itinerario, «Ruta del día», A→B) sale dos
   veces: «🧗 🧗 Escalada Arico». Los otros 59 lo llevan al final como marca
   («Playa de Las Vistas ♿», «Parque La Granja 🐾», «… 🤝»), que distingue
   la ficha accesible o con mascotas de la normal. Propuesta: quitar el
   emoji del principio en esos 28 nombres (ya está en su icono) y dejar las
   marcas del final. Son datos de las fichas: no lo toco sin tu OK.
2. **Con coche y día completo, el itinerario puede cruzar media isla**: el
   planificador busca las paradas en un radio de 35 km, y si no llega, hasta
   2,5 veces más. Ahora que cada tramo dice su tiempo, se ve: hay tramos de
   50 km. Si quieres, se acorta el radio.

## Los 28 nombres, sin su emoji delante (13 de octubre)

Con tu OK («1 ok cambia»): los 28 nombres que empezaban por su propio emoji
ya no lo llevan («Escalada Arico — Referencia Internacional», «Buceo Los
Gigantes — Diving Centre», «Parapente — Despegue Taucho (Adeje)»…). El emoji
sigue en su icono, que es lo que la app pinta delante del nombre; las marcas
del final (♿ 🐾 🤝) se quedan. Ningún otro dato de las fichas cambia, y no
sale ningún nombre repetido nuevo. `REVISION-LUGARES.md`, regenerado.

Control nuevo en `tools/auditar_datos.js`: «nombres que empiezan por un
emoji» tiene que dar 0. Con el `index.html` de antes da 28 y se pone en rojo.

## «Organiza tu día»: Norte, Sur o «Me da igual» (13 de octubre)

Jerome: «la isla es grande, si voy de los cristianos a Santa Cruz son más de
50km. Podríamos proponer si quiere quedarse en el sur o norte o no importa».

Entre «¿Qué quieres hacer?» y «¿Cómo te mueves?» hay un paso nuevo, «¿Qué zona
de la isla?», con tres tarjetas: 🌿 Norte (Santa Cruz, Puerto de la Cruz),
☀️ Sur (Los Cristianos, Costa Adeje) y 🏝️ Me da igual (toda la isla, como
hasta ahora). Con Norte o con Sur, todas las paradas son de esa zona, la
comida también, y lo que trae «🔄 Otro» también.

**De dónde sale la zona de cada lugar.** Del municipio, y el municipio, del
polígono oficial del Cabildo (el de `tools/municipio.py`, que coincide con
las 2.514 paradas de TITSA). Norte: los 19 municipios de Santa Cruz a
Buenavista del Norte. Sur: los 12 de Candelaria a Santiago del Teide. Es el
reparto que ya usaba «Ruta del día» (Candelaria, Arafo y Güímar en el Sur; El
Rosario en el Norte). Salen 594 lugares en el Norte y 385 en el Sur: cinco
van en los dos (abajo, lo que contestó Jerome). Quince
(muelles, piscinas y playas en la misma orilla) caen unos metros fuera del
dibujo municipal y van con el municipio más cercano: el que más, el puerto de
Granadilla, a 493 m, y el siguiente municipio siempre al menos al doble; si
no, el guion para. La lista la escribe `tools/zonas_lugares.py` en
`index.html`, y con `--comprobar` (en `auditar.sh`) la rehace y la compara:
un lugar dado de alta sin pasarlo no saldría ni en el Norte ni en el Sur.

Y además:
- **Si en una zona no hay bastantes, lo dice.** Museos, en el Sur, son dos:
  salen los dos y «En esta zona no hay más lugares con lo que has elegido».
  Solo cuando de verdad no queda ninguno: si faltan porque los demás están
  lejos, la frase sería falsa y no sale.
- **El título dice la zona**: «🏖️ Playa & Mar · 🍽️ Gastronomía · ☀️ Sur».
- **«🔄 Otro»** cogía cualquier lugar de la isla con esas categorías (con dos
  tarjetas o más, ni eso: las de «Sorpréndeme»), y podía cambiar una parada
  de Los Cristianos por una de Anaga. Ahora coge de lo elegido, en la zona,
  uno de los cinco más cercanos a la parada que cambia; la comida, por otra.
- El tour y la respuesta del asistente sobre «Organiza tu día» dicen que se
  elige norte o sur, en los diez idiomas.
- En chino y en búlgaro los pueblos van escritos como ya los escribe la app
  en otras fichas (圣克鲁斯, 克鲁斯港, 洛斯克里斯蒂亚诺斯, 阿德赫海岸;
  Санта Крус, Пуерто де ла Крус, Лос Кристианос, Коста Адехе).

**Visto al cotejar con «Ruta del día»**: el Castillo de San Juan Bautista (el
Castillo Negro, en Santa Cruz) estaba entre sus sugerencias del Sur. Pasa a
las del Norte, y `zonas_lugares.py --comprobar` coteja desde hoy las dos
listas de «Ruta del día» con el polígono.

Controles: `probar_organiza.js` (de 418 a 520 casos) suma el paso de la zona
en los diez idiomas (título, sus dos «atrás», las tres tarjetas; Norte y Sur
con el mismo nombre que en «Ruta del día»), Norte y Sur sin ninguna parada de
la otra zona (en castellano, además, las catorce tarjetas por cinco azares en
cada zona), Museos en el Sur con su aviso y en el Norte sin él, y «Otro» en el
Sur parada por parada. `barrido_pantallas.js`: dos pantallas más por idioma,
el paso y el itinerario con el aviso. Fallos metidos: un lugar sin zona, el
Castillo otra vez en el Sur de «Ruta del día», la zona que no filtra, «Otro»
como antes, sin el aviso y sin el paso: los seis en rojo.

### Lo que Jerome contestó, hecho el mismo día

Se le preguntó si el Teide, que es de La Orotava, tenía que salir solo con
Norte, y lo mismo Masca y los Acantilados de Los Gigantes (Buenavista del
Norte). Respuesta: «el teid debe salir en sur y norte, igual por su
teleférico, Roque garcia. El resto es norte».

- El Teide («Volcán El Teide» y «Pico del Teide — Cumbre (3.715 m)»; su
  tercera ficha, la del Parque Nacional con perro, entró el 16 de octubre,
  más abajo), el Teleférico y los Roques de García salen con Norte y con Sur.
  Es la única excepción al municipio, y está escrita con la frase de Jerome
  en `LAS_DOS`, en `tools/zonas_lugares.py`, que además comprueba que siguen
  siendo de La Orotava: si no, para.
- Lo demás de Las Cañadas (La Ruleta, el Llano de Ucanca, Montaña Blanca, el
  Pico Viejo…), Masca y los Acantilados de Los Gigantes, solo con Norte, que
  es lo que dice su municipio.
- En «Ruta del día», Masca, el Mirador de Masca, la Ruta Masca–Playa y los
  Acantilados de Los Gigantes estaban entre las sugerencias del Sur: pasan a
  las del Norte (y siguen en Cumbre). El control ya no tiene ninguna
  excepción para «Ruta del día».

`probar_organiza.js` (540 casos) comprueba en los diez idiomas que los cuatro
entran con Norte y con Sur, y que La Ruleta, el Llano de Ucanca, Masca y los
Acantilados de Los Gigantes entran solo con Norte. Fallos metidos: los Roques
de García solo en el Norte, Masca otra vez en el Sur de «Ruta del día» y el
Teide fuera del Sur: los tres en rojo.

Y la tercera opción se queda como está: «Me da igual está bien» (Jerome).

## «Organiza tu día»: nunca dos paradas del mismo sitio (13 de octubre)

Jerome, a la propuesta: «Hazlo y bien pensado». Del Teide salían el volcán y
su cumbre, uno detrás de otro: «~0 min · 0,1 km». No era el único caso: entre
los 564 lugares que usa el planificador hay 57 parejas con la misma
coordenada exacta.

Para la app son el mismo sitio (`DP_SITIO`):
- las fichas con la **misma coordenada exacta**: la playa y su ficha de surf,
  el parque y su ficha 🐾, el área recreativa y su zona de acampada, el
  buceo, el kayak y la pesca de un mismo puerto…;
- las que se **llaman igual** (sin contar emojis, tildes ni mayúsculas) a
  menos de 1 km: las dos «Mesa del Mar», las piscinas y el pueblo, a 180 m.
  Con la distancia, dos sitios que se llamen igual en dos pueblos no se
  juntan;
- y los de `DP_MISMO_SITIO`, el mismo sitio con otra coordenada: el Teide (el
  volcán, la cumbre y la ficha del Parque Nacional con perro, las tres en la
  cumbre, a menos de 130 m).

Lo que está cerca pero es otra cosa sigue pudiendo ir junto: el puerto y su
restaurante, el pueblo y su mercadillo, el Drago y la Casa del Drago, Masca y
su mirador, el Teide y su teleférico. Por eso no se junta por distancia: a
50 m hay museos distintos que se ven a pie en la misma mañana.

En toda la app, las 974 fichas son 892 sitios. Un sitio cuenta una vez:
- **en las paradas y en la comida**: nunca dos del mismo sitio;
- **al elegir la zona del día**, que se escoge por sitios y no por fichas:
  tres fichas de un mismo puerto son una parada;
- **en «🔄 Otro»**, que no trae el mismo sitio que la parada que cambia ni el
  de otra del itinerario (cambiar la playa por su ficha de surf no es
  cambiar); si no queda otro sitio, no cambia;
- **en el aviso** de que en la zona no hay más: kayak y pesca en el Sur son
  siete fichas en cinco sitios, y salen cinco paradas con el aviso;
- y **en las sugerencias de «Ruta del día»**, que enseñaban dos veces «Mesa
  del Mar» (Norte) y dos veces «Playa San Juan» (Sur), con el mismo nombre.
  Se queda la primera de la lista: las piscinas y la playa. Las listas no se
  tocan; se dejan de pintar dos veces.

Controles, en `probar_organiza.js`, con código propio y no el de la app: las
57 parejas, el Teide y «Mesa del Mar» son un sitio para la app, y el Drago con
su restaurante, Masca con su mirador o el Teide con su teleférico no; 210
itinerarios (catorce tarjetas, Norte, Sur y toda la isla, cinco azares) y
«Naturaleza» en el Sur con sesenta azares, sin ningún sitio repetido; kayak y
pesca en el Sur; «Otro» parada por parada; las sugerencias de «Ruta del día»
(81 de 82 en el Norte, 58 de 59 en el Sur). Fallos metidos: elegir las
paradas mirando solo el id, «Otro» como antes, sin el grupo del Teide, sin la
regla del nombre, el aviso contando fichas en vez de sitios y «Ruta del día»
pintándolo todo: los seis en rojo.

### Lo que Jerome contestó (16 de octubre)

La ficha «Parque Nacional Teide 🐾» era de La Orotava y salía solo con Norte.
Jerome: «Es el mismo lugar que el teid (parque nacional con perros) es solo
que confirma que puedes irte con animales». Sale ahora con Norte y con Sur,
como el Teide: va en `LAS_DOS` con su frase, y quedan 594 lugares en el Norte
y 385 en el Sur (cinco en los dos). Como es el mismo sitio que el volcán y la
cumbre, nunca sale junto a ellos en un itinerario. `probar_organiza.js` lo
comprueba con la tarjeta «Con perro». Fallo metido, la ficha fuera del Sur:
en rojo en `zonas_lugares.py --comprobar` y en `probar_organiza.js`.

## Google Play, Fase 1 (16 de octubre)

Jerome trae `LANZAMIENTO-PLAY.md` (De la PWA a Google Play, tres fases) y la
entrega `lanzamiento-lugares.json`: «verifica bien antes de aplicarlos». La
Fase 1 se hace ya; la 2 (el dominio) y la 3 (el enlace con la app de Play)
esperan a su mensaje. El documento se comprobó contra el commit `9b0a4b7`, y
el `index.html` de ese commit es el mismo que habia aqui (md5
`7f6d1729…`, 34.096 líneas). Antes de empezar, `auditar.sh` en verde.

Lo que el documento cita de fuera se ha contrastado con búsquedas, porque
desde este contenedor no se abre ninguna de esas páginas: la política de
teselas de OSM («Offline use is not permitted on tile.openstreetmap.org»), la
guía de atribución de la OSMF, lo que pide Google Play para borrar la cuenta,
la política de jsDelivr, el artículo 20.1 de la LSSI y el plazo del artículo
12.3 del RGPD. Y las cuatro fichas de la entrega, contra Turismo de Tenerife.

### 1.1 · La tienda, fuera de la vista

Todo lo que decía el documento estaba así: siete tarjetas escritas a mano con
precio (tres excursiones y cuatro souvenirs), «Reservar» y «Pagar» que acaban
en un aviso de «próximamente», el hueco de «Próximamente Google AdSense» y
«Anúnciate», que guarda la solicitud solo en el móvil de quien la rellena y le
contesta que le escribirán en 48 horas.

- `TIENDA_ACTIVA = false`: no se ven ni el botón de la barra de abajo ni la
  cesta (aunque el móvil guarde artículos de antes), y ni `openShopPanel` ni
  `openCartPanel` abren nada. El código se queda, con un comentario: antes de
  ponerla a `true`, «Anúnciate» tiene que entregar la solicitud de verdad y el
  pago tiene que funcionar o no ofrecerse.
- Las siete tarjetas y el hueco de AdSense, **borrados**, y las 21 filas de
  `UI_TX` que solo usaban ellas (nombres, descripciones, «Envío a toda
  España», colores…). Lo que el administrador sube a Supabase se sigue
  pintando igual.
- «⚙️ Administrador» sale de la tienda y entra en la cuenta, escondido: solo
  aparece si la base de datos dice que esa cuenta es administradora
  (`es_admin`). Al tocarlo se cierra la cuenta y se abre el panel.
- Ya no nombran la tienda: el tour (`tourBarraP`) y el asistente (`app-01`,
  la barra de abajo), en los diez idiomas. `app-22` («¿Qué hay en la
  tienda?») no se borra, porque `app-18` la enlaza: dice que la tienda no está
  disponible por ahora y que quien tenga un negocio escriba a
  tenerife.go.app@gmail.com. En `faq/indice.json`, fuera `UI.navShop` de
  `app-01` y los tres rótulos de la tienda de `app-22`.
- `auditar_web.js` probaba el botón de comprar con una de las tarjetas
  borradas: ahora monta una tarjeta de prueba igual que aquellas y la quita al
  terminar. `barrido_pantallas.js` ya no tiene la pantalla de la tienda.

Control nuevo, `tools/probar_play.js` (en `auditar.sh`), con un Supabase
falso para tener sesión sin servidor: la barra de abajo con cinco botones,
dentro de la pantalla y con el rótulo entero, en los diez idiomas a 390×844;
ni la tienda ni la cesta se abren, ni por su función ni por sus botones, con
artículos de antes en la cesta; ninguna tarjeta inventada; el botón de
administrador no sale sin sesión ni con una cuenta normal, y con la de
administrador sale y abre su panel. Fallos metidos: la tienda activa, el botón
de administrador para todos y una tarjeta de vuelta: los tres en rojo.

### 1.2 · Borrar la cuenta

Google Play exige, si la app deja crear cuenta, poder borrarla desde la app (o
desde un enlace dentro de ella) y una página web, con el nombre de la app, que
diga cómo. No había ninguna de las dos: la política decía «Para borrarla,
escríbenos».

- **`supabase/borrar-cuenta.sql`**, la función del documento tal cual:
  `borrar_mi_cuenta()` borra de `auth.users` a quien llama y a nadie más, nunca
  a un administrador, y devuelve `true` si borró. `favorites` y `admins` caen
  solas (`on delete cascade`); `push_subs` no va con la cuenta (se da de alta
  sin id de usuario) y la app no usa Storage. **No está ejecutada**: la
  ejecuta Jerome en el SQL Editor y la prueba con una cuenta de usar y tirar
  va antes de darla por buena. El fichero dice qué hacer si falla
  («permission denied»: una Edge Function con `deleteUser()`; `23503`: una
  tabla sin cascada) y, mientras tanto, la app no borra nada y enseña el
  enlace a la página.
- **En la app**, en la cuenta, debajo de «Cerrar sesión»: «Eliminar cuenta».
  La confirmación va dentro de la misma ventana y traducida (el `confirm()`
  del navegador saldría en el idioma del navegador): se borran la cuenta y
  los favoritos de la nube, y no se puede deshacer. Si el servidor devuelve
  `true`, `signOut({ scope: 'local' })` y «Cuenta eliminada…»: según la guía
  de Supabase, borrar de `auth.users` no cierra la sesión, el token vale
  hasta que caduca. Si devuelve `false`, da error o no hay red, no se ha
  borrado nada: la sesión sigue y sale el enlace a `borrar-cuenta.html`, que
  se abre en el idioma de la app. Siete textos nuevos, en los diez idiomas.
- **`borrar-cuenta.html`**, en la raíz y en los diez idiomas, que se cambian
  con enlaces y se leen enteros sin JavaScript (solo CSS, con `:target`; el
  castellano, sin almohadilla). Con JavaScript se abre sola en el idioma de
  la app o, si no lo hay, en el del navegador, como la app. Título «Tenerife
  Go — Borrar tu cuenta»; desde la app; sin la app (escribir a
  tenerife.go.app@gmail.com desde el correo de la cuenta, asunto «Borrar mi
  cuenta», un mes como máximo, RGPD 12.3); qué se borra (el correo, la
  contraseña cifrada y los favoritos de la nube); y qué no se borra con la
  cuenta (las notificaciones, que se apagan en el navegador o en el móvil, y
  lo guardado en el dispositivo). Nada de copias de seguridad ni de plazos de
  conservación que no se saben. La escribe `tools/generar_borrar_cuenta.py`
  desde `idiomas/borrar-cuenta/<idioma>.json`, y los cuatro botones que cita
  («Cuenta», «Cerrar sesión», «Eliminar cuenta» y la confirmación) no van
  escritos a mano: se leen de `index.html` en cada idioma, así que la página
  dice lo que dice la app. El armazón (diez secciones, barra de idiomas,
  estilo) es `tools/pagina_fija.py`, que servirá también para
  `privacidad.html` (1.3).
- **La política** (`ppConsCuenta`, diez idiomas): se borra desde la app
  («Cuenta» → «Eliminar cuenta») o por correo, con el enlace a la página.
  Los dos botones y el enlace los pone `generar_privacidad.py`, leídos de la
  app, como pone `MAIL`; si a un idioma le falta un hueco, para.
- **`sw.js`**: las dos páginas (esta y la `privacidad.html` de la 1.3) van con
  red primero, como `index.html`.

Controles:

- `probar_play.js`, en los diez idiomas: el botón debajo de «Cerrar sesión»,
  con su rótulo entero; la confirmación con sus tres textos; «Cancelar» que no
  llama al servidor; los tres fallos (`false`, error y sin red) con la sesión
  intacta y el enlace en el idioma de la app; el borrado, con una sola
  llamada, el cierre de sesión solo en ese dispositivo y el mensaje; y la
  política, con los botones y el enlace. La página, sin JavaScript e idioma a
  idioma: solo ese idioma, su título, los cuatro botones tal cual y el
  correo; el enlace «Polski» cambia de idioma sin JavaScript; y con
  JavaScript se abre en el idioma de la app, en el del navegador, o en inglés
  si el del navegador no está, como la app.
- `generar_borrar_cuenta.py --comprobar`, en `auditar.sh`: la página al día
  con sus textos y con los botones de la app. Para también si un idioma
  pierde un hueco (`{correo}`…) o copia el castellano.
- `auditar_sw.js`: las dos páginas, red primero, y sin red la última.
- `castellano_suelto.js` lee también los textos de la página.

Fallos metidos, uno por copia: la fila polaca de la confirmación borrada, el
cierre de sesión global, un `false` tomado por borrado, la página sin la
regla que esconde el castellano, el botón renombrado sin volver a generar la
página, la página fuera de la lista de red primero del `sw.js`, un texto
alemán copiado del castellano, «información» dentro del alemán, y un hueco
perdido en la política francesa y en la página italiana: los diez, en rojo.

### 1.3 · La política de privacidad, con dirección propia

Play Console pide la política en una dirección pública y activa, que no sea un
PDF ni se pueda editar. Solo existía como panel dentro de la app.

- **`privacidad.html`**, en la raíz y en los diez idiomas, que se cambian con
  enlaces y se leen enteros sin JavaScript (el armazón de
  `borrar-cuenta.html`, `tools/pagina_fija.py`; lo común a las dos —la barra
  de idiomas y «Volver a Tenerife Go»— pasa a `idiomas/paginas/`). La escribe
  `generar_privacidad.py` en la misma pasada que el panel y con la misma
  función, `cuerpo()`: el panel y la página no pueden decir cosas distintas.
  Antes de tocar nada se comprobó que el generador nuevo dejaba el panel
  igual, byte a byte. Las dos páginas se enlazan entre sí al pie.
- **Dos correcciones del documento**, en los diez idiomas:
  - jsDelivr en lugar de «Google Fonts · jsDelivr»: las tipografías viven en
    `vendor/fuentes/` (la CSP solo deja `font-src 'self' data:`) y Google Fonts
    no recibe nada; jsDelivr sirve la librería de Supabase. Con el enlace a su
    política.
  - La publicidad ya no dice «van marcados como recomendación»: cita la
    etiqueta que se ve en el mapa, leída de la app (`adRecommend`). Hoy dice
    «Recomendación de Jérôme»; con la 1.4 dirá «Patrocinado» sin tocar la
    política.
- **Cuatro fallos que ya estaban en el panel**, y que salieron al montar la
  página:
  - alemán: «Du kannst dich außerdem bei der AEPD.», sin el verbo
    («… beschweren»);
  - chino, los dos: «你也可以向 AEPD.», sin «投诉 / 投訴» y con el punto latino;
  - chino, los dos: «（合法利益 / 履行合同).», con el cierre y el punto latinos;
  - francés e italiano: «auprès de l’ AEPD», «all’ AEPD», con un espacio
    detrás del apóstrofo.

  La causa era una: el enlace iba fijo detrás del texto traducido, y ningún
  idioma podía poner nada después. Ahora la fila lleva el hueco (`{aepd}`,
  `{interes}`, `{contrato}`) donde va el elemento, y la app rehace el texto
  de alrededor al cambiar de idioma (`data-tx-hueco`, en `applyUiTx`) sin
  tocar el enlace. `auditar_claves_tx.js` mira también esas filas.
- **Encima de «Privacidad · RGPD»**: «Versión web» (`privacidad.html`) y
  «Borrar tu cuenta» (`borrar-cuenta.html`), traducidos, que se abren en el
  idioma de la app. Encima y no al lado: al lado no caben entre «Leyenda» y
  el botón de información en todos los idiomas. Y el bloque sube 10 px: a 360
  px de ancho, en francés, alemán y búlgaro, «Privacidad · RGPD» pisaba el
  crédito del mapa (© OpenStreetMap), que tiene que leerse.

Controles:

- `generar_privacidad.py --comprobar`, en `auditar.sh`: el panel y la página,
  al día con sus textos y con lo que citan de la app. Y el generador para si
  un idioma pierde un hueco o deja una llave sin rellenar.
- `probar_play.js`, en los diez idiomas, a 390×844 y a 360×740: los dos
  enlaces y la píldora, traducidos, a sus páginas, sin tapar la leyenda, el
  zoom, el botón de información, el crédito del mapa ni la barra de abajo
  (medido también a 412 y a 320 px: ningún choque). El panel: la frase de la
  AEPD con el enlace dentro y en su sitio, la base legal con sus dos
  énfasis, la publicidad con la etiqueta del mapa, jsDelivr con su política
  y ni rastro de Google Fonts. `privacidad.html` sin JavaScript, idioma a
  idioma: solo ese idioma, su título, y el mismo texto que el panel de la app
  en ese idioma, letra a letra. Con JavaScript, se abre en el idioma de la
  app o en el del navegador.
- `castellano_suelto.js` lee también `idiomas/paginas/`.

Fallos metidos, uno por copia: la app sin el repintado de las frases con
enlace, el bloque otra vez a 80 px, `privacidad.html` tocada a mano, Google
Fonts de vuelta, el alemán sin su `{aepd}`, la publicidad italiana sin la
etiqueta, un `data-tx-hueco` sin fila y un texto cambiado sin volver a
generar: los ocho, en rojo.

### 1.4 · «Patrocinado» en los pines de pago

Los pines de `anuncios` son de negocios que pagan, y la LSSI (art. 20.1) pide
que la comunicación comercial se reconozca como tal. Su globo decía «⭐
Recomendación de Jérôme».

- `adRecommend`, la propuesta del documento en los diez idiomas:
  «Patrocinado», «Sponsored», «Sponsorisé», «Anzeige», «Sponsorizzato»,
  «Gesponsord», «赞助», «贊助», «Спонсорирано», «Sponsorowane». El nombre del
  negocio sigue en el globo.
- Sin la «⭐» delante: delante de «Patrocinado» se leía como una nota. La
  estrella pequeña del icono del pin se queda; se le pregunta a Jerome.
- La fecha de la promoción salía «hasta 2026-12-31» en los diez idiomas: la
  palabra en castellano y la fecha en bruto, tal como llega de la base.
  Ahora va en el formato de cada idioma, con su «hasta» (fila nueva
  `adHasta`): «hasta el 31/12/2026», «until 31/12/2026», «bis 31.12.2026»,
  «有效期至 2026/12/31»…
- La política dice ya «Van marcados con la etiqueta «Patrocinado»», sin
  tocarla: la cita de la app (1.3).

Control: `probar_play.js`, el globo de un pin de pago en los diez idiomas.
Fallos metidos: el alemán con la etiqueta en castellano, la estrella de
vuelta y el «hasta» fijo: los tres, en rojo.

### 1.5 · Fuera las valoraciones de terceros

Notas y recuentos de reseñas de plataformas (Google, TripAdvisor, AllTrails):
caducan y no son nuestras.

- **Las 26 fichas del documento**, en castellano y en los nueve idiomas (el
  polaco, en su fuente `idiomas/pl-lugares/` y montado después con
  `lugares_idioma.js montar pl`): las 21 con «(N,N★ con X reseñas)» —la PR-TF
  6.3, quince guachinches y cinco bodegas—; la ruta MTB de Cruz del Carmen
  (la nota de AllTrails y «la mejor valorada», en la descripción, en el
  nombre —«★ Mejor Valorada»— y en la categoría —«★ Top Tenerife»—); El
  Montillo (la nota de Google); Barmanía Park («de los mejor valorados», con
  su nota); Loro Parque y el minigolf («el mejor… según TripAdvisor»).
- Se quitó la cifra y el superlativo que la anunciaba («con nota
  excepcional», «con mejor nota», «muy recomendado», «TOP»…), y nada más.
  Donde la frase entera era la nota, la frase entera. El resto de cada ficha
  sigue igual, y cada frase queda bien escrita en los diez idiomas.
- **Dos fichas más** con la misma nota de terceros, que el documento no
  listaba: los parques de calistenia de la Plaza de España («valoración
  4,7/5») y Kenguru Pro («valorado con 4,6/5 por más de 34 usuarios»).
- **Etiquetas**: fuera «4.7★», «4.6★», «4.4 Estrellas», «Top Tenerife» y
  «TripAdvisor» (las tres últimas no las listaba el documento; son de las
  mismas fichas), con sus 18 filas del diccionario y sus 3 declaraciones,
  que ya no usaba nadie.
- «PADI 5★» se queda: es el nivel del centro de buceo, no una nota.
- De paso, **dos errores de traducción** en esas fichas: Linaje del Pago (El
  Sauzal) salía como «D.O. Valle de La Orotava» en italiano, neerlandés y
  los dos chinos —es D.O. Tacoronte-Acentejo, como dice el castellano—; y en
  La Huerta de Ana y Eva el inglés, el alemán y el polaco decían «premiado
  varias veces» donde el castellano dice «premiado».

Control nuevo en `auditar_datos.js`: ninguna nota con decimal («4,7★»,
«4.6/5»), ningún recuento de reseñas y ni TripAdvisor ni AllTrails en el
nombre, la categoría, las etiquetas y la descripción, en los diez idiomas.
Sobre el texto de antes salta 284 veces; ahora, ninguna.

Sin tocar, porque no son notas de plataformas (se le pregunta a Jerome): la
etiqueta «Top» de siete guachinches y bodegas, «Premiado entre los mejores
de Tenerife» (Ana y Eva), «Vino propio muy bien valorado» (El Ramal), «una
de las piscinas naturales más valoradas del norte» (Charco Los Chochos),
«Equipo… muy bien valorado» (+Vet Chafiras) y los superlativos editoriales
del tipo «uno de los mejores…».

### 1.6 · OpenStreetMap: el crédito con enlace, y sus teselas sin conexión no

La política de teselas de OSM dice «Offline use is not permitted on
tile.openstreetmap.org»; volver a ver lo ya visto desde una caché que respete
sus cabeceras sí vale. Y pide la atribución, visible en el mapa.

- **`sw.js`**: las teselas de `tile.openstreetmap.org` van solo por red. El
  service worker no las guarda ni las sirve (`esTeselaOSM`), y la caché HTTP
  del navegador hace lo suyo. Al activarse, borra de `tgo-teselas-v1` las
  que guardaron las versiones de antes. Las de Esri (satélite y topo) siguen
  como estaban. Sin red, la app ya pasaba sola a «Isla offline», que es
  nuestra. El porqué, con la cita de la política, va en el comentario.
- **La capa de calles**: «© OpenStreetMap» enlaza a
  https://www.openstreetmap.org/copyright, como pide la guía de atribución
  de la OSMF. La capa detallada ya lo llevaba.
- **El asistente** (`app-06`, diez idiomas) decía que «el mapa normal guarda
  las zonas que ya has mirado». Ahora dice que las guardan «Satélite» y
  «Topo», y declara las dos capas en sus `rotulos`.

Controles: `auditar_sw.js` —la tesela de OSM no pasa por el service worker,
sin red no sale de Cache Storage aunque esté guardada, y al activar se van las
de OSM y se quedan las de Esri; el tope y el caso del avión, ahora con teselas
de Esri—; `probar_play.js`, el crédito con su enlace. Que sin red el mapa
cae a la isla ya lo comprueba `auditar_mapa.js` con el navegador
desconectado de verdad. Fallos metidos: OSM otra vez al caché, sin la purga y
el crédito sin enlace: los tres, en rojo.

### 1.7 · Retoques

- **`manifest.webmanifest`**: la descripción decía «Mapa interactivo de
  Tenerife - 720 lugares verificados». Ahora, la del documento: «Guía de
  Tenerife con mapa: playas, senderos, guaguas y tranvía. Funciona sin
  conexión.» Comprobado antes: el tranvía está (L1 y L2 de Metrotenerife, en
  el panel de guaguas).
- **`README.md`**: sin la cifra de lugares escrita a mano («765 lugares
  verificados», «Los 765 lugares») y con los diez idiomas, que decía ocho; el
  ejemplo de lugar dice ya cómo son hoy los datos (castellano en
  `index.html`, los otros nueve idiomas en `idiomas/`).
- **`og-image.jpg`**: no existía y la pedían `og:image`, `twitter:image` y el
  JSON-LD. 1200×630, 37 kB, el logo a su tamaño sobre #0F1117, sin cifras ni
  promesas. El fondo del propio logo es más oscuro que #0F1117: se le
  difuminan los bordes para que no se vea un cuadrado. La hace
  `tools/generar_og_image.js`.

Control, en `auditar_datos.js`: la descripción del manifest sin cifras de
lugares ni «verificados», y `og-image.jpg` presente, JPG y de 1200×630 si la
cabecera la pide. Sobre lo de antes, las dos en rojo.

### 1.8 · Lugares: San Pedro corregido y tres altas

La entrega, tal cual, en `datos/entregas/lanzamiento-lugares.json`. Se
aplican la corrección y las tres altas; **no** se aplica lo de
`pendiente_de_jerome` (Castillo de San Miguel, Mirador de La Garañona,
Mirador de Cherfe) ni lo de `no_ahora`.

- **`mir-rambla-castro` pasa a «Mirador de San Pedro (Los Realejos)».** El id
  no cambia: va en los favoritos de la gente. El punto, el de la ficha de
  Turismo de Tenerife (UTM 28N 0343842/3142082; pasada a grados da
  28.395804, -16.593971, la cifra de la entrega): se mueve 130 m. El
  «Mirador de San Pedro» de OSM está a 6 m. Texto, `cat` y etiquetas, los de
  la entrega; fuera «Rambla Castro» y «Puerto Cruz» (el mirador está en Los
  Realejos), que siguen en otras fichas.
- **Tres altas**, cada una detrás de una vecina de su categoría: Jardines
  Victoria (La Orotava), Cueva del Santo Hermano Pedro (Granadilla) y Pino
  Gordo y Pino de las Dos Pernadas (Vilaflor). El castellano, el de la
  entrega; los otros nueve idiomas, traducidos de ese castellano sin añadir
  nada, con los nombres como ya los escribe la app («拉奥罗塔瓦», «Вилафлор»,
  «Tenerife Sur» en polaco). Sin horarios ni precios.
- **Comprobado aquí antes de aplicarlo**, no solo leído en la entrega:
  - el municipio de los cuatro puntos, por el polígono del Cabildo
    (`tools/municipio.py`): Los Realejos, La Orotava, Granadilla de Abona y
    Vilaflor, lo que dicen las fichas. A la raya: 239, 1.663, 1.559 y
    2.106 m. La entrega da 219, 1.709, 1.602 y 2.344; con el mismo
    fichero de límites que cita salen las cifras de aquí, así que la
    diferencia es de cómo mide, y no se sabe. No cambia nada: los cuatro
    quedan lejos de la raya;
  - los objetos de OSM, en el extracto del repositorio: la cueva
    (node/313038499) y el Pino Gordo (node/313301148), a 0 m; el Pino de las
    Dos Pernadas, a 136 m del Gordo; el punto de los Jardines, dentro de su
    polígono (area/25092134);
  - los cuatro caen en tierra y ninguno repite un lugar que ya estuviera.
- **Las coordenadas**, con `tools/fijar_coordenada.py` (caja, tierra y cuánto
  se mueve), que apunta las cuatro en `datos/verificado.json` con su fuente.
- **Etiquetas**: cinco nuevas, traducidas en los nueve diccionarios (Siglo
  XIX, Mausoleo, Santuario, Pino canario, Árbol monumental); tres declaradas
  sin traducir con su motivo, en su sitio de la lista ordenada (Rambla de
  Castro, sitio; TF-5, carretera; Santo Hermano Pedro, persona).
- **Norte y Sur**, rehecho con `zonas_lugares.py`: el mirador y los Jardines,
  Norte; la cueva y los pinos, Sur.
- **La cifra**: 974 → 977 en `auditar_datos.js`, a mano y con su porqué, y en
  las dos líneas del JSON-LD. Un comentario de `index.html` decía «los 974
  lugares»; ahora dice «todos los lugares», que no caduca.

Visto en un navegador: los cuatro globos en los diez idiomas (40) pintan la
categoría, el texto y las etiquetas de sus ficheros, sin un error en la
página. En verde: `auditar_municipio.js` (0 que no cuadran),
`auditar_en_el_mar.py` (0 fuera de tierra), `auditar_datos.js`,
`auditar_etiquetas.js`, `castellano_suelto.js`, `auditar_fuente_pl.js`,
`auditar_cirilico.py`, `zonas_lugares.py --comprobar` y `barrido_idiomas.js`
(3.039 filas: 6 más, dos textos por alta).

`informe_lugares.js`: las cuatro no salen en ninguna de sus listas de cosas
que mirar (coordenada a ojo, repetida o a menos de 25 m de otra). Pero el
resumen del final no estaba contado: decía «787 de 787» con 977 en el mapa,
y daba por mal cinco fichas que ya están corregidas. Se arregla aparte.

### Y de paso: `REVISION-LUGARES.md` contaba de memoria

Lo que genera `tools/informe_lugares.js` llevaba cifras escritas a mano,
algunas de cuando había 787 lugares:

- el título y el resumen: «787 de 787» en la caja, en los ids y en los diez
  idiomas, y «781» en tierra, con 977 lugares;
- «0 de 112» zonas de baño sin orientación: hoy son 100 (y 0 sin ella);
- cinco fichas dadas por mal que ya estaban corregidas
  (`parque-tabaiba-baja`, `kayak-radazul`, `buceo-tabaiba`,
  `casa-capitanes-generales` y `mercadillo-la-victoria`), con el método de
  las paradas de TITSA, que `auditar_municipio.js` cambió por el polígono del
  Cabildo;
- «45» y «267» fichas sin municipio que comprobar, de aquel método;
- «100», «88» y «12» de las orientaciones de playa (hoy coinciden, pero
  estaban escritas).

Ahora todo se cuenta al generarlo. Lo que mide otro control —la tierra,
`auditar_en_el_mar.py`; el municipio, `auditar_municipio.js`— se lee de su
salida, y si la línea no está el informe **para** en vez de poner otra cifra.
Lo que es historia (de dónde salieron las 130 primeras verificadas, el 21 de
septiembre) va con su fecha. Hoy: 977 de 977 en la caja, 968 en tierra y 9 en
el agua a propósito, 977 con los diez idiomas, 0 de 162 referencias rotas en
el planificador, 0 de 100 zonas de baño sin orientación. La tabla de las
fuentes de septiembre tenía un párrafo metido en medio y se partía: entera.

Control nuevo en `auditar.sh`: `informe_lugares.js --comprobar` para si
`REVISION-LUGARES.md` no es lo que saldría ahora, fecha aparte. Probado en una
copia: con el informe de antes, rojo; con solo la fecha cambiada, verde; con
un lugar menos sin regenerar, rojo; y si `auditar_municipio.js` deja de
escribir una de sus líneas, el informe para y lo dice. De paso, el rótulo
«las 212 fichas de gasolinera» de `auditar.sh` pierde la cifra: son 211.

### Cierre de la Fase 1

`auditar.sh` entero, sobre una copia de `HEAD` (`2b0c1f2`): todo en verde
menos `auditar_idioma.js` en cinco idiomas (inglés, alemán, italiano,
neerlandés y polaco), con el mismo hallazgo. Lo rompió la 1.5: la etiqueta
de la ruta MTB de Cruz del Carmen era «MTB Anaga · Cruz del Carmen · ★ Top
Tenerife» y, sin la nota de terceros, quedó igual que el castellano en esos
cinco idiomas. Está bien así: MTB es como se escribe en esos idiomas y Anaga
es el nombre del macizo; ya decían «MTB Anaga», solo cambió lo de alrededor.
Se declara «MTB Anaga» en esos cinco, como «Farmacia» en italiano; el francés
(VTT), el chino y el búlgaro no se declaran. Probado en una copia: con el
francés en castellano, sigue en rojo. No lo vieron los controles que se
pasaron al cerrar la 1.5, porque `auditar_idioma.js` no estaba entre ellos:
por eso la auditoría entera va al final de cada fase.

Con el arreglo, `auditar.sh` entero otra vez: **AUDITORIA EN VERDE**, ningún
control en rojo y ninguno que no se pudiera ejecutar.

Lo que el documento pedía ver hoy, visto:

- 33 scripts en línea, los 33 compilan.
- 0 `eval` y 0 `console.log`.
- `escapeHtml` y `escapeAttr`, definidas una vez cada una.

Las pruebas de Google Play (`probar_play.js`), 213 de 213.

Queda en manos de Jerome:

- ejecutar `supabase/borrar-cuenta.sql` y probarlo con una cuenta de usar y
  tirar (el fichero dice qué hacer si falla);
- las preguntas de la 1.4 y la 1.5, y los tres lugares de
  `pendiente_de_jerome`;
- el mensaje que abre la Fase 2 («dominio activo: https://DOMINIO/»), los
  tres datos de la Fase 3 y, para el aviso legal, nombre, domicilio, correo
  y NIF.

### Lo que Jerome contestó (17 de octubre)

- **La estrellita del icono de los pines de pago** (1.4): se queda.
- **«Top» y los superlativos que no son notas de plataformas** (1.5): se
  quedan, como están.
- **Los tres lugares de `pendiente_de_jerome`**: «vivo aquí y conozco estos
  lugares». La entrega decía que con su OK pasaban a altas tal cual, y así
  entran: el Castillo de San Miguel (Garachico), el Mirador de La Garañona
  (El Sauzal) y el Mirador de Cherfe. El castellano, el de la entrega; los
  nueve idiomas, traducidos de él sin añadir nada (el aviso de La Garañona,
  «No bajes a la playa…», con el mismo imperativo que los avisos de otras
  fichas en cada idioma). Lo que la entrega no traía —la `cat`, las
  etiquetas y, en los dos miradores, el emoji y el color— sale de las fichas
  vecinas: el Castillo de San Felipe, el mirador de San Pedro y el de la Cruz
  de Hilda, en la misma carretera que Cherfe. Comprobado antes: los tres
  puntos están a 0 m de su objeto de OSM, caen en tierra, en el municipio de
  su ficha, y ninguno repite un lugar que ya estuviera. Cherfe cae en
  Buenavista del Norte a 12 m de la raya con Santiago del Teide: su ficha no
  dice municipio (dice «Teno», que es una zona) y «Organiza tu día» lo ofrece
  en el Norte, que es lo que dice el polígono. Las tres coordenadas, en
  `datos/verificado.json` con su objeto de OSM y el OK de Jerome; ninguna
  tiene fuente oficial y así consta. Una etiqueta nueva traducida («Siglo
  XVI») y una declarada (TF-436, carretera). 977 → 980; el titular del
  municipio pasa a 15 que solo nombran una zona (Cherfe dice Teno), y las
  filas de idioma, a 3.045. Visto en un navegador: las tres en los diez
  idiomas (30) pintan lo que dicen sus ficheros, sin errores.
- **Las cifras del README: que se cuenten.** Además de las tres que se le
  dijeron (42 categorías, «playas (35)», sin las 211 gasolineras), estaban
  viejas «137 claves de interfaz» (son 130), «el nombre de las 42
  categorías» (43), «Cinco tablas» (siete), el aviso diario que «corre cuatro
  veces cada mañana» (se lanza nueve, de 00:07 a 07:07 UTC, y envía el primero
  que cae entre las 7 y las 16 h de Canarias) y «19 líneas van sin `precio`»
  (todas lo llevan: 130 «desde» y 53 con su importe). Y «los 975 lugares»,
  con fecha del 9 de octubre: ahora 980, y la medida del fichero, con la fecha
  de hoy. «Los 10 controles de la red» no era ninguna cuenta (son cuatro
  comprobaciones y ocho controles numerados): se quita la cifra, también en la
  tabla de herramientas de este documento. De paso, la fila de Supabase ya no
  dice «tienda» a secas (está oculta desde la 1.1) y la de `vendor/` nombra las
  librerías del mapa sin conexión y las tipografías.
  Control nuevo, `tools/auditar_readme.js`, en `auditar.sh`: cada cifra del
  README que habla de hoy —lugares, categorías y las seis con más lugares en
  su orden, idiomas, claves, la red y sus precios, tablas, costas del mar,
  lanzamientos y ventana del aviso, versión de Leaflet— contra lo que cuenta.
  Si una frase se reescribe y ya no la encuentra, también en rojo. Probado en
  copias: un lugar más sin tocar el README, «Seis tablas», un lanzamiento más
  en el workflow, «Reparto de hoy» en vez de «Reparto actual» y dos categorías
  cambiadas de orden: las cinco, en rojo. Con el README de antes salían 14 en
  rojo.
- **La Fase 3 todavía no se puede hacer.** `assetlinks.json` tiene que estar
  en la raíz del dominio (https://DOMINIO/.well-known/assetlinks.json): en
  la dirección de hoy quedaría dentro de `/tenerife-go/`, donde Android no lo
  busca. Y sus tres datos salen de PWABuilder (el paquete y la huella de la
  clave de subida), que se hace con la dirección del dominio, y de Play
  Console (la huella de la clave de firma de Google), después de subir la
  primera versión. Primero el dominio y la Fase 2.

Con todo esto, `auditar.sh` entero sobre `b1d3802`: **AUDITORIA EN VERDE**,
con `informe_lugares.js --comprobar` y `auditar_readme.js` dentro.

Y después, a «¿Quieres Cherfe también en el Sur de «Organiza tu día», como el
Teide?»: «Si». **El Mirador de Cherfe va en las dos zonas**, en `LAS_DOS` de
`tools/zonas_lugares.py` junto al Teide, con su respuesta y, al lado, el
municipio que dice el polígono (Buenavista del Norte): si un día cambia, el
guion para. El Sur pasa de 387 a 388 lugares. `probar_organiza.js` lo
comprueba con el mismo filtro del itinerario, en la tarjeta de miradores y en
los diez idiomas: 548 de 548.

Y a «¿la recuento con un control, como hice con el README?», sobre la tabla
«Integridad de datos»: «Si». Decía «0 de 164» referencias del planificador y
«786» lugares completos e ids válidos, con 162 y 980. Recontada, y cada fila la
coteja ahora `auditar_datos.js` con sus mismas cuentas, más las dos cifras del
texto (los 3 filtros que leen el alias y las 7 líneas con más de dos
terminales). Al contar a mano salieron primero 27 referencias huérfanas y 25
paradas repetidas seguidas: eran las 27 paradas del tranvía, que van como
objetos y no como claves del catálogo; con la regla de los controles, 0 y 0.
Probado en copias: una fila borrada, «8 líneas», «4 filtros» y «45» en el
agua: las cuatro, en rojo. Con las dos cosas, `auditar.sh` entero sobre
`8c1b86f`: **AUDITORIA EN VERDE**.


## El asistente: que no se quede nada atrás (20 de octubre)

Jerome: «Verifica que cada nueva información sea integrada en el asistente y
en todos los idiomas… Después verificaste que las notificaciones se envían en
cada idioma seleccionado en cada perfil?… Reparte tu trabajo en bloque y no
deja nada atrás». Por bloques: A, lo que el asistente sabe de cada lugar; B, lo
que le falta saber; C y D, las notificaciones.

### A · Cada lugar, por su nombre

Se le preguntó al asistente por cada uno de los 980 lugares, con la frase del
botón «¿Dónde está Masca?» de cada idioma y el nombre como se escribe de
verdad, sin el paréntesis ni lo que va detrás de « — » («Farmacia Anaga» por
«Farmacia Anaga (Santa Cruz)»). Encontraba 810 en castellano y en inglés, 824
en búlgaro, 820 en polaco y **342 en chino**. Ningún control se lo preguntaba:
`probar_faq.js` corre sin lugares y `probar_movil.js` hace 25 preguntas. Las
causas eran del buscador, no de un idioma:

- **Nombres hechos de palabras de categoría.** «Playa La Arena», «Golf del
  Sur», «Hospital del Sur de Tenerife», «Playa Roque de las Bodegas»… (12).
  Esas palabras se apartan como categoría, no quedaba ninguna de nombre y ni
  se miraba si el nombre entero estaba escrito: salía la lista de la
  categoría. Ahora el nombre entero se mira siempre; sin palabras de nombre
  solo puede casar el nombre entero, así que «playas en el sur» sigue igual.
- **El chino pegado.** «masca在哪里» era una sola palabra. Se parte entre el
  ideograma y la letra latina, y queda igual que «Masca 在哪里»; lo chino se
  sigue comparando sin espacios, así que sus claves no cambian. Y la palabra
  de categoría pegada a otras («最便宜的加油站», las gasolineras más baratas)
  cuenta como categoría.
- **Nombres de cinco letras.** Adeje, Arona, Arico y Arafo no contaban como
  nombre entero (desde seis), y por palabra suelta no se distinguían de las
  decenas de lugares «(Arona)»: «¿Dónde está Arona?» no tenía respuesta.
- **El principio del nombre.** «Castillo de San Miguel» empataba con dos campos
  de golf de San Miguel de Abona y ganaba el primero del fichero. Si lo escrito
  contiene seguido el principio del nombre de un solo lugar, con una palabra de
  nombre —o de categoría unida por «de», «del», «la»: «Playa del Castillo»,
  «Hospital del Norte»—, es ese lugar. Si lo llevan dos, no se elige por nadie;
  si es una de las frases con que se pide la categoría («centro de salud»),
  tampoco; y palabra por palabra, sin plurales: «farmacias en La Orotava» no es
  «Farmacia La Orotava (Araucarias)».
- **Los empates.** Se desempatan por las palabras de la categoría que lleva el
  nombre («Farmacia Hernández»: la farmacia, no la playa de Diego Hernández),
  por el nombre que empieza por lo escrito y por el pueblo («Vilaflor»:
  Vilaflor de Chasna, no el GR-131). Y si de verdad empatan —tres «Playa del
  Cabezo», la playa y el pueblo de «Playa San Juan»— se enseñan para elegir.

Ahora, en los diez idiomas: **886 de 980 por el nombre corto, y 38 más entre
los que se llaman igual, para elegir** (40 en búlgaro); en chino, de 342 a 924.
Por el nombre entero, 980 de 980 en los diez, también en chino pegado. Los 56
que quedan son nombres cortos que no dicen un lugar: «Parapente» son seis
despegues y sale la categoría; «Ruta Norte», «Marina del Sur», «Guachinche La
Bodega»…

Al medirlo salieron más cosas, todas de antes:

- **«Playas en Los Cristianos» abría la ficha del pueblo.** Si una palabra de
  la categoría queda fuera del nombre encontrado y el lugar no es de esa
  categoría, ahora sale la categoría alrededor de ese lugar: las playas de Los
  Cristianos, los museos del Puerto de la Cruz, los guachinches de La Orotava.
  «Playa La Arena» sigue siendo la playa: ahí la palabra es del nombre. Y la
  respuesta de la base que casaba por el nombre del pueblo no se pega encima:
  «webcams en Garachico» ya no lleva delante «qué ver en Garachico».
- **La pregunta sobre el lugar.** «¿Cómo llego a Masca?» y los botones «¿Qué
  ver en La Orotava?» y «¿Qué ver en Garachico?» abrían la ficha o una lista
  genérica, y no su respuesta (los dos botones, en seis idiomas). Si lo que
  casa de la base contiene el nombre del lugar y dice algo más, gana la base.
  Al revés, si la clave es solo el nombre («Roques de García», «Barranco del
  Infierno»), sale la ficha y la respuesta de la base va de primer botón.
- **«icod»** se completaba a «icod de los vinos» también cuando ya lo estaba, y
  ese «vinos» metía la gastronomía en cualquier pregunta sobre Icod.
- **«Où est…», «Wo ist…», «Gdzie jest…»**: las palabras de la pregunta en los
  otros ocho idiomas se quedaban como parte del nombre. Con la «cuesta» de
  «Lidl La Laguna (La Cuesta-Taco)» parecía una pregunta de precio y salía la
  respuesta de La Laguna; esa «cuesta», al ser del nombre, ya no pregunta
  precio.
- **«Cerca de mí» alrededor de un sitio cualquiera.** «Gasolineras más baratas
  cerca de mí» ordenaba alrededor del parque de La Gesta (por un «más» de una
  etiqueta), y «Veterinarios 24h» alrededor del Minimarket 24h: el rótulo de la
  categoría solo se miraba si no había casado otra palabra antes, y el «24h»
  se quedaba suelto como si fuera un nombre.

Medido contra la versión anterior servida aparte, con las mismas preguntas:
de las 1.220 preguntas de la base (los rótulos de sus botones, 122 por idioma)
y sus 6.524 claves en los diez idiomas, **ninguna lleva ahora a una respuesta
peor**: 59 llevan a la suya y antes no, y los botones que llevan a su
respuesta pasan de 119 a 121 en seis idiomas (el que queda, «Ordena mis
favoritos por distancia», no contesta: lo hace). De 3.945 preguntas de
categoría, zona, «cerca de mí», pueblos y botones rápidos, cambian 1.726 y se
miraron todas: 1.167 de la ficha o de la respuesta del pueblo a la categoría
alrededor del pueblo, 387 alrededor de Arona en vez de un sendero de Vilaflor
o de nada, 70 que no contestaban y ahora dan el lugar, 42 que ganan el botón
con la respuesta de la base, 19 que dejan de ordenar alrededor de un sitio al
azar, y 41 más, también para bien («Santa Cruz» es Santa Cruz y no el baño de
Valleseco; «Masca», Masca).

Control nuevo, `tools/probar_nombres.js`, en `auditar.sh`: la app entera en un
navegador, cada lugar preguntado por su nombre entero con la frase del botón de
cada idioma (en chino, también pegada): tiene que salir su ficha, o la lista
para elegir si otro se llama igual. Por el nombre corto lo cuenta y lo dice,
sin exigir. Probado al revés: con el buscador de antes, en rojo en los diez
(por el nombre entero, 951 de 980 en castellano y 1.507 de 1.960 en chino).
Espera a que llegue el `faq/<idioma>.json` de cada idioma: sin eso, en
búlgaro preguntaba con la base del idioma anterior (salió así la primera vez).


### B · Lo que el asistente no sabía

**Tres categorías del mapa.** El asistente tiene su propia lista de
categorías (`CHAT_CATS`), y al añadir Parkings (43 lugares), Ayuda & Apoyo
(19) y Puertos Comerciales (3) al mapa nadie las añadió allí: «Parkings»
contestaba «¿Dónde aparco?» sin la lista, «Ayuda & Apoyo» contestaba cómo
funciona la app, y «Car parks» o «Commercial Ports», que no había respuesta.
Ahora están, con sus palabras en castellano e inglés; en los otros ocho
idiomas casan por el rótulo de la categoría, como todas. En la de ayuda no va
la palabra «ayuda» (a secas propone el 112 y la ayuda de la app), y su lista
lleva delante la respuesta del 112, no la de la app. «Gasolineras más
baratas», que es un filtro sin lugares propios, pide la lista de las
gasolineras; en francés («Stations les moins chères») no la pedía.

`probar_nombres.js` mira además cada una de las 43 categorías del menú con su
rótulo de cada idioma: tiene que salir la lista de esa categoría. 43 de 43 en
los diez; con la versión de antes, 39.



**Lo nuevo de la app, que el asistente no sabía contar.** Preguntado por cada
cosa que ha entrado desde que se escribió la base (12 de octubre): «¿Qué se ve
esta noche en el cielo?», «eclipse», «notificaciones» y «política de
privacidad» no tenían respuesta; «¿Cómo borro mi cuenta?» contestaba que no
hace falta cuenta; «¿Qué significa patrocinado?», el glosario canario;
«lluvia de estrellas», dónde ver estrellas, sin el panel; y «violencia de
género» daba dos fichas de violencia sexual, y «domestic violence», nada.
Siete entradas nuevas en los diez idiomas, cada dato sacado del código o de
un texto de la app que ya dice lo mismo:

- **app-24, el panel del cielo** («Cielo de Tenerife» y sus cinco pestañas,
  con sus nombres de pantalla), y **app-25, lluvias de estrellas y
  eclipses**, que manda a «Calendario» y repite el aviso del filtro ISO
  12312-2 del propio panel. Sin una fecha escrita a mano: las calcula la app.
- **app-26, borrar la cuenta**: los botones como se llaman en Cuenta, lo que
  se borra, el correo y el plazo de `borrar-cuenta.html`, y que las
  notificaciones no van con la cuenta.
- **app-27, qué datos guarda la app**: lo que dice la política, y dónde está
  («Privacidad · RGPD», «Versión web» y «Borrar tu cuenta», abajo en el mapa).
- **app-28, «Patrocinado»**: lo que dice la política de los negocios que pagan
  y de que no usan tus datos.
- **app-29, la frase de cada mañana**: con la app instalada, a la tercera vez
  que se abre; si se dijo «Ahora no», ya no se pregunta, y queda el botón de
  Cuenta con la sesión iniciada; en iPhone, primero la pantalla de inicio.
  Que llega en el idioma de la app no se dice todavía: no es cierto del todo
  hasta que se ejecute `supabase/push-idioma.sql` (apartado C).
- **sal-08, ayuda si se sufre violencia**: el 112, el 016 y los dos servicios
  de Tenerife que ya tienen ficha (el Centro de Crisis 24h para víctimas de
  violencia sexual y el SIAM del Cabildo), con lo que dicen sus fichas, y la
  categoría «Ayuda & Apoyo».

Y cinco que se quedaban cortas: **app-01** nombra el 🔭 en la barra de arriba;
**app-06**, que el panel del cielo funciona sin conexión y su previsión de
nubes no; **app-13**, el botón de los avisos de AEMET, que solo sale cuando los
hay; **tei-13** («¿Dónde veo las estrellas?») lleva al panel y lo tiene de
primer botón; **mov-19** («¿Dónde reposto?»), el ⛽ con las más baratas a 5, 10
o 20 km y el precio oficial del Ministerio.

`rotulos_app.js` lee ahora también los textos de `modulos/cielo.js` y los de la
tarjeta de las notificaciones, así que `auditar_faq.js` comprueba en cada idioma
los nombres de las pestañas del cielo y el «Ahora no» de esa tarjeta (que no es
el del tour). 129 entradas por idioma, todas alcanzables por su botón;
`probar_faq.js`, 114 preguntas (doce nuevas, una por entrada nueva, repartidas
por los diez idiomas). En la app entera, las siete nuevas llegan a su respuesta
por su rótulo y por cada una de sus claves en los diez idiomas, y ninguna
pregunta de las de antes lleva a una respuesta peor.

### C y D · La notificación diaria, en el idioma de cada perfil

Leído entero, de la suscripción al móvil:

- **Al activarla**, la app guarda la suscripción con su idioma de ese momento
  (`pushSuscribir`, `p_lang`). El idioma ya está puesto antes de eso: se lee
  de `tg_lang` al arrancar, antes que nada.
- **Al enviarla**, `enviar-notificacion.js` le manda a cada suscripción el
  título y la frase del día de su idioma, y la castellana solo si su idioma
  no estuviera. El service worker enseña lo que llega, con su idioma.
- **Los textos** están en los diez: el título y las 365 frases de
  `frases.json` (`auditar_frases.js` lo mira día a día, también el 366 de un
  bisiesto), los siete de la tarjeta que pide el permiso (`PUSH_TX`) y las
  seis filas del botón «Activar notificaciones» de Cuenta y de sus avisos.
  Ninguno igual al castellano.
- **Lo que fallaba: el cambio de idioma.** Al cambiar de idioma no se le
  decía nada al servidor, y al volver a abrir la app sí se le mandaba la
  suscripción con el idioma nuevo, pero `guardar_push_sub()` no toca una que
  ya existe (la app da por bueno su 409). Quien la activó en inglés y pasó al
  alemán seguía recibiendo la frase en inglés, todos los días.

Arreglado en dos partes. En la app, al cambiar de idioma se vuelve a mandar
la suscripción en ese momento, sin preguntar ni pintar nada (elegir el mismo
idioma no manda nada). En Supabase, `supabase/push-idioma.sql`: la función pone
el idioma nuevo en la suscripción que ya existía —solo el idioma, las claves de
una existente no se tocan desde el cliente—, acepta los diez idiomas (otro se
guarda como `es`, que es lo que se le mandaría igual) y valida lo que recibe.
Si la tabla tuviera una restricción de idioma de cuando había ocho, sin el
búlgaro ni el polaco, la cambia por una con los diez; si no la tiene, no crea
ninguna. **Hay que ejecutarlo una vez en Supabase**: desde aquí no se llega a
la base. Probado antes en un PostgreSQL 16 de verdad, con una tabla como la
de la app (único en el `endpoint`, RLS, la política de alta y una restricción
de ocho idiomas) y la función vieja: con la vieja, cambiar de idioma revienta
y el búlgaro se rechaza; con la nueva, el idioma se actualiza y las claves no,
entran el búlgaro y el polaco, `xx` queda en `es`, un `http://` se rechaza,
`anon` sigue sin poder leer la tabla, y el guion se puede ejecutar dos veces.
También sin restricción, sin único y sin función previa.

Control nuevo, `tools/probar_notificacion_idioma.js`, en `auditar.sh`. La app
en un navegador, haciéndose pasar por instalada y con el permiso dado: al
abrir guarda con su idioma, al pasar a cada uno de los otros nueve guarda con
el nuevo, la tarjeta del permiso y los textos, en cada idioma. Y el envío, con
Supabase y web-push de mentira: diez suscripciones, una por idioma, y dos
raras; cada una recibe el título y la frase del día de su idioma, sacados de
`frases.json` por cuenta propia, y las raras la castellana. Con la app de
antes, en rojo: al cambiar de idioma, ninguna llamada.

Visto de paso: el botón «Activar notificaciones» solo está en Cuenta con la
sesión iniciada. Sin cuenta, la única forma de activarlas es la tarjeta que
sale sola a la tercera vez que se abre la app instalada, y si se contestó
«Ahora no», ya no vuelve. No se ha tocado: es para Jerome.


### Cierre: la auditoría entera

`auditar.sh` entero sobre `d9d46fe`, con `probar_nombres.js` y
`probar_notificacion_idioma.js` dentro: **todo en verde menos dos bloques,
`auditar_gas_cerca.js` y `auditar_desborde.js`, los dos por lo mismo y los dos
de antes de este trabajo.** Hoy AEMET tiene un aviso en vigor para Tenerife, y
su botón, que solo sale cuando hay avisos, ocupa 62 px en la barra de arriba:
a 360 px de ancho la barra se pasa 2-4 px, y a 320 px mide 343 y el botón del
idioma queda fuera de la pantalla, sin poder alcanzarlo (la barra no llega a
desplazarse). A 375 px y más, cabe. Comprobado:

- con la versión de antes de hoy (`a0f916a`) y el mismo fichero de avisos, los
  dos controles dan exactamente los mismos fallos;
- con esa misma versión y el fichero de avisos de un día sin avisos
  (`834c8d6`), `auditar_desborde.js` sale en verde.

O sea, ningún control nuevo en rojo, y estos dos ya lo estaban con los datos
de hoy (la última auditoría en verde, sobre `8c1b86f`, fue un día sin avisos).
No se ha tocado: arreglarlo es cambiar cómo se ve el botón de los avisos en
los móviles pequeños, y eso es para Jerome.

## Los avisos de AEMET, en el botón del mar (21 de octubre)

A la pregunta de cómo hacer sitio al botón de los avisos, Jerome: «El aviso
AEMET puedes incluirlo en el botón donde bañarte. Deja micro clima y
temperatura. Cuadra con la AEMET».

| | antes | ahora |
|---|---|---|
| barra de arriba | con avisos en pie, una píldora (icono, punto y ✕) de 62 px que a 320–360 px echaba el idioma fuera de la pantalla | sin píldora: un punto del color del peor aviso en pie (amarillo, naranja o rojo) en la esquina del 🌊, que no ocupa sitio; y dicho para quien no lo ve (`aria-describedby`: «1 aviso de AEMET para Tenerife») |
| panel del mar | solo los costeros, debajo del título | lo primero del panel, encima de «Báñate hoy aquí»: cada aviso en pie, de cualquier fenómeno, con nivel, fenómeno, zona y hora; al tocarlo, el aviso entero. Sin avisos, «Sin avisos de AEMET para Tenerife hasta…» y la hora de la comprobación, como en el del tiempo |
| «Báñate hoy aquí» | solo el modelo de Open-Meteo | con un aviso de fenómenos costeros para hoy, deja fuera las playas de su zona y lo dice; si no queda ninguna, dice que es por AEMET |
| costas del panel | solo el modelo | la costa con un costero para hoy lleva el aviso (nivel, fenómeno, hora) y no puede ser «la costa más tranquila» |
| panel del tiempo 🌡️ y temperatura | — | igual que estaban |

**Qué playa cae dentro de un aviso.** No se ha escrito a mano ninguna
correspondencia: AEMET manda con cada aviso el contorno de su zona (el
`<polygon>` del CAP), y `tools/avisos_aemet.py` lo guarda tal cual
(«poligonos»), solo si tiene la forma de CAP 1.2 —cuatro pares como poco,
cerrado—; si una zona trae uno malo, no se guarda ninguno. Medido con los
contornos reales de Tenerife del 11 de octubre (`tools/pruebas/aemet/`): las
99 playas y charcos de «Báñate hoy aquí» caen cada uno en una zona —30 en el
Norte, 25 en el Área metropolitana, 44 en Este, sur y oeste— y ninguno a más de
1 km del contorno costero de la suya (va con dos decimales). Por eso cuenta lo
que está dentro o a menos de 2 km: en la raya entre dos zonas, una playa cuenta
para las dos (Mesa del Mar, Playa de Candelaria, Chimisay y El Socorro de
Güímar), y la costa «Oeste» del panel, la de Los Gigantes, que está dentro del
contorno del norte y a 1 km del del sur, lleva el aviso de cualquiera de los
dos. Un costero que llegue sin contorno cuenta para toda la costa. «Hoy» es
hasta medianoche en Canarias: un costero de mañana sale arriba con su hora y
no quita nada.

Los avisos que hay ahora en `datos/avisos-aemet.json` no traen contorno: los
traerán desde la primera pasada del flujo de cada hora con el lector nuevo. Hoy
no hay ningún costero (solo uno amarillo de lluvias en el Área metropolitana),
así que mientras tanto no cambia nada que se vea.

**El asistente.** «avisos de AEMET», «aviso amarillo», «Wetterwarnung», «code
oranje», «天气预警»… daban los avisos de seguridad de las fichas, otra respuesta
o nada. Ahora llevan a «¿Dónde veo el tiempo de hoy?» (app-13), reescrita en
los diez idiomas con el punto del 🌊, «Báñate hoy aquí» y los costeros, y con
sus claves; la de la calima (sal-03) dice dónde sale un aviso de polvo en
suspensión; el paso del 🌊 del tour, también. Comparadas las 8.412 preguntas
de los diez idiomas (rótulos y claves) con la versión de antes: cambian las 85
nuevas, todas a app-13, y ninguna otra.

**Probado.**

- `tools/probar_avisos_aemet.py`: **31 de 31**; 7 nuevos: el contorno de
  659603C tal cual, abierto, con letras, de tres pares, fuera de rango, y dos
  contornos con uno malo.
- `tools/probar_avisos.js`: **127 de 127**, en un navegador, en los diez
  idiomas, con Open-Meteo simulado (mar en calma y alisio flojo en toda la
  isla) y los contornos reales: el punto del color del peor, y dicho; ninguna
  píldora; los avisos lo primero del panel; con el costero del sur, las costas
  Sureste, Sur y Oeste lo llevan y ninguna más; «la más tranquila» no es una de
  ellas; las tres playas de «Báñate hoy aquí», fuera de su zona, y la nota; sin
  el costero, alguna de las tres **sí** era de esa zona (si no, la prueba no
  probaría nada); costeros en las tres costas, uno sin contorno y uno de mañana;
  sin avisos, comprobación vieja, aviso terminado, sin fichero y cambio de
  idioma.
- `auditar_desborde.js` y `auditar_gas_cerca.js`, en rojo ayer por la píldora
  con el aviso de hoy: en verde con el mismo aviso.
- `auditar_tour.js` (el paso del 🌊, en los diez idiomas y cuatro tamaños),
  `auditar_faq.js`, `probar_faq.js` (121; 7 nuevos), `castellano_suelto.js`,
  `auditar_claves_tx.js`, `auditar_letras.js`, `auditar_sin_traducir.js` y
  `auditar_idiomas_fuera.js`: en verde.

Averías metidas a propósito, cada una en una copia de la app:

| # | avería | `probar_avisos.js` |
|---|---|---|
| 1 | «Báñate hoy aquí» sin mirar los avisos | canta: 5 casos |
| 2 | sin el margen de 2 km | canta: 4 (la costa Oeste pierde el aviso, y con costeros en las tres costas sigue saliendo alguna playa) |
| 3 | un costero sin contorno no cuenta para nada | canta: 2 |
| 4 | un costero de mañana cuenta para hoy | canta: 1 |

## «Activar notificaciones», también sin cuenta (21 de octubre)

Jerome, a «El botón “Activar notificaciones” solo aparece con la sesión
iniciada… ¿Lo pongo también para quien no tiene cuenta?»: «4 si». Sin cuenta,
la app solo lo preguntaba una vez (la tarjeta, la tercera vez que se abre
instalada), y quien contestó «Ahora no» no tenía por dónde activarlas.

- **Dónde.** En la pestaña «Continuar como invitado» de Cuenta, debajo de
  «Seguir sin cuenta», el mismo botón dorado (`pushBtnActivar`, ya en los
  diez idiomas) con su línea de mensajes. La suscripción no va unida a
  ninguna cuenta: `guardar_push_sub()` recibe el endpoint, sus dos claves y
  el idioma, nada más; la política de privacidad ya lo cuenta así.
- **Cómo.** `pushEngancharBoton()` engancha los dos botones; donde no hay
  push (Safari sin instalar, un navegador sin `PushManager`), los dos salen
  apagados y con el motivo. Lo que pasa se escribe en las dos líneas, y con
  su clave en `data-tx`: si se cambia de idioma con el mensaje escrito, se
  vuelve a escribir en el nuevo (antes se quedaba en el de antes; también en
  el de la sesión iniciada).
- **El asistente.** app-29, en los diez idiomas: «la activas cuando quieras en
  «Cuenta», con «Activar notificaciones»: con la sesión iniciada, ahí mismo;
  sin cuenta, en «Continuar como invitado»». Las 8.412 preguntas, como antes:
  ninguna cambia de respuesta.
- **Probado.** `tools/probar_notificacion_idioma.js`, con la app haciéndose
  pasar por instalada y el push de mentira: en los diez idiomas, sin sesión,
  el botón se ve en «Continuar como invitado» con su rótulo, al tocarlo
  guarda la suscripción con el idioma de la app y lo dice debajo, y al cambiar
  de idioma la línea cambia con él; en un navegador sin push, apagado y con
  el motivo. `probar_play.js` (213 de 213, el panel de la sesión),
  `auditar_faq.js` y `probar_faq.js`, en verde.

### Cierre del 21 de octubre: la auditoría entera

`auditar.sh` entero, antes y después:

- sobre `db3ab81` (antes de tocar nada): **dos bloques en rojo**,
  `auditar_gas_cerca.js` y `auditar_desborde.js`, los de la píldora con el
  aviso de lluvias de hoy;
- sobre las dos partes (`d56a8dd` y `12fd55d` en `main`; corrió sobre ese
  mismo código antes de traer el fichero de avisos de las 8:59, con tres
  avisos amarillos de lluvias): **«AUDITORIA EN VERDE»**, ningún bloque en
  rojo ni roto. Idiomas: 43 tablas y 1419 filas (una más), 3.560 en total.

## Los avisos de AEMET, enteros, también en el panel del tiempo (21 de octubre, tarde)

Jerome, con una captura del panel del termómetro 🌡️ («¿Dónde hace sol
ahora?»), que abajo solo decía «⚠️ 1 aviso de AEMET para Tenerife»: «quiero la
AEMET ahí». Y: «recuerda que debe estar ergonómico y guapo».

- **Lo que sale ahora, en el mismo sitio.** Cada aviso en su línea, del color
  de su nivel y con su hora debajo, como arriba del panel del mar: «🌧️ Aviso
  amarillo · Lluvias · Toda la isla — 🕐 De 10:00 a jue 22, 05:59». Al
  tocarlo, el aviso entero. Las dos listas salen de la misma función
  (`wxLineas`), así que no pueden decir cosas distintas.
- **«Toda la isla».** AEMET suele poner el mismo aviso en las tres zonas de
  Tenerife (hoy, las lluvias), y nombrarlas ocupaba tres renglones. Cuando un
  aviso las tiene todas, la línea dice «Toda la isla» (o «Toda la costa», con
  las tres costas); la tarjeta del aviso entero las nombra siempre. Cuáles
  son todas no se escribe a mano: `tools/avisos_aemet.py` guarda las zonas de
  todos los mensajes del fichero de AEMET, también los de sin aviso, que las
  traen todas (`aemet.zonas_isla`: 659601, 659602 y 659603, y sus costas). Un
  fichero sin esa lista nombra las zonas una a una.
- **El asistente.** app-13, en los diez idiomas: los avisos también están
  abajo en el termómetro.
- **Probado.** `tools/probar_avisos_aemet.py`: **32 de 32** (nuevo: las seis
  zonas de la isla del fichero real). `tools/probar_avisos.js`: **139 de 139**:
  el panel del tiempo con los mismos avisos que el del mar en los diez
  idiomas; las lluvias en las tres zonas, «Toda la isla» en los dos paneles
  en los diez idiomas y la tarjeta con las tres; sin la lista, las nombra; los
  costeros en las tres costas, «Toda la costa».

## La privacidad dice que con la suscripción se guarda el idioma (21 de octubre)

Jerome: «3 si quiero». La política decía que de las notificaciones se guarda
«una dirección de envío y dos claves», y también se guarda el idioma de la app
(`p_lang` de `guardar_push_sub()`, para mandar la frase en ese idioma). Ahora lo
dice, en los diez idiomas: `ppDatosPushTxt` en `idiomas/privacidad/*.json`, y
`tools/generar_privacidad.py` lo lleva al panel de la app y a
`privacidad.html` de la misma pasada. La respuesta del asistente sobre los
datos (app-27) también, en los diez. `generar_privacidad.py --comprobar`,
`probar_play.js` (213 de 213), `auditar_faq.js`, `probar_faq.js` y
`castellano_suelto.js`, en verde.

## «⚠️ AEMET» en el globo, solo en la costa del aviso (21 de octubre, noche)

Jerome temía que en las fichas fuera «mucha información» y pidió que fuera
«ergonómico y guapo». Con la propuesta delante (las dos fichas, con aviso y
sin él): «Si Perfecto».

- **Lo que sale.** Solo cuando la costa de ese lugar tiene un aviso de
  fenómenos costeros de AEMET para hoy: en «🌊 El mar aquí», una etiqueta
  «⚠️ AEMET» del color del aviso. Al abrirlo, el aviso en una línea, lo
  primero, con su hora; debajo, el mar de siempre. Los demás días, y en la
  otra costa, el globo es el de siempre.
- **El mismo criterio que «Báñate hoy aquí».** `TGO_AVISOS.costerosEn`:
  dentro del contorno oficial de la zona costera o a menos de 2 km; un aviso
  sin contorno cuenta para toda la costa; uno de mañana, no.
- **Nada viejo.** El globo se fabrica al abrirlo y el mar se guarda media
  hora (`SEA_CACHE`), pero el aviso se mira cada vez: si ya se ha acabado, ni
  etiqueta ni línea, aunque el mar venga de la caché. Si Open-Meteo no
  responde, el aviso oficial se sigue viendo.
- **Idiomas.** «AEMET» es el nombre del organismo y va igual en los diez,
  como AENA o Cabildo en `idiomas/etiquetas-sin-traducir.json`, y como ya iba
  en las líneas de los avisos y en el asistente; la línea del aviso es la del
  panel del mar (`wxLineas`), ya en los diez. Ninguna fila nueva de idioma. En
  chino y búlgaro `barrido_pantallas.js` vio «⚠️ AEMET» igual que en los
  idiomas latinos y se puso en rojo: va declarada en
  `idiomas/pantalla-aceptado.json` con ese motivo, solo ese texto exacto (la
  primera entrada del fichero). A 320 px, en alemán, búlgaro y polaco, cabe en
  una línea.
- **El asistente.** app-13, en los diez idiomas: en el globo de cada lugar de
  esa costa, «El mar aquí» lleva «⚠️ AEMET». De las 8.412 preguntas del
  asistente, ninguna cambia de respuesta.
- **Probado.** `tools/probar_avisos.js`: **156 de 156**. Nuevo, con un costero
  naranja de prueba en la costa sur (659603C, con su contorno de AEMET y sin
  texto: entre las copias no hay ningún costero real de Tenerife): la Playa
  del Duque, etiqueta naranja y el aviso lo primero, en castellano, alemán y
  chino; la Playa Jardín, en el norte, el globo de siempre; al volver a
  abrirlo con el mar de la caché, sigue; si el aviso ya no está, desaparece;
  sin avisos, con uno de mañana o sin fichero, nada; un costero sin contorno,
  sí. `auditar_xss.js`, `auditar_seguridad.py`, `auditar_faq.js`,
  `probar_faq.js` (121), `castellano_suelto.js` y `probar_avisos_aemet.py`
  (32), en verde.
- **Auditoría entera** (`bash tools/auditar.sh`). La primera pasada, todo en
  verde salvo `barrido_pantallas.js`, por «⚠️ AEMET» en chino y búlgaro (en
  Idiomas, arriba). Con la declaración, otra vez entera: **«AUDITORIA EN
  VERDE»**, ningún bloque en rojo ni roto. Y sin la declaración el barrido
  vuelve a cantar: comprobado, para que no se quede mudo.

## La rama `cielo-camara`, junta con el `main` de hoy (21 de octubre, noche)

Jerome trajo `PARA-CLAUDE-CODE-3.md`, los dos parches y el bundle de la otra
sesión: el cielo del 20 («Apunta al cielo», la carta, la ficha) y lo del 21
(lo que piden las reseñas y la Luna llena que dejaba el cielo a oscuras). Las
tres huellas sha256 son las de la nota.

- **Repasado antes de ejecutar nada.** Ni `CNAME`, ni los workflows, ni
  `sw.js`. Lo único nuevo que sale a la red es Wikipedia, que ya estaba en la
  CSP: lo que llega entra como texto, y sus enlaces y fotos se validan (la
  propia prueba mete un `<script>` y un `javascript:`). La cámara se pide sin
  audio y el micrófono sigue en `()`. `tools/cielo_fuentes.sh` solo baja
  datos de commits fijos de GitHub; el nuevo, el WMM2025 de la NOAA.
- **Aplicado con `git am -3` sobre `main` (`96c51ed`).** La otra sesión partía
  de `4e5da10`, del 18. Chocó lo que la nota decía que podía chocar: la
  política de privacidad, que en sus fuentes se queda con las dos cosas (el
  idioma de la suscripción, de hoy, y los sensores, la cámara, los avisos y
  la guía del cielo), y lo que se genera de ella (`index.html` y
  `privacidad.html`, rehechos con `generar_privacidad.py`); y las cifras de
  idiomas de este documento: 1.418 de base, 3 más de AEMET, 87 del 20 y 67
  del 21, **1.575 filas**, y 3.716 en total, contadas otra vez con
  `barrido_idiomas.js`.
- **Comprobado contra el bundle.** Los 9 ficheros que solo toca el cielo son
  idénticos a los del bundle; los 34 que solo cambió `main` desde el 18,
  idénticos a `main`; y en `index.html`, `README.md` y
  `barrido_pantallas.js`, lo que difiere del bundle es exactamente lo que
  cambió `main`. `datos/cielo.json` sale tal cual de las fuentes
  (`cielo_construir.js --comprobar`).
- **Recontado.** `index.html`, ya junto: 35.121 líneas, 2,4 MB, 742 kB con
  gzip (el README decía las del 17). La descarga: 1.034 kB en castellano,
  1.148 en búlgaro y 1.134 en polaco (`peso_descarga.py`); la cabecera de
  este documento decía las del 17, y `main` ya pesaba 1.026 sin el cielo
  nuevo.
- **Auditoría entera** (`bash tools/auditar.sh`, con las fuentes del cielo
  bajadas), sobre la rama con sus cuatro commits, el de Wikipedia de abajo
  incluido: **«AUDITORIA EN VERDE»**, ningún bloque en rojo ni roto. Aquí
  corren también los tres de `pmtiles` que en la otra sesión no pudieron.
  `auditar_cielo.js`, 118 de 118; `barrido_pantallas.js`, 97 pantallas y
  fichas por idioma, 0 textos sin traducir y 0 errores de página;
  `probar_play.js`, 213 de 213.

## El cielo: sin artículo de Wikipedia en tu idioma, la ficha lo dice (21 de octubre, noche)

La ficha de un astro, cuando la Wikipedia del idioma de quien lee no tenía el
artículo, enseñaba el resumen en inglés, avisando. Jerome: «Se podrían
encontrar una manera que si no tiene artículo salta en el idioma
seleccionado que no tienen artículo?». Ahora sí:

- **Lo que se ve.** La cabecera de siempre («W De Wikipedia») y debajo, en
  el idioma de la app, «No hay artículo en tu idioma.». Nada en inglés: ni
  el texto, ni la foto, ni el enlace, ni la licencia (no hay texto que
  licenciar). Las diez frases son las que ya llevaba el aviso de antes («en
  inglés: no hay artículo en tu idioma»), sin la parte del inglés: la fila
  `cieloWikiIngles` se cambia por `cieloWikiNo`, así que `CIELO_UI` sigue en
  396 filas y las de idioma en 1.575.
- **Solo cuando se sabe.** Se dice cuando Wikipedia lo confirma: el
  artículo inglés del astro no tiene enlace a ese idioma (`langlinks`). Si
  la red falla (el Teide sin cobertura), no se sabe, y no se dice nada; se
  vuelve a mirar la próxima vez. Lo confirmado se recuerda 30 días, como los
  resúmenes: sin cobertura se sigue diciendo.
- **Probado.** `auditar_cielo.js`, **118 de 118** (dos más): el francés sin
  enlace lo dice en francés y no trae nada en inglés, y queda recordado así;
  el italiano con la red cortada no dice nada ni guarda nada. Y al revés,
  con el inglés de antes y con «no hay» sin red metidos a propósito, esas
  tres pruebas saltan: comprobado.

## Los satélites (bloque P2), juntos con el `main` del 21 (21 de octubre, tarde)

Jerome trajo `PARA-CLAUDE-CODE-4.md`, los tres parches y el bundle. Las
cuatro huellas sha256 son las de la nota, y los dos primeros parches son los
que ya están en `main` (solo cambia el «1/3» de la cabecera): entra el
tercero.

- **Repasado antes de ejecutar nada.** El robot nuevo (`satelites.yml`) solo
  escribe `datos/satelites.json`, con `contents: write` y
  `actions/checkout@v5`, como los de AEMET y gasolineras, y su script solo
  habla con CelesTrak. El móvil no se conecta a nada de fuera: el motor y
  los elementos son del propio dominio. En `vendor/satellite.js`, ni
  `eval`, ni red, ni acceso a la página; las direcciones, solo en
  comentarios.
- **Aplicado con `git am -3` sobre `main` (`3d07f22`).** Solo chocó la
  cabecera de idiomas: 1.575 y 30 de los satélites, **1.605 filas** (3.746
  en total, contadas otra vez con `barrido_idiomas.js`). Comprobado contra
  el bundle: los 9 ficheros que solo toca este bloque, idénticos; los 45 que
  solo cambió `main` desde la base del bundle, idénticos; y en
  `modulos/cielo.js`, `auditar_cielo.js`, `index.html`, `README.md` y
  `barrido_pantallas.js`, lo que difiere del bundle es exactamente lo de
  `main` (entre otras cosas, «No hay artículo en tu idioma»).
- **El motor, recompilado aquí** con `tsc` 6.0.2 desde las fuentes fijadas:
  `vendor/satellite.js` sale idéntico byte a byte y cuadra con los 33 casos
  oficiales (667 instantes, desviación máxima 1,15e-7 km).
- **Auditoría entera** (`bash tools/auditar.sh`, con las fuentes del cielo y
  las de los satélites): **«AUDITORIA EN VERDE»**, ningún bloque en rojo ni
  roto. `auditar_cielo.js`, 150 de 150 (los 148 del bloque y los dos de
  Wikipedia); `barrido_pantallas.js`, 99 pantallas y fichas por idioma, 0
  textos sin traducir y 0 errores de página. Las cifras del README y de la
  descarga no cambian (1.034 y 1.148 kB): lo nuevo se pide al abrir el
  panel.

## La prueba aparte de los pasos, en el borde de la sombra (21 de octubre, tarde)

Subidos los satélites y lanzado el robot (elementos de CelesTrak del mismo
día), `auditar_cielo.js` sacó un rojo: el recálculo aparte de un paso del
Hubble del 27 de octubre daba 63,6° de máximo y la app 65,4°. Jerome: «Súbelo
y busca una manera de probarlo».

- **No era la app.** El máximo de ese paso es el instante en que entra en la
  sombra de la Tierra, subiendo. La app usa la sombra de satellite.js (sale
  de la penumbra a la umbra, `shadowFraction < 1`); el recálculo aparte, un
  cilindro, que corta 4 s antes, y el satélite subía casi medio grado por
  segundo. Con un tercer cálculo independiente (el SGP4 de referencia en C++
  de Vallado, por el paquete `sgp4` de Python, con geometría y Sol propios):
  en el instante en que corta la app, 65,3° frente a 65,4°.
- **El arreglo, solo en la prueba.** Si el máximo es el borde de la sombra
  (entra subiendo o sale bajando), no se compara la altura máxima: se
  comparan la hora del borde (±10 s) y la posición en el mismo instante
  (0,05°), que ya se comprobaban. Con él, 150 de 150.
- **Que no se quede ciega, comprobado a propósito.** Con el satélite
  calculado 15 s tarde, dos pruebas en rojo, el recálculo aparte entre
  ellas. Con la posición bien y la sombra 30 s tarde, el recálculo aparte en
  rojo por la hora del borde (Tiangong el 22: la app lo apagaba a las
  19:17:48 y aquí a las 19:17:05). Cada vez, la app restaurada y comparada.
- **Y en el cielo.** El paso de Tiangong de esa noche es este caso: se apaga
  en lo más alto al entrar en la sombra, a 37° hacia el noroeste, a las
  21:13:42 según la app (21:13:38 con el cilindro).

---

# 5 · Cómo se vuelve a medir

```bash
bash tools/auditar.sh                # todo: sintaxis, red, datos, seguridad, idiomas
```

Y cada bloque por separado, si hace falta:

| | |
|---|---|
| `tools/cargar.js` | cargador comun: devuelve la red **ya hidratada** |
| `tools/verificar_red.js` | los controles de la red |
| `tools/auditar_datos.js` | catálogo, líneas, trazado y lugares |
| `tools/auditar_seguridad.py` | inyección, CSP, codificación, textos fijos y tipografía china |
| `tools/auditar_xss.js` | regresión con datos hostiles, en navegador |
| `tools/auditar_web.js` | idiomas, arranque y rendimiento, en navegador; que el mapa no se rehaga de más |
| `tools/extract_js.py` | extrae los `<script>` para `node --check` |
| `tools/fuente.js` · `tools/fuente.py` | el fuente entero para barrerlo: `index.html` y los ficheros propios que carga (`datos/titsa.js`) |
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
| `tools/auditar_etiquetas.js` | los chips del globo: traducidos o declarados con motivo (desde el 7 de octubre, sin la vía «nombre de sitio»), y el mismo chip dos veces en una ficha |
| `tools/barrido_pantallas.js` | lo que **se ve**: 82 paneles y fichas abiertos en los diez idiomas (Rutas usadas, no solo abiertas), buscando castellano que no sea nombre propio, y botones con el mismo emoji dos veces |
| `tools/auditar_tour.js` | el tour de bienvenida **recorrido de verdad**: los diez idiomas, cuatro tamaños de móvil, cada paso con su botón enfocado, la tarjeta dentro de la pantalla, las cifras contadas y nada igual al castellano ni al inglés |
| `tools/auditar_idioma.js` | un idioma entero contra el castellano: cifras, horarios, teléfonos, trozos de etiqueta, alfabeto |
| `tools/auditar_faq.js` | el asistente: cada respuesta en los diez idiomas, alcanzable por su botón, ninguna igual al castellano o al inglés, los botones que cita con su nombre de pantalla, y ninguna base fuera de `faq/` |
| `tools/rotulos_app.js` | los rótulos de la app en los diez idiomas, sacados de `index.html` (lo usa `auditar_faq.js`) |
| `tools/probar_faq.js` · `tools/probar_movil.js` | preguntas de prueba al asistente: en Node con el núcleo de verdad, y en un móvil con la app entera |
| `tools/probar_notificacion_idioma.js` | la notificación diaria en el idioma de cada móvil: lo que la app manda a `guardar_push_sub()` al abrir, al cambiar de idioma y desde el botón sin cuenta, la tarjeta del permiso en los diez, y lo que el envío le manda a cada idioma |
| `tools/probar_nombres.js` | cada lugar preguntado al asistente por su nombre, en los diez idiomas y en chino pegado: sale su ficha o la lista para elegir; el nombre corto, contado; y cada categoría del menú por su rótulo, la lista de esa categoría |
| `tools/auditar_letras.js` | palabras escritas sin sus letras («waehle», «carre avec fleche») |
| `tools/avisos_aemet.py` | baja los avisos de AEMET para Tenerife y escribe `datos/avisos-aemet.json`, con el contorno oficial de cada zona y las zonas de la isla (lo lanza `.github/workflows/avisos-aemet.yml`); si algo no cuadra, no escribe |
| `tools/probar_avisos_aemet.py` | el lector de avisos con copias reales de AEMET (`tools/pruebas/aemet/`): retiradas, sustituidos, caducados, costa, contornos, ficheros rotos, el latido de 3 horas |
| `tools/probar_rutas.js` | Rutas usadas de verdad: guaguas en trayectos conocidos a hora fija, y en los diez idiomas el aviso al elegir origen, el botón tras calcular, sin parada, fuera de horario, ninguna línea, los minutos, los kilómetros del coche y lo que se comparte del itinerario |
| `tools/probar_organiza.js` | «Organiza tu día» entero en los diez idiomas, con el azar fijo: los pasos contra sus tablas, cada tramo calculado otra vez por su cuenta, el título con las catorce tarjetas, Senderismo en Deporte, Norte y Sur sin paradas de la otra zona (y «Otro» tampoco), nunca dos paradas del mismo sitio (comprobado con código propio), el aviso cuando no hay más, el cambio de idioma con el itinerario abierto y ningún texto igual que en castellano |
| `tools/probar_play.js` | lo que pide Google Play (LANZAMIENTO-PLAY.md, Fase 1), en un navegador y con un Supabase falso: la tienda que no se ve ni se abre, el botón de administrador solo para quien lo es, borrar la cuenta (botón, confirmación, fallos y borrado) en los diez idiomas y `borrar-cuenta.html` sin JavaScript |
| `tools/generar_borrar_cuenta.py` | escribe `borrar-cuenta.html` desde `idiomas/borrar-cuenta/` y los botones de la app; con `--comprobar`, para si no está al día |
| `tools/pagina_fija.py` | el armazón de las páginas fijas de la raíz: diez idiomas que se cambian sin JavaScript; lo común, en `idiomas/paginas/` |
| `tools/generar_og_image.js` | `og-image.jpg`, la imagen para compartir: 1200×630, el logo sobre #0F1117 |
| `tools/generar_privacidad.py` | la política: las filas de `UI_TX`, el panel de `index.html` y `privacidad.html`, de la misma pasada; con `--comprobar`, para si no están al día |
| `tools/auditar_readme.js` | cada cifra que el README dice del estado de hoy, contra lo que hay; si la frase cambia, también en rojo |
| `tools/informe_lugares.js` | `REVISION-LUGARES.md`: lo que se puede comprobar de los lugares y lo que no, con cada cifra contada al generarlo; con `--comprobar`, para si no está al día |
| `tools/zonas_lugares.py` | Norte o Sur de cada lugar por el polígono oficial de su municipio: lo escribe en `index.html` y con `--comprobar` lo rehace y lo compara; coteja también las listas Norte y Sur de «Ruta del día» |
| `tools/auditar_claves_tx.js` | cada `tx('…')` con la clave escrita tiene su fila en `UI_TX` (`tx()` devuelve vacío sin avisar) |
| `tools/probar_avisos.js` · `tools/avisos_prueba.js` | los avisos en la app, en un navegador y en los diez idiomas: el punto del 🌊, el panel, las líneas del tiempo y del mar, los costeros en las costas, en «Báñate hoy aquí» y en el globo de cada lugar de costa con los contornos reales de AEMET, comprobación vieja, fichero que no llega |
| `tools/castellano_suelto.js` | el castellano que se queda **dentro** de cada idioma —letras, palabras corrientes, palabras copiadas, alfabeto latino en búlgaro y chino— y las frases que la traducción no tiene; lo que se queda a propósito, en `idiomas/castellano-aceptado.json` |
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
