# Qué me falta — Tenerife Go

Generado de la tabla real. Rellena solo los huecos `___`. Cada bloque es independiente.

**Estado: 93 de 171 líneas (54 %) · 100 líneas en la tabla · 0 sin precio, frecuencia ni horario.**

---

## ✅ BLOQUES 1, 3 y 4 — cerrados salvo dos puntos

Bloque 1 cerrado. Bloque 3: solo queda la 204 y las 11 líneas nuevas. Bloque 4: 7 de 9 resueltas — quedan la coordenada de Tejina y el punto intermedio de la 204.

---

## BLOQUE 2 — la 030, a un solo dato

```
030  Puerto de la Cruz ↔ Aeropuerto Norte · cada 30 min · primera 06:30
     última salida: __:__     ← solo esto
     precio.......: ___ €
```

---

## BLOQUE 3 — 12 líneas sin tiempo de trayecto

Un número por línea: **minutos de cabecera a cabecera**. Las marcadas ⚠️ dependen del bloque 4;
si el recorrido cambia, el tiempo cambia — contéstalas después.

```
204 ⚠️ La Laguna · Intercambiador (2625) → La Trinidad (Centro La Laguna)       ___ min
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

## BLOQUE 4 — 2 contradicciones

Aquí no necesito datos nuevos, necesito que arbitres. No toco ninguna hasta saberlo.

**Tejina** — la coordenada que mandaste es la que ya teníamos
  · lo pregunto porque: 28.531233,-16.379203 está a 8,1 m de nuestra 28.53124,-16.37912. Es el mismo punto, así que el rodeo de 4,7 km en la 050 sigue igual. Si el punto correcto es otro, tiene que estar unos 2 km al este, hacia -16.355
  · respuesta: ___

**204** — coordenada de Barrio de San Honorato o de Avenida de La Trinidad
  · lo pregunto porque: confirmaste que es un bucle de 15 min, pero la app solo tiene Intercambiador y La Trinidad, a 300 m. Cerrando el bucle con esas dos salen 2,4 km/h. Con un punto intermedio del anillo, el tiempo encaja
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
