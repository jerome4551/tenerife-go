# Qué me falta — Tenerife Go

**Estado: 93 de 171 líneas (54 %) · 102 líneas y tranvías · 144 nodos · 0 sin precio, frecuencia ni horario.**

Cuatro peticiones. Son independientes: contesta la que quieras, en el orden que quieras.

---

## CÓMO CONTESTAR

Copia la línea y pon el dato detrás. Nada más. Ejemplos de respuesta correcta:

```
345 = 40 min
Tejina = 28.5290, -16.3550
030 última = 21:45
030 precio = 3,70 €
```

Reglas de formato:

| dato | formato | ejemplo bueno | ejemplo malo |
|---|---|---|---|
| minutos | número entero, sin texto | `40` | `unos 40-45` |
| coordenada | decimal con **punto**, lat primero | `28.5290, -16.3550` | `28°31'44"N` |
| hora | 24 h con dos puntos | `21:45` | `9:45 PM` |
| precio | euros con coma | `2,45 €` | `2.45` |

Si un dato no existe o no lo sabes, escribe `no hay`. Eso también me sirve: dejo de pedirlo.

---

## PETICIÓN 1 — 11 tiempos de trayecto · *lo que más rinde*

> ### ⚠️ Esto NO es la ficha del Bloque 1
>
> La frecuencia, el precio, la primera y la última salida de esas 11 líneas **ya están dentro**,
> verificadas campo a campo contra tu ficha: los 44 coinciden. No hace falta reenviarlas.
>
> Lo que falta es **un quinto campo distinto**: `minutos`, el tiempo de viaje.
> Así está guardada hoy la 345, para que se vea de un vistazo:
>
> ```
> id:"bus-345"  numero:"345"
>   ✅ frecuencia: "50-60 min"          ← cada cuánto pasa
>   ✅ precio:     "1,45 €"
>   ✅ servicio:   06:00 → 21:30        ← primera y última salida del día
>   ❌ minutos:    FALTA                ← cuánto se tarda en hacer el viaje
> ```
>
> `frecuencia` es cuánto esperas en la parada. `minutos` es cuánto dura el viaje.
> Sin ese número, el planificador estima la duración por velocidad media y se equivoca.

Un número por línea: **minutos de cabecera a cabecera, en un solo sentido**.
Si la línea es un bucle, dime los minutos de la vuelta entera y añade la palabra `bucle`.

El recorrido que va detrás es **el que tiene la app ahora**. Si no coincide con el real, dímelo:
un tiempo puesto sobre un recorrido equivocado es peor que no tener tiempo.

```
345 = ___ min     (Puerto de la Cruz · Estación → La Orotava · Estación → Aguamansa)
351 = ___ min     (Puerto de la Cruz · Estación → La Orotava · Estación)
353 = ___ min     (Puerto de la Cruz · Estación → Los Realejos → La Orotava · Estación)
365 = ___ min     (Buenavista del Norte · Terminal → 🏔️ Masca (Pueblo))
447 = ___ min     (Los Cristianos · Estación → Costa Adeje · Estación → Adeje · Las Torres)
448 = ___ min     (Adeje · Las Torres → La Caleta)
450 = ___ min     (Costa Adeje · Estación → Los Cristianos · Estación → San Isidro (Enlace TF-1))
460 = ___ min     (Icod de los Vinos → El Tanque → Santiago del Teide → Guía de Isora → Costa Adeje · Estación)
492 = ___ min     (Chiguergue (7486) → Guía de Isora)
493 = ___ min     (Guía de Isora → Playa San Juan → Alcalá → Puerto de Santiago (7222) → Los Gigantes · Terminal)
494 = ___ min     (Guía de Isora → Playa San Juan → Alcalá → Los Gigantes · Terminal)
```

---

## ✅ PETICIÓN 2 — RESUELTA

Tejina en `28.530911, -16.355104`: el rodeo de la 050 desaparece, la línea pasa de 15,3 a 11,7 km.
San Honorato en `28.481242, -16.319736`: el bucle de la 204 pasa de 300 m a 1,7 km y ya lleva sus
15 minutos.

---

## PETICIÓN 3 — la línea 030, a dos datos

Tengo recorrido (Puerto de la Cruz ↔ Aeropuerto Norte), las dos coordenadas y la frecuencia
(30 min) y la primera salida (06:30). Con estos dos datos la línea entra hoy.

```
030 última = __:__
030 precio = ___ €
```

---

## PETICIÓN 4 — coordenadas de paradas (21 prioritarias de 88)

Estas 21 son las que más rinden: **no añaden líneas nuevas, rellenan líneas que ya funcionan**
y que hoy solo tienen cabecera y final. Entre paréntesis, las líneas que las usan.

```
Las Canteras = ___ , ___        (076 270 274 275)
Chamberí = ___ , ___        (232 238 923)
Barranco Grande = ___ , ___        (127 933)
Ramblas = ___ , ___        (920 923)
Aeropuerto Los Rodeos = ___ , ___        (343)
Avda. 3 Mayo = ___ , ___        (104)
Avda. Melchor Luz = ___ , ___        (104)
Avenida del Ferry = ___ , ___        (711)
Casas Cumbre = ___ , ___        (076)
Costa San Miguel = ___ , ___        (415)
Cruce Santa María = ___ , ___        (933)
Cruce de Los Rodeos = ___ , ___        (253)
EL BRONCO = ___ , ___        (204)
Emp. Granadilla = ___ , ___        (110)
LOS CAMPITOS (Las Casillas) = ___ , ___        (912)
Los Baldíos = ___ , ___        (056)
PUNTA DE ANAGA = ___ , ___        (947)
Plaza del Cristo = ___ , ___        (204)
SAN MATÍAS = ___ , ___        (219)
San Lázaro = ___ , ___        (104)
Valle Santiago = ___ , ___        (462)
```

Las 67 restantes están en `PARADAS-PENDIENTES.md`, sección B. Son de líneas que aún no existen
en la app, así que rinden menos: úsalas solo si te sobran ganas.

---

## LO QUE NO NECESITO

Para que no gastes tiempo en esto:

- **Listados de qué líneas existen.** Ya tengo el mapa completo: 171 números, y sé cuáles son
  fantasma (nueve) gracias a tus dos auditorías.
- **Recorridos en texto.** Los tengo de 121 líneas, sacados de los folletos.
- **Horarios completos de salidas.** Solo uso primera y última; el resto no cabe en el modelo.
- **Los folletos otra vez.** Están leídos y exprimidos.

El cuello de botella son **12 números de minutos y unas cuantas coordenadas**. Nada más.
