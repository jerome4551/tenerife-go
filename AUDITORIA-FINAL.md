# Estado del proyecto y auditoría

**25 de agosto de 2026.** Documento único: dónde está la app, qué se ha
comprobado y qué falta. Sustituye al registro por fechas que había antes, y a
`BLOQUE-2.md` y `COORDENADAS.md`, cuyas listas están cerradas.

Todas las cifras salen de ejecutar la app o barrer el fichero. Ninguna está
recordada. Se vuelven a sacar con lo que hay en `tools/`.

```
index.html   md5 7233fe61df530a4564357c913c587eb3
             4.170.684 bytes · 1.272.059 comprimidos · 34.478 líneas
```

---

# 1 · Qué hay

| | |
|---|---|
| Lugares | **765**, con descripción y categoría en 8 idiomas |
| Líneas | **183** — las 181 del GTFS de TITSA + L1 y L2 del tranvía |
| Paradas | **6.263** referencias sobre un catálogo de **2.514** marquesinas |
| Idiomas | es · en · fr · de · it · nl · zh · zht |
| Ficheros | 41 en el repo · Leaflet y MarkerCluster auto-alojados en `vendor/` |

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

## Idiomas · 30 tablas, 359 filas

Las tablas se declaran con `const`, así que **no están en `window`**: hay que
alcanzarlas por nombre desde el ámbito global, y las 22 que viven dentro de una
función hay que sacarlas del fuente. Un barrido que solo recorra `window`
encuentra 2 de 30.

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
| Lugares completos (id, nombre, categoría, coordenada, color, emoji) | **765** |
| Ids de lugar que cumplen `[a-z0-9-]` | **765** |
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
- **La secuencia del tranvía** sigue deducida de `parada_id`, no publicada. El
  GTFS de Metropolitano lo cerraría. El trazado sí es real (L1 4 m, L2 0 m).

## Se puede hacer, hace falta un dato

- **73 paradas sin municipio.** No se puede sacar del GTFS: `stops.txt` solo
  tiene `stop_id, stop_name, stop_lat, stop_lon, stop_url`. La vía limpia es
  cruzar la coordenada con los **polígonos de término municipal** del IGN o
  IDECanarias — no es geocodificar por nombre, es mirar dentro de qué límite
  oficial cae un punto que ya tenemos.
- **19 líneas sin precio**: las 18 añadidas en agosto y la 449. El GTFS no trae
  `fare_attributes.txt` ni `fare_rules.txt`, así que la tarifa no se puede
  medir. El globo ya no pinta el `💶` suelto cuando falta.

## Decisión pendiente

- **351 rótulos repetidos, que son 863 paradas.** El GTFS llama «Cementerio» a
  nueve paradas repartidas en 47 km. Ninguno es par ida/vuelta a menos de 80 m:
  son sitios distintos de verdad. La fila del buscador pinta el rótulo y las
  líneas pero **no el municipio**, que sí está en el catálogo para 2.441 de las
  2.514. Añadirlo a la fila las distingue sin inventar nada.
- **210 marquesinas del catálogo no las usa ninguna línea.** Están porque el par
  ida/vuelta las agrupa y su hermana es la que aparece. No estorban, pero
  conviene saber por qué están.
- **Alcalá y el empate de alisios** en el panel de baño.

## Cerrado

- **Las 35 líneas sin verificar**: 22 regeneradas del GTFS y 13 borradas por no
  existir en él. Ya no queda ninguna línea con paradas escritas a mano.
- **Las 18 paradas de `COORDENADAS.md`**: 15 están en la red, y «Realejo Alto»,
  «Suárez Guerra» y «Adeje casco» **no existen con ese nombre en `stops.txt`**.
- **Las 14 filas de `BLOQUE-2.md`**: resueltas por la reconstrucción.
- **`stop_code` / `stop_desc`**: confirmados ausentes del GTFS de TITSA.

---

# 4 · Trampas, por si alguien vuelve a tocar esto

1. **Leer `TITSA_LINES` en crudo no da paradas.** `paradas` es una lista de
   claves y solo se convierte en objetos al hidratar. Un script que mida `p.lat`
   sin hidratar **no falla: devuelve `undefined` y da cifras falsas**. Pasó tres
   veces, una dando «0 de 14» donde eran 7. Usa un cargador que hidrate siempre.
2. **Medir al vértice no es medir al trazado.** Con Douglas-Peucker los vértices
   quedan lejos en las rectas, así que la distancia al vértice más cercano infla
   muchísimo: dio «paradas a 1,5 km de su línea» donde al **segmento** eran 0 m.
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
    inline solo son seguros porque los 765 ids cumplen `[a-z0-9-]`.
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

---

# 5 · Cómo se vuelve a medir

```bash
node tools/verificar_red.js          # los 10 controles de la red
python3 tools/extract_js.py && for f in chk/*.js; do node --check "$f"; done
```

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
