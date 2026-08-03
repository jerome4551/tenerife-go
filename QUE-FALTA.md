# Qué me falta — Tenerife Go

Generado de la tabla real. Rellena solo los huecos `___`. Cada bloque es independiente.

**Estado: 93 de 171 líneas (54 %) · 100 líneas en la tabla · 0 sin precio, frecuencia ni horario.**

---

## ✅ BLOQUES 1 y 3 — casi cerrados

Las 11 líneas nuevas están dentro, y 19 de los 21 tiempos aplicados. Quedan 13 líneas sin tiempo: las 11 nuevas (ese dato no venía) y la 204 y la 219, que están en el bloque 4.

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

## BLOQUE 4 — 6 contradicciones

Aquí no necesito datos nuevos, necesito que arbitres. No toco ninguna hasta saberlo.

**050** — ¿Tejina va entre Tegueste y Bajamar?
  · lo pregunto porque: con nuestra coordenada de Tejina ese tramo pasa de 3,6 a 8,1 km: se va al oeste y vuelve
  · respuesta: ___

**204** — ¿es circular y cuánto dura una vuelta?
  · lo pregunto porque: me diste 15 min, pero la app solo modela dos paradas a 300 m: saldría 1,1 km/h y el planificador diría que tarda 15 min en cruzar la calle
  · respuesta: ___

**219** — ¿llega a San Matías?
  · lo pregunto porque: me diste 25 min; la app se queda en Taco y con eso salen 4,7 km/h. Si el final es San Matías necesito su coordenada
  · respuesta: ___

**455** — ¿existe esta línea?
  · lo pregunto porque: 5 menciones en el folleto, no aparece en tu auditoría del sur
  · respuesta: ___

**936** — ¿también 70 min, como la 934?
  · lo pregunto porque: son circulares gemelas en sentidos inversos y el folleto les da una sola ficha
  · respuesta: ___

**390** — frecuencia y ventana
  · lo pregunto porque: ahora es comarcal de 25 min y sigue con la frecuencia y el horario de la traza larga
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
