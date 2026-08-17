# Auditoría completa

**16 de agosto de 2026**, tras reanclar la red de guaguas al GTFS oficial.

```
index.html   md5 c803068cccc15d49db15ba82aaa01be5
             3.571.267 bytes
```

Todo lo de abajo está medido ejecutando la app o barriendo el fichero, no
recordado. Cada cifra sale de un script que se puede volver a lanzar:
`tools/verificar_red.js`, `tools/extract_js.py` y el cargador con hidratación
del scratchpad.

---

## 1 · Codificación

| control | resultado |
|---|---|
| UTF-8 estricto | **válido** |
| BOM al principio | no (correcto) |
| Carácter de reemplazo `U+FFFD` | **0** |
| Patrones de mojibake (`Ã©`, `Ã±`, `â€`…) | **0 de 11 buscados** |
| Caracteres de control | **0** |
| Finales de línea | solo LF, sin CRLF |
| Espacios invisibles | 2 NBSP, deliberados |

**Chino, variante por variante.** 1.604 cadenas en cada una, comprobadas contra
listas de caracteres que solo existen en una de las dos:

```
zh  con caracteres SOLO tradicionales : 0
zht con caracteres SOLO simplificados : 0
```

## 2 · Los 8 idiomas

| tabla | claves | comprobaciones | faltan | vacías |
|---|---|---|---|---|
| `LANGS` | 148 | 1.184 | **0** | **0** |
| `UI_TX` | 53 | 424 | **0** | **0** |
| `SEA_TX` | 24 | 192 | **0** | **0** |
| | **225** | **1.800** | **0** | **0** |

Y los **765 lugares**, descripción y categoría en los 8: **12.240
comprobaciones, 0 huecos y 0 cadenas vacías**.

Renderizado de verdad, no solo presencia. Ficha de playa abierta en los ocho:
2 badges, 6 banderas y el enlace al visor en todos, con entre 994 y 1.509
caracteres de texto. Cero errores de consola en los ocho.

**El catálogo de paradas no está traducido y no debe estarlo:** son topónimos.

## 3 · Seguridad

| control | resultado |
|---|---|
| `eval(` · `new Function(` · `document.write(` | **0 · 0 · 0** |
| Asignaciones a `outerHTML` | **0** |
| `console.log` | **0** |
| URLs `javascript:` | 3, **las tres en comentarios** de la función que las bloquea |
| `service_role` | 1, **un comentario** que avisa de no pegarla nunca |
| Claves PEM · `VAPID_PRIVATE` · `SUPABASE_SERVICE` | **0 · 0 · 0** |
| JWT incrustado | rol `anon`, **pública por diseño** (decodificado, no supuesto) |

**Manejadores `onclick` inline con interpolación: 13**, los mismos de agosto. Es
la vía por la que el escapado no protege, porque el parser decodifica las
entidades antes de compilar el JS. Interpolan ids de lugar, ids de grupo e
índices numéricos; **ninguno toca datos de parada**.

**Superficie nueva: los 2.514 rótulos del catálogo se pintan en la interfaz.**
Barridos uno a uno: **ni un `<`, `>`, comilla, `&`, barra invertida ni salto de
línea**. Y las 2.514 claves cumplen `^[0-9]+$`, así que tampoco pueden cerrar
una comilla si algún día se interpolan en un manejador inline.

**Regresión de XSS**, sembrando `<img src=x onerror=…>` en souvenirs,
excursiones, anuncios y favoritos, y `https://x'-(payload)-'` como contacto:

```
PWNED  : false
PWNED2 : false
elementos <img> inyectados : 0
favoritos : el payload se rechaza, 'las-vistas' se conserva
```

## 4 · Integridad de datos

| | |
|---|---|
| Lugares | **765** · 0 duplicados · 0 sin nombre · 0 sin coordenada |
| Coordenadas de lugar | **0 fuera de Tenerife** · 0 colores no hexadecimales |
| Ids de lugar | **765 cumplen `[a-z0-9-]`** |
| Guaguas | **177 líneas · 5.150 paradas** |
| Ids de parada duplicados | **0** (342 llevan sufijo por repetición en circulares) |
| Paradas fuera de Tenerife | **0** |
| Ids de línea duplicados · líneas sin color | 0 · 0 |
| Catálogo | **2.514 marquesinas**, todas dentro del bbox, 0 referencias huérfanas |
| Líneas regeneradas · marcadas | **140 · 37** |

## 5 · Panel de baño

| | |
|---|---|
| En la tabla de orientación | 34 |
| Excluidas por `noBano` | 1 — Los Patos, con el acceso vallado |
| Puntúan por ángulo · escritas a mano | 22 · 12 |
| Fichas con socorrista | 24 · **11 con horario** |

## 6 · Rendimiento

El índice del planificador pasa de 694 paradas a 5.150. Era el riesgo que más
me preocupaba y **no se ha materializado**:

```
índice del planificador  2.185 entradas, construido en  14,1 ms
paradas más cercanas a un punto                          1,6 ms
carga completa de la app                                  6,6 s   (antes 5,8 s)
```

## 7 · Sintaxis y ficheros

```
index.html   36 etiquetas <script>: 3 externas, 1 ld+json (JSON válido)
             y 32 de JavaScript en línea, 32/32 correctas
             termina en </html>
sw.js · enviar-notificacion.js   correctos
repo         41 ficheros
```

---

# Lo que queda

## Esperando respuesta de fuera

**Horario de socorristas en 13 playas.** Pedido a la empresa que las lleva. Hay
24 fichas con servicio y 11 con horario —Arona ×2, Adeje ×6, La Laguna ×3—.
Faltan:

```
Las Teresitas · Benijo · Almáciga            (Santa Cruz)
El Médano · La Tejita                        (Granadilla)
San Juan · Abama                             (Guía de Isora)
La Arena · Puerto Santiago                   (Santiago del Teide)
El Bollullo                                  (La Orotava)
El Socorro                                   (Los Realejos)
Playa Jardín                                 (Puerto de la Cruz)
San Marcos                                   (Icod)
```

Mientras tanto esas trece llevan la etiqueta neutra y el enlace al visor: no
afirman nada que no se sepa.

**El tranvía ya no está pendiente.** Las 27 paradas de `L1` y `L2` se reanclaron
al CSV oficial de Metropolitano de Tenerife (portal de datos abiertos del
Cabildo, CC-BY). Corrigen un desvío medio de 1.949 m y máximo de 4.011 m; solo
Teatro Guimerá estaba bien, a 44 m. Comprobado después: tramos entre 387 y
864 m sin un solo salto fuera de rango, **15,05 km de sistema** frente a los
15,1 km publicados, y los dos transbordos —El Cardonal y Hospital
Universitario— con coordenada idéntica en las dos líneas.

Del mismo CSV entra el **panel en directo**: una URL por parada a
`tranviaonline.metrotenerife.com`, que es el tablero oficial con la posición
del próximo tranvía. Son 27 paradas y 25 URLs —los dos transbordos comparten
la suya—. El popup lo pinta solo si el host termina en `.metrotenerife.com`:
comprobado que rechaza `evil.com`, `javascript:` y el truco del sufijo
`metrotenerife.com.evil.com`. La etiqueta está en los 8 idiomas
(`busTranviaPanel`).

Lo que el CSV **no** trae es la secuencia: el orden sale del `parada_id` y se
ha validado por geometría y por longitud total, pero no es un dato de
recorrido publicado. Metropolitano tiene su propio GTFS en el mismo portal, y
ese sí traería `stop_times.txt`.

## Las 37 líneas sin regenerar

Cada una lleva su motivo en un comentario dentro de su propio bloque.

```
sin equivalente en el GTFS  11   123 124 131 137 213 220 222 310 339 420 474
no cubre alguna cabecera    19   055 102 106 110 232 253 260 325 358 372 412
                                 430 467 711N 904 912 920 970 975
número compartido            4   015 015N 934 934N
número igual, otra línea     1   231
tranvía, no está en el GTFS  2   L1 L2
```

De las 19 de cobertura, **9 fallan por menos de 2,5 km**. Subir el umbral de
1,5 a 2,5 km las recuperaría, pero se revisaron una a una y no se sostienen:
solo la 056 tenía respaldo en el título oficial del GTFS, y esa **ya entra**
—su recorrido incluye «Llano del Moro» con ese mismo nombre; la parada vieja
estaba a 1.790 m y la salvó el emparejamiento por nombre—. El umbral se queda
en 1,5 km.

Las cuatro de número compartido necesitan decisión manual: la nocturna de la
015 es en realidad la **714**.

## Decisiones abiertas

**267 rótulos repetidos, de 1.826 distintos.** El GTFS llama «Centro de Salud»
a ocho paradas y «Cementerio» a otras ocho, por toda la isla. En el buscador
salen como filas idénticas sin forma de distinguirlas. No es un fallo de datos
—son marquesinas reales y distintas— sino una decisión de presentación:
añadirles el municipio al lado, o dejarlo.

**55 paradas sin municipio, en 16 líneas.** `stops.txt` no trae el campo y se
deduce de la parada antigua más cercana a menos de 3 km; más lejos se deja
vacío antes que inventarlo. El popup **ya no pinta el `📍` suelto** cuando el
campo está vacío.

**6 paradas intermedias siguen sin aparecer**, de las 14 que quedaban en
`BLOQUE-2.md`. La regeneración resolvió 7 y una octava (Realejo Alto) no existe
con ese nombre en el GTFS:

```
417   Adeje casco       ese nombre no existe en el GTFS
482   Chayofa           solo hay «Chayofa Sport», a 1,2 km del recorrido
463   Los Blanquitos    existe, pero el recorrido pasa a 418 m sin parar
905   Suárez Guerra     ese nombre no existe en el GTFS
474   El Desierto · Los Blanquitos   la línea está marcada, sin regenerar
```

---

# Trampas, por si alguien vuelve a tocar esto

1. **Leer `TITSA_LINES` en crudo ya no da paradas.** Desde la reconstrucción,
   `paradas` es una lista de claves de `TITSA_PARADAS` y solo se convierte en
   objetos al hidratar. Un script que mida `p.lat` sobre el fichero sin hidratar
   **no falla: devuelve `undefined` y produce cifras falsas**. Me pasó tres
   veces en la misma sesión, una de ellas dando «0 de 14» donde eran 7.
2. **Una norma publicada no es una norma vigente.** El Decreto 116/2018 fue
   **anulado** (TS 27/9/2023, BOC 82, 25/4/2024) y se usó como fuente para la
   leyenda de banderas: decía que la amarilla significaba «playa clasificada
   peligrosa» cuando significa «báñate con precaución».
3. **`scorePlaya` no recibe la entrada de `PLAYAS_ORIENTACION`.** El objeto se
   copia campo a campo **dos veces**. Un criterio que no se propague **deja de
   ejecutarse sin que nada falle**. Ya pasó con `deducida` y con `lifeguard`.
4. **El abanico de rayos mira a 4, 6 y 8 km**, así que es ciego a lo que abriga
   en el primer kilómetro. Por eso hay 12 entradas escritas a mano.
5. **Playa Jardín tiene DOS fichas**: `playa-jardin` y `surf-playa-jardin`.
6. **`lifeguard` tiene tres estados.** `false` **afirma** que no hay socorrista
   y pinta un aviso; ausente o `null` no afirma nada.
7. **El caché de 30 min** del panel de baño hace que una prueba mienta si no se
   limpia `tgo_bano_cache_v2` entre escenarios.
8. **Open-Meteo devuelve la hora ya en zona canaria y sin sufijo.**
9. **Contar cadenas en un fichero de 3,5 MB es mal método.** Varias
   comprobaciones fallaron por contar la palabra dentro del comentario que la
   explica, o por suponer el número en vez de medirlo.
10. **Un comentario que describe lo que el código ya no hace es peor que no
    tenerlo — y borrarlo sin comprobarlo es igual de malo.** Se quitaron 9
    comentarios «Falta X» dándolos por obsoletos tras la regeneración; **4
    seguían siendo ciertos** y hubo que reponerlos. Se comprueba parada por
    parada contra la red hidratada, no por el número de la línea.
11. **Un nombre de sitio no es un dato hasta que tiene coordenada y esa
    coordenada cae donde debe.**
12. **`index.html` suelto no es la app.** Leaflet vive en `vendor/` desde el 31
    de julio.
13. **No dejar arreglos de circunstancia.** Se metieron tres cambios en el
    contador de la portada persiguiendo un «0 lugares» que era un visor sin
    JavaScript. Se revirtieron.
14. **Los ids de lugar son la barrera de los `onclick` inline.** Los 13
    manejadores inline solo son seguros porque los 765 ids cumplen `[a-z0-9-]`.
15. **«Distancia al trazado» no sirve para validar una parada nueva.** El
    trazado son rectas entre las paradas que ya hay, no la carretera.
16. **Un rótulo repetido con dos coordenadas casi nunca es un problema de
    rótulos.** Con «Añaza» y «El Bailadero» la coordenada vieja no era ninguna
    marquesina, era un punto inventado.
17. **La regla de colapso es el `stop_id` del GTFS, no el rótulo.** Y el
    `stopId` va **sin sufijo** aunque el `id` lo lleve: es el que agrupa en el
    buscador y el que usa el filtro de aeropuerto.
18. **El filtro de aeropuerto está en cuatro sitios, en dos funciones.**
    `activateAirportLines` es el que enciende las líneas; si solo se arregla
    `updateAirportQuickButtons`, los botones se pintan bien y no hacen nada.
19. **Promediar la coordenada de un grupo la saca de la marquesina.** Agrupar
    un par ida/vuelta y guardar el punto medio movió 683 claves hasta 40 m y
    rompió el umbral de 80 m en «El Calvario». Se guarda la del `stop_id` líder.
20. **El trip canónico no es el que más paradas tiene.** Un refuerzo escolar
    puede tener más que el recorrido completo: la 103 acabó sin llegar a Santa
    Cruz. Se elige por cobertura de lo que la línea declara.
