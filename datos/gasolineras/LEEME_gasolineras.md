# Gasolineras · verificación contra el registro oficial (para Claude Code)

## Situación
Muchas fichas `category: "gasolinera"` de la app no corresponden a estaciones reales. Jerome ha buscado en Google Maps y ha hecho capturas; están transcritas en `gasolineras_capturas_google.json` (62 capturas, lotes 1–4). **Google no es fuente oficial**: las capturas sirven para identificar estaciones reales, no para sacar coordenadas.

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

## Decisiones de Jerome (ya aplicadas en el fichero)
- **Moeve:** todas las Cepsa se nombran Moeve en la app (la marca cambió y el rótulo se está cambiando estación a estación). En el registro, buscar rótulo CEPSA o MOEVE.
- **Duplicado eliminado:** IMG_3447 («Gasolinera sc barata»), ficha duplicada de la DISA de IMG_3455 (misma dirección, 1 reseña, sin teléfono ni horario).

## Cotejo previo (hecho aquí)
- Cada captura se ha buscado en el listado de gasolineras por municipio de Canarias7 (rótulo y dirección de cada estación; consulta 01/10/2026). Es un cotejo previo: **no sustituye al registro oficial**, pero el campo `registro_c7` da el rótulo y la dirección con los que buscarla en él.
- Resultado: 47 confirmadas (rótulo y dirección casan), 10 probables (misma marca y misma zona, pero cambia el número, el km o el rótulo), 2 sin casar (IMG_3464 Pcan Rodeos e IMG_3454 Repsol TF-263: hay varias de esa marca en La Laguna y ninguna casa) y 3 sin cotejar (IMG_3485, IMG_3477, IMG_3481).
- **Dobletes: ninguno.** Ninguna estación del listado ha casado con dos capturas. IMG_3425 e IMG_3426 llegaron dos veces y están una sola vez. Las parejas parecidas son estaciones distintas: las dos DISA de Av. de los Majuelos (Disa Los Majuelos y Disa El Sobradillo), las dos Tgas Tu Trébol (Santa Cruz y Adeje) y las dos Shell de Santa Cruz (Ofra y El Ramonal).

## Municipio
- `localidad_google` es lo que Google escribe tras el código postal; no siempre es el municipio.
- `municipio` sale del polígono oficial aplicado a la posición OSM de la gasolinera (solo con emparejamiento único y a 100 m o más del límite) o, si no, del municipio en cuyo listado aparece. No hay ningún conflicto entre ambas fuentes.
- **Corregido:** IMG_3457, Repsol «Los Rodeos». Google dice Tegueste, pero el listado de Tegueste no tiene ninguna Repsol (sí el de La Laguna) y el polígono también da La Laguna.
- **Sin municipio:** IMG_3485, IMG_3481, IMG_3477, IMG_3464. Lo decide la coordenada oficial del registro.
- IMG_3432 (Disa Los Majuelos): el listado la pone en La Laguna y Google en Taco (Santa Cruz). Confirmar con la coordenada oficial.

## Cómo leer el resto
- Los horarios de las capturas son solo el cierre del día en que se hicieron.
- IMG_3428 (DISA Pedro de Valdivia): Google dice «Combustible (FUERA DE SERVICIO POR OBRAS)». No dar de alta sin confirmar que está operativa.
- «Tgas Tu Trébol» de Las Nieves (IMG_3483) y «Tgas Tu Trébol - Santa Cruz» (IMG_3444) son estaciones distintas.

## TAREA (solo lectura; nada entra en `index.html` sin OK de Jerome)
1. **Fichas actuales de la app.** Para cada gasolinera, buscar en el registro una estación a ≤ 300 m:
   - misma marca a ≤ 150 m → `confirmada` (+ IDEESS)
   - misma marca a 150–300 m → `corregir_coordenada` (coordenada del registro, antes/después)
   - otra marca en el sitio → `marca_distinta`
   - nada a ≤ 300 m → `no_existe_en_registro` → propuesta de baja
2. **Capturas de Jerome.** Localizar cada una en el registro por rótulo + dirección (`registro_c7`), o por CP + calle si no hay cotejo. Anotar IDEESS, coordenadas, dirección, horario y municipio (polígono). Si no aparece: `sin_registro` (no se da de alta). Si el municipio del polígono no coincide con el campo `municipio` de la captura, PARAR y avisar.
3. **Altas.** Solo estaciones con registro oficial (prioridad: las de las capturas). Coordenadas, dirección y horario, del registro. Nombre = marca + localidad (p. ej. «DISA · Av. Francisco La Roche»), porque varias se llaman igual; las Cepsa, como Moeve. Teléfono: solo el de la captura y solo con OK de Jerome (el registro no trae teléfonos); los 24 marcados «cortado», no usarlos sin confirmar.
4. **Entrega:** `gasolineras_verificacion.json` (indexado por id de la app: estado + evidencia) y `gasolineras_altas.json` (indexado por id nuevo), más un resumen corto.

## Reglas
- Nunca precios ni valoraciones en la app: son datos perecederos.
- Horario: el campo `Horario` del registro.
- Nombres con comillas dobles ASCII (IMG_3472, IMG_3457): escapar o usar «».
- Tras cualquier cambio en `index.html`, el pipeline de validación habitual.

## Capturas transcritas (1: IMG_3467–IMG_3487 (falta IMG_3468) · 2: IMG_3446–IMG_3466 (falta IMG_3462) · 3: IMG_3425–IMG_3445 (falta IMG_3427) · 4: IMG_3422–IMG_3424 (IMG_3425 e IMG_3426 llegaron otra vez: no se duplican))
| # | Captura | Estación (Google) | Dirección (Google) | Listado por municipio | Municipio | Teléfono | Aviso |
|---|---|---|---|---|---|---|---|
| 1 | 3487 | Petroprix | C. Anaga, 38419 Los Realejos, Santa Cruz de Tenerife | confirmada: Petroprix · Calle Anaga, 1 | Los Realejos | 953 90 00 09 | teléfono de Jaén |
| 2 | 3486 | Shell Las Dehesas | C. el Toscal, 8, 38417 Los Realejos, Santa Cruz de Tenerife | confirmada: Shell Las Dehesas · Carretera El Toscal Km. S/n | Los Realejos | 608 43 19 68 (cortado) | — |
| 3 | 3485 | Estación de servicio Cepsa | PARAJE EL TERRERO, S/N, 38410 Los Realejos, Santa Cruz de Tenerife | sin cotejar | pendiente | 922 35 57 30 (cortado) | nombre genérico, Google: Cepsa → app: Moeve |
| 4 | 3484 | Gasolinera Tgas La Gorvorana | TF-320, 10, 38418 Los Realejos, Santa Cruz de Tenerife | confirmada: Tgas La Gorvorana · Carretera Crt Gral Icod-s/c.pk 38.8 Km. 38,8 | Los Realejos | 922 34 50 06 (cortado) | — |
| 5 | 3483 | Gasolinera Tgas Tu Trébol | Las Nieves (T), 38670, Santa Cruz de Tenerife | confirmada: Tgas-tu TrÉbol · Autopista Tf1 Autopista Sur A ArmeÑime, Cruce La Caleta Km. S/n | Adeje | 922 95 95 00 | — |
| 6 | 3482 | Estación De Servicio Cepsa La Palmesa | Carr. Local, 75, 38360 El Sauzal, Santa Cruz de Tenerife | probable: Cepsa · Cr Tf-172, 0,9 | El Sauzal (probable) | 922 56 07 44 | Google: Cepsa → app: Moeve |
| 7 | 3481 | Estación de Servicio - Océano Güimar | Manzana 13, Parcela 10, 38508, Santa Cruz de Tenerife | sin cotejar | pendiente | 699 48 02 08 | — |
| 8 | 3480 | E.S. DISA | Av. Trinidad, 78, 38203 La Laguna, Santa Cruz de Tenerife | probable: Disa Padre Anchieta · Glorieta Del Brasil, S/n | San Cristóbal de La Laguna | 682 25 67 09 (cortado) | GLP, nombre genérico |
| 9 | 3479 | Gasolinera Tgas El Rosario | C. Isaac Peral, 38109 El Rosario, Santa Cruz de Tenerife | confirmada: Tgas El Rosario · Calle Isaac Peral, 10 | El Rosario | 922 26 84 43 | — |
| 10 | 3478 | E.S. BP | Carr. Gral. del Nte., 73, 38360 El Sauzal, Santa Cruz de Tenerife | confirmada: Bp El Sauzal · Carretera General Del Norte Km. 20,65 | El Sauzal | 822 17 85 44 | nombre genérico |
| 11 | 3477 | Estación de Servicio Repsol | TF-1, 54, 38611 San Isidro, Santa Cruz de Tenerife | sin cotejar | pendiente | 922 39 09 09 | nombre genérico |
| 12 | 3476 | E.S. BP Las Canteras | Av. de la República Argentina, 86, 38201 La Laguna, Santa Cruz de Tenerife | confirmada: Bp E.s. Las Canteras S.l. · Avenida Republica Argentina, 86 | San Cristóbal de La Laguna | 922 25 58 15 (cortado) | — |
| 13 | 3475 | DISA | C/ Panamá, 1. Barrio Buenos Aires, C. Panamá, 3, Nave 8H, 38009 Santa Cruz de Tenerife | confirmada: Disa Hogar Taxista · Calle Panama, S/n | Santa Cruz de Tenerife | 609 50 84 60 | ¿venta al público?, nombre genérico |
| 14 | 3474 | DISA | Av. Francisco la Roche, S/N, 38001 Santa Cruz de Tenerife | confirmada: Disa Nautico · Avenida Francisco La Roche, 1 | Santa Cruz de Tenerife | — | nombre genérico |
| 15 | 3473 | Estación de Servicio DISA | Urb. Cuevas Blancas, C. Punta de la Vista, S/N, 38109 Santa María del Mar, Santa Cruz de Tenerife | confirmada: Disa Cuevas Blancas · Calle Guaire - Urb.cuevas Blancas, S/n | Santa Cruz de Tenerife | 689 75 29 53 (cortado) | nombre genérico |
| 16 | 3472 | E.S. Pcan "Consteide" | Carr. de la Esperanza, 22, 38291 Santa Cruz de Tenerife | probable: Pcan · Carretera Tf-24 La Laguna-el Portillo Km. 2,2 | San Cristóbal de La Laguna (probable) | 922 31 20 11 | comillas ASCII en el nombre |
| 17 | 3471 | DISA | C. Virgen de Begoña, 25, 38320 La Laguna, Santa Cruz de Tenerife | probable: Disa Vistabella · Calle Milagrosa (la) La Cuesta, 2 | San Cristóbal de La Laguna | 922 64 86 05 | nombre genérico |
| 18 | 3470 | Estación de servicio Cepsa | JUNTO A CASAL DEL MAR, Carr. Autovìa San Andrès, S/N, 38001 Santa Cruz de Tenerife | probable: Cepsa · Avenida Anaga (de), S/n | Santa Cruz de Tenerife (probable) | 922 69 37 29 (cortado) | erratas en la dirección, nombre genérico, Google: Cepsa → app: Moeve |
| 19 | 3469 | Oceano | Cam. la Villa, 183, 38203 La Laguna, Santa Cruz de Tenerife | probable: Es Taxlaguna · Camino De La Villa, 175 | San Cristóbal de La Laguna (probable) | — | — |
| 20 | 3467 | E.S. BP San Benito | Autopista del Nte., KM 10, 38203 La Laguna, Santa Cruz de Tenerife | confirmada: Bp San Benito · Cr Autopista Del Norte, Km. 10,2 | San Cristóbal de La Laguna | 922 25 91 35 | — |
| 21 | 3466 | Gasolinera Tgas Tegueste | Carretera General La Laguna Punta Hidalgo, Km 7, Calle Belletero, 2, 38280 Tegueste, Santa Cruz de Tenerife | confirmada: Tgas Tegueste · Carretera Tf-13 La Laguna - Bajamar Km. 6 | Tegueste | 922 54 13 15 (cortado) | — |
| 22 | 3465 | DISA | C. Fomento, 3, 38003 Santa Cruz de Tenerife | confirmada: Disa Fomento · Calle Fomento, S/n | Santa Cruz de Tenerife | 608 28 66 62 | nombre genérico |
| 23 | 3464 | E.S. Pcan Rodeos | Carretera General Norte Rodeos, 174E, 38206 San Cristóbal de La Laguna, Santa Cruz de Tenerife | sin casar | pendiente | 922 63 09 03 | — |
| 24 | 3463 | Estación de servicio Tgas Los Baldíos | TF-265, C. San Francisco de Paula, km 3, 38291 Los Baldios, Santa Cruz de Tenerife | confirmada: Tgas Los BaldÍos · Carretera Tf-265 Km. 2 | San Cristóbal de La Laguna | — | — |
| 25 | 3461 | DISA | Av. de los Majuelos, 25, 38107 Santa Cruz de Tenerife | probable: Disa El Sobradillo · Carretera Los Majuelos - Sobradillo Km. S/n | Santa Cruz de Tenerife (probable) | 689 75 18 72 | nombre genérico |
| 26 | 3460 | Estación de Servicio - Océano Tabares | Carretera Valle Tabares - Ctra. 111 km 8,3-, 38329 La Laguna, Santa Cruz de Tenerife | confirmada: OcÉano · Carretera Tf-111 Km. 8,346 | San Cristóbal de La Laguna | — | — |
| 27 | 3459 | Estación de servicio Moeve | POLIGONO INDUSTRIAL LA CAMPANA, C. la Campana, 2, 38109 El Rosario, Santa Cruz de Tenerife | confirmada: Moeve · C/ La Campana, S/n (ctra. Gral. Del Sur Km 4) | El Rosario | 822 90 92 42 (cortado) | nombre genérico |
| 28 | 3458 | Estación de servicio Tgas La Laguna | Pl. San Cristóbal, 9, 38204 La Laguna, Santa Cruz de Tenerife | confirmada: Tgas Montesdeoca · Plaza San Cristobal, 9 | San Cristóbal de La Laguna | — | — |
| 29 | 3457 | Estación de Servicio "Los Rodeos" | C. Molino Viejo, 1A, 38292 Tegueste, Santa Cruz de Tenerife | probable: Repsol · Carretera General Del Norte Km. 13200 | **San Cristóbal de La Laguna (corregido)** | 922 63 83 65 | comillas ASCII en el nombre |
| 30 | 3456 | Estación de Servicio Repsol | Calle Via Servicio Darsena P, 2, 38120 Santa Cruz de Tenerife | probable: Repsol · VÍa Interior Del Puerto, S/n | Santa Cruz de Tenerife | 922 54 90 80 | nombre genérico |
| 31 | 3455 | DISA | Polígono Industrial El Mayorazgo, C. Jesús Hernández Guzmán, 12, 38110 Santa Cruz de Tenerife | confirmada: Disa El Mayorazgo · Calle Jesus Hernandez Guzman, 12 | Santa Cruz de Tenerife | — | GLP, nombre genérico |
| 32 | 3454 | Estación de Servicio Repsol | TF-263, 3,5 IZ, 38296 La Laguna, Santa Cruz de Tenerife | sin casar | San Cristóbal de La Laguna | 922 63 33 82 | nombre genérico |
| 33 | 3453 | Gasolinera Tgas Las Mercedes | Carr. al Monte las Mercedes, Km 0,5, 38293 La Laguna, Santa Cruz de Tenerife | confirmada: Tgas Las Mercedes · Carretera Tf-12 Las Canteras Km. 0,5 | San Cristóbal de La Laguna | 671 62 32 72 | — |
| 34 | 3452 | E.S. Shell La Laguna | Av. Leonardo Torriani, 28, 38205 La Laguna, Santa Cruz de Tenerife | confirmada: Shell La Laguna · Avenida Calvo Sotelo, S/n | San Cristóbal de La Laguna | 689 75 20 51 (cortado) | — |
| 35 | 3451 | Estación de servicio Moeve | FILIPINAS, 9, 38009 Santa Cruz de Tenerife | confirmada: Cepsa · Calle Filipinas, 9 | Santa Cruz de Tenerife | 922 39 64 79 (cortado) | horario a confirmar, nombre genérico |
| 36 | 3450 | Estación de Servicio - Océano Santa Cruz | C. Panamá, 9, 38009 Santa Cruz de Tenerife | confirmada: E.s. OcÉano Santa Cruz · Calle PanamÁ, 9 | Santa Cruz de Tenerife | — | — |
| 37 | 3449 | Estación de servicio Cepsa | POLIGONO EL MAYORAZGO, Mercatenerife, S/N, 38010 Santa Cruz de Tenerife | confirmada: Moeve · Poligono El Mayorazgo, S/n | Santa Cruz de Tenerife | 922 69 25 78 (cortado) | horario a confirmar, nombre genérico, Google: Cepsa → app: Moeve |
| 38 | 3448 | E.S. Disa Aracayu | Av. de Venezuela, 27, 38007 Santa Cruz de Tenerife | confirmada: Disa Aracayu · Avenida Venezuela, S/n | Santa Cruz de Tenerife | 630 15 71 96 (cortado) | — |
| 39 | 3446 | E.S. Disa El Chorrillo | Ctra. General del Sur, KM 9, 2, 38107 Santa Cruz de Tenerife | confirmada: Disa El Chorrillo · Carretera Carretera General Del Sur Km. 9,2 | Santa Cruz de Tenerife | 650 15 96 94 (cortado) | — |
| 40 | 3445 | Estación de servicio DISA | Ctra. Gral. del Rosario, 6, 38009 Santa Cruz de Tenerife | confirmada: Disa Tio Pino · Carretera Del Rosario C-822 Km. 2 | Santa Cruz de Tenerife | — | nombre genérico |
| 41 | 3444 | Gasolinera Tgas Tu Trébol - Santa Cruz | Pol. Ind. El Mayorazgo, Ctra. de Hoya Fria, 11, 38110 Santa Cruz de Tenerife | confirmada: Tgas-tu TrÉbol · Poligono El Mayorazgo, S/n | Santa Cruz de Tenerife | — | — |
| 42 | 3443 | Disa Las Chumberas | Av. la Libertad, 63, 38108 La Laguna, Santa Cruz de Tenerife | confirmada: Disa Las Chumberas · Pol. Ind. Los Majuelos Km Centro Comercial M | San Cristóbal de La Laguna | 608 29 04 25 (cortado) | — |
| 43 | 3442 | E.S. Disa Taco | Ctra. General del Sur, 6, 38108 Santa Cruz de Tenerife | confirmada: Disa Taco · Carretera Carretera General Del Sur Km. 6,200 | Santa Cruz de Tenerife | 682 26 29 47 (cortado) | — |
| 44 | 3441 | BP Tres de Mayo | Avenida Tres de Mayo, C. Álvaro Rodríguez López, 85, 38005 Santa Cruz de Tenerife | confirmada: Bp Avenida 3 De Mayo · Avenida Tres De Mayo, 85 | Santa Cruz de Tenerife | — | — |
| 45 | 3440 | BP Taco | TF-28, Km. 6, 9, Cr C-822, 38107 Santa Cruz de Tenerife | confirmada: Bp Taco · Carretera General Del Sur Km. 6,9 | Santa Cruz de Tenerife | 922 62 17 13 (cortado) | — |
| 46 | 3439 | E.S. Disa Barranco Grande | Ctra. General del Sur, KM 7,5, 38108 Santa Cruz de Tenerife | confirmada: Disa Barranco Grande · Carretera General Del Sur Km. 7,5 | Santa Cruz de Tenerife | 922 62 00 49 (cortado) | — |
| 47 | 3438 | DISA | C. Ortega y Gasset, 1, 38007 Santa Cruz de Tenerife | confirmada: Disa Tres De Mayo · Calle Ortega Y Gasset, 1 | Santa Cruz de Tenerife | — | nombre genérico |
| 48 | 3437 | Estación de servicio Pcan La Higuerita | Av. de los Menceyes, 223, 38320 La Laguna, Santa Cruz de Tenerife | confirmada: Pcan · Avenida Los Menceyes, 223 | San Cristóbal de La Laguna | 922 65 67 72 | — |
| 49 | 3436 | E.S. Disa Ofra | CR.GENERAL TF-411,00001, Calle Zerolo, 6, 38320 La Laguna, Santa Cruz de Tenerife | confirmada: Disa Ofra · Carretera Sur (cuesta-taco) Km. 2 | San Cristóbal de La Laguna | 689 75 17 57 | — |
| 50 | 3435 | BP Cruz del Se… | Av. Islas Canarias, 97, 38007 Santa Cruz de Tenerife | confirmada: Bp Cruz Del SeÑor · Avenida De Canarias, 97 | Santa Cruz de Tenerife | — | nombre incompleto |
| 51 | 3434 | Estación de servicio Moeve | VUELTA LOS PAJAROS, Av Ángel Romero, 17, 38009 Santa Cruz de Tenerife | confirmada: Cepsa · Avenida Angel Romero, 17 | Santa Cruz de Tenerife | 922 64 40 58 (cortado) | nombre genérico |
| 52 | 3433 | E.S. BP Taco Norte | Calle Las Industrias, CR TF-411, KM. 2, 45, 38108 San Cristóbal de La Laguna, Santa Cruz de Tenerife | confirmada: Bp Taco Norte · Cr Tf-411, Km. 2,45 | San Cristóbal de La Laguna | 822 69 67 13 | — |
| 53 | 3432 | E.S. DISA | Av. de los Majuelos, 26, 38108 Taco, Santa Cruz de Tenerife | confirmada: Disa Los Majuelos · Avenida Los Majuelos, 26 | San Cristóbal de La Laguna | — | 2 DISA en Av. de los Majuelos, nombre genérico |
| 54 | 3431 | Estación de servicio Cepsa | AVDA. LOS MAJUELOS, MANZANA LL-92, 38293 La Laguna, Santa Cruz de Tenerife | confirmada: Cepsa Los Andenes · Avenida Paso El (los Majuelos), 108 | San Cristóbal de La Laguna | 922 62 25 73 (cortado) | nombre genérico, Google: Cepsa → app: Moeve |
| 55 | 3430 | Estación de servicio Moeve | SALIDA A-4 DE LA, CTRA. DEL ROSARIO (TF-194, TF-5, P.I. DE, 38108 Taco, Santa Cruz de Tenerife | probable: Moeve · Carretera Rosario (del) Km. 186 | Santa Cruz de Tenerife (probable) | 922 61 57 17 (cortado) | GLP, nombre genérico |
| 56 | 3428 | Estación de Servicio DISA | C. de Pedro de Valdivia, 9, 38010 Santa Cruz de Tenerife | confirmada: Disa Las Delicias · Calle Pedro De Valdivia, 9 | Santa Cruz de Tenerife | 689 75 29 72 (cortado) | **¿operativa? (obras)**, nombre genérico |
| 57 | 3429 | Estación de servicio Moeve | Autop. del Sur, PK 3, 5, 38110 Santa Cruz de Tenerife | confirmada: Moeve · Autopista Tf-21 Km. 3,5 | Santa Cruz de Tenerife | 922 21 86 13 (cortado) | nombre genérico |
| 58 | 3426 | SHELL | Ctra. Santa Cruz Laguna, 32, 38009 Santa Cruz de Tenerife | confirmada: Shell El Ramonal · Carretera Santa Cruz- La Laguna Km. 3,7 | Santa Cruz de Tenerife | 922 65 53 96 (cortado) | nombre genérico |
| 59 | 3425 | Estación de Servicio - Océano Taco | Calle Sta. Amelia, 24, 38108 La Laguna, Santa Cruz de Tenerife | confirmada: OcÉano Taco · Calle Santa Amelia, 20 | San Cristóbal de La Laguna | — | — |
| 60 | 3422 | Canary Oil | C. Subida al Mayorazgo, 7, 38010 Santa Cruz de Tenerife | confirmada: Canary Oil, S.l. · Calle Subida Al Mayorazgo, 7 | Santa Cruz de Tenerife | — | — |
| 61 | 3423 | SHELL | CR.DEL ROSARIO KM 3, S/N, 38009 Santa Cruz de Tenerife | confirmada: E.s.shell Ofra · Carretera Del Rosario Km. 3 | Santa Cruz de Tenerife | — | nombre genérico |
| 62 | 3424 | GMOil | Poligono Industrial Mayorazgo, C. Laura Grote de la Prta, 2, 38110 Santa Cruz de Tenerife | confirmada: Gmoil · Calle Laura Grote De La Puerta, 2 | Santa Cruz de Tenerife | 922 22 66 06 | — |
