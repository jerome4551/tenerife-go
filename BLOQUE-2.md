# Bloque 2 — paradas intermedias · van 3 de 28

La red está completa: **173 de 173 líneas**. Esto ya no bloquea nada. Lo que hace es que el
planificador encuentre esas líneas también a quien vive **a mitad de recorrido**, y que el
trazado del mapa sea el real y no una recta entre las dos cabeceras.

**Aplicadas:** Hospital del Sur (418 y 480) · Cruce de Radazul (121) · Arafo (121).
**Quedan 25**, marcadas abajo con `___`.

---

## Lo que necesito, y solo eso

**La coordenada. Nada más.**

```
Hospital del Sur = 28.0687853, -16.7052128
```

Grados decimales, latitud primero, seis decimales, separadas por coma. La longitud de
Tenerife siempre es negativa: `-16.xxx`.

### Lo que NO necesito

❌ Frecuencia ❌ Precio ❌ Horario ❌ Tiempo de trayecto ❌ Recorrido

De las 22 líneas de esta lista **ya tengo esos cinco campos completos y verificados**. Si me
los mandas otra vez no hago nada con ellos. Solo la coordenada.

### Si alguna no existe

Dilo y la borro de la lista. **Es mejor que una parada esté ausente a que esté inventada.**
No hace falta que estén todas: manda las que tengas seguras y las demás se quedan como
están, que hoy ya funcionan.

---

## Las cuatro formas en que esto ha salido mal antes

Te las pongo porque las cuatro pasaron y las cuatro se pillaron midiendo, no leyendo:

1. **El tocayo de otro municipio.** `Las Flores` llegó a 19,2 km de Güímar: era la Las Flores
   de La Laguna. Hay decenas de nombres repetidos en la isla.
2. **La coordenada que cae al mar.** `El Pris` llegó a 2,8 km mar adentro, `Mesa del Mar` a
   2,2 km.
3. **La coordenada de otra parada.** `La Corujera` llegó con la coordenada **exacta** de
   Mayorazgo, a 10 km.
4. **El punto plausible pero equivocado.** `Hospital del Sur` llegó en tierra, en el sur, en
   la comarca correcta — y a 8,75 km del hospital, en San Miguel de Abona. Esta es la más
   difícil de ver: solo sale cruzándola contra lo que ya tenemos.

Por eso en cada línea de abajo te pongo **entre qué dos paradas tiene que caer, con sus
coordenadas**. Si el punto que mandas se sale de ese tramo, sale en el control y te lo digo.

---

## La lista, línea por línea

Cada bloque enseña el recorrido tal como está modelado hoy, y `← FALTA` marca el hueco.

### 121 · Santa Cruz — Candelaria — Arafo — Güímar
```
Santa Cruz [28.4578,-16.2568] → Candelaria [28.3536,-16.3733] → Güímar [28.3186,-16.4106]

✅ Cruce de Radazul = 28.414532, -16.326211   · El Rosario   APLICADA
✅ Arafo            = 28.341852, -16.417384   · Arafo        APLICADA
```
> Las dos entraron tal como llegaron. Arafo cayó a **210 m** de nuestro propio Arafo, que es
> la mejor confirmación que se puede pedir. Con las dos puestas la 121 ya no dibuja la misma
> línea que la 124: el rodeo por Arafo se sale 2,2 km de la recta Candelaria → Güímar, y eso
> es justo lo que explica que una tarde 55 minutos y la otra 35.

### 124 · Santa Cruz — Candelaria — Güímar (directo por la TF-1)
```
Santa Cruz [28.4578,-16.2568] → Candelaria [28.3536,-16.3733] → Güímar [28.3186,-16.4106]

Empalme de Güímar = ___ , ___     entre Candelaria y Güímar          · Güímar
```

### 127 · Taco — Barranco Grande — Candelaria — Güímar
```
Taco [28.441405,-16.307521] → Barranco Grande [28.438511,-16.321482] → Candelaria [28.3536,-16.3733] → Güímar

Barranco Hondo    = ___ , ___     entre Barranco Grande y Candelaria · El Rosario
```

### 138 · Santa Cruz — Tabaiba Alta — Radazul Alto — Tabaiba Baja **(hoy solo 2 paradas)**
```
Santa Cruz [28.4578,-16.2568] → Tabaiba Baja [28.401411,-16.331205]

Tabaiba Alta      = ___ , ___     entre las dos                      · El Rosario
Radazul Alto      = ___ , ___     entre las dos                      · El Rosario
```

### 139 · Santa Cruz — Radazul Bajo — Tabaiba Baja **(hoy solo 2 paradas)**
```
Santa Cruz [28.4578,-16.2568] → Tabaiba Baja [28.401411,-16.331205]

Radazul Bajo      = ___ , ___     entre las dos                      · El Rosario
```

### 203 · La Laguna — San Lázaro — San Benito — La Trinidad (bucle)
```
La Laguna [28.4853,-16.3160] → San Lázaro [28.489211,-16.335912] → San Benito [28.49512,-16.30845] → La Trinidad [28.4858,-16.3133]

Gavias            = ___ , ___     en el bucle                        · La Laguna
Tornero           = ___ , ___     en el bucle                        · La Laguna
```

### 339 · 🦉 Puerto de la Cruz — Los Realejos (nocturna) **(hoy solo 2 paradas)**
```
Puerto de la Cruz [28.4148,-16.5480] → Los Realejos [28.3852,-16.5841]

Realejo Alto      = ___ , ___     entre las dos                      · Los Realejos
```

### 346 · La Orotava — Aguamansa **(hoy solo 2 paradas)**
```
La Orotava [28.3926,-16.5235] → Aguamansa [28.3620,-16.5160]

Camino de Chasna  = ___ , ___     entre las dos                      · La Orotava
```

### 347 · La Orotava — Benijos — Palo Blanco — Los Realejos **(hoy solo 2 paradas)**
```
La Orotava [28.3926,-16.5235] → Los Realejos [28.3852,-16.5841]

Benijos           = ___ , ___     entre las dos                      · La Orotava
Palo Blanco       = ___ , ___     entre las dos                      · Los Realejos
```

### 373 · Las Dehesas — La Orotava **(hoy solo 2 paradas)**
```
Las Dehesas [28.397631,-16.541254] → La Orotava [28.3926,-16.5235]

La Florida        = ___ , ___     entre las dos                      · La Orotava
```

### 409 · San Miguel (El Roque) — San Isidro — El Médano
```
Cruce San Miguel [28.0500,-16.6178] → San Isidro [28.0625,-16.5635] → El Médano [28.0480,-16.5380]

El Roque          = ___ , ___     cabecera, junto a Cruce San Miguel · San Miguel de Abona
```
> Si El Roque y `Cruce San Miguel` son el mismo sitio, dilo y no toco nada: partir un nodo
> en dos por un nombre le quita el transbordo a las líneas que ya lo comparten.

### 417 · Costa Adeje — Guía de Isora **(hoy solo 2 paradas)**
```
Costa Adeje [28.0970,-16.7440] → Guía de Isora [28.2125,-16.7783]

Adeje casco       = ___ , ___     entre las dos                      · Adeje
```

### 418 · Costa Adeje — Los Cristianos — Valle San Lorenzo
```
Costa Adeje [28.0970,-16.7440] → Los Cristianos [28.0514,-16.7143] → Valle San Lorenzo [28.096311,-16.664853]

✅ Hospital del Sur = 28.0687853, -16.7052128   · Arona   APLICADA
```
> 🏥 Puesta, pero **no con la coordenada que llegó**. La que llegó, `28.086432, -16.618291`,
> cae en San Miguel de Abona —a 350 m del HiperDino de San Miguel, a 1,2 km del casco— y está
> a **8,75 km** del hospital. El `Hospital del Sur de Tenerife` ya estaba en nuestro mapa en
> `28.0687853, -16.7052128`, y ese punto sí encaja en el tramo: al 29 % de Los Cristianos →
> Valle San Lorenzo y a 710 m de la recta. Es la que se ha usado. La comparte con la 480.

### 421 · Valle San Lorenzo — IES Las Galletas **(hoy solo 2 paradas)**
```
Valle San Lorenzo [28.096311,-16.664853] → IES Las Galletas [28.014205,-16.657512]

La Camella        = ___ , ___     entre las dos                      · Arona
Cabo Blanco       = ___ , ___     entre las dos                      · Arona
```

### 463 · Chimiche — IES Granadilla **(hoy solo 2 paradas)**
```
Cruce Chimiche [28.1450,-16.5419] → IES Granadilla [28.118941,-16.578502]

El Desierto       = ___ , ___     entre las dos                      · Granadilla de Abona
Los Blanquitos    = ___ , ___     entre las dos                      · Granadilla de Abona
```

### 474 · Granadilla — Vilaflor — Arona
```
Granadilla [28.1208,-16.5775] → Vilaflor [28.1583,-16.6373] → Arona [28.0989,-16.6808]

Cruz de Tea       = ___ , ___     entre Granadilla y Vilaflor        · Granadilla de Abona
```

### 480 · Arona — Los Cristianos **(hoy solo 2 paradas)**
```
Arona [28.0989,-16.6808] → Los Cristianos [28.0514,-16.7143]

La Camella          = ___ , ___                  entre las dos      · Arona
✅ Hospital del Sur = 28.0687853, -16.7052128                       · Arona   APLICADA
```
> El hospital ya comparte nodo con la 418, así que entre las dos se puede hacer transbordo.
> La Camella es la misma parada que en la 421: con mandarla una vez basta.

### 482 · Vilaflor — La Escalona — Arona — Los Cristianos
```
Vilaflor [28.1583,-16.6373] → La Escalona [28.1487,-16.6470] → Arona [28.0989,-16.6808] → Los Cristianos [28.0514,-16.7143]

Chayofa           = ___ , ___     entre Arona y Los Cristianos       · Arona
```

### 903 · Intercambiador — Muelle Norte — Cueva Bermeja
```
Intercambiador [28.4578,-16.2568] → Muelle Norte [28.473502,-16.244102] → Cueva Bermeja [28.484211,-16.234102]

Barrio de la Alegría = ___ , ___  entre Intercambiador y Muelle Norte · Santa Cruz
```

### 905 · Muelle Norte — Ramblas — Plaza Weyler — Ofra
```
Muelle Norte [28.473502,-16.244102] → Ramblas [28.468241,-16.257522] → Plaza Weyler [28.46824,-16.25368] → Ofra [28.4612,-16.2843]

Suárez Guerra     = ___ , ___     entre Ramblas y Plaza Weyler       · Santa Cruz
```
> Ojo con esta: las tres paradas de alrededor están a menos de 500 m unas de otras. Si cae a
> menos de ~50 m de Ramblas o de Weyler, es la misma parada y no la añado.

### 915 · Intercambiador — Camino del Hierro — Tío Pino — Ofra **(hoy solo 2 paradas)**
```
Intercambiador [28.4578,-16.2568] → Ofra [28.46122,-16.28431]

Camino del Hierro = ___ , ___     entre las dos                      · Santa Cruz
Tío Pino          = ___ , ___     entre las dos                      · Santa Cruz
```

### 948 · Azanos — Taganana — Playa de Almáciga (Anaga)
```
Azanos [28.555231,-16.198942] → Taganana [28.55621,-16.21324] → Almáciga [28.57143,-16.20215]

Benijo            = ___ , ___     después de Almáciga                · Santa Cruz
```

---

## Resumen

| | |
|---|---|
| paradas | **25** · van 3 aplicadas |
| líneas que mejoran | 22 |
| líneas que hoy solo tienen 2 paradas | 11 — ahí es donde más cambia el trazado |
| bloquea algo | **no** |

Van 3 aplicadas (Hospital del Sur, Cruce de Radazul y Arafo). De las 25 que quedan, yo
seguiría por las de las líneas que hoy solo tienen dos paradas: 138, 139, 915, 421, 463,
347, 373, 346, 417 y 339.

De las tres aplicadas, dos entraron tal cual y una hubo que corregirla. La que las separa es
siempre la misma comprobación: **cruzar el punto contra nuestros propios 760 lugares.** Arafo
cayó a 210 m de nuestro Arafo y entró sin discusión; el Hospital del Sur cayó a 350 m de un
supermercado de San Miguel y a 8,75 km del hospital, y no entró.
