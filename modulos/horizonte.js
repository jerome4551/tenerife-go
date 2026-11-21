/* modulos/horizonte.js — «¿Qué estoy viendo?» (21 de noviembre de 2026).

   QUE ES. Jerome, el 20 de noviembre de 2026, sobre el «Pase de viaje»: «Necesito que prepara el
   trabajo por esta función, de momento gratis». Se apunta el móvil al horizonte y dice qué cima,
   qué pueblo o qué isla se tiene delante (lo que hace PeakFinder). Va dentro del «Pase de viaje»
   (modulos/pase.js), gratis por ahora.

   NO TRAE NI UN DATO NUEVO DE LUGARES. Todo sale de lo que la app ya tiene:
     · el relieve de mapa/tenerife-relieve.png (IGN MDT05, celdas de 60 m, Web Mercator; el mismo
       de «La isla en 3D», con su .json y sus sumas de control, que se comprueban igual: si el PNG
       no llega intacto no se pinta nada);
     · los nombres de las cimas (436, con su altura) y de los pueblos de OpenStreetMap que trae ese
       .json (rotulos.cimas y rotulos.lugares), los pueblos y ciudades de la app (places[],
       categorias «ciudad» y «municipio») y el Teide con la altitud oficial de su ficha (3.715 m),
       como modulos/isla3d.js;
     · las otras cuatro islas por su cima, con la posicion de los vertices geodesicos del IGN
       (ISLAS, abajo, con la reseña de cada uno). Sus alturas solo sirven para calcular si se ven;
       en pantalla sale la isla, la cima y la distancia.
   Lo que se calcula: desde donde esta (o desde el mirador que elija), un rayo cada cuarto de grado
   que recorre el relieve con la curvatura de la Tierra y la refraccion habitual (k = 0,13). Lo que
   queda por encima de todo lo de delante se ve; lo demas, no. Con calima o nubes puede no verse lo
   que dice, y la pantalla lo avisa.

   LOS SENSORES Y LA CAMARA, como «Apunte al cielo» (modulos/cielo.js): la orientacion del movil
   con la matriz de la especificacion W3C, el rumbo de la brujula de iOS (webkitCompassHeading)
   tomado con el movil inclinado hacia delante, la declinacion del WMM2025 en Izaña (HZ_DECL, la
   misma tabla de datos/cielo.json) y un filtro de 90 ms. La camara de atras, con el campo de un
   26 mm. Si los nombres no caen en su sitio, se arrastra a un lado; «↺» lo quita. Sin sensores
   (un ordenador, o sin permiso) se arrastra para girar y se pellizca para acercar.

   NADA SALE DEL MOVIL: ni la posicion, ni la orientacion, ni la imagen de la camara (solo se
   enseña). Ver ppDatosSensores y ppDatosCamara en la politica de privacidad. No guarda nada.

   COMO SE PINTA. Un lienzo (canvas) y botones con createElement y textContent; innerHTML solo
   para los SVG de este fichero. Los textos, de HZ_UI (once idiomas). Al cambiar de idioma se
   repinta (TG_IDIOMA). El boton «atras» del movil cierra la vista (una entrada de historial). */
(function () {
  'use strict';
  if (window.TG_HORIZONTE) return;

  var RAD = Math.PI / 180;
  var R_T = 6371008.8;             // radio medio de la Tierra (m)
  var K_REFR = 0.13;               // coeficiente de refraccion terrestre habitual
  var R_EF = R_T / (1 - K_REFR);   // radio efectivo: curvatura menos refraccion
  var R_WM = 6378137;              // el radio de Web Mercator, el de la malla del relieve
  var OJO = 1.7;                   // los ojos, sobre el suelo (m)
  var PASO_AZ = 0.25;              // grados entre rayos
  var N_RAYOS = 1440;
  var CERCA = 90;                  // los primeros metros no tapan: la celda de 60 m de donde se esta
  var BANDAS = [1500, 4000, 10000, 25000];   // las capas del dibujo, de cerca a lejos (m)
  var NB = BANDAS.length + 1;
  var TOL = 0.0004;                // radianes (0,02 grados): lo que roza la linea se ve
  var POR_ENCIMA_PUEBLO = 15;      // un pueblo se ve si se ve algo de sus casas: 15 m sobre el suelo
  var META_URL = 'mapa/tenerife-relieve.json', PNG_URL = 'mapa/tenerife-relieve.png';
  var CAMARA_LARGO = 2 * Math.atan(17.3 / 26) / RAD;   // 26 mm equivalentes, como cielo.js
  /* La declinacion magnetica del WMM2025 en Izaña, la de «Apunte al cielo» (datos/cielo.json,
     «declinacion», hecha por tools/cielo_wmm.js): tools/probar_pase.js comprueba que es la misma */
  var HZ_DECL = [[2025, -3.872], [2026, -3.714], [2027, -3.556], [2028, -3.398], [2029, -3.24], [2030, -3.082]];
  /* Las otras islas, por su cima (vertices geodesicos del IGN, REGCAN95; consultados el 21 de
     noviembre de 2026). h solo sirve para saber si se ve; en pantalla no sale:
       gc: vertice 110421 «Pico de las Nieves», (BP) 1949,984 m
           https://datos-geodesia.ign.es/Red_Geodesica/Hoja1104/110421.pdf
       go: señal 2926001 de la REDNAP, en la base del vertice 109721 «Garajonay» (±0,05 m);
           la cota, 1.487 m, la del folleto del Parque Nacional de Garajonay (MITECO)
           https://datos-geodesia.ign.es/REDNAP/Lin02926/Lin02926.pdf
       lp: señal 21921005 de la REDNAP, empotrada en el vertice «Roque de los Muchachos» (±1-10 m);
           la cota, 2.426 m, la de la visita virtual del Parque Nacional de la Caldera de Taburiente
           https://datos-geodesia.ign.es/REDNAP/Lin21921/21921005.pdf
       hi: vertice 110554 «Malpaso», (BP) 1502,053 m
           https://datos-geodesia.ign.es/Red_Geodesica/Hoja1105/110554.pdf
     Lanzarote y Fuerteventura, a mas de 200 km, no se nombran. */
  var ISLAS = [
    { id: 'gc', pico: 'Pico de las Nieves', lat: 27 + 57 / 60 + 42.93989 / 3600, lng: -(15 + 34 / 60 + 18.38392 / 3600), h: 1949.984 },
    { id: 'go', pico: 'Alto de Garajonay', lat: 28 + 6 / 60 + 35.04 / 3600, lng: -(17 + 14 / 60 + 54.06 / 3600), h: 1487 },
    { id: 'lp', pico: 'Roque de los Muchachos', lat: 28 + 45 / 60 + 16 / 3600, lng: -(17 + 53 / 60 + 6 / 3600), h: 2426 },
    { id: 'hi', pico: 'Malpaso', lat: 27 + 43 / 60 + 45.48353 / 3600, lng: -(18 + 2 / 60 + 25.69146 / 3600), h: 1502.053 }
  ];
  /* Las cimas que la capa de OSM no trae como pico: el Teide (va como volcan), con el sitio de su
     ficha y la altitud oficial que dice la propia ficha («3.715 m»), como modulos/isla3d.js */
  var HITOS = [{ id: 'pico-teide-cumbre', clave: 'hzTeide', m: 3715 }];
  var MAYORES = ['Santa Cruz de Tenerife', 'San Cristóbal de La Laguna'];
  /* Los miradores entre los que elegir: los de la categoria «mirador» y los que llevan «mirador-»
     en su identificador (el del Teleferico, Cruz del Carmen, Pico del Ingles…) */
  function esMirador(p) { return !!p && (p.category === 'mirador' || /^mirador-/.test(String(p.id || ''))) && isFinite(p.lat) && isFinite(p.lng); }

  /* SIN-TRADUCIR: HZ_LOCALE codigos de idioma para Intl (numeros), no textos */
  var HZ_LOCALE = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL', ro: 'ro-RO' };
  /* SIN-TRADUCIR: HZ_NOMBRE la clave name:xx de OpenStreetMap que corresponde a cada idioma de la app */
  var HZ_NOMBRE = { es: 'name:es', en: 'name:en', fr: 'name:fr', de: 'name:de', it: 'name:it', nl: 'name:nl', zh: 'name:zh-Hans', zht: 'name:zh-Hant', bg: 'name:bg', pl: 'name:pl', ro: 'name:ro' };

  var HZ_UI = {
    "hzTitulo": {"es": "¿Qué estoy viendo?", "en": "What am I looking at?", "fr": "Qu’est-ce que je vois ?", "de": "Was sehe ich da?", "it": "Che cosa sto guardando?", "nl": "Wat zie ik daar?", "zh": "我看到的是什么？", "zht": "我看到的是什麼？", "bg": "Какво виждам?", "pl": "Na co patrzę?", "ro": "Ce văd?"},
    "hzCargando": {"es": "Calculando lo que se ve desde aquí…", "en": "Working out what can be seen from here…", "fr": "Calcul de ce que l’on voit d’ici…", "de": "Es wird berechnet, was man von hier aus sieht…", "it": "Sto calcolando che cosa si vede da qui…", "nl": "Berekenen wat er van hieruit te zien is…", "zh": "正在计算从这里能看到什么…", "zht": "正在計算從這裡能看到什麼…", "bg": "Изчислява се какво се вижда оттук…", "pl": "Obliczanie, co widać z tego miejsca…", "ro": "Se calculează ce se vede de aici…"},
    "hzBuscandoPos": {"es": "Buscando su posición…", "en": "Finding your location…", "fr": "Recherche de votre position…", "de": "Ihr Standort wird ermittelt…", "it": "Ricerca della sua posizione…", "nl": "Uw locatie wordt bepaald…", "zh": "正在获取您的位置…", "zht": "正在取得您的位置…", "bg": "Търси се местоположението ви…", "pl": "Ustalanie lokalizacji…", "ro": "Se caută poziția dumneavoastră…"},
    "hzFuera": {"es": "Está fuera de Tenerife: elija un mirador para ver lo que se ve desde allí.", "en": "You are not on Tenerife: choose a viewpoint to see what can be seen from there.", "fr": "Vous n’êtes pas à Tenerife : choisissez un belvédère pour voir ce que l’on voit de là-bas.", "de": "Sie sind nicht auf Teneriffa: Wählen Sie einen Aussichtspunkt, um zu sehen, was man von dort aus sieht.", "it": "Non si trova a Tenerife: scelga un belvedere per vedere che cosa si vede da lì.", "nl": "U bent niet op Tenerife: kies een uitkijkpunt om te zien wat u vandaar ziet.", "zh": "您不在特内里费岛：请选择一个观景台，看看从那里能看到什么。", "zht": "您不在特內里費島：請選擇一個觀景台，看看從那裡能看到什麼。", "bg": "Не сте на Тенерифе: изберете панорамно място, за да видите какво се вижда оттам.", "pl": "Ta lokalizacja jest poza Teneryfą: wystarczy wybrać punkt widokowy, żeby zobaczyć, co stamtąd widać.", "ro": "Nu sunteți în Tenerife: alegeți un punct de belvedere ca să vedeți ce se vede de acolo."},
    "hzSinPos": {"es": "No se ha podido saber dónde está: elija un mirador.", "en": "Your location could not be found: choose a viewpoint.", "fr": "Impossible de connaître votre position : choisissez un belvédère.", "de": "Ihr Standort konnte nicht ermittelt werden: Wählen Sie einen Aussichtspunkt.", "it": "Non è stato possibile sapere dove si trova: scelga un belvedere.", "nl": "Uw locatie kon niet worden bepaald: kies een uitkijkpunt.", "zh": "无法获取您的位置：请选择一个观景台。", "zht": "無法取得您的位置：請選擇一個觀景台。", "bg": "Не успяхме да разберем къде сте: изберете панорамно място.", "pl": "Nie udało się ustalić lokalizacji: wystarczy wybrać punkt widokowy.", "ro": "Nu s-a putut afla unde sunteți: alegeți un punct de belvedere."},
    "hzImprecisa": {"es": "Su posición tiene un margen de {m}: lo que sale puede no cuadrar del todo.", "en": "Your location is only accurate to {m}: what is shown may not line up exactly.", "fr": "Votre position a une marge de {m} : ce qui s’affiche peut ne pas tomber tout à fait juste.", "de": "Ihr Standort ist nur auf {m} genau: Das Angezeigte passt vielleicht nicht ganz.", "it": "La sua posizione ha un margine di {m}: ciò che compare potrebbe non coincidere del tutto.", "nl": "Uw locatie heeft een marge van {m}: wat u ziet, klopt misschien niet helemaal.", "zh": "您的位置误差约 {m}：显示的内容可能不完全吻合。", "zht": "您的位置誤差約 {m}：顯示的內容可能不完全吻合。", "bg": "Местоположението ви е с точност до {m}: показаното може да не съвпада съвсем.", "pl": "Lokalizacja ma margines błędu {m}: to, co widać na ekranie, może nie całkiem się zgadzać.", "ro": "Poziția dumneavoastră are o marjă de {m}: ce apare poate să nu se potrivească întru totul."},
    "hzDesde": {"es": "Desde", "en": "From", "fr": "Depuis", "de": "Standort", "it": "Da", "nl": "Vanaf", "zh": "观察点", "zht": "觀察點", "bg": "Гледна точка", "pl": "Punkt obserwacji", "ro": "Punct de observație"},
    "hzMiPos": {"es": "Mi posición", "en": "My location", "fr": "Ma position", "de": "Mein Standort", "it": "La mia posizione", "nl": "Mijn locatie", "zh": "我的位置", "zht": "我的位置", "bg": "Моето местоположение", "pl": "Moja lokalizacja", "ro": "Poziția mea"},
    "hzElegir": {"es": "¿Desde dónde mira?", "en": "Where are you looking from?", "fr": "D’où regardez-vous ?", "de": "Von wo aus schauen Sie?", "it": "Da dove guarda?", "nl": "Vanwaar kijkt u?", "zh": "您从哪里看？", "zht": "您從哪裡看？", "bg": "Откъде гледате?", "pl": "Wybór punktu obserwacji", "ro": "De unde priviți?"},
    "hzBuscar": {"es": "Buscar un mirador", "en": "Search for a viewpoint", "fr": "Chercher un belvédère", "de": "Aussichtspunkt suchen", "it": "Cerca un belvedere", "nl": "Uitkijkpunt zoeken", "zh": "搜索观景台", "zht": "搜尋觀景台", "bg": "Търсене на панорамно място", "pl": "Szukaj punktu widokowego", "ro": "Căutați un punct de belvedere"},
    "hzNinguno": {"es": "Ningún mirador con ese nombre.", "en": "No viewpoint with that name.", "fr": "Aucun belvédère de ce nom.", "de": "Kein Aussichtspunkt mit diesem Namen.", "it": "Nessun belvedere con questo nome.", "nl": "Geen uitkijkpunt met die naam.", "zh": "没有这个名字的观景台。", "zht": "沒有這個名稱的觀景台。", "bg": "Няма панорамно място с това име.", "pl": "Brak punktu widokowego o tej nazwie.", "ro": "Niciun punct de belvedere cu acest nume."},
    "hzCamara": {"es": "Cámara", "en": "Camera", "fr": "Caméra", "de": "Kamera", "it": "Fotocamera", "nl": "Camera", "zh": "相机", "zht": "相機", "bg": "Камера", "pl": "Aparat", "ro": "Cameră"},
    "hzCamaraNo": {"es": "Este navegador no deja usar la cámara.", "en": "This browser does not allow the camera to be used.", "fr": "Ce navigateur ne permet pas d’utiliser la caméra.", "de": "Dieser Browser erlaubt die Kamera nicht.", "it": "Questo browser non permette di usare la fotocamera.", "nl": "Deze browser staat de camera niet toe.", "zh": "此浏览器不允许使用相机。", "zht": "此瀏覽器不允許使用相機。", "bg": "Този браузър не позволява да се използва камерата.", "pl": "Ta przeglądarka nie pozwala korzystać z aparatu.", "ro": "Acest browser nu permite folosirea camerei."},
    "hzCamaraPermiso": {"es": "Sin permiso para la cámara: actívelo en los ajustes del navegador.", "en": "No camera permission: turn it on in the browser settings.", "fr": "Pas d’autorisation pour la caméra : activez-la dans les réglages du navigateur.", "de": "Keine Kameraberechtigung: Schalten Sie sie in den Browsereinstellungen ein.", "it": "Nessun permesso per la fotocamera: lo attivi nelle impostazioni del browser.", "nl": "Geen toestemming voor de camera: zet die aan in de browserinstellingen.", "zh": "没有相机权限：请在浏览器设置中开启。", "zht": "沒有相機權限：請在瀏覽器設定中開啟。", "bg": "Няма разрешение за камерата: включете го в настройките на браузъра.", "pl": "Brak dostępu do aparatu: można go włączyć w ustawieniach przeglądarki.", "ro": "Nu există permisiune pentru cameră: activați-o în setările browserului."},
    "hzCamaraPermisoApp": {"es": "Sin permiso para la cámara: actívelo en los ajustes del móvil, en Tenerife Go.", "en": "No camera permission: turn it on for Tenerife Go in your phone’s settings.", "fr": "Pas d’autorisation pour la caméra : activez-la pour Tenerife Go dans les réglages du téléphone.", "de": "Keine Kameraberechtigung: Schalten Sie sie für Tenerife Go in den Einstellungen des Handys ein.", "it": "Nessun permesso per la fotocamera: lo attivi per Tenerife Go nelle impostazioni del telefono.", "nl": "Geen toestemming voor de camera: zet die aan voor Tenerife Go in de instellingen van uw telefoon.", "zh": "没有相机权限：请在手机设置中为 Tenerife Go 开启。", "zht": "沒有相機權限：請在手機設定中為 Tenerife Go 開啟。", "bg": "Няма разрешение за камерата: включете го за Tenerife Go в настройките на телефона.", "pl": "Brak dostępu do aparatu: można go włączyć dla Tenerife Go w ustawieniach telefonu.", "ro": "Nu există permisiune pentru cameră: activați-o pentru Tenerife Go în setările telefonului."},
    "hzSensoresEspera": {"es": "Esperando a la brújula…", "en": "Waiting for the compass…", "fr": "En attente de la boussole…", "de": "Warten auf den Kompass…", "it": "In attesa della bussola…", "nl": "Wachten op het kompas…", "zh": "正在等待指南针…", "zht": "正在等待指南針…", "bg": "Изчакване на компаса…", "pl": "Oczekiwanie na kompas…", "ro": "Se așteaptă busola…"},
    "hzSensoresNo": {"es": "Este móvil no dice hacia dónde apunta: arrastre para girar.", "en": "This phone does not report where it is pointing: drag to turn.", "fr": "Ce téléphone n’indique pas où il pointe : faites glisser pour tourner.", "de": "Dieses Handy meldet nicht, wohin es zeigt: Zum Drehen wischen.", "it": "Questo telefono non dice dove sta puntando: trascini per girare.", "nl": "Deze telefoon geeft niet door waar hij naartoe wijst: sleep om te draaien.", "zh": "这部手机无法提供朝向：请拖动来转动视角。", "zht": "這支手機無法提供朝向：請拖曳來轉動視角。", "bg": "Този телефон не съобщава накъде е насочен: плъзнете, за да завъртите.", "pl": "Ten telefon nie podaje, w którą stronę jest skierowany: przeciągnięcie obraca widok.", "ro": "Acest telefon nu spune încotro este îndreptat: glisați ca să rotiți."},
    "hzSensoresPermiso": {"es": "Sin permiso para la orientación del móvil: arrastre para girar, o actívelo en los ajustes del navegador.", "en": "No permission for motion and orientation: drag to turn, or turn it on in the browser settings.", "fr": "Pas d’autorisation pour l’orientation du téléphone : faites glisser pour tourner, ou activez-la dans les réglages du navigateur.", "de": "Keine Berechtigung für Bewegung und Ausrichtung: Zum Drehen wischen oder in den Browsereinstellungen einschalten.", "it": "Nessun permesso per l’orientamento del telefono: trascini per girare, oppure lo attivi nelle impostazioni del browser.", "nl": "Geen toestemming voor beweging en richting: sleep om te draaien, of zet die aan in de browserinstellingen.", "zh": "没有方向感应权限：请拖动来转动视角，或在浏览器设置中开启。", "zht": "沒有方向感應權限：請拖曳來轉動視角，或在瀏覽器設定中開啟。", "bg": "Няма разрешение за ориентацията на телефона: плъзнете, за да завъртите, или го включете в настройките на браузъра.", "pl": "Brak dostępu do orientacji telefonu: przeciągnięcie obraca widok, a dostęp można włączyć w ustawieniach przeglądarki.", "ro": "Nu există permisiune pentru orientarea telefonului: glisați ca să rotiți sau activați-o în setările browserului."},
    "hzSensoresPermisoApp": {"es": "Sin permiso para la orientación del móvil: arrastre para girar, o actívelo en los ajustes del móvil, en Tenerife Go.", "en": "No permission for motion and orientation: drag to turn, or turn it on for Tenerife Go in your phone’s settings.", "fr": "Pas d’autorisation pour l’orientation du téléphone : faites glisser pour tourner, ou activez-la pour Tenerife Go dans les réglages du téléphone.", "de": "Keine Berechtigung für Bewegung und Ausrichtung: Zum Drehen wischen oder für Tenerife Go in den Einstellungen des Handys einschalten.", "it": "Nessun permesso per l’orientamento del telefono: trascini per girare, oppure lo attivi per Tenerife Go nelle impostazioni del telefono.", "nl": "Geen toestemming voor beweging en richting: sleep om te draaien, of zet die aan voor Tenerife Go in de instellingen van uw telefoon.", "zh": "没有方向感应权限：请拖动来转动视角，或在手机设置中为 Tenerife Go 开启。", "zht": "沒有方向感應權限：請拖曳來轉動視角，或在手機設定中為 Tenerife Go 開啟。", "bg": "Няма разрешение за ориентацията на телефона: плъзнете, за да завъртите, или го включете за Tenerife Go в настройките на телефона.", "pl": "Brak dostępu do orientacji telefonu: przeciągnięcie obraca widok, a dostęp można włączyć dla Tenerife Go w ustawieniach telefonu.", "ro": "Nu există permisiune pentru orientarea telefonului: glisați ca să rotiți sau activați-o pentru Tenerife Go în setările telefonului."},
    "hzArrastra": {"es": "Arrastre para girar", "en": "Drag to turn", "fr": "Glissez pour tourner", "de": "Zum Drehen wischen", "it": "Trascini per girare", "nl": "Sleep om te draaien", "zh": "拖动以转动", "zht": "拖曳以轉動", "bg": "Плъзнете, за да завъртите", "pl": "Przeciągnąć, aby obrócić", "ro": "Glisați ca să rotiți"},
    "hzAyuda": {"es": "Levante el móvil y apunte al horizonte. Si los nombres no caen en su sitio, arrastre a un lado hasta que cuadren.", "en": "Hold up your phone and point it at the horizon. If the names are not in the right place, drag sideways until they line up.", "fr": "Levez le téléphone et pointez l’horizon. Si les noms ne tombent pas au bon endroit, faites glisser sur le côté jusqu’à ce qu’ils correspondent.", "de": "Halten Sie das Handy hoch und richten Sie es auf den Horizont. Wenn die Namen nicht an der richtigen Stelle stehen, wischen Sie zur Seite, bis sie passen.", "it": "Sollevi il telefono e lo punti verso l’orizzonte. Se i nomi non cadono al posto giusto, trascini di lato finché non coincidono.", "nl": "Houd uw telefoon omhoog en richt op de horizon. Staan de namen niet op de goede plek, sleep dan opzij tot ze kloppen.", "zh": "举起手机，对准地平线。如果名称没有对准实际位置，请左右拖动直到吻合。", "zht": "舉起手機，對準地平線。如果名稱沒有對準實際位置，請左右拖曳直到吻合。", "bg": "Вдигнете телефона и го насочете към хоризонта. Ако имената не застанат на мястото си, плъзнете встрани, докато съвпаднат.", "pl": "Wystarczy unieść telefon i skierować go na horyzont. Jeśli nazwy nie trafiają na swoje miejsce, przeciągnąć w bok, aż się zgodzą.", "ro": "Ridicați telefonul și îndreptați-l spre orizont. Dacă numele nu cad la locul lor, glisați într-o parte până se potrivesc."},
    "hzCalibra": {"es": "La brújula va imprecisa: mueva el móvil dibujando un ocho.", "en": "The compass is inaccurate: move your phone in a figure of eight.", "fr": "La boussole est imprécise : faites un huit avec le téléphone.", "de": "Der Kompass ist ungenau: Bewegen Sie das Handy in Form einer Acht.", "it": "La bussola è imprecisa: muova il telefono disegnando un otto.", "nl": "Het kompas is onnauwkeurig: beweeg uw telefoon in de vorm van een acht.", "zh": "指南针不够准确：请拿着手机画“8”字。", "zht": "指南針不夠準確：請拿著手機畫「8」字。", "bg": "Компасът е неточен: движете телефона, като описвате осмица.", "pl": "Kompas jest niedokładny: wystarczy poruszać telefonem po ósemce.", "ro": "Busola este imprecisă: mișcați telefonul desenând un opt."},
    "hzQuitarAjuste": {"es": "Quitar el ajuste de la brújula", "en": "Remove the compass adjustment", "fr": "Annuler le réglage de la boussole", "de": "Kompasskorrektur zurücksetzen", "it": "Annulla la regolazione della bussola", "nl": "Kompascorrectie wissen", "zh": "取消指南针校正", "zht": "取消指南針校正", "bg": "Премахни корекцията на компаса", "pl": "Usuń korektę kompasu", "ro": "Anulați ajustarea busolei"},
    "hzKm": {"es": "{n} km", "en": "{n} km", "fr": "{n} km", "de": "{n} km", "it": "{n} km", "nl": "{n} km", "zh": "{n} 公里", "zht": "{n} 公里", "bg": "{n} км", "pl": "{n} km", "ro": "{n} km"},
    "hzM": {"es": "{n} m", "en": "{n} m", "fr": "{n} m", "de": "{n} m", "it": "{n} m", "nl": "{n} m", "zh": "{n} 米", "zht": "{n} 公尺", "bg": "{n} м", "pl": "{n} m", "ro": "{n} m"},
    "hzA": {"es": "a {d}", "en": "{d} away", "fr": "à {d}", "de": "{d} entfernt", "it": "a {d}", "nl": "op {d}", "zh": "距离 {d}", "zht": "距離 {d}", "bg": "на {d}", "pl": "{d} stąd", "ro": "la {d}"},
    "hzTipoCima": {"es": "Cima", "en": "Peak", "fr": "Sommet", "de": "Gipfel", "it": "Cima", "nl": "Top", "zh": "山峰", "zht": "山峰", "bg": "Връх", "pl": "Szczyt", "ro": "Vârf"},
    "hzTipoPueblo": {"es": "Pueblo", "en": "Town", "fr": "Localité", "de": "Ort", "it": "Paese", "nl": "Plaats", "zh": "村镇", "zht": "村鎮", "bg": "Селище", "pl": "Miejscowość", "ro": "Localitate"},
    "hzTipoIsla": {"es": "Isla", "en": "Island", "fr": "Île", "de": "Insel", "it": "Isola", "nl": "Eiland", "zh": "岛屿", "zht": "島嶼", "bg": "Остров", "pl": "Wyspa", "ro": "Insulă"},
    "hzNada": {"es": "Nada con nombre en esta dirección", "en": "Nothing named in this direction", "fr": "Rien de nommé dans cette direction", "de": "Nichts mit Namen in dieser Richtung", "it": "Niente con un nome in questa direzione", "nl": "Niets met een naam in deze richting", "zh": "这个方向没有已命名的地点", "zht": "這個方向沒有已命名的地點", "bg": "Нищо с име в тази посока", "pl": "Nic nazwanego w tym kierunku", "ro": "Nimic cu nume în această direcție"},
    "hzHorizonte": {"es": "El horizonte, a {d}", "en": "Horizon {d} away", "fr": "L’horizon, à {d}", "de": "Horizont in {d}", "it": "L’orizzonte, a {d}", "nl": "Horizon op {d}", "zh": "地平线距离 {d}", "zht": "地平線距離 {d}", "bg": "Хоризонтът е на {d}", "pl": "Horyzont: {d} stąd", "ro": "Orizontul, la {d}"},
    "hzMar": {"es": "El horizonte del mar, a {d}", "en": "Sea horizon {d} away", "fr": "L’horizon de la mer, à {d}", "de": "Meereshorizont in {d}", "it": "L’orizzonte del mare, a {d}", "nl": "Zeehorizon op {d}", "zh": "海平线距离 {d}", "zht": "海平線距離 {d}", "bg": "Морският хоризонт е на {d}", "pl": "Horyzont morski: {d} stąd", "ro": "Orizontul mării, la {d}"},
    "hzLista": {"es": "Lo que se ve", "en": "What you can see", "fr": "Ce que l’on voit", "de": "Was man sieht", "it": "Che cosa si vede", "nl": "Wat u ziet", "zh": "能看到的", "zht": "能看到的", "bg": "Какво се вижда", "pl": "Co widać", "ro": "Ce se vede"},
    "hzListaTit": {"es": "Lo que se ve desde aquí", "en": "What can be seen from here", "fr": "Ce que l’on voit d’ici", "de": "Was man von hier aus sieht", "it": "Che cosa si vede da qui", "nl": "Wat u van hieruit ziet", "zh": "从这里能看到的", "zht": "從這裡能看到的", "bg": "Какво се вижда оттук", "pl": "Co widać z tego miejsca", "ro": "Ce se vede de aici"},
    "hzListaVacia": {"es": "Desde aquí no se ve nada con nombre.", "en": "Nothing named can be seen from here.", "fr": "D’ici, on ne voit rien qui porte un nom.", "de": "Von hier aus ist nichts mit Namen zu sehen.", "it": "Da qui non si vede niente con un nome.", "nl": "Van hieruit is niets met een naam te zien.", "zh": "从这里看不到任何已命名的地点。", "zht": "從這裡看不到任何已命名的地點。", "bg": "Оттук не се вижда нищо с име.", "pl": "Z tego miejsca nie widać niczego nazwanego.", "ro": "De aici nu se vede nimic cu nume."},
    "hzListaNota": {"es": "Calculado con el relieve a 60 m y la curvatura de la Tierra. Con calima, nubes o mar de nubes puede no verse lo que dice.", "en": "Worked out from 60 m terrain data and the curvature of the Earth. In haze or cloud, or above a sea of clouds, you may not see what it says.", "fr": "Calculé à partir du relief à 60 m et de la courbure de la Terre. Avec la calima, les nuages ou une mer de nuages, on peut ne pas voir ce qui est indiqué.", "de": "Berechnet aus dem Relief mit 60 m Auflösung und der Erdkrümmung. Bei Calima, Wolken oder Wolkenmeer ist das Angezeigte vielleicht nicht zu sehen.", "it": "Calcolato con il rilievo a 60 m e la curvatura della Terra. Con la calima, le nuvole o il mare di nuvole, ciò che indica potrebbe non vedersi.", "nl": "Berekend met het reliëf op 60 m en de kromming van de aarde. Bij calima, bewolking of een wolkenzee is wat er staat misschien niet te zien.", "zh": "根据 60 米分辨率的地形和地球曲率计算。遇到沙尘霾、云层或云海时，可能看不到所示内容。", "zht": "根據 60 公尺解析度的地形和地球曲率計算。遇到沙塵霾、雲層或雲海時，可能看不到所示內容。", "bg": "Изчислено по релефа с разделителна способност 60 м и кривината на Земята. При калима, облаци или море от облаци показаното може да не се вижда.", "pl": "Obliczone na podstawie rzeźby terenu co 60 m i krzywizny Ziemi. Przy calimie, chmurach lub morzu chmur to, co pokazuje aplikacja, może być niewidoczne.", "ro": "Calculat după relieful la 60 m și curbura Pământului. Cu calima, nori sau mare de nori, ce arată se poate să nu se vadă."},
    "hzAhi": {"es": "Ahí está: {x}", "en": "There it is: {x}", "fr": "C’est là : {x}", "de": "Da ist es: {x}", "it": "È lì: {x}", "nl": "Daar is het: {x}", "zh": "就在那里：{x}", "zht": "就在那裡：{x}", "bg": "Там е: {x}", "pl": "Tam jest: {x}", "ro": "Este acolo: {x}"},
    "hzDejar": {"es": "Dejar de buscar", "en": "Stop looking for it", "fr": "Arrêter la recherche", "de": "Suche beenden", "it": "Smetti di cercare", "nl": "Stoppen met zoeken", "zh": "停止寻找", "zht": "停止尋找", "bg": "Спри търсенето", "pl": "Zakończ szukanie", "ro": "Opriți căutarea"},
    "hzRelieve": {"es": "Relieve", "en": "Terrain", "fr": "Relief", "de": "Relief", "it": "Rilievo", "nl": "Reliëf", "zh": "地形", "zht": "地形", "bg": "Релеф", "pl": "Rzeźba terenu", "ro": "Relief"},
    "hzNombresOsm": {"es": "Nombres de cimas y pueblos: © colaboradores de OpenStreetMap", "en": "Names of peaks and towns: © OpenStreetMap contributors", "fr": "Noms des sommets et des localités : © contributeurs d’OpenStreetMap", "de": "Namen von Gipfeln und Orten: © OpenStreetMap-Mitwirkende", "it": "Nomi di cime e paesi: © collaboratori di OpenStreetMap", "nl": "Namen van toppen en plaatsen: © OpenStreetMap-bijdragers", "zh": "山峰和村镇名称：© OpenStreetMap 贡献者", "zht": "山峰和村鎮名稱：© OpenStreetMap 貢獻者", "bg": "Имена на върхове и селища: © сътрудници на OpenStreetMap", "pl": "Nazwy szczytów i miejscowości: © współtwórcy OpenStreetMap", "ro": "Numele vârfurilor și localităților: © contribuitorii OpenStreetMap"},
    "hzIslasFuente": {"es": "Cimas de las otras islas: vértices geodésicos del IGN", "en": "Peaks on the other islands: IGN geodetic points", "fr": "Sommets des autres îles : points géodésiques de l’IGN", "de": "Gipfel der anderen Inseln: geodätische Punkte des IGN", "it": "Cime delle altre isole: vertici geodetici dell’IGN", "nl": "Toppen op de andere eilanden: geodetische punten van het IGN", "zh": "其他岛屿的山峰：西班牙国家地理研究所（IGN）大地测量点", "zht": "其他島嶼的山峰：西班牙國家地理研究所（IGN）大地測量點", "bg": "Върхове на другите острови: геодезични точки на IGN", "pl": "Szczyty na innych wyspach: punkty geodezyjne IGN", "ro": "Vârfurile celorlalte insule: puncte geodezice ale IGN"},
    "hzMalLeido": {"es": "El relieve no se ha leído bien en este navegador y no se dibuja: así no enseña nada falso.", "en": "The terrain was not read correctly in this browser, so it is not drawn: this way nothing false is shown.", "fr": "Le relief n’a pas été lu correctement par ce navigateur et n’est pas dessiné : ainsi, rien de faux ne s’affiche.", "de": "Das Relief wurde in diesem Browser nicht richtig gelesen und wird nicht gezeichnet: So wird nichts Falsches angezeigt.", "it": "Il rilievo non è stato letto bene in questo browser e non viene disegnato: così non mostra nulla di falso.", "nl": "Het reliëf is in deze browser niet goed gelezen en wordt niet getekend: zo wordt er niets onjuists getoond.", "zh": "此浏览器未能正确读取地形，因此不予绘制，以免显示错误内容。", "zht": "此瀏覽器未能正確讀取地形，因此不予繪製，以免顯示錯誤內容。", "bg": "Релефът не е прочетен правилно в този браузър и не се изобразява: така не се показва нищо невярно.", "pl": "Ta przeglądarka nie odczytała poprawnie rzeźby terenu, więc nie jest rysowana: dzięki temu nie pojawi się nic nieprawdziwego.", "ro": "Relieful nu a fost citit corect în acest browser și nu se desenează: astfel nu arată nimic fals."},
    "hzNoCarga": {"es": "No se ha podido cargar el relieve. Compruebe la conexión e inténtelo de nuevo.", "en": "The terrain could not be loaded. Check your connection and try again.", "fr": "Impossible de charger le relief. Vérifiez la connexion et réessayez.", "de": "Das Relief konnte nicht geladen werden. Prüfen Sie die Verbindung und versuchen Sie es erneut.", "it": "Non è stato possibile caricare il rilievo. Controlli la connessione e riprovi.", "nl": "Het reliëf kon niet worden geladen. Controleer de verbinding en probeer het opnieuw.", "zh": "无法加载地形。请检查网络连接后重试。", "zht": "無法載入地形。請檢查網路連線後重試。", "bg": "Релефът не можа да се зареди. Проверете връзката и опитайте отново.", "pl": "Nie udało się wczytać rzeźby terenu. Warto sprawdzić połączenie i spróbować ponownie.", "ro": "Relieful nu s-a putut încărca. Verificați conexiunea și încercați din nou."},
    "hzReintentar": {"es": "Reintentar", "en": "Try again", "fr": "Réessayer", "de": "Erneut versuchen", "it": "Riprova", "nl": "Opnieuw proberen", "zh": "重试", "zht": "重試", "bg": "Опитай отново", "pl": "Spróbuj ponownie", "ro": "Încercați din nou"},
    "hzAria": {"es": "El horizonte, con los nombres de lo que se ve", "en": "The horizon, with the names of what can be seen", "fr": "L’horizon, avec le nom de ce que l’on voit", "de": "Der Horizont mit den Namen dessen, was man sieht", "it": "L’orizzonte, con i nomi di ciò che si vede", "nl": "De horizon, met de namen van wat er te zien is", "zh": "地平线及可见地点的名称", "zht": "地平線及可見地點的名稱", "bg": "Хоризонтът с имената на това, което се вижда", "pl": "Horyzont z nazwami tego, co widać", "ro": "Orizontul, cu numele a ceea ce se vede"},
    "hzTeide": {"es": "Teide", "en": "Teide", "fr": "Teide", "de": "Teide", "it": "Teide", "nl": "Teide", "zh": "泰德峰", "zht": "泰德峰", "bg": "Тейде", "pl": "Teide", "ro": "Teide"},
    "hzIsla_gc": {"es": "Gran Canaria", "en": "Gran Canaria", "fr": "Grande Canarie", "de": "Gran Canaria", "it": "Gran Canaria", "nl": "Gran Canaria", "zh": "大加那利岛", "zht": "大加那利島", "bg": "Гран Канария", "pl": "Gran Canaria", "ro": "Gran Canaria"},
    "hzIsla_go": {"es": "La Gomera", "en": "La Gomera", "fr": "La Gomera", "de": "La Gomera", "it": "La Gomera", "nl": "La Gomera", "zh": "戈梅拉岛", "zht": "戈梅拉島", "bg": "Ла Гомера", "pl": "La Gomera", "ro": "La Gomera"},
    "hzIsla_lp": {"es": "La Palma", "en": "La Palma", "fr": "La Palma", "de": "La Palma", "it": "La Palma", "nl": "La Palma", "zh": "拉帕尔马岛", "zht": "拉帕爾馬島", "bg": "Ла Палма", "pl": "La Palma", "ro": "La Palma"},
    "hzIsla_hi": {"es": "El Hierro", "en": "El Hierro", "fr": "El Hierro", "de": "El Hierro", "it": "El Hierro", "nl": "El Hierro", "zh": "耶罗岛", "zht": "耶羅島", "bg": "Йеро", "pl": "El Hierro", "ro": "El Hierro"},
    "hzRumboN": {"es": "N", "en": "N", "fr": "N", "de": "N", "it": "N", "nl": "N", "zh": "北", "zht": "北", "bg": "С", "pl": "N", "ro": "N"},
    "hzRumboNE": {"es": "NE", "en": "NE", "fr": "NE", "de": "NO", "it": "NE", "nl": "NO", "zh": "东北", "zht": "東北", "bg": "СИ", "pl": "NE", "ro": "NE"},
    "hzRumboE": {"es": "E", "en": "E", "fr": "E", "de": "O", "it": "E", "nl": "O", "zh": "东", "zht": "東", "bg": "И", "pl": "E", "ro": "E"},
    "hzRumboSE": {"es": "SE", "en": "SE", "fr": "SE", "de": "SO", "it": "SE", "nl": "ZO", "zh": "东南", "zht": "東南", "bg": "ЮИ", "pl": "SE", "ro": "SE"},
    "hzRumboS": {"es": "S", "en": "S", "fr": "S", "de": "S", "it": "S", "nl": "Z", "zh": "南", "zht": "南", "bg": "Ю", "pl": "S", "ro": "S"},
    "hzRumboSO": {"es": "SO", "en": "SW", "fr": "SO", "de": "SW", "it": "SO", "nl": "ZW", "zh": "西南", "zht": "西南", "bg": "ЮЗ", "pl": "SW", "ro": "SV"},
    "hzRumboO": {"es": "O", "en": "W", "fr": "O", "de": "W", "it": "O", "nl": "W", "zh": "西", "zht": "西", "bg": "З", "pl": "W", "ro": "V"},
    "hzRumboNO": {"es": "NO", "en": "NW", "fr": "NO", "de": "NW", "it": "NO", "nl": "NW", "zh": "西北", "zht": "西北", "bg": "СЗ", "pl": "NW", "ro": "NV"}
  };

  var RUMBOS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

  /* ── TEXTOS Y NUMEROS ───────────────────────────────────────────── */
  function lang() { return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'es'; }
  function t(k, vars) {
    var e = HZ_UI[k], s;
    if (e) s = e[lang()] || e.en || e.es || '';
    else s = (typeof tx === 'function') ? tx(k, vars) : '';
    if (e && vars) for (var v in vars) if (Object.prototype.hasOwnProperty.call(vars, v)) s = s.split('{' + v + '}').join(String(vars[v]));
    return s;
  }
  function loc() { return HZ_LOCALE[lang()] || 'es-ES'; }
  /* «3.715 m», como la ficha del Teide: con separador de miles tambien en castellano, que el
     Intl de antes de 2023 no lo pone en los numeros de cuatro cifras */
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
    if (m < 1000) return t('hzM', { n: num(Math.max(10, Math.round(m / 10) * 10)) });
    return t('hzKm', { n: num(m / 1000, m < 10000 ? 1 : 0) });
  }
  function altTxt(m) { return t('hzM', { n: num(Math.round(m)) }); }
  function norm360(a) { return ((a % 360) + 360) % 360; }
  function rumboTxt(az) { return t('hzRumbo' + RUMBOS[Math.round(norm360(az) / 45) % 8]); }

  /* ── GEOMETRIA ──────────────────────────────────────────────────── */
  function mercX(lon) { return R_WM * lon * RAD; }
  function mercY(lat) { return R_WM * Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)); }
  function distGC(a, b) {
    var dLat = (b.lat - a.lat) * RAD, dLng = (b.lng - a.lng) * RAD;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R_T * Math.asin(Math.min(1, Math.sqrt(x)));
  }
  function rumboGC(a, b) {
    var p1 = a.lat * RAD, p2 = b.lat * RAD, dl = (b.lng - a.lng) * RAD;
    return norm360(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / RAD);
  }

  /* ── EL RELIEVE ─────────────────────────────────────────────────── */
  /* Con <img> y no con createImageBitmap, como modulos/isla3d.js: en WebKit, createImageBitmap
     cambiaba valores del PNG (1 de noviembre de 2026). Y se comprueban las sumas del .json: un
     navegador que aplicara gestion de color cambiaria las alturas en silencio. */
  var D = null, cargaD = null;
  function leerPNG(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.blob();
    }).then(function (b) {
      return new Promise(function (ok, mal) {
        var u = URL.createObjectURL(b), i = new Image();
        i.onload = function () { URL.revokeObjectURL(u); ok(i); };
        i.onerror = function () { URL.revokeObjectURL(u); mal(new Error('png')); };
        i.src = u;
      });
    }).then(function (im) {
      var w = im.width, h = im.height, c = document.createElement('canvas');
      c.width = w; c.height = h;
      var g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(im, 0, 0);
      var d = g.getImageData(0, 0, w, h).data;
      c.width = c.height = 0;
      return { w: w, h: h, d: d };
    });
  }
  function cargarRelieve() {
    if (D) return Promise.resolve(D);
    if (cargaD) return cargaD;
    cargaD = fetch(META_URL).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (meta) {
      return leerPNG(PNG_URL).then(function (a) {
        var m = meta.malla;
        if (a.w !== m.ancho || a.h !== m.alto) throw new Error('mal-leido');
        var n = m.ancho * m.alto, H = new Float32Array(n), costa = new Uint8Array(n), sDm = 0, sB = 0, esc = meta.altura.metros_por_unidad;
        for (var i = 0, p = 0; i < n; i++, p += 4) {
          var dm = a.d[p] * 256 + a.d[p + 1];
          H[i] = dm * esc; costa[i] = a.d[p + 2];
          sDm = (sDm + dm) >>> 0; sB = (sB + a.d[p + 2]) >>> 0;
        }
        var c = meta.control, bien = sDm === c.suma_dm && sB === c.suma_costa;
        for (var k = 0; bien && k < c.muestras.length; k++) {
          var s = c.muestras[k], q = s[1] * m.ancho + s[0];
          if (Math.round(H[q] / esc) !== s[2] || costa[q] !== s[3]) bien = false;
        }
        if (!bien) throw new Error('mal-leido');
        var fu = meta.fuente || {};
        D = { meta: meta, H: H, costa: costa, w: m.ancho, h: m.alto, x0: m.x0, y0: m.y0, paso: m.paso, caja: m.caja,
              credito: fu.credito || '' };
        tablaLat();
        return D;
      });
    }).catch(function (e) { cargaD = null; throw e; });
    return cargaD;
  }
  /* La fila de la malla para una latitud: Mercator no es lineal en la latitud, asi que una tabla
     cada 0,0005 grados (unos 55 m) y se interpola entre dos; el error es de milesimas de celda */
  function tablaLat() {
    var lat0 = D.caja[1] - 0.05, lat1 = D.caja[3] + 0.05, dl = 0.0005, n = Math.ceil((lat1 - lat0) / dl) + 2;
    var fj = new Float64Array(n);
    for (var k = 0; k < n; k++) fj[k] = (D.y0 - mercY(lat0 + k * dl)) / D.paso - 0.5;
    D.tab = { lat0: lat0, dl: dl, fj: fj, n: n };
  }
  function fiDe(lng) { return (mercX(lng) - D.x0) / D.paso - 0.5; }
  function fjDe(lat) {
    var T = D.tab, x = (lat - T.lat0) / T.dl, k = Math.floor(x);
    if (k < 0 || k >= T.n - 1) return -9;
    var u = x - k;
    return T.fj[k] * (1 - u) + T.fj[k + 1] * u;
  }
  /* altura (m) entre las cuatro celdas; -1 fuera de la malla */
  function hBil(fi, fj) {
    if (!(fi >= 0 && fj >= 0 && fi <= D.w - 1 && fj <= D.h - 1)) return -1;
    var i = fi | 0, j = fj | 0, u = fi - i, v = fj - j, w = D.w, H = D.H, p = j * w + i;
    var di = i + 1 < D.w ? 1 : 0, dj = j + 1 < D.h ? w : 0;
    return (H[p] * (1 - u) + H[p + di] * u) * (1 - v) + (H[p + dj] * (1 - u) + H[p + dj + di] * u) * v;
  }
  function enCaja(lat, lng) { var c = D.caja; return lng > c[0] && lng < c[2] && lat > c[1] && lat < c[3]; }
  /* Donde se esta: la mas alta de las cuatro celdas de alrededor. En un mirador al borde de un
     risco, la media de las cuatro mezcla el borde con el fondo y dejaria los ojos por debajo del
     suelo de verdad; un error hacia arriba solo abre un poco la vista */
  function sueloEn(lat, lng) {
    var fi = fiDe(lng), fj = fjDe(lat);
    if (!(fi >= 0 && fj >= 0 && fi <= D.w - 1 && fj <= D.h - 1)) return null;
    var i = Math.floor(fi), j = Math.floor(fj), w = D.w, H = D.H, i1 = Math.min(i + 1, D.w - 1), j1 = Math.min(j + 1, D.h - 1);
    return Math.max(H[j * w + i], H[j * w + i1], H[j1 * w + i], H[j1 * w + i1]);
  }
  /* en tierra: el canal «costa» del PNG vale 128 en la linea de costa y mas hacia dentro */
  function enTierra(lat, lng) {
    var i = Math.round(fiDe(lng)), j = Math.round(fjDe(lat));
    if (i < 0 || j < 0 || i >= D.w || j >= D.h) return false;
    return D.costa[j * D.w + i] >= 128;
  }

  /* ── LO QUE SE VE ───────────────────────────────────────────────── */
  function observador(lat, lng) {
    var s = sueloEn(lat, lng);
    if (s === null) return null;
    return { lat: lat, lng: lng, h: Math.max(0, s) + OJO, cosLat: Math.cos(lat * RAD), fi0: fiDe(lng), fj0: fjDe(lat) };
  }
  /* cada 30 m hasta 4 km; luego, cada vez mas largo (como mucho 250 m), que a lo lejos un paso
     cubre menos angulo */
  function pasoRayo(d) { return d < 4000 ? 30 : Math.min(250, d * (d < 20000 ? 0.0075 : 0.006)); }
  /* Un rayo: para cada distancia, la tangente del angulo con que se ve el suelo, con la Tierra
     curva (d²/2R, con el radio efectivo de la refraccion). Se guarda la mayor de todas (la linea
     del horizonte) y la mayor hasta el final de cada capa (BANDAS), para dibujar las capas */
  function trazar(o, k, R) {
    var az = k * PASO_AZ * RAD, sa = Math.sin(az), ca = Math.cos(az);
    var dLat = ca / R_T / RAD, dFi = (R_WM / R_T) * sa / (o.cosLat * D.paso);
    var d = CERCA, tm = -1e9, tl = -1e9, dl = 0, b = 0, base = k * NB, dos = 2 * R_EF;
    for (;;) {
      var h = hBil(o.fi0 + dFi * d, fjDe(o.lat + dLat * d));
      if (h < 0) break;
      while (b < NB - 1 && d > BANDAS[b]) { R.tB[base + b] = tl; b++; }
      var tt = (h - o.h - d * d / dos) / d;
      if (tt > tm) tm = tt;
      /* las capas y la distancia del horizonte, solo con tierra: el mar (0 m) se pinta aparte */
      if (h > 0 && tt > tl) { tl = tt; dl = d; }
      d += pasoRayo(d);
    }
    for (; b < NB; b++) R.tB[base + b] = tl;
    R.tT[k] = tm; R.tL[k] = tl; R.dL[k] = dl;
  }
  /* Un rotulo de Tenerife se ve si nada de lo que hay delante sube por encima de el (lo que roza,
     se ve: TOL). Lo ultimo antes de llegar no cuenta: es la ladera del propio sitio. Una isla se ve
     si su cima queda por encima de lo que hay de Tenerife en esa direccion y, si esta mas lejos que
     el horizonte del mar, por encima de el */
  function visible(o, x, R) {
    if (x.tipo === 'isla') {
      /* el mar solo tapa lo que queda mas alla de su horizonte (dMar); lo de mas aca, no */
      var k = Math.round(x.az / PASO_AZ) % N_RAYOS;
      return x.tg > Math.max(R.tT[k], x.d > R.dMar ? R.tDip : -Infinity);
    }
    var az = x.az * RAD, dLat = Math.cos(az) / R_T / RAD, dFi = (R_WM / R_T) * Math.sin(az) / (o.cosLat * D.paso);
    var lim = x.d - Math.max(120, x.d * 0.02), d = CERCA, tope = x.tg + TOL, dos = 2 * R_EF;
    while (d < lim) {
      var h = hBil(o.fi0 + dFi * d, fjDe(o.lat + dLat * d));
      if (h >= 0 && (h - o.h - d * d / dos) / d > tope) return false;
      d += pasoRayo(d);
    }
    return true;
  }
  function lugaresApp() { try { return (typeof places !== 'undefined' && Array.isArray(places)) ? places : []; } catch (e) { return []; } }
  function nombreApp(p) {
    var n = '';
    try { n = (typeof nombreLugar === 'function') ? nombreLugar(p) : p.name; } catch (e) { n = p && p.name; }
    return String(n || '').replace(/\s*\([^)]*\)\s*$/, '');
  }
  /* Los rotulos, como los de «La isla en 3D»: los pueblos y ciudades de la app, los de OSM donde la
     app no tiene ninguno a menos de 1,8 km, las cimas de OSM con su altura, el Teide con la de su
     ficha y las otras islas */
  function rotulosDe(o) {
    var lista = [], ro = (D.meta && D.meta.rotulos) || {}, clave = HZ_NOMBRE[lang()];
    function nombre(n) { if (!n) return ''; if (typeof n === 'string') return n; return n[clave] || n.name || ''; }
    var propios = [], P = lugaresApp();
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if ((p.category !== 'ciudad' && p.category !== 'municipio') || !p.name || !isFinite(p.lat) || !isFinite(p.lng)) continue;
      if (p.estado === 'cerrado') continue;
      var may = MAYORES.indexOf(p.name) >= 0;
      var r0 = { t: nombreApp(p), tipo: 'pueblo', lat: +p.lat, lng: +p.lng, prio: may ? 5000 : (p.category === 'ciudad' ? 2600 : 2400), id: p.id };
      propios.push(r0); lista.push(r0);
    }
    (ro.lugares || []).forEach(function (q) {
      var a = { lat: q[1], lng: q[0] };
      for (var k = 0; k < propios.length; k++) if (distGC(propios[k], a) < 1800) return;
      lista.push({ t: nombre(q[4]), tipo: 'pueblo', lat: q[1], lng: q[0], prio: 900 + (q[3] || 0) * 10 });
    });
    (ro.cimas || []).forEach(function (q) {
      if (!isFinite(q[2])) return;
      lista.push({ t: nombre(q[3]), tipo: 'cima', lat: q[1], lng: q[0], m: q[2], prio: 600 + q[2] / 10 });
    });
    HITOS.forEach(function (hito) {
      for (var k = 0; k < P.length; k++) if (P[k].id === hito.id && isFinite(P[k].lat) && isFinite(P[k].lng)) {
        lista.push({ t: t(hito.clave), tipo: 'cima', lat: +P[k].lat, lng: +P[k].lng, m: hito.m, prio: 9000, id: hito.id });
        break;
      }
    });
    ISLAS.forEach(function (s) {
      lista.push({ t: t('hzIsla_' + s.id), sub: s.pico, tipo: 'isla', lat: s.lat, lng: s.lng, h: s.h, prio: 8000, isla: s.id });
    });
    return lista.filter(function (r) { return r.t; });
  }
  /* El calculo entero, a trozos para no congelar la pantalla: los 1.440 rayos y luego los rotulos.
     alAcabar(R) con R = { o, tB, tT, tL, dL, tDip, dMar, vistos: los rotulos que se ven, por prioridad } */
  function calcular(o, alPaso, alAcabar) {
    var R = { o: o, tB: new Float32Array(N_RAYOS * NB), tT: new Float32Array(N_RAYOS), tL: new Float32Array(N_RAYOS), dL: new Float32Array(N_RAYOS),
              tDip: -Math.sqrt(2 * o.h / R_EF), dMar: Math.sqrt(2 * R_EF * o.h), vistos: [], cancelado: false };
    var k = 0, j = 0, lista = null, dos = 2 * R_EF;
    function rotulo(x) {
      if (x.tipo === 'isla') { x.d = distGC(o, x); x.az = rumboGC(o, x); x.hh = x.h; }
      else {
        var dx = (x.lng - o.lng) * RAD * R_T * o.cosLat, dy = (x.lat - o.lat) * RAD * R_T;
        x.d = Math.hypot(dx, dy); x.az = norm360(Math.atan2(dx, dy) / RAD);
        var s = hBil(fiDe(x.lng), fjDe(x.lat));
        if (s < 0) { x.ve = false; return; }
        x.hh = x.tipo === 'cima' ? Math.max(x.m, s) : s + POR_ENCIMA_PUEBLO;
      }
      x.tg = (x.hh - o.h - x.d * x.d / dos) / x.d;
      x.ve = x.d > 150 && visible(o, x, R);
    }
    function trozo() {
      if (R.cancelado) return;
      var t0 = performance.now();
      while (k < N_RAYOS && performance.now() - t0 < 12) { var fin = Math.min(N_RAYOS, k + 40); for (; k < fin; k++) trazar(o, k, R); }
      if (k >= N_RAYOS) {
        if (!lista) {
          for (var q = 0; q < N_RAYOS * NB; q++) if (R.tB[q] < -1) R.tB[q] = -1;
          lista = rotulosDe(o);
        }
        while (j < lista.length && performance.now() - t0 < 12) { var fin2 = Math.min(lista.length, j + 20); for (; j < fin2; j++) rotulo(lista[j]); }
      }
      if (alPaso) alPaso((k + (lista ? j : 0)) / (N_RAYOS + (lista ? lista.length : 400)));
      if (k < N_RAYOS || !lista || j < lista.length) { R.reloj = setTimeout(trozo, 0); return; }
      R.vistos = lista.filter(function (x) { return x.ve; }).sort(function (a, b) { return b.prio - a.prio; });
      alAcabar(R);
    }
    R.reloj = setTimeout(trozo, 0);
    return R;
  }
  function cancelar(R) { if (R) { R.cancelado = true; clearTimeout(R.reloj); } }
  /* la tangente del horizonte en un rumbo (el de Tenerife o el del mar, el que quede mas alto) */
  function tHorizonte(R, az) { var k = Math.round(norm360(az) / PASO_AZ) % N_RAYOS; return Math.max(R.tT[k], R.tDip); }

  /* ── LA VISTA ───────────────────────────────────────────────────── */
  var CSS = [
    '#hz-vista{position:fixed;inset:0;z-index:8970;background:#0b1220;color:#f0ece4;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;',
    "font-family:'DM Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;}",
    'html.hz-abierto,html.hz-abierto body{overflow:hidden;}',
    'html.hz-abierto .pwa-install-banner.show{visibility:hidden;pointer-events:none;}',
    '#hz-vista .hz-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}',
    '#hz-vista .hz-lienzo{position:absolute;inset:0;width:100%;height:100%;display:block;}',
    '#hz-vista .hz-arriba{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;',
    'padding:calc(8px + env(safe-area-inset-top,0px)) max(10px,env(safe-area-inset-right,0px)) 8px max(10px,env(safe-area-inset-left,0px));',
    'background:linear-gradient(rgba(8,12,20,.82),rgba(8,12,20,0));}',
    "#hz-vista .hz-tit{flex:1 1 auto;min-width:0;margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:1.3rem;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;outline:none;}",
    '#hz-vista .hz-btn{width:42px;height:42px;flex:0 0 auto;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer;',
    'border:1px solid rgba(255,255,255,.16);background:rgba(15,17,23,.62);color:#f0ece4;font:inherit;font-size:1.05rem;-webkit-tap-highlight-color:transparent;}',
    '#hz-vista .hz-btn[aria-pressed=true]{border-color:#D4AF37;background:rgba(212,175,55,.22);}',
    '#hz-vista .hz-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
    '#hz-vista button:focus-visible{outline:3px solid #fde047;outline-offset:2px;}',
    '#hz-vista .hz-fila2{position:absolute;left:0;right:0;top:calc(60px + env(safe-area-inset-top,0px));display:flex;align-items:flex-start;justify-content:space-between;gap:8px;',
    'padding:0 max(10px,env(safe-area-inset-right,0px)) 0 max(10px,env(safe-area-inset-left,0px));pointer-events:none;}',
    '#hz-vista .hz-desde{pointer-events:auto;display:flex;flex-direction:column;align-items:flex-start;gap:1px;max-width:62%;min-height:40px;padding:5px 12px;border-radius:14px;cursor:pointer;text-align:start;',
    'border:1px solid rgba(212,175,55,.42);background:rgba(15,17,23,.66);color:#f0ece4;font:inherit;}',
    '#hz-vista .hz-desde-e{font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;color:rgba(240,236,228,.66);}',
    '#hz-vista .hz-desde-n{font-size:.84rem;font-weight:700;color:#F5C76B;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '#hz-vista .hz-chips{display:flex;flex-direction:column;align-items:flex-end;gap:6px;}',
    '#hz-vista .hz-chip{pointer-events:auto;min-height:32px;padding:5px 11px;border-radius:999px;font:inherit;font-size:.78rem;font-weight:700;',
    'border:1px solid rgba(255,255,255,.16);background:rgba(15,17,23,.66);color:#f0ece4;font-variant-numeric:tabular-nums;}',
    '#hz-vista button.hz-chip{cursor:pointer;}',
    '#hz-vista .hz-chip[hidden]{display:none;}',
    '#hz-vista .hz-lectura{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));',
    'width:min(560px,calc(100% - 20px));padding:10px 14px 9px;border-radius:16px;text-align:center;pointer-events:none;',
    'background:rgba(12,15,22,.80);border:1px solid rgba(212,175,55,.30);box-shadow:0 6px 24px rgba(0,0,0,.35);}',
    '#hz-vista .hz-lect-n{font-weight:700;font-size:1.02rem;line-height:1.25;color:#F5C76B;overflow-wrap:anywhere;}',
    '#hz-vista .hz-lect-s{margin-top:2px;font-size:.78rem;line-height:1.35;color:rgba(240,236,228,.78);overflow-wrap:anywhere;}',
    '#hz-vista .hz-obj{position:absolute;top:44%;display:flex;align-items:center;gap:6px;max-width:46%;padding:6px 8px 6px 10px;border-radius:999px;',
    'background:rgba(212,175,55,.92);color:#16120a;font-weight:700;font-size:.82rem;pointer-events:auto;}',
    '#hz-vista .hz-obj[hidden]{display:none;}',
    '#hz-vista .hz-obj-n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '#hz-vista .hz-obj button{width:28px;height:28px;flex:0 0 auto;border-radius:50%;border:0;background:rgba(0,0,0,.18);color:inherit;font:inherit;cursor:pointer;padding:0;}',
    '#hz-vista .hz-aviso{position:absolute;left:50%;transform:translateX(-50%);top:calc(118px + env(safe-area-inset-top,0px));width:min(520px,calc(100% - 28px));',
    'padding:9px 13px;border-radius:12px;background:rgba(12,15,22,.88);border:1px solid rgba(255,255,255,.14);font-size:.82rem;line-height:1.4;text-align:center;',
    'opacity:0;transition:opacity .25s;pointer-events:none;}',
    '#hz-vista .hz-aviso.visto{opacity:1;}',
    '#hz-vista .hz-estado{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,calc(100% - 36px));padding:18px 16px;border-radius:16px;',
    'background:rgba(12,15,22,.9);border:1px solid rgba(212,175,55,.3);text-align:center;line-height:1.45;font-size:.9rem;}',
    '#hz-vista .hz-estado[hidden]{display:none;}',
    '#hz-vista .hz-barra{height:4px;margin-top:12px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden;}',
    '#hz-vista .hz-barra i{display:block;height:100%;width:0;background:#D4AF37;}',
    '#hz-vista .hz-acc{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px;}',
    '#hz-vista .hz-acc button,#hz-vista .hz-hoja .hz-fila{min-height:42px;padding:8px 14px;border-radius:999px;cursor:pointer;font:inherit;',
    'border:1px solid rgba(212,175,55,.5);background:rgba(212,175,55,.12);color:#F5C76B;}',
    '#hz-vista .hz-hoja{position:absolute;left:0;right:0;bottom:0;max-height:78%;display:flex;flex-direction:column;border-radius:18px 18px 0 0;',
    'background:#121620;border-top:1px solid rgba(212,175,55,.35);box-shadow:0 -10px 30px rgba(0,0,0,.45);}',
    '#hz-vista .hz-hoja[hidden]{display:none;}',
    '#hz-vista .hz-hoja-cab{display:flex;align-items:center;gap:8px;padding:12px 12px 8px 16px;}',
    "#hz-vista .hz-hoja-t{flex:1 1 auto;margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.25rem;font-weight:700;outline:none;}",
    '#hz-vista .hz-hoja-cuerpo{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0 14px calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:8px;}',
    '#hz-vista .hz-hoja input{min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:#0b0f16;color:#f0ece4;font:inherit;font-size:16px;}',
    '#hz-vista .hz-hoja .hz-fila{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;border-radius:12px;text-align:start;color:#f0ece4;',
    'border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.04);}',
    '#hz-vista .hz-hoja .hz-fila b{color:#F5C76B;font-weight:700;overflow-wrap:anywhere;}',
    '#hz-vista .hz-hoja .hz-fila span{font-size:.78rem;color:rgba(240,236,228,.72);}',
    '#hz-vista .hz-hoja .hz-fila[aria-current=true]{border-color:#D4AF37;}',
    '#hz-vista .hz-nota{font-size:.76rem;line-height:1.45;color:rgba(240,236,228,.66);margin:6px 2px 0;}',
    '#hz-vista .hz-vacio{padding:10px 2px;color:rgba(240,236,228,.7);}'
  ].join('\n');
  function estilos() {
    if (document.getElementById('hz-estilos')) return;
    var s = document.createElement('style'); s.id = 'hz-estilos'; s.textContent = CSS; document.head.appendChild(s);
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined && txt !== null) e.textContent = txt; return e; }
  var SVG_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var SVG_LISTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>';
  var SVG_CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  function boton(cls, svg, aria, fn) {
    var b = el('button', cls); b.type = 'button';
    if (svg) b.innerHTML = svg;
    if (aria) b.setAttribute('aria-label', aria);
    b.addEventListener('click', fn);
    return b;
  }
  function cerrarTxt() { return (typeof tx === 'function' && tx('ariaCerrar')) || '✕'; }

  var VI = null, SEN = { n: 0 };

  function montar() {
    var d = el('div'); d.id = 'hz-vista';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'hz-tit');
    var video = el('video', 'hz-video'); video.setAttribute('playsinline', ''); video.setAttribute('muted', ''); video.muted = true; video.autoplay = true; video.hidden = true;
    var cv = el('canvas', 'hz-lienzo'); cv.setAttribute('role', 'img');
    d.appendChild(video); d.appendChild(cv);
    var arriba = el('div', 'hz-arriba');
    var bx = boton('hz-btn', SVG_X, cerrarTxt(), function () { cerrar(); });
    var tit = el('h2', 'hz-tit'); tit.id = 'hz-tit'; tit.setAttribute('tabindex', '-1');
    var bcam = boton('hz-btn', SVG_CAM, '', function () { camara(!VI.V.camara); }); bcam.setAttribute('aria-pressed', 'false');
    var blis = boton('hz-btn', SVG_LISTA, '', function () { abrirLista(); });
    [bx, tit, bcam, blis].forEach(function (x) { arriba.appendChild(x); });
    d.appendChild(arriba);
    var fila2 = el('div', 'hz-fila2');
    var desde = el('button', 'hz-desde'); desde.type = 'button';
    var desdeE = el('span', 'hz-desde-e'), desdeN = el('span', 'hz-desde-n');
    desde.appendChild(desdeE); desde.appendChild(desdeN);
    desde.addEventListener('click', function () { abrirElegir(); });
    var chips = el('div', 'hz-chips');
    var cRumbo = el('div', 'hz-chip'); cRumbo.setAttribute('aria-hidden', 'true');
    var cModo = el('div', 'hz-chip'); cModo.hidden = true;
    var cAjuste = el('button', 'hz-chip'); cAjuste.type = 'button'; cAjuste.hidden = true;
    cAjuste.addEventListener('click', function () { VI.ajuste = 0; pintarChips(); pedirCuadro(); });
    chips.appendChild(cRumbo); chips.appendChild(cModo); chips.appendChild(cAjuste);
    fila2.appendChild(desde); fila2.appendChild(chips);
    d.appendChild(fila2);
    var obj = el('div', 'hz-obj'); obj.hidden = true;
    var objN = el('span', 'hz-obj-n'), objX = el('button'); objX.type = 'button'; objX.textContent = '✕';
    objX.addEventListener('click', function () { VI.obj = null; obj.hidden = true; pedirCuadro(); });
    obj.appendChild(objN); obj.appendChild(objX); d.appendChild(obj);
    var lect = el('div', 'hz-lectura'); lect.setAttribute('aria-live', 'polite');
    var lectN = el('div', 'hz-lect-n'), lectS = el('div', 'hz-lect-s');
    lect.appendChild(lectN); lect.appendChild(lectS); d.appendChild(lect);
    var aviso = el('div', 'hz-aviso'); aviso.setAttribute('role', 'status'); d.appendChild(aviso);
    var estado = el('div', 'hz-estado'); estado.hidden = true;
    var estT = el('div'), barra = el('div', 'hz-barra'), barraI = el('i'), acc = el('div', 'hz-acc');
    barra.appendChild(barraI); estado.appendChild(estT); estado.appendChild(barra); estado.appendChild(acc);
    d.appendChild(estado);
    var hoja = el('div', 'hz-hoja'); hoja.hidden = true; hoja.setAttribute('role', 'dialog'); hoja.setAttribute('aria-modal', 'true');
    var hojaCab = el('div', 'hz-hoja-cab'), hojaT = el('h3', 'hz-hoja-t'); hojaT.id = 'hz-hoja-t'; hojaT.setAttribute('tabindex', '-1');
    hoja.setAttribute('aria-labelledby', 'hz-hoja-t');
    var hojaX = boton('hz-btn', SVG_X, cerrarTxt(), function () { cerrarHoja(); });
    hojaCab.appendChild(hojaT); hojaCab.appendChild(hojaX);
    var hojaC = el('div', 'hz-hoja-cuerpo');
    hoja.appendChild(hojaCab); hoja.appendChild(hojaC); d.appendChild(hoja);
    document.body.appendChild(d);
    VI = {
      d: d, cv: cv, g: cv.getContext('2d'), video: video, tit: tit, bx: bx, bcam: bcam, blis: blis, desde: desde, desdeE: desdeE, desdeN: desdeN,
      cRumbo: cRumbo, cModo: cModo, cAjuste: cAjuste, objEl: obj, objN: objN, objX: objX, lectN: lectN, lectS: lectS, lect: lect,
      aviso: aviso, estado: estado, estT: estT, barra: barra, barraI: barraI, acc: acc,
      hoja: hoja, hojaT: hojaT, hojaX: hojaX, hojaC: hojaC, hojaTipo: null, hojaHist: false,
      V: { az: 0, alt: 0, fov: 60, camara: false, sensores: false, base: null },
      R: null, origen: null, pos: null, ajuste: 0, cal: 1, sel: null, obj: null, objVisto: false,
      historia: 0, cerrando: false, anim: null, ant: performance.now(), saltar: false, dibujados: [],
      lectura: '', lock: null, flujo: null, avisoT: null, espera: null, calculo: null, sinSensor: false,
      ptrs: {}, arrastre: null
    };
    escucharToques();
    textos();
  }
  function textos() {
    if (!VI) return;
    VI.tit.textContent = t('hzTitulo');
    VI.cv.setAttribute('aria-label', t('hzAria'));
    VI.bx.setAttribute('aria-label', cerrarTxt());
    VI.bcam.setAttribute('aria-label', t('hzCamara'));
    VI.blis.setAttribute('aria-label', t('hzLista'));
    VI.desdeE.textContent = t('hzDesde');
    VI.desdeN.textContent = VI.origen ? (VI.origen.tipo === 'pos' ? t('hzMiPos') : VI.origen.nombre()) : t('hzMiPos');
    VI.desde.setAttribute('aria-label', t('hzDesde') + ': ' + VI.desdeN.textContent + '. ' + t('hzElegir'));
    VI.cAjuste.setAttribute('aria-label', t('hzQuitarAjuste'));
    VI.objX.setAttribute('aria-label', t('hzDejar'));
    VI.hojaX.setAttribute('aria-label', cerrarTxt());
    pintarChips();
  }
  function avisar(txt, ms) {
    if (!VI) return;
    VI.aviso.textContent = txt || '';
    VI.aviso.classList.toggle('visto', !!txt);
    clearTimeout(VI.avisoT);
    if (txt && ms !== 0) VI.avisoT = setTimeout(function () { if (VI) VI.aviso.classList.remove('visto'); }, ms || 6000);
  }
  /* el recuadro del centro: cargando (con barra), o un aviso con botones */
  function estado(txt, barra, botones) {
    if (!VI) return;
    if (!txt) { VI.estado.hidden = true; return; }
    VI.estado.hidden = false; VI.estT.textContent = txt;
    VI.barra.hidden = barra === null || barra === undefined;
    if (!VI.barra.hidden) VI.barraI.style.width = Math.round(Math.max(0, Math.min(1, barra)) * 100) + '%';
    VI.acc.textContent = '';
    (botones || []).forEach(function (b) {
      var x = el('button', null, b[0]); x.type = 'button'; x.addEventListener('click', b[1]); VI.acc.appendChild(x);
    });
    VI.acc.hidden = !(botones && botones.length);
  }
  function despierto(si) {
    try {
      if (si && VI && !VI.lock && navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (l) { if (VI) VI.lock = l; else l.release(); }).catch(function () {});
      }
      if (!si && VI && VI.lock) { VI.lock.release().catch(function () {}); VI.lock = null; }
    } catch (e) {}
  }

  /* ── DESDE DONDE ────────────────────────────────────────────────── */
  function miradores() { return lugaresApp().filter(esMirador); }
  function origenLugar(p) { return { tipo: 'lugar', id: p.id, lat: +p.lat, lng: +p.lng, nombre: function () { return nombreApp(p); } }; }
  function pedirPos(ok, mal) {
    if (!navigator.geolocation) { mal(); return; }
    try {
      navigator.geolocation.getCurrentPosition(function (p) {
        ok({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
      }, function () { mal(); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
    } catch (e) { mal(); }
  }
  function usarPosicion() {
    if (!VI) return;
    VI.origen = { tipo: 'pos', nombre: function () { return t('hzMiPos'); } };
    textos();
    estado(t('hzBuscandoPos'), null);
    var vez = VI.vezPos = (VI.vezPos || 0) + 1;
    pedirPos(function (p) {
      if (!VI || vez !== VI.vezPos) return;
      VI.pos = p;
      VI.origen.lat = p.lat; VI.origen.lng = p.lng;
      prepararYCalcular(p.acc);
    }, function () {
      if (!VI || vez !== VI.vezPos) return;
      estado(t('hzSinPos'), null, [[t('hzElegir'), abrirElegir]]);
    });
  }
  function usarLugar(p) {
    if (!VI || !p) return;
    VI.vezPos = (VI.vezPos || 0) + 1;
    VI.origen = origenLugar(p);
    textos();
    prepararYCalcular(null);
  }
  function prepararYCalcular(precision) {
    if (!VI) return;
    estado(t('hzCargando'), 0);
    var vez = VI.vezCalc = (VI.vezCalc || 0) + 1;
    cargarRelieve().then(function () {
      if (!VI || vez !== VI.vezCalc) return;
      var o = VI.origen;
      if (!enCaja(o.lat, o.lng)) { estado(t('hzFuera'), null, [[t('hzElegir'), abrirElegir]]); return; }
      var ob = observador(o.lat, o.lng);
      if (!ob) { estado(t('hzFuera'), null, [[t('hzElegir'), abrirElegir]]); return; }
      cancelar(VI.calculo);
      VI.calculo = calcular(ob, function (f) { if (VI && vez === VI.vezCalc) estado(t('hzCargando'), f); }, function (R) {
        if (!VI || vez !== VI.vezCalc) return;
        VI.R = R; VI.sel = null; VI.obj = null; if (VI.objEl) VI.objEl.hidden = true;
        estado(null);
        if (!VI.V.sensores) mirarAlPrincipal();
        if (precision && precision > 150) avisar(t('hzImprecisa', { m: distTxt(precision) }), 8000);
        pedirCuadro();
      });
    }, function (e) {
      if (!VI || vez !== VI.vezCalc) return;
      if (e && e.message === 'mal-leido') estado(t('hzMalLeido'), null);
      else estado(t('hzNoCarga'), null, [[t('hzReintentar'), function () { prepararYCalcular(precision); }]]);
    });
  }
  /* sin brujula, la vista empieza mirando a lo mas importante que se ve (casi siempre el Teide) */
  function mirarAlPrincipal() {
    var R = VI.R, x = R && R.vistos[0];
    if (x) { VI.V.az = x.az; VI.V.alt = Math.max(-10, Math.min(20, Math.atan(x.tg) / RAD)); }
  }

  /* ── LAS HOJAS: desde donde, y lo que se ve ─────────────────────── */
  /* si el pasaporte esta debajo (se abre desde su «Pase de viaje»), las entradas llevan tambien
     tgPerfil, como las de «Su cuerpo»: asi su popstate no lo cierra al volver de una hoja */
  function entradaHz(e) { if (VI && VI.sobrePerfil) e.tgPerfil = 1; return e; }
  function abrirHoja(tipo, titulo) {
    VI.hojaTipo = tipo; VI.hojaT.textContent = titulo; VI.hojaC.textContent = '';
    VI.hoja.hidden = false;
    if (!VI.hojaHist) { try { history.pushState(entradaHz({ tgHorizonteHoja: 1 }), ''); VI.hojaHist = true; } catch (e) {} }
    return VI.hojaC;
  }
  function cerrarHoja(desdeHistoria) {
    if (!VI || VI.hoja.hidden) return;
    VI.hoja.hidden = true; VI.hojaTipo = null; VI.hojaC.textContent = '';
    if (VI.hojaHist) {
      VI.hojaHist = false;
      if (!desdeHistoria) { VI.ignorarAtras = true; try { history.back(); } catch (e) { VI.ignorarAtras = false; } }
    }
    try { VI.blis.focus({ preventScroll: true }); } catch (e) {}
  }
  function quitarAcentos(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function abrirElegir() {
    if (!VI) return;
    var c = abrirHoja('elegir', t('hzElegir'));
    var inp = el('input'); inp.type = 'search'; inp.setAttribute('autocomplete', 'off'); inp.setAttribute('enterkeyhint', 'search');
    inp.placeholder = t('hzBuscar'); inp.setAttribute('aria-label', t('hzBuscar'));
    c.appendChild(inp);
    var lista = el('div'); lista.style.display = 'flex'; lista.style.flexDirection = 'column'; lista.style.gap = '8px';
    c.appendChild(lista);
    var desde = VI.pos;
    var M = miradores().map(function (p) { return { p: p, n: nombreApp(p), d: desde ? distGC(desde, p) : null }; });
    M.sort(function (a, b) { return (a.d !== null && b.d !== null) ? a.d - b.d : a.n.localeCompare(b.n, loc()); });
    function fila(nombre, sub, actual, fn) {
      var b = el('button', 'hz-fila'); b.type = 'button';
      b.appendChild(el('b', null, nombre)); if (sub) b.appendChild(el('span', null, sub));
      if (actual) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', fn); return b;
    }
    function pintar() {
      lista.textContent = '';
      var q = quitarAcentos(inp.value).trim();
      if (!q) lista.appendChild(fila('📍 ' + t('hzMiPos'), '', VI.origen && VI.origen.tipo === 'pos', function () { cerrarHoja(); usarPosicion(); }));
      var n = 0;
      M.forEach(function (m) {
        if (q && quitarAcentos(m.n).indexOf(q) < 0) return;
        n++;
        lista.appendChild(fila(m.n, m.d !== null ? t('hzA', { d: distTxt(m.d) }) : '', VI.origen && VI.origen.id === m.p.id, function () { cerrarHoja(); usarLugar(m.p); }));
      });
      if (q && !n) lista.appendChild(el('div', 'hz-vacio', t('hzNinguno')));
    }
    inp.addEventListener('input', pintar);
    pintar();
    try { VI.hojaT.focus({ preventScroll: true }); } catch (e) {}
  }
  function detalle(x) {
    var p = [];
    p.push(t(x.tipo === 'cima' ? 'hzTipoCima' : x.tipo === 'isla' ? 'hzTipoIsla' : 'hzTipoPueblo'));
    if (x.tipo === 'isla' && x.sub) p.push(x.sub);
    if (x.tipo === 'cima' && isFinite(x.m)) p.push(altTxt(x.m));
    p.push(t('hzA', { d: distTxt(x.d) }));
    p.push(rumboTxt(x.az));
    return p.join(' · ');
  }
  function abrirLista() {
    if (!VI) return;
    var c = abrirHoja('lista', t('hzListaTit'));
    var R = VI.R;
    if (!R) { c.appendChild(el('div', 'hz-vacio', t('hzCargando'))); }
    else if (!R.vistos.length) c.appendChild(el('div', 'hz-vacio', t('hzListaVacia')));
    else {
      var az0 = azVista();
      var V = R.vistos.slice().sort(function (a, b) { return norm360(a.az - az0 + 180) - norm360(b.az - az0 + 180); });
      V.forEach(function (x) {
        var b = el('button', 'hz-fila'); b.type = 'button';
        b.appendChild(el('b', null, x.t)); b.appendChild(el('span', null, detalle(x)));
        b.addEventListener('click', function () { cerrarHoja(); buscarRotulo(x); });
        c.appendChild(b);
      });
    }
    c.appendChild(el('p', 'hz-nota', t('hzListaNota')));
    var f = el('p', 'hz-nota');
    f.appendChild(el('span', null, t('hzRelieve') + ': '));
    var cr = el('span', null, (D && D.credito) || 'Obra derivada de MDT05-cob1 2008-2015 CC-BY 4.0 scne.es'); cr.setAttribute('data-sin-traducir', 'credito');
    f.appendChild(cr);
    c.appendChild(f);
    c.appendChild(el('p', 'hz-nota', t('hzNombresOsm')));
    c.appendChild(el('p', 'hz-nota', t('hzIslasFuente')));
    try { VI.hojaT.focus({ preventScroll: true }); } catch (e) {}
  }
  /* con brujula, una flecha lleva hasta el; sin ella, la vista gira hasta el */
  function buscarRotulo(x) {
    VI.sel = x;
    if (VI.V.sensores && SEN.n) { VI.obj = x; VI.objVisto = false; }
    else { VI.V.az = x.az; VI.V.alt = Math.max(-25, Math.min(30, Math.atan(x.tg) / RAD)); }
    pedirCuadro();
  }

  /* ── LOS SENSORES (como modulos/cielo.js) ───────────────────────── */
  function declinacionHoy(fecha) {
    var a = HZ_DECL, y = fecha.getUTCFullYear() + (fecha.getTime() - Date.UTC(fecha.getUTCFullYear(), 0, 1)) / (365.25 * 864e5);
    if (y <= a[0][0]) return a[0][1];
    for (var i = 1; i < a.length; i++) if (y <= a[i][0]) return a[i - 1][1] + (a[i][1] - a[i - 1][1]) * (y - a[i - 1][0]) / (a[i][0] - a[i - 1][0]);
    return a[a.length - 1][1];
  }
  function escucharSensores() {
    if (!VI) return;
    VI.tipoEv = VI.evento || ('ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation');
    window.addEventListener(VI.tipoEv, alGirar, true);
    avisar(t('hzSensoresEspera'), 0);
    VI.espera = setTimeout(function () { if (VI && !SEN.n) sinSensores('nada'); }, 2500);
  }
  function alGirar(e) {
    if (!VI || e.alpha === null || e.beta === null || e.gamma === null || e.alpha === undefined) return;
    SEN.n++;
    SEN.a = e.alpha; SEN.b = e.beta; SEN.g = e.gamma;
    SEN.abs = e.type === 'deviceorientationabsolute' || e.absolute === true;
    SEN.ios = typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0 ? e.webkitCompassHeading : null;
    SEN.prec = typeof e.webkitCompassAccuracy === 'number' ? e.webkitCompassAccuracy : null;
    if (SEN.n === 1) {
      clearTimeout(VI.espera); VI.V.sensores = true; VI.sinSensor = false;
      avisar(t('hzAyuda'), 7000); pintarChips(); pedirCuadro();
    }
  }
  function sinSensores(motivo) {
    if (!VI) return;
    window.removeEventListener('deviceorientationabsolute', alGirar, true);
    window.removeEventListener('deviceorientation', alGirar, true);
    VI.V.sensores = false; VI.sinSensor = true;
    avisar(t(motivo === 'permiso' ? (window.TGO_NATIVO ? 'hzSensoresPermisoApp' : 'hzSensoresPermiso') : 'hzSensoresNo'), 9000);
    pintarChips(); pedirCuadro();
  }
  function anguloPantalla() {
    try { if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle; } catch (e) {}
    return typeof window.orientation === 'number' ? window.orientation : 0;
  }
  function girarVertical(v, d) { var c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [v[0] * c + v[1] * s, -v[0] * s + v[1] * c, v[2]]; }
  function rumboDe(v) { return norm360(Math.atan2(v[0], v[1]) / RAD); }
  function pto(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cruz(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unir(v) { var n = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / n, v[1] / n, v[2] / n]; }
  function baseSensores(fecha) {
    var a = SEN.a * RAD, b = SEN.b * RAD, g = SEN.g * RAD;
    var cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b), cG = Math.cos(g), sG = Math.sin(g);
    var x = [cA * cG - sA * sB * sG, sA * cG + cA * sB * sG, -cB * sG];
    var y = [-sA * cB, cA * cB, sB];
    var z = [cA * sG + sA * sB * cG, sA * sG - cA * sB * cG, cB * cG];
    var f = [-z[0], -z[1], -z[2]];
    var th = anguloPantalla() * RAD, c = Math.cos(th), s = Math.sin(th);
    var u = [s * x[0] + c * y[0], s * x[1] + c * y[1], s * x[2] + c * y[2]];
    var giro = declinacionHoy(fecha) + VI.ajuste;
    if (!SEN.abs && SEN.ios !== null) {
      var adelante = SEN.b > 10 && SEN.b < 80 && Math.abs(SEN.g) < 35;
      var hv = Math.hypot(y[0], y[1]) > 0.25 ? y : f;
      var dif = ((SEN.ios - rumboDe(hv)) + 540) % 360 - 180;
      if (SEN.offIOS === undefined || (adelante && SEN.offProv)) { SEN.offIOS = dif; SEN.offProv = !adelante; }
      else if (adelante) SEN.offIOS += (((dif - SEN.offIOS) + 540) % 360 - 180) * 0.08;
      giro += SEN.offIOS;
      if (SEN.prec !== null && SEN.prec > 25 && !VI.avisoCal) { VI.avisoCal = true; avisar(t('hzCalibra'), 9000); }
    }
    return { f: girarVertical(f, giro), u: girarVertical(u, giro) };
  }
  function suavizar(B, dt) {
    var k = 1 - Math.exp(-dt / 0.09), s = SEN.suave;
    if (!s || dt > 1) { SEN.suave = { f: B.f.slice(), u: B.u.slice() }; s = SEN.suave; }
    else for (var i = 0; i < 3; i++) { s.f[i] += k * (B.f[i] - s.f[i]); s.u[i] += k * (B.u[i] - s.u[i]); }
    var f = unir(s.f), d = pto(s.u, f), u = unir([s.u[0] - d * f[0], s.u[1] - d * f[1], s.u[2] - d * f[2]]);
    s.f = f; s.u = u;
    return { f: f, u: u, r: cruz(f, u) };
  }
  function baseManual(V) {
    var a = V.az * RAD, e = V.alt * RAD;
    var f = [Math.cos(e) * Math.sin(a), Math.cos(e) * Math.cos(a), Math.sin(e)];
    var r = [Math.cos(a), -Math.sin(a), 0];
    return { f: f, u: cruz(r, f), r: r };
  }
  function azVista() { var B = VI && VI.V.base; return B ? rumboDe(B.f) : (VI ? norm360(VI.V.az) : 0); }

  /* ── LA CAMARA (como modulos/cielo.js) ──────────────────────────── */
  function camara(si) {
    if (!VI) return;
    if (!si) { pararCamara(); VI.V.camara = false; VI.video.hidden = true; pintarChips(); pedirCuadro(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { avisar(t('hzCamaraNo')); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(function (st) {
        if (!VI || document.hidden) { st.getTracks().forEach(function (x) { x.stop(); }); return; }
        VI.flujo = st; VI.video.srcObject = st; VI.video.hidden = false;
        var p = VI.video.play(); if (p && p.catch) p.catch(function () {});
        VI.V.camara = true; pintarChips(); pedirCuadro();
      }, function (e) {
        avisar(t(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? (window.TGO_NATIVO ? 'hzCamaraPermisoApp' : 'hzCamaraPermiso') : 'hzCamaraNo'));
        pintarChips();
      });
  }
  function pararCamara() {
    if (VI && VI.flujo) { VI.flujo.getTracks().forEach(function (x) { x.stop(); }); VI.flujo = null; VI.video.srcObject = null; }
  }
  function focal(V) {
    if (V.camara) {
      var vw = VI.video.videoWidth, vh = VI.video.videoHeight;
      if (vw && vh) {
        var fv = Math.max(vw, vh) / 2 / Math.tan(CAMARA_LARGO / 2 * RAD);
        return fv * Math.max(V.W / vw, V.H / vh) * VI.cal;
      }
    }
    return (V.W / 2) / Math.tan(V.fov / 2 * RAD);
  }
  function pintarChips() {
    if (!VI) return;
    VI.bcam.setAttribute('aria-pressed', VI.V.camara ? 'true' : 'false');
    VI.cModo.hidden = VI.V.sensores;
    VI.cModo.textContent = t('hzArrastra');
    var aj = Math.round(VI.ajuste);
    VI.cAjuste.hidden = !(VI.V.sensores && aj !== 0);
    VI.cAjuste.textContent = '↺ ' + (aj > 0 ? '+' : '') + num(aj) + '°';
  }

  /* ── CADA CUADRO ────────────────────────────────────────────────── */
  var COLORES = ['#1d2738', '#28354b', '#35445d', '#44546f', '#566883'];   // de cerca a lejos
  var COL = { cima: '#F5C76B', pueblo: '#EDE7DA', isla: '#8FD3FF' };
  function pedirCuadro() { if (VI && !VI.anim) VI.anim = requestAnimationFrame(cuadro); }
  function cuadro(ahora) {
    if (!VI) return;
    VI.anim = null;
    if (document.hidden) return;
    var V = VI.V, vivo = V.sensores || V.camara;
    if (V.camara && VI.saltar) { VI.saltar = false; VI.anim = requestAnimationFrame(cuadro); return; }
    VI.saltar = true;
    var dt = Math.min(1.5, (ahora - VI.ant) / 1000); VI.ant = ahora;
    var cv = VI.cv, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w && h && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
    V.dpr = dpr; V.W = cv.width; V.H = cv.height;
    try { V.yTope = (VI.fila2.getBoundingClientRect().bottom + 8) * dpr; } catch (e) { V.yTope = 120 * dpr; }
    V.base = (V.sensores && SEN.n) ? suavizar(baseSensores(new Date()), dt) : baseManual(V);
    V.F = focal(V);
    dibujar(V);
    lectura(V);
    objetivo(V);
    var az = rumboDe(V.base.f), rt = rumboTxt(az) + ' ' + Math.round(az) % 360 + '°';
    if (VI.cRumbo.textContent !== rt) VI.cRumbo.textContent = rt;
    if (vivo) VI.anim = requestAnimationFrame(cuadro);
  }
  /* una direccion (rumbo en grados, tangente de la elevacion) a la pantalla, con la base de la
     vista (adelante f, arriba u, derecha r) y la focal en pixeles; null si queda detras */
  function proy(V, az, tg) {
    var a = az * RAD, e = Math.atan(tg), ce = Math.cos(e), B = V.base;
    var w0 = ce * Math.sin(a), w1 = ce * Math.cos(a), w2 = Math.sin(e);
    var z = w0 * B.f[0] + w1 * B.f[1] + w2 * B.f[2];
    if (z < 0.06) return null;
    return [V.W / 2 + V.F * (w0 * B.r[0] + w1 * B.r[1] + w2 * B.r[2]) / z, V.H / 2 - V.F * (w0 * B.u[0] + w1 * B.u[1] + w2 * B.u[2]) / z];
  }
  function kk(k) { return ((k % N_RAYOS) + N_RAYOS) % N_RAYOS; }
  /* una capa: la linea de arriba (fT da su tangente en cada rayo) y, cerrandola, el fondo */
  function poligono(g, V, k0, k1, fT, color, borde) {
    var tramo = [];
    function cerrarTramo() {
      if (tramo.length > 1) {
        var a = tramo[0], b = tramo[tramo.length - 1], abajo = V.H + 10;
        g.beginPath(); g.moveTo(a[0], a[1]);
        for (var i = 1; i < tramo.length; i++) g.lineTo(tramo[i][0], tramo[i][1]);
        g.lineTo(b[0], abajo); g.lineTo(a[0], abajo); g.closePath();
        g.fillStyle = color; g.fill();
        if (borde) {
          g.beginPath(); g.moveTo(a[0], a[1]);
          for (var j = 1; j < tramo.length; j++) g.lineTo(tramo[j][0], tramo[j][1]);
          g.strokeStyle = borde; g.lineWidth = V.dpr; g.stroke();
        }
      }
      tramo = [];
    }
    for (var k = k0; k <= k1; k++) {
      var p = proy(V, k * PASO_AZ, fT(k));
      if (!p) { cerrarTramo(); continue; }
      tramo.push(p);
    }
    cerrarTramo();
  }
  function linea(g, V, k0, k1, fT, cam) {
    g.beginPath();
    var dentro = false;
    for (var k = k0; k <= k1; k++) {
      var p = proy(V, k * PASO_AZ, fT(k));
      if (!p) { dentro = false; continue; }
      if (!dentro) { g.moveTo(p[0], p[1]); dentro = true; } else g.lineTo(p[0], p[1]);
    }
    g.lineJoin = 'round';
    if (cam) {
      g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 4 * V.dpr; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.92)'; g.lineWidth = 1.6 * V.dpr; g.stroke();
    } else { g.strokeStyle = 'rgba(245,199,107,0.45)'; g.lineWidth = 1.2 * V.dpr; g.stroke(); }
  }
  function dibujar(V) {
    var g = VI.g, W = V.W, H = V.H, R = VI.R;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    var cam = V.camara && !VI.video.hidden;
    if (!cam) {
      var gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#0c1526'); gr.addColorStop(0.55, '#1c2d47'); gr.addColorStop(1, '#26354d');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }
    VI.dibujados = [];
    if (!R) return;
    var azC = rumboDe(V.base.f);
    var semi = Math.max(Math.atan(W / 2 / V.F), Math.atan(H / 2 / V.F)) / RAD + 8;
    var k0 = Math.floor((azC - semi) / PASO_AZ), k1 = Math.ceil((azC + semi) / PASO_AZ);
    if (k1 - k0 >= N_RAYOS) { k0 = Math.floor((azC - 180) / PASO_AZ); k1 = k0 + N_RAYOS; }
    if (!cam) {
      poligono(g, V, k0, k1, function () { return R.tDip; }, '#0d2338');
      for (var b = NB - 1; b >= 0; b--) {
        poligono(g, V, k0, k1, function (k) { return R.tB[kk(k) * NB + b]; }, COLORES[b], 'rgba(255,255,255,0.10)');
      }
    }
    linea(g, V, k0, k1, function (k) { return Math.max(R.tB[kk(k) * NB + NB - 1], R.tDip); }, cam);
    pintarRotulos(g, V);
    /* la mira del centro: lo que queda en ella se nombra abajo */
    g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = V.dpr;
    g.setLineDash([4 * V.dpr, 5 * V.dpr]);
    g.beginPath(); g.moveTo(W / 2, V.yTope); g.lineTo(W / 2, H * 0.82); g.stroke();
    g.setLineDash([]);
  }
  function corto(s) { s = String(s || ''); return s.length > 28 ? s.slice(0, 27) + '…' : s; }
  /* Los nombres, en vertical y de mas a menos importante, cada uno con su raya hasta su sitio;
     el que no cabe sin pisar a otro no se pinta (se ve en la lista) */
  function pintarRotulos(g, V) {
    var R = VI.R, dpr = V.dpr, fs = Math.round(12.5 * dpr), ancho = fs * 1.3, yTope = V.yTope;
    g.font = '600 ' + fs + "px 'DM Sans', system-ui, sans-serif";
    g.textBaseline = 'middle'; g.textAlign = 'left';
    var ocupado = [], max = Math.floor(V.W / ancho);
    for (var i = 0; i < R.vistos.length && ocupado.length < max; i++) {
      var x = R.vistos[i], p = proy(V, x.az, x.tg);
      if (!p || p[0] < 6 * dpr || p[0] > V.W - 6 * dpr || p[1] < yTope + 20 * dpr || p[1] > V.H) continue;
      var libre = true;
      for (var j = 0; j < ocupado.length; j++) if (Math.abs(ocupado[j] - p[0]) < ancho) { libre = false; break; }
      if (!libre) continue;
      var nombre = corto(x.t), len = g.measureText(nombre).width;
      var yT = Math.min(p[1] - 12 * dpr, Math.max(yTope + len, V.H * 0.46));
      if (yT - len < yTope || yT > p[1] - 6 * dpr) continue;
      ocupado.push(p[0]);
      var sel = VI.sel === x;
      g.strokeStyle = sel ? '#ffffff' : 'rgba(255,255,255,0.55)'; g.lineWidth = dpr;
      g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], yT + 4 * dpr); g.stroke();
      g.fillStyle = COL[x.tipo];
      g.beginPath(); g.arc(p[0], p[1], 2.6 * dpr, 0, 2 * Math.PI); g.fill();
      g.save(); g.translate(p[0], yT); g.rotate(-Math.PI / 2);
      g.lineJoin = 'round'; g.lineWidth = 3 * dpr; g.strokeStyle = 'rgba(0,0,0,0.7)'; g.strokeText(nombre, 0, 0);
      g.fillStyle = sel ? '#ffffff' : COL[x.tipo]; g.fillText(nombre, 0, 0);
      g.restore();
      VI.dibujados.push({ x: p[0], y: p[1], yT: yT, len: len, r: x });
    }
  }
  function enPantalla(x) { for (var i = 0; i < VI.dibujados.length; i++) if (VI.dibujados[i].r === x) return true; return false; }
  /* abajo: lo elegido, o lo que hay en la mira, o a que distancia queda el horizonte */
  function lectura(V) {
    var R = VI.R, n = '', s = '';
    if (R) {
      var x = (VI.sel && enPantalla(VI.sel)) ? VI.sel : null;
      if (!x) { var dmin = 22 * V.dpr; VI.dibujados.forEach(function (q) { var dd = Math.abs(q.x - V.W / 2); if (dd < dmin) { dmin = dd; x = q.r; } }); }
      if (x) { n = x.t; s = detalle(x); }
      else {
        var az = rumboDe(V.base.f), k = Math.round(az / PASO_AZ) % N_RAYOS;
        n = t('hzNada');
        s = (R.tL[k] > R.tDip ? t('hzHorizonte', { d: distTxt(R.dL[k]) }) : t('hzMar', { d: distTxt(R.dMar) })) + ' · ' + rumboTxt(az);
      }
    }
    var clave = n + '|' + s;
    if (clave !== VI.lectura) { VI.lectura = clave; VI.lectN.textContent = n; VI.lectS.textContent = s; VI.lect.hidden = !n; }
  }
  /* lo buscado desde la lista: una flecha al borde hasta que entra en la mira (y el movil vibra) */
  function objetivo(V) {
    var x = VI.obj, E = VI.objEl;
    if (!x || !V.sensores) { E.hidden = true; return; }
    var p = proy(V, x.az, x.tg);
    if (p && p[0] > 0 && p[0] < V.W && p[1] > V.yTope && p[1] < V.H) {
      E.hidden = true;
      if (!VI.objVisto && Math.abs(p[0] - V.W / 2) < 24 * V.dpr) {
        VI.objVisto = true; VI.sel = x;
        avisar(t('hzAhi', { x: x.t }), 4000);
        try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {}
      }
      return;
    }
    var dif = ((x.az - rumboDe(V.base.f) + 540) % 360) - 180, txt;
    if (Math.abs(dif) < 15) txt = (Math.atan(x.tg) > Math.asin(V.base.f[2]) ? '↑ ' : '↓ ') + x.t;
    else txt = dif < 0 ? '← ' + x.t : x.t + ' →';
    E.hidden = false;
    if (VI.objN.textContent !== txt) VI.objN.textContent = txt;
    E.style.left = dif < 0 ? '10px' : ''; E.style.right = dif < 0 ? '' : '10px';
  }

  /* ── LOS DEDOS ──────────────────────────────────────────────────── */
  function escucharToques() {
    var cv = VI.cv;
    cv.addEventListener('pointerdown', function (e) {
      if (!VI) return;
      VI.ptrs[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now() };
      try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      var ids = Object.keys(VI.ptrs);
      if (ids.length === 2) {
        var a = VI.ptrs[ids[0]], b = VI.ptrs[ids[1]];
        VI.pinza = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, fov0: VI.V.fov, cal0: VI.cal };
      }
    });
    cv.addEventListener('pointermove', function (e) {
      if (!VI || !VI.ptrs[e.pointerId]) return;
      var q = VI.ptrs[e.pointerId], dx = e.clientX - q.x, dy = e.clientY - q.y;
      q.x = e.clientX; q.y = e.clientY;
      var ids = Object.keys(VI.ptrs), V = VI.V;
      if (ids.length >= 2 && VI.pinza) {
        var a = VI.ptrs[ids[0]], b = VI.ptrs[ids[1]], dd = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        if (V.camara) VI.cal = Math.max(0.6, Math.min(1.8, VI.pinza.cal0 * dd / VI.pinza.d0));
        else V.fov = Math.max(20, Math.min(100, VI.pinza.fov0 * VI.pinza.d0 / dd));
        pedirCuadro(); return;
      }
      var por = (V.F ? 2 * Math.atan(V.W / 2 / V.F) / RAD : V.fov) / Math.max(1, cv.clientWidth);
      if (V.sensores) { VI.ajuste = Math.max(-60, Math.min(60, VI.ajuste - dx * por)); pintarChips(); }
      else { V.az = norm360(V.az - dx * por); V.alt = Math.max(-25, Math.min(30, V.alt + dy * por)); }
      pedirCuadro();
    });
    function fin(e) {
      if (!VI || !VI.ptrs[e.pointerId]) return;
      var q = VI.ptrs[e.pointerId];
      delete VI.ptrs[e.pointerId];
      if (Object.keys(VI.ptrs).length < 2) VI.pinza = null;
      if (e.type === 'pointerup' && Math.hypot(e.clientX - q.x0, e.clientY - q.y0) < 8 && performance.now() - q.t0 < 500) tocar(e.clientX, e.clientY);
    }
    cv.addEventListener('pointerup', fin);
    cv.addEventListener('pointercancel', fin);
    cv.addEventListener('wheel', function (e) {
      if (!VI || VI.V.camara) return;
      e.preventDefault();
      VI.V.fov = Math.max(20, Math.min(100, VI.V.fov * (1 + e.deltaY * 0.001)));
      pedirCuadro();
    }, { passive: false });
  }
  /* tocar un nombre lo elige (se lee abajo); tocar donde no hay ninguno lo suelta */
  function tocar(cx, cy) {
    var V = VI.V, dpr = V.dpr || 1, x = cx * dpr, y = cy * dpr, mejor = null, dmin = 20 * dpr;
    VI.dibujados.forEach(function (q) {
      if (y < q.yT - q.len - 12 * dpr || y > q.y + 14 * dpr) return;
      var d = Math.abs(q.x - x); if (d < dmin) { dmin = d; mejor = q.r; }
    });
    VI.sel = (mejor && VI.sel !== mejor) ? mejor : null;
    pedirCuadro();
  }
  function alTeclado(e) {
    if (!VI) return;
    if (e.key === 'Escape') { e.preventDefault(); if (!VI.hoja.hidden) cerrarHoja(); else cerrar(); return; }
    if (!VI.hoja.hidden || VI.V.sensores) return;
    var V = VI.V;
    if (e.key === 'ArrowLeft') V.az = norm360(V.az - 5);
    else if (e.key === 'ArrowRight') V.az = norm360(V.az + 5);
    else if (e.key === 'ArrowUp') V.alt = Math.min(30, V.alt + 3);
    else if (e.key === 'ArrowDown') V.alt = Math.max(-25, V.alt - 3);
    else if (e.key === '+' || e.key === '=') V.fov = Math.max(20, V.fov / 1.15);
    else if (e.key === '-') V.fov = Math.min(100, V.fov * 1.15);
    else return;
    e.preventDefault(); pedirCuadro();
  }

  /* ── ABRIR Y CERRAR (con el boton «atras» del movil) ────────────── */
  function alVisibilidad() {
    if (!VI) return;
    if (document.hidden) { pararCamara(); despierto(false); }
    else { despierto(true); if (VI.V.camara) camara(true); pedirCuadro(); }
  }
  /* opc.permiso: la promesa de DeviceOrientationEvent.requestPermission(), pedida en el mismo
     toque que abre (iOS solo la deja pedir ahi; modulos/pase.js la pide antes de cargar esto).
     opc.desde: el id de un mirador para empezar desde el. opc.evento: el de los sensores, para
     las pruebas (tools/probar_pase.js fuerza el camino de iOS en Chromium) */
  function abrir(opc) {
    opc = opc || {};
    var pedir = opc.permiso || null;
    if (!pedir) {
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function')
          pedir = DeviceOrientationEvent.requestPermission();
      } catch (e) { pedir = null; }
    }
    if (VI) cerrarYa();
    estilos();
    montar();
    VI.fila2 = VI.d.querySelector('.hz-fila2');
    VI.evento = opc.evento || null;
    VI.alCerrar = opc.alCerrar || null;
    document.documentElement.classList.add('hz-abierto');
    VI.sobrePerfil = (function () { var pp = document.getElementById('perfil-panel'); return !!(pp && !pp.hidden); })();
    try { history.pushState(entradaHz({ tgHorizonte: 1 }), ''); VI.historia = 1; } catch (e) {}
    document.addEventListener('visibilitychange', alVisibilidad);
    despierto(true);
    var p = pedir ? Promise.resolve(pedir).catch(function () { return 'denied'; }) : Promise.resolve('granted');
    p.then(function (r) { if (!VI) return; if (r === 'granted') escucharSensores(); else sinSensores('permiso'); });
    var lugar = null;
    if (opc.desde) lugaresApp().some(function (x) { if (x.id === opc.desde && esMirador(x)) { lugar = x; return true; } return false; });
    if (lugar) usarLugar(lugar); else usarPosicion();
    try { VI.tit.focus({ preventScroll: true }); } catch (e) {}
    pedirCuadro();
  }
  function cerrar() {
    if (!VI || VI.cerrando) return;   /* dos toques seguidos: un solo «atras» */
    var n = VI.historia + (VI.hojaHist ? 1 : 0);
    VI.hoja.hidden = true; VI.hojaHist = false;
    if (n > 0) {
      VI.cerrando = true;
      var v = VI;
      setTimeout(function () { if (VI === v && v.cerrando) cerrarYa(); }, 450);
      try { history.go(-n); return; } catch (e) { VI.cerrando = false; }
    }
    cerrarYa();
  }
  function cerrarYa() {
    if (!VI) return;
    var v = VI;
    window.removeEventListener('deviceorientationabsolute', alGirar, true);
    window.removeEventListener('deviceorientation', alGirar, true);
    document.removeEventListener('visibilitychange', alVisibilidad);
    if (v.anim) cancelAnimationFrame(v.anim);
    clearTimeout(v.espera); clearTimeout(v.avisoT);
    cancelar(v.calculo);
    pararCamara();
    despierto(false);
    if (v.d && v.d.parentNode) v.d.parentNode.removeChild(v.d);
    VI = null; SEN = { n: 0 };
    document.documentElement.classList.remove('hz-abierto');
    if (v.alCerrar) { try { v.alCerrar(); } catch (e) {} }
  }
  /* El «atras»: se mira en que entrada del historial se queda. En la de la vista, la hoja que
     hubiera se cierra; por debajo de la vista, se cierra la vista. Asi da igual quien mas escuche
     (el «Pase de viaje», debajo, mira lo mismo) */
  function alAtras() {
    if (!VI) return;
    var st = history.state || {};
    if (st.tgHorizonteHoja) return;
    if (st.tgHorizonte && !VI.cerrando) { if (!VI.hoja.hidden) { VI.hojaHist = false; cerrarHoja(true); } return; }
    cerrarYa();
  }
  window.addEventListener('popstate', alAtras);
  document.addEventListener('keydown', alTeclado);
  try { TG_IDIOMA.registrar('«¿Qué estoy viendo?»', function () { if (VI) { textos(); if (VI.R && VI.origen) prepararYCalcular(null); } }); } catch (e) {}

  /* Para modulos/pase.js y para tools/probar_pase.js */
  window.TG_HORIZONTE = {
    abrir: abrir, cerrar: cerrar, abierto: function () { return !!VI; }, t: t, filas: HZ_UI,
    _prueba: {
      cargarRelieve: cargarRelieve, observador: observador, calcular: calcular, islas: ISLAS, decl: HZ_DECL, hitos: HITOS,
      distGC: distGC, rumboGC: rumboGC, num: num, distTxt: distTxt, vista: function () { return VI; }, sen: function () { return SEN; },
      miradores: miradores, rotulos: function () { return VI && VI.R ? VI.R.vistos : null; }, detalle: detalle,
      proy: proy, tHorizonte: tHorizonte, relieve: function () { return D; }
    }
  };
})();
