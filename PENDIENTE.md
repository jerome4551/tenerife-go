# Lo que queda, bloque por bloque

**150 de 173 líneas (87 %)** · 154 entradas · 607 paradas · 190 nodos
**0 sin precio · 0 sin frecuencia · 0 sin horario · 0 sin tiempo · 0 fallos de integridad**

---

## BLOQUE 1 — 23 líneas que no existen todavía

De todas tengo recorrido, frecuencia, precio, horario y tiempo. **Solo falta la coordenada de
su cabecera.** Sin cabecera no entran de ninguna forma.

```
Avenida de Anaga                 = ___ , ___     → 921
Barrio de Santa Bárbara          = ___ , ___     → 358
CC El Duque                      = ___ , ___     → 424
Cruce de Barranco Hondo          = ___ , ___     → 142
El Amparo                        = ___ , ___     → 358
El Calvario                      = ___ , ___     → 023
El Palmar                        = ___ , ___     → 366
El Pris                          = ___ , ___     → 023
El Socorro                       = ___ , ___     → 032
Erjos                            = ___ , ___     → 392
Hospital del Norte               = ___ , ___     → 357
La Corujera                      = ___ , ___     → 380
La Montañeta                     = ___ , ___     → 360
La Quebrada                      = ___ , ___     → 917
La Sombrera                      = ___ , ___     → 032
Las Eras                         = ___ , ___     → 032
Las Llanadas                     = ___ , ___     → 330
Las Maretas                      = ___ , ___     → 430
Las Portelas                     = ___ , ___     → 366
Los Gavilanes                    = ___ , ___     → 916
María Jiménez                    = ___ , ___     → 916
Mercado                          = ___ , ___     → 921
Mesa del Mar                     = ___ , ___     → 021
Moraditas de Taco                = ___ , ___     → 923
Palm-Mar                         = ___ , ___     → 468
Parking CC San Jerónimo          = ___ , ___     → 310
Playa de San Marcos              = ___ , ___     → 362
Plaza del Príncipe               = ___ , ___     → 921
Polígono Industrial de Güímar    = ___ , ___     → 122
Puerto de Erjos                  = ___ , ___     → 360
Punta de Teno                    = ___ , ___     → 369
Ruigómez                         = ___ , ___     → 392
San José de los Llanos           = ___ , ___     → 360
San Vicente                      = ___ , ___     → 330
Santa Catalina                   = ___ , ___     → 021
Tejina de Guía                   = ___ , ___     → 490
Tigaiga                          = ___ , ___     → 380
Torviscas Alta                   = ___ , ___     → 424
Valleseco                        = ___ , ___     → 917
Vera de Erques                   = ___ , ___     → 490
Villa de Arico                   = ___ , ___     → 430
```

Son **41 coordenadas** para 23 líneas.

---

## BLOQUE 2 — 31 paradas intermedias de líneas que ya funcionan

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
Las Dehesas                      = ___ , ___     → 352
Los Blanquitos                   = ___ , ___     → 463
Palo Blanco                      = ___ , ___     → 347
Radazul Alto                     = ___ , ___     → 138
Radazul Bajo                     = ___ , ___     → 139
Realejo Alto                     = ___ , ___     → 339
Suárez Guerra                    = ___ , ___     → 905
Tabaiba Alta                     = ___ , ___     → 138
Tejina de Guía                   = ___ , ___     → 417
Tornero                          = ___ , ___     → 203
Tío Pino                         = ___ , ___     → 915
Valle San Lorenzo                = ___ , ___     → 416
```

---

## BLOQUE 3 — 3 cosas que necesitan una decisión, no un dato

**1. Palm-Mar.** Las tres coordenadas que han llegado caen en el agua (1,53 · 1,53 · 1,22 km).
En el sur ese control es fiable: Las Galletas, Los Cristianos, El Médano, Los Abrigos y El
Fraile dan entre 0,00 y 0,11. La tierra más cercana está en `28.0250, -16.7000`; el problema
está en la **longitud**, que no ha cambiado entre los tres intentos. Bloquea la 468.

**2. La Ofra de la 915.** Llegó en `28.458632, -16.294105`, a **1 km** de la Ofra que ya
comparten la 905, la 908 y la 971. O es la misma parada medida de otra forma —y entonces
aplicarla parte el nodo y esas cuatro dejan de poder transbordar— o es otra parada distinta y
necesita otro nombre, como hicimos con El Cardonal y con Taco. **¿Cuál de las dos?**

**3. La Longuera.** Aplicada, pero al borde: da 1,2 km de mar cuando los costeros reales del
norte no pasan de 0,9. Puede estar un kilómetro corrida. No bloquea nada, pero si tienes la
buena, mejor.

---

## BLOQUE 4 — verificaciones hechas, y la que falta

Hechas y en verde en cada cambio:

| control | resultado |
|---|---|
| integridad de la tabla | 154 líneas, 607 paradas, 0 fallos |
| campos vacíos | 0 en precio, frecuencia, horario y tiempo |
| nodos partidos | 0 sin explicar |
| paradas casi encima de otra | 3, las tres con nombre distinto y revisadas |
| velocidades implícitas | 7 avisos, los 7 revisados y documentados |
| tierra/mar de cada coordenada nueva | siempre, antes de aplicar |
| los 760 lugares del mapa | 0 vacíos, 0 duplicados |
| 8 idiomas | 0 claves sin traducir |
| regresión XSS | limpia |
| errores de consola | 0 |

**La que falta: simulación de rutas de extremo a extremo.** Con 190 nodos ya tiene sentido —
comprobar que los transbordos encadenan, que las ventanas nocturnas se respetan y que ningún
nodo quedó aislado. La puedo lanzar cuando quieras; no depende de que me mandes nada.

---

## Orden que yo seguiría

1. **Bloque 3** (3 decisiones) — no cuesta datos nuevos, solo elegir.
2. **Bloque 4**, la simulación — encuentra fallos que ninguna comprobación estática ve.
3. **Bloque 1** (41 coordenadas) — cierra las 23 líneas y llega al 100 %.
4. **Bloque 2** (31 coordenadas) — pulido; mejora líneas que ya funcionan.
