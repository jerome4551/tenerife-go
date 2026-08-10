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

**A2. Dos contradicciones sin resolver.**
- **La Jaquita** — nosotros: `lifeguard:false`. Un lote decía que sí tiene y la
  situaba en Granadilla; nuestra coordenada la pone en **Guía de Isora**.
- **Valleseco, Leocadio Machado, El Chinchorro, Playa Grande (Los Abrigos)** —
  aparecen en fuentes externas y **no están en la app**. Si existen y merecen
  estar, hacen falta sus coordenadas.

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

**A4. Orientación fina de playas.**
De las 34 del panel de baño, **28 tienen la orientación deducida** por
geometría y 6 escritas a mano. La deducción reproduce el comportamiento de las
6 conocidas, pero un surfista o un socorrista local afinaría el `badWind` de su
playa mejor que ningún modelo.

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
