# Auditoría completa

Estado de la app tras la sesión. Todo lo de abajo está medido, no recordado:
cada cifra sale de un script que se puede volver a lanzar.

---

## 1. Verificación

| control | resultado |
|---|---|
| Lugares del mapa | **760** · 0 vacíos · 0 duplicados · 43 parkings |
| Guaguas · integridad | **177 líneas · 694 paradas · 0 fallos** |
| Guaguas · cobertura oficial | **173 de 173 · 100 %** |
| Guaguas · campos vacíos | 0 sin precio · 0 sin tiempo · 0 sin ventana |
| Panel de guaguas | 177 items · 0 errores |
| Simulación de rutas | 17 rutas × 4 horas · 653/760 lugares con guagua |
| Regresión de XSS | limpia (`PWNED:false`, `PWNED2:false`) |
| Errores de consola | **0** en todas las pruebas |
| Sintaxis | `sw.js`, los dos `enviar-*.js` y los dos YAML, correctos |
| Git | árbol limpio · 0 sin subir · 29 commits en la sesión |

## 2. Los 8 idiomas

Barrido completo de las tablas, clave por clave:

| tabla | claves | sin traducir |
|---|---|---|
| LANGS | 140 | **0** |
| UI_TX | 53 | **0** |
| SEA_TX | 24 | **0** |
| | **217 × 8 = 1.736** | **0** |

Y de los **760 lugares**, en los 8 idiomas:

```
descripciones sin idioma : 0      (760 × 8 = 6.080 comprobaciones)
categorías sin idioma    : 0      (otras 6.080)
```

Además, renderizado de verdad en pantalla en los 8:

- Panel del mar: título, subtítulo, chips de nivel y «costa más tranquila»
- Ficha de playa: olas, agua, viento, UV, marea, mar de fondo y piscinas
- Panel de baño: cabecera y el mensaje de «hoy ninguna»
- Socorristas: los dos estados, activo y con horario
- Eclipse: título, subtítulo y el aviso de seguridad
- Notificaciones push: los dos mensajes, uno por idioma

## 3. Comportamiento, no solo presencia

Lo que se comprobó que **hace lo correcto**, no solo que pinta:

| | |
|---|---|
| Mar sin dato en una costa | la costa desaparece, no sale «Tranquilo» |
| Las 7 costas sin dato | mensaje de «el modelo no da lectura», no «sin conexión» |
| Mar de fondo sutil (0,9 m / 14 s) | sale **Fuerte**, no Moderado |
| Temporal en toda la isla | el panel de baño no recomienda ninguna |
| Playa Jardín con el norte en calma | **sí se recomienda** |
| Playa Jardín con viento del NW | no se recomienda: le entra de cara |
| Socorristas, 9 ramas | ninguna afirma socorrista cuando no lo sabe |
| Dato de socorristas caducado | vuelve a la etiqueta neutra |
| Mareas | pleamar detectada a 1 minuto de la analítica |
| Eclipse el 13 de agosto | desaparece solo |
| Push del eclipse | 8 textos distintos, tag propio, TTL correctos |

---

# Lo que queda para cerrar

## A · Necesita datos de fuera

**A1. Horario de socorristas en 13 playas.**
Hay 21 playas con servicio y **8 con horario real** (Arona y Adeje). Las otras
13 las lleva otra empresa y no hay dato firme:

```
Santa Cruz      Teresitas · Benijo · Almáciga
Granadilla      El Médano · La Tejita
Guía de Isora   San Juan · Abama
Santiago Teide  La Arena · Puerto Santiago
La Orotava      El Bollullo
Los Realejos    El Socorro
Puerto Cruz     Playa Jardín
Icod            San Marcos
```

El mecanismo está montado y probado. Cada playa entra en una línea:

```
Nombre = 15/06 a 15/09 · 10:00-19:00 · todos los días
```

Sin ese dato **no pasa nada malo**: esas 13 siguen con la etiqueta neutra y el
enlace al visor oficial, que no miente.

**A2 — corregido: La Jaquita no era una duda de municipio. RESUELTO.**
Lo planteé mal aquí. No había que elegir entre dos municipios: la coordenada
siempre fue buena y lo que estaba mal era **la ficha entera**. `playa-jaquita`
llevaba la descripción de **La Tejita**, a 33,5 km, en los ocho idiomas —
«junto a El Médano», «Montaña Roja», «kitesurfistas»—, más la categoría
«Playa Kitesurf · El Médano», los tags de kitesurf y hasta el emoji de surfista.
Una colisión de nombres Jaquita/Tejita.

Lo que lo demuestra está dentro de la propia app: el POI hermano
`piscinas-alcala-jaquita`, a **219 m**, ya decía «junto a la Playa La Jaquita
(arena negra)» y «municipio de Guía de Isora». Reescrita con esos hechos, sin
inventar nada.

Y la contradicción de socorristas era real: la playa llevaba `lifeguard:false`,
que **no calla, afirma** — pinta «⚠️ Sin socorrista» —, mientras los charcos de
al lado dicen «socorrista en temporada alta». Mismo sitio, dos respuestas. Se
quitó el campo: sin dato firme, el estado correcto es el neutro, igual que las
13 playas de A1.

**A2c. La lista de «cuatro playas que faltan» era mala, y era mía.** De las
cuatro que apunté aquí, dos no debían estar:

```
El Chinchorro   ✘  no existe en Tenerife: la Playa del Chinchorro esta en
                   Fuerteventura, La Oliva / Parque Holandes
Playa Grande    ✘  sin rastro. Aparece en UN solo sitio de todo el repo:
                   esta lista. Sin fuente. Y el "(Los Abrigos)" que le puse
                   tambien era mio: situe Los Abrigos 5 km de donde esta
                   -28,0281/-16,5924-, donde ya tenemos cuatro fichas
Valleseco       ~  existe y esta bien situada, pero las resenas dicen que es
                   roca y pantalanes junto a la Darsena Pesquera, no arena.
                   Meterla como "playa" sin matizar engaña
Leocadio M.     ~  el nombre designa en algunos registros la playa del
                   pueblo, que YA esta: el pin del pueblo cae a 3 m de
                   nuestro `el-medano`. El otro pin es el tramo sur hacia
                   Montaña Roja, a 980 m, y ese si es un sitio distinto
```

La leccion no es que faltaran cuatro playas: es que **apunte una lista de
nombres sin comprobar que existieran ni donde caian**, que es exactamente lo
que este fichero lleva toda la sesion diciendo que no se hace. Un nombre de
playa no es un dato hasta que tiene coordenada y la coordenada cae donde debe.

Sobre Leocadio Machado hay ademas un aviso: una reseña la da cerrada el 7 de
julio de 2026 por contaminacion fecal. Eso **no se escribe en la ficha** —es el
mismo patron de Playa Jardin, y ya esta decidido en C1: hecho estructural en el
texto y el estado del agua al visor oficial, que es dato vivo.

**A2b. Ifonche decía Güímar y es Vilaflor.** Al barrer los 760 lugares buscando
más fichas cruzadas apareció una: el despegue de parapente de Ifonche se
situaba «entre Adeje y Güímar». Medido: Adeje **4,1 km**, Vilaflor **6,2 km**,
Güímar **33,9 km**. Todo lo demás de esa ficha encajaba (Taucho 4,4 · Barranco
del Infierno 3,1 · La Caleta 7,1), así que era una palabra. Corregida en los 8
idiomas y en el tag. El barrido no encontró ninguna más: las otras 13
candidatas nombran sitios lejanos con razón (rutas que los recorren,
comparaciones, la Autoridad Portuaria).

**A3. 17 paradas intermedias de guagua** (las que venían del grupo B). Son 18
filas en la lista pero **17 paradas distintas**: *La Camella* sale dos veces,
en la 418 y en la 480. La lista, con el tramo de cada una, está en
`BLOQUE-2.md`.

Esto **ya solo afecta al planificador**, no al mapa. Antes el trazado unía las
paradas con una recta y afirmaba un recorrido que la guagua no hace; desde el
trazado por tramos, todo salto de más de 6 km se dibuja discontinuo, que es
decir «aquí hay conexión, pero este no es el camino». Son 133 de 517 tramos,
en 85 líneas. Cuando alguna de estas 17 entre, su tramo pasará a continuo
solo: la regla se mide en cada dibujado, no está escrita a mano en ningún
sitio.

Lo que sigue faltando sin ellas: quien vive a mitad de recorrido no encuentra
esa línea al buscar.

**A4 — hecho a medias: la puntuación ya es angular; lo que falta es el dato
local.** De las 34 del panel de baño, **28 puntúan por ángulo** entre su `ori`
y la dirección del viento, y 6 siguen escritas a mano.

Antes se comparaba por la **primera letra** (`card.includes(b[0])`), así que
`'SW'` colaba en `'S'` y en `'SE'`, y `NW`/`N`/`NE` colapsaban en `'N'`. Abama
y Almáciga, con la misma banda de tres sectores, se penalizaban 6/8 y 3/8 según
por qué letra empezaran. Ahora, 5/8 las dos.

**Y esto cambia lo que hay que pedir.** Comprobado vaciando el campo: en una
entrada con `deducida: true`, `badWind` **ya no lo lee nadie** — 0 de 8 vientos
cambian. En una escrita a mano cambia 3 de 8. Así que afinar el `badWind` de
una de las 28 no hace nada: para meter conocimiento local hay que **sacarla de
la rama angular** quitándole `deducida` y entonces sí escribirle su `badWind`,
como Playa Amarilla o Teresitas.

Lo que sigue faltando, entonces, no es «afinar `badWind`» sino: qué playas
merecen salirse del modelo porque un dique, un espigón o un saliente hacen algo
que la geometría no ve.

## B · Sé lo que hay que hacer y puedo hacerlo yo

**B1. Borrar el bloque del eclipse.** A partir del **13 de agosto**:
- en `index.html`, el bloque `ECLIPSE PARCIAL DE SOL` al final del fichero
- el fichero `.github/workflows/eclipse.yml` entero
- `enviar-eclipse.js`

Ninguno de los tres lo usa nada más. Mientras tanto se apagan solos.

**B2 — corregido: esto NO lo puedo hacer yo.** Lo clasifiqué mal aquí y lo
comprobé al ir a empezarlo. De las 19 paradas de `BLOQUE-2.md` medí cuántas
tienen algo en nuestros 760 lugares con que fijarlas:

```
Benijo        ✔  el sendero PR-TF 6.3 sale de ahi   -> APLICADA
Adeje casco   ✘  "positivo" falso: Golf Costa Adeje esta en la costa, a 5 km
las otras 17  ✘  nada nuestro con ese nombre en su tramo
```

Así que era **1 de 19**, y esa ya está puesta. Las **18 filas restantes — 17
paradas distintas, porque La Camella sale en la 418 y en la 480 — pasan al
grupo A**: necesitan coordenada de fuera. Siguen sin bloquear nada: las 173
líneas funcionan igual.

## C · Decidido que NO se hace

**C1. Clasificación sanitaria oficial como dato fijo.** Playa Jardín demostró
por qué: catorce meses diciendo «baño prohibido» cuando estaba abierta. La vía
buena es el enlace al visor, que ya cae en la playa concreta.

**C2. Mareas en metros.** Solo horas, sentido y recorrido. La altura de
Open-Meteo va sobre el nivel medio global y no sobre el cero hidrográfico.

**C3. Escuelas de surf con nombre.** Son negocios y no puedo comprobar que
existan ni que operen ahí.

**C4. Viento NW como ideal en Playa Jardín.** Choca con nuestra propia tabla:
la playa mira al NW, así que ese viento le entra de cara.

## D · Trampas conocidas, por si alguien vuelve a tocar esto

1. **Playa Jardín tiene DOS fichas**: `playa-jardin` y `surf-playa-jardin`. Si
   vuelve a cerrar al baño, hay que tocar las dos. Se me escapó una vez.
2. **El caché de 30 min** del panel de baño hace que una prueba mienta si no se
   limpia `tgo_bano_cache_v2` entre escenarios.
3. **Open-Meteo devuelve la hora ya en zona canaria y sin sufijo.** `Date.parse`
   la toma como local y al reformatear se suma el desfase dos veces.
4. **Contar cadenas en un fichero de 3 MB es mal método.** Varias comprobaciones
   fallaron por contar la palabra dentro del propio comentario que la explica.
   Mejor contar estructuras.
5. **`push_sends` con la fecha real apagaría la notificación diaria** de ese día.
   Por eso el eclipse usa fechas centinela de 1970.
6. **Las frases que congelan un presente se pudren solas.** Playa Jardín decía
   «el último cierre terminó en junio de 2025 y **hoy está abierta**» catorce
   meses después. Un hecho fechado no caduca («inaugurado en 2010»); un estado
   presente escrito a mano, sí. Para el estado del baño está el enlace al visor
   oficial, que es dato vivo. Barridas las 760: ninguna otra playa congelaba su
   estado de baño.
7. **Un comentario que describe lo que el código ya no hace es peor que no
   tenerlo.** El de `PLAYAS_ORIENTACION` seguía explicando por qué Playa Jardín
   quedaba excluida mucho después de volver a entrar. Al tocar el código, tocar
   el comentario.
