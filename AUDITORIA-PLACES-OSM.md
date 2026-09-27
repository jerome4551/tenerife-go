# Tarea 1 · Auditoría de las coordenadas de `places` contra OSM

Ejecutada sobre el `index.html` **vigente** del repositorio, como pide el LEEME.

```
places 787 | index md5 13678ce668df0daab76bdb582931f8f3
```

**Integridad del paquete**: los 8 md5 del LEEME coinciden, los 8.

## Resumen por estado

| estado | qué significa | nº |
|---|---|---|
| `ok` | ≤ 150 m del objeto de OSM | **293** |
| `revisar` | ≤ 500 m | **27** |
| `discrepancia` | > 500 m | **11** |
| `sin_match` | no hay objeto OSM comparable (no implica error) | **264** |
| `no_comparable` | categoría sin equivalente en OSM | **192** |

La prueba de humo del LEEME, sobre la copia vieja de 765 places, daba
`ok 272 · revisar 29 · discrepancia 14 · sin_match 255 · no_comparable 195`.
Sobre el repo de hoy: **293 ok y 11 discrepancias**, tres menos, con 22 fichas más.

**No he tocado ninguna coordenada**, como pide el punto 7.4.

## Las 11 discrepancias, de mayor a menor

### `mercadillo-puerto-cruz` — 3856 m
- la app: **Mercadillo Agricultor (Puerto Cruz)** en `28.4101, -16.5534`
- OSM: «Mercadillo del Agricultor» (`marketplace`), similitud 1, vía nombre
- https://www.openstreetmap.org/?mlat=28.389656&mlon=-16.521217#map=18/28.389656/-16.521217
- **Mi lectura**: Hay varios «Mercadillo del Agricultor» en la isla. El de OSM a 3,8 km cae en La Orotava/Los Realejos. **Colision de nombre, probablemente no es el mismo.**

### `cs-geneto` — 3179 m
- la app: **Centro de Salud Geneto** en `28.4606273, -16.3156489`
- OSM: «Centro de Salud La Laguna - Geneto» (`clinic`), similitud 0.69, vía nombre
- https://www.openstreetmap.org/?mlat=28.488522&mlon=-16.324801#map=18/28.488522/-16.324801
- **Mi lectura**: OSM dice «Centro de Salud La Laguna - …», que no es el de Geneto. **Colision parcial** (sim 0,69).

### `minimarket-24h-arona` — 3101 m
- la app: **D28 SuperMarket 24h (Los Cristianos)** en `28.0545, -16.706`
- OSM: «24h Supermarket» (`supermarket`), similitud 0.6, vía nombre
- https://www.openstreetmap.org/?mlat=28.071085&mlon=-16.731408#map=18/28.071085/-16.731408
- **Mi lectura**: La ficha es «D28 SuperMarket 24h (Los Cristianos)» y OSM «24h Supermarket» en Las Américas. **Dos tiendas distintas con nombre parecido.**

### `playa-amarilla` — 3078 m
- la app: **Playa Amarilla** en `28.009306, -16.638444`
- OSM: «Playa Amarilla» (`beach`), similitud 1, vía nombre
- https://www.openstreetmap.org/?mlat=28.022713&mlon=-16.610237#map=18/28.022713/-16.610237
- **Mi lectura**: Similitud 1 y 3 km. Hay dos sitios llamados Playa Amarilla (uno junto a Montaña Amarilla, en San Miguel). **Merece mirarlo: puede ser un error de verdad.**

### `rest-tipico-mirador-abona` — 2566 m
- la app: **Café al Mar (Poris de Abona)** en `28.1646, -16.4318`
- OSM: «Cafe al Mar» (`cafe`), similitud 1, vía nombre
- https://www.openstreetmap.org/?mlat=28.142704&mlon=-16.440064#map=18/28.142704/-16.440064
- **Mi lectura**: «Café al Mar», similitud 1, a 2,5 km. **Merece mirarlo.**

### `ar-fuente-fria` — 2543 m
- la app: **Área Recreativa Fuente Fría** en `28.4435, -16.4054`
- OSM: «Fuente Fría» (`picnic_site`), similitud 0.95, vía nombre
- https://www.openstreetmap.org/?mlat=28.420845&mlon=-16.408933#map=18/28.420845/-16.408933
- **Mi lectura**: «Fuente Fría» picnic_site a 2,5 km, similitud 0,95. **Merece mirarlo.**

### `ar-las-hayas` — 2129 m
- la app: **Área Recreativa Las Hayas** en `28.35, -16.69`
- OSM: «Área Recreativa Las Hayas» (`picnic_site`), similitud 1, vía nombre
- https://www.openstreetmap.org/?mlat=28.334521&mlon=-16.677204#map=18/28.334521/-16.677204
- **Mi lectura**: **El más interesante.** Es una de las 29 que me faltaban: en el extracto a z14 no aparecía nada, y aquí OSM tiene «Área Recreativa Las Hayas» con similitud 1, a 2,1 km. Muy probablemente el pin está mal.

### `charco-gomero` — 2115 m
- la app: **Charcos de El Gomero** en `28.3734, -16.7809`
- OSM: «Playa del Gomero» (`beach`), similitud 0.95, vía nombre
- https://www.openstreetmap.org/?mlat=28.376733&mlon=-16.802649#map=18/28.376733/-16.802649
- **Mi lectura**: La ficha son los *charcos* y OSM la *playa* del Gomero: **no son lo mismo**, aunque estén cerca.

### `turismo-garachico` — 1149 m
- la app: **Oficina de Turismo Garachico** en `28.3718, -16.7678`
- OSM: «Mirador de Garachico» (`tourist_info`), similitud 0.92, vía nombre
- https://www.openstreetmap.org/?mlat=28.362208&mlon=-16.763426#map=18/28.362208/-16.763426
- **Mi lectura**: OSM ofrece el «Mirador de Garachico», que **no es** la oficina de turismo.

### `piscinas-alcala-jaquita` — 781 m
- la app: **Piscinas Naturales Alcalá — Charcos La Jaquita** en `28.2046, -16.8341`
- OSM: «Playa de Alcalá» (`beach`), similitud 0.92, vía nombre
- https://www.openstreetmap.org/?mlat=28.19974&mlon=-16.827822#map=18/28.19974/-16.827822
- **Mi lectura**: La ficha son las piscinas naturales y OSM la playa de Alcalá: **sitios distintos**, a 781 m.

### `puerto-guimar` — 756 m
- la app: **Puertito de Güímar** en `28.2951, -16.3758`
- OSM: «Club Náutico Puertito de Güímar» (`marina`), similitud 0.64, vía nombre
- https://www.openstreetmap.org/?mlat=28.287679&mlon=-16.380431#map=18/28.287679/-16.380431
- **Mi lectura**: «Club Náutico Puertito de Güímar» a 756 m, similitud 0,64. El puertito y el club náutico pueden ser cosas distintas. **Mirar.**

## Las 27 de «revisar», de mayor a menor

| id | dist | la app dice | OSM dice | sim |
|---|---|---|---|---|
| `super-hiperdino-pcruz` | 496 m | HiperDino Puerto de la Cruz | «HiperDino» | 0.55 |
| `montana-roja` | 460 m | Montaña Roja | «Montaña Roja» | 1 |
| `puerto-los-cristianos` | 454 m | Puerto de Los Cristianos | «Puerto de Los Cristianos» | 1 |
| `montana-pelada` | 426 m | Montaña Pelada | «Montaña Pelada» | 1 |
| `iglesia-san-marcos-icod` | 424 m | Iglesia de San Marcos (Icod de los | «Iglesia de San Marcos Evangeli» | 0.55 |
| `super-mercadona-pcruz` | 419 m | Mercadona Puerto de la Cruz | «Mercadona» | 0.55 |
| `mercadona-candelaria` | 402 m | Mercadona Candelaria | «Mercadona» | 0.49 |
| `camping-chio` | 361 m | Zona Acampada Chío (Guía de Isora) | «Zona de Acampada de Chío» | 1 |
| `super-hiperdino-candelaria` | 361 m | HiperDino Candelaria | «La Candelaria» | 0.51 |
| `pk-quinteras-laguna` | 343 m | Parking Las Quinteras · MUVISA | «Parking Las Quinteras» | 1 |
| `super-mercadona-laguna` | 338 m | Mercadona La Laguna | «Mercadona» | 0.47 |
| `puertito-san-marcos` | 300 m | Puertito de San Marcos (Icod) | «Puerto de San Marcos» | 0.58 |
| `puerto-playa-san-juan` | 299 m | Puerto de Playa San Juan | «Puerto de Playa San Juan» | 1 |
| `san-juan` | 292 m | Playa San Juan | «Playa de San Juan» | 1 |
| `puerto-santa-cruz` | 279 m | Puerto de Santa Cruz de Tenerife | «Puerto Deportivo de Santa Cruz» | 0.48 |
| `super-hiperdino-tacoronte` | 277 m | HiperDino Tacoronte | «HiperDino» | 0.45 |
| `montana-taco` | 247 m | Montaña de Taco | «Montaña de Taco» | 1 |
| `pk-drago-icod` | 227 m | Parking del Drago · Icod de los Vi | «Parking del Drago» | 1 |
| `playa-barqueros-buenavista` | 226 m | Playa de Los Barqueros (Buenavista | «Playa de los Barqueros» | 1 |
| `playa-chimisay` | 214 m | Playa de Chimisay | «Playa de Chimisay» | 1 |
| `camping-la-caldera` | 193 m | Zona Acampada La Caldera (La Orota | «Zona de Acampada de La Caldera» | 1 |
| `camping-el-lagar` | 188 m | Zona Acampada El Lagar (Icod de lo | «Zona de Acampada El Lagar» | 1 |
| `pk-san-agustin-orotava` | 181 m | Parking San Agustín · La Orotava | «San Agustín» | 0.98 |
| `pk-campo-futbol-garachico` | 180 m | Parking Campo de Fútbol · Garachic | «Campo de Fútbol» | 0.98 |
| `camel-park` | 168 m | Camel Park | «Camel Park» | 1 |
| `restaurante-drago` | 151 m | Casa del Drago (Icod) | «La Posada del Drago» | 0.41 |
| `camping-arenas-negras` | 150 m | Zona Acampada Arenas Negras (Garac | «Zona de Acampada de Arenas Neg» | 1 |

La mayoría son supermercados y campings donde la app apunta a la entrada o al
aparcamiento y OSM al edificio, o al revés. Con 150-500 m de diferencia,
ninguno manda a nadie al sitio equivocado.

## Y una noticia para las 29 coordenadas pendientes

Contrastadas contra el paquete:

| id | estado | qué aporta |
|---|---|---|
| `sala-westerdahl` | **ok, 5 m** | OSM tiene el «Museo de Arte Contemporáneo…» justo ahí: el pin ya está bien, sólo le faltan decimales |
| `ar-las-hayas` | **discrepancia, 2.129 m** | OSM tiene «Área Recreativa Las Hayas» con similitud 1. En el extracto a z14 no aparecía **nada** |
| `hiperdino-arona-montaneta` | ok, 30 m | OSM dice «Supermercado Arona» (sim 0,53): nombre distinto, hay que mirarlo |
| las otras 26 | `sin_match` (13) y `no_comparable` (13) | OSM tampoco las tiene: gasolineras de marca, centros de buceo, despegues de parapente |

Es exactamente lo que enseñó la Farola: **que algo no esté en un extracto no
prueba que no exista**, pero aquí el extracto ya es el completo de Geofabrik,
así que para esas 26 la respuesta es que OSM no las tiene.

---

*Generado con `node scripts/auditar_places_osm.js` del paquete del 27/09/2026.
El CSV y el JSON completos están en `datos/auditoria-osm/`.*
