# Gasolineras · verificación contra el registro oficial (para Claude Code)

## Situación
Muchas fichas `category: "gasolinera"` de la app no corresponden a estaciones reales. Jerome ha buscado en Google Maps y ha hecho capturas; están transcritas en `gasolineras_capturas_google_lote1.json` (20 capturas; puede haber más lotes). **Google no es fuente oficial**: las capturas sirven para identificar estaciones reales, no para sacar coordenadas.

## Fuente oficial
Registro de precios de carburantes del Ministerio para la Transición Ecológica y el Reto Demográfico (API REST pública). Incluye todas las estaciones con rótulo, dirección, municipio, horario y coordenadas.

```
curl -s -H "Accept: application/json" \
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/38" \
  -o miteco_provincia38_AAAA-MM-DD.json
```
- Si ese dominio falla, la misma ruta cuelga de `https://energia.serviciosmin.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/`. Operaciones: `/help`.
- Si la red del entorno bloquea la descarga: PARAR y pedir a Jerome que la descargue desde el navegador y la suba al repo.
- La provincia 38 incluye La Palma, La Gomera y El Hierro: quedarse con Tenerife (bbox de la app) y asignar municipio por punto-en-polígono contra `municipios_tenerife.geojson` (paquete anterior); comparar con el campo `Municipio` del registro y marcar discrepancias.
- `Latitud` y `Longitud (WGS84)` vienen con coma decimal («28,4567»): convertir antes de usar.
- Guardar el `IDEESS` (identificador oficial de la estación) en cada ficha para poder re-sincronizar.
- Si el registro distingue tipo de venta, quedarse solo con las de venta al público.

## TAREA (solo lectura; nada entra en `index.html` sin OK de Jerome)
1. **Fichas actuales de la app.** Para cada gasolinera, buscar en el registro una estación a ≤ 300 m:
   - misma marca a ≤ 150 m → `confirmada` (+ IDEESS)
   - misma marca a 150–300 m → `corregir_coordenada` (coordenada del registro, antes/después)
   - otra marca en el sitio → `marca_distinta`
   - nada a ≤ 300 m → `no_existe_en_registro` → propuesta de baja
2. **Capturas de Jerome.** Localizar cada una en el registro por CP + calle + rótulo. Anotar IDEESS, coordenadas, dirección, horario y municipio (polígono). Si no aparece: `sin_registro` (no se da de alta).
3. **Altas.** Solo estaciones con registro oficial (prioridad: las de las capturas). Coordenadas, dirección y horario, del registro. Nombre = marca + localidad (p. ej. «DISA · Av. Francisco La Roche»), porque varias se llaman igual. Teléfono: solo el de la captura y solo con OK de Jerome (el registro no trae teléfonos); los 7 marcados «cortado», no usarlos sin confirmar.
4. **Entrega:** `gasolineras_verificacion.json` (indexado por id de la app: estado + evidencia) y `gasolineras_altas.json` (indexado por id nuevo), más un resumen corto.

## Reglas
- Nunca precios ni valoraciones en la app: son datos perecederos.
- Horario: el campo `Horario` del registro. El «cierre 22:00» de Google es solo el cierre del día de la captura.
- IMG_3472 lleva comillas dobles ASCII en el nombre (`Pcan "Consteide"`): escapar o usar «».
- Tras cualquier cambio en `index.html`, el pipeline de validación habitual.

## Lote 1 · capturas transcritas (IMG_3467–IMG_3487; no llegó IMG_3468)
| # | Captura | Estación (Google) | Dirección (Google) | Municipio en la dirección | Teléfono | Aviso |
|---|---|---|---|---|---|---|
| 1 | 3487 | Petroprix | C. Anaga, 38419 Los Realejos, Santa Cruz de Tenerife | Los Realejos | 953 90 00 09 | teléfono de Jaén |
| 2 | 3486 | Shell Las Dehesas | C. el Toscal, 8, 38417 Los Realejos, Santa Cruz de Tenerife | Los Realejos | 608 43 19 68 (cortado) | — |
| 3 | 3485 | Estación de servicio Cepsa | PARAJE EL TERRERO, S/N, 38410 Los Realejos, Santa Cruz de Tenerife | Los Realejos | 922 35 57 30 (cortado) | nombre genérico |
| 4 | 3484 | Gasolinera Tgas La Gorvorana | TF-320, 10, 38418 Los Realejos, Santa Cruz de Tenerife | Los Realejos | 922 34 50 06 (cortado) | — |
| 5 | 3483 | Gasolinera Tgas Tu Trébol | Las Nieves (T), 38670, Santa Cruz de Tenerife | ¿? (confirmar) | 922 95 95 00 | — |
| 6 | 3482 | Estación De Servicio Cepsa La Palmesa | Carr. Local, 75, 38360 El Sauzal, Santa Cruz de Tenerife | El Sauzal | 922 56 07 44 | — |
| 7 | 3481 | Estación de Servicio - Océano Güimar | Manzana 13, Parcela 10, 38508, Santa Cruz de Tenerife | ¿? (confirmar) | 699 48 02 08 | — |
| 8 | 3480 | E.S. DISA | Av. Trinidad, 78, 38203 La Laguna, Santa Cruz de Tenerife | La Laguna | 682 25 67 09 (cortado) | GLP, nombre genérico |
| 9 | 3479 | Gasolinera Tgas El Rosario | C. Isaac Peral, 38109 El Rosario, Santa Cruz de Tenerife | El Rosario | 922 26 84 43 | — |
| 10 | 3478 | E.S. BP | Carr. Gral. del Nte., 73, 38360 El Sauzal, Santa Cruz de Tenerife | El Sauzal | 822 17 85 44 | nombre genérico |
| 11 | 3477 | Estación de Servicio Repsol | TF-1, 54, 38611 San Isidro, Santa Cruz de Tenerife | ¿? (confirmar) | 922 39 09 09 | — |
| 12 | 3476 | E.S. BP Las Canteras | Av. de la República Argentina, 86, 38201 La Laguna, Santa Cruz de Tenerife | La Laguna | 922 25 58 15 (cortado) | — |
| 13 | 3475 | DISA | C/ Panamá, 1. Barrio Buenos Aires, C. Panamá, 3, Nave 8H, 38009 Santa Cruz de Tenerife | Santa Cruz de Tenerife | 609 50 84 60 | ¿venta al público?, nombre genérico |
| 14 | 3474 | DISA | Av. Francisco la Roche, S/N, 38001 Santa Cruz de Tenerife | Santa Cruz de Tenerife | — | nombre genérico |
| 15 | 3473 | Estación de Servicio DISA | Urb. Cuevas Blancas, C. Punta de la Vista, S/N, 38109 Santa María del Mar, Santa Cruz de Tenerife | ¿? (confirmar) | 689 75 29 53 (cortado) | — |
| 16 | 3472 | E.S. Pcan "Consteide" | Carr. de la Esperanza, 22, 38291 Santa Cruz de Tenerife | ¿? (confirmar) | 922 31 20 11 | comillas ASCII en el nombre |
| 17 | 3471 | DISA | C. Virgen de Begoña, 25, 38320 La Laguna, Santa Cruz de Tenerife | La Laguna | 922 64 86 05 | nombre genérico |
| 18 | 3470 | Estación de servicio Cepsa | JUNTO A CASAL DEL MAR, Carr. Autovìa San Andrès, S/N, 38001 Santa Cruz de Tenerife | Santa Cruz de Tenerife | 922 69 37 29 (cortado) | erratas en la dirección, nombre genérico |
| 19 | 3469 | Oceano | Cam. la Villa, 183, 38203 La Laguna, Santa Cruz de Tenerife | La Laguna | — | — |
| 20 | 3467 | E.S. BP San Benito | Autopista del Nte., KM 10, 38203 La Laguna, Santa Cruz de Tenerife | La Laguna | 922 25 91 35 | — |
