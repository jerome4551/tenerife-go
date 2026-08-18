# Auditoría completa

**18 de agosto de 2026**, auditoría profunda de seguridad, codificación,
idiomas, datos y cobertura de guagua y tranvía.

```
index.html   md5 79acf33029ced2f3bca44fd1fe338757
             4.048.789 bytes  ·  1.238.801 comprimidos
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
| Guaguas | **178 líneas · 5.189 paradas** |
| Ids de parada duplicados | **0** (342 llevan sufijo por repetición en circulares) |
| Paradas fuera de Tenerife | **0** |
| Ids de línea duplicados · líneas sin color | 0 · 0 |
| Catálogo | **2.514 marquesinas**, todas dentro del bbox, 0 referencias huérfanas |
| Líneas regeneradas · marcadas | **141 · 35** (más 2 de tranvía) |

## 5 · Panel de baño

| | |
|---|---|
| En la tabla de orientación | 34 |
| Excluidas por `noBano` | 1 — Los Patos, con el acceso vallado |
| Puntúan por ángulo · escritas a mano | 22 · 12 |
| Fichas con socorrista | 24 · **11 con horario** |

## 6 · Rendimiento

El índice del planificador pasa de 694 paradas a 5.189. Era el riesgo que más
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

## Las 35 líneas sin regenerar

Cada una lleva su motivo en un comentario dentro de su propio bloque. Contadas
una a una el 18 de agosto: **las 35 llevan marca, ninguna se quedó sin ella**.

```
LINEA AUSENTE           11   sin equivalente en el GTFS
SIN VALIDAR             14   el número existe, hay que comprobarlo a mano
RECORRIDO NO COINCIDE    5   el recorrido oficial no cubre alguna cabecera
NUMERO COMPARTIDO        4   015 015N 934 934N
LINEA DISTINTA           1   231
```

El tranvía (L1 y L2) tampoco está en el GTFS de TITSA, pero **no es de este
grupo**: tiene sus 27 paradas y su trazado real, medido abajo.

De las 19 de cobertura, **9 fallan por menos de 2,5 km**. Subir el umbral de
1,5 a 2,5 km las recuperaría, pero se revisaron una a una y no se sostienen:
solo la 056 tenía respaldo en el título oficial del GTFS, y esa **ya entra**
—su recorrido incluye «Llano del Moro» con ese mismo nombre; la parada vieja
estaba a 1.790 m y la salvó el emparejamiento por nombre—. El umbral se queda
en 1,5 km.

Las cuatro de número compartido necesitan decisión manual: la nocturna de la
015 es en realidad la **714**.

## Decisiones abiertas

**351 rótulos repetidos, de 2.002 distintos, que son 863 paradas.** El GTFS
llama «Cementerio» a nueve paradas repartidas en 47 km y «San Isidro» a tres
en 49 km. Medido el 18 de agosto: de los 351, **ninguno** es un par ida/vuelta
a menos de 80 m —son sitios de verdad distintos—. En el buscador salen como
filas idénticas sin forma de distinguirlas, porque la fila pinta el rótulo y
las líneas pero **no el municipio**, que sí está en el catálogo. No es un fallo
de datos sino una decisión de presentación pendiente: añadir el municipio a la
fila del buscador, o dejarlo.

**73 paradas del catálogo sin municipio**, repartidas por 17 líneas; 17 de esas
paradas están en la 449 y 15 en la 035. `stops.txt` no trae el campo y se deduce de la parada
antigua más cercana a menos de 3 km; más lejos se deja vacío antes que
inventarlo. El popup **ya no pinta el `📍` suelto** cuando el campo está vacío.

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

---

# Auditoría profunda del 17 de agosto

Cuatro frentes, buscando problemas nuevos en vez de repetir los controles que
ya pasan.

## Seguridad · un fallo encontrado: ninguno nuevo

Se fue más allá del barrido de `eval(`. Lo revisado esta vez:

| superficie | resultado |
|---|---|
| Interpolación en `href`, `src`, `action`, `srcdoc` | 6 sitios, **todos con `escapeAttr` o `encodeURIComponent`** |
| `target="_blank"` sin `rel=noopener` | **0 de 9** |
| `window.open(...)` | 2, las dos con `'noopener,noreferrer'` |
| Asignaciones a `innerHTML` | 77; las que interpolan datos de admin pasan por `escapeAdmin` y `safeExternalUrl` |
| Contaminación de prototipo | 0 `__proto__`, 0 `constructor[]`, 0 `{...JSON.parse()}` |
| `Object.assign` sobre objeto ajeno | 6, todos sobre `LANGS` y `UI_TX`, con datos del propio fichero |
| Framebusting anti-clickjacking | presente (línea 96) |

**Cinco «hallazgos» resultaron ser artefactos de mi propia expresión regular**,
que solo mira una línea: `safeDirUrl` es `escapeAttr(...)` en la línea anterior,
`aE` es `escapeAdmin(ad.emoji)`, y el `window.open` de WhatsApp sí lleva
`noopener` como tercer argumento. Se comprobaron uno a uno antes de darlos por
buenos.

**Regresión de XSS ampliada** con dos vectores nuevos sobre los de agosto —
inyección por CSS en el campo `color` del panel admin, y el idioma guardado
(`tg_lang`) envenenado:

```
PWNED  : false        <img src=x onerror=...>  en 7 campos de admin
PWNED2 : false        https://x'-(payload)-'   como contacto
PWNED3 : false        red;background:url(javascript:...)  como color
elementos <img> inyectados : 0
scripts inyectados         : 0
tg_lang envenenado -> currentLang queda en 'es', válido
favoritos: el payload se rechaza, 'las-vistas' se conserva
```

**Lo que sigue siendo estructural y no es un fallo nuevo:** `script-src` lleva
`'unsafe-inline'`, inevitable con manejadores inline por toda la app, así que
la CSP no frena un XSS reflejado y el escapado es la defensa principal.
`img-src https:` permite cualquier imagen: es lo que hace falta para las fotos
de Wikipedia. Y el manejador de mensajes del service worker **no comprueba el
origen**: solo acepta `GET_VERSION`, `CLEAR_CACHES` y `SKIP_WAITING`, y a un
service worker solo le puede escribir una página del mismo origen, pero
conviene saberlo.

## Codificación · limpia

| control | resultado |
|---|---|
| Normalización Unicode | **NFC puro**: 0 caracteres combinantes sueltos |
| Invisibles | 2 NBSP y 8 ZWJ, **los 8 dentro de emojis compuestos** |
| Subrogados sueltos | **0** |
| Emojis | 2.890, 250 distintos, todos bien formados |
| Tabuladores | 0 · líneas con espacio final: 6 |

Mezclar NFC y NFD es el fallo que no se ve —dos cadenas que parecen iguales no
lo son, y el buscador falla— y aquí no lo hay.

## Idiomas · un fallo real, encontrado y corregido

Las 149 claves están en los 8 idiomas y **ninguna de las 69 que el código pide
falta en ninguno**. Los marcadores de interpolación (`{n}`, `{time}`, `{pct}`)
cuadran en las 8 versiones de todas las claves: **0 descuadres**.

**El fallo estaba donde ninguna comprobación de claves ausentes podía verlo:**

```js
LANGS.zht = JSON.parse(JSON.stringify(LANGS.zh));   // copia del SIMPLIFICADO
Object.assign(LANGS.zht, ZHT_OVERRIDES);            // y se sobrescribe lo traducido
```

El chino tradicional se construye copiando el simplificado. Una clave que no
esté en `ZHT_OVERRIDES` **existe, no está vacía, y muestra simplificado a un
lector de tradicional**. Por eso el control de «claves ausentes» daba 149/149.

Comprobado con OpenCC, convirtiendo cada cadena y viendo si cambia. Eran
**tres**, las tres del grupo de aparcamientos:

```
parkingUpdated   更新于 {time}   ->  更新於 {time}
parkingBeach     海滩停车场      ->  海灘停車場
parkingTeide     泰德停车场      ->  泰德停車場
```

Ojo con el método: OpenCC en `s2t` aplica **también preferencias de variante**.
De 21 caracteres que proponía cambiar, **18 eran variantes válidas del
tradicional** —里/裏, 台/臺, 岩/巖, 峰/峯, 群/羣…— y `特內里費` es la
transliteración estándar de Taiwán. Los reales eran cuatro: 车, 场, 滩 y 于.
Tras el arreglo, **0 caracteres simplificados** en `LANGS`, `UI_TX`, `SEA_TX` ni
en las 1.530 cadenas `zht` de los lugares.

Quedan 23 claves de `zht` idénticas a `zh`, y **no es un fallo**: son frases que
se escriben igual en las dos variantes (清除, 容量, 街道, 加入收藏…).

## Rendimiento · el problema no está donde parecía

En el navegador, con 5.150 paradas en vez de 694, todo va sobrado:

```
buildStopLineMap()          5,0 ms   (2.191 entradas)
getBusPlanIndex()           6,6 ms
drawBusLine() la más grande 17,2 ms  (bus-054, 86 paradas)
botón de aeropuerto sur    31,0 ms  (6 líneas de golpe)
buscar «cementerio»         0,7 ms  (40 resultados de 5.150)
findNearbyBusStops()        3,4 ms
memoria                    17,6 MB
DOM interactivo              581 ms
```

`buildStopLineMap()` se reconstruye **dentro de `drawBusLine()`**, o sea una vez
por línea encendida. Con 694 paradas daba igual; con 5.150 son 5 ms cada vez, y
31 ms al pulsar el botón de aeropuerto. Se puede memorizar, pero **no es un
problema hoy**.

**El problema real es el peso.** Lo que viaja por la red en cada carga en frío:

```
sin comprimir   3.502 kB
gzip -9         1.082 kB      (31 % del original)
```

Y de dónde sale:

```
places            1.886 kB   53,8 %   765 lugares × descripción y categoría × 8 idiomas
CSS                 239 kB    6,8 %
TITSA_PARADAS       215 kB    6,2 %
TITSA_LINES         190 kB    5,4 %
LANGS                45 kB    1,3 %
```

**Más de la mitad del fichero son textos de `places` en ocho idiomas, de los que
cada usuario solo leerá uno.** Servir solo el idioma activo ahorraría del orden
de 900 kB sin comprimir, pero rompe el fichero único y el funcionamiento sin
conexión: es una decisión de arquitectura, no un arreglo.

---

# Auditoría del 18 de agosto

Cinco frentes: idiomas coma a coma, seguridad, codificación, entrada de datos y
si la parte de guagua y tranvía está completa. Todo medido sobre
`md5 79acf330…`, ejecutando la app en Chromium, no leyendo el fuente.

## Idiomas · 11 fallos reales, corregidos

El barrido plano se quedaba corto: **las tablas se declaran con `const`, así que
no están en `window`** y recorrerlo no las ve. Hay que alcanzarlas por nombre
desde el ámbito global, y las que viven dentro de una función hay que sacarlas
del fuente por emparejamiento de llaves. Con eso salen **30 tablas y 358 filas**,
no las 3 que se contaban antes.

```
tablas alcanzables desde el navegador (ya fusionadas)   8   LANGS UI_TX CHAT_STR SEA_TX …
tablas sacadas del fuente (viven en una función)       28   MAR_T MC_T TX I18N PUSH_TX …
filas con texto español                               358
```

| control | resultado |
|---|---|
| Claves que el código pide y no existen en los 8 | **0** de 69 |
| `{marcadores}` descuadrados entre idiomas | **0** |
| Etiquetas HTML descuadradas | **0** |
| Cadenas vacías | **0** |
| Espacios sobrantes en los bordes | **0** |
| Espacios dobles de verdad | **0** |
| Puntuación final distinta | 7, **todas correctas** |
| Números que no cuadran | 6, **todos correctos** |

Las 13 que saltaron son **localización bien hecha**, no fallos: el alemán abrevia
`Min.` con punto donde el español pone `min`; el italiano escribe `circa` sin
punto porque no es abreviatura; el alemán fecha `25.4.2024`, el neerlandés
`25-4-2024` y el chino `2024年4月25日`; el inglés y el chino separan decimales con
punto (`1.5 km`) donde el español usa coma (`1,5 km`).

**Lo que sí estaba mal: el chino simplificado usaba signos latinos.** El chino
pide los de ancho completo, y el **tradicional ya lo tenía bien en las once**:

```
emergencyTel          🆘 紧急电话:112        →  🆘 紧急电话：112
pharmacyGuardLink     …值班药房(官方)        →  …值班药房（官方）
shareCopied           链接已复制!            →  链接已复制！
busLinesPassing       经过的线路:            →  经过的线路：
busLineSingle         线路:                  →  线路：
busShareCopied        路线链接已复制!        →  路线链接已复制！
busAccessToggleLabel  公交可达(500 米)       →  公交可达（500 米）
authSyncOff           本地会话,未同步        →  本地会话，未同步
authMergePrompt       …您的账户吗?           →  …您的账户吗？
authMergeYes          是,合并                →  是，合并
authMergeNo           否,忽略                →  否，忽略
```

Tras el cambio: **0 signos latinos pegados a un hanzi** en las 30 tablas, y el
tradicional intacto (`ZHT_OVERRIDES` sigue mandando en las once).

**zh contra zht, con OpenCC.** 343 pares. `s2t` quiere cambiar algo en 104, pero
**101 son vocabulario de Taiwán, que es lo correcto**: 網路/網絡, 資料/數據,
檔案/文件, 登入/登錄, 帳戶/賬戶, 公車/公交, 路線/線路, 儲存/保存, 搜尋/搜索,
應用程式/應用, 選單/菜單, 圖示/圖標, 資訊/信息, 造訪/訪問, 即時/實時, 目前/當前,
字元/字符, 裝置/設備, 轉乘/換乘, 大眾運輸/公共交通, 收件匣/收件箱… Los otros 3 son
`LANGS.code` 簡/繁, `TTS_LOCALE` zh-CN/zh-TW y `LANGS.flag` 🇨🇳/🌏, los tres
deliberados.

**Lo anidado también.** `LANGS.categories`: 42 claves en los 8, 0 huecos, y las
40 categorías que usan los 765 lugares tienen etiqueta en los 8. Las listas de
respuestas rápidas del chat (`qrHome`, `qrZones`, `qrZonesFull`, `qrAfterPoi`,
`qrThanks`) tienen dos formas —cadena en es/en, `[etiqueta, consulta en español]`
en los otros seis— y `setQuickReplies` resuelve las dos con `Array.isArray`.
No es un fallo: la etiqueta se ve traducida y la consulta la entiende el
buscador de intención.

`wikiTitleOverrides` no está en los 8 a propósito: `getWikiTitle` cae a `es` y
`fetchWikiPhoto` prueba `[idioma, 'es']`, así que un lugar sin artículo en chino
sale del artículo español.

**Los 8 idiomas, renderizados de verdad:** 0 botones en blanco, 0 `undefined`,
0 `{marcador}` sin resolver, 0 errores de página.

## Seguridad · 6 huecos de escapado, cerrados

El bloque de guaguas escapa con disciplina en casi todo, pero **seis sitios se
quedaron fuera** — y el globo de la parada era el caso raro de escapar el nombre
y el municipio y no escapar la insignia de la línea de al lado:

```
buscador de paradas    l.color · l.numero · stop.nombre
marcador del mapa      line.color
globo de la parada     l.color · l.numero
paradas cercanas       l.color · l.numero · stop.nombre
```

Hoy no eran explotables: el catálogo sale del GTFS y **no trae ni un `<`, `>`,
`&`, `"` ni `'`** en sus 2.514 rótulos, los 69 colores de línea son todos
`#rrggbb` y los números son todos alfanuméricos. Pero el catálogo se regenera
cada vez que TITSA publica, y un rótulo con `&` partiría la fila sin dar error.
Ahora van con `escapeHtml`/`escapeAttr`, como el resto.

Regresión con datos hostiles (rótulo `<img src=x onerror=…>`, color
`red" onload="…`, panel a `evil.com`):

```
payload renderizado como texto             sí
<img> inyectados                            0
elementos con atributo on*                  0
window.PWNED                                false
panel a evil.com                            rechazado
panel javascript:                           rechazado
panel https://metrotenerife.com.evil.com/   rechazado
panel http:// (sin cifrar)                  rechazado
panel https://opendata.metrotenerife.com/   aceptado
```

La regresión antigua (souvenirs, excursiones, anuncios, cesta, contacto) sigue
pasando: `PWNED:false, PWNED2:false` y los botones vivos.

Lo demás del barrido, comprobado uno a uno antes de darlo por hallazgo:
`safeDirUrl` es `escapeAttr(…)` de la línea de arriba; `renderLineBadge` valida
el color con `/^#[0-9a-f]{3,8}$/i` antes de meterlo en `style`; los 9
`target="_blank"` llevan `rel=noopener`; `__proto__`/`constructor[]` a 0; el
manejador de mensajes del service worker solo atiende a páginas del mismo
origen, que es lo que permite el navegador. `frame-ancestors` sigue ausente de
la CSP porque **desde `<meta>` no es aplicable** —GitHub Pages no deja poner
cabeceras—, y por eso el antiframe está en JavaScript.

## Codificación · limpia

```
NFC puro                      sí
U+FFFD, controles, CRLF       0
subrogados sueltos            0
tabuladores                   0
invisibles                    2 NBSP + 8 ZWJ, todos deliberados
emojis                        2.890, 250 distintos
```

Los 2 NBSP son tipografía francesa (`Un tour rapide ?`, `C'est parti !`) y los
8 ZWJ son la familia 👨‍👩‍👧. Los 32 `<script>` en línea compilan; `sw.js`,
`enviar-notificacion.js` y el YAML del workflow, correctos.

## Entrada de datos · dos cosas heredadas de TITSA

| control | resultado |
|---|---|
| Ids de línea repetidos | **0** |
| Ids de parada repetidos | **0** de 5.189 |
| Paradas o lugares fuera de Tenerife | **0** |
| Referencias huérfanas al catálogo | **0** |
| Parada repetida consecutiva en una línea | **0** |
| Claves del catálogo no numéricas | **0** |
| `via` con punto mal formado o fuera de la isla | **0** de 20.073 |
| Lugares: id, nombre, categoría, coordenada, color, emoji | **765 completos** |
| URLs en lugares sin cifrar (`http://`) | **0** de 16 |

Lo que sí aparece, y viene de TITSA tal cual:

- **5279 «La Romántica» y 5280 «Geranios» comparten coordenada exacta** en Los
  Realejos. Es lo que dice `stops.txt`. Nunca coinciden en la misma línea.
- **73 paradas sin municipio** (arriba).
- **Los números 934 y 015 los comparten dos líneas cada uno** (día y nocturna),
  que es justo lo que marca `NUMERO COMPARTIDO`.

Y una consecuencia del diseño, no un fallo: **6 líneas marcan más de 2 paradas
como terminal** (910, 911, 206, 014, 905, 330) porque la hidratación pone
`esTerminal` por `stop_id` y esas líneas **pasan por su propia cabecera a mitad
de recorrido**. La 330 es circular y `terminales:["5068","5068"]` es la misma
parada dos veces. El 🏁 sale donde toca: esa parada **es** la cabecera.

**124 pares de lugares a menos de 15 m** y 24 nombres repetidos: son el mismo
sitio dado de alta en varias categorías (`acc-`, `nucleo-`, `ciudad-`, `-pet`),
que es como funciona el filtro por categoría.

## Guagua y tranvía · dónde está completo y dónde no

```
178 líneas
  141 regeneradas del GTFS   con clave de catálogo, terminales[] y via
    2 de tranvía             27 paradas, trazado real, panel en directo
   35 sin regenerar          lista antigua a mano, 2–14 paradas, sin via
```

**El trazado, medido bien.** La primera medida daba paradas a 1,5 km de su
propia línea, pero era un artefacto: medía **al vértice**, y con Douglas-Peucker
los vértices quedan lejos en las rectas. Medido **al segmento**, que es lo que
se pinta:

```
paradas a más de 200 m de su trazado    4 de 5.038
líneas con alguna                       3 de 143
mediana del peor caso por línea        19 m
```

Las cuatro son ramales de un patrón que el shape elegido no recorre —una línea
tiene varios patrones y aquí se dibuja uno—: 449 «Barranco de Ajabo» 605 m,
121 «San Francisco Javier» 433 m (entre dos pasadas por «La Hidalga») y 010
«Aeropuerto Sur Salidas» 243 m.

**El tranvía está completo y es exacto:**

```
L1   21 paradas · 52 puntos · 12,5 km · parada más lejos de la vía:  4 m
L2    6 paradas · 13 puntos ·  3,4 km · parada más lejos de la vía:  0 m
     27 paradas distintas, las 27 con panel en directo, 2 cabeceras cada línea
```

**Lo que le falta a la parte de guagua son esas 35 líneas.** Se dibujan con la
lista antigua, y sus 20 tramos de más de 8 km salen **punteados y atenuados**
—`BUS_GAP_KM = 6`— justo para no afirmar una recta que la guagua no hace. Los 9
tramos largos de las líneas regeneradas sí van por carretera real (la 343 hace
54 km de Norte a Sur por la TF-1 sin parada intermedia, y la vía lo dibuja).

**Pero el usuario no ve ninguna diferencia entre una línea verificada y una sin
verificar.** Las 35 llevan su marca en un comentario del código y **`nota` vacía
en las 35**: en la app salen con la misma insignia y el mismo globo que las 141.
Es la misma familia del problema del título de la 920. Decisión pendiente:
poner un aviso visible en esas 35, o dejarlo.

## Rendimiento · el arreglo del trazado aguanta

```
6 líneas del aeropuerto sur    26 ms · 128 capas     (antes del arreglo: 467 ms · 986)
borrarlas                       3 ms
las 178 de golpe               811 ms · 5.450 capas  (caso extremo, la UI no lo hace)
carga completa                   0 errores de página
```
