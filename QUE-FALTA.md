# Qué me falta — Tenerife Go

**Estado: 94 de 171 líneas (55 %) · 103 líneas y tranvías · 142 nodos · 0 sin precio, frecuencia ni horario.**

Queda **una sola petición**: la 4, coordenadas de paradas. Las otras tres están cerradas.

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

## ✅ PETICIÓN 1 — RESUELTA

Los 12 tiempos aplicados. **Ninguna línea queda sin tiempo de trayecto: 103 de 103.**
Y la 030 ya gana a la 343 cuando preguntas Puerto de la Cruz → Aeropuerto Norte, que era el
síntoma de que faltaba el dato.

---

## ✅ PETICIÓN 2 — RESUELTA

Tejina en `28.530911, -16.355104`: el rodeo de la 050 desaparece, la línea pasa de 15,3 a 11,7 km.
San Honorato en `28.481242, -16.319736`: el bucle de la 204 pasa de 300 m a 1,7 km y ya lleva sus
15 minutos.

---

## ✅ PETICIÓN 3 — RESUELTA

La 030 ya está dentro: `06:30 → 21:45`, 30 min, 4,75 € (3,40 € con Ten+). La ventana llega a las
21:45 y no a las 21:00 porque esa es la última salida desde el aeropuerto, y cerrar antes dejaría
a alguien en la terminal creyendo que no hay guagua.

Le falta el tiempo de trayecto, así que está en la petición 1.

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
