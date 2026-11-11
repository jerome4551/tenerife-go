/* modulos/guia.js — JERO, EL GUIA DE TENERIFE GO (10 de noviembre de 2026).
   Jerome: «Lo que yo quiero con los tours explicativos es un personaje animado
   de mí. Como un presentador de la isla». Y que el tour de la app sea «mucho
   más completo», con «uno nuevo» solo para el cielo, y «lo mismo por el
   cuerpo» en cuanto subiera su bloque 8 (subio ese mismo dia).

   QUE ES
   · El presentador: un dibujo SVG propio, hecho a mano aqui mismo (svgTexto),
     con el aspecto de Jerome (el pelo, las gafas, la sonrisa y la camiseta de
     sus fotos), dentro de un aro dorado como el del logotipo. Esta articulado:
     gira la cabeza, mira, parpadea, respira, mueve la boca con lo que dice,
     saluda, celebra y señala con el brazo que toque el boton que explica. Se
     cambia de atuendo segun el paso (gafas de sol, gorra y mochila, antifaz de
     Carnaval, gorro con frontal de luz blanca o roja, cinta y toalla de
     deporte) y el aro cambia de cielo.
     Esa misma tarde, al verlo, Jerome pidio repasarlo: «cuando muestra algo
     parece que está haciendo 🖕», «trabaja más los brazos, la cara más trabajada
     también», «más emoción», «algunos chistes». Desde entonces: las manos son
     manos (LA QUE SEÑALA ES UN INDICE: sale del lado del pulgar, que se ve, con
     los otros tres dedos doblados; lo grande se enseña con la mano abierta), los
     brazos tienen forma, los parpados y las cejas se mueven por su cuenta, Jérôme
     pone doce caras (EMO) y algunos pasos acaban con un chiste suyo (la fila kC).
   · El motor de tours: el foco sobre la interfaz de verdad, el bocadillo con
     el texto que se escribe solo, la estela del dedo al foco, los capitulos y
     la voz, que es opcional y lee con las voces del propio movil (TG_VOZ, las
     de la audioguia: solo las instaladas en el dispositivo, sin red).
   · Los tours: «app» (la app entera, por capitulos), «cielo» (el panel
     «Cielo de Tenerife», pestaña a pestaña) y «cuerpo» (la pantalla «Su
     cuerpo», de arriba abajo, sin anotar nada ni cambiar de vista).
   · Sus textos, en los diez idiomas (GUIA_UI), de usted.

   COMO LLEGA
   No se pide al arrancar: lo pide el cargador de index.html (bloque TOUR) al
   cerrar la bienvenida de quien no ha visto el tour, al tocar «Ver el tour»
   en la leyenda del mapa o el boton con la cara de Jérôme del panel del cielo
   o de «Su cuerpo», y la primera vez que se abre uno de los dos (la pista).
   El service worker lo guarda desde el primer dia (CORE), asi que tambien
   sale sin cobertura. tools/fuente.js y tools/fuente.py lo pegan al final del
   fuente para las herramientas (CARGA-PEREZOSA).

   QUE GUARDA
   Solo si ya se vio cada tour: «tenerife.tour.seen» (el de la app, version 3;
   las herramientas guardan 99 para saltarlos todos), «tenerife.tour.cielo» y
   «tenerife.tour.cuerpo». La voz no se guarda: cada tour empieza callado.

   tools/auditar_tour.js recorre los tres tours enteros en los diez idiomas y
   en cuatro tamaños de movil. */
(function () {
  'use strict';
  if (window.TG_GUIA) return;
  var NS = 'http://www.w3.org/2000/svg';
  var N = 0;

  /* ───────────────────────── textos ─────────────────────────
     Una fila por texto, en los diez idiomas, como las de UI_TX: las leen las
     herramientas de idiomas de tools/ (el fichero se les pega al fuente,
     CARGA-PEREZOSA). De usted en todos; el polaco, impersonal. Las cifras no se
     escriben: {n} lugares, {L} idiomas, {C} costas y {S} pasos se cuentan al abrir
     cada paso, y {ver}, {llevame}, {girar} y {azar} son el rotulo de su boton en cada idioma. */
  var GUIA_UI = {
    "tourNovT": {"es": "¡Hay novedades!", "en": "There's something new!", "fr": "Du nouveau !", "de": "Es gibt Neues!", "it": "Ci sono novità!", "nl": "Er is iets nieuws!", "zh": "有新功能！", "zht": "有新功能！", "bg": "Има новости!", "pl": "Są nowości!"},
    "tourAhoraNo": {"es": "Ahora no", "en": "Not now", "fr": "Plus tard", "de": "Später", "it": "Non ora", "nl": "Niet nu", "zh": "暂时不用", "zht": "暫時不用", "bg": "Не сега", "pl": "Nie teraz"},
    "tourSaltar": {"es": "Saltar", "en": "Skip", "fr": "Passer", "de": "Überspringen", "it": "Salta", "nl": "Overslaan", "zh": "跳过", "zht": "跳過", "bg": "Пропусни", "pl": "Pomiń"},
    "tourSiguiente": {"es": "Siguiente", "en": "Next", "fr": "Suivant", "de": "Weiter", "it": "Avanti", "nl": "Volgende", "zh": "下一步", "zht": "下一步", "bg": "Напред", "pl": "Dalej"},
    "tourAtras": {"es": "Atrás", "en": "Back", "fr": "Retour", "de": "Zurück", "it": "Indietro", "nl": "Terug", "zh": "上一步", "zht": "上一步", "bg": "Назад", "pl": "Wstecz"},
    "tourAExplorar": {"es": "¡A explorar!", "en": "Start exploring!", "fr": "C'est parti !", "de": "Los geht's!", "it": "Si parte!", "nl": "Op pad!", "zh": "开始探索！", "zht": "開始探索！", "bg": "Да разглеждаме!", "pl": "Ruszamy!"},
    "tourNuevo": {"es": "Nuevo", "en": "New", "fr": "Nouveau", "de": "Neu", "it": "Novità", "nl": "Nieuw", "zh": "新", "zht": "新", "bg": "Ново", "pl": "Nowość"},
    "tourBuscarT": {"es": "Busque cualquier lugar", "en": "Search any place", "fr": "Cherchez un lieu", "de": "Orte suchen", "it": "Cerchi un luogo", "nl": "Zoek een plek", "zh": "搜索任何地点", "zht": "搜尋任何地點", "bg": "Търсете всяко място", "pl": "Wyszukiwanie dowolnego miejsca"},
    "tourBuscarP": {"es": "{n} lugares en el mapa: playas, senderos, guachinches, miradores, gasolineras… Escriba el nombre, con tildes o sin ellas.", "en": "{n} places on the map: beaches, trails, guachinches, viewpoints, petrol stations… Type the name, with or without accents.", "fr": "{n} lieux sur la carte : plages, sentiers, guachinches, belvédères, stations-service… Tapez le nom, avec ou sans accents.", "de": "{n} Orte auf der Karte: Strände, Wanderwege, Guachinches, Aussichtspunkte, Tankstellen… Geben Sie den Namen ein, mit oder ohne Akzente.", "it": "{n} luoghi sulla mappa: spiagge, sentieri, guachinches, punti panoramici, distributori… Scriva il nome, con o senza accenti.", "nl": "{n} plekken op de kaart: stranden, wandelpaden, guachinches, uitzichtpunten, tankstations… Typ de naam, met of zonder accenten.", "zh": "地图上共有{n}个地点：海滩、步道、乡村酒馆、观景台、加油站……输入名称即可，带不带重音符号都行。", "zht": "地圖上共有{n}個地點：海灘、步道、鄉村酒館、觀景台、加油站……輸入名稱即可，有沒有重音符號都行。", "bg": "{n} места на картата: плажове, пътеки, гуачинчес, панорамни площадки, бензиностанции… Напишете името, със или без диакритични знаци.", "pl": "{n} miejsce na mapie: plaże, szlaki, guachinches, punkty widokowe, stacje paliw… Wystarczy wpisać nazwę, z hiszpańskimi akcentami albo bez.|{n} miejsca na mapie: plaże, szlaki, guachinches, punkty widokowe, stacje paliw… Wystarczy wpisać nazwę, z hiszpańskimi akcentami albo bez.|{n} miejsc na mapie: plaże, szlaki, guachinches, punkty widokowe, stacje paliw… Wystarczy wpisać nazwę, z hiszpańskimi akcentami albo bez."},
    "tourCatT": {"es": "Filtre por categorías", "en": "Filter by category", "fr": "Filtrez par catégorie", "de": "Nach Kategorien filtern", "it": "Filtri per categoria", "nl": "Filter op categorie", "zh": "按类别筛选", "zht": "依類別篩選", "bg": "Филтрирайте по категории", "pl": "Filtrowanie według kategorii"},
    "tourCatP": {"es": "Encienda solo lo que le apetece hoy: naturaleza y playas, cultura, deporte, miradores, mercadillos… Y también lugares con mascotas o accesibles.", "en": "Switch on only what you fancy today: nature and beaches, culture, sport, viewpoints, markets… And also pet-friendly or accessible places.", "fr": "Activez seulement ce qui vous tente aujourd'hui : nature et plages, culture, sport, belvédères, marchés… Et aussi des lieux qui acceptent les animaux ou accessibles.", "de": "Schalten Sie nur ein, worauf Sie heute Lust haben: Natur und Strände, Kultur, Sport, Aussichtspunkte, Märkte… Und auch Orte, an denen Haustiere willkommen sind, oder barrierefreie Orte.", "it": "Attivi solo quello che Le va oggi: natura e spiagge, cultura, sport, punti panoramici, mercatini… E anche luoghi che accettano animali o accessibili.", "nl": "Zet alleen aan waar u vandaag zin in heeft: natuur en stranden, cultuur, sport, uitzichtpunten, markten… En ook plekken waar huisdieren welkom zijn of die toegankelijk zijn.", "zh": "只打开您今天感兴趣的：自然与海滩、文化、运动、观景台、集市……还有欢迎宠物和无障碍的地点。", "zht": "只開啟您今天感興趣的：自然與海灘、文化、運動、觀景台、市集……還有歡迎寵物和無障礙的地點。", "bg": "Включете само това, което ви се иска днес: природа и плажове, култура, спорт, панорамни площадки, пазари… И места, подходящи за домашни любимци или достъпни за хора с увреждания.", "pl": "Można włączyć tylko to, na co jest dziś ochota: przyroda i plaże, kultura, sport, punkty widokowe, targi… A także miejsca przyjazne zwierzętom lub dostępne."},
    "tourDadoT": {"es": "¿Sin plan? Tire el dado", "en": "No plan? Roll the dice", "fr": "Sans plan ? Lancez le dé", "de": "Kein Plan? Würfeln Sie", "it": "Senza piani? Tiri il dado", "nl": "Geen plan? Gooi de dobbelsteen", "zh": "没主意？掷个骰子", "zht": "沒主意？擲個骰子", "bg": "Нямате план? Хвърлете зара", "pl": "Bez planu? Rzut kostką"},
    "tourDadoP": {"es": "Le lleva a un lugar al azar. Con filtros puestos, la sorpresa es a su gusto.", "en": "It takes you to a random place. With filters on, the surprise is your kind of surprise.", "fr": "Il vous emmène dans un lieu au hasard. Avec des filtres, la surprise reste à votre goût.", "de": "Bringt Sie zu einem zufälligen Ort. Mit Filtern bleibt die Überraschung nach Ihrem Geschmack.", "it": "La porta in un luogo a caso. Con i filtri attivi, la sorpresa resta nei Suoi gusti.", "nl": "Brengt u naar een willekeurige plek. Met filters blijft de verrassing naar uw smaak.", "zh": "随机带您去一个地点。开启筛选后，惊喜也合您的口味。", "zht": "隨機帶您去一個地點。開啟篩選後，驚喜也合您的口味。", "bg": "Отвежда ви на случайно място. С включени филтри изненадата е по ваш вкус.", "pl": "Przenosi w losowe miejsce. Z włączonymi filtrami niespodzianka trafi w gust."},
    "tourGasT": {"es": "La gasolinera más barata, a un toque", "en": "The cheapest petrol station, one tap away", "fr": "La station la moins chère, en un geste", "de": "Die günstigste Tankstelle, mit einem Tipp", "it": "Il distributore più economico, con un tocco", "nl": "Het goedkoopste tankstation, met één tik", "zh": "一键找到最便宜的加油站", "zht": "一鍵找到最便宜的加油站", "bg": "Най-евтината бензиностанция с едно докосване", "pl": "Najtańsza stacja paliw jednym dotknięciem"},
    "tourGasP": {"es": "Toque ⛽ y, con su ubicación, verá las más baratas a 5, 10 o 20 km: gasolina 95 y diésel, con el precio oficial del Ministerio. Cada gasolinera del mapa enseña también su precio.", "en": "Tap ⛽ and, using your location, you'll see the cheapest ones within 5, 10 or 20 km: petrol 95 and diesel, at the official price from the Spanish Ministry. Every petrol station on the map also shows its price.", "fr": "Touchez ⛽ et, avec votre position, vous verrez les moins chères à 5, 10 ou 20 km : essence 95 et gazole, au prix officiel du ministère. Chaque station de la carte affiche aussi son prix.", "de": "Tippen Sie auf ⛽ und Sie sehen mit Ihrem Standort die günstigsten im Umkreis von 5, 10 oder 20 km: Benzin 95 und Diesel, zum amtlichen Preis des Ministeriums. Jede Tankstelle auf der Karte zeigt auch ihren Preis.", "it": "Tocchi ⛽ e, con la Sua posizione, vedrà i più economici entro 5, 10 o 20 km: benzina 95 e gasolio, al prezzo ufficiale del Ministero. Ogni distributore sulla mappa mostra anche il suo prezzo.", "nl": "Tik op ⛽ en met uw locatie ziet u de goedkoopste binnen 5, 10 of 20 km: benzine 95 en diesel, tegen de officiële prijs van het ministerie. Elk tankstation op de kaart toont ook zijn prijs.", "zh": "点⛽，根据您的位置显示5、10或20公里内最便宜的加油站：95号汽油和柴油，西班牙政府官方价格。地图上每个加油站也都显示价格。", "zht": "點⛽，根據您的位置顯示5、10或20公里內最便宜的加油站：95號汽油和柴油，西班牙政府官方價格。地圖上每個加油站也都顯示價格。", "bg": "Докоснете ⛽ и според местоположението си ще видите най-евтините в радиус 5, 10 или 20 км: бензин 95 и дизел, по официалната цена на министерството. Всяка бензиностанция на картата показва и цената си.", "pl": "Po dotknięciu ⛽ pojawiają się, według bieżącej lokalizacji, najtańsze stacje w promieniu 5, 10 lub 20 km: benzyna 95 i olej napędowy, po oficjalnej cenie ministerstwa. Każda stacja na mapie pokazuje też swoją cenę."},
    "tourMapaT": {"es": "Elija su mapa", "en": "Pick your map", "fr": "Choisissez votre carte", "de": "Karte wählen", "it": "Scelga la mappa", "nl": "Kies uw kaart", "zh": "选择地图", "zht": "選擇地圖", "bg": "Изберете своята карта", "pl": "Wybór mapy"},
    "tourMapaP": {"es": "Calles, satélite o relieve: toque para cambiar. El relieve es ideal para el senderismo.", "en": "Streets, satellite or terrain: tap to switch. Terrain is ideal for hiking.", "fr": "Rues, satellite ou relief : touchez pour changer. Le relief est idéal pour la randonnée.", "de": "Straßen, Satellit oder Relief: tippen zum Wechseln. Das Relief ist ideal zum Wandern.", "it": "Strade, satellite o rilievo: tocchi per cambiare. Il rilievo è perfetto per il trekking.", "nl": "Straten, satelliet of reliëf: tik om te wisselen. Reliëf is ideaal om te wandelen.", "zh": "街道、卫星或地形：点击即可切换。地形图最适合徒步。", "zht": "街道、衛星或地形：點一下即可切換。地形圖最適合健行。", "bg": "Улици, сателит или релеф: докоснете, за да смените. Релефът е идеален за преходи.", "pl": "Ulice, satelita albo rzeźba terenu: zmiana jednym dotknięciem. Rzeźba terenu świetnie sprawdza się na szlakach."},
    "tourMicroT": {"es": "Microclimas", "en": "Microclimates", "fr": "Microclimats", "de": "Mikroklimas", "it": "Microclimi", "nl": "Microklimaten", "zh": "微气候", "zht": "微氣候", "bg": "Микроклимати", "pl": "Mikroklimaty"},
    "tourMicroP": {"es": "Puede llover en un pueblo y hacer sol en el de al lado. Aquí ve el tiempo en directo, zona por zona.", "en": "It can rain in one village and be sunny in the next. Here you see the live weather, area by area.", "fr": "Il peut pleuvoir dans un village et faire beau dans le suivant. Ici, la météo en direct, zone par zone.", "de": "In einem Dorf kann es regnen und im nächsten die Sonne scheinen. Hier sehen Sie das Wetter live, Zone für Zone.", "it": "Può piovere in un paese e splendere il sole in quello accanto. Qui vede il meteo in diretta, zona per zona.", "nl": "Het kan regenen in het ene dorp en zonnig zijn in het volgende. Hier ziet u het weer live, zone per zone.", "zh": "可能这个村子下雨，隔壁村子却阳光明媚。这里按区域显示实时天气。", "zht": "可能這個村子下雨，隔壁村子卻陽光普照。這裡依區域顯示即時天氣。", "bg": "В едно село може да вали, а в съседното да грее слънце. Тук виждате времето на живо, зона по зона.", "pl": "W jednej wsi może padać, a w sąsiedniej świecić słońce. Tu widać pogodę na żywo, strefa po strefie."},
    "tourMarT": {"es": "El mar hoy", "en": "The sea today", "fr": "La mer aujourd'hui", "de": "Das Meer heute", "it": "Il mare oggi", "nl": "De zee vandaag", "zh": "今日海况", "zht": "今日海況", "bg": "Морето днес", "pl": "Morze dzisiaj"},
    "tourMarP": {"es": "El estado del mar en las {C} costas de la isla y dónde bañarse hoy. Si el botón lleva un punto amarillo, naranja o rojo, AEMET tiene avisos: al abrirlo, son lo primero.", "en": "Sea conditions on the island's {C} coasts and where to swim today. If the button has a yellow, orange or red dot, AEMET has warnings: they come first when you open it.", "fr": "L'état de la mer sur les {C} côtes de l'île et où vous baigner aujourd'hui. Si le bouton porte un point jaune, orange ou rouge, l'AEMET a émis des alertes : elles s'affichent en premier quand vous l'ouvrez.", "de": "Der Seegang an den {C} Küsten der Insel und wo Sie heute baden können. Hat der Knopf einen gelben, orangen oder roten Punkt, gibt es AEMET-Warnungen: Beim Öffnen stehen sie ganz oben.", "it": "Lo stato del mare sulle {C} coste dell'isola e dove fare il bagno oggi. Se il pulsante ha un punto giallo, arancione o rosso, l'AEMET ha emesso allerte: aprendolo, sono la prima cosa che vede.", "nl": "De zeegang aan de {C} kusten van het eiland en waar u vandaag kunt zwemmen. Heeft de knop een gele, oranje of rode stip, dan heeft AEMET waarschuwingen: als u hem opent, staan ze bovenaan.", "zh": "全岛{C}段海岸的海况，以及今天去哪里游泳。按钮上有黄色、橙色或红色圆点，表示 AEMET 发布了预警：打开后最先看到。", "zht": "全島{C}段海岸的海況，以及今天去哪裡游泳。按鈕上有黃色、橙色或紅色圓點，表示 AEMET 發布了預警：打開後最先看到。", "bg": "Състоянието на морето по {C}-те брега на острова и къде да се къпете днес. Ако бутонът има жълта, оранжева или червена точка, AEMET има предупреждения: при отваряне са първото, което виждате.", "pl": "Stan morza na {C} wybrzeżach wyspy i gdzie się dziś wykąpać. Jeśli przycisk ma żółtą, pomarańczową albo czerwoną kropkę, są ostrzeżenia AEMET: po otwarciu widać je na samej górze."},
    "tourFiestasT": {"es": "Fiestas y tradiciones", "en": "Fiestas and traditions", "fr": "Fêtes et traditions", "de": "Feste und Traditionen", "it": "Feste e tradizioni", "nl": "Feesten en tradities", "zh": "节庆与传统", "zht": "節慶與傳統", "bg": "Празници и традиции", "pl": "Święta i tradycje"},
    "tourFiestasP": {"es": "Romerías, carnavales y fiestas patronales, con sus fechas.", "en": "Pilgrimages, carnivals and patron saint festivals, with their dates.", "fr": "Pèlerinages, carnavals et fêtes patronales, avec leurs dates.", "de": "Wallfahrten, Karneval und Patronatsfeste, mit ihren Terminen.", "it": "Pellegrinaggi, carnevali e feste patronali, con le loro date.", "nl": "Bedevaarten, carnavals en patroonheiligenfeesten, met hun data.", "zh": "朝圣游行、狂欢节和主保圣人节，附有日期。", "zht": "朝聖遊行、狂歡節和主保聖人節，附有日期。", "bg": "Поклонения, карнавали и празници на светци покровители, с датите им.", "pl": "Pielgrzymki, karnawały i święta patronalne, z ich datami."},
    "tourCieloT": {"es": "El cielo de Tenerife", "en": "Tenerife’s night sky", "fr": "Le ciel de Tenerife", "de": "Der Himmel über Teneriffa", "it": "Il cielo di Tenerife", "nl": "De sterrenhemel van Tenerife", "zh": "特内里费星空", "zht": "特內里費星空", "bg": "Небето над Тенерифе", "pl": "Niebo nad Teneryfą"},
    "tourCieloP": {"es": "Qué se ve esta noche (Luna, planetas, Vía Láctea), las lluvias de estrellas y los eclipses que vienen, un catálogo según se vea a simple vista, con prismáticos o con telescopio, y la carta del cielo, con luz roja para la noche.", "en": "What’s up tonight (Moon, planets, Milky Way), upcoming meteor showers and eclipses, a catalog sorted by naked eye, binoculars or telescope, and a sky map, with red light for the night.", "fr": "Ce qu’on voit ce soir (Lune, planètes, Voie lactée), les étoiles filantes et les éclipses à venir, un catalogue classé œil nu, jumelles ou télescope, et la carte du ciel, avec une lumière rouge pour la nuit.", "de": "Was heute Nacht zu sehen ist (Mond, Planeten, Milchstraße), kommende Sternschnuppen und Finsternisse, ein Katalog nach bloßem Auge, Fernglas oder Teleskop und die Himmelskarte, mit Rotlicht für die Nacht.", "it": "Cosa si vede stanotte (Luna, pianeti, Via Lattea), le prossime stelle cadenti ed eclissi, un catalogo per occhio nudo, binocolo o telescopio e la mappa del cielo, con la luce rossa per la notte.", "nl": "Wat er vannacht te zien is (maan, planeten, Melkweg), komende meteorenzwermen en eclipsen, een catalogus voor het blote oog, de verrekijker of de telescoop en de hemelkaart, met rood licht voor de nacht.", "zh": "今晚能看到什么（月亮、行星、银河）、即将到来的流星雨和日月食、按肉眼、双筒望远镜或天文望远镜分类的星表，以及星图，还有夜间用的红光模式。", "zht": "今晚能看到什麼（月亮、行星、銀河）、即將到來的流星雨和日月食、按肉眼、雙筒望遠鏡或天文望遠鏡分類的星表，以及星圖，還有夜間用的紅光模式。", "bg": "Какво се вижда тази нощ (Луна, планети, Млечен път), предстоящите метеорни потоци и затъмнения, каталог за просто око, бинокъл или телескоп и карта на небето, с червена светлина за нощта.", "pl": "Co widać tej nocy (Księżyc, planety, Droga Mleczna), nadchodzące roje meteorów i zaćmienia, katalog według gołego oka, lornetki lub teleskopu oraz mapa nieba, z czerwonym światłem na noc."},
    "tourGuaguasT": {"es": "Guaguas", "en": "Buses", "fr": "Bus", "de": "Busse", "it": "Autobus", "nl": "Bussen", "zh": "公交", "zht": "公車", "bg": "Автобуси", "pl": "Autobusy"},
    "tourGuaguasP": {"es": "Las paradas cercanas y las líneas de TITSA, para moverse sin coche.", "en": "Nearby stops and TITSA lines, so you can get around without a car.", "fr": "Les arrêts proches et les lignes TITSA, pour vous déplacer sans voiture.", "de": "Haltestellen in der Nähe und TITSA-Linien, damit Sie ohne Auto unterwegs sind.", "it": "Le fermate vicine e le linee TITSA, per muoversi senz'auto.", "nl": "Haltes in de buurt en TITSA-lijnen, om zich zonder auto te verplaatsen.", "zh": "附近的站点和TITSA线路，没有车也能出行。", "zht": "附近的站牌和TITSA路線，沒有車也能出門。", "bg": "Близките спирки и линиите на TITSA, за да се придвижвате без кола.", "pl": "Pobliskie przystanki i linie TITSA, żeby poruszać się bez samochodu."},
    "tourIdiomaT": {"es": "En su idioma", "en": "In your language", "fr": "Dans votre langue", "de": "Ihre Sprache", "it": "Nella Sua lingua", "nl": "In uw taal", "zh": "您的语言", "zht": "您的語言", "bg": "На вашия език", "pl": "W wybranym języku"},
    "tourIdiomaP": {"es": "Toda la app en {L} idiomas. Cámbielo aquí cuando quiera.", "en": "The whole app in {L} languages. Change it here anytime.", "fr": "Toute l'appli en {L} langues. Changez-la ici quand vous voulez.", "de": "Die ganze App in {L} Sprachen. Hier jederzeit umstellen.", "it": "Tutta l'app in {L} lingue. La cambi qui quando vuole.", "nl": "De hele app in {L} talen. Wijzig het hier wanneer u wilt.", "zh": "整个应用支持{L}种语言，可随时在这里切换。", "zht": "整個應用程式支援{L}種語言，可隨時在這裡切換。", "bg": "Цялото приложение на {L} езика. Сменете го тук по всяко време.", "pl": "Cała aplikacja w {L} językach. Język można tu zmienić w każdej chwili."},
    "tourRutasT": {"es": "El botón Rutas", "en": "The Routes button", "fr": "Le bouton Itinéraires", "de": "Der Routen-Button", "it": "Il pulsante Percorsi", "nl": "De knop Routes", "zh": "路线按钮", "zht": "路線按鈕", "bg": "Бутонът „Маршрути“", "pl": "Przycisk Trasy"},
    "tourRutasP": {"es": "Aquí tiene tres herramientas para organizar el viaje: «Organice su día», «Ruta del día» y «A→B». Se las enseño una a una.", "en": "Three tools to plan your trip: “Plan your day”, “Day Route” and “A→B”. I’ll show you each one.", "fr": "Trois outils pour organiser votre voyage : « Organisez votre journée », « Itinéraire du jour » et « A→B ». Je vous les montre un par un.", "de": "Drei Werkzeuge für Ihre Reise: „Tag planen“, „Tagesroute“ und „A→B“. Ich zeige sie Ihnen nacheinander.", "it": "Tre strumenti per organizzare il viaggio: «Organizzi la Sua giornata», «Itinerario del giorno» e «A→B». Glieli mostro uno per uno.", "nl": "Drie hulpmiddelen om uw reis te plannen: “Plan uw dag”, “Route van de dag” en “A→B”. Ik laat ze u een voor een zien.", "zh": "三个规划行程的工具：“规划您的一天”“今日路线”和“A→B”。我逐一为您介绍。", "zht": "三個規劃行程的工具：「規劃您的一天」「今日路線」和「A→B」。我逐一為您介紹。", "bg": "Три инструмента за планиране на пътуването: „Подредете деня си“, „Маршрут за деня“ и „A→B“. Ще ви ги покажа едно по едно.", "pl": "Trzy narzędzia do planowania podróży: „Planowanie dnia”, „Trasa dnia” i „A→B”. Pokażę je po kolei."},
    "tourOrganizaT": {"es": "Organice su día", "en": "Plan your day", "fr": "Organisez votre journée", "de": "Tag planen", "it": "Organizzi la Sua giornata", "nl": "Plan uw dag", "zh": "规划您的一天", "zht": "規劃您的一天", "bg": "Подредете деня си", "pl": "Planowanie dnia"},
    "tourOrganizaP": {"es": "Díganos cuánto tiempo tiene, qué le apetece, si prefiere el norte o el sur y cómo se mueve. Le propone un itinerario ordenado por cercanía, con pausa para comer si es medio día o día completo. Cambie paradas, guárdelo, compártalo o descárguelo en GPX.", "en": "Tell us how much time you have, what you fancy, north or south, and how you get around. You get an itinerary ordered by proximity, with a lunch break for a half or full day. Swap stops, save it, share it or download it as GPX.", "fr": "Dites combien de temps vous avez, ce qui vous tente, nord ou sud, et comment vous bougez. Vous obtenez un itinéraire ordonné par proximité, avec pause déjeuner sur une demi-journée ou plus. Modifiez les étapes, puis enregistrez, partagez ou exportez en GPX.", "de": "Sagen Sie uns, wie viel Zeit Sie haben, worauf Sie Lust haben, ob lieber Norden oder Süden und wie Sie unterwegs sind. Sie bekommen eine nach Nähe sortierte Route, mit Mittagspause bei halbem oder ganzem Tag. Stopps tauschen, speichern, teilen oder als GPX herunterladen.", "it": "Ci dica quanto tempo ha, cosa Le va di fare, se preferisce il nord o il sud e come si muove. Le propone un itinerario ordinato per vicinanza, con pausa pranzo se è mezza giornata o giornata intera. Cambi tappe, lo salvi, lo condivida o lo scarichi in GPX.", "nl": "Vertel hoeveel tijd u heeft, waar u zin in heeft, noord of zuid, en hoe u reist. U krijgt een route gesorteerd op afstand, met lunchpauze bij een halve of hele dag. Wissel stops, bewaar, deel of download hem als GPX.", "zh": "告诉我们您有多少时间、想做什么、想去北部还是南部、怎么出行。它会生成按远近排序的行程，半天或一整天还会安排午餐。可以更换站点、保存、分享或下载为GPX。", "zht": "告訴我們您有多少時間、想做什麼、想去北部還是南部、怎麼出行。它會產生依遠近排序的行程，半天或一整天還會安排午餐。可以更換站點、儲存、分享或下載為GPX。", "bg": "Кажете с колко време разполагате, какво ви се прави, дали предпочитате севера или юга и как се придвижвате. Получавате маршрут, подреден по близост, с почивка за обяд при половин или цял ден. Сменяйте спирки, запазете, споделете или изтеглете като GPX.", "pl": "Wystarczy podać, ile jest czasu, na co jest ochota, czy lepiej północ, czy południe, i jak się podróżuje. Powstaje plan ułożony według odległości, z przerwą na obiad przy pół dnia lub całym dniu. Przystanki można zmieniać, a plan zapisać, udostępnić albo pobrać jako GPX."},
    "tourRutaDiaT": {"es": "Ruta del día", "en": "Day Route", "fr": "Itinéraire du jour", "de": "Tagesroute", "it": "Itinerario del giorno", "nl": "Route van de dag", "zh": "今日路线", "zht": "今日路線", "bg": "Маршрут за деня", "pl": "Trasa dnia"},
    "tourRutaDiaP": {"es": "Elija Norte, Sur o Cumbre y añada con + los lugares que quiera visitar: se numeran en «Mi ruta». Cada parada la centra en el mapa o ve su información. Con 🗓️+ también añade aquí el itinerario de «Organice su día».", "en": "Pick North, South or Summit and add the places you want to visit with +: they're numbered in “My route”. You can centre each stop on the map or see its info. With 🗓️+ you can also add your “Plan your day” itinerary here.", "fr": "Choisissez Nord, Sud ou Sommet et ajoutez avec + les lieux que vous voulez visiter : ils sont numérotés dans « Mon itinéraire ». Chaque étape peut être centrée sur la carte ou afficher ses infos. Avec 🗓️+, vous y ajoutez aussi l'itinéraire créé dans « Organisez votre journée ».", "de": "Wählen Sie Norden, Süden oder Gipfel und fügen Sie mit + die Orte hinzu, die Sie besuchen möchten: Sie werden in „Meine Route“ nummeriert. Jeden Stopp können Sie auf der Karte zentrieren oder seine Infos ansehen. Mit 🗓️+ fügen Sie hier auch Ihren geplanten Tag hinzu.", "it": "Scelga Nord, Sud o Vetta e aggiunga con + i luoghi che vuole visitare: vengono numerati in «Il mio percorso». Ogni tappa può centrarla sulla mappa o vederne le informazioni. Con 🗓️+ aggiunge qui anche l'itinerario di «Organizzi la Sua giornata».", "nl": "Kies Noord, Zuid of Top en voeg met + de plekken toe die u wilt bezoeken: ze worden genummerd in “Mijn route”. Elke stop kunt u op de kaart centreren of de info bekijken. Met 🗓️+ voegt u hier ook uw geplande dag toe.", "zh": "选择北部、南部或山顶，用+添加想去的地点，它们会在“我的路线”中依次编号。每一站都可以在地图上居中或查看信息。用🗓️+还能把“规划您的一天”的行程加到这里。", "zht": "選擇北部、南部或山頂，用+加入想去的地點，它們會在「我的路線」中依序編號。每一站都可以在地圖上置中或查看資訊。用🗓️+還能把「規劃您的一天」的行程加到這裡。", "bg": "Изберете Север, Юг или Планината и добавете с + местата, които искате да посетите: те се номерират в „Моят маршрут“. Всяка спирка можете да центрирате на картата или да видите информацията ѝ. С 🗓️+ добавяте тук и маршрута от „Подредете деня си“.", "pl": "Po wyborze Północy, Południa albo Szczytu przyciskiem + dodaje się miejsca do odwiedzenia: numerują się w sekcji „Moja trasa”. Każdy przystanek można wyśrodkować na mapie albo zobaczyć jego informacje. Przyciskiem 🗓️+ można tu też dodać plan z sekcji „Planowanie dnia”."},
    "tourABT": {"es": "De A a B", "en": "From A to B", "fr": "De A à B", "de": "Von A nach B", "it": "Da A a B", "nl": "Van A naar B", "zh": "从A到B", "zht": "從A到B", "bg": "От A до B", "pl": "Z A do B"},
    "tourABP": {"es": "Elija origen y destino: toque un marcador, escriba una dirección o use su GPS. Verá la ruta en coche, con minutos y kilómetros, y en guagua: la línea de TITSA, el transbordo si hace falta y lo que hay que caminar. Si a esa hora no pasa ninguna, le dice su horario.", "en": "Choose start and destination: tap a marker, type an address or use your GPS. You'll see the route by car, with minutes and kilometres, and by bus: the TITSA line, the change if needed and the walking. If no bus runs at that time, it shows the timetable.", "fr": "Choisissez départ et arrivée : touchez un marqueur, tapez une adresse ou utilisez le GPS. Vous verrez l'itinéraire en voiture, en minutes et kilomètres, et en bus : la ligne TITSA, la correspondance si besoin et la marche. Si aucun bus ne passe à cette heure, il donne les horaires.", "de": "Wählen Sie Start und Ziel: Marker antippen, Adresse eingeben oder GPS nutzen. Sie sehen die Route mit dem Auto, mit Minuten und Kilometern, und mit dem Bus: die TITSA-Linie, das Umsteigen, falls nötig, und die Fußwege. Fährt um diese Zeit kein Bus, sehen Sie die Betriebszeiten.", "it": "Scelga partenza e arrivo: tocchi un marcatore, scriva un indirizzo o usi il GPS. Vedrà il percorso in auto, con minuti e chilometri, e in autobus: la linea TITSA, il cambio se serve e il tratto a piedi. Se a quell'ora non passa nessun autobus, Le dice gli orari.", "nl": "Kies vertrekpunt en bestemming: tik op een marker, typ een adres of gebruik uw gps. U ziet de route met de auto, in minuten en kilometers, en met de bus: de TITSA-lijn, de overstap als dat nodig is en het stuk lopen. Rijdt er dan geen bus, dan ziet u de dienstregeling.", "zh": "选择起点和终点：点击地图标记、输入地址或用GPS。您会看到自驾路线（分钟和公里数）和公交方案：TITSA线路、需要时的换乘和步行路段。如果当时没有公交，会显示运营时间。", "zht": "選擇起點和終點：點擊地圖標記、輸入地址或用GPS。您會看到自駕路線（分鐘和公里數）和公車方案：TITSA路線、需要時的轉乘和步行路段。如果當時沒有公車，會顯示營運時間。", "bg": "Изберете начало и край: докоснете маркер, напишете адрес или използвайте GPS. Ще видите маршрута с кола, в минути и километри, и с автобус: линията на TITSA, прекачването, ако е нужно, и ходенето пеша. Ако по това време няма автобус, ще видите разписанието.", "pl": "Początek i cel wybiera się dotknięciem znacznika, wpisaniem adresu albo przez GPS. Pojawi się trasa samochodem, w minutach i kilometrach, oraz autobusem: linia TITSA, przesiadka, jeśli trzeba, i odcinki pieszo. Jeśli o tej porze nie jedzie żaden autobus, pojawi się rozkład."},
    "tourLogrosT": {"es": "Logros", "en": "Achievements", "fr": "Succès", "de": "Erfolge", "it": "Traguardi", "nl": "Prestaties", "zh": "成就", "zht": "成就", "bg": "Постижения", "pl": "Osiągnięcia"},
    "tourLogrosP": {"es": "Marque los lugares que visita y desbloquee trofeos mientras explora la isla.", "en": "Mark the places you visit and unlock trophies as you explore the island.", "fr": "Marquez les lieux que vous visitez et débloquez des trophées en explorant l'île.", "de": "Markieren Sie die Orte, die Sie besuchen, und schalten Sie Trophäen frei, während Sie die Insel entdecken.", "it": "Segni i luoghi che visita e sblocchi trofei mentre esplora l'isola.", "nl": "Markeer de plekken die u bezoekt en ontgrendel trofeeën terwijl u het eiland verkent.", "zh": "标记去过的地点，在探索全岛的同时解锁奖杯。", "zht": "標記去過的地點，在探索全島的同時解鎖獎盃。", "bg": "Отбелязвайте местата, които посещавате, и отключвайте трофеи, докато опознавате острова.", "pl": "Zaznaczanie odwiedzonych miejsc odblokowuje trofea w miarę odkrywania wyspy."},
    "tourMarcadoresT": {"es": "Toque los marcadores", "en": "Tap the markers", "fr": "Touchez les marqueurs", "de": "Tippen Sie auf die Marker", "it": "Tocchi i marcatori", "nl": "Tik op de markers", "zh": "点按地图标记", "zht": "點按地圖標記", "bg": "Докоснете маркерите", "pl": "Znaczniki na mapie"},
    "guiaHolaT": {"es": "¡Hola! Soy Jérôme", "en": "Hi! I’m Jérôme", "fr": "Bonjour ! Je suis Jérôme", "de": "Hallo! Ich bin Jérôme", "it": "Salve! Sono Jérôme", "nl": "Hallo! Ik ben Jérôme", "zh": "您好！我是热罗姆", "zht": "您好！我是熱羅姆", "bg": "Здравейте! Аз съм Жером", "pl": "Dzień dobry! Jestem Jérôme"},
    "guiaHolaP": {"es": "Vivo en Tenerife y he hecho esta guía de la isla. ¿Le enseño la app? Son {S} pasos y puede saltarlo cuando quiera.", "en": "I live in Tenerife and I built this guide to the island. Shall I show you around the app? It takes {S} steps and you can skip it at any time.", "fr": "J’habite à Tenerife et j’ai créé ce guide de l’île. Je vous fais visiter l’appli ? Il y a {S} étapes, et vous pouvez passer quand vous voulez.", "de": "Ich lebe auf Teneriffa und habe diesen Inselführer gebaut. Darf ich Ihnen die App zeigen? Es sind {S} Schritte, und Sie können jederzeit überspringen.", "it": "Vivo a Tenerife e ho creato questa guida dell’isola. Le mostro l’app? Sono {S} passi e può saltarli quando vuole.", "nl": "Ik woon op Tenerife en heb deze gids van het eiland gemaakt. Zal ik u de app laten zien? Het zijn {S} stappen en u kunt op elk moment overslaan.", "zh": "我住在特内里费，这份海岛指南是我做的。带您看看这个应用好吗？一共{S}步，随时可以跳过。", "zht": "我住在特內里費，這份海島指南是我做的。帶您看看這個應用程式好嗎？一共{S}步，隨時可以跳過。", "bg": "Живея на Тенерифе и направих този пътеводител за острова. Да ви покажа ли приложението? {S} стъпки са и можете да го спрете по всяко време.", "pl": "Mieszkam na Teneryfie i stworzyłem ten przewodnik po wyspie. Pokazać aplikację w {S} krokach? Przewodnik można pominąć w każdej chwili."},
    "guiaNovP": {"es": "Ahora la visita se la hago yo: soy Jérôme, vivo en Tenerife y le enseño la app entera, con el cielo, las emergencias y todo lo nuevo. Son {S} pasos.", "en": "From now on I’ll be your guide: I’m Jérôme, I live in Tenerife and I’ll show you the whole app, with the night sky, emergencies and everything new. It takes {S} steps.", "fr": "Désormais, c’est moi qui vous fais la visite : je suis Jérôme, j’habite à Tenerife et je vous montre toute l’appli, avec le ciel, les urgences et toutes les nouveautés. Il y a {S} étapes.", "de": "Ab jetzt führe ich Sie: Ich bin Jérôme, lebe auf Teneriffa und zeige Ihnen die ganze App, mit dem Sternenhimmel, den Notfällen und allem Neuen. Es sind {S} Schritte.", "it": "D’ora in poi la visita gliela faccio io: sono Jérôme, vivo a Tenerife e Le mostro tutta l’app, con il cielo, le emergenze e tutte le novità. Sono {S} passi.", "nl": "Vanaf nu leid ik u rond: ik ben Jérôme, ik woon op Tenerife en laat u de hele app zien, met de sterrenhemel, de noodgevallen en al het nieuwe. Het zijn {S} stappen.", "zh": "从现在起由我来带您参观：我是热罗姆，住在特内里费，带您看完整个应用，包括星空、紧急情况和所有新功能。一共{S}步。", "zht": "從現在起由我來帶您參觀：我是熱羅姆，住在特內里費，帶您看完整個應用程式，包括星空、緊急情況和所有新功能。一共{S}步。", "bg": "Отсега аз ще ви развеждам: аз съм Жером, живея на Тенерифе и ще ви покажа цялото приложение, с небето, спешните случаи и всичко ново. {S} стъпки са.", "pl": "Od teraz oprowadzam osobiście: jestem Jérôme, mieszkam na Teneryfie i pokażę całą aplikację, z niebem, nagłymi wypadkami i wszystkimi nowościami, w {S} krokach."},
    "guiaVozOn": {"es": "Escuchar a Jérôme", "en": "Listen to Jérôme", "fr": "Écouter Jérôme", "de": "Jérôme zuhören", "it": "Ascoltare Jérôme", "nl": "Naar Jérôme luisteren", "zh": "听热罗姆讲解", "zht": "聽熱羅姆講解", "bg": "Гласът на Жером", "pl": "Głos Jérôme’a"},
    "guiaVozOff": {"es": "Parar la voz", "en": "Stop the voice", "fr": "Arrêter la voix", "de": "Stimme anhalten", "it": "Fermare la voce", "nl": "Stem stoppen", "zh": "停止朗读", "zht": "停止朗讀", "bg": "Спиране на гласа", "pl": "Zatrzymanie głosu"},
    "guiaMenuT": {"es": "¿Qué le enseño?", "en": "What shall I show you?", "fr": "Que voulez-vous voir ?", "de": "Was darf ich Ihnen zeigen?", "it": "Cosa Le mostro?", "nl": "Wat zal ik u laten zien?", "zh": "想让我带您看什么？", "zht": "想讓我帶您看什麼？", "bg": "Какво да ви покажа?", "pl": "Co pokazać?"},
    "guiaMenuP": {"es": "Elija una visita. Puede salir de ella cuando quiera.", "en": "Pick a tour. You can leave it at any time.", "fr": "Choisissez une visite. Vous pouvez la quitter quand vous voulez.", "de": "Wählen Sie eine Tour. Sie können sie jederzeit beenden.", "it": "Scelga una visita. Può uscirne quando vuole.", "nl": "Kies een tour. U kunt er op elk moment mee stoppen.", "zh": "请选择一个导览，随时可以退出。", "zht": "請選擇一個導覽，隨時可以退出。", "bg": "Изберете обиколка. Можете да излезете от нея по всяко време.", "pl": "Do wyboru są przewodniki. Każdy można przerwać w dowolnej chwili."},
    "guiaMenuCerrar": {"es": "Cerrar", "en": "Close", "fr": "Fermer", "de": "Schließen", "it": "Chiudi", "nl": "Sluiten", "zh": "关闭", "zht": "關閉", "bg": "Затвори", "pl": "Zamknij"},
    "guiaMenuApp": {"es": "La app, de arriba abajo", "en": "The app, top to bottom", "fr": "L’appli, de haut en bas", "de": "Die App, von oben bis unten", "it": "L’app, da cima a fondo", "nl": "De app, van boven tot onder", "zh": "应用全览", "zht": "應用程式全覽", "bg": "Приложението, от горе до долу", "pl": "Aplikacja od góry do dołu"},
    "guiaPasos": {"es": "{n} paso|{n} pasos", "en": "{n} step|{n} steps", "fr": "{n} étape|{n} étapes", "de": "{n} Schritt|{n} Schritte", "it": "{n} passo|{n} passi", "nl": "{n} stap|{n} stappen", "zh": "{n} 步", "zht": "{n} 步", "bg": "{n} стъпка|{n} стъпки", "pl": "{n} krok|{n} kroki|{n} kroków"},
    "guiaCieloPista": {"es": "¿Le enseño este panel?", "en": "Shall I show you this panel?", "fr": "Je vous montre ce panneau ?", "de": "Soll ich Ihnen dieses Panel zeigen?", "it": "Le mostro questo pannello?", "nl": "Zal ik u dit paneel laten zien?", "zh": "要我带您看看这个面板吗？", "zht": "要我帶您看看這個面板嗎？", "bg": "Да ви покажа ли този панел?", "pl": "Pokazać ten panel?"},
    "guiaCapMapa": {"es": "El mapa", "en": "The map", "fr": "La carte", "de": "Die Karte", "it": "La mappa", "nl": "De kaart", "zh": "地图", "zht": "地圖", "bg": "Картата", "pl": "Mapa"},
    "guiaCapHoy": {"es": "Hoy en la isla", "en": "Today on the island", "fr": "Aujourd’hui sur l’île", "de": "Heute auf der Insel", "it": "Oggi sull’isola", "nl": "Vandaag op het eiland", "zh": "今日海岛", "zht": "今日海島", "bg": "Днес на острова", "pl": "Dziś na wyspie"},
    "guiaCapMover": {"es": "Moverse", "en": "Getting around", "fr": "Se déplacer", "de": "Unterwegs", "it": "Muoversi", "nl": "Onderweg", "zh": "出行", "zht": "出行", "bg": "Придвижване", "pl": "Poruszanie się"},
    "guiaCapViaje": {"es": "Su viaje", "en": "Your trip", "fr": "Votre voyage", "de": "Ihre Reise", "it": "Il Suo viaggio", "nl": "Uw reis", "zh": "您的旅程", "zht": "您的旅程", "bg": "Вашето пътуване", "pl": "Podróż"},
    "guiaCapAcaso": {"es": "Por si acaso", "en": "Just in case", "fr": "Au cas où", "de": "Für alle Fälle", "it": "Per ogni evenienza", "nl": "Voor de zekerheid", "zh": "以防万一", "zht": "以防萬一", "bg": "За всеки случай", "pl": "Na wszelki wypadek"},
    "tourIsla3dT": {"es": "La isla en 3D", "en": "The island in 3D", "fr": "L’île en 3D", "de": "Die Insel in 3D", "it": "L’isola in 3D", "nl": "Het eiland in 3D", "zh": "3D 岛屿", "zht": "3D 島嶼", "bg": "Островът в 3D", "pl": "Wyspa w 3D"},
    "tourIsla3dP": {"es": "El relieve de verdad de la isla, con el mapa encima; si quiere, con la luz del sol de este momento. Un dedo la mueve; dos la acercan, la giran y la inclinan. Funciona sin conexión.", "en": "The island’s real relief with the map on top; if you like, lit by the sun of this very moment. One finger moves it; two zoom, rotate and tilt. It works offline.", "fr": "Le vrai relief de l’île, avec la carte par-dessus ; si vous voulez, avec la lumière du soleil de l’instant. Un doigt la déplace ; deux la rapprochent, la font pivoter et l’inclinent. Fonctionne hors ligne.", "de": "Das echte Relief der Insel, mit der Karte darüber; auf Wunsch im Sonnenlicht von genau jetzt. Ein Finger verschiebt, zwei zoomen, drehen und neigen. Funktioniert offline.", "it": "Il vero rilievo dell’isola, con la mappa sopra; se vuole, con la luce del sole di questo momento. Un dito la sposta; due la avvicinano, la ruotano e la inclinano. Funziona offline.", "nl": "Het echte reliëf van het eiland, met de kaart eroverheen; als u wilt in het zonlicht van dit moment. Eén vinger verschuift; twee zoomen, draaien en kantelen. Werkt offline.", "zh": "海岛的真实地形，上面叠着地图；愿意的话，还可以用此刻的阳光来照亮。单指移动，双指缩放、旋转和倾斜。无需网络。", "zht": "海島的真實地形，上面疊著地圖；願意的話，還可以用此刻的陽光來照亮。單指移動，雙指縮放、旋轉和傾斜。無需網路。", "bg": "Истинският релеф на острова, с картата отгоре; ако желаете, със слънчевата светлина в този момент. Един пръст го мести; два го приближават, въртят и накланят. Работи без интернет връзка.", "pl": "Prawdziwa rzeźba wyspy z nałożoną mapą; w razie chęci w świetle słońca z tej właśnie chwili. Jeden palec przesuwa, dwa przybliżają, obracają i pochylają. Działa bez połączenia."},
    "tourPinesP": {"es": "Cada marcador le dice qué es el lugar, su horario si lo tiene y cómo llegar en coche o en guagua; en la costa, también el estado del mar. Los círculos con un número son grupos de lugares: tóquelos y se abren.", "en": "Each marker tells you what the place is, its opening hours if it has them and how to get there by car or bus; on the coast, the sea conditions too. Circles with a number are groups of places: tap one and it opens up.", "fr": "Chaque marqueur vous dit ce qu’est le lieu, ses horaires s’il en a et comment y aller en voiture ou en bus ; sur la côte, l’état de la mer aussi. Les cercles avec un chiffre sont des groupes de lieux : touchez-les pour les ouvrir.", "de": "Jeder Marker zeigt Ihnen, was der Ort ist, die Öffnungszeiten, falls es welche gibt, und wie Sie mit dem Auto oder Bus hinkommen; an der Küste auch den Seegang. Kreise mit einer Zahl sind Gruppen von Orten: Tippen Sie darauf, und sie öffnen sich.", "it": "Ogni marcatore Le dice cos’è il luogo, l’orario se ce l’ha e come arrivarci in auto o in autobus; sulla costa, anche lo stato del mare. I cerchi con un numero sono gruppi di luoghi: li tocchi e si aprono.", "nl": "Elke marker vertelt u wat de plek is, de openingstijden als die er zijn en hoe u er met de auto of de bus komt; aan de kust ook de zeegang. Cirkels met een getal zijn groepen plekken: tik erop en ze gaan open.", "zh": "每个标记都会告诉您这是什么地方、营业时间（如有）以及开车或乘公交怎么去；海边的地点还会显示海况。带数字的圆圈是一组地点，点一下就会展开。", "zht": "每個標記都會告訴您這是什麼地方、營業時間（如有）以及開車或搭公車怎麼去；海邊的地點還會顯示海況。帶數字的圓圈是一組地點，點一下就會展開。", "bg": "Всеки маркер ви казва какво е мястото, работното време, ако има такова, и как да стигнете с кола или автобус; на брега — и състоянието на морето. Кръговете с число са групи от места: докоснете ги и се отварят.", "pl": "Każdy znacznik mówi, co to za miejsce, w jakich godzinach jest otwarte, jeśli ma godziny, i jak dojechać samochodem lub autobusem; na wybrzeżu także stan morza. Kółka z liczbą to grupy miejsc: po dotknięciu się rozwijają."},
    "tourLeyendaT": {"es": "La leyenda", "en": "The legend", "fr": "La légende", "de": "Die Legende", "it": "La legenda", "nl": "De legenda", "zh": "图例", "zht": "圖例", "bg": "Легендата", "pl": "Legenda"},
    "tourLeyendaP": {"es": "Qué significa cada símbolo del mapa. Y dentro me tiene siempre: con «{ver}» vuelvo a enseñarle la app, el cielo o «Su cuerpo».", "en": "What each symbol on the map means. And I’m always in there: with “{ver}” I’ll show you the app, the night sky or “Your body” again.", "fr": "Ce que signifie chaque symbole de la carte. Et vous m’y trouverez toujours : avec « {ver} », je vous refais visiter l’appli, le ciel ou « Votre corps ».", "de": "Was jedes Symbol auf der Karte bedeutet. Und dort finden Sie mich immer: Mit „{ver}“ zeige ich Ihnen die App, den Sternenhimmel oder „Ihr Körper“ noch einmal.", "it": "Cosa significa ogni simbolo della mappa. E lì dentro mi trova sempre: con «{ver}» Le mostro di nuovo l’app, il cielo o «Corpo».", "nl": "Wat elk symbool op de kaart betekent. En daar vindt u mij altijd: met “{ver}” laat ik u de app, de sterrenhemel of “Uw lichaam” opnieuw zien.", "zh": "地图上每个符号的含义。我也一直在里面：点“{ver}”，我再带您看一遍应用、星空或“我的身体”。", "zht": "地圖上每個符號的含義。我也一直在裡面：點「{ver}」，我再帶您看一遍應用程式、星空或「我的身體」。", "bg": "Какво означава всеки символ на картата. А вътре винаги ще ме намерите: с „{ver}“ отново ще ви покажа приложението, небето или „Вашето тяло“.", "pl": "Co oznacza każdy symbol na mapie. Tam też zawsze czekam: przycisk „{ver}” ponownie pokaże aplikację, niebo albo sekcję „Ciało”."},
    "tourFavT": {"es": "Sus favoritos", "en": "Your favourites", "fr": "Vos favoris", "de": "Ihre Favoriten", "it": "I Suoi preferiti", "nl": "Uw favorieten", "zh": "您的收藏", "zht": "您的收藏", "bg": "Вашите любими", "pl": "Ulubione"},
    "tourFavP": {"es": "Guarde con ☆ los lugares que le gusten y aquí los verá juntos. Sin cuenta se quedan en este dispositivo; con cuenta, se sincronizan.", "en": "Save the places you like with ☆ and you’ll see them all together here. Without an account they stay on this device; with an account, they sync.", "fr": "Enregistrez avec ☆ les lieux qui vous plaisent et retrouvez-les tous ici. Sans compte, ils restent sur cet appareil ; avec un compte, ils se synchronisent.", "de": "Speichern Sie mit ☆ die Orte, die Ihnen gefallen, und sehen Sie sie hier alle zusammen. Ohne Konto bleiben sie auf diesem Gerät; mit Konto werden sie synchronisiert.", "it": "Salvi con ☆ i luoghi che Le piacciono e qui li vedrà tutti insieme. Senza account restano su questo dispositivo; con l’account si sincronizzano.", "nl": "Bewaar met ☆ de plekken die u bevallen en u ziet ze hier allemaal bij elkaar. Zonder account blijven ze op dit toestel; met een account worden ze gesynchroniseerd.", "zh": "用 ☆ 收藏喜欢的地点，在这里就能一起查看。没有账户时保存在本设备上；有账户则会同步。", "zht": "用 ☆ 收藏喜歡的地點，在這裡就能一起查看。沒有帳戶時保存在本裝置上；有帳戶則會同步。", "bg": "Запазвайте с ☆ местата, които ви харесват, и тук ще ги виждате заедно. Без профил остават на това устройство; с профил се синхронизират.", "pl": "Miejsca, które się spodobały, zapisuje się przyciskiem ☆ i tu widać je razem. Bez konta zostają na tym urządzeniu; z kontem się synchronizują."},
    "tourAsistenteT": {"es": "El asistente", "en": "The assistant", "fr": "L’assistant", "de": "Der Assistent", "it": "L’assistente", "nl": "De assistent", "zh": "助手", "zht": "助手", "bg": "Асистентът", "pl": "Asystent"},
    "tourAsistenteP": {"es": "Pregúntele por la isla o por la app: playas, guaguas, el Teide, dónde comer… Contesta al instante y en su idioma.", "en": "Ask it about the island or the app: beaches, buses, Teide, where to eat… It answers instantly, in your language.", "fr": "Posez-lui vos questions sur l’île ou sur l’appli : plages, bus, le Teide, où manger… Il répond tout de suite, dans votre langue.", "de": "Fragen Sie ihn nach der Insel oder der App: Strände, Busse, der Teide, wo man gut isst… Er antwortet sofort und in Ihrer Sprache.", "it": "Gli chieda dell’isola o dell’app: spiagge, autobus, il Teide, dove mangiare… Risponde all’istante e nella Sua lingua.", "nl": "Vraag hem naar het eiland of de app: stranden, bussen, de Teide, waar u kunt eten… Hij antwoordt meteen, in uw taal.", "zh": "关于海岛或应用的问题都可以问它：海滩、公交、泰德峰、去哪儿吃……它会立刻用您的语言回答。", "zht": "關於海島或應用程式的問題都可以問它：海灘、公車、泰德峰、去哪兒吃……它會立刻用您的語言回答。", "bg": "Питайте го за острова или за приложението: плажове, автобуси, Тейде, къде да хапнете… Отговаря веднага и на вашия език.", "pl": "Można go zapytać o wyspę albo o aplikację: plaże, autobusy, Teide, gdzie zjeść… Odpowiada od razu i w wybranym języku."},
    "tourCuentaT": {"es": "Su perfil", "en": "Your profile", "fr": "Votre profil", "de": "Ihr Profil", "it": "Il Suo profilo", "nl": "Uw profiel", "zh": "您的个人资料", "zht": "您的個人資料", "bg": "Вашият профил", "pl": "Profil"},
    "tourCuentaP": {"es": "Elija su avatar, lleve la cuenta de los lugares que visita y, si quiere, anote su entrenamiento. La cuenta es opcional: sin ella, todo se queda en su dispositivo.", "en": "Choose your avatar, keep count of the places you visit and, if you like, log your training. An account is optional: without one, everything stays on your device.", "fr": "Choisissez votre avatar, comptez les lieux que vous visitez et, si vous le souhaitez, notez votre entraînement. Le compte est facultatif : sans lui, tout reste sur votre appareil.", "de": "Wählen Sie Ihren Avatar, zählen Sie die Orte, die Sie besuchen, und notieren Sie, wenn Sie möchten, Ihr Training. Ein Konto ist freiwillig: Ohne Konto bleibt alles auf Ihrem Gerät.", "it": "Scelga il Suo avatar, tenga il conto dei luoghi che visita e, se vuole, annoti il Suo allenamento. L’account è facoltativo: senza, tutto resta sul Suo dispositivo.", "nl": "Kies uw avatar, houd bij welke plekken u bezoekt en noteer, als u wilt, uw training. Een account is niet verplicht: zonder account blijft alles op uw toestel.", "zh": "选择头像，记录去过的地点，愿意的话还可以记下训练情况。账户并非必需：没有账户时，一切都保存在您的设备上。", "zht": "選擇頭像，記錄去過的地點，願意的話還可以記下訓練情況。帳戶並非必需：沒有帳戶時，一切都保存在您的裝置上。", "bg": "Изберете аватар, следете местата, които посещавате, и ако желаете, записвайте тренировките си. Профилът не е задължителен: без него всичко остава на вашето устройство.", "pl": "Tu wybiera się awatar, liczy odwiedzone miejsca i, w razie chęci, zapisuje treningi. Konto nie jest obowiązkowe: bez niego wszystko zostaje na urządzeniu."},
    "tourSosT": {"es": "Emergencias", "en": "Emergencies", "fr": "Urgences", "de": "Notfälle", "it": "Emergenze", "nl": "Noodgevallen", "zh": "紧急情况", "zht": "緊急情況", "bg": "Спешни случаи", "pl": "Nagłe wypadki"},
    "tourSosP": {"es": "Qué hacer y a quién llamar ante una emergencia en Tenerife, con fuentes oficiales. El panel se abre también sin conexión y el 112 está siempre a un toque.", "en": "What to do and who to call in an emergency in Tenerife, from official sources. The panel also opens offline, and 112 is always one tap away.", "fr": "Que faire et qui appeler en cas d’urgence à Tenerife, d’après des sources officielles. Le panneau s’ouvre aussi hors ligne, et le 112 est toujours à un geste.", "de": "Was zu tun ist und wen Sie im Notfall auf Teneriffa anrufen, aus offiziellen Quellen. Das Panel öffnet sich auch offline, und die 112 ist immer nur einen Tipp entfernt.", "it": "Cosa fare e chi chiamare in caso di emergenza a Tenerife, con fonti ufficiali. Il pannello si apre anche offline e il 112 è sempre a un tocco.", "nl": "Wat u moet doen en wie u belt bij een noodgeval op Tenerife, uit officiële bronnen. Het paneel opent ook offline en 112 is altijd één tik verwijderd.", "zh": "在特内里费遇到紧急情况该怎么做、该打给谁，内容均来自官方来源。没有网络也能打开，112 随时一键拨打。", "zht": "在特內里費遇到緊急情況該怎麼做、該打給誰，內容均來自官方來源。沒有網路也能開啟，112 隨時一鍵撥打。", "bg": "Какво да направите и на кого да се обадите при спешен случай на Тенерифе, по официални източници. Панелът се отваря и без интернет връзка, а 112 е винаги на едно докосване.", "pl": "Co robić i gdzie dzwonić w nagłym wypadku na Teneryfie, według oficjalnych źródeł. Panel otwiera się także bez połączenia, a numer 112 jest zawsze pod ręką."},
    "tourOfflineT": {"es": "También sin cobertura", "en": "Offline too", "fr": "Même sans réseau", "de": "Auch ohne Netz", "it": "Anche senza rete", "nl": "Ook zonder bereik", "zh": "没有信号也能用", "zht": "沒有訊號也能用", "bg": "И без покритие", "pl": "Także bez zasięgu"},
    "tourOfflineP": {"es": "La app funciona sin conexión una vez abierta. Aquí puede descargar además el mapa detallado de la isla: se baja una sola vez y se queda en el móvil. Mejor con wifi.", "en": "Once it has been opened, the app works offline. Here you can also download the detailed map of the island: it downloads once and stays on your phone. Best on Wi-Fi.", "fr": "Une fois ouverte, l’appli fonctionne hors ligne. Ici, vous pouvez aussi télécharger la carte détaillée de l’île : elle se télécharge une seule fois et reste sur le téléphone. De préférence en Wi-Fi.", "de": "Einmal geöffnet, funktioniert die App auch offline. Hier können Sie außerdem die Detailkarte der Insel laden: Sie wird einmal geladen und bleibt auf dem Telefon. Am besten per WLAN.", "it": "Una volta aperta, l’app funziona offline. Qui può anche scaricare la mappa dettagliata dell’isola: si scarica una sola volta e resta sul telefono. Meglio con il Wi-Fi.", "nl": "Eenmaal geopend werkt de app offline. Hier kunt u ook de gedetailleerde kaart van het eiland downloaden: één keer downloaden en ze blijft op uw telefoon. Liefst via wifi.", "zh": "应用打开过一次后，没有网络也能使用。在这里还可以下载海岛的详细地图：只需下载一次，就会保存在手机上。建议使用 Wi-Fi。", "zht": "應用程式開啟過一次後，沒有網路也能使用。在這裡還可以下載海島的詳細地圖：只需下載一次，就會保存在手機上。建議使用 Wi-Fi。", "bg": "След като е отворено веднъж, приложението работи и без интернет връзка. Тук можете да свалите и подробната карта на острова: сваля се веднъж и остава на телефона. Най-добре с Wi-Fi.", "pl": "Raz otwarta aplikacja działa bez połączenia. Tu można też pobrać szczegółową mapę wyspy: pobiera się ją raz i zostaje w telefonie. Najlepiej przez Wi-Fi."},
    "tourFinT": {"es": "¡La isla es suya!", "en": "The island is yours!", "fr": "L’île est à vous !", "de": "Die Insel gehört Ihnen!", "it": "L’isola è Sua!", "nl": "Het eiland is van u!", "zh": "整座岛都是您的！", "zht": "整座島都是您的！", "bg": "Островът е ваш!", "pl": "Wyspa stoi otworem!"},
    "tourFinP": {"es": "Toque cualquier marcador para empezar. Este tour está siempre en la leyenda del mapa, y el cielo y «Su cuerpo» tienen el suyo dentro. ¡Que la disfrute!", "en": "Tap any marker to get started. This tour is always in the map legend, and the night sky and “Your body” each have their own inside. Enjoy the island!", "fr": "Touchez n’importe quel marqueur pour commencer. Ce tour se trouve toujours dans la légende de la carte, et le ciel et « Votre corps » ont chacun le leur. Profitez bien de l’île !", "de": "Tippen Sie auf einen beliebigen Marker, um loszulegen. Diese Tour finden Sie immer in der Kartenlegende, und der Sternenhimmel und „Ihr Körper“ haben jeweils ihre eigene. Viel Freude auf der Insel!", "it": "Tocchi un marcatore qualsiasi per cominciare. Questo tour è sempre nella legenda della mappa, e il cielo e «Corpo» hanno ciascuno il proprio. Si goda l’isola!", "nl": "Tik op een marker om te beginnen. Deze tour staat altijd in de legenda van de kaart, en de sterrenhemel en “Uw lichaam” hebben elk hun eigen tour. Geniet van het eiland!", "zh": "点任意一个标记就可以开始。这个导览随时可以在地图图例中找到，星空面板和“我的身体”里也各有自己的导览。祝您玩得愉快！", "zht": "點任意一個標記就可以開始。這個導覽隨時可以在地圖圖例中找到，星空面板和「我的身體」裡也各有自己的導覽。祝您玩得愉快！", "bg": "Докоснете който и да е маркер, за да започнете. Тази обиколка е винаги в легендата на картата, а небето и „Вашето тяло“ имат всяко своя. Приятно прекарване на острова!", "pl": "Wystarczy dotknąć dowolnego znacznika, żeby zacząć. Ten przewodnik jest zawsze w legendzie mapy, a niebo i sekcja „Ciało” mają własne. Udanego pobytu na wyspie!"},
    "guiaCiPestanasT": {"es": "El panel, pestaña a pestaña", "en": "The panel, tab by tab", "fr": "Le panneau, onglet par onglet", "de": "Das Panel, Reiter für Reiter", "it": "Il pannello, scheda per scheda", "nl": "Het paneel, tabblad voor tabblad", "zh": "逐页了解星空面板", "zht": "逐頁了解星空面板", "bg": "Панелът, раздел по раздел", "pl": "Panel, zakładka po zakładce"},
    "guiaCiPestanasP": {"es": "Soy Jérôme y le enseño el panel del cielo en {S} pasos. Las horas y las posiciones se calculan en su móvil, para el Observatorio del Teide y en hora de Canarias: por eso funciona también sin cobertura.", "en": "I’m Jérôme and I’ll show you the sky panel in {S} steps. Times and positions are calculated on your phone, for the Teide Observatory and in Canary Islands time: that’s why it also works with no signal.", "fr": "Je suis Jérôme et je vous montre le panneau du ciel en {S} étapes. Les heures et les positions sont calculées sur votre téléphone, pour l’Observatoire du Teide et à l’heure des Canaries : c’est pourquoi il fonctionne aussi sans réseau.", "de": "Ich bin Jérôme und zeige Ihnen das Himmels-Panel in {S} Schritten. Zeiten und Positionen werden auf Ihrem Handy berechnet, für das Teide-Observatorium und in kanarischer Zeit: Deshalb funktioniert es auch ohne Netz.", "it": "Sono Jérôme e Le mostro il pannello del cielo in {S} passi. Gli orari e le posizioni si calcolano sul Suo telefono, per l’Osservatorio del Teide e nell’ora delle Canarie: per questo funziona anche senza rete.", "nl": "Ik ben Jérôme en laat u het hemelpaneel zien in {S} stappen. Tijden en posities worden op uw telefoon berekend, voor het Teide-observatorium en in Canarische tijd: daarom werkt het ook zonder bereik.", "zh": "我是热罗姆，用{S}步带您了解星空面板。时间和位置都在您的手机上计算，以泰德天文台为准、采用加那利时间，所以没有信号也能用。", "zht": "我是熱羅姆，用{S}步帶您了解星空面板。時間和位置都在您的手機上計算，以泰德天文台為準、採用加那利時間，所以沒有訊號也能用。", "bg": "Аз съм Жером и ще ви покажа панела за небето в {S} стъпки. Часовете и позициите се изчисляват на телефона ви, за обсерваторията Тейде и по времето на Канарските острови: затова работи и без покритие.", "pl": "Jestem Jérôme i pokażę panel nieba w {S} krokach. Godziny i pozycje oblicza telefon, dla Obserwatorium Teide i w czasie kanaryjskim: dlatego działa także bez zasięgu."},
    "guiaCiNocheT": {"es": "Esta noche… o la que quiera", "en": "Tonight… or any night you like", "fr": "Ce soir… ou la nuit de votre choix", "de": "Heute Nacht … oder jede andere", "it": "Stanotte… o la notte che vuole", "nl": "Vannacht… of welke nacht u maar wilt", "zh": "今晚……或任何一晚", "zht": "今晚……或任何一晚", "bg": "Тази нощ… или която пожелаете", "pl": "Ta noc… albo dowolna inna"},
    "guiaCiNocheP": {"es": "Con las flechas pasa de una noche a otra y con 📅 elige cualquier fecha: esta pestaña y la carta del cielo pasan a esa noche.", "en": "The arrows move from one night to the next, and 📅 lets you pick any date: this tab and the sky map switch to that night.", "fr": "Les flèches passent d’une nuit à l’autre et 📅 permet de choisir n’importe quelle date : cet onglet et la carte du ciel passent à cette nuit-là.", "de": "Mit den Pfeilen wechseln Sie von Nacht zu Nacht, mit 📅 wählen Sie ein beliebiges Datum: Dieser Reiter und die Himmelskarte wechseln zu dieser Nacht.", "it": "Con le frecce passa da una notte all’altra e con 📅 sceglie qualsiasi data: questa scheda e la mappa del cielo passano a quella notte.", "nl": "Met de pijlen gaat u van nacht naar nacht en met 📅 kiest u een willekeurige datum: dit tabblad en de hemelkaart schakelen naar die nacht.", "zh": "用箭头可以切换到前一晚或后一晚，用 📅 可以选择任意日期：本页和星图都会切换到那一晚。", "zht": "用箭頭可以切換到前一晚或後一晚，用 📅 可以選擇任意日期：本頁和星圖都會切換到那一晚。", "bg": "Със стрелките минавате от една нощ към друга, а с 📅 избирате която и да е дата: този раздел и картата на небето преминават към тази нощ.", "pl": "Strzałki przechodzą z nocy na noc, a 📅 pozwala wybrać dowolną datę: ta zakładka i mapa nieba przełączają się na tę noc."},
    "guiaCiIndiceP": {"es": "De 0 a 10, cuánto vale la noche para mirar estrellas: cuenta las horas de noche cerrada, la Luna y las nubes previstas. La fórmula está escrita debajo.", "en": "From 0 to 10, how good the night is for stargazing: it counts the hours of full darkness, the Moon and the forecast cloud. The formula is written just below.", "fr": "De 0 à 10, ce que vaut la nuit pour observer les étoiles : il compte les heures de nuit noire, la Lune et les nuages prévus. La formule est écrite juste en dessous.", "de": "Von 0 bis 10: wie gut die Nacht zum Sternegucken ist. Gezählt werden die Stunden völliger Dunkelheit, der Mond und die vorhergesagten Wolken. Die Formel steht direkt darunter.", "it": "Da 0 a 10, quanto vale la notte per guardare le stelle: conta le ore di notte fonda, la Luna e le nuvole previste. La formula è scritta sotto.", "nl": "Van 0 tot 10: hoe goed de nacht is om sterren te kijken. Het telt de uren volledige duisternis, de maan en de verwachte bewolking. De formule staat eronder.", "zh": "从 0 到 10，表示这一晚适不适合观星：综合了完全黑夜的时长、月亮和预报的云量。计算公式就写在下面。", "zht": "從 0 到 10，表示這一晚適不適合觀星：綜合了完全黑夜的時長、月亮和預報的雲量。計算公式就寫在下面。", "bg": "От 0 до 10 — колко струва нощта за гледане на звезди: отчита часовете пълна тъмнина, Луната и прогнозираните облаци. Формулата е написана отдолу.", "pl": "Od 0 do 10: ile warta jest noc do oglądania gwiazd. Liczą się godziny pełnej ciemności, Księżyc i prognozowane chmury. Wzór jest zapisany poniżej."},
    "guiaCiGuiadaP": {"es": "Las paradas de esta noche, de lo más fácil a lo más fino. Con «{llevame}», una flecha le lleva por el cielo hasta cada una.", "en": "Tonight’s stops, from the easiest to the most subtle. With “{llevame}”, an arrow leads you across the sky to each one.", "fr": "Les étapes de cette nuit, du plus facile au plus fin. Avec « {llevame} », une flèche vous guide dans le ciel jusqu’à chacune.", "de": "Die Stationen dieser Nacht, vom Leichtesten zum Feinsten. Mit „{llevame}“ führt Sie ein Pfeil am Himmel zu jeder einzelnen.", "it": "Le tappe di questa notte, dalla più facile alla più fine. Con «{llevame}», una freccia La porta nel cielo fino a ciascuna.", "nl": "De haltes van deze nacht, van de makkelijkste tot de fijnste. Met “{llevame}” leidt een pijl u langs de hemel naar elke halte.", "zh": "今晚的观星站点，从最容易的到最需要耐心的。点“{llevame}”，箭头会带您在天空中找到每一站。", "zht": "今晚的觀星站點，從最容易的到最需要耐心的。點「{llevame}」，箭頭會帶您在天空中找到每一站。", "bg": "Спирките за тази нощ, от най-лесното към най-финото. С „{llevame}“ стрелка ви води по небето до всяка от тях.", "pl": "Przystanki tej nocy, od najłatwiejszych do najsubtelniejszych. Przycisk „{llevame}” prowadzi strzałką po niebie do każdego z nich."},
    "guiaCiPlanetasP": {"es": "Cada planeta, con sus horas y hacia dónde mirar. La etiqueta dice si se ve a simple vista, con prismáticos o con telescopio. Toque uno y lo verá en la carta del cielo.", "en": "Each planet, with its hours and where to look. The tag tells you whether it can be seen with the naked eye, binoculars or a telescope. Tap one to see it on the sky map.", "fr": "Chaque planète, avec ses heures et la direction où regarder. L’étiquette indique si elle se voit à l’œil nu, aux jumelles ou au télescope. Touchez-en une pour la voir sur la carte du ciel.", "de": "Jeder Planet mit seinen Zeiten und der Blickrichtung. Das Etikett sagt, ob er mit bloßem Auge, mit dem Fernglas oder mit dem Teleskop zu sehen ist. Tippen Sie einen an, und Sie sehen ihn auf der Himmelskarte.", "it": "Ogni pianeta, con i suoi orari e dove guardare. L’etichetta dice se si vede a occhio nudo, con il binocolo o con il telescopio. Ne tocchi uno e lo vedrà sulla mappa del cielo.", "nl": "Elke planeet, met zijn uren en waar u moet kijken. Het label zegt of hij met het blote oog, een verrekijker of een telescoop te zien is. Tik er een aan en u ziet hem op de hemelkaart.", "zh": "每颗行星的可见时间和观看方向。标签说明用肉眼、双筒望远镜还是天文望远镜才能看到。点任意一颗，就能在星图上看到它。", "zht": "每顆行星的可見時間和觀看方向。標籤說明用肉眼、雙筒望遠鏡還是天文望遠鏡才能看到。點任意一顆，就能在星圖上看到它。", "bg": "Всяка планета, с часовете ѝ и накъде да гледате. Етикетът казва дали се вижда с просто око, с бинокъл или с телескоп. Докоснете някоя и ще я видите на картата на небето.", "pl": "Każda planeta z godzinami widoczności i kierunkiem patrzenia. Etykieta mówi, czy widać ją gołym okiem, przez lornetkę czy przez teleskop. Po dotknięciu planeta pokazuje się na mapie nieba."},
    "guiaCiCalendarioT": {"es": "El calendario del cielo", "en": "The sky calendar", "fr": "Le calendrier du ciel", "de": "Der Himmelskalender", "it": "Il calendario del cielo", "nl": "De hemelkalender", "zh": "天象日历", "zht": "天象行事曆", "bg": "Календарът на небето", "pl": "Kalendarz nieba"},
    "guiaCiCalendarioP": {"es": "Lluvias de estrellas, eclipses, planetas, fases de la Luna y pasos de satélites. Cada evento se puede añadir a su calendario, o pedir que la app se lo recuerde.", "en": "Meteor showers, eclipses, planets, Moon phases and satellite passes. You can add any event to your calendar, or ask the app to remind you.", "fr": "Pluies d’étoiles filantes, éclipses, planètes, phases de la Lune et passages de satellites. Chaque événement peut être ajouté à votre calendrier, ou rappelé par l’appli.", "de": "Sternschnuppen, Finsternisse, Planeten, Mondphasen und Satellitenüberflüge. Jedes Ereignis können Sie in Ihren Kalender übernehmen oder sich von der App daran erinnern lassen.", "it": "Stelle cadenti, eclissi, pianeti, fasi della Luna e passaggi di satelliti. Ogni evento si può aggiungere al Suo calendario, oppure può chiedere all’app di ricordarglielo.", "nl": "Meteorenzwermen, eclipsen, planeten, maanfasen en satellietpassages. Elke gebeurtenis kunt u aan uw agenda toevoegen, of u laat de app u eraan herinneren.", "zh": "流星雨、日月食、行星、月相和卫星过境。每个天象都可以添加到您的日历，或者让应用提醒您。", "zht": "流星雨、日月食、行星、月相和衛星過境。每個天象都可以加入您的行事曆，或者讓應用程式提醒您。", "bg": "Метеорни потоци, затъмнения, планети, фази на Луната и преминавания на спътници. Всяко събитие можете да добавите в календара си или да поискате приложението да ви напомни.", "pl": "Roje meteorów, zaćmienia, planety, fazy Księżyca i przeloty satelitów. Każde wydarzenie można dodać do kalendarza albo ustawić przypomnienie w aplikacji."},
    "guiaCiCatalogoT": {"es": "El catálogo", "en": "The catalog", "fr": "Le catalogue", "de": "Der Katalog", "it": "Il catalogo", "nl": "De catalogus", "zh": "星表", "zht": "星表", "bg": "Каталогът", "pl": "Katalog"},
    "guiaCiCatalogoP": {"es": "Estrellas, constelaciones, cúmulos, nebulosas, galaxias… Busque por nombre o filtre por lo que tenga a mano: sus ojos, unos prismáticos o un telescopio.", "en": "Stars, constellations, clusters, nebulae, galaxies… Search by name or filter by what you have to hand: your eyes, binoculars or a telescope.", "fr": "Étoiles, constellations, amas, nébuleuses, galaxies… Cherchez par nom ou filtrez selon ce que vous avez sous la main : vos yeux, des jumelles ou un télescope.", "de": "Sterne, Sternbilder, Sternhaufen, Nebel, Galaxien… Suchen Sie nach Namen oder filtern Sie nach dem, was Sie zur Hand haben: Ihre Augen, ein Fernglas oder ein Teleskop.", "it": "Stelle, costellazioni, ammassi, nebulose, galassie… Cerchi per nome o filtri in base a ciò che ha a portata di mano: gli occhi, un binocolo o un telescopio.", "nl": "Sterren, sterrenbeelden, sterrenhopen, nevels, sterrenstelsels… Zoek op naam of filter op wat u bij de hand heeft: uw ogen, een verrekijker of een telescoop.", "zh": "恒星、星座、星团、星云、星系……可以按名称搜索，也可以按手边的工具筛选：肉眼、双筒望远镜或天文望远镜。", "zht": "恆星、星座、星團、星雲、星系……可以按名稱搜尋，也可以按手邊的工具篩選：肉眼、雙筒望遠鏡或天文望遠鏡。", "bg": "Звезди, съзвездия, купове, мъглявини, галактики… Търсете по име или филтрирайте според това, което имате под ръка: очите си, бинокъл или телескоп.", "pl": "Gwiazdy, gwiazdozbiory, gromady, mgławice, galaktyki… Można szukać po nazwie albo filtrować według tego, co jest pod ręką: własne oczy, lornetka lub teleskop."},
    "guiaCiCartaT": {"es": "La carta del cielo", "en": "The sky map", "fr": "La carte du ciel", "de": "Die Himmelskarte", "it": "La mappa del cielo", "nl": "De hemelkaart", "zh": "星图", "zht": "星圖", "bg": "Картата на небето", "pl": "Mapa nieba"},
    "guiaCiCartaP": {"es": "El cielo tal como se ve desde Tenerife. Arrástrela, pellizque para acercar, corra la noche con ▶ y toque cualquier astro para abrir su ficha.", "en": "The sky just as it looks from Tenerife. Drag it, pinch to zoom, run the night with ▶ and tap any object to open its card.", "fr": "Le ciel tel qu’on le voit depuis Tenerife. Faites-la glisser, pincez pour zoomer, faites défiler la nuit avec ▶ et touchez un astre pour ouvrir sa fiche.", "de": "Der Himmel, wie er von Teneriffa aus aussieht. Ziehen Sie die Karte, zoomen Sie mit zwei Fingern, lassen Sie die Nacht mit ▶ ablaufen und tippen Sie ein Objekt an, um seine Karte zu öffnen.", "it": "Il cielo così come si vede da Tenerife. La trascini, pizzichi per ingrandire, faccia scorrere la notte con ▶ e tocchi un astro per aprirne la scheda.", "nl": "De hemel zoals hij er vanaf Tenerife uitziet. Sleep de kaart, knijp om te zoomen, laat de nacht lopen met ▶ en tik op een object om zijn fiche te openen.", "zh": "这就是从特内里费看到的星空。可以拖动、双指缩放，用 ▶ 让夜晚流动起来，点任意天体即可打开它的资料卡。", "zht": "這就是從特內里費看到的星空。可以拖曳、雙指縮放，用 ▶ 讓夜晚流動起來，點任意天體即可開啟它的資料卡。", "bg": "Небето така, както се вижда от Тенерифе. Плъзгайте картата, щипнете, за да приближите, пуснете нощта с ▶ и докоснете който и да е обект, за да отворите картона му.", "pl": "Niebo takie, jak widać je z Teneryfy. Mapę można przesuwać, przybliżać dwoma palcami, puścić noc przyciskiem ▶ i dotknąć dowolnego obiektu, żeby otworzyć jego kartę."},
    "guiaCiApunteP": {"es": "Levante el móvil hacia una estrella y le dice cuál es. Si quiere, con la imagen de la cámara detrás. Nada de la cámara ni de los sensores sale del móvil.", "en": "Hold your phone up to a star and it tells you which one it is. If you like, with the camera image behind. Nothing from the camera or the sensors leaves your phone.", "fr": "Levez le téléphone vers une étoile et il vous dit laquelle c’est. Si vous voulez, avec l’image de la caméra derrière. Rien de la caméra ni des capteurs ne quitte le téléphone.", "de": "Halten Sie das Handy zu einem Stern hoch, und es sagt Ihnen, welcher es ist. Auf Wunsch mit dem Kamerabild dahinter. Nichts von Kamera oder Sensoren verlässt das Handy.", "it": "Alzi il telefono verso una stella e Le dice qual è. Se vuole, con l’immagine della fotocamera dietro. Niente della fotocamera né dei sensori esce dal telefono.", "nl": "Houd uw telefoon omhoog naar een ster en hij zegt welke het is. Als u wilt met het camerabeeld erachter. Niets van de camera of de sensoren verlaat uw telefoon.", "zh": "把手机举向一颗星星，它就告诉您那是哪一颗。愿意的话，还可以把摄像头画面放在后面。摄像头和传感器的数据都不会离开手机。", "zht": "把手機舉向一顆星星，它就告訴您那是哪一顆。願意的話，還可以把相機畫面放在後面。相機和感測器的資料都不會離開手機。", "bg": "Вдигнете телефона към звезда и той ще ви каже коя е. Ако желаете, с картината от камерата отзад. Нищо от камерата или сензорите не напуска телефона.", "pl": "Wystarczy unieść telefon w stronę gwiazdy, a aplikacja powie, która to. W razie chęci z obrazem z aparatu w tle. Nic z aparatu ani z czujników nie opuszcza telefonu."},
    "guiaCiRojaP": {"es": "Tiñe la pantalla de rojo: no deslumbra y la vista sigue adaptada a la oscuridad. Se la enciendo un momento para que la vea.", "en": "It turns the screen red: no glare, and your eyes stay adapted to the dark. I’ll switch it on for a moment so you can see it.", "fr": "Elle teinte l’écran en rouge : pas d’éblouissement, et vos yeux restent adaptés à l’obscurité. Je l’allume un instant pour vous la montrer.", "de": "Es färbt den Bildschirm rot: Es blendet nicht, und Ihre Augen bleiben an die Dunkelheit angepasst. Ich schalte es kurz ein, damit Sie es sehen.", "it": "Tinge lo schermo di rosso: non abbaglia e la vista resta adattata al buio. Gliela accendo un momento per mostrargliela.", "nl": "Het kleurt het scherm rood: het verblindt niet en uw ogen blijven aan het donker gewend. Ik zet het even aan zodat u het ziet.", "zh": "它把屏幕染成红色：不刺眼，眼睛也能保持对黑暗的适应。我为您打开一会儿看看。", "zht": "它把螢幕染成紅色：不刺眼，眼睛也能保持對黑暗的適應。我為您開啟一會兒看看。", "bg": "Оцветява екрана в червено: не заслепява и очите остават привикнали към тъмното. Включвам я за момент, за да я видите.", "pl": "Barwi ekran na czerwono: nie oślepia, a wzrok pozostaje przyzwyczajony do ciemności. Włączam je na chwilę, żeby było widać."},
    "guiaCiSubirP": {"es": "Arriba puede no haber cobertura. Esta tarjeta le dice si el panel ya está guardado en su móvil para usarlo allí sin conexión.", "en": "There may be no signal up there. This card tells you whether the panel is already saved on your phone, so you can use it there offline.", "fr": "Là-haut, il peut ne pas y avoir de réseau. Cette carte vous dit si le panneau est déjà enregistré sur votre téléphone, pour l’utiliser là-haut hors ligne.", "de": "Oben gibt es möglicherweise kein Netz. Diese Karte sagt Ihnen, ob das Panel schon auf Ihrem Handy gespeichert ist, damit Sie es dort offline nutzen können.", "it": "Lassù può non esserci rete. Questa scheda Le dice se il pannello è già salvato sul Suo telefono, per usarlo lì offline.", "nl": "Boven is er mogelijk geen bereik. Deze kaart zegt of het paneel al op uw telefoon is opgeslagen, zodat u het daar offline kunt gebruiken.", "zh": "山上可能没有信号。这张卡片会告诉您面板是否已保存在手机上，这样到了那里无需网络也能使用。", "zht": "山上可能沒有訊號。這張卡片會告訴您面板是否已保存在手機上，這樣到了那裡無需網路也能使用。", "bg": "Горе може да няма покритие. Тази карта ви казва дали панелът вече е запазен на телефона ви, за да го ползвате там без интернет връзка.", "pl": "Na górze może nie być zasięgu. Ta karta mówi, czy panel jest już zapisany w telefonie, żeby dało się go tam używać bez połączenia."},
    "guiaCiDondeP": {"es": "Miradores y otros sitios para ver las estrellas, lo que conviene llevar y las normas del Parque Nacional para la noche.", "en": "Viewpoints and other places for stargazing, what to bring and the National Park’s rules for the night.", "fr": "Des belvédères et d’autres lieux pour observer les étoiles, ce qu’il faut emporter et les règles du Parc national pour la nuit.", "de": "Aussichtspunkte und andere Orte zum Sternegucken, was Sie mitnehmen sollten und die Regeln des Nationalparks für die Nacht.", "it": "Belvedere e altri luoghi per guardare le stelle, cosa conviene portare e le regole del Parco Nazionale per la notte.", "nl": "Uitzichtpunten en andere plekken om sterren te kijken, wat u het best meeneemt en de regels van het Nationaal Park voor de nacht.", "zh": "适合观星的观景台和其他地点、建议携带的物品，以及国家公园的夜间规定。", "zht": "適合觀星的觀景台和其他地點、建議攜帶的物品，以及國家公園的夜間規定。", "bg": "Панорамни площадки и други места за гледане на звезди, какво е добре да носите и правилата на Националния парк за през нощта.", "pl": "Punkty widokowe i inne miejsca do oglądania gwiazd, co warto zabrać i nocne zasady Parku Narodowego."},
    "guiaCiFinT": {"es": "¡Buenas noches de estrellas!", "en": "Clear skies!", "fr": "Belles nuits étoilées !", "de": "Sternklare Nächte!", "it": "Buone notti di stelle!", "nl": "Heldere nachten!", "zh": "祝您观星愉快！", "zht": "祝您觀星愉快！", "bg": "Звездни нощи!", "pl": "Gwiaździstych nocy!"},
    "guiaCiFinP": {"es": "Abríguese: en las cumbres refresca mucho de noche. Este tour está siempre aquí arriba, en el botón con mi cara.", "en": "Wrap up warm: it gets very chilly on the summits at night. This tour is always up here, on the button with my face.", "fr": "Couvrez-vous bien : il fait très frais sur les sommets la nuit. Ce tour se trouve toujours ici, en haut, sur le bouton à mon effigie.", "de": "Ziehen Sie sich warm an: Auf den Gipfeln wird es nachts sehr frisch. Diese Tour finden Sie immer hier oben, auf dem Knopf mit meinem Gesicht.", "it": "Si copra bene: sulle cime di notte fa molto fresco. Questo tour è sempre quassù, nel pulsante con la mia faccia.", "nl": "Kleed u warm aan: op de toppen wordt het ’s nachts erg fris. Deze tour staat altijd hierboven, op de knop met mijn gezicht.", "zh": "请注意保暖：山顶的夜晚很凉。这个导览一直在上方带有我头像的按钮里。", "zht": "請注意保暖：山頂的夜晚很涼。這個導覽一直在上方帶有我頭像的按鈕裡。", "bg": "Облечете се топло: по върховете нощем става доста хладно. Тази обиколка е винаги тук горе, в бутона с моето лице.", "pl": "Warto ubrać się ciepło: na szczytach nocą robi się bardzo chłodno. Ten przewodnik jest zawsze tu u góry, pod przyciskiem z moją twarzą."},
    "guiaCuTitulo": {"es": "Su cuerpo", "en": "Your body", "fr": "Votre corps", "de": "Ihr Körper", "it": "Corpo", "nl": "Uw lichaam", "zh": "我的身体", "zht": "我的身體", "bg": "Вашето тяло", "pl": "Ciało"},
    "guiaCuPista": {"es": "¿Le enseño esta pantalla?", "en": "Shall I show you this screen?", "fr": "Je vous montre cet écran ?", "de": "Soll ich Ihnen diesen Bildschirm zeigen?", "it": "Le mostro questa schermata?", "nl": "Zal ik u dit scherm laten zien?", "zh": "要我带您看看这个页面吗？", "zht": "要我帶您看看這個頁面嗎？", "bg": "Да ви покажа ли този екран?", "pl": "Pokazać ten ekran?"},
    "guiaCuPersonajeT": {"es": "Su personaje", "en": "Your character", "fr": "Votre personnage", "de": "Ihre Figur", "it": "Il Suo personaggio", "nl": "Uw personage", "zh": "您的人物", "zht": "您的人物", "bg": "Вашият герой", "pl": "Postać"},
    "guiaCuPersonajeP": {"es": "Soy Jérôme y le enseño «Su cuerpo» en {S} pasos. Este es su personaje: toque uno de sus músculos y podrá anotar una serie. «{girar}» lo enseña de espaldas.", "en": "I’m Jérôme and I’ll show you “Your body” in {S} steps. This is your character: tap one of its muscles and you can log a set. “{girar}” shows it from behind.", "fr": "Je suis Jérôme et je vous montre « Votre corps » en {S} étapes. Voici votre personnage : touchez l’un de ses muscles pour noter une série. « {girar} » le montre de dos.", "de": "Ich bin Jérôme und zeige Ihnen „Ihr Körper“ in {S} Schritten. Das ist Ihre Figur: Tippen Sie auf einen ihrer Muskeln, um einen Satz einzutragen. „{girar}“ zeigt sie von hinten.", "it": "Sono Jérôme e Le mostro «Corpo» in {S} passi. Questo è il Suo personaggio: tocchi uno dei suoi muscoli e potrà annotare una serie. «{girar}» lo mostra di spalle.", "nl": "Ik ben Jérôme en laat u “Uw lichaam” zien in {S} stappen. Dit is uw personage: tik op een van de spieren en u kunt een set noteren. “{girar}” laat het van achteren zien.", "zh": "我是热罗姆，用{S}步带您了解“我的身体”。这是您的人物：点它的任意一块肌肉，就能记录一组。点“{girar}”可以看背面。", "zht": "我是熱羅姆，用{S}步帶您了解「我的身體」。這是您的人物：點它的任意一塊肌肉，就能記錄一組。點「{girar}」可以看背面。", "bg": "Аз съм Жером и ще ви покажа „Вашето тяло“ в {S} стъпки. Това е вашият герой: докоснете някой от мускулите му и ще можете да запишете серия. „{girar}“ го показва в гръб.", "pl": "Jestem Jérôme i pokażę sekcję „Ciało” w {S} krokach. Oto postać: wystarczy dotknąć jednego z jej mięśni, żeby zapisać serię. „{girar}” pokazuje ją od tyłu."},
    "guiaCuLeyendaP": {"es": "Cada músculo se enciende según las series que lleve anotadas en los últimos 7 días: primero en rosa, luego en naranja y, con más, en amarillo.", "en": "Each muscle lights up according to the sets you have logged in the last 7 days: pink first, then orange and, with more, yellow.", "fr": "Chaque muscle s’allume selon les séries notées ces 7 derniers jours : d’abord en rose, puis en orange et, avec davantage, en jaune.", "de": "Jeder Muskel leuchtet je nach den Sätzen, die Sie in den letzten 7 Tagen eingetragen haben: erst rosa, dann orange und bei noch mehr gelb.", "it": "Ogni muscolo si accende in base alle serie annotate negli ultimi 7 giorni: prima in rosa, poi in arancione e, con più serie, in giallo.", "nl": "Elke spier licht op naargelang de sets die u in de afgelopen 7 dagen hebt genoteerd: eerst roze, dan oranje en met nog meer geel.", "zh": "每块肌肉会根据过去 7 天记录的组数亮起：先是粉色，然后是橙色，组数更多时是黄色。", "zht": "每塊肌肉會根據過去 7 天記錄的組數亮起：先是粉色，然後是橘色，組數更多時是黃色。", "bg": "Всеки мускул светва според сериите, които сте записали през последните 7 дни: първо в розово, после в оранжево, а при още повече — в жълто.", "pl": "Każdy mięsień podświetla się zależnie od serii zapisanych w ostatnich 7 dniach: najpierw na różowo, potem na pomarańczowo, a przy większej liczbie na żółto."},
    "guiaCuDeporteP": {"es": "Elija el deporte que practica: su personaje marca los grupos que más le sirven, y debajo verá qué dicen los estudios y cómo encajarlo en su semana.", "en": "Choose the sport you do: your character marks the muscle groups that help most, and below you’ll see what the studies say and how to fit it into your week.", "fr": "Choisissez le sport que vous pratiquez : votre personnage indique les groupes les plus utiles et, en dessous, vous verrez ce que disent les études et comment l’intégrer à votre semaine.", "de": "Wählen Sie Ihren Sport: Ihre Figur markiert die Muskelgruppen, die am meisten helfen, und darunter sehen Sie, was die Studien sagen und wie er in Ihre Woche passt.", "it": "Scelga lo sport che pratica: il Suo personaggio indica i gruppi più utili e, sotto, vedrà che cosa dicono gli studi e come inserirlo nella Sua settimana.", "nl": "Kies de sport die u beoefent: uw personage markeert de spiergroepen die het meest helpen, en daaronder ziet u wat de studies zeggen en hoe u het in uw week inpast.", "zh": "选择您从事的运动：人物会标出最有帮助的肌群，下面还能看到研究结论，以及如何把它安排进您的一周。", "zht": "選擇您從事的運動：人物會標出最有幫助的肌群，下面還能看到研究結論，以及如何把它安排進您的一週。", "bg": "Изберете спорта, който практикувате: вашият герой отбелязва най-полезните мускулни групи, а отдолу ще видите какво казват проучванията и как да го впишете в седмицата си.", "pl": "Po wybraniu uprawianego sportu postać zaznacza najbardziej przydatne grupy mięśni, a poniżej widać, co mówią badania i jak wpleść go w tydzień."},
    "guiaCuSemanaP": {"es": "Tres metas: días con fuerza y minutos de movimiento, los que recomienda la OMS para su edad, y grupos trabajados. Debajo, su semana día a día: toque un día y verá lo que anotó.", "en": "Three goals: strength days and minutes of movement, as the WHO recommends for your age, and groups worked. Below, your week day by day: tap a day to see what you logged.", "fr": "Trois objectifs : jours de renforcement et minutes de mouvement, ceux que l’OMS recommande pour votre âge, et groupes travaillés. En dessous, votre semaine jour par jour : touchez un jour pour voir ce que vous avez noté.", "de": "Drei Ziele: Krafttage und Minuten Bewegung, wie von der WHO für Ihr Alter empfohlen, und trainierte Gruppen. Darunter Ihre Woche Tag für Tag: Tippen Sie auf einen Tag, um zu sehen, was Sie eingetragen haben.", "it": "Tre obiettivi: giorni di forza e minuti di movimento, quelli che l’OMS raccomanda per la Sua età, e gruppi allenati. Sotto, la Sua settimana giorno per giorno: tocchi un giorno per vedere che cosa ha annotato.", "nl": "Drie doelen: krachtdagen en minuten beweging, zoals de WHO voor uw leeftijd aanbeveelt, en getrainde groepen. Daaronder uw week van dag tot dag: tik op een dag om te zien wat u hebt genoteerd.", "zh": "三个目标：力量训练天数和运动分钟数（依据世界卫生组织对您这个年龄的建议），以及练过的肌群。下面是按天显示的一周：点某一天，就能看到当天的记录。", "zht": "三個目標：肌力訓練天數和運動分鐘數（依據世界衛生組織對您這個年齡的建議），以及練過的肌群。下面是按天顯示的一週：點某一天，就能看到當天的記錄。", "bg": "Три цели: дни със силови упражнения и минути движение, колкото препоръчва СЗО за вашата възраст, и тренирани групи. Отдолу е седмицата ви ден по ден: докоснете ден, за да видите какво сте записали.", "pl": "Trzy cele: dni treningu siłowego i minuty ruchu, tyle, ile zaleca WHO dla danego wieku, oraz ćwiczone grupy. Poniżej tydzień dzień po dniu: dotknięcie dnia pokazuje, co zostało zapisane."},
    "guiaCuMovP": {"es": "Caminar, correr, nadar, bici, kayak, surf, buceo… Cada deporte tiene sus datos: los minutos y la intensidad y, donde toca, la distancia y el desnivel. Todo suma a su semana.", "en": "Walking, running, swimming, cycling, kayaking, surfing, scuba diving… Each sport has its own data: minutes and intensity and, where it applies, distance and elevation gain. It all counts towards your week.", "fr": "Marche, course à pied, natation, vélo, kayak, surf, plongée… Chaque sport a ses données : les minutes et l’intensité et, selon le cas, la distance et le dénivelé. Tout compte pour votre semaine.", "de": "Gehen, Laufen, Schwimmen, Radfahren, Kajakfahren, Surfen, Tauchen … Jede Sportart hat ihre Angaben: Minuten und Intensität und, wo es passt, Strecke und Höhenmeter. Alles zählt für Ihre Woche.", "it": "Camminata, corsa, nuoto, bici, kayak, surf, immersioni… Ogni sport ha i suoi dati: i minuti e l’intensità e, dove serve, la distanza e il dislivello. Tutto conta per la Sua settimana.", "nl": "Wandelen, hardlopen, zwemmen, fietsen, kajakken, surfen, duiken… Elke sport heeft zijn eigen gegevens: minuten en intensiteit en, waar van toepassing, afstand en hoogtemeters. Alles telt mee voor uw week.", "zh": "步行、跑步、游泳、骑车、皮划艇、冲浪、潜水……每项运动都有自己的数据：分钟数和强度，需要时还有距离和累计爬升。都会计入您的一周。", "zht": "步行、跑步、游泳、騎車、獨木舟、衝浪、潛水……每項運動都有自己的資料：分鐘數和強度，需要時還有距離和累計爬升。都會計入您的一週。", "bg": "Ходене, бягане, плуване, колело, каяк, сърф, гмуркане… Всеки спорт има своите данни: минутите и интензивността, а където е уместно — разстоянието и изкачването. Всичко се брои за седмицата ви.", "pl": "Spacer, bieganie, pływanie, rower, kajak, surfing, nurkowanie… Każdy sport ma swoje dane: minuty i intensywność, a tam, gdzie trzeba, dystans i przewyższenie. Wszystko liczy się do tygodnia."},
    "guiaCuHoyP": {"es": "El tiempo de la zona que elija, con su índice UV, y los avisos de AEMET que la afectan. Y un consejo para hoy: lo que le falta a su semana y, con sol fuerte, a qué horas buscar sombra.", "en": "The weather for the zone you choose, with its UV index, and the AEMET warnings that affect it. Plus a tip for today: what your week is still missing and, when the sun is strong, at what hours to seek shade.", "fr": "La météo de la zone que vous choisissez, avec son indice UV, et les alertes de l’AEMET qui la concernent. Et un conseil pour aujourd’hui : ce qu’il manque à votre semaine et, par fort soleil, à quelles heures chercher l’ombre.", "de": "Das Wetter der Zone, die Sie wählen, mit UV-Index, und die AEMET-Warnungen, die sie betreffen. Dazu ein Tipp für heute: was Ihrer Woche noch fehlt und, bei starker Sonne, zu welchen Stunden Sie Schatten suchen sollten.", "it": "Il meteo della zona che sceglie, con il suo indice UV, e gli avvisi AEMET che la riguardano. E un consiglio per oggi: che cosa manca alla Sua settimana e, con il sole forte, a che ore cercare l’ombra.", "nl": "Het weer van de zone die u kiest, met de uv-index, en de AEMET-waarschuwingen die ervoor gelden. Plus een tip voor vandaag: wat uw week nog mist en, bij felle zon, op welke uren u schaduw moet opzoeken.", "zh": "您所选区域的天气和紫外线指数，以及影响该区域的 AEMET 预警。还有一条今日建议：这一周还差什么，以及阳光强烈时哪些时段该找阴凉。", "zht": "您所選區域的天氣和紫外線指數，以及影響該區域的 AEMET 警報。還有一則今日建議：這一週還差什麼，以及陽光強烈時哪些時段該找陰涼。", "bg": "Времето в зоната, която изберете, с UV индекса ѝ, и предупрежденията на AEMET, които я засягат. И съвет за днес: какво още липсва на седмицата ви и, при силно слънце, в кои часове да търсите сянка.", "pl": "Pogoda w wybranej strefie, z indeksem UV, oraz ostrzeżenia AEMET, które jej dotyczą. Do tego rada na dziś: czego brakuje jeszcze w tygodniu i, przy silnym słońcu, w jakich godzinach szukać cienia."},
    "guiaCuIslaP": {"es": "El GR 131, de La Esperanza a Arona. Cada kilómetro que anote a pie —y en bici, si así lo elige— le hace avanzar por este mapa, de parada en parada.", "en": "The GR 131, from La Esperanza to Arona. Every kilometre you log on foot (and by bike, if you choose so) moves you along this map, from stop to stop.", "fr": "Le GR 131, de La Esperanza à Arona. Chaque kilomètre noté à pied (et à vélo, si vous le choisissez) vous fait avancer sur cette carte, d’étape en étape.", "de": "Der GR 131 von La Esperanza nach Arona. Jeder Kilometer, den Sie zu Fuß eintragen (und mit dem Rad, wenn Sie es so wählen), bringt Sie auf dieser Karte voran, von Station zu Station.", "it": "Il GR 131, da La Esperanza ad Arona. Ogni chilometro annotato a piedi (e in bici, se lo sceglie) La fa avanzare su questa mappa, di tappa in tappa.", "nl": "De GR 131, van La Esperanza naar Arona. Elke kilometer die u te voet noteert (en op de fiets, als u daarvoor kiest) brengt u verder op deze kaart, van halte tot halte.", "zh": "GR 131 步道，从 La Esperanza 到 Arona。您记录的每一公里步行（如果您选择，也包括骑车）都会让您在这张地图上前进，一站接一站。", "zht": "GR 131 步道，從 La Esperanza 到 Arona。您記錄的每一公里步行（如果您選擇，也包括騎車）都會讓您在這張地圖上前進，一站接一站。", "bg": "GR 131, от La Esperanza до Arona. Всеки километър, който запишете пеша (и с колело, ако изберете така), ви придвижва по тази карта, от спирка до спирка.", "pl": "Szlak GR 131, z La Esperanza do Arony. Każdy kilometr zapisany pieszo (i na rowerze, jeśli tak się wybierze) przesuwa po tej mapie, od przystanku do przystanku."},
    "guiaCuCompP": {"es": "Elija quién recorre el mapa con sus kilómetros: un senderista, un presa canario o un lagarto tizón. Y si cuenta la bici, podrá elegir la suya.", "en": "Choose who travels the map with your kilometres: a hiker, a Presa Canario or a Tenerife lizard. And if you count the bike, you can choose yours.", "fr": "Choisissez qui parcourt la carte avec vos kilomètres : un randonneur, un Presa Canario ou un lézard de Tenerife. Et si vous comptez le vélo, vous pourrez choisir le vôtre.", "de": "Wählen Sie, wer mit Ihren Kilometern über die Karte zieht: ein Wanderer, ein Presa Canario oder eine Teneriffa-Eidechse. Und wenn das Rad mitzählt, können Sie Ihres auswählen.", "it": "Scelga chi percorre la mappa con i Suoi chilometri: un escursionista, un Presa Canario o una lucertola di Tenerife. E se conta la bici, potrà scegliere la Sua.", "nl": "Kies wie er met uw kilometers over de kaart trekt: een wandelaar, een Presa Canario of een Tenerifehagedis. En telt de fiets mee, dan kunt u de uwe kiezen.", "zh": "选择谁带着您的公里数走过地图：徒步者、普雷萨加纳利犬或特内里费蜥蜴。如果骑车也计入，还可以选择您的自行车。", "zht": "選擇誰帶著您的公里數走過地圖：健行者、普雷薩加納利犬或特內里費蜥蜴。如果騎車也計入，還可以選擇您的自行車。", "bg": "Изберете кой да измине картата с вашите километри: турист, преса канарио или тенерифски гущер. А ако броите и колелото, ще можете да изберете вашето.", "pl": "Do wyboru jest kompan, który pokonuje mapę z zapisanymi kilometrami: turysta, presa canario albo jaszczurka teneryfska. A jeśli liczy się też rower, można wybrać własny."},
    "guiaCuSendP": {"es": "Los senderos de la guía, por zonas. Marque cada uno cuando lo haga, y a por el 100 %. Los puntos del mapa de arriba marcan dónde empiezan.", "en": "The guide’s trails, by area. Tick each one off when you hike it, and aim for 100%. The dots on the map above mark where they start.", "fr": "Les sentiers du guide, par zones. Cochez chacun quand vous le faites, et visez les 100 %. Les points sur la carte ci-dessus indiquent où ils commencent.", "de": "Die Wanderwege des Reiseführers, nach Gebieten. Haken Sie jeden ab, sobald Sie ihn gegangen sind, und holen Sie sich die 100 %. Die Punkte auf der Karte oben zeigen, wo sie beginnen.", "it": "I sentieri della guida, per zone. Segni ciascuno quando lo percorre, e punti al 100%. I pallini sulla mappa qui sopra indicano dove iniziano.", "nl": "De wandelpaden van de gids, per gebied. Vink elk pad af als u het loopt, en ga voor 100%. De stippen op de kaart hierboven geven aan waar ze beginnen.", "zh": "本指南的步道，按区域排列。走完一条就标记一条，向 100% 进发。上方地图上的圆点标出步道的起点。", "zht": "本指南的步道，按區域排列。走完一條就標記一條，向 100% 邁進。上方地圖上的圓點標出步道的起點。", "bg": "Пътеките от пътеводителя, по зони. Отбелязвайте всяка, когато я минете, и гонете 100 %. Точките на картата по-горе показват откъде започват.", "pl": "Szlaki z przewodnika, według stref. Każdy zaznacza się po przejściu, aż do 100%. Punkty na mapie powyżej pokazują, gdzie się zaczynają."},
    "guiaCuGruposP": {"es": "También puede anotar desde aquí. Cada grupo abre su hoja, con sus series de los últimos 7 días y sus ejercicios: cómo se hace cada uno y de qué fuentes sale.", "en": "You can also log from here. Each group opens its sheet, with its sets for the last 7 days and its exercises: how to do each one and which sources it comes from.", "fr": "Vous pouvez aussi noter depuis ici. Chaque groupe ouvre sa fiche, avec ses séries des 7 derniers jours et ses exercices : comment faire chacun et de quelles sources il provient.", "de": "Sie können auch von hier aus eintragen. Jede Gruppe öffnet ihr Blatt mit ihren Sätzen der letzten 7 Tage und ihren Übungen: wie jede ausgeführt wird und aus welchen Quellen sie stammt.", "it": "Può annotare anche da qui. Ogni gruppo apre la sua scheda, con le serie degli ultimi 7 giorni e i suoi esercizi: come si esegue ciascuno e da quali fonti proviene.", "nl": "U kunt ook vanaf hier noteren. Elke groep opent zijn blad, met de sets van de afgelopen 7 dagen en de oefeningen: hoe u elke oefening doet en uit welke bronnen ze komt.", "zh": "也可以从这里记录。每个肌群都会打开自己的页面，里面有过去 7 天的组数和对应的练习：每个动作怎么做、出自哪些来源。", "zht": "也可以從這裡記錄。每個肌群都會開啟自己的頁面，裡面有過去 7 天的組數和對應的練習：每個動作怎麼做、出自哪些來源。", "bg": "Можете да записвате и оттук. Всяка група отваря своя лист със сериите от последните 7 дни и упражненията си: как се прави всяко и от кои източници е.", "pl": "Zapisywać można także stąd. Każda grupa otwiera swoją kartę z seriami z ostatnich 7 dni i ćwiczeniami: jak wykonać każde i z jakich źródeł pochodzi."},
    "guiaCuSellosP": {"es": "Se consiguen una vez y se quedan, con su fecha: el primer paso, la semana de fuerza, el sol entero, las etapas del GR 131…", "en": "You earn them once and they stay, with their date: the first step, the strength week, the full sun, the stages of the GR 131…", "fr": "Ils se gagnent une fois et ils restent, avec leur date : le premier pas, la semaine de renforcement, le soleil entier, les étapes du GR 131…", "de": "Man verdient sie einmal, und sie bleiben, mit Datum: der erste Schritt, die Kraftwoche, die volle Sonne, die Etappen des GR 131 …", "it": "Si ottengono una volta e restano, con la data: il primo passo, la settimana di forza, il sole pieno, le tappe del GR 131…", "nl": "U verdient ze één keer en ze blijven staan, met hun datum: de eerste stap, de krachtweek, de volle zon, de etappes van de GR 131…", "zh": "每枚印章只需获得一次就会一直保留，并注明日期：第一步、力量训练周、满日、GR 131 的各段行程……", "zht": "每枚印章只需獲得一次就會一直保留，並註明日期：第一步、肌力訓練週、滿日、GR 131 的各段行程……", "bg": "Печелят се веднъж и остават, с датата си: първата крачка, седмицата със силови упражнения, пълното слънце, етапите на GR 131…", "pl": "Zdobywa się je raz i zostają, z datą: pierwszy krok, tydzień siły, pełne słońce, etapy GR 131…"},
    "guiaCuPostalP": {"es": "Su semana en una imagen: su personaje ante el Teide, con sus días de fuerza, sus minutos y sus kilómetros. Para guardarla o enviarla.", "en": "Your week in one picture: your character in front of Mount Teide, with your strength days, minutes and kilometres. To save or send.", "fr": "Votre semaine en une image : votre personnage devant le Teide, avec vos jours de force, vos minutes et vos kilomètres. À garder ou à envoyer.", "de": "Ihre Woche in einem Bild: Ihre Figur vor dem Teide, mit Ihren Krafttagen, Minuten und Kilometern. Zum Speichern oder Verschicken.", "it": "La Sua settimana in un’immagine: il Suo personaggio davanti al Teide, con i giorni di forza, i minuti e i chilometri. Da salvare o inviare.", "nl": "Uw week in één beeld: uw personage voor de Teide, met uw krachtdagen, minuten en kilometers. Om te bewaren of te versturen.", "zh": "把您的一周做成一张图片：您的人物站在泰德峰前，附上力量训练天数、分钟数和公里数。可以保存或分享。", "zht": "把您的一週做成一張圖片：您的人物站在泰德峰前，附上肌力訓練天數、分鐘數和公里數。可以儲存或分享。", "bg": "Вашата седмица в една снимка: героят ви пред Тейде, с дните сила, минутите и километрите ви. За да я запазите или изпратите.", "pl": "Tydzień na jednym obrazku: postać przed Teide, z dniami siły, minutami i kilometrami. Do zapisania lub wysłania."},
    "guiaCuPrivadoT": {"es": "Se queda en su dispositivo", "en": "It stays on your device", "fr": "Tout reste sur votre appareil", "de": "Alles bleibt auf Ihrem Gerät", "it": "Resta sul Suo dispositivo", "nl": "Het blijft op uw apparaat", "zh": "只保存在您的设备上", "zht": "只儲存在您的裝置上", "bg": "Остава на вашето устройство", "pl": "Zostaje na urządzeniu"},
    "guiaCuPrivadoP": {"es": "Las series, el movimiento y la comida que anota en «Su cuerpo» se guardan solo en este dispositivo: no se suben a ninguna parte. Y el botón de borrar lo quita todo.", "en": "The sets, movement and food you log in “Your body” are saved on this device only: nothing is uploaded. And the delete button removes it all.", "fr": "Les séries, le mouvement et les repas que vous notez dans « Votre corps » sont enregistrés uniquement sur cet appareil : rien n’est envoyé. Et le bouton d’effacement supprime tout.", "de": "Die Sätze, die Bewegung und das Essen, die Sie in „Ihr Körper“ eintragen, werden nur auf diesem Gerät gespeichert: Nichts wird hochgeladen. Und die Schaltfläche zum Löschen entfernt alles.", "it": "Le serie, il movimento e il cibo che annota in «Corpo» vengono salvati solo su questo dispositivo: non viene caricato niente. E il pulsante per eliminare toglie tutto.", "nl": "De sets, de beweging en het eten die u in “Uw lichaam” noteert, worden alleen op dit apparaat opgeslagen: er wordt niets geüpload. En de wisknop verwijdert alles.", "zh": "您在“我的身体”里记录的组数、运动和饮食只保存在本设备上，不会上传。删除按钮会把它们全部清除。", "zht": "您在「我的身體」裡記錄的組數、運動和飲食只儲存在此裝置上，不會上傳。刪除按鈕會把它們全部清除。", "bg": "Сериите, движението и храната, които записвате във „Вашето тяло“, се пазят само на това устройство: нищо не се качва. А бутонът за изтриване премахва всичко.", "pl": "Serie, ruch i jedzenie zapisywane w sekcji „Ciało” zostają tylko na tym urządzeniu: nic nie jest wysyłane. A przycisk usuwania kasuje wszystko."},
    "guiaCuArribaT": {"es": "Día, Noche y las cifras", "en": "Day, Night and the figures", "fr": "Jour, Nuit et les chiffres", "de": "Tag, Nacht und die Zahlen", "it": "Giorno, Notte e le cifre", "nl": "Dag, nacht en de cijfers", "zh": "日间、夜间与数字来源", "zht": "日間、夜間與數字來源", "bg": "Ден, Нощ и цифрите", "pl": "Dzień, Noc i liczby"},
    "guiaCuArribaP": {"es": "Arriba hay dos botones: uno cambia entre el tema Día y el tema Noche; el otro, la «i», explica de dónde sale cada cifra, con sus fuentes.", "en": "There are two buttons up here: one switches between the Day theme and the Night theme; the other, the “i”, explains where each figure comes from, with its sources.", "fr": "Il y a deux boutons en haut : l’un bascule entre le thème Jour et le thème Nuit ; l’autre, le « i », explique d’où vient chaque chiffre, avec ses sources.", "de": "Oben gibt es zwei Schaltflächen: Die eine wechselt zwischen Tag- und Nachtthema; die andere, das „i“, erklärt, woher jede Zahl kommt, mit ihren Quellen.", "it": "In alto ci sono due pulsanti: uno passa dal tema Giorno al tema Notte e viceversa; l’altro, la «i», spiega da dove viene ogni cifra, con le fonti.", "nl": "Bovenaan staan twee knoppen: de ene wisselt tussen het dagthema en het nachtthema; de andere, de “i”, legt uit waar elk cijfer vandaan komt, met de bronnen.", "zh": "上方有两个按钮：一个在日间模式和夜间模式之间切换；另一个“i”说明每个数字的来源和出处。", "zht": "上方有兩個按鈕：一個在日間模式和夜間模式之間切換；另一個「i」說明每個數字的來源和出處。", "bg": "Горе има два бутона: единият превключва между тема „Ден“ и тема „Нощ“; другият, „i“, обяснява откъде идва всяка цифра, с източниците ѝ.", "pl": "U góry są dwa przyciski: jeden przełącza między motywem Dzień i motywem Noc; drugi, „i”, wyjaśnia, skąd pochodzi każda liczba, wraz ze źródłami."},
    "guiaCuAspectoP": {"es": "Haga el personaje a su imagen: la silueta, la piel, el peinado, la ropa, las gafas… o pruebe «{azar}». Solo cambia el dibujo.", "en": "Make the character look like you: silhouette, skin tone, hairstyle, clothes, glasses… or try “{azar}”. Only the drawing changes.", "fr": "Faites le personnage à votre image : la silhouette, le teint, la coiffure, les vêtements, les lunettes… ou essayez « {azar} ». Seul le dessin change.", "de": "Gestalten Sie die Figur nach Ihrem Bild: Silhouette, Hautton, Frisur, Kleidung, Brille … oder probieren Sie „{azar}“. Nur die Zeichnung ändert sich.", "it": "Crei il personaggio a Sua immagine: la silhouette, la carnagione, l’acconciatura, l’abbigliamento, gli occhiali… oppure provi «{azar}». Cambia solo il disegno.", "nl": "Maak het personage naar uw evenbeeld: silhouet, huidskleur, kapsel, kleding, bril… of probeer “{azar}”. Alleen de tekening verandert.", "zh": "把人物做成您的样子：体型轮廓、肤色、发型、衣着、眼镜……或者试试“{azar}”。改变的只是图像。", "zht": "把人物做成您的樣子：體型輪廓、膚色、髮型、衣著、眼鏡……或者試試「{azar}」。改變的只是圖像。", "bg": "Направете героя по свой образ: силуета, тена на кожата, прическата, облеклото, очилата… или опитайте „{azar}“. Променя се само рисунката.", "pl": "Postać można upodobnić do siebie: sylwetka, odcień skóry, fryzura, ubranie, okulary… albo wypróbować „{azar}”. Zmienia się tylko rysunek."},
    "guiaCuComidaP": {"es": "Un diario por raciones, como las cuenta la AESAN. No cuenta calorías ni le pone objetivos. Y empieza apagado: solo se anota si usted lo enciende.", "en": "A diary in servings, the way AESAN counts them. It does not count calories or set targets. And it starts switched off: nothing is logged unless you turn it on.", "fr": "Un journal en portions, comme les compte l’AESAN. Il ne compte pas les calories et ne fixe pas d’objectifs. Et il est éteint au départ : rien n’est noté tant que vous ne l’activez pas.", "de": "Ein Tagebuch in Portionen, so wie die AESAN sie zählt. Es zählt keine Kalorien und setzt keine Ziele. Und es ist zunächst ausgeschaltet: Notiert wird nur, wenn Sie es einschalten.", "it": "Un diario a porzioni, come le conta l’AESAN. Non conta le calorie né Le impone obiettivi. E parte spento: si annota solo se Lei lo attiva.", "nl": "Een dagboek in porties, zoals het AESAN ze telt. Het telt geen calorieën en stelt geen doelen. En het staat eerst uit: er wordt alleen genoteerd als u het aanzet.", "zh": "按份记录的饮食日记，计份方式与 AESAN 相同。它不计算热量，也不设目标。而且默认关闭：只有您开启后才会记录。", "zht": "按份記錄的飲食日記，計份方式與 AESAN 相同。它不計算熱量，也不設目標。而且預設關閉：只有您開啟後才會記錄。", "bg": "Дневник по порции, както ги брои AESAN. Не брои калории и не ви поставя цели. И започва изключен: записва се само ако вие го включите.", "pl": "Dziennik w porcjach, tak jak liczy je AESAN. Nie liczy kalorii i nie wyznacza celów. Na początku jest wyłączony: zapisuje się dopiero po jego włączeniu."},
    "guiaCuEvolucionP": {"es": "Aquí están sus datos del perfil (altura, peso y año de nacimiento) y su evolución. Lo que cambie aquí se guarda igual que en el perfil, y en su cuenta solo si lo tiene activado.", "en": "Here are your profile details (height, weight and year of birth) and your progress. Anything you change here is saved just as in the profile, and to your account only if you have turned that on.", "fr": "Voici vos données du profil (taille, poids et année de naissance) et votre évolution. Ce que vous modifiez ici est enregistré comme dans le profil, et dans votre compte uniquement si vous l’avez activé.", "de": "Hier stehen Ihre Profildaten (Größe, Gewicht und Geburtsjahr) und Ihr Verlauf. Was Sie hier ändern, wird wie im Profil gespeichert, und in Ihrem Konto nur, wenn Sie das eingeschaltet haben.", "it": "Qui ci sono i Suoi dati del profilo (altezza, peso e anno di nascita) e i Suoi progressi. Ciò che modifica qui viene salvato come nel profilo, e nel Suo account solo se l’ha attivato.", "nl": "Hier staan uw profielgegevens (lengte, gewicht en geboortejaar) en uw voortgang. Wat u hier wijzigt, wordt net als in het profiel bewaard, en in uw account alleen als u dat hebt aangezet.", "zh": "这里有您的个人资料数据（身高、体重和出生年份）和您的进展。在这里更改的内容会和在个人资料中一样保存，只有在您开启该选项后才会同时保存到您的账户。", "zht": "這裡有您的個人檔案資料（身高、體重和出生年份）和您的進展。在這裡變更的內容會和在個人檔案中一樣儲存，只有在您開啟該選項後才會同時儲存到您的帳戶。", "bg": "Тук са данните от профила ви (ръст, тегло и година на раждане) и напредъкът ви. Каквото промените тук, се запазва както в профила, а в акаунта ви – само ако сте включили тази възможност.", "pl": "Tu są dane z profilu (wzrost, waga i rok urodzenia) oraz postępy. Zmiany wprowadzone tutaj są zapisywane tak samo jak w profilu, a na koncie – tylko jeśli ta opcja jest włączona."},
    "guiaCuPreguntarP": {"es": "Sobre entrenar, comer, descansar y hacer deporte en Tenerife. Las respuestas están escritas de antemano, con sus fuentes, y se buscan en su móvil: lo que escribe no se envía a ningún sitio.", "en": "About training, eating, resting and doing sport in Tenerife. The answers are written in advance, with their sources, and are looked up on your phone: what you type is not sent anywhere.", "fr": "Sur l’entraînement, l’alimentation, le repos et le sport à Tenerife. Les réponses sont rédigées à l’avance, avec leurs sources, et sont cherchées sur votre téléphone : ce que vous écrivez ne quitte pas l’appareil.", "de": "Zu Training, Ernährung, Erholung und Sport auf Teneriffa. Die Antworten sind vorab verfasst, mit Quellen, und werden auf Ihrem Handy gesucht: Was Sie schreiben, wird nirgendwohin gesendet.", "it": "Su allenamento, alimentazione, riposo e sport a Tenerife. Le risposte sono scritte in anticipo, con le fonti, e si cercano sul Suo telefono: quello che scrive non viene inviato da nessuna parte.", "nl": "Over trainen, eten, rusten en sporten op Tenerife. De antwoorden zijn vooraf geschreven, met bronnen, en worden op uw telefoon opgezocht: wat u typt, wordt nergens naartoe gestuurd.", "zh": "关于训练、饮食、休息和在特内里费运动。回答都是提前写好的，附有来源，并在您的手机上查找：您输入的内容不会发送到任何地方。", "zht": "關於訓練、飲食、休息和在特內里費運動。回答都是事先寫好的，附有來源，並在您的手機上查找：您輸入的內容不會傳送到任何地方。", "bg": "За тренировки, хранене, почивка и спорт на Тенерифе. Отговорите са написани предварително, с източниците си, и се търсят на телефона ви: написаното не се изпраща никъде.", "pl": "O treningu, jedzeniu, odpoczynku i sporcie na Teneryfie. Odpowiedzi są napisane wcześniej, ze źródłami, i wyszukiwane w telefonie: wpisany tekst nie jest nigdzie wysyłany."},
    "guiaCuFinT": {"es": "¡A moverse!", "en": "Time to get moving!", "fr": "À vous de bouger !", "de": "Auf geht’s, in Bewegung!", "it": "E ora, in movimento!", "nl": "En nu in beweging!", "zh": "动起来吧！", "zht": "動起來吧！", "bg": "Хайде на движение!", "pl": "Czas się ruszyć!"},
    "guiaCuFinP": {"es": "Empiece por lo fácil: toque un músculo y anote lo que haga hoy. Este tour está siempre aquí, en el botón con mi cara, junto a su personaje.", "en": "Start with the easy part: tap a muscle and log what you do today. This tour is always here, on the button with my face, next to your character.", "fr": "Commencez par le plus simple : touchez un muscle et notez ce que vous faites aujourd’hui. Ce tour se trouve toujours ici, sur le bouton à mon effigie, à côté de votre personnage.", "de": "Fangen Sie mit dem Einfachen an: Tippen Sie auf einen Muskel und tragen Sie ein, was Sie heute tun. Diese Tour finden Sie immer hier, auf dem Knopf mit meinem Gesicht, neben Ihrer Figur.", "it": "Cominci dal facile: tocchi un muscolo e annoti quello che fa oggi. Questo tour è sempre qui, nel pulsante con la mia faccia, accanto al Suo personaggio.", "nl": "Begin met het makkelijke: tik op een spier en noteer wat u vandaag doet. Deze tour staat altijd hier, op de knop met mijn gezicht, naast uw personage.", "zh": "从最简单的开始：点一块肌肉，记下您今天做的运动。这个导览一直在这里，就在人物旁边带有我头像的按钮里。", "zht": "從最簡單的開始：點一塊肌肉，記下您今天做的運動。這個導覽一直在這裡，就在人物旁邊帶有我頭像的按鈕裡。", "bg": "Започнете с лесното: докоснете мускул и запишете какво правите днес. Тази обиколка е винаги тук, в бутона с моето лице, до вашия герой.", "pl": "Najlepiej zacząć od najprostszego: dotknąć mięśnia i zapisać to, co robi się dziś. Ten przewodnik jest zawsze tutaj, pod przyciskiem z moją twarzą, obok postaci."},
    "tourDadoC": {"es": "Yo lo tiro cuando no sé qué hacer. O sea, casi siempre.", "en": "I roll it whenever I can’t decide. Which is most of the time.", "fr": "Moi, je le lance quand je n’arrive pas à choisir. Autant dire presque toujours.", "de": "Ich würfle, wenn ich mich nicht entscheiden kann. Also fast immer.", "it": "Io lo tiro quando non so decidermi. Cioè quasi sempre.", "nl": "Ik gooi hem als ik niet kan kiezen. Bijna altijd dus.", "zh": "我拿不定主意时就掷一下。也就是说，几乎每次都掷。", "zht": "我拿不定主意時就擲一下。也就是說，幾乎每次都擲。", "bg": "Аз го хвърлям, когато не мога да реша. Тоест почти винаги.", "pl": "Ja rzucam, kiedy nie mogę się zdecydować. Czyli prawie zawsze."},
    "tourMicroC": {"es": "Por eso salgo de casa con bañador y chaqueta.", "en": "That’s why I leave home with swimming trunks and a jacket.", "fr": "C’est pour ça que je sors avec un maillot de bain et une veste.", "de": "Deshalb gehe ich mit Badehose und Jacke aus dem Haus.", "it": "Per questo esco di casa con costume e giacca.", "nl": "Daarom ga ik de deur uit met een zwembroek én een jas.", "zh": "所以我出门总是带着泳裤和外套。", "zht": "所以我出門總是帶著泳褲和外套。", "bg": "Затова излизам от къщи с бански и яке.", "pl": "Dlatego wychodzę z domu z kąpielówkami i kurtką."},
    "tourFiestasC": {"es": "Si viene en Carnaval, traiga disfraz. Dormir, ya dormirá en el avión.", "en": "If you come for Carnival, bring a costume. You can sleep on the plane.", "fr": "Si vous venez pour le Carnaval, apportez un déguisement. Vous dormirez dans l’avion.", "de": "Wenn Sie zum Karneval kommen, bringen Sie ein Kostüm mit. Schlafen können Sie im Flugzeug.", "it": "Se viene per il Carnevale, porti un costume. Dormirà in aereo.", "nl": "Komt u met carnaval? Neem een kostuum mee. Slapen doet u wel in het vliegtuig.", "zh": "要是赶上狂欢节，请带上一套装扮。觉嘛，回程飞机上再睡。", "zht": "要是趕上狂歡節，請帶上一套裝扮。覺嘛，回程飛機上再睡。", "bg": "Ако дойдете за Карнавала, носете костюм. Ще се наспите в самолета.", "pl": "Na Karnawał przyda się przebranie. Wyspać się można w samolocie."},
    "tourCieloC": {"es": "Con este gorro parezco minero, pero es para ver estrellas.", "en": "In this hat I look like a miner, but it’s for stargazing.", "fr": "Avec ce bonnet, j’ai l’air d’un mineur, mais c’est pour regarder les étoiles.", "de": "Mit dieser Mütze sehe ich aus wie ein Bergmann, aber sie ist zum Sternegucken.", "it": "Con questo berretto sembro un minatore, ma serve per guardare le stelle.", "nl": "Met deze muts lijk ik wel een mijnwerker, maar hij is om sterren te kijken.", "zh": "戴着这顶帽子，我像个矿工，其实是为了看星星。", "zht": "戴著這頂帽子，我像個礦工，其實是為了看星星。", "bg": "С тази шапка приличам на миньор, но тя е за гледане на звезди.", "pl": "W tej czapce wyglądam jak górnik, ale to do oglądania gwiazd."},
    "tourGuaguasC": {"es": "Aquí al autobús se le dice «guagua». Dígalo y ya parecerá de la isla.", "en": "Here a bus is called a “guagua”. Say it and you’ll sound like a local.", "fr": "Ici, le bus s’appelle une « guagua ». Dites-le et on vous croira de l’île.", "de": "Hier heißt der Bus „Guagua“. Sagen Sie es, und Sie klingen schon wie von hier.", "it": "Qui l’autobus si chiama «guagua». Lo dica e sembrerà già dell’isola.", "nl": "Hier heet de bus een “guagua”. Zeg het en u klinkt al als een eilander.", "zh": "这里把公交车叫作“guagua”。说出这个词，您就像本地人了。", "zht": "這裡把公車叫作「guagua」。說出這個詞，您就像本地人了。", "bg": "Тук на автобуса му казват „guagua“. Кажете го и ще звучите като местен.", "pl": "Autobus nazywa się tu „guagua”. Wystarczy to powiedzieć, żeby brzmieć jak miejscowy."},
    "tourAsistenteC": {"es": "Sabe de la isla casi tanto como yo. Casi.", "en": "It knows the island almost as well as I do. Almost.", "fr": "Il connaît l’île presque aussi bien que moi. Presque.", "de": "Er kennt die Insel fast so gut wie ich. Fast.", "it": "Conosce l’isola quasi quanto me. Quasi.", "nl": "Hij kent het eiland bijna zo goed als ik. Bijna.", "zh": "它对这座岛的了解几乎和我一样多。几乎。", "zht": "它對這座島的了解幾乎和我一樣多。幾乎。", "bg": "Познава острова почти колкото мен. Почти.", "pl": "Zna wyspę prawie tak dobrze jak ja. Prawie."},
    "tourIdiomaC": {"es": "Yo, con las manos, me hago entender en todos.", "en": "Me? With my hands I get by in all of them.", "fr": "Moi, avec les mains, je me fais comprendre dans toutes.", "de": "Ich mache mich mit den Händen in allen verständlich.", "it": "Io, con le mani, mi faccio capire in tutte.", "nl": "Met mijn handen maak ik me in alle talen verstaanbaar.", "zh": "我嘛，靠比划，哪种语言都能让人明白。", "zht": "我嘛，靠比劃，哪種語言都能讓人明白。", "bg": "Аз с ръце се разбирам на всичките.", "pl": "Ja rękami dogadam się w każdym."},
    "guiaCiPlanetasC": {"es": "Saturno presume de anillos. Yo, de gafas.", "en": "Saturn shows off its rings. I show off my glasses.", "fr": "Saturne frime avec ses anneaux. Moi, avec mes lunettes.", "de": "Saturn gibt mit seinen Ringen an. Ich mit meiner Brille.", "it": "Saturno si vanta degli anelli. Io, degli occhiali.", "nl": "Saturnus pronkt met zijn ringen. Ik met mijn bril.", "zh": "土星炫耀它的光环，我炫耀我的眼镜。", "zht": "土星炫耀它的光環，我炫耀我的眼鏡。", "bg": "Сатурн се фука с пръстените си. Аз – с очилата.", "pl": "Saturn chwali się pierścieniami. Ja – okularami."},
    "guiaCiCartaC": {"es": "Ojalá los lunes tuvieran este botón.", "en": "If only Mondays had this button.", "fr": "Si seulement les lundis avaient ce bouton.", "de": "Wenn Montage nur diesen Knopf hätten.", "it": "Magari i lunedì avessero questo pulsante.", "nl": "Had de maandag maar zo’n knop.", "zh": "要是星期一也有这个按钮就好了。", "zht": "要是星期一也有這個按鈕就好了。", "bg": "Де да имаха и понеделниците такъв бутон.", "pl": "Gdyby tylko poniedziałki miały taki przycisk."},
    "guiaCiApunteC": {"es": "Con la farola de mi calle no funciona. Ya lo he probado.", "en": "It doesn’t work on the street lamp outside my house. I’ve tried.", "fr": "Avec le lampadaire de ma rue, ça ne marche pas. J’ai essayé.", "de": "Mit der Laterne in meiner Straße klappt es nicht. Ich habe es probiert.", "it": "Con il lampione della mia via non funziona. Ho già provato.", "nl": "Met de lantaarnpaal in mijn straat werkt het niet. Ik heb het geprobeerd.", "zh": "对着我家门口的路灯可不管用，我试过了。", "zht": "對著我家門口的路燈可不管用，我試過了。", "bg": "С уличната лампа пред нас не става. Пробвах.", "pl": "Z latarnią na mojej ulicy to nie działa. Sprawdziłem."},
    "guiaCiFinC": {"es": "Se lo digo yo, que subí en camiseta.", "en": "Take it from me: I went up in a T-shirt.", "fr": "Croyez-moi : j’y suis monté en tee-shirt.", "de": "Glauben Sie mir: Ich war im T-Shirt oben.", "it": "Glielo dico io, che sono salito in maglietta.", "nl": "Geloof mij maar: ik ging in een T-shirt naar boven.", "zh": "这可是经验之谈：我上次只穿了件T恤就上去了。", "zht": "這可是經驗之談：我上次只穿了件T恤就上去了。", "bg": "Казвам ви го от опит: качих се по тениска.", "pl": "Wiem, co mówię: wjechałem tam w samej koszulce."},
    "guiaCuLeyendaC": {"es": "Los míos siguen casi todos en rosa. Que quede entre nosotros.", "en": "Mine are still mostly pink. Let’s keep that between us.", "fr": "Les miens sont encore presque tous en rose. Que ça reste entre nous.", "de": "Meine sind noch fast alle rosa. Das bleibt aber unter uns.", "it": "I miei sono ancora quasi tutti rosa. Resti tra noi.", "nl": "De mijne zijn nog bijna allemaal roze. Dat blijft onder ons.", "zh": "我的大多还停留在粉色。这事咱们别外传。", "zht": "我的大多還停留在粉色。這事咱們別外傳。", "bg": "Моите още са почти всички в розово. Да си остане между нас.", "pl": "Moje wciąż są prawie wszystkie różowe. Niech to zostanie między nami."},
    "guiaCuMovC": {"es": "Correr detrás de la guagua también cuenta.", "en": "Running for the bus counts too.", "fr": "Courir après le bus, ça compte aussi.", "de": "Dem Bus hinterherrennen zählt auch.", "it": "Anche correre dietro all’autobus conta.", "nl": "Achter de bus aan rennen telt ook.", "zh": "追公交车也算跑步。", "zht": "追公車也算跑步。", "bg": "Тичането след автобуса също се брои.", "pl": "Bieg za autobusem też się liczy."},
    "guiaCuCompC": {"es": "Yo voy con el lagarto. Es el único que me espera.", "en": "I go with the lizard. He’s the only one who waits for me.", "fr": "Moi, je prends le lézard. C’est le seul qui m’attend.", "de": "Ich nehme die Eidechse. Sie ist die Einzige, die auf mich wartet.", "it": "Io vado con la lucertola. È l’unica che mi aspetta.", "nl": "Ik ga met de hagedis. Die is de enige die op me wacht.", "zh": "我选蜥蜴。只有它肯等我。", "zht": "我選蜥蜴。只有牠肯等我。", "bg": "Аз вървя с гущера. Само той ме изчаква.", "pl": "Ja idę z jaszczurką. Tylko ona na mnie czeka."},
    "guiaCuPostalC": {"es": "Presumir un poco también es deporte.", "en": "A little showing off is a sport too.", "fr": "Frimer un peu, c’est aussi du sport.", "de": "Ein bisschen angeben ist auch Sport.", "it": "Anche vantarsi un po’ è uno sport.", "nl": "Een beetje opscheppen is ook sport.", "zh": "稍微炫耀一下，也算一项运动。", "zht": "稍微炫耀一下，也算一項運動。", "bg": "Малко фукане също е спорт.", "pl": "Trochę się pochwalić to też sport."},
    "guiaCuFinC": {"es": "Yo le espero aquí. Lo mío es señalar.", "en": "I’ll wait for you here. Pointing is my thing.", "fr": "Je vous attends ici. Mon truc à moi, c’est de montrer.", "de": "Ich warte hier auf Sie. Zeigen ist mein Ding.", "it": "Io La aspetto qui. Il mio forte è indicare.", "nl": "Ik wacht hier op u. Aanwijzen is mijn ding.", "zh": "我在这儿等您。我的强项是指路。", "zht": "我在這兒等您。我的強項是指路。", "bg": "Аз ви чакам тук. Моята сила е да соча.", "pl": "Ja tu poczekam. Moja specjalność to pokazywanie."}
  };
  try { Object.assign(UI_TX, GUIA_UI); } catch (e) {}

  /* ───────────────────────── estilos ─────────────────────────
     Van con el modulo: lo que no se pide al arrancar no pesa en index.html.
     Los nombres v19t-* son los del tour de antes, que es lo que buscan las
     herramientas de tools/; lo nuevo es tgg-*. */
  var CSS = [
'#v19-tour { position: fixed; inset: 0; z-index: 8600; display: none; font-family: "DM Sans", system-ui, sans-serif; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }',
'#v19-tour.open { display: block; }',
'.v19t-hole { position: absolute; border-radius: 16px; pointer-events: none;',
'  box-shadow: 0 0 0 200vmax rgba(6,9,15,0.82), 0 0 0 2px rgba(212,175,55,0.95), 0 0 24px rgba(212,175,55,0.5);',
'  transition: top .4s cubic-bezier(.3,.9,.3,1), left .4s cubic-bezier(.3,.9,.3,1), width .4s cubic-bezier(.3,.9,.3,1), height .4s cubic-bezier(.3,.9,.3,1), border-radius .4s; }',
'.v19t-hole.none { box-shadow: 0 0 0 200vmax rgba(6,9,15,0.82); width: 0; height: 0; left: 50%; top: 40%; }',
'.v19t-hole::after { content: ""; position: absolute; inset: -5px; border-radius: inherit; border: 2px solid rgba(245,199,107,0.9); animation: v19tLatido 1.7s ease-out infinite; }',
'.v19t-hole.none::after { display: none; }',
'.v19t-hole.tgg-llega::after { animation: tggLlega .55s ease-out 1, v19tLatido 1.7s ease-out .55s infinite; }',
'@keyframes v19tLatido { 0% { transform: scale(0.97); opacity: 0.95; } 70% { transform: scale(1.12); opacity: 0; } 100% { transform: scale(1.12); opacity: 0; } }',
'@keyframes tggLlega { 0% { transform: scale(1.35); opacity: 0; } 55% { transform: scale(0.96); opacity: 1; } 100% { transform: scale(1); opacity: 0.95; } }',

/* la estela del dedo al foco */
'.tgg-estela { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }',
'.tgg-rastro { fill: none; stroke: #F5C76B; stroke-width: 2.6; stroke-linecap: round; stroke-dasharray: 0.1 9; opacity: 0; filter: drop-shadow(0 0 4px rgba(245,199,107,0.9)); }',
'.tgg-rastro.ve { opacity: 0.95; animation: tggFluye 0.9s linear infinite; }',
'@keyframes tggFluye { to { stroke-dashoffset: -9.1; } }',
'.tgg-chispa { opacity: 0; fill: #fff3c4; filter: drop-shadow(0 0 5px rgba(245,199,107,1)); transform-box: fill-box; transform-origin: center; }',
'.tgg-chispa.ve { opacity: 1; animation: tggChispa 1.3s ease-in-out infinite; }',
'@keyframes tggChispa { 0%, 100% { transform: scale(0.75) rotate(0deg); } 50% { transform: scale(1.2) rotate(45deg); } }',

/* la unidad: Jérôme y, debajo, su bocadillo */
'.tgg-unidad { --tgg-jw: 124px; position: absolute; left: 0; top: 0; width: min(92vw, 372px); transition: transform .46s cubic-bezier(.25,.9,.3,1); will-change: transform; }',
'.tgg-unidad.estatica { position: relative; transform: none !important; }',
'.tgg-unidad .tgg-jero { position: absolute; left: 50%; top: 0; z-index: 2; width: var(--tgg-jw); height: calc(var(--tgg-jw) * 1.15625); margin-left: calc(var(--tgg-jw) / -2); transition: width .4s cubic-bezier(.25,.9,.3,1), height .4s cubic-bezier(.25,.9,.3,1), margin-left .4s cubic-bezier(.25,.9,.3,1); }',
'.tgg-unidad.abajo .tgg-jero { top: auto; bottom: 0; }',
'.tgg-unidad.abajo .v19t-card { margin-top: 0; margin-bottom: calc(var(--tgg-jw) * 0.856); }',
/* cuando no cabe ni pequeño, Jérôme en miniatura, asomado a la esquina del bocadillo; y el bocadillo, apretado */
'.tgg-unidad.mini .tgg-jero, .tgg-unidad.mini.abajo .tgg-jero { left: 8px; margin-left: 0; top: 0; bottom: auto; }',
'.tgg-unidad.mini .v19t-card, .tgg-unidad.mini.abajo .v19t-card { margin-top: 20px; margin-bottom: 0; }',
'.tgg-unidad.mini .v19t-num { padding-left: 62px; }',
'.tgg-unidad.mini .tgg-barra { margin-left: 58px; }',
'.tgg-unidad.compacta .tgg-cap { display: none; }',
'.tgg-unidad.compacta .v19t-card { padding-bottom: 9px; }',
'.tgg-unidad.compacta .v19t-card h3 { font-size: 1.2rem; margin-bottom: 4px; }',
'.tgg-unidad.compacta .v19t-card p { font-size: 0.82rem; line-height: 1.42; margin-bottom: 9px; }',
'.tgg-unidad.compacta .tgg-barra { margin-bottom: 8px; }',
'.tgg-unidad.compacta .v19t-next { padding: 9px 20px; }',
'.tgg-jero.tgg-pop { animation: tggPop .36s cubic-bezier(0.2, 1.3, 0.4, 1) both; }',
'@keyframes tggPop { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: none; } }',
/* sin filtros de CSS: el resplandor va dentro del dibujo (.tgg-halo). Safari recorta lo que se
   sale de la caja de un elemento con filter, y los brazos se salen */
'.tgg-jero { pointer-events: none; }',
'.tgg-jero[data-escena="rojo"] .tgg-halo { opacity: 0; }',
/* la fiesta del ultimo paso: unos papelillos que salen de Jérôme */
'.tgg-fiesta { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; }',
'.tgg-fiesta i { position: absolute; left: -4px; top: -3px; width: 8px; height: 6px; border-radius: 1.5px; opacity: 0; animation: tggVuela 1.7s cubic-bezier(.15,.7,.3,1) forwards; }',
'.tgg-fiesta i.tgg-redondo { width: 6px; height: 6px; border-radius: 50%; }',
'@keyframes tggVuela { 0% { opacity: 1; transform: translate(0,0) rotate(0deg) scale(.5); } 72% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--giro)) scale(1); } }',
'.tgg-svg { display: block; width: 100%; height: 100%; overflow: visible; }',
'.tgg-esc { opacity: 0; transition: opacity .55s ease; }',
'.tgg-jero[data-escena="noche"] .tgg-esc-noche, .tgg-jero[data-escena="dia"] .tgg-esc-dia, .tgg-jero[data-escena="tarde"] .tgg-esc-tarde,',
'.tgg-jero[data-escena="cielo"] .tgg-esc-cielo, .tgg-jero[data-escena="rojo"] .tgg-esc-rojo, .tgg-jero[data-escena="fiesta"] .tgg-esc-fiesta { opacity: 1; }',
'.tgg-jero[data-escena="rojo"] .tgg-aro { stroke: #b3261e; }',
'.tgg-e0 { animation: tggTitila 2.6s ease-in-out infinite; } .tgg-e1 { animation: tggTitila 3.4s ease-in-out .7s infinite; } .tgg-e2 { animation: tggTitila 2.1s ease-in-out 1.3s infinite; }',
'@keyframes tggTitila { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }',
'.tgg-fugaz { opacity: 0; animation: tggFugaz 7s ease-in 2s infinite; }',
'@keyframes tggFugaz { 0% { opacity: 0; transform: translate(-16px,-7px); } 3% { opacity: 1; } 9% { opacity: 0; transform: translate(26px,11px); } 100% { opacity: 0; transform: translate(26px,11px); } }',
'.tgg-confeti .tgg-e0, .tgg-confeti .tgg-e1, .tgg-confeti .tgg-e2 { animation-name: tggConfeti; transform-box: fill-box; transform-origin: center; }',
'@keyframes tggConfeti { 0%, 100% { translate: 0 -3px; opacity: 1; } 50% { translate: 0 4px; opacity: 0.75; } }',
'.tgg-frontal-halo { animation: tggHalo 2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }',
'@keyframes tggHalo { 0%, 100% { transform: scale(0.9); opacity: 0.2; } 50% { transform: scale(1.12); opacity: 0.34; } }',
'.tgg-brillo { animation: tggBrillo 6s ease-in-out infinite; }',
/* lo que le sale a Jérôme segun el animo (data-fx): una cosa cada vez */
'.tgg-fx { display: none; transform-box: fill-box; transform-origin: center; }',
'.tgg-jero[data-fx="gota"] .tgg-fx-gota, .tgg-jero[data-fx="lagrima"] .tgg-fx-lagrima, .tgg-jero[data-fx="chispas"] .tgg-fx-chispas, .tgg-jero[data-fx="duda"] .tgg-fx-duda,',
'.tgg-jero[data-fx="vaho"] .tgg-fx-vaho, .tgg-jero[data-fx="notas"] .tgg-fx-notas, .tgg-jero[data-fx="corazon"] .tgg-fx-corazon { display: inline; }',
'.tgg-fx-gota { animation: tggGota 1.9s ease-in infinite; }',
'@keyframes tggGota { 0% { transform: translateY(-5px) scale(.6); opacity: 0; } 18% { opacity: 1; transform: translateY(-3px) scale(1); } 80% { opacity: 1; } 100% { transform: translateY(13px) scale(1); opacity: 0; } }',
'.tgg-fx-lagrima { animation: tggGota 1.5s ease-in infinite; }',
'.tgg-fx-chispas path { animation: tggDestello 1.3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }',
'.tgg-fx-chispas path:nth-child(2) { animation-delay: .35s; } .tgg-fx-chispas path:nth-child(3) { animation-delay: .7s; }',
'@keyframes tggDestello { 0%, 100% { opacity: .25; scale: .6; } 50% { opacity: 1; scale: 1.08; } }',
'.tgg-fx-duda { animation: tggDuda 1.8s ease-in-out infinite; }',
'@keyframes tggDuda { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(8deg) translateY(-3px); } }',
'.tgg-fx-vaho { animation: tggVaho 1.7s ease-out infinite; }',
'@keyframes tggVaho { 0% { transform: translate(-7px, 3px) scale(.6); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(15px, -9px) scale(1.25); opacity: 0; } }',
'.tgg-fx-notas g { animation: tggNota 1.5s ease-in-out infinite; } .tgg-fx-notas g + g { animation-delay: .5s; }',
'@keyframes tggNota { 0%, 100% { translate: 0 2px; opacity: .65; } 50% { translate: 0 -6px; opacity: 1; } }',
'.tgg-fx-corazon { animation: tggCorazon 1.2s ease-in-out infinite; }',
'@keyframes tggCorazon { 0%, 100% { transform: scale(.9); } 40% { transform: scale(1.14); } }',
'@keyframes tggBrillo { 0%, 86%, 100% { opacity: 0.5; } 92% { opacity: 0.95; } }',

/* el bocadillo */
'.v19t-card { position: relative; margin-top: calc(var(--tgg-jw) * 0.972); background: linear-gradient(180deg, #1d2535, #131926); border: 1px solid rgba(212,175,55,0.42); border-radius: 18px; padding: 0 16px 13px; box-shadow: 0 16px 44px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05); color: #e8ecf4; text-align: center; }',
'.tgg-cab { display: flex; align-items: center; justify-content: space-between; height: 38px; margin: 0 -6px; }',
'.v19t-num { font-size: 0.74rem; color: #a3abbd; letter-spacing: 0.06em; font-variant-numeric: tabular-nums; padding-left: 4px; min-width: 64px; text-align: left; }',
'.tgg-cab-der { display: flex; align-items: center; gap: 2px; min-width: 64px; justify-content: flex-end; }',
'.tgg-ico-btn { width: 34px; height: 34px; border-radius: 50%; border: none; background: none; color: #a3abbd; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; font-family: inherit; }',
'.tgg-ico-btn svg { width: 18px; height: 18px; display: block; }',
'.tgg-ico-btn:active { transform: scale(0.92); }',
'.tgg-ico-btn[aria-pressed="true"] { color: #171106; background: linear-gradient(180deg, #e9c458, #D4AF37); box-shadow: 0 0 12px rgba(212,175,55,0.5); }',
'.tgg-voz .tgg-on { display: none; } .tgg-voz[aria-pressed="true"] .tgg-on { display: block; } .tgg-voz[aria-pressed="true"] .tgg-off { display: none; }',
'.tgg-barra { display: flex; gap: 4px; height: 3px; margin: 0 0 11px; }',
'.tgg-barra i { display: block; height: 100%; border-radius: 2px; background: rgba(212,175,55,0.2); overflow: hidden; flex: 1 1 0; }',
'.tgg-barra i b { display: block; height: 100%; width: 0; border-radius: 2px; background: linear-gradient(90deg, #b8912f, #F5C76B); transition: width .45s cubic-bezier(0.2, 0.9, 0.3, 1); }',
'.tgg-cap { display: inline-flex; align-items: center; gap: 6px; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #D4AF37; margin-bottom: 3px; min-height: 18px; }',
'.v19t-ico { display: inline-block; font-size: 0.95rem; line-height: 1; }',
'.v19t-nuevo { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #171106; background: linear-gradient(90deg, #e9c458 0%, #fff3c4 50%, #e9c458 100%); background-size: 200% 100%; animation: v19tBrillo 2.4s linear infinite; }',
'@keyframes v19tBrillo { from { background-position: 100% 0; } to { background-position: -100% 0; } }',
'.v19t-card h3 { margin: 0 0 6px; font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; font-size: 1.38rem; line-height: 1.15; color: #F5C76B; letter-spacing: 0.01em; text-wrap: balance; }',
'.v19t-card p { margin: 0 0 13px; font-size: 0.875rem; line-height: 1.5; color: #d3dae8; text-wrap: pretty; }',
'.tgg-pordecir { opacity: 0; }',
/* el aparte de Jérôme (su chiste): debajo del texto, en cursiva y dorado */
'.v19t-card p.tgg-con-chiste { margin-bottom: 5px; }',
'.v19t-card p.tgg-chiste { font-style: italic; color: #f0d48a; font-size: 0.84rem; line-height: 1.42; }',
'.tgg-unidad.compacta .v19t-card p.tgg-con-chiste { margin-bottom: 3px; }',
'.tgg-unidad.compacta .v19t-card p.tgg-chiste { font-size: 0.79rem; line-height: 1.36; }',
'#v19-tour.tgg-oscuro .v19t-card p.tgg-chiste { color: #d9bd74; }',
'.tgg-sr { position: absolute !important; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0; }',
'.v19t-entra { animation: v19tSube .36s cubic-bezier(0.2, 0.9, 0.3, 1.1) both; }',
'.v19t-entra .v19t-ico { animation: v19tSalta .5s cubic-bezier(0.2, 1.5, 0.4, 1) .06s both; }',
'@keyframes v19tSube { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }',
'@keyframes v19tSalta { 0% { transform: scale(0.3) rotate(-15deg); opacity: 0; } 100% { transform: none; opacity: 1; } }',
'.v19t-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }',
'.v19t-back, .v19t-skip-txt { background: none; border: none; color: #a3abbd; font-size: 0.84rem; padding: 10px 8px; cursor: pointer; font-family: inherit; white-space: nowrap; }',
'.v19t-next { background: linear-gradient(180deg, #e9c458, #D4AF37 60%, #b8912f); color: #171106; border: none; border-radius: 999px; padding: 11px 24px; font-weight: 700; font-size: 0.86rem; letter-spacing: 0.05em; cursor: pointer; font-family: inherit; box-shadow: 0 4px 14px rgba(212,175,55,0.35); white-space: nowrap; margin-left: auto; }',
'.v19t-next:active, .v19t-ghost:active { transform: scale(0.96); }',
'.v19t-next.tgg-late { animation: tggLate 1.2s ease-in-out infinite; }',
'@keyframes tggLate { 0%, 100% { box-shadow: 0 4px 14px rgba(212,175,55,0.35); } 50% { box-shadow: 0 4px 14px rgba(212,175,55,0.35), 0 0 0 7px rgba(245,199,107,0.22); } }',
'.v19t-ghost { background: none; border: 1px solid rgba(212,175,55,0.45); color: #E5C158; border-radius: 999px; padding: 10px 18px; font-size: 0.86rem; cursor: pointer; font-family: inherit; white-space: nowrap; }',

/* la pregunta del principio y el menu de visitas */
'.v19t-prompt { position: fixed; inset: 0; z-index: 8600; display: flex; align-items: center; justify-content: center; background: rgba(6,9,15,0.74); animation: v19tIn .25s ease; font-family: "DM Sans", system-ui, sans-serif; overflow: auto; padding: 14px 0; box-sizing: border-box; }',
'@keyframes v19tIn { from { opacity: 0; } }',
/* centrado con margenes y no con align-items: si lo de dentro no cabe, se puede bajar desde su principio (centrado a secas, la cabeza de Jérôme quedaba cortada arriba y sin forma de llegar a ella) */
'.v19t-prompt > .tgg-unidad { margin: auto; }',
'.v19t-prompt .v19t-card { padding-top: calc(var(--tgg-jw) * 0.19 + 8px); }',
/* el menu, apretado, en los moviles donde no cabe a su tamaño */
'.tgg-menu.tgg-prieto .v19t-card h3 { font-size: 1.3rem; margin-bottom: 2px; }',
'.tgg-menu.tgg-prieto .v19t-card p { font-size: 0.8rem; margin-bottom: 8px; }',
'.tgg-menu.tgg-prieto .tgg-lista { gap: 6px; margin-bottom: 9px; }',
'.tgg-menu.tgg-prieto .tgg-op { padding: 7px 11px; }',
'.tgg-menu.tgg-prieto .tgg-op-ico { font-size: 1.15rem; width: 26px; }',
'.tgg-menu.tgg-prieto .tgg-caps { gap: 5px; margin-bottom: 2px; }',
'.tgg-menu.tgg-prieto .tgg-chip { padding: 5px 9px; }',
'.v19t-prompt .v19t-card h3 { font-size: 1.6rem; }',
'.v19t-prompt .v19t-nuevo { margin-bottom: 8px; }',
'.v19t-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }',
'.tgg-entra-heroe { animation: tggHeroe .6s cubic-bezier(0.2, 1.3, 0.4, 1) both; }',
'@keyframes tggHeroe { from { opacity: 0; transform: translateY(26px) scale(0.86); } to { opacity: 1; transform: none; } }',
'.tgg-lista { display: grid; gap: 8px; margin: 2px 0 12px; text-align: left; }',
'.tgg-op { display: flex; align-items: center; gap: 11px; width: 100%; box-sizing: border-box; padding: 11px 12px; border-radius: 14px; border: 1px solid rgba(212,175,55,0.28); background: rgba(255,255,255,0.035); color: #e8ecf4; font-family: inherit; font-size: 0.9rem; text-align: left; cursor: pointer; }',
'.tgg-op:active { transform: scale(0.985); background: rgba(212,175,55,0.1); }',
'.tgg-op-ico { font-size: 1.35rem; line-height: 1; flex: none; width: 30px; text-align: center; }',
'.tgg-op-txt { flex: 1 1 auto; min-width: 0; } .tgg-op-txt b { display: block; font-weight: 600; color: #F5C76B; } .tgg-op-txt span { display: block; font-size: 0.74rem; color: #a3abbd; margin-top: 1px; }',
'.tgg-op-fle { flex: none; color: #D4AF37; font-size: 1rem; }',
'.tgg-caps { display: flex; flex-wrap: wrap; gap: 6px; margin: -2px 0 4px; }',
'.tgg-chip { border: 1px solid rgba(212,175,55,0.3); background: none; color: #d3dae8; border-radius: 999px; padding: 7px 11px; font-size: 0.76rem; font-family: inherit; cursor: pointer; white-space: nowrap; }',
'.tgg-chip:active { background: rgba(212,175,55,0.14); }',

/* el tour del cielo, de noche: el bocadillo mas oscuro para no deslumbrar */
'#v19-tour.tgg-oscuro .v19t-card { background: linear-gradient(180deg, #10141f, #090c14); border-color: rgba(212,175,55,0.3); }',
'#v19-tour.tgg-oscuro .v19t-card p { color: #c2c9d8; }',

/* la pista junto a un boton y la cara de Jérôme dentro de un boton */
'.tgg-pista { position: fixed; z-index: 8845; max-width: 240px; padding: 8px 12px; border-radius: 12px; background: linear-gradient(180deg, #1d2535, #131926); border: 1px solid rgba(212,175,55,0.55); color: #F5C76B; font: 600 0.78rem/1.3 "DM Sans", system-ui, sans-serif; box-shadow: 0 8px 22px rgba(0,0,0,0.5); pointer-events: none; animation: tggPista .35s cubic-bezier(0.2, 1.3, 0.4, 1) both; }',
'.tgg-pista::before { content: ""; position: absolute; top: -6px; left: var(--tgg-pico, 50%); width: 10px; height: 10px; margin-left: -5px; background: #1d2535; border-left: 1px solid rgba(212,175,55,0.55); border-top: 1px solid rgba(212,175,55,0.55); transform: rotate(45deg); }',
'.tgg-pista.tgg-pista-arriba::before { top: auto; bottom: -6px; transform: rotate(225deg); }',
'.tgg-pista.tgg-se-va { opacity: 0; transition: opacity .5s; }',
/* la barra de la luz roja del panel del cielo y, con la luz puesta, el regulador de brillo de su cabecera:
   apartados mientras dura la visita (TOURS.cielo) */
'#cielo-panel.tgg-de-visita #cielo-pista, #cielo-panel.tgg-de-visita #cielo-brillo { display: none !important; }',
'@keyframes tggPista { from { opacity: 0; transform: translateY(-6px) scale(0.9); } to { opacity: 1; transform: none; } }',
'.tgg-llama { animation: tggLlama 1.5s ease-in-out infinite; }',
'@keyframes tggLlama { 0%, 100% { box-shadow: 0 0 0 0 rgba(245,199,107,0.55); } 50% { box-shadow: 0 0 0 7px rgba(245,199,107,0); } }',
'.tgg-jero.tgg-cara { width: 100%; height: 100%; }',

'@media (max-width: 340px) { .v19t-card { padding-left: 13px; padding-right: 13px; } .v19t-card h3 { font-size: 1.26rem; } .v19t-next { padding: 11px 18px; } }',
'@media (prefers-reduced-motion: reduce) {',
/* La app, con «reducir movimiento», le pone a TODO una transicion de 0,01 ms (index.html): con
   ella, lo que se mide en el mismo instante de cambiar una clase es todavia lo de antes, y el
   bocadillo se colocaba con la altura del paso anterior. Aqui dentro, ninguna transicion. */
'  #v19-tour, #v19-tour *, .v19t-prompt, .v19t-prompt * { transition-property: none !important; }',
'  .v19t-hole, .tgg-unidad, .tgg-unidad .tgg-jero, .tgg-esc, .tgg-barra i b { transition: none; }',
'  .v19t-hole::after, .v19t-hole.tgg-llega::after, .v19t-entra, .v19t-entra .v19t-ico, .v19t-nuevo, .v19t-prompt, .tgg-entra-heroe, .tgg-rastro.ve, .tgg-chispa.ve, .tgg-pista, .tgg-llama, .tgg-jero.tgg-pop, .tgg-fiesta i,',
'  .tgg-e0, .tgg-e1, .tgg-e2, .tgg-fugaz, .tgg-frontal-halo, .tgg-brillo, .v19t-next.tgg-late, .tgg-fx, .tgg-fx-chispas path, .tgg-fx-notas g { animation: none; }',
'}'
  ].join('\n');
  function ponerEstilos() {
    if (document.getElementById('tgg-estilos')) return;
    var s = document.createElement('style'); s.id = 'tgg-estilos'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  /* ── colores ── */
  var C = {
    piel: '#f3c5a3', pielS: '#e2a683', pielSS: '#c98866', pielL: '#fde0c8', pielT: '#a9634a', rubor: '#f08c7c',
    pelo: '#aa834d', peloS: '#80602f', peloSS: '#5d4320', peloL: '#d6b274', ceja: '#7a5a2e',
    mont: '#17231e', montL: '#4d6b5f',
    cami: '#2c3140', camiS: '#1b1f29', camiL: '#4a5269', camiM: '#3a4054',
    boca: '#6e1f24', lengua: '#e2706f', diente: '#ffffff'
  };
  /* el aro: centro y radios */
  var AX = 160, AY = 226, AR = 128, AI = 124;
  /* los hombros y los huesos del brazo */
  var HOMBRO = { i: [80, 268], d: [240, 268] }, L1 = 54, L2 = 50;

  function montana(relleno, borde, nieve) {
    return '<path d="M30,266 L52,228 L62,213 L70,209 L77,215 L98,252 L116,266z" fill="' + relleno + '"/>' +
      (nieve ? '<path d="M62,213 L70,209 L77,215 L73,221 L69,216 L65,221z" fill="#fff" opacity=".9"/>' : '') +
      (borde ? '<path d="M52,228 L62,213 L70,209 L77,215" fill="none" stroke="' + borde + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' : '');
  }
  function estrellas(color, muchas) {
    var P = [[52,168,1.8],[76,132,1.2],[246,118,1.3],[272,186,1.5],[226,108,1.1],[44,214,1.2],[282,232,1.3],[96,112,1.2],[262,160,1],[60,190,0.9]];
    if (muchas) P = P.concat([[238,206,1.1],[274,258,1.2],[48,250,1],[88,150,0.9],[252,238,0.9],[232,146,1.4],[104,126,0.8],[280,208,0.8]]);
    return '<g class="tgg-estrellas" fill="' + color + '">' + P.map(function (e, i) {
      return '<circle class="tgg-e' + (i % 3) + '" cx="' + e[0] + '" cy="' + e[1] + '" r="' + e[2] + '"/>'; }).join('') + '</g>';
  }

  function svgTexto(u) {
    var p = function (id) { return u + '-' + id; };
    return '' +
'<svg xmlns="' + NS + '" viewBox="0 0 320 370" class="tgg-svg" aria-hidden="true" focusable="false">' +
'<defs>' +
  '<linearGradient id="' + p('oro') + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#fff2c8"/><stop offset=".22" stop-color="#F5C76B"/><stop offset=".5" stop-color="#D4AF37"/>' +
    '<stop offset=".78" stop-color="#9a7620"/><stop offset="1" stop-color="#F5C76B"/></linearGradient>' +
  '<linearGradient id="' + p('noche') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#060a18"/><stop offset=".6" stop-color="#14204a"/><stop offset="1" stop-color="#2c3a72"/></linearGradient>' +
  '<linearGradient id="' + p('dia') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#3a98dc"/><stop offset=".6" stop-color="#8dcff2"/><stop offset="1" stop-color="#dcf3fc"/></linearGradient>' +
  '<linearGradient id="' + p('tarde') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#2b2a63"/><stop offset=".45" stop-color="#b6508a"/><stop offset=".72" stop-color="#f08a4b"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>' +
  '<linearGradient id="' + p('rojo') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#120303"/><stop offset="1" stop-color="#420c0c"/></linearGradient>' +
  '<linearGradient id="' + p('fiesta') + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#3b1a6e"/><stop offset="1" stop-color="#c2338a"/></linearGradient>' +
  '<radialGradient id="' + p('lactea') + '" cx=".5" cy=".5" r=".5">' +
    '<stop offset="0" stop-color="#d5ddff" stop-opacity=".55"/><stop offset=".5" stop-color="#8fa2e8" stop-opacity=".22"/><stop offset="1" stop-color="#8fa2e8" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="' + p('piel') + '" cx=".4" cy=".34" r=".8">' +
    '<stop offset="0" stop-color="' + C.pielL + '"/><stop offset=".5" stop-color="' + C.piel + '"/><stop offset="1" stop-color="' + C.pielS + '"/></radialGradient>' +
  '<linearGradient id="' + p('brazo') + '" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="' + C.pielL + '"/><stop offset=".42" stop-color="' + C.piel + '"/><stop offset="1" stop-color="' + C.pielS + '"/></linearGradient>' +
  '<linearGradient id="' + p('pelo') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + C.peloL + '"/><stop offset=".6" stop-color="' + C.pelo + '"/><stop offset="1" stop-color="' + C.peloS + '"/></linearGradient>' +
  '<linearGradient id="' + p('cami') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + C.camiL + '"/><stop offset=".45" stop-color="' + C.cami + '"/><stop offset="1" stop-color="' + C.camiS + '"/></linearGradient>' +
  '<linearGradient id="' + p('lente') + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#ffffff" stop-opacity=".38"/><stop offset=".45" stop-color="#cfe8ff" stop-opacity=".06"/><stop offset="1" stop-color="#cfe8ff" stop-opacity=".22"/></linearGradient>' +
  '<linearGradient id="' + p('sol') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#3b4458"/><stop offset=".5" stop-color="#0d0f15"/><stop offset="1" stop-color="#5a4a2a"/></linearGradient>' +
  '<radialGradient id="' + p('halo') + '" cx=".5" cy=".5" r=".5">' +
    '<stop offset=".84" stop-color="#F5C76B" stop-opacity=".55"/><stop offset=".92" stop-color="#F5C76B" stop-opacity=".2"/><stop offset="1" stop-color="#F5C76B" stop-opacity="0"/></radialGradient>' +
  '<clipPath id="' + p('disco') + '"><circle cx="' + AX + '" cy="' + AY + '" r="' + AI + '"/></clipPath>' +
  '<clipPath id="' + p('pop') + '"><rect x="-300" y="-300" width="920" height="' + (300 + AY) + '"/><circle cx="' + AX + '" cy="' + AY + '" r="' + AI + '"/></clipPath>' +
  '<clipPath id="' + p('caraclip') + '"><path d="' + CARA + '"/></clipPath>' +
  '<clipPath id="' + p('ojoi') + '"><path class="tgg-ojo-hueco-i" d=""/></clipPath>' +
  '<clipPath id="' + p('ojod') + '"><path class="tgg-ojo-hueco-d" d=""/></clipPath>' +
  '<radialGradient id="' + p('iris') + '" cx=".5" cy=".5" r=".5">' +
    '<stop offset="0" stop-color="#b17a43"/><stop offset=".55" stop-color="#70482a"/><stop offset="1" stop-color="#3a2412"/></radialGradient>' +
  '<linearGradient id="' + p('sien') + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + C.peloS + '"/><stop offset=".5" stop-color="' + C.peloS + '" stop-opacity=".85"/><stop offset="1" stop-color="' + C.peloS + '" stop-opacity=".12"/></linearGradient>' +
  '<clipPath id="' + p('bocaclip') + '"><path class="tgg-boca-forma" d=""/></clipPath>' +
'</defs>' +

/* ── el aro y lo que hay dentro ── */
'<g class="tgg-fondo">' +
  '<circle class="tgg-halo" cx="' + AX + '" cy="' + AY + '" r="' + (AR + 15.5) + '" fill="url(#' + p('halo') + ')"/>' +
  '<circle cx="' + AX + '" cy="' + AY + '" r="' + AR + '" fill="#080c18"/>' +
  '<g clip-path="url(#' + p('disco') + ')">' +
    '<g class="tgg-esc tgg-esc-noche">' +
      '<rect x="30" y="96" width="260" height="262" fill="url(#' + p('noche') + ')"/>' +
      estrellas('#fff6dd', false) +
      '<path d="M252,160 a15,15 0 1 0 12,24 a12,12 0 1 1 -12,-24z" fill="#F5C76B"/>' +
      montana('#0a1022', '#D4AF37', false) +
      '<rect x="30" y="266" width="260" height="92" fill="#111c44"/>' +
    '</g>' +
    '<g class="tgg-esc tgg-esc-dia">' +
      '<rect x="30" y="96" width="260" height="262" fill="url(#' + p('dia') + ')"/>' +
      '<circle cx="254" cy="168" r="30" fill="#ffe07a" opacity=".3"/><circle class="tgg-sol" cx="254" cy="168" r="18" fill="#ffe07a"/>' +
      '<path class="tgg-nube" d="M36,168 q4,-12 16,-8 q8,-12 20,-2 q12,-2 12,10z" fill="#fff" opacity=".95"/>' +
      montana('#7d958a', null, true) +
      '<rect x="30" y="266" width="260" height="92" fill="#2f8fc7"/>' +
    '</g>' +
    '<g class="tgg-esc tgg-esc-tarde">' +
      '<rect x="30" y="96" width="260" height="262" fill="url(#' + p('tarde') + ')"/>' +
      '<circle cx="254" cy="246" r="34" fill="#ffe7a0" opacity=".35"/><circle cx="254" cy="246" r="22" fill="#ffe7a0"/>' +
      montana('#3a2350', '#ffb46b', false) +
      '<rect x="30" y="266" width="260" height="92" fill="#6a3f7a"/>' +
    '</g>' +
    '<g class="tgg-esc tgg-esc-cielo">' +
      '<rect x="30" y="96" width="260" height="262" fill="#03050d"/>' +
      '<ellipse cx="160" cy="210" rx="56" ry="200" fill="url(#' + p('lactea') + ')" transform="rotate(40 160 210)"/>' +
      estrellas('#ffffff', true) +
      '<g stroke="#9db2ff" stroke-width="1.1" opacity=".6" fill="none"><path d="M226,108 L246,118 L262,160 L272,186"/><path d="M246,118 L232,146"/></g>' +
      '<path class="tgg-fugaz" d="M44,150 l38,16" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
      montana('#05070f', '#39457a', false) +
    '</g>' +
    '<g class="tgg-esc tgg-esc-rojo">' +
      '<rect x="30" y="96" width="260" height="262" fill="url(#' + p('rojo') + ')"/>' +
      estrellas('#ff7a6a', true) +
      montana('#0d0202', '#7a1a14', false) +
    '</g>' +
    '<g class="tgg-esc tgg-esc-fiesta">' +
      '<rect x="30" y="96" width="260" height="262" fill="url(#' + p('fiesta') + ')"/>' +
      '<g class="tgg-confeti">' +
        '<rect class="tgg-e0" x="52" y="150" width="8" height="4.5" rx="1" fill="#F5C76B" transform="rotate(20 52 150)"/><rect class="tgg-e1" x="254" y="126" width="8" height="4.5" rx="1" fill="#4fd1c5" transform="rotate(-30 254 126)"/>' +
        '<rect class="tgg-e2" x="80" y="120" width="8" height="4.5" rx="1" fill="#ff7a59" transform="rotate(50 80 120)"/><rect class="tgg-e0" x="270" y="200" width="8" height="4.5" rx="1" fill="#F5C76B" transform="rotate(10 270 200)"/>' +
        '<rect class="tgg-e1" x="42" y="226" width="8" height="4.5" rx="1" fill="#7dd3fc" transform="rotate(-20 42 226)"/><rect class="tgg-e2" x="234" y="108" width="8" height="4.5" rx="1" fill="#ff7a59" transform="rotate(70 234 108)"/>' +
        '<circle class="tgg-e0" cx="272" cy="158" r="3.2" fill="#fff"/><circle class="tgg-e1" cx="60" cy="196" r="3.2" fill="#4fd1c5"/><circle class="tgg-e2" cx="262" cy="244" r="3.2" fill="#ffd166"/><circle class="tgg-e0" cx="96" cy="140" r="2.6" fill="#fff"/>' +
        '<path class="tgg-e1" d="M236,170 q8,-8 0,-16 q-8,-8 0,-16" fill="none" stroke="#F5C76B" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path class="tgg-e2" d="M70,236 q8,-8 0,-16 q-8,-8 0,-16" fill="none" stroke="#7dd3fc" stroke-width="2.4" stroke-linecap="round"/>' +
      '</g>' +
    '</g>' +
  '</g>' +
  '<circle class="tgg-aro" cx="' + AX + '" cy="' + AY + '" r="' + AR + '" fill="none" stroke="url(#' + p('oro') + ')" stroke-width="7.5"/>' +
  '<circle cx="' + AX + '" cy="' + AY + '" r="' + (AI - 0.5) + '" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="2.5"/>' +
'</g>' +

/* ── el cuerpo y la cabeza: por arriba se salen del aro ── */
'<g clip-path="url(#' + p('pop') + ')"><g class="tgg-salto">' +
  '<g class="tgg-cuerpo">' +
    '<path d="M135,188 L134,242 Q160,258 186,242 L185,188z" fill="' + C.pielS + '"/>' +
    '<path d="M135,200 Q160,228 185,200 L185,188 L135,188z" fill="' + C.pielSS + '" opacity=".6"/>' +
    /* la camiseta */
    '<path d="M64,370 L68,290 C70,266 88,254 112,247 L134,238 Q160,262 186,238 L208,247 C232,254 250,266 252,290 L256,370z" fill="url(#' + p('cami') + ')"/>' +
    '<path d="M100,370 C96,330 98,300 106,270 C96,292 90,326 88,370z M220,370 C224,330 222,300 214,270 C224,292 230,326 232,370z" fill="#000" opacity=".2"/>' +
    '<path d="M131,239 Q160,268 189,239" fill="none" stroke="' + C.camiL + '" stroke-width="8.5" stroke-linecap="round"/>' +
    '<path d="M132,246 Q160,273 188,246" fill="none" stroke="' + C.camiS + '" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>' +
    /* el canale del cuello, las costuras de los hombros y un par de arrugas de la tela */
    '<path d="M135.5,238.5 l-1.8,6.4 M141.5,243.6 l-1.4,6.6 M148,247.2 l-0.9,6.8 M154.6,249.2 l-0.4,7 M160,249.9 v7 M165.4,249.2 l0.4,7 M172,247.2 l0.9,6.8 M178.5,243.6 l1.4,6.6 M184.5,238.5 l1.8,6.4" fill="none" stroke="' + C.camiS + '" stroke-width="1.1" stroke-linecap="round" opacity=".5"/>' +
    '<path d="M127,244.5 C114,248 102,253.5 92,261 M193,244.5 C206,248 218,253.5 228,261" fill="none" stroke="' + C.camiS + '" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>' +
    '<path d="M110,286 C116,300 118,318 116,338 M210,286 C204,300 202,318 204,338" fill="none" stroke="' + C.camiL + '" stroke-width="1.6" stroke-linecap="round" opacity=".28"/>' +
    /* el estampado: el Teide a brochazos, con sus salpicaduras */
    '<g class="tgg-estampa">' +
      '<path d="M133,336 L150,311 L157,305 L163,311 L170,306 L177,313 L191,336z" fill="#f6f2e8"/>' +
      '<path d="M150,311 L157,305 L163,311 L158,317 L154,313z" fill="' + C.cami + '" opacity=".3"/>' +
      '<path d="M129,340 h64" stroke="#F5C76B" stroke-width="3.6" stroke-linecap="round"/>' +
      '<g fill="#ff7a45"><circle cx="122" cy="322" r="3"/><circle cx="130" cy="311" r="1.7"/><circle cx="198" cy="320" r="2.4"/><circle cx="189" cy="304" r="1.5"/><circle cx="137" cy="349" r="1.8"/></g>' +
      '<g fill="#4fb3ff"><circle cx="201" cy="332" r="2.8"/><circle cx="208" cy="316" r="1.6"/><circle cx="118" cy="335" r="1.9"/><circle cx="184" cy="349" r="1.7"/><circle cx="142" cy="302" r="1.4"/></g>' +
      '<g fill="#F5C76B"><circle cx="176" cy="297" r="1.7"/><circle cx="113" cy="346" r="1.4"/><circle cx="206" cy="346" r="1.5"/></g>' +
    '</g>' +
    /* las asas de la mochila (atuendo de monte) */
    '<g class="tgg-asas" style="display:none">' +
      '<path d="M112,248 C108,280 110,330 114,370 L130,370 C124,330 122,280 128,242z" fill="#d9682e"/>' +
      '<path d="M208,248 C212,280 210,330 206,370 L190,370 C196,330 198,280 192,242z" fill="#d9682e"/>' +
      '<rect x="112" y="292" width="14" height="7" rx="2" fill="#7a3413"/><rect x="194" y="292" width="14" height="7" rx="2" fill="#7a3413"/>' +
    '</g>' +
    /* la toalla al cuello (atuendo de deporte): los dos cabos caen sobre el pecho */
    '<g class="tgg-toalla" style="display:none">' +
      '<path d="M133,231 C119,238 110,252 108,271 L104,333 Q117,340 131,333 L134,273 C135,259 140,250 147,245z" fill="#f6f3ea"/>' +
      '<path d="M187,231 C201,238 210,252 212,271 L216,333 Q203,340 189,333 L186,273 C185,259 180,250 173,245z" fill="#e9e5d8"/>' +
      '<path d="M119,246 C113,256 111,266 110,278 M201,246 C207,256 209,266 210,278" fill="none" stroke="#cfc9b8" stroke-width="2" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M105,316 L132,316 M105.5,324 L131.5,324 M188,316 L215,316 M188.5,324 L214.5,324" stroke="#19b6a6" stroke-width="3.4" stroke-linecap="butt"/>' +
    '</g>' +
    '<g class="tgg-hueco-brazos"></g>' +
  '</g>' +

  '<g class="tgg-cabeza">' +
    /* las orejas, con su pliegue */
    '<g class="tgg-orejas">' +
      '<path d="M104,130 C95,125 88,133 89,146 C90,158 97,166 105,163z" fill="' + C.piel + '"/>' +
      '<path d="M100,136 C94,137 93,146 95,153 C96,156 99,158 101,157 M97,145 q3.4,2.4 2.4,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M216,130 C225,125 232,133 231,146 C230,158 223,166 215,163z" fill="' + C.pielS + '"/>' +
      '<path d="M220,136 C226,137 227,146 225,153 C224,156 221,158 219,157 M223,145 q-3.4,2.4 -2.4,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/>' +
    '</g>' +
    '<path class="tgg-cara" d="' + CARA + '" fill="url(#' + p('piel') + ')"/>' +
    /* dentro de la cara: la sombra de la barba de dos dias, las luces, las sombras y las mejillas */
    '<g clip-path="url(#' + p('caraclip') + ')">' +
      '<path d="M100,152 C104,174 112,190 124,200 C136,212 150,214 160,214 C170,214 184,212 196,200 C208,190 216,174 220,152 C215,166 207,174 196,176 C188,170 178,166 170,166 C166,162 154,162 150,166 C142,166 132,170 124,176 C113,174 105,166 100,152z" fill="#6a5140" opacity=".14"/>' +
      '<ellipse cx="146" cy="90" rx="31" ry="12" fill="' + C.pielL + '" opacity=".5"/>' +
      '<path d="M102,150 C104,172 112,188 124,199 C115,186 109,170 107,150z M218,150 C216,172 208,188 196,199 C205,186 211,170 213,150z" fill="' + C.pielSS + '" opacity=".26"/>' +
      '<path d="M146,203.5 Q160,209.5 174,203.5 Q160,206.5 146,203.5z" fill="' + C.pielSS + '" opacity=".4"/>' +
      '<ellipse class="tgg-rubor" cx="118" cy="166" rx="13.5" ry="8.5" fill="' + C.rubor + '" opacity=".24"/>' +
      '<ellipse class="tgg-rubor" cx="202" cy="166" rx="13.5" ry="8.5" fill="' + C.rubor + '" opacity=".24"/>' +
      '<ellipse cx="114" cy="160" rx="6" ry="2.8" fill="#fff" opacity=".22" transform="rotate(-20 114 160)"/><ellipse cx="206" cy="160" rx="6" ry="2.8" fill="#fff" opacity=".14" transform="rotate(20 206 160)"/>' +
    '</g>' +
    /* el pelo: detras, lo corto; las patillas, que se van apagando; y encima, el tupe con sus mechones */
    '<g class="tgg-pelo">' +
      '<path d="M101,124 C95,104 97,84 108,68 C120,52 140,44 160,44 C182,44 202,52 213,68 C223,84 225,104 219,124 C217,113 214,107 211,104 C200,90 182,84 160,84 C138,84 120,90 109,104 C106,107 103,113 101,124z" fill="' + C.peloS + '"/>' +
      '<path d="M100.5,147 C97,131 98,116 102,103 C105,104 108,106 110,109 C107.5,120 106.5,134 107.5,147 C105.5,150 102,150 100.5,147z M219.5,147 C223,131 222,116 218,103 C215,104 212,106 210,109 C212.5,120 213.5,134 212.5,147 C214.5,150 218,150 219.5,147z" fill="url(#' + p('sien') + ')"/>' +
      '<g class="tgg-tupe">' +
        '<path d="M106,107 C97,89 100,70 110,58 C112,50 118,42 126,35 C128,41 131,45 136,45 C138,35 142,29 150,24 C151,31 154,36 159,37 C162,29 166,25 174,22 C174,29 177,34 182,35 C186,31 192,30 198,31 C198,37 201,42 206,46 C216,55 223,70 222,86 C221,94 218,100 214,105 C208,91 196,83 180,81 C160,77 140,79 126,85 C116,90 110,98 106,107z" fill="url(#' + p('pelo') + ')"/>' +
        /* la raiz, mas oscura, pegada a la frente */
        '<path d="M106,107 C110,98 116,90 126,85 C140,79 160,77 180,81 C196,83 208,91 214,105 C209,98 198,92 180,90 C160,87 140,88 126,93 C117,96 111,101 106,107z" fill="' + C.peloSS + '" opacity=".5"/>' +
        /* los mechones: la raya que los separa y el brillo de cada uno */
        '<path d="M136,45 C128,58 124,72 124,87 M159,37 C150,50 146,66 146,81 M182,35 C174,48 170,64 170,81 M206,46 C199,58 195,70 195,84" fill="none" stroke="' + C.peloSS + '" stroke-width="1.7" stroke-linecap="round" opacity=".45"/>' +
        '<g class="tgg-mechas" fill="' + C.peloL + '" opacity=".8">' +
          '<path d="M113,76 C114,60 120,48 127,40 C125,52 123,63 122,77 C120,80 114,80 113,76z"/><path d="M135,72 C137,54 143,41 151,30 C149,45 148,58 147,73 C145,76 137,76 135,72z"/>' +
          '<path d="M159,69 C161,51 167,38 175,28 C173,43 172,56 171,70 C169,73 161,73 159,69z"/><path d="M183,70 C185,55 191,44 198,36 C197,49 196,60 195,73 C193,76 185,75 183,70z"/>' +
          '<path d="M204,78 C206,68 210,61 215,57 C215,66 214,74 212,82 C210,84 205,82 204,78z" opacity=".7"/>' +
        '</g>' +
      '</g>' +
    '</g>' +
    /* las cejas: cada una con su forma y sus pelillos, y cada una se mueve por su cuenta */
    '<g class="tgg-cejas">' +
      '<g class="tgg-ceja-i"><path d="M109.5,109.5 C117,99.5 134,95.5 151,100.5 C152.6,101 152.6,105.6 150.5,106 C136,102.5 121,104 112.5,111 C110.5,112.5 108.5,111 109.5,109.5z" fill="' + C.ceja + '"/>' +
        '<path d="M119,105 l4.4,-3.6 M129,102.4 l4.4,-3.2 M139,101.6 l4.4,-2.2" stroke="' + C.peloSS + '" stroke-width="1" stroke-linecap="round" opacity=".5"/></g>' +
      '<g class="tgg-ceja-d"><path d="M210.5,109.5 C203,99.5 186,95.5 169,100.5 C167.4,101 167.4,105.6 169.5,106 C184,102.5 199,104 207.5,111 C209.5,112.5 211.5,111 210.5,109.5z" fill="' + C.ceja + '"/>' +
        '<path d="M201,105 l-4.4,-3.6 M191,102.4 l-4.4,-3.2 M181,101.6 l-4.4,-2.2" stroke="' + C.peloSS + '" stroke-width="1" stroke-linecap="round" opacity=".5"/></g>' +
    '</g>' +
    /* los ojos: los dos parpados son dos curvas que el muñeco mueve (abrir, entornar, guiñar, reir) */
    '<g class="tgg-ojos">' + ojo(131, 'i', p) + ojo(189, 'd', p) +
      '<path class="tgg-patas" d="M113.6,139.5 l-3.6,2 M114.2,143.4 l-3,3.6 M206.4,139.5 l3.6,2 M205.8,143.4 l3,3.6" fill="none" stroke="' + C.pielSS + '" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>' +
    '</g>' +
    /* la nariz: el brillo del puente y de la punta, su linea y las aletas */
    '<path d="M161,137 L160.4,151" stroke="' + C.pielL + '" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>' +
    '<ellipse cx="160.5" cy="158.5" rx="4.6" ry="5.6" fill="' + C.pielL + '" opacity=".55"/>' +
    '<path d="M157,141 C155,151 149,158 151,164 C153,170 167,171 170,164" fill="none" stroke="' + C.pielSS + '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M153.4,166 q2.6,2 5.2,0.6 M162.8,166.8 q2.6,1.2 4.8,-0.8" fill="none" stroke="' + C.pielT + '" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>' +
    /* gafas: la montura fina, mas gruesa arriba, como las de la foto, con sus remaches y sus plaquetas */
    '<g class="tgg-gafas">' +
      '<path d="M107,124 L95.5,129.6 M213,124 L224.5,129.6" stroke="' + C.mont + '" stroke-width="3.8" stroke-linecap="round"/>' +
      '<rect x="109" y="118" width="44" height="30" rx="7" fill="url(#' + p('lente') + ')"/>' +
      '<rect x="167" y="118" width="44" height="30" rx="7" fill="url(#' + p('lente') + ')"/>' +
      '<ellipse cx="155.3" cy="141.5" rx="1.9" ry="3.4" fill="#fff" opacity=".45"/><ellipse cx="164.7" cy="141.5" rx="1.9" ry="3.4" fill="#fff" opacity=".45"/>' +
      montura(106) + montura(164) +
      '<path d="M155,127 Q160,122.5 165,127" fill="none" stroke="' + C.mont + '" stroke-width="4.6" stroke-linecap="round"/>' +
      '<path d="M114,115.6 h30 M172,115.6 h30" stroke="' + C.montL + '" stroke-width="1.7" stroke-linecap="round"/>' +
      '<g fill="#a9bdb4"><circle cx="110.6" cy="116.4" r="1.1"/><circle cx="209.4" cy="116.4" r="1.1"/></g>' +
      '<g class="tgg-brillo" fill="#fff" opacity=".5"><path d="M112,136 L119,121.5 h5 L112.5,145z"/><path d="M170,136 L177,121.5 h5 L170.5,145z"/></g>' +
    '</g>' +
    /* gafas de sol */
    '<g class="tgg-gafas-sol" style="display:none">' +
      '<path d="M105,123 L95,129 M215,123 L225,129" stroke="#0b0c10" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path d="M104,114 h50 q3.5,0 3,4.5 l-3,24 q-2,11 -13,11 h-22 q-11,0 -14,-11 l-4,-24 q-.5,-4.5 3,-4.5z" fill="url(#' + p('sol') + ')" stroke="#0b0c10" stroke-width="3.4"/>' +
      '<path d="M166,114 h50 q3.5,0 3,4.5 l-4,24 q-3,11 -14,11 h-22 q-11,0 -13,-11 l-3,-24 q-.5,-4.5 3,-4.5z" fill="url(#' + p('sol') + ')" stroke="#0b0c10" stroke-width="3.4"/>' +
      '<path d="M155,121 Q160,117 165,121" fill="none" stroke="#0b0c10" stroke-width="6" stroke-linecap="round"/>' +
      '<g class="tgg-brillo" fill="#fff" opacity=".4"><path d="M114,148 L128,119 h6 L120,148z"/><path d="M176,148 L190,119 h6 L182,148z"/></g>' +
    '</g>' +
    /* la boca: una forma por gesto o por letra; los dientes y la lengua, recortados por ella */
    '<g class="tgg-boca">' +
      '<path class="tgg-boca-fondo" d="" fill="' + C.boca + '"/>' +
      '<g clip-path="url(#' + p('bocaclip') + ')">' +
        '<ellipse class="tgg-lengua" cx="160" cy="197" rx="16" ry="8.5" fill="' + C.lengua + '"/>' +
        '<path class="tgg-lengua" d="M160,190.5 v7" stroke="#c4585c" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>' +
        '<path class="tgg-dientes" d="" fill="' + C.diente + '"/>' +
        '<path class="tgg-boca-rayas" d="" fill="none" stroke="#b9aea6" stroke-width="1.1" stroke-linecap="round"/>' +
      '</g>' +
      '<path class="tgg-boca-linea" d="" fill="none" stroke="#8c4a3e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M125,163 q-4,4 -2,10 M195,163 q4,4 2,10" fill="none" stroke="' + C.pielSS + '" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>' +
    '</g>' +
    /* lo que le pasa por la cara: la gota del apuro y la lagrima de la risa */
    '<path class="tgg-fx tgg-fx-gota" d="M226,74 C226,74 219.5,84.5 219.5,89.5 a6.5,6.5 0 0 0 13,0 C232.5,84.5 226,74 226,74z" fill="#8fd6fb" stroke="#3aa0d8" stroke-width="1.2"/>' +
    '<path class="tgg-fx tgg-fx-lagrima" d="M211,139 q-4.4,6.4 0,9.4 q4.4,-3 0,-9.4z" fill="#bfe9ff" stroke="#6ab8e6" stroke-width=".8"/>' +
    /* atuendos de cabeza */
    '<g class="tgg-gorro" style="display:none">' +
      '<path d="M97,106 C92,66 122,34 160,34 C198,34 228,66 223,106 Q160,84 97,106z" fill="#27406e"/>' +
      '<path d="M120,60 C130,46 146,40 160,40 M112,84 C116,70 124,60 132,54" fill="none" stroke="#3b5a94" stroke-width="3" stroke-linecap="round" opacity=".9"/>' +
      '<circle cx="160" cy="31" r="11" fill="#3b5a94"/><circle cx="156" cy="27" r="4" fill="#5577b5" opacity=".8"/>' +
      '<path d="M93,101 Q160,78 227,101 L228,121 Q160,98 92,121z" fill="#3b5a94"/>' +
      '<path d="M106,104 v11 M122,98 v11 M140,94 v11 M160,93 v11 M180,94 v11 M198,98 v11 M214,104 v11" stroke="#27406e" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M93,106 Q160,83 227,106" fill="none" stroke="#10141d" stroke-width="7.5"/>' +
      '<rect x="143" y="76" width="34" height="26" rx="7" fill="#10141d"/><rect x="146" y="79" width="28" height="20" rx="5" fill="#2a3040"/>' +
      '<circle class="tgg-frontal-halo" cx="160" cy="89" r="26" fill="#fff7d6" opacity=".25"/>' +
      '<circle class="tgg-frontal-luz" cx="160" cy="89" r="8" fill="#fff7d6"/>' +
    '</g>' +
    '<g class="tgg-gorra" style="display:none">' +
      '<path d="M97,102 C92,62 124,36 160,36 C196,36 228,62 223,102 Q160,82 97,102z" fill="#e0702f"/>' +
      '<path d="M160,36 C149,54 146,74 148,90 M160,36 C171,54 174,74 172,90" fill="none" stroke="#b9531f" stroke-width="2.2"/>' +
      '<path d="M118,58 C128,46 142,40 154,40" fill="none" stroke="#f39a5b" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M93,99 Q160,76 227,99 Q242,106 252,122 Q202,100 150,104 Q118,106 92,114z" fill="#b9531f"/>' +
      '<path d="M100,106 Q160,84 224,104" fill="none" stroke="#8f3d14" stroke-width="2" opacity=".7"/>' +
      '<circle cx="160" cy="36" r="5" fill="#b9531f"/>' +
      '<path d="M145,72 l15,-15 l15,15 h-7 l-3,-4 l-5,6 l-5,-6 l-3,4z" fill="#fff3d0"/>' +
    '</g>' +
    /* la cinta del pelo (atuendo de deporte): sobre la frente, con el tupe por encima */
    '<g class="tgg-cinta" style="display:none">' +
      '<path d="M98,96 Q160,70 222,96 L223,111 Q160,85 97,111z" fill="#19b6a6"/>' +
      '<path d="M98,96 Q160,70 222,96 L222.4,101 Q160,75 97.6,101z" fill="#3fd2c2" opacity=".9"/>' +
      '<path d="M97.4,107.5 Q160,81.5 222.6,107.5" fill="none" stroke="#0e8a7e" stroke-width="2" opacity=".75"/>' +
      '<path d="M99,103.6 Q160,77.6 221,103.6" fill="none" stroke="#f3fffd" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>' +
    '</g>' +
    '<g class="tgg-antifaz" style="display:none">' +
      '<path fill-rule="evenodd" d="M98,130 C98,110 120,106 139,111 Q160,120 181,111 C200,106 222,110 222,130 C222,152 203,160 188,158 Q170,155 160,143 Q150,155 132,158 C117,160 98,152 98,130z M131,121 a13,11 0 1 0 .1,0z M189,121 a13,11 0 1 0 .1,0z" fill="#7b2cbf"/>' +
      '<path d="M98,130 C98,110 120,106 139,111 Q160,120 181,111 C200,106 222,110 222,130" fill="none" stroke="#F5C76B" stroke-width="2.6" stroke-linecap="round"/>' +
      '<ellipse cx="131" cy="132" rx="13" ry="11" fill="none" stroke="#F5C76B" stroke-width="1.6"/><ellipse cx="189" cy="132" rx="13" ry="11" fill="none" stroke="#F5C76B" stroke-width="1.6"/>' +
      '<path d="M218,116 C236,94 242,72 238,54 C231,72 222,86 211,100z" fill="#ff5d8f"/><path d="M215,112 C227,88 227,66 218,50 C216,70 211,86 204,100z" fill="#F5C76B"/><path d="M210,110 C215,90 210,70 199,56 C201,76 199,90 196,102z" fill="#4fd1c5"/>' +
      '<circle cx="112" cy="118" r="2.2" fill="#F5C76B"/><circle cx="160" cy="127" r="2.6" fill="#F5C76B"/><circle cx="208" cy="118" r="2.2" fill="#F5C76B"/>' +
    '</g>' +
  '</g>' +
  /* lo que flota a su lado segun el animo: destellos, una duda, el vaho del frio, unas notas, un corazon */
  '<g class="tgg-fx tgg-fx-chispas" fill="#fff3c4" stroke="#F5C76B" stroke-width="1">' + chispa(86, 66, 1) + chispa(240, 52, 1.25) + chispa(252, 104, 0.8) + '</g>' +
  '<g class="tgg-fx tgg-fx-duda" fill="none" stroke="#F5C76B" stroke-width="5.4" stroke-linecap="round"><path d="M233,62 C233,49 252,49 252,62 C252,72 243,71 243,81"/><circle cx="243" cy="92" r="1.6"/></g>' +
  '<g class="tgg-fx tgg-fx-vaho" fill="#fff"><circle cx="203" cy="186" r="6.4" opacity=".5"/><circle cx="214" cy="180" r="4.8" opacity=".4"/><circle cx="223" cy="175.5" r="3.2" opacity=".3"/></g>' +
  '<g class="tgg-fx tgg-fx-notas" fill="#F5C76B" stroke="#F5C76B" stroke-width="2.6" stroke-linecap="round">' +
    '<g transform="translate(82,92)"><ellipse rx="5.2" ry="3.9" transform="rotate(-20)" stroke="none"/><path d="M4.6,-1.2 v-18 q8.4,2 8,10.4" fill="none"/></g>' +
    '<g transform="translate(238,74) scale(.86)"><ellipse rx="5.2" ry="3.9" transform="rotate(-20)" stroke="none"/><path d="M4.6,-1.2 v-18 q8.4,2 8,10.4" fill="none"/></g></g>' +
  '<path class="tgg-fx tgg-fx-corazon" d="M240,98 C226,87 232,75 240,83 C248,75 254,87 240,98z" fill="#ff5d73" stroke="#c23650" stroke-width="1.2" stroke-linejoin="round"/>' +
'</g></g>' +

/* ── los brazos: fuera del recorte cuando gesticulan, dentro cuando descansan ── */
'<g class="tgg-salto"><g class="tgg-brazos-fuera">' + brazo('i', p) + brazo('d', p) + '</g></g>' +
'</svg>';
  }

  /* la cara, su contorno: la mandibula algo cuadrada */
  var CARA = 'M103,112 C103,74 130,54 160,54 C190,54 217,74 217,112 L218,144 C218,162 213,177 203,188 C193,199 177,209 160,209 C143,209 127,199 117,188 C107,177 102,162 102,144z';
  /* un ojo: el blanco y el recorte los pone el muñeco (son los parpados); dentro, el iris con su
     borde, la pupila y sus dos brillos, y la sombra que deja el parpado de arriba */
  function ojo(x, k, p) {
    return '<g class="tgg-ojo tgg-ojo-' + k + '">' +
      '<path class="tgg-ojo-blanco" d="" fill="#fff"/>' +
      '<g clip-path="url(#' + p('ojo' + k) + ')">' +
        '<g class="tgg-iris"><circle cx="' + x + '" cy="133.5" r="7.8" fill="url(#' + p('iris') + ')"/><circle cx="' + x + '" cy="133.5" r="7.8" fill="none" stroke="#2f1c0e" stroke-width="1.1"/>' +
          '<circle cx="' + x + '" cy="133.5" r="3.6" fill="#160b05"/><circle cx="' + (x - 2.7) + '" cy="130.4" r="2.4" fill="#fff"/><circle cx="' + (x + 2.6) + '" cy="136.3" r="1.1" fill="#fff" opacity=".85"/></g>' +
        '<path class="tgg-ojo-sombra" d="" fill="#4a2f22" opacity=".2"/>' +
      '</g>' +
      '<path class="tgg-ojo-pliegue" d="" fill="none" stroke="' + C.pielSS + '" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>' +
      '<path class="tgg-ojo-bajo" d="" fill="none" stroke="' + C.pielSS + '" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>' +
      '<path class="tgg-ojo-parpado" d="" fill="none" stroke="#3d2a1c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</g>';
  }
  /* la montura de un cristal: fina abajo y a los lados, mas gruesa arriba, como las de la foto */
  function montura(x) {
    return '<path fill-rule="evenodd" fill="' + C.mont + '" d="M' + (x + 8) + ',113 h34 a8,8 0 0 1 8,8 v22 a8,8 0 0 1 -8,8 h-34 a8,8 0 0 1 -8,-8 v-22 a8,8 0 0 1 8,-8z ' +
      'M' + (x + 9.4) + ',118.6 a6,6 0 0 0 -6,6 v17.8 a6,6 0 0 0 6,6 h31.2 a6,6 0 0 0 6,-6 v-17.8 a6,6 0 0 0 -6,-6z"/>';
  }
  /* un destello de cuatro puntas */
  function chispa(x, y, k) {
    return '<path class="tgg-e' + (Math.round(x) % 3) + '" transform="translate(' + x + ',' + y + ') scale(' + k + ')" d="M0,-10 Q1.6,-1.6 10,0 Q1.6,1.6 0,10 Q-1.6,1.6 -10,0 Q-1.6,-1.6 0,-10z"/>';
  }
  /* ── LAS MANOS ──
     Dibujadas colgando: la muñeca en (0,0) y los dedos hacia +y; el pulgar, hacia −x (el brazo
     derecho las refleja). Cada dedo lleva su contorno y sus pliegues: es lo que hace que una mano
     se lea como una mano.
     LA QUE SEÑALA es un indice de verdad: sale del borde de la mano que da al pulgar, no del
     centro; el pulgar se ve, abierto; y los otros tres dedos van doblados y marcados, uno a uno.
     Un puño con un solo dedo recto en el centro se lee como otra cosa (Jerome, 10-11-2026:
     «cuando muestra algo parece que está haciendo 🖕»). tools/auditar_tour.js mira que siga asi. */
  var MANO = 1.14;                     // el tamaño de la mano sobre su dibujo: un poco grande, de presentador
  var INDICE_X = -10.4;                // el indice, desplazado del eje de la mano hacia el pulgar (sin escalar)
  var DEDO = 56 * MANO;                // de la muñeca a la yema del indice que señala
  function dedo(cx, y0, w, l, rot, clase) {
    var r = w / 2;
    return '<rect' + (clase ? ' class="' + clase + '"' : '') + ' x="' + (cx - r).toFixed(1) + '" y="' + y0 + '" width="' + w + '" height="' + l + '" rx="' + r.toFixed(2) + '"' +
      (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + y0 + ')"' : '') + '/>';
  }
  /* las rayitas de las falanges de un dedo */
  function pliegues(cx, y0, w, l, rot, donde) {
    var a = w / 2 - 1.7;
    return '<g' + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + y0 + ')"' : '') + '>' + donde.map(function (f) {
      return '<path d="M' + (cx - a).toFixed(1) + ',' + (y0 + l * f).toFixed(1) + ' q' + a.toFixed(1) + ',1.6 ' + (2 * a).toFixed(1) + ',0"/>'; }).join('') + '</g>';
  }
  function manos(piel) {
    var T = ' stroke="' + C.pielT + '" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"';
    var R = '<g fill="none" stroke="' + C.pielT + '" stroke-width="1.05" stroke-linecap="round" opacity=".5">';
    /* la palma con su pulgar, de una pieza: el pulgar sale del canto de la mano */
    var PALMA = 'M-9.4,-3.5 C-13,-1 -17,3 -21,7.5 C-24,10.5 -29,14.5 -32.1,18.3 A5.2,5.2 0 0 0 -25.9,26.7 L-15.6,19 L-15.3,25 Q-15,29.5 -10.5,29.5 L11,29.5 Q15,29.5 15,25 L15.2,14 C15.4,7 13,1 9.4,-3.5z';
    /* la muñeca: tapa la costura entre la mano y el antebrazo */
    var MUNECA = '<rect x="-8.3" y="-7" width="16.6" height="6.2" fill="' + piel + '"/>';
    function abierta(clase, D) {
      return '<g class="tgg-m tgg-m-' + clase + '"' + (clase === 'abierta' ? '' : ' style="display:none"') + '>' +
        '<g fill="' + piel + '"' + T + '>' + D.map(function (d) { return dedo(d[0], 22, d[1], d[2], d[3]); }).join('') + '<path d="' + PALMA + '"/></g>' +
        R + D.map(function (d) { return pliegues(d[0], 22, d[1], d[2], d[3], [0.46, 0.73]); }).join('') +
          '<path d="M-5.5,1 C-12,7 -12.5,17 -8.5,24.5"/><path d="M-9.5,25.6 q10,-6 22,-2.6"/><path d="M-23.5,17.6 q2.6,2 5.2,0.8"/></g>' +
        MUNECA + '</g>';
    }
    return '' +
      /* abierta: saluda, celebra, descansa */
      abierta('abierta', [[-10.6, 8.6, 33, 7], [-3.5, 8.8, 37, 2], [3.7, 8.4, 34, -3], [10.4, 7.4, 27, -9]]) +
      /* la de presentador: los dedos juntos hacia lo que enseña, el pulgar arriba */
      abierta('palma', [[-10.4, 8.6, 33, 1.5], [-3.5, 8.8, 37, 0.5], [3.6, 8.4, 34.5, -0.5], [10.3, 7.4, 28, -2]]) +
      /* la que señala: indice (junto al pulgar), pulgar abierto y tres dedos doblados */
      '<g class="tgg-m tgg-m-senala" style="display:none">' +
        '<g fill="' + piel + '"' + T + '>' +
          dedo(INDICE_X, 20, 9.4, 38, 0, 'tgg-indice') +
          '<path class="tgg-pulgar" d="M-9.4,-3.5 C-13,-2 -17,0.5 -21,4 C-25,7 -28.5,9.5 -31,12.8 A5.3,5.3 0 0 0 -26,22.2 L-15.4,16.4 L-15.2,24 Q-15,27.5 -11,27.5 L10,27.5 Q15.2,27.5 15.2,22.5 L15.2,13 C15.2,6 13,1 9.4,-3.5z"/>' +
          '<rect class="tgg-doblado" x="-5.2" y="15" width="7.2" height="18" rx="3.6"/><rect class="tgg-doblado" x="2" y="15" width="6.9" height="16.2" rx="3.45"/><rect class="tgg-doblado" x="8.9" y="15.5" width="6.1" height="13.1" rx="3.05"/>' +
        '</g>' +
        R + pliegues(INDICE_X, 20, 9.4, 38, 0, [0.5, 0.74]) +
          '<path d="M-3.4,27.4 q1.8,1.2 3.6,0 M3.6,26 q1.8,1.2 3.6,0 M10.2,24.2 q1.6,1 3.2,0"/><path d="M-5,2 C-10,5 -12,9 -12.5,13"/><path d="M-22.6,12.6 q2.4,2.2 5,1.2"/></g>' +
        MUNECA + '</g>' +
      /* el pulgar arriba: el puño de lado, con sus cuatro dedos, y el pulgar hacia +x */
      '<g class="tgg-m tgg-m-pulgar" style="display:none">' +
        '<g fill="' + piel + '"' + T + '>' +
          '<path d="M-9.4,-3.5 C-14,0 -17,5 -17,12 L-17,22 Q-17,27 -12,27 L8,27 Q12.5,27 12.5,22 L12.5,8 C12.5,3 11.5,-1 9.4,-3.5z"/>' +
          '<rect x="4" y="9" width="7.6" height="22" rx="3.8"/><rect x="-3.6" y="10" width="7.6" height="23" rx="3.8"/><rect x="-10.8" y="10" width="7.2" height="22" rx="3.6"/><rect x="-17.2" y="10.5" width="6.4" height="19" rx="3.2"/>' +
          '<path d="M6.5,1 C13,-1.5 23,-4 30,-4.6 A5.4,5.4 0 0 1 31.6,6.1 C25,8 16,10.6 9,12.4 C5,12.6 4,3 6.5,1z"/>' +
        '</g>' +
        R + '<path d="M20,-2.4 q1.6,4.6 0.6,9.4"/><path d="M5.6,24 q2,1.2 4.2,0 M-1.8,25.6 q2,1.2 4.2,0 M-9,24.6 q1.8,1.2 3.8,0 M-15.6,22.6 q1.6,1 3.2,0"/></g>' +
        MUNECA + '</g>';
  }

  /* Un brazo, dibujado colgando: el hombro en (0,0), el codo L1 mas abajo y la muñeca L2 mas.
     Con su forma: el biceps, el antebrazo que se estrecha hacia la muñeca, el codo, y la manga
     con su dobladillo y su pespunte. */
  function brazo(lado, p) {
    var s = lado === 'i' ? 1 : -1;   // la mano se refleja
    var piel = 'url(#' + p('brazo') + ')';
    var T = ' stroke="' + C.pielT + '" stroke-width="1.1" stroke-opacity=".5" stroke-linejoin="round"';
    return '' +
'<g class="tgg-brazo tgg-brazo-' + lado + '">' +
  '<g class="tgg-hueso1">' +
    '<path d="M-16.4,1 C-16.4,-11.5 16.4,-11.5 16.4,1 C17.6,18 15.4,36 13.8,' + (L1 - 2) + ' C13.8,' + (L1 + 10) + ' -13.8,' + (L1 + 10) + ' -13.8,' + (L1 - 2) + ' C-15.4,36 -17.6,18 -16.4,1z" fill="' + piel + '"' + T + '/>' +
    '<g class="tgg-hueso2" transform="translate(0,' + L1 + ')">' +
      '<path d="M-13.6,-1 C-15.6,9 -14.2,28 -10.2,' + (L2 - 2.5) + ' C-10.2,' + (L2 + 4.5) + ' 10.2,' + (L2 + 4.5) + ' 10.2,' + (L2 - 2.5) + ' C14.2,28 15.6,9 13.6,-1z" fill="' + piel + '"' + T + '/>' +
      '<circle r="13.7" fill="' + piel + '"' + T + '/><ellipse rx="12.6" ry="15.6" fill="' + piel + '"/>' +
      /* el brillo del antebrazo y los pliegues del codo y de la muñeca */
      '<path d="M-6.5,8 C-7.5,20 -6.2,32 -4.6,' + (L2 - 8) + '" fill="none" stroke="' + C.pielL + '" stroke-width="3.2" stroke-linecap="round" opacity=".55" transform="scale(' + s + ',1)"/>' +
      '<path d="M-6,2.5 q6,3.2 12,0 M-6.6,' + (L2 - 6) + ' q6.6,2.2 13.2,0" fill="none" stroke="' + C.pielT + '" stroke-width="1.05" stroke-linecap="round" opacity=".38"/>' +
      '<g class="tgg-mano" transform="translate(0,' + L2 + ')"><g transform="scale(' + (MANO * s) + ',' + MANO + ')">' + manos(piel) + '</g></g>' +
    '</g>' +
    /* la sombra de la manga sobre el brazo y, encima, la manga con su dobladillo y su pespunte */
    '<path d="M-15.6,29 Q0,37.5 15.6,29 L15,36.5 Q0,44.5 -15,36.5z" fill="' + C.pielSS + '" opacity=".42"/>' +
    '<path d="M-21.5,-3 C-21.5,-25 21.5,-25 21.5,-3 L19.4,29 Q0,37 -19.4,29z" fill="' + C.camiM + '"/>' +
    '<path d="M7,-19 C15,-15.5 21.5,-11 21.5,-3 L19.4,29 Q13,33 7,34.6z" fill="' + C.camiS + '" opacity=".45" transform="scale(' + s + ',1)"/>' +
    '<path d="M-19.4,29 Q0,37 19.4,29 L19.7,24.2 Q0,32.2 -19.7,24.2z" fill="' + C.camiL + '" opacity=".85"/>' +
    '<path d="M-19.8,21.8 Q0,29.8 19.8,21.8" fill="none" stroke="' + C.camiS + '" stroke-width="1" stroke-dasharray="2.2 2" opacity=".75"/>' +
    '<path d="M-10.5,-14 C-13.8,-2 -13.8,9 -11.6,19 M-2,-17.5 C-3.8,-6 -3.8,6 -2.8,17" fill="none" stroke="' + C.camiS + '" stroke-width="1.3" stroke-linecap="round" opacity=".4" transform="scale(' + s + ',1)"/>' +
    '<path d="M-17,-7.5 C-13.8,-16.5 -4.5,-20.5 4.5,-20.5" fill="none" stroke="' + C.camiL + '" stroke-width="2.3" stroke-linecap="round" opacity=".55" transform="scale(' + s + ',1)"/>' +
  '</g>' +
'</g>';
  }

  /* ── las bocas ── forma (el fondo oscuro), dientes y linea, por visema */
  var BOCAS = {
    cerrada: { f: '', d: '', l: 'M132,170 Q160,190 188,170' },
    sonrisa: { f: 'M129,167 Q160,181 191,167 Q188,197 160,200 Q132,197 129,167z',
               d: 'M132.5,168.5 Q160,182 187.5,168.5 L185.5,180 Q160,191 134.5,180z', l: 'M129,167 Q160,181 191,167' },
    poco:    { f: 'M135,170 Q160,179 185,170 Q182,191 160,193 Q138,191 135,170z',
               d: 'M137.5,171 Q160,179 182.5,171 L181.5,178 Q160,185 138.5,178z', l: 'M135,170 Q160,179 185,170' },
    a:       { f: 'M134,168 Q160,176 186,168 Q188,198 160,201 Q132,198 134,168z',
               d: 'M137,169 Q160,176 183,169 L183,178 Q160,184 137,178z', l: 'M134,168 Q160,176 186,168' },
    o:       { f: 'M145,170 Q160,164 175,170 Q181,187 160,199 Q139,187 145,170z',
               d: 'M148,170.5 Q160,166 172,170.5 L172,174.5 Q160,171 148,174.5z', l: 'M145,170 Q160,164 175,170' },
    e:       { f: 'M130,169 Q160,178 190,169 Q186,191 160,193 Q134,191 130,169z',
               d: 'M133,170 Q160,178 187,170 L185,181 Q160,188 135,181z', l: 'M130,169 Q160,178 190,169' },
    oh:      { f: 'M147,172 Q160,166 173,172 Q177,193 160,197 Q143,193 147,172z', d: '', l: '' },
    /* las de los gestos: la carcajada, la sonrisa con la boca cerrada, la de medio lado, la de
       pensar, la seria y la de los dientes apretados (el apuro y el frio; r, las rayas de los dientes) */
    risa:    { f: 'M126,164 Q160,180 194,164 Q193,204 160,207 Q127,204 126,164z',
               d: 'M129.5,165.5 Q160,181 190.5,165.5 L188.5,178 Q160,190.5 131.5,178z', l: 'M126,164 Q160,180 194,164' },
    contenta:{ f: '', d: '', l: 'M130,170 Q160,195 190,170' },
    pilla:   { f: '', d: '', l: 'M137,177.5 Q161,189 187,168' },
    mm:      { f: '', d: '', l: 'M147,180 Q161,184.5 178,176' },
    seria:   { f: '', d: '', l: 'M139,178 Q160,183.5 181,178' },
    ay:      { f: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z',
               d: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z',
               r: 'M133,180 H187 M147.5,167 V193 M160,166 V194 M172.5,167 V193', l: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z' }
  };


  /* ── EL MUÑECO: muelles para lo que se mueve y un bucle que solo corre mientras se ve ──
     Cada cosa que se mueve (el giro de la cabeza, la mirada, cada ceja, cada parpado, los tres
     angulos de cada brazo) es un muelle con su meta: cambiar de gesto es cambiar las metas, y el
     muelle lleva el dibujo hasta alli sin saltos. Encima van las capas que no paran: respirar,
     parpadear, la boca que habla, la risa que sacude los hombros. Con «reducir movimiento» no hay
     bucle: cada gesto se pinta ya acabado. */
  function Muelle(x, k, c) { this.x = x; this.v = 0; this.t = x; this.k = k; this.c = c; }
  Muelle.prototype.paso = function (dt) {
    var a = -this.k * (this.x - this.t) - this.c * this.v;
    this.v += a * dt; this.x += this.v * dt;
  };
  Muelle.prototype.ya = function () { this.x = this.t; this.v = 0; };
  function entre(v, a, b) { return v < a ? a : v > b ? b : v; }
  function norm180(a) { a = a % 360; if (a > 180) a -= 360; if (a < -180) a += 360; return a; }
  function quieto() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  /* los angulos de un brazo en reposo: [hombro, codo, muneca] */
  var REPOSO = { i: [9, -5, 0], d: [-9, 5, 0] };
  /* la letra que se dice y la boca que le toca */
  function visema(ch) {
    if (!ch) return null;
    var c = ch.toLowerCase();
    if (' \n\t.,;:!?¡¿…—–-«»“”"\'()'.indexOf(c) >= 0) return null;
    if ('aáàâäãåаяą'.indexOf(c) >= 0) return 'a';
    if ('eéèêëęiíìîïyэеиыйě'.indexOf(c) >= 0) return 'e';
    if ('oóòôöõuúùûüоуюёø'.indexOf(c) >= 0) return 'o';
    if ('mbpмбп'.indexOf(c) >= 0) return 'cerrada';
    if (c > '⹿') return ['a', 'e', 'o', 'poco'][ch.charCodeAt(0) % 4];   // chino: una boca por caracter
    return 'poco';
  }

  /* ── los gestos de la cara ──
     boca: la de reposo (cuando no habla); ojos: [izquierdo, derecho], cuanto se abren (0, cerrado; 1,
     normal; mas, de par en par); arco: como se comba un ojo cerrado (hacia arriba, de risa);
     entorna: cuanto sube el parpado de abajo (la sonrisa); cejas: [sube la izquierda, gira su punta
     de dentro, sube la derecha, gira la suya] (la punta de dentro hacia arriba, en grados, es apuro o
     cariño; hacia abajo, picardia o ceño); rubor; ladea: la cabeza, en grados; mira: hacia donde, si
     no esta señalando; fx: lo que le sale al lado; y lo que hace el cuerpo: bote, tirita, baila. */
  var EMO = {
    contento:  { boca: 'sonrisa', entorna: 0.25 },
    risa:      { boca: 'risa', ojos: [0, 0], arco: 9, cejas: [3.5, 4, 3.5, 4], rubor: 0.44, entorna: 1, fx: 'lagrima', bote: 1 },
    guino:     { boca: 'sonrisa', ojos: [1, 0], arco: 7, cejas: [4, 0, -1.5, -4], entorna: 0.5, ladea: 5 },
    picaro:    { boca: 'pilla', ojos: [0.74, 0.74], cejas: [4.5, 0, -1, -6], entorna: 0.45, ladea: -4 },
    asombro:   { boca: 'oh', ojos: [1.24, 1.24], cejas: [6.5, 3, 6.5, 3], entorna: -0.25, fx: 'chispas' },
    ilusion:   { boca: 'risa', ojos: [1.14, 1.14], cejas: [4.5, 2, 4.5, 2], rubor: 0.36, fx: 'chispas', bote: 1 },
    pensativo: { boca: 'mm', cejas: [5, -2, -0.5, -6], mira: [0.75, -0.9], ladea: -6, fx: 'duda' },
    serio:     { boca: 'seria', cejas: [0.6, 6, 0.6, 6], rubor: 0.12 },
    carino:    { boca: 'contenta', ojos: [0.86, 0.86], cejas: [1.6, 7, 1.6, 7], entorna: 0.85, rubor: 0.5, fx: 'corazon' },
    apuro:     { boca: 'ay', ojos: [1.08, 1.08], cejas: [3.4, 12, 3.4, 12], rubor: 0.4, fx: 'gota' },
    frio:      { boca: 'ay', ojos: [0.8, 0.8], cejas: [1.4, 12, 1.4, 12], entorna: 0.5, fx: 'vaho', tirita: 1 },
    fiesta:    { boca: 'risa', cejas: [3, 2, 3, 2], rubor: 0.34, fx: 'notas', baila: 1 }
  };

  /* los dos parpados de un ojo, como dos curvas: a, cuanto se abre; b, cuanto sube el de abajo;
     arco, hacia donde se comba la raya cuando el ojo esta cerrado; fuera, de que lado cae el rabillo */
  function ojoFormas(x, a, b, arco, fuera) {
    var y = 134, l = x - 11.5, r = x + 11.5, ab = a > 1 ? 1 : a, c = 1 - ab;
    var t = y - 16 * a - arco * c, f = y + 14 * (1 - 0.5 * b) * ab - arco * c;
    var n = function (v) { return v.toFixed(1); };
    var top = 'M' + l + ',' + y + ' C' + (x - 8) + ',' + n(t) + ' ' + (x + 8) + ',' + n(t) + ' ' + r + ',' + y;
    return {
      hueco: top + ' C' + (x + 8) + ',' + n(f) + ' ' + (x - 8) + ',' + n(f) + ' ' + l + ',' + y + 'z',
      sombra: top + ' C' + (x + 8) + ',' + n(t + 7.5) + ' ' + (x - 8) + ',' + n(t + 7.5) + ' ' + l + ',' + y + 'z',
      parpado: top + (fuera < 0 ? ' M' + l + ',' + y + ' l-2.4,-1.5' : ' M' + r + ',' + y + ' l2.4,-1.5'),
      bajo: ab > 0.3 ? 'M' + (l + 2) + ',' + (y + 1) + ' C' + (x - 7) + ',' + n(f + 1) + ' ' + (x + 7) + ',' + n(f + 1) + ' ' + (r - 2) + ',' + (y + 1) : '',
      pliegue: 'M' + (l + 1.5) + ',' + (y - 3.6) + ' C' + (x - 8) + ',' + n(t - 4.6) + ' ' + (x + 8) + ',' + n(t - 4.6) + ' ' + (r - 1.5) + ',' + (y - 3.6)
    };
  }

  function crearJero(opc) {
    opc = opc || {};
    var u = 'tgg' + (++N);
    var caja = document.createElement('div');
    caja.className = 'tgg-jero';
    caja.innerHTML = svgTexto(u);
    var svg = caja.firstChild;
    var q = function (s) { return svg.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); };
    var R = {
      salto: qa('.tgg-salto'), cabeza: q('.tgg-cabeza'), cuerpo: q('.tgg-cuerpo'), cejaI: q('.tgg-ceja-i'), cejaD: q('.tgg-ceja-d'),
      iris: qa('.tgg-iris'), rubor: qa('.tgg-rubor'), patas: q('.tgg-patas'), ojo: {},
      bocaF: q('.tgg-boca-fondo'), bocaD: q('.tgg-dientes'), bocaL: q('.tgg-boca-linea'), bocaR: q('.tgg-boca-rayas'), bocaClip: q('.tgg-boca-forma'), lengua: qa('.tgg-lengua'),
      hueco: q('.tgg-hueco-brazos'), fuera: q('.tgg-brazos-fuera'),
      brazo: { i: q('.tgg-brazo-i'), d: q('.tgg-brazo-d') }
    };
    ['i', 'd'].forEach(function (k) {
      var b = R.brazo[k], o = q('.tgg-ojo-' + k);
      b.h1 = b.querySelector('.tgg-hueso1'); b.h2 = b.querySelector('.tgg-hueso2'); b.mano = b.querySelector('.tgg-mano');
      b.manos = {}; ['abierta', 'palma', 'senala', 'pulgar'].forEach(function (m) { b.manos[m] = b.querySelector('.tgg-m-' + m); });
      R.ojo[k] = { blanco: o.querySelector('.tgg-ojo-blanco'), hueco: q('.tgg-ojo-hueco-' + k), sombra: o.querySelector('.tgg-ojo-sombra'),
                   parpado: o.querySelector('.tgg-ojo-parpado'), bajo: o.querySelector('.tgg-ojo-bajo'), pliegue: o.querySelector('.tgg-ojo-pliegue') };
    });

    var S = {
      giro: new Muelle(0, 110, 14), cx: new Muelle(0, 110, 14), cy: new Muelle(0, 110, 14),
      mx: new Muelle(0, 360, 30), my: new Muelle(0, 360, 30), salto: new Muelle(0, 320, 13),
      cIy: new Muelle(0, 240, 20), cIr: new Muelle(0, 240, 20), cDy: new Muelle(0, 240, 20), cDr: new Muelle(0, 240, 20),
      aI: new Muelle(1, 420, 30), aD: new Muelle(1, 420, 30), bb: new Muelle(0.25, 200, 22),
      b: { i: [new Muelle(REPOSO.i[0], 150, 17), new Muelle(REPOSO.i[1], 170, 18), new Muelle(0, 190, 19)],
           d: [new Muelle(REPOSO.d[0], 150, 17), new Muelle(REPOSO.d[1], 170, 18), new Muelle(0, 190, 19)] }
    };
    var st = {
      mano: { i: 'abierta', d: 'abierta' }, dentro: { i: true, d: true }, quiereDentro: { i: true, d: true },
      boca: 'sonrisa', bocaBase: 'sonrisa', emo: '', e: EMO.contento, rubor: 0.24, cejaMas: 0, giroBase: 0,
      t: 0, parp: 0, parpT: -1, proxParp: 1.6, saluda: 0, mira: null, ojeada: 3, hablaHasta: 0, bocaT: 0, golpe: 0, sacude: 0, dx: 0, dy: 0, dg: 0,
      vivo: false, raf: 0, antes: 0, pintado: {}
    };

    function atr(n, k, v) { if (st.pintado[k] !== v) { st.pintado[k] = v; n.setAttribute('transform', v); } }
    function pintar() {
      var t = st.t, resp = Math.sin(t * 1.7), vaiven = Math.sin(t * 0.63);
      var cy = S.cy.x + resp * 1.1 + st.dy, giro = S.giro.x + vaiven * 0.9 + st.dg;
      var sa = 'translate(0,' + (-S.salto.x).toFixed(2) + ')';
      if (st.pintado.sa !== sa) { st.pintado.sa = sa; R.salto.forEach(function (g) { g.setAttribute('transform', sa); }); }
      atr(R.cabeza, 'cab', 'translate(' + (S.cx.x + st.dx).toFixed(2) + ',' + cy.toFixed(2) + ') rotate(' + giro.toFixed(2) + ' 160 214)');
      atr(R.cuerpo, 'cue', 'translate(' + (st.dx * 0.6).toFixed(2) + ',' + (resp * 0.9 + st.dy * 0.7).toFixed(2) + ')');
      atr(R.cejaI, 'ci', 'translate(0,' + (-S.cIy.x).toFixed(2) + ') rotate(' + S.cIr.x.toFixed(2) + ' 130 104)');
      atr(R.cejaD, 'cd', 'translate(0,' + (-S.cDy.x).toFixed(2) + ') rotate(' + S.cDr.x.toFixed(2) + ' 190 104)');
      /* los ojos: los parpados son curvas que se vuelven a trazar cuando cambian */
      var ojos = st.e.ojos || [1, 1], entorna = entre(S.bb.x, -0.5, 1.2), bb = entorna.toFixed(2);
      ['i', 'd'].forEach(function (k, n) {
        var a = entre((n ? S.aD.x : S.aI.x) * (1 - st.parp), 0, 1.4), arco = ojos[n] < 0.2 ? (st.e.arco || 0) : -9;
        var clave = a.toFixed(2) + '|' + bb + '|' + arco;
        if (st.pintado['o' + k] === clave) return;
        st.pintado['o' + k] = clave;
        var F = ojoFormas(n ? 189 : 131, a, entorna, arco, n ? 1 : -1), o = R.ojo[k];
        o.blanco.setAttribute('d', F.hueco); o.hueco.setAttribute('d', F.hueco); o.sombra.setAttribute('d', F.sombra);
        o.parpado.setAttribute('d', F.parpado); o.bajo.setAttribute('d', F.bajo); o.pliegue.setAttribute('d', F.pliegue);
      });
      var ir = 'translate(' + (S.mx.x * 3.4).toFixed(2) + ',' + (S.my.x * 2.8).toFixed(2) + ')';
      if (st.pintado.ir !== ir) { st.pintado.ir = ir; R.iris.forEach(function (g) { g.setAttribute('transform', ir); }); }
      if (st.pintado.rubor !== st.rubor) {
        st.pintado.rubor = st.rubor;
        R.rubor.forEach(function (g) { g.setAttribute('opacity', st.rubor); });
        R.patas.setAttribute('opacity', entre(0.15 + 0.5 * (st.e.entorna || 0), 0, 0.7).toFixed(2));
      }
      if (st.pintado.boca !== st.boca) {
        st.pintado.boca = st.boca;
        var b = BOCAS[st.boca] || BOCAS.sonrisa;
        R.bocaF.setAttribute('d', b.f); R.bocaClip.setAttribute('d', b.f); R.bocaD.setAttribute('d', b.d); R.bocaL.setAttribute('d', b.l); R.bocaR.setAttribute('d', b.r || '');
        R.lengua.forEach(function (g) { g.style.display = b.f && !b.r ? '' : 'none'; });
      }
      ['i', 'd'].forEach(function (k) {
        var g = R.brazo[k], h = HOMBRO[k], m = S.b[k];
        var destino = st.dentro[k] ? R.hueco : R.fuera;
        if (g.parentNode !== destino) destino.appendChild(g);
        atr(g, 'b' + k, 'translate(' + (h[0] + st.dx * 0.6).toFixed(2) + ',' + (h[1] + (st.dentro[k] ? 0 : resp * 0.9) + st.dy * 0.7).toFixed(2) + ')');
        atr(g.h1, 'b1' + k, 'rotate(' + m[0].x.toFixed(2) + ')');
        atr(g.h2, 'b2' + k, 'translate(0,' + L1 + ') rotate(' + m[1].x.toFixed(2) + ')');
        atr(g.mano, 'b3' + k, 'translate(0,' + L2 + ') rotate(' + m[2].x.toFixed(2) + ')');
        if (g._mano !== st.mano[k]) { g._mano = st.mano[k]; for (var n in g.manos) g.manos[n].style.display = n === st.mano[k] ? '' : 'none'; }
      });
    }

    function todos(f) {
      [S.giro, S.cx, S.cy, S.mx, S.my, S.salto, S.cIy, S.cIr, S.cDy, S.cDr, S.aI, S.aD, S.bb].concat(S.b.i, S.b.d).forEach(f);
    }
    function cuadro(ahora) {
      if (!st.vivo) return;
      var dt = Math.min(0.05, Math.max(0, (ahora - st.antes) / 1000)); st.antes = ahora; st.t += dt;
      var t = st.t;
      /* el parpadeo: de vez en cuando, y a veces doble */
      if (st.parpT < 0 && t > st.proxParp) st.parpT = 0;
      if (st.parpT >= 0) {
        st.parpT += dt;
        var f = st.parpT / 0.15;
        st.parp = f < 0.5 ? f * 2 : f < 1 ? 2 - f * 2 : 0;
        if (f >= 1) { st.parpT = -1; st.parp = 0; st.proxParp = t + (Math.random() < 0.22 ? 0.18 : 2.2 + Math.random() * 3.4); }
      }
      /* el saludo: el antebrazo va y viene */
      if (st.saluda > 0) {
        st.saluda -= dt;
        S.b.i[1].t = 78 + Math.sin(t * 11.5) * 19;
        S.b.i[2].t = -6 + Math.sin(t * 11.5 + 0.8) * 9;
        if (st.saluda <= 0) { if (st.trasSaludo) st.trasSaludo(); }
      }
      /* señalar: un toquecito del dedo de vez en cuando */
      if (st.apunta) {
        st.golpe -= dt;
        if (st.golpe <= 0) { st.golpe = 2.6 + Math.random() * 1.6; S.b[st.apunta.lado][1].v += st.apunta.lado === 'i' ? 150 : -150; }
      }
      /* la mirada: al sitio que señala o, si no, a donde pide el gesto o a quien mira, con alguna ojeada */
      if (!st.mira && !st.e.mira) {
        st.ojeada -= dt;
        if (st.ojeada <= 0) {
          st.ojeada = 2.4 + Math.random() * 3;
          var lejos = Math.random() < 0.45;
          S.mx.t = lejos ? (Math.random() - 0.5) * 1.1 : 0; S.my.t = lejos ? (Math.random() - 0.5) * 0.5 : 0;
        }
      }
      /* la boca que habla sin letras que seguir (la voz): una boca cada poco */
      if (st.hablaHasta > t) {
        st.bocaT -= dt;
        if (st.bocaT <= 0) { st.bocaT = 0.085 + Math.random() * 0.06; st.boca = ['a', 'poco', 'e', 'o', 'poco', 'cerrada', 'e', 'a'][Math.floor(Math.random() * 8)]; }
      } else if (st.hablaHasta) { st.hablaHasta = 0; st.boca = st.bocaBase; }
      /* lo que hace el cuerpo con el gesto: la risa sacude los hombros, el frio hace tiritar, la fiesta, bailar */
      st.dx = 0; st.dy = 0; st.dg = 0;
      if (st.sacude > 0) { st.sacude -= dt; st.dy = Math.sin(t * 26) * 1.7 * Math.min(1, st.sacude / 0.35); }
      if (st.e.tirita) st.dx = Math.sin(t * 41) * 1.15;
      if (st.e.baila) { st.dg = Math.sin(t * 5.2) * 4.2; st.dx = Math.sin(t * 5.2) * 2.4; st.dy = Math.abs(Math.sin(t * 5.2)) * -1.6; }
      /* el brazo que vuelve al reposo se mete en el aro cuando ya ha llegado */
      ['i', 'd'].forEach(function (k) {
        if (st.quiereDentro[k] && !st.dentro[k] && Math.abs(S.b[k][0].x - S.b[k][0].t) < 5 && Math.abs(S.b[k][0].v) < 60) st.dentro[k] = true;
      });
      /* los muelles, a pasos cortos: con el movil lento (un cuadro cada 50 ms) un paso entero
         desboca a los mas rigidos (los parpados se iban al techo) */
      var trozos = Math.ceil(dt / 0.012) || 1, dtt = dt / trozos;
      for (var z = 0; z < trozos; z++) todos(function (m) { m.paso(dtt); });
      pintar();
      st.raf = requestAnimationFrame(cuadro);
    }
    function asentar() { todos(function (m) { m.ya(); }); ['i', 'd'].forEach(function (k) { st.dentro[k] = st.quiereDentro[k]; }); st.dx = st.dy = st.dg = 0; pintar(); }
    function tras() { if (!st.vivo) asentar(); }

    function brazo(k, a, mano, fuera) {
      var m = S.b[k]; m[0].t = a[0]; m[1].t = a[1]; m[2].t = a[2] || 0;
      st.mano[k] = mano || 'abierta';
      st.quiereDentro[k] = !fuera;
      if (fuera) st.dentro[k] = false;
    }
    /* las cejas, la cabeza y la mirada: lo que pide el gesto de la cara y, encima, lo que pide el del cuerpo */
    function cejas(mas) { var c = st.e.cejas || [0, 0, 0, 0]; st.cejaMas = mas || 0; S.cIy.t = c[0] + st.cejaMas; S.cIr.t = -c[1]; S.cDy.t = c[2] + st.cejaMas; S.cDr.t = c[3]; }
    function ladear(g) { st.giroBase = g || 0; S.giro.t = st.giroBase + (st.e.ladea || 0); }
    function mirada() { var m = st.e.mira; S.mx.t = m ? m[0] : 0; S.my.t = m ? m[1] : 0; }
    /* donde cae en la pagina un punto del dibujo */
    function aPagina(x, y) {
      var r = svg.getBoundingClientRect(), k = r.width / 320;
      return { x: r.left + x * k, y: r.top + y * k, k: k };
    }
    /* los angulos para señalar un punto de la pagina con un brazo, y donde queda la punta del dedo */
    function haciaPunto(lado, px, py) {
      var h = aPagina(HOMBRO[lado][0], HOMBRO[lado][1]), k = h.k || 1;
      var a = Math.atan2(py - h.y, px - h.x) * 180 / Math.PI - 90, a1;
      if (lado === 'i') { while (a < -40) a += 360; while (a > 320) a -= 360; a1 = entre(a - 15, 14, 205); }
      else { while (a > 40) a -= 360; while (a < -320) a += 360; a1 = entre(a + 15, -205, -14); }
      /* nunca por delante de la cara: hacia arriba, la mano sube por su lado de la cabeza (un
         dedo en la frente es otro gesto); la estela une la yema con lo que se señala */
      a1 = lado === 'i' ? Math.min(a1, 168) : Math.max(a1, -168);
      var r1 = (a1 + 90) * Math.PI / 180;
      var ex = h.x + Math.cos(r1) * L1 * k, ey = h.y + Math.sin(r1) * L1 * k;
      var a2 = norm180(Math.atan2(py - ey, px - ex) * 180 / Math.PI - 90 - a1);
      a2 = lado === 'i' ? Math.min(entre(a2, -24, 150), 168 - a1) : Math.max(entre(a2, -150, 24), -168 - a1);
      /* la yema del indice: al final de la mano y a un lado de su eje, hacia el pulgar */
      var r2 = (a1 + a2 + 90) * Math.PI / 180, largo = (L2 + DEDO) * k, lat = INDICE_X * MANO * (lado === 'i' ? 1 : -1) * k;
      return { a: [a1, a2, 0], punta: { x: ex + Math.cos(r2) * largo + Math.sin(r2) * lat, y: ey + Math.sin(r2) * largo - Math.cos(r2) * lat } };
    }
    function apuntar(px, py, mano) {
      var c = aPagina(160, 133);
      var lado = px < c.x ? 'i' : 'd', otro = lado === 'i' ? 'd' : 'i';
      var r = haciaPunto(lado, px, py);
      st.saluda = 0;
      brazo(otro, REPOSO[otro], 'abierta', false);
      brazo(lado, r.a, mano, true);
      st.apunta = { lado: lado, x: px, y: py, mano: mano }; st.golpe = 1.4;
      api.mirar(px, py);
      tras();
      return r.punta;
    }

    var api = {
      el: caja, svg: svg,
      /* arranca o para el bucle (no corre si no se ve) */
      vivir: function (si) {
        si = !!si && !quieto();
        if (si === st.vivo) { if (!si) asentar(); return; }
        st.vivo = si;
        if (si) { st.antes = performance.now(); st.raf = requestAnimationFrame(cuadro); }
        else { cancelAnimationFrame(st.raf); asentar(); }
      },
      reposo: function () {
        st.apunta = null; st.saluda = 0; st.mira = null;
        brazo('i', REPOSO.i, 'abierta', false); brazo('d', REPOSO.d, 'abierta', false);
        ladear(0); S.cx.t = 0; mirada(); cejas(0);
        tras();
      },
      saludar: function (seg) {
        st.apunta = null;
        brazo('d', REPOSO.d, 'abierta', false);
        brazo('i', [116, 78, -6], 'abierta', true);
        ladear(-5); cejas(2.5);
        st.saluda = seg || 2.2;
        st.trasSaludo = function () { S.b.i[1].t = 78; S.b.i[2].t = -6; };
        tras();
      },
      /* señala con el indice un punto de la PAGINA (clientX, clientY) y lo mira */
      senalar: function (px, py) { return apuntar(px, py, 'senala'); },
      /* lo mismo con la mano abierta, de presentador: para enseñar algo grande */
      mostrar: function (px, py) { return apuntar(px, py, 'palma'); },
      mirar: function (px, py) {
        var c = aPagina(160, 133), d = 150 * (c.k || 1);
        var dx = entre((px - c.x) / d, -1, 1), dy = entre((py - c.y) / d, -1, 1);
        st.mira = { x: px, y: py };
        S.mx.t = dx; S.my.t = dy; ladear(dx * 6); S.cx.t = dx * 2.5; cejas(dy < -0.3 ? 2.2 : 0);
        tras();
      },
      presentar: function () {
        st.apunta = null; st.saluda = 0; st.mira = null;
        brazo('i', [44, 46, 8], 'abierta', true); brazo('d', [-44, -46, -8], 'abierta', true);
        ladear(0); S.cx.t = 0; mirada(); cejas(2);
        tras();
      },
      pulgar: function () {
        st.apunta = null; st.saluda = 0; st.mira = null;
        brazo('d', REPOSO.d, 'abierta', false);
        brazo('i', [22, -142, 30], 'pulgar', false);
        ladear(4); mirada(); cejas(2);
        tras();
      },
      celebrar: function () {
        st.apunta = null; st.saluda = 0; st.mira = null;
        brazo('i', [152, 22, -4], 'abierta', true); brazo('d', [-152, -22, 4], 'abierta', true);
        ladear(0); S.mx.t = 0; S.my.t = -0.3; cejas(3);
        api.saltar();
        tras();
      },
      saltar: function () { if (st.vivo) S.salto.v += 150; },
      /* el gesto de la cara: uno de los de EMO (contento, risa, guino, picaro, asombro, ilusion,
         pensativo, serio, carino, apuro, frio, fiesta). Lo que no conoce es «contento». */
      emocion: function (n) {
        var e = EMO[n] || EMO.contento, o = e.ojos || [1, 1];
        n = EMO[n] ? n : 'contento';
        var cambia = st.emo !== n;
        st.emo = n; st.e = e;
        S.aI.t = o[0]; S.aD.t = o[1]; S.bb.t = e.entorna || 0;
        cejas(st.cejaMas); S.giro.t = st.giroBase + (e.ladea || 0);
        if (!st.mira) mirada();
        st.bocaBase = e.boca || 'sonrisa'; if (!st.hablaHasta) st.boca = st.bocaBase;
        st.rubor = e.rubor == null ? 0.24 : e.rubor; st.pintado.rubor = null;
        if (cambia && e.bote && st.vivo) { api.saltar(); st.sacude = e.boca === 'risa' && !o[0] ? 1.5 : 0; }
        caja.setAttribute('data-fx', e.fx || ''); caja.setAttribute('data-emo', n);
        tras();
      },
      animo: function (a) { api.emocion(a); },
      /* la boca de una letra (la maquina de escribir del bocadillo la va llamando). Los signos
         tambien se notan: con una exclamacion suben las cejas; con una pregunta ladea la cabeza */
      letra: function (ch) {
        var v = visema(ch); st.boca = v || st.bocaBase;
        if (st.vivo) { if (ch === '!' || ch === '！') { S.cIy.v += 70; S.cDy.v += 70; } else if (ch === '?' || ch === '？') S.giro.v += 46; }
        else pintar();
      },
      /* habla sin letras que seguir, tantos segundos (la voz en alto) */
      hablar: function (seg) { st.hablaHasta = st.t + (seg || 0); if (!seg) { st.boca = st.bocaBase; if (!st.vivo) pintar(); } },
      callar: function () { st.hablaHasta = 0; st.boca = st.bocaBase; if (!st.vivo) pintar(); },
      vestir: function (que) {
        var on = function (c, s) { q(c).style.display = s ? '' : 'none'; };
        var gorro = que === 'frontal' || que === 'frontal-rojo', cab = gorro || que === 'gorra';
        on('.tgg-gafas', que !== 'sol' && que !== 'fiesta'); on('.tgg-gafas-sol', que === 'sol');
        on('.tgg-gorro', gorro); on('.tgg-gorra', que === 'gorra'); on('.tgg-antifaz', que === 'fiesta'); on('.tgg-asas', que === 'gorra');
        on('.tgg-cinta', que === 'deporte'); on('.tgg-toalla', que === 'deporte');
        on('.tgg-tupe', !cab);
        var luz = que === 'frontal-rojo' ? '#ff3b30' : '#fff7d6';
        q('.tgg-frontal-luz').setAttribute('fill', luz); q('.tgg-frontal-halo').setAttribute('fill', luz);
        if ((caja.getAttribute('data-atuendo') || '') !== (que || '')) api.saltar();
        caja.setAttribute('data-atuendo', que || '');
      },
      escena: function (n) { caja.setAttribute('data-escena', n || 'noche'); },
      /* la punta del dedo del brazo que señala, en la pagina */
      punta: function () { return st.apunta ? haciaPunto(st.apunta.lado, st.apunta.x, st.apunta.y).punta : null; },
      /* vuelve a calcular el brazo si la tarjeta se ha movido */
      reapuntar: function () { if (st.apunta) return apuntar(st.apunta.x, st.apunta.y, st.apunta.mano); return null; },
      estado: function () { return { mano: st.mano, dentro: st.dentro, boca: st.boca, vivo: st.vivo, apunta: st.apunta, emocion: st.emo, atuendo: caja.getAttribute('data-atuendo') || '', escena: caja.getAttribute('data-escena') }; },
      quitar: function () { api.vivir(false); if (caja.parentNode) caja.parentNode.removeChild(caja); }
    };
    api.escena(opc.escena || 'noche');
    api.emocion('contento');
    pintar();
    return api;
  }

  /* ───────────────────────── el motor ─────────────────────────
     Un tour es una lista de pasos por capitulos. Cada paso señala algo de la
     interfaz de verdad (sel), y antes de señalarlo puede pedir que se abra lo
     que haga falta (ctx, antes). Jérôme vive encima de su bocadillo: lo mira, lo
     señala con el brazo del lado que toca y una estela une el dedo con el foco. */
  var CLAVE_APP = 'tenerife.tour.seen';
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return undefined; } }
  function guardar(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  /* la version vista de un tour. Sin almacenamiento, como visto: no se ofrece en cada arranque.
     Las herramientas guardan «99» en el de la app para saltarlos todos. */
  function visto(tour) {
    var app = leer(CLAVE_APP);
    if (app === undefined) return 99;
    if (Number(app) >= 99) return 99;
    return Number(leer(tour.clave)) || 0;
  }
  function marcarVisto(tour) { if (visto(tour) < tour.version) guardar(tour.clave, tour.version); }

  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function boton(cls, svgIco) {
    var b = el('button', cls); b.type = 'button';
    if (svgIco) b.innerHTML = svgIco;     // dibujos fijos de este fichero, nunca texto de fuera
    return b;
  }
  var ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICO_VOZ = '<svg class="tgg-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/></svg>' +
                '<svg class="tgg-on" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5.5" width="4" height="13" rx="1.2"/><rect x="13.5" y="5.5" width="4" height="13" rx="1.2"/></svg>';

  var M = { abierto: false, tour: null, pasos: [], caps: [], i: 0, ses: 0, voz: false, vozU: null, abrimos: {}, ctx: null,
            escribe: 0, relojes: [], foco: null, tecla: false };
  var D = {};

  function idioma() { try { return currentLang || 'es'; } catch (e) { return (window.TG_GUIA_IDIOMA || 'es'); } }
  /* lo que se cuenta no se escribe: si cambia el numero de lugares, de idiomas, de costas o de lineas, el tour lo dice solo */
  function cifras(extra) {
    var c = { n: 0, L: 0, C: 0, S: M.pasos.length };
    try { c.n = places.length; } catch (e) {}
    try { c.L = nIdiomasListos(); } catch (e) {}
    try { c.C = window.TGO_MAR.costas.length; } catch (e) {}
    /* el rotulo de dos botones que los textos citan, en el idioma de ahora */
    try { c.ver = (LEG_I18N[idioma()] || LEG_I18N.en).tour; } catch (e) { try { c.ver = tx('tourVer'); } catch (e2) {} }
    try { c.llevame = tx('cieloGuiaLlevame'); } catch (e3) {}
    try { c.girar = tx('cuerpoGirar'); c.azar = tx('cuerpoAlAzar'); } catch (e4) {}
    if (window.TG_GUIA_CIFRAS) for (var k0 in window.TG_GUIA_CIFRAS) c[k0] = window.TG_GUIA_CIFRAS[k0];
    if (extra) for (var k in extra) c[k] = extra[k];
    return c;
  }
  function T(clave, extra) {
    var v = cifras(extra);
    try { if (typeof tx === 'function') { var s0 = tx(clave, v); if (s0) return s0; } } catch (e) {}
    /* fuera de la app (la pagina de muestra): la misma regla de tx(), sin plurales por idioma */
    var e = GUIA_UI[clave]; if (!e) return '';
    var s = e[idioma()] || e.en || e.es || '';
    if (v.n !== undefined && s.indexOf('|') >= 0) { var f = s.split('|'); s = f[Number(v.n) === 1 ? 0 : Math.min(1, f.length - 1)]; }
    for (var k in v) s = s.split('{' + k + '}').join(v[k]);
    return s;
  }

  /* el titulo de un paso: su fila kT o, si la app ya tiene ese rotulo, la suya (sin el emoji de delante) */
  function tituloDe(st) {
    var s = T(st.t || st.k + 'T');
    return st.t ? s.replace(/^[^\p{L}\p{N}¡¿«„“「]+/u, '') : s;
  }

  function construir() {
    if (D.root) return;
    ponerEstilos();
    var root = el('div'); root.id = 'v19-tour'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    D.hole = el('div', 'v19t-hole none');
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'tgg-estela'); svg.setAttribute('aria-hidden', 'true');
    D.rastro = document.createElementNS(NS, 'path'); D.rastro.setAttribute('class', 'tgg-rastro');
    /* la chispa: su grupo la lleva al final de la estela y el dibujo de dentro late (la animacion
       es un transform de CSS, que pisaria el del atributo si fueran el mismo nodo) */
    D.chispaG = document.createElementNS(NS, 'g');
    D.chispa = document.createElementNS(NS, 'path'); D.chispa.setAttribute('class', 'tgg-chispa');
    D.chispa.setAttribute('d', 'M0,-9 L2.2,-2.2 L9,0 L2.2,2.2 L0,9 L-2.2,2.2 L-9,0 L-2.2,-2.2z');
    D.chispaG.appendChild(D.chispa);
    svg.appendChild(D.rastro); svg.appendChild(D.chispaG);
    D.unidad = el('div', 'tgg-unidad');
    D.jero = crearJero();
    D.card = el('div', 'v19t-card');
    var cab = el('div', 'tgg-cab');
    D.num = el('span', 'v19t-num');
    var der = el('div', 'tgg-cab-der');
    D.voz = boton('tgg-ico-btn tgg-voz', ICO_VOZ); D.voz.setAttribute('aria-pressed', 'false');
    D.skip = boton('tgg-ico-btn v19t-skip', ICO_X);
    der.appendChild(D.voz); der.appendChild(D.skip);
    cab.appendChild(D.num); cab.appendChild(der);
    D.barra = el('div', 'tgg-barra');
    D.cuerpo = el('div', 'v19t-cuerpo');
    var capL = el('div', 'tgg-cap');
    D.ico = el('span', 'v19t-ico'); D.ico.setAttribute('aria-hidden', 'true');
    D.cap = el('span', 'tgg-cap-txt'); D.nuevo = el('span', 'v19t-nuevo');
    capL.appendChild(D.ico); capL.appendChild(D.cap); capL.appendChild(D.nuevo);
    D.h3 = el('h3');
    D.p = el('p', 'tgg-texto'); D.dicho = el('span', 'tgg-dicho'); D.pordecir = el('span', 'tgg-pordecir');
    D.p.appendChild(D.dicho); D.p.appendChild(D.pordecir);
    /* el aparte de Jérôme: su chiste, debajo del texto y con otra letra */
    D.pc = el('p', 'tgg-chiste'); D.dichoC = el('span', 'tgg-dicho'); D.pordecirC = el('span', 'tgg-pordecir');
    D.pc.appendChild(D.dichoC); D.pc.appendChild(D.pordecirC);
    D.cuerpo.appendChild(capL); D.cuerpo.appendChild(D.h3); D.cuerpo.appendChild(D.p); D.cuerpo.appendChild(D.pc);
    /* para los lectores de pantalla, el paso entero de una vez: lo que se ve se escribe letra a letra */
    D.cuerpo.setAttribute('aria-hidden', 'true');
    D.sr = el('div', 'tgg-sr'); D.sr.setAttribute('aria-live', 'polite');
    var foot = el('div', 'v19t-foot');
    D.back = el('button', 'v19t-back'); D.back.type = 'button';
    D.next = el('button', 'v19t-next'); D.next.type = 'button';
    foot.appendChild(D.back); foot.appendChild(D.next);
    D.card.appendChild(cab); D.card.appendChild(D.barra); D.card.appendChild(D.cuerpo); D.card.appendChild(D.sr); D.card.appendChild(foot);
    D.fiesta = el('div', 'tgg-fiesta'); D.fiesta.setAttribute('aria-hidden', 'true');
    D.unidad.appendChild(D.jero.el); D.unidad.appendChild(D.card);
    root.appendChild(D.hole); root.appendChild(svg); root.appendChild(D.unidad); root.appendChild(D.fiesta);
    document.body.appendChild(root);
    D.root = root;

    D.skip.addEventListener('click', function () { terminar(false); });
    D.next.addEventListener('click', siguiente);
    D.back.addEventListener('click', atras);
    D.voz.addEventListener('click', function () { ponerVoz(!M.voz); });
    /* un toque en el texto lo escribe entero de una vez */
    D.cuerpo.addEventListener('click', function () { if (M.escribe) acabarDeEscribir(); });
    /* deslizar el bocadillo: a la izquierda, el siguiente; a la derecha, el de antes */
    var t0 = null;
    D.card.addEventListener('touchstart', function (e) { var t = e.touches && e.touches[0]; t0 = t ? { x: t.clientX, y: t.clientY, t: Date.now() } : null; }, { passive: true });
    D.card.addEventListener('touchend', function (e) {
      var t = e.changedTouches && e.changedTouches[0]; if (!t0 || !t) return;
      var dx = t.clientX - t0.x, dy = t.clientY - t0.y, dt = Date.now() - t0.t; t0 = null;
      if (Math.abs(dx) > 56 && Math.abs(dy) < 42 && dt < 700) { if (dx < 0) siguiente(); else atras(); }
    }, { passive: true });
    var rz = 0;
    window.addEventListener('resize', function () {
      if (!M.abierto) return;
      clearTimeout(rz); rz = setTimeout(function () { if (M.abierto) situar(M.i, { sinAnimar: true }); }, 120);
    });
    document.addEventListener('keydown', function (e) {
      if (!M.abierto) return;
      if (e.key === 'Escape') { e.stopPropagation(); terminar(false); }
      else if (e.key === 'ArrowRight') siguiente();
      else if (e.key === 'ArrowLeft') atras();
    }, true);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (M.voz) ponerVoz(false); D.jero.vivir(false); }
      else if (M.abierto) D.jero.vivir(true);
    });
    /* el «atras» del movil cierra la pantalla que el tour esta enseñando: el tour no se queda solo encima */
    window.addEventListener('popstate', function () {
      if (M.abierto) setTimeout(function () { if (M.abierto && !sigueVivo()) terminar(false); }, 0);
    });
  }

  /* ── de que esta hecho un tour ── */
  function pasosDe(tour) {
    var pasos = [], caps = [];
    tour.capitulos.forEach(function (cap) {
      var suyos = cap.pasos.filter(function (st) { try { return !st.si || !!st.si(); } catch (e) { return false; } });
      if (!suyos.length) return;
      caps.push({ k: cap.k, nombre: cap.nombre, desde: pasos.length, n: suyos.length });
      suyos.forEach(function (st) { st._cap = caps.length - 1; pasos.push(st); });
    });
    return { pasos: pasos, caps: caps };
  }
  function nombreCap(cap) {
    if (!cap) return '';
    if (typeof cap.nombre === 'function') { try { return cap.nombre() || ''; } catch (e) { return ''; } }
    return cap.k ? T(cap.k) : '';
  }

  /* ── donde esta lo que se señala ── */
  function nodos(sel) {
    try {
      if (typeof sel === 'function') { var r = sel(); return !r ? [] : (r.length !== undefined && !r.tagName ? Array.prototype.slice.call(r) : [r]); }
      return Array.prototype.slice.call(document.querySelectorAll(sel));
    } catch (e) { return []; }
  }
  function seVe(n) {
    if (!n || !n.getBoundingClientRect) return false;
    var r = n.getBoundingClientRect();
    if (!(r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth)) return false;
    try { var cs = getComputedStyle(n); return cs.visibility !== 'hidden' && cs.display !== 'none'; } catch (e) { return true; }
  }
  function rectDe(st) {
    if (!st.sel) return null;
    var ns = nodos(st.sel).filter(seVe);
    if (!ns.length) return null;
    var W = window.innerWidth, H = window.innerHeight, l = 1e9, t = 1e9, r = -1e9, b = -1e9;
    ns.forEach(function (n) { var q = n.getBoundingClientRect(); l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); });
    /* lo que queda dentro de su caja con scroll (el cuerpo de un panel) */
    if (st.dentro) { var c = nodos(st.dentro)[0]; if (c) { var cq = c.getBoundingClientRect(); l = Math.max(l, cq.left); t = Math.max(t, cq.top); r = Math.min(r, cq.right); b = Math.min(b, cq.bottom); } }
    var pad = st.pad != null ? st.pad : 8;
    l = Math.max(l - pad, 3); t = Math.max(t - pad, 3); r = Math.min(r + pad, W - 3); b = Math.min(b + pad, H - 3);
    /* un foco demasiado alto no deja sitio al bocadillo: se queda con lo de arriba (alto: en px o,
       hasta 1, la parte de la pantalla) */
    var tope = st.alto ? (st.alto <= 1 ? Math.round(H * st.alto) : st.alto) : Math.round(H * 0.3);
    if (b - t > tope) b = t + tope;
    if (r - l < 8 || b - t < 8) return null;
    return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t };
  }

  function jeroAncho(heroe, chica, mini) {
    var W = window.innerWidth, H = window.innerHeight;
    if (heroe) return Math.round(H <= 600 ? Math.min(W * 0.44, 150) : Math.min(W * 0.56, 214));
    if (mini) return 58;
    if (chica) return 88;
    return (H <= 600) ? 100 : (W <= 340 ? 108 : 124);
  }
  function listo(si) { D.root.setAttribute('data-listo', si ? '1' : '0'); }
  function reloj(f, ms) { var id = setTimeout(f, ms); M.relojes.push(id); return id; }
  function pararRelojes() { M.relojes.forEach(clearTimeout); M.relojes = []; }

  /* ── los contextos: lo que un paso necesita abierto ── */
  function cambiarContexto(nuevo) {
    var tour = M.tour, viejo = M.ctx, espera = 0;
    if (viejo === nuevo) return 0;
    var cv = viejo && tour.contextos && tour.contextos[viejo], cn = nuevo && tour.contextos && tour.contextos[nuevo];
    /* lo que se cierra al salir tambien tarda: «sale» puede devolver los ms que hay que esperar */
    if (cv && cv.sale) { try { espera = Number(cv.sale(!!M.abrimos[viejo])) || 0; } catch (e) {} M.abrimos[viejo] = false; }
    M.ctx = nuevo || null;
    if (cn && cn.entra) { try { var r = cn.entra(); if (r && r.abrio) M.abrimos[nuevo] = true; espera = Math.max(espera, (r && r.espera) || 0); } catch (e) {} }
    return espera;
  }

  function sigueVivo() { try { return !M.tour || !M.tour.vive || !!M.tour.vive(); } catch (e) { return true; } }
  function ir(i, opc) {
    var st = M.pasos[i]; if (!st) return;
    if (!sigueVivo()) { terminar(false); return; }
    var ses = ++M.ses;
    M.i = i;
    listo(false); pararRelojes(); cortarVoz(); pararEscribir(); quitarEstela();
    D.jero.reposo();
    D.next.classList.remove('tgg-late');
    var espera = cambiarContexto(st.ctx || null), prom = null;
    if (st.antes) { try { prom = st.antes(); } catch (e) { prom = null; } }
    var seguir = function () {
      if (ses !== M.ses || !M.abierto) return;
      if (st.coloca) { try { st.coloca(); } catch (e) {} }
      textos(i, opc);
      situar(i, opc);
      vigilar();
      if (M.voz) decirPaso();
    };
    var tras = function () { if (espera > 0) reloj(seguir, espera); else seguir(); };
    if (prom && typeof prom.then === 'function') {
      /* si lo que se abre no contesta, el tour no se queda colgado */
      var hecho = false, una = function () { if (!hecho) { hecho = true; tras(); } };
      prom.then(una, una); reloj(una, 2500);
    } else tras();
  }

  /* Lo que se señala puede moverse despues de señalarlo: un panel que acaba de pintarse, una
     lista que crece, una imagen que llega. Durante unos segundos se vuelve a colocar (coloca) y
     a medir, y si ha cambiado, el foco y Jérôme lo siguen. */
  function clavo(r) { return r ? [r.left, r.top, r.width, r.height].map(Math.round).join() : ''; }
  function vigilar() {
    var ses = M.ses, veces = 0;
    var mira = function () {
      if (ses !== M.ses || !M.abierto) return;
      var st = M.pasos[M.i];
      if (!sigueVivo()) { terminar(false); return; }
      if (st.coloca) { try { st.coloca(); } catch (e) {} }
      if (clavo(rectDe(st)) !== M.clavo) { listo(false); situar(M.i, { reajuste: true }); }
      if (++veces < 9) reloj(mira, 330);
    };
    reloj(mira, 330);
  }

  function textos(i, opc) {
    var st = M.pasos[i], S = M.pasos.length, cap = M.caps[st._cap], ultimo = i === S - 1;
    var titulo = tituloDe(st), cuerpo = T(st.k + 'P'), chiste = st.chiste ? T(st.k + 'C') : '';
    D.root.setAttribute('aria-label', titulo);
    D.ico.textContent = st.ico || '';
    D.cap.textContent = st.sinCap ? '' : nombreCap(cap);
    D.nuevo.textContent = T('tourNuevo'); D.nuevo.style.display = st.nuevo ? '' : 'none';
    D.num.textContent = (i + 1) + '/' + S;
    D.h3.textContent = titulo;
    D.sr.textContent = (i + 1) + '/' + S + '. ' + titulo + '. ' + cuerpo + (chiste ? ' ' + chiste : '');
    D.skip.setAttribute('aria-label', T('tourSaltar')); D.skip.title = T('tourSaltar');
    D.back.textContent = T('tourAtras'); D.back.style.visibility = (i === 0) ? 'hidden' : '';
    D.next.textContent = ultimo ? T(M.tour.fin || 'tourAExplorar') : T('tourSiguiente');
    var hay = vozHay();
    D.voz.style.display = hay ? '' : 'none';
    D.voz.setAttribute('aria-label', T(M.voz ? 'guiaVozOff' : 'guiaVozOn')); D.voz.title = T(M.voz ? 'guiaVozOff' : 'guiaVozOn');
    /* la barra: un tramo por capitulo, y dentro lo andado */
    var bs = D.barra.children;
    for (var c = 0; c < M.caps.length; c++) {
      var k = M.caps[c], f = i >= k.desde + k.n ? 1 : i < k.desde ? 0 : (i - k.desde + 1) / k.n;
      if (bs[c]) bs[c].firstChild.style.width = Math.round(f * 100) + '%';
    }
    /* Jérôme se viste para el paso */
    D.jero.vestir(st.atuendo || M.tour.atuendo || '');
    D.jero.escena(st.escena || M.tour.escena || 'noche');
    D.jero.emocion(st.emo || 'contento');
    if (!(opc && opc.sinAnimar)) { D.cuerpo.classList.remove('v19t-entra'); void D.cuerpo.offsetWidth; D.cuerpo.classList.add('v19t-entra'); }
    escribir(cuerpo, opc && opc.sinAnimar, chiste, st.emoC || 'guino');
  }

  function situar(i, opc) {
    var st = M.pasos[i], W = window.innerWidth, H = window.innerHeight, m = 10, gap = 10;
    var sinAnimar = !!(opc && opc.sinAnimar) || quieto();
    var r = rectDe(st), heroe = !r;
    M.clavo = clavo(r);
    /* Jérôme va siempre entre su bocadillo y lo que señala: encima del bocadillo si el foco queda
       arriba (uhN) y debajo, asomando hacia el boton, si queda abajo (uhA). Cuando no cabe ni
       encima ni debajo de lo que señala se va apretando, por niveles: 1, el bocadillo compacto;
       2, ademas Jérôme pequeño; 3, Jérôme en miniatura, asomado a la esquina del bocadillo (ya no
       señala con el brazo: mira). Si lo señalado es un trozo de un panel, en cada nivel se prueba
       antes a acortar el foco. Lo ultimo es pisar lo que se señala, y auditar_tour.js lo da por
       fallo. En pantallas de 600 px de alto o menos se empieza en el nivel 1.
       Con la pantalla apaisada y baja (un movil tumbado, 844×390) casi nunca cabe ni encima ni
       debajo, y sobra sitio a los lados: si en vertical no cabe a su tamaño y al lado si, va al
       lado, a la altura de la mano de Jérôme. Y el saludo y la despedida, que no señalan nada, se
       aprietan hasta caber enteros. */
    var nv = 0, jw, uhN, uhA, uh, ch, uw, debajo = false, pisa = false;
    var medir = function () {
      jw = jeroAncho(heroe, nv === 2, nv === 3);
      D.unidad.classList.toggle('heroe', heroe); D.unidad.classList.toggle('compacta', nv >= 1);
      D.unidad.classList.toggle('chica', nv === 2); D.unidad.classList.toggle('mini', nv === 3);
      D.unidad.style.setProperty('--tgg-jw', jw + 'px');
      ch = D.card.offsetHeight; uw = D.unidad.offsetWidth;
      if (nv === 3) uhN = uhA = ch + 20;
      else { uhN = Math.round(jw * 0.972) + ch; uhA = Math.round(jw * 0.856) + ch; }
      uh = uhN;
    };
    if (opc && opc.primero) D.unidad.style.transition = 'none';
    if (!heroe && H <= 600) nv = 1;
    medir();
    var x = (W - uw) / 2, y;
    if (r) {
      var bajo = H - r.bottom - gap - m, alto = r.top - gap - m, recortable = !!(st.dentro || r.height > 120), lado = 0;
      if (W > H && H <= 500 && !(uhN <= bajo || uhA <= alto)) {
        var der = W - r.right - gap - m, izq = r.left - gap - m;
        for (;;) {
          if (uhN <= H - 2 * m) {
            if (uw <= der || uw <= izq) lado = (uw <= der && (der >= izq || uw > izq)) ? 1 : -1;
            else if (recortable || r.width > 240) {
              /* lo que se señala es ancho (una tarjeta, una fila de un panel): se enseña su lado izquierdo y el bocadillo va a la derecha */
              var libreX = W - m - gap - uw - r.left;
              if (libreX >= 120) { r = { left: r.left, top: r.top, right: r.left + libreX, bottom: r.bottom, width: libreX, height: r.height }; lado = 1; }
            }
            break;
          }
          if (nv >= 3) break;
          nv++; medir();
        }
        if (!lado && nv !== 1) { nv = 1; medir(); }
      }
      if (!lado) for (;;) {
        if (uhN <= bajo || uhA <= alto) break;
        if (recortable) {
          var libre = H - m - gap - uhN - r.top;
          if (libre >= (nv === 3 ? 44 : 72)) { r = { left: r.left, top: r.top, right: r.right, bottom: r.top + libre, width: r.width, height: libre }; bajo = H - r.bottom - gap - m; break; }
        }
        if (nv >= 3) break;
        nv++; medir();
      }
      var cabeAbajo = uhN <= bajo, cabeArriba = uhA <= alto;
      if (lado) { x = lado > 0 ? r.right + gap : r.left - gap - uw; y = entre(Math.round((r.top + r.bottom) / 2 - jw * 0.55), m, H - uhN - m); }
      else if (cabeAbajo && (!cabeArriba || (r.top + r.bottom) / 2 < H * 0.55)) y = r.bottom + gap;
      else if (cabeArriba) { debajo = true; uh = uhA; y = r.top - gap - uh; }
      else if (bajo >= alto) { y = Math.max(m, H - uhN - m); pisa = true; }
      else { debajo = true; uh = uhA; y = m; pisa = true; }
      if (W > 600 && !lado) x = entre((r.left + r.right) / 2 - uw / 2, m, W - uw - m);
      D.hole.className = 'v19t-hole';
      D.hole.style.left = r.left + 'px'; D.hole.style.top = r.top + 'px';
      D.hole.style.width = r.width + 'px'; D.hole.style.height = r.height + 'px';
      D.hole.style.borderRadius = (st.r || 14) + 'px';
    } else {
      if (uh > H - 2 * m) { nv = 1; medir(); }
      if (uh > H - 2 * m) { var cabe = Math.floor((H - 2 * m - ch) / 0.972); if (cabe >= 56 && cabe < jw) { jw = cabe; D.unidad.style.setProperty('--tgg-jw', jw + 'px'); uhN = uh = Math.round(jw * 0.972) + ch; } }
      y = Math.max(m, Math.round((H - uh) * 0.42));
      D.hole.style.left = D.hole.style.top = D.hole.style.width = D.hole.style.height = '';
      D.hole.className = 'v19t-hole none';
    }
    if (nv === 3) debajo = false;                 // en miniatura va siempre en la esquina de arriba
    if (D.unidad.classList.contains('abajo') !== debajo) {
      D.unidad.classList.toggle('abajo', debajo);
      if (!sinAnimar) { D.jero.el.classList.remove('tgg-pop'); void D.jero.el.offsetWidth; D.jero.el.classList.add('tgg-pop'); }
    }
    D.unidad.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
    D.root.setAttribute('data-pisa', pisa ? '1' : '0');
    D.root.setAttribute('data-jero', String(nv));
    if (opc && opc.primero) { void D.unidad.offsetWidth; D.unidad.style.transition = ''; }
    var ses = M.ses, miClavo = M.clavo;
    var gesto = function () {
      if (ses !== M.ses || !M.abierto || miClavo !== M.clavo) return;
      if (r) {
        /* el punto que se señala: el centro si es pequeño; si es ancho, lo mas cerca de Jérôme */
        var jc = D.jero.el.getBoundingClientRect(), jx = jc.left + jc.width / 2, jy = jc.top + jc.height * 0.36;
        var px = r.width > 150 ? entre(jx, r.left + 26, r.right - 26) : (r.left + r.right) / 2;
        var py = r.height > 90 ? (jy < r.top ? r.top + 22 : jy > r.bottom ? r.bottom - 22 : (r.top + r.bottom) / 2) : (r.top + r.bottom) / 2;
        /* un boton se señala con el indice; algo grande (una tarjeta, un tramo de pantalla) se enseña con la mano abierta */
        var grande = r.width > Math.min(W * 0.62, 300) && r.height > 64;
        if (nv < 3) ponerEstela(D.jero[grande ? 'mostrar' : 'senalar'](px, py), { x: px, y: py }, r);
        else { D.jero.reposo(); D.jero.mirar(px, py); quitarEstela(); }
        D.hole.classList.remove('tgg-llega'); void D.hole.offsetWidth; D.hole.classList.add('tgg-llega');
      } else if (st.gesto && D.jero[st.gesto]) D.jero[st.gesto]();
      if (st.fiesta && !(opc && opc.reajuste)) fiesta(st.fiesta);
      listo(true);
    };
    /* Nunca en el acto: con «reducir movimiento» la app pone a todo una transicion de 0,01 ms
       (index.html), y lo que se mide en el mismo instante del cambio es todavia lo de antes.
       Dos cuadros despues ya esta todo en su sitio, y Jérôme apunta desde donde de verdad esta. */
    reloj(gesto, sinAnimar ? 50 : (opc && opc.primero ? 260 : 480));
  }

  /* ── la fiesta del ultimo paso: papelillos (o estrellas) que salen de Jérôme ── */
  function fiesta(tipo) {
    if (quieto() || !D.fiesta) return;
    var j = D.jero.el.getBoundingClientRect(), cx = j.left + j.width / 2, cy = j.top + j.height * 0.5;
    var colores = tipo === 'estrellas' ? ['#ffffff', '#F5C76B', '#c9d4ff', '#fff3c4'] : ['#F5C76B', '#ff7a59', '#4fd1c5', '#7dd3fc', '#ffffff', '#ff5d8f'];
    D.fiesta.textContent = '';
    D.fiesta.style.transform = 'translate(' + Math.round(cx) + 'px,' + Math.round(cy) + 'px)';
    for (var k = 0; k < 30; k++) {
      var a = Math.PI * (1.08 + 0.84 * Math.random()), d = 90 + Math.random() * 150, p = el('i', (tipo === 'estrellas' || k % 3 === 0) ? 'tgg-redondo' : '');
      p.style.background = colores[k % colores.length];
      p.style.setProperty('--dx', Math.round(Math.cos(a) * d * 1.15) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(a) * d + 60 + Math.random() * 70) + 'px');
      p.style.setProperty('--giro', Math.round((Math.random() - 0.5) * 900) + 'deg');
      p.style.animationDelay = Math.round(Math.random() * 180) + 'ms';
      D.fiesta.appendChild(p);
    }
    var ses = M.ses;
    setTimeout(function () { if (ses === M.ses && D.fiesta) D.fiesta.textContent = ''; }, 2300);
  }

  /* ── la estela: del dedo al foco ── */
  function quitarEstela() { if (!D.rastro) return; D.rastro.classList.remove('ve'); D.chispa.classList.remove('ve'); }
  function ponerEstela(a, b, r) {
    if (!a) return;
    /* acaba en el borde del foco, no dentro */
    var bx = entre(a.x, r.left, r.right), by = entre(a.y, r.top, r.bottom);
    if (bx === a.x && by === a.y) return;                 // el dedo ya esta dentro
    var qx = b.x * 0.35 + bx * 0.65, qy = b.y * 0.35 + by * 0.65;
    var dx = qx - a.x, dy = qy - a.y, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 30) return;
    var sx = a.x + dx / d * 9, sy = a.y + dy / d * 9, ex = qx - dx / d * 4, ey = qy - dy / d * 4;
    var nx = -dy / d, ny = dx / d, comba = Math.min(46, d * 0.22) * (dx > 0 ? -1 : 1);
    var cx = (sx + ex) / 2 + nx * comba, cy = (sy + ey) / 2 + ny * comba;
    D.rastro.setAttribute('d', 'M' + sx.toFixed(1) + ',' + sy.toFixed(1) + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + ex.toFixed(1) + ',' + ey.toFixed(1));
    D.chispaG.setAttribute('transform', 'translate(' + ex.toFixed(1) + ',' + ey.toFixed(1) + ')');
    D.rastro.classList.add('ve'); D.chispa.classList.add('ve');
  }

  /* ── el texto que se escribe solo ──
     Primero lo que explica el paso; si el paso lleva un aparte (un chiste de Jérôme), una pausa,
     Jérôme cambia de cara y se escribe debajo, con otra letra. */
  function pintarTexto(letras, n) {
    var c = M.corte;
    D.dicho.textContent = letras.slice(0, Math.min(n, c)).join('');
    D.pordecir.textContent = letras.slice(Math.min(n, c), c).join('');
    D.dichoC.textContent = letras.slice(c, Math.max(n, c)).join('');
    D.pordecirC.textContent = letras.slice(Math.max(n, c)).join('');
  }
  function caraDelChiste() { if (M.emoC && !M.yaChiste) { M.yaChiste = true; D.jero.emocion(M.emoC); } }
  function pararEscribir() { if (M.escribe) cancelAnimationFrame(M.escribe); M.escribe = 0; }
  function acabarDeEscribir() { pararEscribir(); if (M.letras) { pintarTexto(M.letras, M.letras.length); caraDelChiste(); } if (!M.voz) D.jero.callar(); }
  function escribir(texto, yaEntero, chiste, emoC) {
    pararEscribir();
    var trozos = function (t) { return Array.from ? Array.from(t) : t.split(''); };
    var letras = trozos(texto), corte = letras.length;
    if (chiste) letras = letras.concat(trozos(chiste));
    M.letras = letras; M.corte = corte; M.emoC = chiste ? emoC : null; M.yaChiste = false;
    D.pc.style.display = chiste ? '' : 'none'; D.p.classList.toggle('tgg-con-chiste', !!chiste);
    if (yaEntero || quieto()) { pintarTexto(letras, letras.length); caraDelChiste(); return; }
    pintarTexto(letras, 0);
    var n = 0, cps = 72, antes = performance.now(), acum = 0, boca = 0, pausa = 0;
    function paso(ahora) {
      var dt = ahora - antes; antes = ahora;
      /* entre el texto y el aparte, un silencio: lo que tarda en cambiarle la cara */
      if (pausa > 0) { pausa -= dt; if (pausa <= 0) caraDelChiste(); M.escribe = requestAnimationFrame(paso); return; }
      acum += dt / 1000 * cps;
      var k = Math.floor(acum);
      if (k > 0) {
        acum -= k;
        var hasta = n < corte ? corte : letras.length;
        n = Math.min(hasta, n + k); pintarTexto(letras, n);
        if (!M.voz && ahora - boca > 78) { boca = ahora; D.jero.letra(letras[n - 1]); }
        if (n === corte && corte < letras.length) { pausa = 460; acum = 0; cps = 56; if (!M.voz) D.jero.callar(); }
      }
      if (n < letras.length) M.escribe = requestAnimationFrame(paso);
      else { M.escribe = 0; if (!M.voz) D.jero.callar(); }
    }
    M.escribe = requestAnimationFrame(paso);
  }

  /* ── en voz alta ──
     Con las voces del propio movil, las mismas de la audioguia de los lugares
     (index.html, TG_VOZ): solo voces instaladas en el dispositivo, asi que lee sin
     red y el texto no sale del movil. Con la voz puesta, Jérôme presenta solo: al
     acabar un paso pasa al siguiente. No se guarda: cada tour empieza callado. */
  var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu;
  function vozHay() {
    var V = window.TG_VOZ;
    if (!V || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return false;
    try { return !V.hayVoces() || !!V.vozLocal(idioma()); } catch (e) { return false; }
  }
  function cortarVoz() {
    M.vozSes = (M.vozSes || 0) + 1;
    if (M.vozU) { M.vozU = null; try { window.speechSynthesis.cancel(); } catch (e) {} }
    if (D.jero) D.jero.callar();
  }
  function decirPaso() {
    var st = M.pasos[M.i]; if (!st || !M.voz) return;
    var V = window.TG_VOZ, s = window.speechSynthesis, ses = M.vozSes, u, v = null;
    var zh = idioma() === 'zh' || idioma() === 'zht';
    var texto = [tituloDe(st), T(st.k + 'P')].concat(st.chiste ? [T(st.k + 'C')] : []).map(function (x) {
      x = String(x || '').replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();
      return /[.!?…。！？]$/.test(x) ? x : x + (zh ? '。' : '.');
    }).join(zh ? '' : ' ');
    try { v = V.vozLocal(idioma()); if (!v && V.hayVoces()) { ponerVoz(false); return; } } catch (e) {}
    try { u = new window.SpeechSynthesisUtterance(texto); } catch (e2) { ponerVoz(false); return; }
    u.lang = V.locale(idioma()); if (v) u.voice = v; u.rate = 1;
    var acabar = function (bien) {
      if (ses !== M.vozSes || M.vozU !== u) return;
      M.vozU = null; D.jero.callar();
      if (!bien) { ponerVoz(false); return; }
      if (M.i < M.pasos.length - 1) reloj(function () { if (M.voz && M.abierto) siguiente(); }, 700);
      else ponerVoz(false);
    };
    u.onstart = function () { if (ses === M.vozSes) D.jero.hablar(600); };
    u.onend = function () { acabar(true); };
    u.onerror = function () { acabar(false); };
    M.vozU = u;
    D.jero.hablar(600);
    try { V.parar(); } catch (e3) {}
    try { if (s.speaking || s.pending) s.cancel(); s.speak(u); } catch (e4) { acabar(false); }
  }
  function ponerVoz(si) {
    si = !!si && vozHay();
    M.voz = si;
    if (D.voz) {
      D.voz.setAttribute('aria-pressed', si ? 'true' : 'false');
      D.voz.setAttribute('aria-label', T(si ? 'guiaVozOff' : 'guiaVozOn')); D.voz.title = T(si ? 'guiaVozOff' : 'guiaVozOn');
    }
    cortarVoz();
    if (si && M.abierto) decirPaso();     // dentro del toque: Safari solo deja empezar a leer ahi
  }

  function siguiente() {
    if (!M.abierto) return;
    if (M.i >= M.pasos.length - 1) { terminar(true); return; }
    ir(M.i + 1);
    try { D.next.focus({ preventScroll: true }); } catch (e) {}
  }
  function atras() { if (M.abierto && M.i > 0) ir(M.i - 1); }

  function terminar(completo) {
    if (!M.abierto) return;
    M.abierto = false; M.ses++;
    pararRelojes(); ponerVoz(false); pararEscribir(); quitarEstela();
    if (D.fiesta) D.fiesta.textContent = '';
    marcarVisto(M.tour);
    cambiarContexto(null);
    if (M.tour.alAcabar) { try { M.tour.alAcabar(!!completo); } catch (e) {} }
    D.root.classList.remove('open');
    D.jero.reposo(); D.jero.vivir(false);
    try { if (M.foco && M.foco.focus && document.contains(M.foco)) M.foco.focus({ preventScroll: true }); } catch (e2) {}
    M.foco = null;
  }

  function iniciar(nombre, opc) {
    var tour = TOURS[nombre]; if (!tour) return false;
    cerrarPregunta(); cerrarMenu();
    /* un globito que llegue tarde (quien toca el boton de Jérôme antes de que salga) no se queda encima de la visita */
    Array.prototype.slice.call(document.querySelectorAll('.tgg-pista')).forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
    Array.prototype.slice.call(document.querySelectorAll('.tgg-llama')).forEach(function (x) { x.classList.remove('tgg-llama'); });
    construir();
    if (M.abierto) terminar(false);
    var pc = pasosDe(tour);
    if (!pc.pasos.length) return false;
    M.tour = tour; M.pasos = pc.pasos; M.caps = pc.caps; M.abrimos = {}; M.ctx = null; M.voz = false;
    D.root.style.zIndex = String(tour.z || 8600);
    D.root.classList.toggle('tgg-oscuro', !!tour.oscuro);
    D.voz.setAttribute('aria-pressed', 'false');
    D.barra.textContent = '';
    M.caps.forEach(function (c) { var s = el('i'); s.style.flexGrow = String(c.n); s.appendChild(el('b')); D.barra.appendChild(s); });
    if (tour.alEmpezar) { try { tour.alEmpezar(); } catch (e) {} }
    M.foco = document.activeElement;
    M.abierto = true;
    D.root.classList.add('open');
    D.jero.vivir(true);
    var desde = 0;
    if (opc && opc.cap != null && M.caps[opc.cap]) desde = M.caps[opc.cap].desde;
    ir(desde, { primero: true });
    D.jero.saltar();
    try { D.next.focus({ preventScroll: true }); } catch (e2) {}
    return true;
  }

  /* ── la pregunta del principio: Jérôme saluda y pregunta si enseña el tour ── */
  var pregunta = null, preguntaJero = null;
  function cerrarPregunta() {
    if (preguntaJero) { preguntaJero.quitar(); preguntaJero = null; }
    if (pregunta && pregunta.parentNode) pregunta.parentNode.removeChild(pregunta);
    pregunta = null;
  }
  function heroe(tour, hijos) {
    var uni = el('div', 'tgg-unidad heroe estatica tgg-entra-heroe');
    uni.style.setProperty('--tgg-jw', jeroAncho(true) + 'px');
    var j = crearJero({ escena: (tour && tour.escena) || 'noche' });
    j.vestir((tour && tour.atuendo) || '');
    var c = el('div', 'v19t-card');
    hijos.forEach(function (h) { if (h) c.appendChild(h); });
    uni.appendChild(j.el); uni.appendChild(c);
    return { uni: uni, jero: j, card: c };
  }
  function ofrecer(nombre) {
    var tour = TOURS[nombre];
    if (!tour || pregunta || menuEl || M.abierto) return false;
    var v = visto(tour);
    if (v >= tour.version) return false;
    ponerEstilos();
    var vuelve = v > 0 && !!tour.oferta.nt;    // vio uno anterior: se le ofrece como novedades
    var S = pasosDe(tour).pasos.length;
    pregunta = el('div', 'v19t-prompt');
    pregunta.setAttribute('role', 'dialog'); pregunta.setAttribute('aria-modal', 'true');
    pregunta.style.zIndex = String(tour.z || 8600);
    var nv = vuelve ? el('span', 'v19t-nuevo', T('tourNuevo')) : null;
    var t = el('h3', null, T(vuelve ? tour.oferta.nt : tour.oferta.t, { S: S }));
    var p = el('p', null, T(vuelve ? tour.oferta.np : tour.oferta.p, { S: S }));
    var fila = el('div', 'v19t-row');
    var no = el('button', 'v19t-ghost', T('tourAhoraNo')); no.type = 'button';
    var si = el('button', 'v19t-next', T('tourVer')); si.type = 'button'; si.style.marginLeft = '0';
    fila.appendChild(no); fila.appendChild(si);
    var h = heroe(tour, [nv, t, p, fila]);
    preguntaJero = h.jero;
    pregunta.setAttribute('aria-label', t.textContent);
    pregunta.appendChild(h.uni);
    document.body.appendChild(pregunta);
    h.jero.vivir(true);
    setTimeout(function () { if (preguntaJero === h.jero) h.jero.saludar(2.4); }, 420);
    setTimeout(function () { if (preguntaJero === h.jero) h.jero.emocion('guino'); }, 3000);
    setTimeout(function () { if (preguntaJero === h.jero) h.jero.emocion('contento'); }, 4500);
    var bajar = setInterval(function () { if (preguntaJero !== h.jero) { clearInterval(bajar); return; } h.jero.saludar(1.8); }, 6500);
    no.addEventListener('click', function () { marcarVisto(tour); cerrarPregunta(); });
    si.addEventListener('click', function () { cerrarPregunta(); iniciar(nombre); });
    pregunta.addEventListener('keydown', function (e) { if (e.key === 'Escape') { marcarVisto(tour); cerrarPregunta(); } });
    try { si.focus({ preventScroll: true }); } catch (e) {}
    return true;
  }

  /* ── el menu: que visita quiere ── */
  var menuEl = null, menuJero = null;
  function cerrarMenu() {
    if (menuJero) { menuJero.quitar(); menuJero = null; }
    if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
    menuEl = null;
  }
  function opcion(ico, titulo, sub, alTocar) {
    var b = el('button', 'tgg-op'); b.type = 'button';
    var i = el('span', 'tgg-op-ico', ico); i.setAttribute('aria-hidden', 'true');
    var tx_ = el('span', 'tgg-op-txt'); tx_.appendChild(el('b', null, titulo)); if (sub) tx_.appendChild(el('span', null, sub));
    var f = el('span', 'tgg-op-fle', '›'); f.setAttribute('aria-hidden', 'true');
    b.appendChild(i); b.appendChild(tx_); b.appendChild(f);
    b.addEventListener('click', alTocar);
    return b;
  }
  function menu() {
    if (menuEl || M.abierto) return false;
    cerrarPregunta(); ponerEstilos();
    menuEl = el('div', 'v19t-prompt tgg-menu');
    menuEl.setAttribute('role', 'dialog'); menuEl.setAttribute('aria-modal', 'true');
    var t = el('h3', null, T('guiaMenuT')), p = el('p', null, T('guiaMenuP'));
    var lista = el('div', 'tgg-lista');
    Object.keys(TOURS).forEach(function (nombre) {
      var tour = TOURS[nombre];
      if (tour.si && !tour.si()) return;
      var pc = pasosDe(tour);
      if (!pc.pasos.length) return;
      lista.appendChild(opcion(tour.ico, T(tour.titulo), T('guiaPasos', { n: pc.pasos.length }), function () { cerrarMenu(); lanzar(nombre); }));
      if (tour.capsEnMenu) {
        var caps = el('div', 'tgg-caps');
        pc.caps.forEach(function (c, ix) {
          var nom = nombreCap(c); if (!nom) return;
          var ch = el('button', 'tgg-chip', nom); ch.type = 'button';
          ch.addEventListener('click', function () { cerrarMenu(); lanzar(nombre, { cap: ix }); });
          caps.appendChild(ch);
        });
        lista.appendChild(caps);
      }
    });
    var fila = el('div', 'v19t-row');
    var no = el('button', 'v19t-ghost', T('guiaMenuCerrar')); no.type = 'button';
    fila.appendChild(no);
    var h = heroe(null, [t, p, lista, fila]);
    h.uni.style.setProperty('--tgg-jw', Math.min(jeroAncho(true), 150) + 'px');
    menuJero = h.jero;
    menuEl.setAttribute('aria-label', t.textContent);
    menuEl.appendChild(h.uni);
    document.body.appendChild(menuEl);
    /* con tres visitas y los capitulos, en un movil pequeño no cabe a su tamaño: se aprieta y Jérôme se encoge */
    if (h.uni.offsetHeight > window.innerHeight - 28) { menuEl.classList.add('tgg-prieto'); h.uni.style.setProperty('--tgg-jw', '92px'); }
    h.jero.vivir(true);
    setTimeout(function () { if (menuJero === h.jero) h.jero.saludar(1.8); }, 380);
    no.addEventListener('click', cerrarMenu);
    menuEl.addEventListener('click', function (e) { if (e.target === menuEl) cerrarMenu(); });
    menuEl.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
    try { var pri = lista.querySelector('button'); if (pri) pri.focus({ preventScroll: true }); } catch (e) {}
    return true;
  }
  /* un tour puede necesitar algo antes de empezar (abrir su panel): lo hace su «prepara» */
  function lanzar(nombre, opc) {
    var tour = TOURS[nombre]; if (!tour) return false;
    var p = null;
    if (tour.prepara) { try { p = tour.prepara(); } catch (e) { p = null; } }
    /* si lo que hay que abrir no llega (sin conexion y sin guardar todavia), se dice */
    if (p && typeof p.then === 'function') { p.then(function () { iniciar(nombre, opc); }, function () { try { showLayerToast(tx('tourSinModulo')); } catch (e) {} }); return true; }
    return iniciar(nombre, opc);
  }

  function repintar() {
    if (M.abierto) { cortarVoz(); textos(M.i, { sinAnimar: true }); situar(M.i, { sinAnimar: true }); if (M.voz) decirPaso(); }
  }

  /* ───────────────────────── los tours ─────────────────────────
     Cada paso: sel (lo que señala: un selector, o una funcion que devuelve el
     nodo o los nodos), k (sus dos filas, kT y kP; t si el titulo es una fila
     que la app ya tiene), ico, lo que Jérôme lleva puesto (atuendo, escena) y la
     cara que pone (emo: uno de los gestos de EMO). Con «chiste», el paso lleva un
     aparte de Jérôme (la fila kC), que se escribe al final con otra cara (emoC).
     «si» decide si el paso existe hoy (un boton que no esta no se enseña); ctx y
     antes abren lo que haga falta antes de señalarlo. */
  function $(id) { return document.getElementById(id); }
  function hay(sel) { var n = nodos(sel); for (var i = 0; i < n.length; i++) if (seVe(n[i])) return true; return false; }
  function panelRutasAbierto() { try { return !!routePanelOpen; } catch (e) { return false; } }
  /* el marcador (o el grupo) que se señala: el de mas arriba de los que se ven enteros, lejos de
     los botones de las esquinas. Debajo queda sitio para Jérôme y su bocadillo. */
  function pinCentral() {
    var W = window.innerWidth, H = window.innerHeight, mejor = null, ym = 1e9;
    var ns = document.querySelectorAll('.leaflet-marker-pane .leaflet-marker-icon');
    for (var i = 0; i < ns.length; i++) {
      var r = ns[i].getBoundingClientRect();
      if (r.width < 8 || r.top < 126 || r.bottom > H * 0.52 || r.left < 70 || r.right > W - 70) continue;
      if (r.top < ym) { ym = r.top; mejor = ns[i]; }
    }
    return mejor;
  }
  function cerrarLoAbierto(menosElCielo) {
    try { if (typeof closeCategorySheet === 'function') closeCategorySheet(); } catch (e) {}
    try { if (typeof closeDetailSheet === 'function') closeDetailSheet(); } catch (e) {}
    try { if (typeof map !== 'undefined' && map && map.closePopup) map.closePopup(); } catch (e) {}
    try { if (typeof closeBusPanel === 'function') closeBusPanel(); } catch (e) {}
    try { if (typeof closeMapLegend === 'function') closeMapLegend(); } catch (e) {}
    try { if (typeof cerrarGasCerca === 'function') cerrarGasCerca(); } catch (e) {}
    if (menosElCielo !== true) { try { if (window.TG_CIELO && window.TG_CIELO.estado.abierto) window.TG_CIELO.cerrar(); } catch (e) {} }
    ['fi-panel', 'mc-panel', 'wx-panel', 'mar-panel'].concat(menosElCielo === true ? [] : ['cielo-panel']).forEach(function (id) { var x = $(id); if (x) x.style.display = 'none'; });
    ['lang-dropdown', 'layers-dropdown'].forEach(function (id) { var x = $(id); if (x) x.classList.remove('open'); });
  }

  var TOURS = {};

  /* ── la app, de arriba abajo ── */
  TOURS.app = {
    clave: CLAVE_APP, version: 3, z: 8600, ico: '🗺️', titulo: 'guiaMenuApp', capsEnMenu: true, escena: 'dia',
    oferta: { t: 'guiaHolaT', p: 'guiaHolaP', nt: 'tourNovT', np: 'guiaNovP' },
    alEmpezar: function () { cerrarLoAbierto(); },
    contextos: {
      /* el panel de rutas, abierto por el tour en la pestaña del paso. Si ya lo
         tenia abierto la persona, el tour no lo cierra al acabar. */
      rutas: {
        entra: function () { if (panelRutasAbierto()) return null; toggleRoutePanel(); return { abrio: true, espera: 260 }; },
        sale: function (loAbrio) { if (loAbrio) { closeRoutePanel(); return 260; } }
      }
    },
    capitulos: [
      { k: 'guiaCapMapa', pasos: [
        { sel: '#search-input-wrap', r: 24, ico: '🔎', k: 'tourBuscar' },
        { sel: '#category-btn', r: 18, ico: '🧭', k: 'tourCat' },
        { sel: '#dice-btn', r: 18, ico: '🎲', k: 'tourDado', emo: 'pensativo', chiste: true, emoC: 'picaro' },
        { sel: '#layers-btn', r: 18, ico: '🗺️', k: 'tourMapa', atuendo: 'gorra' },
        { sel: '#isla3d-btn', r: 22, ico: '🏔️', k: 'tourIsla3d', nuevo: true, atuendo: 'gorra', si: function () { return hay('#isla3d-btn'); }, emo: 'asombro' },
        { sel: pinCentral, r: 26, pad: 10, ico: '📍', k: 'tourPines', t: 'tourMarcadoresT', si: function () { return !!pinCentral(); } },
        { sel: '#map-legend-toggle', r: 20, ico: '🧾', k: 'tourLeyenda', emo: 'guino' }
      ] },
      { k: 'guiaCapHoy', pasos: [
        { sel: '#mc-btn', r: 18, ico: '🌦️', k: 'tourMicro', atuendo: 'sol', chiste: true, emoC: 'risa' },
        { sel: '#mar-btn', r: 18, ico: '🌊', k: 'tourMar', atuendo: 'sol' },
        { sel: '#fi-btn', r: 18, ico: '🎉', k: 'tourFiestas', atuendo: 'fiesta', escena: 'fiesta', emo: 'fiesta', chiste: true, emoC: 'risa' },
        { sel: '#cielo-btn', r: 18, ico: '🔭', k: 'tourCielo', atuendo: 'frontal', escena: 'cielo', emo: 'asombro', chiste: true, emoC: 'apuro' },
        { sel: '#gas-top-btn', r: 18, ico: '⛽', k: 'tourGas' }
      ] },
      { k: 'guiaCapMover', pasos: [
        { sel: '#bus-quick-btn', r: 18, ico: '🚌', k: 'tourGuaguas', chiste: true, emoC: 'guino' },
        { sel: '#v19-nav-routes', r: 14, ico: '🛣️', k: 'tourRutas', emo: 'ilusion' },
        /* los tres pasos de «rutas» abren el panel en su pestaña para señalarla */
        { sel: '#tab-planner', r: 10, ico: '✨', k: 'tourOrganiza', ctx: 'rutas', antes: function () { switchRouteTab('planner'); }, atuendo: 'gorra' },
        { sel: '#tab-day', r: 10, ico: '🗓️', k: 'tourRutaDia', ctx: 'rutas', antes: function () { switchRouteTab('day'); }, atuendo: 'gorra' },
        { sel: '#tab-ab', r: 10, ico: '🅰️', k: 'tourAB', ctx: 'rutas', antes: function () { switchRouteTab('ab'); } }
      ] },
      { k: 'guiaCapViaje', escena: 'tarde', pasos: [
        { sel: '#v19-nav-fav', r: 14, ico: '⭐', k: 'tourFav', escena: 'tarde', emo: 'carino' },
        { sel: '.tg-trophy-fab', r: 18, ico: '🏆', k: 'tourLogros', escena: 'tarde', emo: 'ilusion' },
        { sel: '#v19-nav-chat', r: 14, ico: '💬', k: 'tourAsistente', escena: 'tarde', chiste: true, emoC: 'picaro' },
        { sel: '#v19-nav-account', r: 14, ico: '👤', k: 'tourCuenta', escena: 'tarde' },
        { sel: '#lang-btn', r: 18, ico: '🌐', k: 'tourIdioma', escena: 'tarde', chiste: true, emoC: 'apuro' }
      ] },
      { k: 'guiaCapAcaso', pasos: [
        { sel: '#v19-nav-sos', r: 14, ico: '🛟', k: 'tourSos', nuevo: true, escena: 'noche', emo: 'serio' },
        { sel: '.pwa-fab.visible', r: 18, ico: '📴', k: 'tourOffline', escena: 'noche', si: function () { return hay('.pwa-fab.visible'); } },
        { sel: null, ico: '🌋', k: 'tourFin', escena: 'tarde', gesto: 'celebrar', fiesta: 'confeti', sinCap: true, emo: 'risa' }
      ] }
    ]
  };

  /* ── el cielo de Tenerife, dentro de su panel ── */
  function cielo() { return window.TG_CIELO || null; }
  /* abre el panel en una pestaña; si ya esta en ella, no se repinta */
  function cieloVer(p) {
    try {
      var c = cielo(), e = c.estado;
      if (e.abierto && e.pestana === p && e.datos) return null;
      return c.ver(p);
    } catch (e2) { return null; }
  }
  /* sube lo que se va a señalar hasta arriba del cuerpo del panel */
  function cieloSubir(sel) {
    var c = $('cielo-cuerpo'), n = nodos(sel)[0];
    if (!c || !n) return;
    c.scrollTop += n.getBoundingClientRect().top - c.getBoundingClientRect().top - 6;
  }
  function cieloPaso(p) { return function () { return cieloVer(p); }; }
  function arriba(sel) { return function () { if (sel) cieloSubir(sel); else { var c = $('cielo-cuerpo'); if (c) c.scrollTop = 0; } }; }
  function cieloRojo() { try { return !!cielo().estado.rojo; } catch (e) { return false; } }
  function pes(k) { return function () { try { return tx(k); } catch (e) { return ''; } }; }
  function tarjetaCon(sel) { return function () { var n = document.querySelector('#cielo-cuerpo ' + sel); return n && n.closest ? (n.closest('.cielo-tarjeta') || n) : n; }; }

  TOURS.cielo = {
    clave: 'tenerife.tour.cielo', version: 1, z: 8840, ico: '🔭', titulo: 'cieloTitulo', oscuro: true,
    atuendo: 'frontal', escena: 'cielo', fin: 'tourAExplorar',
    oferta: null,
    /* el panel tiene que estar abierto y con su modulo cargado antes de empezar */
    prepara: function () {
      if (!window.TG_CIELO_CARGAR) return Promise.reject(new Error('cielo'));
      cerrarLoAbierto(true);
      return window.TG_CIELO_CARGAR().then(function () { return cielo().ver('noche'); }).then(function () { return cielo().cargar(); });
    },
    contextos: {
      /* la luz roja se enciende para enseñarla y se apaga al salir del paso, si no estaba ya puesta */
      rojo: {
        entra: function () { if (cieloRojo()) return null; var b = $('cielo-rojo'); if (!b || b.hidden) return null; b.click(); return { abrio: true, espera: 80 }; },
        sale: function (laEncendio) { if (laEncendio && cieloRojo()) { var b = $('cielo-rojo'); if (b) b.click(); return 80; } }
      }
    },
    /* De noche, la primera vez, el panel ofrece la luz roja en una barra encima de su cuerpo (#cielo-pista):
       le quita el sitio a la visita justo cuando mas se va a ver (en 320×568 el bocadillo tapaba lo que
       señalaba). Mientras dura se aparta, con esta clase y su regla en los estilos, y al acabar vuelve tal
       cual, sin darla por vista. Y con la luz roja ya puesta, el regulador de brillo de la cabecera, que en
       un movil estrecho la deja en dos renglones (index.html): tampoco se puede tocar durante la visita. */
    alEmpezar: function () { var p = $('cielo-panel'); if (p) p.classList.add('tgg-de-visita'); },
    alAcabar: function () { try { var p = $('cielo-panel'); if (p) p.classList.remove('tgg-de-visita'); var c = $('cielo-cuerpo'); if (c) c.scrollTop = 0; } catch (e) {} },
    capitulos: [
      { nombre: pes('cieloPesNoche'), pasos: [
        { sel: '#cielo-pestanas', r: 12, pad: 4, ico: '🔭', k: 'guiaCiPestanas', antes: cieloPaso('noche'), coloca: arriba() },
        { sel: '#cielo-cuerpo .cielo-fecha', r: 12, pad: 9, ico: '📅', k: 'guiaCiNoche', antes: cieloPaso('noche'), coloca: arriba() },
        { sel: tarjetaCon('.cielo-indice'), dentro: '#cielo-cuerpo', r: 14, pad: 2, ico: '🌙', k: 'guiaCiIndice', t: 'cieloIndice', antes: cieloPaso('noche'), coloca: arriba('.cielo-indice'), emo: 'pensativo' },
        { sel: '#cielo-guia', dentro: '#cielo-cuerpo', r: 14, pad: 2, ico: '🌠', k: 'guiaCiGuiada', t: 'cieloGuiaNoche', antes: cieloPaso('noche'), coloca: arriba('#cielo-guia'), emo: 'ilusion' },
        { sel: '#cielo-cuerpo [data-guia="planetas"]', dentro: '#cielo-cuerpo', r: 14, pad: 2, ico: '🪐', k: 'guiaCiPlanetas', t: 'cieloPlanetas', antes: cieloPaso('noche'), coloca: arriba('#cielo-cuerpo [data-guia="planetas"]'), chiste: true, emoC: 'picaro' }
      ] },
      { nombre: pes('cieloPesCalendario'), pasos: [
        { sel: '#cielo-cuerpo .cielo-chips, #cielo-cuerpo .cielo-tarjeta', dentro: '#cielo-cuerpo', r: 14, pad: 2, ico: '☄️', k: 'guiaCiCalendario', antes: cieloPaso('calendario'), coloca: arriba(), emo: 'asombro' }
      ] },
      { nombre: pes('cieloPesCatalogo'), pasos: [
        { sel: '#cielo-cuerpo .cielo-busca, #cielo-cuerpo .cielo-chips', dentro: '#cielo-cuerpo', r: 14, pad: 4, ico: '✨', k: 'guiaCiCatalogo', antes: cieloPaso('catalogo'), coloca: arriba() }
      ] },
      { nombre: pes('cieloPesMapa'), pasos: [
        { sel: '#cielo-cuerpo .cielo-mapa-caja', dentro: '#cielo-cuerpo', r: 14, pad: 2, ico: '🗺️', k: 'guiaCiCarta', antes: cieloPaso('mapa'), coloca: arriba(), chiste: true, emoC: 'risa' },
        { sel: '#cielo-cuerpo .cielo-apunta', dentro: '#cielo-cuerpo', r: 14, pad: 3, ico: '📱', k: 'guiaCiApunte', t: 'cieloApunta', antes: cieloPaso('mapa'), coloca: arriba('.cielo-apunta'), chiste: true, emoC: 'apuro' },
        { sel: '#cielo-rojo', r: 16, pad: 9, ico: '🔴', k: 'guiaCiRoja', t: 'cieloRojo', ctx: 'rojo', atuendo: 'frontal-rojo', escena: 'rojo', si: function () { var b = $('cielo-rojo'); return !!b && (!cielo() || !b.hidden); }, emo: 'guino' }   /* el boton lo destapa el modulo al llegar: sin el todavia (el menu de visitas), se cuenta */
      ] },
      { nombre: pes('cieloPesDonde'), pasos: [
        { sel: tarjetaCon('.cielo-offline'), dentro: '#cielo-cuerpo', r: 14, pad: 2, ico: '📶', k: 'guiaCiSubir', t: 'cieloOfflineTitulo', antes: cieloPaso('donde'), coloca: arriba() },
        { sel: '#cielo-cuerpo [data-guia="sitios"]', dentro: '#cielo-cuerpo', r: 14, pad: 2, ico: '⛰️', k: 'guiaCiDonde', t: 'cieloSitios', antes: cieloPaso('donde'), coloca: arriba('#cielo-cuerpo [data-guia="sitios"]') },
        { sel: null, ico: '🌌', k: 'guiaCiFin', gesto: 'pulgar', fiesta: 'estrellas', sinCap: true, antes: cieloPaso('noche'), coloca: arriba(), emo: 'frio', chiste: true, emoC: 'apuro' }
      ] }
    ]
  };

  /* ── «Su cuerpo», dentro de su pantalla ──
     La pantalla es de modulos/cuerpo.js, que no se toca: el tour la abre como la abre la app
     (abrirCuerpo: el perfil en su pestaña y, encima, «Su cuerpo»), baja por ella y señala lo
     suyo. No anota nada, no abre hojas y no cambia de vista: entrar en «Aspecto» o en
     «Preguntar» pide sus datos a la red, y eso no lo decide un tour. Las cuatro vistas que no
     son «Músculos» se enseñan en su boton de la barra de abajo. */
  function cuerpo() { return window.TG_CUERPO || null; }
  function cuPanel() { return $('cuerpo-panel'); }
  function cuAbierto() { try { return !!cuerpo().abierto(); } catch (e) { return false; } }
  /* esta en la pantalla (aunque haya que bajar hasta el) */
  function cuHay(sel) { var n = cuPanel() && cuPanel().querySelector(sel); return !!n && n.getClientRects().length > 0; }
  /* un paso cuyo trozo no esta hoy en la pantalla no sale; sin la pantalla abierta (el menu de visitas) se cuenta */
  function cuSi(sel) { return function () { return !cuAbierto() || cuHay(sel); }; }
  function cuMusculos() { var b = $('tgc-modo-m'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); }
  /* sube lo que se va a señalar hasta debajo de la cabecera, que va pegada arriba; sin nada, al principio */
  function cuSubir(sel) {
    var p = cuPanel(); if (!p) return;
    if (!sel) { if (p.scrollTop) p.scrollTop = 0; return; }
    var n = p.querySelector(sel), cab = $('tgc-top'); if (!n) return;
    var d = n.getBoundingClientRect().top - ((cab ? cab.getBoundingClientRect().bottom : 60) + 12);
    if (Math.abs(d) > 1) p.scrollTop += d;
  }
  function cuVer(sel) { return function () { cuMusculos(); cuSubir(sel); }; }

  TOURS.cuerpo = {
    clave: 'tenerife.tour.cuerpo', version: 1, z: 8970, ico: '💪', titulo: 'guiaCuTitulo',
    atuendo: 'deporte', escena: 'dia', fin: 'tourAExplorar',
    oferta: null,
    si: function () { return typeof window.abrirCuerpo === 'function'; },
    /* la pantalla, abierta y en «Músculos», antes de empezar */
    prepara: function () {
      if (typeof window.abrirCuerpo !== 'function') return Promise.reject(new Error('cuerpo'));
      if (cuAbierto()) { cuMusculos(); return null; }
      cerrarLoAbierto();
      return window.abrirCuerpo({ modo: 'musculos' });
    },
    /* una celebracion recien salida (un sello) taparia lo que se señala */
    alEmpezar: function () { try { cuerpo().cerrarFiesta(); } catch (e) {} cuMusculos(); },
    /* «atras» cierra «Su cuerpo»: el tour se va con ella */
    vive: cuAbierto,
    alAcabar: function () { try { cuSubir(null); } catch (e) {} },
    capitulos: [
      { nombre: pes('cuerpoModoMusculos'), pasos: [
        { sel: '#tgc-fig', r: 26, pad: 6, alto: 0.5, ico: '🧍', k: 'guiaCuPersonaje', coloca: cuVer(null), emo: 'ilusion' },
        { sel: '#tgc-leyenda', r: 14, pad: 12, ico: '🎨', k: 'guiaCuLeyenda', t: 'cuerpoLeyenda', coloca: cuVer('#tgc-leyenda'), chiste: true, emoC: 'apuro' },
        { sel: '#tgc-deporte', r: 22, pad: 2, ico: '🏄', k: 'guiaCuDeporte', t: 'cuerpoDepTitulo', coloca: cuVer('#tgc-deporte') },
        { sel: '#tgc-resumen-tit, #tgc-cifras-link, #tgc-meta-fuerza, #tgc-meta-mov, #tgc-meta-grupos, #tgc-dias7', r: 16, pad: 8, alto: 0.36, ico: '📊', k: 'guiaCuSemana', t: 'cuerpoResumenTitulo', coloca: cuVer('#tgc-resumen') },
        { sel: '#tgc-mov-btn', r: 16, pad: 6, ico: '🏃', k: 'guiaCuMov', t: 'cuerpoMovAnotar', coloca: cuVer('#tgc-mov-btn'), chiste: true, emoC: 'risa' },
        { sel: '#tgc-hoy-isla', r: 22, pad: 2, alto: 0.34, ico: '🌤️', k: 'guiaCuHoy', t: 'cuerpoHoyTitulo', atuendo: 'sol', coloca: cuVer('#tgc-hoy-isla') },
        { sel: '#tgc-mapa', r: 22, pad: 2, alto: 0.4, ico: '🥾', k: 'guiaCuIsla', t: 'cuerpoIslaTitulo', atuendo: 'gorra', coloca: cuVer('#tgc-mapa'), emo: 'ilusion' },
        { sel: '#tgc-comp', r: 16, pad: 8, alto: 0.34, ico: '🦎', k: 'guiaCuComp', t: 'cuerpoCompTit', atuendo: 'gorra', si: cuSi('#tgc-comp'), coloca: cuVer('#tgc-comp'), chiste: true, emoC: 'risa' },
        { sel: '#tgc-send', r: 16, pad: 8, ico: '⛰️', k: 'guiaCuSend', t: 'cuerpoSendTit', atuendo: 'gorra', si: cuSi('#tgc-send'), coloca: cuVer('#tgc-send') },
        { sel: '#tgc-grupos', r: 16, pad: 8, ico: '💪', k: 'guiaCuGrupos', t: 'cuerpoGruposTitulo', coloca: cuVer('#tgc-grupos') },
        { sel: '#tgc-sellos', r: 16, pad: 0, alto: 0.36, ico: '🏅', k: 'guiaCuSellos', t: 'cuerpoSellosTitulo', coloca: cuVer('#tgc-sellos'), emo: 'ilusion' },
        { sel: '#tgc-postal', r: 22, pad: 2, ico: '🖼️', k: 'guiaCuPostal', t: 'cuerpoPostalTitulo', escena: 'tarde', coloca: cuVer('#tgc-postal'), chiste: true, emoC: 'picaro' },
        { sel: '#tgc-privacidad, #tgc-aviso, #tgc-ia, #tgc-borrar', r: 14, pad: 8, ico: '🔒', k: 'guiaCuPrivado', escena: 'noche', coloca: cuVer('#tgc-privacidad'), emo: 'serio' },
        { sel: '#tgc-tema, #tgc-cifras-btn', r: 24, pad: 6, ico: '🌗', k: 'guiaCuArriba', coloca: cuVer(null) }
      ] },
      { nombre: pes('cuerpoModoAspecto'), pasos: [
        { sel: '#tgc-modo-a', r: 16, pad: 2, ico: '🧑‍🎨', k: 'guiaCuAspecto', t: 'cuerpoAspectoTitulo', coloca: cuVer(null), emo: 'guino' }
      ] },
      { nombre: pes('cuerpoModoComida'), pasos: [
        { sel: '#tgc-modo-c', r: 16, pad: 2, ico: '🥗', k: 'guiaCuComida', t: 'cuerpoComTitulo', coloca: cuVer(null) }
      ] },
      /* «Evolución» (las dos tarjetas del perfil, dentro de «Su cuerpo») solo esta si el perfil sabe prestarlas */
      { nombre: pes('cuerpoModoEvolucion'), pasos: [
        { sel: '#tgc-modo-e', r: 16, pad: 2, ico: '📈', k: 'guiaCuEvolucion', t: 'perfilEvolucion', si: cuSi('#tgc-modo-e'), coloca: cuVer(null) }
      ] },
      { nombre: pes('cuerpoModoPreguntar'), pasos: [
        { sel: '#tgc-modo-p', r: 16, pad: 2, ico: '💬', k: 'guiaCuPreguntar', t: 'cuerpoAsisTitulo', coloca: cuVer(null), emo: 'pensativo' },
        { sel: null, ico: '🌋', k: 'guiaCuFin', escena: 'tarde', gesto: 'pulgar', fiesta: 'confeti', sinCap: true, coloca: cuVer(null), emo: 'risa', chiste: true, emoC: 'guino' }
      ] }
    ]
  };

  /* ── la pista: un globito junto a un boton, una vez por sesion ──
     Con opc.en (una pantalla que se desplaza, como «Su cuerpo»), el globito se cuelga de ella y se
     va con lo que se desplaza; sin el, queda fijo en la ventana (el panel del cielo no se mueve).
     Con opc.arriba va encima del boton, y no debajo (en «Su cuerpo», debajo taparia la leyenda). */
  var pistas = {};
  function pista(boton, clave, opc) {
    if (!boton || pistas[clave] || M.abierto) return false;   // con una visita abierta no se ofrece otra: se deja para la proxima vez
    pistas[clave] = true;
    ponerEstilos();
    var g = el('div', 'tgg-pista', T(clave)), en = (opc && opc.en) || null;
    g.setAttribute('aria-hidden', 'true');
    (en || document.body).appendChild(g);
    var r = boton.getBoundingClientRect(), w = g.offsetWidth, x = r.left, y = r.bottom, ancho = window.innerWidth;
    if (en) {
      var c = en.getBoundingClientRect();
      x = r.left - c.left + en.scrollLeft; y = r.bottom - c.top + en.scrollTop; ancho = en.clientWidth;
      g.style.position = 'absolute'; g.style.zIndex = String(opc.z || 7);
    }
    g.style.left = Math.round(entre(x + r.width / 2 - w / 2, 8, ancho - w - 8)) + 'px';
    if (opc && opc.arriba) { g.classList.add('tgg-pista-arriba'); g.style.top = Math.round(y - r.height - g.offsetHeight - 9) + 'px'; }
    else g.style.top = Math.round(y + 9) + 'px';
    g.style.setProperty('--tgg-pico', Math.round(x + r.width / 2 - parseFloat(g.style.left)) + 'px');
    boton.classList.add('tgg-llama');
    var fuera = function () { if (g.parentNode) g.parentNode.removeChild(g); boton.classList.remove('tgg-llama'); };
    setTimeout(function () { g.classList.add('tgg-se-va'); }, 6200);
    setTimeout(fuera, 6800);
    boton.addEventListener('click', fuera, { once: true });
    return true;
  }

  /* la cara de Jérôme, quieta, para un boton */
  function cara() { ponerEstilos(); var j = crearJero(); j.el.classList.add('tgg-cara'); return j.el; }

  window.TG_GUIA = {
    version: 3,
    /* ofrece un tour a quien no lo ha visto (la pregunta con Jérôme) */
    ofrecer: ofrecer,
    /* empieza un tour: 'app', 'cielo' o 'cuerpo' */
    iniciar: lanzar,
    /* el menu de visitas (el boton «Ver el tour» de la leyenda) */
    menu: menu,
    cerrar: function () { terminar(false); cerrarPregunta(); cerrarMenu(); },
    visto: function (nombre) { var t = TOURS[nombre]; return !t || visto(t) >= t.version; },
    pista: pista, cara: cara, tours: TOURS,
    /* un Jérôme suelto, con sus gestos, para ponerlo donde haga falta */
    personaje: function (opc) { ponerEstilos(); return crearJero(opc); },
    /* para las herramientas de tools/ */
    estado: function () {
      return { abierto: M.abierto, tour: M.tour ? Object.keys(TOURS).filter(function (k) { return TOURS[k] === M.tour; })[0] : null,
               i: M.i, pasos: M.pasos.length, caps: M.caps.length, paso: M.abierto && M.pasos[M.i] ? M.pasos[M.i].k : null,
               voz: M.voz, ctx: M.ctx, pregunta: !!pregunta, menu: !!menuEl, jero: D.jero ? D.jero.estado() : null };
    },
    pasos: function (nombre) { var t = TOURS[nombre]; return t ? pasosDe(t).pasos.map(function (p) { return p.k; }) : []; }
  };
  try {
    TG_IDIOMA.registrar('el guia y sus tours', function () {
      cerrarPregunta(); cerrarMenu();
      Array.prototype.slice.call(document.querySelectorAll('.tgg-pista')).forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
      repintar();
    });
  } catch (e) {}
})();
