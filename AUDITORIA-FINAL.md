# Estado del proyecto y auditoría

**25 de agosto de 2026.** Documento único: dónde está la app, qué se ha
comprobado y qué falta. Sustituye al registro por fechas que había antes, y a
`BLOQUE-2.md` y `COORDENADAS.md`, cuyas listas están cerradas.

Todas las cifras salen de ejecutar la app o barrer el fichero. Ninguna está
recordada. Se vuelven a sacar con lo que hay en `tools/`.

```
index.html   md5 b055efba98cf857478fb958717a72d7d
             4.241.973 bytes · 1.281.419 comprimidos · 34.478 líneas
```

---

# 1 · Qué hay

| | |
|---|---|
| Lugares | **805**, con descripción y categoría en 8 idiomas |
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

## Idiomas · 31 tablas, 422 filas

Las tablas se declaran con `const`, así que **no están en `window`**: hay que
alcanzarlas por nombre desde el ámbito global, y las que viven dentro de una
función hay que sacarlas del fuente. Un barrido que solo recorra `window`
encuentra 2 de 31.

El módulo PWA —banner de instalar, aviso de versión nueva y el panel de la ⓘ
entero— **iba fijo en español en los ocho idiomas**: 25 textos. Ya está en
`PWA_TX`, con la misma forma que `UI_TX`, así que la auditoría de idiomas lo
recorre sola. Y con el control ampliado salieron 12 más sueltos por la app
(tienda, GPS, portapapeles, «Cómo llegar»), también traducidos.

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
| Lugares completos (id, nombre, categoría, coordenada, color, emoji) | **805** |
| Ids de lugar que cumplen `[a-z0-9-]` | **805** |
| Con calidad de agua, y su año | **46** · 46 |
| Con alias de búsqueda, que los 3 filtros leen | **58** |
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

**El peso es el problema real, y no es el GTFS.** De los 1,27 MB comprimidos,
más de la mitad son los textos de `places` en ocho idiomas, de los que cada
usuario lee uno. Servir solo el idioma activo ahorraría del orden de 900 kB sin
comprimir, pero rompe el fichero único y el funcionamiento sin conexión: es una
decisión de arquitectura, no un arreglo.

---

# 3 · Lo que falta

## Bloqueado por terceros

- **13 horarios de socorrista**, esperando a la empresa. `lifeguard` tiene tres
  estados y `false` **afirma** que no hay socorrista: ausente no afirma nada.
- ~~la secuencia del tranvía~~ **cerrado, ver abajo**.

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
- **Troya, Los Cristianos y Porís no están en `PLAYAS_ORIENTACION`**, así que
  reciben panel de mar pero no puntúan en «¿dónde me baño hoy?». Añadirlas pide
  su orientación, que no se inventa. **Se intentó deducirla de la geometría de
  costa y el control lo tumbó**: `tools/orientacion.py` reproduce 10 de las 22
  orientaciones que ya existen, así que no se acepta ninguna nueva. El fallo es
  de la costa, no del método —GSHHG a resolución «full» es lo mejor que pasa el
  proxy y se come las calas—. Sigue pendiente, y lo desbloquea un dato: el
  shapefile municipal del Cabildo o cualquier costa con fidelidad ≤ 50 m.
- **22 de las 34 orientaciones de playa son `deducida`**, sacadas del abanico
  de rayos, que mira a 4, 6 y 8 km y por eso es ciego a lo que abriga en el
  primer kilómetro. Las 12 escritas a mano son las fiables.

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
| 4 | descarga opcional de un `.pmtiles` de OSM para el detalle fino | hecho · **falta el fichero** |

**Por qué `protomaps-leaflet` y no MapLibre.** MapLibre obliga a rehacer el
mapa entero y con él los 805 marcadores, los clusters y las 183 polilíneas.
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
12 teselas** con los 805 lugares encima. Sin una sola excepción.

**Cuándo entra.** Con conexión no cambia nada: se arranca en Calles y el
fichero **ni se descarga**. La capa entra sola en dos casos —arrancar sin red,
o seis fallos seguidos de teselas, que ya no es un hueco suelto— y se va sola
cuando vuelve la red. Con dos reglas para no pelearse con el usuario: **si
elige capa a mano, no se le cambia nunca más**, y se recuerda cuál tenía para
devolvérsela.

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
    inline solo son seguros porque los 805 ids cumplen `[a-z0-9-]`.
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
    leyenda de banderas.
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
