# Tareas abiertas

Estado medido el **12 de agosto de 2026, 20:40 UTC**, commit `167d864`.
Todas las cifras salen de ejecutar la app en un navegador, no de recordarla.

```
index.html   md5 2e2fbd2c22f874cf363bb1ee03b6ba95
             3.371.947 bytes
```

**Comprueba ese md5 antes de analizar nada.** Ha pasado tres veces que se ha
trabajado sobre una copia vieja y el diagnóstico salía bien pero las cifras no
cuadraban con el fichero real.

Y **el enlace de GitHub no sirve** para pasárselo a otra sesión: `/raw/` y
`raw.githubusercontent.com` bloquean el acceso automatizado. Hay que subir el
fichero.

## Estado actual

| | |
|---|---|
| Lugares | **765** · 0 duplicados · 0 idiomas sin traducir |
| Playas | 39 fichas · **34** en el panel de «báñate hoy» |
| Guaguas | 177 líneas · 694 paradas |
| Socorristas | 24 fichas con servicio · **11 con horario** |
| Textos de interfaz | 148 claves × 8 idiomas · **0 sin traducir** |
| Bloques de script | 31 · todos correctos · 0 errores de consola |

---

## 1 · Necesita dato de fuera

### 1.1 · Horario de socorristas en 13 playas

Hay 24 fichas con servicio y 11 con horario: Arona ×2, Adeje ×6, La Laguna ×3
—estas últimas son las piscinas naturales de Bajamar, Punta del Hidalgo y
Jóver, no playas—. Faltan estas trece:

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

**Cuidado con la vía «oficial» que apunté antes.** Escribí que el artículo 19.3
del Decreto 116/2018 obliga a los Ayuntamientos a comunicar esos horarios cada
año, y que por tanto existían recopilados en un solo sitio. **Ese Decreto está
anulado** (ver abajo), así que esa obligación no está vigente y esa vía no
existe tal como la describí. El contacto útil es la Dirección Técnica del
Encargo de Playas del Gobierno de Canarias, a través de GESPLAN.

Sin ese dato no pasa nada malo: esas trece siguen con la etiqueta neutra y el
enlace al visor oficial.

### 1.2 · 17 paradas intermedias de guagua

Están en `BLOQUE-2.md`, marcadas con `___`, cada una con el tramo en el que
tiene que caer. Son 18 filas pero **17 paradas distintas**: *La Camella* sale
en la 421 y en la 480.

**Ya solo afectan al buscador**, no al mapa: desde el trazado por tramos, todo
salto de más de 6 km se dibuja discontinuo y no afirma un recorrido que la
guagua no hace. Cuando entre una parada, su tramo pasa a continuo solo.

Las cuatro que más cambian, porque hoy se dibujan discontinuas:

```
417  Costa Adeje → Guía de Isora     13,3 km   ← el peor salto
421  Valle San Lorenzo → Galletas     9,2 km
474  Granadilla → Vilaflor → Arona    7,9 km
482  Vilaflor → La Escalona → Arona   6,5 km
```

Formato: `Adeje casco = 28.xxxxxx, -16.xxxxxx`. Cada una se mide contra su
tramo antes de aplicarla.

### 1.3 · Qué playas sacar del modelo angular

De las 34 del panel de baño, 28 puntúan **por ángulo** entre su orientación y
el viento, y 6 están escritas a mano.

Cuidado, que esto cambió: en una entrada con `deducida: true`, **`badWind` ya
no lo lee nadie** — comprobado vaciándolo, 0 de 8 vientos cambian. Afinar el
`badWind` de una de las 28 no hace nada. Para meter conocimiento local hay que
quitarle `deducida` y entonces escribirle su `badWind`, como Playa Amarilla o
Teresitas.

Así que lo que hace falta no es «afinar badWind» sino: **qué playas merecen
salirse del modelo** porque un dique, un espigón o un saliente hacen algo que
la geometría no ve.

---

## 2 · Decidido que NO se hace

1. **Clasificación sanitaria como dato fijo en la ficha.** Playa Jardín estuvo
   catorce meses diciendo «baño prohibido» con la playa abierta. El estado del
   agua va al visor oficial, que es dato vivo.
2. **Mareas en metros.** Solo horas y sentido: la altura de Open-Meteo va sobre
   el nivel medio global, no sobre el cero hidrográfico.
3. **Escuelas de surf con nombre.** Son negocios y no se puede comprobar que
   existan ni que operen ahí.
4. **Frases que congelan un presente.** «Hoy está abierta», «recientemente
   renovado». Un hecho fechado no caduca; un estado presente escrito a mano, sí.
5. **Números escritos a mano en la interfaz.** Si el dato no se ha contado, no
   se enseña. Un 765 fijo en la portada miente en cuanto cambian los lugares.

---

## 3 · Trampas, por si alguien vuelve a tocar esto

1. **Una norma publicada no es una norma vigente.** El Decreto 116/2018, que
   regulaba las banderas de playa, **fue anulado** por sentencia del Tribunal
   Supremo de 27/9/2023, publicada en el BOC 82 del 25/4/2024. Seguía colgado
   en las webs oficiales y en el visor de playas, y se usó como fuente para la
   leyenda de banderas: el resultado decía que la bandera amarilla significaba
   «playa clasificada peligrosa» cuando significa «báñate con precaución».
   Antes de escribir en la app nada sacado de un boletín oficial, comprobar que
   no esté anulado ni derogado.
2. **`scorePlaya` no recibe la entrada de `PLAYAS_ORIENTACION`.** El objeto se
   copia campo a campo **dos veces** — en `renderBanoHoy` y otra vez en
   `fetchPlayasHoy`. Cualquier criterio nuevo hay que propagarlo en los dos
   sitios o la lógica que dependa de él **no se ejecuta nunca y nada falla**.
   Ya pasó con `deducida` y con `lifeguard`.
3. **Playa Jardín tiene DOS fichas**: `playa-jardin` y `surf-playa-jardin`.
4. **`lifeguard` tiene tres estados, no dos.** `false` **afirma** que no hay
   socorrista y pinta un aviso; ausente o `null` no afirma nada y no pinta
   badge. Sin dato firme, el correcto es el neutro.
5. **El caché de 30 min** del panel de baño hace que una prueba mienta si no se
   limpia `tgo_bano_cache_v2` entre escenarios.
6. **Open-Meteo devuelve la hora ya en zona canaria y sin sufijo.**
   `Date.parse` la toma como local y al reformatear se suma el desfase dos
   veces.
7. **Contar cadenas en un fichero de 3 MB es mal método.** Varias
   comprobaciones fallaron por contar la palabra dentro del propio comentario
   que la explica, o por suponer el número en vez de medirlo.
8. **Un comentario que describe lo que el código ya no hace es peor que no
   tenerlo.** Al tocar el código, tocar el comentario.
9. **Un nombre de sitio no es un dato hasta que tiene coordenada y esa
   coordenada cae donde debe.** De cuatro playas apuntadas como «faltan», una
   era de Fuerteventura y otra no existía. El control que las descubre es
   cruzar contra nuestros propios 765 lugares.
10. **`index.html` suelto no es la app.** Desde el 31 de julio, Leaflet vive en
    `vendor/` en vez de un CDN, así que el fichero solo no arranca el mapa. Para
    verlo funcionando, la app publicada. Para dárselo a Claude, el fichero vale:
    lo lee, no lo ejecuta.
11. **No dejar arreglos de circunstancia.** Se metieron tres cambios en el
    contador de la portada persiguiendo un «0 lugares» que resultó ser un visor
    sin JavaScript. Se revirtieron. Un cambio que resuelve un caso que no
    existe se queda puesto para siempre porque nadie se acuerda de quitarlo.
