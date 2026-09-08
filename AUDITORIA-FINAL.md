# Estado del proyecto y auditoría

**25 de agosto de 2026.** Documento único: dónde está la app, qué se ha
comprobado y qué falta. Sustituye al registro por fechas que había antes, y a
`BLOQUE-2.md` y `COORDENADAS.md`, cuyas listas están cerradas.

Todas las cifras salen de ejecutar la app o barrer el fichero. Ninguna está
recordada. Se vuelven a sacar con lo que hay en `tools/`.

```
index.html   md5 61a740afe215fc0ffc540f6e755c8dc6
             4.377.561 bytes · 1.329.882 comprimidos · 35.514 líneas
```

---

# 1 · Qué hay

| | |
|---|---|
| Lugares | **804**, con descripción y categoría en 8 idiomas |
| Líneas | **183** — las 181 del GTFS de TITSA + L1 y L2 del tranvía |
| Paradas | **6.263** referencias sobre un catálogo de **2.514** marquesinas |
| Idiomas | es · en · fr · de · it · nl · zh · zht |
| Ficheros | 39 en el repo · Leaflet y MarkerCluster auto-alojados en `vendor/` |

## Qué lineas paran en cada marquesina

`TITSA_PARADAS[clave].l` es la lista de líneas que sirven esa parada, sacada de
**todos** los patrones del GTFS. Es lo que leen el buscador y el globo del mapa.

**No se puede deducir de las secuencias**: cada línea guarda un recorrido y
TITSA publica 861 patrones para 181 líneas, así que lo que solo hace una
variante desaparece. Y la unión de los patrones **no se puede escribir en
`paradas`**: si un patrón hace A-B-C y otro A-D-C, el conjunto {A,B,C,D} no
tiene un orden, y `paradas` es un trayecto que usa el planificador. Escribirla
ahí inventaría un recorrido que ninguna guagua hace.

```
paradas visibles en el buscador   2.304 → 2.514
referencias línea-parada          5.827 → 7.348
paradas que ganan alguna línea      787   ·   que pierden: 0
```

## El tranvía, cerrado

La secuencia **no está deducida**: las paradas del CSV de Metropolitano son
vértices de la polilínea que publica la propia empresa, así que el orden se lee
del trazado.

```
L1   21 paradas · 20 son vértice exacto (< 0,5 m) · 12,47 km  (oficial 12,5)
L2    6 paradas ·  6 son vértice exacto           ·  3,42 km  (oficial 3,6)
```

**Padre Anchieta** es la única que no es vértice, y no hay nada que preguntar:
cae **entre los vértices 48 y 49, en un tramo recto de 503 m** por la avenida de
la Trinidad. En un tramo así de largo y recto la polilínea no necesita punto
intermedio, y la parada queda en medio. Está a **4,0 m del eje de la vía**, que
es la separación del andén — el mismo orden que el resto de la red, donde el
peor caso de las guaguas son 61 m y no se discute.

Los 135 m que llegué a escribir eran la distancia **al vértice**, que es la
medida equivocada. Ver la trampa 2.

## El precio: TITSA cobra por kilómetro, no por línea

No hay zonas: **hay tarifa kilométrica**, con un mínimo, y la web oficial pide
línea, parada de origen y parada de destino para calcularla. La consecuencia es
que **ninguna línea interurbana de más de dos paradas tiene un precio único**:
tres paradas ya son tres precios.

La clasificación no se deduce: la da el propio operador en `route_color` de
`routes.txt`.

```
75AD1C  interurbana         125   tarifa kilométrica  → «desde 1,45 €» + enlace
3F8FCF  urbana Santa Cruz    37   tarifa urbana plana → importe único
4F1780  urbana La Laguna     14   tarifa urbana plana → importe único
5C0A8A  lanzadera ULL         4   kilométrica
E83642  la 449                1   kilométrica
```

**130 líneas dicen «desde» y 51 llevan importe plano.** El enlace de cada una va
a su página oficial, donde está la calculadora por origen y destino; la URL sale
del `route_url` del GTFS y se deriva del número, verificada contra las 181.

Dos datos que están en la tarifa y no en el GTFS: los trayectos de más de 20 km
llevan **10 % de descuento en el billete de ida y vuelta** —está en el panel de
pago, en los 8 idiomas— y las líneas **342 y 348 al Teide están excluidas de la
tarjeta ten+**, que va en su `nota`.

## La red, línea por línea

```
tranvía        2      norte     46      sur         52
aeropuerto     6      teide      3      municipal   62
nocturna       8      lanzadera  4
```

**Cobertura del GTFS: 181 de 181.** Ni un número del `routes.txt` oficial falta,
y lo único que la app tiene y el GTFS no son L1 y L2, que son de Metropolitano.

**Las 183 líneas tienen trazado real de carretera** (`via`), sacado de
`shapes.txt` y simplificado con Douglas-Peucker a 12 m: 26.593 puntos. Ninguna
se dibuja ya como recta entre paradas.

```
paradas a más de 200 m de su propio trazado    4 de 6.263
mediana del peor caso por línea               19 m
tranvía                                       L1 4 m · L2 0 m
```

Las cuatro son ramales de un patrón que el shape elegido no recorre —una línea
tiene varios y aquí se dibuja uno—: 449 «Barranco de Ajabo» 605 m, 121 «San
Francisco Javier» 433 m y 010 «Aeropuerto Sur Salidas» 243 m.

**Los 22 saltos de más de 8 km entre paradas seguidas van por carretera real.**
La 343 hace 54 km del aeropuerto Norte al Sur sin parada intermedia y la vía lo
dibuja. Cero tramos dibujados como recta.

## Cómo se construyó

`TITSA_PARADAS` es el catálogo: una entrada por marquesina física, con los
`stop_id` del GTFS agrupados por par ida/vuelta en el campo `s`. Los 3.906
`stop_id` de `stops.txt` tienen su clave. Cada línea guarda `paradas` como lista
de claves y `terminales` como par, y un IIFE los hidrata al arrancar.

La regla del patrón, escrita en el comentario de cada línea regenerada: **el
recorrido con más paradas; empate, el de más viajes**. Choca a propósito con la
trampa 18 de más abajo, así que en las 40 líneas rehechas en agosto se
comprobaron las cabeceras una a una contra la secuencia real antes de aceptarlas.

---

# 2 · Auditoría

## Codificación · limpia

```
NFC puro · 0 U+FFFD · 0 controles · 0 CRLF · 0 tabuladores · 0 subrogados
invisibles: 2 NBSP + 8 ZWJ, todos deliberados
emojis: 2.894, 250 distintos
32 scripts en línea, los 32 compilan · sw.js y enviar-notificacion.js correctos
```

Los 2 NBSP son tipografía francesa (`Un tour rapide ?`) y los 8 ZWJ son la
familia 👨‍👩‍👧.

## Idiomas · 31 tablas, 435 filas

Las tablas se declaran con `const`, así que **no están en `window`**: hay que
alcanzarlas por nombre desde el ámbito global, y las que viven dentro de una
función hay que sacarlas del fuente. Un barrido que solo recorra `window`
encuentra 2 de 31.

El módulo PWA —banner de instalar, aviso de versión nueva y el panel de la ⓘ
entero— **iba fijo en español en los ocho idiomas**: 25 textos. Ya está en
`PWA_TX`, con la misma forma que `UI_TX`, así que la auditoría de idiomas lo
recorre sola. Y con el control ampliado salieron 12 más sueltos por la app
(tienda, GPS, portapapeles, «Cómo llegar»), también traducidos.

**Y en septiembre salieron 10 más**, que el control seguía sin ver por tres
agujeros distintos, no por uno:

| se escapaba porque | ejemplo | dónde salía |
|---|---|---|
| iba por `innerHTML`, y el control solo miraba `textContent` | «Sin foto en Wikipedia», en rojo | 270 fichas, casi siempre |
| es una palabra suelta: ni acento ni dos palabras funcionales | `⏳ Calculando…` | botón de calcular ruta |
| el `\|\|` de un respaldo **dos líneas más arriba** lo daba por traducido | «Servicio no configurado todavía.» | entrar y registrarse |

El tercero era el peor: el control miraba 140 caracteres hacia atrás a pelo,
así que un `L().authErrorEmail || 'Email inválido'` de otra sentencia lo
callaba. Ahora el contexto **se corta en la sentencia**.

Dos no eran solo de idioma. `addSouvenirToCart` sacaba el nombre del souvenir
quitando del título la palabra «PRÓXIMAMENTE» —que `applyUiTx` traduce—, así
que en inglés el producto entraba en la cesta como *Camiseta Tenerife Go
COMING SOON*, **con un id distinto en cada idioma**: el mismo artículo abría
una línea nueva por idioma en vez de sumar unidades. Medido, no deducido:

```
antes   es camiseta-tenerife-go · en camiseta-tenerife-go-coming-soon · zht camiseta-tenerife-go-即將推出
ahora   los tres  camiseta-tenerife-go
```

Y el botón volvía al literal `'Comprar'` 1,5 s después del clic, pisando el
rótulo que había puesto `tx('shopBuy')`: `Buy → ✓ Added → Comprar`.

**El propio control tenía un punto ciego, y era el peor posible.** Para dar
una entrada por fila pedía que tuviera `es` **y** `en`. Consecuencia: una fila
a la que le faltaba precisamente el inglés no la veía nadie. En
`wikiTitleOverrides` hay cuatro así —`teresitas`, `el-duque`, `benijo` y
`playa-americas`— y el control decía **15 filas incompletas donde hay 19**.
Era más ciego cuanto peor estaba el dato. Ahora basta con `es`; de que el
objeto sea una tabla y no otra cosa se encarga el umbral del 60 %.

Las 19 filas incompletas están **todas** en `wikiTitleOverrides`, y no son un
fallo: si falta el título en un idioma se pide el de `es` a la Wikipedia de
ese idioma, no está, y se cae a `es.wikipedia.org`, que sí lo tiene. Es lo
mismo que ya pasa con los otros 786 lugares, que no tienen override ninguno.
El techo es de calidad, no de corrección: rellenarlas pide comprobar contra
Wikipedia qué artículo existe en cada idioma, y **un título inventado no se
nota** —da la misma foto en castellano que da ahora—, así que no se rellenan
a ojo.

**Wikipedia no tiene dominio `zht`.** El chino tradicional y el simplificado
comparten `zh.wikipedia.org`. Quien leía en tradicional pedía
`zht.wikipedia.org`, que no resuelve, perdía el intento en su idioma y
acababa siempre en la Wikipedia en castellano. Era el único de los ocho al
que le pasaba.

| control | resultado |
|---|---|
| Claves que el código pide y no existen en los 8 | **0** de 69 |
| `{marcadores}` descuadrados | **0** |
| Etiquetas HTML descuadradas · cadenas vacías | **0 · 0** |
| Espacios dobles reales | **0** |
| Signos latinos pegados a un hanzi | **0** |
| Los 8 renderizados: botones vacíos · `undefined` | **0 · 0** |

Lo que salta y **no** es fallo, comprobado uno a uno: el alemán abrevia `Min.`
con punto, el italiano escribe `circa` sin él, las fechas van `25.4.2024` /
`25-4-2024` / `2024年4月25日`, y los decimales `1.5 km` frente a `1,5 km`.

**zh contra zht.** De los 104 pares que OpenCC quiere cambiar, **101 son
vocabulario de Taiwán**, que es lo correcto: 網路/網絡, 資料/數據, 檔案/文件,
登入/登錄, 帳戶/賬戶, 公車/公交, 路線/線路, 儲存/保存, 搜尋/搜索, 應用程式/應用,
選單/菜單, 圖示/圖標, 資訊/信息, 造訪/訪問, 即時/實時, 目前/當前, 字元/字符,
裝置/設備, 轉乘/換乘, 大眾運輸/公共交通, 收件匣/收件箱. Los otros tres son
`LANGS.code` 簡/繁, `TTS_LOCALE` zh-CN/zh-TW y `LANGS.flag` 🇨🇳/🌏, deliberados.

`zht` se construye copiando `zh` y aplicando `ZHT_OVERRIDES`. **Una clave que
falte no da error: muestra chino simplificado en silencio**, y ninguna
comprobación de «claves ausentes» lo detecta. Por eso la comparación se hace
carácter a carácter con OpenCC, no por presencia.

`wikiTitleOverrides` no está en los 8 a propósito: `getWikiTitle` cae a `es` y
`fetchWikiPhoto` prueba `[idioma, 'es']`.

## Seguridad

Regresión con datos hostiles —rótulo `<img src=x onerror=…>`, color
`red" onload="…`, panel apuntando a `evil.com`— sobre el panel admin, la cadena
souvenir→cesta, los anuncios y el bloque de guaguas:

```
payload renderizado como texto            sí
<img> inyectados · elementos con on*      0 · 0
window.PWNED                              false
panel evil.com · javascript: · http://    rechazados
panel https://metrotenerife.com.evil.com  rechazado
panel https://opendata.metrotenerife.com  aceptado
```

```
eval · new Function · document.write       0 · 0 · 0
target="_blank" sin rel=noopener           0 de 9
__proto__ / constructor[]                  0
interpolaciones sin escapar en guaguas     0
```

Lo que un `grep` marca y **no** es hallazgo, verificado en cada caso:
`safeDirUrl` es `escapeAttr(…)` de la línea de arriba; `renderLineBadge` valida
el color con `/^#[0-9a-f]{3,8}$/i`; el `window.open` de WhatsApp sí pasa
`'noopener,noreferrer'`; los colores que van a `style` son datos propios y los
69 de línea y 93 de lugar son todos `#rrggbb`.

`frame-ancestors` sigue ausente de la CSP porque **desde `<meta>` no es
aplicable** y GitHub Pages no deja poner cabeceras: por eso el antiframe está en
JavaScript. `'unsafe-inline'` en `script-src` es inevitable con manejadores
inline por toda la app, así que **el escapado correcto es la defensa principal,
no la secundaria**.

## Integridad de datos

| control | resultado |
|---|---|
| Ids de línea repetidos · números compartidos | **0 · 0** |
| Ids de parada repetidos | **0** de 6.263 |
| Referencias huérfanas al catálogo | **0** |
| Paradas o lugares fuera de Tenerife | **0** |
| Parada repetida consecutiva en una línea | **0** |
| `via` con punto mal formado | **0** de 26.593 |
| Lugares completos (id, nombre, categoría, coordenada, color, emoji) | **804** |
| Ids de lugar que cumplen `[a-z0-9-]` | **804** |
| Con calidad de agua, y su año | **46** · 46 |
| Con alias de búsqueda, que los 3 filtros leen | **58** |
| Con aviso `warn`, y su tipo existe en `WARN_I18N` | **115** · 0 huérfanos |
| De esos, `warn:"mar"` | **50** |
| URLs de lugar sin cifrar | **0** de 16 |

Lo que aparece y **viene de TITSA tal cual**: las paradas 5279 «La Romántica» y
5280 «Geranios» comparten coordenada exacta en `stops.txt`, y 73 paradas no
traen municipio.

Y una consecuencia del diseño: **7 líneas marcan más de 2 paradas como
terminal**, porque `esTerminal` va por `stop_id` y esas líneas pasan por su
propia cabecera a mitad de recorrido. El 🏁 sale donde toca.

## Rendimiento

```
botón de aeropuerto sur      7 líneas · 169 capas · 128 ms
las 183 de golpe             6.448 capas · 2,4 s   (caso extremo, la UI no lo hace)
índice del planificador       6.263 paradas, sin degradación medible
carga completa                0 errores de página
```

Dibujar la `via` como **una sola polilínea** en vez de trocearla es lo que
sostiene esto: trocear subía el botón de aeropuerto de 31 a 467 ms y dejaba 986
capas con solo 6 líneas. El troceo se conserva únicamente para el caso sin
`via`, que hoy no se da en ninguna línea.

**Los arreglos de septiembre no cuestan.** El mismo guion, el mismo servidor,
cinco arranques cada uno, contra los dos ficheros seguidos:

```
                      antes            ahora
arranque mediana      664 ms           678 ms      (643-684  /  658-710)
montón de JavaScript  19,2 MB          19,2 MB
8 cambios de idioma   124 ms           137 ms
```

Los 14 ms de diferencia caen **dentro del margen de las propias tiradas**, que
se solapan. Lo que se añadió son 7 filas de traducción; lo que se quitó, tres
plantillas de HTML de depuración.

**El peso es el problema real, y no es el GTFS.** De los 1,27 MB comprimidos,
más de la mitad son los textos de `places` en ocho idiomas, de los que cada
usuario lee uno. Servir solo el idioma activo ahorraría del orden de 900 kB sin
comprimir, pero rompe el fichero único y el funcionamiento sin conexión: es una
decisión de arquitectura, no un arreglo.

---

# 3 · Lo que falta

## Un charco que no existía · resuelto quitándolo

`charco-infierno-arafo` medía **10,2 km al mar**, contra menos de 614 m los
otros 99 puntos de baño: dos grupos separados, y de eso sí se puede afirmar
cuál está mal. Lo cazó el control nuevo de `auditar_ubicacion.py`, que mide
contra el anillo de costa de GSHHG —solo mar— además de contra la capa `water`
de OSM, que incluye balsas y embalses y tenía una a 279 m.

**Y al buscarlo, no existe.** Ni en Google Places ni en la web abierta hay un
«Charco del Infierno» en Arafo. Los dos que llevan ese nombre son el de
Almogía (Málaga), que es un río de otra provincia, y el **Barranco** del
Infierno de Adeje, que es un barranco de senderismo en la otra punta de la
isla —y ese sí está en la app, como `sendero-barranco-infierno`, categoría
`senderismo`, en Adeje—.

Así que no era una coordenada mal escrita: era un punto inventado, con
descripción y etiquetas verosímiles («piscina natural en la costa de Arafo»,
`Costa`, `Atlántico`). **Se ha quitado.** No se corrige lo que no existe.

```
lugares  805 → 804    charcos 27 → 26    warn 116 → 115    warn:"mar" 50 → 49
```

Entró en `4f491e8`, con el lote de las zonas de baño. Los otros 39 de ese lote
pasan la medida contra la costa, pero **pasar la medida de sitio no demuestra
que el sitio exista**: eso solo se comprueba contra una fuente, y esa
comprobación no la hace ninguna herramienta del repositorio.

## Bloqueado por terceros

- ~~horarios de socorrista~~ **resuelto hasta donde se puede.** La tabla
  oficial está congelada en septiembre de 2023, y ya se sabe **por qué**: la
  comunicación anual que la alimentaba dejó de ser obligatoria al anularse el
  decreto. **No van a llegar datos de 2024, 2025 ni 2026** mientras no se
  apruebe el nuevo modelo. Confirmado por la Subdirección de Protección Civil
  y Emergencias, agosto de 2026.

  Lo que hace la app ya es lo correcto y no hay que cambiarlo: etiqueta neutra
  —«🚩 Bandera y socorristas (oficial)»— y enlace al visor oficial **centrado
  en la playa**, sin horarios grabados. Un horario del 23 escrito en la ficha
  sería peor que no ponerlo.

  Lo que sí queda contado, para que no vuelva a aparecer un número sin lista
  detrás —el «13» que decía esta línea no tenía ninguna—:

  ```
  99 zonas de baño   ·   24 con socorrista   ·   14 sin él   ·   61 sin dato
  ```

  `lifeguard` tiene tres estados y `false` **afirma** que no hay socorrista:
  ausente no afirma nada, y por eso los 61 se quedan callados. Y el horario,
  si algún día llega, **no cabe en ninguna ficha: el campo no existe.**

- ~~la secuencia del tranvía~~ **cerrado, ver abajo**.

### La orientación de playa no es un campo publicado

Comprobado abriendo cada fuente, no supuesto. Esto cierra la pregunta «¿habrá
por ahí una base de datos con esto?», que si no se vuelve a hacer cada pocos
meses:

| fuente | veredicto |
|---|---|
| **surf-forecast.com** | **sirve, con techo.** 26 spots en Tenerife, ~12 coinciden con puntos de baño nuestros. De ahí salen las 11 filas verificadas. Las playas abrigadas —las que la gente usa para bañarse— no son spots y no tienen ficha |
| **AEMET, predicción de playas** | no. Cubre todas las playas oficiales, pero el viento va **solo en intensidad, sin rumbo**. Comprobado en la ficha de San Marcos (código 3802201) |
| **MITECO, Guía de Playas** | no. Base completa del Estado, ~3.000 playas, nueve secciones por ficha, y la orientación no es ninguna |
| **Catálogo del Decreto 116/2018** | no para esto. Clasifica libre / peligrosa / prohibida y asigna grado de protección; no es un catálogo de características físicas |
| **los 27 charcos** | ninguna fuente los cubre. No son playas censadas ni rompientes |

**Dónde sí vive el dato: los Planes de Seguridad y Salvamento (PSS)**, uno por
playa o zona de baño, firmados por técnico habilitado e inscritos en el
Registro Autonómico de la Dirección General de Seguridad y Emergencias. Su
capítulo 1 describe emplazamiento y análisis de riesgo, que es exactamente
donde están la orientación, los vientos dominantes y las corrientes. No son
datos abiertos: se accede por sede electrónica y están pensados para técnicos
de entidades locales.

**Y es el mismo canal que los 13 horarios de socorrista.** Un PSS trae las dos
cosas, así que una sola petición cierra los dos bloqueos que quedan.

**El decreto que sostenía todo eso está anulado**, y conviene tener claro qué
cae y qué no:

| | |
|---|---|
| **cae** | el deber de redactar y actualizar los PSS · el Catálogo · la comunicación anual de horarios de socorrismo, que es el artículo que citaba nuestra carta anterior |
| **no cae** | los **126 planes** que llegaron a elaborarse y registrarse, de los 365 que hacían falta sobre 750 zonas de baño de Canarias. Son documentos que existen |

**Y el canal ya no se adivina: lo dio la propia administración.** La
Subdirección de Protección Civil y Emergencias indicó que las peticiones de
datos de playas van por el **portal web de GESPLAN**, a la atención de la
**Directora Técnica del Encargo de Playas** — que es además quien tiene los
servicios ArcGIS `cat_playas_zbm`, donde estarían la orientación y el
socorrismo. Una vía nominal señalada por quien lleva el dato vale más que un
procedimiento formal dirigido a quien no lo lleva.

El borrador está en `SOLICITUD-GESPLAN.md`. No cita ningún artículo: por ese
canal no hace falta fundamento legal, y no citar nada es la única forma segura
de no volver a citar algo derogado.

**La atribución ya está puesta.** La administración pide indicar fuente **y
origen**, siendo el origen el portal de donde salen los datos. `banderasFuente`
nombra ahora las dos cosas en los ocho idiomas: la Subdirección como fuente y
el portal Infoplayas Canarias como origen.

## Se puede hacer, hace falta un dato

- ~~73 paradas sin municipio~~ **cerrado**: cruzadas con los límites
  municipales del Cabildo. Las 2.514 tienen municipio y son los 31 de la isla.
- ~~precios que afirman lo que TITSA no cobra~~ **cerrado**: ver abajo.

## Decisión pendiente

- ~~351 rótulos repetidos sin distinguir~~ **cerrado**: la fila del buscador
  pinta el municipio. «Cementerio» daba cinco filas con texto idéntico y ahora
  da cero. Los 351 rótulos siguen ahí —son sitios distintos de verdad— pero ya
  se distinguen.
- ~~210 marquesinas invisibles~~ **cerrado**, y resultó ser mayor: el catálogo
  lleva ahora un índice `parada → líneas` sacado de cruzar los **861 patrones**
  del GTFS. **787 paradas ganan servicio** —las 210 que no salían y 577 que sí
  salían con la lista de líneas incompleta— y las referencias pasan de 5.827 a
  **7.348**. Ninguna pierde nada.
- **El detalle OSM: z14 o z15.** Hoy va **z14, 11,43 MB**, y pinta el 99,77 %
  de los píxeles con el estilo de la app en todos los zooms de z6 a z18. z15
  serían **24,5 MB** —también al 100 %— y la app descarga el fichero **entero**
  a un Blob antes de pintar, así que el coste es de datos y de espera, no de
  calidad. Con z14 se lee el nombre de las calles; z15 añade portales y
  detalle de edificio. **Decidido: z14.** La carga es bloqueante —con el Blob no
  hay mapa hasta que baja el fichero entero— y en Anaga y Teno, donde la app más
  falta hace, la cobertura es mala y 13 MB más se notan. Y es reversible en
  veinte minutos: `maxzoom` a 15 en el workflow. El disparador para subirlo es
  **la carga medida en 5G y en una barra**, no el 99,77 %, que es un detector de
  mapa en blanco —píxeles distintos del color de fondo declarado— y no una
  medida de detalle: un fichero de z15 daría prácticamente el mismo número.
- **Las 7 tarjetas de la tienda van solo en castellano**, en los ocho idiomas:
  **7 títulos y 7 descripciones** escritos a pelo en el HTML. (Los otros tres
  `.excursion-desc` del fichero son huecos de plantilla —`${sD}`, `${eD}`,
  `${aT}`— que se rellenan con lo que el administrador escribe en el panel,
  así que no son texto que se pueda traducir aquí: son dato del servidor. Llegué
  a decir «10 descripciones» contando esos tres, y no lo son.)

  Traducirlas **no es inventar**: el texto está escrito y pasarlo a los otros
  siete idiomas es traducción normal. Lo que sí decide el producto es si merece
  la pena ahora, porque los siete llevan «PRÓXIMAMENTE» y no existen todavía.
  **Decidido: se quedan como están hasta que los productos existan.**

  Lo que ya **no** depende de esa decisión: el rótulo del botón, el aviso de
  añadido y el nombre con el que entran en la cesta, que ya van en los ocho.
- ~~Los 19 títulos de Wikipedia por idioma~~ **cerrado: se quedan.** Caen a
  `es.wikipedia.org`, que es lo mismo que hacen los otros 786 lugares, y un
  título inventado no se notaría: daría la misma foto en castellano que da
  ahora. Rellenarlos de verdad pide comprobar artículo por artículo qué existe
  en cada idioma.
- ~~Las playas sin orientación~~ **cerrado: las 99 zonas de baño la tienen.**
  Las 65 que faltaban entraron en septiembre. Procedencia, que no es la misma
  en las tres tandas y por eso se escribe en el propio código:

  ```
  11  respaldo publicado, comprobado abriendo la fuente una por una
   1  piscina-hidalgo-norte, heredada de punta-hidalgo por vecindad (490 m)
  53  deduccion de un modelo de lenguaje, auditada y contrastada aqui
  ```

  **Las 65 van con `deducida: true`, incluidas las 11 con fuente**: el dato
  publicado es el rumbo del oleaje, no el de la playa, y la conversión
  arrastra la misma tolerancia de ±45° que el resto.

  **Contraste independiente, medido antes de aplicarlas.** El método del agua
  coincide con las 65 en 64, y con las 53 sin fuente en las 53. El de la arena
  coincide en 33 de las 38 que se atreve a contestar. **No hay ni una en la
  que discrepen los dos a la vez.**

  **Y una corrección que cambia el veredicto anterior.** Aquí se dijo que el
  método del agua sacaba «6 de 12» y no valía. Ese 6 era con **rumbo exacto**;
  el umbral que se fijó después —≥ 10 de 12 **dentro de 45°**— es otra medida.
  Con la misma vara para los dos:

  ```
  metodo del AGUA    10 de 12 dentro de 45 grados   APRUEBA   (azar 4,5 · p = 0,0016)
  metodo de la ARENA  7 de 12                        no aprueba
  ```

  Y falla exactamente en las dos que estaban anunciadas: `playa-amarilla` y
  `teresitas`, las dos a 90°. Es el caso que se escribió de antemano —«si
  falla solo en esas dos, aprueba, y además apunta a que las escritas a mano
  son las equivocadas»—. Los tres métodos geométricos dicen `SE` para
  Teresitas y lo escrito a mano dice `NE`.

- **`badWind` vacío en las 65, y no es una concesión.** La rama de `deducida`
  de `scorePlaya` **no lee `badWind`**: puntúa por el ángulo de `ori`. Para
  una entrada deducida ese campo es peso muerto. El control nuevo comprueba
  que esa rama **se ejecuta**, porque el objeto que se puntúa se copia campo a
  campo en dos sitios y si `deducida` no llega, las 87 vuelven a puntuar por
  texto sin que falle nada.

- **Tres para mirar si alguien conoce el sitio:** `playa-grande-abades` (el
  spot de la fuente se llama «Porís de Abona (Playa Grande)» y nuestro POI
  dice «(Abades)»: pueden ser dos playas distintas), `benijo` (la fuente da N
  y NW a la vez) y `piscina-gigantes` (ONO cae entre W y NW).

- **Cómo está hoy.** Contado:
  los **99 puntos de baño** (73 playas + 26 charcos) tienen orientación: **87
  `deducida` y 12 escritas a mano**. De las 34, **22 son `deducida`** —del abanico de
  rayos, que mira a 4, 6 y 8 km y por eso es ciego a lo que abriga en el primer
  kilómetro— y **12 están escritas a mano**, que son las fiables. Una lleva
  `noBano`, así que candidatas reales hay 33.

  El recomendador recorre `Object.keys(PLAYAS_ORIENTACION)`, así que antes una
  playa sin fila no era candidata. Ahora lo son las 98 (99 menos
  `playa-los-patos`, que lleva `noBano`).

  Troya, Los Cristianos y Porís entran aquí: son las tres de `ff0f7191`, tienen
  panel de mar y no puntúan.

  **Se rellenan a mano, punto por punto.** No es una tarea bloqueada por un
  dato que no llega: es una tarea que pide conocer el sitio, y la lista está
  preparada para que se pueda hacer poco a poco. Cada fila que entre aparece
  en «¿dónde me baño hoy?» sin tocar nada más.

## Cómo llegaron las playas a 73

Reconstruido del historial, porque la cuenta «39 + 31 = 70» se queda corta y
la diferencia no es un error: son tres fichas que **cambiaron de categoría**,
no que se añadieran.

```
c337d4bc   39 playa · 18 piscinas · 765 lugares
ff0f7191   42        · 18         · 765          +3, sin lugares nuevos
3a6e7356   73        · 27         · 805          +31 playas +9 charcos = 40
hoy        73        · 26         · 804          -1: charco-infierno-arafo, que no existe
```

Las tres de `ff0f7191` son `acc-playa-troya`, `acc-playa-los-cristianos` y
`acc-playa-poris` —el propio asunto del commit las llama «las tres playas que
no puntuaban»—, y son **las mismas tres** que siguen fuera de
`PLAYAS_ORIENTACION` en la lista de decisiones. Pasaron a categoría `playa`
para recibir panel de mar; puntuar en «¿dónde me baño hoy?» necesita su
orientación, que sigue bloqueada.

## Cerrado

- **Las 35 líneas sin verificar**: 22 regeneradas del GTFS y 13 borradas por no
  existir en él. Ya no queda ninguna línea con paradas escritas a mano.
- **Las 18 paradas de `COORDENADAS.md`**: 15 están en la red, y «Realejo Alto»,
  «Suárez Guerra» y «Adeje casco» **no existen con ese nombre en `stops.txt`**.
- **Las 14 filas de `BLOQUE-2.md`**: resueltas por la reconstrucción.
- **`stop_code` / `stop_desc`**: confirmados ausentes del GTFS de TITSA.
- **El mapa sin conexión**: el service worker ya guarda las teselas que el
  usuario ha mirado, en un caché propio que sobrevive a las actualizaciones,
  con tope de 1.200 (la isla entera de z8 a z13 son **600 teselas contadas**
  sobre la caja de navegación del mapa). Red primero y caché de respaldo, así
  que con conexión se comporta exactamente igual que antes.

## El mapa sin conexión, en bloques

Guardar las teselas que el usuario ya ha mirado arregla el caso del avión,
pero no el de alguien que instala la app y se va al monte. Para eso el mapa
tiene que **venir dentro**.

| bloque | qué | estado |
|---|---|---|
| 1 | el motor: `pmtiles` 4.5.0 y `protomaps-leaflet` 5.1.0 en `vendor/`, precargados | hecho |
| 2 | `mapa/tenerife-base.pmtiles`, generado con datos que ya estaban aquí | hecho |
| 3 | la capa vectorial en Leaflet, que entra sola cuando no hay conexión | hecho |
| 4 | descarga opcional de un `.pmtiles` de OSM para el detalle fino | **hecho, con el fichero dentro**: 11,4 MB, build 20260905, z0–z14 |

**Por qué `protomaps-leaflet` y no MapLibre.** MapLibre obliga a rehacer el
mapa entero y con él los 804 marcadores, los clusters y las 183 polilíneas.
Esto es una capa más de Leaflet 1.9.4, la que ya usa la app.

**Sin peticiones por rango.** El fichero pesa 1,1 MB y se pide entero de una
vez, con una fuente propia de cuatro líneas sobre un `Blob`. Así vale en
cualquier hosting estático, lo guarda el service worker como un recurso más y
funciona sin conexión desde el primer arranque. Con rangos dependería de que
el servidor haga *byte serving*, que desde aquí no se puede comprobar.

**La prueba que cuenta.** `tools/auditar_mapa.js` termina haciendo lo que le
pasó al usuario: abrir la app con cobertura, cortar la red de verdad
(`setOffline`, no un evento simulado) y volver a abrirla. Sale la app entera,
la capa se pone sola en la isla, el `.pmtiles` se lee del caché y **se pintan
12 teselas** con los 804 lugares encima. Sin una sola excepción.

**Cuándo entra.** Con conexión no cambia nada: se arranca en Calles y el
fichero **ni se descarga**. La capa entra sola en dos casos —arrancar sin red,
o seis fallos seguidos de teselas, que ya no es un hueco suelto— y se va sola
cuando vuelve la red. Con dos reglas para no pelearse con el usuario: **si
elige capa a mano, no se le cambia nunca más**, y se recuerda cuál tenía para
devolvérsela.

**Medido con el fichero de verdad en la mano** (build 20260905, z0–z14):
**11,4 MB**, compatibilidad **100 %**, y senderos —`path`, `footway`, `track`,
`steps`— en los cinco puntos que muestrea el verificador, Teide y Anaga
incluidos. Se dibuja al 99,7–99,9 % de píxeles pintados. Y los metadatos del
build dicen `version: 4.15.2`: **basemap v4**, la misma generación por la que
filtra nuestro estilo. La duda de v4 contra 5.x queda cerrada con el dato
delante, no con un razonamiento.

**El detalle de OSM (bloque 4).** La maquinaria está entera y probada:
mirar si el fichero existe (`HEAD`, sin gastar datos), descargarlo con barra
de progreso, guardarlo en su propio caché, releerlo, estilarlo con el *flavor*
`light` de Protomaps —que **sí pinta senderos**, `kind: path`— y borrarlo. Se
enciende **solo** el día que aparezca `mapa/tenerife-osm.pmtiles` en el
repositorio: mientras no esté, la sección ni se ve y la app usa el mapa base.

Ese fichero lo tiene que generar una persona: desde este contenedor el proxy
no deja salir a Geofabrik, Overpass ni Protomaps. Cómo, en «Fuera del repo».

**Qué lleva y qué no.** Costa (GSHHG), red viaria (los `via` de las 183 líneas,
trazado real del GTFS) y 54 núcleos con su nombre. **No lleva senderos ni
curvas de nivel**: no están en ningún dato que tengamos. Y la costa de GSHHG
tiene 250–500 m de error en las calas —lo midió el control de orientación—,
así que sirve para saber dónde está el mar, no para saber si pisas la arena.
Para el detalle fino está el bloque 4, que es opcional.
- **Las 4 playas descolocadas más de 300 m**: Almáciga (1.090 m), Benijo
  (829 m), La Rambla de Castro (2.152 m) y Puerto Santiago (420 m), más los
  3 satélites que las acompañan. Anaga estaba corrida un puesto al oeste: el pin
  de Benijo era exactamente el de Almáciga. El orden oeste→este vuelve a ser
  Roque de las Bodegas → Almáciga → Benijo, con 1.278 m y 829 m entre vecinas.

---

# 4 · Trampas, por si alguien vuelve a tocar esto

1. **Leer `TITSA_LINES` en crudo no da paradas.** `paradas` es una lista de
   claves y solo se convierte en objetos al hidratar. Un script que mida `p.lat`
   sin hidratar **no falla: devuelve `undefined` y da cifras falsas**. Pasó tres
   veces, una dando «0 de 14» donde eran 7. Usa un cargador que hidrate siempre.
2. **La distancia de un punto a una polilínea es siempre al SEGMENTO, nunca al
   vértice.** Y el error no es uniforme: **infla tanto más cuanto más recto y
   largo es el tramo**, que es justo donde el trazado es más fiel. Este mismo
   fallo ha producido **tres falsos bloqueantes**: las cuatro guaguas del primer
   bloque, las «paradas a 1,5 km de su línea» que al segmento eran 0 m, y Padre
   Anchieta —135 m al vértice, 4,0 m a la vía, en un tramo recto de 503 m—, que
   llegué a dejar escrito como «no lo resuelve ningún fichero público» sin
   volver a medirlo con el criterio ya corregido.
   La medida correcta tiene nombre propio en `tools/cargar.js`,
   **`distanciaAVia(punto, via)`**, para no volver a escribir el bucle a mano.
3. **El trip canónico no es siempre el que más paradas tiene.** Un refuerzo
   escolar puede tener más que el recorrido completo: la 103 acabó sin llegar a
   Santa Cruz. Si se elige por número de paradas, hay que comprobar después que
   las cabeceras declaradas siguen ahí.
4. **`stop_times.txt` acumula todos los días de servicio a la vez.** Calcular el
   intervalo sobre el fichero entero da basura: la 475 salía «102 min» teniendo
   25 viajes en 12 horas. Hay que fijar **un día** con `calendar_dates.txt`.
5. **El nombre oficial de una línea también caduca.** La 920 se llama
   `INTERCAMBIADOR PLAZA DE ESPAÑA …` y ninguna de sus 19 paradas se llama Plaza
   de España; la 412 se llama `… LOS ABRIGOS` y no tiene ni una parada allí.
   Manda la secuencia, no el `route_long_name`.
6. **`zht` que falta no da error: muestra `zh`.** No hay comprobación de claves
   ausentes que lo pille. Se compara carácter a carácter.
7. **OpenCC sobre-avisa.** `s2t` impone preferencias de variante (里/裏, 台/臺,
   岩/巖) que son las dos válidas en tradicional. De 21 caracteres marcados una
   vez, 18 eran correctos.
8. **La regla de colapso es el `stop_id`, no el rótulo.** Un rótulo repetido con
   dos coordenadas casi nunca es problema de rótulos: con «Añaza» y «El
   Bailadero» la coordenada vieja no era ninguna marquesina.
9. **El `stopId` va sin sufijo aunque el `id` lo lleve.** Es el que agrupa en el
   buscador y el que usa el filtro de aeropuerto.
10. **Promediar la coordenada de un grupo la saca de la marquesina.** Guardar el
    punto medio de un par ida/vuelta movió 683 claves hasta 40 m. Se guarda la
    del `stop_id` líder.
11. **El filtro de aeropuerto está en dos funciones.** `activateAirportLines` es
    el que enciende las líneas; arreglar solo `updateAirportQuickButtons` deja
    los botones bien pintados y sin efecto.
12. **`scorePlaya` no recibe la entrada de `PLAYAS_ORIENTACION`**: el objeto se
    copia campo a campo dos veces. Un criterio que no se propague **deja de
    ejecutarse sin que nada falle**. Ya pasó con `deducida` y con `lifeguard`.
13. **El abanico de rayos mira a 4, 6 y 8 km**, así que es ciego a lo que abriga
    en el primer kilómetro. Por eso hay 12 entradas escritas a mano.
14. **El caché de 30 min** del panel de baño hace que una prueba mienta si no se
    limpia `tgo_bano_cache_v2` entre escenarios.
15. **Playa Jardín tiene DOS fichas**: `playa-jardin` y `surf-playa-jardin`.
16. **Los ids de lugar son la barrera de los `onclick` inline.** Los manejadores
    inline solo son seguros porque los 804 ids cumplen `[a-z0-9-]`.
17. **`index.html` suelto no es la app.** Leaflet vive en `vendor/`.
18. **Contar cadenas en un fichero de 4 MB es mal método.** Varias
    comprobaciones fallaron por contar la palabra dentro del comentario que la
    explica, o por suponer el número en vez de medirlo.
19. **Un comentario que describe lo que el código ya no hace es peor que no
    tenerlo — y borrarlo sin comprobarlo es igual de malo.** Se quitaron 9
    comentarios «Falta X» dándolos por obsoletos; **4 seguían siendo ciertos**.
20. **No dejar arreglos de circunstancia.** Se metieron tres cambios en el
    contador de portada persiguiendo un «0 lugares» que era un visor sin
    JavaScript. Se revirtieron.
21. **Una norma publicada no es una norma vigente.** El Decreto 116/2018 fue
    anulado (TS 27/9/2023, BOC 82, 25/4/2024) y se usó como fuente para la
    leyenda de banderas. **Y vuelve a aparecer**: en septiembre de 2026, como
    fundamento de que existan los Planes de Seguridad y Salvamento, que es
    donde vive la orientación de playa y donde están los horarios de
    socorrista. Los planes existen; la obligación citada en presente, no
    consta. Una norma anulada no deja de citarse sola: hay que ir a mirarlo
    cada vez que reaparece.
22. **Un nombre de sitio no es un dato** hasta que tiene coordenada y esa
    coordenada cae donde debe. Si no está en `stops.txt`, no entra.
23. **Ordenar paradas proyectándolas sobre `via` no funciona.** Probado contra
    las 183 líneas cuyo orden ya se conoce: solo 84 lo recuperan. **86 de 183
    pasan dos o más veces por la misma parada** y 28 son circulares; una parada
    repetida tiene una posición sobre la vía y dos sitios en la secuencia.
24. **La unión de patrones no es un camino.** Si un patrón hace A-B-C y otro
    A-D-C, {A,B,C,D} no tiene orden. La pregunta «qué líneas paran aquí» es un
    índice, no una secuencia, y se resuelve aparte.
25. **La herramienta de auditoría vive en `tools/`, no en el scratchpad.** El
    contenedor se reaprovisiona y se lleva el scratchpad entero; el repo es lo
    único que sobrevive. Pasó una vez y hubo que reescribir todo el arnés.
26. **Al reaprovisionar, el clon se sitúa en la rama designada, no en `main`.**
    Parece que el trabajo se ha perdido y no es así: está en `origin/main`.
    Se comprueba con `git log --oneline -3 origin/main` antes de tocar nada.
27. **La auditoría de idiomas solo ve las tablas.** Un literal en español
    metido en una plantilla no lo caza ninguna comprobación de claves: las
    cabeceras del buscador decían «17 paradas» en los ocho idiomas y tres
    textos del planificador iban en español fijo. Lo vi en una captura, no en
    el arnés. Ahora hay un control de literales visibles sin `L_`/`tx()`.
28. **Un número en la interfaz tiene que ser el que se pinta.** La cabecera
    contaba 17 coincidencias y la lista se recortaba a 15 sin decirlo.
29. **Un control que da un falso positivo acaba enseñando a ignorarlo.** El
    barrido marcaba `window.open` sin `noopener` porque el regex cortaba en el
    primer `)`, dentro de `encodeURIComponent(...)`. Se equilibran los
    paréntesis: un aviso que siempre es mentira es peor que no tenerlo.
30. **Que un parche verifique su método no verifica su resultado.** El cruce de
    municipios traía tres comprobaciones correctas del shapefile —bbox, área,
    31 municipios— y aun así asignaba **Tegueste al revés**: quería mover a La
    Laguna 15 paradas que ya estaban bien, entre ellas la parada llamada
    «Tegueste», y se dejaba otras 30. Se rehizo el cruce entero por separado.
    El control que lo caza no es repetir el método: es que **cero paradas caigan
    en dos polígonos** y que las 2.514 caigan en alguno.
31. **Una ficha de playa no viaja sola: arrastra sus satélites.** El convenio
    del fichero es que la webcam, la ficha de surf y la de accesibilidad
    comparten la coordenada exacta de su playa —hay **114 pares** así—. Mover
    solo la playa deja el satélite en el sitio viejo: al corregir Benijo, su
    webcam y su pico de surf se habrían quedado clavados **encima de Almáciga**,
    dos chinchetas con «Benijo» escrito sobre la playa de al lado. Antes de
    mover un `lat`/`lng` se listan los POI a menos de 80 m.
32. **La coordenada se contrasta con un dato ajeno, no con el mapa de memoria.**
    Las paradas de TITSA sirven de testigo independiente: el pin viejo de
    Almáciga estaba a 78 m de la marquesina «Las Bajas» y a 1.118 m de «Playa de
    Almáciga»; el nuevo, a 31 m de esta última. Y la geometría `via` prueba que
    un punto cae en tierra: la calzada está en tierra, y los cuatro nuevos
    quedan a 24, 338, 211 y 47 m de una carretera real.
33. **Una tolerancia de un rumbo entero no es un control.** Con 8 rumbos,
    aceptar «separación ≤ 45°» deja pasar un método corrido un puesto entero,
    que es justo el error a cazar. `tools/orientacion.py` informa por separado
    el acierto exacto: 10 de 22, frente a 16 de 22 con la tolerancia ancha.
34. **La resolución de la costa manda sobre el algoritmo.** El corte es limpio:
    todas las orientaciones que el método acierta están a ≤ 210 m del polígono
    de GSHHG y todas las que falla, a ≥ 247 m. Cinco playas están 250–541 m
    tierra adentro del polígono, así que las dos normales caen en tierra y no
    hay lado de mar; Las Américas cae **fuera**, en lo que GSHHG cree mar.
    Afinar el radio no lo arregla: de 100 a 800 m el techo es 13 de 22.
35. **Lo que la app promete offline hay que probarlo offline.** `sw.js` tenía
    las teselas del mapa en la lista de «no cachear nunca», junto a las APIs
    del tiempo, con el argumento de «siempre fresco». Una tesela no es un dato
    vivo: es contenido, como la Wikipedia, que esa misma lista ya dejaba pasar.
    Resultado: en un avión la app arrancaba entera —fichas, buscador, líneas—
    y **el mapa salía en blanco**, que es lo único que no se puede sustituir.
    Ninguna auditoría lo vio porque todas se pasan con red.
36. **Un botón que no encuentra su caché miente sin fallar.** «Vaciar caché del
    mapa» filtraba por el prefijo `tenerife-tiles-`, que no ha existido nunca:
    decía «Caché del mapa vaciada» y no borraba nada. Es el mismo fallo que ya
    se había corregido en `CLEAR_CACHES` y que se quedó a medias.
37. **El caché del mapa tiene que sobrevivir a las actualizaciones.** El
    manejador de `activate` borra todo caché cuyo nombre no sea el suyo; si las
    teselas vivieran ahí, cada versión nueva dejaría al usuario sin mapa
    offline justo cuando actualiza. Por eso van en `tgo-teselas-v1`, aparte, y
    `activate` lo respeta expresamente.
38. **Una respuesta opaca no es `ok`.** Las capas no piden CORS, así que lo que
    llega al service worker es `type:'opaque'`, `status:0`, `ok:false`. El
    `guardable()` de siempre la rechaza, así que aunque se quitara la
    exclusión no se habría guardado ni una tesela. Hay que aceptarla aparte —y
    `Cache.put()` sí la admite, comprobado en Chromium con un segundo puerto,
    que ya cuenta como otro origen.
42. **Un fichero binario generado tiene que salir igual cada vez.**
    `mapa/tenerife-base.pmtiles` daba 4 bytes distintos entre dos
    generaciones seguidas, y eso son 1,1 MB de diff binario en el repositorio
    cada vez que se regenere sin que haya cambiado un dato. Es la hora que
    gzip mete dentro de cada bloque, y dos de ellos —el directorio raíz y los
    metadatos— los comprime la propia librería PMTiles, donde no se puede
    pasar `mtime`. Se fuerza para todo el proceso. **No era el
    `PYTHONHASHSEED`**: se probó con la semilla fija y salían los mismos 4
    bytes. El control lo mira **sobre el fichero**, no sobre el generador:
    222 bloques gzip, ninguno con hora.
43. **La lista de capas estaba escrita cuatro veces.** En `setLang`, en
    `setStyleFromMenu`, en `cycleMapLayer` y en el HTML. Así es exactamente
    como se añade una quinta y se olvida una. Ahora vive en `LAYER_IDS` y las
    etiquetas salen de `etiquetasCapas()`.
44. **`let` no se hoistea: tiene zona muerta temporal.** El arranque sin red
    llamaba a `irAIslaSinRed()` desde antes de la línea que declara
    `_capaElegidaAMano`, así que habría reventado justo en el único caso que
    importa. Las dos llamadas de arranque van después de las declaraciones.
45. **Una prueba puede medir el contenedor en vez del código.** El control de
    «al volver la red, vuelve la capa que había» fallaba: volvía a Calles, las
    teselas de OSM no se alcanzan desde aquí, fallaban seis veces y el propio
    automatismo devolvía a la isla. Correcto, pero no era lo que se quería
    medir. Se le da a la capa una URL local que sí responde, y así el único
    camino vivo es el que se prueba.
46. **`caches.open()` crea el caché con solo mirarlo.** Preguntar si había
    mapa detallado dejaba un caché vacío en cada arranque, que se contaba en
    «Cachés activas» y reaparecía justo después de borrarlo. Primero
    `caches.has()`, y solo entonces `open()`.
47. **Un banco de pruebas que se queda puesto es un mapa falso servido como
    bueno.** El bloque 4 se prueba copiando `tools/datos/prueba-osm.pmtiles`
    a `mapa/tenerife-osm.pmtiles`. Se retira en un `finally`, y además la
    auditoría empieza comprobando que lo que hay ahí no lleva la marca
    `BANCO DE PRUEBAS` de una ejecución anterior que muriera a medias.
48. **Contar lienzos no es ver el mapa.** Si el esquema del `.pmtiles` y el
    del estilo no son de la misma generación, los lienzos se crean y salen
    **vacíos**: mapa en blanco sin un solo error. Comparar números de versión
    no sirve —no siempre están y no dicen lo que importa—. Se mide: se cuentan
    los píxeles que no son el color de fondo que declara el propio estilo. Un
    fichero de OpenMapTiles da 9 lienzos y **0,00 %**; uno bueno, 99,99 %.
49. **Un `except` amplio convierte un fallo de programación en un aviso.** En
    `verificar_osm.py`, la sección que lee tiles envolvía también sus
    conclusiones: un `TypeError` al escribirlas salió como AVISO y el script
    terminó en verde. Pasó de verdad mientras se editaba. El `try` cubre ahora
    solo la lectura.
50. **El centro de la caja de Tenerife es la caldera del Teide.** Muestrear
    ahí para comprobar que hay senderos da un bloqueante falso. Se miran cinco
    puntos y basta con que uno los traiga.
51. **Una mayúscula que no da error.** El censo publica la calidad del agua
    como «Excelente»; el código la indexa por `excelente`. Tal cual, la
    insignia **no sale y no falla nada**. Se normaliza al importar y hay un
    control que rechaza cualquier valor fuera de los tres.
52. **Una guarda que mira solo el trozo emparejado no es una guarda.** Al
    añadir `aguaCalidadAnio` a las fichas que no lo tenían, la comprobación
    de «¿ya lo lleva?» miraba `m.group(0)`, que era solo `aguaCalidad:"…"` y
    nunca contiene el año: 15 fichas se llevaron el campo dos veces. JS lo
    tolera —gana el último—, así que no falló nada. Se vio contando
    apariciones (61) contra fichas (46).
53. **`lifeguard: null` es «no se sabe», y eso hay que dejarlo dicho.**
    `badgeSocorristas` solo pinta con `true` o con `false`, así que `null` no
    afirma nada. Es deliberado: una reseña que menciona socorristas no es
    fuente. El control acepta solo esos tres valores, para que nadie lo
    convierta en `false` por parecer más limpio.
54. **Un número escrito a mano en un control se pone rojo solo.** «y los 765
    lugares siguen encima» se puso en rojo al entrar 40 playas. El número
    sale ahora del propio fichero.
55. **`Range` no hace falta aquí, pero eso hay que probarlo.** PMTiles suele
    leer por rangos, y sin *byte serving* el mapa sale en blanco sin error. La
    app construye la capa sobre un `Blob` y nunca sobre una URL, así que no
    depende de ello —pero basta con que alguien pase una URL para que la
    dependencia vuelva sin que nada falle en local. El control graba **todas**
    las peticiones mientras se carga la capa y falla si alguna lleva `Range`.
56. **Un plural construido a mano dentro de una plantilla se escapa de todo.**
    `` `${n} lugar${n !== 1 ? 'es' : ''}` `` no tiene acentos ni dos palabras
    funcionales, así que ninguna de las dos reglas del control lo veía, y no
    es una clave que falte: es un literal. Había **tres** en el buscador de
    lugares —el contador de la barra, el de la hoja de categorías y la
    cabecera de sugerencias—, en español para los ocho idiomas. Hay un
    control específico para esa forma, y las claves nuevas separan singular y
    plural con `|`, que el chino resuelve con una sola forma.
57. **Una cifra en un documento caduca sin que nada avise.** «31 tablas, 404
    filas» se quedó atrás dos veces en una tarde. Ahora `auditar_web.js`
    coteja ese par contra `AUDITORIA-FINAL.md` y tumba la auditoría si no
    coinciden: saltó en el acto al añadir dos claves.
58. **Cincuenta avisos de seguridad que no se veían.** `warn:"mar"` no
    pintaba nada en ninguna playa: el banner se suprimía si el POI tenía
    panel de mar, «porque el aviso ya se muestra dentro del desplegable». No
    era cierto. El panel lo lleva **todo** POI costero, tenga aviso o no, así
    que no distingue nada; lo que enseña es un texto **genérico por idioma**,
    no el de esa ficha —el que dice «Mar con oleaje y corrientes»—; va
    plegado; y su contenido depende de la API marina, así que **sin conexión
    no sale nada**. Justo lo contrario de lo que un aviso de seguridad tiene
    que hacer. Ahora el banner se pinta siempre, y el genérico del panel se
    calla cuando la ficha trae el suyo. Hay control en navegador: se abren
    dos fichas, una con aviso y otra sin él.
59. **Un comentario puede ser la causa del fallo, no solo su síntoma.** Ese
    `return` llevaba al lado una explicación que sonaba razonable y que era
    falsa, y por eso nadie la miró. La trampa 19 decía que un comentario
    obsoleto es peor que ninguno; este además justificaba el error.
39. **Un control estrecho enseña que no hay nada que buscar.** El de literales
    en español solo miraba `.textContent`/`.innerText`/`.placeholder` y una
    lista de sustantivos. Los 25 textos del módulo PWA iban por `innerHTML`,
    `confirm()` y `alert()`, así que pasaba en verde con el panel entero en
    español. Ahora mira también los diálogos y los atributos, y decide si un
    texto es español por acentos o por dos palabras funcionales: `'⏳
    Localizando…'` no tiene ninguna palabra de ninguna lista.
40. **Y ahora tumba la auditoría.** Un aviso que solo se imprime acaba
    ignorándose, y esto es exactamente lo que se cuela sin que nadie lo mire.
    El panel de administración queda fuera a propósito —va solo en español— y
    se localiza por sus marcas, no por número de línea, que se mueve solo.
41. **Un elemento que se crea una vez se queda en el idioma de entonces.** El
    banner de instalar y el aviso de versión nueva se cachean en una variable
    y se reutilizan. El texto se pinta aparte y se vuelve a pintar cada vez que
    se muestran; y se construye con nodos y `textContent`, no con `innerHTML`,
    para dejar el DOM igual que antes —un `<b>` y un nodo de texto suelto—, que
    es de lo que depende el CSS del banner.

42. **`innerHTML` pinta texto igual que `textContent`.** El control de
    literales en español no lo miraba, y por ahí salían el «Sin foto en
    Wikipedia» de 270 fichas y los dos rótulos de espera del panel de rutas.
    Ahora `CTX` cubre `innerHTML`, `insertAdjacentHTML` y los avisadores.
43. **Un contexto medido en caracteres cruza sentencias.** Mirar 140
    caracteres hacia atrás para ver si hay un `||` de respaldo hacía que un
    literal quedara excusado por el respaldo de **otra** sentencia. El
    contexto se corta ahora en el `;`, la llave o el salto de línea.
44. **Un `showMessage(elemento, tipo, texto)` no se caza nombrando la
    función.** La expresión regular se para en el primer literal de la
    llamada —`'error'`—, lo descarta por no ser español y no mira el
    siguiente, que es el que se lee. Hay que recorrer **todos** los literales
    de la llamada.
45. **Quitar una palabra traducida buscándola en español solo funciona en
    español.** `titulo.replace('PRÓXIMAMENTE','')` no quitaba nada en los
    otros siete, y el texto de la etiqueta se colaba en el nombre y en el id
    del producto. Se quita **el nodo**, no la palabra.
46. **Un control que revienta no es un control.** El bloque nuevo llamaba a
    `wikiDominio()` a pelo: contra el código viejo lanzaba `ReferenceError`,
    tumbaba el proceso y se llevaba por delante los otros tres resultados del
    mismo bloque. Con `typeof` delante, dice MAL y los otros tres se leen.
47. **Un mensaje de depuración enseñado a todo el mundo deja de ser de
    depuración.** El «Sin foto en Wikipedia» rojo llevaba un comentario que
    decía «(para debug)», y el CSS ya traía `.popup-photo.hidden` desde el
    principio para ese caso. Lo mismo con el `Error: ${err.message}` crudo:
    ni está traducido ni le dice nada a quien está en la playa. Va a la
    consola, que es donde se depura.

---

# 5 · Cómo se vuelve a medir

```bash
bash tools/auditar.sh                # todo: sintaxis, red, datos, seguridad, idiomas
```

Y cada bloque por separado, si hace falta:

| | |
|---|---|
| `tools/cargar.js` | cargador comun: devuelve la red **ya hidratada** |
| `tools/verificar_red.js` | los 10 controles de la red |
| `tools/auditar_datos.js` | catálogo, líneas, trazado y lugares |
| `tools/auditar_seguridad.py` | inyección, CSP, codificación, textos fijos y tipografía china |
| `tools/auditar_xss.js` | regresión con datos hostiles, en navegador |
| `tools/auditar_web.js` | idiomas, arranque y rendimiento, en navegador |
| `tools/extract_js.py` | extrae los `<script>` para `node --check` |
| `tools/gtfs_red.py` | regenera la red desde un GTFS completo |
| `tools/orientacion.py` | deduce orientación de playa desde la costa · **suspendido por su propio control** |
| `tools/auditar_sw.js` | el service worker en un ámbito falso: mapa sin conexión, tope y actualizaciones |
| `tools/auditar_mapa.js` | el mapa sin conexión, bloque a bloque |
| `tools/mapa_base.py` | genera `mapa/tenerife-base.pmtiles` desde los datos del propio repositorio |
| `tools/mapa_prueba_osm.py` | banco de pruebas con el esquema de Protomaps, para poder probar el bloque 4 |
| `tools/verificar_osm.py` | revisa un `.pmtiles` de OSM antes de subirlo · 7 pasos |
| `tools/verificar_estilo.js` | mide si ese fichero **se ve** con el estilo que lleva la app |

`tools/gtfs_red.py` regenera la red desde un GTFS completo. Necesita
`routes.txt`, `trips.txt`, `stops.txt`, `stop_times.txt` y `shapes.txt`; con
`calendar_dates.txt` además saca horarios y frecuencias de un día real.

## Fuera del repo — hay que mirarlo en Supabase

- **RLS es la única defensa de `favorites`.** El cliente envía `user_id` él
  mismo. Sin una policy `auth.uid() = user_id` en INSERT, UPDATE, DELETE **y**
  SELECT, cualquiera con la clave `anon` —que es pública por diseño— puede leer
  o escribir los favoritos de otros.
- **`push_subs` debe ser insert-only.** Si esa policy no existe, la lista de
  endpoints push es descargable.
- **El panel admin no es un control de seguridad.** El hash vive en el
  `localStorage` del propio dispositivo y todo el gate es cliente. No pasa nada
  mientras los datos sigan siendo locales, pero no debe convertirse en la puerta
  de nada que viva en el servidor.
- **Privacidad**: las coordenadas GPS exactas del usuario se envían a
  `router.project-osrm.org` (servidor de demostración público) y a
  `nominatim.openstreetmap.org`, cuya política pide un User-Agent identificable.
