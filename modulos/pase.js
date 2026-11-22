/* modulos/pase.js — el «Pase de viaje» (21 de noviembre de 2026).

   QUE ES. Jerome, el 20 de noviembre de 2026: juntar en un «Pase de viaje» las rutas en coche
   con audio, las busquedas del tesoro y «¿Qué estoy viendo?», y prepararlo «de momento gratis».
   Se abre desde la tarjeta «Pase de viaje» de la pestaña «Viaje» del pasaporte (modulos/perfil.js),
   como «Su cuerpo» desde la suya, y con el enlace #pase. Todo va marcado «Gratis por ahora»: no hay
   cobro, ni cuenta, ni nada que pagar. Cuando se decida el precio, el cobro va delante de abrir()
   y nada de lo que hay aqui cambia. La seguridad (avisos, cierres, el SOS) nunca se cobra: en las
   rutas, los avisos de cada parada y el enlace a «Antes de salir» salen siempre.

   LAS RUTAS EN COCHE (RUTAS). Cuatro: el Teide por Las Cañadas, Anaga, Teno con Masca y Garachico,
   y el norte. Sus paradas son lugares de la app (places[], por su id): lo que se lee al llegar es
   la descripcion de cada uno, la misma de su ficha, en el idioma de la app (o en el que la ficha
   la tenga, con la voz de ese idioma). Al llegar a menos de RADIO_PARADA de una parada se lee sola
   (watchPosition, con la pantalla encendida: Wake Lock); nadie tiene que tocar el movil, y el
   primer aviso de la pantalla de la ruta es que quien conduce no lo toca. El dibujo de la
   carretera lo calcula OSRM (router.project-osrm.org, el servidor de rutas que la app ya usa),
   al que se le mandan solo las paradas, nunca la posicion de nadie; se guarda en el dispositivo
   (TRAZADO_CLAVE) y, sin conexion, salen lineas rectas.

   LA BUSQUEDA DEL TESORO (TESORO). Garachico, tres pistas a pie. Los sitios y los datos de cada
   pista estan comprobados uno a uno (ver TESORO, con la fuente de cada cosa): NO salen de las
   fichas de la app, porque al cotejarlas varias de Garachico tienen la posicion corrida (el faro,
   a 370 m tierra adentro; el convento, a unos 175 m; la playa del Muelle, a unos 160 m) y la de la
   playa dice «arena negra» donde Turismo de Tenerife dice «callaos y arena». Eso va en la nota de
   entrega para corregirlo aparte. Solo se guarda que pistas estan encontradas, en el dispositivo
   (TESORO_CLAVE), y «Empezar de nuevo» lo borra.

   «¿QUÉ ESTOY VIENDO?» vive en modulos/horizonte.js; este fichero solo pide el permiso de los
   sensores en el mismo toque (iOS no lo deja pedir despues) y lo abre.

   COMO SE PINTA. Con createElement y textContent; innerHTML solo para los SVG de este fichero.
   Los textos, de PASE_UI (once idiomas). Cada pantalla es una entrada del historial: el boton
   «atras» del movil vuelve a la anterior. Al cambiar de idioma se repinta (TG_IDIOMA). */
(function () {
  'use strict';
  if (window.TG_PASE) return;

  var RADIO_PARADA = 350;      // m: en coche, a 50 km/h son unos 25 s antes de llegar
  var RADIO_TESORO = 30;       // m: a pie, a unos pasos del sitio
  var MARGEN_TESORO = 60;      // m: con mas margen que esto en el GPS no se da nada por encontrado
  var LEJOS_TESORO = 3000;     // m del centro de Garachico: mas lejos, la busqueda se juega alli
  var TESORO_CLAVE = 'tenerife.pase.tesoro';
  var TRAZADO_CLAVE = 'tenerife.pase.trazado.v1.';
  var OSRM = 'https://router.project-osrm.org/route/v1/driving/';

  /* SIN-TRADUCIR: PASE_LOCALE codigos de idioma para Intl (numeros), no textos */
  var PASE_LOCALE = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL', ro: 'ro-RO' };

  var PASE_UI = {
    "paseIntro": {"es": "Tres cosas nuevas para recorrer la isla. Gratis por ahora.", "en": "Three new ways to explore the island. Free for now.", "fr": "Trois nouveautés pour parcourir l’île. Gratuites pour l’instant.", "de": "Drei neue Möglichkeiten, die Insel zu erkunden. Vorerst kostenlos.", "it": "Tre novità per girare l’isola. Gratis per ora.", "nl": "Drie nieuwe manieren om het eiland te verkennen. Voorlopig gratis.", "zh": "三种游览全岛的新方式，目前免费。", "zht": "三種遊覽全島的新方式，目前免費。", "bg": "Три нови начина да разгледате острова. Засега безплатно.", "pl": "Trzy nowe sposoby na zwiedzanie wyspy. Na razie bezpłatnie.", "ro": "Trei moduri noi de a descoperi insula. Gratuit deocamdată."},
    "paseAbrir": {"es": "Abrir", "en": "Open", "fr": "Ouvrir", "de": "Öffnen", "it": "Apri", "nl": "Openen", "zh": "打开", "zht": "打開", "bg": "Отвори", "pl": "Otwórz", "ro": "Deschideți"},
    "paseHzTit": {"es": "¿Qué estoy viendo?", "en": "What am I looking at?", "fr": "Qu’est-ce que je vois ?", "de": "Was sehe ich da?", "it": "Che cosa sto guardando?", "nl": "Wat zie ik daar?", "zh": "我看到的是什么？", "zht": "我看到的是什麼？", "bg": "Какво виждам?", "pl": "Na co patrzę?", "ro": "Ce văd?"},
    "paseHzLema": {"es": "Apunte al horizonte y le dice qué cima, qué pueblo o qué isla tiene delante.", "en": "Point at the horizon and it tells you which peak, town or island is in front of you.", "fr": "Pointez l’horizon : l’app vous dit quel sommet, quelle localité ou quelle île vous avez devant vous.", "de": "Richten Sie das Handy auf den Horizont, und die App sagt Ihnen, welcher Gipfel, welcher Ort oder welche Insel vor Ihnen liegt.", "it": "Punti l’orizzonte e l’app le dice quale cima, quale paese o quale isola ha davanti.", "nl": "Richt op de horizon en de app vertelt welke top, welke plaats of welk eiland u voor zich hebt.", "zh": "把手机对准地平线，应用会告诉您眼前是哪座山峰、哪个村镇或哪座岛。", "zht": "把手機對準地平線，應用程式會告訴您眼前是哪座山峰、哪個村鎮或哪座島。", "bg": "Насочете телефона към хоризонта и приложението ще ви каже кой връх, кое селище или кой остров е пред вас.", "pl": "Wystarczy skierować telefon na horyzont, a aplikacja powie, jaki szczyt, jaka miejscowość albo jaka wyspa jest przed nami.", "ro": "Îndreptați telefonul spre orizont și aplicația vă spune ce vârf, ce localitate sau ce insulă aveți în față."},
    "paseRutasTit": {"es": "Rutas en coche con audio", "en": "Driving routes with audio", "fr": "Itinéraires en voiture avec audio", "de": "Autorouten mit Audio", "it": "Itinerari in auto con audio", "nl": "Autoroutes met audio", "zh": "带语音讲解的自驾路线", "zht": "附語音導覽的自駕路線", "bg": "Маршрути с кола с аудиогид", "pl": "Trasy samochodowe z audio", "ro": "Trasee cu mașina, cu audio"},
    "paseRutasLema": {"es": "Cuatro rutas por la isla: la app le cuenta cada parada al llegar, sin tocar el móvil.", "en": "Four routes around the island: the app tells you about each stop as you arrive, hands-free.", "fr": "Quatre itinéraires sur l’île : l’app vous présente chaque arrêt à votre arrivée, sans toucher au téléphone.", "de": "Vier Routen über die Insel: Die App erzählt an jedem Halt etwas dazu, ohne dass jemand das Handy anfassen muss.", "it": "Quattro itinerari sull’isola: l’app le racconta ogni tappa all’arrivo, senza toccare il telefono.", "nl": "Vier routes over het eiland: de app vertelt bij aankomst over elke stop, zonder dat u de telefoon aanraakt.", "zh": "四条环岛路线：每到一站，应用都会自动讲解，无需操作手机。", "zht": "四條環島路線：每到一站，應用程式都會自動講解，無需操作手機。", "bg": "Четири маршрута из острова: при всяка спирка приложението разказва за нея, без да пипате телефона.", "pl": "Cztery trasy po wyspie: aplikacja opowiada o każdym przystanku po dotarciu na miejsce, bez dotykania telefonu.", "ro": "Patru trasee pe insulă: aplicația vă povestește fiecare oprire când ajungeți, fără să atingeți telefonul."},
    "paseRuta_teide": {"es": "El Teide por Las Cañadas", "en": "Teide through Las Cañadas", "fr": "Le Teide par Las Cañadas", "de": "Der Teide durch Las Cañadas", "it": "Il Teide attraverso Las Cañadas", "nl": "De Teide via Las Cañadas", "zh": "经拉斯卡尼亚达斯前往泰德峰", "zht": "經拉斯卡尼亞達斯前往泰德峰", "bg": "Тейде през Лас Канядас", "pl": "Teide przez Las Cañadas", "ro": "Teide prin Las Cañadas"},
    "paseRuta_anaga": {"es": "Anaga", "en": "Anaga", "fr": "Anaga", "de": "Anaga", "it": "Anaga", "nl": "Anaga", "zh": "阿纳加", "zht": "阿納加", "bg": "Анага", "pl": "Anaga", "ro": "Anaga"},
    "paseRuta_teno": {"es": "Teno: Masca y Garachico", "en": "Teno: Masca and Garachico", "fr": "Teno : Masca et Garachico", "de": "Teno: Masca und Garachico", "it": "Teno: Masca e Garachico", "nl": "Teno: Masca en Garachico", "zh": "特诺：马斯卡与加拉奇科", "zht": "特諾：馬斯卡與加拉奇科", "bg": "Тено: Маска и Гарачико", "pl": "Teno: Masca i Garachico", "ro": "Teno: Masca și Garachico"},
    "paseRuta_norte": {"es": "El norte", "en": "The north", "fr": "Le nord", "de": "Der Norden", "it": "Il nord", "nl": "Het noorden", "zh": "北部", "zht": "北部", "bg": "Северът", "pl": "Północ", "ro": "Nordul"},
    "paseDeA": {"es": "De {a} a {b}", "en": "From {a} to {b}", "fr": "De {a} à {b}", "de": "Von {a} nach {b}", "it": "Da {a} a {b}", "nl": "Van {a} naar {b}", "zh": "从{a}到{b}", "zht": "從{a}到{b}", "bg": "От {a} до {b}", "pl": "{a} – {b}", "ro": "De la {a} la {b}"},
    "paseParadas": {"es": "{n} paradas", "en": "{n} stops", "fr": "{n} arrêts", "de": "{n} Stationen", "it": "{n} tappe", "nl": "{n} stops", "zh": "{n} 站", "zht": "{n} 站", "bg": "{n} спирки", "pl": "{n} przystanków", "ro": "{n} opriri"},
    "paseKmT": {"es": "{km} km · unos {t} en coche", "en": "{km} km · about {t} by car", "fr": "{km} km · environ {t} en voiture", "de": "{km} km · etwa {t} mit dem Auto", "it": "{km} km · circa {t} in auto", "nl": "{km} km · ongeveer {t} met de auto", "zh": "{km} 公里 · 驾车约 {t}", "zht": "{km} 公里 · 開車約 {t}", "bg": "{km} км · около {t} с кола", "pl": "{km} km · ok. {t} samochodem", "ro": "{km} km · cam {t} cu mașina"},
    "paseDur": {"es": "{h} h {m} min", "en": "{h} h {m} min", "fr": "{h} h {m} min", "de": "{h} Std. {m} Min.", "it": "{h} h {m} min", "nl": "{h} u {m} min", "zh": "{h} 小时 {m} 分钟", "zht": "{h} 小時 {m} 分鐘", "bg": "{h} ч {m} мин", "pl": "{h} godz. {m} min", "ro": "{h} h {m} min"},
    "paseDurMin": {"es": "{m} min", "en": "{m} min", "fr": "{m} min", "de": "{m} Min.", "it": "{m} min", "nl": "{m} min", "zh": "{m} 分钟", "zht": "{m} 分鐘", "bg": "{m} мин", "pl": "{m} min", "ro": "{m} min"},
    "paseKm": {"es": "{n} km", "en": "{n} km", "fr": "{n} km", "de": "{n} km", "it": "{n} km", "nl": "{n} km", "zh": "{n} 公里", "zht": "{n} 公里", "bg": "{n} км", "pl": "{n} km", "ro": "{n} km"},
    "paseM": {"es": "{n} m", "en": "{n} m", "fr": "{n} m", "de": "{n} m", "it": "{n} m", "nl": "{n} m", "zh": "{n} 米", "zht": "{n} 公尺", "bg": "{n} м", "pl": "{n} m", "ro": "{n} m"},
    "paseA": {"es": "a {d}", "en": "{d} away", "fr": "à {d}", "de": "{d} entfernt", "it": "a {d}", "nl": "op {d}", "zh": "距离 {d}", "zht": "距離 {d}", "bg": "на {d}", "pl": "{d} stąd", "ro": "la {d}"},
    "paseConducir": {"es": "Quien conduce no toca el móvil: póngalo en el soporte antes de salir o déjeselo al copiloto.", "en": "Whoever is driving doesn’t touch the phone: put it in the holder before you set off, or give it to your passenger.", "fr": "Le conducteur ne touche pas au téléphone : placez-le sur son support avant de partir ou confiez-le au passager.", "de": "Wer fährt, fasst das Handy nicht an: Stecken Sie es vor der Abfahrt in die Halterung oder geben Sie es dem Beifahrer.", "it": "Chi guida non tocca il telefono: lo metta nel supporto prima di partire o lo lasci al passeggero.", "nl": "Wie rijdt, raakt de telefoon niet aan: zet hem voor vertrek in de houder of geef hem aan de passagier.", "zh": "开车的人不要碰手机：出发前把手机放到支架上，或交给副驾驶。", "zht": "開車的人不要碰手機：出發前把手機放到支架上，或交給副駕駛。", "bg": "Шофьорът не пипа телефона: сложете го в стойката преди тръгване или го дайте на спътника си.", "pl": "Kierowca nie dotyka telefonu: przed wyjazdem trzeba go umieścić w uchwycie albo dać pasażerowi.", "ro": "Cine conduce nu atinge telefonul: puneți-l în suport înainte de plecare sau dați-l pasagerului."},
    "paseVozNota": {"es": "Cada parada se lee en voz alta al llegar, con la voz del móvil. Hace falta la ubicación, la app abierta y la pantalla encendida.", "en": "Each stop is read aloud as you arrive, using the phone’s voice. It needs your location, with the app open and the screen on.", "fr": "Chaque arrêt est lu à voix haute à votre arrivée, avec la voix du téléphone. Il faut la localisation, l’app ouverte et l’écran allumé.", "de": "Jeder Halt wird bei der Ankunft mit der Stimme des Handys vorgelesen. Dafür braucht es den Standort, die geöffnete App und den eingeschalteten Bildschirm.", "it": "Ogni tappa viene letta ad alta voce all’arrivo, con la voce del telefono. Servono la posizione, l’app aperta e lo schermo acceso.", "nl": "Elke stop wordt bij aankomst voorgelezen met de stem van de telefoon. Daarvoor zijn uw locatie, de geopende app en een ingeschakeld scherm nodig.", "zh": "每到一站，手机会用语音朗读介绍。需要开启定位，并保持应用打开、屏幕常亮。", "zht": "每到一站，手機會用語音朗讀介紹。需要開啟定位，並保持應用程式開啟、螢幕常亮。", "bg": "Всяка спирка се прочита на глас при пристигане, с гласа на телефона. Нужни са местоположението, отвореното приложение и включен екран.", "pl": "Każdy przystanek jest odczytywany na głos po dotarciu, głosem telefonu. Potrzebna jest lokalizacja, otwarta aplikacja i włączony ekran.", "ro": "Fiecare oprire este citită cu voce tare când ajungeți, cu vocea telefonului. Este nevoie de localizare, de aplicația deschisă și de ecranul aprins."},
    "paseSinVoz": {"es": "Este móvil no tiene voz instalada para este idioma: cada parada saldrá en la pantalla.", "en": "This phone has no voice installed for this language: each stop will be shown on screen.", "fr": "Ce téléphone n’a pas de voix installée pour cette langue : chaque arrêt s’affichera à l’écran.", "de": "Auf diesem Handy ist keine Stimme für diese Sprache installiert: Jeder Halt erscheint auf dem Bildschirm.", "it": "Questo telefono non ha una voce installata per questa lingua: ogni tappa comparirà sullo schermo.", "nl": "Op deze telefoon is geen stem voor deze taal geïnstalleerd: elke stop verschijnt op het scherm.", "zh": "这部手机没有安装该语言的语音：每一站的介绍会显示在屏幕上。", "zht": "這支手機沒有安裝該語言的語音：每一站的介紹會顯示在螢幕上。", "bg": "На този телефон няма инсталиран глас за този език: всяка спирка ще се показва на екрана.", "pl": "Na tym telefonie nie ma zainstalowanego głosu dla tego języka: każdy przystanek pojawi się na ekranie.", "ro": "Acest telefon nu are instalată o voce pentru această limbă: fiecare oprire va apărea pe ecran."},
    "paseEmpezar": {"es": "Empezar la ruta", "en": "Start the route", "fr": "Commencer l’itinéraire", "de": "Route starten", "it": "Inizia l’itinerario", "nl": "Route starten", "zh": "开始路线", "zht": "開始路線", "bg": "Започни маршрута", "pl": "Rozpocznij trasę", "ro": "Începeți traseul"},
    "paseLlegar": {"es": "Cómo llegar a la salida", "en": "Directions to the start", "fr": "Itinéraire jusqu’au départ", "de": "Weg zum Startpunkt", "it": "Come arrivare alla partenza", "nl": "Route naar het startpunt", "zh": "前往起点的路线", "zht": "前往起點的路線", "bg": "Как да стигнете до началото", "pl": "Dojazd do punktu startowego", "ro": "Cum ajungeți la punctul de plecare"},
    "paseEscuchar": {"es": "Escuchar: {x}", "en": "Listen: {x}", "fr": "Écouter : {x}", "de": "Anhören: {x}", "it": "Ascolta: {x}", "nl": "Beluisteren: {x}", "zh": "收听：{x}", "zht": "收聽：{x}", "bg": "Слушай: {x}", "pl": "Posłuchaj: {x}", "ro": "Ascultați: {x}"},
    "paseParar": {"es": "Parar", "en": "Stop", "fr": "Arrêter", "de": "Stopp", "it": "Ferma", "nl": "Stoppen", "zh": "停止", "zht": "停止", "bg": "Спри", "pl": "Zatrzymaj", "ro": "Opriți"},
    "paseEnRuta": {"es": "En esta ruta", "en": "On this route", "fr": "Sur cet itinéraire", "de": "Auf dieser Route", "it": "Su questo itinerario", "nl": "Op deze route", "zh": "本路线须知", "zht": "本路線須知", "bg": "По този маршрут", "pl": "Na tej trasie", "ro": "Pe acest traseu"},
    "paseVerAntes": {"es": "Mire los avisos de hoy en «{t}»", "en": "Check today’s warnings in “{t}”", "fr": "Consultez les alertes du jour dans « {t} »", "de": "Die Warnungen von heute finden Sie unter „{t}“", "it": "Controlli le allerte di oggi in «{t}»", "nl": "Bekijk de waarschuwingen van vandaag in ‘{t}’", "zh": "在「{t}」中查看今天的提醒", "zht": "在「{t}」中查看今天的提醒", "bg": "Вижте днешните предупреждения в „{t}“", "pl": "Dzisiejsze ostrzeżenia: „{t}”", "ro": "Vedeți avertizările de azi în „{t}”"},
    "paseMapaAria": {"es": "Mapa de la ruta con sus paradas", "en": "Map of the route and its stops", "fr": "Carte de l’itinéraire et de ses arrêts", "de": "Karte der Route mit ihren Halten", "it": "Mappa dell’itinerario con le tappe", "nl": "Kaart van de route met de stops", "zh": "路线及各站地图", "zht": "路線及各站地圖", "bg": "Карта на маршрута и спирките", "pl": "Mapa trasy z przystankami", "ro": "Harta traseului cu opririle"},
    "paseRecta": {"es": "Sin conexión, el camino sale en línea recta entre paradas.", "en": "Offline, the way is drawn as straight lines between stops.", "fr": "Hors connexion, le trajet s’affiche en ligne droite entre les arrêts.", "de": "Ohne Verbindung wird der Weg als gerade Linie zwischen den Halten gezeichnet.", "it": "Senza connessione, il percorso appare in linea retta tra le tappe.", "nl": "Zonder verbinding wordt de weg als rechte lijn tussen de stops getekend.", "zh": "离线时，各站之间以直线表示。", "zht": "離線時，各站之間以直線表示。", "bg": "Без връзка пътят се показва с прави линии между спирките.", "pl": "Bez połączenia droga jest rysowana liniami prostymi między przystankami.", "ro": "Fără conexiune, drumul apare în linie dreaptă între opriri."},
    "paseCarretera": {"es": "Carretera: © colaboradores de OpenStreetMap, ruta calculada con OSRM", "en": "Roads: © OpenStreetMap contributors, routing by OSRM", "fr": "Routes : © contributeurs d’OpenStreetMap, itinéraire calculé avec OSRM", "de": "Straßen: © OpenStreetMap-Mitwirkende, Routing mit OSRM", "it": "Strade: © collaboratori di OpenStreetMap, percorso calcolato con OSRM", "nl": "Wegen: © OpenStreetMap-bijdragers, route berekend met OSRM", "zh": "道路：© OpenStreetMap 贡献者，路线由 OSRM 计算", "zht": "道路：© OpenStreetMap 貢獻者，路線由 OSRM 計算", "bg": "Пътища: © сътрудници на OpenStreetMap, маршрут, изчислен с OSRM", "pl": "Drogi: © współtwórcy OpenStreetMap, trasa wyznaczona przez OSRM", "ro": "Drumuri: © contribuitorii OpenStreetMap, traseu calculat cu OSRM"},
    "paseContorno": {"es": "Costa: © colaboradores de OpenStreetMap", "en": "Coastline: © OpenStreetMap contributors", "fr": "Côte : © contributeurs d’OpenStreetMap", "de": "Küste: © OpenStreetMap-Mitwirkende", "it": "Costa: © collaboratori di OpenStreetMap", "nl": "Kust: © OpenStreetMap-bijdragers", "zh": "海岸线：© OpenStreetMap 贡献者", "zht": "海岸線：© OpenStreetMap 貢獻者", "bg": "Брегова линия: © сътрудници на OpenStreetMap", "pl": "Linia brzegowa: © współtwórcy OpenStreetMap", "ro": "Litoral: © contribuitorii OpenStreetMap"},
    "paseProxima": {"es": "Próxima parada", "en": "Next stop", "fr": "Prochain arrêt", "de": "Nächster Halt", "it": "Prossima tappa", "nl": "Volgende stop", "zh": "下一站", "zht": "下一站", "bg": "Следваща спирка", "pl": "Następny przystanek", "ro": "Următoarea oprire"},
    "paseDeN": {"es": "{i} de {n}", "en": "{i} of {n}", "fr": "{i} sur {n}", "de": "{i} von {n}", "it": "{i} di {n}", "nl": "{i} van {n}", "zh": "第 {i} 站，共 {n} 站", "zht": "第 {i} 站，共 {n} 站", "bg": "{i} от {n}", "pl": "{i} z {n}", "ro": "{i} din {n}"},
    "paseEsperaGps": {"es": "Esperando la posición…", "en": "Waiting for your location…", "fr": "En attente de votre position…", "de": "Warten auf Ihren Standort…", "it": "In attesa della posizione…", "nl": "Wachten op uw locatie…", "zh": "正在等待定位…", "zht": "正在等待定位…", "bg": "Изчакване на местоположението…", "pl": "Oczekiwanie na lokalizację…", "ro": "Se așteaptă poziția…"},
    "paseGpsNo": {"es": "Sin permiso para la ubicación: la ruta no puede saber cuándo llega a cada parada. Puede ir parada a parada con «Saltar».", "en": "No location permission: the route can’t tell when you reach each stop. You can go stop by stop with “Skip”.", "fr": "Pas d’autorisation de localisation : l’itinéraire ne peut pas savoir quand vous arrivez à chaque arrêt. Vous pouvez avancer arrêt par arrêt avec « Passer ».", "de": "Keine Standortberechtigung: Die Route erkennt nicht, wann Sie an einem Halt ankommen. Mit „Überspringen“ geht es Halt für Halt weiter.", "it": "Nessun permesso per la posizione: l’itinerario non può sapere quando arriva a ogni tappa. Può andare avanti tappa per tappa con «Salta».", "nl": "Geen toestemming voor uw locatie: de route weet niet wanneer u bij een stop aankomt. Met ‘Overslaan’ gaat u stop voor stop verder.", "zh": "没有定位权限：路线无法知道您何时到达各站。可以用「跳过」逐站前进。", "zht": "沒有定位權限：路線無法知道您何時抵達各站。可以用「跳過」逐站前進。", "bg": "Няма разрешение за местоположението: маршрутът не може да разбере кога стигате до всяка спирка. Можете да продължавате спирка по спирка с „Пропусни“.", "pl": "Brak dostępu do lokalizacji: trasa nie wie, kiedy dociera się do przystanku. Można przechodzić od przystanku do przystanku przyciskiem „Pomiń”.", "ro": "Nu există permisiune pentru localizare: traseul nu poate ști când ajungeți la fiecare oprire. Puteți merge din oprire în oprire cu „Săriți”."},
    "paseImprecisa": {"es": "Su posición tiene un margen de {m}.", "en": "Your location is only accurate to {m}.", "fr": "Votre position a une marge de {m}.", "de": "Ihr Standort ist nur auf {m} genau.", "it": "La sua posizione ha un margine di {m}.", "nl": "Uw locatie heeft een marge van {m}.", "zh": "您的位置误差约 {m}。", "zht": "您的位置誤差約 {m}。", "bg": "Местоположението ви е с точност до {m}.", "pl": "Lokalizacja ma margines błędu {m}.", "ro": "Poziția dumneavoastră are o marjă de {m}."},
    "pasePausar": {"es": "Pausar la voz", "en": "Pause the voice", "fr": "Mettre la voix en pause", "de": "Stimme anhalten", "it": "Metti in pausa la voce", "nl": "Stem pauzeren", "zh": "暂停语音", "zht": "暫停語音", "bg": "Пауза на гласа", "pl": "Wstrzymaj głos", "ro": "Puneți vocea pe pauză"},
    "paseVozSi": {"es": "Activar la voz", "en": "Turn the voice on", "fr": "Réactiver la voix", "de": "Stimme einschalten", "it": "Riattiva la voce", "nl": "Stem aanzetten", "zh": "开启语音", "zht": "開啟語音", "bg": "Включи гласа", "pl": "Włącz głos", "ro": "Porniți vocea"},
    "paseRepetir": {"es": "Repetir", "en": "Repeat", "fr": "Répéter", "de": "Wiederholen", "it": "Ripeti", "nl": "Herhalen", "zh": "重播", "zht": "重播", "bg": "Повтори", "pl": "Powtórz", "ro": "Repetați"},
    "paseSaltar": {"es": "Saltar", "en": "Skip", "fr": "Passer", "de": "Überspringen", "it": "Salta", "nl": "Overslaan", "zh": "跳过", "zht": "跳過", "bg": "Пропусни", "pl": "Pomiń", "ro": "Săriți"},
    "paseTerminar": {"es": "Terminar", "en": "Finish", "fr": "Terminer", "de": "Beenden", "it": "Termina", "nl": "Beëindigen", "zh": "结束", "zht": "結束", "bg": "Край", "pl": "Zakończ", "ro": "Încheiați"},
    "paseFin": {"es": "Ruta terminada. ¡Buen viaje!", "en": "Route finished. Enjoy the rest of your trip!", "fr": "Itinéraire terminé. Bonne route !", "de": "Route beendet. Gute Weiterfahrt!", "it": "Itinerario terminato. Buon viaggio!", "nl": "Route afgelopen. Goede reis!", "zh": "路线结束，旅途愉快！", "zht": "路線結束，旅途愉快！", "bg": "Маршрутът приключи. Приятен път!", "pl": "Trasa zakończona. Szerokiej drogi!", "ro": "Traseu încheiat. Drum bun!"},
    "paseVozIntro": {"es": "{r}. {n} paradas. La primera: {p}.", "en": "{r}. {n} stops. The first: {p}.", "fr": "{r}. {n} arrêts. Le premier : {p}.", "de": "{r}. {n} Stationen. Die erste: {p}.", "it": "{r}. {n} tappe. La prima: {p}.", "nl": "{r}. {n} stops. De eerste: {p}.", "zh": "{r}。共 {n} 站。第一站：{p}。", "zht": "{r}。共 {n} 站。第一站：{p}。", "bg": "{r}. {n} спирки. Първата: {p}.", "pl": "{r}. Przystanków: {n}. Pierwszy: {p}.", "ro": "{r}. {n} opriri. Prima: {p}."},
    "paseVozSiguiente": {"es": "Próxima parada: {p}, a {d}.", "en": "Next stop: {p}, {d} away.", "fr": "Prochain arrêt : {p}, à {d}.", "de": "Nächster Halt: {p}, in {d}.", "it": "Prossima tappa: {p}, a {d}.", "nl": "Volgende stop: {p}, op {d}.", "zh": "下一站：{p}，距离 {d}。", "zht": "下一站：{p}，距離 {d}。", "bg": "Следваща спирка: {p}, на {d}.", "pl": "Następny przystanek: {p}, {d} stąd.", "ro": "Următoarea oprire: {p}, la {d}."},
    "paseVozFin": {"es": "Última parada. Fin de la ruta.", "en": "Last stop. End of the route.", "fr": "Dernier arrêt. Fin de l’itinéraire.", "de": "Letzter Halt. Ende der Route.", "it": "Ultima tappa. Fine dell’itinerario.", "nl": "Laatste stop. Einde van de route.", "zh": "最后一站。路线结束。", "zht": "最後一站。路線結束。", "bg": "Последна спирка. Край на маршрута.", "pl": "Ostatni przystanek. Koniec trasy.", "ro": "Ultima oprire. Sfârșitul traseului."},
    "pasePantalla": {"es": "La pantalla se queda encendida mientras dura la ruta: si la apaga o cambia de app, la ruta se para hasta que vuelva.", "en": "The screen stays on while the route runs: if you turn it off or switch apps, the route pauses until you come back.", "fr": "L’écran reste allumé pendant l’itinéraire : si vous l’éteignez ou changez d’app, l’itinéraire s’interrompt jusqu’à votre retour.", "de": "Der Bildschirm bleibt während der Route an: Wenn Sie ihn ausschalten oder die App wechseln, pausiert die Route, bis Sie zurückkommen.", "it": "Lo schermo resta acceso durante l’itinerario: se lo spegne o cambia app, l’itinerario si ferma finché non torna.", "nl": "Het scherm blijft aan zolang de route loopt: zet u het uit of wisselt u van app, dan pauzeert de route tot u terugkomt.", "zh": "路线进行时屏幕会保持常亮：如果关闭屏幕或切换到其他应用，路线会暂停，直到您回来。", "zht": "路線進行時螢幕會保持常亮：如果關閉螢幕或切換到其他應用程式，路線會暫停，直到您回來。", "bg": "Докато трае маршрутът, екранът остава включен: ако го изключите или смените приложението, маршрутът спира, докато не се върнете.", "pl": "Podczas trasy ekran pozostaje włączony: po jego wyłączeniu albo przejściu do innej aplikacji trasa się zatrzymuje do czasu powrotu.", "ro": "Ecranul rămâne aprins cât durează traseul: dacă îl stingeți sau schimbați aplicația, traseul se oprește până reveniți."},
    "paseIrTesoro": {"es": "Ya está en Garachico: hay una búsqueda del tesoro a pie.", "en": "You’re in Garachico: there’s a treasure hunt on foot.", "fr": "Vous êtes à Garachico : une chasse au trésor à pied vous attend.", "de": "Sie sind in Garachico: Hier gibt es eine Schatzsuche zu Fuß.", "it": "È a Garachico: c’è una caccia al tesoro a piedi.", "nl": "U bent in Garachico: er is een schattenjacht te voet.", "zh": "您已到加拉奇科：这里有一场步行寻宝游戏。", "zht": "您已到加拉奇科：這裡有一場步行尋寶遊戲。", "bg": "Вече сте в Гарачико: тук има търсене на съкровище пеша.", "pl": "To już Garachico: czeka tu piesze poszukiwanie skarbu.", "ro": "Sunteți deja în Garachico: aici vă așteaptă o vânătoare de comori pe jos."},
    "paseVozSiguienteSin": {"es": "Próxima parada: {p}.", "en": "Next stop: {p}.", "fr": "Prochain arrêt : {p}.", "de": "Nächster Halt: {p}.", "it": "Prossima tappa: {p}.", "nl": "Volgende stop: {p}.", "zh": "下一站：{p}。", "zht": "下一站：{p}。", "bg": "Следваща спирка: {p}.", "pl": "Następny przystanek: {p}.", "ro": "Următoarea oprire: {p}."},
    "paseLlegarGarachico": {"es": "Cómo llegar a Garachico", "en": "Directions to Garachico", "fr": "Itinéraire jusqu’à Garachico", "de": "Weg nach Garachico", "it": "Come arrivare a Garachico", "nl": "Route naar Garachico", "zh": "前往加拉奇科的路线", "zht": "前往加拉奇科的路線", "bg": "Как да стигнете до Гарачико", "pl": "Dojazd do Garachico", "ro": "Cum ajungeți la Garachico"},
    "paseTesoroFuentes": {"es": "Datos: Turismo de Tenerife (webtenerife.com) y Diario de Avisos. Posiciones: Turismo de Tenerife y © colaboradores de OpenStreetMap.", "en": "Facts: Turismo de Tenerife (webtenerife.com) and Diario de Avisos. Positions: Turismo de Tenerife and © OpenStreetMap contributors.", "fr": "Données : Turismo de Tenerife (webtenerife.com) et Diario de Avisos. Positions : Turismo de Tenerife et © contributeurs d’OpenStreetMap.", "de": "Angaben: Turismo de Tenerife (webtenerife.com) und Diario de Avisos. Positionen: Turismo de Tenerife und © OpenStreetMap-Mitwirkende.", "it": "Dati: Turismo de Tenerife (webtenerife.com) e Diario de Avisos. Posizioni: Turismo de Tenerife e © collaboratori di OpenStreetMap.", "nl": "Gegevens: Turismo de Tenerife (webtenerife.com) en Diario de Avisos. Posities: Turismo de Tenerife en © OpenStreetMap-bijdragers.", "zh": "资料：特内里费旅游局（webtenerife.com）和《Diario de Avisos》。位置：特内里费旅游局及 © OpenStreetMap 贡献者。", "zht": "資料：特內里費旅遊局（webtenerife.com）和《Diario de Avisos》。位置：特內里費旅遊局及 © OpenStreetMap 貢獻者。", "bg": "Данни: Turismo de Tenerife (webtenerife.com) и Diario de Avisos. Местоположения: Turismo de Tenerife и © сътрудници на OpenStreetMap.", "pl": "Dane: Turismo de Tenerife (webtenerife.com) i Diario de Avisos. Położenie: Turismo de Tenerife i © współtwórcy OpenStreetMap.", "ro": "Date: Turismo de Tenerife (webtenerife.com) și Diario de Avisos. Poziții: Turismo de Tenerife și © contribuitorii OpenStreetMap."},
    "paseTesoroTit": {"es": "Búsqueda del tesoro", "en": "Treasure hunt", "fr": "Chasse au trésor", "de": "Schatzsuche", "it": "Caccia al tesoro", "nl": "Schattenjacht", "zh": "寻宝", "zht": "尋寶", "bg": "Търсене на съкровище", "pl": "Poszukiwanie skarbu", "ro": "Vânătoare de comori"},
    "paseTesoroDonde": {"es": "Garachico", "en": "Garachico", "fr": "Garachico", "de": "Garachico", "it": "Garachico", "nl": "Garachico", "zh": "加拉奇科", "zht": "加拉奇科", "bg": "Гарачико", "pl": "Garachico", "ro": "Garachico"},
    "paseTesoroLema": {"es": "Tres pistas por el casco de Garachico: resuelva una, vaya hasta allí y se abre la siguiente.", "en": "Three clues around the old town of Garachico: solve one, walk there and the next one opens.", "fr": "Trois indices dans le centre historique de Garachico : résolvez-en un, allez-y et le suivant s’ouvre.", "de": "Drei Hinweise in der Altstadt von Garachico: Lösen Sie einen, gehen Sie hin, und der nächste öffnet sich.", "it": "Tre indizi nel centro storico di Garachico: ne risolva uno, ci vada e si apre il successivo.", "nl": "Drie aanwijzingen in de oude kern van Garachico: los er een op, loop ernaartoe en de volgende gaat open.", "zh": "加拉奇科老城里的三条线索：解开一条，走到那里，下一条就会出现。", "zht": "加拉奇科老城裡的三條線索：解開一條，走到那裡，下一條就會出現。", "bg": "Три следи из стария град на Гарачико: разгадайте една, отидете там и се отваря следващата.", "pl": "Trzy wskazówki na starym mieście w Garachico: wystarczy rozwiązać jedną i tam dojść, a otworzy się następna.", "ro": "Trei indicii prin centrul istoric din Garachico: rezolvați unul, mergeți acolo și se deschide următorul."},
    "paseTesoroComo": {"es": "Se juega a pie, con la ubicación encendida. A unos pasos del sitio, la pista queda encontrada.", "en": "It’s played on foot, with location on. A few steps from the spot, the clue counts as found.", "fr": "Le jeu se fait à pied, localisation activée. À quelques pas du lieu, l’indice est trouvé.", "de": "Gespielt wird zu Fuß und mit eingeschaltetem Standort. Ein paar Schritte vor dem Ort gilt der Hinweis als gefunden.", "it": "Si gioca a piedi, con la posizione attiva. A pochi passi dal luogo, l’indizio è trovato.", "nl": "Het spel gaat te voet, met uw locatie aan. Een paar stappen van de plek telt de aanwijzing als gevonden.", "zh": "步行游戏，需要开启定位。走到离地点几步远时，线索就算找到了。", "zht": "步行遊戲，需要開啟定位。走到離地點幾步遠時，線索就算找到了。", "bg": "Играе се пеша, с включено местоположение. На няколко крачки от мястото следата се смята за открита.", "pl": "Gra się pieszo, z włączoną lokalizacją. Kilka kroków od miejsca wskazówka zostaje zaliczona.", "ro": "Se joacă pe jos, cu localizarea pornită. La câțiva pași de loc, indiciul este găsit."},
    "paseTesoroOtraVez": {"es": "Empezar de nuevo", "en": "Start again", "fr": "Recommencer", "de": "Neu beginnen", "it": "Ricomincia", "nl": "Opnieuw beginnen", "zh": "重新开始", "zht": "重新開始", "bg": "Започни отначало", "pl": "Zacznij od nowa", "ro": "Începeți din nou"},
    "paseTesoroLejos": {"es": "Está a {d} de Garachico: la búsqueda se juega allí, a pie.", "en": "You are {d} from Garachico: the hunt is played there, on foot.", "fr": "Vous êtes à {d} de Garachico : la chasse se joue sur place, à pied.", "de": "Sie sind {d} von Garachico entfernt: Die Suche wird dort gespielt, zu Fuß.", "it": "È a {d} da Garachico: la caccia si gioca lì, a piedi.", "nl": "U bent {d} van Garachico: de jacht speelt zich daar af, te voet.", "zh": "您距离加拉奇科 {d}：寻宝要在那里步行进行。", "zht": "您距離加拉奇科 {d}：尋寶要在那裡步行進行。", "bg": "Намирате се на {d} от Гарачико: търсенето се играе там, пеша.", "pl": "Do Garachico jest stąd {d}: gra toczy się na miejscu, pieszo.", "ro": "Sunteți la {d} de Garachico: căutarea se joacă acolo, pe jos."},
    "pasePista": {"es": "Pista {i} de {n}", "en": "Clue {i} of {n}", "fr": "Indice {i} sur {n}", "de": "Hinweis {i} von {n}", "it": "Indizio {i} di {n}", "nl": "Aanwijzing {i} van {n}", "zh": "线索 {i}/{n}", "zht": "線索 {i}/{n}", "bg": "Следа {i} от {n}", "pl": "Wskazówka {i} z {n}", "ro": "Indiciul {i} din {n}"},
    "paseCerca": {"es": "Más cerca", "en": "Getting closer", "fr": "Vous vous rapprochez", "de": "Näher", "it": "Più vicino", "nl": "Dichterbij", "zh": "越来越近", "zht": "越來越近", "bg": "По-близо", "pl": "Coraz bliżej", "ro": "Mai aproape"},
    "paseLejos": {"es": "Más lejos", "en": "Further away", "fr": "Vous vous éloignez", "de": "Weiter weg", "it": "Più lontano", "nl": "Verder weg", "zh": "越来越远", "zht": "越來越遠", "bg": "По-далеч", "pl": "Coraz dalej", "ro": "Mai departe"},
    "paseFalta": {"es": "Le quedan {d}", "en": "{d} to go", "fr": "Encore {d}", "de": "Noch {d}", "it": "Mancano {d}", "nl": "Nog {d}", "zh": "还有 {d}", "zht": "還有 {d}", "bg": "Остават {d}", "pl": "Zostało {d}", "ro": "Mai aveți {d}"},
    "paseAyuda": {"es": "Una ayuda", "en": "A hint", "fr": "Un coup de pouce", "de": "Ein Tipp", "it": "Un aiuto", "nl": "Een hint", "zh": "提示", "zht": "提示", "bg": "Подсказка", "pl": "Podpowiedź", "ro": "Un ajutor"},
    "paseAyudaTxt": {"es": "Está {r}, a {d}.", "en": "It’s {r}, {d} away.", "fr": "C’est {r}, à {d}.", "de": "Es liegt {r}, {d} entfernt.", "it": "È {r}, a {d}.", "nl": "Het ligt {r}, op {d}.", "zh": "在{r}，距离 {d}。", "zht": "在{r}，距離 {d}。", "bg": "Намира се {r}, на {d}.", "pl": "To {r}, {d} stąd.", "ro": "Este {r}, la {d}."},
    "paseHacia_N": {"es": "hacia el norte", "en": "to the north", "fr": "vers le nord", "de": "im Norden", "it": "verso nord", "nl": "in het noorden", "zh": "北边", "zht": "北邊", "bg": "на север", "pl": "na północ", "ro": "spre nord"},
    "paseHacia_NE": {"es": "hacia el noreste", "en": "to the north-east", "fr": "vers le nord-est", "de": "im Nordosten", "it": "verso nord-est", "nl": "in het noordoosten", "zh": "东北边", "zht": "東北邊", "bg": "на североизток", "pl": "na północny wschód", "ro": "spre nord-est"},
    "paseHacia_E": {"es": "hacia el este", "en": "to the east", "fr": "vers l’est", "de": "im Osten", "it": "verso est", "nl": "in het oosten", "zh": "东边", "zht": "東邊", "bg": "на изток", "pl": "na wschód", "ro": "spre est"},
    "paseHacia_SE": {"es": "hacia el sureste", "en": "to the south-east", "fr": "vers le sud-est", "de": "im Südosten", "it": "verso sud-est", "nl": "in het zuidoosten", "zh": "东南边", "zht": "東南邊", "bg": "на югоизток", "pl": "na południowy wschód", "ro": "spre sud-est"},
    "paseHacia_S": {"es": "hacia el sur", "en": "to the south", "fr": "vers le sud", "de": "im Süden", "it": "verso sud", "nl": "in het zuiden", "zh": "南边", "zht": "南邊", "bg": "на юг", "pl": "na południe", "ro": "spre sud"},
    "paseHacia_SO": {"es": "hacia el suroeste", "en": "to the south-west", "fr": "vers le sud-ouest", "de": "im Südwesten", "it": "verso sud-ovest", "nl": "in het zuidwesten", "zh": "西南边", "zht": "西南邊", "bg": "на югозапад", "pl": "na południowy zachód", "ro": "spre sud-vest"},
    "paseHacia_O": {"es": "hacia el oeste", "en": "to the west", "fr": "vers l’ouest", "de": "im Westen", "it": "verso ovest", "nl": "in het westen", "zh": "西边", "zht": "西邊", "bg": "на запад", "pl": "na zachód", "ro": "spre vest"},
    "paseHacia_NO": {"es": "hacia el noroeste", "en": "to the north-west", "fr": "vers le nord-ouest", "de": "im Nordwesten", "it": "verso nord-ovest", "nl": "in het noordwesten", "zh": "西北边", "zht": "西北邊", "bg": "на северозапад", "pl": "na północny zachód", "ro": "spre nord-vest"},
    "paseRendirse": {"es": "Me rindo", "en": "I give up", "fr": "J’abandonne", "de": "Ich gebe auf", "it": "Mi arrendo", "nl": "Ik geef het op", "zh": "我放弃", "zht": "我放棄", "bg": "Предавам се", "pl": "Poddaję się", "ro": "Renunț"},
    "paseEs": {"es": "Es: {x}", "en": "It’s: {x}", "fr": "C’est : {x}", "de": "Es ist: {x}", "it": "È: {x}", "nl": "Het is: {x}", "zh": "答案：{x}", "zht": "答案：{x}", "bg": "Това е: {x}", "pl": "To: {x}", "ro": "Este: {x}"},
    "paseEstoyAqui": {"es": "Estoy aquí", "en": "I’m here", "fr": "J’y suis", "de": "Ich bin da", "it": "Sono qui", "nl": "Ik ben er", "zh": "我到了", "zht": "我到了", "bg": "Тук съм", "pl": "Jestem na miejscu", "ro": "Sunt aici"},
    "paseAunNo": {"es": "Aún no: le quedan {d}.", "en": "Not yet: {d} to go.", "fr": "Pas encore : encore {d}.", "de": "Noch nicht: noch {d}.", "it": "Non ancora: mancano {d}.", "nl": "Nog niet: nog {d}.", "zh": "还没到：还有 {d}。", "zht": "還沒到：還有 {d}。", "bg": "Още не: остават {d}.", "pl": "Jeszcze nie: zostało {d}.", "ro": "Încă nu: mai aveți {d}."},
    "paseEncontrada": {"es": "¡Encontrada!", "en": "Found it!", "fr": "Trouvé !", "de": "Gefunden!", "it": "Trovato!", "nl": "Gevonden!", "zh": "找到了！", "zht": "找到了！", "bg": "Открихте я!", "pl": "Znalezione!", "ro": "Găsit!"},
    "paseSiguientePista": {"es": "Siguiente pista", "en": "Next clue", "fr": "Indice suivant", "de": "Nächster Hinweis", "it": "Indizio successivo", "nl": "Volgende aanwijzing", "zh": "下一条线索", "zht": "下一條線索", "bg": "Следваща следа", "pl": "Następna wskazówka", "ro": "Indiciul următor"},
    "paseTesoroFin": {"es": "¡Tesoro encontrado! Ha resuelto las {n} pistas de Garachico.", "en": "Treasure found! You’ve solved all {n} Garachico clues.", "fr": "Trésor trouvé ! Vous avez résolu les {n} indices de Garachico.", "de": "Schatz gefunden! Sie haben alle {n} Hinweise von Garachico gelöst.", "it": "Tesoro trovato! Ha risolto i {n} indizi di Garachico.", "nl": "Schat gevonden! U hebt alle {n} aanwijzingen van Garachico opgelost.", "zh": "找到宝藏了！您解开了加拉奇科的全部 {n} 条线索。", "zht": "找到寶藏了！您解開了加拉奇科的全部 {n} 條線索。", "bg": "Съкровището е открито! Разгадахте всичките {n} следи в Гарачико.", "pl": "Skarb znaleziony! Wszystkie {n} wskazówki z Garachico rozwiązane.", "ro": "Comoara a fost găsită! Ați rezolvat toate cele {n} indicii din Garachico."},
    "paseLeer": {"es": "Leer en voz alta", "en": "Read aloud", "fr": "Lire à voix haute", "de": "Vorlesen", "it": "Leggi ad alta voce", "nl": "Voorlezen", "zh": "朗读", "zht": "朗讀", "bg": "Прочети на глас", "pl": "Przeczytaj na głos", "ro": "Citiți cu voce tare"},
    "paseGpsTesoro": {"es": "Para jugar hace falta la ubicación: actívela para esta web en los ajustes del navegador.", "en": "Location is needed to play: turn it on for this site in the browser settings.", "fr": "La localisation est nécessaire pour jouer : activez-la pour ce site dans les réglages du navigateur.", "de": "Zum Spielen wird der Standort benötigt: Schalten Sie ihn in den Browsereinstellungen für diese Website ein.", "it": "Per giocare serve la posizione: la attivi per questo sito nelle impostazioni del browser.", "nl": "Om te spelen is uw locatie nodig: zet die voor deze site aan in de browserinstellingen.", "zh": "游戏需要定位：请在浏览器设置中为本网站开启。", "zht": "遊戲需要定位：請在瀏覽器設定中為本網站開啟。", "bg": "За играта е нужно местоположението: включете го за този сайт в настройките на браузъра.", "pl": "Do gry potrzebna jest lokalizacja: można ją włączyć dla tej strony w ustawieniach przeglądarki.", "ro": "Pentru joc este nevoie de localizare: activați-o pentru acest site în setările browserului."},
    "paseGpsTesoroApp": {"es": "Para jugar hace falta la ubicación: actívela para Tenerife Go en los ajustes del móvil.", "en": "Location is needed to play: turn it on for Tenerife Go in your phone’s settings.", "fr": "La localisation est nécessaire pour jouer : activez-la pour Tenerife Go dans les réglages du téléphone.", "de": "Zum Spielen wird der Standort benötigt: Schalten Sie ihn für Tenerife Go in den Einstellungen des Handys ein.", "it": "Per giocare serve la posizione: la attivi per Tenerife Go nelle impostazioni del telefono.", "nl": "Om te spelen is uw locatie nodig: zet die aan voor Tenerife Go in de instellingen van uw telefoon.", "zh": "游戏需要定位：请在手机设置中为 Tenerife Go 开启。", "zht": "遊戲需要定位：請在手機設定中為 Tenerife Go 開啟。", "bg": "За играта е нужно местоположението: включете го за Tenerife Go в настройките на телефона.", "pl": "Do gry potrzebna jest lokalizacja: można ją włączyć dla Tenerife Go w ustawieniach telefonu.", "ro": "Pentru joc este nevoie de localizare: activați-o pentru Tenerife Go în setările telefonului."},
    "paseTesoroImprecisa": {"es": "Su posición tiene un margen de {m}: busque un sitio despejado, lejos de paredes altas.", "en": "Your location is only accurate to {m}: find an open spot, away from tall walls.", "fr": "Votre position a une marge de {m} : cherchez un endroit dégagé, loin des murs hauts.", "de": "Ihr Standort ist nur auf {m} genau: Suchen Sie eine freie Stelle, weg von hohen Mauern.", "it": "La sua posizione ha un margine di {m}: cerchi un punto aperto, lontano da muri alti.", "nl": "Uw locatie heeft een marge van {m}: zoek een open plek, weg van hoge muren.", "zh": "您的位置误差约 {m}：请到开阔处，远离高墙。", "zht": "您的位置誤差約 {m}：請到開闊處，遠離高牆。", "bg": "Местоположението ви е с точност до {m}: застанете на открито, далеч от високи стени.", "pl": "Lokalizacja ma margines błędu {m}: najlepiej stanąć w otwartym miejscu, z dala od wysokich murów.", "ro": "Poziția dumneavoastră are o marjă de {m}: căutați un loc deschis, departe de ziduri înalte."},
    "paseTesoroPista_convento": {"es": "Un convento franciscano del siglo XVI, frente a la plaza principal. Hoy guarda los libros y los papeles del pueblo.", "en": "A 16th-century Franciscan convent, opposite the main square. Today it keeps the town’s books and records.", "fr": "Un couvent franciscain du XVIe siècle, face à la place principale. Aujourd’hui, il garde les livres et les archives de la ville.", "de": "Ein Franziskanerkloster aus dem 16. Jahrhundert, gegenüber dem Hauptplatz. Heute bewahrt es die Bücher und Akten des Ortes auf.", "it": "Un convento francescano del XVI secolo, di fronte alla piazza principale. Oggi custodisce i libri e le carte del paese.", "nl": "Een franciscanenklooster uit de 16e eeuw, tegenover het hoofdplein. Nu bewaart het de boeken en de archieven van het stadje.", "zh": "一座16世纪的方济各会修道院，位于主广场对面。如今这里保存着镇上的书籍和档案。", "zht": "一座16世紀的方濟各會修道院，位於主廣場對面。如今這裡保存著鎮上的書籍和檔案。", "bg": "Францискански манастир от XVI век, срещу главния площад. Днес там се пазят книгите и документите на града.", "pl": "Klasztor franciszkański z XVI wieku, naprzeciw głównego placu. Dziś przechowuje się tu książki i dokumenty miasteczka.", "ro": "O mănăstire franciscană din secolul al XVI-lea, în fața pieței principale. Astăzi păstrează cărțile și documentele orașului."},
    "paseTesoroPista_castillo": {"es": "Una fortaleza junto al mar: Felipe II mandó construirla en 1575 para defender la costa de los piratas.", "en": "A fortress by the sea: Philip II ordered it built in 1575 to defend the coast against pirates.", "fr": "Une forteresse au bord de la mer : Philippe II l’a fait construire en 1575 pour défendre la côte contre les pirates.", "de": "Eine Festung am Meer: Philipp II. ließ sie 1575 bauen, um die Küste gegen Piraten zu verteidigen.", "it": "Una fortezza sul mare: Filippo II la fece costruire nel 1575 per difendere la costa dai pirati.", "nl": "Een vesting aan zee: Filips II liet haar in 1575 bouwen om de kust tegen piraten te verdedigen.", "zh": "一座海边的堡垒：1575年，费利佩二世下令修建它，以保卫海岸、抵御海盗。", "zht": "一座海邊的堡壘：1575年，費利佩二世下令修建它，以保衛海岸、抵禦海盜。", "bg": "Крепост край морето: Филип II нарежда да я построят през 1575 г., за да брани брега от пирати.", "pl": "Twierdza nad morzem: Filip II kazał ją zbudować w 1575 roku, by bronić wybrzeża przed piratami.", "ro": "O fortăreață lângă mare: Filip al II-lea a poruncit construirea ei în 1575, ca să apere coasta de pirați."},
    "paseTesoroPista_muelle": {"es": "Una playa pequeña, de callaos y arena, en medio del puerto pesquero: buena parte del muelle se usa para bañarse.", "en": "A small beach of pebbles and sand in the middle of the fishing port: much of the dock is used for swimming.", "fr": "Une petite plage de galets et de sable au milieu du port de pêche : une bonne partie du quai sert à la baignade.", "de": "Ein kleiner Strand aus Kieseln und Sand mitten im Fischerhafen: Ein großer Teil der Mole wird zum Baden genutzt.", "it": "Una piccola spiaggia di ciottoli e sabbia in mezzo al porto peschereccio: buona parte del molo si usa per fare il bagno.", "nl": "Een klein strand van kiezels en zand midden in de vissershaven: een groot deel van de kade wordt gebruikt om te zwemmen.", "zh": "渔港中央的一片小海滩，有卵石也有沙子：码头的大部分地方都用来游泳。", "zht": "漁港中央的一片小海灘，有卵石也有沙子：碼頭的大部分地方都用來游泳。", "bg": "Малък плаж с камъчета и пясък насред рибарското пристанище: голяма част от кея се използва за къпане.", "pl": "Mała plaża z otoczaków i piasku w samym środku portu rybackiego: duża część nabrzeża służy do kąpieli.", "ro": "O plajă mică, cu pietriș și nisip, în mijlocul portului pescăresc: o bună parte din dig se folosește pentru scăldat."},
    "paseTesoroDato_convento": {"es": "El antiguo convento de San Francisco, del siglo XVI, está frente a la plaza de la Libertad. Hoy es la Casa de la Cultura, con la biblioteca y el archivo municipal.", "en": "The former convent of San Francisco, from the 16th century, stands opposite the Plaza de la Libertad. Today it is the Casa de la Cultura, with the town library and archive.", "fr": "L’ancien couvent de San Francisco, du XVIe siècle, se trouve face à la Plaza de la Libertad. C’est aujourd’hui la Casa de la Cultura, avec la bibliothèque et les archives municipales.", "de": "Das ehemalige Kloster San Francisco aus dem 16. Jahrhundert liegt gegenüber der Plaza de la Libertad. Heute ist es die Casa de la Cultura mit der Stadtbibliothek und dem Gemeindearchiv.", "it": "L’antico convento di San Francisco, del XVI secolo, si trova di fronte a Plaza de la Libertad. Oggi è la Casa de la Cultura, con la biblioteca e l’archivio comunale.", "nl": "Het voormalige klooster van San Francisco, uit de 16e eeuw, staat tegenover de Plaza de la Libertad. Nu is het de Casa de la Cultura, met de gemeentebibliotheek en het gemeentearchief.", "zh": "圣弗朗西斯科旧修道院建于16世纪，位于自由广场（Plaza de la Libertad）对面。如今是文化之家，设有市立图书馆和档案馆。", "zht": "聖弗朗西斯科舊修道院建於16世紀，位於自由廣場（Plaza de la Libertad）對面。如今是文化之家，設有市立圖書館和檔案館。", "bg": "Старият манастир „Сан Франсиско“ от XVI век се намира срещу площад „Пласа де ла Либертад“. Днес е Домът на културата, с общинската библиотека и архив.", "pl": "Dawny klasztor San Francisco z XVI wieku stoi naprzeciw Plaza de la Libertad. Dziś mieści się w nim Dom Kultury (Casa de la Cultura) z biblioteką i archiwum miejskim.", "ro": "Fosta mănăstire San Francisco, din secolul al XVI-lea, se află în fața pieței Plaza de la Libertad. Astăzi este Casa de Cultură, cu biblioteca și arhiva municipală."},
    "paseTesoroDato_castillo": {"es": "El castillo de San Miguel. Felipe II mandó construirlo en 1575 para defender la costa y proteger Garachico de los ataques piratas.", "en": "The castle of San Miguel. Philip II ordered it built in 1575 to defend the coast and protect Garachico from pirate attacks.", "fr": "Le château de San Miguel. Philippe II l’a fait construire en 1575 pour défendre la côte et protéger Garachico des attaques de pirates.", "de": "Die Burg San Miguel. Philipp II. ließ sie 1575 bauen, um die Küste zu verteidigen und Garachico vor Piratenangriffen zu schützen.", "it": "Il castello di San Miguel. Filippo II lo fece costruire nel 1575 per difendere la costa e proteggere Garachico dagli attacchi dei pirati.", "nl": "Het kasteel van San Miguel. Filips II liet het in 1575 bouwen om de kust te verdedigen en Garachico tegen piratenaanvallen te beschermen.", "zh": "圣米格尔城堡。1575年，费利佩二世下令修建它，用来保卫海岸，保护加拉奇科免受海盗袭击。", "zht": "聖米格爾城堡。1575年，費利佩二世下令修建它，用來保衛海岸，保護加拉奇科免受海盜襲擊。", "bg": "Замъкът „Сан Мигел“. Филип II нарежда да бъде построен през 1575 г., за да брани брега и да пази Гарачико от пиратски нападения.", "pl": "Zamek San Miguel. Filip II kazał go zbudować w 1575 roku, by bronić wybrzeża i chronić Garachico przed napadami piratów.", "ro": "Castelul San Miguel. Filip al II-lea a poruncit construirea lui în 1575, ca să apere coasta și să ferească Garachico de atacurile piraților."},
    "paseTesoroDato_muelle": {"es": "La playa del Muelle: pequeña, de callaos y arena, en medio del puerto pesquero. Tiene duchas y vestuarios.", "en": "El Muelle beach: small, with pebbles and sand, in the middle of the fishing port. It has showers and changing rooms.", "fr": "La plage d’El Muelle : petite, de galets et de sable, au milieu du port de pêche. Elle a des douches et des vestiaires.", "de": "Der Strand El Muelle: klein, aus Kieseln und Sand, mitten im Fischerhafen. Es gibt Duschen und Umkleiden.", "it": "La spiaggia del Muelle: piccola, di ciottoli e sabbia, in mezzo al porto peschereccio. Ha docce e spogliatoi.", "nl": "Het strand El Muelle: klein, van kiezels en zand, midden in de vissershaven. Er zijn douches en kleedhokjes.", "zh": "码头海滩（Playa del Muelle）：小巧，有卵石也有沙子，位于渔港中央。设有淋浴和更衣室。", "zht": "碼頭海灘（Playa del Muelle）：小巧，有卵石也有沙子，位於漁港中央。設有淋浴和更衣室。", "bg": "Плажът „Ел Муеле“: малък, с камъчета и пясък, насред рибарското пристанище. Има душове и съблекални.", "pl": "Plaża El Muelle: mała, z otoczaków i piasku, w samym środku portu rybackiego. Są prysznice i przebieralnie.", "ro": "Plaja El Muelle: mică, cu pietriș și nisip, în mijlocul portului pescăresc. Are dușuri și vestiare."}
  };

  /* Las rutas, por el id de sus paradas en places[] (orden de marcha). Revisadas el 21 de noviembre
     de 2026: todas existen, con su descripcion en los diez idiomas de las fichas */
  var RUTAS = [
    { id: 'teide', paradas: ['ciudad-orotava', 'teide-teleforico', 'roques-garcia', 'llano-ucanca', 'mir-narices-teide', 'ciudad-vilaflor'] },
    { id: 'anaga', paradas: ['ciudad-laguna', 'mir-la-jardina', 'mirador-punta-homem', 'mirador-pico-ingles', 'mir-bailadero', 'nucleo-taganana', 'roque-bodegas', 'benijo'] },
    { id: 'teno', paradas: ['ciudad-santiago-teide', 'mir-cherfe', 'masca', 'mir-cruz-hilda', 'mir-baracan', 'mir-ermita-palmar', 'ciudad-buenavista', 'ciudad-garachico'] },
    { id: 'norte', paradas: ['ciudad-tacoronte', 'mir-la-garanona', 'mirador-humboldt', 'ciudad-orotava', 'ciudad-puerto-cruz', 'mir-rambla-castro', 'ciudad-san-juan-rambla', 'icod'] }
  ];
  /* La busqueda del tesoro de Garachico. Cada sitio, con su posicion y de donde sale (consultado el
     21 de noviembre de 2026); las pistas y lo que se cuenta al encontrarlo (paseTesoroPista_* y
     paseTesoroDato_*) dicen solo lo que dicen estas fuentes:
       convento: OpenStreetMap (la ficha de Wikivoyage, «Plaza Libertad, s/n»). «San Francisco
                 monastery dating from 1526, which stands opposite the central Plaza de la Libertad»
                 (Turismo de Tenerife, https://www.webtenerife.co.uk/tenerife/the-island/municipalities/garachico/);
                 la Casa de la Cultura, el Archivo y la Biblioteca municipal (Diario de Avisos, 2020,
                 https://diariodeavisos.elespanol.com/2020/01/hallan-una-cripta-secreta-en-un-antiguo-convento-de-garachico/)
                 y, en el mismo articulo, que «el convento y la iglesia franciscana fueron fundados por el
                 genovés Cristóbal de Ponte en 1524»: por eso la pista dice «un convento franciscano» y no
                 quien lo levanto. La posicion cae en la parcela del Catastro 7297128CS2379N (GL San Francisco
                 4, edificio publico), comprobado el 22 de noviembre de 2026 en ovc.catastro.meh.es
       castillo: OpenStreetMap (Wikivoyage); la ficha de la app dice lo mismo a 6 m. «In 1575, King
                 Philip II decided to build this castle to defend the coast» (Turismo de Tenerife,
                 https://www.webtenerife.co.uk/tenerife/the-island/municipalities/garachico/places-interest/castillo-fortaleza-san-miguel)
                 y «built to protect the coast from pirate attacks» (la pagina del municipio, arriba). La
                 posicion cae en la parcela del Catastro 6997201CS2369N (AV Tomé Cano 1, uso historico-
                 artistico), comprobado el 22 de noviembre de 2026
       muelle:   las coordenadas de Turismo de Tenerife (28° 22' 15.09'' N 16° 46' 4.87'' W); «Shingle
                 and sand», «right in the middle of the fishing port and much of the dock is used for
                 swimming», «a lifeguard and a watch post, dressing rooms and showers»
                 (https://www.webtenerife.co.uk/what-see/beaches/playa-muelle/). El socorrista no se dice:
                 el servicio va por temporadas y la ficha de la app no lo da (lifeguard: null); lo dice, con
                 sus fechas, la tabla SOCORRISTAS de index.html
     El centro, la Plaza de la Libertad (OpenStreetMap, Wikivoyage). Entre un sitio y el siguiente
     hay mas de 200 m: con RADIO_TESORO y el margen del GPS no se confunden */
  var TESORO = {
    id: 'garachico',
    centro: { lat: 28.37317, lng: -16.764644 },
    paradas: [
      { id: 'convento', nombre: 'Convento de San Francisco', lat: 28.37303, lng: -16.76382 },
      { id: 'castillo', nombre: 'Castillo de San Miguel', lat: 28.37315, lng: -16.766043 },
      { id: 'muelle', nombre: 'Playa del Muelle', lat: 28.370858, lng: -16.768019 }
    ]
  };
  /* La costa de Tenerife para el mapa pequeño de las rutas: la linea de 128 del canal «costa» de
     mapa/tenerife-relieve.png (la capa «earth» de OpenStreetMap), simplificada a unos 170 m
     (tools/pase_contorno.py la vuelve a sacar; tools/probar_pase.js comprueba que es la misma) */
  var CONTORNO = [[-16.6785,27.9982],[-16.6938,27.9998],[-16.7052,28.0072],[-16.7077,28.0132],[-16.7046,28.0267],[-16.71,28.0353],[-16.7089,28.0402],[-16.7115,28.0429],[-16.7112,28.0467],[-16.7183,28.0499],[-16.7183,28.0465],[-16.7244,28.0521],[-16.7299,28.0512],[-16.7371,28.0548],[-16.7367,28.0596],[-16.7328,28.064],[-16.7344,28.0667],[-16.7329,28.0726],[-16.7369,28.0769],[-16.7379,28.0866],[-16.7495,28.0932],[-16.7526,28.0984],[-16.7566,28.0985],[-16.7556,28.1007],[-16.7595,28.1018],[-16.7584,28.105],[-16.7616,28.105],[-16.7612,28.1084],[-16.7636,28.1103],[-16.7689,28.1099],[-16.7684,28.1136],[-16.7728,28.1129],[-16.7746,28.1181],[-16.7793,28.1201],[-16.7889,28.1374],[-16.7935,28.1401],[-16.7975,28.1466],[-16.7987,28.1525],[-16.8042,28.1579],[-16.8063,28.1682],[-16.8046,28.1703],[-16.8071,28.1741],[-16.8126,28.1796],[-16.8193,28.1804],[-16.8235,28.1908],[-16.8276,28.1935],[-16.8282,28.1994],[-16.8335,28.2021],[-16.8374,28.2075],[-16.8365,28.2172],[-16.8399,28.2216],[-16.8389,28.2254],[-16.8435,28.227],[-16.8413,28.2297],[-16.842,28.2334],[-16.8463,28.2394],[-16.8432,28.241],[-16.8432,28.2461],[-16.8385,28.2523],[-16.841,28.2642],[-16.8506,28.2685],[-16.8504,28.2728],[-16.8593,28.2749],[-16.8633,28.283],[-16.8617,28.2879],[-16.866,28.29],[-16.8707,28.2993],[-16.8801,28.303],[-16.8807,28.3127],[-16.8944,28.3229],[-16.8975,28.3283],[-16.8964,28.3317],[-16.9081,28.3396],[-16.9105,28.3384],[-16.9185,28.3426],[-16.9252,28.3418],[-16.9213,28.3428],[-16.924,28.3499],[-16.9228,28.3556],[-16.9173,28.361],[-16.905,28.3649],[-16.8958,28.3625],[-16.8866,28.365],[-16.8854,28.3688],[-16.8817,28.3674],[-16.8713,28.3712],[-16.8701,28.3754],[-16.8609,28.3759],[-16.8599,28.3795],[-16.8557,28.3806],[-16.8487,28.388],[-16.8426,28.387],[-16.8413,28.3904],[-16.8328,28.393],[-16.8263,28.3924],[-16.8248,28.3872],[-16.823,28.3878],[-16.8089,28.3764],[-16.8046,28.379],[-16.8022,28.3768],[-16.7948,28.377],[-16.7918,28.3734],[-16.7875,28.3755],[-16.7807,28.3736],[-16.774,28.3745],[-16.7697,28.3735],[-16.7691,28.3712],[-16.7648,28.3755],[-16.7544,28.3749],[-16.7527,28.3741],[-16.7554,28.3741],[-16.7547,28.3725],[-16.7508,28.3709],[-16.741,28.3799],[-16.7361,28.3799],[-16.7336,28.3825],[-16.7306,28.3771],[-16.7244,28.3773],[-16.7255,28.38],[-16.7225,28.3811],[-16.7242,28.3832],[-16.7201,28.3843],[-16.7195,28.3876],[-16.7091,28.3833],[-16.7012,28.3838],[-16.6947,28.3876],[-16.6942,28.3956],[-16.6926,28.3931],[-16.681,28.3906],[-16.6759,28.394],[-16.6774,28.3967],[-16.6767,28.3986],[-16.674,28.3983],[-16.6748,28.4012],[-16.662,28.3989],[-16.6583,28.4014],[-16.6534,28.3961],[-16.6473,28.3962],[-16.6442,28.3986],[-16.6369,28.3942],[-16.6277,28.3963],[-16.6038,28.3941],[-16.5977,28.4002],[-16.5879,28.3982],[-16.5781,28.4051],[-16.5726,28.4044],[-16.5664,28.4123],[-16.5628,28.4112],[-16.5549,28.4187],[-16.5463,28.4176],[-16.5432,28.4211],[-16.5402,28.417],[-16.5334,28.4168],[-16.5126,28.4197],[-16.5031,28.4252],[-16.4971,28.4382],[-16.4937,28.4404],[-16.4875,28.4375],[-16.4771,28.441],[-16.4703,28.4484],[-16.4744,28.4532],[-16.4735,28.4548],[-16.4674,28.4554],[-16.4661,28.4598],[-16.46,28.4579],[-16.4558,28.4602],[-16.4567,28.4683],[-16.4496,28.4731],[-16.4514,28.4775],[-16.4453,28.4743],[-16.4442,28.4801],[-16.4386,28.4817],[-16.4289,28.4893],[-16.4246,28.5006],[-16.426,28.5022],[-16.4199,28.5124],[-16.4214,28.5173],[-16.411,28.5269],[-16.3984,28.5339],[-16.3976,28.5384],[-16.3859,28.5462],[-16.3774,28.5481],[-16.3731,28.5464],[-16.3682,28.5475],[-16.3657,28.5452],[-16.3639,28.5478],[-16.3547,28.5497],[-16.3541,28.553],[-16.3498,28.553],[-16.3443,28.5567],[-16.3342,28.5576],[-16.3319,28.5657],[-16.3342,28.571],[-16.3296,28.577],[-16.3192,28.579],[-16.3155,28.5712],[-16.3106,28.5716],[-16.3076,28.5744],[-16.2972,28.5692],[-16.2935,28.5717],[-16.2883,28.571],[-16.2855,28.5765],[-16.2782,28.5715],[-16.2751,28.572],[-16.2727,28.5781],[-16.2568,28.5694],[-16.2439,28.5718],[-16.2335,28.5669],[-16.2237,28.5655],[-16.2066,28.5687],[-16.2011,28.5728],[-16.1931,28.5724],[-16.1803,28.5808],[-16.1747,28.5818],[-16.1723,28.5857],[-16.168,28.5842],[-16.1582,28.589],[-16.1325,28.5813],[-16.1351,28.5775],[-16.134,28.5743],[-16.1264,28.5711],[-16.1256,28.5624],[-16.1202,28.5592],[-16.1195,28.556],[-16.1205,28.5517],[-16.1273,28.5463],[-16.1293,28.5366],[-16.1256,28.5323],[-16.1325,28.5349],[-16.1388,28.5312],[-16.1386,28.5269],[-16.1429,28.5249],[-16.1435,28.5214],[-16.1564,28.5228],[-16.1729,28.5154],[-16.1772,28.5101],[-16.1867,28.5081],[-16.1931,28.5022],[-16.1956,28.4965],[-16.2047,28.4961],[-16.2029,28.4989],[-16.2161,28.492],[-16.2194,28.4877],[-16.22,28.4894],[-16.2268,28.4889],[-16.2298,28.4857],[-16.236,28.4861],[-16.2451,28.4737],[-16.2462,28.4699],[-16.2427,28.4697],[-16.2426,28.4678],[-16.2445,28.4678],[-16.2492,28.4548],[-16.2523,28.4548],[-16.2537,28.4505],[-16.2604,28.4518],[-16.2666,28.4494],[-16.2805,28.4339],[-16.2917,28.4264],[-16.2939,28.4209],[-16.3006,28.4145],[-16.3177,28.4042],[-16.3198,28.4003],[-16.3284,28.4022],[-16.3338,28.4005],[-16.3469,28.387],[-16.3603,28.3795],[-16.3611,28.3687],[-16.3694,28.3536],[-16.3593,28.3197],[-16.3617,28.3046],[-16.3696,28.2997],[-16.3835,28.2848],[-16.383,28.2771],[-16.3874,28.2647],[-16.4023,28.2442],[-16.4018,28.241],[-16.4067,28.2356],[-16.4096,28.2237],[-16.4246,28.2043],[-16.421,28.1984],[-16.422,28.1936],[-16.4272,28.1887],[-16.4259,28.1811],[-16.43,28.1735],[-16.4251,28.1682],[-16.4264,28.1644],[-16.4314,28.1644],[-16.4343,28.1568],[-16.4323,28.153],[-16.4294,28.1536],[-16.4257,28.1497],[-16.4334,28.1412],[-16.4392,28.1427],[-16.4422,28.1349],[-16.4486,28.1347],[-16.4489,28.1293],[-16.4631,28.1201],[-16.4621,28.1142],[-16.4642,28.1115],[-16.4721,28.1082],[-16.4728,28.1042],[-16.49,28.09],[-16.4892,28.085],[-16.4913,28.0818],[-16.4876,28.0785],[-16.4906,28.0769],[-16.4949,28.0787],[-16.4973,28.075],[-16.4992,28.0775],[-16.5041,28.0757],[-16.5068,28.0677],[-16.5145,28.0629],[-16.5157,28.0595],[-16.5206,28.0592],[-16.5227,28.0526],[-16.5255,28.0501],[-16.5316,28.0496],[-16.5341,28.0427],[-16.5371,28.044],[-16.541,28.0423],[-16.5429,28.0369],[-16.5399,28.0321],[-16.5463,28.025],[-16.5567,28.0313],[-16.5665,28.029],[-16.5745,28.031],[-16.5922,28.0275],[-16.5953,28.0291],[-16.61,28.0227],[-16.6106,28.0206],[-16.6112,28.0219],[-16.6191,28.0186],[-16.6253,28.0187],[-16.6315,28.0126],[-16.6319,28.0094],[-16.6381,28.0093],[-16.6387,28.0061],[-16.6436,28.0037],[-16.6498,28.0076],[-16.6565,28.0054],[-16.6595,28.0085],[-16.6644,28.0085],[-16.6668,28.0034],[-16.6718,28.0046],[-16.6785,27.9982]];

  /* ── TEXTOS Y NUMEROS ───────────────────────────────────────────── */
  function lang() { return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'es'; }
  function t(k, vars) {
    var e = PASE_UI[k], s;
    if (e) s = e[lang()] || e.en || e.es || '';
    else s = (typeof tx === 'function') ? tx(k, vars) : '';
    if (e && vars) for (var v in vars) if (Object.prototype.hasOwnProperty.call(vars, v)) s = s.split('{' + v + '}').join(String(vars[v]));
    return s;
  }
  function loc() { return PASE_LOCALE[lang()] || 'es-ES'; }
  function num(n, dec) {
    dec = dec || 0;
    var s;
    try { s = Number(n).toLocaleString(loc(), { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: true }); }
    catch (e) { return String(Math.round(n)); }
    if (Math.abs(n) >= 1000 && Math.abs(n) < 10000 && /^-?\d{4}(\D|$)/.test(s)) {
      var sep = '.';
      try { sep = (1234567).toLocaleString(loc(), { useGrouping: true }).replace(/\d/g, '').charAt(0) || '.'; } catch (e2) {}
      s = s.replace(/^(-?\d)(\d{3})/, '$1' + sep + '$2');
    }
    return s;
  }
  function distTxt(m) {
    if (m < 1000) return t('paseM', { n: num(Math.max(10, Math.round(m / 10) * 10)) });
    return t('paseKm', { n: num(m / 1000, m < 10000 ? 1 : 0) });
  }
  function durTxt(s) {
    var min = Math.max(1, Math.round(s / 60));
    return min < 60 ? t('paseDurMin', { m: min }) : t('paseDur', { h: Math.floor(min / 60), m: min % 60 });
  }
  var RAD = Math.PI / 180;
  function distGC(a, b) {
    var dLat = (b.lat - a.lat) * RAD, dLng = (b.lng - a.lng) * RAD;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(x)));
  }
  function rumbo(a, b) {
    var p1 = a.lat * RAD, p2 = b.lat * RAD, dl = (b.lng - a.lng) * RAD;
    var g = Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / RAD;
    return ((g % 360) + 360) % 360;
  }
  function haciaTxt(az) { return t('paseHacia_' + ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(az / 45) % 8]); }
  function hoy() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  /* ── LOS LUGARES DE LA APP ──────────────────────────────────────── */
  function lugares() { try { return (typeof places !== 'undefined' && Array.isArray(places)) ? places : []; } catch (e) { return []; } }
  function lugar(id) { var P = lugares(); for (var i = 0; i < P.length; i++) if (P[i] && P[i].id === id) return P[i]; return null; }
  function nombre(p) {
    var n = '';
    try { n = (typeof nombreLugar === 'function') ? nombreLugar(p) : p.name; } catch (e) { n = p && p.name; }
    return String(n || '').replace(/\s*\([^)]*\)\s*$/, '');
  }
  function paradasDe(r) {
    var P = [];
    for (var i = 0; i < r.paradas.length; i++) {
      var p = lugar(r.paradas[i]);
      if (p && isFinite(p.lat) && isFinite(p.lng)) P.push(p);
    }
    return P;
  }
  /* para leer en voz alta: sin emojis ni simbolos */
  function limpiar(s) {
    return String(s || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '').replace(/\s+/g, ' ').trim();
  }
  /* la descripcion de la ficha en el idioma de la app, o en el que la tenga (como localized():
     el chino tradicional cae al simplificado, y lo que no esta, al ingles y luego al castellano),
     con el idioma en que esta, para leerla con la voz de ese idioma */
  function textoLugar(p) {
    var d = p && p.desc;
    if (!d) return null;
    if (typeof d === 'string') return { txt: limpiar(d), lg: 'es' };
    var l = lang(), orden = [l];
    if (l === 'zht') orden.push('zh');
    orden.push('en', 'es');
    for (var i = 0; i < orden.length; i++) if (d[orden[i]]) return { txt: limpiar(d[orden[i]]), lg: orden[i] };
    return null;
  }
  /* el aviso de la ficha (vertigo, carretera…), con el texto de la app (TG_AVISO_TXT, en index.html) */
  function avisoTxt(p) {
    try { return (p && p.warn && typeof window.TG_AVISO_TXT === 'function') ? (window.TG_AVISO_TXT(p.warn) || '') : ''; } catch (e) { return ''; }
  }

  /* ── LA VOZ (TG_VOZ, voces del propio movil) ────────────────────── */
  var VOZ = { ses: 0, activo: false, alAcabar: null, vigia: null };
  function hayVozPara(lg) {
    var V = window.TG_VOZ;
    if (!V || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return false;
    try { return !V.hayVoces() || !!V.vozLocal(lg); } catch (e) { return false; }
  }
  /* partes: [{txt, lg}], una detras de otra, cada una con la voz de su idioma; la que no tiene voz
     se salta. Un vigia por si el motor no avisa del final (algunos Android), como cielo.js */
  function decir(partes, alAcabar) {
    callar();
    var V = window.TG_VOZ, synth = window.speechSynthesis;
    var cola = (partes || []).filter(function (p) { return p && p.txt && hayVozPara(p.lg); });
    if (!V || !synth || !cola.length) { if (alAcabar) alAcabar(false); return false; }
    var ses = ++VOZ.ses;
    VOZ.activo = true; VOZ.alAcabar = alAcabar || null;
    function una(i) {
      if (ses !== VOZ.ses) return;
      if (i >= cola.length) {
        VOZ.activo = false; clearTimeout(VOZ.vigia);
        var f = VOZ.alAcabar; VOZ.alAcabar = null; if (f) f(true);
        return;
      }
      var p = cola[i], u = new SpeechSynthesisUtterance(p.txt), hecho = false;
      try { u.lang = V.locale(p.lg); var v = V.vozLocal(p.lg); if (v) u.voice = v; } catch (e) {}
      u.rate = 0.95;
      function sig() { if (hecho) return; hecho = true; clearTimeout(VOZ.vigia); una(i + 1); }
      u.onend = sig; u.onerror = sig;
      clearTimeout(VOZ.vigia);
      VOZ.vigia = setTimeout(sig, 4000 + p.txt.length * 110);
      try { synth.speak(u); } catch (e) { sig(); }
    }
    una(0);
    return true;
  }
  function callar() {
    VOZ.ses++; VOZ.activo = false; clearTimeout(VOZ.vigia);
    var f = VOZ.alAcabar; VOZ.alAcabar = null;
    try { if (window.TG_VOZ && window.TG_VOZ.parar) window.TG_VOZ.parar(); else if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    if (f) { try { f(false); } catch (e) {} }
  }

  /* ── LO QUE SE GUARDA EN EL DISPOSITIVO ─────────────────────────── */
  /* la busqueda: solo que pistas estan encontradas ({v:1, id, hechas: [ids]}) */
  function leerTesoro() {
    try {
      var o = JSON.parse(localStorage.getItem(TESORO_CLAVE) || 'null');
      if (!o || o.v !== 1 || o.id !== TESORO.id || !Array.isArray(o.hechas)) return [];
      var ids = TESORO.paradas.map(function (x) { return x.id; });
      return o.hechas.filter(function (h, i, a) { return ids.indexOf(h) >= 0 && a.indexOf(h) === i; });
    } catch (e) { return []; }
  }
  function guardarTesoro(hechas) { try { localStorage.setItem(TESORO_CLAVE, JSON.stringify({ v: 1, id: TESORO.id, hechas: hechas })); } catch (e) {} }
  function borrarTesoro() { try { localStorage.removeItem(TESORO_CLAVE); } catch (e) {} }
  /* el dibujo de la carretera de cada ruta (de OSRM): {v:1, c: [[lat, lng]…], m, s, tramos: [m…], f} */
  function claveTrazado(r) { return TRAZADO_CLAVE + r.id; }
  function leerTrazado(r, P) {
    try {
      var o = JSON.parse(localStorage.getItem(claveTrazado(r)) || 'null');
      if (!o || o.v !== 1 || o.p !== r.paradas.join(',') || !Array.isArray(o.c) || o.c.length < 2) return null;
      if (!Array.isArray(o.tramos) || o.tramos.length !== P.length - 1) return null;
      for (var i = 0; i < o.c.length; i++) if (!Array.isArray(o.c[i]) || !isFinite(o.c[i][0]) || !isFinite(o.c[i][1])) return null;
      return o;
    } catch (e) { return null; }
  }
  /* OSRM con solo las paradas (nunca la posicion de nadie). Los tiempos de OSRM son de carretera
     libre: como calculateRoute() de la app, cada tramo no baja de 35 km/h si es corto (menos de
     15 km), de 42 hasta 40 km y de 60 por encima, que en las carreteras de montaña de la isla es
     lo que se tarda de verdad */
  var pidiendo = {};
  function pedirTrazado(r, P, fin) {
    if (pidiendo[r.id]) return;
    if (!window.fetch || P.length < 2) { fin(null); return; }
    pidiendo[r.id] = true;
    var url = OSRM + P.map(function (p) { return (+p.lng).toFixed(5) + ',' + (+p.lat).toFixed(5); }).join(';') + '?overview=full&geometries=geojson&steps=false';
    var ctl = (typeof AbortController === 'function') ? new AbortController() : null;
    var reloj = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      clearTimeout(reloj); pidiendo[r.id] = false;
      var ruta = j && j.code === 'Ok' && j.routes && j.routes[0];
      var co = ruta && ruta.geometry && ruta.geometry.coordinates;
      if (!co || co.length < 2 || !ruta.legs || ruta.legs.length !== P.length - 1) { fin(null); return; }
      var c = [], ant = null;
      for (var i = 0; i < co.length; i++) {
        var q = { lat: +co[i][1], lng: +co[i][0] };
        if (!isFinite(q.lat) || !isFinite(q.lng)) continue;
        if (!ant || i === co.length - 1 || distGC(ant, q) >= 40) { c.push([Math.round(q.lat * 1e5) / 1e5, Math.round(q.lng * 1e5) / 1e5]); ant = q; }
      }
      var s = 0, tramos = [];
      ruta.legs.forEach(function (l) {
        var d = +l.distance || 0, km = d / 1000, tope = km < 15 ? 35 : (km < 40 ? 42 : 60);
        s += Math.max(+l.duration || 0, km / tope * 3600);
        tramos.push(Math.round(d));
      });
      var o = { v: 1, p: r.paradas.join(','), c: c, m: Math.round(+ruta.distance || 0), s: Math.round(s), tramos: tramos, f: hoy() };
      try { localStorage.setItem(claveTrazado(r), JSON.stringify(o)); } catch (e) {}
      fin(o);
    }).catch(function () { clearTimeout(reloj); pidiendo[r.id] = false; fin(null); });
  }

  /* ── EL MAPA PEQUEÑO ────────────────────────────────────────────── */
  /* opc: {trazado, hechas: estado de cada parada, i: la siguiente, pos} */
  function pintarMapa(cv, P, opc) {
    if (!cv || !P.length) return;
    opc = opc || {};
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round((cv.clientWidth || 320) * dpr), H = Math.round((cv.clientHeight || 200) * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var g = cv.getContext('2d');
    var pts = P.map(function (p) { return [+p.lat, +p.lng]; });
    if (opc.trazado) pts = pts.concat(opc.trazado.c);
    if (opc.pos && P.some(function (p) { return distGC(opc.pos, p) < 15000; })) pts.push([opc.pos.lat, opc.pos.lng]);
    var la0 = 90, la1 = -90, lo0 = 180, lo1 = -180;
    pts.forEach(function (q) { la0 = Math.min(la0, q[0]); la1 = Math.max(la1, q[0]); lo0 = Math.min(lo0, q[1]); lo1 = Math.max(lo1, q[1]); });
    var cosL = Math.cos((la0 + la1) / 2 * RAD), mx = (lo1 - lo0) * cosL, my = la1 - la0;
    var cxm = (lo0 + lo1) / 2, cym = (la0 + la1) / 2, pad = 22 * dpr;
    var k = Math.min((W - 2 * pad) / Math.max(mx, 0.03), (H - 2 * pad) / Math.max(my, 0.03));
    function X(lng) { return W / 2 + (lng - cxm) * cosL * k; }
    function Y(lat) { return H / 2 - (lat - cym) * k; }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#0b1626'; g.fillRect(0, 0, W, H);
    if (CONTORNO.length > 2) {
      g.beginPath();
      CONTORNO.forEach(function (q, i) { if (i) g.lineTo(X(q[0]), Y(q[1])); else g.moveTo(X(q[0]), Y(q[1])); });
      g.closePath(); g.fillStyle = '#1b2433'; g.fill();
      g.strokeStyle = 'rgba(212,175,55,0.28)'; g.lineWidth = dpr; g.stroke();
    }
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (opc.trazado) {
      g.beginPath();
      opc.trazado.c.forEach(function (q, i) { if (i) g.lineTo(X(q[1]), Y(q[0])); else g.moveTo(X(q[1]), Y(q[0])); });
      g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 6 * dpr; g.stroke();
      g.strokeStyle = '#F5C76B'; g.lineWidth = 3 * dpr; g.stroke();
    } else {
      g.setLineDash([6 * dpr, 6 * dpr]);
      g.beginPath();
      P.forEach(function (p, i) { if (i) g.lineTo(X(p.lng), Y(p.lat)); else g.moveTo(X(p.lng), Y(p.lat)); });
      g.strokeStyle = 'rgba(245,199,107,0.85)'; g.lineWidth = 2 * dpr; g.stroke();
      g.setLineDash([]);
    }
    var est = opc.hechas || [];
    g.font = '700 ' + Math.round(10.5 * dpr) + "px 'DM Sans', system-ui, sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle';
    P.forEach(function (p, i) {
      var x = X(p.lng), y = Y(p.lat), r = 9 * dpr, hecha = est[i] === 'hecha', sig = opc.i === i;
      g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI);
      g.fillStyle = hecha ? '#D4AF37' : (est[i] === 'saltada' ? '#3a4150' : '#121826'); g.fill();
      g.lineWidth = (sig ? 3 : 1.6) * dpr; g.strokeStyle = sig ? '#ffffff' : '#D4AF37'; g.stroke();
      g.fillStyle = hecha ? '#16120a' : '#f0ece4'; g.fillText(String(i + 1), x, y + 0.5 * dpr);
    });
    if (opc.pos) {
      var px = Math.max(6 * dpr, Math.min(W - 6 * dpr, X(opc.pos.lng))), py = Math.max(6 * dpr, Math.min(H - 6 * dpr, Y(opc.pos.lat)));
      g.beginPath(); g.arc(px, py, 11 * dpr, 0, 2 * Math.PI); g.fillStyle = 'rgba(59,130,246,0.22)'; g.fill();
      g.beginPath(); g.arc(px, py, 5.5 * dpr, 0, 2 * Math.PI); g.fillStyle = '#3b82f6'; g.fill();
      g.lineWidth = 2 * dpr; g.strokeStyle = '#ffffff'; g.stroke();
    }
  }

  /* ── PANTALLA ENCENDIDA Y GPS ───────────────────────────────────── */
  var LOCK = null;
  function despierto(si) {
    try {
      if (si && !LOCK && navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (l) {
          if (!S.despierto) { l.release(); return; }
          LOCK = l;
          try { l.addEventListener('release', function () { if (LOCK === l) LOCK = null; }); } catch (e) {}
        }).catch(function () {});
      }
      if (!si && LOCK) { LOCK.release().catch(function () {}); LOCK = null; }
    } catch (e) {}
    S.despierto = !!si;
  }
  function vigilar(alPos, alError) {
    if (!navigator.geolocation) { alError({ code: 2 }); return null; }
    try {
      return navigator.geolocation.watchPosition(function (p) {
        alPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy || 9999 });
      }, alError, { enableHighAccuracy: true, maximumAge: 4000, timeout: 30000 });
    } catch (e) { alError({ code: 2 }); return null; }
  }
  function dejarDeVigilar(id) { try { if (id !== null && id !== undefined && navigator.geolocation) navigator.geolocation.clearWatch(id); } catch (e) {} }
  function esIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  /* «Como llegar»: la app de mapas del movil, con solo el destino (en coche, o a pie: modo 'w') */
  function urlComoLlegar(lat, lng, modo) {
    var c = (+lat).toFixed(6) + ',' + (+lng).toFixed(6), pie = modo === 'w';
    return esIOS() ? 'https://maps.apple.com/?daddr=' + c + '&dirflg=' + (pie ? 'w' : 'd')
                   : 'https://www.google.com/maps/dir/?api=1&destination=' + c + '&travelmode=' + (pie ? 'walking' : 'driving');
  }

  /* ── EL PANEL Y SUS PANTALLAS ───────────────────────────────────── */
  var S = { abierto: false, pila: [], cerrando: false, yendo: false, marcha: null, tes: null, despierto: false, opener: null, mantener: false, sobrePerfil: false, despues: null };
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined && txt !== null) e.textContent = txt; return e; }
  function boton(txt, cls, fn) { var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); return b; }
  var SVG_OJO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 34l11-13 6 6 8-12 15 19z" fill="#35445d" stroke="#F5C76B" stroke-width="2" stroke-linejoin="round"/><path d="M29 15v-7m0 0l-3 3m3-3l3 3" fill="none" stroke="#8FD3FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 40h40" stroke="#D4AF37" stroke-width="2" stroke-linecap="round"/></svg>';
  var SVG_COCHE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 30l3-9a4 4 0 0 1 4-3h18a4 4 0 0 1 4 3l3 9v7H8z" fill="#35445d" stroke="#F5C76B" stroke-width="2" stroke-linejoin="round"/><circle cx="15" cy="37" r="3" fill="#0F1117" stroke="#F5C76B" stroke-width="2"/><circle cx="33" cy="37" r="3" fill="#0F1117" stroke="#F5C76B" stroke-width="2"/><path d="M36 10c2 2 2 6 0 8M40 7c4 4 4 10 0 14" fill="none" stroke="#8FD3FF" stroke-width="2" stroke-linecap="round"/></svg>';
  var SVG_COFRE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 22h32v16H8z" fill="#35445d" stroke="#F5C76B" stroke-width="2" stroke-linejoin="round"/><path d="M8 22c0-7 5-11 16-11s16 4 16 11" fill="#44546f" stroke="#F5C76B" stroke-width="2" stroke-linejoin="round"/><path d="M21 24h6v6h-6z" fill="#D4AF37"/><path d="M36 6l1.5 3 3 1.5-3 1.5L36 15l-1.5-3-3-1.5 3-1.5z" fill="#8FD3FF"/></svg>';

  function arriba() { return S.pila[S.pila.length - 1] || { v: 'inicio' }; }
  /* Una entrada del historial por pantalla. Si el pasaporte esta debajo, llevan tambien tgPerfil,
     como las de «Su cuerpo»: el popstate de modulos/perfil.js no cierra el pasaporte al volver a
     una entrada que la lleve (sin esto, volver de las rutas al inicio del «Pase» lo cerraba) */
  function sobrePerfil() { var pp = document.getElementById('perfil-panel'); return !!(pp && !pp.hidden); }
  function entrada(n) { var e = { tgPase: n }; if (S.sobrePerfil) e.tgPerfil = 1; return e; }
  function rutaPorId(id) { for (var i = 0; i < RUTAS.length; i++) if (RUTAS[i].id === id) return RUTAS[i]; return null; }
  function enfocar() { try { var h = $('pase-titulo'); if (h) h.focus({ preventScroll: true }); } catch (e) {} }
  /* opc.vista: 'rutas', 'tesoro' o 'ruta:<id>' (los enlaces #pase-rutas, #pase-tesoro) */
  function abrir(opc) {
    opc = opc || {};
    var p = $('pase-panel');
    if (!p) return;
    if (!S.abierto) {
      S.abierto = true; S.pila = [{ v: 'inicio' }];
      S.opener = document.activeElement;
      S.sobrePerfil = sobrePerfil();
      p.hidden = false;
      document.documentElement.classList.add('pase-abierto');
      try { history.pushState(entrada(1), ''); } catch (e) {}
    }
    var v = opc.vista || '';
    if (v === 'rutas' || v === 'tesoro') { if (arriba().v !== v) ir({ v: v }); else pintar(); }
    else if (v.indexOf('ruta:') === 0 && rutaPorId(v.slice(5))) { ir({ v: 'rutas' }); ir({ v: 'ruta', id: v.slice(5) }); }
    else pintar();
    enfocar();
  }
  function ir(e) {
    var ant = arriba();
    S.pila.push(e);
    try { history.pushState(entrada(S.pila.length), ''); } catch (er) {}
    if (ant.v !== 'marcha') callar();
    pintar(); enfocar();
  }
  /* Ir a otra pantalla desde el inicio del «Pase» (al acabar la ruta de Teno, la busqueda del
     tesoro): primero se vuelve por el historial y, en su popstate, se entra. Asi el «atras» de la
     busqueda lleva al inicio y no a la ruta ya terminada */
  function irDesdeInicio(e) {
    var n = S.pila.length;
    if (n <= 1) { ir(e); return; }
    S.despues = e;
    try { history.go(-(n - 1)); } catch (er) { S.despues = null; quitarHasta(1); ir(e); }
  }
  function atras() {
    if (S.cerrando || S.yendo) return;   /* dos toques seguidos: un solo «atras» */
    S.yendo = true;
    setTimeout(function () { S.yendo = false; }, 450);
    try { history.back(); } catch (e) { S.yendo = false; quitarHasta(S.pila.length - 1); }
  }
  function quitarHasta(n) {
    while (S.pila.length > Math.max(0, n)) salirDe(S.pila.pop());
    if (!S.pila.length) { cerrarYa(); return; }
    pintar(); enfocar();
  }
  function salirDe(e) {
    if (!e) return;
    if (e.v === 'marcha') pararMarcha();
    if (e.v === 'tesoro') pararTesoro();
    callar();
  }
  /* El «atras»: la entrada del historial en la que se queda dice a que pantalla se vuelve. Las de
     «¿Qué estoy viendo?» (encima) no son nuestras */
  function alAtras() {
    if (!S.abierto) return;
    S.yendo = false;
    var st = history.state || {};
    if (st.tgHorizonte || st.tgHorizonteHoja) return;
    if (S.cerrando) { S.cerrando = false; quitarHasta(0); return; }
    var n = st.tgPase || 0;
    if (n < S.pila.length) quitarHasta(n);
    if (S.despues && S.pila.length === 1) { var d = S.despues; S.despues = null; ir(d); }
  }
  function cerrar() {
    if (!S.abierto || S.cerrando) return;   /* dos toques seguidos: un solo «atras» */
    var n = S.pila.length;
    S.cerrando = true;
    setTimeout(function () { if (S.cerrando) { S.cerrando = false; quitarHasta(0); } }, 450);
    try { history.go(-n); } catch (e) { S.cerrando = false; quitarHasta(0); }
  }
  function cerrarYa() {
    S.pila.forEach(salirDe); S.pila = [];
    S.abierto = false;
    var p = $('pase-panel'); if (p) p.hidden = true;
    document.documentElement.classList.remove('pase-abierto');
    var c = $('pase-cuerpo'); if (c) c.textContent = '';
    var o = S.opener; S.opener = null;
    try { if (o && o.focus && document.contains(o)) o.focus({ preventScroll: true }); } catch (e) {}
  }
  function pintar() {
    var c = $('pase-cuerpo'), tit = $('pase-titulo');
    if (!c || !tit) return;
    var e = arriba(), r = e.id ? rutaPorId(e.id) : null;
    c.textContent = '';
    if (e.v === 'rutas') { tit.textContent = t('paseRutasTit'); vistaRutas(c); }
    else if (e.v === 'ruta' && r) { tit.textContent = t('paseRuta_' + r.id); vistaRuta(c, r); }
    else if (e.v === 'marcha' && r) { tit.textContent = t('paseRuta_' + r.id); vistaMarcha(c); }
    else if (e.v === 'tesoro') { tit.textContent = t('paseTesoroTit') + ' · ' + t('paseTesoroDonde'); vistaTesoro(c); }
    else { tit.textContent = t('paseTitulo'); vistaInicio(c); }
    var sc = $('pase-scroll');
    if (sc && !S.mantener) sc.scrollTop = 0;
  }
  function tarjeta(svg, titulo, lema, fn) {
    var s = el('section', 'pase-tarjeta'), ico = el('div', 'pase-tarjeta-ico');
    ico.setAttribute('aria-hidden', 'true'); ico.innerHTML = svg;
    var txt = el('div', 'pase-tarjeta-txt'), h = el('h3', null, titulo);
    txt.appendChild(h);
    txt.appendChild(el('span', 'pase-gratis', t('paseGratis')));
    txt.appendChild(el('p', null, lema));
    var b = boton(t('paseAbrir'), 'pase-btn oro', fn);
    b.setAttribute('aria-label', t('paseAbrir') + ': ' + titulo);
    txt.appendChild(b);
    s.appendChild(ico); s.appendChild(txt);
    return s;
  }
  function vistaInicio(c) {
    c.appendChild(el('p', 'pase-intro', t('paseIntro')));
    var av = el('p', 'pase-error'); av.setAttribute('role', 'alert'); av.hidden = true; c.appendChild(av);
    S.avisoInicio = av;
    c.appendChild(tarjeta(SVG_OJO, t('paseHzTit'), t('paseHzLema'), function () { abrirHorizonte(); }));
    c.appendChild(tarjeta(SVG_COCHE, t('paseRutasTit'), t('paseRutasLema'), function () { ir({ v: 'rutas' }); }));
    c.appendChild(tarjeta(SVG_COFRE, t('paseTesoroTit') + ' · ' + t('paseTesoroDonde'), t('paseTesoroLema'), function () { ir({ v: 'tesoro' }); }));
  }
  /* «¿Qué estoy viendo?»: el permiso de los sensores, en este mismo toque (iOS solo lo deja pedir
     dentro de un toque, y cargar el modulo lleva un momento); luego modulos/horizonte.js */
  function abrirHorizonte() {
    var pedir = null;
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function')
        pedir = DeviceOrientationEvent.requestPermission();
    } catch (e) { pedir = null; }
    var av = S.avisoInicio;
    if (av) av.hidden = true;
    var fallo = function () { if (av && document.contains(av)) { av.textContent = t('paseNoAbre'); av.hidden = false; } };
    if (typeof window.TG_HORIZONTE_CARGAR !== 'function') { fallo(); return; }
    window.TG_HORIZONTE_CARGAR().then(function () {
      if (!S.abierto) return;
      window.TG_HORIZONTE.abrir({ permiso: pedir });
    }, fallo);
  }

  /* ── LAS RUTAS ──────────────────────────────────────────────────── */
  function vistaRutas(c) {
    c.appendChild(el('p', 'pase-intro', t('paseRutasLema')));
    RUTAS.forEach(function (r) {
      var P = paradasDe(r);
      if (P.length < 2) return;
      var b = el('button', 'pase-ruta-item'); b.type = 'button';
      b.appendChild(el('span', 'pase-ruta-n', t('paseRuta_' + r.id)));
      b.appendChild(el('span', 'pase-ruta-s', t('paseDeA', { a: nombre(P[0]), b: nombre(P[P.length - 1]) })));
      var tr = leerTrazado(r, P);
      b.appendChild(el('span', 'pase-ruta-d', t('paseParadas', { n: P.length }) + (tr ? ' · ' + t('paseKmT', { km: num(tr.m / 1000), t: durTxt(tr.s) }) : '')));
      b.addEventListener('click', function () { ir({ v: 'ruta', id: r.id }); });
      c.appendChild(b);
    });
  }
  function escucharParada(p, b) {
    if (b.getAttribute('data-sonando') === '1') { callar(); return; }
    var d = textoLugar(p), partes = [{ txt: nombre(p) + '.', lg: lang() }];
    if (d) partes.push(d);
    var a = limpiar(avisoTxt(p)); if (a) partes.push({ txt: a, lg: lang() });
    var todos = document.querySelectorAll('#pase-cuerpo .pase-escuchar[data-sonando="1"]');
    for (var i = 0; i < todos.length; i++) { todos[i].setAttribute('data-sonando', '0'); todos[i].textContent = '▶'; }
    var ok = decir(partes, function () {
      b.setAttribute('data-sonando', '0'); b.textContent = '▶';
      b.setAttribute('aria-label', t('paseEscuchar', { x: nombre(p) }));
    });
    if (ok) { b.setAttribute('data-sonando', '1'); b.textContent = '■'; b.setAttribute('aria-label', t('paseParar')); }
  }
  function vistaRuta(c, r) {
    var P = paradasDe(r);
    if (P.length < 2) return;
    c.appendChild(el('p', 'pase-sub', t('paseDeA', { a: nombre(P[0]), b: nombre(P[P.length - 1]) }) + ' · ' + t('paseParadas', { n: P.length })));
    var km = el('p', 'pase-dato'); km.hidden = true; c.appendChild(km);
    var cv = el('canvas', 'pase-mapa'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', t('paseMapaAria')); c.appendChild(cv);
    var nota = el('p', 'pase-nota pase-creditos'); c.appendChild(nota);
    var poner = function (tr) {
      km.textContent = tr ? t('paseKmT', { km: num(tr.m / 1000), t: durTxt(tr.s) }) : '';
      km.hidden = !tr;
      nota.textContent = tr ? t('paseCarretera') + ' · ' + t('paseContorno') : t('paseRecta') + ' ' + t('paseContorno');
      pintarMapa(cv, P, { trazado: tr });
    };
    var tr = leerTrazado(r, P);
    requestAnimationFrame(function () { poner(tr); });
    if (!tr) pedirTrazado(r, P, function (o) {
      if (!o) return;
      tr = o;
      var e = arriba();
      if (e.v === 'ruta' && e.id === r.id && document.contains(cv)) poner(o);
    });
    var av = el('p', 'pase-aviso', t('paseConducir')); av.setAttribute('role', 'note'); c.appendChild(av);
    var avisos = [];
    P.forEach(function (p) { var a = avisoTxt(p); if (a && avisos.indexOf(a) < 0) avisos.push(a); });
    var caja = el('section', 'pase-caja');
    caja.appendChild(el('h3', null, t('paseEnRuta')));
    if (avisos.length) { var ul = el('ul'); avisos.forEach(function (a) { ul.appendChild(el('li', null, a)); }); caja.appendChild(ul); }
    if (typeof window.abrirAntes === 'function') caja.appendChild(boton(t('paseVerAntes', { t: (typeof tx === 'function' ? tx('antesTitulo') : '') }), 'pase-btn', function () { window.abrirAntes(); }));
    c.appendChild(caja);
    c.appendChild(el('p', 'pase-nota', t('paseVozNota') + (hayVozPara(lang()) ? '' : ' ' + t('paseSinVoz'))));
    var ol = el('ol', 'pase-paradas');
    P.forEach(function (p, i) {
      var li = el('li');
      li.appendChild(el('span', 'pase-num', String(i + 1)));
      li.appendChild(el('span', 'pase-parada-n', nombre(p)));
      var b = el('button', 'pase-escuchar', '▶'); b.type = 'button';
      b.setAttribute('aria-label', t('paseEscuchar', { x: nombre(p) }));
      b.addEventListener('click', function () { escucharParada(p, b); });
      li.appendChild(b);
      ol.appendChild(li);
    });
    c.appendChild(ol);
    var acc = el('div', 'pase-acciones');
    acc.appendChild(boton(t('paseEmpezar'), 'pase-btn oro grande', function () { empezar(r); }));
    var a = el('a', 'pase-btn', t('paseLlegar'));
    a.href = urlComoLlegar(P[0].lat, P[0].lng, 'd'); a.target = '_blank'; a.rel = 'noopener';
    acc.appendChild(a);
    c.appendChild(acc);
  }
  /* «Empezar la ruta»: lo primero que se dice va dentro de este toque (en iOS, lo que se dice luego
     al llegar a cada parada ya no necesita otro); despues el GPS y la pantalla encendida */
  function empezar(r) {
    var P = paradasDe(r);
    if (P.length < 2) return;
    S.marcha = { r: r, P: P, i: 0, est: P.map(function () { return null; }), voz: true, pos: null, gps: null, gpsNo: false,
                 fin: false, ultimo: null, texto: null, tr: leerTrazado(r, P), ui: null };
    ir({ v: 'marcha', id: r.id });
    var intro = [{ txt: t('paseVozIntro', { r: t('paseRuta_' + r.id), n: P.length, p: nombre(P[0]) }), lg: lang() }];
    S.marcha.ultimo = intro;
    decir(intro);
    S.marcha.gps = vigilar(alPosMarcha, alErrorMarcha);
    despierto(true);
  }
  function vistaMarcha(c) {
    var M = S.marcha;
    if (!M) { c.appendChild(el('p', 'pase-nota', t('paseFin'))); return; }
    var caja = el('section', 'pase-prox');
    var eye = el('div', 'pase-eyebrow'), n = el('div', 'pase-prox-n'), d = el('div', 'pase-prox-d');
    n.setAttribute('aria-live', 'polite');
    caja.appendChild(eye); caja.appendChild(n); caja.appendChild(d); c.appendChild(caja);
    var gps = el('p', 'pase-gps'); gps.setAttribute('role', 'status'); c.appendChild(gps);
    var cv = el('canvas', 'pase-mapa'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', t('paseMapaAria')); c.appendChild(cv);
    var texto = el('div', 'pase-texto'); c.appendChild(texto);
    var bots = el('div', 'pase-botones');
    var bVoz = boton('', 'pase-btn', function () { M.voz = !M.voz; if (!M.voz) callar(); repintarMarcha(); });
    var bRep = boton(t('paseRepetir'), 'pase-btn', function () { if (M.ultimo) decir(M.ultimo); });
    var bSal = boton(t('paseSaltar'), 'pase-btn', function () { saltar(); });
    var bFin = boton(t('paseTerminar'), 'pase-btn', function () { atras(); });
    [bVoz, bRep, bSal, bFin].forEach(function (b) { bots.appendChild(b); });
    c.appendChild(bots);
    c.appendChild(el('p', 'pase-nota', t('pasePantalla')));
    var fin = el('section', 'pase-fin'); fin.hidden = true; c.appendChild(fin);
    M.ui = { eye: eye, n: n, d: d, gps: gps, cv: cv, texto: texto, bVoz: bVoz, bSal: bSal, fin: fin };
    requestAnimationFrame(repintarMarcha);
  }
  function repintarMarcha() {
    var M = S.marcha;
    if (!M || !M.ui || !document.contains(M.ui.cv)) return;
    var U = M.ui, P = M.P;
    if (M.fin) {
      U.eye.textContent = ''; U.n.textContent = t('paseFin'); U.d.textContent = '';
      U.bSal.hidden = true;
      if (U.fin.hidden) {
        U.fin.hidden = false;
        if (M.r.id === 'teno') {
          U.fin.appendChild(el('p', null, t('paseIrTesoro')));
          U.fin.appendChild(boton(t('paseTesoroTit') + ' · ' + t('paseTesoroDonde'), 'pase-btn oro', function () { irDesdeInicio({ v: 'tesoro' }); }));
        } else U.fin.hidden = true;
      }
    } else {
      var p = P[M.i];
      U.eye.textContent = t('paseProxima') + ' · ' + t('paseDeN', { i: M.i + 1, n: P.length });
      if (U.n.textContent !== nombre(p)) U.n.textContent = nombre(p);
      U.d.textContent = M.pos ? t('paseA', { d: distTxt(distGC(M.pos, p)) }) : '';
    }
    U.gps.textContent = M.fin ? '' : (M.gpsNo ? t('paseGpsNo') : (!M.pos ? t('paseEsperaGps') : (M.pos.acc > 200 ? t('paseImprecisa', { m: distTxt(M.pos.acc) }) : '')));
    U.gps.hidden = !U.gps.textContent;
    U.bVoz.textContent = M.voz ? t('pasePausar') : t('paseVozSi');
    U.bVoz.setAttribute('aria-pressed', M.voz ? 'false' : 'true');
    U.texto.textContent = M.texto || '';
    U.texto.hidden = !M.texto;
    pintarMapa(U.cv, P, { trazado: M.tr, hechas: M.est, i: M.fin ? -1 : M.i, pos: M.pos });
  }
  /* cada posicion: ¿esta ya en alguna de las paradas que quedan? (la siguiente o una de mas
     adelante, si se ha saltado alguna). Con mas de 200 m de margen no se decide nada */
  function alPosMarcha(pos) {
    var M = S.marcha;
    if (!M || M.fin) return;
    M.pos = pos; M.gpsNo = false;
    if (pos.acc <= 200) {
      for (var k = M.i; k < M.P.length; k++) {
        if (distGC(pos, M.P[k]) <= RADIO_PARADA + Math.min(pos.acc, 100)) { llegar(k); break; }
      }
    }
    repintarMarcha();
  }
  function alErrorMarcha(e) {
    var M = S.marcha;
    if (!M) return;
    if (e && e.code === 1) M.gpsNo = true;
    repintarMarcha();
  }
  function siguienteParte(k) {
    var M = S.marcha, q = M.P[k + 1], tr = M.tr;
    if (tr && tr.tramos && tr.tramos[k]) return { txt: t('paseVozSiguiente', { p: nombre(q), d: distTxt(tr.tramos[k]) }), lg: lang() };
    return { txt: t('paseVozSiguienteSin', { p: nombre(q) }), lg: lang() };
  }
  function llegar(k) {
    var M = S.marcha, P = M.P;
    for (var j = M.i; j < k; j++) M.est[j] = 'saltada';
    M.est[k] = 'hecha'; M.i = k + 1;
    var p = P[k], d = textoLugar(p), partes = [{ txt: nombre(p) + '.', lg: lang() }];
    if (d) partes.push(d);
    var a = limpiar(avisoTxt(p)); if (a) partes.push({ txt: a, lg: lang() });
    partes.push(k + 1 < P.length ? siguienteParte(k) : { txt: t('paseVozFin'), lg: lang() });
    M.ultimo = partes;
    M.texto = nombre(p) + '. ' + (d ? d.txt : '');
    if (M.voz) decir(partes);
    try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) {}
    if (k + 1 >= P.length) acabar();
  }
  function saltar() {
    var M = S.marcha;
    if (!M || M.fin) return;
    M.est[M.i] = 'saltada'; M.i++;
    if (M.i >= M.P.length) { acabar(); M.ultimo = [{ txt: t('paseVozFin'), lg: lang() }]; }
    else M.ultimo = [siguienteParte(M.i - 1)];
    if (M.voz) decir(M.ultimo);
    repintarMarcha();
  }
  function acabar() { var M = S.marcha; M.fin = true; dejarDeVigilar(M.gps); M.gps = null; despierto(false); }
  function pararMarcha() { var M = S.marcha; if (!M) return; dejarDeVigilar(M.gps); despierto(false); callar(); S.marcha = null; }

  /* ── LA BUSQUEDA DEL TESORO ─────────────────────────────────────── */
  function primeraPendiente(hechas) {
    for (var i = 0; i < TESORO.paradas.length; i++) if (hechas.indexOf(TESORO.paradas[i].id) < 0) return i;
    return -1;
  }
  function vistaTesoro(c) {
    var T = S.tes;
    if (!T) {
      T = S.tes = { pos: null, gps: null, gpsNo: false, ultD: null, tend: 0, ayuda: false, rendida: false, recien: null, msg: '', ui: null };
      T.gps = vigilar(alPosTesoro, alErrorTesoro);
    }
    var hechas = leerTesoro(), n = TESORO.paradas.length, i = primeraPendiente(hechas);
    c.appendChild(el('p', 'pase-intro', t('paseTesoroLema')));
    c.appendChild(el('p', 'pase-nota', t('paseTesoroComo')));
    var prog = el('div', 'pase-progreso'); prog.setAttribute('aria-hidden', 'true');
    TESORO.paradas.forEach(function (x, k) { prog.appendChild(el('span', 'pase-punto' + (hechas.indexOf(x.id) >= 0 ? ' hecho' : (k === i ? ' actual' : '')))); });
    c.appendChild(prog);
    var estado = el('p', 'pase-gps'); estado.setAttribute('role', 'status');
    var lejos = el('div', 'pase-lejos'); lejos.hidden = true;
    T.ui = { estado: estado, lejos: lejos, dist: null };
    if (T.recien !== null) {
      var x = TESORO.paradas[T.recien], card = el('section', 'pase-caja pase-hallazgo');
      card.appendChild(el('h3', null, t('paseEncontrada')));
      card.appendChild(el('p', 'pase-hallazgo-n', x.nombre));
      card.appendChild(el('p', null, t('paseTesoroDato_' + x.id)));
      var fila = el('div', 'pase-acciones');
      fila.appendChild(boton(t('paseLeer'), 'pase-btn', function () { decir([{ txt: t('paseTesoroDato_' + x.id), lg: lang() }]); }));
      if (i >= 0) fila.appendChild(boton(t('paseSiguientePista'), 'pase-btn oro', function () { T.recien = null; pintar(); }));
      card.appendChild(fila);
      c.appendChild(card);
      if (i < 0) c.appendChild(finalTesoro(n));
    } else if (i < 0) {
      c.appendChild(finalTesoro(n));
    } else {
      var p = TESORO.paradas[i], pista = el('section', 'pase-caja pase-pista');
      pista.appendChild(el('h3', null, t('pasePista', { i: i + 1, n: n })));
      pista.appendChild(el('p', 'pase-pista-t', t('paseTesoroPista_' + p.id)));
      var dist = el('p', 'pase-dato'); pista.appendChild(dist); T.ui.dist = dist;
      if (T.rendida) pista.appendChild(el('p', 'pase-revela', t('paseEs', { x: p.nombre })));
      c.appendChild(pista);
      c.appendChild(estado);
      c.appendChild(lejos);
      var acc = el('div', 'pase-acciones');
      acc.appendChild(boton(t('paseAyuda'), 'pase-btn', function () { T.ayuda = true; repintarTesoro(); }));
      acc.appendChild(boton(t('paseEstoyAqui'), 'pase-btn oro', function () { comprobarAqui(i); }));
      if (!T.rendida) acc.appendChild(boton(t('paseRendirse'), 'pase-btn', function () { T.rendida = true; pintar(); }));
      else {
        var a = el('a', 'pase-btn', '↗ ' + p.nombre);
        a.href = urlComoLlegar(p.lat, p.lng, 'w'); a.target = '_blank'; a.rel = 'noopener'; acc.appendChild(a);
      }
      c.appendChild(acc);
    }
    if (hechas.length) {
      var ul = el('ul', 'pase-hechas');
      TESORO.paradas.forEach(function (x) { if (hechas.indexOf(x.id) >= 0) ul.appendChild(el('li', null, '✓ ' + x.nombre)); });
      c.appendChild(ul);
      if (i >= 0) c.appendChild(boton(t('paseTesoroOtraVez'), 'pase-btn pase-discreto', reiniciarTesoro));
    }
    c.appendChild(el('p', 'pase-nota pase-creditos', t('paseTesoroFuentes')));
    repintarTesoro();
  }
  function finalTesoro(n) {
    var s = el('section', 'pase-caja pase-final');
    s.appendChild(el('h3', null, t('paseTesoroFin', { n: n })));
    s.appendChild(boton(t('paseTesoroOtraVez'), 'pase-btn', reiniciarTesoro));
    return s;
  }
  function reiniciarTesoro() { borrarTesoro(); var T = S.tes; if (T) { T.recien = null; T.ayuda = false; T.rendida = false; T.ultD = null; T.tend = 0; T.msg = ''; } pintar(); }
  function repintarTesoro() {
    var T = S.tes;
    if (!T || !T.ui) return;
    var hechas = leerTesoro(), i = primeraPendiente(hechas), U = T.ui, txt = '';
    if (T.recien === null && i >= 0) {
      var p = TESORO.paradas[i];
      if (T.gpsNo) txt = t(window.TGO_NATIVO ? 'paseGpsTesoroApp' : 'paseGpsTesoro');
      else if (!T.pos) txt = t('paseEsperaGps');
      else {
        var d = distGC(T.pos, p), lejos = distGC(T.pos, TESORO.centro);
        if (U.dist) U.dist.textContent = t('paseFalta', { d: distTxt(d) }) + (T.tend ? ' · ' + t(T.tend > 0 ? 'paseCerca' : 'paseLejos') : '');
        if (T.pos.acc > MARGEN_TESORO) txt = t('paseTesoroImprecisa', { m: distTxt(T.pos.acc) });
        if (T.ayuda) txt = (txt ? txt + ' ' : '') + t('paseAyudaTxt', { r: haciaTxt(rumbo(T.pos, p)), d: distTxt(d) });
        if (T.msg) txt = T.msg + (txt ? ' ' + txt : '');
        U.lejos.textContent = '';
        U.lejos.hidden = lejos <= LEJOS_TESORO;
        if (!U.lejos.hidden) {
          U.lejos.appendChild(el('p', null, t('paseTesoroLejos', { d: distTxt(lejos) })));
          var a = el('a', 'pase-btn', t('paseLlegarGarachico'));
          a.href = urlComoLlegar(TESORO.centro.lat, TESORO.centro.lng, 'd'); a.target = '_blank'; a.rel = 'noopener';
          U.lejos.appendChild(a);
        }
      }
    }
    U.estado.textContent = txt;
    U.estado.hidden = !txt;
  }
  function encontrar(i) {
    var T = S.tes, hechas = leerTesoro(), x = TESORO.paradas[i];
    if (hechas.indexOf(x.id) < 0) hechas.push(x.id);
    guardarTesoro(hechas);
    T.recien = i; T.ayuda = false; T.rendida = false; T.ultD = null; T.tend = 0; T.msg = '';
    try { if (navigator.vibrate) navigator.vibrate([60, 60, 120]); } catch (e) {}
    pintar();
  }
  /* a unos pasos (RADIO_TESORO, mas el margen del GPS hasta 30 m) y con el GPS fino */
  function alPosTesoro(pos) {
    var T = S.tes;
    if (!T) return;
    T.pos = pos; T.posT = Date.now(); T.gpsNo = false;
    var i = primeraPendiente(leerTesoro());
    if (i >= 0 && T.recien === null) {
      var d = distGC(pos, TESORO.paradas[i]);
      if (T.ultD === null) T.ultD = d;
      else if (Math.abs(d - T.ultD) >= 8) { T.tend = d < T.ultD ? 1 : -1; T.ultD = d; }
      if (pos.acc <= MARGEN_TESORO && d <= RADIO_TESORO + Math.min(pos.acc, 30)) { encontrar(i); return; }
    }
    repintarTesoro();
  }
  function alErrorTesoro(e) { var T = S.tes; if (!T) return; if (e && e.code === 1) T.gpsNo = true; repintarTesoro(); }
  /* «Estoy aquí»: con la ultima posicion, si es de hace menos de 10 s, o con una nueva; y con un
     poco mas de margen que la vigilancia */
  function comprobarAqui(i) {
    var T = S.tes;
    if (!T) return;
    var decidir = function (pos) {
      T.pos = pos; T.msg = '';
      var d = distGC(pos, TESORO.paradas[i]);
      if (pos.acc <= MARGEN_TESORO * 1.5 && d <= RADIO_TESORO + Math.min(pos.acc, 50)) { encontrar(i); return; }
      T.msg = t('paseAunNo', { d: distTxt(d) });
      repintarTesoro();
    };
    if (T.pos && T.posT && Date.now() - T.posT < 10000) { decidir(T.pos); return; }
    if (!navigator.geolocation) return;
    T.msg = t('paseEsperaGps'); repintarTesoro();
    try {
      navigator.geolocation.getCurrentPosition(function (p) {
        if (S.tes !== T) return;
        T.posT = Date.now();
        decidir({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy || 9999 });
      }, function (e) { if (S.tes !== T) return; T.msg = ''; alErrorTesoro(e); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 });
    } catch (e) { T.msg = ''; }
  }
  function pararTesoro() { var T = S.tes; if (!T) return; dejarDeVigilar(T.gps); S.tes = null; }

  /* ── ARRANQUE ───────────────────────────────────────────────────── */
  window.addEventListener('popstate', alAtras);
  /* Escape: un paso atras, si el «Pase» es lo de arriba. Lo que se abre encima tiene el suyo
     («¿Qué estoy viendo?», «Antes de salir», el SOS, la privacidad, la cuenta), y el pasaporte de
     debajo deja pasar este (fichaEncima, en modulos/perfil.js) */
  function hayEncima() {
    try { if (window.TG_HORIZONTE && TG_HORIZONTE.abierto()) return true; } catch (e) {}
    var ids = ['antes-panel', 'sos-panel'];
    for (var i = 0; i < ids.length; i++) { var x = $(ids[i]); if (x && !x.hidden) return true; }
    var pp = $('privacy-panel'), m = $('auth-modal-backdrop');
    return !!((pp && pp.classList.contains('open')) || (m && m.classList.contains('show')));
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !S.abierto || e.defaultPrevented || hayEncima()) return;
    e.preventDefault(); atras();
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && S.marcha && !S.marcha.fin) { LOCK = null; despierto(true); }
  });
  (function () { var b = $('pase-atras'); if (b) b.addEventListener('click', atras); })();
  try { TG_IDIOMA.registrar('«Pase de viaje»', function () { if (S.abierto) { S.mantener = true; pintar(); S.mantener = false; } }); } catch (e) {}

  /* Para index.html (abrirPase) y para tools/probar_pase.js */
  window.TG_PASE = {
    abrir: abrir, cerrar: cerrar, abierto: function () { return S.abierto; }, filas: PASE_UI,
    _prueba: {
      rutas: RUTAS, tesoro: TESORO, contorno: CONTORNO, estado: function () { return S; }, paradasDe: paradasDe, textoLugar: textoLugar,
      leerTesoro: leerTesoro, borrarTesoro: borrarTesoro, leerTrazado: leerTrazado, pedirTrazado: pedirTrazado, distGC: distGC,
      alPosMarcha: alPosMarcha, alPosTesoro: alPosTesoro, num: num, distTxt: distTxt, durTxt: durTxt, radio: RADIO_PARADA, radioTesoro: RADIO_TESORO
    }
  };
})();
