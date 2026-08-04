# Auditoría — qué falta para cerrar

**130 de 174 líneas (75 %)** · 134 entradas · 548 paradas · 171 nodos
**0 sin precio · 0 sin frecuencia · 0 sin horario · 0 sin tiempo · 0 fallos de integridad**

Tres avisos de velocidad baja (492, 346 y 383) están comprobados y explicados en el código: son
líneas cuya carretera real es mucho más larga que la recta entre las paradas que modelamos.
No son errores de dato.

Faltan **44 líneas**, y todas por lo mismo: **69 coordenadas**.
De frecuencia, precio, horario y tiempo ya me diste todo. **No me mandes fichas otra vez.**

---

## Formato

```
Nombre = 28.4578, -16.2568
```

Decimal con punto, latitud primero. Si alguna no existe, escribe `no hay`.

---

## PRIORIDAD 1 — 10 coordenadas que desbloquean 2 o más líneas

```
IES Granadilla                 = ___ , ___      → 410 412 419 463
Las Dehesas                    = ___ , ___      → 372 373 376
Los Abrigos                    = ___ , ___      → 410 412 483
Valle San Lorenzo              = ___ , ___      → 418 420 421
Barrio de San Antonio          = ___ , ___      → 372 382
Guargacho                      = ___ , ___      → 468 486
Igueste de Candelaria          = ___ , ___      → 123 131
Muelle Norte                   = ___ , ___      → 903 905
Plaza Reyes Católicos          = ___ , ___      → 381 382
Tabaiba Baja                   = ___ , ___      → 138 139
```

## PRIORIDAD 2 — 59 coordenadas de una línea cada una

Marcadas ★ las que son **cabecera**: sin ellas la línea no entra de ninguna forma.

```
★ Araya                          = ___ , ___      → 123
  Avenida de Anaga               = ___ , ___      → 921
★ Barrio de Santa Bárbara        = ___ , ___      → 358
  Barrio de la Alegría           = ___ , ___      → 903
★ CC El Duque                    = ___ , ___      → 424
  Cabo Blanco                    = ___ , ___      → 421
★ Cruce de Barranco Hondo        = ___ , ___      → 142
★ Cueva Bermeja                  = ___ , ___      → 903
  El Amparo                      = ___ , ___      → 358
  El Calvario                    = ___ , ___      → 023
  El Desierto                    = ___ , ___      → 463
  El Palmar                      = ___ , ___      → 366
★ El Pris                        = ___ , ___      → 023
★ El Rincón                      = ___ , ___      → 376
  El Socorro                     = ___ , ___      → 032
★ Erjos                          = ___ , ___      → 392
★ Hospital del Norte             = ___ , ___      → 357
  Hospital del Sur               = ___ , ___      → 418
★ IES Las Galletas               = ___ , ___      → 421
★ IES San Miguel                 = ___ , ___      → 486
  La Camella                     = ___ , ___      → 421
★ La Corujera                    = ___ , ___      → 380
  La Florida                     = ___ , ___      → 373
★ La Longuera                    = ___ , ___      → 381
  La Montañeta                   = ___ , ___      → 360
★ La Quebrada                    = ___ , ___      → 917
★ La Sombrera                    = ___ , ___      → 032
  Las Eras                       = ___ , ___      → 032
★ Las Llanadas                   = ___ , ___      → 330
★ Las Maretas                    = ___ , ___      → 430
★ Las Portelas                   = ___ , ___      → 366
  Loro Parque                    = ___ , ___      → 381
  Los Blanquitos                 = ___ , ___      → 463
★ Los Gavilanes                  = ___ , ___      → 916
  María Jiménez                  = ___ , ___      → 916
  Mayorazgo                      = ___ , ___      → 372
★ Mercado                        = ___ , ___      → 921
★ Mesa del Mar                   = ___ , ___      → 021
★ Moraditas de Taco              = ___ , ___      → 923
★ Palm-Mar                       = ___ , ___      → 468
★ Parking CC San Jerónimo        = ___ , ___      → 310
★ Playa de San Marcos            = ___ , ___      → 362
  Plaza del Príncipe             = ___ , ___      → 921
★ Polígono Industrial de Güímar  = ___ , ___      → 122
★ Puerto de Erjos                = ___ , ___      → 360
★ Punta de Teno                  = ___ , ___      → 369
  Radazul Alto                   = ___ , ___      → 138
  Radazul Bajo                   = ___ , ___      → 139
  Ruigómez                       = ___ , ___      → 392
  San José de los Llanos         = ___ , ___      → 360
  San Vicente                    = ___ , ___      → 330
  Santa Catalina                 = ___ , ___      → 021
  Suárez Guerra                  = ___ , ___      → 905
  Tabaiba Alta                   = ___ , ___      → 138
  Tejina de Guía                 = ___ , ___      → 490
★ Tigaiga                        = ___ , ___      → 380
  Valleseco                      = ___ , ___      → 917
★ Vera de Erques                 = ___ , ___      → 490
  Villa de Arico                 = ___ , ___      → 430
```

---

## Lo único que NO es una coordenada — RESUELTO

**949: no existe.** Confirmado por la fuente. Purgada del listado oficial, que pasa de 175 a
174 números.

**948: retirada también.** Llegó en el mismo lote que la 949 y traía dos problemas: cero
menciones en los tres folletos, y dos recorridos incompatibles de la misma fuente (uno hasta
Las Teresitas, otro por Azanos, Almáciga y Benijo). Con dos versiones que se contradicen no se
puede elegir, y la que estaba puesta era calcada a la 910. **Si la 948 existe, dime cuál de los
dos recorridos es y vuelve.**

**915 y 954: bajo observación.** También tienen cero menciones en los folletos, pero no hay
contradicción, así que se quedan. Ausencia en un documento de 2019 no prueba que una línea no
exista.

---

## Cuenta

- 10 coordenadas de prioridad 1 → desbloquean 21 líneas
- 59 de prioridad 2 → las 23 restantes
- 1 pregunta (la 949)

Con las 69 coordenadas, la app pasa del 75 % al 100 %.
