# El personaje de «Su cuerpo» en 3D: cómo se hacen sus datos

El motor (`modulos/cuerpo3d.js`, WebGL 2, sin bibliotecas) dibuja un cuerpo humano con su pelo, su
ropa, su calzado, sus gafas, su audífono y su prótesis, y encima el mapa de los 35 músculos. Lo que
dibuja sale de `datos/cuerpo3d/`: 71 ficheros sueltos (mallas en `.bin`, texturas en `.webp` y `.png`)
y `indice.json`, que los nombra con sus bytes y su sha256. Esos ficheros los hacen los guiones de
esta carpeta a partir de los datos de MakeHuman, que no van en el repositorio.

Es el motor y la tubería de la maqueta «Su cuerpo Amanecer» (6-11-2026), pasados a la app el
7-11-2026 (bloque 3 del rediseño). Los datos que hay en `datos/cuerpo3d/` son, byte a byte, los que
se vieron en la maqueta: `construir3d.py` los vuelve a dar iguales (comprobado el 7-11-2026).

## Qué hace cada guion

| Guion | Qué hace |
|---|---|
| `construir3d.py` | Lo construye todo: las seis variantes del cuerpo (silueta a o b × complexión 0, 1 o 2) con su postura de pie, los ojos, las cejas, las pestañas, los seis peinados y las zapatillas ajustados a cada variante, las texturas de la piel y del pelo, el mapa de músculos, los gestos (parpadeo y sonrisa) y los hitos de cada variante. Escribe `datos3d.js` (todo en una línea, en base64, como lo leía la maqueta) y, con `--empaquetar`, llama a `empaqueta3d.py`. Medio minuto. |
| `empaqueta3d.py` | De `datos3d.js` a `datos/cuerpo3d/`: cada malla en su fichero común (triángulos, UV, soldadura, gestos, máscaras) y uno por variante (posiciones), las texturas sueltas, y `indice.json`. Cada fichero lleva en el nombre los 8 primeros hex del sha256 de su contenido: un dato nuevo es un fichero nuevo, y el service worker puede guardarlos para siempre (el índice va «red primero»). Antes de escribir borra lo de la pasada anterior. |
| `mh.py` | Lee los formatos de MakeHuman (`base.obj`, `.target`, `.mhskel`, `.mhw`) y aplica sus reglas de mezcla: la malla base, las variables macro, el esqueleto y los pesos, la postura. Código propio: solo se leen los formatos. |
| `cuerpo.py` | Las seis variantes (sus variables macro) y la postura natural (brazos bajados, piernas bajo la cadera). |
| `piezas.py` | Las piezas que se ajustan al cuerpo (pelo, cejas, pestañas, ojos, zapatillas): su lectura y su ajuste a cada variante. |
| `ropa.py` | Las máscaras de las partes del cuerpo (brazos, piernas, cabeza) por vértice, con los pesos del esqueleto. La ropa misma no está aquí: la corta el motor, en el móvil, de la propia malla del cuerpo. |
| `musculos.py` | El mapa de músculos: 35 regiones en 12 grupos, dibujadas con anatomía de superficie sobre tres cartas del cuerpo (tronco, brazo, pierna) y horneadas en el espacio UV de la malla (una textura de identificadores y otra de distancia al borde). Dibujo propio: no se calca ningún atlas ni modelo anatómico. |
| `banco.html` y `foto.js` | Un banco para mirar el motor solo, con los datos de `datos/cuerpo3d/`, sin la app: `python3 -m http.server 8790` en la raíz y `node tools/cuerpo3d/foto.js 8790 salida.png "fig=b&comp=0&pelo=largo&giro=30&audifono=ambos&protesis=pierna_izq"`. |

## Cómo se hacen los datos

Hace falta Python 3 con numpy, scipy, opencv (`cv2`) y Pillow, y los datos de MakeHuman en dos
carpetas, que se le dicen al guion con dos variables (o se dejan en `tools/cuerpo3d/fuentes/`, que
`.gitignore` no deja entrar en git):

```
TG_MH=<…/makehuman/makehuman/data> TG_MJS=<…/makehuman-data/public/data> python3 tools/cuerpo3d/construir3d.py --empaquetar
```

- `TG_MH`: la carpeta `makehuman/data` del repositorio oficial `makehumancommunity/makehuman`
  (commit a8bc2d54, 26-6-2024). De ahí salen la malla base (`3dobjs/base.obj`), las formas
  (`targets/`), el esqueleto y sus pesos (`rigs/default.mhskel`, `default_weights.mhw`), los ojos y
  las unidades de expresión de los gestos.
- `TG_MJS`: la carpeta `public/data` de `makehuman-js/makehuman-data` (commit e5d1a42c, 17-6-2017),
  una copia de 2017 de las piezas oficiales en JSON. De ahí salen el pelo (short02, bob02, long01,
  afro01, ponytail01, Braid01), las cejas (eyebrow010), las pestañas (eyelashes02), las pieles
  (young_lightskinned y young_darkskinned, hombre y mujer, a 512 px) y la malla de las zapatillas
  (shoes05; su textura NO se usa: el dibujo de la suela, los cordones y los refuerzos lo hace el
  motor en coordenadas del pie).
- `TG_CACHE` (opcional): dónde dejar lo leído de MakeHuman (`base.npz`, `pesos.npy`, `mus_id.png`);
  por defecto, `tools/cuerpo3d/cache/`.

Lo que escribe: `tools/cuerpo3d/datos3d.js` (no va a git) y, con `--empaquetar`, los 72 ficheros de
`datos/cuerpo3d/`. Para mirarlos sin la app, el banco (`banco.html`). Para probarlos en la app,
`node tools/probar_cuerpo.js PUERTO` (su sección 22).

## De dónde sale cada pieza, y con qué licencia

- Del repositorio oficial de MakeHuman (su `LICENSE.md`: código AGPL, «assets» CC0 1.0; cabecera de los
  ficheros: «explicitly released as CC0 in september 2020»): la malla base, las formas, el esqueleto y
  sus pesos, los ojos y las unidades de expresión. Comprobado el 7-11-2026 en a8bc2d54: el apartado C
  de `LICENSE.md` pone en CC0 «the base mesh and proxies», «targets and modifiers», «textures»,
  «clothes (any MHCLO-based asset)» y «poses and expressions»; llevan esa cabecera `base.obj`, los ojos
  (`high-poly.obj` y `high-poly.mhclo`) y los 678 `.target` de las tres carpetas que se leen
  (`macrodetails`, `breast` y `expression/units`); el esqueleto y sus pesos, en JSON, dicen
  `"license": "CC0"`.
- De la copia de 2017 (`makehuman-js/makehuman-data`, que aún etiquetaba lo oficial como AGPL3, la
  licencia de entonces): el pelo, las cejas, las pestañas, las pieles y la malla de las zapatillas, y
  `short04`, un peinado que no se dibuja: de él sale la máscara del cuero cabelludo (`partes.cuero`).
  **Son las piezas del paquete oficial CC0**, comprobado el 7-11-2026 con
  `makehuman_system_assets_cc0.zip` (de `files.makehumancommunity.org`, 280.737.770 bytes, sha256
  `b542127a8e25547c7c29c19f2d1d2adb9a664c80396ecd694095dbc8028a0107`). En el paquete, cada una de esas
  piezas y pieles lleva en su cabecera «explicitly released as CC0 in september 2020». Frente a lo que
  lee `piezas.py` de la copia:
  - las diez piezas (short02, short04, bob02, long01, afro01, ponytail01, braid01, eyebrow010,
    eyelashes02 y shoes05) tienen los mismos vértices, las mismas caras, las mismas UV y el mismo
    ajuste a la malla base (referencias, pesos y desplazamientos). Solo cambia la manera de
    escribirlo, en eyelashes02: el paquete da sus UV con un decimal más (5·10⁻⁶ como mucho), y la
    copia escribe de otra manera los vértices que siguen a uno solo de la malla base (los otros dos,
    con peso 0);
  - las texturas de las cejas y de las pestañas son, píxel a píxel, las del paquete; las demás y las
    cuatro pieles son las del paquete reducidas a 512 px (de 2048, y de 1024 las zapatillas): reducidas
    con el Lanczos de Pillow, coinciden salvo entre el 0,002 % y el 0,03 % de los valores.

  Los datos de hoy ya son, por tanto, los del paquete oficial: no hace falta otro lector ni volver a
  construir.
- Propio: el motor, la postura, la ropa (cortada en el móvil de la malla del cuerpo), el dibujo de las
  zapatillas, el mapa de músculos, los gestos montados con las unidades de expresión, el audífono y
  la prótesis (mallas que el motor genera con los hitos de cada variante).
- Lo que dicen las páginas de MakeHuman (abiertas el 6-11-2026): el cambio de licencia de 2020,
  «AFTER: Assets are per default released as CC0»; «AFTER: Targets, proxies and the base mesh are
  considered graphical assets, covered by CC0»; y sobre el uso comercial, «You can copy, modify,
  distribute and perform the work, even for commercial purposes, all without asking permission».
  Esto no es una opinión jurídica: es una lectura de las licencias.

## El formato de un `.bin`

«TG3D» (4 bytes), la longitud de la cabecera (uint32 LE), la cabecera JSON
(`{"v":1,"f":"cuerpo","sec":[["cuerpo.tri", desplazamiento, bytes], …]}`, rellenada con espacios
hasta un múltiplo de 4) y las secciones, cada una alineada a 4 bytes. Las secciones son las mismas
tiras que llevaba `datos3d.js` en base64: `<malla>.tri` (uint16 o uint32), `<malla>.uv` (uint16,
0…65535), `<malla>.sold` (uint16, el vértice soldado de cada uno), `<malla>.pos` (uint16 ×3 por
vértice, con la caja `q = [paso, ox, oy, oz]` del índice), `gestos.<malla>.<gesto>.i` (uint16) y
`.d` (int16 ×3), `partes.<parte>` (uint8 por vértice soldado). Unidades: decímetros; Y hacia arriba;
la cara mira a +Z; la izquierda del personaje es +X.
