#!/usr/bin/env node
/* auditar_registro.js — el trato de usted en toda la app.
 *
 * Jerome, 21 de octubre de 2026: «Usted en toda la app. Son usuarios no
 * amigos». En los diez idiomas: usted, vous, Sie, u, вие, 您... (el ingles no
 * distingue). Este control lee TODO lo que la gente ve en cada idioma y busca
 * las marcas del tuteo de ese idioma:
 *
 *   · la app viva: UI_TX y LANGS (index.html, servido en el puerto dado);
 *   · los diccionarios {es:'…', en:'…'} sueltos de index.html (mensajes, el
 *     tour…) y places[] (la ficha de cada lugar, en
 *     castellano), y la ficha en los demas idiomas (idiomas/<l>.json);
 *   · la politica (idiomas/privacidad/), la pagina de borrar la cuenta
 *     (idiomas/borrar-cuenta/), la ficha de la App Store
 *     (datos/app-store/ficha.json), las frases de cada manana (frases.json),
 *     el asistente (faq/<l>.json, con las respuestas de la app), el panel
 *     del cielo (modulos/cielo.js, y las curiosidades de las constelaciones,
 *     un fichero por idioma: idiomas/cielo/<l>.json), la pantalla del perfil
 *     (modulos/perfil.js), el panel de emergencias (modulos/emergencias.js,
 *     22 de octubre de 2026) y las etiquetas de las fichas (tags[] de
 *     index.html e idiomas/etiquetas/<l>.json).
 *
 * Los idiomas de HECHOS ya estan pasados a usted: cualquier marca es un
 * fallo y se lista. Los demas se cuentan como pendientes (no fallan), para
 * ver cuanto queda. Lo que parece tuteo y no lo es (un nombre propio, la voz
 * de quien usa la app: «Llévame», «Recordármelo») va en EXENTOS, con su
 * motivo.
 *
 *     node tools/auditar_registro.js 8766              (auditar.sh)
 *     node tools/auditar_registro.js 8766 --lista es f.json   los textos con tuteo de un idioma
 *     node tools/auditar_registro.js 8766 --todos de f.json   todos los textos de un idioma, para
 *         repasar a mano lo que las marcas no ven (el imperativo sin pronombre)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.join(__dirname, '..');
const PUERTO = Number(process.argv[2] || 8766);
const LISTA = process.argv.indexOf('--lista') > 0 ? process.argv[process.argv.indexOf('--lista') + 1] : null;
const LISTA_F = LISTA ? process.argv[process.argv.indexOf('--lista') + 2] : null;
const TODOS = process.argv.indexOf('--todos') > 0 ? process.argv[process.argv.indexOf('--todos') + 1] : null;
const TODOS_F = TODOS ? process.argv[process.argv.indexOf('--todos') + 2] : null;
const IDI = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];

/* Los idiomas ya pasados a usted. Cada parte del cambio anade el suyo. */
const HECHOS = ['es', 'zh', 'zht', 'de', 'nl', 'fr', 'it', 'bg', 'pl'];

/* ── las marcas del tuteo, idioma a idioma ─────────────────────────────── */
const L_ = 'A-Za-zÀ-ÖØ-öø-ɏЀ-ӿ';
const pal = (...ps) => new RegExp('(?<![' + L_ + '])(?:' + ps.join('|') + ')(?![' + L_ + '])', 'u');
const palI = (...ps) => new RegExp('(?<![' + L_ + '])(?:' + ps.join('|') + ')(?![' + L_ + '])', 'iu');
/* al principio de una frase: el imperativo de tu (Toca, Elige…) */
const inicio = (...ps) => new RegExp('(?:^|[.!?¿¡:;—–(«“"]\\s*|\\n\\s*)(?:[\\p{Extended_Pictographic}\\uFE0F\\u200D\\s]*\\d+\\.\\s*)?(?:' + ps.join('|') + ')(?![' + L_ + '])', 'u');
/* en medio de la frase, tras coma, dos puntos, raya o «y/o», en minuscula:
   «En Safari, toca el botón… y elige…», «Mar fuerte — evita el baño» */
const tras = (...ps) => new RegExp('(?:[,:;—–]\\s*|\\s[yo]\\s+)(?:' + ps.join('|') + ')(?![' + L_ + '])', 'u');
/* tras un emoji: «😕 Prueba con otra zona», «🅰️ Toca un marcador» */
const trasEmoji = (...ps) => new RegExp('\\p{Extended_Pictographic}\\uFE0F?\\s+(?:' + ps.join('|') + ')(?![' + L_ + '])', 'u');

const MARCAS = {
  es: [
    palI('tú', 'tu', 'tus', 'te', 'ti', 'contigo', 'tuy[oa]s?'),
    /* la segunda persona: las formas que salen en los textos de la app */
    palI('tienes', 'estás', 'puedes', 'verás', 'vas', 'has', 'quieras', 'quieres', 'ves', 'necesitas', 'aceptas', 'vienes', 'haces', 'tengas', 'cuidas',
      'mueves', 'eres', 'usas', 'abres', 'acerques', 'puedas', 'prefieres', 'llegarás', 'veas', 'mires', 'salgas', 'llegas', 'pierdes', 'encuentras', 'creas',
      'piensas', 'busques', 'bajes', 'añades', 'guardas', 'escribes', 'duermas', 'elijas', 'midas', 'corras', 'digas', 'compares', 'compites', 'caminas',
      'aparcas', 'abrigas', 'cambias', 'conduces', 'tratarías', 'dejas', 'pierdas', 'estés', 'agradecerás', 'hagas', 'marques', 'llevas', 'exploras',
      'pidas', 'embarcas', 'alquilas', 'rechazas', 'importaras', 'importas', 'calculas', 'validas', 'brilles', 'sigas', 'pides', 'abras', 'cuentes',
      'produzcas', 'nades', 'subes', 'pones', 'vayas', 'conocías', 'fíes', 'mereces', 'terminas', 'registras', 'recuperas', 'buscas', 'descargas', 'eliges',
      'confirmes', 'juzgues', 'miras', 'vengas', 'coincides', 'arrepientes', 'adentres', 'exijas', 'alejes', 'necesites', 'merezcas', 'agradeces',
      'dejes', 'tocas', 'madrugas', 'apures', 'apuntas', 'dices', 'crees', 'ahorras', 'compartes', 'pulsas', 'acabas', 'oyes', 'deslumbras',
      'sigues', 'aparques', 'inicias', 'hayas', 'podrás', 'dudes', 'centras', 'definas', 'sabes', 'sientes', 'quitas', 'eres',
      'tendrás', 'harás', 'sabrás', 'querrás', 'saldrás', 'vendrás', 'pondrás', 'dirás', 'irás', 'estarás', 'serás', 'encontrarás', 'llegues', 'tomes', 'uses',
      'entres', 'pases', 'pruebes', 'olvides', 'subas', 'quedas', 'entras', 'vuelves', 'vuelvas', 'sueles', 'prefieras', 'quieras',
      /* las del 22 de octubre (las curiosidades del cielo): «¿Sabías que…?», «mientras lees» */
      'sabías', 'lees'),
    /* el imperativo de tu con pronombre pegado. El de usted lleva las mismas
       letras cambiadas de sitio (inténtalo / inténtelo, ábrelo / ábralo), asi
       que no hay regla que los separe: van las formas de tu que han salido en
       los textos de la app (y las de siempre). Las reflexivas si tienen regla:
       la de tu acaba en -te (muévete, quédate) y la de usted en -se. */
    palI('inténtalo', 'ábrelo', 'ábrela', 'tócalo', 'tócala', 'búscalo', 'búscala', 'confírmalo', 'confírmalos', 'confírmala', 'llévalo', 'llévala',
      'encuéntralo', 'encuéntrala', 'cámbialo', 'agradécelo', 'acéptalo', 'aprovéchalo', 'léelo', 'léela', 'pídelo', 'pídela', 'acércalo', 'dátelo', 'revísalo',
      'guárdalo', 'guárdala', 'compártelo', 'compártela', 'descárgalo', 'descárgala', 'contrátalo', 'añádela', 'añádelo', 'súbelos', 'súbelo', 'pídemelo',
      'dímelo', 'escríbele', 'escríbenos', 'escríbeme', 'cuéntale', 'cuéntame', 'pregúntame', 'dale', 'dile', 'dime', 'date', 'hazte', 'ponte', 'vete', 'hazlo',
      'hazla', 'ponlo', 'déjalo', 'déjala', 'míralo', 'mírala', 'pruébalo', 'pruébala', 'úsalo', 'úsala', 'cómpralo', 'resérvalo', 'apúntalo', 'cámbiala',
      'quítalo', 'quítala', 'sígueme', 'llámame', 'llámalo', 'avísale', 'recuérdalo', 'olvídalo', 'disfrútalo', 'escúchalo', 'mándalo', 'tráelo', 'enséñamelo'),
    /(?<![A-Za-zÀ-ÖØ-öø-ɏ])[A-Za-zñ]*[áéíóú][a-zñ]*[ae]te(?:lo|la|los|las)?(?![A-Za-zÀ-ÖØ-öø-ɏ])|(?<![A-Za-zÀ-ÖØ-öø-ɏ])[A-Za-zñ]*(?:ándote|iéndote|éndote)(?![A-Za-zÀ-ÖØ-öø-ɏ])/u,
    /* al principio de frase, solo los imperativos que no son tambien un
       nombre o una tercera persona: «Reserva Natural», «Abre de jueves a
       domingo», «Sube hasta 3.555 m», «Sigue siendo enorme»... esos se leen
       uno a uno al cambiarlos, no los puede separar una regla */
    inicio('Toca', 'Pulsa', 'Elige', 'Escribe', 'Usa', 'Busca', 'Activa', 'Añade', 'Quita', 'Haz', 'Pon', 'Ten', 'Ven', 'Di', 'Respira', 'Escucha',
      'Imagina', 'Piensa', 'Sonríe', 'Celebra', 'Descubre', 'Explora', 'Disfruta', 'Conoce', 'Mueve', 'Apunta', 'Levanta', 'Dibuja', 'Comprueba', 'Arrastra',
      'Pellizca', 'Desliza', 'Selecciona', 'Instala', 'Evita', 'Aparca', 'Planifica', 'Inicia', 'Organiza', 'Mantén', 'Revisa', 'Saborea', 'Contempla',
      'Observa', 'Llama', 'Avisa', 'Introduce', 'Ejecuta', 'Comprueba', 'Filtra', 'Tira'),
    /* y los que si pueden ser nombre o tercera persona, solo en sus giros de
       imperativo: «Sal a…», «Mira el…», «Camina hacia…», «Reserva el…» */
    inicio('Sal a', 'Sal al', 'Ve a', 'Ve al', 'Ve despacio', 'Ve hacia', 'Ve cuando', 'Mira el', 'Mira la', 'Mira las', 'Mira los', 'Mira lo', 'Mira a',
      'Mira cómo', 'Mira que', 'Mira siempre', 'Camina hacia', 'Camina sin', 'Camina despacio', 'Camina,', 'Descansa', 'Deja que', 'Deja el', 'Deja la',
      'Prueba algo', 'Prueba a', 'Prueba con', 'Prueba esto', 'Sigue la', 'Sigue escribiendo', 'Vuelve a intentarlo', 'Vuelve aquí', 'Consulta el',
      'Consulta la', 'Consulta las', 'Consulta también', 'Consulta estado', 'Lleva agua', 'Lleva algo', 'Lleva calzado', 'Lleva frontal', 'Lleva abrigo',
      'Baja despacio', 'Sube despacio', 'Cierra la app', 'Reserva el', 'Reserva ida', 'Reserva con', 'Abre Google', 'Abre el', 'Pide ayuda',
      'Pide precio', 'Bebe agua', 'Entra el', 'Cambia paradas', 'Marca los', 'Visita la', 'Acepta lo', 'Cuida tu', 'Mueve el', 'Calcula primero',
      'Crea primero', 'Sube la app', 'Abre el menú', 'Aprovecha', 'Contacta con', 'Reposta', 'Paga al', 'Paga en', 'Habla como', 'Lleva ropa', 'Lleva protección'),
    /* el infinitivo con «te» pegado: «Puedo ayudarte», «al bañarte» (el de
       usted es «ayudarle», «bañarse») */
    palI('ayudarte', 'avisarte', 'decirte', 'llevarte', 'mostrarte', 'enseñarte', 'recomendarte', 'guiarte', 'orientarte', 'contarte', 'darte', 'verte',
      'ofrecerte', 'acompañarte', 'recordarte', 'llamarte', 'escribirte', 'conocerte', 'sentirte', 'perderte', 'moverte', 'quedarte', 'relajarte', 'animarte',
      'prepararte', 'abrigarte', 'protegerte', 'bañarte', 'alojarte', 'organizarte', 'informarte', 'registrarte', 'inscribirte', 'equivocarte', 'detenerte',
      'pararte', 'sentarte', 'tumbarte', 'acercarte', 'alejarte', 'asomarte', 'refrescarte', 'hidratarte', 'cuidarte', 'divertirte', 'olvidarte', 'acordarte',
      'preocuparte', 'arriesgarte', 'enviarte', 'mandarte', 'pedirte', 'invitarte', 'sorprenderte', 'emocionarte', 'despedirte', 'levantarte', 'ducharte',
      'vestirte', 'subirte', 'bajarte', 'meterte', 'situarte', 'ubicarte', 'conectarte', 'identificarte', 'decírtelo', 'contártelo', 'enseñártelo',
      'mostrártelo', 'dártelo'),
    /* en medio de la frase, solo verbos que ahi no son nombre ni tercera
       persona («cierra a las 13:00», «reserva previa» no entran) */
    tras('toca', 'elige', 'pulsa', 'selecciona', 'desliza', 'arrastra', 'pellizca', 'abre el menú', 'busca el icono', 'evita el baño', 'revisa', 'reposta',
      'calcula primero', 'crea primero', 'sube la app', 'prueba con', 'comprueba', 'consulta', 'instala', 'mira el', 'mira la', 'mira los', 'mira las',
      'mira cómo', 'mira hacia', 'disfruta', 'aprovecha', 'contacta con', 'escríbenos', 'avísanos', 'vuelve a intentarlo', 'extrema la precaución',
      /* «al acabar el crepúsculo, mira al oeste» (22 de octubre) */
      'mira al',
      /* «Solana sin sombra: lleva agua…», «Temperatura fresca — lleva ropa de abrigo» (22 de octubre) */
      'lleva agua', 'lleva ropa', 'lleva calzado', 'lleva protección', 'lleva abrigo', 'lleva frontal'),
    trasEmoji('Prueba con', 'Toca', 'Pulsa', 'Elige', 'Mira el', 'Mira la', 'Mira los', 'Mira las', 'Mira mis', 'Mira cómo', 'Mira hacia', 'Revisa',
      'Consulta el', 'Consulta la', 'Consulta las', 'Consulta los', 'Disfruta', 'Descubre', 'Aprovecha', 'Ven', 'Pide', 'Evita', 'Explora',
      /* el boton del glosario canario, «📚 Habla como un canario» (22 de octubre) */
      'Habla como'),
  ],
  fr: [palI('tu', 'te', 'toi', 'ton', 'ta', 'tes', 'tien', 'tienne', 'tiens', 'tiennes'), /(?<![A-Za-zÀ-ÿ])t['’](?=[aeéèêiîouyhAEÉÈÊIÎOUYH])/u,
       inicio('Touche', 'Choisis', 'Saisis', 'Utilise', 'Ouvre', 'Regarde', 'Cherche', 'Essaie', 'Réessaie', 'Découvre', 'Profite', 'Active', 'Crée', 'Ajoute',
         'Consulte', 'Enlève', 'Retire', 'Reviens', 'Lève', 'Dessine', 'Vérifie', 'Efface', 'Télécharge', 'Installe', 'Appuie', 'Glisse',
         'Bouge', 'Tape', 'Écris', 'Sélectionne', 'Respire', 'Écoute', 'Imagine', 'Souris', 'Prends', 'Fais', 'Va', 'Viens', 'Dis', 'Mets', 'Mange',
         /* los que tambien son nombre o tercera persona, solo en su giro de
            imperativo, con lo que manda detras (22 de octubre): en las fichas
            estan «Garde tournante» (la farmacia de guardia), «Garde la tradition»,
            «Bois de fayas», «Ferme canarienne», «Ferme avec ânes», «Pointe nord»,
            «Partage ses installations», «Accepte les assurances» */
         "Garde (?:ton|ta|tes|le|les|un|une|du|de l|quand|toujours|en)", "Bois (?:de l|un|une|beaucoup|assez|lentement|plus)",
         "Ferme (?:la|le|l[’'][a-zà-ÿ]+|les|ton|ta|tes|un|une)", "Pointe (?:ton|ta|le|la|les|l[’'][a-zà-ÿ]+|vers)", "Partage (?:ton|ta|tes|le|la|les)",
         "Accepte (?:ce|ton|ta|tes|que|la|le)",
         /* los que solo vio el repaso a mano (22 de octubre): el imperativo de tu
            sin pronombre de las frases del dia («Sois patient», «Marche vers la
            mer», «Aie sa patience») y del asistente («Lis-le avant d'y aller») */
         'Sois', 'Explore', 'Soigne', 'Sors', 'Aie', 'Apprends', 'Profites', 'Lis', 'Évite', 'Marche (?:vers|dix|doucement)', 'Marche,',
         'Reste pour', 'Commence par', 'Compte le pas', 'Remarque le', 'Célèbre de'),
       trasEmoji('Demande-moi', 'Touche', 'Choisis', 'Essaie', 'Réessaie', 'Regarde', 'Cherche', 'Va'),
       /* y en medio de la frase, en minuscula: «Dans Safari, touche… et choisis…», «: vérifie avant de…» */
       new RegExp('(?:[,:;—–]\\s*|\\set\\s+|\\sou\\s+)(?:va|vas-y|choisis|choisis-en|sois|vérifie|consulte|prends|mets|mets-le|touche|touche-la|cherche|cherche-la|lis|essaie|respire|regarde|demande|donne-lui)(?![' + L_ + '])', 'u'),
       /* «tu» ya caza «tu peux», «as-tu», «peux-tu»: «peux», «veux», «fais»… solos
          se llevaban «Je veux promouvoir mon activité», y «es» los dominios
          («aemet.es», «tenerifeon.es»). Quedan las dos que solo son de tu */
       palI('as', 'vas')],
  de: [palI('du', 'dich', 'dir', 'dein', 'deine', 'deinen', 'deinem', 'deiner', 'deines', 'dein(?!stall)\\w+'),
       inicio('Tippe', 'Wähle', 'Öffne', 'Schau', 'Nutze', 'Melde', 'Suche', 'Probier', 'Probiere(?! ich)', 'Entdecke', 'Genieße', 'Aktiviere', 'Akzeptiere', 'Erstelle', 'Speichere',
         'Füge', 'Lösche', 'Schließe', 'Teile', 'Lade', 'Installiere', 'Drücke', 'Wische', 'Bewege', 'Zeige', 'Halte', 'Gib', 'Nimm', 'Sieh', 'Lies', 'Atme', 'Hör', 'Höre(?! ich)',
         /* el imperativo exacto, no la raiz: «Geh\\w*» se llevaba «Geht um {h} auf» y,
            con el aleman de Sie, se llevaria «Gehen Sie» (22 de octubre) */
         'Stell', 'Stelle(?! ich)', 'Mach', 'Mache(?! ich)', 'Geh', 'Gehe(?! ich)', 'Komm', 'Komme(?! ich)', 'Trink', 'Iss', 'Lass', 'Sei', 'Denk', 'Denke(?! ich)', 'Gönn', 'Gönne(?! ich)', 'Vergiss', 'Plane', 'Folge', 'Richte', 'Hebe', 'Zeichne', 'Prüfe',
         /* los que salieron al pasar el aleman a Sie (22 de octubre): el
            imperativo corto sin pronombre, «Ruh heute», «Such ihn», «Erkunde in Ruhe».
            Los que tambien son nombre, solo en su giro: «Beginn mit…», «Versuch, …» */
         'Such', 'Ruh', 'Wähl', 'Erkunde', 'Pfleg', 'Zähl', 'Bleib', 'Genieß', 'Verbring', 'Lern', 'Füg', 'Bemerk', 'Hab', 'Vertrau', 'Verzeih',
         'Verlang', 'Verdien', 'Vergleich', 'Miss', 'Beweg', 'Behandle', 'Feiere', 'Ehre', 'Achte', 'Hüte', 'Erkenn', 'Verurteil', 'Definier',
         'Entdeck', 'Sorg', 'Leg', 'Nenn', 'Renn(?!-)', 'Frag', 'Tu', 'Sag', 'Grüß', 'Füll', 'Streck', 'Verdien', 'Dank',
         'Beginn mit', 'Beginn dort', 'Beginn bei', 'Versuch auch', 'Versuch,',
         /* y los que solo vio el repaso a mano, frase a frase (22 de octubre) */
         'Würfle', 'Fahr', 'Prüf', 'Berechne', 'Versuche es', 'Versuch eine', 'Versuch es', 'Sprich', 'Schreib', 'Park nie'),
       /* tras un emoji: «👋 Frag mich…», «😕 Versuch eine andere Gegend» */
       trasEmoji('Frag', 'Versuch', 'Versuche', 'Probier', 'Probiere', 'Tippe', 'Tipp', 'Wähle', 'Wähl', 'Schau', 'Gib', 'Sieh', 'Geh', 'Komm', 'Such', 'Öffne', 'Sprich'),
       /* y en medio de la frase, en minuscula, tras dos puntos, coma o «und»: «Heute: geh langsam», «wähl eins und geh» */
       new RegExp('(?:[,:;—–]\\s*|\\sund\\s+)(?:geh|wähl|probier|schau|frag|such|atme|bleib|lass|nimm|gib|sieh|hör|tu|komm|denk|ruh|tipp|öffne|wähle|tippe)(?![' + L_ + '])', 'u'),
       /* «Bitte fülle…», «bitte gib…»: tras «bitte», el imperativo de du (el de Sie es «Bitte füllen Sie») */
       new RegExp('(?<![' + L_ + '])[Bb]itte\\s+(?:fülle|füll|gib|wähle|wähl|tippe|tipp|gehe|geh|versuche|versuch|prüfe|prüf|öffne|schau|sieh|nimm|lies|komm|warte|melde|gib)(?![' + L_ + '])', 'u')],
  it: [palI('tu', 'ti', 'te', 'tuo', 'tua', 'tuoi', 'tue'),
       inicio('Tocca', 'Scegli', 'Scrivi', 'Usa', 'Apri', 'Guarda', 'Prova', 'Cerca', 'Scopri', 'Goditi', 'Attiva', 'Crea', 'Salva', 'Aggiungi', 'Consulta',
         'Togli', 'Alza', 'Disegna', 'Controlla', 'Cancella', 'Chiudi', 'Condividi', 'Scarica', 'Installa', 'Premi', 'Trascina', 'Muovi',
         'Seleziona', 'Segui', 'Accedi', 'Respira', 'Ascolta', 'Immagina', 'Sorridi', 'Prendi', 'Fai', 'Vai', 'Vieni', 'Metti', 'Bevi', 'Mangia', 'Lascia',
         'Ricorda', 'Esplora', 'Pianifica', 'Organizza', 'Concediti', 'Regalati', 'Fermati', 'Ricordati',
         /* «Di'» (di' = di': dica) lleva su apostrofo: «Di» solo es «Di solito», «Di fronte», «Di turno» */
         "Di['’]",
         /* los que tambien son nombre o tercera persona, solo en su giro de imperativo
            (22 de octubre): en las fichas estan «Punta de Teno», «Punta di roccia»,
            «Visita ai vigneti», «Accetta assicurazioni internazionali», en las
            frases «Cambia il giorno da dentro» (el sol lo cambia) y «Cammina il Suo
            tratto», y en el cielo «Torna visibile dalla notte del…» */
         "Punta (?:il|lo|la|i|gli|le|l['’][a-zà-ÿ]+|verso)", "Visita (?:il|lo|la|i|gli|le|l['’][a-zà-ÿ]+)", 'Accetta(?:ne|lo|la|li|le)', 'Accetta (?:ciò|che|questo|questa)',
         'Cambia (?:lingua|la lingua|tappe|le tappe|data|zona|posto)',
         /* y los que solo vio el repaso a mano (22 de octubre): el imperativo de tu sin
            pronombre de las frases del dia, del asistente, del cielo y de las fichas */
         'Sii', 'Abbi', 'Cammina (?:verso|dieci|piano|senza)', 'Cammina,', 'Torna (?:qui|indietro|a casa)', 'Riposa', 'Ringrazia', 'Festeggia', 'Perdonati', 'Muoviti', 'Prenditi', 'Fidati', 'Chiediti', 'Ascoltati', 'Trattati',
         'Filtra', 'Tira', 'Riprova', 'Inserisci', 'Compila', 'Spegni', 'Tieni', 'Scendi', 'Sali', 'Sposta', 'Parcheggia',
         'Porta (?:una|un|qualcosa|comunque|scarpette|acqua)', 'Evita (?:di|il|la|le|i|gli|piscine)', 'Verifica (?:stato|le|il|lo|la|i|gli|sul)', 'Calcola prima',
         'Paga all', 'Segna i', 'Leggilo', 'Toccane', 'Chiedimi', 'Scrivigli', 'Copriti', 'Collegati', 'Esegui',
         'Non (?:guardare|guardarla|scendere|uscire|pretendere|lasciarlo|definirti|misurarti|giudicarti|paragonare|correre|contarci)'),
       /* y en medio de la frase, en minuscula: «Prima di salire, controlla…», «… e scegli…»,
          «finito il crepuscolo, guarda a ovest». Sin «attraversa»: en las fichas es el
          sendero el que atraviesa («… e attraversa boschi di laurisilva») */
       new RegExp('(?:[,:;—–→·]\\s*|\\s(?:e|o|oppure|poi|quindi)\\s+)(?:tocca|scegli|apri|cerca l|guarda (?:a|nel|nella|dalla|verso)|controlla|verifica|verificala|verificali|porta (?:una|un|qualcosa|comunque)|usa (?:il|la|le|i|gli)|evita (?:il|la|di)|prova (?:un|una|a|con)|scrivi|consulta|segui|trascina|pizzica|disegna|lascia che|tieni|spegni|scendi|sali piano|prenota|conferma|confermali|cercala|toccala|copriti|aspettati|portane|portalo|aprilo|leggilo|avvicinalo|travestiti|collegati|concorda|riprova|inserisci|compila|mantieni|sorveglia|guida con|parcheggia|aspetta che)(?![' + L_ + '])', 'u'),
       /* la segunda persona, en las formas que solo son de tu (la de Lei es otra: «può»,
          «vuole», «preferisce»…). «sei» es tambien el numero, y va solo en sus giros;
          «arrivi», «entri», «resti», «trovi», «parti» se quitan: son tambien el Lei
          («arrivi prima delle dieci», «non entri in acqua») o un nombre («i resti») */
       palI('puoi', 'vuoi', 'hai', 'vai', 'fai', 'vedi', 'sai', 'devi', 'scopri', 'senti', 'esci', 'stai', 'preferisci', 'dipendi', 'intendi', 'conosci', 'riesci',
         'capisci', 'finisci', 'vieni', 'tieni', 'rimani', 'prendi', 'metti', 'leggi', 'scrivi', 'chiedi', 'credi', 'dormi', 'apri', 'sapevi', 'conoscevi',
         'guarderai', 'vedrai', 'troverai', 'sarai', 'potrai', 'dovrai', 'avrai', 'farai', 'andrai', 'arriverai',
         '(?:non|se|dove|ci|come|quando|tu) sei', 'sei (?:già|qui|lì|sicur[oa]|pront[oa]|arrivat[oa]|sol[oa]|stanc[oa]|liber[oa]|proprio|giusto|abbastanza|viv[oa]|rott[oa]|indietro)',
         'se accetti', 'se rifiuti', 'finché non accetti', 'quando calcoli', 'che scrivi', 'che apri', 'cui consulti', 'mentre leggi', 'se capiti', 'cosa cerchi', 'cerchi\\?', 'ovunque dormi',
         /* el infinitivo con «ti» pegado: «per muoverti», «senza sentirti» (el de Lei es «muoversi», «sentirsi») */
         'muoverti', 'sentirti', 'presentarti', 'lasciarti', 'riempirti', 'ricordarti', 'mostrarti', 'aiutarti', 'cambiarti', 'accompagnarti', 'avvisarti', 'portarti',
         'farti', 'darti', 'dirti', 'guidarti', 'consigliarti', 'proteggerti', 'prepararti', 'fermarti', 'perderti', 'goderti', 'abbagliarti', 'registrarti',
         'prenderti', 'metterti', 'sorprenderti', 'spiegarti', 'chiederti', 'scriverti')],
  /* y la cortesia de je, que va pegada en una palabra: «alsjeblieft», «dankjewel»
     (la de u: «alstublieft», «dank u wel») (22 de octubre) */
  nl: [palI('je', 'jij', 'jou', 'jouw', 'jouwe', 'jezelf', 'jullie', 'alsjeblieft', 'alsjeblief', 'dankjewel')],
  bg: [palI('ти', 'теб', 'тебе', 'твой', 'твоя', 'твоят', 'твоята', 'твоето', 'твоите'),
       inicio('Докосни', 'Избери', 'Отвори', 'Виж', 'Потърси', 'Опитай', 'Открий', 'Включи', 'Приеми', 'Създай', 'Запази', 'Добави', 'Премахни', 'Промени', 'Върни',
         'Вдигни', 'Нарисувай', 'Провери', 'Изтрий', 'Затвори', 'Сподели', 'Изтегли', 'Инсталирай', 'Натисни', 'Плъзни', 'Въведи', 'Влез', 'Следвай',
         'Използвай', 'Разгледай', 'Свържи', 'Дишай', 'Слушай', 'Представи', 'Усмихни', 'Вземи', 'Направи', 'Иди', 'Ела', 'Кажи', 'Сложи', 'Пий', 'Яж', 'Остави',
         'Спомни', 'Планирай', 'Организирай', 'Посети', 'Насладѝ', 'Наслади', 'Почини', 'Подари', 'Покажи',
         /* los que solo vio el repaso a mano (22 de octubre): el imperativo de ти de
            las frases del dia y del cielo. Los que tambien son nombre, adjetivo o
            tercera persona, solo en su giro: «Пази» («Островът пази кътче»),
            «Брой» («Брой места»), «Прости» («прости ястия»), «Позволи» (aoristo) */
         'Бъди', 'Излез', 'Повърви', 'Пусни (?:онова|изискванията|вчерашното)', 'Послушай', 'Задай', 'Отпразнувай', 'Почивай', 'Поеми', 'Заслужи',
         'Остани', 'Поискай', 'Грижи се', 'Назови', 'Раздвижи се', 'Размърдай', 'Изследвай', 'Превземи', 'Прости си', 'Върни', 'Пази (?:съня|се|мира)',
         'Поразгледай', 'Помни', 'Разглеждай', 'Учи се', 'Имай', 'Брой днешната', 'Позволи си', 'Изненадай се', 'Уважавай', 'Уважи', 'Забележи',
         'Почети', 'Продължавай', 'Пускай', 'Подиши', 'Погледай', 'Погледни', 'Движи (?:се|телефона|тялото)', 'Щипни', 'Дръж', 'Начертай',
         'Постави', 'Приближи', 'Следвай', 'Гледай (?:морето|встрани|хоризонта)', 'Опитай(?! отново)', 'Насочи към звезда'),
       palI('можеш', 'искаш', 'имаш', 'знаеш', 'трябва да\\s+\\S+ш', 'видиш', 'отидеш', 'дойдеш', 'намериш', 'стигнеш', 'влезеш', 'излезеш', 'останеш', 'чуеш',
         'видиш', 'пожелаеш', 'решиш', 'включиш', 'приемеш', 'създадеш', 'запазиш', 'добавиш', 'изтриеш', 'отвориш', 'докоснеш', 'избереш', 'ползваш', 'използваш'),
       /* la segunda persona del presente acaba en -ш (можеш, виждаш, отвориш), y la de
          вие en -те: toda palabra en -аш, -яш, -еш, -иш es de ти, salvo las que no son
          verbo («сякаш», «бакшиш», «наш», «ваш», «душ») (22 de octubre); y los nombres
          de los avatares de Europa: «сладкиш», «гулаш», «Папанаш» y «Пелеш» (23 de octubre),
          y con los de oro, «фиш» («Фиш енд чипс») y «Марамуреш» (23 de octubre, tarde) */
       new RegExp('(?<![' + L_ + '])(?!(?:сякаш|бакшиш|наш|ваш|душ|кеш|мишмаш|гуляш|финиш|сладкиш|гулаш|папанаш|пелеш|фиш|марамуреш)(?![' + L_ + ']))[а-яё]+(?:аш|яш|еш|иш)(?![' + L_ + '])', 'iu'),
       /* «те» de complemento («те чака», «те води»): «те» es tambien «ellos» («те се
          номерират»), asi que solo con los verbos que lo llevan en la app */
       palI('те (?:чака|води|събужда|предупреди|радва|пазят|приема|гледа|успокоява|прави|връща|приближава|учи|изненада|докосне|проветри|придружи|подреди|успокои|вика)')],
  pl: [palI('ty', 'ci', 'cię', 'ciebie', 'tobie', 'tobą', 'twój', 'twoja', 'twoje', 'twoich', 'twoim', 'twoją', 'twojej', 'twojego', 'twoi', 'twoimi', 'twym', 'twych', 'twe', 'twoj'),
       inicio('Dotknij', 'Wybierz', 'Wpisz', 'Użyj', 'Otwórz', 'Zobacz', 'Szukaj', 'Spróbuj', 'Odkryj', 'Włącz', 'Zaakceptuj', 'Utwórz', 'Zapisz', 'Dodaj', 'Usuń',
         'Zmień', 'Wróć', 'Skieruj', 'Podnieś', 'Narysuj', 'Sprawdź', 'Zamknij', 'Udostępnij', 'Pobierz', 'Zainstaluj', 'Naciśnij', 'Przeciągnij', 'Przesuń', 'Zaloguj',
         'Przejrzyj', 'Zareklamuj', 'Korzystaj', 'Kliknij', 'Oddychaj', 'Słuchaj', 'Wyobraź', 'Uśmiechnij', 'Weź', 'Zrób', 'Idź', 'Chodź', 'Powiedz', 'Połóż', 'Pij', 'Jedz',
         'Zostaw', 'Pamiętaj', 'Zaplanuj', 'Zorganizuj', 'Odwiedź', 'Ciesz', 'Odpocznij', 'Podaruj', 'Pozwól',
         /* los que solo vio el repaso a mano (22 de octubre): el imperativo de ty de
            las frases del dia, las fichas, el asistente y el cielo */
         'Bądź', 'Wyjdź', 'Wejdź', 'Zejdź', 'Przejdź', 'Przyjdź', 'Jedź', 'Zjedź', 'Daj', 'Zadaj', 'Podaj', 'Dorzuć', 'Rzuć', 'Zabierz', 'Kup', 'Zarezerwuj',
         'Rezerwuj', 'Zapytaj', 'Poproś', 'Napisz', 'Zadzwoń', 'Dzwoń', 'Poszukaj', 'Spójrz', 'Patrz', 'Popatrz', 'Posłuchaj', 'Wysłuchaj', 'Wsłuchaj',
         'Odetchnij', 'Pooddychaj', 'Poruszaj', 'Porusz', 'Ruszaj', 'Rozciągnij', 'Dbaj', 'Zadbaj', 'Uważaj', 'Pilnuj', 'Zachowaj', 'Przestrzegaj', 'Unikaj',
         'Licz', 'Odpuść', 'Odpoczywaj', 'Zostań', 'Zwiedzaj', 'Odkrywaj', 'Poeksploruj', 'Pobłądź', 'Zauważ', 'Doceń', 'Podziękuj', 'Świętuj', 'Szanuj',
         'Uszanuj', 'Wybacz', 'Potraktuj', 'Zacznij', 'Ucz', 'Wymień', 'Odbierz', 'Przyjmij', 'Odłóż', 'Odwzajemnij', 'Zasłuż', 'Zaprowadź', 'Pokaż',
         'Przeczytaj', 'Trzymaj', 'Zgaś', 'Unieś', 'Umieść', 'Przybliż', 'Uszczypnij', 'Przytrzymaj', 'Skopiuj', 'Kąp', 'Wykąp', 'Pływaj', 'Płyń', 'Unoś',
         'Wzywaj', 'Wchodź', 'Schodź', 'Ubierz', 'Przebierz', 'Przenocuj', 'Wynajmij', 'Wykup', 'Wyruszaj', 'Przygotuj', 'Zatankuj', 'Parkuj', 'Zjeżdżaj',
         'Podziwiaj', 'Cofnij', 'Czekaj', 'Poczekaj', 'Poczuj', 'Pisz', 'Skorzystaj', 'Używaj', 'Zaznaczaj', 'Odblokowuj', 'Zmieniaj', 'Podgłośnij',
         'Wyszukaj', 'Przyłóż', 'Dotykaj', 'Odśwież', 'Wyślij', 'Miej',
         /* y los del repaso a mano del polaco (22 de octubre, tarde), con los verbos de
            los rotulos: un rotulo es imperativo y va en ROTULOS_PL; si la misma forma
            aparece en una frase, es que le habla de ty a quien lee */
         'Mów', 'Reklamuj', 'Wypełnij', 'Zakreśl', 'Definiuj', 'Mierz', 'Oceniaj', 'Omijaj', 'Potwierdź', 'Przegap', 'Uzupełniaj', 'Wyznacz',
         'Zdobądź', 'Porównuj', 'Wymagaj', 'Biegnij', 'Zjedz', 'Ustal', 'Ufaj', 'Traktuj', 'Ryzykuj', 'Przyjeżdżaj', 'Podchodź', 'Załóż', 'Wybieraj',
         'Zatrzymuj', 'Zaskocz', 'Przypomnij', 'Zarejestruj', 'Posortuj', 'Połącz', 'Odrzuć', 'Powiadamiaj', 'Edytuj', 'Filtruj', 'Wygeneruj',
         'Wyloguj', 'Kontynuuj', 'Wyczyść', 'Wyłącz', 'Wyśrodkuj', 'Opublikuj', 'Oznacz', 'Zatrzymaj', 'Anuluj', 'Pomiń', 'Zresetuj', 'Zapłać',
         'Odtwórz', 'Ukryj', 'Znajdź', 'Wyceluj', 'Uruchom'),
       palI('możesz', 'masz', 'chcesz', 'zobaczysz', 'jesteś', 'wiesz', 'musisz', 'znajdziesz', 'dojdziesz', 'dojedziesz', 'wejdziesz', 'wyjdziesz', 'zostaniesz',
         'usłyszysz', 'zechcesz', 'zdecydujesz', 'włączysz', 'zaakceptujesz', 'założysz', 'zapiszesz', 'dodasz', 'usuniesz', 'otworzysz', 'dotkniesz', 'wybierzesz',
         'korzystasz', 'używasz', 'potrzebujesz', 'szukasz', 'przyjedziesz', 'pojedziesz', 'zapłacisz', 'płacisz', 'wpiszesz', 'dostaniesz', 'będziesz', 'byłeś', 'byłaś'),
       /* y en cualquier sitio de la frase: en polaco el imperativo casi no coincide
          con otra palabra, y aparece tambien tras un complemento («W weekend
          zarezerwuj stolik», «Przed kąpielą sprawdź…», «Morze wzburzone — nie
          kąp się») (22 de octubre) */
       new RegExp('(?<![' + L_ + '])(?:przestrzegaj|odwzajemnij|poeksploruj|powiadamiaj|przeciągnij|przyjeżdżaj|przytrzymaj|zarejestruj|odblokowuj|odpoczywaj|podgłośnij|pooddychaj|przeczytaj|przypomnij|rozciągnij|skorzystaj|udostępnij|uszczypnij|uzupełniaj|uśmiechnij|zaakceptuj|zainstaluj|zareklamuj|zarezerwuj|zorganizuj|kontynuuj|korzystaj|odetchnij|odpocznij|opublikuj|podziwiaj|podziękuj|posłuchaj|potraktuj|potwierdź|przebierz|przejrzyj|przenocuj|przygotuj|wygeneruj|wysłuchaj|wyśrodkuj|zaprowadź|zatrzymaj|zatrzymuj|zaznaczaj|definiuj|naciśnij|oddychaj|odkrywaj|pamiętaj|poczekaj|podchodź|poruszaj|porównuj|posortuj|poszukaj|przybliż|przyjmij|reklamuj|rezerwuj|wsłuchaj|wybieraj|wynajmij|wypełnij|wyruszaj|wyszukaj|zachowaj|zaplanuj|zatankuj|zjeżdżaj|zmieniaj|zresetuj|zwiedzaj|biegnij|dotknij|dotykaj|filtruj|kliknij|narysuj|oceniaj|odbierz|odtwórz|odwiedź|odśwież|pobierz|pobłądź|podaruj|podnieś|popatrz|powiedz|przegap|przejdź|przesuń|przyjdź|przyłóż|ryzykuj|skieruj|skopiuj|sprawdź|spróbuj|słuchaj|traktuj|trzymaj|uruchom|uszanuj|wybierz|wyceluj|wyczyść|wyloguj|wymagaj|wyobraź|wyznacz|zabierz|zacznij|zadzwoń|zakreśl|zaloguj|zamknij|zapytaj|zaskocz|zdobądź|świętuj|anuluj|cofnij|czekaj|dorzuć|edytuj|napisz|odkryj|odpuść|odrzuć|omijaj|otwórz|oznacz|parkuj|pilnuj|poczuj|poproś|porusz|pozwól|połącz|pływaj|ruszaj|schodź|spójrz|szanuj|szukaj|ubierz|umieść|unikaj|utwórz|uważaj|używaj|wchodź|wybacz|wymień|wyłącz|wyślij|wzywaj|zadbaj|zapisz|zapłać|zasłuż|zauważ|znajdź|zobacz|zostaw|zostań|chodź|ciesz|doceń|dodaj|dzwoń|mierz|odłóż|patrz|podaj|pokaż|pomiń|połóż|ukryj|unieś|ustal|wejdź|wpisz|wyjdź|wykup|wykąp|włącz|zadaj|załóż|zejdź|zjedz|zjedź|zmień|bądź|dbaj|jedz|jedź|licz|miej|pisz|płyń|rzuć|ufaj|unoś|usuń|użyj|wróć|zgaś|zrób|daj|idź|kup|kąp|mów|pij|ucz|weź)(?![' + L_ + '])', 'iu'),
       /* la segunda persona del presente y del futuro acaba en -sz (masz, możesz,
          zobaczysz), el pasado en -łeś/-łaś (zrobiłeś) y el condicional en -byś
          (gdybyś): toda palabra asi es de ty, salvo las que no son verbo
          («nasz», «Jowisz», «kapelusz», «dziś», «coś») (22 de octubre) */
       new RegExp('(?<![' + L_ + '])(?!(?:nasz|wasz|jowisz|klawisz|mysz|gulasz|afisz|łukasz|tomasz)(?![' + L_ + ']))[a-ząćęłńóśźż]+(?:asz|esz|isz|ysz)(?![' + L_ + '])', 'iu'),
       palI('jesteś', '[a-ząćęłńóśźż]+łeś', '[a-ząćęłńóśźż]+łaś', '[a-ząćęłńóśźż]*byś')],
  zh: [/(?<!迷)你/u],
  zht: [/(?<!迷)你/u],
};

/* Los rotulos de boton del italiano (22 de octubre de 2026). En italiano el
   boton va en imperativo («Chiudi», «Cerca», «Condividi», «Accedi»), tambien en
   las apps que tratan de Lei: es lo que en castellano es el infinitivo («Cerrar»,
   «Buscar», «Compartir»). Se quedan asi, y lo que habla a quien usa la app va de
   Lei. Cuando una frase cita el boton entre comillas («tocchi «Condividi»»), la
   cita es el rotulo y tampoco cuenta. La voz de quien usa la app («Portami»,
   «Sorprendimi», «Ricordamelo nell’app») se queda como en castellano. */
const ROTULOS_IT = new Set([
  'Accedi', 'Ascolta', 'Attiva', 'Attiva le notifiche', 'Cambia lingua', 'Cancella', 'Cancella TUTTA la cache', 'Cancella il dettaglio', 'Cancella il percorso',
  'Cancella la ricerca', 'Cerca', 'Cerca destinazione', 'Cerca fermata o linea...', 'Cerca partenza', 'Cerca un astro', 'Cerca un luogo...', 'Cerca: Orione, M42, Vega…',
  'Chiudi', 'Chiudi amministrazione', 'Chiudi gli avvisi meteo', 'Chiudi il carrello', 'Chiudi il negozio', 'Chiudi il pannello percorsi',
  'Chiudi il pannello trasporti', 'Chiudi il pianificatore', "Chiudi l'assistente", "Chiudi l'avviso", 'Chiudi la legenda', 'Chiudi le fermate vicine',
  'Condividi', 'Condividi il luogo', "Condividi l'itinerario", 'Crea account', 'Crea itinerario con {n} tipi →', 'Crea itinerario →', 'Esci', 'Fai il tour', 'Filtra',
  'Guarda in diretta', 'Installa', 'Installa Tenerife Go', 'Installa l’app', 'Leggi la voce intera', 'Riprova', 'Salva nei preferiti', 'Salva nel percorso del giorno',
  'Salva o condividi l’immagine', 'Scarica il dettaglio ({mb} MB)', 'Scegli un’altra data', 'Togli', 'Togli dall’itinerario', 'Togli tutti gli avvisi',
  'Torna a Tenerife Go', 'Torna al luogo', 'Torna indietro', 'Usa come punto di partenza', 'Usa la mia posizione GPS', 'Vedi il calendario', 'Vedi il tour',
  'Vedi info', 'Vedi la descrizione completa', 'Vedi su aemet.es', 'Vedi sulla mappa', 'Vedi sulla mappa del cielo', '📍 Vedi sulla mappa',
  '🔗 Vedi orari su titsa.com', '🗺️ Vedi tutti sulla mappa', 'Verifica la bussola', 'Aggiungi ai preferiti', 'Aggiungi al mio calendario', 'Aggiungi al negozio',
  'Aggiungi al percorso', 'Aggiungi escursione', '⭐ I consigli di Jérôme — Aggiungi attività', 'Apri in Google Maps', 'Apri la legenda',
  /* los del perfil (modulos/perfil.js, 23 de octubre de 2026) */
  'Aggiungi', 'Cerca un paese', 'Crea account o accedi', 'Salva', 'Scarica i dati del profilo',
  /* los del sistema, que la app cita tal cual: el menu de Safari y el de Chrome */
  'Aggiungi a Home', 'Installa app',
]);

/* Los del bulgaro (22 de octubre de 2026): el boton en imperativo («Затвори»,
   «Сподели», «Премахни»), como en las apps en bulgaro tambien cuando tratan de
   вие; las frases que hablan a quien usa la app, de вие. */
const ROTULOS_BG = new Set([
  'Затвори', 'Затвори асистента', 'Затвори близките спирки', 'Затвори кошницата', 'Затвори легендата', 'Затвори магазина',
  'Затвори метеорологичните предупреждения', 'Затвори панела за транспорт', 'Затвори панела с маршрути', 'Затвори планера', 'Затвори съобщението',
  'Сподели', 'Сподели маршрута', 'Сподели мястото', '📤 Сподели', 'Премахни', 'Премахни всички', 'Премахни всички напомняния', 'Премахни крайната точка',
  'Премахни началната точка', 'Премахни от любими', 'Премахни от маршрута', 'Премахни ръчната настройка', 'Запази в любими',
  'Запази в маршрута за деня', 'Запази или сподели изображението', 'Виж в aemet.es', 'Виж информация', 'Виж обиколката', 'Виж пълното описание',
  'Отвори в Google Maps', 'Отвори легендата', 'Добави в любими', 'Добави към маршрута', 'Добави в календара ми', '✓ Добави в количката',
  'Изтрий ЦЕЛИЯ кеш', 'Изтрий подробната карта', 'Изтрий акаунта', 'Инсталирай', 'Инсталирай Tenerife Go', 'Инсталирай приложението', 'Включи', 'Включи известията', 'Влез',
  'Свържи се', 'Опитай отново', 'Създай маршрут с {n} вида →', 'Създай маршрут →', 'Създай нов маршрут', 'Използвай като начало на маршрут', 'Слушай',
  'Провери компаса', 'Избери друга дата', 'Насочи към небето', 'Приближи',
  'Покажи всички', 'Покажи на картата', 'Покажи на картата на небето', 'Покажи пътя му тази нощ', 'Скрий пътя',
  /* los del perfil (modulos/perfil.js, 23 de octubre de 2026) */
  'Добави', 'Запази', 'Изтегли данните на профила', 'Изтрий', 'Изтрий данните на профила от това устройство', 'Изтрий от облака', 'Промени името',
  /* los del sistema, que la app cita tal cual: el menu de Safari */
  'Добави към начален екран',
]);

/* Los del polaco (22 de octubre de 2026): el boton en imperativo («Zamknij»,
   «Udostępnij», «Usuń»), como en las apps en polaco; lo que habla a quien usa la
   app va en impersonal y sin genero («Można…», «Warto…», «Proszę» con el
   infinitivo, el infinitivo en los pasos y los avisos). Una cita del boton
   entre comillas o en <b> («dotknąć «Udostępnij»», «<b>Zainstaluj</b>») es el
   rotulo y tampoco cuenta. */
const ROTULOS_PL = new Set([
  'Anuluj', '✓ Dodaj do koszyka', 'Dodaj do mojego kalendarza', 'Dodaj do mojej trasy', 'Dodaj do sklepu', 'Dodaj do ulubionych', '➕ Dodaj pamiątkę',
  'Dodaj wycieczkę', '➕ Dodaj wycieczkę', 'Edytuj trasę', '✏️ Edytuj trasę', 'Filtruj', 'Kontynuuj jako gość', 'Kup', "Napisz do Jérôme'a",
  'Nie, odrzuć', 'Odtwórz noc', 'Odśwież', '✅ Opublikuj na mapie', 'Otwórz legendę', 'Otwórz w Mapach Google', 'Oznacz jako odwiedzone',
  '○ Oznacz jako odwiedzone', 'Pobierz szczegóły ({mb} MB)', '📥 Pobierz trasę dnia (GPX)', 'Pokaż jego drogę tej nocy',
  '✈️ Pokaż linie na lotnisko południowe', '✈️ Pokaż linie na lotnisko północne', 'Pokaż na mapie', 'Pokaż na mapie nieba', 'Pokaż tylko ulubione',
  'Pokaż wszystkie', "⭐ Polecenia Jérôme'a — dodaj firmę", 'Pomiń', 'Potwierdź rezerwację', 'Przeczytaj cały artykuł', 'Przybliż', 'Rezerwuj', 'Skopiuj link',
  '💊 Sprawdź dyżurną aptekę na dziś', '💊 Sprawdź dyżurną aptekę na dziś (oficjalne)', 'Sprawdź kompas', 'Spróbuj ponownie', 'Szukaj', 'Szukaj celu',
  'Szukaj miejsca...', 'Szukaj obiektu', 'Szukaj początku', 'Szukaj przystanku lub linii...', 'Szukaj: Orion, M42, Wega…', 'Słuchaj', '▶ Słuchaj',
  'Tak, połącz', 'Udostępnij', '📤 Udostępnij', 'Udostępnij miejsce', 'Udostępnij plan', 'Ukryj drogę',
  'Uruchom czas (miesiąc na sekundę)', 'Usuń', 'Usuń CAŁĄ pamięć podręczną',
  'Usuń cel', 'Usuń konto', 'Usuń początek', 'Usuń ręczną korektę', 'Usuń szczegóły', 'Usuń wszystkie', 'Usuń wszystkie dane sklepu',
  'Usuń wszystkie przypomnienia', 'Usuń z planu', 'Usuń z ulubionych', 'Utwórz plan z {n} rodzajami →', 'Utwórz plan →',
  'Użyj jako punktu początkowego trasy', 'Użyj mojej lokalizacji GPS', 'Wejdź', 'Wróć', 'Wróć do miejsca', 'Wróć do Tenerife Go', 'Wróć wstecz',
  'Wybierz inną datę', 'Wyceluj w niebo', 'Wyczyść', 'Wyczyść pamięć podręczną mapy', 'Wyczyść trasę', 'Wyczyść wyszukiwanie',
  'Wygeneruj nowy plan', 'Wygeneruj ponownie', 'Wyloguj się', 'Wyznacz trasę', 'Wyłącz filtry kategorii', 'Wyślij', 'Wyślij do chmury',
  'Wyślij zgłoszenie', 'Wyśrodkuj na mapie', 'Włącz', 'Włącz powiadomienia', '📞 Zadzwoń pod 112', 'Zainstaluj', 'Zainstaluj aplikację',
  'Zainstaluj Tenerife Go', 'Zaloguj się', 'Zamknij', '✕ Zamknij', 'Zamknij administrację', 'Zamknij asystenta', 'Zamknij komunikat', 'Zamknij koszyk',
  'Zamknij legendę', 'Zamknij ostrzeżenia pogodowe', 'Zamknij panel transportu', 'Zamknij panel tras', 'Zamknij planer',
  'Zamknij przystanki w pobliżu', 'Zamknij sklep', 'Zapisz lub udostępnij obraz', 'Zapisz w Trasie dnia', 'Zapisz w Ulubionych',
  'Zapisz w ulubionych', '💳 Zapłać — wkrótce', '🔒 Zapłać — Wkrótce', '📅 Zarezerwuj', 'Zatrzymaj', 'Załóż konto', '‹ Zmień czas',
  '‹ Zmień część wyspy', 'Zmień język', 'Zmień to miejsce', '‹ Zmień zajęcia', 'Znajdź go na niebie', 'Zobacz informacje', 'Zobacz kalendarz',
  'Zobacz na aemet.es', '📍 Zobacz na mapie', 'Zobacz na żywo', 'Zobacz pełny opis', 'Zobacz przewodnik', '🔗 Zobacz rozkład na titsa.com',
  '🗺️ Zobacz wszystkie na mapie', 'Zresetuj planer',
  /* los del perfil (modulos/perfil.js, 23 de octubre de 2026) */
  'Dodaj', 'Pobierz dane profilu', 'Szukaj kraju', 'Tak, usuń', 'Usuń dane profilu z tego urządzenia', 'Usuń z chmury', 'Załóż konto lub zaloguj się',
  'Zapisz', 'Zmień imię',
]);
/* la voz de quien usa la app («Zaskocz mnie», «Zaprowadź mnie», «Przypomnij mi w
   aplikacji», lo que se escribe al asistente), como «Sorpréndeme» y «Llévame»
   (Jerome: esos rotulos se quedan asi) */
const VOZ_PL = new Set([
  'Pomożesz mi zaplanować dzień?', 'Posortuj moje ulubione według odległości', 'posortuj moje ulubione według odległości',
  'Przypomnij mi w aplikacji', 'Tak, powiadamiaj mnie', 'Tak, usuń moje konto', 'Usuń moje konto', 'Zaprowadź mnie', 'Zaprowadź mnie do niego',
  'Zarejestruj mnie', 'Zaskocz mnie',
]);

/* Lo que parece tuteo y no lo es: [idioma, texto exacto o RegExp, motivo]. */
const EXENTOS = [
  ['es', '"¡Oye, tú!" — para llamar a alguien con cariño.', 'el glosario canario explica «chacho»: el ejemplo va entre comillas y no habla a quien usa la app'],
  ['es', 'Mira', 'la estrella Mira (ο Ceti): nombre propio'],
  ['es', /Calle Esteban de Ponte/, 'Ponte es el apellido de la calle Esteban de Ponte'],
  /* el aleman (22 de octubre de 2026) */
  ['de', '„Hey du!" — freundliche Anrede.', 'el glosario canario explica «chacho»: el ejemplo va entre comillas y no habla a quien usa la app'],
  ['de', 'Überrasch mich', 'la voz de quien usa la app, como «Sorpréndeme» (Jerome: esos rotulos se quedan asi)'],
  ['de', 'Hilfst du mir, den Tag zu planen?', 'la pregunta de quien usa la app al asistente, como «¿Me ayudas a organizar el día?»'],
  ['de', 'Zeige', '«Zeige 74 von 980 Orten»: habla la app en primera persona, no es un imperativo'],
  ['de', 'Suche löschen', '«Suche» es el nombre (la busqueda): «borrar la busqueda»'],
  /* el neerlandes (22 de octubre de 2026) */
  ['nl', '"Hé jij!" — vriendelijke aanspreekvorm.', 'el glosario canario explica «chacho»: el ejemplo va entre comillas y no habla a quien usa la app'],
  ['nl', 'Help je me mijn dag te plannen?', 'la pregunta de quien usa la app al asistente, como «¿Me ayudas a organizar el día?»'],
  /* el frances (22 de octubre de 2026) */
  ['fr', "« Hé toi ! » — façon amicale d'interpeller.", 'el glosario canario explica «chacho»: el ejemplo va entre comillas y no habla a quien usa la app'],
  ['fr', 'Tu m’aides à organiser ma journée ?', 'la pregunta de quien usa la app al asistente, como «¿Me ayudas a organizar el día?»'],
  /* el italiano (22 de octubre de 2026) */
  ['it', '"Ehi tu!" — modo amichevole di chiamare.', 'el glosario canario explica «chacho»: el ejemplo va entre comillas y no habla a quien usa la app'],
  ...[...ROTULOS_IT].map(t => ['it', t, 'rotulo de boton: en italiano el boton va en imperativo, como en castellano el infinitivo (ROTULOS_IT)']),
  /* el bulgaro (22 de octubre de 2026) */
  ['bg', '«Ей, ти!» — приятелско обръщение.', 'el glosario canario explica «chacho»: el ejemplo va entre comillas y no habla a quien usa la app'],
  ...[...ROTULOS_BG].map(t => ['bg', t, 'rotulo de boton: en bulgaro el boton va en imperativo, como en castellano el infinitivo (ROTULOS_BG)']),
  /* el polaco (22 de octubre de 2026) */
  ['pl', '«Hej, ty!» — żeby zawołać kogoś serdecznie.', 'el glosario canario explica «chacho»: el ejemplo va entre comillas y no habla a quien usa la app'],
  ...[...ROTULOS_PL].map(t => ['pl', t, 'rotulo de boton: en polaco el boton va en imperativo, como en castellano el infinitivo (ROTULOS_PL)']),
  ...[...VOZ_PL].map(t => ['pl', t, 'la voz de quien usa la app, como «Sorpréndeme» y «Llévame» (VOZ_PL)']),
  /* las curiosidades de las constelaciones (idiomas/cielo/, 22 de octubre de 2026) */
  ['it', /perché sia così carico di bestiame: porta una capra/, 'el auriga «porta una capra», «lleva una cabra»: tercera persona, no el imperativo (cieloCurConAur)'],
  ['pl', /błagała bogów o pomoc, a ci zmienili ją w klacz/, '«a ci zmienili»: «ci» es el demostrativo, «y estos la convirtieron», no «a ti» (cieloCurConEqu)'],
];

function exento(l, t) {
  return EXENTOS.some(([le, x]) => le === l && (x instanceof RegExp ? x.test(t) : x === t));
}
/* Una direccion no habla a nadie: el «es» de «tenerifeon.es» o de
   «aemet.es» no es el «tu es» del frances. El 22 de octubre de 2026 diez
   textos en frances contaban como pendientes solo por eso (las fichas de
   los senderos con Tenerife ON, AEMET, AESA…). Se quitan las direcciones
   antes de buscar; lo demas del texto se mira igual. */
const DIRECCION = /(?:https?:\/\/)?(?:[A-Za-z0-9-]+\.)+(?:es|com|org|net|eu|gal|info)\b(?:\/[^\s)»"”]*)?/gi;
function marca(l, t) {
  if (!MARCAS[l] || exento(l, t)) return null;
  /* el rotulo de un boton citado entre comillas no cuenta: «tocchi «Condividi»» */
  if (l === 'it') t = t.replace(/«([^»]+)»/g, (q, x) => ROTULOS_IT.has(x) ? ' ' : q);
  if (l === 'bg') t = t.replace(/[«„“]([^»“”]+)[»“”]/g, (q, x) => ROTULOS_BG.has(x) ? ' ' : q);
  /* y en polaco tambien en <b>: «wybrać <b>Zainstaluj aplikację</b>» */
  if (l === 'pl') t = t.replace(/[«„“]([^»“”]+)[»“”]/g, (q, x) => ROTULOS_PL.has(x) || VOZ_PL.has(x) ? ' ' : q)
    .replace(/<b>([^<]+)<\/b>/g, (q, x) => ROTULOS_PL.has(x) ? ' ' : q);
  /* los marcadores {dir}, {d}… no se ven: «{dir}» no es «dir» (22 de octubre) */
  t = t.replace(/\{\w+\}/g, ' ');
  /* ni las direcciones: el «es» de «tenerifeon.es» no es el «tu es» del frances (ver DIRECCION) */
  t = t.replace(DIRECCION, ' ');
  for (const re of MARCAS[l]) { const m = t.match(re); if (m) return m[0].trim(); }
  return null;
}

/* ── los textos ─────────────────────────────────────────────────────────── */
const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const json = f => JSON.parse(lee(f));
async function textos() {
  const out = [];
  const mete = (o, k, l, t) => { if (typeof t === 'string' && t.trim()) out.push({ o, k: String(k), l, t }); };
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
  try {
    const p = await (await nav.newContext({ serviceWorkers: 'block' })).newPage();
    await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI_TX === 'object' && typeof LANGS === 'object', null, { timeout: 20000 });
    const vivo = await p.evaluate(() => ({ ui: UI_TX, langs: LANGS }));
    for (const [k, f] of Object.entries(vivo.ui)) for (const l of IDI) mete('index.html UI_TX', k, l, f && f[l]);
    const plano = (o, k, l) => { if (typeof o === 'string') mete('index.html LANGS', k, l, o); else if (o && typeof o === 'object') for (const [kk, v] of Object.entries(o)) plano(v, k + '.' + kk, l); };
    for (const l of Object.keys(vivo.langs)) for (const [k, t] of Object.entries(vivo.langs[l])) plano(t, k, l);
  } finally { await nav.close(); }
  const index = lee('index.html');
  const linea = i => index.slice(0, i).split('\n').length;
  const cadena = (q, cuerpo) => { try { return vm.runInNewContext(q + cuerpo + q); } catch (e) { return cuerpo; } };
  for (const m of index.matchAll(/(?:^|[{,\s])["']?(es|en|fr|de|it|nl|zh|zht|bg|pl)["']?\s*:\s*(["'])((?:\\.|(?!\2)[^\\\n])*)\2/g)) {
    mete('index.html', 'linea ' + linea(m.index), m[1], cadena(m[2], m[3]));
  }
  /* y las tablas de un idioma entero, «es: { clave: '…', … }» (las frases del
     asistente, la instalacion, el mar, el GPX…): del
     «{» a su pareja, saltando lo que va entre comillas, y dentro cada
     «clave: 'texto'» y cada texto de una lista */
  for (const m of index.matchAll(/(?:^|[{,\s])["']?(es|en|fr|de|it|nl|zh|zht|bg|pl)["']?\s*:\s*\{/g)) {
    const ini = m.index + m[0].length - 1;
    let i = ini, prof = 0, q = null;
    for (; i < index.length; i++) {
      const c = index[i];
      if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === '`') q = c;
      else if (c === '{') prof++;
      else if (c === '}' && --prof === 0) break;
    }
    const cuerpo = index.slice(ini, i + 1);
    for (const p of cuerpo.matchAll(/([A-Za-z_$][\w$]*|"[^"\n]+"|'[^'\n]+')\s*:\s*(["'])((?:\\.|(?!\2)[^\\\n])*)\2|[\[,]\s*(["'])((?:\\.|(?!\4)[^\\\n])*)\4(?=\s*[,\]])/g)) {
      const t = p[2] ? cadena(p[2], p[3]) : cadena(p[4], p[5]);
      mete('index.html', 'linea ' + linea(ini + p.index) + (p[1] ? ' · ' + p[1].replace(/["']/g, '') : ''), m[1], t);
    }
  }
  for (const l of IDI.filter(l => l !== 'es')) {
    for (const [id, v] of Object.entries(json('idiomas/' + l + '.json'))) for (const [kk, t] of Object.entries(v)) mete('idiomas/' + l + '.json', id + '.' + kk, l, t);
  }
  for (const l of IDI) {
    for (const [k, t] of Object.entries(json('idiomas/privacidad/' + l + '.json'))) mete('idiomas/privacidad/' + l + '.json', k, l, t);
    const pf = 'idiomas/paginas/' + l + '.json';
    if (fs.existsSync(path.join(RAIZ, pf))) for (const [k, t] of Object.entries(json(pf))) mete(pf, k, l, t);
    const bc = 'idiomas/borrar-cuenta/' + l + '.json';
    if (fs.existsSync(path.join(RAIZ, bc))) for (const [k, t] of Object.entries(json(bc))) mete(bc, k, l, t);
    for (const e of json('faq/' + l + '.json').e || []) { mete('faq/' + l + '.json', e.id + ' (rotulo)', l, e.l); mete('faq/' + l + '.json', e.id, l, e.a); if (e.n) mete('faq/' + l + '.json', e.id + ' (app)', l, e.n); }
  }
  const recorre = (o, ruta, l) => { if (typeof o === 'string') { if (l) mete('datos/app-store/ficha.json', ruta, l, o); } else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) recorre(v, ruta ? ruta + '.' + k : k, IDI.includes(k) ? k : l); };
  recorre(json('datos/app-store/ficha.json'), '', null);
  const fr = json('frases.json');
  for (const l of IDI) mete('frases.json', 'titulo', l, fr.titulo && fr.titulo[l]);
  (fr.frases || []).forEach((x, i) => { for (const l of IDI) mete('frases.json', 'frase ' + (i + 1), l, x[l]); });
  /* las etiquetas de las fichas: las castellanas son las de tags[] y las
     claves de idiomas/etiquetas/; cada idioma, su traduccion */
  const etiq = new Set();
  for (const m of index.matchAll(/\btags:\s*\[([^\]]*)\]/g)) for (const t of m[1].matchAll(/"([^"\n]+)"|'([^'\n]+)'/g)) etiq.add(t[1] || t[2]);
  for (const l of IDI.filter(l => l !== 'es')) {
    const ef = 'idiomas/etiquetas/' + l + '.json';
    if (fs.existsSync(path.join(RAIZ, ef))) for (const [k, t] of Object.entries(json(ef))) { etiq.add(k); mete(ef, k, l, t); }
  }
  for (const t of etiq) mete('etiquetas (tags[])', t, 'es', t);
  /* las filas de los modulos de carga perezosa (CIELO_UI, PERFIL_UI y, desde
     el 22 de octubre de 2026, EMERG_UI del panel SOS), una por linea */
  for (const f of ['modulos/cielo.js', 'modulos/perfil.js', 'modulos/emergencias.js']) {
    for (const m of lee(f).matchAll(/^\s*"?([A-Za-z0-9_-]+)"?: (\{"es": .*\}),?\s*$/gm)) {
      let d; try { d = JSON.parse(m[2]); } catch (e) { continue; }
      for (const l of IDI) mete(f, m[1], l, d[l]);
    }
  }
  /* las 88 curiosidades de las constelaciones, un fichero por idioma desde el 22 */
  for (const l of IDI) {
    const f = 'idiomas/cielo/' + l + '.json';
    if (fs.existsSync(path.join(RAIZ, f))) for (const [k, t] of Object.entries(json(f))) mete(f, k, l, t);
  }
  return out;
}

(async () => {
  const todos = await textos();
  if (TODOS && TODOS_F) fs.writeFileSync(TODOS_F, JSON.stringify(todos.filter(y => y.l === TODOS), null, 1));
  console.log('=== el trato de usted, en los ' + IDI.length + ' idiomas ===');
  console.log('  textos leidos: ' + todos.length);
  let mal = 0;
  const lista = [];
  for (const l of IDI) {
    if (!MARCAS[l]) { console.log('  ' + l.padEnd(4) + 'sin trato que distinguir (el ingles)'); continue; }
    const vistos = new Set(), hits = [];
    for (const x of todos.filter(y => y.l === l)) {
      const clave = x.o + '\u0000' + x.t; if (vistos.has(clave)) continue; vistos.add(clave);
      const m = marca(l, x.t); if (m) hits.push(Object.assign({ m }, x));
    }
    const distintos = new Set(hits.map(h => h.t)).size;
    if (HECHOS.includes(l)) {
      if (hits.length) mal++;
      console.log((hits.length ? '  MAL  ' : '  OK   ') + l.padEnd(4) + (hits.length ? distintos + ' texto(s) que tutean' : 'todo de usted'));
      for (const h of hits.slice(0, 40)) console.log('         [' + h.o + ' · ' + h.k + '] «' + h.m + '»  ' + h.t.slice(0, 140));
    } else {
      console.log('  --   ' + l.padEnd(4) + 'pendiente: ' + distintos + ' texto(s) con marcas de tuteo');
    }
    if (LISTA === l) lista.push(...hits);
  }
  if (LISTA && LISTA_F) { fs.writeFileSync(LISTA_F, JSON.stringify(lista, null, 1)); console.log('  lista de ' + LISTA + ': ' + lista.length + ' en ' + LISTA_F); }
  console.log(mal ? '\n*** ' + mal + ' idioma(s) con tuteo ***' : '\n  todo en verde');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
