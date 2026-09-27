// Consulta de Overpass para las 29 fichas que siguen con la coordenada
// puesta a ojo. Generada con: python3 tools/consulta_overpass.py
//
// COMO SE EJECUTA, sin instalar nada:
//   1. Abre https://overpass-turbo.eu
//   2. Pega todo esto en el panel de la izquierda
//   3. Pulsa «Run» (o Ctrl+Enter). Tarda un minuto largo.
//   4. «Export» -> «raw data directly from Overpass API» -> guarda el
//      fichero .json y mandalo.
//
// Cada bloque lleva delante el id de la ficha y lo que dice hoy la app,
// para poder atar cada resultado a su sitio.

[out:json][timeout:300];
(
  // ar-las-hayas — Área Recreativa Las Hayas
  //   la app dice 28.3500,-16.6900
  nwr(around:2000,28.3500,-16.6900)["tourism"="picnic_site"];
  nwr(around:2000,28.3500,-16.6900)["leisure"="picnic_table"];
  // bici-agua-vilaflor — Vilaflor — Agua y Descanso Ciclistas (1.400 m)
  //   la app dice 28.1570,-16.6340
  nwr(around:2000,28.1570,-16.6340)["amenity"="drinking_water"];
  nwr(around:2000,28.1570,-16.6340)["tourism"="information"];
  // bici-bc2-inicio — BC-2 Ruta MTB Principiantes — Corona Forestal
  //   la app dice 28.3720,-16.4890
  nwr(around:2000,28.3720,-16.4890)["amenity"="drinking_water"];
  nwr(around:2000,28.3720,-16.4890)["tourism"="information"];
  // buceo-los-gigantes — 🤿 Buceo Los Gigantes — Diving Centre
  //   la app dice 28.2440,-16.8400
  nwr(around:2000,28.2440,-16.8400)["shop"="scuba_diving"];
  nwr(around:2000,28.2440,-16.8400)["sport"="scuba_diving"];
  // buceo-puerto-cruz — 🤿 Buceo Puerto de la Cruz — Centro Atlantik
  //   la app dice 28.4150,-16.5480
  nwr(around:2000,28.4150,-16.5480)["shop"="scuba_diving"];
  nwr(around:2000,28.4150,-16.5480)["sport"="scuba_diving"];
  // deporte-skatepark-laguna-copernico — Skatepark La Laguna (C/ Copérnico)
  //   la app dice 28.4930,-16.3150
  nwr(around:2000,28.4930,-16.3150)["leisure"="fitness_station"];
  nwr(around:2000,28.4930,-16.3150)["leisure"="pitch"];
  nwr(around:2000,28.4930,-16.3150)["leisure"="sports_centre"];
  // deporte-valle-san-lorenzo-kenguru — Valle San Lorenzo — Calistenia Kenguru Pro
  //   la app dice 28.091,-16.649
  nwr(around:2000,28.091,-16.649)["leisure"="fitness_station"];
  nwr(around:2000,28.091,-16.649)["leisure"="pitch"];
  nwr(around:2000,28.091,-16.649)["leisure"="sports_centre"];
  // gas-tf1-adeje — Repsol Costa Adeje (TF-1 km 15)
  //   la app dice 28.0830,-16.7320
  nwr(around:2000,28.0830,-16.7320)["name"~"Repsol",i];
  nwr(around:2000,28.0830,-16.7320)["amenity"="fuel"];
  // gas-tf1-candelaria — Cepsa Candelaria (TF-1)
  //   la app dice 28.3530,-16.3800
  nwr(around:2000,28.3530,-16.3800)["name"~"Cepsa",i];
  nwr(around:2000,28.3530,-16.3800)["amenity"="fuel"];
  // gas-tf5-icod — Repsol Icod de los Vinos (TF-5)
  //   la app dice 28.3680,-16.7050
  nwr(around:2000,28.3680,-16.7050)["name"~"Repsol",i];
  nwr(around:2000,28.3680,-16.7050)["amenity"="fuel"];
  // hiperdino-arona-montaneta — HiperDino Arona (La Montañeta)
  //   la app dice 28.0980,-16.6820
  nwr(around:2000,28.0980,-16.6820)["name"~"HiperDino",i];
  nwr(around:2000,28.0980,-16.6820)["shop"="supermarket"];
  nwr(around:2000,28.0980,-16.6820)["shop"="convenience"];
  // hiperdino-los-realejos — HiperDino Los Realejos
  //   la app dice 28.3920,-16.5820
  nwr(around:2000,28.3920,-16.5820)["name"~"HiperDino",i];
  nwr(around:2000,28.3920,-16.5820)["shop"="supermarket"];
  nwr(around:2000,28.3920,-16.5820)["shop"="convenience"];
  // kayak-los-gigantes — 🛶 Kayak & SUP Los Gigantes — Acantilados
  //   la app dice 28.2440,-16.8400
  nwr(around:2000,28.2440,-16.8400)["sport"="canoe"];
  nwr(around:2000,28.2440,-16.8400)["shop"="sports"];
  // lidl-granadilla — Lidl Granadilla de Abona
  //   la app dice 28.1340,-16.5580
  nwr(around:2000,28.1340,-16.5580)["name"~"Lidl",i];
  nwr(around:2000,28.1340,-16.5580)["shop"="supermarket"];
  nwr(around:2000,28.1340,-16.5580)["shop"="convenience"];
  // lidl-la-laguna — Lidl La Laguna (La Cuesta-Taco)
  //   la app dice 28.4720,-16.3080
  nwr(around:2000,28.4720,-16.3080)["name"~"Lidl",i];
  nwr(around:2000,28.4720,-16.3080)["shop"="supermarket"];
  nwr(around:2000,28.4720,-16.3080)["shop"="convenience"];
  // mercadillo-santa-cruz — Rastro de Santa Cruz
  //   la app dice 28.4580,-16.2490
  nwr(around:2000,28.4580,-16.2490)["amenity"="marketplace"];
  // mercadona-el-medano — Mercadona El Médano
  //   la app dice 28.0500,-16.5380
  nwr(around:2000,28.0500,-16.5380)["name"~"Mercadona",i];
  nwr(around:2000,28.0500,-16.5380)["shop"="supermarket"];
  nwr(around:2000,28.0500,-16.5380)["shop"="convenience"];
  // minimarket-24h-las-americas — Seven Ways Supermarket 24h (Las Américas)
  //   la app dice 28.066,-16.73
  nwr(around:2000,28.066,-16.73)["shop"="supermarket"];
  nwr(around:2000,28.066,-16.73)["shop"="convenience"];
  // mir-cardon-guia-isora — Mirador del Cardón (Guía de Isora)
  //   la app dice 28.1870,-16.7520
  nwr(around:2000,28.1870,-16.7520)["tourism"="viewpoint"];
  // mir-rambleta-teide — Mirador La Rambleta (Teide · 3.555 m)
  //   la app dice 28.27,-16.639
  nwr(around:2000,28.27,-16.639)["tourism"="viewpoint"];
  // mirador-pino-galdo — Mirador del Pino Galdo
  //   la app dice 28.5600,-16.2650
  nwr(around:2000,28.5600,-16.2650)["tourism"="viewpoint"];
  nwr(around:2000,28.5600,-16.2650)["natural"="peak"];
  // parkinson-tf-granadilla — Párkinson Tenerife — Unidad Granadilla 🤝
  //   la app dice 28.122,-16.579
  nwr(around:2000,28.122,-16.579)["amenity"="social_facility"];
  nwr(around:2000,28.122,-16.579)["office"="ngo"];
  nwr(around:2000,28.122,-16.579)["healthcare"];
  // parque-canino-laguna-via-ronda — Parque Canino La Laguna (Vía Ronda) 🐾
  //   la app dice 28.4850,-16.3180
  nwr(around:2000,28.4850,-16.3180)["leisure"="dog_park"];
  // pesca-los-gigantes — 🎣 Pesca Deportiva Los Gigantes
  //   la app dice 28.2440,-16.8400
  nwr(around:2000,28.2440,-16.8400)["shop"="fishing"];
  nwr(around:2000,28.2440,-16.8400)["sport"="fishing"];
  // pp-el-tanque — 🪂 Parapente — Despegue El Tanque (Noroeste)
  //   la app dice 28.3450,-16.8100
  nwr(around:2000,28.3450,-16.8100)["sport"="free_flying"];
  nwr(around:2000,28.3450,-16.8100)["paragliding"="takeoff"];
  // pp-guimar — 🪂 Parapente — Ladera de Güímar (Este)
  //   la app dice 28.3100,-16.4050
  nwr(around:2000,28.3100,-16.4050)["sport"="free_flying"];
  nwr(around:2000,28.3100,-16.4050)["paragliding"="takeoff"];
  // pp-izana — 🪂 Parapente — Despegue Izaña (2.200 m)
  //   la app dice 28.3090,-16.4990
  nwr(around:2000,28.3090,-16.4990)["sport"="free_flying"];
  nwr(around:2000,28.3090,-16.4990)["paragliding"="takeoff"];
  // puerto-granadilla-comercial — Puerto de Granadilla (Comercial)
  //   la app dice 28.073,-16.499
  nwr(around:2000,28.073,-16.499)["landuse"="port"];
  nwr(around:2000,28.073,-16.499)["industrial"="port"];
  nwr(around:2000,28.073,-16.499)["amenity"="ferry_terminal"];
  // sala-westerdahl — Sala Eduardo Westerdahl (Puerto de la Cruz)
  //   la app dice 28.418,-16.55
  nwr(around:2000,28.418,-16.55)["tourism"="museum"];
  nwr(around:2000,28.418,-16.55)["tourism"="gallery"];
  nwr(around:2000,28.418,-16.55)["amenity"="arts_centre"];
);
out center tags;
