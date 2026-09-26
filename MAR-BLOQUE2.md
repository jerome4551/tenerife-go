# Bloque 2 · Los 6 lugares con el pin en el agua

De los 787, **6 caen fuera de tierra** contra la capa `earth` del OSM que ya
lleva el repositorio. Dos son errores de verdad y cuatro son precisión del
dibujo de la costa:

| id | se mete | qué pasa |
|---|---|---|
| `faro-santa-cruz-puerto` | **444 m** | el pin está en mitad de la dársena |
| `pk-poris-abona` | **82 m** | el pin está en el mar, no en el aparcamiento |
| `lidl-puerto-cruz` | 46 m | |
| `pk-bajamar-piscinas` | 28 m | |
| `whale-watching` | 23 m | está dentro de la marina, a propósito |
| `ermita-san-telmo` | 19 m | |

**Buenas noticias: tres se resuelven sin que busques nada.** Los parches
pedían Overpass y el shapefile del Cabildo, que desde aquí están cerrados —
pero el dato que pedían ya estaba dentro del repositorio, igual que pasó con
la Casa de Alvarado-Bracamonte. Lo he sacado con `tools/osm_cerca.py`, que
ahora también mide **vías rodadas al segmento**, nunca al vértice.

---

## A · Las tres que ya tienen respuesta (solo falta tu visto bueno)

### A1 · `lidl-puerto-cruz` — y tenías razón con el nombre
- **Ahora**: `28.4200, -16.5450` → 46 m mar adentro.
- **El parche pedía**: «el Lidl de la Carretera Icod-Santa Cruz», elegido entre
  los candidatos de OSM, **más** el shapefile del Cabildo para el municipio.
- **Lo que hay en el OSM del repositorio**: **un solo Lidl** a menos de
  2,5 km, en `28.398370, -16.541677`. Y encaja con las dos condiciones:
  - está a **81 m de la «Carretera Gral. Icod-Santa Cruz»**, que es
    literalmente la carretera que nombra el parche;
  - cae en **Puerto de la Cruz**: de las 14 paradas más cercanas, 8 no tienen
    raya municipal en medio y **todas son de Puerto de la Cruz**.
  - En tierra, a **232 m** del borde. Se mueve **2.427 m**.
- **Y para que no quede duda de que el extracto no se lo está comiendo**: hay
  **23 elementos «Lidl»** en toda la isla y **373 supermercados**. Si no
  aparece otro Lidl en Puerto de la Cruz es porque no lo hay.

### A2 · `pk-poris-abona` — el aparcamiento de Porís
- **Ahora**: `28.1631, -16.4308` → 82 m mar adentro.
- **El parche pedía**: la vía rodada más cercana al ancla `28.164247,
  -16.431573` (ficha oficial de Playa El Porís), **a 80 m como mucho**.
- **Lo que sale**: una vía rodada a **35 m** del ancla, en
  `28.164465, -16.431835`. Cumple el límite de sobra.
- **Y cuadra con el sitio**: a **33 m** tiene la «Playa el Porís» y a 85 m el
  núcleo «Porís de Abona». En tierra, a **40 m** del borde. Se mueve 183 m.
- Es una calle **sin nombre en OSM**; la siguiente con nombre es «Calle Martín
  Rodríguez», a 58 m del ancla, que también cumpliría. Dime si prefieres ésa.

### A3 · `pk-bajamar-piscinas` — el aparcamiento de las piscinas
- **Ahora**: `28.5562, -16.3458` → 28 m mar adentro.
- **El parche pedía**: la vía rodada más cercana a las piscinas. El ancla
  cuadra: `piscinas-bajamar` está en `28.5564, -16.3445`.
- **Lo que sale**, aplicando la regla al pie de la letra: una vía de servicio
  a **30 m**, en `28.556153, -16.344373`, a **41 m** de las «Piscinas
  Naturales de Bajamar». En tierra.
- ⚠️ **Pero queda a 2,9 m del borde dibujado**, y el parche del mar exigía
  **3 m o más** justo para evitar eso: a esa distancia, cualquier retoque del
  dibujo de la costa la devuelve al agua.
- **La alternativa**: «Avenida del Sol», a 63 m del ancla, en
  `28.555878, -16.344250`, que está **33,5 m tierra adentro**. Más lejos de
  las piscinas, pero estable.
- **Tú decides**: ¿la regla al pie de la letra, o la que no se va a mover?

---

## B · Las tres que siguen necesitando algo de fuera

### B1 · `faro-santa-cruz-puerto` — el único error gordo que queda
- **Ahora**: `28.4789, -16.2289` → **444 m mar adentro**.
- **El parche propone** convertirla en la **Farola del Mar** (el faro histórico
  del Muelle de Enlace), en `28.46935, -16.24581`.
- **Por qué sigue parada**: esa coordenada cae en tierra pero **a 1,4 m del
  borde**, y el propio parche exige 3 m o más. Su `si_falla` es una consulta a
  Overpass.
- **Lo he buscado en el OSM del repositorio y no está**: **0 elementos de tipo
  faro en toda la isla** y **0 con «faro» o «farola» en el nombre**. El
  extracto no los lleva, así que aquí no hay de dónde sacarlo.
- **Lo que necesito**: un punto de la Farola a más de 3 m del borde, o el
  volcado de Overpass. *(La Farola es un sitio real y bien documentado; lo que
  falla es el margen, no la fuente.)*
- **Ojo con el texto**: el del parche viene en 8 idiomas y la app tiene 10.
  El búlgaro y el polaco los escribo yo, como siempre.

### B2 · `whale-watching` — la comprobación no se puede hacer como está escrita
- **Ahora**: `28.0780, -16.7364` → 23 m mar adentro, **dentro de la marina**.
- **El parche propone** empujarlo 10 m a tierra: `28.077710, -16.736308`. Ese
  cálculo sí sale sin red, se mueve 33 m (el límite son 60) y cae en tierra…
  **a 0,8 m del borde**.
- **Y su comprobación obligatoria no se puede hacer**: pide que el punto quede
  dentro del **polígono** de la marina «Colón» de OSM o a 50 m. En el extracto
  la marina **no es un polígono, es un punto** (`28.078257, -16.736845`), y
  medido contra él el punto propuesto queda a **80 m** — fuera de los 50. El
  pin de hoy está a 52 m, también fuera.
- **Mi opinión**: no lo tocaría. Es una excursión en barco: el pin en el agua,
  dentro del puerto deportivo, no engaña a nadie, y los otros ocho lugares que
  están en el agua a propósito (puertos y marinas) se dejan igual. **Dime si
  lo sacamos de la lista** en vez de moverlo.

### B3 · `ermita-san-telmo` — la ermita no está en el extracto
- **Ahora**: `28.4176, -16.5472` → 18,6 m mar adentro.
- **El parche propone** el edificio de la ermita en OSM, contrastado con la
  dirección oficial (calle San Telmo 5).
- **Lo que hay en el repositorio**: la **«Playa de San Telmo»** a 65 m y el
  **«Paseo de San Telmo»** a 70 m, así que el barrio es el correcto; pero de
  la ermita no hay ni rastro. Los dos lugares de culto más cercanos son la
  «Iglesia de Nuestra Señora de la Peña de Francia» (129 m) y la «Iglesia de
  San Francisco» (272 m), que **no son** la ermita.
- **Lo que necesito**: la coordenada de la ermita, o el volcado de Overpass.
  *(Con 18,6 m, empujarla al borde sería ponerla en el paseo, no en el
  edificio: prefiero no inventarlo.)*

---

## Los ocho que están en el agua a propósito

No cuentan como fallo y el control los lista aparte. **Dime si prefieres que
el pin vaya en el muelle** en vez de en la dársena:

| id | se mete | qué es |
|---|---|---|
| `puertito-poris-abona` | 241 m | embarcadero de Porís |
| `puerto-granadilla-comercial` | 216 m | puerto industrial, sin acceso público |
| `puerto-colon-adeje` | 150 m | puerto deportivo de Costa Adeje |
| `puerto-los-cristianos` | 47 m | puerto de ferris |
| `puerto-garachico` | 14 m | puerto de Garachico |
| `puerto-marina-tenerife-sc` | 5 m | Marina Tenerife |
| `piscina-hidalgo-norte` | 3 m | piscina natural |
| `puertito-fasnia` | 1 m | puertito de Fasnia |

---

## Cómo se aplican, cuando digas

```
python3 tools/fijar_coordenada.py --fichero nuevas.txt
```

Comprueba cada una antes de escribir —que el id exista, que caiga en Tenerife,
que caiga **en tierra**, y cuántos metros se mueve—, **apunta la fuente en
`datos/verificado.json`** y no escribe nada si alguna falla.

---

*Las distancias de este documento salen de `tools/osm_cerca.py`,
`tools/costa.py` y `tools/municipio_raya.py`. Ninguna está escrita a mano.*
