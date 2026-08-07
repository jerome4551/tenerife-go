# Lo que queda, bloque por bloque

**171 de 173 líneas (99 %)** · 175 entradas · 678 paradas · 226 nodos
**0 sin precio · 0 sin frecuencia · 0 sin horario · 0 sin tiempo · 0 fallos de integridad**

> Las 175 entradas son más que las 173 líneas porque el tranvía son dos (L1 y L2)
> y la 934 va dos veces: la de día y la nocturna, que hacen el círculo al revés.

---

## BLOQUE 1 — 2 líneas que faltan, y no es por coordenadas

Las 41 coordenadas de cabecera ya están aplicadas y con ellas entraron 20 líneas.
Quedan estas dos, las dos de Tacoronte:

```
021   Tacoronte — Santa Catalina — Mesa del Mar
023   Tacoronte — El Calvario — El Pris
```

De las dos tengo el recorrido y tengo dónde caen: `Tacoronte · Casco` ya es un nodo que
comparten la 011, la 012, la 051 y la 057; `Mesa del Mar` y `Puerto El Pris` ya están en
el mapa. **Lo que no ha llegado nunca son los cuatro datos de servicio.** Sin ellos la
línea no se puede planificar: no sé cuánto se espera, ni cuánto cuesta, ni si a esa hora
existe.

Para cada una hacen falta las cuatro:

```
021   frecuencia = ______     precio = ______ €
      primera salida = __:__  última salida = __:__
      trayecto de punta a punta = ___ min

023   frecuencia = ______     precio = ______ €
      primera salida = __:__  última salida = __:__
      trayecto de punta a punta = ___ min
```

Si de alguna no hay dato, dilo y se queda fuera: es mejor que esté ausente a que aparezca
con una frecuencia inventada.

---

## BLOQUE 2 — 28 paradas intermedias de líneas que ya funcionan

Estas **no bloquean nada**: la línea existe y se ofrece. Lo que hacen es que el planificador
la encuentre también a quien vive a mitad de recorrido, y que el trazado del mapa sea el real.

```
Hospital del Sur                 = ___ , ___     → 418 480
La Camella                       = ___ , ___     → 421 480
Adeje casco                      = ___ , ___     → 417
Arafo                            = ___ , ___     → 121
Barranco Hondo                   = ___ , ___     → 127
Barrio de la Alegría             = ___ , ___     → 903
Benijo                           = ___ , ___     → 948
Benijos                          = ___ , ___     → 347
Cabo Blanco                      = ___ , ___     → 421
Camino de Chasna                 = ___ , ___     → 346
Camino del Hierro                = ___ , ___     → 915
Chayofa                          = ___ , ___     → 482
Cruce de Radazul                 = ___ , ___     → 121
Cruz de Tea                      = ___ , ___     → 474
El Desierto                      = ___ , ___     → 463
El Roque (usa Cruce San Miguel)  = ___ , ___     → 409
Empalme de Güímar                = ___ , ___     → 124
Gavias                           = ___ , ___     → 203
La Florida                       = ___ , ___     → 373
Los Blanquitos                   = ___ , ___     → 463
Palo Blanco                      = ___ , ___     → 347
Radazul Alto                     = ___ , ___     → 138
Radazul Bajo                     = ___ , ___     → 139
Realejo Alto                     = ___ , ___     → 339
Suárez Guerra                    = ___ , ___     → 905
Tabaiba Alta                     = ___ , ___     → 138
Tornero                          = ___ , ___     → 203
Tío Pino                         = ___ , ___     → 915
```

Las Dehesas, Tejina de Guía y Valle San Lorenzo ya no están en la lista: llegaron y están
puestas.

---

## BLOQUE 3 — decisiones: cerrado

Las tres que quedaban se resolvieron:

**Palm-Mar** entró al cuarto intento en `28.021132, -16.702581`, en tierra, y con ella la 468.
**La Ofra de la 915** es la misma parada que ya comparten la 905, la 908 y la 971, así que no
se partió el nodo. **La Longuera** se corrigió a `28.406852, -16.568411`.

Del lote de 41 hubo que arbitrar cuatro más, y las cuatro habrían pasado sin ruido:

| coordenada | qué pasaba | qué se hizo |
|---|---|---|
| El Pris | 2,8 km mar adentro | se usa Puerto El Pris, del propio mapa |
| Mesa del Mar | 2,2 km mar adentro | igual, la del propio mapa |
| La Corujera | era la coordenada exacta de Mayorazgo, a 10 km | se usa la del guachinche de La Corujera |
| Palm-Mar | volvía la versión vieja, la de 1,2 km de mar | se deja la buena, que ya estaba |

Y una que el control marcó mal: **Punta de Teno** da 1,5 km de mar, pero ahí falla el control,
porque el faro de Teno —que ya estaba en el fichero— cae a 100 m de ese punto. Es un cabo
estrecho y la máscara de tierra no lo ve. Se aceptó.

---

## BLOQUE 4 — verificaciones

Todas en verde sobre la red completa:

| control | resultado |
|---|---|
| integridad de la tabla | 175 líneas, 678 paradas, 0 fallos |
| campos vacíos | 0 en precio, frecuencia, horario y tiempo |
| códigos de parada | 23 usados, 0 incoherentes |
| paradas casi encima de otra | 3, las tres con nombre distinto y revisadas |
| velocidades implícitas | 10 avisos, los 10 revisados y comentados en el sitio |
| tierra/mar de cada coordenada nueva | siempre, antes de aplicar |
| los 760 lugares del mapa | 0 vacíos, 0 duplicados, 0 errores de consola |
| 8 idiomas | 0 claves sin traducir, 0 errores |
| regresión XSS | limpia |

**La simulación de extremo a extremo ya está hecha**: 17 rutas largas a cuatro horas
distintas (08:00, 14:00, 22:00 y 03:00).

- A las **08:00** salen las 17.
- A las **14:00** falla solo el Teide, y es correcto: la 342 y la 348 salen por la mañana
  y no hay otra forma de subir.
- A las **22:00** y a las **03:00** fallan las de Anaga, Masca, Vilaflor y Tabaiba. Son
  huecos reales de la red, y lo importante es que el planificador dice *fuera de horario*
  con la lista de líneas que lo estarían: no se inventa una guagua que no sale.

De esa simulación salió un fallo de verdad, ya corregido: la 342 y la 348 tenían la ventana
abierta desde las 00:00, así que a las tres de la madrugada ofrecían subir al Teide con una
espera de una hora cuando la guagua sale a las 09:25.

**642 de los 760 lugares del mapa tienen guagua.** De los 226 nodos, 41 siguen aislados
—sin otra línea a menos de 2 km—: el Teleférico, Las Teresitas, Chamorga, Punta de Anaga,
Bajamar y compañía. Eso no es un fallo: es que a esos sitios llega una sola línea, y así es
en la realidad.

---

## Orden que yo seguiría

1. **Bloque 1** — los ocho datos de la 021 y la 023, y la red queda cerrada al 100 %.
2. **Bloque 2** — 28 coordenadas de pulido; mejora líneas que ya funcionan hoy.
