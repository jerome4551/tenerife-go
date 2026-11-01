/* modulos/isla3d.js — «La isla en 3D», sin conexion (31 de octubre de 2026).
   Lo pide el cargador de index.html la primera vez que alguien toca el boton
   «3D» del mapa; tools/fuente.js y tools/fuente.py lo pegan al final del
   fuente para las herramientas (CARGA-PEREZOSA).

   QUE DIBUJA
   El relieve de verdad de la isla (mapa/tenerife-relieve.png, una celda de
   60 m, del MDT05 del IGN o, si no sale, del Copernicus DEM GLO-30, con la
   costa del mapa detallado: lo hace tools/relieve_construir.py), con encima el mismo mapa de la app
   (mapa/tenerife-osm.pmtiles si esta descargado; si no, el mapa base que
   viaja dentro) pintado con unos colores pensados para verse en relieve, y
   los nombres de pueblos, cimas y macizos que saca la misma herramienta del
   mapa de OSM. Todo esta en el movil: no pide nada a la red.

   COMO
   WebGL a mano, sin bibliotecas: una malla por teselas de 64 x 64 celdas con
   niveles de detalle (de cerca la celda entera, de lejos una de cada 2, 4,
   8...) y faldones para que no se vean grietas entre niveles; la luz se
   calcula por pixel con la pendiente de la celda de 60 m, asi que el detalle
   del relieve no depende de la malla. La luz del mapa viene del noroeste,
   como en los mapas de relieve; la del sol de ahora sale de Astronomy Engine
   (vendor/, el mismo motor del cielo), para la hora y el sitio que se mira,
   con las sombras que proyecta el relieve (WebGL 2) y, de noche, la luna.
   Se pinta solo cuando algo cambia: quieto, no gasta bateria.

   El «atras» del movil, Escape y «2D» cierran (una entrada en el historial,
   como el SOS y el cielo). Abajo, el credito de la fuente del relieve (el del
   MDT05 del IGN, IGN_NOTA; o las dos notas que pide la licencia del Copernicus
   DEM, DEM_NOTA y DEM_RESPONSABILIDAD: DEM_FUENTES) y © OpenStreetMap.

   tools/auditar_isla3d.js lo abre de verdad en un movil emulado, sin red,
   en los diez idiomas, y comprueba lo que dibuja. */
(function () {
  'use strict';

  /* ───────────────────────── textos ───────────────────────── */
  var ISLA3D_UI = {
    "isla3dTitulo": {"es": "La isla en 3D", "en": "The island in 3D", "fr": "L’île en 3D", "de": "Die Insel in 3D", "it": "L’isola in 3D", "nl": "Het eiland in 3D", "zh": "3D 岛屿", "zht": "3D 島嶼", "bg": "Островът в 3D", "pl": "Wyspa w 3D"},
    "isla3dVolver": {"es": "Volver al mapa", "en": "Back to the map", "fr": "Revenir à la carte", "de": "Zurück zur Karte", "it": "Torna alla mappa", "nl": "Terug naar de kaart", "zh": "返回地图", "zht": "返回地圖", "bg": "Обратно към картата", "pl": "Powrót do mapy"},
    "isla3dNorte": {"es": "Poner el norte arriba", "en": "Put north at the top", "fr": "Mettre le nord en haut", "de": "Norden nach oben drehen", "it": "Mettere il nord in alto", "nl": "Noorden naar boven", "zh": "北方朝上", "zht": "北方朝上", "bg": "Север нагоре", "pl": "Północ u góry"},
    "isla3dLuzMapa": {"es": "Luz de mapa", "en": "Map lighting", "fr": "Éclairage carte", "de": "Kartenlicht", "it": "Luce da mappa", "nl": "Kaartlicht", "zh": "地图光照", "zht": "地圖光照", "bg": "Светлина на карта", "pl": "Światło mapy"},
    "isla3dLuzSol": {"es": "Sol de ahora", "en": "Sun right now", "fr": "Soleil actuel", "de": "Sonne jetzt", "it": "Sole di adesso", "nl": "Zon van nu", "zh": "此刻的太阳", "zht": "此刻的太陽", "bg": "Слънцето сега", "pl": "Słońce teraz"},
    "isla3dLuzAyuda": {"es": "Cambiar la luz: la de los mapas de relieve o la del sol a esta hora", "en": "Change the lighting: relief-map light or the sun at this hour", "fr": "Changer l’éclairage : celui des cartes en relief ou le soleil à cette heure", "de": "Licht wechseln: wie auf Reliefkarten oder die Sonne zu dieser Stunde", "it": "Cambiare la luce: quella delle mappe in rilievo o il sole a quest’ora", "nl": "Licht wisselen: zoals op reliëfkaarten of de zon op dit uur", "zh": "切换光照：地形图光照或此刻的太阳", "zht": "切換光照：地形圖光照或此刻的太陽", "bg": "Смяна на светлината: като на релефна карта или слънцето в този час", "pl": "Zmiana światła: jak na mapie plastycznej albo słońce o tej godzinie"},
    "isla3dNoche": {"es": "Es de noche: la isla, a la luz de la luna", "en": "It is night: the island by moonlight", "fr": "C’est la nuit : l’île au clair de lune", "de": "Es ist Nacht: die Insel im Mondlicht", "it": "È notte: l’isola al chiaro di luna", "nl": "Het is nacht: het eiland bij maanlicht", "zh": "现在是夜晚：月光下的岛屿", "zht": "現在是夜晚：月光下的島嶼", "bg": "Нощ е: островът на лунна светлина", "pl": "Jest noc: wyspa w świetle księżyca"},
    "isla3dNocheSinLuna": {"es": "Es de noche y no hay luna: el relieve, con la luz de mapa atenuada", "en": "It is night and the moon is down: the relief with dimmed map lighting", "fr": "C’est la nuit, sans lune : le relief avec l’éclairage carte atténué", "de": "Nacht ohne Mond: das Relief mit gedämpftem Kartenlicht", "it": "È notte e non c’è luna: il rilievo con la luce da mappa attenuata", "nl": "Het is nacht zonder maan: het reliëf met gedimd kaartlicht", "zh": "夜晚无月：以减弱的地图光照显示地形", "zht": "夜晚無月：以減弱的地圖光照顯示地形", "bg": "Нощ е и няма луна: релефът с приглушена светлина на карта", "pl": "Jest noc bez księżyca: rzeźba terenu w przygaszonym świetle mapy"},
    "isla3dAyuda": {"es": "Un dedo: mover · Dos dedos: acercar, girar e inclinar", "en": "One finger: move · Two fingers: zoom, rotate and tilt", "fr": "Un doigt : déplacer · Deux doigts : zoomer, pivoter et incliner", "de": "Ein Finger: verschieben · Zwei Finger: zoomen, drehen und neigen", "it": "Un dito: spostare · Due dita: zoom, ruotare e inclinare", "nl": "Eén vinger: verschuiven · Twee vingers: zoomen, draaien en kantelen", "zh": "单指：移动 · 双指：缩放、旋转和倾斜", "zht": "單指：移動 · 雙指：縮放、旋轉和傾斜", "bg": "Един пръст: местене · Два пръста: мащаб, завъртане и накланяне", "pl": "Jeden palec: przesuwanie · Dwa palce: przybliżanie, obracanie i pochylanie"},
    "isla3dDibujando": {"es": "Dibujando el mapa sobre el relieve…", "en": "Drawing the map over the relief…", "fr": "Dessin de la carte sur le relief…", "de": "Die Karte wird auf das Relief gezeichnet…", "it": "Disegno della mappa sul rilievo…", "nl": "De kaart wordt op het reliëf getekend…", "zh": "正在把地图绘制到地形上…", "zht": "正在把地圖繪製到地形上…", "bg": "Картата се рисува върху релефа…", "pl": "Rysowanie mapy na rzeźbie terenu…"},
    "isla3dMalLeido": {"es": "El relieve no se ha leído bien en este navegador y no se dibuja: así no enseña alturas falsas.", "en": "The relief was not read correctly in this browser, so it is not drawn rather than show false heights.", "fr": "Le relief n’a pas été lu correctement par ce navigateur : il n’est pas affiché, plutôt que de montrer de fausses altitudes.", "de": "Das Relief wurde in diesem Browser nicht richtig gelesen und wird nicht gezeichnet, statt falsche Höhen zu zeigen.", "it": "Il rilievo non è stato letto correttamente da questo browser e non viene disegnato, per non mostrare altezze false.", "nl": "Het reliëf is in deze browser niet goed gelezen en wordt niet getekend, in plaats van verkeerde hoogtes te tonen.", "zh": "此浏览器未能正确读取地形，因此不予显示，以免显示错误的海拔。", "zht": "此瀏覽器未能正確讀取地形，因此不予顯示，以免顯示錯誤的海拔。", "bg": "Релефът не беше прочетен правилно в този браузър и не се показва, за да не показва грешни височини.", "pl": "Rzeźba terenu nie została poprawnie odczytana w tej przeglądarce, więc nie jest wyświetlana, zamiast pokazywać błędne wysokości."},
    "isla3dPerdido": {"es": "El móvil ha liberado la memoria del 3D. Vuelva a abrirlo.", "en": "The phone freed the 3D memory. Please open it again.", "fr": "Le téléphone a libéré la mémoire de la 3D. Rouvrez-la.", "de": "Das Handy hat den Speicher der 3D-Ansicht freigegeben. Öffnen Sie sie erneut.", "it": "Il telefono ha liberato la memoria del 3D. Lo riapra.", "nl": "De telefoon heeft het geheugen van de 3D vrijgegeven. Open hem opnieuw.", "zh": "手机已释放 3D 视图占用的内存，请重新打开。", "zht": "手機已釋放 3D 視圖佔用的記憶體，請重新打開。", "bg": "Телефонът освободи паметта на 3D изгледа. Отворете го отново.", "pl": "Telefon zwolnił pamięć widoku 3D. Proszę otworzyć go ponownie."},
    "isla3dUbicacion": {"es": "Su ubicación", "en": "Your location", "fr": "Votre position", "de": "Ihr Standort", "it": "La Sua posizione", "nl": "Uw locatie", "zh": "您的位置", "zht": "您的位置", "bg": "Вашето местоположение", "pl": "Bieżąca pozycja"},
    "isla3dRelieve": {"es": "Relieve", "en": "Relief", "fr": "Relief", "de": "Relief", "it": "Rilievo", "nl": "Reliëf", "zh": "地形", "zht": "地形", "bg": "Релеф", "pl": "Rzeźba terenu"},
    "isla3dMapa": {"es": "Mapa", "en": "Map", "fr": "Carte", "de": "Karte", "it": "Mappa", "nl": "Kaart", "zh": "地图", "zht": "地圖", "bg": "Карта", "pl": "Mapa"},
    "isla3dCreditos": {"es": "Créditos del relieve y del mapa", "en": "Relief and map credits", "fr": "Crédits du relief et de la carte", "de": "Quellenangaben zu Relief und Karte", "it": "Crediti del rilievo e della mappa", "nl": "Bronnen van reliëf en kaart", "zh": "地形和地图的来源", "zht": "地形和地圖的來源", "bg": "Източници на релефа и картата", "pl": "Źródła rzeźby terenu i mapy"},
    "isla3dMetros": {"es": "{n} m", "en": "{n} m", "fr": "{n} m", "de": "{n} m", "it": "{n} m", "nl": "{n} m", "zh": "{n} 米", "zht": "{n} 公尺", "bg": "{n} м", "pl": "{n} m"},
    "isla3dTeide": {"es": "Teide", "en": "Teide", "fr": "Teide", "de": "Teide", "it": "Teide", "nl": "Teide", "zh": "泰德峰", "zht": "泰德峰", "bg": "Тейде", "pl": "Teide"},
    "isla3dSinWebGL": {"es": "Este móvil no puede dibujar en 3D (no tiene WebGL). El mapa plano funciona igual.", "en": "This phone cannot draw in 3D (no WebGL). The flat map works just the same.", "fr": "Ce téléphone ne peut pas afficher la 3D (pas de WebGL). La carte plane fonctionne normalement.", "de": "Dieses Handy kann nicht in 3D zeichnen (kein WebGL). Die flache Karte funktioniert wie gewohnt.", "it": "Questo telefono non può disegnare in 3D (manca WebGL). La mappa piana funziona come sempre.", "nl": "Deze telefoon kan geen 3D tekenen (geen WebGL). De platte kaart werkt gewoon.", "zh": "这部手机无法绘制 3D（不支持 WebGL）。平面地图照常可用。", "zht": "這支手機無法繪製 3D（不支援 WebGL）。平面地圖照常可用。", "bg": "Този телефон не може да рисува в 3D (няма WebGL). Плоската карта работи както винаги.", "pl": "Ten telefon nie potrafi rysować w 3D (brak WebGL). Płaska mapa działa jak zwykle."}
  };
  try { Object.assign(UI_TX, ISLA3D_UI); } catch (e) {}

  /* SIN-TRADUCIR: ISLA3D_LOCALE codigos de idioma para Intl (numeros), no textos */
  var ISLA3D_LOCALE = {"es": "es-ES", "en": "en-GB", "fr": "fr-FR", "de": "de-DE", "it": "it-IT", "nl": "nl-NL", "zh": "zh-CN", "zht": "zh-TW", "bg": "bg-BG", "pl": "pl-PL"};
  /* SIN-TRADUCIR: ISLA3D_NOMBRE la clave name:xx del mapa de OSM que corresponde a cada idioma de la app */
  var ISLA3D_NOMBRE = {"es": "name:es", "en": "name:en", "fr": "name:fr", "de": "name:de", "it": "name:it", "nl": "name:nl", "zh": "name:zh-Hans", "zht": "name:zh-Hant", "bg": "name:bg", "pl": "name:pl"};
  /* Lo que la licencia del Copernicus DEM («Licence for Copernicus DEM
     instance COP-DEM-GLO-30-F Global 30m Full, Free & Open», articulo 6) pide
     a quien lo ensena al publico, palabra por palabra y en ingles, que es
     como lo da: la nota de los datos adaptados, 6(b) -aqui van remuestreados
     a 60 m y con la costa de OSM-, y la frase de la responsabilidad, 6(c).
     El 6(a) seria para el modelo tal cual, que no es el caso. Salen enteras
     cada vez que se abre el 3D y se pliegan al primer gesto; «ⓘ» las vuelve
     a abrir. tools/relieve_construir.py escribe las mismas en el .json y
     tools/auditar_isla3d.js coteja las tres copias. */
  var DEM_NOTA = 'produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved';
  var DEM_RESPONSABILIDAD = 'The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM-30';
  /* El MDT05 del IGN (31 de octubre de 2026, tarde: Jerome, «Fuentes 3D la mejor pero gratis»):
     CC BY 4.0, y para una obra derivada el IGN pide «Obra derivada de <producto> <fecha> CC-BY 4.0
     <productor>» al pie del mapa, con el identificador, la fecha y el productor de su metadato.
     Es corto: va siempre entero, sin plegar. */
  var IGN_NOTA = 'Obra derivada de MDT05-cob1 2008-2015 CC-BY 4.0 scne.es';
  /* El credito de cada fuente del relieve, por el id que dice su .json (fuente.id;
     tools/relieve_construir.py, FUENTES). Una fuente que no este aqui no se dibuja: el credito
     no sale nunca del .json. tools/auditar_isla3d.js coteja estas copias con las de la
     herramienta. */
  var DEM_FUENTES = {
    'copernicus-glo30': { nota: DEM_NOTA, responsabilidad: DEM_RESPONSABILIDAD, plegada: 'Copernicus WorldDEM-30' },
    'ign-mdt05': { nota: IGN_NOTA, responsabilidad: '', plegada: '' }
  };
  function fuenteDem(meta) {
    var f = (meta && meta.fuente) || {};
    var id = f.id || (f.nombre === 'Copernicus DEM GLO-30' ? 'copernicus-glo30' : '');
    return Object.prototype.hasOwnProperty.call(DEM_FUENTES, id) ? DEM_FUENTES[id] : null;
  }
  /* el credito de OSM con su enlace a derechos de autor y licencia, como el
     del mapa plano (LANZAMIENTO-PLAY.md 1.6) */
  var OSM_DERECHOS = 'https://www.openstreetmap.org/copyright';

  function lang() { return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'es'; }
  function T(k, v) { return (typeof tx === 'function' ? tx('isla3d' + k, v) : '') || ''; }
  function numero(x) {
    try { return Number(x).toLocaleString(ISLA3D_LOCALE[lang()] || 'es-ES', { maximumFractionDigits: 0 }); }
    catch (e) { return String(Math.round(x)); }
  }

  /* ───────────────────────── constantes ───────────────────────── */
  var META_URL = 'mapa/tenerife-relieve.json';
  var PNG_URL = 'mapa/tenerife-relieve.png';
  var AO_URL = 'mapa/tenerife-relieve-ao.png';
  var R = 6378137;
  var N = 64;                     // celdas por tesela de la malla
  var FOV = 40 * Math.PI / 180;   // campo de vision vertical
  var MAR_Z = -15;                // donde se hunden los vertices de mar
  /* Las cimas que la capa de OSM no trae como pico (el Teide va como volcan
     y Protomaps no lo pone en `pois`): su sitio sale de su ficha en places[]
     y la altitud es la oficial que dice la propia ficha («3.715 m»). */
  var HITOS = [{ id: 'pico-teide-cumbre', texto: 'Teide', m: 3715 }];
  /* Los pueblos y ciudades son los de la app (places[], categorias «ciudad»
     y «municipio», con su coordenada comprobada); los de OSM solo rellenan
     donde la app no tiene ninguno cerca. Las dos mayores, mas grandes. */
  var MAYORES = ['Santa Cruz de Tenerife', 'San Cristóbal de La Laguna'];

  function mercX(lon) { return R * lon * Math.PI / 180; }
  function mercY(lat) { var s = Math.sin(lat * Math.PI / 180); return R * 0.5 * Math.log((1 + s) / (1 - s)); }
  function lonDe(X) { return X / R * 180 / Math.PI; }
  function latDe(Y) { return (2 * Math.atan(Math.exp(Y / R)) - Math.PI / 2) * 180 / Math.PI; }

  /* ───────────────────────── estado ───────────────────────── */
  var S = {
    abierto: false, dom: null, gl: null, gl2: false, cv: null, rot: null, ctxRot: null,
    meta: null, H: null, ancho: 0, alto: 0, c: 60, Wm: 0, Hm: 0, k: 1, Xc: 0, Yc: 0,
    tex: {}, prog: {}, buf: {}, nodos: null, raiz: null, Lmax: 0, errNivel: [],
    cam: { tx: 0, ty: 0, d: 30000, rumbo: 0, incl: 0 },
    exag: 1, luz: 'mapa', dpr: 1, w: 0, h: 0,
    drape: false, drapeFuente: null, rotulos: [], pedido: false, anim: null,
    estado: '', cargando: null, sinWebGL: false, perdido: false, cuadros: 0,
    mvp: null, vpInv: null, ojo: [0, 0, 0], planos: null, ultimosNodos: 0
  };

  /* ───────────────────────── matrices (columna a columna, como WebGL) ───────────────────────── */
  function m4mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function m4persp(fov, asp, n, f) {
    var t = 1 / Math.tan(fov / 2), o = new Float32Array(16);
    o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
    return o;
  }
  function m4inv(m) {
    var o = new Float32Array(16), a = m;
    var b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4];
    var b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6];
    var b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12];
    var b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return null;
    det = 1 / det;
    o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * det; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * det;
    o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * det; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * det;
    o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * det; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * det;
    o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * det; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * det;
    o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * det; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * det;
    o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * det; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * det;
    o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * det; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * det;
    o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * det; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * det;
    return o;
  }

  /* ───────────────────────── el relieve ───────────────────────── */
  /* Con <img> y no con createImageBitmap (1 de noviembre de 2026): en WebKit (Safari, el
     iPhone), createImageBitmap con colorSpaceConversion «none» cambiaba el PNG gris del cielo
     visible (272.733 de sus 1.642.445 valores, en ±2: 255 pasaba a 254), las sumas del .json no
     cuadraban y el 3D decia «El relieve no se ha leido bien». Con <img>, WebKit y Chromium lo
     leen exacto, byte a byte, el gris y el de color (probado en un Mac con WebKit 26). */
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

  /* Lee los tres ficheros y comprueba, con las sumas del .json, que el PNG
     ha llegado sin tocar un valor: un navegador que aplicara gestion de color
     cambiaria las alturas en silencio. Si no cuadra, no se dibuja. */
  function cargarRelieve() {
    if (S.H) return Promise.resolve();
    if (S.cargando) return S.cargando;
    S.cargando = fetch(META_URL).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (meta) {
      return Promise.all([leerPNG(PNG_URL), leerPNG(AO_URL)]).then(function (x) {
        var m = meta.malla, a = x[0], o = x[1];
        if (a.w !== m.ancho || a.h !== m.alto || o.w !== m.ancho || o.h !== m.alto) throw new Error('mal-leido');
        var n = m.ancho * m.alto, H = new Float32Array(n), costa = new Uint8Array(n), ao = new Uint8Array(n);
        var sDm = 0, sB = 0, sAo = 0, esc = meta.altura.metros_por_unidad;
        for (var i = 0, p = 0; i < n; i++, p += 4) {
          var dm = a.d[p] * 256 + a.d[p + 1];
          H[i] = dm * esc; costa[i] = a.d[p + 2]; ao[i] = o.d[p];
          sDm = (sDm + dm) >>> 0; sB = (sB + a.d[p + 2]) >>> 0; sAo = (sAo + o.d[p]) >>> 0;
        }
        var c = meta.control;
        var bien = sDm === c.suma_dm && sB === c.suma_costa && sAo === c.suma_ao;
        for (var k = 0; bien && k < c.muestras.length; k++) {
          var s = c.muestras[k], q = s[1] * m.ancho + s[0];
          if (Math.round(H[q] / esc) !== s[2] || costa[q] !== s[3] || ao[q] !== s[4]) bien = false;
        }
        if (!bien) throw new Error('mal-leido');
        var dem = fuenteDem(meta);
        if (!dem) throw new Error('fuente');
        S.meta = meta; S.H = H; S.costa = costa; S.ao = ao; S.dem = dem;
        S.ancho = m.ancho; S.alto = m.alto;
        S.k = Math.cos(m.lat_ref * Math.PI / 180);
        S.c = m.paso * S.k;
        S.Wm = m.ancho * S.c; S.Hm = m.alto * S.c;
        S.Xc = m.x0 + m.ancho * m.paso / 2; S.Yc = m.y0 - m.alto * m.paso / 2;
        prepararArbol();
      });
    }).catch(function (e) { S.cargando = null; throw e; });
    return S.cargando;
  }

  /* lon/lat <-> metros del mundo del 3D (centrado en la malla, y hacia el norte) */
  function aMundo(lon, lat) { return [(mercX(lon) - S.Xc) * S.k, (mercY(lat) - S.Yc) * S.k]; }
  function aLonLat(wx, wy) { return [lonDe(wx / S.k + S.Xc), latDe(wy / S.k + S.Yc)]; }

  function hCelda(i, j) {
    if (i < 0) i = 0; else if (i >= S.ancho) i = S.ancho - 1;
    if (j < 0) j = 0; else if (j >= S.alto) j = S.alto - 1;
    return S.H[j * S.ancho + i];
  }
  /* altura del suelo (m, sin exagerar) en un punto del mundo; 0 en el mar */
  function alturaEn(wx, wy) {
    var fi = (wx + S.Wm / 2) / S.c - 0.5, fj = (S.Hm / 2 - wy) / S.c - 0.5;
    if (fi < -1 || fj < -1 || fi > S.ancho || fj > S.alto) return 0;
    var i = Math.floor(fi), j = Math.floor(fj), u = fi - i, v = fj - j;
    var a = hCelda(i, j), b = hCelda(i + 1, j), c = hCelda(i, j + 1), d = hCelda(i + 1, j + 1);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }

  /* ── el arbol de teselas: cajas, y el error de cada nivel acotado de abajo arriba ── */
  function prepararArbol() {
    var L = 0;
    while (N * (1 << L) < Math.max(S.ancho, S.alto)) L++;
    S.Lmax = L;
    S.nodos = {};
    S.errNivel = [];
    for (var l = 0; l <= L; l++) S.errNivel[l] = 0;
    S.raiz = nodo(L, 0, 0);
  }
  function clave(L, x, y) { return L + '/' + x + '/' + y; }
  function nodo(L, x, y) {
    var k = clave(L, x, y);
    if (S.nodos[k]) return S.nodos[k];
    var paso = 1 << L, i0 = x * N * paso, j0 = y * N * paso;
    if (i0 >= S.ancho || j0 >= S.alto) return null;
    var n = { L: L, x: x, y: y, i0: i0, j0: j0, paso: paso, hijos: null, vbo: null, usado: 0, err: 0, min: 0, max: 0, mar: true };
    if (L === 0) {
      var mn = 1e9, mx = -1e9;
      for (var j = 0; j <= N; j++) for (var i = 0; i <= N; i++) {
        var h = hCelda(i0 + i, j0 + j);
        if (h < mn) mn = h; if (h > mx) mx = h;
      }
      n.min = mn; n.max = mx; n.mar = mx <= 0; n.err = 0;
    } else {
      n.hijos = [];
      var mn2 = 1e9, mx2 = -1e9, e = 0, mar = true;
      for (var b = 0; b < 2; b++) for (var a = 0; a < 2; a++) {
        var hj = nodo(L - 1, 2 * x + a, 2 * y + b);
        if (!hj) continue;
        n.hijos.push(hj);
        if (hj.min < mn2) mn2 = hj.min; if (hj.max > mx2) mx2 = hj.max;
        if (hj.err > e) e = hj.err;
        if (!hj.mar) mar = false;
      }
      n.min = mn2; n.max = mx2; n.mar = mar;
      /* cuanto se aparta la malla de los hijos de la de este nivel */
      if (!mar) {
        var dev = 0, ps = paso, ph = paso / 2;
        for (var jj = 0; jj <= 2 * N; jj++) {
          var jc = j0 + jj * ph;
          if (jc >= S.alto + ps) break;
          var vj = (jj * ph) / ps, j1 = Math.floor(vj), fv = vj - j1;
          for (var ii = 0; ii <= 2 * N; ii++) {
            if ((ii & 1) === 0 && (jj & 1) === 0) continue;
            var ic = i0 + ii * ph;
            if (ic >= S.ancho + ps) break;
            var ui = (ii * ph) / ps, i1 = Math.floor(ui), fu = ui - i1;
            var A = hCelda(i0 + i1 * ps, j0 + j1 * ps), B = hCelda(i0 + (i1 + 1) * ps, j0 + j1 * ps);
            var C = hCelda(i0 + i1 * ps, j0 + (j1 + 1) * ps), D = hCelda(i0 + (i1 + 1) * ps, j0 + (j1 + 1) * ps);
            var aprox = (A * (1 - fu) + B * fu) * (1 - fv) + (C * (1 - fu) + D * fu) * fv;
            var d = Math.abs(hCelda(ic, jc) - aprox);
            if (d > dev) dev = d;
          }
        }
        n.err = e + dev;
      } else n.err = 0;
    }
    if (n.err > S.errNivel[L]) S.errNivel[L] = n.err;
    S.nodos[k] = n;
    return n;
  }

  /* ───────────────────────── WebGL ───────────────────────── */
  var VS_TERRENO = [
    'attribute vec3 aPos;',
    'uniform mat4 uVP;',
    'uniform float uExag;',
    'uniform vec4 uMalla;',
    'varying vec2 vUv;',
    'varying vec3 vP;',
    'void main() {',
    '  float z = aPos.z > 0.0 ? aPos.z * uExag : aPos.z;',
    '  vP = vec3(aPos.xy, z);',
    '  vUv = vec2((aPos.x + uMalla.x) * uMalla.z, (uMalla.y - aPos.y) * uMalla.w);',
    '  gl_Position = uVP * vec4(vP, 1.0);',
    '}'].join('\n');

  var CABECERA_FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif'].join('\n');

  var FS_TERRENO = CABECERA_FS + '\n' + [
    'uniform sampler2D uRel;',      // r, g: pendiente; b: cielo visible; a: distancia a la costa
    'uniform sampler2D uDrape;',
    'uniform sampler2D uDrapeDet;',
    'uniform vec4 uDet;',
    'uniform sampler2D uHipso;',
    'uniform sampler2D uSombra;', 'uniform float uSombraOn;',
    'uniform vec3 uL1;', 'uniform vec3 uL2;', 'uniform vec3 uL3;', 'uniform vec3 uPesos;',
    'uniform vec3 uColLuz;', 'uniform vec3 uColCielo;', 'uniform vec3 uColBruma;',
    'uniform vec3 uOjo;',
    'uniform float uExag;', 'uniform float uBruma;', 'uniform float uBrumaIni;', 'uniform float uCostaEsc;', 'uniform float uDrapeOn;', 'uniform float uAoFuerza;',
    'varying vec2 vUv;',
    'varying vec3 vP;',
    'void main() {',
    '  vec4 r = texture2D(uRel, vUv);',
    '  float costa = (r.a * 255.0 - 128.0) * uCostaEsc;',
    '  if (costa < 0.0) discard;',
    '  vec2 t = r.rg * 2.0 - 1.0;',
    '  vec2 g = t / max(1.0 - abs(t), 0.02);',
    '  vec3 n = normalize(vec3(-g.x * uExag, -g.y * uExag, 1.0));',
    '  float h = max(vP.z, 0.0) / uExag;',
    '  vec3 base = texture2D(uHipso, vec2(clamp(h / 3800.0, 0.0, 1.0), 0.5)).rgb;',
    '  float roca = smoothstep(0.30, 0.62, 1.0 - n.z);',
    '  base = mix(base, base * vec3(0.86, 0.82, 0.80), roca * 0.65);',
    '  vec4 d = texture2D(uDrape, vUv);',
    '  vec2 du = (vP.xy - uDet.xy) * uDet.z;',
    '  if (uDet.w > 0.5 && du.x > 0.0 && du.x < 1.0 && du.y > 0.0 && du.y < 1.0) {',
    '    vec4 dd = texture2D(uDrapeDet, vec2(du.x, 1.0 - du.y));',
    '    float borde = smoothstep(0.0, 0.06, min(min(du.x, 1.0 - du.x), min(du.y, 1.0 - du.y)));',
    '    d = mix(d, dd, borde);',
    '  }',
    '  base = mix(base, d.rgb, d.a * uDrapeOn);',
    '  float sombra = uSombraOn > 0.5 ? texture2D(uSombra, vUv).r : 1.0;',
    '  float luz = uPesos.x * max(dot(n, uL1), 0.0) * sombra + uPesos.y * max(dot(n, uL2), 0.0) + uPesos.z * max(dot(n, uL3), 0.0);',
    '  float ao = mix(1.0, r.b, uAoFuerza);',
    '  float cielo = (0.58 + 0.42 * n.z) * ao;',
    '  vec3 col = base * (uColLuz * luz * mix(1.0, ao, 0.4) + uColCielo * cielo);',
    '  col = mix(col, col * 1.08 + 0.03, 1.0 - smoothstep(0.0, 25.0, costa));',
    '  float f = 1.0 - exp(-max(length(vP - uOjo) - uBrumaIni, 0.0) * uBruma);',
    '  gl_FragColor = vec4(mix(col, uColBruma, f), 1.0);',
    '}'].join('\n');

  var VS_MAR = [
    'attribute vec2 aXY;',
    'uniform mat4 uVP;',
    'varying vec3 vP;',
    'void main() { vP = vec3(aXY, 0.0); gl_Position = uVP * vec4(vP, 1.0); }'].join('\n');

  var FS_MAR = CABECERA_FS + '\n' + [
    'uniform sampler2D uRel;',
    'uniform sampler2D uSombra;', 'uniform float uSombraOn;',
    'uniform vec4 uMalla;',
    'uniform vec3 uOjo;', 'uniform vec3 uSol;', 'uniform vec3 uColLuz;', 'uniform vec3 uColBruma;',
    'uniform vec3 uHondo;', 'uniform vec3 uOrilla;', 'uniform vec3 uReflejo;',
    'uniform float uBruma;', 'uniform float uBrumaIni;', 'uniform float uCostaEsc;', 'uniform float uPx;', 'uniform float uBrillo;',
    'varying vec3 vP;',
    'void main() {',
    '  vec2 uv = vec2((vP.x + uMalla.x) * uMalla.z, (uMalla.y - vP.y) * uMalla.w);',
    '  float costa = -4000.0, sombra = 1.0;',
    '  if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {',
    '    costa = (texture2D(uRel, uv).a * 255.0 - 128.0) * uCostaEsc;',
    '    if (uSombraOn > 0.5) sombra = texture2D(uSombra, uv).r;',
    '  }',
    '  if (costa > 0.0) discard;',
    '  float dc = -costa;',
    '  float dist = length(vP - uOjo);',
    '  vec3 col = mix(uOrilla, uHondo, smoothstep(0.0, 500.0, dc));',
    '  float px = uPx * dist;',
    '  float espuma = (1.0 - smoothstep(0.0, max(px * 1.5, 4.0), dc)) * (1.0 - smoothstep(18.0, 70.0, px));',
    '  col = mix(col, vec3(0.94, 0.97, 0.98), espuma * 0.8);',
    '  vec3 v = normalize(uOjo - vP);',
    '  float fres = pow(1.0 - max(v.z, 0.0), 4.0);',
    '  col = mix(col, uReflejo, 0.06 + 0.5 * fres);',
    '  vec3 rf = reflect(-v, vec3(0.0, 0.0, 1.0));',
    '  col *= mix(0.62, 1.0, sombra);',
    '  col += uColLuz * pow(max(dot(rf, uSol), 0.0), 220.0) * uBrillo * sombra;',
    '  float f = 1.0 - exp(-max(dist - uBrumaIni, 0.0) * uBruma);',
    '  gl_FragColor = vec4(mix(col, uColBruma, f), 1.0);',
    '}'].join('\n');

  /* Las sombras que proyecta el relieve con el sol (o la luna) de verdad: un
     pase que, por cada celda, avanza hacia el sol por la textura de alturas y
     mira si algo la tapa. Penumbra suave, mas ancha cuanto mas lejos esta lo
     que tapa. Solo con WebGL 2 (alturas en coma flotante); con WebGL 1 no
     hay sombras proyectadas y el resto se ve igual. Se recalcula al cambiar
     la luz, no en cada cuadro. */
  var VS_SOMBRA = ['#version 300 es', 'in vec2 aXY;', 'out vec2 vUv;',
    /* sin voltear: la fila 0 del framebuffer es la v = 0 de la textura, igual
       que la fila 0 de las alturas (el norte) */
    'void main() { vUv = aXY * 0.5 + 0.5; gl_Position = vec4(aXY, 0.0, 1.0); }'].join('\n');
  var FS_SOMBRA = ['#version 300 es', 'precision highp float;',
    'uniform sampler2D uH;', 'uniform vec2 uDir;', 'uniform float uSube;', 'uniform float uCelda;', 'uniform float uExag;', 'uniform float uTecho;',
    'in vec2 vUv;', 'out vec4 color;',
    'void main() {',
    '  float h0 = max(texture(uH, vUv).r, 0.0) * uExag;',
    '  float z = h0 + 3.0, luz = 1.0, t = 0.0;',
    '  vec2 uv = vUv;',
    '  for (int i = 1; i < 300; i++) {',
    '    float paso = 1.0 + float(i) * 0.03;',
    '    uv += uDir * paso; z += uSube * paso; t += paso * uCelda;',
    '    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 || z > uTecho) break;',
    '    float h = max(texture(uH, uv).r, 0.0) * uExag;',
    '    luz = min(luz, clamp(0.5 + (z - h) / (t * 0.02 + 8.0), 0.0, 1.0));',
    '    if (luz <= 0.0) break;',
    '  }',
    '  color = vec4(luz, luz, luz, 1.0);',
    '}'].join('\n');

  var VS_CIELO = [
    'attribute vec2 aXY;',
    'varying vec2 vXY;',
    'void main() { vXY = aXY; gl_Position = vec4(aXY, 0.0, 1.0); }'].join('\n');

  var FS_CIELO = CABECERA_FS + '\n' + [
    'uniform mat4 uVPinv;',
    'uniform vec3 uHorizonte;', 'uniform vec3 uCenit;', 'uniform vec3 uSol;', 'uniform vec3 uColLuz;',
    'uniform float uSolVisible;',
    'varying vec2 vXY;',
    'void main() {',
    '  vec4 a = uVPinv * vec4(vXY, -1.0, 1.0);',
    '  vec4 b = uVPinv * vec4(vXY, 1.0, 1.0);',
    '  vec3 d = normalize(b.xyz / b.w - a.xyz / a.w);',
    '  float e = d.z;',
    '  vec3 col = mix(uHorizonte, uCenit, pow(clamp(e, 0.0, 1.0), 0.5));',
    '  float s = max(dot(d, uSol), 0.0);',
    '  col += uColLuz * (pow(s, 900.0) * 1.6 + pow(s, 14.0) * 0.16) * uSolVisible;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'].join('\n');

  function compilar(gl, vs, fs) {
    function sh(tipo, src) {
      var s = gl.createShader(tipo);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('programa: ' + gl.getProgramInfoLog(p));
    var u = {}, nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < nu; i++) { var inf = gl.getActiveUniform(p, i); u[inf.name] = gl.getUniformLocation(p, inf.name); }
    return { p: p, u: u, a: {} };
  }

  function iniciarGL() {
    var cv = S.cv, op = { antialias: true, alpha: false, depth: true, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' };
    var gl = null;
    try { gl = cv.getContext('webgl2', op); S.gl2 = !!gl; } catch (e) { gl = null; }
    if (!gl) { try { gl = cv.getContext('webgl', op) || cv.getContext('experimental-webgl', op); } catch (e2) { gl = null; } S.gl2 = false; }
    if (!gl) return false;
    S.gl = gl;
    S.prog.terreno = compilar(gl, VS_TERRENO, FS_TERRENO);
    S.prog.terreno.a.pos = gl.getAttribLocation(S.prog.terreno.p, 'aPos');
    S.prog.mar = compilar(gl, VS_MAR, FS_MAR);
    S.prog.mar.a.xy = gl.getAttribLocation(S.prog.mar.p, 'aXY');
    S.prog.cielo = compilar(gl, VS_CIELO, FS_CIELO);
    S.prog.cielo.a.xy = gl.getAttribLocation(S.prog.cielo.p, 'aXY');
    /* indices de una tesela, iguales para todas: 65 x 65 vertices y los faldones */
    var V = N + 1, idx = [];
    function q(a, b, c, d) { idx.push(a, c, b, b, c, d); }
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) q(j * V + i, j * V + i + 1, (j + 1) * V + i, (j + 1) * V + i + 1);
    var base = V * V;
    for (var e = 0; e < 4; e++) for (var k = 0; k < N; k++) {
      var a0 = borde(e, k), a1 = borde(e, k + 1), s0 = base + e * V + k, s1 = s0 + 1;
      q(a0, a1, s0, s1);
    }
    S.nIdx = idx.length;
    S.buf.idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, S.buf.idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    /* el mar: un cuadrado de 800 km; el cielo: un triangulo que tapa la pantalla */
    S.buf.mar = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, S.buf.mar);
    var M = 400000;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-M, -M, M, -M, -M, M, M, M]), gl.STATIC_DRAW);
    S.buf.cielo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, S.buf.cielo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    subirRelieve();
    subirPaleta();
    subirDrapeVacio();
    prepararSombras();
    return true;
  }
  /* despues de perder la GPU: lo suyo (programas, texturas, buffers y cada
     tesela) se rehace; el relieve, la malla y los rotulos siguen en memoria */
  function rehacerGL() {
    S.perdido = false;
    if (S.nodos) for (var k in S.nodos) S.nodos[k].vbo = null;
    S.vbos = 0; S.det = null; S.drape = false; S.sombra = null;
    if (!iniciarGL()) { S.sinWebGL = true; estadoTxt(tx('isla3dSinWebGL')); return false; }
    return true;
  }
  function prepararSombras() {
    var gl = S.gl;
    S.sombra = null;
    if (!S.gl2) return;
    try {
      var pr = compilar(gl, VS_SOMBRA, FS_SOMBRA);
      pr.a.xy = gl.getAttribLocation(pr.p, 'aXY');
      var th = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, th);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, S.ancho, S.alto, 0, gl.RED, gl.FLOAT, S.H);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      /* la mascara, a media resolucion (120 m): cuatro veces menos trabajo en
         la GPU al cambiar la luz, y se lee con filtro lineal, suave */
      var w2 = Math.ceil(S.ancho / 2), h2 = Math.ceil(S.alto / 2);
      var tm = textura(null, w2, h2, false);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tm, 0);
      var bien = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (!bien) return;
      S.sombra = { prog: pr, alturas: th, mascara: tm, fb: fb, w: w2, h: h2, dir: null, lista: false };
    } catch (e) { S.sombra = null; }
  }
  /* la mascara para la luz que viene de dir (vector hacia el sol o la luna) */
  function calcularSombras(dir) {
    var Sm = S.sombra, gl = S.gl;
    if (!Sm || dir[2] <= 0.005) return false;
    var hz = Math.hypot(dir[0], dir[1]) || 1e-6, tanAlt = dir[2] / hz;
    gl.bindFramebuffer(gl.FRAMEBUFFER, Sm.fb);
    gl.viewport(0, 0, Sm.w, Sm.h);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(Sm.prog.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, Sm.alturas); gl.uniform1i(Sm.prog.u.uH, 0);
    gl.uniform2f(Sm.prog.u.uDir, dir[0] / hz / S.ancho, -dir[1] / hz / S.alto);
    gl.uniform1f(Sm.prog.u.uSube, S.c * tanAlt);
    gl.uniform1f(Sm.prog.u.uCelda, S.c);
    gl.uniform1f(Sm.prog.u.uExag, S.exag);
    gl.uniform1f(Sm.prog.u.uTecho, (S.meta.altura.max_m + 10) * S.exag);
    gl.bindBuffer(gl.ARRAY_BUFFER, S.buf.cielo);
    gl.enableVertexAttribArray(Sm.prog.a.xy);
    gl.vertexAttribPointer(Sm.prog.a.xy, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(Sm.prog.a.xy);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.enable(gl.DEPTH_TEST);
    Sm.dir = dir.slice(); Sm.lista = true;
    return true;
  }
  /* el vertice k del borde e (0 norte, 1 sur, 2 oeste, 3 este) */
  function borde(e, k) {
    var V = N + 1;
    if (e === 0) return k;
    if (e === 1) return N * V + k;
    if (e === 2) return k * V;
    return k * V + N;
  }

  function textura(datos, w, h, mip) {
    var gl = S.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    if (datos && datos.width !== undefined && !(datos instanceof Uint8Array)) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, datos);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, datos);
    var pot = (w & (w - 1)) === 0 && (h & (h - 1)) === 0;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (mip && (S.gl2 || pot)) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      var an = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
      if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    } else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  }

  /* pendiente (codificada g/(1+|g|)), cielo visible y costa, en una textura */
  function subirRelieve() {
    var w = S.ancho, h = S.alto, d = new Uint8Array(w * h * 4), c2 = 2 * S.c;
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var q = j * w + i, p = q * 4;
      var gx = (hCelda(i + 1, j) - hCelda(i - 1, j)) / c2;
      var gy = (hCelda(i, j - 1) - hCelda(i, j + 1)) / c2;
      d[p] = Math.round((gx / (1 + Math.abs(gx)) * 0.5 + 0.5) * 255);
      d[p + 1] = Math.round((gy / (1 + Math.abs(gy)) * 0.5 + 0.5) * 255);
      d[p + 2] = S.ao[q];
      d[p + 3] = S.costa[q];
    }
    S.tex.rel = textura(d, w, h, true);
  }

  /* Los colores por altura cuando el mapa no dice que hay en el suelo: costa
     seca y clara, medianias verdes, la corona del pinar, las Cañadas pardas y
     la cumbre gris. Es la convencion de los mapas de relieve (tintas
     hipsometricas), no una foto: donde el mapa de OSM tiene uso del suelo,
     manda el mapa. */
  var PALETA = [
    [0, [0.87, 0.84, 0.71]], [150, [0.84, 0.82, 0.66]], [450, [0.76, 0.78, 0.60]],
    [900, [0.64, 0.72, 0.52]], [1400, [0.52, 0.63, 0.44]], [1900, [0.56, 0.60, 0.45]],
    [2150, [0.71, 0.64, 0.52]], [2600, [0.67, 0.56, 0.47]], [3100, [0.62, 0.55, 0.51]],
    [3500, [0.78, 0.75, 0.72]], [3800, [0.90, 0.89, 0.87]]];
  function subirPaleta() {
    var d = new Uint8Array(256 * 4);
    for (var i = 0; i < 256; i++) {
      var h = i / 255 * 3800, a = PALETA[0], b = PALETA[PALETA.length - 1];
      for (var k = 0; k < PALETA.length - 1; k++) if (h >= PALETA[k][0] && h <= PALETA[k + 1][0]) { a = PALETA[k]; b = PALETA[k + 1]; break; }
      var f = b[0] > a[0] ? (h - a[0]) / (b[0] - a[0]) : 0;
      for (var c = 0; c < 3; c++) d[i * 4 + c] = Math.round((a[1][c] * (1 - f) + b[1][c] * f) * 255);
      d[i * 4 + 3] = 255;
    }
    S.tex.hipso = textura(d, 256, 1, false);
  }
  function subirDrapeVacio() {
    S.tex.drape = textura(new Uint8Array(4), 1, 1, false);
    S.drape = false;
  }

  /* ── la malla de una tesela: 65 x 65 vertices y cuatro faldones ── */
  function construirVBO(n) {
    var V = N + 1, f = new Float32Array((V * V + 4 * V) * 3), p = 0, ps = n.paso;
    var falda = 60 + (S.errNivel[Math.min(n.L + 2, S.Lmax)] || 0) * 1.5;
    function vert(ii, jj, baja) {
      var i = n.i0 + ii * ps, j = n.j0 + jj * ps;
      var h = hCelda(i, j);
      f[p++] = (i + 0.5) * S.c - S.Wm / 2;
      f[p++] = S.Hm / 2 - (j + 0.5) * S.c;
      f[p++] = (h > 0 ? h : MAR_Z) - (baja ? falda : 0);
    }
    for (var j = 0; j < V; j++) for (var i = 0; i < V; i++) vert(i, j, false);
    for (var e = 0; e < 4; e++) for (var k = 0; k < V; k++) {
      if (e === 0) vert(k, 0, true);
      else if (e === 1) vert(k, N, true);
      else if (e === 2) vert(0, k, true);
      else vert(N, k, true);
    }
    var gl = S.gl, b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW);
    n.vbo = b;
    S.vbos = (S.vbos || 0) + 1;
  }
  function liberarVBOs(todos) {
    if (!S.nodos || !S.gl) return;
    var lista = [];
    for (var k in S.nodos) if (S.nodos[k].vbo) lista.push(S.nodos[k]);
    if (!todos && lista.length <= 360) return;
    lista.sort(function (a, b) { return a.usado - b.usado; });
    var quitar = todos ? lista.length : lista.length - 300;
    for (var i = 0; i < quitar; i++) { S.gl.deleteBuffer(lista[i].vbo); lista[i].vbo = null; S.vbos--; }
  }

  /* ───────────────────────── camara ───────────────────────── */
  function base3() {
    var c = S.cam, sr = Math.sin(c.rumbo), cr = Math.cos(c.rumbo), si = Math.sin(c.incl), ci = Math.cos(c.incl);
    var f = [sr * si, cr * si, -ci];            // hacia donde mira
    var r = [cr, -sr, 0];                        // derecha
    var u = [sr * ci, cr * ci, si];              // arriba en pantalla
    return { f: f, r: r, u: u };
  }
  function blancoZ() { return alturaEn(S.cam.tx, S.cam.ty) * S.exag; }
  /* La camara gira alrededor de un punto a la altura del suelo del blanco,
     pero esa altura (S.camZ) no se mueve mientras hay un dedo en la
     pantalla: si siguiera al relieve, la vista subiria y bajaria al
     arrastrar y el sitio agarrado se iria de debajo del dedo. Al soltar,
     se acerca a la del suelo en unos pocos cuadros. */
  function zCamara() { if (S.camZ === null || S.camZ === undefined) S.camZ = blancoZ(); return S.camZ; }
  /* Al acabar un gesto, el punto de giro pasa a ser el del suelo que hay en
     el centro de la pantalla, con el ojo y la mirada tal cual: la vista no se
     mueve ni un pixel, pero el siguiente gesto gira alrededor del relieve que
     se ve y no de un punto en el aire. */
  function reanclar() {
    if (!S.H || !S.mvp) return;
    matrices();
    var r = rayo(S.w / 2, S.h / 2), g = enSuelo(S.w / 2, S.h / 2);
    if (!g) return;
    var d = Math.hypot(g[0] - S.ojo[0], g[1] - S.ojo[1], g[2] - S.ojo[2]);
    if (!(d > 1) || d > 400000 || r.d[2] > -0.02) return;
    S.cam.tx = g[0]; S.cam.ty = g[1]; S.cam.d = d; S.camZ = g[2];
  }
  function matrices() {
    var c = S.cam, b = base3(), tz = zCamara();
    var ojo = [c.tx - b.f[0] * c.d, c.ty - b.f[1] * c.d, tz - b.f[2] * c.d];
    S.ojo = ojo;
    var v = new Float32Array(16);
    v[0] = b.r[0]; v[4] = b.r[1]; v[8] = b.r[2];
    v[1] = b.u[0]; v[5] = b.u[1]; v[9] = b.u[2];
    v[2] = -b.f[0]; v[6] = -b.f[1]; v[10] = -b.f[2];
    v[12] = -(b.r[0] * ojo[0] + b.r[1] * ojo[1] + b.r[2] * ojo[2]);
    v[13] = -(b.u[0] * ojo[0] + b.u[1] * ojo[1] + b.u[2] * ojo[2]);
    v[14] = (b.f[0] * ojo[0] + b.f[1] * ojo[1] + b.f[2] * ojo[2]);
    v[15] = 1;
    var suelo = alturaEn(ojo[0], ojo[1]) * S.exag;
    var sobre = Math.max(ojo[2] - Math.max(suelo, 0), 10);
    var cerca = Math.max(2, Math.min(sobre * 0.35, c.d * 0.3));
    var lejos = Math.max(c.d * 6, 260000);
    var p = m4persp(FOV, S.w / Math.max(S.h, 1), cerca, lejos);
    S.mvp = m4mul(p, v);
    S.vpInv = m4inv(S.mvp);
    S.planos = planos(S.mvp);
    S.pxRad = 2 * Math.tan(FOV / 2) / (S.h * S.dpr);     // metros por pixel a 1 m de distancia
    S.K = (S.h * S.dpr) / (2 * Math.tan(FOV / 2));
  }
  function planos(m) {
    var P = [];
    function fila(i) { return [m[i], m[4 + i], m[8 + i], m[12 + i]]; }
    var r0 = fila(0), r1 = fila(1), r2 = fila(2), r3 = fila(3);
    [[1, r0], [-1, r0], [1, r1], [-1, r1], [1, r2], [-1, r2]].forEach(function (x) {
      var s = x[0], r = x[1], p = [r3[0] + s * r[0], r3[1] + s * r[1], r3[2] + s * r[2], r3[3] + s * r[3]];
      var l = Math.hypot(p[0], p[1], p[2]);
      P.push([p[0] / l, p[1] / l, p[2] / l, p[3] / l]);
    });
    return P;
  }
  function cajaNodo(n) {
    var x0 = (n.i0 + 0.5) * S.c - S.Wm / 2, x1 = (n.i0 + N * n.paso + 0.5) * S.c - S.Wm / 2;
    var y1 = S.Hm / 2 - (n.j0 + 0.5) * S.c, y0 = S.Hm / 2 - (n.j0 + N * n.paso + 0.5) * S.c;
    return [x0, y0, MAR_Z - 300, x1, y1, Math.max(n.max, 0) * S.exag + 5];
  }
  function enVista(b) {
    for (var i = 0; i < 6; i++) {
      var p = S.planos[i];
      var x = p[0] > 0 ? b[3] : b[0], y = p[1] > 0 ? b[4] : b[1], z = p[2] > 0 ? b[5] : b[2];
      if (p[0] * x + p[1] * y + p[2] * z + p[3] < 0) return false;
    }
    return true;
  }
  function distCaja(b, o) {
    var dx = Math.max(b[0] - o[0], 0, o[0] - b[3]), dy = Math.max(b[1] - o[1], 0, o[1] - b[4]), dz = Math.max(b[2] - o[2], 0, o[2] - b[5]);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /* Que teselas se pintan y a que nivel: se baja mientras el error de la malla
     se vea de mas de ~2 pixeles o la celda ocupe mas de 28 en pantalla. */
  function seleccionar() {
    /* el umbral sube solo si el cuadro anterior tuvo demasiadas teselas
       (mirando al horizonte) y baja cuando sobran */
    var f = S.lodF || 1;
    if (S.ultimosNodos > 150) f = Math.min(f * 1.25, 4); else if (S.ultimosNodos < 80) f = Math.max(f / 1.1, 1);
    S.lodF = f;
    var lista = [], tope = 3.5 * f, celdaTope = 36 * f, construidas = 0;
    function ir(n) {
      if (!n || n.mar) return;
      var b = cajaNodo(n);
      if (!enVista(b)) return;
      var d = Math.max(distCaja(b, S.ojo), 1);
      var bajar = n.L > 0 && (n.err * S.exag * S.K / d > tope || (S.c * n.paso) * S.K / d > celdaTope);
      if (bajar) {
        var listos = true;
        for (var i = 0; i < n.hijos.length; i++) {
          var h = n.hijos[i];
          if (!h.mar && !h.vbo && enVista(cajaNodo(h))) {
            if (construidas < 48) { construirVBO(h); construidas++; } else listos = false;
          }
        }
        if (listos) { for (var k = 0; k < n.hijos.length; k++) ir(n.hijos[k]); return; }
        pedirCuadro();
      }
      if (!n.vbo) { construirVBO(n); construidas++; }
      n.usado = S.cuadros;
      lista.push(n);
    }
    ir(S.raiz);
    return lista;
  }

  /* ───────────────────────── luz ───────────────────────── */
  function dirDe(az, alt) {
    var a = az * Math.PI / 180, e = alt * Math.PI / 180;
    return [Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), Math.sin(e)];
  }
  /* La luz de los mapas de relieve: del noroeste (315°), con dos de relleno
     del oeste y del norte, como el sombreado multidireccional de los mapas
     suizos. Con el sol, una sola luz donde esta el sol de verdad. */
  function luces() {
    var L = { l1: dirDe(315, 45), l2: dirDe(270, 55), l3: dirDe(0, 55), pesos: [0.62, 0.2, 0.18],
      colLuz: [1.0, 0.97, 0.92], colCielo: [0.36, 0.40, 0.46], bruma: [0.80, 0.86, 0.91],
      horizonte: [0.82, 0.88, 0.93], cenit: [0.42, 0.62, 0.84], hondo: [0.12, 0.31, 0.47], orilla: [0.30, 0.55, 0.66],
      reflejo: [0.70, 0.80, 0.90], sol: dirDe(315, 45), solVisible: 0, brillo: 0, aviso: '', proyecta: false };
    if (S.luz !== 'sol') return L;
    var sol = posicionSol(), luna = sol ? posicionLuna() : null;
    if (!sol) return L;
    var alt = sol.alt;
    if (alt > -2) {
      var calor = 1 - Math.min(Math.max((alt - 2) / 18, 0), 1);        // 1 al amanecer o atardecer
      var dia = Math.min(Math.max((alt + 2) / 10, 0), 1);
      L.l1 = dirDe(sol.az, Math.max(alt, 1.5)); L.sol = dirDe(sol.az, alt);
      L.pesos = [1.12 * dia, 0, 0];
      L.colLuz = [1.0, 0.94 - 0.22 * calor, 0.86 - 0.42 * calor];
      L.colCielo = [0.30 + 0.06 * calor, 0.36, 0.48 - 0.06 * calor];
      L.horizonte = [0.84 + 0.12 * calor, 0.86 - 0.08 * calor, 0.90 - 0.30 * calor];
      L.cenit = [0.40 - 0.10 * calor, 0.60 - 0.18 * calor, 0.85 - 0.25 * calor];
      L.bruma = [0.80 + 0.12 * calor, 0.84 - 0.08 * calor, 0.89 - 0.28 * calor];
      L.solVisible = 1; L.brillo = 0.7 * dia; L.proyecta = true;
      return L;
    }
    /* de noche: la luna si esta sobre el horizonte; si no, el relieve con
       la luz de mapa muy baja, para que se siga leyendo */
    L.horizonte = [0.10, 0.14, 0.22]; L.cenit = [0.02, 0.04, 0.09]; L.bruma = [0.09, 0.12, 0.19];
    L.hondo = [0.03, 0.08, 0.14]; L.orilla = [0.06, 0.13, 0.20]; L.reflejo = [0.12, 0.16, 0.26];
    L.colCielo = [0.05, 0.07, 0.12];
    if (luna && luna.alt > 0) {
      var k = 0.25 + 0.55 * luna.fase;
      L.l1 = dirDe(luna.az, Math.max(luna.alt, 3)); L.sol = dirDe(luna.az, luna.alt);
      L.pesos = [k, 0, 0]; L.colLuz = [0.62, 0.72, 0.95]; L.solVisible = 0.25; L.brillo = 0.25 * luna.fase;
      L.aviso = T('Noche'); L.proyecta = true;
    } else {
      L.pesos = [0.22, 0.07, 0.06]; L.colLuz = [0.55, 0.62, 0.85];
      L.aviso = T('NocheSinLuna');
    }
    return L;
  }
  function observador() {
    var ll = aLonLat(S.cam.tx, S.cam.ty);
    return new Astronomy.Observer(ll[1], ll[0], Math.max(alturaEn(S.cam.tx, S.cam.ty), 0));
  }
  function horizontal(cuerpo) {
    var ahora = new Date(), o = observador();
    var eq = Astronomy.Equator(cuerpo, ahora, o, true, true);
    var h = Astronomy.Horizon(ahora, o, eq.ra, eq.dec, 'normal');
    return { az: h.azimuth, alt: h.altitude };
  }
  function posicionSol() {
    if (typeof Astronomy === 'undefined') return null;
    try { return horizontal(Astronomy.Body.Sun); } catch (e) { return null; }
  }
  function posicionLuna() {
    try {
      var p = horizontal(Astronomy.Body.Moon);
      p.fase = Astronomy.Illumination(Astronomy.Body.Moon, new Date()).phase_fraction;
      return p;
    } catch (e) { return null; }
  }
  function cargarAstronomia() {
    if (typeof Astronomy !== 'undefined') return Promise.resolve();
    return new Promise(function (ok, mal) {
      var s = document.createElement('script');
      s.src = './vendor/astronomy.browser.min.js';
      s.onload = function () { if (typeof Astronomy !== 'undefined') ok(); else mal(new Error('astronomia')); };
      s.onerror = function () { s.remove(); mal(new Error('astronomia')); };
      document.head.appendChild(s);
    });
  }

  /* ───────────────────────── dibujar ───────────────────────── */
  function pedirCuadro() {
    if (S.pedido || !S.abierto) return;
    S.pedido = true;
    requestAnimationFrame(cuadro);
  }
  function cuadro(t) {
    S.pedido = false;
    if (!S.abierto || !S.gl || S.perdido) return;
    if (S.anim) animar(t);
    if (S.inercia) inercia(t);
    S.cuadros++;
    medir();
    matrices();
    var gl = S.gl, L = luces();
    S.luces = L;
    /* sombras proyectadas solo con una luz de verdad (el sol o la luna), y
       se rehacen cuando se ha movido mas de ~0,4 grados */
    var conSombra = false;
    if (S.sombra && L.proyecta && L.pesos[0] > 0 && L.l1[2] > 0.005) {
      var Sd = S.sombra.dir;
      if (!S.sombra.lista || !Sd || Sd[0] * L.l1[0] + Sd[1] * L.l1[1] + Sd[2] * L.l1[2] < 0.99998) calcularSombras(L.l1);
      conSombra = S.sombra.lista;
    }
    S.conSombra = conSombra;
    gl.viewport(0, 0, S.cv.width, S.cv.height);
    gl.clearColor(L.horizonte[0], L.horizonte[1], L.horizonte[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* el cielo */
    gl.disable(gl.DEPTH_TEST);
    var pc = S.prog.cielo;
    gl.useProgram(pc.p);
    gl.uniformMatrix4fv(pc.u.uVPinv, false, S.vpInv);
    gl.uniform3fv(pc.u.uHorizonte, L.horizonte); gl.uniform3fv(pc.u.uCenit, L.cenit);
    gl.uniform3fv(pc.u.uSol, L.sol); gl.uniform3fv(pc.u.uColLuz, L.colLuz); gl.uniform1f(pc.u.uSolVisible, L.solVisible);
    gl.bindBuffer(gl.ARRAY_BUFFER, S.buf.cielo);
    gl.enableVertexAttribArray(pc.a.xy);
    gl.vertexAttribPointer(pc.a.xy, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(pc.a.xy);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    var malla = [S.Wm / 2, S.Hm / 2, 1 / S.Wm, 1 / S.Hm];
    /* la bruma empieza detras de lo que se mira: desde arriba no tapa nada y
       al inclinar aleja el fondo, como el aire de verdad */
    var bruma = 1 / (S.luz === 'sol' && L.aviso ? 45000 : 70000), brumaIni = S.cam.d * 0.85;
    /* el relieve */
    var pt = S.prog.terreno, lista = seleccionar();
    S.ultimosNodos = lista.length;
    gl.useProgram(pt.p);
    gl.uniformMatrix4fv(pt.u.uVP, false, S.mvp);
    gl.uniform1f(pt.u.uExag, S.exag);
    gl.uniform4fv(pt.u.uMalla, malla);
    gl.uniform3fv(pt.u.uL1, L.l1); gl.uniform3fv(pt.u.uL2, L.l2); gl.uniform3fv(pt.u.uL3, L.l3);
    gl.uniform3fv(pt.u.uPesos, L.pesos); gl.uniform3fv(pt.u.uColLuz, L.colLuz); gl.uniform3fv(pt.u.uColCielo, L.colCielo);
    gl.uniform3fv(pt.u.uColBruma, L.bruma); gl.uniform3fv(pt.u.uOjo, S.ojo);
    gl.uniform1f(pt.u.uBruma, bruma); gl.uniform1f(pt.u.uBrumaIni, brumaIni);
    gl.uniform1f(pt.u.uCostaEsc, S.meta.costa.metros_por_unidad);
    gl.uniform1f(pt.u.uDrapeOn, S.drape ? 1 : 0);
    gl.uniform1f(pt.u.uAoFuerza, 0.9);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, S.tex.rel); gl.uniform1i(pt.u.uRel, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, S.tex.drape); gl.uniform1i(pt.u.uDrape, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, S.tex.hipso); gl.uniform1i(pt.u.uHipso, 2);
    var D = S.det;
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, D && D.tex ? D.tex : S.tex.drape); gl.uniform1i(pt.u.uDrapeDet, 3);
    gl.uniform4fv(pt.u.uDet, D && D.tex ? [D.x0, D.y0, 1 / D.lado, 1] : [0, 0, 1, 0]);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, conSombra ? S.sombra.mascara : S.tex.hipso); gl.uniform1i(pt.u.uSombra, 4);
    gl.uniform1f(pt.u.uSombraOn, conSombra ? 1 : 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, S.buf.idx);
    gl.enableVertexAttribArray(pt.a.pos);
    for (var i = 0; i < lista.length; i++) {
      gl.bindBuffer(gl.ARRAY_BUFFER, lista[i].vbo);
      gl.vertexAttribPointer(pt.a.pos, 3, gl.FLOAT, false, 0, 0);
      gl.drawElements(gl.TRIANGLES, S.nIdx, gl.UNSIGNED_SHORT, 0);
    }
    gl.disableVertexAttribArray(pt.a.pos);
    /* el mar */
    var pm = S.prog.mar;
    gl.useProgram(pm.p);
    gl.uniformMatrix4fv(pm.u.uVP, false, S.mvp);
    gl.uniform4fv(pm.u.uMalla, malla);
    gl.uniform3fv(pm.u.uOjo, S.ojo); gl.uniform3fv(pm.u.uSol, L.sol); gl.uniform3fv(pm.u.uColLuz, L.colLuz);
    gl.uniform3fv(pm.u.uColBruma, L.bruma); gl.uniform3fv(pm.u.uHondo, L.hondo); gl.uniform3fv(pm.u.uOrilla, L.orilla);
    gl.uniform3fv(pm.u.uReflejo, L.reflejo);
    gl.uniform1f(pm.u.uBruma, bruma); gl.uniform1f(pm.u.uBrumaIni, brumaIni); gl.uniform1f(pm.u.uCostaEsc, S.meta.costa.metros_por_unidad);
    gl.uniform1f(pm.u.uPx, S.pxRad); gl.uniform1f(pm.u.uBrillo, L.brillo);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, S.tex.rel); gl.uniform1i(pm.u.uRel, 0);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, conSombra ? S.sombra.mascara : S.tex.hipso); gl.uniform1i(pm.u.uSombra, 4);
    gl.uniform1f(pm.u.uSombraOn, conSombra ? 1 : 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, S.buf.mar);
    gl.enableVertexAttribArray(pm.a.xy);
    gl.vertexAttribPointer(pm.a.xy, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disableVertexAttribArray(pm.a.xy);
    if (S.cuadros % 30 === 0) liberarVBOs(false);
    if (!S.anim && !S.inercia && G.n === 0) programarDetalle();
    pintarRotulos();
    pintarBrujula();
    avisoLuz(L.aviso);
    clearTimeout(S.relojT);
    if (S.luz === 'sol') S.relojT = setTimeout(pedirCuadro, 60000);
  }

  function medir() {
    var r = S.dom.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w !== S.w || h !== S.h || dpr !== S.dpr) {
      S.w = w; S.h = h; S.dpr = dpr;
      S.cv.width = Math.round(w * dpr); S.cv.height = Math.round(h * dpr);
      S.rot.width = Math.round(w * dpr); S.rot.height = Math.round(h * dpr);
    }
  }

  /* ───────────────────────── de la pantalla al suelo ───────────────────────── */
  function rayo(sx, sy) {
    var x = sx / S.w * 2 - 1, y = 1 - sy / S.h * 2;
    var a = mulPunto(S.vpInv, x, y, -1), b = mulPunto(S.vpInv, x, y, 1);
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]);
    return { o: S.ojo.slice(), d: [d[0] / l, d[1] / l, d[2] / l] };
  }
  function mulPunto(m, x, y, z) {
    var w = m[3] * x + m[7] * y + m[11] * z + m[15];
    return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, (m[2] * x + m[6] * y + m[10] * z + m[14]) / w];
  }
  /* el punto del plano horizontal z = zp que hay bajo (sx, sy) */
  function enPlano(sx, sy, zp) {
    var r = rayo(sx, sy);
    if (r.d[2] > -1e-4) return null;
    var t = (zp - r.o[2]) / r.d[2];
    if (t < 0 || t > 600000) return null;
    return [r.o[0] + r.d[0] * t, r.o[1] + r.d[1] * t, zp];
  }
  /* el punto del relieve bajo (sx, sy), avanzando por el rayo */
  function enSuelo(sx, sy) {
    var r = rayo(sx, sy), t = 0, ant = null;
    for (var k = 0; k < 400; k++) {
      var x = r.o[0] + r.d[0] * t, y = r.o[1] + r.d[1] * t, z = r.o[2] + r.d[2] * t;
      var s = Math.max(alturaEn(x, y) * S.exag, 0);
      if (z <= s) {
        if (!ant) return [x, y, s];
        /* refinar entre el paso anterior y este */
        var a = ant, b = t;
        for (var i = 0; i < 12; i++) {
          var m = (a + b) / 2, zm = r.o[2] + r.d[2] * m;
          if (zm <= Math.max(alturaEn(r.o[0] + r.d[0] * m, r.o[1] + r.d[1] * m) * S.exag, 0)) b = m; else a = m;
        }
        return [r.o[0] + r.d[0] * b, r.o[1] + r.d[1] * b, r.o[2] + r.d[2] * b];
      }
      ant = t;
      t += Math.max((z - s) * 0.5, 15);
      if (t > 400000) break;
    }
    return enPlano(sx, sy, 0);
  }
  function aPantalla(x, y, z) {
    var m = S.mvp, w = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (w <= 0.01) return null;
    return [((m[0] * x + m[4] * y + m[8] * z + m[12]) / w * 0.5 + 0.5) * S.w,
      (0.5 - (m[1] * x + m[5] * y + m[9] * z + m[13]) / w * 0.5) * S.h, w];
  }
  /* ¿se ve el punto desde el ojo o lo tapa el relieve? */
  function visible(x, y, z) {
    var o = S.ojo, dx = x - o[0], dy = y - o[1], dz = z - o[2], L = Math.hypot(dx, dy, dz);
    var pasos = Math.min(48, Math.max(12, Math.round(L / 1500)));
    for (var k = 1; k < pasos; k++) {
      var f = k / pasos, px = o[0] + dx * f, py = o[1] + dy * f, pz = o[2] + dz * f;
      if (alturaEn(px, py) * S.exag > pz + 8) return false;
    }
    return true;
  }

  /* ───────────────────────── limites y animaciones ───────────────────────── */
  function acotar() {
    var c = S.cam, mx = S.Wm / 2 + 6000, my = S.Hm / 2 + 6000;
    c.tx = Math.max(-mx, Math.min(mx, c.tx));
    c.ty = Math.max(-my, Math.min(my, c.ty));
    c.d = Math.max(350, Math.min(170000, c.d));
    c.incl = Math.max(0, Math.min(1.33, c.incl));
    c.rumbo = ((c.rumbo % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    /* el ojo nunca bajo el suelo: se endereza la camara lo que haga falta */
    for (var i = 0; i < 24; i++) {
      var b = base3(), tz = zCamara();
      var ox = c.tx - b.f[0] * c.d, oy = c.ty - b.f[1] * c.d, oz = tz - b.f[2] * c.d;
      if (oz > Math.max(alturaEn(ox, oy) * S.exag, 0) + 45) break;
      c.incl = Math.max(0, c.incl - 0.05);
      if (c.incl === 0) { c.d *= 1.1; }
    }
  }
  function animarA(dest, ms) {
    var c = S.cam;
    S.anim = { de: { tx: c.tx, ty: c.ty, d: c.d, rumbo: c.rumbo, incl: c.incl }, a: dest, t0: null, ms: ms || 600 };
    S.inercia = null;
    pedirCuadro();
  }
  function animar(t) {
    var A = S.anim, c = S.cam;
    if (A.t0 === null) A.t0 = t;
    var f = Math.min((t - A.t0) / A.ms, 1), e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    if (window.__tgoRM) e = f = 1;
    ['tx', 'ty', 'incl'].forEach(function (k) { if (A.a[k] !== undefined) c[k] = A.de[k] + (A.a[k] - A.de[k]) * e; });
    if (A.a.d !== undefined) c.d = Math.exp(Math.log(A.de.d) + (Math.log(A.a.d) - Math.log(A.de.d)) * e);
    if (A.a.rumbo !== undefined) {
      var dr = ((A.a.rumbo - A.de.rumbo + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
      c.rumbo = A.de.rumbo + dr * e;
    }
    acotar();
    if (f >= 1) { S.anim = null; if (!A.a.fija) reanclar(); } else pedirCuadro();
  }
  function inercia(t) {
    var I = S.inercia;
    if (I.t === null) I.t = t;
    var dt = Math.min(t - I.t, 50); I.t = t;
    S.cam.tx += I.vx * dt; S.cam.ty += I.vy * dt;
    var k = Math.pow(0.0025, dt / 1000);
    I.vx *= k; I.vy *= k;
    acotar();
    if (Math.hypot(I.vx, I.vy) * 1000 < S.cam.d * 0.02) { S.inercia = null; reanclar(); } else pedirCuadro();
  }

  /* ───────────────────────── gestos ───────────────────────── */
  var G = { ptr: {}, n: 0, modo: null, acum: 0, ult: null, toque: 0, toquePos: null, dosDedos: 0, movido: false, vel: [] };
  function pos(e) { var r = S.dom.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function dosPuntos() {
    var k = Object.keys(G.ptr);
    return [G.ptr[k[0]], G.ptr[k[1]]];
  }
  function alBajar(e) {
    if (e.target && e.target.closest && e.target.closest('.i3-btn')) return;
    e.preventDefault();
    try { S.cv.setPointerCapture(e.pointerId); } catch (x) {}
    G.ptr[e.pointerId] = pos(e);
    G.n = Object.keys(G.ptr).length;
    S.anim = null; S.inercia = null; G.vel = [];
    G.movido = false;
    if (G.n === 2) {
      G.modo = null; G.ult = dosPuntos(); G.ini = [G.ult[0].slice(), G.ult[1].slice()]; G.dosDedos = e.timeStamp || performance.now();
      matrices();
      var mm = [(G.ult[0][0] + G.ult[1][0]) / 2, (G.ult[0][1] + G.ult[1][1]) / 2], ag2 = enSuelo(mm[0], mm[1]);
      G.zPlano = ag2 ? ag2[2] : zCamara();
    }
    else if (G.n === 1) {
      G.ult = G.ptr[e.pointerId]; G.boton = e.button; G.mod = e.ctrlKey || e.shiftKey || e.button === 2; G.ignorar = false;
      matrices();
      var ag = enSuelo(G.ult[0], G.ult[1]);
      G.zPlano = ag ? ag[2] : zCamara();
    }
    ocultarAyuda();
    if (S.credAbiertos) creditos(false);
  }
  function alMover(e) {
    if (!G.ptr[e.pointerId]) return;
    e.preventDefault();
    matrices();
    var p = pos(e), c = S.cam;
    if (G.n === 1) {
      var a = G.ult;
      if (Math.hypot(p[0] - a[0], p[1] - a[1]) > 3) G.movido = true;
      if (G.mod) {
        c.rumbo -= (p[0] - a[0]) * 0.006;
        c.incl += (p[1] - a[1]) * 0.005;
      } else {
        var z = G.zPlano, A = enPlano(a[0], a[1], z), B = enPlano(p[0], p[1], z);
        if (A && B) {
          c.tx += A[0] - B[0]; c.ty += A[1] - B[1];
          G.vel.push({ t: performance.now(), dx: A[0] - B[0], dy: A[1] - B[1] });
          if (G.vel.length > 6) G.vel.shift();
        }
      }
      G.ult = p;
      G.ptr[e.pointerId] = p;
    } else if (G.n === 2) {
      var ant = G.ult;
      G.ptr[e.pointerId] = p;
      var now = dosPuntos();
      var d0 = Math.hypot(ant[1][0] - ant[0][0], ant[1][1] - ant[0][1]), d1 = Math.hypot(now[1][0] - now[0][0], now[1][1] - now[0][1]);
      var a0 = Math.atan2(ant[1][1] - ant[0][1], ant[1][0] - ant[0][0]), a1 = Math.atan2(now[1][1] - now[0][1], now[1][0] - now[0][0]);
      var m0 = [(ant[0][0] + ant[1][0]) / 2, (ant[0][1] + ant[1][1]) / 2], m1 = [(now[0][0] + now[1][0]) / 2, (now[0][1] + now[1][1]) / 2];
      if (!G.modo) {
        /* el modo se decide con lo que ha hecho cada dedo DESDE EL PRINCIPIO:
           el navegador manda los dos dedos por separado, y mirando solo el
           ultimo evento un movimiento vertical de los dos parecia un pellizco */
        var dA = [now[0][0] - G.ini[0][0], now[0][1] - G.ini[0][1]], dB = [now[1][0] - G.ini[1][0], now[1][1] - G.ini[1][1]];
        var lA = Math.hypot(dA[0], dA[1]), lB = Math.hypot(dB[0], dB[1]);
        var dist0 = Math.hypot(G.ini[1][0] - G.ini[0][0], G.ini[1][1] - G.ini[0][1]);
        var ang0 = Math.atan2(G.ini[1][1] - G.ini[0][1], G.ini[1][0] - G.ini[0][0]);
        if ((lA > 5 && lB > 5 && Math.max(lA, lB) > 9) || Math.max(lA, lB) > 32) {
          var vertical = dA[1] * dB[1] > 0 && Math.abs(dA[1]) > 2 * Math.abs(dA[0]) && Math.abs(dB[1]) > 2 * Math.abs(dB[0])
            && Math.abs(d1 - dist0) < 0.4 * (Math.abs(dA[1]) + Math.abs(dB[1])) / 2 && Math.abs(a1 - ang0) < 0.15;
          G.modo = vertical ? 'inclinar' : 'zoom';
        }
      }
      if (Math.hypot(m1[0] - m0[0], m1[1] - m0[1]) > 2 || Math.abs(d1 - d0) > 2) G.movido = true;
      if (G.modo === 'inclinar') {
        c.incl -= (m1[1] - m0[1]) * 0.006;
      } else if (G.modo === 'zoom') {
        var z2 = G.zPlano, P0 = enPlano(m0[0], m0[1], z2);
        if (d0 > 0 && d1 > 0) c.d *= d0 / d1;
        c.rumbo -= (a1 - a0);
        acotar(); matrices();
        var P1 = enPlano(m1[0], m1[1], z2);
        if (P0 && P1) { c.tx += P0[0] - P1[0]; c.ty += P0[1] - P1[1]; }
      }
      G.ult = now;
    }
    acotar();
    pedirCuadro();
  }
  function alSoltar(e) {
    if (!G.ptr[e.pointerId]) return;
    /* la hora del propio toque, no la de ahora: con el movil ocupado
       pintando, el segundo toque de un doble toque puede procesarse tarde */
    var p = pos(e), eraN = G.n, ahora = e.timeStamp || performance.now();
    delete G.ptr[e.pointerId];
    G.n = Object.keys(G.ptr).length;
    if (eraN === 2 && G.n === 1) {
      var k = Object.keys(G.ptr)[0]; G.ult = G.ptr[k]; G.mod = false;
      matrices(); var ag3 = enSuelo(G.ult[0], G.ult[1]); G.zPlano = ag3 ? ag3[2] : zCamara();
    }
    if (eraN === 2 && G.n === 1 && !G.movido && ahora - G.dosDedos < 320) {
      /* toque con dos dedos: alejar */
      animarA({ d: S.cam.d * 2 }, 350);
      G.dosDedos = 0; G.ignorar = true;
      return;
    }
    if (G.n === 0) setTimeout(function () { if (G.n === 0 && !S.anim && !S.inercia) { reanclar(); pedirCuadro(); } }, 0);
    if (eraN === 1 && G.n === 0) {
      if (G.ignorar) { G.ignorar = false; return; }
      if (!G.movido) {
        if (ahora - G.toque < 350 && G.toquePos && Math.hypot(p[0] - G.toquePos[0], p[1] - G.toquePos[1]) < 30) {
          /* doble toque: acercar al punto tocado */
          var s = enSuelo(p[0], p[1]);
          if (s) animarA({ tx: S.cam.tx + (s[0] - S.cam.tx) * 0.5, ty: S.cam.ty + (s[1] - S.cam.ty) * 0.5, d: S.cam.d / 2 }, 420);
          G.toque = 0;
        } else { G.toque = ahora; G.toquePos = p; }
      } else if (!G.mod && G.vel.length >= 2) {
        var v = G.vel, dt = v[v.length - 1].t - v[0].t;
        if (dt > 0 && ahora - v[v.length - 1].t < 80) {
          var sx = 0, sy = 0;
          for (var i = 1; i < v.length; i++) { sx += v[i].dx; sy += v[i].dy; }
          S.inercia = { vx: sx / dt, vy: sy / dt, t: null };
          pedirCuadro();
        }
      }
    }
  }
  function alRueda(e) {
    e.preventDefault();
    var p = pos(e), c = S.cam;
    S.ultimaRueda = performance.now();
    ocultarAyuda();
    if (S.credAbiertos) creditos(false);
    matrices();
    var ag = enSuelo(p[0], p[1]), z = ag ? ag[2] : zCamara(), A = enPlano(p[0], p[1], z);
    c.d *= Math.exp(e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016));
    acotar(); matrices();
    var B = enPlano(p[0], p[1], z);
    if (A && B) { c.tx += A[0] - B[0]; c.ty += A[1] - B[1]; }
    acotar();
    pedirCuadro();
    clearTimeout(S.ruedaT);
    S.ruedaT = setTimeout(function () { if (G.n === 0 && !S.anim) { reanclar(); pedirCuadro(); } }, 250);
  }
  function alTeclado(e) {
    if (!S.abierto) return;
    var c = S.cam, paso = c.d * 0.12, b = base3(), hecho = true;
    var fx = b.f[0], fy = b.f[1], lf = Math.hypot(fx, fy) || 1;
    if (lf < 0.2) { fx = Math.sin(c.rumbo); fy = Math.cos(c.rumbo); lf = 1; }
    switch (e.key) {
      case 'Escape': cerrar(); return;
      case 'ArrowUp': c.tx += fx / lf * paso; c.ty += fy / lf * paso; break;
      case 'ArrowDown': c.tx -= fx / lf * paso; c.ty -= fy / lf * paso; break;
      case 'ArrowLeft': c.tx -= b.r[0] * paso; c.ty -= b.r[1] * paso; break;
      case 'ArrowRight': c.tx += b.r[0] * paso; c.ty += b.r[1] * paso; break;
      case '+': case '=': c.d /= 1.4; break;
      case '-': case '_': c.d *= 1.4; break;
      default: hecho = false;
    }
    if (hecho) { e.preventDefault(); acotar(); pedirCuadro(); }
  }

  /* ───────────────────────── el mapa encima del relieve ───────────────────────── */
  /* Los colores del 3D: los del suelo, para verse con luz y sombra. Sin
     rellenar los espacios protegidos (el Parque Nacional es roca, no bosque)
     y sin nombres: los nombres van aparte, siempre de cara. */
  /* Las mismas reglas para los dos mapas: el base es, desde el 31 de octubre por la tarde, un
     recorte del detallado con el mismo esquema (tools/mapa_base.py). Lo que no trae (usos del
     suelo, edificios, senderos), no se pinta: con el base quedan las carreteras, las calles y los
     embalses sobre el color por altura. */
  function reglasDrape() {
    var P = protomapsL;
    function k() { var a = arguments; return function (z, f) { for (var i = 0; i < a.length; i++) if (f.props.kind === a[i]) return true; return false; }; }
    function kd() { var a = arguments; return function (z, f) { for (var i = 0; i < a.length; i++) if (f.props.kind_detail === a[i]) return true; return false; }; }
    var poli = function (capa, fill, filtro, op) { return { dataLayer: capa, symbolizer: new P.PolygonSymbolizer({ fill: fill, opacity: op || 1 }), filter: filtro }; };
    var linea = function (capa, color, ancho, filtro, extra) {
      var o = { color: color, width: ancho, lineCap: 'round', lineJoin: 'round' };
      if (extra) for (var x in extra) o[x] = extra[x];
      return { dataLayer: capa, symbolizer: new P.LineSymbolizer(o), filter: filtro };
    };
    return [
      poli('landuse', '#b5c69a', k('meadow', 'grassland', 'grass', 'village_green', 'recreation_ground')),
      poli('landuse', '#c9c49c', k('scrub', 'heath')),
      poli('landuse', '#dcd3a8', k('farmland', 'allotments')),
      poli('landuse', '#c4d29c', k('orchard', 'vineyard', 'plant_nursery')),
      poli('landuse', '#90ad7c', k('forest', 'wood')),
      poli('landuse', '#bfb2a2', k('bare_rock', 'scree', 'shingle')),
      poli('landuse', '#ecdcb0', k('sand', 'beach')),
      poli('landuse', '#b4cf98', k('park', 'garden', 'golf_course', 'pitch', 'dog_park', 'zoo', 'cemetery')),
      poli('landuse', '#d9d1c8', k('residential')),
      poli('landuse', '#d6ccd0', k('commercial', 'retail', 'industrial', 'military', 'aerodrome', 'school', 'university', 'college', 'hospital', 'pedestrian')),
      poli('water', '#8fbad0', k('water', 'lake', 'basin', 'reservoir', 'swimming_pool', 'river', 'canal', 'dam')),
      poli('buildings', '#bcae9f', null, 0.75),
      linea('roads', '#a7713f', 0.7, k('path'), { dash: [2.5, 2], dashColor: '#a7713f', dashWidth: 0.7, opacity: 0.85 }),
      linea('roads', '#e9dcc0', 0.8, k('minor_road')),
      linea('roads', '#f2dc9a', 1.1, kd('tertiary', 'tertiary_link')),
      linea('roads', '#efc865', 1.4, kd('secondary', 'secondary_link')),
      linea('roads', '#e5a446', 1.8, kd('primary', 'primary_link', 'trunk', 'trunk_link')),
      linea('roads', '#d9822d', 2.3, k('highway')),
      linea('roads', '#6d4630', 1.2, k('aerialway'))
    ];
  }

  function mapaParaDrape() {
    var listo = (typeof detalleGuardado === 'function') ? detalleGuardado() : Promise.resolve(null);
    return listo.then(function (blob) {
      if (blob) return { blob: blob, clave: DETALLE_URL, detallado: true };
      var url = (typeof ISLA_URL !== 'undefined') ? ISLA_URL : 'mapa/tenerife-base.pmtiles';
      return fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
        .then(function (b) { return { blob: b, clave: url, detallado: false }; });
    }).then(function (m) {
      m.pm = new pmtiles.PMTiles(fuenteBlob(m.blob, m.clave));
      return m.pm.getHeader().then(function (h) { m.zMax = h.maxZoom; return m; }, function () { m.zMax = 13; return m; });
    });
  }

  /* Pintar el mapa de una vez en un lienzo de 2048 px son uno o dos segundos
     del hilo de la pagina en un movil: los gestos se congelarian. Se pinta
     por trozos de 512 px, uno por vuelta del bucle, con la misma fuente (las
     teselas ya leidas se reaprovechan) y cada trozo recortado a su cuadro. */
  function dibujarPorTrozos(st, cv, w, h, lon, lat, zoom, vez, contador) {
    var ctx = cv.getContext('2d'), T = 512, esc = Math.pow(2, zoom) * 256;
    var x0 = (lon + 180) / 360 * esc - w / 2;
    var sl = Math.sin(lat * Math.PI / 180);
    var y0 = (0.5 - Math.log((1 + sl) / (1 - sl)) / (4 * Math.PI)) * esc - h / 2;
    var trozos = [];
    for (var oy = 0; oy < h; oy += T) for (var ox = 0; ox < w; ox += T) trozos.push([ox, oy, Math.min(T, w - ox), Math.min(T, h - oy)]);
    return new Promise(function (ok, mal) {
      var k = 0;
      function uno() {
        if (vez !== contador()) { ok(false); return; }
        if (k >= trozos.length) { ok(true); return; }
        var t = trozos[k++], cx = x0 + t[0] + t[2] / 2, cy = y0 + t[1] + t[3] / 2;
        var lo = cx / esc * 360 - 180, la = Math.atan(Math.sinh(Math.PI * (1 - 2 * cy / esc))) * 180 / Math.PI;
        ctx.save();
        ctx.translate(t[0], t[1]);
        ctx.beginPath(); ctx.rect(0, 0, t[2], t[3]); ctx.clip();
        st.drawContext(ctx, t[2], t[3], { x: lo, y: la }, zoom).then(function () {
          ctx.restore();
          setTimeout(uno, 0);
        }, function (e) { ctx.restore(); mal(e); });
      }
      uno();
    });
  }

  /* De cerca, el mapa de toda la isla (unos 40 m por pixel) se ve borroso:
     se dibuja otro, solo de lo que se mira, con el mismo estilo y 2048 px de
     lado (de 3 a 20 m por pixel). Se rehace cuando la vista se sale de el o
     cambia mucho de escala, siempre con la camara quieta. */
  var _detTimer = null;
  function programarDetalle() {
    if (!S.drape || !S.drapeMapa) return;
    var c = S.cam, D = S.det;
    if (c.d > 32000) return;
    var lado = Math.max(5000, Math.min(48000, c.d * 2.4));
    if (D && (D.tex || D.pendiente)) {
      var dentro = Math.abs(c.tx - (D.x0 + D.lado / 2)) < D.lado * 0.3 && Math.abs(c.ty - (D.y0 + D.lado / 2)) < D.lado * 0.3;
      var escala = lado / D.lado;
      if (dentro && escala > 0.55 && escala < 1.8) return;
      if (D.pendiente) return;
    }
    clearTimeout(_detTimer);
    _detTimer = setTimeout(function () { construirDetalle(c.tx, c.ty, lado); }, 350);
  }
  function construirDetalle(cx, cy, lado) {
    var m = S.drapeMapa;
    if (!m || !S.gl || !S.abierto) return;
    var vez = (S.detVez = (S.detVez || 0) + 1);
    S.det = S.det || {};
    S.det.pendiente = true;
    var st = new protomapsL.Static({ url: m.pm, paintRules: reglasDrape(), labelRules: [], maxDataZoom: m.zMax, levelDiff: 0 });
    var w = S.gl2 ? 2048 : 1536;
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = w;
    var ll = aLonLat(cx, cy);
    var zoom = Math.log(w / ((lado / S.k) / (2 * Math.PI * R) * 256)) / Math.LN2;
    return dibujarPorTrozos(st, cv, w, w, ll[0], ll[1], zoom, vez, function () { return S.detVez; }).then(function (hecho) {
      if (!hecho || vez !== S.detVez || !S.gl) { if (S.det && vez === S.detVez) S.det.pendiente = false; return; }
      var vieja = S.det && S.det.tex;
      var t = textura(cv, w, w, true);
      cv.width = cv.height = 0;
      if (vieja) S.gl.deleteTexture(vieja);
      S.det = { tex: t, x0: cx - lado / 2, y0: cy - lado / 2, lado: lado, pendiente: false };
      pedirCuadro();
    }).catch(function () { if (S.det) S.det.pendiente = false; });
  }

  /* El mapa de encima se rehace si no estaba, o si era el base y ya se ha
     descargado el detallado (o al reves: si se ha borrado). Mientras se
     dibuja, el relieve se ve con sus colores por altura. */
  function refrescarDrape() {
    var hay = (typeof detalleGuardado === 'function') ? detalleGuardado().then(function (b) { return !!b; }) : Promise.resolve(false);
    return hay.then(function (detallado) {
      var quiere = detallado ? 'detallado' : 'base';
      if (S.drape && S.drapeFuente === quiere) return true;
      /* la ayuda de los gestos manda: sale una vez, al entrar, que es justo
         cuando el mapa se esta dibujando; el relieve ya se ve mientras */
      if (S.ui && !_avisoLuz && S.ui.aviso.textContent !== T('Ayuda')) { S.ui.aviso.textContent = T('Dibujando'); S.ui.aviso.dataset.ayuda = '1'; S.ui.aviso.classList.add('si'); }
      return construirDrape().then(function (r) {
        if (S.ui && S.ui.aviso.textContent === T('Dibujando')) ocultarAyuda();
        return r;
      });
    });
  }
  function construirDrape() {
    if (typeof protomapsL === 'undefined' || typeof pmtiles === 'undefined' || typeof fuenteBlob !== 'function') return Promise.resolve(false);
    var vez = (S.drapeVez = (S.drapeVez || 0) + 1);
    return mapaParaDrape().then(function (m) {
      if (vez !== S.drapeVez) return false;
      var st = new protomapsL.Static({ url: m.pm, paintRules: reglasDrape(), labelRules: [], maxDataZoom: m.zMax, levelDiff: 0 });
      var tope = Math.min(S.gl.getParameter(S.gl.MAX_TEXTURE_SIZE) || 2048, 4096);
      var w = Math.min(tope, (S.gl2 && S.w * S.dpr > 1400) ? 3072 : 2048), h = Math.round(w * S.alto / S.ancho);
      var cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      var mt = S.meta.malla, ancho = mt.ancho * mt.paso;
      var zoom = Math.log(w / (ancho / (2 * Math.PI * R) * 256)) / Math.LN2;
      return dibujarPorTrozos(st, cv, w, h, lonDe(S.Xc), latDe(S.Yc), zoom, vez, function () { return S.drapeVez; }).then(function (hecho) {
        if (!hecho || vez !== S.drapeVez || !S.gl) return false;
        if (S.tex.drape) S.gl.deleteTexture(S.tex.drape);
        S.tex.drape = textura(cv, w, h, true);
        cv.width = cv.height = 0;
        S.drape = true;
        S.drapeFuente = m.detallado ? 'detallado' : 'base';
        S.drapeMapa = m;
        if (S.det && S.det.tex) { S.gl.deleteTexture(S.det.tex); }
        S.det = null;
        pedirCuadro();
        return true;
      });
    }).catch(function () { return false; });
  }

  /* ───────────────────────── rotulos ───────────────────────── */
  function prepararRotulos() {
    var ro = (S.meta && S.meta.rotulos) || {}, L = [], l = lang(), clave = ISLA3D_NOMBRE[l];
    function nombre(n) {
      if (!n) return '';
      if (typeof n === 'string') return n;
      return n[clave] || n.name || '';
    }
    var propios = [];
    if (typeof places !== 'undefined') {
      for (var i = 0; i < places.length; i++) {
        var pl = places[i];
        if ((pl.category !== 'ciudad' && pl.category !== 'municipio') || !pl.name || !isFinite(pl.lat) || !isFinite(pl.lng)) continue;
        if (pl.estado === 'cerrado') continue;
        var w0 = aMundo(pl.lng, pl.lat), may = MAYORES.indexOf(pl.name) >= 0;
        var r0 = { x: w0[0], y: w0[1], t: String(pl.name).replace(/\s*\([^)]*\)\s*$/, ''), tipo: 'lugar', tam: may ? 3 : 2,
          prio: may ? 5000 : (pl.category === 'ciudad' ? 2600 : 2400) };
        propios.push(r0); L.push(r0);
      }
    }
    (ro.lugares || []).forEach(function (p) {
      var w = aMundo(p[0], p[1]);
      for (var k = 0; k < propios.length; k++) if (Math.hypot(propios[k].x - w[0], propios[k].y - w[1]) < 1800) return;
      L.push({ x: w[0], y: w[1], t: nombre(p[4]), tipo: 'lugar', tam: 1, prio: 900 + (p[3] || 0) * 10 });
    });
    (ro.zonas || []).forEach(function (p) {
      var w = aMundo(p[0], p[1]);
      L.push({ x: w[0], y: w[1], t: nombre(p[3]), tipo: 'zona', tam: 2, prio: 1500 });
    });
    (ro.cimas || []).forEach(function (p) {
      var w = aMundo(p[0], p[1]);
      L.push({ x: w[0], y: w[1], t: nombre(p[3]), m: p[2], tipo: 'cima', tam: 1, prio: 600 + p[2] / 10 });
    });
    if (typeof places !== 'undefined') {
      HITOS.forEach(function (hito) {
        for (var i = 0; i < places.length; i++) {
          if (places[i].id === hito.id) {
            var w = aMundo(places[i].lng, places[i].lat);
            L.push({ x: w[0], y: w[1], t: T('Teide') || hito.texto, m: hito.m, tipo: 'cima', tam: 3, prio: 9000 });
            break;
          }
        }
      });
    }
    L = L.filter(function (r) { return r.t; });
    L.forEach(function (r) { r.z = Math.max(alturaEn(r.x, r.y), 0); });
    L.sort(function (a, b) { return b.prio - a.prio; });
    S.rotulos = L;
  }
  function ubicacion() {
    try {
      if (typeof gpsActive !== 'undefined' && gpsActive && gpsMarker && gpsMarker.getLatLng) {
        var ll = gpsMarker.getLatLng();
        return aMundo(ll.lng, ll.lat);
      }
    } catch (e) {}
    return null;
  }
  function pintarRotulos() {
    var g = S.ctxRot, dpr = S.dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, S.rot.width, S.rot.height);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var ocupado = [], dibujados = 0, cimas = 0, mueve = G.n > 0 || !!S.anim || !!S.inercia;
    var tope = S.w < 500 ? 24 : 40, topeCimas = S.w < 500 ? 6 : 10, arriba = 64, abajo = S.h - 38;
    function libre(b) {
      for (var i = 0; i < ocupado.length; i++) {
        var o = ocupado[i];
        if (b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) return false;
      }
      return true;
    }
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    /* su ubicacion, la primera */
    var u = ubicacion();
    if (u) {
      var zu = Math.max(alturaEn(u[0], u[1]), 0) * S.exag, pu = aPantalla(u[0], u[1], zu + 2);
      if (pu && pu[0] > -20 && pu[0] < S.w + 20 && pu[1] > -20 && pu[1] < S.h + 20 && visible(u[0], u[1], zu + 20)) {
        g.beginPath(); g.arc(pu[0], pu[1], 9, 0, 2 * Math.PI); g.fillStyle = 'rgba(37,99,235,0.22)'; g.fill();
        g.beginPath(); g.arc(pu[0], pu[1], 5.5, 0, 2 * Math.PI); g.fillStyle = '#2563eb'; g.fill();
        g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.stroke();
        ocupado.push([pu[0] - 10, pu[1] - 10, pu[0] + 10, pu[1] + 10]);
        if (pu[2] < 25000) {
          g.font = '600 11px "DM Sans", system-ui, sans-serif'; g.textAlign = 'left';
          g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.fillStyle = '#1d4ed8';
          var tu = T('Ubicacion'), wu = g.measureText(tu).width;
          if (pu[0] + 12 + wu < S.w - 2) {
            g.strokeText(tu, pu[0] + 12, pu[1]); g.fillText(tu, pu[0] + 12, pu[1]);
            ocupado.push([pu[0] + 8, pu[1] - 9, pu[0] + 16 + wu, pu[1] + 9]);
          }
        }
      }
    }
    var nocheTxt = S.luz === 'sol' && S.luces && S.luces.aviso;
    for (var i = 0; i < S.rotulos.length && dibujados < tope; i++) {
      var r = S.rotulos[i];
      var z = r.z * S.exag;
      var p = aPantalla(r.x, r.y, z + 4);
      if (!p || p[0] < 0 || p[0] > S.w || p[1] < arriba || p[1] > abajo) continue;
      /* por distancia: de lejos, solo lo grande; las cimas, por su altura y
         como mucho seis a la vez en un movil, para que no tapen el relieve */
      var dist = p[2];
      if (r.tipo === 'lugar' && r.tam === 1 && dist > 26000) continue;
      if (r.tipo === 'lugar' && r.tam === 2 && dist > 95000) continue;
      if (r.tipo === 'cima' && r.tam < 3) {
        if (cimas >= topeCimas) continue;
        if (dist > (r.m >= 2600 ? 48000 : r.m >= 1800 ? 26000 : r.m >= 1000 ? 16000 : 10000)) continue;
      }
      if (r.tipo === 'zona' && (dist > 90000 || dist < 6000)) continue;
      var fs = r.tipo === 'zona' ? 13 : r.tipo === 'cima' ? (r.tam === 3 ? 13 : 11) : (r.tam === 3 ? 14 : r.tam === 2 ? 12.5 : 11);
      var fuente = (r.tipo === 'zona' ? 'italic 500 ' : r.tipo === 'cima' ? '500 ' : (r.tam === 3 ? '600 ' : '500 ')) + fs + 'px "DM Sans", system-ui, sans-serif';
      g.font = fuente;
      var texto = r.tipo === 'zona' ? r.t.toUpperCase() : r.t;
      var w1 = g.measureText(texto).width, alto = fs + 2, cx = p[0], cy = p[1];
      var sub = r.m ? T('Metros', { n: numero(r.m) }) : '';
      var w2 = 0;
      if (sub) { g.font = '400 ' + (fs - 1.5) + 'px "DM Sans", system-ui, sans-serif'; w2 = g.measureText(sub).width; g.font = fuente; }
      var ancho = Math.max(w1, w2) + (r.tipo === 'cima' ? 12 : 0);
      var caja = r.tipo === 'cima'
        ? [cx - ancho / 2 - 7, cy - alto - (sub ? fs : 0) - 10, cx + ancho / 2 + 7, cy + 7]
        : [cx - ancho / 2 - 7, cy - alto / 2 - 5, cx + ancho / 2 + 7, cy + alto / 2 + 8];
      /* entero dentro de la pantalla, o nada: un nombre cortado no se lee */
      if (caja[0] < 2 || caja[2] > S.w - 2 || caja[1] < arriba - 4 || caja[3] > abajo + 6) continue;
      if (!libre(caja)) continue;
      if (!mueve || i < 12) { if (!visible(r.x, r.y, z + 30)) continue; }
      ocupado.push(caja);
      dibujados++;
      if (r.tipo === 'cima' && r.tam < 3) cimas++;
      var claro = !nocheTxt;
      g.lineWidth = 3.2;
      g.strokeStyle = claro ? 'rgba(255,255,255,0.88)' : 'rgba(8,12,24,0.85)';
      g.fillStyle = claro ? (r.tipo === 'zona' ? '#5b4a3a' : r.tipo === 'cima' ? '#4a3527' : '#1f2933') : '#e8eef8';
      g.textAlign = 'center';
      if (r.tipo === 'cima') {
        /* el triangulo en la cima y el nombre encima */
        g.beginPath(); g.moveTo(cx, cy - 6); g.lineTo(cx - 4.5, cy + 2); g.lineTo(cx + 4.5, cy + 2); g.closePath();
        g.fillStyle = claro ? '#7a4a2c' : '#e8eef8'; g.fill();
        g.lineWidth = 1.2; g.strokeStyle = claro ? '#ffffff' : '#0b1020'; g.stroke();
        g.lineWidth = 3.2; g.strokeStyle = claro ? 'rgba(255,255,255,0.88)' : 'rgba(8,12,24,0.85)';
        g.fillStyle = claro ? '#4a3527' : '#e8eef8';
        var ty = cy - 10 - (sub ? fs - 1 : 0) - fs / 2;
        g.font = fuente; g.strokeText(texto, cx, ty); g.fillText(texto, cx, ty);
        if (sub) {
          g.font = '400 ' + (fs - 1.5) + 'px "DM Sans", system-ui, sans-serif';
          g.strokeText(sub, cx, ty + fs); g.fillText(sub, cx, ty + fs);
        }
      } else {
        if (r.tipo === 'lugar') {
          g.beginPath(); g.arc(cx, cy + alto / 2 + 3, r.tam === 3 ? 3 : 2.2, 0, 2 * Math.PI);
          g.fillStyle = claro ? '#1f2933' : '#e8eef8'; g.fill();
          g.lineWidth = 1.2; g.strokeStyle = claro ? '#ffffff' : '#0b1020'; g.stroke();
          g.lineWidth = 3.2; g.strokeStyle = claro ? 'rgba(255,255,255,0.88)' : 'rgba(8,12,24,0.85)';
          g.fillStyle = claro ? '#1f2933' : '#e8eef8';
        }
        if (r.tipo === 'zona') { try { g.letterSpacing = '1.5px'; } catch (e) {} }
        g.strokeText(texto, cx, cy); g.fillText(texto, cx, cy);
        if (r.tipo === 'zona') { try { g.letterSpacing = '0px'; } catch (e2) {} }
      }
    }
    S.rotulosPintados = dibujados;
  }

  /* ───────────────────────── la pantalla ───────────────────────── */
  var CSS = [
    '#isla3d{position:fixed;inset:0;z-index:4200;display:none;background:#dfe7ee;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden}',
    '#isla3d.abierto{display:block}',
    '#isla3d canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}',
    '#isla3d .i3-rot{pointer-events:none}',
    '#isla3d .i3-barra{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:linear-gradient(to bottom,rgba(15,17,23,0.72),rgba(15,17,23,0));pointer-events:none}',
    '#isla3d .i3-titulo{flex:1;font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:1.25rem;color:#f5e6b8;text-shadow:0 1px 3px rgba(0,0,0,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#isla3d .i3-btn{pointer-events:auto;min-width:44px;height:44px;border-radius:22px;border:1px solid rgba(201,168,76,0.55);background:rgba(15,17,23,0.86);color:#d4af37;font:600 0.95rem "DM Sans",system-ui,sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;box-shadow:0 4px 14px rgba(0,0,0,0.35);cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '#isla3d .i3-btn:active{transform:scale(0.96)}',
    '#isla3d .i3-btn:focus-visible{outline:2px solid #f5c76b;outline-offset:2px}',
    '#isla3d .i3-brujula{padding:0;width:44px}',
    '#isla3d .i3-brujula svg{transition:transform 0.05s linear}',
    '#isla3d .i3-luz[aria-pressed="true"]{background:rgba(212,175,55,0.95);color:#14161c}',
    '#isla3d .i3-pie{position:absolute;left:0;right:0;bottom:0;padding:6px 10px calc(6px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}',
    '#isla3d .i3-aviso{max-width:min(92vw,520px);background:rgba(15,17,23,0.82);color:#f3f4f6;font:500 0.82rem/1.35 "DM Sans",system-ui,sans-serif;padding:7px 14px;border-radius:14px;text-align:center;display:none}',
    '#isla3d .i3-aviso.si{display:block}',
    '#isla3d .i3-creditos{pointer-events:auto;max-width:min(94vw,560px);font:400 0.66rem/1.4 "DM Sans",system-ui,sans-serif;color:rgba(20,24,32,0.8);background:rgba(255,255,255,0.66);padding:1px 2px 1px 8px;border-radius:8px;text-align:center}',
    '#isla3d .i3-creditos a{color:inherit;text-decoration:underline}',
    '#isla3d .i3-c-resp{display:block;padding-right:6px}',
    '#isla3d .i3-c-resp[hidden]{display:none}',
    '#isla3d .i3-c-mas{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;margin-left:2px;padding:0;border:0;border-radius:13px;background:transparent;color:inherit;font:600 0.92rem "DM Sans",system-ui,sans-serif;vertical-align:middle;cursor:pointer}',
    '#isla3d .i3-c-mas:focus-visible{outline:2px solid #f5c76b;outline-offset:1px}',
    /* sin esto, el display de arriba gana al [hidden] del navegador y «ⓘ» sale con el IGN */
    '#isla3d .i3-c-mas[hidden]{display:none}',
    '#isla3d.noche .i3-creditos{color:rgba(230,236,245,0.84);background:rgba(10,14,24,0.58)}',
    '#isla3d .i3-estado{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:min(86vw,440px);background:rgba(15,17,23,0.9);color:#f3f4f6;border:1px solid rgba(201,168,76,0.45);font:500 0.92rem/1.45 "DM Sans",system-ui,sans-serif;padding:16px 18px;border-radius:16px;text-align:center;display:none}',
    '#isla3d .i3-estado.si{display:block}',
    '@media (prefers-reduced-motion: reduce){#isla3d .i3-brujula svg{transition:none}}'
  ].join('\n');

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt) n.textContent = txt;
    return n;
  }
  function crearPantalla() {
    if (S.dom) return;
    var st = document.createElement('style'); st.id = 'isla3d-css'; st.textContent = CSS;
    document.head.appendChild(st);
    var d = el('div'); d.id = 'isla3d'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    var cv = el('canvas', 'i3-gl'); cv.setAttribute('role', 'img');
    var rot = el('canvas', 'i3-rot'); rot.setAttribute('aria-hidden', 'true');
    var barra = el('div', 'i3-barra');
    var b2d = el('button', 'i3-btn i3-2d', '2D'); b2d.type = 'button';
    var tit = el('div', 'i3-titulo');
    var bluz = el('button', 'i3-btn i3-luz'); bluz.type = 'button'; bluz.setAttribute('aria-pressed', 'false');
    var bnor = el('button', 'i3-btn i3-brujula'); bnor.type = 'button';
    var svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '26'); svg.setAttribute('height', '26'); svg.setAttribute('viewBox', '0 0 26 26'); svg.setAttribute('aria-hidden', 'true');
    var n1 = document.createElementNS(svgNS, 'path'); n1.setAttribute('d', 'M13 2 L17 13 L9 13 Z'); n1.setAttribute('fill', '#e5484d');
    var n2 = document.createElementNS(svgNS, 'path'); n2.setAttribute('d', 'M13 24 L9 13 L17 13 Z'); n2.setAttribute('fill', '#d9dde3');
    var nN = document.createElementNS(svgNS, 'circle'); nN.setAttribute('cx', '13'); nN.setAttribute('cy', '13'); nN.setAttribute('r', '1.6'); nN.setAttribute('fill', '#14161c');
    svg.appendChild(n1); svg.appendChild(n2); svg.appendChild(nN); bnor.appendChild(svg);
    barra.appendChild(b2d); barra.appendChild(tit); barra.appendChild(bluz); barra.appendChild(bnor);
    var pie = el('div', 'i3-pie');
    var aviso = el('div', 'i3-aviso'); aviso.setAttribute('role', 'status');
    var cred = el('div', 'i3-creditos');
    cred.setAttribute('data-sin-traducir', 'creditos: el de la fuente del relieve va palabra por palabra (el del IGN en castellano, las notas del Copernicus DEM en ingles); IGN, Copernicus y OpenStreetMap son nombres propios');
    var cRel = el('span'), cDem = el('span'), cMapa = el('span'), cResp = el('span', 'i3-c-resp');
    var cOsm = el('a', null, 'OpenStreetMap'); cOsm.href = OSM_DERECHOS; cOsm.target = '_blank'; cOsm.rel = 'noopener';
    var cMas = el('button', 'i3-c-mas', 'ⓘ'); cMas.type = 'button';
    cred.appendChild(cRel); cred.appendChild(cDem); cred.appendChild(cMapa); cred.appendChild(cOsm); cred.appendChild(cMas); cred.appendChild(cResp);
    pie.appendChild(aviso); pie.appendChild(cred);
    var estado = el('div', 'i3-estado'); estado.setAttribute('role', 'status');
    d.appendChild(cv); d.appendChild(rot); d.appendChild(barra); d.appendChild(pie); d.appendChild(estado);
    document.body.appendChild(d);
    S.dom = d; S.cv = cv; S.rot = rot; S.ctxRot = rot.getContext('2d');
    S.ui = { b2d: b2d, tit: tit, bluz: bluz, bnor: bnor, aguja: svg, aviso: aviso, cred: cred, estado: estado,
             cRel: cRel, cDem: cDem, cMapa: cMapa, cResp: cResp, cMas: cMas };
    cMas.addEventListener('click', function (e) { e.stopPropagation(); creditos(!S.credAbiertos); });
    b2d.addEventListener('click', function (e) { e.stopPropagation(); cerrar(); });
    bnor.addEventListener('click', function (e) { e.stopPropagation(); animarA({ rumbo: 0 }, 500); });
    bnor.addEventListener('dblclick', function (e) { e.stopPropagation(); animarA({ rumbo: 0, incl: 0 }, 500); });
    bluz.addEventListener('click', function (e) {
      e.stopPropagation();
      var aSol = S.luz !== 'sol';
      (aSol ? cargarAstronomia() : Promise.resolve()).then(function () {
        S.luz = aSol ? 'sol' : 'mapa';
        textos(); pedirCuadro();
      }, function () { S.luz = 'mapa'; textos(); });
    });
    cv.addEventListener('pointerdown', alBajar);
    cv.addEventListener('pointermove', alMover);
    cv.addEventListener('pointerup', alSoltar);
    cv.addEventListener('pointercancel', alSoltar);
    cv.addEventListener('wheel', alRueda, { passive: false });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    /* El movil puede quitarle la GPU a la pagina (en iOS, con la app en
       segundo plano). Con preventDefault el navegador la devuelve cuando
       puede: entonces se rehace todo lo de la GPU y se sigue donde estaba. Si
       no la devuelve, el aviso dice que se vuelva a abrir, y al abrir se
       rehace. */
    cv.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); S.perdido = true; S.gl = null; S.conSombra = false;
      if (S.nodos) for (var k in S.nodos) S.nodos[k].vbo = null;
      S.vbos = 0;
      estadoTxt(T('Perdido'));
    });
    cv.addEventListener('webglcontextrestored', function () {
      if (!S.abierto || !S.H || !S.perdido) return;
      if (!rehacerGL()) return;
      estadoTxt('');
      refrescarDrape();
      pedirCuadro();
    });
    document.addEventListener('keydown', alTeclado);
    window.addEventListener('popstate', alAtras);
    window.addEventListener('resize', function () { if (S.abierto) pedirCuadro(); });
    try { TG_IDIOMA.registrar('la isla en 3D', function () { if (S.dom) { textos(); if (S.H) prepararRotulos(); pedirCuadro(); } }); } catch (e) {}
    textos();
  }
  function textos() {
    if (!S.ui) return;
    var u = S.ui;
    S.dom.setAttribute('aria-label', T('Titulo'));
    S.cv.setAttribute('aria-label', T('Titulo'));
    u.tit.textContent = T('Titulo');
    u.b2d.title = T('Volver'); u.b2d.setAttribute('aria-label', T('Volver'));
    u.bnor.title = T('Norte'); u.bnor.setAttribute('aria-label', T('Norte'));
    u.bluz.textContent = S.luz === 'sol' ? T('LuzSol') : T('LuzMapa');
    u.bluz.title = T('LuzAyuda'); u.bluz.setAttribute('aria-label', T('LuzAyuda'));
    u.bluz.setAttribute('aria-pressed', S.luz === 'sol' ? 'true' : 'false');
    u.cRel.textContent = T('Relieve') + ': ';
    u.cMapa.textContent = ' · ' + T('Mapa') + ': © ';
    u.cMas.title = T('Creditos'); u.cMas.setAttribute('aria-label', T('Creditos'));
    creditos(S.credAbiertos);
  }
  /* el credito del relieve, el de su fuente: las notas del Copernicus DEM, enteras o plegadas
     («ⓘ»); el del IGN, siempre entero (es corto), y entonces «ⓘ» no hace falta */
  function creditos(enteras) {
    S.credAbiertos = !!enteras;
    if (!S.ui) return;
    var d = S.dem, plegable = !!(d && d.plegada);
    S.ui.cDem.textContent = !d ? '' : (enteras || !plegable) ? d.nota : d.plegada;
    S.ui.cResp.textContent = d && enteras && d.responsabilidad ? d.responsabilidad + '.' : '';
    S.ui.cResp.hidden = !S.ui.cResp.textContent;
    S.ui.cMas.hidden = !plegable;
    S.ui.cMas.setAttribute('aria-expanded', enteras ? 'true' : 'false');
  }
  function estadoTxt(t) {
    if (!S.ui) return;
    S.ui.estado.textContent = t || '';
    S.ui.estado.classList.toggle('si', !!t);
  }
  var _ayudaVista = false, _avisoLuz = '';
  function ocultarAyuda() {
    if (S.ui && S.ui.aviso.dataset.ayuda === '1') {
      S.ui.aviso.classList.remove('si'); S.ui.aviso.dataset.ayuda = ''; S.ui.aviso.textContent = ''; _avisoLuz = '';
      pedirCuadro();      // el aviso de la luz (de noche) sale ya, no al proximo gesto
    }
  }
  function avisoLuz(t) {
    if (!S.ui || S.ui.aviso.dataset.ayuda === '1') return;
    if (t === _avisoLuz) return;
    _avisoLuz = t;
    S.ui.aviso.textContent = t || '';
    S.ui.aviso.classList.toggle('si', !!t);
    S.dom.classList.toggle('noche', !!t);
  }
  function pintarBrujula() {
    if (S.ui) S.ui.aguja.style.transform = 'rotate(' + (-S.cam.rumbo * 180 / Math.PI) + 'deg)';
  }

  /* ───────────────────────── abrir y cerrar ───────────────────────── */
  /* La camara de entrada es la vista del mapa plano: el mismo centro y lo
     mismo de ancho, mirando desde arriba; luego se inclina. Al cerrar, el
     mapa plano vuelve centrado donde se miraba en 3D. */
  function camaraDesdeMapa() {
    var c = S.cam;
    try {
      var cen = map.getCenter(), z = map.getZoom();
      var w = aMundo(cen.lng, cen.lat);
      c.tx = w[0]; c.ty = w[1];
      var mpp = 156543.03392 * Math.cos(cen.lat * Math.PI / 180) / Math.pow(2, z);
      c.d = Math.min((S.h * mpp / 2) / Math.tan(FOV / 2), 115000);
    } catch (e) { c.tx = 0; c.ty = 0; c.d = 90000; }
    c.rumbo = 0; c.incl = 0;
    S.camZ = blancoZ();
    acotar();
  }
  function mapaDesdeCamara() {
    try {
      var c = S.cam, ll = aLonLat(c.tx, c.ty);
      var mpp = (c.d * Math.tan(FOV / 2) * 2) / Math.max(S.h, 1);
      var z = Math.log(156543.03392 * Math.cos(ll[1] * Math.PI / 180) / mpp) / Math.LN2;
      z = Math.round(z * 2) / 2;
      map.setView([ll[1], ll[0]], Math.max(map.getMinZoom ? map.getMinZoom() : 8, Math.min(z, 18)), { animate: false });
    } catch (e) {}
  }

  function abrir() {
    crearPantalla();
    if (S.abierto) return;
    S.abierto = true;
    S.dom.classList.add('abierto');
    /* «atras» del movil (o del navegador) cierra el 3D, como el SOS y el cielo */
    S.historia = false; S.cerrando = false;
    try { history.pushState({ tgIsla3d: 1 }, ''); S.historia = true; } catch (e) {}
    try { S.ui.b2d.focus({ preventScroll: true }); } catch (e) {}
    S.credAbiertos = true;
    textos();
    estadoTxt(S.H ? '' : tx('isla3dCargando'));
    medir();
    cargarRelieve().then(function () {
      if (!S.abierto) return;
      estadoTxt('');
      textos();
      if ((!S.gl || S.perdido) && !rehacerGL()) return;
      if (!S.rotulos.length) prepararRotulos();
      camaraDesdeMapa();
      if (!_ayudaVista) {
        _ayudaVista = true;
        S.ui.aviso.textContent = T('Ayuda'); S.ui.aviso.dataset.ayuda = '1'; S.ui.aviso.classList.add('si');
        setTimeout(ocultarAyuda, 6000);
      }
      pedirCuadro();
      /* la entrada: de la vista cenital a la inclinada */
      setTimeout(function () { if (S.abierto) animarA({ incl: 0.82, rumbo: 0 }, window.__tgoRM ? 1 : 1100); }, 120);
      refrescarDrape();
    }, function (e) {
      if (!S.abierto) return;
      estadoTxt(e && e.message === 'mal-leido' ? T('MalLeido') : tx('isla3dErrorCarga'));
    });
  }
  function cerrar() {
    if (!S.abierto || S.cerrando) return;
    if (S.historia) {
      S.cerrando = true;
      /* si el navegador no devuelve el popstate, se cierra igual */
      setTimeout(function () { if (S.cerrando) cerrarYa(); }, 450);
      try { history.back(); return; } catch (e) { S.cerrando = false; }
    }
    cerrarYa();
  }
  function alAtras() {
    if (!S.abierto) return;
    S.historia = false;
    cerrarYa();
  }
  function cerrarYa() {
    if (!S.abierto) return;
    S.cerrando = false; S.historia = false;
    if (S.H && S.gl) mapaDesdeCamara();
    S.abierto = false;
    S.anim = null; S.inercia = null;
    clearTimeout(S.relojT);
    G.ptr = {}; G.n = 0;
    S.dom.classList.remove('abierto');
    liberarVBOs(true);
    var b = document.getElementById('isla3d-btn');
    if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} }
  }

  window.TG_ISLA3D = {
    abrir: abrir,
    cerrar: cerrar,
    abierto: function () { return S.abierto; },
    /* para tools/auditar_isla3d.js: leer y mover la camara, y el estado */
    _prueba: {
      estado: function () {
        return { listo: !!(S.H && S.gl), drape: S.drape, drapeFuente: S.drapeFuente, nodos: S.ultimosNodos, vbos: S.vbos || 0,
          rotulos: S.rotulosPintados || 0, rotulosTotal: S.rotulos.length, cam: Object.assign({}, S.cam), luz: S.luz,
          gl2: S.gl2, sinWebGL: S.sinWebGL, sombras: !!S.conSombra, creditos: !!S.credAbiertos, cuadros: S.cuadros, ancho: S.ancho, alto: S.alto, animando: !!(S.anim || S.inercia), lodF: S.lodF,
          aviso: S.ui && S.ui.aviso.classList.contains('si') ? S.ui.aviso.textContent : '', estado: S.ui && S.ui.estado.classList.contains('si') ? S.ui.estado.textContent : '' };
      },
      camara: function (c) { Object.assign(S.cam, c); S.anim = null; S.inercia = null; acotar(); pedirCuadro(); },
      irA: function (lon, lat, d, rumbo, incl) {
        var w = aMundo(lon, lat);
        Object.assign(S.cam, { tx: w[0], ty: w[1], d: d, rumbo: (rumbo || 0) * Math.PI / 180, incl: (incl || 0) * Math.PI / 180 });
        S.anim = null; S.inercia = null; S.camZ = blancoZ(); acotar(); pedirCuadro();
      },
      luz: function (l) { S.luz = l; textos(); pedirCuadro(); },
      /* el sol de ahora (acimut y altura en grados), el que usa la luz */
      sol: function () { return posicionSol(); },
      alturaEn: function (lon, lat) { var w = aMundo(lon, lat); return alturaEn(w[0], w[1]); },
      pantallaDe: function (lon, lat) { matrices(); var w = aMundo(lon, lat); return aPantalla(w[0], w[1], Math.max(alturaEn(w[0], w[1]), 0) * S.exag); },
      suelo: function (sx, sy) { matrices(); var p = enSuelo(sx, sy); if (!p) return null; var ll = aLonLat(p[0], p[1]); return [ll[0], ll[1], p[2] / S.exag]; },
      drape: construirDrape,
      /* pinta un cuadro ya y lee los pixeles en esos puntos (CSS px): sin
         preserveDrawingBuffer, solo se pueden leer justo despues de pintar */
      pixeles: function (pts) {
        if (!S.gl || !S.abierto) return null;
        S.pedido = false; cuadro(performance.now());
        var gl = S.gl, px = new Uint8Array(4);
        return pts.map(function (q) {
          gl.readPixels(Math.round(q[0] * S.dpr), S.cv.height - 1 - Math.round(q[1] * S.dpr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
          return [px[0], px[1], px[2]];
        });
      },
      detalle: function () { return S.det ? { listo: !!S.det.tex, lado: S.det.lado } : null; },
      /* lo que dice la mascara de sombra en un punto: 1 al sol, 0 a la sombra */
      sombraEn: function (lon, lat) {
        var Sm = S.sombra;
        if (!Sm || !Sm.lista || !S.gl) return null;
        var w = aMundo(lon, lat), i = Math.floor((w[0] + S.Wm / 2) / S.c), j = Math.floor((S.Hm / 2 - w[1]) / S.c);
        if (i < 0 || j < 0 || i >= S.ancho || j >= S.alto) return null;
        var gl = S.gl, px = new Uint8Array(4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, Sm.fb);
        gl.readPixels(Math.floor(i * Sm.w / S.ancho), Math.floor(j * Sm.h / S.alto), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return px[0] / 255;
      }
    }
  };
})();
