/* modulos/cuerpo.js — la pantalla «Su cuerpo» (24 de octubre de 2026).

   QUE ES. Jerome, el 24 de octubre: «Podemos preparar algo muy completo para dieta, deporte,
   acompañamiento del asistente, evolución del cuerpo (con un personaje grande que puede
   adaptar a su apariencia…)». Esta es la parte 2: el personaje grande, de frente y de
   espaldas, con el aspecto que elige cada persona (silueta, complexión, piel, pelo, cara,
   ropa, gafas, audífono, prótesis) y, en «Músculos», unos treinta y cinco músculos con
   volumen, también los pequeños (manguito, serrato, romboides, tibial…), que se iluminan del
   gris al oro con las series anotadas en los últimos 7 días en su grupo (se anota en 12 grupos). Cada grupo abre su hoja: qué
   músculos son, sus cuentas y «Anotar series». No cambia de forma con el peso (Jerome:
   «Su aspecto y sus músculos»).

   EL DIBUJO es propio, en SVG, hecho por el código (TG_FIGURA_GEO, TG_FIGURA_ASP y
   TG_FIGURA, aquí dentro): ninguna imagen, ninguna fuente, nada de fuera. Proporciones de un
   canon de 8 cabezas; formas de los músculos dibujadas a mano a partir de la anatomía de
   superficie, sin copiar ninguna lámina.

   LAS CIFRAS que enseña son las verificadas el 24 de octubre en sus fuentes: la OMS (2020),
   fuerza al menos 2 días por semana con todos los grupos principales en adultos y 3 días de
   5 a 17 años; el ACSM (2026), unas 10 series por grupo y semana para ganar músculo en
   adultos (los niveles del mapa: 0, 1-4, 5-9, 10 o más). Nada de porcentajes de
   recuperación ni de calorías: solo lo anotado y su fecha.

   LOS TEXTOS. CUERPO_UI son filas planas como las de UI_TX, en los diez idiomas y de usted,
   y se funden en UI_TX como hace el perfil con PERFIL_UI: se piden con el tx() de la app.

   LO QUE VIENE DE LA PERSONA va por textContent. innerHTML, solo para el cuerpo de la
   pantalla y los dibujos de TG_FIGURA, que escribe este código.

   LO QUE SE GUARDA. Solo en el dispositivo: tenerife.cuerpo, validado campo a campo al
   leerlo. No sube a ninguna parte (las series de entrenamiento son datos de salud: subirlas
   pediría el permiso expreso de la persona y una evaluación de impacto antes). Del perfil
   solo se lee el año de nacimiento, para elegir la recomendación de la OMS. */
(function () {
  'use strict';
  /* Los textos de la pantalla, en los diez idiomas (256 filas). */
  var CUERPO_UI = {
    "cuerpoTitulo": {"es": "Su cuerpo", "en": "Your body", "fr": "Votre corps", "de": "Ihr Körper", "it": "Corpo", "nl": "Uw lichaam", "zh": "我的身体", "zht": "我的身體", "bg": "Вашето тяло", "pl": "Ciało"},
    "cuerpoLema": {"es": "Sus músculos, su semana y su personaje", "en": "Your muscles, your week and your character", "fr": "Vos muscles, votre semaine et votre personnage", "de": "Ihre Muskeln, Ihre Woche und Ihre Figur", "it": "Muscoli, settimana e personaggio", "nl": "Uw spieren, uw week en uw personage", "zh": "肌肉、一周训练和形象", "zht": "肌肉、一週訓練和形象", "bg": "Вашите мускули, вашата седмица и вашият герой", "pl": "Mięśnie, tydzień i postać"},
    "cuerpoModos": {"es": "Qué ver", "en": "What to show", "fr": "Affichage", "de": "Ansicht", "it": "Vista", "nl": "Weergave", "zh": "显示内容", "zht": "顯示內容", "bg": "Изглед", "pl": "Widok"},
    "cuerpoModoMusculos": {"es": "Músculos", "en": "Muscles", "fr": "Muscles", "de": "Muskeln", "it": "Muscoli", "nl": "Spieren", "zh": "肌肉", "zht": "肌肉", "bg": "Мускули", "pl": "Mięśnie"},
    "cuerpoModoAspecto": {"es": "Aspecto", "en": "Look", "fr": "Apparence", "de": "Aussehen", "it": "Aspetto", "nl": "Uiterlijk", "zh": "外观", "zht": "外觀", "bg": "Външен вид", "pl": "Wygląd"},
    "cuerpoGirar": {"es": "Girar", "en": "Turn", "fr": "Tourner", "de": "Drehen", "it": "Gira", "nl": "Draaien", "zh": "转身", "zht": "轉身", "bg": "Завърти", "pl": "Obróć"},
    "cuerpoVerEspalda": {"es": "Ver de espaldas", "en": "Show from behind", "fr": "Voir de dos", "de": "Von hinten zeigen", "it": "Vedi da dietro", "nl": "Van achteren bekijken", "zh": "查看背面", "zht": "查看背面", "bg": "Покажи отзад", "pl": "Pokaż od tyłu"},
    "cuerpoVerFrente": {"es": "Ver de frente", "en": "Show from the front", "fr": "Voir de face", "de": "Von vorne zeigen", "it": "Vedi di fronte", "nl": "Van voren bekijken", "zh": "查看正面", "zht": "查看正面", "bg": "Покажи отпред", "pl": "Pokaż od przodu"},
    "cuerpoVistaFrente": {"es": "de frente", "en": "from the front", "fr": "de face", "de": "von vorne", "it": "di fronte", "nl": "van voren", "zh": "正面", "zht": "正面", "bg": "отпред", "pl": "od przodu"},
    "cuerpoVistaEspalda": {"es": "de espaldas", "en": "from behind", "fr": "de dos", "de": "von hinten", "it": "da dietro", "nl": "van achteren", "zh": "背面", "zht": "背面", "bg": "отзад", "pl": "od tyłu"},
    "cuerpoFiguraAlt": {"es": "Su personaje, {vista}", "en": "Your character, {vista}", "fr": "Votre personnage, {vista}", "de": "Ihre Figur, {vista}", "it": "Il personaggio, {vista}", "nl": "Uw personage, {vista}", "zh": "您的形象，{vista}", "zht": "您的形象，{vista}", "bg": "Вашият герой, {vista}", "pl": "Postać, {vista}"},
    "cuerpoFiguraAltMusculos": {"es": "Sus músculos, {vista}. {trabajados}", "en": "Your muscles, {vista}. {trabajados}", "fr": "Vos muscles, {vista}. {trabajados}", "de": "Ihre Muskeln, {vista}. {trabajados}", "it": "I muscoli, {vista}. {trabajados}", "nl": "Uw spieren, {vista}. {trabajados}", "zh": "您的肌肉，{vista}。{trabajados}", "zht": "您的肌肉，{vista}。{trabajados}", "bg": "Вашите мускули, {vista}. {trabajados}", "pl": "Mięśnie, {vista}. {trabajados}"},
    "cuerpoTrabajados": {"es": "Trabajados en los últimos 7 días: {lista}.", "en": "Worked in the last 7 days: {lista}.", "fr": "Travaillés ces 7 derniers jours : {lista}.", "de": "In den letzten 7 Tagen trainiert: {lista}.", "it": "Allenati negli ultimi 7 giorni: {lista}.", "nl": "Getraind in de afgelopen 7 dagen: {lista}.", "zh": "过去 7 天练过：{lista}。", "zht": "過去 7 天練過：{lista}。", "bg": "Тренирани през последните 7 дни: {lista}.", "pl": "Ćwiczone w ostatnich 7 dniach: {lista}."},
    "cuerpoNingunTrabajado": {"es": "Ningún grupo trabajado en los últimos 7 días.", "en": "No muscle group worked in the last 7 days.", "fr": "Aucun groupe travaillé ces 7 derniers jours.", "de": "In den letzten 7 Tagen keine Muskelgruppe trainiert.", "it": "Nessun gruppo allenato negli ultimi 7 giorni.", "nl": "Geen spiergroep getraind in de afgelopen 7 dagen.", "zh": "过去 7 天没有练过任何肌群。", "zht": "過去 7 天沒有練過任何肌群。", "bg": "През последните 7 дни не е тренирана нито една мускулна група.", "pl": "W ostatnich 7 dniach nie ćwiczono żadnej grupy mięśni."},
    "cuerpoLeyenda": {"es": "Series en los últimos 7 días", "en": "Sets in the last 7 days", "fr": "Séries des 7 derniers jours", "de": "Sätze in den letzten 7 Tagen", "it": "Serie negli ultimi 7 giorni", "nl": "Sets in de afgelopen 7 dagen", "zh": "过去 7 天的组数", "zht": "過去 7 天的組數", "bg": "Серии през последните 7 дни", "pl": "Serie w ostatnich 7 dniach"},
    "cuerpoNivel0": {"es": "Ninguna", "en": "None", "fr": "Aucune", "de": "Keine", "it": "Nessuna", "nl": "Geen", "zh": "无", "zht": "無", "bg": "Нито една", "pl": "Brak"},
    "cuerpoNivel1": {"es": "De 1 a 4", "en": "1 to 4", "fr": "De 1 à 4", "de": "1 bis 4", "it": "Da 1 a 4", "nl": "1 tot 4", "zh": "1–4 组", "zht": "1–4 組", "bg": "От 1 до 4", "pl": "Od 1 do 4"},
    "cuerpoNivel2": {"es": "De 5 a 9", "en": "5 to 9", "fr": "De 5 à 9", "de": "5 bis 9", "it": "Da 5 a 9", "nl": "5 tot 9", "zh": "5–9 组", "zht": "5–9 組", "bg": "От 5 до 9", "pl": "Od 5 do 9"},
    "cuerpoNivel3": {"es": "10 o más", "en": "10 or more", "fr": "10 ou plus", "de": "10 oder mehr", "it": "10 o più", "nl": "10 of meer", "zh": "10 组以上", "zht": "10 組以上", "bg": "10 или повече", "pl": "10 lub więcej"},
    "cuerpoResumenTitulo": {"es": "Sus últimos 7 días", "en": "Your last 7 days", "fr": "Vos 7 derniers jours", "de": "Ihre letzten 7 Tage", "it": "Gli ultimi 7 giorni", "nl": "Uw afgelopen 7 dagen", "zh": "过去 7 天", "zht": "過去 7 天", "bg": "Вашите последни 7 дни", "pl": "Ostatnie 7 dni"},
    "cuerpoStatSeries": {"es": "Series", "en": "Sets", "fr": "Séries", "de": "Sätze", "it": "Serie", "nl": "Sets", "zh": "组数", "zht": "組數", "bg": "Серии", "pl": "Serie"},
    "cuerpoStatGrupos": {"es": "Grupos trabajados", "en": "Groups worked", "fr": "Groupes travaillés", "de": "Trainierte Gruppen", "it": "Gruppi allenati", "nl": "Getrainde groepen", "zh": "练过的肌群", "zht": "練過的肌群", "bg": "Тренирани групи", "pl": "Ćwiczone grupy"},
    "cuerpoStatDias": {"es": "Días con fuerza", "en": "Strength days", "fr": "Jours de renforcement", "de": "Krafttage", "it": "Giorni di forza", "nl": "Krachtdagen", "zh": "力量训练天数", "zht": "肌力訓練天數", "bg": "Дни със силови упражнения", "pl": "Dni treningu siłowego"},
    "cuerpoRecoAdulto": {"es": "La OMS (2020) y el ACSM (2026) recomiendan a los adultos ejercicios de fuerza al menos 2 días por semana, con todos los grupos musculares principales.", "en": "The WHO (2020) and the ACSM (2026) recommend that adults do strength exercises on at least 2 days a week, working all the major muscle groups.", "fr": "L’OMS (2020) et l’ACSM (2026) recommandent aux adultes des exercices de renforcement musculaire qui sollicitent tous les grands groupes musculaires, au moins 2 jours par semaine.", "de": "Die WHO (2020) und das ACSM (2026) empfehlen Erwachsenen an mindestens 2 Tagen pro Woche Krafttraining, bei dem alle großen Muskelgruppen beansprucht werden.", "it": "L’OMS (2020) e l’ACSM (2026) raccomandano agli adulti esercizi di forza che coinvolgano tutti i principali gruppi muscolari, almeno 2 giorni a settimana.", "nl": "De WHO (2020) en het ACSM (2026) raden volwassenen aan om minstens 2 dagen per week krachtoefeningen te doen waarbij alle grote spiergroepen aan bod komen.", "zh": "世卫组织（2020）和美国运动医学会（ACSM，2026）建议成年人每周至少 2 天进行力量训练，并锻炼所有主要肌群。", "zht": "世界衛生組織（2020）和美國運動醫學會（ACSM，2026）建議成年人每週至少 2 天進行肌力訓練，並鍛鍊所有主要肌群。", "bg": "СЗО (2020) и ACSM (2026) препоръчват на възрастните силови упражнения поне 2 дни седмично, с участието на всички основни мускулни групи.", "pl": "WHO (2020) i ACSM (2026) zalecają dorosłym ćwiczenia siłowe co najmniej 2 dni w tygodniu, angażujące wszystkie główne grupy mięśni."},
    "cuerpoRecoJoven": {"es": "La OMS (2020) recomienda de 5 a 17 años actividades que fortalezcan los músculos y los huesos al menos 3 días por semana.", "en": "For ages 5 to 17, the WHO (2020) recommends activities that strengthen muscles and bones on at least 3 days a week.", "fr": "De 5 à 17 ans, l’OMS (2020) recommande des activités qui renforcent les muscles et les os au moins 3 jours par semaine.", "de": "Für 5- bis 17-Jährige empfiehlt die WHO (2020) an mindestens 3 Tagen pro Woche Aktivitäten, die Muskeln und Knochen stärken.", "it": "Dai 5 ai 17 anni l’OMS (2020) raccomanda attività che rafforzino muscoli e ossa almeno 3 giorni a settimana.", "nl": "Voor 5- tot 17-jarigen raadt de WHO (2020) minstens 3 dagen per week activiteiten aan die spieren en botten versterken.", "zh": "世卫组织（2020）建议 5–17 岁的儿童青少年每周至少 3 天进行增强肌肉和骨骼的活动。", "zht": "世界衛生組織（2020）建議 5–17 歲的兒童及青少年每週至少 3 天進行強化肌肉和骨骼的活動。", "bg": "За възрастта от 5 до 17 години СЗО (2020) препоръчва дейности, които укрепват мускулите и костите, поне 3 дни седмично.", "pl": "Dzieciom i młodzieży w wieku 5–17 lat WHO (2020) zaleca aktywności wzmacniające mięśnie i kości co najmniej 3 dni w tygodniu."},
    "cuerpoRefSeries": {"es": "Para ganar músculo, el ACSM (2026) indica a los adultos sanos al menos 10 series por grupo muscular y semana; pasadas unas 18–20, lo que se gana es cada vez menos.", "en": "To build muscle, the ACSM (2026) advises healthy adults to do at least 10 sets per muscle group per week; beyond about 18–20, the extra gains get smaller.", "fr": "Pour prendre du muscle, l’ACSM (2026) indique aux adultes en bonne santé au moins 10 séries par groupe musculaire et par semaine ; au-delà d’environ 18 à 20, le gain supplémentaire diminue.", "de": "Für Muskelaufbau nennt das ACSM (2026) gesunden Erwachsenen mindestens 10 Sätze pro Muskelgruppe und Woche; über etwa 18–20 hinaus wird der zusätzliche Gewinn immer kleiner.", "it": "Per aumentare la massa muscolare, l’ACSM (2026) indica agli adulti sani almeno 10 serie per gruppo muscolare a settimana; oltre circa 18–20 il guadagno aggiuntivo si riduce.", "nl": "Voor spieropbouw noemt het ACSM (2026) voor gezonde volwassenen minstens 10 sets per spiergroep per week; boven ongeveer 18–20 wordt de extra winst steeds kleiner.", "zh": "对于增肌，ACSM（2026）建议健康成年人每个肌群每周至少 10 组；超过约 18–20 组后，额外收益会越来越小。", "zht": "若要增肌，ACSM（2026）建議健康成年人每個肌群每週至少 10 組；超過約 18–20 組後，額外效益會越來越小。", "bg": "За покачване на мускулна маса ACSM (2026) посочва за здравите възрастни поне 10 серии на мускулна група седмично; над около 18–20 допълнителната полза намалява.", "pl": "W budowaniu masy mięśniowej ACSM (2026) wskazuje zdrowym dorosłym co najmniej 10 serii na grupę mięśni tygodniowo; powyżej około 18–20 dodatkowy zysk jest coraz mniejszy."},
    "cuerpoFuentes": {"es": "Fuentes: OMS, directrices sobre actividad física y hábitos sedentarios (2020); ACSM, declaración de posición sobre el entrenamiento de fuerza (2026).", "en": "Sources: WHO guidelines on physical activity and sedentary behaviour (2020); ACSM position stand on resistance training (2026).", "fr": "Sources : OMS, lignes directrices sur l’activité physique et la sédentarité (2020) ; ACSM, prise de position sur l’entraînement en résistance (2026).", "de": "Quellen: WHO-Leitlinien zu körperlicher Aktivität und sitzendem Verhalten (2020); ACSM-Positionspapier zum Krafttraining (2026).", "it": "Fonti: OMS, linee guida su attività fisica e comportamenti sedentari (2020); ACSM, position stand sull’allenamento di forza (2026).", "nl": "Bronnen: WHO-richtlijnen voor lichaamsbeweging en sedentair gedrag (2020); ACSM-standpunt over krachttraining (2026).", "zh": "来源：世卫组织《关于身体活动和久坐行为的指南》（2020）；ACSM 抗阻训练立场声明（2026）。", "zht": "來源：世界衛生組織《身體活動和久坐行為指南》（2020）；ACSM 阻力訓練立場聲明（2026）。", "bg": "Източници: СЗО, насоки за физическа активност и заседнало поведение (2020); ACSM, позиция относно силовата тренировка (2026).", "pl": "Źródła: WHO, wytyczne dotyczące aktywności fizycznej i siedzącego trybu życia (2020); ACSM, stanowisko w sprawie treningu oporowego (2026)."},
    "cuerpoGruposTitulo": {"es": "Los 12 grupos musculares", "en": "The 12 muscle groups", "fr": "Les 12 groupes musculaires", "de": "Die 12 Muskelgruppen", "it": "I 12 gruppi muscolari", "nl": "De 12 spiergroepen", "zh": "12 个肌群", "zht": "12 個肌群", "bg": "12-те мускулни групи", "pl": "12 grup mięśni"},
    "cuerpoGruposAyuda": {"es": "Toque un músculo del dibujo o de la lista para anotar series.", "en": "Tap a muscle on the figure or in the list to log sets.", "fr": "Touchez un muscle sur le dessin ou dans la liste pour noter des séries.", "de": "Tippen Sie auf einen Muskel in der Figur oder in der Liste, um Sätze einzutragen.", "it": "Toccare un muscolo nel disegno o nell’elenco per annotare le serie.", "nl": "Tik op een spier in de tekening of in de lijst om sets te noteren.", "zh": "点按图中或列表中的肌肉即可记录组数。", "zht": "點按圖中或清單中的肌肉即可記錄組數。", "bg": "Докоснете мускул на фигурата или в списъка, за да запишете серии.", "pl": "Aby zapisać serie, wystarczy dotknąć mięśnia na rysunku lub na liście."},
    "cuerpoHoy": {"es": "hoy", "en": "today", "fr": "aujourd’hui", "de": "heute", "it": "oggi", "nl": "vandaag", "zh": "今天", "zht": "今天", "bg": "днес", "pl": "dziś"},
    "cuerpoAyer": {"es": "ayer", "en": "yesterday", "fr": "hier", "de": "gestern", "it": "ieri", "nl": "gisteren", "zh": "昨天", "zht": "昨天", "bg": "вчера", "pl": "wczoraj"},
    "cuerpoHaceDias": {"es": "hace {n} día|hace {n} días", "en": "{n} day ago|{n} days ago", "fr": "il y a {n} jour|il y a {n} jours", "de": "vor {n} Tag|vor {n} Tagen", "it": "{n} giorno fa|{n} giorni fa", "nl": "{n} dag geleden|{n} dagen geleden", "zh": "{n} 天前", "zht": "{n} 天前", "bg": "преди {n} ден|преди {n} дни", "pl": "{n} dzień temu|{n} dni temu|{n} dni temu"},
    "cuerpoSinAnotar": {"es": "sin anotar", "en": "nothing logged", "fr": "rien de noté", "de": "nichts eingetragen", "it": "nessuna annotazione", "nl": "niets genoteerd", "zh": "尚无记录", "zht": "尚無紀錄", "bg": "няма записи", "pl": "brak wpisów"},
    "cuerpoNSeries": {"es": "{n} serie|{n} series", "en": "{n} set|{n} sets", "fr": "{n} série|{n} séries", "de": "{n} Satz|{n} Sätze", "it": "{n} serie|{n} serie", "nl": "{n} set|{n} sets", "zh": "{n} 组", "zht": "{n} 組", "bg": "{n} серия|{n} серии", "pl": "{n} seria|{n} serie|{n} serii"},
    "cuerpoG_pecho": {"es": "Pecho", "en": "Chest", "fr": "Pectoraux", "de": "Brust", "it": "Petto", "nl": "Borst", "zh": "胸部", "zht": "胸部", "bg": "Гърди", "pl": "Klatka piersiowa"},
    "cuerpoG_dorsal": {"es": "Dorsales", "en": "Lats", "fr": "Dorsaux", "de": "Breiter Rückenmuskel", "it": "Dorsali", "nl": "Brede rugspier", "zh": "背阔肌", "zht": "闊背肌", "bg": "Широк гръбен мускул", "pl": "Najszerszy grzbietu"},
    "cuerpoG_espalda_alta": {"es": "Espalda alta y trapecio", "en": "Upper back and traps", "fr": "Haut du dos et trapèzes", "de": "Oberer Rücken und Trapez", "it": "Parte alta della schiena e trapezio", "nl": "Bovenrug en trapezius", "zh": "上背部和斜方肌", "zht": "上背部和斜方肌", "bg": "Горна част на гърба и трапец", "pl": "Górna część pleców i czworoboczny"},
    "cuerpoG_hombros": {"es": "Hombros", "en": "Shoulders", "fr": "Épaules", "de": "Schultern", "it": "Spalle", "nl": "Schouders", "zh": "肩部", "zht": "肩部", "bg": "Рамене", "pl": "Barki"},
    "cuerpoG_biceps": {"es": "Bíceps", "en": "Biceps", "fr": "Biceps", "de": "Bizeps", "it": "Bicipiti", "nl": "Biceps", "zh": "肱二头肌", "zht": "肱二頭肌", "bg": "Бицепс", "pl": "Biceps"},
    "cuerpoG_triceps": {"es": "Tríceps", "en": "Triceps", "fr": "Triceps", "de": "Trizeps", "it": "Tricipiti", "nl": "Triceps", "zh": "肱三头肌", "zht": "肱三頭肌", "bg": "Трицепс", "pl": "Triceps"},
    "cuerpoG_antebrazo": {"es": "Antebrazos", "en": "Forearms", "fr": "Avant-bras", "de": "Unterarme", "it": "Avambracci", "nl": "Onderarmen", "zh": "前臂", "zht": "前臂", "bg": "Предмишници", "pl": "Przedramiona"},
    "cuerpoG_core": {"es": "Abdomen y lumbares", "en": "Abs and lower back", "fr": "Abdos et lombaires", "de": "Bauch und unterer Rücken", "it": "Addome e zona lombare", "nl": "Buik en onderrug", "zh": "腹部和下背部", "zht": "腹部和下背部", "bg": "Корем и кръст", "pl": "Brzuch i lędźwie"},
    "cuerpoG_gluteos": {"es": "Glúteos y cadera", "en": "Glutes and hips", "fr": "Fessiers et hanches", "de": "Gesäß und Hüfte", "it": "Glutei e anca", "nl": "Bilspieren en heupen", "zh": "臀部和髋部", "zht": "臀部和髖部", "bg": "Седалище и ханш", "pl": "Pośladki i biodra"},
    "cuerpoG_cuadriceps": {"es": "Cuádriceps", "en": "Quadriceps", "fr": "Quadriceps", "de": "Quadrizeps", "it": "Quadricipiti", "nl": "Quadriceps", "zh": "股四头肌", "zht": "股四頭肌", "bg": "Квадрицепс", "pl": "Czworogłowy uda"},
    "cuerpoG_isquios": {"es": "Isquiotibiales", "en": "Hamstrings", "fr": "Ischio-jambiers", "de": "Beinbeuger", "it": "Femorali", "nl": "Hamstrings", "zh": "腘绳肌", "zht": "膕繩肌", "bg": "Задно бедро", "pl": "Tył uda"},
    "cuerpoG_pantorrilla": {"es": "Pantorrillas y espinillas", "en": "Calves and shins", "fr": "Mollets et tibias", "de": "Waden und Schienbeine", "it": "Polpacci e tibie", "nl": "Kuiten en schenen", "zh": "小腿", "zht": "小腿", "bg": "Прасци и пищяли", "pl": "Łydki i piszczele"},
    "cuerpoD_pecho": {"es": "Pectorales. Empujan los brazos hacia delante, como en las flexiones.", "en": "Pectoral muscles. They push the arms forward, as in press-ups.", "fr": "Muscles pectoraux. Ils poussent les bras vers l’avant, comme dans les pompes.", "de": "Brustmuskeln. Sie drücken die Arme nach vorne, wie bei Liegestützen.", "it": "Muscoli pettorali. Spingono le braccia in avanti, come nei piegamenti.", "nl": "Borstspieren. Ze duwen de armen naar voren, zoals bij opdrukken.", "zh": "胸肌。把手臂向前推，比如俯卧撑。", "zht": "胸肌。把手臂向前推，例如伏地挺身。", "bg": "Гръдни мускули. Изтласкват ръцете напред, както при лицевите опори.", "pl": "Mięśnie piersiowe. Pchają ramiona do przodu, jak przy pompkach."},
    "cuerpoD_dorsal": {"es": "Dorsal ancho y redondo mayor. Tiran de los brazos hacia abajo y atrás, como en las dominadas.", "en": "Latissimus dorsi and teres major. They pull the arms down and back, as in pull-ups.", "fr": "Grand dorsal et grand rond. Ils tirent les bras vers le bas et vers l’arrière, comme dans les tractions.", "de": "Breiter Rückenmuskel und großer Rundmuskel. Sie ziehen die Arme nach unten und hinten, wie bei Klimmzügen.", "it": "Gran dorsale e grande rotondo. Tirano le braccia in basso e indietro, come nelle trazioni.", "nl": "Brede rugspier en grote ronde spier. Ze trekken de armen naar beneden en naar achteren, zoals bij optrekken.", "zh": "背阔肌和大圆肌。把手臂向下、向后拉，比如引体向上。", "zht": "闊背肌和大圓肌。把手臂向下、向後拉，例如引體向上。", "bg": "Широк гръбен мускул и голям обл мускул. Дърпат ръцете надолу и назад, както при набиранията.", "pl": "Mięsień najszerszy grzbietu i mięsień obły większy. Ciągną ramiona w dół i do tyłu, jak przy podciąganiu."},
    "cuerpoD_espalda_alta": {"es": "Trapecio, romboides y serrato anterior. Mueven y sujetan el omóplato: lo llevan hacia atrás y hacia arriba, y el serrato lo pega a las costillas.", "en": "Trapezius, rhomboids and serratus anterior. They move and steady the shoulder blade: they draw it back and up, and the serratus holds it against the ribs.", "fr": "Trapèze, rhomboïdes et dentelé antérieur. Ils bougent et stabilisent l’omoplate : ils la tirent vers l’arrière et vers le haut, et le dentelé la plaque contre les côtes.", "de": "Trapezmuskel, Rautenmuskeln und vorderer Sägemuskel. Sie bewegen und stabilisieren das Schulterblatt: Sie ziehen es nach hinten und oben, und der Sägemuskel hält es an den Rippen.", "it": "Trapezio, romboidi e dentato anteriore. Muovono e stabilizzano la scapola: la portano indietro e in alto, e il dentato la tiene aderente alle costole.", "nl": "Trapezius, ruitvormige spieren en voorste zaagspier. Ze bewegen en stabiliseren het schouderblad: ze trekken het naar achteren en omhoog, en de zaagspier houdt het tegen de ribben.", "zh": "斜方肌、菱形肌和前锯肌。活动并稳定肩胛骨：把它向后、向上拉，前锯肌让它贴紧肋骨。", "zht": "斜方肌、菱形肌和前鋸肌。活動並穩定肩胛骨：把它向後、向上拉，前鋸肌讓它貼緊肋骨。", "bg": "Трапецовиден мускул, ромбовидни мускули и преден назъбен мускул. Движат и стабилизират лопатката: изтеглят я назад и нагоре, а назъбеният мускул я държи прилепена към ребрата.", "pl": "Mięsień czworoboczny, mięśnie równoległoboczne i mięsień zębaty przedni. Poruszają łopatką i ją stabilizują: ściągają ją do tyłu i unoszą, a zębaty przedni dociska ją do żeber."},
    "cuerpoD_hombros": {"es": "Deltoides y manguito rotador. El deltoides levanta el brazo hacia delante, hacia el lado y hacia atrás; el manguito lo gira y mantiene el hombro en su sitio.", "en": "Deltoids and rotator cuff. The deltoid raises the arm to the front, to the side and to the back; the cuff rotates it and keeps the shoulder joint in place.", "fr": "Deltoïdes et coiffe des rotateurs. Le deltoïde lève le bras vers l’avant, sur le côté et vers l’arrière ; la coiffe le fait tourner et maintient l’épaule en place.", "de": "Deltamuskeln und Rotatorenmanschette. Der Deltamuskel hebt den Arm nach vorne, zur Seite und nach hinten; die Manschette dreht ihn und hält das Schultergelenk an seinem Platz.", "it": "Deltoidi e cuffia dei rotatori. Il deltoide solleva il braccio in avanti, di lato e all’indietro; la cuffia lo ruota e tiene la spalla al suo posto.", "nl": "Deltaspieren en rotatorenmanchet. De deltaspier heft de arm naar voren, opzij en naar achteren; de manchet draait hem en houdt het schoudergewricht op zijn plaats.", "zh": "三角肌和肩袖。三角肌把手臂向前、向侧面和向后抬起；肩袖让手臂旋转，并把肩关节稳定在原位。", "zht": "三角肌和旋轉肌袖。三角肌把手臂向前、向側面和向後抬起；旋轉肌袖讓手臂旋轉，並把肩關節穩定在原位。", "bg": "Делтоидни мускули и ротаторен маншон. Делтоидният мускул повдига ръката напред, встрани и назад; маншонът я завърта и държи раменната става на място.", "pl": "Mięśnie naramienne i stożek rotatorów. Mięsień naramienny unosi ramię do przodu, w bok i do tyłu; stożek rotatorów obraca je i utrzymuje staw ramienny na miejscu."},
    "cuerpoD_biceps": {"es": "Bíceps y braquial. Doblan el codo.", "en": "Biceps and brachialis. They bend the elbow.", "fr": "Biceps et brachial. Ils fléchissent le coude.", "de": "Bizeps und Brachialis. Sie beugen den Ellbogen.", "it": "Bicipite e brachiale. Flettono il gomito.", "nl": "Biceps en brachialis. Ze buigen de elleboog.", "zh": "肱二头肌和肱肌。屈肘。", "zht": "肱二頭肌和肱肌。彎曲手肘。", "bg": "Бицепс и брахиален мускул. Сгъват лакътя.", "pl": "Biceps i mięsień ramienny. Zginają łokieć."},
    "cuerpoD_triceps": {"es": "Tríceps. Estira el codo.", "en": "Triceps. It straightens the elbow.", "fr": "Triceps. Il tend le coude.", "de": "Trizeps. Er streckt den Ellbogen.", "it": "Tricipite. Estende il gomito.", "nl": "Triceps. Hij strekt de elleboog.", "zh": "肱三头肌。伸肘。", "zht": "肱三頭肌。伸直手肘。", "bg": "Трицепс. Изпъва лакътя.", "pl": "Triceps. Prostuje łokieć."},
    "cuerpoD_antebrazo": {"es": "Braquiorradial y flexores y extensores de la muñeca y los dedos. Dan fuerza al agarre, y el braquiorradial ayuda a doblar el codo.", "en": "Brachioradialis and the wrist and finger flexors and extensors. They provide grip strength, and the brachioradialis helps bend the elbow.", "fr": "Brachio-radial et fléchisseurs et extenseurs du poignet et des doigts. Ils donnent la force de préhension, et le brachio-radial aide à fléchir le coude.", "de": "Brachioradialis sowie Beuger und Strecker von Handgelenk und Fingern. Sie sorgen für die Griffkraft, und der Brachioradialis hilft, den Ellbogen zu beugen.", "it": "Brachioradiale e flessori ed estensori di polso e dita. Danno forza alla presa, e il brachioradiale aiuta a flettere il gomito.", "nl": "Brachioradialis en de buigers en strekkers van pols en vingers. Ze zorgen voor grijpkracht, en de brachioradialis helpt de elleboog te buigen.", "zh": "肱桡肌以及腕和手指的屈肌与伸肌。提供握力，肱桡肌还帮助屈肘。", "zht": "肱橈肌以及手腕和手指的屈肌與伸肌。提供握力，肱橈肌還幫助彎曲手肘。", "bg": "Брахиорадиален мускул и сгъвачи и разгъвачи на китката и пръстите. Дават сила на хвата, а брахиорадиалният мускул помага за сгъването на лакътя.", "pl": "Mięsień ramienno-promieniowy oraz zginacze i prostowniki nadgarstka i palców. Dają siłę chwytu, a ramienno-promieniowy pomaga zginać łokieć."},
    "cuerpoD_core": {"es": "Recto del abdomen, oblicuos y lumbares. Doblan, giran y sostienen el tronco.", "en": "Rectus abdominis, obliques and lower-back muscles. They bend, twist and support the trunk.", "fr": "Grand droit de l’abdomen, obliques et lombaires. Ils fléchissent, tournent et maintiennent le tronc.", "de": "Gerader Bauchmuskel, schräge Bauchmuskeln und untere Rückenmuskeln. Sie beugen, drehen und stützen den Rumpf.", "it": "Retto dell’addome, obliqui e muscoli lombari. Flettono, ruotano e sostengono il tronco.", "nl": "Rechte buikspier, schuine buikspieren en onderrugspieren. Ze buigen, draaien en ondersteunen de romp.", "zh": "腹直肌、腹斜肌和下背部肌肉。让躯干弯曲、转动并保持稳定。", "zht": "腹直肌、腹斜肌和下背部肌肉。讓軀幹彎曲、轉動並保持穩定。", "bg": "Прав коремен мускул, коси коремни мускули и мускули на кръста. Сгъват, завъртат и поддържат тялото.", "pl": "Mięsień prosty brzucha, mięśnie skośne i mięśnie lędźwiowe. Zginają, skręcają i stabilizują tułów."},
    "cuerpoD_gluteos": {"es": "Glúteos y aductores. Extienden la cadera, separan la pierna y la acercan.", "en": "Glutes and adductors. They extend the hip and move the leg out and in.", "fr": "Fessiers et adducteurs. Ils étendent la hanche, écartent la jambe et la rapprochent.", "de": "Gesäßmuskeln und Adduktoren. Sie strecken die Hüfte und bewegen das Bein nach außen und innen.", "it": "Glutei e adduttori. Estendono l’anca, allontanano la gamba e la avvicinano.", "nl": "Bilspieren en adductoren. Ze strekken de heup en bewegen het been naar buiten en naar binnen.", "zh": "臀肌和内收肌。伸展髋关节，并让腿向外打开和向内收拢。", "zht": "臀肌和內收肌。伸展髖關節，並讓腿向外張開和向內收攏。", "bg": "Седалищни мускули и адуктори. Разгъват тазобедрената става, отвеждат крака встрани и го привеждат.", "pl": "Pośladki i przywodziciele. Prostują biodro, odwodzą i przywodzą nogę."},
    "cuerpoD_cuadriceps": {"es": "Cara delantera del muslo: cuádriceps y sartorio. El cuádriceps estira la rodilla.", "en": "Front of the thigh: quadriceps and sartorius. The quadriceps straightens the knee.", "fr": "Face avant de la cuisse : quadriceps et sartorius. Le quadriceps tend le genou.", "de": "Vorderseite des Oberschenkels: Quadrizeps und Schneidermuskel. Der Quadrizeps streckt das Knie.", "it": "Parte anteriore della coscia: quadricipite e sartorio. Il quadricipite estende il ginocchio.", "nl": "Voorkant van het bovenbeen: quadriceps en kleermakersspier. De quadriceps strekt de knie.", "zh": "大腿前侧：股四头肌和缝匠肌。股四头肌伸直膝关节。", "zht": "大腿前側：股四頭肌和縫匠肌。股四頭肌伸直膝蓋。", "bg": "Предна част на бедрото: квадрицепс и шивашки мускул. Квадрицепсът изпъва коляното.", "pl": "Przód uda: mięsień czworogłowy i krawiecki. Czworogłowy prostuje kolano."},
    "cuerpoD_isquios": {"es": "Cara trasera del muslo. Doblan la rodilla y extienden la cadera.", "en": "Back of the thigh. They bend the knee and extend the hip.", "fr": "Face arrière de la cuisse. Ils fléchissent le genou et étendent la hanche.", "de": "Rückseite des Oberschenkels. Sie beugen das Knie und strecken die Hüfte.", "it": "Parte posteriore della coscia. Flettono il ginocchio ed estendono l’anca.", "nl": "Achterkant van het bovenbeen. Ze buigen de knie en strekken de heup.", "zh": "大腿后侧。屈膝并伸展髋关节。", "zht": "大腿後側。彎曲膝蓋並伸展髖關節。", "bg": "Задни мускули на бедрото. Сгъват коляното и разгъват тазобедрената става.", "pl": "Mięśnie kulszowo-goleniowe. Zginają kolano i prostują biodro."},
    "cuerpoD_pantorrilla": {"es": "Gastrocnemio, sóleo, tibial anterior y peroneos. Mueven y sujetan el tobillo: ponerse de puntillas, levantar la punta del pie y girar la planta hacia fuera (los peroneos).", "en": "Gastrocnemius, soleus, tibialis anterior and fibularis muscles. They move and steady the ankle: rising onto the toes, lifting the front of the foot and turning the sole outwards (the fibularis).", "fr": "Gastrocnémiens, soléaire, tibial antérieur et fibulaires. Ils bougent et stabilisent la cheville : se mettre sur la pointe des pieds, relever l’avant du pied et tourner la plante vers l’extérieur (les fibulaires).", "de": "Zwillingswadenmuskel, Schollenmuskel, vorderer Schienbeinmuskel und Wadenbeinmuskeln. Sie bewegen und stabilisieren das Sprunggelenk: auf die Zehenspitzen gehen, die Fußspitze anheben und die Fußsohle nach außen drehen (die Wadenbeinmuskeln).", "it": "Gastrocnemio, soleo, tibiale anteriore e peronieri. Muovono e stabilizzano la caviglia: salire sulle punte, sollevare la punta del piede e ruotare la pianta verso l’esterno (i peronieri).", "nl": "Tweelingkuitspier, scholspier, voorste scheenbeenspier en kuitbeenspieren. Ze bewegen en stabiliseren de enkel: op de tenen gaan staan, de voorvoet optillen en de voetzool naar buiten draaien (de kuitbeenspieren).", "zh": "腓肠肌、比目鱼肌、胫骨前肌和腓骨肌。活动并稳定踝关节：踮起脚尖、勾起脚尖，以及让脚掌向外翻（腓骨肌）。", "zht": "腓腸肌、比目魚肌、脛前肌和腓骨肌。活動並穩定腳踝：踮起腳尖、勾起腳尖，以及讓腳掌向外翻（腓骨肌）。", "bg": "Двуглав прасцов мускул, камбаловиден мускул, преден тибиален мускул и перонеални мускули. Движат и стабилизират глезена: повдигане на пръсти, повдигане на предната част на ходилото и извъртане на ходилото навън (перонеалните мускули).", "pl": "Mięsień brzuchaty łydki, płaszczkowaty, piszczelowy przedni i mięśnie strzałkowe. Poruszają stawem skokowym i go stabilizują: wspięcie na palce, uniesienie przodu stopy i nawracanie stopy (mięśnie strzałkowe)."},
    "cuerpoStatSeries7": {"es": "Series, 7 días", "en": "Sets, 7 days", "fr": "Séries, 7 jours", "de": "Sätze, 7 Tage", "it": "Serie, 7 giorni", "nl": "Sets, 7 dagen", "zh": "组数（7 天）", "zht": "組數（7 天）", "bg": "Серии, 7 дни", "pl": "Serie, 7 dni"},
    "cuerpoStatDias7": {"es": "Días, 7 días", "en": "Days, 7 days", "fr": "Jours, 7 jours", "de": "Tage, 7 Tage", "it": "Giorni, 7 giorni", "nl": "Dagen, 7 dagen", "zh": "天数（7 天）", "zht": "天數（7 天）", "bg": "Дни, 7 дни", "pl": "Dni, 7 dni"},
    "cuerpoStatUltima": {"es": "Última vez", "en": "Last time", "fr": "Dernière fois", "de": "Zuletzt", "it": "Ultima volta", "nl": "Laatste keer", "zh": "上次", "zht": "上次", "bg": "Последно", "pl": "Ostatnio"},
    "cuerpoAnotar": {"es": "Anotar series", "en": "Log sets", "fr": "Noter des séries", "de": "Sätze eintragen", "it": "Annotare le serie", "nl": "Sets noteren", "zh": "记录组数", "zht": "記錄組數", "bg": "Записване на серии", "pl": "Zapisywanie serii"},
    "cuerpoCuantas": {"es": "Series", "en": "Sets", "fr": "Séries", "de": "Sätze", "it": "Serie", "nl": "Sets", "zh": "组数", "zht": "組數", "bg": "Серии", "pl": "Serie"},
    "cuerpoMenos": {"es": "Una serie menos", "en": "One fewer set", "fr": "Une série de moins", "de": "Ein Satz weniger", "it": "Una serie in meno", "nl": "Eén set minder", "zh": "减少一组", "zht": "減少一組", "bg": "Една серия по-малко", "pl": "Jedna seria mniej"},
    "cuerpoMas": {"es": "Una serie más", "en": "One more set", "fr": "Une série de plus", "de": "Ein Satz mehr", "it": "Una serie in più", "nl": "Eén set meer", "zh": "增加一组", "zht": "增加一組", "bg": "Една серия повече", "pl": "Jedna seria więcej"},
    "cuerpoCuando": {"es": "Cuándo", "en": "When", "fr": "Quand", "de": "Wann", "it": "Quando", "nl": "Wanneer", "zh": "时间", "zht": "時間", "bg": "Кога", "pl": "Kiedy"},
    "cuerpoHoyB": {"es": "Hoy", "en": "Today", "fr": "Aujourd’hui", "de": "Heute", "it": "Oggi", "nl": "Vandaag", "zh": "今天", "zht": "今天", "bg": "Днес", "pl": "Dziś"},
    "cuerpoAyerB": {"es": "Ayer", "en": "Yesterday", "fr": "Hier", "de": "Gestern", "it": "Ieri", "nl": "Gisteren", "zh": "昨天", "zht": "昨天", "bg": "Вчера", "pl": "Wczoraj"},
    "cuerpoGuardar": {"es": "Guardar", "en": "Save", "fr": "Enregistrer", "de": "Speichern", "it": "Salva", "nl": "Opslaan", "zh": "保存", "zht": "儲存", "bg": "Запази", "pl": "Zapisz"},
    "cuerpoAnotado": {"es": "{grupo}: {n} serie anotada|{grupo}: {n} series anotadas", "en": "{grupo}: {n} set logged|{grupo}: {n} sets logged", "fr": "{grupo} : {n} série notée|{grupo} : {n} séries notées", "de": "{grupo}: {n} Satz eingetragen|{grupo}: {n} Sätze eingetragen", "it": "{grupo}: {n} serie annotata|{grupo}: {n} serie annotate", "nl": "{grupo}: {n} set genoteerd|{grupo}: {n} sets genoteerd", "zh": "{grupo}：已记录 {n} 组", "zht": "{grupo}：已記錄 {n} 組", "bg": "{grupo}: записана {n} серия|{grupo}: записани {n} серии", "pl": "{grupo}: zapisano {n} serię|{grupo}: zapisano {n} serie|{grupo}: zapisano {n} serii"},
    "cuerpoHistorial": {"es": "Lo último anotado", "en": "Latest entries", "fr": "Dernières notes", "de": "Zuletzt eingetragen", "it": "Ultime annotazioni", "nl": "Laatst genoteerd", "zh": "最近记录", "zht": "最近紀錄", "bg": "Последни записи", "pl": "Ostatnie wpisy"},
    "cuerpoSinHistorial": {"es": "Aún no hay nada anotado en este grupo.", "en": "Nothing logged for this group yet.", "fr": "Rien n’est encore noté pour ce groupe.", "de": "Für diese Gruppe ist noch nichts eingetragen.", "it": "Ancora nessuna annotazione per questo gruppo.", "nl": "Voor deze groep is nog niets genoteerd.", "zh": "这个肌群还没有任何记录。", "zht": "這個肌群還沒有任何紀錄。", "bg": "Все още няма записи за тази група.", "pl": "W tej grupie nie ma jeszcze wpisów."},
    "cuerpoBorrarEntrada": {"es": "Borrar: {series}, {fecha}", "en": "Delete: {series}, {fecha}", "fr": "Supprimer : {series}, {fecha}", "de": "Löschen: {series}, {fecha}", "it": "Elimina: {series}, {fecha}", "nl": "Verwijderen: {series}, {fecha}", "zh": "删除：{series}，{fecha}", "zht": "刪除：{series}，{fecha}", "bg": "Изтрий: {series}, {fecha}", "pl": "Usuń: {series}, {fecha}"},
    "cuerpoEntradaBorrada": {"es": "Anotación borrada", "en": "Entry deleted", "fr": "Note supprimée", "de": "Eintrag gelöscht", "it": "Annotazione eliminata", "nl": "Notitie verwijderd", "zh": "记录已删除", "zht": "紀錄已刪除", "bg": "Записът е изтрит", "pl": "Wpis usunięty"},
    "cuerpoDeshacer": {"es": "Deshacer", "en": "Undo", "fr": "Annuler", "de": "Rückgängig", "it": "Annulla", "nl": "Ongedaan maken", "zh": "撤销", "zht": "復原", "bg": "Отмени", "pl": "Cofnij"},
    "cuerpoAspectoTitulo": {"es": "Su aspecto", "en": "Your look", "fr": "Votre apparence", "de": "Ihr Aussehen", "it": "Aspetto", "nl": "Uw uiterlijk", "zh": "我的外观", "zht": "我的外觀", "bg": "Вашият външен вид", "pl": "Wygląd"},
    "cuerpoAspectoLema": {"es": "Elija lo que más se le parezca. Solo cambia el dibujo.", "en": "Choose what looks most like you. Only the drawing changes.", "fr": "Choisissez ce qui vous ressemble le plus. Seul le dessin change.", "de": "Wählen Sie, was Ihnen am ähnlichsten ist. Nur die Zeichnung ändert sich.", "it": "Scegliere le opzioni più simili al proprio aspetto. Cambiano solo il disegno.", "nl": "Kies wat het meest op u lijkt. Alleen de tekening verandert.", "zh": "选择最像您的样子。只会改变图像。", "zht": "選擇最像您的樣子。只會改變圖像。", "bg": "Изберете това, което най-много прилича на вас. Променя се само рисунката.", "pl": "Można wybrać to, co najbardziej przypomina własny wygląd. Zmienia się tylko rysunek."},
    "cuerpoSecCuerpo": {"es": "Cuerpo", "en": "Body", "fr": "Corps", "de": "Körper", "it": "Corpo", "nl": "Lichaam", "zh": "身体", "zht": "身體", "bg": "Тяло", "pl": "Ciało"},
    "cuerpoSecCara": {"es": "Pelo y cara", "en": "Hair and face", "fr": "Cheveux et visage", "de": "Haare und Gesicht", "it": "Capelli e viso", "nl": "Haar en gezicht", "zh": "头发和面部", "zht": "頭髮和臉部", "bg": "Коса и лице", "pl": "Włosy i twarz"},
    "cuerpoSecRopa": {"es": "Ropa", "en": "Clothes", "fr": "Vêtements", "de": "Kleidung", "it": "Abbigliamento", "nl": "Kleding", "zh": "衣着", "zht": "衣著", "bg": "Облекло", "pl": "Ubranie"},
    "cuerpoSecAyudas": {"es": "Gafas y ayudas", "en": "Glasses and aids", "fr": "Lunettes et aides techniques", "de": "Brille und Hilfsmittel", "it": "Occhiali e ausili", "nl": "Bril en hulpmiddelen", "zh": "眼镜和辅助器具", "zht": "眼鏡和輔具", "bg": "Очила и помощни средства", "pl": "Okulary i pomoce"},
    "cuerpoOp_fig": {"es": "Silueta", "en": "Silhouette", "fr": "Silhouette", "de": "Silhouette", "it": "Silhouette", "nl": "Silhouet", "zh": "体型轮廓", "zht": "體型輪廓", "bg": "Силует", "pl": "Sylwetka"},
    "cuerpoOp_comp": {"es": "Complexión", "en": "Build", "fr": "Corpulence", "de": "Statur", "it": "Corporatura", "nl": "Lichaamsbouw", "zh": "体格", "zht": "體格", "bg": "Телосложение", "pl": "Budowa"},
    "cuerpoOp_piel": {"es": "Tono de piel", "en": "Skin tone", "fr": "Teint", "de": "Hautton", "it": "Carnagione", "nl": "Huidskleur", "zh": "肤色", "zht": "膚色", "bg": "Тен на кожата", "pl": "Odcień skóry"},
    "cuerpoOp_pelo": {"es": "Peinado", "en": "Hairstyle", "fr": "Coiffure", "de": "Frisur", "it": "Acconciatura", "nl": "Kapsel", "zh": "发型", "zht": "髮型", "bg": "Прическа", "pl": "Fryzura"},
    "cuerpoOp_peloColor": {"es": "Color del pelo", "en": "Hair colour", "fr": "Couleur des cheveux", "de": "Haarfarbe", "it": "Colore dei capelli", "nl": "Haarkleur", "zh": "发色", "zht": "髮色", "bg": "Цвят на косата", "pl": "Kolor włosów"},
    "cuerpoOp_barba": {"es": "Barba", "en": "Beard", "fr": "Barbe", "de": "Bart", "it": "Barba", "nl": "Baard", "zh": "胡子", "zht": "鬍子", "bg": "Брада", "pl": "Zarost"},
    "cuerpoOp_cabeza": {"es": "En la cabeza", "en": "On the head", "fr": "Sur la tête", "de": "Auf dem Kopf", "it": "In testa", "nl": "Op het hoofd", "zh": "头上", "zht": "頭上", "bg": "На главата", "pl": "Na głowie"},
    "cuerpoOp_gafas": {"es": "Gafas", "en": "Glasses", "fr": "Lunettes", "de": "Brille", "it": "Occhiali", "nl": "Bril", "zh": "眼镜", "zht": "眼鏡", "bg": "Очила", "pl": "Okulary"},
    "cuerpoOp_audifono": {"es": "Audífono", "en": "Hearing aid", "fr": "Appareil auditif", "de": "Hörgerät", "it": "Apparecchio acustico", "nl": "Hoortoestel", "zh": "助听器", "zht": "助聽器", "bg": "Слухов апарат", "pl": "Aparat słuchowy"},
    "cuerpoOp_protesis": {"es": "Prótesis", "en": "Prosthesis", "fr": "Prothèse", "de": "Prothese", "it": "Protesi", "nl": "Prothese", "zh": "假肢", "zht": "義肢", "bg": "Протеза", "pl": "Proteza"},
    "cuerpoOp_arriba": {"es": "Parte de arriba", "en": "Top", "fr": "Haut", "de": "Oberteil", "it": "Sopra", "nl": "Shirt", "zh": "上衣", "zht": "上衣", "bg": "Горнище", "pl": "Góra"},
    "cuerpoOp_arribaColor": {"es": "Color de arriba", "en": "Top colour", "fr": "Couleur du haut", "de": "Farbe des Oberteils", "it": "Colore sopra", "nl": "Kleur shirt", "zh": "上衣颜色", "zht": "上衣顏色", "bg": "Цвят на горнището", "pl": "Kolor góry"},
    "cuerpoOp_abajo": {"es": "Parte de abajo", "en": "Bottoms", "fr": "Bas", "de": "Unterteil", "it": "Sotto", "nl": "Broek", "zh": "下装", "zht": "下著", "bg": "Долнище", "pl": "Dół"},
    "cuerpoOp_abajoColor": {"es": "Color de abajo", "en": "Bottoms colour", "fr": "Couleur du bas", "de": "Farbe des Unterteils", "it": "Colore sotto", "nl": "Kleur broek", "zh": "下装颜色", "zht": "下著顏色", "bg": "Цвят на долнището", "pl": "Kolor dołu"},
    "cuerpoOp_calzado": {"es": "Calzado", "en": "Footwear", "fr": "Chaussures", "de": "Schuhe", "it": "Scarpe", "nl": "Schoenen", "zh": "鞋子", "zht": "鞋子", "bg": "Обувки", "pl": "Obuwie"},
    "cuerpoOp_calzadoColor": {"es": "Color del calzado", "en": "Footwear colour", "fr": "Couleur des chaussures", "de": "Schuhfarbe", "it": "Colore delle scarpe", "nl": "Kleur schoenen", "zh": "鞋子颜色", "zht": "鞋子顏色", "bg": "Цвят на обувките", "pl": "Kolor obuwia"},
    "cuerpoFig_a": {"es": "Hombros más anchos", "en": "Broader shoulders", "fr": "Épaules plus larges", "de": "Breitere Schultern", "it": "Spalle più larghe", "nl": "Bredere schouders", "zh": "肩部较宽", "zht": "肩膀較寬", "bg": "По-широки рамене", "pl": "Szersze barki"},
    "cuerpoFig_b": {"es": "Caderas más anchas", "en": "Broader hips", "fr": "Hanches plus larges", "de": "Breitere Hüften", "it": "Fianchi più larghi", "nl": "Bredere heupen", "zh": "臀部较宽", "zht": "臀部較寬", "bg": "По-широк ханш", "pl": "Szersze biodra"},
    "cuerpoComp_0": {"es": "Delgada", "en": "Slim", "fr": "Mince", "de": "Schmal", "it": "Snella", "nl": "Slank", "zh": "偏瘦", "zht": "偏瘦", "bg": "Слабо", "pl": "Szczupła"},
    "cuerpoComp_1": {"es": "Media", "en": "Medium", "fr": "Moyenne", "de": "Mittel", "it": "Media", "nl": "Gemiddeld", "zh": "中等", "zht": "中等", "bg": "Средно", "pl": "Średnia"},
    "cuerpoComp_2": {"es": "Ancha", "en": "Broad", "fr": "Large", "de": "Breit", "it": "Robusta", "nl": "Breed", "zh": "偏壮", "zht": "偏壯", "bg": "Едро", "pl": "Masywna"},
    "cuerpoPelo_calvo": {"es": "Sin pelo", "en": "No hair", "fr": "Sans cheveux", "de": "Keine Haare", "it": "Senza capelli", "nl": "Geen haar", "zh": "光头", "zht": "光頭", "bg": "Без коса", "pl": "Bez włosów"},
    "cuerpoPelo_rapado": {"es": "Rapado", "en": "Buzz cut", "fr": "Rasés", "de": "Kurz geschoren", "it": "Rasati", "nl": "Gemillimeterd", "zh": "寸头", "zht": "平頭", "bg": "Много къса", "pl": "Na jeża"},
    "cuerpoPelo_corto": {"es": "Corto", "en": "Short", "fr": "Courts", "de": "Kurz", "it": "Corti", "nl": "Kort", "zh": "短发", "zht": "短髮", "bg": "Къса", "pl": "Krótkie"},
    "cuerpoPelo_medio": {"es": "Media melena", "en": "Bob", "fr": "Carré", "de": "Bob", "it": "Caschetto", "nl": "Bob", "zh": "波波头", "zht": "鮑伯頭", "bg": "Каре", "pl": "Bob"},
    "cuerpoPelo_largo": {"es": "Largo", "en": "Long", "fr": "Longs", "de": "Lang", "it": "Lunghi", "nl": "Lang", "zh": "长发", "zht": "長髮", "bg": "Дълга", "pl": "Długie"},
    "cuerpoPelo_rizado": {"es": "Rizado", "en": "Curly", "fr": "Bouclés", "de": "Lockig", "it": "Ricci", "nl": "Krullen", "zh": "卷发", "zht": "捲髮", "bg": "Къдрава", "pl": "Kręcone"},
    "cuerpoPelo_afro": {"es": "Afro", "en": "Afro", "fr": "Afro", "de": "Afro", "it": "Afro", "nl": "Afro", "zh": "爆炸头", "zht": "爆炸頭", "bg": "Афро", "pl": "Afro"},
    "cuerpoPelo_mono": {"es": "Moño", "en": "Bun", "fr": "Chignon", "de": "Dutt", "it": "Chignon", "nl": "Knot", "zh": "发髻", "zht": "髮髻", "bg": "Кок", "pl": "Kok"},
    "cuerpoPelo_coleta": {"es": "Coleta", "en": "Ponytail", "fr": "Queue-de-cheval", "de": "Pferdeschwanz", "it": "Coda", "nl": "Paardenstaart", "zh": "马尾", "zht": "馬尾", "bg": "Опашка", "pl": "Kucyk"},
    "cuerpoPelo_trenzas": {"es": "Trenzas", "en": "Plaits", "fr": "Tresses", "de": "Zöpfe", "it": "Trecce", "nl": "Vlechten", "zh": "辫子", "zht": "辮子", "bg": "Плитки", "pl": "Warkocze"},
    "cuerpoBarba_no": {"es": "Sin barba", "en": "No beard", "fr": "Sans barbe", "de": "Kein Bart", "it": "Senza barba", "nl": "Geen baard", "zh": "无胡子", "zht": "無鬍子", "bg": "Без брада", "pl": "Bez zarostu"},
    "cuerpoBarba_bigote": {"es": "Bigote", "en": "Moustache", "fr": "Moustache", "de": "Schnurrbart", "it": "Baffi", "nl": "Snor", "zh": "八字胡", "zht": "八字鬍", "bg": "Мустаци", "pl": "Wąsy"},
    "cuerpoBarba_perilla": {"es": "Perilla", "en": "Goatee", "fr": "Bouc", "de": "Spitzbart", "it": "Pizzetto", "nl": "Sik", "zh": "山羊胡", "zht": "山羊鬍", "bg": "Козя брадичка", "pl": "Kozia bródka"},
    "cuerpoBarba_corta": {"es": "Barba corta", "en": "Short beard", "fr": "Barbe courte", "de": "Kurzer Bart", "it": "Barba corta", "nl": "Korte baard", "zh": "短胡子", "zht": "短鬍子", "bg": "Къса брада", "pl": "Krótka broda"},
    "cuerpoBarba_larga": {"es": "Barba larga", "en": "Long beard", "fr": "Barbe longue", "de": "Langer Bart", "it": "Barba lunga", "nl": "Lange baard", "zh": "长胡子", "zht": "長鬍子", "bg": "Дълга брада", "pl": "Długa broda"},
    "cuerpoCabeza_no": {"es": "Nada", "en": "Nothing", "fr": "Rien", "de": "Nichts", "it": "Niente", "nl": "Niets", "zh": "无", "zht": "無", "bg": "Нищо", "pl": "Nic"},
    "cuerpoCabeza_gorra": {"es": "Gorra", "en": "Cap", "fr": "Casquette", "de": "Kappe", "it": "Cappellino", "nl": "Pet", "zh": "鸭舌帽", "zht": "棒球帽", "bg": "Шапка с козирка", "pl": "Czapka z daszkiem"},
    "cuerpoCabeza_panuelo": {"es": "Pañuelo", "en": "Headscarf", "fr": "Foulard", "de": "Kopftuch", "it": "Foulard", "nl": "Hoofddoek", "zh": "头巾", "zht": "頭巾", "bg": "Забрадка", "pl": "Chusta"},
    "cuerpoGafas_no": {"es": "Sin gafas", "en": "No glasses", "fr": "Sans lunettes", "de": "Keine Brille", "it": "Senza occhiali", "nl": "Geen bril", "zh": "不戴眼镜", "zht": "不戴眼鏡", "bg": "Без очила", "pl": "Bez okularów"},
    "cuerpoGafas_gafas": {"es": "Gafas", "en": "Glasses", "fr": "Lunettes", "de": "Brille", "it": "Occhiali", "nl": "Bril", "zh": "眼镜", "zht": "眼鏡", "bg": "Очила", "pl": "Okulary"},
    "cuerpoGafas_sol": {"es": "Gafas de sol", "en": "Sunglasses", "fr": "Lunettes de soleil", "de": "Sonnenbrille", "it": "Occhiali da sole", "nl": "Zonnebril", "zh": "太阳镜", "zht": "太陽眼鏡", "bg": "Слънчеви очила", "pl": "Okulary przeciwsłoneczne"},
    "cuerpoAudif_no": {"es": "Sin audífono", "en": "No hearing aid", "fr": "Sans appareil", "de": "Kein Hörgerät", "it": "Nessuno", "nl": "Geen hoortoestel", "zh": "无", "zht": "無", "bg": "Без апарат", "pl": "Brak"},
    "cuerpoAudif_izq": {"es": "Oído izquierdo", "en": "Left ear", "fr": "Oreille gauche", "de": "Linkes Ohr", "it": "Orecchio sinistro", "nl": "Linkeroor", "zh": "左耳", "zht": "左耳", "bg": "Ляво ухо", "pl": "Lewe ucho"},
    "cuerpoAudif_der": {"es": "Oído derecho", "en": "Right ear", "fr": "Oreille droite", "de": "Rechtes Ohr", "it": "Orecchio destro", "nl": "Rechteroor", "zh": "右耳", "zht": "右耳", "bg": "Дясно ухо", "pl": "Prawe ucho"},
    "cuerpoAudif_ambos": {"es": "Los dos oídos", "en": "Both ears", "fr": "Les deux oreilles", "de": "Beide Ohren", "it": "Entrambe le orecchie", "nl": "Beide oren", "zh": "双耳", "zht": "雙耳", "bg": "Двете уши", "pl": "Oba uszy"},
    "cuerpoProt_no": {"es": "Sin prótesis", "en": "No prosthesis", "fr": "Sans prothèse", "de": "Keine Prothese", "it": "Nessuna", "nl": "Geen prothese", "zh": "无", "zht": "無", "bg": "Без протеза", "pl": "Brak"},
    "cuerpoProt_pierna_izq": {"es": "Pierna izquierda", "en": "Left leg", "fr": "Jambe gauche", "de": "Linkes Bein", "it": "Gamba sinistra", "nl": "Linkerbeen", "zh": "左腿", "zht": "左腿", "bg": "Ляв крак", "pl": "Lewa noga"},
    "cuerpoProt_pierna_der": {"es": "Pierna derecha", "en": "Right leg", "fr": "Jambe droite", "de": "Rechtes Bein", "it": "Gamba destra", "nl": "Rechterbeen", "zh": "右腿", "zht": "右腿", "bg": "Десен крак", "pl": "Prawa noga"},
    "cuerpoProt_brazo_izq": {"es": "Brazo izquierdo", "en": "Left arm", "fr": "Bras gauche", "de": "Linker Arm", "it": "Braccio sinistro", "nl": "Linkerarm", "zh": "左臂", "zht": "左臂", "bg": "Лява ръка", "pl": "Lewa ręka"},
    "cuerpoProt_brazo_der": {"es": "Brazo derecho", "en": "Right arm", "fr": "Bras droit", "de": "Rechter Arm", "it": "Braccio destro", "nl": "Rechterarm", "zh": "右臂", "zht": "右臂", "bg": "Дясна ръка", "pl": "Prawa ręka"},
    "cuerpoArriba_camiseta": {"es": "Camiseta", "en": "T-shirt", "fr": "T-shirt", "de": "T-Shirt", "it": "Maglietta", "nl": "T-shirt", "zh": "T恤", "zht": "T恤", "bg": "Тениска", "pl": "Koszulka"},
    "cuerpoArriba_tirantes": {"es": "Camiseta de tirantes", "en": "Vest", "fr": "Débardeur", "de": "Tanktop", "it": "Canottiera", "nl": "Tanktop", "zh": "背心", "zht": "背心", "bg": "Потник", "pl": "Koszulka na ramiączkach"},
    "cuerpoArriba_top": {"es": "Top deportivo", "en": "Sports bra", "fr": "Brassière de sport", "de": "Sporttop", "it": "Top sportivo", "nl": "Sporttop", "zh": "运动内衣", "zht": "運動內衣", "bg": "Спортно бюстие", "pl": "Top sportowy"},
    "cuerpoArriba_manga_larga": {"es": "Manga larga", "en": "Long sleeves", "fr": "Manches longues", "de": "Langarm", "it": "Maniche lunghe", "nl": "Lange mouwen", "zh": "长袖", "zht": "長袖", "bg": "Дълъг ръкав", "pl": "Długi rękaw"},
    "cuerpoArriba_sin": {"es": "Sin camiseta", "en": "No top", "fr": "Sans haut", "de": "Ohne Oberteil", "it": "Senza maglietta", "nl": "Geen shirt", "zh": "不穿上衣", "zht": "不穿上衣", "bg": "Без горнище", "pl": "Bez koszulki"},
    "cuerpoAbajo_corto": {"es": "Pantalón corto", "en": "Shorts", "fr": "Short", "de": "Kurze Hose", "it": "Pantaloncini", "nl": "Korte broek", "zh": "短裤", "zht": "短褲", "bg": "Къси панталони", "pl": "Krótkie spodenki"},
    "cuerpoAbajo_mallas_cortas": {"es": "Mallas cortas", "en": "Short leggings", "fr": "Cycliste", "de": "Kurze Leggings", "it": "Leggings corti", "nl": "Korte legging", "zh": "短款紧身裤", "zht": "短版緊身褲", "bg": "Къс клин", "pl": "Krótkie legginsy"},
    "cuerpoAbajo_mallas": {"es": "Mallas largas", "en": "Long leggings", "fr": "Legging", "de": "Lange Leggings", "it": "Leggings lunghi", "nl": "Lange legging", "zh": "长款紧身裤", "zht": "長版緊身褲", "bg": "Дълъг клин", "pl": "Długie legginsy"},
    "cuerpoAbajo_largo": {"es": "Pantalón largo", "en": "Trousers", "fr": "Pantalon", "de": "Lange Hose", "it": "Pantaloni lunghi", "nl": "Lange broek", "zh": "长裤", "zht": "長褲", "bg": "Дълги панталони", "pl": "Długie spodnie"},
    "cuerpoCalzado_zapatillas": {"es": "Zapatillas", "en": "Trainers", "fr": "Baskets", "de": "Turnschuhe", "it": "Scarpe da ginnastica", "nl": "Sportschoenen", "zh": "运动鞋", "zht": "運動鞋", "bg": "Маратонки", "pl": "Buty sportowe"},
    "cuerpoCalzado_botas": {"es": "Botas de montaña", "en": "Hiking boots", "fr": "Chaussures de randonnée", "de": "Wanderschuhe", "it": "Scarponi da trekking", "nl": "Wandelschoenen", "zh": "登山靴", "zht": "登山靴", "bg": "Туристически обувки", "pl": "Buty trekkingowe"},
    "cuerpoCalzado_descalzo": {"es": "Sin calzado", "en": "No shoes", "fr": "Pieds nus", "de": "Barfuß", "it": "A piedi nudi", "nl": "Blootsvoets", "zh": "赤脚", "zht": "赤腳", "bg": "Без обувки", "pl": "Boso"},
    "cuerpoPeloC_0": {"es": "Negro", "en": "Black", "fr": "Noirs", "de": "Schwarz", "it": "Neri", "nl": "Zwart", "zh": "黑色", "zht": "黑色", "bg": "Черна", "pl": "Czarne"},
    "cuerpoPeloC_1": {"es": "Castaño oscuro", "en": "Dark brown", "fr": "Châtain foncé", "de": "Dunkelbraun", "it": "Castano scuro", "nl": "Donkerbruin", "zh": "深棕色", "zht": "深棕色", "bg": "Тъмнокестенява", "pl": "Ciemnobrązowe"},
    "cuerpoPeloC_2": {"es": "Castaño", "en": "Brown", "fr": "Châtains", "de": "Braun", "it": "Castani", "nl": "Bruin", "zh": "棕色", "zht": "棕色", "bg": "Кестенява", "pl": "Brązowe"},
    "cuerpoPeloC_3": {"es": "Rubio oscuro", "en": "Dark blond", "fr": "Blond foncé", "de": "Dunkelblond", "it": "Biondo scuro", "nl": "Donkerblond", "zh": "深金色", "zht": "深金色", "bg": "Тъмноруса", "pl": "Ciemny blond"},
    "cuerpoPeloC_4": {"es": "Rubio", "en": "Blond", "fr": "Blonds", "de": "Blond", "it": "Biondi", "nl": "Blond", "zh": "金色", "zht": "金色", "bg": "Руса", "pl": "Blond"},
    "cuerpoPeloC_5": {"es": "Pelirrojo", "en": "Red", "fr": "Roux", "de": "Rot", "it": "Rossi", "nl": "Rood", "zh": "红色", "zht": "紅色", "bg": "Рижа", "pl": "Rude"},
    "cuerpoPeloC_6": {"es": "Gris", "en": "Grey", "fr": "Gris", "de": "Grau", "it": "Grigi", "nl": "Grijs", "zh": "灰色", "zht": "灰色", "bg": "Сива", "pl": "Siwe"},
    "cuerpoPeloC_7": {"es": "Blanco", "en": "White", "fr": "Blancs", "de": "Weiß", "it": "Bianchi", "nl": "Wit", "zh": "白色", "zht": "白色", "bg": "Бяла", "pl": "Białe"},
    "cuerpoPeloC_8": {"es": "Azul", "en": "Blue", "fr": "Bleus", "de": "Blau", "it": "Blu", "nl": "Blauw", "zh": "蓝色", "zht": "藍色", "bg": "Синя", "pl": "Niebieskie"},
    "cuerpoPeloC_9": {"es": "Rosa", "en": "Pink", "fr": "Roses", "de": "Rosa", "it": "Rosa", "nl": "Roze", "zh": "粉色", "zht": "粉紅色", "bg": "Розова", "pl": "Różowe"},
    "cuerpoColor_0": {"es": "Negro", "en": "Black", "fr": "Noir", "de": "Schwarz", "it": "Nero", "nl": "Zwart", "zh": "黑色", "zht": "黑色", "bg": "Черно", "pl": "Czarny"},
    "cuerpoColor_1": {"es": "Gris", "en": "Grey", "fr": "Gris", "de": "Grau", "it": "Grigio", "nl": "Grijs", "zh": "灰色", "zht": "灰色", "bg": "Сиво", "pl": "Szary"},
    "cuerpoColor_2": {"es": "Blanco", "en": "White", "fr": "Blanc", "de": "Weiß", "it": "Bianco", "nl": "Wit", "zh": "白色", "zht": "白色", "bg": "Бяло", "pl": "Biały"},
    "cuerpoColor_3": {"es": "Azul marino", "en": "Navy", "fr": "Bleu marine", "de": "Marineblau", "it": "Blu navy", "nl": "Marineblauw", "zh": "藏青色", "zht": "海軍藍", "bg": "Тъмносиньо", "pl": "Granatowy"},
    "cuerpoColor_4": {"es": "Azul", "en": "Blue", "fr": "Bleu", "de": "Blau", "it": "Blu", "nl": "Blauw", "zh": "蓝色", "zht": "藍色", "bg": "Синьо", "pl": "Niebieski"},
    "cuerpoColor_5": {"es": "Turquesa", "en": "Turquoise", "fr": "Turquoise", "de": "Türkis", "it": "Turchese", "nl": "Turquoise", "zh": "绿松石色", "zht": "土耳其藍", "bg": "Тюркоазено", "pl": "Turkusowy"},
    "cuerpoColor_6": {"es": "Verde", "en": "Green", "fr": "Vert", "de": "Grün", "it": "Verde", "nl": "Groen", "zh": "绿色", "zht": "綠色", "bg": "Зелено", "pl": "Zielony"},
    "cuerpoColor_7": {"es": "Dorado", "en": "Gold", "fr": "Doré", "de": "Gold", "it": "Oro", "nl": "Goud", "zh": "金色", "zht": "金色", "bg": "Златисто", "pl": "Złoty"},
    "cuerpoColor_8": {"es": "Rojo", "en": "Red", "fr": "Rouge", "de": "Rot", "it": "Rosso", "nl": "Rood", "zh": "红色", "zht": "紅色", "bg": "Червено", "pl": "Czerwony"},
    "cuerpoColor_9": {"es": "Rosa", "en": "Pink", "fr": "Rose", "de": "Rosa", "it": "Rosa", "nl": "Roze", "zh": "粉色", "zht": "粉紅色", "bg": "Розово", "pl": "Różowy"},
    "cuerpoPielTono": {"es": "Tono {n} de 10", "en": "Tone {n} of 10", "fr": "Teinte {n} sur 10", "de": "Ton {n} von 10", "it": "Tono {n} di 10", "nl": "Tint {n} van 10", "zh": "色调 {n}/10", "zht": "色調 {n}/10", "bg": "Тон {n} от 10", "pl": "Odcień {n} z 10"},
    "cuerpoPielNoRealista": {"es": "Tono no realista", "en": "Non-realistic tone", "fr": "Teinte non réaliste", "de": "Nicht realistischer Ton", "it": "Tono non realistico", "nl": "Niet-realistische tint", "zh": "非写实色调", "zht": "非寫實色調", "bg": "Нереалистичен тон", "pl": "Odcień nierealistyczny"},
    "cuerpoPielAyuda": {"es": "Del más claro (1) al más oscuro (10).", "en": "From lightest (1) to darkest (10).", "fr": "De la plus claire (1) à la plus foncée (10).", "de": "Vom hellsten (1) bis zum dunkelsten (10).", "it": "Dal più chiaro (1) al più scuro (10).", "nl": "Van de lichtste (1) tot de donkerste (10).", "zh": "从最浅（1）到最深（10）。", "zht": "從最淺（1）到最深（10）。", "bg": "От най-светлия (1) до най-тъмния (10).", "pl": "Od najjaśniejszego (1) do najciemniejszego (10)."},
    "cuerpoAlAzar": {"es": "Al azar", "en": "Random", "fr": "Au hasard", "de": "Zufällig", "it": "A caso", "nl": "Willekeurig", "zh": "随机", "zht": "隨機", "bg": "Случайно", "pl": "Losowo"},
    "cuerpoListo": {"es": "Listo", "en": "Done", "fr": "Terminé", "de": "Fertig", "it": "Fatto", "nl": "Klaar", "zh": "完成", "zht": "完成", "bg": "Готово", "pl": "Gotowe"},
    "cuerpoPrivacidad": {"es": "Todo se guarda solo en este dispositivo. No se sube a ninguna parte.", "en": "Everything is saved on this device only. Nothing is uploaded.", "fr": "Tout est enregistré uniquement sur cet appareil. Rien n’est envoyé.", "de": "Alles wird nur auf diesem Gerät gespeichert. Nichts wird hochgeladen.", "it": "Tutto viene salvato solo su questo dispositivo. Non viene caricato nulla.", "nl": "Alles wordt alleen op dit apparaat opgeslagen. Er wordt niets geüpload.", "zh": "所有内容只保存在本设备上，不会上传。", "zht": "所有內容只儲存在此裝置上，不會上傳。", "bg": "Всичко се пази само на това устройство. Нищо не се качва.", "pl": "Wszystko jest zapisywane tylko na tym urządzeniu. Nic nie jest wysyłane."},
    "cuerpoAviso": {"es": "Información general para personas sanas. No sustituye el consejo de un profesional sanitario.", "en": "General information for healthy people. It does not replace advice from a health professional.", "fr": "Informations générales destinées aux personnes en bonne santé. Elles ne remplacent pas l’avis d’un professionnel de santé.", "de": "Allgemeine Informationen für gesunde Menschen. Sie ersetzen nicht den Rat medizinischer Fachleute.", "it": "Informazioni generali per persone in buona salute. Non sostituiscono il parere di un professionista sanitario.", "nl": "Algemene informatie voor gezonde mensen. Dit vervangt niet het advies van een zorgprofessional.", "zh": "面向健康人群的一般信息，不能替代医疗专业人员的建议。", "zht": "提供給健康人士的一般資訊，不能取代醫療專業人員的建議。", "bg": "Обща информация за здрави хора. Не замества съвета на медицински специалист.", "pl": "Ogólne informacje dla osób zdrowych. Nie zastępują porady pracownika ochrony zdrowia."},
    "cuerpoIA": {"es": "Preparado con ayuda de IA a partir de las fuentes citadas.", "en": "Prepared with the help of AI from the sources cited.", "fr": "Préparé avec l’aide de l’IA à partir des sources citées.", "de": "Mit Hilfe von KI auf Grundlage der angegebenen Quellen erstellt.", "it": "Preparato con l’aiuto dell’IA a partire dalle fonti citate.", "nl": "Opgesteld met behulp van AI op basis van de vermelde bronnen.", "zh": "借助人工智能，根据所引来源编写。", "zht": "借助人工智慧，根據所引來源編寫。", "bg": "Подготвено с помощта на изкуствен интелект въз основа на цитираните източници.", "pl": "Przygotowano z pomocą sztucznej inteligencji na podstawie podanych źródeł."},
    "cuerpoBorrar": {"es": "Borrar los datos de «Su cuerpo»", "en": "Delete «Your body» data", "fr": "Effacer les données de «Votre corps»", "de": "Daten von «Ihr Körper» löschen", "it": "Elimina i dati di «Corpo»", "nl": "Gegevens van «Uw lichaam» wissen", "zh": "删除「我的身体」数据", "zht": "刪除「我的身體」資料", "bg": "Изтрий данните от «Вашето тяло»", "pl": "Usuń dane z sekcji «Ciało»"},
    "cuerpoBorrarSeguro": {"es": "¿Borrar su aspecto y todas las series anotadas? No se puede deshacer.", "en": "Delete your look and all the sets you logged? This cannot be undone.", "fr": "Effacer votre apparence et toutes les séries notées ? Cette action est irréversible.", "de": "Ihr Aussehen und alle eingetragenen Sätze löschen? Das lässt sich nicht rückgängig machen.", "it": "Eliminare l’aspetto e tutte le serie annotate? L’operazione non si può annullare.", "nl": "Uw uiterlijk en alle genoteerde sets wissen? Dit kan niet ongedaan worden gemaakt.", "zh": "要删除您的外观和所有已记录的组数吗？此操作无法撤销。", "zht": "要刪除您的外觀和所有已記錄的組數嗎？此操作無法復原。", "bg": "Да се изтрият ли външният ви вид и всички записани серии? Това не може да се отмени.", "pl": "Usunąć wygląd i wszystkie zapisane serie? Tej operacji nie można cofnąć."},
    "cuerpoBorrarSi": {"es": "Sí, borrar", "en": "Yes, delete", "fr": "Oui, effacer", "de": "Ja, löschen", "it": "Sì, elimina", "nl": "Ja, wissen", "zh": "确定删除", "zht": "確定刪除", "bg": "Да, изтрий", "pl": "Tak, usuń"},
    "cuerpoBorrado": {"es": "Datos borrados", "en": "Data deleted", "fr": "Données effacées", "de": "Daten gelöscht", "it": "Dati eliminati", "nl": "Gegevens gewist", "zh": "数据已删除", "zht": "資料已刪除", "bg": "Данните са изтрити", "pl": "Dane usunięte"},
    "cuerpoNoGuardado": {"es": "No se ha podido guardar en este dispositivo.", "en": "Could not save on this device.", "fr": "Impossible d’enregistrer sur cet appareil.", "de": "Auf diesem Gerät konnte nicht gespeichert werden.", "it": "Impossibile salvare su questo dispositivo.", "nl": "Opslaan op dit apparaat is niet gelukt.", "zh": "无法保存到本设备。", "zht": "無法儲存到此裝置。", "bg": "Не можа да се запази на това устройство.", "pl": "Nie udało się zapisać na tym urządzeniu."},
    "cuerpoEjercicios": {"es": "Ejercicios", "en": "Exercises", "fr": "Exercices", "de": "Übungen", "it": "Esercizi", "nl": "Oefeningen", "zh": "训练动作", "zht": "訓練動作", "bg": "Упражнения", "pl": "Ćwiczenia"},
    "cuerpoNEjercicios": {"es": "{n} ejercicio|{n} ejercicios", "en": "{n} exercise|{n} exercises", "fr": "{n} exercice|{n} exercices", "de": "{n} Übung|{n} Übungen", "it": "{n} esercizio|{n} esercizi", "nl": "{n} oefening|{n} oefeningen", "zh": "{n} 个动作", "zht": "{n} 個動作", "bg": "{n} упражнение|{n} упражнения", "pl": "{n} ćwiczenie|{n} ćwiczenia|{n} ćwiczeń"},
    "cuerpoEntorno": {"es": "Dónde", "en": "Where", "fr": "Où", "de": "Wo", "it": "Dove", "nl": "Waar", "zh": "场所", "zht": "場所", "bg": "Къде", "pl": "Gdzie"},
    "cuerpoEntTodos": {"es": "Todos", "en": "All", "fr": "Tous", "de": "Alle", "it": "Tutti", "nl": "Alle", "zh": "全部", "zht": "全部", "bg": "Всички", "pl": "Wszystkie"},
    "cuerpoEnt_gimnasio": {"es": "Gimnasio", "en": "Gym", "fr": "Salle de sport", "de": "Fitnessstudio", "it": "Palestra", "nl": "Sportschool", "zh": "健身房", "zht": "健身房", "bg": "Фитнес зала", "pl": "Siłownia"},
    "cuerpoEnt_fuera": {"es": "Fuera", "en": "Outdoors", "fr": "Dehors", "de": "Draußen", "it": "All’aperto", "nl": "Buiten", "zh": "户外", "zht": "戶外", "bg": "Навън", "pl": "Na zewnątrz"},
    "cuerpoEnt_calistenia": {"es": "Calistenia", "en": "Calisthenics", "fr": "Callisthénie", "de": "Calisthenics", "it": "Calisthenics", "nl": "Calisthenics", "zh": "自重训练", "zht": "自重訓練", "bg": "Калистеника", "pl": "Kalistenika"},
    "cuerpoBuscarEj": {"es": "Buscar en los ejercicios de este grupo", "en": "Search this group’s exercises", "fr": "Rechercher dans les exercices de ce groupe", "de": "Übungen dieser Gruppe durchsuchen", "it": "Cerca tra gli esercizi di questo gruppo", "nl": "Zoeken in de oefeningen van deze groep", "zh": "搜索本组动作", "zht": "搜尋本組動作", "bg": "Търсете в упражненията от тази група", "pl": "Szukaj w ćwiczeniach tej grupy"},
    "cuerpoBuscarEjPh": {"es": "Buscar un ejercicio…", "en": "Search exercises…", "fr": "Rechercher un exercice…", "de": "Übung suchen…", "it": "Cerca un esercizio…", "nl": "Zoek een oefening…", "zh": "搜索动作…", "zht": "搜尋動作…", "bg": "Търсете упражнение…", "pl": "Szukaj ćwiczenia…"},
    "cuerpoNivelFiltro": {"es": "Nivel", "en": "Level", "fr": "Niveau", "de": "Niveau", "it": "Livello", "nl": "Niveau", "zh": "难度", "zht": "難度", "bg": "Ниво", "pl": "Poziom"},
    "cuerpoNivelTodos": {"es": "Todos los niveles", "en": "All levels", "fr": "Tous niveaux", "de": "Alle Niveaus", "it": "Tutti i livelli", "nl": "Alle niveaus", "zh": "全部难度", "zht": "全部難度", "bg": "Всички нива", "pl": "Wszystkie poziomy"},
    "cuerpoNivel_1": {"es": "Inicial", "en": "Beginner", "fr": "Débutant", "de": "Einsteiger", "it": "Principiante", "nl": "Beginner", "zh": "入门", "zht": "入門", "bg": "Начинаещи", "pl": "Początkujący"},
    "cuerpoNivel_2": {"es": "Intermedio", "en": "Intermediate", "fr": "Intermédiaire", "de": "Mittel", "it": "Intermedio", "nl": "Gemiddeld", "zh": "中级", "zht": "中級", "bg": "Средно ниво", "pl": "Średniozaawansowany"},
    "cuerpoNivel_3": {"es": "Avanzado", "en": "Advanced", "fr": "Avancé", "de": "Fortgeschritten", "it": "Avanzato", "nl": "Gevorderd", "zh": "进阶", "zht": "進階", "bg": "Напреднали", "pl": "Zaawansowany"},
    "cuerpoTipo_fuerza": {"es": "Fuerza", "en": "Strength", "fr": "Renforcement", "de": "Kraft", "it": "Forza", "nl": "Kracht", "zh": "力量", "zht": "肌力", "bg": "Сила", "pl": "Siła"},
    "cuerpoTipo_isometrico": {"es": "Isométrico", "en": "Isometric", "fr": "Isométrique", "de": "Isometrisch", "it": "Isometrico", "nl": "Isometrisch", "zh": "等长", "zht": "等長", "bg": "Изометрично", "pl": "Izometryczne"},
    "cuerpoTipo_pliometria": {"es": "Pliometría", "en": "Plyometric", "fr": "Pliométrie", "de": "Plyometrie", "it": "Pliometria", "nl": "Plyometrie", "zh": "增强式", "zht": "增強式", "bg": "Плиометрия", "pl": "Plyometria"},
    "cuerpoTipo_estiramiento": {"es": "Estiramiento", "en": "Stretch", "fr": "Étirement", "de": "Dehnung", "it": "Allungamento", "nl": "Rekoefening", "zh": "拉伸", "zht": "伸展", "bg": "Разтягане", "pl": "Rozciąganie"},
    "cuerpoMat_ninguno": {"es": "Sin material", "en": "No equipment", "fr": "Sans matériel", "de": "Ohne Geräte", "it": "Senza attrezzi", "nl": "Zonder materiaal", "zh": "无需器械", "zht": "無需器材", "bg": "Без уреди", "pl": "Bez sprzętu"},
    "cuerpoMat_barra": {"es": "Barra", "en": "Barbell", "fr": "Barre", "de": "Langhantel", "it": "Bilanciere", "nl": "Halterstang", "zh": "杠铃", "zht": "槓鈴", "bg": "Щанга", "pl": "Sztanga"},
    "cuerpoMat_barra_z": {"es": "Barra Z", "en": "EZ bar", "fr": "Barre EZ", "de": "SZ-Stange", "it": "Bilanciere EZ", "nl": "EZ-stang", "zh": "曲杆", "zht": "曲槓", "bg": "EZ лост", "pl": "Gryf łamany"},
    "cuerpoMat_mancuernas": {"es": "Mancuernas", "en": "Dumbbells", "fr": "Haltères", "de": "Kurzhanteln", "it": "Manubri", "nl": "Dumbbells", "zh": "哑铃", "zht": "啞鈴", "bg": "Дъмбели", "pl": "Hantle"},
    "cuerpoMat_kettlebell": {"es": "Kettlebell", "en": "Kettlebell", "fr": "Kettlebell", "de": "Kettlebell", "it": "Kettlebell", "nl": "Kettlebell", "zh": "壶铃", "zht": "壺鈴", "bg": "Пудовка", "pl": "Kettlebell"},
    "cuerpoMat_disco": {"es": "Disco", "en": "Weight plate", "fr": "Disque", "de": "Hantelscheibe", "it": "Disco", "nl": "Halterschijf", "zh": "杠铃片", "zht": "槓片", "bg": "Диск", "pl": "Talerz"},
    "cuerpoMat_maquina": {"es": "Máquina", "en": "Machine", "fr": "Machine", "de": "Gerät", "it": "Macchina", "nl": "Machine", "zh": "器械", "zht": "機械", "bg": "Машина", "pl": "Maszyna"},
    "cuerpoMat_polea": {"es": "Polea", "en": "Cable", "fr": "Poulie", "de": "Kabelzug", "it": "Cavo", "nl": "Kabel", "zh": "拉力器", "zht": "拉力器", "bg": "Скрипец", "pl": "Wyciąg"},
    "cuerpoMat_multipower": {"es": "Multipower", "en": "Smith machine", "fr": "Smith machine", "de": "Multipresse", "it": "Multipower", "nl": "Smith machine", "zh": "史密斯机", "zht": "史密斯機", "bg": "Смит машина", "pl": "Suwnica Smitha"},
    "cuerpoMat_banco": {"es": "Banco", "en": "Bench", "fr": "Banc", "de": "Bank", "it": "Panca", "nl": "Bank", "zh": "训练凳", "zht": "訓練椅", "bg": "Пейка", "pl": "Ławka"},
    "cuerpoMat_barra_dominadas": {"es": "Barra de dominadas", "en": "Pull-up bar", "fr": "Barre de traction", "de": "Klimmzugstange", "it": "Sbarra per trazioni", "nl": "Optrekstang", "zh": "单杠", "zht": "單槓", "bg": "Лост за набиране", "pl": "Drążek"},
    "cuerpoMat_paralelas": {"es": "Paralelas", "en": "Parallel bars", "fr": "Barres parallèles", "de": "Barren", "it": "Parallele", "nl": "Dipbars", "zh": "双杠", "zht": "雙槓", "bg": "Успоредка", "pl": "Poręcze"},
    "cuerpoMat_anillas": {"es": "Anillas", "en": "Rings", "fr": "Anneaux", "de": "Ringe", "it": "Anelli", "nl": "Ringen", "zh": "吊环", "zht": "吊環", "bg": "Халки", "pl": "Kółka gimnastyczne"},
    "cuerpoMat_cinta_suspension": {"es": "Cintas de suspensión", "en": "Suspension trainer", "fr": "Sangles de suspension", "de": "Schlingentrainer", "it": "Cinghie da sospensione", "nl": "Suspensiebanden", "zh": "悬挂训练带", "zht": "懸吊訓練帶", "bg": "Окачващи ленти", "pl": "Taśmy podwieszane"},
    "cuerpoMat_banda": {"es": "Banda elástica", "en": "Resistance band", "fr": "Bande élastique", "de": "Widerstandsband", "it": "Elastico", "nl": "Weerstandsband", "zh": "弹力带", "zht": "彈力帶", "bg": "Ластик", "pl": "Guma oporowa"},
    "cuerpoMat_balon_medicinal": {"es": "Balón medicinal", "en": "Medicine ball", "fr": "Médecine-ball", "de": "Medizinball", "it": "Palla medica", "nl": "Medicijnbal", "zh": "药球", "zht": "藥球", "bg": "Медицинска топка", "pl": "Piłka lekarska"},
    "cuerpoMat_fitball": {"es": "Fitball", "en": "Exercise ball", "fr": "Ballon de gym", "de": "Gymnastikball", "it": "Fitball", "nl": "Fitnessbal", "zh": "健身球", "zht": "健身球", "bg": "Фитнес топка", "pl": "Piłka gimnastyczna"},
    "cuerpoMat_rueda_abdominal": {"es": "Rueda abdominal", "en": "Ab wheel", "fr": "Roue abdominale", "de": "Bauchroller", "it": "Ruota addominale", "nl": "Buikspierwiel", "zh": "健腹轮", "zht": "健腹輪", "bg": "Колело за корем", "pl": "Kółko treningowe"},
    "cuerpoMat_esterilla": {"es": "Esterilla", "en": "Mat", "fr": "Tapis", "de": "Matte", "it": "Tappetino", "nl": "Mat", "zh": "瑜伽垫", "zht": "瑜伽墊", "bg": "Постелка", "pl": "Mata"},
    "cuerpoMat_escalon": {"es": "Escalón", "en": "Step or stairs", "fr": "Marche", "de": "Stufe", "it": "Gradino", "nl": "Trede", "zh": "台阶", "zht": "台階", "bg": "Стъпало", "pl": "Stopień"},
    "cuerpoMat_pared": {"es": "Pared", "en": "Wall", "fr": "Mur", "de": "Wand", "it": "Muro", "nl": "Muur", "zh": "墙", "zht": "牆", "bg": "Стена", "pl": "Ściana"},
    "cuerpoVolverGrupo": {"es": "Volver a {grupo}", "en": "Back to {grupo}", "fr": "Retour à {grupo}", "de": "Zurück zu {grupo}", "it": "Torna a {grupo}", "nl": "Terug naar {grupo}", "zh": "返回{grupo}", "zht": "返回{grupo}", "bg": "Назад към {grupo}", "pl": "Wróć do: {grupo}"},
    "cuerpoComoSeHace": {"es": "Cómo se hace", "en": "How to do it", "fr": "Comment le faire", "de": "So geht’s", "it": "Come si esegue", "nl": "Zo doet u het", "zh": "动作要领", "zht": "動作要領", "bg": "Как се прави", "pl": "Jak wykonać"},
    "cuerpoMusculosEj": {"es": "Músculos", "en": "Muscles", "fr": "Muscles", "de": "Muskeln", "it": "Muscoli", "nl": "Spieren", "zh": "肌肉", "zht": "肌肉", "bg": "Мускули", "pl": "Mięśnie"},
    "cuerpoPrincipal": {"es": "Principal", "en": "Main", "fr": "Principal", "de": "Hauptmuskeln", "it": "Principali", "nl": "Hoofdspieren", "zh": "主要肌群", "zht": "主要肌群", "bg": "Основни", "pl": "Główne"},
    "cuerpoSecundario": {"es": "Secundario", "en": "Secondary", "fr": "Secondaire", "de": "Hilfsmuskeln", "it": "Secondari", "nl": "Hulpspieren", "zh": "辅助肌群", "zht": "輔助肌群", "bg": "Помощни", "pl": "Pomocnicze"},
    "cuerpoAnotarEj": {"es": "Anotar series de este ejercicio", "en": "Log sets of this exercise", "fr": "Noter des séries de cet exercice", "de": "Sätze dieser Übung eintragen", "it": "Annotare le serie di questo esercizio", "nl": "Sets van deze oefening noteren", "zh": "记录这个动作的组数", "zht": "記錄這個動作的組數", "bg": "Записване на серии от това упражнение", "pl": "Zapisywanie serii tego ćwiczenia"},
    "cuerpoAnotadoEj": {"es": "{ejercicio}: {n} serie anotada|{ejercicio}: {n} series anotadas", "en": "{ejercicio}: {n} set logged|{ejercicio}: {n} sets logged", "fr": "{ejercicio} : {n} série notée|{ejercicio} : {n} séries notées", "de": "{ejercicio}: {n} Satz eingetragen|{ejercicio}: {n} Sätze eingetragen", "it": "{ejercicio}: {n} serie annotata|{ejercicio}: {n} serie annotate", "nl": "{ejercicio}: {n} set genoteerd|{ejercicio}: {n} sets genoteerd", "zh": "{ejercicio}：已记录 {n} 组", "zht": "{ejercicio}：已記錄 {n} 組", "bg": "{ejercicio}: записана {n} серия|{ejercicio}: записани {n} серии", "pl": "{ejercicio}: zapisano {n} serię|{ejercicio}: zapisano {n} serie|{ejercicio}: zapisano {n} serii"},
    "cuerpoNF_datos": {"es": "conjunto de datos", "en": "dataset", "fr": "jeu de données", "de": "Datensatz", "it": "set di dati", "nl": "dataset", "zh": "数据集", "zht": "資料集", "bg": "набор от данни", "pl": "zbiór danych"},
    "cuerpoNF_articulo": {"es": "artículo para profesionales", "en": "article for professionals", "fr": "article pour les professionnels", "de": "Fachartikel", "it": "articolo per professionisti", "nl": "artikel voor professionals", "zh": "面向专业人士的文章", "zht": "給專業人士的文章", "bg": "статия за специалисти", "pl": "artykuł dla specjalistów"},
    "cuerpoNF_estudioACE": {"es": "estudio patrocinado por ACE", "en": "study sponsored by ACE", "fr": "étude financée par l’ACE", "de": "von ACE geförderte Studie", "it": "studio finanziato da ACE", "nl": "door ACE gesponsorde studie", "zh": "ACE 资助的研究", "zht": "ACE 資助的研究", "bg": "проучване, финансирано от ACE", "pl": "badanie sponsorowane przez ACE"},
    "cuerpoNF_hojaPacientes": {"es": "hoja para pacientes", "en": "patient leaflet", "fr": "fiche pour les patients", "de": "Patienteninformation", "it": "scheda per i pazienti", "nl": "patiëntenfolder", "zh": "患者须知", "zht": "病患須知", "bg": "листовка за пациенти", "pl": "ulotka dla pacjentów"},
    "cuerpoNF_videoTexto": {"es": "vídeo y texto", "en": "video and text", "fr": "vidéo et texte", "de": "Video und Text", "it": "video e testo", "nl": "video en tekst", "zh": "视频和文字", "zht": "影片和文字", "bg": "видео и текст", "pl": "wideo i tekst"},
    "cuerpoNF_maquina": {"es": "máquina", "en": "machine", "fr": "machine", "de": "Gerät", "it": "macchina", "nl": "machine", "zh": "器械", "zht": "機械", "bg": "машина", "pl": "maszyna"},
    "cuerpoNF_ejercicios": {"es": "ejercicios", "en": "exercises", "fr": "exercices", "de": "Übungen", "it": "esercizi", "nl": "oefeningen", "zh": "练习", "zht": "練習", "bg": "упражнения", "pl": "ćwiczenia"},
    "cuerpoNF_folleto": {"es": "folleto", "en": "leaflet", "fr": "brochure", "de": "Broschüre", "it": "opuscolo", "nl": "folder", "zh": "小册子", "zht": "小冊子", "bg": "брошура", "pl": "broszura"},
    "cuerpoNF_comunitaria": {"es": "fuente comunitaria", "en": "community source", "fr": "source communautaire", "de": "Community-Quelle", "it": "fonte della comunità", "nl": "communitybron", "zh": "社区来源", "zht": "社群來源", "bg": "източник от общността", "pl": "źródło społecznościowe"},
    "cuerpoNF_barra": {"es": "barra", "en": "barbell", "fr": "barre", "de": "Langhantel", "it": "bilanciere", "nl": "halterstang", "zh": "杠铃", "zht": "槓鈴", "bg": "щанга", "pl": "sztanga"},
    "cuerpoNF_mancuernas": {"es": "mancuernas", "en": "dumbbells", "fr": "haltères", "de": "Kurzhanteln", "it": "manubri", "nl": "dumbbells", "zh": "哑铃", "zht": "啞鈴", "bg": "дъмбели", "pl": "hantle"},
    "cuerpoNF_banda": {"es": "banda", "en": "band", "fr": "bande élastique", "de": "Widerstandsband", "it": "elastico", "nl": "weerstandsband", "zh": "弹力带", "zht": "彈力帶", "bg": "ластик", "pl": "guma oporowa"},
    "cuerpoNF_bandasPoleas": {"es": "bandas o poleas", "en": "bands or cables", "fr": "bandes élastiques ou poulies", "de": "Bänder oder Kabelzug", "it": "elastici o cavi", "nl": "banden of kabels", "zh": "弹力带或绳索", "zht": "彈力帶或拉力器", "bg": "ластици или скрипци", "pl": "gumy lub wyciągi"},
    "cuerpoNF_poleaBanco": {"es": "polea y banco", "en": "cable and bench", "fr": "poulie et banc", "de": "Kabelzug und Bank", "it": "cavo e panca", "nl": "kabel en bank", "zh": "绳索和凳子", "zht": "拉力器和長凳", "bg": "скрипец и пейка", "pl": "wyciąg i ławka"},
    "cuerpoNF_fitball": {"es": "con fitball", "en": "with an exercise ball", "fr": "avec ballon de gym", "de": "mit Gymnastikball", "it": "con la fitball", "nl": "met fitnessbal", "zh": "用健身球", "zht": "用健身球", "bg": "с фитнес топка", "pl": "z piłką gimnastyczną"},
    "cuerpoNF_fondosMaquina": {"es": "Fondos en máquina", "en": "Machine dip", "fr": "Dips à la machine", "de": "Dips am Gerät", "it": "Dip alla macchina", "nl": "Dips op de machine", "zh": "器械臂屈伸", "zht": "機械撐體", "bg": "Кофички на машина", "pl": "Dipy na maszynie siedząc"},
    "cuerpoNF_biblioteca": {"es": "biblioteca de salud", "en": "health library", "fr": "bibliothèque santé", "de": "Gesundheitsbibliothek", "it": "biblioteca della salute", "nl": "gezondheidsbibliotheek", "zh": "健康资料库", "zht": "健康資料庫", "bg": "здравна библиотека", "pl": "biblioteka zdrowia"},
    "cuerpoNF_extractoHK": {"es": "extracto en Human Kinetics", "en": "excerpt on Human Kinetics", "fr": "extrait sur Human Kinetics", "de": "Auszug bei Human Kinetics", "it": "estratto su Human Kinetics", "nl": "fragment op Human Kinetics", "zh": "Human Kinetics 节选", "zht": "Human Kinetics 節選", "bg": "откъс в Human Kinetics", "pl": "fragment w Human Kinetics"},
    "cuerpoNF_mccall": {"es": "Pete McCall, septiembre de 2015", "en": "Pete McCall, September 2015", "fr": "Pete McCall, septembre 2015", "de": "Pete McCall, September 2015", "it": "Pete McCall, settembre 2015", "nl": "Pete McCall, september 2015", "zh": "Pete McCall，2015年9月", "zht": "Pete McCall，2015年9月", "bg": "Pete McCall, септември 2015 г.", "pl": "Pete McCall, wrzesień 2015"},
    "cuerpoNF_ucsf": {"es": "Universidad de California, San Francisco", "en": "University of California, San Francisco", "fr": "Université de Californie à San Francisco", "de": "University of California, San Francisco", "it": "Università della California, San Francisco", "nl": "University of California, San Francisco", "zh": "加州大学旧金山分校", "zht": "加州大學舊金山分校", "bg": "Калифорнийски университет, Сан Франциско", "pl": "Uniwersytet Kalifornijski w San Francisco"},
    "cuerpoNF_sussex": {"es": "Universidad de Sussex", "en": "University of Sussex", "fr": "Université du Sussex", "de": "University of Sussex", "it": "Università del Sussex", "nl": "University of Sussex", "zh": "萨塞克斯大学", "zht": "薩塞克斯大學", "bg": "Съсекски университет", "pl": "Uniwersytet Sussex"},
    "cuerpoNF_programaCasa": {"es": "Programa de ejercicio en casa", "en": "Home exercise programme", "fr": "Programme d’exercices à domicile", "de": "Übungsprogramm für zu Hause", "it": "Programma di esercizi a casa", "nl": "Oefenprogramma voor thuis", "zh": "居家锻炼计划", "zht": "居家運動計畫", "bg": "Програма за упражнения у дома", "pl": "Program ćwiczeń w domu"},
    "cuerpoNF_copiaRutina": {"es": "copia de la Recommended Routine de r/bodyweightfitness", "en": "copy of the Recommended Routine from r/bodyweightfitness", "fr": "copie de la Recommended Routine de r/bodyweightfitness", "de": "Kopie der Recommended Routine von r/bodyweightfitness", "it": "copia della Recommended Routine di r/bodyweightfitness", "nl": "kopie van de Recommended Routine van r/bodyweightfitness", "zh": "r/bodyweightfitness 的 Recommended Routine 副本", "zht": "r/bodyweightfitness 的 Recommended Routine 副本", "bg": "копие на Recommended Routine от r/bodyweightfitness", "pl": "kopia Recommended Routine z r/bodyweightfitness"},
    "cuerpoNF_hojaEjercicio": {"es": "hoja de ejercicio", "en": "exercise sheet", "fr": "fiche d’exercice", "de": "Übungsblatt", "it": "scheda dell’esercizio", "nl": "oefenblad", "zh": "练习说明", "zht": "練習說明", "bg": "лист с упражнение", "pl": "karta ćwiczenia"},
    "cuerpoFuentesEj": {"es": "Fuentes", "en": "Sources", "fr": "Sources", "de": "Quellen", "it": "Fonti", "nl": "Bronnen", "zh": "来源", "zht": "來源", "bg": "Източници", "pl": "Źródła"},
    "cuerpoNotaFuentesEj": {"es": "Los pasos están escritos con palabras propias a partir de estas fuentes. El nivel es orientativo: es el de la fuente cuando esta lo da y, si no, una estimación.", "en": "The steps are written in our own words from these sources. The level is a guide: it is the source’s own where one gives it, and an estimate otherwise.", "fr": "Les étapes sont rédigées avec nos propres mots à partir de ces sources. Le niveau est indicatif : c’est celui de la source quand elle l’indique, sinon une estimation.", "de": "Die Schritte sind auf Grundlage dieser Quellen in eigenen Worten geschrieben. Das Niveau ist ein Richtwert: Es stammt aus der Quelle, wenn diese es angibt, sonst ist es geschätzt.", "it": "I passaggi sono scritti con parole proprie a partire da queste fonti. Il livello è indicativo: è quello della fonte quando lo indica, altrimenti è una stima.", "nl": "De stappen zijn in eigen woorden geschreven op basis van deze bronnen. Het niveau is een richtlijn: het komt uit de bron als die het aangeeft, anders is het een schatting.", "zh": "步骤根据这些来源用自己的话写成。难度仅供参考：来源有标注时采用来源的难度，否则为估计。", "zht": "步驟依據這些來源以自己的話寫成。難度僅供參考：來源有標示時採用來源的難度，否則為估計。", "bg": "Стъпките са написани със собствени думи въз основа на тези източници. Нивото е ориентировъчно: взето е от източника, когато той го посочва, а иначе е приблизителна оценка.", "pl": "Kroki opisano własnymi słowami na podstawie tych źródeł. Poziom jest orientacyjny: pochodzi ze źródła, jeśli źródło go podaje, a w przeciwnym razie jest szacunkowy."},
    "cuerpoCargandoEj": {"es": "Cargando los ejercicios…", "en": "Loading the exercises…", "fr": "Chargement des exercices…", "de": "Die Übungen werden geladen…", "it": "Caricamento degli esercizi…", "nl": "De oefeningen worden geladen…", "zh": "正在载入动作…", "zht": "正在載入動作…", "bg": "Упражненията се зареждат…", "pl": "Wczytywanie ćwiczeń…"},
    "cuerpoErrorEj": {"es": "No se han podido cargar los ejercicios.", "en": "The exercises could not be loaded.", "fr": "Impossible de charger les exercices.", "de": "Die Übungen konnten nicht geladen werden.", "it": "Impossibile caricare gli esercizi.", "nl": "De oefeningen konden niet worden geladen.", "zh": "无法载入动作。", "zht": "無法載入動作。", "bg": "Упражненията не можаха да се заредят.", "pl": "Nie udało się wczytać ćwiczeń."},
    "cuerpoReintentar": {"es": "Reintentar", "en": "Try again", "fr": "Réessayer", "de": "Erneut versuchen", "it": "Riprova", "nl": "Opnieuw proberen", "zh": "重试", "zht": "重試", "bg": "Опитай отново", "pl": "Spróbuj ponownie"},
    "cuerpoSinEjFiltro": {"es": "Ningún ejercicio con estos filtros.", "en": "No exercises match these filters.", "fr": "Aucun exercice ne correspond à ces filtres.", "de": "Keine Übung passt zu diesen Filtern.", "it": "Nessun esercizio con questi filtri.", "nl": "Geen oefeningen met deze filters.", "zh": "没有符合筛选条件的动作。", "zht": "沒有符合篩選條件的動作。", "bg": "Няма упражнения с тези филтри.", "pl": "Brak ćwiczeń dla tych filtrów."},
    "cuerpoVarianteDe": {"es": "Variante de {nombre}", "en": "Variation of {nombre}", "fr": "Variante de {nombre}", "de": "Variante von {nombre}", "it": "Variante di {nombre}", "nl": "Variant van {nombre}", "zh": "{nombre}的变体", "zht": "{nombre}的變化式", "bg": "Вариант на {nombre}", "pl": "Wariant: {nombre}"},
    "cuerpoVariantes": {"es": "Variantes", "en": "Variations", "fr": "Variantes", "de": "Varianten", "it": "Varianti", "nl": "Varianten", "zh": "变体", "zht": "變化式", "bg": "Варианти", "pl": "Warianty"},
    "cuerpoFichasPropias": {"es": "Fichas propias de Tenerife Go, comprobadas en las fuentes de cada ejercicio.", "en": "Written by Tenerife Go and checked against each exercise’s sources.", "fr": "Fiches rédigées par Tenerife Go et vérifiées dans les sources de chaque exercice.", "de": "Von Tenerife Go verfasst und anhand der Quellen jeder Übung geprüft.", "it": "Schede scritte da Tenerife Go e verificate sulle fonti di ogni esercizio.", "nl": "Geschreven door Tenerife Go en gecontroleerd aan de hand van de bronnen van elke oefening.", "zh": "由 Tenerife Go 编写，并已对照每个动作的来源核实。", "zht": "由 Tenerife Go 撰寫，並已對照每個動作的來源查核。", "bg": "Написани от Tenerife Go и проверени по източниците на всяко упражнение.", "pl": "Opracowane przez Tenerife Go i sprawdzone w źródłach każdego ćwiczenia."}
  };
  Object.assign(UI_TX, CUERPO_UI);
})();

/* figura.js — la geometría del personaje de «Su cuerpo» (Tenerife Go): un cuerpo adulto con
   proporciones de ocho cabezas y unos treinta y cinco músculos superficiales (también los pequeños), de frente y de espaldas.
   Todo está dibujado a mano en coordenadas de un lienzo de 400 × 800 (centro x = 200), para la
   mitad derecha del dibujo; la otra mitad es su espejo. La silueta y la complexión se aplican
   después, deformando cada pieza (tronco, brazo, pierna) alrededor de su eje.
   Un punto es [x, y] o [x, y, 'c'] (esquina: la curva no se suaviza ahí).
   Expone TG_FIGURA_GEO. */
(function (raiz) {
  'use strict';
  var CX = 200;

  /* ── curvas ── */
  function r1(v) { return Math.round(v * 10) / 10; }
  function pt(p) { return r1(p[0]) + ' ' + r1(p[1]); }
  /* Catmull-Rom → Bézier, cerrada; en un punto «esquina» las tangentes se anulan */
  function curva(ps, tension) {
    var k = (tension == null ? 1 : tension) / 6, n = ps.length, d = 'M' + pt(ps[0]);
    for (var i = 0; i < n; i++) {
      var p0 = ps[(i - 1 + n) % n], p1 = ps[i], p2 = ps[(i + 1) % n], p3 = ps[(i + 2) % n];
      var k1 = p1[2] === 'c' ? 0 : k, k2 = p2[2] === 'c' ? 0 : k;
      var c1 = [p1[0] + (p2[0] - p0[0]) * k1, p1[1] + (p2[1] - p0[1]) * k1];
      var c2 = [p2[0] - (p3[0] - p1[0]) * k2, p2[1] - (p3[1] - p1[1]) * k2];
      d += 'C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(p2);
    }
    return d + 'Z';
  }
  /* abierta (para las fibras y las líneas de detalle) */
  function linea(ps, tension) {
    var k = (tension == null ? 1 : tension) / 6, n = ps.length, d = 'M' + pt(ps[0]);
    for (var i = 0; i < n - 1; i++) {
      var p0 = ps[Math.max(0, i - 1)], p1 = ps[i], p2 = ps[i + 1], p3 = ps[Math.min(n - 1, i + 2)];
      var c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
      var c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
      d += 'C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(p2);
    }
    return d;
  }
  function espejoP(p) { return p.length > 2 ? [2 * CX - p[0], p[1], p[2]] : [2 * CX - p[0], p[1]]; }
  function espejo(ps) { return ps.map(espejoP); }
  /* una forma simétrica a partir de su mitad derecha, de arriba (en el eje) a abajo (en el eje) */
  function sim(der) { return der.concat(espejo(der.slice(1, -1)).reverse()); }
  function interp(lista, v) {
    if (v <= lista[0][0]) return lista[0][1];
    for (var i = 1; i < lista.length; i++) {
      if (v <= lista[i][0]) { var a = lista[i - 1], b = lista[i], t = (v - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t; }
    }
    return lista[lista.length - 1][1];
  }

  /* ── la silueta y la complexión ──
     fig: 'a' hombros más anchos que las caderas, 'b' caderas más anchas; comp: 0 delgada, 1 media, 2 robusta */
  function deformador(fig, comp) {
    var k = [0.92, 1, 1.08][comp == null ? 1 : comp];
    var b = fig === 'b';
    /* ancho del tronco según la altura (y) */
    /* «b»: hombros más estrechos, cintura marcada y caderas más anchas */
    var tronco = b ? [[120, 0.93], [170, 0.87], [230, 0.89], [300, 0.9], [330, 0.94], [365, 1.08], [400, 1.11], [430, 1.1]]
                   : [[120, 1], [430, 1]];
    function sx(y) { return interp(tronco, y) * (0.35 + 0.65 * k); }
    var EJE_BRAZO = [[170, 279], [304, 296], [400, 298], [480, 300]];
    var EJE_PIERNA = [[392, 238], [560, 232], [742, 228], [780, 229]];
    var kBrazo = k * (b ? 0.9 : 1), kPierna = k * (b ? 1.06 : 1);
    function tronco_(p) { return [CX + (p[0] - CX) * sx(p[1]), p[1]]; }
    function brazo(p) {
      var ax = interp(EJE_BRAZO, p[1]), lado = p[0] >= CX ? 1 : -1;
      ax = lado > 0 ? ax : 2 * CX - ax;
      var hombro = (sx(170) - 1) * 78 * lado;
      return [ax + hombro + (p[0] - ax) * kBrazo, p[1]];
    }
    function pierna(p) {
      var ax = interp(EJE_PIERNA, p[1]), lado = p[0] >= CX ? 1 : -1;
      ax = lado > 0 ? ax : 2 * CX - ax;
      var cadera = (sx(392) - 1) * 40 * lado * interp([[392, 1], [742, 0.3]], p[1]);
      return [ax + cadera + (p[0] - ax) * kPierna, p[1]];
    }
    /* «mixta»: la ropa de abajo, que va de la cintura a las piernas */
    function mixta(p) { return p[1] < 392 ? tronco_(p) : pierna(p); }
    var f = { tronco: tronco_, brazo: brazo, pierna: pierna, mixta: mixta, cabeza: function (p) { return [p[0], p[1]]; } };
    return function (pieza, ps) {
      var g = f[pieza] || f.tronco;
      return ps.map(function (p) { var q = g(p); return p.length > 2 ? [q[0], q[1], p[2]] : q; });
    };
  }

  /* ── las piezas del cuerpo (mitad derecha del dibujo) ── */
  var CABEZA = sim([[200, 26], [216, 28], [226, 36], [231, 50], [232, 66], [230, 80], [226, 92], [220, 103], [212, 111], [205, 116], [200, 117]]);
  var OREJA = [[229, 66], [234, 63], [237.5, 69], [236.5, 80], [233.5, 90], [229, 92]];
  var CUELLO = [[212, 100], [221, 110], [223, 126], [227, 146], [200, 150], [173, 146], [177, 126], [179, 110], [188, 100]];
  var TRONCO = sim([[200, 132], [224, 136], [242, 148], [262, 156], [276, 160], [278, 176], [272, 206], [268, 222], [271, 238], [273, 254], [270, 274],
    [263, 296], [257, 316], [258, 334], [262, 350], [267, 368], [270, 386], [264, 400], [236, 404], [214, 406], [200, 408]]);
  var BRAZO = [[268, 157], [284, 159], [296, 164], [305, 176], [310, 195], [312, 216], [311, 236], [308, 252], [310, 268], [311, 286], [310, 302],
    [313, 316], [316, 334], [315, 352], [312, 372], [309, 388], [308, 400], [288, 400], [287, 384], [285, 366], [283, 346], [281.5, 326], [281, 310],
    [280.5, 296], [279.5, 278], [278.5, 260], [276, 242], [268, 224]];
  var MANO = [[288, 398], [285, 411], [283.5, 425], [283.3, 439], [284, 451], [285.5, 460], [288, 464.5], [290.5, 462.5, 'c'], [292, 469], [294.6, 472],
    [296.6, 470, 'c'], [298.4, 476], [301.4, 477.2], [303.4, 473.5, 'c'], [305.6, 472], [307.6, 466], [309, 455], [309.6, 444], [310.5, 438.5, 'c'],
    [314.5, 444.5], [318.5, 448], [321.6, 445.5], [321.4, 438], [319.2, 428], [316.2, 418], [312.4, 407], [308.5, 398]];
  var DEDOS = [[[289.6, 444], [290.5, 462]], [[295.6, 446], [296.6, 469]], [[302.2, 446], [303.4, 472]], [[285.5, 438], [291, 436.5], [298, 437], [306, 437.5]]];
  var PIERNA = [[202, 404], [236, 398], [262, 392], [269, 394], [271.5, 408], [270.5, 428], [267.5, 452], [263, 480], [258, 510], [253.5, 536],
    [250.5, 556], [251, 572], [254.5, 592], [256, 612], [254, 636], [248.5, 666], [243, 698], [239, 722], [237.5, 742], [220, 742], [220, 718],
    [218, 690], [215, 660], [212, 632], [211, 608], [213, 586], [216, 566], [217, 550], [216.5, 530], [215, 500], [212, 470], [209, 440], [206, 420]];
  var PIE_FRENTE = [[220, 738], [218, 750], [214.5, 761], [214.5, 769.5], [221, 774], [236, 775], [246, 772], [248, 764], [244, 752], [238.5, 738]];
  var PIE_ESPALDA = [[222, 736], [220, 752], [221.5, 766], [227.5, 772.5], [236, 772.5], [240.5, 765], [240.5, 750], [238.5, 736]];

  /* ── los músculos ──
     id, grupo (de los 12 para anotar), pieza (para la deformación), vista y su forma (mitad derecha).
     «fibras»: líneas finas en la dirección de las fibras, para dar volumen. */
  var M = [];
  /* los 12 grupos en que se anotan las series (los mismos de siempre: los datos guardados siguen valiendo) */
  var GRUPOS = ['pecho', 'dorsal', 'espalda_alta', 'hombros', 'biceps', 'triceps', 'antebrazo', 'core', 'gluteos', 'cuadriceps', 'isquios', 'pantorrilla'];

  function m(id, g, pieza, vista, forma, fibras) {
    if (GRUPOS.indexOf(g) < 0) throw new Error('grupo desconocido: ' + g);
    var formas = Array.isArray(forma[0][0]) ? forma : [forma];
    M.push({ id: id, g: g, pieza: pieza, vista: vista, formas: formas, fibras: fibras || [] });
  }

  function rev(a) { return a.slice().reverse(); }
  function cat() { var r = []; for (var i = 0; i < arguments.length; i++) r = r.concat(arguments[i]); return r; }
  function c(p) { return [p[0], p[1], 'c']; }

  /* ── costuras compartidas: dos músculos vecinos usan la misma línea, sin huecos ── */
  /* muslo, de frente */
  var MU_EXT = [[266, 402], [270.5, 414], [270.5, 430], [267.5, 452], [263, 480], [258, 510], [253.5, 536], [250, 552]];
  var MU_INT = [[202, 404], [206, 420], [209, 440], [212, 470], [214.5, 500], [213.5, 516]];
  var VL_RF = [[258, 400], [259, 428], [257, 460], [253, 494], [247, 522], [240, 546]];
  var RF_SA = [[250, 394], [243, 416], [236, 440], [231, 466]];
  var RF_VM = [[231, 466], [229, 496], [231, 524], [237, 543]];
  var SA_VM = [[231, 466], [225, 490], [220, 516], [217, 545]];
  var SA_AD = [[258, 352], [252, 372], [243, 398], [234, 424], [225, 452], [217, 482], [212, 510], [210.5, 536]];
  /* pierna, de frente */
  var PI_EXT = [[251, 574], [254.5, 592], [256, 612], [254, 636], [248.5, 666], [243, 698], [239.5, 718]];
  var PI_INT = [[214.5, 580], [212, 600], [211, 620], [212, 640], [214.5, 660], [217.5, 688], [219.5, 716]];
  var TIB_M = [[226, 590], [224, 620], [222.5, 660], [221, 700], [219.5, 734]];
  var TIB_L = [[231, 590], [230, 620], [228.5, 660], [226, 700], [223, 734]];
  var TA_PE = [[240, 588], [246.5, 606], [247, 632], [244, 660], [239, 688], [233, 712], [227, 734]];
  var GA_SO = [[213, 657], [217, 662], [223, 660]];
  /* brazo, de frente */
  var BR_INT = [[276, 242], [278.5, 260], [279.5, 278], [280.5, 296], [281, 303]];
  var TR_BI = [[280, 234], [283, 252], [284.5, 274], [286, 292], [288, 304]];
  var BI_BQ = [[301, 250], [304, 262], [305, 280], [302, 296], [298, 306]];
  var BR_EXT = [[307, 254], [310, 268], [311, 286], [310, 302]];
  var AN_EXT = [[310, 302], [313, 316], [316, 334], [315, 352], [312, 372], [309, 388], [308, 398]];
  var AN_INT = [[281, 310], [281.5, 326], [283, 346], [285, 366], [287, 384], [288, 398]];
  var BRQ_FL = [[304, 300], [306, 318], [307, 338], [305, 360], [302, 380], [300, 398]];
  /* muslo, de espaldas */
  var MP_EXT = [[268, 446], [270.5, 456], [270.5, 476], [267.5, 494], [263, 516], [258, 538], [252, 556]];
  var MP_INT = [[204.5, 440], [206.5, 452], [209, 472], [212, 490], [214.5, 510], [216.5, 530], [217, 548]];
  var AD_ST = [[220, 450], [221, 472], [218, 494], [214.5, 510]];
  var ST_BF = [[241, 450], [243, 474], [243, 502], [241, 528], [237, 553]];
  var BF_VL = [[264, 446], [267, 462], [265, 488], [261, 514], [255, 538], [249, 556]];
  /* pierna, de espaldas */
  var PP_EXT = [[251, 576], [254.5, 594], [256, 612], [254, 636], [248.5, 666], [243, 698], [239.5, 718]];
  var PP_INT = [[213, 576], [211, 600], [210.5, 620], [211.5, 640], [214.5, 660], [217.5, 688], [219.5, 716]];
  var GM_GL = [[232, 571], [233, 600], [233, 630], [232, 655], [230, 669]];
  var GA_SO_P = [[211.5, 640], [216, 656], [222, 667], [230, 669], [238, 664], [246, 654], [252.5, 640]];
  var SO_PE = [[251, 602], [252.5, 640], [249, 666], [244, 692], [239.5, 712]];
  /* brazo, de espaldas */
  var AP_EXT = [[310, 302], [313, 316], [316, 334], [315, 352], [312, 372], [309, 388], [308, 398]];
  var FL_EX = [[290, 306], [291, 330], [291, 356], [292, 380], [294, 398]];

  /* DE FRENTE */
  m('trapecio_sup', 'espalda_alta', 'tronco', 'frente',
    [[222, 121], [229, 132], [241, 142], [257, 150], [272, 156], [277, 160], [262, 160.5], [245, 157], [231, 152.5], [224, 146], [222, 134]],
    [[[226, 134], [244, 148], [266, 157]]]);
  m('deltoides_ant', 'hombros', 'brazo', 'frente',
    [[251, 157.5], [268, 158.5], [284, 161.5], [291, 180], [297, 206], [301, 232], c([304.5, 249]), [296, 239], [286, 223], [275, 205], [263, 186], [253, 170]],
    [[[262, 166], [281, 198], [298, 240]], [[274, 164], [289, 196], [300, 236]]]);
  m('deltoides_lat', 'hombros', 'brazo', 'frente',
    [[284, 161.5], [296, 164.5], [305, 176], [310, 195], [312, 216], [311, 235], c([305.5, 250]), [304, 235], [301, 212], [296, 188], [290, 172]],
    [[[294, 168], [304, 200], [306, 240]]]);
  m('pectoral_sup', 'pecho', 'tronco', 'frente',
    [[205, 153.5], [224, 154.5], [242, 157], [252, 161], [262, 180], [272, 200], c([283, 220]), [270, 210], [252, 196], [234, 185], [216, 177.5], [205, 175]],
    [[[210, 160], [246, 178], [278, 214]], [[210, 168], [244, 186], [278, 216]]]);
  m('pectoral', 'pecho', 'tronco', 'frente',
    [[205, 175], [216, 177.5], [234, 185], [252, 196], [270, 210], c([283, 220]), [281, 227], [269, 233], [255, 240.5], [239, 246.5], [222, 247], [210, 243], [204.5, 236]],
    [[[208, 190], [244, 204], [279, 222]], [[208, 210], [246, 218], [279, 224]], [[210, 232], [246, 234], [278, 226]]]);
  m('dorsal_ancho', 'dorsal', 'tronco', 'frente',
    [[268.5, 224], [271.5, 238], [273.5, 254], [270.5, 274], [263.5, 296], c([261, 300]), [262.5, 286], [265.5, 270], [266.5, 254], [265, 238]]);
  m('oblicuos', 'core', 'tronco', 'frente',
    [[234, 251], [247, 247], [258, 247.5], [264.5, 254], [266, 270], [263, 288], [259, 303], [257, 318], [258.5, 334], c([262.5, 348]), [250, 362], [235, 377],
      c([221, 392]), [225.5, 370], [229.5, 340], [232.5, 310], [234, 280]],
    [[[240, 266], [252, 292], [258, 330]], [[236, 292], [246, 320], [250, 354]]]);
  m('serrato', 'espalda_alta', 'tronco', 'frente', [
    [[255, 243.5], [264.5, 239.5], [267, 246], [260, 250.5], [252.5, 253], [250.5, 248.5]],
    [[255.5, 256], [265.5, 252.5], [266.5, 259], [259, 263.5], [251.5, 266], [249.5, 261]],
    [[255, 268.5], [264.5, 265.5], [265, 272], [257.5, 276.5], [250.5, 279], [248.5, 274]],
    [[254, 281], [262.5, 278.5], [262, 285], [255.5, 289], [249, 291], [247.5, 286]]]);
  m('recto_abdominal', 'core', 'tronco', 'frente',
    [[203, 240], [214, 242.5], [228, 246.5], [234, 251], [234, 272], [232.5, 300], [229.5, 330], [224.5, 360], [218, 385], [212.5, 399], [204.5, 401], [203, 382]]);
  m('gluteo_medio', 'gluteos', 'pierna', 'frente',
    [[262, 352], [269, 362], [272, 380], [272, 396], c([266, 402]), c([258, 400]), [258, 380], [257.5, 364]]);
  m('aductores', 'gluteos', 'pierna', 'frente',
    cat([c([203, 404])], MU_INT, rev(SA_AD.slice(2)), [[230, 402], [214, 404]]),
    [[[210, 412], [216, 444], [214, 482]], [[222, 408], [226, 432], [220, 466]]]);
  m('vasto_lateral', 'cuadriceps', 'pierna', 'frente',
    cat(MU_EXT, [c([244, 551])], rev(VL_RF)),
    [[[264, 420], [261, 472], [251, 534]]]);
  m('recto_femoral', 'cuadriceps', 'pierna', 'frente',
    cat([c([253, 388])], VL_RF, [c([238, 546])], rev(RF_VM), rev(RF_SA)),
    [[[249, 402], [246, 462], [236, 530]], [[254, 412], [252, 466], [242, 524]], [[243, 410], [238, 462], [232, 522]]]);
  m('vasto_medial', 'cuadriceps', 'pierna', 'frente',
    cat(RF_VM, [[236, 552], [229, 558], [221.5, 557], c([216.5, 549])], rev(SA_VM)),
    [[[226, 490], [229, 522], [227, 552]]]);
  m('sartorio', 'cuadriceps', 'pierna', 'frente',
    cat([c([262, 352]), [257, 370]], RF_SA, SA_VM, [c([213.5, 553])], rev(SA_AD)));
  m('tibial_anterior', 'pantorrilla', 'pierna', 'frente',
    cat(TIB_L, [c([225, 735])], rev(TA_PE)),
    [[[237, 600], [238, 650], [229, 714]]]);
  m('peroneos', 'pantorrilla', 'pierna', 'frente',
    cat(TA_PE.slice(0, 6), [c([237, 722])], rev(PI_EXT.slice(1))),
    [[[248, 610], [248, 650], [240, 700]]]);
  m('gastrocnemio', 'pantorrilla', 'pierna', 'frente',
    cat(PI_INT.slice(0, 5), GA_SO, rev(TIB_M.slice(0, 2)), [[225, 590], c([218, 582])]),
    [[[218, 596], [219, 628], [217, 654]]]);
  m('soleo', 'pantorrilla', 'pierna', 'frente',
    cat(rev(GA_SO), PI_INT.slice(5), [c([220, 726])], rev(TIB_M.slice(2, 4)), [[223, 660]]));
  m('biceps', 'biceps', 'brazo', 'frente',
    cat([c([289, 229])], rev(TR_BI).reverse(), [c([292, 307])], rev(BI_BQ)),
    [[[288, 240], [294, 268], [294, 300]], [[285, 250], [289, 276], [291, 300]], [[294, 240], [300, 266], [298, 294]]]);
  m('braquial', 'biceps', 'brazo', 'frente',
    cat(BI_BQ.slice(1), [c([304, 305])], rev(BR_EXT.slice(1))));
  m('triceps', 'triceps', 'brazo', 'frente',
    cat(BR_INT.slice(0, 4), [c([282.5, 302])], rev(TR_BI.slice(0, 4))));
  m('braquiorradial', 'antebrazo', 'brazo', 'frente',
    cat(AN_EXT, [c([303, 398])], rev(BRQ_FL)),
    [[[309, 308], [311, 346], [306, 386]]]);
  m('flexores', 'antebrazo', 'brazo', 'frente',
    cat([c([288, 306])], BRQ_FL, [c([294, 399])], rev(AN_INT)),
    [[[288, 314], [294, 346], [293, 390]], [[295, 314], [300, 346], [297, 388]]]);

  /* DE ESPALDAS */
  m('erectores', 'core', 'tronco', 'espalda',
    [[203.5, 272], [212, 270], [220, 282], [224.5, 306], [225, 334], [221, 358], [214.5, 372], [204, 375.5], [203.5, 330]],
    [[[208, 282], [214, 326], [210, 368]], [[214, 286], [220, 326], [216, 362]]]);
  m('romboides', 'espalda_alta', 'tronco', 'espalda',
    [c([229, 218]), [237.5, 205], [241, 216], [241, 236], [238, 250], [230, 256], c([222, 254.5]), [224.5, 236]],
    [[[226, 238], [233, 224], [239, 214]], [[225, 250], [233, 238], [240, 228]]]);
  m('dorsal_ancho', 'dorsal', 'tronco', 'espalda',
    [c([204, 262]), [214, 257], [228, 256], [243, 252], [257, 245], [269, 236], c([277, 230]), [276.5, 246], [274.5, 262], [271, 280], [265.5, 300], [262, 318],
      [261, 336], c([259, 348]), [246, 345], [232, 340], [226.5, 326], [225.5, 306], [220, 288], [207, 276]],
    [[[212, 270], [244, 262], [274, 238]], [[228, 296], [252, 280], [273, 248]], [[234, 326], [256, 306], [272, 258]], [[246, 340], [260, 322], [270, 272]]]);
  m('redondo_mayor', 'dorsal', 'tronco', 'espalda',
    [[244, 238.5], [256, 234], [268, 228.5], [276.5, 226.5], [278, 234], [270, 242], [258, 250], [246, 254.5], [240.5, 248]],
    [[[246, 247], [262, 240], [276, 231]]]);
  m('manguito', 'hombros', 'tronco', 'espalda',
    [[241, 196], [256, 190.5], [270, 190], [276.5, 198], [274.5, 212], [266, 224], [254, 232], [244, 236], [241, 224], [239.5, 210]],
    [[[244, 214], [258, 206], [272, 200]], [[246, 228], [260, 218], [272, 208]]]);
  m('oblicuos', 'core', 'tronco', 'espalda',
    [[261, 302], [264.5, 314], [266, 332], [264, 346], [259.5, 350], [258, 334], [259, 316]]);
  m('trapecio_inf', 'espalda_alta', 'tronco', 'espalda',
    [[201, 200], [212, 198], [226, 191], c([236, 192.5]), [232, 214], [222.5, 240], [212.5, 270], [204.5, 296], c([201, 300])],
    [[[206, 214], [222, 204], [233, 196]], [[204, 250], [218, 222], [232, 200]]]);
  m('trapecio_medio', 'espalda_alta', 'tronco', 'espalda',
    [[201, 146.5], [214, 152], [230, 160], [246, 164], [262, 164], c([273, 166]), [256, 175], [240, 183], [226, 191], [212, 198], [201, 200]],
    [[[206, 162], [236, 172], [264, 168]], [[206, 184], [232, 182], [258, 172]]]);
  m('trapecio_sup', 'espalda_alta', 'tronco', 'espalda',
    [c([201, 86]), [210, 90], [219, 104], [225.5, 126], [240, 142], [258, 152], c([277, 160]), [262, 164], [246, 164], [230, 160], [214, 152], [204, 146.5], [201, 120]],
    [[[204, 100], [222, 138], [262, 158]], [[206, 128], [232, 150], [268, 161]]]);
  m('deltoides_post', 'hombros', 'brazo', 'espalda',
    [[277, 163], [287, 168], [296, 184], [301, 206], [304, 230], c([305.5, 249]), [297, 239], [284, 222], [268, 206], [253, 194], [241, 186], [257, 176]],
    [[[250, 186], [280, 205], [302, 244]], [[264, 178], [289, 199], [303, 240]]]);
  m('deltoides_lat', 'hombros', 'brazo', 'espalda',
    [[284, 161.5], [296, 164.5], [305, 176], [310, 195], [312, 216], [311, 235], c([305.5, 250]), [305, 230], [303, 206], [298, 186], [291, 170]],
    [[[294, 168], [305, 200], [306, 240]]]);
  m('gluteo_medio', 'gluteos', 'pierna', 'espalda',
    [[234, 349.5], [250, 346.5], [262.5, 350.5], [270, 362], [271, 378], c([267.5, 391]), [259, 383], [250, 372], [241, 362], c([231, 355])],
    [[[240, 354], [256, 364], [267, 382]], [[252, 350], [263, 360], [270, 374]]]);
  m('gluteo_mayor', 'gluteos', 'pierna', 'espalda',
    [c([203.5, 364]), [216, 359], [231, 355], [241, 362], [250, 372], [259, 383], [267.5, 392], [269, 408], [267, 424], [260.5, 435.5], [248, 442.5], [232, 445.5],
      [217, 443.5], [206.5, 437.5], [202.5, 416], [203, 390]],
    [[[208, 382], [238, 402], [262, 418]], [[208, 404], [236, 420], [260, 430]], [[210, 428], [232, 436], [250, 440]]]);
  m('aductores', 'gluteos', 'pierna', 'espalda',
    cat([c([205, 440]), [212, 446]], AD_ST, [c([214, 512])], rev(MP_INT.slice(1, 5))));
  m('semitendinoso', 'isquios', 'pierna', 'espalda',
    cat([[230, 449]], ST_BF, [c([228, 557]), [221, 552]], rev(MP_INT.slice(4, 7)).reverse().reverse(), rev(AD_ST)),
    [[[230, 458], [233, 502], [230, 548]]]);
  m('biceps_femoral', 'isquios', 'pierna', 'espalda',
    cat([[252, 447]], BF_VL, [c([244, 555])], rev(ST_BF)),
    [[[252, 456], [255, 500], [247, 548]]]);
  m('vasto_lateral', 'cuadriceps', 'pierna', 'espalda',
    cat(MP_EXT, rev(BF_VL)));
  m('gastrocnemio', 'pantorrilla', 'pierna', 'espalda', [
    cat([[222, 569]], GM_GL, rev(GA_SO_P.slice(0, 4)), PP_INT.slice(0, 4).reverse().reverse().reverse()),
    cat([[244, 569], [252, 582]], SO_PE.slice(0, 2), rev(GA_SO_P.slice(3)), rev(GM_GL))],
    [[[218, 580], [221, 620], [221, 660]], [[241, 580], [245, 618], [239, 656]]]);
  m('soleo', 'pantorrilla', 'pierna', 'espalda',
    cat(GA_SO_P, SO_PE.slice(2), [[236, 716], [228, 716]], rev(PP_INT.slice(4))));
  m('peroneos', 'pantorrilla', 'pierna', 'espalda',
    cat(SO_PE, rev(PP_EXT.slice(1))));
  m('triceps', 'triceps', 'brazo', 'espalda',
    cat([[279, 234], [291, 231], [301, 240]], BR_EXT.slice(0, 3).map(function (p) { return [p[0] - 1, p[1]]; }), [c([308, 296]), [300, 304], [288, 305]], rev(BR_INT.slice(1, 4))),
    [[[285, 242], [288, 272], [290, 298]], [[296, 242], [301, 270], [299, 296]]]);
  m('extensores', 'antebrazo', 'brazo', 'espalda',
    cat([[296, 305], [303, 303]], [[311, 312], [314, 326]], AP_EXT.slice(3), [c([300, 398])], rev(FL_EX)),
    [[[298, 314], [301, 350], [299, 390]], [[305, 318], [307, 350], [303, 388]]]);
  m('flexores', 'antebrazo', 'brazo', 'espalda',
    cat([[284, 306]], FL_EX, [c([289, 399])], rev(AN_INT.slice(0, 5)).map(function (p) { return [p[0] + 0.5, p[1]]; })));
  m('braquiorradial', 'antebrazo', 'brazo', 'espalda',
    [[308, 292], [312, 304], [315, 322], c([314.5, 336]), [311, 326], [309, 310]]);

  /* ── detalles que no son de ningún grupo: tendones, huesos, aponeurosis ── */
  var DETALLE = {
    frente: [
      { pieza: 'tronco', forma: [[224, 96], [229, 104], [220, 124], [210, 146], [204.5, 148.5], [206, 140], [214, 120]], tono: 'tendon' },
      { pieza: 'pierna', forma: [[224, 544], [236, 542], [243, 550], [243, 562], [238, 572], [230, 573], [224, 566], [222.5, 554]], tono: 'hueso' },
      { pieza: 'pierna', forma: [[228, 572], [237, 572], [236, 588], [229, 588]], tono: 'tendon' },
      { pieza: 'pierna', forma: [[228, 590], [233, 592], [229, 650], [225.5, 712], [222, 734], [220, 712], [223, 650]], tono: 'hueso' },
      { pieza: 'brazo', forma: [[283, 300], [291, 304], [298, 301], [302, 305], [293, 310], [285, 307]], tono: 'tendon' }
    ],
    espalda: [
      { pieza: 'tronco', forma: [[201, 302], [209, 318], [222, 336], [238, 348], [222, 356], [206, 360], [201, 362]], tono: 'tendon' },
      { pieza: 'pierna', forma: [[226, 553], [240, 553], [247.5, 568], [236, 580], [224, 578], [218.5, 566]], tono: 'tendon' },
      { pieza: 'pierna', forma: [[224, 700], [234, 700], [232.5, 742], [226.5, 742]], tono: 'tendon' },
      { pieza: 'brazo', forma: [[285, 286], [299, 284], [301, 302], [293, 309], [287, 304]], tono: 'tendon' },
      { pieza: 'tronco', forma: [[238, 188], [256, 178], [276, 163], [274, 168], [254, 184], [240, 193]], tono: 'hueso' }
    ]
  };

  /* líneas de detalle: las intersecciones del recto del abdomen; de espaldas, el surco de la columna */
  var LINEAS = {
    frente: [
      { pieza: 'tronco', ps: [[204, 268], [214, 266.5], [226, 268], [233.5, 270]] },
      { pieza: 'tronco', ps: [[203.5, 294], [214, 292.5], [226, 294], [232.5, 296]] },
      { pieza: 'tronco', ps: [[203.5, 321], [213, 320], [224, 321.5], [230.5, 323]] }
    ],
    espalda: []
  };

  raiz.TG_FIGURA_GEO = {
    CX: CX, GRUPOS: GRUPOS, curva: curva, linea: linea, espejo: espejo, espejoP: espejoP, sim: sim, interp: interp, deformador: deformador,
    CABEZA: CABEZA, OREJA: OREJA, CUELLO: CUELLO, TRONCO: TRONCO, BRAZO: BRAZO, MANO: MANO, DEDOS: DEDOS, PIERNA: PIERNA,
    PIE_FRENTE: PIE_FRENTE, PIE_ESPALDA: PIE_ESPALDA, MUSCULOS: M, DETALLE: DETALLE, LINEAS: LINEAS
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* figura-aspecto.js — lo que se viste y se lleva en el personaje de «Su cuerpo»: ropa, calzado,
   prótesis, pelo, cara, barba, gorra o pañuelo, gafas y audífono. Coordenadas del mismo lienzo
   que figura.js (cabeza de y 26 a 117, centro x 200; ojos en y 70), mitad derecha del dibujo.
   Expone TG_FIGURA_ASP. */
(function (raiz) {
  'use strict';
  var G = raiz.TG_FIGURA_GEO, CX = G.CX, sim = G.sim, espejo = G.espejo;
  function c(p) { return [p[0], p[1], 'c']; }
  function elipse(cx, cy, rx, ry, n) {
    var ps = []; n = n || 14;
    for (var i = 0; i < n; i++) { var t = i / n * Math.PI * 2; ps.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
    return ps;
  }
  /* un borde ondulado (rizos): puntos sobre una elipse con radio alterno */
  function onda(cx, cy, rx, ry, a0, a1, n, amp) {
    var ps = [];
    for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, k = i % 2 ? -amp * 0.5 : amp; ps.push([cx + (rx + k) * Math.cos(a), cy + (ry + k) * Math.sin(a)]); }
    return ps;
  }

  /* ── la ropa de arriba (tronco y mangas, mitad derecha; las mangas van con la pieza «brazo») ── */
  var HOMBRO_PRENDA = [[223, 143], [242, 149], [262, 155.5], [279, 159.5]];
  var LADO_PRENDA = [[272, 224], [275, 244], [274, 268], [268.5, 292], [262.5, 316], [262.5, 334], [265.5, 350], [268.5, 368], [269.5, 376], [234, 379], [200, 380]];
  var ARRIBA = {
    camiseta: {
      frente: sim([[200, 151], [213, 149.5]].concat(HOMBRO_PRENDA, [[281.5, 176], [276.5, 204]], LADO_PRENDA)),
      espalda: sim([[200, 138], [214, 138.5]].concat(HOMBRO_PRENDA, [[281.5, 176], [276.5, 204]], LADO_PRENDA)),
      manga: [[264, 155], [285, 157.5], [299, 162.5], [309.5, 176], [315, 196], [316.5, 217], [315.5, 238], [314, 256], [298, 259], [281, 256.5], [277.5, 244],
        [272, 230], [265, 221], [261, 200]]
    },
    manga_larga: {
      frente: null, espalda: null,
      manga: [[264, 155], [285, 157.5], [299, 162.5], [309.5, 176], [315, 196], [316.5, 217], [315.5, 238], [313.5, 256], [314.5, 272], [315.5, 290], [314.5, 304],
        [317.5, 318], [320.5, 336], [319.5, 354], [316.5, 374], [313.5, 390], [312.8, 397], [287, 398], [286, 384], [284, 366], [282, 346], [280.5, 326],
        [280, 310], [279.5, 296], [278.5, 278], [277.5, 260], [275, 242], [267, 224], [261, 200]]
    },
    tirantes: {
      frente: sim([[200, 170], [210, 165.5], [218.5, 150], c([232, 151.5]), [236.5, 170], [244, 196], [254, 216], [266, 230], [273, 240], [274.5, 262], [269.5, 288],
        [263.5, 314], [262.5, 334], [265.5, 350], [268.5, 368], [269.5, 376], [234, 379], [200, 380]]),
      espalda: sim([[200, 160], [212, 156], [218.5, 146], c([232, 148]), [237, 168], [246, 194], [256, 214], [267, 230], [273, 240], [274.5, 262], [269.5, 288],
        [263.5, 314], [262.5, 334], [265.5, 350], [268.5, 368], [269.5, 376], [234, 379], [200, 380]]),
      manga: null
    },
    top: {
      frente: sim([[200, 204], [213, 194], [221, 160], c([232, 161]), [238.5, 186], [250, 210], [265, 227], [271.5, 240], [272, 257], [250, 261], [224, 263], [200, 263]]),
      espalda: sim([[200, 176], [213, 168], [220, 150], c([231, 151]), [236, 172], [250, 204], [266, 226], [271.5, 240], [272, 257], [250, 261], [224, 262], [200, 262]]),
      manga: null
    }
  };
  ARRIBA.manga_larga.frente = ARRIBA.camiseta.frente;
  ARRIBA.manga_larga.espalda = ARRIBA.camiseta.espalda;
  /* el cuello de la prenda (una línea más oscura) */
  var ESCOTE = {
    camiseta: { frente: [[187, 149.5], [193, 155], [200, 156.5], [207, 155], [213, 149.5]], espalda: [[186, 138.5], [200, 141.5], [214, 138.5]] },
    tirantes: { frente: [[210, 165.5], [204, 170.5], [200, 171], [196, 170.5], [190, 165.5]], espalda: [[212, 156], [200, 161], [188, 156]] },
    top: { frente: [[213, 194], [206, 201], [200, 205], [194, 201], [187, 194]], espalda: [[213, 168], [200, 177], [187, 168]] }
  };
  ESCOTE.manga_larga = ESCOTE.camiseta;

  /* ── la ropa de abajo (cintura y piernas; «mixta»: por encima de y 392 se deforma como el tronco) ── */
  var ABAJO = {
    corto: sim([[200, 340], [232, 338], [260, 336], [266, 350], [272, 372], [274, 396], [273.5, 420], [271.5, 446], [270, 468], [242, 472.5], c([214, 467.5]),
      [210.5, 440], [207, 420], [200, 413]]),
    mallas_cortas: sim([[200, 342], [232, 340], [259, 338], [264.5, 350], [270, 370], [272.3, 392], [272.3, 412], [270.8, 432], [268.5, 452], [265.5, 478],
      [263.5, 492], [238, 496.5], c([215.5, 492]), [212, 470], [209.5, 440], [206.5, 420], [200, 411]]),
    mallas: sim([[200, 342], [232, 340], [259, 338], [264.5, 350], [270, 370], [272.3, 392], [272.3, 410], [271.3, 430], [268.5, 452], [264, 480], [259, 510],
      [254.5, 536], [251.5, 556], [252, 572], [255.5, 592], [257, 612], [255, 636], [249.5, 666], [244, 698], [240, 722], [238.8, 735], c([219, 736]), [219, 718],
      [217, 690], [214, 660], [211, 632], [210, 608], [212, 586], [215, 566], [216, 550], [215.5, 530], [214, 500], [211, 470], [208, 440], [205.5, 420], [200, 411]]),
    largo: sim([[200, 340], [232, 338], [260, 336], [267, 350], [273, 372], [275, 396], [274.5, 420], [272.5, 446], [269.5, 476], [265.5, 506], [261.5, 534],
      [258.5, 560], [259, 590], [259, 620], [257, 650], [254, 680], [250.5, 710], [248.5, 739], c([216, 741]), [215, 712], [214, 684], [212, 654], [211, 624],
      [211, 594], [213, 566], [213, 540], [211, 510], [209, 480], [207, 450], [205, 424], [200, 414]])
  };
  var CINTURA = { corto: 340, mallas_cortas: 342, mallas: 342, largo: 340 };

  /* ── calzado ── */
  var CALZADO = {
    zapatillas: {
      frente: [[218.5, 735], [216.5, 746], [212.5, 758], [212, 768.5], [219, 775], [236, 776.5], [248, 773.5], [250.5, 765.5], [247.5, 752], [240.5, 736]],
      espalda: [[219.5, 734], [218, 750], [219, 766], [226, 774], [236.5, 774], [242.5, 766.5], [243, 750], [240.5, 734]],
      suela: { frente: [[212.3, 766], [250.4, 763.5]], espalda: [[218.8, 765], [243, 765]] }
    },
    botas: {
      frente: [[218.5, 700], [218.5, 722], [216.5, 746], [212.5, 758], [212, 768.5], [219, 775], [236, 776.5], [248, 773.5], [250.5, 765.5], [247.5, 750], [243.5, 726], [244, 700]],
      espalda: [[218.5, 700], [218, 724], [218, 750], [219, 766], [226, 774], [236.5, 774], [242.5, 766.5], [243, 750], [243.5, 724], [244, 700]],
      suela: { frente: [[212.3, 766], [250.4, 763.5]], espalda: [[218.8, 765], [243, 765]] }
    }
  };

  /* ── prótesis (lado derecho del dibujo; se refleja si toca) ── */
  var PROTESIS = {
    /* encaje bajo la rodilla, tubo y pie */
    pierna: {
      corte: [[202, 404], [236, 398], [262, 392], [269, 394], [271.5, 408], [270.5, 428], [267.5, 452], [263, 480], [258, 510], [253.5, 536], [250.5, 556],
        [251, 572], [252, 590], [216, 590], [216, 566], [217, 550], [216.5, 530], [215, 500], [212, 470], [209, 440], [206, 420]],
      encaje: [[217, 572], [251, 572], [251.5, 592], [246, 612], [238, 622], [230, 622], [222, 612], [216.5, 592]],
      tubo: [[230.5, 620], [237.5, 620], [236.5, 738], [231.5, 738]],
      pie: [[221, 736], [244, 736], [248, 752], [250, 766], [244, 774], [222, 774], [214, 768], [215, 752]]
    },
    /* encaje bajo el codo, antebrazo de carcasa y mano */
    brazo: {
      corte: [[268, 157], [284, 159], [296, 164], [305, 176], [310, 195], [312, 216], [311, 236], [308, 252], [310, 268], [311, 286], [310, 302], [311, 314],
        [281, 314], [281, 310], [280.5, 296], [279.5, 278], [278.5, 260], [276, 242], [268, 224]],
      encaje: [[281, 300], [311, 300], [314, 318], [312, 336], [304, 346], [292, 346], [284.5, 336], [281.5, 318]],
      tubo: [[293.5, 342], [302, 342], [304, 392], [295, 392]],
      mano: [[290.5, 390], [306.5, 390], [310, 402], [311.5, 418], [309.5, 436], [306, 452], [301, 458], [295, 456], [290.5, 446], [287.5, 428], [287.5, 408]]
    }
  };

  /* ── el pelo ── (atras: detrás de la cabeza y del cuerpo; delante: encima de la cabeza) */
  var CASCO = {   /* el pelo pegado al cráneo, con la línea de nacimiento en la frente */
    frente: sim([[200, 22.5], [218, 24.5], [229.5, 33], [234.5, 47], [235.5, 62], [233, 70], [230.5, 60], [226, 48], [214, 41], [200, 40]]),
    espalda: sim([[200, 22.5], [218, 24.5], [229.5, 33], [234.5, 47], [235.5, 64], [233.5, 84], [227, 100], [214, 107], [200, 108.5]])
  };
  function pelo(estilo, vista) {
    var F = vista !== 'espalda', r = { atras: [], delante: [], encima: [], opacidad: 1, tapaOrejas: false };
    if (estilo === 'calvo') return r;
    if (estilo === 'rapado') {
      r.opacidad = 0.62;
      r.delante.push(F ? sim([[200, 25], [217, 27], [227.5, 35], [232, 48], [232.8, 63], [231, 68], [228.5, 58], [224.5, 48], [213.5, 42.5], [200, 42]])
                       : sim([[200, 25], [217, 27], [227.5, 35], [232, 48], [232.8, 64], [231, 84], [225, 99], [213, 106], [200, 107.5]]));
    } else if (estilo === 'corto') {
      r.delante.push(F ? sim([[200, 19], [219, 21.5], [231.5, 31], [236.5, 46], [237, 62], [234, 70], [231, 58], [226.5, 46.5], [214, 39], [205, 41], [200, 37.5]])
                       : sim([[200, 19], [219, 21.5], [231.5, 31], [236.5, 46], [237, 64], [234.5, 86], [228, 101], [215, 108.5], [200, 110]]));
    } else if (estilo === 'medio') {
      r.tapaOrejas = true;
      r.delante.push(F ? sim([[200, 18], [220, 20.5], [233.5, 31], [239, 48], [240, 70], [239.5, 92], [236, 106], [230.5, 103], [231.5, 84], [231, 64], [227, 50],
        [216, 42], [204, 44], [200, 41]])
                       : sim([[200, 18], [220, 20.5], [233.5, 31], [239, 48], [240, 72], [240, 96], [236, 112], [220, 117], [200, 118.5]]));
    } else if (estilo === 'largo') {
      r.tapaOrejas = true;
      if (F) {
        r.atras.push(sim([[200, 24], [226, 28], [240, 50], [243, 92], [247, 136], [250, 168], [243, 182], [200, 186]]));
        r.delante.push(sim([[200, 18], [220, 20.5], [233.5, 31], [239, 48], [240, 72], [240.5, 104], [244, 132], [246, 158], [239, 170], [232.5, 160], [231, 128],
          [231.5, 92], [229, 62], [222, 48], [210, 42], [200, 43]]));
      } else r.delante.push(sim([[200, 18], [220, 20.5], [233.5, 31], [239, 48], [240.5, 76], [243, 110], [247, 146], [250, 172], [243, 184], [200, 188]]));
    } else if (estilo === 'rizado') {
      r.tapaOrejas = true;
      var arco = onda(200, 66, 41, 46, -Math.PI / 2, Math.PI * 0.16, 9, 3);
      if (F) r.delante.push(sim(arco.concat([[236, 98], [230.5, 100], [231, 82], [230, 62], [224, 48], [214, 44], [207, 47], [200, 44]])));
      else r.delante.push(sim(arco.concat([[238, 100], [232, 110], [216, 115], [200, 116]])));
    } else if (estilo === 'afro') {
      r.tapaOrejas = true;
      var circ = onda(200, 58, 54, 52, 0, Math.PI * 2, 24, 2.8).slice(0, 24);
      if (F) {
        r.atras.push(circ);
        var a0 = Math.PI * 0.12, alto = onda(200, 58, 54, 52, a0, -Math.PI - a0, 12, 2.8);
        r.delante.push(alto.concat([[152, 74], [158, 58], [170, 48], [186, 46], [200, 42], [214, 46], [230, 48], [242, 58], [248, 74]]));
      } else r.delante.push(circ);
    } else if (estilo === 'mono') {
      var bollo = F ? elipse(200, 16, 13.5, 12) : elipse(200, 36, 14.5, 13);
      if (F) { r.delante.push(bollo); r.delante.push(CASCO.frente); }
      else { r.delante.push(CASCO.espalda); r.encima.push(bollo); }
    } else if (estilo === 'coleta') {
      if (F) r.atras.push([[212, 40], [226, 46], [236, 70], [241, 104], [238, 136], [231, 124], [229.5, 98], [222, 70], [208, 50]]);
      r.delante.push(CASCO[F ? 'frente' : 'espalda']);
      if (!F) r.encima.push([[193, 42], [207, 42], [213.5, 70], [211.5, 108], [205, 146], [195, 146], [188.5, 108], [186.5, 70]]);
    } else if (estilo === 'trenzas') {
      r.delante.push(CASCO[F ? 'frente' : 'espalda']);
      r.trenzas = [];
      var x0 = F ? 231 : 212, x1 = F ? 238 : 217, y0 = F ? 80 : 88, y1 = F ? 170 : 176, n = 8;
      for (var i = 0; i < n; i++) {
        var t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        r.trenzas.push(elipse(x, y, 6.2 - i * 0.22, 7.2, 12));
      }
    }
    return r;
  }

  /* ── la barba (solo de frente) ── */
  var BARBA = {
    bigote: sim([[200, 93.2], [206.5, 92.2], [213, 94.6], [215, 98.4], [208.6, 97.4], [200, 96.8]]),
    perilla: sim([[200, 99], [205.5, 98.6], [210, 101], [211.2, 106.5], [208.6, 114], [204, 118.8], [200, 119.8]]),
    corta: sim([[200, 92.6], [207.5, 92.2], [214.5, 94.8], [222.5, 88.5], [228.5, 74], [231, 75], [230, 92], [222.5, 106], [211, 115.5], [200, 118.5]]),
    larga: sim([[200, 92.6], [207.5, 92.2], [214.5, 94.8], [222.5, 88.5], [228.5, 74], [231.5, 75], [231, 96], [226, 114], [214.5, 128], [200, 133]])
  };

  /* ── gorra y pañuelo ── */
  var CABEZA = {
    gorra: {
      frente: { copa: sim([[200, 17.5], [219, 19.5], [231.5, 28], [237, 42], [237.5, 54], [226, 52], [212, 50.5], [200, 50.5]]),
                visera: sim([[200, 49], [216, 49.6], [233, 52.5], [244, 57], [240, 61.5], [222, 59], [200, 58.6]]) },
      espalda: { copa: sim([[200, 17.5], [219, 19.5], [231.5, 28], [237, 42], [237.8, 58], [228, 60], [212, 61], [200, 61]]),
                 visera: null, cierre: elipse(200, 55, 8, 5, 10) }
    },
    panuelo: {
      frente: { copa: sim([[200, 18.5], [219, 20.5], [232, 30], [237.5, 46], [238, 64], [234.5, 68], [229, 52], [218, 44], [200, 42]]), nudo: null },
      espalda: { copa: sim([[200, 18.5], [219, 20.5], [232, 30], [237.5, 46], [238, 66], [233.5, 82], [222, 92], [200, 94]]),
                 nudo: [[194, 88], [206, 88], [210, 96], [216, 122], [208, 124], [200, 100], [192, 124], [184, 122], [190, 96]] }
    }
  };

  raiz.TG_FIGURA_ASP = {
    ARRIBA: ARRIBA, ESCOTE: ESCOTE, ABAJO: ABAJO, CINTURA: CINTURA, CALZADO: CALZADO, PROTESIS: PROTESIS,
    pelo: pelo, BARBA: BARBA, CABEZA: CABEZA, elipse: elipse
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* figura-svg.js — monta el SVG del personaje con la geometría de figura.js y el aspecto de figura-aspecto.js.
   Modo «musculos»: un maniquí pizarra con unos treinta músculos con volumen (degradado radial por
   nivel, fibras finas y juntas), del gris al oro según las series de la semana.
   TG_FIGURA.svg({ vista, modo, aspecto, niveles, sel, id, etiqueta, viewBox }) → texto '<svg …>'. */
(function (raiz) {
  'use strict';
  var G = raiz.TG_FIGURA_GEO, curva = G.curva, linea = G.linea, espejo = G.espejo;

  /* diez tonos propios («Tono 1» a «Tono 10») y uno no realista, para quien no quiera representarse */
  var PIEL = ['#F6E1D3', '#EFCDB4', '#E5B897', '#D9A57E', '#C68A62', '#AD7350', '#8F5B3D', '#74472F', '#5A3623', '#432618', '#AEB6CF'];
  var PELO_COLOR = ['#1F1A17', '#3B2A20', '#6B4630', '#A07845', '#D8B26E', '#A8492A', '#8E8E8E', '#E3E1DC', '#3D6FD1', '#D76A9F'];
  var ROPA_COLOR = ['#1D2230', '#7C8796', '#EEF0F3', '#1F3B73', '#2F80ED', '#1FB5A8', '#3E9B4F', '#D4AF37', '#D64545', '#E66FA3'];
  var OPC = {
    fig: ['a', 'b'], comp: [0, 1, 2],
    pelo: ['calvo', 'rapado', 'corto', 'medio', 'largo', 'rizado', 'afro', 'mono', 'coleta', 'trenzas'],
    barba: ['no', 'bigote', 'perilla', 'corta', 'larga'],
    cabeza: ['no', 'gorra', 'panuelo'],
    gafas: ['no', 'gafas', 'sol'],
    audifono: ['no', 'izq', 'der', 'ambos'],
    protesis: ['no', 'pierna_izq', 'pierna_der', 'brazo_izq', 'brazo_der'],
    arriba: ['camiseta', 'tirantes', 'top', 'manga_larga', 'sin'],
    abajo: ['corto', 'mallas_cortas', 'mallas', 'largo'],
    calzado: ['zapatillas', 'botas', 'descalzo']
  };
  var COLORES = { piel: PIEL.length, peloColor: PELO_COLOR.length, arribaColor: ROPA_COLOR.length, abajoColor: ROPA_COLOR.length, calzadoColor: ROPA_COLOR.length };
  var DEF = { fig: 'a', comp: 1, piel: 3, pelo: 'corto', peloColor: 2, barba: 'no', cabeza: 'no', gafas: 'no', audifono: 'no', protesis: 'no',
              arriba: 'camiseta', arribaColor: 7, abajo: 'corto', abajoColor: 0, calzado: 'zapatillas', calzadoColor: 2 };
  function normaliza(a) {
    var r = {}, k;
    a = (a && typeof a === 'object') ? a : {};
    for (k in DEF) {
      var v = a[k];
      if (OPC[k]) r[k] = OPC[k].indexOf(v) >= 0 ? v : DEF[k];
      else if (COLORES[k]) r[k] = (typeof v === 'number' && v >= 0 && v < COLORES[k] && Math.floor(v) === v) ? v : DEF[k];
    }
    return r;
  }

  /* Los niveles (31-10-2026): grafito para «sin trabajar» y una rampa de oro con saltos grandes de
     claridad (OKLCH L 0,36 · 0,65 · 0,79 · 0,93; antes 0,45 · 0,73 · 0,82 · 0,92, y los dos primeros
     oros se confundían). Contraste WCAG con «sin trabajar»: 3,29, 5,58 y 8,87 (1.4.11 pide 3:1). Los
     huesos y tendones, casi del color del cuerpo: antes, claros, parecían piezas de un robot. */
  var MUSC = {
    trazo: '#05070B', base: '#202937', baseClaro: '#2C3747', junta: '#0E131A',
    hueso: '#3B4759', tendon: '#344052',
    nivel: ['#333E4D', '#B58531', '#E0B44C', '#FFE79E'], sel: '#FFF6DC'
  };
  /* la luz y la sombra de cada nivel: el grafito con un brillo frío, el oro con sombra cálida (pan de oro) */
  var LUZ = [['#A9BEDB', 0.2, '#020306', 0.42], ['#FFF1C9', 0.3, '#3D2504', 0.5], ['#FFF6DD', 0.34, '#4A2F06', 0.42], ['#FFFFFF', 0.55, '#7A5A16', 0.3]];

  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function hex(c) { return '#' + c.map(function (v) { var s = Math.round(Math.max(0, Math.min(255, v))).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }
  function mezcla(a, b, t) { var x = rgb(a), y = rgb(b); return hex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  function lum(h) {
    var c = rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function attr(o) { var s = ''; for (var k in o) if (o[k] != null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function path(d, o) { return '<path d="' + d + '"' + attr(o || {}) + '/>'; }

  /* el volumen: la luz viene de arriba a la izquierda; cada forma recibe su propio degradado */
  function degradado(id, color, claro, oscuro, tintaLuz, tintaSombra) {
    return '<radialGradient id="' + id + '" cx="0.44" cy="0.40" r="0.78" fx="0.36" fy="0.28">' +
      '<stop offset="0" stop-color="' + mezcla(color, tintaLuz || '#FFFFFF', claro) + '"/>' +
      '<stop offset="0.48" stop-color="' + color + '"/>' +
      '<stop offset="1" stop-color="' + mezcla(color, tintaSombra || '#000000', oscuro) + '"/></radialGradient>';
  }

  /* el lado de la persona en el dibujo: de frente su izquierda cae a la derecha del dibujo */
  function ladoDe(cual, vista) { var l = vista === 'espalda' ? -1 : 1; return cual === 'izq' ? l : -l; }
  /* qué lado del dibujo lleva la prótesis de pierna o de brazo (1 derecha, -1 izquierda, 0 ninguno) */
  function ladoProtesis(a, vista, que) { return a.protesis.indexOf(que) === 0 ? ladoDe(a.protesis.slice(que.length + 1), vista) : 0; }
  /* hasta dónde llega el muñón (la y más baja de su forma): lo que pase de ahí no se dibuja en ese lado */
  function hondo(ps) { return Math.max.apply(null, ps.map(function (q) { return q[1]; })); }
  var CORTE = null;
  function corte() {
    if (!CORTE) { var P = raiz.TG_FIGURA_ASP.PROTESIS; CORTE = { pierna: hondo(P.pierna.corte), brazo: hondo(P.brazo.corte) }; }
    return CORTE;
  }
  function pasaDelCorte(pieza, forma) { var c = corte()[pieza]; return c != null && hondo(forma) > c; }
  /* una capa con un solo contorno: primero los trazos, luego los rellenos */
  function capa(ds, relleno, trazo, grosor) {
    return '<g fill="' + trazo + '" stroke="' + trazo + '" stroke-width="' + (grosor || 2.4) + '" stroke-linejoin="round">' + ds.map(function (d) { return path(d); }).join('') + '</g>' +
      '<g fill="' + relleno + '">' + ds.map(function (d) { return path(d); }).join('') + '</g>';
  }
  var PROTO = { relleno: '#7D8796', encaje: '#5E6878', mano: '#8E98A8', trazo: '#3C4452' };
  /* las piezas de la prótesis (después del cuerpo: el encaje tapa el final del muñón) */
  function piezasProtesis(forma, proP, proB, conPie) {
    var P = raiz.TG_FIGURA_ASP.PROTESIS, s = '';
    if (proP && conPie) s += capa([forma('pierna', P.pierna.pie, proP)], PROTO.mano, PROTO.trazo, 2.2);
    if (proP) s += capa([forma('pierna', P.pierna.tubo, proP)], PROTO.relleno, PROTO.trazo, 2) + capa([forma('pierna', P.pierna.encaje, proP)], PROTO.encaje, PROTO.trazo, 2.2);
    if (proB) s += capa([forma('brazo', P.brazo.tubo, proB)], PROTO.relleno, PROTO.trazo, 2) + capa([forma('brazo', P.brazo.mano, proB)], PROTO.mano, PROTO.trazo, 2.2) +
      capa([forma('brazo', P.brazo.encaje, proB)], PROTO.encaje, PROTO.trazo, 2.2);
    return s;
  }
  /* la raíz del SVG: el viewBox solo con cuatro números y la etiqueta escapada */
  function raizSvg(o, vista, contenido) {
    var vb = /^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/.test(String(o.viewBox || '')) ? o.viewBox : '0 0 400 800';
    var et = o.etiqueta ? ' role="img" aria-label="' + String(o.etiqueta).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }) + '"' : ' aria-hidden="true"';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="100%" height="100%" class="tgf-svg tgf-' + vista + '"' + et + ' focusable="false">' + contenido + '</svg>';
  }

  function svgAspecto(o, vista, id, a) {
    var A = raiz.TG_FIGURA_ASP;
    var def = G.deformador(a.fig, a.comp);
    var F = vista === 'frente';
    var piel = PIEL[a.piel], pelo = PELO_COLOR[a.peloColor];
    var cArriba = ROPA_COLOR[a.arribaColor], cAbajo = ROPA_COLOR[a.abajoColor], cCalzado = ROPA_COLOR[a.calzadoColor];
    function oscuro(c, t) { return mezcla(c, '#000000', t == null ? 0.55 : t); }
    var cCabeza = a.cabeza === 'gorra' ? cArriba : mezcla(cArriba, '#FFFFFF', 0.15);
    function tela(n, c) {
      return '<linearGradient id="' + id + '-' + n + '" x1="0" y1="0" x2="1" y2="0.18"><stop offset="0" stop-color="' + mezcla(c, '#FFFFFF', 0.16) + '"/>' +
        '<stop offset="0.5" stop-color="' + c + '"/><stop offset="1" stop-color="' + mezcla(c, '#000000', 0.3) + '"/></linearGradient>';
    }
    function forma(pieza, ps, lado) { return curva(def(pieza, lado < 0 ? espejo(ps) : ps)); }
    function dos(pieza, ps) { return [forma(pieza, ps, 1), forma(pieza, ps, -1)]; }
    /* prótesis: qué lado del dibujo (1 derecha, -1 izquierda) */
    var proP = ladoProtesis(a, vista, 'pierna'), proB = ladoProtesis(a, vista, 'brazo');

    var d = '<defs>' +
      '<linearGradient id="' + id + '-piel" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="' + mezcla(piel, '#FFFFFF', 0.14) + '"/>' +
      '<stop offset="0.55" stop-color="' + piel + '"/><stop offset="1" stop-color="' + mezcla(piel, '#3A1E10', 0.2) + '"/></linearGradient>' +
      '<radialGradient id="' + id + '-vol" cx="0.45" cy="0.42" r="0.7"><stop offset="0.55" stop-color="' + mezcla(piel, '#3A1E10', 0.5) + '" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="' + mezcla(piel, '#3A1E10', 0.5) + '" stop-opacity="0.28"/></radialGradient>' +
      /* la tela: cada pieza con su propio degradado (luz a la izquierda, sombra a la derecha), como la piel; el
         velo común de antes, encima de piezas solapadas con giro contrario, dejaba una mancha en el hombro */
      tela('arriba', cArriba) + tela('abajo', cAbajo) + tela('calzado', cCalzado) + tela('cabeza', cCabeza) +
      (o.brillo !== false ? '<filter id="' + id + '-halo" x="-25%" y="-12%" width="150%" height="124%"><feGaussianBlur stdDeviation="10"/></filter>' : '') +
      '</defs>';
    var s = '<ellipse cx="200" cy="777" rx="72" ry="6.5" fill="#000" opacity="0.4"/>', HALO = '[[halo]]';
    s += HALO;   /* la luz de detrás va aquí, debajo del pelo de atrás (se pone cuando se sabe la silueta) */

    var P = A.pelo(a.pelo, vista);
    if (a.cabeza !== 'no') { P.atras = []; P.delante = []; P.encima = []; P.trenzas = null; }
    if (P.atras.length) s += capa(P.atras.map(function (ps) { return curva(ps); }), pelo, oscuro(pelo, 0.5), 2.2);

    /* la piel */
    var pielP = [curva(def('cabeza', G.CABEZA))].concat(dos('cabeza', G.OREJA), [curva(def('tronco', G.CUELLO))]);
    [1, -1].forEach(function (lado) {
      pielP.push(forma('pierna', proP === lado ? A.PROTESIS.pierna.corte : G.PIERNA, lado));
      if (proP !== lado) pielP.push(forma('pierna', F ? G.PIE_FRENTE : G.PIE_ESPALDA, lado));
    });
    pielP.push(curva(def('tronco', G.TRONCO)));
    [1, -1].forEach(function (lado) {
      pielP.push(forma('brazo', proB === lado ? A.PROTESIS.brazo.corte : G.BRAZO, lado));
      if (proB !== lado) pielP.push(forma('brazo', G.MANO, lado));
    });
    /* la luz de detrás, como en «Músculos»: separa la figura del fondo */
    s = s.replace(HALO, o.brillo !== false ? '<g filter="url(#' + id + '-halo)" fill="#7193C4" opacity="0.26" pointer-events="none">' + pielP.map(function (x) { return path(x); }).join('') + '</g>' : '');
    s += capa(pielP, 'url(#' + id + '-piel)', oscuro(piel, 0.6), 2.4);
    /* el volumen bajo la piel: los mismos músculos, solo como sombra suave en sus bordes */
    var vol = '';
    G.MUSCULOS.forEach(function (mu) {
      if (mu.vista !== vista) return;
      mu.formas.forEach(function (f) {
        [1, -1].forEach(function (lado) {
          if ((proP === lado && mu.pieza === 'pierna' || proB === lado && mu.pieza === 'brazo') && pasaDelCorte(mu.pieza, f)) return;
          vol += path(forma(mu.pieza, f, lado));
        });
      });
    });
    d = d.replace('</defs>', '<clipPath id="' + id + '-piel-c">' + pielP.map(function (x) { return path(x); }).join('') + '</clipPath></defs>');
    s += '<g fill="url(#' + id + '-vol)" pointer-events="none" clip-path="url(#' + id + '-piel-c)">' + vol + '</g>';
    if (F) {
      /* clavículas, ombligo y rodillas, muy suaves */
      var sutil = oscuro(piel, 0.35);
      s += '<g fill="none" stroke="' + sutil + '" stroke-opacity="0.55" stroke-width="1.1" stroke-linecap="round">' +
        path('M206 152Q232 150 270 160') + path('M194 152Q168 150 130 160') + '</g>';
      s += '<ellipse cx="200.5" cy="306" rx="1.8" ry="2.6" fill="' + oscuro(piel, 0.3) + '" opacity="0.7"/>';
    }

    /* la prótesis (antes que la ropa: un pantalón largo o una manga la tapan) */
    s += piezasProtesis(forma, proP, proB, false);

    /* la cara */
    if (F) s += cara(a, piel, pelo);

    /* la ropa de abajo */
    var ab = A.ABAJO[a.abajo];
    if (ab) {
      var dAb = curva(def('mixta', ab));
      s += capa([dAb], 'url(#' + id + '-abajo)', oscuro(cAbajo, 0.55), 2.2);
      var cy = A.CINTURA[a.abajo];
      s += path(curva(def('mixta', [[200 - 61, cy], [261, cy - 2], [262.5, cy + 6], [200 - 62.5, cy + 8]].map(function (p) { return p; }))), { fill: oscuro(cAbajo, 0.2), opacity: 0.8 });
      if (a.abajo === 'corto' || a.abajo === 'largo') s += path(G.linea(def('mixta', [[200, cy + 8], [200, 412]])), { fill: 'none', stroke: oscuro(cAbajo, 0.45), 'stroke-width': 1.1 });
    }
    /* el calzado */
    if (a.calzado !== 'descalzo') {
      var cz = A.CALZADO[a.calzado], fz = F ? cz.frente : cz.espalda;
      var pies = [forma('pierna', fz, 1), forma('pierna', fz, -1)];
      s += capa(pies, 'url(#' + id + '-calzado)', oscuro(cCalzado, 0.6), 2.2);
      var su = cz.suela[F ? 'frente' : 'espalda'];
      [1, -1].forEach(function (lado) {
        var q = def('pierna', lado < 0 ? espejo(su) : su);
        s += path('M' + q[0][0] + ' ' + q[0][1] + 'L' + q[1][0] + ' ' + q[1][1], { stroke: mezcla(cCalzado, '#FFFFFF', 0.55), 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.9 });
      });
    } else if (proP) {
      s += capa([forma('pierna', A.PROTESIS.pierna.pie, proP)], PROTO.mano, PROTO.trazo, 2.2);
    }
    /* la ropa de arriba */
    var ar = A.ARRIBA[a.arriba];
    if (ar) {
      var dsAr = [curva(def('tronco', F ? ar.frente : ar.espalda))];
      if (ar.manga) [1, -1].forEach(function (lado) {
        if (proB === lado && a.arriba === 'manga_larga') dsAr.push(forma('brazo', ar.manga.filter(function (p) { return p[1] < 330; }).concat([[311, 330], [281, 330]]), lado));
        else dsAr.push(forma('brazo', ar.manga, lado));
      });
      s += capa(dsAr, 'url(#' + id + '-arriba)', oscuro(cArriba, 0.55), 2.2);
      var es = A.ESCOTE[a.arriba];
      if (es) s += path(G.linea(def('tronco', es[F ? 'frente' : 'espalda'])), { fill: 'none', stroke: oscuro(cArriba, 0.5), 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    }

    /* el pelo y lo que va en la cabeza */
    if (P.delante.length) s += '<g opacity="' + P.opacidad + '">' + capa(P.delante.map(function (ps) { return curva(ps); }), pelo, oscuro(pelo, 0.5), 2.2) + '</g>';
    if (P.trenzas) [1, -1].forEach(function (lado) { s += capa(P.trenzas.map(function (ps) { return curva(lado < 0 ? espejo(ps) : ps); }), pelo, oscuro(pelo, 0.5), 1.8); });
    if (P.encima && P.encima.length) s += capa(P.encima.map(function (ps) { return curva(ps); }), pelo, oscuro(pelo, 0.5), 2.2);
    if (a.cabeza !== 'no') {
      var cb = A.CABEZA[a.cabeza][F ? 'frente' : 'espalda'], cc = cCabeza;
      var dsCb = [curva(cb.copa)];
      if (cb.nudo) dsCb.unshift(curva(cb.nudo));
      s += capa(dsCb, 'url(#' + id + '-cabeza)', oscuro(cc, 0.55), 2.2);
      if (cb.visera) s += capa([curva(cb.visera)], oscuro(cc, 0.18), oscuro(cc, 0.6), 2);
      if (cb.cierre) s += path(curva(cb.cierre), { fill: oscuro(cc, 0.45) });
    }
    if (F && a.gafas !== 'no') s += gafas(a.gafas);
    if (a.audifono !== 'no') {
      ['izq', 'der'].forEach(function (l) {
        if (a.audifono !== 'ambos' && a.audifono !== l) return;
        var lado = ladoDe(l, vista), ps = [[233, 60], [238.5, 61], [240.5, 70], [238.5, 80], [235, 81], [236.5, 70]];
        s += capa([curva(lado < 0 ? espejo(ps) : ps)], '#C9CED6', '#4A5160', 1.6);
      });
    }
    return d + s;
  }

  function cara(a, piel, colorPelo) {
    var sombra = mezcla(piel, '#2a140a', 0.3), oscura = lum(piel) < 0.12;
    var labio = oscura ? mezcla(piel, '#E3A592', 0.42) : mezcla(piel, '#8A3B2E', 0.45);
    var ceja = a.pelo === 'calvo' || a.pelo === 'rapado' ? mezcla(piel, '#1a0f0a', 0.6) : mezcla(colorPelo, '#000000', 0.25);
    var s = '';
    s += path('M186 111Q200 124 214 111L213 121Q200 128 187 121Z', { fill: sombra, opacity: 0.35 });
    [187, 213].forEach(function (x) {
      s += path('M' + (x - 5.6) + ' 70Q' + x + ' 65.4 ' + (x + 5.6) + ' 70Q' + x + ' 74.2 ' + (x - 5.6) + ' 70Z', { fill: '#FBF8F3' });
      s += '<circle cx="' + x + '" cy="70" r="2.6" fill="#3A2A20"/><circle cx="' + x + '" cy="70" r="1.25" fill="#120c09"/>';
      s += '<circle cx="' + (x + 0.9) + '" cy="69.1" r="0.75" fill="#ffffff"/>';
      s += path('M' + (x - 6) + ' 70Q' + x + ' 64.6 ' + (x + 6) + ' 70', { fill: 'none', stroke: '#2b1f19', 'stroke-width': 1.3, 'stroke-linecap': 'round' });
    });
    s += path('M180.5 63Q187 59.2 194 61.6', { fill: 'none', stroke: ceja, 'stroke-width': 2.3, 'stroke-linecap': 'round' });
    s += path('M219.5 63Q213 59.2 206 61.6', { fill: 'none', stroke: ceja, 'stroke-width': 2.3, 'stroke-linecap': 'round' });
    s += path('M200.5 72Q197.6 82.5 198.8 86.6Q200.8 88.2 203.6 86.8', { fill: 'none', stroke: sombra, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    s += path('M192.5 99.6Q200 101.8 207.5 99.6Q200 106.4 192.5 99.6Z', { fill: labio });
    var b = a.barba !== 'no' ? raiz.TG_FIGURA_ASP.BARBA[a.barba] : null;
    if (b) {
      var cb = a.pelo === 'calvo' ? mezcla(piel, '#1a0f0a', 0.65) : colorPelo;
      s += path(curva(b), { fill: cb, opacity: a.barba === 'corta' ? 0.62 : 0.95 });
    }
    return s;
  }
  function gafas(tipo) {
    var sol = tipo === 'sol', s = '';
    [187, 213].forEach(function (x) {
      s += '<rect x="' + (x - 8.5) + '" y="64.5" width="17" height="11.5" rx="4.2" fill="' + (sol ? '#1B2230' : '#E8F2FF') + '" fill-opacity="' + (sol ? 0.92 : 0.22) +
        '" stroke="#1C2230" stroke-width="1.6"/>';
    });
    s += path('M195.5 69.5Q200 67.2 204.5 69.5', { fill: 'none', stroke: '#1C2230', 'stroke-width': 1.6 });
    s += path('M178.5 68.5L170 66.5M221.5 68.5L230 66.5', { fill: 'none', stroke: '#1C2230', 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    return s;
  }

  function svg(o) {
    o = o || {};
    var vista = o.vista === 'espalda' ? 'espalda' : 'frente';
    var id = String(o.id || 'tgf').replace(/[^a-zA-Z0-9_-]/g, '');
    var a = normaliza(o.aspecto);
    /* «aspecto» salvo que se pida «musculos» (como el personaje anterior) */
    if (o.modo !== 'musculos') return raizSvg(o, vista, svgAspecto(o, vista, id, a));
    var def = G.deformador(a.fig, a.comp);
    var niveles = o.niveles || {}, sel = o.sel || null;
    /* con prótesis, ese lado lleva el muñón y la prótesis, y no los músculos que pasan del corte */
    var proP = ladoProtesis(a, vista, 'pierna'), proB = ladoProtesis(a, vista, 'brazo');
    function forma(pieza, ps, lado) { return curva(def(pieza, lado < 0 ? espejo(ps) : ps)); }
    function quita(pieza, ps, lado) { return (pieza === 'pierna' && proP === lado || pieza === 'brazo' && proB === lado) && pasaDelCorte(pieza, ps); }
    function dos(pieza, ps) { var r = []; [1, -1].forEach(function (lado) { if (!quita(pieza, ps, lado)) r.push(forma(pieza, ps, lado)); }); return r; }

    /* las piezas del cuerpo: cabeza, orejas, cuello, tronco, brazos, manos, piernas y pies */
    var piezas = [];
    piezas.push(curva(def('cabeza', G.CABEZA)));
    piezas = piezas.concat(dos('cabeza', G.OREJA));
    piezas.push(curva(def('tronco', G.CUELLO)));
    var P = raiz.TG_FIGURA_ASP.PROTESIS;
    [1, -1].forEach(function (lado) {
      if (proP === lado) piezas.push(forma('pierna', P.pierna.corte, lado));
      else piezas.push(forma('pierna', G.PIERNA, lado), forma('pierna', vista === 'frente' ? G.PIE_FRENTE : G.PIE_ESPALDA, lado));
    });
    piezas.push(curva(def('tronco', G.TRONCO)));
    [1, -1].forEach(function (lado) {
      if (proB === lado) piezas.push(forma('brazo', P.brazo.corte, lado));
      else piezas.push(forma('brazo', G.BRAZO, lado), forma('brazo', G.MANO, lado));
    });

    var d = '<defs>' +
      '<linearGradient id="' + id + '-cuerpo" x1="0" y1="0" x2="1" y2="0.25">' +
      '<stop offset="0" stop-color="' + MUSC.baseClaro + '"/><stop offset="0.55" stop-color="' + MUSC.base + '"/>' +
      '<stop offset="1" stop-color="' + mezcla(MUSC.base, '#000000', 0.25) + '"/></linearGradient>';
    for (var n = 0; n < 4; n++) d += degradado(id + '-n' + n, MUSC.nivel[n], LUZ[n][1], LUZ[n][3], LUZ[n][0], LUZ[n][2]);
    d += degradado(id + '-hueso', MUSC.hueso, 0.16, 0.34, '#A9BEDB', '#020306') + degradado(id + '-tendon', MUSC.tendon, 0.14, 0.34, '#A9BEDB', '#020306');
    d += '<clipPath id="' + id + '-silueta">' + piezas.map(function (p) { return path(p); }).join('') + '</clipPath>';
    /* la luz de detrás (separa la figura del fondo) y el brillo del oro de 10 series o más */
    var brillo = o.brillo !== false;
    if (brillo) d += '<filter id="' + id + '-halo" x="-25%" y="-12%" width="150%" height="124%"><feGaussianBlur stdDeviation="10"/></filter>' +
      '<filter id="' + id + '-brillo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>';
    d += '</defs>';

    var s = '';
    /* sombra en el suelo */
    s += '<ellipse cx="200" cy="776" rx="74" ry="7" fill="#000" opacity="0.45"/>';
    if (brillo) s += '<g filter="url(#' + id + '-halo)" fill="#7193C4" opacity="0.3" pointer-events="none">' + piezas.map(function (p) { return path(p); }).join('') + '</g>';
    /* un solo contorno para todo el cuerpo: primero los trazos de todas las piezas, luego los rellenos */
    s += '<g fill="' + MUSC.trazo + '" stroke="' + MUSC.trazo + '" stroke-width="2.6" stroke-linejoin="round">' + piezas.map(function (p) { return path(p); }).join('') + '</g>';
    s += '<g fill="url(#' + id + '-cuerpo)">' + piezas.map(function (p) { return path(p); }).join('') + '</g>';

    /* tendones, huesos y aponeurosis */
    s += '<g clip-path="url(#' + id + '-silueta)">';
    (G.DETALLE[vista] || []).forEach(function (t) {
      dos(t.pieza, t.forma).forEach(function (p) { s += path(p, { fill: 'url(#' + id + '-' + t.tono + ')', stroke: MUSC.junta, 'stroke-width': 0.9 }); });
    });

    /* los músculos */
    var zonas = '', fibras = '', marca = '', oro = '';
    G.MUSCULOS.forEach(function (mu) {
      if (mu.vista !== vista) return;
      var nv = Math.max(0, Math.min(3, niveles[mu.g] | 0));
      var formas = [];
      mu.formas.forEach(function (f) { formas = formas.concat(dos(mu.pieza, f)); });
      formas.forEach(function (p) {
        zonas += path(p, { 'class': 'tgf-z', 'data-g': mu.g, 'data-m': mu.id, fill: 'url(#' + id + '-n' + nv + ')', stroke: MUSC.junta, 'stroke-width': 1, 'stroke-linejoin': 'round' });
        if (nv === 3) oro += path(p);
        if (sel && sel === mu.g) marca += path(p, { fill: 'none', stroke: MUSC.sel, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
      });
      mu.fibras.forEach(function (f) {
        [1, -1].forEach(function (lado) {
          if (!quita(mu.pieza, f, lado) && !mu.formas.some(function (q) { return quita(mu.pieza, q, lado); })) fibras += path(linea(def(mu.pieza, lado < 0 ? espejo(f) : f)), {});
        });
      });
    });
    s += '<g>' + zonas + '</g>';
    s += '<g fill="none" stroke="#000" stroke-opacity="0.15" stroke-width="0.6" stroke-linecap="round" pointer-events="none">' + fibras + '</g>';
    /* el oro de 10 series o más da luz a su alrededor (encima, en modo «screen»: aclara, no tapa) */
    if (brillo && oro) s += '<g class="tgf-brillo" filter="url(#' + id + '-brillo)" fill="#FFD467" opacity="0.38" style="mix-blend-mode:screen" pointer-events="none">' + oro + '</g>';
    var lin = '';
    (G.LINEAS[vista] || []).forEach(function (l) { lin += path(linea(def(l.pieza, l.ps)), {}) + path(linea(def(l.pieza, espejo(l.ps))), {}); });
    if (vista === 'frente') lin += path('M201 242L201 401', {});
    else lin += path('M200 268L200 372', {});
    var dedos = '';
    G.DEDOS.forEach(function (l) { [1, -1].forEach(function (lado) { if (proB !== lado) dedos += path(linea(def('brazo', lado < 0 ? espejo(l) : l)), {}); }); });
    s += '<g fill="none" stroke="' + MUSC.junta + '" stroke-width="1.5" stroke-linecap="round" pointer-events="none">' + lin + '</g>';
    s += '<g fill="none" stroke="' + MUSC.trazo + '" stroke-opacity="0.55" stroke-width="1" stroke-linecap="round" pointer-events="none">' + dedos + '</g>';
    if (vista === 'frente') s += '<ellipse cx="200.5" cy="306" rx="2.2" ry="3" fill="' + MUSC.junta + '"/>';
    s += marca ? '<g class="tgf-marca" pointer-events="none">' + marca + '</g>' : '';
    s += '</g>';
    s += piezasProtesis(forma, proP, proB, true);

    return raizSvg(o, vista, d + s);
  }

  /* la lista de músculos dibujados, sin repetir, con su grupo: [{ id, g }] en el orden de GRUPOS */
  var MUSCULOS = [];
  G.GRUPOS.forEach(function (g) {
    G.MUSCULOS.forEach(function (mu) {
      if (mu.g === g && !MUSCULOS.some(function (x) { return x.id === mu.id; })) MUSCULOS.push({ id: mu.id, g: g });
    });
  });

  raiz.TG_FIGURA = { svg: svg, GRUPOS: G.GRUPOS, MUSCULOS: MUSCULOS, MUSC: MUSC, normaliza: normaliza, OPC: OPC, DEF: DEF, PIEL: PIEL, PELO_COLOR: PELO_COLOR, ROPA_COLOR: ROPA_COLOR, lum: lum };
})(typeof window !== 'undefined' ? window : globalThis);

/* ── la pantalla «Su cuerpo» ── */
(function () {
  'use strict';
  var F = window.TG_FIGURA;
  if (!F) return;

  var KEY = 'tenerife.cuerpo';
  var GRUPOS = F.GRUPOS;
  var MAX_N = 30, MAX_ENTRADAS = 3000, DIAS_GUARDA = 3 * 366;
  var reducido = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* El prototipo (un artefacto dentro de otra página) pone TG_CUERPO_SIN_HISTORIA: allí el historial
     es el de la página de fuera, y un back() de más la cambiaría. En la app no se pone. */
  var conHistoria = !window.TG_CUERPO_SIN_HISTORIA;

  /* ── utilidades ── */
  function $(id) { return document.getElementById(id); }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fecha(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function sumar(s, n) { var d = fecha(s); d.setDate(d.getDate() + n); return ymd(d); }
  function dias(a, b) { return Math.round((fecha(b) - fecha(a)) / 86400000); }
  function hoy() { return ymd(new Date()); }
  function esFecha(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(fecha(s)) && ymd(fecha(s)) === s; }
  function lengua() { return (typeof currentLang === 'string' && currentLang) || 'es'; }
  function locale() { return (typeof PRECIOS_GAS_LOCALE === 'object' && PRECIOS_GAS_LOCALE[lengua()]) || 'es-ES'; }
  function fmtFecha(s) { return fecha(s).toLocaleDateString(locale(), { day: 'numeric', month: 'short' }); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  /* Las fuentes de cada ejercicio, en el idioma de la app (31 de octubre de 2026). La entrega
     escribio en castellano las notas entre parentesis («conjunto de datos», «folleto PIL1597»…) y
     cuatro descripciones de una fuente («Programa de ejercicio en casa», «Universidad de
     Sussex»…), y salian igual en los diez idiomas. Van con su fila de CUERPO_UI; lo demas es el
     titulo original de cada fuente y se queda como esta. */
  var NOTAS_FUENTE = { 'conjunto de datos': 'cuerpoNF_datos', 'artículo para profesionales': 'cuerpoNF_articulo',
    'estudio patrocinado por ACE': 'cuerpoNF_estudioACE', 'hoja para pacientes': 'cuerpoNF_hojaPacientes', 'vídeo y texto': 'cuerpoNF_videoTexto',
    'máquina': 'cuerpoNF_maquina', 'ejercicios': 'cuerpoNF_ejercicios', 'folleto': 'cuerpoNF_folleto', 'fuente comunitaria': 'cuerpoNF_comunitaria',
    'barra': 'cuerpoNF_barra', 'mancuernas': 'cuerpoNF_mancuernas', 'banda': 'cuerpoNF_banda', 'bandas o poleas': 'cuerpoNF_bandasPoleas',
    'polea y banco': 'cuerpoNF_poleaBanco', 'con fitball': 'cuerpoNF_fitball', 'Fondos en máquina': 'cuerpoNF_fondosMaquina',
    'biblioteca de salud': 'cuerpoNF_biblioteca', 'extracto en Human Kinetics': 'cuerpoNF_extractoHK',
    'Pete McCall, septiembre de 2015': 'cuerpoNF_mccall', 'Universidad de California, San Francisco': 'cuerpoNF_ucsf' };
  var TROZOS_FUENTE = [['Programa de ejercicio en casa', 'cuerpoNF_programaCasa'], ['copia de la Recommended Routine de r/bodyweightfitness', 'cuerpoNF_copiaRutina'],
    ['Universidad de Sussex', 'cuerpoNF_sussex'], ['hoja de ejercicio', 'cuerpoNF_hojaEjercicio']];
  function fuenteTxt(t) {
    var s = String(t).replace(/\(([^()]+)\)/g, function (m, n) {
      if (NOTAS_FUENTE[n]) return '(' + tx(NOTAS_FUENTE[n]) + ')';
      var f = /^folleto (.+)$/.exec(n);
      return f ? '(' + tx('cuerpoNF_folleto') + ' ' + f[1] + ')' : m;
    });
    TROZOS_FUENTE.forEach(function (p) { s = s.split(p[0]).join(tx(p[1])); });
    return s;
  }
  function nombre(g) { return tx('cuerpoG_' + g) || g; }
  /* sin conjunción: varios nombres de grupo ya la llevan («Glúteos y cadera»), y «A, B y cadera y C» se lee mal */
  function lista(nombres) { return nombres.join(/^zh/.test(lengua()) ? '、' : ', '); }
  function cuando(d) {
    if (!d) return tx('cuerpoSinAnotar');
    var n = dias(d, hoy());
    if (n <= 0) return tx('cuerpoHoy');
    if (n === 1) return tx('cuerpoAyer');
    return tx('cuerpoHaceDias', { n: n });
  }
  /* La edad, del año de nacimiento del perfil (si lo hay): decide qué recomendación de la OMS se enseña */
  function edad() {
    try {
      var p = JSON.parse(localStorage.getItem('tenerife.perfil')), a = p && p.nacimiento, y = new Date().getFullYear();
      return (typeof a === 'number' && Math.floor(a) === a && a >= 1900 && a <= y) ? y - a : null;
    } catch (e) { return null; }
  }

  /* ── lo guardado: tenerife.cuerpo, solo en el dispositivo, validado campo a campo al leerlo ──
     { v: 1, aspecto: {…}, series: [{ d: 'AAAA-MM-DD', g: grupo, n: 1-30, t: instante, e: ejercicio }] }
     (e, el id del ejercicio, solo si se anotó desde su ficha) */
  function vacio() { return { v: 1, aspecto: F.normaliza(null), series: [] }; }
  function valida(s) {
    var r = vacio();
    if (!s || typeof s !== 'object') return r;
    r.aspecto = F.normaliza(s.aspecto);
    var max = sumar(hoy(), 1), min = sumar(hoy(), -DIAS_GUARDA);
    if (Array.isArray(s.series)) {
      r.series = s.series.filter(function (x) {
        return x && typeof x === 'object' && esFecha(x.d) && x.d <= max && x.d >= min && GRUPOS.indexOf(x.g) >= 0 &&
          typeof x.n === 'number' && Math.floor(x.n) === x.n && x.n >= 1 && x.n <= MAX_N;
      }).map(function (x) {
        var y = { d: x.d, g: x.g, n: x.n, t: (typeof x.t === 'number' && isFinite(x.t) && x.t > 0) ? x.t : 0 };
        if (typeof x.e === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(x.e) && x.e.length <= 80) y.e = x.e;
        return y;
      }).slice(-MAX_ENTRADAS);
    }
    return r;
  }
  function leer() { try { return valida(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return vacio(); } }
  var st = leer();
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); return true; }
    catch (e) { toast(tx('cuerpoNoGuardado')); return false; }
  }

  /* Los nombres latinos de la Terminologia Anatomica (TA2, FIPAT; sus términos son de dominio
     público), los verificados el 24-10-2026 en las listas de FIPAT (ifaa.unifr.ch, fechadas el
     21-07-2025): van debajo de la descripción de cada grupo, igual en todos los idiomas. Solo los
     músculos cuyo término se leyó allí; con el personaje nuevo se añadieron el redondo mayor (UID
     1990), el serrato anterior (1843), el manguito de los rotadores (14460: supraespinoso 1985,
     infraespinoso 1987, redondo menor 1989, subescapular 1991), el braquiorradial (2018), los
     aductores (2095-2098, 2100), el sartorio (2086), el tibial anterior (2107) y los fibulares
     (2111, 2112). */
  var LATIN = {
    pecho: 'Musculus pectoralis major · musculus pectoralis minor',
    dorsal: 'Musculus latissimus dorsi · musculus teres major',
    espalda_alta: 'Musculus trapezius · musculus rhomboideus major · musculus rhomboideus minor · musculus serratus anterior',
    hombros: 'Musculus deltoideus · manica rotatoria (musculus supraspinatus · musculus infraspinatus · musculus teres minor · musculus subscapularis)',
    biceps: 'Musculus biceps brachii · musculus brachialis',
    triceps: 'Musculus triceps brachii',
    antebrazo: 'Musculus brachioradialis · musculi compartimenti antebrachii',
    core: 'Musculus rectus abdominis · musculus obliquus abdominis externus · musculus obliquus abdominis internus · musculus erector spinae',
    gluteos: 'Musculus gluteus maximus · musculus gluteus medius · musculus gluteus minimus · musculus pectineus · musculus adductor longus · musculus adductor brevis · musculus adductor magnus · musculus gracilis',
    cuadriceps: 'Musculus quadriceps femoris · musculus sartorius',
    isquios: 'Musculus biceps femoris · musculus semitendinosus · musculus semimembranosus',
    pantorrilla: 'Musculus triceps surae (musculus gastrocnemius · musculus soleus) · musculus tibialis anterior · musculus fibularis longus · musculus fibularis brevis'
  };

  /* ── las cuentas de los últimos 7 días (hoy y los 6 anteriores) ── */
  function nivel(n) { return n >= 10 ? 3 : n >= 5 ? 2 : n >= 1 ? 1 : 0; }
  function resumen() {
    var h = hoy(), desde = sumar(h, -6), r = { series: {}, dias: {}, ultima: {}, total: 0, diasFuerza: 0, grupos: 0, niveles: {} }, todos = {};
    GRUPOS.forEach(function (g) { r.series[g] = 0; r.dias[g] = {}; r.ultima[g] = null; });
    st.series.forEach(function (x) {
      if (x.d > h) return;
      if (!r.ultima[x.g] || x.d > r.ultima[x.g]) r.ultima[x.g] = x.d;
      if (x.d >= desde) { r.series[x.g] += x.n; r.dias[x.g][x.d] = 1; todos[x.d] = 1; r.total += x.n; }
    });
    GRUPOS.forEach(function (g) { r.dias[g] = Object.keys(r.dias[g]).length; if (r.series[g]) r.grupos++; r.niveles[g] = nivel(r.series[g]); });
    r.diasFuerza = Object.keys(todos).length;
    return r;
  }

  /* ── estado de la pantalla ── */
  var panel = null, abierto = false, historia = false, atrasPendiente = false, antesDeAbrir = null;
  var modo = 'musculos', vista = 'frente', grupoAbierto = null, hojaHistoria = false, antesDeHoja = null;
  var anotarN = 3, anotarDia = 'hoy', deshacer = null, toastReloj = null, entraReloj = null;
  var ejEntorno = 'todos', ejNivel = 0, ejBuscar = '', ejAbierto = null, ejHistoria = false, antesDeEj = null;
  /* para buscar: minúsculas y sin tildes («sentadilla bulgara» encuentra «Sentadilla búlgara») */
  function plano(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

  /* ── los ejercicios (parte 3) ──
     Datos aparte, que se piden la primera vez que se abre la hoja de un grupo: datos/ejercicios.json
     (lo común: grupos, entornos, material, nivel, fuentes) y datos/ejercicios-<idioma>.json (nombre y
     pasos). Si falta el idioma, el castellano. Cada fila se comprueba al leerla. */
  var BASE_DATOS = typeof window.TG_CUERPO_DATOS === 'string' ? window.TG_CUERPO_DATOS : './datos/';
  var EJ = null, EJ_TX = {}, ejCarga = null, ejError = false;
  var ENTORNOS = ['gimnasio', 'fuera', 'calistenia'];
  var MATERIALES = ['ninguno', 'barra', 'barra_z', 'mancuernas', 'kettlebell', 'disco', 'maquina', 'polea', 'multipower', 'banco', 'barra_dominadas', 'paralelas',
                    'anillas', 'cinta_suspension', 'banda', 'balon_medicinal', 'fitball', 'rueda_abdominal', 'esterilla', 'escalon', 'pared'];
  var TIPOS = ['fuerza', 'isometrico', 'pliometria', 'estiramiento'];
  function esId(v) { return typeof v === 'string' && v.length <= 80 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v); }
  function soloDe(xs, validos) { return Array.isArray(xs) ? xs.filter(function (v, i) { return validos.indexOf(v) >= 0 && xs.indexOf(v) === i; }) : []; }
  function indexar(d) {
    var porId = {}, lista = [];
    (d && Array.isArray(d.ejercicios) ? d.ejercicios : []).forEach(function (x) {
      if (!x || !esId(x.id) || porId[x.id]) return;
      var g = soloDe(x.g, GRUPOS); if (!g.length) return;
      var e = { id: x.id, g: g, s: soloDe(x.s, GRUPOS).filter(function (q) { return g.indexOf(q) < 0; }), en: soloDe(x.e, ENTORNOS), m: soloDe(x.m, MATERIALES),
                n: [1, 2, 3].indexOf(x.n) >= 0 ? x.n : 1, t: TIPOS.indexOf(x.t) >= 0 ? x.t : 'fuerza', v: esId(x.v) ? x.v : null,
                f: (Array.isArray(x.f) ? x.f : []).filter(function (q) { return Array.isArray(q) && typeof q[0] === 'string' && typeof q[1] === 'string' && /^https:\/\//.test(q[1]); }).slice(0, 4) };
      if (!e.en.length) return;
      porId[e.id] = e; lista.push(e);
    });
    return { porId: porId, lista: lista };
  }
  function pedirJSON(f) { return fetch(BASE_DATOS + f).then(function (r) { if (!r.ok) throw new Error(f); return r.json(); }); }
  function cargarEjercicios() {
    var l = lengua();
    if (EJ && EJ_TX[l]) return Promise.resolve();
    if (ejCarga) return ejCarga;
    ejError = false;
    /* el castellano va siempre: es el respaldo de lo que falte en el idioma de la app */
    ejCarga = Promise.all([
      EJ ? null : pedirJSON('ejercicios.json'),
      EJ_TX.es ? null : pedirJSON('ejercicios-es.json'),
      (l === 'es' || EJ_TX[l]) ? null : pedirJSON('ejercicios-' + l + '.json').catch(function () { return {}; })
    ]).then(function (r) {
      if (r[0]) EJ = indexar(r[0]);
      if (r[1]) EJ_TX.es = (r[1] && typeof r[1] === 'object') ? r[1] : {};
      if (r[2]) EJ_TX[l] = (r[2] && typeof r[2] === 'object') ? r[2] : {};
    }, function (e) { ejError = true; throw e; });
    var fin = function () { ejCarga = null; };
    ejCarga.then(fin, fin);
    return ejCarga;
  }
  function txEj(id) {
    var t = EJ_TX[lengua()] || {}, x = t[id];
    if (!Array.isArray(x) || typeof x[0] !== 'string') x = (EJ_TX.es || {})[id];
    return (Array.isArray(x) && typeof x[0] === 'string') ? { nombre: x[0], pasos: Array.isArray(x[1]) ? x[1].filter(function (p) { return typeof p === 'string'; }) : [] } : null;
  }
  function nombreEj(id) { var t = txEj(id); return t ? t.nombre : id; }
  /* la última vez que se anotó cada ejercicio */
  function ultimasEj() { var u = {}; st.series.forEach(function (x) { if (x.e && x.d <= hoy() && (!u[x.e] || x.d > u[x.e])) u[x.e] = x.d; }); return u; }

  /* ── el personaje ── */
  function etiquetaFigura(v, R) {
    var nv = tx(v === 'frente' ? 'cuerpoVistaFrente' : 'cuerpoVistaEspalda');
    if (modo !== 'musculos') return tx('cuerpoFiguraAlt', { vista: nv });
    var hechos = GRUPOS.filter(function (g) { return R.series[g] > 0; }).map(nombre);
    var trab = hechos.length ? tx('cuerpoTrabajados', { lista: lista(hechos) }) : tx('cuerpoNingunTrabajado');
    return tx('cuerpoFiguraAltMusculos', { vista: nv, trabajados: trab });
  }
  function renderFigura(R) {
    R = R || resumen();
    /* en «Músculos» se ven las dos vistas a la vez; en «Aspecto», una, y «Girar» le da la vuelta */
    var ambas = modo === 'musculos';
    ['frente', 'espalda'].forEach(function (v) {
      var caja = $('tgc-cara-' + v);
      caja.innerHTML = F.svg({ vista: v, modo: modo, aspecto: st.aspecto, niveles: R.niveles, sel: ambas ? grupoAbierto : null,
                               id: 'tgc-' + v, etiqueta: etiquetaFigura(v, R), viewBox: '40 8 320 784' });
      caja.setAttribute('aria-hidden', ambas || v === vista ? 'false' : 'true');
    });
    $('tgc-giro').classList.toggle('is-espalda', !ambas && vista === 'espalda');
    var b = $('tgc-girar');
    b.setAttribute('aria-label', tx(vista === 'frente' ? 'cuerpoVerEspalda' : 'cuerpoVerFrente'));
    $('tgc-vista').textContent = tx(vista === 'frente' ? 'cuerpoVistaFrente' : 'cuerpoVistaEspalda');
  }

  /* ── modo «Músculos»: el resumen, la semana día a día y los 12 grupos ── */
  function adulto() { var e = edad(); return !(e !== null && e < 18); }
  /* «11/12»: la parte de después de la barra, más pequeña (el texto sigue siendo «11/12») */
  function cifra(b, a, de) { b.textContent = String(a); if (de != null) b.appendChild(el('small', '', '/' + de)); }
  function renderResumen(R) {
    $('tgc-st-series').textContent = String(R.total);
    cifra($('tgc-st-grupos'), R.grupos, 12);
    cifra($('tgc-st-dias'), R.diasFuerza, 7);
    $('tgc-reco').textContent = tx(adulto() ? 'cuerpoRecoAdulto' : 'cuerpoRecoJoven');
    $('tgc-ref').hidden = !adulto();
    $('tgc-pista-txt').textContent = tx('cuerpoGruposAyuda');
    $('tgc-pista').hidden = R.total > 0;
    renderSemana();
  }
  /* la semana: hoy y los 6 días anteriores, con las series anotadas cada día y sus grupos */
  var diaSel = null;
  function semana() {
    var h = hoy(), ds = [];
    for (var i = 6; i >= 0; i--) ds.push({ d: sumar(h, -i), n: 0, g: {} });
    st.series.forEach(function (x) { ds.forEach(function (o) { if (o.d === x.d) { o.n += x.n; o.g[x.g] = 1; } }); });
    return ds;
  }
  function fmtDia(s, largo) {
    try { return fecha(s).toLocaleDateString(locale(), largo ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short' }).replace(/\.$/, ''); }
    catch (e) { return s; }
  }
  function renderSemana() {
    var ds = semana(), h = hoy(), ol = $('tgc-dias7');
    if (!diaSel || diaSel > h || diaSel < ds[0].d) diaSel = h;
    var max = Math.max(10, Math.max.apply(null, ds.map(function (o) { return o.n; })));
    ol.setAttribute('aria-label', tx('cuerpoLeyenda'));
    ol.textContent = '';
    ds.forEach(function (o, i) {
      var li = el('li'), b = el('button', 'tgc-dia' + (o.d === h ? ' es-hoy' : ''));
      b.type = 'button'; b.dataset.d = o.d;
      b.setAttribute('aria-pressed', o.d === diaSel ? 'true' : 'false');
      b.setAttribute('aria-label', fmtDia(o.d, true) + ': ' + tx('cuerpoNSeries', { n: o.n }));
      if (o.d === h) b.setAttribute('aria-current', 'date');
      var col = el('span', 'tgc-dia-col'), barra = el('i', 'tgc-dia-barra' + (o.n ? '' : ' cero'));
      if (o.n) { barra.style.height = Math.max(4, Math.round(64 * o.n / max)) + 'px'; barra.style.animationDelay = (i * 45) + 'ms'; }
      col.setAttribute('aria-hidden', 'true'); col.appendChild(barra); b.appendChild(col);
      var l = el('span', 'tgc-dia-l', fmtDia(o.d, false)); l.setAttribute('aria-hidden', 'true'); b.appendChild(l);
      li.appendChild(b); ol.appendChild(li);
    });
    renderDia(ds);
  }
  function renderDia(ds) {
    var o = (ds || semana()).filter(function (x) { return x.d === diaSel; })[0];
    if (!o) return;
    $('tgc-dia-txt').textContent = fmtDia(o.d, true) + ': ' + tx('cuerpoNSeries', { n: o.n });
    var gs = GRUPOS.filter(function (g) { return o.g[g]; }).map(nombre);
    $('tgc-dia-grupos').textContent = gs.length ? lista(gs) : tx('cuerpoSinAnotar');
  }
  /* cada grupo, una barra: las series de 7 días; en adultos, una marca en 10 (la referencia del ACSM) */
  function renderLista(R) {
    var ul = $('tgc-lista'); ul.textContent = '';
    var escala = Math.max(20, Math.max.apply(null, GRUPOS.map(function (g) { return R.series[g]; }))), ref = adulto();
    GRUPOS.forEach(function (g, i) {
      var li = el('li'), b = el('button', 'tgc-fila');
      b.type = 'button'; b.dataset.g = g;
      /* los espacios entre las piezas no se ven (la fila es una rejilla), pero el nombre accesible queda «Pecho 8 series hoy» */
      b.appendChild(el('span', 'tgc-fila-nom', nombre(g)));
      b.appendChild(document.createTextNode(' '));
      b.appendChild(el('span', 'tgc-fila-n', tx('cuerpoNSeries', { n: R.series[g] })));
      b.appendChild(document.createTextNode(' '));
      var barra = el('span', 'tgc-barra'), fill = el('i', 'tgc-nivel n' + R.niveles[g]);
      barra.setAttribute('aria-hidden', 'true');
      fill.style.width = (100 * R.series[g] / escala).toFixed(1) + '%';
      fill.style.animationDelay = (i * 35) + 'ms';
      barra.appendChild(fill);
      if (ref) { var m = el('span', 'tgc-barra-ref'); m.style.left = (100 * 10 / escala).toFixed(1) + '%'; barra.appendChild(m); }
      b.appendChild(barra);
      b.appendChild(el('span', 'tgc-fila-cuando', cuando(R.ultima[g])));
      li.appendChild(b); ul.appendChild(li);
    });
  }

  /* ── modo «Aspecto»: el editor ── */
  var SECCIONES = [
    ['cuerpoSecCuerpo', ['fig', 'comp', 'piel']],
    ['cuerpoSecCara', ['pelo', 'peloColor', 'barba', 'cabeza']],
    ['cuerpoSecRopa', ['arriba', 'arribaColor', 'abajo', 'abajoColor', 'calzado', 'calzadoColor']],
    ['cuerpoSecAyudas', ['gafas', 'audifono', 'protesis']]
  ];
  var PREFIJO = { fig: 'cuerpoFig_', comp: 'cuerpoComp_', pelo: 'cuerpoPelo_', barba: 'cuerpoBarba_', cabeza: 'cuerpoCabeza_', gafas: 'cuerpoGafas_',
                  audifono: 'cuerpoAudif_', protesis: 'cuerpoProt_', arriba: 'cuerpoArriba_', abajo: 'cuerpoAbajo_', calzado: 'cuerpoCalzado_' };
  var PALETA = { piel: F.PIEL, peloColor: F.PELO_COLOR, arribaColor: F.ROPA_COLOR, abajoColor: F.ROPA_COLOR, calzadoColor: F.ROPA_COLOR };
  function nombreColor(k, i) {
    if (k === 'piel') return i >= 10 ? tx('cuerpoPielNoRealista') : tx('cuerpoPielTono', { n: i + 1 });
    return tx((k === 'peloColor' ? 'cuerpoPeloC_' : 'cuerpoColor_') + i);
  }
  function renderEditor() {
    var caja = $('tgc-opciones'); caja.textContent = '';
    SECCIONES.forEach(function (sec) {
      var s = el('section', 'tgc-sec');
      s.appendChild(el('h3', '', tx(sec[0])));
      sec[1].forEach(function (k) {
        var fs = el('fieldset', 'tgc-op'); fs.id = 'tgc-op-' + k;
        fs.appendChild(el('legend', '', tx('cuerpoOp_' + k)));
        var fila = el('div', PALETA[k] ? 'tgc-colores' : 'tgc-chips');
        var valores = PALETA[k] ? PALETA[k].map(function (c, i) { return i; }) : F.OPC[k];
        valores.forEach(function (v) {
          var lab = el('label', PALETA[k] ? 'tgc-color' : 'tgc-chip'), inp = el('input');
          inp.type = 'radio'; inp.name = 'tgc-' + k; inp.value = String(v); inp.id = 'tgc-' + k + '-' + v;
          inp.checked = st.aspecto[k] === v;
          lab.appendChild(inp);
          var cara = el('span');
          if (PALETA[k]) { cara.style.background = PALETA[k][v]; inp.setAttribute('aria-label', nombreColor(k, v)); lab.title = nombreColor(k, v); }
          else cara.textContent = tx(PREFIJO[k] + v);
          lab.appendChild(cara);
          fila.appendChild(lab);
        });
        fs.appendChild(fila);
        if (k === 'piel') fs.appendChild(el('p', 'tgc-ayuda', tx('cuerpoPielAyuda')));
        s.appendChild(fs);
      });
      caja.appendChild(s);
    });
    dependientes();
  }
  /* el color de arriba no pinta nada sin camiseta (salvo la gorra o el pañuelo, que lo toman), ni el del calzado descalzo */
  function dependientes() {
    var a = st.aspecto, c1 = $('tgc-op-arribaColor'), c2 = $('tgc-op-calzadoColor');
    if (c1) c1.hidden = a.arriba === 'sin' && a.cabeza === 'no';
    if (c2) c2.hidden = a.calzado === 'descalzo';
  }
  function cambiarAspecto(k, v) {
    var a = Object.assign({}, st.aspecto);
    a[k] = PALETA[k] || k === 'comp' ? Number(v) : v;
    st.aspecto = F.normaliza(a);
    guardar(); dependientes(); renderFigura();
  }
  function azar() {
    function uno(xs) { return xs[Math.floor(Math.random() * xs.length)]; }
    function n(k) { return Math.floor(Math.random() * PALETA[k].length); }
    var a = Object.assign({}, st.aspecto);
    a.fig = uno(F.OPC.fig); a.comp = uno(F.OPC.comp); a.piel = n('piel');
    a.pelo = uno(F.OPC.pelo); a.peloColor = Math.random() < 0.85 ? Math.floor(Math.random() * 8) : n('peloColor');
    a.barba = Math.random() < 0.6 ? 'no' : uno(F.OPC.barba); a.cabeza = Math.random() < 0.75 ? 'no' : uno(F.OPC.cabeza);
    a.arriba = uno(F.OPC.arriba); a.arribaColor = n('arribaColor'); a.abajo = uno(F.OPC.abajo); a.abajoColor = n('abajoColor');
    a.calzado = Math.random() < 0.8 ? 'zapatillas' : uno(F.OPC.calzado); a.calzadoColor = n('calzadoColor');
    /* las gafas, el audífono y la prótesis son de la persona: el azar no los toca */
    st.aspecto = F.normaliza(a);
    guardar(); renderEditor(); renderFigura();
  }

  /* ── la hoja de un grupo ── */
  /* la vista en que mejor se ve cada grupo, para el maniquí pequeño de la hoja */
  var VISTA_GRUPO = { pecho: 'frente', dorsal: 'espalda', espalda_alta: 'espalda', hombros: 'frente', biceps: 'frente', triceps: 'espalda',
                      antebrazo: 'frente', core: 'frente', gluteos: 'espalda', cuadriceps: 'frente', isquios: 'espalda', pantorrilla: 'espalda' };
  function renderHoja() {
    var g = grupoAbierto; if (!g) return;
    var R = resumen();
    $('tgc-hoja-nivel').className = 'tgc-nivel n' + R.niveles[g];
    var nivMini = {}; nivMini[g] = 3;
    $('tgc-hoja-mini').innerHTML = F.svg({ vista: VISTA_GRUPO[g] || 'frente', modo: 'musculos', aspecto: st.aspecto, niveles: nivMini, id: 'tgc-hoja-mini', viewBox: '40 8 320 784', brillo: false });
    $('tgc-hoja-tit').textContent = nombre(g);
    $('tgc-hoja-desc').textContent = tx('cuerpoD_' + g);
    $('tgc-hoja-latin').textContent = LATIN[g];
    $('tgc-h-series').textContent = String(R.series[g]);
    $('tgc-h-dias').textContent = R.dias[g] + '/7';
    $('tgc-h-ultima').textContent = cuando(R.ultima[g]);
    $('tgc-h-ultima').classList.add('txt');
    pintarPaso('tgc');
    var ul = $('tgc-hist'); ul.textContent = '';
    var mias = st.series.map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return o.x.g === g; })
      .sort(function (a, b) { return a.x.d === b.x.d ? b.x.t - a.x.t || b.i - a.i : (a.x.d < b.x.d ? 1 : -1); }).slice(0, 6);
    mias.forEach(function (o) {
      var li = el('li', 'tgc-hist-fila'), series = tx('cuerpoNSeries', { n: o.x.n }), f = fmtFecha(o.x.d);
      var txt = el('span', 'tgc-hist-n', series);
      /* si se anotó desde la ficha de un ejercicio, su nombre (cuando los ejercicios ya están cargados) */
      if (o.x.e && EJ && EJ.porId[o.x.e]) txt.appendChild(el('span', 'tgc-hist-ej', nombreEj(o.x.e)));
      li.appendChild(txt);
      li.appendChild(el('span', 'tgc-hist-f', f));
      var b = el('button', 'tgc-hist-x', '×'); b.type = 'button'; b.dataset.i = String(o.i);
      b.setAttribute('aria-label', tx('cuerpoBorrarEntrada', { series: series, fecha: f }));
      li.appendChild(b); ul.appendChild(li);
    });
    $('tgc-hist-nada').hidden = mias.length > 0;
    renderEjLista();
    if (ejAbierto) renderEj();
  }
  /* el paso de «Anotar series» (en la hoja del grupo, prefijo tgc; en la del ejercicio, tgc-ej) */
  function pintarPaso(pre) {
    $(pre + '-n').value = String(anotarN);
    $(pre + '-menos').disabled = anotarN <= 1;
    $(pre + '-mas').disabled = anotarN >= MAX_N;
    $(pre + '-hoy').setAttribute('aria-pressed', anotarDia === 'hoy' ? 'true' : 'false');
    $(pre + '-ayer').setAttribute('aria-pressed', anotarDia === 'ayer' ? 'true' : 'false');
  }

  /* ── la lista de ejercicios del grupo, con sus filtros ── */
  function renderEjLista() {
    var g = grupoAbierto, ul = $('tgc-ej-lista'), estado = $('tgc-ej-estado');
    if (!g) return;
    $('tgc-ej-ent').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === ejEntorno ? 'true' : 'false'); });
    $('tgc-ej-niv').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', Number(b.dataset.v) === ejNivel ? 'true' : 'false'); });
    $('tgc-ej-reintentar').hidden = true;
    if (!EJ || !EJ_TX[lengua()]) {
      ul.textContent = '';
      if (ejError) { estado.textContent = tx('cuerpoErrorEj'); $('tgc-ej-reintentar').hidden = false; }
      else estado.textContent = tx('cuerpoCargandoEj');
      cargarEjercicios().then(function () { if (grupoAbierto === g) renderHoja(); }, function () { if (grupoAbierto === g) renderEjLista(); });
      return;
    }
    var todos = EJ.lista.filter(function (x) { return x.g.indexOf(g) >= 0; });
    var palabras = plano(ejBuscar).split(/\s+/).filter(Boolean);
    var vis = todos.filter(function (x) {
      if (!((ejEntorno === 'todos' || x.en.indexOf(ejEntorno) >= 0) && (!ejNivel || x.n === ejNivel))) return false;
      var n = palabras.length ? plano(nombreEj(x.id)) : '';
      return palabras.every(function (w) { return n.indexOf(w) >= 0; });
    });
    estado.textContent = vis.length ? tx('cuerpoNEjercicios', { n: vis.length }) : tx('cuerpoSinEjFiltro');
    var ult = ultimasEj();
    ul.textContent = '';
    vis.forEach(function (x) {
      var li = el('li'), b = el('button', 'tgc-ej-fila'); b.type = 'button'; b.dataset.id = x.id;
      var t = el('span', 'tgc-ej-txt');
      t.appendChild(el('span', 'tgc-ej-nombre', nombreEj(x.id)));
      /* el material y el nivel, separados por el espacio (sin puntos medios) */
      var meta = el('span', 'tgc-ej-meta');
      x.m.slice(0, 2).forEach(function (m) { meta.appendChild(el('span', '', tx('cuerpoMat_' + m))); meta.appendChild(document.createTextNode(' ')); });
      meta.appendChild(el('span', 'tgc-ej-niv', tx('cuerpoNivel_' + x.n)));
      t.appendChild(document.createTextNode(' '));
      t.appendChild(meta);
      b.appendChild(t);
      var d = el('span', 'tgc-ej-lado');
      d.appendChild(puntos(x.n));
      if (ult[x.id]) d.appendChild(el('span', 'tgc-ej-ult', cuando(ult[x.id])));
      b.appendChild(d);
      li.appendChild(b); ul.appendChild(li);
    });
  }
  /* el nivel en tres puntos (●●○): solo a la vista; el nivel va también en texto */
  function puntos(n) {
    var s = el('span', 'tgc-ej-puntos n' + n);
    for (var i = 1; i <= 3; i++) s.appendChild(el('i', i <= n ? 'si' : ''));
    s.setAttribute('aria-hidden', 'true');
    return s;
  }

  /* ── la ficha de un ejercicio (la segunda página de la hoja) ── */
  function abrirEj(id) {
    if (!EJ || !EJ.porId[id] || !grupoAbierto) return;
    var nueva = !ejAbierto;
    ejAbierto = id;
    if (nueva) {
      antesDeEj = document.activeElement;
      $('tgc-pag-grupo').hidden = true; $('tgc-pag-ej').hidden = false;
      $('tgc-hoja').setAttribute('aria-labelledby', 'tgc-ej-nom');
      if (conHistoria && !ejHistoria) { try { history.pushState({ tgPerfil: 1, tgCuerpo: 1, tgCuerpoHoja: 1, tgCuerpoEj: 1 }, ''); ejHistoria = true; } catch (e) {} }
    }
    renderEj();
    $('tgc-hoja').scrollTop = 0;
    try { $('tgc-ej-nom').focus({ preventScroll: true }); } catch (e) {}
  }
  function volverGrupo(sinHistoria) {
    if (!ejAbierto) return;
    ejAbierto = null;
    $('tgc-pag-ej').hidden = true; $('tgc-pag-grupo').hidden = false;
    $('tgc-hoja').setAttribute('aria-labelledby', 'tgc-hoja-tit');
    if (ejHistoria && !sinHistoria) { try { atrasPendiente = true; history.back(); } catch (e) { atrasPendiente = false; } }
    ejHistoria = false;
    renderHoja();
    var b = antesDeEj && antesDeEj.dataset && antesDeEj.dataset.id ? $('tgc-ej-lista').querySelector('[data-id="' + antesDeEj.dataset.id + '"]') : null;
    try { (b || $('tgc-hoja-tit')).focus({ preventScroll: true }); } catch (e) {}
    antesDeEj = null;
  }
  function renderEj() {
    var x = EJ && EJ.porId[ejAbierto]; if (!x) return;
    var t = txEj(x.id) || { nombre: x.id, pasos: [] };
    $('tgc-ej-nom').textContent = t.nombre;
    $('tgc-ej-volver').setAttribute('aria-label', tx('cuerpoVolverGrupo', { grupo: nombre(grupoAbierto) }));
    /* de qué ejercicio es variante (enlace a él) y cuáles son sus variantes */
    var vb = $('tgc-ej-variante');
    vb.hidden = !(x.v && EJ.porId[x.v]);
    if (!vb.hidden) { vb.textContent = tx('cuerpoVarianteDe', { nombre: nombreEj(x.v) }); vb.dataset.id = x.v; }
    var vars = EJ.lista.filter(function (y) { return y.v === x.id; }), vu = $('tgc-ej-variantes');
    $('tgc-ej-var-caja').hidden = !vars.length; vu.textContent = '';
    vars.forEach(function (y) {
      var li = el('li'), b = el('button', 'tgc-ej-var', nombreEj(y.id)); b.type = 'button'; b.dataset.id = y.id;
      li.appendChild(b); vu.appendChild(li);
    });
    var chips = $('tgc-ej-chips'); chips.textContent = '';
    x.en.forEach(function (e) { chips.appendChild(el('li', 'ent', tx('cuerpoEnt_' + e))); });
    var chipNiv = el('li', 'niv n' + x.n); chipNiv.appendChild(puntos(x.n)); chipNiv.appendChild(document.createTextNode(tx('cuerpoNivel_' + x.n)));
    chips.appendChild(chipNiv);
    if (x.t !== 'fuerza') chips.appendChild(el('li', 'tipo', tx('cuerpoTipo_' + x.t)));
    x.m.forEach(function (m) { chips.appendChild(el('li', 'mat', tx('cuerpoMat_' + m))); });
    /* el maniquí de frente y de espaldas: los principales en oro claro, los secundarios en oro oscuro */
    var niv = {}; x.s.forEach(function (q) { niv[q] = 1; }); x.g.forEach(function (q) { niv[q] = 3; });
    ['frente', 'espalda'].forEach(function (v) {
      $('tgc-ej-fig-' + v).innerHTML = F.svg({ vista: v, modo: 'musculos', aspecto: st.aspecto, niveles: niv, id: 'tgc-ej-' + v, viewBox: '40 8 320 784' });
    });
    /* un grupo por línea: los nombres ya llevan «y» y, seguidos, se confunden */
    [['tgc-ej-prim', x.g], ['tgc-ej-sec', x.s]].forEach(function (p) {
      var c = $(p[0]); c.textContent = '';
      p[1].forEach(function (g) { c.appendChild(el('span', 'tgc-ej-g', nombre(g))); });
    });
    $('tgc-ej-sec-fila').hidden = !x.s.length;
    var ol = $('tgc-ej-pasos'); ol.textContent = '';
    t.pasos.forEach(function (p) { ol.appendChild(el('li', '', p)); });
    pintarPaso('tgc-ej');
    var ul = $('tgc-ej-fuentes'); ul.textContent = '';
    x.f.forEach(function (q) {
      var li = el('li'), a = el('a', '', fuenteTxt(q[0]));
      a.href = q[1]; a.target = '_blank'; a.rel = 'noopener noreferrer';
      /* la cita: el nombre del sitio y el titulo original de la pagina no se traducen (la nota, si) */
      a.setAttribute('data-sin-traducir', 'el título original de la fuente');
      li.appendChild(a); ul.appendChild(li);
    });
  }
  /* anotar desde la ficha: una anotación por cada grupo principal, con el ejercicio */
  function anotarEj() {
    var x = EJ && EJ.porId[ejAbierto]; if (!x) return;
    var n = Math.max(1, Math.min(MAX_N, Math.round(Number($('tgc-ej-n').value) || anotarN)));
    var d = anotarDia === 'ayer' ? sumar(hoy(), -1) : hoy(), ahora = Date.now(), antes = st.series.length;
    x.g.forEach(function (g, k) { st.series.push({ d: d, g: g, n: n, t: ahora + k, e: x.id }); });
    if (st.series.length > MAX_ENTRADAS) st.series = st.series.slice(-MAX_ENTRADAS);
    if (!guardar()) { st.series.length = Math.min(st.series.length, antes); return; }
    anotarN = n;
    renderMusculos(); renderHoja();
    toast(tx('cuerpoAnotadoEj', { n: n, ejercicio: nombreEj(x.id) }));
  }

  function abrirHoja(g) {
    if (GRUPOS.indexOf(g) < 0) return;
    var nueva = !grupoAbierto;
    grupoAbierto = g;
    if (nueva) {
      antesDeHoja = document.activeElement;
      anotarN = 3; anotarDia = 'hoy';
      ejBuscar = ''; $('tgc-ej-buscar').value = '';
      $('tgc-pag-ej').hidden = true; $('tgc-pag-grupo').hidden = false; $('tgc-hoja').setAttribute('aria-labelledby', 'tgc-hoja-tit');
      $('tgc-velo').hidden = false; $('tgc-hoja').hidden = false; $('tgc-hoja').scrollTop = 0;
      $('tgc').inert = true; panel.classList.add('con-hoja');
      if (conHistoria && !hojaHistoria) { try { history.pushState({ tgPerfil: 1, tgCuerpo: 1, tgCuerpoHoja: 1 }, ''); hojaHistoria = true; } catch (e) {} }
    }
    renderHoja(); renderFigura();
    try { $('tgc-hoja-tit').focus({ preventScroll: true }); } catch (e) {}
  }
  function cerrarHoja(sinHistoria) {
    if (!grupoAbierto) return;
    /* con la ficha de un ejercicio abierta hay dos entradas del historial: se quitan las dos de una vez */
    var pasos = (hojaHistoria ? 1 : 0) + (ejHistoria ? 1 : 0);
    grupoAbierto = null; ejAbierto = null;
    $('tgc-velo').hidden = true; $('tgc-hoja').hidden = true;
    $('tgc-pag-ej').hidden = true; $('tgc-pag-grupo').hidden = false;
    $('tgc').inert = false; panel.classList.remove('con-hoja');
    if (pasos && !sinHistoria) { try { atrasPendiente = true; history.go(-pasos); } catch (e) { atrasPendiente = false; } }
    hojaHistoria = false; ejHistoria = false; antesDeEj = null;
    renderFigura();
    if (antesDeHoja && document.contains(antesDeHoja) && typeof antesDeHoja.focus === 'function') { try { antesDeHoja.focus({ preventScroll: true }); } catch (e) {} }
    antesDeHoja = null;
  }
  function anotar() {
    var g = grupoAbierto; if (!g) return;
    var n = Math.max(1, Math.min(MAX_N, Math.round(Number($('tgc-n').value) || anotarN)));
    var d = anotarDia === 'ayer' ? sumar(hoy(), -1) : hoy();
    st.series.push({ d: d, g: g, n: n, t: Date.now() });
    if (st.series.length > MAX_ENTRADAS) st.series = st.series.slice(-MAX_ENTRADAS);
    if (!guardar()) { st.series.pop(); return; }
    anotarN = n;
    renderMusculos(); renderHoja();
    var b = $('tgc-h-series'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    toast(tx('cuerpoAnotado', { n: n, grupo: nombre(g) }));
  }
  function borrarEntrada(i) {
    var x = st.series[i]; if (!x) return;
    st.series.splice(i, 1);
    if (!guardar()) { st.series.splice(i, 0, x); return; }
    renderMusculos(); renderHoja();
    deshacer = { x: x, i: i };
    toast(tx('cuerpoEntradaBorrada'), tx('cuerpoDeshacer'), function () {
      if (!deshacer) return;
      st.series.splice(Math.min(deshacer.i, st.series.length), 0, deshacer.x); deshacer = null;
      guardar(); renderMusculos(); renderHoja();
    });
  }

  /* ── el aviso de abajo (con un botón, para deshacer) ── */
  function toast(txt, accion, fn) {
    var t = $('tgc-toast'); if (!t) return;
    $('tgc-toast-txt').textContent = txt;
    var b = $('tgc-toast-btn');
    b.hidden = !accion; b.textContent = accion || ''; b.onclick = accion ? function () { fn(); t.classList.remove('show'); } : null;
    t.classList.add('show');
    clearTimeout(toastReloj);
    toastReloj = setTimeout(function () { t.classList.remove('show'); deshacer = null; }, accion ? 6000 : 2800);
  }

  /* ── pintar ── */
  function aplicarTextos() {
    panel.querySelectorAll('[data-tx]').forEach(function (n) { var v = tx(n.getAttribute('data-tx')); if (v) n.textContent = v; });
    panel.querySelectorAll('[data-tx-aria]').forEach(function (n) { n.setAttribute('aria-label', tx(n.getAttribute('data-tx-aria'))); });
    panel.querySelectorAll('[data-tx-ph]').forEach(function (n) { n.setAttribute('placeholder', tx(n.getAttribute('data-tx-ph'))); });
    var l = lengua();
    panel.setAttribute('lang', l === 'zht' ? 'zh-Hant' : (l === 'zh' ? 'zh-Hans' : l));
  }
  function renderMusculos() { var R = resumen(); renderResumen(R); renderLista(R); renderFigura(R); }
  function renderModo() {
    var m = modo === 'musculos';
    $('tgc').classList.toggle('is-aspecto', !m);
    $('tgc-modo-m').setAttribute('aria-pressed', m ? 'true' : 'false');
    $('tgc-modo-a').setAttribute('aria-pressed', m ? 'false' : 'true');
    $('tgc-vista-musculos').hidden = !m;
    $('tgc-vista-aspecto').hidden = m;
    $('tgc-leyenda').hidden = !m;
  }
  function renderTodo() { aplicarTextos(); renderModo(); renderMusculos(); renderEditor(); if (grupoAbierto) renderHoja(); }
  function setModo(m) {
    if (m === modo) return;
    modo = m; renderModo(); renderFigura();
    if (m === 'musculos') try { $('tgc-escena').scrollIntoView({ block: 'nearest', behavior: reducido ? 'auto' : 'smooth' }); } catch (e) {}
  }

  /* ── eventos (una vez, al montar) ── */
  function zonaDe(e) { var z = e.target && e.target.closest ? e.target.closest('.tgf-z') : null; return z && z.getAttribute('data-g'); }
  function marcarHover(g) {
    panel.querySelectorAll('.tgf-z.is-hover').forEach(function (z) { z.classList.remove('is-hover'); });
    if (g) panel.querySelectorAll('.tgc-cara[aria-hidden="false"] .tgf-z[data-g="' + g + '"]').forEach(function (z) { z.classList.add('is-hover'); });
  }
  function enganchar() {
    $('tgc-back').addEventListener('click', function () { cerrar(); });
    $('tgc-modo-m').addEventListener('click', function () { setModo('musculos'); });
    $('tgc-modo-a').addEventListener('click', function () { setModo('aspecto'); });
    $('tgc-listo').addEventListener('click', function () { setModo('musculos'); try { $('tgc-modo-m').focus({ preventScroll: true }); } catch (e) {} });
    $('tgc-girar').addEventListener('click', function () { vista = vista === 'frente' ? 'espalda' : 'frente'; renderFigura(); });
    var giro = $('tgc-giro');
    giro.addEventListener('click', function (e) { if (modo !== 'musculos') return; var g = zonaDe(e); if (g) abrirHoja(g); });
    giro.addEventListener('pointerover', function (e) { if (modo === 'musculos' && e.pointerType === 'mouse') marcarHover(zonaDe(e)); });
    giro.addEventListener('pointerleave', function () { marcarHover(null); });
    $('tgc-lista').addEventListener('click', function (e) { var b = e.target.closest('.tgc-fila'); if (b) abrirHoja(b.dataset.g); });
    /* la semana: tocar un día enseña sus series y sus grupos debajo */
    $('tgc-dias7').addEventListener('click', function (e) {
      var b = e.target.closest('.tgc-dia'); if (!b) return;
      diaSel = b.dataset.d;
      $('tgc-dias7').querySelectorAll('.tgc-dia').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.d === diaSel ? 'true' : 'false'); });
      renderDia();
    });
    $('tgc-opciones').addEventListener('change', function (e) { var i = e.target; if (i && i.name && i.name.indexOf('tgc-') === 0) cambiarAspecto(i.name.slice(4), i.value); });
    $('tgc-azar').addEventListener('click', azar);
    $('tgc-borrar').addEventListener('click', function () { $('tgc-borrar').hidden = true; $('tgc-borrar-confirm').hidden = false; try { $('tgc-borrar-no').focus(); } catch (e) {} });
    $('tgc-borrar-no').addEventListener('click', function () { $('tgc-borrar-confirm').hidden = true; $('tgc-borrar').hidden = false; try { $('tgc-borrar').focus(); } catch (e) {} });
    $('tgc-borrar-si').addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      st = vacio(); $('tgc-borrar-confirm').hidden = true; $('tgc-borrar').hidden = false;
      renderTodo(); toast(tx('cuerpoBorrado'));
    });
    /* la hoja */
    $('tgc-velo').addEventListener('click', function () { cerrarHoja(); });
    $('tgc-hoja-cerrar').addEventListener('click', function () { cerrarHoja(); });
    $('tgc-menos').addEventListener('click', function () { anotarN = Math.max(1, anotarN - 1); pintarPaso('tgc'); });
    $('tgc-mas').addEventListener('click', function () { anotarN = Math.min(MAX_N, anotarN + 1); pintarPaso('tgc'); });
    $('tgc-n').addEventListener('change', function () { var v = Math.round(Number($('tgc-n').value)); anotarN = isFinite(v) ? Math.max(1, Math.min(MAX_N, v)) : anotarN; pintarPaso('tgc'); });
    $('tgc-hoy').addEventListener('click', function () { anotarDia = 'hoy'; pintarPaso('tgc'); });
    $('tgc-ayer').addEventListener('click', function () { anotarDia = 'ayer'; pintarPaso('tgc'); });
    $('tgc-guardar').addEventListener('click', anotar);
    $('tgc-hist').addEventListener('click', function (e) { var b = e.target.closest('.tgc-hist-x'); if (b) borrarEntrada(Number(b.dataset.i)); });
    /* los ejercicios */
    $('tgc-ej-ent').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; ejEntorno = b.dataset.v; renderEjLista(); });
    $('tgc-ej-niv').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; ejNivel = Number(b.dataset.v) || 0; renderEjLista(); });
    $('tgc-ej-buscar').addEventListener('input', function () { ejBuscar = this.value; renderEjLista(); });
    $('tgc-ej-reintentar').addEventListener('click', function () { ejError = false; renderEjLista(); });
    $('tgc-ej-lista').addEventListener('click', function (e) { var b = e.target.closest('.tgc-ej-fila'); if (b) abrirEj(b.dataset.id); });
    $('tgc-ej-volver').addEventListener('click', function () { volverGrupo(); });
    /* de una ficha a otra (la base o una variante): misma página, sin entrada nueva en el historial */
    function irA(id) { if (EJ && EJ.porId[id]) { ejAbierto = id; renderEj(); $('tgc-hoja').scrollTop = 0; try { $('tgc-ej-nom').focus({ preventScroll: true }); } catch (e) {} } }
    $('tgc-ej-variante').addEventListener('click', function () { irA(this.dataset.id); });
    $('tgc-ej-variantes').addEventListener('click', function (e) { var b = e.target.closest('.tgc-ej-var'); if (b) irA(b.dataset.id); });
    $('tgc-ej-cerrar').addEventListener('click', function () { cerrarHoja(); });
    $('tgc-ej-menos').addEventListener('click', function () { anotarN = Math.max(1, anotarN - 1); pintarPaso('tgc-ej'); });
    $('tgc-ej-mas').addEventListener('click', function () { anotarN = Math.min(MAX_N, anotarN + 1); pintarPaso('tgc-ej'); });
    $('tgc-ej-n').addEventListener('change', function () { var v = Math.round(Number($('tgc-ej-n').value)); anotarN = isFinite(v) ? Math.max(1, Math.min(MAX_N, v)) : anotarN; pintarPaso('tgc-ej'); });
    $('tgc-ej-hoy').addEventListener('click', function () { anotarDia = 'hoy'; pintarPaso('tgc-ej'); });
    $('tgc-ej-ayer').addEventListener('click', function () { anotarDia = 'ayer'; pintarPaso('tgc-ej'); });
    $('tgc-ej-guardar').addEventListener('click', anotarEj);
    /* el foco no sale de la hoja mientras está abierta */
    $('tgc-hoja').addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call($('tgc-hoja').querySelectorAll('button, input, [tabindex="0"]'), function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === $('tgc-hoja-tit'))) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }

  /* ── abrir y cerrar ── */
  function montar() {
    if (panel) return;
    var estilo = document.createElement('style');
    estilo.id = 'cuerpo-estilos';
    estilo.textContent = ESTILOS;
    document.head.appendChild(estilo);
    panel = document.createElement('div');
    panel.id = 'cuerpo-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'tgc-titulo');
    panel.innerHTML = CUERPO;
    TEXTOS.forEach(function (t) {
      var n = panel.querySelector(t[0]);
      if (n) n.setAttribute(t[1] === 'tx' ? 'data-tx' : 'data-tx-' + t[1], t[2]);
    });
    document.body.appendChild(panel);
    enganchar();
  }
  /* el perfil queda debajo: inerte mientras «Su cuerpo» está encima */
  function perfilDebajo(si) { var p = document.getElementById('perfil-panel'); if (p) p.inert = !!si && !p.hidden; }
  function abrir(op) {
    montar();
    st = leer();
    if (op && (op.modo === 'aspecto' || op.modo === 'musculos')) modo = op.modo;
    if (!abierto) {
      diaSel = null;
      /* la entrada (el barrido de la lámina y las barras que crecen): una vez, al abrir */
      var t = $('tgc'); t.classList.add('tgc-entra'); clearTimeout(entraReloj);
      entraReloj = setTimeout(function () { t.classList.remove('tgc-entra'); }, 1800);
      antesDeAbrir = document.activeElement;
      abierto = true;
      panel.hidden = false;
      panel.scrollTop = 0;
      perfilDebajo(true);
      /* el botón «atrás» del móvil cierra esta pantalla, no la app ni el perfil. La entrada lleva
         también tgPerfil: el perfil, que está debajo, no se cierra al volver a una entrada suya o de
         lo que tiene encima (modulos/perfil.js mira e.state.tgPerfil en su popstate) */
      if (conHistoria && !historia) { try { history.pushState({ tgPerfil: 1, tgCuerpo: 1 }, ''); historia = true; } catch (e) {} }
    }
    renderTodo();
    try { $('tgc-back').focus({ preventScroll: true }); } catch (e) {}
  }
  function cerrar(sinHistoria) {
    if (!abierto) return;
    if (grupoAbierto) cerrarHoja(true);
    abierto = false;
    panel.hidden = true;
    $('tgc-toast').classList.remove('show');
    perfilDebajo(false);
    if (historia && !sinHistoria) { try { atrasPendiente = true; history.back(); } catch (x) { atrasPendiente = false; } }
    historia = false;
    if (antesDeAbrir && typeof antesDeAbrir.focus === 'function' && document.contains(antesDeAbrir)) { try { antesDeAbrir.focus({ preventScroll: true }); } catch (x) {} }
    antesDeAbrir = null;
  }
  /* «atrás»: primero cierra la hoja, luego la pantalla. El back() de cerrar() también llega aquí */
  window.addEventListener('popstate', function () {
    if (atrasPendiente) { atrasPendiente = false; return; }
    if (ejAbierto) { ejHistoria = false; volverGrupo(true); return; }
    if (grupoAbierto) { hojaHistoria = false; cerrarHoja(true); return; }
    if (!abierto) return;
    historia = false;
    cerrar(true);
  });
  /* Escape: la hoja y luego la pantalla (salvo que haya algo de la app encima: la ficha de la cuenta) */
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !abierto) return;
    var m = document.getElementById('auth-modal-backdrop');
    if (m && m.classList.contains('show')) return;
    e.stopPropagation();
    if (ejAbierto) volverGrupo(); else if (grupoAbierto) cerrarHoja(); else cerrar();
  }, true);
  try { TG_IDIOMA.registrar('cuerpo', function () { if (abierto) renderTodo(); }); } catch (e) {}

  var ESTILOS = `
/* cuerpo.css — la pantalla «Su cuerpo» de Tenerife Go. Va dentro de modulos/cuerpo.js, como
   cadena (app_preparar.js solo copia modulos/*.js a la app de la tienda). Solo reglas de la
   pantalla: los tokens de la paleta v18 (--gold, --gold-light, --dark, --panel, --panel2,
   --border, --text, --muted, --t-*, --ease-*, --shadow-*) son los del :root de index.html.
   Tema único oscuro, como el perfil.
   Diseño del 31-10-2026: la escena es una lámina de atlas (las dos vistas a la vez, con su pie
   en cursiva y el oro de lo trabajado como pan de oro); lo demás, quieto: cifras sin cajas, la
   semana día a día y los 12 grupos como barras con la referencia del ACSM. */
#cuerpo-panel {
  --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-body: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --r: 18px;
  /* los márgenes de la pantalla (la escena los anula para ir de borde a borde en el móvil) */
  --gl: max(16px, env(safe-area-inset-left, 0px)); --gr: max(16px, env(safe-area-inset-right, 0px));
  /* los niveles del mapa de músculos (los mismos que dibuja TG_FIGURA: MUSC.nivel) */
  --n0: #333E4D; --n1: #B58531; --n2: #E0B44C; --n3: #FFE79E;
  --tinta2: rgba(240,236,228,0.72); --linea: rgba(240,236,228,0.09);
  color-scheme: dark;
  /* por encima del perfil (#perfil-panel, 8900) y por debajo de la bienvenida (9000), la
     privacidad (9999) y la ficha de la cuenta (10000) */
  position: fixed; inset: 0; z-index: 8950; overflow: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
  padding: env(safe-area-inset-top, 0px) var(--gr) 32px var(--gl);
  background: var(--dark);
  font: 400 15px/1.5 var(--font-body); color: var(--text); -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;
}
#cuerpo-panel.con-hoja { overflow: hidden; }
:where(#cuerpo-panel) *, :where(#cuerpo-panel) *::before, :where(#cuerpo-panel) *::after { box-sizing: border-box; }
#cuerpo-panel [hidden], #cuerpo-panel[hidden] { display: none !important; }
:where(#cuerpo-panel) :where(button, input) { font-family: inherit; font-size: inherit; color: inherit; }
:where(#cuerpo-panel) :where(button) { cursor: pointer; -webkit-tap-highlight-color: transparent; }
:where(#cuerpo-panel) :focus-visible { outline: 2px solid var(--gold-light); outline-offset: 2px; }

.tgc { max-width: 520px; margin: 0 auto; display: grid; gap: 18px; }

/* ── cabecera fija ── */
.tgc-top {
  position: sticky; top: env(safe-area-inset-top, 0px); z-index: 6;
  display: flex; align-items: center; gap: 12px; padding-block: 12px 6px;
  background: var(--dark);
}
/* el fundido de debajo: lo que pasa por detrás de la cabecera no se lee a través del texto */
.tgc-top::after { content: ""; position: absolute; left: 0; right: 0; top: 100%; height: 14px; background: linear-gradient(var(--dark), transparent); pointer-events: none; }
.tgc-tit { flex: 1; min-width: 0; }
.tgc-top h1 { margin: 0; font: 600 2rem/1 var(--font-display); color: var(--gold-light); letter-spacing: .005em; text-wrap: balance; }
.tgc-lema { margin: 4px 0 0; color: var(--tinta2); font-size: .86rem; line-height: 1.3; }
.tgc-icon-btn {
  flex: none; width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border);
  background: var(--panel); color: var(--text); display: grid; place-items: center;
  transition: border-color var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out);
}
.tgc-icon-btn:hover { border-color: var(--gold); background: rgba(212,175,55,0.1); }

/* ── los dos modos: el oro se desliza al que está puesto ── */
.tgc-modos { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 14px; background: var(--panel); border: 1px solid var(--border); isolation: isolate; }
.tgc-modos::before {
  content: ""; position: absolute; z-index: -1; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 6px); border-radius: 10px;
  background: rgba(212,175,55,0.16); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.55);
  transition: transform var(--t-slow) var(--ease-emph);
}
.tgc.is-aspecto .tgc-modos::before { transform: translateX(calc(100% + 4px)); }
.tgc-modos button {
  min-height: 40px; border: 0; border-radius: 10px; background: transparent; color: var(--tinta2); font-weight: 600; letter-spacing: .01em;
  transition: color var(--t-normal) var(--ease-out);
}
.tgc-modos button[aria-pressed="true"] { color: var(--gold-light); }

/* ── la escena: una lámina de atlas, de borde a borde en el móvil ── */
.tgc-escena {
  --alto: min(54vh, 460px);
  position: relative; isolation: isolate; overflow: hidden;
  margin-left: calc(-1 * var(--gl)); margin-right: calc(-1 * var(--gr));
  padding: 22px 14px 16px; display: grid; justify-items: center; gap: 10px;
  background:
    radial-gradient(56% 44% at 50% 40%, rgba(113,147,196,0.17), transparent 72%),
    radial-gradient(60% 18% at 50% 100%, rgba(212,175,55,0.09), transparent 75%),
    linear-gradient(180deg, #121926, #0E131B);
  border-block: 1px solid rgba(212,175,55,0.12);
}
/* el marco grabado de la lámina */
.tgc-escena::before { content: ""; position: absolute; inset: 8px; z-index: -1; border: 1px solid rgba(212,175,55,0.15); border-radius: 16px; pointer-events: none; }
/* al abrir, una sola vez: un barrido de luz, como sobre el pan de oro */
.tgc-escena::after {
  content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none; mix-blend-mode: screen;
  background: linear-gradient(100deg, transparent 38%, rgba(255,231,158,0.14) 50%, transparent 62%);
  transform: translateX(-130%); animation: tgc-barrido 1500ms var(--ease-out) 200ms 1 both;
}
@keyframes tgc-barrido { to { transform: translateX(130%); } }
/* «Músculos»: las dos vistas a la vez, una al lado de la otra */
.tgc-giro { position: relative; width: min(100%, calc(var(--alto) * 640 / 784 + 10px)); display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tgc-fig { display: grid; justify-items: center; gap: 4px; min-width: 0; }
.tgc-cara { position: relative; width: 100%; aspect-ratio: 320 / 784; animation: tgc-entra 620ms var(--ease-emph); }
@keyframes tgc-entra { from { opacity: .3; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.tgc-cara svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tgc-cara .tgf-z { cursor: pointer; transition: filter var(--t-fast) var(--ease-out); }
.tgc-cara .tgf-z.is-hover { filter: brightness(1.2) saturate(1.1); }
.tgc.is-aspecto .tgc-cara .tgf-z { cursor: default; }
/* el grupo de la hoja abierta: su contorno late una vez */
.tgc-cara .tgf-marca { animation: tgc-late 900ms var(--ease-out) 1; }
@keyframes tgc-late { 0% { opacity: 0; } 30% { opacity: 1; } 60% { opacity: .45; } 100% { opacity: 1; } }
.tgc-cap, .tgc-vista { margin: 0; font: italic 500 1.08rem/1.2 var(--font-display); color: var(--tinta2); text-align: center; }
.tgc-cap::first-letter, .tgc-vista::first-letter { text-transform: uppercase; }
.tgc-vista { display: none; }
.tgc-girar {
  position: absolute; top: 16px; right: 16px; z-index: 2; display: none; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px;
  border-radius: 999px; border: 1px solid var(--border); background: rgba(15,17,23,0.6); color: var(--gold-light); font-weight: 600; font-size: .86rem;
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
}
.tgc-girar:hover { border-color: var(--gold); }
.tgc-girar svg { transition: transform var(--t-slower) var(--ease-in-out); }
.tgc-giro.is-espalda ~ .tgc-girar svg { transform: rotate(180deg); }
/* «Aspecto»: una sola vista, más pequeña y fija arriba mientras se elige debajo; «Girar» le da la vuelta */
.tgc.is-aspecto .tgc-escena { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 64px); z-index: 4; padding-block: 16px 14px; }
.tgc.is-aspecto .tgc-giro { display: block; width: auto; height: min(32vh, 272px); aspect-ratio: 320 / 784; transform-style: preserve-3d; transition: transform var(--t-slower) var(--ease-in-out); }
.tgc.is-aspecto .tgc-giro.is-espalda { transform: rotateY(180deg); }
.tgc.is-aspecto .tgc-fig { position: absolute; inset: 0; display: block; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.tgc.is-aspecto .tgc-fig-espalda { transform: rotateY(180deg); }
.tgc.is-aspecto .tgc-cara { height: 100%; }
.tgc.is-aspecto .tgc-cap { display: none; }
.tgc.is-aspecto .tgc-vista { display: block; position: absolute; top: 18px; left: 22px; z-index: 2; }
.tgc.is-aspecto .tgc-girar { display: inline-flex; }
/* sin nada anotado en 7 días, la lámina dice qué hacer (el mismo texto que la lista de los 12) */
.tgc-pista { margin: 2px 0 0; display: inline-flex; align-items: center; gap: 8px; max-width: 100%; padding: 7px 14px; border-radius: 999px;
  background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.38); color: var(--gold-light); font-size: .84rem; line-height: 1.35; }
.tgc-pista svg { flex: none; }
.tgc.is-aspecto .tgc-pista { display: none; }
/* la leyenda, al pie de la lámina */
.tgc-leyenda { display: grid; gap: 6px; justify-items: center; padding-top: 2px; }
.tgc-leyenda p { margin: 0; font-size: .78rem; color: var(--tinta2); }
.tgc-leyenda ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 14px; }
.tgc-leyenda li { display: inline-flex; align-items: center; gap: 6px; font-size: .82rem; }
.tgc-nivel { flex: none; display: inline-block; width: 12px; height: 12px; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.35); }
.tgc-nivel.n0 { background: var(--n0); box-shadow: inset 0 0 0 1px rgba(240,236,228,0.22); }
.tgc-nivel.n1 { background: var(--n1); } .tgc-nivel.n2 { background: var(--n2); }
.tgc-nivel.n3 { background: var(--n3); box-shadow: 0 0 8px rgba(255,212,103,0.55); }

/* ── secciones ── */
.tgc-semana, .tgc-card { display: grid; gap: 12px; min-width: 0; }
.tgc-card { border-radius: var(--r); border: 1px solid var(--border); background: var(--panel); padding: 18px 16px; }
.tgc-semana h2, .tgc-card h2 { margin: 0; font: 600 1.5rem/1.1 var(--font-display); color: var(--text); text-wrap: balance; }
.tgc-semana p, .tgc-card p { margin: 0; }
.tgc-semana { padding-inline: 2px; }

/* las cifras: sin cajas, separadas por una línea fina */
.tgc-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.tgc-stat { display: grid; gap: 2px; align-content: start; min-width: 0; padding: 2px 10px 2px 12px; border-left: 1px solid var(--linea); }
.tgc-stat:first-child { padding-left: 0; border-left: 0; }
.tgc-stat b { display: flex; align-items: baseline; font: 600 1.7rem/1.1 var(--font-body); color: var(--text); overflow-wrap: anywhere; }
.tgc-stat b small { margin-left: 1px; font-size: .62em; font-weight: 500; color: var(--tinta2); }
.tgc-stat > span { font-size: .78rem; line-height: 1.3; color: var(--tinta2); hyphens: auto; overflow-wrap: anywhere; }
.tgc-stat .tgc-nivel { align-self: center; margin-right: 8px; }
/* «Última vez» es un texto («hace 3 días»), no un número: más pequeño */
.tgc-stat b.txt { font-size: 1.05rem; line-height: 1.25; padding-top: .35em; }
.tgc-stat .pop { display: inline-block; animation: tgc-pop var(--t-slower) var(--ease-bounce); }
@keyframes tgc-pop { 0% { transform: scale(1); } 40% { transform: scale(1.25); color: var(--gold-light); } 100% { transform: scale(1); } }

/* la semana, día a día: series anotadas cada día (una sola serie de datos, en oro) */
.tgc-dias7 { list-style: none; margin: 4px 0 0; padding: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px;
  border-bottom: 0; position: relative; }
.tgc-dia {
  width: 100%; display: grid; grid-template-rows: 72px auto; justify-items: center; gap: 6px; padding: 6px 0 6px; border: 0; border-radius: 10px;
  background: transparent; color: var(--tinta2); transition: background var(--t-fast) var(--ease-out);
}
.tgc-dia:hover { background: rgba(240,236,228,0.04); }
.tgc-dia[aria-pressed="true"] { background: rgba(212,175,55,0.09); }
.tgc-dia-col { position: relative; align-self: stretch; width: 100%; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1px solid var(--linea); }
.tgc-dia-barra { display: block; width: min(18px, 60%); border-radius: 4px 4px 0 0; background: var(--gold); transform-origin: bottom; }
/* las barras crecen solo al abrir la pantalla (no cada vez que se anota o se cambia de idioma) */
.tgc.tgc-entra .tgc-dia-barra { animation: tgc-crece 600ms var(--ease-emph) both; }
.tgc-dia-barra.cero { height: 2px !important; width: 8px; border-radius: 1px; background: rgba(240,236,228,0.22); animation: none; }
@keyframes tgc-crece { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.tgc-dia-l { font-size: .8rem; font-weight: 500; line-height: 1; text-transform: capitalize; }
.tgc-dia.es-hoy .tgc-dia-l { color: var(--gold-light); font-weight: 700; }
.tgc-dia-info { min-height: 2.9em; }
.tgc-dia-txt { font-weight: 600; font-size: .92rem; }
.tgc-dia-txt::first-letter { text-transform: uppercase; }
.tgc-dia-grupos { font-size: .84rem; color: var(--tinta2); }
.tgc-reco { display: grid; grid-template-columns: 22px 1fr; gap: 10px; align-items: start; padding: 12px 14px; border-radius: 14px; background: rgba(212,175,55,0.07); border: 1px solid rgba(212,175,55,0.16); font-size: .9rem; line-height: 1.45; }
.tgc-reco svg { color: var(--gold); margin-top: 1px; }
.tgc-ref, .tgc-fuentes, .tgc-ayuda { font-size: .82rem; color: var(--tinta2); }
.tgc-fuentes { font-size: .76rem; color: var(--tinta2); opacity: .9; }
/* la referencia del ACSM (solo adultos): la misma marca que cruza cada barra */
.tgc-ref { position: relative; padding-left: 16px; }
.tgc-ref::before { content: ""; position: absolute; left: 4px; top: .15em; bottom: .15em; width: 2px; border-radius: 1px; background: rgba(240,236,228,0.6); }

/* ── los 12 grupos: una barra por grupo con las series de 7 días ── */
/* las barras de todas las filas, del mismo largo (la marca del 10 cae en el mismo sitio): la columna de la
   derecha es la misma para todas (subgrid) y, donde no hay subgrid, tiene un ancho mínimo */
.tgc-lista { list-style: none; margin: 2px 0 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 0; }
.tgc-lista > li { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) auto; }
@supports (grid-template-columns: subgrid) { .tgc-lista > li, .tgc-fila { grid-template-columns: subgrid !important; } }
.tgc-fila {
  grid-column: 1 / -1;
  width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(5.6em, auto); grid-template-areas: "nom n" "barra cuando"; align-items: center; column-gap: 14px; row-gap: 7px;
  min-height: 58px; padding: 9px 10px; margin-inline: -10px; width: calc(100% + 20px); border: 0; border-radius: 12px; background: transparent; text-align: start;
  transition: background var(--t-fast) var(--ease-out);
}
.tgc-fila:hover { background: rgba(212,175,55,0.07); }
.tgc-fila-nom { grid-area: nom; font-weight: 600; overflow-wrap: anywhere; line-height: 1.25; }
.tgc-fila-n { grid-area: n; font-size: .88rem; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: end; }
.tgc-fila-cuando { grid-area: cuando; font-size: .78rem; color: var(--tinta2); white-space: nowrap; text-align: end; }
.tgc-barra { grid-area: barra; position: relative; display: block; height: 8px; border-radius: 0 4px 4px 0; background: rgba(240,236,228,0.07); }
.tgc-barra .tgc-nivel { position: absolute; left: 0; top: 0; bottom: 0; width: auto; height: auto; border-radius: 0 4px 4px 0; box-shadow: none; transform-origin: left; }
.tgc.tgc-entra .tgc-barra .tgc-nivel { animation: tgc-alarga 700ms var(--ease-emph) both; }
@keyframes tgc-alarga { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.tgc-barra .tgc-nivel.n3 { box-shadow: 0 0 10px rgba(255,212,103,0.45); }
.tgc-barra-ref { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-left: -1px; border-radius: 1px; background: rgba(240,236,228,0.6); }
.tgc-fila-flecha { display: none; }

/* ── el editor del aspecto ── */
.tgc-editor-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.tgc-sec { display: grid; gap: 16px; padding-top: 16px; border-top: 1px solid var(--linea); }
.tgc-sec h3 { margin: 0; font: 600 1.2rem/1.2 var(--font-display); color: var(--gold-light); }
.tgc-op { border: 0; margin: 0; padding: 0; min-width: 0; display: grid; gap: 8px; }
.tgc-op legend { padding: 0; margin-bottom: 8px; font-weight: 600; font-size: .92rem; }
.tgc-chips, .tgc-colores { display: flex; flex-wrap: wrap; gap: 8px; }
.tgc-chip, .tgc-color { position: relative; display: inline-block; }
.tgc-chip input, .tgc-color input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.tgc-chip span {
  display: inline-flex; align-items: center; min-height: 40px; padding: 0 15px; border-radius: 999px; border: 1px solid rgba(240,236,228,0.16);
  background: var(--dark); font-size: .88rem; transition: border-color var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out);
}
.tgc-chip input:checked + span { border-color: var(--gold); background: rgba(212,175,55,0.16); color: var(--gold-light); font-weight: 600; }
.tgc-chip:hover span { border-color: rgba(212,175,55,0.6); }
.tgc-color span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; border: 2px solid transparent; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.35), 0 0 0 1px rgba(240,236,228,0.12);
  transition: transform var(--t-fast) var(--ease-out); }
.tgc-color input:checked + span { border-color: var(--gold-light); box-shadow: inset 0 0 0 2px var(--panel), 0 0 0 3px rgba(245,199,107,0.3); transform: scale(1.06); }
.tgc-chip input:focus-visible + span, .tgc-color input:focus-visible + span { outline: 2px solid var(--gold-light); outline-offset: 2px; }

/* ── botones ── */
.tgc-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border);
  background: var(--panel2); color: var(--text); font-weight: 500; min-height: 44px; white-space: nowrap;
  transition: transform var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out), border-color var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out);
}
.tgc-btn:hover { border-color: var(--gold); box-shadow: var(--shadow-glow); }
.tgc-btn:active { transform: scale(.97); }
.tgc-btn:disabled { opacity: .45; cursor: default; transform: none; box-shadow: none; }
.tgc-btn.gold { background: linear-gradient(180deg, #E2BE52, var(--gold)); color: #1a1407; border-color: var(--gold); font-weight: 700; }
.tgc-btn.gold:hover { background: var(--gold-light); border-color: var(--gold-light); }
.tgc-btn.ghost { background: transparent; }
.tgc-btn.sm { padding: 6px 12px; min-height: 38px; font-size: .86rem; }
.tgc-btn.wide { width: 100%; }
.tgc-link { background: none; border: 0; color: var(--tinta2); text-decoration: underline; text-underline-offset: 3px; padding: 8px 4px; font-size: .86rem; justify-self: center; }

/* ── el pie ── */
.tgc-pie { display: grid; gap: 8px; padding: 8px 8px 0; font-size: .8rem; color: var(--tinta2); text-align: center; }
.tgc-pie p { margin: 0; }
.tgc-confirm { display: grid; gap: 10px; padding: 12px; border-radius: 14px; border: 1px solid rgba(242,140,140,0.45); background: rgba(242,140,140,0.08); color: var(--text); }
.tgc-confirm div { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

/* ── la hoja de cada grupo ── */
.tgc-velo { position: fixed; inset: 0; z-index: 10; background: rgba(5,7,10,0.62); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); }
.tgc-hoja {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 11; margin: 0 auto; max-width: 560px; max-height: 92vh; overflow: auto; overscroll-behavior: contain;
  border-radius: 26px 26px 0 0; border: 1px solid var(--border); border-bottom: 0; background: linear-gradient(180deg, #1D2533, var(--panel) 220px);
  padding: 8px max(18px, env(safe-area-inset-right, 0px)) calc(22px + env(safe-area-inset-bottom, 0px)) max(18px, env(safe-area-inset-left, 0px));
  display: grid; gap: 14px; box-shadow: var(--shadow-xl); animation: tgc-sube var(--t-slow) var(--ease-emph);
}
@keyframes tgc-sube { from { transform: translateY(28px); opacity: .4; } to { transform: none; opacity: 1; } }
.tgc-asa { justify-self: center; width: 40px; height: 4px; border-radius: 2px; background: rgba(240,236,228,0.25); }
.tgc-hoja-cab { display: flex; align-items: center; gap: 10px; }
.tgc-hoja-cab h2 { flex: 1; min-width: 0; margin: 0; font: 600 1.75rem/1.05 var(--font-display); color: var(--gold-light); outline: none; text-wrap: balance; }
.tgc-hoja-cab h2:focus-visible { outline: 2px solid var(--gold-light); outline-offset: 2px; border-radius: 6px; }
.tgc-hoja p { margin: 0; }
.tgc-hoja-intro { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 14px; align-items: start; }
.tgc-hoja-mini { width: 62px; aspect-ratio: 320 / 784; border-radius: 12px; background: radial-gradient(70% 50% at 50% 42%, rgba(113,147,196,0.18), transparent 75%), #121926; padding: 6px 4px; }
.tgc-hoja-mini svg { display: block; width: 100%; height: 100%; }
.tgc-hoja-txt { display: grid; gap: 8px; min-width: 0; }
.tgc-hoja-desc { color: var(--text); font-size: .92rem; line-height: 1.5; }
.tgc-hoja-latin { color: var(--tinta2); font: italic 500 .98rem/1.35 var(--font-display); }
.tgc-hoja h3 { margin: 6px 0 0; font-size: .95rem; font-weight: 600; color: var(--text); }
.tgc-anotar { display: grid; gap: 12px; padding: 14px; border-radius: 18px; background: var(--dark); border: 1px solid rgba(212,175,55,0.16); }
.tgc-fila-ctl { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.tgc-fila-ctl > span { font-weight: 600; font-size: .92rem; }
.tgc-paso { display: inline-flex; align-items: center; gap: 6px; }
.tgc-paso button { width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel2); font-size: 1.3rem; line-height: 1; display: grid; place-items: center; }
.tgc-paso button:disabled { opacity: .4; cursor: default; }
.tgc-paso input {
  width: 64px; height: 44px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel); text-align: center;
  font: 600 1.3rem/1 var(--font-body); font-variant-numeric: tabular-nums; -moz-appearance: textfield; appearance: textfield;
}
.tgc-paso input::-webkit-outer-spin-button, .tgc-paso input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.tgc-dias { display: inline-flex; gap: 6px; }
.tgc-dias button { min-height: 42px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(240,236,228,0.18); background: var(--panel); font-weight: 500; }
.tgc-dias button[aria-pressed="true"] { border-color: var(--gold); background: rgba(212,175,55,0.16); color: var(--gold-light); font-weight: 600; }
.tgc-hist { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.tgc-hist-fila { display: grid; grid-template-columns: minmax(0, 1fr) auto 40px; align-items: center; gap: 10px; padding: 4px 4px 4px 12px; border-radius: 12px; background: rgba(15,17,23,0.55); }
.tgc-hist-n { font-weight: 600; font-variant-numeric: tabular-nums; }
.tgc-hist-f { color: var(--tinta2); font-size: .86rem; }
.tgc-hist-x { width: 40px; height: 40px; border: 0; border-radius: 10px; background: transparent; color: var(--tinta2); font-size: 1.3rem; line-height: 1; }
.tgc-hist-x:hover { color: var(--text); background: rgba(242,140,140,0.12); }

/* ── los ejercicios: la lista del grupo y la ficha de cada uno ── */
.tgc-pag { display: grid; gap: 14px; min-width: 0; }
.tgc-filtros { display: grid; gap: 8px; min-width: 0; }
.tgc-seg { display: flex; flex-wrap: wrap; gap: 6px; }
.tgc-seg button {
  flex: none; min-height: 38px; padding: 0 13px; border-radius: 999px; border: 1px solid rgba(240,236,228,0.16); background: var(--dark);
  font-size: .85rem; white-space: nowrap; transition: border-color var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out);
}
.tgc-seg button[aria-pressed="true"] { border-color: var(--gold); background: rgba(212,175,55,0.16); color: var(--gold-light); font-weight: 600; }
.tgc-buscar {
  width: 100%; min-height: 46px; padding: 0 14px 0 40px; border-radius: 14px; border: 1px solid rgba(240,236,228,0.16);
  background: var(--dark) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23b9b4aa' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M20 20l-3.5-3.5'/%3E%3C/svg%3E") no-repeat 13px 50%;
  font-size: 16px; /* 16px: Safari en iPhone no hace zoom al escribir */
}
.tgc-buscar::placeholder { color: var(--muted); opacity: 1; }
.tgc-buscar:focus { border-color: var(--gold); outline: none; }
.tgc-buscar:focus-visible { outline: 2px solid var(--gold-light); outline-offset: 2px; }
.tgc-ej-lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.tgc-ej-fila {
  width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; min-height: 58px; padding: 9px 14px;
  border-radius: 14px; border: 1px solid rgba(240,236,228,0.07); background: rgba(15,17,23,0.55); text-align: start;
  transition: border-color var(--t-fast) var(--ease-out), background var(--t-fast) var(--ease-out);
}
.tgc-ej-fila:hover { border-color: rgba(212,175,55,0.5); background: rgba(212,175,55,0.06); }
.tgc-ej-txt { display: grid; gap: 2px; min-width: 0; }
.tgc-ej-nombre { font-weight: 600; overflow-wrap: anywhere; line-height: 1.3; }
.tgc-ej-meta { display: flex; flex-wrap: wrap; gap: 0 10px; font-size: .8rem; color: var(--tinta2); }
.tgc-ej-niv { color: var(--gold-light); opacity: .85; }
.tgc-ej-lado { display: grid; justify-items: end; gap: 3px; }
.tgc-ej-puntos { display: inline-flex; gap: 3px; }
.tgc-ej-puntos i { width: 7px; height: 7px; border-radius: 50%; box-shadow: inset 0 0 0 1.5px var(--gold); }
.tgc-ej-puntos i.si { background: var(--gold); }
.tgc-ej-ult { font-size: .74rem; color: var(--tinta2); white-space: nowrap; }
.tgc-hist-ej { display: block; font-weight: 400; font-size: .8rem; color: var(--tinta2); overflow-wrap: anywhere; }
.tgc-ej-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.tgc-ej-chips li { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; font-size: .8rem; background: rgba(240,236,228,0.05); border: 1px solid rgba(240,236,228,0.13); }
.tgc-ej-chips li.ent { border-color: rgba(212,175,55,0.5); color: var(--gold-light); }
.tgc-ej-chips li.niv .tgc-ej-puntos i { width: 6px; height: 6px; }
.tgc-ej-cuerpo { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: center; padding: 12px; border-radius: 18px;
  background: radial-gradient(60% 70% at 25% 45%, rgba(113,147,196,0.16), transparent 75%), #111824; border: 1px solid rgba(212,175,55,0.14); }
.tgc-ej-figuras { display: flex; gap: 4px; }
.tgc-ej-fig { width: 68px; aspect-ratio: 320 / 784; }
.tgc-ej-fig svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tgc-ej-musc { display: grid; gap: 10px; min-width: 0; }
.tgc-ej-musc h3 { margin: 0 !important; }
.tgc-ej-mlin { display: grid !important; grid-template-columns: 12px minmax(0, 1fr); gap: 8px; align-items: start; margin: 0; font-size: .9rem; }
.tgc-ej-mlin .tgc-nivel { margin-top: 4px; }
.tgc-ej-g { display: block; }
.tgc-ej-mlin b { display: block; font-size: .78rem; color: var(--tinta2); font-weight: 500; }
/* «Cómo se hace» es una secuencia: sus pasos van numerados */
.tgc-ej-pasos { list-style: none; counter-reset: paso; margin: 0; padding: 0; display: grid; gap: 12px; line-height: 1.5; }
.tgc-ej-pasos li { counter-increment: paso; display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; }
.tgc-ej-pasos li::before { content: counter(paso); display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid rgba(212,175,55,0.6); color: var(--gold-light); font: 600 .95rem/1 var(--font-display); }
.tgc-ej-base { justify-self: start; padding: 0; color: var(--gold-light); text-align: start; }
.tgc-ej-variantes { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.tgc-ej-var { min-height: 38px; padding: 4px 13px; border-radius: 999px; border: 1px solid rgba(212,175,55,0.35); background: var(--dark); font-size: .85rem; text-align: start; }
.tgc-ej-var:hover { border-color: var(--gold); color: var(--gold-light); }
.tgc-ej-fuentes { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: .86rem; }
.tgc-ej-fuentes a { color: var(--gold-light); text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
.tgc-ej-nota { margin: 10px 0 0; font-size: .8rem; line-height: 1.45; color: var(--tinta2); }

/* ── el aviso de abajo ── */
.tgc-toast {
  position: fixed; left: 50%; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 20px); z-index: 12;
  display: flex; align-items: center; gap: 12px; width: max-content; max-width: calc(100% - 32px); padding: 8px 10px 8px 16px; border-radius: 999px;
  background: var(--panel2); color: var(--text); border: 1px solid var(--gold); box-shadow: var(--shadow-lg); font-size: .9rem;
  opacity: 0; pointer-events: none; transition: opacity var(--t-slow) var(--ease-out), transform var(--t-slow) var(--ease-bounce);
}
.tgc-toast.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
.tgc-toast button { border: 0; background: transparent; color: var(--gold-light); font-weight: 700; padding: 6px 8px; border-radius: 999px; white-space: nowrap; }
.tgc-toast button:hover { background: rgba(212,175,55,0.14); }

/* en una pantalla ancha la lámina deja de ir de borde a borde */
@media (min-width: 560px) {
  .tgc-escena { margin-inline: 0; border-radius: 26px; border: 1px solid rgba(212,175,55,0.16); --alto: min(60vh, 520px); }
}
@media (prefers-reduced-motion: reduce) {
  #cuerpo-panel *, #cuerpo-panel *::before, #cuerpo-panel *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  .tgc-escena::after { display: none; }
}
`;
  var CUERPO = `
<div class="tgc" id="tgc">
  <header class="tgc-top">
    <button type="button" class="tgc-icon-btn" id="tgc-back">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div class="tgc-tit">
      <h1 id="tgc-titulo">Su cuerpo</h1>
      <p class="tgc-lema" id="tgc-lema">Sus músculos, su semana y su personaje</p>
    </div>
  </header>

  <div class="tgc-modos" id="tgc-modos" role="group">
    <button type="button" id="tgc-modo-m" aria-pressed="true">Músculos</button>
    <button type="button" id="tgc-modo-a" aria-pressed="false">Aspecto</button>
  </div>

  <section class="tgc-escena" id="tgc-escena">
    <div class="tgc-giro" id="tgc-giro">
      <div class="tgc-fig">
        <div class="tgc-cara" id="tgc-cara-frente"></div>
        <p class="tgc-cap" id="tgc-cap-frente" aria-hidden="true">de frente</p>
      </div>
      <div class="tgc-fig tgc-fig-espalda">
        <div class="tgc-cara tgc-cara-espalda" id="tgc-cara-espalda" aria-hidden="true"></div>
        <p class="tgc-cap" id="tgc-cap-espalda" aria-hidden="true">de espaldas</p>
      </div>
    </div>
    <p class="tgc-vista" id="tgc-vista" aria-hidden="true">de frente</p>
    <button type="button" class="tgc-girar" id="tgc-girar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>
      <span id="tgc-girar-txt">Girar</span>
    </button>
    <p class="tgc-pista" id="tgc-pista" hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 10.5V9a1.5 1.5 0 0 1 3 0v2"/><path d="M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4.4 15.9a1.6 1.6 0 0 1 2.3-2.2L9 15.5"/></svg>
      <span id="tgc-pista-txt"></span>
    </p>
    <div class="tgc-leyenda" id="tgc-leyenda">
      <p id="tgc-leyenda-tit">Series en los últimos 7 días</p>
      <ul>
        <li><i class="tgc-nivel n0" aria-hidden="true"></i><span id="tgc-ley-0">Ninguna</span></li>
        <li><i class="tgc-nivel n1" aria-hidden="true"></i><span id="tgc-ley-1">De 1 a 4</span></li>
        <li><i class="tgc-nivel n2" aria-hidden="true"></i><span id="tgc-ley-2">De 5 a 9</span></li>
        <li><i class="tgc-nivel n3" aria-hidden="true"></i><span id="tgc-ley-3">10 o más</span></li>
      </ul>
    </div>
  </section>

  <div class="tgc-vista-m" id="tgc-vista-musculos">
    <section class="tgc-semana" id="tgc-resumen">
      <h2 id="tgc-resumen-tit">Sus últimos 7 días</h2>
      <div class="tgc-stats tgc-kpis">
        <div class="tgc-stat"><b id="tgc-st-series">0</b><span id="tgc-st-series-l">Series</span></div>
        <div class="tgc-stat"><b id="tgc-st-grupos">0/12</b><span id="tgc-st-grupos-l">Grupos trabajados</span></div>
        <div class="tgc-stat"><b id="tgc-st-dias">0/7</b><span id="tgc-st-dias-l">Días con fuerza</span></div>
      </div>
      <ol class="tgc-dias7" id="tgc-dias7"></ol>
      <div class="tgc-dia-info" id="tgc-dia-info" aria-live="polite">
        <p class="tgc-dia-txt" id="tgc-dia-txt"></p>
        <p class="tgc-dia-grupos" id="tgc-dia-grupos"></p>
      </div>
      <div class="tgc-reco">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>
        <p id="tgc-reco"></p>
      </div>
      <p class="tgc-fuentes" id="tgc-fuentes"></p>
    </section>
    <section class="tgc-card tgc-grupos" id="tgc-grupos">
      <h2 id="tgc-grupos-tit">Los 12 grupos musculares</h2>
      <p class="tgc-ayuda" id="tgc-grupos-ayuda"></p>
      <p class="tgc-ref" id="tgc-ref"></p>
      <ul class="tgc-lista" id="tgc-lista"></ul>
    </section>
  </div>

  <div class="tgc-vista-a" id="tgc-vista-aspecto" hidden>
    <section class="tgc-card tgc-editor" id="tgc-editor">
      <div class="tgc-editor-top">
        <h2 id="tgc-aspecto-tit">Su aspecto</h2>
        <button type="button" class="tgc-btn sm ghost" id="tgc-azar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>
          <span>Al azar</span>
        </button>
      </div>
      <p class="tgc-ayuda" id="tgc-aspecto-lema"></p>
      <div id="tgc-opciones"></div>
      <button type="button" class="tgc-btn gold wide" id="tgc-listo"><span>Listo</span></button>
    </section>
  </div>

  <footer class="tgc-pie">
    <p id="tgc-privacidad"></p>
    <p id="tgc-aviso"></p>
    <p id="tgc-ia"></p>
    <button type="button" class="tgc-link" id="tgc-borrar"></button>
    <div class="tgc-confirm" id="tgc-borrar-confirm" hidden>
      <p id="tgc-borrar-seguro"></p>
      <div>
        <button type="button" class="tgc-btn sm" id="tgc-borrar-si"><span>Sí, borrar</span></button>
        <button type="button" class="tgc-btn sm ghost" id="tgc-borrar-no"><span>Cancelar</span></button>
      </div>
    </div>
  </footer>
</div>

<div class="tgc-velo" id="tgc-velo" hidden></div>
<div class="tgc-hoja" id="tgc-hoja" role="dialog" aria-modal="true" aria-labelledby="tgc-hoja-tit" hidden>
  <div class="tgc-asa" aria-hidden="true"></div>
  <div class="tgc-pag" id="tgc-pag-grupo">
  <div class="tgc-hoja-cab">
    <h2 id="tgc-hoja-tit" tabindex="-1"></h2>
    <button type="button" class="tgc-icon-btn" id="tgc-hoja-cerrar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  </div>
  <div class="tgc-hoja-intro">
    <div class="tgc-hoja-mini" id="tgc-hoja-mini" aria-hidden="true"></div>
    <div class="tgc-hoja-txt">
      <p class="tgc-hoja-desc" id="tgc-hoja-desc"></p>
      <p class="tgc-hoja-latin" id="tgc-hoja-latin" lang="la" data-sin-traducir="nombres latinos de la Terminologia Anatomica"></p>
    </div>
  </div>
  <div class="tgc-stats">
    <div class="tgc-stat"><b><i class="tgc-nivel n0" id="tgc-hoja-nivel" aria-hidden="true"></i><span id="tgc-h-series">0</span></b><span id="tgc-h-series-l">Series, 7 días</span></div>
    <div class="tgc-stat"><b id="tgc-h-dias">0/7</b><span id="tgc-h-dias-l">Días, 7 días</span></div>
    <div class="tgc-stat"><b id="tgc-h-ultima">—</b><span id="tgc-h-ultima-l">Última vez</span></div>
  </div>
  <h3 id="tgc-anotar-tit">Anotar series</h3>
  <div class="tgc-anotar">
    <div class="tgc-fila-ctl">
      <span id="tgc-cuantas">Series</span>
      <div class="tgc-paso">
        <button type="button" id="tgc-menos">−</button>
        <input type="number" id="tgc-n" inputmode="numeric" min="1" max="30" step="1" value="3" aria-labelledby="tgc-cuantas">
        <button type="button" id="tgc-mas">+</button>
      </div>
    </div>
    <div class="tgc-fila-ctl">
      <span id="tgc-cuando">Cuándo</span>
      <div class="tgc-dias" role="group" id="tgc-dias" aria-labelledby="tgc-cuando">
        <button type="button" id="tgc-hoy" aria-pressed="true">Hoy</button>
        <button type="button" id="tgc-ayer" aria-pressed="false">Ayer</button>
      </div>
    </div>
    <button type="button" class="tgc-btn gold wide" id="tgc-guardar"><span>Guardar</span></button>
  </div>
  <h3 id="tgc-hist-tit">Lo último anotado</h3>
  <ul class="tgc-hist" id="tgc-hist"></ul>
  <p class="tgc-ayuda" id="tgc-hist-nada"></p>
  <h3 id="tgc-ej-tit">Ejercicios</h3>
  <div class="tgc-filtros">
    <div class="tgc-seg" role="group" id="tgc-ej-ent">
      <button type="button" data-v="todos" aria-pressed="true">Todos</button>
      <button type="button" data-v="gimnasio" aria-pressed="false">Gimnasio</button>
      <button type="button" data-v="fuera" aria-pressed="false">Fuera</button>
      <button type="button" data-v="calistenia" aria-pressed="false">Calistenia</button>
    </div>
    <div class="tgc-seg" role="group" id="tgc-ej-niv">
      <button type="button" data-v="0" aria-pressed="true">Todos los niveles</button>
      <button type="button" data-v="1" aria-pressed="false">Inicial</button>
      <button type="button" data-v="2" aria-pressed="false">Intermedio</button>
      <button type="button" data-v="3" aria-pressed="false">Avanzado</button>
    </div>
    <input type="search" class="tgc-buscar" id="tgc-ej-buscar" autocomplete="off" spellcheck="false" enterkeyhint="search" maxlength="60">
  </div>
  <p class="tgc-ayuda" id="tgc-ej-estado" role="status"></p>
  <button type="button" class="tgc-btn sm ghost" id="tgc-ej-reintentar" hidden><span>Reintentar</span></button>
  <ul class="tgc-ej-lista" id="tgc-ej-lista"></ul>
  <p class="tgc-fuentes" id="tgc-ej-propias"></p>
  </div>

  <div class="tgc-pag" id="tgc-pag-ej" hidden>
    <div class="tgc-hoja-cab">
      <button type="button" class="tgc-icon-btn" id="tgc-ej-volver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h2 id="tgc-ej-nom" tabindex="-1"></h2>
      <button type="button" class="tgc-icon-btn" id="tgc-ej-cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <button type="button" class="tgc-link tgc-ej-base" id="tgc-ej-variante" hidden></button>
    <ul class="tgc-ej-chips" id="tgc-ej-chips"></ul>
    <div class="tgc-ej-cuerpo">
      <div class="tgc-ej-figuras" id="tgc-ej-figuras" aria-hidden="true">
        <div class="tgc-ej-fig" id="tgc-ej-fig-frente"></div>
        <div class="tgc-ej-fig" id="tgc-ej-fig-espalda"></div>
      </div>
      <div class="tgc-ej-musc">
        <h3 id="tgc-ej-musc-tit">Músculos</h3>
        <p class="tgc-ej-mlin"><i class="tgc-nivel n3" aria-hidden="true"></i><span><b id="tgc-ej-prim-l">Principal</b><span id="tgc-ej-prim"></span></span></p>
        <p class="tgc-ej-mlin" id="tgc-ej-sec-fila"><i class="tgc-nivel n1" aria-hidden="true"></i><span><b id="tgc-ej-sec-l">Secundario</b><span id="tgc-ej-sec"></span></span></p>
      </div>
    </div>
    <h3 id="tgc-ej-como">Cómo se hace</h3>
    <ol class="tgc-ej-pasos" id="tgc-ej-pasos"></ol>
    <div id="tgc-ej-var-caja" hidden>
      <h3 id="tgc-ej-var-tit">Variantes</h3>
      <ul class="tgc-ej-variantes" id="tgc-ej-variantes"></ul>
    </div>
    <h3 id="tgc-ej-anotar-tit">Anotar series de este ejercicio</h3>
    <div class="tgc-anotar">
      <div class="tgc-fila-ctl">
        <span id="tgc-ej-cuantas">Series</span>
        <div class="tgc-paso">
          <button type="button" id="tgc-ej-menos">−</button>
          <input type="number" id="tgc-ej-n" inputmode="numeric" min="1" max="30" step="1" value="3" aria-labelledby="tgc-ej-cuantas">
          <button type="button" id="tgc-ej-mas">+</button>
        </div>
      </div>
      <div class="tgc-fila-ctl">
        <span id="tgc-ej-cuando">Cuándo</span>
        <div class="tgc-dias" role="group" aria-labelledby="tgc-ej-cuando">
          <button type="button" id="tgc-ej-hoy" aria-pressed="true">Hoy</button>
          <button type="button" id="tgc-ej-ayer" aria-pressed="false">Ayer</button>
        </div>
      </div>
      <button type="button" class="tgc-btn gold wide" id="tgc-ej-guardar"><span>Guardar</span></button>
    </div>
    <h3 id="tgc-ej-fuentes-tit">Fuentes</h3>
    <ul class="tgc-ej-fuentes" id="tgc-ej-fuentes"></ul>
    <p class="tgc-ej-nota" id="tgc-ej-nota"></p>
  </div>
</div>
<div class="tgc-toast" id="tgc-toast" role="status" aria-live="polite"><span id="tgc-toast-txt"></span><button type="button" id="tgc-toast-btn" hidden></button></div>
`;
  /* Las claves de los textos fijos del cuerpo: [selector, como, clave]; como es tx (el texto),
     aria (aria-label) o ph (placeholder, data-tx-ph: el mismo atributo que traduce applyUiTx de la app). No van en la cadena como marcas (fuente.py pega el modulo dentro de
     un <script>, y auditar_seguridad.py no deja ninguna ahi): montar() las pone con
     setAttribute, y desde ahi las traducen aplicarTextos() y, al cambiar de idioma, applyUiTx()
     de la app. Cada selector da un solo elemento (lo mira tools/probar_cuerpo.js). */
  var TEXTOS = [
    ['#tgc-back', 'aria', 'ariaCerrar'],
    ['#tgc-titulo', 'tx', 'cuerpoTitulo'],
    ['#tgc-lema', 'tx', 'cuerpoLema'],
    ['#tgc-modos', 'aria', 'cuerpoModos'],
    ['#tgc-modo-m', 'tx', 'cuerpoModoMusculos'],
    ['#tgc-modo-a', 'tx', 'cuerpoModoAspecto'],
    ['#tgc-girar-txt', 'tx', 'cuerpoGirar'],
    ['#tgc-cap-frente', 'tx', 'cuerpoVistaFrente'],
    ['#tgc-cap-espalda', 'tx', 'cuerpoVistaEspalda'],
    ['#tgc-leyenda-tit', 'tx', 'cuerpoLeyenda'],
    ['#tgc-ley-0', 'tx', 'cuerpoNivel0'],
    ['#tgc-ley-1', 'tx', 'cuerpoNivel1'],
    ['#tgc-ley-2', 'tx', 'cuerpoNivel2'],
    ['#tgc-ley-3', 'tx', 'cuerpoNivel3'],
    ['#tgc-resumen-tit', 'tx', 'cuerpoResumenTitulo'],
    ['#tgc-st-series-l', 'tx', 'cuerpoStatSeries'],
    ['#tgc-st-grupos-l', 'tx', 'cuerpoStatGrupos'],
    ['#tgc-st-dias-l', 'tx', 'cuerpoStatDias'],
    ['#tgc-ref', 'tx', 'cuerpoRefSeries'],
    ['#tgc-fuentes', 'tx', 'cuerpoFuentes'],
    ['#tgc-grupos-tit', 'tx', 'cuerpoGruposTitulo'],
    ['#tgc-grupos-ayuda', 'tx', 'cuerpoGruposAyuda'],
    ['#tgc-aspecto-tit', 'tx', 'cuerpoAspectoTitulo'],
    ['#tgc-azar span', 'tx', 'cuerpoAlAzar'],
    ['#tgc-aspecto-lema', 'tx', 'cuerpoAspectoLema'],
    ['#tgc-listo span', 'tx', 'cuerpoListo'],
    ['#tgc-privacidad', 'tx', 'cuerpoPrivacidad'],
    ['#tgc-aviso', 'tx', 'cuerpoAviso'],
    ['#tgc-ia', 'tx', 'cuerpoIA'],
    ['#tgc-borrar', 'tx', 'cuerpoBorrar'],
    ['#tgc-borrar-seguro', 'tx', 'cuerpoBorrarSeguro'],
    ['#tgc-borrar-si span', 'tx', 'cuerpoBorrarSi'],
    ['#tgc-borrar-no span', 'tx', 'cuentaBorrarNo'],
    ['#tgc-hoja-cerrar', 'aria', 'ariaCerrar'],
    ['#tgc-h-series-l', 'tx', 'cuerpoStatSeries7'],
    ['#tgc-h-dias-l', 'tx', 'cuerpoStatDias7'],
    ['#tgc-h-ultima-l', 'tx', 'cuerpoStatUltima'],
    ['#tgc-anotar-tit', 'tx', 'cuerpoAnotar'],
    ['#tgc-cuantas', 'tx', 'cuerpoCuantas'],
    ['#tgc-menos', 'aria', 'cuerpoMenos'],
    ['#tgc-mas', 'aria', 'cuerpoMas'],
    ['#tgc-cuando', 'tx', 'cuerpoCuando'],
    ['#tgc-hoy', 'tx', 'cuerpoHoyB'],
    ['#tgc-ayer', 'tx', 'cuerpoAyerB'],
    ['#tgc-guardar span', 'tx', 'cuerpoGuardar'],
    ['#tgc-hist-tit', 'tx', 'cuerpoHistorial'],
    ['#tgc-hist-nada', 'tx', 'cuerpoSinHistorial'],
    ['#tgc-ej-tit', 'tx', 'cuerpoEjercicios'],
    ['#tgc-ej-ent', 'aria', 'cuerpoEntorno'],
    ['#tgc-ej-ent [data-v="todos"]', 'tx', 'cuerpoEntTodos'],
    ['#tgc-ej-ent [data-v="gimnasio"]', 'tx', 'cuerpoEnt_gimnasio'],
    ['#tgc-ej-ent [data-v="fuera"]', 'tx', 'cuerpoEnt_fuera'],
    ['#tgc-ej-ent [data-v="calistenia"]', 'tx', 'cuerpoEnt_calistenia'],
    ['#tgc-ej-niv', 'aria', 'cuerpoNivelFiltro'],
    ['#tgc-ej-niv [data-v="0"]', 'tx', 'cuerpoNivelTodos'],
    ['#tgc-ej-niv [data-v="1"]', 'tx', 'cuerpoNivel_1'],
    ['#tgc-ej-niv [data-v="2"]', 'tx', 'cuerpoNivel_2'],
    ['#tgc-ej-niv [data-v="3"]', 'tx', 'cuerpoNivel_3'],
    ['#tgc-ej-buscar', 'aria', 'cuerpoBuscarEj'],
    ['#tgc-ej-buscar', 'ph', 'cuerpoBuscarEjPh'],
    ['#tgc-ej-reintentar span', 'tx', 'cuerpoReintentar'],
    ['#tgc-ej-propias', 'tx', 'cuerpoFichasPropias'],
    ['#tgc-ej-cerrar', 'aria', 'ariaCerrar'],
    ['#tgc-ej-musc-tit', 'tx', 'cuerpoMusculosEj'],
    ['#tgc-ej-prim-l', 'tx', 'cuerpoPrincipal'],
    ['#tgc-ej-sec-l', 'tx', 'cuerpoSecundario'],
    ['#tgc-ej-como', 'tx', 'cuerpoComoSeHace'],
    ['#tgc-ej-anotar-tit', 'tx', 'cuerpoAnotarEj'],
    ['#tgc-ej-cuantas', 'tx', 'cuerpoCuantas'],
    ['#tgc-ej-menos', 'aria', 'cuerpoMenos'],
    ['#tgc-ej-mas', 'aria', 'cuerpoMas'],
    ['#tgc-ej-cuando', 'tx', 'cuerpoCuando'],
    ['#tgc-ej-hoy', 'tx', 'cuerpoHoyB'],
    ['#tgc-ej-ayer', 'tx', 'cuerpoAyerB'],
    ['#tgc-ej-guardar span', 'tx', 'cuerpoGuardar'],
    ['#tgc-ej-fuentes-tit', 'tx', 'cuerpoFuentesEj'],
    ['#tgc-ej-nota', 'tx', 'cuerpoNotaFuentesEj'],
    ['#tgc-ej-var-tit', 'tx', 'cuerpoVariantes']
  ];

  /* estado() es para las pruebas (tools/probar_cuerpo.js) */
  window.TG_CUERPO = {
    abrir: abrir,
    cerrar: function () { cerrar(); },
    abierto: function () { return abierto; },
    repintar: function () { if (abierto) renderTodo(); },
    estado: function () { return st; }
  };
})();
