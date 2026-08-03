# Qué me falta — Tenerife Go

Todo lo de aquí sale de la tabla real, no de memoria. Rellena solo los huecos `___`.
No hace falta que contestes entero: cada bloque va por su cuenta y cualquiera de ellos me desbloquea.

---

## BLOQUE 1 — 11 líneas listas para entrar hoy · **lo que más rinde**

Ya tengo el recorrido y todas sus coordenadas. Me faltan **cuatro datos por línea** y entran enteras.
Esto solo sube la cobertura del 48 % al 54 %.

```
345  Puerto de la Cruz → La Orotava → Aguamansa
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

351  Puerto de la Cruz → La Orotava
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

353  Puerto de la Cruz → Los Realejos → La Orotava
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

365  Buenavista del Norte → Masca
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

447  Los Cristianos → Costa Adeje → Adeje
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

448  Adeje → La Caleta
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

450  Costa Adeje → Los Cristianos → San Isidro
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

460  Icod de los Vinos → El Tanque → Santiago del Teide → Guía de Isora → Costa Adeje
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

492  Chiguergue → Guía de Isora
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

493  Guía de Isora → Playa San Juan → Alcalá → Puerto Santiago → Los Gigantes
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

494  Guía de Isora → Playa San Juan → Alcalá → Los Gigantes
     frecuencia: ___        (ej. "cada 30 min" o "4 salidas/día")
     precio....: ___ €      (billete sencillo)
     primera...: __:__      (salida más temprana, laborables)
     última....: __:__      (salida más tardía)

```

> La **última salida** es la que no puede faltar. Sin ella la línea se ofrece a las 3 de la madrugada.

---

## BLOQUE 2 — la 030, a un solo dato

Tengo coordenadas, recorrido (Puerto de la Cruz ↔ Aeropuerto Norte) y frecuencia (30 min).

```
030  primera: 06:30 (ya la tengo)
     última.: __:__   ← solo esto
     precio.: ___ €
```

---

## BLOQUE 3 — 21 líneas que ya están, sin tiempo de trayecto

Van con velocidad genérica, que en líneas urbanas se desvía mucho. Un número por línea: **minutos de cabecera a cabecera**.

```
015  🦉 Santa Cruz — La Laguna (Nocturna · línea 714)        ___ min
137  Santa Cruz — Güímar — Granadilla                       ___ min
201  La Laguna — Los Menceyes — La Verdellada — Cruz de P   ___ min
204  La Laguna — La Rúa — El Rayo — Trinidad (circular)     ___ min
213  La Laguna — El Cardonal — Las Chumberas                ___ min
219  La Laguna — El Cardonal — Taco — San Matías            ___ min
231  La Laguna — La Cuesta — Finca España                   ___ min
355  Buenavista — Masca — Santiago del Teide 🏔️             ___ min
390  Puerto de la Cruz — Icod — Guía de Isora — Costa Ade   ___ min
904  Intercambiador — Barrio de la Salud — Finca España     ___ min
908  Intercambiador — Ofra — Las Retamas                    ___ min
911  Intercambiador — Barrio de La Salud — Cuesta Piedra    ___ min
914  Circular centro · Plaza de España — Weyler — Mercado   ___ min
915  Intercambiador — Tío Pino — Camino del Hierro — Ofra   ___ min
933  Intercambiador — Taco — El Tablero                     ___ min
934  🦉 Circular Intercambiador — Taco — Santa María del M   ___ min
939  Intercambiador — El Sobradillo — Llano del Moro        ___ min
947  Intercambiador — San Andrés — El Bailadero — Chamorg   ___ min
970  🦉 Intercambiador — Barrio La Salud (Nocturna)          ___ min
974  🦉 Intercambiador — Añaza — Santa María del Mar (Noct   ___ min
975  🦉 Intercambiador — El Sobradillo — Llano del Moro (N   ___ min
```

---

## BLOQUE 4 — 8 contradicciones que no puedo resolver solo

En cada una, dos fuentes dicen cosas distintas. No toco ninguna hasta que me digas cuál vale.

**050** — Tejina entre Tegueste y Bajamar
  · por qué lo pregunto: con nuestra coordenada de Tejina el tramo pasa de 3,6 a 8,1 km: se va al oeste y vuelve
  · respuesta: ___

**390** — ¿Puerto de la Cruz ↔ Los Realejos, o hasta Costa Adeje?
  · por qué lo pregunto: tú la das corta; nosotros la tenemos llegando a Costa Adeje por Santiago del Teide. 60 km de diferencia
  · respuesta: ___

**908** — ¿circular por Somosierra y Chamberí, o a Ofra y Las Retamas?
  · por qué lo pregunto: el folleto dice circular; la app dice Ofra
  · respuesta: ___

**911** — ¿cabeceras Muelle Norte ↔ Ofra?
  · por qué lo pregunto: la app la saca del Intercambiador, que no sería su cabecera
  · respuesta: ___

**933** — ¿cabeceras Taco ↔ El Tablero?
  · por qué lo pregunto: la app le pone el Intercambiador por delante
  · respuesta: ___

**939** — ¿cabeceras Taco ↔ Llano del Moro?
  · por qué lo pregunto: la app la saca del Intercambiador
  · respuesta: ___

**947** — ¿termina en Chamorga o sigue a Punta de Anaga?
  · por qué lo pregunto: el folleto dice Punta de Anaga
  · respuesta: ___

**455** — ¿existe?
  · por qué lo pregunto: 5 menciones en el folleto, no aparece en tu auditoría del sur
  · respuesta: ___

---

## BLOQUE 5 — coordenadas

Las 88 paradas están en `PARADAS-PENDIENTES.md`, ya priorizadas. Formato `Nombre: lat, lng`.
Si vas a mandar solo unas pocas, empieza por la sección A: rellenan líneas que ya funcionan.

---

## Lo que NO necesito

- Listados de qué líneas existen. Con tus dos auditorías (norte y sur) ya tengo el mapa completo: **171 números**, sé cuáles son.
- Recorridos en texto. Los tengo de las 121 líneas del folleto.

El cuello de botella es **horarios, precios y coordenadas**, no qué líneas hay.
