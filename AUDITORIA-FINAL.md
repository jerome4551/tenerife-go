# Auditoría completa

**15 de agosto de 2026**, commit `12c3d62`.

```
index.html   md5 7fd20fdac7693e584e260e65ccd46a85
             3.378.879 bytes
```

Todo lo de abajo está medido ejecutando la app o barriendo el fichero, no
recordado. Cada cifra sale de un script que se puede volver a lanzar.

---

## 1 · Codificación

| control | resultado |
|---|---|
| UTF-8 estricto | **válido** |
| BOM al principio | no (correcto) |
| Carácter de reemplazo `U+FFFD` | **0** |
| Patrones de mojibake (`Ã©`, `Ã±`, `â€`…) | **ninguno** |
| Secuencias `Ã` sueltas (doble codificación) | **0** |
| Caracteres de control | **ninguno** |
| Finales de línea | solo LF, sin CRLF |
| Espacios invisibles | 2 NBSP, deliberados |

**Chino, variante por variante.** 1.649 cadenas en simplificado y 1.642 en
tradicional, comprobadas contra listas de caracteres que solo existen en una de
las dos:

```
zh  con caracteres SOLO tradicionales : 0
zht con caracteres SOLO simplificados : 0
```

## 2 · Los 8 idiomas

Las tres tablas de textos, clave por clave:

| tabla | claves | comprobaciones | faltan | vacías |
|---|---|---|---|---|
| `LANGS` | 148 | 1.184 | **0** | **0** |
| `UI_TX` | 53 | 424 | **0** | **0** |
| `SEA_TX` | 24 | 192 | **0** | **0** |
| | **225** | **1.800** | **0** | **0** |

Y los **765 lugares**, descripción y categoría en los 8:

```
descripciones sin idioma : 0
categorías sin idioma    : 0
cadenas vacías           : 0
                           12.240 comprobaciones
descripción idéntica al español en 4+ idiomas : 0
```

Renderizado de verdad, no solo presencia. Ficha de playa abierta en los ocho:
2 badges, 6 banderas, enlace al visor y entre 984 y 1.522 caracteres de texto
en cada idioma. Cero errores de consola en los ocho.

## 3 · Seguridad

| control | resultado |
|---|---|
| `eval(` | **0** |
| `new Function(` | **0** |
| `document.write(` | **0** |
| Asignaciones a `outerHTML` | **0** |
| `console.log` | **0** |
| URLs `javascript:` | 3, **las tres en comentarios** de la función que las bloquea |
| `service_role` | 1, **un comentario** que avisa de no pegarla nunca |
| Claves privadas PEM · `VAPID_PRIVATE` · `SUPABASE_SERVICE` | **0** |
| JWT incrustado | rol `anon`, **pública por diseño** (decodificado, no supuesto) |

**Manejadores `onclick` inline con interpolación: 13.** Es la vía por la que el
escapado no protege, porque el parser decodifica las entidades antes de
compilar el JS. Comprobado que no son explotables: dos ya usan `escapeAttr`, y
el resto interpola ids de lugar o índices numéricos. **Los 765 ids cumplen
`[a-z0-9-]`**, así que no pueden cerrar la comilla.

**Regresión de XSS**, sembrando `<img src=x onerror=…>` en souvenirs,
excursiones, anuncios y favoritos, y `https://x'-(payload)-'` como contacto:

```
PWNED  : false
PWNED2 : false
elementos <img> inyectados : 0
favoritos : el payload se rechaza, 'las-vistas' se conserva
```

Esa última línea importa: la validación es **por entrada**, no por array. Un
favorito corrupto no tira los buenos.

**Un fallo encontrado y corregido.** Dos sitios pintaban `${place.name}` sin
escapar —`catalog-item-name` y `myroute-item-name`—. No era explotable: ninguno
de los 765 nombres lleva `<` ni comillas, comprobado uno a uno. Pero cinco
llevan `&` («Surf & Kite») y ahí ya salía HTML malformado. Corregido en
`f5d35b5`. Es lo único que la auditoría encontró que hubiera que tocar.

## 4 · Integridad de datos

| | |
|---|---|
| Lugares | **765** · 0 duplicados · 0 sin nombre |
| Coordenadas | 0 sin coordenada · **0 fuera de Tenerife** |
| Colores | 0 no hexadecimales |
| Guaguas | **177 líneas · 711 paradas** · 0 paradas fuera de rango |
| Ids de línea duplicados | 0 |
| Líneas con campo vacío | 0 |

## 5 · Panel de baño

| | |
|---|---|
| En la tabla de orientación | 34 |
| Excluidas por `noBano` | 1 — Los Patos, con el acceso vallado |
| Puntúan por ángulo | 22 |
| Escritas a mano | 12 |
| Fichas con socorrista | 24 · **11 con horario** |

## 6 · Sintaxis y ficheros

```
index.html   36 etiquetas <script>: 3 externas, 1 ld+json (JSON válido)
             y 32 de JavaScript en línea, 32/32 correctas
             termina en </html>
sw.js        correcto
enviar-notificacion.js   correcto
notificacion-diaria.yml  correcto
repo         38 ficheros
```

---

# Lo que queda

## Esperando respuesta de fuera

**Horario de socorristas en 13 playas.** Pedido a la empresa que las lleva;
esperando su respuesta. Hay 24 fichas con servicio y 11 con horario —Arona ×2,
Adeje ×6, La Laguna ×3—. Faltan:

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

El mecanismo está montado y probado. Cada playa entra en una línea:

```
Las Teresitas = 15/06 a 15/09 · 10:00-19:00 · todos los días
```

Mientras tanto esas trece llevan la etiqueta neutra y el enlace al visor: no
afirman nada que no se sepa.

## Necesita coordenadas

**Aplicadas el 14 de agosto: 9 entradas, 8 paradas.** Las siete cerradas —Los
Alisios (935 y 936), Altos del Sauzal (054), Los Menceyes (201), La Rúa y El Rayo
(204), Cruz de los Álamos (271) y Santa Catalina (021)— y Las Carboneras (275),
que venía con dos candidatas y se resolvió por el pueblo. Los Alisios cuenta dos
veces porque sirve a dos líneas. De paso, el nombre oficial de la 054 es «Altos
del Sauzal», no «Altos de El Sauzal».

**Aplicadas el 15 de agosto: las 17 del GTFS oficial de TITSA** (`Google_transit.zip`,
13-ago-2026). Nueve eran las de arriba, repuestas con la coordenada de la marquesina
según `stops.txt`: El Rayo se movió 88 m, Los Menceyes 66 m y Santa Catalina 15 m.
Ocho eran nuevas: Cuesta Piedra (901), Camino del Hierro y Tío Pino (915), El Calvario
(023), Benijos y Carretera Palo Blanco (347), El Bailadero (947) y Añaza (974).

**Quedan 2 paradas con dos candidatas cada una.** Del lote de tres, solo llegó la
de Las Carboneras. Las otras dos siguen sin enviar.

**13 paradas intermedias de guagua.** En `BLOQUE-2.md`, marcadas con `___`, cada
una con el tramo en el que tiene que caer. Son 14 filas pero 13 paradas: *La
Camella* sale en la 421 y en la 480. Las cuatro que el GTFS cerró —Benijos, Palo
Blanco, Camino del Hierro y Tío Pino— ya están marcadas ahí como aplicadas.

Ya solo afectan al buscador, no al mapa: desde el trazado por tramos, todo salto
de más de 6 km se dibuja discontinuo. Las cuatro que más cambiarían:

```
417  Costa Adeje → Guía de Isora     13,3 km
421  Valle San Lorenzo → Galletas     9,2 km
474  Granadilla → Vilaflor → Arona    7,9 km
482  Vilaflor → La Escalona → Arona   6,5 km
```

Formato: `Adeje casco = 28.xxxxxx, -16.xxxxxx`. Cada una se mide contra su tramo
antes de aplicarla.

## Abierto, sin bloquear

**Alcalá y el empate del alisio.** Con viento del NE quedan 18 playas empatadas
en 120 de 33 candidatas. Desempata el oleaje real por playa, que es dato medido,
pero con la salvedad conocida: a Teresitas y Las Vistas les perjudica porque el
modelo de oleaje no conoce sus diques.

**Teresitas se queda en 100 y es correcto.** Su dique no abriga del viento —con
alisio ahí sopla como en toda esa costa—, mata la ola. Y esta puntuación mide
solo abrigo del viento. Donde se pierde de verdad es en el filtro del mar, que
tampoco conoce el dique; subirle el score sería arreglar el síntoma en el sitio
equivocado.

**Coordenadas que no apuntan a ninguna marquesina.** Es lo que hay debajo de los
rótulos repetidos, y lo grave es cómo salieron: por casualidad, al insertar una
parada al lado. Corregidas «Añaza» (935 y 936) y «El Bailadero» (077). Siguen
sobre el punto inventado 28,42345 / -16,30712 —a 992 m de la marquesina 1770 y a
353 m de Los Alisios— estas cinco:

```
934-anaza · 941-anaza · 018-anaza · 934N-anaza · 142-anaza
```

Y quedan seis rótulos más con la coordenada partida, sin comprobar contra
`stops.txt`. Ordenados por separación, que es lo que mide cuánto puede doler:

```
Las Mercedes           2.060 m   271, 274, 077  vs  270
Torviscas Alta         1.754 m   473            vs  424
El Sauzal · Centro     1.031 m   101, 011, 012  vs  054
San Juan de la Rambla    471 m   325            vs  364
Los Cristianos           240 m   343, 342       vs  711
Ofra                       2 m   908, 915, 971  vs  905   (redondeo, inofensivo)
```

El de la 054 es doblemente sospechoso: además de la coordenada partida, «El
Sauzal · Centro» no aparece en el recorrido oficial de esa línea.

**Siete desajustes entre el título de una línea y su recorrido en el GTFS.**
Salieron al cotejar las 17 paradas y ninguno se ha tocado: son decisiones, no
erratas.

```
911  el título dice «Cuesta Piedra», pero esa parada la sirven la 901, 904,
     906, 919, 971 y 972 — la 911 no
902  el título dice «Plaza del Príncipe»; la parada la sirven otras nueve
920  la parada que da a Plaza de España se llama CABILDO en su recorrido
206  el título dice «Plaza del Cristo»; la parada existe, la línea no la sirve
054  lleva «El Sauzal · Centro» y la 204 lleva «La Trinidad» y «Plaza del
     Cristo»: ninguna aparece en el recorrido oficial de su línea
217/219  «El Cardonal» es topónimo del título, no parada: la 219 tiene 45
     paradas y ninguna se llama así
971  rotula «Barrio Salud» y las otras tres «Barrio de la Salud»: el buscador
     lo parte en dos entradas
```

---

# Trampas, por si alguien vuelve a tocar esto

1. **Una norma publicada no es una norma vigente.** El Decreto 116/2018 fue
   **anulado** por sentencia del Tribunal Supremo de 27/9/2023 (BOC 82,
   25/4/2024). Seguía colgado en las webs oficiales y se usó como fuente para la
   leyenda de banderas: el resultado decía que la amarilla significaba «playa
   clasificada peligrosa» cuando significa «báñate con precaución».
2. **`scorePlaya` no recibe la entrada de `PLAYAS_ORIENTACION`.** El objeto se
   copia campo a campo **dos veces**, en `renderBanoHoy` y en `fetchPlayasHoy`.
   Un criterio que no se propague **deja de ejecutarse sin que nada falle**. Ya
   pasó con `deducida` y con `lifeguard`.
3. **El abanico de rayos mira a 4, 6 y 8 km**, así que es ciego por construcción
   a lo que abriga en el primer kilómetro: diques, muelles y salientes. Por eso
   hay 12 entradas escritas a mano.
4. **Playa Jardín tiene DOS fichas**: `playa-jardin` y `surf-playa-jardin`.
5. **`lifeguard` tiene tres estados.** `false` **afirma** que no hay socorrista
   y pinta un aviso; ausente o `null` no afirma nada. Sin dato firme, el neutro.
6. **El caché de 30 min** del panel de baño hace que una prueba mienta si no se
   limpia `tgo_bano_cache_v2` entre escenarios.
7. **Open-Meteo devuelve la hora ya en zona canaria y sin sufijo.**
8. **Contar cadenas en un fichero de 3 MB es mal método.** Varias comprobaciones
   fallaron por contar la palabra dentro del comentario que la explica, o por
   suponer el número en vez de medirlo.
9. **Un comentario que describe lo que el código ya no hace es peor que no
   tenerlo.** Dos afirmaciones falsas sobrevivieron días en los comentarios de
   `scorePlaya`, y una de ellas justificaba mantener un bug.
10. **Un nombre de sitio no es un dato hasta que tiene coordenada y esa
    coordenada cae donde debe.** De cuatro playas apuntadas como «faltan», una
    era de Fuerteventura y otra no existía.
11. **`index.html` suelto no es la app.** Leaflet vive en `vendor/` desde el 31
    de julio. Para verla funcionando, la app publicada. Para dársela a Claude, el
    fichero vale: lo lee, no lo ejecuta.
12. **No dejar arreglos de circunstancia.** Se metieron tres cambios en el
    contador de la portada persiguiendo un «0 lugares» que era un visor sin
    JavaScript. Se revirtieron.
13. **Los ids de lugar son la barrera de los `onclick` inline.** Los 13
    manejadores inline con interpolación solo son seguros porque los 765 ids
    cumplen `[a-z0-9-]`. Si algún día un id lleva una comilla, ahí hay un XSS.
14. **«Distancia al trazado» no sirve para validar una parada nueva.** El trazado
    son rectas entre las paradas que ya hay, no la carretera. Dio por sospechosas
    siete paradas correctas —Altos del Sauzal a 2.151 m, El Rayo a 1.735 m— y
    habría elegido mal en Las Carboneras. Lo que decide es el nombre de la línea,
    que dice a qué pueblos va, y lo que ya haya en nuestras propias fichas.
15. **El ancla de un `str_replace` no dice dónde va la parada, solo dónde cabe.**
    En la 347 y la 915 —líneas de dos paradas— la única cadena única disponible
    era el terminal del otro extremo, y ahí acabaron Palo Blanco y Tío Pino,
    detrás del final del recorrido. Falla la prueba visual que el propio parche
    escribía como criterio. Lo que manda es el título de la línea y el «entre
    las dos» de `BLOQUE-2.md`.
16. **Un rótulo repetido con dos coordenadas casi nunca es un problema de
    rótulos.** Parecía que había que desambiguar «Añaza» y «El Bailadero». No:
    la coordenada vieja no era ninguna marquesina, era un punto inventado. Se
    corrige la vieja y el duplicado desaparece solo. Los dos se encontraron por
    casualidad, al insertar una parada al lado.
17. **La regla de colapso tiene que ser el `stop_id` del GTFS, no el rótulo.**
    Y solo funciona si cada parada del fichero apunta a una marquesina real.
    Hoy no es así: hay al menos cinco entradas de «Añaza» sobre un punto que no
    existe.
