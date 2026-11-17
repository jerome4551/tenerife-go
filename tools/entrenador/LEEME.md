# tools/entrenador — Jérôme, el entrenador

El vídeo de cada ejercicio de «Su cuerpo». No son archivos de vídeo: Jérôme es un dibujo
vectorial que se mueve dentro de la app. Aquí están sus fuentes; lo que la app carga es
`modulos/entrenador.js` (el motor y las coreografías del bloque 1) y, al abrir una ficha, el trozo de
`modulos/entrenador/` con las coreografías de su grupo. Todo sale de juntar estas fuentes (ver «Por trozos»).

    python3 tools/entrenador/construir.py              # src/ → modulos/entrenador.js y modulos/entrenador/<grupo>.<huella>.js
    python3 tools/entrenador/construir.py --comprobar  # ¿el módulo y sus trozos son los de sus fuentes?
    python3 tools/entrenador/muestra.py                # los datos para las páginas de prueba
    node tools/auditar_entrenador.js 8766              # con python3 -m http.server 8766 en la raíz (tarda unos minutos)
    node tools/auditar_entrenador.js 8766 74           # mientras se hace un bloque: cuadro a cuadro, solo los vídeos de src/74-*.js (pase parcial),
                                                       # y con Samsung Internet (el canvas), todos esos y no tres de muestra

## Qué hay

| fichero | qué hace |
|---|---|
| `src/00-nucleo.js` | vectores, giros (bases y cuaterniones), curvas de tiempo |
| `src/10-esqueleto.js` | las medidas de Jérôme (en cm), la postura escrita → huesos, la mezcla por arcos, clavar un pie o una mano |
| `src/20-figura.js` | la cámara y el cuerpo, dibujado por masas a tres tintas: torso, brazos y piernas, manos con dedos, zapatillas que se doblan, el brillo de los músculos |
| `src/30-cabeza.js` | la cabeza, con volumen: gira de verdad (ya no son tres dibujos). Las caras, la mirada y el tupé, que va un instante detrás |
| `src/40-escenario.js` | la escena: el orden de pintado, la sombra, los tres decorados (fuera, calistenia, gimnasio; día y noche) |
| `src/50-material.js` | barra (y la barra Z), mancuernas, pesa rusa, banco, banco predicador, soporte, barra de dominadas, escalón, pared, polea, toallas… |
| `src/55-vida.js` | lo que le da vida: respira, llega por partes, cabecea al frenar, reparte el peso, acompaña con la mano al hablar |
| `src/60-director.js` | interpreta una coreografía: repetición, secuencias, lo clavado, la estela, los avisos, el encuadre; y los gestos del presentador |
| `src/70-coreografias.js` | **las coreografías**, una por ejercicio: el bloque 1 (los 40 más conocidos de los 12 grupos) y las ayudas comunes (`tabla`, `bajaSube`, `aLosLados`, las manos; y las de cualquier bloque: `conAgarre`, `estirado`, `inclinado`, `colgando`, `anteTronco`, `cuelga`/`activo`, `barraD`, `manoHacia`, `deTalon`, `enPunta`, `enSuMuslo`, `pieSobreSuelo`…) |
| `src/71-pecho.js` | las coreografías del bloque 2: **pecho** (35), por familias (tumbado en un banco, las poleas, las flexiones, los fondos, los estiramientos) |
| `src/72-dorsal.js` | las coreografías del bloque 3: **dorsal** (35), por familias (colgado de la barra, el front lever, los jalones, los remos, la polea a una mano, los estiramientos) |
| `src/73-espalda-alta.js` | las coreografías del bloque 4: **espalda alta** (30), por familias (los encogimientos, el remo sentado en polea, los remos libres, los omóplatos, tumbado boca abajo, los estiramientos del cuello) |
| `src/74-hombros.js` | las coreografías del bloque 5: **hombros** (34), por familias (los press, las elevaciones, la polea a una mano, el deltoides posterior, entre dos poleas, los rotadores, la pica y el pino, la movilidad y los estiramientos) |
| `src/75-biceps.js` | las coreografías del bloque 6: **bíceps** (36), por familias (de pie con barra, con mancuernas y con pesa rusa; en un banco; el banco predicador y la araña; las poleas; la barra fija; el estiramiento) |
| `src/76-triceps.js` | las coreografías del bloque 7: **tríceps** (37), por familias (tumbado: el press francés y sus variantes; por encima de la cabeza; las patadas; las poleas; los press en banco; los fondos y las flexiones; el estiramiento) |
| `src/77-antebrazo-pantorrilla.js` | las coreografías del bloque 8: **antebrazo** (16) y **pantorrilla** (19), por familias (los curls de muñeca; la muñeca, de pie; los paseos con carga; la dominada con toallas; las flexiones sobre las yemas; los estiramientos de la muñeca · las elevaciones de talón de pie, en escalón, con barra y sentado; el tibial; los saltos; los estiramientos) |
| `src/78-cuadriceps.js` | las coreografías del bloque 9: **cuádriceps** (31), por familias (las sentadillas sobre los dos pies: con mancuernas, con barra, con apoyo, en la pared, la hindú; sentarse y levantarse; los escalones; a una pierna; de rodillas; en el suelo; los estiramientos de pie y tumbado de lado; los saltos) |
| `src/79-gluteos.js` | las coreografías del bloque 10: **glúteos** (43), por familias (tumbado de lado; de lado sobre el antebrazo y las planchas de Copenhague; a cuatro patas y boca abajo; de pie con las manos en la pared; el puente y el hip thrust; las poleas, con la tobillera y con la cuerda; la pesa rusa; las zancadas: en el sitio, al frente, atrás, andando, cruzada y de lado, sin peso, con mancuernas y con barra; la búlgara; el escalón de lado; el peso muerto sumo; los estiramientos; los saltos) |
| `src/80-reproductor.js` | el vídeo: cabecera, un tramo por paso, cierre; los mandos; la voz (y qué voz); sus textos (10 idiomas) |
| `src/85-lienzo.js` | Samsung Internet: el dibujo en un canvas que copia el SVG, porque su modo oscuro repinta los SVG (el mismo arreglo que el del tour, en `modulos/guia.js`; 12 de noviembre de 2026) |
| `src/90-huellas.js` | lo escribe `construir.py`: la huella de los pasos con los que se hizo cada coreografía (todas; al motor van las del bloque 1 y a cada trozo, las suyas) |
| `src/95-trozos.js` | las coreografías, por trozos: qué fichero tiene cada ejercicio, y pedirlo cuando hace falta (`pedir`, `todo`, `_trozo`) |
| `src/99-salida.js` | `window.TG_ENTRENADOR` |
| `pruebas/` | hojas de contacto, un ejercicio desde varios lados (`vistas.html`), el repaso paso a paso contra la ficha (`repaso.py`), las medidas de una postura (`mide.js`), el camino de una postura a otra (`camino.js`: dónde una zapatilla baja del suelo), los contactos (`contactos.js`: el suelo, las paredes, la mano que se apoya y las manos en los muslos, de todas o de una; lo usa la auditoría), los gestos fotograma a fotograma, el reproductor suelto, las capturas y la grabación a MP4 |
| `muestra/` | la página de muestra (un solo fichero, para enseñarla en el móvil) |

## Por trozos (16 de noviembre de 2026)

Hasta el bloque 8 todo iba en `modulos/entrenador.js`: 729 kB con 282 ejercicios, y a ese paso 2,2 MB con los 958.
Ahora el módulo va partido:

- **`modulos/entrenador.js`**: el motor (`00` a `60`, `80`, `85`, `95`, `99`) y `70-coreografias.js`, que son las ayudas
  de todas las coreografías y las 40 del bloque 1. Es lo que el service worker precarga. Ya no crece con cada bloque
  (solo la lista de qué ejercicio va en qué trozo: unos 25 bytes por ejercicio).
- **`modulos/entrenador/<grupo>.<huella>.js`**: un fichero por cada fuente `src/7N-<grupo>.js` con N de 1 en adelante
  (`71-pecho.js` → `pecho.<huella>.js`; después del `79`, `7a`, `7b`…). `<huella>` son los 8 primeros caracteres del sha256
  del fichero: si cambia una coma, cambia el nombre, y los que ya no salen de ningún fuente se borran al construir.

**Cómo se piden.** `TG_ENTRENADOR.pedir(id)` devuelve una promesa: trae el trozo de ese ejercicio si no está (una
etiqueta `<script>` junto al motor) y dice si tiene coreografía; falla si el trozo no llega. Hasta entonces `tiene(id)`
dice que no, y `montar` no monta. `ids()` los da todos, hayan llegado o no. `todo()` los trae todos. «Su cuerpo»
(`modulos/cuerpo.js`, `videoEj`) llama a `pedir` antes de `tiene`; si falla, la ficha queda sin vídeo y sin botón, y la
siguiente lo vuelve a intentar.

**Por qué la huella en el nombre.** Un motor pide siempre los trozos con los que se construyó y se auditó: nunca se
junta con otros. Y el service worker no necesita ninguna regla: un fichero que no cambia nunca se guarda con lo de por
defecto («cache primero», como las mallas del 3D), así que **`sw.js` no se toca**.

**Sin conexión.** El motor va en la precarga. Los trozos, no (crecen con cada bloque): los guarda «Su cuerpo»
(`guardarVideos`, en `modulos/cuerpo.js`) de uno en uno y sin prisa, la primera vez que se cargan los ejercicios con
conexión (al abrir la lista de un grupo, el plan o una sesión: es cuando se guardan también sus datos) y cada vez que
llega un motor nuevo. Los nombres los lee de la cabecera del motor. Al acabar quita de la cache los trozos que el motor
guardado ya no nombra. No lo hace si el móvil pide ahorrar datos (`saveData`), ni por una conexión 2g, ni sin service
worker. Y es aparte: nada de lo que le pase llega a la carga de los ejercicios ni a la del motor (va entero en un
`try`; la auditoría lo prueba con un navegador en el que leer `navigator.serviceWorker` lanza un error). Dentro de la
app de las tiendas no hay service worker: `tools/app_preparar.js` mete todos los trozos en el paquete.

**Qué es un trozo.** Una función que el motor llama una vez: recibe lo que usa de él (`N`), define sus `COREO` y
devuelve las huellas de sus pasos. `construir.py` saca solo lo que cada trozo importa (todo nombre del nivel de arriba
del motor que aparezca en su texto). Dos reglas para escribir un fuente `7N`:

1. **Va encerrado en su función** (`(function () { … })();`), sin nada declarado fuera: lo que quiera compartir con
   otros trozos va en `70-coreografias.js`.
2. **Del motor solo usa lo que no cambia** después de declararse (funciones y constantes). `construir.py` se para si no.

Los nombres se buscan en todo el texto del trozo, comentarios incluidos, y se cortan como los corta JavaScript: una
letra con tilde no es letra de nombre, así que «cruzándose» en un comentario cuenta como usar `cruz` (la auditoría lo
lee así; desde el bloque 10 `construir.py` también, y lo importa: antes no, y la auditoría decía «usa cruz y no lo recibe»).

**Las herramientas.** En Node, `pruebas/motor.js` carga el motor y todos sus trozos (`contactos.js`, `camino.js`,
`mide.js` y la auditoría lo usan). Las páginas de `pruebas/` llevan `todo.js` detrás del motor, que trae todos los
trozos antes de seguir; `pruebas/trozos.html` es la única que carga el motor solo, y con ella la auditoría mira qué se
pide y cuándo. La página de muestra los lleva todos pegados. `tools/fuente.js` y `.py` leen los trozos de la cabecera
del motor (`CARGA-PEREZOSA`), así que las herramientas que barren el fuente los siguen viendo.

## La regla

Cada coreografía sale de los pasos verificados de la ficha del ejercicio
(`datos/cuerpo/ejercicios-es.json`) y **no añade técnica que la ficha no diga**. Lo que se lee
en el vídeo es el texto de la ficha, tal cual. Si la ficha no nombra la respiración, Jérôme no
«sopla»; si no dice dónde van los brazos, van donde menos digan.

`construir.py` apunta la huella de esos pasos. Si alguien cambia un paso de una ficha,
`auditar_entrenador.js` se pone en rojo hasta que la coreografía se revise y se vuelva a construir.
Y `TG_ENTRENADOR.tiene(id, n)` solo dice que sí cuando la ficha trae los mismos `n` pasos.

## El mundo

Centímetros. Jérôme mira hacia **+Z**, **+Y** es arriba y **+X** es **su** izquierda. La cadera, de
pie, está a 86; el hombro, a 129,5. La cámara: `rumbo` 0 lo mira de frente, 90 desde su izquierda,
180 por la espalda.

## Una postura

Se escribe para el lado izquierdo; lo compartido (`b`, `m`, `p`, `t`) se refleja para el derecho.
Con `bi`/`bd`, `mi`/`md`, `pi`/`pd`, `ti`/`td` se da cada lado por separado.

| clave | qué es |
|---|---|
| `pel: [x, y, z]` | dónde está la pelvis (de pie: `[0, 86, 0]`) |
| `giro: [rumbo, cabeceo, alabeo]` | el tronco entero: cabeceo + se inclina hacia delante; −90, tumbado boca arriba |
| `col: [flexión, lado, torsión]` | la columna |
| `cab: [cabeceo, rumbo, alabeo]` | la cabeza (cabeceo − mira arriba) |
| `hom: [sube, adelanta]` | los hombros (encogerlos, juntar omóplatos: adelanta −) |
| `b: { e, z, g, c }` | el brazo por ángulos: `e` cuánto se levanta (0 cuelga, 90 horizontal), `z` hacia dónde (0 al frente, 90 al lado), `g` giro del húmero, `c` el codo |
| `b: { a: [x, y, z], polo: [...], en: 'torax' \| 'pelvis' }` | el brazo por destino: la muñeca va a ese punto (del mundo, o del tórax o la pelvis) y el codo tira hacia `polo` |
| `b: { cuelga: [dx, dz], largo }` | el brazo colgando a plomo del hombro (peso muerto) |
| `m: { tipo, prono, mun, lat }` | la mano: `puno`, `abierta`, `plana`, `suelta`, `indice`, `pulgar`, `separados` (abierta, con los dedos bien separados) y `yemas` (esa misma en tienda: apoyada solo en las yemas y el pulgar, o en garra sobre algo ancho); un gesto pasa a otro poco a poco: los dedos se cierran, no saltan. `prono` 90 palma abajo o atrás, −90 arriba o adelante; `mun`, cuánto se dobla la muñeca (+ hacia la palma, − hacia el dorso); `lat`, cuánto se ladea (+ hacia el pulgar en la mano izquierda; no se refleja en la derecha) |
| `m: { tipo, barra: [x, y, z], palma: [x, y, z] }` | la mano que **agarra algo**: se dice, en el mundo, a lo largo de qué va lo que agarra (`barra`) y hacia dónde mira la palma (`palma`; con `barra`, solo de qué lado queda), y el antebrazo gira lo que haga falta, esté el codo donde esté. `EN_BARRA` (la palma hacia delante: una dominada, un press tumbado), `EN_BARRA_SUP` (hacia él). Con `prono` solo, el puño gira con el codo y acaba atravesado en la barra |
| `m: { tipo, palma: [x, y, z], dedos: [x, y, z] }` | la mano que **se apoya de plano** en algo: se dice, en el mundo, hacia dónde mira la palma y hacia dónde van los dedos, y la mano se queda así haga lo que haga el antebrazo (sin `dedos`, los dedos siguen la línea del antebrazo y la mano se inclina con él: las yemas se hunden o el talón de la mano se levanta). `apoyada(dedos, palma, tipo)` la escribe; `EN_SUELO` (la palma abajo, los dedos al frente) y `PLANA_PARED` (la palma hacia la pared de delante, los dedos arriba). La muñeca de una mano apoyada va a **`ALTO_MUN` (2,7 cm)** de su superficie; de canto (el meñique abajo), a `ALTO_CANTO` (5,1) |
| `p: { suelo: [x, z], abre, talon, alto, polo }` | el pie plantado: dónde cae el tobillo, cuánto apunta hacia fuera (`abre`, positivo hacia fuera **también en el pie derecho**: `pd: { suelo: [-10, 0], abre: 4 }`), cuánto sube el talón, sobre qué altura pisa |
| `p: { a: [x, y, z], polo }` · `p: { e, z, g, c }` | la pierna por destino del tobillo, o por ángulos (colgado, tumbado) |
| `t: { punta, arriba, flex }` · `t: { tob }` | el pie a mano (vectores del mundo; `flex`, cuánto se dobla la zapatilla por la bola del pie) o el ángulo del tobillo |

Ayudas: `sobre(base, cambios)`, `refleja(postura)`, `tabla(ángulo, extra)` (en plancha sobre las
puntas), `aLosLados(codo)`, `PUNO`, `PRONO`, `SUPINO`, `SUELTA`, `PALMA_ABAJO`, `EN_BARRA`, `EN_BARRA_SUP`, `COLGADO`,
`bajaSube`, `subeBaja`.

La rodilla de un pie plantado se dobla hacia delante de la pelvis; con el tronco muy inclinado (una bisagra de cadera:
más de 50°) va hacia donde apunta el pie, que es por donde se dobla de verdad. Si hace falta otra cosa, `polo`.

Una pierna dicha por ángulos se dobla hacia atrás de donde se levanta: con `z: 180` (el muslo hacia atrás) la rodilla
se doblaría al revés. La pierna que queda atrás (el pie que acaba de dejar el suelo, la que se recoge en un salto) se
dice por su tobillo (`a`), con `polo` hacia delante. Y tumbado de lado con la pierna casi recta, igual: por su tobillo
y con `polo` hacia el frente del cuerpo; si no, el plano en que se dobla queda al azar y el pie apunta al suelo.

## Una coreografía

```js
COREO['sentadilla-peso-corporal'] = {
  vista: [42, 90],                 // la cámara, y la de «Girar» (un rumbo, o [rumbo, picado] si esa se mira desde otra altura)
  rastro: 'pel',                   // qué punto deja estela (PUNTOS, en 60-director.js)
  esfuerzo: [2],                   // en qué tramos de la repetición aprieta (la cara, el brillo)
  clavos: ['ti', 'td'],            // lo que no se mueve: tobillos (ti, td), manos (mi, md)
  posturas: { a: {...}, b: {...} },
  rep: bajaSube('b', 'a'),         // [[postura, segundos, curva, clavos del tramo], …]
  pasos: ['a', 'rep', 'rep', 'rep']   // UNO POR PASO DE LA FICHA
};
```

En `pasos`, cada paso de la ficha es: una postura (`'a'`), la repetición (`'rep'`, o `{ rep: 2.1 }`
para entrar en ese segundo del ciclo), una secuencia que se toca una vez
(`{ sec: [['arr', 0.9, 'suave'], …], desde: 'sop' }`) o `'nota'` (un consejo: Jérôme lo dice de cerca).

Más claves: `material: [['barra', {…}], …]`, `inicio`, `encuadra: [...]` (posturas que también tienen
que caber), `isometrico: 'c'`, `reposo: ['a0']` (el material espera en su sitio), `sinClavos: ['f']`
(posturas en las que ya se ha soltado), `clavosEn: { s: ['ti', 'td'] }` (lo que va clavado mientras se mantiene esa
postura, si no es lo de `clavos`: una mano solo se clava donde agarra o apoya; la que cuelga suelta mientras espera, no:
clavada en el aire, el cuerpo, que respira y se balancea, se le echa encima), `picado` (16 para los ejercicios de suelo), `zoom`, `corre: [dx, dy]` (el
encuadre, corrido eso en las dos vistas, en px de los 400 del dibujo: en un pino, la cabeza y las manos caen justo
bajo los rótulos de los músculos, y con `corre: [50, 0]` quedan a su derecha), `sobreManos: true` (anda sobre las
manos: el tronco no va un instante detrás de la cadera, que es lo que hace «la vida» en los demás; con los brazos
estirados y las manos clavadas, esa demora las dejaba fuera de alcance. Lo lleva el pino contra la pared).

Los clavos: `'ti'` (el tobillo, donde esté), `'mi@0:28'` (la mano al agarre del material 0, a 28 cm
del centro), `'mi=x,y,z'` (a un punto).

**Cuánto dura un paso.** Lo que se tarda en leer su texto (`80-reproductor.js`: 4,4 s como poco, y 0,058 s por letra,
o 0,16 por carácter en chino), **no lo que dure su acción**. La repetición da las vueltas que quepan; pero una
secuencia (`sec`) más larga que su paso se queda a medias cuando entra el siguiente, y «vuelva despacio» no llega a
verse. Así que cada secuencia tiene que caber en su paso **en el idioma en que el texto es más corto** (lo que sobre
tras la última postura, si es quedarse quieto en ella, no cuenta: mantener sí puede pasar de largo). Y si el paso es
el primero, o el que sigue a un consejo, su acción arranca 0,25 s después (la cortinilla del cambio de plano).
`auditar_entrenador.js` lo mira en los diez idiomas y dice cuál va más justa.

**A cámara lenta («½×»)** el Director va a 0,45 mientras se ve un ejercicio, y el reloj del reproductor va a la
velocidad de lo que se está viendo (`tm`, en `80-reproductor.js`): el paso de un ejercicio dura 1/0,45 veces lo suyo
y se ve lo mismo que a velocidad normal, más despacio (la secuencia entera y, al acabar el paso, la repetición por el
mismo punto). Lo que cabe a velocidad normal cabe a cámara lenta. El texto y la voz van a su ritmo (`tt`, el tiempo de
verdad). De cerca (la cabecera, un consejo, el cierre) no hay ejercicio que mirar despacio: el gesto del presentador
va a su velocidad y el tramo dura lo mismo. La cortinilla de un cambio de plano va con lo que tapa: al dejar un
ejercicio, despacio (el ejercicio avanza debajo lo mismo que a velocidad normal, y por eso ese tramo de cerca dura
0,3 s más); al dejar un plano de cerca, a su velocidad. Hasta el 14-11-2026 cada paso duraba lo mismo con «½×» y el
movimiento se quedaba a medias en más de la mitad de los vídeos.

La repetición no vuelve a empezar de un paso `'rep'` al siguiente: sigue por donde iba. `{ rep: 2.1 }` solo cuenta
cuando se llega a ese paso desde una postura o una secuencia (o saltando a él con los mandos).

## Los bloques

Los ejercicios se hacen por bloques, y cada bloque nuevo va en su trozo `7x` (`construir.py` apunta la huella de los
pasos de cada ejercicio y saca cada `7N`, de `71` en adelante, a su fichero de `modulos/entrenador/`: ver «Por trozos»). Los bloques 1 a 15 reparten los 533 ejercicios que el
catálogo tenía hasta el 13-11-2026, y las cuentas de la tabla («quedan N») son sobre esos 533. Desde ese día el catálogo
crece con ejercicios para casa y fuera (950 fichas el 13-11, 958 el 14-11): los que pasan de aquellas 533 (botellas, silla,
mochila, toalla, mesa, aparatos biosaludables…) están sin repartir en bloques y ninguno tiene coreografía todavía.

| bloque | trozo | qué |
|---|---|---|
| 1 | `70-coreografias.js` | los 40 más conocidos, de los 12 grupos |
| 2 | `71-pecho.js` | pecho: 35 (todo lo que no pide banda, máquina, cinta de suspensión, fitball ni disco) |
| 3 | `72-dorsal.js` | dorsal: 35 (quedan 5: las dominadas asistidas con banda y en máquina, las lastradas con disco y el lanzamiento de balón medicinal) |
| 4 | `73-espalda-alta.js` | espalda alta: 30 (con los 3 del bloque 1, 33 de 44; quedan 11: 5 con banda, 4 en máquina y 2 con cinta de suspensión) |
| 5 | `74-hombros.js` | hombros: 34 (con los 3 del bloque 1, 37 de 47; quedan 10: 4 con banda, 3 en máquina, 2 en multipower y 1 con disco). El 14-11-2026 (nota 47) el pino contra la pared pasó de tres pasos a cuatro: su ficha dice ahora cómo se sube y cómo se baja, y el vídeo lo hace. El 17-11-2026 (nota 52) su paso 2 acaba en «o hasta donde le resulte cómodo» (Trainwell): la coreografía es la misma; el paso dura más, lo que su texto, y Jérôme se queda ese rato arriba |
| 6 | `75-biceps.js` | bíceps: 36 (con los 3 del bloque 1, 39 de 50; quedan 11: 4 con banda, 4 con cinta de suspensión, 1 en máquina, 1 con disco y 1 con fitball) |
| 7 | `76-triceps.js` | tríceps: 37 (con los 3 del bloque 1, 40 de 47; quedan 7: 2 con cinta de suspensión, 2 con anillas, 1 en multipower, 1 en máquina y 1 con banda) |
| 8 | `77-antebrazo-pantorrilla.js` | antebrazo: 16 (con el del bloque 1, 17 de 22; quedan 5: 4 con banda y 1 con disco) y pantorrilla: 19 (con los 4 del bloque 1, 23 de 30; quedan 7: 4 en máquina y 3 con banda) |
| 9 | `78-cuadriceps.js` | cuádriceps: 31 (con los 6 del bloque 1, 37 de 50; quedan 13: 6 en máquina, 2 con disco, 2 con banda (uno, además, con polea), 1 con cinta de suspensión, 1 en multipower y 1 con balón medicinal) |
| 10 | `79-gluteos.js` | glúteos: 43 (con los 4 del bloque 1, 47 de 57; quedan 10: 6 con banda, 3 en máquina y 1 con fitball) |

En un trozo de bloque, los ejercicios van **por familias**, con una función por familia (en `71-pecho.js`:
`tumbado(inclinación)`, `brazo(inclinación, desde el hombro)`, `pressMancuernas`, `pressBarra`, `aperturas`, `cruce`,
`plancha`…; en `72-dorsal.js`: `cuelga`/`activo`/`arriba` (colgado), `palanca(cabeceo, ángulo de los brazos)` (el front
lever), `sentado` + `arribaJ`/`abajoJ` (los jalones), `inclinado(ángulo)` + `colgando`/`anteTronco` (los remos),
`arrodillado`…; en `73-espalda-alta.js`: `remoSentado(manos, mano, {…})` (en la máquina de remo), `bocaAbajo` +
`brazoEn(postura, ángulo, altura)` + `elevacionProna` (la Y, la T, la I), `aUnBrazo(postura, muñeca, …)` (el cuerpo, a
un brazo estirado justo de una mano apoyada: las flexiones escapulares)…; en `74-hombros.js`: `sentadoEnRespaldo(grados)` y
`sentadoAlBorde(inclinación)` (en un banco), `poleaLado(alto)` + `alAsa(alto)` (la polea a una mano: se gira hasta que la
mano llega al asa), `enCruz` y `cuelgan` (los pájaros), `enBancoAlto` (boca abajo, con los brazos colgando), `planas(postura)`
(las manos, planas en el suelo con los dedos hacia delante, llegue el antebrazo como llegue), `picaEn(muñecas, alto)` (la
pica: `arriba(beta)`, con los brazos estirados, y `abajo(beta, y)`, con la frente a «y» del suelo; con beta −20 es una
plancha y con 34 la V invertida, así que de una a otra solo sube la cadera) y `pino(cabeceo, muñecas, zHombros, extra,
yHombros)` (cabeza abajo sobre las manos)…; en `75-biceps.js`: `codoDe(postura, adelante, fuera)` + `doblado(postura, codo, grados)`
(el curl: el codo se fija en su sitio y el antebrazo gira sobre él; con una barra, `codoHacia` y `abre`, para que las manos no
cambien de sitio en ella), `curlBarra({…})`, `alterno({…})`, `PRED` (el banco predicador: el cuerpo sentado, dónde va el cojín
para ese cuerpo, el codo sobre él)…; en `76-triceps.js`: `alzado(postura, hacia dónde, hacia dónde se dobla, grados, G)` (el
brazo casi estirado desde el hombro: devuelve el codo, que ya no se mueve, y el puño de arriba), `frances({…})` (tumbado en
cualquier banco: el brazo quieto y el antebrazo que baja hacia la cabeza), `dosManosArriba({…})` (una mancuerna entre las dos
manos por encima de la cabeza: para subirla, rodea la cabeza), `patada(postura, brazo, antebrazo, lado)`, `empujon({…})` (ante
la polea alta, con el codo en el costado), `pressCodos({…})` (los press con los codos pegados) y `plana(postura, dedos)` (la
mano abierta, plana en el suelo o en el banco, llegue el antebrazo como llegue)…; en `77-antebrazo-pantorrilla.js`: `enMuslos` + `curlMunecaBarra({…})` (sentado, con los antebrazos a lo
largo de los muslos y las muñecas pasadas las rodillas), `arrodillado(atrás, cabeceo)` + `anteBanco` (de rodillas ante un banco
atravesado, con los antebrazos encima y las manos por fuera del borde), `paseo(base)` (andar de verdad: `tramo`, las posturas y la
secuencia de cuatro pasos; `vuelta`, la media vuelta; `enMarco`, del marco de quien anda al mundo), `aCoger(base, agarre)` (agacharse
a por lo que espera en el suelo), `estiraMuneca({…})`, `enBorde(x, talón)` (el pie en el borde de un escalón), `pieEnBloque` +
`sentadoEn` / `pieBajo` + `sentadoBajo` (sentado con los pies en un bloque, o en un banco bajo con los pies en el suelo) y
`enTalon(lado, [x, z], grados)` + `piesEnTalon` (el pie apoyado solo en el talón, con la punta levantada: el tibial)…; en
`78-cuadriceps.js`: `agachado(pies, y, z, inclinación, extra)` (en sentadilla sobre los dos pies: la cadera a esa altura y a esa
distancia por detrás de los tobillos, el tronco inclinado eso y la cabeza mirando al frente), `altoCon(dx)` (lo más alto que puede
ir la cadera con un tobillo a `dx` de su vertical: de pie con los pies muy abiertos), `abrirPies(posturas, prefijo, base, de, a, fin,
segundos)` (abrir los pies de uno en uno y por el aire: añade sus posturas y devuelve los tramos), `alAire(grados, caída)` (un pie
en el aire, girado y con la punta algo caída), `ESPALDA` + `A_LA_BARRA` + `enBarra(n)` (la barra sobre los hombros: el material,
los brazos y los clavos), `subidaBanco(carga, clavos)` (subir a un banco y bajar, primero una pierna y después la otra, y la
siguiente vez al revés: las posturas, la repetición y por dónde va el pie para no atravesar el canto), `DE_RODILLAS` + `K_ROD`
(de rodillas: con `porArco`, la cadera gira sobre las rodillas) y, tumbado de lado con la cabeza en la mano, el codo que se
apoya donde le toca (a un brazo del hombro y a un antebrazo y una mano de la cabeza) y `medio(lado)` (a medio rodar de un lado
al otro sobre la espalda: la orientación se da por sus ejes, con `base: baseEjes(…)`)…; en `79-gluteos.js`: `deLado` + `almohada` +
`piernaAbajo`/`piernaArriba`/`piernaCon` (tumbado de lado, con la cabeza sobre el brazo de abajo: la pierna de abajo descansa donde la
zapatilla no se hunde y la de arriba gira sobre su cadera) y `darLaVuelta(posturas, prefijo, de, dobladas)` (cambiar de lado rodando
sobre la espalda: añade sus posturas y devuelve los tramos), `recostado` + `enLinea(grados, hombro)` + `antebrazoEn` (de lado sobre el
antebrazo: con la cadera en el suelo o en línea, sin que el hombro de abajo se mueva de encima del codo), `aCuatro` (a cuatro patas),
`aLaPared` + `piernaRecta(postura, fuera, atrás)` (de pie con las manos en la pared), `enPuente(grados)` y `enBanco(alto de la cadera)`
(el puente y el hip thrust: los hombros no se mueven de su sitio) con `enIngle(postura, radio)` (dónde descansa lo que se lleva en el
pliegue de la cadera: la barra con su almohadilla, las mancuernas), `zancadas(x, carga, xa)` (todas las posturas de una zancada, dichas
por dónde pisa el pie de delante: `pie`, `alta`, `baja`; el paso al frente, `va` y `talon`, y su vuelta, `empuja` y `vuelve`; el paso
atrás, `atras` y `sube`; y andando, `alza` y `pasa`), `conMancuernas` y `conBarra` (la carga: vale con el cuerpo mirando a cualquier
lado), `andando(x, carga, juntando)` (las zancadas caminando: ida, media vuelta y regreso, con `enMarco`, como los paseos del bloque 8),
`lateral(carga, inclinación)` (el paso de lado y la bajada, con la espinilla a plomo: se busca hacia dónde va la rodilla), `bulgara(carga)`
(el pie de atrás sube al banco por el aire, sin cortar su canto), `corre(f)` + `corriendo(izquierdo, derecho)` (los brazos, como al
correr: los del bloque 9) y `abrirPies`, `altoCon` y `alAire` (las del bloque 9, que cada trozo guarda las suyas)…) y cada ejercicio es esa función con sus números. **Cada ejercicio se coteja con su ficha paso a paso**:
si el paso 2 dice «suba las mancuernas», en el paso 2 suben; si dice «las palmas enfrentadas», se miran.

Las ayudas que valen para cualquier bloque están en `70-coreografias.js` (nacieron en el bloque 3 y el 4 las subió
allí; cada trozo es una función cerrada y no ve las de otro): `conAgarre(postura, punto, polo, lado)` (el centro del
puño cae en ese punto del mundo: una barra que va al ombligo, una mancuerna junto a la cadera), `estirado(postura,
hacia, lado)` (el brazo, estirado desde el hombro hacia un punto: la polea), `inclinado(ángulo, extra)` (la bisagra de
cadera), `colgando(postura, manos, delante)` (los brazos a plomo), `anteTronco(postura, arriba, fuera, x)` (un punto
ante el tronco: el ombligo, el pecho), `cuelga`/`activo`/`clavosB`/`barraD` (colgado de la barra), `une`, `busca(f, meta,
lo, hi)` (el valor con el que algo mide lo que tiene que medir: cuánto hay que inclinarse para llegar a un asa),
`aUnBrazo(postura, muñeca, lo, hi)` (el cuerpo, a un brazo estirado justo de una mano apoyada) y, sentado en un banco,
`silla5(grados)` + `sentadoEnRespaldo(grados)` y `BANCO_DETRAS` + `sentadoAlBorde(inclinación)` (nacieron en el bloque 5 y el 6
las subió allí); tumbado boca arriba, `bancoDe(grados)` + `tumbadoEn(grados, extra)` (0, plano; 45, inclinado; −15, declinado: las
mismas medidas que las del bloque 2, que guarda las suyas); y, para el codo que no se mueve, `flexion(postura, codo, grados,
hacia)` y `flexionG(postura, codo, grados, hacia, G)` (el antebrazo gira sobre un codo fijo; con G, el puño no cambia de sitio
en su barra) con `dirFlex` y `abre` (nacieron en el bloque 6 y el 7 las subió allí); la mano dicha en el mundo, `manoHacia(postura, lado,
dedos, palma, tipo)` (hacia dónde van los dedos y hacia dónde mira la palma: devuelve el `prono`, el `mun` y el `lat` que hacen
falta con el brazo tal como queda); de puntillas, `deTalon(grados)` (cuánto se adelanta y sube el tobillo: la cadera va con él) y
`enPunta(x, talón)` (el pie apoyado solo en la punta: por ahí se despega y se posa); sobre un muslo, `puntoEnMuslo(postura, s, h,
lado)` (un punto sobre el muslo tal como queda: lo que se lleva encima sube y baja con la rodilla) y `enSuMuslo(postura, lado)` +
`enSusMuslos(postura)` (la mano que descansa en el muslo de su lado, plana y sobre su cara de arriba, no dentro de él) (nacieron en
el bloque 8, donde se llamaban `manoA`, `sobreMuslo`, `manoEnMuslo` y `manosEnMuslos`, y el 9 las subió allí con nombres que no
tiene ningún otro trozo: un nombre del motor que aparece en un trozo se importa en él, y su fichero cambia de nombre); y, tumbado
de lado, `pieSobreSuelo(postura, lado)` (el tobillo de abajo sube lo justo para que la zapatilla, que es más ancha que él, no se
hunda; nació en el bloque 5 y el 9 la subió allí). Lo que se
coge más tarde (el agarre de la polea, la barra T en el suelo, unas mancuernas) espera en su sitio: `reposo` en el
material y en la coreografía. Y si dos cosas se cogen en momentos distintos (el asa de una polea y después la de la
otra), cada una trae su lista: `reposoEn: ['s', 'g1']`, en su material (espera mientras la postura de la que se sale
esté en esa lista).

Lo que casi no se mueve (encoger los hombros, juntar los omóplatos, los círculos de hombros) se escribe con `hom:
[sube, adelanta]`, en centímetros: 6 de subida es «lo más alto que pueda»; −3 de adelanto, los omóplatos juntos.

**El codo que no se mueve** («sin mover los codos», «sin despegar el brazo»): las dos posturas dan el mismo codo (un punto
del mundo, a un brazo justo del hombro) y la muñeca a un antebrazo justo de él, con `polo` hacia el codo. Entre una y otra el
brazo no cambia y el antebrazo va por su arco: el codo se queda donde está (medido: 0 cm). Y con el brazo casi estirado, que el
antebrazo se doble solo hacia delante respecto del brazo, nunca hacia dentro: si no, la mano (que se orienta por la bisagra del
codo) no sabe hacia dónde mira. Por eso con una barra el codo va en la línea del hombro al puño (`codoHacia`, `alzado`); y donde
el antebrazo tiene que ir hacia dentro (el codo en el costado y las manos juntas en la barra en V de la polea), o el brazo
cuelga estirado, la mano se dice en el mundo (`palma: […]`, y `barra: […]` si agarra una barra).

**Los saltos** (bloques 1, 8, 9 y 10). En el aire no hay nada clavado (`[]` en ese tramo). Se despega por las puntas y se cae sobre
la parte delantera del pie, que rueda hasta el talón mientras la cadera baja. Con el tobillo clavado, pasar de pisar de plano a
estar de puntillas en un solo tramo hunde la zapatilla (el tobillo va en línea recta y el pie gira sobre su bola: 1,1 cm con 48°):
entre agachado y despegando va una postura de **medio empuje**, con el talón a medio levantar y la cadera a medio camino. En un
salto que cambia de sitio (el horizontal) las posturas de la vuelta son las de la ida giradas media vuelta, y la cámara encuadra
todo el recorrido. Y un brazo que sube de golpe (del costado a por encima de la cabeza) también se reparte entre las posturas del
impulso: en un solo tramo de una décima, la mano iría a más de medio metro por cuadro.

## El material (`50-material.js`)

`barra` (con discos; `z: true`, la barra Z; `una: 'i'`, la lleva una mano por el centro; `almohadilla: true`, con un rulo de goma
de 40 cm en el centro: el hip thrust), `mancuernas` (una en cada mano, en
una sola, o una entre las dos; `reposo: { i: [x, y, z], d: […] }`, dónde esperan hasta que se cogen, y `ejeReposo`, a lo largo
de qué; con `lado: 'i', otra: 'd', reposo: {}`, mientras espera la lleva la otra mano: se la pasa; con `dos: true`, una sola
entre las dos manos: a lo largo de la mano izquierda, de `ejeDos` (en el marco del tórax) o, con `medio: true`, de la media de
las dos manos; `corre`, cuántos centímetros se corre a lo largo de su eje (las manos, bajo un disco); `une: true`, si las
manos se separan se queda con la de `lado`: la otra la suelta un momento y vuelve a cogerla; `extremo: true`, cogida por un extremo y
no por el asa: la mano, en garra sobre el disco de arriba, y la mancuerna a plomo bajo ella; `toalla: true`, una toalla en el asa: mientras
espera, monta abierta sobre el asa, y se enrolla cuando la mano que llega a ella se cierra), `kettlebell` (`cuelga: true`,
a plomo de su asa: en un curl), `banco`, `predicador` (el banco Scott), `soporte` (el de la barra), `barra_dominadas`,
`paralelas`, `escalon` (con `madera: true`, un cajón), `esterilla`, `pared`, `polea`, `landmine` (la barra T), `toalla` (algo blando: doblada o,
con `rollo: [largo, radio]`, enrollada: un rulo tumbado, con su contorno y una franja de color cerca de cada punta, porque sobre la arena
una toalla clara apenas se ve) y `toallas` (una toalla cogida a lo largo, que hace de correa).

- `banco`: `respaldo: 45` lo inclina; `85`, casi vertical (una silla); **negativo, declinado**. Con el respaldo
  levantado va con `rumbo: 180` (el respaldo sale hacia −Z, donde queda la cabeza de quien se tumba). `tapa: true`: el
  respaldo tapa de verdad lo que tiene detrás (para quien se pone de pie al otro lado, con un brazo por encima).
- `barra` con `z: true`: corta (120) y con su W en el centro. Se agarra por las rampas de fuera (las manos a 45 cm:
  22,5 a cada lado) o por las de dentro (a 19: 9,5), con la muñeca a medio girar (`prono: -65`); las dos suben hacia lados
  contrarios, así que con el agarre estrecho la W queda al revés. El plano de la W lo dan las manos; mientras espera
  (`reposo`), `w` (hacia dónde sube el extremo de fuera de cada puño: `planoZ(postura)`, en `75-biceps.js`).
- `predicador`: el cojín (un prisma con su cara inclinada y su cara vertical) sobre su poste, el asiento y, con
  `ganchos: [y, z]`, los dos soportes donde espera la barra. `en` y `alto` son el canto de arriba del cojín, por el lado
  del pecho; con `rumbo: 180` se usa desde el otro lado (la araña). El cojín **tapa de verdad** (`taparConCaras`): lo que
  queda del lado de fuera de una cara que la cámara ve va por delante, y lo demás, por detrás.
- `polea`: `rumbo` gira la columna (`180`, detrás de Jérôme; `90` y `−90`, una a cada lado mirando al centro: el
  cruce de poleas); `a`, a qué va el cable (`'manos'`, `'i'`, `'d'`…; `'tobillo-i'` y `'tobillo-d'`, a un tobillo: con
  `tobillera: true` se ve la tobillera, una banda justo encima del tobillo, y el cable se engancha en el lado de ella que mira a la
  polea); `encuadre`, hasta qué altura cuenta para el encuadre (tumbado entre dos poleas, lo que importa está abajo).
  La **máquina de jalón** es la polea con `brazo` (cuánto sale de la columna el brazo de arriba: la polea va en su
  punta), `asiento: [a cuánto de la columna, alto]` y `rodillo: [a cuánto, alto]`. `agarre`: `'barra'`, `'cuerda'`,
  `'asa'` (a una mano), `'v'` (el triángulo) o `'barra_v'` (la barra en V de los tríceps: dos mangos que bajan del centro
  hacia fuera, por donde va cada mano). `reposo: [x, y, z]`: dónde cuelga el agarre mientras nadie lo ha cogido.
  La **máquina de remo sentado** es la polea baja con `apoyo: [a cuánto de la columna, alto, grados]` (la chapa
  inclinada donde van los pies) y un `banco` corto delante.
- `barra_dominadas`: `paralelos: 23` le pone dos agarres cortos que salen hacia delante (las palmas enfrentadas; el
  clavo `'mi@0:23'` va entonces a la mitad del agarre); `voladizo: 104` la convierte en una torre (los postes, detrás,
  y la barra colgando de dos brazos: de lado, nada se cruza por delante de quien cuelga en horizontal).
- `landmine`: la barra T. `pivote: [x, z]` (el anclaje), `a` (quién la lleva: `'manos'`, `'i'`, `'d'`), `asas`
  (`'v'`, dos agarres estrechos bajo la barra; `'ancha'`, un travesaño), `sobra` (cuánto sigue la barra más allá de
  las manos; ahí van los discos) o `dentro` (si se coge por la punta: a cuánto quedan los discos, hacia el anclaje),
  `reposo`. La mano va siempre a la misma distancia del anclaje: el agarre sube por un arco (`enArco`).
- `paralelas`: tienen `agarre` (`'mi@0:27'`, `'md@0:-27'`): la mano va a la barra de su lado.
- `soporte`: `z` y `alto` son donde descansa la barra: el agarre de la postura que la coge tiene que caer ahí. Con
  `haciaAtras: true` los ganchos miran hacia −Z: el soporte queda delante de quien saca la barra, que al retroceder se
  aleja de los postes.
- `toallas`: tiras de tela, cada una de un punto a una mano. `ancho` y `tiras: [{ de, a, cola, reposo, sobre, en }]`: `de`, de
  dónde sale (un punto del mundo: lo alto de una barra; `'pie-i'` o `'pie-d'`: pasa por la planta de ese pie, bajo la bola;
  `'mano-i'` o `'mano-d'`: tendida entre las dos manos); `a`, la mano que la coge (`'i'`, `'d'`); `cola`, lo que sobra pasada la
  mano; `reposo`, hasta dónde cuelga mientras nadie la ha cogido; `sobre`, un punto de aquello sobre lo que monta (su doblez
  se pinta por encima); `en: [posturas]`, solo se ve en los tramos que salen de una de esas posturas (así una toalla pasa
  de un pie al otro). Con `agarreY` (y `agarreZ`) tiene `agarre`: `'mi@1:22'` clava la mano a ella.

El material sabe **de qué postura sale** lo que Jérôme está haciendo (`ctx.de`, que le da `60-director.js`): con eso las
`toallas` saben en qué pie van. Y `ctx.reposo` / `ctx.enLista([...])`, si lo que espera sigue esperando.

**De qué se dibuja.** El material, como todo lo demás, solo con `path`, `circle`, `ellipse` y `rect` (en grupos `g`,
con sus degradados y sus recortes): es lo que `src/85-lienzo.js` sabe copiar al canvas con Samsung Internet. Un
`line`, un `polygon`, un `text`, un `use`, una máscara o un filtro, en ese navegador no se verían, y en Chromium nadie
lo notaría: `auditar_entrenador.js` lo mira en cada vídeo y se pone en rojo.

Material que falta (lo piden 115 ejercicios): máquinas, multipower, cinta de suspensión, anillas y rueda abdominal,
sin dibujar; y `banda`, `fitball`, `disco` y `balon_medicinal`, que tienen un primer dibujo en `50-material.js` pero
ninguna coreografía los usa todavía: están sin probar.

## Cómo se hace una

1. Leer los pasos de la ficha en castellano. Contarlos.
2. Escribir las posturas clave y probarlas en la hoja de contacto, desde las dos vistas:
   `python3 tools/entrenador/pruebas/foto.py "file://$PWD/tools/entrenador/pruebas/hoja.html?id=<id>&medio=0" salida.png 1200 800 700`
   Y **elegir la vista mirándola**, con los músculos encendidos: `pruebas/vistas.html?id=<id>&filas=vistas` (sus dos vistas,
   cinco momentos de la repetición) o `pruebas/vistas.html?id=<id>&rumbos=20,45,70,110&ts=0,1.5&picado=26` (candidatas).
   La primera vista tiene que enseñar lo que el ejercicio trabaja: que la mano o el antebrazo no tapen el hombro y el
   pecho (en el press de banca, de pies a cabeza y desde arriba, no de lado).
   Los números, medidos y no a ojo: `node tools/entrenador/pruebas/mide.js <id> a,b agarre,codo,palma` dice dónde quedan
   los puños, la barbilla o el pecho de cada postura, cuánto se dobla el codo y hacia dónde mira la palma.
   Los rótulos de los músculos tapan la esquina de abajo a la izquierda del vídeo: lo que pasa a ras de suelo (una
   barra que sube desde el suelo, unas mancuernas) tiene que quedar a la derecha (un rumbo negativo: mira hacia la
   derecha de la pantalla). Y la cabeza, lejos de la esquina de arriba a la izquierda, donde va «Paso 1 de 4» (`zoom`).
   En un pino, lo que importa (la cabeza y las manos) está abajo y en el centro: `corre: [50, 0]` lo aparta de los rótulos.
   Jérôme tiene que caber entero en el cuadro en las dos vistas, a 4 px o más del borde (de los 400 del dibujo): la
   auditoría lo mide y dice cuáles se arriman más. Si uno toca el borde, `zoom: 0.92` (o menos) en su coreografía.
3. Verla en el reproductor de verdad, paso a paso, **con el texto de cada paso al lado**:
   `python3 tools/entrenador/pruebas/repaso.py carpeta "id1,id2,…"` (una hoja por ejercicio: una fila por paso, y la
   vista de «Girar»). Y un tramo, instante a instante y desde donde haga falta: `pruebas/vistas.html?id=<id>&rumbos=90,20&ts=0,0.5,1`
   (segundos de la repetición) o `…&paso=2&ts=0.3,0.6,0.9` (segundos de la secuencia de ese paso). Para un momento concreto: `python3 tools/entrenador/pruebas/tira.py salida.png <id> "p1+2,p2+1.5,p3+2,c+2"`
   (o varios de golpe, dos fotogramas por paso: `pruebas/flujo.py salida.png "id1,id2,…"`).
4. **El camino de una postura a otra**: `TODO=1 node tools/entrenador/pruebas/camino.js <id>` dice en qué tramos una
   zapatilla baja del suelo. Un pie clavado va en línea recta de un tobillo al otro: si entre tanto gira (de plano a de
   puntillas, o media vuelta sobre el sitio), corta por debajo del suelo; y un pie suelto que cruza con la punta caída, lo
   roza. Se arregla con una postura intermedia: el pie a medio rodar sobre la punta (`enPunta(x, 28)`), o en el aire y ya
   mirando de lado (la media vuelta de los paseos). La auditoría mira las posturas clave, no lo que pasa entre ellas.
5. **Lo que se toca, medido.** Una mano en la pared, en el muslo o en el suelo se coloca con su medida, no a ojo: la pared va
   donde llegan las yemas (de perfil exacto, `pruebas/vistas.html?id=<id>&rumbos=90&picado=0&pos=a`, se ve si la mano se queda
   en el aire delante de ella); la mano que descansa en un muslo va sobre su cara de arriba (`manoEnMuslo`); y las yemas, en el
   suelo y no por debajo. Desde las dos vistas del vídeo un hueco de 7 cm puede no verse; de perfil, sí. Y contra una pared,
   también las rodillas: con el pecho hacia ella se doblan hacia la pared, y junto a ella no caben (el centro de la rodilla
   tiene que quedar a 7 cm o más, que es lo que mide con su rótula). En el pino contra la pared el cuerpo se dobla por la
   cadera, que se aleja de la pared, y las rodillas se abren un poco hacia fuera.
   **Y se comprueba**: `node tools/entrenador/pruebas/contactos.js <id>` da, de ese ejercicio, lo más hundido de cada
   cosa en el suelo y en cada pared, a cuánto queda de su superficie la mano que se apoya, y lo que una mano se mete en un
   muslo (en cada tramo, en cada postura mantenida y en el vídeo cuadro a cuadro, con Jérôme respirando). Sin argumentos,
   las repasa todas y dice cuáles se salen de los límites (`LIMITES`, en ese fichero): una zapatilla o una mano, 1 cm en el
   suelo o en una pared; la mano apoyada, a menos de 1 cm; una mano en un muslo, 1 cm quieta y 2 de paso. La auditoría lo
   pasa entero (sección 1).
6. `python3 tools/entrenador/construir.py` y `node tools/auditar_entrenador.js 8766`.

Para grabar un MP4 (1080 × 1920, 30 cuadros por segundo): `python3 tools/entrenador/pruebas/graba.py salida.mp4 <id> [idioma] [--lento]`
(`--lento`: a cámara lenta, con «½×»).

## Las manos y los muslos (`60-director.js`, `20-figura.js`)

Una mano no se mete en un muslo. Lo cuida el Director, no cada coreografía:

- **Cada postura clave se resuelve con las manos fuera** (`clave`): la mano que la coreografía deja dentro de un muslo sale
  hacia fuera de su eje hasta no tocarlo (menos las clavadas en esa postura: esas van donde se les dice).
- **En cada cuadro, lo que roza se aparta** (`despejar`, con `apartaMano`): la mano entera, como se dibuja, contra la piel
  y la pernera de los dos muslos.
- **La mano que iba a cruzar un muslo por dentro lo rodea** (`rodeoDe`, `rodear`): entre dos posturas la mano va por donde
  la lleva el brazo, y ese camino a veces atraviesa un muslo. De cada tramo se mira una vez; si se mete hondo, el trozo que
  pasa cerca del muslo se cambia por otro que gira alrededor de él, abierto lo justo para que pase la mano entera.
- **Lo apartado no da tirones** (`suave`): de un cuadro al siguiente cambia como mucho 90 cm/s.

Lo que sí toca a la coreografía: las manos «en la cadera» van **en la cintura** (`{ a: [16, 13, 6], en: 'pelvis', polo:
[1, 0, -0.3] }`), por encima del pliegue de la cadera, porque más abajo el muslo se les echa encima en cuanto se dobla la
cadera; las manos que agarran el borde de un banco junto a la cadera, a 29 cm del centro (la mano entera, con su pulgar,
fuera del muslo); una barra que sube pegada a las piernas se agarra por fuera de ellas (27 cm); y una mano que cuelga no
se clava (`clavosEn`).

## El dibujo

Cada pieza del cuerpo (brazo, antebrazo, muslo, pierna, las tres del torso, la mano, cada falange, la zapatilla) es una
o varias **masas**: secciones elípticas a lo largo de un hueso. En cada cuadro se proyectan sus puntos y se traza su
**envolvente convexa**; dentro, tres tintas planas (sombra, medio y luz, con la luz arriba a la izquierda) y, por fuera,
una línea de contorno del color de la pieza, más oscuro. La bola de una articulación es de la pieza que se pinta
primero; la otra llega «con la boca abierta» (sin contorno por ese lado), y así el codo y la rodilla no enseñan una
costura. Todo es SVG y números: sin filtros, sin degradados por pieza, sin imágenes.

**El tronco** no es una envolvente: son nueve secciones (`SECC`), con otra entre cada dos por una curva suave, y su
contorno es la **unión** de las envolventes de cada tres seguidas. Así vale desde cualquier lado, también tumbado y
visto de pies a cabeza (lo que asoma entonces es el pecho entero y la tapa de los hombros), y no pierde la cintura.

**Los músculos que trabajan** son elipsoides pegados al cuerpo (`PARCHES` en el tronco, `CALCOS` en los miembros), que
se proyectan: de frente, la mancha entera; de canto, un bulto de luz en el borde. El del hombro va **por encima de la
manga** (debajo, la manga lo tapaba y solo asomaba un cerco). El estampado de la camiseta o se ve o no se ve: de canto
no se queda a medio borrar.

**El aviso** de lo que nombra un paso (la rodilla, el hombro…) son dos ondas que se abren desde el punto y se apagan,
como al tocar un mapa: dura dos segundos (`MARCA_DUR`) y no se queda encima del cuerpo mientras trabaja.

## La cabeza (`30-cabeza.js`)

Está hecha como el cuerpo y **gira de verdad**: antes eran tres dibujos planos (de frente, de perfil y de espaldas)
entre los que se saltaba, y de tres cuartos salía el de frente con los rasgos corridos.

- El cráneo, la quijada y el mentón son elipsoides; el pelo, el cráneo un punto más gordo por encima de **la línea del
  pelo** (un plano que baja de la frente a la nuca). Se pinta la cabeza entera en el color del pelo y, encima, la piel
  que se ve desde donde mira la cámara (por detrás es al revés: el pelo de la nuca va sobre la piel).
- La nariz y las orejas son bultos: de perfil, asoman. El tupé son púas (conos) y la cinta, un aro con su nudo.
- Los rasgos (ojos, cejas, boca, colorete, gotas de sudor) van **pegados a la cara, cada uno en su plano** (`PL`): al
  girar se estrechan y se esconden solos. La boca son dos mitades, una a cada lado, para que de perfil se le vea la
  comisura. Las gafas son un plano rígido, con su canto y sus patillas.
- Las bocas (`BOCAS`), las caras (`EMO`) y los párpados son los del presentador de `modulos/guia.js`, en sus medidas:
  una unidad de aquel dibujo son 0,195 cm (`U_CARA`). `K_CAB` agranda la cabeza entera (1,13).
- Las medidas van en centímetros desde `E.cab`, que es **la base de la cabeza (la barbilla)**, no su centro.

Para verla desde varios lados: `pruebas/galeria.html?pose=de%20pie&tam=5&cams=0,35,90,125,180`.

## La vida (`55-vida.js`)

Se aplica a cada cuadro **antes de clavar** pies y manos, así que no cambia ninguna postura de la ficha: lo clavado se
vuelve a clavar después (y si el aire o el peso lo dejan un pelo fuera de alcance, es el cuerpo el que se arrima).

- **Respira**, a su ritmo: no se acompasa con la repetición (no le dice a nadie cuándo coger aire). Más hondo cuando viene de trabajar.
- **La demora**: la cadera manda; el tronco la sigue 0,04 s después; la columna, 0,08; la cabeza, 0,13.
- **Los muelles**: al frenar, la cabeza cabecea (2,6° como mucho en un ejercicio; 6° de cerca) y los brazos sueltos se balancean. El tupé va detrás de la cabeza.
- **El peso**: de pie y quieto, pasa de un pie al otro, despacio. Tumbado, sentado o en una isometría, no.
- **Al hablar de cerca**, la mano levantada marca el compás y la cabeza asiente.

Con «reducir movimiento» del sistema, nada de esto se mueve.

## Los gestos del presentador (`60-director.js`)

`PRESENTA` son sus posturas clave y `GESTOS`, las secuencias: antes del gesto lo recoge, llega pasándose un poco y se
asienta. Cada ejercicio tiene el suyo, siempre el mismo (sale de su `id`), para que los vídeos no sean todos iguales:

| momento | gestos |
|---|---|
| cabecera | se asoma por un lado (así espera en la portada), entra, y: `saludo` (saluda con la mano), `visera` (la mano a la ceja) o `vamos` (sube el puño) |
| consejo (`'nota'`) | `consejo` (el índice en alto, y lo menea) si es corto; `explica` (la palma abierta) si es largo |
| cierre | `pulgar`, `dos` (los dos pulgares) o `fuerza` (saca bíceps) |

Para verlos fotograma a fotograma: `pruebas/busto.html?g=saludo,visera&n=8` (y un ejercicio en marcha:
`pruebas/busto.html?id=<id>&rep=1&n=8&t1=3.6`).

## La voz

Es la del aparato (Web Speech), pero **elegida** (`vocesDe`, en `80-reproductor.js`): un iPhone enseña a las webs, lo
primero de cada idioma, las voces «Eloquence» (Eddy, Flo, Grandma, Grandpa, Reed, Rocko, Sandy, Shelley), un
sintetizador por reglas de hace más de veinte años; quedarse con «la primera del idioma» es acabar con una de esas. Aquí se puntúan
(premium, mejorada, Siri, las normales) y las robóticas y las de broma no se eligen nunca. Si el aparato no enseña
ninguna que valga y es de Apple, no se elige: se le da el idioma y pone la suya. Solo voces del dispositivo.
`TG_ENTRENADOR.voces('es')` dice qué elegiría este aparato y qué voces enseña.

## Lo que el dibujo no hace bien (todavía)

- Un brazo o un muslo que apunta hacia la cámara se ve corto y gordo: es un dibujo plano por pieza.
  Se arregla eligiendo la vista (de lado para las bisagras y las sentadillas).
- Un brazo muy doblado visto de lado se pliega sobre sí mismo: el antebrazo y la mano tapan el brazo y el hombro
  (pasaba en el press de banca). También se arregla con la vista; `auditar_entrenador.js` deja la lista de los
  ejercicios en los que pasa más de un 20 % de la repetición, para mirarlos a ojo.
- Solo el escalón tapa de verdad lo que tiene detrás; el resto del material se ordena por distancia.
- Las piezas se ordenan por distancia, enteras: cuando dos se cruzan (un brazo por delante del pecho), el cambio de
  orden es de un cuadro a otro.
