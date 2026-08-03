# Qué me falta — Tenerife Go

Generado de la tabla real. Rellena solo los huecos `___`. Cada bloque es independiente.

**Estado: 93 de 171 líneas (54 %) · 100 líneas en la tabla · 0 sin precio, frecuencia ni horario.**

---

## ✅ BLOQUES 1, 3 y 4 — casi cerrados

11 líneas nuevas dentro · 19 de 21 tiempos aplicados · 390 reconstruida · cabeceras de 911, 933, 939 y 947 confirmadas · 455 descartada · Tejina en la 050.

---

## BLOQUE 2 — la 030, a un solo dato

```
030  Puerto de la Cruz ↔ Aeropuerto Norte · cada 30 min · primera 06:30
     última salida: __:__     ← solo esto
     precio.......: ___ €
```

---

## BLOQUE 3 — 13 líneas sin tiempo de trayecto

Un número por línea: **minutos de cabecera a cabecera**. Las marcadas ⚠️ dependen del bloque 4;
si el recorrido cambia, el tiempo cambia — contéstalas después.

```
204 ⚠️ La Laguna · Intercambiador (2625) → La Trinidad (Centro La Laguna)       ___ min
219 ⚠️ La Laguna · Intercambiador (2625) → Taco                                 ___ min
345    Puerto de la Cruz · Estación → La Orotava · Estación → Aguamansa         ___ min
351    Puerto de la Cruz · Estación → La Orotava · Estación                     ___ min
353    Puerto de la Cruz · Estación → Los Realejos → La Orotava · Estación      ___ min
365    Buenavista del Norte · Terminal → 🏔️ Masca (Pueblo)                      ___ min
447    Los Cristianos · Estación → Costa Adeje · Estación → Adeje · Las Torre   ___ min
448    Adeje · Las Torres → La Caleta                                           ___ min
450    Costa Adeje · Estación → Los Cristianos · Estación → San Isidro (Enlac   ___ min
460    Icod de los Vinos → El Tanque → Santiago del Teide → Guía de Isora → C   ___ min
492    Chiguergue (7486) → Guía de Isora                                        ___ min
493    Guía de Isora → Playa San Juan → Alcalá → Puerto de Santiago (7222) →    ___ min
494    Guía de Isora → Playa San Juan → Alcalá → Los Gigantes · Terminal        ___ min
```

---

## BLOQUE 4 — 7 contradicciones

Aquí no necesito datos nuevos, necesito que arbitres. No toco ninguna hasta saberlo.

**Tejina** — coordenada GPS
  · lo pregunto porque: confirmaste que la 050 pasa por Tejina y ya está puesta, pero con la coordenada actual (-16.379) la línea da un rodeo de 4,7 km: pasa de 10,6 a 15,3 km. Tegueste, Bajamar y Punta del Hidalgo caen donde deben, así que la que baila es Tejina, unos 2 km al oeste
  · respuesta: ___

**204** — ¿es circular? ¿cuánto dura la vuelta y por dónde pasa?
  · lo pregunto porque: me diste 15 min, pero la app solo modela dos paradas a 300 m: saldría 1,1 km/h y el planificador diría que tarda un cuarto de hora en cruzar la calle
  · respuesta: ___

**219** — coordenada de San Matías
  · lo pregunto porque: me diste 25 min; la app se queda en Taco y salen 4,7 km/h. Con San Matías el tiempo encaja
  · respuesta: ___

**908** — ¿es circular? si lo es, ¿por dónde vuelve?
  · lo pregunto porque: le puse tus 25 min sobre el tramo Intercambiador-Ofra; si es un bucle, ese tramo es solo un trozo
  · respuesta: ___

**914** — igual que la 908
  · lo pregunto porque: 15 min sobre Intercambiador-Plaza Weyler, 1,2 km. Si es circular, falta el resto del bucle
  · respuesta: ___

**936** — ¿también 70 min, como la 934?
  · lo pregunto porque: son circulares gemelas en sentidos inversos y el folleto les da una sola ficha
  · respuesta: ___

**390** — frecuencia y ventana horaria
  · lo pregunto porque: ya es la corta de 25 min, pero conserva la frecuencia (60 min) y el horario (06:15-21:10) de la traza larga
  · respuesta: ___

---

## BLOQUE 5 — coordenadas

Las 88 paradas de `PARADAS-PENDIENTES.md`, formato `Nombre: lat, lng`. Empieza por la sección A.

Dos sueltas que bloquean cosas concretas:
- **La Caldera** (La Orotava) — la 345 termina ahí y se queda en Aguamansa por no tenerla.
- **Tejina** — la que tenemos da un rodeo de 4,5 km en la 050. Ver bloque 4.

---

## Lo que NO necesito

- Listados de qué líneas existen. Ya tengo el mapa: 171 números.
- Recorridos en texto. Los tengo de 121 líneas del folleto.

El cuello de botella es **tiempos, coordenadas y las contradicciones**.
