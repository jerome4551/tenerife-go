/* modulos/perfil.js — la pantalla «Su perfil» (22 de octubre de 2026).

   QUE ES. El avatar (55, por pais, de modulos/avatares.js), el nombre o
   apodo, los datos (altura, peso y año de nacimiento, con el IMC y su
   categoria de la OMS solo para adultos), su evolucion (el peso y los
   kilometros que anota la persona: ninguno sale de las fichas), su isla
   (favoritos, visitados y logros, los de la app) y la cuenta, con la nube
   solo con permiso. Viene del encargo PARA-CLAUDE-CODE-PERFIL.md, probado
   en su prototipo; aqui va montado en la app.

   COMO SE CARGA. Como el cielo: lo pide el cargador de index.html
   (CARGA-PEREZOSA: modulos/perfil.js) la primera vez que alguien abre el
   perfil, despues de modulos/avatares.js, que este lee en cuanto corre. El
   service worker lo precarga. Sus estilos y su cuerpo van aqui dentro, como
   cadenas (ESTILOS y CUERPO, al final): app_preparar.js solo copia
   modulos/*.js a la app de la tienda, y unos ficheros sueltos faltarian alli.

   LOS TEXTOS. PERFIL_UI son filas planas como las de UI_TX, en los diez
   idiomas, y se funden en UI_TX como hace el cielo con CIELO_UI: se piden
   con el tx() de la app, que ya sabe de plurales («a|b») y de {marcadores}.
   Las filas de la cuenta que ya existian no se copian: tx('cuentaBorrarBtn')
   y las demas, y authLoggedAs y authLogoutBtn, que viven en AUTH_STRINGS,
   con t(). tools/auditar_perfil.js comprueba las filas y que exista cada
   una que se pide.

   LO QUE VIENE DE LA PERSONA, DEL DISPOSITIVO O DE LA NUBE va siempre por
   textContent. innerHTML, solo para los dibujos del catalogo
   (TG_AVATARES.svg), el cuerpo de la pantalla y el degradado de la grafica,
   que escribe este codigo.

   LO QUE SE GUARDA. En el dispositivo, tenerife.perfil, validado campo a
   campo al leerlo. En la cuenta, solo con el permiso expreso de esa cuenta
   («Acepto»), en las tablas de supabase/perfil.sql: apartado «la nube, con
   permiso». Las visitas comprobadas (tenerife.visitas) no suben nunca. */
(function () {
  'use strict';

  /* Los textos de la pantalla (78), de los sets (11) y de los avatares (55),
     en los diez idiomas. El trato, de usted (Jerome, 21 de octubre). Se
     quedan como estan, porque son la voz de quien usa la app: «Sorpréndeme»,
     los titulos chinos con 我的 y «Acepto». */
  var PERFIL_UI = {
    "perfilTitulo": {"es": "Su perfil", "en": "Your profile", "fr": "Votre profil", "de": "Ihr Profil", "it": "Profilo", "nl": "Uw profiel", "zh": "我的资料", "zht": "個人檔案", "bg": "Вашият профил", "pl": "Profil"},
    "perfilLema": {"es": "Su pasaporte de viajero", "en": "Your traveller’s passport", "fr": "Votre passeport de voyageur", "de": "Ihr Reisepass", "it": "Passaporto da viaggiatore", "nl": "Uw reizigerspaspoort", "zh": "我的旅行护照", "zht": "我的旅行護照", "bg": "Вашият пътнически паспорт", "pl": "Paszport podróżnika"},
    "perfilNombrePlaceholder": {"es": "Su nombre o apodo", "en": "Your name or nickname", "fr": "Votre prénom ou pseudo", "de": "Ihr Name oder Spitzname", "it": "Nome o soprannome", "nl": "Uw naam of bijnaam", "zh": "名字或昵称", "zht": "名字或暱稱", "bg": "Вашето име или прякор", "pl": "Imię lub pseudonim"},
    "perfilBienvenida": {"es": "¡Hola, {nombre}!", "en": "Hi, {nombre}!", "fr": "Bonjour, {nombre} !", "de": "Hallo, {nombre}!", "it": "Salve, {nombre}!", "nl": "Hallo {nombre}!", "zh": "您好，{nombre}！", "zht": "您好，{nombre}！", "bg": "Здравейте, {nombre}!", "pl": "Witamy, {nombre}!"},
    "perfilViajeroDesde": {"es": "Viajero desde {fecha}", "en": "Traveller since {fecha}", "fr": "Voyageur depuis {fecha}", "de": "Reisender seit {fecha}", "it": "Viaggiatore da {fecha}", "nl": "Reiziger sinds {fecha}", "zh": "旅行始于{fecha}", "zht": "旅行始於{fecha}", "bg": "Пътешественик от {fecha}", "pl": "Podróżnik od {fecha}"},
    "perfilEditarNombre": {"es": "Editar nombre", "en": "Edit name", "fr": "Modifier le nom", "de": "Namen bearbeiten", "it": "Modifica nome", "nl": "Naam bewerken", "zh": "编辑名字", "zht": "編輯名字", "bg": "Промяна на името", "pl": "Zmiana imienia"},
    "perfilElegirAvatar": {"es": "Elija su avatar", "en": "Choose your avatar", "fr": "Choisissez votre avatar", "de": "Wählen Sie Ihren Avatar", "it": "Scelta dell’avatar", "nl": "Kies uw avatar", "zh": "选择头像", "zht": "選擇頭像", "bg": "Изберете аватар", "pl": "Wybór awatara"},
    "perfilSorprendeme": {"es": "Sorpréndeme", "en": "Surprise me", "fr": "Surprenez-moi", "de": "Überrasch mich", "it": "Sorprendimi", "nl": "Verras me", "zh": "随机一个", "zht": "隨機一個", "bg": "Изненадай ме", "pl": "Zaskocz mnie"},
    "perfilAvatarGuardado": {"es": "Avatar guardado", "en": "Avatar saved", "fr": "Avatar enregistré", "de": "Avatar gespeichert", "it": "Avatar salvato", "nl": "Avatar opgeslagen", "zh": "头像已保存", "zht": "頭像已儲存", "bg": "Аватарът е запазен", "pl": "Awatar zapisany"},
    "perfilBloqueado": {"es": "Se desbloquea con {n} visita comprobada ({v} de {n})|Se desbloquea con {n} visitas comprobadas ({v} de {n})", "en": "Unlocks after {n} verified visit ({v} of {n})|Unlocks after {n} verified visits ({v} of {n})", "fr": "Se débloque après {n} visite vérifiée ({v} sur {n})|Se débloque après {n} visites vérifiées ({v} sur {n})", "de": "Wird nach {n} bestätigten Besuch freigeschaltet ({v} von {n})|Wird nach {n} bestätigten Besuchen freigeschaltet ({v} von {n})", "it": "Si sblocca con {n} visita verificata ({v} su {n})|Si sblocca con {n} visite verificate ({v} su {n})", "nl": "Wordt ontgrendeld na {n} bevestigd bezoek ({v} van {n})|Wordt ontgrendeld na {n} bevestigde bezoeken ({v} van {n})", "zh": "确认到访{n}个地点后解锁（{v}/{n}）", "zht": "確認到訪{n}個地點後解鎖（{v}/{n}）", "bg": "Отключва се след {n} потвърдено посещение ({v} от {n})|Отключва се след {n} потвърдени посещения ({v} от {n})", "pl": "Odblokowuje się po {n} potwierdzonej wizycie ({v} z {n})|Odblokowuje się po {n} potwierdzonych wizytach ({v} z {n})|Odblokowuje się po {n} potwierdzonych wizytach ({v} z {n})"},
    "perfilDatos": {"es": "Sus datos", "en": "Your details", "fr": "Vos données", "de": "Ihre Daten", "it": "Dati personali", "nl": "Uw gegevens", "zh": "我的数据", "zht": "我的資料", "bg": "Вашите данни", "pl": "Dane osobowe"},
    "perfilDatosNota": {"es": "Se guardan en este dispositivo y, solo si usted activa la opción en «Cuenta», también en su cuenta.", "en": "They’re stored on this device, and in your account only if you turn that on under «Account».", "fr": "Elles sont enregistrées sur cet appareil et, uniquement si vous activez l’option dans «Compte», également dans votre compte.", "de": "Diese Daten werden auf diesem Gerät gespeichert und nur dann auch in Ihrem Konto, wenn Sie das unter «Konto» einschalten.", "it": "Sono salvati su questo dispositivo e, solo se attiva l’opzione in «Account», anche nell’account.", "nl": "Ze worden op dit apparaat opgeslagen en, alleen als u dat onder «Account» aanzet, ook in uw account.", "zh": "保存在本设备上；只有在您于「账户」中开启后，才会同时保存到您的账户。", "zht": "儲存在此裝置上；只有在您於「帳戶」中開啟後，才會同時儲存到您的帳戶。", "bg": "Пазят се на това устройство, а в акаунта ви – само ако включите тази опция в «Акаунт».", "pl": "Są zapisywane na tym urządzeniu, a na koncie – tylko po włączeniu tej opcji w sekcji «Konto»."},
    "perfilAltura": {"es": "Altura", "en": "Height", "fr": "Taille", "de": "Größe", "it": "Altezza", "nl": "Lengte", "zh": "身高", "zht": "身高", "bg": "Ръст", "pl": "Wzrost"},
    "perfilPeso": {"es": "Peso", "en": "Weight", "fr": "Poids", "de": "Gewicht", "it": "Peso", "nl": "Gewicht", "zh": "体重", "zht": "體重", "bg": "Тегло", "pl": "Waga"},
    "perfilNacimiento": {"es": "Año de nacimiento", "en": "Birth year", "fr": "Année de naissance", "de": "Geburtsjahr", "it": "Anno di nascita", "nl": "Geboortejaar", "zh": "出生年份", "zht": "出生年份", "bg": "Година на раждане", "pl": "Rok urodzenia"},
    "perfilAnios": {"es": "{n} año|{n} años", "en": "{n} year old|{n} years old", "fr": "{n} an|{n} ans", "de": "{n} Jahr|{n} Jahre", "it": "{n} anno|{n} anni", "nl": "{n} jaar|{n} jaar", "zh": "{n}岁", "zht": "{n}歲", "bg": "{n} година|{n} години", "pl": "{n} rok|{n} lata|{n} lat"},
    "perfilUnidades": {"es": "Unidades", "en": "Units", "fr": "Unités", "de": "Einheiten", "it": "Unità", "nl": "Eenheden", "zh": "单位", "zht": "單位", "bg": "Мерни единици", "pl": "Jednostki"},
    "perfilGuardar": {"es": "Guardar", "en": "Save", "fr": "Enregistrer", "de": "Speichern", "it": "Salvare", "nl": "Opslaan", "zh": "保存", "zht": "儲存", "bg": "Запазване", "pl": "Zapisać"},
    "perfilGuardado": {"es": "Guardado ✓", "en": "Saved ✓", "fr": "Enregistré ✓", "de": "Gespeichert ✓", "it": "Salvato ✓", "nl": "Opgeslagen ✓", "zh": "已保存 ✓", "zht": "已儲存 ✓", "bg": "Запазено ✓", "pl": "Zapisano ✓"},
    "perfilImc": {"es": "IMC", "en": "BMI", "fr": "IMC", "de": "BMI", "it": "IMC", "nl": "BMI", "zh": "BMI指数", "zht": "BMI指數", "bg": "ИТМ", "pl": "BMI"},
    "perfilImcNota": {"es": "Orientativo. Categorías de la OMS para adultos", "en": "For guidance only. WHO adult categories", "fr": "À titre indicatif. Catégories de l’OMS pour les adultes", "de": "Nur zur Orientierung. WHO-Kategorien für Erwachsene", "it": "Indicativo. Categorie dell’OMS per adulti", "nl": "Ter indicatie. WHO-categorieën voor volwassenen", "zh": "仅供参考：世卫组织成人分类", "zht": "僅供參考：世衛組織成人分類", "bg": "Ориентировъчно. Категории на СЗО за възрастни", "pl": "Orientacyjnie. Kategorie WHO dla dorosłych"},
    "perfilImcBajo": {"es": "Bajo peso", "en": "Underweight", "fr": "Insuffisance pondérale", "de": "Untergewicht", "it": "Sottopeso", "nl": "Ondergewicht", "zh": "体重过轻", "zht": "體重過輕", "bg": "Поднормено тегло", "pl": "Niedowaga"},
    "perfilImcNormal": {"es": "Peso normal", "en": "Normal weight", "fr": "Poids normal", "de": "Normalgewicht", "it": "Normopeso", "nl": "Normaal gewicht", "zh": "正常", "zht": "正常", "bg": "Нормално тегло", "pl": "Waga prawidłowa"},
    "perfilImcSobre": {"es": "Sobrepeso", "en": "Overweight", "fr": "Surpoids", "de": "Übergewicht", "it": "Sovrappeso", "nl": "Overgewicht", "zh": "超重", "zht": "過重", "bg": "Наднормено тегло", "pl": "Nadwaga"},
    "perfilImcObes": {"es": "Obesidad", "en": "Obesity", "fr": "Obésité", "de": "Adipositas", "it": "Obesità", "nl": "Obesitas", "zh": "肥胖", "zht": "肥胖", "bg": "Затлъстяване", "pl": "Otyłość"},
    "perfilEvolucion": {"es": "Su evolución", "en": "Your progress", "fr": "Votre évolution", "de": "Ihr Verlauf", "it": "Progressi", "nl": "Uw voortgang", "zh": "我的进展", "zht": "我的進展", "bg": "Вашият напредък", "pl": "Postępy"},
    "perfilKm": {"es": "Kilómetros", "en": "Kilometres", "fr": "Kilomètres", "de": "Kilometer", "it": "Chilometri", "nl": "Kilometers", "zh": "公里", "zht": "公里", "bg": "Километри", "pl": "Kilometry"},
    "perfilActual": {"es": "Actual", "en": "Current", "fr": "Actuel", "de": "Aktuell", "it": "Attuale", "nl": "Nu", "zh": "当前", "zht": "目前", "bg": "Сега", "pl": "Obecnie"},
    "perfilDesdeInicio": {"es": "Desde el inicio", "en": "Since the start", "fr": "Depuis le début", "de": "Seit Beginn", "it": "Dall’inizio", "nl": "Sinds het begin", "zh": "自开始以来", "zht": "自開始以來", "bg": "От началото", "pl": "Od początku"},
    "perfilTendencia": {"es": "Tendencia de 7 días", "en": "7-day trend", "fr": "Tendance sur 7 jours", "de": "7-Tage-Trend", "it": "Tendenza a 7 giorni", "nl": "7-daagse trend", "zh": "7天趋势", "zht": "7天趨勢", "bg": "Тенденция за 7 дни", "pl": "Trend 7 dni"},
    "perfilObjetivo": {"es": "Objetivo", "en": "Goal", "fr": "Objectif", "de": "Ziel", "it": "Obiettivo", "nl": "Doel", "zh": "目标", "zht": "目標", "bg": "Цел", "pl": "Cel"},
    "perfilObjetivoPlaceholder": {"es": "Peso objetivo (opcional)", "en": "Goal weight (optional)", "fr": "Poids cible (facultatif)", "de": "Zielgewicht (optional)", "it": "Peso obiettivo (facoltativo)", "nl": "Streefgewicht (optioneel)", "zh": "目标体重（选填）", "zht": "目標體重（選填）", "bg": "Целево тегло (по избор)", "pl": "Waga docelowa (opcjonalnie)"},
    "perfilSinDatos": {"es": "Aún no hay registros. Añada el primero.", "en": "No entries yet. Add the first one.", "fr": "Pas encore d’entrées. Ajoutez la première.", "de": "Noch keine Einträge. Fügen Sie den ersten hinzu.", "it": "Nessun dato per ora. Aggiunga il primo.", "nl": "Nog geen metingen. Voeg de eerste toe.", "zh": "暂无记录，请添加第一条。", "zht": "尚無紀錄，請新增第一筆。", "bg": "Още няма записи. Добавете първия.", "pl": "Brak wpisów. Można dodać pierwszy."},
    "perfilRango30": {"es": "30 días", "en": "30 days", "fr": "30 jours", "de": "30 Tage", "it": "30 giorni", "nl": "30 dagen", "zh": "30天", "zht": "30天", "bg": "30 дни", "pl": "30 dni"},
    "perfilRango90": {"es": "90 días", "en": "90 days", "fr": "90 jours", "de": "90 Tage", "it": "90 giorni", "nl": "90 dagen", "zh": "90天", "zht": "90天", "bg": "90 дни", "pl": "90 dni"},
    "perfilRangoAnio": {"es": "1 año", "en": "1 year", "fr": "1 an", "de": "1 Jahr", "it": "1 anno", "nl": "1 jaar", "zh": "1年", "zht": "1年", "bg": "1 година", "pl": "1 rok"},
    "perfilTotalCaminado": {"es": "Total caminado", "en": "Total walked", "fr": "Total parcouru", "de": "Insgesamt gelaufen", "it": "Totale a piedi", "nl": "Totaal gelopen", "zh": "累计步行", "zht": "累計步行", "bg": "Общо изминато", "pl": "Łączny dystans"},
    "perfilHoy": {"es": "Hoy", "en": "Today", "fr": "Aujourd’hui", "de": "Heute", "it": "Oggi", "nl": "Vandaag", "zh": "今天", "zht": "今天", "bg": "Днес", "pl": "Dziś"},
    "perfilBorrarRegistro": {"es": "Borrar", "en": "Delete", "fr": "Supprimer", "de": "Löschen", "it": "Eliminare", "nl": "Verwijderen", "zh": "删除", "zht": "刪除", "bg": "Изтриване", "pl": "Usunąć"},
    "perfilIsla": {"es": "Su isla", "en": "Your island", "fr": "Votre île", "de": "Ihre Insel", "it": "Sull’isola", "nl": "Uw eiland", "zh": "我的岛屿", "zht": "我的島嶼", "bg": "Вашият остров", "pl": "Na wyspie"},
    "perfilFavoritos": {"es": "Favoritos", "en": "Favourites", "fr": "Favoris", "de": "Favoriten", "it": "Preferiti", "nl": "Favorieten", "zh": "收藏", "zht": "收藏", "bg": "Любими", "pl": "Ulubione"},
    "perfilVisitados": {"es": "Visitados", "en": "Visited", "fr": "Visités", "de": "Besucht", "it": "Visitati", "nl": "Bezocht", "zh": "已访问", "zht": "已造訪", "bg": "Посетени", "pl": "Odwiedzone"},
    "perfilLogros": {"es": "Logros", "en": "Achievements", "fr": "Succès", "de": "Erfolge", "it": "Traguardi", "nl": "Prestaties", "zh": "成就", "zht": "成就", "bg": "Постижения", "pl": "Osiągnięcia"},
    "perfilSellos": {"es": "Sus sellos", "en": "Your stamps", "fr": "Vos tampons", "de": "Ihre Stempel", "it": "Timbri", "nl": "Uw stempels", "zh": "我的印章", "zht": "我的印章", "bg": "Вашите печати", "pl": "Pieczątki"},
    "perfilSiguienteLogro": {"es": "{n} lugar más para «{logro}»|{n} lugares más para «{logro}»", "en": "{n} more place to unlock “{logro}”|{n} more places to unlock “{logro}”", "fr": "Encore {n} lieu pour « {logro} »|Encore {n} lieux pour « {logro} »", "de": "Noch {n} Ort bis „{logro}“|Noch {n} Orte bis „{logro}“", "it": "Ancora {n} luogo per «{logro}»|Ancora {n} luoghi per «{logro}»", "nl": "Nog {n} plek voor “{logro}”|Nog {n} plekken voor “{logro}”", "zh": "再访问{n}个地点即可获得“{logro}”", "zht": "再造訪{n}個地點即可獲得「{logro}」", "bg": "Още {n} място до „{logro}“|Още {n} места до „{logro}“", "pl": "Jeszcze {n} miejsce do osiągnięcia „{logro}”|Jeszcze {n} miejsca do osiągnięcia „{logro}”|Jeszcze {n} miejsc do osiągnięcia „{logro}”"},
    "perfilLugares": {"es": "{n} lugar|{n} lugares", "en": "{n} place|{n} places", "fr": "{n} lieu|{n} lieux", "de": "{n} Ort|{n} Orte", "it": "{n} luogo|{n} luoghi", "nl": "{n} plek|{n} plekken", "zh": "{n}个地点", "zht": "{n}個地點", "bg": "{n} място|{n} места", "pl": "{n} miejsce|{n} miejsca|{n} miejsc"},
    "perfilCuenta": {"es": "Cuenta", "en": "Account", "fr": "Compte", "de": "Konto", "it": "Account", "nl": "Account", "zh": "账户", "zht": "帳戶", "bg": "Акаунт", "pl": "Konto"},
    "perfilNube": {"es": "Sus favoritos se guardan en su cuenta; su perfil y sus medidas, solo en este dispositivo.", "en": "Your favourites are saved to your account; your profile and measurements stay on this device.", "fr": "Vos favoris sont enregistrés dans votre compte ; votre profil et vos mesures restent sur cet appareil.", "de": "Ihre Favoriten werden in Ihrem Konto gespeichert, Ihr Profil und Ihre Messwerte nur auf diesem Gerät.", "it": "I preferiti vengono salvati nell’account; profilo e misure restano su questo dispositivo.", "nl": "Uw favorieten worden in uw account opgeslagen; uw profiel en metingen blijven op dit apparaat.", "zh": "您的收藏保存在账户中；个人资料和身高体重等数据只保存在本设备上。", "zht": "您的收藏會儲存在帳戶中；個人檔案和身高體重等資料只儲存在此裝置上。", "bg": "Любимите ви се пазят в акаунта ви; профилът и измерванията ви остават само на това устройство.", "pl": "Ulubione zapisują się na koncie; profil i pomiary zostają tylko na tym urządzeniu."},
    "perfilSoloDispositivo": {"es": "Sin cuenta: todo se guarda solo en este dispositivo", "en": "No account: everything stays on this device only", "fr": "Sans compte : tout est enregistré uniquement sur cet appareil", "de": "Ohne Konto: Alles wird nur auf diesem Gerät gespeichert", "it": "Senza account: tutto resta solo su questo dispositivo", "nl": "Zonder account: alles wordt alleen op dit apparaat opgeslagen", "zh": "未登录：所有内容仅保存在本设备", "zht": "未登入：所有內容僅儲存在此裝置上", "bg": "Без акаунт: всичко се пази само на това устройство", "pl": "Bez konta: wszystko zostaje tylko na tym urządzeniu"},
    "perfilCrearCuenta": {"es": "Crear cuenta o entrar", "en": "Sign up or log in", "fr": "Créer un compte ou se connecter", "de": "Konto erstellen oder anmelden", "it": "Registrazione o accesso", "nl": "Account aanmaken of inloggen", "zh": "注册或登录", "zht": "註冊或登入", "bg": "Регистрация или вход", "pl": "Rejestracja lub logowanie"},
    "perfilInvitado": {"es": "Invitado", "en": "Guest", "fr": "Invité", "de": "Gast", "it": "Ospite", "nl": "Gast", "zh": "访客", "zht": "訪客", "bg": "Гост", "pl": "Gość"},
    "perfilExportar": {"es": "Descargar datos del perfil", "en": "Download profile data", "fr": "Télécharger les données du profil", "de": "Profildaten herunterladen", "it": "Download dei dati del profilo", "nl": "Profielgegevens downloaden", "zh": "下载个人资料数据", "zht": "下載個人檔案資料", "bg": "Изтегляне на данните от профила", "pl": "Eksport danych profilu"},
    "perfilAnadir": {"es": "Añadir", "en": "Add", "fr": "Ajouter", "de": "Hinzufügen", "it": "Aggiungere", "nl": "Toevoegen", "zh": "添加", "zht": "新增", "bg": "Добавяне", "pl": "Dodać"},
    "perfilDistancia": {"es": "Distancia", "en": "Distance", "fr": "Distance", "de": "Strecke", "it": "Distanza", "nl": "Afstand", "zh": "距离", "zht": "距離", "bg": "Разстояние", "pl": "Dystans"},
    "perfilUltimos7": {"es": "Últimos 7 días", "en": "Last 7 days", "fr": "7 derniers jours", "de": "Letzte 7 Tage", "it": "Ultimi 7 giorni", "nl": "Laatste 7 dagen", "zh": "最近7天", "zht": "最近7天", "bg": "Последните 7 дни", "pl": "Ostatnie 7 dni"},
    "perfilFecha": {"es": "Fecha", "en": "Date", "fr": "Date", "de": "Datum", "it": "Data", "nl": "Datum", "zh": "日期", "zht": "日期", "bg": "Дата", "pl": "Data"},
    "perfilRango": {"es": "Entre {min} y {max}", "en": "Between {min} and {max}", "fr": "Entre {min} et {max}", "de": "Zwischen {min} und {max}", "it": "Tra {min} e {max}", "nl": "Tussen {min} en {max}", "zh": "须在{min}到{max}之间", "zht": "須在{min}到{max}之間", "bg": "Между {min} и {max}", "pl": "Od {min} do {max}"},
    "perfilFechaFutura": {"es": "La fecha no puede ser posterior a hoy", "en": "The date can’t be later than today", "fr": "La date ne peut pas être postérieure à aujourd’hui", "de": "Das Datum darf nicht nach heute liegen", "it": "La data non può essere successiva a oggi", "nl": "De datum mag niet later zijn dan vandaag", "zh": "日期不能晚于今天", "zht": "日期不能晚於今天", "bg": "Датата не може да е след днес", "pl": "Data nie może być późniejsza niż dzisiaj"},
    "perfilImcJoven": {"es": "Por debajo de 20 años, la OMS usa tablas por edad y sexo", "en": "Under 20, the WHO uses age- and sex-specific charts", "fr": "Avant 20 ans, l’OMS utilise des courbes selon l’âge et le sexe", "de": "Unter 20 Jahren nutzt die WHO Kurven nach Alter und Geschlecht", "it": "Sotto i 20 anni l’OMS usa curve per età e sesso", "nl": "Onder de 20 jaar gebruikt de WHO curves naar leeftijd en geslacht", "zh": "20岁以下，世卫组织采用按年龄和性别划分的标准", "zht": "20歲以下，世衛組織採用依年齡和性別區分的標準", "bg": "Под 20 години СЗО използва таблици по възраст и пол", "pl": "Poniżej 20 lat WHO stosuje siatki centylowe według wieku i płci"},
    "perfilBorrarLocal": {"es": "Borrar los datos del perfil de este dispositivo", "en": "Delete profile data from this device", "fr": "Effacer les données du profil de cet appareil", "de": "Profildaten von diesem Gerät löschen", "it": "Cancellazione dei dati del profilo da questo dispositivo", "nl": "Profielgegevens van dit apparaat wissen", "zh": "删除本设备上的个人资料数据", "zht": "刪除此裝置上的個人檔案資料", "bg": "Изтриване на данните от профила на това устройство", "pl": "Usunięcie danych profilu z tego urządzenia"},
    "perfilBorrarLocalAviso": {"es": "Se borrarán de este dispositivo su nombre, su avatar, sus medidas y sus kilómetros. Los favoritos no se tocan. No se puede deshacer.", "en": "Your name, avatar, measurements and kilometres will be deleted from this device. Favourites are not affected. This cannot be undone.", "fr": "Votre nom, votre avatar, vos mesures et vos kilomètres seront effacés de cet appareil. Les favoris ne sont pas touchés. C’est définitif.", "de": "Ihr Name, Ihr Avatar, Ihre Messwerte und Kilometer werden von diesem Gerät gelöscht. Favoriten bleiben erhalten. Das lässt sich nicht rückgängig machen.", "it": "Nome, avatar, misure e chilometri verranno cancellati da questo dispositivo. I preferiti restano. Non si può annullare.", "nl": "Uw naam, avatar, metingen en kilometers worden van dit apparaat gewist. Uw favorieten blijven bewaard. Dit kan niet ongedaan worden gemaakt.", "zh": "将从本设备删除您的名字、头像、身高体重等数据和公里数，收藏不受影响。此操作无法撤销。", "zht": "將從此裝置刪除您的名字、頭像、身高體重等資料和公里數，收藏不受影響。此操作無法復原。", "bg": "Името, аватарът, измерванията и километрите ви ще бъдат изтрити от това устройство. Любимите остават. Това не може да бъде отменено.", "pl": "Imię, awatar, pomiary i kilometry zostaną usunięte z tego urządzenia. Ulubione pozostaną bez zmian. Tej operacji nie można cofnąć."},
    "perfilBorrarLocalSi": {"es": "Sí, borrar", "en": "Yes, delete", "fr": "Oui, effacer", "de": "Ja, löschen", "it": "Sì, cancellare", "nl": "Ja, wissen", "zh": "确定删除", "zht": "確定刪除", "bg": "Изтриване", "pl": "Tak, usunąć"},
    "perfilBorrado": {"es": "Datos del perfil borrados de este dispositivo", "en": "Profile data deleted from this device", "fr": "Données du profil effacées de cet appareil", "de": "Profildaten von diesem Gerät gelöscht", "it": "Dati del profilo cancellati da questo dispositivo", "nl": "Profielgegevens van dit apparaat gewist", "zh": "已从本设备删除个人资料数据", "zht": "已從此裝置刪除個人檔案資料", "bg": "Данните от профила са изтрити от това устройство", "pl": "Dane profilu usunięte z tego urządzenia"},
    "perfilVisitaVerdad": {"es": "Una visita queda comprobada si marca el lugar como visitado estando allí. Lo comprueba el móvil con su ubicación, que para ello no se envía a ningún sitio.", "en": "A visit is verified when you mark the place as visited while you are there. Your phone checks this with its location, which isn’t sent anywhere in the process.", "fr": "Une visite est vérifiée si vous marquez le lieu comme visité sur place. Votre téléphone le vérifie grâce à sa position, qui n’est envoyée nulle part pour cela.", "de": "Ein Besuch gilt als bestätigt, wenn Sie den Ort als besucht markieren, während Sie dort sind. Das Gerät prüft das anhand seines Standorts, der dafür nirgendwohin gesendet wird.", "it": "Una visita è verificata se il luogo viene segnato come visitato mentre ci si trova lì. Lo verifica il dispositivo con la posizione, che a tale scopo non viene inviata da nessuna parte.", "nl": "Een bezoek geldt als bevestigd wanneer u de plek als bezocht markeert terwijl u er bent. Het apparaat controleert dat aan de hand van zijn locatie, die hiervoor nergens naartoe wordt gestuurd.", "zh": "在现场将地点标记为已访问，即视为确认到访。由本设备根据定位确认，定位信息不会为此发送到任何地方。", "zht": "在現場將地點標記為已造訪，即視為確認到訪。由此裝置根據定位確認，定位資訊不會為此傳送到任何地方。", "bg": "Посещението е потвърдено, ако отбележите мястото като посетено, докато сте там. Устройството проверява това по местоположението си, което за целта не се изпраща никъде.", "pl": "Wizyta jest potwierdzona, jeśli miejsce zostanie oznaczone jako odwiedzone podczas pobytu w nim. Urządzenie sprawdza to na podstawie lokalizacji, która w tym celu nie jest nigdzie wysyłana."},
    "perfilNubeInterruptor": {"es": "Guardar el perfil y los progresos en su cuenta", "en": "Save profile and progress to your account", "fr": "Enregistrer le profil et les progrès dans votre compte", "de": "Profil und Fortschritte in Ihrem Konto speichern", "it": "Salvare profilo e progressi nell’account", "nl": "Profiel en voortgang in uw account opslaan", "zh": "将个人资料和进展保存到您的账户", "zht": "將個人檔案和進展儲存到您的帳戶", "bg": "Запазване на профила и напредъка в акаунта ви", "pl": "Zapisywanie profilu i postępów na koncie"},
    "perfilNubeExplica": {"es": "Para no perderlos al cambiar de móvil. Solo con su permiso, que puede retirar cuando quiera.", "en": "So they aren’t lost if you change phones. Only with your permission, which you can withdraw at any time.", "fr": "Pour ne pas les perdre en changeant de téléphone. Uniquement avec votre accord, que vous pouvez retirer à tout moment.", "de": "Damit sie bei einem Gerätewechsel nicht verloren gehen. Nur mit Ihrer Einwilligung, die Sie jederzeit widerrufen können.", "it": "Per non perderli cambiando telefono. Solo con il consenso, revocabile in qualsiasi momento.", "nl": "Zodat ze niet verloren gaan als u van telefoon wisselt. Alleen met uw toestemming, die u altijd kunt intrekken.", "zh": "换手机时也不会丢失。仅在您同意后保存，您可随时撤回同意。", "zht": "換手機時也不會遺失。僅在您同意後儲存，您可隨時撤回同意。", "bg": "За да не се загубят при смяна на телефона. Само с ваше съгласие, което можете да оттеглите по всяко време.", "pl": "Żeby nie przepadły przy zmianie telefonu. Tylko za zgodą, którą można wycofać w dowolnej chwili."},
    "perfilNubeConsentimiento": {"es": "Se guardarán en su cuenta su nombre o apodo, su avatar, sus unidades, su altura, su año de nacimiento, la fecha de alta del perfil, su peso objetivo y los pesos y kilómetros que anote, con la fecha de cada uno. El peso y la altura son datos de salud: al tocar «Acepto» da su permiso expreso para guardarlos. Las visitas comprobadas no se suben: se quedan solo en este dispositivo. Puede retirar el permiso cuando quiera con este interruptor: se borra la copia guardada en su cuenta y todo sigue en este dispositivo.", "en": "Your name or nickname, avatar, units, height, year of birth, profile start date, goal weight, and the weights and kilometres you log, each with its date, will be saved to your account. Weight and height are health data: by tapping «I agree» you give your explicit permission to save them. Verified visits are not uploaded: they stay on this device only. You can withdraw your permission at any time with this switch: the copy saved in your account is then deleted, and everything stays on this device.", "fr": "Seront enregistrés dans votre compte : votre prénom ou pseudo, votre avatar, vos unités, votre taille, votre année de naissance, la date de création du profil, votre poids cible, ainsi que les poids et les kilomètres que vous notez, chacun avec sa date. Le poids et la taille sont des données de santé : en appuyant sur «J’accepte», vous donnez votre consentement explicite à leur enregistrement. Les visites vérifiées ne sont pas envoyées : elles restent uniquement sur cet appareil. Vous pouvez retirer votre consentement à tout moment avec cet interrupteur : la copie enregistrée dans votre compte est alors effacée, et tout reste sur cet appareil.", "de": "In Ihrem Konto werden gespeichert: Ihr Name oder Spitzname, Ihr Avatar, Ihre Einheiten, Ihre Größe, Ihr Geburtsjahr, das Erstellungsdatum des Profils, Ihr Zielgewicht sowie Ihre Gewichts- und Kilometereinträge, jeweils mit Datum. Gewicht und Größe sind Gesundheitsdaten: Wenn Sie auf «Ich stimme zu» tippen, willigen Sie ausdrücklich in ihre Speicherung ein. Bestätigte Besuche werden nicht hochgeladen, sie bleiben nur auf diesem Gerät. Sie können Ihre Einwilligung jederzeit mit diesem Schalter widerrufen: Dann wird die in Ihrem Konto gespeicherte Kopie gelöscht, und auf diesem Gerät bleibt alles erhalten.", "it": "Nell’account verranno salvati nome o soprannome, avatar, unità, altezza, anno di nascita, data di creazione del profilo, peso obiettivo, nonché i pesi e i chilometri annotati, ciascuno con la sua data. Peso e altezza sono dati relativi alla salute: toccando «Acconsento» si esprime il consenso esplicito al loro salvataggio. Le visite verificate non vengono caricate: restano solo su questo dispositivo. Il consenso si può revocare in qualsiasi momento con questo interruttore: la copia salvata nell’account viene allora cancellata e su questo dispositivo resta tutto.", "nl": "In uw account worden opgeslagen: uw naam of bijnaam, avatar, eenheden, lengte, geboortejaar, de startdatum van het profiel, uw streefgewicht en de gewichten en kilometers die u noteert, elk met datum. Gewicht en lengte zijn gezondheidsgegevens: door op «Ik ga akkoord» te tikken geeft u uitdrukkelijk toestemming om ze op te slaan. Bevestigde bezoeken worden niet geüpload: ze blijven alleen op dit apparaat. U kunt uw toestemming altijd intrekken met deze schakelaar: dan wordt de kopie in uw account gewist en blijft alles op dit apparaat.", "zh": "您的名字或昵称、头像、单位、身高、出生年份、个人资料的创建日期、目标体重，以及您记录的体重和公里数（各附日期）将保存到您的账户。体重和身高属于健康数据：点按「我同意」即表示您明确同意保存这些数据。已确认的到访不会上传，只保留在本设备上。您可以随时通过此开关撤回同意：届时您账户中的副本会被删除，本设备上的数据仍会保留。", "zht": "您的名字或暱稱、頭像、單位、身高、出生年份、個人檔案的建立日期、目標體重，以及您記錄的體重和公里數（各附日期）將儲存到您的帳戶。體重和身高屬於健康資料：點按「我同意」即表示您明確同意儲存這些資料。已確認的到訪不會上傳，只保留在此裝置上。您可以隨時透過此開關撤回同意：屆時您帳戶中的副本會被刪除，此裝置上的資料仍會保留。", "bg": "В акаунта ви ще се запазят името или прякорът ви, аватарът, мерните единици, ръстът, годината на раждане, датата на създаване на профила, целевото тегло, както и теглата и километрите, които записвате, всеки запис с датата си. Теглото и ръстът са данни за здравословното състояние: като докоснете «Приемам», давате изричното си съгласие да бъдат запазени. Потвърдените посещения не се качват: остават само на това устройство. Можете да оттеглите съгласието си по всяко време с този превключвател: тогава копието в акаунта ви се изтрива и всичко остава на това устройство.", "pl": "Na koncie zostaną zapisane: imię lub pseudonim, awatar, jednostki, wzrost, rok urodzenia, data utworzenia profilu, waga docelowa oraz wpisane wagi i kilometry, każdy wpis z datą. Waga i wzrost to dane dotyczące zdrowia: dotknięcie przycisku «Wyrażam zgodę» jest równoznaczne z wyraźną zgodą na ich zapisanie. Potwierdzone wizyty nie są wysyłane: pozostają tylko na tym urządzeniu. Zgodę można w każdej chwili wycofać tym przełącznikiem: kopia zapisana na koncie zostanie wtedy usunięta, a na tym urządzeniu wszystko pozostanie."},
    "perfilNubeAcepto": {"es": "Acepto", "en": "I agree", "fr": "J’accepte", "de": "Ich stimme zu", "it": "Acconsento", "nl": "Ik ga akkoord", "zh": "我同意", "zht": "我同意", "bg": "Приемам", "pl": "Wyrażam zgodę"},
    "perfilNubeQuitarAviso": {"es": "Se borrará la copia guardada en su cuenta. En este dispositivo se queda todo.", "en": "The copy in your account will be deleted. Everything stays on this device.", "fr": "La copie enregistrée dans votre compte sera effacée. Tout reste sur cet appareil.", "de": "Die in Ihrem Konto gespeicherte Kopie wird gelöscht. Auf diesem Gerät bleibt alles erhalten.", "it": "La copia salvata nell’account verrà cancellata. Su questo dispositivo resta tutto.", "nl": "De kopie in uw account wordt gewist. Op dit apparaat blijft alles bewaard.", "zh": "将删除您账户中的副本，本设备上的内容全部保留。", "zht": "將刪除您帳戶中的副本，此裝置上的內容全部保留。", "bg": "Копието в акаунта ви ще бъде изтрито. На това устройство всичко остава.", "pl": "Kopia zapisana na koncie zostanie usunięta. Na tym urządzeniu wszystko pozostanie."},
    "perfilNubeQuitarSi": {"es": "Borrar de la nube", "en": "Delete from the cloud", "fr": "Effacer du cloud", "de": "Aus der Cloud löschen", "it": "Cancellare dal cloud", "nl": "Uit de cloud wissen", "zh": "从云端删除", "zht": "從雲端刪除", "bg": "Изтриване от облака", "pl": "Usunąć z chmury"},
    "perfilNubeSi": {"es": "Sus favoritos, su perfil y sus progresos se guardan en su cuenta.", "en": "Your favourites, profile and progress are saved to your account.", "fr": "Vos favoris, votre profil et vos progrès sont enregistrés dans votre compte.", "de": "Ihre Favoriten, Ihr Profil und Ihre Fortschritte werden in Ihrem Konto gespeichert.", "it": "Preferiti, profilo e progressi vengono salvati nell’account.", "nl": "Uw favorieten, profiel en voortgang worden in uw account opgeslagen.", "zh": "您的收藏、个人资料和进展都保存在账户中。", "zht": "您的收藏、個人檔案和進展都會儲存在帳戶中。", "bg": "Любимите, профилът и напредъкът ви се пазят в акаунта ви.", "pl": "Ulubione, profil i postępy zapisują się na koncie."},
    "perfilNubeGuardado": {"es": "Guardado en su cuenta ✓", "en": "Saved to your account ✓", "fr": "Enregistré dans votre compte ✓", "de": "In Ihrem Konto gespeichert ✓", "it": "Salvato nell’account ✓", "nl": "In uw account opgeslagen ✓", "zh": "已保存到您的账户 ✓", "zht": "已儲存到您的帳戶 ✓", "bg": "Запазено в акаунта ви ✓", "pl": "Zapisano na koncie ✓"},
    "perfilNubeQuitado": {"es": "Borrado de la nube. En este dispositivo sigue todo.", "en": "Deleted from the cloud. Everything is still on this device.", "fr": "Effacé du cloud. Tout reste sur cet appareil.", "de": "Aus der Cloud gelöscht. Auf diesem Gerät ist alles noch da.", "it": "Cancellato dal cloud. Su questo dispositivo resta tutto.", "nl": "Uit de cloud gewist. Op dit apparaat staat alles nog.", "zh": "已从云端删除，本设备上的内容全部保留。", "zht": "已從雲端刪除，此裝置上的內容全部保留。", "bg": "Изтрито от облака. На това устройство всичко остава.", "pl": "Usunięto z chmury. Na tym urządzeniu wszystko pozostało."},
    "perfilNubeError": {"es": "No se ha podido guardar en la nube. Todo sigue en este dispositivo y la app lo volverá a intentar.", "en": "Couldn’t save to the cloud. Everything stays on this device, and the app will try again.", "fr": "Impossible d’enregistrer dans le cloud. Tout reste sur cet appareil et l’app réessaiera.", "de": "Speichern in der Cloud nicht möglich. Alles bleibt auf diesem Gerät, und die App versucht es erneut.", "it": "Impossibile salvare nel cloud. Tutto resta su questo dispositivo e l’app riproverà.", "nl": "Opslaan in de cloud is niet gelukt. Alles blijft op dit apparaat en de app probeert het opnieuw.", "zh": "无法保存到云端。所有数据仍保留在本设备上，应用稍后会重试。", "zht": "無法儲存到雲端。所有資料仍保留在此裝置上，應用程式稍後會重試。", "bg": "Запазването в облака не успя. Всичко остава на това устройство; приложението ще опита отново.", "pl": "Nie udało się zapisać w chmurze. Wszystko pozostaje na tym urządzeniu; aplikacja spróbuje ponownie."},
    "perfilBorrarLocalAvisoNube": {"es": "Se borrarán su nombre, su avatar, sus medidas y sus kilómetros de este dispositivo y de su cuenta. Los favoritos no se tocan. No se puede deshacer.", "en": "Your name, avatar, measurements and kilometres will be deleted from this device and from your account. Favourites are not affected. This cannot be undone.", "fr": "Votre nom, votre avatar, vos mesures et vos kilomètres seront effacés de cet appareil et de votre compte. Les favoris ne sont pas touchés. C’est définitif.", "de": "Ihr Name, Ihr Avatar, Ihre Messwerte und Kilometer werden von diesem Gerät und aus Ihrem Konto gelöscht. Favoriten bleiben erhalten. Das lässt sich nicht rückgängig machen.", "it": "Nome, avatar, misure e chilometri verranno cancellati da questo dispositivo e dall’account. I preferiti restano. Non si può annullare.", "nl": "Uw naam, avatar, metingen en kilometers worden van dit apparaat en uit uw account gewist. Uw favorieten blijven bewaard. Dit kan niet ongedaan worden gemaakt.", "zh": "将从本设备和您的账户中删除您的名字、头像、身高体重等数据和公里数，收藏不受影响。此操作无法撤销。", "zht": "將從此裝置和您的帳戶中刪除您的名字、頭像、身高體重等資料和公里數，收藏不受影響。此操作無法復原。", "bg": "Името, аватарът, измерванията и километрите ви ще бъдат изтрити от това устройство и от акаунта ви. Любимите остават. Това не може да бъде отменено.", "pl": "Imię, awatar, pomiary i kilometry zostaną usunięte z tego urządzenia i z konta. Ulubione pozostaną bez zmian. Tej operacji nie można cofnąć."},
    "perfilNubeQuitarPendiente": {"es": "La copia guardada en su cuenta se borrará en cuanto haya conexión.", "en": "The copy in the cloud will be deleted as soon as there is a connection.", "fr": "La copie dans le cloud sera effacée dès que la connexion sera rétablie.", "de": "Die Kopie in der Cloud wird gelöscht, sobald eine Verbindung besteht.", "it": "La copia nel cloud verrà cancellata non appena ci sarà una connessione.", "nl": "De kopie in de cloud wordt gewist zodra er verbinding is.", "zh": "联网后将删除云端的副本。", "zht": "連線後將刪除雲端的副本。", "bg": "Копието в облака ще бъде изтрито, веднага щом има връзка.", "pl": "Kopia w chmurze zostanie usunięta, gdy tylko pojawi się połączenie."},
    "perfilBorradoNube": {"es": "Datos del perfil borrados de este dispositivo y de su cuenta", "en": "Profile data deleted from this device and from your account", "fr": "Données du profil effacées de cet appareil et de votre compte", "de": "Profildaten von diesem Gerät und aus Ihrem Konto gelöscht", "it": "Dati del profilo cancellati da questo dispositivo e dall’account", "nl": "Profielgegevens van dit apparaat en uit uw account gewist", "zh": "已从本设备和您的账户中删除个人资料数据", "zht": "已從此裝置和您的帳戶中刪除個人檔案資料", "bg": "Данните от профила са изтрити от това устройство и от акаунта ви", "pl": "Dane profilu usunięte z tego urządzenia i z konta"},
    "perfilNubeEdad": {"es": "Disponible a partir de los {n} años.", "en": "Available from age {n}.", "fr": "Disponible à partir de {n} ans.", "de": "Ab {n} Jahren verfügbar.", "it": "Disponibile a partire dai {n} anni.", "nl": "Beschikbaar vanaf {n} jaar.", "zh": "年满{n}岁方可使用。", "zht": "年滿{n}歲方可使用。", "bg": "Достъпно от {n}-годишна възраст.", "pl": "Dostępne po ukończeniu {n} lat."},
    "perfilSet_es": {"es": "España", "en": "Spain", "fr": "Espagne", "de": "Spanien", "it": "Spagna", "nl": "Spanje", "zh": "西班牙", "zht": "西班牙", "bg": "Испания", "pl": "Hiszpania"},
    "perfilSet_en": {"es": "Reino Unido", "en": "United Kingdom", "fr": "Royaume-Uni", "de": "Vereinigtes Königreich", "it": "Regno Unito", "nl": "Verenigd Koninkrijk", "zh": "英国", "zht": "英國", "bg": "Великобритания", "pl": "Wielka Brytania"},
    "perfilSet_de": {"es": "Alemania", "en": "Germany", "fr": "Allemagne", "de": "Deutschland", "it": "Germania", "nl": "Duitsland", "zh": "德国", "zht": "德國", "bg": "Германия", "pl": "Niemcy"},
    "perfilSet_fr": {"es": "Francia", "en": "France", "fr": "France", "de": "Frankreich", "it": "Francia", "nl": "Frankrijk", "zh": "法国", "zht": "法國", "bg": "Франция", "pl": "Francja"},
    "perfilSet_it": {"es": "Italia", "en": "Italy", "fr": "Italie", "de": "Italien", "it": "Italia", "nl": "Italië", "zh": "意大利", "zht": "義大利", "bg": "Италия", "pl": "Włochy"},
    "perfilSet_nl": {"es": "Países Bajos", "en": "Netherlands", "fr": "Pays-Bas", "de": "Niederlande", "it": "Paesi Bassi", "nl": "Nederland", "zh": "荷兰", "zht": "荷蘭", "bg": "Нидерландия", "pl": "Holandia"},
    "perfilSet_pl": {"es": "Polonia", "en": "Poland", "fr": "Pologne", "de": "Polen", "it": "Polonia", "nl": "Polen", "zh": "波兰", "zht": "波蘭", "bg": "Полша", "pl": "Polska"},
    "perfilSet_bg": {"es": "Bulgaria", "en": "Bulgaria", "fr": "Bulgarie", "de": "Bulgarien", "it": "Bulgaria", "nl": "Bulgarije", "zh": "保加利亚", "zht": "保加利亞", "bg": "България", "pl": "Bułgaria"},
    "perfilSet_zh": {"es": "China", "en": "China", "fr": "Chine", "de": "China", "it": "Cina", "nl": "China", "zh": "中国", "zht": "中國", "bg": "Китай", "pl": "Chiny"},
    "perfilSet_zht": {"es": "Chino tradicional", "en": "Traditional Chinese", "fr": "Chinois traditionnel", "de": "Traditionelles Chinesisch", "it": "Cinese tradizionale", "nl": "Traditioneel Chinees", "zh": "繁体中文", "zht": "繁體中文", "bg": "Традиционен китайски", "pl": "Chiński tradycyjny"},
    "perfilSet_tf": {"es": "Tenerife", "en": "Tenerife", "fr": "Tenerife", "de": "Teneriffa", "it": "Tenerife", "nl": "Tenerife", "zh": "特内里费", "zht": "特內里費", "bg": "Тенерифе", "pl": "Teneryfa"},
    "perfilAv_es_sol": {"es": "Sol", "en": "Sun", "fr": "Soleil", "de": "Sonne", "it": "Sole", "nl": "Zon", "zh": "太阳", "zht": "太陽", "bg": "Слънце", "pl": "Słońce"},
    "perfilAv_es_guitarra": {"es": "Guitarra", "en": "Guitar", "fr": "Guitare", "de": "Gitarre", "it": "Chitarra", "nl": "Gitaar", "zh": "吉他", "zht": "吉他", "bg": "Китара", "pl": "Gitara"},
    "perfilAv_es_molino": {"es": "Molino manchego", "en": "La Mancha windmill", "fr": "Moulin à vent", "de": "Windmühle", "it": "Mulino a vento", "nl": "Spaanse molen", "zh": "风车", "zht": "風車", "bg": "Вятърна мелница", "pl": "Wiatrak"},
    "perfilAv_es_abanico": {"es": "Abanico", "en": "Spanish fan", "fr": "Éventail", "de": "Fächer", "it": "Ventaglio", "nl": "Waaier", "zh": "折扇", "zht": "摺扇", "bg": "Ветрило", "pl": "Wachlarz"},
    "perfilAv_es_paella": {"es": "Paella", "en": "Paella", "fr": "Paella", "de": "Paella", "it": "Paella", "nl": "Paella", "zh": "海鲜饭", "zht": "海鮮飯", "bg": "Паеля", "pl": "Paella"},
    "perfilAv_en_cabina": {"es": "Cabina telefónica", "en": "Phone box", "fr": "Cabine téléphonique", "de": "Telefonzelle", "it": "Cabina telefonica", "nl": "Telefooncel", "zh": "红色电话亭", "zht": "紅色電話亭", "bg": "Телефонна кабина", "pl": "Budka telefoniczna"},
    "perfilAv_en_bus": {"es": "Autobús de dos pisos", "en": "Double-decker", "fr": "Bus à impériale", "de": "Doppeldecker", "it": "Bus a due piani", "nl": "Dubbeldekker", "zh": "双层巴士", "zht": "雙層巴士", "bg": "Двуетажен автобус", "pl": "Piętrowy autobus"},
    "perfilAv_en_te": {"es": "Taza de té", "en": "Cup of tea", "fr": "Tasse de thé", "de": "Tasse Tee", "it": "Tazza di tè", "nl": "Kopje thee", "zh": "一杯茶", "zht": "一杯茶", "bg": "Чаша чай", "pl": "Filiżanka herbaty"},
    "perfilAv_en_corgi": {"es": "Corgi", "en": "Corgi", "fr": "Corgi", "de": "Corgi", "it": "Corgi", "nl": "Corgi", "zh": "柯基", "zht": "柯基", "bg": "Корги", "pl": "Corgi"},
    "perfilAv_en_paraguas": {"es": "Paraguas", "en": "Umbrella", "fr": "Parapluie", "de": "Regenschirm", "it": "Ombrello", "nl": "Paraplu", "zh": "雨伞", "zht": "雨傘", "bg": "Чадър", "pl": "Parasol"},
    "perfilAv_de_brezel": {"es": "Pretzel", "en": "Pretzel", "fr": "Bretzel", "de": "Brezel", "it": "Brezel", "nl": "Pretzel", "zh": "碱水面包", "zht": "德國結", "bg": "Брецел", "pl": "Precel"},
    "perfilAv_de_oso": {"es": "Oso de Berlín", "en": "Berlin bear", "fr": "Ours de Berlin", "de": "Berliner Bär", "it": "Orso di Berlino", "nl": "Berlijnse beer", "zh": "柏林熊", "zht": "柏林熊", "bg": "Берлинска мечка", "pl": "Berliński niedźwiedź"},
    "perfilAv_de_cuco": {"es": "Reloj de cuco", "en": "Cuckoo clock", "fr": "Horloge à coucou", "de": "Kuckucksuhr", "it": "Orologio a cucù", "nl": "Koekoeksklok", "zh": "布谷鸟钟", "zht": "咕咕鐘", "bg": "Часовник с кукувица", "pl": "Zegar z kukułką"},
    "perfilAv_de_castillo": {"es": "Castillo", "en": "Castle", "fr": "Château", "de": "Schloss", "it": "Castello", "nl": "Kasteel", "zh": "城堡", "zht": "城堡", "bg": "Замък", "pl": "Zamek"},
    "perfilAv_de_gnomo": {"es": "Gnomo de jardín", "en": "Garden gnome", "fr": "Nain de jardin", "de": "Gartenzwerg", "it": "Nano da giardino", "nl": "Tuinkabouter", "zh": "花园小矮人", "zht": "花園小矮人", "bg": "Градинско джудже", "pl": "Krasnal ogrodowy"},
    "perfilAv_fr_torre": {"es": "Torre Eiffel", "en": "Eiffel Tower", "fr": "Tour Eiffel", "de": "Eiffelturm", "it": "Torre Eiffel", "nl": "Eiffeltoren", "zh": "埃菲尔铁塔", "zht": "艾菲爾鐵塔", "bg": "Айфелова кула", "pl": "Wieża Eiffla"},
    "perfilAv_fr_croissant": {"es": "Croissant", "en": "Croissant", "fr": "Croissant", "de": "Croissant", "it": "Croissant", "nl": "Croissant", "zh": "牛角包", "zht": "可頌", "bg": "Кроасан", "pl": "Croissant"},
    "perfilAv_fr_gallo": {"es": "Gallo", "en": "Cockerel", "fr": "Coq", "de": "Hahn", "it": "Gallo", "nl": "Haan", "zh": "公鸡", "zht": "公雞", "bg": "Петел", "pl": "Kogut"},
    "perfilAv_fr_lavanda": {"es": "Lavanda", "en": "Lavender", "fr": "Lavande", "de": "Lavendel", "it": "Lavanda", "nl": "Lavendel", "zh": "薰衣草", "zht": "薰衣草", "bg": "Лавандула", "pl": "Lawenda"},
    "perfilAv_fr_macaron": {"es": "Macarons", "en": "Macarons", "fr": "Macarons", "de": "Macarons", "it": "Macaron", "nl": "Macarons", "zh": "马卡龙", "zht": "馬卡龍", "bg": "Френски макарони", "pl": "Makaroniki"},
    "perfilAv_it_coliseo": {"es": "Coliseo", "en": "Colosseum", "fr": "Colisée", "de": "Kolosseum", "it": "Colosseo", "nl": "Colosseum", "zh": "罗马斗兽场", "zht": "羅馬競技場", "bg": "Колизеум", "pl": "Koloseum"},
    "perfilAv_it_pizza": {"es": "Pizza", "en": "Pizza", "fr": "Pizza", "de": "Pizza", "it": "Pizza", "nl": "Pizza", "zh": "披萨", "zht": "披薩", "bg": "Пица", "pl": "Pizza"},
    "perfilAv_it_gondola": {"es": "Góndola", "en": "Gondola", "fr": "Gondole", "de": "Gondel", "it": "Gondola", "nl": "Gondel", "zh": "贡多拉", "zht": "貢多拉", "bg": "Гондола", "pl": "Gondola"},
    "perfilAv_it_pisa": {"es": "Torre de Pisa", "en": "Leaning Tower of Pisa", "fr": "Tour de Pise", "de": "Schiefer Turm", "it": "Torre di Pisa", "nl": "Toren van Pisa", "zh": "比萨斜塔", "zht": "比薩斜塔", "bg": "Пизанската кула", "pl": "Krzywa Wieża"},
    "perfilAv_it_helado": {"es": "Helado italiano", "en": "Gelato", "fr": "Gelato", "de": "Gelato", "it": "Gelato", "nl": "Gelato", "zh": "意式冰淇淋", "zht": "義式冰淇淋", "bg": "Джелато", "pl": "Gelato"},
    "perfilAv_nl_tulipan": {"es": "Tulipán", "en": "Tulip", "fr": "Tulipe", "de": "Tulpe", "it": "Tulipano", "nl": "Tulp", "zh": "郁金香", "zht": "鬱金香", "bg": "Лале", "pl": "Tulipan"},
    "perfilAv_nl_molino": {"es": "Molino holandés", "en": "Dutch windmill", "fr": "Moulin hollandais", "de": "Holländische Windmühle", "it": "Mulino olandese", "nl": "Hollandse molen", "zh": "荷兰风车", "zht": "荷蘭風車", "bg": "Холандска мелница", "pl": "Holenderski wiatrak"},
    "perfilAv_nl_bici": {"es": "Bicicleta", "en": "Bicycle", "fr": "Vélo", "de": "Fahrrad", "it": "Bicicletta", "nl": "Fiets", "zh": "自行车", "zht": "腳踏車", "bg": "Велосипед", "pl": "Rower"},
    "perfilAv_nl_zuecos": {"es": "Zueco con tulipán", "en": "Clog with a tulip", "fr": "Sabot et tulipe", "de": "Holzschuh mit Tulpe", "it": "Zoccolo con tulipano", "nl": "Klomp met tulp", "zh": "木鞋与郁金香", "zht": "木鞋與鬱金香", "bg": "Дървена обувка с лале", "pl": "Chodak z tulipanem"},
    "perfilAv_nl_queso": {"es": "Queso", "en": "Cheese", "fr": "Fromage", "de": "Käse", "it": "Formaggio", "nl": "Kaas", "zh": "奶酪", "zht": "起司", "bg": "Кашкавал", "pl": "Ser"},
    "perfilAv_pl_pierogi": {"es": "Pierogi", "en": "Pierogi", "fr": "Pierogi", "de": "Piroggen", "it": "Pierogi", "nl": "Pierogi", "zh": "波兰饺子", "zht": "波蘭餃子", "bg": "Пьероги", "pl": "Pierogi"},
    "perfilAv_pl_zubr": {"es": "Bisonte europeo", "en": "European bison", "fr": "Bison", "de": "Wisent", "it": "Bisonte", "nl": "Wisent", "zh": "欧洲野牛", "zht": "歐洲野牛", "bg": "Зубър", "pl": "Żubr"},
    "perfilAv_pl_ciguena": {"es": "Cigüeña", "en": "Stork", "fr": "Cigogne", "de": "Storch", "it": "Cicogna", "nl": "Ooievaar", "zh": "白鹳", "zht": "白鸛", "bg": "Щъркел", "pl": "Bocian"},
    "perfilAv_pl_ambar": {"es": "Ámbar", "en": "Amber", "fr": "Ambre", "de": "Bernstein", "it": "Ambra", "nl": "Barnsteen", "zh": "琥珀", "zht": "琥珀", "bg": "Кехлибар", "pl": "Bursztyn"},
    "perfilAv_pl_flor": {"es": "Flor recortada", "en": "Paper-cut flower", "fr": "Fleur en papier", "de": "Papierblume", "it": "Fiore di carta", "nl": "Papieren bloem", "zh": "剪纸花", "zht": "剪紙花", "bg": "Хартиено цвете", "pl": "Wycinanka"},
    "perfilAv_bg_rosa": {"es": "Rosa", "en": "Rose", "fr": "Rose", "de": "Rose", "it": "Rosa", "nl": "Roos", "zh": "玫瑰", "zht": "玫瑰", "bg": "Българска роза", "pl": "Róża"},
    "perfilAv_bg_martenitsa": {"es": "Martenitsa", "en": "Martenitsa", "fr": "Martenitsa", "de": "Marteniza", "it": "Martenitsa", "nl": "Martenitsa", "zh": "玛尔泰尼察", "zht": "瑪爾泰尼察", "bg": "Мартеница", "pl": "Marteniczka"},
    "perfilAv_bg_shopska": {"es": "Ensalada shopska", "en": "Shopska salad", "fr": "Salade chopska", "de": "Schopska-Salat", "it": "Insalata shopska", "nl": "Shopskasalade", "zh": "肖普斯卡沙拉", "zht": "肖普斯卡沙拉", "bg": "Шопска салата", "pl": "Sałatka szopska"},
    "perfilAv_bg_shevitsa": {"es": "Bordado", "en": "Embroidery", "fr": "Broderie", "de": "Stickerei", "it": "Ricamo", "nl": "Borduurwerk", "zh": "刺绣", "zht": "刺繡", "bg": "Шевица", "pl": "Haft"},
    "perfilAv_bg_yogur": {"es": "Yogur", "en": "Yogurt", "fr": "Yaourt", "de": "Joghurt", "it": "Yogurt", "nl": "Yoghurt", "zh": "酸奶", "zht": "優格", "bg": "Кисело мляко", "pl": "Jogurt"},
    "perfilAv_zh_panda": {"es": "Panda", "en": "Panda", "fr": "Panda", "de": "Panda", "it": "Panda", "nl": "Panda", "zh": "熊猫", "zht": "熊貓", "bg": "Панда", "pl": "Panda"},
    "perfilAv_zh_farol": {"es": "Farolillo", "en": "Lantern", "fr": "Lanterne", "de": "Laterne", "it": "Lanterna", "nl": "Lantaarn", "zh": "红灯笼", "zht": "紅燈籠", "bg": "Фенер", "pl": "Lampion"},
    "perfilAv_zh_jiaozi": {"es": "Empanadilla china", "en": "Dumpling", "fr": "Ravioli chinois", "de": "Jiaozi", "it": "Ravioli cinesi", "nl": "Dumpling", "zh": "饺子", "zht": "餃子", "bg": "Китайски пелмени", "pl": "Chińskie pierożki"},
    "perfilAv_zh_muralla": {"es": "Gran Muralla", "en": "Great Wall", "fr": "Grande Muraille", "de": "Chinesische Mauer", "it": "Grande Muraglia", "nl": "Chinese Muur", "zh": "长城", "zht": "長城", "bg": "Великата стена", "pl": "Wielki Mur"},
    "perfilAv_zh_tetera": {"es": "Tetera", "en": "Teapot", "fr": "Théière", "de": "Teekanne", "it": "Teiera", "nl": "Theepot", "zh": "茶壶", "zht": "茶壺", "bg": "Чайник", "pl": "Czajniczek"},
    "perfilAv_zht_bubble": {"es": "Bubble tea", "en": "Bubble tea", "fr": "Bubble tea", "de": "Bubble Tea", "it": "Bubble tea", "nl": "Bubble tea", "zh": "珍珠奶茶", "zht": "珍珠奶茶", "bg": "Чай с тапиока", "pl": "Bubble tea"},
    "perfilAv_zht_dimsum": {"es": "Dim sum", "en": "Dim sum", "fr": "Dim sum", "de": "Dim Sum", "it": "Dim sum", "nl": "Dimsum", "zh": "点心", "zht": "點心", "bg": "Дим сум", "pl": "Dim sum"},
    "perfilAv_zht_junco": {"es": "Junco chino", "en": "Junk boat", "fr": "Jonque", "de": "Dschunke", "it": "Giunca", "nl": "Jonk", "zh": "中式帆船", "zht": "中式帆船", "bg": "Джонка", "pl": "Dżonka"},
    "perfilAv_zht_oso": {"es": "Oso negro asiático", "en": "Asian black bear", "fr": "Ours à collier", "de": "Kragenbär", "it": "Orso dal collare", "nl": "Kraagbeer", "zh": "黑熊", "zht": "黑熊", "bg": "Хималайска мечка", "pl": "Niedźwiedź himalajski"},
    "perfilAv_zht_farol_cielo": {"es": "Farolillo volador", "en": "Sky lantern", "fr": "Lanterne céleste", "de": "Himmelslaterne", "it": "Lanterna volante", "nl": "Wensballon", "zh": "天灯", "zht": "天燈", "bg": "Небесен фенер", "pl": "Lampion szczęścia"},
    "perfilAv_tf_teide": {"es": "Teide", "en": "Teide", "fr": "Teide", "de": "Teide", "it": "Teide", "nl": "Teide", "zh": "泰德峰", "zht": "泰德峰", "bg": "Тейде", "pl": "Teide"},
    "perfilAv_tf_lagarto": {"es": "Lagarto tizón", "en": "Tenerife lizard", "fr": "Lézard de Tenerife", "de": "Westkanaren-Eidechse", "it": "Lucertola di Tenerife", "nl": "Tenerife-hagedis", "zh": "特内里费蜥蜴", "zht": "特內里費蜥蜴", "bg": "Тенерифски гущер", "pl": "Jaszczurka z Teneryfy"},
    "perfilAv_tf_guagua": {"es": "Guagua", "en": "Guagua (bus)", "fr": "Guagua (bus)", "de": "Guagua (Bus)", "it": "Guagua (bus)", "nl": "Guagua (bus)", "zh": "公交车", "zht": "公車", "bg": "Гуагуа (автобус)", "pl": "Guagua (autobus)"},
    "perfilAv_tf_drago": {"es": "Drago", "en": "Dragon tree", "fr": "Dragonnier", "de": "Drachenbaum", "it": "Albero del drago", "nl": "Drakenboom", "zh": "龙血树", "zht": "龍血樹", "bg": "Драконово дърво", "pl": "Smocze drzewo"},
    "perfilAv_tf_calderon": {"es": "Calderón", "en": "Pilot whale", "fr": "Globicéphale", "de": "Grindwal", "it": "Globicefalo", "nl": "Griend", "zh": "领航鲸", "zht": "領航鯨", "bg": "Гринда", "pl": "Grindwal"}
  };
  Object.assign(UI_TX, PERFIL_UI);

  /* Sin el catalogo no hay pantalla. El cargador pide antes avatares.js; si
     aun asi no esta, no se define TG_PERFIL y el cargador abre la ficha de la
     cuenta, como antes del perfil. */
  var AV = window.TG_AVATARES;
  if (!AV) return;

  var KEY = 'tenerife.perfil';
  var KG_LB = 2.20462, CM_IN = 2.54;
  /* Rangos admitidos: los mismos al escribir, al leer del dispositivo, al leer
     de la nube y en los check de perfil.sql. */
  var RANGO = { cm: [80, 250], pulgadas: [32, 98], kg: [20, 400], lb: [45, 880], km: [0.1, 200] };
  var EDAD_ADULTO = 20;   /* OMS: de 5 a 19 años se usa el IMC para la edad, no estas categorias */
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── utilidades ── */
  function $(id) { return document.getElementById(id); }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fecha(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dias(a, b) { return Math.round((fecha(b) - fecha(a)) / 86400000); }
  function hoy() { return ymd(new Date()); }
  function esFecha(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(fecha(s)); }
  /* Postgres devuelve las horas con microsegundos («…34.261123+00:00»); Safari no siempre
     los lee: se dejan en milisegundos antes de Date.parse. */
  function instante(s) { return typeof s === 'string' && s.length <= 40 ? Date.parse(s.replace(/(\.\d{3})\d+/, '$1')) : NaN; }
  function esInstante(s) { return !isNaN(instante(s)); }
  function esUid(s) { return typeof s === 'string' && /^[0-9a-f-]{8,64}$/i.test(s); }
  function esIdCaminata(s) { return typeof s === 'string' && s.length >= 8 && s.length <= 64; }
  function vacio(v) { return v === null || v === undefined || v === ''; }
  /* El idioma es el de la app, y los numeros y las fechas, con su formato
     (PRECIOS_GAS_LOCALE, el mismo mapa de codigos que usa la app). */
  function lengua() { return (typeof currentLang === 'string' && currentLang) || 'es'; }
  function locale() { return PRECIOS_GAS_LOCALE[lengua()] || 'es-ES'; }
  /* authLoggedAs y authLogoutBtn no estan en UI_TX: estan en AUTH_STRINGS, fundido en LANGS */
  function txCuenta(k) { var L = typeof t === 'function' ? t() : null; return (L && L[k]) || ''; }
  function nombreSet(id) { return tx('perfilSet_' + id) || id; }
  function nombreAvatar(id) { return tx('perfilAv_' + id.replace(/-/g, '_')) || id; }
  function nombreLogro(b) { var l = lengua(); return (b && b.name && (b.name[l] || b.name.en || b.name.es)) || ''; }
  function fmt(n, dec) { return new Intl.NumberFormat(locale(), { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n); }
  function fmtFecha(s, op) { return fecha(s).toLocaleDateString(locale(), op || { day: 'numeric', month: 'short' }); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  /* Cada cambio se guarda entero. Y el boton de la cuenta lleva el avatar
     elegido (lo pinta el cargador de index.html): si cambio, aqui, al borrar
     o desde la nube, se repinta. */
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
    if (st.avatar !== avatarCuenta) {
      avatarCuenta = st.avatar;
      try { if (typeof window.TG_AVATAR_CUENTA === 'function') window.TG_AVATAR_CUENTA(); } catch (e) {}
    }
  }
  /* Id de cada caminata, unico tambien entre moviles (es su clave en la
     nube): crypto.randomUUID si existe (iOS 15.4, Chrome 92), y si no, hora
     + azar. */
  function nuevoId() {
    try { if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID(); } catch (e) {}
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  }
  var toastT;
  /* Que de tiempo a leerlo: unos 55 ms por letra (150 por caracter chino), entre 2,2 y 7 s
     (los avisos de la nube llegan a 120 letras). */
  function toast(txt) {
    var e = $('tgp-toast'); if (!e) return;
    e.textContent = txt; e.classList.add('show'); clearTimeout(toastT);
    var cjk = (String(txt).match(/[\u3000-\u9fff\uff00-\uffef]/g) || []).length;
    toastT = setTimeout(function () { e.classList.remove('show'); }, Math.min(7000, Math.max(2200, (String(txt).length - cjk) * 55 + cjk * 150)));
  }
  /* «81,5» y «81.5» valen lo mismo. Vacio -> null; lo que no es un numero -> NaN. */
  function leerNumero(id) {
    var s = String($(id).value || '').replace(/\s/g, '').replace(',', '.');
    if (!s) return null;
    return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
  }
  /* Comprueba un campo contra su rango; si esta mal lo dice debajo y devuelve undefined. */
  function campo(id, rango, ayudaId) {
    var v = leerNumero(id), mal = v !== null && (isNaN(v) || v < rango[0] || v > rango[1]);
    $(id).setAttribute('aria-invalid', mal ? 'true' : 'false');
    var a = $(ayudaId); if (a) { a.classList.toggle('error', mal); if (mal) a.textContent = tx('perfilRango', { min: fmt(rango[0], rango[0] % 1 ? 1 : 0), max: fmt(rango[1], 0) }); }
    return mal ? undefined : v;
  }

  /* ── estado ── */
  function porDefecto() {
    /* editado: cuando se toco el perfil por ultima vez (para juntarlo con la nube).
       nube: null o { uid, desde, ok }: el permiso de ESA cuenta (desde = cuando se dio;
       ok = este movil ya se junto con la nube). colas: lo que falta por subir, por cuenta. */
    return { v: 1, nombre: '', avatar: '', unidades: 'metric', altura_cm: null, nacimiento: null, objetivo_kg: null,
      medidas: [], km: [], creado: hoy(), rango: 30, tab: 'peso', editado: null, nube: null, colas: {} };
  }
  function leerNube(n) { return (n && typeof n === 'object' && esUid(n.uid) && esInstante(n.desde)) ? { uid: n.uid, desde: n.desde, ok: n.ok === true } : null; }
  function leerColas(cs) {
    var out = {}; if (!cs || typeof cs !== 'object') return out;
    Object.keys(cs).slice(0, 8).forEach(function (u) {
      var c = cs[u]; if (!esUid(u) || !c || typeof c !== 'object') return;
      var q = { uid: u, n: Number.isInteger(c.n) && c.n >= 0 ? c.n : 0, alta: c.alta === true, baja: c.baja === true,
        perfil: Number.isInteger(c.perfil) && c.perfil > 0 ? c.perfil : 0, pesos: {}, km: {} };
      ['pesos', 'km'].forEach(function (tipo) {
        var m = c[tipo]; if (!m || typeof m !== 'object') return;
        Object.keys(m).forEach(function (k) {
          var e = m[k];
          if ((tipo === 'pesos' ? esFecha(k) : esIdCaminata(k)) && Array.isArray(e) && (e[0] === 0 || e[0] === 1) && Number.isInteger(e[1])) q[tipo][k] = [e[0], e[1]];
        });
      });
      out[u] = q;
    });
    return out;
  }
  /* Lo que viene de localStorage se valida campo a campo: lo que no vale se
     descarta, no todo. Otra version (v) se lee en lo que se reconozca y se
     reescribe en la 1. */
  function cargar() {
    var s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!s || typeof s !== 'object') return porDefecto();
    var d = porDefecto(), anio = new Date().getFullYear();
    d.nombre = typeof s.nombre === 'string' ? s.nombre.trim().slice(0, 24) : '';
    d.avatar = (typeof s.avatar === 'string' && AV.porId(s.avatar)) ? s.avatar : '';
    d.unidades = s.unidades === 'imperial' ? 'imperial' : 'metric';
    d.altura_cm = (s.altura_cm >= RANGO.cm[0] && s.altura_cm <= RANGO.cm[1]) ? s.altura_cm : null;
    d.nacimiento = (s.nacimiento >= 1900 && s.nacimiento <= anio) ? s.nacimiento : null;
    d.objetivo_kg = (s.objetivo_kg >= RANGO.kg[0] && s.objetivo_kg <= RANGO.kg[1]) ? s.objetivo_kg : null;
    d.creado = esFecha(s.creado) ? s.creado : d.creado;
    var vistos = {};
    d.medidas = (Array.isArray(s.medidas) ? s.medidas : []).filter(function (m) { return m && esFecha(m.d) && m.d <= hoy() && m.kg >= RANGO.kg[0] && m.kg <= RANGO.kg[1] && !vistos[m.d] && (vistos[m.d] = 1); });
    d.km = (Array.isArray(s.km) ? s.km : []).filter(function (k) { return k && esFecha(k.d) && k.d <= hoy() && k.km >= RANGO.km[0] && k.km <= RANGO.km[1]; }).map(function (k) { return { id: esIdCaminata(k.id) ? k.id : nuevoId(), d: k.d, km: k.km }; });
    /* la nube: el permiso solo cuenta con cuenta y fecha validas; la cola, entrada a entrada */
    d.editado = esInstante(s.editado) ? s.editado : null;
    d.nube = leerNube(s.nube);
    d.colas = leerColas(s.colas);
    d.rango = [30, 90, 365].indexOf(s.rango) >= 0 ? s.rango : 30;
    d.tab = s.tab === 'km' ? 'km' : 'peso';
    return d;
  }
  var st = cargar(), avatarCuenta = st.avatar;

  /* ── lo que da la app: AppFavorites y el bloque VISITADO + LOGROS (AppLogros) ── */
  /* visitados: los marcados con «Marcar visitado» (tenerife.visited), que dan los logros;
     comprobadas: los marcados estando alli, comprobado con la ubicacion (tenerife.visitas).
     El set Tenerife solo se abre con visitas comprobadas (Jerome, 22 de octubre). */
  function deLaApp(fn, porDefectoV) { try { return fn(); } catch (e) { return porDefectoV; } }
  function visitados() { return deLaApp(function () { return window.AppLogros.visitados().length; }, 0); }
  function comprobadas() { return deLaApp(function () { return window.AppLogros.comprobadas().length; }, 0); }
  function favoritos() { return deLaApp(function () { return window.AppFavorites.list().length; }, 0); }
  /* los seis logros de la app (VIS_BADGES y la cumbre), sin copiarlos */
  function listaLogros() { return deLaApp(function () { return window.AppLogros.lista(); }, []); }
  /* los que tiene la persona: los que la app ya le dio (tenerife.badges), igual que su panel de logros */
  function logrosConseguidos() {
    var tiene = deLaApp(function () { return window.AppLogros.conseguidos(); }, []);
    return listaLogros().filter(function (b) { return tiene.indexOf(b.key) >= 0; }).map(function (b) { return b.key; });
  }
  function setDesbloqueado(set) { return !set.desbloqueo || comprobadas() >= set.desbloqueo; }

  /* ── la cuenta (window.AppAuth, el puente de index.html) ── */
  function sesion() {
    var A = window.AppAuth;
    try { if (A && A.isConfigured() && A.isLoggedIn()) { var u = A.getUser(); if (u && esUid(u.id)) return u; } } catch (e) {}
    return null;
  }
  /* El boton de administrador, como pintarBotonAdmin() de index.html: escondido hasta que la
     funcion esAdmin() (rpc es_admin) dice que si. */
  function conAdmin(fn) {
    var p;
    try { p = (typeof window.esAdmin === 'function') ? window.esAdmin() : Promise.resolve(false); } catch (e) { return; }
    Promise.resolve(p).then(function (ok) { if (ok && sesion()) fn(); }, function () {});
  }
  function montado() { return !!$('tgp-cuenta-status'); }   /* el cuerpo se pone la primera vez que se abre */
  function abrirLogin() { var A = window.AppAuth; try { if (A && A.openLogin) A.openLogin(); } catch (e) {} }

  /* ── la nube, con permiso (Jerome, 22 de octubre: «lo hacemos con permiso del usuario») ──
     · Solo con sesion y solo con el permiso de ESA cuenta (st.nube.uid): si en el
       movil entra otra cuenta, a esa no se le sube nada sin su propio permiso.
     · La fila de perfiles ES el permiso: solo «Acepto» la crea (insert); lo demas
       la actualiza (update). Si ya no esta -el permiso se retiro en otro movil-, el
       interruptor se apaga aqui y la fila no se vuelve a crear sola.
     · Retirar el permiso, o borrar el perfil con la nube encendida, borra esa fila:
       pesos y caminatas caen detras (on delete cascade). Sin red, se queda en la
       cola y se hace en cuanto vuelva.
     · Las visitas comprobadas no suben nunca.
     · st.colas[uid]: lo que falta por subir (1) o borrar (0), clave a clave; cada
       marca lleva un numero que crece, para no perder lo que se toca mientras sube.
     · Por debajo de EDAD_NUBE (segun el año de nacimiento) no se ofrece encenderla;
       apagarla, siempre. */
  var EDAD_NUBE = 14;          /* LOPDGDD, art. 7: desde los 14 años se consiente solo */
  var NUBE_ESPERA = 1500;      /* ms entre el ultimo cambio y la subida */
  var NUBE_PLAZO = 15000;      /* una peticion que tarda mas cuenta como fallida (y se reintenta) */
  var nubeT = null, nubeCadena = Promise.resolve(), reintentoT = null, reintentoMs = 0;
  function clienteNube() { var A = window.AppAuth; try { return A && A.getClient ? A.getClient() : null; } catch (e) { return null; } }
  function nubeEncendida() { var u = sesion(); return !!(u && st.nube && st.nube.uid === u.id); }
  function menorParaNube() { var e = edad(); return e !== null && e < EDAD_NUBE; }
  function colaDe(uid) {
    if (!st.colas[uid]) st.colas[uid] = { uid: uid, n: 0, alta: false, baja: false, perfil: 0, pesos: {}, km: {} };
    return st.colas[uid];
  }
  function colaVacia(c) { return !c.alta && !c.baja && !c.perfil && !Object.keys(c.pesos).length && !Object.keys(c.km).length; }
  /* Cada cambio del perfil pasa por aqui (despues, guardar()). tipo: 'perfil' | 'pesos' | 'km'; op: 1 subir, 0 borrar. */
  function marcar(tipo, clave, op) {
    if (tipo === 'perfil') st.editado = new Date().toISOString();
    if (!st.nube) return;
    /* sin la sesion de esa cuenta no se sube nada; cuando vuelva, se juntan los dos lados */
    if (!nubeEncendida()) { st.nube.ok = false; return; }
    var c = colaDe(st.nube.uid); c.n++;
    if (tipo === 'perfil') c.perfil = c.n; else c[tipo][clave] = [op, c.n];
    programarNube();
  }
  function programarNube() { clearTimeout(nubeT); nubeT = setTimeout(sincronizar, NUBE_ESPERA); }
  function huella() { return JSON.stringify([st.nombre, st.avatar, st.unidades, st.altura_cm, st.nacimiento, st.objetivo_kg, st.creado, st.medidas, st.km]); }
  /* Las vueltas van en fila, de una en una. Devuelve lo que paso: 'ok', 'baja',
     'retirado', 'apagada', 'error', 'sin-red' o 'sin-sesion'. */
  function sincronizar() {
    clearTimeout(nubeT); clearTimeout(reintentoT);
    var p = nubeCadena.then(function () {
      var h0 = huella();
      return vueltaNube().then(function (r) { if (huella() !== h0) repintarTrasNube(); estadoNube(); return r; });
    }).catch(function () { estadoNube(); return 'error'; }).then(function (r) { reintentar(r); return r; });
    nubeCadena = p;
    return p;
  }
  /* Si fallo y queda algo en la cola, se reintenta sola: 30 s, 1 min, 2 min… hasta 15 min.
     Sin red del todo (navigator.onLine), espera al evento «online». */
  function reintentar(r) {
    var u = sesion();
    if (r !== 'error' || !u || !st.colas[u.id]) { reintentoMs = 0; return; }
    reintentoMs = Math.min(reintentoMs ? reintentoMs * 2 : 30000, 900000);
    clearTimeout(reintentoT); reintentoT = setTimeout(sincronizar, reintentoMs);
  }
  /* Una peticion a Supabase: siempre { data, error }. Sin red, supabase-js ya devuelve
     el error; si algo lanza o tarda mas de NUBE_PLAZO, tambien. */
  function pedir(q) {
    return new Promise(function (res) {
      var tope = setTimeout(function () { res({ data: null, error: { message: 'plazo' } }); }, NUBE_PLAZO);
      Promise.resolve(q).then(function (r) { clearTimeout(tope); res(r || { data: null, error: { message: 'vacia' } }); },
        function (e) { clearTimeout(tope); res({ data: null, error: { message: String((e && e.message) || e) } }); });
    });
  }
  function esFK(e) { return !!(e && e.code === '23503'); }   /* pesos o caminatas sin su fila de perfiles */
  function camposPerfil() {
    return { nombre: st.nombre || null, avatar: st.avatar || null, unidades: st.unidades, altura_cm: st.altura_cm,
      nacimiento: st.nacimiento, objetivo_kg: st.objetivo_kg, creado: st.creado, updated_at: new Date().toISOString() };
  }
  function retirado(uid) {
    if (st.nube && st.nube.uid === uid) st.nube = null;
    delete st.colas[uid]; guardar(); return 'retirado';
  }
  async function vueltaNube() {
    var u = sesion(), sb = clienteNube();
    if (!u || !sb) return 'sin-sesion';
    if (navigator.onLine === false) return 'sin-red';
    var uid = u.id, c = st.colas[uid], r;
    /* 1. Retirar el permiso: se borra su fila de perfiles; pesos y caminatas caen detras. */
    if (c && c.baja) {
      r = await pedir(sb.from('perfiles').delete().eq('user_id', uid));
      if (r.error) return 'error';
      if (st.colas[uid] === c && c.baja) { delete st.colas[uid]; guardar(); }
      return 'baja';
    }
    /* 2. Lo que hay en la nube de esta cuenta. */
    r = await pedir(sb.from('perfiles').select('consentido_en, nombre, avatar, unidades, altura_cm, nacimiento, objetivo_kg, creado, updated_at').eq('user_id', uid).maybeSingle());
    if (r.error) return 'error';
    var fila = r.data || null;
    c = st.colas[uid];
    if (c && c.baja) return 'error';   /* lo retiraron mientras tanto: la vuelta siguiente lo borra */
    if (!fila) {
      if (!(c && c.alta)) {
        /* Sin fila no hay permiso. Si este movil lo creia encendido, se retiro en otro sitio. */
        if (st.nube && st.nube.uid === uid) return retirado(uid);
        return 'apagada';
      }
      /* El permiso se dio aqui: la fila se crea (es el consentimiento) y se sube todo. */
      var alta = camposPerfil(), nAlta = c.n;
      alta.user_id = uid;
      alta.consentido_en = (st.nube && st.nube.uid === uid) ? st.nube.desde : new Date().toISOString();
      r = await pedir(sb.from('perfiles').insert(alta));
      if (r.error) return 'error';
      c = colaDe(uid); c.alta = false; if (c.perfil <= nAlta) c.perfil = 0;
      st.medidas.forEach(function (m) { c.n++; c.pesos[m.d] = [1, c.n]; });
      st.km.forEach(function (k) { c.n++; c.km[k.id] = [1, c.n]; });
      if (st.nube && st.nube.uid === uid) st.nube.ok = true;
      guardar();
    } else {
      /* Hay permiso para esta cuenta (dado aqui o en otro movil): se juntan los dos lados. */
      var rp = await pedir(sb.from('pesos').select('fecha, kg').eq('user_id', uid));
      var rk = await pedir(sb.from('caminatas').select('id, fecha, km').eq('user_id', uid));
      if (rp.error || rk.error) return 'error';
      if (st.colas[uid] && st.colas[uid].baja) return 'error';
      fusionar(uid, fila, rp.data || [], rk.data || []);
    }
    /* 3. Subir lo que esta en la cola. */
    c = st.colas[uid];
    if (!c) return 'ok';
    if (colaVacia(c)) { delete st.colas[uid]; guardar(); return 'ok'; }
    var hasta = c.n;
    if (c.perfil) {
      r = await pedir(sb.from('perfiles').update(camposPerfil()).eq('user_id', uid).select('user_id'));
      if (r.error) return 'error';
      if (!r.data || !r.data.length) return retirado(uid);   /* la fila ya no esta: no se vuelve a crear */
    }
    var subeP = [], borraP = [], subeK = [], borraK = [];
    Object.keys(c.pesos).forEach(function (d) {
      var m = c.pesos[d][0] === 1 ? st.medidas.find(function (x) { return x.d === d; }) : null;
      if (m) subeP.push({ user_id: uid, fecha: d, kg: m.kg }); else borraP.push(d);
    });
    Object.keys(c.km).forEach(function (id) {
      var k = c.km[id][0] === 1 ? st.km.find(function (x) { return x.id === id; }) : null;
      if (k) subeK.push({ user_id: uid, id: id, fecha: k.d, km: k.km }); else borraK.push(id);
    });
    if (subeP.length) { r = await pedir(sb.from('pesos').upsert(subeP, { onConflict: 'user_id,fecha' })); if (r.error) return esFK(r.error) ? retirado(uid) : 'error'; }
    if (borraP.length) { r = await pedir(sb.from('pesos').delete().eq('user_id', uid).in('fecha', borraP)); if (r.error) return 'error'; }
    if (subeK.length) { r = await pedir(sb.from('caminatas').upsert(subeK, { onConflict: 'user_id,id' })); if (r.error) return esFK(r.error) ? retirado(uid) : 'error'; }
    if (borraK.length) { r = await pedir(sb.from('caminatas').delete().eq('user_id', uid).in('id', borraK)); if (r.error) return 'error'; }
    /* 4. Fuera de la cola lo subido; lo que se toco mientras subia espera a la vuelta siguiente. */
    c = st.colas[uid];
    if (c && !c.baja) {
      if (c.perfil && c.perfil <= hasta) c.perfil = 0;
      ['pesos', 'km'].forEach(function (tipo) { Object.keys(c[tipo]).forEach(function (k) { if (c[tipo][k][1] <= hasta) delete c[tipo][k]; }); });
      if (colaVacia(c)) delete st.colas[uid]; else programarNube();
    }
    guardar();
    return 'ok';
  }
  /* Lo que llega de la nube se valida igual que lo de localStorage. */
  function perfilDeNube(f) {
    var anio = new Date().getFullYear(), al = Number(f.altura_cm), na = Number(f.nacimiento), ob = Number(f.objetivo_kg);
    return {
      nombre: typeof f.nombre === 'string' ? f.nombre.trim().slice(0, 24) : '',
      avatar: (typeof f.avatar === 'string' && AV.porId(f.avatar)) ? f.avatar : '',
      unidades: f.unidades === 'imperial' ? 'imperial' : 'metric',
      altura_cm: (f.altura_cm != null && al >= RANGO.cm[0] && al <= RANGO.cm[1]) ? al : null,
      nacimiento: (f.nacimiento != null && na >= 1900 && na <= anio) ? na : null,
      objetivo_kg: (f.objetivo_kg != null && ob >= RANGO.kg[0] && ob <= RANGO.kg[1]) ? ob : null,
      creado: esFecha(f.creado) ? f.creado : null
    };
  }
  /* Junta la nube con el movil, sin awaits por medio (no se cuela ningun cambio).
     La primera vez en este movil (st.nube.ok falso): la union; lo del movil gana el
     mismo dia y se sube. Despues manda la nube (asi llega lo que se borro en otro
     movil), salvo lo que esta en la cola, que es mas nuevo. Lo que el movil no puede
     enseñar (una fecha que aqui aun es futura) se queda en la nube sin tocarlo. */
  function fusionar(uid, fila, pesosSrv, kmSrv) {
    if (!st.nube || st.nube.uid !== uid) st.nube = { uid: uid, desde: esInstante(fila.consentido_en) ? fila.consentido_en : new Date().toISOString(), ok: false };
    var c = colaDe(uid), primera = !st.nube.ok, h = hoy();
    if (c.alta) c.alta = false;   /* la fila ya existia (otro movil): no hace falta crearla */
    function aSubir(tipo, k) { c.n++; c[tipo][k] = [1, c.n]; }
    /* pesos: uno por dia */
    var srv = {}, loc = {}, res = {};
    pesosSrv.forEach(function (r) { var kg = Number(r && r.kg); if (r && esFecha(r.fecha) && r.fecha <= h && kg >= RANGO.kg[0] && kg <= RANGO.kg[1]) srv[r.fecha] = kg; });
    st.medidas.forEach(function (m) { loc[m.d] = m.kg; });
    Object.keys(srv).forEach(function (d) { res[d] = srv[d]; });
    if (primera) Object.keys(loc).forEach(function (d) { if (srv[d] !== loc[d]) { res[d] = loc[d]; aSubir('pesos', d); } });
    else Object.keys(c.pesos).forEach(function (d) { if (c.pesos[d][0] === 1 && loc[d] != null) res[d] = loc[d]; else delete res[d]; });
    st.medidas = Object.keys(res).map(function (d) { return { d: d, kg: res[d] }; });
    /* caminatas: por id */
    var srvK = {}, locK = {}, resK = {};
    kmSrv.forEach(function (r) { var km = Number(r && r.km); if (r && esIdCaminata(r.id) && esFecha(r.fecha) && r.fecha <= h && km >= RANGO.km[0] && km <= RANGO.km[1]) srvK[r.id] = { id: r.id, d: r.fecha, km: km }; });
    st.km.forEach(function (k) { locK[k.id] = k; });
    Object.keys(srvK).forEach(function (id) { resK[id] = srvK[id]; });
    if (primera) Object.keys(locK).forEach(function (id) { var a = locK[id], b = srvK[id]; if (!b || b.d !== a.d || b.km !== a.km) { resK[id] = a; aSubir('km', id); } });
    else Object.keys(c.km).forEach(function (id) { if (c.km[id][0] === 1 && locK[id]) resK[id] = locK[id]; else delete resK[id]; });
    st.km = Object.keys(resK).map(function (id) { return resK[id]; });
    /* el perfil: la primera vez gana el ultimo que se edito y lo vacio se rellena con
       lo del otro lado; despues, la nube, salvo un cambio de aqui que espera en la cola.
       «Viajero desde»: la fecha mas antigua de las dos. */
    var nb = perfilDeNube(fila), CAMPOS = ['nombre', 'avatar', 'unidades', 'altura_cm', 'nacimiento', 'objetivo_kg'];
    var ganaMovil = primera ? !!(st.editado && (!esInstante(fila.updated_at) || instante(st.editado) > instante(fila.updated_at))) : !!c.perfil;
    var subir = false;
    CAMPOS.forEach(function (k) {
      if (ganaMovil) {
        if (!primera) return;                                  /* un cambio de aqui espera en la cola: manda el movil, tambien si vacio un campo */
        if (vacio(st[k]) && !vacio(nb[k])) st[k] = nb[k];      /* lo que aqui falta, de la nube */
        else if (st[k] !== nb[k]) subir = true;                /* lo de aqui, a la nube */
      } else if (!vacio(nb[k])) st[k] = nb[k];
      else if (primera) { if (!vacio(st[k])) subir = true; }   /* la nube no lo tiene: sube lo de aqui */
      else st[k] = (k === 'nombre' || k === 'avatar') ? '' : null;   /* lo vaciaron en otro movil */
    });
    if (nb.creado && nb.creado < st.creado) st.creado = nb.creado; else if (primera && nb.creado !== st.creado) subir = true;
    if (subir && !c.perfil) { c.n++; c.perfil = c.n; }
    st.nube.ok = true;
    if (colaVacia(c)) delete st.colas[uid];
    guardar();
  }

  function ordenadas() { return st.medidas.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; }); }
  function pesoActual() { var m = ordenadas(); return m.length ? m[m.length - 1].kg : null; }
  function edad() { return st.nacimiento ? new Date().getFullYear() - st.nacimiento : null; }
  /* Sin avatar elegido, el primero del set del idioma de la app (el set Tenerife empieza cerrado) */
  function avatarActual() {
    if (st.avatar && AV.porId(st.avatar)) return AV.porId(st.avatar);
    var s = AV.set(lengua()) || AV.sets[0]; return s.avatares[0];
  }
  var setAbierto = null;
  /* Lo que la persona ha tocado en el formulario desde que se pinto: solo eso se guarda.
     Asi «Guardar» sin tocar el peso no inventa un registro de hoy, y cambiar de
     unidades no reescribe la altura redondeada (176 cm pasaba a 175). */
  var tocado = { altura: false, peso: false, nac: false };

  /* ── textos: los del cuerpo (data-tx, data-tx-ph, data-tx-aria), en el idioma de la app ── */
  function aplicarTextos() {
    panel.querySelectorAll('[data-tx]').forEach(function (n) { var v = tx(n.getAttribute('data-tx')); if (v) n.textContent = v; });
    panel.querySelectorAll('[data-tx-ph]').forEach(function (n) { n.placeholder = tx(n.getAttribute('data-tx-ph')); });
    panel.querySelectorAll('[data-tx-aria]').forEach(function (n) { n.setAttribute('aria-label', tx(n.getAttribute('data-tx-aria'))); });
    /* el lang del contenedor, para partir las palabras largas por silabas (hyphens: auto) */
    var l = lengua();
    $('tgp').setAttribute('lang', l === 'zht' ? 'zh-Hant' : (l === 'zh' ? 'zh-Hans' : l));
  }

  /* ── heroe ── */
  function renderHero(pop) {
    var a = avatarActual(), s = AV.set(a.set);
    $('tgp').style.setProperty('--set', s.color);   /* en .tgp, donde los estilos declaran --set */
    var big = $('tgp-ava-big');
    big.innerHTML = AV.svg(a.id, { etiqueta: nombreAvatar(a.id) });
    if (pop && !reducido) { big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); }
    var n = $('tgp-name');
    n.textContent = st.nombre || tx('perfilNombrePlaceholder');
    n.classList.toggle('is-empty', !st.nombre);
    var meta = $('tgp-meta'); meta.textContent = '';
    var c1 = el('span', 'tgp-chip set'); c1.appendChild(el('span', 'flag', s.bandera)); c1.appendChild(el('span', '', nombreAvatar(a.id))); meta.appendChild(c1);
    var c2 = el('span', 'tgp-chip'); c2.appendChild(el('span', 'muted', tx('perfilViajeroDesde', { fecha: fmtFecha(st.creado, { month: 'short', year: 'numeric' }) }))); meta.appendChild(c2);
    var v = visitados(), tiene = logrosConseguidos(), ultimo = null;
    listaLogros().forEach(function (b) { if (b.min && tiene.indexOf(b.key) >= 0) ultimo = b; });
    var c3 = el('span', 'tgp-chip'); c3.appendChild(el('span', '', (ultimo ? ultimo.icon + ' ' + nombreLogro(ultimo) : '🌱') + ' · ' + tx('perfilLugares', { n: v }))); meta.appendChild(c3);
  }

  /* ── sets y carrusel ── */
  function renderSets() {
    var box = $('tgp-sets'); box.textContent = '';
    if (!setAbierto) setAbierto = avatarActual().set;
    AV.sets.forEach(function (s) {
      var b = el('button', 'tgp-set'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.set = s.id;
      b.style.setProperty('--set-color', s.color);
      b.appendChild(el('span', 'flag', s.bandera)); b.appendChild(el('span', '', nombreSet(s.id)));
      if (!setDesbloqueado(s)) { b.classList.add('is-locked'); b.appendChild(el('span', '', '🔒')); }
      var on = s.id === setAbierto; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
      box.appendChild(b);
    });
    /* El set elegido, a la vista dentro de su fila, y solo de lado: con
       scrollIntoView la pantalla entera bajaba al abrirla en un movil bajo o
       en horizontal (48 px a 320x568, 156 px a 740x360). */
    var on = box.querySelector('.is-on');
    if (on) {
      var rb = box.getBoundingClientRect(), ro = on.getBoundingClientRect();
      if (ro.left < rb.left) box.scrollLeft += ro.left - rb.left; else if (ro.right > rb.right) box.scrollLeft += ro.right - rb.right;
    }
    renderStrip(false);
  }
  function renderStrip(animar) {
    var s = AV.set(setAbierto), box = $('tgp-strip'); box.textContent = '';
    var libre = setDesbloqueado(s), actual = avatarActual().id;
    s.avatares.forEach(function (a, i) {
      var b = el('button', 'tgp-av'); b.type = 'button'; b.dataset.id = a.id; b.style.setProperty('--i', animar ? i : 0);
      if (!animar) b.style.animation = 'none';
      b.innerHTML = AV.svg(a.id);
      b.appendChild(el('span', 'name', nombreAvatar(a.id)));
      b.setAttribute('aria-label', nombreAvatar(a.id));
      b.setAttribute('aria-pressed', a.id === actual ? 'true' : 'false');
      if (a.id === actual) b.classList.add('is-on');
      if (!libre) { b.classList.add('is-locked'); b.disabled = true; }
      box.appendChild(b);
    });
    $('tgp-pick').textContent = nombreAvatar(actual);
    $('tgp-lock-note').textContent = libre ? '' : tx('perfilBloqueado', { n: s.desbloqueo, v: Math.min(comprobadas(), s.desbloqueo) });
    $('tgp-lock-why').hidden = libre;
    var on = box.querySelector('.is-on'); if (on && animar) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducido ? 'auto' : 'smooth' });
  }
  function elegirAvatar(id) {
    var a = AV.porId(id); if (!a || !setDesbloqueado(AV.set(a.set))) return;
    if (st.avatar !== id) { st.avatar = id; marcar('perfil'); }
    guardar();
    renderHero(true); renderSets(); renderStrip(false);
    confeti(AV.set(a.set));
    toast(tx('perfilAvatarGuardado'));
  }

  /* ── confeti (canvas del heroe) ── */
  function confeti(set) {
    if (reducido) return;
    var cv = $('tgp-confeti'), hero = $('tgp-hero'); var r = hero.getBoundingClientRect();
    cv.width = r.width * 2; cv.height = r.height * 2;
    var ctx = cv.getContext('2d'); ctx.scale(2, 2);
    var ring = panel.querySelector('.tgp-ring').getBoundingClientRect();
    var cx = ring.left - r.left + ring.width / 2, cy = ring.top - r.top + ring.height / 2;
    var cols = [set.color, '#D4AF37', '#F5C76B', '#FFFFFF'];
    var ps = [];
    for (var i = 0; i < 70; i++) { var ang = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 6;
      ps.push({ x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3, w: 4 + Math.random() * 5, h: 3 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[i % cols.length], vida: 1 }); }
    var t0 = performance.now();
    (function paso(ahora) {
      var dt = (ahora - t0) / 1000; ctx.clearRect(0, 0, r.width, r.height);
      ps.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .22; p.vx *= .985; p.rot += p.vr; p.vida = Math.max(0, 1 - dt / 1.5);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.vida; ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (dt < 1.5) requestAnimationFrame(paso); else ctx.clearRect(0, 0, r.width, r.height);
    })(t0);
  }

  /* ── datos ── */
  function imperial() { return st.unidades === 'imperial'; }
  function rAltura() { return imperial() ? RANGO.pulgadas : RANGO.cm; }
  function rPeso() { return imperial() ? RANGO.lb : RANGO.kg; }
  function aKg(v) { return Math.round((imperial() ? v / KG_LB : v) * 10) / 10; }
  function aCm(v) { return imperial() ? Math.round(v * CM_IN) : Math.round(v * 10) / 10; }
  function deKg(kg) { return imperial() ? Math.round(kg * KG_LB * 10) / 10 : kg; }
  function mostrarNum(v, dec) { return v == null ? '' : fmt(v, dec); }
  function renderDatos() {
    var imp = imperial();
    $('tgp-altura-u').textContent = imp ? 'in' : 'cm';
    $('tgp-peso-u').textContent = imp ? 'lb' : 'kg'; $('tgp-peso-nuevo-u').textContent = imp ? 'lb' : 'kg'; $('tgp-objetivo-u').textContent = imp ? 'lb' : 'kg';
    $('tgp-altura').value = st.altura_cm ? (imp ? String(Math.round(st.altura_cm / CM_IN)) : mostrarNum(st.altura_cm, st.altura_cm % 1 ? 1 : 0)) : '';
    var p = pesoActual();
    $('tgp-peso').value = p ? mostrarNum(deKg(p), 1) : '';
    $('tgp-nac').value = st.nacimiento || '';
    $('tgp-objetivo').value = st.objetivo_kg ? mostrarNum(deKg(st.objetivo_kg), 1) : '';
    ['tgp-objetivo'].forEach(function (id) { $(id).setAttribute('aria-invalid', 'false'); $(id + '-h').textContent = ''; $(id + '-h').classList.remove('error'); });
    panel.querySelectorAll('#tgp-unidades button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.u === st.unidades); });
    tocado = { altura: false, peso: false, nac: false };
    ayudas();
  }
  function leerAnio() {
    var s = String($('tgp-nac').value || '').trim(); if (!s) return null;
    var n = /^\d{4}$/.test(s) ? parseInt(s, 10) : NaN, anio = new Date().getFullYear();
    return (n >= 1900 && n <= anio) ? n : undefined;
  }
  function pies(cm) { var inch = Math.round(cm / CM_IN); return Math.floor(inch / 12) + '′' + (inch % 12) + '″'; }
  function stones(kg) { var lb = Math.round(kg * KG_LB); return Math.floor(lb / 14) + ' st ' + (lb % 14) + ' lb'; }
  function ayudas() {
    var hv = campo('tgp-altura', rAltura(), 'tgp-altura-h'), pv = campo('tgp-peso', rPeso(), 'tgp-peso-h');
    var h = hv ? aCm(hv) : null, p = pv ? aKg(pv) : null;
    if (hv !== undefined) $('tgp-altura-h').textContent = h ? (imperial() ? fmt(h, 0) + ' cm' : pies(h)) : '';
    if (pv !== undefined) $('tgp-peso-h').textContent = p ? (imperial() ? fmt(p, 1) + ' kg' : stones(p)) : '';
    var n = leerAnio(), anio = new Date().getFullYear(), ayN = $('tgp-nac-h');
    $('tgp-nac').setAttribute('aria-invalid', n === undefined ? 'true' : 'false');
    ayN.classList.toggle('error', n === undefined);
    ayN.textContent = n === undefined ? tx('perfilRango', { min: '1900', max: String(anio) }) : (n ? tx('perfilAnios', { n: anio - n }) : '');
    var box = $('tgp-imc');
    if (h && p) {
      /* Se clasifica el mismo numero que se enseña (redondeado a un decimal):
         sin esto, 24,96 salia «25,0» con la etiqueta «Normal». */
      var imc = Math.round(p / Math.pow(h / 100, 2) * 10) / 10, cat, cls;
      if (imc < 18.5) { cat = 'perfilImcBajo'; cls = 'warn'; } else if (imc < 25) { cat = 'perfilImcNormal'; cls = 'ok'; } else if (imc < 30) { cat = 'perfilImcSobre'; cls = 'warn'; } else { cat = 'perfilImcObes'; cls = 'bad'; }
      var e = n ? anio - n : edad(), adulto = e === null || e >= EDAD_ADULTO;
      $('tgp-imc-val').textContent = fmt(imc, 1);
      $('tgp-imc-cat').textContent = tx(cat); $('tgp-imc-cat').className = 'cat ' + cls; $('tgp-imc-cat').hidden = !adulto;
      $('tgp-imc-joven').hidden = adulto;
      box.hidden = false;
    } else box.hidden = true;
  }
  function guardarDatos(ev) {
    ev.preventDefault();
    var hv = campo('tgp-altura', rAltura(), 'tgp-altura-h'), pv = campo('tgp-peso', rPeso(), 'tgp-peso-h'), n = leerAnio();
    if (hv === undefined) { $('tgp-altura').focus(); return; }
    if (pv === undefined) { $('tgp-peso').focus(); return; }
    if (n === undefined) { ayudas(); $('tgp-nac').focus(); return; }
    if (tocado.altura) st.altura_cm = hv === null ? null : aCm(hv);
    if (tocado.nac) st.nacimiento = n;
    if (tocado.altura || tocado.nac) marcar('perfil');
    /* El peso solo se anota si se ha cambiado: entonces es «el peso de hoy». */
    if (tocado.peso && pv !== null) anotarPeso(hoy(), aKg(pv));
    guardar(); renderDatos(); renderEvo(); estadoNube(); toast(tx('perfilGuardado'));
  }
  function anotarPeso(d, kg) {
    st.medidas = st.medidas.filter(function (m) { return m.d !== d; }); st.medidas.push({ d: d, kg: kg }); marcar('pesos', d, 1);
  }

  /* ── evolucion: peso ── */
  function tendencia(ms) { /* por cada registro, la media de los suyos de los 7 dias que acaban en el */
    return ms.map(function (m) { var v = ms.filter(function (o) { var d = dias(o.d, m.d); return d >= 0 && d <= 6; }); return v.reduce(function (s, o) { return s + o.kg; }, 0) / v.length; });
  }
  function enRango(ms) { var h = hoy(); return ms.filter(function (m) { return dias(m.d, h) <= st.rango; }); }
  function pesoMostrar(kg) { return imperial() ? fmt(kg * KG_LB, 1) + ' lb' : fmt(kg, 1) + ' kg'; }
  function conSigno(kg) { return (kg > 0 ? '+' : (kg < 0 ? '−' : '')) + pesoMostrar(Math.abs(kg)); }
  function renderEvo() {
    $('tgp-evo-peso').hidden = st.tab !== 'peso'; $('tgp-evo-km').hidden = st.tab !== 'km';
    panel.querySelectorAll('#tgp-evo-tabs button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.tab === st.tab); });
    panel.querySelectorAll('#tgp-ranges button').forEach(function (b) { b.classList.toggle('is-on', +b.dataset.r === st.rango); });
    ['tgp-peso-fecha', 'tgp-km-fecha'].forEach(function (id) { $(id).value = hoy(); $(id).max = hoy(); });
    renderPeso(); renderKm();
  }
  function tile(k, v, s, cls) { var e = el('div', 'tgp-tile'); e.appendChild(el('div', 'k', k)); e.appendChild(el('div', 'v' + (cls ? ' ' + cls : ''), v)); if (s) e.appendChild(el('div', 's', s)); return e; }
  function renderPeso() {
    var todas = ordenadas(), tiles = $('tgp-peso-tiles'), chart = $('tgp-peso-chart'), leg = $('tgp-peso-legend'), log = $('tgp-peso-log');
    tiles.textContent = ''; leg.textContent = ''; log.textContent = '';
    chart.querySelectorAll('svg, .tgp-empty').forEach(function (n) { n.remove(); });
    if (!todas.length) { chart.appendChild(el('div', 'tgp-empty', tx('perfilSinDatos'))); return; }
    var ult = todas[todas.length - 1], ini = todas[0], cambio = ult.kg - ini.kg;
    var tr = tendencia(todas), tcambio = tr.length > 1 ? tr[tr.length - 1] - tr[tr.length - 2] : 0;
    tiles.appendChild(tile(tx('perfilActual'), pesoMostrar(ult.kg), fmtFecha(ult.d)));
    tiles.appendChild(tile(tx('perfilDesdeInicio'), conSigno(cambio), fmtFecha(ini.d), cambio > 0 ? 'up' : (cambio < 0 ? 'down' : '')));
    var objetivoTxt = st.objetivo_kg ? pesoMostrar(st.objetivo_kg) : (tcambio > 0.05 ? '↗' : tcambio < -0.05 ? '↘' : '→');
    tiles.appendChild(tile(st.objetivo_kg ? tx('perfilObjetivo') : tx('perfilTendencia'), objetivoTxt, st.objetivo_kg ? conSigno(ult.kg - st.objetivo_kg) : ''));
    var ms = enRango(todas); if (ms.length < 2) ms = todas.slice(-Math.max(2, ms.length));
    dibujarPeso(chart, ms, tendencia(ms));
    [['', 'perfilPeso'], ['trend', 'perfilTendencia']].concat(st.objetivo_kg ? [['goal', 'perfilObjetivo']] : []).forEach(function (l) { var s = el('span'); s.appendChild(el('i', l[0])); s.appendChild(document.createTextNode(tx(l[1]))); leg.appendChild(s); });
    todas.slice().reverse().slice(0, 8).forEach(function (m) {
      var li = el('li'); li.appendChild(el('span', 'd', fmtFecha(m.d, { day: 'numeric', month: 'short', year: '2-digit' }))); li.appendChild(el('span', '', pesoMostrar(m.kg)));
      var x = el('button', 'x', tx('perfilBorrarRegistro')); x.type = 'button'; x.dataset.d = m.d; x.dataset.tipo = 'peso'; li.appendChild(x); log.appendChild(li);
    });
  }
  function dibujarPeso(box, ms, tr) {
    var W = 320, H = 150, L = 36, R = 14, T = 14, B = 24, NS = 'http://www.w3.org/2000/svg';
    var vals = ms.map(function (m) { return m.kg; }).concat(tr); if (st.objetivo_kg) vals.push(st.objetivo_kg);
    var min = Math.floor(Math.min.apply(null, vals) * 2) / 2 - 0.5, max = Math.ceil(Math.max.apply(null, vals) * 2) / 2 + 0.5;
    if (max - min < 2) { max = min + 2; }
    var d0 = ms[0].d, span = Math.max(1, dias(d0, ms[ms.length - 1].d));
    var X = function (d) { return L + (dias(d0, d) / span) * (W - L - R); }, Y = function (v) { return T + (1 - (v - min) / (max - min)) * (H - T - B); };
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', tx('perfilEvolucion'));
    var defs = document.createElementNS(NS, 'defs'); defs.innerHTML = '<linearGradient id="tgp-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4AF37" stop-opacity=".35"/><stop offset="1" stop-color="#D4AF37" stop-opacity="0"/></linearGradient>'; svg.appendChild(defs);
    function nodo(tag, at, cls) { var n = document.createElementNS(NS, tag); Object.keys(at).forEach(function (k) { n.setAttribute(k, at[k]); }); if (cls) n.setAttribute('class', cls); return n; }
    for (var g = 0; g < 4; g++) { var v = min + (max - min) * g / 3, y = Y(v); svg.appendChild(nodo('line', { x1: L, x2: W - R, y1: y, y2: y }, 'grid')); var tl = nodo('text', { x: L - 6, y: y + 3.5, 'text-anchor': 'end' }, 'axis'); tl.textContent = imperial() ? fmt(v * KG_LB, 0) : fmt(v, 1); svg.appendChild(tl); }
    [ms[0], ms[Math.floor((ms.length - 1) / 2)], ms[ms.length - 1]].forEach(function (m, i) { if (i === 1 && ms.length < 3) return; var e = nodo('text', { x: X(m.d), y: H - 7, 'text-anchor': i === 0 ? 'start' : (i === 2 ? 'end' : 'middle') }, 'axis'); e.textContent = fmtFecha(m.d); svg.appendChild(e); });
    var linea = ms.map(function (m, i) { return (i ? 'L' : 'M') + X(m.d).toFixed(1) + ' ' + Y(m.kg).toFixed(1); }).join(' ');
    svg.appendChild(nodo('path', { d: linea + ' L' + X(ms[ms.length - 1].d).toFixed(1) + ' ' + (H - B) + ' L' + X(ms[0].d).toFixed(1) + ' ' + (H - B) + ' Z' }, 'area fade'));
    if (st.objetivo_kg && st.objetivo_kg >= min && st.objetivo_kg <= max) { var gy = Y(st.objetivo_kg); svg.appendChild(nodo('line', { x1: L, x2: W - R, y1: gy, y2: gy }, 'goal')); var gl = nodo('text', { x: W - R, y: gy - 4, 'text-anchor': 'end' }, 'goal-label'); gl.textContent = tx('perfilObjetivo') + ' ' + (imperial() ? fmt(st.objetivo_kg * KG_LB, 0) : fmt(st.objetivo_kg, 1)); svg.appendChild(gl); }
    svg.appendChild(nodo('path', { d: tr.map(function (v, i) { return (i ? 'L' : 'M') + X(ms[i].d).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ') }, 'trend fade'));
    var lp = nodo('path', { d: linea }, 'line' + (reducido ? '' : ' draw')); svg.appendChild(lp);
    ms.forEach(function (m, i) {
      svg.appendChild(nodo('circle', { cx: X(m.d), cy: Y(m.kg), r: i === ms.length - 1 ? 5 : 4 }, 'pt' + (i === ms.length - 1 ? ' last' : '')));
      svg.appendChild(nodo('circle', { cx: X(m.d), cy: Y(m.kg), r: 12, 'data-d': m.d, 'data-kg': m.kg }, 'hit'));
    });
    box.appendChild(svg);
    if (!reducido) { var len = lp.getTotalLength(); lp.style.setProperty('--len', len); }
    var tip = $('tgp-tip');
    function mostrar(ev) { var h = ev.target.closest('.hit'); if (!h) { tip.classList.remove('show'); return; } var r = box.getBoundingClientRect(), hr = h.getBoundingClientRect(); tip.textContent = ''; tip.appendChild(document.createTextNode(fmtFecha(h.dataset.d, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ')); tip.appendChild(el('b', '', pesoMostrar(+h.dataset.kg))); tip.style.left = (hr.left - r.left + hr.width / 2) + 'px'; tip.style.top = (hr.top - r.top) + 'px'; tip.classList.add('show'); }
    svg.addEventListener('pointermove', mostrar); svg.addEventListener('pointerdown', mostrar); svg.addEventListener('pointerleave', function () { tip.classList.remove('show'); });
  }

  /* ── evolucion: kilometros ── */
  function renderKm() {
    var tiles = $('tgp-km-tiles'), chart = $('tgp-km-chart'), log = $('tgp-km-log'); tiles.textContent = ''; chart.textContent = ''; log.textContent = '';
    var h = hoy(), siete = 0, total = 0, hoyKm = 0, porDia = {};
    st.km.forEach(function (k) { total += k.km; var d = dias(k.d, h); if (d >= 0 && d <= 6) { siete += k.km; porDia[k.d] = (porDia[k.d] || 0) + k.km; } if (k.d === h) hoyKm += k.km; });
    /* Los 7 dias que acaban hoy, que son las barras que se ven (no la semana del calendario). */
    tiles.appendChild(tile(tx('perfilUltimos7'), fmt(siete, 1) + ' km'));
    tiles.appendChild(tile(tx('perfilHoy'), fmt(hoyKm, 1) + ' km'));
    tiles.appendChild(tile(tx('perfilTotalCaminado'), fmt(total, 1) + ' km'));
    if (!st.km.length) { chart.appendChild(el('div', 'tgp-empty', tx('perfilSinDatos'))); return; }
    var NS = 'http://www.w3.org/2000/svg', W = 320, H = 140, T = 18, B = 22, L = 10, R = 10;
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', tx('perfilKm'));
    var diasArr = []; for (var i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); diasArr.push(ymd(d)); }
    var maxKm = Math.max(1, Math.max.apply(null, diasArr.map(function (d) { return porDia[d] || 0; })));
    var bw = (W - L - R) / 7, ancho = bw * 0.56;
    diasArr.forEach(function (d, i) {
      var v = porDia[d] || 0, x = L + i * bw + (bw - ancho) / 2, hh = v ? Math.max(4, (v / maxKm) * (H - T - B)) : 0, y = H - B - hh;
      var r = document.createElementNS(NS, 'rect'); r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', ancho); r.setAttribute('height', hh); r.setAttribute('rx', 4); r.setAttribute('class', 'bar' + (d === h ? ' today' : '')); svg.appendChild(r);
      if (hh > 8) { var base = document.createElementNS(NS, 'rect'); base.setAttribute('x', x); base.setAttribute('y', H - B - 4); base.setAttribute('width', ancho); base.setAttribute('height', 4); base.setAttribute('class', 'bar' + (d === h ? ' today' : '')); svg.appendChild(base); }
      if (v) { var vl = document.createElementNS(NS, 'text'); vl.setAttribute('x', x + ancho / 2); vl.setAttribute('y', y - 5); vl.setAttribute('class', 'bar-label'); vl.textContent = fmt(v, 1); svg.appendChild(vl); }
      var dl = document.createElementNS(NS, 'text'); dl.setAttribute('x', x + ancho / 2); dl.setAttribute('y', H - 6); dl.setAttribute('class', 'axis'); dl.setAttribute('text-anchor', 'middle'); dl.textContent = fecha(d).toLocaleDateString(locale(), { weekday: 'short' }); svg.appendChild(dl);
    });
    var ejeX = document.createElementNS(NS, 'line'); ejeX.setAttribute('x1', L); ejeX.setAttribute('x2', W - R); ejeX.setAttribute('y1', H - B); ejeX.setAttribute('y2', H - B); ejeX.setAttribute('class', 'grid'); svg.appendChild(ejeX);
    chart.appendChild(svg);
    st.km.slice().sort(function (a, b) { return a.d < b.d ? 1 : -1; }).slice(0, 8).forEach(function (k) {
      var li = el('li'); li.appendChild(el('span', 'd', fmtFecha(k.d, { day: 'numeric', month: 'short', year: '2-digit' }))); li.appendChild(el('span', '', fmt(k.km, 1) + ' km'));
      var x = el('button', 'x', tx('perfilBorrarRegistro')); x.type = 'button'; x.dataset.id = k.id; x.dataset.tipo = 'km'; li.appendChild(x); log.appendChild(li);
    });
  }

  /* ── su isla ── */
  function cuentaAnimada(nodo, hasta) {
    if (reducido || hasta < 2) { nodo.textContent = hasta; return; }
    var t0 = performance.now(); (function paso(ahora) { var p = Math.min(1, (ahora - t0) / 900); nodo.textContent = Math.round(hasta * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(paso); })(t0);
  }
  function renderIsla() {
    var box = $('tgp-isla-tiles'); box.textContent = '';
    var v = visitados(), lista = listaLogros(), logros = logrosConseguidos();
    [['⭐', favoritos(), 'perfilFavoritos'], ['✓', v, 'perfilVisitados'], ['🏆', logros.length, 'perfilLogros']].forEach(function (d) {
      var e = el('div', 'tgp-tile'); e.appendChild(el('div', 'ico', d[0])); var n = el('div', 'v'); e.appendChild(n); e.appendChild(el('div', 'k', tx(d[2]))); box.appendChild(e); cuentaAnimada(n, d[1]);
    });
    var conMin = lista.filter(function (b) { return b.min; }), sig = null;
    for (var i = 0; i < conMin.length; i++) if (v < conMin[i].min) { sig = conMin[i]; break; }
    var fill = $('tgp-progress-fill'), txt = $('tgp-progress-txt');
    if (sig) { txt.textContent = tx('perfilSiguienteLogro', { n: sig.min - v, logro: nombreLogro(sig) }); requestAnimationFrame(function () { fill.style.width = Math.round(100 * v / sig.min) + '%'; }); }
    else if (conMin.length) { var ult = conMin[conMin.length - 1]; txt.textContent = ult.icon + ' ' + nombreLogro(ult); fill.style.width = '100%'; }
    var caja = $('tgp-stamps'); caja.textContent = '';
    lista.forEach(function (b, i) {
      var s = el('div', 'tgp-stamp'); s.style.setProperty('--rot', ((i % 3) - 1) * 5 + 'deg');
      var tiene = logros.indexOf(b.key) >= 0; if (!tiene) s.classList.add('is-locked');
      s.appendChild(el('div', 'ico', tiene ? b.icon : '🔒')); s.appendChild(el('div', 'nm', nombreLogro(b)));
      /* El de la cumbre no va por numero: se gana en el Teide (con su nombre en cada idioma). */
      s.appendChild(el('div', 'th', b.min ? tx('perfilLugares', { n: b.min }) : nombreAvatar('tf-teide')));
      caja.appendChild(s);
    });
  }

  /* ── cuenta ── */
  /* «Activar notificaciones»: el mismo boton que el de la ficha de la cuenta.
     El codigo de las notificaciones (index.html) lo engancha como un par mas
     de los suyos (TG_PUSH.anadirBoton): oculto en la app de la tienda
     (TGO_NATIVO), apagado y con el motivo debajo si el navegador no puede, y
     lo que pase al pulsarlo, escrito en su linea. El boton y su linea se
     crean una vez y se vuelven a poner, para no perder lo que dice la linea. */
  var pushBtn = null, pushMsg = null;
  function botonPush(caja) {
    var P = window.TG_PUSH;
    if (!P || typeof P.anadirBoton !== 'function') return;
    if (!pushBtn) {
      pushBtn = el('button', 'tgp-btn wide gold', tx('pushBtnActivar')); pushBtn.type = 'button'; pushBtn.id = 'tgp-push';
      pushBtn.setAttribute('data-tx', 'pushBtnActivar');
      pushMsg = el('div', 'tgp-help tgp-push-msg'); pushMsg.id = 'tgp-push-msg'; pushMsg.setAttribute('aria-live', 'polite');
    }
    caja.appendChild(pushBtn); caja.appendChild(pushMsg);
    try { P.anadirBoton('tgp-push', 'tgp-push-msg'); } catch (e) {}
  }
  function renderCuenta() {
    if (!montado()) return;
    var who = $('tgp-cuenta-who'), btns = $('tgp-cuenta-btns'); who.textContent = ''; btns.textContent = '';
    var u = sesion();
    if (u) { who.appendChild(el('div', 'tgp-eyebrow', txCuenta('authLoggedAs'))); who.appendChild(el('div', 'email', u.email || '')); }
    else { who.appendChild(el('div', 'tgp-eyebrow', tx('perfilCuenta'))); who.appendChild(el('div', 'email', tx('perfilInvitado'))); }
    /* El interruptor de la nube: solo con sesion, apagado de entrada. */
    var caja = $('tgp-nube-box'); caja.textContent = ''; caja.hidden = !u;
    if (u) {
      var txt = el('div', 'txt'); txt.appendChild(el('div', 'lbl', tx('perfilNubeInterruptor'))); txt.appendChild(el('div', 'sub'));
      var sw = el('button', 'tgp-switch'); sw.type = 'button'; sw.id = 'tgp-nube';
      sw.setAttribute('role', 'switch'); sw.setAttribute('aria-label', tx('perfilNubeInterruptor'));
      sw.appendChild(el('span', 'knob'));
      sw.addEventListener('click', function () {
        var on = nubeEncendida();
        if (!on && menorParaNube()) return;
        $(on ? 'tgp-nube-quitar' : 'tgp-nube-confirm').hidden = false; $(on ? 'tgp-nube-confirm' : 'tgp-nube-quitar').hidden = true;
      });
      caja.appendChild(txt); caja.appendChild(sw);
    }
    $('tgp-nube-confirm').hidden = true; $('tgp-nube-quitar').hidden = true;
    function btn(cls, texto, fn, id) { var b = el('button', 'tgp-btn wide ' + cls, texto); b.type = 'button'; b.addEventListener('click', fn); if (id) b.id = id; btns.appendChild(b); return b; }
    if (!u) btn('gold', tx('perfilCrearCuenta'), abrirLogin, 'tgp-entrar');
    botonPush(btns);
    btn('ghost', tx('perfilExportar'), exportar, 'tgp-export');
    btn('ghost', tx('perfilBorrarLocal'), function () { $('tgp-borrar-confirm').hidden = false; this.hidden = true; }, 'tgp-borrar-local');
    if (u) {
      btn('danger', txCuenta('authLogoutBtn'), cerrarSesion, 'tgp-logout');
      /* «Eliminar cuenta», justo debajo (como lo describe borrar-cuenta.html): el
         flujo de la ficha de la cuenta, con su confirmacion y el rpc borrar_mi_cuenta */
      var d = el('button', 'tgp-link', tx('cuentaBorrarBtn')); d.type = 'button'; d.id = 'tgp-eliminar-cuenta';
      d.addEventListener('click', function () {
        if (typeof window.openAuthModal !== 'function') return;
        window.openAuthModal(); var b = document.getElementById('auth-borrar-btn'); if (b) b.click();
      });
      btns.appendChild(d);
      conAdmin(function () { if (!$('tgp-admin')) btn('ghost', tx('admBtnAdmin'), function () { if (typeof window.openAdminOverlay === 'function') window.openAdminOverlay(); }, 'tgp-admin'); });
    }
    $('tgp-borrar-confirm').hidden = true;
    estadoNube();
  }
  /* Lo que cambia con la nube, sin rehacer la tarjeta: una sincronizacion de fondo no
     cierra la confirmacion que alguien esta leyendo. */
  function estadoNube() {
    if (!montado()) return;
    var u = sesion(), on = nubeEncendida(), menor = !on && menorParaNube();
    var status = $('tgp-cuenta-status');
    status.className = 'tgp-status ' + (u ? 'cloud' : 'local');
    status.textContent = (u ? '☁️ ' : '📱 ') + tx(u ? (on ? 'perfilNubeSi' : 'perfilNube') : 'perfilSoloDispositivo');
    var sw = $('tgp-nube');
    if (sw) {
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      sw.disabled = menor;
      var sub = sw.parentNode.querySelector('.sub');
      if (sub) sub.textContent = menor ? tx('perfilNubeEdad', { n: EDAD_NUBE }) : tx('perfilNubeExplica');
    }
    if (menor || !u) $('tgp-nube-confirm').hidden = true;
    if (!u) $('tgp-nube-quitar').hidden = true;
    /* Con la nube encendida, borrar el perfil lo borra tambien de la cuenta (si no, volveria al sincronizar). */
    $('tgp-borrar-texto').textContent = tx(on ? 'perfilBorrarLocalAvisoNube' : 'perfilBorrarLocalAviso');
  }
  /* Tras una vuelta que trajo algo de la nube: se repinta lo que enseña esos datos,
     sin pisar un formulario que se esta escribiendo y sin mover la pagina. */
  function repintarTrasNube() {
    if (!montado()) return;
    renderHero(false); renderStrip(false); renderPeso(); renderKm();
    var f = $('tgp-form');
    if (!(tocado.altura || tocado.peso || tocado.nac) && !(f && f.contains(document.activeElement))) renderDatos();
  }
  /* «Cerrar sesion»: si queda algo de esta cuenta en la cola y hay red, antes se envia
     (sobre todo un permiso retirado). Lo del dispositivo se queda, como los favoritos. */
  function cerrarSesion() {
    var u = sesion(), A = window.AppAuth;
    var antes = (u && st.colas[u.id] && navigator.onLine !== false) ? sincronizar() : Promise.resolve();
    /* como mucho 3 s: si la red va mal, se cierra igual y lo pendiente espera a que vuelva a entrar esa cuenta */
    var tope = new Promise(function (res) { setTimeout(res, 3000); });
    Promise.race([antes, tope]).then(function () { try { if (A && A.logout) A.logout(); } catch (e) {} });
  }
  /* Borra del dispositivo lo del perfil y nada mas: favoritos, visitados, logros y
     visitas comprobadas son de otras partes de la app y no se tocan. Con la nube
     encendida, tambien la copia de la cuenta (la fila de perfiles; lo demas cae
     detras), y la nube queda apagada. */
  function borrarLocal() {
    var u = sesion(), conNube = nubeEncendida();
    var d = porDefecto(); d.colas = st.colas;
    st = d;
    if (conNube) { var c = colaDe(u.id); c.alta = false; c.baja = true; c.perfil = 0; c.pesos = {}; c.km = {}; }
    guardar(); setAbierto = null; renderTodo();
    if (!conNube) { toast(tx('perfilBorrado')); return; }
    /* sin red, lo de aqui ya esta borrado y lo de la cuenta espera: las dos frases */
    sincronizar().then(function (r) { toast(r === 'baja' ? tx('perfilBorradoNube') : dosFrases(tx('perfilBorrado'), tx('perfilNubeQuitarPendiente'))); });
  }
  function dosFrases(a, b) {
    var zh = lengua() === 'zh' || lengua() === 'zht';
    if (!/[.!?。！？✓]$/.test(a)) a += zh ? '。' : '.';
    return a + (zh ? '' : ' ') + b;
  }
  /* «Acepto»: el permiso queda dado en este movil aunque no haya red; la fila de
     perfiles (el consentimiento, con su fecha) se crea en cuanto se pueda. */
  function nubeEncender() {
    var u = sesion(); $('tgp-nube-confirm').hidden = true;
    if (!u || menorParaNube()) return;
    st.nube = { uid: u.id, desde: new Date().toISOString(), ok: false };
    var c = colaDe(u.id); c.baja = false; c.alta = true;
    guardar(); estadoNube();
    sincronizar().then(function (r) { toast(tx(r === 'ok' ? 'perfilNubeGuardado' : 'perfilNubeError')); });
  }
  /* Retirar el permiso: deja de subirse nada desde ya, y la copia de la cuenta se borra
     (sin red, en cuanto vuelva). En el dispositivo se queda todo. */
  function nubeApagar() {
    var u = sesion(); $('tgp-nube-quitar').hidden = true;
    if (!u) return;
    if (st.nube && st.nube.uid === u.id) st.nube = null;
    var c = colaDe(u.id); c.alta = false; c.baja = true; c.perfil = 0; c.pesos = {}; c.km = {};
    guardar(); estadoNube();
    sincronizar().then(function (r) { toast(tx(r === 'baja' ? 'perfilNubeQuitado' : 'perfilNubeQuitarPendiente')); });
  }
  /* «Descargar datos del perfil»: un fichero de verdad, tenerife-go-perfil.json.
     v: la version del formato, la misma que lleva tenerife.perfil; con el id de
     cada caminata, que es su clave en la nube. */
  function exportar() {
    var datos = { v: 1, perfil: { nombre: st.nombre, avatar: avatarActual().id, altura_cm: st.altura_cm, nacimiento: st.nacimiento, objetivo_kg: st.objetivo_kg, unidades: st.unidades, creado: st.creado }, pesos: ordenadas(), caminatas: st.km.map(function (k) { return { id: k.id, d: k.d, km: k.km }; }) };
    var blob = new Blob([JSON.stringify(datos, null, 2) + '\n'], { type: 'application/json' });
    return compartirFichero(blob, 'tenerife-go-perfil.json', tx('perfilExportar'));
  }
  /* El mismo camino que modulos/cielo.js para sus capturas (alli es privado,
     asi que se copia): la hoja de compartir del sistema si acepta ficheros
     (Android, iOS); si no, se descarga. Nada pasa por ningun servidor.
     Devuelve que paso. */
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

  function renderTodo() { aplicarTextos(); renderHero(false); renderSets(); renderDatos(); renderEvo(); renderIsla(); renderCuenta(); }

  /* ── eventos del cuerpo (una vez, al montarlo) ── */
  function enganchar() {
    $('tgp-back').addEventListener('click', function () { cerrar(); });
    $('tgp-sets').addEventListener('click', function (e) { var b = e.target.closest('.tgp-set'); if (!b) return; setAbierto = b.dataset.set; renderSets(); renderStrip(true); });
    $('tgp-strip').addEventListener('click', function (e) { var b = e.target.closest('.tgp-av'); if (b && !b.disabled) elegirAvatar(b.dataset.id); });
    $('tgp-random').addEventListener('click', function () {
      var pool = []; AV.sets.forEach(function (s) { if (setDesbloqueado(s)) pool = pool.concat(s.avatares); });
      var a = pool[Math.floor(Math.random() * pool.length)]; setAbierto = a.set; elegirAvatar(a.id); renderStrip(true);
    });
    $('tgp-name-edit').addEventListener('click', function () {
      var row = $('tgp-name-row'); if (row.querySelector('input')) return;
      var inp = el('input', 'tgp-name-input'); inp.type = 'text'; inp.maxLength = 24; inp.value = st.nombre; inp.placeholder = tx('perfilNombrePlaceholder'); inp.autocomplete = 'nickname';
      inp.setAttribute('aria-label', tx('perfilEditarNombre'));
      var h = $('tgp-name'); h.hidden = true; row.insertBefore(inp, h); inp.focus(); inp.select();
      function fin() { var antes = st.nombre; st.nombre = inp.value.trim().slice(0, 24); if (st.nombre !== antes) marcar('perfil'); guardar(); inp.remove(); h.hidden = false; renderHero(false); if (st.nombre) toast(tx('perfilBienvenida', { nombre: st.nombre })); }
      inp.addEventListener('blur', fin); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } if (e.key === 'Escape') { inp.value = st.nombre; inp.blur(); } });
    });
    $('tgp-form').addEventListener('submit', guardarDatos);
    [['tgp-altura', 'altura'], ['tgp-peso', 'peso'], ['tgp-nac', 'nac']].forEach(function (c) { $(c[0]).addEventListener('input', function () { tocado[c[1]] = true; ayudas(); }); });
    $('tgp-unidades').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.u === st.unidades) return;
      /* Solo si la persona ha escrito una altura nueva se convierte; si no, la guardada no se toca. */
      if (tocado.altura) { var hv = campo('tgp-altura', rAltura(), 'tgp-altura-h'); if (hv) st.altura_cm = aCm(hv); }
      st.unidades = b.dataset.u; marcar('perfil'); guardar(); renderDatos(); renderEvo();
    });
    $('tgp-evo-tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.tab = b.dataset.tab; guardar(); renderEvo(); });
    $('tgp-ranges').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.rango = +b.dataset.r; guardar(); renderEvo(); });
    function fechaValida(id, ayudaId) {
      var d = $(id).value || hoy(), mal = !esFecha(d) || d > hoy();
      if (mal) { $(ayudaId).classList.add('error'); $(ayudaId).textContent = tx('perfilFechaFutura'); }
      return mal ? null : d;
    }
    $('tgp-add-peso').addEventListener('submit', function (e) {
      e.preventDefault(); var a = $('tgp-peso-nuevo-h'); a.textContent = ''; a.classList.remove('error');
      var v = campo('tgp-peso-nuevo', rPeso(), 'tgp-peso-nuevo-h'); if (v === undefined || v === null) return;
      var d = fechaValida('tgp-peso-fecha', 'tgp-peso-nuevo-h'); if (!d) return;
      anotarPeso(d, aKg(v)); guardar(); $('tgp-peso-nuevo').value = ''; renderDatos(); renderEvo(); toast(tx('perfilGuardado'));
    });
    $('tgp-add-km').addEventListener('submit', function (e) {
      e.preventDefault(); var a = $('tgp-km-nuevo-h'); a.textContent = ''; a.classList.remove('error');
      var v = campo('tgp-km-nuevo', RANGO.km, 'tgp-km-nuevo-h'); if (v === undefined || v === null) return;
      var d = fechaValida('tgp-km-fecha', 'tgp-km-nuevo-h'); if (!d) return;
      var id = nuevoId(); st.km.push({ id: id, d: d, km: Math.round(v * 10) / 10 }); marcar('km', id, 1);
      guardar(); $('tgp-km-nuevo').value = ''; renderEvo(); toast(tx('perfilGuardado'));
    });
    /* Se borra el registro pulsado: los de peso por su fecha (uno por dia), los de km por su id (puede haber varios el mismo dia). */
    $('tgp-evo').addEventListener('click', function (e) {
      var x = e.target.closest('.x'); if (!x) return;
      if (x.dataset.tipo === 'peso') { st.medidas = st.medidas.filter(function (m) { return m.d !== x.dataset.d; }); marcar('pesos', x.dataset.d, 0); }
      else { st.km = st.km.filter(function (k) { return k.id !== x.dataset.id; }); marcar('km', x.dataset.id, 0); }
      guardar(); renderDatos(); renderEvo();
    });
    $('tgp-objetivo').addEventListener('change', function () {
      var v = campo('tgp-objetivo', rPeso(), 'tgp-objetivo-h'); if (v === undefined) return;
      $('tgp-objetivo-h').textContent = ''; st.objetivo_kg = v === null ? null : aKg(v); marcar('perfil'); guardar(); renderEvo();
    });
    $('tgp-borrar-si').addEventListener('click', borrarLocal);
    $('tgp-nube-si').addEventListener('click', nubeEncender);
    $('tgp-nube-no').addEventListener('click', function () { $('tgp-nube-confirm').hidden = true; });
    $('tgp-nube-quitar-si').addEventListener('click', nubeApagar);
    $('tgp-nube-quitar-no').addEventListener('click', function () { $('tgp-nube-quitar').hidden = true; });
    $('tgp-borrar-no').addEventListener('click', function () { $('tgp-borrar-confirm').hidden = true; var b = $('tgp-borrar-local'); if (b) b.hidden = false; });
  }

  /* ── abrir y cerrar ── */
  var panel = null, abierto = false, historia = false, atrasPendiente = false, antesDeAbrir = null;
  /* La primera vez: sus estilos (la CSP de index.html deja 'unsafe-inline' en
     style-src) y el cuerpo, dentro de #perfil-panel. */
  function montar() {
    if (panel) return;
    var estilo = document.createElement('style');
    estilo.id = 'perfil-estilos';
    estilo.textContent = ESTILOS;
    document.head.appendChild(estilo);
    panel = document.createElement('div');
    panel.id = 'perfil-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'tgp-titulo');
    panel.innerHTML = CUERPO;
    TEXTOS.forEach(function (t) {
      var n = panel.querySelector(t[0]);
      if (n) n.setAttribute(t[1] === 'tx' ? 'data-tx' : 'data-tx-' + t[1], t[2]);
    });
    document.body.appendChild(panel);
    enganchar();
  }
  function abrir() {
    montar();
    if (!abierto) {
      antesDeAbrir = document.activeElement;
      abierto = true;
      panel.hidden = false;
      panel.scrollTop = 0;
      /* el boton «atras» del movil cierra el perfil, no la app (como la vista del cielo) */
      if (!historia) { try { history.pushState({ tgPerfil: 1 }, ''); historia = true; } catch (e) {} }
    }
    renderTodo();
    try { $('tgp-back').focus({ preventScroll: true }); } catch (e) {}
    if (sesion()) sincronizar();
  }
  function cerrar(sinHistoria) {
    if (!abierto) return;
    abierto = false;
    panel.hidden = true;
    var e = $('tgp-toast'); if (e) e.classList.remove('show');
    if (historia && !sinHistoria) { try { atrasPendiente = true; history.back(); } catch (x) { atrasPendiente = false; } }
    historia = false;
    if (antesDeAbrir && typeof antesDeAbrir.focus === 'function' && document.contains(antesDeAbrir)) { try { antesDeAbrir.focus({ preventScroll: true }); } catch (x) {} }
    antesDeAbrir = null;
  }
  /* La ficha de la cuenta y el panel de administrador se abren desde aqui y van
     encima: «atras» y Escape los dejan a ellos, y el perfil se queda debajo. */
  function fichaEncima() {
    var m = document.getElementById('auth-modal-backdrop'), a = document.getElementById('admin-overlay');
    return !!((m && m.classList.contains('show')) || (a && a.classList.contains('open')));
  }
  /* el «atras» del movil: el back() que hace cerrar() llega aqui tambien, y se distingue del dedo */
  window.addEventListener('popstate', function () {
    if (atrasPendiente) { atrasPendiente = false; return; }
    if (!abierto) return;
    historia = false;
    var m = document.getElementById('auth-modal-backdrop');
    if (m && m.classList.contains('show') && typeof window.closeAuthModal === 'function') {
      window.closeAuthModal();
      try { history.pushState({ tgPerfil: 1 }, ''); historia = true; } catch (e) {}
      return;
    }
    cerrar(true);
  });
  /* Escape cierra el perfil si es lo de arriba. Va en la fase de captura para
     mirar antes que la ficha de la cuenta, que se cierra con su propio Escape;
     y no sale de un campo que se esta escribiendo. */
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !abierto || fichaEncima()) return;
    var c = e.target;
    if (c && c.closest && c.closest('input, textarea, select') && panel.contains(c)) return;
    e.stopPropagation();
    cerrar();
  }, true);

  /* La sesion cambia (entrar, salir, otra cuenta): index.html lanza «tg-sesion»
     al final de handleSignedIn y de handleSignedOut. */
  window.addEventListener('tg-sesion', function () { renderCuenta(); if (sesion()) sincronizar(); });
  window.addEventListener('online', function () { var u = sesion(); if (u && (st.colas[u.id] || nubeEncendida())) sincronizar(); });
  /* Al cambiar de idioma se rehace lo que esta abierto. Sin avatar elegido, el
     que se enseña es el primero del set del idioma: el set abierto vuelve a ese. */
  try {
    TG_IDIOMA.registrar('perfil', function () { if (!st.avatar) setAbierto = null; if (abierto) renderTodo(); });
  } catch (e) {}

  /* ── la pantalla: sus estilos y su cuerpo ──
     ESTILOS es perfil.css del encargo sin lo del prototipo (el selector de
     idioma, la etiqueta «Ejemplo», la ventana de descarga y el pie «Demo»),
     y detras, lo que solo pide la app (al final, «solo en la app»). Solo
     reglas de la pantalla: los tokens de la paleta son los del :root de
     index.html. */
  var ESTILOS = `
/* perfil.css — la pantalla «Su perfil» de Tenerife Go. Va dentro de modulos/perfil.js
   (como cadena: app_preparar.js solo copia modulos/*.js a la app de la tienda).
   Solo reglas de la pantalla, ninguna de página: los tokens de la paleta v18 (--gold,
   --gold-light, --dark, --panel, --panel2, --border, --text, --muted, --t-*, --ease-*,
   --shadow-*) son los del :root de index.html, y el reinicio global (L1441) también. Aquí,
   solo lo que la app no tiene.
   Tema único oscuro: es la identidad de la marca (luna, Teide, mar nocturno). */
.tgp, .tgp-toast {
  --ok: #6FCF97; --warn: #F2C94C; --bad: #F28C8C;
  --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-body: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --set: #F4A300; /* el acento del set de avatares elegido: lo pone el JS en .tgp */
  --r: 18px;
  color-scheme: dark;
}
/* El panel en la app (lo crea el cargador al abrir el perfil, con el cuerpo dentro): por
   encima del cielo (#cielo-vista, 8798) y por debajo de la bienvenida (9000), la
   privacidad (9999) y la ficha de la cuenta (10000), que se abre desde aquí. */
#perfil-panel {
  position: fixed; inset: 0; z-index: 8900; overflow: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
  padding: env(safe-area-inset-top, 0px) max(16px, env(safe-area-inset-right, 0px)) 24px max(16px, env(safe-area-inset-left, 0px));
  background:
    radial-gradient(60% 40% at 50% 0%, rgba(212,175,55,0.10), transparent 70%),
    radial-gradient(40% 30% at 100% 80%, rgba(63,111,181,0.14), transparent 70%),
    var(--dark);
}
/* con :where(), especificidad cero: lo que dice cada componente (.tgp-av { font-size }…) sigue mandando */
:where(.tgp) *, :where(.tgp) *::before, :where(.tgp) *::after { box-sizing: border-box; }
/* La app no tiene una regla global para [hidden] (cada panel pone la suya, como #cielo-vista [hidden] en index.html):
   sin esta, .tgp-imc (flex), .tgp-confirm (grid) y los .tgp-btn (inline-flex) se verían aunque lleven hidden. */
.tgp [hidden] { display: none !important; }
.tgp, .tgp-toast { font: 400 15px/1.45 var(--font-body); color: var(--text); -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
:where(.tgp) :where(button, input, select) { font-family: inherit; font-size: inherit; color: inherit; }
:where(.tgp) :where(button) { cursor: pointer; }
:where(.tgp) :focus-visible { outline: 2px solid var(--gold-light); outline-offset: 2px; }
svg.tg-avatar { display: block; width: 100%; height: auto; }

.tgp { max-width: 520px; margin: 0 auto; display: grid; gap: 14px; }

/* ── cabecera fija (la misma barra que la app, en pequeño) ── */
.tgp-top {
  position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5;
  display: flex; align-items: center; gap: 10px; padding-block: 10px 8px;
  background: linear-gradient(var(--dark) 70%, transparent);
}
.tgp-top h1 { margin: 0; font: 600 1.6rem/1.1 var(--font-display); color: var(--gold-light); letter-spacing: .01em; flex: 1; text-wrap: balance; }
.tgp-icon-btn {
  width: 38px; height: 38px; border-radius: 12px; border: 1px solid var(--border);
  background: var(--panel); color: var(--text); display: grid; place-items: center;
  transition: border-color var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out);
}
.tgp-icon-btn:hover { border-color: var(--gold); background: rgba(212,175,55,0.1); }

/* ── héroe ── */
.tgp-hero { position: relative; overflow: hidden; border-radius: 24px; border: 1px solid var(--border); background: var(--panel); padding: 22px 16px 20px; text-align: center; isolation: isolate; }
.tgp-blob { position: absolute; width: 240px; height: 240px; border-radius: 50%; filter: blur(46px); opacity: .55; pointer-events: none; z-index: -1; background: var(--set); transition: background var(--t-slower) var(--ease-out); }
.tgp-blob.b1 { left: -70px; top: -60px; animation: tgp-drift 16s ease-in-out infinite alternate; }
.tgp-blob.b2 { right: -90px; top: 20px; background: var(--gold); opacity: .28; animation: tgp-drift 19s ease-in-out infinite alternate-reverse; }
.tgp-blob.b3 { left: 30%; bottom: -150px; opacity: .35; animation: tgp-drift 22s ease-in-out infinite alternate; }
@keyframes tgp-drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(40px, 26px) scale(1.15); } }
.tgp-stars { position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .6;
  background-image: radial-gradient(1.2px 1.2px at 12% 18%, #fff 50%, transparent 55%), radial-gradient(1px 1px at 84% 26%, #fff 50%, transparent 55%), radial-gradient(1.4px 1.4px at 70% 12%, #fff 50%, transparent 55%), radial-gradient(1px 1px at 24% 68%, #fff 50%, transparent 55%), radial-gradient(1.2px 1.2px at 90% 72%, #fff 50%, transparent 55%), radial-gradient(1px 1px at 48% 8%, #fff 50%, transparent 55%); }
.tgp-confeti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; }

.tgp-ring-wrap { display: inline-block; animation: tgp-float 4.8s ease-in-out infinite; }
.tgp-ring { position: relative; width: 162px; height: 162px; border-radius: 50%; padding: 5px; margin: 0 auto;
  background: conic-gradient(from 0deg, var(--gold), transparent 28%, var(--set) 50%, transparent 72%, var(--gold));
  animation: tgp-spin 9s linear infinite; }
.tgp-ring::after { content: ""; position: absolute; inset: -14px; border-radius: 50%; background: radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%); background: radial-gradient(circle, color-mix(in srgb, var(--set) 45%, transparent), transparent 70%); z-index: -1; filter: blur(8px); }
.tgp-ava-big { width: 100%; height: 100%; border-radius: 50%; background: var(--dark); padding: 4px; animation: tgp-counter-spin 9s linear infinite; }
.tgp-ava-big.pop { animation: tgp-counter-spin 9s linear infinite, tgp-pop var(--t-slower) var(--ease-bounce); }
@keyframes tgp-spin { to { transform: rotate(360deg); } }
@keyframes tgp-counter-spin { to { transform: rotate(-360deg); } }
@keyframes tgp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes tgp-pop { 0% { scale: .55; } 100% { scale: 1; } }

.tgp-name-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; min-height: 44px; }
.tgp-name { margin: 0; font: 600 2rem/1.1 var(--font-display); color: var(--text); text-wrap: balance; max-width: 100%; overflow-wrap: anywhere; }
.tgp-name.is-empty { color: var(--muted); font-weight: 500; font-style: italic; }
.tgp-name-input { width: min(100%, 260px); text-align: center; font: 600 1.6rem/1.2 var(--font-display); background: rgba(255,255,255,0.05); border: 1px solid var(--gold); border-radius: 12px; padding: 6px 10px; color: var(--text); }
.tgp-pencil { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); background: transparent; color: var(--gold-light); display: grid; place-items: center; flex: 0 0 auto; }
.tgp-pencil:hover { background: rgba(212,175,55,0.12); }
.tgp-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 8px; margin-top: 10px; }
.tgp-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; border: 1px solid var(--border); background: rgba(15,17,23,0.55); font-size: .82rem; color: var(--text); white-space: nowrap; }
.tgp-chip .muted { color: var(--muted); }
.tgp-chip.set { border-color: var(--border); border-color: color-mix(in srgb, var(--set) 55%, transparent); }
.tgp-lema { margin: 10px 0 0; color: var(--muted); font-size: .85rem; letter-spacing: .06em; text-transform: uppercase; }

/* ── tarjetas ── */
.tgp-card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; min-width: 0; }
.tgp-card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.tgp-card h2 { margin: 0; font: 600 1.45rem/1.15 var(--font-display); color: var(--gold-light); text-wrap: balance; }
.tgp-eyebrow { font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.tgp-note { margin: 0 0 12px; color: var(--muted); font-size: .85rem; }

/* sets y carrusel */
.tgp-sets { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 8px; scrollbar-width: none; -webkit-overflow-scrolling: touch; scroll-snap-type: x proximity; }
.tgp-sets::-webkit-scrollbar { display: none; }
.tgp-set { flex: 0 0 auto; scroll-snap-align: start; display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--panel2); color: var(--text); font-size: .86rem; white-space: nowrap; transition: border-color var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out), transform var(--t-normal) var(--ease-bounce); }
.tgp-set .flag { font-size: 1.05rem; line-height: 1; }
.tgp-set.is-on { border-color: var(--set-color, var(--gold)); background: rgba(212,175,55,0.16); background: color-mix(in srgb, var(--set-color, var(--gold)) 22%, var(--panel2)); transform: scale(1.04); }
.tgp-set.is-locked { opacity: .6; }
.tgp-strip { display: flex; gap: 8px; overflow-x: auto; padding: 12px 2px 6px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.tgp-strip::-webkit-scrollbar { display: none; }
.tgp-av { flex: 0 0 auto; width: 88px; scroll-snap-align: center; display: grid; justify-items: center; gap: 6px; padding: 6px 2px; border: 0; background: none; color: var(--muted); font-size: .72rem; line-height: 1.15; text-align: center;
  animation: tgp-in var(--t-slower) var(--ease-out) both; animation-delay: calc(var(--i, 0) * 45ms); }
.tgp-av .tg-avatar { width: 72px; height: 72px; border-radius: 50%; transition: transform var(--t-normal) var(--ease-bounce), box-shadow var(--t-normal) var(--ease-out); }
.tgp-av:hover .tg-avatar { transform: translateY(-3px) scale(1.04); }
.tgp-av.is-on { color: var(--gold-light); }
.tgp-av.is-on .tg-avatar { transform: scale(1.1); box-shadow: 0 0 0 3px var(--panel), 0 0 0 6px var(--gold), 0 10px 24px rgba(0,0,0,.45); }
.tgp-av.is-locked .tg-avatar { filter: grayscale(.9) brightness(.6); }
/* Partir por sílabas (con el lang de #tgp), nunca a mitad de letra: con «anywhere» salía «Kanareneidech/se». */
.tgp-av .name { max-width: 84px; overflow-wrap: break-word; -webkit-hyphens: auto; hyphens: auto; margin-top: 6px; }
.tgp-av .lock { position: absolute; }
@keyframes tgp-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
.tgp-strip-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 6px; min-height: 36px; }
.tgp-strip-foot .pick { font: 600 1.2rem/1.2 var(--font-display); color: var(--text); }
.tgp-lock-note { color: var(--muted); font-size: .82rem; }

/* botones */
.tgp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel2); color: var(--text); font-weight: 500; min-height: 42px; transition: transform var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out), border-color var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out); white-space: nowrap; }
.tgp-btn:hover { border-color: var(--gold); box-shadow: var(--shadow-glow); }
.tgp-btn:active { transform: scale(.97); }
.tgp-btn.gold { background: var(--gold); color: #1a1407; border-color: var(--gold); font-weight: 600; }
.tgp-btn.gold:hover { background: var(--gold-light); border-color: var(--gold-light); }
.tgp-btn.ghost { background: transparent; }
.tgp-btn.danger { background: rgba(242,140,140,0.12); border-color: rgba(242,140,140,0.45); color: var(--bad); }
.tgp-btn.wide { width: 100%; }
.tgp-btn.sm { padding: 6px 11px; min-height: 32px; font-size: .82rem; }
.tgp-link { background: none; border: 0; color: var(--bad); text-decoration: underline; text-underline-offset: 3px; padding: 6px; font-size: .9rem; }

/* datos */
.tgp-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 380px) { .tgp-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.tgp-field { display: grid; gap: 5px; min-width: 0; }
.tgp-field label { font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.tgp-input-wrap { position: relative; }
.tgp-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; color: var(--text); padding: 10px 40px 10px 12px; font-size: 1.05rem; font-variant-numeric: tabular-nums; transition: border-color var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out); -moz-appearance: textfield; }
.tgp-input::-webkit-outer-spin-button, .tgp-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.tgp-input:focus { border-color: var(--gold); box-shadow: var(--shadow-glow); outline: none; }
.tgp-unit { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: .8rem; pointer-events: none; }
.tgp-help { color: var(--muted); font-size: .78rem; min-height: 1.2em; }
.tgp-help.error { color: var(--bad); }
.tgp-input[aria-invalid="true"] { border-color: var(--bad); }
.tgp-add-help { grid-column: 1 / -1; min-height: 0; }
.tgp-add-help:empty { display: none; }
.tgp-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.tgp-seg { display: inline-flex; border: 1px solid var(--border); border-radius: 12px; padding: 3px; background: rgba(15,17,23,0.5); gap: 2px; }
.tgp-seg button { border: 0; background: transparent; color: var(--muted); padding: 6px 12px; border-radius: 9px; font-size: .85rem; font-weight: 500; transition: background var(--t-fast) var(--ease-out), color var(--t-fast) var(--ease-out); }
.tgp-seg button.is-on { background: var(--gold); color: #1a1407; }
.tgp-imc { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: rgba(15,17,23,0.5); border: 1px dashed var(--border); }
.tgp-imc .val { font: 600 1.5rem/1 var(--font-display); color: var(--gold-light); font-variant-numeric: tabular-nums; }
.tgp-imc .cat { padding: 4px 10px; border-radius: 999px; font-size: .78rem; font-weight: 600; background: rgba(255,255,255,0.08); }
.tgp-imc .cat.ok { background: rgba(111,207,151,0.18); color: var(--ok); }
.tgp-imc .cat.warn { background: rgba(242,201,76,0.16); color: var(--warn); }
.tgp-imc .cat.bad { background: rgba(242,140,140,0.16); color: var(--bad); }
.tgp-imc .note { color: var(--muted); font-size: .75rem; flex-basis: 100%; }

/* evolución */
.tgp-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 10px 0 12px; }
.tgp-tile { background: rgba(15,17,23,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 10px 10px 8px; min-width: 0; }
.tgp-tile .k { font-size: .64rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); line-height: 1.2; overflow-wrap: break-word; -webkit-hyphens: auto; hyphens: auto; }
.tgp-tile .v { font: 600 1.35rem/1.2 var(--font-display); font-variant-numeric: tabular-nums; margin-top: 2px; color: var(--text); white-space: nowrap; }
.tgp-tile .v.up { color: var(--gold-light); } .tgp-tile .v.down { color: var(--ok); }
.tgp-tile .s { font-size: .72rem; color: var(--muted); }
.tgp-chart { position: relative; }
.tgp-chart svg { display: block; width: 100%; height: auto; overflow: visible; }
.tgp-chart .grid { stroke: rgba(240,236,228,0.08); stroke-width: 1; }
.tgp-chart .axis { fill: var(--muted); font-size: 9.5px; font-family: var(--font-body); font-variant-numeric: tabular-nums; }
.tgp-chart .line { fill: none; stroke: var(--gold); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.tgp-chart .area { fill: url(#tgp-area); opacity: .9; }
.tgp-chart .trend { fill: none; stroke: var(--gold-light); stroke-width: 1.5; stroke-dasharray: 4 4; opacity: .75; }
.tgp-chart .goal { stroke: var(--ok); stroke-width: 1; stroke-dasharray: 3 4; opacity: .9; }
.tgp-chart .goal-label { fill: var(--ok); font-size: 9px; font-family: var(--font-body); }
.tgp-chart .pt { fill: var(--panel); stroke: var(--gold); stroke-width: 2; }
.tgp-chart .pt.last { fill: var(--gold-light); stroke: var(--panel); r: 5; }
.tgp-chart .hit { fill: transparent; cursor: pointer; }
.tgp-chart .bar { fill: var(--gold); opacity: .9; }
.tgp-chart .bar.today { fill: var(--gold-light); opacity: 1; }
.tgp-chart .bar-label { fill: var(--text); font-size: 9.5px; font-family: var(--font-body); font-variant-numeric: tabular-nums; text-anchor: middle; }
.tgp-chart .draw { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: tgp-draw 1.1s var(--ease-emph) forwards; }
@keyframes tgp-draw { to { stroke-dashoffset: 0; } }
.tgp-chart .fade { animation: tgp-fade .9s var(--ease-out) both; animation-delay: .4s; }
@keyframes tgp-fade { from { opacity: 0; } to { opacity: .9; } }
.tgp-tip { position: absolute; transform: translate(-50%, calc(-100% - 10px)); background: var(--panel2); border: 1px solid var(--border); border-radius: 10px; padding: 6px 9px; font-size: .78rem; white-space: nowrap; pointer-events: none; box-shadow: var(--shadow-md); opacity: 0; transition: opacity var(--t-fast) var(--ease-out); }
.tgp-tip.show { opacity: 1; }
.tgp-tip b { color: var(--gold-light); font-variant-numeric: tabular-nums; }
.tgp-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: .75rem; color: var(--muted); margin-top: 4px; }
.tgp-legend i { display: inline-block; width: 14px; height: 0; border-top: 2px solid var(--gold); vertical-align: middle; margin-right: 5px; }
.tgp-legend i.trend { border-top: 2px dashed var(--gold-light); } .tgp-legend i.goal { border-top: 2px dashed var(--ok); }
.tgp-empty { padding: 26px 10px; text-align: center; color: var(--muted); font-size: .9rem; border: 1px dashed var(--border); border-radius: 12px; }
.tgp-ranges { display: flex; gap: 6px; flex-wrap: wrap; }
.tgp-ranges button { border: 1px solid var(--border); background: transparent; color: var(--muted); border-radius: 999px; padding: 4px 10px; font-size: .78rem; }
.tgp-ranges button.is-on { border-color: var(--gold); color: var(--gold-light); background: rgba(212,175,55,0.1); }
.tgp-add { display: grid; grid-template-columns: 1.1fr 1fr auto; gap: 8px; margin-top: 12px; }
@media (max-width: 480px) { .tgp-add { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } .tgp-add .tgp-btn { grid-column: 1 / -1; } }
.tgp-add > * { min-width: 0; }
.tgp-add input[type="date"] { padding-right: 10px; font-size: .92rem; }
.tgp-log { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 4px; max-height: 150px; overflow: auto; }
.tgp-log li { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: .84rem; padding: 5px 8px; border-radius: 8px; background: rgba(255,255,255,0.03); font-variant-numeric: tabular-nums; }
.tgp-log .d { color: var(--muted); } .tgp-log .x { background: none; border: 0; color: var(--muted); padding: 2px 6px; font-size: .78rem; }
.tgp-log .x:hover { color: var(--bad); }

/* isla */
.tgp-isla-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.tgp-isla-tiles .tgp-tile { text-align: center; }
.tgp-isla-tiles .ico { font-size: 1.3rem; line-height: 1; }
/* En minúscula y sin espaciado: en mayúsculas «ПОСТИЖЕНИЯ» no cabía y se partía en «ПОСТИЖЕНИ/Я». */
.tgp-isla-tiles .tgp-tile .k { text-transform: none; letter-spacing: 0; font-size: .74rem; }
.tgp-progress { margin-top: 12px; }
.tgp-progress .bar { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
.tgp-progress .fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--gold), var(--gold-accent)); width: 0; transition: width 1.1s var(--ease-emph); }
.tgp-progress .txt { font-size: .8rem; color: var(--muted); margin-top: 6px; }
.tgp-stamps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.tgp-stamp { aspect-ratio: 1; max-width: 100%; border-radius: 50%; border: 2px dashed var(--gold); display: grid; place-content: center; text-align: center; gap: 2px; padding: 8px; transform: rotate(var(--rot, 0deg)); background: rgba(212,175,55,0.07); position: relative; }
.tgp-stamp .ico { font-size: 1.5rem; line-height: 1; }
.tgp-stamp .nm { font: 600 .8rem/1.1 var(--font-display); color: var(--gold-light); overflow-wrap: anywhere; }
.tgp-stamp .th { font-size: .62rem; color: var(--muted); }
.tgp-stamp.is-locked { border-color: rgba(240,236,228,0.18); background: transparent; opacity: .55; filter: grayscale(1); }
.tgp-stamp::after { content: ""; position: absolute; inset: 4px; border-radius: 50%; border: 1px solid rgba(212,175,55,0.35); }
.tgp-stamp.is-locked::after { border-color: rgba(240,236,228,0.12); }

/* cuenta */
.tgp-account { display: grid; gap: 10px; }
.tgp-account .email { font-size: 1.05rem; color: var(--text); overflow-wrap: anywhere; }
.tgp-status { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 12px; font-size: .85rem; }
.tgp-status.cloud { background: rgba(111,207,151,0.12); color: var(--ok); border: 1px solid rgba(111,207,151,0.35); }
.tgp-status.local { background: rgba(240,236,228,0.05); color: var(--muted); border: 1px solid var(--border); }
.tgp-account-btns { display: grid; gap: 8px; }

/* toast */
.tgp-toast { position: fixed; left: 50%; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 20px); background: var(--panel2); color: var(--text); border: 1px solid var(--gold); border-radius: 999px; padding: 9px 16px; font-size: .9rem; box-shadow: var(--shadow-lg); opacity: 0; pointer-events: none; transition: opacity var(--t-slow) var(--ease-out), transform var(--t-slow) var(--ease-bounce); z-index: 30; max-width: calc(100vw - 32px); }
.tgp-toast.show { opacity: 1; transform: translate(-50%, 0); }

@media (prefers-reduced-motion: reduce) {
  .tgp *, .tgp *::before, .tgp *::after, .tgp-toast { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  .tgp-chart .draw { stroke-dashoffset: 0; }
}

/* color-mix() necesita iOS 16.2: cada uso lleva antes un color fijo para iOS 15 */
/* clases que sustituyen a los style="" del cuerpo */
.tgp-objetivo-row { margin-top: 14px; }
.tgp-objetivo-field { flex: 1 1 180px; }
.tgp-sellos-titulo { margin-top: 14px; }
/* borrar los datos del perfil de este dispositivo: confirmación en la propia pantalla (sin confirm()) */
.tgp-confirm { border: 1px solid rgba(242,140,140,0.45); background: rgba(242,140,140,0.08); border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
.tgp-confirm p { margin: 0; font-size: .88rem; }
.tgp-confirm-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.tgp-confirm-btns .tgp-btn { flex: 1 1 140px; }

/* Medido en los diez idiomas a 360 px (verificación del 22 de octubre): con
   estos tamaños caben «AUJOURD’HUI», «ПОСЛЕДНИТЕ», «Achievements»,
   «Постижения» y los nombres de logro que ya tiene la app («Conquistatore»,
   «Изследовател»…) sin partirse a mitad de palabra. */
.tgp-tile { padding-left: 8px; padding-right: 8px; }
.tgp-tile .k { font-size: .6rem; letter-spacing: .02em; }
.tgp-isla-tiles .tgp-tile .k { font-size: .68rem; }
.tgp-stamp { padding: 6px; }
.tgp-stamp .nm { font-size: .72rem; overflow-wrap: break-word; -webkit-hyphens: auto; hyphens: auto; }
.tgp-av { width: 92px; }
.tgp-av .name { max-width: 90px; }
/* Los botones a todo lo ancho parten línea: «Borrar los datos del perfil de este dispositivo» no cabe en una a 360 px. */
.tgp-btn.wide { white-space: normal; text-align: center; line-height: 1.25; padding-top: 10px; padding-bottom: 10px; }

/* ── las visitas comprobadas (set Tenerife) ── */
.tgp-lock-why { margin: 8px 0 0; color: var(--muted); font-size: .8rem; line-height: 1.4; }

/* ── la nube, con permiso: el interruptor ── */
.tgp-nube { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 12px; background: rgba(240,236,228,0.04); }
.tgp-nube .txt { min-width: 0; }
.tgp-nube .lbl { font-size: .92rem; color: var(--text); }
.tgp-nube .sub { font-size: .78rem; color: var(--muted); margin-top: 2px; }
.tgp-switch { flex: 0 0 auto; position: relative; width: 50px; height: 30px; border-radius: 999px; border: 1px solid var(--border); background: var(--panel2); padding: 0; transition: background var(--t-normal) var(--ease-out), border-color var(--t-normal) var(--ease-out); }
.tgp-switch .knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.45); transition: transform var(--t-normal) var(--ease-out); }
.tgp-switch[aria-checked="true"] { background: var(--gold); border-color: var(--gold); }
.tgp-switch[aria-checked="true"] .knob { transform: translateX(20px); background: #1a1407; }
.tgp-switch:disabled { opacity: .45; cursor: not-allowed; }
.tgp-confirm.ok { border-color: rgba(212,175,55,0.45); background: rgba(212,175,55,0.08); }
@media (prefers-reduced-motion: reduce) { .tgp-switch, .tgp-switch .knob { transition: none; } }

/* ── solo en la app ── */
/* cerrado, no se ve (la app no tiene una regla global para [hidden]) */
#perfil-panel[hidden] { display: none !important; }
/* abajo, el borde del iPhone (la barra de inicio) */
#perfil-panel { padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
/* la linea de «Activar notificaciones», que escribe el codigo de las notificaciones: vacia, no ocupa */
.tgp-push-msg { text-align: center; min-height: 0; }
.tgp-push-msg:empty { display: none; }
`;
  /* CUERPO es perfil.html del encargo sin el selector de idioma, la etiqueta
     «Ejemplo» ni el pie «Demo», y sin sus marcas de idioma: las claves van en
     TEXTOS, debajo. Los textos los pone aplicarTextos(), de PERFIL_UI, antes
     de enseñarse; sin traducir, solo las unidades. Los numeros van en campos
     de texto con teclado decimal (inputmode), no en type="number": con el
     movil en castellano, Chromium convertia «81,5» en 815. */
  var CUERPO = `
<div class="tgp" id="tgp" lang="es">

  <header class="tgp-top">
    <button type="button" class="tgp-icon-btn" id="tgp-back">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <h1 id="tgp-titulo">Su perfil</h1>
  </header>

  <section class="tgp-hero" id="tgp-hero">
    <div class="tgp-stars" aria-hidden="true"></div>
    <div class="tgp-blob b1" aria-hidden="true"></div>
    <div class="tgp-blob b2" aria-hidden="true"></div>
    <div class="tgp-blob b3" aria-hidden="true"></div>
    <canvas class="tgp-confeti" id="tgp-confeti" aria-hidden="true"></canvas>
    <div class="tgp-ring-wrap">
      <div class="tgp-ring"><div class="tgp-ava-big" id="tgp-ava-big"></div></div>
    </div>
    <div class="tgp-name-row" id="tgp-name-row">
      <h2 class="tgp-name" id="tgp-name"></h2>
      <button type="button" class="tgp-pencil" id="tgp-name-edit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
      </button>
    </div>
    <div class="tgp-meta" id="tgp-meta"></div>
    <p class="tgp-lema">Su pasaporte de viajero</p>
  </section>

  <section class="tgp-card" id="tgp-avatares">
    <div class="tgp-card-head"><h2>Elija su avatar</h2></div>
    <div class="tgp-sets" id="tgp-sets" role="tablist"></div>
    <div class="tgp-strip" id="tgp-strip"></div>
    <div class="tgp-strip-foot">
      <div><div class="pick" id="tgp-pick"></div><div class="tgp-lock-note" id="tgp-lock-note"></div></div>
      <button type="button" class="tgp-btn sm" id="tgp-random">🎲 <span>Sorpréndeme</span></button>
    </div>
    <p class="tgp-lock-why" id="tgp-lock-why" hidden>Una visita queda comprobada si marca el lugar como visitado estando allí. Lo comprueba el móvil con su ubicación, que no se envía a ningún sitio.</p>
  </section>

  <section class="tgp-card" id="tgp-datos">
    <div class="tgp-card-head"><h2>Sus datos</h2></div>
    <p class="tgp-note">Se guardan en este dispositivo y, solo si usted activa la opción en «Cuenta», también en su cuenta.</p>
    <form id="tgp-form" novalidate>
      <div class="tgp-fields">
        <div class="tgp-field">
          <label for="tgp-altura">Altura</label>
          <div class="tgp-input-wrap"><input class="tgp-input" id="tgp-altura" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-describedby="tgp-altura-h"><span class="tgp-unit" id="tgp-altura-u">cm</span></div>
          <div class="tgp-help" id="tgp-altura-h" aria-live="polite"></div>
        </div>
        <div class="tgp-field">
          <label for="tgp-peso">Peso</label>
          <div class="tgp-input-wrap"><input class="tgp-input" id="tgp-peso" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-describedby="tgp-peso-h"><span class="tgp-unit" id="tgp-peso-u">kg</span></div>
          <div class="tgp-help" id="tgp-peso-h" aria-live="polite"></div>
        </div>
        <div class="tgp-field">
          <label for="tgp-nac">Año de nacimiento</label>
          <div class="tgp-input-wrap"><input class="tgp-input" id="tgp-nac" type="text" inputmode="numeric" maxlength="4" autocomplete="off" enterkeyhint="done" aria-describedby="tgp-nac-h"></div>
          <div class="tgp-help" id="tgp-nac-h" aria-live="polite"></div>
        </div>
      </div>
      <div class="tgp-imc" id="tgp-imc" hidden>
        <span class="tgp-eyebrow">IMC</span>
        <span class="val" id="tgp-imc-val"></span>
        <span class="cat" id="tgp-imc-cat"></span>
        <span class="note" id="tgp-imc-nota">Orientativo. Categorías de la OMS para adultos</span>
        <span class="note" id="tgp-imc-joven" hidden>Por debajo de 20 años, la OMS usa tablas por edad y sexo</span>
      </div>
      <div class="tgp-row">
        <div class="tgp-seg" id="tgp-unidades" role="group">
          <button type="button" data-u="metric" class="is-on">kg · cm</button>
          <button type="button" data-u="imperial">lb · in</button>
        </div>
        <button type="submit" class="tgp-btn gold" id="tgp-save"><span>Guardar</span></button>
      </div>
    </form>
  </section>

  <section class="tgp-card" id="tgp-evo">
    <div class="tgp-card-head">
      <h2>Su evolución</h2>
      <div class="tgp-seg" id="tgp-evo-tabs" role="tablist">
        <button type="button" data-tab="peso" class="is-on">Peso</button>
        <button type="button" data-tab="km">Kilómetros</button>
      </div>
    </div>
    <div id="tgp-evo-peso">
      <div class="tgp-tiles" id="tgp-peso-tiles"></div>
      <div class="tgp-chart" id="tgp-peso-chart"><div class="tgp-tip" id="tgp-tip"></div></div>
      <div class="tgp-legend" id="tgp-peso-legend"></div>
      <div class="tgp-row">
        <div class="tgp-ranges" id="tgp-ranges">
          <button type="button" data-r="30" class="is-on">30 días</button>
          <button type="button" data-r="90">90 días</button>
          <button type="button" data-r="365">1 año</button>
        </div>
      </div>
      <form class="tgp-add" id="tgp-add-peso" novalidate>
        <input class="tgp-input" type="date" id="tgp-peso-fecha">
        <div class="tgp-input-wrap"><input class="tgp-input" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" id="tgp-peso-nuevo" aria-describedby="tgp-peso-nuevo-h"><span class="tgp-unit" id="tgp-peso-nuevo-u">kg</span></div>
        <button type="submit" class="tgp-btn gold"><span>Añadir</span></button>
        <div class="tgp-help tgp-add-help" id="tgp-peso-nuevo-h" aria-live="polite"></div>
      </form>
      <ul class="tgp-log" id="tgp-peso-log"></ul>
      <div class="tgp-row tgp-objetivo-row">
        <div class="tgp-field tgp-objetivo-field">
          <label for="tgp-objetivo">Objetivo</label>
          <div class="tgp-input-wrap"><input class="tgp-input" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" id="tgp-objetivo" aria-describedby="tgp-objetivo-h"><span class="tgp-unit" id="tgp-objetivo-u">kg</span></div>
          <div class="tgp-help" id="tgp-objetivo-h" aria-live="polite"></div>
        </div>
      </div>
    </div>
    <div id="tgp-evo-km" hidden>
      <div class="tgp-tiles" id="tgp-km-tiles"></div>
      <div class="tgp-chart" id="tgp-km-chart"></div>
      <form class="tgp-add" id="tgp-add-km" novalidate>
        <input class="tgp-input" type="date" id="tgp-km-fecha">
        <div class="tgp-input-wrap"><input class="tgp-input" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" id="tgp-km-nuevo" aria-describedby="tgp-km-nuevo-h"><span class="tgp-unit">km</span></div>
        <button type="submit" class="tgp-btn gold"><span>Añadir</span></button>
        <div class="tgp-help tgp-add-help" id="tgp-km-nuevo-h" aria-live="polite"></div>
      </form>
      <ul class="tgp-log" id="tgp-km-log"></ul>
    </div>
  </section>

  <section class="tgp-card" id="tgp-isla">
    <div class="tgp-card-head"><h2>Su isla</h2><span class="tgp-eyebrow">Tenerife Go</span></div>
    <div class="tgp-isla-tiles" id="tgp-isla-tiles"></div>
    <div class="tgp-progress" id="tgp-progress"><div class="bar"><div class="fill" id="tgp-progress-fill"></div></div><div class="txt" id="tgp-progress-txt"></div></div>
    <div class="tgp-eyebrow tgp-sellos-titulo">Sus sellos</div>
    <div class="tgp-stamps" id="tgp-stamps"></div>
  </section>

  <section class="tgp-card tgp-account" id="tgp-cuenta">
    <div class="tgp-card-head"><h2>Cuenta</h2></div>
    <div id="tgp-cuenta-who"></div>
    <div class="tgp-status" id="tgp-cuenta-status"></div>
    <div class="tgp-nube" id="tgp-nube-box"></div>
    <div class="tgp-confirm ok" id="tgp-nube-confirm" hidden>
      <p>Se guardarán en su cuenta su nombre o apodo, su avatar, sus unidades, su altura, su año de nacimiento, la fecha de alta del perfil, su peso objetivo y los pesos y kilómetros que anote, con la fecha de cada uno.</p>
      <div class="tgp-confirm-btns">
        <button type="button" class="tgp-btn gold" id="tgp-nube-si"><span>Acepto</span></button>
        <button type="button" class="tgp-btn" id="tgp-nube-no"><span>Cancelar</span></button>
      </div>
    </div>
    <div class="tgp-confirm" id="tgp-nube-quitar" hidden>
      <p>Se borrará la copia guardada en su cuenta. En este dispositivo se queda todo.</p>
      <div class="tgp-confirm-btns">
        <button type="button" class="tgp-btn danger" id="tgp-nube-quitar-si"><span>Borrar de la nube</span></button>
        <button type="button" class="tgp-btn" id="tgp-nube-quitar-no"><span>Cancelar</span></button>
      </div>
    </div>
    <div class="tgp-account-btns" id="tgp-cuenta-btns"></div>
    <div class="tgp-confirm" id="tgp-borrar-confirm" hidden>
      <p id="tgp-borrar-texto"></p>
      <div class="tgp-confirm-btns">
        <button type="button" class="tgp-btn danger" id="tgp-borrar-si"><span>Sí, borrar</span></button>
        <button type="button" class="tgp-btn" id="tgp-borrar-no"><span>Cancelar</span></button>
      </div>
    </div>
  </section>

</div>

<div class="tgp-toast" id="tgp-toast" role="status" aria-live="polite"></div>
`;

  /* Las claves de los textos fijos del cuerpo: [selector, como, clave]; como es tx (el
     texto), aria (aria-label) o ph (placeholder). No van en la cadena como marcas: fuente.py
     pega el modulo dentro de un <script>, y auditar_seguridad.py no deja ninguna ahi (una
     marca dentro de una cadena acaba en el dato). montar() las pone con setAttribute en
     cuanto el cuerpo esta en la pagina, y desde ahi las traducen aplicarTextos() y, al
     cambiar de idioma, applyUiTx() de la app, como las de index.html. Cada selector da
     un solo elemento (lo mira tools/probar_perfil.js). */
  var TEXTOS = [
    ['#tgp-back', 'aria', 'ariaCerrar'],
    ['#tgp-titulo', 'tx', 'perfilTitulo'],
    ['#tgp-name-edit', 'aria', 'perfilEditarNombre'],
    ['#tgp-hero .tgp-lema', 'tx', 'perfilLema'],
    ['#tgp-avatares h2', 'tx', 'perfilElegirAvatar'],
    ['#tgp-random span', 'tx', 'perfilSorprendeme'],
    ['#tgp-lock-why', 'tx', 'perfilVisitaVerdad'],
    ['#tgp-datos h2', 'tx', 'perfilDatos'],
    ['#tgp-datos .tgp-note', 'tx', 'perfilDatosNota'],
    ['label[for="tgp-altura"]', 'tx', 'perfilAltura'],
    ['label[for="tgp-peso"]', 'tx', 'perfilPeso'],
    ['label[for="tgp-nac"]', 'tx', 'perfilNacimiento'],
    ['#tgp-imc .tgp-eyebrow', 'tx', 'perfilImc'],
    ['#tgp-imc-nota', 'tx', 'perfilImcNota'],
    ['#tgp-imc-joven', 'tx', 'perfilImcJoven'],
    ['#tgp-unidades', 'aria', 'perfilUnidades'],
    ['#tgp-save span', 'tx', 'perfilGuardar'],
    ['#tgp-evo h2', 'tx', 'perfilEvolucion'],
    ['#tgp-evo-tabs [data-tab="peso"]', 'tx', 'perfilPeso'],
    ['#tgp-evo-tabs [data-tab="km"]', 'tx', 'perfilKm'],
    ['#tgp-ranges [data-r="30"]', 'tx', 'perfilRango30'],
    ['#tgp-ranges [data-r="90"]', 'tx', 'perfilRango90'],
    ['#tgp-ranges [data-r="365"]', 'tx', 'perfilRangoAnio'],
    ['#tgp-peso-fecha', 'aria', 'perfilFecha'],
    ['#tgp-peso-nuevo', 'ph', 'perfilPeso'],
    ['#tgp-add-peso button span', 'tx', 'perfilAnadir'],
    ['label[for="tgp-objetivo"]', 'tx', 'perfilObjetivo'],
    ['#tgp-objetivo', 'ph', 'perfilObjetivoPlaceholder'],
    ['#tgp-km-fecha', 'aria', 'perfilFecha'],
    ['#tgp-km-nuevo', 'ph', 'perfilDistancia'],
    ['#tgp-add-km button span', 'tx', 'perfilAnadir'],
    ['#tgp-isla h2', 'tx', 'perfilIsla'],
    ['#tgp-isla .tgp-sellos-titulo', 'tx', 'perfilSellos'],
    ['#tgp-cuenta h2', 'tx', 'perfilCuenta'],
    ['#tgp-nube-confirm p', 'tx', 'perfilNubeConsentimiento'],
    ['#tgp-nube-si span', 'tx', 'perfilNubeAcepto'],
    ['#tgp-nube-no span', 'tx', 'cuentaBorrarNo'],
    ['#tgp-nube-quitar p', 'tx', 'perfilNubeQuitarAviso'],
    ['#tgp-nube-quitar-si span', 'tx', 'perfilNubeQuitarSi'],
    ['#tgp-nube-quitar-no span', 'tx', 'cuentaBorrarNo'],
    ['#tgp-borrar-si span', 'tx', 'perfilBorrarLocalSi'],
    ['#tgp-borrar-no span', 'tx', 'cuentaBorrarNo']
  ];

  /* estado() y esperar() son para las pruebas (tools/probar_perfil.js):
     esperar() da la vuelta de la nube en curso. */
  window.TG_PERFIL = {
    abrir: abrir,
    cerrar: function () { cerrar(); },
    repintar: function () { if (!st.avatar) setAbierto = null; if (abierto) renderTodo(); },
    sincronizar: sincronizar,
    estado: function () { return st; },
    esperar: function () { return nubeCadena; }
  };
})();
