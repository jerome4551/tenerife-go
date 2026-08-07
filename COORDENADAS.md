# Coordenadas: lo que salió mal, y lo que queda

Dos bloques. El primero es el historial de fallos, con la medida de cada uno. El segundo es
lo que falta, separado por **si lo puedo comprobar o no**.

---

# BLOQUE 1 — Las que llegaron mal

Ninguna de estas llegó a la app. Todas se pillaron midiendo antes de aplicar.

## Al mar

| coordenada | cuánto | qué se hizo |
|---|---|---|
| **Matriz del tranvía L1** | 5 paradas en el Atlántico | se rehízo entera |
| **El Pris** | 2,8 km mar adentro | se usó `Puerto El Pris` del propio mapa |
| **Mesa del Mar** | 2,2 km mar adentro | se usó la del propio mapa |
| **Palm-Mar** (1º) | 1,53 km | rechazada |
| **Palm-Mar** (2º) | 1,53 km | rechazada — la longitud no cambió |
| **Palm-Mar** (3º) | 1,22 km | rechazada — la longitud seguía sin cambiar |
| **Palm-Mar** (4º) | 0,50 km | **aceptada** |
| **La Longuera** (1ª) | 1,12 km | rechazada |

En el sur ese control es fiable: Las Galletas, Los Cristianos, El Médano, Los Abrigos y El
Fraile dan entre 0,00 y 0,11 km. En el norte es más grueso y llega a dar 0,9 km en paradas
costeras buenas.

## En el sitio equivocado

| coordenada | cuánto | qué era en realidad |
|---|---|---|
| **Las Flores** | 19,2 km de Güímar | la Las Flores de **La Laguna** |
| **Hospital del Sur** | 8,75 km del hospital | un punto en **San Miguel de Abona**, a 350 m de un supermercado |
| **Tabaiba Baja** (×2) | 7,5 km fuera del corredor | — |
| **La Corujera** | 10 km | la coordenada **exacta** de Mayorazgo |

El Hospital del Sur es el caso más difícil de todos: estaba **en tierra, en el sur, en la
comarca correcta**. Pasó los dos controles automáticos. Solo cayó al cruzarlo contra
nuestros propios lugares.

## Duplicadas o corridas

| qué | detalle |
|---|---|
| **Longitudes del tranvía** | venían corridas **una posición** respecto a su etiqueta. Lo delataron dos coincidencias: la longitud etiquetada «Weyler» era la del Teatro Guimerá con 23 m de error, y la etiquetada «La Paz» era la de Plaza Weyler con 18 m |
| **Plaza de Erjos / Puerto de Erjos** | llegaron con la **misma coordenada** exacta → una sola parada |
| **Palm-Mar** (en el lote de 41) | volvía la versión vieja, ya descartada |
| **Cruce de Radazul / Arafo** | reenviadas bajo el epígrafe de la **124**, cuando son de la 121 y ya estaban puestas |

## Líneas que no existen

| | |
|---|---|
| **949** | la propia fuente lo reconoció. Cero menciones en los tres folletos |
| **954** | no existe |
| **948** | la retiré yo por análisis y resultó que sí existía — **error mío**, reinstalada |

## Datos que no eran coordenadas pero tampoco eran ciertos

**«Tarifa plana comarcal» de Tacoronte** (021 y 023). El precio de 1,45 € era correcto, pero
la razón no: esa tarifa plana solo existe en las series 200 y 900. Lo de Tacoronte es el
**mínimo de la kilométrica**. El número quedó igual; la explicación se corrigió, porque si se
apunta como tarifa plana alguien la generaliza mañana a una línea larga y cobra de menos.

## Dos que están en la app y no me convencen

Estas sí se aplicaron, porque no rompen nada y caen donde deben. Pero quedan anotadas:

- **Cueva del Polvo** cae a **37 m** de la parada de Puerto de Santiago. Puede ser —dos
  paradas seguidas de la misma bajada— pero 37 m es muy poco para dos paradas distintas.
- **Chío** tiene **exactamente** la misma latitud que el núcleo de Guía de Isora, `28.2111`,
  hasta la cuarta cifra, y queda a 900 m. Dos puntos medidos por separado no coinciden así.
  Huele a coordenada derivada de la otra, no medida. Además Chío se describe como cruce de
  las medianías **altas** y esta sale casi al nivel del casco.

---

# BLOQUE 2 — Lo que queda

**18 paradas.** Ninguna bloquea nada: la red está al 100 % y las 173 líneas funcionan.

## Las que puedo comprobar: 1

```
Benijo   = ___ , ___     → 948, después de Almáciga   · Santa Cruz (Anaga)
```
Tenemos `Playa Benijo` en `28.5721, -16.1925` y el sendero `PR-TF 6.3 · Benijo — Cruz del
Draguillo` en `28.5735, -16.1871`. Con eso la contrasto en un segundo.

## Las que NO puedo comprobar: 17

Para estas no hay **nada** en nuestros 760 lugares con que contrastarlas. Me quedan solo dos
controles, y los dos son débiles aquí:

- **tierra/mar** — tierra adentro no dice casi nada
- **encaje en el tramo** — una coordenada equivocada pero cerca de la carretera se pasa sin
  despeinarse. Es exactamente lo que casi consigue el Hospital del Sur

```
Realejo Alto         → 339        · Los Realejos
Camino de Chasna     → 346        · La Orotava
Benijos              → 347        · La Orotava
Palo Blanco          → 347        · Los Realejos
La Florida           → 373        · La Orotava
El Roque             → 409        · San Miguel de Abona
Adeje casco          → 417        · Adeje
La Camella           → 421 y 480  · Arona
Cabo Blanco          → 421        · Arona
El Desierto          → 463        · Granadilla de Abona
Los Blanquitos       → 463        · Granadilla de Abona
Cruz de Tea          → 474        · Granadilla de Abona
Chayofa              → 482        · Arona
Barrio de la Alegría → 903        · Santa Cruz
Suárez Guerra        → 905        · Santa Cruz
Camino del Hierro    → 915        · Santa Cruz
Tío Pino             → 915        · Santa Cruz
```

**Mi consejo sigue siendo no mandarlas.** Si llegan mal, la app se queda peor que ahora y no
me voy a enterar.

---

## Lo que sí cambiaría la ecuación: el código de parada

Si en vez de la coordenada tienes el **código numérico de TITSA**, eso lo cambia todo. Ya
tenemos 24 paradas con su código —23 con uno y El Camisón con dos— y los cruzo entre sí:

```
Arguayo (7575)                  Los Gigantes · Terminal (7217)
Buenavista del Norte (4432)     Los Silos · Estación (4414)
Chiguergue (7486)               Playa de la Arena (7232)
Chío (7482)                     Puente del Botánico (4150)
Costa del Silencio (7306)       Puerto de Santiago (7222)
Cueva del Polvo (7241)          San Francisco (7243)
El Camisón (7149/7150)          Santiago del Teide (7579)
El Cercado (7574)               Tamaimo (7582)
El Fraile (7314)                Tierra de Trigo (4418)
Garachico · Piscina (4398)      Valle de Arriba (7578)
Guía de Isora (7494)            La Laguna · Intercambiador (2625)
La Caleta de Interián (4406)    Las Manchas (8147)
```

Con código puedo verificar que la misma parada tenga siempre la misma coordenada en todas
las líneas que la usan — que es justo el control que destapó que **San Benito** estaba en dos
sitios a la vez, a 1,86 km.

Formato:

```
Benijos = 4521 = 28.386412, -16.531205
```

---

## Resumen

| | |
|---|---|
| coordenadas rechazadas antes de aplicar | 6 al mar · 5 en otro sitio · 4 duplicadas o corridas |
| lotes enteros parados | 2 (matriz del tranvía, longitudes corridas) |
| correcciones propuestas y no aplicadas | 3 (Radazul, Arafo, Barranco Hondo) |
| coordenadas malas que llegaron a la app | **0** |
| líneas inventadas que se retiraron | 2 (949, 954) |
| errores míos | 1 (retirar la 948, que sí existía) |
| paradas que quedan | 18 — **ninguna bloquea nada** |
| de esas, verificables | **1** |

---

# APÉNDICE — Una corrección propuesta que no se aplicó

Llegó un lote para «corregir» tres nodos ya aplicados, presentado como los tres que están
«bajo control de tramo en las líneas 124, 127, 138 y 139». No se aplicó ninguno. Queda
escrito para no volver a discutirlo.

## Lo que decían los números

| nodo | se movía | desvío del tramo | lugar nuestro más cercano |
|---|---|---|---|
| Cruce de Radazul | 377 m | 1,463 → 1,100 km · **mejor** | 1,33 → 1,05 km · mejor |
| Arafo | 65 m | 2,248 → 2,227 km · igual | 0,21 → **0,27 km · peor** |
| Barranco Hondo | 139 m | 0,015 → **0,057 km · peor** | 1,99 → 1,86 km · igual |

## Por qué no

**Barranco Hondo.** El motivo declarado era «alinear linealmente la traza entre Barranco
Grande y Candelaria». Medido: la que ya estaba cae a **15 m** de esa recta y la nueva a
**57 m**. La razón del cambio es justo lo que el cambio empeora.

**Arafo.** El motivo declarado era «impedir que el algoritmo meta el vehículo hasta el casco
histórico municipal». Pero la 121 se llama *Santa Cruz — Candelaria — **Arafo** — Güímar* y
tarda 55 minutos donde la 124 tarda 35 **precisamente porque sube a Arafo**. Sacar la parada
del pueblo borraría lo que se arregló. Y de todas formas no la saca: se mueve 65 m y sigue a
270 m del casco.

**Cruce de Radazul.** Esta sí mejora dos medidas, y por eso merece una respuesta honesta: a
esta escala **mis instrumentos no distinguen**. El desvío se mide contra la recta Santa Cruz →
Candelaria, y la TF-1 no va por esa recta, va pegada a la costa; que un punto esté a 1,10 o a
1,46 km de una línea que no es la carretera no dice casi nada. Y 1,05 frente a 1,33 km del
puerto de Radazul es, en los dos casos, «un kilómetro cuesta arriba del muelle», que es como
se ve un enlace de la TF-1 desde cualquiera de los dos puntos.

Sin nada que los separe, no se cambia un dato ya verificado y publicado por otro cuyo
razonamiento acompañante es demostrablemente falso en dos de los tres casos.

## Y el encabezado tampoco cuadra

- **Cruce de Radazul y Arafo no son de la 124**, son de la 121. Es la segunda vez que llegan
  bajo el epígrafe de la 124.
- **La 138 y la 139 no aparecen** en ninguno de los tres puntos, pese a estar en el título.
- **Lo único que le falta a la 124 es el Empalme de Güímar**, que no venía.

La 124 tiene tres paradas —Santa Cruz, Candelaria, Güímar— y 35 minutos. No pasa por Radazul
ni por Arafo, y ese es todo su sentido: es la directa por la TF-1.

## Qué me haría cambiar de opinión

Para el Cruce de Radazul, cualquiera de estas dos:

1. El **código numérico** de la parada. Con código lo cruzo contra las 24 que ya lo llevan.
2. Un punto de referencia comprobable: qué hay a menos de 200 m de ese enlace —una
   gasolinera, un centro comercial, una salida numerada de la TF-1—. Con eso lo sitúo.

---

## Y una que sí entró después: el Empalme de Güímar

`28.324151, -16.374205`, la única que le faltaba a la 124. Entró **tal como llegó**, y es el
mejor ejemplo de por qué una cifra sola no decide nada.

Se sale **2,17 km** de la recta Candelaria → Güímar. Con el criterio de tramo a secas, mal.
Pero la recta va en diagonal tierra adentro y la TF-1 baja pegada a la costa, así que un
punto de autopista **tiene** que salirse. Lo que lo confirma es la dirección y el ancla:

- cae **al este** de la recta, hacia el mar — que es donde va la TF-1
- a **843 m** de la gasolinera `BP Güímar (TF-1)`, que ya estaba en el fichero
- el Arafo de la 121 se sale 2,25 km de la **misma recta pero al oeste**, hacia la montaña

Una línea a cada lado de la recta. Eso es exactamente lo que separa a la 121 de la 124, y
ninguna cifra aislada lo habría dicho.
