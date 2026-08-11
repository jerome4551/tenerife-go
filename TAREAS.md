# Tareas abiertas

Estado medido el **11 de agosto de 2026**, commit `6b5070a`.
Todas las cifras salen de ejecutar la app en un navegador, no de recordarla.

```
index.html   md5 6e0c5e10f0f575adc64004d10c773d59
             3.391.233 bytes · 31.671 líneas
```

**Comprueba ese md5 antes de analizar nada.** Ha pasado tres veces que se ha
trabajado sobre una copia vieja y el diagnóstico salía bien pero las cifras del
informe no cuadraban con el fichero real.

## Estado actual

| | |
|---|---|
| Lugares | **765** · 0 duplicados · 0 idiomas sin traducir |
| Playas | 39 fichas · **34** en el panel de «báñate hoy» |
| Guaguas | 177 líneas · 694 paradas |
| Socorristas | 24 fichas con servicio · **11 con horario** |
| Textos de interfaz | 157 claves × 8 idiomas · **0 sin traducir** |
| Errores de consola | 0 |

---

## 1 · Con fecha: borrar el eclipse

**El 13 de agosto**, en cuanto pase el eclipse del día 12. Son tres cosas y no
las usa nada más:

- en `index.html`, el bloque `ECLIPSE PARCIAL DE SOL` al final del fichero
- el fichero `.github/workflows/eclipse.yml` entero
- el fichero `enviar-eclipse.js`

Mientras tanto se apagan solos: el bloque tiene `hasta:'2026-08-13'` y los
crons ya han pasado. El aviso del lunes salió (3 suscripciones, 3 enviados).

---

## 2 · Necesita dato de fuera

### 2.1 · Horario de socorristas en 13 playas

Hay 24 fichas con servicio y 11 con horario: Arona ×2, Adeje ×6, La Laguna ×3.
Faltan estas trece:

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

**Hay una vía oficial y única.** El artículo 19.3 del Decreto 116/2018 obliga a
cada Ayuntamiento a comunicar al Gobierno de Canarias, en el primer trimestre
de cada año y **playa por playa**, las temporadas de afluencia y los horarios
del Servicio de Salvamento. Es decir: los trece existen, están recopilados y
son oficiales. No hace falta preguntar a trece empresas.

Sin ese dato no pasa nada malo: esas trece siguen con la etiqueta neutra y el
enlace al visor oficial, que no miente.

### 2.2 · 17 paradas intermedias de guagua

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

### 2.3 · Qué playas sacar del modelo angular

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

### 2.4 · Las tres banderas generales, si aparece más norma

La leyenda de banderas ya está completa con el Decreto 116/2018 (art. 9 y
Anexo III) y la Orden de 22/7/2022. No falta nada, pero si algún día se
modifica el artículo 9, hay que tocar las 17 claves × 8 idiomas.

---

## 3 · Decidido que NO se hace

1. **Clasificación sanitaria como dato fijo en la ficha.** Playa Jardín estuvo
   catorce meses diciendo «baño prohibido» con la playa abierta. El estado del
   agua va al visor oficial, que es dato vivo.
2. **Mareas en metros.** Solo horas y sentido: la altura de Open-Meteo va sobre
   el nivel medio global, no sobre el cero hidrográfico.
3. **Escuelas de surf con nombre.** Son negocios y no se puede comprobar que
   existan ni que operen ahí.
4. **Aplicar nosotros la fórmula de riesgo del Anexo I** (afluencia ×
   peligrosidad). Sería fabricar una clasificación oficial con números propios.
5. **Frases que congelan un presente.** «Hoy está abierta», «recientemente
   renovado». Un hecho fechado no caduca; un estado presente escrito a mano, sí.

---

## 4 · Trampas, por si alguien vuelve a tocar esto

1. **`scorePlaya` no recibe la entrada de `PLAYAS_ORIENTACION`.** El objeto se
   copia campo a campo **dos veces** — en `renderBanoHoy` y otra vez en
   `fetchPlayasHoy`. Cualquier criterio nuevo hay que propagarlo en los dos
   sitios o la lógica que dependa de él **no se ejecuta nunca y nada falla**.
   Ya pasó con `deducida` y con `lifeguard`.
2. **Playa Jardín tiene DOS fichas**: `playa-jardin` y `surf-playa-jardin`.
3. **`lifeguard` tiene tres estados, no dos.** `false` **afirma** que no hay
   socorrista y pinta un aviso; ausente o `null` no afirma nada y no pinta
   badge. Sin dato firme, el correcto es el neutro.
4. **El caché de 30 min** del panel de baño hace que una prueba mienta si no se
   limpia `tgo_bano_cache_v2` entre escenarios.
5. **Open-Meteo devuelve la hora ya en zona canaria y sin sufijo.**
   `Date.parse` la toma como local y al reformatear se suma el desfase dos
   veces.
6. **Contar cadenas en un fichero de 3 MB es mal método.** Varias
   comprobaciones fallaron por contar la palabra dentro del propio comentario
   que la explica, o por suponer el número en vez de medirlo.
7. **Un comentario que describe lo que el código ya no hace es peor que no
   tenerlo.** Al tocar el código, tocar el comentario.
8. **Un nombre de sitio no es un dato hasta que tiene coordenada y esa
   coordenada cae donde debe.** De cuatro playas que se apuntaron como «faltan»
   una era de Fuerteventura y otra no existía. El control que las descubre es
   cruzar contra nuestros propios 765 lugares.
9. **El service worker sirve `index.html` network-first**, así que un cambio
   llega en la siguiente apertura con datos. No hace falta tocar la versión del
   caché por editar el HTML.
