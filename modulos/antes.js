/* modulos/antes.js — la pantalla «Antes de salir» (20 de noviembre de 2026).

   QUE ES. Jerome, el 19 de noviembre de 2026, al ver el estudio de modulos
   nuevos: «Si prepáralo». Una tarjeta en el panel de Rutas que se toca y se
   abre a pantalla completa, como «Su cuerpo», con lo que hay que mirar antes
   de ir a la montaña o a la costa: lo que dicen hoy las fuentes oficiales,
   con su fecha.

   NO TRAE NI UN DATO NUEVO DE LUGARES. Todo sale de lo que la app ya tiene
   verificado:
     · «Hoy»: los avisos de AEMET para Tenerife (los mismos que el panel del
       tiempo: wxVigentes y wxLineas de index.html), las alertas del Gobierno
       de Canarias de las ultimas 48 horas (datos/alertas-canarias.json, el
       mismo robot que usa el SOS) y los lugares con estado «restringido»,
       «cerrado» o «solo_reserva» (el campo estado de cada ficha, con su
       fuente y su fecha de verificacion; tools/probar_estado.js).
     · «Reservas»: las fichas con reserva:true, menos las de comer, el golf y
       la playa, con la ficha de cada una a un toque y, en las que se ha
       comprobado, el enlace oficial donde se reserva.
   Lo unico escrito aqui son cuatro avisos generales de la pestaña Reservas
   (las plazas de los lunes, la reserva propia del pico, el documento de
   identidad y la Central de Reservas de las acampadas), comprobados el
   20 de noviembre de 2026 con sus fuentes (ANTES_FUENTES, abajo).

   EL CASO DE PLAYA JARDIN. Un estado viejo es peor que ninguno: cada aviso
   lleva su fecha («Comprobado el …») y, pasados VIEJO_DIAS, la linea «Puede
   haber cambiado: confírmelo antes de ir». La frase de cada aviso es la
   primera de la ficha, si empieza por «⚠️»: la misma que lee quien abre la
   ficha, en su idioma. Las fichas cuyo texto no explica su estado van en
   SIN_FRASE (se ensena el estado, sin frase).

   COMO SE PINTA. Como el SOS: createElement y textContent; innerHTML solo
   para el SVG de la flecha, de este fichero. Los textos, de ANTES_UI (once
   idiomas) o de UI_TX (tx) los que comparte con index.html. Al cambiar de
   idioma se repinta (TG_IDIOMA). El boton «atras» del movil cierra la
   pantalla (una entrada de historial, como el SOS). */
(function () {
  'use strict';

  var REVISADO = '2026-11-20';
  var ZONA = 'Atlantic/Canary';
  /* SIN-TRADUCIR: ANTES_LOCALE codigos de idioma para Intl (fechas), no textos */
  var ANTES_LOCALE = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL', ro: 'ro-RO' };
  var VIEJO_DIAS = 14;
  var ALERTAS_URL = './datos/alertas-canarias.json';
  var ALERTAS_MS = 48 * 3600000;
  var ALERTAS_VIEJO_MS = 6 * 3600000;
  var ALERTAS_MAX = 3;

  var ANTES_UI = {
    "antesSub": {"es": "Lo que dicen hoy las fuentes oficiales, con su fecha. Antes de ir, compruébelo en su web.", "en": "What the official sources say today, with their dates. Before you go, check their website.", "fr": "Ce que disent aujourd’hui les sources officielles, avec leur date. Avant de partir, vérifiez sur leur site.", "de": "Was die offiziellen Quellen heute sagen, jeweils mit Datum. Prüfen Sie es vor dem Losgehen auf deren Website.", "it": "Che cosa dicono oggi le fonti ufficiali, con la data. Prima di partire, lo verifichi sul loro sito.", "nl": "Wat de officiële bronnen vandaag zeggen, met de datum erbij. Controleer het op hun website voordat u vertrekt.", "zh": "官方来源今天怎么说，均注明日期。出发前，请在其官网上再确认一下。", "zht": "官方來源今天怎麼說，均註明日期。出發前，請在其官網上再確認一下。", "bg": "Какво казват днес официалните източници, с датата им. Преди да тръгнете, проверете на сайта им.", "pl": "Co mówią dziś oficjalne źródła, z datą. Przed wyjściem najlepiej sprawdzić to na ich stronie.", "ro": "Ce spun astăzi sursele oficiale, cu data lor. Înainte de a pleca, verificați pe site-ul lor."},
    "antesPestHoy": {"es": "Hoy", "en": "Today", "fr": "Aujourd’hui", "de": "Heute", "it": "Oggi", "nl": "Vandaag", "zh": "今天", "zht": "今天", "bg": "Днес", "pl": "Dziś", "ro": "Astăzi"},
    "antesPestReservas": {"es": "Reservas", "en": "Bookings", "fr": "Réservations", "de": "Reservierungen", "it": "Prenotazioni", "nl": "Reserveringen", "zh": "预约", "zht": "預約", "bg": "Резервации", "pl": "Rezerwacje", "ro": "Rezervări"},
    "antesAvisosTit": {"es": "Avisos oficiales", "en": "Official warnings", "fr": "Alertes officielles", "de": "Offizielle Warnungen", "it": "Allerte ufficiali", "nl": "Officiële waarschuwingen", "zh": "官方预警", "zht": "官方預警", "bg": "Официални предупреждения", "pl": "Oficjalne ostrzeżenia", "ro": "Avertizări oficiale"},
    "antesAemetCargando": {"es": "Comprobando los avisos de AEMET…", "en": "Checking AEMET warnings…", "fr": "Vérification des alertes de l’AEMET…", "de": "AEMET-Warnungen werden geprüft…", "it": "Controllo delle allerte AEMET…", "nl": "AEMET-waarschuwingen worden gecontroleerd…", "zh": "正在核对 AEMET 的预警……", "zht": "正在核對 AEMET 的預警……", "bg": "Проверяват се предупрежденията на AEMET…", "pl": "Sprawdzanie ostrzeżeń AEMET…", "ro": "Se verifică avertizările AEMET…"},
    "antesAlertasTit": {"es": "Alertas del Gobierno de Canarias", "en": "Alerts from the Government of the Canary Islands", "fr": "Alertes du gouvernement des Canaries", "de": "Warnstufen der Regierung der Kanaren", "it": "Allerte del Governo delle Canarie", "nl": "Waarschuwingen van de regering van de Canarische Eilanden", "zh": "加那利群岛政府的警报", "zht": "加那利群島政府的警報", "bg": "Тревоги, обявени от правителството на Канарските острови", "pl": "Alerty rządu Wysp Kanaryjskich", "ro": "Alertele Guvernului Insulelor Canare"},
    "antesAlertasNota": {"es": "Titulares oficiales de las últimas 48 horas, en castellano: toque uno para leerlo entero.", "en": "Official headlines from the last 48 hours, in Spanish: tap one to read it in full.", "fr": "Titres officiels des dernières 48 heures, en espagnol : touchez-en un pour le lire en entier.", "de": "Offizielle Schlagzeilen der letzten 48 Stunden, auf Spanisch: Tippen Sie eine an, um sie ganz zu lesen.", "it": "Titoli ufficiali delle ultime 48 ore, in spagnolo: ne tocchi uno per leggerlo per intero.", "nl": "Officiële koppen van de laatste 48 uur, in het Spaans: tik er een aan om hem helemaal te lezen.", "zh": "最近 48 小时的官方标题为西班牙语：点击即可阅读全文。", "zht": "最近 48 小時的官方標題為西班牙文：點選即可閱讀全文。", "bg": "Официални заглавия от последните 48 часа, на испански: докоснете някое, за да го прочетете целия.", "pl": "Oficjalne nagłówki z ostatnich 48 godzin, po hiszpańsku: dotknięcie nagłówka otwiera całą wiadomość.", "ro": "Titlurile oficiale din ultimele 48 de ore, în spaniolă: atingeți unul ca să-l citiți integral."},
    "antesAlertasNinguna": {"es": "Ninguna alerta nueva en las últimas 48 horas.", "en": "No new alerts in the last 48 hours.", "fr": "Aucune nouvelle alerte ces dernières 48 heures.", "de": "Keine neue Warnstufe in den letzten 48 Stunden.", "it": "Nessuna nuova allerta nelle ultime 48 ore.", "nl": "Geen nieuwe waarschuwing in de laatste 48 uur.", "zh": "最近 48 小时没有新的警报。", "zht": "最近 48 小時沒有新的警報。", "bg": "Няма нови тревоги през последните 48 часа.", "pl": "Brak nowych alertów w ciągu ostatnich 48 godzin.", "ro": "Nicio alertă nouă în ultimele 48 de ore."},
    "antesAlertasCargando": {"es": "Comprobando las alertas del Gobierno de Canarias…", "en": "Checking alerts from the Government of the Canary Islands…", "fr": "Vérification des alertes du gouvernement des Canaries…", "de": "Warnstufen der Regierung der Kanaren werden geprüft…", "it": "Controllo delle allerte del Governo delle Canarie…", "nl": "Waarschuwingen van de regering van de Canarische Eilanden worden gecontroleerd…", "zh": "正在核对加那利群岛政府的警报……", "zht": "正在核對加那利群島政府的警報……", "bg": "Проверяват се тревогите на правителството на Канарските острови…", "pl": "Sprawdzanie alertów rządu Wysp Kanaryjskich…", "ro": "Se verifică alertele Guvernului Insulelor Canare…"},
    "antesAlertasViejo": {"es": "No se ha podido comprobar desde {f}. Consulte la web del Gobierno de Canarias.", "en": "It hasn’t been possible to check since {f}. See the Government of the Canary Islands website.", "fr": "Impossible de vérifier depuis le {f}. Consultez le site du gouvernement des Canaries.", "de": "Seit {f} konnte nicht geprüft werden. Sehen Sie auf der Website der Regierung der Kanaren nach.", "it": "Non è stato possibile verificare dal {f}. Consulti il sito del Governo delle Canarie.", "nl": "Sinds {f} kon er niet worden gecontroleerd. Kijk op de website van de regering van de Canarische Eilanden.", "zh": "自 {f} 起未能核实。请查看加那利群岛政府网站。", "zht": "自 {f} 起未能核實。請查看加那利群島政府網站。", "bg": "От {f} не е било възможно да се провери. Вижте сайта на правителството на Канарските острови.", "pl": "Od {f} nie udało się tego sprawdzić. Aktualne informacje są na stronie rządu Wysp Kanaryjskich.", "ro": "Nu s-a mai putut verifica de la {f}. Consultați site-ul Guvernului Insulelor Canare."},
    "antesLugaresTit": {"es": "Lugares con aviso", "en": "Places with a notice", "fr": "Lieux avec un avis", "de": "Orte mit Hinweis", "it": "Luoghi con un avviso", "nl": "Plaatsen met een melding", "zh": "有提示的地点", "zht": "有提示的地點", "bg": "Места с предупреждение", "pl": "Miejsca z ostrzeżeniem", "ro": "Locuri cu avertizare"},
    "antesLugaresNinguno": {"es": "Ahora ningún lugar de la app tiene aviso de cierre ni de acceso restringido.", "en": "Right now no place in the app has a closure or restricted-access notice.", "fr": "Pour l’instant, aucun lieu de l’app n’a d’avis de fermeture ni d’accès restreint.", "de": "Derzeit hat kein Ort in der App einen Hinweis auf Sperrung oder eingeschränkten Zugang.", "it": "Al momento nessun luogo dell’app ha un avviso di chiusura o di accesso limitato.", "nl": "Op dit moment heeft geen enkele plek in de app een melding van sluiting of beperkte toegang.", "zh": "目前应用中没有任何地点有关闭或限制进入的提示。", "zht": "目前應用程式中沒有任何地點有關閉或限制進入的提示。", "bg": "В момента нито едно място в приложението няма предупреждение за затваряне или ограничен достъп.", "pl": "Obecnie żadne miejsce w aplikacji nie ma ostrzeżenia o zamknięciu ani o ograniczonym dostępie.", "ro": "În acest moment niciun loc din aplicație nu are avertizare de închidere sau de acces restricționat."},
    "antesEst_restringido": {"es": "Acceso restringido", "en": "Restricted access", "fr": "Accès restreint", "de": "Eingeschränkter Zugang", "it": "Accesso limitato", "nl": "Beperkte toegang", "zh": "限制进入", "zht": "限制進入", "bg": "Ограничен достъп", "pl": "Ograniczony dostęp", "ro": "Acces restricționat"},
    "antesEst_cerrado": {"es": "Cerrado", "en": "Closed", "fr": "Fermé", "de": "Geschlossen", "it": "Chiuso", "nl": "Gesloten", "zh": "关闭", "zht": "關閉", "bg": "Затворено", "pl": "Zamknięte", "ro": "Închis"},
    "antesEst_solo_reserva": {"es": "Solo con reserva", "en": "Booking only", "fr": "Sur réservation uniquement", "de": "Nur mit Reservierung", "it": "Solo su prenotazione", "nl": "Alleen op reservering", "zh": "仅限预约", "zht": "僅限預約", "bg": "Само с резервация", "pl": "Tylko z rezerwacją", "ro": "Doar cu rezervare"},
    "antesComprobado": {"es": "Comprobado el {f}", "en": "Checked on {f}", "fr": "Vérifié le {f}", "de": "Geprüft am {f}", "it": "Verificato il {f}", "nl": "Gecontroleerd op {f}", "zh": "核实于 {f}", "zht": "核實於 {f}", "bg": "Проверено на {f}", "pl": "Sprawdzono {f}", "ro": "Verificat pe {f}"},
    "antesPuedeCambiar": {"es": "Puede haber cambiado: confírmelo antes de ir.", "en": "It may have changed: check before you go.", "fr": "Cela a pu changer : vérifiez avant de partir.", "de": "Das kann sich geändert haben: Prüfen Sie es vor dem Losgehen.", "it": "Potrebbe essere cambiato: lo verifichi prima di partire.", "nl": "Dit kan veranderd zijn: controleer het voordat u gaat.", "zh": "情况可能已有变化：出发前请再确认。", "zht": "情況可能已有變化：出發前請再確認。", "bg": "Може да се е променило: проверете, преди да тръгнете.", "pl": "Mogło się to zmienić: przed wyjściem najlepiej to sprawdzić.", "ro": "Este posibil să se fi schimbat: verificați înainte de a pleca."},
    "antesFuente": {"es": "Fuente", "en": "Source", "fr": "Source", "de": "Quelle", "it": "Fonte", "nl": "Bron", "zh": "来源", "zht": "來源", "bg": "Източник", "pl": "Źródło", "ro": "Sursa"},
    "antesVerMapa": {"es": "Ver en el mapa", "en": "Show on the map", "fr": "Voir sur la carte", "de": "Auf der Karte ansehen", "it": "Vedi sulla mappa", "nl": "Op de kaart bekijken", "zh": "在地图上查看", "zht": "在地圖上查看", "bg": "Вижте на картата", "pl": "Zobacz na mapie", "ro": "Vedeți pe hartă"},
    "antesResIntro": {"es": "Estos sitios piden reservar antes de ir. Lo que pide cada uno está en su ficha.", "en": "These places require booking before you go. What each one asks for is in its description.", "fr": "Ces lieux demandent de réserver avant d’y aller. Ce que chacun exige figure dans sa fiche.", "de": "Für diese Orte muss man vorher reservieren. Was jeder verlangt, steht in seiner Beschreibung.", "it": "Questi luoghi richiedono la prenotazione prima di andare. Che cosa chiede ciascuno è nella sua scheda.", "nl": "Voor deze plekken moet u vooraf reserveren. Wat elke plek vraagt, staat in de beschrijving.", "zh": "以下地点需要提前预约。各自的具体要求见其介绍。", "zht": "以下地點需要提前預約。各自的具體要求見其介紹。", "bg": "За тези места трябва да резервирате предварително. Изискванията на всяко са в неговото описание.", "pl": "Te miejsca wymagają wcześniejszej rezerwacji. Wymagania każdego z nich są w jego opisie.", "ro": "Aceste locuri cer rezervare înainte de a merge. Ce cere fiecare găsiți în descrierea lui."},
    "antesResLunes": {"es": "En Tenerife ON, las plazas nuevas de los senderos del Teide salen cada lunes a las 07:00 (hora de Canarias).", "en": "On Tenerife ON, new places for the Teide trails are released every Monday at 07:00 (Canary Islands time).", "fr": "Sur Tenerife ON, les nouvelles places des sentiers du Teide sont ouvertes chaque lundi à 07:00 (heure des Canaries).", "de": "Bei Tenerife ON werden neue Plätze für die Teide-Wege jeden Montag um 07:00 Uhr (kanarische Zeit) freigegeben.", "it": "Su Tenerife ON, i nuovi posti per i sentieri del Teide escono ogni lunedì alle 07:00 (ora delle Canarie).", "nl": "Op Tenerife ON komen nieuwe plaatsen voor de Teide-paden elke maandag om 07:00 uur (Canarische tijd) vrij.", "zh": "在 Tenerife ON 上，泰德峰步道的新名额于每周一 07:00（加那利群岛时间）放出。", "zht": "在 Tenerife ON 上，泰德峰步道的新名額於每週一 07:00（加那利群島時間）釋出。", "bg": "В Tenerife ON новите места за пътеките на Тейде се пускат всеки понеделник в 07:00 (канарско време).", "pl": "W Tenerife ON nowe miejsca na szlaki Teide pojawiają się w każdy poniedziałek o 07:00 (czasu kanaryjskiego).", "ro": "Pe Tenerife ON, locurile noi pentru traseele Teide apar în fiecare luni la ora 07:00 (ora Insulelor Canare)."},
    "antesResPico": {"es": "La subida al pico (PNT 10) tiene su propia reserva, aparte de la de los otros senderos, y no va unida al teleférico.", "en": "The climb to the summit (PNT 10) has its own booking, separate from the other trails, and it is not tied to the cable car.", "fr": "La montée au sommet (PNT 10) a sa propre réservation, distincte de celle des autres sentiers, et n’est pas liée au téléphérique.", "de": "Der Aufstieg zum Gipfel (PNT 10) hat eine eigene Reservierung, getrennt von den anderen Wegen, und ist nicht an die Seilbahn gebunden.", "it": "La salita alla vetta (PNT 10) ha una prenotazione propria, separata da quella degli altri sentieri, e non è legata alla funivia.", "nl": "De klim naar de top (PNT 10) heeft een eigen reservering, los van de andere paden, en staat los van de kabelbaan.", "zh": "登顶（PNT 10）需单独预约，与其他步道分开，也与缆车无关。", "zht": "登頂（PNT 10）需單獨預約，與其他步道分開，也與纜車無關。", "bg": "Изкачването до върха (PNT 10) има отделна резервация, различна от тази за другите пътеки, и не е свързана с лифта.", "pl": "Wejście na szczyt (PNT 10) wymaga osobnej rezerwacji, niezależnej od pozostałych szlaków, i nie jest powiązane z kolejką linową.", "ro": "Urcarea pe vârf (PNT 10) are propria rezervare, separată de a celorlalte trasee, și nu este legată de telecabină."},
    "antesResDni": {"es": "En los senderos del Teide, el personal de control puede pedirle un documento de identidad: llévelo encima.", "en": "On the Teide trails, control staff may ask for an identity document: carry one with you.", "fr": "Sur les sentiers du Teide, le personnel de contrôle peut vous demander une pièce d’identité : ayez-la sur vous.", "de": "Auf den Teide-Wegen kann das Kontrollpersonal einen Ausweis verlangen: Tragen Sie ihn bei sich.", "it": "Sui sentieri del Teide il personale di controllo può chiederle un documento d’identità: lo porti con sé.", "nl": "Op de Teide-paden kan het controlepersoneel om een identiteitsbewijs vragen: neem het mee.", "zh": "在泰德峰步道上，检查人员可能要求出示身份证件：请随身携带。", "zht": "在泰德峰步道上，檢查人員可能要求出示身分證件：請隨身攜帶。", "bg": "По пътеките на Тейде контролният персонал може да поиска документ за самоличност: носете го с вас.", "pl": "Na szlakach Teide kontrola może poprosić o dokument tożsamości: trzeba mieć go przy sobie.", "ro": "Pe traseele Teide, personalul de control vă poate cere un act de identitate: aveți-l la dumneavoastră."},
    "antesResGrupoMonte": {"es": "Senderos y montaña", "en": "Trails and mountains", "fr": "Sentiers et montagne", "de": "Wanderwege und Berge", "it": "Sentieri e montagna", "nl": "Wandelpaden en bergen", "zh": "步道与山地", "zht": "步道與山地", "bg": "Пътеки и планина", "pl": "Szlaki i góry", "ro": "Trasee și munte"},
    "antesResGrupoVisitas": {"es": "Visitas", "en": "Visits", "fr": "Visites", "de": "Besichtigungen", "it": "Visite", "nl": "Bezoeken", "zh": "参观", "zht": "參觀", "bg": "Посещения", "pl": "Zwiedzanie", "ro": "Vizite"},
    "antesResGrupoCamping": {"es": "Zonas de acampada del Cabildo", "en": "Cabildo camping areas", "fr": "Aires de camping du Cabildo", "de": "Zeltplätze des Cabildo", "it": "Aree di campeggio del Cabildo", "nl": "Kampeerterreinen van het Cabildo", "zh": "岛政府（Cabildo）的露营区", "zht": "島政府（Cabildo）的露營區", "bg": "Зони за къмпинг на Кабилдо", "pl": "Pola namiotowe Cabildo", "ro": "Zone de campare ale Cabildo"},
    "antesResCampingNota": {"es": "Hoy la autorización se pide en la Central de Reservas del Cabildo.", "en": "Authorisation is currently requested through the Cabildo’s Central Reservations System.", "fr": "L’autorisation se demande pour l’instant à la centrale de réservations du Cabildo.", "de": "Die Genehmigung beantragen Sie derzeit über die zentrale Reservierungsstelle des Cabildo.", "it": "Per ora l’autorizzazione si chiede alla centrale di prenotazione del Cabildo.", "nl": "De vergunning vraagt u op dit moment aan via het centrale reserveringssysteem van het Cabildo.", "zh": "目前须通过岛政府的中央预约系统申请许可。", "zht": "目前須透過島政府的中央預約系統申請許可。", "bg": "Засега разрешение се иска чрез Централата за резервации на Кабилдо.", "pl": "Obecnie o zezwolenie występuje się przez centralny system rezerwacji Cabildo.", "ro": "Deocamdată autorizația se cere prin Centrala de Rezervări a Cabildo."},
    "antesVerLista": {"es": "Ver la lista", "en": "Show the list", "fr": "Voir la liste", "de": "Liste anzeigen", "it": "Vedi l’elenco", "nl": "Lijst tonen", "zh": "查看列表", "zht": "查看列表", "bg": "Покажи списъка", "pl": "Pokaż listę", "ro": "Vedeți lista"},
    "antesReservarEn": {"es": "Reservar en {web}", "en": "Book on {web}", "fr": "Réserver sur {web}", "de": "Reservieren bei {web}", "it": "Prenotare su {web}", "nl": "Reserveren via {web}", "zh": "在 {web} 预约", "zht": "在 {web} 預約", "bg": "Резервирайте в {web}", "pl": "Rezerwacja: {web}", "ro": "Rezervați pe {web}"},
    "antesRevisado": {"es": "Avisos de esta pestaña comprobados el {f} con Tenerife ON y el Gobierno de Canarias.", "en": "Notes on this tab checked on {f} with Tenerife ON and the Government of the Canary Islands.", "fr": "Indications de cet onglet vérifiées le {f} auprès de Tenerife ON et du gouvernement des Canaries.", "de": "Hinweise auf diesem Reiter am {f} mit Tenerife ON und der Regierung der Kanaren geprüft.", "it": "Indicazioni di questa scheda verificate il {f} con Tenerife ON e il Governo delle Canarie.", "nl": "Aanwijzingen op dit tabblad gecontroleerd op {f} bij Tenerife ON en de regering van de Canarische Eilanden.", "zh": "本页提示已于 {f} 依据 Tenerife ON 和加那利群岛政府核实。", "zht": "本頁提示已於 {f} 依據 Tenerife ON 和加那利群島政府核實。", "bg": "Указанията в този раздел са проверени на {f} в Tenerife ON и при правителството на Канарските острови.", "pl": "Wskazówki w tej zakładce sprawdzono {f} w Tenerife ON i u rządu Wysp Kanaryjskich.", "ro": "Indicațiile din această filă au fost verificate pe {f} cu Tenerife ON și Guvernul Insulelor Canare."},
    "antesPie": {"es": "Los avisos de los lugares salen de sus fichas en la app, cada uno con su fuente oficial. Si algo no cuadra, vale lo que diga la web oficial.", "en": "The place notices come from their descriptions in the app, each with its official source. If something doesn’t match, the official website prevails.", "fr": "Les avis des lieux viennent de leurs fiches dans l’app, chacun avec sa source officielle. En cas de doute, c’est le site officiel qui fait foi.", "de": "Die Hinweise zu den Orten stammen aus ihren Beschreibungen in der App, jeweils mit offizieller Quelle. Im Zweifel gilt die offizielle Website.", "it": "Gli avvisi dei luoghi vengono dalle loro schede nell’app, ognuno con la sua fonte ufficiale. In caso di dubbio, vale quanto dice il sito ufficiale.", "nl": "De meldingen bij plekken komen uit hun beschrijvingen in de app, elk met een officiële bron. Bij twijfel geldt wat de officiële website zegt.", "zh": "地点提示来自应用中的各地点介绍，均附官方来源。如有出入，以官方网站为准。", "zht": "地點提示來自應用程式中的各地點介紹，均附官方來源。如有出入，以官方網站為準。", "bg": "Предупрежденията за местата идват от описанията им в приложението, всяко с официалния си източник. При разминаване важи казаното на официалния сайт.", "pl": "Ostrzeżenia dla miejsc pochodzą z ich opisów w aplikacji, każde z oficjalnym źródłem. W razie rozbieżności obowiązuje oficjalna strona.", "ro": "Avertizările locurilor provin din descrierile lor din aplicație, fiecare cu sursa sa oficială. Dacă ceva nu se potrivește, contează ce spune site-ul oficial."},
    "antesTenerifeOn": {"es": "Tenerife ON, la web del Cabildo", "en": "Tenerife ON, the Cabildo’s website", "fr": "Tenerife ON, le site du Cabildo", "de": "Tenerife ON, die Website des Cabildo", "it": "Tenerife ON, il sito del Cabildo", "nl": "Tenerife ON, de website van het Cabildo", "zh": "Tenerife ON，岛政府官网", "zht": "Tenerife ON，島政府官網", "bg": "Tenerife ON, сайтът на Кабилдо", "pl": "Tenerife ON, strona Cabildo", "ro": "Tenerife ON, site-ul Cabildo"}
  };

  /* Las fuentes de los cuatro avisos generales de «Reservas» (20-11-2026):
       lunes a las 07:00 — Gobierno de Canarias, Parque Nacional del Teide,
         «Cada lunes a las 07:00 h (hora canaria) se habilitan nuevas plazas»;
       el pico aparte — Tenerife ON, «El ascenso al Pico del Teide por el
         Sendero PNT 10 Telesforo Bravo requiere una reserva independiente», y
         Gobierno de Canarias, «no está vinculado con el funcionamiento del
         Teleférico»;
       el documento — Cabildo (resolucion de octubre de 2026, en Diario de
         Avisos), «presentar un documento oficial de identidad cuando lo
         solicite el personal de control»;
       las acampadas — Tenerife ON (Reservas), «At present, you must request
         authorisation to camp through the Cabildo de Tenerife's Central
         Reservations System». */
  var ANTES_FUENTES = [
    'https://www.gobiernodecanarias.org/parquesnacionales/teide/tramites/reservas/',
    'https://tenerifeon.es/noticias/nuevas-medidas-de-control-y-seguridad-para-la-ascension-a-pie-al-teide',
    'https://diariodeavisos.elespanol.com/2026/10/senderos-teide-reserva-multas/',
    'https://tenerifeon.es/en/reservations'
  ];

  /* Los estados que se ensenan y su orden: lo cerrado primero */
  var ESTADOS = { cerrado: 0, restringido: 1, solo_reserva: 2 };
  /* Fichas con estado cuyo texto no explica ese estado (20-11-2026): la de
     Masca esta «cerrado» (verificado el 16-11 con caminobarrancodemasca.com)
     pero su primera frase habla de la reserva. Se ensena el estado sin frase
     hasta que la ficha diga por que esta cerrada; entonces se quita de aqui. */
  var SIN_FRASE = { 'ruta-masca-playa': 1 };

  /* «Reservas»: las fichas con reserva:true, menos estas categorias */
  var RES_FUERA = { gastronomia: 1, golf: 1, playa: 1 };
  var RES_GRUPO = { senderismo: 'monte', montana: 'monte', escalada: 'monte', camping: 'camping' };
  /* El enlace oficial donde se reserva, solo en las comprobadas (20-11-2026).
     El PNT 10, la ficha que cita el Gobierno de Canarias; el PNT 07 y El
     Pijaral, sus fichas de Tenerife ON (en ingles: son las que se han podido
     abrir); el Barranco del Infierno, su web, la de su propia ficha. */
  var RES_WEB = {
    'pico-teide-cumbre': { url: 'https://www.tenerifeon.es/itinerarios/sendero/pnt-10-telesforo-bravo', web: 'Tenerife ON' },
    'montana-blanca': { url: 'https://tenerifeon.es/en/routes/hiking/pnt-07-montana-blanca-la-rambleta', web: 'Tenerife ON' },
    'sendero-pijaral': { url: 'https://tenerifeon.es/en/routes/hiking/pra-72-la-ensillada-cabezo-del-tejo', web: 'Tenerife ON' },
    'sendero-barranco-infierno': { url: 'https://www.barrancodelinfierno.es/', web: 'barrancodelinfierno.es' }
  };
  var CENTRAL_RESERVAS = { url: 'https://centralreservas.tenerife.es/?a=5', web: 'centralreservas.tenerife.es' };
  var TENERIFE_ON = 'https://www.tenerifeon.es/';

  var S = { abierto: false, historia: 0, cerrando: false, pest: 'hoy', alertas: null, alertasError: false, alertasPedido: 0, entra: false };

  /* ── TEXTOS ──────────────────────────────────────────────────────── */
  function L() { return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'es'; }
  function loc() { return ANTES_LOCALE[L()] || 'es-ES'; }
  function t(k, vars) {
    var e = ANTES_UI[k], s;
    if (e) s = e[L()] || e.en || e.es || '';
    else s = (typeof tx === 'function') ? tx(k, vars) : '';
    if (e && vars) for (var v in vars) if (Object.prototype.hasOwnProperty.call(vars, v)) {
      if (typeof txLaUna === 'function' && typeof vars[v] === 'string' && /^0?1:\d\d/.test(vars[v])) s = txLaUna(s, '{' + v + '}');
      s = s.split('{' + v + '}').join(String(vars[v]));
    }
    return s;
  }
  /* «16 de noviembre», y con el año si no es el de hoy */
  function fecha(iso) {
    var d = /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? new Date(iso + 'T12:00:00Z') : new Date(iso);
    if (isNaN(d.getTime())) return '';
    var op = { day: 'numeric', month: 'long', timeZone: ZONA };
    if (d.getUTCFullYear() !== new Date().getUTCFullYear()) op.year = 'numeric';
    try { return d.toLocaleDateString(loc(), op); } catch (e) { return iso; }
  }
  function fechaHora(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try { return d.toLocaleString(loc(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: ZONA }); }
    catch (e) { return iso; }
  }
  function diasDesde(iso) {
    var d = Date.parse(iso + 'T12:00:00Z');
    return isNaN(d) ? Infinity : (Date.now() - d) / 86400000;
  }

  /* ── PIEZAS ──────────────────────────────────────────────────────── */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }
  function seguro(url) { return typeof url === 'string' && /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(url); }
  function dominio(url) { var m = /^https:\/\/(?:www\.)?([^/]+)/i.exec(url || ''); return m ? m[1] : ''; }
  var FUERA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  function enlace(url, texto, sub, cls) {
    var a = el('a', 'antes-enlace' + (cls ? ' ' + cls : ''));
    if (seguro(url)) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    var c = el('span', 'antes-enlace-txt');
    c.appendChild(el('span', 'antes-enlace-t', texto));
    if (sub) c.appendChild(el('span', 'antes-enlace-s', sub));
    a.appendChild(c);
    var i = el('span', 'antes-enlace-ico');
    i.innerHTML = FUERA;
    a.appendChild(i);
    return a;
  }
  function seccion(titulo) {
    var s = el('section', 'antes-sec');
    s.appendChild(el('h3', 'antes-sec-t', titulo));
    return s;
  }
  function pildora(estado) { return el('span', 'antes-pildora antes-est-' + estado, t('antesEst_' + estado)); }
  function nombre(p) {
    try { if (typeof nombreLugar === 'function') return nombreLugar(p); } catch (e) {}
    return (p && p.name) || '';
  }
  function lugares() {
    try { return Array.isArray(places) ? places : []; } catch (e) { return []; }
  }

  /* La primera frase de la ficha, si empieza por «⚠️», en el idioma de la
     app (localized: el de la app, o el ingles, o el castellano) */
  /* La primera frase del aviso. No vale cortar en el primer punto: «Seit dem
     1. November», «seit dem 29. Oktober», «2026 г. поради», «2026 r. z
     powodu» y «3.715 m» llevan un punto que no acaba nada (asi salia «Seit
     dem 1.» en aleman, 20 de noviembre de 2026). Un punto acaba la frase
     solo si detras hay un espacio y una mayuscula (o una comilla o un signo
     de apertura), y delante no hay un ordinal de una o dos cifras ni una
     abreviatura de las que llevan mayuscula detras. En chino, 。！？ */
  var ABREV = /(?:^|[\s(])(?:\d{1,2}|Ctra|Avda|Av|Sr|Sra|Sto|Sta|Dr|St|Nr|Mt|ca|aprox|vgl|bzw)$/;
  function primeraFrase(p) {
    var d = '';
    try { d = (typeof localized === 'function') ? localized(p.desc) : ((p.desc && (p.desc[L()] || p.desc.es)) || ''); } catch (e) {}
    d = String(d || '').trim();
    if (!/^⚠/.test(d)) return '';
    d = d.replace(/^⚠\uFE0F?\s*/, '');
    for (var i = 0; i < d.length; i++) {
      var c = d.charAt(i);
      if (c === '\u3002' || c === '\uFF01' || c === '\uFF1F') return d.slice(0, i + 1).trim();
      if (c !== '.' && c !== '!' && c !== '?') continue;
      var resto = d.slice(i + 1);
      if (!resto.trim()) return d.trim();
      if (!/^\s/.test(resto)) continue;                       /* 3.715, una web */
      if (c === '.') {
        if (ABREV.test(d.slice(0, i))) continue;                /* «1.», «29.», «Ctra.» */
        var sig = resto.replace(/^\s+/, '').charAt(0);
        /* mayuscula en cualquier alfabeto que las tenga (latino, cirilico) */
        if (sig === sig.toLowerCase() && '\u00AB"\u201C\u201E(\u00BF\u00A1'.indexOf(sig) < 0) continue; /* «2026 г. поради» */
      }
      return d.slice(0, i + 1).trim();
    }
    return d.trim();
  }

  /* ── ESTILOS (una vez) ───────────────────────────────────────────── */
  var CSS = "/* ── ANTES DE SALIR: el cuerpo de la pantalla (lo inyecta modulos/antes.js) ── */\n" +
    "#antes-cuerpo .antes-intro { margin: 0; color: var(--muted, rgba(240,236,228,0.6)); font-size: 0.92rem; line-height: 1.5; }\n" +
    ".antes-pestanas { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 14px; background: rgba(255,255,255,0.05); }\n" +
    ".antes-pestanas button { min-height: 40px; border: 0; border-radius: 10px; background: transparent; color: var(--muted, rgba(240,236,228,0.62)); font: 600 0.92rem 'DM Sans', system-ui, sans-serif; cursor: pointer; }\n" +
    ".antes-pestanas button[aria-selected=\"true\"] { background: var(--panel, #1B2330); color: var(--gold-light, #F5C76B); box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset; }\n" +
    ".antes-pestanas button:focus-visible { outline: 2px solid #f5c76b; outline-offset: 2px; }\n" +
    ".antes-sec { display: flex; flex-direction: column; gap: 10px; }\n" +
    ".antes-vista { display: flex; flex-direction: column; gap: 16px; }\n" +
    ".antes-sec-t { margin: 6px 0 0; font: 700 0.74rem 'DM Sans', system-ui, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold, #D4AF37); }\n" +
    ".antes-caja { display: flex; flex-direction: column; gap: 8px; padding: 12px 13px; border-radius: 14px; background: var(--panel, #1B2330); border: 1px solid rgba(255,255,255,0.07); }\n" +
    ".antes-caja-t { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-weight: 700; font-size: 0.95rem; }\n" +
    ".antes-muted { margin: 0; color: var(--muted, rgba(240,236,228,0.6)); font-size: 0.84rem; line-height: 1.45; }\n" +
    ".antes-frase { margin: 0; font-size: 0.9rem; line-height: 1.5; color: var(--text, #f0ece4); }\n" +
    ".antes-pildora { display: inline-block; padding: 3px 10px; border-radius: 999px; font: 700 0.74rem 'DM Sans', system-ui, sans-serif; letter-spacing: 0.02em; white-space: nowrap; }\n" +
    ".antes-est-cerrado { background: rgba(248,113,113,0.16); color: #fca5a5; }\n" +
    ".antes-est-restringido { background: rgba(251,146,60,0.16); color: #fdba74; }\n" +
    ".antes-est-solo_reserva { background: rgba(212,175,55,0.16); color: var(--gold-light, #F5C76B); }\n" +
    ".antes-lugares { display: flex; flex-wrap: wrap; gap: 6px; }\n" +
    ".antes-lugar { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; max-width: 100%; padding: 6px 12px; border-radius: 999px; cursor: pointer; text-align: left;\n" +
    "  border: 1px solid rgba(212,175,55,0.35); background: rgba(212,175,55,0.08); color: var(--text, #f0ece4); font: 500 0.86rem 'DM Sans', system-ui, sans-serif; overflow-wrap: anywhere; }\n" +
    ".antes-lugar::after { content: '\\203A'; color: var(--gold, #D4AF37); font-size: 1.1em; line-height: 1; }\n" +
    ".antes-lugar:focus-visible, .antes-enlace:focus-visible, .antes-ver:focus-visible, .antes-lista summary:focus-visible { outline: 2px solid #f5c76b; outline-offset: 2px; }\n" +
    ".antes-pie-caja { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font-size: 0.78rem; color: var(--muted, rgba(240,236,228,0.6)); }\n" +
    ".antes-pie-caja a { color: var(--gold-light, #F5C76B); overflow-wrap: anywhere; }\n" +
    ".antes-viejo { margin: 0; font-size: 0.82rem; color: #fdba74; }\n" +
    ".antes-enlace { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 9px 12px; border-radius: 12px; text-decoration: none; color: var(--text, #f0ece4); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }\n" +
    ".antes-enlace-txt { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }\n" +
    ".antes-enlace-t { font-weight: 600; font-size: 0.9rem; line-height: 1.3; }\n" +
    ".antes-enlace-s { font-size: 0.76rem; color: var(--muted, rgba(240,236,228,0.6)); overflow-wrap: anywhere; }\n" +
    ".antes-enlace-ico svg { width: 18px; height: 18px; fill: none; stroke: var(--gold, #D4AF37); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }\n" +
    ".antes-alerta { display: block; padding: 9px 12px; border-radius: 12px; text-decoration: none; color: var(--text, #f0ece4); background: rgba(255,255,255,0.04); border-left: 3px solid #fb923c; font-size: 0.88rem; line-height: 1.4; }\n" +
    ".antes-alerta small { display: block; margin-top: 2px; color: var(--muted, rgba(240,236,228,0.6)); font-size: 0.74rem; }\n" +
    ".antes-aemet .wx-linea-btn { width: 100%; }\n" +
    ".antes-res { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }\n" +
    ".antes-res-n { font-weight: 600; font-size: 0.93rem; line-height: 1.35; overflow-wrap: anywhere; }\n" +
    ".antes-ver { align-self: flex-start; min-height: 36px; padding: 6px 12px; border-radius: 999px; cursor: pointer; border: 1px solid rgba(255,255,255,0.14); background: transparent; color: var(--gold-light, #F5C76B); font: 600 0.82rem 'DM Sans', system-ui, sans-serif; }\n" +
    ".antes-notas { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem; line-height: 1.45; }\n" +
    ".antes-lista summary { cursor: pointer; min-height: 36px; display: flex; align-items: center; gap: 8px; color: var(--gold-light, #F5C76B); font-weight: 600; font-size: 0.88rem; }\n" +
    ".antes-cuenta { display: inline-flex; min-width: 24px; height: 22px; padding: 0 7px; border-radius: 999px; align-items: center; justify-content: center; background: rgba(212,175,55,0.16); color: var(--gold-light, #F5C76B); font: 700 0.76rem 'DM Sans', system-ui, sans-serif; font-variant-numeric: tabular-nums; }\n" +
    ".antes-lista .antes-lugares { margin-top: 8px; }\n" +
    ".antes-pie { margin: 6px 0 0; font-size: 0.78rem; line-height: 1.5; color: var(--muted, rgba(240,236,228,0.55)); }\n" +
    "#antes-cuerpo.antes-entra > * { animation: antes-sube 420ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both; }\n" +
    "#antes-cuerpo.antes-entra > *:nth-child(2) { animation-delay: 50ms; } #antes-cuerpo.antes-entra > *:nth-child(3) { animation-delay: 100ms; }\n" +
    "#antes-cuerpo.antes-entra > *:nth-child(4) { animation-delay: 150ms; } #antes-cuerpo.antes-entra > *:nth-child(n+5) { animation-delay: 200ms; }\n" +
    "@keyframes antes-sube { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }\n" +
    "@media (prefers-reduced-motion: reduce) { #antes-cuerpo.antes-entra > * { animation: none; } }\n";
  function estilos() {
    if (document.getElementById('antes-css')) return;
    var st = document.createElement('style');
    st.id = 'antes-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── «HOY» ───────────────────────────────────────────────────────── */
  function aemetHay() {
    return typeof wxVigentes === 'function' && typeof wxLineas === 'function' && typeof wxEstado !== 'undefined';
  }
  function pintarAemet(box) {
    box.textContent = '';
    if (!aemetHay()) { box.hidden = true; return; }
    box.hidden = false;
    if (wxEstado === 'cargando') { box.appendChild(el('p', 'antes-muted', t('antesAemetCargando'))); return; }
    if (wxEstado === 'error') {
      var p = el('p', 'antes-muted', '⚠️ ' + t('wxNoDisponible') + ' ');
      try { p.appendChild(wxEnlaceAemet()); } catch (e) {}
      box.appendChild(p);
      return;
    }
    var vig = [];
    try { vig = wxVigentes(); } catch (e) {}
    try { wxLineas(box, vig); } catch (e) {}
    /* tocar un aviso abre el panel de avisos de la app, debajo de esta
       pantalla: se cierra para dejarlo a la vista (como en el SOS) */
    Array.prototype.forEach.call(box.querySelectorAll('.wx-linea-btn'), function (b) { b.addEventListener('click', function () { cerrar(); }); });
  }
  function validaAlertas(d) {
    if (!d || !Array.isArray(d.alertas) || isNaN(Date.parse(d.consultado))) return null;
    var ok = d.alertas.filter(function (a) {
      return a && typeof a.titulo === 'string' && a.titulo.length > 4 && a.titulo.length < 300 && !isNaN(Date.parse(a.t)) &&
             typeof a.enlace === 'string' && /^https:\/\/www3\.gobiernodecanarias\.org\/noticias\//.test(a.enlace);
    });
    ok.sort(function (a, b) { return Date.parse(b.t) - Date.parse(a.t); });
    return { consultado: d.consultado, alertas: ok };
  }
  function pedirAlertas() {
    if (S.alertasPedido && Date.now() - S.alertasPedido < 10 * 60000) return;
    S.alertasPedido = Date.now();
    var op = { cache: 'no-cache' };
    try { if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) op.signal = AbortSignal.timeout(8000); } catch (e) {}
    var f = (typeof tgoFetchDatos === 'function') ? tgoFetchDatos(ALERTAS_URL, op) : fetch(ALERTAS_URL, op);
    f.then(function (r) { return r.ok ? r.json() : null; })
     .then(function (d) { var v = validaAlertas(d); S.alertas = v; S.alertasError = !v; })
     .catch(function () { S.alertasError = true; })
     .then(function () { var box = document.getElementById('antes-alertas'); if (box && S.abierto) pintarAlertas(box); });
  }
  function pintarAlertas(box) {
    box.textContent = '';
    box.appendChild(el('div', 'antes-caja-t', t('antesAlertasTit')));
    if (!S.alertas && !S.alertasError) { box.appendChild(el('p', 'antes-muted', t('antesAlertasCargando'))); return; }
    var web = 'https://www3.gobiernodecanarias.org/noticias/category/alertas/';
    /* sin fichero o con uno viejo, el enlace oficial: no se dice «ninguna» sin haberlo podido mirar */
    if (!S.alertas || Date.now() - Date.parse(S.alertas.consultado) > ALERTAS_VIEJO_MS) {
      if (S.alertas) box.appendChild(el('p', 'antes-muted', t('antesAlertasViejo', { f: fechaHora(S.alertas.consultado) })));
      box.appendChild(enlace(web, t('antesAlertasTit'), dominio(web)));
      return;
    }
    var ahora = Date.now();
    var recientes = S.alertas.alertas.filter(function (a) { return ahora - Date.parse(a.t) <= ALERTAS_MS; }).slice(0, ALERTAS_MAX);
    if (!recientes.length) { box.appendChild(el('p', 'antes-muted', '✓ ' + t('antesAlertasNinguna'))); return; }
    box.appendChild(el('p', 'antes-muted', t('antesAlertasNota')));
    recientes.forEach(function (a) {
      var l = el('a', 'antes-alerta');
      l.href = a.enlace; l.target = '_blank'; l.rel = 'noopener noreferrer';
      l.setAttribute('lang', 'es');
      l.appendChild(document.createTextNode(a.titulo));
      l.appendChild(el('small', null, fechaHora(a.t)));
      box.appendChild(l);
    });
  }
  function gruposEstado() {
    var porClave = {}, orden = [];
    lugares().forEach(function (p) {
      if (!p || !Object.prototype.hasOwnProperty.call(ESTADOS, p.estado)) return;
      var frase = SIN_FRASE[p.id] ? '' : primeraFrase(p);
      var k = p.estado + '|' + frase + '|' + (p.fuente || '');
      var g = porClave[k];
      if (!g) { g = porClave[k] = { estado: p.estado, frase: frase, fuente: p.fuente, verificado: '', lugares: [] }; orden.push(g); }
      g.lugares.push(p);
      /* el aviso de un grupo es el mismo para todos: vale la comprobacion mas reciente */
      if (/^\d{4}-\d{2}-\d{2}$/.test(p.verificado || '') && p.verificado > g.verificado) g.verificado = p.verificado;
    });
    orden.sort(function (a, b) { return (ESTADOS[a.estado] - ESTADOS[b.estado]) || (b.lugares.length - a.lugares.length); });
    return orden;
  }
  function verEnMapa(id) {
    cerrar();
    setTimeout(function () {
      try { if (typeof closeRoutePanel === 'function') closeRoutePanel(); } catch (e) {}
      try {
        if (typeof selectPlaceFromSuggestion === 'function') { selectPlaceFromSuggestion(id); return; }
        if (typeof goToPlace === 'function') goToPlace(id);
      } catch (e) {}
    }, 460);
  }
  function botonLugar(p) {
    var b = el('button', 'antes-lugar', nombre(p));
    b.type = 'button';
    b.setAttribute('aria-label', nombre(p) + ' · ' + t('antesVerMapa'));
    b.addEventListener('click', function () { verEnMapa(p.id); });
    return b;
  }
  function cajaGrupo(g) {
    var c = el('div', 'antes-caja');
    var cab = el('div', 'antes-caja-t');
    cab.appendChild(pildora(g.estado));
    c.appendChild(cab);
    if (g.frase) c.appendChild(el('p', 'antes-frase', g.frase));
    var lista = el('div', 'antes-lugares');
    g.lugares.forEach(function (p) { lista.appendChild(botonLugar(p)); });
    c.appendChild(lista);
    var pie = el('div', 'antes-pie-caja');
    if (g.verificado) pie.appendChild(el('span', null, t('antesComprobado', { f: fecha(g.verificado) })));
    if (seguro(g.fuente)) {
      var a = el('a', null, t('antesFuente') + ': ' + dominio(g.fuente));
      a.href = g.fuente; a.target = '_blank'; a.rel = 'noopener noreferrer';
      pie.appendChild(a);
    }
    c.appendChild(pie);
    if (!g.verificado || diasDesde(g.verificado) > VIEJO_DIAS) c.appendChild(el('p', 'antes-viejo', t('antesPuedeCambiar')));
    return c;
  }
  function pintarHoy(c) {
    var sec = seccion(t('antesAvisosTit'));
    var aemet = el('div', 'antes-caja antes-aemet');
    aemet.appendChild(el('div', 'antes-caja-t', 'AEMET'));
    var lineas = el('div', 'antes-aemet-lineas');
    pintarAemet(lineas);
    aemet.appendChild(lineas);
    if (!lineas.hidden) sec.appendChild(aemet);
    var al = el('div', 'antes-caja');
    al.id = 'antes-alertas';
    pintarAlertas(al);
    sec.appendChild(al);
    c.appendChild(sec);

    var sec2 = seccion(t('antesLugaresTit'));
    var grupos = gruposEstado();
    if (!grupos.length) sec2.appendChild(el('p', 'antes-muted', t('antesLugaresNinguno')));
    grupos.forEach(function (g) { sec2.appendChild(cajaGrupo(g)); });
    c.appendChild(sec2);
    c.appendChild(enlace(TENERIFE_ON, t('antesTenerifeOn'), 'tenerifeon.es'));
    c.appendChild(el('p', 'antes-pie', t('antesPie')));
  }

  /* ── «RESERVAS» ──────────────────────────────────────────────────── */
  function conReserva() {
    var g = { monte: [], visitas: [], camping: [] };
    lugares().forEach(function (p) {
      if (!p || p.reserva !== true || RES_FUERA[p.category]) return;
      g[RES_GRUPO[p.category] || 'visitas'].push(p);
    });
    var porNombre = function (a, b) { return nombre(a).localeCompare(nombre(b), loc()); };
    g.monte.sort(porNombre); g.visitas.sort(porNombre); g.camping.sort(porNombre);
    return g;
  }
  function filaReserva(p) {
    var c = el('div', 'antes-caja');
    var cab = el('div', 'antes-res');
    cab.appendChild(el('span', 'antes-res-n', nombre(p)));
    if (Object.prototype.hasOwnProperty.call(ESTADOS, p.estado)) cab.appendChild(pildora(p.estado));
    c.appendChild(cab);
    var w = RES_WEB[p.id];
    if (w && seguro(w.url)) c.appendChild(enlace(w.url, t('antesReservarEn', { web: w.web }), dominio(w.url)));
    var b = el('button', 'antes-ver', t('antesVerMapa'));
    b.type = 'button';
    b.addEventListener('click', function () { verEnMapa(p.id); });
    c.appendChild(b);
    return c;
  }
  function pintarReservas(c) {
    c.appendChild(el('p', 'antes-intro', t('antesResIntro')));
    var notas = el('div', 'antes-caja');
    var ul = el('ul', 'antes-notas');
    ['antesResLunes', 'antesResPico', 'antesResDni'].forEach(function (k) { ul.appendChild(el('li', null, t(k))); });
    notas.appendChild(ul);
    c.appendChild(notas);
    var g = conReserva();
    if (g.monte.length) {
      var s1 = seccion(t('antesResGrupoMonte'));
      g.monte.forEach(function (p) { s1.appendChild(filaReserva(p)); });
      c.appendChild(s1);
    }
    if (g.visitas.length) {
      var s2 = seccion(t('antesResGrupoVisitas'));
      g.visitas.forEach(function (p) { s2.appendChild(filaReserva(p)); });
      c.appendChild(s2);
    }
    if (g.camping.length) {
      var s3 = seccion(t('antesResGrupoCamping'));
      var caja = el('div', 'antes-caja');
      caja.appendChild(el('p', 'antes-frase', t('antesResCampingNota')));
      caja.appendChild(enlace(CENTRAL_RESERVAS.url, t('antesReservarEn', { web: CENTRAL_RESERVAS.web }), dominio(CENTRAL_RESERVAS.url)));
      var det = el('details', 'antes-lista');
      var sum = el('summary', null, t('antesVerLista') + ' ');
      sum.appendChild(el('span', 'antes-cuenta', String(g.camping.length)));
      det.appendChild(sum);
      var lista = el('div', 'antes-lugares');
      g.camping.forEach(function (p) { lista.appendChild(botonLugar(p)); });
      det.appendChild(lista);
      caja.appendChild(det);
      s3.appendChild(caja);
      c.appendChild(s3);
    }
    c.appendChild(el('p', 'antes-pie', t('antesRevisado', { f: fecha(REVISADO) })));
  }

  /* ── PINTAR ──────────────────────────────────────────────────────── */
  function panel() { return document.getElementById('antes-panel'); }
  function cuerpo() { return document.getElementById('antes-cuerpo'); }
  function pestanas() {
    var nav = el('div', 'antes-pestanas');
    nav.setAttribute('role', 'tablist');
    [['hoy', 'antesPestHoy'], ['reservas', 'antesPestReservas']].forEach(function (x) {
      var b = el('button', null, t(x[1]));
      b.type = 'button';
      b.id = 'antes-pest-' + x[0];
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', S.pest === x[0] ? 'true' : 'false');
      b.setAttribute('aria-controls', 'antes-vista');
      b.addEventListener('click', function () { if (S.pest !== x[0]) { S.pest = x[0]; pintar(); var sc = document.getElementById('antes-scroll'); if (sc) sc.scrollTop = 0; } });
      nav.appendChild(b);
    });
    return nav;
  }
  function pintar() {
    var c = cuerpo(); if (!c) return;
    estilos();
    c.textContent = '';
    c.classList.toggle('antes-entra', S.entra);
    S.entra = false;
    c.appendChild(el('p', 'antes-intro', t('antesSub')));
    c.appendChild(pestanas());
    var vista = el('div', 'antes-vista');
    vista.id = 'antes-vista';
    vista.setAttribute('role', 'tabpanel');
    vista.setAttribute('aria-labelledby', 'antes-pest-' + S.pest);
    if (S.pest === 'reservas') pintarReservas(vista); else pintarHoy(vista);
    c.appendChild(vista);
    var tit = document.getElementById('antes-titulo'); if (tit) tit.textContent = t('antesTitulo');
    var x = document.getElementById('antes-cerrar'); if (x) x.setAttribute('aria-label', t('sosVolver'));
  }

  /* ── ABRIR Y CERRAR (con el boton «atras» del movil) ─────────────── */
  function enfocar() { var tit = document.getElementById('antes-titulo'); if (tit) { tit.setAttribute('tabindex', '-1'); try { tit.focus({ preventScroll: true }); } catch (e) {} } }
  function abrir(op) {
    var p = panel(); if (!p) return;
    estilos();
    if (op && (op.pest === 'hoy' || op.pest === 'reservas')) S.pest = op.pest;
    if (!S.abierto) {
      S.abierto = true; S.historia = 0; S.entra = true;
      if (!op || !op.pest) S.pest = 'hoy';
      p.hidden = false;
      document.documentElement.classList.add('antes-abierto');
      try { history.pushState({ tgAntes: 1 }, ''); S.historia = 1; } catch (e) {}
    }
    pintar();
    var sc = document.getElementById('antes-scroll'); if (sc) sc.scrollTop = 0;
    pedirAlertas();
    enfocar();
  }
  function cerrar() {
    if (!S.abierto || S.cerrando) return;   /* dos toques seguidos: un solo «atras» */
    if (S.historia > 0) {
      S.cerrando = true;
      setTimeout(function () { if (S.cerrando) cerrarYa(); }, 450);
      try { history.back(); return; } catch (e) { S.cerrando = false; }
    }
    cerrarYa();
  }
  function cerrarYa() {
    S.abierto = false; S.cerrando = false; S.historia = 0;
    var p = panel(); if (p) p.hidden = true;
    document.documentElement.classList.remove('antes-abierto');
    var b = document.getElementById('antes-tarjeta');
    if (b && b.offsetParent) { try { b.focus({ preventScroll: true }); } catch (e) {} }
  }
  function alAtras() {
    if (!S.abierto) return;
    cerrarYa();
  }
  function iniciar() {
    window.addEventListener('popstate', alAtras);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.abierto) cerrar(); });
    try { TG_IDIOMA.registrar('antes', function () { if (S.abierto) pintar(); }); } catch (e) {}
  }
  iniciar();

  /* Para el cargador de index.html y para las herramientas de tools/ */
  window.TG_ANTES = {
    abrir: abrir, cerrar: cerrar, repintar: function () { if (S.abierto) pintar(); },
    estado: S, filas: ANTES_UI, fuentes: ANTES_FUENTES, revisado: REVISADO,
    sinFrase: SIN_FRASE, resWeb: RES_WEB, grupos: gruposEstado, conReserva: conReserva,
    primeraFrase: primeraFrase, validaAlertas: validaAlertas, t: t
  };
})();
