# tools/entrenador — Jérôme, el entrenador

El vídeo de cada ejercicio de «Su cuerpo». No son archivos de vídeo: Jérôme es un dibujo
vectorial que se mueve dentro de la app. Aquí están sus fuentes; lo que la app carga es
`modulos/entrenador.js`, que sale de juntarlas.

    python3 tools/entrenador/construir.py              # src/ → modulos/entrenador.js
    python3 tools/entrenador/construir.py --comprobar  # ¿el módulo es el de sus fuentes?
    python3 tools/entrenador/muestra.py                # los datos para las páginas de prueba
    node tools/auditar_entrenador.js 8766              # con python3 -m http.server 8766 en la raíz

## Qué hay

| fichero | qué hace |
|---|---|
| `src/00-nucleo.js` | vectores, giros (bases y cuaterniones), curvas de tiempo |
| `src/10-esqueleto.js` | las medidas de Jérôme (en cm), la postura escrita → huesos, la mezcla por arcos, clavar un pie o una mano |
| `src/20-figura.js` | la cámara y el cuerpo: torso por secciones, brazos y piernas, manos, zapatillas, el brillo de los músculos |
| `src/30-cabeza.js` | la cabeza de `modulos/guia.js` (de frente), y de perfil y de espaldas; las caras |
| `src/40-escenario.js` | la escena: el orden de pintado, la sombra, los tres decorados (fuera, calistenia, gimnasio; día y noche) |
| `src/50-material.js` | barra, mancuernas, banco, soporte, barra de dominadas, escalón, pared, polea… |
| `src/60-director.js` | interpreta una coreografía: repetición, secuencias, lo clavado, la estela, los anillos, el encuadre |
| `src/70-coreografias.js` | **las coreografías**, una por ejercicio |
| `src/80-reproductor.js` | el vídeo: cabecera, un tramo por paso, cierre; los mandos; la voz; sus textos (10 idiomas) |
| `src/90-huellas.js` | lo escribe `construir.py`: la huella de los pasos con los que se hizo cada coreografía |
| `src/99-salida.js` | `window.TG_ENTRENADOR` |
| `pruebas/` | hojas de contacto, el reproductor suelto, las capturas y la grabación a MP4 |
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
| `m: { tipo, prono, mun, lat }` | la mano: `puno`, `abierta`, `suelta`, `indice`, `pulgar`; `prono` 90 palma abajo o atrás, −90 arriba o adelante |
| `p: { suelo: [x, z], abre, talon, alto, polo }` | el pie plantado: dónde cae el tobillo, cuánto apunta hacia fuera, cuánto sube el talón, sobre qué altura pisa |
| `p: { a: [x, y, z], polo }` · `p: { e, z, g, c }` | la pierna por destino del tobillo, o por ángulos (colgado, tumbado) |
| `t: { punta, arriba }` · `t: { tob }` | el pie a mano (vectores del mundo) o el ángulo del tobillo |

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

## Lo que el dibujo no hace bien (todavía)

- Un brazo o un muslo que apunta hacia la cámara se ve corto y gordo: es un dibujo plano por pieza.
  Se arregla eligiendo la vista (de lado para las bisagras y las sentadillas).
- Solo el escalón tapa de verdad lo que tiene detrás; el resto del material se ordena por distancia.
- La zapatilla es rígida: de puntillas gira sobre la bola y se levanta lo justo para no hundirse.
