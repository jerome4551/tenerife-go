# BELBUL — Tenerife Living

PWA de la inmobiliaria Belbul: propiedades, marco legal canario vigente y
una calculadora del coste real de compra. Cuatro idiomas (español, inglés,
francés y búlgaro) y funciona sin conexión una vez cargada.

Mismo planteamiento que `tenerife-go`: un solo `index.html` con el HTML, el
CSS, el JavaScript y los datos dentro. No hay build ni dependencias.

### Probarlo en local

```
python3 -m http.server 8802
```

Y abrir `http://localhost:8802/index.html`. Hace falta un servidor: el
service worker y el manifiesto necesitan un origen `http://`.

---

## Qué hay aquí

| Fichero | Qué es |
|---|---|
| `index.html` | La aplicación entera. 140 KB. |
| `sw.js` | Service worker: caché offline. |
| `manifest.webmanifest` | Manifiesto PWA, con dos accesos directos (`#calc`, `#comprar`). |
| `fonts/` | Cinzel, Playfair Display y Jost en woff2, servidas desde aquí. |
| `logo.jpg`, `mark.jpg` | El logotipo y la marca cuadrada. |
| `icon-*.png`, `apple-touch-icon.png` | Iconos de instalación, recortados del logotipo. |
| `splash-*.png` | Pantallas de arranque de iOS, 11 tamaños. |

---

## Las tarifas fiscales viven en un solo sitio

En `index.html`, el objeto `FISCAL`:

```js
var FISCAL={
  igic:{general:.07, vpo:0},
  ajd:.0075,
  itp:{general:.065, habitual:.05, superreducido:.01, vpo:0},
  bonifJoven:.20,
  limite:200000,
  renta:46455,
  gestoria:350
};
```

La tabla del «Régimen Fiscal Canario» de la pestaña Legal **se rellena
desde ahí** al arrancar (`pintarTarifas()`), y la calculadora lee lo mismo.
Antes cada una llevaba sus propios números y se habían separado: la
calculadora aplicaba un «ITP VPO 5,5 %» que no aparecía en la tabla ni
existe en el régimen canario.

**Para actualizar un tipo impositivo se toca `FISCAL` y nada más.** Los
textos que citan cifras concretas —las fichas de propiedad, la nota al pie
de la tabla— siguen siendo texto y hay que repasarlos a mano.

### Ojo: el 4 % de los jóvenes no es un tipo

No existe un tipo del 4 %. Lo que hay es el tipo reducido del **5 %** de
vivienda habitual más una **bonificación del 20 % en cuota**. Sale lo
mismo, pero son dos beneficios con requisitos distintos, y la calculadora
los desglosa por separado porque así es como aparece en la liquidación.

La Ley 9/2025 amplió esa bonificación de menores de 35 a **hasta 40 años**,
y el límite de renta de 24.000 a **46.455 €**.

Por encima de los 200.000 € la app **no** aplica la bonificación. El texto
de la ley no le pone tope de precio explícito, pero tampoco lo descarta;
ante la duda se prefiere quedarse corto en la ventaja antes que prometer
un ahorro que Hacienda luego no reconozca. Si se confirma que sí aplica,
basta con quitar la condición `p<=FISCAL.limite` de la línea del `bonif`.

### Estado de los datos legales · agosto 2026

Verificado contra el contenido de la Ley 9/2025 (Presupuestos Generales de
Canarias para 2026, de 23 de diciembre, BOC de 29/12/2025) y la Ley 6/2025
de Ordenación Sostenible del Uso Turístico de Viviendas (BOC 12/12/2025,
en vigor el 13/12/2025).

Tipos reducidos del ITP con efectos desde el 1/1/2026:

| Supuesto | Tipo | Límites de renta |
|---|---|---|
| General | 6,5 % | — |
| Vivienda habitual ≤ 200.000 € | 5 % | — |
| Hasta 40 años, 1ª vivienda | 5 % − 20 % = 4 % | 46.455 € (+6.825 €/persona) |
| Familia numerosa | 1 % | 46.455 € (+18.200 €/hijo adicional) |
| Familia monoparental | 1 % | 46.455 € (+6.825 €/persona) |
| Discapacidad ≥ 65 % | 1 % | 46.455 € (+6.825 €/persona) |
| VPO, 1ª adquisición | 0 % | — |

Pendiente de confirmar con un gestor colegiado:

- **AJD de obra nueva.** La app aplica el 0,75 % general. Varias fuentes
  sostienen que las escrituras que documentan operaciones sujetas a IGIC
  tributan al 1 %. La Ley 9/2025 no tocó el AJD, así que la duda es sobre
  el Decreto Legislativo 1/2009 y no se pudo resolver contra el texto
  consolidado. Se deja el 0,75 %; si es 1 %, se cambia `FISCAL.ajd`.
- **AJD reducido del 0,4 %** para vivienda habitual de jóvenes y familia
  numerosa: existe, pero las fuentes discrepan en el umbral de precio. No
  está implementado, así que la calculadora sobreestima el AJD de la obra
  nueva en esos perfiles.
- **IGIC de VPO.** Tipo cero en la primera entrega del promotor. Hay un
  tipo reducido del 3 % en otros supuestos que la app no distingue.
- **Requisitos de renta.** La calculadora no los puede comprobar: pide un
  precio y un perfil, no la declaración. Por eso el resultado muestra un
  aviso con las cifras concretas cada vez que aplica un tipo reducido.

El **IRAV** (`al_irav`, `a1_renta`) es un dato mensual: el INE lo publica
hacia el día 15. Hay que repasarlo cada mes o dejará de ser cierto.

---

## Offline

`sw.js` precachea 499 KB: la app, el logotipo, los iconos y las fuentes en
su versión **latina**, que es la que usan español, inglés y francés. El
cirílico del búlgaro y el `latin-ext` se guardan la primera vez que hacen
falta, para no cargarle 600 KB de tipografía a quien no los va a usar.

`index.html` va **primero a la red** y cae a la copia guardada si no hay
conexión: así un cambio en los tipos impositivos llega en la siguiente
carga y no en la siguiente semana. Todo lo demás va primero a la caché.

Al tocar `index.html` hay que **subir la versión** de `CACHE` en `sw.js`.
El manejador de `activate` borra toda caché que no se llame así; es lo
único que hace llegar la versión nueva a quien ya tenga la app instalada.

No se cachea nada de fuera porque no se pide nada de fuera: las fuentes
venían del CDN de Google y por eso la app no arrancaba bien sin conexión.

---

## Cosas que conviene saber

- Los importes se formatean con el locale del idioma activo
  (`LMETA[LANG].loc`), no siempre con `es-ES`.
- El idioma y los favoritos se guardan en `localStorage` bajo el prefijo
  `belbul.`. En la primera visita se parte del idioma del navegador.
- La hoja inferior es un `role="dialog"`: se cierra con Esc, con el botón
  atrás de Android y devolviendo el foco a quien la abrió.
- Las claves `brand_sub`, `brand_tag` y `w_bonif` del diccionario ya no las
  usa nadie. Se dejan por si vuelven a hacer falta.
- Los datos de contacto (`+34 600 123 456`, `hola@belbulrealestate.com`) y
  las cinco propiedades son de demostración.
