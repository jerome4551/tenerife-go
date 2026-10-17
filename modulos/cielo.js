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
  /* sistemas que no son una sola estrella con nombre */
  var CIELO_DOB = {
    "mizar-alcor": {"es": "Mizar y Alcor", "en": "Mizar and Alcor", "fr": "Mizar et Alcor", "de": "Mizar und Alkor", "it": "Mizar e Alcor", "nl": "Mizar en Alcor", "zh": "开阳与辅", "zht": "開陽與輔", "bg": "Мицар и Алкор", "pl": "Mizar i Alkor"},
    mizar: {"es": "Mizar A y B", "en": "Mizar A and B", "fr": "Mizar A et B", "de": "Mizar A und B", "it": "Mizar A e B", "nl": "Mizar A en B", "zh": "开阳A与B", "zht": "開陽A與B", "bg": "Мицар A и B", "pl": "Mizar A i B"},
    "eps-lyr": {"es": "La Doble Doble", "en": "The Double Double", "fr": "La Double Double", "de": "Der Doppel-Doppelstern", "it": "La Doppia Doppia", "nl": "De Dubbele Dubbel", "zh": "双双星", "zht": "雙雙星", "bg": "Двойната двойна", "pl": "Podwójna Podwójna"}
  };
  /* Sol, Luna y planetas, con el nombre del motor (Astronomy Engine) como
     clave */
  var CIELO_CUERPO = {
    Sun: {"es": "Sol", "en": "Sun", "fr": "Soleil", "de": "Sonne", "it": "Sole", "nl": "Zon", "zh": "太阳", "zht": "太陽", "bg": "Слънце", "pl": "Słońce"},
    Moon: {"es": "Luna", "en": "Moon", "fr": "Lune", "de": "Mond", "it": "Luna", "nl": "Maan", "zh": "月亮", "zht": "月亮", "bg": "Луна", "pl": "Księżyc"},
    Mercury: {"es": "Mercurio", "en": "Mercury", "fr": "Mercure", "de": "Merkur", "it": "Mercurio", "nl": "Mercurius", "zh": "水星", "zht": "水星", "bg": "Меркурий", "pl": "Merkury"},
    Venus: {"es": "Venus", "en": "Venus", "fr": "Vénus", "de": "Venus", "it": "Venere", "nl": "Venus", "zh": "金星", "zht": "金星", "bg": "Венера", "pl": "Wenus"},
    Mars: {"es": "Marte", "en": "Mars", "fr": "Mars", "de": "Mars", "it": "Marte", "nl": "Mars", "zh": "火星", "zht": "火星", "bg": "Марс", "pl": "Mars"},
    Jupiter: {"es": "Júpiter", "en": "Jupiter", "fr": "Jupiter", "de": "Jupiter", "it": "Giove", "nl": "Jupiter", "zh": "木星", "zht": "木星", "bg": "Юпитер", "pl": "Jowisz"},
    Saturn: {"es": "Saturno", "en": "Saturn", "fr": "Saturne", "de": "Saturn", "it": "Saturno", "nl": "Saturnus", "zh": "土星", "zht": "土星", "bg": "Сатурн", "pl": "Saturn"},
    Uranus: {"es": "Urano", "en": "Uranus", "fr": "Uranus", "de": "Uranus", "it": "Urano", "nl": "Uranus", "zh": "天王星", "zht": "天王星", "bg": "Уран", "pl": "Uran"},
    Neptune: {"es": "Neptuno", "en": "Neptune", "fr": "Neptune", "de": "Neptun", "it": "Nettuno", "nl": "Neptunus", "zh": "海王星", "zht": "海王星", "bg": "Нептун", "pl": "Neptun"}
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
    M31: {"es": "La gran galaxia más cercana a la nuestra, a unos 2,5 millones de años luz. Desde un cielo oscuro se ve a simple vista.", "en": "The nearest large galaxy to ours, about 2.5 million light-years away. From a dark site you can see it with the naked eye.", "fr": "La grande galaxie la plus proche de la nôtre, à environ 2,5 millions d’années-lumière. Sous un ciel noir, elle se voit à l’œil nu.", "de": "Die nächste große Galaxie, etwa 2,5 Millionen Lichtjahre entfernt. Unter dunklem Himmel sieht man sie mit bloßem Auge.", "it": "La grande galassia più vicina alla nostra, a circa 2,5 milioni di anni luce. Sotto un cielo buio si vede a occhio nudo.", "nl": "Het dichtstbijzijnde grote sterrenstelsel, op ongeveer 2,5 miljoen lichtjaar. Onder een donkere hemel zie je het met het blote oog.", "zh": "离我们最近的大星系，距离约250万光年。在黑暗的夜空下肉眼可见。", "zht": "離我們最近的大星系，距離約250萬光年。在黑暗的夜空下肉眼可見。", "bg": "Най-близката до нас голяма галактика, на около 2,5 милиона светлинни години. При тъмно небе се вижда с просто око.", "pl": "Najbliższa nam duża galaktyka, odległa o około 2,5 miliona lat świetlnych. Pod ciemnym niebem widać ją gołym okiem."},
    /* Sky & Telescope, «Observing the Great Orion Nebula»: «the fuzzy star in the middle
       of the Sword», «binoculars can frame the Orion Nebula», «a prolific cradle of starbirth».
       https://skyandtelescope.org/observing/celestial-objects-to-watch/observing-the-great-orion-nebula/ */
    M42: {"es": "Una nube donde están naciendo estrellas, en la espada de Orión: a simple vista es una mancha difusa y con prismáticos ya se ve la nebulosa.", "en": "A cloud where stars are being born, in Orion’s sword: a fuzzy patch to the naked eye, and the nebula already shows in binoculars.", "fr": "Un nuage où naissent des étoiles, dans l’épée d’Orion : une tache floue à l’œil nu, et la nébuleuse se voit déjà aux jumelles.", "de": "Eine Wolke, in der Sterne entstehen, im Schwert des Orion: mit bloßem Auge ein Nebelfleck, im Fernglas sieht man schon den Nebel.", "it": "Una nube dove stanno nascendo stelle, nella spada di Orione: a occhio nudo è una macchia sfocata e con il binocolo si vede già la nebulosa.", "nl": "Een wolk waarin sterren ontstaan, in het zwaard van Orion: met het blote oog een vaag vlekje, en met een verrekijker zie je de nevel al.", "zh": "猎户座宝剑处的恒星诞生区：肉眼看是一团模糊的光斑，用双筒望远镜就能看出星云。", "zht": "獵戶座寶劍處的恆星誕生區：肉眼看是一團模糊的光斑，用雙筒望遠鏡就能看出星雲。", "bg": "Облак, в който се раждат звезди, в меча на Орион: с просто око е мъгливо петно, а с бинокъл вече се вижда мъглявината.", "pl": "Obłok, w którym rodzą się gwiazdy, w mieczu Oriona: gołym okiem to mglista plamka, a przez lornetkę widać już mgławicę."},
    /* Royal Museums Greenwich, «What are the Pleiades?»: «relatively young... around 100
       million years», «only six usually visible to most people with the naked eye»; con
       prismaticos, «take in the entire cluster at once».
       https://www.rmg.co.uk/stories/space-astronomy/what-are-pleiades */
    M45: {"es": "Estrellas jóvenes, de unos cien millones de años. A simple vista casi todo el mundo distingue seis, y con prismáticos se ve el cúmulo entero.", "en": "Young stars, about a hundred million years old. Most people make out six with the naked eye, and binoculars take in the whole cluster.", "fr": "Des étoiles jeunes, d’environ cent millions d’années. À l’œil nu, la plupart des gens en distinguent six, et les jumelles embrassent l’amas entier.", "de": "Junge Sterne, etwa hundert Millionen Jahre alt. Mit bloßem Auge erkennen die meisten sechs, und das Fernglas zeigt den ganzen Haufen.", "it": "Stelle giovani, di circa cento milioni di anni. A occhio nudo quasi tutti ne distinguono sei, e il binocolo abbraccia l’ammasso intero.", "nl": "Jonge sterren, zo’n honderd miljoen jaar oud. Met het blote oog onderscheiden de meeste mensen er zes, en een verrekijker toont de hele sterrenhoop.", "zh": "由年轻恒星组成，年龄约一亿年。多数人肉眼能分辨出六颗，用双筒望远镜能看到整个星团。", "zht": "由年輕恆星組成，年齡約一億年。多數人肉眼能分辨出六顆，用雙筒望遠鏡能看到整個星團。", "bg": "Млади звезди, на около сто милиона години. С просто око повечето хора различават шест, а с бинокъл се вижда целият куп.", "pl": "Młode gwiazdy, liczące około stu milionów lat. Gołym okiem większość ludzi dostrzega sześć, a lornetka obejmuje całą gromadę."},
    /* ESA/Hubble, heic0809a: «the largest and brightest globular cluster in the sky».
       https://esahubble.org/images/heic0809a/ · Desde Izaña (28,3° N; dec. −47,5°) no
       pasa de unos 14° de altura: lo calcula datos/cielo.json (alt). */
    C80: {"es": "El cúmulo globular más grande y brillante del cielo. Desde Tenerife pasa bajo, por el sur: hace falta el horizonte sur despejado.", "en": "The largest and brightest globular cluster in the sky. From Tenerife it passes low in the south: you need a clear southern horizon.", "fr": "Le plus grand et le plus brillant amas globulaire du ciel. Depuis Tenerife, il passe bas au sud : il faut un horizon sud dégagé.", "de": "Der größte und hellste Kugelsternhaufen am Himmel. Von Teneriffa aus zieht er tief im Süden vorbei: Man braucht freie Sicht nach Süden.", "it": "L’ammasso globulare più grande e luminoso del cielo. Da Tenerife passa basso a sud: serve l’orizzonte sud libero.", "nl": "De grootste en helderste bolhoop aan de hemel. Vanaf Tenerife komt hij laag in het zuiden langs: je hebt een vrije zuidelijke horizon nodig.", "zh": "全天最大、最亮的球状星团。在特内里费它在南方低空经过，需要南方地平线开阔无遮挡。", "zht": "全天最大、最亮的球狀星團。在特內里費它在南方低空經過，需要南方地平線開闊無遮擋。", "bg": "Най-големият и най-ярък кълбовиден куп на небето. От Тенерифе минава ниско на юг: нужен е открит южен хоризонт.", "pl": "Największa i najjaśniejsza gromada kulista na niebie. Z Teneryfy przechodzi nisko na południu: potrzebny jest odsłonięty południowy horyzont."},
    /* Sky & Telescope, «An ancient eye test: Mizar and Alcor»: «this double star was used
       as a test to understand if someone had vision problems».
       https://skyandtelescope.org/online-gallery/an-ancient-eye-test-mizar-and-alcor/ */
    "d-mizar-alcor": {"es": "En el mango del Carro, la Osa Mayor: dos estrellas que se separan a simple vista, tradicionalmente una prueba de vista.", "en": "In the handle of the Big Dipper: two stars you can split by eye, traditionally a test of eyesight.", "fr": "Dans le manche de la Grande Casserole : deux étoiles séparables à l’œil nu, traditionnellement un test de vue.", "de": "In der Deichsel des Großen Wagens: zwei Sterne, die man mit bloßem Auge trennt, traditionell ein Sehtest.", "it": "Nel manico del Grande Carro: due stelle che si separano a occhio nudo, tradizionalmente una prova di vista.", "nl": "In de steel van de Grote Beer: twee sterren die je met het blote oog uit elkaar ziet, van oudsher een test voor de ogen.", "zh": "位于北斗七星的斗柄：肉眼即可分辨的两颗星，传统上被用来测试视力。", "zht": "位於北斗七星的斗柄：肉眼即可分辨的兩顆星，傳統上被用來測試視力。", "bg": "В дръжката на Голямата кола: две звезди, които се различават с просто око, по традиция проверка на зрението.", "pl": "W dyszlu Wielkiego Wozu: dwie gwiazdy rozróżnialne gołym okiem, tradycyjnie test wzroku."},
    /* Sky & Telescope, «Seeing double»: «a rich golden orange... clear sapphire blue»,
       «these heavenly hues are real — they’re not just a contrast effect», «even a
       2-inch-aperture scope at 25× resolves it». https://skyandtelescope.org/observing/seeing-double */
    "d-albireo": {"es": "Una estrella naranja dorada y otra azul, y los colores son de verdad, no un efecto del contraste. Un telescopio pequeño ya las separa.", "en": "A golden-orange star and a blue one, and the colours are real, not a contrast effect. Even a small telescope splits them.", "fr": "Une étoile orange doré et une bleue, et les couleurs sont réelles, pas un effet de contraste. Un petit télescope suffit à les séparer.", "de": "Ein goldorangefarbener und ein blauer Stern, und die Farben sind echt, kein Kontrasteffekt. Schon ein kleines Teleskop trennt sie.", "it": "Una stella arancione dorata e una azzurra, e i colori sono veri, non un effetto di contrasto. Basta un piccolo telescopio per separarle.", "nl": "Een goudoranje en een blauwe ster, en de kleuren zijn echt, geen contrasteffect. Een kleine telescoop splitst ze al.", "zh": "一颗金橙色的星和一颗蓝色的星，颜色是真实的，并非对比造成的错觉。小型望远镜即可将它们分开。", "zht": "一顆金橙色的星和一顆藍色的星，顏色是真實的，並非對比造成的錯覺。小型望遠鏡即可將它們分開。", "bg": "Златисто-оранжева и синя звезда, като цветовете са истински, а не ефект на контраста. Малък телескоп вече ги разделя.", "pl": "Złocistopomarańczowa i niebieska gwiazda, a barwy są prawdziwe, nie są złudzeniem kontrastu. Mały teleskop już je rozdziela."},
    /* BBC Sky at Night, «A guide to star Epsilon Lyrae»: «A concentrated naked eye study
       of Epsilon should, with good eyesight, split it in two», «a telescope reveals each
       to be a double again». https://www.skyatnightmagazine.com/advice/epsilon-lyrae
       Sky & Telescope, «Seeing double»: «readily resolved with the slightest
       magnification». https://skyandtelescope.org/observing/seeing-double */
    "d-eps-lyr": {"es": "Con buena vista se separan dos estrellas a simple vista, y con prismáticos sin esfuerzo; con telescopio, cada una vuelve a partirse en dos.", "en": "With good eyesight you can split two stars with the naked eye, and binoculars do it easily; a telescope splits each of them in two again.", "fr": "Avec une bonne vue, on sépare deux étoiles à l’œil nu, et aux jumelles sans effort ; au télescope, chacune se dédouble à son tour.", "de": "Mit guten Augen trennt man mit bloßem Auge zwei Sterne, im Fernglas mühelos; im Teleskop teilt sich jeder noch einmal in zwei.", "it": "Con una buona vista si separano due stelle a occhio nudo, e con il binocolo senza fatica; con il telescopio ognuna si sdoppia a sua volta.", "nl": "Met goede ogen zie je met het blote oog twee sterren, en met een verrekijker moeiteloos; met een telescoop splitst elk zich nog eens in tweeën.", "zh": "视力好的人肉眼就能分辨出两颗星，用双筒望远镜更是轻而易举；用天文望远镜，每颗又再分成两颗。", "zht": "視力好的人肉眼就能分辨出兩顆星，用雙筒望遠鏡更是輕而易舉；用天文望遠鏡，每顆又再分成兩顆。", "bg": "С добро зрение двете звезди се разделят с просто око, а с бинокъл — без усилие; с телескоп всяка отново се разделя на две.", "pl": "Przy dobrym wzroku gołym okiem widać dwie gwiazdy, a przez lornetkę bez trudu; w teleskopie każda znów dzieli się na dwie."},
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
    "cieloErrorCalculo": {"es": "No se pudo calcular esta vista. Prueba con otra noche.", "en": "This view couldn’t be calculated. Try another night.", "fr": "Impossible de calculer cet affichage. Essayez une autre nuit.", "de": "Diese Ansicht konnte nicht berechnet werden. Versuche eine andere Nacht.", "it": "Impossibile calcolare questa vista. Prova un’altra notte.", "nl": "Deze weergave kon niet worden berekend. Probeer een andere nacht.", "zh": "无法计算此视图，请换一晚试试。", "zht": "無法計算此檢視，請換一晚試試。", "bg": "Този изглед не можа да се изчисли. Опитайте друга нощ.", "pl": "Nie udało się obliczyć tego widoku. Wybierz inną noc."},
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
    "cieloLluviaThz": {"es": "Tasa teórica (THZ): {z} meteoros por hora con el radiante en el cenit y un cielo perfecto; en la práctica se ven menos.", "en": "Theoretical rate (ZHR): {z} meteors per hour with the radiant at the zenith and a perfect sky; in practice you see fewer.", "fr": "Taux théorique (THZ) : {z} météores par heure avec le radiant au zénith et un ciel parfait ; en pratique, on en voit moins.", "de": "Theoretische Rate (ZHR): {z} Meteore pro Stunde bei Radiant im Zenit und perfektem Himmel; in der Praxis sieht man weniger.", "it": "Tasso teorico (THZ): {z} meteore all’ora con il radiante allo zenit e un cielo perfetto; in pratica se ne vedono meno.", "nl": "Theoretische frequentie (ZHR): {z} meteoren per uur met de radiant in het zenit en een perfecte hemel; in de praktijk zie je er minder.", "zh": "理论流量（ZHR）：辐射点位于天顶且天空完美时每小时{z}颗；实际看到的会更少。", "zht": "理論流量（ZHR）：輻射點位於天頂且天空完美時每小時{z}顆；實際看到的會更少。", "bg": "Теоретична честота (ZHR): {z} метеора в час при радиант в зенита и идеално небе; на практика се виждат по-малко.", "pl": "Teoretyczna liczba (ZHR): {z} meteorów na godzinę przy radiancie w zenicie i idealnym niebie; w praktyce widać mniej."},
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
    "cieloEclSolAviso": {"es": "Nunca lo mires sin filtro: solo con gafas homologadas ISO 12312-2 o con un filtro solar delante del objetivo.", "en": "Never look without a filter: only with certified ISO 12312-2 eclipse glasses, or a solar filter in front of the lens.", "fr": "Ne la regardez jamais sans filtre : uniquement avec des lunettes certifiées ISO 12312-2, ou un filtre solaire devant l’objectif.", "de": "Nie ohne Filter hinsehen: nur mit zertifizierter Brille nach ISO 12312-2 oder einem Sonnenfilter vor dem Objektiv.", "it": "Non guardarla mai senza filtro: solo con occhiali certificati ISO 12312-2 o con un filtro solare davanti all’obiettivo.", "nl": "Kijk nooit zonder filter: alleen met een gecertificeerde ISO 12312-2-bril of een zonnefilter vóór het objectief.", "zh": "切勿无滤镜观看：只能使用符合ISO 12312-2标准的观测眼镜，或在镜头前加装太阳滤镜。", "zht": "切勿無濾鏡觀看：只能使用符合ISO 12312-2標準的觀測眼鏡，或在鏡頭前加裝太陽濾鏡。", "bg": "Никога не гледайте без филтър: само със сертифицирани очила по ISO 12312-2 или със слънчев филтър пред обектива.", "pl": "Nigdy nie patrz bez filtra: tylko w certyfikowanych okularach ISO 12312-2 albo przez filtr słoneczny założony przed obiektywem."},
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
    "cieloCometasTxt": {"es": "Los cometas no se pueden poner en un calendario fijo: muchos se descubren solo meses antes y su brillo es difícil de prever. Para los que haya a la vista, consulta las fuentes de abajo.", "en": "Comets can’t be put on a fixed calendar: many are discovered only months ahead and their brightness is hard to predict. For any on view, check the sources below.", "fr": "Les comètes ne peuvent pas figurer dans un calendrier fixe : beaucoup ne sont découvertes que quelques mois avant et leur éclat est difficile à prévoir. Pour celles qui sont visibles, consultez les sources ci-dessous.", "de": "Kometen lassen sich nicht in einen festen Kalender eintragen: Viele werden erst Monate vorher entdeckt, und ihre Helligkeit ist schwer vorherzusagen. Welche gerade sichtbar sind, steht in den Quellen unten.", "it": "Le comete non si possono mettere in un calendario fisso: molte vengono scoperte solo pochi mesi prima e la loro luminosità è difficile da prevedere. Per quelle visibili, consulta le fonti qui sotto.", "nl": "Kometen passen niet in een vaste kalender: veel worden pas maanden vooraf ontdekt en hun helderheid is moeilijk te voorspellen. Welke er te zien zijn, staat bij de bronnen hieronder.", "zh": "彗星无法排进固定的日历：许多彗星只在几个月前才被发现，亮度也难以预测。当前可见的彗星请查看下方来源。", "zht": "彗星無法排進固定的日曆：許多彗星只在幾個月前才被發現，亮度也難以預測。當前可見的彗星請查看下方來源。", "bg": "Кометите не могат да се впишат в постоянен календар: много от тях се откриват само месеци по-рано, а яркостта им трудно се предвижда. За видимите в момента вижте източниците по-долу.", "pl": "Komet nie da się wpisać do stałego kalendarza: wiele odkrywa się zaledwie kilka miesięcy wcześniej, a ich jasność trudno przewidzieć. Te widoczne obecnie znajdziesz w źródłach poniżej."},
    "cieloSatelitesTxt": {"es": "Los pasos de la Estación Espacial Internacional cambian cada día y según el lugar: la NASA los avisa en su aplicación «Spot the Station» (iOS y Android). Se ve como un punto muy brillante que cruza el cielo en pocos minutos, sin parpadear.", "en": "International Space Station passes change daily and by location: NASA announces them in its Spot the Station app (iOS and Android). It looks like a very bright dot crossing the sky in a few minutes, without blinking.", "fr": "Les passages de la Station spatiale internationale changent chaque jour et selon le lieu : la NASA les annonce dans son application « Spot the Station » (iOS et Android). Elle ressemble à un point très brillant qui traverse le ciel en quelques minutes, sans clignoter.", "de": "Die Überflüge der Internationalen Raumstation ändern sich täglich und je nach Ort: Die NASA kündigt sie in ihrer App „Spot the Station“ an (iOS und Android). Sie sieht aus wie ein sehr heller Punkt, der in wenigen Minuten über den Himmel zieht, ohne zu blinken.", "it": "I passaggi della Stazione spaziale internazionale cambiano ogni giorno e a seconda del luogo: la NASA li segnala nella sua app «Spot the Station» (iOS e Android). Appare come un punto molto luminoso che attraversa il cielo in pochi minuti, senza lampeggiare.", "nl": "De overkomsten van het Internationaal Ruimtestation veranderen elke dag en per plaats: NASA meldt ze in haar app Spot the Station (iOS en Android). Het lijkt een heel helder puntje dat in een paar minuten langs de hemel trekt, zonder te knipperen.", "zh": "国际空间站的过境时间每天都在变化，也因地点而异：NASA会在其应用“Spot the Station”（iOS和安卓）中发布提醒。它看起来像一个非常明亮的光点，几分钟内划过天空，不会闪烁。", "zht": "國際太空站的過境時間每天都在變化，也因地點而異：NASA會在其應用程式「Spot the Station」（iOS和Android）中發布提醒。它看起來像一個非常明亮的光點，幾分鐘內劃過天空，不會閃爍。", "bg": "Преминаванията на Международната космическа станция се менят всеки ден и според мястото: НАСА ги обявява в приложението си „Spot the Station“ (iOS и Android). Тя изглежда като много ярка точка, която прекосява небето за няколко минути, без да мига.", "pl": "Przeloty Międzynarodowej Stacji Kosmicznej zmieniają się codziennie i zależą od miejsca: NASA podaje je w swojej aplikacji „Spot the Station” (iOS i Android). Wygląda jak bardzo jasny punkt, który w kilka minut przecina niebo, nie migając."},
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
    "cieloCatMas": {"es": "Y {n} más: escribe para afinar la búsqueda.", "en": "And {n} more: type to narrow the search.", "fr": "Et {n} de plus : tapez pour affiner la recherche.", "de": "Und {n} weitere: tippe, um die Suche einzugrenzen.", "it": "E altri {n}: scrivi per restringere la ricerca.", "nl": "En nog {n}: typ om de zoekopdracht te verfijnen.", "zh": "还有{n}项：输入文字以缩小范围。", "zht": "還有{n}項：輸入文字以縮小範圍。", "bg": "И още {n}: пишете, за да стесните търсенето.", "pl": "I jeszcze {n}: wpisz, aby zawęzić wyszukiwanie."},
    "cieloNotaNiveles": {"es": "El instrumento sale del brillo de cada objeto, corregido por lo que lo apaga la atmósfera a la altura máxima que alcanza desde Tenerife, con umbrales prudentes para prismáticos 10×50 y un cielo oscuro. Con Luna o desde la costa, cuenta con que muchos pidan un nivel más.", "en": "The instrument comes from each object’s brightness, corrected for how much the atmosphere dims it at its highest point seen from Tenerife, with cautious thresholds for 10×50 binoculars and a dark sky. With moonlight or from the coast, expect many to need one level more.", "fr": "L’instrument découle de l’éclat de chaque objet, corrigé de l’atténuation par l’atmosphère à la hauteur maximale qu’il atteint depuis Tenerife, avec des seuils prudents pour des jumelles 10×50 et un ciel noir. Avec la Lune ou depuis la côte, comptez souvent un niveau de plus.", "de": "Das Instrument ergibt sich aus der Helligkeit jedes Objekts, korrigiert um die Abschwächung durch die Atmosphäre in der größten Höhe, die es von Teneriffa aus erreicht, mit vorsichtigen Schwellen für ein 10×50-Fernglas und dunklen Himmel. Bei Mondlicht oder von der Küste aus braucht vieles eine Stufe mehr.", "it": "Lo strumento deriva dalla luminosità di ogni oggetto, corretta per l’assorbimento dell’atmosfera all’altezza massima che raggiunge da Tenerife, con soglie prudenti per un binocolo 10×50 e un cielo buio. Con la Luna o dalla costa, molti richiedono un livello in più.", "nl": "Het instrument volgt uit de helderheid van elk object, gecorrigeerd voor de verzwakking door de atmosfeer op de grootste hoogte die het vanaf Tenerife bereikt, met voorzichtige drempels voor een 10×50-verrekijker en een donkere hemel. Met maanlicht of vanaf de kust heeft veel een niveau meer nodig.", "zh": "所需器材依据每个天体的亮度确定，并按其在特内里费所能达到的最高高度扣除大气消光，阈值按10×50双筒望远镜和黑暗天空保守设定。有月光或在海边时，许多天体需要再升一级器材。", "zht": "所需器材依據每個天體的亮度確定，並按其在特內里費所能達到的最高高度扣除大氣消光，門檻按10×50雙筒望遠鏡和黑暗天空保守設定。有月光或在海邊時，許多天體需要再升一級器材。", "bg": "Уредът се определя от яркостта на всеки обект, коригирана с отслабването от атмосферата при най-голямата височина, която достига от Тенерифе, с предпазливи прагове за бинокъл 10×50 и тъмно небе. При Луна или от брега много обекти изискват едно ниво нагоре.", "pl": "Sprzęt wynika z jasności każdego obiektu, skorygowanej o osłabienie przez atmosferę na największej wysokości, jaką osiąga z Teneryfy, z ostrożnymi progami dla lornetki 10×50 i ciemnego nieba. Przy Księżycu lub z wybrzeża wiele obiektów wymaga poziomu wyżej."},
    "cieloNotaMessier": {"es": "Incluye {m} objetos Messier, {c} del catálogo Caldwell que asoman desde Tenerife, las estrellas con nombre más brillantes, {d} estrellas dobles y múltiples, {v} variables y las {k} constelaciones.", "en": "Includes {m} Messier objects, {c} Caldwell objects that rise above Tenerife’s horizon, the brightest named stars, {d} double and multiple stars, {v} variable stars and all {k} constellations.", "fr": "Comprend {m} objets de Messier, {c} objets du catalogue de Caldwell visibles depuis Tenerife, les étoiles nommées les plus brillantes, {d} étoiles doubles et multiples, {v} étoiles variables et les {k} constellations.", "de": "Enthält {m} Messier-Objekte, {c} Caldwell-Objekte, die über Teneriffas Horizont steigen, die hellsten Sterne mit Eigennamen, {d} Doppel- und Mehrfachsterne, {v} Veränderliche und alle {k} Sternbilder.", "it": "Comprende {m} oggetti di Messier, {c} oggetti del catalogo Caldwell visibili da Tenerife, le stelle con nome più luminose, {d} stelle doppie e multiple, {v} variabili e tutte le {k} costellazioni.", "nl": "Bevat {m} Messier-objecten, {c} Caldwell-objecten die boven de horizon van Tenerife komen, de helderste sterren met een naam, {d} dubbel- en meervoudige sterren, {v} veranderlijke sterren en alle {k} sterrenbeelden.", "zh": "收录{m}个梅西耶天体、{c}个在特内里费可升到地平线以上的科德韦尔天体、最亮的有名恒星、{d}个双星与聚星、{v}颗变星，以及全部{k}个星座。", "zht": "收錄{m}個梅西耶天體、{c}個在特內里費可升到地平線以上的科德韋爾天體、最亮的有名恆星、{d}個雙星與聚星、{v}顆變星，以及全部{k}個星座。", "bg": "Включва {m} обекта на Месие, {c} обекта от каталога на Колдуел, които изгряват над Тенерифе, най-ярките звезди с имена, {d} двойни и кратни звезди, {v} променливи звезди и всичките {k} съзвездия.", "pl": "Zawiera {m} obiektów Messiera, {c} obiektów z katalogu Caldwella widocznych z Teneryfy, najjaśniejsze gwiazdy z nazwami, {d} gwiazd podwójnych i wielokrotnych, {v} gwiazd zmiennych i wszystkie {k} gwiazdozbiorów."},
    "cieloMesesAyuda": {"es": "Meses en que sube alto en plena noche", "en": "Months when it is high in full darkness", "fr": "Mois où il est haut en pleine nuit", "de": "Monate, in denen es bei voller Dunkelheit hoch steht", "it": "Mesi in cui è alto a notte fonda", "nl": "Maanden waarin het hoog staat als het volledig donker is", "zh": "完全天黑时位置较高的月份", "zht": "完全天黑時位置較高的月份", "bg": "Месеци, в които е високо при пълна тъмнина", "pl": "Miesiące, gdy jest wysoko w pełnej ciemności"},
    "cieloVerEnMapa": {"es": "Ver en el mapa del cielo", "en": "Show on the sky map", "fr": "Voir sur la carte du ciel", "de": "Auf der Himmelskarte zeigen", "it": "Vedi sulla mappa del cielo", "nl": "Toon op de hemelkaart", "zh": "在星图中查看", "zht": "在星圖中查看", "bg": "Покажи на картата на небето", "pl": "Pokaż na mapie nieba"},
    "cieloRasante": {"es": "Muy bajo", "en": "Very low", "fr": "Très bas", "de": "Sehr tief", "it": "Molto basso", "nl": "Erg laag", "zh": "很低", "zht": "很低", "bg": "Много ниско", "pl": "Bardzo nisko"},
    "cieloAltMax": {"es": "Altura máxima desde Tenerife: {alt}°", "en": "Highest point from Tenerife: {alt}°", "fr": "Hauteur maximale depuis Tenerife : {alt}°", "de": "Größte Höhe von Teneriffa aus: {alt}°", "it": "Altezza massima da Tenerife: {alt}°", "nl": "Grootste hoogte vanaf Tenerife: {alt}°", "zh": "在特内里费的最大高度：{alt}°", "zht": "在特內里費的最大高度：{alt}°", "bg": "Най-голяма височина от Тенерифе: {alt}°", "pl": "Największa wysokość z Teneryfy: {alt}°"},
    "cieloDistancia": {"es": "A unos {d} años luz", "en": "About {d} light-years away", "fr": "À environ {d} années-lumière", "de": "Etwa {d} Lichtjahre entfernt", "it": "A circa {d} anni luce", "nl": "Op ongeveer {d} lichtjaar", "zh": "距离约{d}光年", "zht": "距離約{d}光年", "bg": "На около {d} светлинни години", "pl": "Odległość: około {d} lat świetlnych"},
    "cieloEspectro": {"es": "Tipo espectral: {s}", "en": "Spectral type: {s}", "fr": "Type spectral : {s}", "de": "Spektraltyp: {s}", "it": "Tipo spettrale: {s}", "nl": "Spectraaltype: {s}", "zh": "光谱型：{s}", "zht": "光譜型：{s}", "bg": "Спектрален клас: {s}", "pl": "Typ widmowy: {s}"},
    "cieloVariableRango": {"es": "Su brillo varía entre mag. {a} y {b}", "en": "Brightness varies between mag {a} and {b}", "fr": "Son éclat varie entre mag. {a} et {b}", "de": "Helligkeit schwankt zwischen {a} und {b} mag", "it": "La luminosità varia tra mag. {a} e {b}", "nl": "Helderheid varieert tussen mag. {a} en {b}", "zh": "亮度在星等{a}至{b}之间变化", "zht": "亮度在星等{a}至{b}之間變化", "bg": "Яркостта се мени между {a} и {b} зв. вел.", "pl": "Jasność zmienia się od {a} do {b} mag"},
    "cieloSeparacion": {"es": "Separación: {s}″ (segundos de arco)", "en": "Separation: {s}″ (arcseconds)", "fr": "Écartement : {s}″ (secondes d’arc)", "de": "Abstand: {s}″ (Bogensekunden)", "it": "Separazione: {s}″ (secondi d’arco)", "nl": "Afstand: {s}″ (boogseconden)", "zh": "角距：{s}″（角秒）", "zht": "角距：{s}″（角秒）", "bg": "Разстояние: {s}″ (дъгови секунди)", "pl": "Odległość kątowa: {s}″ (sekundy łuku)"},
    "cieloSeparacionMin": {"es": "Separación: {s}′ (minutos de arco)", "en": "Separation: {s}′ (arcminutes)", "fr": "Écartement : {s}′ (minutes d’arc)", "de": "Abstand: {s}′ (Bogenminuten)", "it": "Separazione: {s}′ (primi d’arco)", "nl": "Afstand: {s}′ (boogminuten)", "zh": "角距：{s}′（角分）", "zht": "角距：{s}′（角分）", "bg": "Разстояние: {s}′ (дъгови минути)", "pl": "Odległość kątowa: {s}′ (minuty łuku)"},
    "cieloOrbitaRapida": {"es": "La pareja gira en unos {a} años: la separación cambia y aquí no se da.", "en": "The pair orbits in about {a} years: the separation changes, so it isn’t given here.", "fr": "Le couple tourne en environ {a} ans : l’écartement change, il n’est donc pas donné ici.", "de": "Das Paar umkreist sich in etwa {a} Jahren: Der Abstand ändert sich und wird hier nicht angegeben.", "it": "La coppia ruota in circa {a} anni: la separazione cambia e qui non viene indicata.", "nl": "Het paar draait in ongeveer {a} jaar om elkaar: de afstand verandert en staat hier niet.", "zh": "两星的轨道周期约{a}年：角距不断变化，此处不列出。", "zht": "兩星的軌道週期約{a}年：角距不斷變化，此處不列出。", "bg": "Двойката обикаля за около {a} години: разстоянието се мени и тук не се дава.", "pl": "Para okrąża się w około {a} lat: odległość się zmienia, więc jej tu nie podajemy."},
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
    "cieloMapaNota": {"es": "El cielo entero: el cenit en el centro, el horizonte en el borde y la dirección elegida abajo. Arrastra para mover, pellizca para ampliar y toca un astro para ver qué es.", "en": "The whole sky: zenith in the middle, horizon at the edge and the chosen direction at the bottom. Drag to move, pinch to zoom and tap an object to see what it is.", "fr": "Le ciel entier : le zénith au centre, l’horizon sur le bord et la direction choisie en bas. Faites glisser pour déplacer, pincez pour zoomer et touchez un astre pour savoir ce que c’est.", "de": "Der ganze Himmel: Zenit in der Mitte, Horizont am Rand und die gewählte Richtung unten. Ziehen zum Verschieben, mit zwei Fingern zoomen und ein Objekt antippen, um zu sehen, was es ist.", "it": "Il cielo intero: lo zenit al centro, l’orizzonte sul bordo e la direzione scelta in basso. Trascina per spostare, pizzica per ingrandire e tocca un astro per sapere cos’è.", "nl": "De hele hemel: het zenit in het midden, de horizon aan de rand en de gekozen richting onderaan. Sleep om te verschuiven, knijp om te zoomen en tik op een object om te zien wat het is.", "zh": "全天投影：天顶在中央，地平线在边缘，所选方向在下方。拖动可移动，双指缩放，点击天体可查看名称。", "zht": "全天投影：天頂在中央，地平線在邊緣，所選方向在下方。拖曳可移動，雙指縮放，點擊天體可查看名稱。", "bg": "Цялото небе: зенитът е в средата, хоризонтът е по ръба, а избраната посока е долу. Плъзнете за преместване, разтворете два пръста за увеличение и докоснете обект, за да видите какво е.", "pl": "Całe niebo: zenit na środku, horyzont na brzegu, a wybrany kierunek na dole. Przeciągnij, aby przesunąć, rozsuń palce, aby powiększyć, i dotknij obiektu, aby zobaczyć, co to jest."},
    "cieloMapaToca": {"es": "Toca una estrella, un planeta o un objeto para ver qué es.", "en": "Tap a star, planet or object to see what it is.", "fr": "Touchez une étoile, une planète ou un objet pour savoir ce que c’est.", "de": "Tippe auf einen Stern, Planeten oder ein Objekt, um zu sehen, was es ist.", "it": "Tocca una stella, un pianeta o un oggetto per sapere cos’è.", "nl": "Tik op een ster, planeet of object om te zien wat het is.", "zh": "点击恒星、行星或天体即可查看名称。", "zht": "點擊恆星、行星或天體即可查看名稱。", "bg": "Докоснете звезда, планета или обект, за да видите какво е.", "pl": "Dotknij gwiazdy, planety lub obiektu, aby zobaczyć, co to jest."},
    "cieloMapaDeDia": {"es": "Es de día: el Sol está sobre el horizonte. Mueve la hora a la noche.", "en": "It’s daytime: the Sun is up. Move the time to the night.", "fr": "Il fait jour : le Soleil est levé. Déplacez l’heure vers la nuit.", "de": "Es ist Tag: Die Sonne steht am Himmel. Schiebe die Uhrzeit in die Nacht.", "it": "È giorno: il Sole è sopra l’orizzonte. Sposta l’ora alla notte.", "nl": "Het is dag: de zon staat boven de horizon. Schuif de tijd naar de nacht.", "zh": "现在是白天：太阳在地平线以上。请把时间调到夜晚。", "zht": "現在是白天：太陽在地平線以上。請把時間調到夜晚。", "bg": "Ден е: Слънцето е над хоризонта. Преместете часа към нощта.", "pl": "Jest dzień: Słońce jest nad horyzontem. Przesuń godzinę na noc."},
    "cieloMapaCrepusculo": {"es": "Crepúsculo: solo se ven las estrellas más brillantes y los planetas.", "en": "Twilight: only the brightest stars and planets show.", "fr": "Crépuscule : seules les étoiles les plus brillantes et les planètes sont visibles.", "de": "Dämmerung: Nur die hellsten Sterne und die Planeten sind zu sehen.", "it": "Crepuscolo: si vedono solo le stelle più luminose e i pianeti.", "nl": "Schemering: alleen de helderste sterren en de planeten zijn te zien.", "zh": "暮光时分：只能看到最亮的恒星和行星。", "zht": "暮光時分：只能看到最亮的恆星和行星。", "bg": "Здрач: виждат се само най-ярките звезди и планетите.", "pl": "Zmierzch: widać tylko najjaśniejsze gwiazdy i planety."},
    "cieloAltDir": {"es": "A {alt}° de altura, {dir}", "en": "{alt}° high, {dir}", "fr": "À {alt}° de hauteur, {dir}", "de": "{alt}° hoch, {dir}", "it": "A {alt}° di altezza, {dir}", "nl": "{alt}° hoog, {dir}", "zh": "高度{alt}°，{dir}", "zht": "高度{alt}°，{dir}", "bg": "На {alt}° височина, {dir}", "pl": "{alt}° nad horyzontem, {dir}"},
    "cieloBajoHorizonte": {"es": "Bajo el horizonte en este momento", "en": "Below the horizon right now", "fr": "Sous l’horizon en ce moment", "de": "Gerade unter dem Horizont", "it": "Sotto l’orizzonte in questo momento", "nl": "Op dit moment onder de horizon", "zh": "此刻在地平线以下", "zht": "此刻在地平線以下", "bg": "В момента е под хоризонта", "pl": "W tej chwili pod horyzontem"},
    "cieloAvisoSol": {"es": "Nunca mires el Sol con prismáticos ni telescopio sin un filtro solar homologado: daña la vista al instante.", "en": "Never look at the Sun through binoculars or a telescope without a certified solar filter: it damages your eyes instantly.", "fr": "Ne regardez jamais le Soleil avec des jumelles ou un télescope sans filtre solaire certifié : il abîme les yeux instantanément.", "de": "Schau nie ohne zertifizierten Sonnenfilter mit Fernglas oder Teleskop in die Sonne: Das schädigt die Augen sofort.", "it": "Non guardare mai il Sole con binocolo o telescopio senza un filtro solare certificato: danneggia la vista all’istante.", "nl": "Kijk nooit door een verrekijker of telescoop naar de zon zonder gecertificeerd zonnefilter: dat beschadigt je ogen meteen.", "zh": "切勿在没有合格太阳滤镜的情况下用双筒或天文望远镜看太阳：会立刻伤害眼睛。", "zht": "切勿在沒有合格太陽濾鏡的情況下用雙筒或天文望遠鏡看太陽：會立刻傷害眼睛。", "bg": "Никога не гледайте Слънцето с бинокъл или телескоп без сертифициран слънчев филтър: уврежда очите мигновено.", "pl": "Nigdy nie patrz na Słońce przez lornetkę ani teleskop bez certyfikowanego filtra słonecznego: natychmiast uszkadza wzrok."},
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
    "cieloConsejo1": {"es": "Antes de subir, mira la previsión de montaña (nubes, viento, polvo en suspensión) y el estado de las carreteras.", "en": "Before driving up, check the mountain forecast (cloud, wind, dust haze) and road conditions.", "fr": "Avant de monter, consultez la météo de montagne (nuages, vent, brume de poussière) et l’état des routes.", "de": "Prüfe vor der Fahrt nach oben die Bergwettervorhersage (Wolken, Wind, Staubdunst) und den Straßenzustand.", "it": "Prima di salire, controlla le previsioni di montagna (nuvole, vento, foschia di polvere) e lo stato delle strade.", "nl": "Kijk voor je naar boven gaat naar de bergweersverwachting (wolken, wind, stofnevel) en de toestand van de wegen.", "zh": "上山前查看山区天气预报（云量、风力、沙尘）和道路状况。", "zht": "上山前查看山區天氣預報（雲量、風力、沙塵）和道路狀況。", "bg": "Преди да се качите, проверете планинската прогноза (облаци, вятър, прашна мъгла) и състоянието на пътищата.", "pl": "Przed wyjazdem w góry sprawdź prognozę górską (chmury, wiatr, mgiełka pyłowa) i stan dróg."},
    "cieloConsejo2": {"es": "En las cumbres refresca mucho de noche, también en verano: lleva abrigo y gorro.", "en": "At the summits nights get cold, even in summer: bring a warm jacket and a hat.", "fr": "Sur les sommets, les nuits sont fraîches, même en été : prévoyez une veste chaude et un bonnet.", "de": "Auf den Gipfeln werden die Nächte kalt, auch im Sommer: Nimm eine warme Jacke und eine Mütze mit.", "it": "In vetta le notti sono fredde, anche d’estate: porta una giacca pesante e un berretto.", "nl": "Op de toppen worden de nachten koud, ook in de zomer: neem een warme jas en een muts mee.", "zh": "山顶夜间很冷，夏天也不例外：请带上保暖外套和帽子。", "zht": "山頂夜間很冷，夏天也不例外：請帶上保暖外套和帽子。", "bg": "На върховете нощите са студени, дори през лятото: вземете топло яке и шапка.", "pl": "Na szczytach noce są zimne, nawet latem: weź ciepłą kurtkę i czapkę."},
    "cieloConsejo3": {"es": "Apaga las luces blancas y deja que la vista se adapte unos 20 minutos; usa la luz roja de esta pantalla.", "en": "Switch off white lights and let your eyes adapt for about 20 minutes; use this screen’s red light.", "fr": "Éteignez les lumières blanches et laissez vos yeux s’adapter environ 20 minutes ; utilisez la lumière rouge de cet écran.", "de": "Schalte weißes Licht aus und gib den Augen etwa 20 Minuten zum Anpassen; nutze das Rotlicht dieses Bildschirms.", "it": "Spegni le luci bianche e lascia che gli occhi si adattino per circa 20 minuti; usa la luce rossa di questo schermo.", "nl": "Doe witte lampen uit en laat je ogen zo’n 20 minuten wennen; gebruik het rode licht van dit scherm.", "zh": "关掉白光，让眼睛适应约20分钟；请使用本屏幕的红光模式。", "zht": "關掉白光，讓眼睛適應約20分鐘；請使用本螢幕的紅光模式。", "bg": "Изгасете белите светлини и оставете очите да свикнат около 20 минути; използвайте червената светлина на този екран.", "pl": "Zgaś białe światła i daj oczom około 20 minut na przyzwyczajenie; używaj czerwonego światła tego ekranu."},
    "cieloConsejo4": {"es": "Aparca solo en zonas habilitadas y no salgas de los senderos: es un Parque Nacional.", "en": "Park only in designated areas and stay on the trails: this is a National Park.", "fr": "Garez-vous uniquement sur les aires prévues et ne quittez pas les sentiers : c’est un parc national.", "de": "Parke nur auf ausgewiesenen Flächen und bleib auf den Wegen: Es ist ein Nationalpark.", "it": "Parcheggia solo nelle aree consentite e non uscire dai sentieri: è un Parco Nazionale.", "nl": "Parkeer alleen op aangewezen plekken en blijf op de paden: het is een nationaal park.", "zh": "只在指定区域停车，不要离开步道：这里是国家公园。", "zht": "只在指定區域停車，不要離開步道：這裡是國家公園。", "bg": "Паркирайте само на разрешените места и не излизайте от пътеките: това е национален парк.", "pl": "Parkuj tylko w wyznaczonych miejscach i nie schodź ze szlaków: to park narodowy."},
    "cieloConsejo5": {"es": "Baja despacio: son carreteras de montaña con muchas curvas, y de noche se conduce más cansado.", "en": "Drive back down slowly: these are winding mountain roads, and at night you are more tired.", "fr": "Redescendez lentement : ce sont des routes de montagne sinueuses, et la nuit on conduit plus fatigué.", "de": "Fahr langsam hinunter: Es sind kurvige Bergstraßen, und nachts fährt man müder.", "it": "Scendi piano: sono strade di montagna piene di curve, e di notte si guida più stanchi.", "nl": "Rij langzaam terug naar beneden: het zijn bochtige bergwegen en ’s nachts ben je vermoeider.", "zh": "下山时慢慢开：山路弯多，夜间驾驶也更容易疲劳。", "zht": "下山時慢慢開：山路彎多，夜間駕駛也更容易疲勞。", "bg": "Слизайте бавно: пътищата са планински и с много завои, а нощем се шофира по-уморено.", "pl": "Zjeżdżaj powoli: to kręte górskie drogi, a w nocy jest się bardziej zmęczonym."},
    "cieloConsejo6": {"es": "Para caminar de noche lleva frontal (mejor con luz roja), agua y ropa de abrigo, y di a alguien adónde vas.", "en": "For night walks take a head torch (ideally with red light), water and warm clothes, and tell someone where you are going.", "fr": "Pour marcher de nuit, prenez une lampe frontale (avec lumière rouge si possible), de l’eau et des vêtements chauds, et dites à quelqu’un où vous allez.", "de": "Für Nachtwanderungen: Stirnlampe (am besten mit Rotlicht), Wasser und warme Kleidung mitnehmen, und jemandem sagen, wohin du gehst.", "it": "Per camminare di notte porta una frontale (meglio con luce rossa), acqua e vestiti caldi, e di’ a qualcuno dove vai.", "nl": "Neem voor nachtwandelingen een hoofdlamp (liefst met rood licht), water en warme kleren mee, en vertel iemand waar je heen gaat.", "zh": "夜间徒步请带头灯（最好有红光）、饮水和保暖衣物，并告诉别人你的去向。", "zht": "夜間健行請帶頭燈（最好有紅光）、飲水和保暖衣物，並告訴別人你的去向。", "bg": "За нощни преходи вземете челник (за предпочитане с червена светлина), вода и топли дрехи и кажете на някого къде отивате.", "pl": "Na nocne wędrówki weź czołówkę (najlepiej z czerwonym światłem), wodę i ciepłe ubranie, i powiedz komuś, dokąd idziesz."},
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
    "cieloCreditoStellarium": {"es": "Stellarium: nombres, variables y lluvias (GitHub)", "en": "Stellarium: names, variables and showers (GitHub)", "fr": "Stellarium : noms, variables et étoiles filantes (GitHub)", "de": "Stellarium: Namen, Veränderliche und Meteorströme (GitHub)", "it": "Stellarium: nomi, variabili e stelle cadenti (GitHub)", "nl": "Stellarium: namen, veranderlijke sterren en meteorenzwermen (GitHub)", "zh": "Stellarium：名称、变星与流星雨（GitHub）", "zht": "Stellarium：名稱、變星與流星雨（GitHub）", "bg": "Stellarium: имена, променливи звезди и метеорни потоци (GitHub)", "pl": "Stellarium: nazwy, gwiazdy zmienne i roje (GitHub)"}
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
    mapa: { desfase: 0, mirando: 180, zoom: 1, cx: 0, cy: 0, sel: null, lineas: true, nombres: true, profundo: true, t: null },
    nubes: null, nubesPidiendo: false,
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
    return e;
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
  /* «Esta noche» a las dos de la madrugada es la que empezo ayer. */
  function nocheDeHoy() { var ahora = new Date(); return partes(ahora).hour < 12 ? sumarDias(fechaLocal(ahora), -1) : fechaLocal(ahora); }
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
    D.via.forEach(function (pol) { pol.v = pol[1].map(function (p) { return unitario(p[0], p[1]); }); });
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

  /* Doce meses desde hoy (los eclipses, tres anos). `fecha` (AAAA-MM-DD) es
     para las pruebas: tools/auditar_cielo.js pide el calendario desde un dia
     fijo para cotejarlo con el IGN, el IMCCE y la IMO; ese no se guarda. */
  function eventos(fecha) {
    var hoy = fecha || fechaLocal(new Date());
    if (!fecha && S.eventos && S.eventosDia === hoy) return S.eventos;
    var desde = instanteLocal(hoy, 0, 0), hasta = new Date(desde.getTime() + 366 * 864e5);
    var hastaEcl = new Date(desde.getTime() + 3 * 366 * 864e5);
    var ev = [].concat(eventosLluvias(desde, hasta), eventosEclipses(desde, hastaEcl), eventosPlanetas(desde, hasta), eventosSolLuna(desde, hasta));
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
  function selectorFecha(c) {
    var f = el('div', 'cielo-fecha');
    var a = el('button', null, '‹'); a.type = 'button'; a.setAttribute('aria-label', T('NocheAnterior'));
    var b = el('button', null, '›'); b.type = 'button'; b.setAttribute('aria-label', T('NocheSiguiente'));
    var hoy = nocheDeHoy();
    var txt = S.fecha === hoy ? T('EstaNoche') : T('NocheDel', { f: dia(instanteLocal(S.fecha, 12, 0)) });
    var m = el('div', 'cielo-fecha-txt', txt);
    a.addEventListener('click', function () { S.fecha = sumarDias(S.fecha, -1); pintar(); });
    b.addEventListener('click', function () { S.fecha = sumarDias(S.fecha, 1); pintar(); });
    f.appendChild(a); f.appendChild(m); f.appendChild(b);
    if (S.fecha !== hoy) { var h = el('button', 'cielo-hoy', T('Hoy')); h.type = 'button'; h.addEventListener('click', function () { S.fecha = hoy; pintar(); }); f.appendChild(h); }
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
  var FILTROS_CAL = [['todo', 'CalTodo'], ['lluvia', 'CalLluvias'], ['eclipse', 'CalEclipses'], ['planeta', 'CalPlanetas'], ['sol', 'CalSolLuna']];
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
    }
    return '';
  }
  var ICONO_EV = { lluvia: '☄️', eclipseSol: '🌒', eclipseLuna: '🌕', oposicion: '🪐', elongacion: '🌆', conjuncion: '💫', estacion: '🌍', lunaCerca: '🌕' };
  function detalleEvento(e) {
    var A = Astronomy, d = [];
    switch (e.tipo) {
      case 'lluvia':
        d.push(T('LluviaMax', { f: dia(e.t), h: hora(e.t) }));
        d.push(e.l.thz ? T('LluviaThz', { z: e.l.thz }) : T('LluviaThzVar'));
        d.push(T('LluviaMejor', { f: dia(A.MakeTime(e.mejor.u).date), h: hora(A.MakeTime(e.mejor.u).date), alt: numero(e.mejor.alt, 0), dir: hacia(e.mejor.az) }));
        d.push(T('LluviaLuna', { p: numero(e.luz * 100, 0) }) + (e.lunaArriba ? '' : ' ' + T('LluviaLunaAbajo')) + ' · ' + T('Cond' + e.cond));
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
  function filaEvento(e) {
    var it = el('div', 'cielo-item');
    it.appendChild(el('div', 'cielo-item-ico', ICONO_EV[e.tipo] || '✨'));
    var tt = el('div', 'cielo-item-txt');
    tt.appendChild(el('div', 'cielo-item-nom', tituloEvento(e)));
    detalleEvento(e).forEach(function (x) { tt.appendChild(el('div', 'cielo-item-sub', x)); });
    it.appendChild(tt);
    var der = el('div', 'cielo-item-der', dia(e.t)); it.appendChild(der);
    return it;
  }
  function pintarCalendario(c) {
    var chips = el('div', 'cielo-chips');
    FILTROS_CAL.forEach(function (f) {
      var b = el('button', null, T(f[1])); b.type = 'button';
      b.setAttribute('aria-pressed', S.cal === f[0] ? 'true' : 'false');
      b.addEventListener('click', function () { S.cal = f[0]; pintar(); });
      chips.appendChild(b);
    });
    c.appendChild(chips);
    var grupo = { lluvia: 'lluvia', eclipseSol: 'eclipse', eclipseLuna: 'eclipse', oposicion: 'planeta', elongacion: 'planeta', conjuncion: 'planeta', estacion: 'sol', lunaCerca: 'sol' };
    var ahora = new Date(), unAnio = new Date(ahora.getTime() + 366 * 864e5);
    var lista = eventos().filter(function (e) {
      if (S.cal !== 'todo' && grupo[e.tipo] !== S.cal) return false;
      if (e.t < new Date(ahora.getTime() - 2 * 864e5)) return false;
      return e.tipo === 'eclipseSol' || e.tipo === 'eclipseLuna' || e.t < unAnio;
    });
    if (!lista.length) c.appendChild(el('div', 'cielo-estado', T('SinEventos')));
    var mesAnt = '';
    lista.forEach(function (e) {
      var m = mesAnio(e.t);
      if (m !== mesAnt) { c.appendChild(el('div', 'cielo-mes-cab', m)); mesAnt = m; }
      var t = el('div', 'cielo-tarjeta'); t.appendChild(filaEvento(e)); c.appendChild(t);
    });
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

  /* ── PESTANA «MAPA DEL CIELO» ──────────────────────────────────────
     Proyeccion estereografica con el cenit en el centro y el horizonte en el
     borde, como un planisferio. «Mirando» es la direccion que queda abajo:
     mirando al sur, el este a la izquierda y el oeste a la derecha, que es
     como se ve al levantar la vista. Se redibuja solo cuando algo cambia. */
  function instanteMapa() {
    var base = S.mapa.t ? S.mapa.t.getTime() : Date.now();
    return new Date(base + S.mapa.desfase * 60000);
  }
  function pararMapa() { if (S.mapa.reloj) { clearInterval(S.mapa.reloj); S.mapa.reloj = null; } }
  function irAlMapa(o) {
    S.pestana = 'mapa';
    S.mapa.t = o.t || null; S.mapa.porDefecto = !o.t; S.mapa.ahora = false;
    S.mapa.desfase = 0; S.mapa.zoom = 1; S.mapa.cx = 0; S.mapa.cy = 0;
    horaPorDefecto();
    var t = Astronomy.MakeTime(instanteMapa()), h;
    if (o.planeta) h = cuerpoHorizonte(Astronomy.Body[o.planeta], t);
    else h = aHorizonte(rotacion(t), o.v);
    if (h.alt > 0) S.mapa.mirando = h.az;
    S.mapa.sel = o.planeta ? { planeta: o.planeta } : { v: o.v, nombre: o.nombre, des: o.des };
    pintar();
  }
  function botonMapa(txt, pulsado, fn, ayuda) {
    var b = el('button', null, txt); b.type = 'button';
    if (pulsado !== null) b.setAttribute('aria-pressed', pulsado ? 'true' : 'false');
    if (ayuda) { b.title = ayuda; b.setAttribute('aria-label', ayuda); }
    b.addEventListener('click', fn);
    return b;
  }
  /* La carta sigue a la noche elegida. Abierta de dia, un cielo azul no
     ensena nada: se pone la hora en que empieza la noche cerrada, y «Ahora»
     vuelve al momento real. Un momento elegido (el mejor de un planeta, de un
     objeto) se respeta. */
  function horaPorDefecto() {
    if (S.mapa.t && !S.mapa.porDefecto) return;
    var hoy = S.fecha === nocheDeHoy();
    if (S.mapa.ahora && hoy) return;
    var deDia = cuerpoHorizonte(Astronomy.Body.Sun, Astronomy.MakeTime(new Date())).alt > -6;
    if (!hoy || deDia) { S.mapa.t = noche().oscuro.date; S.mapa.porDefecto = true; }
    else { S.mapa.t = null; S.mapa.porDefecto = false; }
  }
  function pintarMapa(c) {
    horaPorDefecto();
    var caja = el('div', 'cielo-mapa-caja');
    var cv = el('canvas');
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', T('MapaAria'));
    caja.appendChild(cv); c.appendChild(caja);
    S.mapa.canvas = cv;
    var sel = el('div', 'cielo-sel'); c.appendChild(sel); S.mapa.caja = sel;
    /* hora */
    var c1 = el('div', 'cielo-mapa-ctl');
    var lh = el('span', 'cielo-mapa-hora'); S.mapa.etiqueta = lh;
    var rg = el('input'); rg.type = 'range'; rg.min = -360; rg.max = 720; rg.step = 10; rg.value = S.mapa.desfase;
    rg.setAttribute('aria-label', T('MapaHora'));
    rg.addEventListener('input', function () { S.mapa.desfase = +rg.value; dibujar(); });
    c1.appendChild(lh); c1.appendChild(rg);
    c1.appendChild(botonMapa(T('Ahora'), null, function () {
      S.mapa.t = null; S.mapa.ahora = true; S.mapa.porDefecto = false; S.mapa.desfase = 0; S.fecha = nocheDeHoy(); pintar();
    }));
    c.appendChild(c1);
    /* hacia donde se mira y zoom */
    var c2 = el('div', 'cielo-mapa-ctl');
    c2.appendChild(el('span', 'cielo-nota', T('Mirando')));
    [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'O']].forEach(function (x) {
      c2.appendChild(botonMapa(T('Rumbo' + x[1]), Math.round(S.mapa.mirando) % 360 === x[0], function () { S.mapa.mirando = x[0]; S.mapa.cx = S.mapa.cy = 0; pintar(); }));
    });
    c2.appendChild(botonMapa('−', null, function () { zoomMapa(1 / 1.5); }, T('Alejar')));
    c2.appendChild(botonMapa('+', null, function () { zoomMapa(1.5); }, T('Acercar')));
    c.appendChild(c2);
    var c3 = el('div', 'cielo-mapa-ctl');
    c3.appendChild(botonMapa(T('MapaLineas'), S.mapa.lineas, function () { S.mapa.lineas = !S.mapa.lineas; pintar(); }));
    c3.appendChild(botonMapa(T('MapaNombres'), S.mapa.nombres, function () { S.mapa.nombres = !S.mapa.nombres; pintar(); }));
    c3.appendChild(botonMapa(T('MapaProfundo'), S.mapa.profundo, function () { S.mapa.profundo = !S.mapa.profundo; pintar(); }));
    c.appendChild(c3);
    c.appendChild(el('div', 'cielo-nota', T('MapaNota')));
    tocarMapa(cv);
    requestAnimationFrame(function () { dibujar(); });
    pararMapa();
    if (!S.mapa.t) S.mapa.reloj = setInterval(function () { if (S.abierto && S.pestana === 'mapa' && !S.mapa.t) dibujar(); }, 60000);
  }
  function zoomMapa(f) {
    S.mapa.zoom = Math.max(1, Math.min(5, S.mapa.zoom * f));
    if (S.mapa.zoom === 1) { S.mapa.cx = 0; S.mapa.cy = 0; }
    dibujar();
  }
  function tocarMapa(cv) {
    var p = {}, pinza = null;
    cv.addEventListener('pointerdown', function (e) {
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      p[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: Date.now() };
      var ids = Object.keys(p);
      if (ids.length === 2) { var a = p[ids[0]], b = p[ids[1]]; pinza = { d: Math.hypot(a.x - b.x, a.y - b.y), z: S.mapa.zoom }; }
    });
    cv.addEventListener('pointermove', function (e) {
      var q = p[e.pointerId]; if (!q) return;
      var dx = e.clientX - q.x, dy = e.clientY - q.y;
      q.x = e.clientX; q.y = e.clientY;
      var ids = Object.keys(p);
      if (ids.length === 2 && pinza) {
        var a = p[ids[0]], b = p[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        S.mapa.zoom = Math.max(1, Math.min(5, pinza.z * d / Math.max(10, pinza.d)));
        dibujar();
      } else if (ids.length === 1 && S.mapa.zoom > 1) {
        S.mapa.cx += dx; S.mapa.cy += dy; dibujar();
      }
    });
    function soltar(e) {
      var q = p[e.pointerId]; delete p[e.pointerId];
      if (Object.keys(p).length < 2) pinza = null;
      if (q && Math.hypot(e.clientX - q.x0, e.clientY - q.y0) < 8 && Date.now() - q.t0 < 500) elegir(e);
    }
    cv.addEventListener('pointerup', soltar);
    cv.addEventListener('pointercancel', function (e) { delete p[e.pointerId]; pinza = null; });
  }
  function elegir(e) {
    var cv = S.mapa.canvas, r = cv.getBoundingClientRect(), dpr = S.mapa.dpr || 1;
    var x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr, mejor = null;
    (S.mapa.dianas || []).forEach(function (d) {
      var dist = Math.hypot(d.x - x, d.y - y) - d.r;
      if (dist < 22 * dpr && (!mejor || dist + d.prio * 4 * dpr < mejor.dist + mejor.prio * 4 * dpr)) mejor = { dist: dist, prio: d.prio, d: d };
    });
    S.mapa.sel = mejor ? mejor.d.sel : null;
    dibujar();
  }
  function colorBV(bv) {
    if (bv === null || bv === undefined) return '#ffffff';
    if (bv < 0) return '#b5c7ff';
    if (bv < 0.3) return '#dbe4ff';
    if (bv < 0.6) return '#fbf8ff';
    if (bv < 1.0) return '#fff2d6';
    if (bv < 1.4) return '#ffd9a8';
    return '#ffbf80';
  }
  function dibujar() {
    var cv = S.mapa.canvas;
    if (!cv || !cv.isConnected || !S.datos) return;
    var A = Astronomy, D = S.datos, M = S.mapa;
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var css = cv.parentNode.clientWidth || 340;
    var W = Math.round(css * dpr), H = W;
    if (cv.width !== W) { cv.width = W; cv.height = H; }
    cv.style.height = css + 'px';
    M.dpr = dpr;
    var ctx = cv.getContext('2d');
    var t = instanteMapa(), at = A.MakeTime(t), rot = rotacion(at);
    var R0 = W / 2 - 22 * dpr, R = R0 * M.zoom, cx = W / 2 + M.cx * dpr, cy = H / 2 + M.cy * dpr, F = M.mirando;
    var esc = Math.sqrt(M.zoom);
    function proy(alt, az) {
      var rho = R * Math.tan((90 - Math.max(alt, -40)) * Math.PI / 360);
      var a = (az - F + 180) * Math.PI / 180;
      return [cx - rho * Math.sin(a), cy - rho * Math.cos(a)];
    }
    var dianas = [], rotulos = [];
    function rotulo(txt, x, y, tam, color, prio, centro, peso) { rotulos.push({ txt: txt, x: x, y: y, tam: tam, color: color, prio: prio, centro: centro, peso: peso || '' }); }
    /* fondo y cielo */
    var sol = cuerpoHorizonte(A.Body.Sun, at).alt;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#02040c'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.closePath();
    ctx.fillStyle = sol > 0 ? '#27477d' : sol > -6 ? '#16295a' : sol > -12 ? '#0c1838' : sol > -18 ? '#070e24' : '#03061a';
    ctx.fill(); ctx.clip();
    /* circulos de altura: 30 y 60 grados */
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1 * dpr;
    [30, 60].forEach(function (a) { ctx.beginPath(); ctx.arc(cx, cy, R * Math.tan((90 - a) * Math.PI / 360), 0, 2 * Math.PI); ctx.stroke(); });
    var oscuro = sol < -12;
    /* Via Lactea */
    if (oscuro) {
      D.via.forEach(function (pol) {
        ctx.beginPath();
        pol.v.forEach(function (v, i) {
          var h = aHorizonte(rot, v), q = proy(h.alt, h.az);
          if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(170,185,230,' + (0.035 + 0.02 * (pol[0] - 1)) + ')';
        ctx.fill();
      });
    }
    /* lineas de las constelaciones */
    if (M.lineas) {
      ctx.strokeStyle = 'rgba(120,160,230,0.38)'; ctx.lineWidth = 1 * dpr;
      Object.keys(D.lin).forEach(function (c) {
        D.linV[c].forEach(function (tr) {
          ctx.beginPath();
          var prev = null;
          tr.forEach(function (v) {
            var h = aHorizonte(rot, v), q = proy(h.alt, h.az);
            if (prev && (prev.alt > -5 || h.alt > -5)) { ctx.moveTo(prev.q[0], prev.q[1]); ctx.lineTo(q[0], q[1]); }
            prev = { alt: h.alt, q: q };
          });
          ctx.stroke();
        });
      });
    }
    /* estrellas */
    var limite = sol > -6 ? 1.5 : sol > -12 ? 3 : sol > -18 ? 4.5 : 5.5;
    D.est.forEach(function (s) {
      if (s[2] > limite + Math.log(M.zoom) * 1.2) return;
      var h = aHorizonte(rot, s.v); if (h.alt < 0) return;
      var q = proy(h.alt, h.az);
      var r = Math.max(0.55, (3.1 - 0.5 * s[2])) * dpr * esc;
      ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 2 * Math.PI);
      ctx.fillStyle = colorBV(s[3]); ctx.globalAlpha = Math.max(0.35, Math.min(1, 1.25 - s[2] / 7)); ctx.fill(); ctx.globalAlpha = 1;
      if (s[2] < 4.5) dianas.push({ x: q[0], y: q[1], r: r, prio: 3, sel: { est: s } });
    });
    /* cielo profundo */
    if (M.profundo && sol < -12) {
      D.objetos.forEach(function (o) {
        /* de lejos, solo lo de simple vista y los Messier de prismaticos; al
           acercar entra el resto: con todo a la vez la carta es un borron */
        if (!o.niv || (M.zoom < 1.5 && (o.niv === 3 || (o.niv === 2 && !o.M))) || (M.zoom < 2 && o.niv === 3 && !o.M)) return;
        var h = aHorizonte(rot, o.v); if (h.alt < 0) return;
        var q = proy(h.alt, h.az), r = 3.2 * dpr * esc;
        ctx.strokeStyle = ['', 'rgba(155,226,158,0.85)', 'rgba(156,205,250,0.8)', 'rgba(224,168,239,0.75)'][o.niv];
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        if (o.t === 'gal') ctx.ellipse(q[0], q[1], r * 1.5, r * 0.8, 0.5, 0, 2 * Math.PI);
        else if (o.t === 'neb' || o.t === 'cne' || o.t === 'snr') ctx.rect(q[0] - r, q[1] - r, 2 * r, 2 * r);
        else ctx.arc(q[0], q[1], r, 0, 2 * Math.PI);
        ctx.stroke();
        if (M.nombres && (M.zoom >= 1.5 || o.niv === 1))
          rotulo(o.M ? 'M' + o.M : (o.C ? 'C' + o.C : o.id), q[0] + r + 2 * dpr, q[1] + 3 * dpr, 9, 'rgba(255,255,255,0.5)', 30 + (o.m || 9));
        dianas.push({ x: q[0], y: q[1], r: r, prio: 2, sel: { obj: o } });
      });
    }
    /* nombres de constelaciones y de estrellas */
    if (M.nombres) {
      /* las constelaciones grandes primero: si dos nombres se pisan, se queda
         el de la que tiene mas estrellas a simple vista */
      Object.keys(D.con).forEach(function (c) {
        var x = D.con[c];
        x.etV.forEach(function (v) {
          var h = aHorizonte(rot, v); if (h.alt < 3) return;
          var q = proy(h.alt, h.az);
          rotulo(nombreCon(c), q[0], q[1], 10, 'rgba(212,175,55,0.62)', 20 - Math.min(10, (x.n6v || 0) / 15), true, '600 ');
        });
      });
      D.estrellas.forEach(function (e) {
        if (e.m > 1.6 && e.h !== 11767) return;
        var h = aHorizonte(rot, e.v); if (h.alt < 1) return;
        var q = proy(h.alt, h.az);
        rotulo(nombreEstrella(e.h) || e.n, q[0] + 5 * dpr, q[1] - 4 * dpr, 9.5, 'rgba(255,255,255,0.72)', 5 + e.m);
      });
    }
    /* Luna, planetas y Sol */
    ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Moon', 'Sun'].forEach(function (p) {
      var h = cuerpoHorizonte(A.Body[p], at); if (h.alt < -1) return;
      var q = proy(h.alt, h.az);
      var r = (p === 'Moon' || p === 'Sun') ? 7 * dpr * esc : 3.4 * dpr * esc;
      ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 2 * Math.PI);
      ctx.fillStyle = { Sun: '#ffd54f', Moon: '#f2ecd0', Mars: '#ff8a65', Jupiter: '#ffe0b2', Saturn: '#f0d58c', Venus: '#fffde7', Mercury: '#d7ccc8', Uranus: '#b2ebf2', Neptune: '#90caf9' }[p];
      ctx.fill();
      rotulo(nom(CIELO_CUERPO, p), q[0] + r + 3 * dpr, q[1] + 3 * dpr, 10, '#F5C76B', 0, false, '700 ');
      dianas.push({ x: q[0], y: q[1], r: r, prio: 0, sel: { planeta: p } });
    });
    /* lo elegido */
    var s = M.sel, sq = null;
    if (s) {
      var hs = s.planeta ? cuerpoHorizonte(A.Body[s.planeta], at) : aHorizonte(rot, s.v || (s.est && s.est.v) || (s.obj && s.obj.v));
      if (hs && hs.alt > -1) {
        sq = proy(hs.alt, hs.az);
        ctx.strokeStyle = '#F5C76B'; ctx.lineWidth = 1.6 * dpr;
        ctx.beginPath(); ctx.arc(sq[0], sq[1], 11 * dpr, 0, 2 * Math.PI); ctx.stroke();
      }
      s.alt = hs ? hs.alt : null; s.az = hs ? hs.az : null;
    }
    /* los rotulos, por orden de importancia y sin pisarse */
    rotulos.sort(function (a, b) { return a.prio - b.prio; });
    var ocupado = [];
    rotulos.forEach(function (r) {
      ctx.font = r.peso + (r.tam * dpr) + 'px DM Sans, sans-serif';
      var w = ctx.measureText(r.txt).width, h = r.tam * dpr;
      var x0 = r.centro ? r.x - w / 2 : r.x;
      var caja = [x0 - 2 * dpr, r.y - h, x0 + w + 2 * dpr, r.y + 3 * dpr];
      if (ocupado.some(function (o) { return caja[0] < o[2] && caja[2] > o[0] && caja[1] < o[3] && caja[3] > o[1]; })) return;
      ocupado.push(caja);
      ctx.fillStyle = r.color; ctx.textAlign = r.centro ? 'center' : 'left';
      ctx.fillText(r.txt, r.x, r.y);
    });
    ctx.textAlign = 'left';
    ctx.restore();
    /* horizonte y puntos cardinales */
    ctx.strokeStyle = 'rgba(212,175,55,0.5)'; ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
    ctx.font = '700 ' + (11 * dpr) + 'px DM Sans, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < 8; i++) {
      var q = proy(-6, i * 45);
      var dx = q[0] - cx, dy = q[1] - cy, L = Math.hypot(dx, dy) || 1;
      var x = cx + dx / L * (R + 11 * dpr), y = cy + dy / L * (R + 11 * dpr);
      if (x < 6 * dpr || y < 6 * dpr || x > W - 6 * dpr || y > H - 6 * dpr) continue;
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.45)' : '#F5C76B';
      ctx.fillText(T('Rumbo' + RUMBOS[i]), x, y);
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    M.dianas = dianas;
    if (M.etiqueta) M.etiqueta.textContent = hora(t);
    if (M.caja) pintarSeleccion(t, sol);
  }
  function pintarSeleccion(t, sol) {
    var c = S.mapa.caja, s = S.mapa.sel;
    c.textContent = '';
    var cab = el('div');
    cab.appendChild(el('b', null, dia(t) + ' · ' + hora(t)));
    if (sol > -6) cab.appendChild(document.createTextNode(' · ' + T(sol > 0 ? 'MapaDeDia' : 'MapaCrepusculo')));
    c.appendChild(cab);
    if (!s) { c.appendChild(el('div', null, T('MapaToca'))); return; }
    /* extra: textos, y las designaciones ya como desig() */
    var nombre = '', desNombre = null, extra = [];
    if (s.planeta) { nombre = nom(CIELO_CUERPO, s.planeta); if (s.planeta !== 'Sun') extra.push(T('Mag', { m: mag(Astronomy.Illumination(Astronomy.Body[s.planeta], Astronomy.MakeTime(t)).mag) })); }
    else if (s.est) {
      var e = s.est, n = S.datos.estrellas.filter(function (x) { return x.h === e[4]; })[0];
      nombre = n ? (nombreEstrella(n.h) || n.n) : T('TipoEstrella');
      if (n && n.b) extra.push(desig(n.b, 'cielo-sel-des'));
      extra.push(T('Mag', { m: mag(e[2]) }));
    } else if (s.obj) {
      nombre = nombreObjeto(s.obj); desNombre = designacionObjeto(s.obj);
      if (nombre) extra.push(desig(desNombre, 'cielo-sel-des'));
      extra.push(nom(CIELO_TIPO, s.obj.t)); if (s.obj.m !== null) extra.push(T('Mag', { m: mag(s.obj.m) }));
    } else {
      nombre = s.nombre || '';
      if (s.des) { desNombre = s.des; if (nombre && nombre !== s.des) extra.unshift(desig(s.des, 'cielo-sel-des')); }
    }
    var d = el('div');
    d.appendChild(desNombre !== null ? nombreODesig('b', null, nombre, desNombre) : el('b', null, nombre));
    extra.forEach(function (x) {
      d.appendChild(document.createTextNode(' · '));
      d.appendChild(typeof x === 'string' ? document.createTextNode(x) : x);
    });
    c.appendChild(d);
    if (s.alt !== null && s.alt !== undefined) c.appendChild(el('div', null, s.alt > 0 ? T('AltDir', { alt: numero(s.alt, 0), dir: hacia(s.az) }) : T('BajoHorizonte')));
    if (s.planeta === 'Sun') c.appendChild(el('div', 'cielo-aviso', T('AvisoSol')));
  }

  /* ── ABRIR Y CERRAR ────────────────────────────────────────────── */
  function rojo(si) {
    S.rojo = !!si;
    document.documentElement.classList.toggle('cielo-rojo', S.rojo && S.abierto);
    try { localStorage.setItem('tgo_cielo_rojo', S.rojo ? '1' : '0'); } catch (e) {}
    var b = document.getElementById('cielo-rojo'); if (b) b.setAttribute('aria-pressed', S.rojo ? 'true' : 'false');
  }
  function abrir() {
    var p = document.getElementById('cielo-panel');
    if (!p) return;
    ['fi-panel', 'mc-panel', 'wx-panel', 'mar-panel'].forEach(function (id) { var x = document.getElementById(id); if (x) x.style.display = 'none'; });
    p.style.display = 'flex';
    S.abierto = true;
    if (!S.fecha) S.fecha = nocheDeHoy();
    document.documentElement.classList.toggle('cielo-rojo', S.rojo);
    pintar();
    cargar().then(function () { pedirNubes(); pintar(); }, function () { pintar(); });
  }
  function cerrar() {
    var p = document.getElementById('cielo-panel');
    if (p) p.style.display = 'none';
    S.abierto = false;
    pararMapa();
    document.documentElement.classList.remove('cielo-rojo');
  }
  function alternar() { if (S.abierto) cerrar(); else abrir(); }

  /* El boton y el cierre los lleva el cargador de index.html, que existe
     desde el arranque; aqui solo lo que necesita el modulo ya cargado. */
  function iniciar() {
    var r = document.getElementById('cielo-rojo');
    if (r) { r.hidden = false; r.addEventListener('click', function () { rojo(!S.rojo); }); }
    try { S.rojo = localStorage.getItem('tgo_cielo_rojo') === '1'; } catch (e) {}
    document.addEventListener('keydown', function (e) { if (S.abierto && e.key === 'Escape') cerrar(); });
    try {
      /* Al cambiar de idioma se rehace lo que esta abierto: los textos salen
         del idioma en cada pintado, no se guardan. */
      TG_IDIOMA.registrar('cielo de Tenerife', function () { if (S.abierto) pintar(); });
    } catch (e) {}
  }
  iniciar();

  /* Para las herramientas de tools/ (auditar_cielo.js, barrido_pantallas.js):
     el estado y los calculos, sin tocar nada. ver() abre una pestana y
     espera a que el catalogo y el motor esten cargados. */
  window.TG_CIELO = {
    abrir: abrir, cerrar: cerrar, estado: S, cargar: cargar,
    ver: function (p, fecha) { S.pestana = p || 'noche'; if (fecha) S.fecha = fecha; abrir(); return cargar().then(function () { pintar(); }); },
    eventos: function (fecha) { return eventos(fecha); },
    noche: function (f) { return calcularNoche(f); },
    planetas: function (f) { return planetasNoche(calcularNoche(f)); },
    mejores: function (f) { return mejoresNoche(calcularNoche(f)); },
    viaLactea: function (f) { var n = calcularNoche(f), v = viaLacteaNoche(n); return v.mejor ? v : { motivo: v.motivo, vuelve: v.motivo === 'abajo' ? vuelveViaLactea(f) : null }; },
    catalogo: function () { return catalogo(); }
  };
})();
