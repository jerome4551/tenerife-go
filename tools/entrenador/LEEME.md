# tools/entrenador — Jérôme, el entrenador

El vídeo de cada ejercicio de «Su cuerpo». No son archivos de vídeo: Jérôme es un dibujo
vectorial que se mueve dentro de la app. Aquí están sus fuentes; lo que la app carga es
`modulos/entrenador.js`, que sale de juntarlas.

    python3 tools/entrenador/construir.py              # src/ → modulos/entrenador.js
    python3 tools/entrenador/construir.py --comprobar  # ¿el módulo es el de sus fuentes?
    python3 tools/entrenador/muestra.py                # los datos para las páginas de prueba
    node tools/auditar_entrenador.js 8766              # con python3 -m http.server 8766 en la raíz (tarda unos minutos)
    node tools/auditar_entrenador.js 8766 73           # mientras se hace un bloque: cuadro a cuadro, solo los vídeos de src/73-*.js (pase parcial),
                                                       # y con Samsung Internet (el canvas), todos esos y no tres de muestra

## Qué hay

| fichero | qué hace |
|---|---|
| `src/00-nucleo.js` | vectores, giros (bases y cuaterniones), curvas de tiempo |
| `src/10-esqueleto.js` | las medidas de Jérôme (en cm), la postura escrita → huesos, la mezcla por arcos, clavar un pie o una mano |
| `src/20-figura.js` | la cámara y el cuerpo, dibujado por masas a tres tintas: torso, brazos y piernas, manos con dedos, zapatillas que se doblan, el brillo de los músculos |
| `src/30-cabeza.js` | la cabeza, con volumen: gira de verdad (ya no son tres dibujos). Las caras, la mirada y el tupé, que va un instante detrás |
| `src/40-escenario.js` | la escena: el orden de pintado, la sombra, los tres decorados (fuera, calistenia, gimnasio; día y noche) |
| `src/50-material.js` | barra, mancuernas, banco, soporte, barra de dominadas, escalón, pared, polea… |
| `src/55-vida.js` | lo que le da vida: respira, llega por partes, cabecea al frenar, reparte el peso, acompaña con la mano al hablar |
| `src/60-director.js` | interpreta una coreografía: repetición, secuencias, lo clavado, la estela, los avisos, el encuadre; y los gestos del presentador |
| `src/70-coreografias.js` | **las coreografías**, una por ejercicio: el bloque 1 (los 40 más conocidos de los 12 grupos) y las ayudas comunes (`tabla`, `bajaSube`, `aLosLados`, las manos; y las de cualquier bloque: `conAgarre`, `estirado`, `inclinado`, `colgando`, `anteTronco`, `cuelga`/`activo`, `barraD`…) |
| `src/71-pecho.js` | las coreografías del bloque 2: **pecho** (35), por familias (tumbado en un banco, las poleas, las flexiones, los fondos, los estiramientos) |
| `src/72-dorsal.js` | las coreografías del bloque 3: **dorsal** (35), por familias (colgado de la barra, el front lever, los jalones, los remos, la polea a una mano, los estiramientos) |
| `src/73-espalda-alta.js` | las coreografías del bloque 4: **espalda alta** (30), por familias (los encogimientos, el remo sentado en polea, los remos libres, los omóplatos, tumbado boca abajo, los estiramientos del cuello) |
| `src/80-reproductor.js` | el vídeo: cabecera, un tramo por paso, cierre; los mandos; la voz (y qué voz); sus textos (10 idiomas) |
| `src/85-lienzo.js` | Samsung Internet: el dibujo en un canvas que copia el SVG, porque su modo oscuro repinta los SVG (el mismo arreglo que el del tour, en `modulos/guia.js`; 12 de noviembre de 2026) |
| `src/90-huellas.js` | lo escribe `construir.py`: la huella de los pasos con los que se hizo cada coreografía |
| `src/99-salida.js` | `window.TG_ENTRENADOR` |
| `pruebas/` | hojas de contacto, un ejercicio desde varios lados (`vistas.html`), el repaso paso a paso contra la ficha (`repaso.py`), las medidas de una postura (`mide.js`), los gestos fotograma a fotograma, el reproductor suelto, las capturas y la grabación a MP4 |
| `muestra/` | la página de muestra (un solo fichero, para enseñarla en el móvil) |

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
| `m: { tipo, prono, mun, lat }` | la mano: `puno`, `abierta`, `plana`, `suelta`, `indice`, `pulgar` (un gesto pasa a otro poco a poco: los dedos se cierran, no saltan); `prono` 90 palma abajo o atrás, −90 arriba o adelante |
| `m: { tipo, barra: [x, y, z], palma: [x, y, z] }` | la mano que **agarra algo**: se dice, en el mundo, a lo largo de qué va lo que agarra (`barra`) y hacia dónde mira la palma (`palma`; con `barra`, solo de qué lado queda), y el antebrazo gira lo que haga falta, esté el codo donde esté. `EN_BARRA` (la palma hacia delante: una dominada, un press tumbado), `EN_BARRA_SUP` (hacia él). Con `prono` solo, el puño gira con el codo y acaba atravesado en la barra |
| `p: { suelo: [x, z], abre, talon, alto, polo }` | el pie plantado: dónde cae el tobillo, cuánto apunta hacia fuera, cuánto sube el talón, sobre qué altura pisa |
| `p: { a: [x, y, z], polo }` · `p: { e, z, g, c }` | la pierna por destino del tobillo, o por ángulos (colgado, tumbado) |
| `t: { punta, arriba, flex }` · `t: { tob }` | el pie a mano (vectores del mundo; `flex`, cuánto se dobla la zapatilla por la bola del pie) o el ángulo del tobillo |

Ayudas: `sobre(base, cambios)`, `refleja(postura)`, `tabla(ángulo, extra)` (en plancha sobre las
puntas), `aLosLados(codo)`, `PUNO`, `PRONO`, `SUPINO`, `SUELTA`, `PALMA_ABAJO`, `EN_BARRA`, `EN_BARRA_SUP`, `COLGADO`,
`bajaSube`, `subeBaja`.

La rodilla de un pie plantado se dobla hacia delante de la pelvis; con el tronco muy inclinado (una bisagra de cadera:
más de 50°) va hacia donde apunta el pie, que es por donde se dobla de verdad. Si hace falta otra cosa, `polo`.

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
(posturas en las que ya se ha soltado), `picado` (16 para los ejercicios de suelo), `zoom`.

Los clavos: `'ti'` (el tobillo, donde esté), `'mi@0:28'` (la mano al agarre del material 0, a 28 cm
del centro), `'mi=x,y,z'` (a un punto).

**Cuánto dura un paso.** Lo que se tarda en leer su texto (`80-reproductor.js`: 4,4 s como poco, y 0,058 s por letra,
o 0,16 por carácter en chino), **no lo que dure su acción**. La repetición da las vueltas que quepan; pero una
secuencia (`sec`) más larga que su paso se queda a medias cuando entra el siguiente, y «vuelva despacio» no llega a
verse. Así que cada secuencia tiene que caber en su paso **en el idioma en que el texto es más corto** (lo que sobre
tras la última postura, si es quedarse quieto en ella, no cuenta: mantener sí puede pasar de largo). Y si el paso es
el primero, o el que sigue a un consejo, su acción arranca 0,25 s después (la cortinilla del cambio de plano).
`auditar_entrenador.js` lo mira en los diez idiomas y dice cuál va más justa.

La repetición no vuelve a empezar de un paso `'rep'` al siguiente: sigue por donde iba. `{ rep: 2.1 }` solo cuenta
cuando se llega a ese paso desde una postura o una secuencia (o saltando a él con los mandos).

## Los bloques

Los 533 ejercicios se hacen por bloques, y cada bloque nuevo va en su trozo `7x` (`construir.py` junta todos los
`src/7*.js` y apunta la huella de los pasos de cada ejercicio):

| bloque | trozo | qué |
|---|---|---|
| 1 | `70-coreografias.js` | los 40 más conocidos, de los 12 grupos |
| 2 | `71-pecho.js` | pecho: 35 (todo lo que no pide banda, máquina, cinta de suspensión, fitball ni disco) |
| 3 | `72-dorsal.js` | dorsal: 35 (quedan 5: las dominadas asistidas con banda y en máquina, las lastradas con disco y el lanzamiento de balón medicinal) |
| 4 | `73-espalda-alta.js` | espalda alta: 30 (con los 3 del bloque 1, 33 de 44; quedan 11: 5 con banda, 4 en máquina y 2 con cinta de suspensión) |

En un trozo de bloque, los ejercicios van **por familias**, con una función por familia (en `71-pecho.js`:
`tumbado(inclinación)`, `brazo(inclinación, desde el hombro)`, `pressMancuernas`, `pressBarra`, `aperturas`, `cruce`,
`plancha`…; en `72-dorsal.js`: `cuelga`/`activo`/`arriba` (colgado), `palanca(cabeceo, ángulo de los brazos)` (el front
lever), `sentado` + `arribaJ`/`abajoJ` (los jalones), `inclinado(ángulo)` + `colgando`/`anteTronco` (los remos),
`arrodillado`…; en `73-espalda-alta.js`: `remoSentado(manos, mano, {…})` (en la máquina de remo), `bocaAbajo` +
`brazoEn(postura, ángulo, altura)` + `elevacionProna` (la Y, la T, la I), `aUnBrazo(postura, muñeca, …)` (el cuerpo, a
un brazo estirado justo de una mano apoyada: las flexiones escapulares)…) y cada ejercicio es esa función con sus números. **Cada ejercicio se coteja con su ficha paso a paso**:
si el paso 2 dice «suba las mancuernas», en el paso 2 suben; si dice «las palmas enfrentadas», se miran.

Las ayudas que valen para cualquier bloque están en `70-coreografias.js` (nacieron en el bloque 3 y el 4 las subió
allí; cada trozo es una función cerrada y no ve las de otro): `conAgarre(postura, punto, polo, lado)` (el centro del
puño cae en ese punto del mundo: una barra que va al ombligo, una mancuerna junto a la cadera), `estirado(postura,
hacia, lado)` (el brazo, estirado desde el hombro hacia un punto: la polea), `inclinado(ángulo, extra)` (la bisagra de
cadera), `colgando(postura, manos, delante)` (los brazos a plomo), `anteTronco(postura, arriba, fuera, x)` (un punto
ante el tronco: el ombligo, el pecho), `cuelga`/`activo`/`clavosB`/`barraD` (colgado de la barra) y `une`. Lo que se
coge más tarde (el agarre de la polea, la barra T en el suelo) espera en su sitio: `reposo` en el material y en la
coreografía.

Lo que casi no se mueve (encoger los hombros, juntar los omóplatos, los círculos de hombros) se escribe con `hom:
[sube, adelanta]`, en centímetros: 6 de subida es «lo más alto que pueda»; −3 de adelanto, los omóplatos juntos.

## El material (`50-material.js`)

`barra` (con discos, o `barra_z`), `mancuernas` (una en cada mano, en una sola, o una entre las dos), `kettlebell`,
`banco`, `soporte` (el de la barra), `barra_dominadas`, `paralelas`, `escalon`, `esterilla`, `pared`, `polea`,
`landmine` (la barra T) y `toalla` (algo blando).

- `banco`: `respaldo: 45` lo inclina; `85`, casi vertical (una silla); **negativo, declinado**. Con el respaldo
  levantado va con `rumbo: 180` (el respaldo sale hacia −Z, donde queda la cabeza de quien se tumba).
- `polea`: `rumbo` gira la columna (`180`, detrás de Jérôme; `90` y `−90`, una a cada lado mirando al centro: el
  cruce de poleas); `a`, a qué va el cable (`'manos'`, `'i'`, `'d'`…); `encuadre`, hasta qué altura cuenta para el
  encuadre (tumbado entre dos poleas, lo que importa está abajo).
  La **máquina de jalón** es la polea con `brazo` (cuánto sale de la columna el brazo de arriba: la polea va en su
  punta), `asiento: [a cuánto de la columna, alto]` y `rodillo: [a cuánto, alto]`. `agarre`: `'barra'`, `'cuerda'`,
  `'asa'` (a una mano) o `'v'` (el triángulo). `reposo: [x, y, z]`: dónde cuelga el agarre mientras nadie lo ha cogido.
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
- `soporte`: `z` y `alto` son donde descansa la barra: el agarre de la postura que la coge tiene que caer ahí.

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
   Jérôme tiene que caber entero en el cuadro en las dos vistas, a 4 px o más del borde (de los 400 del dibujo): la
   auditoría lo mide y dice cuáles se arriman más. Si uno toca el borde, `zoom: 0.92` (o menos) en su coreografía.
3. Verla en el reproductor de verdad, paso a paso, **con el texto de cada paso al lado**:
   `python3 tools/entrenador/pruebas/repaso.py carpeta "id1,id2,…"` (una hoja por ejercicio: una fila por paso, y la
   vista de «Girar»). Para un momento concreto: `python3 tools/entrenador/pruebas/tira.py salida.png <id> "p1+2,p2+1.5,p3+2,c+2"`
   (o varios de golpe, dos fotogramas por paso: `pruebas/flujo.py salida.png "id1,id2,…"`).
4. `python3 tools/entrenador/construir.py` y `node tools/auditar_entrenador.js 8766`.

Para grabar un MP4 (1080 × 1920, 30 cuadros por segundo): `python3 tools/entrenador/pruebas/graba.py salida.mp4 <id> [idioma]`.

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
- Con «½×» la repetición va a media velocidad, pero cada paso dura lo mismo: una secuencia (sentarse y coger la barra,
  un estiramiento) va igual de lenta y no le da tiempo a acabar antes de que entre el paso siguiente.
- Las piezas se ordenan por distancia, enteras: cuando dos se cruzan (un brazo por delante del pecho), el cambio de
  orden es de un cuadro a otro.
