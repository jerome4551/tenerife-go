/* modulos/cielo.js — el panel «Cielo de Tenerife» (ver la cabecera del
   bloque CIELO DE TENERIFE en index.html). Lo pide el cargador de index.html
   la primera vez que alguien abre el panel; tools/fuente.js y tools/fuente.py
   lo pegan al final del fuente para las herramientas (CARGA-PEREZOSA).
   Codigo, textos (CIELO_UI) y tablas de nombres en los diez idiomas: todo
   se edita aqui mismo. tools/auditar_cielo.js comprueba los textos contra el
   codigo y el catalogo, y los calculos contra el IGN, el IMCCE y la IMO. */
(function () {
  'use strict';
  /* El Observatorio del Teide (Izaña): la coordenada de su ficha en places[]
     y 2.390 m, la altitud que da el IAC. tools/cielo_construir.js usa la
     misma, y tools/auditar_cielo.js comprueba que coinciden. */
  var OBS = { lat: 28.2987, lon: -16.5106, h: 2390 };
  var ZONA = 'Atlantic/Canary';

  /* SIN-TRADUCIR: CIELO_LOCALE codigos de idioma para Intl (fechas, horas y numeros), no textos */
  var CIELO_LOCALE = {"es": "es-ES", "en": "en-GB", "fr": "fr-FR", "de": "de-DE", "it": "it-IT", "nl": "nl-NL", "zh": "zh-CN", "zht": "zh-TW", "bg": "bg-BG", "pl": "pl-PL"};
  /* las 88 constelaciones de la UAI: en ingles el nombre latino, que es como
     se llaman en ingles; en los demas, el corriente (traducciones de
     Stellarium, «modern», sin articulos ni acentos de pronunciacion en
     bulgaro, y en chino el de la UAI) */
  var CIELO_CON = {
    And: {"es": "Andrómeda", "en": "Andromeda", "fr": "Andromède", "de": "Andromeda", "it": "Andromeda", "nl": "Andromeda", "zh": "仙女座", "zht": "仙女座", "bg": "Андромеда", "pl": "Andromeda"},
    Ant: {"es": "Máquina Neumática", "en": "Antlia", "fr": "Machine pneumatique", "de": "Luftpumpe", "it": "Macchina Pneumatica", "nl": "Luchtpomp", "zh": "唧筒座", "zht": "唧筒座", "bg": "Помпа", "pl": "Pompa"},
    Aps: {"es": "Ave del Paraíso", "en": "Apus", "fr": "Oiseau de paradis", "de": "Paradiesvogel", "it": "Uccello del Paradiso", "nl": "Paradijsvogel", "zh": "天燕座", "zht": "天燕座", "bg": "Райска птица", "pl": "Ptak Rajski"},
    Aqr: {"es": "Acuario", "en": "Aquarius", "fr": "Verseau", "de": "Wassermann", "it": "Acquario", "nl": "Waterman", "zh": "宝瓶座", "zht": "寶瓶座", "bg": "Водолей", "pl": "Wodnik"},
    Aql: {"es": "Águila", "en": "Aquila", "fr": "Aigle", "de": "Adler", "it": "Aquila", "nl": "Arend", "zh": "天鹰座", "zht": "天鷹座", "bg": "Орел", "pl": "Orzeł"},
    Ara: {"es": "Altar", "en": "Ara", "fr": "Autel", "de": "Altar", "it": "Altare", "nl": "Altaar", "zh": "天坛座", "zht": "天壇座", "bg": "Олтар", "pl": "Ołtarz"},
    Ari: {"es": "Aries", "en": "Aries", "fr": "Bélier", "de": "Widder", "it": "Ariete", "nl": "Ram", "zh": "白羊座", "zht": "白羊座", "bg": "Овен", "pl": "Baran"},
    Aur: {"es": "Cochero", "en": "Auriga", "fr": "Cocher", "de": "Fuhrmann", "it": "Auriga", "nl": "Voerman", "zh": "御夫座", "zht": "御夫座", "bg": "Колар", "pl": "Woźnica"},
    Boo: {"es": "Boyero", "en": "Boötes", "fr": "Bouvier", "de": "Bärenhüter", "it": "Boote", "nl": "Ossenhoeder", "zh": "牧夫座", "zht": "牧夫座", "bg": "Воловар", "pl": "Wolarz"},
    Cae: {"es": "Cincel", "en": "Caelum", "fr": "Burin", "de": "Grabstichel", "it": "Bulino", "nl": "Graveerstift", "zh": "雕具座", "zht": "雕具座", "bg": "Длето", "pl": "Rylec"},
    Cam: {"es": "Jirafa", "en": "Camelopardalis", "fr": "Girafe", "de": "Giraffe", "it": "Giraffa", "nl": "Giraffe", "zh": "鹿豹座", "zht": "鹿豹座", "bg": "Жираф", "pl": "Żyrafa"},
    Cnc: {"es": "Cáncer", "en": "Cancer", "fr": "Cancer", "de": "Krebs", "it": "Cancro", "nl": "Kreeft", "zh": "巨蟹座", "zht": "巨蟹座", "bg": "Рак", "pl": "Rak"},
    CVn: {"es": "Perros de Caza", "en": "Canes Venatici", "fr": "Chiens de chasse", "de": "Jagdhunde", "it": "Cani da Caccia", "nl": "Jachthonden", "zh": "猎犬座", "zht": "獵犬座", "bg": "Ловджийски кучета", "pl": "Psy Gończe"},
    CMa: {"es": "Can Mayor", "en": "Canis Major", "fr": "Grand Chien", "de": "Großer Hund", "it": "Cane Maggiore", "nl": "Grote Hond", "zh": "大犬座", "zht": "大犬座", "bg": "Голямо куче", "pl": "Wielki Pies"},
    CMi: {"es": "Can Menor", "en": "Canis Minor", "fr": "Petit Chien", "de": "Kleiner Hund", "it": "Cane Minore", "nl": "Kleine Hond", "zh": "小犬座", "zht": "小犬座", "bg": "Малко куче", "pl": "Mały Pies"},
    Cap: {"es": "Capricornio", "en": "Capricornus", "fr": "Capricorne", "de": "Steinbock", "it": "Capricorno", "nl": "Steenbok", "zh": "摩羯座", "zht": "摩羯座", "bg": "Козирог", "pl": "Koziorożec"},
    Car: {"es": "Quilla", "en": "Carina", "fr": "Carène", "de": "Kiel des Schiffs", "it": "Carena", "nl": "Kiel", "zh": "船底座", "zht": "船底座", "bg": "Кил", "pl": "Kil"},
    Cas: {"es": "Casiopea", "en": "Cassiopeia", "fr": "Cassiopée", "de": "Kassiopeia", "it": "Cassiopea", "nl": "Cassiopeia", "zh": "仙后座", "zht": "仙后座", "bg": "Касиопея", "pl": "Kasjopeja"},
    Cen: {"es": "Centauro", "en": "Centaurus", "fr": "Centaure", "de": "Zentaur", "it": "Centauro", "nl": "Centaur", "zh": "半人马座", "zht": "半人馬座", "bg": "Кентавър", "pl": "Centaur"},
    Cep: {"es": "Cefeo", "en": "Cepheus", "fr": "Céphée", "de": "Kepheus", "it": "Cefeo", "nl": "Cepheus", "zh": "仙王座", "zht": "仙王座", "bg": "Цефей", "pl": "Cefeusz"},
    Cet: {"es": "Ballena", "en": "Cetus", "fr": "Baleine", "de": "Walfisch", "it": "Balena", "nl": "Walvis", "zh": "鲸鱼座", "zht": "鯨魚座", "bg": "Кит", "pl": "Wieloryb"},
    Cha: {"es": "Camaleón", "en": "Chamaeleon", "fr": "Caméléon", "de": "Chamäleon", "it": "Camaleonte", "nl": "Kameleon", "zh": "蝘蜓座", "zht": "蝘蜓座", "bg": "Хамелеон", "pl": "Kameleon"},
    Cir: {"es": "Compás", "en": "Circinus", "fr": "Compas", "de": "Zirkel", "it": "Compasso", "nl": "Passer", "zh": "圆规座", "zht": "圓規座", "bg": "Пергел", "pl": "Cyrkiel"},
    Col: {"es": "Paloma", "en": "Columba", "fr": "Colombe", "de": "Taube", "it": "Colomba", "nl": "Duif", "zh": "天鸽座", "zht": "天鴿座", "bg": "Гълъб", "pl": "Gołąb"},
    Com: {"es": "Cabellera de Berenice", "en": "Coma Berenices", "fr": "Chevelure de Bérénice", "de": "Haar der Berenike", "it": "Chioma di Berenice", "nl": "Haar van Berenice", "zh": "后发座", "zht": "后髮座", "bg": "Косите на Вероника", "pl": "Warkocz Bereniki"},
    CrA: {"es": "Corona Austral", "en": "Corona Australis", "fr": "Couronne australe", "de": "Südliche Krone", "it": "Corona Australe", "nl": "Zuiderkroon", "zh": "南冕座", "zht": "南冕座", "bg": "Южна корона", "pl": "Korona Południowa"},
    CrB: {"es": "Corona Boreal", "en": "Corona Borealis", "fr": "Couronne boréale", "de": "Nördliche Krone", "it": "Corona Boreale", "nl": "Noorderkroon", "zh": "北冕座", "zht": "北冕座", "bg": "Северна корона", "pl": "Korona Północna"},
    Crv: {"es": "Cuervo", "en": "Corvus", "fr": "Corbeau", "de": "Rabe", "it": "Corvo", "nl": "Raaf", "zh": "乌鸦座", "zht": "烏鴉座", "bg": "Гарван", "pl": "Kruk"},
    Crt: {"es": "Copa", "en": "Crater", "fr": "Coupe", "de": "Becher", "it": "Cratere", "nl": "Beker", "zh": "巨爵座", "zht": "巨爵座", "bg": "Чаша", "pl": "Puchar"},
    Cru: {"es": "Cruz del Sur", "en": "Crux", "fr": "Croix du Sud", "de": "Kreuz des Südens", "it": "Croce del Sud", "nl": "Zuiderkruis", "zh": "南十字座", "zht": "南十字座", "bg": "Южен кръст", "pl": "Krzyż Południa"},
    Cyg: {"es": "Cisne", "en": "Cygnus", "fr": "Cygne", "de": "Schwan", "it": "Cigno", "nl": "Zwaan", "zh": "天鹅座", "zht": "天鵝座", "bg": "Лебед", "pl": "Łabędź"},
    Del: {"es": "Delfín", "en": "Delphinus", "fr": "Dauphin", "de": "Delphin", "it": "Delfino", "nl": "Dolfijn", "zh": "海豚座", "zht": "海豚座", "bg": "Делфин", "pl": "Delfin"},
    Dor: {"es": "Dorado", "en": "Dorado", "fr": "Dorade", "de": "Schwertfisch", "it": "Dorado", "nl": "Goudvis", "zh": "剑鱼座", "zht": "劍魚座", "bg": "Златна рибка", "pl": "Złota Ryba"},
    Dra: {"es": "Dragón", "en": "Draco", "fr": "Dragon", "de": "Drache", "it": "Dragone", "nl": "Draak", "zh": "天龙座", "zht": "天龍座", "bg": "Дракон", "pl": "Smok"},
    Equ: {"es": "Caballito", "en": "Equuleus", "fr": "Petit Cheval", "de": "Füllen", "it": "Cavallino", "nl": "Veulen", "zh": "小马座", "zht": "小馬座", "bg": "Жребче", "pl": "Źrebię"},
    Eri: {"es": "Erídano", "en": "Eridanus", "fr": "Éridan", "de": "Eridanus", "it": "Eridano", "nl": "Eridanus", "zh": "波江座", "zht": "波江座", "bg": "Еридан", "pl": "Erydan"},
    For: {"es": "Horno", "en": "Fornax", "fr": "Fourneau", "de": "Chemischer Ofen", "it": "Fornace", "nl": "Oven", "zh": "天炉座", "zht": "天爐座", "bg": "Пещ", "pl": "Piec"},
    Gem: {"es": "Géminis", "en": "Gemini", "fr": "Gémeaux", "de": "Zwillinge", "it": "Gemelli", "nl": "Tweelingen", "zh": "双子座", "zht": "雙子座", "bg": "Близнаци", "pl": "Bliźnięta"},
    Gru: {"es": "Grulla", "en": "Grus", "fr": "Grue", "de": "Kranich", "it": "Gru", "nl": "Kraanvogel", "zh": "天鹤座", "zht": "天鶴座", "bg": "Жерав", "pl": "Żuraw"},
    Her: {"es": "Hércules", "en": "Hercules", "fr": "Hercule", "de": "Herkules", "it": "Ercole", "nl": "Hercules", "zh": "武仙座", "zht": "武仙座", "bg": "Херкулес", "pl": "Herkules"},
    Hor: {"es": "Reloj", "en": "Horologium", "fr": "Horloge", "de": "Pendeluhr", "it": "Orologio", "nl": "Slingeruurwerk", "zh": "时钟座", "zht": "時鐘座", "bg": "Часовник", "pl": "Zegar"},
    Hya: {"es": "Hidra", "en": "Hydra", "fr": "Hydre", "de": "Wasserschlange", "it": "Idra", "nl": "Waterslang", "zh": "长蛇座", "zht": "長蛇座", "bg": "Хидра", "pl": "Hydra"},
    Hyi: {"es": "Hidra Macho", "en": "Hydrus", "fr": "Hydre mâle", "de": "Kleine Wasserschlange", "it": "Idra Maschio", "nl": "Kleine Waterslang", "zh": "水蛇座", "zht": "水蛇座", "bg": "Водна змия", "pl": "Wąż Wodny"},
    Ind: {"es": "Indio", "en": "Indus", "fr": "Indien", "de": "Inder", "it": "Indiano", "nl": "Indiaan", "zh": "印第安座", "zht": "印第安座", "bg": "Индианец", "pl": "Indianin"},
    Lac: {"es": "Lagarto", "en": "Lacerta", "fr": "Lézard", "de": "Eidechse", "it": "Lucertola", "nl": "Hagedis", "zh": "蝎虎座", "zht": "蝎虎座", "bg": "Гущер", "pl": "Jaszczurka"},
    Leo: {"es": "Leo", "en": "Leo", "fr": "Lion", "de": "Löwe", "it": "Leone", "nl": "Leeuw", "zh": "狮子座", "zht": "獅子座", "bg": "Лъв", "pl": "Lew"},
    LMi: {"es": "Leo Menor", "en": "Leo Minor", "fr": "Petit Lion", "de": "Kleiner Löwe", "it": "Leone Minore", "nl": "Kleine Leeuw", "zh": "小狮座", "zht": "小獅座", "bg": "Малък лъв", "pl": "Mały Lew"},
    Lep: {"es": "Liebre", "en": "Lepus", "fr": "Lièvre", "de": "Hase", "it": "Lepre", "nl": "Haas", "zh": "天兔座", "zht": "天兔座", "bg": "Заек", "pl": "Zając"},
    Lib: {"es": "Libra", "en": "Libra", "fr": "Balance", "de": "Waage", "it": "Bilancia", "nl": "Weegschaal", "zh": "天秤座", "zht": "天秤座", "bg": "Везни", "pl": "Waga"},
    Lup: {"es": "Lobo", "en": "Lupus", "fr": "Loup", "de": "Wolf", "it": "Lupo", "nl": "Wolf", "zh": "豺狼座", "zht": "豺狼座", "bg": "Вълк", "pl": "Wilk"},
    Lyn: {"es": "Lince", "en": "Lynx", "fr": "Lynx", "de": "Luchs", "it": "Lince", "nl": "Lynx", "zh": "天猫座", "zht": "天貓座", "bg": "Рис", "pl": "Ryś"},
    Lyr: {"es": "Lira", "en": "Lyra", "fr": "Lyre", "de": "Leier", "it": "Lira", "nl": "Lier", "zh": "天琴座", "zht": "天琴座", "bg": "Лира", "pl": "Lutnia"},
    Men: {"es": "Mesa", "en": "Mensa", "fr": "Table", "de": "Tafelberg", "it": "Mensa", "nl": "Tafelberg", "zh": "山案座", "zht": "山案座", "bg": "Маса", "pl": "Góra Stołowa"},
    Mic: {"es": "Microscopio", "en": "Microscopium", "fr": "Microscope", "de": "Mikroskop", "it": "Microscopio", "nl": "Microscoop", "zh": "显微镜座", "zht": "顯微鏡座", "bg": "Микроскоп", "pl": "Mikroskop"},
    Mon: {"es": "Unicornio", "en": "Monoceros", "fr": "Licorne", "de": "Einhorn", "it": "Unicorno", "nl": "Eenhoorn", "zh": "麒麟座", "zht": "麒麟座", "bg": "Еднорог", "pl": "Jednorożec"},
    Mus: {"es": "Mosca", "en": "Musca", "fr": "Mouche", "de": "Fliege", "it": "Mosca", "nl": "Vlieg", "zh": "苍蝇座", "zht": "蒼蠅座", "bg": "Муха", "pl": "Mucha"},
    Nor: {"es": "Escuadra", "en": "Norma", "fr": "Règle", "de": "Winkelmaß", "it": "Squadra", "nl": "Winkelhaak", "zh": "矩尺座", "zht": "矩尺座", "bg": "Наугълник", "pl": "Węgielnica"},
    Oct: {"es": "Octante", "en": "Octans", "fr": "Octant", "de": "Oktant", "it": "Ottante", "nl": "Octant", "zh": "南极座", "zht": "南極座", "bg": "Октант", "pl": "Oktant"},
    Oph: {"es": "Ofiuco", "en": "Ophiuchus", "fr": "Ophiuchus", "de": "Schlangenträger", "it": "Ofiuco", "nl": "Slangendrager", "zh": "蛇夫座", "zht": "蛇夫座", "bg": "Змиеносец", "pl": "Wężownik"},
    Ori: {"es": "Orión", "en": "Orion", "fr": "Orion", "de": "Orion", "it": "Orione", "nl": "Orion", "zh": "猎户座", "zht": "獵戶座", "bg": "Орион", "pl": "Orion"},
    Pav: {"es": "Pavo", "en": "Pavo", "fr": "Paon", "de": "Pfau", "it": "Pavone", "nl": "Pauw", "zh": "孔雀座", "zht": "孔雀座", "bg": "Паун", "pl": "Paw"},
    Peg: {"es": "Pegaso", "en": "Pegasus", "fr": "Pégase", "de": "Pegasus", "it": "Pegaso", "nl": "Pegasus", "zh": "飞马座", "zht": "飛馬座", "bg": "Пегас", "pl": "Pegaz"},
    Per: {"es": "Perseo", "en": "Perseus", "fr": "Persée", "de": "Perseus", "it": "Perseo", "nl": "Perseus", "zh": "英仙座", "zht": "英仙座", "bg": "Персей", "pl": "Perseusz"},
    Phe: {"es": "Fénix", "en": "Phoenix", "fr": "Phénix", "de": "Phönix", "it": "Fenice", "nl": "Phoenix", "zh": "凤凰座", "zht": "鳳凰座", "bg": "Феникс", "pl": "Feniks"},
    Pic: {"es": "Pintor", "en": "Pictor", "fr": "Peintre", "de": "Maler", "it": "Pittore", "nl": "Schilder", "zh": "绘架座", "zht": "繪架座", "bg": "Живописец", "pl": "Malarz"},
    Psc: {"es": "Piscis", "en": "Pisces", "fr": "Poissons", "de": "Fische", "it": "Pesci", "nl": "Vissen", "zh": "双鱼座", "zht": "雙魚座", "bg": "Риби", "pl": "Ryby"},
    PsA: {"es": "Pez Austral", "en": "Piscis Austrinus", "fr": "Poisson austral", "de": "Südlicher Fisch", "it": "Pesce Australe", "nl": "Zuidervis", "zh": "南鱼座", "zht": "南魚座", "bg": "Южна риба", "pl": "Ryba Południowa"},
    Pup: {"es": "Popa", "en": "Puppis", "fr": "Poupe", "de": "Achterdeck des Schiffs", "it": "Poppa", "nl": "Achtersteven", "zh": "船尾座", "zht": "船尾座", "bg": "Кърма", "pl": "Rufa"},
    Pyx: {"es": "Brújula", "en": "Pyxis", "fr": "Boussole", "de": "Schiffskompass", "it": "Bussola", "nl": "Kompas", "zh": "罗盘座", "zht": "羅盤座", "bg": "Компас", "pl": "Kompas"},
    Ret: {"es": "Retículo", "en": "Reticulum", "fr": "Réticule", "de": "Netz", "it": "Reticolo", "nl": "Net", "zh": "网罟座", "zht": "網罟座", "bg": "Мрежичка", "pl": "Sieć"},
    Sge: {"es": "Flecha", "en": "Sagitta", "fr": "Flèche", "de": "Pfeil", "it": "Freccia", "nl": "Pijl", "zh": "天箭座", "zht": "天箭座", "bg": "Стрела", "pl": "Strzała"},
    Sgr: {"es": "Sagitario", "en": "Sagittarius", "fr": "Sagittaire", "de": "Schütze", "it": "Sagittario", "nl": "Boogschutter", "zh": "人马座", "zht": "人馬座", "bg": "Стрелец", "pl": "Strzelec"},
    Sco: {"es": "Escorpio", "en": "Scorpius", "fr": "Scorpion", "de": "Skorpion", "it": "Scorpione", "nl": "Schorpioen", "zh": "天蝎座", "zht": "天蠍座", "bg": "Скорпион", "pl": "Skorpion"},
    Scl: {"es": "Escultor", "en": "Sculptor", "fr": "Sculpteur", "de": "Bildhauer", "it": "Scultore", "nl": "Beeldhouwer", "zh": "玉夫座", "zht": "玉夫座", "bg": "Скулптор", "pl": "Rzeźbiarz"},
    Sct: {"es": "Escudo", "en": "Scutum", "fr": "Écu de Sobieski", "de": "Schild", "it": "Scudo", "nl": "Schild", "zh": "盾牌座", "zht": "盾牌座", "bg": "Щит", "pl": "Tarcza"},
    Ser: {"es": "Serpiente", "en": "Serpens", "fr": "Serpent", "de": "Schlange", "it": "Serpente", "nl": "Slang", "zh": "巨蛇座", "zht": "巨蛇座", "bg": "Змия", "pl": "Wąż"},
    Sex: {"es": "Sextante", "en": "Sextans", "fr": "Sextant", "de": "Sextant", "it": "Sestante", "nl": "Sextant", "zh": "六分仪座", "zht": "六分儀座", "bg": "Секстант", "pl": "Sekstans"},
    Tau: {"es": "Tauro", "en": "Taurus", "fr": "Taureau", "de": "Stier", "it": "Toro", "nl": "Stier", "zh": "金牛座", "zht": "金牛座", "bg": "Телец", "pl": "Byk"},
    Tel: {"es": "Telescopio", "en": "Telescopium", "fr": "Télescope", "de": "Teleskop", "it": "Telescopio", "nl": "Telescoop", "zh": "望远镜座", "zht": "望遠鏡座", "bg": "Телескоп", "pl": "Luneta"},
    Tri: {"es": "Triángulo", "en": "Triangulum", "fr": "Triangle", "de": "Dreieck", "it": "Triangolo", "nl": "Driehoek", "zh": "三角座", "zht": "三角座", "bg": "Триъгълник", "pl": "Trójkąt"},
    TrA: {"es": "Triángulo Austral", "en": "Triangulum Australe", "fr": "Triangle austral", "de": "Südliches Dreieck", "it": "Triangolo Australe", "nl": "Zuiderdriehoek", "zh": "南三角座", "zht": "南三角座", "bg": "Южен триъгълник", "pl": "Trójkąt Południowy"},
    Tuc: {"es": "Tucán", "en": "Tucana", "fr": "Toucan", "de": "Tukan", "it": "Tucano", "nl": "Toekan", "zh": "杜鹃座", "zht": "杜鵑座", "bg": "Тукан", "pl": "Tukan"},
    UMa: {"es": "Osa Mayor", "en": "Ursa Major", "fr": "Grande Ourse", "de": "Großer Bär", "it": "Orsa Maggiore", "nl": "Grote Beer", "zh": "大熊座", "zht": "大熊座", "bg": "Голяма мечка", "pl": "Wielka Niedźwiedzica"},
    UMi: {"es": "Osa Menor", "en": "Ursa Minor", "fr": "Petite Ourse", "de": "Kleiner Bär", "it": "Orsa Minore", "nl": "Kleine Beer", "zh": "小熊座", "zht": "小熊座", "bg": "Малка мечка", "pl": "Mała Niedźwiedzica"},
    Vel: {"es": "Vela", "en": "Vela", "fr": "Voiles", "de": "Segel des Schiffs", "it": "Vele", "nl": "Zeilen", "zh": "船帆座", "zht": "船帆座", "bg": "Корабни платна", "pl": "Żagiel"},
    Vir: {"es": "Virgo", "en": "Virgo", "fr": "Vierge", "de": "Jungfrau", "it": "Vergine", "nl": "Maagd", "zh": "室女座", "zht": "室女座", "bg": "Дева", "pl": "Panna"},
    Vol: {"es": "Pez Volador", "en": "Volans", "fr": "Poisson volant", "de": "Fliegender Fisch", "it": "Pesce Volante", "nl": "Vliegende Vis", "zh": "飞鱼座", "zht": "飛魚座", "bg": "Летяща риба", "pl": "Ryba Latająca"},
    Vul: {"es": "Zorra", "en": "Vulpecula", "fr": "Petit Renard", "de": "Füchschen", "it": "Volpetta", "nl": "Vosje", "zh": "狐狸座", "zht": "狐狸座", "bg": "Малка лисица", "pl": "Lisek"}
  };
  /* estrellas por su numero HIP: el nombre de la UAI (HYG v4.1) en la forma
     corriente de cada idioma (traducciones de Stellarium, «modern»: el bulgaro
     sin acentos de pronunciacion, el chino con el nombre tradicional y sin el
     latino detras) */
  var CIELO_EST = {
    "32349": {"es": "Sirio", "en": "Sirius", "fr": "Sirius", "de": "Sirius", "it": "Sirio", "nl": "Sirius", "zh": "天狼星", "zht": "天狼星", "bg": "Сириус", "pl": "Syriusz"},
    "30438": {"es": "Canopo", "en": "Canopus", "fr": "Canopus", "de": "Canopus", "it": "Canopo", "nl": "Canopus", "zh": "老人星", "zht": "老人星", "bg": "Канопус", "pl": "Kanopus"},
    "69673": {"es": "Arturo", "en": "Arcturus", "fr": "Arcturus", "de": "Arktur", "it": "Arturo", "nl": "Arcturus", "zh": "大角星", "zht": "大角星", "bg": "Арктур", "pl": "Arktur"},
    "71683": {"es": "Alfa Centauri", "en": "Alpha Centauri", "fr": "Alpha du Centaure", "de": "Alpha Centauri", "it": "Alfa Centauri", "nl": "Alpha Centauri", "zh": "南门二", "zht": "南門二", "bg": "Алфа Кентавър", "pl": "Alfa Centauri"},
    "91262": {"es": "Vega", "en": "Vega", "fr": "Véga", "de": "Wega", "it": "Vega", "nl": "Wega", "zh": "织女星", "zht": "織女星", "bg": "Вега", "pl": "Wega"},
    "24608": {"es": "Capella", "en": "Capella", "fr": "Capella", "de": "Kapella", "it": "Capella", "nl": "Capella", "zh": "五车二", "zht": "五車二", "bg": "Капела", "pl": "Kapella"},
    "24436": {"es": "Rigel", "en": "Rigel", "fr": "Rigel", "de": "Rigel", "it": "Rigel", "nl": "Rigel", "zh": "参宿七", "zht": "參宿七", "bg": "Ригел", "pl": "Rigel"},
    "37279": {"es": "Proción", "en": "Procyon", "fr": "Procyon", "de": "Prokyon", "it": "Procione", "nl": "Procyon", "zh": "南河三", "zht": "南河三", "bg": "Процион", "pl": "Procjon"},
    "7588": {"es": "Achernar", "en": "Achernar", "fr": "Achernar", "de": "Achernar", "it": "Achernar", "nl": "Achernar", "zh": "水委一", "zht": "水委一", "bg": "Ахернар", "pl": "Achernar"},
    "27989": {"es": "Betelgeuse", "en": "Betelgeuse", "fr": "Bételgeuse", "de": "Beteigeuze", "it": "Betelgeuse", "nl": "Betelgeuze", "zh": "参宿四", "zht": "參宿四", "bg": "Бетелгейзе", "pl": "Betelgeza"},
    "68702": {"es": "Hadar", "en": "Hadar", "fr": "Hadar", "de": "Hadar", "it": "Hadar", "nl": "Hadar", "zh": "马腹一", "zht": "馬腹一", "bg": "Хадар", "pl": "Hadar"},
    "97649": {"es": "Altair", "en": "Altair", "fr": "Altaïr", "de": "Atair", "it": "Altair", "nl": "Altaïr", "zh": "牛郎星", "zht": "牛郎星", "bg": "Алтаир", "pl": "Altair"},
    "21421": {"es": "Aldebarán", "en": "Aldebaran", "fr": "Aldébaran", "de": "Aldebaran", "it": "Aldebaran", "nl": "Aldebaran", "zh": "毕宿五", "zht": "畢宿五", "bg": "Алдебаран", "pl": "Aldebaran"},
    "65474": {"es": "Espiga", "en": "Spica", "fr": "Spica", "de": "Spica", "it": "Spica", "nl": "Spica", "zh": "角宿一", "zht": "角宿一", "bg": "Спика", "pl": "Spika"},
    "80763": {"es": "Antares", "en": "Antares", "fr": "Antarès", "de": "Antares", "it": "Antares", "nl": "Antares", "zh": "心宿二", "zht": "心宿二", "bg": "Антарес", "pl": "Antares"},
    "37826": {"es": "Pólux", "en": "Pollux", "fr": "Pollux", "de": "Pollux", "it": "Polluce", "nl": "Pollux", "zh": "北河三", "zht": "北河三", "bg": "Полукс", "pl": "Polluks"},
    "113368": {"es": "Fomalhaut", "en": "Fomalhaut", "fr": "Fomalhaut", "de": "Fomalhaut", "it": "Fomalhaut", "nl": "Fomalhaut", "zh": "北落师门", "zht": "北落師門", "bg": "Фомалхаут", "pl": "Fomalhaut"},
    "62434": {"es": "Mimosa", "en": "Mimosa", "fr": "Mimosa", "de": "Mimosa", "it": "Mimosa", "nl": "Mimosa", "zh": "十字架三", "zht": "十字架三", "bg": "Мимоза", "pl": "Mimosa"},
    "102098": {"es": "Deneb", "en": "Deneb", "fr": "Deneb", "de": "Deneb", "it": "Deneb", "nl": "Deneb", "zh": "天津四", "zht": "天津四", "bg": "Денеб", "pl": "Deneb"},
    "49669": {"es": "Régulo", "en": "Regulus", "fr": "Régulus", "de": "Regulus", "it": "Regolo", "nl": "Regulus", "zh": "轩辕十四", "zht": "軒轅十四", "bg": "Регул", "pl": "Regulus"},
    "33579": {"es": "Adhara", "en": "Adhara", "fr": "Adhara", "de": "Adhara", "it": "Adhara", "nl": "Adhara", "zh": "弧矢七", "zht": "弧矢七", "bg": "Адхара", "pl": "Adhara"},
    "36850": {"es": "Cástor", "en": "Castor", "fr": "Castor", "de": "Kastor", "it": "Castore", "nl": "Castor", "zh": "北河二", "zht": "北河二", "bg": "Кастор", "pl": "Kastor"},
    "61084": {"es": "Gacrux", "en": "Gacrux", "fr": "Gacrux", "de": "Gacrux", "it": "Gacrux", "nl": "Gacrux", "zh": "十字架一", "zht": "十字架一", "bg": "Гакрукс", "pl": "Gacrux"},
    "85927": {"es": "Shaula", "en": "Shaula", "fr": "Shaula", "de": "Shaula", "it": "Shaula", "nl": "Shaula", "zh": "尾宿八", "zht": "尾宿八", "bg": "Шаула", "pl": "Shaula"},
    "25336": {"es": "Bellatrix", "en": "Bellatrix", "fr": "Bellatrix", "de": "Bellatrix", "it": "Bellatrix", "nl": "Bellatrix", "zh": "参宿五", "zht": "參宿五", "bg": "Белатрикс", "pl": "Bellatrix"},
    "25428": {"es": "Elnath", "en": "Elnath", "fr": "Elnath", "de": "Elnath", "it": "Elnath", "nl": "Elnath", "zh": "五车五", "zht": "五車五", "bg": "Елнат", "pl": "Elnath"},
    "26311": {"es": "Alnilam", "en": "Alnilam", "fr": "Alnilam", "de": "Alnilam", "it": "Alnilam", "nl": "Alnilam", "zh": "参宿二", "zht": "參宿二", "bg": "Алнилам", "pl": "Alnilam"},
    "109268": {"es": "Alnair", "en": "Alnair", "fr": "Alnaïr", "de": "Alnair", "it": "Alnair", "nl": "Alnair", "zh": "鹤一", "zht": "鶴一", "bg": "Алнаир", "pl": "Alnair"},
    "26727": {"es": "Alnitak", "en": "Alnitak", "fr": "Alnitak", "de": "Alnitak", "it": "Alnitak", "nl": "Alnitak", "zh": "参宿一", "zht": "參宿一", "bg": "Алнитак", "pl": "Alnitak"},
    "62956": {"es": "Alioth", "en": "Alioth", "fr": "Alioth", "de": "Alioth", "it": "Alioth", "nl": "Alioth", "zh": "玉衡", "zht": "玉衡", "bg": "Алиот", "pl": "Alioth"},
    "15863": {"es": "Mirfak", "en": "Mirfak", "fr": "Mirfak", "de": "Mirfak", "it": "Mirfak", "nl": "Mirfak", "zh": "天船三", "zht": "天船三", "bg": "Мирфак", "pl": "Mirfak"},
    "90185": {"es": "Kaus Australis", "en": "Kaus Australis", "fr": "Kaus Australis", "de": "Kaus Australis", "it": "Kaus Australe", "nl": "Kaus Australis", "zh": "箕宿三", "zht": "箕宿三", "bg": "Каус Аустралис", "pl": "Kaus Australis"},
    "54061": {"es": "Dubhe", "en": "Dubhe", "fr": "Dubhe", "de": "Dubhe", "it": "Dubhe", "nl": "Dubhe", "zh": "天枢", "zht": "天樞", "bg": "Дубхе", "pl": "Dubhe"},
    "34444": {"es": "Wezen", "en": "Wezen", "fr": "Wezen", "de": "Wezen", "it": "Wezen", "nl": "Wezen", "zh": "弧矢一", "zht": "弧矢一", "bg": "Уезен", "pl": "Wezen"},
    "67301": {"es": "Alkaid", "en": "Alkaid", "fr": "Alkaïd", "de": "Alkaid", "it": "Alkaid", "nl": "Alkaid", "zh": "摇光", "zht": "搖光", "bg": "Алкаид", "pl": "Alkaid"},
    "41037": {"es": "Avior", "en": "Avior", "fr": "Avior", "de": "Avior", "it": "Avior", "nl": "Avior", "zh": "海石一", "zht": "海石一", "bg": "Авиор", "pl": "Avior"},
    "86228": {"es": "Sargas", "en": "Sargas", "fr": "Sargas", "de": "Sargas", "it": "Sargas", "nl": "Sargas", "zh": "尾宿五", "zht": "尾宿五", "bg": "Саргас", "pl": "Sargas"},
    "28360": {"es": "Menkalinan", "en": "Menkalinan", "fr": "Menkalinan", "de": "Menkalinan", "it": "Menkalinan", "nl": "Menkalinan", "zh": "五车三", "zht": "五車三", "bg": "Менкалинан", "pl": "Menkalinan"},
    "31681": {"es": "Alhena", "en": "Alhena", "fr": "Alhena", "de": "Alhena", "it": "Alhena", "nl": "Alhena", "zh": "井宿三", "zht": "井宿三", "bg": "Алхена", "pl": "Alhena"},
    "42913": {"es": "Alsephina", "en": "Alsephina", "fr": "Alsephina", "de": "Alsephina", "it": "Alsephina", "nl": "Alsephina", "zh": "天社三", "zht": "天社三", "bg": "Алсефина", "pl": "Alsephina"},
    "100751": {"es": "Peacock", "en": "Peacock", "fr": "Peacock", "de": "Peacock", "it": "Peacock", "nl": "Peacock", "zh": "孔雀十一", "zht": "孔雀十一", "bg": "Пийкок", "pl": "Peacock"},
    "11767": {"es": "Estrella Polar", "en": "Polaris", "fr": "Étoile polaire", "de": "Polarstern", "it": "Stella Polare", "nl": "Poolster", "zh": "北极星", "zht": "北極星", "bg": "Полярна звезда", "pl": "Gwiazda Polarna"},
    "30324": {"es": "Mirzam", "en": "Mirzam", "fr": "Mirzam", "de": "Mirzam", "it": "Mirzam", "nl": "Mirzam", "zh": "军市一", "zht": "軍市一", "bg": "Мирзам", "pl": "Mirzam"},
    "46390": {"es": "Alphard", "en": "Alphard", "fr": "Alphard", "de": "Alphard", "it": "Alphard", "nl": "Alphard", "zh": "星宿一", "zht": "星宿一", "bg": "Алфард", "pl": "Alphard"},
    "14576": {"es": "Algol", "en": "Algol", "fr": "Algol", "de": "Algol", "it": "Algol", "nl": "Algol", "zh": "大陵五", "zht": "大陵五", "bg": "Алгол", "pl": "Algol"},
    "65378": {"es": "Mizar", "en": "Mizar", "fr": "Mizar", "de": "Mizar", "it": "Mizar", "nl": "Mizar", "zh": "开阳", "zht": "開陽", "bg": "Мицар", "pl": "Mizar"},
    "17702": {"es": "Alcíone", "en": "Alcyone", "fr": "Alcyone", "de": "Alkyone", "it": "Alcione", "nl": "Alcyone", "zh": "昴宿六", "zht": "昴宿六", "bg": "Алциона", "pl": "Alkione"},
    "95947": {"es": "Albireo", "en": "Albireo", "fr": "Albireo", "de": "Albireo", "it": "Albireo", "nl": "Albireo", "zh": "辇道增七", "zht": "輦道增七", "bg": "Албирео", "pl": "Albireo"},
    "68756": {"es": "Thuban", "en": "Thuban", "fr": "Thuban", "de": "Thuban", "it": "Thuban", "nl": "Thuban", "zh": "右枢", "zht": "右樞", "bg": "Тубан", "pl": "Thuban"},
    "65477": {"es": "Alcor", "en": "Alcor", "fr": "Alcor", "de": "Alkor", "it": "Alcor", "nl": "Alcor", "zh": "辅", "zht": "輔", "bg": "Алкор", "pl": "Alkor"},
    "10826": {"es": "Mira", "en": "Mira", "fr": "Mira", "de": "Mira", "it": "Mira", "nl": "Mira", "zh": "刍藁增二", "zht": "芻藁增二", "bg": "Мира", "pl": "Mira"},
    /* sistemas dobles y variables del catalogo con nombre de la UAI (HYG v4.1) */
    "92420": {"es": "Sheliak", "en": "Sheliak", "fr": "Sheliak", "de": "Sheliak", "it": "Sheliak", "nl": "Sheliak", "zh": "渐台二", "zht": "漸台二", "bg": "Шелиак", "pl": "Sheliak"},
    "84345": {"es": "Rasalgethi", "en": "Rasalgethi", "fr": "Rasalgethi", "de": "Rasalgethi", "it": "Rasalgethi", "nl": "Rasalgethi", "zh": "帝座", "zht": "帝座", "bg": "Расалгети", "pl": "Rasalgethi"},
    "9640": {"es": "Almach", "en": "Almach", "fr": "Almach", "de": "Almach", "it": "Almach", "nl": "Almach", "zh": "天大将军一", "zht": "天大將軍一", "bg": "Алмах", "pl": "Almach"},
    "50583": {"es": "Algieba", "en": "Algieba", "fr": "Algieba", "de": "Algieba", "it": "Algieba", "nl": "Algieba", "zh": "轩辕十二", "zht": "軒轅十二", "bg": "Алгейба", "pl": "Algieba"},
    "72105": {"es": "Izar", "en": "Izar", "fr": "Izar", "de": "Izar", "it": "Izar", "nl": "Izar", "zh": "梗河一", "zht": "梗河一", "bg": "Изар", "pl": "Izar"},
    "8832": {"es": "Mesarthim", "en": "Mesarthim", "fr": "Mesarthim", "de": "Mesarthim", "it": "Mesarthim", "nl": "Mesarthim", "zh": "娄宿二", "zht": "婁宿二", "bg": "Мезартим", "pl": "Mesarthim"},
    "100064": {"es": "Algedi", "en": "Algedi", "fr": "Algedi", "de": "Algedi", "it": "Algedi", "nl": "Algedi", "zh": "牛宿二", "zht": "牛宿二", "bg": "Алгеди", "pl": "Algedi"},
    "63125": {"es": "Cor Caroli", "en": "Cor Caroli", "fr": "Cor Caroli", "de": "Cor Caroli", "it": "Cor Caroli", "nl": "Cor Caroli", "zh": "常陈一", "zht": "常陳一", "bg": "Кор Кароли", "pl": "Cor Caroli"},
    "61941": {"es": "Porrima", "en": "Porrima", "fr": "Porrima", "de": "Porrima", "it": "Porrima", "nl": "Porrima", "zh": "东上相", "zht": "東上相", "bg": "Порима", "pl": "Porrima"}
  };
  /* Las estrellas de la carta con nombre de la UAI que no estan en el
     catalogo (datos/cielo.json, nombresIAU), en chino, chino tradicional y
     bulgaro: de las traducciones de Stellarium, con la regla de CIELO_EST
     (el chino, el nombre tradicional sin el latino; el bulgaro, sin los
     acentos de pronunciacion) y seis erratas resueltas con la cultura
     celeste china de Stellarium. La escribe y la coteja tools/cielo_uai.js
     (22 de octubre de 2026): no editar a mano. Lo que Stellarium no traduce
     se queda con el nombre de la UAI, y en los demas idiomas tambien: asi
     se escribe. */
  var CIELO_UAI = {
    zh: {
      "677": "壁宿二", "746": "王良一", "1067": "壁宿一", "2081": "火鸟六", "2920": "附路", "3179": "王良四", "3419": "土司空", "3821": "王良三",
      "5348": "水委二", "5447": "奎宿九", "5737": "外屏三", "6411": "天大将军增一", "6686": "阁道三", "7097": "右更二", "7513": "天大将军六", "7607": "天大将军三",
      "8198": "右更四", "8645": "天仓四", "8796": "娄宿增六", "8886": "阁道二", "8903": "娄宿一", "9487": "外屏七", "9884": "娄宿三", "12706": "天囷八",
      "13061": "胃宿二", "13209": "胃宿三", "13268": "天船一", "13288": "天苑九", "13701": "天苑六", "13847": "天园六", "14135": "天囷一", "14668": "大陵四",
      "14838": "天阴四", "14879": "天苑增三", "15197": "天苑五", "16537": "天苑四", "17378": "天苑三", "17489": "昴宿增六", "17499": "昴宿一", "17531": "昴宿二",
      "17573": "昴宿四", "17608": "昴宿五", "17847": "昴宿七", "17851": "昴宿增十二", "18543": "天苑一", "18614": "卷舌三", "19587": "九州殊口二", "19849": "九州殊口增七",
      "20455": "毕宿三", "20889": "毕宿一", "20894": "毕宿增十三", "21594": "九斿增四", "22449": "参旗六", "23015": "五车一", "23416": "柱一", "23453": "柱二",
      "23875": "玉井三", "25606": "厕二", "25930": "参宿三", "25985": "厕一", "26207": "觜宿一", "26241": "伐三", "26451": "天关", "26634": "丈人一",
      "27366": "参宿六", "27628": "子二", "28380": "五车四", "29034": "孙二", "29655": "钺", "30122": "孙增一", "30343": "井宿一", "32246": "井宿五",
      "32362": "井宿四", "33856": "弧矢增二", "34045": "天狼增四", "34088": "井宿七", "35550": "天樽二", "35904": "弧矢二", "36188": "南河二", "37265": "北河增二",
      "38170": "弧矢增十七", "39429": "弧矢增二十二", "39757": "弧矢增三十二", "40167": "水位四", "40526": "柳宿增十", "41075": "上台增四", "41704": "内阶一", "42402": "柳宿二",
      "42911": "鬼宿四", "43109": "柳宿五", "44066": "柳宿增三", "44127": "上台一", "44471": "上台二", "44816": "天记", "44946": "轩辕增二十四", "45556": "海石二",
      "45941": "天社五", "46471": "上台增七", "46750": "轩辕八", "47431": "星宿四", "47508": "轩辕十五", "48356": "张宿一", "48455": "轩辕十", "50335": "轩辕十一",
      "50372": "中台一", "50801": "中台二", "53229": "势四", "53721": "天牢三", "53740": "翼宿一", "53910": "天璇", "54872": "西上相", "54879": "西次相",
      "55219": "下台一", "56211": "上辅", "57399": "太阳守", "57632": "五帝座一", "57757": "右执法", "58001": "天玑", "59199": "右辖", "59747": "十字架四",
      "59774": "天权", "59803": "轸宿一", "60129": "左执法", "60260": "十字架增一", "60965": "轸宿三", "61317": "常陈四", "61359": "轸宿四", "62223": "猎犬座Y",
      "62423": "内厨一", "63076": "内厨二", "63608": "东次将", "64241": "东上将", "66249": "角宿二", "67927": "右摄提一", "68933": "库楼三", "69427": "亢宿一",
      "69701": "亢宿二", "69732": "玄戈", "69974": "亢宿四", "70755": "亢宿三", "71075": "招摇", "72607": "帝", "72622": "氐宿一", "73555": "七公增五",
      "73714": "折威七", "74785": "氐宿四", "75097": "太子", "75411": "七公六", "75458": "左枢", "75695": "贯索三", "76267": "贯索四", "76333": "氐宿三",
      "77070": "蜀", "77450": "周增八", "78104": "房宿二", "78265": "房宿一", "78401": "房宿三", "78820": "房宿四", "79043": "晋", "79374": "键闭",
      "79593": "梁", "79882": "楚", "80112": "心宿一", "80331": "少宰", "80463": "斗一", "80816": "河中", "80883": "列肆二", "81266": "心宿三",
      "82396": "尾宿二", "82514": "尾宿一", "82545": "尾宿增二", "83895": "上弼", "84012": "宋", "84379": "魏", "84405": "天江二", "85670": "天棓三",
      "85693": "赵", "85696": "尾宿九", "85822": "勾陈二", "86032": "候", "86614": "女史增一", "86742": "宗正一", "86796": "塞万提斯", "87261": "傅说",
      "87585": "天棓一", "87833": "天棓四", "88635": "箕宿一", "89341": "斗宿三", "89931": "箕宿二", "90344": "扶筐增二", "90496": "斗宿二", "92761": "建增六",
      "92855": "斗宿四", "92946": "徐", "93194": "渐台三", "93506": "斗宿六", "93747": "吴越", "94114": "鳖六", "94141": "建三", "94376": "天厨一",
      "94481": "辇道二", "95241": "天渊二", "95294": "天渊一", "95347": "天渊三", "95771": "齐增五", "96100": "天厨二", "96757": "左旗一", "97165": "天津二",
      "97278": "河鼓三", "97938": "河鼓增八", "98036": "河鼓一", "98066": "狗国一", "100310": "牛宿增七", "100345": "牛宿一", "100453": "天津一", "101421": "败瓜一",
      "101769": "瓠瓜四", "101958": "瓠瓜一", "102488": "天津九", "102618": "女宿一", "104987": "虚宿二", "105199": "天钩五", "106032": "上卫增一", "106278": "虚宿一",
      "106786": "天垒城一", "106985": "垒壁阵三", "107136": "螣蛇四", "107315": "危宿三", "107556": "垒壁阵四", "108085": "败臼一", "108917": "天钩六", "109074": "危宿一",
      "109427": "危宿二", "110003": "泣二", "110395": "坟墓二", "111710": "虚梁三", "112029": "雷电一", "112122": "鹤二", "112158": "离宫四", "112748": "离宫二",
      "113136": "羽林军二十六", "113357": "室宿增一", "113881": "室宿二", "113889": "霹雳一", "113963": "室宿一", "115250": "离宫五", "115623": "离宫六", "116076": "螣蛇增九",
      "116727": "少卫增八"
    },
    zht: {
      "677": "壁宿二", "746": "王良一", "1067": "壁宿一", "2081": "火鳥六", "2920": "附路", "3179": "王良四", "3419": "土司空", "3821": "王良三",
      "4422": "造父五", "5348": "水委二", "5447": "奎宿九", "5737": "外屏三", "6411": "天大將軍增一", "6686": "閣道三", "7097": "右更二", "7513": "天大將軍六",
      "7607": "天大將軍三", "8645": "天倉四", "8796": "婁宿增六", "8886": "閣道二", "8903": "婁宿一", "9487": "外屏七", "9884": "婁宿三", "12706": "天囷八",
      "13061": "胃宿二", "13209": "胃宿三", "13268": "天船一", "13288": "天苑九", "13701": "天苑六", "13847": "天園六", "14135": "天囷一", "14668": "大陵四",
      "14838": "天陰四", "14879": "天苑增三", "15197": "天苑五", "16537": "天苑四", "17378": "天苑三", "17448": "卷舌四", "17489": "昴宿增六", "17499": "昴宿一",
      "17531": "昴宿二", "17573": "昴宿四", "17608": "昴宿五", "17847": "昴宿七", "17851": "昴宿增十二", "18543": "天苑一", "18614": "卷舌三", "19587": "九州殊口二",
      "19849": "九州殊口增七", "20205": "畢宿四", "20455": "畢宿三", "20535": "天園十三", "20889": "畢宿一", "20894": "畢宿增十三", "21393": "天園十二", "21594": "九斿增四",
      "22449": "參旗六", "23015": "五車一", "23416": "柱一", "23453": "柱二", "23875": "玉井三", "25606": "廁二", "25930": "參宿三", "25985": "廁一",
      "26207": "觜宿一", "26241": "伐三", "26451": "天關", "26634": "丈人一", "27366": "參宿六", "27628": "子二", "28380": "五車四", "29034": "孫二",
      "29655": "鉞", "30122": "孫增一", "30343": "井宿一", "32246": "井宿五", "32362": "井宿四", "34045": "天狼增四", "34088": "井宿七", "35550": "天樽二",
      "35904": "弧矢二", "36188": "南河二", "37265": "北河增二", "38170": "弧矢增十七", "39429": "弧矢增二十二", "39757": "弧矢增三十二", "40167": "水位四", "40526": "柳宿增十",
      "41075": "上台增四", "41704": "內階一", "42402": "柳宿二", "42911": "鬼宿四", "43109": "柳宿五", "44066": "柳宿增三", "44127": "上台一", "44471": "上台二",
      "44816": "天記", "44946": "軒轅增二十四", "45556": "海石二", "45941": "天社五", "46750": "軒轅八", "47431": "星宿四", "47508": "軒轅十五", "48356": "張宿一",
      "48455": "軒轅十", "50335": "軒轅十一", "50372": "中台一", "50801": "中台二", "53229": "勢四", "53721": "天牢三", "53740": "翼宿一", "53910": "天璇",
      "54872": "西上相", "54879": "西次相", "55219": "下台一", "56211": "上輔", "57399": "太陽守", "57632": "五帝座一", "57757": "右執法", "58001": "天璣",
      "59199": "右轄", "59747": "十字架四", "59774": "天權", "59803": "軫宿一", "60129": "左執法", "60965": "軫宿三", "61317": "常陳四", "61359": "軫宿四",
      "62423": "內廚一", "63076": "內廚二", "63090": "東次相", "63608": "東次將", "64241": "東上將", "66249": "角宿二", "67927": "右攝提一", "68933": "庫樓三",
      "69427": "亢宿一", "69701": "亢宿二", "69732": "玄戈", "70755": "亢宿三", "71075": "招搖", "72607": "帝", "72622": "氐宿一", "73555": "七公增五",
      "73714": "折威七", "74785": "氐宿四", "75097": "太子", "75411": "七公六", "75458": "左樞", "75695": "貫索三", "76267": "貫索四", "76333": "氐宿三",
      "77070": "蜀", "77450": "周增八", "78104": "房宿二", "78265": "房宿一", "78401": "房宿三", "78820": "房宿四", "79043": "晉", "79374": "鍵閉",
      "79593": "梁", "79882": "楚", "80112": "心宿一", "80331": "少宰", "80463": "斗一", "80816": "河中", "80883": "列肆二", "81266": "心宿三",
      "82396": "尾宿二", "82514": "尾宿一", "82545": "尾宿增二", "83895": "上弼", "84012": "宋", "84379": "魏", "84405": "天江二", "85670": "天棓三",
      "85693": "趙", "85696": "尾宿九", "85822": "勾陳二", "86032": "候", "86742": "宗正一", "87261": "傅說", "87585": "天棓一", "87833": "天棓四",
      "88635": "箕宿一", "89341": "斗宿三", "89931": "箕宿二", "90344": "扶筐增二", "90496": "斗宿二", "92761": "建增六", "92855": "斗宿四", "92946": "徐",
      "93194": "漸台三", "93506": "斗宿六", "93747": "吳越", "94141": "建三", "94376": "天廚一", "94481": "輦道二", "95241": "天淵二", "95294": "天淵一",
      "95347": "天淵三", "95771": "齊增五", "96100": "天廚二", "96757": "左旗一", "97165": "天津二", "97278": "河鼓三", "97938": "河鼓增八", "98036": "河鼓一",
      "98066": "狗國一", "100345": "牛宿一", "100453": "天津一", "101421": "敗瓜一", "101769": "瓠瓜四", "101958": "瓠瓜一", "102488": "天津九", "102618": "女宿一",
      "104987": "虛宿二", "105199": "天鉤五", "106032": "上衛增一", "106278": "虛宿一", "106786": "天壘城一", "106985": "壘壁陣三", "107136": "螣蛇四", "107315": "危宿三",
      "107556": "壘壁陣四", "108085": "敗臼一", "108917": "天鉤六", "109074": "危宿一", "109427": "危宿二", "110003": "泣二", "110395": "墳墓二", "111710": "虛梁三",
      "112029": "雷電一", "112122": "鶴二", "112158": "離宮四", "112748": "離宮二", "113136": "羽林軍二十六", "113357": "室宿增一", "113881": "室宿二", "113889": "霹靂一",
      "113963": "室宿一", "115250": "離宮五", "115623": "離宮六", "116076": "螣蛇增九", "116727": "少衛增八"
    },
    bg: {
      "677": "Алферац", "746": "Каф", "1067": "Алгениб", "2081": "Анкаа", "2920": "Фулу", "3179": "Шчедар", "3419": "Дифда", "3821": "Аширд",
      "4422": "Кастула", "5348": "Вурен", "5447": "Мирах", "5737": "Ревати", "6411": "Адил", "6686": "Рухба", "7097": "Алферг", "7513": "Титауин",
      "7607": "Нембус", "8198": "Торкулар", "8645": "Батен Кайтос", "8796": "Моталах", "8886": "Сегин", "8903": "Шаратан", "9487": "Алреша", "9884": "Хамал",
      "12706": "Кафалджидма", "13061": "Лили Борея", "13209": "Барани", "13268": "Мирам", "13288": "Ангетенар", "13701": "Ажа", "13847": "Акамар", "14135": "Менкар",
      "14668": "Мизам", "14838": "Ботейн", "14879": "Далим", "15197": "Зибал", "16537": "Ран", "17378": "Рана", "17448": "Атик", "17489": "Келаино",
      "17499": "Електра", "17531": "Тайгета", "17573": "Мая", "17608": "Меропа", "17847": "Атлас", "17851": "Плейона", "18543": "Заурак", "18614": "Менкиб",
      "19587": "Беид", "19849": "Кейд", "20205": "Прима Хядум", "20455": "Секунда Хядум", "20535": "Бимим", "20889": "Аин", "20894": "Чамукуй", "21393": "Тимин",
      "21594": "Скиптър", "22449": "Табит", "23015": "Хасалех", "23416": "Алмаз", "23453": "Саклатени", "23767": "Хедус", "23875": "Курса", "25606": "Нихал",
      "25930": "Минтака", "25985": "Арнеб", "26207": "Мейса", "26241": "Хатиса", "26451": "Тиенгуан", "26634": "Факт", "27366": "Саиф", "27628": "Уазн",
      "28380": "Махасим", "29034": "Елкуруд", "29655": "Пропус", "30122": "Фуруд", "30343": "Тейжат", "32246": "Мебсута", "32362": "Алзир", "34045": "Мулфейн",
      "34088": "Мекбуда", "35550": "Уасат", "35904": "Алудра", "36188": "Гомейса", "37265": "Дзишуей", "38170": "Азмиди", "39429": "Наос", "39757": "Турайс",
      "40167": "Тегмина", "40526": "Тарф", "41075": "Алсиаукат", "41704": "Мусцида", "42402": "Минхир", "42911": "Аселус Аустралис", "43109": "Ашлеша", "44066": "Акубенс",
      "44127": "Талита", "44471": "Алкафра", "44816": "Сухайл", "44946": "Нан", "45556": "Аспидиске", "45941": "Маркеб", "46471": "Интеркрус", "46750": "Алтерф",
      "47431": "Укда", "47508": "Субра", "48356": "Джан", "48455": "Расалас", "48615": "Фелис", "50335": "Адафера", "50372": "Таня Бореалис", "50801": "Таня Аустралис",
      "53229": "Преципуа", "53721": "Чалаван", "53740": "Алкес", "53910": "Мерак", "54872": "Зосма", "54879": "Шертан", "55219": "Алула Бореалис", "56211": "Гиаузар",
      "57399": "Тайяншоу", "57632": "Денебола", "57757": "Завиджава", "58001": "Фекда", "59199": "Алчиба", "59747": "Имай", "59774": "Мегрец", "59803": "Гиена",
      "60129": "Зания", "60260": "Гинан", "60965": "Алгораб", "61317": "Чара", "61359": "Краз", "62223": "Ла Суперба", "62423": "Тиени", "63076": "Тайи",
      "63090": "Минелаува", "63608": "Виндемиатрикс", "64241": "Диадема", "66249": "Хезе", "67927": "Муфрид", "68933": "Менкент", "69427": "Кан", "69701": "Сирма",
      "69732": "Сюенгъ", "70755": "Елгафар", "71075": "Сегинус", "71681": "Толиман", "72607": "Кохаб", "72622": "Зубенелгенуби", "73555": "Некар", "73714": "Брахиум",
      "74785": "Зубенешамали", "75097": "Феркад", "75411": "Алкалуропс", "75458": "Едазих", "75695": "Нусакан", "76267": "Алфека", "76333": "Зубенелакраби", "77070": "Унукалхай",
      "77450": "Гуджа", "78104": "Иклил", "78265": "Фан", "78401": "Дшуба", "78820": "Акраб", "79043": "Марсик", "79374": "Джабах", "79593": "Йед Приор",
      "79882": "Йед Постериор", "80112": "Алният", "80331": "Атебин", "80463": "Куджам", "80816": "Корнефорос", "80883": "Марфик", "81266": "Пайкохале", "82396": "Ларауаг",
      "82514": "Камидимура", "82545": "Пипирима", "83895": "Алдиба", "84012": "Сабик", "84379": "Зарин", "84405": "Гунибу", "85670": "Растабан", "85693": "Маазим",
      "85696": "Лесат", "85822": "Йилдун", "86032": "Расалхаге", "86614": "Дзибан", "86742": "Себалрай", "86796": "Сервантес", "87261": "Фуюе", "87585": "Грумиум",
      "87833": "Елтанин", "88635": "Алнасл", "89341": "Полис", "89931": "Каус Медия", "90344": "Фафнир", "90496": "Каус Бореалис", "92761": "Аиналрами", "92855": "Нунки",
      "92946": "Алия", "93194": "Сулафат", "93506": "Аскела", "93747": "Окаб", "94114": "Меридиана", "94141": "Албалда", "94376": "Алтаис", "94481": "Аладфар",
      "95241": "Аркаб Приор", "95294": "Аркаб Постериор", "95347": "Рукбат", "95771": "Ансер", "96100": "Алсафи", "96757": "Шам", "97165": "Фаварис", "97278": "Таразед",
      "97938": "Либертас", "98036": "Алшаин", "98066": "Теребелум", "100310": "Алшат", "100345": "Дабих", "100453": "Садр", "101421": "Алдулфин", "101769": "Ротанев",
      "101958": "Суалосин", "102488": "Алджана", "102618": "Албали", "104987": "Киталфа", "105199": "Алдерамин", "106032": "Алфирк", "106278": "Садалсууд", "106786": "Бунда",
      "106985": "Нашира", "107136": "Азелфафаг", "107315": "Ениф", "107556": "Денеб Алгеди", "108085": "Алданаб", "108917": "Курах", "109074": "Садалмелик", "109427": "Бихам",
      "110003": "Анка", "110395": "Садакбия", "111710": "Ситула", "112029": "Хомам", "112122": "Тиаки", "112158": "Матар", "112748": "Садалбари", "113136": "Скат",
      "113357": "Хелвеций", "113881": "Шеат", "113889": "Фумалсамак", "113963": "Маркаб", "115250": "Салм", "115623": "Алкараб", "116076": "Веритате", "116727": "Ерай"
    }
  };
  /* sistemas que no son una sola estrella con nombre */
  var CIELO_DOB = {
    "mizar-alcor": {"es": "Mizar y Alcor", "en": "Mizar and Alcor", "fr": "Mizar et Alcor", "de": "Mizar und Alkor", "it": "Mizar e Alcor", "nl": "Mizar en Alcor", "zh": "开阳与辅", "zht": "開陽與輔", "bg": "Мицар и Алкор", "pl": "Mizar i Alkor"},
    mizar: {"es": "Mizar A y B", "en": "Mizar A and B", "fr": "Mizar A et B", "de": "Mizar A und B", "it": "Mizar A e B", "nl": "Mizar A en B", "zh": "开阳A与B", "zht": "開陽A與B", "bg": "Мицар A и B", "pl": "Mizar A i B"},
    "eps-lyr": {"es": "La Doble Doble", "en": "The Double Double", "fr": "La Double Double", "de": "Der Doppel-Doppelstern", "it": "La Doppia Doppia", "nl": "De Dubbele Dubbel", "zh": "双双星", "zht": "雙雙星", "bg": "Двойната двойна", "pl": "Podwójna Podwójna"}
  };
  /* Sol, Luna, planetas y las lunas de Galileo, con el nombre del motor
     (Astronomy Engine) como clave */
  var CIELO_CUERPO = {
    Sun: {"es": "Sol", "en": "Sun", "fr": "Soleil", "de": "Sonne", "it": "Sole", "nl": "Zon", "zh": "太阳", "zht": "太陽", "bg": "Слънце", "pl": "Słońce"},
    Moon: {"es": "Luna", "en": "Moon", "fr": "Lune", "de": "Mond", "it": "Luna", "nl": "Maan", "zh": "月亮", "zht": "月亮", "bg": "Луна", "pl": "Księżyc"},
    Mercury: {"es": "Mercurio", "en": "Mercury", "fr": "Mercure", "de": "Merkur", "it": "Mercurio", "nl": "Mercurius", "zh": "水星", "zht": "水星", "bg": "Меркурий", "pl": "Merkury"},
    Venus: {"es": "Venus", "en": "Venus", "fr": "Vénus", "de": "Venus", "it": "Venere", "nl": "Venus", "zh": "金星", "zht": "金星", "bg": "Венера", "pl": "Wenus"},
    Mars: {"es": "Marte", "en": "Mars", "fr": "Mars", "de": "Mars", "it": "Marte", "nl": "Mars", "zh": "火星", "zht": "火星", "bg": "Марс", "pl": "Mars"},
    Jupiter: {"es": "Júpiter", "en": "Jupiter", "fr": "Jupiter", "de": "Jupiter", "it": "Giove", "nl": "Jupiter", "zh": "木星", "zht": "木星", "bg": "Юпитер", "pl": "Jowisz"},
    Saturn: {"es": "Saturno", "en": "Saturn", "fr": "Saturne", "de": "Saturn", "it": "Saturno", "nl": "Saturnus", "zh": "土星", "zht": "土星", "bg": "Сатурн", "pl": "Saturn"},
    Uranus: {"es": "Urano", "en": "Uranus", "fr": "Uranus", "de": "Uranus", "it": "Urano", "nl": "Uranus", "zh": "天王星", "zht": "天王星", "bg": "Уран", "pl": "Uran"},
    Neptune: {"es": "Neptuno", "en": "Neptune", "fr": "Neptune", "de": "Neptun", "it": "Nettuno", "nl": "Neptunus", "zh": "海王星", "zht": "海王星", "bg": "Нептун", "pl": "Neptun"},
    /* las cuatro lunas de Galileo, para el dibujo de la ficha de Jupiter */
    Io: {"es": "Ío", "en": "Io", "fr": "Io", "de": "Io", "it": "Io", "nl": "Io", "zh": "木卫一", "zht": "木衛一", "bg": "Йо", "pl": "Io"},
    Europa: {"es": "Europa", "en": "Europa", "fr": "Europe", "de": "Europa", "it": "Europa", "nl": "Europa", "zh": "木卫二", "zht": "木衛二", "bg": "Европа", "pl": "Europa"},
    Ganymede: {"es": "Ganimedes", "en": "Ganymede", "fr": "Ganymède", "de": "Ganymed", "it": "Ganimede", "nl": "Ganymedes", "zh": "木卫三", "zht": "木衛三", "bg": "Ганимед", "pl": "Ganimedes"},
    Callisto: {"es": "Calisto", "en": "Callisto", "fr": "Callisto", "de": "Kallisto", "it": "Callisto", "nl": "Callisto", "zh": "木卫四", "zht": "木衛四", "bg": "Калисто", "pl": "Kallisto"}
  };
  /* lluvias de estrellas por su codigo de la IMO */
  var CIELO_LLU = {
    QUA: {"es": "Cuadrántidas", "en": "Quadrantids", "fr": "Quadrantides", "de": "Quadrantiden", "it": "Quadrantidi", "nl": "Quadrantiden", "zh": "象限仪座流星雨", "zht": "象限儀座流星雨", "bg": "Квадрантиди", "pl": "Kwadrantydy"},
    LYR: {"es": "Líridas", "en": "Lyrids", "fr": "Lyrides", "de": "Lyriden", "it": "Liridi", "nl": "Lyriden", "zh": "天琴座流星雨", "zht": "天琴座流星雨", "bg": "Лириди", "pl": "Lirydy"},
    ETA: {"es": "Eta Acuáridas", "en": "Eta Aquariids", "fr": "Êta Aquarides", "de": "Eta-Aquariiden", "it": "Eta Aquaridi", "nl": "Eta Aquariden", "zh": "宝瓶座η流星雨", "zht": "寶瓶座η流星雨", "bg": "Ета Аквариди", "pl": "Eta Akwarydy"},
    SDA: {"es": "Delta Acuáridas del Sur", "en": "Southern Delta Aquariids", "fr": "Delta Aquarides du Sud", "de": "Südliche Delta-Aquariiden", "it": "Delta Aquaridi Australi", "nl": "Zuidelijke Delta Aquariden", "zh": "宝瓶座南δ流星雨", "zht": "寶瓶座南δ流星雨", "bg": "Южни Делта Аквариди", "pl": "Południowe Delta Akwarydy"},
    CAP: {"es": "Alfa Capricórnidas", "en": "Alpha Capricornids", "fr": "Alpha Capricornides", "de": "Alpha-Capricorniden", "it": "Alfa Capricornidi", "nl": "Alfa Capricorniden", "zh": "摩羯座α流星雨", "zht": "摩羯座α流星雨", "bg": "Алфа Каприкорниди", "pl": "Alfa Kaprikornidy"},
    PER: {"es": "Perseidas", "en": "Perseids", "fr": "Perséides", "de": "Perseiden", "it": "Perseidi", "nl": "Perseïden", "zh": "英仙座流星雨", "zht": "英仙座流星雨", "bg": "Персеиди", "pl": "Perseidy"},
    DRA: {"es": "Dracónidas", "en": "Draconids", "fr": "Draconides", "de": "Draconiden", "it": "Draconidi", "nl": "Draconiden", "zh": "天龙座流星雨", "zht": "天龍座流星雨", "bg": "Дракониди", "pl": "Drakonidy"},
    ORI: {"es": "Oriónidas", "en": "Orionids", "fr": "Orionides", "de": "Orioniden", "it": "Orionidi", "nl": "Orioniden", "zh": "猎户座流星雨", "zht": "獵戶座流星雨", "bg": "Ориониди", "pl": "Orionidy"},
    LEO: {"es": "Leónidas", "en": "Leonids", "fr": "Léonides", "de": "Leoniden", "it": "Leonidi", "nl": "Leoniden", "zh": "狮子座流星雨", "zht": "獅子座流星雨", "bg": "Леониди", "pl": "Leonidy"},
    GEM: {"es": "Gemínidas", "en": "Geminids", "fr": "Géminides", "de": "Geminiden", "it": "Geminidi", "nl": "Geminiden", "zh": "双子座流星雨", "zht": "雙子座流星雨", "bg": "Геминиди", "pl": "Geminidy"},
    URS: {"es": "Úrsidas", "en": "Ursids", "fr": "Ursides", "de": "Ursiden", "it": "Ursidi", "nl": "Ursiden", "zh": "小熊座流星雨", "zht": "小熊座流星雨", "bg": "Урсиди", "pl": "Ursydy"}
  };
  /* tipos de objeto de cielo profundo (de OpenNGC) */
  var CIELO_TIPO = {
    abi: {"es": "Cúmulo abierto", "en": "Open cluster", "fr": "Amas ouvert", "de": "Offener Sternhaufen", "it": "Ammasso aperto", "nl": "Open sterrenhoop", "zh": "疏散星团", "zht": "疏散星團", "bg": "Разсеян звезден куп", "pl": "Gromada otwarta"},
    aso: {"es": "Agrupación de estrellas", "en": "Star grouping", "fr": "Groupement d’étoiles", "de": "Sterngruppe", "it": "Raggruppamento stellare", "nl": "Stergroep", "zh": "恒星群", "zht": "恆星群", "bg": "Звездна група", "pl": "Grupa gwiazd"},
    glo: {"es": "Cúmulo globular", "en": "Globular cluster", "fr": "Amas globulaire", "de": "Kugelsternhaufen", "it": "Ammasso globulare", "nl": "Bolhoop", "zh": "球状星团", "zht": "球狀星團", "bg": "Кълбовиден звезден куп", "pl": "Gromada kulista"},
    cne: {"es": "Cúmulo con nebulosa", "en": "Cluster with nebula", "fr": "Amas avec nébuleuse", "de": "Sternhaufen mit Nebel", "it": "Ammasso con nebulosa", "nl": "Sterrenhoop met nevel", "zh": "星团与星云", "zht": "星團與星雲", "bg": "Звезден куп с мъглявина", "pl": "Gromada z mgławicą"},
    neb: {"es": "Nebulosa", "en": "Nebula", "fr": "Nébuleuse", "de": "Nebel", "it": "Nebulosa", "nl": "Nevel", "zh": "星云", "zht": "星雲", "bg": "Мъглявина", "pl": "Mgławica"},
    snr: {"es": "Resto de supernova", "en": "Supernova remnant", "fr": "Rémanent de supernova", "de": "Supernovaüberrest", "it": "Resto di supernova", "nl": "Supernovarest", "zh": "超新星遗迹", "zht": "超新星遺跡", "bg": "Остатък от свръхнова", "pl": "Pozostałość po supernowej"},
    pla: {"es": "Nebulosa planetaria", "en": "Planetary nebula", "fr": "Nébuleuse planétaire", "de": "Planetarischer Nebel", "it": "Nebulosa planetaria", "nl": "Planetaire nevel", "zh": "行星状星云", "zht": "行星狀星雲", "bg": "Планетарна мъглявина", "pl": "Mgławica planetarna"},
    osc: {"es": "Nebulosa oscura", "en": "Dark nebula", "fr": "Nébuleuse obscure", "de": "Dunkelwolke", "it": "Nebulosa oscura", "nl": "Donkere nevel", "zh": "暗星云", "zht": "暗星雲", "bg": "Тъмна мъглявина", "pl": "Ciemna mgławica"},
    gal: {"es": "Galaxia", "en": "Galaxy", "fr": "Galaxie", "de": "Galaxie", "it": "Galassia", "nl": "Sterrenstelsel", "zh": "星系", "zht": "星系", "bg": "Галактика", "pl": "Galaktyka"},
    dob: {"es": "Estrella doble", "en": "Double star", "fr": "Étoile double", "de": "Doppelstern", "it": "Stella doppia", "nl": "Dubbelster", "zh": "双星", "zht": "雙星", "bg": "Двойна звезда", "pl": "Gwiazda podwójna"},
    ast: {"es": "Asterismo", "en": "Asterism", "fr": "Astérisme", "de": "Asterismus", "it": "Asterismo", "nl": "Asterisme", "zh": "星群", "zht": "星群", "bg": "Астеризъм", "pl": "Asteryzm"}
  };
  /* nombres corrientes de objetos de cielo profundo */
  var CIELO_OBJ = {
    M1: {"es": "Nebulosa del Cangrejo", "en": "Crab Nebula", "fr": "Nébuleuse du Crabe", "de": "Krebsnebel", "it": "Nebulosa del Granchio", "nl": "Krabnevel", "zh": "蟹状星云", "zht": "蟹狀星雲", "bg": "Мъглявината Рак", "pl": "Mgławica Kraba"},
    M6: {"es": "Cúmulo de la Mariposa", "en": "Butterfly Cluster", "fr": "Amas du Papillon", "de": "Schmetterlingshaufen", "it": "Ammasso della Farfalla", "nl": "Vlindercluster", "zh": "蝴蝶星团", "zht": "蝴蝶星團", "bg": "Звездният куп Пеперуда", "pl": "Gromada Motyl"},
    M7: {"es": "Cúmulo de Ptolomeo", "en": "Ptolemy Cluster", "fr": "Amas de Ptolémée", "de": "Ptolemäus-Haufen", "it": "Ammasso di Tolomeo", "nl": "Ptolemaeuscluster", "zh": "托勒密星团", "zht": "托勒密星團", "bg": "Звездният куп на Птолемей", "pl": "Gromada Ptolemeusza"},
    M8: {"es": "Nebulosa de la Laguna", "en": "Lagoon Nebula", "fr": "Nébuleuse de la Lagune", "de": "Lagunennebel", "it": "Nebulosa Laguna", "nl": "Lagunenevel", "zh": "礁湖星云", "zht": "礁湖星雲", "bg": "Мъглявината Лагуна", "pl": "Mgławica Laguna"},
    M11: {"es": "Cúmulo del Pato Salvaje", "en": "Wild Duck Cluster", "fr": "Amas du Canard sauvage", "de": "Wildentenhaufen", "it": "Ammasso dell’Anatra Selvatica", "nl": "Wilde-Eendcluster", "zh": "野鸭星团", "zht": "野鴨星團", "bg": "Звездният куп Дива патица", "pl": "Gromada Dzika Kaczka"},
    M13: {"es": "Gran Cúmulo de Hércules", "en": "Great Hercules Cluster", "fr": "Grand amas d’Hercule", "de": "Herkuleshaufen", "it": "Ammasso di Ercole", "nl": "Herculescluster", "zh": "武仙座大球状星团", "zht": "武仙座大球狀星團", "bg": "Големият куп в Херкулес", "pl": "Wielka Gromada w Herkulesie"},
    M16: {"es": "Nebulosa del Águila", "en": "Eagle Nebula", "fr": "Nébuleuse de l’Aigle", "de": "Adlernebel", "it": "Nebulosa Aquila", "nl": "Adelaarnevel", "zh": "鹰状星云", "zht": "老鷹星雲", "bg": "Мъглявината Орел", "pl": "Mgławica Orzeł"},
    M17: {"es": "Nebulosa Omega (del Cisne)", "en": "Omega Nebula", "fr": "Nébuleuse Oméga", "de": "Omeganebel", "it": "Nebulosa Omega", "nl": "Omeganevel", "zh": "ω星云", "zht": "ω星雲", "bg": "Мъглявината Омега", "pl": "Mgławica Omega"},
    M20: {"es": "Nebulosa Trífida", "en": "Trifid Nebula", "fr": "Nébuleuse Trifide", "de": "Trifidnebel", "it": "Nebulosa Trifida", "nl": "Trifidnevel", "zh": "三叶星云", "zht": "三裂星雲", "bg": "Мъглявината Трифид", "pl": "Mgławica Trójdzielna"},
    M24: {"es": "Pequeña Nube Estelar de Sagitario", "en": "Small Sagittarius Star Cloud", "fr": "Petit nuage stellaire du Sagittaire", "de": "Kleine Sagittarius-Sternwolke", "it": "Piccola Nube del Sagittario", "nl": "Kleine Sterrenwolk in de Boogschutter", "zh": "人马座小恒星云", "zht": "人馬座小恆星雲", "bg": "Малкият звезден облак в Стрелец", "pl": "Mały Obłok Gwiazd w Strzelcu"},
    M27: {"es": "Nebulosa Dumbbell", "en": "Dumbbell Nebula", "fr": "Nébuleuse de l’Haltère", "de": "Hantelnebel", "it": "Nebulosa Manubrio", "nl": "Halternevel", "zh": "哑铃星云", "zht": "啞鈴星雲", "bg": "Мъглявината Гира", "pl": "Mgławica Hantle"},
    M31: {"es": "Galaxia de Andrómeda", "en": "Andromeda Galaxy", "fr": "Galaxie d’Andromède", "de": "Andromedagalaxie", "it": "Galassia di Andromeda", "nl": "Andromedanevel", "zh": "仙女座星系", "zht": "仙女座星系", "bg": "Галактиката Андромеда", "pl": "Galaktyka Andromedy"},
    M33: {"es": "Galaxia del Triángulo", "en": "Triangulum Galaxy", "fr": "Galaxie du Triangle", "de": "Dreiecksgalaxie", "it": "Galassia del Triangolo", "nl": "Driehoeksnevel", "zh": "三角座星系", "zht": "三角座星系", "bg": "Галактиката Триъгълник", "pl": "Galaktyka Trójkąta"},
    M42: {"es": "Gran Nebulosa de Orión", "en": "Orion Nebula", "fr": "Grande nébuleuse d’Orion", "de": "Orionnebel", "it": "Nebulosa di Orione", "nl": "Orionnevel", "zh": "猎户座大星云", "zht": "獵戶座大星雲", "bg": "Мъглявината Орион", "pl": "Wielka Mgławica Oriona"},
    M44: {"es": "Cúmulo del Pesebre", "en": "Beehive Cluster", "fr": "Amas de la Ruche", "de": "Krippe", "it": "Presepe", "nl": "Kribbe", "zh": "蜂巢星团", "zht": "蜂巢星團", "bg": "Ясли", "pl": "Żłóbek"},
    M45: {"es": "Pléyades", "en": "Pleiades", "fr": "Pléiades", "de": "Plejaden", "it": "Pleiadi", "nl": "Plejaden", "zh": "昴星团", "zht": "昴宿星團", "bg": "Плеядите", "pl": "Plejady"},
    M51: {"es": "Galaxia del Remolino", "en": "Whirlpool Galaxy", "fr": "Galaxie du Tourbillon", "de": "Whirlpool-Galaxie", "it": "Galassia Vortice", "nl": "Draaikolkstelsel", "zh": "涡状星系", "zht": "渦狀星系", "bg": "Галактиката Водовъртеж", "pl": "Galaktyka Wir"},
    M57: {"es": "Nebulosa del Anillo", "en": "Ring Nebula", "fr": "Nébuleuse de l’Anneau", "de": "Ringnebel", "it": "Nebulosa Anello", "nl": "Ringnevel", "zh": "环状星云", "zht": "環狀星雲", "bg": "Мъглявината Пръстен", "pl": "Mgławica Pierścień"},
    M63: {"es": "Galaxia del Girasol", "en": "Sunflower Galaxy", "fr": "Galaxie du Tournesol", "de": "Sonnenblumengalaxie", "it": "Galassia Girasole", "nl": "Zonnebloemstelsel", "zh": "向日葵星系", "zht": "向日葵星系", "bg": "Галактиката Слънчоглед", "pl": "Galaktyka Słonecznik"},
    M64: {"es": "Galaxia del Ojo Negro", "en": "Black Eye Galaxy", "fr": "Galaxie de l’Œil noir", "de": "Galaxie Schwarzes Auge", "it": "Galassia Occhio Nero", "nl": "Zwarte-Oogstelsel", "zh": "黑眼星系", "zht": "黑眼星系", "bg": "Галактиката Черно око", "pl": "Galaktyka Czarne Oko"},
    M76: {"es": "Pequeña Nebulosa Dumbbell", "en": "Little Dumbbell Nebula", "fr": "Petite Haltère", "de": "Kleiner Hantelnebel", "it": "Piccola Nebulosa Manubrio", "nl": "Kleine Halternevel", "zh": "小哑铃星云", "zht": "小啞鈴星雲", "bg": "Малката мъглявина Гира", "pl": "Mała Mgławica Hantle"},
    M81: {"es": "Galaxia de Bode", "en": "Bode’s Galaxy", "fr": "Galaxie de Bode", "de": "Bodes Galaxie", "it": "Galassia di Bode", "nl": "Bodes Stelsel", "zh": "波德星系", "zht": "波德星系", "bg": "Галактиката на Боде", "pl": "Galaktyka Bodego"},
    M82: {"es": "Galaxia del Cigarro", "en": "Cigar Galaxy", "fr": "Galaxie du Cigare", "de": "Zigarrengalaxie", "it": "Galassia Sigaro", "nl": "Sigaarstelsel", "zh": "雪茄星系", "zht": "雪茄星系", "bg": "Галактиката Пура", "pl": "Galaktyka Cygaro"},
    M83: {"es": "Galaxia del Molinillo Austral", "en": "Southern Pinwheel Galaxy", "fr": "Galaxie du Moulinet austral", "de": "Südliche Feuerradgalaxie", "it": "Galassia Girandola del Sud", "nl": "Zuidelijk Windmolenstelsel", "zh": "南风车星系", "zht": "南風車星系", "bg": "Южната въртележка", "pl": "Galaktyka Południowy Wiatraczek"},
    M87: {"es": "Virgo A", "en": "Virgo A", "fr": "Virgo A", "de": "Virgo A", "it": "Virgo A", "nl": "Virgo A", "zh": "室女座A", "zht": "室女座A", "bg": "Дева A", "pl": "Virgo A"},
    M97: {"es": "Nebulosa del Búho", "en": "Owl Nebula", "fr": "Nébuleuse du Hibou", "de": "Eulennebel", "it": "Nebulosa Gufo", "nl": "Uilnevel", "zh": "夜枭星云", "zht": "貓頭鷹星雲", "bg": "Мъглявината Бухал", "pl": "Mgławica Sowa"},
    M101: {"es": "Galaxia del Molinete", "en": "Pinwheel Galaxy", "fr": "Galaxie du Moulinet", "de": "Feuerradgalaxie", "it": "Galassia Girandola", "nl": "Windmolenstelsel", "zh": "风车星系", "zht": "風車星系", "bg": "Галактиката Въртележка", "pl": "Galaktyka Wiatraczek"},
    M104: {"es": "Galaxia del Sombrero", "en": "Sombrero Galaxy", "fr": "Galaxie du Sombrero", "de": "Sombrerogalaxie", "it": "Galassia Sombrero", "nl": "Sombrerostelsel", "zh": "草帽星系", "zht": "草帽星系", "bg": "Галактиката Сомбреро", "pl": "Galaktyka Sombrero"},
    C4: {"es": "Nebulosa del Iris", "en": "Iris Nebula", "fr": "Nébuleuse de l’Iris", "de": "Irisnebel", "it": "Nebulosa Iris", "nl": "Irisnevel", "zh": "鸢尾花星云", "zht": "鳶尾花星雲", "bg": "Мъглявината Ирис", "pl": "Mgławica Irys"},
    C6: {"es": "Nebulosa Ojo de Gato", "en": "Cat’s Eye Nebula", "fr": "Nébuleuse de l’Œil de chat", "de": "Katzenaugennebel", "it": "Nebulosa Occhio di Gatto", "nl": "Kattenoognevel", "zh": "猫眼星云", "zht": "貓眼星雲", "bg": "Мъглявината Котешко око", "pl": "Mgławica Kocie Oko"},
    C9: {"es": "Nebulosa de la Cueva", "en": "Cave Nebula", "fr": "Nébuleuse de la Grotte", "de": "Höhlennebel", "it": "Nebulosa Grotta", "nl": "Grotnevel", "zh": "洞穴星云", "zht": "洞穴星雲", "bg": "Мъглявината Пещера", "pl": "Mgławica Jaskinia"},
    C11: {"es": "Nebulosa de la Burbuja", "en": "Bubble Nebula", "fr": "Nébuleuse de la Bulle", "de": "Blasennebel", "it": "Nebulosa Bolla", "nl": "Bellennevel", "zh": "气泡星云", "zht": "氣泡星雲", "bg": "Мъглявината Мехур", "pl": "Mgławica Bańka"},
    C12: {"es": "Galaxia de los Fuegos Artificiales", "en": "Fireworks Galaxy", "fr": "Galaxie des Feux d’artifice", "de": "Feuerwerksgalaxie", "it": "Galassia Fuochi d’Artificio", "nl": "Vuurwerkstelsel", "zh": "烟花星系", "zht": "煙火星系", "bg": "Галактиката Фойерверки", "pl": "Galaktyka Fajerwerk"},
    C13: {"es": "Cúmulo del Búho", "en": "Owl Cluster", "fr": "Amas du Hibou", "de": "Eulenhaufen", "it": "Ammasso Civetta", "nl": "Uilcluster", "zh": "猫头鹰星团", "zht": "貓頭鷹星團", "bg": "Купът Бухал", "pl": "Gromada Sowa"},
    C14: {"es": "Doble Cúmulo de Perseo", "en": "Double Cluster", "fr": "Double amas de Persée", "de": "Doppelsternhaufen", "it": "Doppio Ammasso di Perseo", "nl": "Dubbele Sterrenhoop", "zh": "英仙座双星团", "zht": "英仙座雙星團", "bg": "Двойният куп в Персей", "pl": "Podwójna Gromada w Perseuszu"},
    C19: {"es": "Nebulosa del Capullo", "en": "Cocoon Nebula", "fr": "Nébuleuse du Cocon", "de": "Kokonnebel", "it": "Nebulosa Bozzolo", "nl": "Cocon-nevel", "zh": "茧状星云", "zht": "繭狀星雲", "bg": "Мъглявината Пашкул", "pl": "Mgławica Kokon"},
    C20: {"es": "Nebulosa Norteamérica", "en": "North America Nebula", "fr": "Nébuleuse de l’Amérique du Nord", "de": "Nordamerikanebel", "it": "Nebulosa Nord America", "nl": "Noord-Amerikanevel", "zh": "北美洲星云", "zht": "北美洲星雲", "bg": "Мъглявината Северна Америка", "pl": "Mgławica Ameryka Północna"},
    C22: {"es": "Bola de Nieve Azul", "en": "Blue Snowball", "fr": "Boule de neige bleue", "de": "Blauer Schneeball", "it": "Palla di Neve Blu", "nl": "Blauwe Sneeuwbal", "zh": "蓝雪球星云", "zht": "藍雪球星雲", "bg": "Синята снежна топка", "pl": "Niebieska Śnieżka"},
    C27: {"es": "Nebulosa Creciente", "en": "Crescent Nebula", "fr": "Nébuleuse du Croissant", "de": "Sichelnebel", "it": "Nebulosa Crescente", "nl": "Sikkelnevel", "zh": "眉月星云", "zht": "眉月星雲", "bg": "Мъглявината Полумесец", "pl": "Mgławica Półksiężyc"},
    C31: {"es": "Nebulosa de la Estrella Flameante", "en": "Flaming Star Nebula", "fr": "Nébuleuse de l’Étoile flamboyante", "de": "Flammensternnebel", "it": "Nebulosa Stella Fiammeggiante", "nl": "Vlammende-Sternevel", "zh": "火焰之星星云", "zht": "火焰之星星雲", "bg": "Мъглявината Пламтяща звезда", "pl": "Mgławica Płonąca Gwiazda"},
    C33: {"es": "Velo del Cisne (este)", "en": "Eastern Veil Nebula", "fr": "Dentelles du Cygne (est)", "de": "Östlicher Schleiernebel", "it": "Velo del Cigno orientale", "nl": "Oostelijke Sluiernevel", "zh": "东面纱星云", "zht": "東面紗星雲", "bg": "Мъглявината Воал (изток)", "pl": "Mgławica Welon (wschodnia)"},
    C34: {"es": "Velo del Cisne (oeste)", "en": "Western Veil Nebula", "fr": "Dentelles du Cygne (ouest)", "de": "Westlicher Schleiernebel", "it": "Velo del Cigno occidentale", "nl": "Westelijke Sluiernevel", "zh": "西面纱星云", "zht": "西面紗星雲", "bg": "Мъглявината Воал (запад)", "pl": "Mgławica Welon (zachodnia)"},
    C38: {"es": "Galaxia de la Aguja", "en": "Needle Galaxy", "fr": "Galaxie de l’Aiguille", "de": "Nadelgalaxie", "it": "Galassia Ago", "nl": "Naaldstelsel", "zh": "针状星系", "zht": "針狀星系", "bg": "Галактиката Игла", "pl": "Galaktyka Igła"},
    C39: {"es": "Nebulosa Esquimal", "en": "Eskimo Nebula", "fr": "Nébuleuse de l’Esquimau", "de": "Eskimonebel", "it": "Nebulosa Eschimese", "nl": "Eskimonevel", "zh": "爱斯基摩星云", "zht": "愛斯基摩星雲", "bg": "Мъглявината Ескимос", "pl": "Mgławica Eskimos"},
    C41: {"es": "Híades", "en": "Hyades", "fr": "Hyades", "de": "Hyaden", "it": "Iadi", "nl": "Hyaden", "zh": "毕星团", "zht": "畢宿星團", "bg": "Хиадите", "pl": "Hiady"},
    C46: {"es": "Nebulosa Variable de Hubble", "en": "Hubble’s Variable Nebula", "fr": "Nébuleuse variable de Hubble", "de": "Hubbles Veränderlicher Nebel", "it": "Nebulosa Variabile di Hubble", "nl": "Hubbles Variabele Nevel", "zh": "哈勃变光星云", "zht": "哈伯變光星雲", "bg": "Променливата мъглявина на Хъбъл", "pl": "Zmienna Mgławica Hubble’a"},
    C49: {"es": "Nebulosa Roseta", "en": "Rosette Nebula", "fr": "Nébuleuse de la Rosette", "de": "Rosettennebel", "it": "Nebulosa Rosetta", "nl": "Rozetnevel", "zh": "玫瑰星云", "zht": "玫瑰星雲", "bg": "Мъглявината Розетка", "pl": "Mgławica Rozeta"},
    C53: {"es": "Galaxia del Huso", "en": "Spindle Galaxy", "fr": "Galaxie du Fuseau", "de": "Spindelgalaxie", "it": "Galassia del Fuso", "nl": "Spoelstelsel", "zh": "纺锤星系", "zht": "紡錘星系", "bg": "Галактиката Вретено", "pl": "Galaktyka Wrzeciono"},
    C55: {"es": "Nebulosa de Saturno", "en": "Saturn Nebula", "fr": "Nébuleuse Saturne", "de": "Saturnnebel", "it": "Nebulosa Saturno", "nl": "Saturnusnevel", "zh": "土星状星云", "zht": "土星狀星雲", "bg": "Мъглявината Сатурн", "pl": "Mgławica Saturn"},
    C57: {"es": "Galaxia de Barnard", "en": "Barnard’s Galaxy", "fr": "Galaxie de Barnard", "de": "Barnards Galaxie", "it": "Galassia di Barnard", "nl": "Barnards Stelsel", "zh": "巴纳德星系", "zht": "巴納德星系", "bg": "Галактиката на Барнард", "pl": "Galaktyka Barnarda"},
    C58: {"es": "Cúmulo de Caroline", "en": "Caroline’s Cluster", "fr": "Amas de Caroline", "de": "Carolines Haufen", "it": "Ammasso di Caroline", "nl": "Carolines Sterrenhoop", "zh": "卡罗琳星团", "zht": "卡羅琳星團", "bg": "Купът на Каролина", "pl": "Gromada Karoliny"},
    C59: {"es": "Fantasma de Júpiter", "en": "Ghost of Jupiter", "fr": "Fantôme de Jupiter", "de": "Jupitergeist", "it": "Fantasma di Giove", "nl": "Geest van Jupiter", "zh": "木魂星云", "zht": "木魂星雲", "bg": "Призракът на Юпитер", "pl": "Duch Jowisza"},
    C63: {"es": "Nebulosa de la Hélice", "en": "Helix Nebula", "fr": "Nébuleuse de l’Hélice", "de": "Helixnebel", "it": "Nebulosa Elica", "nl": "Helixnevel", "zh": "螺旋星云", "zht": "螺旋星雲", "bg": "Мъглявината Охлюв", "pl": "Mgławica Ślimak"},
    C65: {"es": "Galaxia del Escultor", "en": "Sculptor Galaxy", "fr": "Galaxie du Sculpteur", "de": "Sculptor-Galaxie", "it": "Galassia dello Scultore", "nl": "Beeldhouwerstelsel", "zh": "玉夫座星系", "zht": "玉夫座星系", "bg": "Галактиката Скулптор", "pl": "Galaktyka w Rzeźbiarzu"},
    C69: {"es": "Nebulosa del Insecto", "en": "Bug Nebula", "fr": "Nébuleuse de l’Insecte", "de": "Käfernebel", "it": "Nebulosa Insetto", "nl": "Insectennevel", "zh": "小虫星云", "zht": "小蟲星雲", "bg": "Мъглявината Буболечка", "pl": "Mgławica Pluskwa"},
    C77: {"es": "Centauro A", "en": "Centaurus A", "fr": "Centaurus A", "de": "Centaurus A", "it": "Centaurus A", "nl": "Centaurus A", "zh": "半人马座A", "zht": "半人馬座A", "bg": "Кентавър A", "pl": "Centaurus A"},
    C80: {"es": "ω Centauri", "en": "ω Centauri", "fr": "ω Centauri", "de": "ω Centauri", "it": "ω Centauri", "nl": "ω Centauri", "zh": "半人马座ω星团", "zht": "半人馬座ω星團", "bg": "Омега Кентавър", "pl": "ω Centauri"},
    B33: {"es": "Nebulosa Cabeza de Caballo", "en": "Horsehead Nebula", "fr": "Nébuleuse de la Tête de Cheval", "de": "Pferdekopfnebel", "it": "Nebulosa Testa di Cavallo", "nl": "Paardenkopnevel", "zh": "马头星云", "zht": "馬頭星雲", "bg": "Мъглявината Конска глава", "pl": "Mgławica Koński Łeb"},
    Cl399: {"es": "La Percha (cúmulo de Brocchi)", "en": "Coathanger (Brocchi’s Cluster)", "fr": "Cintre (amas de Brocchi)", "de": "Kleiderbügel (Brocchis Haufen)", "it": "Attaccapanni (ammasso di Brocchi)", "nl": "Kapstok (cluster van Brocchi)", "zh": "衣架星团", "zht": "衣架星團", "bg": "Закачалката (куп на Броки)", "pl": "Wieszak (gromada Brocchiego)"},
    Mel111: {"es": "Cúmulo de la Cabellera de Berenice", "en": "Coma Star Cluster", "fr": "Amas de la Chevelure de Bérénice", "de": "Coma-Berenices-Haufen", "it": "Ammasso della Chioma di Berenice", "nl": "Coma-sterrenhoop", "zh": "后发座星团", "zht": "后髮座星團", "bg": "Купът в Косите на Вероника", "pl": "Gromada w Warkoczu Bereniki"}
  };
  /* una o dos frases de contexto, solo hechos estables */
  var CIELO_DESC = {
    /* NASA, Hubble Messier Catalog, Messier 31: «the nearest major galaxy», «2.5 million
       light-years», «easily visible with the unaided eye from a dark sky site».
       https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/ */
    M31: {"es": "La gran galaxia más cercana a la nuestra, a unos 2,5 millones de años luz. Desde un cielo oscuro se ve a simple vista.", "en": "The nearest large galaxy to ours, about 2.5 million light-years away. From a dark site you can see it with the naked eye.", "fr": "La grande galaxie la plus proche de la nôtre, à environ 2,5 millions d’années-lumière. Sous un ciel noir, elle se voit à l’œil nu.", "de": "Die nächste große Galaxie, etwa 2,5 Millionen Lichtjahre entfernt. Unter dunklem Himmel sieht man sie mit bloßem Auge.", "it": "La grande galassia più vicina alla nostra, a circa 2,5 milioni di anni luce. Sotto un cielo buio si vede a occhio nudo.", "nl": "Het dichtstbijzijnde grote sterrenstelsel, op ongeveer 2,5 miljoen lichtjaar. Onder een donkere hemel ziet u het met het blote oog.", "zh": "离我们最近的大星系，距离约250万光年。在黑暗的夜空下肉眼可见。", "zht": "離我們最近的大星系，距離約250萬光年。在黑暗的夜空下肉眼可見。", "bg": "Най-близката до нас голяма галактика, на около 2,5 милиона светлинни години. При тъмно небе се вижда с просто око.", "pl": "Najbliższa nam duża galaktyka, odległa o około 2,5 miliona lat świetlnych. Pod ciemnym niebem widać ją gołym okiem."},
    /* Sky & Telescope, «Observing the Great Orion Nebula»: «the fuzzy star in the middle
       of the Sword», «binoculars can frame the Orion Nebula», «a prolific cradle of starbirth».
       https://skyandtelescope.org/observing/celestial-objects-to-watch/observing-the-great-orion-nebula/ */
    M42: {"es": "Una nube donde están naciendo estrellas, en la espada de Orión: a simple vista es una mancha difusa y con prismáticos ya se ve la nebulosa.", "en": "A cloud where stars are being born, in Orion’s sword: a fuzzy patch to the naked eye, and the nebula already shows in binoculars.", "fr": "Un nuage où naissent des étoiles, dans l’épée d’Orion : une tache floue à l’œil nu, et la nébuleuse se voit déjà aux jumelles.", "de": "Eine Wolke, in der Sterne entstehen, im Schwert des Orion: mit bloßem Auge ein Nebelfleck, im Fernglas sieht man schon den Nebel.", "it": "Una nube dove stanno nascendo stelle, nella spada di Orione: a occhio nudo è una macchia sfocata e con il binocolo si vede già la nebulosa.", "nl": "Een wolk waarin sterren ontstaan, in het zwaard van Orion: met het blote oog een vaag vlekje, en met een verrekijker ziet u de nevel al.", "zh": "猎户座宝剑处的恒星诞生区：肉眼看是一团模糊的光斑，用双筒望远镜就能看出星云。", "zht": "獵戶座寶劍處的恆星誕生區：肉眼看是一團模糊的光斑，用雙筒望遠鏡就能看出星雲。", "bg": "Облак, в който се раждат звезди, в меча на Орион: с просто око е мъгливо петно, а с бинокъл вече се вижда мъглявината.", "pl": "Obłok, w którym rodzą się gwiazdy, w mieczu Oriona: gołym okiem to mglista plamka, a przez lornetkę widać już mgławicę."},
    /* Royal Museums Greenwich, «What are the Pleiades?»: «relatively young... around 100
       million years», «only six usually visible to most people with the naked eye»; con
       prismaticos, «take in the entire cluster at once».
       https://www.rmg.co.uk/stories/space-astronomy/what-are-pleiades */
    M45: {"es": "Estrellas jóvenes, de unos cien millones de años. A simple vista casi todo el mundo distingue seis, y con prismáticos se ve el cúmulo entero.", "en": "Young stars, about a hundred million years old. Most people make out six with the naked eye, and binoculars take in the whole cluster.", "fr": "Des étoiles jeunes, d’environ cent millions d’années. À l’œil nu, la plupart des gens en distinguent six, et les jumelles embrassent l’amas entier.", "de": "Junge Sterne, etwa hundert Millionen Jahre alt. Mit bloßem Auge erkennen die meisten sechs, und das Fernglas zeigt den ganzen Haufen.", "it": "Stelle giovani, di circa cento milioni di anni. A occhio nudo quasi tutti ne distinguono sei, e il binocolo abbraccia l’ammasso intero.", "nl": "Jonge sterren, zo’n honderd miljoen jaar oud. Met het blote oog onderscheiden de meeste mensen er zes, en een verrekijker toont de hele sterrenhoop.", "zh": "由年轻恒星组成，年龄约一亿年。多数人肉眼能分辨出六颗，用双筒望远镜能看到整个星团。", "zht": "由年輕恆星組成，年齡約一億年。多數人肉眼能分辨出六顆，用雙筒望遠鏡能看到整個星團。", "bg": "Млади звезди, на около сто милиона години. С просто око повечето хора различават шест, а с бинокъл се вижда целият куп.", "pl": "Młode gwiazdy, liczące około stu milionów lat. Gołym okiem większość ludzi dostrzega sześć, a lornetka obejmuje całą gromadę."},
    /* ESA/Hubble, heic0809a: «the largest and brightest globular cluster in the sky».
       https://esahubble.org/images/heic0809a/ · Desde Izaña (28,3° N; dec. −47,5°) no
       pasa de unos 14° de altura: lo calcula datos/cielo.json (alt). */
    C80: {"es": "El cúmulo globular más grande y brillante del cielo. Desde Tenerife pasa bajo, por el sur: hace falta el horizonte sur despejado.", "en": "The largest and brightest globular cluster in the sky. From Tenerife it passes low in the south: you need a clear southern horizon.", "fr": "Le plus grand et le plus brillant amas globulaire du ciel. Depuis Tenerife, il passe bas au sud : il faut un horizon sud dégagé.", "de": "Der größte und hellste Kugelsternhaufen am Himmel. Von Teneriffa aus zieht er tief im Süden vorbei: Man braucht freie Sicht nach Süden.", "it": "L’ammasso globulare più grande e luminoso del cielo. Da Tenerife passa basso a sud: serve l’orizzonte sud libero.", "nl": "De grootste en helderste bolhoop aan de hemel. Vanaf Tenerife komt hij laag in het zuiden langs: u hebt een vrije zuidelijke horizon nodig.", "zh": "全天最大、最亮的球状星团。在特内里费它在南方低空经过，需要南方地平线开阔无遮挡。", "zht": "全天最大、最亮的球狀星團。在特內里費它在南方低空經過，需要南方地平線開闊無遮擋。", "bg": "Най-големият и най-ярък кълбовиден куп на небето. От Тенерифе минава ниско на юг: нужен е открит южен хоризонт.", "pl": "Największa i najjaśniejsza gromada kulista na niebie. Z Teneryfy przechodzi nisko na południu: potrzebny jest odsłonięty południowy horyzont."},
    /* Sky & Telescope, «An ancient eye test: Mizar and Alcor»: «this double star was used
       as a test to understand if someone had vision problems».
       https://skyandtelescope.org/online-gallery/an-ancient-eye-test-mizar-and-alcor/ */
    "d-mizar-alcor": {"es": "En el mango del Carro, la Osa Mayor: dos estrellas que se separan a simple vista, tradicionalmente una prueba de vista.", "en": "In the handle of the Big Dipper: two stars you can split by eye, traditionally a test of eyesight.", "fr": "Dans le manche de la Grande Casserole : deux étoiles séparables à l’œil nu, traditionnellement un test de vue.", "de": "In der Deichsel des Großen Wagens: zwei Sterne, die man mit bloßem Auge trennt, traditionell ein Sehtest.", "it": "Nel manico del Grande Carro: due stelle che si separano a occhio nudo, tradizionalmente una prova di vista.", "nl": "In de steel van de Grote Beer: twee sterren die u met het blote oog uit elkaar ziet, van oudsher een test voor de ogen.", "zh": "位于北斗七星的斗柄：肉眼即可分辨的两颗星，传统上被用来测试视力。", "zht": "位於北斗七星的斗柄：肉眼即可分辨的兩顆星，傳統上被用來測試視力。", "bg": "В дръжката на Голямата кола: две звезди, които се различават с просто око, по традиция проверка на зрението.", "pl": "W dyszlu Wielkiego Wozu: dwie gwiazdy rozróżnialne gołym okiem, tradycyjnie test wzroku."},
    /* Sky & Telescope, «Seeing double»: «a rich golden orange... clear sapphire blue»,
       «these heavenly hues are real — they’re not just a contrast effect», «even a
       2-inch-aperture scope at 25× resolves it». https://skyandtelescope.org/observing/seeing-double */
    "d-albireo": {"es": "Una estrella naranja dorada y otra azul, y los colores son de verdad, no un efecto del contraste. Un telescopio pequeño ya las separa.", "en": "A golden-orange star and a blue one, and the colours are real, not a contrast effect. Even a small telescope splits them.", "fr": "Une étoile orange doré et une bleue, et les couleurs sont réelles, pas un effet de contraste. Un petit télescope suffit à les séparer.", "de": "Ein goldorangefarbener und ein blauer Stern, und die Farben sind echt, kein Kontrasteffekt. Schon ein kleines Teleskop trennt sie.", "it": "Una stella arancione dorata e una azzurra, e i colori sono veri, non un effetto di contrasto. Basta un piccolo telescopio per separarle.", "nl": "Een goudoranje en een blauwe ster, en de kleuren zijn echt, geen contrasteffect. Een kleine telescoop splitst ze al.", "zh": "一颗金橙色的星和一颗蓝色的星，颜色是真实的，并非对比造成的错觉。小型望远镜即可将它们分开。", "zht": "一顆金橙色的星和一顆藍色的星，顏色是真實的，並非對比造成的錯覺。小型望遠鏡即可將它們分開。", "bg": "Златисто-оранжева и синя звезда, като цветовете са истински, а не ефект на контраста. Малък телескоп вече ги разделя.", "pl": "Złocistopomarańczowa i niebieska gwiazda, a barwy są prawdziwe, nie są złudzeniem kontrastu. Mały teleskop już je rozdziela."},
    /* BBC Sky at Night, «A guide to star Epsilon Lyrae»: «A concentrated naked eye study
       of Epsilon should, with good eyesight, split it in two», «a telescope reveals each
       to be a double again». https://www.skyatnightmagazine.com/advice/epsilon-lyrae
       Sky & Telescope, «Seeing double»: «readily resolved with the slightest
       magnification». https://skyandtelescope.org/observing/seeing-double */
    "d-eps-lyr": {"es": "Con buena vista se separan dos estrellas a simple vista, y con prismáticos sin esfuerzo; con telescopio, cada una vuelve a partirse en dos.", "en": "With good eyesight you can split two stars with the naked eye, and binoculars do it easily; a telescope splits each of them in two again.", "fr": "Avec une bonne vue, on sépare deux étoiles à l’œil nu, et aux jumelles sans effort ; au télescope, chacune se dédouble à son tour.", "de": "Mit guten Augen trennt man mit bloßem Auge zwei Sterne, im Fernglas mühelos; im Teleskop teilt sich jeder noch einmal in zwei.", "it": "Con una buona vista si separano due stelle a occhio nudo, e con il binocolo senza fatica; con il telescopio ognuna si sdoppia a sua volta.", "nl": "Met goede ogen ziet u met het blote oog twee sterren, en met een verrekijker moeiteloos; met een telescoop splitst elk zich nog eens in tweeën.", "zh": "视力好的人肉眼就能分辨出两颗星，用双筒望远镜更是轻而易举；用天文望远镜，每颗又再分成两颗。", "zht": "視力好的人肉眼就能分辨出兩顆星，用雙筒望遠鏡更是輕而易舉；用天文望遠鏡，每顆又再分成兩顆。", "bg": "С добро зрение двете звезди се разделят с просто око, а с бинокъл — без усилие; с телескоп всяка отново се разделя на две.", "pl": "Przy dobrym wzroku gołym okiem widać dwie gwiazdy, a przez lornetkę bez trudu; w teleskopie każda znów dzieli się na dwie."},
    /* GCVS 5.1 (datos/cielo.json, variables): Algol, eclipsante (EA), periodo 2,8673 dias
       = 2 dias y 21 horas. */
    h14576: {"es": "Cada 2 días y 21 horas pierde brillo durante unas horas: una de sus estrellas pasa por delante de la otra.", "en": "Every 2 days and 21 hours it fades for a few hours: one of its stars passes in front of the other.", "fr": "Tous les 2 jours et 21 heures, elle faiblit pendant quelques heures : l’une de ses étoiles passe devant l’autre.", "de": "Alle 2 Tage und 21 Stunden wird er für einige Stunden schwächer: Einer seiner Sterne zieht vor dem anderen vorbei.", "it": "Ogni 2 giorni e 21 ore si affievolisce per qualche ora: una delle sue stelle passa davanti all’altra.", "nl": "Elke 2 dagen en 21 uur wordt hij een paar uur zwakker: een van zijn sterren schuift voor de andere langs.", "zh": "每隔2天21小时会变暗几个小时：其中一颗星从另一颗前面经过。", "zht": "每隔2天21小時會變暗幾個小時：其中一顆星從另一顆前面經過。", "bg": "На всеки 2 дни и 21 часа отслабва за няколко часа: едната от звездите минава пред другата.", "pl": "Co 2 dni i 21 godzin słabnie na kilka godzin: jedna z jej gwiazd przechodzi przed drugą."},
    /* GCVS 5.1 (datos/cielo.json, variables): Mira, de magnitud 1,9 a 10,4 con un periodo
       de unos 329 dias, casi once meses. */
    h10826: {"es": "En unos once meses pasa de verse a simple vista a necesitar telescopio, y vuelve.", "en": "In about eleven months it goes from naked-eye visible to telescope-only, and back.", "fr": "En onze mois environ, elle passe de visible à l’œil nu à visible seulement au télescope, puis revient.", "de": "In etwa elf Monaten wird er vom Stern für das bloße Auge zum Teleskopobjekt und wieder zurück.", "it": "In circa undici mesi passa dall’essere visibile a occhio nudo al richiedere un telescopio, e ritorno.", "nl": "In ongeveer elf maanden gaat hij van zichtbaar met het blote oog naar alleen met een telescoop, en weer terug.", "zh": "约十一个月内，它会从肉眼可见变暗到只能用望远镜看到，然后再变亮。", "zht": "約十一個月內，它會從肉眼可見變暗到只能用望遠鏡看到，然後再變亮。", "bg": "За около единадесет месеца преминава от видима с просто око до видима само с телескоп и обратно.", "pl": "W ciągu mniej więcej jedenastu miesięcy przechodzi od widocznej gołym okiem do widocznej tylko w teleskopie i z powrotem."},
    /* Geometria: la altura del polo celeste es la latitud del sitio (Izaña, 28,3° N), y la
       Polar esta a menos de 1° del polo; datos/cielo.json le da 29° de altura maxima. */
    h11767: {"es": "Marca el norte. Desde Tenerife está a unos 28° de altura, más o menos la latitud de la isla.", "en": "It marks north. From Tenerife it sits about 28° high, roughly the island’s latitude.", "fr": "Elle indique le nord. Depuis Tenerife, elle est à environ 28° de hauteur, à peu près la latitude de l’île.", "de": "Er zeigt nach Norden. Von Teneriffa aus steht er etwa 28° hoch, ungefähr auf der Breite der Insel.", "it": "Indica il nord. Da Tenerife è a circa 28° di altezza, più o meno la latitudine dell’isola.", "nl": "Hij wijst het noorden aan. Vanaf Tenerife staat hij ongeveer 28° hoog, zo ongeveer de breedtegraad van het eiland.", "zh": "它指示北方。在特内里费它的高度约28°，大致等于该岛的纬度。", "zht": "它指示北方。在特內里費它的高度約28°，大致等於該島的緯度。", "bg": "Показва севера. От Тенерифе е на около 28° височина, колкото е приблизително географската ширина на острова.", "pl": "Wskazuje północ. Z Teneryfy jest na wysokości około 28°, mniej więcej tyle, ile wynosi szerokość geograficzna wyspy."},
    /* HYG v4.1 (datos/cielo.json): magnitud −1,44, la mas brillante del catalogo; 2,64 pc,
       8,6 años luz. */
    h32349: {"es": "La estrella más brillante del cielo nocturno, a 8,6 años luz.", "en": "The brightest star in the night sky, 8.6 light-years away.", "fr": "L’étoile la plus brillante du ciel nocturne, à 8,6 années-lumière.", "de": "Der hellste Stern am Nachthimmel, 8,6 Lichtjahre entfernt.", "it": "La stella più luminosa del cielo notturno, a 8,6 anni luce.", "nl": "De helderste ster aan de nachthemel, op 8,6 lichtjaar.", "zh": "夜空中最亮的恒星，距离8.6光年。", "zht": "夜空中最亮的恆星，距離8.6光年。", "bg": "Най-ярката звезда на нощното небе, на 8,6 светлинни години.", "pl": "Najjaśniejsza gwiazda nocnego nieba, odległa o 8,6 roku świetlnego."},
    /* HYG v4.1 (datos/cielo.json): magnitud −0,62, la segunda; desde Izaña (dec. −52,7°)
       no pasa de unos 9° de altura. */
    h30438: {"es": "La segunda estrella más brillante del cielo nocturno. Desde Tenerife pasa muy baja sobre el horizonte sur.", "en": "The second-brightest star in the night sky. From Tenerife it passes very low over the southern horizon.", "fr": "La deuxième étoile la plus brillante du ciel nocturne. Depuis Tenerife, elle passe très bas sur l’horizon sud.", "de": "Der zweithellste Stern am Nachthimmel. Von Teneriffa aus zieht er sehr tief über den Südhorizont.", "it": "La seconda stella più luminosa del cielo notturno. Da Tenerife passa molto bassa sull’orizzonte sud.", "nl": "De op een na helderste ster aan de nachthemel. Vanaf Tenerife komt hij heel laag boven de zuidelijke horizon.", "zh": "夜空中第二亮的恒星。在特内里费它从南方地平线上很低的位置经过。", "zht": "夜空中第二亮的恆星。在特內里費它從南方地平線上很低的位置經過。", "bg": "Втората по яркост звезда на нощното небе. От Тенерифе минава много ниско над южния хоризонт.", "pl": "Druga co do jasności gwiazda nocnego nieba. Z Teneryfy przechodzi bardzo nisko nad południowym horyzontem."}
  };
  /* SIN-TRADUCIR: CIELO_PLANETAS, las cifras de la NASA NSSDCA, Planetary Fact
     Sheet - Metric
     (https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html, actualizada
     el 2025-03-18) y de la Sun Fact Sheet, copiadas de datos/planetas.json por
     genera.py; la ficha del planeta y las curiosidades (codigo11) salen de
     aqui */
  /* SIN-TRADUCIR: CIELO_CONS, las 88 constelaciones de la UAI
     (datos/constelaciones.json): area y puesto por tamano, origen, estrella
     mas brillante y la pagina de Star Tales de cada una; copiado por
     genera.py, lo coteja tools/auditar_cielo.js (parte 14) */
  var CIELO_CONS = {"leido": "2026-10-22", "fuentes": {"area": "https://en.wikipedia.org/wiki/IAU_designated_constellations_by_solid_angle", "origen": "https://en.wikipedia.org/wiki/IAU_designated_constellations", "historia": "https://www.ianridpath.com/startales/contents.html"}, "con": {"And": {"nombre": "Andromeda", "area": 722.278, "rango": 19, "origen": "ptolomeo", "anio": null, "significado_en": "Andromeda (mythological character)", "brillante": "Alpheratz", "ridpath": "https://www.ianridpath.com/startales/andromeda.html"}, "Ant": {"nombre": "Antlia", "area": 238.901, "rango": 62, "origen": "lacaille", "anio": 1756, "significado_en": "(air) pump", "brillante": "α Antliae", "ridpath": "https://www.ianridpath.com/startales/antlia.html"}, "Aps": {"nombre": "Apus", "area": 206.327, "rango": 67, "origen": "keyser", "anio": 1598, "significado_en": "bird-of-paradise", "brillante": "Paradys", "ridpath": "https://www.ianridpath.com/startales/apus.html"}, "Aqr": {"nombre": "Aquarius", "area": 979.854, "rango": 10, "origen": "ptolomeo", "anio": null, "significado_en": "water-bearer", "brillante": "Sadalsuud", "ridpath": "https://www.ianridpath.com/startales/aquarius.html"}, "Aql": {"nombre": "Aquila", "area": 652.473, "rango": 22, "origen": "ptolomeo", "anio": null, "significado_en": "eagle", "brillante": "Altair", "ridpath": "https://www.ianridpath.com/startales/aquila.html"}, "Ara": {"nombre": "Ara", "area": 237.057, "rango": 63, "origen": "ptolomeo", "anio": null, "significado_en": "altar", "brillante": "β Arae", "ridpath": "https://www.ianridpath.com/startales/ara.html"}, "Ari": {"nombre": "Aries", "area": 441.395, "rango": 39, "origen": "ptolomeo", "anio": null, "significado_en": "ram", "brillante": "Hamal", "ridpath": "https://www.ianridpath.com/startales/aries.html"}, "Aur": {"nombre": "Auriga", "area": 657.438, "rango": 21, "origen": "ptolomeo", "anio": null, "significado_en": "charioteer", "brillante": "Capella", "ridpath": "https://www.ianridpath.com/startales/auriga.html"}, "Boo": {"nombre": "Boötes", "area": 906.831, "rango": 13, "origen": "ptolomeo", "anio": null, "significado_en": "herdsman", "brillante": "Arcturus", "ridpath": "https://www.ianridpath.com/startales/bootes.html"}, "Cae": {"nombre": "Caelum", "area": 124.865, "rango": 81, "origen": "lacaille", "anio": 1756, "significado_en": "chisel or engraving tool", "brillante": "α Caeli", "ridpath": "https://www.ianridpath.com/startales/caelum.html"}, "Cam": {"nombre": "Camelopardalis", "area": 756.828, "rango": 18, "origen": "plancius", "anio": 1613, "significado_en": "giraffe", "brillante": "β Camelopardalis", "ridpath": "https://www.ianridpath.com/startales/camelopardalis.html"}, "Cnc": {"nombre": "Cancer", "area": 505.872, "rango": 31, "origen": "ptolomeo", "anio": null, "significado_en": "crab", "brillante": "Tarf", "ridpath": "https://www.ianridpath.com/startales/cancer.html"}, "CVn": {"nombre": "Canes Venatici", "area": 465.194, "rango": 38, "origen": "hevelius", "anio": 1690, "significado_en": "hunting dogs", "brillante": "Cor Caroli", "ridpath": "https://www.ianridpath.com/startales/canesvenatici.html"}, "CMa": {"nombre": "Canis Major", "area": 380.118, "rango": 43, "origen": "ptolomeo", "anio": null, "significado_en": "greater dog", "brillante": "Sirius", "ridpath": "https://www.ianridpath.com/startales/canismajor.html"}, "CMi": {"nombre": "Canis Minor", "area": 183.367, "rango": 71, "origen": "ptolomeo", "anio": null, "significado_en": "lesser dog", "brillante": "Procyon", "ridpath": "https://www.ianridpath.com/startales/canisminor.html"}, "Cap": {"nombre": "Capricornus", "area": 413.947, "rango": 40, "origen": "ptolomeo", "anio": null, "significado_en": "sea goat", "brillante": "Deneb Algedi", "ridpath": "https://www.ianridpath.com/startales/capricornus.html"}, "Car": {"nombre": "Carina", "area": 494.184, "rango": 34, "origen": "argo", "anio": 1756, "significado_en": "keel", "brillante": "Canopus", "ridpath": "https://www.ianridpath.com/startales/carina.html"}, "Cas": {"nombre": "Cassiopeia", "area": 598.407, "rango": 25, "origen": "ptolomeo", "anio": null, "significado_en": "Cassiopeia (mythological character)", "brillante": "Schedar", "ridpath": "https://www.ianridpath.com/startales/cassiopeia.html"}, "Cen": {"nombre": "Centaurus", "area": 1060.422, "rango": 9, "origen": "ptolomeo", "anio": null, "significado_en": "centaur", "brillante": "Alpha Centauri", "ridpath": "https://www.ianridpath.com/startales/centaurus.html"}, "Cep": {"nombre": "Cepheus", "area": 587.787, "rango": 27, "origen": "ptolomeo", "anio": null, "significado_en": "Cepheus (mythological character)", "brillante": "Alderamin", "ridpath": "https://www.ianridpath.com/startales/cepheus.html"}, "Cet": {"nombre": "Cetus", "area": 1231.411, "rango": 4, "origen": "ptolomeo", "anio": null, "significado_en": "sea monster (later interpreted as a whale)", "brillante": "Diphda", "ridpath": "https://www.ianridpath.com/startales/cetus.html"}, "Cha": {"nombre": "Chamaeleon", "area": 131.592, "rango": 79, "origen": "keyser", "anio": 1598, "significado_en": "chameleon", "brillante": "α Chamaeleontis", "ridpath": "https://www.ianridpath.com/startales/chamaeleon.html"}, "Cir": {"nombre": "Circinus", "area": 93.353, "rango": 85, "origen": "lacaille", "anio": 1756, "significado_en": "compasses", "brillante": "Xami", "ridpath": "https://www.ianridpath.com/startales/circinus.html"}, "Col": {"nombre": "Columba", "area": 270.184, "rango": 54, "origen": "plancius", "anio": 1592, "significado_en": "dove", "brillante": "Phact", "ridpath": "https://www.ianridpath.com/startales/columba.html"}, "Com": {"nombre": "Coma Berenices", "area": 386.475, "rango": 42, "origen": "vopel", "anio": 1536, "significado_en": "Berenice's hair", "brillante": "β Comae Berenices", "ridpath": "https://www.ianridpath.com/startales/comaberenices.html"}, "CrA": {"nombre": "Corona Australis", "area": 127.696, "rango": 80, "origen": "ptolomeo", "anio": null, "significado_en": "southern crown", "brillante": "Meridiana", "ridpath": "https://www.ianridpath.com/startales/coronaaustralis.html"}, "CrB": {"nombre": "Corona Borealis", "area": 178.71, "rango": 73, "origen": "ptolomeo", "anio": null, "significado_en": "northern crown", "brillante": "Alphecca", "ridpath": "https://www.ianridpath.com/startales/coronaborealis.html"}, "Crv": {"nombre": "Corvus", "area": 183.801, "rango": 70, "origen": "ptolomeo", "anio": null, "significado_en": "crow", "brillante": "Gienah", "ridpath": "https://www.ianridpath.com/startales/corvusandcrater.html"}, "Crt": {"nombre": "Crater", "area": 282.398, "rango": 53, "origen": "ptolomeo", "anio": null, "significado_en": "krater (bowl for mixing wine)", "brillante": "δ Crateris", "ridpath": "https://www.ianridpath.com/startales/corvusandcrater.html"}, "Cru": {"nombre": "Crux", "area": 68.447, "rango": 88, "origen": "plancius", "anio": 1589, "significado_en": "cross", "brillante": "Acrux", "ridpath": "https://www.ianridpath.com/startales/crux.html"}, "Cyg": {"nombre": "Cygnus", "area": 803.983, "rango": 16, "origen": "ptolomeo", "anio": null, "significado_en": "swan", "brillante": "Deneb", "ridpath": "https://www.ianridpath.com/startales/cygnus.html"}, "Del": {"nombre": "Delphinus", "area": 188.549, "rango": 69, "origen": "ptolomeo", "anio": null, "significado_en": "dolphin", "brillante": "Rotanev", "ridpath": "https://www.ianridpath.com/startales/delphinus.html"}, "Dor": {"nombre": "Dorado", "area": 179.173, "rango": 72, "origen": "keyser", "anio": 1598, "significado_en": "mahi-mahi (dolphinfish)", "brillante": "α Doradus", "ridpath": "https://www.ianridpath.com/startales/dorado.html"}, "Dra": {"nombre": "Draco", "area": 1082.952, "rango": 8, "origen": "ptolomeo", "anio": null, "significado_en": "dragon", "brillante": "Eltanin", "ridpath": "https://www.ianridpath.com/startales/draco.html"}, "Equ": {"nombre": "Equuleus", "area": 71.641, "rango": 87, "origen": "ptolomeo", "anio": null, "significado_en": "pony", "brillante": "Kitalpha", "ridpath": "https://www.ianridpath.com/startales/equuleus.html"}, "Eri": {"nombre": "Eridanus", "area": 1137.919, "rango": 6, "origen": "ptolomeo", "anio": null, "significado_en": "river Eridanus (mythology)", "brillante": "Achernar", "ridpath": "https://www.ianridpath.com/startales/eridanus.html"}, "For": {"nombre": "Fornax", "area": 397.502, "rango": 41, "origen": "lacaille", "anio": 1756, "significado_en": "(chemical) furnace", "brillante": "Dalim", "ridpath": "https://www.ianridpath.com/startales/fornax.html"}, "Gem": {"nombre": "Gemini", "area": 513.761, "rango": 30, "origen": "ptolomeo", "anio": null, "significado_en": "twins (Lugal-irra and Meslamta-ea, later Castor and Pollux)", "brillante": "Pollux", "ridpath": "https://www.ianridpath.com/startales/gemini.html"}, "Gru": {"nombre": "Grus", "area": 365.513, "rango": 45, "origen": "keyser", "anio": 1598, "significado_en": "crane (bird)", "brillante": "Alnair", "ridpath": "https://www.ianridpath.com/startales/grus.html"}, "Her": {"nombre": "Hercules", "area": 1225.148, "rango": 5, "origen": "ptolomeo", "anio": null, "significado_en": "Hercules (mythological character)", "brillante": "Kornephoros", "ridpath": "https://www.ianridpath.com/startales/hercules.htm"}, "Hor": {"nombre": "Horologium", "area": 248.885, "rango": 58, "origen": "lacaille", "anio": 1756, "significado_en": "pendulum clock", "brillante": "α Horologii", "ridpath": "https://www.ianridpath.com/startales/horologium.html"}, "Hya": {"nombre": "Hydra", "area": 1302.844, "rango": 1, "origen": "ptolomeo", "anio": null, "significado_en": "Hydra (mythological creature)", "brillante": "Alphard", "ridpath": "https://www.ianridpath.com/startales/hydra.html"}, "Hyi": {"nombre": "Hydrus", "area": 243.035, "rango": 61, "origen": "keyser", "anio": 1598, "significado_en": "lesser water snake", "brillante": "β Hydri", "ridpath": "https://www.ianridpath.com/startales/hydrus.html"}, "Ind": {"nombre": "Indus", "area": 294.006, "rango": 49, "origen": "keyser", "anio": 1598, "significado_en": "Indian (of unspecified type)", "brillante": "α Indi", "ridpath": "https://www.ianridpath.com/startales/indus.html"}, "Lac": {"nombre": "Lacerta", "area": 200.688, "rango": 68, "origen": "hevelius", "anio": 1690, "significado_en": "lizard", "brillante": "Stellio", "ridpath": "https://www.ianridpath.com/startales/lacerta.html"}, "Leo": {"nombre": "Leo", "area": 946.964, "rango": 12, "origen": "ptolomeo", "anio": null, "significado_en": "lion", "brillante": "Regulus", "ridpath": "https://www.ianridpath.com/startales/leo.html"}, "LMi": {"nombre": "Leo Minor", "area": 231.956, "rango": 64, "origen": "hevelius", "anio": 1690, "significado_en": "lesser lion", "brillante": "Praecipua", "ridpath": "https://www.ianridpath.com/startales/leominor.html"}, "Lep": {"nombre": "Lepus", "area": 290.291, "rango": 51, "origen": "ptolomeo", "anio": null, "significado_en": "hare", "brillante": "Arneb", "ridpath": "https://www.ianridpath.com/startales/lepus.html"}, "Lib": {"nombre": "Libra", "area": 538.052, "rango": 29, "origen": "ptolomeo", "anio": null, "significado_en": "balance", "brillante": "Zubeneschemali", "ridpath": "https://www.ianridpath.com/startales/libra.html"}, "Lup": {"nombre": "Lupus", "area": 333.683, "rango": 46, "origen": "ptolomeo", "anio": null, "significado_en": "wolf", "brillante": "Uridim", "ridpath": "https://www.ianridpath.com/startales/lupus.html", "mas": [["Wikipedia: α Lupi", "https://en.wikipedia.org/wiki/Alpha_Lupi"]]}, "Lyn": {"nombre": "Lynx", "area": 545.386, "rango": 28, "origen": "hevelius", "anio": 1690, "significado_en": "lynx", "brillante": "α Lyncis", "ridpath": "https://www.ianridpath.com/startales/lynx.html"}, "Lyr": {"nombre": "Lyra", "area": 286.476, "rango": 52, "origen": "ptolomeo", "anio": null, "significado_en": "lyre / harp", "brillante": "Vega", "ridpath": "https://www.ianridpath.com/startales/lyra.html"}, "Men": {"nombre": "Mensa", "area": 153.484, "rango": 75, "origen": "lacaille", "anio": 1756, "significado_en": "Table Mountain (South Africa)", "brillante": "Hoerikwaggo", "ridpath": "https://www.ianridpath.com/startales/mensa.html"}, "Mic": {"nombre": "Microscopium", "area": 209.513, "rango": 66, "origen": "lacaille", "anio": 1756, "significado_en": "microscope", "brillante": "γ Microscopii", "ridpath": "https://www.ianridpath.com/startales/microscopium.html"}, "Mon": {"nombre": "Monoceros", "area": 481.569, "rango": 35, "origen": "plancius", "anio": 1613, "significado_en": "unicorn", "brillante": "β Monocerotis", "ridpath": "https://www.ianridpath.com/startales/monoceros.html"}, "Mus": {"nombre": "Musca", "area": 138.355, "rango": 77, "origen": "keyser", "anio": 1598, "significado_en": "fly", "brillante": "α Muscae", "ridpath": "https://www.ianridpath.com/startales/musca.html"}, "Nor": {"nombre": "Norma", "area": 165.29, "rango": 74, "origen": "lacaille", "anio": 1756, "significado_en": "carpenter's level", "brillante": "γ2 Normae", "ridpath": "https://www.ianridpath.com/startales/norma.html"}, "Oct": {"nombre": "Octans", "area": 291.045, "rango": 50, "origen": "lacaille", "anio": 1756, "significado_en": "octant (instrument)", "brillante": "ν Octantis", "ridpath": "https://www.ianridpath.com/startales/octans.html"}, "Oph": {"nombre": "Ophiuchus", "area": 948.34, "rango": 11, "origen": "ptolomeo", "anio": null, "significado_en": "serpent-bearer", "brillante": "Rasalhague", "ridpath": "https://www.ianridpath.com/startales/ophiuchus.html"}, "Ori": {"nombre": "Orion", "area": 594.12, "rango": 26, "origen": "ptolomeo", "anio": null, "significado_en": "Orion (mythological character)", "brillante": "Rigel", "ridpath": null, "wiki": "https://en.wikipedia.org/wiki/Orion_(constellation)"}, "Pav": {"nombre": "Pavo", "area": 377.666, "rango": 44, "origen": "keyser", "anio": 1598, "significado_en": "peacock", "brillante": "Peacock", "ridpath": "https://www.ianridpath.com/startales/pavo.html"}, "Peg": {"nombre": "Pegasus", "area": 1120.794, "rango": 7, "origen": "ptolomeo", "anio": null, "significado_en": "Pegasus (mythological winged horse)", "brillante": "Enif", "ridpath": "https://www.ianridpath.com/startales/pegasus.html"}, "Per": {"nombre": "Perseus", "area": 614.997, "rango": 24, "origen": "ptolomeo", "anio": null, "significado_en": "Perseus (mythological character)", "brillante": "Mirfak", "ridpath": "https://www.ianridpath.com/startales/perseus.html"}, "Phe": {"nombre": "Phoenix", "area": 469.319, "rango": 37, "origen": "keyser", "anio": 1598, "significado_en": "phoenix", "brillante": "Ankaa", "ridpath": "https://www.ianridpath.com/startales/phoenix.html"}, "Pic": {"nombre": "Pictor", "area": 246.739, "rango": 59, "origen": "lacaille", "anio": 1756, "significado_en": "painter (originally 'painter's easel')", "brillante": "α Pictoris", "ridpath": "https://www.ianridpath.com/startales/pictor.html"}, "Psc": {"nombre": "Pisces", "area": 889.417, "rango": 14, "origen": "ptolomeo", "anio": null, "significado_en": "fish (plural)", "brillante": "Alpherg", "ridpath": "https://www.ianridpath.com/startales/pisces.html"}, "PsA": {"nombre": "Piscis Austrinus", "area": 245.375, "rango": 60, "origen": "ptolomeo", "anio": null, "significado_en": "southern fish", "brillante": "Fomalhaut", "ridpath": "https://www.ianridpath.com/startales/piscisaustrinus.html"}, "Pup": {"nombre": "Puppis", "area": 673.434, "rango": 20, "origen": "argo", "anio": 1756, "significado_en": "poop deck", "brillante": "Naos", "ridpath": "https://www.ianridpath.com/startales/puppis.html"}, "Pyx": {"nombre": "Pyxis", "area": 220.833, "rango": 65, "origen": "lacaille", "anio": 1756, "significado_en": "mariner's compass", "brillante": "α Pyxidis", "ridpath": "https://www.ianridpath.com/startales/pyxis.html"}, "Ret": {"nombre": "Reticulum", "area": 113.936, "rango": 82, "origen": "lacaille", "anio": 1756, "significado_en": "reticle", "brillante": "Rhombus", "ridpath": "https://www.ianridpath.com/startales/reticulum.html"}, "Sge": {"nombre": "Sagitta", "area": 79.932, "rango": 86, "origen": "ptolomeo", "anio": null, "significado_en": "arrow", "brillante": "Telum", "ridpath": "https://www.ianridpath.com/startales/sagitta.html"}, "Sgr": {"nombre": "Sagittarius", "area": 867.432, "rango": 15, "origen": "ptolomeo", "anio": null, "significado_en": "archer", "brillante": "Kaus Australis", "ridpath": "https://www.ianridpath.com/startales/sagittarius.html"}, "Sco": {"nombre": "Scorpius", "area": 496.783, "rango": 33, "origen": "ptolomeo", "anio": null, "significado_en": "scorpion", "brillante": "Antares", "ridpath": "https://www.ianridpath.com/startales/scorpius.html"}, "Scl": {"nombre": "Sculptor", "area": 474.764, "rango": 36, "origen": "lacaille", "anio": 1756, "significado_en": "sculptor (originally 'sculptor's tools')", "brillante": "α Sculptoris", "ridpath": "https://www.ianridpath.com/startales/sculptor.html"}, "Sct": {"nombre": "Scutum", "area": 109.114, "rango": 84, "origen": "hevelius", "anio": 1690, "significado_en": "shield (of Sobieski)", "brillante": "Tianbian", "ridpath": "https://www.ianridpath.com/startales/scutum.html"}, "Ser": {"nombre": "Serpens", "area": 636.928, "rango": 23, "origen": "ptolomeo", "anio": null, "significado_en": "snake", "brillante": "Unukalhai", "ridpath": "https://www.ianridpath.com/startales/serpens.html"}, "Sex": {"nombre": "Sextans", "area": 313.515, "rango": 47, "origen": "hevelius", "anio": 1690, "significado_en": "sextant", "brillante": "α Sextantis", "ridpath": "https://www.ianridpath.com/startales/sextans.html"}, "Tau": {"nombre": "Taurus", "area": 797.249, "rango": 17, "origen": "ptolomeo", "anio": null, "significado_en": "bull", "brillante": "Aldebaran", "ridpath": "https://www.ianridpath.com/startales/taurus.html"}, "Tel": {"nombre": "Telescopium", "area": 251.512, "rango": 57, "origen": "lacaille", "anio": 1756, "significado_en": "telescope", "brillante": "α Telescopii", "ridpath": "https://www.ianridpath.com/startales/telescopium.html"}, "Tri": {"nombre": "Triangulum", "area": 131.847, "rango": 78, "origen": "ptolomeo", "anio": null, "significado_en": "triangle", "brillante": "Alaybasan", "ridpath": "https://www.ianridpath.com/startales/triangulum.html", "mas": [["Wikipedia: β Trianguli", "https://en.wikipedia.org/wiki/Beta_Trianguli"]]}, "TrA": {"nombre": "Triangulum Australe", "area": 109.978, "rango": 83, "origen": "keyser", "anio": 1598, "significado_en": "southern triangle", "brillante": "Atria", "ridpath": "https://www.ianridpath.com/startales/triangulumaustrale.html"}, "Tuc": {"nombre": "Tucana", "area": 294.557, "rango": 48, "origen": "keyser", "anio": 1598, "significado_en": "toucan", "brillante": "Lang-Exster", "ridpath": "https://www.ianridpath.com/startales/tucana.html"}, "UMa": {"nombre": "Ursa Major", "area": 1279.66, "rango": 3, "origen": "ptolomeo", "anio": null, "significado_en": "great bear", "brillante": "Alioth", "ridpath": "https://www.ianridpath.com/startales/ursamajor.html"}, "UMi": {"nombre": "Ursa Minor", "area": 255.864, "rango": 56, "origen": "ptolomeo", "anio": null, "significado_en": "lesser bear", "brillante": "Polaris", "ridpath": "https://www.ianridpath.com/startales/ursaminor.html"}, "Vel": {"nombre": "Vela", "area": 499.649, "rango": 32, "origen": "argo", "anio": 1756, "significado_en": "sails", "brillante": "γ Velorum", "ridpath": "https://www.ianridpath.com/startales/vela.html"}, "Vir": {"nombre": "Virgo", "area": 1294.428, "rango": 2, "origen": "ptolomeo", "anio": null, "significado_en": "virgin, maiden", "brillante": "Spica", "ridpath": "https://www.ianridpath.com/startales/virgo.html"}, "Vol": {"nombre": "Volans", "area": 141.354, "rango": 76, "origen": "keyser", "anio": 1598, "significado_en": "flying fish", "brillante": "γ Volantis", "ridpath": "https://www.ianridpath.com/startales/volans.html"}, "Vul": {"nombre": "Vulpecula", "area": 268.165, "rango": 55, "origen": "hevelius", "anio": 1690, "significado_en": "little fox (originally, 'little fox with the goose')", "brillante": "Anser", "ridpath": "https://www.ianridpath.com/startales/vulpecula.html"}}};
  var CIELO_PLANETAS = {"fecha": "2025-03-18", "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html", "cuerpos": {"Mercury": {"diametro_km": 4879, "gravedad_ms2": 3.7, "rotacion_h": 1407.6, "dia_h": 4222.6, "periodo_d": 88.0, "periodo_sideral_d": 87.969, "temp_c": 167, "oblicuidad_deg": 0.034, "presion_bar": 0, "lunas": 0, "anillos": false, "dist_sol_mkm": 57.9, "velocidad_kms": 47.4, "masa_e24kg": 0.33, "densidad_kgm3": 5429}, "Venus": {"diametro_km": 12104, "gravedad_ms2": 8.9, "rotacion_h": -5832.5, "dia_h": 2802.0, "periodo_d": 224.7, "periodo_sideral_d": 224.701, "temp_c": 464, "oblicuidad_deg": 177.4, "presion_bar": 92, "lunas": 0, "anillos": false, "dist_sol_mkm": 108.2, "velocidad_kms": 35.0, "masa_e24kg": 4.87, "densidad_kgm3": 5243}, "Earth": {"diametro_km": 12756, "gravedad_ms2": 9.8, "rotacion_h": 23.9, "dia_h": 24.0, "periodo_d": 365.2, "periodo_sideral_d": 365.256, "temp_c": 15, "oblicuidad_deg": 23.4, "presion_bar": 1, "lunas": 1, "anillos": false, "dist_sol_mkm": 149.6, "velocidad_kms": 29.8, "masa_e24kg": 5.97, "densidad_kgm3": 5514}, "Moon": {"diametro_km": 3475, "gravedad_ms2": 1.6, "rotacion_h": 655.7, "dia_h": 708.7, "periodo_d": 27.3, "temp_c": -20, "oblicuidad_deg": 6.7, "presion_bar": 0, "lunas": 0, "anillos": false, "dist_tierra_mkm": 0.384, "velocidad_kms": 1.0, "masa_e24kg": 0.073, "densidad_kgm3": 3340}, "Mars": {"diametro_km": 6792, "gravedad_ms2": 3.7, "rotacion_h": 24.6, "dia_h": 24.7, "periodo_d": 687.0, "periodo_sideral_d": 686.98, "temp_c": -65, "oblicuidad_deg": 25.2, "presion_bar": 0.01, "lunas": 2, "anillos": false, "dist_sol_mkm": 228.0, "velocidad_kms": 24.1, "masa_e24kg": 0.642, "densidad_kgm3": 3934}, "Jupiter": {"diametro_km": 142984, "gravedad_ms2": 23.1, "rotacion_h": 9.9, "dia_h": 9.9, "periodo_d": 4331, "periodo_sideral_d": 4332.589, "temp_c": -110, "oblicuidad_deg": 3.1, "presion_bar": null, "lunas": 95, "anillos": true, "dist_sol_mkm": 778.5, "velocidad_kms": 13.1, "masa_e24kg": 1898, "densidad_kgm3": 1326}, "Saturn": {"diametro_km": 120536, "gravedad_ms2": 9.0, "rotacion_h": 10.7, "dia_h": 10.7, "periodo_d": 10747, "periodo_sideral_d": 10755.699, "temp_c": -140, "oblicuidad_deg": 26.7, "presion_bar": null, "lunas": 274, "anillos": true, "dist_sol_mkm": 1432.0, "velocidad_kms": 9.7, "masa_e24kg": 568, "densidad_kgm3": 687}, "Uranus": {"diametro_km": 51118, "gravedad_ms2": 8.7, "rotacion_h": -17.2, "dia_h": 17.2, "periodo_d": 30589, "periodo_sideral_d": 30685.4, "temp_c": -195, "oblicuidad_deg": 97.8, "presion_bar": null, "lunas": 28, "anillos": true, "dist_sol_mkm": 2867.0, "velocidad_kms": 6.8, "masa_e24kg": 86.8, "densidad_kgm3": 1270}, "Neptune": {"diametro_km": 49528, "gravedad_ms2": 11.0, "rotacion_h": 16.1, "dia_h": 16.1, "periodo_d": 59800, "periodo_sideral_d": 60189.018, "temp_c": -200, "oblicuidad_deg": 28.3, "presion_bar": null, "lunas": 16, "anillos": true, "dist_sol_mkm": 4515.0, "velocidad_kms": 5.4, "masa_e24kg": 102, "densidad_kgm3": 1638}}, "sol": {"fuente": "NASA NSSDCA, Sun Fact Sheet", "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html", "fecha": "2024-05-09", "radio_km": 695700, "radio_x_tierra": 109.2, "masa_e24kg": 1988400, "masa_x_tierra": 332900, "gravedad_ms2": 274.0, "gravedad_x_tierra": 28.0, "rotacion_h": 609.12, "temp_k": 5772, "densidad_kgm3": 1408, "luminosidad_e24w": 382.8, "dist_tierra_mkm": 149.6}};

  /* Los textos del panel en los diez idiomas, con el formato de UI_TX. Se
     editan aqui. tools/auditar_cielo.js comprueba que cada fila tenga los
     diez, los mismos {marcadores} en cada forma de plural, y que exista
     cada fila que pide el codigo. Lo que dicen de leyes, certificaciones,
     sitios y visitas lleva encima la fuente de donde sale. */
  var CIELO_UI = {
    "cieloPesNoche": {"es": "Esta noche", "en": "Tonight", "fr": "Ce soir", "de": "Heute Nacht", "it": "Stanotte", "nl": "Vannacht", "zh": "今晚", "zht": "今晚", "bg": "Тази нощ", "pl": "Dziś w nocy"},
    "cieloPesCalendario": {"es": "Calendario", "en": "Calendar", "fr": "Calendrier", "de": "Kalender", "it": "Calendario", "nl": "Kalender", "zh": "天象日历", "zht": "天象日曆", "bg": "Календар", "pl": "Kalendarz"},
    "cieloPesCatalogo": {"es": "Catálogo", "en": "Catalog", "fr": "Catalogue", "de": "Katalog", "it": "Catalogo", "nl": "Catalogus", "zh": "星表", "zht": "星表", "bg": "Каталог", "pl": "Katalog"},
    "cieloPesMapa": {"es": "Mapa", "en": "Sky map", "fr": "Carte", "de": "Karte", "it": "Mappa", "nl": "Kaart", "zh": "星图", "zht": "星圖", "bg": "Карта", "pl": "Mapa"},
    "cieloPesDonde": {"es": "Dónde ir", "en": "Where to go", "fr": "Où aller", "de": "Wohin", "it": "Dove andare", "nl": "Waarheen", "zh": "观星地点", "zht": "觀星地點", "bg": "Къде", "pl": "Gdzie"},
    "cieloErrorCalculo": {"es": "No se pudo calcular esta vista. Pruebe con otra noche.", "en": "This view couldn’t be calculated. Try another night.", "fr": "Impossible de calculer cet affichage. Essayez une autre nuit.", "de": "Diese Ansicht konnte nicht berechnet werden. Versuche eine andere Nacht.", "it": "Impossibile calcolare questa vista. Prova un’altra notte.", "nl": "Deze weergave kon niet worden berekend. Probeer een andere nacht.", "zh": "无法计算此视图，请换一晚试试。", "zht": "無法計算此檢視，請換一晚試試。", "bg": "Този изглед не можа да се изчисли. Опитайте друга нощ.", "pl": "Nie udało się obliczyć tego widoku. Wybierz inną noc."},
    /* ── esta noche ─────────────────────────────────────────────────────── */
    "cieloNocheAnterior": {"es": "Noche anterior", "en": "Previous night", "fr": "Nuit précédente", "de": "Vorherige Nacht", "it": "Notte precedente", "nl": "Vorige nacht", "zh": "前一晚", "zht": "前一晚", "bg": "Предишна нощ", "pl": "Poprzednia noc"},
    "cieloNocheSiguiente": {"es": "Noche siguiente", "en": "Next night", "fr": "Nuit suivante", "de": "Nächste Nacht", "it": "Notte successiva", "nl": "Volgende nacht", "zh": "后一晚", "zht": "後一晚", "bg": "Следваща нощ", "pl": "Następna noc"},
    "cieloEstaNoche": {"es": "Esta noche", "en": "Tonight", "fr": "Cette nuit", "de": "Heute Nacht", "it": "Stanotte", "nl": "Vannacht", "zh": "今晚", "zht": "今晚", "bg": "Тази нощ", "pl": "Dzisiejsza noc"},
    "cieloNocheDel": {"es": "Noche del {f}", "en": "Night of {f}", "fr": "Nuit du {f}", "de": "Nacht: {f}", "it": "Notte del {f}", "nl": "Nacht van {f}", "zh": "{f}夜间", "zht": "{f}夜間", "bg": "Нощта: {f}", "pl": "Noc: {f}"},
    "cieloHoy": {"es": "Hoy", "en": "Today", "fr": "Aujourd’hui", "de": "Heute", "it": "Oggi", "nl": "Vandaag", "zh": "今天", "zht": "今天", "bg": "Днес", "pl": "Dziś"},
    "cieloOscuridad": {"es": "Sol y oscuridad", "en": "Sun and darkness", "fr": "Soleil et obscurité", "de": "Sonne und Dunkelheit", "it": "Sole e buio", "nl": "Zon en duisternis", "zh": "日落与夜色", "zht": "日落與夜色", "bg": "Слънце и тъмнина", "pl": "Słońce i ciemność"},
    "cieloPuestaSol": {"es": "Puesta de sol", "en": "Sunset", "fr": "Coucher du soleil", "de": "Sonnenuntergang", "it": "Tramonto", "nl": "Zonsondergang", "zh": "日落", "zht": "日落", "bg": "Залез", "pl": "Zachód słońca"},
    "cieloNocheCerrada": {"es": "Noche cerrada (Sol a −18°)", "en": "Full darkness (Sun at −18°)", "fr": "Nuit noire (Soleil à −18°)", "de": "Volle Dunkelheit (Sonne bei −18°)", "it": "Buio completo (Sole a −18°)", "nl": "Volledig donker (zon op −18°)", "zh": "完全天黑（太阳低于−18°）", "zht": "完全天黑（太陽低於−18°）", "bg": "Пълна тъмнина (Слънцето под −18°)", "pl": "Pełna ciemność (Słońce na −18°)"},
    "cieloSalidaSol": {"es": "Salida del sol", "en": "Sunrise", "fr": "Lever du soleil", "de": "Sonnenaufgang", "it": "Alba", "nl": "Zonsopkomst", "zh": "日出", "zht": "日出", "bg": "Изгрев", "pl": "Wschód słońca"},
    "cieloSinLuna": {"es": "Noche cerrada sin Luna", "en": "Moonless darkness", "fr": "Nuit noire sans Lune", "de": "Dunkel und ohne Mond", "it": "Buio senza Luna", "nl": "Donker zonder maan", "zh": "无月黑夜时长", "zht": "無月黑夜時長", "bg": "Тъмнина без Луна", "pl": "Ciemność bez Księżyca"},
    "cieloNinguna": {"es": "Ninguna", "en": "None", "fr": "Aucune", "de": "Keine", "it": "Nessuna", "nl": "Geen", "zh": "无", "zht": "無", "bg": "Няма", "pl": "Brak"},
    "cieloHorasMin": {"es": "{h} h {m} min", "en": "{h} h {m} min", "fr": "{h} h {m} min", "de": "{h} h {m} min", "it": "{h} h {m} min", "nl": "{h} u {m} min", "zh": "{h}小时{m}分", "zht": "{h}小時{m}分", "bg": "{h} ч {m} мин", "pl": "{h} godz. {m} min"},
    "cieloSinLunaDe": {"es": "Tramos sin Luna", "en": "Moonless spells", "fr": "Plages sans Lune", "de": "Zeiten ohne Mond", "it": "Intervalli senza Luna", "nl": "Tijden zonder maan", "zh": "无月时段", "zht": "無月時段", "bg": "Периоди без Луна", "pl": "Okresy bez Księżyca"},
    "cieloNotaLugar": {"es": "Horas de Canarias, calculadas para el Observatorio del Teide (Izaña) con el horizonte despejado: en otros puntos de la isla cambian unos minutos, y una montaña delante adelanta la puesta de sol.", "en": "Canary Islands time, calculated for the Teide Observatory (Izaña) with a clear horizon: elsewhere on the island times shift by a few minutes, and a mountain in the way brings sunset forward.", "fr": "Heure des Canaries, calculée pour l’Observatoire du Teide (Izaña) avec un horizon dégagé : ailleurs sur l’île, les heures varient de quelques minutes, et une montagne devant avance le coucher du soleil.", "de": "Kanarische Zeit, berechnet für das Teide-Observatorium (Izaña) bei freiem Horizont: an anderen Orten der Insel weichen die Zeiten um einige Minuten ab, und ein Berg davor lässt die Sonne früher verschwinden.", "it": "Ora delle Canarie, calcolata per l’Osservatorio del Teide (Izaña) con orizzonte libero: altrove sull’isola gli orari cambiano di qualche minuto, e una montagna davanti anticipa il tramonto.", "nl": "Canarische tijd, berekend voor het Teide-observatorium (Izaña) met vrije horizon: elders op het eiland verschuiven de tijden een paar minuten, en een berg ervoor vervroegt de zonsondergang.", "zh": "时间为加那利时间，按泰德天文台（伊萨尼亚）、视野开阔的地平线计算：岛上其他地点会相差几分钟，前方有山时日落会提前。", "zht": "時間為加那利時間，按泰德天文台（伊薩尼亞）、視野開闊的地平線計算：島上其他地點會相差幾分鐘，前方有山時日落會提前。", "bg": "Час на Канарските острови, изчислен за обсерваторията Тейде (Исаня) при открит хоризонт: на други места на острова часовете се разминават с няколко минути, а планина отпред изтегля залеза по-рано.", "pl": "Czas kanaryjski, obliczony dla Obserwatorium Teide (Izaña) przy odsłoniętym horyzoncie: w innych miejscach wyspy godziny różnią się o kilka minut, a góra na horyzoncie przyspiesza zachód słońca."},
    "cieloLeyCrepusculo": {"es": "Crepúsculo", "en": "Twilight", "fr": "Crépuscule", "de": "Dämmerung", "it": "Crepuscolo", "nl": "Schemering", "zh": "暮光", "zht": "暮光", "bg": "Здрач", "pl": "Zmierzch"},
    "cieloLeyNoche": {"es": "Noche cerrada", "en": "Full darkness", "fr": "Nuit noire", "de": "Volle Dunkelheit", "it": "Buio completo", "nl": "Volledig donker", "zh": "完全天黑", "zht": "完全天黑", "bg": "Пълна тъмнина", "pl": "Pełna ciemność"},
    "cieloLeyLuna": {"es": "Luna sobre el horizonte", "en": "Moon above the horizon", "fr": "Lune au-dessus de l’horizon", "de": "Mond über dem Horizont", "it": "Luna sopra l’orizzonte", "nl": "Maan boven de horizon", "zh": "月亮在地平线以上", "zht": "月亮在地平線以上", "bg": "Луната над хоризонта", "pl": "Księżyc nad horyzontem"},
    "cieloLuna": {"es": "Luna", "en": "Moon", "fr": "Lune", "de": "Mond", "it": "Luna", "nl": "Maan", "zh": "月亮", "zht": "月亮", "bg": "Луна", "pl": "Księżyc"},
    "cieloIluminada": {"es": "{p} % iluminada", "en": "{p}% lit", "fr": "éclairée à {p} %", "de": "{p} % beleuchtet", "it": "illuminata al {p}%", "nl": "{p}% verlicht", "zh": "照亮{p}%", "zht": "照亮{p}%", "bg": "{p} % осветена", "pl": "oświetlony w {p}%"},
    "cieloLunaSale": {"es": "Sale a las {h}", "en": "Rises at {h}", "fr": "Se lève à {h}", "de": "Geht um {h} auf", "it": "Sorge alle {h}", "nl": "Komt op om {h}", "zh": "{h}升起", "zht": "{h}升起", "bg": "Изгрява в {h}", "pl": "Wschodzi o {h}"},
    "cieloLunaPone": {"es": "Se pone a las {h}", "en": "Sets at {h}", "fr": "Se couche à {h}", "de": "Geht um {h} unter", "it": "Tramonta alle {h}", "nl": "Gaat onder om {h}", "zh": "{h}落下", "zht": "{h}落下", "bg": "Залязва в {h}", "pl": "Zachodzi o {h}"},
    "cieloLunaToda": {"es": "Sobre el horizonte toda la noche", "en": "Above the horizon all night", "fr": "Au-dessus de l’horizon toute la nuit", "de": "Die ganze Nacht über dem Horizont", "it": "Sopra l’orizzonte tutta la notte", "nl": "De hele nacht boven de horizon", "zh": "整夜都在地平线以上", "zht": "整夜都在地平線以上", "bg": "Над хоризонта цяла нощ", "pl": "Nad horyzontem przez całą noc"},
    "cieloLunaNoSale": {"es": "No sale en toda la noche", "en": "Doesn’t rise all night", "fr": "Ne se lève pas de la nuit", "de": "Geht die ganze Nacht nicht auf", "it": "Non sorge per tutta la notte", "nl": "Komt de hele nacht niet op", "zh": "整夜不升起", "zht": "整夜不升起", "bg": "Не изгрява през цялата нощ", "pl": "Nie wschodzi przez całą noc"},
    "cieloEnConstelacion": {"es": "Constelación: {c}", "en": "Constellation: {c}", "fr": "Constellation : {c}", "de": "Sternbild: {c}", "it": "Costellazione: {c}", "nl": "Sterrenbeeld: {c}", "zh": "所在星座：{c}", "zht": "所在星座：{c}", "bg": "Съзвездие: {c}", "pl": "Gwiazdozbiór: {c}"},
    "cieloProxNueva": {"es": "Luna nueva: {f}", "en": "New Moon: {f}", "fr": "Nouvelle Lune : {f}", "de": "Neumond: {f}", "it": "Luna nuova: {f}", "nl": "Nieuwe maan: {f}", "zh": "新月：{f}", "zht": "新月：{f}", "bg": "Новолуние: {f}", "pl": "Nów: {f}"},
    "cieloProxLlena": {"es": "Luna llena: {f}", "en": "Full Moon: {f}", "fr": "Pleine Lune : {f}", "de": "Vollmond: {f}", "it": "Luna piena: {f}", "nl": "Volle maan: {f}", "zh": "满月：{f}", "zht": "滿月：{f}", "bg": "Пълнолуние: {f}", "pl": "Pełnia: {f}"},
    "cieloFaseNueva": {"es": "Luna nueva", "en": "New Moon", "fr": "Nouvelle Lune", "de": "Neumond", "it": "Luna nuova", "nl": "Nieuwe maan", "zh": "新月", "zht": "新月", "bg": "Новолуние", "pl": "Nów"},
    "cieloFaseCreciente": {"es": "Creciente", "en": "Waxing crescent", "fr": "Premier croissant", "de": "Zunehmende Sichel", "it": "Falce crescente", "nl": "Wassende sikkel", "zh": "蛾眉月", "zht": "眉月", "bg": "Растящ полумесец", "pl": "Sierp przybywający"},
    "cieloFaseCuartoCreciente": {"es": "Cuarto creciente", "en": "First quarter", "fr": "Premier quartier", "de": "Erstes Viertel", "it": "Primo quarto", "nl": "Eerste kwartier", "zh": "上弦月", "zht": "上弦月", "bg": "Първа четвърт", "pl": "Pierwsza kwadra"},
    "cieloFaseGibosaCreciente": {"es": "Gibosa creciente", "en": "Waxing gibbous", "fr": "Gibbeuse croissante", "de": "Zunehmender Mond", "it": "Gibbosa crescente", "nl": "Wassende maan", "zh": "盈凸月", "zht": "盈凸月", "bg": "Растяща Луна", "pl": "Przybywający garbaty"},
    "cieloFaseLlena": {"es": "Luna llena", "en": "Full Moon", "fr": "Pleine Lune", "de": "Vollmond", "it": "Luna piena", "nl": "Volle maan", "zh": "满月", "zht": "滿月", "bg": "Пълнолуние", "pl": "Pełnia"},
    "cieloFaseGibosaMenguante": {"es": "Gibosa menguante", "en": "Waning gibbous", "fr": "Gibbeuse décroissante", "de": "Abnehmender Mond", "it": "Gibbosa calante", "nl": "Afnemende maan", "zh": "亏凸月", "zht": "虧凸月", "bg": "Намаляваща Луна", "pl": "Ubywający garbaty"},
    "cieloFaseCuartoMenguante": {"es": "Cuarto menguante", "en": "Last quarter", "fr": "Dernier quartier", "de": "Letztes Viertel", "it": "Ultimo quarto", "nl": "Laatste kwartier", "zh": "下弦月", "zht": "下弦月", "bg": "Последна четвърт", "pl": "Ostatnia kwadra"},
    "cieloFaseMenguante": {"es": "Menguante", "en": "Waning crescent", "fr": "Dernier croissant", "de": "Abnehmende Sichel", "it": "Falce calante", "nl": "Afnemende sikkel", "zh": "残月", "zht": "殘月", "bg": "Намаляващ полумесец", "pl": "Sierp ubywający"},
    /* ── nubes (Open-Meteo) ─────────────────────────────────────────────── */
    "cieloNubes": {"es": "Previsión de nubes", "en": "Cloud forecast", "fr": "Prévision des nuages", "de": "Wolkenvorhersage", "it": "Previsione delle nuvole", "nl": "Wolkenverwachting", "zh": "云量预报", "zht": "雲量預報", "bg": "Прогноза за облачност", "pl": "Prognoza zachmurzenia"},
    "cieloNubesHora": {"es": "{h}: nubes medias y altas {a} %, bajas {b} %", "en": "{h}: mid and high cloud {a}%, low {b}%", "fr": "{h} : nuages moyens et hauts {a} %, bas {b} %", "de": "{h}: mittlere und hohe Wolken {a} %, tiefe {b} %", "it": "{h}: nuvole medie e alte {a}%, basse {b}%", "nl": "{h}: middelhoge en hoge bewolking {a}%, lage {b}%", "zh": "{h}：中高云{a}%，低云{b}%", "zht": "{h}：中高雲{a}%，低雲{b}%", "bg": "{h}: средни и високи облаци {a} %, ниски {b} %", "pl": "{h}: chmury średnie i wysokie {a}%, niskie {b}%"},
    "cieloNubesAltas": {"es": "Nubes medias y altas (media)", "en": "Mid and high cloud (average)", "fr": "Nuages moyens et hauts (moyenne)", "de": "Mittlere und hohe Wolken (Mittel)", "it": "Nuvole medie e alte (media)", "nl": "Middelhoge en hoge bewolking (gemiddeld)", "zh": "中高云（平均）", "zht": "中高雲（平均）", "bg": "Средни и високи облаци (средно)", "pl": "Chmury średnie i wysokie (średnio)"},
    "cieloNubesBajas": {"es": "Nubes bajas (media)", "en": "Low cloud (average)", "fr": "Nuages bas (moyenne)", "de": "Tiefe Wolken (Mittel)", "it": "Nuvole basse (media)", "nl": "Lage bewolking (gemiddeld)", "zh": "低云（平均）", "zht": "低雲（平均）", "bg": "Ниски облаци (средно)", "pl": "Chmury niskie (średnio)"},
    "cieloNubesNota": {"es": "Previsión de Open-Meteo para Izaña en las horas de noche cerrada. Las nubes bajas, hasta 3 km, van aparte: suelen ser el mar de nubes, que normalmente se queda por debajo de las cumbres.", "en": "Open-Meteo forecast for Izaña during the hours of full darkness. Low cloud, up to 3 km, is shown separately: it is usually the sea of clouds, which normally stays below the summits.", "fr": "Prévision Open-Meteo pour Izaña pendant les heures de nuit noire. Les nuages bas, jusqu’à 3 km, sont à part : c’est souvent la mer de nuages, qui reste normalement sous les sommets.", "de": "Open-Meteo-Vorhersage für Izaña in den Stunden voller Dunkelheit. Tiefe Wolken bis 3 km stehen getrennt: Meist ist das das Wolkenmeer, das normalerweise unter den Gipfeln bleibt.", "it": "Previsione Open-Meteo per Izaña nelle ore di buio completo. Le nuvole basse, fino a 3 km, sono a parte: di solito sono il mare di nuvole, che normalmente resta sotto le vette.", "nl": "Verwachting van Open-Meteo voor Izaña in de uren van volledig donker. Lage bewolking tot 3 km staat apart: dat is meestal de wolkenzee, die normaal onder de toppen blijft.", "zh": "Open-Meteo对伊萨尼亚完全天黑时段的预报。3公里以下的低云单独列出：通常是云海，一般停留在山峰以下。", "zht": "Open-Meteo對伊薩尼亞完全天黑時段的預報。3公里以下的低雲單獨列出：通常是雲海，一般停留在山峰以下。", "bg": "Прогноза на Open-Meteo за Исаня за часовете на пълна тъмнина. Ниските облаци до 3 км са отделно: обикновено това е морето от облаци, което остава под върховете.", "pl": "Prognoza Open-Meteo dla Izañi na godziny pełnej ciemności. Chmury niskie, do 3 km, są osobno: najczęściej to morze chmur, które zazwyczaj zostaje poniżej szczytów."},
    /* ── planetas ───────────────────────────────────────────────────────── */
    "cieloPlanetas": {"es": "Planetas", "en": "Planets", "fr": "Planètes", "de": "Planeten", "it": "Pianeti", "nl": "Planeten", "zh": "行星", "zht": "行星", "bg": "Планети", "pl": "Planety"},
    "cieloSinPlanetas": {"es": "Ningún planeta a la vista: todos están demasiado cerca del Sol o bajo el horizonte.", "en": "No planets on view: all are too close to the Sun or below the horizon.", "fr": "Aucune planète visible : toutes sont trop près du Soleil ou sous l’horizon.", "de": "Kein Planet zu sehen: Alle stehen zu nah an der Sonne oder unter dem Horizont.", "it": "Nessun pianeta visibile: sono tutti troppo vicini al Sole o sotto l’orizzonte.", "nl": "Geen planeet te zien: ze staan allemaal te dicht bij de zon of onder de horizon.", "zh": "看不到行星：它们都离太阳太近或在地平线以下。", "zht": "看不到行星：它們都離太陽太近或在地平線以下。", "bg": "Не се вижда нито една планета: всички са твърде близо до Слънцето или под хоризонта.", "pl": "Nie widać żadnej planety: wszystkie są za blisko Słońca albo pod horyzontem."},
    "cieloVisibleBreve": {"es": "Solo un rato hacia las {h}, muy bajo: a {alt}° {dir}", "en": "Only briefly around {h}, very low: {alt}° high {dir}", "fr": "Seulement un moment vers {h}, très bas : à {alt}° {dir}", "de": "Nur kurz gegen {h}, sehr tief: {alt}° hoch {dir}", "it": "Solo per poco verso le {h}, molto basso: a {alt}° {dir}", "nl": "Alleen even rond {h}, heel laag: {alt}° hoog {dir}", "zh": "仅在{h}前后短暂可见，位置很低：{dir}，高度{alt}°", "zht": "僅在{h}前後短暫可見，位置很低：{dir}，高度{alt}°", "bg": "Само за кратко около {h}, много ниско: на {alt}° височина {dir}", "pl": "Tylko przez chwilę około {h}, bardzo nisko: {alt}° nad horyzontem {dir}"},
    "cieloVisibleDeA": {"es": "Visible de {a} a {b}", "en": "Visible {a}–{b}", "fr": "Visible de {a} à {b}", "de": "Sichtbar von {a} bis {b}", "it": "Visibile dalle {a} alle {b}", "nl": "Zichtbaar van {a} tot {b}", "zh": "{a}至{b}可见", "zht": "{a}至{b}可見", "bg": "Вижда се от {a} до {b}", "pl": "Widoczna od {a} do {b}"},
    "cieloMejorA": {"es": "Mejor a las {h}, a {alt}° {dir}", "en": "Best at {h}, {alt}° high {dir}", "fr": "Au mieux à {h}, à {alt}° {dir}", "de": "Am besten um {h}, {alt}° hoch {dir}", "it": "Al meglio alle {h}, a {alt}° {dir}", "nl": "Het best om {h}, {alt}° hoog {dir}", "zh": "{h}最佳：{dir}，高度{alt}°", "zht": "{h}最佳：{dir}，高度{alt}°", "bg": "Най-добре в {h}, на {alt}° височина {dir}", "pl": "Najlepiej o {h}, {alt}° nad horyzontem {dir}"},
    "cieloMagEn": {"es": "mag. {m} · {c}", "en": "mag {m} · {c}", "fr": "mag. {m} · {c}", "de": "{m} mag · {c}", "it": "mag. {m} · {c}", "nl": "mag. {m} · {c}", "zh": "星等{m} · {c}", "zht": "星等{m} · {c}", "bg": "{m} зв. вел. · {c}", "pl": "{m} mag · {c}"},
    "cieloMag": {"es": "mag. {m}", "en": "mag {m}", "fr": "mag. {m}", "de": "{m} mag", "it": "mag. {m}", "nl": "mag. {m}", "zh": "星等{m}", "zht": "星等{m}", "bg": "{m} зв. вел.", "pl": "{m} mag"},
    "cieloViaLactea": {"es": "Vía Láctea", "en": "Milky Way", "fr": "Voie lactée", "de": "Milchstraße", "it": "Via Lattea", "nl": "Melkweg", "zh": "银河", "zht": "銀河", "bg": "Млечният път", "pl": "Droga Mleczna"},
    "cieloViaLacteaSi": {"es": "Su parte más brillante, hacia el centro de la galaxia (Sagitario), se ve de {a} a {b}; lo más alto que sube es {alt}° {dir}.", "en": "Its brightest part, towards the galactic center in Sagittarius, is on view from {a} to {b}; at most {alt}° high {dir}.", "fr": "Sa partie la plus brillante, vers le centre de la galaxie (Sagittaire), est visible de {a} à {b} ; au plus haut, {alt}° {dir}.", "de": "Ihr hellster Teil, Richtung Zentrum der Galaxis (Schütze), ist von {a} bis {b} zu sehen; höchstens {alt}° hoch {dir}.", "it": "La sua parte più luminosa, verso il centro della galassia (Sagittario), si vede dalle {a} alle {b}; al massimo a {alt}° {dir}.", "nl": "Het helderste deel, richting het centrum van de Melkweg (Boogschutter), is te zien van {a} tot {b}; hoogstens {alt}° hoog {dir}.", "zh": "最亮的部分在人马座方向的银河系中心，{a}至{b}可见，最高{alt}°，位于{dir}。", "zht": "最亮的部分在人馬座方向的銀河系中心，{a}至{b}可見，最高{alt}°，位於{dir}。", "bg": "Най-ярката ѝ част, към центъра на Галактиката (Стрелец), се вижда от {a} до {b}; издига се най-много на {alt}° {dir}.", "pl": "Jej najjaśniejsza część, w stronę centrum Galaktyki (Strzelec), jest widoczna od {a} do {b}; najwyżej {alt}° nad horyzontem {dir}."},
    "cieloViaLacteaLuna": {"es": "El centro de la galaxia sube en plena noche, pero con la Luna arriba: su luz la borra.", "en": "The galactic center is up in the dark hours, but so is the Moon, and its light washes the Milky Way out.", "fr": "Le centre de la galaxie est levé en pleine nuit, mais la Lune aussi : sa lumière efface la Voie lactée.", "de": "Das Zentrum der Galaxis steht in der dunklen Zeit am Himmel, aber der Mond auch: Sein Licht überstrahlt die Milchstraße.", "it": "Il centro della galassia è alto nelle ore buie, ma c’è anche la Luna: la sua luce cancella la Via Lattea.", "nl": "Het centrum van de Melkweg staat in de donkere uren aan de hemel, maar de maan ook, en haar licht overstraalt de Melkweg.", "zh": "银河系中心在夜间升起，但月亮也在天上，月光会把银河冲淡。", "zht": "銀河系中心在夜間升起，但月亮也在天上，月光會把銀河沖淡。", "bg": "Центърът на Галактиката изгрява през тъмните часове, но и Луната е горе и светлината ѝ заличава Млечния път.", "pl": "Centrum Galaktyki wschodzi w ciemnych godzinach, ale Księżyc też jest na niebie i jego światło zaciera Drogę Mleczną."},
    "cieloViaLacteaNo": {"es": "En esta época el centro de la galaxia no está alto en plena noche: queda de día o bajo el horizonte.", "en": "At this time of year the galactic center isn’t high during full darkness: it is up by day or below the horizon.", "fr": "À cette période, le centre de la galaxie n’est pas haut en pleine nuit : il est levé de jour ou sous l’horizon.", "de": "In dieser Jahreszeit steht das Zentrum der Galaxis bei voller Dunkelheit nicht hoch: Es ist tagsüber am Himmel oder unter dem Horizont.", "it": "In questo periodo il centro della galassia non è alto a notte fonda: è sopra l’orizzonte di giorno o sotto l’orizzonte.", "nl": "In deze tijd van het jaar staat het centrum van de Melkweg niet hoog als het volledig donker is: het staat overdag aan de hemel of onder de horizon.", "zh": "这个时节，完全天黑时银河系中心不在高处：它白天才升起，或位于地平线以下。", "zht": "這個時節，完全天黑時銀河系中心不在高處：它白天才升起，或位於地平線以下。", "bg": "По това време на годината центърът на Галактиката не е високо при пълна тъмнина: изгрява през деня или е под хоризонта.", "pl": "O tej porze roku centrum Galaktyki nie jest wysoko w pełnej ciemności: wschodzi za dnia albo jest pod horyzontem."},
    "cieloViaLacteaVuelve": {"es": "Vuelve a verse desde la noche del {f}.", "en": "It returns from the night of {f}.", "fr": "Elle revient à partir de la nuit du {f}.", "de": "Ab der Nacht vom {f} ist sie wieder zu sehen.", "it": "Torna visibile dalla notte del {f}.", "nl": "Vanaf de nacht van {f} is hij weer te zien.", "zh": "从{f}夜间起再次可见。", "zht": "從{f}夜間起再次可見。", "bg": "Отново се вижда от нощта на {f}.", "pl": "Znów widać ją od nocy: {f}."},
    "cieloViaLacteaNota": {"es": "Para verla: lejos de las luces, sin Luna y tras al menos 20 minutos de vista adaptada a la oscuridad. Desde las cumbres se ve a simple vista.", "en": "To see it: away from lights, with no Moon, after at least 20 minutes letting your eyes adapt to the dark. From the summits it is visible to the naked eye.", "fr": "Pour la voir : loin des lumières, sans Lune, après au moins 20 minutes d’adaptation des yeux à l’obscurité. Depuis les sommets, elle se voit à l’œil nu.", "de": "So siehst du sie: fern von Lichtern, ohne Mond und nach mindestens 20 Minuten Gewöhnung der Augen an die Dunkelheit. Von den Gipfeln aus ist sie mit bloßem Auge sichtbar.", "it": "Per vederla: lontano dalle luci, senza Luna e dopo almeno 20 minuti di adattamento degli occhi al buio. Dalle vette si vede a occhio nudo.", "nl": "Zo zie je hem: ver van lichten, zonder maan en nadat je ogen minstens 20 minuten aan het donker gewend zijn. Vanaf de toppen is hij met het blote oog te zien.", "zh": "观看要点：远离灯光、没有月亮，并让眼睛适应黑暗至少20分钟。在山顶用肉眼即可看到。", "zht": "觀看要點：遠離燈光、沒有月亮，並讓眼睛適應黑暗至少20分鐘。在山頂用肉眼即可看到。", "bg": "За да го видите: далеч от светлини, без Луна и след поне 20 минути, през които очите свикват с тъмнината. От върховете се вижда с просто око.", "pl": "Jak ją zobaczyć: z dala od świateł, bez Księżyca i po co najmniej 20 minutach przyzwyczajania oczu do ciemności. Ze szczytów widać ją gołym okiem."},
    "cieloMejores": {"es": "Lo mejor de la noche", "en": "Best of the night", "fr": "Le meilleur de la nuit", "de": "Das Beste der Nacht", "it": "Il meglio della notte", "nl": "Het mooiste van de nacht", "zh": "夜空精选", "zht": "夜空精選", "bg": "Най-доброто от нощта", "pl": "Najlepsze tej nocy"},
    "cieloLunaApaga": {"es": "Con la Luna brillante arriba casi toda la noche, las galaxias y nebulosas débiles no se distinguen: mejor cúmulos y estrellas dobles.", "en": "With a bright Moon up most of the night, faint galaxies and nebulae are lost: go for clusters and double stars.", "fr": "Avec une Lune brillante levée presque toute la nuit, les galaxies et nébuleuses faibles disparaissent : mieux vaut les amas et les étoiles doubles.", "de": "Mit hellem Mond fast die ganze Nacht am Himmel gehen schwache Galaxien und Nebel unter: lieber Sternhaufen und Doppelsterne.", "it": "Con la Luna luminosa alta quasi tutta la notte, galassie e nebulose deboli spariscono: meglio ammassi e stelle doppie.", "nl": "Met een heldere maan bijna de hele nacht aan de hemel vallen zwakke sterrenstelsels en nevels weg: kies voor sterrenhopen en dubbelsterren.", "zh": "明亮的月亮几乎整夜高挂，暗弱的星系和星云难以分辨：更适合看星团和双星。", "zht": "明亮的月亮幾乎整夜高掛，暗弱的星系和星雲難以分辨：更適合看星團和雙星。", "bg": "При ярка Луна почти цяла нощ слабите галактики и мъглявини се губят: по-добре звездни купове и двойни звезди.", "pl": "Przy jasnym Księżycu przez prawie całą noc słabe galaktyki i mgławice znikają: lepiej gromady i gwiazdy podwójne."},
    "cieloTipoDoble": {"es": "Estrella doble", "en": "Double star", "fr": "Étoile double", "de": "Doppelstern", "it": "Stella doppia", "nl": "Dubbelster", "zh": "双星", "zht": "雙星", "bg": "Двойна звезда", "pl": "Gwiazda podwójna"},
    "cieloTipoEstrella": {"es": "Estrella", "en": "Star", "fr": "Étoile", "de": "Stern", "it": "Stella", "nl": "Ster", "zh": "恒星", "zht": "恆星", "bg": "Звезда", "pl": "Gwiazda"},
    "cieloProximo": {"es": "Lo próximo en el calendario", "en": "Coming up", "fr": "Prochainement", "de": "Demnächst", "it": "Prossimamente", "nl": "Binnenkort", "zh": "即将到来", "zht": "即將到來", "bg": "Предстои", "pl": "Wkrótce"},
    "cieloVerCalendario": {"es": "Ver el calendario", "en": "See the calendar", "fr": "Voir le calendrier", "de": "Zum Kalender", "it": "Vedi il calendario", "nl": "Bekijk de kalender", "zh": "查看天象日历", "zht": "查看天象日曆", "bg": "Към календара", "pl": "Zobacz kalendarz"},
    /* Los ocho rumbos: abreviados en la carta del cielo, enteros en las frases */
    "cieloRumboN": {"es": "N", "en": "N", "fr": "N", "de": "N", "it": "N", "nl": "N", "zh": "北", "zht": "北", "bg": "С", "pl": "N"},
    "cieloHaciaN": {"es": "hacia el norte", "en": "in the north", "fr": "vers le nord", "de": "im Norden", "it": "verso nord", "nl": "in het noorden", "zh": "北方", "zht": "北方", "bg": "на север", "pl": "na północy"},
    "cieloRumboNE": {"es": "NE", "en": "NE", "fr": "NE", "de": "NO", "it": "NE", "nl": "NO", "zh": "东北", "zht": "東北", "bg": "СИ", "pl": "NE"},
    "cieloHaciaNE": {"es": "hacia el noreste", "en": "in the north-east", "fr": "vers le nord-est", "de": "im Nordosten", "it": "verso nord-est", "nl": "in het noordoosten", "zh": "东北方", "zht": "東北方", "bg": "на североизток", "pl": "na północnym wschodzie"},
    "cieloRumboE": {"es": "E", "en": "E", "fr": "E", "de": "O", "it": "E", "nl": "O", "zh": "东", "zht": "東", "bg": "И", "pl": "E"},
    "cieloHaciaE": {"es": "hacia el este", "en": "in the east", "fr": "vers l’est", "de": "im Osten", "it": "verso est", "nl": "in het oosten", "zh": "东方", "zht": "東方", "bg": "на изток", "pl": "na wschodzie"},
    "cieloRumboSE": {"es": "SE", "en": "SE", "fr": "SE", "de": "SO", "it": "SE", "nl": "ZO", "zh": "东南", "zht": "東南", "bg": "ЮИ", "pl": "SE"},
    "cieloHaciaSE": {"es": "hacia el sureste", "en": "in the south-east", "fr": "vers le sud-est", "de": "im Südosten", "it": "verso sud-est", "nl": "in het zuidoosten", "zh": "东南方", "zht": "東南方", "bg": "на югоизток", "pl": "na południowym wschodzie"},
    "cieloRumboS": {"es": "S", "en": "S", "fr": "S", "de": "S", "it": "S", "nl": "Z", "zh": "南", "zht": "南", "bg": "Ю", "pl": "S"},
    "cieloHaciaS": {"es": "hacia el sur", "en": "in the south", "fr": "vers le sud", "de": "im Süden", "it": "verso sud", "nl": "in het zuiden", "zh": "南方", "zht": "南方", "bg": "на юг", "pl": "na południu"},
    "cieloRumboSO": {"es": "SO", "en": "SW", "fr": "SO", "de": "SW", "it": "SO", "nl": "ZW", "zh": "西南", "zht": "西南", "bg": "ЮЗ", "pl": "SW"},
    "cieloHaciaSO": {"es": "hacia el suroeste", "en": "in the south-west", "fr": "vers le sud-ouest", "de": "im Südwesten", "it": "verso sud-ovest", "nl": "in het zuidwesten", "zh": "西南方", "zht": "西南方", "bg": "на югозапад", "pl": "na południowym zachodzie"},
    "cieloRumboO": {"es": "O", "en": "W", "fr": "O", "de": "W", "it": "O", "nl": "W", "zh": "西", "zht": "西", "bg": "З", "pl": "W"},
    "cieloHaciaO": {"es": "hacia el oeste", "en": "in the west", "fr": "vers l’ouest", "de": "im Westen", "it": "verso ovest", "nl": "in het westen", "zh": "西方", "zht": "西方", "bg": "на запад", "pl": "na zachodzie"},
    "cieloRumboNO": {"es": "NO", "en": "NW", "fr": "NO", "de": "NW", "it": "NO", "nl": "NW", "zh": "西北", "zht": "西北", "bg": "СЗ", "pl": "NW"},
    "cieloHaciaNO": {"es": "hacia el noroeste", "en": "in the north-west", "fr": "vers le nord-ouest", "de": "im Nordwesten", "it": "verso nord-ovest", "nl": "in het noordwesten", "zh": "西北方", "zht": "西北方", "bg": "на северозапад", "pl": "na północnym zachodzie"},
    /* Calendario: filtros, titulos y detalles de cada fenomeno */
    "cieloCalTodo": {"es": "Todo", "en": "All", "fr": "Tout", "de": "Alle", "it": "Tutto", "nl": "Alles", "zh": "全部", "zht": "全部", "bg": "Всичко", "pl": "Wszystko"},
    "cieloCalLluvias": {"es": "Lluvias de estrellas", "en": "Meteor showers", "fr": "Étoiles filantes", "de": "Sternschnuppen", "it": "Stelle cadenti", "nl": "Meteorenzwermen", "zh": "流星雨", "zht": "流星雨", "bg": "Метеорни потоци", "pl": "Roje meteorów"},
    "cieloCalEclipses": {"es": "Eclipses", "en": "Eclipses", "fr": "Éclipses", "de": "Finsternisse", "it": "Eclissi", "nl": "Eclipsen", "zh": "日月食", "zht": "日月食", "bg": "Затъмнения", "pl": "Zaćmienia"},
    "cieloCalPlanetas": {"es": "Planetas", "en": "Planets", "fr": "Planètes", "de": "Planeten", "it": "Pianeti", "nl": "Planeten", "zh": "行星", "zht": "行星", "bg": "Планети", "pl": "Planety"},
    "cieloCalSolLuna": {"es": "Sol y Luna", "en": "Sun and Moon", "fr": "Soleil et Lune", "de": "Sonne und Mond", "it": "Sole e Luna", "nl": "Zon en maan", "zh": "日与月", "zht": "日與月", "bg": "Слънце и Луна", "pl": "Słońce i Księżyc"},
    "cieloSinEventos": {"es": "No hay nada de este tipo en las fechas calculadas.", "en": "Nothing of this kind in the dates calculated.", "fr": "Rien de ce type aux dates calculées.", "de": "Nichts dieser Art im berechneten Zeitraum.", "it": "Niente di questo tipo nelle date calcolate.", "nl": "Niets van deze soort in de berekende periode.", "zh": "计算范围内没有此类天象。", "zht": "計算範圍內沒有此類天象。", "bg": "Няма нищо такова в изчисления период.", "pl": "Nic takiego w obliczonym okresie."},
    "cieloEvLluvia": {"es": "Lluvia de estrellas: {n}", "en": "Meteor shower: {n}", "fr": "Étoiles filantes : {n}", "de": "Sternschnuppen: {n}", "it": "Stelle cadenti: {n}", "nl": "Meteorenzwerm: {n}", "zh": "流星雨：{n}", "zht": "流星雨：{n}", "bg": "Метеорен поток: {n}", "pl": "Rój meteorów: {n}"},
    "cieloEvEclipseSolTotal": {"es": "Eclipse total de Sol", "en": "Total solar eclipse", "fr": "Éclipse totale de Soleil", "de": "Totale Sonnenfinsternis", "it": "Eclissi totale di Sole", "nl": "Totale zonsverduistering", "zh": "日全食", "zht": "日全食", "bg": "Пълно слънчево затъмнение", "pl": "Całkowite zaćmienie Słońca"},
    "cieloEvEclipseSolAnular": {"es": "Eclipse anular de Sol", "en": "Annular solar eclipse", "fr": "Éclipse annulaire de Soleil", "de": "Ringförmige Sonnenfinsternis", "it": "Eclissi anulare di Sole", "nl": "Ringvormige zonsverduistering", "zh": "日环食", "zht": "日環食", "bg": "Пръстеновидно слънчево затъмнение", "pl": "Obrączkowe zaćmienie Słońca"},
    "cieloEvEclipseSolHibrido": {"es": "Eclipse híbrido de Sol", "en": "Hybrid solar eclipse", "fr": "Éclipse hybride de Soleil", "de": "Hybride Sonnenfinsternis", "it": "Eclissi ibrida di Sole", "nl": "Hybride zonsverduistering", "zh": "日全环食", "zht": "日全環食", "bg": "Хибридно слънчево затъмнение", "pl": "Hybrydowe zaćmienie Słońca"},
    "cieloEvEclipseSolParcial": {"es": "Eclipse parcial de Sol", "en": "Partial solar eclipse", "fr": "Éclipse partielle de Soleil", "de": "Partielle Sonnenfinsternis", "it": "Eclissi parziale di Sole", "nl": "Gedeeltelijke zonsverduistering", "zh": "日偏食", "zht": "日偏食", "bg": "Частично слънчево затъмнение", "pl": "Częściowe zaćmienie Słońca"},
    "cieloEvEclipseLunaTotal": {"es": "Eclipse total de Luna", "en": "Total lunar eclipse", "fr": "Éclipse totale de Lune", "de": "Totale Mondfinsternis", "it": "Eclissi totale di Luna", "nl": "Totale maansverduistering", "zh": "月全食", "zht": "月全食", "bg": "Пълно лунно затъмнение", "pl": "Całkowite zaćmienie Księżyca"},
    "cieloEvEclipseLunaParcial": {"es": "Eclipse parcial de Luna", "en": "Partial lunar eclipse", "fr": "Éclipse partielle de Lune", "de": "Partielle Mondfinsternis", "it": "Eclissi parziale di Luna", "nl": "Gedeeltelijke maansverduistering", "zh": "月偏食", "zht": "月偏食", "bg": "Частично лунно затъмнение", "pl": "Częściowe zaćmienie Księżyca"},
    "cieloEvEclipseLunaPenumbral": {"es": "Eclipse penumbral de Luna", "en": "Penumbral lunar eclipse", "fr": "Éclipse pénombrale de Lune", "de": "Halbschatten-Mondfinsternis", "it": "Eclissi penombrale di Luna", "nl": "Bijschaduw-maansverduistering", "zh": "半影月食", "zht": "半影月食", "bg": "Полусянково лунно затъмнение", "pl": "Półcieniowe zaćmienie Księżyca"},
    "cieloEvOposicion": {"es": "{p} en oposición", "en": "{p} at opposition", "fr": "{p} à l’opposition", "de": "{p} in Opposition", "it": "{p} in opposizione", "nl": "{p} in oppositie", "zh": "{p}冲日", "zht": "{p}衝日", "bg": "{p} в опозиция", "pl": "{p} w opozycji"},
    "cieloEvElongTarde": {"es": "{p}: máxima elongación de tarde", "en": "{p}: greatest evening elongation", "fr": "{p} : plus grande élongation du soir", "de": "{p}: größte Elongation am Abendhimmel", "it": "{p}: massima elongazione serale", "nl": "{p}: grootste elongatie aan de avondhemel", "zh": "{p}东大距（黄昏可见）", "zht": "{p}東大距（黃昏可見）", "bg": "{p}: най-голяма вечерна елонгация", "pl": "{p}: największa elongacja wieczorna"},
    "cieloEvElongManana": {"es": "{p}: máxima elongación de madrugada", "en": "{p}: greatest morning elongation", "fr": "{p} : plus grande élongation du matin", "de": "{p}: größte Elongation am Morgenhimmel", "it": "{p}: massima elongazione mattutina", "nl": "{p}: grootste elongatie aan de ochtendhemel", "zh": "{p}西大距（黎明可见）", "zht": "{p}西大距（黎明可見）", "bg": "{p}: най-голяма сутрешна елонгация", "pl": "{p}: największa elongacja poranna"},
    "cieloEvConjuncion": {"es": "{a} y {b}, juntos en el cielo", "en": "{a} and {b} close together", "fr": "{a} et {b} rapprochés", "de": "{a} und {b} dicht beieinander", "it": "{a} e {b} vicini nel cielo", "nl": "{a} en {b} dicht bij elkaar", "zh": "{a}与{b}相合", "zht": "{a}與{b}相合", "bg": "Сближение: {a} и {b}", "pl": "{a} i {b} blisko siebie"},
    "cieloEvLunaCerca": {"es": "La Luna llena más cercana a la Tierra de los próximos 12 meses", "en": "Full Moon closest to Earth in the next 12 months", "fr": "Pleine Lune la plus proche de la Terre des 12 prochains mois", "de": "Vollmond mit dem geringsten Erdabstand der nächsten 12 Monate", "it": "La Luna piena più vicina alla Terra dei prossimi 12 mesi", "nl": "Volle maan het dichtst bij de aarde in de komende 12 maanden", "zh": "未来12个月内离地球最近的满月", "zht": "未來12個月內離地球最近的滿月", "bg": "Пълнолунието най-близо до Земята през следващите 12 месеца", "pl": "Pełnia najbliżej Ziemi w ciągu najbliższych 12 miesięcy"},
    "cieloEquinoccioMarzo": {"es": "Equinoccio de marzo", "en": "March equinox", "fr": "Équinoxe de mars", "de": "März-Tagundnachtgleiche", "it": "Equinozio di marzo", "nl": "Maart-equinox", "zh": "春分", "zht": "春分", "bg": "Мартенско равноденствие", "pl": "Równonoc marcowa"},
    "cieloSolsticioJunio": {"es": "Solsticio de junio", "en": "June solstice", "fr": "Solstice de juin", "de": "Juni-Sonnenwende", "it": "Solstizio di giugno", "nl": "Junizonnewende", "zh": "夏至", "zht": "夏至", "bg": "Юнско слънцестоене", "pl": "Przesilenie czerwcowe"},
    "cieloEquinoccioSeptiembre": {"es": "Equinoccio de septiembre", "en": "September equinox", "fr": "Équinoxe de septembre", "de": "September-Tagundnachtgleiche", "it": "Equinozio di settembre", "nl": "September-equinox", "zh": "秋分", "zht": "秋分", "bg": "Септемврийско равноденствие", "pl": "Równonoc wrześniowa"},
    "cieloSolsticioDiciembre": {"es": "Solsticio de diciembre", "en": "December solstice", "fr": "Solstice de décembre", "de": "Dezember-Sonnenwende", "it": "Solstizio di dicembre", "nl": "Decemberzonnewende", "zh": "冬至", "zht": "冬至", "bg": "Декемврийско слънцестоене", "pl": "Przesilenie grudniowe"},
    "cieloLluviaMax": {"es": "Máximo: {f}, hacia las {h}", "en": "Peak: {f}, around {h}", "fr": "Maximum : {f}, vers {h}", "de": "Maximum: {f}, gegen {h}", "it": "Massimo: {f}, verso le {h}", "nl": "Maximum: {f}, rond {h}", "zh": "极大：{f} {h}前后", "zht": "極大：{f} {h}前後", "bg": "Максимум: {f}, около {h}", "pl": "Maksimum: {f}, około {h}"},
    "cieloLluviaThz": {"es": "Tasa teórica (THZ): {z} meteoros por hora con el radiante en el cenit y un cielo perfecto; en la práctica se ven menos.", "en": "Theoretical rate (ZHR): {z} meteors per hour with the radiant at the zenith and a perfect sky; in practice you see fewer.", "fr": "Taux théorique (THZ) : {z} météores par heure avec le radiant au zénith et un ciel parfait ; en pratique, on en voit moins.", "de": "Theoretische Rate (ZHR): {z} Meteore pro Stunde bei Radiant im Zenit und perfektem Himmel; in der Praxis sieht man weniger.", "it": "Tasso teorico (THZ): {z} meteore all’ora con il radiante allo zenit e un cielo perfetto; in pratica se ne vedono meno.", "nl": "Theoretische frequentie (ZHR): {z} meteoren per uur met de radiant in het zenit en een perfecte hemel; in de praktijk zie je er minder.", "zh": "理论流量（ZHR）：辐射点位于天顶且天空完美时每小时{z}颗；实际看到的会更少。", "zht": "理論流量（ZHR）：輻射點位於天頂且天空完美時每小時{z}顆；實際看到的會更少。", "bg": "Теоретична честота (ZHR): {z} метеора в час при радиант в зенита и идеално небе; на практика се виждат по-малко.", "pl": "Teoretyczna liczba meteorów na godzinę (ZHR): {z}, przy radiancie w zenicie i idealnym niebie; w praktyce widać mniej."},
    "cieloLluviaThzVar": {"es": "La tasa cambia mucho de un año a otro.", "en": "The rate varies a lot from year to year.", "fr": "Le taux varie beaucoup d’une année à l’autre.", "de": "Die Rate schwankt stark von Jahr zu Jahr.", "it": "Il tasso varia molto da un anno all’altro.", "nl": "De frequentie verschilt sterk per jaar.", "zh": "流量每年差别很大。", "zht": "流量每年差別很大。", "bg": "Честотата силно се мени от година на година.", "pl": "Liczba bardzo się zmienia z roku na rok."},
    "cieloLluviaMejor": {"es": "Mejor momento: {f}, {h}, con el radiante a {alt}° {dir}", "en": "Best time: {f}, {h}, radiant {alt}° high {dir}", "fr": "Meilleur moment : {f}, {h}, radiant à {alt}° {dir}", "de": "Beste Zeit: {f}, {h}, Radiant {alt}° hoch {dir}", "it": "Momento migliore: {f}, {h}, radiante a {alt}° {dir}", "nl": "Beste moment: {f}, {h}, radiant {alt}° hoog {dir}", "zh": "最佳时刻：{f} {h}，辐射点在{dir}，高度{alt}°", "zht": "最佳時刻：{f} {h}，輻射點在{dir}，高度{alt}°", "bg": "Най-добро време: {f}, {h}, радиантът на {alt}° височина {dir}", "pl": "Najlepszy moment: {f}, {h}, radiant {alt}° nad horyzontem {dir}"},
    "cieloLluviaLuna": {"es": "Luna iluminada al {p} %", "en": "Moon {p}% lit", "fr": "Lune éclairée à {p} %", "de": "Mond zu {p} % beleuchtet", "it": "Luna illuminata al {p}%", "nl": "Maan {p}% verlicht", "zh": "月亮照亮{p}%", "zht": "月亮照亮{p}%", "bg": "Луната е осветена {p} %", "pl": "Księżyc oświetlony w {p}%"},
    "cieloLluviaLunaAbajo": {"es": "(bajo el horizonte a esa hora)", "en": "(below the horizon at that time)", "fr": "(sous l’horizon à cette heure)", "de": "(zu dieser Zeit unter dem Horizont)", "it": "(sotto l’orizzonte a quell’ora)", "nl": "(op dat moment onder de horizon)", "zh": "（此时在地平线以下）", "zht": "（此時在地平線以下）", "bg": "(под хоризонта по това време)", "pl": "(o tej porze pod horyzontem)"},
    "cieloCondBuenas": {"es": "Buenas condiciones", "en": "Good conditions", "fr": "Bonnes conditions", "de": "Gute Bedingungen", "it": "Buone condizioni", "nl": "Goede omstandigheden", "zh": "条件良好", "zht": "條件良好", "bg": "Добри условия", "pl": "Dobre warunki"},
    "cieloCondRegulares": {"es": "Condiciones regulares", "en": "Fair conditions", "fr": "Conditions moyennes", "de": "Mäßige Bedingungen", "it": "Condizioni discrete", "nl": "Matige omstandigheden", "zh": "条件一般", "zht": "條件一般", "bg": "Средни условия", "pl": "Przeciętne warunki"},
    "cieloCondMalas": {"es": "Malas condiciones: la luz de la Luna", "en": "Poor conditions: moonlight", "fr": "Mauvaises conditions : clair de Lune", "de": "Schlechte Bedingungen: Mondlicht", "it": "Cattive condizioni: luce lunare", "nl": "Slechte omstandigheden: maanlicht", "zh": "条件较差：月光干扰", "zht": "條件較差：月光干擾", "bg": "Лоши условия: лунна светлина", "pl": "Złe warunki: światło Księżyca"},
    "cieloEclSolTenerife": {"es": "Desde Tenerife se ve parcial: en el máximo, la Luna cubre el {p} % del disco solar.", "en": "From Tenerife it is partial: at maximum the Moon covers {p}% of the Sun’s disc.", "fr": "Depuis Tenerife, elle est partielle : au maximum, la Lune couvre {p} % du disque solaire.", "de": "Von Teneriffa aus partiell: Im Maximum bedeckt der Mond {p} % der Sonnenscheibe.", "it": "Da Tenerife è parziale: al massimo la Luna copre il {p}% del disco solare.", "nl": "Vanaf Tenerife gedeeltelijk: op het maximum bedekt de maan {p}% van de zonneschijf.", "zh": "在特内里费为偏食：食甚时月亮遮住太阳圆面的{p}%。", "zht": "在特內里費為偏食：食甚時月亮遮住太陽圓面的{p}%。", "bg": "От Тенерифе е частично: в максимума Луната закрива {p} % от слънчевия диск.", "pl": "Z Teneryfy częściowe: w maksimum Księżyc zakrywa {p}% tarczy Słońca."},
    "cieloEclSolLocalTotal": {"es": "Desde Tenerife se ve total.", "en": "From Tenerife it is total.", "fr": "Depuis Tenerife, elle est totale.", "de": "Von Teneriffa aus total.", "it": "Da Tenerife è totale.", "nl": "Vanaf Tenerife totaal.", "zh": "在特内里费为全食。", "zht": "在特內里費為全食。", "bg": "От Тенерифе е пълно.", "pl": "Z Teneryfy całkowite."},
    "cieloEclSolLocalAnular": {"es": "Desde Tenerife se ve anular.", "en": "From Tenerife it is annular.", "fr": "Depuis Tenerife, elle est annulaire.", "de": "Von Teneriffa aus ringförmig.", "it": "Da Tenerife è anulare.", "nl": "Vanaf Tenerife ringvormig.", "zh": "在特内里费为环食。", "zht": "在特內里費為環食。", "bg": "От Тенерифе е пръстеновидно.", "pl": "Z Teneryfy obrączkowe."},
    "cieloEclSolHoras": {"es": "Empieza {a} · máximo {m} (Sol a {alt}°) · termina {b}", "en": "Starts {a} · maximum {m} (Sun {alt}° high) · ends {b}", "fr": "Début {a} · maximum {m} (Soleil à {alt}°) · fin {b}", "de": "Beginn {a} · Maximum {m} (Sonne {alt}° hoch) · Ende {b}", "it": "Inizio {a} · massimo {m} (Sole a {alt}°) · fine {b}", "nl": "Begin {a} · maximum {m} (zon op {alt}°) · einde {b}", "zh": "初亏{a} · 食甚{m}（太阳高度{alt}°） · 复圆{b}", "zht": "初虧{a} · 食甚{m}（太陽高度{alt}°） · 復圓{b}", "bg": "Начало {a} · максимум {m} (Слънцето на {alt}°) · край {b}", "pl": "Początek {a} · maksimum {m} (Słońce na {alt}°) · koniec {b}"},
    "cieloEclSolSale": {"es": "Empieza con el Sol aún bajo el horizonte: amanece ya eclipsado.", "en": "It begins before sunrise: the Sun rises already eclipsed.", "fr": "Elle commence avant le lever du soleil : le Soleil se lève déjà éclipsé.", "de": "Sie beginnt vor Sonnenaufgang: Die Sonne geht bereits verfinstert auf.", "it": "Inizia prima dell’alba: il Sole sorge già eclissato.", "nl": "Ze begint vóór zonsopkomst: de zon komt al verduisterd op.", "zh": "初亏时太阳尚未升起：太阳带食而出。", "zht": "初虧時太陽尚未升起：太陽帶食而出。", "bg": "Започва преди изгрев: Слънцето изгрява вече затъмнено.", "pl": "Zaczyna się przed wschodem: Słońce wschodzi już zaćmione."},
    "cieloEclSolPone": {"es": "Termina con el Sol ya puesto: se pone eclipsado.", "en": "It ends after sunset: the Sun sets while still eclipsed.", "fr": "Elle se termine après le coucher : le Soleil se couche encore éclipsé.", "de": "Sie endet nach Sonnenuntergang: Die Sonne geht verfinstert unter.", "it": "Finisce dopo il tramonto: il Sole tramonta ancora eclissato.", "nl": "Ze eindigt na zonsondergang: de zon gaat verduisterd onder.", "zh": "复圆前太阳已落下：太阳带食而落。", "zht": "復圓前太陽已落下：太陽帶食而落。", "bg": "Свършва след залез: Слънцето залязва затъмнено.", "pl": "Kończy się po zachodzie: Słońce zachodzi zaćmione."},
    "cieloEclSolAviso": {"es": "Nunca lo mire sin filtro: solo con gafas homologadas ISO 12312-2 o con un filtro solar delante del objetivo.", "en": "Never look without a filter: only with certified ISO 12312-2 eclipse glasses, or a solar filter in front of the lens.", "fr": "Ne la regardez jamais sans filtre : uniquement avec des lunettes certifiées ISO 12312-2, ou un filtre solaire devant l’objectif.", "de": "Nie ohne Filter hinsehen: nur mit zertifizierter Brille nach ISO 12312-2 oder einem Sonnenfilter vor dem Objektiv.", "it": "Non guardarla mai senza filtro: solo con occhiali certificati ISO 12312-2 o con un filtro solare davanti all’obiettivo.", "nl": "Kijk nooit zonder filter: alleen met een gecertificeerde ISO 12312-2-bril of een zonnefilter vóór het objectief.", "zh": "切勿无滤镜观看：只能使用符合ISO 12312-2标准的观测眼镜，或在镜头前加装太阳滤镜。", "zht": "切勿無濾鏡觀看：只能使用符合ISO 12312-2標準的觀測眼鏡，或在鏡頭前加裝太陽濾鏡。", "bg": "Никога не гледайте без филтър: само със сертифицирани очила по ISO 12312-2 или със слънчев филтър пред обектива.", "pl": "Nigdy nie patrz bez filtra: tylko w certyfikowanych okularach ISO 12312-2 albo przez filtr słoneczny założony przed obiektywem."},
    "cieloEclLunaSombra": {"es": "En la sombra: de {a} a {b}", "en": "In the umbra: {a} to {b}", "fr": "Dans l’ombre : de {a} à {b}", "de": "Im Kernschatten: {a} bis {b}", "it": "Nell’ombra: dalle {a} alle {b}", "nl": "In de kernschaduw: {a} tot {b}", "zh": "本影食：{a}至{b}", "zht": "本影食：{a}至{b}", "bg": "В сянката: от {a} до {b}", "pl": "W cieniu: od {a} do {b}"},
    "cieloEclLunaTotalidad": {"es": "Totalidad: de {a} a {b}", "en": "Totality: {a} to {b}", "fr": "Totalité : de {a} à {b}", "de": "Totalität: {a} bis {b}", "it": "Totalità: dalle {a} alle {b}", "nl": "Totaliteit: {a} tot {b}", "zh": "全食：{a}至{b}", "zht": "全食：{a}至{b}", "bg": "Пълна фаза: от {a} до {b}", "pl": "Faza całkowita: od {a} do {b}"},
    "cieloEclLunaPenumbra": {"es": "En la penumbra: de {a} a {b}. Apenas se nota: la Luna solo se oscurece un poco.", "en": "In the penumbra: {a} to {b}. Hardly noticeable: the Moon only dims slightly.", "fr": "Dans la pénombre : de {a} à {b}. À peine visible : la Lune s’assombrit seulement un peu.", "de": "Im Halbschatten: {a} bis {b}. Kaum zu bemerken: Der Mond wird nur etwas dunkler.", "it": "Nella penombra: dalle {a} alle {b}. Si nota appena: la Luna si scurisce solo un po’.", "nl": "In de bijschaduw: {a} tot {b}. Nauwelijks te zien: de maan wordt alleen iets donkerder.", "zh": "半影食：{a}至{b}。几乎察觉不到，月亮只是略微变暗。", "zht": "半影食：{a}至{b}。幾乎察覺不到，月亮只是略微變暗。", "bg": "В полусянката: от {a} до {b}. Почти не се забелязва: Луната само леко потъмнява.", "pl": "W półcieniu: od {a} do {b}. Ledwo widoczne: Księżyc tylko trochę ciemnieje."},
    "cieloEclLunaEntero": {"es": "Desde Tenerife se ve entero.", "en": "Visible in full from Tenerife.", "fr": "Visible en entier depuis Tenerife.", "de": "Von Teneriffa aus vollständig sichtbar.", "it": "Visibile per intero da Tenerife.", "nl": "Vanaf Tenerife helemaal te zien.", "zh": "在特内里费可看到全过程。", "zht": "在特內里費可看到全過程。", "bg": "От Тенерифе се вижда изцяло.", "pl": "Z Teneryfy widoczne w całości."},
    "cieloEclLunaSale": {"es": "Desde Tenerife, la Luna sale ya eclipsada: se ve el final.", "en": "From Tenerife the Moon rises already eclipsed: you see the end.", "fr": "Depuis Tenerife, la Lune se lève déjà éclipsée : on en voit la fin.", "de": "Von Teneriffa aus geht der Mond schon verfinstert auf: Man sieht das Ende.", "it": "Da Tenerife la Luna sorge già eclissata: se ne vede la fine.", "nl": "Vanaf Tenerife komt de maan al verduisterd op: je ziet het einde.", "zh": "在特内里费，月亮带食升起，可看到后半段。", "zht": "在特內里費，月亮帶食升起，可看到後半段。", "bg": "От Тенерифе Луната изгрява вече затъмнена: вижда се краят.", "pl": "Z Teneryfy Księżyc wschodzi już zaćmiony: widać koniec."},
    "cieloEclLunaPone": {"es": "Desde Tenerife, la Luna se pone antes del final: se ve el principio.", "en": "From Tenerife the Moon sets before the end: you see the beginning.", "fr": "Depuis Tenerife, la Lune se couche avant la fin : on en voit le début.", "de": "Von Teneriffa aus geht der Mond vor dem Ende unter: Man sieht den Anfang.", "it": "Da Tenerife la Luna tramonta prima della fine: se ne vede l’inizio.", "nl": "Vanaf Tenerife gaat de maan vóór het einde onder: je ziet het begin.", "zh": "在特内里费，月亮在食终前落下，可看到前半段。", "zht": "在特內里費，月亮在食終前落下，可看到前半段。", "bg": "От Тенерифе Луната залязва преди края: вижда се началото.", "pl": "Z Teneryfy Księżyc zachodzi przed końcem: widać początek."},
    "cieloOposicionDet": {"es": "Visible toda la noche y en su máximo brillo (mag. {m}) · {c}", "en": "Up all night at its brightest (mag {m}) · {c}", "fr": "Visible toute la nuit, à son éclat maximal (mag. {m}) · {c}", "de": "Die ganze Nacht sichtbar und am hellsten ({m} mag) · {c}", "it": "Visibile tutta la notte e al massimo splendore (mag. {m}) · {c}", "nl": "De hele nacht zichtbaar en op zijn helderst (mag. {m}) · {c}", "zh": "整夜可见，亮度最大（星等{m}） · {c}", "zht": "整夜可見，亮度最大（星等{m}） · {c}", "bg": "Вижда се цяла нощ и е най-ярък ({m} зв. вел.) · {c}", "pl": "Widoczny przez całą noc i najjaśniejszy ({m} mag) · {c}"},
    "cieloElongDet": {"es": "A {g}° del Sol · mag. {m}", "en": "{g}° from the Sun · mag {m}", "fr": "À {g}° du Soleil · mag. {m}", "de": "{g}° von der Sonne · {m} mag", "it": "A {g}° dal Sole · mag. {m}", "nl": "{g}° van de zon · mag. {m}", "zh": "距太阳{g}° · 星等{m}", "zht": "距太陽{g}° · 星等{m}", "bg": "На {g}° от Слънцето · {m} зв. вел.", "pl": "{g}° od Słońca · {m} mag"},
    "cieloConjDet": {"es": "Separados {s}° (el meñique a brazo extendido tapa cerca de 1°)", "en": "{s}° apart (your little finger at arm’s length covers about 1°)", "fr": "Écartés de {s}° (le petit doigt à bout de bras couvre environ 1°)", "de": "{s}° auseinander (der kleine Finger am ausgestreckten Arm deckt etwa 1° ab)", "it": "A {s}° di distanza (il mignolo a braccio teso copre circa 1°)", "nl": "{s}° uit elkaar (je pink op armlengte bedekt ongeveer 1°)", "zh": "相距{s}°（伸直手臂时小指宽约1°）", "zht": "相距{s}°（伸直手臂時小指寬約1°）", "bg": "На {s}° един от друг (кутрето на изпъната ръка покрива около 1°)", "pl": "{s}° od siebie (mały palec na wyciągniętej ręce zasłania około 1°)"},
    "cieloEstacionDet": {"es": "A las {h}, hora de Canarias", "en": "At {h} Canary Islands time", "fr": "À {h}, heure des Canaries", "de": "Um {h} kanarischer Zeit", "it": "Alle {h}, ora delle Canarie", "nl": "Om {h} Canarische tijd", "zh": "加那利时间{h}", "zht": "加那利時間{h}", "bg": "В {h} ч. канарско време", "pl": "O {h} czasu kanaryjskiego"},
    "cieloLunaCercaDet": {"es": "A {km} km de la Tierra: algo más grande y brillante que una Luna llena media, aunque a simple vista apenas se nota.", "en": "{km} km from Earth: a little bigger and brighter than an average full Moon, though hard to tell by eye.", "fr": "À {km} km de la Terre : un peu plus grande et brillante qu’une pleine Lune moyenne, même si à l’œil nu cela se remarque à peine.", "de": "{km} km von der Erde entfernt: etwas größer und heller als ein durchschnittlicher Vollmond, mit bloßem Auge aber kaum zu bemerken.", "it": "A {km} km dalla Terra: un po’ più grande e luminosa di una Luna piena media, anche se a occhio nudo si nota appena.", "nl": "Op {km} km van de aarde: iets groter en helderder dan een gemiddelde volle maan, al zie je dat met het blote oog nauwelijks.", "zh": "距地球{km}公里：比平均的满月略大略亮，但肉眼几乎看不出差别。", "zht": "距地球{km}公里：比平均的滿月略大略亮，但肉眼幾乎看不出差別。", "bg": "На {km} км от Земята: малко по-голяма и по-ярка от средното пълнолуние, макар че с просто око почти не се забелязва.", "pl": "{km} km od Ziemi: nieco większa i jaśniejsza od przeciętnej pełni, choć gołym okiem trudno to zauważyć."},
    "cieloCometasSatelites": {"es": "Cometas y satélites", "en": "Comets and satellites", "fr": "Comètes et satellites", "de": "Kometen und Satelliten", "it": "Comete e satelliti", "nl": "Kometen en satellieten", "zh": "彗星与人造卫星", "zht": "彗星與人造衛星", "bg": "Комети и спътници", "pl": "Komety i satelity"},
    "cieloCometasTxt": {"es": "Los cometas no se pueden poner en un calendario fijo: muchos se descubren solo meses antes y su brillo es difícil de prever. Para los que haya a la vista, consulte las fuentes de abajo.", "en": "Comets can’t be put on a fixed calendar: many are discovered only months ahead and their brightness is hard to predict. For any on view, check the sources below.", "fr": "Les comètes ne peuvent pas figurer dans un calendrier fixe : beaucoup ne sont découvertes que quelques mois avant et leur éclat est difficile à prévoir. Pour celles qui sont visibles, consultez les sources ci-dessous.", "de": "Kometen lassen sich nicht in einen festen Kalender eintragen: Viele werden erst Monate vorher entdeckt, und ihre Helligkeit ist schwer vorherzusagen. Welche gerade sichtbar sind, steht in den Quellen unten.", "it": "Le comete non si possono mettere in un calendario fisso: molte vengono scoperte solo pochi mesi prima e la loro luminosità è difficile da prevedere. Per quelle visibili, consulta le fonti qui sotto.", "nl": "Kometen passen niet in een vaste kalender: veel worden pas maanden vooraf ontdekt en hun helderheid is moeilijk te voorspellen. Welke er te zien zijn, staat bij de bronnen hieronder.", "zh": "彗星无法排进固定的日历：许多彗星只在几个月前才被发现，亮度也难以预测。当前可见的彗星请查看下方来源。", "zht": "彗星無法排進固定的日曆：許多彗星只在幾個月前才被發現，亮度也難以預測。當前可見的彗星請查看下方來源。", "bg": "Кометите не могат да се впишат в постоянен календар: много от тях се откриват само месеци по-рано, а яркостта им трудно се предвижда. За видимите в момента вижте източниците по-долу.", "pl": "Komet nie da się wpisać do stałego kalendarza: wiele odkrywa się zaledwie kilka miesięcy wcześniej, a ich jasność trudno przewidzieć. Te widoczne obecnie znajdziesz w źródłach poniżej."},
    /* 21-10-2026: los pasos ya los calcula la aplicacion (tarjeta de «Esta noche» y
       calendario «Satelites», textos_ui7.py); la aplicacion de la NASA queda como
       contraste, no como unica fuente. */
    "cieloSatelitesTxt": {"es": "Los pasos visibles de la Estación Espacial Internacional, de la estación china Tiangong y del telescopio Hubble están en la tarjeta de esta noche y en el calendario, en «Satélites»: se calculan en el móvil con los elementos orbitales que un robot renueva cada día. Para contrastar, la NASA avisa de los de la Estación en su aplicación «Spot the Station».", "en": "Visible passes of the International Space Station, the Chinese station Tiangong and the Hubble telescope are in tonight’s card and in the calendar, under “Satellites”: they are calculated on your phone from orbital elements a robot renews every day. To cross-check, NASA announces the Station’s passes in its Spot the Station app.", "fr": "Les passages visibles de la Station spatiale internationale, de la station chinoise Tiangong et du télescope Hubble figurent dans la carte de cette nuit et dans le calendrier, sous « Satellites » : ils sont calculés sur votre téléphone à partir d’éléments orbitaux qu’un robot renouvelle chaque jour. Pour vérifier, la NASA annonce ceux de la Station dans son application « Spot the Station ».", "de": "Die sichtbaren Überflüge der Internationalen Raumstation, der chinesischen Station Tiangong und des Hubble-Teleskops stehen in der Karte für heute Nacht und im Kalender unter „Satelliten“: Sie werden auf deinem Handy aus Bahnelementen berechnet, die ein Roboter täglich erneuert. Zum Gegenprüfen kündigt die NASA die der Raumstation in ihrer App „Spot the Station“ an.", "it": "I passaggi visibili della Stazione spaziale internazionale, della stazione cinese Tiangong e del telescopio Hubble sono nella scheda di stanotte e nel calendario, in «Satelliti»: si calcolano sul telefono dagli elementi orbitali che un robot rinnova ogni giorno. Per un confronto, la NASA segnala quelli della Stazione nella sua app «Spot the Station».", "nl": "De zichtbare overkomsten van het Internationaal Ruimtestation, het Chinese station Tiangong en de Hubble-telescoop staan in de kaart van vannacht en in de kalender onder ‘Satellieten’: ze worden op je telefoon berekend uit baanelementen die een robot elke dag vernieuwt. Ter controle meldt NASA die van het ruimtestation in haar app Spot the Station.", "zh": "国际空间站、中国空间站天宫和哈勃望远镜的可见过境列在今晚的卡片和日历的“卫星”栏中：由手机根据机器人每天更新的轨道根数计算。作为对照，NASA 也在其应用“Spot the Station”中发布空间站的过境提醒。", "zht": "國際太空站、中國太空站天宮和哈伯望遠鏡的可見過境列在今晚的卡片和日曆的「衛星」欄中：由手機根據機器人每天更新的軌道根數計算。作為對照，NASA 也在其應用程式「Spot the Station」中發布太空站的過境提醒。", "bg": "Видимите преминавания на Международната космическа станция, на китайската станция Тянгун и на телескопа „Хъбъл“ са в картата за тази нощ и в календара, в „Спътници“: изчисляват се на телефона по орбитални елементи, които робот обновява всеки ден. За проверка НАСА обявява тези на станцията в приложението си „Spot the Station“.", "pl": "Widoczne przeloty Międzynarodowej Stacji Kosmicznej, chińskiej stacji Tiangong i teleskopu Hubble’a są w karcie tej nocy i w kalendarzu, w „Satelity”: liczone są w telefonie z elementów orbitalnych, które robot odnawia codziennie. Dla porównania NASA podaje przeloty stacji w swojej aplikacji „Spot the Station”."},
    "cieloNotaCalendario": {"es": "Todo se calcula en el móvil para Izaña, en hora de Canarias: las lluvias con la longitud solar de su máximo (lista de la IMO), los eclipses y los planetas con Astronomy Engine. La referencia oficial son el IGN y el IAC.", "en": "Everything is calculated on your phone for Izaña, in Canary Islands time: showers from the solar longitude of their peak (IMO list), eclipses and planets with Astronomy Engine. The official references are the IGN and the IAC.", "fr": "Tout est calculé sur votre téléphone pour Izaña, à l’heure des Canaries : les étoiles filantes d’après la longitude solaire de leur maximum (liste de l’IMO), les éclipses et les planètes avec Astronomy Engine. Les références officielles sont l’IGN et l’IAC.", "de": "Alles wird auf deinem Handy für Izaña berechnet, in kanarischer Zeit: Sternschnuppen aus der Sonnenlänge ihres Maximums (Liste der IMO), Finsternisse und Planeten mit Astronomy Engine. Offizielle Quellen sind das IGN und das IAC.", "it": "Tutto è calcolato sul telefono per Izaña, in ora delle Canarie: le stelle cadenti dalla longitudine solare del loro massimo (elenco dell’IMO), eclissi e pianeti con Astronomy Engine. Il riferimento ufficiale sono l’IGN e l’IAC.", "nl": "Alles wordt op je telefoon berekend voor Izaña, in Canarische tijd: meteorenzwermen uit de zonnelengte van hun maximum (lijst van de IMO), eclipsen en planeten met Astronomy Engine. De officiële bronnen zijn het IGN en het IAC.", "zh": "所有天象都在手机上按伊萨尼亚的位置、以加那利时间计算：流星雨依据其极大时的太阳黄经（IMO列表），日月食与行星使用Astronomy Engine计算。官方参考为IGN和IAC。", "zht": "所有天象都在手機上按伊薩尼亞的位置、以加那利時間計算：流星雨依據其極大時的太陽黃經（IMO列表），日月食與行星使用Astronomy Engine計算。官方參考為IGN和IAC。", "bg": "Всичко се изчислява на телефона за Исаня, в канарско време: метеорните потоци по слънчевата дължина на максимума им (списъка на IMO), затъмненията и планетите с Astronomy Engine. Официалните източници са IGN и IAC.", "pl": "Wszystko jest liczone w telefonie dla Izañi, w czasie kanaryjskim: roje według długości ekliptycznej Słońca w ich maksimum (lista IMO), zaćmienia i planety za pomocą Astronomy Engine. Oficjalnym źródłem są IGN i IAC."},
    "cieloEnlaceIss": {"es": "La aplicación de la NASA para ver la Estación Espacial", "en": "NASA’s app for spotting the Space Station", "fr": "L’application de la NASA pour voir la Station spatiale", "de": "Die NASA-App zum Sichten der Raumstation", "it": "L’app della NASA per vedere la Stazione spaziale", "nl": "De app van NASA om het ruimtestation te zien", "zh": "NASA的空间站观测应用", "zht": "NASA的太空站觀測應用程式", "bg": "Приложението на НАСА за наблюдение на станцията", "pl": "Aplikacja NASA do wypatrywania stacji kosmicznej"},
    "cieloEnlaceIacCal": {"es": "Calendarios astronómicos del IAC", "en": "IAC astronomical calendars", "fr": "Calendriers astronomiques de l’IAC", "de": "Astronomische Kalender des IAC", "it": "Calendari astronomici dell’IAC", "nl": "Astronomische kalenders van het IAC", "zh": "IAC天文历", "zht": "IAC天文曆", "bg": "Астрономически календари на IAC", "pl": "Kalendarze astronomiczne IAC"},
    /* Catalogo y carta del cielo */
    "cieloBuscar": {"es": "Buscar: Orión, M42, Vega…", "en": "Search: Orion, M42, Vega…", "fr": "Rechercher : Orion, M42, Véga…", "de": "Suchen: Orion, M42, Wega…", "it": "Cerca: Orione, M42, Vega…", "nl": "Zoeken: Orion, M42, Wega…", "zh": "搜索：猎户座、M42、织女星…", "zht": "搜尋：獵戶座、M42、織女星…", "bg": "Търсене: Орион, M42, Вега…", "pl": "Szukaj: Orion, M42, Wega…"},
    "cieloCatTodo": {"es": "Todo", "en": "All", "fr": "Tout", "de": "Alle", "it": "Tutto", "nl": "Alles", "zh": "全部", "zht": "全部", "bg": "Всичко", "pl": "Wszystko"},
    "cieloCatEstrellas": {"es": "Estrellas", "en": "Stars", "fr": "Étoiles", "de": "Sterne", "it": "Stelle", "nl": "Sterren", "zh": "恒星", "zht": "恆星", "bg": "Звезди", "pl": "Gwiazdy"},
    "cieloCatSistemas": {"es": "Sistemas estelares", "en": "Star systems", "fr": "Systèmes stellaires", "de": "Sternsysteme", "it": "Sistemi stellari", "nl": "Stersystemen", "zh": "双星与聚星", "zht": "雙星與聚星", "bg": "Звездни системи", "pl": "Układy gwiazd"},
    "cieloCatVariables": {"es": "Variables", "en": "Variable stars", "fr": "Étoiles variables", "de": "Veränderliche", "it": "Variabili", "nl": "Veranderlijke sterren", "zh": "变星", "zht": "變星", "bg": "Променливи звезди", "pl": "Gwiazdy zmienne"},
    "cieloCatConstelaciones": {"es": "Constelaciones", "en": "Constellations", "fr": "Constellations", "de": "Sternbilder", "it": "Costellazioni", "nl": "Sterrenbeelden", "zh": "星座", "zht": "星座", "bg": "Съзвездия", "pl": "Gwiazdozbiory"},
    "cieloCatCumulos": {"es": "Cúmulos", "en": "Clusters", "fr": "Amas", "de": "Sternhaufen", "it": "Ammassi", "nl": "Sterrenhopen", "zh": "星团", "zht": "星團", "bg": "Звездни купове", "pl": "Gromady"},
    "cieloCatNebulosas": {"es": "Nebulosas", "en": "Nebulae", "fr": "Nébuleuses", "de": "Nebel", "it": "Nebulose", "nl": "Nevels", "zh": "星云", "zht": "星雲", "bg": "Мъглявини", "pl": "Mgławice"},
    "cieloCatGalaxias": {"es": "Galaxias", "en": "Galaxies", "fr": "Galaxies", "de": "Galaxien", "it": "Galassie", "nl": "Sterrenstelsels", "zh": "星系", "zht": "星系", "bg": "Галактики", "pl": "Galaktyki"},
    "cieloCatCualquiera": {"es": "Cualquier instrumento", "en": "Any instrument", "fr": "Tout instrument", "de": "Jedes Instrument", "it": "Qualsiasi strumento", "nl": "Elk instrument", "zh": "任意器材", "zht": "任意器材", "bg": "Всякакъв уред", "pl": "Dowolny sprzęt"},
    "cieloNiv1": {"es": "A simple vista", "en": "Naked eye", "fr": "À l’œil nu", "de": "Bloßes Auge", "it": "A occhio nudo", "nl": "Blote oog", "zh": "肉眼", "zht": "肉眼", "bg": "С просто око", "pl": "Gołym okiem"},
    "cieloNiv2": {"es": "Prismáticos", "en": "Binoculars", "fr": "Jumelles", "de": "Fernglas", "it": "Binocolo", "nl": "Verrekijker", "zh": "双筒望远镜", "zht": "雙筒望遠鏡", "bg": "Бинокъл", "pl": "Lornetka"},
    "cieloNiv3": {"es": "Telescopio", "en": "Telescope", "fr": "Télescope", "de": "Teleskop", "it": "Telescopio", "nl": "Telescoop", "zh": "天文望远镜", "zht": "天文望遠鏡", "bg": "Телескоп", "pl": "Teleskop"},
    "cieloNiv1Ayuda": {"es": "Se ve a simple vista desde un sitio oscuro", "en": "Visible to the naked eye from a dark site", "fr": "Visible à l’œil nu depuis un site sombre", "de": "Von einem dunklen Ort aus mit bloßem Auge sichtbar", "it": "Visibile a occhio nudo da un luogo buio", "nl": "Met het blote oog te zien vanaf een donkere plek", "zh": "在黑暗处肉眼可见", "zht": "在黑暗處肉眼可見", "bg": "Вижда се с просто око от тъмно място", "pl": "Widoczne gołym okiem z ciemnego miejsca"},
    "cieloNiv2Ayuda": {"es": "Pide unos prismáticos (10×50 o parecidos)", "en": "Needs binoculars (10×50 or similar)", "fr": "Demande des jumelles (10×50 ou similaires)", "de": "Braucht ein Fernglas (10×50 o. ä.)", "it": "Serve un binocolo (10×50 o simile)", "nl": "Vraagt om een verrekijker (10×50 of vergelijkbaar)", "zh": "需要双筒望远镜（10×50或类似）", "zht": "需要雙筒望遠鏡（10×50或類似）", "bg": "Нужен е бинокъл (10×50 или подобен)", "pl": "Potrzebna lornetka (10×50 lub podobna)"},
    "cieloNiv3Ayuda": {"es": "Pide un telescopio", "en": "Needs a telescope", "fr": "Demande un télescope", "de": "Braucht ein Teleskop", "it": "Serve un telescopio", "nl": "Vraagt om een telescoop", "zh": "需要天文望远镜", "zht": "需要天文望遠鏡", "bg": "Нужен е телескоп", "pl": "Potrzebny teleskop"},
    "cieloCatEstaNoche": {"es": "Altos esta noche", "en": "High tonight", "fr": "Hauts cette nuit", "de": "Heute Nacht hoch", "it": "Alti stanotte", "nl": "Vannacht hoog", "zh": "今夜高悬", "zht": "今夜高懸", "bg": "Високо тази нощ", "pl": "Wysoko tej nocy"},
    "cieloCatCuenta": {"es": "{n} resultado|{n} resultados", "en": "{n} result|{n} results", "fr": "{n} résultat|{n} résultats", "de": "{n} Treffer|{n} Treffer", "it": "{n} risultato|{n} risultati", "nl": "{n} resultaat|{n} resultaten", "zh": "{n}个结果", "zht": "{n}個結果", "bg": "{n} резултат|{n} резултата", "pl": "{n} wynik|{n} wyniki|{n} wyników"},
    "cieloCatMas": {"es": "Y {n} más: escriba para afinar la búsqueda.", "en": "And {n} more: type to narrow the search.", "fr": "Et {n} de plus : tapez pour affiner la recherche.", "de": "Und {n} weitere: tippe, um die Suche einzugrenzen.", "it": "E altri {n}: scrivi per restringere la ricerca.", "nl": "En nog {n}: typ om de zoekopdracht te verfijnen.", "zh": "还有{n}项：输入文字以缩小范围。", "zht": "還有{n}項：輸入文字以縮小範圍。", "bg": "И още {n}: пишете, за да стесните търсенето.", "pl": "I jeszcze {n}: wpisz, aby zawęzić wyszukiwanie."},
    "cieloNotaNiveles": {"es": "El instrumento sale del brillo de cada objeto, corregido por lo que lo apaga la atmósfera a la altura máxima que alcanza desde Tenerife, con umbrales prudentes para prismáticos 10×50 y un cielo oscuro. Con Luna o desde la costa, cuente con que muchos pidan un nivel más.", "en": "The instrument comes from each object’s brightness, corrected for how much the atmosphere dims it at its highest point seen from Tenerife, with cautious thresholds for 10×50 binoculars and a dark sky. With moonlight or from the coast, expect many to need one level more.", "fr": "L’instrument découle de l’éclat de chaque objet, corrigé de l’atténuation par l’atmosphère à la hauteur maximale qu’il atteint depuis Tenerife, avec des seuils prudents pour des jumelles 10×50 et un ciel noir. Avec la Lune ou depuis la côte, comptez souvent un niveau de plus.", "de": "Das Instrument ergibt sich aus der Helligkeit jedes Objekts, korrigiert um die Abschwächung durch die Atmosphäre in der größten Höhe, die es von Teneriffa aus erreicht, mit vorsichtigen Schwellen für ein 10×50-Fernglas und dunklen Himmel. Bei Mondlicht oder von der Küste aus braucht vieles eine Stufe mehr.", "it": "Lo strumento deriva dalla luminosità di ogni oggetto, corretta per l’assorbimento dell’atmosfera all’altezza massima che raggiunge da Tenerife, con soglie prudenti per un binocolo 10×50 e un cielo buio. Con la Luna o dalla costa, molti richiedono un livello in più.", "nl": "Het instrument volgt uit de helderheid van elk object, gecorrigeerd voor de verzwakking door de atmosfeer op de grootste hoogte die het vanaf Tenerife bereikt, met voorzichtige drempels voor een 10×50-verrekijker en een donkere hemel. Met maanlicht of vanaf de kust heeft veel een niveau meer nodig.", "zh": "所需器材依据每个天体的亮度确定，并按其在特内里费所能达到的最高高度扣除大气消光，阈值按10×50双筒望远镜和黑暗天空保守设定。有月光或在海边时，许多天体需要再升一级器材。", "zht": "所需器材依據每個天體的亮度確定，並按其在特內里費所能達到的最高高度扣除大氣消光，門檻按10×50雙筒望遠鏡和黑暗天空保守設定。有月光或在海邊時，許多天體需要再升一級器材。", "bg": "Уредът се определя от яркостта на всеки обект, коригирана с отслабването от атмосферата при най-голямата височина, която достига от Тенерифе, с предпазливи прагове за бинокъл 10×50 и тъмно небе. При Луна или от брега много обекти изискват едно ниво нагоре.", "pl": "Sprzęt wynika z jasności każdego obiektu, skorygowanej o osłabienie przez atmosferę na największej wysokości, jaką osiąga z Teneryfy, z ostrożnymi progami dla lornetki 10×50 i ciemnego nieba. Przy Księżycu lub z wybrzeża wiele obiektów wymaga poziomu wyżej."},
    "cieloNotaMessier": {"es": "Incluye {m} objetos Messier, {c} del catálogo Caldwell que asoman desde Tenerife, las estrellas con nombre más brillantes, {d} estrellas dobles y múltiples, {v} variables y las {k} constelaciones.", "en": "Includes {m} Messier objects, {c} Caldwell objects that rise above Tenerife’s horizon, the brightest named stars, {d} double and multiple stars, {v} variable stars and all {k} constellations.", "fr": "Comprend {m} objets de Messier, {c} objets du catalogue de Caldwell visibles depuis Tenerife, les étoiles nommées les plus brillantes, {d} étoiles doubles et multiples, {v} étoiles variables et les {k} constellations.", "de": "Enthält {m} Messier-Objekte, {c} Caldwell-Objekte, die über Teneriffas Horizont steigen, die hellsten Sterne mit Eigennamen, {d} Doppel- und Mehrfachsterne, {v} Veränderliche und alle {k} Sternbilder.", "it": "Comprende {m} oggetti di Messier, {c} oggetti del catalogo Caldwell visibili da Tenerife, le stelle con nome più luminose, {d} stelle doppie e multiple, {v} variabili e tutte le {k} costellazioni.", "nl": "Bevat {m} Messier-objecten, {c} Caldwell-objecten die boven de horizon van Tenerife komen, de helderste sterren met een naam, {d} dubbel- en meervoudige sterren, {v} veranderlijke sterren en alle {k} sterrenbeelden.", "zh": "收录{m}个梅西耶天体、{c}个在特内里费可升到地平线以上的科德韦尔天体、最亮的有名恒星、{d}个双星与聚星、{v}颗变星，以及全部{k}个星座。", "zht": "收錄{m}個梅西耶天體、{c}個在特內里費可升到地平線以上的科德韋爾天體、最亮的有名恆星、{d}個雙星與聚星、{v}顆變星，以及全部{k}個星座。", "bg": "Включва {m} обекта на Месие, {c} обекта от каталога на Колдуел, които изгряват над Тенерифе, най-ярките звезди с имена, {d} двойни и кратни звезди, {v} променливи звезди и всичките {k} съзвездия.", "pl": "Zawiera: obiekty Messiera ({m}), obiekty z katalogu Caldwella widoczne z Teneryfy ({c}), najjaśniejsze gwiazdy z nazwami, gwiazdy podwójne i wielokrotne ({d}), gwiazdy zmienne ({v}) i wszystkie gwiazdozbiory ({k})."},
    "cieloMesesAyuda": {"es": "Meses en que sube alto en plena noche", "en": "Months when it is high in full darkness", "fr": "Mois où il est haut en pleine nuit", "de": "Monate, in denen es bei voller Dunkelheit hoch steht", "it": "Mesi in cui è alto a notte fonda", "nl": "Maanden waarin het hoog staat als het volledig donker is", "zh": "完全天黑时位置较高的月份", "zht": "完全天黑時位置較高的月份", "bg": "Месеци, в които е високо при пълна тъмнина", "pl": "Miesiące, gdy jest wysoko w pełnej ciemności"},
    "cieloVerEnMapa": {"es": "Ver en el mapa del cielo", "en": "Show on the sky map", "fr": "Voir sur la carte du ciel", "de": "Auf der Himmelskarte zeigen", "it": "Vedi sulla mappa del cielo", "nl": "Toon op de hemelkaart", "zh": "在星图中查看", "zht": "在星圖中查看", "bg": "Покажи на картата на небето", "pl": "Pokaż na mapie nieba"},
    "cieloRasante": {"es": "Muy bajo", "en": "Very low", "fr": "Très bas", "de": "Sehr tief", "it": "Molto basso", "nl": "Erg laag", "zh": "很低", "zht": "很低", "bg": "Много ниско", "pl": "Bardzo nisko"},
    "cieloAltMax": {"es": "Altura máxima desde Tenerife: {alt}°", "en": "Highest point from Tenerife: {alt}°", "fr": "Hauteur maximale depuis Tenerife : {alt}°", "de": "Größte Höhe von Teneriffa aus: {alt}°", "it": "Altezza massima da Tenerife: {alt}°", "nl": "Grootste hoogte vanaf Tenerife: {alt}°", "zh": "在特内里费的最大高度：{alt}°", "zht": "在特內里費的最大高度：{alt}°", "bg": "Най-голяма височина от Тенерифе: {alt}°", "pl": "Największa wysokość z Teneryfy: {alt}°"},
    "cieloDistancia": {"es": "A unos {d} años luz", "en": "About {d} light-years away", "fr": "À environ {d} années-lumière", "de": "Etwa {d} Lichtjahre entfernt", "it": "A circa {d} anni luce", "nl": "Op ongeveer {d} lichtjaar", "zh": "距离约{d}光年", "zht": "距離約{d}光年", "bg": "На около {d} светлинни години", "pl": "Odległość w latach świetlnych: około {d}"},
    "cieloEspectro": {"es": "Tipo espectral: {s}", "en": "Spectral type: {s}", "fr": "Type spectral : {s}", "de": "Spektraltyp: {s}", "it": "Tipo spettrale: {s}", "nl": "Spectraaltype: {s}", "zh": "光谱型：{s}", "zht": "光譜型：{s}", "bg": "Спектрален клас: {s}", "pl": "Typ widmowy: {s}"},
    "cieloVariableRango": {"es": "Su brillo varía entre mag. {a} y {b}", "en": "Brightness varies between mag {a} and {b}", "fr": "Son éclat varie entre mag. {a} et {b}", "de": "Helligkeit schwankt zwischen {a} und {b} mag", "it": "La luminosità varia tra mag. {a} e {b}", "nl": "Helderheid varieert tussen mag. {a} en {b}", "zh": "亮度在星等{a}至{b}之间变化", "zht": "亮度在星等{a}至{b}之間變化", "bg": "Яркостта се мени между {a} и {b} зв. вел.", "pl": "Jasność zmienia się od {a} do {b} mag"},
    "cieloSeparacion": {"es": "Separación: {s}″ (segundos de arco)", "en": "Separation: {s}″ (arcseconds)", "fr": "Écartement : {s}″ (secondes d’arc)", "de": "Abstand: {s}″ (Bogensekunden)", "it": "Separazione: {s}″ (secondi d’arco)", "nl": "Afstand: {s}″ (boogseconden)", "zh": "角距：{s}″（角秒）", "zht": "角距：{s}″（角秒）", "bg": "Разстояние: {s}″ (дъгови секунди)", "pl": "Odległość kątowa: {s}″ (sekundy łuku)"},
    "cieloSeparacionMin": {"es": "Separación: {s}′ (minutos de arco)", "en": "Separation: {s}′ (arcminutes)", "fr": "Écartement : {s}′ (minutes d’arc)", "de": "Abstand: {s}′ (Bogenminuten)", "it": "Separazione: {s}′ (primi d’arco)", "nl": "Afstand: {s}′ (boogminuten)", "zh": "角距：{s}′（角分）", "zht": "角距：{s}′（角分）", "bg": "Разстояние: {s}′ (дъгови минути)", "pl": "Odległość kątowa: {s}′ (minuty łuku)"},
    "cieloOrbitaRapida": {"es": "La pareja gira en unos {a} años: la separación cambia y aquí no se da.", "en": "The pair orbits in about {a} years: the separation changes, so it isn’t given here.", "fr": "Le couple tourne en environ {a} ans : l’écartement change, il n’est donc pas donné ici.", "de": "Das Paar umkreist sich in etwa {a} Jahren: Der Abstand ändert sich und wird hier nicht angegeben.", "it": "La coppia ruota in circa {a} anni: la separazione cambia e qui non viene indicata.", "nl": "Het paar draait in ongeveer {a} jaar om elkaar: de afstand verandert en staat hier niet.", "zh": "两星的轨道周期约{a}年：角距不断变化，此处不列出。", "zht": "兩星的軌道週期約{a}年：角距不斷變化，此處不列出。", "bg": "Двойката обикаля за около {a} години: разстоянието се мени и тук не се дава.", "pl": "Okres obiegu pary w latach: około {a}; odległość się zmienia, więc jej tu nie podajemy."},
    "cieloComponentes": {"es": "Componentes: mag. {a} y {b}", "en": "Components: mag {a} and {b}", "fr": "Composantes : mag. {a} et {b}", "de": "Komponenten: {a} und {b} mag", "it": "Componenti: mag. {a} e {b}", "nl": "Componenten: mag. {a} en {b}", "zh": "子星：星等{a}与{b}", "zht": "子星：星等{a}與{b}", "bg": "Компоненти: {a} и {b} зв. вел.", "pl": "Składniki: {a} i {b} mag"},
    "cieloDifMag": {"es": "Diferencia de brillo: {d} magnitudes", "en": "Brightness difference: {d} magnitudes", "fr": "Écart d’éclat : {d} magnitudes", "de": "Helligkeitsunterschied: {d} mag", "it": "Differenza di luminosità: {d} magnitudini", "nl": "Helderheidsverschil: {d} magnitude", "zh": "亮度差：{d}个星等", "zht": "亮度差：{d}個星等", "bg": "Разлика в яркостта: {d} зв. вел.", "pl": "Różnica jasności: {d} mag"},
    "cieloPeriodo": {"es": "Período: {d} días", "en": "Period: {d} days", "fr": "Période : {d} jours", "de": "Periode: {d} Tage", "it": "Periodo: {d} giorni", "nl": "Periode: {d} dagen", "zh": "周期：{d}天", "zht": "週期：{d}天", "bg": "Период: {d} дни", "pl": "Okres: {d} d"},
    "cieloConEstrellas": {"es": "Estrellas a simple vista (hasta mag. 6) que salen sobre el horizonte: {n}", "en": "Naked-eye stars (to mag 6) that rise above the horizon here: {n}", "fr": "Étoiles visibles à l’œil nu (jusqu’à mag. 6) qui se lèvent ici : {n}", "de": "Mit bloßem Auge sichtbare Sterne (bis 6 mag), die hier aufgehen: {n}", "it": "Stelle a occhio nudo (fino a mag. 6) che sorgono qui: {n}", "nl": "Sterren voor het blote oog (tot mag. 6) die hier opkomen: {n}", "zh": "此地可升起的肉眼可见星（亮于6等）：{n}颗", "zht": "此地可升起的肉眼可見星（亮於6等）：{n}顆", "bg": "Звезди за просто око (до 6 зв. вел.), които изгряват тук: {n}", "pl": "Gwiazdy widoczne gołym okiem (do 6 mag), które tu wschodzą: {n}"},
    "cieloConBrillante": {"es": "La más brillante: {e}", "en": "Brightest star: {e}", "fr": "La plus brillante : {e}", "de": "Hellster Stern: {e}", "it": "La più luminosa: {e}", "nl": "Helderste ster: {e}", "zh": "最亮星：{e}", "zht": "最亮星：{e}", "bg": "Най-ярка звезда: {e}", "pl": "Najjaśniejsza gwiazda: {e}"},
    "cieloConParcialDet": {"es": "Solo se ve la parte al norte de la declinación {d}°: lo demás nunca sale desde Tenerife.", "en": "Only the part north of declination {d}° is visible: the rest never rises from Tenerife.", "fr": "Seule la partie au nord de la déclinaison {d}° est visible : le reste ne se lève jamais depuis Tenerife.", "de": "Nur der Teil nördlich von {d}° Deklination ist sichtbar: Der Rest geht von Teneriffa aus nie auf.", "it": "Si vede solo la parte a nord della declinazione {d}°: il resto non sorge mai da Tenerife.", "nl": "Alleen het deel ten noorden van declinatie {d}° is te zien: de rest komt vanaf Tenerife nooit op.", "zh": "只能看到赤纬{d}°以北的部分：其余部分在特内里费永不升起。", "zht": "只能看到赤緯{d}°以北的部分：其餘部分在特內里費永不升起。", "bg": "Вижда се само частта на север от деклинация {d}°: останалото никога не изгрява от Тенерифе.", "pl": "Widać tylko część na północ od deklinacji {d}°: reszta nigdy nie wschodzi nad Teneryfą."},
    "cieloConVisTotal": {"es": "Entera sobre el horizonte", "en": "Fully visible", "fr": "Entièrement visible", "de": "Ganz sichtbar", "it": "Visibile per intero", "nl": "Helemaal zichtbaar", "zh": "完全可见", "zht": "完全可見", "bg": "Вижда се изцяло", "pl": "Widoczny w całości"},
    "cieloConVisParcial": {"es": "Visible en parte", "en": "Partly visible", "fr": "Partiellement visible", "de": "Teilweise sichtbar", "it": "Visibile in parte", "nl": "Deels zichtbaar", "zh": "部分可见", "zht": "部分可見", "bg": "Вижда се отчасти", "pl": "Widoczny częściowo"},
    "cieloConVisNo": {"es": "Nunca sale desde Tenerife", "en": "Never rises from Tenerife", "fr": "Ne se lève jamais depuis Tenerife", "de": "Geht von Teneriffa aus nie auf", "it": "Non sorge mai da Tenerife", "nl": "Komt vanaf Tenerife nooit op", "zh": "在特内里费永不升起", "zht": "在特內里費永不升起", "bg": "Никога не изгрява от Тенерифе", "pl": "Nigdy nie wschodzi nad Teneryfą"},
    "cieloTamano": {"es": "Tamaño aparente: {t} (la Luna llena mide unos 31′)", "en": "Apparent size: {t} (the full Moon is about 31′)", "fr": "Taille apparente : {t} (la pleine Lune mesure environ 31′)", "de": "Scheinbare Größe: {t} (der Vollmond misst etwa 31′)", "it": "Dimensione apparente: {t} (la Luna piena misura circa 31′)", "nl": "Schijnbare grootte: {t} (de volle maan is ongeveer 31′)", "zh": "视大小：{t}（满月约31′）", "zht": "視大小：{t}（滿月約31′）", "bg": "Видим размер: {t} (пълната Луна е около 31′)", "pl": "Rozmiar kątowy: {t} (tarcza Księżyca w pełni ma około 31′)"},
    "cieloVarEA": {"es": "Binaria eclipsante (tipo Algol)", "en": "Eclipsing binary (Algol type)", "fr": "Binaire à éclipses (type Algol)", "de": "Bedeckungsveränderlicher (Algol-Typ)", "it": "Binaria a eclisse (tipo Algol)", "nl": "Eclipsveranderlijke (Algoltype)", "zh": "食双星（大陵五型）", "zht": "食雙星（大陵五型）", "bg": "Затъмнителна двойна (тип Алгол)", "pl": "Gwiazda zaćmieniowa (typu Algola)"},
    "cieloVarEB": {"es": "Binaria eclipsante (tipo β Lyrae)", "en": "Eclipsing binary (β Lyrae type)", "fr": "Binaire à éclipses (type β Lyrae)", "de": "Bedeckungsveränderlicher (β-Lyrae-Typ)", "it": "Binaria a eclisse (tipo β Lyrae)", "nl": "Eclipsveranderlijke (β Lyrae-type)", "zh": "食双星（渐台二型）", "zht": "食雙星（漸台二型）", "bg": "Затъмнителна двойна (тип β Лира)", "pl": "Gwiazda zaćmieniowa (typu β Lyrae)"},
    "cieloVarDCEP": {"es": "Cefeida", "en": "Cepheid", "fr": "Céphéide", "de": "Cepheide", "it": "Cefeide", "nl": "Cepheïde", "zh": "造父变星", "zht": "造父變星", "bg": "Цефеида", "pl": "Cefeida"},
    "cieloVarM": {"es": "Variable de largo período (tipo Mira)", "en": "Long-period variable (Mira type)", "fr": "Variable à longue période (type Mira)", "de": "Langperiodischer Veränderlicher (Mira-Typ)", "it": "Variabile a lungo periodo (tipo Mira)", "nl": "Langperiodieke veranderlijke (Miratype)", "zh": "长周期变星（刍藁型）", "zht": "長週期變星（芻藁型）", "bg": "Дългопериодична променлива (тип Мира)", "pl": "Gwiazda zmienna długookresowa (typu Miry)"},
    "cieloVarSR": {"es": "Variable semirregular", "en": "Semiregular variable", "fr": "Variable semi-régulière", "de": "Halbregelmäßiger Veränderlicher", "it": "Variabile semiregolare", "nl": "Halfregelmatige veranderlijke", "zh": "半规则变星", "zht": "半規則變星", "bg": "Полуправилна променлива", "pl": "Gwiazda półregularna"},
    "cieloVarGCAS": {"es": "Variable eruptiva (tipo γ Cas)", "en": "Eruptive variable (γ Cas type)", "fr": "Variable éruptive (type γ Cas)", "de": "Eruptiver Veränderlicher (γ-Cas-Typ)", "it": "Variabile eruttiva (tipo γ Cas)", "nl": "Eruptieve veranderlijke (γ Cas-type)", "zh": "爆发变星（仙后γ型）", "zht": "爆發變星（仙后γ型）", "bg": "Еруптивна променлива (тип γ Касиопея)", "pl": "Gwiazda eruptywna (typu γ Cas)"},
    "cieloVarRCB": {"es": "Variable tipo R CrB", "en": "R CrB variable", "fr": "Variable de type R CrB", "de": "R-CrB-Veränderlicher", "it": "Variabile tipo R CrB", "nl": "R CrB-veranderlijke", "zh": "北冕R型变星", "zht": "北冕R型變星", "bg": "Променлива тип R Северна корона", "pl": "Gwiazda typu R CrB"},
    "cieloVarRV": {"es": "Variable tipo RV Tauri", "en": "RV Tauri variable", "fr": "Variable de type RV Tauri", "de": "RV-Tauri-Veränderlicher", "it": "Variabile tipo RV Tauri", "nl": "RV Tauri-veranderlijke", "zh": "金牛RV型变星", "zht": "金牛RV型變星", "bg": "Променлива тип RV Телец", "pl": "Gwiazda typu RV Tauri"},
    "cieloVarNR": {"es": "Nova recurrente", "en": "Recurrent nova", "fr": "Nova récurrente", "de": "Wiederkehrende Nova", "it": "Nova ricorrente", "nl": "Terugkerende nova", "zh": "再发新星", "zht": "再發新星", "bg": "Повтаряща се нова", "pl": "Nowa powrotna"},
    "cieloVarOtra": {"es": "Estrella variable", "en": "Variable star", "fr": "Étoile variable", "de": "Veränderlicher Stern", "it": "Stella variabile", "nl": "Veranderlijke ster", "zh": "变星", "zht": "變星", "bg": "Променлива звезда", "pl": "Gwiazda zmienna"},
    /* ── carta del cielo ───────────────────────────────────────────────── */
    "cieloMapaAria": {"es": "Mapa del cielo de Tenerife en el instante elegido", "en": "Sky map over Tenerife at the chosen time", "fr": "Carte du ciel de Tenerife à l’instant choisi", "de": "Himmelskarte über Teneriffa zum gewählten Zeitpunkt", "it": "Mappa del cielo di Tenerife all’istante scelto", "nl": "Hemelkaart boven Tenerife op het gekozen moment", "zh": "所选时刻的特内里费星图", "zht": "所選時刻的特內里費星圖", "bg": "Карта на небето над Тенерифе в избрания момент", "pl": "Mapa nieba nad Teneryfą w wybranej chwili"},
    "cieloMapaHora": {"es": "Hora", "en": "Time", "fr": "Heure", "de": "Uhrzeit", "it": "Ora", "nl": "Tijd", "zh": "时间", "zht": "時間", "bg": "Час", "pl": "Godzina"},
    "cieloAhora": {"es": "Ahora", "en": "Now", "fr": "Maintenant", "de": "Jetzt", "it": "Adesso", "nl": "Nu", "zh": "现在", "zht": "現在", "bg": "Сега", "pl": "Teraz"},
    "cieloMirando": {"es": "Mirando hacia", "en": "Facing", "fr": "Regard vers", "de": "Blickrichtung", "it": "Guardando verso", "nl": "Kijkrichting", "zh": "面向", "zht": "面向", "bg": "Посока", "pl": "Kierunek"},
    "cieloAcercar": {"es": "Acercar", "en": "Zoom in", "fr": "Zoomer", "de": "Vergrößern", "it": "Ingrandisci", "nl": "Inzoomen", "zh": "放大", "zht": "放大", "bg": "Приближи", "pl": "Przybliż"},
    "cieloAlejar": {"es": "Alejar", "en": "Zoom out", "fr": "Dézoomer", "de": "Verkleinern", "it": "Riduci", "nl": "Uitzoomen", "zh": "缩小", "zht": "縮小", "bg": "Отдалечи", "pl": "Oddal"},
    "cieloMapaLineas": {"es": "Figuras", "en": "Lines", "fr": "Figures", "de": "Sternbildlinien", "it": "Figure", "nl": "Lijnen", "zh": "星座连线", "zht": "星座連線", "bg": "Фигури", "pl": "Linie"},
    "cieloMapaNombres": {"es": "Nombres", "en": "Names", "fr": "Noms", "de": "Namen", "it": "Nomi", "nl": "Namen", "zh": "名称", "zht": "名稱", "bg": "Имена", "pl": "Nazwy"},
    "cieloMapaProfundo": {"es": "Cielo profundo", "en": "Deep sky", "fr": "Ciel profond", "de": "Deep Sky", "it": "Cielo profondo", "nl": "Deep-sky", "zh": "深空天体", "zht": "深空天體", "bg": "Дълбок космос", "pl": "Głębokie niebo"},
    "cieloMapaNota": {"es": "La carta mira hacia donde elija, como desde el suelo; ◎ enseña todo el cielo (el cenit en el centro, el horizonte en el borde). Arrastre para girar, pellizque para acercar, ▶ hace correr la noche, 📅 cambia de fecha y 📸 guarda la imagen. Toque un astro para ver qué es y, en su ficha, su recorrido de esa noche.", "en": "The chart looks where you choose, as from the ground; ◎ shows the whole sky (zenith in the middle, horizon at the edge). Drag to turn, pinch to zoom, ▶ plays the night, 📅 changes the date and 📸 saves the picture. Tap an object to see what it is and, on its card, its path that night.", "fr": "La carte regarde dans la direction choisie, comme depuis le sol ; ◎ montre tout le ciel (le zénith au centre, l’horizon sur le bord). Glissez pour tourner, pincez pour zoomer, ▶ fait défiler la nuit, 📅 change la date et 📸 enregistre l’image. Touchez un astre pour savoir ce que c’est et, sur sa fiche, voir sa trajectoire cette nuit-là.", "de": "Die Karte blickt in die gewählte Richtung, wie vom Boden aus; ◎ zeigt den ganzen Himmel (Zenit in der Mitte, Horizont am Rand). Ziehen zum Drehen, mit zwei Fingern zoomen, ▶ lässt die Nacht ablaufen, 📅 wechselt das Datum und 📸 speichert das Bild. Ein Objekt antippen zeigt, was es ist, und auf seiner Karte seine Bahn in dieser Nacht.", "it": "La carta guarda nella direzione scelta, come da terra; ◎ mostra tutto il cielo (lo zenit al centro, l’orizzonte sul bordo). Trascina per ruotare, pizzica per ingrandire, ▶ fa scorrere la notte, 📅 cambia data e 📸 salva l’immagine. Tocca un astro per sapere cos’è e, nella sua scheda, il suo percorso di quella notte.", "nl": "De kaart kijkt waarheen je kiest, zoals vanaf de grond; ◎ toont de hele hemel (zenit in het midden, horizon aan de rand). Sleep om te draaien, knijp om te zoomen, ▶ laat de nacht lopen, 📅 wisselt de datum en 📸 bewaart de afbeelding. Tik op een object om te zien wat het is en, op zijn kaart, zijn baan die nacht.", "zh": "星图朝向你选择的方向，如同站在地面仰望；◎切换为全天（天顶在中央，地平线在边缘）。拖动旋转，双指缩放，▶播放夜空变化，📅更换日期，📸保存图片。点击天体可查看名称，在其卡片中可看到它当晚的轨迹。", "zht": "星圖朝向你選擇的方向，如同站在地面仰望；◎切換為全天（天頂在中央，地平線在邊緣）。拖曳旋轉，雙指縮放，▶播放夜空變化，📅更換日期，📸儲存圖片。點擊天體可查看名稱，在其卡片中可看到它當晚的軌跡。", "bg": "Картата гледа накъдето избереш, както от земята; ◎ показва цялото небе (зенитът в средата, хоризонтът по ръба). Плъзни за завъртане, щипни за приближаване, ▶ пуска нощта, 📅 сменя датата, а 📸 запазва изображението. Докосни обект, за да видиш какво е, а в картата му – пътя му през тази нощ.", "pl": "Mapa patrzy tam, gdzie wybierzesz, jak znad ziemi; ◎ pokazuje całe niebo (zenit na środku, horyzont na brzegu). Przeciągnij, by obrócić, uszczypnij, by przybliżyć, ▶ odtwarza noc, 📅 zmienia datę, a 📸 zapisuje obraz. Dotknij obiektu, by zobaczyć, co to jest, a na jego karcie – jego drogę tej nocy."},
    "cieloMapaToca": {"es": "Toque una estrella, un planeta o un objeto para ver qué es.", "en": "Tap a star, planet or object to see what it is.", "fr": "Touchez une étoile, une planète ou un objet pour savoir ce que c’est.", "de": "Tippe auf einen Stern, Planeten oder ein Objekt, um zu sehen, was es ist.", "it": "Tocca una stella, un pianeta o un oggetto per sapere cos’è.", "nl": "Tik op een ster, planeet of object om te zien wat het is.", "zh": "点击恒星、行星或天体即可查看名称。", "zht": "點擊恆星、行星或天體即可查看名稱。", "bg": "Докоснете звезда, планета или обект, за да видите какво е.", "pl": "Dotknij gwiazdy, planety lub obiektu, aby zobaczyć, co to jest."},
    "cieloMapaDeDia": {"es": "Es de día: el Sol está sobre el horizonte. Mueva la hora a la noche.", "en": "It’s daytime: the Sun is up. Move the time to the night.", "fr": "Il fait jour : le Soleil est levé. Déplacez l’heure vers la nuit.", "de": "Es ist Tag: Die Sonne steht am Himmel. Schiebe die Uhrzeit in die Nacht.", "it": "È giorno: il Sole è sopra l’orizzonte. Sposta l’ora alla notte.", "nl": "Het is dag: de zon staat boven de horizon. Schuif de tijd naar de nacht.", "zh": "现在是白天：太阳在地平线以上。请把时间调到夜晚。", "zht": "現在是白天：太陽在地平線以上。請把時間調到夜晚。", "bg": "Ден е: Слънцето е над хоризонта. Преместете часа към нощта.", "pl": "Jest dzień: Słońce jest nad horyzontem. Przesuń godzinę na noc."},
    "cieloMapaCrepusculo": {"es": "Crepúsculo: solo se ven las estrellas más brillantes y los planetas.", "en": "Twilight: only the brightest stars and planets show.", "fr": "Crépuscule : seules les étoiles les plus brillantes et les planètes sont visibles.", "de": "Dämmerung: Nur die hellsten Sterne und die Planeten sind zu sehen.", "it": "Crepuscolo: si vedono solo le stelle più luminose e i pianeti.", "nl": "Schemering: alleen de helderste sterren en de planeten zijn te zien.", "zh": "暮光时分：只能看到最亮的恒星和行星。", "zht": "暮光時分：只能看到最亮的恆星和行星。", "bg": "Здрач: виждат се само най-ярките звезди и планетите.", "pl": "Zmierzch: widać tylko najjaśniejsze gwiazdy i planety."},
    "cieloBajoHorizonte": {"es": "Bajo el horizonte en este momento", "en": "Below the horizon right now", "fr": "Sous l’horizon en ce moment", "de": "Gerade unter dem Horizont", "it": "Sotto l’orizzonte in questo momento", "nl": "Op dit moment onder de horizon", "zh": "此刻在地平线以下", "zht": "此刻在地平線以下", "bg": "В момента е под хоризонта", "pl": "W tej chwili pod horyzontem"},
    "cieloAvisoSol": {"es": "Nunca mire el Sol con prismáticos ni telescopio sin un filtro solar homologado: daña la vista al instante.", "en": "Never look at the Sun through binoculars or a telescope without a certified solar filter: it damages your eyes instantly.", "fr": "Ne regardez jamais le Soleil avec des jumelles ou un télescope sans filtre solaire certifié : il abîme les yeux instantanément.", "de": "Schau nie ohne zertifizierten Sonnenfilter mit Fernglas oder Teleskop in die Sonne: Das schädigt die Augen sofort.", "it": "Non guardare mai il Sole con binocolo o telescopio senza un filtro solare certificato: danneggia la vista all’istante.", "nl": "Kijk nooit door een verrekijker of telescoop naar de zon zonder gecertificeerd zonnefilter: dat beschadigt je ogen meteen.", "zh": "切勿在没有合格太阳滤镜的情况下用双筒或天文望远镜看太阳：会立刻伤害眼睛。", "zht": "切勿在沒有合格太陽濾鏡的情況下用雙筒或天文望遠鏡看太陽：會立刻傷害眼睛。", "bg": "Никога не гледайте Слънцето с бинокъл или телескоп без сертифициран слънчев филтър: уврежда очите мигновено.", "pl": "Nigdy nie patrz na Słońce przez lornetkę ani teleskop bez certyfikowanego filtra słonecznego: natychmiast uszkadza wzrok."},
    /* «Donde observar»: por que, sitios, consejos, equipo, fuentes y creditos.
       Fuentes de cada dato:
         · IAC, folleto del Observatorio del Teide: 2.390 m; los alisios dan un
           clima estable con poca turbulencia y la capa de inversion, donde se
           forman las nubes bajas, queda por lo general muy por debajo de las
           cumbres. https://iac.edu.es/system/files/documents/2019-09/enofolleto.pdf
         · IAC, «Proteccion del cielo»: la Ley 31/1988 y su reglamento (R. D.
           243/1992, modificado por el R. D. 580/2017) protegen de la
           contaminacion luminica, radioelectrica y atmosferica y de las rutas
           aereas; regulan el alumbrado exterior de La Palma y de la parte de
           Tenerife con vision directa de La Palma.
           https://iac.es/es/observatorios-de-canarias/proteccion-del-cielo
         · Fundacion Starlight, listado de certificaciones: «Cumbres de Tenerife»
           Reserva Starlight (octubre de 2013); «El Teide» Destino Turistico
           Starlight (octubre de 2013); «Granadilla de Abona» (diciembre de 2012) y
           «La Matanza de Acentejo» (septiembre de 2019) Destinos Turisticos.
           https://fundacionstarlight.org/docs/files/255_255-1-listado-certificaciones-dtrs-actualizado.pdf
         · Turismo de Tenerife, «The best places to stargaze in Tenerife»: Guajara
           (Jean Mascart observo desde alli el cometa Halley en 1910 y quedan restos
           de su refugio; subida de una hora mas hora y media), el Parador y sus
           alrededores (aparcamiento amplio, cerca de La Ruleta y los Roques de
           Garcia), el mirador del Llano de Ucanca (al pie de la TF-21, el Teide al
           otro lado de la llanura), el del Tabonal Negro (en la TF-21, mirando a
           Guajara y no al Teide, aparcamiento pequeno, punto de encuentro al
           anochecer), el de La Ruleta (junto a los Roques de Garcia, con sitio
           para un telescopio) e Izaña (por encima de 2.000 m, el Observatorio).
           https://www.webtenerife.co.uk/blog/2019/06/the-best-places-to-stargaze-in-tenerife/
         · IAC, visitas al Observatorio del Teide: visita guiada con reserva previa.
           https://iac.es/es/observatorios-de-canarias/observatorio-del-teide/visitas
         · Turismo de Tenerife, Museo de la Ciencia y el Cosmos: en San Cristobal
           de La Laguna, planetario con entrada aparte, impulsado por el IAC con el
           Cabildo. https://www.webtenerife.co.uk/what-see/museums/museo-de-la-ciencia-y-el-cosmos/ */
    "cieloPorQue": {"es": "Por qué el cielo de Tenerife", "en": "Why Tenerife’s sky", "fr": "Pourquoi le ciel de Tenerife", "de": "Warum der Himmel über Teneriffa", "it": "Perché il cielo di Tenerife", "nl": "Waarom de hemel van Tenerife", "zh": "为何是特内里费的星空", "zht": "為何是特內里費的星空", "bg": "Защо небето над Тенерифе", "pl": "Dlaczego niebo nad Teneryfą"},
    "cieloPorQueTxt": {"es": "Las cumbres de Tenerife quedan por encima de la capa de inversión de los alisios: las nubes bajas se forman por debajo y el aire de arriba es estable, con poca turbulencia. Por eso el Instituto de Astrofísica de Canarias (IAC) tiene en Izaña, a 2.390 m, el Observatorio del Teide.", "en": "Tenerife’s summits rise above the trade-wind inversion layer: low clouds form below it, and the air above is stable, with little turbulence. That is why the Instituto de Astrofísica de Canarias (IAC) runs the Teide Observatory at Izaña, 2,390 m up.", "fr": "Les sommets de Tenerife dépassent la couche d’inversion des alizés : les nuages bas se forment en dessous et l’air au-dessus est stable, peu turbulent. C’est pourquoi l’Institut d’astrophysique des Canaries (IAC) a installé l’Observatoire du Teide à Izaña, à 2 390 m.", "de": "Teneriffas Gipfel liegen über der Inversionsschicht des Passats: Tiefe Wolken bilden sich darunter, und die Luft darüber ist ruhig, mit wenig Turbulenz. Deshalb betreibt das Instituto de Astrofísica de Canarias (IAC) das Teide-Observatorium in Izaña, auf 2.390 m.", "it": "Le vette di Tenerife superano lo strato di inversione degli alisei: le nuvole basse si formano sotto e l’aria sopra è stabile, con poca turbolenza. Per questo l’Istituto di Astrofisica delle Canarie (IAC) ha l’Osservatorio del Teide a Izaña, a 2.390 m.", "nl": "De toppen van Tenerife liggen boven de inversielaag van de passaatwind: lage wolken vormen zich daaronder en de lucht erboven is stabiel, met weinig turbulentie. Daarom heeft het Instituto de Astrofísica de Canarias (IAC) het Teide-observatorium in Izaña, op 2.390 m.", "zh": "特内里费的山顶高于信风逆温层：低云在其下方形成，上方空气稳定、湍流很少。因此，加那利天体物理研究所（IAC）把泰德天文台建在海拔2390米的伊萨尼亚。", "zht": "特內里費的山頂高於信風逆溫層：低雲在其下方形成，上方空氣穩定、湍流很少。因此，加那利天體物理研究所（IAC）把泰德天文台建在海拔2390公尺的伊薩尼亞。", "bg": "Върховете на Тенерифе са над инверсионния слой на пасатите: ниските облаци се образуват под него, а въздухът отгоре е стабилен, с малко турбуленция. Затова Институтът по астрофизика на Канарските острови (IAC) има обсерваторията Тейде в Исаня, на 2390 м.", "pl": "Szczyty Teneryfy wznoszą się ponad warstwę inwersji pasatów: niskie chmury tworzą się pod nią, a powietrze wyżej jest stabilne, z niewielką turbulencją. Dlatego Instytut Astrofizyki Wysp Kanaryjskich (IAC) ma Obserwatorium Teide w Izañi, na wysokości 2390 m."},
    "cieloLeyCielo": {"es": "La Ley del Cielo (Ley 31/1988) protege los observatorios de Canarias de la contaminación lumínica, radioeléctrica y atmosférica y de las rutas aéreas; su reglamento regula el alumbrado exterior de La Palma y de la parte de Tenerife que se ve desde La Palma.", "en": "The Sky Law (Law 31/1988) protects the Canary Islands observatories from light, radio and air pollution and from flight routes; its regulations govern outdoor lighting on La Palma and on the part of Tenerife in direct view of La Palma.", "fr": "La loi du ciel (loi 31/1988) protège les observatoires des Canaries de la pollution lumineuse, radioélectrique et atmosphérique et des routes aériennes ; son règlement encadre l’éclairage extérieur de La Palma et de la partie de Tenerife visible depuis La Palma.", "de": "Das Himmelsgesetz (Gesetz 31/1988) schützt die Observatorien der Kanaren vor Licht-, Funk- und Luftverschmutzung und vor Flugrouten; seine Verordnung regelt die Außenbeleuchtung auf La Palma und in dem Teil Teneriffas, der von La Palma aus zu sehen ist.", "it": "La legge del cielo (legge 31/1988) protegge gli osservatori delle Canarie dall’inquinamento luminoso, radioelettrico e atmosferico e dalle rotte aeree; il suo regolamento disciplina l’illuminazione esterna di La Palma e della parte di Tenerife visibile da La Palma.", "nl": "De hemelwet (wet 31/1988) beschermt de observatoria van de Canarische Eilanden tegen licht-, radio- en luchtvervuiling en tegen vliegroutes; het reglement regelt de buitenverlichting op La Palma en op het deel van Tenerife dat zicht heeft op La Palma.", "zh": "“天空法”（第31/1988号法律）保护加那利群岛的天文台免受光污染、无线电干扰、大气污染和航线的影响；其实施条例规范拉帕尔马岛以及特内里费岛可直视拉帕尔马岛的区域的室外照明。", "zht": "「天空法」（第31/1988號法律）保護加那利群島的天文台免受光污染、無線電干擾、大氣污染和航線的影響；其施行細則規範拉帕爾馬島以及特內里費島可直視拉帕爾馬島的區域的室外照明。", "bg": "Законът за небето (Закон 31/1988) пази обсерваториите на Канарските острови от светлинно, радио- и атмосферно замърсяване и от въздушни коридори; правилникът му урежда външното осветление на Ла Палма и на частта от Тенерифе, която се вижда от Ла Палма.", "pl": "Ustawa o niebie (ustawa 31/1988) chroni obserwatoria Wysp Kanaryjskich przed zanieczyszczeniem światłem, falami radiowymi i powietrza oraz przed trasami lotniczymi; jej rozporządzenie reguluje oświetlenie zewnętrzne na La Palmie i w tej części Teneryfy, którą widać z La Palmy."},
    "cieloStarlight": {"es": "En 2013 la Fundación Starlight certificó las cumbres de Tenerife como Reserva Starlight y El Teide como Destino Turístico Starlight; Granadilla de Abona (2012) y La Matanza de Acentejo (2019) también son destinos Starlight.", "en": "In 2013 the Starlight Foundation certified Tenerife’s summits as a Starlight Reserve and El Teide as a Starlight Tourist Destination; Granadilla de Abona (2012) and La Matanza de Acentejo (2019) are Starlight destinations too.", "fr": "En 2013, la Fondation Starlight a certifié les sommets de Tenerife comme Réserve Starlight et El Teide comme Destination touristique Starlight ; Granadilla de Abona (2012) et La Matanza de Acentejo (2019) sont aussi des destinations Starlight.", "de": "2013 zertifizierte die Starlight-Stiftung die Gipfelregion Teneriffas als Starlight-Reservat und den Teide als Starlight-Reiseziel; auch Granadilla de Abona (2012) und La Matanza de Acentejo (2019) sind Starlight-Reiseziele.", "it": "Nel 2013 la Fondazione Starlight ha certificato le vette di Tenerife come Riserva Starlight e il Teide come Destinazione turistica Starlight; anche Granadilla de Abona (2012) e La Matanza de Acentejo (2019) sono destinazioni Starlight.", "nl": "In 2013 certificeerde de Starlight-stichting de toppen van Tenerife als Starlight-reservaat en de Teide als Starlight-toeristische bestemming; ook Granadilla de Abona (2012) en La Matanza de Acentejo (2019) zijn Starlight-bestemmingen.", "zh": "2013年，星光基金会把特内里费山顶地区认证为星光保护区，把泰德认证为星光旅游目的地；格拉纳迪利亚-德阿沃纳（2012年）和拉马坦萨-德阿森特霍（2019年）也是星光旅游目的地。", "zht": "2013年，星光基金會把特內里費山頂地區認證為星光保護區，把泰德認證為星光旅遊目的地；格拉納迪利亞-德阿沃納（2012年）和拉馬坦薩-德阿森特霍（2019年）也是星光旅遊目的地。", "bg": "През 2013 г. фондация „Старлайт“ сертифицира върховете на Тенерифе като резерват „Старлайт“ и Тейде като туристическа дестинация „Старлайт“; Гранадиля де Абона (2012) и Ла Матанса де Асентехо (2019) също са дестинации „Старлайт“.", "pl": "W 2013 roku Fundacja Starlight uznała szczyty Teneryfy za Rezerwat Starlight, a Teide za Turystyczny Cel Starlight; Granadilla de Abona (2012) i La Matanza de Acentejo (2019) także są celami Starlight."},
    "cieloSitios": {"es": "Dónde mirar las estrellas", "en": "Where to stargaze", "fr": "Où observer les étoiles", "de": "Wo man Sterne beobachtet", "it": "Dove guardare le stelle", "nl": "Waar je naar de sterren kijkt", "zh": "观星地点", "zht": "觀星地點", "bg": "Къде да гледаме звездите", "pl": "Gdzie oglądać gwiazdy"},
    "cieloSitioUcanca": {"es": "Mirador del Llano de Ucanca", "en": "Llano de Ucanca viewpoint", "fr": "Belvédère du Llano de Ucanca", "de": "Aussichtspunkt Llano de Ucanca", "it": "Belvedere del Llano de Ucanca", "nl": "Uitzichtpunt Llano de Ucanca", "zh": "乌坎卡平原观景台", "zht": "烏坎卡平原觀景台", "bg": "Площадка Льяно де Уканка", "pl": "Punkt widokowy Llano de Ucanca"},
    "cieloSitioUcancaTxt": {"es": "Junto a la TF-21, con el Teide al otro lado de una gran llanura. Se llega en coche.", "en": "Beside the TF-21, with Teide across a wide plain. Reached by car.", "fr": "Au bord de la TF-21, avec le Teide de l’autre côté d’une vaste plaine. Accès en voiture.", "de": "An der TF-21, mit dem Teide jenseits einer weiten Ebene. Mit dem Auto erreichbar.", "it": "Lungo la TF-21, con il Teide al di là di una vasta pianura. Si arriva in auto.", "nl": "Langs de TF-21, met de Teide aan de overkant van een grote vlakte. Bereikbaar met de auto.", "zh": "位于TF-21公路旁，隔着一片大平原遥望泰德峰。可驾车抵达。", "zht": "位於TF-21公路旁，隔著一片大平原遙望泰德峰。可駕車抵達。", "bg": "До пътя TF-21, с Тейде отвъд голяма равнина. Стига се с кола.", "pl": "Przy drodze TF-21, z Teide po drugiej stronie rozległej równiny. Dojazd samochodem."},
    "cieloSitioRuleta": {"es": "Mirador de La Ruleta", "en": "La Ruleta viewpoint", "fr": "Belvédère de La Ruleta", "de": "Aussichtspunkt La Ruleta", "it": "Belvedere de La Ruleta", "nl": "Uitzichtpunt La Ruleta", "zh": "拉鲁莱塔观景台", "zht": "拉魯萊塔觀景台", "bg": "Площадка Ла Рулета", "pl": "Punkt widokowy La Ruleta"},
    "cieloSitioRuletaTxt": {"es": "Junto a los Roques de García, con sitio para montar un telescopio y vistas al Teide.", "en": "Next to the Roques de García, with room to set up a telescope and views of Teide.", "fr": "À côté des Roques de García, avec de la place pour installer un télescope et vue sur le Teide.", "de": "Neben den Roques de García, mit Platz für ein Teleskop und Blick auf den Teide.", "it": "Accanto ai Roques de García, con spazio per montare un telescopio e vista sul Teide.", "nl": "Naast de Roques de García, met ruimte om een telescoop op te zetten en uitzicht op de Teide.", "zh": "紧邻加西亚岩，有空间架设望远镜，可眺望泰德峰。", "zht": "緊鄰加西亞岩，有空間架設望遠鏡，可眺望泰德峰。", "bg": "До скалите Роке де Гарсия, с място за телескоп и гледка към Тейде.", "pl": "Obok skał Roques de García, z miejscem na rozstawienie teleskopu i widokiem na Teide."},
    "cieloSitioParador": {"es": "El Parador y sus alrededores", "en": "The Parador and its surroundings", "fr": "Le Parador et ses environs", "de": "Der Parador und Umgebung", "it": "Il Parador e dintorni", "nl": "De Parador en omgeving", "zh": "国营旅馆及周边", "zht": "國營旅館及周邊", "bg": "Парадорът и околностите", "pl": "Parador i okolice"},
    "cieloSitioParadorTxt": {"es": "El Parador de Las Cañadas es buena base para la noche: aparcamiento amplio y cerca de La Ruleta y los Roques de García.", "en": "The Parador de Las Cañadas is a good base for the night: ample parking, close to La Ruleta and the Roques de García.", "fr": "Le Parador de Las Cañadas est une bonne base pour la nuit : grand parking, près de La Ruleta et des Roques de García.", "de": "Der Parador de Las Cañadas ist eine gute Basis für die Nacht: großer Parkplatz, nahe La Ruleta und den Roques de García.", "it": "Il Parador de Las Cañadas è una buona base per la notte: ampio parcheggio, vicino a La Ruleta e ai Roques de García.", "nl": "De Parador de Las Cañadas is een goede uitvalsbasis voor de nacht: ruime parkeerplaats, dicht bij La Ruleta en de Roques de García.", "zh": "卡尼亚达斯国营旅馆适合作为夜间观星的据点：停车场宽敞，靠近拉鲁莱塔观景台和加西亚岩。", "zht": "卡尼亞達斯國營旅館適合作為夜間觀星的據點：停車場寬敞，靠近拉魯萊塔觀景台和加西亞岩。", "bg": "Парадорът на Лас Канядас е добра база за нощта: голям паркинг, близо до Ла Рулета и Роке де Гарсия.", "pl": "Parador de Las Cañadas to dobra baza na noc: duży parking, blisko La Ruleta i Roques de García."},
    "cieloSitioGuajara": {"es": "Montaña de Guajara", "en": "Guajara mountain", "fr": "Montagne de Guajara", "de": "Berg Guajara", "it": "Monte Guajara", "nl": "Berg Guajara", "zh": "瓜哈拉山", "zht": "瓜哈拉山", "bg": "Връх Гуахара", "pl": "Góra Guajara"},
    "cieloSitioGuajaraTxt": {"es": "Cumbre de más de 2.700 m en el borde de Las Cañadas. En 1910 el astrónomo Jean Mascart observó desde aquí el cometa Halley; en la cima quedan restos de su refugio. Unas dos horas y media de subida a pie.", "en": "A summit over 2,700 m on the rim of Las Cañadas. In 1910 the astronomer Jean Mascart observed Halley’s Comet from here; remains of his hut are still at the top. About two and a half hours’ climb on foot.", "fr": "Sommet de plus de 2 700 m au bord de Las Cañadas. En 1910, l’astronome Jean Mascart y a observé la comète de Halley ; il reste au sommet des vestiges de son refuge. Environ deux heures et demie de montée à pied.", "de": "Gipfel von über 2.700 m am Rand der Cañadas. 1910 beobachtete der Astronom Jean Mascart von hier den Halleyschen Kometen; Reste seiner Hütte stehen noch oben. Etwa zweieinhalb Stunden Aufstieg zu Fuß.", "it": "Vetta di oltre 2.700 m sul bordo de Las Cañadas. Nel 1910 l’astronomo Jean Mascart osservò da qui la cometa di Halley; in cima restano i resti del suo rifugio. Circa due ore e mezza di salita a piedi.", "nl": "Top van meer dan 2.700 m aan de rand van Las Cañadas. In 1910 bekeek de astronoom Jean Mascart hiervandaan de komeet van Halley; op de top staan nog resten van zijn hut. Ongeveer tweeënhalf uur klimmen te voet.", "zh": "卡尼亚达斯边缘一座海拔2700米以上的山峰。1910年，天文学家让·马斯卡尔曾在此观测哈雷彗星，山顶仍留有他小屋的遗迹。步行上山约两个半小时。", "zht": "卡尼亞達斯邊緣一座海拔2700公尺以上的山峰。1910年，天文學家讓·馬斯卡爾曾在此觀測哈雷彗星，山頂仍留有他小屋的遺跡。步行上山約兩個半小時。", "bg": "Връх над 2700 м по ръба на Лас Канядас. През 1910 г. астрономът Жан Маскар наблюдава оттук Халеевата комета; на върха още има останки от хижата му. Изкачване пеша за около два часа и половина.", "pl": "Szczyt o wysokości ponad 2700 m na krawędzi Las Cañadas. W 1910 roku astronom Jean Mascart obserwował stąd kometę Halleya; na szczycie zostały resztki jego schronienia. Około dwóch i pół godziny podejścia pieszo."},
    "cieloSitioTabonal": {"es": "Mirador del Tabonal Negro", "en": "Tabonal Negro viewpoint", "fr": "Belvédère du Tabonal Negro", "de": "Aussichtspunkt Tabonal Negro", "it": "Belvedere del Tabonal Negro", "nl": "Uitzichtpunt Tabonal Negro", "zh": "塔沃纳尔内格罗观景台", "zht": "塔沃納爾內格羅觀景台", "bg": "Площадка Табонал Негро", "pl": "Punkt widokowy Tabonal Negro"},
    "cieloSitioTabonalTxt": {"es": "En la TF-21, mirando a la montaña de Guajara y no al Teide. Aparcamiento pequeño; buen punto de encuentro al anochecer.", "en": "On the TF-21, facing Guajara mountain rather than Teide. Small car park; a good meeting point at dusk.", "fr": "Sur la TF-21, face à la montagne de Guajara plutôt qu’au Teide. Petit parking ; bon point de rendez-vous au crépuscule.", "de": "An der TF-21, mit Blick auf den Guajara statt auf den Teide. Kleiner Parkplatz; guter Treffpunkt in der Abenddämmerung.", "it": "Sulla TF-21, rivolto al monte Guajara anziché al Teide. Parcheggio piccolo; buon punto d’incontro al tramonto.", "nl": "Aan de TF-21, met zicht op de Guajara in plaats van de Teide. Kleine parkeerplaats; goed verzamelpunt bij het vallen van de avond.", "zh": "位于TF-21公路上，面朝瓜哈拉山而非泰德峰。停车场较小，适合在黄昏时集合。", "zht": "位於TF-21公路上，面朝瓜哈拉山而非泰德峰。停車場較小，適合在黃昏時集合。", "bg": "На пътя TF-21, с гледка към Гуахара, а не към Тейде. Малък паркинг; удобно място за среща по здрач.", "pl": "Przy drodze TF-21, z widokiem na górę Guajara zamiast na Teide. Mały parking; dobre miejsce zbiórki o zmierzchu."},
    "cieloSitioIzana": {"es": "Izaña y el Observatorio del Teide", "en": "Izaña and the Teide Observatory", "fr": "Izaña et l’Observatoire du Teide", "de": "Izaña und das Teide-Observatorium", "it": "Izaña e l’Osservatorio del Teide", "nl": "Izaña en het Teide-observatorium", "zh": "伊萨尼亚与泰德天文台", "zht": "伊薩尼亞與泰德天文台", "bg": "Исаня и обсерваторията Тейде", "pl": "Izaña i Obserwatorium Teide"},
    "cieloSitioIzanaTxt": {"es": "Zona a más de 2.000 m. El observatorio es una instalación científica: solo se entra en visitas guiadas con reserva previa (información en la web del IAC).", "en": "An area above 2,000 m. The observatory is a scientific facility: it can only be visited on guided tours booked in advance (details on the IAC website).", "fr": "Zone à plus de 2 000 m. L’observatoire est une installation scientifique : on n’y entre qu’en visite guidée sur réservation (informations sur le site de l’IAC).", "de": "Gebiet über 2.000 m. Das Observatorium ist eine wissenschaftliche Einrichtung: Besuch nur mit Führung und vorheriger Reservierung (Infos auf der Website des IAC).", "it": "Zona oltre i 2.000 m. L’osservatorio è un impianto scientifico: si entra solo con visite guidate su prenotazione (informazioni sul sito dell’IAC).", "nl": "Gebied boven 2.000 m. Het observatorium is een wetenschappelijke installatie: alleen te bezoeken met een rondleiding na reservering (info op de website van het IAC).", "zh": "海拔2000米以上的区域。天文台是科研设施，只能通过提前预约的导览参观（详情见IAC官网）。", "zht": "海拔2000公尺以上的區域。天文台是科研設施，只能透過提前預約的導覽參觀（詳情見IAC官網）。", "bg": "Район над 2000 м. Обсерваторията е научно съоръжение: влиза се само с екскурзовод и предварителна резервация (информация на сайта на IAC).", "pl": "Obszar powyżej 2000 m. Obserwatorium to placówka naukowa: można je zwiedzać tylko z przewodnikiem po wcześniejszej rezerwacji (informacje na stronie IAC)."},
    "cieloSitioMuseo": {"es": "Museo de la Ciencia y el Cosmos", "en": "Museum of Science and the Cosmos", "fr": "Musée de la Science et du Cosmos", "de": "Museum der Wissenschaft und des Kosmos", "it": "Museo della Scienza e del Cosmo", "nl": "Museum van Wetenschap en Kosmos", "zh": "科学与宇宙博物馆", "zht": "科學與宇宙博物館", "bg": "Музей на науката и космоса", "pl": "Muzeum Nauki i Kosmosu"},
    "cieloSitioMuseoTxt": {"es": "En San Cristóbal de La Laguna, con planetario (las sesiones llevan entrada aparte); lo impulsó el IAC junto al Cabildo. Un plan para cuando el cielo está cubierto.", "en": "In San Cristóbal de La Laguna, with a planetarium (sessions need a separate ticket); set up by the IAC with the Cabildo. A plan for when the sky is overcast.", "fr": "À San Cristóbal de La Laguna, avec un planétarium (séances avec billet à part) ; créé à l’initiative de l’IAC avec le Cabildo. Une idée pour les jours couverts.", "de": "In San Cristóbal de La Laguna, mit Planetarium (Vorführungen mit eigenem Ticket); angestoßen vom IAC zusammen mit dem Cabildo. Eine Idee für bewölkte Tage.", "it": "A San Cristóbal de La Laguna, con planetario (spettacoli con biglietto a parte); promosso dall’IAC insieme al Cabildo. Un’idea per quando il cielo è coperto.", "nl": "In San Cristóbal de La Laguna, met planetarium (voorstellingen met een apart kaartje); opgezet door het IAC samen met de Cabildo. Een plan voor als de hemel bewolkt is.", "zh": "位于圣克里斯托瓦尔德拉拉古纳，设有天象馆（场次需另购票）；由IAC与岛政府共同推动创建。阴天时的好去处。", "zht": "位於聖克里斯托瓦爾德拉拉古納，設有天象館（場次需另購票）；由IAC與島政府共同推動創建。陰天時的好去處。", "bg": "В Сан Кристобал де ла Лагуна, с планетариум (сеансите са с отделен билет); създаден по инициатива на IAC заедно с Кабилдото. Идея за облачните дни.", "pl": "W San Cristóbal de La Laguna, z planetarium (seanse z osobnym biletem); powstało z inicjatywy IAC i Cabildo. Pomysł na pochmurne dni."},
    "cieloSitiosFuente": {"es": "Los seis primeros son los que recomienda Turismo de Tenerife para observar las estrellas.", "en": "The first six are the spots Turismo de Tenerife recommends for stargazing.", "fr": "Les six premiers sont les lieux que recommande Turismo de Tenerife pour observer les étoiles.", "de": "Die ersten sechs empfiehlt Turismo de Tenerife zum Sternebeobachten.", "it": "I primi sei sono quelli che Turismo de Tenerife consiglia per osservare le stelle.", "nl": "De eerste zes zijn de plekken die Turismo de Tenerife aanraadt om naar de sterren te kijken.", "zh": "前六处是特内里费旅游局（Turismo de Tenerife）推荐的观星地点。", "zht": "前六處是特內里費旅遊局（Turismo de Tenerife）推薦的觀星地點。", "bg": "Първите шест са местата, които Turismo de Tenerife препоръчва за наблюдение на звездите.", "pl": "Pierwsze sześć to miejsca, które Turismo de Tenerife poleca do obserwacji gwiazd."},
    "cieloVerEnElMapa": {"es": "Ver en el mapa", "en": "Show on the map", "fr": "Voir sur la carte", "de": "Auf der Karte zeigen", "it": "Vedi sulla mappa", "nl": "Toon op de kaart", "zh": "在地图上查看", "zht": "在地圖上查看", "bg": "Покажи на картата", "pl": "Pokaż na mapie"},
    "cieloConsejos": {"es": "Consejos para la noche", "en": "Tips for the night", "fr": "Conseils pour la nuit", "de": "Tipps für die Nacht", "it": "Consigli per la notte", "nl": "Tips voor de nacht", "zh": "夜间观星提示", "zht": "夜間觀星提示", "bg": "Съвети за нощта", "pl": "Wskazówki na noc"},
    "cieloConsejo1": {"es": "Antes de subir, mire la previsión de montaña (nubes, viento, polvo en suspensión) y el estado de las carreteras.", "en": "Before driving up, check the mountain forecast (cloud, wind, dust haze) and road conditions.", "fr": "Avant de monter, consultez la météo de montagne (nuages, vent, brume de poussière) et l’état des routes.", "de": "Prüfe vor der Fahrt nach oben die Bergwettervorhersage (Wolken, Wind, Staubdunst) und den Straßenzustand.", "it": "Prima di salire, controlla le previsioni di montagna (nuvole, vento, foschia di polvere) e lo stato delle strade.", "nl": "Kijk voor je naar boven gaat naar de bergweersverwachting (wolken, wind, stofnevel) en de toestand van de wegen.", "zh": "上山前查看山区天气预报（云量、风力、沙尘）和道路状况。", "zht": "上山前查看山區天氣預報（雲量、風力、沙塵）和道路狀況。", "bg": "Преди да се качите, проверете планинската прогноза (облаци, вятър, прашна мъгла) и състоянието на пътищата.", "pl": "Przed wyjazdem w góry sprawdź prognozę górską (chmury, wiatr, mgiełka pyłowa) i stan dróg."},
    "cieloConsejo2": {"es": "En las cumbres refresca mucho de noche, también en verano: lleve abrigo y gorro.", "en": "At the summits nights get cold, even in summer: bring a warm jacket and a hat.", "fr": "Sur les sommets, les nuits sont fraîches, même en été : prévoyez une veste chaude et un bonnet.", "de": "Auf den Gipfeln werden die Nächte kalt, auch im Sommer: Nimm eine warme Jacke und eine Mütze mit.", "it": "In vetta le notti sono fredde, anche d’estate: porta una giacca pesante e un berretto.", "nl": "Op de toppen worden de nachten koud, ook in de zomer: neem een warme jas en een muts mee.", "zh": "山顶夜间很冷，夏天也不例外：请带上保暖外套和帽子。", "zht": "山頂夜間很冷，夏天也不例外：請帶上保暖外套和帽子。", "bg": "На върховете нощите са студени, дори през лятото: вземете топло яке и шапка.", "pl": "Na szczytach noce są zimne, nawet latem: weź ciepłą kurtkę i czapkę."},
    "cieloConsejo3": {"es": "Apague las luces blancas y deje que la vista se adapte unos 20 minutos; use la luz roja de esta pantalla.", "en": "Switch off white lights and let your eyes adapt for about 20 minutes; use this screen’s red light.", "fr": "Éteignez les lumières blanches et laissez vos yeux s’adapter environ 20 minutes ; utilisez la lumière rouge de cet écran.", "de": "Schalte weißes Licht aus und gib den Augen etwa 20 Minuten zum Anpassen; nutze das Rotlicht dieses Bildschirms.", "it": "Spegni le luci bianche e lascia che gli occhi si adattino per circa 20 minuti; usa la luce rossa di questo schermo.", "nl": "Doe witte lampen uit en laat je ogen zo’n 20 minuten wennen; gebruik het rode licht van dit scherm.", "zh": "关掉白光，让眼睛适应约20分钟；请使用本屏幕的红光模式。", "zht": "關掉白光，讓眼睛適應約20分鐘；請使用本螢幕的紅光模式。", "bg": "Изгасете белите светлини и оставете очите да свикнат около 20 минути; използвайте червената светлина на този екран.", "pl": "Zgaś białe światła i daj oczom około 20 minut na przyzwyczajenie; używaj czerwonego światła tego ekranu."},
    "cieloConsejo4": {"es": "Aparque solo en zonas habilitadas y no salga de los senderos: es un Parque Nacional.", "en": "Park only in designated areas and stay on the trails: this is a National Park.", "fr": "Garez-vous uniquement sur les aires prévues et ne quittez pas les sentiers : c’est un parc national.", "de": "Parke nur auf ausgewiesenen Flächen und bleib auf den Wegen: Es ist ein Nationalpark.", "it": "Parcheggia solo nelle aree consentite e non uscire dai sentieri: è un Parco Nazionale.", "nl": "Parkeer alleen op aangewezen plekken en blijf op de paden: het is een nationaal park.", "zh": "只在指定区域停车，不要离开步道：这里是国家公园。", "zht": "只在指定區域停車，不要離開步道：這裡是國家公園。", "bg": "Паркирайте само на разрешените места и не излизайте от пътеките: това е национален парк.", "pl": "Parkuj tylko w wyznaczonych miejscach i nie schodź ze szlaków: to park narodowy."},
    "cieloConsejo5": {"es": "Baje despacio: son carreteras de montaña con muchas curvas, y de noche se conduce más cansado.", "en": "Drive back down slowly: these are winding mountain roads, and at night you are more tired.", "fr": "Redescendez lentement : ce sont des routes de montagne sinueuses, et la nuit on conduit plus fatigué.", "de": "Fahr langsam hinunter: Es sind kurvige Bergstraßen, und nachts fährt man müder.", "it": "Scendi piano: sono strade di montagna piene di curve, e di notte si guida più stanchi.", "nl": "Rij langzaam terug naar beneden: het zijn bochtige bergwegen en ’s nachts ben je vermoeider.", "zh": "下山时慢慢开：山路弯多，夜间驾驶也更容易疲劳。", "zht": "下山時慢慢開：山路彎多，夜間駕駛也更容易疲勞。", "bg": "Слизайте бавно: пътищата са планински и с много завои, а нощем се шофира по-уморено.", "pl": "Zjeżdżaj powoli: to kręte górskie drogi, a w nocy jest się bardziej zmęczonym."},
    "cieloConsejo6": {"es": "Para caminar de noche lleve frontal (mejor con luz roja), agua y ropa de abrigo, y diga a alguien adónde va.", "en": "For night walks take a head torch (ideally with red light), water and warm clothes, and tell someone where you are going.", "fr": "Pour marcher de nuit, prenez une lampe frontale (avec lumière rouge si possible), de l’eau et des vêtements chauds, et dites à quelqu’un où vous allez.", "de": "Für Nachtwanderungen: Stirnlampe (am besten mit Rotlicht), Wasser und warme Kleidung mitnehmen, und jemandem sagen, wohin du gehst.", "it": "Per camminare di notte porta una frontale (meglio con luce rossa), acqua e vestiti caldi, e di’ a qualcuno dove vai.", "nl": "Neem voor nachtwandelingen een hoofdlamp (liefst met rood licht), water en warme kleren mee, en vertel iemand waar je heen gaat.", "zh": "夜间徒步请带头灯（最好有红光）、饮水和保暖衣物，并告诉别人你的去向。", "zht": "夜間健行請帶頭燈（最好有紅光）、飲水和保暖衣物，並告訴別人你的去向。", "bg": "За нощни преходи вземете челник (за предпочитане с червена светлина), вода и топли дрехи и кажете на някого къде отивате.", "pl": "Na nocne wędrówki weź czołówkę (najlepiej z czerwonym światłem), wodę i ciepłe ubranie, i powiedz komuś, dokąd idziesz."},
    "cieloEquipo": {"es": "Qué llevar para mirar", "en": "What to bring", "fr": "Quel matériel", "de": "Welche Ausrüstung", "it": "Cosa portare", "nl": "Wat mee te nemen", "zh": "观测器材", "zht": "觀測器材", "bg": "Какво да вземете", "pl": "Co zabrać"},
    "cieloEquipoOjo": {"es": "Constelaciones, estrellas brillantes, planetas, la Vía Láctea, lluvias de estrellas y la Luna. Basta con un sitio oscuro y tiempo para que la vista se adapte.", "en": "Constellations, bright stars, planets, the Milky Way, meteor showers and the Moon. All you need is a dark site and time for your eyes to adapt.", "fr": "Constellations, étoiles brillantes, planètes, Voie lactée, étoiles filantes et Lune. Il suffit d’un site sombre et de laisser les yeux s’adapter.", "de": "Sternbilder, helle Sterne, Planeten, Milchstraße, Sternschnuppen und Mond. Es reicht ein dunkler Ort und Zeit, damit sich die Augen anpassen.", "it": "Costellazioni, stelle luminose, pianeti, Via Lattea, stelle cadenti e Luna. Bastano un luogo buio e il tempo perché gli occhi si adattino.", "nl": "Sterrenbeelden, heldere sterren, planeten, de Melkweg, meteoren en de maan. Een donkere plek en tijd om je ogen te laten wennen is genoeg.", "zh": "星座、亮星、行星、银河、流星雨和月亮。只需一个黑暗的地方，并给眼睛时间适应。", "zht": "星座、亮星、行星、銀河、流星雨和月亮。只需一個黑暗的地方，並給眼睛時間適應。", "bg": "Съзвездия, ярки звезди, планети, Млечния път, метеорни потоци и Луната. Достатъчни са тъмно място и време очите да свикнат.", "pl": "Gwiazdozbiory, jasne gwiazdy, planety, Droga Mleczna, roje meteorów i Księżyc. Wystarczy ciemne miejsce i czas, by oczy się przyzwyczaiły."},
    "cieloEquipoPrismaticos": {"es": "Unos 7×50 o 10×50, apoyados o en trípode: las Pléyades, la galaxia de Andrómeda, el Doble Cúmulo de Perseo, cúmulos de la Vía Láctea y los satélites de Júpiter.", "en": "7×50 or 10×50, braced or on a tripod: the Pleiades, the Andromeda Galaxy, the Double Cluster in Perseus, Milky Way clusters and Jupiter’s moons.", "fr": "Des 7×50 ou 10×50, appuyées ou sur trépied : les Pléiades, la galaxie d’Andromède, le Double Amas de Persée, les amas de la Voie lactée et les satellites de Jupiter.", "de": "Ein 7×50 oder 10×50, aufgestützt oder auf Stativ: Plejaden, Andromedagalaxie, der Doppelsternhaufen im Perseus, Sternhaufen der Milchstraße und die Jupitermonde.", "it": "Un 7×50 o 10×50, appoggiato o su treppiede: le Pleiadi, la galassia di Andromeda, il Doppio Ammasso di Perseo, gli ammassi della Via Lattea e i satelliti di Giove.", "nl": "Een 7×50 of 10×50, ondersteund of op statief: de Pleiaden, de Andromedanevel, de Dubbele Sterrenhoop in Perseus, sterrenhopen in de Melkweg en de manen van Jupiter.", "zh": "7×50或10×50双筒望远镜，最好架稳或装上三脚架：昴星团、仙女座星系、英仙座双星团、银河中的星团和木星的卫星。", "zht": "7×50或10×50雙筒望遠鏡，最好架穩或裝上三腳架：昴宿星團、仙女座星系、英仙座雙星團、銀河中的星團和木星的衛星。", "bg": "Бинокъл 7×50 или 10×50, подпрян или на статив: Плеядите, галактиката Андромеда, двойния куп в Персей, купове в Млечния път и спътниците на Юпитер.", "pl": "Lornetka 7×50 lub 10×50, oparta albo na statywie: Plejady, Galaktyka Andromedy, Podwójna Gromada w Perseuszu, gromady Drogi Mlecznej i księżyce Jowisza."},
    "cieloEquipoTelescopio": {"es": "Cráteres de la Luna, los anillos de Saturno, estrellas dobles cerradas, cúmulos globulares, nebulosas planetarias y galaxias. Pide carta celeste y paciencia.", "en": "Lunar craters, Saturn’s rings, close double stars, globular clusters, planetary nebulae and galaxies. Bring a star chart and patience.", "fr": "Cratères lunaires, anneaux de Saturne, étoiles doubles serrées, amas globulaires, nébuleuses planétaires et galaxies. Prévoyez une carte du ciel et de la patience.", "de": "Mondkrater, Saturnringe, enge Doppelsterne, Kugelsternhaufen, planetarische Nebel und Galaxien. Dazu eine Sternkarte und Geduld.", "it": "Crateri lunari, anelli di Saturno, stelle doppie strette, ammassi globulari, nebulose planetarie e galassie. Servono una carta celeste e pazienza.", "nl": "Maankraters, de ringen van Saturnus, nauwe dubbelsterren, bolhopen, planetaire nevels en sterrenstelsels. Neem een sterrenkaart en geduld mee.", "zh": "月球环形山、土星环、角距很小的双星、球状星团、行星状星云和星系。需要星图和耐心。", "zht": "月球環形山、土星環、角距很小的雙星、球狀星團、行星狀星雲和星系。需要星圖和耐心。", "bg": "Лунни кратери, пръстените на Сатурн, тесни двойни звезди, кълбовидни купове, планетарни мъглявини и галактики. Нужни са звездна карта и търпение.", "pl": "Kratery na Księżycu, pierścienie Saturna, ciasne gwiazdy podwójne, gromady kuliste, mgławice planetarne i galaktyki. Potrzebna mapa nieba i cierpliwość."},
    "cieloOficiales": {"es": "Fuentes oficiales", "en": "Official sources", "fr": "Sources officielles", "de": "Offizielle Quellen", "it": "Fonti ufficiali", "nl": "Officiële bronnen", "zh": "官方来源", "zht": "官方來源", "bg": "Официални източници", "pl": "Oficjalne źródła"},
    "cieloEnlaceAtlas": {"es": "Atlas celeste para Canarias (IGN)", "en": "Sky atlas for the Canary Islands (IGN)", "fr": "Atlas céleste des Canaries (IGN)", "de": "Himmelsatlas für die Kanaren (IGN)", "it": "Atlante celeste per le Canarie (IGN)", "nl": "Hemelatlas voor de Canarische Eilanden (IGN)", "zh": "加那利群岛星图集（IGN）", "zht": "加那利群島星圖集（IGN）", "bg": "Небесен атлас за Канарските острови (IGN)", "pl": "Atlas nieba dla Wysp Kanaryjskich (IGN)"},
    "cieloEnlaceEclipsesIgn": {"es": "Eclipses de Sol y Luna (IGN)", "en": "Solar and lunar eclipses (IGN)", "fr": "Éclipses de Soleil et de Lune (IGN)", "de": "Sonnen- und Mondfinsternisse (IGN)", "it": "Eclissi di Sole e di Luna (IGN)", "nl": "Zons- en maansverduisteringen (IGN)", "zh": "日食与月食（IGN）", "zht": "日食與月食（IGN）", "bg": "Слънчеви и лунни затъмнения (IGN)", "pl": "Zaćmienia Słońca i Księżyca (IGN)"},
    "cieloEnlaceIac": {"es": "Instituto de Astrofísica de Canarias", "en": "Instituto de Astrofísica de Canarias (IAC)", "fr": "Institut d’astrophysique des Canaries (IAC)", "de": "Instituto de Astrofísica de Canarias (IAC)", "it": "Istituto di Astrofisica delle Canarie (IAC)", "nl": "Instituto de Astrofísica de Canarias (IAC)", "zh": "加那利天体物理研究所（IAC）", "zht": "加那利天體物理研究所（IAC）", "bg": "Институт по астрофизика на Канарските острови (IAC)", "pl": "Instytut Astrofizyki Wysp Kanaryjskich (IAC)"},
    "cieloEnlaceVisitas": {"es": "Visitas al Observatorio del Teide (IAC)", "en": "Teide Observatory visits (IAC)", "fr": "Visites de l’Observatoire du Teide (IAC)", "de": "Besuche im Teide-Observatorium (IAC)", "it": "Visite all’Osservatorio del Teide (IAC)", "nl": "Bezoek aan het Teide-observatorium (IAC)", "zh": "参观泰德天文台（IAC）", "zht": "參觀泰德天文台（IAC）", "bg": "Посещения в обсерваторията Тейде (IAC)", "pl": "Zwiedzanie Obserwatorium Teide (IAC)"},
    "cieloEnlaceLey": {"es": "Protección del cielo: la Ley del Cielo (IAC)", "en": "Sky protection: the Sky Law (IAC)", "fr": "Protection du ciel : la loi du ciel (IAC)", "de": "Himmelsschutz: das Himmelsgesetz (IAC)", "it": "Protezione del cielo: la legge del cielo (IAC)", "nl": "Bescherming van de hemel: de hemelwet (IAC)", "zh": "天空保护：天空法（IAC）", "zht": "天空保護：天空法（IAC）", "bg": "Защита на небето: Законът за небето (IAC)", "pl": "Ochrona nieba: ustawa o niebie (IAC)"},
    "cieloEnlaceStarlight": {"es": "Certificaciones Starlight (Fundación Starlight)", "en": "Starlight certifications (Starlight Foundation)", "fr": "Certifications Starlight (Fondation Starlight)", "de": "Starlight-Zertifizierungen (Starlight-Stiftung)", "it": "Certificazioni Starlight (Fondazione Starlight)", "nl": "Starlight-certificeringen (Starlight-stichting)", "zh": "星光认证（Starlight基金会）", "zht": "星光認證（Starlight基金會）", "bg": "Сертификати „Старлайт“ (фондация „Старлайт“)", "pl": "Certyfikaty Starlight (Fundacja Starlight)"},
    "cieloEnlaceImo": {"es": "Lluvias de meteoros: International Meteor Organization", "en": "Meteor showers: International Meteor Organization", "fr": "Étoiles filantes : International Meteor Organization", "de": "Meteorströme: International Meteor Organization", "it": "Stelle cadenti: International Meteor Organization", "nl": "Meteorenzwermen: International Meteor Organization", "zh": "流星雨：国际流星组织（IMO）", "zht": "流星雨：國際流星組織（IMO）", "bg": "Метеорни потоци: International Meteor Organization", "pl": "Roje meteorów: International Meteor Organization"},
    "cieloCreditos": {"es": "Datos y créditos", "en": "Data and credits", "fr": "Données et crédits", "de": "Daten und Quellen", "it": "Dati e crediti", "nl": "Gegevens en bronnen", "zh": "数据与致谢", "zht": "資料與致謝", "bg": "Данни и източници", "pl": "Dane i źródła"},
    "cieloCreditosTxt": {"es": "Estrellas: HYG v4.1 (CC BY-SA 4.0) y el Yale Bright Star Catalogue. Cielo profundo: OpenNGC (CC BY-SA 4.0). Figuras y Vía Láctea: d3-celestial (BSD). Variables y lluvias: GCVS y lista de la IMO, a través de Stellarium (GPL). Cálculos: Astronomy Engine (MIT), en el propio móvil.", "en": "Stars: HYG v4.1 (CC BY-SA 4.0) and the Yale Bright Star Catalogue. Deep sky: OpenNGC (CC BY-SA 4.0). Figures and Milky Way: d3-celestial (BSD). Variables and showers: GCVS and the IMO list, via Stellarium (GPL). Calculations: Astronomy Engine (MIT), on your own phone.", "fr": "Étoiles : HYG v4.1 (CC BY-SA 4.0) et le Yale Bright Star Catalogue. Ciel profond : OpenNGC (CC BY-SA 4.0). Figures et Voie lactée : d3-celestial (BSD). Variables et étoiles filantes : GCVS et liste de l’IMO, via Stellarium (GPL). Calculs : Astronomy Engine (MIT), sur votre propre téléphone.", "de": "Sterne: HYG v4.1 (CC BY-SA 4.0) und der Yale Bright Star Catalogue. Deep Sky: OpenNGC (CC BY-SA 4.0). Figuren und Milchstraße: d3-celestial (BSD). Veränderliche und Meteorströme: GCVS und die Liste der IMO, über Stellarium (GPL). Berechnungen: Astronomy Engine (MIT), auf deinem eigenen Handy.", "it": "Stelle: HYG v4.1 (CC BY-SA 4.0) e lo Yale Bright Star Catalogue. Cielo profondo: OpenNGC (CC BY-SA 4.0). Figure e Via Lattea: d3-celestial (BSD). Variabili e stelle cadenti: GCVS ed elenco dell’IMO, tramite Stellarium (GPL). Calcoli: Astronomy Engine (MIT), sul tuo telefono.", "nl": "Sterren: HYG v4.1 (CC BY-SA 4.0) en de Yale Bright Star Catalogue. Deep-sky: OpenNGC (CC BY-SA 4.0). Figuren en Melkweg: d3-celestial (BSD). Veranderlijke sterren en meteorenzwermen: GCVS en de lijst van de IMO, via Stellarium (GPL). Berekeningen: Astronomy Engine (MIT), op je eigen telefoon.", "zh": "恒星：HYG v4.1（CC BY-SA 4.0）与耶鲁亮星星表。深空天体：OpenNGC（CC BY-SA 4.0）。星座连线与银河：d3-celestial（BSD）。变星与流星雨：GCVS与IMO列表，经由Stellarium（GPL）。计算：Astronomy Engine（MIT），在你的手机上完成。", "zht": "恆星：HYG v4.1（CC BY-SA 4.0）與耶魯亮星星表。深空天體：OpenNGC（CC BY-SA 4.0）。星座連線與銀河：d3-celestial（BSD）。變星與流星雨：GCVS與IMO列表，經由Stellarium（GPL）。計算：Astronomy Engine（MIT），在你的手機上完成。", "bg": "Звезди: HYG v4.1 (CC BY-SA 4.0) и Йейлския каталог на ярките звезди. Дълбок космос: OpenNGC (CC BY-SA 4.0). Фигури и Млечен път: d3-celestial (BSD). Променливи звезди и метеорни потоци: GCVS и списъка на IMO, чрез Stellarium (GPL). Изчисления: Astronomy Engine (MIT), на самия телефон.", "pl": "Gwiazdy: HYG v4.1 (CC BY-SA 4.0) i Yale Bright Star Catalogue. Głębokie niebo: OpenNGC (CC BY-SA 4.0). Figury i Droga Mleczna: d3-celestial (BSD). Gwiazdy zmienne i roje: GCVS i lista IMO, za pośrednictwem Stellarium (GPL). Obliczenia: Astronomy Engine (MIT), w twoim telefonie."},
    "cieloCreditoHyg": {"es": "Base de estrellas HYG (GitHub)", "en": "HYG star database (GitHub)", "fr": "Base d’étoiles HYG (GitHub)", "de": "HYG-Sterndatenbank (GitHub)", "it": "Database stellare HYG (GitHub)", "nl": "HYG-sterrendatabase (GitHub)", "zh": "HYG恒星数据库（GitHub）", "zht": "HYG恆星資料庫（GitHub）", "bg": "База данни за звезди HYG (GitHub)", "pl": "Baza gwiazd HYG (GitHub)"},
    "cieloCreditoOpenngc": {"es": "Catálogo OpenNGC (GitHub)", "en": "OpenNGC catalog (GitHub)", "fr": "Catalogue OpenNGC (GitHub)", "de": "OpenNGC-Katalog (GitHub)", "it": "Catalogo OpenNGC (GitHub)", "nl": "OpenNGC-catalogus (GitHub)", "zh": "OpenNGC星表（GitHub）", "zht": "OpenNGC星表（GitHub）", "bg": "Каталог OpenNGC (GitHub)", "pl": "Katalog OpenNGC (GitHub)"},
    "cieloCreditoD3": {"es": "Figuras y Vía Láctea: d3-celestial (GitHub)", "en": "Figures and Milky Way: d3-celestial (GitHub)", "fr": "Figures et Voie lactée : d3-celestial (GitHub)", "de": "Figuren und Milchstraße: d3-celestial (GitHub)", "it": "Figure e Via Lattea: d3-celestial (GitHub)", "nl": "Figuren en Melkweg: d3-celestial (GitHub)", "zh": "星座连线与银河：d3-celestial（GitHub）", "zht": "星座連線與銀河：d3-celestial（GitHub）", "bg": "Фигури и Млечен път: d3-celestial (GitHub)", "pl": "Figury i Droga Mleczna: d3-celestial (GitHub)"},
    "cieloCreditoMotor": {"es": "Motor de cálculo: Astronomy Engine (GitHub)", "en": "Calculation engine: Astronomy Engine (GitHub)", "fr": "Moteur de calcul : Astronomy Engine (GitHub)", "de": "Rechenkern: Astronomy Engine (GitHub)", "it": "Motore di calcolo: Astronomy Engine (GitHub)", "nl": "Rekenmotor: Astronomy Engine (GitHub)", "zh": "计算引擎：Astronomy Engine（GitHub）", "zht": "計算引擎：Astronomy Engine（GitHub）", "bg": "Изчислителен модул: Astronomy Engine (GitHub)", "pl": "Silnik obliczeń: Astronomy Engine (GitHub)"},
    "cieloCreditoStellarium": {"es": "Stellarium: nombres, variables y lluvias (GitHub)", "en": "Stellarium: names, variables and showers (GitHub)", "fr": "Stellarium : noms, variables et étoiles filantes (GitHub)", "de": "Stellarium: Namen, Veränderliche und Meteorströme (GitHub)", "it": "Stellarium: nomi, variabili e stelle cadenti (GitHub)", "nl": "Stellarium: namen, veranderlijke sterren en meteorenzwermen (GitHub)", "zh": "Stellarium：名称、变星与流星雨（GitHub）", "zht": "Stellarium：名稱、變星與流星雨（GitHub）", "bg": "Stellarium: имена, променливи звезди и метеорни потоци (GitHub)", "pl": "Stellarium: nazwy, gwiazdy zmienne i roje (GitHub)"},
    /* «Apunta al cielo», la carta nueva y la ficha de cada astro (20-10-2026).
       Fuentes de lo que afirman los textos:
         · Los colores por clase espectral (O azul, B blanco azulado, A blanco,
           F blanco amarillento, G amarillo, K naranja claro, M rojo anaranjado):
           la tabla de la clasificacion de Harvard tal como la resume Wikipedia,
           «Stellar classification» (y Morgan y Keenan para las clases de
           luminosidad: Ia/Ib supergigante, II gigante luminosa, III gigante,
           IV subgigante, V enana o de secuencia principal).
         · La temperatura del color: formula de Ballesteros (EPL 97, 34008, 2012)
           a partir de B−V; se redondea a la centena y se dice «unos».
         · Las lunas de Galileo: Astronomy Engine las calcula (JupiterMoons).
         · «La luz que ves salio hace N años»: un año luz es la distancia que la
           luz recorre en un año (definicion de la UAI), asi que la distancia en
           años luz ES el tiempo de viaje de la luz.
         · La brujula del movil marca el norte magnetico: la API DeviceOrientation
           (W3C) lo define asi, y la declinacion se corrige con el WMM2025 (NOAA).
         · Licencia de los textos de Wikipedia: CC BY-SA 4.0 (Wikimedia Foundation,
           Terms of Use).
       ── la carta ────────────────────────────────────────────────────────── */
    "cieloMapaTodo": {"es": "Todo el cielo", "en": "Whole sky", "fr": "Tout le ciel", "de": "Ganzer Himmel", "it": "Tutto il cielo", "nl": "Hele hemel", "zh": "全天", "zht": "全天", "bg": "Цялото небе", "pl": "Całe niebo"},
    "cieloMapaHorizonte": {"es": "Vista desde el suelo", "en": "Horizon view", "fr": "Vue depuis le sol", "de": "Blick vom Boden", "it": "Vista da terra", "nl": "Zicht vanaf de grond", "zh": "地平线视角", "zht": "地平線視角", "bg": "Изглед от земята", "pl": "Widok znad horyzontu"},
    "cieloMapaCorre": {"es": "Hacer correr la noche", "en": "Play the night", "fr": "Faire défiler la nuit", "de": "Nacht ablaufen lassen", "it": "Far scorrere la notte", "nl": "De nacht laten lopen", "zh": "播放夜空变化", "zht": "播放夜空變化", "bg": "Пусни нощта", "pl": "Odtwórz noc"},
    "cieloMinutos": {"es": "{n} min", "en": "{n} min", "fr": "{n} min", "de": "{n} Min.", "it": "{n} min", "nl": "{n} min", "zh": "{n}分钟", "zht": "{n}分鐘", "bg": "{n} мин", "pl": "{n} min"},
    "cieloMinSeg": {"es": "{m} min {s} s", "en": "{m} min {s} s", "fr": "{m} min {s} s", "de": "{m} Min. {s} s", "it": "{m} min {s} s", "nl": "{m} min {s} s", "zh": "{m}分{s}秒", "zht": "{m}分{s}秒", "bg": "{m} мин {s} с", "pl": "{m} min {s} s"},
    "cieloTipoConstelacion": {"es": "Constelación", "en": "Constellation", "fr": "Constellation", "de": "Sternbild", "it": "Costellazione", "nl": "Sterrenbeeld", "zh": "星座", "zht": "星座", "bg": "Съзвездие", "pl": "Gwiazdozbiór"},
    "cieloTipoPlaneta": {"es": "Planeta", "en": "Planet", "fr": "Planète", "de": "Planet", "it": "Pianeta", "nl": "Planeet", "zh": "行星", "zht": "行星", "bg": "Планета", "pl": "Planeta"},
    "cieloTipoLuna": {"es": "Nuestro satélite", "en": "Our satellite", "fr": "Notre satellite", "de": "Unser Mond", "it": "Il nostro satellite", "nl": "Onze maan", "zh": "地球的卫星", "zht": "地球的衛星", "bg": "Нашият спътник", "pl": "Nasz satelita"},
    "cieloTipoSol": {"es": "Nuestra estrella", "en": "Our star", "fr": "Notre étoile", "de": "Unser Stern", "it": "La nostra stella", "nl": "Onze ster", "zh": "我们的恒星", "zht": "我們的恆星", "bg": "Нашата звезда", "pl": "Nasza gwiazda"},
    "cieloEnCon": {"es": "en {c}", "en": "in {c}", "fr": "dans {c}", "de": "im Sternbild {c}", "it": "in {c}", "nl": "in {c}", "zh": "位于{c}", "zht": "位於{c}", "bg": "в {c}", "pl": "w gwiazdozbiorze {c}"},
    "cieloSinResultados": {"es": "Nada con ese nombre. Pruebe con «Orión», «M42» o «Júpiter».", "en": "Nothing by that name. Try “Orion”, “M42” or “Jupiter”.", "fr": "Rien à ce nom. Essayez « Orion », « M42 » ou « Jupiter ».", "de": "Nichts unter diesem Namen. Versuche „Orion“, „M42“ oder „Jupiter“.", "it": "Niente con questo nome. Prova «Orione», «M42» o «Giove».", "nl": "Niets met die naam. Probeer ‘Orion’, ‘M42’ of ‘Jupiter’.", "zh": "没有这个名字。试试“猎户座”“M42”或“木星”。", "zht": "沒有這個名字。試試「獵戶座」「M42」或「木星」。", "bg": "Няма нищо с това име. Опитай „Орион“, „M42“ или „Юпитер“.", "pl": "Nic o tej nazwie. Spróbuj „Orion”, „M42” lub „Jowisz”."},
    /* ── «Apunta al cielo» ────────────────────────────────────────────────── */
    "cieloApunta": {"es": "Apunte al cielo", "en": "Point at the sky", "fr": "Pointez vers le ciel", "de": "Auf den Himmel zeigen", "it": "Punta al cielo", "nl": "Richt op de hemel", "zh": "对准星空", "zht": "對準星空", "bg": "Насочи към небето", "pl": "Wyceluj w niebo"},
    "cieloApuntaSub": {"es": "Levante el móvil hacia una estrella y le dice cuál es, con su ficha. Con cámara si quiere.", "en": "Hold your phone up to a star and it tells you which one it is, with its card. With the camera if you like.", "fr": "Levez le téléphone vers une étoile : il vous dit laquelle c’est, avec sa fiche. Avec la caméra si vous voulez.", "de": "Halte das Handy auf einen Stern, und es sagt dir, welcher es ist, mit Steckbrief. Auf Wunsch mit Kamera.", "it": "Alza il telefono verso una stella e ti dice qual è, con la sua scheda. Con la fotocamera, se vuoi.", "nl": "Richt je telefoon op een ster en hij vertelt je welke het is, met zijn kaart. Met camera als je wilt.", "zh": "把手机举向一颗星，它会告诉你那是什么，并显示资料卡。也可以打开相机。", "zht": "把手機舉向一顆星，它會告訴你那是什麼，並顯示資料卡。也可以打開相機。", "bg": "Вдигни телефона към някоя звезда и той ти казва коя е, с нейната карта. С камера, ако искаш.", "pl": "Unieś telefon ku gwieździe, a aplikacja powie ci, która to, i pokaże jej kartę. Z kamerą, jeśli chcesz."},
    "cieloApuntaAyuda": {"es": "Mueva el móvil: lo que quede en el círculo se nombra abajo. Toque un astro para ver su ficha, 🔍 para buscar uno.", "en": "Move the phone: whatever sits in the circle is named below. Tap an object for its card, 🔍 to search for one.", "fr": "Bougez le téléphone : ce qui entre dans le cercle est nommé en dessous. Touchez un astre pour sa fiche, 🔍 pour en chercher un.", "de": "Beweg das Handy: Was im Kreis liegt, wird darunter benannt. Tippe auf ein Objekt für seinen Steckbrief, 🔍 zum Suchen.", "it": "Muovi il telefono: ciò che resta nel cerchio è nominato sotto. Tocca un astro per la sua scheda, 🔍 per cercarne uno.", "nl": "Beweeg de telefoon: wat in de cirkel staat, wordt eronder genoemd. Tik op een object voor zijn kaart, 🔍 om er een te zoeken.", "zh": "转动手机：圆圈里的天体会显示在下方。点一下天体看资料卡，点🔍可搜索。", "zht": "轉動手機：圓圈裡的天體會顯示在下方。點一下天體看資料卡，點🔍可搜尋。", "bg": "Движи телефона: това, което попадне в кръга, се изписва отдолу. Докосни обект за картата му, 🔍 за търсене.", "pl": "Poruszaj telefonem: to, co znajdzie się w kółku, pojawia się poniżej. Dotknij obiektu, by zobaczyć jego kartę, 🔍 by wyszukać."},
    "cieloApuntaEstrella": {"es": "Apunte a una estrella para saber cuál es", "en": "Point at a star to find out which it is", "fr": "Visez une étoile pour savoir laquelle c’est", "de": "Ziele auf einen Stern, um zu erfahren, welcher es ist", "it": "Punta una stella per sapere qual è", "nl": "Richt op een ster om te weten welke het is", "zh": "对准一颗星即可知道它是什么", "zht": "對準一顆星即可知道它是什麼", "bg": "Насочи към звезда, за да разбереш коя е", "pl": "Wyceluj w gwiazdę, by dowiedzieć się, która to"},
    "cieloSaberMas": {"es": "Toque para saber más", "en": "Tap to learn more", "fr": "Touchez pour en savoir plus", "de": "Tippen für mehr", "it": "Tocca per saperne di più", "nl": "Tik voor meer", "zh": "点击了解更多", "zht": "點擊了解更多", "bg": "Докосни за още", "pl": "Dotknij, by dowiedzieć się więcej"},
    "cieloSensores": {"es": "Sensores", "en": "Sensors", "fr": "Capteurs", "de": "Sensoren", "it": "Sensori", "nl": "Sensoren", "zh": "传感器", "zht": "感測器", "bg": "Сензори", "pl": "Czujniki"},
    "cieloAMano": {"es": "A mano", "en": "By hand", "fr": "À la main", "de": "Von Hand", "it": "A mano", "nl": "Met de hand", "zh": "手动", "zht": "手動", "bg": "Ръчно", "pl": "Ręcznie"},
    "cieloSensoresEspera": {"es": "Todavía no llega nada de los sensores. Mueva un poco el móvil.", "en": "Nothing from the sensors yet. Move the phone a little.", "fr": "Rien des capteurs pour l’instant. Bougez un peu le téléphone.", "de": "Noch nichts von den Sensoren. Beweg das Handy ein wenig.", "it": "Dai sensori non arriva ancora nulla. Muovi un po’ il telefono.", "nl": "Nog niets van de sensoren. Beweeg de telefoon even.", "zh": "还没有收到传感器数据。稍微动一下手机。", "zht": "還沒有收到感測器資料。稍微動一下手機。", "bg": "Още няма данни от сензорите. Размърдай малко телефона.", "pl": "Czujniki jeszcze nic nie podają. Porusz trochę telefonem."},
    "cieloSensoresNo": {"es": "Este dispositivo no da su orientación, así que el cielo se mueve con el dedo: arrastre para girar y pellizque para acercar.", "en": "This device doesn’t report its orientation, so the sky moves with your finger: drag to turn, pinch to zoom.", "fr": "Cet appareil ne donne pas son orientation : le ciel se déplace au doigt. Glissez pour tourner, pincez pour zoomer.", "de": "Dieses Gerät meldet seine Ausrichtung nicht, der Himmel folgt also dem Finger: Ziehen zum Drehen, Zusammenziehen zum Zoomen.", "it": "Questo dispositivo non dà il suo orientamento, quindi il cielo si muove col dito: trascina per ruotare, pizzica per ingrandire.", "nl": "Dit apparaat geeft zijn stand niet door, dus de hemel beweegt met je vinger: sleep om te draaien, knijp om te zoomen.", "zh": "此设备不提供方向数据，请用手指移动星空：拖动旋转，双指缩放。", "zht": "此裝置不提供方向資料，請用手指移動星空：拖曳旋轉，雙指縮放。", "bg": "Това устройство не дава ориентацията си, затова небето се движи с пръст: плъзни за завъртане, щипни за приближаване.", "pl": "To urządzenie nie podaje swojego położenia, więc niebo przesuwa się palcem: przeciągnij, by obrócić, uszczypnij, by przybliżyć."},
    "cieloSensoresPermiso": {"es": "Sin permiso para los sensores de movimiento, el cielo se mueve con el dedo. Se puede dar en los ajustes del navegador.", "en": "Without permission for the motion sensors, the sky moves with your finger. You can grant it in the browser settings.", "fr": "Sans autorisation pour les capteurs de mouvement, le ciel se déplace au doigt. Vous pouvez l’accorder dans les réglages du navigateur.", "de": "Ohne Zugriff auf die Bewegungssensoren folgt der Himmel dem Finger. Die Erlaubnis lässt sich in den Browser-Einstellungen geben.", "it": "Senza il permesso per i sensori di movimento, il cielo si muove col dito. Si può concedere nelle impostazioni del browser.", "nl": "Zonder toestemming voor de bewegingssensoren beweegt de hemel met je vinger. Je kunt die geven in de browserinstellingen.", "zh": "未获得运动传感器权限，请用手指移动星空。可在浏览器设置中授权。", "zht": "未取得動作感測器權限，請用手指移動星空。可在瀏覽器設定中授權。", "bg": "Без разрешение за сензорите за движение небето се движи с пръст. Може да го дадеш в настройките на браузъра.", "pl": "Bez zgody na czujniki ruchu niebo przesuwa się palcem. Zgodę można dać w ustawieniach przeglądarki."},
    "cieloSensoresPermisoApp": {"es": "Sin permiso para los sensores de movimiento, el cielo se mueve con el dedo.", "en": "Without permission for the motion sensors, the sky moves with your finger.", "fr": "Sans autorisation pour les capteurs de mouvement, le ciel se déplace au doigt.", "de": "Ohne Zugriff auf die Bewegungssensoren folgt der Himmel dem Finger.", "it": "Senza il permesso per i sensori di movimento, il cielo si muove col dito.", "nl": "Zonder toestemming voor de bewegingssensoren beweegt de hemel met je vinger.", "zh": "未获得运动传感器权限，请用手指移动星空。", "zht": "未取得動作感測器權限，請用手指移動星空。", "bg": "Без разрешение за сензорите за движение небето се движи с пръст.", "pl": "Bez zgody na czujniki ruchu niebo przesuwa się palcem."},
    "cieloCalibraBrujula": {"es": "La brújula del móvil no está segura de dónde está el norte: haga un ocho en el aire con el móvil, o arrastre el cielo hasta que cuadre.", "en": "The phone’s compass isn’t sure where north is: wave the phone in a figure of eight, or drag the sky until it lines up.", "fr": "La boussole du téléphone n’est pas sûre du nord : dessinez un huit en l’air avec le téléphone, ou glissez le ciel jusqu’à ce qu’il coïncide.", "de": "Der Kompass des Handys ist sich beim Norden nicht sicher: Zeichne mit dem Handy eine Acht in die Luft, oder zieh den Himmel zurecht.", "it": "La bussola del telefono non è sicura di dove sia il nord: disegna un otto in aria col telefono, o trascina il cielo finché combacia.", "nl": "Het kompas van de telefoon weet niet zeker waar het noorden is: maak een acht in de lucht met de telefoon, of sleep de hemel tot hij klopt.", "zh": "手机指南针不确定北方在哪：拿着手机在空中画个 8 字，或拖动星空直到对准。", "zht": "手機指南針不確定北方在哪：拿著手機在空中畫個 8 字，或拖曳星空直到對準。", "bg": "Компасът на телефона не е сигурен къде е север: начертай осмица във въздуха с телефона или плъзни небето, докато съвпадне.", "pl": "Kompas telefonu nie jest pewien, gdzie jest północ: zakreśl telefonem ósemkę w powietrzu albo przeciągnij niebo, aż się zgra."},
    "cieloAjusteQuitar": {"es": "Quitar el ajuste a mano", "en": "Remove the manual adjustment", "fr": "Retirer le réglage manuel", "de": "Manuelle Anpassung entfernen", "it": "Togliere la regolazione manuale", "nl": "Handmatige aanpassing weghalen", "zh": "取消手动调整", "zht": "取消手動調整", "bg": "Премахни ръчната настройка", "pl": "Usuń ręczną korektę"},
    "cieloCamara": {"es": "Cámara", "en": "Camera", "fr": "Caméra", "de": "Kamera", "it": "Fotocamera", "nl": "Camera", "zh": "相机", "zht": "相機", "bg": "Камера", "pl": "Kamera"},
    "cieloCamaraAyuda": {"es": "Las estrellas se pintan sobre la imagen. Si no caen encima de las de verdad, pellizque hasta que encajen: se recuerda en este móvil. Nada de la cámara se guarda ni sale del móvil.", "en": "The stars are drawn over the picture. If they don’t land on the real ones, pinch until they fit: this phone remembers it. Nothing from the camera is stored or leaves the phone.", "fr": "Les étoiles sont dessinées sur l’image. Si elles ne tombent pas sur les vraies, pincez jusqu’à ce qu’elles coïncident : ce téléphone s’en souvient. Rien de la caméra n’est enregistré ni ne quitte le téléphone.", "de": "Die Sterne werden über das Bild gezeichnet. Liegen sie nicht auf den echten, zieh mit zwei Fingern, bis sie passen: Dieses Handy merkt es sich. Nichts von der Kamera wird gespeichert oder verlässt das Handy.", "it": "Le stelle sono disegnate sopra l’immagine. Se non cadono su quelle vere, pizzica finché combaciano: questo telefono lo ricorda. Nulla della fotocamera viene salvato né esce dal telefono.", "nl": "De sterren worden over het beeld getekend. Vallen ze niet op de echte, knijp dan tot ze passen: deze telefoon onthoudt het. Niets van de camera wordt opgeslagen of verlaat de telefoon.", "zh": "星星会叠加在画面上。如果没有对准真实的星星，用双指缩放直到重合：本机会记住。相机画面不会保存，也不会离开手机。", "zht": "星星會疊加在畫面上。如果沒有對準真實的星星，用雙指縮放直到重合：本機會記住。相機畫面不會儲存，也不會離開手機。", "bg": "Звездите се рисуват върху картината. Ако не попадат върху истинските, щипни, докато съвпаднат: този телефон го запомня. Нищо от камерата не се записва и не напуска телефона.", "pl": "Gwiazdy są rysowane na obrazie. Jeśli nie pokrywają się z prawdziwymi, uszczypnij, aż się zgrają: ten telefon to zapamięta. Nic z kamery nie jest zapisywane ani nie opuszcza telefonu."},
    "cieloCamaraSinSensores": {"es": "Sin sensores de orientación la cámara no puede seguir al cielo: la imagen sale, pero el cielo se mueve con el dedo.", "en": "Without orientation sensors the camera can’t follow the sky: the picture shows, but the sky moves with your finger.", "fr": "Sans capteurs d’orientation, la caméra ne peut pas suivre le ciel : l’image s’affiche, mais le ciel se déplace au doigt.", "de": "Ohne Lagesensoren kann die Kamera dem Himmel nicht folgen: Das Bild ist da, aber der Himmel folgt dem Finger.", "it": "Senza sensori di orientamento la fotocamera non può seguire il cielo: l’immagine c’è, ma il cielo si muove col dito.", "nl": "Zonder standsensoren kan de camera de hemel niet volgen: het beeld is er, maar de hemel beweegt met je vinger.", "zh": "没有方向传感器，相机无法跟随星空：画面会显示，但星空要用手指移动。", "zht": "沒有方向感測器，相機無法跟隨星空：畫面會顯示，但星空要用手指移動。", "bg": "Без сензори за ориентация камерата не може да следва небето: картината се вижда, но небето се движи с пръст.", "pl": "Bez czujników położenia kamera nie nadąży za niebem: obraz jest, ale niebo przesuwa się palcem."},
    "cieloCamaraPermiso": {"es": "Sin permiso para la cámara. Se puede dar en los ajustes del navegador; el cielo funciona igual sin ella.", "en": "No permission for the camera. You can grant it in the browser settings; the sky works just the same without it.", "fr": "Pas d’autorisation pour la caméra. Vous pouvez l’accorder dans les réglages du navigateur ; le ciel fonctionne aussi bien sans.", "de": "Kein Zugriff auf die Kamera. Die Erlaubnis lässt sich in den Browser-Einstellungen geben; der Himmel geht auch ohne.", "it": "Nessun permesso per la fotocamera. Si può concedere nelle impostazioni del browser; il cielo funziona lo stesso senza.", "nl": "Geen toestemming voor de camera. Je kunt die geven in de browserinstellingen; de hemel werkt ook zonder.", "zh": "未获得相机权限。可在浏览器设置中授权；没有相机，星空同样可用。", "zht": "未取得相機權限。可在瀏覽器設定中授權；沒有相機，星空同樣可用。", "bg": "Няма разрешение за камерата. Може да го дадеш в настройките на браузъра; небето работи и без нея.", "pl": "Brak zgody na kamerę. Zgodę można dać w ustawieniach przeglądarki; niebo działa tak samo bez niej."},
    "cieloCamaraPermisoApp": {"es": "Sin permiso para la cámara; el cielo funciona igual sin ella.", "en": "No permission for the camera; the sky works just the same without it.", "fr": "Pas d’autorisation pour la caméra ; le ciel fonctionne aussi bien sans.", "de": "Kein Zugriff auf die Kamera; der Himmel geht auch ohne.", "it": "Nessun permesso per la fotocamera; il cielo funziona lo stesso senza.", "nl": "Geen toestemming voor de camera; de hemel werkt ook zonder.", "zh": "未获得相机权限；没有相机，星空同样可用。", "zht": "未取得相機權限；沒有相機，星空同樣可用。", "bg": "Няма разрешение за камерата; небето работи и без нея.", "pl": "Brak zgody na kamerę; niebo działa tak samo bez niej."},
    "cieloCamaraNo": {"es": "Aquí no hay cámara que usar. El cielo funciona igual sin ella.", "en": "No camera to use here. The sky works just the same without it.", "fr": "Pas de caméra disponible ici. Le ciel fonctionne aussi bien sans.", "de": "Hier gibt es keine Kamera. Der Himmel geht auch ohne.", "it": "Qui non c’è una fotocamera da usare. Il cielo funziona lo stesso senza.", "nl": "Hier is geen camera te gebruiken. De hemel werkt ook zonder.", "zh": "这里没有可用的相机。没有相机，星空同样可用。", "zht": "這裡沒有可用的相機。沒有相機，星空同樣可用。", "bg": "Тук няма камера за ползване. Небето работи и без нея.", "pl": "Nie ma tu kamery do użycia. Niebo działa tak samo bez niej."},
    "cieloBuscarCielo": {"es": "Buscar un astro", "en": "Search for an object", "fr": "Chercher un astre", "de": "Ein Objekt suchen", "it": "Cerca un astro", "nl": "Een object zoeken", "zh": "搜索天体", "zht": "搜尋天體", "bg": "Търси обект", "pl": "Szukaj obiektu"},
    "cieloBuscarQue": {"es": "¿Qué quiere encontrar? Júpiter, Vega, Orión, M31…", "en": "What do you want to find? Jupiter, Vega, Orion, M31…", "fr": "Que voulez-vous trouver ? Jupiter, Véga, Orion, M31…", "de": "Was möchtest du finden? Jupiter, Wega, Orion, M31…", "it": "Cosa vuoi trovare? Giove, Vega, Orione, M31…", "nl": "Wat wil je vinden? Jupiter, Vega, Orion, M31…", "zh": "想找什么？木星、织女星、猎户座、M31……", "zht": "想找什麼？木星、織女星、獵戶座、M31……", "bg": "Какво искаш да намериш? Юпитер, Вега, Орион, M31…", "pl": "Co chcesz znaleźć? Jowisz, Wega, Orion, M31…"},
    "cieloGuiame": {"es": "Llévame hasta él", "en": "Guide me to it", "fr": "Guidez-moi jusqu’à lui", "de": "Führe mich hin", "it": "Portami da lui", "nl": "Breng me erheen", "zh": "带我找到它", "zht": "帶我找到它", "bg": "Заведи ме до него", "pl": "Zaprowadź mnie do niego"},
    "cieloEncuentralo": {"es": "Encuéntrelo en el cielo", "en": "Find it in the sky", "fr": "Trouvez-le dans le ciel", "de": "Finde es am Himmel", "it": "Trovalo nel cielo", "nl": "Vind het aan de hemel", "zh": "在星空中找到它", "zht": "在星空中找到它", "bg": "Намери го в небето", "pl": "Znajdź go na niebie"},
    "cieloAGrados": {"es": "a {g}°: siga la flecha", "en": "{g}° away: follow the arrow", "fr": "à {g}° : suivez la flèche", "de": "{g}° entfernt: dem Pfeil folgen", "it": "a {g}°: segui la freccia", "nl": "op {g}°: volg de pijl", "zh": "相距{g}°：跟着箭头", "zht": "相距{g}°：跟著箭頭", "bg": "на {g}°: следвай стрелката", "pl": "{g}° stąd: idź za strzałką"},
    "cieloAhiEsta": {"es": "¡Ahí está!", "en": "There it is!", "fr": "Le voilà !", "de": "Da ist es!", "it": "Eccolo!", "nl": "Daar is het!", "zh": "就是它！", "zht": "就是它！", "bg": "Ето го!", "pl": "Oto on!"},
    "cieloObjetivoBajo": {"es": "{c} está ahora bajo el horizonte: la flecha señala hacia donde está, aunque no se pueda ver.", "en": "{c} is below the horizon right now: the arrow points to where it is, even though it can’t be seen.", "fr": "{c} est sous l’horizon en ce moment : la flèche indique où il se trouve, même s’il ne se voit pas.", "de": "{c} ist gerade unter dem Horizont: Der Pfeil zeigt dorthin, wo es steht, auch wenn man es nicht sieht.", "it": "{c} ora è sotto l’orizzonte: la freccia indica dov’è, anche se non si vede.", "nl": "{c} staat nu onder de horizon: de pijl wijst naar waar het is, ook al is het niet te zien.", "zh": "{c}现在位于地平线以下：箭头指向它所在的方向，只是看不见。", "zht": "{c}現在位於地平線以下：箭頭指向它所在的方向，只是看不見。", "bg": "{c} сега е под хоризонта: стрелката сочи накъде е, макар да не се вижда.", "pl": "{c} jest teraz pod horyzontem: strzałka wskazuje, gdzie jest, choć go nie widać."},
    /* ── la ficha ────────────────────────────────────────────────────────── */
    "cieloAhoraMismo": {"es": "Ahora mismo", "en": "Right now", "fr": "En ce moment", "de": "Jetzt gerade", "it": "In questo momento", "nl": "Op dit moment", "zh": "此刻", "zht": "此刻", "bg": "В момента", "pl": "W tej chwili"},
    "cieloFichaArriba": {"es": "{t}: a {alt}° de altura, {dir}", "en": "{t}: {alt}° high, {dir}", "fr": "{t} : à {alt}° de hauteur, {dir}", "de": "{t}: {alt}° hoch, {dir}", "it": "{t}: a {alt}° di altezza, {dir}", "nl": "{t}: {alt}° hoog, {dir}", "zh": "{t}：高度{alt}°，{dir}", "zht": "{t}：高度{alt}°，{dir}", "bg": "{t}: на {alt}° височина, {dir}", "pl": "{t}: {alt}° nad horyzontem, {dir}"},
    "cieloFichaAbajo": {"es": "{t}: bajo el horizonte", "en": "{t}: below the horizon", "fr": "{t} : sous l’horizon", "de": "{t}: unter dem Horizont", "it": "{t}: sotto l’orizzonte", "nl": "{t}: onder de horizon", "zh": "{t}：在地平线以下", "zht": "{t}：在地平線以下", "bg": "{t}: под хоризонта", "pl": "{t}: pod horyzontem"},
    "cieloFichaEstaNoche": {"es": "Esta noche", "en": "Tonight", "fr": "Cette nuit", "de": "Heute Nacht", "it": "Stanotte", "nl": "Vannacht", "zh": "今晚", "zht": "今晚", "bg": "Тази нощ", "pl": "Dziś w nocy"},
    "cieloFichaSale": {"es": "sale a las {h} por el {r}", "en": "rises at {h} in the {r}", "fr": "se lève à {h} au {r}", "de": "geht um {h} im {r} auf", "it": "sorge alle {h} a {r}", "nl": "komt op om {h} in het {r}", "zh": "{h}从{r}方升起", "zht": "{h}從{r}方升起", "bg": "изгрява в {h} на {r}", "pl": "wschodzi o {h} na {r}"},
    "cieloFichaCulmina": {"es": "lo más alto a las {h} ({alt}°)", "en": "highest at {h} ({alt}°)", "fr": "au plus haut à {h} ({alt}°)", "de": "am höchsten um {h} ({alt}°)", "it": "al massimo alle {h} ({alt}°)", "nl": "het hoogst om {h} ({alt}°)", "zh": "{h}到达最高点（{alt}°）", "zht": "{h}到達最高點（{alt}°）", "bg": "най-високо в {h} ({alt}°)", "pl": "najwyżej o {h} ({alt}°)"},
    "cieloFichaPone": {"es": "se pone a las {h} por el {r}", "en": "sets at {h} in the {r}", "fr": "se couche à {h} au {r}", "de": "geht um {h} im {r} unter", "it": "tramonta alle {h} a {r}", "nl": "gaat onder om {h} in het {r}", "zh": "{h}从{r}方落下", "zht": "{h}從{r}方落下", "bg": "залязва в {h} на {r}", "pl": "zachodzi o {h} na {r}"},
    "cieloFichaNuncaSePone": {"es": "nunca se pone desde Tenerife: da vueltas alrededor de la Polar", "en": "never sets from Tenerife: it circles the Pole Star", "fr": "ne se couche jamais depuis Tenerife : il tourne autour de la Polaire", "de": "geht von Teneriffa aus nie unter: er kreist um den Polarstern", "it": "non tramonta mai da Tenerife: gira intorno alla Polare", "nl": "gaat vanaf Tenerife nooit onder: hij draait rond de Poolster", "zh": "在特内里费永不落下：绕着北极星转", "zht": "在特內里費永不落下：繞著北極星轉", "bg": "никога не залязва от Тенерифе: обикаля около Полярната звезда", "pl": "nigdy nie zachodzi z Teneryfy: krąży wokół Gwiazdy Polarnej"},
    "cieloFichaNoSale": {"es": "no sale sobre el horizonte esta noche", "en": "doesn’t rise above the horizon tonight", "fr": "ne se lève pas au-dessus de l’horizon cette nuit", "de": "kommt heute Nacht nicht über den Horizont", "it": "non sorge sopra l’orizzonte stanotte", "nl": "komt vannacht niet boven de horizon", "zh": "今晚不会升到地平线以上", "zht": "今晚不會升到地平線以上", "bg": "тази нощ не се издига над хоризонта", "pl": "dziś w nocy nie wschodzi nad horyzont"},
    "cieloFichaClase": {"es": "Clase: {c}", "en": "Class: {c}", "fr": "Classe : {c}", "de": "Klasse: {c}", "it": "Classe: {c}", "nl": "Klasse: {c}", "zh": "类型：{c}", "zht": "類型：{c}", "bg": "Клас: {c}", "pl": "Klasa: {c}"},
    "cieloLumI": {"es": "supergigante", "en": "supergiant", "fr": "supergéante", "de": "Überriese", "it": "supergigante", "nl": "superreus", "zh": "超巨星", "zht": "超巨星", "bg": "свръхгигант", "pl": "nadolbrzym"},
    "cieloLumII": {"es": "gigante luminosa", "en": "bright giant", "fr": "géante lumineuse", "de": "heller Riese", "it": "gigante brillante", "nl": "heldere reus", "zh": "亮巨星", "zht": "亮巨星", "bg": "ярък гигант", "pl": "jasny olbrzym"},
    "cieloLumIII": {"es": "gigante", "en": "giant", "fr": "géante", "de": "Riese", "it": "gigante", "nl": "reus", "zh": "巨星", "zht": "巨星", "bg": "гигант", "pl": "olbrzym"},
    "cieloLumIV": {"es": "subgigante", "en": "subgiant", "fr": "sous-géante", "de": "Unterriese", "it": "subgigante", "nl": "subreus", "zh": "次巨星", "zht": "次巨星", "bg": "субгигант", "pl": "podolbrzym"},
    "cieloLumV": {"es": "enana, como el Sol (secuencia principal)", "en": "dwarf, like the Sun (main sequence)", "fr": "naine, comme le Soleil (séquence principale)", "de": "Zwerg, wie die Sonne (Hauptreihe)", "it": "nana, come il Sole (sequenza principale)", "nl": "dwerg, zoals de Zon (hoofdreeks)", "zh": "矮星，与太阳同类（主序星）", "zht": "矮星，與太陽同類（主序星）", "bg": "джудже, като Слънцето (главна последователност)", "pl": "karzeł, jak Słońce (ciąg główny)"},
    "cieloFichaColorK": {"es": "Color: {c}, con una temperatura de unos {k} K en la superficie", "en": "Colour: {c}, with a surface temperature of about {k} K", "fr": "Couleur : {c}, avec une température de surface d’environ {k} K", "de": "Farbe: {c}, mit etwa {k} K Oberflächentemperatur", "it": "Colore: {c}, con una temperatura superficiale di circa {k} K", "nl": "Kleur: {c}, met een oppervlaktetemperatuur van ongeveer {k} K", "zh": "颜色：{c}，表面温度约{k} K", "zht": "顏色：{c}，表面溫度約{k} K", "bg": "Цвят: {c}, с температура на повърхността около {k} K", "pl": "Barwa: {c}, o temperaturze powierzchni około {k} K"},
    "cieloFichaColorCaliente": {"es": "Color: {c}, con más de {k} K en la superficie", "en": "Colour: {c}, with over {k} K at the surface", "fr": "Couleur : {c}, avec plus de {k} K en surface", "de": "Farbe: {c}, mit über {k} K an der Oberfläche", "it": "Colore: {c}, con oltre {k} K in superficie", "nl": "Kleur: {c}, met meer dan {k} K aan het oppervlak", "zh": "颜色：{c}，表面温度超过{k} K", "zht": "顏色：{c}，表面溫度超過{k} K", "bg": "Цвят: {c}, с над {k} K на повърхността", "pl": "Barwa: {c}, ponad {k} K na powierzchni"},
    "cieloColorO": {"es": "azul", "en": "blue", "fr": "bleue", "de": "blau", "it": "blu", "nl": "blauw", "zh": "蓝色", "zht": "藍色", "bg": "синя", "pl": "niebieska"},
    "cieloColorB": {"es": "blanco azulado", "en": "blue-white", "fr": "blanc bleuté", "de": "blauweiß", "it": "bianco-azzurro", "nl": "blauwwit", "zh": "蓝白色", "zht": "藍白色", "bg": "синьо-бяла", "pl": "niebieskobiała"},
    "cieloColorA": {"es": "blanco", "en": "white", "fr": "blanche", "de": "weiß", "it": "bianco", "nl": "wit", "zh": "白色", "zht": "白色", "bg": "бяла", "pl": "biała"},
    "cieloColorF": {"es": "blanco amarillento", "en": "yellow-white", "fr": "blanc jaunâtre", "de": "gelbweiß", "it": "bianco-giallo", "nl": "geelwit", "zh": "黄白色", "zht": "黃白色", "bg": "жълто-бяла", "pl": "żółtobiała"},
    "cieloColorG": {"es": "amarillo, como el Sol", "en": "yellow, like the Sun", "fr": "jaune, comme le Soleil", "de": "gelb, wie die Sonne", "it": "giallo, come il Sole", "nl": "geel, zoals de Zon", "zh": "黄色，和太阳一样", "zht": "黃色，和太陽一樣", "bg": "жълта, като Слънцето", "pl": "żółta, jak Słońce"},
    "cieloColorK": {"es": "naranja claro", "en": "light orange", "fr": "orange clair", "de": "hellorange", "it": "arancione chiaro", "nl": "lichtoranje", "zh": "浅橙色", "zht": "淺橙色", "bg": "светлооранжева", "pl": "jasnopomarańczowa"},
    "cieloColorM": {"es": "rojo anaranjado", "en": "orange-red", "fr": "rouge orangé", "de": "orangerot", "it": "rosso-arancio", "nl": "oranjerood", "zh": "橙红色", "zht": "橙紅色", "bg": "оранжево-червена", "pl": "pomarańczowoczerwona"},
    "cieloFichaLuzAnio": {"es": "Está a {n} años luz: la luz que ve salió de ella en {y}", "en": "It is {n} light-years away: the light you see left it in {y}", "fr": "Elle est à {n} années-lumière : la lumière que vous voyez l’a quittée en {y}", "de": "Er ist {n} Lichtjahre entfernt: Das Licht, das Sie sehen, verließ ihn {y}", "it": "È a {n} anni luce: la luce che vede è partita da lei nel {y}", "nl": "Hij staat op {n} lichtjaar: het licht dat u ziet, vertrok er in {y}", "zh": "距离{n}光年：您看到的光是{y}年从它出发的", "zht": "距離{n}光年：您看到的光是{y}年從它出發的", "bg": "На {n} светлинни години е: светлината, която виждате, е тръгнала от нея през {y} г.", "pl": "Odległość w latach świetlnych: {n}; światło, które teraz widać, opuściło ją w {y} roku"},
    "cieloFichaLuzUnos": {"es": "Está a unos {n} años luz: la luz que ve salió de ella hace unos {n} años", "en": "It is about {n} light-years away: the light you see left it about {n} years ago", "fr": "Elle est à environ {n} années-lumière : la lumière que vous voyez l’a quittée il y a environ {n} ans", "de": "Er ist etwa {n} Lichtjahre entfernt: Das Licht, das Sie sehen, ist vor etwa {n} Jahren aufgebrochen", "it": "È a circa {n} anni luce: la luce che vede è partita da lei circa {n} anni fa", "nl": "Hij staat op ongeveer {n} lichtjaar: het licht dat u ziet, vertrok er zo’n {n} jaar geleden", "zh": "距离约{n}光年：您看到的光是大约{n}年前从它出发的", "zht": "距離約{n}光年：您看到的光是大約{n}年前從它出發的", "bg": "На около {n} светлинни години е: светлината, която виждате, е тръгнала от нея преди около {n} години", "pl": "Odległość w latach świetlnych: około {n}; światło, które teraz widać, opuściło ją jakieś {n} lat temu"},
    "cieloFichaLum": {"es": "Brilla como unos {n} soles (en luz visible)", "en": "Shines like about {n} Suns (in visible light)", "fr": "Brille comme environ {n} Soleils (en lumière visible)", "de": "Leuchtet wie etwa {n} Sonnen (im sichtbaren Licht)", "it": "Brilla come circa {n} Soli (in luce visibile)", "nl": "Schijnt als ongeveer {n} Zonnen (in zichtbaar licht)", "zh": "亮度约相当于{n}个太阳（可见光）", "zht": "亮度約相當於{n}個太陽（可見光）", "bg": "Свети като около {n} слънца (във видима светлина)", "pl": "Jasność w świetle widzialnym, w jednostkach jasności Słońca: około {n}"},
    "cieloFichaLumSol": {"es": "Brilla más o menos como el Sol", "en": "Shines roughly like the Sun", "fr": "Brille à peu près comme le Soleil", "de": "Leuchtet etwa wie die Sonne", "it": "Brilla più o meno come il Sole", "nl": "Schijnt ongeveer als de Zon", "zh": "亮度与太阳相当", "zht": "亮度與太陽相當", "bg": "Свети горе-долу като Слънцето", "pl": "Świeci mniej więcej jak Słońce"},
    "cieloFichaLumMenos": {"es": "Brilla como un {p} % del Sol", "en": "Shines like {p}% of the Sun", "fr": "Brille comme {p} % du Soleil", "de": "Leuchtet wie {p} % der Sonne", "it": "Brilla come il {p} % del Sole", "nl": "Schijnt als {p}% van de Zon", "zh": "亮度约为太阳的{p}%", "zht": "亮度約為太陽的{p}%", "bg": "Свети като {p} % от Слънцето", "pl": "Świeci jak {p}% Słońca"},
    "cieloFichaMasBrillante": {"es": "Es la estrella más brillante de {c}", "en": "It is the brightest star in {c}", "fr": "C’est l’étoile la plus brillante de sa constellation, {c}", "de": "Er ist der hellste Stern im Sternbild {c}", "it": "È la stella più brillante di {c}", "nl": "Het is de helderste ster van {c}", "zh": "它是{c}中最亮的星", "zht": "它是{c}中最亮的星", "bg": "Най-ярката звезда в {c}", "pl": "To najjaśniejsza gwiazda w gwiazdozbiorze {c}"},
    "cieloFichaDistSol": {"es": "A {d} millones de km: su luz tarda {t} en llegar", "en": "{d} million km away: its light takes {t} to reach us", "fr": "À {d} millions de km : sa lumière met {t} à nous parvenir", "de": "{d} Millionen km entfernt: Sein Licht braucht {t} bis zu uns", "it": "A {d} milioni di km: la sua luce impiega {t} ad arrivare", "nl": "Op {d} miljoen km: zijn licht doet er {t} over om ons te bereiken", "zh": "距离{d}百万千米：阳光需要{t}才能到达", "zht": "距離{d}百萬公里：陽光需要{t}才能到達", "bg": "На {d} милиона км: светлината му пътува {t}", "pl": "{d} mln km stąd: jego światło potrzebuje {t}, by do nas dotrzeć"},
    "cieloFichaDistLuna": {"es": "A {d} km: su luz tarda {s} segundos en llegar", "en": "{d} km away: its light takes {s} seconds to reach us", "fr": "À {d} km : sa lumière met {s} secondes à nous parvenir", "de": "{d} km entfernt: Sein Licht braucht {s} Sekunden bis zu uns", "it": "A {d} km: la sua luce impiega {s} secondi ad arrivare", "nl": "Op {d} km: haar licht doet er {s} seconden over", "zh": "距离{d}千米：月光需要{s}秒才能到达", "zht": "距離{d}公里：月光需要{s}秒才能到達", "bg": "На {d} км: светлината ѝ пътува {s} секунди", "pl": "{d} km stąd: jego światło dociera do nas w {s} sekundy"},
    "cieloFichaEdadLuna": {"es": "Edad de la Luna: {d} días desde la última luna nueva", "en": "Moon’s age: {d} days since the last new Moon", "fr": "Âge de la Lune : {d} jours depuis la dernière nouvelle lune", "de": "Mondalter: {d} Tage seit dem letzten Neumond", "it": "Età della Luna: {d} giorni dall’ultima luna nuova", "nl": "Leeftijd van de Maan: {d} dagen sinds de laatste nieuwe maan", "zh": "月龄：距上次新月{d}天", "zht": "月齡：距上次新月{d}天", "bg": "Възраст на Луната: {d} дни от последното новолуние", "pl": "Wiek Księżyca w dniach od ostatniego nowiu: {d}"},
    "cieloFichaDistPlaneta": {"es": "A {d} millones de km de la Tierra", "en": "{d} million km from Earth", "fr": "À {d} millions de km de la Terre", "de": "{d} Millionen km von der Erde entfernt", "it": "A {d} milioni di km dalla Terra", "nl": "Op {d} miljoen km van de Aarde", "zh": "距地球{d}百万千米", "zht": "距地球{d}百萬公里", "bg": "На {d} милиона км от Земята", "pl": "{d} mln km od Ziemi"},
    "cieloFichaLuzPlaneta": {"es": "Su luz tarda {t} en llegar", "en": "Its light takes {t} to reach us", "fr": "Sa lumière met {t} à nous parvenir", "de": "Sein Licht braucht {t} bis zu uns", "it": "La sua luce impiega {t} ad arrivare", "nl": "Zijn licht doet er {t} over", "zh": "它的光需要{t}才能到达", "zht": "它的光需要{t}才能到達", "bg": "Светлината му пътува {t}", "pl": "Jego światło potrzebuje {t}"},
    "cieloFichaElongManana": {"es": "A {g}° del Sol: se ve antes del amanecer", "en": "{g}° from the Sun: visible before dawn", "fr": "À {g}° du Soleil : visible avant l’aube", "de": "{g}° von der Sonne: vor der Dämmerung zu sehen", "it": "A {g}° dal Sole: si vede prima dell’alba", "nl": "Op {g}° van de Zon: te zien voor zonsopgang", "zh": "距太阳{g}°：黎明前可见", "zht": "距太陽{g}°：黎明前可見", "bg": "На {g}° от Слънцето: вижда се преди разсъмване", "pl": "{g}° od Słońca: widoczny przed świtem"},
    "cieloFichaElongTarde": {"es": "A {g}° del Sol: se ve después del atardecer", "en": "{g}° from the Sun: visible after sunset", "fr": "À {g}° du Soleil : visible après le coucher du Soleil", "de": "{g}° von der Sonne: nach Sonnenuntergang zu sehen", "it": "A {g}° dal Sole: si vede dopo il tramonto", "nl": "Op {g}° van de Zon: te zien na zonsondergang", "zh": "距太阳{g}°：日落后可见", "zht": "距太陽{g}°：日落後可見", "bg": "На {g}° от Слънцето: вижда се след залез", "pl": "{g}° od Słońca: widoczny po zachodzie"},
    "cieloFichaFase": {"es": "Fase: {p} % iluminado, como una luna pequeña", "en": "Phase: {p}% lit, like a tiny Moon", "fr": "Phase : {p} % éclairé, comme une petite lune", "de": "Phase: zu {p} % beleuchtet, wie ein kleiner Mond", "it": "Fase: illuminato al {p} %, come una piccola luna", "nl": "Fase: {p}% verlicht, als een kleine maan", "zh": "相位：{p}%被照亮，像一轮小月亮", "zht": "相位：{p}%被照亮，像一輪小月亮", "bg": "Фаза: {p} % осветен, като малка луна", "pl": "Faza: oświetlony w {p}%, jak mały księżyc"},
    "cieloFichaAnillos": {"es": "Los anillos se ven inclinados {g}°: con un telescopio pequeño ya se distinguen", "en": "The rings are tilted {g}° to us: a small telescope already shows them", "fr": "Les anneaux sont inclinés de {g}° : une petite lunette les montre déjà", "de": "Die Ringe sind {g}° zu uns geneigt: Schon ein kleines Teleskop zeigt sie", "it": "Gli anelli sono inclinati di {g}°: già un piccolo telescopio li mostra", "nl": "De ringen staan {g}° gekanteld: een kleine telescoop laat ze al zien", "zh": "光环倾角{g}°：小望远镜就能分辨", "zht": "光環傾角{g}°：小望遠鏡就能分辨", "bg": "Пръстените са наклонени на {g}°: вече с малък телескоп се различават", "pl": "Pierścienie są nachylone o {g}°: widać je już w małym teleskopie"},
    "cieloFichaLunasJ": {"es": "Sus cuatro lunas grandes ahora, como se ven con prismáticos (norte arriba, este a la izquierda)", "en": "Its four big moons right now, as seen through binoculars (north up, east left)", "fr": "Ses quatre grandes lunes en ce moment, comme aux jumelles (nord en haut, est à gauche)", "de": "Seine vier großen Monde jetzt, wie im Fernglas (Norden oben, Osten links)", "it": "Le sue quattro lune grandi adesso, come si vedono col binocolo (nord in alto, est a sinistra)", "nl": "Zijn vier grote manen nu, zoals door een verrekijker (noorden boven, oosten links)", "zh": "它的四颗大卫星此刻的位置，如双筒望远镜所见（上北左东）", "zht": "它的四顆大衛星此刻的位置，如雙筒望遠鏡所見（上北左東）", "bg": "Четирите му големи луни сега, както се виждат с бинокъл (север горе, изток вляво)", "pl": "Jego cztery duże księżyce teraz, jak przez lornetkę (północ u góry, wschód po lewej)"},
    "cieloFichaLunaDetras": {"es": "Ahora mismo no se ve: {l}, detrás del planeta", "en": "Hidden right now: {l}, behind the planet", "fr": "Invisible en ce moment : {l}, derrière la planète", "de": "Gerade nicht zu sehen: {l}, hinter dem Planeten", "it": "Ora non si vede: {l}, dietro il pianeta", "nl": "Nu niet te zien: {l}, achter de planeet", "zh": "此刻看不见：{l}，在行星后面", "zht": "此刻看不見：{l}，在行星後面", "bg": "Сега не се вижда: {l}, зад планетата", "pl": "Teraz niewidoczny: {l}, za planetą"},
    "cieloWiki": {"es": "De Wikipedia", "en": "From Wikipedia", "fr": "D’après Wikipédia", "de": "Aus Wikipedia", "it": "Da Wikipedia", "nl": "Van Wikipedia", "zh": "来自维基百科", "zht": "來自維基百科", "bg": "От Уикипедия", "pl": "Z Wikipedii"},
    "cieloWikiNo": {"es": "No hay artículo en su idioma.", "en": "No article in your language.", "fr": "Pas d’article dans votre langue.", "de": "Kein Artikel in deiner Sprache.", "it": "Non c’è una voce nella tua lingua.", "nl": "Geen artikel in jouw taal.", "zh": "没有你的语言的条目。", "zht": "沒有你的語言的條目。", "bg": "Няма статия на твоя език.", "pl": "Nie ma artykułu w twoim języku."},
    "cieloWikiLeer": {"es": "Leer el artículo entero", "en": "Read the full article", "fr": "Lire l’article entier", "de": "Ganzen Artikel lesen", "it": "Leggi la voce intera", "nl": "Lees het hele artikel", "zh": "阅读全文", "zht": "閱讀全文", "bg": "Прочети цялата статия", "pl": "Przeczytaj cały artykuł"},
    "cieloWikiLicencia": {"es": "Texto de Wikipedia, licencia CC BY-SA 4.0.", "en": "Text from Wikipedia, licensed CC BY-SA 4.0.", "fr": "Texte de Wikipédia, licence CC BY-SA 4.0.", "de": "Text aus Wikipedia, Lizenz CC BY-SA 4.0.", "it": "Testo da Wikipedia, licenza CC BY-SA 4.0.", "nl": "Tekst van Wikipedia, licentie CC BY-SA 4.0.", "zh": "文字来自维基百科，采用 CC BY-SA 4.0 许可。", "zht": "文字來自維基百科，採用 CC BY-SA 4.0 授權。", "bg": "Текст от Уикипедия, лиценз CC BY-SA 4.0.", "pl": "Tekst z Wikipedii, licencja CC BY-SA 4.0."},
    /* Lo que piden las reseñas de las apps del cielo (21-10-2026): la brujula
       guiada y comprobada, la fecha libre, el recorrido, la captura, las horas
       para fotos, el indice de la noche, las fases, los retrogrados y los avisos.
       Fuentes de lo que afirman los textos:
         · Hora dorada: el centro del Sol entre 6° sobre el horizonte y 4° por
           debajo; hora azul: entre 4° y 6° por debajo. Son las definiciones de
           PhotoPills (photopills.com/glossary/g y /b), las de uso en fotografia.
         · La brujula del movil marca el norte magnetico (API DeviceOrientation,
           W3C); la declinacion en Tenerife, del WMM2025 (NOAA), va en {d} y se
           calcula: no esta escrita. La precision ±N° es webkitCompassAccuracy
           (Apple: «desviacion en grados entre el rumbo dado y el verdadero»).
         · El ocho en el aire es lo que pide Google Maps en Android al calibrar
           la brujula (el magnetometro gira por todos los ejes); los imanes y el
           metal lo desvian.
         · Los avisos: una web sin servidor no puede notificar sola (no hay
           «Notification Triggers» en ningun navegador); el .ics con VALARM
           (RFC 5545) es lo que si avisa, desde el calendario del movil.
         · «Retrogradar»: el movimiento aparente hacia atras por la geometria de
           las orbitas (perspectiva); no tiene ningun otro efecto.
         · El indice de la noche es nuestro, y se explica en IndiceComo.
       ── la brujula: guia, comprobacion y precision ───────────────────────── */
    "cieloGuiaTitulo": {"es": "Antes de apuntar: 20 segundos", "en": "Before you point: 20 seconds", "fr": "Avant de viser : 20 secondes", "de": "Bevor du zielst: 20 Sekunden", "it": "Prima di puntare: 20 secondi", "nl": "Voor je richt: 20 seconden", "zh": "对准之前，先花20秒", "zht": "對準之前，先花20秒", "bg": "Преди да насочиш: 20 секунди", "pl": "Zanim wycelujesz: 20 sekund"},
    "cieloGuiaImanes": {"es": "Aleje el móvil de imanes y de metal: la funda con imán, el coche, una barandilla. Desvían la brújula.", "en": "Keep the phone away from magnets and metal: a magnetic case, the car, a railing. They throw the compass off.", "fr": "Éloignez le téléphone des aimants et du métal : coque magnétique, voiture, rambarde. Ils faussent la boussole.", "de": "Halte das Handy fern von Magneten und Metall: Magnethülle, Auto, Geländer. Sie lenken den Kompass ab.", "it": "Tieni il telefono lontano da magneti e metallo: la cover magnetica, l’auto, una ringhiera. Sviano la bussola.", "nl": "Houd de telefoon weg van magneten en metaal: een magnetisch hoesje, de auto, een reling. Ze brengen het kompas van de wijs.", "zh": "让手机远离磁铁和金属：磁吸手机壳、汽车、栏杆都会干扰指南针。", "zht": "讓手機遠離磁鐵和金屬：磁吸手機殼、汽車、欄杆都會干擾指南針。", "bg": "Дръж телефона далеч от магнити и метал: калъф с магнит, колата, парапет. Те отклоняват компаса.", "pl": "Trzymaj telefon z dala od magnesów i metalu: etui z magnesem, samochód, barierka. Zakłócają kompas."},
    "cieloGuiaOcho": {"es": "Mueva el móvil dibujando un ocho en el aire, dos o tres veces: así se calibra la brújula.", "en": "Wave the phone in a figure of eight, two or three times: that calibrates the compass.", "fr": "Dessinez un huit en l’air avec le téléphone, deux ou trois fois : c’est ainsi que la boussole se calibre.", "de": "Zeichne mit dem Handy zwei- oder dreimal eine Acht in die Luft: So kalibriert sich der Kompass.", "it": "Muovi il telefono disegnando un otto in aria, due o tre volte: così si calibra la bussola.", "nl": "Beweeg de telefoon twee of drie keer in een acht door de lucht: zo kalibreert het kompas.", "zh": "拿着手机在空中画两三次 8 字：指南针就是这样校准的。", "zht": "拿著手機在空中畫兩三次 8 字：指南針就是這樣校準的。", "bg": "Начертай с телефона осмица във въздуха, два-три пъти: така се калибрира компасът.", "pl": "Zakreśl telefonem w powietrzu ósemkę, dwa lub trzy razy: tak kalibruje się kompas."},
    "cieloGuiaComprueba": {"es": "Luego apunte a la Luna, a un planeta o a la estrella más brillante y toque «Comprobar la brújula»: la app la corrige con ese astro.", "en": "Then point at the Moon, a planet or the brightest star and tap “Check the compass”: the app corrects it against that object.", "fr": "Ensuite, visez la Lune, une planète ou l’étoile la plus brillante et touchez « Vérifier la boussole » : l’appli la corrige grâce à cet astre.", "de": "Dann ziele auf den Mond, einen Planeten oder den hellsten Stern und tippe auf „Kompass prüfen“: Die App korrigiert ihn an diesem Objekt.", "it": "Poi punta la Luna, un pianeta o la stella più brillante e tocca «Verifica la bussola»: l’app la corregge con quell’astro.", "nl": "Richt daarna op de maan, een planeet of de helderste ster en tik op ‘Kompas controleren’: de app corrigeert het daarmee.", "zh": "然后对准月亮、某颗行星或最亮的星，点“校验指南针”：应用会据此修正指南针。", "zht": "然後對準月亮、某顆行星或最亮的星，點「校驗指南針」：應用程式會據此修正指南針。", "bg": "После насочи към Луната, планета или най-ярката звезда и докосни „Провери компаса“: приложението го коригира по това светило.", "pl": "Potem wyceluj w Księżyc, planetę albo najjaśniejszą gwiazdę i dotknij „Sprawdź kompas”: aplikacja poprawi go według tego obiektu."},
    "cieloGuiaPorQue": {"es": "La brújula del móvil se descalibra sola y además marca el norte magnético, que en Tenerife queda {d}° al oeste del verdadero. Esa diferencia ya la corrige Tenerife Go.", "en": "The phone’s compass drifts out of calibration by itself, and it also points to magnetic north, which in Tenerife lies {d}° west of true north. Tenerife Go already corrects that difference.", "fr": "La boussole du téléphone se décalibre toute seule et indique en plus le nord magnétique, qui à Tenerife se trouve à {d}° à l’ouest du nord vrai. Cette différence, Tenerife Go la corrige déjà.", "de": "Der Kompass des Handys verliert von selbst seine Kalibrierung und zeigt außerdem zum magnetischen Norden, der auf Teneriffa {d}° westlich des wahren Nordens liegt. Diesen Unterschied korrigiert Tenerife Go bereits.", "it": "La bussola del telefono si scalibra da sola e inoltre indica il nord magnetico, che a Tenerife sta {d}° a ovest di quello vero. Questa differenza la corregge già Tenerife Go.", "nl": "Het kompas van de telefoon raakt vanzelf ontkalibreerd en wijst bovendien naar het magnetische noorden, dat op Tenerife {d}° ten westen van het ware noorden ligt. Dat verschil corrigeert Tenerife Go al.", "zh": "手机指南针会自行失准，而且指向的是磁北；在特内里费，磁北偏离真北 {d}°，这个偏差 Tenerife Go 已经自动修正。", "zht": "手機指南針會自行失準，而且指向的是磁北；在特內里費，磁北偏離真北 {d}°，這個偏差 Tenerife Go 已經自動修正。", "bg": "Компасът на телефона сам губи калибровката си и освен това сочи магнитния север, който на Тенерифе е на {d}° западно от истинския. Тази разлика Tenerife Go вече коригира.", "pl": "Kompas telefonu sam traci kalibrację, a do tego wskazuje północ magnetyczną, która na Teneryfie leży {d}° na zachód od prawdziwej. Tę różnicę Tenerife Go już poprawia."},
    "cieloGuiaEntendido": {"es": "Entendido", "en": "Got it", "fr": "Compris", "de": "Verstanden", "it": "Capito", "nl": "Begrepen", "zh": "知道了", "zht": "知道了", "bg": "Разбрах", "pl": "Rozumiem"},
    "cieloComprobar": {"es": "Comprobar la brújula", "en": "Check the compass", "fr": "Vérifier la boussole", "de": "Kompass prüfen", "it": "Verifica la bussola", "nl": "Kompas controleren", "zh": "校验指南针", "zht": "校驗指南針", "bg": "Провери компаса", "pl": "Sprawdź kompas"},
    "cieloComprobarCon": {"es": "Ponga {c} dentro del círculo y toque «Ya».", "en": "Put {c} inside the circle and tap “Done”.", "fr": "Placez {c} dans le cercle et touchez « Ça y est ».", "de": "Bring {c} in den Kreis und tippe auf „Fertig“.", "it": "Metti {c} dentro il cerchio e tocca «Fatto».", "nl": "Zet {c} in de cirkel en tik op ‘Klaar’.", "zh": "把{c}放进圆圈，然后点“好了”。", "zht": "把{c}放進圓圈，然後點「好了」。", "bg": "Постави {c} в кръга и докосни „Готово“.", "pl": "Umieść {c} w kółku i dotknij „Gotowe”."},
    "cieloComprobarYa": {"es": "Ya", "en": "Done", "fr": "Ça y est", "de": "Fertig", "it": "Fatto", "nl": "Klaar", "zh": "好了", "zht": "好了", "bg": "Готово", "pl": "Gotowe"},
    "cieloComprobarLejos": {"es": "{c} queda a {g}° del círculo: acérquelo más y vuelva a tocar «Ya».", "en": "{c} is {g}° from the circle: bring it closer and tap “Done” again.", "fr": "{c} est à {g}° du cercle : rapprochez-le et touchez à nouveau « Ça y est ».", "de": "{c} ist {g}° vom Kreis entfernt: Bring es näher heran und tippe erneut auf „Fertig“.", "it": "{c} è a {g}° dal cerchio: avvicinalo e tocca di nuovo «Fatto».", "nl": "{c} staat {g}° van de cirkel: breng het dichterbij en tik opnieuw op ‘Klaar’.", "zh": "{c}离圆圈还有 {g}°：再靠近一些，然后再点“好了”。", "zht": "{c}離圓圈還有 {g}°：再靠近一些，然後再點「好了」。", "bg": "{c} е на {g}° от кръга: приближи го и докосни „Готово“ отново.", "pl": "{c} jest {g}° od kółka: przybliż go i dotknij „Gotowe” ponownie."},
    "cieloComprobarBien": {"es": "La brújula iba bien: solo {g}° de desvío.", "en": "The compass was fine: only {g}° off.", "fr": "La boussole était bonne : seulement {g}° d’écart.", "de": "Der Kompass stimmte: nur {g}° Abweichung.", "it": "La bussola andava bene: solo {g}° di scarto.", "nl": "Het kompas zat goed: maar {g}° afwijking.", "zh": "指南针本来就准：只偏了 {g}°。", "zht": "指南針本來就準：只偏了 {g}°。", "bg": "Компасът беше точен: само {g}° отклонение.", "pl": "Kompas był dobry: tylko {g}° odchylenia."},
    "cieloComprobarHecho": {"es": "Brújula corregida: iba {g}° desviada. Si cambia de sitio, vuelva a comprobarla.", "en": "Compass corrected: it was {g}° off. If you move somewhere else, check it again.", "fr": "Boussole corrigée : elle avait {g}° d’écart. Si vous changez d’endroit, vérifiez-la à nouveau.", "de": "Kompass korrigiert: Er war um {g}° daneben. Wenn du den Standort wechselst, prüfe ihn erneut.", "it": "Bussola corretta: era sviata di {g}°. Se cambi posto, verificala di nuovo.", "nl": "Kompas gecorrigeerd: het zat er {g}° naast. Als je van plek verandert, controleer het dan opnieuw.", "zh": "指南针已修正：原来偏了 {g}°。换了地方，请再校验一次。", "zht": "指南針已修正：原來偏了 {g}°。換了地方，請再校驗一次。", "bg": "Компасът е коригиран: беше отклонен с {g}°. Ако смениш мястото, провери го отново.", "pl": "Kompas poprawiony: był odchylony o {g}°. Jeśli zmienisz miejsce, sprawdź go ponownie."},
    "cieloComprobarAltura": {"es": "En altura hay {g}° de diferencia: el móvil no está bien nivelado. Dibuje un ocho en el aire y compruebe otra vez.", "en": "There is a {g}° difference in altitude: the phone isn’t level. Wave it in a figure of eight and check again.", "fr": "Il y a {g}° d’écart en hauteur : le téléphone n’est pas bien à niveau. Dessinez un huit en l’air et vérifiez à nouveau.", "de": "In der Höhe gibt es {g}° Unterschied: Das Handy ist nicht richtig ausgerichtet. Zeichne eine Acht in die Luft und prüfe erneut.", "it": "In altezza c’è {g}° di differenza: il telefono non è ben livellato. Disegna un otto in aria e verifica di nuovo.", "nl": "In hoogte zit er {g}° verschil: de telefoon is niet goed waterpas. Maak een acht in de lucht en controleer opnieuw.", "zh": "高度上相差 {g}°：手机没有放平。在空中画个 8 字，再校验一次。", "zht": "高度上相差 {g}°：手機沒有放平。在空中畫個 8 字，再校驗一次。", "bg": "По височина има {g}° разлика: телефонът не е добре нивелиран. Начертай осмица във въздуха и провери отново.", "pl": "W wysokości jest {g}° różnicy: telefon nie jest wypoziomowany. Zakreśl ósemkę w powietrzu i sprawdź ponownie."},
    "cieloComprobarAbajo": {"es": "Ahora mismo no hay nada brillante sobre el horizonte con lo que comprobar.", "en": "Right now there is nothing bright above the horizon to check against.", "fr": "En ce moment, il n’y a rien de brillant au-dessus de l’horizon pour vérifier.", "de": "Gerade ist nichts Helles über dem Horizont, womit sich prüfen ließe.", "it": "In questo momento non c’è niente di brillante sopra l’orizzonte con cui verificare.", "nl": "Op dit moment staat er niets helders boven de horizon om mee te controleren.", "zh": "此刻地平线上没有足够明亮的天体可供校验。", "zht": "此刻地平線上沒有足夠明亮的天體可供校驗。", "bg": "В момента няма нищо ярко над хоризонта, с което да се провери.", "pl": "W tej chwili nad horyzontem nie ma nic jasnego, według czego można sprawdzić."},
    "cieloComprobada": {"es": "Brújula comprobada con un astro", "en": "Compass checked against an object", "fr": "Boussole vérifiée avec un astre", "de": "Kompass an einem Objekt geprüft", "it": "Bussola verificata con un astro", "nl": "Kompas gecontroleerd met een object", "zh": "指南针已用天体校验", "zht": "指南針已用天體校驗", "bg": "Компасът е проверен по светило", "pl": "Kompas sprawdzony według obiektu"},
    "cieloPrecision": {"es": "Precisión de la brújula: ±{g}°", "en": "Compass accuracy: ±{g}°", "fr": "Précision de la boussole : ±{g}°", "de": "Kompassgenauigkeit: ±{g}°", "it": "Precisione della bussola: ±{g}°", "nl": "Nauwkeurigheid van het kompas: ±{g}°", "zh": "指南针精度：±{g}°", "zht": "指南針精度：±{g}°", "bg": "Точност на компаса: ±{g}°", "pl": "Dokładność kompasu: ±{g}°"},
    /* ── la fecha libre ─────────────────────────────────────────────────── */
    "cieloFechaElegir": {"es": "Elegir otra fecha", "en": "Choose another date", "fr": "Choisir une autre date", "de": "Anderes Datum wählen", "it": "Scegli un’altra data", "nl": "Een andere datum kiezen", "zh": "选择其他日期", "zht": "選擇其他日期", "bg": "Избери друга дата", "pl": "Wybierz inną datę"},
    /* ── el recorrido ───────────────────────────────────────────────────── */
    "cieloRecorrido": {"es": "Ver su recorrido esta noche", "en": "Show its path tonight", "fr": "Voir sa trajectoire cette nuit", "de": "Seine Bahn heute Nacht zeigen", "it": "Mostra il suo percorso stanotte", "nl": "Zijn baan vannacht tonen", "zh": "显示它今晚的轨迹", "zht": "顯示它今晚的軌跡", "bg": "Покажи пътя му тази нощ", "pl": "Pokaż jego drogę tej nocy"},
    "cieloRecorridoQuitar": {"es": "Quitar el recorrido", "en": "Hide the path", "fr": "Masquer la trajectoire", "de": "Bahn ausblenden", "it": "Nascondi il percorso", "nl": "Baan verbergen", "zh": "隐藏轨迹", "zht": "隱藏軌跡", "bg": "Скрий пътя", "pl": "Ukryj drogę"},
    "cieloRecorridoNota": {"es": "El recorrido de {c} de salida a puesta, con la hora en cada punto.", "en": "The path of {c} from rising to setting, with the time at each point.", "fr": "{c} : la trajectoire du lever au coucher, avec l’heure à chaque point.", "de": "Die Bahn von {c} vom Aufgang bis zum Untergang, mit der Uhrzeit an jedem Punkt.", "it": "Il percorso di {c} dal sorgere al tramonto, con l’ora in ogni punto.", "nl": "De baan van {c} van opkomst tot ondergang, met de tijd bij elk punt.", "zh": "{c}从升起到落下的轨迹，每个点标有时间。", "zht": "{c}從升起到落下的軌跡，每個點標有時間。", "bg": "Пътят на {c} от изгрева до залеза, с часа във всяка точка.", "pl": "{c}: droga od wschodu do zachodu, z godziną w każdym punkcie."},
    /* ── la captura ─────────────────────────────────────────────────────── */
    "cieloCapturar": {"es": "Guardar o compartir la imagen", "en": "Save or share the picture", "fr": "Enregistrer ou partager l’image", "de": "Bild speichern oder teilen", "it": "Salva o condividi l’immagine", "nl": "Afbeelding opslaan of delen", "zh": "保存或分享图片", "zht": "儲存或分享圖片", "bg": "Запази или сподели изображението", "pl": "Zapisz lub udostępnij obraz"},
    "cieloCapturaNo": {"es": "No se pudo crear la imagen.", "en": "The picture could not be created.", "fr": "L’image n’a pas pu être créée.", "de": "Das Bild konnte nicht erstellt werden.", "it": "Non è stato possibile creare l’immagine.", "nl": "De afbeelding kon niet worden gemaakt.", "zh": "无法生成图片。", "zht": "無法產生圖片。", "bg": "Изображението не можа да се създаде.", "pl": "Nie udało się utworzyć obrazu."},
    "cieloCapturaDesde": {"es": "desde el Observatorio del Teide, {f}", "en": "from the Teide Observatory, {f}", "fr": "depuis l’observatoire du Teide, {f}", "de": "vom Teide-Observatorium, {f}", "it": "dall’Osservatorio del Teide, {f}", "nl": "vanaf de Teide-sterrenwacht, {f}", "zh": "自泰德天文台，{f}", "zht": "自泰德天文台，{f}", "bg": "от обсерваторията Тейде, {f}", "pl": "z obserwatorium Teide, {f}"},
    "cieloCapturaLista": {"es": "Imagen lista: se guarda o se comparte desde su móvil, nada pasa por ningún servidor.", "en": "Picture ready: it is saved or shared from your phone; nothing goes through any server.", "fr": "Image prête : elle s’enregistre ou se partage depuis votre téléphone, rien ne passe par un serveur.", "de": "Bild fertig: Es wird von deinem Handy aus gespeichert oder geteilt, nichts läuft über einen Server.", "it": "Immagine pronta: si salva o si condivide dal tuo telefono, niente passa da un server.", "nl": "Afbeelding klaar: opslaan of delen gaat vanaf je telefoon, er komt geen server aan te pas.", "zh": "图片已生成：直接从你的手机保存或分享，不经过任何服务器。", "zht": "圖片已產生：直接從你的手機儲存或分享，不經過任何伺服器。", "bg": "Изображението е готово: запазва се или се споделя от телефона ти, нищо не минава през сървър.", "pl": "Obraz gotowy: zapisujesz lub udostępniasz go z telefonu, nic nie przechodzi przez żaden serwer."},
    /* ── las horas para fotos ───────────────────────────────────────────── */
    "cieloParaFotos": {"es": "Para fotos", "en": "For photos", "fr": "Pour les photos", "de": "Für Fotos", "it": "Per le foto", "nl": "Voor foto’s", "zh": "摄影时段", "zht": "攝影時段", "bg": "За снимки", "pl": "Dla fotografów"},
    "cieloDoradaTarde": {"es": "Hora dorada de la tarde", "en": "Evening golden hour", "fr": "Heure dorée du soir", "de": "Goldene Stunde am Abend", "it": "Ora d’oro della sera", "nl": "Gouden uur ’s avonds", "zh": "傍晚黄金时刻", "zht": "傍晚黃金時刻", "bg": "Златен час вечер", "pl": "Złota godzina wieczorem"},
    "cieloAzulTarde": {"es": "Hora azul de la tarde", "en": "Evening blue hour", "fr": "Heure bleue du soir", "de": "Blaue Stunde am Abend", "it": "Ora blu della sera", "nl": "Blauwe uur ’s avonds", "zh": "傍晚蓝调时刻", "zht": "傍晚藍調時刻", "bg": "Син час вечер", "pl": "Niebieska godzina wieczorem"},
    "cieloAzulManana": {"es": "Hora azul de la mañana", "en": "Morning blue hour", "fr": "Heure bleue du matin", "de": "Blaue Stunde am Morgen", "it": "Ora blu del mattino", "nl": "Blauwe uur ’s ochtends", "zh": "清晨蓝调时刻", "zht": "清晨藍調時刻", "bg": "Син час сутрин", "pl": "Niebieska godzina rano"},
    "cieloDoradaManana": {"es": "Hora dorada de la mañana", "en": "Morning golden hour", "fr": "Heure dorée du matin", "de": "Goldene Stunde am Morgen", "it": "Ora d’oro del mattino", "nl": "Gouden uur ’s ochtends", "zh": "清晨黄金时刻", "zht": "清晨黃金時刻", "bg": "Златен час сутрин", "pl": "Złota godzina rano"},
    "cieloFotosNota": {"es": "Hora dorada: el Sol entre 6° sobre el horizonte y 4° por debajo; hora azul: entre 4° y 6° por debajo (definición de PhotoPills). La Vía Láctea tiene su tarjeta.", "en": "Golden hour: the Sun between 6° above the horizon and 4° below; blue hour: between 4° and 6° below (PhotoPills’ definition). The Milky Way has its own card.", "fr": "Heure dorée : le Soleil entre 6° au-dessus de l’horizon et 4° en dessous ; heure bleue : entre 4° et 6° en dessous (définition de PhotoPills). La Voie lactée a sa propre carte.", "de": "Goldene Stunde: die Sonne zwischen 6° über und 4° unter dem Horizont; blaue Stunde: zwischen 4° und 6° darunter (Definition von PhotoPills). Die Milchstraße hat ihre eigene Karte.", "it": "Ora d’oro: il Sole tra 6° sopra l’orizzonte e 4° sotto; ora blu: tra 4° e 6° sotto (definizione di PhotoPills). La Via Lattea ha la sua scheda.", "nl": "Gouden uur: de zon tussen 6° boven en 4° onder de horizon; blauwe uur: tussen 4° en 6° eronder (definitie van PhotoPills). De Melkweg heeft zijn eigen kaart.", "zh": "黄金时刻：太阳在地平线上 6° 至地平线下 4° 之间；蓝调时刻：地平线下 4° 至 6° 之间（PhotoPills 的定义）。银河见其专属卡片。", "zht": "黃金時刻：太陽在地平線上 6° 至地平線下 4° 之間；藍調時刻：地平線下 4° 至 6° 之間（PhotoPills 的定義）。銀河見其專屬卡片。", "bg": "Златен час: Слънцето между 6° над хоризонта и 4° под него; син час: между 4° и 6° под хоризонта (определение на PhotoPills). Млечният път има своя карта.", "pl": "Złota godzina: Słońce między 6° nad horyzontem a 4° pod nim; niebieska godzina: między 4° a 6° pod horyzontem (definicja PhotoPills). Droga Mleczna ma własną kartę."},
    /* ── las fases del mes ──────────────────────────────────────────────── */
    "cieloCalLuna": {"es": "Fases de la Luna", "en": "Moon phases", "fr": "Phases de la Lune", "de": "Mondphasen", "it": "Fasi lunari", "nl": "Maanfasen", "zh": "月相", "zht": "月相", "bg": "Лунни фази", "pl": "Fazy Księżyca"},
    "cieloFaseDet": {"es": "A las {h}, hora de Canarias.", "en": "At {h}, Canary Islands time.", "fr": "À {h}, heure des Canaries.", "de": "Um {h} Uhr, kanarische Zeit.", "it": "Alle {h}, ora delle Canarie.", "nl": "Om {h}, Canarische tijd.", "zh": "{h}（加那利时间）。", "zht": "{h}（加那利時間）。", "bg": "В {h}, канарско време.", "pl": "O {h}, czasu kanaryjskiego."},
    "cieloFasesNota": {"es": "La Luna nueva da las noches más oscuras, las mejores para el cielo profundo y la Vía Láctea; la llena, la mejor para mirarla a ella.", "en": "The new Moon gives the darkest nights, the best for deep sky and the Milky Way; the full Moon is the best for looking at the Moon itself.", "fr": "La nouvelle Lune donne les nuits les plus noires, les meilleures pour le ciel profond et la Voie lactée ; la pleine Lune est la meilleure pour l’observer elle-même.", "de": "Neumond bringt die dunkelsten Nächte, die besten für Deep-Sky und Milchstraße; Vollmond ist am besten, um den Mond selbst anzusehen.", "it": "La Luna nuova dà le notti più buie, le migliori per il cielo profondo e la Via Lattea; la Luna piena è la migliore per guardare lei.", "nl": "Nieuwe maan geeft de donkerste nachten, de beste voor deep-sky en de Melkweg; volle maan is het best om de maan zelf te bekijken.", "zh": "新月之夜最暗，最适合深空天体和银河；满月则最适合观赏月亮本身。", "zht": "新月之夜最暗，最適合深空天體和銀河；滿月則最適合觀賞月亮本身。", "bg": "Новолунието дава най-тъмните нощи, най-добрите за дълбокия космос и Млечния път; пълнолунието е най-доброто за гледане на самата Луна.", "pl": "Nów daje najciemniejsze noce, najlepsze dla głębokiego nieba i Drogi Mlecznej; pełnia jest najlepsza, by oglądać sam Księżyc."},
    /* ── los retrogrados ────────────────────────────────────────────────── */
    "cieloEvRetroIni": {"es": "{p} empieza a retrogradar", "en": "{p} starts moving retrograde", "fr": "{p} commence à rétrograder", "de": "{p} wird rückläufig", "it": "{p} inizia il moto retrogrado", "nl": "{p} wordt retrograde", "zh": "{p}开始逆行", "zht": "{p}開始逆行", "bg": "{p} започва ретроградно движение", "pl": "{p} zaczyna ruch wsteczny"},
    "cieloEvRetroFin": {"es": "{p} vuelve a ir hacia delante", "en": "{p} resumes direct motion", "fr": "{p} reprend sa marche directe", "de": "{p} läuft wieder rechtläufig", "it": "{p} riprende il moto diretto", "nl": "{p} gaat weer vooruit", "zh": "{p}恢复顺行", "zht": "{p}恢復順行", "bg": "{p} отново се движи напред", "pl": "{p} wraca do ruchu prostego"},
    "cieloRetroDet": {"es": "Hasta el {f} parece ir hacia atrás entre las estrellas, en {c}. No pasa nada raro: es perspectiva, un planeta adelanta al otro en su órbita.", "en": "Until {f} it seems to move backwards among the stars, in {c}. Nothing strange is happening: it is perspective, one planet overtaking the other in its orbit.", "fr": "Jusqu’au {f}, la planète semble reculer parmi les étoiles, dans {c}. Rien d’étrange : c’est un effet de perspective, une planète en dépasse une autre sur son orbite.", "de": "Bis zum {f} scheint der Planet zwischen den Sternen rückwärts zu laufen, im Sternbild {c}. Nichts Seltsames: Es ist Perspektive, ein Planet überholt den anderen auf seiner Bahn.", "it": "Fino al {f} il pianeta sembra andare all’indietro tra le stelle, in {c}. Niente di strano: è prospettiva, un pianeta sorpassa l’altro nella sua orbita.", "nl": "Tot {f} lijkt de planeet achteruit te bewegen tussen de sterren, in {c}. Niets vreemds: het is perspectief, de ene planeet haalt de andere in op zijn baan.", "zh": "到{f}为止，这颗行星看起来在{c}的群星间倒退。这并不奇怪：只是视角效应，一颗行星在轨道上超过了另一颗。", "zht": "到{f}為止，這顆行星看起來在{c}的群星間倒退。這並不奇怪：只是視角效應，一顆行星在軌道上超過了另一顆。", "bg": "До {f} планетата сякаш се движи назад сред звездите, в {c}. Нищо странно: това е перспектива, едната планета изпреварва другата по орбитата си.", "pl": "Do {f} planeta zdaje się cofać wśród gwiazd, w gwiazdozbiorze {c}. Nic dziwnego: to perspektywa, jedna planeta wyprzedza drugą na swojej orbicie."},
    "cieloRetroDetSinFin": {"es": "Parece ir hacia atrás entre las estrellas, en {c}. No pasa nada raro: es perspectiva, un planeta adelanta al otro en su órbita.", "en": "It seems to move backwards among the stars, in {c}. Nothing strange is happening: it is perspective, one planet overtaking the other in its orbit.", "fr": "La planète semble reculer parmi les étoiles, dans {c}. Rien d’étrange : c’est un effet de perspective, une planète en dépasse une autre sur son orbite.", "de": "Der Planet scheint zwischen den Sternen rückwärts zu laufen, im Sternbild {c}. Nichts Seltsames: Es ist Perspektive, ein Planet überholt den anderen auf seiner Bahn.", "it": "Il pianeta sembra andare all’indietro tra le stelle, in {c}. Niente di strano: è prospettiva, un pianeta sorpassa l’altro nella sua orbita.", "nl": "De planeet lijkt achteruit te bewegen tussen de sterren, in {c}. Niets vreemds: het is perspectief, de ene planeet haalt de andere in op zijn baan.", "zh": "这颗行星看起来在{c}的群星间倒退。这并不奇怪：只是视角效应，一颗行星在轨道上超过了另一颗。", "zht": "這顆行星看起來在{c}的群星間倒退。這並不奇怪：只是視角效應，一顆行星在軌道上超過了另一顆。", "bg": "Планетата сякаш се движи назад сред звездите, в {c}. Нищо странно: това е перспектива, едната планета изпреварва другата по орбитата си.", "pl": "Planeta zdaje się cofać wśród gwiazd, w gwiazdozbiorze {c}. Nic dziwnego: to perspektywa, jedna planeta wyprzedza drugą na swojej orbicie."},
    "cieloRetroFinDet": {"es": "Retrogradaba desde el {f}.", "en": "It had been retrograde since {f}.", "fr": "La planète rétrogradait depuis le {f}.", "de": "Der Planet war seit dem {f} rückläufig.", "it": "Il pianeta era retrogrado dal {f}.", "nl": "De planeet was retrograde sinds {f}.", "zh": "自{f}起一直逆行。", "zht": "自{f}起一直逆行。", "bg": "Планетата беше ретроградна от {f}.", "pl": "Planeta była w ruchu wstecznym od {f}."},
    "cieloRetroFinDetSinIni": {"es": "Vuelve a avanzar entre las estrellas.", "en": "It moves forward among the stars again.", "fr": "La planète avance de nouveau parmi les étoiles.", "de": "Der Planet läuft wieder vorwärts zwischen den Sternen.", "it": "Il pianeta torna ad avanzare tra le stelle.", "nl": "De planeet beweegt weer vooruit tussen de sterren.", "zh": "这颗行星重新在群星间向前移动。", "zht": "這顆行星重新在群星間向前移動。", "bg": "Планетата отново се движи напред сред звездите.", "pl": "Planeta znów porusza się do przodu wśród gwiazd."},
    /* ── el indice de la noche ──────────────────────────────────────────── */
    "cieloIndice": {"es": "Índice de la noche", "en": "Night index", "fr": "Indice de la nuit", "de": "Nachtindex", "it": "Indice della notte", "nl": "Nachtindex", "zh": "今夜观星指数", "zht": "今夜觀星指數", "bg": "Индекс на нощта", "pl": "Indeks nocy"},
    "cieloIndiceDe": {"es": "{n} de 10", "en": "{n} out of 10", "fr": "{n} sur 10", "de": "{n} von 10", "it": "{n} su 10", "nl": "{n} van 10", "zh": "{n} 分（满分 10）", "zht": "{n} 分（滿分 10）", "bg": "{n} от 10", "pl": "{n} na 10"},
    "cieloIndiceExcelente": {"es": "Excelente", "en": "Excellent", "fr": "Excellente", "de": "Ausgezeichnet", "it": "Eccellente", "nl": "Uitstekend", "zh": "极佳", "zht": "極佳", "bg": "Отлична", "pl": "Doskonała"},
    "cieloIndiceBuena": {"es": "Buena", "en": "Good", "fr": "Bonne", "de": "Gut", "it": "Buona", "nl": "Goed", "zh": "良好", "zht": "良好", "bg": "Добра", "pl": "Dobra"},
    "cieloIndiceRegular": {"es": "Regular", "en": "Fair", "fr": "Moyenne", "de": "Mäßig", "it": "Discreta", "nl": "Matig", "zh": "一般", "zht": "一般", "bg": "Средна", "pl": "Przeciętna"},
    "cieloIndiceFloja": {"es": "Floja", "en": "Poor", "fr": "Faible", "de": "Schwach", "it": "Scarsa", "nl": "Zwak", "zh": "较差", "zht": "較差", "bg": "Слаба", "pl": "Słaba"},
    "cieloIndiceMala": {"es": "Mala", "en": "Bad", "fr": "Mauvaise", "de": "Schlecht", "it": "Pessima", "nl": "Slecht", "zh": "很差", "zht": "很差", "bg": "Лоша", "pl": "Zła"},
    "cieloIndiceNoche": {"es": "Noche cerrada: {t}", "en": "Full darkness: {t}", "fr": "Nuit noire : {t}", "de": "Volle Dunkelheit: {t}", "it": "Buio completo: {t}", "nl": "Volledige duisternis: {t}", "zh": "天文黑夜：{t}", "zht": "天文黑夜：{t}", "bg": "Пълна тъмнина: {t}", "pl": "Pełna ciemność: {t}"},
    "cieloIndiceSinLuna": {"es": "Sin Luna: {t} ({p} % de la noche)", "en": "Moonless: {t} ({p} % of the night)", "fr": "Sans Lune : {t} ({p} % de la nuit)", "de": "Ohne Mond: {t} ({p} % der Nacht)", "it": "Senza Luna: {t} ({p} % della notte)", "nl": "Zonder maan: {t} ({p} % van de nacht)", "zh": "无月：{t}（占夜晚的 {p}%）", "zht": "無月：{t}（佔夜晚的 {p}%）", "bg": "Без Луна: {t} ({p} % от нощта)", "pl": "Bez Księżyca: {t} ({p} % nocy)"},
    "cieloIndiceLunaIlum": {"es": "Luna iluminada al {p} %", "en": "Moon {p} % lit", "fr": "Lune éclairée à {p} %", "de": "Mond zu {p} % beleuchtet", "it": "Luna illuminata al {p} %", "nl": "Maan {p} % verlicht", "zh": "月亮亮度 {p}%", "zht": "月亮亮度 {p}%", "bg": "Луната е осветена на {p} %", "pl": "Księżyc oświetlony w {p} %"},
    "cieloIndiceNubes": {"es": "Nubes medias y altas previstas: {p} %", "en": "Forecast mid and high cloud: {p} %", "fr": "Nuages moyens et hauts prévus : {p} %", "de": "Vorhergesagte mittlere und hohe Wolken: {p} %", "it": "Nubi medie e alte previste: {p} %", "nl": "Verwachte middelhoge en hoge bewolking: {p} %", "zh": "预报中高云量：{p}%", "zht": "預報中高雲量：{p}%", "bg": "Прогнозирани средни и високи облаци: {p} %", "pl": "Prognozowane chmury średnie i wysokie: {p} %"},
    "cieloIndiceSinNubes": {"es": "Sin previsión de nubes para esa noche: el índice no las cuenta.", "en": "No cloud forecast for that night: the index leaves them out.", "fr": "Pas de prévision de nuages pour cette nuit : l’indice n’en tient pas compte.", "de": "Keine Wolkenvorhersage für diese Nacht: Der Index lässt sie außen vor.", "it": "Nessuna previsione di nubi per quella notte: l’indice non le conta.", "nl": "Geen bewolkingsverwachting voor die nacht: de index laat ze buiten beschouwing.", "zh": "那晚没有云量预报：指数未计入云量。", "zht": "那晚沒有雲量預報：指數未計入雲量。", "bg": "Няма прогноза за облаци за тази нощ: индексът не ги брои.", "pl": "Brak prognozy chmur na tę noc: indeks ich nie uwzględnia."},
    "cieloIndiceComo": {"es": "Cómo se calcula: 10 puntos por una noche cerrada entera sin Luna. Se descuenta el tiempo con la Luna arriba, en proporción a lo iluminada que esté, y la media de nubes medias y altas previstas (Open-Meteo) lo baja en esa proporción. Nada más: ni la contaminación lumínica ni el viento.", "en": "How it is calculated: 10 points for a whole dark night without the Moon. Time with the Moon up is taken off, in proportion to how lit it is, and the forecast average of mid and high cloud (Open-Meteo) lowers it by that share. Nothing else: neither light pollution nor wind.", "fr": "Comment il est calculé : 10 points pour une nuit noire entière sans Lune. On retire le temps où la Lune est levée, en proportion de son éclairement, et la moyenne des nuages moyens et hauts prévus (Open-Meteo) le réduit d’autant. Rien d’autre : ni la pollution lumineuse ni le vent.", "de": "So wird er berechnet: 10 Punkte für eine ganze dunkle Nacht ohne Mond. Die Zeit mit Mond am Himmel wird abgezogen, im Verhältnis zu seiner Beleuchtung, und der vorhergesagte Mittelwert der mittleren und hohen Wolken (Open-Meteo) senkt ihn um diesen Anteil. Sonst nichts: weder Lichtverschmutzung noch Wind.", "it": "Come si calcola: 10 punti per una notte di buio completo senza Luna. Si sottrae il tempo con la Luna alta, in proporzione a quanto è illuminata, e la media prevista di nubi medie e alte (Open-Meteo) lo abbassa in quella proporzione. Nient’altro: né l’inquinamento luminoso né il vento.", "nl": "Zo wordt hij berekend: 10 punten voor een hele donkere nacht zonder maan. De tijd dat de maan op is gaat eraf, naar rato van hoe verlicht hij is, en het verwachte gemiddelde van middelhoge en hoge bewolking (Open-Meteo) verlaagt hem met dat aandeel. Verder niets: geen lichtvervuiling en geen wind.", "zh": "计算方法：整夜天文黑夜且无月为 10 分。月亮在天上的时间按其亮度比例扣除；预报的中高云量平均值（Open-Meteo）再按比例降低。仅此而已：不计光污染和风。", "zht": "計算方法：整夜天文黑夜且無月為 10 分。月亮在天上的時間按其亮度比例扣除；預報的中高雲量平均值（Open-Meteo）再按比例降低。僅此而已：不計光污染和風。", "bg": "Как се изчислява: 10 точки за цяла тъмна нощ без Луна. Времето с Луна на небето се изважда пропорционално на осветеността ѝ, а прогнозираните средни и високи облаци (Open-Meteo) го намаляват в същата пропорция. Нищо друго: нито светлинно замърсяване, нито вятър.", "pl": "Jak się go liczy: 10 punktów za całą ciemną noc bez Księżyca. Odejmuje się czas z Księżycem nad horyzontem, proporcjonalnie do jego oświetlenia, a prognozowana średnia chmur średnich i wysokich (Open-Meteo) obniża go w tej proporcji. Nic więcej: ani zanieczyszczenia światłem, ani wiatru."},
    "cieloCompartir": {"es": "Compartir", "en": "Share", "fr": "Partager", "de": "Teilen", "it": "Condividi", "nl": "Delen", "zh": "分享", "zht": "分享", "bg": "Сподели", "pl": "Udostępnij"},
    "cieloImagenTitulo": {"es": "Esta noche en el Teide", "en": "Tonight over Teide", "fr": "Cette nuit au Teide", "de": "Heute Nacht am Teide", "it": "Stanotte sul Teide", "nl": "Vannacht boven de Teide", "zh": "今夜的泰德星空", "zht": "今夜的泰德星空", "bg": "Тази нощ над Тейде", "pl": "Tej nocy nad Teide"},
    "cieloImagenMejor": {"es": "Qué mirar: {l}", "en": "What to look at: {l}", "fr": "À regarder : {l}", "de": "Was sich lohnt: {l}", "it": "Cosa guardare: {l}", "nl": "Wat te bekijken: {l}", "zh": "值得一看：{l}", "zht": "值得一看：{l}", "bg": "Какво да гледаш: {l}", "pl": "Na co patrzeć: {l}"},
    /* ── los avisos ─────────────────────────────────────────────────────── */
    "cieloAlCalendario": {"es": "Añadir a mi calendario", "en": "Add to my calendar", "fr": "Ajouter à mon calendrier", "de": "In meinen Kalender", "it": "Aggiungi al mio calendario", "nl": "Aan mijn agenda toevoegen", "zh": "添加到我的日历", "zht": "加入我的行事曆", "bg": "Добави в календара ми", "pl": "Dodaj do mojego kalendarza"},
    "cieloAvisoAqui": {"es": "Recordármelo en la app", "en": "Remind me in the app", "fr": "Me le rappeler dans l’appli", "de": "In der App erinnern", "it": "Ricordamelo nell’app", "nl": "Herinner me in de app", "zh": "在应用内提醒我", "zht": "在應用程式內提醒我", "bg": "Напомни ми в приложението", "pl": "Przypomnij mi w aplikacji"},
    "cieloAvisoPuesto": {"es": "Guardado. Al abrir la app los dos días de antes, lo verá arriba del todo.", "en": "Saved. When you open the app in the two days before, you will see it right at the top.", "fr": "Enregistré. En ouvrant l’appli les deux jours précédents, vous le verrez tout en haut.", "de": "Gespeichert. Wenn du die App in den zwei Tagen davor öffnest, siehst du es ganz oben.", "it": "Salvato. Aprendo l’app nei due giorni prima, lo vedrai in cima.", "nl": "Opgeslagen. Als je de app in de twee dagen ervoor opent, zie je het helemaal bovenaan.", "zh": "已保存。在前两天打开应用时，它会显示在最上方。", "zht": "已儲存。在前兩天打開應用程式時，它會顯示在最上方。", "bg": "Запазено. Когато отвориш приложението в двата дни преди това, ще го видиш най-отгоре.", "pl": "Zapisano. Gdy otworzysz aplikację w ciągu dwóch dni przed wydarzeniem, zobaczysz to na samej górze."},
    "cieloAvisoQuitar": {"es": "Quitar", "en": "Remove", "fr": "Retirer", "de": "Entfernen", "it": "Togli", "nl": "Verwijderen", "zh": "移除", "zht": "移除", "bg": "Премахни", "pl": "Usuń"},
    "cieloAvisosQuitarTodos": {"es": "Quitar todos los avisos", "en": "Remove all reminders", "fr": "Retirer tous les rappels", "de": "Alle Erinnerungen entfernen", "it": "Togli tutti gli avvisi", "nl": "Alle herinneringen verwijderen", "zh": "移除所有提醒", "zht": "移除所有提醒", "bg": "Премахни всички напомняния", "pl": "Usuń wszystkie przypomnienia"},
    "cieloMisAvisos": {"es": "Mis avisos", "en": "My reminders", "fr": "Mes rappels", "de": "Meine Erinnerungen", "it": "I miei avvisi", "nl": "Mijn herinneringen", "zh": "我的提醒", "zht": "我的提醒", "bg": "Моите напомняния", "pl": "Moje przypomnienia"},
    "cieloAvisoHoy": {"es": "¡Esta noche!", "en": "Tonight!", "fr": "Cette nuit !", "de": "Heute Nacht!", "it": "Stanotte!", "nl": "Vannacht!", "zh": "就在今晚！", "zht": "就在今晚！", "bg": "Тази нощ!", "pl": "Dziś w nocy!"},
    "cieloAvisoManana": {"es": "¡Mañana!", "en": "Tomorrow!", "fr": "Demain !", "de": "Morgen!", "it": "Domani!", "nl": "Morgen!", "zh": "就在明天！", "zht": "就在明天！", "bg": "Утре!", "pl": "Jutro!"},
    "cieloAvisosNota": {"es": "Los avisos se guardan solo en este móvil y nada le despierta: al abrir la app los dos días de antes, los verá arriba del todo. Para un aviso de verdad, «Añadir a mi calendario»: su calendario le avisará el día antes, y en los pasos de satélites, media hora antes.", "en": "Reminders are stored only on this phone and nothing wakes you up: when you open the app in the two days before, you will see them right at the top. For a real alert, “Add to my calendar”: your calendar will alert you the day before, or half an hour before for satellite passes.", "fr": "Les rappels sont gardés uniquement sur ce téléphone et rien ne vous réveille : en ouvrant l’appli les deux jours précédents, vous les verrez tout en haut. Pour une vraie alerte, « Ajouter à mon calendrier » : votre calendrier vous préviendra la veille, ou une demi-heure avant pour les passages de satellites.", "de": "Erinnerungen bleiben nur auf diesem Handy, und nichts weckt dich: Wenn du die App in den zwei Tagen davor öffnest, siehst du sie ganz oben. Für eine echte Benachrichtigung: „In meinen Kalender“, dann erinnert dich dein Kalender am Tag davor, bei Überflügen von Satelliten eine halbe Stunde vorher.", "it": "Gli avvisi restano solo su questo telefono e niente ti sveglia: aprendo l’app nei due giorni prima, li vedrai in cima. Per un avviso vero, «Aggiungi al mio calendario»: il tuo calendario ti avviserà il giorno prima, o mezz’ora prima per i passaggi dei satelliti.", "nl": "Herinneringen blijven alleen op deze telefoon en niets maakt je wakker: als je de app in de twee dagen ervoor opent, zie je ze helemaal bovenaan. Voor een echte melding: ‘Aan mijn agenda toevoegen’, dan waarschuwt je agenda je de dag ervoor, of een half uur van tevoren bij overkomsten van satellieten.", "zh": "提醒只保存在这部手机上，不会主动唤醒你：在前两天打开应用时，它们会显示在最上方。想要真正的提醒，请“添加到我的日历”：你的日历会在前一天提醒你，卫星过境则提前半小时提醒。", "zht": "提醒只儲存在這部手機上，不會主動喚醒你：在前兩天打開應用程式時，它們會顯示在最上方。想要真正的提醒，請「加入我的行事曆」：你的行事曆會在前一天提醒你，衛星過境則提前半小時提醒。", "bg": "Напомнянията се пазят само на този телефон и нищо не те събужда: когато отвориш приложението в двата дни преди това, ще ги видиш най-отгоре. За истинско напомняне – „Добави в календара ми“: календарът ти ще те предупреди ден по-рано, а при преминаванията на спътници – половин час по-рано.", "pl": "Przypomnienia są zapisywane tylko w tym telefonie i nic cię nie obudzi: gdy otworzysz aplikację w ciągu dwóch dni przed wydarzeniem, zobaczysz je na samej górze. Prawdziwe powiadomienie da „Dodaj do mojego kalendarza”: twój kalendarz przypomni ci dzień wcześniej, a przy przelotach satelitów pół godziny wcześniej."},
    "cieloIcsHora": {"es": "Hora de Canarias: {h}", "en": "Canary Islands time: {h}", "fr": "Heure des Canaries : {h}", "de": "Kanarische Zeit: {h}", "it": "Ora delle Canarie: {h}", "nl": "Canarische tijd: {h}", "zh": "加那利时间：{h}", "zht": "加那利時間：{h}", "bg": "Канарско време: {h}", "pl": "Czas kanaryjski: {h}"},
    "cieloIcsListo": {"es": "Evento listo (.ics): ábralo y su calendario lo añade, con un aviso el día antes.", "en": "Event ready (.ics): open it and your calendar adds it, with an alert the day before.", "fr": "Événement prêt (.ics) : ouvrez-le et votre calendrier l’ajoute, avec un rappel la veille.", "de": "Termin fertig (.ics): Öffne ihn, und dein Kalender trägt ihn ein, mit Erinnerung am Tag davor.", "it": "Evento pronto (.ics): aprilo e il tuo calendario lo aggiunge, con un avviso il giorno prima.", "nl": "Afspraak klaar (.ics): open hem en je agenda voegt hem toe, met een melding de dag ervoor.", "zh": "日程文件已生成（.ics）：打开它，日历就会添加，并在前一天提醒。", "zht": "行事曆檔案已產生（.ics）：打開它，行事曆就會加入，並在前一天提醒。", "bg": "Събитието е готово (.ics): отвори го и календарът ти ще го добави, с напомняне ден по-рано.", "pl": "Wydarzenie gotowe (.ics): otwórz je, a kalendarz je doda, z przypomnieniem dzień wcześniej."},
    "cieloIcsListoPaso": {"es": "Evento listo (.ics): ábralo y su calendario lo añade, con un aviso media hora antes.", "en": "Event ready (.ics): open it and your calendar adds it, with an alert half an hour before.", "fr": "Événement prêt (.ics) : ouvrez-le et votre calendrier l’ajoute, avec un rappel une demi-heure avant.", "de": "Termin fertig (.ics): Öffne ihn, und dein Kalender trägt ihn ein, mit Erinnerung eine halbe Stunde vorher.", "it": "Evento pronto (.ics): aprilo e il tuo calendario lo aggiunge, con un avviso mezz’ora prima.", "nl": "Afspraak klaar (.ics): open hem en je agenda voegt hem toe, met een melding een half uur van tevoren.", "zh": "日程文件已生成（.ics）：打开它，日历就会添加，并提前半小时提醒。", "zht": "行事曆檔案已產生（.ics）：打開它，行事曆就會加入，並提前半小時提醒。", "bg": "Събитието е готово (.ics): отвори го и календарът ти ще го добави, с напомняне половин час по-рано.", "pl": "Wydarzenie gotowe (.ics): otwórz je, a kalendarz je doda, z przypomnieniem pół godziny wcześniej."},
    "cieloIcsAviso": {"es": "Mañana: {e}", "en": "Tomorrow: {e}", "fr": "Demain : {e}", "de": "Morgen: {e}", "it": "Domani: {e}", "nl": "Morgen: {e}", "zh": "明天：{e}", "zht": "明天：{e}", "bg": "Утре: {e}", "pl": "Jutro: {e}"},
    /* La Estacion Espacial y los satelites brillantes (21-10-2026).
       Fuentes de lo que afirman los textos:
         · «El tercer objeto mas brillante del cielo»: asi describe la NASA a la
           Estacion Espacial Internacional en «Spot the Station» (preguntas
           frecuentes), y que parece un avion muy alto que no parpadea.
         · Tiangong brilla como las estrellas mas brillantes (en sus mejores
           pasos llega a magnitud negativa, como Sirio); Hubble, como una estrella
           corriente (magnitud 1 a 2 en los buenos pasos). Son ordenes de
           magnitud de las tablas de pasos de siempre; por eso se dicen con
           palabras y no con cifras.
         · La orbita del Hubble esta inclinada 28,47 grados (su TLE) y el Teide a
           28,30 de latitud: su traza llega justo hasta aqui, asi que puede pasar
           casi por el cenit.
         · Un paso «visible»: mas de 10 grados de altura, satelite al Sol, Sol a
           mas de 6 grados bajo el horizonte (regla de las tablas de pasos; la
           calcula codigo9.js).
         · Los elementos los renueva un robot cada dia de CelesTrak
           (tools/satelites_traer.py); con mas de 7 dias no se ensenan pasos. */
    "cieloSatTitulo": {"es": "La Estación Espacial y otros satélites", "en": "The Space Station and other satellites", "fr": "La Station spatiale et d’autres satellites", "de": "Die Raumstation und andere Satelliten", "it": "La Stazione spaziale e altri satelliti", "nl": "Het ruimtestation en andere satellieten", "zh": "空间站与其他卫星", "zht": "太空站與其他衛星", "bg": "Космическата станция и други спътници", "pl": "Stacja kosmiczna i inne satelity"},
    "cieloSatNombreIss": {"es": "Estación Espacial Internacional (ISS)", "en": "International Space Station (ISS)", "fr": "Station spatiale internationale (ISS)", "de": "Internationale Raumstation (ISS)", "it": "Stazione spaziale internazionale (ISS)", "nl": "Internationaal Ruimtestation (ISS)", "zh": "国际空间站（ISS）", "zht": "國際太空站（ISS）", "bg": "Международна космическа станция (ISS)", "pl": "Międzynarodowa Stacja Kosmiczna (ISS)"},
    "cieloSatNombreTiangong": {"es": "Estación espacial china Tiangong", "en": "Chinese space station Tiangong", "fr": "Station spatiale chinoise Tiangong", "de": "Chinesische Raumstation Tiangong", "it": "Stazione spaziale cinese Tiangong", "nl": "Chinees ruimtestation Tiangong", "zh": "中国空间站天宫", "zht": "中國太空站天宮", "bg": "Китайска космическа станция Тянгун", "pl": "Chińska stacja kosmiczna Tiangong"},
    "cieloSatNombreHubble": {"es": "Telescopio espacial Hubble", "en": "Hubble Space Telescope", "fr": "Télescope spatial Hubble", "de": "Hubble-Weltraumteleskop", "it": "Telescopio spaziale Hubble", "nl": "Hubble-ruimtetelescoop", "zh": "哈勃空间望远镜", "zht": "哈伯太空望遠鏡", "bg": "Космически телескоп „Хъбъл“", "pl": "Kosmiczny Teleskop Hubble’a"},
    "cieloTipoSatelite": {"es": "Satélite artificial", "en": "Artificial satellite", "fr": "Satellite artificiel", "de": "Künstlicher Satellit", "it": "Satellite artificiale", "nl": "Kunstmaan", "zh": "人造卫星", "zht": "人造衛星", "bg": "Изкуствен спътник", "pl": "Sztuczny satelita"},
    "cieloCalSatelites": {"es": "Satélites", "en": "Satellites", "fr": "Satellites", "de": "Satelliten", "it": "Satelliti", "nl": "Satellieten", "zh": "卫星", "zht": "衛星", "bg": "Спътници", "pl": "Satelity"},
    "cieloEvPaso": {"es": "{s}: paso visible", "en": "{s}: visible pass", "fr": "{s} : passage visible", "de": "{s}: sichtbarer Überflug", "it": "{s}: passaggio visibile", "nl": "{s}: zichtbare overkomst", "zh": "{s}：可见过境", "zht": "{s}：可見過境", "bg": "{s}: видимо преминаване", "pl": "{s}: widoczny przelot"},
    "cieloSatSale": {"es": "Aparece a las {h}, {r}", "en": "Appears at {h}, {r}", "fr": "Apparaît à {h}, {r}", "de": "Erscheint um {h} Uhr {r}", "it": "Appare alle {h}, {r}", "nl": "Verschijnt om {h} {r}", "zh": "{h}出现于{r}", "zht": "{h}出現於{r}", "bg": "Появява се в {h} {r}", "pl": "Pojawia się o {h} {r}"},
    "cieloSatDesdeSombra": {"es": "Sale de la sombra de la Tierra a las {h}, {r}", "en": "Leaves the Earth’s shadow at {h}, {r}", "fr": "Sort de l’ombre de la Terre à {h}, {r}", "de": "Tritt um {h} Uhr {r} aus dem Erdschatten", "it": "Esce dall’ombra della Terra alle {h}, {r}", "nl": "Komt om {h} {r} uit de aardschaduw", "zh": "{h}于{r}离开地影", "zht": "{h}於{r}離開地影", "bg": "Излиза от сянката на Земята в {h} {r}", "pl": "Wychodzi z cienia Ziemi o {h} {r}"},
    "cieloSatMax": {"es": "Más alto a las {h}: {alt}°, {r}", "en": "Highest at {h}: {alt}°, {r}", "fr": "Au plus haut à {h} : {alt}°, {r}", "de": "Am höchsten um {h} Uhr: {alt}° {r}", "it": "Più alto alle {h}: {alt}°, {r}", "nl": "Hoogst om {h}: {alt}° {r}", "zh": "{h}达到最高：{alt}°，位于{r}", "zht": "{h}達到最高：{alt}°，位於{r}", "bg": "Най-високо в {h}: {alt}° {r}", "pl": "Najwyżej o {h}: {alt}° {r}"},
    "cieloSatFin": {"es": "Se pierde a las {h}, {r}", "en": "Disappears at {h}, {r}", "fr": "Disparaît à {h}, {r}", "de": "Verschwindet um {h} Uhr {r}", "it": "Scompare alle {h}, {r}", "nl": "Verdwijnt om {h} {r}", "zh": "{h}消失于{r}", "zht": "{h}消失於{r}", "bg": "Изчезва в {h} {r}", "pl": "Znika o {h} {r}"},
    "cieloSatSombra": {"es": "Entra en la sombra de la Tierra a las {h}, {r}", "en": "Enters the Earth’s shadow at {h}, {r}", "fr": "Entre dans l’ombre de la Terre à {h}, {r}", "de": "Tritt um {h} Uhr {r} in den Erdschatten", "it": "Entra nell’ombra della Terra alle {h}, {r}", "nl": "Gaat om {h} {r} de aardschaduw in", "zh": "{h}于{r}进入地影", "zht": "{h}於{r}進入地影", "bg": "Влиза в сянката на Земята в {h} {r}", "pl": "Wchodzi w cień Ziemi o {h} {r}"},
    "cieloSatDura": {"es": "Dura {n} min", "en": "Lasts {n} min", "fr": "Dure {n} min", "de": "Dauert {n} Min.", "it": "Dura {n} min", "nl": "Duurt {n} min", "zh": "持续{n}分钟", "zht": "持續{n}分鐘", "bg": "Трае {n} мин", "pl": "Trwa {n} min"},
    "cieloSatBrilloIss": {"es": "Muy brillante: la NASA la describe como el tercer objeto más brillante del cielo. Un punto que cruza el cielo en unos minutos sin parpadear, como un avión muy alto.", "en": "Very bright: NASA describes it as the third brightest object in the sky. A point crossing the sky in a few minutes without blinking, like a very high aeroplane.", "fr": "Très brillante : la NASA la décrit comme le troisième objet le plus brillant du ciel. Un point qui traverse le ciel en quelques minutes sans clignoter, comme un avion très haut.", "de": "Sehr hell: Die NASA beschreibt sie als das dritthellste Objekt am Himmel. Ein Punkt, der in wenigen Minuten über den Himmel zieht, ohne zu blinken, wie ein sehr hohes Flugzeug.", "it": "Molto brillante: la NASA la descrive come il terzo oggetto più brillante del cielo. Un punto che attraversa il cielo in pochi minuti senza lampeggiare, come un aereo molto alto.", "nl": "Heel helder: NASA noemt het het op twee na helderste object aan de hemel. Een punt dat in een paar minuten langs de hemel trekt zonder te knipperen, als een heel hoog vliegtuig.", "zh": "非常明亮：NASA 称它是天空中第三亮的天体。一个光点在几分钟内划过天空，不闪烁，像一架飞得很高的飞机。", "zht": "非常明亮：NASA 稱它是天空中第三亮的天體。一個光點在幾分鐘內劃過天空，不閃爍，像一架飛得很高的飛機。", "bg": "Много ярка: НАСА я описва като третия най-ярък обект в небето. Точка, която прекосява небето за няколко минути, без да мига, като много висок самолет.", "pl": "Bardzo jasna: NASA opisuje ją jako trzeci najjaśniejszy obiekt na niebie. Punkt, który w kilka minut przecina niebo, nie migając, jak bardzo wysoko lecący samolot."},
    "cieloSatBrilloTiangong": {"es": "Brillante, como una de las estrellas más brillantes del cielo; más pequeña que la ISS, pero se ve bien a simple vista.", "en": "Bright, like one of the brightest stars in the sky; smaller than the ISS, but easy to see with the naked eye.", "fr": "Brillante, comme l’une des étoiles les plus brillantes du ciel ; plus petite que l’ISS, mais bien visible à l’œil nu.", "de": "Hell, wie einer der hellsten Sterne am Himmel; kleiner als die ISS, aber gut mit bloßem Auge zu sehen.", "it": "Brillante, come una delle stelle più brillanti del cielo; più piccola della ISS, ma si vede bene a occhio nudo.", "nl": "Helder, als een van de helderste sterren aan de hemel; kleiner dan het ISS, maar goed met het blote oog te zien.", "zh": "明亮，如同天空中最亮的恒星之一；比国际空间站小，但肉眼清晰可见。", "zht": "明亮，如同天空中最亮的恆星之一；比國際太空站小，但肉眼清晰可見。", "bg": "Ярка, като една от най-ярките звезди в небето; по-малка от МКС, но се вижда добре с просто око.", "pl": "Jasna, jak jedna z najjaśniejszych gwiazd na niebie; mniejsza od ISS, ale dobrze widoczna gołym okiem."},
    "cieloSatBrilloHubble": {"es": "Más débil, como una estrella corriente. Desde Tenerife puede pasar casi por el cenit: su órbita llega justo hasta esta latitud.", "en": "Fainter, like an ordinary star. From Tenerife it can pass almost overhead: its orbit reaches exactly this latitude.", "fr": "Plus faible, comme une étoile ordinaire. Depuis Tenerife, il peut passer presque au zénith : son orbite monte juste jusqu’à cette latitude.", "de": "Schwächer, wie ein gewöhnlicher Stern. Von Teneriffa aus kann es fast durch den Zenit ziehen: Seine Bahn reicht genau bis zu dieser Breite.", "it": "Più debole, come una stella comune. Da Tenerife può passare quasi allo zenit: la sua orbita arriva proprio fino a questa latitudine.", "nl": "Zwakker, als een gewone ster. Vanaf Tenerife kan hij bijna door het zenit gaan: zijn baan reikt precies tot deze breedtegraad.", "zh": "较暗，像一颗普通的恒星。从特内里费看，它几乎可以经过天顶：它的轨道恰好到达这个纬度。", "zht": "較暗，像一顆普通的恆星。從特內里費看，它幾乎可以經過天頂：它的軌道恰好到達這個緯度。", "bg": "По-слаб, като обикновена звезда. От Тенерифе може да мине почти през зенита: орбитата му стига точно до тази ширина.", "pl": "Słabszy, jak zwykła gwiazda. Z Teneryfy może przejść niemal przez zenit: jego orbita sięga dokładnie tej szerokości."},
    "cieloSatNinguno": {"es": "Esta noche no pasa ninguno visible desde el Teide.", "en": "None passes visibly over Teide tonight.", "fr": "Aucun passage visible depuis le Teide cette nuit.", "de": "Heute Nacht zieht keiner sichtbar über den Teide.", "it": "Stanotte nessuno passa visibile dal Teide.", "nl": "Vannacht komt er geen zichtbaar over de Teide.", "zh": "今晚没有从泰德可见的过境。", "zht": "今晚沒有從泰德可見的過境。", "bg": "Тази нощ няма видимо преминаване над Тейде.", "pl": "Tej nocy żaden nie przeleci widocznie nad Teide."},
    "cieloSatNingunoSemana": {"es": "Ningún paso visible desde el Teide en las próximas siete noches.", "en": "No visible pass over Teide in the next seven nights.", "fr": "Aucun passage visible depuis le Teide dans les sept prochaines nuits.", "de": "In den nächsten sieben Nächten kein sichtbarer Überflug über den Teide.", "it": "Nessun passaggio visibile dal Teide nelle prossime sette notti.", "nl": "Geen zichtbare overkomst boven de Teide in de komende zeven nachten.", "zh": "未来七个夜晚没有从泰德可见的过境。", "zht": "未來七個夜晚沒有從泰德可見的過境。", "bg": "Няма видимо преминаване над Тейде през следващите седем нощи.", "pl": "Brak widocznych przelotów nad Teide w ciągu najbliższych siedmiu nocy."},
    "cieloSatSinDatos": {"es": "Sin elementos orbitales: hace falta conexión la primera vez.", "en": "No orbital elements: a connection is needed the first time.", "fr": "Pas d’éléments orbitaux : une connexion est nécessaire la première fois.", "de": "Keine Bahnelemente: Beim ersten Mal ist eine Verbindung nötig.", "it": "Nessun elemento orbitale: la prima volta serve la connessione.", "nl": "Geen baanelementen: de eerste keer is verbinding nodig.", "zh": "没有轨道根数：首次使用需要联网。", "zht": "沒有軌道根數：首次使用需要連線。", "bg": "Няма орбитални елементи: първия път е нужна връзка.", "pl": "Brak elementów orbitalnych: za pierwszym razem potrzebne jest połączenie."},
    "cieloSatFuera": {"es": "Los pasos solo se calculan hasta 7 días desde los elementos orbitales ({f}): más allá dejan de ser fiables. Se renuevan cada día.", "en": "Passes are only calculated up to 7 days from the orbital elements ({f}): beyond that they stop being reliable. They are renewed every day.", "fr": "Les passages ne sont calculés que jusqu’à 7 jours après les éléments orbitaux ({f}) : au-delà, on ne peut plus s’y fier. Ils sont renouvelés chaque jour.", "de": "Überflüge werden nur bis 7 Tage nach den Bahnelementen ({f}) berechnet: Danach sind sie nicht mehr zuverlässig. Sie werden täglich erneuert.", "it": "I passaggi si calcolano solo fino a 7 giorni dagli elementi orbitali ({f}): oltre non sono più affidabili. Si rinnovano ogni giorno.", "nl": "Overkomsten worden maar tot 7 dagen na de baanelementen ({f}) berekend: daarna zijn ze niet meer betrouwbaar. Ze worden elke dag vernieuwd.", "zh": "过境只按轨道根数（{f}）后 7 天内计算：再往后就不可靠了。根数每天更新。", "zht": "過境只按軌道根數（{f}）後 7 天內計算：再往後就不可靠了。根數每天更新。", "bg": "Преминаванията се изчисляват само до 7 дни от орбиталните елементи ({f}): след това вече не са надеждни. Обновяват се всеки ден.", "pl": "Przeloty liczone są tylko do 7 dni od elementów orbitalnych ({f}): dalej przestają być wiarygodne. Są odnawiane codziennie."},
    "cieloSatElementos": {"es": "Elementos orbitales del {f} (CelesTrak).", "en": "Orbital elements of {f} (CelesTrak).", "fr": "Éléments orbitaux du {f} (CelesTrak).", "de": "Bahnelemente vom {f} (CelesTrak).", "it": "Elementi orbitali del {f} (CelesTrak).", "nl": "Baanelementen van {f} (CelesTrak).", "zh": "轨道根数：{f}（CelesTrak）。", "zht": "軌道根數：{f}（CelesTrak）。", "bg": "Орбитални елементи от {f} (CelesTrak).", "pl": "Elementy orbitalne z {f} (CelesTrak)."},
    "cieloSatNota": {"es": "Pasos de más de 10° sobre el horizonte, con el satélite iluminado por el Sol y el cielo ya oscuro (Sol a más de 6° bajo el horizonte), calculados en el móvil con SGP4 a partir de los elementos que un robot renueva cada día; los horarios pueden moverse unos segundos. Starlink no está: son trenes de días.", "en": "Passes higher than 10° above the horizon, with the satellite lit by the Sun and the sky already dark (Sun more than 6° below the horizon), calculated on the phone with SGP4 from elements a robot renews every day; times may shift by a few seconds. Starlink is not included: those are trains that last days.", "fr": "Passages à plus de 10° au-dessus de l’horizon, satellite éclairé par le Soleil et ciel déjà sombre (Soleil à plus de 6° sous l’horizon), calculés sur le téléphone avec SGP4 à partir d’éléments qu’un robot renouvelle chaque jour ; les horaires peuvent bouger de quelques secondes. Starlink n’y est pas : ce sont des trains de quelques jours.", "de": "Überflüge höher als 10° über dem Horizont, Satellit von der Sonne beleuchtet und Himmel schon dunkel (Sonne mehr als 6° unter dem Horizont), auf dem Handy mit SGP4 aus Bahnelementen berechnet, die ein Roboter täglich erneuert; die Zeiten können um einige Sekunden abweichen. Starlink ist nicht dabei: Das sind Züge von wenigen Tagen.", "it": "Passaggi a più di 10° sopra l’orizzonte, con il satellite illuminato dal Sole e il cielo già buio (Sole a più di 6° sotto l’orizzonte), calcolati sul telefono con SGP4 dagli elementi che un robot rinnova ogni giorno; gli orari possono spostarsi di qualche secondo. Starlink non c’è: sono treni di pochi giorni.", "nl": "Overkomsten hoger dan 10° boven de horizon, met de satelliet door de zon beschenen en de hemel al donker (zon meer dan 6° onder de horizon), op de telefoon berekend met SGP4 uit baanelementen die een robot elke dag vernieuwt; tijden kunnen enkele seconden verschuiven. Starlink zit er niet bij: dat zijn treinen van een paar dagen.", "zh": "只计算地平高度超过 10°、卫星被太阳照亮且天空已暗（太阳位于地平线下 6° 以上）的过境，由手机用 SGP4 根据机器人每天更新的轨道根数计算；时间可能相差几秒。不含星链：那是只持续几天的卫星列车。", "zht": "只計算地平高度超過 10°、衛星被太陽照亮且天空已暗（太陽位於地平線下 6° 以上）的過境，由手機用 SGP4 根據機器人每天更新的軌道根數計算；時間可能相差幾秒。不含星鏈：那是只持續幾天的衛星列車。", "bg": "Преминавания на повече от 10° над хоризонта, със спътник, осветен от Слънцето, и вече тъмно небе (Слънце на повече от 6° под хоризонта), изчислени на телефона със SGP4 по елементи, които робот обновява всеки ден; часовете може да се разминат с няколко секунди. Starlink го няма: това са влакове за няколко дни.", "pl": "Przeloty wyżej niż 10° nad horyzontem, z satelitą oświetlonym przez Słońce i już ciemnym niebem (Słońce ponad 6° pod horyzontem), liczone w telefonie metodą SGP4 z elementów, które robot odnawia codziennie; czasy mogą przesunąć się o kilka sekund. Starlinka tu nie ma: to pociągi na kilka dni."},
    "cieloSatEnSombra": {"es": "Ahora está en la sombra de la Tierra: no se ve.", "en": "It is in the Earth’s shadow right now: not visible.", "fr": "En ce moment, il est dans l’ombre de la Terre : invisible.", "de": "Gerade ist er im Erdschatten: nicht sichtbar.", "it": "In questo momento è nell’ombra della Terra: non si vede.", "nl": "Nu zit hij in de aardschaduw: niet zichtbaar.", "zh": "此刻位于地影中：看不见。", "zht": "此刻位於地影中：看不見。", "bg": "В момента е в сянката на Земята: не се вижда.", "pl": "Teraz jest w cieniu Ziemi: niewidoczny."},
    "cieloFichaOrbita": {"es": "A {h} km de altura, a {v} km/s", "en": "{h} km up, at {v} km/s", "fr": "À {h} km d’altitude, à {v} km/s", "de": "In {h} km Höhe, mit {v} km/s", "it": "A {h} km di quota, a {v} km/s", "nl": "Op {h} km hoogte, met {v} km/s", "zh": "高度 {h} 公里，速度 {v} 公里/秒", "zht": "高度 {h} 公里，速度 {v} 公里/秒", "bg": "На {h} km височина, с {v} km/s", "pl": "Na wysokości {h} km, z prędkością {v} km/s"},
    "cieloFichaDistSat": {"es": "Ahora a {d} km de usted", "en": "Now {d} km from you", "fr": "Maintenant à {d} km de vous", "de": "Jetzt {d} km von dir entfernt", "it": "Ora a {d} km da te", "nl": "Nu op {d} km van jou", "zh": "此刻距你 {d} 公里", "zht": "此刻距你 {d} 公里", "bg": "Сега на {d} km от теб", "pl": "Teraz {d} km od ciebie"},
    "cieloFichaProximoPaso": {"es": "Próximo paso visible: {f}, aparece a las {h} y sube hasta {alt}°", "en": "Next visible pass: {f}, appears at {h} and climbs to {alt}°", "fr": "Prochain passage visible : {f}, apparaît à {h} et monte jusqu’à {alt}°", "de": "Nächster sichtbarer Überflug: {f}, erscheint um {h} Uhr und steigt bis {alt}°", "it": "Prossimo passaggio visibile: {f}, appare alle {h} e sale fino a {alt}°", "nl": "Volgende zichtbare overkomst: {f}, verschijnt om {h} en klimt tot {alt}°", "zh": "下次可见过境：{f}，{h}出现，最高 {alt}°", "zht": "下次可見過境：{f}，{h}出現，最高 {alt}°", "bg": "Следващо видимо преминаване: {f}, появява се в {h} и се издига до {alt}°", "pl": "Następny widoczny przelot: {f}, pojawia się o {h} i wznosi się do {alt}°"},
    "cieloFichaSinPaso": {"es": "Sin pasos visibles desde el Teide en las próximas siete noches.", "en": "No visible passes over Teide in the next seven nights.", "fr": "Pas de passage visible depuis le Teide dans les sept prochaines nuits.", "de": "Keine sichtbaren Überflüge über den Teide in den nächsten sieben Nächten.", "it": "Nessun passaggio visibile dal Teide nelle prossime sette notti.", "nl": "Geen zichtbare overkomsten boven de Teide in de komende zeven nachten.", "zh": "未来七个夜晚没有从泰德可见的过境。", "zht": "未來七個夜晚沒有從泰德可見的過境。", "bg": "Няма видими преминавания над Тейде през следващите седем нощи.", "pl": "Brak widocznych przelotów nad Teide w ciągu najbliższych siedmiu nocy."},
    /* la alarma del .ics de un paso: media hora antes (un paso dura minutos) */
    "cieloIcsAvisoPaso": {"es": "Dentro de media hora: {e}", "en": "In half an hour: {e}", "fr": "Dans une demi-heure : {e}", "de": "In einer halben Stunde: {e}", "it": "Tra mezz’ora: {e}", "nl": "Over een half uur: {e}", "zh": "半小时后：{e}", "zht": "半小時後：{e}", "bg": "След половин час: {e}", "pl": "Za pół godziny: {e}"},
    /* el paso que ya esta en marcha cuando el cielo se oscurece (Sol a -6), o que
       sigue arriba cuando amanece: no «aparece» ni «se pierde» a 10 grados */
    "cieloSatYaArriba": {"es": "Ya arriba al oscurecer, a las {h}: {alt}°, {r}", "en": "Already up as it gets dark, at {h}: {alt}°, {r}", "fr": "Déjà levé à la tombée de la nuit, à {h} : {alt}°, {r}", "de": "Bei Einbruch der Dunkelheit schon oben, um {h} Uhr: {alt}° {r}", "it": "Già alto quando fa buio, alle {h}: {alt}°, {r}", "nl": "Al hoog als het donker wordt, om {h}: {alt}° {r}", "zh": "{h}天黑时已在空中：{alt}°，位于{r}", "zht": "{h}天黑時已在空中：{alt}°，位於{r}", "bg": "Вече е горе, когато се стъмва, в {h}: {alt}° {r}", "pl": "Już wysoko, gdy robi się ciemno, o {h}: {alt}° {r}"},
    "cieloSatAmanece": {"es": "Se pierde en el amanecer a las {h}, {r}", "en": "Fades into the dawn at {h}, {r}", "fr": "Se perd dans l’aube à {h}, {r}", "de": "Verblasst in der Morgendämmerung um {h} Uhr {r}", "it": "Si perde nell’alba alle {h}, {r}", "nl": "Verdwijnt in de ochtendschemering om {h} {r}", "zh": "{h}于{r}没入晨光", "zht": "{h}於{r}沒入晨光", "bg": "Губи се в зората в {h} {r}", "pl": "Znika o świcie o {h} {r}"},
    /* La noche guiada, el sistema solar hoy, la luz roja completa y «sin red en el
       Teide» (21-10-2026, tercer bloque). Fuentes de lo que afirman los textos:
         · Luna: los crateres se ven mejor junto al terminador (la linea entre el
           dia y la noche), donde las sombras son largas: lo dice cualquier guia de
           observacion lunar; los «mares» son las llanuras oscuras de basalto.
         · Planetas: no centellean como las estrellas porque son discos, no puntos
           (la turbulencia promedia); Venus tiene fases (Galileo, 1610); Marte es
           anaranjado; las cuatro lunas de Jupiter se ven con prismaticos; los
           anillos de Saturno con un telescopio pequeno (a partir de 25-30 aumentos).
         · Via Lactea: la banda es el disco de la galaxia visto desde dentro; el
           centro, en Sagitario (Sgr A*, J2000 266,40 / -28,94). Veinte minutos de
           adaptacion a la oscuridad: lo que dice la propia tarjeta de la Via Lactea.
         · Lluvias: los meteoros parecen salir del radiante por perspectiva; se
           mira a un lado porque alli las trazas son mas largas (IMO, consejos de
           observacion visual).
         · Sistema solar: posiciones de Astronomy Engine (HelioVector), vistas desde
           el norte de la ecliptica; tamanos no a escala; distancias en UA (1 UA =
           149.597.870,7 km, IAU 2012) y el tiempo de su luz a c.
         · Sin red: lo que el service worker precachea (sw.js, CORE) y lo que no
           (Open-Meteo y Wikipedia, que se guarda 30 dias en el movil: codigo7.js).
       ── la noche guiada ───────────────────────────────────────────────────────── */
    "cieloGuiaNoche": {"es": "Su noche guiada", "en": "Your guided night", "fr": "Votre nuit guidée", "de": "Deine geführte Nacht", "it": "La tua notte guidata", "nl": "Jouw begeleide nacht", "zh": "今晚导览", "zht": "今晚導覽", "bg": "Твоята нощ с водач", "pl": "Twoja noc z przewodnikiem"},
    "cieloGuiaIntro": {"es": "{n} paradas para esta noche a partir de las {t}, de lo más fácil a lo más fino. Toque «Llévame»: la flecha de «Apunte al cielo» le lleva hasta cada una.", "en": "{n} stops for tonight from {t}, from the easiest to the finest. Tap “Take me there”: the arrow in “Point at the sky” leads you to each one.", "fr": "{n} étapes pour cette nuit à partir de {t}, de la plus facile à la plus fine. Touchez « Emmène-moi » : la flèche de « Pointez vers le ciel » vous mène à chacune.", "de": "{n} Stationen für heute Nacht ab {t} Uhr, von der leichtesten zur feinsten. Tippe auf „Bring mich hin“: Der Pfeil in „Auf den Himmel zeigen“ führt dich zu jeder.", "it": "{n} tappe per stanotte dalle {t}, dalla più facile alla più fine. Tocca «Portami»: la freccia di «Punta al cielo» ti porta a ciascuna.", "nl": "{n} haltes voor vannacht vanaf {t}, van de makkelijkste tot de fijnste. Tik op ‘Breng me erheen’: de pijl in ‘Richt op de hemel’ brengt je naar elke halte.", "zh": "今晚从{t}起的{n}站，由易到难。点「带我去」：「对准星空」里的箭头会带你找到每一站。", "zht": "今晚從{t}起的{n}站，由易到難。點「帶我去」：「對準星空」裡的箭頭會帶你找到每一站。", "bg": "{n} спирки за тази нощ от {t} нататък, от най-лесната до най-фината. Докосни „Заведи ме“: стрелката в „Насочи към небето“ те води до всяка.", "pl": "{n} przystanek na tę noc od {t}. Po dotknięciu „Zaprowadź mnie” strzałka w „Wyceluj w niebo” prowadzi do niego.|{n} przystanki na tę noc od {t}, od najłatwiejszego do najsubtelniejszego. Po dotknięciu „Zaprowadź mnie” strzałka w „Wyceluj w niebo” prowadzi do każdego z nich.|{n} przystanków na tę noc od {t}, od najłatwiejszego do najsubtelniejszego. Po dotknięciu „Zaprowadź mnie” strzałka w „Wyceluj w niebo” prowadzi do każdego z nich."},
    "cieloGuiaParada": {"es": "Parada {i} de {n}", "en": "Stop {i} of {n}", "fr": "Étape {i} sur {n}", "de": "Station {i} von {n}", "it": "Tappa {i} di {n}", "nl": "Halte {i} van {n}", "zh": "第{i}站，共{n}站", "zht": "第{i}站，共{n}站", "bg": "Спирка {i} от {n}", "pl": "Przystanek {i} z {n}"},
    "cieloGuiaLlevame": {"es": "Llévame", "en": "Take me there", "fr": "Emmène-moi", "de": "Bring mich hin", "it": "Portami", "nl": "Breng me erheen", "zh": "带我去", "zht": "帶我去", "bg": "Заведи ме", "pl": "Zaprowadź mnie"},
    "cieloGuiaLuna": {"es": "Con prismáticos se ven sus mares oscuros; los cráteres se marcan mejor junto a la línea que separa el día de la noche.", "en": "Binoculars show its dark seas; craters stand out best along the line between day and night.", "fr": "Aux jumelles on voit ses mers sombres ; les cratères ressortent le mieux le long de la ligne entre le jour et la nuit.", "de": "Im Fernglas sieht man die dunklen Meere; die Krater zeichnen sich am besten entlang der Linie zwischen Tag und Nacht ab.", "it": "Con il binocolo si vedono i suoi mari scuri; i crateri risaltano meglio lungo la linea tra il giorno e la notte.", "nl": "Met een verrekijker ziet u de donkere zeeën; kraters komen het best uit langs de lijn tussen dag en nacht.", "zh": "用双筒望远镜能看到暗色的月海；陨石坑在昼夜分界线附近最清楚。", "zht": "用雙筒望遠鏡能看到暗色的月海；隕石坑在晝夜分界線附近最清楚。", "bg": "С бинокъл се виждат тъмните ѝ морета; кратерите изпъкват най-добре по линията между деня и нощта.", "pl": "Przez lornetkę widać ciemne morza; kratery najlepiej widać wzdłuż linii między dniem a nocą."},
    "cieloGuiaPlanetaLuz": {"es": "Luz fija, sin el parpadeo de las estrellas.", "en": "A steady light, without the twinkle of the stars.", "fr": "Une lumière fixe, sans le scintillement des étoiles.", "de": "Ruhiges Licht, ohne das Funkeln der Sterne.", "it": "Luce fissa, senza lo scintillio delle stelle.", "nl": "Een vast licht, zonder het fonkelen van de sterren.", "zh": "光稳定，不像恒星那样闪烁。", "zht": "光穩定，不像恆星那樣閃爍。", "bg": "Равна светлина, без трептенето на звездите.", "pl": "Stałe światło, bez migotania gwiazd."},
    "cieloGuiaVenus": {"es": "Lo más brillante del cielo después de la Luna. Tiene fases, como ella.", "en": "The brightest thing in the sky after the Moon. It has phases, like the Moon.", "fr": "L’astre le plus brillant du ciel après la Lune. Elle a des phases, comme elle.", "de": "Das Hellste am Himmel nach dem Mond. Sie hat Phasen wie er.", "it": "La cosa più brillante del cielo dopo la Luna. Ha le fasi, come lei.", "nl": "Het helderste aan de hemel na de maan. Ze heeft schijngestalten, net als de maan.", "zh": "夜空中仅次于月亮的最亮天体。它像月亮一样有盈亏。", "zht": "夜空中僅次於月亮的最亮天體。它像月亮一樣有盈虧。", "bg": "Най-яркото в небето след Луната. Има фази като нея.", "pl": "Najjaśniejszy obiekt na niebie po Księżycu. Ma fazy, tak jak on."},
    "cieloGuiaMarte": {"es": "Se reconoce por su color anaranjado.", "en": "You can tell it by its orange colour.", "fr": "On le reconnaît à sa couleur orangée.", "de": "Man erkennt ihn an seiner orangen Farbe.", "it": "Si riconosce dal colore arancione.", "nl": "U herkent hem aan zijn oranje kleur.", "zh": "凭橙红色就能认出它。", "zht": "憑橙紅色就能認出它。", "bg": "Познава се по оранжевия си цвят.", "pl": "Można go rozpoznać po pomarańczowej barwie."},
    "cieloGuiaJupiter": {"es": "Con unos prismáticos bien apoyados se ven sus cuatro lunas grandes, en fila.", "en": "With steadily held binoculars you can see its four large moons, in a line.", "fr": "Avec des jumelles bien calées, on voit ses quatre grandes lunes, alignées.", "de": "Mit gut aufgestütztem Fernglas sieht man seine vier großen Monde in einer Reihe.", "it": "Con un binocolo ben appoggiato si vedono le sue quattro lune grandi, in fila.", "nl": "Met een goed gesteunde verrekijker ziet u zijn vier grote manen, op een rij.", "zh": "把双筒望远镜架稳，能看到它排成一线的四颗大卫星。", "zht": "把雙筒望遠鏡架穩，能看到它排成一線的四顆大衛星。", "bg": "С добре подпрян бинокъл се виждат четирите му големи луни, в редица.", "pl": "Przez dobrze opartą lornetkę widać jego cztery duże księżyce, w rzędzie."},
    "cieloGuiaSaturno": {"es": "Con un telescopio pequeño se ven los anillos.", "en": "A small telescope shows the rings.", "fr": "Une petite lunette montre les anneaux.", "de": "Ein kleines Teleskop zeigt die Ringe.", "it": "Un piccolo telescopio mostra gli anelli.", "nl": "Een kleine telescoop laat de ringen zien.", "zh": "用小型望远镜就能看到光环。", "zht": "用小型望遠鏡就能看到光環。", "bg": "Малък телескоп показва пръстените.", "pl": "Mały teleskop pokazuje pierścienie."},
    "cieloGuiaMercurio": {"es": "Bajo y poco tiempo: el más esquivo de los planetas.", "en": "Low and only briefly: the most elusive of the planets.", "fr": "Bas et peu de temps : la plus insaisissable des planètes.", "de": "Tief und nur kurz: der scheueste der Planeten.", "it": "Basso e per poco: il più sfuggente dei pianeti.", "nl": "Laag en maar even: de meest ongrijpbare planeet.", "zh": "低而短暂：最难捉摸的行星。", "zht": "低而短暫：最難捉摸的行星。", "bg": "Ниско и за кратко: най-неуловимата от планетите.", "pl": "Nisko i krótko: najbardziej nieuchwytna z planet."},
    "cieloGuiaObjeto": {"es": "A simple vista es una manchita de luz; con prismáticos, mucho más.", "en": "To the naked eye a small patch of light; much more with binoculars.", "fr": "À l’œil nu, une petite tache de lumière ; aux jumelles, bien plus.", "de": "Mit bloßem Auge ein kleiner Lichtfleck; im Fernglas viel mehr.", "it": "A occhio nudo una macchiolina di luce; con il binocolo, molto di più.", "nl": "Met het blote oog een lichtvlekje; met een verrekijker veel meer.", "zh": "肉眼看是一小团光斑；用双筒望远镜能看到更多。", "zht": "肉眼看是一小團光斑；用雙筒望遠鏡能看到更多。", "bg": "С просто око е петънце светлина; с бинокъл, много повече.", "pl": "Gołym okiem to plamka światła; przez lornetkę o wiele więcej."},
    "cieloGuiaVia": {"es": "La banda de luz difusa que cruza el cielo es nuestra galaxia vista desde dentro; su centro queda {dir}. Lejos de las luces y tras 20 minutos a oscuras.", "en": "The band of soft light across the sky is our galaxy seen from inside; its centre lies {dir}. Away from lights, after 20 minutes in the dark.", "fr": "La bande de lumière diffuse qui traverse le ciel est notre galaxie vue de l’intérieur ; son centre se trouve {dir}. Loin des lumières, après 20 minutes dans le noir.", "de": "Das diffuse Lichtband über den Himmel ist unsere Galaxie von innen; ihr Zentrum liegt {dir}. Fern der Lichter, nach 20 Minuten im Dunkeln.", "it": "La fascia di luce diffusa che attraversa il cielo è la nostra galassia vista da dentro; il suo centro sta {dir}. Lontano dalle luci, dopo 20 minuti al buio.", "nl": "De band van zacht licht langs de hemel is ons melkwegstelsel van binnenuit; het centrum ligt {dir}. Weg van de lichten, na 20 minuten in het donker.", "zh": "横贯天空的那条柔光带是我们从内部看到的银河，它的中心位于{dir}。远离灯光，在黑暗中待上 20 分钟。", "zht": "橫貫天空的那條柔光帶是我們從內部看到的銀河，它的中心位於{dir}。遠離燈光，在黑暗中待上 20 分鐘。", "bg": "Ивицата мека светлина през небето е нашата галактика, гледана отвътре; центърът ѝ е {dir}. Далеч от светлините, след 20 минути на тъмно.", "pl": "Pas miękkiego światła przez niebo to nasza galaktyka widziana od środka; jej centrum leży {dir}. Z dala od świateł, po 20 minutach w ciemności."},
    "cieloGuiaPaso": {"es": "{s} cruza el cielo de las {h1} ({r1}) a las {h2} ({r2}): un punto brillante que no parpadea.", "en": "{s} crosses the sky from {h1} ({r1}) to {h2} ({r2}): a bright point that does not blink.", "fr": "{s} traverse le ciel de {h1} ({r1}) à {h2} ({r2}) : un point brillant qui ne clignote pas.", "de": "{s} zieht von {h1} Uhr ({r1}) bis {h2} Uhr ({r2}) über den Himmel: ein heller Punkt, der nicht blinkt.", "it": "{s} attraversa il cielo dalle {h1} ({r1}) alle {h2} ({r2}): un punto brillante che non lampeggia.", "nl": "{s} trekt van {h1} ({r1}) tot {h2} ({r2}) langs de hemel: een helder punt dat niet knippert.", "zh": "{s}在{h1}（{r1}）到{h2}（{r2}）之间划过天空：一个不闪烁的亮点。", "zht": "{s}在{h1}（{r1}）到{h2}（{r2}）之間劃過天空：一個不閃爍的亮點。", "bg": "{s} прекосява небето от {h1} ({r1}) до {h2} ({r2}): ярка точка, която не мига.", "pl": "{s} przecina niebo od {h1} ({r1}) do {h2} ({r2}): jasny punkt, który nie miga."},
    "cieloGuiaLluvia": {"es": "Esta noche está activa la lluvia de las {n}: los meteoros parecen salir de {c}. Mire a un lado de ese punto, no justo a él, y espere: salen a rachas.", "en": "The {n} meteor shower is active tonight: the meteors seem to come from {c}. Look to one side of that point, not straight at it, and wait: they come in bursts.", "fr": "La pluie des {n} est active cette nuit : les météores semblent venir de la constellation {c}. Regardez à côté de ce point, pas droit dessus, et patientez : ils arrivent par rafales.", "de": "Heute Nacht sind die {n} aktiv: Die Meteore scheinen aus {c} zu kommen. Schauen Sie neben diesen Punkt, nicht genau darauf, und warten Sie: Die Meteore kommen in Schüben.", "it": "Stanotte è attivo lo sciame delle {n}: le meteore sembrano uscire da {c}. Guardi di lato rispetto a quel punto, non proprio lì, e aspetti: arrivano a raffiche.", "nl": "Vannacht is de zwerm van de {n} actief: de meteoren lijken uit {c} te komen. Kijk naast dat punt, niet er recht op, en wacht: ze komen in vlagen.", "zh": "今晚{n}活跃：流星看起来从{c}射出。看向辐射点旁边而不是正对它，耐心等待：流星是一阵一阵来的。", "zht": "今晚{n}活躍：流星看起來從{c}射出。看向輻射點旁邊而不是正對它，耐心等待：流星是一陣一陣來的。", "bg": "Тази нощ е активен потокът {n}: метеорите сякаш излизат от {c}. Гледайте встрани от тази точка, не право в нея, и чакайте: идват на талази.", "pl": "Tej nocy aktywne są {n}: meteory zdają się wylatywać z gwiazdozbioru {c}. Najlepiej patrzeć obok tego punktu, nie prosto na niego, i czekać: pojawiają się seriami."},
    "cieloGuiaNada": {"es": "Esta noche no sale ninguna parada: pruebe con otra noche.", "en": "No stops come out for tonight: try another night.", "fr": "Aucune étape ne ressort pour cette nuit : essayez une autre nuit.", "de": "Für heute Nacht ergibt sich keine Station: Versuch eine andere Nacht.", "it": "Per stanotte non esce nessuna tappa: prova un’altra notte.", "nl": "Voor vannacht komt er geen halte uit: probeer een andere nacht.", "zh": "今晚没有可推荐的站点：试试别的夜晚。", "zht": "今晚沒有可推薦的站點：試試別的夜晚。", "bg": "За тази нощ не излиза нито една спирка: опитай друга нощ.", "pl": "Na tę noc nie wychodzi żaden przystanek: spróbuj innej nocy."},
    "cieloGuiaNota": {"es": "Las paradas salen de lo que está arriba a esa hora, calculado aquí: la Luna si está, los planetas más brillantes, tres estrellas con nombre, lo mejor a simple vista, la Vía Láctea si no hay Luna, el paso de un satélite y la lluvia de estrellas activa. Cambie la noche con ‹ › o 📅.", "en": "The stops come from what is up at that time, calculated here: the Moon if it is out, the brightest planets, three named stars, the best naked-eye objects, the Milky Way if there is no Moon, a satellite pass and the active meteor shower. Change the night with ‹ › or 📅.", "fr": "Les étapes sortent de ce qui est levé à cette heure, calculé ici : la Lune si elle est là, les planètes les plus brillantes, trois étoiles nommées, le meilleur à l’œil nu, la Voie lactée s’il n’y a pas de Lune, un passage de satellite et la pluie d’étoiles active. Changez de nuit avec ‹ › ou 📅.", "de": "Die Stationen ergeben sich aus dem, was um diese Zeit am Himmel steht, hier berechnet: der Mond, wenn er da ist, die hellsten Planeten, drei Sterne mit Namen, das Beste fürs bloße Auge, die Milchstraße ohne Mond, ein Satellitenüberflug und der aktive Sternschnuppenstrom. Die Nacht wechselst du mit ‹ › oder 📅.", "it": "Le tappe escono da ciò che è alto a quell’ora, calcolato qui: la Luna se c’è, i pianeti più brillanti, tre stelle con nome, il meglio a occhio nudo, la Via Lattea se non c’è Luna, un passaggio di satellite e lo sciame attivo. Cambia notte con ‹ › o 📅.", "nl": "De haltes komen uit wat op dat moment aan de hemel staat, hier berekend: de maan als die er is, de helderste planeten, drie sterren met een naam, het beste voor het blote oog, de Melkweg als er geen maan is, een satellietovergang en de actieve meteorenzwerm. Wissel van nacht met ‹ › of 📅.", "zh": "各站来自那个时刻天上有什么，在这里计算：有月亮时的月亮、最亮的行星、三颗有名字的恒星、肉眼可见的最佳目标、无月时的银河、一次卫星过境和活跃的流星雨。用 ‹ › 或 📅 换一个夜晚。", "zht": "各站來自那個時刻天上有什麼，在這裡計算：有月亮時的月亮、最亮的行星、三顆有名字的恆星、肉眼可見的最佳目標、無月時的銀河、一次衛星過境和活躍的流星雨。用 ‹ › 或 📅 換一個夜晚。", "bg": "Спирките идват от това, което е горе в този час, изчислено тук: Луната, ако я има, най-ярките планети, три звезди с имена, най-доброто за просто око, Млечният път без Луна, преминаване на спътник и активният метеорен поток. Смени нощта с ‹ › или 📅.", "pl": "Przystanki wynikają z tego, co jest nad horyzontem o tej porze, policzone tutaj: Księżyc, jeśli jest, najjaśniejsze planety, trzy gwiazdy z nazwą, najlepsze obiekty gołym okiem, Droga Mleczna bez Księżyca, przelot satelity i aktywny rój meteorów. Zmień noc przyciskami ‹ › lub 📅."},
    /* ── la noche guiada en voz alta (22-10-2026, septimo bloque) ──────────────────
       El movil lee cada parada con sus voces (speechSynthesis): lo que se oye son las
       filas de arriba (la parada, el nombre, la clase, lo que se ve) y las cuatro de
       aqui que no salen en pantalla: VozIntro, VozDonde, VozHoraParada y VozFin. La
       hora va como etiqueta («Hora de referencia: 21:40») y no «a las»: a la una
       seria «a las 01:10». Los grados, con su plural (en polaco, tres formas). */
    "cieloVozLeer": {"es": "Leer en voz alta", "en": "Read aloud", "fr": "Lecture à voix haute", "de": "Laut vorlesen", "it": "Lettura ad alta voce", "nl": "Hardop voorlezen", "zh": "朗读", "zht": "朗讀", "bg": "Четене на глас", "pl": "Czytanie na głos"},
    "cieloVozPausa": {"es": "Pausa", "en": "Pause", "fr": "Pause", "de": "Pause", "it": "Pausa", "nl": "Pauze", "zh": "暂停", "zht": "暫停", "bg": "Пауза", "pl": "Pauza"},
    "cieloVozSeguir": {"es": "Seguir", "en": "Resume", "fr": "Reprendre", "de": "Fortsetzen", "it": "Riprendere", "nl": "Hervatten", "zh": "继续", "zht": "繼續", "bg": "Продължаване", "pl": "Wznowić"},
    "cieloVozSiguiente": {"es": "Siguiente", "en": "Next", "fr": "Suivante", "de": "Nächste", "it": "Successiva", "nl": "Volgende", "zh": "下一站", "zht": "下一站", "bg": "Следваща", "pl": "Następny"},
    "cieloVozParar": {"es": "Parar", "en": "Stop", "fr": "Arrêter", "de": "Beenden", "it": "Fermare", "nl": "Stoppen", "zh": "停止", "zht": "停止", "bg": "Спиране", "pl": "Zatrzymać"},
    "cieloVozEspera": {"es": "Siguiente parada en {s} s", "en": "Next stop in {s} s", "fr": "Étape suivante dans {s} s", "de": "Nächste Station in {s} s", "it": "Prossima tappa tra {s} s", "nl": "Volgende halte over {s} s", "zh": "{s}秒后进入下一站", "zht": "{s}秒後進入下一站", "bg": "Следваща спирка след {s} сек.", "pl": "Następny przystanek za {s} s"},
    "cieloVozEnPausa": {"es": "En pausa. «Seguir» vuelve a leer esta parada.", "en": "Paused. “Resume” reads this stop again.", "fr": "En pause. « Reprendre » relit cette étape.", "de": "Angehalten. „Fortsetzen“ liest diese Station noch einmal vor.", "it": "In pausa. «Riprendere» rilegge questa tappa.", "nl": "Gepauzeerd. ‘Hervatten’ leest deze halte opnieuw voor.", "zh": "已暂停。「继续」会重新朗读这一站。", "zht": "已暫停。「繼續」會重新朗讀這一站。", "bg": "На пауза. „Продължаване“ прочита тази спирка отново.", "pl": "Wstrzymano. „Wznowić” odczytuje ten przystanek od nowa."},
    "cieloVozNota": {"es": "Lo leen las voces instaladas en el dispositivo, sin red: así puede mirar al cielo y no a la pantalla. Tras cada parada hay {s} segundos para buscarla; «Siguiente» pasa antes y «Pausa» detiene la lectura.", "en": "The voices installed on the device read it, with no network needed: so you can look at the sky instead of the screen. After each stop there are {s} seconds to find it; “Next” moves on sooner and “Pause” stops the reading.", "fr": "Ce sont les voix installées sur l’appareil qui lisent, sans réseau : vous pouvez ainsi regarder le ciel plutôt que l’écran. Après chaque étape, vous avez {s} secondes pour la trouver ; « Suivante » passe plus tôt et « Pause » interrompt la lecture.", "de": "Vorgelesen wird mit den auf dem Gerät installierten Stimmen, ohne Netz: So können Sie in den Himmel schauen statt auf den Bildschirm. Nach jeder Station bleiben {s} Sekunden, um sie zu finden; „Nächste“ springt früher weiter, „Pause“ hält das Vorlesen an.", "it": "Leggono le voci installate sul dispositivo, senza rete: così può guardare il cielo e non lo schermo. Dopo ogni tappa ci sono {s} secondi per trovarla; «Successiva» passa prima e «Pausa» ferma la lettura.", "nl": "Het voorlezen gebeurt met de stemmen die op het apparaat geïnstalleerd zijn, zonder netwerk: zo kunt u naar de hemel kijken in plaats van naar het scherm. Na elke halte zijn er {s} seconden om die te vinden; ‘Volgende’ gaat eerder door en ‘Pauze’ stopt het voorlezen.", "zh": "由设备上安装的语音朗读，无需网络：这样您可以看着天空，而不是屏幕。每站之后有{s}秒供您寻找；按「下一站」不必等待，按「暂停」可停止朗读。", "zht": "由裝置上安裝的語音朗讀，無需網路：這樣您可以看著天空，而不是螢幕。每站之後有{s}秒供您尋找；按「下一站」不必等待，按「暫停」可停止朗讀。", "bg": "Чете се с гласовете, инсталирани на устройството, без мрежа: така можете да гледате небето, а не екрана. След всяка спирка има {s} секунди, за да я намерите; „Следваща“ минава по-рано, а „Пауза“ спира четенето.", "pl": "Czytają głosy zainstalowane w urządzeniu, bez sieci: można patrzeć w niebo, a nie w ekran. Po każdym przystanku jest przerwa ({s} s) na jego odszukanie; „Następny” przechodzi dalej wcześniej, a „Pauza” wstrzymuje czytanie."},
    "cieloVozSinVoz": {"es": "Este dispositivo no tiene una voz para este idioma. Si instala una en sus ajustes, podrá escuchar aquí la noche guiada.", "en": "This device has no voice for this language. If you install one in its settings, you will be able to hear the guided night here.", "fr": "Cet appareil n’a pas de voix pour cette langue. Si vous en installez une dans ses réglages, vous pourrez écouter ici la nuit guidée.", "de": "Dieses Gerät hat keine Stimme für diese Sprache. Wenn Sie in seinen Einstellungen eine installieren, können Sie sich die geführte Nacht hier vorlesen lassen.", "it": "Questo dispositivo non ha una voce per questa lingua. Se ne installa una nelle sue impostazioni, potrà ascoltare qui la notte guidata.", "nl": "Dit apparaat heeft geen stem voor deze taal. Als u er een installeert in de instellingen, kunt u hier naar de begeleide nacht luisteren.", "zh": "此设备没有该语言的语音。在设备设置中安装后，即可在这里收听今晚导览。", "zht": "此裝置沒有該語言的語音。在裝置設定中安裝後，即可在這裡收聽今晚導覽。", "bg": "Това устройство няма глас за този език. Ако инсталирате такъв в настройките му, ще можете да слушате тук нощта с водач.", "pl": "To urządzenie nie ma głosu dla tego języka. Po zainstalowaniu go w ustawieniach można tu słuchać nocy z przewodnikiem."},
    "cieloVozFallo": {"es": "La voz del dispositivo no ha podido leer el texto. Pruebe otra vez.", "en": "The device’s voice could not read the text. Please try again.", "fr": "La voix de l’appareil n’a pas pu lire le texte. Réessayez.", "de": "Die Stimme des Geräts konnte den Text nicht vorlesen. Bitte versuchen Sie es noch einmal.", "it": "La voce del dispositivo non è riuscita a leggere il testo. Riprovi.", "nl": "De stem van het apparaat kon de tekst niet voorlezen. Probeer het opnieuw.", "zh": "设备语音未能朗读文本。请再试一次。", "zht": "裝置語音未能朗讀文字。請再試一次。", "bg": "Гласът на устройството не успя да прочете текста. Опитайте отново.", "pl": "Głos urządzenia nie odczytał tekstu. Można spróbować ponownie."},
    "cieloVozIntro": {"es": "Noche guiada: {n} parada. Hora de referencia: {t}. Después, una pausa para buscarla en el cielo.|Noche guiada: {n} paradas, de lo más fácil a lo más fino. Hora de referencia: {t}. Tras cada una, una pausa para buscarla en el cielo.", "en": "Guided night: {n} stop. Reference time: {t}. Then a pause to find it in the sky.|Guided night: {n} stops, from the easiest to the finest. Reference time: {t}. After each one, a pause to find it in the sky.", "fr": "Nuit guidée : {n} étape. Heure de référence : {t}. Ensuite, une pause pour la trouver dans le ciel.|Nuit guidée : {n} étapes, de la plus facile à la plus fine. Heure de référence : {t}. Après chacune, une pause pour la trouver dans le ciel.", "de": "Geführte Nacht: {n} Station. Berechnet für {t}. Danach eine Pause, um sie am Himmel zu finden.|Geführte Nacht: {n} Stationen, von der leichtesten zur feinsten. Berechnet für {t}. Nach jeder eine Pause, um sie am Himmel zu finden.", "it": "Notte guidata: {n} tappa. Ora di riferimento: {t}. Poi una pausa per trovarla in cielo.|Notte guidata: {n} tappe, dalla più facile alla più fine. Ora di riferimento: {t}. Dopo ciascuna, una pausa per trovarla in cielo.", "nl": "Begeleide nacht: {n} halte. Berekend voor {t}. Daarna een pauze om die aan de hemel te zoeken.|Begeleide nacht: {n} haltes, van de makkelijkste tot de fijnste. Berekend voor {t}. Na elke halte een pauze om die aan de hemel te zoeken.", "zh": "今晚导览：共{n}站，由易到难。参考时间：{t}。每站读完之后会停一会儿，方便您在天上寻找。", "zht": "今晚導覽：共{n}站，由易到難。參考時間：{t}。每站讀完之後會停一會兒，方便您在天上尋找。", "bg": "Нощ с водач: {n} спирка. Изчислено за {t}. След нея има пауза, за да я потърсите на небето.|Нощ с водач: {n} спирки, от най-лесната до най-фината. Изчислено за {t}. След всяка има пауза, за да я потърсите на небето.", "pl": "Noc z przewodnikiem: {n} przystanek. Godzina odniesienia: {t}. Potem chwila przerwy na odszukanie go na niebie.|Noc z przewodnikiem: {n} przystanki, od najłatwiejszego do najsubtelniejszego. Godzina odniesienia: {t}. Po każdym chwila przerwy na odszukanie go na niebie.|Noc z przewodnikiem: {n} przystanków, od najłatwiejszego do najsubtelniejszego. Godzina odniesienia: {t}. Po każdym chwila przerwy na odszukanie go na niebie."},
    "cieloVozDonde": {"es": "Mire {r}, a {n} grado sobre el horizonte.|Mire {r}, a {n} grados sobre el horizonte.", "en": "Look {r}, {n} degree above the horizon.|Look {r}, {n} degrees above the horizon.", "fr": "Regardez {r}, à {n} degré au-dessus de l’horizon.|Regardez {r}, à {n} degrés au-dessus de l’horizon.", "de": "Position: {r}, {n} Grad über dem Horizont.", "it": "Guardi {r}, a {n} grado sopra l’orizzonte.|Guardi {r}, a {n} gradi sopra l’orizzonte.", "nl": "Positie: {r}, {n} graad boven de horizon.|Positie: {r}, {n} graden boven de horizon.", "zh": "请看{r}，地平线上方{n}度。", "zht": "請看{r}，地平線上方{n}度。", "bg": "Погледнете {r}, на {n} градус над хоризонта.|Погледнете {r}, на {n} градуса над хоризонта.", "pl": "Położenie: {r}, {n} stopień nad horyzontem.|Położenie: {r}, {n} stopnie nad horyzontem.|Położenie: {r}, {n} stopni nad horyzontem."},
    "cieloVozHoraParada": {"es": "Hora de esta parada: {t}.", "en": "Time for this stop: {t}.", "fr": "Heure de cette étape : {t}.", "de": "Uhrzeit dieser Station: {t}.", "it": "Ora di questa tappa: {t}.", "nl": "Tijdstip van deze halte: {t}.", "zh": "本站时间：{t}。", "zht": "本站時間：{t}。", "bg": "Час на тази спирка: {t}.", "pl": "Godzina tego przystanku: {t}."},
    "cieloVozFin": {"es": "Fin de la noche guiada.", "en": "End of the guided night.", "fr": "Fin de la nuit guidée.", "de": "Ende der geführten Nacht.", "it": "Fine della notte guidata.", "nl": "Einde van de begeleide nacht.", "zh": "今晚导览结束。", "zht": "今晚導覽結束。", "bg": "Край на нощта с водач.", "pl": "Koniec nocy z przewodnikiem."},
    /* ── el sistema solar hoy ──────────────────────────────────────────────────── */
    "cieloTierra": {"es": "Tierra", "en": "Earth", "fr": "Terre", "de": "Erde", "it": "Terra", "nl": "Aarde", "zh": "地球", "zht": "地球", "bg": "Земя", "pl": "Ziemia"},
    "cieloSistemaTitulo": {"es": "El sistema solar hoy", "en": "The solar system today", "fr": "Le Système solaire aujourd’hui", "de": "Das Sonnensystem heute", "it": "Il sistema solare oggi", "nl": "Het zonnestelsel vandaag", "zh": "今天的太阳系", "zht": "今天的太陽系", "bg": "Слънчевата система днес", "pl": "Układ Słoneczny dzisiaj"},
    "cieloSistemaInterior": {"es": "Hasta Marte", "en": "Out to Mars", "fr": "Jusqu’à Mars", "de": "Bis zum Mars", "it": "Fino a Marte", "nl": "Tot Mars", "zh": "到火星", "zht": "到火星", "bg": "До Марс", "pl": "Do Marsa"},
    "cieloSistemaExterior": {"es": "Hasta Neptuno", "en": "Out to Neptune", "fr": "Jusqu’à Neptune", "de": "Bis zum Neptun", "it": "Fino a Nettuno", "nl": "Tot Neptunus", "zh": "到海王星", "zht": "到海王星", "bg": "До Нептун", "pl": "Do Neptuna"},
    "cieloSistemaMenos": {"es": "− 1 mes", "en": "− 1 month", "fr": "− 1 mois", "de": "− 1 Monat", "it": "− 1 mese", "nl": "− 1 maand", "zh": "− 1 个月", "zht": "− 1 個月", "bg": "− 1 месец", "pl": "− 1 miesiąc"},
    "cieloSistemaMas": {"es": "+ 1 mes", "en": "+ 1 month", "fr": "+ 1 mois", "de": "+ 1 Monat", "it": "+ 1 mese", "nl": "+ 1 maand", "zh": "+ 1 个月", "zht": "+ 1 個月", "bg": "+ 1 месец", "pl": "+ 1 miesiąc"},
    "cieloSistemaCorre": {"es": "Hacer correr el tiempo (un mes por segundo)", "en": "Run time (a month per second)", "fr": "Faire défiler le temps (un mois par seconde)", "de": "Zeit laufen lassen (ein Monat pro Sekunde)", "it": "Far scorrere il tempo (un mese al secondo)", "nl": "Tijd laten lopen (een maand per seconde)", "zh": "让时间流动（每秒一个月）", "zht": "讓時間流動（每秒一個月）", "bg": "Пусни времето (месец в секунда)", "pl": "Uruchom czas (miesiąc na sekundę)"},
    "cieloSistemaNota": {"es": "Las órbitas y las posiciones de hoy, vistas desde encima del polo norte del Sol y calculadas con Astronomy Engine; los tamaños no están a escala. La mitad oscura de la Tierra es su noche, y el punto, Tenerife. Toque un planeta.", "en": "Today’s orbits and positions, seen from above the Sun’s north pole and calculated with Astronomy Engine; sizes are not to scale. The dark half of the Earth is its night, and the dot is Tenerife. Tap a planet.", "fr": "Les orbites et les positions du jour, vues de dessus le pôle nord du Soleil et calculées avec Astronomy Engine ; les tailles ne sont pas à l’échelle. La moitié sombre de la Terre est sa nuit, et le point, Tenerife. Touchez une planète.", "de": "Die Bahnen und Positionen von heute, von oberhalb des Sonnennordpols gesehen und mit Astronomy Engine berechnet; die Größen sind nicht maßstäblich. Die dunkle Hälfte der Erde ist ihre Nacht, der Punkt ist Teneriffa. Tippe auf einen Planeten.", "it": "Le orbite e le posizioni di oggi, viste da sopra il polo nord del Sole e calcolate con Astronomy Engine; le dimensioni non sono in scala. La metà scura della Terra è la sua notte, e il punto, Tenerife. Tocca un pianeta.", "nl": "De banen en posities van vandaag, gezien van boven de noordpool van de zon en berekend met Astronomy Engine; de groottes zijn niet op schaal. De donkere helft van de aarde is haar nacht, en het stipje is Tenerife. Tik op een planeet.", "zh": "今天的轨道和位置，从太阳北极上方俯视，用 Astronomy Engine 计算；大小未按比例。地球暗的一半是它的黑夜，小点是特内里费。点一个行星。", "zht": "今天的軌道和位置，從太陽北極上方俯視，用 Astronomy Engine 計算；大小未按比例。地球暗的一半是它的黑夜，小點是特內里費。點一個行星。", "bg": "Орбитите и позициите днес, гледани отгоре над северния полюс на Слънцето и изчислени с Astronomy Engine; размерите не са в мащаб. Тъмната половина на Земята е нейната нощ, а точката е Тенерифе. Докосни планета.", "pl": "Dzisiejsze orbity i położenia, widziane znad północnego bieguna Słońca i policzone w Astronomy Engine; rozmiary nie są w skali. Ciemna połowa Ziemi to jej noc, a kropka to Teneryfa. Dotknij planety."},
    "cieloSistemaDeSol": {"es": "A {d} UA del Sol", "en": "{d} au from the Sun", "fr": "À {d} ua du Soleil", "de": "{d} AE von der Sonne", "it": "A {d} UA dal Sole", "nl": "{d} AE van de zon", "zh": "距太阳 {d} 天文单位", "zht": "距太陽 {d} 天文單位", "bg": "На {d} а.е. от Слънцето", "pl": "{d} au od Słońca"},
    "cieloSistemaDeTierra": {"es": "A {d} UA de la Tierra: su luz tarda {t} en llegar", "en": "{d} au from the Earth: its light takes {t} to reach us", "fr": "À {d} ua de la Terre : sa lumière met {t} à nous parvenir", "de": "{d} AE von der Erde: Das Licht braucht {t} bis zu uns", "it": "A {d} UA dalla Terra: la sua luce impiega {t} ad arrivare", "nl": "{d} AE van de aarde: het licht doet er {t} over", "zh": "距地球 {d} 天文单位：它的光需要{t}才能到达", "zht": "距地球 {d} 天文單位：它的光需要{t}才能到達", "bg": "На {d} а.е. от Земята: светлината пътува {t}", "pl": "{d} au od Ziemi: światło leci do nas {t}"},
    "cieloSistemaElong": {"es": "A {e}° del Sol en nuestro cielo", "en": "{e}° from the Sun in our sky", "fr": "À {e}° du Soleil dans notre ciel", "de": "{e}° von der Sonne an unserem Himmel", "it": "A {e}° dal Sole nel nostro cielo", "nl": "{e}° van de zon aan onze hemel", "zh": "在我们的天空中距太阳 {e}°", "zht": "在我們的天空中距太陽 {e}°", "bg": "На {e}° от Слънцето в нашето небе", "pl": "{e}° od Słońca na naszym niebie"},
    /* ── la luz roja completa ──────────────────────────────────────────────────── */
    "cieloRojoBrillo": {"es": "Brillo de la pantalla", "en": "Screen brightness", "fr": "Luminosité de l’écran", "de": "Bildschirmhelligkeit", "it": "Luminosità dello schermo", "nl": "Schermhelderheid", "zh": "屏幕亮度", "zht": "螢幕亮度", "bg": "Яркост на екрана", "pl": "Jasność ekranu"},
    "cieloRojoPista": {"es": "Es de noche: con la luz roja no se deslumbra y sigue viendo las estrellas.", "en": "It is night: with the red light you avoid the glare and keep seeing the stars.", "fr": "Il fait nuit : avec la lumière rouge, pas d’éblouissement, et vous continuez à voir les étoiles.", "de": "Es ist Nacht: Mit dem Rotlicht blendet nichts, und du siehst die Sterne weiter.", "it": "È notte: con la luce rossa non ti abbagli e continui a vedere le stelle.", "nl": "Het is nacht: met het rode licht word je niet verblind en blijf je de sterren zien.", "zh": "天黑了：开红光模式不刺眼，还能继续看见星星。", "zht": "天黑了：開紅光模式不刺眼，還能繼續看見星星。", "bg": "Нощ е: с червената светлина не се заслепяваш и продължаваш да виждаш звездите.", "pl": "Jest noc: przy czerwonym świetle nic cię nie oślepia i dalej widzisz gwiazdy."},
    "cieloRojoActivar": {"es": "Activar", "en": "Turn on", "fr": "Activer", "de": "Einschalten", "it": "Attiva", "nl": "Aanzetten", "zh": "开启", "zht": "開啟", "bg": "Включи", "pl": "Włącz"},
    "cieloRojoNo": {"es": "No, gracias", "en": "No, thanks", "fr": "Non, merci", "de": "Nein, danke", "it": "No, grazie", "nl": "Nee, bedankt", "zh": "不用了", "zht": "不用了", "bg": "Не, благодаря", "pl": "Nie, dziękuję"},
    /* ── sin red en el Teide ───────────────────────────────────────────────────── */
    "cieloSinRed": {"es": "Sin conexión. El cielo se calcula igual en el móvil; lo que no hay sin red son las nubes y Wikipedia. Los satélites van con los elementos del {f}.", "en": "No connection. The sky is calculated on the phone just the same; what you lose without a network is the clouds and Wikipedia. Satellites use the elements of {f}.", "fr": "Pas de connexion. Le ciel se calcule quand même sur le téléphone ; sans réseau, il manque les nuages et Wikipédia. Les satellites utilisent les éléments du {f}.", "de": "Keine Verbindung. Der Himmel wird trotzdem auf dem Handy berechnet; ohne Netz fehlen nur die Wolken und Wikipedia. Die Satelliten laufen mit den Bahnelementen vom {f}.", "it": "Senza connessione. Il cielo si calcola lo stesso sul telefono; senza rete mancano le nuvole e Wikipedia. I satelliti usano gli elementi del {f}.", "nl": "Geen verbinding. De hemel wordt gewoon op je telefoon berekend; zonder netwerk ontbreken alleen de wolken en Wikipedia. De satellieten gebruiken de baanelementen van {f}.", "zh": "没有网络。天空照样在手机上计算；没网时缺的只是云量和维基百科。卫星使用{f}的轨道根数。", "zht": "沒有網路。天空照樣在手機上計算；沒網路時缺的只是雲量和維基百科。衛星使用{f}的軌道根數。", "bg": "Няма връзка. Небето се изчислява на телефона все така; без мрежа липсват само облаците и Уикипедия. Спътниците са с елементите от {f}.", "pl": "Brak połączenia. Niebo i tak liczy się w telefonie; bez sieci brakuje tylko chmur i Wikipedii. Satelity korzystają z elementów z {f}."},
    "cieloSinRedSinSat": {"es": "Sin conexión. El cielo se calcula igual en el móvil; lo que no hay sin red son las nubes y Wikipedia.", "en": "No connection. The sky is calculated on the phone just the same; what you lose without a network is the clouds and Wikipedia.", "fr": "Pas de connexion. Le ciel se calcule quand même sur le téléphone ; sans réseau, il manque les nuages et Wikipédia.", "de": "Keine Verbindung. Der Himmel wird trotzdem auf dem Handy berechnet; ohne Netz fehlen nur die Wolken und Wikipedia.", "it": "Senza connessione. Il cielo si calcola lo stesso sul telefono; senza rete mancano le nuvole e Wikipedia.", "nl": "Geen verbinding. De hemel wordt gewoon op je telefoon berekend; zonder netwerk ontbreken alleen de wolken en Wikipedia.", "zh": "没有网络。天空照样在手机上计算；没网时缺的只是云量和维基百科。", "zht": "沒有網路。天空照樣在手機上計算；沒網路時缺的只是雲量和維基百科。", "bg": "Няма връзка. Небето се изчислява на телефона все така; без мрежа липсват само облаците и Уикипедия.", "pl": "Brak połączenia. Niebo i tak liczy się w telefonie; bez sieci brakuje tylko chmur i Wikipedii."},
    "cieloOfflineTitulo": {"es": "Antes de subir al Teide", "en": "Before going up to Teide", "fr": "Avant de monter au Teide", "de": "Bevor es auf den Teide geht", "it": "Prima di salire al Teide", "nl": "Voor je de Teide op gaat", "zh": "上泰德峰之前", "zht": "上泰德峰之前", "bg": "Преди да се качиш на Тейде", "pl": "Zanim wjedziesz na Teide"},
    "cieloOfflineListo": {"es": "Guardado en el móvil: arriba no hace falta cobertura. La carta, el calendario, el catálogo, «Apunte al cielo» y los satélites funcionan sin conexión.", "en": "Saved on your phone: no signal needed up there. The chart, the calendar, the catalogue, “Point at the sky” and the satellites work offline.", "fr": "Enregistré sur le téléphone : là-haut, pas besoin de réseau. La carte, le calendrier, le catalogue, « Pointez vers le ciel » et les satellites fonctionnent hors ligne.", "de": "Auf dem Handy gespeichert: Oben braucht es keinen Empfang. Karte, Kalender, Katalog, „Auf den Himmel zeigen“ und die Satelliten funktionieren offline.", "it": "Salvato sul telefono: lassù non serve copertura. La carta, il calendario, il catalogo, «Punta al cielo» e i satelliti funzionano senza connessione.", "nl": "Opgeslagen op je telefoon: daarboven heb je geen bereik nodig. De kaart, de kalender, de catalogus, ‘Richt op de hemel’ en de satellieten werken offline.", "zh": "已保存在手机上：山上不需要信号。星图、日历、目录、「对准星空」和卫星都能离线使用。", "zht": "已保存在手機上：山上不需要訊號。星圖、日曆、目錄、「對準星空」和衛星都能離線使用。", "bg": "Запазено на телефона: горе не трябва покритие. Картата, календарът, каталогът, „Насочи към небето“ и спътниците работят без връзка.", "pl": "Zapisane w telefonie: na górze zasięg nie jest potrzebny. Mapa nieba, kalendarz, katalog, „Wyceluj w niebo” i satelity działają bez sieci."},
    "cieloOfflineFalta": {"es": "Aún no está guardado en el móvil: abra el panel una vez con conexión y se guarda solo.", "en": "Not saved on your phone yet: open the panel once with a connection and it saves itself.", "fr": "Pas encore enregistré sur le téléphone : ouvrez le panneau une fois avec une connexion, il s’enregistre tout seul.", "de": "Noch nicht auf dem Handy gespeichert: Öffne das Panel einmal mit Verbindung, dann speichert es sich von selbst.", "it": "Non è ancora salvato sul telefono: apri il pannello una volta con connessione e si salva da solo.", "nl": "Nog niet op je telefoon opgeslagen: open het paneel één keer met verbinding en het slaat zichzelf op.", "zh": "尚未保存在手机上：联网时打开一次这个面板，它会自动保存。", "zht": "尚未保存在手機上：連線時打開一次這個面板，它會自動保存。", "bg": "Още не е запазено на телефона: отвори панела веднъж с връзка и се запазва сам.", "pl": "Jeszcze nie zapisane w telefonie: otwórz panel raz z połączeniem, a zapisze się sam."},
    "cieloOfflineNo": {"es": "Este navegador no guarda la app para usarla sin conexión: arriba hará falta cobertura.", "en": "This browser does not save the app for offline use: you will need a signal up there.", "fr": "Ce navigateur n’enregistre pas l’appli pour un usage hors ligne : là-haut, il faudra du réseau.", "de": "Dieser Browser speichert die App nicht für die Offline-Nutzung: Oben braucht es Empfang.", "it": "Questo browser non salva l’app per usarla senza connessione: lassù servirà copertura.", "nl": "Deze browser slaat de app niet op voor offline gebruik: daarboven heb je bereik nodig.", "zh": "这个浏览器不会保存应用供离线使用：山上需要信号。", "zht": "這個瀏覽器不會保存應用程式供離線使用：山上需要訊號。", "bg": "Този браузър не запазва приложението за работа без връзка: горе ще трябва покритие.", "pl": "Ta przeglądarka nie zapisuje aplikacji do pracy bez sieci: na górze będzie potrzebny zasięg."},
    "cieloOfflineWiki": {"es": "Las fichas de Wikipedia que abra con conexión se guardan 30 días; las nubes necesitan red.", "en": "Wikipedia summaries you open while connected are kept for 30 days; the clouds need a network.", "fr": "Les résumés Wikipédia ouverts avec une connexion sont gardés 30 jours ; les nuages ont besoin du réseau.", "de": "Wikipedia-Zusammenfassungen, die du mit Verbindung öffnest, bleiben 30 Tage gespeichert; die Wolken brauchen Netz.", "it": "Le schede di Wikipedia aperte con connessione restano 30 giorni; le nuvole hanno bisogno della rete.", "nl": "Wikipedia-samenvattingen die je met verbinding opent, blijven 30 dagen bewaard; de wolken hebben netwerk nodig.", "zh": "联网时打开过的维基百科摘要会保存 30 天；云量需要网络。", "zht": "連線時打開過的維基百科摘要會保存 30 天；雲量需要網路。", "bg": "Резюметата от Уикипедия, отворени с връзка, се пазят 30 дни; облаците имат нужда от мрежа.", "pl": "Streszczenia z Wikipedii otwarte przy połączeniu są przechowywane 30 dni; chmury wymagają sieci."},
    "cieloOfflineComprobando": {"es": "Comprobando lo guardado…", "en": "Checking what is saved…", "fr": "Vérification de ce qui est enregistré…", "de": "Prüfe, was gespeichert ist…", "it": "Controllo di ciò che è salvato…", "nl": "Controleren wat er is opgeslagen…", "zh": "正在检查已保存的内容…", "zht": "正在檢查已保存的內容…", "bg": "Проверка на запазеното…", "pl": "Sprawdzanie, co jest zapisane…"},
    /* Las curiosidades con fuente, la ficha de cada planeta con las cifras de la
       NASA, la Luna, Canopus y las estrellas del sur, la luz zodiacal, la sombra
       del Teide (22-10-2026, quinto bloque; Jerome: «busca fun
       facts… que no te olvides de nada»). Cada frase dice de donde sale:
         · Planetas y Luna: NASA NSSDCA, «Planetary Fact Sheet - Metric»
           (nssdc.gsfc.nasa.gov/planetary/factsheet, actualizada el 18-3-2025,
           leida el 22-10-2026), copiada en datos/planetas.json: diametro,
           gravedad, rotacion, dia solar, periodo orbital (el sideral, de la hoja
           de cada planeta: la tabla resumen trae el tropico), temperatura media,
           oblicuidad, presion, lunas, densidad, velocidad orbital. Las frases solo
           combinan esas cifras: Mercurio «el mas pequeño y el mas rapido» (4.879
           km, 47,4 km/s), su dia solar 4.222,6 h = 176 dias, justo dos de sus
           años (el sideral, 87,969 dias); Venus gira al reves, como Urano (en
           la tabla solo ellos dos rotan en negativo, «Negative numbers indicate
           retrograde (backwards relative to the Earth) rotation»: Venus
           -5.832,5 h = 243 dias frente a 224,7 de año, Urano -17,2 h), 464 °C
           frente a 167 de Mercurio, 92 bares;
           Marte: Fobos y Deimos, radios 13,0 × 11,4 × 9,1 y 7,8 × 6,0 × 5,1 km en la
           Mars Fact Sheet (marsfact.html): 26 y 16 km de largo; Jupiter 142.984 km
           = 11,2 Tierras y 9,9 h; Saturno 687 kg/m3 (< 1.000
           del agua) y 274 lunas frente a 95 de Jupiter; Urano 97,8°; Neptuno
           4.515 millones de km (4 h 11 min de luz a 299.792,458 km/s) y -200 °C,
           la mas baja de los ocho planetas (la tabla trae tambien a Pluton, sin
           llamarlo planeta enano, a 5.906,4 millones de km y -225 °C); la Luna:
           rotacion 655,7 h = 27,3 dias = su periodo orbital (la misma cara).
         · El Sol: NASA NSSDCA, «Sun Fact Sheet» (sunfact.html, actualizada el
           9-5-2024): tipo espectral «G2 V» (una estrella), radio 109,2 Tierras,
           masa 332.900 Tierras, rotacion sideral 609,12 h (25,4 dias), la de 16°
           de latitud: «This is the adopted period at 16 deg. latitude - the actual
           rotation rate varies with latitude L» (con la formula de la hoja, unos
           25 dias en el ecuador y 34 cerca de los polos), temperatura efectiva
           5.772 K (5.500 °C). «Mas del
           99 % de la masa del sistema solar»: la masa del Sol frente a la suma de
           la tabla (1.988.400 frente a 2.667 ×10²⁴ kg de los ocho planetas).
         · La Luna se aleja 3,8 cm al año y las huellas del Apolo: «Fun Facts
           About the Moon», Night Sky Network de la NASA/JPL (nightsky.jpl.nasa.gov/
           media/documents/attachments/Fun_Facts_About_the_Moon.pdf): «Each year,
           the Moon steals some of Earth's rotational energy, and uses it to propel
           itself about 3.8 centimeters higher in its orbit», «the footprints left
           by Apollo astronauts will last a long time».
         · Perigeo y apogeo: Astronomy Engine (SearchLunarApsis / NextLunarApsis),
           calculados en el movil para la fecha de la carta.
         · Las estrellas del sur: geometria. Un astro de declinacion δ nunca sale
           al norte de la latitud 90° − |δ|; desde Tenerife (OBS.lat) culmina a
           90° − lat + δ. Madrid 40,4° N, Paris 48,9° N (latitudes de las
           capitales, redondeadas). La Polar: su altura es la latitud del lugar.
         · ISS: NASA, «Space Station Facts and Figures» (nasa.gov): «five miles per
           second» (8 km/s), «orbiting Earth about every 90 minutes», «16 sunrises
           and sunsets», «356 feet (109 meters) end-to-end… one yard shy of the
           full length of an American football field including the end zones»,
           «continuously occupied since November 2000».
         · Tiangong: «Heavenly Palace», Tianhe el 29 de abril de 2021, tres modulos
           en 2022, 340 m³ «slightly over one third that of the ISS» (Wikipedia,
           «Tiangong space station»); «typically hosts three astronauts at a time
           for six-month stays» (The Planetary Society, planetary.org/space-missions/
           chinese-space-station).
         · Hubble: NASA, «STS-31» (nasa.gov/mission/sts-31): «Launched: April 24,
           1990», orbiter Discovery, «deployed in a 380-statute-mile orbit» (611
           km), desplegado el 25 de abril; NASA Goddard, «A NASA refresher on
           Hubble facts» (2015, act. 2024): «Length: 43.5 feet (13.3 m)», «the
           length of a large school bus», «altitude of 340 miles… 547 km», «more
           than 1.2 million observations».
         · Luz zodiacal: Encyclopaedia Britannica, «zodiacal light»
           (britannica.com/science/zodiacal-light): «thought to be sunlight
           reflected from cometary dust concentrated in the plane of the zodiac, or
           ecliptic» (de ahi el «se cree»); «seen in the west after twilight and in
           the east before dawn»; «being easily visible in the tropics where the
           ecliptic is approximately vertical»; «In mid-northern latitudes it is
           best seen in the evening in February and March and in the morning in
           September and October».
         · La sombra del Teide: The World at Night, «A triangular shadow of a large
           volcano» (twanight.org/gallery/a-triangular-shadow-of-a-large-volcano,
           foto de Juan Carlos Casado; tambien APOD del 5-7-2011): «a sunset (or
           sunrise) shadow that extends to the horizon»; el triangulo es
           perspectiva («just as parallel train tracks do»), no la forma del
           volcan.
         · La Ley del Cielo ya esta en textos_ui4.py (LeyCielo, tarjeta «Por que
           aqui»): no se repite.
         · Lluvias: el cuerpo padre de cada una viene de la lista de la IMO que
           lleva datos/cielo.json (campo padre); las curiosidades de cada lluvia
           llevan su fuente en la fila (NASA, AMS).
       ── unidades ────────────────────────────────────────────────────────────────
       DurDias es para numeros enteros (las formas de plural las elige tx() con el
       n); DurDiasFrac y DurAnios, para cifras con decimal («27,3 dias», «11,9
       años»), que en polaco piden el genitivo singular (dnia, roku) y en los demas
       el plural: aqui todos los años salen con decimal (Marte 1,9, Neptuno 164,8). */
    "cieloDurDias": {"es": "{n} día|{n} días", "en": "{n} day|{n} days", "fr": "{n} jour|{n} jours", "de": "{n} Tag|{n} Tage", "it": "{n} giorno|{n} giorni", "nl": "{n} dag|{n} dagen", "zh": "{n} 天", "zht": "{n} 天", "bg": "{n} ден|{n} дни", "pl": "{n} dzień|{n} dni|{n} dni"},
    "cieloDurDiasFrac": {"es": "{n} días", "en": "{n} days", "fr": "{n} jours", "de": "{n} Tage", "it": "{n} giorni", "nl": "{n} dagen", "zh": "{n} 天", "zht": "{n} 天", "bg": "{n} дни", "pl": "{n} dnia"},
    "cieloDurAnios": {"es": "{n} años", "en": "{n} years", "fr": "{n} ans", "de": "{n} Jahre", "it": "{n} anni", "nl": "{n} jaar", "zh": "{n} 年", "zht": "{n} 年", "bg": "{n} години", "pl": "{n} roku"},
    "cieloDurHoras": {"es": "{n} h", "en": "{n} h", "fr": "{n} h", "de": "{n} h", "it": "{n} h", "nl": "{n} h", "zh": "{n} 小时", "zht": "{n} 小時", "bg": "{n} ч", "pl": "{n} h"},
    /* ── la ficha del planeta (cifras de la NASA) ──────────────────────────────── */
    "cieloPlFicha": {"es": "Ficha del planeta", "en": "Planet fact sheet", "fr": "Fiche de la planète", "de": "Steckbrief des Planeten", "it": "Scheda del pianeta", "nl": "Planeetkaart", "zh": "行星档案", "zht": "行星檔案", "bg": "Данни за планетата", "pl": "Karta planety"},
    "cieloPlDiametro": {"es": "Diámetro: {km} km, {x} veces el de la Tierra", "en": "Diameter: {km} km, {x} times Earth’s", "fr": "Diamètre : {km} km, {x} fois celui de la Terre", "de": "Durchmesser: {km} km, das {x}-Fache der Erde", "it": "Diametro: {km} km, {x} volte quello della Terra", "nl": "Diameter: {km} km, {x} keer die van de aarde", "zh": "直径：{km} 公里，是地球的 {x} 倍", "zht": "直徑：{km} 公里，是地球的 {x} 倍", "bg": "Диаметър: {km} km, {x} пъти земния", "pl": "Średnica: {km} km, {x} razy ziemska"},
    "cieloPlDia": {"es": "Un día (de mediodía a mediodía): {d}", "en": "A day (noon to noon): {d}", "fr": "Un jour (de midi à midi) : {d}", "de": "Ein Tag (von Mittag zu Mittag): {d}", "it": "Un giorno (da mezzogiorno a mezzogiorno): {d}", "nl": "Een dag (van middag tot middag): {d}", "zh": "一天（正午到正午）：{d}", "zht": "一天（正午到正午）：{d}", "bg": "Един ден (от пладне до пладне): {d}", "pl": "Doba (od południa do południa): {d}"},
    "cieloPlAnio": {"es": "Un año (una vuelta al Sol): {a}", "en": "A year (one orbit of the Sun): {a}", "fr": "Une année (un tour du Soleil) : {a}", "de": "Ein Jahr (ein Umlauf um die Sonne): {a}", "it": "Un anno (un giro intorno al Sole): {a}", "nl": "Een jaar (één rondje om de zon): {a}", "zh": "一年（绕太阳一周）：{a}", "zht": "一年（繞太陽一周）：{a}", "bg": "Една година (една обиколка около Слънцето): {a}", "pl": "Rok (jedno okrążenie Słońca): {a}"},
    "cieloPlLunas": {"es": "Lunas conocidas: {n}", "en": "Known moons: {n}", "fr": "Lunes connues : {n}", "de": "Bekannte Monde: {n}", "it": "Lune conosciute: {n}", "nl": "Bekende manen: {n}", "zh": "已知卫星：{n} 颗", "zht": "已知衛星：{n} 顆", "bg": "Известни луни: {n}", "pl": "Znane księżyce: {n}"},
    "cieloPlTemp": {"es": "Temperatura media: {t} °C", "en": "Mean temperature: {t} °C", "fr": "Température moyenne : {t} °C", "de": "Mitteltemperatur: {t} °C", "it": "Temperatura media: {t} °C", "nl": "Gemiddelde temperatuur: {t} °C", "zh": "平均温度：{t} °C", "zht": "平均溫度：{t} °C", "bg": "Средна температура: {t} °C", "pl": "Średnia temperatura: {t} °C"},
    "cieloPlGravedad": {"es": "Gravedad: {g} m/s², {x} veces la de la Tierra", "en": "Gravity: {g} m/s², {x} times Earth’s", "fr": "Gravité : {g} m/s², {x} fois celle de la Terre", "de": "Schwerkraft: {g} m/s², das {x}-Fache der Erde", "it": "Gravità: {g} m/s², {x} volte quella terrestre", "nl": "Zwaartekracht: {g} m/s², {x} keer die van de aarde", "zh": "重力：{g} m/s²，是地球的 {x} 倍", "zht": "重力：{g} m/s²，是地球的 {x} 倍", "bg": "Гравитация: {g} m/s², {x} пъти земната", "pl": "Grawitacja: {g} m/s², {x} razy ziemska"},
    "cieloPlAnillos": {"es": "Tiene anillos", "en": "Has rings", "fr": "A des anneaux", "de": "Hat Ringe", "it": "Ha anelli", "nl": "Heeft ringen", "zh": "有光环", "zht": "有光環", "bg": "Има пръстени", "pl": "Ma pierścienie"},
    "cieloPlFuente": {"es": "Cifras de la NASA (NSSDCA), {f}:", "en": "Figures from NASA (NSSDCA), {f}:", "fr": "Chiffres de la NASA (NSSDCA), {f} :", "de": "Zahlen der NASA (NSSDCA), {f}:", "it": "Dati della NASA (NSSDCA), {f}:", "nl": "Cijfers van NASA (NSSDCA), {f}:", "zh": "NASA（NSSDCA）数据，{f}：", "zht": "NASA（NSSDCA）資料，{f}：", "bg": "Данни на NASA (NSSDCA), {f}:", "pl": "Dane NASA (NSSDCA), {f}:"},
    /* ── curiosidades ──────────────────────────────────────────────────────────── */
    "cieloCuriosidad": {"es": "¿Sabía que…?", "en": "Did you know?", "fr": "Le saviez-vous ?", "de": "Schon gewusst?", "it": "Lo sapevi?", "nl": "Wist je dat?", "zh": "你知道吗？", "zht": "你知道嗎？", "bg": "Знаете ли, че…?", "pl": "Czy wiesz, że…?"},
    "cieloCurFuente": {"es": "Fuente: {f}", "en": "Source: {f}", "fr": "Source : {f}", "de": "Quelle: {f}", "it": "Fonte: {f}", "nl": "Bron: {f}", "zh": "来源：{f}", "zht": "來源：{f}", "bg": "Източник: {f}", "pl": "Źródło: {f}"},
    /* 22-10-2026, sexto bloque: con mas de una fuente, en plural (las constelaciones
       llevan tres o cuatro; Tiangong, el Hubble y varias lluvias, dos) */
    "cieloCurFuentes": {"es": "Fuentes: {f}", "en": "Sources: {f}", "fr": "Sources : {f}", "de": "Quellen: {f}", "it": "Fonti: {f}", "nl": "Bronnen: {f}", "zh": "来源：{f}", "zht": "來源：{f}", "bg": "Източници: {f}", "pl": "Źródła: {f}"},
    "cieloCurMercury": {"es": "Es el planeta más pequeño y el más rápido: {v} km/s alrededor del Sol. Gira tan despacio que uno de sus días, de mediodía a mediodía, dura {d}: dos de sus años ({a}).", "en": "It is the smallest planet and the fastest: {v} km/s around the Sun. It spins so slowly that one of its days, noon to noon, lasts {d}: two of its years ({a}).", "fr": "C’est la plus petite planète et la plus rapide : {v} km/s autour du Soleil. Elle tourne si lentement qu’un de ses jours, de midi à midi, dure {d} : deux de ses années ({a}).", "de": "Er ist der kleinste und der schnellste Planet: {v} km/s um die Sonne. Er dreht sich so langsam, dass einer seiner Tage, von Mittag zu Mittag, {d} dauert: zwei seiner Jahre ({a}).", "it": "È il pianeta più piccolo e il più veloce: {v} km/s intorno al Sole. Ruota così lentamente che un suo giorno, da mezzogiorno a mezzogiorno, dura {d}: due dei suoi anni ({a}).", "nl": "Het is de kleinste en de snelste planeet: {v} km/s rond de zon. Hij draait zo langzaam dat één van zijn dagen, van middag tot middag, {d} duurt: twee van zijn jaren ({a}).", "zh": "它是最小、也是跑得最快的行星：绕太阳每秒 {v} 公里。它自转极慢，从正午到正午的一天长达 {d}，等于它的两年（{a}）。", "zht": "它是最小、也是跑得最快的行星：繞太陽每秒 {v} 公里。它自轉極慢，從正午到正午的一天長達 {d}，等於它的兩年（{a}）。", "bg": "Това е най-малката и най-бързата планета: {v} km/s около Слънцето. Върти се толкова бавно, че един неин ден, от пладне до пладне, трае {d}: две нейни години ({a}).", "pl": "To najmniejsza i najszybsza planeta: {v} km/s wokół Słońca. Obraca się tak wolno, że jedna jej doba, od południa do południa, trwa {d}: dwa jej lata ({a})."},
    "cieloCurVenus": {"es": "Gira al revés, como Urano, y tan despacio que tarda {d} en dar una vuelta sobre sí mismo: más que en dar la vuelta al Sol ({a}). Es el planeta más caliente, {t} °C de media, más que Mercurio, bajo una atmósfera de {p} bares.", "en": "It spins backwards, like Uranus, and so slowly that one turn on its axis takes {d}: longer than its trip around the Sun ({a}). It is the hottest planet, {t} °C on average, hotter than Mercury, under an atmosphere of {p} bars.", "fr": "Elle tourne à l’envers, comme Uranus, et si lentement qu’un tour sur elle-même lui prend {d} : plus que son tour du Soleil ({a}). C’est la planète la plus chaude, {t} °C en moyenne, plus que Mercure, sous une atmosphère de {p} bars.", "de": "Sie dreht sich andersherum, wie Uranus, und so langsam, dass eine Umdrehung {d} dauert: länger als ihr Umlauf um die Sonne ({a}). Sie ist der heißeste Planet, im Mittel {t} °C, heißer als Merkur, unter einer Atmosphäre von {p} bar.", "it": "Ruota al contrario, come Urano, e così lentamente che un giro su sé stesso dura {d}: più del suo giro intorno al Sole ({a}). È il pianeta più caldo, {t} °C in media, più di Mercurio, sotto un’atmosfera di {p} bar.", "nl": "Hij draait andersom, net als Uranus, en zo langzaam dat één draai om zijn as {d} duurt: langer dan zijn rondje om de zon ({a}). Het is de heetste planeet, gemiddeld {t} °C, heter dan Mercurius, onder een atmosfeer van {p} bar.", "zh": "它和天王星一样反向自转，而且极慢：自转一周要 {d}，比绕太阳一周（{a}）还长。它是最热的行星，平均 {t} °C，比水星还热，大气压高达 {p} 巴。", "zht": "它和天王星一樣反向自轉，而且極慢：自轉一周要 {d}，比繞太陽一周（{a}）還長。它是最熱的行星，平均 {t} °C，比水星還熱，大氣壓高達 {p} 巴。", "bg": "Върти се в обратна посока, като Уран, и толкова бавно, че едно завъртане около оста ѝ отнема {d}: повече от обиколката ѝ около Слънцето ({a}). Тя е най-горещата планета, средно {t} °C, по-гореща от Меркурий, под атмосфера от {p} бара.", "pl": "Obraca się w przeciwną stronę, jak Uran, i tak wolno, że jeden obrót wokół osi trwa {d}: dłużej niż jej okrążenie Słońca ({a}). To najgorętsza planeta, średnio {t} °C, goręcej niż na Merkurym, pod atmosferą o ciśnieniu {p} bar."},
    "cieloCurEarth": {"es": "La Tierra va a {v} km/s alrededor del Sol, {kmh} km/h: mientras lee esta frase ha recorrido más de cien kilómetros.", "en": "Earth travels round the Sun at {v} km/s, {kmh} km/h: while you read this sentence it has covered more than a hundred kilometres.", "fr": "La Terre file autour du Soleil à {v} km/s, {kmh} km/h : le temps de lire cette phrase, elle a parcouru plus de cent kilomètres.", "de": "Die Erde läuft mit {v} km/s um die Sonne, {kmh} km/h: während du diesen Satz liest, hat sie über hundert Kilometer zurückgelegt.", "it": "La Terra gira intorno al Sole a {v} km/s, {kmh} km/h: mentre leggi questa frase ha percorso più di cento chilometri.", "nl": "De aarde reist met {v} km/s rond de zon, {kmh} km/u: terwijl je deze zin leest heeft ze meer dan honderd kilometer afgelegd.", "zh": "地球以每秒 {v} 公里（每小时 {kmh} 公里）绕太阳运行：你读完这句话的工夫，它已经走了一百多公里。", "zht": "地球以每秒 {v} 公里（每小時 {kmh} 公里）繞太陽運行：你讀完這句話的工夫，它已經走了一百多公里。", "bg": "Земята обикаля Слънцето с {v} km/s, {kmh} km/h: докато четете това изречение, е изминала повече от сто километра.", "pl": "Ziemia pędzi wokół Słońca z prędkością {v} km/s, {kmh} km/h: zanim przeczytasz to zdanie, przebędzie ponad sto kilometrów."},
    "cieloCurMars": {"es": "Su día dura casi como el nuestro ({d}), pero su año, {a}. Tiene dos lunas pequeñas, Fobos (26 km de largo) y Deimos (16 km), y una temperatura media de {t} °C.", "en": "Its day is almost as long as ours ({d}), but its year lasts {a}. It has two small moons, Phobos (26 km long) and Deimos (16 km), and a mean temperature of {t} °C.", "fr": "Son jour dure presque autant que le nôtre ({d}), mais son année, {a}. Il a deux petites lunes, Phobos (26 km de long) et Deimos (16 km), et une température moyenne de {t} °C.", "de": "Sein Tag ist fast so lang wie unserer ({d}), sein Jahr aber dauert {a}. Er hat zwei kleine Monde, Phobos (26 km lang) und Deimos (16 km), und eine Mitteltemperatur von {t} °C.", "it": "Il suo giorno dura quasi quanto il nostro ({d}), ma il suo anno {a}. Ha due piccole lune, Fobos (26 km di lunghezza) e Deimos (16 km), e una temperatura media di {t} °C.", "nl": "Zijn dag duurt bijna even lang als de onze ({d}), maar zijn jaar {a}. Hij heeft twee kleine manen, Phobos (26 km lang) en Deimos (16 km), en een gemiddelde temperatuur van {t} °C.", "zh": "它的一天几乎和我们一样长（{d}），但一年长达 {a}。它有两颗小卫星——火卫一（长 26 公里）和火卫二（16 公里），平均温度 {t} °C。", "zht": "它的一天幾乎和我們一樣長（{d}），但一年長達 {a}。它有兩顆小衛星——火衛一（長 26 公里）和火衛二（16 公里），平均溫度 {t} °C。", "bg": "Денят му трае почти колкото нашия ({d}), но годината му – {a}. Има две малки луни – Фобос (26 km дълъг) и Деймос (16 km) – и средна температура {t} °C.", "pl": "Jego doba trwa niemal tyle co nasza ({d}), ale rok {a}. Ma dwa małe księżyce, Fobosa (26 km długości) i Deimosa (16 km), i średnią temperaturę {t} °C."},
    "cieloCurJupiter": {"es": "El mayor de todos: {x} veces el diámetro de la Tierra. Y el que más deprisa gira: un día suyo dura {d}. Tiene {n} lunas conocidas.", "en": "The biggest of all: {x} times Earth’s diameter. And the fastest spinner: one of its days lasts {d}. It has {n} known moons.", "fr": "La plus grosse de toutes : {x} fois le diamètre de la Terre. Et celle qui tourne le plus vite : un de ses jours dure {d}. Elle a {n} lunes connues.", "de": "Der größte von allen: das {x}-Fache des Erddurchmessers. Und der schnellste Dreher: einer seiner Tage dauert {d}. Er hat {n} bekannte Monde.", "it": "Il più grande di tutti: {x} volte il diametro della Terra. E quello che ruota più in fretta: un suo giorno dura {d}. Ha {n} lune conosciute.", "nl": "De grootste van allemaal: {x} keer de diameter van de aarde. En de snelste draaier: één van zijn dagen duurt {d}. Hij heeft {n} bekende manen.", "zh": "它是最大的行星：直径是地球的 {x} 倍。也是自转最快的：一天只有 {d}。已知卫星 {n} 颗。", "zht": "它是最大的行星：直徑是地球的 {x} 倍。也是自轉最快的：一天只有 {d}。已知衛星 {n} 顆。", "bg": "Най-голямата от всички: {x} пъти диаметъра на Земята. И най-бързо въртящата се: един неин ден трае {d}. Има {n} известни луни.", "pl": "Największa ze wszystkich: {x} razy średnica Ziemi. I najszybciej wirująca: jej doba trwa {d}. Liczba znanych księżyców: {n}."},
    "cieloCurSaturn": {"es": "Es menos denso que el agua ({den} kg/m³ frente a 1.000): flotaría en un mar lo bastante grande. Tiene {n} lunas conocidas, más que ningún otro planeta.", "en": "It is less dense than water ({den} kg/m³ against 1,000): it would float in a big enough sea. It has {n} known moons, more than any other planet.", "fr": "Elle est moins dense que l’eau ({den} kg/m³ contre 1 000) : elle flotterait dans une mer assez grande. Elle a {n} lunes connues, plus que toute autre planète.", "de": "Er ist weniger dicht als Wasser ({den} kg/m³ gegenüber 1.000): In einem genügend großen Meer würde er schwimmen. Er hat {n} bekannte Monde, mehr als jeder andere Planet.", "it": "È meno denso dell’acqua ({den} kg/m³ contro 1.000): galleggerebbe in un mare abbastanza grande. Ha {n} lune conosciute, più di qualsiasi altro pianeta.", "nl": "Hij is minder dicht dan water ({den} kg/m³ tegenover 1.000): in een zee die groot genoeg is zou hij blijven drijven. Hij heeft {n} bekende manen, meer dan welke andere planeet ook.", "zh": "它的密度比水还小（{den} 公斤/立方米，水是 1000）：放进足够大的海里会浮起来。已知卫星 {n} 颗，比任何行星都多。", "zht": "它的密度比水還小（{den} 公斤/立方公尺，水是 1000）：放進夠大的海裡會浮起來。已知衛星 {n} 顆，比任何行星都多。", "bg": "По-малко плътен е от водата ({den} kg/m³ срещу 1000): би плавал в достатъчно голямо море. Има {n} известни луни, повече от всяка друга планета.", "pl": "Ma gęstość mniejszą niż woda ({den} kg/m³ wobec 1000): w dostatecznie dużym morzu by pływał. Liczba znanych księżyców: {n}, więcej niż u jakiejkolwiek innej planety."},
    "cieloCurUranus": {"es": "Gira tumbado: su eje está inclinado {o}° (el de la Tierra, 23°). Un año suyo dura {a}.", "en": "It spins on its side: its axis is tilted {o}° (Earth’s, 23°). One of its years lasts {a}.", "fr": "Elle tourne couchée : son axe est incliné de {o}° (celui de la Terre, 23°). Une de ses années dure {a}.", "de": "Er dreht sich liegend: Seine Achse ist um {o}° geneigt (die der Erde um 23°). Eines seiner Jahre dauert {a}.", "it": "Ruota sdraiato: il suo asse è inclinato di {o}° (quello della Terra, 23°). Un suo anno dura {a}.", "nl": "Hij draait op zijn kant: zijn as staat {o}° scheef (die van de aarde 23°). Eén van zijn jaren duurt {a}.", "zh": "它是“躺着”自转的：自转轴倾斜 {o}°（地球是 23°）。它的一年长达 {a}。", "zht": "它是「躺著」自轉的：自轉軸傾斜 {o}°（地球是 23°）。它的一年長達 {a}。", "bg": "Върти се легнал: оста му е наклонена на {o}° (земната – на 23°). Една негова година трае {a}.", "pl": "Obraca się „na leżąco”: jego oś jest nachylona o {o}° (ziemska o 23°). Jego rok trwa {a}."},
    "cieloCurNeptune": {"es": "El más lejano: la luz del Sol tarda {t} en llegarle, y un año suyo dura {a}. Con {temp} °C de media, es el más frío.", "en": "The farthest: sunlight takes {t} to reach it, and one of its years lasts {a}. At {temp} °C on average, it is the coldest.", "fr": "La plus lointaine : la lumière du Soleil met {t} à l’atteindre, et une de ses années dure {a}. Avec {temp} °C en moyenne, c’est la plus froide.", "de": "Der fernste: Das Sonnenlicht braucht {t} bis zu ihm, und eines seiner Jahre dauert {a}. Mit im Mittel {temp} °C ist er der kälteste.", "it": "Il più lontano: la luce del Sole impiega {t} ad arrivarci, e un suo anno dura {a}. Con {temp} °C di media, è il più freddo.", "nl": "De verste: zonlicht doet er {t} over om hem te bereiken, en één van zijn jaren duurt {a}. Met gemiddeld {temp} °C is hij de koudste.", "zh": "它最遥远：阳光要 {t} 才能到达，它的一年长达 {a}。平均 {temp} °C，是最冷的行星。", "zht": "它最遙遠：陽光要 {t} 才能到達，它的一年長達 {a}。平均 {temp} °C，是最冷的行星。", "bg": "Най-далечната: слънчевата светлина стига до нея за {t}, а една нейна година трае {a}. Със средно {temp} °C е най-студената.", "pl": "Najdalszy: światło słoneczne dociera do niego po {t}, a jego rok trwa {a}. Przy średnio {temp} °C jest najzimniejszy."},
    "cieloCurSun": {"es": "Es una estrella: tiene {r} veces el radio de la Tierra y {m} veces su masa (más del 99 % de toda la masa del sistema solar), y unos {t} °C en la superficie. No gira de una pieza: a 16° del ecuador da una vuelta en {d}; en el ecuador, más deprisa, y cerca de los polos, más despacio.", "en": "It is a star: it has {r} times Earth’s radius and {m} times its mass (over 99 % of all the mass in the solar system), and about {t} °C at the surface. It does not turn as one piece: at 16° from its equator one turn takes {d}; at the equator it is quicker, and near the poles slower.", "fr": "C’est une étoile : elle a {r} fois le rayon de la Terre et {m} fois sa masse (plus de 99 % de toute la masse du système solaire), et environ {t} °C en surface. Elle ne tourne pas d’un seul bloc : à 16° de l’équateur, un tour lui prend {d} ; à l’équateur, c’est plus rapide, et près des pôles, plus lent.", "de": "Sie ist ein Stern: Sie hat den {r}-fachen Erdradius und die {m}-fache Erdmasse (über 99 % der gesamten Masse des Sonnensystems) und etwa {t} °C an der Oberfläche. Sie dreht sich nicht als Ganzes: 16° vom Äquator entfernt dauert eine Umdrehung {d}, am Äquator geht es schneller, nahe den Polen langsamer.", "it": "È una stella: ha {r} volte il raggio della Terra e {m} volte la sua massa (più del 99 % di tutta la massa del sistema solare), e circa {t} °C in superficie. Non ruota tutto insieme: a 16° dall’equatore fa un giro in {d}; all’equatore più in fretta, vicino ai poli più lentamente.", "nl": "Het is een ster: ze heeft {r} keer de straal van de aarde en {m} keer haar massa (meer dan 99 % van alle massa in het zonnestelsel), en zo’n {t} °C aan het oppervlak. Ze draait niet als één geheel: op 16° van de evenaar duurt één draai {d}; aan de evenaar gaat het sneller, bij de polen langzamer.", "zh": "它是一颗恒星：半径是地球的 {r} 倍，质量是地球的 {m} 倍（占太阳系全部质量的 99% 以上），表面约 {t} °C。它并不是整体一起转的：在离赤道 16° 处，自转一周需要 {d}；赤道上转得更快，两极附近更慢。", "zht": "它是一顆恆星：半徑是地球的 {r} 倍，質量是地球的 {m} 倍（占太陽系全部質量的 99% 以上），表面約 {t} °C。它並不是整體一起轉的：在離赤道 16° 處，自轉一周需要 {d}；赤道上轉得更快，兩極附近更慢。", "bg": "Звезда е: има {r} пъти радиуса на Земята и {m} пъти масата ѝ (над 99 % от цялата маса на Слънчевата система) и около {t} °C на повърхността. Не се върти като едно цяло: на 16° от екватора се завърта за {d}; на екватора – по-бързо, а близо до полюсите – по-бавно.", "pl": "To gwiazda: ma {r} razy większy promień niż Ziemia i {m} razy większą masę (ponad 99 % całej masy Układu Słonecznego) oraz około {t} °C na powierzchni. Nie obraca się jako całość: 16° od równika jeden obrót trwa {d}; na równiku szybciej, a przy biegunach wolniej."},
    "cieloCurMoon": {"es": "Siempre nos enseña la misma cara: tarda lo mismo en girar sobre sí misma que en dar la vuelta a la Tierra ({d}). Se aleja de nosotros 3,8 cm al año. Y como casi no tiene atmósfera, las huellas de los astronautas del Apolo seguirán allí mucho tiempo.", "en": "It always shows us the same face: it takes as long to spin once as to go round the Earth ({d}). It drifts away from us by 3.8 cm a year. And since it has almost no atmosphere, the Apollo astronauts’ footprints will stay there for a long time.", "fr": "Elle nous montre toujours la même face : elle met autant de temps à tourner sur elle-même qu’à faire le tour de la Terre ({d}). Elle s’éloigne de nous de 3,8 cm par an. Et comme elle n’a presque pas d’atmosphère, les empreintes des astronautes d’Apollo y resteront très longtemps.", "de": "Er zeigt uns immer dieselbe Seite: Für eine Drehung um sich selbst braucht er so lange wie für einen Umlauf um die Erde ({d}). Er entfernt sich jedes Jahr 3,8 cm von uns. Und da er fast keine Atmosphäre hat, bleiben die Fußabdrücke der Apollo-Astronauten noch sehr lange erhalten.", "it": "Ci mostra sempre la stessa faccia: impiega lo stesso tempo a ruotare su sé stessa e a girare intorno alla Terra ({d}). Si allontana da noi di 3,8 cm all’anno. E siccome quasi non ha atmosfera, le impronte degli astronauti dell’Apollo resteranno lì per molto tempo.", "nl": "Ze laat ons altijd dezelfde kant zien: ze doet even lang over één draai om haar as als over één rondje om de aarde ({d}). Ze drijft elk jaar 3,8 cm van ons weg. En omdat ze bijna geen atmosfeer heeft, blijven de voetafdrukken van de Apollo-astronauten er nog heel lang staan.", "zh": "它永远以同一面朝向我们：自转一周和绕地球一周用的时间一样（{d}）。它每年远离我们 3.8 厘米。而且因为几乎没有大气，阿波罗宇航员留下的脚印还会在那里保存很久很久。", "zht": "它永遠以同一面朝向我們：自轉一周和繞地球一周用的時間一樣（{d}）。它每年遠離我們 3.8 公分。而且因為幾乎沒有大氣，阿波羅太空人留下的腳印還會在那裡保存很久很久。", "bg": "Винаги ни показва една и съща страна: завърта се около оста си за същото време, за което обикаля Земята ({d}). Отдалечава се от нас с 3,8 cm годишно. И понеже почти няма атмосфера, стъпките на астронавтите от „Аполо“ ще останат там още дълго.", "pl": "Zawsze pokazuje nam tę samą stronę: obraca się wokół osi w tym samym czasie, w jakim okrąża Ziemię ({d}). Oddala się od nas o 3,8 cm rocznie. A ponieważ prawie nie ma atmosfery, ślady stóp astronautów Apollo pozostaną tam bardzo długo."},
    "cieloLunaPerigeo": {"es": "Lo más cerca (perigeo): {f}, a {km} km", "en": "Closest (perigee): {f}, at {km} km", "fr": "Au plus près (périgée) : {f}, à {km} km", "de": "Am nächsten (Perigäum): {f}, in {km} km", "it": "Più vicina (perigeo): {f}, a {km} km", "nl": "Dichtstbij (perigeum): {f}, op {km} km", "zh": "最近（近地点）：{f}，{km} 公里", "zht": "最近（近地點）：{f}，{km} 公里", "bg": "Най-близо (перигей): {f}, на {km} km", "pl": "Najbliżej (perygeum): {f}, {km} km"},
    "cieloLunaApogeo": {"es": "Lo más lejos (apogeo): {f}, a {km} km", "en": "Farthest (apogee): {f}, at {km} km", "fr": "Au plus loin (apogée) : {f}, à {km} km", "de": "Am fernsten (Apogäum): {f}, in {km} km", "it": "Più lontana (apogeo): {f}, a {km} km", "nl": "Verst weg (apogeum): {f}, op {km} km", "zh": "最远（远地点）：{f}，{km} 公里", "zht": "最遠（遠地點）：{f}，{km} 公里", "bg": "Най-далеч (апогей): {f}, на {km} km", "pl": "Najdalej (apogeum): {f}, {km} km"},
    "cieloCurSur": {"es": "Nunca sale al norte de los {lat}° de latitud (Madrid está a 40°; París, a 49°). Desde Tenerife ({t}°) sí: llega a {a}° sobre el horizonte sur.", "en": "It never rises north of latitude {lat}° (Madrid is at 40°; Paris, at 49°). From Tenerife ({t}°) it does: it climbs to {a}° above the southern horizon.", "fr": "Il ne se lève jamais au nord de la latitude {lat}° (Madrid est à 40° ; Paris, à 49°). Depuis Tenerife ({t}°), si : il monte à {a}° au-dessus de l’horizon sud.", "de": "Nördlich von {lat}° Breite geht er nie auf (Madrid liegt bei 40°, Paris bei 49°). Von Teneriffa ({t}°) aus schon: Er steigt bis {a}° über den Südhorizont.", "it": "Non sorge mai a nord della latitudine {lat}° (Madrid è a 40°; Parigi, a 49°). Da Tenerife ({t}°) sì: arriva a {a}° sopra l’orizzonte sud.", "nl": "Ten noorden van {lat}° breedte komt hij nooit op (Madrid ligt op 40°; Parijs op 49°). Vanaf Tenerife ({t}°) wel: hij klimt tot {a}° boven de zuidelijke horizon.", "zh": "在北纬 {lat}° 以北永远升不起来（马德里在 40°，巴黎在 49°）。在特内里费（{t}°）可以：最高升到南方地平线上 {a}°。", "zht": "在北緯 {lat}° 以北永遠升不起來（馬德里在 40°，巴黎在 49°）。在特內里費（{t}°）可以：最高升到南方地平線上 {a}°。", "bg": "Никога не изгрява на север от {lat}° ширина (Мадрид е на 40°; Париж – на 49°). От Тенерифе ({t}°) – да: издига се до {a}° над южния хоризонт.", "pl": "Nigdy nie wschodzi na północ od szerokości {lat}° (Madryt leży na 40°; Paryż na 49°). Z Teneryfy ({t}°) tak: wznosi się na {a}° nad południowy horyzont."},
    "cieloCurPolar": {"es": "Su altura sobre el horizonte, {a}°, es la latitud del lugar. Apenas se mueve en toda la noche.", "en": "Its height above the horizon, {a}°, is the latitude of the place. It hardly moves all night.", "fr": "Sa hauteur au-dessus de l’horizon, {a}°, est la latitude du lieu. Elle bouge à peine de toute la nuit.", "de": "Seine Höhe über dem Horizont, {a}°, ist die Breite des Ortes. Die ganze Nacht über bewegt er sich kaum.", "it": "La sua altezza sull’orizzonte, {a}°, è la latitudine del luogo. Si muove appena per tutta la notte.", "nl": "Zijn hoogte boven de horizon, {a}°, is de breedtegraad van de plek. Hij beweegt de hele nacht nauwelijks.", "zh": "它离地平线的高度 {a}° 就是当地的纬度。整夜几乎不动。", "zht": "它離地平線的高度 {a}° 就是當地的緯度。整夜幾乎不動。", "bg": "Височината ѝ над хоризонта, {a}°, е географската ширина на мястото. През цялата нощ почти не се движи.", "pl": "Jej wysokość nad horyzontem, {a}°, to szerokość geograficzna miejsca. Przez całą noc prawie się nie rusza."},
    "cieloCurIss": {"es": "Va a unos 8 km/s y da la vuelta a la Tierra cada 90 minutos: sus astronautas ven 16 amaneceres al día. Mide 109 m de punta a punta, como un campo de fútbol americano, y lleva gente a bordo sin interrupción desde noviembre de 2000.", "en": "It moves at about 8 km/s and circles the Earth every 90 minutes: its astronauts see 16 sunrises a day. It is 109 m end to end, the length of an American football field, and has had people aboard without a break since November 2000.", "fr": "Elle file à environ 8 km/s et fait le tour de la Terre toutes les 90 minutes : ses astronautes voient 16 levers de soleil par jour. Elle mesure 109 m d’un bout à l’autre, comme un terrain de football américain, et est habitée sans interruption depuis novembre 2000.", "de": "Sie fliegt mit rund 8 km/s und umrundet die Erde alle 90 Minuten: Ihre Astronauten sehen 16 Sonnenaufgänge am Tag. Sie misst 109 m von einem Ende zum anderen, so lang wie ein American-Football-Feld, und ist seit November 2000 ununterbrochen bewohnt.", "it": "Viaggia a circa 8 km/s e gira intorno alla Terra ogni 90 minuti: i suoi astronauti vedono 16 albe al giorno. Misura 109 m da un capo all’altro, come un campo di football americano, ed è abitata senza interruzione dal novembre 2000.", "nl": "Hij gaat zo’n 8 km/s en draait elke 90 minuten rond de aarde: zijn astronauten zien 16 zonsopgangen per dag. Hij is 109 m lang, zo lang als een American-footballveld, en is sinds november 2000 onafgebroken bewoond.", "zh": "它以约每秒 8 公里飞行，每 90 分钟绕地球一圈：站上的宇航员一天能看 16 次日出。它首尾长 109 米，相当于一个美式橄榄球场，自 2000 年 11 月起一直有人驻守。", "zht": "它以約每秒 8 公里飛行，每 90 分鐘繞地球一圈：站上的太空人一天能看 16 次日出。它首尾長 109 公尺，相當於一個美式足球場，自 2000 年 11 月起一直有人駐守。", "bg": "Лети с около 8 km/s и обикаля Земята на всеки 90 минути: астронавтите ѝ виждат 16 изгрева на ден. Дълга е 109 m от край до край, колкото игрище за американски футбол, и има хора на борда без прекъсване от ноември 2000 г.", "pl": "Pędzi około 8 km/s i okrąża Ziemię co 90 minut: jej astronauci widzą 16 wschodów słońca dziennie. Mierzy 109 m od końca do końca, tyle co boisko do futbolu amerykańskiego, i od listopada 2000 r. nieprzerwanie ma ludzi na pokładzie."},
    "cieloCurTiangong": {"es": "Tiangong significa «palacio celestial». Su primer módulo, Tianhe, subió el 29 de abril de 2021 y la estación se completó en 2022 con tres módulos; su volumen presurizado es poco más de un tercio del de la Estación Espacial Internacional. Suelen vivir en ella tres astronautas, en estancias de seis meses.", "en": "Tiangong means “Heavenly Palace”. Its first module, Tianhe, went up on 29 April 2021 and the station was completed in 2022 with three modules; its pressurised volume is just over a third of the International Space Station’s. Three astronauts usually live aboard, on six-month stays.", "fr": "Tiangong signifie « palais céleste ». Son premier module, Tianhe, a été lancé le 29 avril 2021 et la station a été achevée en 2022 avec trois modules ; son volume pressurisé est d’un peu plus du tiers de celui de la Station spatiale internationale. Trois astronautes y vivent habituellement, pour des séjours de six mois.", "de": "Tiangong bedeutet „Himmelspalast“. Ihr erstes Modul, Tianhe, startete am 29. April 2021, und 2022 war die Station mit drei Modulen fertig; ihr unter Druck stehendes Volumen ist gut ein Drittel dessen der Internationalen Raumstation. Meist leben drei Astronauten an Bord, jeweils sechs Monate lang.", "it": "Tiangong significa «palazzo celeste». Il suo primo modulo, Tianhe, è salito il 29 aprile 2021 e la stazione è stata completata nel 2022 con tre moduli; il suo volume pressurizzato è poco più di un terzo di quello della Stazione Spaziale Internazionale. Di solito ci vivono tre astronauti, per soggiorni di sei mesi.", "nl": "Tiangong betekent “hemels paleis”. De eerste module, Tianhe, ging op 29 april 2021 omhoog en in 2022 was het station met drie modules compleet; het volume onder druk is ruim een derde van dat van het Internationale Ruimtestation. Meestal wonen er drie astronauten, telkens zes maanden.", "zh": "“天宫”的意思是天上的宫殿。它的第一个舱段“天和”于 2021 年 4 月 29 日升空，2022 年三舱组合完成；加压空间略多于国际空间站的三分之一。通常有三名航天员在站上驻留六个月。", "zht": "「天宮」的意思是天上的宮殿。它的第一個艙段「天和」於 2021 年 4 月 29 日升空，2022 年三艙組合完成；加壓空間略多於國際太空站的三分之一。通常有三名太空人在站上駐留六個月。", "bg": "Тиангун означава „небесен дворец“. Първият му модул, Тианхъ, излетя на 29 април 2021 г., а станцията бе завършена през 2022 г. с три модула; херметизираният ѝ обем е малко над една трета от този на Международната космическа станция. Обикновено на борда живеят трима астронавти, по шест месеца.", "pl": "Tiangong znaczy „niebiański pałac”. Jej pierwszy moduł, Tianhe, poleciał 29 kwietnia 2021 r., a stację ukończono w 2022 r. z trzech modułów; jej objętość hermetyczna to nieco ponad jedna trzecia objętości Międzynarodowej Stacji Kosmicznej. Zwykle mieszka na niej trzech astronautów, w półrocznych turach."},
    "cieloCurHubble": {"es": "Lo lanzó el transbordador Discovery el 24 de abril de 1990 y lo soltó al día siguiente a unos 610 km de altura; desde entonces ha ido bajando (arriba tiene la altura de hoy). Mide 13 m de largo, como un autobús grande, y lleva hechas más de 1,2 millones de observaciones.", "en": "The shuttle Discovery launched it on 24 April 1990 and released it the next day about 610 km up; it has been slowly coming down ever since (today’s altitude is above). It is 13 m long, the size of a large bus, and has made more than 1.2 million observations.", "fr": "La navette Discovery l’a lancé le 24 avril 1990 et l’a déposé le lendemain à environ 610 km d’altitude ; depuis, il descend peu à peu (l’altitude d’aujourd’hui est ci-dessus). Il mesure 13 m de long, comme un grand autobus, et a réalisé plus de 1,2 million d’observations.", "de": "Das Shuttle Discovery startete ihn am 24. April 1990 und setzte ihn am nächsten Tag in rund 610 km Höhe aus; seitdem sinkt er langsam (die heutige Höhe steht oben). Er ist 13 m lang, so groß wie ein großer Bus, und hat über 1,2 Millionen Beobachtungen gemacht.", "it": "Lo ha lanciato lo shuttle Discovery il 24 aprile 1990, rilasciandolo il giorno dopo a circa 610 km di quota; da allora è andato scendendo (la quota di oggi è qui sopra). È lungo 13 m, come un grande autobus, e ha fatto più di 1,2 milioni di osservazioni.", "nl": "Het ruimteveer Discovery lanceerde hem op 24 april 1990 en zette hem de dag erna op zo’n 610 km hoogte uit; sindsdien zakt hij langzaam (de hoogte van vandaag staat hierboven). Hij is 13 m lang, zo groot als een grote bus, en heeft meer dan 1,2 miljoen waarnemingen gedaan.", "zh": "1990 年 4 月 24 日由“发现号”航天飞机发射，次日释放在约 610 公里的高度；此后一直在缓慢下降（上面是它今天的高度）。它长 13 米，像一辆大巴，已完成 120 万多次观测。", "zht": "1990 年 4 月 24 日由「發現號」太空梭發射，次日釋放在約 610 公里的高度；此後一直在緩慢下降（上面是它今天的高度）。它長 13 公尺，像一輛大巴士，已完成 120 萬多次觀測。", "bg": "Изведен е от совалката „Дискавъри“ на 24 април 1990 г. и освободен на следващия ден на около 610 km височина; оттогава бавно се снижава (днешната височина е по-горе). Дълъг е 13 m, колкото голям автобус, и има над 1,2 милиона наблюдения.", "pl": "Wyniósł go prom Discovery 24 kwietnia 1990 r. i uwolnił następnego dnia na wysokości około 610 km; od tamtej pory powoli opada (dzisiejsza wysokość jest wyżej). Ma 13 m długości, jak duży autobus, i wykonał ponad 1,2 miliona obserwacji."},
    "cieloLluviaPadreCometa": {"es": "Son restos del cometa {p}.", "en": "They are debris from comet {p}.", "fr": "Ce sont des débris de la comète {p}.", "de": "Es sind Reste des Kometen {p}.", "it": "Sono detriti della cometa {p}.", "nl": "Het zijn resten van komeet {p}.", "zh": "它们是彗星 {p} 留下的碎屑。", "zht": "它們是彗星 {p} 留下的碎屑。", "bg": "Това са остатъци от кометата {p}.", "pl": "To pozostałości komety {p}."},
    /* las Delta Acuaridas: la NASA da 96P/Machholz como «suspected» (y la tabla
       de Wikipedia, P/2008 Y12): «se cree», como su curiosidad (22-10-2026) */
    "cieloLluviaPadreCreeCometa": {"es": "Se cree que son restos del cometa {p}.", "en": "They are thought to be debris from comet {p}.", "fr": "On pense que ce sont des débris de la comète {p}.", "de": "Vermutlich sind es Reste des Kometen {p}.", "it": "Si pensa che siano detriti della cometa {p}.", "nl": "Vermoedelijk zijn het resten van komeet {p}.", "zh": "一般认为它们是彗星 {p} 留下的碎屑。", "zht": "一般認為它們是彗星 {p} 留下的碎屑。", "bg": "Смята се, че това са остатъци от кометата {p}.", "pl": "Uważa się, że to pozostałości komety {p}."},
    "cieloLluviaPadreAsteroide": {"es": "Son restos del asteroide {p}.", "en": "They are debris from asteroid {p}.", "fr": "Ce sont des débris de l’astéroïde {p}.", "de": "Es sind Reste des Asteroiden {p}.", "it": "Sono detriti dell’asteroide {p}.", "nl": "Het zijn resten van planetoïde {p}.", "zh": "它们是小行星 {p} 留下的碎屑。", "zht": "它們是小行星 {p} 留下的碎屑。", "bg": "Това са остатъци от астероида {p}.", "pl": "To pozostałości planetoidy {p}."},
    /* ── la luz zodiacal y la sombra del Teide ─────────────────────────────────── */
    "cieloZodiacal": {"es": "Luz zodiacal", "en": "Zodiacal light", "fr": "Lumière zodiacale", "de": "Zodiakallicht", "it": "Luce zodiacale", "nl": "Zodiakaal licht", "zh": "黄道光", "zht": "黃道光", "bg": "Зодиакална светлина", "pl": "Światło zodiakalne"},
    "cieloZodiacalTarde": {"es": "Estas semanas, al acabar el crepúsculo, mire al oeste: una banda de luz tenue sube desde el horizonte siguiendo la eclíptica. Se cree que es luz del Sol reflejada en el polvo que dejan los cometas; hace falta un cielo oscuro y sin Luna, y el Teide lo tiene.", "en": "These weeks, once twilight is over, look west: a faint band of light rises from the horizon along the ecliptic. It is thought to be sunlight reflected by the dust left by comets; it needs a dark, moonless sky, and Teide has one.", "fr": "Ces semaines-ci, à la fin du crépuscule, regardez vers l’ouest : une bande de lumière ténue monte de l’horizon le long de l’écliptique. On pense que c’est la lumière du Soleil réfléchie par la poussière laissée par les comètes ; il faut un ciel sombre et sans Lune, et le Teide l’a.", "de": "In diesen Wochen schau nach Ende der Dämmerung nach Westen: Ein schwaches Lichtband steigt vom Horizont entlang der Ekliptik auf. Vermutlich ist es Sonnenlicht, das der Staub von Kometen zurückwirft; es braucht einen dunklen, mondlosen Himmel, und den hat der Teide.", "it": "In queste settimane, finito il crepuscolo, guarda a ovest: una tenue banda di luce sale dall’orizzonte lungo l’eclittica. Si pensa che sia luce del Sole riflessa dalla polvere lasciata dalle comete; serve un cielo buio e senza Luna, e il Teide ce l’ha.", "nl": "Kijk deze weken na het einde van de schemering naar het westen: een zwakke lichtband rijst vanaf de horizon op langs de ecliptica. Vermoedelijk is het zonlicht dat weerkaatst op stof van kometen; het vraagt een donkere, maanloze hemel, en die heeft de Teide.", "zh": "这几周，天色完全暗下来后向西看：一条微弱的光带沿黄道从地平线升起。一般认为那是阳光被彗星留下的尘埃反射回来的光；需要黑暗无月的天空，而泰德峰正有这样的天空。", "zht": "這幾週，天色完全暗下來後向西看：一條微弱的光帶沿黃道從地平線升起。一般認為那是陽光被彗星留下的塵埃反射回來的光；需要黑暗無月的天空，而泰德峰正有這樣的天空。", "bg": "През тези седмици, щом здрачът свърши, погледнете на запад: слаба ивица светлина се издига от хоризонта по еклиптиката. Смята се, че това е слънчева светлина, отразена от праха, оставен от кометите; трябва тъмно небе без Луна, а Тейде го има.", "pl": "W tych tygodniach, gdy skończy się zmierzch, spójrz na zachód: słaba smuga światła wznosi się znad horyzontu wzdłuż ekliptyki. Uważa się, że to światło słoneczne odbite od pyłu pozostawionego przez komety; potrzeba ciemnego, bezksiężycowego nieba, a Teide takie ma."},
    "cieloZodiacalManana": {"es": "Estas semanas, antes de que empiece a clarear, mire al este: una banda de luz tenue sube desde el horizonte siguiendo la eclíptica. Se cree que es luz del Sol reflejada en el polvo que dejan los cometas; hace falta un cielo oscuro y sin Luna, y el Teide lo tiene.", "en": "These weeks, before first light, look east: a faint band of light rises from the horizon along the ecliptic. It is thought to be sunlight reflected by the dust left by comets; it needs a dark, moonless sky, and Teide has one.", "fr": "Ces semaines-ci, avant les premières lueurs, regardez vers l’est : une bande de lumière ténue monte de l’horizon le long de l’écliptique. On pense que c’est la lumière du Soleil réfléchie par la poussière laissée par les comètes ; il faut un ciel sombre et sans Lune, et le Teide l’a.", "de": "In diesen Wochen schau vor dem ersten Morgenlicht nach Osten: Ein schwaches Lichtband steigt vom Horizont entlang der Ekliptik auf. Vermutlich ist es Sonnenlicht, das der Staub von Kometen zurückwirft; es braucht einen dunklen, mondlosen Himmel, und den hat der Teide.", "it": "In queste settimane, prima che inizi ad albeggiare, guarda a est: una tenue banda di luce sale dall’orizzonte lungo l’eclittica. Si pensa che sia luce del Sole riflessa dalla polvere lasciata dalle comete; serve un cielo buio e senza Luna, e il Teide ce l’ha.", "nl": "Kijk deze weken vóór het eerste ochtendlicht naar het oosten: een zwakke lichtband rijst vanaf de horizon op langs de ecliptica. Vermoedelijk is het zonlicht dat weerkaatst op stof van kometen; het vraagt een donkere, maanloze hemel, en die heeft de Teide.", "zh": "这几周，天亮之前向东看：一条微弱的光带沿黄道从地平线升起。一般认为那是阳光被彗星留下的尘埃反射回来的光；需要黑暗无月的天空，而泰德峰正有这样的天空。", "zht": "這幾週，天亮之前向東看：一條微弱的光帶沿黃道從地平線升起。一般認為那是陽光被彗星留下的塵埃反射回來的光；需要黑暗無月的天空，而泰德峰正有這樣的天空。", "bg": "През тези седмици, преди да започне да се развиделява, погледнете на изток: слаба ивица светлина се издига от хоризонта по еклиптиката. Смята се, че това е слънчева светлина, отразена от праха, оставен от кометите; трябва тъмно небе без Луна, а Тейде го има.", "pl": "W tych tygodniach, zanim zacznie świtać, spójrz na wschód: słaba smuga światła wznosi się znad horyzontu wzdłuż ekliptyki. Uważa się, że to światło słoneczne odbite od pyłu pozostawionego przez komety; potrzeba ciemnego, bezksiężycowego nieba, a Teide takie ma."},
    "cieloZodiacalCuando": {"es": "En las latitudes medias del norte se ve mejor por la tarde en febrero y marzo y de madrugada en septiembre y octubre; en los trópicos, donde la eclíptica está casi vertical, se ve con facilidad (Tenerife está a 28°). Esta noche la Luna {l}.", "en": "In mid-northern latitudes it is best seen in the evening in February and March and before dawn in September and October; in the tropics, where the ecliptic stands almost upright, it is easy to see (Tenerife is at 28°). Tonight the Moon {l}.", "fr": "Aux latitudes moyennes de l’hémisphère nord, on la voit le mieux le soir en février et mars et à l’aube en septembre et octobre ; sous les tropiques, où l’écliptique se dresse presque à la verticale, on la voit facilement (Tenerife est à 28°). Cette nuit, la Lune {l}.", "de": "In mittleren nördlichen Breiten sieht man es am besten abends im Februar und März und morgens im September und Oktober; in den Tropen, wo die Ekliptik fast senkrecht steht, ist es leicht zu sehen (Teneriffa liegt bei 28°). Heute Nacht {l} der Mond.", "it": "Alle medie latitudini settentrionali si vede meglio di sera a febbraio e marzo e all’alba a settembre e ottobre; ai tropici, dove l’eclittica si alza quasi verticale, si vede facilmente (Tenerife è a 28°). Stanotte la Luna {l}.", "nl": "Op gematigde noordelijke breedten is het het best te zien ’s avonds in februari en maart en voor dageraad in september en oktober; in de tropen, waar de ecliptica bijna rechtop staat, is het makkelijk te zien (Tenerife ligt op 28°). Vannacht {l} de maan.", "zh": "在北半球中纬度地区，二、三月的傍晚和九、十月的黎明前最容易看到；在热带，黄道几乎直立，很容易看到（特内里费在北纬 28°）。今晚月亮{l}。", "zht": "在北半球中緯度地區，二、三月的傍晚和九、十月的黎明前最容易看到；在熱帶，黃道幾乎直立，很容易看到（特內里費在北緯 28°）。今晚月亮{l}。", "bg": "В средните северни ширини се вижда най-добре вечер през февруари и март и призори през септември и октомври; в тропиците, където еклиптиката се издига почти отвесно, се вижда лесно (Тенерифе е на 28°). Тази нощ Луната {l}.", "pl": "Na średnich szerokościach północnych najlepiej widać je wieczorem w lutym i marcu oraz przed świtem we wrześniu i październiku; w tropikach, gdzie ekliptyka wznosi się niemal pionowo, widać je łatwo (Teneryfa leży na 28°). Dziś w nocy Księżyc {l}."},
    "cieloZodiacalLunaNo": {"es": "no molesta", "en": "does not get in the way", "fr": "ne gêne pas", "de": "stört nicht", "it": "non disturba", "nl": "zit niet in de weg", "zh": "不会干扰", "zht": "不會干擾", "bg": "не пречи", "pl": "nie przeszkadza"},
    "cieloZodiacalLunaSi": {"es": "la tapa con su luz", "en": "drowns it with its light", "fr": "la noie dans sa lumière", "de": "überstrahlt es", "it": "la copre con la sua luce", "nl": "overstraalt het", "zh": "的光会把它盖住", "zht": "的光會把它蓋住", "bg": "я заглушава със светлината си", "pl": "zagłuszy je swoim światłem"},
    "cieloSombraTeide": {"es": "Al amanecer y al atardecer (puesta de sol a las {h}), el Teide proyecta una sombra triangular que llega hasta el horizonte. El triángulo es un efecto de perspectiva, como las vías de un tren que parecen juntarse a lo lejos: desde las cumbres, mire al lado contrario del Sol.", "en": "At sunrise and sunset (sunset at {h}), Teide casts a triangular shadow that reaches the horizon. The triangle is a trick of perspective, like train tracks that seem to meet in the distance: from the summits, look away from the Sun.", "fr": "Au lever et au coucher du soleil (coucher du soleil à {h}), le Teide projette une ombre triangulaire qui va jusqu’à l’horizon. Le triangle est un effet de perspective, comme des rails qui semblent se rejoindre au loin : depuis les sommets, regardez à l’opposé du Soleil.", "de": "Bei Sonnenaufgang und Sonnenuntergang (Sonnenuntergang um {h}) wirft der Teide einen dreieckigen Schatten, der bis zum Horizont reicht. Das Dreieck ist ein Effekt der Perspektive, wie Gleise, die sich in der Ferne zu treffen scheinen: Von den Gipfeln aus schau von der Sonne weg.", "it": "All’alba e al tramonto (tramonto alle {h}), il Teide proietta un’ombra triangolare che arriva fino all’orizzonte. Il triangolo è un effetto di prospettiva, come i binari di un treno che sembrano unirsi in lontananza: dalle cime, guarda dalla parte opposta al Sole.", "nl": "Bij zonsopgang en zonsondergang (zonsondergang om {h}) werpt de Teide een driehoekige schaduw die tot aan de horizon reikt. De driehoek is een perspectiefeffect, zoals treinrails die in de verte lijken samen te komen: kijk vanaf de toppen van de zon af.", "zh": "日出和日落时（日落 {h}），泰德峰会投下一道直达地平线的三角形阴影。三角形是透视造成的，就像远处看似相交的铁轨：在山顶上，往背对太阳的方向看。", "zht": "日出和日落時（日落 {h}），泰德峰會投下一道直達地平線的三角形陰影。三角形是透視造成的，就像遠處看似相交的鐵軌：在山頂上，往背對太陽的方向看。", "bg": "При изгрев и залез (залез в {h}) Тейде хвърля триъгълна сянка, която стига до хоризонта. Триъгълникът е ефект на перспективата, като релси, които сякаш се събират в далечината: от върховете гледайте на обратната на Слънцето страна.", "pl": "O wschodzie i zachodzie słońca (zachód słońca o {h}) Teide rzuca trójkątny cień sięgający horyzontu. Trójkąt to efekt perspektywy, jak tory, które zdają się zbiegać w oddali: ze szczytów patrz w stronę przeciwną do Słońca."},
    /* La sombra de la Tierra y el cinturon de Venus: Atmospheric Optics,
       «Earth Shadow» (atoptics.co.uk/blog/earth-shadow): «look towards the east
       after sunset», «a dark band gradually emerges from the eastern horizon»,
       «a beautiful pink band known as the anti-twilight arch or the "Belt of
       Venus"», «As the sun sinks deeper below the horizon, the Earth's shadow
       rises in the east», «Ensure that your view is unobstructed by a high
       horizon». */
    "cieloSombraTierra": {"es": "Y nada más ponerse el Sol, mire al este, al lado contrario: una banda oscura sube desde el horizonte —es la sombra de la Tierra sobre su propia atmósfera— con una franja rosada encima, el «cinturón de Venus». Hace falta un horizonte bajo y despejado, como el mar visto desde las cumbres.", "en": "And right after sunset, look east, the opposite way: a dark band rises from the horizon (it is the Earth’s shadow on its own atmosphere) with a pink band above it, the “Belt of Venus”. You need a low, clear horizon, like the sea seen from the summits.", "fr": "Et juste après le coucher du soleil, regardez vers l’est, à l’opposé : une bande sombre monte de l’horizon (c’est l’ombre de la Terre sur sa propre atmosphère), surmontée d’une bande rosée, la « ceinture de Vénus ». Il faut un horizon bas et dégagé, comme la mer vue depuis les sommets.", "de": "Und gleich nach Sonnenuntergang schau nach Osten, in die Gegenrichtung: Ein dunkles Band steigt vom Horizont auf (der Schatten der Erde auf ihrer eigenen Atmosphäre), darüber ein rosa Streifen, der „Venusgürtel“. Man braucht einen tiefen, freien Horizont, wie das Meer von den Gipfeln aus.", "it": "E appena tramonta il Sole, guarda a est, dalla parte opposta: una banda scura sale dall’orizzonte (è l’ombra della Terra sulla sua stessa atmosfera) con una fascia rosata sopra, la «cintura di Venere». Serve un orizzonte basso e sgombro, come il mare visto dalle cime.", "nl": "En meteen na zonsondergang kijk je naar het oosten, de andere kant op: een donkere band rijst vanaf de horizon op (de schaduw van de aarde op haar eigen dampkring) met daarboven een roze strook, de “gordel van Venus”. Je hebt een lage, vrije horizon nodig, zoals de zee gezien vanaf de toppen.", "zh": "太阳刚落下时，往东边、也就是相反的方向看：一条暗带从地平线升起——那是地球投在自己大气上的影子——上方镶着一条粉红色的带，叫“维纳斯带”。需要低而开阔的地平线，比如从山顶望见的海面。", "zht": "太陽剛落下時，往東邊、也就是相反的方向看：一條暗帶從地平線升起——那是地球投在自己大氣上的影子——上方鑲著一條粉紅色的帶，叫「維納斯帶」。需要低而開闊的地平線，比如從山頂望見的海面。", "bg": "А веднага след залеза погледнете на изток, в обратната посока: тъмна ивица се издига от хоризонта (това е сянката на Земята върху собствената ѝ атмосфера) с розова лента отгоре – „поясът на Венера“. Нужен е нисък и чист хоризонт, като морето, гледано от върховете.", "pl": "A zaraz po zachodzie spójrz na wschód, w przeciwną stronę: ciemny pas wznosi się znad horyzontu (to cień Ziemi na jej własnej atmosferze), a nad nim różowa smuga, „pas Wenus”. Potrzebny jest niski, odsłonięty horyzont, jak morze widziane ze szczytów."},
    /* ── las once lluvias: lo que dicen las fuentes (leidas el 22-10-2026) ────────
       {v} es la velocidad del catalogo (datos/cielo.json, lista de la IMO), para
       que el texto y la ficha no puedan discrepar. Cada frase sale de:
         · QUA: NASA, «Quadrantids» (science.nasa.gov/solar-system/meteors-meteorites/
           quadrantids): Quadrans Muralis, «French astronomer Jerome Lalande created
           this constellation in 1795»; «first seen in 1825»; «peak… only a few
           hours»; «60 to as many as 200… per hour under perfect conditions»;
           «bright fireball meteors»; «asteroid 2003 EH1… possible… "dead comet"».
         · LYR: NASA, «Lyrids»: «observed for 2,700 years», «687 BC by the
           Chinese»; «10-20… per hour»; «as many as 100» en 1803, 1922, 1945 y
           1982; «fast and bright», «occasional… fireball», «don't tend to leave
           long, glowing dust trains»; cometa Thatcher «discovered on April 5, 1861».
         · ETA: NASA, «Eta Aquarids»: 1P/Halley, «featured in the Bayeux tapestry…
           Battle of Hastings in 1066», «about 76 years», «not… again until 2061»;
           «glowing "trains"»; «Southern Hemisphere is preferable», tabla «About 10
           meteors per hour» (hemisferio norte).
         · SDA: NASA, «Delta Aquariids»: «faint meteors… if the Moon is visible,
           you will not be able to view them»; 96P/Machholz «suspected», «discovered
           by Donald Machholz in 1986», «once every five years»; «third brightest
           star… Delta», para distinguirlas de las Eta Acuaridas.
         · CAP: AMS, «Meteor Shower Calendar» (amsmeteors.org/calendar): «rarely
           produces more than five… per hour», «number of bright fireballs»;
           Wikipedia, «Alpha Capricornids»: «discovered by Hungarian astronomer
           Miklos von Konkoly-Thege in 1871», «bulk of the dust will not be in
           Earth's path until the 24th century».
         · PER: NASA, «Perseids»: «best meteor shower of the year», «50 to 100…
           per hour», «warm summer nighttime weather»; Swift-Tuttle «nucleus is…
           26 kilometers», «133 years», «last visited… in 1992», «Schiaparelli…
           1865»; «swift and bright… long "wakes" of light and color». «Lagrimas
           de San Lorenzo»: UCM (OTRI), «El llanto mas intenso de San Lorenzo»,
           «por la festividad del martir el 10 de agosto».
         · DRA: Wikipedia, «Draconids»: «1933 and 1946… thousands of meteors…
           per hour», «best viewed after sunset», «unofficially known as the
           Giacobinids», 20 km/s; NASA, «21P/Giacobini-Zinner»: «500 Draconid
           meteors were seen per minute in Europe» (1933), «Most years the shower
           is weak». «Las mas lentas de esta lista»: v minimo del catalogo (el
           control 13 lo comprueba).
         · ORI: NASA, «Orionids»: 1P/Halley; «known for their brightness and for
           their speed», «fireballs», «glowing "trains"»; «better to view… from 45
           to 90 degrees away from the radiant»; «not… again until 2061».
         · LEO: NASA, «Leonids»: «Every 33 years, or so… a Leonid storm»; «storm…
           at least 1,000 meteors per hour» (no se cita: el chino no dice «miles»
           sin 千 y el control de cifras lo leeria como un segundo 1.000); 1966
           «thousands of meteors per minute…
           during a 15-minute period»; «last… storm took place in 2002»; «as low as
           about three meteors per hour»; «some of the fastest», «bright… colorful».
         · GEM: NASA, «Geminids»: «one of the best and most reliable», «120… per
           hour under perfect conditions», «bright and fast… yellow»; «asteroid:
           3200 Phaethon», «5.10 kilometers», «1.4 years», «discovered on Oct. 11,
           1983, by the Infrared Astronomical Satellite», «Fred Whipple… realized»;
           «first began appearing in the mid-1800s… only 10 to 20».
         · URS: AMS, calendario: «5–10 Ursids per hour», «strictly a
           northern-hemisphere event», «outbursts… exceeded 25 per hour»;
           Wikipedia, «Ursids»: «Ursa Minor (near Kochab)», «Bečvář observed an
           outburst of 169 per hour in 1945», «within 12 hours of maximum». */
    "cieloCurQUA": {"es": "Llevan el nombre de una constelación que ya no existe, el Cuadrante Mural, que el astrónomo francés Jérôme Lalande dibujó en 1795. Se vieron por primera vez en 1825. Su máximo dura solo unas horas, pero en condiciones perfectas caen entre 60 y 200 por hora, con bólidos brillantes. El asteroide del que vienen, 2003 EH1, puede ser un cometa apagado.", "en": "They are named after a constellation that no longer exists, the Mural Quadrant, drawn by the French astronomer Jérôme Lalande in 1795. They were first seen in 1825. Their peak lasts only a few hours, but under perfect conditions 60 to 200 fall per hour, with bright fireballs. The asteroid they come from, 2003 EH1, may be a dead comet.", "fr": "Elles portent le nom d’une constellation qui n’existe plus, le Quadrant Mural, dessinée par l’astronome français Jérôme Lalande en 1795. On les a vues pour la première fois en 1825. Leur maximum ne dure que quelques heures, mais dans des conditions parfaites il en tombe de 60 à 200 par heure, avec des bolides brillants. L’astéroïde dont elles viennent, 2003 EH1, est peut-être une comète éteinte.", "de": "Sie sind nach einem Sternbild benannt, das es nicht mehr gibt: dem Mauerquadranten, den der französische Astronom Jérôme Lalande 1795 einführte. Erstmals gesehen wurden sie 1825. Ihr Maximum dauert nur wenige Stunden, aber unter perfekten Bedingungen fallen 60 bis 200 pro Stunde, mit hellen Feuerkugeln. Der Asteroid, von dem sie stammen, 2003 EH1, ist vielleicht ein erloschener Komet.", "it": "Prendono il nome da una costellazione che non esiste più, il Quadrante Murale, disegnata dall’astronomo francese Jérôme Lalande nel 1795. Furono viste per la prima volta nel 1825. Il loro massimo dura solo poche ore, ma in condizioni perfette ne cadono da 60 a 200 all’ora, con bolidi brillanti. L’asteroide da cui vengono, 2003 EH1, potrebbe essere una cometa spenta.", "nl": "Ze zijn genoemd naar een sterrenbeeld dat niet meer bestaat, het Muurkwadrant, dat de Franse astronoom Jérôme Lalande in 1795 tekende. Ze werden voor het eerst gezien in 1825. Hun maximum duurt maar een paar uur, maar onder perfecte omstandigheden vallen er 60 tot 200 per uur, met heldere vuurbollen. De planetoïde waar ze vandaan komen, 2003 EH1, is misschien een uitgedoofde komeet.", "zh": "它们以一个已不存在的星座——象限仪座命名，那是法国天文学家热罗姆·拉朗德在 1795 年划定的。1825 年首次有人看到这场流星雨。极大只持续几个小时，但在理想条件下每小时可达 60 到 200 颗，还有明亮的火流星。它们的母体小行星 2003 EH1 可能是一颗熄灭的彗星。", "zht": "它們以一個已不存在的星座——象限儀座命名，那是法國天文學家熱羅姆·拉朗德在 1795 年劃定的。1825 年首次有人看到這場流星雨。極大只持續幾個小時，但在理想條件下每小時可達 60 到 200 顆，還有明亮的火流星。它們的母體小行星 2003 EH1 可能是一顆熄滅的彗星。", "bg": "Носят името на съзвездие, което вече не съществува – Стенния квадрант, въведено от френския астроном Жером Лаланд през 1795 г. Видени са за първи път през 1825 г. Максимумът им трае само няколко часа, но при идеални условия падат по 60 до 200 на час, с ярки болиди. Астероидът, от който идват, 2003 EH1, може да е угаснала комета.", "pl": "Noszą nazwę gwiazdozbioru, którego już nie ma: Kwadrantu Ściennego, wprowadzonego przez francuskiego astronoma Jérôme’a Lalande’a w 1795 r. Po raz pierwszy zaobserwowano je w 1825 r. Ich maksimum trwa tylko kilka godzin, ale w idealnych warunkach spada 60 do 200 na godzinę, z jasnymi bolidami. Planetoida, z której pochodzą, 2003 EH1, może być wygasłą kometą."},
    "cieloCurLYR": {"es": "Se observan desde hace 2.700 años: la primera noticia la dejaron los chinos en el año 687 a. C. Lo normal son 10–20 por hora, pero de vez en cuando sorprenden con 100 (pasó en 1803, 1922, 1945 y 1982). Son rápidas, a {v} km/s, y brillantes, con algún bólido, aunque no suelen dejar estelas largas y luminosas. El cometa del que vienen, Thatcher, se descubrió en 1861.", "en": "They have been watched for 2,700 years: the first record was left by the Chinese in 687 BC. Normally 10–20 fall per hour, but now and then they surprise with 100 (it happened in 1803, 1922, 1945 and 1982). They are fast, at {v} km/s, and bright, with the odd fireball, though they don’t tend to leave long, glowing trains. The comet they come from, Thatcher, was discovered in 1861.", "fr": "On les observe depuis 2 700 ans : la première mention est chinoise, en 687 av. J.-C. En temps normal il en tombe 10 à 20 par heure, mais de temps en temps elles surprennent avec 100 (ce fut le cas en 1803, 1922, 1945 et 1982). Elles sont rapides, à {v} km/s, et brillantes, avec parfois un bolide, mais elles ne laissent généralement pas de longues traînées lumineuses. La comète dont elles viennent, Thatcher, a été découverte en 1861.", "de": "Man beobachtet sie seit 2.700 Jahren: Die erste Aufzeichnung stammt von den Chinesen aus dem Jahr 687 v. Chr. Normal sind 10–20 pro Stunde, aber hin und wieder überraschen sie mit 100 (so 1803, 1922, 1945 und 1982). Sie sind schnell, {v} km/s, und hell, mit gelegentlichen Feuerkugeln, hinterlassen aber meist keine langen, leuchtenden Spuren. Der Komet, von dem sie stammen, Thatcher, wurde 1861 entdeckt.", "it": "Si osservano da 2.700 anni: la prima notizia la lasciarono i cinesi nel 687 a.C. Di norma ne cadono 10–20 all’ora, ma ogni tanto sorprendono con 100 (è successo nel 1803, 1922, 1945 e 1982). Sono veloci, a {v} km/s, e brillanti, con qualche bolide, anche se di solito non lasciano lunghe scie luminose. La cometa da cui vengono, Thatcher, fu scoperta nel 1861.", "nl": "Ze worden al 2.700 jaar waargenomen: de eerste vermelding is Chinees, uit 687 v.Chr. Normaal vallen er 10–20 per uur, maar af en toe verrassen ze met 100 (zo in 1803, 1922, 1945 en 1982). Ze zijn snel, {v} km/s, en helder, met soms een vuurbol, maar laten meestal geen lange, gloeiende sporen na. De komeet waar ze vandaan komen, Thatcher, werd in 1861 ontdekt.", "zh": "人类观测它已有 2700 年：最早的记录是中国人在公元前 687 年留下的。通常每小时 10 到 20 颗，但偶尔会突然多到 100 颗（1803、1922、1945 和 1982 年都发生过）。它们速度快（每秒 {v} 公里）、明亮，偶有火流星，但一般不会留下长长的发光尾迹。母体彗星撒切尔发现于 1861 年。", "zht": "人類觀測它已有 2700 年：最早的紀錄是中國人在西元前 687 年留下的。通常每小時 10 到 20 顆，但偶爾會突然多到 100 顆（1803、1922、1945 和 1982 年都發生過）。它們速度快（每秒 {v} 公里）、明亮，偶有火流星，但一般不會留下長長的發光尾跡。母體彗星撒切爾發現於 1861 年。", "bg": "Наблюдават се от 2700 години: първото сведение е оставено от китайците през 687 г. пр.н.е. Обикновено падат по 10–20 на час, но от време на време изненадват със 100 (случило се е през 1803, 1922, 1945 и 1982 г.). Бързи са, {v} km/s, и ярки, с по някой болид, но обикновено не оставят дълги светещи следи. Кометата, от която идват, Тачър, е открита през 1861 г.", "pl": "Obserwuje się je od 2700 lat: pierwszą wzmiankę zostawili Chińczycy w 687 r. p.n.e. Zwykle spada 10–20 na godzinę, ale co jakiś czas zaskakują 100 na godzinę (tak było w 1803, 1922, 1945 i 1982 r.). Są szybkie, {v} km/s, i jasne, czasem z bolidem, choć zwykle nie zostawiają długich, świecących smug. Kometa, z której pochodzą, Thatcher, została odkryta w 1861 r."},
    "cieloCurETA": {"es": "Son polvo del cometa Halley, el mismo que aparece bordado en el tapiz de Bayeux, que cuenta la batalla de Hastings de 1066. Halley vuelve cada 76 años; la próxima vez, en 2061. Entran a {v} km/s, de las más rápidas, y dejan estelas que siguen brillando un momento. Se ven mejor desde el hemisferio sur; desde el norte, unas 10 por hora.", "en": "They are dust from Halley’s Comet, the same one embroidered on the Bayeux Tapestry, which tells of the Battle of Hastings in 1066. Halley returns every 76 years; next time in 2061. They come in at {v} km/s, among the fastest, and leave trains that keep glowing for a moment. They are best seen from the Southern Hemisphere; from the north, about 10 an hour.", "fr": "C’est de la poussière de la comète de Halley, celle-là même qui est brodée sur la tapisserie de Bayeux, qui raconte la bataille d’Hastings en 1066. Halley revient tous les 76 ans ; la prochaine fois, en 2061. Elles entrent à {v} km/s, parmi les plus rapides, et laissent des traînées qui brillent encore un instant. On les voit mieux depuis l’hémisphère sud ; depuis le nord, environ 10 par heure.", "de": "Sie sind Staub des Halleyschen Kometen, desselben, der auf dem Teppich von Bayeux gestickt ist, der von der Schlacht bei Hastings 1066 erzählt. Halley kehrt alle 76 Jahre zurück; das nächste Mal 2061. Sie kommen mit {v} km/s herein, mit die schnellsten, und hinterlassen Leuchtspuren, die noch einen Moment nachglühen. Am besten sieht man sie von der Südhalbkugel; vom Norden aus etwa 10 pro Stunde.", "it": "Sono polvere della cometa di Halley, la stessa ricamata nell’arazzo di Bayeux, che racconta la battaglia di Hastings del 1066. Halley torna ogni 76 anni; la prossima volta nel 2061. Entrano a {v} km/s, tra le più veloci, e lasciano scie che continuano a brillare per un istante. Si vedono meglio dall’emisfero sud; dal nord, circa 10 all’ora.", "nl": "Het is stof van de komeet Halley, dezelfde die geborduurd staat op het tapijt van Bayeux, dat de slag bij Hastings in 1066 vertelt. Halley keert elke 76 jaar terug; de volgende keer in 2061. Ze komen binnen met {v} km/s, bij de snelste, en laten sporen na die nog even nagloeien. Ze zijn het best te zien vanaf het zuidelijk halfrond; vanuit het noorden zo’n 10 per uur.", "zh": "它们是哈雷彗星的尘埃——就是绣在记录 1066 年黑斯廷斯战役的贝叶挂毯上的那颗彗星。哈雷每 76 年回归一次，下次是 2061 年。它们以每秒 {v} 公里进入大气，属最快之列，会留下持续发光片刻的尾迹。在南半球看得最好；在北半球每小时约 10 颗。", "zht": "它們是哈雷彗星的塵埃——就是繡在記錄 1066 年黑斯廷斯戰役的貝葉掛毯上的那顆彗星。哈雷每 76 年回歸一次，下次是 2061 年。它們以每秒 {v} 公里進入大氣，屬最快之列，會留下持續發光片刻的尾跡。在南半球看得最好；在北半球每小時約 10 顆。", "bg": "Те са прах от Халеевата комета – същата, извезана на гоблена от Байо, който разказва за битката при Хейстингс през 1066 г. Халеевата комета се връща на всеки 76 години; следващия път през 2061 г. Влизат с {v} km/s, сред най-бързите, и оставят следи, които светят още миг. Виждат се най-добре от южното полукълбо; от северното – около 10 на час.", "pl": "To pył komety Halleya, tej samej, którą wyhaftowano na tkaninie z Bayeux opowiadającej o bitwie pod Hastings w 1066 r. Halley wraca co 76 lat; następnym razem w 2061 r. Wpadają z prędkością {v} km/s, jedne z najszybszych, i zostawiają smugi, które świecą jeszcze przez chwilę. Najlepiej widać je z półkuli południowej; z północnej około 10 na godzinę."},
    "cieloCurSDA": {"es": "Son meteoros débiles: con Luna en el cielo no se ven. El cometa del que se cree que vienen, 96P/Machholz, lo descubrió Donald Machholz en 1986 y da la vuelta al Sol cada cinco años. Se llaman así por Delta, la tercera estrella más brillante de Acuario, para distinguirlas de las Eta Acuáridas de mayo.", "en": "They are faint meteors: with the Moon in the sky you will not see them. The comet they are thought to come from, 96P/Machholz, was discovered by Donald Machholz in 1986 and goes round the Sun every five years. They are named after Delta, the third-brightest star of Aquarius, to tell them apart from May’s Eta Aquariids.", "fr": "Ce sont des météores faibles : avec la Lune dans le ciel, on ne les voit pas. La comète dont on pense qu’elles viennent, 96P/Machholz, a été découverte par Donald Machholz en 1986 et fait le tour du Soleil tous les cinq ans. Elles tiennent leur nom de Delta, la troisième étoile la plus brillante du Verseau, pour les distinguer des Êta Aquarides de mai.", "de": "Es sind schwache Meteore: Steht der Mond am Himmel, sieht man sie nicht. Der Komet, von dem sie vermutlich stammen, 96P/Machholz, wurde 1986 von Donald Machholz entdeckt und umrundet die Sonne alle fünf Jahre. Benannt sind sie nach Delta, dem dritthellsten Stern des Wassermanns, um sie von den Eta-Aquariiden im Mai zu unterscheiden.", "it": "Sono meteore deboli: con la Luna in cielo non si vedono. La cometa da cui si pensa che vengano, 96P/Machholz, fu scoperta da Donald Machholz nel 1986 e gira intorno al Sole ogni cinque anni. Si chiamano così da Delta, la terza stella più brillante dell’Acquario, per distinguerle dalle Eta Aquaridi di maggio.", "nl": "Het zijn zwakke meteoren: met de maan aan de hemel zie je ze niet. De komeet waar ze vermoedelijk vandaan komen, 96P/Machholz, werd in 1986 ontdekt door Donald Machholz en draait elke vijf jaar om de zon. Ze zijn genoemd naar Delta, de op twee na helderste ster van de Waterman, om ze te onderscheiden van de Eta-Aquariden van mei.", "zh": "它们是暗弱的流星：天上有月亮时就看不到了。一般认为它们来自彗星 96P/马克霍尔兹，该彗星由唐纳德·马克霍尔兹于 1986 年发现，每五年绕太阳一周。名字取自宝瓶座第三亮的星——宝瓶座 δ，以区别于五月的宝瓶座 η 流星雨。", "zht": "它們是暗弱的流星：天上有月亮時就看不到了。一般認為它們來自彗星 96P/馬克霍茲，該彗星由唐納德·馬克霍茲於 1986 年發現，每五年繞太陽一周。名字取自寶瓶座第三亮的星——寶瓶座 δ，以區別於五月的寶瓶座 η 流星雨。", "bg": "Това са слаби метеори: при Луна на небето не се виждат. Кометата, от която се смята, че идват, 96P/Махолц, е открита от Доналд Махолц през 1986 г. и обикаля Слънцето на всеки пет години. Наречени са на Делта, третата по яркост звезда на Водолей, за да се различават от Ета Аквариидите през май.", "pl": "To słabe meteory: przy Księżycu na niebie ich nie zobaczysz. Kometa, z której prawdopodobnie pochodzą, 96P/Machholz, została odkryta przez Donalda Machholza w 1986 r. i okrąża Słońce co pięć lat. Nazwę wzięły od Delty, trzeciej co do jasności gwiazdy Wodnika, by odróżnić je od majowych Eta Akwarydów."},
    "cieloCurCAP": {"es": "Pocas, pero de las que se recuerdan: rara vez pasan de cinco por hora, y lo notable son sus bólidos brillantes. Entran a {v} km/s. Las descubrió el astrónomo húngaro Miklós Konkoly-Thege en 1871. Y van a más: el grueso del polvo de su cometa no cruzará el camino de la Tierra hasta el siglo XXIV.", "en": "Few, but memorable: they rarely exceed five an hour, and what stands out is their bright fireballs. They come in at {v} km/s. The Hungarian astronomer Miklós Konkoly-Thege discovered them in 1871. And they are growing: the bulk of their comet’s dust will not cross Earth’s path until the 24th century.", "fr": "Peu nombreuses, mais mémorables : elles dépassent rarement cinq par heure, et ce qui frappe, ce sont leurs bolides brillants. Elles entrent à {v} km/s. Elles ont été découvertes par l’astronome hongrois Miklós Konkoly-Thege en 1871. Et elles iront en augmentant : le gros de la poussière de leur comète ne croisera le chemin de la Terre qu’au XXIVe siècle.", "de": "Wenige, aber unvergessliche: Selten sind es mehr als fünf pro Stunde, doch auffällig sind ihre hellen Feuerkugeln. Sie kommen mit {v} km/s herein. Entdeckt hat sie der ungarische Astronom Miklós Konkoly-Thege 1871. Und es werden mehr: Der Großteil des Staubs ihres Kometen kreuzt die Bahn der Erde erst im 24. Jahrhundert.", "it": "Poche, ma di quelle che si ricordano: raramente superano le cinque all’ora, e ciò che colpisce sono i loro bolidi brillanti. Entrano a {v} km/s. Le scoprì l’astronomo ungherese Miklós Konkoly-Thege nel 1871. E andranno aumentando: il grosso della polvere della loro cometa non incrocerà il cammino della Terra fino al XXIV secolo.", "nl": "Weinig, maar onvergetelijk: zelden meer dan vijf per uur, maar wat opvalt zijn hun heldere vuurbollen. Ze komen binnen met {v} km/s. De Hongaarse astronoom Miklós Konkoly-Thege ontdekte ze in 1871. En het worden er meer: het grootste deel van het stof van hun komeet kruist de baan van de aarde pas in de 24e eeuw.", "zh": "数量少，却令人难忘：每小时很少超过五颗，但引人注目的是明亮的火流星。它们以每秒 {v} 公里进入大气。匈牙利天文学家米克洛什·康科利-泰格于 1871 年发现了这场流星雨。而且它还会越来越旺：其母彗星的大部分尘埃要到 24 世纪才会穿过地球的路径。", "zht": "數量少，卻令人難忘：每小時很少超過五顆，但引人注目的是明亮的火流星。它們以每秒 {v} 公里進入大氣。匈牙利天文學家米克洛什·康科利-泰格於 1871 年發現了這場流星雨。而且它還會越來越旺：其母彗星的大部分塵埃要到 24 世紀才會穿過地球的路徑。", "bg": "Малко, но запомнящи се: рядко надхвърлят пет на час, а впечатляват ярките им болиди. Влизат с {v} km/s. Открива ги унгарският астроном Миклош Конколи-Теге през 1871 г. И ще се засилват: по-голямата част от праха на кометата им ще пресече пътя на Земята чак през XXIV век.", "pl": "Nieliczne, ale zapadające w pamięć: rzadko przekraczają pięć na godzinę, a wyróżniają się jasnymi bolidami. Wpadają z prędkością {v} km/s. Odkrył je węgierski astronom Miklós Konkoly-Thege w 1871 r. I będzie ich więcej: gros pyłu ich komety przetnie drogę Ziemi dopiero w XXIV wieku."},
    "cieloCurPER": {"es": "La lluvia más famosa del año: 50–100 por hora en las noches cálidas de agosto. También se las llama «lágrimas de San Lorenzo», por la fiesta del mártir, el 10 de agosto. Son polvo del cometa Swift-Tuttle, con un núcleo de 26 km, que pasa cada 133 años (la última vez, en 1992); Giovanni Schiaparelli descubrió en 1865 que era su origen. Rápidas ({v} km/s) y brillantes, suelen dejar largas estelas de luz y color.", "en": "The most famous shower of the year: 50–100 an hour on warm August nights. They are also called the “tears of Saint Lawrence”, after the martyr’s feast day, 10 August. They are dust from comet Swift-Tuttle, whose nucleus is 26 km across and which passes every 133 years (last time in 1992); Giovanni Schiaparelli worked out in 1865 that it was their source. Fast ({v} km/s) and bright, they often leave long wakes of light and colour.", "fr": "La pluie la plus célèbre de l’année : 50 à 100 par heure dans les nuits chaudes d’août. On les appelle aussi « larmes de saint Laurent », d’après la fête du martyr, le 10 août. C’est de la poussière de la comète Swift-Tuttle, au noyau de 26 km, qui passe tous les 133 ans (la dernière fois en 1992) ; Giovanni Schiaparelli a compris en 1865 qu’elle en était la source. Rapides ({v} km/s) et brillantes, elles laissent souvent de longues traînées de lumière et de couleur.", "de": "Der berühmteste Strom des Jahres: 50–100 pro Stunde in den warmen Augustnächten. Man nennt sie auch „Tränen des heiligen Laurentius“, nach dem Fest des Märtyrers am 10. August. Sie sind Staub des Kometen Swift-Tuttle, dessen Kern 26 km misst und der alle 133 Jahre vorbeikommt (zuletzt 1992); Giovanni Schiaparelli erkannte 1865, dass er ihre Quelle ist. Schnell ({v} km/s) und hell, hinterlassen sie oft lange Spuren aus Licht und Farbe.", "it": "La pioggia più famosa dell’anno: 50–100 all’ora nelle calde notti di agosto. Le chiamano anche «lacrime di San Lorenzo», dalla festa del martire, il 10 agosto. Sono polvere della cometa Swift-Tuttle, con un nucleo di 26 km, che passa ogni 133 anni (l’ultima volta nel 1992); Giovanni Schiaparelli scoprì nel 1865 che ne era l’origine. Veloci ({v} km/s) e brillanti, lasciano spesso lunghe scie di luce e colore.", "nl": "De beroemdste zwerm van het jaar: 50–100 per uur in de warme augustusnachten. Ze heten ook “tranen van Sint-Laurentius”, naar het feest van de martelaar op 10 augustus. Het is stof van de komeet Swift-Tuttle, met een kern van 26 km, die elke 133 jaar langskomt (de laatste keer in 1992); Giovanni Schiaparelli ontdekte in 1865 dat die de bron was. Snel ({v} km/s) en helder, laten ze vaak lange sporen van licht en kleur na.", "zh": "一年中最有名的流星雨：八月温暖的夜晚每小时 50 到 100 颗。它们也被称为“圣洛伦佐的眼泪”，因为 8 月 10 日是这位殉道者的纪念日。它们是斯威夫特-塔特尔彗星的尘埃，该彗星核直径 26 公里，每 133 年回归一次（上次是 1992 年）；1865 年乔瓦尼·斯基亚帕雷利发现它就是源头。它们速度快（每秒 {v} 公里）、明亮，常留下长长的有色光迹。", "zht": "一年中最有名的流星雨：八月溫暖的夜晚每小時 50 到 100 顆。它們也被稱為「聖羅倫佐的眼淚」，因為 8 月 10 日是這位殉道者的紀念日。它們是斯威夫特-塔特爾彗星的塵埃，該彗星核直徑 26 公里，每 133 年回歸一次（上次是 1992 年）；1865 年喬瓦尼·斯基亞帕雷利發現它就是源頭。它們速度快（每秒 {v} 公里）、明亮，常留下長長的有色光跡。", "bg": "Най-прочутият поток на годината: 50–100 на час в топлите августовски нощи. Наричат ги и „сълзите на свети Лаврентий“ – по празника на мъченика, 10 август. Те са прах от кометата Суифт–Тътъл, с ядро от 26 km, която минава на всеки 133 години (последно през 1992 г.); Джовани Скиапарели установява през 1865 г., че тя е източникът им. Бързи ({v} km/s) и ярки, често оставят дълги следи от светлина и цвят.", "pl": "Najsłynniejszy rój roku: 50–100 na godzinę w ciepłe sierpniowe noce. Nazywa się je też „łzami świętego Wawrzyńca”, od święta męczennika 10 sierpnia. To pył komety Swift-Tuttle, o jądrze 26 km, która przelatuje co 133 lata (ostatnio w 1992 r.); Giovanni Schiaparelli ustalił w 1865 r., że to ona jest ich źródłem. Szybkie ({v} km/s) i jasne, często zostawiają długie, barwne smugi światła."},
    "cieloCurDRA": {"es": "Casi todos los años son pocas, pero dos veces se convirtieron en tormenta: en 1933 y 1946 cayeron miles por hora (en 1933, en Europa, 500 por minuto). Entran a {v} km/s, las más lentas de esta lista, y se ven mejor después de la puesta de sol. Su otro nombre, Giacobínidas, viene del cometa Giacobini-Zinner.", "en": "Most years there are few, but twice they turned into a storm: in 1933 and 1946 thousands fell per hour (in 1933, in Europe, 500 a minute). They come in at {v} km/s, the slowest on this list, and they are best seen after sunset. Their other name, Giacobinids, comes from comet Giacobini-Zinner.", "fr": "La plupart des années elles sont rares, mais deux fois elles sont devenues tempête : en 1933 et 1946 il en est tombé des milliers par heure (en 1933, en Europe, 500 par minute). Elles entrent à {v} km/s, les plus lentes de cette liste, et on les voit mieux après le coucher du soleil. Leur autre nom, Giacobinides, vient de la comète Giacobini-Zinner.", "de": "In den meisten Jahren sind es wenige, aber zweimal wurden sie zum Sturm: 1933 und 1946 fielen Tausende pro Stunde (1933 in Europa 500 pro Minute). Sie kommen mit {v} km/s herein, die langsamsten dieser Liste, und man sieht sie am besten nach Sonnenuntergang. Ihr anderer Name, Giacobiniden, kommt vom Kometen Giacobini-Zinner.", "it": "Quasi tutti gli anni sono poche, ma due volte sono diventate tempesta: nel 1933 e nel 1946 ne caddero migliaia all’ora (nel 1933, in Europa, 500 al minuto). Entrano a {v} km/s, le più lente di questa lista, e si vedono meglio dopo il tramonto. L’altro nome, Giacobinidi, viene dalla cometa Giacobini-Zinner.", "nl": "De meeste jaren zijn het er weinig, maar twee keer werden ze een storm: in 1933 en 1946 vielen er duizenden per uur (in 1933, in Europa, 500 per minuut). Ze komen binnen met {v} km/s, de traagste van deze lijst, en je ziet ze het best na zonsondergang. Hun andere naam, Giacobiniden, komt van de komeet Giacobini-Zinner.", "zh": "大多数年份数量很少，但有两次变成了流星暴：1933 年和 1946 年每小时数以千计（1933 年在欧洲每分钟 500 颗）。它们以每秒 {v} 公里进入大气，是这份名单里最慢的，日落之后最适合观看。它的另一个名字“贾可比尼流星雨”来自贾可比尼-津纳彗星。", "zht": "大多數年份數量很少，但有兩次變成了流星暴：1933 年和 1946 年每小時數以千計（1933 年在歐洲每分鐘 500 顆）。它們以每秒 {v} 公里進入大氣，是這份名單裡最慢的，日落之後最適合觀看。它的另一個名字「賈可比尼流星雨」來自賈可比尼–津納彗星。", "bg": "През повечето години са малко, но два пъти са се превръщали в буря: през 1933 и 1946 г. падат по хиляди на час (през 1933 г. в Европа – 500 в минута). Влизат с {v} km/s, най-бавните в този списък, и се виждат най-добре след залез слънце. Другото им име, Джакобиниди, идва от кометата Джакобини–Цинер.", "pl": "W większości lat jest ich niewiele, ale dwa razy zamieniły się w burzę: w 1933 i 1946 r. spadały tysiące na godzinę (w 1933 r. w Europie 500 na minutę). Wpadają z prędkością {v} km/s, najwolniejsze na tej liście, i najlepiej widać je po zachodzie słońca. Ich druga nazwa, Giacobinidy, pochodzi od komety Giacobini-Zinner."},
    "cieloCurORI": {"es": "Son polvo del cometa Halley, como las Eta Acuáridas de mayo: la Tierra cruza su rastro dos veces al año. De las más rápidas ({v} km/s) y brillantes, a veces con bólidos y estelas que siguen brillando. Un consejo de la NASA: no mire al radiante, sino a 45–90° de él. Halley no volverá hasta 2061.", "en": "They are dust from Halley’s Comet, like May’s Eta Aquariids: Earth crosses its trail twice a year. Among the fastest ({v} km/s) and brightest, sometimes with fireballs and trains that keep glowing. A tip from NASA: do not look at the radiant but 45–90° away from it. Halley will not be back until 2061.", "fr": "C’est de la poussière de la comète de Halley, comme les Êta Aquarides de mai : la Terre croise sa trace deux fois par an. Parmi les plus rapides ({v} km/s) et les plus brillantes, parfois avec des bolides et des traînées qui brillent encore. Un conseil de la NASA : ne regardez pas le radiant, mais à 45–90° de lui. Halley ne reviendra pas avant 2061.", "de": "Sie sind Staub des Halleyschen Kometen, wie die Eta-Aquariiden im Mai: Die Erde kreuzt seine Spur zweimal im Jahr. Mit die schnellsten ({v} km/s) und hellsten, manchmal mit Feuerkugeln und nachglühenden Leuchtspuren. Ein Tipp der NASA: nicht zum Radianten schauen, sondern 45–90° daneben. Halley kommt erst 2061 wieder.", "it": "Sono polvere della cometa di Halley, come le Eta Aquaridi di maggio: la Terra ne attraversa la scia due volte l’anno. Tra le più veloci ({v} km/s) e brillanti, a volte con bolidi e scie che continuano a brillare. Un consiglio della NASA: non guardare il radiante, ma a 45–90° da esso. Halley non tornerà fino al 2061.", "nl": "Het is stof van de komeet Halley, net als de Eta-Aquariden van mei: de aarde kruist zijn spoor twee keer per jaar. Bij de snelste ({v} km/s) en helderste, soms met vuurbollen en nagloeiende sporen. Een tip van NASA: kijk niet naar de radiant, maar 45–90° ernaast. Halley komt pas in 2061 terug.", "zh": "它们和五月的宝瓶座 η 流星雨一样，都是哈雷彗星的尘埃：地球每年两次穿过它的轨迹。属最快（每秒 {v} 公里）、最亮之列，有时有火流星和持续发光的尾迹。NASA 的建议：别盯着辐射点，看离它 45 到 90 度的地方。哈雷要到 2061 年才回来。", "zht": "它們和五月的寶瓶座 η 流星雨一樣，都是哈雷彗星的塵埃：地球每年兩次穿過它的軌跡。屬最快（每秒 {v} 公里）、最亮之列，有時有火流星和持續發光的尾跡。NASA 的建議：別盯著輻射點，看離它 45 到 90 度的地方。哈雷要到 2061 年才回來。", "bg": "Те са прах от Халеевата комета, като Ета Аквариидите през май: Земята пресича следата ѝ два пъти годишно. Сред най-бързите ({v} km/s) и най-ярките, понякога с болиди и следи, които продължават да светят. Съвет от NASA: не гледайте радианта, а на 45–90° от него. Халеевата комета няма да се върне до 2061 г.", "pl": "To pył komety Halleya, jak majowe Eta Akwarydy: Ziemia przecina jej ślad dwa razy w roku. Jedne z najszybszych ({v} km/s) i najjaśniejszych, czasem z bolidami i smugami, które świecą jeszcze przez chwilę. Rada NASA: nie patrz w radiant, lecz 45–90° od niego. Halley wróci dopiero w 2061 r."},
    "cieloCurLEO": {"es": "Su cometa, Tempel-Tuttle, tarda 33 años en dar la vuelta al Sol, y más o menos cada 33 años pueden convertirse en tormenta: en 1966 cayeron miles por minuto durante un cuarto de hora, y la última tormenta fue en 2002. Los demás años son pocas, unas 3 por hora, pero las más rápidas de esta lista ({v} km/s), brillantes, y pueden ser de colores.", "en": "Their comet, Tempel-Tuttle, takes 33 years to go round the Sun, and every 33 years or so they can turn into a storm: in 1966 thousands fell per minute for a quarter of an hour, and the last storm was in 2002. Other years there are few, about 3 an hour, but they are the fastest on this list ({v} km/s), bright, and they can be colourful.", "fr": "Leur comète, Tempel-Tuttle, met 33 ans à faire le tour du Soleil, et tous les 33 ans environ elles peuvent devenir tempête : en 1966 il en est tombé des milliers par minute pendant un quart d’heure, et la dernière tempête date de 2002. Les autres années elles sont rares, environ 3 par heure, mais ce sont les plus rapides de cette liste ({v} km/s), brillantes, et elles peuvent être colorées.", "de": "Ihr Komet, Tempel-Tuttle, braucht 33 Jahre für einen Umlauf um die Sonne, und etwa alle 33 Jahre können sie zum Sturm werden: 1966 fielen eine Viertelstunde lang Tausende pro Minute, der letzte Sturm war 2002. In den übrigen Jahren sind es wenige, etwa 3 pro Stunde, aber die schnellsten dieser Liste ({v} km/s), hell, und sie können farbig sein.", "it": "La loro cometa, Tempel-Tuttle, impiega 33 anni a girare intorno al Sole, e ogni 33 anni circa possono diventare tempesta: nel 1966 ne caddero migliaia al minuto per un quarto d’ora, e l’ultima tempesta è stata nel 2002. Gli altri anni sono poche, circa 3 all’ora, ma le più veloci di questa lista ({v} km/s), brillanti, e possono essere colorate.", "nl": "Hun komeet, Tempel-Tuttle, doet 33 jaar over een rondje om de zon, en ongeveer elke 33 jaar kunnen ze een storm worden: in 1966 vielen er een kwartier lang duizenden per minuut, en de laatste storm was in 2002. In andere jaren zijn het er weinig, zo’n 3 per uur, maar ze zijn de snelste van deze lijst ({v} km/s), helder, en ze kunnen kleurig zijn.", "zh": "它们的彗星坦普尔-塔特尔绕太阳一圈要 33 年，而大约每 33 年它们可能变成流星暴：1966 年曾在一刻钟内每分钟落下数千颗，最近一次流星暴是 2002 年。其他年份数量很少，每小时约 3 颗，却是这份名单里最快的（每秒 {v} 公里），明亮，还可能带颜色。", "zht": "它們的彗星坦普爾-塔特爾繞太陽一圈要 33 年，而大約每 33 年它們可能變成流星暴：1966 年曾在一刻鐘內每分鐘落下數千顆，最近一次流星暴是 2002 年。其他年份數量很少，每小時約 3 顆，卻是這份名單裡最快的（每秒 {v} 公里），明亮，還可能帶顏色。", "bg": "Кометата им, Темпел–Тътъл, обикаля Слънцето за 33 години, а приблизително на всеки 33 години те могат да се превърнат в буря: през 1966 г. за четвърт час падат по хиляди в минута, а последната буря е през 2002 г. В другите години са малко, около 3 на час, но са най-бързите в този списък ({v} km/s), ярки и могат да бъдат цветни.", "pl": "Ich kometa, Tempel-Tuttle, okrąża Słońce w 33 lata, a mniej więcej co 33 lata mogą one zamienić się w burzę: w 1966 r. przez kwadrans spadały tysiące na minutę, a ostatnia burza była w 2002 r. W pozostałych latach jest ich niewiele, około 3 na godzinę, ale są najszybsze na tej liście ({v} km/s), jasne i mogą być barwne."},
    "cieloCurGEM": {"es": "Una de las mejores y más fiables del año: hasta 120 por hora en condiciones perfectas, brillantes y a menudo amarillas. Y una rareza: no vienen de un cometa sino de un asteroide, Faetón, de 5 km, que da la vuelta al Sol cada 1,4 años; lo encontró el satélite IRAS en 1983 y Fred Whipple vio que era su origen. Cuando empezaron a verse, a mediados del siglo XIX, apenas daban 10–20 por hora.", "en": "One of the best and most reliable of the year: up to 120 an hour under perfect conditions, bright and often yellow. And a rarity: they come not from a comet but from an asteroid, Phaethon, 5 km across, which goes round the Sun every 1.4 years; the IRAS satellite found it in 1983 and Fred Whipple saw it was their source. When they first appeared, in the mid-19th century, they gave barely 10–20 an hour.", "fr": "L’une des meilleures et des plus régulières de l’année : jusqu’à 120 par heure dans des conditions parfaites, brillantes et souvent jaunes. Et une rareté : elles ne viennent pas d’une comète mais d’un astéroïde, Phaéton, de 5 km, qui fait le tour du Soleil tous les 1,4 an ; le satellite IRAS l’a trouvé en 1983 et Fred Whipple a vu qu’il en était la source. Quand on a commencé à les voir, au milieu du XIXe siècle, elles donnaient à peine 10 à 20 par heure.", "de": "Einer der besten und zuverlässigsten Ströme des Jahres: bis zu 120 pro Stunde unter perfekten Bedingungen, hell und oft gelb. Und eine Seltenheit: Sie stammen nicht von einem Kometen, sondern von einem Asteroiden, Phaethon, 5 km groß, der die Sonne alle 1,4 Jahre umrundet; der Satellit IRAS fand ihn 1983, und Fred Whipple erkannte ihn als ihre Quelle. Als sie Mitte des 19. Jahrhunderts erstmals auftauchten, waren es kaum 10–20 pro Stunde.", "it": "Una delle migliori e più affidabili dell’anno: fino a 120 all’ora in condizioni perfette, brillanti e spesso gialle. E una rarità: non vengono da una cometa ma da un asteroide, Fetonte, di 5 km, che gira intorno al Sole ogni 1,4 anni; lo trovò il satellite IRAS nel 1983 e Fred Whipple capì che ne era l’origine. Quando si cominciò a vederle, a metà del XIX secolo, davano appena 10–20 all’ora.", "nl": "Een van de beste en betrouwbaarste van het jaar: tot 120 per uur onder perfecte omstandigheden, helder en vaak geel. En een zeldzaamheid: ze komen niet van een komeet maar van een planetoïde, Phaethon, 5 km groot, die elke 1,4 jaar om de zon draait; de satelliet IRAS vond hem in 1983 en Fred Whipple zag dat hij de bron was. Toen ze halverwege de 19e eeuw voor het eerst verschenen, waren het er amper 10–20 per uur.", "zh": "一年中最好、最可靠的流星雨之一：理想条件下每小时可达 120 颗，明亮，常呈黄色。还有一点罕见：它们不是来自彗星，而是来自一颗小行星——直径 5 公里的法厄同，每 1.4 年绕太阳一周；1983 年由 IRAS 卫星发现，弗雷德·惠普尔认出它就是源头。19 世纪中叶刚出现时，每小时只有 10 到 20 颗。", "zht": "一年中最好、最可靠的流星雨之一：理想條件下每小時可達 120 顆，明亮，常呈黃色。還有一點罕見：它們不是來自彗星，而是來自一顆小行星——直徑 5 公里的法厄同，每 1.4 年繞太陽一周；1983 年由 IRAS 衛星發現，弗雷德·惠普爾認出它就是源頭。19 世紀中葉剛出現時，每小時只有 10 到 20 顆。", "bg": "Един от най-добрите и най-надеждните потоци на годината: до 120 на час при идеални условия, ярки и често жълти. И една рядкост: идват не от комета, а от астероид – Фаетон, 5 km, който обикаля Слънцето на всеки 1,4 години; откри го спътникът IRAS през 1983 г., а Фред Уипъл разбра, че той е източникът им. Когато започват да се виждат, в средата на XIX век, дават едва 10–20 на час.", "pl": "Jeden z najlepszych i najbardziej niezawodnych rojów roku: do 120 na godzinę w idealnych warunkach, jasne i często żółte. I rzadkość: pochodzą nie z komety, lecz z planetoidy Faeton, o średnicy 5 km, okrążającej Słońce co 1,4 roku; znalazł ją satelita IRAS w 1983 r., a Fred Whipple rozpoznał w niej ich źródło. Gdy pojawiły się po raz pierwszy, w połowie XIX wieku, dawały ledwie 10–20 na godzinę."},
    "cieloCurURS": {"es": "Llegan justo antes de Navidad y son discretas: 5–10 por hora, solo desde el hemisferio norte, saliendo de junto a Kochab, en la Osa Menor. De vez en cuando estallan: en 1945 el astrónomo A. Bečvář contó 169 por hora. Su corriente es tan estrecha que hay que estar a menos de 12 horas del máximo para ver muchas.", "en": "They arrive just before Christmas and are modest: 5–10 an hour, only from the Northern Hemisphere, coming out from beside Kochab in the Little Bear. Now and then they burst: in 1945 the astronomer A. Bečvář counted 169 an hour. Their stream is so narrow that you need to be within 12 hours of the peak to see much.", "fr": "Elles arrivent juste avant Noël et sont discrètes : 5 à 10 par heure, seulement depuis l’hémisphère nord, en sortant d’à côté de Kochab, dans la Petite Ourse. De temps en temps elles explosent : en 1945, l’astronome A. Bečvář en a compté 169 par heure. Leur courant est si étroit qu’il faut être à moins de 12 heures du maximum pour en voir beaucoup.", "de": "Sie kommen kurz vor Weihnachten und sind bescheiden: 5–10 pro Stunde, nur von der Nordhalbkugel aus, neben Kochab im Kleinen Bären. Hin und wieder brechen sie aus: 1945 zählte der Astronom A. Bečvář 169 pro Stunde. Ihr Strom ist so schmal, dass man höchstens 12 Stunden vom Maximum entfernt sein darf, um viel zu sehen.", "it": "Arrivano poco prima di Natale e sono discrete: 5–10 all’ora, solo dall’emisfero nord, uscendo da accanto a Kochab, nell’Orsa Minore. Ogni tanto esplodono: nel 1945 l’astronomo A. Bečvář ne contò 169 all’ora. La loro corrente è così stretta che bisogna essere a meno di 12 ore dal massimo per vederne molte.", "nl": "Ze komen vlak voor Kerstmis en zijn bescheiden: 5–10 per uur, alleen vanaf het noordelijk halfrond, van naast Kochab in de Kleine Beer. Af en toe barsten ze uit: in 1945 telde de astronoom A. Bečvář er 169 per uur. Hun stroom is zo smal dat je binnen 12 uur van het maximum moet zitten om veel te zien.", "zh": "它们在圣诞节前夕到来，数量不多：每小时 5 到 10 颗，只有北半球能看到，从小熊座的北极二（Kochab）旁边辐射出来。偶尔会爆发：1945 年天文学家 A. 贝奇瓦日每小时数到 169 颗。它的流星体流很窄，必须在极大前后 12 小时内才能看到很多。", "zht": "它們在聖誕節前夕到來，數量不多：每小時 5 到 10 顆，只有北半球能看到，從小熊座的北極二（Kochab）旁邊輻射出來。偶爾會爆發：1945 年天文學家 A. 貝奇瓦日每小時數到 169 顆。它的流星體流很窄，必須在極大前後 12 小時內才能看到很多。", "bg": "Идват точно преди Коледа и са скромни: 5–10 на час, само от северното полукълбо, излизайки отстрани на Кохаб в Малката мечка. От време на време избухват: през 1945 г. астрономът А. Бечварж преброява 169 на час. Потокът им е толкова тесен, че трябва да сте на по-малко от 12 часа от максимума, за да видите много.", "pl": "Przychodzą tuż przed Bożym Narodzeniem i są skromne: 5–10 na godzinę, tylko z półkuli północnej, wylatują spod Kochaba w Małej Niedźwiedzicy. Od czasu do czasu wybuchają: w 1945 r. astronom A. Bečvář naliczył 169 na godzinę. Ich strumień jest tak wąski, że trzeba być w granicach 12 godzin od maksimum, by zobaczyć ich wiele."},
    /* Las 88 constelaciones: su origen, su tamaño y una curiosidad cada una
       (22-10-2026, sexto bloque; Jerome: «si quiero» a una curiosidad por
       constelacion, con su fuente). Las cifras y el origen van en
       datos/constelaciones.json (copia en el modulo, CIELO_CONS):
         · Area y puesto: Wikipedia, «IAU designated constellations by solid angle»
           (la suma de las 88 es la esfera entera, 41.253 grados cuadrados; el
           control 14 lo comprueba).
         · Origen: Wikipedia, «IAU designated constellations»: 47 de las 48 de
           Ptolomeo (Almagesto, siglo II) mas las tres de Argo Navis, que Lacaille
           separo en 1756; 12 de Keyser y De Houtman (globo de Plancius, 1598, y
           Uranometria de Bayer, 1603); 4 de Plancius (Crux 1589, Columba 1592,
           Camelopardalis y Monoceros 1613); 7 de Hevelius (1690); 14 de Lacaille
           (1756); Coma Berenices, asterismo antiguo y constelacion desde Caspar
           Vopel (1536).
         · Las curiosidades (CurCon*): Ian Ridpath, «Star Tales»
           (ianridpath.com/startales), la pagina de cada constelacion, leida el
           22-10-2026 (Orion, cuya pagina no se dejo leer: Wikipedia). Van en
           idiomas/cielo/<idioma>.json, y lo que dice la pagina, en
           datos/constelaciones.json (cita).
       ── el origen (el año va en {a}) ──────────────────────────────────────────── */
    "cieloConOrigen": {"es": "Origen: {o}", "en": "Origin: {o}", "fr": "Origine : {o}", "de": "Herkunft: {o}", "it": "Origine: {o}", "nl": "Oorsprong: {o}", "zh": "起源：{o}", "zht": "起源：{o}", "bg": "Произход: {o}", "pl": "Pochodzenie: {o}"},
    "cieloConOrigenPtolomeo": {"es": "una de las 48 constelaciones de Ptolomeo (Almagesto, siglo II)", "en": "one of Ptolemy’s 48 constellations (Almagest, 2nd century)", "fr": "l’une des 48 constellations de Ptolémée (Almageste, IIe siècle)", "de": "eines der 48 Sternbilder des Ptolemäus (Almagest, 2. Jahrhundert)", "it": "una delle 48 costellazioni di Tolomeo (Almagesto, II secolo)", "nl": "een van de 48 sterrenbeelden van Ptolemaeus (Almagest, 2e eeuw)", "zh": "托勒密《天文学大成》中的 48 个星座之一（2 世纪）", "zht": "托勒密《天文學大成》中的 48 個星座之一（2 世紀）", "bg": "едно от 48-те съзвездия на Птолемей („Алмагест“, II век)", "pl": "jeden z 48 gwiazdozbiorów Ptolemeusza (Almagest, II wiek)"},
    "cieloConOrigenKeyser": {"es": "dibujada por los navegantes Keyser y De Houtman en el hemisferio sur; en el globo de Plancius ({a}) y en el atlas de Bayer (1603)", "en": "charted by the navigators Keyser and de Houtman in the southern hemisphere; on Plancius’s globe ({a}) and in Bayer’s atlas (1603)", "fr": "relevée par les navigateurs Keyser et de Houtman dans l’hémisphère sud ; sur le globe de Plancius ({a}) et dans l’atlas de Bayer (1603)", "de": "von den Seefahrern Keyser und de Houtman auf der Südhalbkugel kartiert; auf dem Globus von Plancius ({a}) und im Atlas von Bayer (1603)", "it": "tracciata dai navigatori Keyser e de Houtman nell’emisfero sud; nel globo di Plancius ({a}) e nell’atlante di Bayer (1603)", "nl": "in kaart gebracht door de zeevaarders Keyser en De Houtman op het zuidelijk halfrond; op de globe van Plancius ({a}) en in de atlas van Bayer (1603)", "zh": "由航海家凯泽和德豪特曼在南半球绘制；见于普朗修斯的天球仪（{a} 年）和拜耳的星图（1603 年）", "zht": "由航海家凱澤和德豪特曼在南半球繪製；見於普朗修斯的天球儀（{a} 年）和拜耳的星圖（1603 年）", "bg": "очертано от мореплавателите Кайзер и Де Хаутман в южното полукълбо; върху глобуса на Планциус ({a}) и в атласа на Байер (1603)", "pl": "wyznaczony przez żeglarzy Keysera i de Houtmana na półkuli południowej; na globusie Planciusa ({a}) i w atlasie Bayera (1603)"},
    "cieloConOrigenPlancius": {"es": "introducida por Petrus Plancius en {a}", "en": "introduced by Petrus Plancius in {a}", "fr": "introduite par Petrus Plancius en {a}", "de": "eingeführt von Petrus Plancius im Jahr {a}", "it": "introdotta da Petrus Plancius nel {a}", "nl": "ingevoerd door Petrus Plancius in {a}", "zh": "由普朗修斯于 {a} 年设立", "zht": "由普朗修斯於 {a} 年設立", "bg": "въведено от Петрус Планциус през {a} г.", "pl": "wprowadzony przez Petrusa Planciusa w {a} r."},
    "cieloConOrigenHevelius": {"es": "introducida por Johannes Hevelius ({a})", "en": "introduced by Johannes Hevelius ({a})", "fr": "introduite par Johannes Hevelius ({a})", "de": "eingeführt von Johannes Hevelius ({a})", "it": "introdotta da Johannes Hevelius ({a})", "nl": "ingevoerd door Johannes Hevelius ({a})", "zh": "由赫维留设立（{a} 年）", "zht": "由赫維留設立（{a} 年）", "bg": "въведено от Йохан Хевелий ({a})", "pl": "wprowadzony przez Jana Heweliusza ({a})"},
    "cieloConOrigenLacaille": {"es": "introducida por Nicolas-Louis de Lacaille desde el cabo de Buena Esperanza ({a})", "en": "introduced by Nicolas-Louis de Lacaille from the Cape of Good Hope ({a})", "fr": "introduite par Nicolas-Louis de Lacaille depuis le cap de Bonne-Espérance ({a})", "de": "eingeführt von Nicolas-Louis de Lacaille vom Kap der Guten Hoffnung aus ({a})", "it": "introdotta da Nicolas-Louis de Lacaille dal capo di Buona Speranza ({a})", "nl": "ingevoerd door Nicolas-Louis de Lacaille vanaf Kaap de Goede Hoop ({a})", "zh": "由拉卡伊在好望角设立（{a} 年）", "zht": "由拉卡伊在好望角設立（{a} 年）", "bg": "въведено от Никола-Луи дьо Лакай от нос Добра надежда ({a})", "pl": "wprowadzony przez Nicolasa-Louisa de Lacaille’a z Przylądka Dobrej Nadziei ({a})"},
    "cieloConOrigenArgo": {"es": "parte de la antigua Argo Navis de Ptolomeo, el barco de los argonautas, que Lacaille dividió en tres ({a})", "en": "part of Ptolemy’s ancient Argo Navis, the Argonauts’ ship, which Lacaille split into three ({a})", "fr": "partie de l’ancienne Argo Navis de Ptolémée, le navire des Argonautes, que Lacaille a divisée en trois ({a})", "de": "Teil der antiken Argo Navis des Ptolemäus, des Schiffs der Argonauten, die Lacaille dreiteilte ({a})", "it": "parte dell’antica Argo Navis di Tolomeo, la nave degli Argonauti, che Lacaille divise in tre ({a})", "nl": "deel van het antieke Argo Navis van Ptolemaeus, het schip van de Argonauten, dat Lacaille in drieën deelde ({a})", "zh": "托勒密古老的南船座（阿尔戈英雄之船）的一部分，拉卡伊于 {a} 年将其一分为三", "zht": "托勒密古老的南船座（阿爾戈英雄之船）的一部分，拉卡伊於 {a} 年將其一分為三", "bg": "част от древния Кораб Арго на Птолемей, кораба на аргонавтите, който Лакай раздели на три ({a})", "pl": "część starożytnego Okrętu Argo Ptolemeusza, statku Argonautów, który Lacaille podzielił na trzy ({a})"},
    /* Star Tales, Coma Berenices: Ptolomeo solo la anota como «a nebulous mass,
       called the lock», junto a la cola de Leo; «The group was first shown as a
       separate constellation in 1536, under the name Berenices Crinis» (Vopel). */
    "cieloConOrigenVopel": {"es": "un asterismo antiguo (Ptolomeo lo llama «el rizo», junto a la cola de Leo); constelación propia desde el globo de Caspar Vopel ({a})", "en": "an ancient asterism (Ptolemy calls it “the lock”, by Leo’s tail); a constellation of its own since Caspar Vopel’s globe ({a})", "fr": "un astérisme antique (Ptolémée l’appelle « la boucle », près de la queue du Lion) ; constellation à part entière depuis le globe de Caspar Vopel ({a})", "de": "ein antiker Asterismus (Ptolemäus nennt ihn „die Locke“, am Schwanz des Löwen); eigenes Sternbild seit dem Globus von Caspar Vopel ({a})", "it": "un asterismo antico (Tolomeo lo chiama «il ricciolo», presso la coda del Leone); costellazione a sé dal globo di Caspar Vopel ({a})", "nl": "een antiek asterisme (Ptolemaeus noemt het “de lok”, bij de staart van de Leeuw); een eigen sterrenbeeld sinds de globe van Caspar Vopel ({a})", "zh": "古老的星群（托勒密称之为“发绺”，在狮子座的尾巴旁）；自卡斯帕·福佩尔的天球仪（{a} 年）起成为独立星座", "zht": "古老的星群（托勒密稱之為「髮綹」，在獅子座的尾巴旁）；自卡斯帕·福佩爾的天球儀（{a} 年）起成為獨立星座", "bg": "древен астеризъм (Птолемей го нарича „къдрицата“, до опашката на Лъва); самостоятелно съзвездие от глобуса на Каспар Фопел ({a})", "pl": "starożytny asteryzm (Ptolemeusz nazywa go „lokiem”, przy ogonie Lwa); osobny gwiazdozbiór od globusa Caspara Vopela ({a})"},
    /* ── el tamaño ─────────────────────────────────────────────────────────────── */
    "cieloConArea": {"es": "Tamaño: {a} grados cuadrados, la n.º {r} de 88", "en": "Size: {a} square degrees, number {r} of 88", "fr": "Taille : {a} degrés carrés, la n° {r} sur 88", "de": "Größe: {a} Quadratgrad, Nummer {r} von 88", "it": "Dimensione: {a} gradi quadrati, la n. {r} di 88", "nl": "Grootte: {a} vierkante graden, nummer {r} van 88", "zh": "大小：{a} 平方度，88 个星座中排第 {r}", "zht": "大小：{a} 平方度，88 個星座中排第 {r}", "bg": "Размер: {a} квадратни градуса, № {r} от 88", "pl": "Rozmiar w stopniach kwadratowych: {a}, nr {r} z 88"},
    /* ── las etiquetas de las dos fuentes de la UAI (Wikipedia: la lista con el
       origen y la tabla por angulo solido con el tamaño), debajo de la curiosidad ── */
    "cieloConFuenteOrigen": {"es": "Wikipedia: origen", "en": "Wikipedia: origin", "fr": "Wikipedia : origine", "de": "Wikipedia: Herkunft", "it": "Wikipedia: origine", "nl": "Wikipedia: oorsprong", "zh": "Wikipedia：起源", "zht": "Wikipedia：起源", "bg": "Wikipedia: произход", "pl": "Wikipedia: pochodzenie"},
    "cieloConFuenteArea": {"es": "Wikipedia: tamaño", "en": "Wikipedia: size", "fr": "Wikipedia : taille", "de": "Wikipedia: Größe", "it": "Wikipedia: dimensione", "nl": "Wikipedia: grootte", "zh": "Wikipedia：大小", "zht": "Wikipedia：大小", "bg": "Wikipedia: размер", "pl": "Wikipedia: rozmiar"}
    /* Las curiosidades de las 88 constelaciones (cieloCurCon<Abr>, sexto
       bloque) ya no van en CIELO_UI: van en idiomas/cielo/<idioma>.json, un
       fichero por idioma, y lo que cita cada una, en datos/constelaciones.json
       (cita). Ver «LAS CURIOSIDADES, UN FICHERO POR IDIOMA», mas abajo. */
  };
  Object.assign(UI_TX, CIELO_UI);

  /* ── ESTADO ────────────────────────────────────────────────────── */
  var S = {
    abierto: false, pestana: 'noche', datos: null, carga: null, fallo: false,
    fecha: null,                      // 'AAAA-MM-DD' de la noche que se mira (hora de Canarias)
    noche: null, nocheFecha: null, nocheLang: null,
    eventos: null, eventosDia: null,
    cat: { tipo: 'todo', nivel: 0, estaNoche: false, busca: '' },
    cal: 'todo',
    mapa: { desfase: 0, az: 180, alt: 40, fov: 105, cenital: false, sel: null, lineas: true, nombres: true, profundo: true, t: null, corre: false, rastro: null },
    nubes: null, nubesPidiendo: false,
    sat: { datos: null, carga: null, fallo: false, pasos: {}, porClave: null },   // la Estacion Espacial y los satelites brillantes (21-10-2026)
    sis: { vista: 'int', t: null, base: null, corre: false, sel: null, orbitas: null, dianas: null, anim: null },   // el sistema solar hoy (21-10-2026)
    cacheListo: null,
    rojo: false
  };

  /* ── IDIOMA ────────────────────────────────────────────────────── */
  function lang() { return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'es'; }
  function T(k, v) { return (typeof tx === 'function' ? tx('cielo' + k, v) : '') || ''; }
  function nom(tabla, id) { var f = tabla[id]; return f ? (f[lang()] || f.en || f.es || '') : ''; }
  function loc() { return CIELO_LOCALE[lang()] || 'es-ES'; }
  function numero(x, dec) {
    if (x === null || x === undefined || !isFinite(x)) return '—';
    try { return Number(x).toLocaleString(loc(), { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }
    catch (e) { return String(Math.round(x)); }
  }
  /* La magnitud lleva signo: −1,4 es mas brillante que 1,4. Con el guion
     corto de la tipografia (U+2212) y no con un menos de teclado. */
  function mag(m) {
    if (m === null || m === undefined) return '—';
    var r = Math.round(m * 10) / 10 + 0;            // + 0: que −0,04 no salga «−0,0»
    return r < 0 ? '−' + numero(-r, 1) : numero(r, 1);
  }

  /* ── DOM ───────────────────────────────────────────────────────── */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }
  function fila(a, b) { var f = el('div', 'cielo-fila'); f.appendChild(el('span', null, a)); f.appendChild(el('span', null, b)); return f; }
  function tarjeta(titulo) { var t = el('div', 'cielo-tarjeta'); if (titulo) t.appendChild(el('h3', null, titulo)); return t; }
  /* Designaciones (M42, NGC 1976, α CMa) y nombres latinos: no se traducen,
     y se dice asi en el marcado para tools/auditar_sin_traducir.js. */
  function desig(txt, cls) { var s = el('span', cls || 'cielo-item-des', txt); s.setAttribute('data-sin-traducir', 'designacion astronomica'); return s; }
  /* El nombre de algo que no tiene nombre corriente es su designacion
     («M35 · NGC 2168», «β Mon»): sale tal cual y se marca igual. */
  function nombreODesig(tag, cls, nombre, designacion) {
    var e = el(tag, cls, nombre || designacion);
    if (!nombre || nombre === designacion) e.setAttribute('data-sin-traducir', 'designacion astronomica');
    else if (esNombreIAU(nombre)) e.setAttribute('data-sin-traducir', 'nombre propio de la UAI');
    return e;
  }
  /* Los nombres propios de la UAI de las estrellas que no estan en CIELO_EST
     («Dalim», «Alkes») salen tal cual en los diez idiomas: la UAI los fija en
     latin y Stellarium no los traduce. Se marcan como los demas nombres que
     no se traducen (22-10-2026: el barrido vio «Dalim» en chino y bulgaro). */
  var _iau = null;
  function esNombreIAU(n) {
    if (!_iau) { var t = S.datos && S.datos.nombresIAU; if (!t) return false; _iau = {}; for (var k in t) _iau[t[k]] = true; }
    return !!_iau[n];
  }
  function nivelChip(n) {
    var s = el('span', 'cielo-niv cielo-niv' + n, T(['', 'Niv1', 'Niv2', 'Niv3'][n]));
    s.title = T(['', 'Niv1Ayuda', 'Niv2Ayuda', 'Niv3Ayuda'][n]);
    return s;
  }

  /* ── HORA DE CANARIAS ──────────────────────────────────────────────
     Todo se ensena en hora de Canarias, este el movil donde este: quien
     planea el viaje desde Berlin tiene que ver la hora a la que pasara en el
     Teide, no la de su casa. Intl hace el cambio de hora de verano. */
  var _partes = null;
  function partes(d) {
    if (!_partes) _partes = new Intl.DateTimeFormat('en-GB', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    var o = {};
    _partes.formatToParts(d).forEach(function (p) { if (p.type !== 'literal') o[p.type] = +p.value; });
    if (o.hour === 24) o.hour = 0;
    return o;
  }
  function dos(n) { return (n < 10 ? '0' : '') + n; }
  function desfaseMin(d) { var p = partes(d); return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - d.getTime()) / 60000); }
  function fechaLocal(d) { var p = partes(d); return p.year + '-' + dos(p.month) + '-' + dos(p.day); }
  function instanteLocal(fecha, h, mi) {
    var a = fecha.split('-').map(Number);
    var base = Date.UTC(a[0], a[1] - 1, a[2], h, mi || 0);
    var d = new Date(base - desfaseMin(new Date(base)) * 60000);
    return new Date(base - desfaseMin(d) * 60000);
  }
  function sumarDias(fecha, n) { var a = fecha.split('-').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2] + n, 12)).toISOString().slice(0, 10); }
  /* «Esta noche» a las dos de la madrugada es la que empezo ayer; a las
     nueve de la manana, en cambio, ya es la que viene (hasta el 21 de
     octubre el corte estaba a mediodia y en el desayuno salia la noche
     pasada). El Sol sale en Izaña entre las 7:01 y las 8:12, hora local,
     segun el dia del ano (calculado con el motor para 2026). */
  function nocheDeHoy() { var ahora = new Date(); return partes(ahora).hour < 7 ? sumarDias(fechaLocal(ahora), -1) : fechaLocal(ahora); }
  var _fmt = {};
  function fmt(d, o) {
    var k = loc() + '|' + JSON.stringify(o);
    if (!_fmt[k]) { var oo = { timeZone: ZONA }; for (var i in o) oo[i] = o[i]; _fmt[k] = new Intl.DateTimeFormat(loc(), oo); }
    return _fmt[k].format(d);
  }
  function hora(d) { return d ? fmt(d, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : '—'; }
  function dia(d) { return fmt(d, { weekday: 'short', day: 'numeric', month: 'short' }); }
  function diaAnio(d) { return fmt(d, { day: 'numeric', month: 'short', year: 'numeric' }); }
  function mesAnio(d) { var s = fmt(d, { month: 'long', year: 'numeric' }); return s.charAt(0).toUpperCase() + s.slice(1); }
  function aFecha(t) { return t ? (t.date || t) : null; }

  /* ── CARGA PEREZOSA ────────────────────────────────────────────────
     Ni el motor (115 kB) ni el catalogo (180 kB) se piden al arrancar la
     app: solo la primera vez que alguien abre el panel. El service worker
     los guarda desde la instalacion, asi que en el Teide sin cobertura
     tambien abren. */
  function cargar() {
    if (S.carga) return S.carga;
    var motor = new Promise(function (ok, mal) {
      if (window.Astronomy) return ok();
      var s = document.createElement('script');
      s.src = './vendor/astronomy.browser.min.js';
      s.onload = function () { if (window.Astronomy) ok(); else mal(new Error('motor')); };
      s.onerror = function () { mal(new Error('motor')); };
      document.head.appendChild(s);
    });
    var datos = fetch('./datos/cielo.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
    S.carga = Promise.all([motor, datos]).then(function (x) { S.datos = x[1]; preparar(); S.fallo = false; },
      function (e) { S.carga = null; S.fallo = true; throw e; });
    return S.carga;
  }

  /* Vectores unitarios J2000 de todo lo fijo, una vez: girarlos al horizonte
     de un instante son nueve multiplicaciones por estrella. Van en .v, asi que
     ningun registro del catalogo puede traer un campo «v»: se pisaria (lo
     vigila tools/auditar_cielo.js). */
  function unitario(raDeg, decDeg) {
    var a = raDeg * Math.PI / 180, d = decDeg * Math.PI / 180;
    return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
  }
  function preparar() {
    var D = S.datos;
    D.est.forEach(function (s) { s.v = unitario(s[0], s[1]); });
    D.objetos.forEach(function (o) { o.v = unitario(o.ra, o.dec); });
    D.estrellas.forEach(function (o) { o.v = unitario(o.ra, o.dec); });
    D.dobles.forEach(function (o) { o.v = unitario(o.ra, o.dec); });
    D.variables.forEach(function (o) {
      var s = D.estrellas.filter(function (e) { return e.h === o.h; })[0];
      var b = null;
      for (var i = 0; i < D.est.length; i++) if (D.est[i][4] === o.h) { b = D.est[i]; break; }
      o.ra = s ? s.ra : (b ? b[0] : 0); o.dec = s ? s.dec : (b ? b[1] : 0);
      o.v = unitario(o.ra, o.dec);
    });
    Object.keys(D.con).forEach(function (k) {
      var c = D.con[k]; c.etV = c.et.map(function (e) { return unitario(e[0], e[1]); }); c.v = c.etV[0];
    });
    /* las figuras y la Via Lactea, tambien en vectores: la carta las gira en
       cada redibujo, y con el dedo se redibuja muchas veces por segundo */
    D.via.forEach(function (pol) {
      pol.v = pol[1].map(function (p) { return unitario(p[0], p[1]); });
      /* lo cerca que queda del centro de la galaxia (0 a 1): la carta pinta
         mas calido y denso el trozo de Sagitario y Escorpio, como se ve */
      var c = [0, 0, 0];
      pol.v.forEach(function (v) { c[0] += v[0]; c[1] += v[1]; c[2] += v[2]; });
      pol.tibio = Math.max(0, 1 - Math.acos(Math.max(-1, Math.min(1, pto(unir(c), CENTRO_GALAXIA)))) / RAD / 70);
    });
    D.linV = {};
    Object.keys(D.lin).forEach(function (c) { D.linV[c] = D.lin[c].map(function (tr) { return tr.map(function (p) { return unitario(p[0], p[1]); }); }); });
    D.porId = {};
    D.objetos.forEach(function (o) { D.porId[o.id] = o; });
  }

  /* ── EL CIELO EN UN INSTANTE ───────────────────────────────────── */
  var _obs = null;
  function obs() { return _obs || (_obs = new Astronomy.Observer(OBS.lat, OBS.lon, OBS.h)); }
  function rotacion(t) { return Astronomy.Rotation_EQJ_HOR(t, obs()).rot; }
  /* J2000 -> horizonte con la matriz del instante: x norte, y oeste, z cenit */
  function aHorizonte(r, v) {
    var x = r[0][0] * v[0] + r[1][0] * v[1] + r[2][0] * v[2];
    var y = r[0][1] * v[0] + r[1][1] * v[1] + r[2][1] * v[2];
    var z = r[0][2] * v[0] + r[1][2] * v[1] + r[2][2] * v[2];
    var alt = Math.asin(Math.max(-1, Math.min(1, z))) * 180 / Math.PI;
    var az = Math.atan2(-y, x) * 180 / Math.PI; if (az < 0) az += 360;
    if (alt > -2) alt += Astronomy.Refraction('normal', alt);
    return { alt: alt, az: az };
  }
  function cuerpoHorizonte(cuerpo, t) {
    var eq = Astronomy.Equator(cuerpo, t, obs(), true, true);
    var h = Astronomy.Horizon(t, obs(), eq.ra, eq.dec, 'normal');
    return { alt: h.altitude, az: h.azimuth };
  }
  function constelacionDe(cuerpo, t) {
    var j = Astronomy.Equator(cuerpo, t, obs(), false, true);
    return Astronomy.Constellation(j.ra, j.dec).symbol;
  }
  var RUMBOS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  /* rumbo: la abreviatura de la carta («SO»); hacia: la de las frases («hacia el suroeste») */
  function rumbo(az) { return T('Rumbo' + RUMBOS[Math.round(az / 45) % 8]); }
  function hacia(az) { return T('Hacia' + RUMBOS[Math.round(az / 45) % 8]); }

  /* ── LA NOCHE ──────────────────────────────────────────────────── */
  function calcularNoche(fecha) {
    var A = Astronomy, o = obs();
    var t0 = A.MakeTime(instanteLocal(fecha, 12, 0));
    var ocaso = A.SearchRiseSet(A.Body.Sun, o, -1, t0, 1);
    var oscuro = A.SearchAltitude(A.Body.Sun, o, -1, ocaso, 1, -18);
    var claro = A.SearchAltitude(A.Body.Sun, o, +1, oscuro, 1, -18);
    var orto = A.SearchRiseSet(A.Body.Sun, o, +1, claro, 1);
    var civilT = A.SearchAltitude(A.Body.Sun, o, -1, ocaso, 1, -6);
    var civilM = A.SearchAltitude(A.Body.Sun, o, +1, claro, 1, -6);
    var largo = orto.ut - ocaso.ut;
    /* muestras cada 5 minutos: Sol y Luna */
    var m = [], paso = 5 / 1440;
    for (var u = ocaso.ut; u <= orto.ut + 1e-9; u += paso) {
      var t = A.MakeTime(u);
      m.push({ u: u, luna: cuerpoHorizonte(A.Body.Moon, t).alt });
    }
    /* Los tramos sin Luna, con sus bordes de verdad: la noche cerrada empieza
       y acaba a su hora exacta (oscuro, claro), y si la Luna sale o se pone
       entre dos muestras se busca la hora exacta, la misma que da la tarjeta
       de la Luna (borde superior y refraccion). Con los bordes en la muestra
       las puntas se quedaban hasta cinco minutos cortas, y contando muestras
       el total salia cinco minutos largo («6 h 15 min» para 00:39-06:49):
       el total es ahora la suma de los tramos que se ensenan. */
    var tramos = [], ini = null, ant = null, sinLuna = 0;
    function corte(a, b) {
      var t = A.SearchRiseSet(A.Body.Moon, o, a.luna < 0 ? +1 : -1, A.MakeTime(a.u), b.u - a.u + 2 / 1440);
      return t && t.ut <= b.u + 2 / 1440 ? t.ut : a.u + (b.u - a.u) * a.luna / (a.luna - b.luna);
    }
    m.forEach(function (x) {
      var ok = x.u >= oscuro.ut && x.u <= claro.ut && x.luna < 0;
      if (ok && ini === null) ini = Math.max(oscuro.ut, ant && ant.luna >= 0 ? corte(ant, x) : oscuro.ut);
      if (!ok && ini !== null) { tramos.push([ini, Math.min(claro.ut, x.luna >= 0 ? corte(ant, x) : claro.ut)]); ini = null; }
      ant = x;
    });
    if (ini !== null) tramos.push([ini, claro.ut]);
    tramos.forEach(function (t) { sinLuna += t[1] - t[0]; });
    var lunaArriba = [], li = null;
    m.forEach(function (x) {
      if (x.luna >= 0 && li === null) li = x.u;
      if (x.luna < 0 && li !== null) { lunaArriba.push([li, x.u]); li = null; }
    });
    if (li !== null) lunaArriba.push([li, orto.ut]);
    var medio = A.MakeTime((oscuro.ut + claro.ut) / 2);
    var ilum = A.Illumination(A.Body.Moon, medio);
    var lunaSale = A.SearchRiseSet(A.Body.Moon, o, +1, ocaso, largo);
    var lunaPone = A.SearchRiseSet(A.Body.Moon, o, -1, ocaso, largo);
    return {
      fecha: fecha, ocaso: ocaso, oscuro: oscuro, claro: claro, orto: orto, civilT: civilT, civilM: civilM,
      muestras: m, sinLuna: sinLuna * 24, tramos: tramos, lunaArriba: lunaArriba,
      fase: A.MoonPhase(medio), ilum: ilum.phase_fraction, lunaSale: lunaSale, lunaPone: lunaPone,
      lunaCon: constelacionDe(A.Body.Moon, medio)
    };
  }
  function noche() {
    if (!S.noche || S.nocheFecha !== S.fecha) { S.noche = calcularNoche(S.fecha); S.nocheFecha = S.fecha; }
    return S.noche;
  }

  /* La fase, en ocho nombres: 0 nueva, 90 cuarto creciente, 180 llena... */
  var FASES = ['Nueva', 'Creciente', 'CuartoCreciente', 'GibosaCreciente', 'Llena', 'GibosaMenguante', 'CuartoMenguante', 'Menguante'];
  function nombreFase(f) { return T('Fase' + FASES[Math.round(f / 45) % 8]); }

  /* El dibujo de la Luna: el borde iluminado es medio circulo y el
     terminador media elipse de semieje r*|cos(fase)|. Creciente, iluminada
     por la derecha (visto desde el hemisferio norte). */
  function dibujoLuna(fase, tam) {
    var NS = 'http://www.w3.org/2000/svg', r = tam / 2 - 1, c = tam / 2;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + tam + ' ' + tam); svg.setAttribute('width', tam); svg.setAttribute('height', tam);
    svg.setAttribute('class', 'cielo-luna-dibujo'); svg.setAttribute('aria-hidden', 'true');
    var fondo = document.createElementNS(NS, 'circle');
    fondo.setAttribute('cx', c); fondo.setAttribute('cy', c); fondo.setAttribute('r', r);
    fondo.setAttribute('fill', '#1c2133'); fondo.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    svg.appendChild(fondo);
    var th = fase * Math.PI / 180, rx = Math.abs(Math.cos(th)) * r;
    var creciente = fase < 180;
    var limbo = creciente ? 1 : 0;                   // lado iluminado: derecha si creciente
    var gibosa = Math.cos(th) < 0;
    var p = document.createElementNS(NS, 'path');
    var d = 'M ' + c + ' ' + (c - r) +
      ' A ' + r + ' ' + r + ' 0 0 ' + limbo + ' ' + c + ' ' + (c + r) +
      ' A ' + rx + ' ' + r + ' 0 0 ' + (gibosa ? limbo : 1 - limbo) + ' ' + c + ' ' + (c - r) + ' Z';
    p.setAttribute('d', d); p.setAttribute('fill', '#f2ecd0');
    svg.appendChild(p);
    return svg;
  }

  /* ── PLANETAS DE LA NOCHE ──────────────────────────────────────── */
  var PLANETAS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  function planetasNoche(n) {
    if (n._planetas) return n._planetas;
    var A = Astronomy, res = [], paso = 10 / 1440, sol = [];
    for (var u = n.ocaso.ut; u <= n.orto.ut; u += paso) sol.push({ u: u, t: A.MakeTime(u), alt: cuerpoHorizonte(A.Body.Sun, A.MakeTime(u)).alt });
    PLANETAS.forEach(function (p) {
      var cuerpo = A.Body[p], desde = null, hasta = null, mejor = null;
      sol.forEach(function (s) {
        if (s.alt > -6) return;
        var h = cuerpoHorizonte(cuerpo, s.t);
        if (h.alt >= 5) {
          if (!desde) desde = s.t;
          hasta = s.t;
          if (!mejor || h.alt > mejor.alt) mejor = { t: s.t, alt: h.alt, az: h.az };
        }
      });
      if (!mejor) return;
      var il = A.Illumination(cuerpo, mejor.t);
      res.push({ p: p, desde: desde, hasta: hasta, mejor: mejor, mag: il.mag, con: constelacionDe(cuerpo, mejor.t),
                 niv: il.mag <= 5.0 ? 1 : (il.mag <= 8.5 ? 2 : 3) });
    });
    res.sort(function (a, b) { return a.mag - b.mag; });
    return (n._planetas = res);
  }

  /* ── LO MEJOR DE LA NOCHE ──────────────────────────────────────────
     Para cada objeto, la altura maxima en plena noche (Sol bajo -18) cada
     20 minutos. Con Luna brillante arriba buena parte de la noche, las
     galaxias y nebulosas se apagan: se ensenan cumulos y dobles. */
  function alturasNoche(n) {
    if (n.giros) return n.giros;
    var g = [];
    for (var u = n.oscuro.ut; u <= n.claro.ut + 1e-9; u += 20 / 1440) g.push({ u: u, r: rotacion(Astronomy.MakeTime(u)) });
    return (n.giros = g);
  }
  function maxNoche(n, v) {
    var g = alturasNoche(n), mejor = null;
    for (var i = 0; i < g.length; i++) { var h = aHorizonte(g[i].r, v); if (!mejor || h.alt > mejor.alt) mejor = { u: g[i].u, alt: h.alt, az: h.az }; }
    return mejor;
  }
  function lunaMolesta(n) {
    var arriba = 0; n.lunaArriba.forEach(function (x) { arriba += Math.max(0, Math.min(x[1], n.claro.ut) - Math.max(x[0], n.oscuro.ut)); });
    return n.ilum > 0.5 && arriba > (n.claro.ut - n.oscuro.ut) * 0.4;
  }
  var DEBILES = { gal: 1, neb: 1, snr: 1, pla: 1, osc: 1 };
  function mejoresNoche(n) {
    if (n._mejores) return n._mejores;
    var D = S.datos, molesta = lunaMolesta(n), out = { 1: [], 2: [], 3: [] };
    var cand = [];
    D.objetos.forEach(function (o) { if (o.niv) cand.push({ k: 'obj', o: o, niv: o.niv, m: o.m === null ? 9 : o.m, debil: !!DEBILES[o.t] }); });
    D.dobles.forEach(function (o) { if (o.id !== 'eps1-lyr' && o.id !== 'eps2-lyr') cand.push({ k: 'dob', o: o, niv: o.niv, m: o.m1, debil: false }); });
    cand.forEach(function (c) {
      if (molesta && c.debil && c.niv > 1) return;
      var x = maxNoche(n, c.o.v);
      if (x.alt < 30) return;
      c.x = x;
      /* Messier primero, luego lo brillante; la altura desempata */
      c.p = (c.k === 'obj' && c.o.M ? 0 : 1) * 3 + c.m - x.alt / 30;
      out[c.niv].push(c);
    });
    [1, 2, 3].forEach(function (k) { out[k].sort(function (a, b) { return a.p - b.p; }); out[k] = out[k].slice(0, 4); });
    out.molesta = molesta;
    return (n._mejores = out);
  }

  /* El centro de la Via Lactea (Sagitario A*, J2000 266,40 / -28,94):
     cuando esta a mas de 10 grados en plena noche y sin Luna. Si no se ve,
     se dice por que: o la Luna esta arriba cuando el centro sube, o en esta
     epoca el centro no esta alto de noche (y entonces, cuando vuelve). */
  var CENTRO_GALAXIA = unitario(266.405, -28.936);
  function viaLacteaNoche(n) {
    if (n._via) return n._via;
    var g = alturasNoche(n), desde = null, hasta = null, mejor = null, alta = false;
    g.forEach(function (x) {
      var conLuna = n.lunaArriba.some(function (l) { return x.u >= l[0] && x.u <= l[1]; }) && n.ilum > 0.25;
      var h = aHorizonte(x.r, CENTRO_GALAXIA);
      if (h.alt >= 10) alta = true;
      if (h.alt >= 10 && !conLuna) { if (desde === null) desde = x.u; hasta = x.u; if (!mejor || h.alt > mejor.alt) mejor = { u: x.u, alt: h.alt, az: h.az }; }
    });
    return (n._via = mejor ? { desde: desde, hasta: hasta, mejor: mejor } : { motivo: alta ? 'luna' : 'abajo' });
  }
  /* La primera noche, a partir de `fecha`, en que el centro de la galaxia
     pasa de 10 grados con el Sol bajo -18 (la Luna no cuenta: cambia cada
     semana). Se mira de semana en semana y se afina dia a dia. */
  function centroAltoEn(fecha) {
    var n = calcularNocheLigera(fecha), A = Astronomy;
    for (var u = n.oscuro.ut; u <= n.claro.ut; u += 20 / 1440) if (aHorizonte(rotacion(A.MakeTime(u)), CENTRO_GALAXIA).alt >= 10) return true;
    return false;
  }
  function vuelveViaLactea(fecha) {
    if (S._vuelve && S._vuelve.desde === fecha) return S._vuelve.f;
    var f = null, ant = fecha;
    for (var i = 7; i <= 371; i += 7) {
      var x = sumarDias(fecha, i);
      if (centroAltoEn(x)) {
        for (var d = 1; d <= 7; d++) { var y = sumarDias(ant, d); if (centroAltoEn(y)) { f = y; break; } }
        break;
      }
      ant = x;
    }
    S._vuelve = { desde: fecha, f: f };
    return f;
  }

  /* ── CALENDARIO: TODO SE CALCULA, NADA SE ESCRIBE ──────────────────
     Ni una fecha de esta lista esta escrita en el fuente. Las lluvias salen
     de la longitud solar de su maximo (λ⊙, lista de la IMO), los eclipses del
     motor con el observador en Izana, y lo demas de las efemerides. Asi el
     calendario de 2031 sale igual de bien que el de este ano. */
  var _rotEcl = null;
  function lonSolar(t) {
    var A = Astronomy;
    if (!_rotEcl) _rotEcl = A.Rotation_EQJ_ECL();
    return A.SphereFromVector(A.RotateVector(_rotEcl, A.GeoVector(A.Body.Sun, t, true))).lon;
  }
  function difAng(a, b) { return ((a - b + 540) % 360) - 180; }
  /* primer instante despues de `desde` (y antes de `dias`) en que el Sol esta
     en la longitud eclíptica J2000 `lon` */
  function cuandoLonSolar(lon, desde, dias) {
    var A = Astronomy, t = A.MakeTime(desde), d0 = difAng(lonSolar(t), lon);
    for (var i = 1; i <= dias; i++) {
      var t1 = t.AddDays(1), d1 = difAng(lonSolar(t1), lon);
      if (d0 < 0 && d1 >= 0) {
        var a = t, b = t1;
        for (var k = 0; k < 32; k++) { var mm = a.AddDays((b.ut - a.ut) / 2); if (difAng(lonSolar(mm), lon) < 0) a = mm; else b = mm; }
        return a;
      }
      t = t1; d0 = d1;
    }
    return null;
  }
  function luzLuna(t) { return Astronomy.Illumination(Astronomy.Body.Moon, t).phase_fraction; }

  function eventosLluvias(desde, hasta) {
    var A = Astronomy, out = [];
    S.datos.lluvias.forEach(function (l) {
      var t = cuandoLonSolar(l.l, A.MakeTime(desde).AddDays(-3), 400);
      while (t && t.date < hasta) {
        /* La noche que mejor viene: la de la fecha local del maximo si cae de
           noche o por la tarde, y si cae de manana, la anterior. */
        var p = partes(t.date), f = fechaLocal(t.date);
        var fn = p.hour < 12 ? sumarDias(f, -1) : f;
        var n = calcularNocheLigera(fn);
        var rad = unitario(l.ra, l.dec), mejor = null;
        for (var u = n.oscuro.ut; u <= n.claro.ut; u += 15 / 1440) {
          var h = aHorizonte(rotacion(A.MakeTime(u)), rad);
          if (!mejor || h.alt > mejor.alt) mejor = { u: u, alt: h.alt, az: h.az };
        }
        var luz = luzLuna(A.MakeTime(mejor.u));
        var lunaAlt = cuerpoHorizonte(A.Body.Moon, A.MakeTime(mejor.u)).alt;
        var cond = lunaAlt < 0 || luz < 0.3 ? 'Buenas' : (luz < 0.7 ? 'Regulares' : 'Malas');
        out.push({ tipo: 'lluvia', t: t.date, l: l, mejor: mejor, luz: luz, lunaArriba: lunaAlt >= 0, cond: cond, fn: fn });
        t = cuandoLonSolar(l.l, t.AddDays(300), 130);
      }
    });
    return out;
  }
  /* La noche sin muestras de Luna: para las lluvias basta con el Sol */
  function calcularNocheLigera(fecha) {
    var A = Astronomy, o = obs();
    var ocaso = A.SearchRiseSet(A.Body.Sun, o, -1, A.MakeTime(instanteLocal(fecha, 12, 0)), 1);
    var oscuro = A.SearchAltitude(A.Body.Sun, o, -1, ocaso, 1, -18);
    var claro = A.SearchAltitude(A.Body.Sun, o, +1, oscuro, 1, -18);
    return { oscuro: oscuro, claro: claro };
  }

  function eventosEclipses(desde, hasta) {
    var A = Astronomy, out = [], o = obs();
    /* Sol: circunstancias locales en Izana. El tipo «total» o «anular» es el
       del eclipse en la Tierra; desde Tenerife se ve parcial y se dice. */
    var e = A.SearchLocalSolarEclipse(desde, o);
    while (e && e.peak.time.date < hasta) {
      var alts = [e.partial_begin.altitude, e.peak.altitude, e.partial_end.altitude];
      if (Math.max.apply(null, alts) > 0) {
        var g = A.SearchGlobalSolarEclipse(e.peak.time.AddDays(-1));
        out.push({ tipo: 'eclipseSol', t: e.peak.time.date, global: g ? g.kind : e.kind, local: e.kind, obsc: e.obscuration,
                   ini: e.partial_begin, pico: e.peak, fin: e.partial_end });
      }
      e = A.NextLocalSolarEclipse(e.peak.time, o);
    }
    /* Luna: se ve si la Luna esta sobre el horizonte durante la fase que
       importa (la sombra; en un penumbral, la penumbra). */
    var l = A.SearchLunarEclipse(desde);
    while (l && l.peak.date < hasta) {
      var pk = l.peak, mitad = l.kind === 'penumbral' ? l.sd_penum : l.sd_partial;
      var a = pk.AddDays(-mitad / 1440), b = pk.AddDays(mitad / 1440), arriba = 0, total = 0, salePone = null, prevAlt = null;
      for (var u = a.ut; u <= b.ut + 1e-9; u += 4 / 1440) {
        var al = cuerpoHorizonte(A.Body.Moon, A.MakeTime(u)).alt;
        total++; if (al > 0) arriba++;
        if (prevAlt !== null && prevAlt <= 0 && al > 0) salePone = 'Sale';
        if (prevAlt !== null && prevAlt > 0 && al <= 0) salePone = 'Pone';
        prevAlt = al;
      }
      if (arriba > 0) {
        var c = function (min) { return pk.AddDays(min / 1440).date; };
        out.push({ tipo: 'eclipseLuna', t: pk.date, kind: l.kind, obsc: l.obscuration, entero: arriba === total, salePone: salePone,
                   p1: c(-l.sd_penum), u1: l.sd_partial ? c(-l.sd_partial) : null, u2: l.sd_total ? c(-l.sd_total) : null,
                   u3: l.sd_total ? c(l.sd_total) : null, u4: l.sd_partial ? c(l.sd_partial) : null, p4: c(l.sd_penum),
                   altPico: cuerpoHorizonte(A.Body.Moon, pk).alt });
      }
      l = A.NextLunarEclipse(pk);
    }
    return out;
  }

  function eventosPlanetas(desde, hasta) {
    var A = Astronomy, out = [];
    ['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].forEach(function (p) {
      var t = A.SearchRelativeLongitude(A.Body[p], 0, desde);
      if (t && t.date < hasta) out.push({ tipo: 'oposicion', t: t.date, p: p, mag: A.Illumination(A.Body[p], t).mag, con: constelacionDe(A.Body[p], t) });
    });
    ['Mercury', 'Venus'].forEach(function (p) {
      var e = A.SearchMaxElongation(A.Body[p], desde);
      while (e && e.time.date < hasta) {
        out.push({ tipo: 'elongacion', t: e.time.date, p: p, elong: e.elongation, vis: e.visibility, mag: A.Illumination(A.Body[p], e.time).mag });
        e = A.SearchMaxElongation(A.Body[p], e.time.AddDays(10));
      }
    });
    /* Conjunciones entre planetas a simple vista, de menos de 1,5 grados y
       lejos del Sol (20 grados), que si no no se ven. */
    var V = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    var sep = function (a, b, t) { return A.AngleBetween(A.GeoVector(A.Body[a], t, true), A.GeoVector(A.Body[b], t, true)); };
    for (var i = 0; i < V.length; i++) for (var j = i + 1; j < V.length; j++) {
      var t0 = A.MakeTime(desde), prev = sep(V[i], V[j], t0), prev2 = null;
      for (var d = 1; t0.AddDays(d).date < hasta; d++) {
        var td = t0.AddDays(d), s = sep(V[i], V[j], td);
        if (prev2 !== null && prev < prev2 && prev <= s && prev < 2) {
          /* minimo en el dia anterior: se afina en ±1 dia */
          var a = t0.AddDays(d - 2), b = td;
          for (var k = 0; k < 30; k++) {
            var m1 = a.AddDays((b.ut - a.ut) / 3), m2 = a.AddDays(2 * (b.ut - a.ut) / 3);
            if (sep(V[i], V[j], m1) < sep(V[i], V[j], m2)) b = m2; else a = m1;
          }
          var tm = a.AddDays((b.ut - a.ut) / 2), sm = sep(V[i], V[j], tm);
          var lejos = Math.min(A.AngleFromSun(A.Body[V[i]], tm), A.AngleFromSun(A.Body[V[j]], tm));
          if (sm < 1.5 && lejos > 20) out.push({ tipo: 'conjuncion', t: tm.date, a: V[i], b: V[j], sep: sm });
        }
        prev2 = prev; prev = s;
      }
    }
    return out;
  }

  function eventosSolLuna(desde, hasta) {
    var A = Astronomy, out = [];
    [desde.getUTCFullYear(), desde.getUTCFullYear() + 1].forEach(function (y) {
      var s = A.Seasons(y);
      [['EquinoccioMarzo', s.mar_equinox], ['SolsticioJunio', s.jun_solstice], ['EquinoccioSeptiembre', s.sep_equinox], ['SolsticioDiciembre', s.dec_solstice]]
        .forEach(function (x) { if (x[1].date >= desde && x[1].date < hasta) out.push({ tipo: 'estacion', t: x[1].date, k: x[0] }); });
    });
    /* La Luna llena mas cercana de los proximos doce meses (la que algunos
       llaman «superluna»: aqui se dice lo que es, la distancia). */
    var q = A.SearchMoonQuarter(desde), llenas = [];
    while (q && q.time.date < hasta) {
      if (q.quarter === 2) llenas.push({ t: q.time, km: A.GeoMoon(q.time).Length() * A.KM_PER_AU });
      q = A.NextMoonQuarter(q);
    }
    if (llenas.length) {
      var c = llenas.reduce(function (a, b) { return b.km < a.km ? b : a; });
      out.push({ tipo: 'lunaCerca', t: c.t.date, km: c.km });
    }
    return out;
  }

  /* Las cuatro fases de cada mes (el calendario lunar que piden las
     reseñas), tal como las da el motor. */
  function eventosFases(desde, hasta) {
    var A = Astronomy, q = A.SearchMoonQuarter(desde), out = [];
    while (q && q.time.date < hasta) { out.push({ tipo: 'fase', t: q.time.date, q: q.quarter }); q = A.NextMoonQuarter(q); }
    return out;
  }
  /* ── RETROGRADOS ──────────────────────────────────────────────────
     Un planeta «retrograda» cuando su longitud ecliptica geocentrica deja
     de crecer y vuelve atras unas semanas: perspectiva, un planeta adelanta
     al otro en su orbita. Los puntos estacionarios son donde la velocidad en
     longitud cambia de signo: muestras diarias (cada dos dias los
     exteriores, que van despacio) y biseccion hasta el minuto. Se mira con
     margen a los dos lados para dar, de cada principio, su final, y de cada
     final, su principio. Cotejado con dos tablas publicadas en
     tools/auditar_cielo.js (parte 10). */
  var RETRO = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  function lonGeo(b, t) {
    var A = Astronomy;
    if (!_rotEcl) _rotEcl = A.Rotation_EQJ_ECL();
    return A.SphereFromVector(A.RotateVector(_rotEcl, A.GeoVector(b, t, true))).lon;
  }
  function velLon(b, t) { var h = 0.05; return difAng(lonGeo(b, t.AddDays(h)), lonGeo(b, t.AddDays(-h))) / (2 * h); }
  function eventosRetrogrados(desde, hasta) {
    var A = Astronomy, out = [], margen = 160;
    RETRO.forEach(function (p) {
      var b = A.Body[p], t = A.MakeTime(desde).AddDays(-margen), fin = A.MakeTime(hasta).AddDays(margen);
      var paso = p === 'Mercury' || p === 'Venus' ? 1 : 2, v0 = velLon(b, t), est = [];
      while (t.ut < fin.ut) {
        var t1 = t.AddDays(paso), v1 = velLon(b, t1);
        if ((v0 < 0) !== (v1 < 0)) {
          var a = t, c = t1, va = v0;
          for (var k = 0; k < 22; k++) { var m = a.AddDays((c.ut - a.ut) / 2), vm = velLon(b, m); if ((vm < 0) === (va < 0)) { a = m; va = vm; } else c = m; }
          est.push({ t: a.AddDays((c.ut - a.ut) / 2), ini: v1 < 0 });
        }
        t = t1; v0 = v1;
      }
      est.forEach(function (e, i) {
        if (e.t.date < desde || e.t.date >= hasta) return;
        var par = e.ini ? est[i + 1] : est[i - 1];
        out.push({ tipo: 'retro', t: e.t.date, p: p, ini: e.ini, otro: par ? par.t.date : null, con: constelacionDe(b, e.t) });
      });
    });
    return out;
  }

  /* Doce meses desde hoy (los eclipses, tres anos). `fecha` (AAAA-MM-DD) es
     para las pruebas: tools/auditar_cielo.js pide el calendario desde un dia
     fijo para cotejarlo con el IGN, el IMCCE y la IMO; ese no se guarda. */
  function eventos(fecha) {
    var hoy = fecha || fechaLocal(new Date());
    if (!fecha && S.eventos && S.eventosDia === hoy) return S.eventos;
    var desde = instanteLocal(hoy, 0, 0), hasta = new Date(desde.getTime() + 366 * 864e5);
    var hastaEcl = new Date(desde.getTime() + 3 * 366 * 864e5);
    var ev = [].concat(eventosLluvias(desde, hasta), eventosEclipses(desde, hastaEcl), eventosPlanetas(desde, hasta), eventosSolLuna(desde, hasta),
                       eventosFases(desde, hasta), eventosRetrogrados(desde, hasta));
    ev.sort(function (a, b) { return a.t - b.t; });
    if (fecha) return ev;
    S.eventosDia = hoy;
    return (S.eventos = ev);
  }

  /* ── CATALOGO ──────────────────────────────────────────────────── */
  var ICONO = { abi: '✨', aso: '✨', glo: '🔆', cne: '🌫️', neb: '🌫️', snr: '💥', pla: '💠', osc: '🌑', gal: '🌀', dob: '⚪', ast: '✳️' };
  function nombreObjeto(o) {
    var n = nom(CIELO_OBJ, o.id);
    return n || '';
  }
  function designacionObjeto(o) {
    var p = [];
    if (o.M) p.push('M' + o.M);
    if (o.C) p.push('C' + o.C);
    if (o.d) p.push(o.d);
    if (!p.length) p.push({ Cl399: 'Collinder 399', Mel111: 'Melotte 111', B33: 'Barnard 33' }[o.id] || o.id);
    return p.join(' · ');
  }
  function nombreEstrella(h) { return nom(CIELO_EST, String(h)); }
  /* el nombre de la UAI de una estrella de la carta: en chino, chino
     tradicional o bulgaro si Stellarium lo da (CIELO_UAI); si no, tal cual */
  function nombreUAI(h) {
    var t = CIELO_UAI[lang()], k = String(h);
    return (t && t[k]) || ((S.datos && S.datos.nombresIAU) || {})[k] || '';
  }
  function nombreCon(c) { return nom(CIELO_CON, c === 'Se1' || c === 'Se2' ? 'Ser' : c); }
  function nombreDoble(d) {
    var n = nom(CIELO_DOB, d.id);
    return n || (d.h ? nombreEstrella(d.h) : '') || d.b;
  }
  function tipoVar(t) {
    var k = /^EA/.test(t) ? 'EA' : /^EB/.test(t) ? 'EB' : /^DCEP/.test(t) ? 'DCEP' : t === 'M' ? 'M' : /^SR/.test(t) ? 'SR' : t === 'GCAS' ? 'GCAS' : t === 'RCB' ? 'RCB' : /^RV/.test(t) ? 'RV' : t === 'NR' ? 'NR' : 'Otra';
    return T('Var' + k);
  }

  /* lista unificada del catalogo, ya con textos en el idioma de ahora */
  function catalogo() {
    var D = S.datos, L = [];
    D.estrellas.forEach(function (e) {
      L.push({ k: 'est', id: 'h' + e.h, o: e, tipo: 'estrellas', niv: 1, ico: '⭐', nombre: nombreEstrella(e.h) || e.n, des: e.b || '', con: e.c, m: e.m, alt: e.alt, mes: e.mes });
    });
    D.dobles.forEach(function (d) {
      L.push({ k: 'dob', id: d.id, o: d, tipo: 'sistemas', niv: d.niv, ico: '⚪', nombre: nombreDoble(d), des: d.b, con: d.c, m: d.m1, alt: d.alt, mes: d.mes });
    });
    D.variables.forEach(function (v) {
      L.push({ k: 'var', id: 'v' + v.h, o: v, tipo: 'variables', niv: v.max <= 6 ? 1 : (v.max <= 8.5 ? 2 : 3), ico: '🔁', nombre: nombreEstrella(v.h) || v.des, des: v.des, con: v.c, m: v.max, alt: v.alt, mes: v.mes });
    });
    Object.keys(D.con).forEach(function (c) {
      var x = D.con[c];
      L.push({ k: 'con', id: 'c' + c, o: x, ab: c, tipo: 'constelaciones', niv: 1, ico: '✳️', nombre: nombreCon(c), des: x.n, con: c, m: null, alt: null, mes: x.mes, vis: x.vis });
    });
    D.objetos.forEach(function (o) {
      if (!o.niv) return;
      var tipo = o.t === 'gal' ? 'galaxias' : (o.t === 'abi' || o.t === 'aso' || o.t === 'glo') ? 'cumulos' : (o.t === 'dob' || o.t === 'ast') ? 'cumulos' : 'nebulosas';
      L.push({ k: 'obj', id: o.id, o: o, tipo: tipo, niv: o.niv, ico: ICONO[o.t] || '✨', nombre: nombreObjeto(o), des: designacionObjeto(o), con: o.c, m: o.m, alt: o.alt, mes: o.mes });
    });
    return L;
  }

  /* ── PINTAR ────────────────────────────────────────────────────── */
  var PESTANAS = [['noche', '🌙'], ['calendario', '📅'], ['catalogo', '✨'], ['mapa', '🗺️'], ['donde', '📍']];
  function pintarPestanas() {
    var b = document.getElementById('cielo-pestanas');
    if (!b) return;
    b.textContent = '';
    PESTANAS.forEach(function (p) {
      var x = el('button'); x.appendChild(el('span', 'cielo-pes-ico', p[1]));
      x.appendChild(el('span', null, T('Pes' + p[0].charAt(0).toUpperCase() + p[0].slice(1))));
      x.type = 'button'; x.setAttribute('role', 'tab');
      x.setAttribute('aria-selected', S.pestana === p[0] ? 'true' : 'false');
      x.addEventListener('click', function () { S.pestana = p[0]; pintar(); });
      b.appendChild(x);
    });
  }
  function pintar() {
    var c = document.getElementById('cielo-cuerpo');
    if (!c) return;
    var t = document.getElementById('cielo-titulo'); if (t) t.textContent = T('Titulo');
    var r = document.getElementById('cielo-rojo'); if (r) { r.textContent = T('Rojo'); r.title = T('RojoAyuda'); r.setAttribute('aria-pressed', S.rojo ? 'true' : 'false'); }
    pintarPestanas();
    if (!S.datos) {
      c.textContent = '';
      c.appendChild(el('div', 'cielo-estado', S.fallo ? T('ErrorCarga') : T('Cargando')));
      if (S.fallo) { var bt = el('button', 'cielo-boton', T('Reintentar')); bt.type = 'button'; bt.addEventListener('click', abrir); c.firstChild.appendChild(el('br')); c.firstChild.appendChild(bt); }
      return;
    }
    if (S.pestana !== 'mapa') pararMapa();
    if (S.pestana !== 'noche') vozPausar();      // la noche guiada en voz alta: se sigue al volver
    var arriba = c.scrollTop;
    c.textContent = '';
    try {
      ({ noche: pintarNoche, calendario: pintarCalendario, catalogo: pintarCatalogo, mapa: pintarMapa, donde: pintarDonde })[S.pestana](c);
    } catch (e) {
      try { console.warn('cielo:', e); } catch (_) {}
      c.textContent = '';
      c.appendChild(el('div', 'cielo-estado', T('ErrorCalculo')));
    }
    if (S.pestana === S._ultimaPestana) c.scrollTop = arriba; else c.scrollTop = 0;
    S._ultimaPestana = S.pestana;
  }

  /* ── PESTANA «ESTA NOCHE» ──────────────────────────────────────── */
  /* La noche que se mira, en «Esta noche» y en la carta: ‹ › dia a dia, 📅
     cualquier fecha (quien planea el viaje desde Berlin quiere la de su
     noche en el Teide). Cambiarla deja la carta a la hora en que empieza la
     noche cerrada de esa fecha. */
  function cambiarFecha(f) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f || '')) return;
    vozParar();                                   // otra noche, otras paradas
    S.fecha = f;
    var M = S.mapa; M.t = null; M.porDefecto = true; M.desfase = 0; M.ahora = false; M.corre = false;
    pintar();
  }
  function selectorFecha(c) {
    var f = el('div', 'cielo-fecha');
    var a = el('button', null, '‹'); a.type = 'button'; a.setAttribute('aria-label', T('NocheAnterior'));
    var b = el('button', null, '›'); b.type = 'button'; b.setAttribute('aria-label', T('NocheSiguiente'));
    var hoy = nocheDeHoy();
    var txt = S.fecha === hoy ? T('EstaNoche') : T('NocheDel', { f: dia(instanteLocal(S.fecha, 12, 0)) });
    var m = el('div', 'cielo-fecha-txt', txt);
    a.addEventListener('click', function () { cambiarFecha(sumarDias(S.fecha, -1)); });
    b.addEventListener('click', function () { cambiarFecha(sumarDias(S.fecha, 1)); });
    f.appendChild(a); f.appendChild(m); f.appendChild(b);
    /* el calendario del sistema: el boton abre el selector nativo (showPicker)
       y, donde no lo haya, deja a la vista el campo de fecha */
    var inp = el('input', 'cielo-fecha-input'); inp.type = 'date'; inp.value = S.fecha; inp.setAttribute('aria-label', T('FechaElegir'));
    inp.addEventListener('change', function () { cambiarFecha(inp.value); });
    var bf = el('button', 'cielo-fecha-cal', '📅'); bf.type = 'button'; bf.setAttribute('aria-label', T('FechaElegir')); bf.title = T('FechaElegir');
    bf.addEventListener('click', function () {
      try { if (typeof inp.showPicker === 'function') { inp.showPicker(); return; } } catch (e) {}
      inp.classList.add('visto'); try { inp.focus(); inp.click(); } catch (e2) {}
    });
    f.appendChild(bf); f.appendChild(inp);
    if (S.fecha !== hoy) { var h = el('button', 'cielo-hoy', T('Hoy')); h.type = 'button'; h.addEventListener('click', function () { cambiarFecha(hoy); }); f.appendChild(h); }
    c.appendChild(f);
  }
  function lineaNoche(n) {
    var caja = el('div');
    var L = el('div', 'cielo-linea');
    var ini = n.ocaso.ut, fin = n.orto.ut, w = fin - ini;
    var pct = function (u) { return Math.max(0, Math.min(100, (u - ini) / w * 100)); };
    var seg = function (a, b, cls) { var d = el('div', cls); d.style.left = pct(a) + '%'; d.style.width = (pct(b) - pct(a)) + '%'; L.appendChild(d); };
    seg(ini, fin, 'cl-crep');
    seg(n.oscuro.ut, n.claro.ut, 'cl-oscuro');
    n.lunaArriba.forEach(function (x) { seg(x[0], x[1], 'cl-luna'); });
    caja.appendChild(L);
    var ejes = el('div', 'cielo-ejes');
    var h0 = Math.ceil((ini * 24 + 0.0001)), h1 = Math.floor(fin * 24);
    for (var h = h0; h <= h1; h++) {
      var u = h / 24;
      var d = Astronomy.MakeTime(u).date;
      if (partes(d).minute !== 0) continue;
      if (partes(d).hour % 3 !== 0) continue;
      var s = el('span', null, hora(d)); s.style.left = pct(u) + '%'; ejes.appendChild(s);
    }
    caja.appendChild(ejes);
    var ley = el('div', 'cielo-leyenda');
    [['#3c50a0', T('LeyCrepusculo')], ['#02040c', T('LeyNoche')], ['rgba(230,225,190,0.5)', T('LeyLuna')]].forEach(function (x) {
      var s = el('span'); var i = el('i'); i.style.background = x[0]; s.appendChild(i); s.appendChild(document.createTextNode(x[1])); ley.appendChild(s);
    });
    caja.appendChild(ley);
    return caja;
  }
  function pintarNoche(c) {
    var n = noche();
    selectorFecha(c);
    /* sin conexion: que sigue funcionando y que no */
    var sr = chipSinRed(); if (sr) c.appendChild(sr);
    /* los avisos que caen en los dos dias de antes, el indice de la noche y la noche guiada */
    c.appendChild(tarjetaAvisos({ pronto: true }));
    c.appendChild(tarjetaIndice(n));
    c.appendChild(tarjetaGuia(n));
    /* Sol y oscuridad */
    var t1 = tarjeta(T('Oscuridad'));
    t1.appendChild(lineaNoche(n));
    t1.appendChild(fila(T('PuestaSol'), hora(aFecha(n.ocaso))));
    t1.appendChild(fila(T('NocheCerrada'), hora(aFecha(n.oscuro)) + ' – ' + hora(aFecha(n.claro))));
    t1.appendChild(fila(T('SalidaSol'), hora(aFecha(n.orto))));
    var hs = Math.floor(n.sinLuna + 1e-6), mi = Math.round((n.sinLuna - hs) * 60);
    if (mi === 60) { hs++; mi = 0; }
    t1.appendChild(fila(T('SinLuna'), n.sinLuna < 0.08 ? T('Ninguna') : T('HorasMin', { h: hs, m: dos(mi) })));
    if (n.tramos.length && n.sinLuna >= 0.08) {
      t1.appendChild(fila(T('SinLunaDe'), n.tramos.map(function (x) { return hora(Astronomy.MakeTime(x[0]).date) + '–' + hora(Astronomy.MakeTime(x[1]).date); }).join(' · ')));
    }
    t1.appendChild(el('div', 'cielo-nota', T('NotaLugar')));
    c.appendChild(t1);
    /* Luna */
    var t2 = tarjeta(T('Luna'));
    var lu = el('div', 'cielo-luna');
    lu.appendChild(dibujoLuna(n.fase, 46));
    var ld = el('div', 'cielo-luna-datos');
    ld.appendChild(el('div', 'cielo-item-nom', nombreFase(n.fase) + ' · ' + T('Iluminada', { p: numero(n.ilum * 100, 0) })));
    /* Salida y puesta entre el ocaso y el alba. Sin ninguna de las dos, la
       Luna esta arriba toda la noche o no sale. */
    var sp = [];
    if (n.lunaSale && n.lunaSale.ut < n.orto.ut) sp.push({ u: n.lunaSale.ut, t: T('LunaSale', { h: hora(n.lunaSale.date) }) });
    if (n.lunaPone && n.lunaPone.ut < n.orto.ut) sp.push({ u: n.lunaPone.ut, t: T('LunaPone', { h: hora(n.lunaPone.date) }) });
    sp.sort(function (a, b) { return a.u - b.u; });
    var txtSp = sp.length ? sp.map(function (x) { return x.t; }).join(' · ') : (n.lunaArriba.length ? T('LunaToda') : T('LunaNoSale'));
    ld.appendChild(el('div', 'cielo-item-sub', txtSp));
    ld.appendChild(el('div', 'cielo-item-sub', T('EnConstelacion', { c: nombreCon(n.lunaCon) })));
    lu.appendChild(ld); t2.appendChild(lu);
    var prox = proximasFases();
    if (prox.length) t2.appendChild(el('div', 'cielo-nota', prox.map(function (q) { return T(q.quarter === 0 ? 'ProxNueva' : 'ProxLlena', { f: dia(q.time.date) }); }).join(' · ')));
    c.appendChild(t2);
    /* Nubes (solo si hay prevision para esa noche) */
    var tn = tarjetaNubes(n); if (tn) c.appendChild(tn);
    /* las horas para fotos: dorada, azul y la Via Lactea */
    var tf = tarjetaFotos(n); if (tf) c.appendChild(tf);
    /* Planetas */
    var t3 = tarjeta(T('Planetas'));
    var pl = planetasNoche(n);
    if (!pl.length) t3.appendChild(el('div', 'cielo-item-sub', T('SinPlanetas')));
    pl.forEach(function (p) {
      var it = el('div', 'cielo-item');
      it.appendChild(el('div', 'cielo-item-ico', ICONO_PLANETA[p.p]));
      var tx_ = el('div', 'cielo-item-txt');
      var nm = el('div', 'cielo-item-nom', nom(CIELO_CUERPO, p.p));
      tx_.appendChild(nm);
      /* Mercurio y Venus a veces solo asoman un rato en el crepusculo: «visible
         de 20:04 a 20:04» no dice nada, se dice que es un momento y muy bajo */
      var breve = p.hasta.ut - p.desde.ut < 20 / 1440;
      tx_.appendChild(el('div', 'cielo-item-sub', breve
        ? T('VisibleBreve', { h: hora(p.mejor.t.date), alt: numero(p.mejor.alt, 0), dir: hacia(p.mejor.az) })
        : T('VisibleDeA', { a: hora(p.desde.date), b: hora(p.hasta.date) }) + ' · ' +
          T('MejorA', { h: hora(p.mejor.t.date), alt: numero(p.mejor.alt, 0), dir: hacia(p.mejor.az) })));
      tx_.appendChild(el('div', 'cielo-item-sub', T('MagEn', { m: mag(p.mag), c: nombreCon(p.con) })));
      it.appendChild(tx_);
      var der = el('div', 'cielo-item-der'); der.appendChild(nivelChip(p.niv)); it.appendChild(der);
      it.addEventListener('click', function () { irAlMapa({ planeta: p.p, t: p.mejor.t.date }); });
      t3.appendChild(it);
    });
    c.appendChild(t3);
    /* la Estacion Espacial y los satelites brillantes */
    c.appendChild(tarjetaSatelites(n));
    /* Via Lactea */
    var vl = viaLacteaNoche(n), t4 = tarjeta(T('ViaLactea'));
    if (vl.mejor) t4.appendChild(el('div', 'cielo-item-sub', T('ViaLacteaSi', { a: hora(Astronomy.MakeTime(vl.desde).date), b: hora(Astronomy.MakeTime(vl.hasta).date), dir: hacia(vl.mejor.az), alt: numero(vl.mejor.alt, 0) })));
    else if (vl.motivo === 'luna') t4.appendChild(el('div', 'cielo-item-sub', T('ViaLacteaLuna')));
    else {
      var fv = vuelveViaLactea(S.fecha);
      t4.appendChild(el('div', 'cielo-item-sub', T('ViaLacteaNo') + (fv ? ' ' + T('ViaLacteaVuelve', { f: diaAnio(instanteLocal(fv, 12, 0)) }) : '')));
    }
    t4.appendChild(el('div', 'cielo-nota', T('ViaLacteaNota')));
    c.appendChild(t4);
    /* Lo mejor de esta noche, por instrumento */
    var mj = mejoresNoche(n), t5 = tarjeta(T('Mejores'));
    if (mj.molesta) t5.appendChild(el('div', 'cielo-nota', T('LunaApaga')));
    [1, 2, 3].forEach(function (k) {
      if (!mj[k].length) return;
      var cab = el('div', 'cielo-mes-cab'); cab.appendChild(nivelChip(k)); t5.appendChild(cab);
      mj[k].forEach(function (x) {
        var it = el('div', 'cielo-item');
        var o = x.o, esDob = x.k === 'dob';
        it.appendChild(el('div', 'cielo-item-ico', esDob ? '⚪' : (ICONO[o.t] || '✨')));
        var tt = el('div', 'cielo-item-txt');
        var nomTxt = esDob ? nombreDoble(o) : nombreObjeto(o), desTxt = esDob ? o.b : designacionObjeto(o);
        var nm = nombreODesig('div', 'cielo-item-nom', nomTxt, desTxt);
        if (nomTxt && nomTxt !== desTxt) nm.appendChild(desig(desTxt));
        tt.appendChild(nm);
        tt.appendChild(el('div', 'cielo-item-sub', (esDob ? T('TipoDoble') : nom(CIELO_TIPO, o.t)) + ' · ' + nombreCon(o.c)));
        tt.appendChild(el('div', 'cielo-item-sub', T('MejorA', { h: hora(Astronomy.MakeTime(x.x.u).date), alt: numero(x.x.alt, 0), dir: hacia(x.x.az) })));
        it.appendChild(tt);
        it.addEventListener('click', function () { irAlMapa({ v: o.v, nombre: nomTxt, des: desTxt, t: Astronomy.MakeTime(x.x.u).date }); });
        t5.appendChild(it);
      });
    });
    c.appendChild(t5);
    /* el sistema solar hoy, visto desde arriba */
    c.appendChild(tarjetaSistema(n));
    /* Lo proximo del calendario */
    var ev = eventos().filter(function (e) { return e.t > new Date() && (e.tipo === 'lluvia' || e.tipo === 'eclipseSol' || e.tipo === 'eclipseLuna'); })[0];
    if (ev) {
      var t6 = tarjeta(T('Proximo'));
      t6.appendChild(filaEvento(ev));
      var bt = el('button', 'cielo-boton', T('VerCalendario')); bt.type = 'button';
      bt.addEventListener('click', function () { S.pestana = 'calendario'; pintar(); });
      t6.appendChild(bt);
      c.appendChild(t6);
    }
  }
  function proximasFases() {
    var A = Astronomy, q = A.SearchMoonQuarter(instanteLocal(S.fecha, 12, 0)), out = [];
    while (q && out.length < 2) { if (q.quarter === 0 || q.quarter === 2) out.push(q); q = A.NextMoonQuarter(q); }
    return out;
  }
  var ICONO_PLANETA = { Mercury: '☿️', Venus: '♀️', Mars: '♂️', Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆', Moon: '🌙', Sun: '☀️' };

  /* ── NUBES: Open-Meteo, como el resto del tiempo de la app ─────────
     Solo para hoy y manana (no hay prevision mas alla que valga para esto),
     con la cache de 30 minutos de la app, y si no hay dato NO se pinta: una
     noche despejada inventada manda a alguien al Teide para nada. Las nubes
     BAJAS van aparte: llegan hasta 3 km, y el mar de nubes suele quedar por
     debajo de las cumbres, asi que contarlas como «nublado» en Izana miente. */
  var NUBES_CACHE = 'tgo_cielo_nubes_v1';
  function pedirNubes() {
    if (S.nubesPidiendo || location.protocol === 'file:') return;
    try {
      var c = JSON.parse(localStorage.getItem(NUBES_CACHE) || 'null');
      if (c && Date.now() - c.ts < 30 * 60000) { S.nubes = c.d; return; }
    } catch (e) {}
    S.nubesPidiendo = true;
    var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, 8000);
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + OBS.lat + '&longitude=' + OBS.lon +
      '&hourly=cloud_cover_low,cloud_cover_mid,cloud_cover_high&forecast_days=3&timezone=GMT';
    fetch(url, { signal: ctrl.signal }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var h = j && j.hourly;
        if (!h || !h.time || !h.cloud_cover_mid) return;
        var d = h.time.map(function (t, i) { return { t: Date.parse(t + 'Z'), b: h.cloud_cover_low[i], m: h.cloud_cover_mid[i], a: h.cloud_cover_high[i] }; })
          .filter(function (x) { return typeof x.m === 'number' && typeof x.a === 'number'; });
        if (!d.length) return;
        S.nubes = d;
        try { localStorage.setItem(NUBES_CACHE, JSON.stringify({ ts: Date.now(), d: d })); } catch (e) {}
        if (S.abierto && S.pestana === 'noche') pintar();
      })
      .catch(function () {
        try { var c = JSON.parse(localStorage.getItem(NUBES_CACHE) || 'null'); if (c) S.nubes = c.d; } catch (e) {}
      })
      .finally(function () { clearTimeout(timer); S.nubesPidiendo = false; });
  }
  function tarjetaNubes(n) {
    if (!S.nubes) return null;
    var ini = n.oscuro.date.getTime(), fin = n.claro.date.getTime();
    var horas = S.nubes.filter(function (x) { return x.t >= ini - 1800000 && x.t <= fin; });
    if (horas.length < 3) return null;
    var t = tarjeta(T('Nubes'));
    var fila_ = el('div', 'cielo-nubes');
    horas.forEach(function (x) {
      var arriba = Math.max(x.m, x.a);
      var d = el('div'); var b = el('b');
      var g = Math.round(20 + arriba * 1.6);
      b.style.background = 'rgb(' + g + ',' + g + ',' + Math.round(g * 1.1 + 15) + ')';
      b.title = T('NubesHora', { h: hora(new Date(x.t)), a: arriba, b: x.b });
      d.appendChild(b); d.appendChild(document.createTextNode(String(partes(new Date(x.t)).hour)));
      fila_.appendChild(d);
    });
    t.appendChild(fila_);
    var media = Math.round(horas.reduce(function (s, x) { return s + Math.max(x.m, x.a); }, 0) / horas.length);
    var bajas = Math.round(horas.reduce(function (s, x) { return s + x.b; }, 0) / horas.length);
    t.appendChild(fila(T('NubesAltas'), numero(media, 0) + ' %'));
    t.appendChild(fila(T('NubesBajas'), numero(bajas, 0) + ' %'));
    t.appendChild(el('div', 'cielo-nota', T('NubesNota')));
    return t;
  }

  /* ── PESTANA «CALENDARIO» ──────────────────────────────────────── */
  var FILTROS_CAL = [['todo', 'CalTodo'], ['lluvia', 'CalLluvias'], ['eclipse', 'CalEclipses'], ['planeta', 'CalPlanetas'], ['sol', 'CalSolLuna'], ['luna', 'CalLuna'], ['satelites', 'CalSatelites']];
  var FASES_Q = ['Nueva', 'CuartoCreciente', 'Llena', 'CuartoMenguante'];
  function tituloEvento(e) {
    switch (e.tipo) {
      case 'lluvia': return T('EvLluvia', { n: nom(CIELO_LLU, e.l.id) });
      case 'eclipseSol': return T('EvEclipseSol' + ({ total: 'Total', annular: 'Anular', hybrid: 'Hibrido' }[e.global] || 'Parcial'));
      case 'eclipseLuna': return T('EvEclipseLuna' + ({ total: 'Total', partial: 'Parcial' }[e.kind] || 'Penumbral'));
      case 'oposicion': return T('EvOposicion', { p: nom(CIELO_CUERPO, e.p) });
      case 'elongacion': return T(e.vis === 'evening' ? 'EvElongTarde' : 'EvElongManana', { p: nom(CIELO_CUERPO, e.p) });
      case 'conjuncion': return T('EvConjuncion', { a: nom(CIELO_CUERPO, e.a), b: nom(CIELO_CUERPO, e.b) });
      case 'estacion': return T(e.k);
      case 'lunaCerca': return T('EvLunaCerca');
      case 'fase': return T('Fase' + FASES_Q[e.q]);
      case 'retro': return T(e.ini ? 'EvRetroIni' : 'EvRetroFin', { p: nom(CIELO_CUERPO, e.p) });
      case 'paso': return T('EvPaso', { s: nombreSat(e.s) });
    }
    return '';
  }
  var ICONO_EV = { lluvia: '☄️', eclipseSol: '🌒', eclipseLuna: '🌕', oposicion: '🪐', elongacion: '🌆', conjuncion: '💫', estacion: '🌍', lunaCerca: '🌕', retro: '↩️', paso: '🛰️' };
  var ICONO_FASE = ['🌑', '🌓', '🌕', '🌗'];
  function detalleEvento(e) {
    var A = Astronomy, d = [];
    switch (e.tipo) {
      case 'fase': d.push(T('FaseDet', { h: hora(e.t) })); break;
      case 'paso': return textoPaso(e);
      case 'retro':
        if (e.ini) d.push(e.otro ? T('RetroDet', { f: dia(e.otro), c: nombreCon(e.con) }) : T('RetroDetSinFin', { c: nombreCon(e.con) }));
        else d.push(e.otro ? T('RetroFinDet', { f: dia(e.otro) }) : T('RetroFinDetSinIni'));
        break;
      case 'lluvia':
        d.push(T('LluviaMax', { f: dia(e.t), h: hora(e.t) }));
        d.push(e.l.thz ? T('LluviaThz', { z: e.l.thz }) : T('LluviaThzVar'));
        d.push(T('LluviaMejor', { f: dia(A.MakeTime(e.mejor.u).date), h: hora(A.MakeTime(e.mejor.u).date), alt: numero(e.mejor.alt, 0), dir: hacia(e.mejor.az) }));
        d.push(T('LluviaLuna', { p: numero(e.luz * 100, 0) }) + (e.lunaArriba ? '' : ' ' + T('LluviaLunaAbajo')) + ' · ' + T('Cond' + e.cond));
        var padre = lluviaPadre(e.l); if (padre) d.push(padre);     // «son restos del cometa...» (codigo11)
        break;
      case 'eclipseSol':
        d.push(e.local === 'total' ? T('EclSolLocalTotal') : e.local === 'annular' ? T('EclSolLocalAnular') : T('EclSolTenerife', { p: numero(e.obsc * 100, 0) }));
        d.push(T('EclSolHoras', { a: hora(e.ini.time.date), m: hora(e.pico.time.date), b: hora(e.fin.time.date), alt: numero(Math.max(0, e.pico.altitude), 0) }));
        if (e.ini.altitude < 0) d.push(T('EclSolSale'));
        if (e.fin.altitude < 0) d.push(T('EclSolPone'));
        d.push(T('EclSolAviso'));
        break;
      case 'eclipseLuna':
        if (e.kind !== 'penumbral' && e.u1) d.push(T('EclLunaSombra', { a: hora(e.u1), b: hora(e.u4) }));
        if (e.kind === 'total') d.push(T('EclLunaTotalidad', { a: hora(e.u2), b: hora(e.u3) }));
        if (e.kind === 'penumbral') d.push(T('EclLunaPenumbra', { a: hora(e.p1), b: hora(e.p4) }));
        d.push(T(e.entero ? 'EclLunaEntero' : (e.salePone === 'Sale' ? 'EclLunaSale' : 'EclLunaPone')));
        break;
      case 'oposicion': d.push(T('OposicionDet', { m: mag(e.mag), c: nombreCon(e.con) })); break;
      case 'elongacion': d.push(T('ElongDet', { g: numero(e.elong, 0), m: mag(e.mag) })); break;
      case 'conjuncion': d.push(T('ConjDet', { s: numero(e.sep, 1) })); break;
      case 'estacion': d.push(T('EstacionDet', { h: hora(e.t) })); break;
      case 'lunaCerca': d.push(T('LunaCercaDet', { km: numero(Math.round(e.km / 100) * 100, 0) })); break;
    }
    return d;
  }
  function filaEvento(e, opc) {
    var it = el('div', 'cielo-item');
    it.appendChild(el('div', 'cielo-item-ico', e.tipo === 'fase' ? ICONO_FASE[e.q] : (ICONO_EV[e.tipo] || '✨')));
    var tt = el('div', 'cielo-item-txt');
    tt.appendChild(el('div', 'cielo-item-nom', tituloEvento(e)));
    detalleEvento(e).forEach(function (x) { tt.appendChild(el('div', 'cielo-item-sub', x)); });
    if (e.tipo === 'lluvia') { var cu = bloqueCuriosidad(curiosidadLluvia(e.l), true); if (cu) tt.appendChild(cu); }
    if (opc && opc.avisos) tt.appendChild(botonesAviso(e));
    it.appendChild(tt);
    var der = el('div', 'cielo-item-der', dia(e.t)); it.appendChild(der);
    return it;
  }
  function pintarCalendario(c) {
    var chips = el('div', 'cielo-chips');
    FILTROS_CAL.forEach(function (f) {
      var b = el('button', null, (f[0] === 'luna' ? '🌙 ' : f[0] === 'satelites' ? '🛰️ ' : '') + T(f[1])); b.type = 'button';
      b.setAttribute('aria-pressed', S.cal === f[0] ? 'true' : 'false');
      b.addEventListener('click', function () { S.cal = f[0]; pintar(); });
      chips.appendChild(b);
    });
    c.appendChild(chips);
    /* los avisos puestos, arriba del todo */
    c.appendChild(tarjetaAvisos({}));
    /* los satelites: los pasos de las siete noches que vienen, calculados
       aqui con los elementos del dia (tarjetaSatelites los explica) */
    if (S.cal === 'satelites') { pintarPasos(c); return; }
    /* las fases van en su filtro: cuatro al mes taparian lo demas en «Todo» */
    var grupo = { lluvia: 'lluvia', eclipseSol: 'eclipse', eclipseLuna: 'eclipse', oposicion: 'planeta', elongacion: 'planeta', conjuncion: 'planeta', retro: 'planeta', estacion: 'sol', lunaCerca: 'sol', fase: 'luna' };
    var ahora = new Date(), unAnio = new Date(ahora.getTime() + 366 * 864e5);
    var lista = eventos().filter(function (e) {
      if (S.cal === 'todo' ? e.tipo === 'fase' : grupo[e.tipo] !== S.cal) return false;
      if (e.t < new Date(ahora.getTime() - 2 * 864e5)) return false;
      return e.tipo === 'eclipseSol' || e.tipo === 'eclipseLuna' || e.t < unAnio;
    });
    if (!lista.length) c.appendChild(el('div', 'cielo-estado', T('SinEventos')));
    var mesAnt = '';
    lista.forEach(function (e) {
      var m = mesAnio(e.t);
      if (m !== mesAnt) { c.appendChild(el('div', 'cielo-mes-cab', m)); mesAnt = m; }
      var t = el('div', 'cielo-tarjeta'); t.appendChild(filaEvento(e, { avisos: true })); c.appendChild(t);
    });
    if (S.cal === 'luna') c.appendChild(el('div', 'cielo-nota', T('FasesNota')));
    var nota = tarjeta(T('CometasSatelites'));
    nota.appendChild(el('p', 'cielo-p', T('CometasTxt')));
    nota.appendChild(el('p', 'cielo-p', T('SatelitesTxt')));
    nota.appendChild(enlaces([
      ['EnlaceIss', 'https://www.nasa.gov/news-release/look-up-new-nasa-app-helps-stargazers-spot-space-station'],
      ['EnlaceIacCal', 'https://iac.es/en/outreach/iac-publishing/calendar']
    ]));
    nota.appendChild(el('div', 'cielo-nota', T('NotaCalendario')));
    c.appendChild(nota);
  }
  function pintarPasos(c) {
    if (!S.sat.datos) {
      c.appendChild(el('div', 'cielo-estado', S.sat.fallo ? T('SatSinDatos') : T('Cargando')));
      if (!S.sat.fallo) cargarSatelites().then(function () { if (S.abierto) pintar(); }, function () { if (S.abierto) pintar(); });
      return;
    }
    var lista = pasosProximos(), epoca = epocaMasNueva();
    if (!satelitesVivos(Date.now()).length) { c.appendChild(el('div', 'cielo-estado', T('SatFuera', { f: diaAnio(new Date(epoca)) }))); }
    else if (!lista.length) c.appendChild(el('div', 'cielo-estado', T('SatNingunoSemana')));
    var diaAnt = '';
    lista.forEach(function (p) {
      var noche = partes(p.max.t).hour < 12 ? sumarDias(fechaLocal(p.max.t), -1) : fechaLocal(p.max.t);
      if (noche !== diaAnt) { c.appendChild(el('div', 'cielo-mes-cab', T('NocheDel', { f: dia(instanteLocal(noche, 12, 0)) }))); diaAnt = noche; }
      var t = el('div', 'cielo-tarjeta'); t.appendChild(filaPaso(p, true)); c.appendChild(t);
    });
    var ultima = ventanaNoche(sumarDias(nocheDeHoy(), 6));
    if (ultima && S.sat.datos.sat.some(function (s) { return !satSirve(s, ultima[1]); })) c.appendChild(el('div', 'cielo-nota', T('SatFuera', { f: diaAnio(new Date(epoca)) })));
    c.appendChild(el('div', 'cielo-nota', T('SatElementos', { f: diaAnio(new Date(epoca)) }) + ' ' + T('SatNota')));
  }
  function enlaces(lista) {
    var caja = el('div', 'cielo-enlaces');
    lista.forEach(function (x) {
      var b = el('button'); b.type = 'button';
      b.appendChild(document.createTextNode('↗ ' + T(x[0])));
      var s = el('small', null, x[1].replace(/^https:\/\//, '').replace(/\/$/, '')); s.setAttribute('data-sin-traducir', 'direccion web'); b.appendChild(s);
      if (typeof bindExternalLink === 'function') bindExternalLink(b, x[1]);
      caja.appendChild(b);
    });
    return caja;
  }

  /* ── PESTANA «CATALOGO» ────────────────────────────────────────── */
  var TIPOS_CAT = [['todo', 'CatTodo'], ['estrellas', 'CatEstrellas'], ['sistemas', 'CatSistemas'], ['variables', 'CatVariables'],
                   ['constelaciones', 'CatConstelaciones'], ['cumulos', 'CatCumulos'], ['nebulosas', 'CatNebulosas'], ['galaxias', 'CatGalaxias']];
  function quitarTildes(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function barraMeses(mask) {
    var b = el('div', 'cielo-meses'), mesHoy = partes(new Date()).month - 1;
    for (var i = 0; i < 12; i++) {
      var s = el('span', (mask >> i & 1 ? 'si' : '') + (i === mesHoy ? ' ahora' : ''), fmt(new Date(Date.UTC(2027, i, 15, 12)), { month: 'narrow' }));
      b.appendChild(s);
    }
    b.title = T('MesesAyuda');
    return b;
  }
  function pintarCatalogo(c) {
    var busca = el('input', 'cielo-busca');
    busca.type = 'search'; busca.placeholder = T('Buscar'); busca.value = S.cat.busca;
    busca.setAttribute('aria-label', T('Buscar'));
    c.appendChild(busca);
    var chips = el('div', 'cielo-chips');
    TIPOS_CAT.forEach(function (f) {
      var b = el('button', null, T(f[1])); b.type = 'button';
      b.setAttribute('aria-pressed', S.cat.tipo === f[0] ? 'true' : 'false');
      b.addEventListener('click', function () { S.cat.tipo = f[0]; pintar(); });
      chips.appendChild(b);
    });
    c.appendChild(chips);
    var chips2 = el('div', 'cielo-chips');
    [[0, 'CatCualquiera'], [1, 'Niv1'], [2, 'Niv2'], [3, 'Niv3']].forEach(function (f) {
      var b = el('button', null, T(f[1])); b.type = 'button';
      b.setAttribute('aria-pressed', S.cat.nivel === f[0] ? 'true' : 'false');
      b.addEventListener('click', function () { S.cat.nivel = f[0]; pintar(); });
      chips2.appendChild(b);
    });
    var bn = el('button', null, '🌙 ' + T('CatEstaNoche')); bn.type = 'button';
    bn.setAttribute('aria-pressed', S.cat.estaNoche ? 'true' : 'false');
    bn.addEventListener('click', function () { S.cat.estaNoche = !S.cat.estaNoche; pintar(); });
    chips2.appendChild(bn);
    c.appendChild(chips2);
    var cuenta = el('div', 'cielo-cuenta'); c.appendChild(cuenta);
    var lista = el('div'); c.appendChild(lista);
    var n = S.cat.estaNoche ? noche() : null;
    var todo = catalogo();
    function filtrar() {
      var q = quitarTildes(S.cat.busca.trim());
      var r = todo.filter(function (x) {
        if (S.cat.tipo !== 'todo' && x.tipo !== S.cat.tipo) return false;
        if (S.cat.nivel && x.niv !== S.cat.nivel) return false;
        if (x.k === 'con' && x.vis === 'n' && S.cat.tipo !== 'constelaciones') return false;
        if (q && quitarTildes(x.nombre + ' ' + x.des + ' ' + nombreCon(x.con) + ' ' + (x.o.n || '')).indexOf(q) < 0) return false;
        if (n) {
          if (!x.o.v) return false;
          if (!x.noche) x.noche = maxNoche(n, x.o.v);
          if (x.noche.alt < 20) return false;
        }
        return true;
      });
      cuenta.textContent = T('CatCuenta', { n: r.length });
      lista.textContent = '';
      r.slice(0, 250).forEach(function (x) { lista.appendChild(itemCatalogo(x, n)); });
      if (r.length > 250) lista.appendChild(el('div', 'cielo-cuenta', T('CatMas', { n: r.length - 250 })));
    }
    busca.addEventListener('input', function () { S.cat.busca = busca.value; filtrar(); });
    filtrar();
    c.appendChild(el('div', 'cielo-nota', T('NotaNiveles')));
    var D = S.datos, vis = function (o) { return !!o.niv; };
    c.appendChild(el('div', 'cielo-nota', T('NotaMessier', {
      m: D.objetos.filter(function (o) { return o.M && vis(o); }).length,
      c: D.objetos.filter(function (o) { return o.C && vis(o); }).length,
      d: D.dobles.length, v: D.variables.length, k: Object.keys(D.con).length })));
  }
  function itemCatalogo(x, n) {
    var it = el('div', 'cielo-item');
    it.appendChild(el('div', 'cielo-item-ico', x.ico));
    var tt = el('div', 'cielo-item-txt');
    var nm = nombreODesig('div', 'cielo-item-nom', x.nombre, x.des);
    if (x.nombre && x.des && x.des !== x.nombre) nm.appendChild(desig(x.des));
    tt.appendChild(nm);
    var sub = [];
    if (x.k === 'est') sub.push(T('TipoEstrella'));
    if (x.k === 'dob') sub.push(T('TipoDoble'));
    if (x.k === 'var') sub.push(tipoVar(x.o.tipo));
    if (x.k === 'obj') sub.push(nom(CIELO_TIPO, x.o.t));
    if (x.k === 'con') sub.push(T(x.vis === 't' ? 'ConVisTotal' : x.vis === 'p' ? 'ConVisParcial' : 'ConVisNo'));
    else sub.push(nombreCon(x.con));
    if (x.m !== null && x.m !== undefined) sub.push(T('Mag', { m: mag(x.m) }));
    tt.appendChild(el('div', 'cielo-item-sub', sub.join(' · ')));
    if (n && x.noche) tt.appendChild(el('div', 'cielo-item-sub', T('MejorA', { h: hora(Astronomy.MakeTime(x.noche.u).date), alt: numero(x.noche.alt, 0), dir: hacia(x.noche.az) })));
    var mas = el('div', 'cielo-item-mas');
    detalleCatalogo(x).forEach(function (d) { mas.appendChild(el('div', null, d)); });
    var dsc = descripcion(x);
    if (dsc) { var p = el('div', null, dsc); p.style.marginTop = '5px'; mas.appendChild(p); }
    var cu = bloqueCuriosidad(curiosidadDe({ tipo: x.k, ab: x.ab, hip: x.o && x.o.h, dec: x.o && x.o.dec }), false); if (cu) mas.appendChild(cu);
    if (x.mes && x.vis !== 'n') mas.appendChild(barraMeses(x.mes));
    if (x.o.v && (x.alt === null || x.alt > 0)) {
      var bm = el('button', 'cielo-boton', '🗺️ ' + T('VerEnMapa')); bm.type = 'button';
      bm.addEventListener('click', function (ev) { ev.stopPropagation(); irAlMapa({ v: x.o.v, nombre: x.nombre, des: x.des }); });
      mas.appendChild(bm);
    }
    tt.appendChild(mas);
    it.appendChild(tt);
    var der = el('div', 'cielo-item-der'); der.appendChild(nivelChip(x.niv));
    if (x.alt !== null && x.alt < 10) { der.appendChild(el('br')); der.appendChild(el('span', null, T('Rasante'))); }
    it.appendChild(der);
    it.addEventListener('click', function () { it.classList.toggle('abierto'); });
    return it;
  }
  function detalleCatalogo(x) {
    var o = x.o, d = [];
    if (x.alt !== null && x.alt !== undefined) d.push(T('AltMax', { alt: numero(x.alt, 0) }));
    if (x.k === 'est') {
      if (o.al) d.push(T('Distancia', { d: distancia(o.al) }));
      if (o.sp) d.push(T('Espectro', { s: o.sp }));
      if (o.vr) d.push(T('VariableRango', { a: mag(o.vr[1]), b: mag(o.vr[2]) }));
    }
    if (x.k === 'dob') {
      if (o.sep !== null) d.push(o.sep >= 120 ? T('SeparacionMin', { s: numero(o.sep / 60, 1) }) : T('Separacion', { s: numero(o.sep, o.sep < 100 ? 1 : 0) }));
      else if (o.per) d.push(T('OrbitaRapida', { a: numero(o.per, 0) }));
      if (o.m1 !== null && o.m2 !== null) d.push(T('Componentes', { a: mag(o.m1), b: mag(o.m2) }));
      else if (o.dm !== null) d.push(T('DifMag', { d: numero(o.dm, 1) }));
    }
    if (x.k === 'var') {
      d.push(T('VariableRango', { a: mag(o.max), b: mag(o.min) }));
      if (o.per && o.tipo !== 'NR') d.push(T('Periodo', { d: numero(o.per, o.per < 20 ? 2 : 0) }));
    }
    if (x.k === 'con') {
      d.push(T('ConEstrellas', { n: o.n6v }));
      if (o.alfa) { var ne = nombreEstrella(o.alfa); if (ne) d.push(T('ConBrillante', { e: ne })); }
      if (o.vis === 'p') d.push(T('ConParcialDet', { d: '−' + numero(90 - OBS.lat, 0) }));
      datosConstelacion(x.ab, d);                      // origen y tamaño (codigo12)
    }
    if (x.k === 'obj') {
      if (o.tam) d.push(T('Tamano', { t: o.tam[1] ? numero(o.tam[0], o.tam[0] < 10 ? 1 : 0) + '′ × ' + numero(o.tam[1], o.tam[1] < 10 ? 1 : 0) + '′' : numero(o.tam[0], o.tam[0] < 10 ? 1 : 0) + '′' }));
    }
    return d;
  }
  /* La distancia de HYG sale del paralaje de Hipparcos: para las estrellas
     lejanas el error es de un 10 a un 30 %, asi que de 100 anos luz para
     arriba se dan dos cifras («unos 1.400»), no cuatro. */
  function distancia(al) {
    if (al < 20) return numero(al, 1);
    if (al < 100) return numero(al, 0);
    var p = Math.pow(10, Math.floor(Math.log10(al)) - 1);
    return numero(Math.round(al / p) * p, 0);
  }
  function descripcion(x) {
    var k = x.k === 'obj' ? x.id : (x.k === 'dob' ? 'd-' + x.id : (x.k === 'var' || x.k === 'est' ? 'h' + x.o.h : (x.k === 'con' ? 'c-' + x.ab : '')));
    return nom(CIELO_DESC, k);
  }

  /* ── PESTANA «DONDE OBSERVAR» ──────────────────────────────────── */
  /* Los sitios son fichas que ya estan en places[] -con su coordenada
     verificada-, los que Turismo de Tenerife recomienda para mirar las
     estrellas. El mirador del Tabonal Negro no tiene ficha: va sin boton de
     mapa antes que con una coordenada sin fuente. */
  var SITIOS = [
    ['llano-ucanca', 'SitioUcanca'], ['mirador-la-ruleta', 'SitioRuleta'], ['turismo-cv-canada-blanca', 'SitioParador'],
    ['sendero-guajara', 'SitioGuajara'], [null, 'SitioTabonal'], ['observatorio', 'SitioIzana'], ['museo-ciencia-cosmos', 'SitioMuseo']
  ];
  function pintarDonde(c) {
    c.appendChild(tarjetaOffline());
    var t0 = tarjeta(T('PorQue'));
    t0.appendChild(el('p', 'cielo-p', T('PorQueTxt')));
    t0.appendChild(el('p', 'cielo-p', T('LeyCielo')));
    t0.appendChild(el('p', 'cielo-p', T('Starlight')));
    c.appendChild(t0);
    var t1 = tarjeta(T('Sitios'));
    SITIOS.forEach(function (s) {
      var existe = s[0] && typeof places !== 'undefined' && places.some(function (p) { return p.id === s[0]; });
      var it = el('div', 'cielo-item');
      it.appendChild(el('div', 'cielo-item-ico', s[0] === 'museo-ciencia-cosmos' ? '🏛️' : (s[0] === 'observatorio' ? '🔭' : '⛰️')));
      var tt = el('div', 'cielo-item-txt');
      tt.appendChild(el('div', 'cielo-item-nom', T(s[1])));
      tt.appendChild(el('div', 'cielo-item-sub', T(s[1] + 'Txt')));
      if (existe) {
        var b = el('button', 'cielo-boton', '📍 ' + T('VerEnElMapa')); b.type = 'button';
        b.addEventListener('click', function () { cerrar(); if (typeof goToPlace === 'function') goToPlace(s[0]); });
        tt.appendChild(b);
      }
      it.appendChild(tt);
      t1.appendChild(it);
    });
    t1.appendChild(el('div', 'cielo-nota', T('SitiosFuente')));
    c.appendChild(t1);
    var t2 = tarjeta(T('Consejos'));
    var ul = el('ul', 'cielo-lista-p');
    ['Consejo1', 'Consejo2', 'Consejo3', 'Consejo4', 'Consejo5', 'Consejo6'].forEach(function (k) { ul.appendChild(el('li', null, T(k))); });
    t2.appendChild(ul);
    t2.appendChild(el('div', 'cielo-aviso', T('AvisoSol')));
    c.appendChild(t2);
    var t3 = tarjeta(T('Equipo'));
    [['Niv1', 'EquipoOjo'], ['Niv2', 'EquipoPrismaticos'], ['Niv3', 'EquipoTelescopio']].forEach(function (k, i) {
      var it = el('div', 'cielo-item');
      var tt = el('div', 'cielo-item-txt');
      var h = el('div', 'cielo-item-nom'); h.appendChild(nivelChip(i + 1)); tt.appendChild(h);
      tt.appendChild(el('div', 'cielo-item-sub', T(k[1])));
      it.appendChild(tt); t3.appendChild(it);
    });
    c.appendChild(t3);
    var t4 = tarjeta(T('Oficiales'));
    t4.appendChild(enlaces([
      ['EnlaceAtlas', 'https://astronomia.ign.es/oan/atlas-celeste'],
      ['EnlaceEclipsesIgn', 'https://astronomia.ign.es/web/guest/eclipses-de-sol-y-luna'],
      ['EnlaceIac', 'https://www.iac.es/'],
      ['EnlaceVisitas', 'https://iac.es/es/observatorios-de-canarias/observatorio-del-teide/visitas'],
      ['EnlaceLey', 'https://iac.es/es/observatorios-de-canarias/proteccion-del-cielo'],
      ['EnlaceStarlight', 'https://fundacionstarlight.org/docs/files/255_255-1-listado-certificaciones-dtrs-actualizado.pdf'],
      ['EnlaceImo', 'https://www.imo.net/']
    ]));
    c.appendChild(t4);
    var t5 = tarjeta(T('Creditos'));
    t5.appendChild(el('p', 'cielo-p', T('CreditosTxt')));
    t5.appendChild(enlaces([
      ['CreditoHyg', 'https://github.com/astronexus/HYG-Database'],
      ['CreditoOpenngc', 'https://github.com/mattiaverga/OpenNGC'],
      ['CreditoD3', 'https://github.com/ofrohn/d3-celestial'],
      ['CreditoMotor', 'https://github.com/cosinekitty/astronomy'],
      ['CreditoStellarium', 'https://github.com/Stellarium/stellarium']
    ]));
    c.appendChild(t5);
  }

  /* ── LA CARTA DEL CIELO ────────────────────────────────────────────
     Un cielo pintado como se ve desde Izaña en el instante elegido: el color
     del cielo con el Sol y la Luna donde estan, la Via Lactea, las estrellas
     con su color y su brillo, el suelo y el horizonte con los puntos
     cardinales. La misma funcion pinta la pestana «Mapa» y la vista a
     pantalla completa de «Apunta al cielo» (codigo6), que la orienta con los
     sensores del movil y, si se quiere, la pone encima de la camara.

     La proyeccion es estereografica (la de Stellarium por defecto: conserva
     las formas, y un campo de 120 grados no se deforma); con la camara es
     gnomonica, la de un objetivo, para que las estrellas caigan encima de las
     de la imagen. La vista la dan el rumbo (az), la altura (alt) y el campo
     (fov, grados de lado a lado en la dimension corta de la pantalla).

     Lo que es dibujo y no dato -el color del cielo, el del suelo, el brillo
     de la Via Lactea- se dice asi abajo. Lo que es dato sale de su fuente:
     posiciones y brillos del catalogo y de Astronomy Engine, colores de
     las estrellas de su indice B−V, la extincion y los mares de la Luna. */
  var RAD = Math.PI / 180;
  function limitar(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function suave(a, b, x) { var t = limitar((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function cruz(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function pto(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function unir(v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function enuDe(alt, az) { var c = Math.cos(alt * RAD); return [c * Math.sin(az * RAD), c * Math.cos(az * RAD), Math.sin(alt * RAD)]; }
  function altAzDe(e) { return { alt: Math.asin(limitar(e[2], -1, 1)) / RAD, az: (Math.atan2(e[0], e[1]) / RAD + 360) % 360 }; }
  /* J2000 -> este, norte, arriba, con la matriz del instante (rotacion()) */
  function aEnu(r, v, o) {
    o[0] = -(r[0][1] * v[0] + r[1][1] * v[1] + r[2][1] * v[2]);
    o[1] = r[0][0] * v[0] + r[1][0] * v[1] + r[2][0] * v[2];
    o[2] = r[0][2] * v[0] + r[1][2] * v[1] + r[2][2] * v[2];
    return o;
  }
  /* La refraccion levanta lo que esta bajo (medio grado en el horizonte): se
     aplica cerca de el, que es donde se nota; mas arriba son segundos. */
  function refractar(o) {
    if (o[2] > 0.34 || o[2] < -0.035) return o;
    var a = Math.asin(o[2]) / RAD, b = (a + Astronomy.Refraction('normal', a)) * RAD;
    var h = Math.sqrt(o[0] * o[0] + o[1] * o[1]) || 1e-9, k = Math.cos(b) / h;
    o[0] *= k; o[1] *= k; o[2] = Math.sin(b);
    return o;
  }
  /* Masa de aire de Kasten y Young (Applied Optics 28, 4735, 1989) y la
     extincion en V de las cumbres canarias, 0,113 magnitudes por masa de aire
     (mediana de 2.850 noches; Guerrero et al., «Extinction over the Canarian
     observatories», New Astronomy Reviews 42, 529, 1998). Con ella las
     estrellas se apagan al bajar hacia el horizonte, como de verdad. */
  var K_EXT = 0.113;
  function masaAire(alt) { return 1 / (Math.sin(Math.max(alt, 0) * RAD) + 0.50572 * Math.pow(Math.max(alt, 0) + 6.07995, -1.6364)); }

  /* ── EL COLOR DE CADA ESTRELLA ─────────────────────────────────────
     Del indice B−V a la temperatura con la formula de Ballesteros (EPL 97,
     34008, 2012), y de la temperatura al color que veria la vista: el cuerpo
     negro de Planck pasado por las funciones de color de la CIE 1931
     (aproximacion de Wyman, Sloan y Shirley, JCGT 2, 2013) y por la matriz
     de sRGB (IEC 61966-2-1). A la vista las estrellas son casi blancas: el
     color se deja a medio camino del blanco. */
  function kelvinBV(bv) { return 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62)); }
  function lobulo(l, m, s1, s2) { var t = (l - m) / (l < m ? s1 : s2); return Math.exp(-0.5 * t * t); }
  function rgbKelvin(T) {
    var X = 0, Y = 0, Z = 0;
    for (var l = 380; l <= 780; l += 5) {
      var p = Math.pow(l, -5) / (Math.exp(1.4387769e7 / (l * T)) - 1);
      X += p * (1.056 * lobulo(l, 599.8, 37.9, 31.0) + 0.362 * lobulo(l, 442.0, 16.0, 26.7) - 0.065 * lobulo(l, 501.1, 20.4, 26.2));
      Y += p * (0.821 * lobulo(l, 568.8, 46.9, 40.5) + 0.286 * lobulo(l, 530.9, 16.3, 31.1));
      Z += p * (1.217 * lobulo(l, 437.0, 11.8, 36.0) + 0.681 * lobulo(l, 459.0, 26.0, 13.8));
    }
    var c = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z];
    var mx = Math.max(c[0], c[1], c[2]);
    return c.map(function (x) {
      x = Math.max(0, x / mx);
      x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      return Math.round(255 * (0.45 + 0.55 * x));          // a medio camino del blanco
    });
  }
  /* Las «manchas» de luz de cada estrella: una por color (B−V de −0,4 a 2,2
     en pasos de 0,1), dibujadas una vez. Nucleo blanco y halo de su color. */
  var SPR = null;
  function sprites() {
    if (SPR) return SPR;
    SPR = [];
    for (var i = 0; i <= 26; i++) {
      var rgb = rgbKelvin(kelvinBV(-0.4 + i * 0.1)), c = document.createElement('canvas');
      c.width = c.height = 64;
      var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      var col = function (a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; };
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.1, 'rgba(255,255,255,0.95)');
      gr.addColorStop(0.2, col(0.75));
      gr.addColorStop(0.38, col(0.22));
      gr.addColorStop(0.65, col(0.06));
      gr.addColorStop(1, col(0));
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      SPR.push(c);
    }
    return SPR;
  }
  function spriteBV(bv) { return sprites()[Math.round(limitar(bv === null || bv === undefined ? 0.6 : bv, -0.4, 2.2) * 10 + 4)]; }

  /* ── LOS MARES DE LA LUNA ──────────────────────────────────────────
     Centro (latitud, longitud selenograficas, + este) y diametro en km del
     Gazetteer of Planetary Nomenclature de la UAI y el USGS
     (planetarynames.wr.usgs.gov), consultado el 18-10-2026. Mare Frigoris no
     esta: es una franja larga y estrecha, y su «diametro» (1.596 km) es el
     largo; como mancha redonda seria falsa. Con el radio medio de la Luna,
     1.737,4 km. */
  var MARES = [[34.72, -14.91, 1145.53], [27.29, 18.36, 674.28], [8.35, 30.83, 875.75], [16.18, 59.10, 555.92],
               [20.67, -56.68, 2592.24], [-7.83, 53.67, 840.35], [-15.19, 34.60, 339.39], [-20.59, -17.29, 714.50],
               [-24.48, -38.57, 419.67], [13.20, 4.09, 242.46], [7.79, -30.64, 511.93], [-10.53, -22.31, 350.01]];
  var R_LUNA = 1737.4, R_SOL = 695700;          // km: radio medio de la Luna; el del Sol, el nominal de la UAI (2015, B3)
  /* El polo norte de la Luna mira, a grado y medio, al polo de la ecliptica
     (su eje esta a 1,54 grados de la normal a la ecliptica: leyes de Cassini).
     Ese polo, en J2000: 18 h, +66,56 grados. */
  var POLO_ECLIPTICA = unitario(270, 66.5607);
  var _luna = null;
  function texturaLuna() {
    if (_luna) return _luna;
    var c = document.createElement('canvas'), N = 128; c.width = c.height = N;
    var g = c.getContext('2d'), r = N / 2;
    var gr = g.createRadialGradient(r * 0.85, r * 0.8, r * 0.1, r, r, r);
    gr.addColorStop(0, '#f6f1df'); gr.addColorStop(0.75, '#e2dcc6'); gr.addColorStop(1, '#bdb6a0');
    g.fillStyle = gr; g.beginPath(); g.arc(r, r, r, 0, 2 * Math.PI); g.fill();
    g.save(); g.beginPath(); g.arc(r, r, r, 0, 2 * Math.PI); g.clip();
    MARES.forEach(function (m) {
      var la = m[0] * RAD, lo = m[1] * RAD, x = Math.cos(la) * Math.sin(lo), y = Math.sin(la);
      var mu = Math.cos(la) * Math.cos(lo);                   // coseno de la distancia al centro del disco
      if (mu <= 0) return;
      var a = Math.sin(m[2] / 2 / R_LUNA) * r;                // radio en el disco
      var ang = Math.atan2(-y, x);
      g.save(); g.translate(r + x * r, r - y * r); g.rotate(ang); g.scale(Math.max(mu, 0.2), 1);
      var mg = g.createRadialGradient(0, 0, 0, 0, 0, a);
      mg.addColorStop(0, 'rgba(70,74,82,0.55)'); mg.addColorStop(0.7, 'rgba(80,84,92,0.4)'); mg.addColorStop(1, 'rgba(90,94,100,0)');
      g.fillStyle = mg; g.beginPath(); g.arc(0, 0, a, 0, 2 * Math.PI); g.fill();
      g.restore();
    });
    g.restore();
    return (_luna = c);
  }
  /* La Luna en su fase y bien girada: el lado iluminado hacia el Sol, su norte
     hacia el polo de la ecliptica. La parte oscura, con luz cenicienta. */
  function pintarLuna(ctx, x, y, rad, haciaSol, haciaNorte, fase) {
    var tx = texturaLuna();
    ctx.save();
    ctx.translate(x, y);
    ctx.save(); ctx.rotate(haciaNorte); ctx.drawImage(tx, -rad, -rad, 2 * rad, 2 * rad); ctx.restore();
    /* La sombra: lo que no ve el Sol. «fase» es el angulo de fase (Sol-Luna-
       Tierra): 0 llena, 180 nueva. Con +x hacia el Sol, la sombra es el
       semicirculo de la izquierda y el terminador, media elipse de semieje
       r·|cos(fase)|: por la derecha si es creciente o menguante (cos < 0),
       por la izquierda si es gibosa. */
    ctx.rotate(haciaSol);
    ctx.beginPath();
    var k = Math.cos(fase * RAD), R = rad + 0.5;
    ctx.arc(0, 0, R, Math.PI / 2, 3 * Math.PI / 2, false);
    ctx.ellipse(0, 0, Math.abs(k) * R, R, 0, 3 * Math.PI / 2, Math.PI / 2, k > 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(8,10,16,0.9)';
    ctx.fill();
    ctx.restore();
  }

  /* ── LA VISTA ──────────────────────────────────────────────────────── */
  function nuevaVista(cv) {
    return { cv: cv, az: 180, alt: 28, fov: 110, cenital: false, base: null, gnomonica: false, focal: null,
             camara: false, sensores: false, lineas: true, nombres: true, profundo: true, suelo: 0.93,
             sel: null, objetivo: null, dianas: [], W: 0, H: 0, dpr: 1, mira: null, centro: null };
  }
  /* La base de la camara en este-norte-arriba: f hacia donde se mira, u
     hacia arriba de la pantalla, r a la derecha. Con los sensores la da el
     movil (codigo6); a mano, el rumbo y la altura. Mirando al cenit, abajo
     queda el rumbo elegido, como en un planisferio. */
  function baseVista(V) {
    if (V.base) return V.base;
    var alt = (V.cenital ? 90 : V.alt) * RAD, az = V.az * RAD;
    var r = [Math.cos(az), -Math.sin(az), 0];
    var f = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
    return { f: f, u: cruz(r, f), r: r };
  }
  function escalaVista(V) {
    var m = Math.min(V.W, V.H) / 2;
    if (V.gnomonica) return V.focal || m / Math.tan(V.fov / 2 * RAD);
    return m / (2 * Math.tan(V.fov / 4 * RAD));
  }
  function proyector(V, B, esc) {
    var f = B.f, u = B.u, r = B.r, cx = V.W / 2, cy = V.H / 2, gn = V.gnomonica;
    return function (e, o) {
      var X = e[0] * r[0] + e[1] * r[1] + e[2] * r[2];
      var Y = e[0] * u[0] + e[1] * u[1] + e[2] * u[2];
      var Z = e[0] * f[0] + e[1] * f[1] + e[2] * f[2], k;
      if (gn) { if (Z < 0.03) return false; k = esc / Z; }
      else { if (Z < -0.9) return false; k = 2 * esc / (1 + Z); }
      o[0] = cx + k * X; o[1] = cy - k * Y; o[2] = Z;
      return true;
    };
  }
  /* Un punto de la pantalla, de vuelta al cielo (este, norte, arriba) */
  function alCielo(V, B, esc, px, py) {
    var a = (px - V.W / 2) / esc, b = (V.H / 2 - py) / esc, X, Y, Z;
    if (V.gnomonica) { var n = Math.sqrt(a * a + b * b + 1); X = a / n; Y = b / n; Z = 1 / n; }
    else { var q = (a * a + b * b) / 4; Z = (1 - q) / (1 + q); X = a * (1 + Z) / 2; Y = b * (1 + Z) / 2; }
    return [X * B.r[0] + Y * B.u[0] + Z * B.f[0], X * B.r[1] + Y * B.u[1] + Z * B.f[1], X * B.r[2] + Y * B.u[2] + Z * B.f[2]];
  }
  /* Lo que se pinta en un instante y no cambia en un segundo: el giro del
     cielo, el Sol, la Luna y los planetas. Con los sensores se pinta 30 veces
     por segundo y esto basta calcularlo una. */
  var CUERPOS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  var _inst = null;
  function instante(fecha) {
    var ms = Math.floor(fecha.getTime() / 1000);
    if (_inst && _inst.ms === ms) return _inst;
    var A = Astronomy, t = A.MakeTime(new Date(ms * 1000)), rot = rotacion(t), cu = {};
    CUERPOS.forEach(function (p) {
      var eq = A.Equator(A.Body[p], t, obs(), true, true);
      var h = A.Horizon(t, obs(), eq.ra, eq.dec, 'normal');
      var x = { p: p, alt: h.altitude, az: h.azimuth, e: enuDe(h.altitude, h.azimuth), dist: eq.dist };
      if (p !== 'Sun') { var il = A.Illumination(A.Body[p], t); x.mag = il.mag; x.fase = il.phase_angle; }
      cu[p] = x;
    });
    return (_inst = { ms: ms, t: t, rot: rot, cu: cu });
  }

  /* El color del cielo en una direccion: DIBUJO, no medida. Negro azulado de
     noche, un poco mas claro en el horizonte; el crepusculo encendido hacia
     el Sol; el azul del dia; y la Luna, que aclara todo y mas a su alrededor. */
  function colorCielo(alt, cs, sAlt, cl, lz, o) {
    var t = 1 - Math.max(alt, 0) / 90, H = t * t * t * t, M = Math.pow(t, 1.6);
    var r = 0.006 + 0.03 * H, g = 0.009 + 0.045 * H, b = 0.028 + 0.08 * H;
    var tw = suave(-18, -3, sAlt) * (1 - suave(-3, 6, sAlt));
    if (tw > 0) {
      var hs = (1 + cs) / 2, h3 = hs * hs * hs, h8 = h3 * h3 * hs * hs;
      r += tw * (0.05 * (1 - H) + H * (0.25 * hs + 0.75 * h8) * 1.0);
      g += tw * (0.08 * (1 - H) + H * (0.14 * hs + 0.32 * h8));
      b += tw * (0.2 * (1 - H) + H * (0.22 * (1 - h3) + 0.12 * h8));
    }
    var d = suave(-4, 8, sAlt);
    if (d > 0) {
      var dr = 0.22 + 0.4 * M, dg = 0.42 + 0.32 * M, db = 0.8 + 0.12 * M;
      var sol = Math.exp(-(1 - cs) * 30);
      r = r * (1 - d) + d * Math.min(1, dr + sol); g = g * (1 - d) + d * Math.min(1, dg + 0.95 * sol); b = b * (1 - d) + d * Math.min(1, db + 0.85 * sol);
    }
    if (lz > 0) {
      var halo = Math.exp(-(1 - cl) * 70) * 0.35 + Math.exp(-(1 - cl) * 9) * 0.08;
      r += lz * (0.035 + 0.03 * H + halo); g += lz * (0.05 + 0.04 * H + halo); b += lz * (0.1 + 0.05 * H + halo * 1.05);
    }
    o[0] = Math.min(255, r * 255); o[1] = Math.min(255, g * 255); o[2] = Math.min(255, b * 255);
  }

  /* ── PINTAR ──────────────────────────────────────────────────────────
     Capas, de abajo arriba: el cielo (en baja resolucion: es un degradado),
     la Via Lactea (tambien, que es niebla), figuras, estrellas, cielo
     profundo, planetas y Luna, el suelo con la bruma del horizonte, el
     horizonte nitido, los nombres y lo que se esta buscando. */
  var _tmp = [0, 0, 0], _p = [0, 0, 0], _q = [0, 0, 0];
  function pintarCielo(V, fecha, reloj) {
    var cv = V.cv, D = S.datos;
    if (!cv || !D) return;
    var ctx = cv.getContext('2d');
    var W = V.W = cv.width, H = V.H = cv.height, dpr = V.dpr;
    var I = instante(fecha), rot = I.rot, sol = I.cu.Sun, luna = I.cu.Moon;
    var B = baseVista(V), esc = escalaVista(V), P = proyector(V, B, esc);
    /* la luz de la Luna: su fraccion iluminada (el angulo de fase del motor
       es 0 con Luna llena y 180 con nueva: (1 + cos) / 2, no (1 − cos) / 2,
       que la dejaba a oscuras en luna llena; corregido el 21-10-2026) */
    var lunaLuz = luna.alt > -2 ? (1 + Math.cos(luna.fase * RAD)) / 2 * suave(-2, 15, luna.alt) : 0;
    /* hasta que magnitud: la que deja el cielo -noche, crepusculo, Luna- y
       un poco mas al acercarse */
    var oscuridad = suave(-2, -16, sol.alt);
    var lim = -1 + 6.5 * oscuridad - 1.3 * lunaLuz + limitar(Math.log(110 / V.fov) * 0.9, -0.4, 1.2);
    if (V.camara) lim = Math.min(lim, 4.6);
    lim = Math.min(lim, 5.5);
    var dianas = [], rotulos = [], fuera = 40 * dpr;
    function rotulo(txt, x, y, tam, color, prio, centro, peso, des) { rotulos.push({ txt: txt, x: x, y: y, tam: tam, color: color, prio: prio, centro: centro, peso: peso || '', des: des }); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    /* 1. el cielo y, en la misma pasada, el suelo y la bruma */
    var paso = Math.max(6, Math.round(10 * dpr)), cw = Math.ceil(W / paso), ch = Math.ceil(H / paso);
    var bufs = V._bufs;
    if (!bufs || bufs.w !== cw || bufs.h !== ch) {
      var c1 = document.createElement('canvas'), c2 = document.createElement('canvas');
      c1.width = c2.width = cw; c1.height = c2.height = ch;
      bufs = V._bufs = { w: cw, h: ch, cielo: c1, suelo: c2, dc: c1.getContext('2d').createImageData(cw, ch), ds: c2.getContext('2d').createImageData(cw, ch) };
    }
    var dc = bufs.dc.data, ds = bufs.ds.data, col = [0, 0, 0];
    var se = sol.e, le = luna.e, nocheSuelo = suave(-6, 6, sol.alt);
    for (var j = 0; j < ch; j++) for (var i = 0; i < cw; i++) {
      var e = alCielo(V, B, esc, (i + 0.5) * paso, (j + 0.5) * paso), k4 = (j * cw + i) * 4;
      var alt = Math.asin(limitar(e[2], -1, 1)) / RAD;
      colorCielo(alt, pto(e, se), sol.alt, pto(e, le), lunaLuz, col);
      dc[k4] = col[0]; dc[k4 + 1] = col[1]; dc[k4 + 2] = col[2]; dc[k4 + 3] = 255;
      /* el suelo: oscuro y algo azulado de noche, gris verdoso de dia; la
         bruma, del color del cielo de ese sitio, en los seis grados de abajo */
      if (alt < 0) {
        var p0 = suave(0, -25, alt);
        ds[k4] = 6 + 18 * nocheSuelo - 3 * p0; ds[k4 + 1] = 8 + 22 * nocheSuelo - 3 * p0; ds[k4 + 2] = 13 + 12 * nocheSuelo - 4 * p0;
        ds[k4 + 3] = 255 * V.suelo;
      } else if (alt < 6 && !V.camara) {
        var bz = (1 - alt / 6); bz *= bz;
        ds[k4] = Math.min(255, col[0] * 1.25 + 6); ds[k4 + 1] = Math.min(255, col[1] * 1.25 + 8); ds[k4 + 2] = Math.min(255, col[2] * 1.2 + 12);
        ds[k4 + 3] = 255 * 0.55 * bz;
      } else ds[k4 + 3] = 0;
    }
    ctx.imageSmoothingEnabled = true;
    try { ctx.imageSmoothingQuality = 'high'; } catch (e) {}
    if (!V.camara) {
      bufs.cielo.getContext('2d').putImageData(bufs.dc, 0, 0);
      ctx.drawImage(bufs.cielo, 0, 0, cw, ch, 0, 0, cw * paso, ch * paso);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, W, H);       // un velo, para que lo pintado se lea encima de la imagen
    }
    /* 2. la Via Lactea: los contornos de d3-celestial, en baja resolucion y
       aclarando, que es como se ve: una niebla. Mas calida hacia el centro
       de la galaxia. Brillo de dibujo, con la oscuridad y la Luna. */
    var brilloVia = suave(-11, -17, sol.alt) * (1 - 0.85 * lunaLuz) * (V.camara ? 0.5 : 1);
    if (brilloVia > 0.02) {
      var mw = V._mw, mf = 5;
      if (!mw || mw.width !== Math.ceil(W / mf) || mw.height !== Math.ceil(H / mf)) { mw = V._mw = document.createElement('canvas'); mw.width = Math.ceil(W / mf); mw.height = Math.ceil(H / mf); }
      var mc = mw.getContext('2d');
      mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, mw.width, mw.height); mc.setTransform(1 / mf, 0, 0, 1 / mf, 0, 0);
      D.via.forEach(function (pol) {
        var pts = recortar(pol.v, rot, P, V.gnomonica ? 0.05 : -0.6, B);
        if (pts.length < 3) return;
        mc.beginPath();
        pts.forEach(function (q, n) { if (n) mc.lineTo(q[0], q[1]); else mc.moveTo(q[0], q[1]); });
        mc.closePath();
        var w = pol.tibio;
        mc.fillStyle = 'rgba(' + Math.round(200 + 45 * w) + ',' + Math.round(210 + 20 * w) + ',' + Math.round(255 - 40 * w) + ',' + (0.085 + 0.045 * (pol[0] - 1)) + ')';
        mc.fill();
      });
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = brilloVia;
      try { ctx.filter = 'blur(' + (4 * dpr) + 'px)'; } catch (e) {}      // Safari viejo: sin desenfoque, pero pinta
      ctx.drawImage(mw, 0, 0, mw.width, mw.height, 0, 0, mw.width * mf, mw.height * mf);
      try { ctx.filter = 'none'; } catch (e) {}
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    /* 3. las figuras de las constelaciones */
    var conSel = V.sel && V.sel.con ? V.sel.con : null;
    if (V.lineas) {
      ctx.lineWidth = 1 * dpr; ctx.lineCap = 'round';
      Object.keys(D.lin).forEach(function (c) {
        ctx.strokeStyle = c === conSel ? 'rgba(170,205,255,0.75)' : (V.camara ? 'rgba(150,190,255,0.5)' : 'rgba(130,170,240,0.3)');
        ctx.beginPath();
        D.linV[c].forEach(function (tr) {
          for (var n = 1; n < tr.length; n++) segmento(ctx, tr[n - 1], tr[n], rot, P, V.gnomonica ? 0.05 : -0.6, B, V.camara || V.suelo > 0.5);
        });
        ctx.stroke();
      });
    }
    /* 4. las estrellas, de la mas brillante a la mas debil (asi vienen) */
    var twk = reloj && !V.quieto ? reloj / 1000 : 0, zoomTam = Math.pow(110 / V.fov, 0.28);
    ctx.globalCompositeOperation = 'lighter';
    var ocultas = V.camara || V.suelo > 0.5 ? -0.004 : -1;
    for (var s = 0; s < D.est.length; s++) {
      var st = D.est[s], m = st[2];
      if (m > lim + 0.3) break;
      aEnu(rot, st.v, _p); refractar(_p);
      if (_p[2] < ocultas) continue;
      if (!P(_p, _q) || _q[0] < -fuera || _q[1] < -fuera || _q[0] > W + fuera || _q[1] > H + fuera) continue;
      var altS = Math.asin(limitar(_p[2], -1, 1)) / RAD;
      var mEf = m + (altS < 40 ? K_EXT * (masaAire(altS) - 1) : 0);
      if (mEf > lim + 0.3) continue;
      var rad = 2.1 * Math.exp(-0.21 * (mEf - 2)) * zoomTam * dpr;
      var a = limitar(1.15 - 0.16 * mEf + 0.16 * (lim - 5), 0.18, 1) * limitar((lim + 0.3 - mEf) / 0.8, 0, 1);
      if (twk && mEf < 3.6) {
        var amp = 0.06 + 0.32 * Math.pow(1 - Math.max(_p[2], 0), 3), ph = st[4] % 97;
        a *= 1 - amp * (0.5 + 0.5 * Math.sin(twk * (2.3 + (st[4] % 7) * 0.55) + ph));
      }
      if (_p[2] < 0) a *= 0.35;
      ctx.globalAlpha = a;
      var tam = rad * 5.2;
      ctx.drawImage(spriteBV(st[3]), _q[0] - tam / 2, _q[1] - tam / 2, tam, tam);
      if (m < 4.6 && _p[2] > ocultas) dianas.push({ x: _q[0], y: _q[1], r: rad, prio: 3 + m / 3, sel: { est: st } });
    }
    ctx.globalAlpha = 1;
    /* 5. cielo profundo: de lejos lo de simple vista y los Messier de
       prismaticos; al acercar, el resto. Una niebla de su tamano de verdad
       y un trazo que dice que es (elipse galaxia, cuadro nebulosa, circulo
       cumulo), como en las cartas. */
    if (V.profundo && sol.alt < -10) {
      D.objetos.forEach(function (o) {
        if (!o.niv) return;
        if (V.fov > 70 && (o.niv === 3 || (o.niv === 2 && !o.M))) return;
        if (V.fov > 45 && o.niv === 3 && !o.M) return;
        aEnu(rot, o.v, _p); if (_p[2] < 0) return;
        if (!P(_p, _q) || _q[0] < -fuera || _q[1] < -fuera || _q[0] > W + fuera || _q[1] > H + fuera) return;
        var tamArc = o.tam ? o.tam[0] : 5, ext = esc * tamArc / 60 * RAD;      // su tamano de verdad, en pixeles (escala del centro)
        var rr = Math.max(3 * dpr, ext / 2);
        var luz = (o.m === null ? 0.25 : limitar(0.55 - 0.05 * (o.m - 4), 0.12, 0.6)) * (1 - 0.7 * lunaLuz) * suave(-10, -16, sol.alt);
        if (ext / 2 > 3 * dpr && luz > 0.05) {
          var gg = ctx.createRadialGradient(_q[0], _q[1], 0, _q[0], _q[1], ext / 2);
          gg.addColorStop(0, 'rgba(215,220,255,' + luz.toFixed(3) + ')'); gg.addColorStop(1, 'rgba(215,220,255,0)');
          ctx.fillStyle = gg; ctx.beginPath();
          ctx.ellipse(_q[0], _q[1], ext / 2, o.tam && o.tam[1] ? Math.max(1, ext / 2 * o.tam[1] / o.tam[0]) : ext / 2, 0.6, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = ['', 'rgba(170,230,175,0.6)', 'rgba(160,205,250,0.55)', 'rgba(225,175,240,0.5)'][o.niv];
        ctx.lineWidth = 1 * dpr; ctx.beginPath();
        var rs = Math.max(4 * dpr, Math.min(rr, 18 * dpr));
        if (o.t === 'gal') ctx.ellipse(_q[0], _q[1], rs * 1.4, rs * 0.7, 0.6, 0, 2 * Math.PI);
        else if (o.t === 'neb' || o.t === 'cne' || o.t === 'snr') ctx.rect(_q[0] - rs, _q[1] - rs, 2 * rs, 2 * rs);
        else ctx.arc(_q[0], _q[1], rs, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        if (V.nombres && (V.fov < 70 || o.niv === 1)) {
          var et = o.M ? 'M' + o.M : (o.C ? 'C' + o.C : designacionObjeto(o).split(' · ')[0]);
          rotulo(et, _q[0] + rs + 3 * dpr, _q[1] + 3 * dpr, 9.5, 'rgba(200,215,255,0.62)', 30 + (o.m || 9), false, '', true);
        }
        dianas.push({ x: _q[0], y: _q[1], r: rs, prio: 2, sel: { obj: o } });
      });
    }
    /* 6. planetas, Luna y Sol (no centellean: son discos, no puntos) */
    ctx.globalCompositeOperation = 'lighter';
    var COLOR = { Mercury: '#e6dccf', Venus: '#fff6dc', Mars: '#ff9a6a', Jupiter: '#ffe6c2', Saturn: '#f6dc96', Uranus: '#c4f2f6', Neptune: '#9ec4ff' };
    ['Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Mars', 'Mercury', 'Venus'].forEach(function (p) {
      var x = I.cu[p];
      if (x.e[2] < ocultas || x.mag > lim + 0.5) return;
      if (!P(x.e, _q) || _q[0] < -fuera || _q[1] < -fuera || _q[0] > W + fuera || _q[1] > H + fuera) return;
      var mEf = x.mag + (x.alt < 40 ? K_EXT * (masaAire(x.alt) - 1) : 0);
      var rad = (2.4 * Math.exp(-0.21 * (mEf - 2)) * zoomTam + 0.6) * dpr;
      var gg = ctx.createRadialGradient(_q[0], _q[1], 0, _q[0], _q[1], rad * 3);
      gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.22, COLOR[p]); gg.addColorStop(0.5, COLOR[p] + '55'); gg.addColorStop(1, COLOR[p] + '00');
      ctx.fillStyle = gg; ctx.globalAlpha = x.e[2] < 0 ? 0.35 : 1;
      ctx.beginPath(); ctx.arc(_q[0], _q[1], rad * 3, 0, 2 * Math.PI); ctx.fill();
      ctx.globalAlpha = 1;
      rotulo(nom(CIELO_CUERPO, p), _q[0] + rad + 5 * dpr, _q[1] + 4 * dpr, 11, '#F5C76B', 0, false, '600 ');
      dianas.push({ x: _q[0], y: _q[1], r: rad, prio: 0, sel: { planeta: p } });
    });
    /* 6b. la Estacion Espacial y los satelites brillantes, si hay elementos */
    if (S.sat.datos) { try { pintarSatelites(ctx, V, P, fecha, dpr, rotulo, dianas); } catch (e) { try { console.warn('cielo satelites:', e); } catch (_) {} } }
    ctx.globalCompositeOperation = 'source-over';
    [['Sun', R_SOL], ['Moon', R_LUNA]].forEach(function (x) {
      var c = I.cu[x[0]];
      if (c.e[2] < -0.02 && V.suelo > 0.5) return;
      if (!P(c.e, _q) || _q[0] < -fuera * 3 || _q[1] < -fuera * 3 || _q[0] > W + fuera * 3 || _q[1] > H + fuera * 3) return;
      var real = esc * Math.atan(x[1] / (c.dist * Astronomy.KM_PER_AU));      // el disco a su tamano aparente de verdad
      var rad = Math.max(real, (x[0] === 'Moon' ? 9 : 10) * dpr * zoomTam);
      if (x[0] === 'Sun') {
        var gg = ctx.createRadialGradient(_q[0], _q[1], rad * 0.6, _q[0], _q[1], rad * 7);
        gg.addColorStop(0, 'rgba(255,250,225,0.9)'); gg.addColorStop(0.25, 'rgba(255,225,150,0.35)'); gg.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(_q[0], _q[1], rad * 7, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#fffbea'; ctx.beginPath(); ctx.arc(_q[0], _q[1], rad, 0, 2 * Math.PI); ctx.fill();
      } else {
        var hg = ctx.createRadialGradient(_q[0], _q[1], rad, _q[0], _q[1], rad * 5);
        hg.addColorStop(0, 'rgba(230,235,255,' + (0.18 * (0.3 + lunaLuz)).toFixed(3) + ')'); hg.addColorStop(1, 'rgba(230,235,255,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(_q[0], _q[1], rad * 5, 0, 2 * Math.PI); ctx.fill();
        /* hacia donde quedan el Sol y el polo de la ecliptica, en pantalla */
        var qx = _q[0], qy = _q[1];
        var dirSol = direccionEnPantalla(c.e, sol.e, P, qx, qy);
        var polo = aEnu(rot, POLO_ECLIPTICA, [0, 0, 0]), dirNorte = direccionEnPantalla(c.e, polo, P, qx, qy);
        pintarLuna(ctx, qx, qy, rad, dirSol, dirNorte === null ? 0 : dirNorte + Math.PI / 2, c.fase);
      }
      rotulo(nom(CIELO_CUERPO, x[0]), _q[0] + rad + 5 * dpr, _q[1] + 4 * dpr, 11, '#F5C76B', 0, false, '600 ');
      dianas.push({ x: _q[0], y: _q[1], r: rad, prio: -1, sel: { planeta: x[0] } });
    });
    /* 7. el suelo, la bruma del horizonte y el horizonte nitido */
    if (V.suelo > 0) {
      bufs.suelo.getContext('2d').putImageData(bufs.ds, 0, 0);
      ctx.drawImage(bufs.suelo, 0, 0, cw, ch, 0, 0, cw * paso, ch * paso);
    }
    horizonte(ctx, V, P, dpr);
    /* 8. nombres: constelaciones, estrellas */
    if (V.nombres) {
      var conTam = V.fov > 100 ? 9.5 : 10.5;
      Object.keys(D.con).forEach(function (c) {
        D.con[c].etV.forEach(function (v) {
          aEnu(rot, v, _p); if (_p[2] < 0.03) return;
          if (!P(_p, _q) || _q[0] < 0 || _q[1] < 0 || _q[0] > W || _q[1] > H) return;
          rotulo(nombreCon(c).toLocaleUpperCase(loc()), _q[0], _q[1], conTam, c === conSel ? 'rgba(200,220,255,0.95)' : 'rgba(150,180,235,0.5)', 20 - Math.min(10, (D.con[c].n6v || 0) / 15), true, '500 ');
        });
      });
      var limNom = V.fov > 100 ? 1.6 : V.fov > 60 ? 2.3 : V.fov > 30 ? 3.2 : 4.2;
      D.estrellas.forEach(function (e) {
        if (e.m > limNom && e.h !== 11767) return;
        aEnu(rot, e.v, _p); refractar(_p); if (_p[2] < 0.005) return;
        if (!P(_p, _q) || _q[0] < 0 || _q[1] < 0 || _q[0] > W || _q[1] > H) return;
        rotulo(nombreEstrella(e.h) || e.n, _q[0] + 6 * dpr, _q[1] - 5 * dpr, 10, 'rgba(235,240,255,0.8)', 5 + e.m);
      });
    }
    /* 9. lo elegido y lo que se busca */
    var s0 = V.sel;
    if (s0) {
      var e0 = vectorSel(s0, I);
      if (e0 && P(e0, _q) && e0[2] > -0.02) {
        ctx.strokeStyle = 'rgba(245,199,107,0.95)'; ctx.lineWidth = 1.6 * dpr;
        ctx.beginPath(); ctx.arc(_q[0], _q[1], 12 * dpr, 0, 2 * Math.PI); ctx.stroke();
      }
    }
    if (V.objetivo) flecha(ctx, V, P, I, dpr, reloj);
    /* el recorrido de un astro esa noche, si se pidio en su ficha */
    if (V.rastro) { try { pintarRastro(ctx, V, P, fecha, dpr, rotulo); } catch (e) { try { console.warn('cielo rastro:', e); } catch (_) {} V.rastro = null; } }
    /* 10. los rotulos, por importancia y sin pisarse */
    ctx.globalCompositeOperation = 'source-over';
    rotulos.sort(function (a, b) { return a.prio - b.prio; });
    var ocupado = [];
    ctx.textBaseline = 'alphabetic';
    rotulos.forEach(function (r) {
      ctx.font = r.peso + (r.tam * dpr) + 'px DM Sans, system-ui, sans-serif';
      var w = ctx.measureText(r.txt).width, h = r.tam * dpr;
      var x0 = r.centro ? r.x - w / 2 : r.x;
      var caja = [x0 - 3 * dpr, r.y - h, x0 + w + 3 * dpr, r.y + 3 * dpr];
      if (caja[0] < 2 || caja[2] > W - 2) return;
      if (ocupado.some(function (o) { return caja[0] < o[2] && caja[2] > o[0] && caja[1] < o[3] && caja[3] > o[1]; })) return;
      ocupado.push(caja);
      ctx.textAlign = r.centro ? 'center' : 'left';
      ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 3 * dpr;
      ctx.fillStyle = r.color;
      if (r.centro) { try { ctx.letterSpacing = (1.2 * dpr) + 'px'; } catch (e) {} }
      ctx.fillText(r.txt, r.x, r.y);
      if (r.centro) { try { ctx.letterSpacing = '0px'; } catch (e) {} }
      ctx.shadowBlur = 0;
    });
    ctx.textAlign = 'left';
    V.dianas = dianas;
    V.inst = I; V.esc = esc; V.B = B;
  }
  /* Un poligono del cielo, girado y recortado contra el plano de delante
     (Sutherland-Hodgman con un solo plano): lo que queda detras de quien
     mira no se proyecta, se corta en el borde. */
  function recortar(vs, rot, P, zmin, B) {
    var out = [], prev = null, pz = 0, e = [0, 0, 0];
    var lista = vs.map(function (v) { var x = aEnu(rot, v, [0, 0, 0]); return x; });
    for (var i = 0; i <= lista.length; i++) {
      var cur = lista[i % lista.length], cz = pto(cur, B.f);
      if (prev) {
        if ((pz >= zmin) !== (cz >= zmin)) {
          var t = (zmin - pz) / (cz - pz);
          var x = [prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1]), prev[2] + t * (cur[2] - prev[2])];
          var q = [0, 0, 0]; if (P(unir(x), q) || P(x, q)) out.push(q);
        }
      }
      if (i < lista.length && cz >= zmin) { var q2 = [0, 0, 0]; if (P(cur, q2)) out.push(q2); }
      prev = cur; pz = cz;
    }
    return out;
  }
  function segmento(ctx, a, b, rot, P, zmin, B, ocultarBajo) {
    var ea = aEnu(rot, a, [0, 0, 0]), eb = aEnu(rot, b, [0, 0, 0]);
    if (ocultarBajo && ea[2] < -0.02 && eb[2] < -0.02) return;
    var za = pto(ea, B.f), zb = pto(eb, B.f);
    if (za < zmin && zb < zmin) return;
    if (za < zmin) { var t = (zmin - za) / (zb - za); ea = unir([ea[0] + t * (eb[0] - ea[0]), ea[1] + t * (eb[1] - ea[1]), ea[2] + t * (eb[2] - ea[2])]); }
    else if (zb < zmin) { var u = (zmin - zb) / (za - zb); eb = unir([eb[0] + u * (ea[0] - eb[0]), eb[1] + u * (ea[1] - eb[1]), eb[2] + u * (ea[2] - eb[2])]); }
    var qa = [0, 0, 0], qb = [0, 0, 0];
    if (!P(ea, qa) || !P(eb, qb)) return;
    ctx.moveTo(qa[0], qa[1]); ctx.lineTo(qb[0], qb[1]);
  }
  /* El angulo, en pantalla, hacia el que queda «b» visto desde «a»: un punto
     un poco hacia b por el circulo maximo, proyectado. */
  function direccionEnPantalla(a, b, P, qx, qy) {
    var d = pto(a, b), x = [b[0] - d * a[0], b[1] - d * a[1], b[2] - d * a[2]], l = Math.sqrt(pto(x, x));
    if (l < 1e-9) return null;
    var e = 0.01, p = unir([a[0] + e * x[0] / l, a[1] + e * x[1] / l, a[2] + e * x[2] / l]), q = [0, 0, 0];
    if (!P(p, q)) return null;
    return Math.atan2(q[1] - qy, q[0] - qx);
  }
  function vectorSel(s, I) {
    if (s.planeta) return I.cu[s.planeta].e;
    if (s.sat) { var st = satPorClave(s.sat), x = st && satSirve(st, I.t.date.getTime()) ? dondeSat(st, I.t.date) : null; return x ? enuDe(x.alt, x.az) : null; }
    var v = s.v || (s.est && s.est.v) || (s.obj && s.obj.v) || (s.rec && s.rec.v);
    if (!v && s.con && S.datos.con[s.con]) v = S.datos.con[s.con].etV[0];
    return v ? refractar(aEnu(I.rot, v, [0, 0, 0])) : null;
  }
  /* El horizonte nitido y los puntos cardinales sobre el suelo */
  function horizonte(ctx, V, P, dpr) {
    var q = [0, 0, 0], ant = null;
    ctx.strokeStyle = V.camara ? 'rgba(245,199,107,0.7)' : 'rgba(245,199,107,0.45)'; ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    for (var a = 0; a <= 360; a += 2) {
      var ok_ = P(enuDe(0, a), q);
      if (ok_ && ant && Math.abs(q[0] - ant[0]) < V.W && Math.abs(q[1] - ant[1]) < V.H) ctx.lineTo(q[0], q[1]);
      else if (ok_) ctx.moveTo(q[0], q[1]);
      ant = ok_ ? [q[0], q[1]] : null;
    }
    ctx.stroke();
    ctx.font = '700 ' + (12 * dpr) + 'px DM Sans, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < 8; i++) {
      var alto = V.cenital ? -5 : -2.2;
      if (!P(enuDe(alto, i * 45), q)) continue;
      if (q[0] < 8 * dpr || q[1] < 8 * dpr || q[0] > V.W - 8 * dpr || q[1] > V.H - 8 * dpr) continue;
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.5)' : '#F5C76B';
      ctx.fillText(T('Rumbo' + RUMBOS[i]), q[0], q[1] + (V.cenital ? 0 : 6 * dpr));
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }
  /* Lo que se busca: un anillo que late si esta a la vista, una flecha en el
     borde si no, con lo que falta en grados. */
  function flecha(ctx, V, P, I, dpr, reloj) {
    var e = vectorSel(V.objetivo, I);
    if (!e) return;
    var B = V.B || baseVista(V), q = [0, 0, 0];
    var X = pto(e, B.r), Y = pto(e, B.u), Z = pto(e, B.f);
    var dentro = P(e, q) && q[0] > 30 * dpr && q[1] > 30 * dpr && q[0] < V.W - 30 * dpr && q[1] < V.H - 30 * dpr;
    ctx.save();
    if (dentro) {
      var lat = 0.5 + 0.5 * Math.sin((reloj || 0) / 260);
      ctx.strokeStyle = 'rgba(120,230,170,' + (0.55 + 0.4 * lat).toFixed(2) + ')'; ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.arc(q[0], q[1], (16 + 6 * lat) * dpr, 0, 2 * Math.PI); ctx.stroke();
      V.objetivo.cerca = Math.acos(limitar(Z, -1, 1)) / RAD < 4;
    } else {
      var ang = Math.atan2(-Y, X), cx = V.W / 2, cy = V.H / 2, m = 46 * dpr;
      var tx = Math.cos(ang), ty = Math.sin(ang), k = Math.min((cx - m) / Math.max(Math.abs(tx), 1e-6), (cy - m) / Math.max(Math.abs(ty), 1e-6));
      var x = cx + tx * k, y = cy + ty * k;
      ctx.translate(x, y); ctx.rotate(ang);
      ctx.fillStyle = 'rgba(120,230,170,0.92)';
      ctx.beginPath(); ctx.moveTo(18 * dpr, 0); ctx.lineTo(-8 * dpr, -12 * dpr); ctx.lineTo(-3 * dpr, 0); ctx.lineTo(-8 * dpr, 12 * dpr); ctx.closePath(); ctx.fill();
      V.objetivo.cerca = false;
    }
    ctx.restore();
    V.objetivo.grados = Math.acos(limitar(Z, -1, 1)) / RAD;
  }

  /* ── LA PESTANA «MAPA» ─────────────────────────────────────────────
     La carta, de la hora que se elija: la de esta noche si se abre de dia, o
     el momento que traiga quien la abre (el mejor de un planeta, de un
     objeto). Con el dedo se gira el cielo y con dos se acerca; tocando algo,
     su ficha. «▶» hace correr la noche. */
  function instanteMapa() {
    var base = S.mapa.t ? S.mapa.t.getTime() : Date.now();
    return new Date(base + S.mapa.desfase * 60000);
  }
  function pararMapa() {
    if (S.mapa.reloj) { clearInterval(S.mapa.reloj); S.mapa.reloj = null; }
    if (S.mapa.anim) { cancelAnimationFrame(S.mapa.anim); S.mapa.anim = null; }
    S.mapa.corre = false;
  }
  function irAlMapa(o) {
    S.pestana = 'mapa';
    S.mapa.t = o.t || null; S.mapa.porDefecto = !o.t; S.mapa.ahora = false;
    S.mapa.desfase = 0;
    horaPorDefecto();
    var I = instante(instanteMapa()), sel = o.planeta ? { planeta: o.planeta } : o.sat ? { sat: o.sat } : o.con ? { con: o.con } : { v: o.v, nombre: o.nombre, des: o.des, k: o.k, rec: o.rec };
    var e = vectorSel(sel, I);
    if (e) { var h = altAzDe(e); if (h.alt > -2) { S.mapa.az = h.az; S.mapa.alt = limitar(h.alt, 18, 70); S.mapa.fov = 80; S.mapa.cenital = false; } }
    S.mapa.sel = sel;
    pintar();
  }
  function botonMapa(txt, pulsado, fn, ayuda, cls) {
    var b = el('button', cls || null, txt); b.type = 'button';
    if (pulsado !== null) b.setAttribute('aria-pressed', pulsado ? 'true' : 'false');
    if (ayuda) { b.title = ayuda; b.setAttribute('aria-label', ayuda); }
    b.addEventListener('click', fn);
    return b;
  }
  /* Abierta de dia, un cielo azul no ensena nada: se pone la hora en que
     empieza la noche cerrada, y «Ahora» vuelve al momento real. */
  function horaPorDefecto() {
    if (S.mapa.t && !S.mapa.porDefecto) return;
    var hoy = S.fecha === nocheDeHoy();
    if (S.mapa.ahora && hoy) return;
    var deDia = cuerpoHorizonte(Astronomy.Body.Sun, Astronomy.MakeTime(new Date())).alt > -6;
    if (!hoy || deDia) { S.mapa.t = noche().oscuro.date; S.mapa.porDefecto = true; }
    else { S.mapa.t = null; S.mapa.porDefecto = false; }
  }
  function vistaMapa() {
    var M = S.mapa;
    if (!M.v) M.v = nuevaVista(null);
    var V = M.v;
    V.az = M.az; V.alt = M.alt; V.fov = M.cenital ? 184 : M.fov; V.cenital = M.cenital;
    V.lineas = M.lineas; V.nombres = M.nombres; V.profundo = M.profundo; V.sel = M.sel; V.rastro = M.rastro;
    V.quieto = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    return V;
  }
  function pintarMapa(c) {
    horaPorDefecto();
    var M = S.mapa;
    selectorFecha(c);
    var caja = el('div', 'cielo-mapa-caja');
    var cv = el('canvas');
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', T('MapaAria'));
    caja.appendChild(cv);
    /* encima de la carta: la hora y la vista */
    var hud = el('div', 'cielo-mapa-hud');
    var lh = el('span', 'cielo-mapa-hora'); M.etiqueta = lh; hud.appendChild(lh);
    var der = el('div', 'cielo-mapa-hud-der');
    der.appendChild(botonMapa(M.cenital ? '⌒' : '◎', null, function () { M.cenital = !M.cenital; pintar(); }, T(M.cenital ? 'MapaHorizonte' : 'MapaTodo'), 'cielo-hud-btn'));
    der.appendChild(botonMapa('−', null, function () { zoomMapa(1.4); }, T('Alejar'), 'cielo-hud-btn'));
    der.appendChild(botonMapa('+', null, function () { zoomMapa(1 / 1.4); }, T('Acercar'), 'cielo-hud-btn'));
    /* 📸: la carta tal cual, con su pie, para guardarla o compartirla */
    var bcap = botonMapa('📸', null, function () { capturarMapa(bcap); }, T('Capturar'), 'cielo-hud-btn');
    der.appendChild(bcap);
    hud.appendChild(der);
    caja.appendChild(hud);
    c.appendChild(caja);
    M.canvas = cv;
    var V = vistaMapa(); V.cv = cv;
    /* «Apunta al cielo»: lo que pidio Jerome, la estrella de la terraza */
    var ap = el('button', 'cielo-apunta', '');
    ap.type = 'button';
    ap.appendChild(el('span', 'cielo-apunta-ico', '📱'));
    var apt = el('span', 'cielo-apunta-txt'); apt.appendChild(el('b', null, T('Apunta'))); apt.appendChild(el('span', null, T('ApuntaSub')));
    ap.appendChild(apt);
    ap.addEventListener('click', function () { abrirVista({}); });
    c.appendChild(ap);
    /* la hora */
    var c1 = el('div', 'cielo-mapa-ctl');
    var rg = el('input'); rg.type = 'range'; rg.min = -360; rg.max = 720; rg.step = 5; rg.value = M.desfase;
    rg.setAttribute('aria-label', T('MapaHora'));
    rg.addEventListener('input', function () { M.desfase = +rg.value; M.corre = false; marcarPlay(); dibujar(); });
    M.rango = rg;
    var bp = botonMapa('▶', false, function () { M.corre = !M.corre; marcarPlay(); if (M.corre) animarMapa(); }, T('MapaCorre'));
    M.botonPlay = bp;
    c1.appendChild(bp); c1.appendChild(rg);
    c1.appendChild(botonMapa(T('Ahora'), null, function () {
      M.t = null; M.ahora = true; M.porDefecto = false; M.desfase = 0; M.corre = false; S.fecha = nocheDeHoy(); pintar();
    }));
    c.appendChild(c1);
    /* hacia donde se mira */
    var c2 = el('div', 'cielo-mapa-ctl');
    c2.appendChild(el('span', 'cielo-nota', T('Mirando')));
    M.rumbos = [];
    [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'O']].forEach(function (x) {
      var b = botonMapa(T('Rumbo' + x[1]), false, function () { M.az = x[0]; M.alt = 40; M.cenital = false; pintar(); });
      b.setAttribute('data-az', x[0]); M.rumbos.push(b); c2.appendChild(b);
    });
    marcarRumbos();
    c.appendChild(c2);
    var c3 = el('div', 'cielo-mapa-ctl');
    c3.appendChild(botonMapa(T('MapaLineas'), M.lineas, function () { M.lineas = !M.lineas; pintar(); }));
    c3.appendChild(botonMapa(T('MapaNombres'), M.nombres, function () { M.nombres = !M.nombres; pintar(); }));
    c3.appendChild(botonMapa(T('MapaProfundo'), M.profundo, function () { M.profundo = !M.profundo; pintar(); }));
    c.appendChild(c3);
    var sel = el('div', 'cielo-sel'); c.appendChild(sel); M.caja = sel;
    c.appendChild(el('div', 'cielo-nota', T('MapaNota')));
    tocarCielo(cv, function () { return vistaMapa(); }, {
      girar: function (dAz, dAlt) { if (M.cenital) { M.az = (M.az - dAz + 360) % 360; } else { M.az = (M.az - dAz + 360) % 360; M.alt = limitar(M.alt + dAlt, -10, 90); } marcarRumbos(); dibujar(); },
      zoom: function (f) { zoomMapa(f); },
      tocar: function (sel) { M.sel = sel; dibujar(); pintarSeleccionMapa(); }
    });
    pararMapa();
    requestAnimationFrame(function () { dibujar(); pintarSeleccionMapa(); animarMapa(); });
    if (!M.t) M.reloj = setInterval(function () { if (S.abierto && S.pestana === 'mapa' && !M.t) { dibujar(); } }, 60000);
  }
  /* el rumbo pulsado: el mas cercano a donde se mira (a menos de 30 grados) */
  function marcarRumbos() {
    var M = S.mapa; if (!M.rumbos) return;
    M.rumbos.forEach(function (b) { b.setAttribute('aria-pressed', !M.cenital && Math.abs(difAng(M.az, +b.getAttribute('data-az'))) <= 30 ? 'true' : 'false'); });
  }
  function marcarPlay() {
    var b = S.mapa.botonPlay; if (!b) return;
    b.textContent = S.mapa.corre ? '❚❚' : '▶';
    b.setAttribute('aria-pressed', S.mapa.corre ? 'true' : 'false');
  }
  /* La animacion de la carta: el centelleo (si no se pidio menos movimiento)
     y, con «▶», la noche corriendo: 20 minutos de cielo por segundo. Solo
     mientras la pestana esta a la vista. */
  function animarMapa() {
    var M = S.mapa;
    if (M.anim) return;
    var ant = performance.now(), ultimo = 0;
    function paso(ahora) {
      M.anim = null;
      if (!S.abierto || S.pestana !== 'mapa' || !M.canvas || !M.canvas.isConnected || document.hidden || VI) return;
      /* el centelleo a 20 cuadros por segundo basta, y gasta la mitad */
      if (!M.corre && ahora - ultimo < 48) { M.anim = requestAnimationFrame(paso); return; }
      ultimo = ahora;
      var dt = Math.min(0.1, (ahora - ant) / 1000); ant = ahora;
      var V = vistaMapa();
      if (M.corre) {
        M.desfase += dt * 20;
        if (M.desfase > 720) M.desfase = -360;
        if (M.rango) M.rango.value = Math.round(M.desfase);
      }
      if (M.corre || !V.quieto) dibujar(ahora);
      if (M.corre || !V.quieto) M.anim = requestAnimationFrame(paso);
    }
    M.anim = requestAnimationFrame(paso);
  }
  function zoomMapa(f) {
    var M = S.mapa;
    if (M.cenital) { if (f < 1) { M.cenital = false; M.fov = 120; pintar(); } return; }
    M.fov = limitar(M.fov * f, 12, 150);
    dibujar();
  }
  function dibujar(reloj) {
    var M = S.mapa, cv = M.canvas;
    if (!cv || !cv.isConnected || !S.datos) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var css = cv.parentNode.clientWidth || 340;
    var alto = Math.round(Math.min(css * 1.2, Math.max(300, (window.innerHeight || 700) * 0.58)));
    var W = Math.round(css * dpr), H = Math.round(alto * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    cv.style.height = alto + 'px';
    var V = vistaMapa(); V.cv = cv; V.dpr = dpr;
    var t = instanteMapa();
    pintarCielo(V, t, reloj || performance.now());
    M.dianas = V.dianas; M.dpr = dpr;
    marcarRumbos();
    if (M.etiqueta) M.etiqueta.textContent = dia(t) + ' · ' + hora(t);
  }
  /* El dedo en el cielo: arrastrar gira, pellizcar acerca, tocar elige. */
  function tocarCielo(cv, vista, fn) {
    var p = {}, pinza = null;
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', function (e) {
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      p[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: Date.now() };
      var ids = Object.keys(p);
      if (ids.length === 2) { var a = p[ids[0]], b = p[ids[1]]; pinza = { d: Math.hypot(a.x - b.x, a.y - b.y) }; }
    });
    cv.addEventListener('pointermove', function (e) {
      var q = p[e.pointerId]; if (!q) return;
      var dx = e.clientX - q.x, dy = e.clientY - q.y;
      q.x = e.clientX; q.y = e.clientY;
      var ids = Object.keys(p), V = vista();
      if (ids.length === 2 && pinza) {
        var a = p[ids[0]], b = p[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 10 && pinza.d > 10) fn.zoom(pinza.d / d);
        pinza.d = d;
      } else if (ids.length === 1) {
        var r = cv.getBoundingClientRect(), lado = Math.min(r.width, r.height) || 300;
        var gpp = (V.cenital ? 184 : V.fov) / lado;            // grados por pixel, aprox.
        fn.girar(dx * gpp, dy * gpp);
      }
    });
    function soltar(e) {
      var q = p[e.pointerId]; delete p[e.pointerId];
      if (Object.keys(p).length < 2) pinza = null;
      if (q && Math.hypot(e.clientX - q.x0, e.clientY - q.y0) < 8 && Date.now() - q.t0 < 500) {
        var V = vista(), r = cv.getBoundingClientRect(), dpr = V.dpr || 1;
        fn.tocar(elegirEn(V, (e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr, 24 * dpr));
      }
    }
    cv.addEventListener('pointerup', soltar);
    cv.addEventListener('pointercancel', function (e) { delete p[e.pointerId]; pinza = null; });
    cv.addEventListener('wheel', function (e) { e.preventDefault(); fn.zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12); }, { passive: false });
  }
  /* Lo que hay cerca de un punto de la pantalla: lo mas cercano, y a igual
     distancia lo mas importante (Luna, planetas, cielo profundo, estrellas) */
  function elegirEn(V, x, y, radio) {
    var mejor = null;
    (V.dianas || []).forEach(function (d) {
      var dist = Math.max(0, Math.hypot(d.x - x, d.y - y) - d.r);
      if (dist > radio) return;
      var pe = dist + d.prio * 3 * (V.dpr || 1);
      if (!mejor || pe < mejor.pe) mejor = { pe: pe, d: d };
    });
    return mejor ? mejor.d.sel : null;
  }
  function pintarSeleccionMapa() {
    var c = S.mapa.caja; if (!c) return;
    c.textContent = '';
    var t = instanteMapa(), sol = cuerpoHorizonte(Astronomy.Body.Sun, Astronomy.MakeTime(t)).alt;
    if (sol > -6) c.appendChild(el('div', 'cielo-nota', T(sol > 0 ? 'MapaDeDia' : 'MapaCrepusculo')));
    if (S.mapa.rastro) c.appendChild(el('div', 'cielo-nota', T('RecorridoNota', { c: cosaDe(S.mapa.rastro, t).nombre })));
    if (!S.mapa.sel) { c.appendChild(el('div', 'cielo-nota', T('MapaToca'))); return; }
    c.appendChild(fichaCosa(cosaDe(S.mapa.sel), t, { buscar: true, recorridoActivo: mismoSel(S.mapa.rastro, S.mapa.sel),
      recorrido: function (sel) { S.mapa.rastro = sel; dibujar(); pintarSeleccionMapa(); } }));
  }
  function capturarMapa(boton) {
    var M = S.mapa, V = vistaMapa(), t = instanteMapa();
    if (!M.canvas) return Promise.resolve(null);
    V.cv = M.canvas; V.dpr = M.dpr || 1;
    var c = M.sel ? cosaDe(M.sel, t) : null;
    return capturarY(V, { fecha: t, titulo: c ? c.nombre : T('Titulo'), avisa: function (r) {
      var k = M.caja; if (!k || (r !== 'descargado' && r !== 'fallo')) return;
      var ant = k.querySelector('.cielo-nota-aviso'); if (ant) ant.remove();
      k.insertBefore(el('div', 'cielo-nota cielo-nota-aviso', T(r === 'descargado' ? 'CapturaLista' : 'CapturaNo')), k.firstChild);
    } });
  }

  /* ── «APUNTA AL CIELO» ─────────────────────────────────────────────
     Lo de Jerome en la terraza: se ve una estrella, se abre la app, se
     levanta el movil hacia ella y la app dice cual es, con su ficha. Es lo
     que hacen Stellarium Mobile, Star Walk 2, SkyView o Sky Guide: la carta
     a pantalla completa, orientada con los sensores del movil (brujula,
     giroscopio y acelerometro, por la API DeviceOrientation del navegador) y,
     si se quiere, encima de la imagen de la camara.

     · Lo que queda en el circulo del centro se nombra abajo; tocando el
       nombre, o cualquier punto del cielo, sale su ficha.
     · 🔍 busca algo (un planeta, una estrella, una constelacion, un Messier)
       y una flecha lleva hasta el; al centrarlo, el movil vibra.
     · La brujula del movil marca el norte MAGNETICO: se corrige con la
       declinacion del WMM2025 en Izana (datos/cielo.json, «declinacion»). Si
       aun asi no cuadra (un movil sin calibrar, hierros cerca), se arrastra el
       cielo a un lado y a otro hasta que cuadre; «↺» lo devuelve.
     · iOS pide permiso para los sensores, y hay que pedirlo en el mismo toque
       del boton: por eso abrirVista() lo pide lo primero.
     · Nada sale del movil: ni la imagen de la camara (solo se ensena, no se
       guarda ni se envia) ni la orientacion. Ver la politica de privacidad.
     Sin sensores (un ordenador) funciona a mano: arrastrar y pellizcar. */
  var VI = null;                      // la vista abierta, o null
  var atrasPendiente = false;         // un history.back() nuestro, en camino
  /* «Cerrar» es una fila de UI_TX de toda la app (la del ✕ del panel) */
  function cerrarTxt() { return (typeof tx === 'function' && tx('ariaCerrar')) || '✕'; }
  var SEN = { n: 0 };
  function abrirVista(opc) {
    opc = opc || {};
    vozPausar();                                  // la noche guiada en voz alta espera a la vuelta
    var pedir = null;
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function')
        pedir = DeviceOrientationEvent.requestPermission();
    } catch (e) { pedir = null; }
    if (VI) cerrarVista(true);
    montarVista(opc);
    var p = pedir ? Promise.resolve(pedir).catch(function () { return 'denied'; }) : Promise.resolve('granted');
    p.then(function (r) { if (!VI) return; if (r === 'granted') escucharSensores(); else sinSensores('permiso'); });
  }
  function declinacionHoy(fecha) {
    var a = S.datos && S.datos.declinacion && S.datos.declinacion.anios;
    if (!a || !a.length) return 0;
    var y = fecha.getUTCFullYear() + (fecha.getTime() - Date.UTC(fecha.getUTCFullYear(), 0, 1)) / (365.25 * 864e5);
    if (y <= a[0][0]) return a[0][1];
    for (var i = 1; i < a.length; i++) if (y <= a[i][0]) return a[i - 1][1] + (a[i][1] - a[i - 1][1]) * (y - a[i - 1][0]) / (a[i][0] - a[i - 1][0]);
    return a[a.length - 1][1];
  }
  function guardado(k, def) { try { var v = localStorage.getItem(k); return v === null ? def : +v; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }

  function montarVista(opc) {
    var d = el('div', null); d.id = 'cielo-vista';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', T('Apunta'));
    var video = el('video', 'cv-video'); video.setAttribute('playsinline', ''); video.setAttribute('muted', ''); video.muted = true; video.autoplay = true; video.hidden = true;
    var cv = el('canvas', 'cv-lienzo'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', T('MapaAria'));
    d.appendChild(video); d.appendChild(cv);
    var arriba = el('div', 'cv-arriba');
    var bx = botonMapa('✕', null, function () { cerrarVista(); }, cerrarTxt(), 'cv-btn');
    var tit = el('div', 'cv-titulo', T('Apunta'));
    var bcam = botonMapa('📷', false, function () { camara(!VI.V.camara); }, T('Camara'), 'cv-btn');
    var bbus = botonMapa('🔍', null, function () { buscar(true); }, T('BuscarCielo'), 'cv-btn');
    var bcap = botonMapa('📸', null, function () { capturarVista(); }, T('Capturar'), 'cv-btn');
    var broj = botonMapa('●', S.rojo, function () { rojo(!S.rojo); broj.setAttribute('aria-pressed', S.rojo ? 'true' : 'false'); }, T('Rojo'), 'cv-btn cv-btn-rojo');
    [bx, tit, bcam, bbus, bcap, broj].forEach(function (x) { arriba.appendChild(x); });
    d.appendChild(arriba);
    var obj = el('div', 'cv-objetivo'); obj.hidden = true; d.appendChild(obj);
    /* la comprobacion de la brujula: «pon la Luna en el circulo y toca Ya» */
    var comp = el('div', 'cv-comprobar'); comp.hidden = true; d.appendChild(comp);
    var aviso = el('div', 'cv-aviso'); aviso.setAttribute('aria-live', 'polite'); d.appendChild(aviso);
    /* la guia de 20 segundos, la primera vez */
    var guia = el('div', 'cv-guia'); guia.hidden = true; guia.setAttribute('role', 'dialog'); guia.setAttribute('aria-label', T('GuiaTitulo')); d.appendChild(guia);
    var mira = el('div', 'cv-mira'); mira.setAttribute('aria-hidden', 'true'); d.appendChild(mira);
    var nombre = el('button', 'cv-nombre'); nombre.type = 'button';
    nombre.addEventListener('click', function () { if (VI.centro) abrirHoja(VI.centro); });
    d.appendChild(nombre);
    var abajo = el('div', 'cv-abajo');
    var bhora = botonMapa('', null, function () { VI.tiempo.hidden = !VI.tiempo.hidden; }, T('MapaHora'), 'cv-chip');
    var bmodo = botonMapa('', null, function () { modoSensores(!VI.V.sensores); }, T('Sensores'), 'cv-chip');
    var bcomp = botonMapa('', null, function () { comprobarBrujula(); }, T('Comprobar'), 'cv-chip');
    bcomp.hidden = true;
    var baj = botonMapa('', null, function () { VI.ajuste = 0; guardar('tgo_cielo_ajuste', 0); VI.cal = 1; guardar('tgo_cielo_cal', 1); VI.comprobada = null; pintarChips(); }, T('AjusteQuitar'), 'cv-chip');
    baj.hidden = true;
    var bri = controlBrillo('cv-brillo'); bri.hidden = !S.rojo;
    [bhora, bmodo, bcomp, baj, bri].forEach(function (x) { abajo.appendChild(x); });
    d.appendChild(abajo);
    /* la hora: «ahora» por defecto, que es el cielo que se tiene delante */
    var tiempo = el('div', 'cv-tiempo'); tiempo.hidden = true;
    var rg = el('input'); rg.type = 'range'; rg.min = -720; rg.max = 720; rg.step = 5; rg.value = 0; rg.setAttribute('aria-label', T('MapaHora'));
    rg.addEventListener('input', function () { VI.desfase = +rg.value; VI.corre = false; pintarChips(); });
    var bplay = botonMapa('▶', false, function () { VI.corre = !VI.corre; pintarChips(); }, T('MapaCorre'), 'cv-chip');
    var bya = botonMapa(T('Ahora'), null, function () { VI.desfase = 0; VI.corre = false; rg.value = 0; pintarChips(); }, null, 'cv-chip');
    tiempo.appendChild(bplay); tiempo.appendChild(rg); tiempo.appendChild(bya);
    d.appendChild(tiempo);
    var hoja = el('div', 'cv-hoja'); hoja.hidden = true; d.appendChild(hoja);
    var bus = el('div', 'cv-busqueda'); bus.hidden = true; d.appendChild(bus);
    document.body.appendChild(d);
    var V = nuevaVista(cv);
    V.az = S.mapa.az; V.alt = 35; V.fov = 70; V.suelo = 0.8; V.nombres = true; V.lineas = true; V.profundo = true;
    V.quieto = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    VI = { d: d, V: V, video: video, cv: cv, tit: tit, bcam: bcam, nombre: nombre, aviso: aviso, obj: obj, bhora: bhora, bmodo: bmodo, baj: baj,
           bcomp: bcomp, comp: comp, guia: guia, comprobando: null, comprobada: null, guiaAbierta: false, ayudaDada: false,
           tiempo: tiempo, rango: rg, bplay: bplay, hoja: hoja, bus: bus, desfase: 0, corre: false, centro: null, centroClave: null,
           ajuste: guardado('tgo_cielo_ajuste', 0), cal: guardado('tgo_cielo_cal', 1), anim: null, ant: performance.now(),
           historia: false, avisoT: null, vibro: false, evento: opc.evento || null, brillo: bri };
    if (opc.objetivo) ponerObjetivo(opc.objetivo);
    /* los satelites, por si pasan (sin bloquear nada) */
    cargarSatelites().catch(function () {});
    /* la guia, la primera vez (o si se pide); con un objetivo ya puesto, no
       se interpone: se viene de «Encuentralo» y lo que se quiere es la flecha */
    if (!opc.objetivo && !guardado('tgo_cielo_guia', 0) && !opc.sinGuia) mostrarGuia();
    /* el boton «atras» de Android cierra la vista, no la app */
    try { history.pushState({ tgCieloVista: 1 }, ''); VI.historia = true; } catch (e) {}
    document.addEventListener('visibilitychange', alVisibilidad);
    despierto(true);
    tocarCielo(cv, function () { return VI.V; }, {
      girar: function (dAz, dAlt) {
        if (VI.V.sensores) { VI.ajuste = ((VI.ajuste - dAz + 540) % 360) - 180; guardar('tgo_cielo_ajuste', VI.ajuste.toFixed(1)); pintarChips(); return; }
        VI.V.az = (VI.V.az - dAz + 360) % 360; VI.V.alt = limitar(VI.V.alt + dAlt, -30, 90);
      },
      zoom: function (f) {
        if (VI.V.camara) { VI.cal = limitar(VI.cal / f, 0.5, 2); guardar('tgo_cielo_cal', VI.cal.toFixed(3)); pintarChips(); return; }
        VI.V.fov = limitar(VI.V.fov * f, 12, 150);
      },
      tocar: function (sel) { if (sel) abrirHoja(sel); else cerrarHoja(); }
    });
    pintarChips();
    bucle();
  }
  /* el boton «atras» del movil, escuchado una sola vez (iniciar): el back()
     que hace cerrarVista() llega aqui tambien, y se distingue del dedo */
  function alAtras() {
    if (atrasPendiente) { atrasPendiente = false; return; }
    if (VI) { VI.historia = false; cerrarVista(true); }
  }
  function alVisibilidad() {
    if (!VI) return;
    if (document.hidden) { pararCamara(); } else { despierto(true); if (VI.V.camara) camara(true); bucle(); }
  }
  function cerrarVista(sinHistoria) {
    if (!VI) return;
    var v = VI;
    window.removeEventListener('deviceorientationabsolute', alGirar, true);
    window.removeEventListener('deviceorientation', alGirar, true);
    document.removeEventListener('visibilitychange', alVisibilidad);
    if (v.anim) cancelAnimationFrame(v.anim);
    clearTimeout(v.espera); clearTimeout(v.avisoT);
    pararCamara();
    despierto(false);
    if (v.d && v.d.parentNode) v.d.parentNode.removeChild(v.d);
    VI = null; SEN = { n: 0 };
    if (v.historia && !sinHistoria) { try { atrasPendiente = true; history.back(); } catch (e) { atrasPendiente = false; } }
    if (S.abierto && S.pestana === 'mapa') { requestAnimationFrame(function () { animarMapa(); }); }
  }
  function despierto(si) {
    try {
      if (si && VI && !VI.lock && navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (l) { if (VI) VI.lock = l; else l.release(); }).catch(function () {});
      }
      if (!si && VI && VI.lock) { VI.lock.release().catch(function () {}); VI.lock = null; }
    } catch (e) {}
  }
  function avisar(txt, ms) {
    if (!VI) return;
    VI.aviso.textContent = txt || '';
    VI.aviso.classList.toggle('visto', !!txt);
    clearTimeout(VI.avisoT);
    if (txt && ms !== 0) VI.avisoT = setTimeout(function () { if (VI) { VI.aviso.classList.remove('visto'); } }, ms || 6000);
  }

  /* ── LOS SENSORES ──────────────────────────────────────────────────
     Android (Chrome, Samsung) da «deviceorientationabsolute»: la orientacion
     respecto al norte magnetico. iOS da «deviceorientation» con un alfa
     relativo a como estaba el movil al empezar, mas webkitCompassHeading, el
     rumbo de la brujula: de ahi sale la diferencia. Esa diferencia se toma
     cuando el movil esta inclinado hacia delante (entre 10 y 80 grados), que
     es cuando el rumbo de la parte de arriba y el de la camara coinciden:
     de pie y mirando arriba, iOS podria dar el de uno o el del otro. */
  function escucharSensores() {
    /* opc.evento: tools/auditar_cielo.js fuerza el camino de iOS en Chromium */
    VI.tipoEv = VI.evento || ('ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation');
    window.addEventListener(VI.tipoEv, alGirar, true);
    VI.espera = setTimeout(function () { if (VI && !SEN.n) sinSensores('nada'); }, 2000);
  }
  function alGirar(e) {
    if (!VI || e.alpha === null || e.beta === null || e.gamma === null || e.alpha === undefined) return;
    SEN.n++;
    SEN.a = e.alpha; SEN.b = e.beta; SEN.g = e.gamma;
    SEN.abs = e.type === 'deviceorientationabsolute' || e.absolute === true;
    SEN.ios = typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0 ? e.webkitCompassHeading : null;
    SEN.prec = typeof e.webkitCompassAccuracy === 'number' ? e.webkitCompassAccuracy : null;
    if (SEN.n === 1) { clearTimeout(VI.espera); modoSensores(true); if (!VI.guiaAbierta && !VI.ayudaDada) { VI.ayudaDada = true; avisar(T('ApuntaAyuda'), 7000); } }
  }
  function sinSensores(motivo) {
    if (!VI) return;
    modoSensores(false);
    VI.sinSensor = true;
    /* en la app de las tiendas el permiso no esta en los ajustes del navegador */
    avisar(T(motivo === 'permiso' ? (window.TGO_NATIVO ? 'SensoresPermisoApp' : 'SensoresPermiso') : 'SensoresNo'), 9000);
    pintarChips();
  }
  function modoSensores(si) {
    if (!VI) return;
    if (si && !SEN.n) { avisar(T(VI.sinSensor ? 'SensoresNo' : 'SensoresEspera'), 5000); return; }
    VI.V.sensores = !!si;
    if (!si) {
      var B = VI.V.base;
      if (B) { var h = altAzDe(B.f); VI.V.az = h.az; VI.V.alt = limitar(h.alt, -30, 90); }
      VI.V.base = null;
    }
    pintarChips();
  }
  function anguloPantalla() {
    try { if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle; } catch (e) {}
    return typeof window.orientation === 'number' ? window.orientation : 0;
  }
  function girarVertical(v, d) {
    var c = Math.cos(d * RAD), s = Math.sin(d * RAD);
    return [v[0] * c + v[1] * s, -v[0] * s + v[1] * c, v[2]];
  }
  function rumboDe(v) { return (Math.atan2(v[0], v[1]) / RAD + 360) % 360; }
  /* La matriz de la especificacion DeviceOrientation (W3C): R = Rz(alfa)
     Rx(beta) Ry(gamma) lleva el movil a este-norte-arriba. La camara de atras
     mira hacia -z; arriba y derecha de la pantalla dependen de como esta
     girada la pantalla (screen.orientation.angle). */
  function baseSensores(fecha) {
    var a = SEN.a * RAD, b = SEN.b * RAD, g = SEN.g * RAD;
    var cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b), cG = Math.cos(g), sG = Math.sin(g);
    var x = [cA * cG - sA * sB * sG, sA * cG + cA * sB * sG, -cB * sG];
    var y = [-sA * cB, cA * cB, sB];
    var z = [cA * sG + sA * sB * cG, sA * sG - cA * sB * cG, cB * cG];
    var f = [-z[0], -z[1], -z[2]];
    var th = anguloPantalla() * RAD, c = Math.cos(th), s = Math.sin(th);
    var r = [c * x[0] - s * y[0], c * x[1] - s * y[1], c * x[2] - s * y[2]];
    var u = [s * x[0] + c * y[0], s * x[1] + c * y[1], s * x[2] + c * y[2]];
    var giro = declinacionHoy(fecha) + (VI ? VI.ajuste : 0);
    if (!SEN.abs && SEN.ios !== null) {
      /* CoreLocation da el rumbo «relativo a la parte de arriba del movil».
         Inclinado hacia delante (10-80 grados) la parte de arriba y la camara
         miran al mismo rumbo, y ahi se toma la diferencia; pasado de la
         vertical el de arriba se da la vuelta, asi que fuera de esa franja
         no se toca. Si el primer dato llega ya con el movil levantado, se
         toma provisional (con la parte de arriba) y se sustituye al primer
         dato bueno. */
      var adelante = SEN.b > 10 && SEN.b < 80 && Math.abs(SEN.g) < 35;
      var hv = Math.hypot(y[0], y[1]) > 0.25 ? y : f;
      var dif = ((SEN.ios - rumboDe(hv)) + 540) % 360 - 180;
      if (SEN.offIOS === undefined || (adelante && SEN.offProv)) { SEN.offIOS = dif; SEN.offProv = !adelante; }
      else if (adelante) SEN.offIOS += (((dif - SEN.offIOS) + 540) % 360 - 180) * 0.08;
      giro += SEN.offIOS;
      if (SEN.prec !== null && SEN.prec > 25 && !VI.avisoCal) { VI.avisoCal = true; avisar(T('CalibraBrujula'), 9000); }
    }
    return { f: girarVertical(f, giro), u: girarVertical(u, giro), r: girarVertical(r, giro) };
  }
  /* Los sensores tiemblan: se sigue al movil con un filtro de 90 ms */
  function suavizar(B, dt) {
    var k = 1 - Math.exp(-dt / 0.09), s = SEN.suave;
    if (!s || dt > 1) { SEN.suave = { f: B.f.slice(), u: B.u.slice() }; s = SEN.suave; }
    else {
      for (var i = 0; i < 3; i++) { s.f[i] += k * (B.f[i] - s.f[i]); s.u[i] += k * (B.u[i] - s.u[i]); }
    }
    var f = unir(s.f), d = pto(s.u, f), u = unir([s.u[0] - d * f[0], s.u[1] - d * f[1], s.u[2] - d * f[2]]);
    s.f = f; s.u = u;
    return { f: f, u: u, r: cruz(f, u) };
  }

  /* ── LA CAMARA ─────────────────────────────────────────────────────
     La de atras. Con ella la proyeccion pasa a ser la de un objetivo y su
     campo tiene que ser el de la camara: el navegador no lo dice, asi que se
     parte del de la camara principal de casi todos los moviles, 26 mm
     equivalentes (67 grados en el lado largo de la imagen), y con dos dedos
     se ajusta hasta que lo pintado caiga encima de lo que se ve. Se recuerda
     en este movil. */
  var CAMARA_LARGO = 2 * Math.atan(17.3 / 26) / RAD;
  function camara(si) {
    if (!VI) return;
    if (!si) { pararCamara(); VI.V.camara = false; VI.V.gnomonica = false; VI.V.suelo = 0.8; VI.video.hidden = true; pintarChips(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { avisar(T('CamaraNo')); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(function (st) {
        if (!VI || document.hidden) { st.getTracks().forEach(function (t) { t.stop(); }); return; }
        VI.flujo = st; VI.video.srcObject = st; VI.video.hidden = false;
        var p = VI.video.play(); if (p && p.catch) p.catch(function () {});
        VI.V.camara = true; VI.V.gnomonica = true; VI.V.suelo = 0;
        if (!SEN.n) avisar(T('CamaraSinSensores'), 8000); else avisar(T('CamaraAyuda'), 8000);
        pintarChips();
      }, function (e) {
        avisar(T(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? (window.TGO_NATIVO ? 'CamaraPermisoApp' : 'CamaraPermiso') : 'CamaraNo'));
        pintarChips();
      });
  }
  function pararCamara() {
    if (VI && VI.flujo) { VI.flujo.getTracks().forEach(function (t) { t.stop(); }); VI.flujo = null; VI.video.srcObject = null; }
  }
  function focalCamara(V) {
    var vw = VI.video.videoWidth, vh = VI.video.videoHeight;
    if (!vw || !vh) return null;
    var fv = Math.max(vw, vh) / 2 / Math.tan(CAMARA_LARGO / 2 * RAD);
    return fv * Math.max(V.W / vw, V.H / vh) * VI.cal;
  }

  /* ── CADA CUADRO ───────────────────────────────────────────────── */
  function bucle() {
    if (!VI || VI.anim) return;
    VI.anim = requestAnimationFrame(cuadro);
  }
  function cuadro(ahora) {
    if (!VI) return;
    VI.anim = null;
    if (document.hidden) return;
    /* con camara, a 30 cuadros: el movil se calienta menos */
    if (VI.V.camara && VI.saltar) { VI.saltar = false; VI.anim = requestAnimationFrame(cuadro); return; }
    VI.saltar = true;
    var dt = Math.min(1.5, (ahora - VI.ant) / 1000); VI.ant = ahora;
    var V = VI.V, cv = VI.cv;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w && h && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
    V.dpr = dpr; V.W = cv.width; V.H = cv.height;
    if (VI.corre) { VI.desfase += dt * 20; if (VI.desfase > 720) VI.desfase = -720; VI.rango.value = Math.round(VI.desfase); }
    var fecha = new Date(Date.now() + VI.desfase * 60000);
    if (V.sensores && SEN.n) V.base = suavizar(baseSensores(fecha), dt);
    else V.base = null;
    V.focal = V.camara ? focalCamara(V) : null;
    if (V.camara && !V.focal) V.fov = 60;
    pintarCielo(V, fecha, V.quieto ? 0 : ahora);
    centro(V);
    if (VI.cuentaChips === undefined || ++VI.cuentaChips > 20) { VI.cuentaChips = 0; pintarChips(true); }
    VI.anim = requestAnimationFrame(cuadro);
  }
  /* Lo que hay en el circulo: lo mas importante a menos de 4 grados del
     centro (o de 34 px, si el campo es estrecho); si no hay nada, la
     constelacion en la que se esta mirando. */
  function centro(V) {
    var radio = Math.max(34 * V.dpr, 4 * RAD * (V.esc || 300));
    var sel = elegirEn(V, V.W / 2, V.H / 2, Math.min(radio, Math.min(V.W, V.H) * 0.16));
    var B = V.B, I = V.inst, txt, sub = '', clave;
    var e = B.f, h = altAzDe(e);
    if (sel) {
      var c = cosaDe(sel);
      clave = c.id;
      if (clave !== VI.centroClave) {
        VI.centroClave = clave; VI.centro = sel;
        pintarNombreCentro(c, h);
      }
    } else {
      /* la constelacion del centro: de este-norte-arriba a J2000 */
      var r = I.rot, hx = e[1], hy = -e[0], hz = e[2];
      var j = [r[0][0] * hx + r[0][1] * hy + r[0][2] * hz, r[1][0] * hx + r[1][1] * hy + r[1][2] * hz, r[2][0] * hx + r[2][1] * hy + r[2][2] * hz];
      var ra = (Math.atan2(j[1], j[0]) / RAD + 360) % 360 / 15, dec = Math.asin(limitar(j[2], -1, 1)) / RAD;
      var con = null; try { con = Astronomy.Constellation(ra, dec).symbol; } catch (x) {}
      clave = 'c' + con + (h.alt < 0 ? '-' : '');
      if (clave !== VI.centroClave) {
        VI.centroClave = clave; VI.centro = con ? { con: con } : null;
        VI.nombre.textContent = '';
        VI.nombre.appendChild(el('b', null, h.alt < 0 ? T('BajoHorizonte') : (con ? T('EnConstelacion', { c: nombreCon(con) }) : '')));
        VI.nombre.appendChild(el('span', null, T('ApuntaEstrella')));
      }
    }
    /* lo que se busca: ¿ya esta en el circulo? */
    if (V.objetivo) {
      var o = V.objetivo;
      if (o.cerca && !VI.vibro) { VI.vibro = true; try { navigator.vibrate && navigator.vibrate(40); } catch (x) {} pintarObjetivo(true); }
      else if (!o.cerca && VI.vibro) { VI.vibro = false; pintarObjetivo(false); }
      else if (!o.cerca && Math.round(o.grados || 0) !== VI.gradosObjetivo) { VI.gradosObjetivo = Math.round(o.grados || 0); pintarObjetivo(false); }
    }
  }
  function pintarNombreCentro(c, h) {
    var n = VI.nombre;
    n.textContent = '';
    var b = c.des && c.nombre === c.des ? desig(c.nombre, 'cv-nombre-des') : el('b', null, c.nombre);
    if (b.tagName === 'B' && esNombreIAU(c.nombre)) b.setAttribute('data-sin-traducir', 'nombre propio de la UAI');
    n.appendChild(b);
    var sub = el('span', null, c.tipoTxt + (c.con ? ' · ' + nombreCon(c.con) : ''));
    n.appendChild(sub);
    n.appendChild(el('i', null, T('SaberMas')));
    n.setAttribute('aria-label', c.nombre + ' — ' + T('SaberMas'));
  }
  function pintarChips(soloHora) {
    if (!VI) return;
    var f = new Date(Date.now() + VI.desfase * 60000);
    VI.bhora.textContent = '🕒 ' + hora(f) + (Math.abs(VI.desfase) >= 5 ? ' · ' + (VI.desfase > 0 ? '+' : '−') + duracion(Math.abs(VI.desfase)) : '');
    VI.bhora.classList.toggle('cv-chip-aviso', Math.abs(VI.desfase) >= 5);
    /* el chip de los sensores lleva la precision que da iOS (grados de
       error de la brujula) y una marca si se comprobo con un astro */
    var prec = VI.V.sensores && typeof SEN.prec === 'number' && SEN.prec >= 0 ? Math.round(SEN.prec) : null;
    var txtModo = VI.V.sensores ? '🧭 ' + T('Sensores') + (prec !== null ? ' ±' + prec + '°' : '') + (VI.comprobada ? ' ✓' : '') : '✋ ' + T('AMano');
    if (VI.bmodo.textContent !== txtModo) { VI.bmodo.textContent = txtModo; VI.bmodo.title = prec !== null ? T('Precision', { g: prec }) + (VI.comprobada ? ' · ' + T('Comprobada') : '') : (VI.comprobada ? T('Comprobada') : T('Sensores')); }
    if (soloHora) return;
    VI.bplay.textContent = VI.corre ? '❚❚' : '▶';
    VI.bplay.setAttribute('aria-pressed', VI.corre ? 'true' : 'false');
    VI.bmodo.setAttribute('aria-pressed', VI.V.sensores ? 'true' : 'false');
    VI.bcomp.textContent = '🎯 ' + T('Comprobar');
    VI.bcomp.hidden = !(VI.V.sensores && !VI.comprobando);
    var aj = Math.round(VI.ajuste), cal = Math.abs(VI.cal - 1) > 0.02;
    VI.baj.hidden = !(VI.V.sensores && (aj || cal));
    VI.baj.textContent = '↺ ' + (aj ? (aj > 0 ? '+' : '−') + Math.abs(aj) + '°' : '') + (cal ? (aj ? ' · ' : '') + '×' + numero(VI.cal, 2) : '');
    VI.bcam.setAttribute('aria-pressed', VI.V.camara ? 'true' : 'false');
  }
  function duracion(min) {
    var h = Math.floor(min / 60), m = Math.round(min % 60);
    return h ? T('HorasMin', { h: h, m: dos(m) }) : T('Minutos', { n: m });
  }

  /* ── LA FICHA, EN LA HOJA DE ABAJO ─────────────────────────────── */
  function abrirHoja(sel) {
    if (!VI) return;
    var h = VI.hoja;
    h.textContent = '';
    var cab = el('div', 'cv-hoja-cab');
    cab.appendChild(botonMapa('✕', null, cerrarHoja, cerrarTxt(), 'cv-btn'));
    h.appendChild(cab);
    var f = new Date(Date.now() + VI.desfase * 60000);
    h.appendChild(fichaCosa(cosaDe(sel), f, { guiar: true, recorridoActivo: mismoSel(VI.V.rastro, sel),
      recorrido: function (s) { if (!VI) return; VI.V.rastro = s; cerrarHoja(); if (s) avisar(T('RecorridoNota', { c: cosaDe(s).nombre }), 6000); } }));
    h.hidden = false; h.scrollTop = 0;
    VI.V.sel = sel;
  }
  function cerrarHoja() { if (VI) { VI.hoja.hidden = true; VI.V.sel = null; } }

  /* ── BUSCAR ─────────────────────────────────────────────────────── */
  function buscables() {
    var L = [];
    CUERPOS.forEach(function (p) { L.push({ sel: { planeta: p }, nombre: nom(CIELO_CUERPO, p), des: '', ico: ICONO_PLANETA[p] }); });
    buscablesSat().forEach(function (x) { L.push(x); });
    catalogo().forEach(function (x) {
      if (x.k === 'var' || x.k === 'dob') return;
      var sel = x.k === 'con' ? { con: x.ab } : { k: x.k, rec: x.o, v: x.o.v, nombre: x.nombre, des: x.des };
      L.push({ sel: sel, nombre: x.nombre || '', des: x.des || '', ico: x.ico });
    });
    return L;
  }
  function buscar(si) {
    if (!VI) return;
    var b = VI.bus;
    if (!si) { b.hidden = true; return; }
    b.textContent = '';
    var cab = el('div', 'cv-busqueda-cab');
    var inp = el('input'); inp.type = 'search'; inp.placeholder = T('BuscarQue'); inp.setAttribute('aria-label', T('BuscarQue'));
    cab.appendChild(inp);
    cab.appendChild(botonMapa('✕', null, function () { buscar(false); }, cerrarTxt(), 'cv-btn'));
    b.appendChild(cab);
    var lista = el('div', 'cv-busqueda-lista'); b.appendChild(lista);
    var todo = buscables();
    function filtrar() {
      var q = quitarTildes(inp.value.trim());
      lista.textContent = '';
      var r = todo.filter(function (x) { return !q || quitarTildes(x.nombre + ' ' + x.des).indexOf(q) >= 0; }).slice(0, q ? 40 : 16);
      if (!r.length) lista.appendChild(el('div', 'cielo-nota', T('SinResultados')));
      r.forEach(function (x) {
        var it = el('button', 'cv-busqueda-item'); it.type = 'button';
        it.appendChild(el('span', 'cielo-item-ico', x.ico || '✨'));
        /* el nombre corriente si lo tiene; si no, la designacion, marcada */
        it.appendChild(nombreODesig('span', 'cv-busqueda-nom', x.nombre, x.des));
        if (x.nombre && x.des && x.nombre !== x.des) it.appendChild(desig(x.des));
        it.addEventListener('click', function () { buscar(false); ponerObjetivo(x.sel); });
        lista.appendChild(it);
      });
    }
    inp.addEventListener('input', filtrar);
    filtrar();
    b.hidden = false;
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
  }
  function ponerObjetivo(sel) {
    if (!VI) return;
    if (VI.comprobando) { VI.comprobando = null; pintarComprobar(); pintarChips(); }
    VI.V.objetivo = sel; VI.vibro = false; VI.gradosObjetivo = null;
    cerrarHoja();
    var I = instante(new Date(Date.now() + VI.desfase * 60000)), e = vectorSel(sel, I);
    if (e && !VI.V.sensores) { var h = altAzDe(e); VI.V.az = h.az; VI.V.alt = limitar(h.alt, -30, 85); }
    if (e && altAzDe(e).alt < 0) avisar(T('ObjetivoBajo', { c: cosaDe(sel).nombre }), 7000);
    pintarObjetivo(false);
  }
  function pintarObjetivo(cerca) {
    var o = VI.obj, s = VI.V.objetivo;
    o.textContent = '';
    if (!s || VI.comprobando) { o.hidden = true; return; }       // comprobando la brujula, el chip es el de «Ya»
    var c = cosaDe(s);
    o.appendChild(el('span', null, '🎯 '));
    o.appendChild(c.des && c.nombre === c.des ? desig(c.nombre) : el('b', null, c.nombre));
    o.appendChild(el('span', null, ' · ' + (cerca ? T('AhiEsta') : T('AGrados', { g: numero(VI.V.objetivo.grados || 0, 0) }))));
    o.appendChild(botonMapa('✕', null, function () { VI.V.objetivo = null; pintarObjetivo(false); }, cerrarTxt(), 'cv-btn cv-btn-mini'));
    o.classList.toggle('cerca', !!cerca);
    o.hidden = false;
  }

  /* ── LA FICHA DE LO QUE SE MIRA ────────────────────────────────────
     Al tocar algo en la carta o en «Apunta al cielo»: que es, donde esta
     ahora, cuando sale y se pone, y lo que se sabe de el. Lo que se dice es
     de dos clases:
       · CALCULADO aqui, de datos con fuente: la luz que te llega salio
         hace N años (la distancia de HYG), su clase y su color (el tipo
         espectral, sistema de Morgan y Keenan), la temperatura de su color
         (Ballesteros 2012), cuanto brilla en soles (HYG), la distancia de un
         planeta y lo que tarda su luz, las lunas de Jupiter, los anillos de
         Saturno (Astronomy Engine).
       · El resumen de WIKIPEDIA en el idioma de quien lo lee, pedido al
         abrir la ficha, con su enlace y su licencia (CC BY-SA). Si no hay
         conexion, no sale; si no hay articulo en ese idioma, sale el ingles
         y se dice. */
  function resolverV(v) {
    var D = S.datos, cerca = function (o) { return o.v && pto(o.v, v) > 0.9999999; };
    var x = D.estrellas.filter(cerca)[0]; if (x) return { k: 'est', rec: x };
    x = D.dobles.filter(cerca)[0]; if (x) return { k: 'dob', rec: x };
    x = D.objetos.filter(cerca)[0]; if (x) return { k: 'obj', rec: x };
    return null;
  }
  function conDe(ra, dec) { try { return Astronomy.Constellation(ra / 15, dec).symbol; } catch (e) { return null; } }
  function cosaDe(sel, fecha) {
    var D = S.datos;
    fecha = fecha || new Date();
    if (sel.sat) return cosaSat(sel);
    if (sel.planeta) {
      var p = sel.planeta;
      return { id: 'p' + p, tipo: p === 'Moon' ? 'luna' : (p === 'Sun' ? 'sol' : 'planeta'), cuerpo: p, nombre: nom(CIELO_CUERPO, p), des: '',
               tipoTxt: T(p === 'Moon' ? 'TipoLuna' : (p === 'Sun' ? 'TipoSol' : 'TipoPlaneta')),
               con: constelacionDe(Astronomy.Body[p], Astronomy.MakeTime(fecha)), ico: ICONO_PLANETA[p], sel: sel, wp: [WP_CUERPO[p]] };
    }
    if (sel.con) {
      var c = D.con[sel.con];
      return { id: 'c' + sel.con, tipo: 'constelacion', ab: sel.con, rec: c, nombre: nombreCon(sel.con), des: c ? c.n : sel.con,
               tipoTxt: T('TipoConstelacion'), con: null, ico: '✳️', sel: sel, v: c && c.etV[0],
               wp: c ? [c.n + ' (constellation)', c.n] : [] };
    }
    var k = sel.k, rec = sel.rec;
    if (!k && sel.est) {
      var st = sel.est, nm = D.estrellas.filter(function (e) { return e.h === st[4]; })[0];
      if (nm) { k = 'est'; rec = nm; }
      else return cosaEstrellaCarta(st);
    }
    if (!k && sel.obj) { k = 'obj'; rec = sel.obj; }
    if (!k && sel.v) { var r = resolverV(sel.v); if (r) { k = r.k; rec = r.rec; } }
    if (k === 'var' && rec) {
      var ne = D.estrellas.filter(function (e) { return e.h === rec.h; })[0];
      if (ne) { k = 'est'; rec = ne; }
      else { var st2 = D.est.filter(function (e) { return e[4] === rec.h; })[0]; if (st2) return cosaEstrellaCarta(st2, rec); }
    }
    if (k === 'est' && rec) {
      var st3 = D.est.filter(function (e) { return e[4] === rec.h; })[0];
      return { id: 'h' + rec.h, tipo: 'estrella', rec: rec, carta: st3, hip: rec.h, nombre: nombreEstrella(rec.h) || rec.n, des: rec.b || '',
               tipoTxt: T('TipoEstrella'), con: rec.c, ico: '⭐', sel: sel, v: rec.v, ra: rec.ra, dec: rec.dec, m: rec.m, bv: rec.bv, sp: rec.sp,
               al: rec.al, lum: rec.lum, vr: rec.vr, alt: rec.alt, wp: wpEstrella(rec.b, rec.n), descK: 'h' + rec.h,
               variable: D.variables.filter(function (x) { return x.h === rec.h; })[0] || null };
    }
    if (k === 'dob' && rec) {
      return { id: 'd' + rec.id, tipo: 'doble', rec: rec, nombre: nombreDoble(rec), des: rec.b, tipoTxt: T('TipoDoble'), con: rec.c, ico: '⚪', sel: sel,
               v: rec.v, ra: rec.ra, dec: rec.dec, m: rec.m1, alt: rec.alt, niv: rec.niv, wp: wpEstrella(rec.b.split(' · ')[0], null), descK: 'd-' + rec.id };
    }
    if (k === 'obj' && rec) {
      var dn = designacionObjeto(rec);
      return { id: 'o' + rec.id, tipo: 'objeto', rec: rec, nombre: nombreObjeto(rec) || dn, des: dn, tipoTxt: nom(CIELO_TIPO, rec.t), con: rec.c,
               ico: ICONO[rec.t] || '✨', sel: sel, v: rec.v, ra: rec.ra, dec: rec.dec, m: rec.m, alt: rec.alt, niv: rec.niv, wp: wpObjeto(rec), descK: rec.id };
    }
    /* algo sin registro (no deberia pasar): su nombre y su sitio */
    return { id: 'x' + (sel.nombre || ''), tipo: 'punto', nombre: sel.nombre || sel.des || '', des: sel.des || '', tipoTxt: '', con: null, ico: '✨', sel: sel, v: sel.v, wp: [] };
  }
  /* Una estrella de la carta sin ficha en el catalogo: lo que trae la carta
     (Bayer, distancia, tipo espectral) y su nombre de la UAI si lo tiene. */
  function cosaEstrellaCarta(st, variable) {
    var D = S.datos, propio = D.nombresIAU && D.nombresIAU[st[4]];
    var des = st[6] || (st[4] ? 'HIP ' + st[4] : '');
    return { id: 'h' + st[4], tipo: 'estrella', carta: st, hip: st[4], nombre: (propio && nombreUAI(st[4])) || des, des: des, tipoTxt: T('TipoEstrella'),
             con: conDe(st[0], st[1]), ico: '⭐', sel: { est: st }, v: st.v, ra: st[0], dec: st[1], m: st[2], bv: st[3], sp: st[7], al: st[5],
             alt: Math.round((90 - Math.abs(OBS.lat - st[1])) * 10) / 10, wp: wpEstrella(st[6], propio), variable: variable || null };
  }
  /* Los articulos de la Wikipedia en ingles con que se empieza (de ahi se
     salta al del idioma de quien lee, por los enlaces entre idiomas). La
     designacion de Bayer escrita en latin («Alpha Orionis») lleva siempre a
     la estrella; el nombre a secas a veces es otra cosa («Castor»). */
  var GRIEGAS = { 'α': 'Alpha', 'β': 'Beta', 'γ': 'Gamma', 'δ': 'Delta', 'ε': 'Epsilon', 'ζ': 'Zeta', 'η': 'Eta', 'θ': 'Theta', 'ι': 'Iota', 'κ': 'Kappa',
    'λ': 'Lambda', 'μ': 'Mu', 'ν': 'Nu', 'ξ': 'Xi', 'ο': 'Omicron', 'π': 'Pi', 'ρ': 'Rho', 'σ': 'Sigma', 'τ': 'Tau', 'υ': 'Upsilon', 'φ': 'Phi', 'χ': 'Chi', 'ψ': 'Psi', 'ω': 'Omega' };
  var SUPER_N = { '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  var WP_CUERPO = { Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury (planet)', Venus: 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturn: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune' };
  function wpEstrella(b, propio) {
    var out = [];
    var m = b && b.match(/^([α-ω])([¹-⁹]?)\s+(\w+)$/) || (b && b.match(/^(\d+)()\s+(\w+)$/));
    if (m) {
      var c = S.datos.con[m[3]], gen = c && c.gen;
      if (gen) out.push((GRIEGAS[m[1]] || m[1]) + (m[2] ? SUPER_N[m[2]] || '' : '') + ' ' + gen);
    }
    if (propio) { out.push(propio + ' (star)'); out.push(propio); }
    return out;
  }
  function wpObjeto(o) {
    var out = [];
    if (o.M) out.push('Messier ' + o.M);
    if (o.d) o.d.split(' · ').forEach(function (x) { if (/^(NGC|IC) \d+/.test(x)) out.push(x); });
    if (o.nom) out.push(o.nom);
    if (o.C) out.push('Caldwell ' + o.C);
    var esp = { Cl399: "Brocchi's Cluster", Mel111: 'Coma Star Cluster', B33: 'Horsehead Nebula' }[o.id];
    if (esp) out.unshift(esp);
    return out;
  }

  /* ── LO QUE SE CALCULA ─────────────────────────────────────────── */
  /* Clase de luminosidad y color, del tipo espectral (sistema MK de Morgan,
     Keenan y Kellman, 1943). El color, el que se da por costumbre a cada
     clase (tabla de Harvard en «Stellar classification», Wikipedia):
     O azul, B blanco azulado, A blanco, F blanco amarillento, G amarillo,
     K naranja claro, M rojo anaranjado. */
  function claseMK(sp) {
    if (!sp) return null;
    var l = (sp.match(/[OBAFGKM]/) || [])[0] || null;
    /* la clase de luminosidad es el primer numero romano detras de la cifra
       de la temperatura: «M1-2Ia-Iab» -> Ia (I), «K1.5IIIFe-0.5» -> III.
       VI (subenana) no tiene nombre aqui: se deja sin clase. */
    var d = sp.search(/\d/);
    var r = d >= 0 ? sp.slice(d + 1).match(/(VI|Iab|Ia|Ib|IV|V|III|II|I)(?=[^IV]|$)/) : null;
    var lum = !r || r[1] === 'VI' ? null : (/^I(a|b|ab)?$/.test(r[1]) ? 'I' : r[1]);
    return { letra: l, lum: lum };
  }
  function anioLocal(d) { return partes(d).year; }
  function datosEstrella(c, fecha, L) {
    var mk = claseMK(c.sp);
    if (c.sp) L.push(T('Espectro', { s: c.sp }));
    if (mk && mk.lum) L.push(T('FichaClase', { c: T('Lum' + mk.lum) }));
    if (mk && mk.letra && c.bv !== null && c.bv !== undefined) {
      /* la formula vale de A0 para abajo (B−V >= 0); las mas calientes se
         quedan cortas y se dice solo «mas de 10.000 K» */
      if (c.bv >= -0.02) L.push(T('FichaColorK', { c: T('Color' + mk.letra), k: numero(Math.round(kelvinBV(c.bv) / 100) * 100, 0) }));
      else L.push(T('FichaColorCaliente', { c: T('Color' + mk.letra), k: numero(10000, 0) }));
    }
    if (c.al) {
      /* la distancia y lo que tarda su luz son lo mismo: un año luz es lo que
         la luz recorre en un año */
      if (c.al < 100) L.push(T('FichaLuzAnio', { n: distancia(c.al), y: String(Math.round(anioLocal(fecha) - c.al)) }));
      else L.push(T('FichaLuzUnos', { n: distancia(c.al) }));
      /* en soles: la de HYG si esta; si no, de la magnitud y la distancia, con
         la misma magnitud absoluta del Sol que usa HYG (4,85) */
      var lum = c.lum;
      if (!lum && c.m !== null && c.m !== undefined) lum = Math.pow(10, 0.4 * (4.85 - (c.m - 5 * (Math.log10(c.al / 3.261564) - 1))));
      if (lum) {
        if (lum >= 1.5) L.push(T('FichaLum', { n: numero(dosCifras(lum), lum < 10 ? 1 : 0) }));
        else if (lum > 0.67) L.push(T('FichaLumSol'));
        else L.push(T('FichaLumMenos', { p: numero(Math.round(lum * 100), 0) }));
      }
    }
    var con = c.con && S.datos.con[c.con];
    if (con && c.hip && con.alfa === c.hip) L.push(T('FichaMasBrillante', { c: nombreCon(c.con) }));
    var vr = c.vr || (c.variable ? [c.variable.tipo, c.variable.max, c.variable.min, c.variable.per] : null);
    if (vr) {
      L.push(T('VariableRango', { a: mag(vr[1]), b: mag(vr[2]) }));
      if (vr[3] && vr[0] !== 'NR') L.push(T('Periodo', { d: numero(vr[3], vr[3] < 20 ? 2 : 0) }));
    }
  }
  function dosCifras(x) { var p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; }
  /* Cuando sale, cuando esta mas alto y cuando se pone, en la noche que
     contiene el instante: de mediodia a mediodia, en hora de Canarias. Las
     estrellas y el cielo profundo, como «estrella definida» del motor. */
  function noche24(fecha) {
    var p = partes(fecha), f = fechaLocal(fecha);
    if (p.hour < 12) f = sumarDias(f, -1);
    return Astronomy.MakeTime(instanteLocal(f, 12, 0));
  }
  function cuerpoDe(c) {
    if (c.cuerpo) return Astronomy.Body[c.cuerpo];
    if (c.ra === undefined || c.dec === undefined) return null;
    Astronomy.DefineStar(Astronomy.Body.Star1, c.ra / 15, c.dec, c.al || 1000);
    return Astronomy.Body.Star1;
  }
  function ritmo(c, fecha) {
    var A = Astronomy, b = cuerpoDe(c);
    if (!b) return null;
    if (c.tipo !== 'luna' && c.tipo !== 'sol' && c.tipo !== 'planeta' && c.dec > 90 - OBS.lat) return { siempre: true };
    var t0 = noche24(fecha), o = obs();
    var sale = A.SearchRiseSet(b, o, +1, t0, 1), pone = A.SearchRiseSet(b, o, -1, t0, 1);
    var cul = null; try { cul = A.SearchHourAngle(b, o, 0, t0, +1); } catch (e) { cul = A.SearchHourAngle(b, o, 0, t0); }
    var dentro = function (t) { return t && t.ut - t0.ut <= 1; };
    var ev = [];
    if (dentro(sale)) ev.push({ u: sale.ut, txt: T('FichaSale', { h: hora(sale.date), r: rumbo(cuerpoHorizonteB(b, sale).az) }) });
    if (cul && dentro(cul.time) && cul.hor.altitude > 0) ev.push({ u: cul.time.ut, txt: T('FichaCulmina', { h: hora(cul.time.date), alt: numero(cul.hor.altitude, 0) }) });
    if (dentro(pone)) ev.push({ u: pone.ut, txt: T('FichaPone', { h: hora(pone.date), r: rumbo(cuerpoHorizonteB(b, pone).az) }) });
    ev.sort(function (a, b2) { return a.u - b2.u; });
    if (!ev.length) return { nunca: true };
    return { ev: ev };
  }
  function cuerpoHorizonteB(b, t) {
    var eq = Astronomy.Equator(b, t, obs(), true, true);
    var h = Astronomy.Horizon(t, obs(), eq.ra, eq.dec, 'normal');
    return { alt: h.altitude, az: h.azimuth };
  }
  /* Las cuatro lunas de Galileo como se verian con prismaticos (norte arriba
     y este a la izquierda), con su posicion de Astronomy Engine (teoria L1.2
     de Lieske) en el instante en que salio la luz que llega. Radio de Jupiter:
     71.492 km, el nominal de la UAI (2015, B3). */
  var LUNAS_J = [['io', 'Io'], ['europa', 'Europa'], ['ganymede', 'Ganymede'], ['callisto', 'Callisto']];
  function lunasJupiter(fecha) {
    var A = Astronomy, t = A.MakeTime(fecha), g = A.GeoVector(A.Body.Jupiter, t, true);
    var dist = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z), L = [g.x / dist, g.y / dist, g.z / dist];
    var jm = A.JupiterMoons(t.AddDays(-dist / A.C_AUDAY));
    var ra = Math.atan2(L[1], L[0]), de = Math.asin(L[2]);
    var este = [-Math.sin(ra), Math.cos(ra), 0], norte = [-Math.sin(de) * Math.cos(ra), -Math.sin(de) * Math.sin(ra), Math.cos(de)];
    var rj = 71492 / A.KM_PER_AU;
    return { rj: rj / dist * 206264.806, lunas: LUNAS_J.map(function (x) {
      var m = jm[x[0]], v = [m.x, m.y, m.z];
      var de_ = pto(v, este), dn = pto(v, norte), atras = pto(v, L) > 0 && Math.hypot(de_, dn) < rj;
      return { k: x[1], e: de_ / dist * 206264.806, n: dn / dist * 206264.806, atras: atras };
    }) };
  }
  function dibujoLunasJupiter(lj) {
    var NS = 'http://www.w3.org/2000/svg', W = 300, Hh = 64;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); svg.setAttribute('class', 'cielo-lunas-j');
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', T('FichaLunasJ'));
    var mx = Math.max(lj.rj * 6, Math.max.apply(null, lj.lunas.map(function (l) { return Math.abs(l.e); })));
    var k = (W / 2 - 16) / mx, cx = W / 2, cy = 24;
    var j = document.createElementNS(NS, 'ellipse');
    j.setAttribute('cx', cx); j.setAttribute('cy', cy); j.setAttribute('rx', Math.max(3.5, lj.rj * k)); j.setAttribute('ry', Math.max(3.3, lj.rj * k * 0.935));
    j.setAttribute('fill', '#ffe6c2'); svg.appendChild(j);
    lj.lunas.forEach(function (l, i) {
      var x = cx - l.e * k, y = cy - l.n * k;
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', 2.2);
      c.setAttribute('fill', l.atras ? 'none' : '#f4f1ea'); c.setAttribute('stroke', l.atras ? 'rgba(255,255,255,0.4)' : 'none');
      svg.appendChild(c);
      var tx_ = document.createElementNS(NS, 'text');
      tx_.setAttribute('x', x.toFixed(1)); tx_.setAttribute('y', (cy + 16 + (i % 2) * 11).toFixed(1));
      tx_.setAttribute('text-anchor', 'middle'); tx_.setAttribute('fill', 'rgba(255,255,255,0.7)'); tx_.setAttribute('font-size', '9.5');
      tx_.textContent = nom(CIELO_CUERPO, l.k);
      svg.appendChild(tx_);
    });
    return svg;
  }
  function datosCuerpo(c, fecha, L, extra) {
    var A = Astronomy, t = A.MakeTime(fecha), b = A.Body[c.cuerpo];
    var KM = A.KM_PER_AU, C = 299792.458;               // km/s, la de la definicion del metro
    if (c.tipo === 'sol') {
      L.unshift(T('AvisoSol'));
      var ds = A.GeoVector(b, t, true), d = Math.sqrt(ds.x * ds.x + ds.y * ds.y + ds.z * ds.z) * KM;
      L.push(T('FichaDistSol', { d: numero(d / 1e6, 1), t: minSeg(d / C) }));
      var n = noche();
      L.push(T('PuestaSol') + ': ' + hora(aFecha(n.ocaso)) + ' · ' + T('SalidaSol') + ': ' + hora(aFecha(n.orto)));
      return;
    }
    var il = A.Illumination(b, t), g = A.GeoVector(b, t, true), dk = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z) * KM;
    if (c.tipo === 'luna') {
      var fase = A.MoonPhase(t);
      L.push(nombreFase(fase) + ' · ' + T('Iluminada', { p: numero(il.phase_fraction * 100, 0) }));
      /* la ultima luna nueva antes de este instante */
      var nueva = A.SearchMoonPhase(0, t.AddDays(-31), 31), sig;
      while (nueva && (sig = A.SearchMoonPhase(0, nueva.AddDays(1), 30)) && sig.ut <= t.ut) nueva = sig;
      if (nueva && nueva.ut <= t.ut) L.push(T('FichaEdadLuna', { d: numero(t.ut - nueva.ut, 1) }));
      L.push(T('FichaDistLuna', { d: numero(Math.round(dk / 100) * 100, 0), s: numero(dk / C, 2) }));
      proximasFases().forEach(function (q) { L.push(T(q.quarter === 0 ? 'ProxNueva' : 'ProxLlena', { f: dia(q.time.date) })); });
      lunaApsides(L, fecha);                           // perigeo y apogeo que vienen (codigo11)
      return;
    }
    L.push(T('Mag', { m: mag(il.mag) }));
    L.push(T('FichaDistPlaneta', { d: numero(dk / 1e6, dk < 1e8 ? 1 : 0) }));
    L.push(T('FichaLuzPlaneta', { t: duracionSeg(dk / C) }));
    if (c.cuerpo === 'Mercury' || c.cuerpo === 'Venus') {
      var e = A.Elongation(b, t);
      L.push(T(e.visibility === 'morning' ? 'FichaElongManana' : 'FichaElongTarde', { g: numero(e.elongation, 0) }));
      L.push(T('FichaFase', { p: numero(il.phase_fraction * 100, 0) }));
    }
    if (c.cuerpo === 'Mars') L.push(T('FichaFase', { p: numero(il.phase_fraction * 100, 0) }));
    if (c.cuerpo === 'Saturn' && typeof il.ring_tilt === 'number') L.push(T('FichaAnillos', { g: numero(Math.abs(il.ring_tilt), 1) }));
    if (c.cuerpo === 'Jupiter') extra.jupiter = lunasJupiter(fecha);
  }
  function minSeg(s) { var m = Math.floor(s / 60); return T('MinSeg', { m: m, s: dos(Math.round(s - m * 60)) }); }
  function duracionSeg(s) { var min = Math.round(s / 60); return min >= 60 ? T('HorasMin', { h: Math.floor(min / 60), m: dos(min % 60) }) : T('Minutos', { n: min }); }

  function fichaCosa(c, fecha, opc) {
    opc = opc || {};
    var f = el('div', 'cielo-ficha');
    var cab = el('div', 'cielo-ficha-cab');
    cab.appendChild(el('div', 'cielo-ficha-ico', c.ico || '✨'));
    var tt = el('div', 'cielo-ficha-tt');
    var nm = c.des && c.nombre !== c.des ? el('div', 'cielo-ficha-nom', c.nombre) : nombreODesig('div', 'cielo-ficha-nom', c.nombre, c.des || c.nombre);
    if (c.des && c.nombre !== c.des && esNombreIAU(c.nombre)) nm.setAttribute('data-sin-traducir', 'nombre propio de la UAI');
    if (c.des && c.nombre !== c.des) nm.appendChild(desig(c.des, 'cielo-ficha-des'));
    tt.appendChild(nm);
    var tipo = [c.tipoTxt];
    if (c.con) tipo.push(T('EnCon', { c: nombreCon(c.con) }));
    tt.appendChild(el('div', 'cielo-ficha-tipo', tipo.filter(Boolean).join(' · ')));
    cab.appendChild(tt);
    if (c.niv) { var dch = el('div', 'cielo-item-der'); dch.appendChild(nivelChip(c.niv)); cab.appendChild(dch); }
    f.appendChild(cab);
    /* donde esta en el instante de la carta */
    var I = instante(fecha), e = vectorSel(c.sel, I);
    var ahora = Math.abs(fecha.getTime() - Date.now()) < 120000, cuando = ahora ? T('AhoraMismo') : hora(fecha);
    if (e) {
      var h = altAzDe(e);
      f.appendChild(el('div', 'cielo-ficha-ahora', h.alt > 0 ? T('FichaArriba', { t: cuando, alt: numero(h.alt, 0), dir: hacia(h.az) }) : T('FichaAbajo', { t: cuando })));
    }
    /* los datos */
    var L = [], extra = {};
    try {
      if (c.cuerpo) datosCuerpo(c, fecha, L, extra);
      else if (c.tipo === 'satelite') datosSat(c, fecha, L);
      else if (c.tipo === 'estrella') datosEstrella(c, fecha, L);
      else if (c.tipo === 'doble') {
        var d = c.rec;
        if (d.sep !== null) L.push(d.sep >= 120 ? T('SeparacionMin', { s: numero(d.sep / 60, 1) }) : T('Separacion', { s: numero(d.sep, d.sep < 100 ? 1 : 0) }));
        else if (d.per) L.push(T('OrbitaRapida', { a: numero(d.per, 0) }));
        if (d.m1 !== null && d.m2 !== null) L.push(T('Componentes', { a: mag(d.m1), b: mag(d.m2) }));
      } else if (c.tipo === 'objeto') {
        var o = c.rec;
        if (o.m !== null) L.push(T('Mag', { m: mag(o.m) }));
        if (o.tam) L.push(T('Tamano', { t: o.tam[1] ? numero(o.tam[0], o.tam[0] < 10 ? 1 : 0) + '′ × ' + numero(o.tam[1], o.tam[1] < 10 ? 1 : 0) + '′' : numero(o.tam[0], o.tam[0] < 10 ? 1 : 0) + '′' }));
      } else if (c.tipo === 'constelacion' && c.rec) {
        var x = c.rec;
        L.push(T('ConEstrellas', { n: x.n6v }));
        if (x.alfa) { var neb = nombreEstrella(x.alfa) || nombreUAI(x.alfa); if (neb) L.push(T('ConBrillante', { e: neb })); }
        if (x.vis === 'p') L.push(T('ConParcialDet', { d: '−' + numero(90 - OBS.lat, 0) }));
        datosConstelacion(c.ab, L);                    // origen y tamaño (codigo12)
      }
      if (c.alt !== undefined && c.alt !== null && c.tipo !== 'constelacion') L.push(T('AltMax', { alt: numero(c.alt, 0) }));
    } catch (err) { try { console.warn('cielo ficha:', err); } catch (_) {} }
    if (L.length) {
      var ul = el('ul', 'cielo-ficha-datos');
      L.forEach(function (x) { ul.appendChild(el('li', null, x)); });
      f.appendChild(ul);
    }
    if (extra.jupiter) {
      var dj = el('div', 'cielo-ficha-bloque');
      dj.appendChild(el('div', 'cielo-ficha-sub', T('FichaLunasJ')));
      dj.appendChild(dibujoLunasJupiter(extra.jupiter));
      var tras = extra.jupiter.lunas.filter(function (l) { return l.atras; });
      if (tras.length) dj.appendChild(el('div', 'cielo-nota', T('FichaLunaDetras', { l: tras.map(function (l) { return nom(CIELO_CUERPO, l.k); }).join(', ') })));
      f.appendChild(dj);
    }
    /* la ficha del planeta: las cifras de la NASA (codigo11) */
    var fp = fichaPlaneta(c); if (fp) f.appendChild(fp);
    /* esta noche */
    if (c.tipo !== 'constelacion' && c.tipo !== 'sol') {
      try {
        var rt = ritmo(c, fecha);
        if (rt) {
          var bl = el('div', 'cielo-ficha-noche');
          bl.appendChild(el('span', 'cielo-ficha-sub', T('FichaEstaNoche')));
          bl.appendChild(el('span', null, rt.siempre ? T('FichaNuncaSePone') : (rt.nunca ? T('FichaNoSale') : rt.ev.map(function (x) { return x.txt; }).join(' · '))));
          f.appendChild(bl);
        }
      } catch (err2) { try { console.warn('cielo ritmo:', err2); } catch (_) {} }
    }
    /* lo que ya contaba el catalogo */
    var dsc = c.descK ? nom(CIELO_DESC, c.descK) : '';
    if (dsc) f.appendChild(el('p', 'cielo-p', dsc));
    /* ¿sabias que...? con su fuente (codigo11) */
    var cu = bloqueCuriosidad(curiosidadDe(c), false); if (cu) f.appendChild(cu);
    /* botones */
    var bt = el('div', 'cielo-ficha-botones');
    if (opc.buscar && c.tipo !== 'punto') {
      var b1 = el('button', 'cielo-boton', '📱 ' + T('Encuentralo')); b1.type = 'button';
      b1.addEventListener('click', function () { abrirVista({ objetivo: c.sel }); });
      bt.appendChild(b1);
    }
    if (opc.guiar && c.tipo !== 'punto') {
      var b2 = el('button', 'cielo-boton', '🎯 ' + T('Guiame')); b2.type = 'button';
      b2.addEventListener('click', function () { ponerObjetivo(c.sel); });
      bt.appendChild(b2);
    }
    /* su recorrido de salida a puesta, pintado en la carta (lo piden a
       Stellarium; lo tienen Sky Tonight y SkyView) */
    if (opc.recorrido && c.tipo !== 'punto' && c.tipo !== 'constelacion' && (c.cuerpo || c.v)) {
      var b3 = el('button', 'cielo-boton', (opc.recorridoActivo ? '✕ ' : '🛤️ ') + T(opc.recorridoActivo ? 'RecorridoQuitar' : 'Recorrido')); b3.type = 'button';
      b3.setAttribute('aria-pressed', opc.recorridoActivo ? 'true' : 'false');
      b3.addEventListener('click', function () { opc.recorrido(opc.recorridoActivo ? null : c.sel); });
      bt.appendChild(b3);
    }
    if (bt.childNodes.length) f.appendChild(bt);
    /* Wikipedia, al final y sin bloquear nada */
    if (c.wp && c.wp.length) {
      var w = el('div', 'cielo-wiki');
      f.appendChild(w);
      wikiResumen(c).then(function (r) { if (r && w.isConnected !== false) pintarWiki(w, r); }, function () {});
    }
    return f;
  }

  /* ── WIKIPEDIA ─────────────────────────────────────────────────────
     El resumen de la API REST (/page/summary): el primer parrafo del
     articulo, una foto si la tiene y su enlace. Se busca en la inglesa con
     los titulos de wp[] (y se comprueba que el articulo sea de astronomia:
     su descripcion corta tiene que hablar de estrellas, nebulosas...), y de
     ahi, por los enlaces entre idiomas (langlinks), al del idioma de quien
     lee. Si Wikipedia dice que no lo hay (langlinks sin ese idioma), la ficha
     lo dice en el idioma de quien lee y no ensena nada en ingles (Jerome,
     21-10-2026: «si no tiene articulo salta en el idioma seleccionado que no
     tienen articulo»). Si falla la red no se sabe, y no se dice nada. Se
     recuerda en este movil 30 dias: en el Teide, sin cobertura, lo ya visto
     sigue saliendo. Todo va como texto (textContent), y las URL se validan
     con isSafeWikiUrl, como las fotos de los lugares. */
  var WIKI_MEM = {}, WIKI_CLAVE = 'tgo_cielo_wiki_v1', WIKI_DIAS = 30;
  var ES_ASTRO = /\b(star|stars|stellar|nebula|cluster|galaxy|galaxies|constellation|planet|satellite|supernova|remnant|asterism|binary|variable|giant|dwarf|supergiant|system)\b/i;
  function wikiCache() { try { return JSON.parse(localStorage.getItem(WIKI_CLAVE) || '{}') || {}; } catch (e) { return {}; } }
  function wikiGuardar(k, v) {
    try {
      var c = wikiCache(); c[k] = v;
      var ks = Object.keys(c).sort(function (a, b) { return (c[b].ts || 0) - (c[a].ts || 0); });
      ks.slice(80).forEach(function (x) { delete c[x]; });
      localStorage.setItem(WIKI_CLAVE, JSON.stringify(c));
    } catch (e) {}
  }
  function seguraWiki(u) {
    if (typeof isSafeWikiUrl === 'function') return isSafeWikiUrl(u);
    try { var p = new URL(u); return p.protocol === 'https:' && /(^|\.)wiki[mp]edia\.org$/.test(p.hostname); } catch (e) { return false; }
  }
  function pedirJSON(url, cab) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var tm = setTimeout(function () { if (ctrl) ctrl.abort(); }, 9000);
    return fetch(url, { signal: ctrl ? ctrl.signal : undefined, headers: cab || {} })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(tm); });
  }
  function resumen(dom, titulo, cab) {
    return pedirJSON('https://' + dom + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(titulo.replace(/ /g, '_')), cab);
  }
  function wikiResumen(c) {
    var L = lang(), dom = typeof wikiDominio === 'function' ? wikiDominio(L) : (L === 'zht' ? 'zh' : L);
    var cab = L === 'zht' ? { 'Accept-Language': 'zh-hant' } : (L === 'zh' ? { 'Accept-Language': 'zh-hans' } : null);
    var k = c.id + '|' + L;
    if (WIKI_MEM[k]) return WIKI_MEM[k];
    var g = wikiCache()[k];
    if (g && Date.now() - g.ts < WIKI_DIAS * 864e5) return (WIKI_MEM[k] = Promise.resolve(g.r));
    /* 1. el articulo en ingles: el primer titulo que exista y sea de astronomia */
    var i = 0;
    function enIngles() {
      if (i >= c.wp.length) return Promise.resolve(null);
      var t = c.wp[i++];
      return resumen('en', t).then(function (j) {
        if (j && j.type === 'standard' && (ES_ASTRO.test(j.description || '') || ES_ASTRO.test((j.extract || '').slice(0, 300)))) return j;
        return enIngles();
      }, function () { return enIngles(); });
    }
    var p = enIngles().then(function (en) {
      if (!en) return null;
      if (dom === 'en') return empaquetar(en, 'en');
      var titulo = (en.titles && en.titles.canonical) || en.title;
      return pedirJSON('https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&prop=langlinks&lllang=' + encodeURIComponent(dom) + '&titles=' + encodeURIComponent(titulo))
        .then(function (q) {
          var pg = q && q.query && q.query.pages && q.query.pages[0];
          if (!pg || pg.missing) return null;
          var ll = pg.langlinks && pg.langlinks[0];
          if (!ll || !ll.title) return { sin: true, idioma: dom };
          return resumen(dom, ll.title, cab).then(function (j) { return j && j.type === 'standard' && j.extract ? empaquetar(j, dom) : null; },
                                                   function () { return null; });
        }, function () { return null; });
    }).then(function (r) { if (r) wikiGuardar(k, { ts: Date.now(), r: r }); return r; }, function () { return null; });
    WIKI_MEM[k] = p;
    p.then(function (r) { if (!r) delete WIKI_MEM[k]; });
    return p;
  }
  function empaquetar(j, idioma) {
    var url = j.content_urls && j.content_urls.mobile && j.content_urls.mobile.page;
    if (!url || !seguraWiki(url)) url = 'https://' + idioma + '.wikipedia.org/wiki/' + encodeURIComponent(String(j.title || '').replace(/ /g, '_'));
    var img = j.thumbnail && j.thumbnail.source;
    return { titulo: String(j.title || ''), texto: String(j.extract || '').slice(0, 1400), url: url, img: img && seguraWiki(img) ? img : null, idioma: idioma };
  }
  function pintarWiki(w, r) {
    w.textContent = '';
    if (!r.texto && !r.sin) return;
    var cab = el('div', 'cielo-wiki-cab');
    cab.appendChild(el('span', 'cielo-wiki-w', 'W'));
    cab.appendChild(el('span', null, T('Wiki')));
    w.appendChild(cab);
    if (r.sin) { w.appendChild(el('p', 'cielo-wiki-no', T('WikiNo'))); return; }
    if (r.img) {
      var im = el('img', 'cielo-wiki-img'); im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
      try { im.referrerPolicy = 'no-referrer'; } catch (e) {}
      im.src = r.img; w.appendChild(im);
    }
    var p = el('p', 'cielo-wiki-txt', r.texto);
    p.setAttribute('lang', r.idioma === 'zh' ? (lang() === 'zht' ? 'zh-Hant' : 'zh-Hans') : r.idioma);
    p.setAttribute('data-sin-traducir', 'texto de Wikipedia');
    w.appendChild(p);
    var a = el('a', 'cielo-wiki-link', T('WikiLeer'));
    a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    w.appendChild(a);
    w.appendChild(el('div', 'cielo-wiki-lic', T('WikiLicencia')));
  }

  /* ── LO QUE PIDEN LAS RESEÑAS (21 de octubre de 2026) ──────────────
     De leer las quejas y las peticiones de las apps del cielo en las dos
     tiendas (APPS-DEL-CIELO-COMPETENCIA.md): la brujula que no cuadra y que
     ninguna deja comprobar, los avisos que no se apagan, un indice de la
     noche que se esconde, el recorrido de un astro, la fecha libre, la
     captura, las horas para fotos, las fases del mes y los retrogrados.
     Todo se calcula aqui, en el movil, sin servidor y sin cuenta; lo que se
     guarda (avisos, la guia ya vista) se queda en localStorage de este
     movil, y las imagenes y los .ics salen por la hoja de compartir del
     sistema o se descargan: no pasan por ningun sitio. */

  /* ── EL INDICE DE LA NOCHE (0 a 10) ─────────────────────────────────
     Lo que Sky Tonight ensena sin decir como. Aqui se dice: 10 puntos por
     una noche cerrada entera sin Luna; se descuenta la parte de la noche
     cerrada con la Luna arriba, en proporcion a lo iluminada que este (una
     Luna al 20 % apenas molesta, una llena lo apaga todo); y la media de
     nubes medias y altas previstas (Open-Meteo, como la tarjeta de nubes)
     lo baja en esa proporcion. Sin prevision, no se cuentan y se dice. */
  function nubesNoche(n) {
    if (!S.nubes) return null;
    var ini = n.oscuro.date.getTime(), fin = n.claro.date.getTime();
    var h = S.nubes.filter(function (x) { return x.t >= ini - 1800000 && x.t <= fin; });
    if (h.length < 3) return null;
    return Math.round(h.reduce(function (s, x) { return s + Math.max(x.m, x.a); }, 0) / h.length);
  }
  function indiceNoche(n) {
    var oscuro = (n.claro.ut - n.oscuro.ut) * 24;
    var sinLuna = Math.max(0, Math.min(n.sinLuna, oscuro)), frac = oscuro > 0 ? sinLuna / oscuro : 0;
    var luna = (1 - frac) * Math.min(1, 0.2 + n.ilum);
    var nubes = nubesNoche(n);
    var v = 10 * (1 - luna) * (nubes === null ? 1 : 1 - nubes / 100);
    var valor = Math.max(0, Math.min(10, Math.round(v)));
    return { valor: valor, palabra: valor >= 9 ? 'Excelente' : valor >= 7 ? 'Buena' : valor >= 5 ? 'Regular' : valor >= 3 ? 'Floja' : 'Mala',
             oscuro: oscuro, sinLuna: sinLuna, frac: frac, ilum: n.ilum, nubes: nubes };
  }
  function colorIndice(v) { return v >= 7 ? '#9be29e' : v >= 5 ? '#F5C76B' : '#ff9a6a'; }
  function tarjetaIndice(n) {
    var x = indiceNoche(n), t = tarjeta(T('Indice'));
    var caja = el('div', 'cielo-indice');
    var aro = el('div', 'cielo-indice-aro');
    aro.style.background = 'conic-gradient(' + colorIndice(x.valor) + ' ' + (x.valor * 36) + 'deg, rgba(255,255,255,0.08) 0)';
    var num = el('div', 'cielo-indice-num'); num.appendChild(el('b', null, String(x.valor))); num.appendChild(el('small', null, '/10'));
    aro.appendChild(num); aro.setAttribute('role', 'img'); aro.setAttribute('aria-label', T('IndiceDe', { n: x.valor }));
    caja.appendChild(aro);
    var txt = el('div', 'cielo-indice-txt');
    var pal = el('div', 'cielo-indice-pal', T('Indice' + x.palabra)); pal.style.color = colorIndice(x.valor); txt.appendChild(pal);
    txt.appendChild(el('div', 'cielo-item-sub', T('IndiceNoche', { t: duracion(x.oscuro * 60) })));
    txt.appendChild(el('div', 'cielo-item-sub', T('IndiceSinLuna', { t: duracion(x.sinLuna * 60), p: numero(x.frac * 100, 0) }) +
      (x.frac < 0.995 ? ' · ' + T('IndiceLunaIlum', { p: numero(x.ilum * 100, 0) }) : '')));
    txt.appendChild(el('div', 'cielo-item-sub', x.nubes === null ? T('IndiceSinNubes') : T('IndiceNubes', { p: numero(x.nubes, 0) })));
    caja.appendChild(txt); t.appendChild(caja);
    var bt = el('button', 'cielo-boton', '📤 ' + T('Compartir')); bt.type = 'button';
    bt.addEventListener('click', function () { compartirNoche(n, bt); });
    t.appendChild(bt);
    t.appendChild(el('div', 'cielo-nota', T('IndiceComo')));
    return t;
  }
  /* La imagen que se comparte: el cielo de esa noche (la misma carta,
     mirando al sur a media noche cerrada), el indice y lo mejor. 1080×1350. */
  function imagenNoche(n) {
    var W = 1080, H = 1350, HC = 640, c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d');
    var cielo = document.createElement('canvas'); cielo.width = W; cielo.height = HC;
    var V = nuevaVista(cielo); V.dpr = 2.4; V.az = 180; V.alt = 32; V.fov = 100; V.suelo = 0.93; V.quieto = true;
    pintarCielo(V, Astronomy.MakeTime((n.oscuro.ut + n.claro.ut) / 2).date, 0);
    g.drawImage(cielo, 0, 0);
    var gr = g.createLinearGradient(0, HC - 120, 0, HC); gr.addColorStop(0, 'rgba(5,8,18,0)'); gr.addColorStop(1, 'rgba(5,8,18,1)');
    g.fillStyle = gr; g.fillRect(0, HC - 120, W, 120);
    g.fillStyle = '#05081a'; g.fillRect(0, HC, W, H - HC);
    var x = indiceNoche(n), hoy = n.fecha === nocheDeHoy(), M = 56;
    var F = function (peso, tam) { g.font = peso + ' ' + tam + 'px DM Sans, system-ui, sans-serif'; };
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.fillStyle = '#F5C76B'; F(800, 54);
    g.fillText(recortarTexto(g, hoy ? T('ImagenTitulo') : T('NocheDel', { f: dia(instanteLocal(n.fecha, 12, 0)) }) + ' · Teide', W - 2 * M), M, HC + 84);
    g.fillStyle = 'rgba(255,255,255,0.72)'; F(500, 31);
    g.fillText(recortarTexto(g, diaAnio(instanteLocal(n.fecha, 12, 0)) + ' · Observatorio del Teide, Izaña', W - 2 * M), M, HC + 130);
    /* el aro del indice, y a su derecha la palabra y las tres lineas (envueltas) */
    var cx = 150, cy = HC + 290, R = 90, X = 290;
    g.lineWidth = 16; g.strokeStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.stroke();
    g.strokeStyle = colorIndice(x.valor); g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + x.valor / 10 * 2 * Math.PI); g.stroke();
    g.textAlign = 'center'; g.fillStyle = '#fff'; F(800, 82); g.fillText(String(x.valor), cx, cy + 29);
    g.textAlign = 'left';
    g.fillStyle = colorIndice(x.valor); F(800, 42); g.fillText(recortarTexto(g, T('Indice' + x.palabra) + ' · ' + T('IndiceDe', { n: x.valor }), W - X - M), X, HC + 236);
    g.fillStyle = 'rgba(255,255,255,0.85)'; F(500, 29);
    var y = HC + 286;
    [T('IndiceNoche', { t: duracion(x.oscuro * 60) }),
     T('IndiceSinLuna', { t: duracion(x.sinLuna * 60), p: numero(x.frac * 100, 0) }) + (x.frac < 0.995 ? ' · ' + T('IndiceLunaIlum', { p: numero(x.ilum * 100, 0) }) : ''),
     x.nubes === null ? T('IndiceSinNubes') : T('IndiceNubes', { p: numero(x.nubes, 0) })].forEach(function (l) {
      envolverTexto(g, l, W - X - M).slice(0, 3).forEach(function (s) { g.fillText(s, X, y); y += 38; });
      y += 6;
    });
    /* lo mejor: el planeta mas brillante y dos objetos a simple vista */
    var mejor = [], pl = planetasNoche(n), mj = mejoresNoche(n);
    if (pl.length) mejor.push(nom(CIELO_CUERPO, pl[0].p));
    mj[1].slice(0, 2).forEach(function (o) { mejor.push(o.k === 'dob' ? nombreDoble(o.o) : (nombreObjeto(o.o) || designacionObjeto(o.o))); });
    var vl = viaLacteaNoche(n); if (vl.mejor) mejor.push(T('ViaLactea'));
    y = Math.max(y, cy + R + 60);
    if (mejor.length) {
      g.fillStyle = '#F5C76B'; F(600, 32);
      envolverTexto(g, T('ImagenMejor', { l: mejor.join(' · ') }), W - 2 * M).slice(0, 2).forEach(function (s) { g.fillText(s, M, y); y += 42; });
    }
    g.fillStyle = 'rgba(255,255,255,0.5)'; F(500, 27);
    g.fillText('Tenerife Go · jerome4551.github.io/tenerife-go', M, H - 52);
    g.textAlign = 'right'; g.fillText(T('Titulo'), W - M, H - 52); g.textAlign = 'left';
    return c;
  }
  function recortarTexto(g, s, max) {
    s = String(s);
    if (g.measureText(s).width <= max) return s;
    while (s.length > 1 && g.measureText(s + '…').width > max) s = s.slice(0, -1);
    return s + '…';
  }
  /* en lineas que quepan: por espacios, y si una palabra (o el chino, sin
     espacios) no cabe, por letras */
  function envolverTexto(g, s, max) {
    var out = [], linea = '';
    String(s).split(' ').forEach(function (w) {
      var prueba = linea ? linea + ' ' + w : w;
      if (g.measureText(prueba).width <= max) { linea = prueba; return; }
      if (linea) out.push(linea);
      linea = '';
      for (var i = 0; i < w.length; i++) {
        if (g.measureText(linea + w[i]).width > max && linea) { out.push(linea); linea = ''; }
        linea += w[i];
      }
    });
    if (linea) out.push(linea);
    return out;
  }
  function compartirNoche(n, boton) {
    var c;
    try { c = imagenNoche(n); } catch (e) { try { console.warn('cielo imagen:', e); } catch (_) {} notaBajo(boton, T('CapturaNo')); return Promise.resolve(null); }
    return aBlob(c).then(function (b) {
      return compartirFichero(b, 'tenerife-go-' + n.fecha + '.png', T('Titulo')).then(function (r) { if (r === 'descargado') notaBajo(boton, T('CapturaLista')); return b; });
    }, function () { notaBajo(boton, T('CapturaNo')); return null; });
  }
  function aBlob(c) { return new Promise(function (ok, mal) { try { c.toBlob(function (b) { if (b) ok(b); else mal(new Error('blob')); }, 'image/png'); } catch (e) { mal(e); } }); }
  /* una nota debajo de un boton, una sola vez */
  function notaBajo(boton, txt) {
    if (!boton || !boton.parentNode) return;
    var s = boton.nextSibling;
    if (s && s.className === 'cielo-nota cielo-nota-aviso') s.textContent = txt;
    else boton.parentNode.insertBefore(el('div', 'cielo-nota cielo-nota-aviso', txt), boton.nextSibling);
  }

  /* ── COMPARTIR O GUARDAR UN FICHERO ─────────────────────────────────
     La hoja de compartir del sistema si acepta ficheros (Android, iOS); si
     no, se descarga. Nada pasa por ningun servidor. Devuelve que paso. */
  function compartirFichero(blob, nombre, titulo) {
    var f = null;
    try { f = new File([blob], nombre, { type: blob.type }); } catch (e) { f = null; }
    if (f && navigator.share && navigator.canShare) {
      var puede = false; try { puede = navigator.canShare({ files: [f] }); } catch (e) { puede = false; }
      if (puede) return navigator.share({ files: [f], title: titulo }).then(function () { return 'compartido'; },
        function (e) { return e && e.name === 'AbortError' ? 'cancelado' : descargar(blob, nombre); });
    }
    return Promise.resolve(descargar(blob, nombre));
  }
  function descargar(blob, nombre) {
    try {
      var u = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = u; a.download = nombre; a.rel = 'noopener'; a.style.display = 'none';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { try { URL.revokeObjectURL(u); } catch (e) {} }, 60000);
      return 'descargado';
    } catch (e) { return 'fallo'; }
  }

  /* ── LA CAPTURA DE LA CARTA Y DE LA VISTA ───────────────────────────
     Lo pintado tal cual (con la imagen de la camara debajo si esta puesta)
     y un pie: que se mira, cuando, y de donde sale. Sin pasar por nada. */
  function capturar(V, opc) {
    var cv = V.cv;
    if (!cv || !cv.width || !cv.height) return Promise.reject(new Error('lienzo'));
    var dpr = V.dpr || 1, W = cv.width, H = cv.height, pie = Math.round(66 * dpr);
    var c = document.createElement('canvas'); c.width = W; c.height = H + pie;
    var g = c.getContext('2d');
    g.fillStyle = '#02040c'; g.fillRect(0, 0, W, H + pie);
    var vid = opc.video;
    if (vid && vid.videoWidth && vid.videoHeight && !vid.hidden) {
      var s = Math.max(W / vid.videoWidth, H / vid.videoHeight), vw = vid.videoWidth * s, vh = vid.videoHeight * s;
      try { g.drawImage(vid, (W - vw) / 2, (H - vh) / 2, vw, vh); } catch (e) {}
    }
    g.drawImage(cv, 0, 0);
    g.fillStyle = 'rgba(5,8,18,0.97)'; g.fillRect(0, H, W, pie);
    var m = 12 * dpr, max = W - 2 * m;
    g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillStyle = '#F5C76B'; g.font = '700 ' + Math.round(14 * dpr) + 'px DM Sans, system-ui, sans-serif';
    g.fillText(recortarTexto(g, opc.titulo || T('Titulo'), max), m, H + pie * 0.22);
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = Math.round(11 * dpr) + 'px DM Sans, system-ui, sans-serif';
    g.fillText(recortarTexto(g, T('CapturaDesde', { f: dia(opc.fecha) + ' · ' + hora(opc.fecha) }), max), m, H + pie * 0.52);
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.fillText(recortarTexto(g, 'Tenerife Go · jerome4551.github.io/tenerife-go', max), m, H + pie * 0.8);
    return aBlob(c);
  }
  function capturarY(V, opc, boton) {
    return capturar(V, opc).then(function (b) {
      return compartirFichero(b, 'tenerife-go-cielo-' + fechaLocal(opc.fecha) + '.png', T('Titulo')).then(function (r) { if (opc.avisa) opc.avisa(r); return b; });
    }, function (e) { try { console.warn('cielo captura:', e); } catch (_) {} if (opc.avisa) opc.avisa('fallo'); return null; });
  }

  /* ── EL RECORRIDO DE UN ASTRO ESA NOCHE ─────────────────────────────
     De mediodia a mediodia, cada 10 minutos, en este-norte-arriba; con la
     hora en cada punto en punto. Lo pinta la carta (pintarRastro). */
  function trayectoria(c, fecha) {
    var A = Astronomy, t0 = noche24(fecha), pts = [], b = c.cuerpo ? A.Body[c.cuerpo] : null, v = c.v;
    if (!b && !v) return pts;
    for (var m = 0; m <= 1440; m += 10) {
      var t = t0.AddDays(m / 1440), e;
      if (b) { var h = cuerpoHorizonteB(b, t); e = enuDe(h.alt, h.az); }
      else e = refractar(aEnu(rotacion(t), v, [0, 0, 0]));
      if (e[2] < -0.06) continue;                       // mas de 3,5 grados bajo el horizonte: no se pinta
      var p = partes(t.date);
      pts.push({ e: e, u: t.ut, hora: p.minute === 0 ? hora(t.date) : null });
    }
    return pts;
  }
  function pintarRastro(ctx, V, P, fecha, dpr, rotulo) {
    var c = cosaDe(V.rastro, fecha), clave = c.id + '|' + noche24(fecha).ut.toFixed(3);
    if (!V._rastro || V._rastro.clave !== clave) V._rastro = { clave: clave, pts: trayectoria(c, fecha) };
    var pts = V._rastro.pts, q = [0, 0, 0], ant = null;
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(245,199,107,0.62)'; ctx.lineWidth = 1.4 * dpr; ctx.setLineDash([5 * dpr, 5 * dpr]);
    ctx.beginPath();
    pts.forEach(function (p) {
      var ok_ = P(p.e, q) && Math.abs(q[0]) < 4 * V.W && Math.abs(q[1]) < 4 * V.H;
      if (ok_ && ant && Math.abs(q[0] - ant[0]) < V.W && Math.abs(q[1] - ant[1]) < V.H) ctx.lineTo(q[0], q[1]);
      else if (ok_) ctx.moveTo(q[0], q[1]);
      ant = ok_ ? [q[0], q[1]] : null;
    });
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(245,199,107,0.9)';
    pts.forEach(function (p) {
      if (!p.hora || !P(p.e, q) || q[0] < 0 || q[1] < 0 || q[0] > V.W || q[1] > V.H) return;
      ctx.beginPath(); ctx.arc(q[0], q[1], 2.2 * dpr, 0, 2 * Math.PI); ctx.fill();
      rotulo(p.hora, q[0] + 5 * dpr, q[1] - 4 * dpr, 9, 'rgba(245,199,107,0.85)', 1, false, '600 ');
    });
    ctx.restore();
  }
  function mismoSel(a, b) { return !!a && !!b && cosaDe(a).id === cosaDe(b).id; }

  /* ── LAS HORAS PARA FOTOS ────────────────────────────────────────────
     Hora dorada: el centro del Sol entre 6 grados sobre el horizonte y 4
     por debajo; hora azul: entre 4 y 6 por debajo. Son las definiciones de
     PhotoPills (photopills.com/glossary), las que usan los fotografos. Se
     calculan con el motor, como todo. */
  function horasFotos(n) {
    var A = Astronomy, o = obs(), S_ = A.Body.Sun, t0 = A.MakeTime(instanteLocal(n.fecha, 12, 0));
    var t6 = A.SearchAltitude(S_, o, -1, t0, 1, 6), tm4 = A.SearchAltitude(S_, o, -1, t0, 1, -4);
    var cm4 = A.SearchAltitude(S_, o, +1, n.oscuro, 1, -4), c6 = A.SearchAltitude(S_, o, +1, n.oscuro, 1, 6);
    if (!t6 || !tm4 || !cm4 || !c6) return null;
    return { doradaT: [t6, tm4], azulT: [tm4, n.civilT], azulM: [n.civilM, cm4], doradaM: [cm4, c6] };
  }
  function tarjetaFotos(n) {
    var h = horasFotos(n); if (!h) return null;
    var t = tarjeta('📷 ' + T('ParaFotos'));
    var tramo = function (x) { return hora(x[0].date) + '–' + hora(x[1].date); };
    t.appendChild(fila(T('DoradaTarde'), tramo(h.doradaT)));
    t.appendChild(fila(T('AzulTarde'), tramo(h.azulT)));
    var vl = viaLacteaNoche(n);
    t.appendChild(fila(T('ViaLactea'), vl.mejor ? hora(Astronomy.MakeTime(vl.desde).date) + '–' + hora(Astronomy.MakeTime(vl.hasta).date) + ' · ' + hacia(vl.mejor.az) : '—'));
    t.appendChild(fila(T('AzulManana'), tramo(h.azulM)));
    t.appendChild(fila(T('DoradaManana'), tramo(h.doradaM)));
    t.appendChild(el('div', 'cielo-nota', T('FotosNota')));
    var z = notaZodiacal(n); if (z) t.appendChild(z);              // en su temporada (codigo11)
    var sb = notaSombra(n); if (sb) t.appendChild(sb);
    return t;
  }

  /* ── LOS AVISOS: SOLO EN ESTE MOVIL, Y QUE SE QUITAN ───────────────
     Lo que las reseñas castigan: avisos que llegan sin pedirlos y que no se
     apagan. Aqui no hay ninguno por defecto. «Añadir a mi calendario» crea
     un .ics (RFC 5545, con alarma el dia antes) que abre el calendario del
     movil: ese si avisa. «Recordarmelo en la app» lo apunta en localStorage
     y, los dos dias de antes, sale arriba del todo al abrir el panel: una
     web sin servidor no puede despertar a nadie, y se dice. */
  var AVISOS_CLAVE = 'tgo_cielo_avisos_v1';
  function idEvento(e) {
    var que = e.s ? e.s.clave : e.l ? e.l.id : (e.p || e.k || (e.a ? e.a + '-' + e.b : '') || (e.q !== undefined ? 'q' + e.q : '') || (e.global || e.kind || ''));
    return e.tipo + '|' + que + (e.tipo !== 'paso' && e.ini !== undefined ? (e.ini ? '|ini' : '|fin') : '') + '|' + e.t.toISOString().slice(0, 13);
  }
  function avisos() { try { return JSON.parse(localStorage.getItem(AVISOS_CLAVE) || '[]') || []; } catch (e) { return []; } }
  function guardarAvisos(l) { try { if (l.length) localStorage.setItem(AVISOS_CLAVE, JSON.stringify(l)); else localStorage.removeItem(AVISOS_CLAVE); } catch (e) {} }
  function tieneAviso(e) { var id = idEvento(e); return avisos().some(function (a) { return a.id === id; }); }
  function ponerAviso(e) {
    var id = idEvento(e), l = avisos().filter(function (a) { return a.id !== id; });
    l.push({ id: id, t: e.t.getTime() });
    l.sort(function (a, b) { return a.t - b.t; });
    guardarAvisos(l);
  }
  function quitarAviso(id) { guardarAvisos(avisos().filter(function (a) { return a.id !== id; })); }
  function quitarAvisos() { guardarAvisos([]); }
  /* los eventos avisados que siguen en el calendario (los pasados, fuera) */
  function eventosAvisados() {
    var l = avisos(), ahora = Date.now(), vivos = l.filter(function (a) { return a.t > ahora - 36 * 3600000; });
    if (vivos.length !== l.length) guardarAvisos(vivos);
    if (!vivos.length) return [];
    var ids = {}; vivos.forEach(function (a) { ids[a.id] = true; });
    return eventos().concat(pasosProximos()).filter(function (e) { return ids[idEvento(e)]; });
  }
  function botonesAviso(e) {
    var caja = el('div', 'cielo-aviso-btns');
    var b1 = el('button', 'cielo-boton', '📅 ' + T('AlCalendario')); b1.type = 'button';
    b1.addEventListener('click', function (ev) { ev.stopPropagation(); alCalendario(e, b1); });
    var b2 = el('button', 'cielo-boton', ''); b2.type = 'button';
    var pintarB2 = function () { var p = tieneAviso(e); b2.textContent = (p ? '✓ ' : '🔔 ') + T(p ? 'AvisoQuitar' : 'AvisoAqui'); b2.setAttribute('aria-pressed', p ? 'true' : 'false'); };
    b2.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (tieneAviso(e)) { quitarAviso(idEvento(e)); var s = caja.querySelector('.cielo-nota-aviso'); if (s) s.remove(); }
      else { ponerAviso(e); notaBajo(b2, T('AvisoPuesto')); }
      pintarB2();
      var c = S.avisosCaja; if (c) pintarMisAvisos(c, S.avisosOpc);
    });
    pintarB2();
    caja.appendChild(b1); caja.appendChild(b2);
    return caja;
  }
  function alCalendario(e, boton) {
    var ics;
    try { ics = icsEvento(e); } catch (x) { try { console.warn('cielo ics:', x); } catch (_) {} return Promise.resolve(null); }
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    return compartirFichero(blob, 'cielo-tenerife-' + fechaLocal(e.t) + '.ics', tituloEvento(e)).then(function (r) { if (r === 'descargado') notaBajo(boton, T(e.tipo === 'paso' ? 'IcsListoPaso' : 'IcsListo')); return ics; });
  }
  /* RFC 5545: lineas de 75 octetos como mucho, plegadas con CRLF y un
     espacio; comas, puntos y coma y barras escapados; fechas en UTC. */
  function icsTexto(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsFecha(d) { return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsPlegar(linea) {
    var out = [], actual = '', bytes = 0;
    for (var i = 0; i < linea.length; i++) {
      var ch = linea[i], cp = linea.codePointAt(i);
      if (cp > 0xffff) { ch = linea.slice(i, i + 2); i++; }
      var b = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
      var tope = out.length ? 74 : 75;                 // las continuaciones llevan el espacio delante
      if (bytes + b > tope) { out.push(actual); actual = ''; bytes = 0; tope = 74; }
      actual += ch; bytes += b;
    }
    out.push(actual);
    return out.map(function (l, i) { return i ? ' ' + l : l; }).join('\r\n');
  }
  function tramoEvento(e) {
    var A = Astronomy, h = 3600000;
    if (e.tipo === 'lluvia') { var m = A.MakeTime(e.mejor.u).date.getTime(); return [new Date(m - h), new Date(m + h)]; }
    if (e.tipo === 'eclipseSol') return [e.ini.time.date, e.fin.time.date];
    if (e.tipo === 'eclipseLuna') return [e.u1 || e.p1, e.u4 || e.p4];
    if (e.tipo === 'paso') return [e.ini.t, e.fin.t];
    return [e.t, new Date(e.t.getTime() + h)];
  }
  function icsEvento(e) {
    var tr = tramoEvento(e), tit = tituloEvento(e);
    var desc = detalleEvento(e).concat([T('IcsHora', { h: hora(e.t) }), 'Tenerife Go · https://jerome4551.github.io/tenerife-go/']).join('\n');
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tenerife Go//Cielo de Tenerife//' + lang().toUpperCase(), 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
             'BEGIN:VEVENT',
             'UID:' + idEvento(e).replace(/[^A-Za-z0-9]+/g, '-') + '@jerome4551.github.io',
             'DTSTAMP:' + icsFecha(new Date()), 'DTSTART:' + icsFecha(tr[0]), 'DTEND:' + icsFecha(tr[1]),
             'SUMMARY:' + icsTexto(tit), 'DESCRIPTION:' + icsTexto(desc),
             'LOCATION:' + icsTexto('Observatorio del Teide (Izaña), Tenerife'), 'GEO:' + OBS.lat + ';' + OBS.lon,
             'URL:https://jerome4551.github.io/tenerife-go/',
             /* un paso dura minutos: la alarma, media hora antes; lo demas, la vispera */
             'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:' + (e.tipo === 'paso' ? '-PT30M' : '-P1D'), 'DESCRIPTION:' + icsTexto(T(e.tipo === 'paso' ? 'IcsAvisoPaso' : 'IcsAviso', { e: tit })), 'END:VALARM',
             'END:VEVENT', 'END:VCALENDAR'];
    return L.map(icsPlegar).join('\r\n') + '\r\n';
  }
  /* la tarjeta «Mis avisos»: en «Esta noche», solo los de los dos dias de
     antes; en el calendario, todos, con «quitar» y «quitar todos» */
  function pintarMisAvisos(c, opc) {
    c.textContent = '';
    var lista = eventosAvisados(), ahora = Date.now();
    if (opc.pronto) lista = lista.filter(function (e) { return e.t.getTime() - ahora < 48 * 3600000; });
    if (!lista.length) { c.hidden = true; return; }
    c.hidden = false;
    var t = tarjeta('🔔 ' + T('MisAvisos'));
    var hoy = nocheDeHoy();
    lista.forEach(function (e) {
      var f = filaEvento(e), noche = partes(e.t).hour < 12 ? sumarDias(fechaLocal(e.t), -1) : fechaLocal(e.t);
      var cuando = noche === hoy ? 'AvisoHoy' : noche === sumarDias(hoy, 1) ? 'AvisoManana' : null;
      if (cuando) { var ch = el('span', 'cielo-aviso-pronto', T(cuando)); f.querySelector('.cielo-item-nom').appendChild(ch); }
      var q = el('button', 'cielo-boton', T('AvisoQuitar')); q.type = 'button';
      q.addEventListener('click', function (ev) { ev.stopPropagation(); quitarAviso(idEvento(e)); pintar(); });
      f.querySelector('.cielo-item-txt').appendChild(q);
      t.appendChild(f);
    });
    if (!opc.pronto) {
      var bt = el('button', 'cielo-boton', T('AvisosQuitarTodos')); bt.type = 'button';
      bt.addEventListener('click', function () { quitarAvisos(); pintar(); });
      t.appendChild(bt);
    }
    t.appendChild(el('div', 'cielo-nota', T('AvisosNota')));
    c.appendChild(t);
  }
  function tarjetaAvisos(opc) {
    var c = el('div'); S.avisosCaja = c; S.avisosOpc = opc;
    pintarMisAvisos(c, opc);
    return c;
  }

  /* ── LA BRUJULA: GUIA, COMPROBACION Y PRECISION ─────────────────────
     La queja numero uno de todas las apps del cielo es que el cielo no
     cuadra con el de verdad, y ninguna lo resuelve de cara a quien mira.
     Aqui: una guia de 20 segundos la primera vez (imanes, el ocho en el
     aire, comprobar con un astro); «Comprobar la brujula»: se pone la Luna
     (o el Sol, un planeta, la estrella mas brillante) en el circulo, se toca
     «Ya» y la app mide cuanto se desvia la brujula y lo corrige; y la
     precision que da iOS (webkitCompassAccuracy, grados de error) en el
     chip de los sensores. Android no da precision: por eso la comprobacion. */
  function mostrarGuia() {
    if (!VI) return;
    var g = VI.guia; g.textContent = '';
    g.appendChild(el('div', 'cv-guia-tit', T('GuiaTitulo')));
    [['🧲', 'GuiaImanes'], ['∞', 'GuiaOcho'], ['🌙', 'GuiaComprueba']].forEach(function (x) {
      var f = el('div', 'cv-guia-paso');
      f.appendChild(el('span', 'cv-guia-ico' + (x[0] === '∞' ? ' cv-guia-ocho' : ''), x[0]));
      f.appendChild(el('span', null, T(x[1])));
      g.appendChild(f);
    });
    g.appendChild(el('div', 'cielo-nota', T('GuiaPorQue', { d: numero(Math.abs(declinacionHoy(new Date())), 1) })));
    var b = el('button', 'cielo-boton', T('GuiaEntendido')); b.type = 'button';
    b.addEventListener('click', function () { cerrarGuia(true); });
    g.appendChild(b);
    g.hidden = false; VI.guiaAbierta = true;
  }
  function cerrarGuia(vista) {
    if (!VI) return;
    VI.guia.hidden = true; VI.guiaAbierta = false;
    if (vista) guardar('tgo_cielo_guia', 1);
    if (VI.V.sensores && !VI.ayudaDada) { VI.ayudaDada = true; avisar(T('ApuntaAyuda'), 7000); }
  }
  /* con que se comprueba: el Sol si esta alto (sin mirarlo: la app lo
     dice), la Luna si se ve, el planeta mas brillante, la estrella mas
     brillante que este a mas de 15 grados */
  function referenciaBrujula(I) {
    var cu = I.cu;
    if (cu.Sun.alt > 8) return { planeta: 'Sun' };
    if (cu.Moon.alt > 8 && (1 + Math.cos(cu.Moon.fase * RAD)) / 2 > 0.1) return { planeta: 'Moon' };
    var pl = ['Venus', 'Jupiter', 'Mars', 'Saturn', 'Mercury'].filter(function (p) { return cu[p].alt > 10 && cu[p].mag < 1.5 && cu.Sun.alt < -3; });
    pl.sort(function (a, b) { return cu[a].mag - cu[b].mag; });
    if (pl.length) return { planeta: pl[0] };
    if (cu.Sun.alt >= -3) return null;
    var D = S.datos, mejor = null, e = [0, 0, 0];
    for (var i = 0; i < D.est.length && i < 60; i++) {
      var st = D.est[i]; aEnu(I.rot, st.v, e);
      if (e[2] > Math.sin(15 * RAD) && (!mejor || st[2] < mejor[2])) mejor = st;
    }
    return mejor ? { est: mejor } : null;
  }
  function comprobarBrujula() {
    if (!VI || !VI.V.sensores) return;
    var fecha = new Date(Date.now() + VI.desfase * 60000), I = instante(fecha), ref = referenciaBrujula(I);
    if (!ref) { avisar(T('ComprobarAbajo'), 7000); return; }
    VI.comprobando = ref;
    VI.V.objetivo = ref; VI.vibro = false; VI.gradosObjetivo = null;
    cerrarHoja(); pintarComprobar(); pintarChips();
  }
  function pintarComprobar() {
    var k = VI.comp; k.textContent = '';
    if (!VI.comprobando) { k.hidden = true; pintarObjetivo(false); return; }
    var c = cosaDe(VI.comprobando);
    var txt = el('span', 'cv-comprobar-txt', T('ComprobarCon', { c: (c.ico ? c.ico + ' ' : '') + c.nombre }));
    k.appendChild(txt);
    if (c.tipo === 'sol') k.appendChild(el('span', 'cv-comprobar-sol', T('AvisoSol')));
    var fila_ = el('div', 'cv-comprobar-btns');
    var ya = el('button', 'cielo-boton cv-comprobar-ya', T('ComprobarYa')); ya.type = 'button';
    ya.addEventListener('click', comprobarYa);
    var ayuda = botonMapa('?', null, function () { mostrarGuia(); }, T('GuiaTitulo'), 'cv-btn cv-btn-mini');
    var cerrar_ = botonMapa('✕', null, function () { VI.comprobando = null; VI.V.objetivo = null; pintarComprobar(); pintarChips(); }, cerrarTxt(), 'cv-btn cv-btn-mini');
    fila_.appendChild(ya); fila_.appendChild(ayuda); fila_.appendChild(cerrar_);
    k.appendChild(fila_);
    k.hidden = false;
    VI.obj.hidden = true;
  }
  function comprobarYa() {
    if (!VI || !VI.comprobando) return;
    var fecha = new Date(Date.now() + VI.desfase * 60000), I = instante(fecha), B = VI.V.base;
    var e = vectorSel(VI.comprobando, I), c = cosaDe(VI.comprobando);
    if (!e || !B) { avisar(T('SensoresEspera'), 5000); return; }
    var hr = altAzDe(e), hc = altAzDe(B.f);
    var sep = Math.acos(limitar(pto(e, B.f), -1, 1)) / RAD;
    if (sep > 25) { avisar(T('ComprobarLejos', { c: c.nombre, g: numero(Math.round(sep), 0) }), 7000); return; }
    var dAz = difAng(hr.az, hc.az), dAlt = hr.alt - hc.alt;
    VI.ajuste = ((VI.ajuste + dAz + 540) % 360) - 180;
    guardar('tgo_cielo_ajuste', VI.ajuste.toFixed(1));
    VI.comprobada = Date.now(); VI.comprobando = null; VI.V.objetivo = null;
    VI.ultimaComprobacion = { dAz: dAz, dAlt: dAlt, sep: sep, ref: c.id };
    var g = numero(Math.round(Math.abs(dAz)), 0);
    if (Math.abs(dAlt) > 6) avisar(T('ComprobarAltura', { g: numero(Math.round(Math.abs(dAlt)), 0) }), 9000);
    else if (Math.abs(dAz) < 2) avisar(T('ComprobarBien', { g: g }), 7000);
    else avisar(T('ComprobarHecho', { g: g }), 9000);
    pintarComprobar(); pintarChips();
  }
  function capturarVista() {
    if (!VI) return Promise.resolve(null);
    var fecha = new Date(Date.now() + VI.desfase * 60000), c = VI.centro ? cosaDe(VI.centro, fecha) : null;
    return capturarY(VI.V, { video: VI.V.camara ? VI.video : null, fecha: fecha, titulo: c ? c.nombre : T('Apunta'),
      avisa: function (r) { if (r === 'descargado') avisar(T('CapturaLista'), 6000); else if (r === 'fallo') avisar(T('CapturaNo'), 6000); } });
  }

  /* ── LA ESTACION ESPACIAL Y LOS SATELITES BRILLANTES (21-10-2026) ──
     La pregunta mas repetida de cualquier noche es «¿cuando pasa la
     Estacion?», y hasta hoy el panel mandaba a la aplicacion de la NASA.
     Ahora se calcula aqui, en el movil:
       · Los elementos orbitales (TLE) de la Estacion Espacial Internacional,
         de la estacion china Tiangong y del telescopio Hubble los baja cada
         dia un robot de GitHub de CelesTrak a datos/satelites.json
         (tools/satelites_traer.py). Cambian a diario por el rozamiento con
         la atmosfera: con elementos de mas de 7 dias no se ensena ningun
         paso, y se dice.
       · La posicion sale de SGP4 (vendor/satellite.js, MIT; comprobado
         contra los 33 casos de verificacion oficiales, a 1e-7 km), la mirada
         desde Izaña de sus transformaciones TEME → ECF → acimut y altura, y
         si el satelite esta al Sol, de su sombra de la Tierra (cono de
         umbra y penumbra).
       · Un paso «visible» es un tramo con el satelite a mas de 10 grados
         sobre el horizonte, iluminado por el Sol y con el cielo ya oscuro
         (Sol a mas de 6 grados bajo el horizonte): la misma regla que usan
         las tablas de pasos de siempre. Se dan la aparicion, el punto mas
         alto y la desaparicion (o la entrada en la sombra de la Tierra), con
         su rumbo, a un segundo.
       · Nada de aqui se guarda ni se envia: el movil lee el fichero de su
         propio dominio y calcula. Starlink no esta: son trenes de dias. */
  var SAT_MIN_ALT = 10, SAT_SOL_BAJO = -6, SAT_PASO_MS = 20000;
  var SAT_WP = { iss: ['International Space Station'], tiangong: ['Tiangong space station'], hubble: ['Hubble Space Telescope'] };
  function cargarSatelites() {
    if (S.sat.carga) return S.sat.carga;
    var motor = new Promise(function (ok, mal) {
      if (window.satellite && window.satellite.twoline2satrec) return ok();
      var s = document.createElement('script');
      s.src = './vendor/satellite.js';
      s.onload = function () { if (window.satellite) ok(); else mal(new Error('satellite')); };
      s.onerror = function () { mal(new Error('satellite')); };
      document.head.appendChild(s);
    });
    /* en la aplicacion de las tiendas (TGO-NATIVO) los elementos se piden primero a la web viva: tgoFetchDatos, en index.html */
    var pedir = typeof tgoFetchDatos === 'function' ? tgoFetchDatos : fetch;
    var datos = pedir('./datos/satelites.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    S.sat.carga = Promise.all([motor, datos]).then(function (x) { prepararSatelites(x[1]); S.sat.fallo = false; },
      function (e) { S.sat.carga = null; S.sat.fallo = true; throw e; });
    return S.sat.carga;
  }
  function prepararSatelites(d) {
    var lista = [];
    (d.sat || []).forEach(function (s) {
      try {
        var rec = satellite.twoline2satrec(s.l1, s.l2);
        if (rec.error) return;
        s.rec = rec; s.epocaMs = Date.parse(s.epoca); lista.push(s);
      } catch (e) {}
    });
    d.sat = lista; d.maxDias = d.maxDias || 7;
    S.sat.datos = d; S.sat.pasos = {}; S.sat.porClave = {};
    lista.forEach(function (s) { S.sat.porClave[s.clave] = s; });
  }
  function satPorClave(k) { return S.sat.porClave ? S.sat.porClave[k] : null; }
  function nombreSat(s) { return T('SatNombre' + s.clave.charAt(0).toUpperCase() + s.clave.slice(1)) || s.nombre; }
  var OBS_GD = null;
  function observadorGd() { return OBS_GD || (OBS_GD = { latitude: OBS.lat * RAD, longitude: OBS.lon * RAD, height: OBS.h / 1000 }); }
  /* donde esta un satelite en un instante: acimut, altura y distancia desde
     Izaña, si esta al Sol (sombra 0: todo al Sol, 1: en la umbra), y su
     altura sobre la Tierra y su velocidad */
  function dondeSat(s, fecha, rapido) {
    var pv;
    try { pv = satellite.propagate(s.rec, fecha); } catch (e) { return null; }
    if (!pv || !pv.position || typeof pv.position.x !== 'number' || isNaN(pv.position.x)) return null;
    var gmst = satellite.gstime(fecha), ecf = satellite.eciToEcf(pv.position, gmst);
    var mira = satellite.ecfToLookAngles(observadorGd(), ecf);
    var x = { alt: mira.elevation / RAD, az: (mira.azimuth / RAD + 360) % 360, dist: mira.rangeSat, sol: null, sombra: null, altura: null, vel: null };
    /* en el barrido de los pasos (rapido), bajo los 10 grados solo hace falta la altura */
    if (rapido && x.alt < SAT_MIN_ALT - 1) return x;
    var sombra = satellite.shadowFraction(satellite.sunPos(satellite.jday(fecha)).rsun, pv.position);
    x.sol = sombra < 1; x.sombra = sombra;
    if (rapido) return x;
    var v = pv.velocity;
    x.altura = satellite.eciToGeodetic(pv.position, gmst).height; x.vel = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return x;
  }
  /* con elementos de mas de maxDias (hacia atras o hacia delante) no se
     calcula nada: los pasos dejan de ser fiables */
  function satSirve(s, ms) { return Math.abs(ms - s.epocaMs) <= S.sat.datos.maxDias * 864e5; }
  function satelitesVivos(ms) { return S.sat.datos ? S.sat.datos.sat.filter(function (s) { return satSirve(s, ms); }) : []; }
  /* la ventana de una noche en que el cielo esta oscuro (Sol bajo -6) */
  function ventanaNoche(fecha) {
    var A = Astronomy, o = obs(), t0 = A.MakeTime(instanteLocal(fecha, 12, 0));
    var tarde = A.SearchAltitude(A.Body.Sun, o, -1, t0, 1, SAT_SOL_BAJO);
    var manana = tarde ? A.SearchAltitude(A.Body.Sun, o, +1, tarde, 1, SAT_SOL_BAJO) : null;
    return tarde && manana ? [tarde.date.getTime(), manana.date.getTime()] : null;
  }
  function pasosNoche(fecha) {
    var D = S.sat.datos; if (!D) return [];
    var k = fecha + '|' + D.obtenido;
    if (S.sat.pasos[k]) return S.sat.pasos[k];
    var v = ventanaNoche(fecha), out = [];
    if (v) D.sat.forEach(function (s) { if (satSirve(s, v[0]) && satSirve(s, v[1])) out.push.apply(out, pasosSat(s, v[0], v[1])); });
    out.sort(function (a, b) { return a.max.t - b.max.t; });
    return (S.sat.pasos[k] = out);
  }
  /* el instante, a un segundo, en que `pred` cambia entre a (true) y b (false);
     b puede estar antes o despues de a */
  function afinar(a, b, pred) {
    for (var i = 0; i < 16 && Math.abs(b - a) > 1000; i++) { var m = (a + b) / 2; if (pred(m)) a = m; else b = m; }
    return a;
  }
  function pasosSat(s, ini, fin) {
    var out = [], tramo = [], t, x;
    var arriba = function (ms) { var y = dondeSat(s, new Date(ms), true); return !!y && y.alt >= SAT_MIN_ALT; };
    var visible = function (ms) { var y = dondeSat(s, new Date(ms), true); return !!y && y.alt >= SAT_MIN_ALT && y.sol; };
    function cerrar() {
      var m = tramo; tramo = [];
      var i0 = -1, i1 = -1;
      for (var i = 0; i < m.length; i++) if (m[i].x.sol) { if (i0 < 0) i0 = i; i1 = i; }
      if (i0 < 0) return;
      var desdeSombra = i0 > 0, aSombra = i1 < m.length - 1;
      var tIni = Math.max(ini, desdeSombra ? afinar(m[i0].t, m[i0 - 1].t, visible) : afinar(m[0].t, m[0].t - SAT_PASO_MS, arriba));
      var tFin = Math.min(fin, aSombra ? afinar(m[i1].t, m[i1 + 1].t, visible) : afinar(m[m.length - 1].t, m[m.length - 1].t + SAT_PASO_MS, arriba));
      /* el punto mas alto, a un segundo, alrededor de la muestra mas alta */
      var mej = m[i0]; for (var j = i0; j <= i1; j++) if (m[j].x.alt > mej.x.alt) mej = m[j];
      var tMax = mej.t, altMax = mej.x.alt;
      for (var u = Math.max(tIni, mej.t - SAT_PASO_MS); u <= Math.min(tFin, mej.t + SAT_PASO_MS); u += 1000) { var y = dondeSat(s, new Date(u), true); if (y && y.alt > altMax) { altMax = y.alt; tMax = u; } }
      [tIni, tFin].forEach(function (u) { var y = dondeSat(s, new Date(u), true); if (y && y.alt > altMax) { altMax = y.alt; tMax = u; } });   // el extremo mismo, si sube o baja hasta la sombra
      var punto = function (ms) { var y = dondeSat(s, new Date(ms), true); return { t: new Date(ms), az: y ? y.az : 0, alt: y ? y.alt : 0, dist: y ? y.dist : 0 }; };
      var p = { tipo: 'paso', s: s, t: new Date(tMax), ini: punto(tIni), max: punto(tMax), fin: punto(tFin), desdeSombra: desdeSombra, aSombra: aSombra, dur: (tFin - tIni) / 1000 };
      /* si ya estaba arriba al oscurecer, o sigue arriba al amanecer, se dice asi */
      p.ini.crep = !desdeSombra && tIni === ini; p.fin.crep = !aSombra && tFin === fin;
      if (p.dur >= 20) out.push(p);
    }
    for (t = ini; t <= fin; t += SAT_PASO_MS) {
      x = dondeSat(s, new Date(t), true);
      if (x && x.alt >= SAT_MIN_ALT) tramo.push({ t: t, x: x });
      else if (tramo.length) cerrar();
    }
    if (tramo.length) cerrar();
    return out;
  }
  /* los pasos de las proximas siete noches, para el calendario y los avisos */
  function pasosProximos() {
    if (!S.sat.datos) return [];
    var out = [], hoy = nocheDeHoy();
    for (var i = 0; i < 7; i++) out.push.apply(out, pasosNoche(sumarDias(hoy, i)));
    var limite = Date.now() - 3600000;
    return out.filter(function (p) { return p.fin.t.getTime() > limite; });
  }
  function textoPaso(p) {
    var L = [];
    L.push(T(p.desdeSombra ? 'SatDesdeSombra' : p.ini.crep ? 'SatYaArriba' : 'SatSale', { h: hora(p.ini.t), r: hacia(p.ini.az), alt: numero(p.ini.alt, 0) }));
    L.push(T('SatMax', { h: hora(p.max.t), alt: numero(p.max.alt, 0), r: hacia(p.max.az) }));
    L.push(T(p.aSombra ? 'SatSombra' : p.fin.crep ? 'SatAmanece' : 'SatFin', { h: hora(p.fin.t), r: hacia(p.fin.az) }));
    L.push(T('SatDura', { n: Math.max(1, Math.round(p.dur / 60)) }) + ' · ' + T('SatBrillo' + p.s.clave.charAt(0).toUpperCase() + p.s.clave.slice(1)));
    return L;
  }
  /* la tarjeta de «Esta noche» */
  function tarjetaSatelites(n) {
    var t = tarjeta('🛰️ ' + T('SatTitulo'));
    if (!S.sat.datos) {
      if (S.sat.fallo) { t.appendChild(el('div', 'cielo-item-sub', T('SatSinDatos'))); }
      else { t.appendChild(el('div', 'cielo-item-sub', T('Cargando'))); cargarSatelites().then(function () { if (S.abierto) pintar(); }, function () { if (S.abierto) pintar(); }); }
      return t;
    }
    var v = ventanaNoche(n.fecha), vivos = v ? S.sat.datos.sat.filter(function (s) { return satSirve(s, v[0]) && satSirve(s, v[1]); }) : [];
    var epoca = epocaMasNueva();
    if (!vivos.length) { t.appendChild(el('div', 'cielo-item-sub', T('SatFuera', { f: diaAnio(new Date(epoca)) }))); return t; }
    var lista = pasosNoche(n.fecha);
    if (!lista.length) t.appendChild(el('div', 'cielo-item-sub', T('SatNinguno')));
    lista.forEach(function (p) { t.appendChild(filaPaso(p, true)); });
    t.appendChild(el('div', 'cielo-nota', T('SatElementos', { f: diaAnio(new Date(epoca)) }) + ' ' + T('SatNota')));
    return t;
  }
  function epocaMasNueva() { return Math.max.apply(null, S.sat.datos.sat.map(function (s) { return s.epocaMs; })); }
  function filaPaso(p, conMapa) {
    var it = el('div', 'cielo-item');
    it.appendChild(el('div', 'cielo-item-ico', '🛰️'));
    var tt = el('div', 'cielo-item-txt');
    var nm = el('div', 'cielo-item-nom', nombreSat(p.s)); nm.appendChild(desig(p.s.nombre)); tt.appendChild(nm);
    textoPaso(p).forEach(function (x) { tt.appendChild(el('div', 'cielo-item-sub', x)); });
    var caja = el('div');
    if (conMapa) {
      var bm = el('button', 'cielo-boton', '🗺️ ' + T('VerEnMapa')); bm.type = 'button';
      bm.addEventListener('click', function (ev) { ev.stopPropagation(); irAlMapa({ sat: p.s.clave, t: p.max.t }); });
      caja.appendChild(bm);
    }
    caja.appendChild(botonesAviso(p));
    tt.appendChild(caja);
    it.appendChild(tt);
    var der = el('div', 'cielo-item-der', hora(p.max.t)); it.appendChild(der);
    return it;
  }
  /* en la carta y en «Apunta al cielo»: el punto, su estela de un minuto y
     el nombre; apagado si esta en la sombra de la Tierra (no se ve) */
  function pintarSatelites(ctx, V, P, fecha, dpr, rotulo, dianas) {
    var D = S.sat.datos; if (!D) return;
    var ms = fecha.getTime(), q = [0, 0, 0], fuera = 40 * dpr;
    D.sat.forEach(function (s) {
      if (!satSirve(s, ms)) return;
      var x = dondeSat(s, fecha); if (!x || x.alt < -0.5) return;
      if (!P(enuDe(x.alt, x.az), q) || q[0] < -fuera || q[1] < -fuera || q[0] > V.W + fuera || q[1] > V.H + fuera) return;
      var qx = q[0], qy = q[1], luz = x.sol ? 1 : 0.35;
      /* la estela: los 60 segundos anteriores, cada 10 */
      ctx.save(); ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(170,235,255,' + (0.5 * luz).toFixed(2) + ')'; ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath(); var ant = null;
      for (var k = 60; k >= 0; k -= 10) {
        var y = dondeSat(s, new Date(ms - k * 1000), true); if (!y || y.alt < -1) { ant = null; continue; }
        var r = [0, 0, 0]; if (!P(enuDe(y.alt, y.az), r)) { ant = null; continue; }
        if (ant && Math.abs(r[0] - ant[0]) < V.W && Math.abs(r[1] - ant[1]) < V.H) ctx.lineTo(r[0], r[1]); else ctx.moveTo(r[0], r[1]);
        ant = r;
      }
      ctx.stroke();
      if (x.sol) { var gg = ctx.createRadialGradient(qx, qy, 0, qx, qy, 7 * dpr); gg.addColorStop(0, 'rgba(220,245,255,0.9)'); gg.addColorStop(1, 'rgba(220,245,255,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(qx, qy, 7 * dpr, 0, 2 * Math.PI); ctx.fill(); }
      ctx.fillStyle = x.sol ? '#eafaff' : 'rgba(234,250,255,0.4)';
      ctx.beginPath(); ctx.arc(qx, qy, 2.4 * dpr, 0, 2 * Math.PI); ctx.fill();
      ctx.restore();
      rotulo(nombreSat(s), qx + 7 * dpr, qy - 5 * dpr, 10, x.sol ? 'rgba(200,240,255,0.95)' : 'rgba(200,240,255,0.5)', 0.5, false, '600 ');
      dianas.push({ x: qx, y: qy, r: 6 * dpr, prio: -0.5, sel: { sat: s.clave } });
    });
  }
  /* la ficha de un satelite */
  function cosaSat(sel) {
    var s = satPorClave(sel.sat);
    if (!s) return { id: 's' + sel.sat, tipo: 'punto', nombre: sel.sat, des: '', tipoTxt: '', con: null, ico: '🛰️', sel: sel, wp: [] };
    return { id: 's' + s.clave, tipo: 'satelite', sat: s, nombre: nombreSat(s), des: s.nombre, tipoTxt: T('TipoSatelite'), con: null, ico: '🛰️', sel: sel, wp: SAT_WP[s.clave] || [] };
  }
  function datosSat(c, fecha, L) {
    var s = c.sat, x = satSirve(s, fecha.getTime()) ? dondeSat(s, fecha) : null;
    if (x) {
      L.push(T('FichaOrbita', { h: numero(Math.round(x.altura), 0), v: numero(x.vel, 1) }));
      if (x.alt > 0) L.push(T('FichaDistSat', { d: numero(Math.round(x.dist), 0) }));
      if (x.alt > 0 && !x.sol) L.push(T('SatEnSombra'));
    }
    L.push(T('SatBrillo' + s.clave.charAt(0).toUpperCase() + s.clave.slice(1)));
    var prox = pasosProximos().filter(function (p) { return p.s === s && p.fin.t > fecha; })[0];
    L.push(prox ? T('FichaProximoPaso', { f: dia(prox.max.t), h: hora(prox.ini.t), alt: numero(prox.max.alt, 0) }) : T('FichaSinPaso'));
    L.push(T('SatElementos', { f: diaAnio(new Date(s.epocaMs)) }));
  }
  function buscablesSat() {
    if (!S.sat.datos) return [];
    return satelitesVivos(Date.now()).map(function (s) { return { sel: { sat: s.clave }, nombre: nombreSat(s), des: s.nombre, ico: '🛰️' }; });
  }

  /* ── LA NOCHE GUIADA, EL SISTEMA SOLAR HOY, LA LUZ ROJA COMPLETA Y «SIN
     RED EN EL TEIDE» (21-10-2026, tercer bloque) ──────────────────────────
     Lo que las reseñas de las apps del cielo piden despues de la Estacion
     (APPS-DEL-CIELO-COMPETENCIA.md): «los principiantes no saben donde
     mirar», una vista del sistema solar que «deja soñar», la luz roja que
     no este escondida ni deslumbre, y poder fiarse de la app sin cobertura.
       · La noche guiada: paradas calculadas de la noche real a una hora de
         referencia (ahora, si es de noche; si no, media hora despues de la
         noche cerrada): la Luna si esta, los planetas mas brillantes, tres
         estrellas con nombre, lo mejor a simple vista, la Via Lactea sin
         Luna, el primer paso de satelite y la lluvia activa. «Llevame» abre
         «Apunta al cielo» con la flecha puesta en esa parada.
       · El sistema solar: las posiciones heliocentricas de Astronomy Engine
         (HelioVector, en la ecliptica J2000, vistas desde el norte), las
         orbitas muestreadas del motor a lo largo de una vuelta, la noche de
         la Tierra y Tenerife sobre ella (ObserverVector). Nada dibujado a
         ojo: tools/auditar_cielo.js (parte 12) coteja cada posicion con los
         elementos keplerianos de la JPL (Standish), calculados aparte.
       · La luz roja: el regulador de brillo (panel y vista), la barra del
         sistema en rojo (theme-color) y el aviso, una vez, al abrir de noche.
       · Sin red: el aviso de lo que falta sin cobertura, y la comprobacion
         de que los ficheros del panel estan en la cache del movil. */

  /* ── LA NOCHE GUIADA ─────────────────────────────────────────────── */
  /* el instante de referencia: ahora si es de noche (Sol bajo -6); si no,
     media hora despues de empezar la noche cerrada (Sol bajo -18) */
  function instanteGuia(n) {
    var ahora = Date.now(), ini = n.civilT.date.getTime(), fin = n.civilM.date.getTime();
    if (ahora >= ini && ahora <= fin) return new Date(Math.floor(ahora / 60000) * 60000);
    return new Date(Math.min(n.oscuro.date.getTime() + 30 * 60000, fin - 60000));
  }
  function lluviaActiva(t) {
    var A = Astronomy, D = S.datos, lon = A.SunPosition(t).elon, mejor = null;
    (D.lluvias || []).forEach(function (l) {
      var dentro = l.ini <= l.fin ? (lon >= l.ini && lon <= l.fin) : (lon >= l.ini || lon <= l.fin);
      if (!dentro) return;
      var d = Math.abs(((lon - l.l + 540) % 360) - 180);
      if (!mejor || d < mejor.d) mejor = { l: l, d: d };
    });
    return mejor ? mejor.l : null;
  }
  function paradasGuia(n) {
    var A = Astronomy, D = S.datos, tg = instanteGuia(n), t = A.MakeTime(tg), I = instante(tg), out = [];
    var donde = function (sel) { var e = vectorSel(sel, I); return e ? altAzDe(e) : null; };
    /* la Luna, si esta arriba y da algo de luz */
    var hl = donde({ planeta: 'Moon' }), ilum = A.Illumination(A.Body.Moon, t).phase_fraction;
    if (hl && hl.alt > 5 && ilum > 0.05) {
      out.push({ clave: 'luna', sel: { planeta: 'Moon' }, ico: '🌙', nombre: nom(CIELO_CUERPO, 'Moon'),
                 sub: nombreFase(A.MoonPhase(t)) + ' · ' + T('Iluminada', { p: numero(ilum * 100, 0) }), que: T('GuiaLuna'), h: hl });
    }
    /* los planetas que se ven a simple vista, del mas brillante al menos */
    var pl = [];
    PLANETAS.forEach(function (p) {
      var h = donde({ planeta: p }); if (!h || h.alt < 10) return;
      var m = A.Illumination(A.Body[p], t).mag; if (m > 2) return;
      pl.push({ p: p, m: m, h: h });
    });
    pl.sort(function (a, b) { return a.m - b.m; });
    var QUE = { Venus: 'GuiaVenus', Mars: 'GuiaMarte', Jupiter: 'GuiaJupiter', Saturn: 'GuiaSaturno', Mercury: 'GuiaMercurio' };
    pl.forEach(function (x) {
      out.push({ clave: 'planeta', p: x.p, sel: { planeta: x.p }, ico: ICONO_PLANETA[x.p], nombre: nom(CIELO_CUERPO, x.p),
                 sub: T('TipoPlaneta') + ' · ' + T('EnCon', { c: nombreCon(constelacionDe(A.Body[x.p], t)) }),
                 que: T(QUE[x.p] || 'GuiaPlanetaLuz'), h: x.h });
    });
    /* tres estrellas con nombre, las mas brillantes que esten altas */
    var es = [];
    D.estrellas.forEach(function (e) { var h = donde({ k: 'est', rec: e }); if (h && h.alt >= 15) es.push({ e: e, h: h }); });
    es.sort(function (a, b) { return a.e.m - b.e.m; });
    es.slice(0, 3).forEach(function (x) {
      var e = x.e, luz = e.al ? (e.al < 100 ? T('FichaLuzAnio', { n: distancia(e.al), y: String(Math.round(anioLocal(tg) - e.al)) }) : T('FichaLuzUnos', { n: distancia(e.al) })) : '';
      out.push({ clave: 'estrella', sel: { k: 'est', rec: e }, ico: '⭐', nombre: nombreEstrella(e.h) || e.n, des: e.b || '',
                 sub: T('TipoEstrella') + ' · ' + T('EnCon', { c: nombreCon(e.c) }), que: luz, h: x.h });
    });
    /* lo mejor a simple vista que este alto a esa hora */
    var mj = mejoresNoche(n)[1] || [], no = 0;
    mj.forEach(function (x) {
      if (no >= 2) return;
      var h = donde({ k: x.k, rec: x.o }); if (!h || h.alt < 20) return;
      var esDob = x.k === 'dob', o = x.o, nomTxt = esDob ? nombreDoble(o) : nombreObjeto(o), desTxt = esDob ? o.b : designacionObjeto(o);
      var desc = nom(CIELO_DESC, esDob ? 'd-' + o.id : o.id);
      out.push({ clave: 'objeto', sel: { k: x.k, rec: o }, ico: esDob ? '⚪' : (ICONO[o.t] || '✨'), nombre: nomTxt || desTxt, des: nomTxt ? desTxt : '',
                 sub: (esDob ? T('TipoDoble') : nom(CIELO_TIPO, o.t)) + ' · ' + T('EnCon', { c: nombreCon(o.c) }), que: desc || T('GuiaObjeto'), h: h });
      no++;
    });
    /* la Via Lactea: el centro alto y sin Luna que moleste a esa hora */
    var vl = viaLacteaNoche(n);
    if (vl.mejor) {
      var hv = aHorizonte(I.rot, CENTRO_GALAXIA), conLuna = hl && hl.alt > 0 && ilum > 0.25;
      if (hv.alt >= 10 && !conLuna) out.push({ clave: 'via', sel: { con: 'Sgr' }, ico: '🌌', nombre: T('ViaLactea'), sub: T('EnCon', { c: nombreCon('Sgr') }), que: T('GuiaVia', { dir: hacia(hv.az) }), h: hv });
    }
    /* el primer paso de satelite que quede por venir esa noche */
    if (S.sat.datos) {
      var paso = pasosNoche(n.fecha).filter(function (p) { return p.fin.t.getTime() > tg.getTime(); })[0];
      if (paso) out.push({ clave: 'paso', sel: { sat: paso.s.clave }, ico: '🛰️', nombre: nombreSat(paso.s), des: paso.s.nombre, sub: hora(paso.ini.t) + ' – ' + hora(paso.fin.t),
                           que: T('GuiaPaso', { s: nombreSat(paso.s), h1: hora(paso.ini.t), r1: hacia(paso.ini.az), h2: hora(paso.fin.t), r2: hacia(paso.fin.az) }),
                           h: { alt: paso.max.alt, az: paso.max.az }, t: paso.max.t });
    }
    /* la lluvia de estrellas activa: con el radiante a mas de 10 grados, ya
       o mas tarde esa misma noche (entonces la parada lleva su hora) */
    var ll = lluviaActiva(t);
    if (ll) {
      var vr = unitario(ll.ra, ll.dec), hr = aHorizonte(I.rot, vr), cr = conDe(ll.ra, ll.dec), tr = null;
      if (hr.alt < 10) {
        for (var ms = tg.getTime() + 600000; ms <= n.civilM.date.getTime(); ms += 600000) {
          var h2 = aHorizonte(rotacion(A.MakeTime(new Date(ms))), vr);
          if (h2.alt >= 10) { tr = new Date(ms); hr = h2; break; }
        }
      }
      if (hr.alt >= 10) out.push({ clave: 'lluvia', sel: { v: vr, nombre: nom(CIELO_LLU, ll.id) }, ico: '🌠', nombre: nom(CIELO_LLU, ll.id), des: ll.id,
                                   sub: cr ? T('EnCon', { c: nombreCon(cr) }) : '', que: T('GuiaLluvia', { n: nom(CIELO_LLU, ll.id), c: cr ? nombreCon(cr) : '' }), h: hr, t: tr || undefined });
    }
    return out.slice(0, 8);
  }
  /* la carta en una parada: lo que irAlMapa sabe abrir */
  function irAlMapaSel(sel, t) {
    if (sel.planeta) return irAlMapa({ planeta: sel.planeta, t: t });
    if (sel.sat) return irAlMapa({ sat: sel.sat, t: t });
    if (sel.con) return irAlMapa({ con: sel.con, t: t });
    var c = cosaDe(sel, t);
    irAlMapa({ v: c.v || sel.v, nombre: c.nombre, des: c.des, k: sel.k, rec: sel.rec, t: t });
  }
  function tarjetaGuia(n) {
    /* mientras se lee en voz alta, la tarjeta ensena las paradas que se leen
       (las del momento en que se toco «Leer en voz alta»), no otras */
    var vivo = vozViva(), t = tarjeta('🌠 ' + T('GuiaNoche'));
    var tg = vivo ? VOZ.tg : instanteGuia(n), P = vivo ? VOZ.P : paradasGuia(n);
    t.id = 'cielo-guia';
    if (!P.length) { t.appendChild(el('div', 'cielo-item-sub', T('GuiaNada'))); return t; }
    t.appendChild(el('p', 'cielo-p', T('GuiaIntro', { n: P.length, t: hora(tg) })));
    var cv = cajaVoz(); if (cv) t.appendChild(cv);
    P.forEach(function (p, i) {
      var it = el('div', 'cielo-item cielo-parada' + (vivo && i === VOZ.i ? ' cielo-parada-activa' : ''));
      it.setAttribute('data-parada', String(i));
      it.appendChild(el('div', 'cielo-item-ico', p.ico));
      var tt = el('div', 'cielo-item-txt');
      tt.appendChild(el('div', 'cielo-parada-n', T('GuiaParada', { i: i + 1, n: P.length })));
      var nm = el('div', 'cielo-item-nom', p.nombre); if (p.des && p.des !== p.nombre) nm.appendChild(desig(p.des)); tt.appendChild(nm);
      if (p.sub) tt.appendChild(el('div', 'cielo-item-sub', p.sub));
      tt.appendChild(el('div', 'cielo-item-sub', T('FichaArriba', { t: hora(p.t || tg), alt: numero(p.h.alt, 0), dir: hacia(p.h.az) })));
      if (p.que) tt.appendChild(el('div', 'cielo-item-sub cielo-parada-que', p.que));
      var caja = el('div', 'cielo-aviso-btns');
      var b1 = el('button', 'cielo-boton', '🧭 ' + T('GuiaLlevame')); b1.type = 'button';
      b1.addEventListener('click', function (ev) { ev.stopPropagation(); abrirVista({ objetivo: p.sel }); });
      var b2 = el('button', 'cielo-boton', '🗺️ ' + T('VerEnMapa')); b2.type = 'button';
      b2.addEventListener('click', function (ev) { ev.stopPropagation(); irAlMapaSel(p.sel, p.t || tg); });
      caja.appendChild(b1); caja.appendChild(b2); tt.appendChild(caja);
      it.appendChild(tt);
      t.appendChild(it);
    });
    t.appendChild(el('div', 'cielo-nota', T('GuiaNota')));
    return t;
  }

  /* ── LA NOCHE GUIADA EN VOZ ALTA (22-10-2026, septimo bloque) ──────
     El movil lee cada parada con sus propias voces (speechSynthesis), con el
     mismo lector que lee los lugares (index.html, AUDIO-GUIA: TG_VOZ da el
     codigo de idioma de cada idioma de la app y la voz que le toca). Solo
     voces instaladas en el dispositivo (localService): asi se lee sin red y
     el texto no sale del movil; sin ninguna para el idioma, la nota de como
     instalarla y no el boton. Se oye lo mismo que pone la tarjeta (la
     parada, el nombre, la clase, donde mirar, lo que se ve) y cuatro filas
     que solo se oyen: VozIntro, VozHoraParada, VozDonde y VozFin. Tras cada
     parada, VOZ_PAUSA segundos para buscarla en el cielo; «Pausa» la detiene
     y «Seguir» la vuelve a leer. Se para al cerrar el panel, al cambiar de
     noche o de idioma; se pausa al abrir «Apunte al cielo», al salir de
     «Esta noche» o si la pagina deja de verse. Mientras lee, la pantalla no
     se apaga (Wake Lock): con la pantalla apagada el movil deja de leer.
     Estados: parado, hablando (la intro, una parada o el final), esperando
     (la cuenta atras) y pausa. Cada corte (pausa, siguiente, parar) cambia
     la sesion, y lo que llegue de una frase vieja se ignora. */
  var VOZ_PAUSA = 30, VOZ_VIGIA = 10000;
  var VOZ = { estado: 'parado', i: -1, P: null, tg: null, fecha: null, lang: null, sesion: 0, u: null,
              cuenta: 0, reloj: null, vigia: null, cortado: 0, bloqueo: null, pidiendo: false, fallo: false };
  function vozViva() { return VOZ.estado !== 'parado' && !!VOZ.P && VOZ.fecha === S.fecha && VOZ.lang === lang(); }
  /* null: el navegador no sabe leer en voz alta (nada que ensenar); false:
     sabe, pero no hay voz instalada para el idioma; true: hay, o aun no ha
     dicho cuales tiene (Safari las da tarde) y se intenta */
  function vozHay() {
    var V = window.TG_VOZ;
    if (!V || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return null;
    try { return !V.hayVoces() || !!V.vozLocal(lang()); } catch (e) { return null; }
  }
  /* las partes de lo que se lee, frase a frase: sin emojis, «·» como coma, y
     cada una con mayuscula y su punto (en chino, «。» y sin espacios) */
  var VOZ_EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;
  function vozFrases(partes) {
    var zh = VOZ.lang === 'zh' || VOZ.lang === 'zht';
    return partes.map(function (s) { return String(s || '').replace(VOZ_EMOJI, '').replace(/\s+/g, ' ').trim(); }).filter(Boolean).map(function (s) {
      s = s.replace(/\s*·\s*/g, zh ? '，' : ', ');
      s = s.charAt(0).toLocaleUpperCase(loc()) + s.slice(1);
      return /[.!?…。！？]$/.test(s) ? s : s + (zh ? '。' : '.');
    }).join(zh ? '' : ' ');
  }
  function vozTextoIntro() { return vozFrases([T('VozIntro', { n: VOZ.P.length, t: hora(VOZ.tg) })]); }
  /* una parada: «Parada 2 de 6. Júpiter. Planeta, en Géminis. Mire hacia el
     este, a 40 grados sobre el horizonte. Con unos prismáticos…». El paso de
     un satelite no lee su franja de horas (ya va en lo que se ve); el paso y
     la lluvia que sube mas tarde dicen antes su hora. */
  function vozTextoParada(p, i, total) {
    return vozFrases([
      T('GuiaParada', { i: i + 1, n: total }),
      p.nombre,
      p.clave === 'paso' ? '' : p.sub,
      p.t ? T('VozHoraParada', { t: hora(p.t) }) : '',
      T('VozDonde', { r: hacia(p.h.az), n: Math.round(p.h.alt) }),
      p.que
    ]);
  }
  function vozCortar() {
    VOZ.sesion++;
    clearInterval(VOZ.reloj); VOZ.reloj = null; clearTimeout(VOZ.vigia); VOZ.vigia = null;
    if (VOZ.u) { VOZ.u = null; VOZ.cortado = performance.now(); try { window.speechSynthesis.cancel(); } catch (e) {} }
  }
  /* una frase y, cuando acaba, luego(). Si otro la corta (el lector de los
     lugares, el sistema), se queda en pausa; si falla o no empieza en
     VOZ_VIGIA ms, se para con el aviso. Justo despues de cortar una frase
     («Siguiente» mientras lee), la nueva espera un momento: hablar en el
     mismo instante del cancel() puede perderse. La primera (el toque en
     «Leer en voz alta») va en el acto, que Safari solo deja empezar a leer
     dentro del toque. */
  function vozDecir(txt, luego) {
    var s = window.speechSynthesis, V = window.TG_VOZ, ses = VOZ.sesion, u, v = null, empezo = false;
    try { v = V.vozLocal(VOZ.lang); if (!v && V.hayVoces()) { vozParar(); return; } } catch (e) {}
    try { u = new window.SpeechSynthesisUtterance(txt); } catch (e2) { vozFallo(); return; }
    u.lang = V.locale(VOZ.lang); if (v) u.voice = v; u.rate = 0.95;
    u.onstart = function () { empezo = true; };
    u.onend = function () { if (ses !== VOZ.sesion || VOZ.u !== u) return; VOZ.u = null; clearTimeout(VOZ.vigia); luego(); };
    u.onerror = function (e) {
      if (ses !== VOZ.sesion || VOZ.u !== u) return;
      VOZ.u = null; clearTimeout(VOZ.vigia);
      var er = e && e.error;
      if (er === 'interrupted' || er === 'canceled') vozPausar(); else vozFallo();
    };
    VOZ.u = u;
    clearTimeout(VOZ.vigia);
    VOZ.vigia = setTimeout(function () {
      var habla = false; try { habla = !!s.speaking; } catch (e4) {}
      if (ses === VOZ.sesion && VOZ.u === u && !empezo && !habla) vozFallo();
    }, VOZ_VIGIA);
    var hablar = function () { try { s.speak(u); } catch (e3) { vozFallo(); } };
    try { if (s.speaking || s.pending) s.cancel(); } catch (e5) {}
    if (VOZ.cortado && performance.now() - VOZ.cortado < 250) setTimeout(function () { if (ses === VOZ.sesion && VOZ.u === u) hablar(); }, 150);
    else hablar();
  }
  function vozEmpezar() {
    if (!vozHay()) { repintarVoz(); return; }
    vozCortar();
    var n = noche();
    VOZ.P = paradasGuia(n); VOZ.tg = instanteGuia(n); VOZ.fecha = S.fecha; VOZ.lang = lang(); VOZ.fallo = false;
    if (!VOZ.P.length) return;
    /* lo que este leyendo el lector de los lugares, fuera */
    try { var s = window.speechSynthesis; if (s.speaking || s.pending) window.TG_VOZ.parar(); } catch (e) {}
    VOZ.estado = 'hablando'; VOZ.i = -1;
    repintarGuia();
    vozDespierto(true);
    vozIntro();
  }
  function vozIntro() {
    VOZ.i = -1; VOZ.estado = 'hablando'; repintarVoz();
    vozDecir(vozTextoIntro(), function () { vozParada(0); });
  }
  function vozParada(i) {
    var P = VOZ.P;
    if (i >= P.length) { vozFin(); return; }
    VOZ.i = i; VOZ.estado = 'hablando'; repintarVoz(true);
    vozDecir(vozTextoParada(P[i], i, P.length), function () { if (i >= P.length - 1) vozFin(); else vozEsperar(); });
  }
  function vozFin() {
    VOZ.i = VOZ.P.length; VOZ.estado = 'hablando'; repintarVoz();
    vozDecir(vozFrases([T('VozFin')]), function () { vozParar(); });
  }
  function vozEsperar() {
    var ses = VOZ.sesion;
    VOZ.estado = 'esperando'; VOZ.cuenta = VOZ_PAUSA; repintarVoz();
    VOZ.reloj = setInterval(function () {
      if (ses !== VOZ.sesion) return;
      VOZ.cuenta--;
      if (VOZ.cuenta > 0) { var e = document.getElementById('cielo-voz-estado'); if (e) e.textContent = vozEstadoTxt(); return; }
      clearInterval(VOZ.reloj); VOZ.reloj = null;
      vozParada(VOZ.i + 1);
    }, 1000);
  }
  function vozPausar() {
    if (VOZ.estado !== 'hablando' && VOZ.estado !== 'esperando') return;
    vozCortar(); VOZ.estado = 'pausa'; vozDespierto(false); repintarVoz();
  }
  /* seguir vuelve a leer la parada en la que se paro (o la intro) */
  function vozSeguir() {
    if (VOZ.estado !== 'pausa') return;
    vozCortar(); vozDespierto(true);
    if (VOZ.i < 0) vozIntro(); else vozParada(VOZ.i);
  }
  function vozSiguiente() {
    if (VOZ.estado === 'parado') return;
    vozCortar(); vozDespierto(true);
    vozParada(VOZ.i + 1);
  }
  function vozParar() {
    var habia = VOZ.estado !== 'parado';
    vozCortar(); VOZ.estado = 'parado'; VOZ.i = -1; vozDespierto(false);
    if (habia) repintarVoz();
  }
  function vozFallo() { VOZ.fallo = true; vozParar(); repintarVoz(); }
  /* la pantalla encendida mientras lee: con ella apagada, el movil deja de leer */
  function vozDespierto(si) {
    try {
      if (si && !VOZ.bloqueo && !VOZ.pidiendo && navigator.wakeLock && navigator.wakeLock.request) {
        VOZ.pidiendo = true;
        navigator.wakeLock.request('screen').then(function (l) {
          VOZ.pidiendo = false;
          if (VOZ.estado === 'hablando' || VOZ.estado === 'esperando') VOZ.bloqueo = l; else l.release().catch(function () {});
        }, function () { VOZ.pidiendo = false; });
      }
      if (!si && VOZ.bloqueo) { VOZ.bloqueo.release().catch(function () {}); VOZ.bloqueo = null; }
    } catch (e) {}
  }
  function vozEstadoTxt() {
    var n = VOZ.P ? VOZ.P.length : 0;
    if (VOZ.estado === 'pausa') return '⏸️ ' + T('VozEnPausa');
    if (VOZ.estado === 'esperando') return '⏳ ' + T('VozEspera', { s: VOZ.cuenta });
    if (VOZ.i >= 0 && VOZ.i < n) return '🔊 ' + T('GuiaParada', { i: VOZ.i + 1, n: n });
    return '';                                     // la intro y el final: nada que contar
  }
  /* los botones, encima de las paradas */
  function cajaVoz() {
    var hay = vozHay();
    if (hay === null) return null;
    var c = el('div', 'cielo-voz'), b = el('div', 'cielo-voz-btns');
    c.id = 'cielo-voz';
    var boton = function (txt, que, fn) {
      var x = el('button', 'cielo-boton', txt); x.type = 'button'; x.setAttribute('data-voz', que);
      x.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
      b.appendChild(x);
    };
    if (VOZ.estado === 'parado') {
      if (!hay) { c.appendChild(el('div', 'cielo-nota', '🔇 ' + T('VozSinVoz'))); return c; }
      boton('🔊 ' + T('VozLeer'), 'leer', vozEmpezar);
      c.appendChild(b);
      if (VOZ.fallo) c.appendChild(el('div', 'cielo-voz-estado', '⚠️ ' + T('VozFallo')));
      c.appendChild(el('div', 'cielo-nota', T('VozNota', { s: VOZ_PAUSA })));
      return c;
    }
    if (VOZ.estado === 'pausa') boton('▶️ ' + T('VozSeguir'), 'seguir', vozSeguir);
    else boton('⏸️ ' + T('VozPausa'), 'pausa', vozPausar);
    if (VOZ.i < VOZ.P.length - 1) boton('⏭️ ' + T('VozSiguiente'), 'siguiente', vozSiguiente);
    boton('⏹️ ' + T('VozParar'), 'parar', vozParar);
    c.appendChild(b);
    var et = vozEstadoTxt();
    if (et) { var st = el('div', 'cielo-voz-estado', et); st.id = 'cielo-voz-estado'; c.appendChild(st); }
    return c;
  }
  /* los botones y la parada que se lee, sin repintar la pestana entera */
  function repintarVoz(desplazar) {
    var g = document.getElementById('cielo-guia'); if (!g) return;
    var vieja = document.getElementById('cielo-voz'), nueva = cajaVoz();
    if (vieja && nueva) vieja.parentNode.replaceChild(nueva, vieja);
    var activa = VOZ.estado !== 'parado' ? VOZ.i : -1;
    [].forEach.call(g.querySelectorAll('.cielo-parada'), function (it) {
      var si = Number(it.getAttribute('data-parada')) === activa;
      it.classList.toggle('cielo-parada-activa', si);
      if (si && desplazar) { try { it.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }
    });
  }
  /* la tarjeta entera, con las paradas que se van a leer */
  function repintarGuia() {
    var g = document.getElementById('cielo-guia'); if (!g || !S.datos) return;
    try { g.parentNode.replaceChild(tarjetaGuia(noche()), g); } catch (e) {}
  }

  /* ── EL SISTEMA SOLAR HOY ─────────────────────────────────────────
     Las posiciones salen de Astronomy Engine (HelioVector: heliocentricas,
     ecuador J2000) giradas a la ecliptica J2000 (Rotation_EQJ_ECL) y vistas
     desde el norte: la x hacia el punto Aries, la y a 90 grados en el
     sentido de la marcha. Las orbitas se muestrean del propio motor a lo
     largo de una vuelta (el periodo sideral de cada planeta, NASA Planetary
     Fact Sheet, solo marca el tramo que se muestrea: 72 puntos). */
  var SIS_CUERPOS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  var SIS_PERIODO = { Mercury: 87.969, Venus: 224.701, Earth: 365.256, Mars: 686.980, Jupiter: 4332.589, Saturn: 10759.22, Uranus: 30685.4, Neptune: 60189 };
  var SIS_COLOR = { Mercury: '#b9b1a7', Venus: '#ead9a4', Earth: '#4b8fe6', Mars: '#e2774a', Jupiter: '#d8b48c', Saturn: '#e6cf92', Uranus: '#9cd9e7', Neptune: '#5f7de0' };
  var SIS_RADIO = { int: { Mercury: 3, Venus: 4.4, Earth: 4.6, Mars: 3.6, Jupiter: 2, Saturn: 2, Uranus: 2, Neptune: 2 }, ext: { Mercury: 1.6, Venus: 1.8, Earth: 2, Mars: 1.7, Jupiter: 6, Saturn: 5.4, Uranus: 4.2, Neptune: 4.1 } };
  var SIS_ALCANCE = { int: 1.75, ext: 31.5 };   // UA que caben en el radio del lienzo (afelio de Marte 1,67; de Neptuno 30,3)
  function nombreCuerpoSis(b) { return b === 'Earth' ? T('Tierra') : nom(CIELO_CUERPO, b); }
  var ROT_ECL = null;
  function eclipticaJ2000(v) { ROT_ECL = ROT_ECL || Astronomy.Rotation_EQJ_ECL(); var e = Astronomy.RotateVector(ROT_ECL, v); return { x: e.x, y: e.y, z: e.z }; }
  /* las posiciones heliocentricas (UA, ecliptica J2000) y la direccion de
     Tenerife desde el centro de la Tierra, para un instante */
  function sistemaEn(fecha) {
    var A = Astronomy, t = A.MakeTime(fecha), out = { t: fecha, cuerpos: {} };
    SIS_CUERPOS.forEach(function (b) {
      var p = eclipticaJ2000(A.HelioVector(A.Body[b], t));
      p.r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z); p.lon = (Math.atan2(p.y, p.x) / RAD + 360) % 360;
      out.cuerpos[b] = p;
    });
    try { var o = eclipticaJ2000(A.ObserverVector(t, obs(), false)); out.obs = { x: o.x, y: o.y }; } catch (e) { out.obs = null; }
    return out;
  }
  function orbitaDe(b) {
    S.sis.orbitas = S.sis.orbitas || {};
    if (S.sis.orbitas[b]) return S.sis.orbitas[b];
    var A = Astronomy, t0 = A.MakeTime(new Date()), P = SIS_PERIODO[b], pts = [];
    for (var i = 0; i <= 72; i++) { var p = eclipticaJ2000(A.HelioVector(A.Body[b], t0.AddDays(P * i / 72))); pts.push([p.x, p.y]); }
    return (S.sis.orbitas[b] = pts);
  }
  function tiempoSistema() {
    if (S.sis.base !== S.fecha || !S.sis.t) { S.sis.base = S.fecha; S.sis.t = instanteGuia(noche()).getTime(); S.sis.corre = false; }
    return new Date(S.sis.t);
  }
  function pintarSistema(cv) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth || 320;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(W * dpr); }
    var ctx = cv.getContext('2d'), w = cv.width, c = w / 2, vista = S.sis.vista, esc = (c - 16 * dpr) / SIS_ALCANCE[vista];
    var fecha = tiempoSistema(), sis = sistemaEn(fecha);
    var px = function (x) { return c + x * esc; }, py = function (y) { return c - y * esc; };
    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = '#04060f'; ctx.fillRect(0, 0, w, w);
    /* las orbitas */
    SIS_CUERPOS.forEach(function (b) {
      var pts = orbitaDe(b);
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(px(p[0]), py(p[1])); else ctx.moveTo(px(p[0]), py(p[1])); });
      ctx.strokeStyle = b === S.sis.sel ? 'rgba(245,199,107,0.55)' : 'rgba(255,255,255,0.13)'; ctx.lineWidth = (b === S.sis.sel ? 1.4 : 0.8) * dpr; ctx.stroke();
    });
    /* el Sol */
    var rs = (vista === 'int' ? 9 : 5) * dpr, g = ctx.createRadialGradient(c, c, 0, c, c, rs * 3);
    g.addColorStop(0, 'rgba(255,230,150,0.55)'); g.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, rs * 3, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#ffd56a'; ctx.beginPath(); ctx.arc(c, c, rs, 0, 2 * Math.PI); ctx.fill();
    /* la linea de mira desde la Tierra al planeta elegido */
    var T0 = sis.cuerpos.Earth;
    if (S.sis.sel && S.sis.sel !== 'Earth') {
      var q = sis.cuerpos[S.sis.sel];
      ctx.save(); ctx.setLineDash([4 * dpr, 4 * dpr]); ctx.strokeStyle = 'rgba(245,199,107,0.7)'; ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.moveTo(px(T0.x), py(T0.y)); ctx.lineTo(px(q.x), py(q.y)); ctx.stroke(); ctx.restore();
    }
    /* los planetas */
    S.sis.dianas = [];
    var nombres = [], bolas = [];
    SIS_CUERPOS.forEach(function (b) {
      var p = sis.cuerpos[b], x = px(p.x), y = py(p.y), r = SIS_RADIO[vista][b] * dpr;
      if (b === 'Saturn') { ctx.save(); ctx.strokeStyle = 'rgba(230,207,146,0.8)'; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); ctx.ellipse(x, y, r * 2.1, r * 0.75, -0.4, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = SIS_COLOR[b]; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
      if (b === 'Earth' && r >= 3.5 * dpr) {
        /* la noche: la mitad que mira al lado contrario del Sol */
        var a = Math.atan2(-p.y, p.x);
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.arc(x, y, r, a - Math.PI / 2, a + Math.PI / 2); ctx.closePath(); ctx.fill();
        if (sis.obs) { var ao = Math.atan2(-sis.obs.y, sis.obs.x); ctx.fillStyle = '#F5C76B'; ctx.beginPath(); ctx.arc(x + r * Math.cos(ao), y + r * Math.sin(ao), 1.6 * dpr, 0, 2 * Math.PI); ctx.fill(); }
      }
      if (b === S.sis.sel) { ctx.strokeStyle = 'rgba(245,199,107,0.9)'; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); ctx.arc(x, y, r + 4 * dpr, 0, 2 * Math.PI); ctx.stroke(); }
      var conNombre = vista === 'int' ? ['Mercury', 'Venus', 'Earth', 'Mars'].indexOf(b) >= 0 : ['Earth', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].indexOf(b) >= 0;
      if (conNombre) nombres.push({ b: b, x: x, y: y, r: r });
      var ra = b === 'Saturn' ? r * 2.1 : r;   // Saturno, con su anillo
      bolas.push({ b: b, l: x - ra, r: x + ra, t: y - ra, d: y + ra });
      S.sis.dianas.push({ b: b, x: x / dpr, y: y / dpr });
    });
    /* el punto Aries, para quien sepa leerlo */
    ctx.font = (9 * dpr) + 'px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText('♈︎ →', w - 30 * dpr, c - 4 * dpr);
    var fijos = [{ l: w - 30 * dpr, r: w - 30 * dpr + ctx.measureText('♈︎ →').width, t: c - 13 * dpr, d: c - 2 * dpr },
      { l: c - rs, r: c + rs, t: c - rs, d: c + rs }];
    /* los nombres, sin pisarse (21-10-2026: en la vista exterior Jupiter caia
       encima de la Tierra, y Saturno de Neptuno): a la derecha, o a la
       izquierda cerca del borde, como siempre; si ahi pisa otro nombre, otro
       planeta, el Sol o Aries, arriba, abajo o al otro lado. La Tierra y el
       elegido, los primeros. */
    ctx.font = (10 * dpr) + 'px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.82)';
    var choca = function (a, z) { return a.l < z.r && z.l < a.r && a.t < z.d && z.t < a.d; };
    var puestas = [];
    nombres.sort(function (a, z) { var pa = a.b === 'Earth' ? 0 : a.b === S.sis.sel ? 1 : 2, pz = z.b === 'Earth' ? 0 : z.b === S.sis.sel ? 1 : 2; return pa - pz; });
    nombres.forEach(function (n) {
      var txt = nombreCuerpoSis(n.b), ancho = ctx.measureText(txt).width, sep = n.r + 4 * dpr;
      /* de cerca a lejos: su lado de siempre, arriba, abajo, el otro lado, y en diagonal */
      var opciones = [];
      [0, 7, 14, 21].forEach(function (mas) {
        var s = sep + mas * dpr, dcha = [n.x + s, n.y + 3.5 * dpr, 'left'], izda = [n.x - s, n.y + 3.5 * dpr, 'right'];
        var lados = n.x < w * 0.74 ? [dcha, izda] : [izda, dcha];
        opciones.push(lados[0], [n.x, n.y - s, 'center'], [n.x, n.y + s + 8 * dpr, 'center'], lados[1],
          [lados[0][0], n.y - s, lados[0][2]], [lados[0][0], n.y + s + 8 * dpr, lados[0][2]],
          [lados[1][0], n.y - s, lados[1][2]], [lados[1][0], n.y + s + 8 * dpr, lados[1][2]]);
      });
      var caja = function (o) { var l = o[2] === 'left' ? o[0] : o[2] === 'right' ? o[0] - ancho : o[0] - ancho / 2; return { l: l, r: l + ancho, t: o[1] - 9 * dpr, d: o[1] + 3 * dpr }; };
      /* lo que pisa cada sitio: nada es lo bueno; si no hay ninguno libre, el que menos */
      var cruce = function (a, z) { return Math.max(0, Math.min(a.r, z.r) - Math.max(a.l, z.l)) * Math.max(0, Math.min(a.d, z.d) - Math.max(a.t, z.t)); };
      var pisa = function (o) {
        var k = caja(o), p = 0;
        p += Math.max(0, -k.l) + Math.max(0, k.r - w) + Math.max(0, -k.t) + Math.max(0, k.d - w);
        puestas.forEach(function (q) { p += cruce(k, q); });
        bolas.forEach(function (q) { if (q.b !== n.b) p += cruce(k, q); });
        fijos.forEach(function (q) { p += cruce(k, q); });
        return p;
      };
      var o = opciones[0], menos = Infinity;
      for (var i = 0; i < opciones.length && menos > 0; i++) { var pi = pisa(opciones[i]); if (pi < menos) { menos = pi; o = opciones[i]; } }
      ctx.textAlign = o[2]; ctx.fillText(txt, o[0], o[1]);
      var k = caja(o); k.b = n.b; puestas.push(k);
    });
    ctx.textAlign = 'left';
    /* para tools/auditar_cielo.js: las cajas en pixeles del lienzo */
    S.sis.etiquetas = puestas; S.sis.obstaculos = bolas.concat(fijos); S.sis.lado = w;
  }
  function hojaSistema(caja) {
    caja.textContent = '';
    var b = S.sis.sel; if (!b) { caja.hidden = true; return; }
    caja.hidden = false;
    var A = Astronomy, fecha = tiempoSistema(), t = A.MakeTime(fecha), sis = sistemaEn(fecha), p = sis.cuerpos[b];
    caja.appendChild(el('div', 'cielo-item-nom', (b === 'Earth' ? '🌍' : ICONO_PLANETA[b]) + ' ' + nombreCuerpoSis(b)));
    var L = [T('SistemaDeSol', { d: numero(p.r, 2) })];
    if (b !== 'Earth') {
      var gv = A.GeoVector(A.Body[b], t, true), d = Math.sqrt(gv.x * gv.x + gv.y * gv.y + gv.z * gv.z);
      L.push(T('SistemaDeTierra', { d: numero(d, 2), t: duracionSeg(d * 499.004784) }));
      L.push(T('SistemaElong', { e: numero(A.AngleFromSun(A.Body[b], t), 0) }));
      var e = vectorSel({ planeta: b }, instante(fecha));
      if (e) { var h = altAzDe(e), ahora = Math.abs(fecha.getTime() - Date.now()) < 120000; L.push(h.alt > 0 ? T('FichaArriba', { t: ahora ? T('AhoraMismo') : hora(fecha), alt: numero(h.alt, 0), dir: hacia(h.az) }) : T('FichaAbajo', { t: ahora ? T('AhoraMismo') : hora(fecha) })); }
    }
    L.forEach(function (x) { caja.appendChild(el('div', 'cielo-item-sub', x)); });
    /* ¿sabias que...? del planeta (la Tierra incluida), plegado (codigo11) */
    var cu = bloqueCuriosidad(curiosidadDe({ tipo: 'planeta', cuerpo: b }), true); if (cu) caja.appendChild(cu);
    if (b !== 'Earth') {
      var bt = el('div', 'cielo-aviso-btns');
      var b1 = el('button', 'cielo-boton', '🗺️ ' + T('VerEnMapa')); b1.type = 'button'; b1.addEventListener('click', function () { irAlMapa({ planeta: b, t: fecha }); });
      var b2 = el('button', 'cielo-boton', '🧭 ' + T('GuiaLlevame')); b2.type = 'button'; b2.addEventListener('click', function () { abrirVista({ objetivo: { planeta: b } }); });
      bt.appendChild(b1); bt.appendChild(b2); caja.appendChild(bt);
    }
  }
  function tarjetaSistema(n) {
    var t = tarjeta('🪐 ' + T('SistemaTitulo'));
    var cv = el('canvas', 'cielo-sistema'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', T('SistemaTitulo'));
    t.appendChild(cv);
    var hoja = el('div', 'cielo-sis-hoja'); hoja.hidden = true;
    var chips = el('div', 'cielo-sis-chips');
    var fechaTxt = el('span', 'cielo-sis-fecha');
    var refrescar = function () { pintarSistema(cv); fechaTxt.textContent = diaAnio(tiempoSistema()); hojaSistema(hoja); chips.querySelectorAll('[data-vista]').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-vista') === S.sis.vista ? 'true' : 'false'); }); bplay.textContent = S.sis.corre ? '⏸' : '▶'; bplay.setAttribute('aria-pressed', S.sis.corre ? 'true' : 'false'); };
    [['int', 'SistemaInterior'], ['ext', 'SistemaExterior']].forEach(function (v) {
      var b = el('button', 'cielo-chip', T(v[1])); b.type = 'button'; b.setAttribute('data-vista', v[0]);
      b.addEventListener('click', function () { S.sis.vista = v[0]; refrescar(); }); chips.appendChild(b);
    });
    var bm = el('button', 'cielo-chip', T('SistemaMenos')); bm.type = 'button'; bm.addEventListener('click', function () { tiempoSistema(); S.sis.t -= 30 * 864e5; S.sis.corre = false; refrescar(); });
    var bh = el('button', 'cielo-chip', T('Hoy')); bh.type = 'button'; bh.addEventListener('click', function () { S.sis.t = Date.now(); S.sis.base = S.fecha; S.sis.corre = false; refrescar(); });
    var bp = el('button', 'cielo-chip', T('SistemaMas')); bp.type = 'button'; bp.addEventListener('click', function () { tiempoSistema(); S.sis.t += 30 * 864e5; S.sis.corre = false; refrescar(); });
    var bplay = el('button', 'cielo-chip', '▶'); bplay.type = 'button'; bplay.title = T('SistemaCorre'); bplay.setAttribute('aria-label', T('SistemaCorre'));
    bplay.addEventListener('click', function () { tiempoSistema(); S.sis.corre = !S.sis.corre; refrescar(); if (S.sis.corre) correrSistema(cv, refrescar); });
    [bm, fechaTxt, bp, bh, bplay].forEach(function (x) { chips.appendChild(x); });
    t.appendChild(chips); t.appendChild(hoja);
    t.appendChild(el('div', 'cielo-nota', T('SistemaNota')));
    /* tocar un planeta */
    cv.addEventListener('click', function (ev) {
      var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, mejor = null;
      (S.sis.dianas || []).forEach(function (d) { var dd = Math.hypot(d.x - x, d.y - y); if (dd < 16 && (!mejor || dd < mejor.dd)) mejor = { b: d.b, dd: dd }; });
      S.sis.sel = mejor ? (mejor.b === S.sis.sel ? null : mejor.b) : null;
      refrescar();
    });
    /* el lienzo no tiene ancho hasta estar en la pagina */
    setTimeout(refrescar, 0);
    if (S.sis.corre) setTimeout(function () { correrSistema(cv, refrescar); }, 0);
    return t;
  }
  /* un mes por segundo, mientras la tarjeta este a la vista */
  function correrSistema(cv, refrescar) {
    if (S.sis.anim) cancelAnimationFrame(S.sis.anim);
    var ant = performance.now();
    var paso = function (ahora) {
      if (!S.sis.corre || !cv.isConnected || !S.abierto) { S.sis.anim = null; S.sis.corre = false; return; }
      S.sis.t += (ahora - ant) * 30 * 864e5 / 1000; ant = ahora;
      refrescar();
      S.sis.anim = requestAnimationFrame(paso);
    };
    S.sis.anim = requestAnimationFrame(paso);
  }

  /* ── LA LUZ ROJA COMPLETA ───────────────────────────────────────── */
  var BRILLO_CLAVE = 'tgo_cielo_brillo', PISTA_CLAVE = 'tgo_cielo_rojo_pista';
  function brilloGuardado() { var v = guardado(BRILLO_CLAVE, 0.82); return isFinite(v) && v >= 0.25 && v <= 1 ? v : 0.82; }
  function aplicarBrillo(v) { document.documentElement.style.setProperty('--cielo-brillo', String(v)); }
  function controlBrillo(cls) {
    var inp = el('input', cls); inp.type = 'range'; inp.min = '0.25'; inp.max = '1'; inp.step = '0.05'; inp.value = String(brilloGuardado());
    inp.setAttribute('aria-label', T('RojoBrillo')); inp.title = T('RojoBrillo');
    inp.addEventListener('input', function () { var v = +inp.value; aplicarBrillo(v); guardar(BRILLO_CLAVE, v); });
    return inp;
  }
  /* el regulador en la cabecera del panel, al lado del boton de la luz roja */
  function montarBrillo() {
    var r = document.getElementById('cielo-rojo');
    if (!r || document.getElementById('cielo-brillo')) return;
    var inp = controlBrillo('cielo-brillo'); inp.id = 'cielo-brillo';
    r.parentNode.insertBefore(inp, r.nextSibling);
    aplicarBrillo(brilloGuardado());
  }
  function pintarBrillo() {
    var inp = document.getElementById('cielo-brillo'); if (inp) { inp.hidden = !S.rojo; inp.value = String(brilloGuardado()); inp.setAttribute('aria-label', T('RojoBrillo')); inp.title = T('RojoBrillo'); }
    if (VI && VI.brillo) VI.brillo.hidden = !S.rojo;
  }
  /* la barra del sistema (theme-color) en rojo oscuro mientras la pantalla va en rojo */
  function temaRojo(activo) {
    var m = document.querySelector('meta[name="theme-color"]'); if (!m) return;
    if (activo) { if (!S._temaColor) S._temaColor = m.getAttribute('content') || '#0F1117'; m.setAttribute('content', '#2a0000'); }
    else if (S._temaColor) { m.setAttribute('content', S._temaColor); }
  }
  /* la pista, una vez: si se abre el panel de noche con la luz blanca */
  function pistaRoja() {
    if (S.rojo || S._pistaDada) return;
    try { if (localStorage.getItem(PISTA_CLAVE) === '1') return; } catch (e) {}
    if (cuerpoHorizonte(Astronomy.Body.Sun, Astronomy.MakeTime(new Date())).alt > -6) return;
    var p = document.getElementById('cielo-panel'), cuerpo = document.getElementById('cielo-cuerpo'); if (!p || !cuerpo) return;
    S._pistaDada = true;
    var barra = el('div', 'cielo-pista'); barra.id = 'cielo-pista'; barra.setAttribute('role', 'status');
    barra.appendChild(el('span', null, '🔴 ' + T('RojoPista')));
    var fin = function (guardarNo) { if (guardarNo) { try { localStorage.setItem(PISTA_CLAVE, '1'); } catch (e) {} } barra.remove(); };
    var b1 = el('button', 'cielo-boton', T('RojoActivar')); b1.type = 'button'; b1.addEventListener('click', function () { rojo(true); fin(true); });
    var b2 = el('button', 'cielo-boton', T('RojoNo')); b2.type = 'button'; b2.addEventListener('click', function () { fin(true); });
    barra.appendChild(b1); barra.appendChild(b2);
    p.insertBefore(barra, cuerpo);
  }

  /* ── SIN RED EN EL TEIDE ─────────────────────────────────────────── */
  var FICHEROS_PANEL = ['./index.html', './modulos/cielo.js', './vendor/astronomy.browser.min.js', './datos/cielo.json', './vendor/satellite.js', './datos/satelites.json'];
  /* true: todo guardado; false: falta algo; null: este navegador no guarda */
  function cacheListo() {
    /* en la aplicacion de las tiendas (TGO-NATIVO, index.html) los seis
       ficheros viajan dentro del paquete: guardado siempre, sin cache */
    if (window.TGO_NATIVO) return Promise.resolve(true);
    try { if (!('caches' in window) || !('serviceWorker' in navigator) || location.protocol === 'file:') return Promise.resolve(null); } catch (e) { return Promise.resolve(null); }
    /* y las curiosidades de las constelaciones, las del idioma de quien mira */
    return Promise.all(FICHEROS_PANEL.concat([rutaCurCon(lang())]).map(function (f) {
      var u = new URL(f, location.href).href;
      return caches.match(u).then(function (r) { return !!r; }, function () { return false; });
    })).then(function (xs) { return xs.every(Boolean); }, function () { return null; });
  }
  function chipSinRed() {
    if (typeof navigator === 'undefined' || navigator.onLine !== false) return null;
    var f = S.sat.datos && S.sat.datos.sat.length ? diaAnio(new Date(epocaMasNueva())) : null;
    var d = el('div', 'cielo-aviso cielo-sinred', '📴 ' + (f ? T('SinRed', { f: f }) : T('SinRedSinSat'))); d.setAttribute('role', 'status');
    return d;
  }
  function tarjetaOffline() {
    var t = tarjeta('📶 ' + T('OfflineTitulo'));
    var p = el('p', 'cielo-p cielo-offline', T('OfflineComprobando')); t.appendChild(p);
    t.appendChild(el('div', 'cielo-nota', T('OfflineWiki')));
    cacheListo().then(function (r) {
      S.cacheListo = r;
      p.textContent = r === null ? T('OfflineNo') : (r ? '✓ ' + T('OfflineListo') : T('OfflineFalta'));
      p.className = 'cielo-p cielo-offline ' + (r ? 'cielo-offline-ok' : 'cielo-offline-no');
    });
    return t;
  }
  function escucharRed() {
    ['online', 'offline'].forEach(function (ev) { window.addEventListener(ev, function () { if (S.abierto) pintar(); }); });
  }

  /* ── LAS CURIOSIDADES Y LA FICHA DEL PLANETA (22-10-2026, quinto bloque) ──
     Jerome: «verifica cada web, cada informacion real; busca fun facts; se
     creativo y minucioso; que no te olvides de nada». Lo que se añade, y de
     donde sale cada cosa (nada escrito a ojo; la fuente va en la pantalla,
     como enlace, debajo de cada curiosidad):
       · La ficha del planeta (diametro, dia, año, lunas, temperatura,
         gravedad, anillos) y las curiosidades de los ocho planetas, el Sol y
         la Luna salen de CIELO_PLANETAS: la Planetary Fact Sheet y la Sun
         Fact Sheet de la NASA (NSSDCA), copiadas de datos/planetas.json por
         genera.py. Las frases solo combinan esas cifras (Venus gira al reves,
         como Urano, y tarda mas en dar una vuelta sobre si misma que en dar la
         vuelta al Sol; Saturno flotaria; Urano gira tumbado; la luz tarda 4 h
         11 min en llegar a Neptuno). El perigeo y
         el apogeo de la Luna, con SearchLunarApsis / NextLunarApsis.
       · Las estrellas y objetos del sur (declinacion <= -40°): la latitud al
         norte de la cual ya no salen (90° - |dec|) y a que altura culminan
         aqui (90° - lat + dec): Canopus, Omega Centauri, Acrux... La Polar:
         su altura es la latitud del lugar.
       · Los tres satelites (NASA, Wikipedia, The Planetary Society), las once
         lluvias (el cuerpo padre, de la lista de la IMO que lleva el
         catalogo, y una curiosidad por lluvia: NASA, AMS, Wikipedia, UCM), la
         luz zodiacal en su temporada (Britannica: febrero-marzo al
         anochecer, septiembre-octubre de madrugada, sin Luna) y la sombra del
         Teide con la hora de la puesta (TWAN, APOD).
       · La Ley del Cielo ya estaba en «Por que aqui» (LeyCielo).
     tools/auditar_cielo.js (parte 13) coteja CIELO_PLANETAS con el JSON y
     con la JPL, y abre las fichas de Jupiter, la Luna, el Sol, Canopus y la
     ISS en los diez idiomas. */
  var PLAN = typeof CIELO_PLANETAS !== 'undefined' ? CIELO_PLANETAS : null;
  var FUENTE_NASA_PL = ['NASA, Planetary Fact Sheet', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html'];
  var FUENTE_NASA_SOL = ['NASA, Sun Fact Sheet', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html'];
  var FUENTE_JPL_LUNA = ['NASA/JPL, Night Sky Network', 'https://nightsky.jpl.nasa.gov/media/documents/attachments/Fun_Facts_About_the_Moon.pdf'];
  var FUENTES_SAT = {
    iss: [['NASA', 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/']],
    tiangong: [['Wikipedia', 'https://en.wikipedia.org/wiki/Tiangong_space_station'], ['The Planetary Society', 'https://www.planetary.org/space-missions/chinese-space-station']],
    hubble: [['NASA', 'https://www.nasa.gov/mission/sts-31'], ['NASA Goddard', 'https://science.nasa.gov/centers-and-facilities/goddard/a-nasa-refresher-on-hubble-facts-for-the-25th-anniversary']]
  };
  var NASA_LLU = 'https://science.nasa.gov/solar-system/meteors-meteorites/';
  var AMS_CAL = ['AMS', 'https://www.amsmeteors.org/calendar/'];
  var FUENTES_LLU = {
    QUA: [['NASA', NASA_LLU + 'quadrantids/']],
    LYR: [['NASA', NASA_LLU + 'lyrids/']],
    ETA: [['NASA', NASA_LLU + 'eta-aquarids/']],
    SDA: [['NASA', NASA_LLU + 'delta-aquariids/']],
    CAP: [AMS_CAL, ['Wikipedia', 'https://en.wikipedia.org/wiki/Alpha_Capricornids']],
    PER: [['NASA', NASA_LLU + 'perseids/'], ['UCM', 'https://www.ucm.es/otri/el-llanto-mas-intenso-de-san-lorenzo']],
    DRA: [['Wikipedia', 'https://en.wikipedia.org/wiki/Draconids'], ['NASA', 'https://science.nasa.gov/solar-system/comets/21p-giacobini-zinner/']],
    ORI: [['NASA', NASA_LLU + 'orionids/']],
    LEO: [['NASA', NASA_LLU + 'leonids/']],
    GEM: [['NASA', NASA_LLU + 'geminids/']],
    URS: [AMS_CAL, ['Wikipedia', 'https://en.wikipedia.org/wiki/Ursids']]
  };
  var FUENTE_ZODIACAL = ['Encyclopaedia Britannica', 'https://www.britannica.com/science/zodiacal-light'];
  var FUENTES_SOMBRA = [['TWAN', 'https://twanight.org/gallery/a-triangular-shadow-of-a-large-volcano/'], ['APOD (NASA)', 'https://apod.nasa.gov/apod/ap110705.html'], ['Atmospheric Optics', 'https://atoptics.co.uk/blog/earth-shadow']];
  var HIP_POLAR = 11767;                               // Polaris, α UMi
  var DEC_SUR = -40;                                   // de aqui para abajo, «nunca sale al norte de...»
  var DIA_TIERRA_KM = 12756, G_TIERRA = 9.8, LUZ_KMS = 299792.458, ANIO_D = 365.25;

  /* duraciones en palabras: «9,9 h», «176 dias», «27,3 dias», «11,9 años» */
  function durHoras(h) { return h < 48 ? T('DurHoras', { n: numero(h, 1) }) : durDias(h / 24); }
  function durDias(d) {
    if (d >= 1000) return T('DurAnios', { n: numero(d / ANIO_D, 1) });
    var r = Math.round(d);
    var txt = Math.abs(d - r) < 0.05 ? T('DurDias', { n: r }) : T('DurDiasFrac', { n: numero(d, 1) });
    return d > 400 ? txt + ' (' + T('DurAnios', { n: numero(d / ANIO_D, 1) }) + ')' : txt;
  }
  function planeta(k) { return PLAN && PLAN.cuerpos ? PLAN.cuerpos[k] : null; }
  /* «un año»: el periodo sideral (una vuelta respecto a las estrellas) de la hoja
     de cada planeta; la tabla resumen trae el tropico (Neptuno 59.800 frente a
     60.189 dias) */
  function anioDe(p) { return p.periodo_sideral_d || p.periodo_d; }

  /* la ficha del planeta: un bloque aparte, debajo de los datos del momento */
  function fichaPlaneta(c) {
    var p = c.cuerpo && c.tipo === 'planeta' ? planeta(c.cuerpo) : null;
    if (!p) return null;
    var b = el('div', 'cielo-ficha-bloque cielo-ficha-pl');
    b.appendChild(el('div', 'cielo-ficha-sub', T('PlFicha')));
    var ul = el('ul', 'cielo-ficha-datos'), L = [];
    L.push(T('PlDiametro', { km: numero(p.diametro_km, 0), x: numero(p.diametro_km / DIA_TIERRA_KM, 1) }));
    L.push(T('PlDia', { d: durHoras(p.dia_h) }));
    L.push(T('PlAnio', { a: durDias(anioDe(p)) }));
    L.push(T('PlLunas', { n: numero(p.lunas, 0) }));
    L.push(T('PlTemp', { t: grados(p.temp_c) }));
    L.push(T('PlGravedad', { g: numero(p.gravedad_ms2, 1), x: numero(p.gravedad_ms2 / G_TIERRA, 1) }));
    if (p.anillos) L.push(T('PlAnillos'));
    L.forEach(function (x) { ul.appendChild(el('li', null, x)); });
    b.appendChild(ul);
    b.appendChild(fuentes([['Planetary Fact Sheet', FUENTE_NASA_PL[1]]], T('PlFuente', { f: String(PLAN.fecha || '').slice(0, 4) })));
    return b;
  }
  /* un grado bajo cero con el menos tipografico, como las magnitudes */
  function grados(t) { return t < 0 ? '−' + numero(-t, 0) : numero(t, 0); }

  /* perigeo y apogeo que vienen (la Luna), en orden de fecha */
  function lunaApsides(L, fecha) {
    var A = Astronomy, a1 = A.SearchLunarApsis(A.MakeTime(fecha)), a2 = a1 && A.NextLunarApsis(a1);
    [a1, a2].forEach(function (a) {
      if (a) L.push(T(a.kind === 0 ? 'LunaPerigeo' : 'LunaApogeo', { f: dia(a.time.date), km: numero(Math.round(a.dist_km / 100) * 100, 0) }));
    });
  }

  /* la curiosidad de lo que se mira: { txt, fuentes } o null */
  function curiosidadDe(c) {
    var p;
    if (c.tipo === 'sol' && PLAN && PLAN.sol) {
      var s = PLAN.sol;
      return { txt: T('CurSun', { r: numero(Math.round(s.radio_x_tierra), 0), m: numero(s.masa_x_tierra, 0), t: numero(Math.round((s.temp_k - 273.15) / 100) * 100, 0), d: durHoras(s.rotacion_h) }), fuentes: [FUENTE_NASA_SOL] };
    }
    if (c.tipo === 'luna' && (p = planeta('Moon'))) {
      return { txt: T('CurMoon', { d: durDias(p.periodo_d) }), fuentes: [FUENTE_NASA_PL, FUENTE_JPL_LUNA] };
    }
    if (c.tipo === 'planeta' && (p = planeta(c.cuerpo))) {
      var v = { v: numero(p.velocidad_kms, 1), kmh: numero(Math.round(p.velocidad_kms * 3600), 0), a: durDias(anioDe(p)), t: grados(p.temp_c), temp: grados(p.temp_c), p: numero(p.presion_bar, 0),
                n: numero(p.lunas, 0), den: numero(p.densidad_kgm3, 0), o: numero(p.oblicuidad_deg, 1), x: numero(p.diametro_km / DIA_TIERRA_KM, 1) };
      v.d = c.cuerpo === 'Venus' ? durHoras(Math.abs(p.rotacion_h)) : durHoras(p.dia_h);
      if (c.cuerpo === 'Neptune') v.t = duracionSeg(p.dist_sol_mkm * 1e6 / LUZ_KMS);
      return { txt: T('Cur' + c.cuerpo, v), fuentes: [FUENTE_NASA_PL], clave: 'cuerpo|' + c.cuerpo };
    }
    if (c.tipo === 'satelite' && c.sat && FUENTES_SAT[c.sat.clave]) {
      var k = c.sat.clave.charAt(0).toUpperCase() + c.sat.clave.slice(1);
      return { txt: T('Cur' + k), fuentes: FUENTES_SAT[c.sat.clave] };
    }
    if (c.tipo === 'constelacion' || c.tipo === 'con') return curiosidadConstelacion(c.ab);
    if (c.hip === HIP_POLAR) return { txt: T('CurPolar', { a: numero(OBS.lat, 0) }), fuentes: [] };
    if (typeof c.dec === 'number' && c.dec <= DEC_SUR) {
      return { txt: T('CurSur', { lat: numero(90 - Math.abs(c.dec), 0), t: numero(OBS.lat, 0), a: numero(90 - OBS.lat + c.dec, 0) }), fuentes: [] };
    }
    return null;
  }
  function curiosidadLluvia(l) {
    if (!l || !FUENTES_LLU[l.id]) return null;
    return { txt: T('Cur' + l.id, { v: numero(l.v, 0) }), fuentes: FUENTES_LLU[l.id], clave: 'lluvia|' + l.id };
  }
  /* las plegadas que alguien abrio: el panel se vuelve a pintar solo (al
     llegar los satelites, al cambiar de fecha) y no deben cerrarse */
  var CURIO_ABIERTAS = {};
  /* el cuerpo padre que la NASA da solo como sospechado (las Delta
     Acuaridas): «se cree que son restos del cometa...» */
  var PADRE_DUDOSO = { SDA: 1 };
  /* «Son restos del cometa 1P/Halley»: el primer cuerpo padre de la lista de
     la IMO; con P/ o C/ delante es un cometa, si no, un asteroide */
  function lluviaPadre(l) {
    var p = l && l.padre && l.padre[0];
    if (!p) return '';
    if (PADRE_DUDOSO[l.id]) return T('LluviaPadreCreeCometa', { p: p });
    return T(/^(\d+P|[PCDXI])\//.test(p) ? 'LluviaPadreCometa' : 'LluviaPadreAsteroide', { p: p });
  }

  /* el bloque «¿Sabias que...?»: abierto (fichas) o plegado tras su titulo (listas) */
  function bloqueCuriosidad(cu, plegado) {
    if (!cu || !cu.txt) return null;
    var b = el('div', 'cielo-curio');
    var cab = el('div', 'cielo-curio-cab');
    var cuerpo = el('div', 'cielo-curio-cuerpo');
    cuerpo.appendChild(el('p', 'cielo-curio-txt', cu.txt));
    if (cu.fuentes && cu.fuentes.length) cuerpo.appendChild(fuentes(cu.fuentes));
    if (plegado) {
      var bt = el('button', null, '💡 ' + T('Curiosidad')); bt.type = 'button';
      var abierta = !!(cu.clave && CURIO_ABIERTAS[cu.clave]);
      bt.setAttribute('aria-expanded', abierta ? 'true' : 'false');
      cuerpo.hidden = !abierta;
      bt.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var abierto = bt.getAttribute('aria-expanded') === 'true';
        bt.setAttribute('aria-expanded', abierto ? 'false' : 'true');
        cuerpo.hidden = abierto;
        if (cu.clave) { if (abierto) delete CURIO_ABIERTAS[cu.clave]; else CURIO_ABIERTAS[cu.clave] = true; }
      });
      cab.appendChild(bt);
    } else cab.appendChild(el('span', null, '💡 ' + T('Curiosidad')));
    b.appendChild(cab);
    b.appendChild(cuerpo);
    return b;
  }
  /* «Fuente: NASA ↗ · Wikipedia ↗» (nombres propios, sin traducir) */
  function fuentes(lista, texto) {
    var f = el('div', 'cielo-fuente');
    f.appendChild(document.createTextNode((texto || T(lista.length > 1 ? 'CurFuentes' : 'CurFuente', { f: '' }).replace(/\s+$/, '')) + ' '));
    lista.forEach(function (x, i) {
      if (i) f.appendChild(document.createTextNode(' · '));
      var b = el('button', null, x[0] + ' ↗'); b.type = 'button';
      b.setAttribute('data-sin-traducir', 'nombre de la fuente');
      b.addEventListener('click', function (ev) { ev.stopPropagation(); });
      if (typeof bindExternalLink === 'function') bindExternalLink(b, x[1]);
      f.appendChild(b);
    });
    return f;
  }

  /* la luz zodiacal, en su temporada: febrero-marzo al anochecer (oeste),
     septiembre-octubre de madrugada (este); y si la Luna la deja ver, mirando
     si esta sobre el horizonte, con mas de un cuarto iluminado, en la hora y
     media que sigue a la noche cerrada o precede al alba */
  function notaZodiacal(n) {
    var mes = +String(n.fecha).slice(5, 7), tarde = mes === 2 || mes === 3, manana = mes === 9 || mes === 10;
    if (!tarde && !manana || !n.oscuro || !n.claro) return null;
    var A = Astronomy, t = tarde ? n.oscuro.AddDays(0.75 / 24) : n.claro.AddDays(-0.75 / 24);
    var molesta = cuerpoHorizonte(A.Body.Moon, t).alt > 0 && A.Illumination(A.Body.Moon, t).phase_fraction > 0.25;
    var b = el('div', 'cielo-curio');
    b.appendChild(el('div', 'cielo-curio-cab', '✨ ' + T('Zodiacal')));
    b.appendChild(el('p', 'cielo-curio-txt', T(tarde ? 'ZodiacalTarde' : 'ZodiacalManana')));
    b.appendChild(el('p', 'cielo-curio-txt', T('ZodiacalCuando', { l: T(molesta ? 'ZodiacalLunaSi' : 'ZodiacalLunaNo') })));
    b.appendChild(fuentes([FUENTE_ZODIACAL]));
    return b;
  }
  /* la sombra del Teide, con la hora de la puesta del dia de la carta, y la
     sombra de la Tierra con el cinturon de Venus (Atmospheric Optics) */
  function notaSombra(n) {
    if (!n.ocaso) return null;
    var b = el('div', 'cielo-curio');
    b.appendChild(el('div', 'cielo-curio-cab', '⛰️ ' + T('Curiosidad')));
    b.appendChild(el('p', 'cielo-curio-txt', T('SombraTeide', { h: hora(aFecha(n.ocaso)) })));
    b.appendChild(el('p', 'cielo-curio-txt', T('SombraTierra')));
    b.appendChild(fuentes(FUENTES_SOMBRA));
    return b;
  }

  /* ── LAS 88 CONSTELACIONES: ORIGEN, TAMAÑO Y UNA CURIOSIDAD (22-10-2026,
     sexto bloque) ────────────────────────────────────────────────────────
     Jerome: «una curiosidad por constelacion (88 × 10 idiomas, con su fuente
     cada una): si quiero». Lo que se añade a la ficha de cada constelacion
     (carta y vista) y a su detalle en el catalogo:
       · «Origen: una de las 48 de Ptolomeo…» y «Tamaño: 722 grados cuadrados,
         la n.º 19 de 88», de CIELO_CONS: datos/constelaciones.json, que sale
         de las dos tablas de la UAI en Wikipedia (origen; area por angulo
         solido: la suma de las 88 es la esfera entera).
       · «¿Sabias que…?»: la fila cieloCurCon<Abr> (idiomas/cielo/<idioma>.json;
         la cita, en datos/constelaciones.json), escrita a partir de la pagina de esa constelacion en
         Star Tales (Ian Ridpath): quien la puso en el cielo, el mito o la
         historia, lo que merece la pena mirar. Orion sale de Wikipedia: su
         pagina de Star Tales no se dejo leer (en el JSON, ridpath null y
         wiki). Debajo, las fuentes como enlace: la de la curiosidad, la de
         su estrella si la UAI le dio nombre despues de escrita la pagina de
         Star Tales (mas: Lupus y Triangulum), y las dos tablas de la UAI en
         Wikipedia (el origen y el tamaño).
     tools/auditar_cielo.js (parte 14) coteja la copia con el JSON, la suma de
     las areas, los puestos, el origen de cada una y la estrella mas brillante
     contra el catalogo, y abre fichas en los diez idiomas. */
  var CONS = typeof CIELO_CONS !== 'undefined' ? CIELO_CONS : null;
  var ORIGEN_FILA = { ptolomeo: 'Ptolomeo', keyser: 'Keyser', plancius: 'Plancius', hevelius: 'Hevelius', lacaille: 'Lacaille', argo: 'Argo', vopel: 'Vopel' };
  function constelacionDatos(ab) { return CONS && CONS.con ? CONS.con[ab] : null; }
  /* las dos lineas de datos (ficha y catalogo) */
  function datosConstelacion(ab, L) {
    var k = constelacionDatos(ab);
    if (!k) return;
    var fila = ORIGEN_FILA[k.origen];
    if (fila) L.push(T('ConOrigen', { o: T('ConOrigen' + fila, { a: k.anio === null || k.anio === undefined ? '' : String(k.anio) }) }));
    L.push(T('ConArea', { a: numero(Math.round(k.area), 0), r: String(k.rango) }));
  }
  /* ── LAS CURIOSIDADES, UN FICHERO POR IDIOMA (22-10-2026) ──────────────
     Las 88 de las constelaciones (cieloCurCon<Abr>) no van en CIELO_UI:
     van en idiomas/cielo/<idioma>.json, y cada movil baja solo las de su
     idioma (unos 16 kB comprimidos, en vez de los 182 de los diez juntos;
     Jerome: «Preparalo»). Se piden al abrir el panel y al cambiar de
     idioma; el service worker las guarda (red primero, como
     idiomas/<idioma>.json) y cacheListo() cuenta la del idioma para «Antes
     de subir al Teide». Mientras no han llegado, o si no se pueden tener,
     la ficha sale sin «¿Sabias que…?»: nunca en otro idioma, que es lo que
     haria tx() con su respaldo al ingles. De donde sale cada una y lo que
     dice su pagina: datos/constelaciones.json (cita). Las herramientas las
     ven como antes, filas de diez idiomas: tools/fuente.js y fuente.py las
     juntan (IDIOMAS-PEREZOSOS, en el cargador de index.html).
       CIRILICO-OK: Хела  Hele (Aries), la hermana de Frixo que cayo al estrecho
                          que lleva su nombre; no es la diosa Hera, que se escribe con r
       CIRILICO-OK: Конон  el astronomo Conon de Samos (Coma Berenices); no es el
                           apellido de Colon, que el bulgaro de las fichas escribe con l */
  var CUR_CON = {}, CUR_CON_PIDE = {};
  function rutaCurCon(l) { return './idiomas/cielo/' + l + '.json'; }
  function cargarCurCon(l) {
    l = l || lang();
    if (CUR_CON[l]) return Promise.resolve(CUR_CON[l]);
    if (CUR_CON_PIDE[l]) return CUR_CON_PIDE[l];
    CUR_CON_PIDE[l] = fetch(rutaCurCon(l)).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      /* solo filas de texto con la forma de las 88: nada mas entra */
      var t = {};
      Object.keys(j || {}).forEach(function (k) { if (/^cieloCurCon[A-Z][A-Za-z]{2}$/.test(k) && typeof j[k] === 'string') t[k] = j[k]; });
      CUR_CON[l] = t; delete CUR_CON_PIDE[l];
      if (S.conFalta && S.abierto && l === lang()) { S.conFalta = false; pintar(); }
      return t;
    }, function () { delete CUR_CON_PIDE[l]; return null; });
    return CUR_CON_PIDE[l];
  }
  /* la curiosidad, con sus fuentes */
  function curiosidadConstelacion(ab) {
    var k = constelacionDatos(ab);
    if (!k || !ab) return null;
    var t = CUR_CON[lang()];
    if (!t) { S.conFalta = true; cargarCurCon(); return null; }
    var txt = t['cieloCurCon' + ab];
    if (!txt) return null;
    var hist = k.ridpath ? ['Star Tales (Ian Ridpath)', k.ridpath] : ['Wikipedia', k.wiki];
    return { txt: txt, fuentes: [hist].concat(k.mas || [], [[T('ConFuenteOrigen'), CONS.fuentes.origen], [T('ConFuenteArea'), CONS.fuentes.area]]), clave: 'con|' + ab };
  }

  /* ── ABRIR Y CERRAR ────────────────────────────────────────────── */
  function rojo(si) {
    S.rojo = !!si;
    document.documentElement.classList.toggle('cielo-rojo', S.rojo && S.abierto);
    try { localStorage.setItem('tgo_cielo_rojo', S.rojo ? '1' : '0'); } catch (e) {}
    var b = document.getElementById('cielo-rojo'); if (b) b.setAttribute('aria-pressed', S.rojo ? 'true' : 'false');
    temaRojo(S.rojo && S.abierto); pintarBrillo();
  }
  function abrir() {
    var p = document.getElementById('cielo-panel');
    if (!p) return;
    ['fi-panel', 'mc-panel', 'wx-panel', 'mar-panel'].forEach(function (id) { var x = document.getElementById(id); if (x) x.style.display = 'none'; });
    p.style.display = 'flex';
    S.abierto = true;
    if (!S.fecha) S.fecha = nocheDeHoy();
    document.documentElement.classList.toggle('cielo-rojo', S.rojo);
    temaRojo(S.rojo); pintarBrillo();
    pintar();
    cargar().then(function () { pedirNubes(); pintar(); pistaRoja(); cargarSatelites().then(function () { if (S.abierto) pintar(); }, function () {}); }, function () { pintar(); });
    cargarCurCon();
  }
  function cerrar() {
    var p = document.getElementById('cielo-panel');
    if (p) p.style.display = 'none';
    S.abierto = false;
    pararMapa();
    vozParar();
    if (VI) cerrarVista();
    document.documentElement.classList.remove('cielo-rojo');
    temaRojo(false);
  }
  function alternar() { if (S.abierto) cerrar(); else abrir(); }

  /* El boton y el cierre los lleva el cargador de index.html, que existe
     desde el arranque; aqui solo lo que necesita el modulo ya cargado. */
  function iniciar() {
    var r = document.getElementById('cielo-rojo');
    if (r) { r.hidden = false; r.addEventListener('click', function () { rojo(!S.rojo); }); }
    try { S.rojo = localStorage.getItem('tgo_cielo_rojo') === '1'; } catch (e) {}
    montarBrillo(); pintarBrillo(); escucharRed();
    document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; if (VI) cerrarVista(); else if (S.abierto) cerrar(); });
    window.addEventListener('popstate', alAtras);
    try {
      /* Al cambiar de idioma se rehace lo que esta abierto: los textos salen
         del idioma en cada pintado, no se guardan. */
      TG_IDIOMA.registrar('cielo de Tenerife', function () { vozParar(); if (S.abierto) { cargarCurCon(); pintar(); } });
    } catch (e) {}
    /* la noche guiada en voz alta: con la pagina oculta (otra app, la pantalla
       bloqueada) el movil deja de leer, asi que se queda en pausa; y las voces
       que el navegador da tarde cambian el boton por la nota o al reves */
    document.addEventListener('visibilitychange', function () { if (document.hidden) vozPausar(); });
    try {
      if (window.speechSynthesis && window.speechSynthesis.addEventListener)
        window.speechSynthesis.addEventListener('voiceschanged', function () { if (VOZ.estado === 'parado') repintarVoz(); });
    } catch (e) {}
  }
  iniciar();

  /* Para las herramientas de tools/ (auditar_cielo.js, barrido_pantallas.js):
     el estado y los calculos, sin tocar nada. ver() abre una pestana y
     espera a que el catalogo y el motor esten cargados. */
  window.TG_CIELO = {
    abrir: abrir, cerrar: cerrar, estado: S, cargar: cargar,
    /* las curiosidades de las 88 en un idioma (el de ahora si no se dice) */
    curiosidades: function (l) { return cargarCurCon(l); },
    ver: function (p, fecha) { S.pestana = p || 'noche'; if (fecha) S.fecha = fecha; abrir(); return cargar().then(function () { pintar(); }); },
    eventos: function (fecha) { return eventos(fecha); },
    noche: function (f) { return calcularNoche(f); },
    planetas: function (f) { return planetasNoche(calcularNoche(f)); },
    mejores: function (f) { return mejoresNoche(calcularNoche(f)); },
    viaLactea: function (f) { var n = calcularNoche(f), v = viaLacteaNoche(n); return v.mejor ? v : { motivo: v.motivo, vuelve: v.motivo === 'abajo' ? vuelveViaLactea(f) : null }; },
    catalogo: function () { return catalogo(); },
    /* «Apunta al cielo» y la ficha, para tools/auditar_cielo.js */
    vista: function (opc) { abrirVista(opc || {}); return VI; },
    cerrarVista: function () { cerrarVista(true); },
    sensores: function () { return SEN; },
    cosa: function (sel, fecha) { return cosaDe(sel, fecha); },
    ficha: function (sel, fecha) { return fichaCosa(cosaDe(sel, fecha), fecha || new Date(), {}); },
    declinacion: function (fecha) { return declinacionHoy(fecha || new Date()); },
    lunasJupiter: function (fecha) { return lunasJupiter(fecha); },
    kelvinBV: kelvinBV, rgbKelvin: rgbKelvin, claseMK: claseMK, masaAire: masaAire,
    /* lo del 21 de octubre: indice, horas para fotos, recorrido, .ics, avisos,
       capturas y la comprobacion de la brujula (tools/auditar_cielo.js, parte 10) */
    indice: function (f) { return indiceNoche(calcularNoche(f)); },
    fotos: function (f) { return horasFotos(calcularNoche(f)); },
    trayectoria: function (sel, fecha) { return trayectoria(cosaDe(sel, fecha), fecha); },
    ics: function (e) { return icsEvento(e); },
    idEvento: idEvento, avisos: avisos, ponerAviso: ponerAviso, quitarAvisos: quitarAvisos,
    imagenNoche: function (f) { return imagenNoche(calcularNoche(f)); },
    capturarMapa: function () { return capturarMapa(null); },
    capturarVista: function () { return capturarVista(); },
    comprobar: function () { comprobarBrujula(); return VI && VI.comprobando; },
    comprobarYa: function () { comprobarYa(); return VI && VI.ultimaComprobacion; },
    ajuste: function () { return VI ? VI.ajuste : null; },
    cambiarFecha: cambiarFecha,
    /* los satelites (21 de octubre): parte 11 de auditar_cielo.js */
    satelites: function () { return cargarSatelites().then(function () { return S.sat.datos; }); },
    pasos: function (f) { return pasosNoche(f); },
    pasosProximos: pasosProximos,
    dondeSat: function (clave, fecha) { var s = satPorClave(clave); return s ? dondeSat(s, fecha) : null; },
    /* la noche guiada, el sistema solar, la luz roja y sin red (21 de octubre, tercer bloque): parte 12 */
    guia: function (f) { return paradasGuia(calcularNoche(f || S.fecha)); },
    instanteGuia: function (f) { return instanteGuia(calcularNoche(f || S.fecha)); },
    sistema: function (fecha) { return sistemaEn(fecha || new Date()); },
    /* pinta el sistema solar en un lienzo con la fecha y la vista que se le den, y
       devuelve donde han ido los nombres (parte 12: que no se pisen) */
    lienzoSistema: function (cv, fecha, vista) {
      S.sis.base = S.fecha; S.sis.t = fecha.getTime(); if (vista) S.sis.vista = vista;
      pintarSistema(cv);
      return { etiquetas: S.sis.etiquetas, obstaculos: S.sis.obstaculos, lado: S.sis.lado };
    },
    cacheListo: cacheListo, brillo: brilloGuardado, pista: pistaRoja, rojo: rojo,
    /* las curiosidades y la ficha del planeta (22 de octubre, quinto bloque): parte 13 */
    curiosidad: function (sel, fecha) { return curiosidadDe(cosaDe(sel, fecha)); },
    curiosidadLluvia: function (id) { return curiosidadLluvia((S.datos.lluvias || []).filter(function (l) { return l.id === id; })[0]); },
    lluviaPadre: function (id) { return lluviaPadre((S.datos.lluvias || []).filter(function (l) { return l.id === id; })[0]); },
    zodiacal: function (f) { return notaZodiacal(calcularNoche(f)); },
    sombra: function (f) { return notaSombra(calcularNoche(f)); },
    planetasNasa: function () { return PLAN; },
    duracion: { horas: durHoras, dias: durDias },
    /* la noche guiada en voz alta (22 de octubre, septimo bloque): parte 15. Las
       herramientas acortan la pausa y la vigilancia para no esperar 30 s por parada. */
    voz: function () { return { estado: VOZ.estado, i: VOZ.i, n: VOZ.P ? VOZ.P.length : 0, cuenta: VOZ.cuenta, fallo: VOZ.fallo, despierto: !!VOZ.bloqueo, pausa: VOZ_PAUSA, vigia: VOZ_VIGIA }; },
    vozTiempos: function (pausa, vigia) { if (pausa > 0) VOZ_PAUSA = pausa; if (vigia > 0) VOZ_VIGIA = vigia; return [VOZ_PAUSA, VOZ_VIGIA]; }
  };
})();
