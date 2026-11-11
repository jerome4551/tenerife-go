  /* ───────────────────────── el reproductor ─────────────────────────
     El «vídeo» de un ejercicio: la cabecera (Jérôme saluda), un tramo por cada paso de la ficha
     (el texto del paso, tal cual, debajo; arriba, lo que ese paso describe) y el cierre. Con sus
     mandos: pausa, paso a paso, despacio, girar y la voz del móvil. */
  var ENT_UI = {
    "entCon": {"es": "Jérôme se lo enseña", "en": "Jérôme shows you how", "fr": "Jérôme vous montre", "de": "Jérôme zeigt es Ihnen", "it": "Jérôme Le mostra come", "nl": "Jérôme doet het voor", "zh": "Jérôme 为您示范", "zht": "Jérôme 為您示範", "bg": "Jérôme ще ви покаже", "pl": "Jérôme pokazuje, jak to zrobić"},
    "entVideo": {"es": "Vídeo del ejercicio", "en": "Exercise video", "fr": "Vidéo de l’exercice", "de": "Video zur Übung", "it": "Video dell’esercizio", "nl": "Video van de oefening", "zh": "动作视频", "zht": "動作影片", "bg": "Видео на упражнението", "pl": "Film z ćwiczeniem"},
    "entPaso": {"es": "Paso {n} de {N}", "en": "Step {n} of {N}", "fr": "Étape {n} sur {N}", "de": "Schritt {n} von {N}", "it": "Passo {n} di {N}", "nl": "Stap {n} van {N}", "zh": "第 {n} 步，共 {N} 步", "zht": "第 {n} 步，共 {N} 步", "bg": "Стъпка {n} от {N}", "pl": "Krok {n} z {N}"},
    "entPlay": {"es": "Reproducir", "en": "Play", "fr": "Lire", "de": "Abspielen", "it": "Riproduci", "nl": "Afspelen", "zh": "播放", "zht": "播放", "bg": "Пусни", "pl": "Odtwórz"},
    "entPausa": {"es": "Pausa", "en": "Pause", "fr": "Pause", "de": "Pause", "it": "Pausa", "nl": "Pauze", "zh": "暂停", "zht": "暫停", "bg": "Пауза", "pl": "Pauza"},
    "entAnt": {"es": "Paso anterior", "en": "Previous step", "fr": "Étape précédente", "de": "Vorheriger Schritt", "it": "Passo precedente", "nl": "Vorige stap", "zh": "上一步", "zht": "上一步", "bg": "Предишна стъпка", "pl": "Poprzedni krok"},
    "entSig": {"es": "Paso siguiente", "en": "Next step", "fr": "Étape suivante", "de": "Nächster Schritt", "it": "Passo successivo", "nl": "Volgende stap", "zh": "下一步", "zht": "下一步", "bg": "Следваща стъпка", "pl": "Następny krok"},
    "entLento": {"es": "A cámara lenta", "en": "Slow motion", "fr": "Au ralenti", "de": "Zeitlupe", "it": "Al rallentatore", "nl": "Vertraagd", "zh": "慢动作", "zht": "慢動作", "bg": "Забавен каданс", "pl": "Zwolnione tempo"},
    "entGirar": {"es": "Girar", "en": "Turn", "fr": "Tourner", "de": "Drehen", "it": "Gira", "nl": "Draaien", "zh": "转身", "zht": "轉身", "bg": "Завърти", "pl": "Obróć"},
    "entVozOn": {"es": "Escuchar a Jérôme", "en": "Listen to Jérôme", "fr": "Écouter Jérôme", "de": "Jérôme zuhören", "it": "Ascolta Jérôme", "nl": "Luister naar Jérôme", "zh": "听 Jérôme 讲解", "zht": "聽 Jérôme 講解", "bg": "Слушайте Jérôme", "pl": "Posłuchaj Jérôme’a"},
    "entVozOff": {"es": "Parar la voz", "en": "Stop the voice", "fr": "Arrêter la voix", "de": "Stimme stoppen", "it": "Ferma la voce", "nl": "Stem stoppen", "zh": "停止朗读", "zht": "停止朗讀", "bg": "Спри гласа", "pl": "Wyłącz głos"},
    "entOtraVez": {"es": "Ver otra vez", "en": "Watch again", "fr": "Revoir", "de": "Noch einmal ansehen", "it": "Rivedi", "nl": "Opnieuw bekijken", "zh": "再看一遍", "zht": "再看一遍", "bg": "Гледай отново", "pl": "Obejrzyj ponownie"},
    "entConsejo": {"es": "Un consejo", "en": "A tip", "fr": "Un conseil", "de": "Ein Tipp", "it": "Un consiglio", "nl": "Een tip", "zh": "小贴士", "zht": "小提醒", "bg": "Един съвет", "pl": "Wskazówka"},
    "entTurno": {"es": "¡Su turno!", "en": "Your turn!", "fr": "À vous !", "de": "Jetzt sind Sie dran!", "it": "Tocca a Lei!", "nl": "Nu u!", "zh": "轮到您了！", "zht": "輪到您了！", "bg": "Ваш ред е!", "pl": "Pora spróbować!"},
    "entTrabaja": {"es": "Trabaja", "en": "Works", "fr": "Travaille", "de": "Trainiert", "it": "Allena", "nl": "Traint", "zh": "锻炼部位", "zht": "鍛鍊部位", "bg": "Натоварва", "pl": "Pracują"},
    "entFin1": {"es": "Yo ya he hecho las mías. Bueno, casi.", "en": "I’ve already done mine. Well, nearly.", "fr": "Moi, j’ai déjà fait les miennes. Enfin, presque.", "de": "Ich habe meine schon gemacht. Na ja, fast.", "it": "Io le mie le ho già fatte. Beh, quasi.", "nl": "Ik heb de mijne al gedaan. Nou ja, bijna.", "zh": "我的已经做完了。嗯，差不多吧。", "zht": "我的已經做完了。嗯，差不多吧。", "bg": "Аз моите вече ги направих. Е, почти.", "pl": "Ja swoje już zrobiłem. No, prawie."},
    "entFin2": {"es": "Hoy lo enseño yo. Mañana me lo enseña usted.", "en": "Today I’m showing you. Tomorrow you can show me.", "fr": "Aujourd’hui, c’est moi qui montre. Demain, ce sera vous.", "de": "Heute zeige ich es. Morgen zeigen Sie es mir.", "it": "Oggi lo mostro io. Domani me lo mostra Lei.", "nl": "Vandaag doe ik het voor. Morgen doet u het voor.", "zh": "今天我示范，明天换您教我。", "zht": "今天我示範，明天換您教我。", "bg": "Днес показвам аз. Утре ще ми покажете вие.", "pl": "Dziś pokazuję ja. Jutro może być odwrotnie."},
    "entFin3": {"es": "Con calma: la isla no se va a ninguna parte.", "en": "Take your time: the island isn’t going anywhere.", "fr": "Prenez votre temps : l’île ne va nulle part.", "de": "Ganz in Ruhe: Die Insel läuft nicht weg.", "it": "Con calma: l’isola non va da nessuna parte.", "nl": "Rustig aan: het eiland loopt niet weg.", "zh": "慢慢来，岛又不会跑。", "zht": "慢慢來，島又不會跑。", "bg": "Спокойно: островът няма да избяга.", "pl": "Spokojnie: wyspa nigdzie nie ucieknie."},
    "entFin4": {"es": "Yo me quedo aquí, por si quiere verlo otra vez.", "en": "I’ll stay right here in case you want to see it again.", "fr": "Je reste ici, au cas où vous voudriez le revoir.", "de": "Ich bleibe hier, falls Sie es noch einmal sehen möchten.", "it": "Io resto qui, nel caso volesse rivederlo.", "nl": "Ik blijf hier, voor als u het nog eens wilt zien.", "zh": "我就在这儿，您想再看一遍随时可以。", "zht": "我就在這兒，您想再看一遍隨時可以。", "bg": "Аз оставам тук, ако искате да го видите пак.", "pl": "Zostaję tutaj, gdyby trzeba było obejrzeć to jeszcze raz."},
    "entFin5": {"es": "A mí también me costó la primera.", "en": "The first one was hard for me too.", "fr": "Moi aussi, la première m’a coûté.", "de": "Die erste ist mir auch schwergefallen.", "it": "Anche a me la prima è costata.", "nl": "De eerste kostte mij ook moeite.", "zh": "第一个，我当初也觉得难。", "zht": "第一個，我當初也覺得難。", "bg": "И на мен първото ми беше трудно.", "pl": "Mnie pierwsze też przyszło z trudem."},
    "entFin6": {"es": "Sin prisa. Yo no tengo otra cosa que hacer.", "en": "No rush. I’ve got nothing else on.", "fr": "Rien ne presse. Je n’ai rien d’autre à faire.", "de": "Keine Eile. Ich habe sonst nichts vor.", "it": "Senza fretta. Io non ho altro da fare.", "nl": "Geen haast. Ik heb toch niets anders te doen.", "zh": "不着急，我也没别的事。", "zht": "不急，我也沒別的事。", "bg": "Без бързане. Аз нямам друга работа.", "pl": "Bez pośpiechu. I tak nie mam nic innego do roboty."}
  };
  var N_FIN = 6;
  var VOZ_LOCALE = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL' };

  var CSS_V = [
'.tgv { --tv-tinta: var(--tinta, #12233A); --tv-tinta2: var(--tinta-2, #51627A); --tv-fondo: var(--fondo, #EEF3F8); --tv-tarjeta: var(--tarjeta, #FFFFFF); --tv-linea: var(--linea, #D5DFEA); --tv-oro: var(--oro, #8A6A12); --tv-orov: var(--oro-vivo, #D4AF37);',
'  --tv-titulo: var(--font-display, "Cormorant Garamond", Georgia, serif); --tv-texto: var(--font-body, "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif);',
'  display: grid; gap: 10px; min-width: 0; font: 400 15px/1.5 var(--tv-texto); color: var(--tv-tinta); -webkit-tap-highlight-color: transparent; }',
'.tgv *, .tgv *::before, .tgv *::after { box-sizing: border-box; }',
'.tgv[data-tema="noche"] { --tv-tinta: var(--tinta, #F0ECE4); --tv-tinta2: var(--tinta-2, #A8B3C4); --tv-fondo: var(--fondo, #0F1117); --tv-tarjeta: var(--tarjeta, #1B2330); --tv-linea: var(--linea, #2D3A4A); --tv-oro: var(--oro, #F5C76B); }',
'.tgv-escena { position: relative; border-radius: 22px; overflow: hidden; background: #8FA8E6; aspect-ratio: 400 / 460; isolation: isolate; touch-action: manipulation; -webkit-user-select: none; user-select: none; }',
'.tgv-escena .tge-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }',
'.tgv-sombra-alta { position: absolute; left: 0; right: 0; top: 0; height: 86px; background: linear-gradient(180deg, rgba(10,16,32,.42), rgba(10,16,32,0)); pointer-events: none; z-index: 2; }',
/* la barra de tramos, como las historias */
'.tgv-barras { position: absolute; z-index: 4; left: 12px; right: 12px; top: 11px; display: flex; gap: 4px; pointer-events: none; }',
'.tgv-barras i { flex: 1 1 0; height: 3.5px; border-radius: 3px; background: rgba(255,255,255,.38); overflow: hidden; }',
'.tgv-barras i.corto { flex: 0.45 1 0; }',
'.tgv-barras b { display: block; height: 100%; width: 0; border-radius: 3px; background: #fff; }',
'.tgv-barras i.hecho b { width: 100%; }',
'.tgv-cab { position: absolute; z-index: 4; left: 12px; right: 12px; top: 24px; display: flex; align-items: center; gap: 8px; pointer-events: none; }',
'.tgv-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; padding: 3px 11px; border-radius: 999px; background: rgba(13,20,36,.55); color: #fff; font-size: 12.5px; font-weight: 600; letter-spacing: .1px; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }',
'.tgv-chip svg { width: 14px; height: 14px; flex: none; }',
'.tgv-hueco { flex: 1; }',
'.tgv-rep { min-width: 28px; justify-content: center; font-variant-numeric: tabular-nums; }',
/* la cabecera y el cierre: el título, en grande */
'.tgv-titulo { position: absolute; z-index: 3; left: 16px; right: 16px; bottom: 16px; display: grid; gap: 4px; pointer-events: none; opacity: 0; transform: translateY(10px); transition: opacity .35s ease, transform .45s cubic-bezier(.2,.9,.3,1); }',
'.tgv-titulo.ve { opacity: 1; transform: none; }',
'.tgv-titulo::before { content: ""; position: absolute; left: -16px; right: -16px; bottom: -16px; top: -46px; background: linear-gradient(180deg, rgba(10,16,32,0), rgba(10,16,32,.74)); z-index: -1; }',
'.tgv-kicker { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #F5C76B; }',
'.tgv-nombre { margin: 0; font: 600 30px/1.02 var(--tv-titulo); color: #fff; text-wrap: balance; overflow-wrap: anywhere; }',
'.tgv-etiquetas { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px; }',
'.tgv-etiquetas span { padding: 2px 9px; border-radius: 999px; border: 1px solid rgba(255,255,255,.5); color: #fff; font-size: 12px; }',
/* los músculos que trabajan: la leyenda, sobre la escena */
'.tgv-musc { position: absolute; z-index: 3; left: 12px; bottom: 12px; display: grid; gap: 4px; justify-items: start; pointer-events: none; transition: opacity .3s ease; max-width: 62%; }',
'.tgv-musc span { display: inline-flex; align-items: center; gap: 6px; padding: 2px 9px 2px 7px; border-radius: 999px; background: rgba(13,20,36,.5); color: #fff; font-size: 11.5px; font-weight: 600; line-height: 1.5; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }',
'.tgv-musc i { width: 9px; height: 9px; border-radius: 50%; flex: none; background: #FFE48A; box-shadow: 0 0 0 2px rgba(255,160,74,.55); }',
'.tgv-musc .sec i { background: #EE5F7E; box-shadow: none; }',
'.tgv-oculto { opacity: 0 !important; }',
/* las zonas de toque: atrás, pausa, adelante */
'.tgv-zona { position: absolute; z-index: 1; top: 0; bottom: 0; border: 0; padding: 0; margin: 0; background: transparent; cursor: pointer; }',
'.tgv-zona.izq { left: 0; width: 28%; } .tgv-zona.cen { left: 28%; width: 44%; } .tgv-zona.der { right: 0; width: 28%; }',
'.tgv-zona:focus-visible { outline: 3px solid #F5C76B; outline-offset: -6px; border-radius: 22px; }',
/* el botón grande del centro: al empezar, en pausa y al acabar */
'.tgv-gran { position: absolute; z-index: 5; left: 50%; top: 50%; width: 76px; height: 76px; margin: -38px 0 0 -38px; border-radius: 50%; border: 0; background: linear-gradient(180deg, #f6d268, #D4AF37); color: #171106; display: grid; place-items: center; box-shadow: 0 10px 28px rgba(10,16,32,.4); cursor: pointer; transition: transform .2s ease, opacity .2s ease; }',
'.tgv-gran svg { width: 34px; height: 34px; }',
'.tgv-gran:active { transform: scale(.94); }',
'.tgv-gran[hidden] { display: none; }',
/* el corte entre dos planos: una cortinilla dorada que cruza */
'.tgv-corte { position: absolute; z-index: 6; inset: -4px -30%; background: linear-gradient(100deg, rgba(212,175,55,0) 0%, #D4AF37 22%, #F5C76B 50%, #D4AF37 78%, rgba(212,175,55,0) 100%); transform: translateX(-120%) skewX(-12deg); pointer-events: none; will-change: transform; }',
/* debajo: el paso y los mandos */
'.tgv-pie { display: grid; gap: 10px; min-width: 0; }',
'.tgv-paso { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; align-items: start; min-height: 96px; padding: 12px 14px; border-radius: 18px; background: var(--tv-fondo); }',
'.tgv-paso-n { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(180deg, #f6d268, #D4AF37); color: #171106; font-weight: 700; font-size: 15px; font-variant-numeric: tabular-nums; }',
'.tgv-paso-n svg { width: 17px; height: 17px; }',
'.tgv-paso-t { margin: 0; font-size: 15.5px; line-height: 1.45; color: var(--tv-tinta); overflow-wrap: anywhere; }',
'.tgv-paso-t b { display: block; font: 600 22px/1.1 var(--tv-titulo); margin-bottom: 2px; }',
'.tgv-paso-t .tgv-pal { opacity: 0; transition: opacity .22s ease; }',
'.tgv-paso-t .tgv-pal.ve { opacity: 1; }',
'.tgv-paso-t em { font-style: italic; color: var(--tv-oro); }',
'.tgv-mandos { display: flex; align-items: center; gap: 7px; min-width: 0; }',
'.tgv-btn { position: relative; flex: 0 1 46px; min-width: 34px; width: 46px; height: 46px; border-radius: 14px; border: 1.5px solid var(--tv-linea); background: var(--tv-tarjeta); color: var(--tv-tinta); display: grid; place-items: center; padding: 0; cursor: pointer; font: 700 13.5px/1 var(--tv-texto); transition: background .15s ease, border-color .15s ease, color .15s ease, transform .12s ease; }',
'.tgv-btn svg { width: 21px; height: 21px; }',
'.tgv-btn:active { transform: scale(.94); }',
'.tgv-btn:focus-visible, .tgv-gran:focus-visible { outline: 3px solid var(--tv-orov); outline-offset: 2px; }',
'.tgv-btn[aria-pressed="true"] { background: var(--tv-tinta); border-color: var(--tv-tinta); color: var(--tv-fondo); }',
'.tgv-btn.play { flex-basis: 58px; min-width: 42px; width: 58px; border: 0; background: linear-gradient(180deg, #f6d268, #D4AF37); color: #171106; }',
'.tgv-btn.ancho { width: auto; padding: 0 13px; gap: 7px; display: inline-flex; align-items: center; }',
'.tgv-btn:disabled { opacity: .38; cursor: default; }',
'.tgv-sep { flex: 1 1 0; min-width: 0; }',
'.tgv .tgv-solo-lector { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }',
'@media (prefers-reduced-motion: reduce) { .tgv-titulo, .tgv-musc, .tgv-paso-t .tgv-pal, .tgv-btn, .tgv-gran { transition: none; } }'
  ].join('\n');
  function ponerEstilosV() {
    if (document.getElementById('tgv-estilos')) return;
    var s = document.createElement('style'); s.id = 'tgv-estilos'; s.textContent = CSS_V;
    document.head.appendChild(s);
  }
  var ICO = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.4" height="14" rx="1.3"/><rect x="13.6" y="5" width="4.4" height="14" rx="1.3"/></svg>',
    ant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>',
    sig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg>',
    girar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.4 3.6v4.6h-4.6"/></svg>',
    voz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/></svg>',
    otra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M3.6 3.6v4.6h4.6"/></svg>',
    bombilla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
    mano: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v7M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7 6 6 0 0 1-5-2.6L4 14a1.5 1.5 0 0 1 2.4-1.8L7 13"/></svg>'
  };
  /* de qué habla un paso (por sus palabras, en castellano): dónde se pone el anillo */
  var NOMBRA = [
    [/puntas? de(l| los)? pies?|\bpies?\b|pisa|planta/, ['pi', 'pd']], [/tal[oó]n(es)?/, ['tli', 'tld']], [/rodillas?/, ['ri', 'rd']], [/cadera/, ['cadera']],
    [/gl[uú]teos?/, ['gluteos']], [/abdomen|ombligo/, ['abdomen']], [/zona lumbar|espalda|columna|tronco/, ['espalda']], [/\bpecho\b/, ['pecho']],
    [/om[oó]platos?|esc[aá]pulas?|hombros?/, ['hi', 'hd']], [/codos?/, ['ci', 'cd']], [/mu[ñn]ecas?|manos?|palmas?|agarr|dedos/, ['mi', 'md']], [/cabeza|cuello|barbilla/, ['cab']]
  ];
  function nombrados(texto) {
    var t = String(texto || '').toLowerCase(), halla = [];
    NOMBRA.forEach(function (q) { var m = q[0].exec(t); if (m) halla.push([m.index, q[1]]); });
    halla.sort(function (a, b) { return a[0] - b[0]; });
    var r = [];
    halla.slice(0, 2).forEach(function (h) { r = r.concat(h[1]); });
    return r;
  }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* datos: { id, nombre, pasos: [texto…], pasosEs: [texto en castellano…] (para los anillos), prim: [grupos], sec: [grupos],
              nombres: { grupo: su nombre }, etiquetas: [texto…], entorno: 'gimnasio' | 'fuera' | 'calistenia', nivel: 1-3 }
     opc:   { idioma, tema: 'dia' | 'noche', tx: función que da un texto de ENT_UI (si la app tiene los suyos), alAcabar, auto } */
  function Reproductor(caja, datos, opc) {
    opc = opc || {};
    var yo = this, co = COREO[datos.id];
    this.co = co; this.datos = datos; this.opc = opc; this.idioma = opc.idioma || 'es';
    ponerEstilosV();
    var T = function (k, v) {
      var s = (opc.tx && opc.tx(k)) || (ENT_UI[k] && (ENT_UI[k][yo.idioma] || ENT_UI[k].en || ENT_UI[k].es)) || '';
      if (v) for (var n in v) s = s.split('{' + n + '}').join(v[n]);
      return s;
    };
    this.T = T;
    var raiz = el('div', 'tgv'); raiz.setAttribute('data-tema', opc.tema === 'noche' ? 'noche' : 'dia');
    this.raiz = raiz;
    var escena = el('div', 'tgv-escena'); escena.setAttribute('role', 'group'); escena.setAttribute('aria-label', T('entVideo') + ': ' + datos.nombre);
    raiz.appendChild(escena);
    this.esc = new Escenario(escena);
    this.esc.ambiente(co.ambiente || datos.entorno || 'fuera', opc.tema);
    this.dir = new Director(this.esc);
    this.dir.cargar(co);
    this.esc.fig.musculos(datos.prim, datos.sec);
    escena.appendChild(el('div', 'tgv-sombra-alta'));
    /* los tramos: la cabecera, un tramo por paso y el cierre */
    var pasos = datos.pasos || [], acc = co.pasos || [];
    this.tramos = [{ tipo: 'cabecera', dur: 3.1 }];
    pasos.forEach(function (tx, i) {
      var a = acc[i] != null ? acc[i] : (i === 0 ? (co.inicio || 'a') : 'rep');
      yo.tramos.push({ tipo: 'paso', i: i, texto: tx, es: (datos.pasosEs || pasos)[i], accion: a, dur: Math.max(4.4, 1.9 + tx.length * (/^zh/.test(yo.idioma) ? 0.16 : 0.058)) });
    });
    this.tramos.push({ tipo: 'cierre', dur: 4.2 });
    this.barras = el('div', 'tgv-barras');
    this.tramos.forEach(function (t) { var i = el('i', t.tipo === 'paso' ? '' : 'corto'); i.appendChild(el('b')); yo.barras.appendChild(i); t.barra = i; });
    escena.appendChild(this.barras);
    var cab = el('div', 'tgv-cab');
    this.chipPaso = el('span', 'tgv-chip'); cab.appendChild(this.chipPaso);
    cab.appendChild(el('span', 'tgv-hueco'));
    this.chipRep = el('span', 'tgv-chip tgv-rep tgv-oculto', '0'); this.chipRep.setAttribute('aria-hidden', 'true'); cab.appendChild(this.chipRep);
    escena.appendChild(cab);
    /* el título (cabecera y cierre) */
    var tit = el('div', 'tgv-titulo'); this.titulo = tit;
    this.kicker = el('span', 'tgv-kicker', T('entCon')); tit.appendChild(this.kicker);
    this.nombre = el('p', 'tgv-nombre', datos.nombre); tit.appendChild(this.nombre);
    var etq = el('div', 'tgv-etiquetas'); (datos.etiquetas || []).forEach(function (e) { etq.appendChild(el('span', '', e)); }); tit.appendChild(etq);
    escena.appendChild(tit);
    /* la leyenda de músculos */
    var mus = el('div', 'tgv-musc tgv-oculto'); this.musc = mus;
    var nomb = datos.nombres || {};
    (datos.prim || []).forEach(function (g) { var s = el('span'); s.appendChild(el('i')); s.appendChild(document.createTextNode(nomb[g] || g)); mus.appendChild(s); });
    var secs = datos.sec || [], cabenSec = Math.max(1, 4 - (datos.prim || []).length);
    if (secs.length > cabenSec) cabenSec = Math.max(1, cabenSec - 1);
    secs.slice(0, cabenSec).forEach(function (g) { var s = el('span', 'sec'); s.appendChild(el('i')); s.appendChild(document.createTextNode(nomb[g] || g)); mus.appendChild(s); });
    if (secs.length > cabenSec) { var mas2 = el('span', 'sec'); mas2.appendChild(el('i')); mas2.appendChild(document.createTextNode('+' + (secs.length - cabenSec))); mas2.title = secs.slice(cabenSec).map(function (g) { return nomb[g] || g; }).join(', '); mus.appendChild(mas2); }
    escena.appendChild(mus);
    /* las zonas de toque */
    var zona = function (cls, rot, f) { var b = el('button', 'tgv-zona ' + cls); b.type = 'button'; b.setAttribute('aria-label', rot); b.addEventListener('click', f); escena.appendChild(b); return b; };
    zona('izq', T('entAnt'), function () { yo.irA(yo.n - 1); });
    this.zCen = zona('cen', T('entPausa'), function () { yo.alternar(); });
    zona('der', T('entSig'), function () { yo.irA(yo.n + 1); });
    this.gran = el('button', 'tgv-gran'); this.gran.type = 'button'; this.gran.innerHTML = ICO.play; this.gran.setAttribute('aria-label', T('entPlay'));
    this.gran.addEventListener('click', function () { if (yo.fin) yo.irA(0); yo.reproducir(); });
    escena.appendChild(this.gran);
    this.corte = el('div', 'tgv-corte'); escena.appendChild(this.corte);
    /* debajo: el paso y los mandos */
    var pie = el('div', 'tgv-pie');
    var paso = el('div', 'tgv-paso'); paso.setAttribute('aria-live', 'polite');
    this.pasoN = el('span', 'tgv-paso-n'); this.pasoT = el('p', 'tgv-paso-t');
    this.pasoL = el('span', 'tgv-solo-lector');       /* el paso entero, de una vez, para los lectores de pantalla */
    paso.appendChild(this.pasoN); paso.appendChild(this.pasoT); paso.appendChild(this.pasoL);
    this.pasoT.setAttribute('aria-hidden', 'true');
    pie.appendChild(paso);
    var mandos = el('div', 'tgv-mandos');
    var boton = function (cls, ico, rot, f, txt) {
      var b = el('button', 'tgv-btn ' + cls); b.type = 'button'; b.innerHTML = ico || ''; if (txt) b.appendChild(el('span', '', txt));
      b.setAttribute('aria-label', rot); b.title = rot; b.addEventListener('click', f); mandos.appendChild(b); return b;
    };
    this.bAnt = boton('', ICO.ant, T('entAnt'), function () { yo.irA(yo.n - 1); });
    this.bPlay = boton('play', ICO.play, T('entPlay'), function () { if (yo.fin) yo.irA(0); yo.alternar(); });
    this.bSig = boton('', ICO.sig, T('entSig'), function () { yo.irA(yo.n + 1); });
    mandos.appendChild(el('span', 'tgv-sep'));
    this.bLento = boton('', '', T('entLento'), function () { yo.lento = !yo.lento; yo.dir.vel = yo.lento ? 0.45 : 1; yo.bLento.setAttribute('aria-pressed', yo.lento ? 'true' : 'false'); }, '½×');
    this.bLento.setAttribute('aria-pressed', 'false');
    this.bGirar = boton('', ICO.girar, T('entGirar'), function () { yo.dir.girar(); });
    if (this.dir.vistas.length < 2) this.bGirar.disabled = true;
    this.bVoz = boton('', ICO.voz, T('entVozOn'), function () { yo.voz(!yo.conVoz); });
    this.bVoz.setAttribute('aria-pressed', 'false');
    if (!this.hayVoz()) this.bVoz.hidden = true;
    pie.appendChild(mandos);
    raiz.appendChild(pie);
    caja.appendChild(raiz);

    this.cajaPaso = paso;
    this.n = 0; this.tt = 0; this.suena = false; this.fin = false; this.lento = false; this.conVoz = false; this.antes = 0; this.raf = 0;
    this.dir.alRepetir = function (r) { yo.chipRep.textContent = '\u00d7 ' + r; yo.chipRep.classList.toggle('tgv-oculto', !yo.repVisible); };
    this.dir.aBusto(true);
    this.entrar(0, true);
    this.dir.cuadro(0.016, true);
    this.quieto = quieto();
    this._cuadro = function (ahora) { yo.cuadro(ahora); };
    /* solo corre mientras se ve */
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(function (es) { yo.visible = es[0].isIntersecting; if (!yo.visible && yo.suena) yo.pausar(); });
      this.io.observe(escena);
    }
    this.visible = true;
    this.medir();
    this._medir = function () { yo.medir(); };
    window.addEventListener('resize', this._medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { yo.anchoMedido = 0; yo.medir(); });
    if (opc.auto) this.reproducir();
  }
  /* mide el paso más largo y deja ese alto fijo (si aún no se ve, lo intenta al reproducir) */
  Reproductor.prototype.medir = function () {
    var c = this.cajaPaso, t = this.pasoT, ancho = t.clientWidth, max = 0, yo = this;
    if (!ancho) return;
    if (this.anchoMedido === ancho) return;
    var p = document.createElement('p'); p.className = 'tgv-paso-t'; p.style.cssText = 'position:absolute;visibility:hidden;left:0;top:0;width:' + ancho + 'px';
    c.style.position = 'relative'; c.appendChild(p);
    this.tramos.forEach(function (q) { if (q.tipo !== 'paso') return; p.textContent = ''; if (q.accion === 'nota') p.appendChild(el('b', '', yo.T('entConsejo'))); p.appendChild(document.createTextNode(q.texto)); max = Math.max(max, p.offsetHeight); });
    c.removeChild(p);
    if (max) { c.style.minHeight = Math.ceil(max + 26) + 'px'; this.anchoMedido = ancho; }
  };
  Reproductor.prototype.hayVoz = function () {
    try { if (window.TG_VOZ) return window.TG_VOZ.hayVoces() && !!window.TG_VOZ.vozLocal(this.idioma); return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'; } catch (e) { return false; }
  };
  Reproductor.prototype.reproducir = function () {
    if (this.suena) return;
    if (this.fin) { this.fin = false; this.entrar(0); }
    this.suena = true; this.gran.hidden = true;
    this.medir();
    this.bPlay.innerHTML = ICO.pausa; this.bPlay.setAttribute('aria-label', this.T('entPausa')); this.zCen.setAttribute('aria-label', this.T('entPausa'));
    this.antes = performance.now();
    if (this.conVoz && this.vozPendiente) this.decir(this.vozPendiente);
    this.raf = requestAnimationFrame(this._cuadro);
  };
  Reproductor.prototype.pausar = function () {
    if (!this.suena) return;
    this.suena = false; cancelAnimationFrame(this.raf);
    this.gran.hidden = false; this.gran.innerHTML = this.fin ? ICO.otra : ICO.play; this.gran.setAttribute('aria-label', this.T(this.fin ? 'entOtraVez' : 'entPlay'));
    this.bPlay.innerHTML = ICO.play; this.bPlay.setAttribute('aria-label', this.T('entPlay')); this.zCen.setAttribute('aria-label', this.T('entPlay'));
    this.callar();
  };
  Reproductor.prototype.alternar = function () { if (this.suena) this.pausar(); else this.reproducir(); };
  /* un cuadro */
  Reproductor.prototype.cuadro = function (ahora) {
    if (!this.suena) return;
    /* si el móvil va justo, se saltan cuadros antes que ir a cámara lenta (hasta 10 por segundo) */
    var dt = Math.min(0.1, Math.max(0, (ahora - this.antes) / 1000)); this.antes = ahora;
    this.avanzar(dt);
    if (this.suena) this.raf = requestAnimationFrame(this._cuadro);
  };
  /* avanza el tiempo (lo usa también la grabación, cuadro a cuadro) */
  Reproductor.prototype.avanzar = function (dt) {
    var t = this.tramos[this.n];
    this.tt += dt;
    if (this.pendiente) { this.pendT -= dt; if (this.pendT <= 0) { var g0 = this.pendiente; this.pendiente = null; g0(); } }
    if (this.corteT != null) {
      this.corteT += dt;
      var uc = this.corteT / 0.52;
      if (uc >= 1) { this.corteT = null; this.corte.style.transform = ''; }
      else { uc = uc < 0.5 ? 2 * uc * uc : 1 - 2 * (1 - uc) * (1 - uc); this.corte.style.transform = 'translateX(' + (-120 + 240 * uc).toFixed(1) + '%) skewX(-12deg)'; }
    }
    /* las palabras del paso van saliendo */
    if (this.palabras && this.palabras.length) {
      var hasta = Math.floor(this.tt / 0.055);
      while (this.palN < Math.min(hasta, this.palabras.length)) this.palabras[this.palN++].classList.add('ve');
    }
    if (this.conVoz && this.hablando && ((!this.vozArranco && this.tt > 2.5) || this.tt > t.dur + 22)) { this.hablando = false; this.esc.cab.hablar(0); }
    var esperaVoz = this.conVoz && this.hablando;
    var f = entre(this.tt / t.dur, 0, 1);
    t.barra.firstChild.style.width = (f * 100).toFixed(1) + '%';
    if (this.tt >= t.dur && !esperaVoz) {
      if (this.n >= this.tramos.length - 1) { this.acabar(); }
      else this.entrar(this.n + 1);
    }
    /* la cara: según el esfuerzo */
    var d = this.dir, cab = this.esc.cab, nivel = this.datos.nivel || 1;
    if (!d.busto) {
      var emo = d.esf > 0.55 ? (nivel >= 2 ? 'esfuerzo' : 'concentra') : (d.modo === 'rep' ? 'concentra' : 'atento');
      if (d.modo === 'rep' && d.tramo && d.tramo.de === d.tramo.a && d.esf < 0.3) emo = 'contento';
      if (cab.emo !== emo) cab.emocion(emo);
      cab.sudar(nivel >= 3 && d.modo === 'rep');
    }
    d.cuadro(dt, false);
  };
  Reproductor.prototype.acabar = function () {
    this.fin = true; this.tramos[this.n].barra.classList.add('hecho');
    this.pausar();
    if (this.opc.alAcabar) this.opc.alAcabar();
  };
  Reproductor.prototype.irA = function (n) {
    n = entre(n, 0, this.tramos.length - 1);
    this.fin = false;
    this.entrar(n);
    if (!this.suena) { this.dir.cuadro(0.016, true); this.gran.innerHTML = ICO.play; }
  };
  /* el corte de plano: la cortinilla cruza y, cuando tapa, se cambia */
  Reproductor.prototype.cortar = function (f) {
    var c = this.corte, yo = this;
    if (this.quieto || !this.suena) { f(); return; }
    this.corteT = 0;
    this.pendiente = f; this.pendT = 0.25;       /* se cambia de plano cuando la cortinilla tapa (lo cuenta avanzar) */
  };
  /* entra en un tramo */
  Reproductor.prototype.entrar = function (n, sinCorte) {
    var yo = this, T = this.T, d = this.dir, cab = this.esc.cab, t = this.tramos[n], antes = this.tramos[this.n];
    if (this.pendiente) { var g = this.pendiente; this.pendiente = null; g(); }
    if (!this.suena) { this.corteT = null; this.corte.style.transform = ''; }
    this.n = n; this.tt = 0;
    this.tramos.forEach(function (q, i) { q.barra.classList.toggle('hecho', i < n); q.barra.firstChild.style.width = i < n ? '100%' : '0%'; });
    this.bAnt.disabled = n === 0; this.bSig.disabled = n === this.tramos.length - 1;
    var N = this.tramos.length - 2;
    this.callar();
    var escribir = function (num, ico, titulo, texto, aparte) {
      yo.pasoN.textContent = ''; if (ico) yo.pasoN.innerHTML = ico; else yo.pasoN.textContent = num;
      yo.pasoT.textContent = ''; yo.palabras = []; yo.palN = 0;
      if (titulo) yo.pasoT.appendChild(el('b', '', titulo));
      var cont = aparte ? el('em') : yo.pasoT;
      /* palabra a palabra (en chino, letra a letra) */
      var trozos = /^zh/.test(yo.idioma) ? texto.split('') : texto.split(/(\s+)/);
      trozos.forEach(function (w) { if (/^\s+$/.test(w)) cont.appendChild(document.createTextNode(w)); else if (w) { var s = el('span', 'tgv-pal', w); cont.appendChild(s); yo.palabras.push(s); } });
      if (aparte) yo.pasoT.appendChild(cont);
      yo.pasoL.textContent = (titulo ? titulo + '. ' : '') + texto;
      if (yo.quieto) yo.palabras.forEach(function (s) { s.classList.add('ve'); });
    };
    var plano = function (busto, f) { if (d.busto !== busto && !sinCorte) yo.cortar(function () { d.aBusto(busto); f(); }); else { d.aBusto(busto); f(); } };
    this.titulo.classList.toggle('ve', t.tipo !== 'paso' || false);
    var conMusc = t.tipo === 'paso' && t.accion !== 'nota';
    if (!conMusc) this.musc.classList.add('tgv-oculto');
    this.chipRep.classList.add('tgv-oculto'); this.repVisible = false;
    if (t.tipo === 'cabecera') {
      this.chipPaso.textContent = T('entVideo');
      this.kicker.textContent = T('entCon'); this.nombre.textContent = this.datos.nombre;
      this.titulo.classList.add('ve');
      escribir('', ICO.mano, '', this.datos.nombre);
      this.pasoT.textContent = ''; this.pasoT.appendChild(el('b', '', this.datos.nombre)); this.palabras = [];
      var et = (this.datos.etiquetas || []).join(' · '); if (et) this.pasoT.appendChild(document.createTextNode(et));
      plano(true, function () { d.aPostura('saluda1', 0); d.aSecuencia([['saluda2', 0.26], ['saluda1', 0.26], ['saluda2', 0.26], ['saluda1', 0.26], ['saluda2', 0.26], ['saluda1', 0.26], ['listo', 0.6]], 'saluda1'); cab.emocion('ilusion'); d.marcar([]); });
      this.decir(this.datos.nombre);
    } else if (t.tipo === 'cierre') {
      this.chipPaso.textContent = T('entVideo');
      var fr = T('entFin' + (1 + (this.hash() % N_FIN)));
      this.kicker.textContent = this.datos.nombre; this.nombre.textContent = T('entTurno');
      escribir('', ICO.mano, T('entTurno'), fr, true);
      plano(true, function () { d.aPostura('pulgar', 0.5); cab.emocion('guino'); d.marcar([]); });
      this.decir(T('entTurno') + ' ' + fr);
    } else {
      var a = t.accion;
      this.chipPaso.textContent = T('entPaso', { n: t.i + 1, N: N });
      this.titulo.classList.remove('ve');
      if (a === 'nota') {
        escribir('', ICO.bombilla, T('entConsejo'), t.texto);
        plano(true, function () { d.aPostura('consejo', 0.45); cab.emocion('atento'); cab.hablar(Math.min(t.dur - 0.6, 3.2)); d.marcar([]); });
      } else {
        escribir(String(t.i + 1), '', '', t.texto);
        plano(false, function () {
          var desdeBusto = antes && (antes.tipo !== 'paso' || antes.accion === 'nota');
          if (a === 'rep' || (a && a.rep != null)) {
            if (desdeBusto) { d.aPostura(d.inicio, 0); d.cuadro(0.001, true); }
            if (d.modo !== 'rep') { d.aRep(desdeBusto ? 0 : 0.6); if (a.rep != null) d.tau = a.rep; }
            yo.repVisible = true; yo.chipRep.classList.toggle('tgv-oculto', !d.reps);
          } else if (a && a.sec) {
            if (desdeBusto || !d.E) { d.aPostura(a.desde || d.inicio, 0); d.cuadro(0.001, true); }
            d.aSecuencia(a.sec, a.desde);
          } else d.aPostura(typeof a === 'string' ? a : d.inicio, desdeBusto ? 0 : 0.7);
          d.marcar(nombrados(t.es));
          yo.musc.classList.remove('tgv-oculto');
          cab.hablar(Math.min(1.6, t.dur * 0.3));
        });
      }
      this.decir(t.texto);
    }
  };
  /* un número fijo por ejercicio, para elegir su frase de cierre */
  Reproductor.prototype.hash = function () { var s = this.datos.id || '', h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  /* ── la voz: la del móvil (las voces instaladas), como la audioguía ── */
  Reproductor.prototype.voz = function (si) {
    this.conVoz = !!si && this.hayVoz();
    this.bVoz.setAttribute('aria-pressed', this.conVoz ? 'true' : 'false');
    this.bVoz.setAttribute('aria-label', this.T(this.conVoz ? 'entVozOff' : 'entVozOn')); this.bVoz.title = this.bVoz.getAttribute('aria-label');
    if (!this.conVoz) this.callar(); else if (this.vozPendiente && this.suena) this.decir(this.vozPendiente);
  };
  Reproductor.prototype.decir = function (texto) {
    var yo = this;
    this.vozPendiente = texto;
    if (!this.conVoz || !this.suena) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(texto), v = window.TG_VOZ ? window.TG_VOZ.vozLocal(this.idioma) : null;
      u.lang = (window.TG_VOZ && window.TG_VOZ.locale(this.idioma)) || VOZ_LOCALE[this.idioma] || 'es-ES';
      if (v) u.voice = v;
      u.rate = 0.98;
      this.hablando = true; this.vozArranco = false; this.esc.cab.hablar(60);
      var fin = function () { if (yo.uVoz === u) { yo.hablando = false; yo.esc.cab.hablar(0); } };
      u.onstart = function () { if (yo.uVoz === u) yo.vozArranco = true; };
      u.onend = fin; u.onerror = fin; this.uVoz = u;
      window.speechSynthesis.speak(u);
    } catch (e) { this.hablando = false; }
  };
  Reproductor.prototype.callar = function () {
    this.hablando = false; this.uVoz = null;
    try { if (this.conVoz && window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    this.esc.cab.hablar(0);
  };
  Reproductor.prototype.tema = function (t) { this.raiz.setAttribute('data-tema', t === 'noche' ? 'noche' : 'dia'); this.esc.ambiente(this.esc.nombreAmb, t); if (!this.suena) this.dir.cuadro(0.016, true); };
  Reproductor.prototype.quitar = function () {
    this.pausar(); this.callar();
    window.removeEventListener('resize', this._medir);
    if (this.io) this.io.disconnect();
    if (this.raiz.parentNode) this.raiz.parentNode.removeChild(this.raiz);
  };
