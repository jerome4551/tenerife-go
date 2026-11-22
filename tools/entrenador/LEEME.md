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
| `src/50-material.js` | barra (y la barra Z), mancuernas, pesa rusa, banco, banco predicador, soporte, barra de dominadas, escalón, pared, polea, toallas, banda elástica, poste, las máquinas y el multipower, el fitball, el disco, el balón medicinal, la cinta de suspensión, las anillas, la rueda… |
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
| `src/7a-isquiotibiales.js` | las coreografías del bloque 11: **isquiotibiales** (22), por familias (la bisagra de cadera sobre los dos pies: el peso muerto rumano en polea, los buenos días y los pesos muertos con las piernas rígidas y con apoyo escalonado; el peso muerto a una pierna: sin peso, con pesa rusa, con mancuerna, en polea y con salto; los curls: de pie, en polea, deslizando los talones sobre una toalla y el nórdico; boca abajo en el banco; el balanceo de pierna; los estiramientos y el isométrico sentado) |
| `src/7b-abdomen.js` | las coreografías del bloque 12: **abdomen y lumbares** (40), por familias (las planchas sobre las manos: alta, con toque de hombro, arriba y abajo y con rotación; el gateo del oso; a cuatro patas: el perro-pájaro, el gato-vaca y la postura del niño; las planchas laterales; boca arriba: los toques de talón, el abdominal completo, la bicicleta, el crunch inverso, las patadas alternas, la elevación de piernas en banco, la retracción, la posición hueca y los estiramientos; boca abajo: el superman y la cobra; sentado: el giro ruso y los tres L-sit; en banco con rodillos: el crunch declinado y la hiperextensión lumbar; colgado: las piernas rectas, los pies a la barra y el limpiaparabrisas; de pie: el crunch lateral, la flexión lateral con mancuerna y el paseo de maleta; y con polea o barra anclada: el press Pallof, el leñador, el crunch de rodillas y la rotación con landmine) |
| `src/7c-banda.js` | las coreografías del bloque 13: **con banda elástica** (38, de todos los grupos), por cómo se lleva la banda (de pie, pisándola: la sentadilla, la elevación de talones, los cuatro curls, la elevación lateral y las aperturas de abajo arriba; atada a un poste: el curl femoral, las aperturas, el face pull, el remo, los pájaros, la rotación externa, la retracción escapular, el peso muerto a una pierna, la extensión de rodilla y el leñador inverso; por la espalda: el press de pecho; de rodillas: el press Pallof y la apertura inversa; en el suelo y con la minibanda: la abducción sentado, el puente, la almeja, la patada de glúteo y los pasos lateral y de monstruo; sentado: el remo y las flexiones dorsal y plantar del tobillo; colgado: las dominadas asistidas; entre las manos: la separación, la rotación externa y la extensión de tríceps; y con el antebrazo en el banco: la extensión y la flexión de muñeca, la desviación radial y cubital y la pronación y supinación) |
| `src/7d-maquinas.js` | las coreografías del bloque 14: **en máquina y en multipower** (41, de todos los grupos), por máquina (sentado, con las piernas: la extensión de cuádriceps, el curl femoral sentado y la abducción y la aducción de cadera; la prensa: con los pies separados, juntos, a una pierna y la elevación de talones; la hack: la sentadilla y la elevación de talones; la sentadilla con cinturón; tumbado y de pie: el curl femoral tumbado, a una pierna y de pie, y la elevación glúteo-isquio; las pantorrillas, de pie y sentado; el tronco: el crunch y la silla romana; el hip thrust; sentado, con los brazos: los press de pecho, inclinado, declinado y de hombros, los fondos, los remos sentado y alto, a dos manos y a una, el contractor y el contractor inverso, las elevaciones laterales y el curl; las dominadas asistidas, con las palmas hacia delante y hacia él; y el multipower: la sentadilla, los press de banca, inclinado, con agarre cerrado y de hombros y el remo para el deltoides posterior) |
| `src/7e-accesorios.js` | las coreografías del bloque 15: **con cinta de suspensión, fitball, disco, balón medicinal, anillas y rueda** (37, de todos los grupos), por material (el disco: la sentadilla, la elevación frontal, el curl invertido, la pinza y la sissy; el balón medicinal: los dos lanzamientos y la rotación sentado; el fitball: el puente, los dos curls femorales, el crunch, la extensión lumbar, el encogimiento de rodillas, la pica, las dos flexiones y el curl sentado; la flexión sobre balón y la lastrada; las dominadas lastradas; la rueda y los dos rollouts con barra; las anillas: los fondos y el soporte; y la cinta de suspensión: de cara al anclaje, los remos, los cuatro curls y la sentadilla, y de espaldas, el press, la extensión de tríceps, los fondos y la flexión con los pies en los estribos) |
| `src/7f-estiramientos.js` | las coreografías del bloque 16: **estiramientos sin material** (30, de cuello, espalda alta, hombros, pecho, dorsal y brazos), por cómo se colocan (de pie: el pecho con las manos a la espalda, los brazos arriba, el costado, los codos con las manos en la nuca, la espalda alta, el giro de cabeza, los omóplatos, las tijeras, los círculos de codos y de muñecas, las letras T-L e Y-W, la marcha de dedos, la oración invertida y los giros de muñeca; en el suelo: los dos perros boca abajo, los antebrazos a cuatro patas, enhebrar la aguja, la rotación con la mano en la nuca y la postura del niño hacia un lado; en la pared: subir las manos, la espalda con las manos en la pared, los hombros de espaldas a ella, el durmiente y el barrido circular; tumbado y sentado: el libro abierto, la rotación de hombros, el abrazo y la zancada baja con rotación) |
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
clavada en el aire, el cuerpo, que respira y se balancea, se le echa encima), `tensos: ['ti', 'td']` (de lo clavado, lo que
llega a su sitio tan estirado como en las posturas: abajo, «Lo tenso»), `picado` (16 para los ejercicios de suelo), `zoom`, `corre: [dx, dy]` (el
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

**Cuando lo que hay que enseñar no cabe en lo que se tarda en leerlo** (nota 55): el paso lo dice con `dura`
(`{ sec: […], desde: 'b', dura: 9 }`) y dura eso como poco, en todos los idiomas; el texto se queda en pantalla
mientras tanto. Es para lo que no se puede abreviar sin dejar de entenderse: en la patada de glúteo en polea, «al
terminar, cambie de pierna» se lee en 4,4 s, y volver, agacharse, pasar la tobillera al otro tobillo, levantarse y dar
la patada con la otra pierna son 8,7. La auditoría hace la misma cuenta (`durPaso`) y la coteja con el reproductor.

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
| 11 | `7a-isquiotibiales.js` | isquiotibiales: 22 (con los 4 del bloque 1, 26 de 35; quedan 9: 5 en máquina, 2 con banda y 2 con fitball) |
| 12 | `7b-abdomen.js` | abdomen y lumbares: 40 (con los 4 del bloque 1, 44 de 56; quedan 12: 2 con banda, 2 en máquina y 8 con fitball, balón medicinal, barra o rueda) |
| 13 | `7c-banda.js` | con banda elástica, de todos los grupos: 38 (los 37 que quedaban «con banda» en las filas de arriba y la rotación externa con bufanda, que es de las fichas nuevas). Con él, 456 con vídeo; de las 533 primeras quedan 78: las 41 de máquina y multipower (bloque 14) y las 37 de cinta de suspensión, fitball, disco, balón, anillas y rueda (bloque 15) |
| 14 | `7d-maquinas.js` | en máquina y en multipower, de todos los grupos: 41 (las 35 «en máquina» y las 6 «en multipower» que quedaban en las filas de arriba). Con él, 497 con vídeo; de las 533 primeras quedan 37: las de cinta de suspensión, fitball, disco, balón, anillas y rueda (bloque 15) |
| 15 | `7e-accesorios.js` | con cinta de suspensión (11), fitball (10), disco (7), balón medicinal (4), anillas (2) y rueda o barra que rueda (3), de todos los grupos: 37. Con él, **534 con vídeo: las 533 primeras, todas** (y la rotación externa con bufanda, de las nuevas) |
| 16 | `7f-estiramientos.js` | estiramientos sin material (o con una pared), de las fichas nuevas: 30 (cuello, espalda alta, hombros, pecho, dorsal y brazos). Con él, **564 con vídeo** |

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
correr: los del bloque 9) y `abrirPies`, `altoCon` y `alAire` (las del bloque 9, que cada trozo guarda las suyas); en `7a-isquiotibiales.js`: `dePie` + `despegado` + `enUna(grados, extra, tobillo)` (el peso muerto a una pierna, escrito con el apoyo en la izquierda: el pie libre se despega primero un poco, plano, y después va atrás en línea con el tronco; el otro lado, con `refleja`), `cuelgaD(postura, x, dz)` (el puño derecho colgando del hombro con el brazo estirado), `talonAlGluteo(postura, grados)` (el curl de pie, con el muslo a plomo), `enBanco()` + `colgada(postura, x, muslo, rodilla)` (boca abajo en el banco, con la cadera en su borde y las piernas colgando en diagonal), `sobreElTalon(caída, fuera)` (el pie apoyado en el talón con la punta hacia arriba: sus vectores y a qué altura queda el tobillo) y `DE_RODILLAS_F` (de rodillas para caer hacia delante: el tobillo, justo a una pierna de la rodilla); en `7b-abdomen.js`: `tablaR(grados, giro)` (la tabla girada sobre su eje largo, con `base`) y `espejo(postura)` (la del otro lado cuando lleva `base`), `aCuatroEn(muñecas)` (a cuatro patas con las manos donde ya estaban: para doblar la espalda sin moverlas), `recostadoEn(hombro, cadera)` + `plancha(baja)` + `vueltaRecta` (de lado sobre el antebrazo: el hombro y el tobillo de abajo no se mueven al subir la cadera), `enrollado(postura, grados)` (boca arriba, la pelvis gira hacia las costillas y los hombros se quedan en el suelo), `sentadoL(inclinación, curva, …)` + `tendidas` (los L-sit), `plegado` + `aLaBarra` (colgado, con las piernas arriba), `tramo` + `alReves` (andar hacia delante y hacia atrás), `aPlomo` (el brazo que cuelga con peso) y `enMarco` + `vuelta` (la media vuelta, del bloque 8); en `7c-banda.js`: `atada(dónde, alto, tiras)` (la banda con su lazo en el poste), `alAire(pie, x, z, alto)` (el pie a medio paso), `arrodillado(rumbo, extra)` (de rodillas y derecho, mirando hacia donde se diga: la media vuelta del press Pallof), `agachado(alto, inclinación, x, z, pie izquierdo, pie derecho)` + `enSuelo(x, z, abre)` (la media sentadilla y el cuarto de sentadilla de los pasos con minibanda, con cada pie donde se diga), `ASIENTO(postura)` (a qué altura queda la cadera sentado en el suelo), `pieA(grados)` + `sentadoUna(inclinación, grados, extra)` (sentado con una pierna estirada y el talón descansando en el suelo sea cual sea el ángulo del tobillo) y `enElBanco(mano, dónde)` (de rodillas, con el antebrazo en el banco y la otra mano con la banda por debajo, por encima o al lado); en `7d-maquinas.js`: `sentado(alto, recostado)` + `silla(alto, recostado, o)` (el cuerpo sentado en una máquina y las piezas de su asiento y su respaldo, hechas para ese cuerpo), `rodillaDe` + `pierna(rodilla, grados)` (la pierna que gira sobre una rodilla que no se mueve: el eje de la máquina va en ella), `deCadera(dentro, …)` (la abductora y la aductora: cada muslo gira sobre su cadera y lleva su palanca), `PR` + `enPrensa` + `piePrensa` / `puntaPrensa` + `prensa(dónde espera la plataforma, cuánto corre)` (la prensa a 45°: el cuerpo, el pie plano o apoyado solo en su parte delantera, y la máquina), `HK` + `enHack` + `hack(…)` (la máquina hack), `CFT` (el curl femoral tumbado), `palanca(lado, eje, asa, o)` (una palanca con su asa: los press, los fondos, los remos y el curl), `pressPecho(o)` (el eje sale de dónde empieza y dónde acaba el asa), `remoMaquina(alto)`, `contractor(hombro, radio, …)`, `asistidas(manos, mano, más)` (las dominadas en la máquina) y `multipower(z, y0, o)` + `pressMultipower(o)` + `enBarraM(G)` (las guías, la barra que solo sube y baja y las manos clavadas a ella)…) y cada ejercicio es esa función con sus números. **Cada ejercicio se coteja con su ficha paso a paso**:
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

**Los saltos** (bloques 1, 8, 9, 10 y 11). En el aire no hay nada clavado (`[]` en ese tramo). Se despega por las puntas y se cae sobre
la parte delantera del pie, que rueda hasta el talón mientras la cadera baja. Con el tobillo clavado, pasar de pisar de plano a
estar de puntillas en un solo tramo hunde la zapatilla (el tobillo va en línea recta y el pie gira sobre su bola: 1,1 cm con 48°):
entre agachado y despegando va una postura de **medio empuje**, con el talón a medio levantar y la cadera a medio camino. En un
salto que cambia de sitio (el horizontal) las posturas de la vuelta son las de la ida giradas media vuelta, y la cámara encuadra
todo el recorrido. Y un brazo que sube de golpe (del costado a por encima de la cabeza) también se reparte entre las posturas del
impulso: en un solo tramo de una décima, la mano iría a más de medio metro por cuadro.

**El pie libre que viaja lejos, clavado a su camino** (bloque 11). En el peso muerto a una pierna el pie libre va de estar despegado
junto al otro a quedar atrás, con la pierna recta y en línea con el tronco. Suelto, de una postura a otra la rodilla se estira antes de
que el muslo haya girado, y la zapatilla corta el suelo (hasta 6 cm). Con su tobillo en los clavos de esos tramos va en línea recta de
una postura a la siguiente, y la pierna se dobla lo que haga falta. Mientras se mantiene la postura (`clavosEn`) solo se clava el pie
de apoyo. Y **de rodillas, con la pierna casi recta** (el curl nórdico, al caer hacia delante), el tobillo tiene que quedar justo a
una pierna (38 cm) de la rodilla: con medio centímetro de menos, la rodilla salía 3 cm por debajo de su sitio (`DE_RODILLAS_F`).

**Lo que enseñó el bloque 12.**
- **`refleja()` no refleja `base`** (la postura dicha con los ejes del tronco) **ni los pies dichos en el mundo para los dos a la vez
  (`t`)**: la postura del otro lado sale con el tronco sin reflejar y la mano de apoyo se queda en el aire. En `7b-abdomen.js`,
  `espejo()`. Boca abajo (cabeceo 90) el rumbo y el alabeo de `giro` giran lo mismo: el giro sobre el eje largo del cuerpo va con `base`.
- **Las posturas de la repetición cuentan como quietas** para `pruebas/contactos.js`: una mano abierta con la palma hacia abajo a
  menos de 6 cm del suelo es un «hueco», y una mano dicha en el mundo con sus dedos tiene que tocar algo. La mano que va por el aire
  a medio tramo: más alta, o dicha con `prono`/`mun` (la muñeca doblada hacia atrás, `mun` negativo, para que los dedos no caigan).
- **La mano que cambia de sitio va clavada** (`K4` en ese tramo): suelta, al bajar el hombro se hunde en el suelo antes de despegarse.
- **De lado sobre el antebrazo, el cuerpo recto no cabe entre el hombro y el pie de tumbado**: tumbado, el tronco va doblado y la
  cadera queda 4 cm más cerca del hombro. Si se dejan fijos el hombro y el tobillo de tumbado, la cadera se queda baja (148° en
  vez de recta). Se hace al revés: primero la plancha recta (de ahí sale el tobillo) y después el recostado que deja la cadera a
  una pierna de ese tobillo (`recostadoEn`).
- **Los L-sit en el suelo, con el tronco derecho** (rehechos el 18-11: Jerome vio que 4 cm con el tronco inclinado era poco). La
  pelvis no es una bola: derecha, toca el suelo con su centro a 9,7 cm; inclinada 13°, a 11,8. Sentado derecho, el hombro queda justo
  a un brazo estirado del suelo (con la palma plana), así que lo que despega la cadera es bajar los hombros (`hom`): con −6 sube
  5,6 cm y los talones quedan a 9 del suelo. Inclinar y redondear el tronco para «ganar sitio», como iba antes, no es una L (67° entre
  tronco y piernas) y encima sube menos (4,3 cm). La altura de sentado se busca con `troncoAPlano`; no se da por sabida.
- **Las manos detrás de la cabeza no bajan los codos**: con la muñeca en la nuca el codo queda siempre a la altura de la cabeza.
  En el abdominal completo los codos se quedan a 17 cm de las rodillas; más cerca no llegan sin doblar el tronco más de lo que da.
- **Un paso que no cabe en su lectura** (el cambio de lado de las planchas laterales, el cambio de mano del paseo de maleta) lleva
  `dura`, como el cambio de pierna de la patada de glúteo en polea.
- **Colgado, lo que gira es la cadera: el tórax no se mueve.** En el limpiaparabrisas, girar la pelvis y deshacer el giro con la
  columna (`col`) inclinaba el tórax: un hombro bajaba 13 cm y la mano de ese lado se soltaba 3 cm de la barra (lo dijo la auditoría:
  «lo clavado se mueve»; los brazos van casi estirados, con 0,3 cm de holgura). Se hace al revés: el tórax de la postura de arriba se
  deja como está y se calcula la pelvis que lo deja ahí con ese giro de columna (Bp = Bt · Rᵀ, con R el tórax que da `col` visto
  desde una pelvis sin girar). Los dos hombros no se mueven y la pelvis gira casi sobre sí misma. Y la barra, más ancha (`ancho: 84`):
  los pies barren 72 cm a cada lado.

**Lo que enseñó el bloque 13.**
- **`rumbo` positivo es la cámara hacia SU izquierda** (+X): de frente, su izquierda cae a la derecha de la imagen. Con el signo
  cambiado, el brazo o la pierna que trabaja queda del lado de lejos y el lazo de la banda no se ve. La primera vista, del lado
  de lo que trabaja (o de frente, si son los dos).
- **Lo clavado de un tramo es lo de la coreografía (`clavos`) o lo que diga el tramo; `clavosEn` solo vale mientras mantiene la
  postura.** Un pie que va por el aire y está clavado (`T2`) hace el camino en línea recta; sin clavar, lo hace girando las
  articulaciones (un arco) y, si la cadera baja a la vez, corta el suelo (el pie libre del peso muerto a una pierna: −2,9 cm). Se
  deja sin clavar solo lo que tiene que hacer un arco de verdad (la pierna que se estira desde la rodilla: el muslo no se mueve).
- **Con la punta del pie hacia arriba, lo más bajo de la zapatilla es el contrafuerte del talón**, y `bajoZapa` (la suela) no lo
  ve: el talón apoyado se busca con `zapaAPlano`, que es lo que mide `contactos.js`. Y la altura del tobillo cambia con el ángulo
  del pie (de 9,9 cm con la punta estirada 40° a 6 con los dedos hacia la espinilla): se busca en cada postura.
- **`{ e, z, g, c }`: con `g: 0` el codo se dobla hacia arriba**; para doblarlo en horizontal (los brazos en cruz que se abren),
  `g: 90`. Un codo «un poco flexionado» con `g: 0` sube el puño 6 cm.
- **Una tira que va de un lado a otro del cuerpo lo atraviesa** si no se le dice por dónde pasa: `rodea` (la elipse del tronco:
  solo la rodea si en línea recta la cruza; con `siempre`, también cuando no: la que va por la espalda), o un punto `por` (la
  banda de la patada de glúteo pasa por dentro de la rodilla de apoyo). Y una tira es un trazo por tramo, con una sola
  profundidad: larga y pegada al cuerpo, se parte con `por` o con `rodea` para que cada trozo quede delante o detrás de lo suyo.
- **La banda que cuelga de la barra no pasa por delante de la cara**: en las dominadas asistidas va entre la cabeza y la mano.
- **El banco, a un lado.** Con las muñecas por fuera del borde de delante del banco, la otra mano no llega a ponerse debajo de
  la que trabaja (65 cm desde el hombro, y el banco en medio). El banco termina a 8 cm del antebrazo que se apoya y el otro
  brazo pasa por ese hueco. Y se mira desde su derecha y desde arriba: desde la izquierda el banco tapa las manos.

**Lo que enseñó el bloque 14.**
- **Una palanca gira hasta donde está la mano (o la pierna) que la mueve, y la mano va clavada a su asa** (`'mi@0:1'`): es la mano la
  que sigue el arco de la máquina. Así el asa queda siempre a la misma distancia del eje y la palanca no se estira. Donde el eje de
  la máquina pasa por una articulación (la rodilla en la extensión y en los curls; el codo en el curl; el hombro en el contractor y en
  las elevaciones laterales; la cadera en la abductora), el miembro y la palanca giran juntos y no hace falta clavar nada.
- **`lim` va con el signo del giro**: girar sobre +X *baja* el ángulo de perfil (lo que apunta hacia delante baja; lo que apunta hacia
  arriba va hacia delante). Con el límite al revés la palanca se queda en su tope, y la mano, clavada a ella, tira del cuerpo: en el
  curl los antebrazos no subían, en el crunch el tronco se doblaba el doble y en los remos las manos se quedaban a medio camino. Se ve
  en la hoja de repaso; ninguna medida lo dice (lo clavado no se mueve: 0,000).
- **`refleja()` no refleja lo compartido** (`p`, `t`: se reflejan solos al resolver la postura). Para dar a mano la pierna derecha con
  la receta de la izquierda, `reflejo(receta)`: con `refleja({ p: … }).p` el pie derecho iba al sitio del izquierdo.
- **Los discos, donde no tapen lo que trabaja**: en la prensa, por detrás de la plataforma; en la hack, por detrás de los raíles; en el
  hip thrust, al pie de la máquina y no junto a la cadera. En el multipower, discos de 17 cm y ninguna vista de perfil (de lado, el
  disco de cerca queda justo delante del tronco): de tres cuartos por delante y por detrás, y los press tumbado, desde arriba.
- **Una máquina alta achica a Jérôme** (el encuadre mete todo el material): `encuadre: [puntos]` en la máquina dice qué tiene que
  caber; en los press tumbado del multipower, hasta 152 cm (178 en el inclinado): las guías se salen del cuadro por arriba.
- **De pie y agarrado arriba, los brazos no van estirados del todo**: de pie, «la vida» pasa el peso de un pie al otro y la mano
  clavada queda un pelo fuera de alcance (0,07 cm: la auditoría lo ve). En las dominadas asistidas, el hombro a 58,3 de la mano.
- **`esfuerzo` solo vale con `rep`**: una coreografía hecha de secuencias (el curl femoral de pie, la elevación glúteo-isquio) no lo lleva.
- **Las asas de junto a la cadera, a 29,5 cm del centro** cuando el muslo de ese lado baja hacia el suelo (la prensa a una pierna): a
  27, la mano, que va clavada, queda dentro del muslo.
- **La cabeza y las barras no las mide ningún control** (`contactos.js` mira el suelo, las paredes y la tapa de los bancos planos: ni
  el cuerpo contra las piezas de una máquina, ni la cabeza contra una barra). En las dominadas asistidas, con el tronco a plomo, la
  barra le cruzaba la cara al subir y el tubo que bajaba de la viga le quedaba delante de los ojos; en la hoja de repaso pasó por «la
  barra, delante de la cara». Ahora va como en las dominadas del bloque 1 (arriba, el tronco 9° atrás: la cabeza pasa por detrás de
  la barra) y la viga acaba por delante de las asas. Se midió aparte, pieza a pieza: lo que pinta el material (cada cilindro) contra
  el pelo, la nariz, el mentón y el tupé, en cada instante. ~~Falta hacer de eso un control~~ **Hecho el 20-11-2026 (nota 63):**
  - *El control.* `cabezaACilindro` (30-cabeza.js) mide lo que le falta a la cabeza para tocar un cilindro, y `contactos.js` se lo
    pasa a todo cilindro que pinta el material, espiando `Cilindro.pon` (lo que se mide es lo que se dibuja: la barra de dominadas,
    la de pesas, los tubos y las asas de una máquina, un mango, los ramales de una cuerda). Dos medidas: `cabeza-barra` (cada
    tramo en 25 instantes y cada postura mantenida; límite, 2,5 cm) y `cabeza-barra-vida` (el vídeo cuadro a cuadro, con la demora
    del tronco y de la cabeza; 3,5). Los cojines, las placas y los discos no son cilindros: eso sigue sin control (se mide a mano,
    como en el bloque 14).
  - *Los doce vídeos corregidos.* Cada uno, por lo suyo, y las cuatro maneras sirven para lo que venga:
    1. **Colgar un poco más atrás** (`masAtras`, en 72-dorsal.js). En una dominada la cabeza se echa atrás con el tronco; si sale de
       justo debajo de la barra, a media subida el pelo se le mete. Con la cadera 2,5–4,5 cm más atrás al colgar, pasa.
    2. **Una postura intermedia** cuando el camino recto entre dos posturas atraviesa algo (el push press: la barra sale de los
       hombros y tiene que rodear la cara; las dominadas comando: la cabeza tiene que apartarse ANTES de llegar a la barra). Para
       que no se note la costura, el primer tramo va en `lineal` y el segundo en `sale` (que arranca al doble de su velocidad
       media): con t2 = 2 · t1 · d2 / d1 la velocidad no cambia en la postura intermedia. Al bajar, `lineal` y `lineal` con los
       tiempos en proporción a los caminos. Y `esfuerzo` lleva los índices de los tramos nuevos.
    3. **La cabeza se aparta, como con una barra de verdad.** En los press la barra sube recta por delante de la cara: abajo
       descansa en lo alto del pecho con la cabeza echada atrás (cab −15), y arriba la cabeza vuelve. Con la cabeza quieta habría
       que sacar la barra 20 cm por delante del pecho (la nariz de Jérôme llega a 15,7 cm del eje del cuello).
    4. **La mano, dicha en la cabeza** (el crunch en polea: «junto a las sienes»). Un punto fijo del tórax no sigue a la cabeza
       cuando gira: el punto se dice en la cabeza y se pasa al marco del tórax con `giroX(cab)`.
  - *Lo que hay que mirar al mover una postura de arriba:* el codo. Subir o adelantar el puño puede dejarlo fuera de alcance: el
    brazo queda bloqueado (2,3°, el tope del cálculo) y la ficha dice «sin bloquear los codos». Se compara el ángulo de antes.
  - *Las vistas.* `vista: [22, 78]` son DOS vistas (la segunda, con «Girar»): de frente una barra por delante de la frente parece
    bien aunque le cruce la cabeza; de lado se ve. Mirar siempre las dos.
- **El pie que no se mueve, no se va** (control `pie-deriva`, 20-11-2026): el tobillo que acaba un tramo donde lo empezó no puede
  apartarse más de 2 cm por el camino. Si salta, falta clavarlo en ese tramo (el cuarto elemento del tramo, o `clavos`).
- **Lo que apoya en una pieza de la máquina se clava, como en el suelo.** En la hack los pies iban al mismo sitio en cada postura, pero
  sin clavar, y a media repetición el tobillo se iba 4 cm y la zapatilla se hundía en la plataforma. Tampoco lo dice ningún control
  (`contactos.js` no mira la plataforma, y lo clavado solo se mide si se clava): se midió aparte lo que acaba donde empezó y entre
  medias se mueve. En las máquinas, `clavos` lleva las manos **y los pies** (`M2.concat(T2)`) siempre que los pies no se muevan.

**Lo que enseñó el bloque 15.**
- **Una pelota se mide como se dibuja** (`piezaAEsfera`, 20-figura.js; `huecoPelota` y `pelotaContra`, 50-material.js): lo que le
  falta a cada pieza del cuerpo (la zapatilla, la pierna, el muslo, el tronco, la mano…) para tocar la esfera. Con eso se hace todo
  lo demás: `posada(P, piezas, C, dir)` corre la cadera lo justo para que el tronco descanse en el fitball sin hundirse; la muñeca
  de la mano que se apoya en una pelota o coge un balón queda a la distancia a la que la mano lo toca (se busca: `conBalon`,
  `alCuerpo`); y el fitball que rueda se pone donde lo pisan.
- **El fitball que rueda, de tres maneras**, según lo que lleve encima:
  1. *Boca arriba, con los talones o las plantas encima* (los curls femorales): `sigue: { que: 'pierna' }`. En cada cuadro la pelota
     llega rodando desde más allá de los pies hasta tocar la zapatilla o la pierna, tal como se dibujan. Sale exacto y sin números a
     mano, y es continuo porque por debajo la pierna es convexa (talón, pantorrilla, planta).
  2. *Boca abajo, con las piernas encima* (el encogimiento de rodillas): ahí «el primer sitio donde toca» da saltos (una espinilla
     tendida toca la pelota por cualquier sitio) y hasta la manda hacia atrás. Va con `mapa`: la pelota avanza la mitad de lo que
     avanzan las rodillas (rueda sin resbalar: lo que se apoya en ella pasa de la rodilla a la espinilla), y son las POSTURAS las
     que se construyen posadas en ella (`busca` la altura de la rodilla con la que las piernas la tocan). La cadera sube deprisa
     al principio (el tronco y los muslos son una bisagra que se cierra): hacen falta dos posturas de paso, o a medio camino las
     piernas se hunden 2,7 cm.
  3. *Con las puntas de los pies encima* (la pica): va bajo lo más bajo de la zapatilla (`sigue: { que: 'dedosPie', dz }`) y los
     tobillos van clavados a su altura todo el camino.
  Y si los pies no se mueven (la flexión con los pies encima, el puente), la pelota no rueda: se queda donde la tocan las piernas
  en la postura en la que más bajan. Puesta a seguirlas cuadro a cuadro daba saltos de 36 cm.
- **El pie que descansa en algo se dice en el mundo** (`t: { punta, arriba }`), no con el ángulo del tobillo (`tob`): el pie
  suelto sigue a la espinilla, y con la rodilla un poco doblada a media repetición el pie giraba: en la flexión con los pies en
  los estribos la cinta se alargaba 9 cm.
- **Las manos en un balón van dichas en el mundo** (la palma y los dedos, como la mano que se apoya en el suelo): con el giro del
  antebrazo de cada postura, a medio camino se cerraban sobre el balón. Y `contactos.js` las cuenta como apoyadas: tienen que tocar.
- **El balón que vuela** (`suelta`, en `balon_medicinal`): el material sabe en qué tramo va y por dónde anda (`ctx.de`, `ctx.a` y
  `ctx.u`, que le da el Director): deja las manos en `u0`, llega a su sitio (la pared, el suelo) en `u1` y vuelve a ellas al acabar.
- **Por encima de la cabeza no hay sitio.** Jérôme tiene la cabeza grande (38 cm de barbilla a coronilla, y el tupé llega a 45) y
  los brazos cortos (59): un balón sostenido con los brazos estirados le queda a dos dedos del tupé. En el lanzamiento contra el
  suelo el balón sube por su arco alrededor de los hombros (tres posturas de paso: derecho de una a otra le cruzaba el tupé) y él
  lo mira: la cabeza, echada atrás 28–36°. En la pica, con la cadera sobre los hombros, la cabeza cuelga a medio metro del suelo:
  sigue mirando al suelo entre las manos (cab −50); recta, el tupé lo rozaba.
- **Tumbado con la cadera arriba, la cabeza sigue en el suelo** (`puente`): la base del cuello queda 9 cm más allá de los hombros,
  así que al levantar el tronco baja; el cuello se dobla lo que haga falta (se busca) para que la cabeza no se hunda.
- **La cinta de suspensión no se estira, y sus asas no se mueven**: cuando alguien tira de ellas con el peso del cuerpo se quedan
  donde están, como una barra fija, y es el cuerpo el que va y viene, recto, girando sobre los pies. Cada ejercicio dice dónde
  tiene los puños al final (en el tórax) y de ahí sale dónde están las asas; la otra postura es la que deja los brazos estirados
  hasta ellas (`tiron`, `alAsa`). Medido: la cinta varía menos de 2 cm en todos (0 en la flexión con los pies en los estribos).
  - De cara al anclaje, la segunda vista es **desde atrás** (`vista: [70, 150]`): de frente, un poste del pórtico le cruza el cuerpo.
  - De espaldas al anclaje las cintas le pasan por encima de los hombros y a cada lado de la cabeza: las manos van abiertas (23 cm
    del centro en la extensión de tríceps, 30 en el press) o le cruzarían la cabeza (lo mide `cabeza-barra`) o los brazos.
  - En los fondos el anclaje queda detrás y los codos se abren a los lados: hacia atrás se cruzarían con las cintas.
- **Las anillas cuelgan de dos anclajes más separados que las manos** (96 cm): con las cintas a plomo le cruzaban los antebrazos.
- **El disco, de color** (rojo): negro, sobre la camiseta negra, no se ve. Y las cadenas del cinturón de lastre bajan por delante,
  entre los muslos, no desde los costados (los atravesaban).
- **Lo que rueda por el suelo lleva las manos a la altura de su radio** (`rodando`): en cada postura el puño queda a un brazo justo
  del hombro y a esa altura; de una a otra va clavado. El camino se da con una función (`camino(de, np, …)`: `de(u)` es la postura
  a «u» del camino, de 0 a 1) y se recorre por 8 tramos (14 en el rollout de pie), con el paso igualado (`porPosturas`: sale de
  parado, coge su paso, lo lleva y lo deja, sin cambiar de paso al pasar por cada postura; con «entra», «lineal» y «sale» de tres
  tramos desiguales, la rueda perdía de golpe el 40 % de su paso al pasar por la primera). **Ojo con que el puño llegue**: si el
  hombro queda a más de un brazo de la altura de la barra, `rodando` deja el puño donde alcanza y la barra se levanta del suelo
  (7 cm en el rollout de pie, a un tercio del camino, con el tronco yendo derecho de 107° a 76°: ahí la cadera aún no ha bajado).
  El tronco se echa lo que haga falta para que llegue (se busca), y se mide (`herramientas/rueda_alto.js`).
- **Lo tenso** (`tensos: ['ti', 'td']`, y en `60-director.js`): de una postura a otra la cadera va derecha, por la cuerda, y si el
  cuerpo gira sobre los pies clavados (una flexión, un remo colgado de la cinta) o va con las manos clavadas a lo que rueda, lo suyo
  es el arco. Por la cuerda queda más cerca, y la rodilla o el codo, que en las dos posturas van rectos, **se doblaban de paso**: de
  8 a 16° las rodillas en las flexiones y en los de la cinta, 19° los codos en la rueda, 33° en el rollout de pie y 35° en la
  sentadilla asistida (casi estirado, medio centímetro de menos son 16°). El brazo o la pierna que la coreografía dice tenso, de lo
  que lleva clavado, llega a su sitio tan estirado como en las posturas (lo que mide del hombro a la muñeca, o de la cadera al
  tobillo, va de lo que mide en una a lo que mide en la otra), y es la cadera, con el cuerpo entero, la que se aparta. Solo donde
  se pide: el motor no cambia para nadie más (medido: las 497 de antes, con el esqueleto en el mismo sitio).
  - Las piernas, en lo que gira sobre los pies con las piernas rectas (las flexiones, los remos, los curls, el press y la extensión
    con la cinta); los brazos, en lo que cuelga de ellos o rueda con ellos estirados (la sentadilla asistida, la rueda, el rollout
    de rodillas, el encogimiento de rodillas); las dos cosas, en el rollout de pie y en la pica.
  - **Con piernas y brazos tensos y casi paralelos** (el principio del rollout de pie: la cadera pasa por encima de los pies con
    los brazos a plomo), lo poco que el tronco se aparta de su camino entre dos posturas mueve mucho la cadera a lo largo: hacen
    falta más posturas (14 tramos) para que no se note.
  - No vale donde el brazo o la pierna se doblan de verdad por el camino y no en línea recta (el brazo que dobla en una flexión
    no se dice tenso: se dicen las piernas).
  - Se mide con `bulto.js` (lo que una rodilla o un codo pasa, a medio tramo, de lo que tiene en sus dos puntas; va en el zip de
    la nota 63, en `herramientas/`). En los 37 queda uno, y es de verdad: el codo en el lanzamiento contra el suelo (recoge el
    balón doblando los brazos). **En los 497 de antes lo hay** (las flexiones de los bloques 1 y 2, de 11 a 24° las rodillas; los
    pesos muertos a una pierna): no se han tocado.
- **La pierna recta del todo no tiene lado** (`CASI_RECTAS`, en `7e-accesorios.js`). Con el pie clavado, en cada cuadro la pierna
  se vuelve a resolver «hacia donde ya se doblaba» (`clavar`, en 10-esqueleto.js: el lado lo da dónde cae la rodilla mezclada
  respecto a la línea de la cadera al tobillo). Con `p: { e: 0, z: 0, c: 0 }` (la `tabla` de siempre) la rodilla cae justo en la
  línea: en la primera mitad del tramo queda un pelo a un lado y en la segunda al otro, y **a medio tramo la rodilla cambia de
  lado de golpe**: con los 14° que se doblaba de paso, un salto de 7 a 12 cm en un solo cuadro en las cinco flexiones del bloque
  (se ve la pierna doblada hacia el suelo y, de pronto, hacia arriba, que es al revés de como dobla una rodilla). Con las piernas
  tensas el salto quedaba en 2 cm; con las rodillas 6° dobladas hacia el suelo en las dos posturas (`{ e: 2.9, z: 0, c: 6 }`: se
  apartan 2 cm de la línea y no se ve), no hay salto. Lo mismo vale para un brazo casi recto: en las dominadas comando, con el
  codo de atrás ya girado del todo en la postura intermedia, al acabar de bajar cambiaba de lado (11 cm en un cuadro): gira a la
  par que sube.
  - Se mide con `salto.js` (el punto que en un cuadro se mueve mucho más que en el de antes y en el de después). En los 37 quedan
    dos que no lo son (la mano al soltar el balón, y un codo al que la mano apartada del muslo mueve 2,6 cm).
  - **En los 497 de antes lo hay, y más**: la rodilla salta de 10 a 18 cm en un cuadro, a media repetición, en catorce: `flexion`
    (12), `flexion-deficit` (18), `flexion-explosiva`, `flexion-inclinada`, `flexion-declinada`, `flexion-diamante`,
    `flexion-codos-pegados`, `flexion-manos-escalonadas`, `flexiones-yemas-dedos`, `remo-invertido` (15),
    `remo-invertido-supino`, `remo-renegado`, `curl-biceps-peso-corporal` y, al ponerse, `plancha-alta`. No se han tocado: el
    arreglo es el de aquí (lo tenso y las rodillas con lado), vídeo a vídeo, con su repaso.
- **El paso, por posturas de paso** (`porPosturas`). «entra», «lineal» y «sale» solo empalman sin tirón si los tramos andan lo que
  les toca: el primero y el último, la mitad que los de en medio por unidad de tiempo. Con tres tramos puestos a ojo, la rueda
  perdía de golpe el 40 % de su paso al pasar por la primera postura; el encogimiento de rodillas, la mitad (la cadera, de 74 a
  37 cm/s); y la sissy lo doblaba a medio camino (de 27 a 62). `porPosturas(ida, vuelta, quieto, nombres, s)` reparte el tiempo
  por lo que anda («s») lo que más se mueve: lo que rueda, en la rueda y los rollouts; la cadera, en la sissy y en el
  encogimiento (donde además las posturas de paso van más juntas al principio, que es cuando la cadera sube deprisa). Se mide con
  `paso.js` (la velocidad de la cadera, los hombros y los puños, cuadro a cuadro) y `tiron.js` (los cambios de paso en marcha).
- **De puntillas, el tobillo sube por un arco**: clavado de una postura a otra va derecho, y a medio camino la punta del pie se
  hunde (1,5 cm en la sissy, con los talones a 56°). Una postura de paso a mitad de camino lo deja en 0,4.
- **Dos controles nuevos** en la auditoría (son 83): nada del cuerpo se hunde más de 1,5 cm en una pelota (las manos que la
  sujetan, ni 3), y el fitball no se queda en el aire (siempre hay algo posado en él a menos de 1,5 cm). Y la mano apoyada de plano
  también puede estarlo en una pelota. Siguen sin control los discos, los cojines y las placas (se miden aparte, como en el 14).

### Lo que salió en el bloque 16 (22 de noviembre de 2026)

- **La mano que se despega de su apoyo (o se posa en él)** (`posada`, `conPosadas`, `enPared`, `antePared`, en `7f-estiramientos.js`).
  De una mano apoyada (dicha en el mundo: la palma y los dedos) a otra al aire (dicha con su giro y su muñeca: `manoHacia`), cada
  parte se mezcla por su lado, y a medio camino la mano se ladea y se hunde en el suelo o da la vuelta ante la pared. La apoyada
  tiene que llevar también el giro y la muñeca que le tocan en su postura (`posada(P, k, dedos, palma)`), y entre el aire y el
  apoyo va una postura con la mano ya de plano (levantada del suelo, o a un palmo de la pared).
- **La cabeza de Jérôme es grande** (33,5 cm del cuello a la coronilla, y el tupé por delante). Boca abajo en V (el perro), con
  los hombros a 45 cm del suelo, colgando lo tocaría: queda entre los brazos, algo levantada. Con las manos en una pared y los
  brazos estirados llega a la pared antes que las manos: la cabeza va caída entre los brazos y los hombros, hacia las orejas, y
  las manos se apoyan con el tronco ya casi paralelo al suelo. Mídase siempre `cabeza-suelo` y `cabeza-pared`.
- **En las posturas de paso, los brazos apoyados van algo flojos.** La vida retrasa la base un instante (0,04 s): con el brazo
  estirado del todo y la mano clavada, un cambio brusco de giro del tronco deja el hombro un centímetro más lejos o más cerca, y
  cerca del tope el codo da un salto (`pico`). En las posturas en las que solo se pasa (el cambio de pierna de la zancada baja),
  el hombro va a 2 cm menos que el brazo estirado.
- **El pie que da un paso a ras de suelo va clavado a su camino** (la zancada baja, el cruce de piernas): suelto, la pierna se
  mezcla hueso a hueso y el pie se hunde a medio camino. Y la cadera sube lo que haga falta para que la rodilla no toque.
- **La pierna de atrás, estirada, manda dónde puede estar la cadera** (`cadera(y)`, en la zancada baja): si la cadera sube sin
  irse hacia ese pie, el pie se levanta del suelo.
- **Una mano abierta que cuelga junto a una pared la medida la toma por un hueco** (mira a la pared, cerca y sin tocar). O el
  vídeo empieza ya colocado (el durmiente), o la mano roza la pared de verdad (el barrido: los dedos, con la muñeca algo doblada
  hacia el dorso, porque el antebrazo es más grueso que la mano).
- **La mano que descansa sobre la otra no es un hueco** (`contactos.js`): la medida «hueco: suelo» deja pasar la mano abierta que
  queda sobre la otra cuando esa sí está en el suelo (el libro abierto: palma con palma, tumbado de lado).
- **«Sentado», sin material**: en el suelo, con las piernas tendidas y las manos en los muslos (el abrazo).
- **De una postura a otra, una mano puede cruzar la cara.** Entre dos posturas el brazo se mezcla hueso a hueso: de los brazos en
  cruz a un abrazo, las manos subían a la altura de la cabeza y pasaban por la boca (8,7 cm dentro). Se arregla con una postura
  de paso (los brazos por delante, a la altura del pecho). **`node tools/entrenador/pruebas/manocabeza.js`** (nuevo; un minuto
  con todos) lo mide en el vídeo: la mano y el antebrazo contra la cabeza, cuadro a cuadro, y lista los que se le meten más de
  4,5 cm. No es un control: la mano en la nuca, en la cabeza o junto a la oreja se mete adrede (hoy salen nueve, todos así:
  los abdominales con las manos en la nuca, los estiramientos del cuello, la dominada comando con la cabeza junto a los
  antebrazos). Hay que mirar los que salgan nuevos, y sobre todo los que salgan «de paso».
- **Las manos en los hombros y el codo dando vueltas** (los círculos de codos): con la muñeca quieta, el codo solo puede andar
  por un círculo (los puntos a un brazo del hombro y a un antebrazo de la muñeca), y con la muñeca junto al cuello ese círculo
  pasaba pegado a la cabeza y los antebrazos se cruzaban delante del pecho. Se dice el codo (hacia dónde apunta el brazo en
  cada punto del círculo) y de él sale la muñeca, a 12 cm del hombro; la mano, doblada hacia el hombro con su giro y su muñeca
  (`prono: -90`, `mun: 60`), sin decirla en el mundo: así no se da la vuelta en ningún punto.
- **Antes de la auditoría entera, `node tools/entrenador/pruebas/movimiento.js`** (nuevo; 40 segundos con todos): lo clavado no se
  mueve de su sitio (0,02 cm), el cuerpo no da un salto (14 cm en un cuadro) ni una mano o un pie (36 cm). Es lo que la auditoría
  mide en el reproductor, y `contactos.js` no lo miraba: se le pasaron una mano que subía 52 cm en un cuadro (el despegue de la
  sentadilla con salto: los brazos, que ya vayan por delante al despegar, y el vuelo, de 0,2 s), una postura de paso a la que el
  brazo clavado no llegaba (la dominada comando: el Director arregla hasta unos 5 cm; con 6,4, la mano se quedaba a 1,5 de la
  barra) y los brazos estirados justo hasta su apoyo, que con la respiración se quedan cortos (a medio centímetro de estirarse,
  no al milímetro). **Y una secuencia tiene que caber en el paso más corto** (4,40 s menos lo que tarde en llegar): lo mide la
  auditoría («cada secuencia cabe en su paso»).

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
una toalla clara apenas se ve; doblada, con `franjas: true` lleva dos franjas de color, una cerca de cada canto, y con `bajo: 'talones'`
va con los pies, deslizándose por el suelo: el curl de isquios deslizando los talones), `toallas` (una toalla cogida a lo largo, que hace de correa), `banda` (la banda elástica: tiras y lazos), `poste` (un poste de hierro clavado en la arena: donde se ata la banda) y `maquina` (cualquier máquina, y el multipower: se dice por piezas).

- `banco`: `respaldo: 45` lo inclina; `85`, casi vertical (una silla); **negativo, declinado**. Con el respaldo
  levantado va con `rumbo: 180` (el respaldo sale hacia −Z, donde queda la cabeza de quien se tumba). `tapa: true`: el
  respaldo tapa de verdad lo que tiene detrás (para quien se pone de pie al otro lado, con un brazo por encima).
  `rodillos: [[z, y, sesgo], …]` (en el marco del banco) pone los rulos tapizados que sujetan los pies o las rodillas, cada uno a
  lo ancho y sobre su poste: el banco declinado (uno bajo las rodillas y otro ante los empeines) y el de hiperextensiones (un banco
  corto y alto, con el rodillo sobre los tobillos).
- `mancuernas`, con `lado: 'd'` y `cambia: { i: ['x', 'a2', …] }`: **pasa de una mano a la otra a la vista**. En los tramos que
  salen de esas posturas la lleva la otra mano; con las manos a menos de 11 cm va entre las dos y se va con la que la lleva según
  se separan. El cambio se hace en una postura con los dos puños juntos en el asa (`x`): así no da un salto.
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
  polea; y con `pasa: { manos: ['g'], 'tobillo-d': ['g2', 'a2', …] }` la tobillera **cambia de tobillo a la vista**: en los tramos
  que salen de esas posturas el cable va a donde diga la clave. En `manos` viaja entre los dos puños, así que en la postura de
  salida y en la de llegada tienen que estar uno a cada lado de la tobillera de ese tobillo, o daría un salto); `encuadre`, hasta qué altura cuenta para el encuadre (tumbado entre dos poleas, lo que importa está abajo).
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

- `poste`: `{ en: [x, z], alto, r }`. Un tubo con su pie; no tiene agarre: la mano que se sujeta a él va con su postura.
- `banda`: `{ tiras: [...], lazos: [...], color }`. Una **tira** va de un punto a otro (`de`, `a`) pasando por los que se digan
  (`por`), y es más fina cuanto más se estira (`largo0`, lo que mide sin estirar). Un punto es: del mundo (`[x, y, z]`); una mano
  (`'mano-i'`, o `'manos'`, entre las dos); un pie que la pisa (`'pie-i'`, bajo el arco; `'bola-i'`, bajo la parte de delante: sale
  por el canto que mira al punto siguiente, o por el que se diga, `'pie-i:fuera'`; lo que va bajo la zapatilla se pinta detrás
  de ella); la planta de un pie en el aire (`'arco-i'`, `'planta-i'`, y sus cantos, `'canto-i:fuera'`, `'canto-i:dentro:planta'`,
  por donde la tira dobla hacia la planta: se pinta delante o detrás de la zapatilla según mire la suela); `'empeine-i'`; un punto
  pegado al cuerpo (`{ en: 'torax' | 'pelvis', a: [...] }`) o a una articulación (`{ de: 'i', p: 'rod', mas: [...] }`); o el
  enganche de un lazo (`'lazo:0'`, por el lado que mira al otro punto). Con `asas`, un mango en la mano; con `ve: [posturas]`,
  solo se ve en los tramos que salen de ellas (la banda que cambia de mano o de pie); con `rodea: { en, c, a, b, sentido,
  siempre }` no atraviesa el tronco: lo rodea por el lado que se diga. Un **lazo** es la banda rodeando algo: las dos piernas
  (`'muslos'`, `'pantorrillas'`, `'tobillos'`: la minibanda, con sus dos tramos entre ellas), un miembro (`'muslo-i'`,
  `'pantorrilla-i'`, `'tobillo-i'`, `'brazo-i'`, `'mano-i'`, `'pie-i'`; con `a`, a cuántos cm de la articulación) o un punto del
  mundo con su `eje` y su radio (el poste, la barra). No tiene agarre: las manos van con su postura y la banda las sigue.

- `maquina`: `{ fijo: [pieza, …], mec: [mecanismo, …], agarres: { i, d }, encuadre, reposo }`. Se dice por piezas, en centímetros:
  `['tubo', A, B, radio, color]`, `['rulo', A, B, radio]` (un rodillo tapizado), `['asa', A, B]`, `['cojin', centro, [ancho, grueso,
  largo], a lo largo de qué va, hacia dónde mira]`, `['placa', …]` (lo mismo, de chapa), `['disco', centro, eje, radio]` y `['pila',
  [x, y, z], alto, { mec, gana }]` (la torre de placas: las de arriba suben con el mecanismo). Un **mecanismo** es lo que se mueve, con
  sus piezas: `gira: [punto del eje, dirección]` (una palanca), `corre: dirección` (un carro: la plataforma de la prensa, el respaldo de
  la hack, la barra del multipower) o `lleva: true` (va con un punto del cuerpo sin girar: el cinturón); `sigue`, el punto del cuerpo
  con el que va (`'manos'`, `'mano-i'`, `'tobillos'`, `'bolas'`, `'rodillas'`, `'hombros'`, `'codo-i'`, `{ en: 'torax', a }`…; con `max`,
  de un par manda el que más empuja); `ref`, dónde está ese punto con la máquina en reposo; `lim`, hasta dónde llega (grados o cm);
  `quieto`, dónde espera mientras nadie la ha cogido (las posturas de `reposo` de la coreografía, con `reposo: true` en la máquina); y
  sus asas: `agarres: { i, d }` (`'mi@0:1'`, `'md@0:-1'`) o `barra: [centro, eje]` (un agarre corrido: `'mi@0:22'`, a 22 cm del centro).
  El material se coloca antes de clavar las manos: la palanca gira hasta donde iba la mano y la mano se clava a su asa.

El material sabe **de qué postura sale** lo que Jérôme está haciendo (`ctx.de`, que le da `60-director.js`): con eso las
`toallas` saben en qué pie van y la `banda`, qué tiras y qué lazos se ven (`ve`). Y `ctx.reposo` / `ctx.enLista([...])`, si lo que espera sigue esperando.
Desde el bloque 15, también **a qué postura va** (`ctx.a`) y **por dónde anda el tramo** (`ctx.u`, de 0 a 1; 1 en una postura
mantenida): con eso vuela el balón.

**De qué se dibuja.** El material, como todo lo demás, solo con `path`, `circle`, `ellipse` y `rect` (en grupos `g`,
con sus degradados y sus recortes): es lo que `src/85-lienzo.js` sabe copiar al canvas con Samsung Internet. Un
`line`, un `polygon`, un `text`, un `use`, una máscara o un filtro, en ese navegador no se verían, y en Chromium nadie
lo notaría: `auditar_entrenador.js` lo mira en cada vídeo y se pone en rojo.

El material del bloque 15:

- `fitball`: `{ radio (30), en: [x, z] }`, quieto; o `sigue: { … }`, rodando con lo que lleva encima: `que: 'pierna'` (va donde lo
  pisan o descansan en él las piernas: llega desde más allá de los pies —`desde: 1`, los pies hacia +z; `−1`, hacia −z— hasta tocar
  la zapatilla o la pierna, y el muslo con `muslo: true`), `que` + `mapa: [[z del punto, z del centro], …]` (a su paso) o `que` +
  `dz` (debajo de ese punto del cuerpo).
- `disco`: `{ radio, grosor, color, doble, a: 'manos' | 'i' | 'd' | 'torax' | 'pelvis', punto, eje, ejeMundo, corre, cinturon }`.
- `balon_medicinal`: `{ radio, en: [x, z] }` (quieto en el suelo), o entre las dos manos; `suelta: [{ de, a, en, u, va, vuelve }]`,
  un lanzamiento.
- `suspension`: `{ ancla: [x, y, z], cuello, a: 'manos' | 'i' | 'd' | 'pies' }`: el mosquetón, el cuello, los dos ramales y las
  asas (en los pies, los estribos). Cuelga de una `barra_dominadas` puesta de pórtico.
- `anillas`: `{ alto, sep, z }`: cada aro, en su puño, y su cinta hasta su anclaje.
- `rueda`: `{ radio }`: entre los dos puños, con su eje de mango.

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

## Lo que salta, lo que se dobla y lo que gira de golpe (22 de noviembre de 2026)

Las medidas de antes miraban dónde está cada cosa en un instante (una mano en el suelo, la cabeza y una barra). Ninguna miraba
cómo se llega de un cuadro al siguiente, y el vídeo se ve seguido. Mirándolo entero, cuadro a cuadro y con la vida puesta
(`pruebas/contactos.js`, `video()`), salió lo que no se ve en ninguna postura: rodillas que doblaban hacia atrás un instante
(33 vídeos), rodillas y codos que cambiaban de lado de un cuadro al siguiente (30), manos que daban media vuelta de golpe (83),
piernas y brazos rectos y clavados que se doblaban de paso (66) y tramos que no enlazaban con el siguiente (8).

**En el motor** (vale para todos los vídeos, los que hay y los que vengan):

- **Lo tenso** (`60-director.js`, `clavar`). La pierna o el brazo que van clavados y casi rectos en las dos posturas de un tramo
  siguen casi rectos por el camino: la cadera se aparta lo justo (hasta 8 cm) para que el miembro no tenga que doblarse. Se
  mide en la mezcla limpia de las dos posturas (sin la vida), así que en las dos puntas no cambia nada. Antes había que
  pedirlo en cada coreografía (`tensos`); ahora es lo normal para lo clavado a su sitio, a un punto dicho o a un agarre que
  no se mueve (`agarreFijo`: la barra de dominadas, las paralelas). `tensos: false` lo quita; `tensos: [...]` lo fuerza.
- **La rodilla, hacia delante** (`10-esqueleto.js`, `clavar` y `frenteDePierna`). Al volver a resolver una pierna clavada y casi
  recta, la pista de hacia dónde dobla la rodilla podía caer detrás de la línea de la pierna, y la rodilla doblaba al revés
  un cuadro o dos. Ahora, si la pierna está casi recta, la pista se refleja hacia el frente de la pierna.
- **La mano no gira de golpe** (`60-director.js`, `sinGolpe`). Hacia dónde mira la palma sale de la bisagra del codo, del prono
  y de lo que la postura diga en el mundo, y hay instantes en que eso cambia de un cuadro al siguiente. En lo que se ve, la
  mano gira sobre su antebrazo como mucho 600° por segundo (20° por cuadro). Las manos quietas no cambian ni un grado.

**En los datos** (lo que el motor no puede adivinar; al hacer una coreografía, mírese):

- **La palma dicha tiene que decir de qué lado de la barra queda la mano en todo el camino.** Con `barra` y `palma`, la palma
  sale perpendicular a la barra y al antebrazo, y `palma` solo elige cuál de las dos caras. Si en algún momento del tramo la
  palma dicha queda de canto (ni de un lado ni del otro), la mano da media vuelta. Remedios: una `palma` con algo de la otra
  dirección (la dominada con toallas: hacia dentro *y* algo hacia delante), el sentido de `barra` elegido para que la palma
  quede del mismo lado en las dos posturas (la elevación lateral en polea, el press Arnold), o decir cada mano con su barra
  (`mi`, `md`: dicha una vez para las dos, la derecha la lleva reflejada). `node tools/entrenador/pruebas/rama.js <id> <de> <a>`
  sigue la cara que continúa sin soltar y dice dónde la palma dicha deja de mandar.
- **Lo que gira media vuelta, que lo diga una postura de en medio** (el press Arnold): de «hacia él» a «hacia delante» de un
  tirón, la palma pasa por no mirar a ningún sitio.
- **Un brazo que se estira del todo hacia donde no llega no dice hacia dónde mira la mano** (el giro ruso): el objetivo, a
  donde llegue con el codo aún algo doblado.
- **La mano que va de colgar a apoyarse de plano en algo más alto (o al revés) pasa por una postura con la mano aún suelta**
  (el estiramiento de cuádriceps en la pared): de los dedos hacia abajo a los dedos hacia arriba, de un tirón, se dan la vuelta.
- **Las posturas de en medio no pueden tener una mano dentro de un muslo** (el flexor de la cadera, de rodillas): se la aparta
  hacia un lado al llegar y hacia otro al salir, y salta.
- **Lo que se coge del suelo a los lados**: `aCoger(base, g, polo, k)` da la postura a medio agacharse, con las manos ya por
  fuera de los muslos (los paseos del granjero). Y la postura nueva tiene que entrar en `reposo`, o lo que espera en el
  suelo salta a las manos antes de tiempo (no lo mide nadie: se ve).
- **La repetición que sale de una pausa empieza por la pausa** si lo primero que hace es pasar una mano por encima de un muslo
  (el giro ruso): al llegar a ella desde el paso anterior, el Director mezcla un instante lo que hacía con lo que toca.
- **Colgado de una barra, la cabeza no queda justo debajo**: con los brazos estirados, las púas del tupé llegan a su altura.
  `miraBarra(P, dz, cab)` (70-coreografias.js) lo cuelga unos centímetros por detrás, con los brazos igual de estirados, y
  mirando a la barra.
- **Rodar por el suelo, a paso constante**: lo que tarda en arrancar y en frenar (`entra`, `sale`) tiene que dejar la misma
  velocidad que los tramos de en medio (`lineal`), o los pies, que van un instante detrás de la cadera, dan un salto.

**Las medidas y sus límites** (`LIMITES`, en `contactos.js`; la auditoría las pasa todas):

| Medida | Qué | Límite |
|---|---|---|
| `rodilla-reves`, `rodilla-reves-vida` | lo que la rodilla cae por detrás de la línea de su pierna | 1 cm |
| `lado` | lo que una rodilla o un codo saltan al cambiar de lado de un cuadro al siguiente, de más sobre lo que viaja su miembro | 1,5 cm |
| `pico` | un punto que en un cuadro se mueve más de dos veces y media lo que en el de antes y en el de después, y 2 cm | ninguno |
| `mano-gira` | lo que gira la mano, en lo que se ve, de un cuadro al siguiente | 21° |
| `mano-gira-rep` | dentro de la repetición, lo que el Director tiene que frenar la mano | 45° |
| `dobla-clavado` | lo que se dobla de paso un miembro clavado que va recto en las dos puntas | 6° |
| `dobla-rep-viaja`, `dobla-rep-libre` | lo mismo en la repetición, clavado que viaja (un paso) y libre | 20° y 30° |
| `dobla-rep` | en la repetición, lo que cualquier rodilla o codo se doblan de paso de más sobre sus dos puntas | 45° |
| `enlace` | lo que se aparta el final de un tramo del principio del siguiente (o de la postura en la que se queda) | 1,5 cm |
| `cabeza-barra`, `cabeza-barra-vida` | lo que una barra, un tubo o un cable se meten en la cabeza (antes, 2,5 y 3,5) | 1,5 cm |

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
