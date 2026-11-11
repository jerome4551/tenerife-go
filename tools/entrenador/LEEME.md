# tools/entrenador — Jérôme, el entrenador

El vídeo de cada ejercicio de «Su cuerpo». No son archivos de vídeo: Jérôme es un dibujo
vectorial que se mueve dentro de la app. Aquí están sus fuentes; lo que la app carga es
`modulos/entrenador.js`, que sale de juntarlas.

    python3 tools/entrenador/construir.py              # src/ → modulos/entrenador.js
    python3 tools/entrenador/construir.py --comprobar  # ¿el módulo es el de sus fuentes?
    python3 tools/entrenador/muestra.py                # los datos para las páginas de prueba
    node tools/auditar_entrenador.js 8766              # con python3 -m http.server 8766 en la raíz (tarda unos minutos)

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
| `src/60-director.js` | interpreta una coreografía: repetición, secuencias, lo clavado, la estela, los anillos, el encuadre; y los gestos del presentador |
| `src/70-coreografias.js` | **las coreografías**, una por ejercicio |
| `src/80-reproductor.js` | el vídeo: cabecera, un tramo por paso, cierre; los mandos; la voz (y qué voz); sus textos (10 idiomas) |
| `src/90-huellas.js` | lo escribe `construir.py`: la huella de los pasos con los que se hizo cada coreografía |
| `src/99-salida.js` | `window.TG_ENTRENADOR` |
| `pruebas/` | hojas de contacto, los gestos fotograma a fotograma, el reproductor suelto, las capturas y la grabación a MP4 |
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
| `p: { suelo: [x, z], abre, talon, alto, polo }` | el pie plantado: dónde cae el tobillo, cuánto apunta hacia fuera, cuánto sube el talón, sobre qué altura pisa |
| `p: { a: [x, y, z], polo }` · `p: { e, z, g, c }` | la pierna por destino del tobillo, o por ángulos (colgado, tumbado) |
| `t: { punta, arriba, flex }` · `t: { tob }` | el pie a mano (vectores del mundo; `flex`, cuánto se dobla la zapatilla por la bola del pie) o el ángulo del tobillo |

Ayudas: `sobre(base, cambios)`, `refleja(postura)`, `tabla(ángulo, extra)` (en plancha sobre las
puntas), `aLosLados(codo)`, `PUNO`, `PRONO`, `SUPINO`, `SUELTA`, `PALMA_ABAJO`, `bajaSube`, `subeBaja`.

## Una coreografía

```js
COREO['sentadilla-peso-corporal'] = {
  vista: [42, 90],                 // la cámara, y la de «Girar»
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

## Cómo se hace una

1. Leer los pasos de la ficha en castellano. Contarlos.
2. Escribir las posturas clave y probarlas en la hoja de contacto, desde las dos vistas:
   `python3 tools/entrenador/pruebas/foto.py "file://$PWD/tools/entrenador/pruebas/hoja.html?id=<id>&medio=0" salida.png 1200 800 700`
3. Verla en el reproductor de verdad, paso a paso:
   `python3 tools/entrenador/pruebas/tira.py salida.png <id> "p1+2,p2+1.5,p3+2,c+2"`
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
- Solo el escalón tapa de verdad lo que tiene detrás; el resto del material se ordena por distancia.
- Las piezas se ordenan por distancia, enteras: cuando dos se cruzan (un brazo por delante del pecho), el cambio de
  orden es de un cuadro a otro.
