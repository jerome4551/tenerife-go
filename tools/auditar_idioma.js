#!/usr/bin/env node
/* auditar_idioma.js — UN idioma, de arriba abajo.
 *
 * POR QUE HACE FALTA: revisar_traduccion.py revisa una TANDA antes de
 * meterla, y solo se ha usado con el bulgaro. Los otros siete idiomas
 * entraron antes de que ese revisor existiera, asi que sus 1.741 textos de
 * lugar nunca han pasado por ninguna comprobacion: un ⚠️ perdido, una cifra
 * cambiada o un horario distinto llevan ahi desde el primer dia.
 *
 * Mira lo que se puede perder SIN QUE NADIE LO NOTE, no si suena bien:
 *   · un aviso ⚠️ que desaparece        el peligro deja de avisarse
 *   · una cifra que cambia              300 plazas pasan a ser 30
 *   · un horario distinto               el turista llega y esta cerrado
 *   · un {marcador} que se pierde       sale "{n} plazas" literal
 *   · etiquetas HTML descuadradas       el <b> se come el resto del texto
 *   · texto identico al castellano      se quedo sin traducir
 *   · alfabeto que no toca              cirilico en aleman, han en frances
 *   · demasiado corto o demasiado largo se comio o se invento una frase
 *
 *     node tools/auditar_idioma.js de
 *     node tools/auditar_idioma.js de --lista     todos los casos, no 6
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const LANG = (process.argv[2] || '').toLowerCase();
const LISTA = process.argv.indexOf('--lista') !== -1;

/* Los idiomas salen del fuente, no de una lista escrita aqui: una lista
   repetida a mano envejece sola y el dia que entra un idioma nuevo el control
   sigue dando verde sin haberlo mirado. */
function idiomasDelFuente(src, conCastellano) {
  const l = ((src.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
    .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  if (!l.length) { console.error('no se encuentra SUPPORTED_LANGS en index.html'); process.exit(2); }
  return conCastellano ? l : l.filter(x => x !== 'es');
}
const IDI = idiomasDelFuente(
  fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8'), true);
if (IDI.indexOf(LANG) === -1) {
  console.log('uso: node tools/auditar_idioma.js <' + IDI.join('|') + '> [--lista]');
  process.exit(2);
}

/* ── que alfabeto le toca a cada uno ──────────────────────────────────────
   No es un adorno: un texto en cirilico dentro del aleman, o un han dentro
   del frances, es una fila pegada en el sitio equivocado. */
const ESCRITURA = {
  es:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  en:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  fr:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  de:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  it:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  nl:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  zh:  { debe: /[一-鿿]/, prohibe: /[Ѐ-ӿ]/ },
  zht: { debe: /[一-鿿]/, prohibe: /[Ѐ-ӿ]/ },
  bg:  { debe: /[Ѐ-ӿ]/, prohibe: null },
  pl:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ }
};
/* Sin fila, la lectura daba un TypeError, y dentro de `| head -4` en
   tools/auditar.sh el idioma nuevo se quedaba sin control sin que se viera.
   Un idioma que entra y no tiene fila aqui tiene que pararlo en seco. */
if (!ESCRITURA[LANG]) {
  console.error('auditar_idioma: ' + LANG + ' no tiene fila en ESCRITURA. Anadela.');
  process.exit(2);
}
/* Cuanto puede encoger una traduccion respecto al castellano antes de que
   sea sospechosa. El chino escribe lo mismo en la mitad de caracteres, asi
   que un unico numero para los ocho daria falsas alarmas a mansalva. */
const MINIMO = { en: 0.5, fr: 0.55, de: 0.5, it: 0.55, nl: 0.5, zh: 0.18, zht: 0.18, bg: 0.45, pl: 0.45 };

/* ── NORMALIZAR ANTES DE COMPARAR ────────────────────────────────────────
   Comparar las cifras en crudo no vale, y no por poco: en ingles dio 73
   diferencias de las que casi todas eran mias. Tres motivos, y los tres hay
   que quitarlos SIN dejar de mirar lo que tapan.

   1. El reloj. El castellano escribe 13:00-19:00 y el ingles 1pm-7pm. Son
      la misma hora. Borrarlas y ya seria perder justo lo que mas duele -un
      horario mal traducido manda al turista a una puerta cerrada-, asi que
      se pasan las dos a minutos desde medianoche y se comparan de verdad.
      En "1-4pm" el 1 no lleva meridiano: lo hereda del 4.
   2. El telefono. El castellano pone "922 57 48 06" y el ingles le anade el
      prefijo "+34". Se saca aparte, se le quita el 34 y todo lo que no sea
      digito, y se comparan los numeros que quedan.
   3. Los siglos. "siglo XVII" en ingles es "17th century". El numero romano
      se pasa a arabigo en los dos lados. */
const ROMANOS = { M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1 };
function romanoANumero(r) {
  let n = 0, i = 0;
  while (i < r.length) {
    const dos = r.substr(i, 2);
    if (ROMANOS[dos]) { n += ROMANOS[dos]; i += 2; }
    else if (ROMANOS[r[i]]) { n += ROMANOS[r[i]]; i++; }
    else return null;
  }
  return n;
}
const enMinutos = (h, m, mer) => {
  h = Number(h); m = Number(m || 0);
  if (mer === 'pm' && h < 12) h += 12;
  if (mer === 'am' && h === 12) h = 0;
  /* Las 24:00 y las 00:00 son la misma hora escrita de dos maneras: el
     castellano cierra "9:00-00:00h" y el chino "9:00至24:00". */
  if (h === 24 && m === 0) h = 0;
  return h * 60 + m;
};
function sacarHoras(txt, esCampoHoras) {
  const out = [];
  let t = String(txt);
  const mete = (h, m, mer) => { out.push(enMinutos(h, m, mer)); };


  /* 1. RANGO CON MERIDIANO AL FINAL, que es como escribe el ingles:
        "1-4pm", "7:30-11pm", "9am-10pm". El primero hereda del segundo. */
  t = t.replace(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*[-–—]\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/gi,
    (m, h1, m1, mer1, h2, m2, mer2) => {
      mer2 = mer2.toLowerCase();
      mete(h1, m1, (mer1 || mer2).toLowerCase());
      mete(h2, m2, mer2);
      return ' ';
    });

  /* 2. RANGO DE 24 H CON SUFIJO, que es como escribe casi todo lo demas:
        "7-16h", "7h-22h", "de 9 a 22h", "7-16 Uhr", "7-16 uur".
        El sufijo puede estar en los dos numeros o solo en el segundo, y el
        separador puede ser un guion o la palabra "a"/"to"/"bis"/"tot".
        MARCA HACE FALTA, PERO VALE CUALQUIERA DE LAS CUATRO: la h de
        cualquiera de los dos numeros o los minutos de cualquiera de los
        dos. El castellano escribe "L-V 7-15:30" y el aleman "11:30-16",
        cada uno con la marca en un sitio distinto, y pidiendola siempre en
        el segundo se perdia la mitad del horario. Si no hay ninguna de las
        cuatro NO es un horario y se deja quieto: "10-15 min", "4-5
        personas" y "de 10 a 15 minutos" no son horas de apertura.
        NADA DE \b AL FINAL. El \b de JavaScript es del alfabeto ingles: la
        "r" de "Uhr" le vale, pero la "ч" del bulgaro y el 时 del chino no
        son letra para el, asi que detras de ellas NUNCA hay frontera y esas
        dos lenguas no tenian horario que valiera. "от 9 до 22 ч" se leia
        como si no hubiera ninguna hora. Ahora (?![\p{L}\p{N}]) con la u.
        Y "до" es el "a" del bulgaro, que tambien faltaba.
        Los dos puntos van dentro del no-quiero: en "13:00-17:00及19:00" el
        chino pega una letra detras, la regla daba marcha atras y se comia
        "13:00-17" dejando suelto un ":00" que luego contaba como el numero
        00.
        OJO: el rango no puede arrancar en los MINUTOS de otra hora. En
        "Sam 9h15-14h" arrancaba en el "15" y apuntaba una apertura a las
        tres de la tarde que nadie habia escrito; de ahi el (?<![\dh:]),
        que ademas impide arrancar dentro de una cifra: sin el, en
        "8h30-21h" arrancaba en el "0" del 30 y abria a medianoche.
        Y EL "uur" NEERLANDES TAMPOCO CUENTA, por lo mismo: en neerlandes
        "uur" es la hora del reloj Y la hora de duracion, asi que "5-6 uur"
        son cinco o seis horas de sendero, no de cinco a seis de la manana.
        Estaba en la lista y cantaba nueve senderos seguidos en los que el
        neerlandes decia exactamente lo mismo que el castellano. Quitandolo,
        nl pasa de 15 hallazgos a 9 y ningun otro idioma se mueve.
        OJO TAMBIEN: la palabra "horas" NO cuenta. "5-6 horas" es lo que dura un
        sendero, no la hora a la que abre, y meterla dio catorce falsas
        alarmas seguidas. */
  t = t.replace(
    /(?<![\dh:])(\d{1,2})(?::(\d{2}))?\s*(h|Uhr|ч|時|时)?\s*(?:[-–—]|\ba\b|\bto\b|\bbis\b|\btot\b|\balle\b|\bhasta\b|до)\s*(\d{1,2})(?::(\d{2}))?\s*(h|Uhr|u|ч|時|时)?(?![\p{L}\p{N}:])/giu,
    (m, h1, m1, u1, h2, m2, u2) => {
      if (!m1 && !m2 && !u1 && !u2) return m;               // "10-15 min" no es un horario
      if (Number(h1) > 23 || Number(h2) > 23) return m;     // "24h" no es una hora
      mete(h1, m1, null); mete(h2, m2, null);
      return ' ';
    });


  /* 2b. EL RELOJ A LA FRANCESA: "10h00", "5 h 00". En frances esa es LA
        forma de escribir la hora, y el castellano la escribe "10:00". Sin
        esta regla cada horario del frances salia dos veces: como hora que
        falta y como cifra que sobra.

        Antes se probo a leer "XhYY" en TODOS los idiomas y hubo que quitarlo:
        el problema es que "1h40" no es una hora, es lo que dura una ruta en
        bici, y el castellano tambien lo escribe asi. Leyendolo en todas
        partes, el castellano perdia ese "1h40" y el aleman -que escribe
        "1 Std. 40"- no lo perdia, asi que la comparacion cantaba. Arreglaba
        20 casos en frances y rompia 30 en aleman, neerlandes, chino y
        bulgaro.

        Lo que hace honesta a esta version es que se aplica A LOS DOS LADOS
        de la comparacion y SOLO cuando el idioma comparado es el frances.
        "1h40" se sigue leyendo mal -como la 1:40- pero se lee igual de mal
        en el castellano y en el frances, los dos tokens salen identicos y
        no nace ningun hallazgo. Un error simetrico se anula; el de antes
        era asimetrico y por eso mentia.

        Los minutos son optativos -"Lun-Ven 8h-19h30" lleva las dos formas
        en la misma linea- y la "h" tiene que ir PEGADA a la cifra. Eso
        ultimo no es cosmetico: en este corpus las 41 apariciones de "N h"
        con espacio son todas "N heures", o sea duraciones de sendero, y
        ninguna es una hora del reloj.
 */
  if (LANG === 'fr') {
    t = t.replace(/(?<![\d:])(\d{1,2})h(\d{2})?(?![\d:])/g, (m, h, mm) => {
      if (Number(h) > 23) return m;
      mete(h, mm, null);
      return ' ';
    });
  }

  /* 2c. LA HORA A LA CHINA: "9点", "22点前". El 点 es la marca de la hora,
        igual que el "Uhr" aleman, y sin leerlo el "de 9 a 22h" del
        castellano salia como horario perdido. */
  if (LANG === 'zh' || LANG === 'zht') {
    t = t.replace(/(?<![\d:])(\d{1,2})\s*[点點時时]/g, (m, h) => {
      if (Number(h) > 24) return m;
      mete(h, null, null);
      return ' ';
    });
  }

  /* 3. SUELTAS CON MERIDIANO: "1pm", "11:30am" */
  t = t.replace(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/gi,
    (m, h, mm, mer) => { mete(h, mm, mer.toLowerCase()); return ' '; });

  /* 3b. EN EL CAMPO `hours`, UN RANGO PELADO ES UN HORARIO.
        "Mon-Fri 8-19" no lleva sufijo ninguno, pero en un campo que solo
        contiene horarios no puede ser otra cosa. Fuera de ese campo NO se
        aplica: "4-5 personas" o "10-15 min" romperian la cuenta. */
  if (esCampoHoras) {
    t = t.replace(/(?<![\d:])(\d{1,2})(?:[:.](\d{2}))?\s*[-–—]\s*(\d{1,2})(?:[:.](\d{2}))?(?![\d:])/g,
      (m, h1, m1, h2, m2) => {
        if (Number(h1) > 23 || Number(h2) > 23) return m;
        mete(h1, m1, null); mete(h2, m2, null);
        return ' ';
      });
  }

  /* 3c. LA HORA SUELTA CON SU PALABRA: "17 Uhr", "20 uur", "17 ч".
        El aleman escribe "9-14 Uhr (Fr bis 17 Uhr)" y ese 17 se quedaba sin
        leer, mientras que el "hasta 17:00" del castellano si se leia.
        SOLO "Uhr". Se probo tambien con "uur" y con "ч" y hubo que
        quitarlos, porque en neerlandes y en bulgaro esa misma palabra es la
        hora del reloj Y la hora de duracion: "2 uur" son las dos o son dos
        horas, y con la regla puesta el neerlandes pasaba de 54 hallazgos a
        93. El aleman no tiene ese problema porque la duracion es "Stunde" y
        la hora es "Uhr", dos palabras distintas. Y nunca con la "h" pelada:
        "3h" es lo que dura un sendero.
        (En frances la regla 2b ya lee "20h", y lo hace en los dos lados de
        la comparacion a la vez, que es lo que la hace valida alli.)

        DOS PRUEBAS MAS QUE NO SE QUEDARON, medidas hoy y anotadas para que
        nadie las vuelva a intentar a ciegas:
          leer "Nh" en TODOS los idiomas, no solo en frances:
            nl 54->89, zh 50->85, bg 27->62, it 108->117, de 54->58.
          leer el "hasta 20h" del castellano por la preposicion que lleva
          delante: arreglaba 4 y rompia 8 -it 108->110, nl 54->56,
            zh 50->52, bg 27->29- porque el idioma de enfrente muchas veces
            escribe "fino alle 20" sin marca ninguna. */
  t = t.replace(/(?<![\d:])(\d{1,2})(?::(\d{2}))?\s*Uhr\b/g,
    (m, h, mm) => {
      if (Number(h) > 23) return m;
      mete(h, mm, null);
      return ' ';
    });

  /* 4. Y EL RELOJ DE 24 H CON DOS PUNTOS: "13:00" */
  t = t.replace(/(\d{1,2}):(\d{2})/g, (m, h, mm) => { mete(h, mm, null); return ' '; });

  return [out.sort((x, y) => x - y), t];
}
function sacarTelefonos(txt) {
  const out = [];
  const t = String(txt).replace(/☎\s*([+\d][\d\s().-]{6,})/g, (m, num) => {
    out.push(num.replace(/[^\d]/g, '').replace(/^34(?=\d{9})/, ''));
    return ' ';
  });
  return [out.sort(), t];
}
function sinRomanos(txt) {
  /* NI \b NI /i EN ESTAS REGLAS, y las dos cosas por el mismo motivo.
     El \b de JavaScript es de alfabeto ingles: para el, la "e" con tilde no
     es letra, asi que "denivel|es. Departa" tiene frontera de palabra justo
     antes de la "s" final y "ss?\." se comia ese "s." como si fuera
     "siglo". Con /i encima, el numero romano podia ser minuscula. Las dos
     cosas juntas convertian "denivels. Depart" en " 500 epart" y el control
     comparaba un texto que se habia inventado el mismo: un 500 en Roques de
     Garcia y un 501 en el mirador de La Ruleta que no estaban en ningun
     sitio. Es exactamente el desastre contra el que avisa el comentario de
     abajo, pero entrando por la puerta de atras.
     Por eso ahora: (?<!\p{L}) delante -ninguna letra, con tilde o sin ella-,
     (?!\p{L}) detras, y el numero romano SIEMPRE en mayuscula. */
  return String(txt)
    /* "siglo XVI-XVII" es un rango y lleva DOS numeros. El frances lo
       escribe "XVIe-XVIIe siecle", con marca en los dos, asi que leyendo
       solo el primero en castellano la comparacion cantaba un 17 de mas
       que si estaba en los dos textos. */
    .replace(/(?<!\p{L})(?:[Ss]iglos?|[Ss]s?\.)\s*([IVXLCDM]{1,7})(?:\s*[-–—]\s*([IVXLCDM]{1,7}))?(?!\p{L})/gu,
      (m, r, r2) => {
        const n = romanoANumero(r);
        if (!n) return m;
        const n2 = r2 ? romanoANumero(r2) : 0;
        return ' ' + n + ' ' + (n2 ? n2 + ' ' : '');
      })
    /* Y la forma abreviada, que es la que usa cada idioma en un rotulo
       corto: "XVIIe" en frances, "XVII sec." en italiano, "17. Jhd." en
       aleman. Sin esto, "Castillo · S. XVII" parecia perder el 17.
       El polaco deja el numero en romano -"z XVII wieku", "XVII w."- y sin
       su marca los 48 siglos del catalogo salian como cifra que falta. */
    /* El sufijo es OBLIGATORIO. Se probo dejarlo opcional para coger
       "XVIIe" y salio caro: sin sufijo la regla convierte CUALQUIER palabra
       que se lea como numero romano, y "PADI 5★ IDC" pasaba a "PADI 5★ 601"
       -I=1, D=500, C=100- antes de comparar nada. Una regla que cambia el
       texto que va a mirar es lo peor que puede tener un control. La forma
       francesa "XVIIe" va en su propia alternativa, con la e de marca. */
    .replace(/(?<!\p{L})([IVXLCDM]{2,7})(?:\s*[-–—]\s*([IVXLCDM]{2,7}))?\.?\s*(?:century|C\.|Jahrhundert|Jhd\.?|siècle|s\.|secolo|sec\.|eeuw|wieku|wiek|w\.|век|世纪|世紀)/gu,
      (m, r, r2) => {
        const n = romanoANumero(r);
        if (!n) return m;
        const n2 = r2 ? romanoANumero(r2) : 0;
        return ' ' + n + ' ' + (n2 ? n2 + ' ' : '');
      })
    .replace(/(?<!\p{L})([IVXLCDM]{2,7})(?:e|er|ème)(?!\p{L})/gu,
      (m, r) => { const n = romanoANumero(r); return n ? ' ' + n + ' ' : m; });
}
const reloj = ms => ms.map(m => String(Math.floor(m / 60)).padStart(2, '0') + ':' +
                                String(m % 60).padStart(2, '0')).join(' ');
/* El chino no escribe 210.000: escribe 21万, que son 21 decenas de millar.
   Y 3,5万 son 35.000. Sin esto, cada cifra grande en chino parecia perdida. */
function sinMiriadas(t) {
  return String(t).replace(/(\d+(?:[.,]\d+)?)\s*[万萬]/g, (m, n) =>
    ' ' + Math.round(parseFloat(String(n).replace(',', '.')) * 10000) + ' ');
}
const cifras = s => {
  s = sinMiriadas(sinRomanos(String(s)));
  /* El separador de millares cambia con el idioma: 1.024 en castellano,
     1,024 en ingles y 1 024 -con espacio- en frances y bulgaro. Se quitan
     los tres, o "1 024" se leia como el numero 024 y no casaba con nada. */
  s = s.replace(/(?<=\d)[\s  ](?=\d{3}(?!\d))/g, '');
  s = s.replace(/[.,]/g, '');
  return (s.match(/\d{2,}/g) || []).sort();
};
const marcas = s => (String(s).match(/\{[a-z]+\}/gi) || []).sort();
const etiquetas = s => {
  const o = (String(s).match(/<([a-z]+)(?:\s[^>]*)?>/gi) || []).map(x => x.replace(/[<>/]|\s.*/g, '').toLowerCase());
  const c = (String(s).match(/<\/([a-z]+)>/gi) || []).map(x => x.replace(/[<>/]/g, '').toLowerCase());
  return o.sort().join(',') + '|' + c.sort().join(',');
};
const igual = (a, b) => String(a).replace(/\s+/g, ' ').trim() === String(b).replace(/\s+/g, ' ').trim();

/* ── cuando salir igual que el castellano NO es un fallo ────────────────────
   Las etiquetas `cat` son del tipo "Guachinche · La Orotava". Salen iguales
   por tres motivos legitimos y uno ilegitimo, y el control solo sirve si
   distingue los cuatro:
     el nombre del sitio        La Orotava, Santa Cruz, Tegueste
     la medida o el codigo      8,4 km · 1.400 m · PR-TF 6.1 · WSWCF
     la palabra que de verdad   el italiano dice "Farmacia" y "Museo" igual
       se escribe igual         que el castellano; el aleman dice "Zoo"
     el descuido                el aleman ponia "Kalistheniks", que no
                                existe, y "Minimarket" en vez de "Minimarkt"
   Los tres primeros se declaran; lo que no esta declarado se canta. Asi el
   dia que alguien deje una etiqueta sin traducir, se ve.

   IGUAL_OK se declara POR IDIOMA a proposito. "Farmacia" vale en italiano y
   no vale en aleman, y una lista comun habria tapado justo el descuido que
   se acaba de encontrar. */
const IGUAL_OK = {
  en: ['Guachinche', 'Golf', 'Minigolf', 'Surf', 'Kayak', 'Fitness', 'Running',
       'Marina', 'Street Workout', 'Skatepark', 'Skate', 'Windsurf', 'Karting',
       'Zoo', 'MTB', 'Caldera', 'Boulevard', 'Modernista'],
  fr: ['Guachinche', 'Golf', 'Minigolf', 'Surf', 'Kayak', 'Fitness', 'Running',
       'Marina', 'Street Workout', 'Skatepark', 'Skate', 'Windsurf', 'Kitesurf',
       'Karting', 'Zoo', 'Parapente', 'Camping', 'Boulevard', 'Modernista',
       'Resort de Golf', 'Real Club Náutico'],
  de: ['Guachinche', 'Golf', 'Minigolf', 'Fitness', 'Running', 'Marina',
       'Street Workout', 'Skatepark', 'Skate', 'Windsurf', 'Karting', 'Zoo',
       'MTB', 'Caldera', 'Boulevard', 'Modernista', 'Real Club Náutico'],
  it: ['Guachinche', 'Golf', 'Minigolf', 'Surf', 'Kayak', 'Fitness', 'Running',
       'Marina', 'Street Workout', 'Skatepark', 'Skate', 'Windsurf', 'Kitesurf',
       'Karting', 'Zoo', 'MTB', 'Caldera', 'Boulevard', 'Modernista',
       'Real Club Náutico', 'Minimarket 24h',
       /* el italiano escribe estas igual que el castellano, no es un olvido */
       'Farmacia', 'Farmacia 24h', 'Museo', 'Museo del Vino', 'Faro',
       'Faro Moderno', 'Teatro', 'Piscina', 'Patrimonio', 'Patrimonio UNESCO',
       'Convento', 'Santuario', 'Ambulatorio', 'Turismo', 'Cala', 'Centro',
       'Calistenia', 'Calistenia Kenguru Pro', 'D.O.', 'Noroeste', 'Medio'],
  nl: ['Guachinche', 'Golf', 'Minigolf', 'Kayak', 'Fitness', 'Marina',
       'Street Workout', 'Skatepark', 'Windsurf', 'Caldera', 'Camping',
       'Modernista', 'Real Club Náutico', 'D.O.'],
  zh: [], zht: [], bg: [],
  /* el polaco escribe estas igual: son la palabra polaca -karting, zoo,
     marina, skatepark- o no tienen ninguna, como guachinche */
  pl: ['Guachinche', 'Karting', 'Zoo', 'Marina', 'Skatepark']
};

/* Barrios y sitios que solo salen en medio de la etiqueta y por eso no los
   pilla la cosecha automatica, que mira el ultimo trozo. Son nombres
   propios: se escriben igual en cualquier idioma de alfabeto latino. */
const LUGARES_EXTRA = ['La Granja', 'La Manzanilla', 'Barmanía', 'Chimisay',
                       'Anaga', 'Teno', 'Vilaflor'];

/* Rotulos de la interfaz que este idioma deja igual a proposito. El frances
   traduce "Friendly Zone" y el ingles no puede; el ingles dice "Bundle"
   donde el italiano dice "Pack". Por eso, otra vez, por idioma. */
const IGUAL_UI = {
  en: ['Friendly Zone 🐾', '🏪 Tenerife Go Shop'],
  fr: ['Pack Tenerife Go'],
  de: ['Friendly Zone 🐾', '🏪 Tenerife Go Shop'],
  it: ['Friendly Zone 🐾', 'Pack Tenerife Go'],
  nl: ['Friendly Zone 🐾'],
  zh: [], zht: [], bg: [],
  pl: ['Pets Friendly', 'Friendly Zone 🐾', '🏪 Tenerife Go Shop']
};

/* Los nombres de sitio no se declaran a mano: se sacan del propio catalogo.
   El ultimo trozo de cada `cat` en castellano es siempre el municipio o el
   barrio, asi que esa es la lista, y sale sola y al dia. */
const LUGARES = new Set();
/* Tambien las duraciones, que son medidas: "5-6h", "1h 40min", "4,5-5h".
   El italiano las escribe igual que el castellano porque son cifras. */
const MEDIDA = /^[~<>]?\s*\d[\d.,]*\s*(?:m|km|h|min|m²|hab\.?|€|%)?(?:\s*[-–—]\s*\d[\d.,]*\s*(?:m|km|h|min)?)?(?:\s*\d+\s*min)?\)?$/i;
const CODIGO = /^(?:[A-Z]{1,3}[-\s]?TF[-\s]?[\d.]+|[A-Z]{2,8}|GR-\d+|\d+(?:[.,]\d+)?\s*(?:km|m|h|min))$/;

/* El parentesis tambien parte: "Anaga (Medio · 4 km · 2,5h)" son cuatro
   cosas, no dos, y partiendo solo por el punto volado quedaba el pegote
   "Anaga (Medio", que no es ni un sitio ni una palabra. */
function trozos(t) { return String(t).split(/[·()]/).map(x => x.trim()).filter(Boolean); }
function trozoLegitimo(seg, lang) {
  if (!seg) return true;
  if (MEDIDA.test(seg) || CODIGO.test(seg)) return true;
  if (LUGARES.has(seg) || LUGARES_EXTRA.indexOf(seg) !== -1) return true;
  if ((IGUAL_UI[lang] || []).indexOf(seg) !== -1) return true;
  return (IGUAL_OK[lang] || []).indexOf(seg) !== -1;
}

/* ── los numeros escritos en chino ──────────────────────────────────────────
   El chino escribe "约五百米" donde el castellano pone "unos 500 m", y
   "四十多公里" donde pone "más de 40 km". Son traducciones correctas y
   naturales -mas naturales que poner la cifra-, pero el control las leia
   como numeros que faltaban: treinta avisos falsos.

   NO SE CONVIERTE EL CHINO A CIFRAS A LA BRAVA. Convertir cualquier
   secuencia de 一二三十百... inventaria numeros donde no los hay: 一起 es
   "juntos", 十分 es "muy", 第一 es "primero". Lo que se hace es al reves y
   solo va en un sentido: se coge cada numero QUE YA ESTA EN EL CASTELLANO,
   se escribe como lo escribiria el chino, y si esa forma aparece en la
   traduccion se pasa a cifras para poder compararla. Asi no puede nacer
   ningun numero que no estuviera antes en el original. */
const CHINO_DIG = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const CHINO_DIG_T = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function chinoDe(n) {
  const formas = new Set();
  const cifra = String(n);
  /* 1. la lectura normal: 500 -> 五百, 40 -> 四十, 15 -> 十五, 1.300 -> 一千三百 */
  const unidades = [[100000000, '亿'], [10000, '万'], [1000, '千'], [100, '百'], [10, '十']];
  function leer(x) {
    if (x === 0) return '';
    for (const [v, u] of unidades) {
      if (x >= v) {
        const alto = Math.floor(x / v), bajo = x % v;
        const cab = (v === 10 && alto === 1) ? '' : leer(alto);   // 15 es 十五, no 一十五
        return cab + u + (bajo === 0 ? '' : (bajo < v / 10 ? '〇' : '') + leer(bajo));
      }
    }
    return CHINO_DIG[x];
  }
  const normal = leer(Number(n));
  if (normal) {
    formas.add(normal);
    formas.add(normal.replace(/〇/g, '零'));
    if (/^一[十百千万]/.test(normal)) formas.add(normal.slice(1));   // 100 tambien es 百
  }
  /* 2. la lectura cifra a cifra, que es como se dicen los años: 2018 -> 二〇一八 */
  if (cifra.length === 4) {                      // 二〇一八 es como se dice un año
    formas.add([...cifra].map(c => CHINO_DIG[Number(c)]).join(''));
    formas.add([...cifra].map(c => CHINO_DIG_T[Number(c)]).join(''));
  }
  return [...formas];
}
/* El castellano escribe "50 millones" con la palabra y el chino "5000万"
   con la cifra entera. sinMiriadas ya desarma el 万; esto desarma el
   "millones" del otro lado para que los dos digan lo mismo. */
function sinMillones(txt) {
  return String(txt).replace(/(\d+(?:[.,]\d+)?)\s*(?:millones|millón|million|millions|Millionen|milioni|milione|miljoen|milioane|milionów|miliony|miliona|milion|милиона|милион)(?![\p{L}])/giu,
    (m, n) => ' ' + Math.round(Number(String(n).replace(',', '.')) * 1e6) + ' ');
}

/* LAS VEINTICUATRO HORAS DICHAS CON PALABRAS.
   Aleman y bulgaro escriben "24h" y "24 ч": la cifra esta y se compara
   sola. El polaco no la escribe: dice "całodobowy", "całą dobę", que es
   exactamente lo mismo y no ha perdido nada. Sin esto salian 17 avisos
   seguidos sobre textos bien escritos, y la unica forma de callarlos
   habria sido empeorar el polaco para que le cuadre a la herramienta.
   Se convierte en la cifra por los dos lados, no se borra: si el polaco
   dijera "całodobowy" donde el castellano no dice 24 horas, eso es una
   promesa que el original no hace y tiene que seguir cantando. */
function sinDobaPolaca(txt) {
  return String(txt).replace(/ca\u0142odobow\p{L}*|ca\u0142\u0105 dob\u0119|ca\u0142ej doby|ca\u0142\u0105 dob\u0105/giu, ' 24 ');
}

/* EL DESCUENTO A LA CHINA. En chino un descuento se dice por lo que se
   paga, no por lo que se quita: "9折" es pagar el 90%, o sea un 10% de
   descuento, y "5折" es la mitad. El castellano dice "10 % de descuento" y
   "50% de descuento", asi que sin esto salian tres avisos por tres textos
   que estaban perfectamente escritos. El 折 no significa otra cosa cuando
   lleva la cifra pegada delante. */
function sinDescuentoChino(txt) {
  return String(txt).replace(/(?<![\d.,])(\d{1,2}(?:[.,]\d)?)\s*折/g, (m, n) => {
    const x = Number(String(n).replace(',', '.'));
    /* "9折" es pagar 9 decimos; "95折" es pagar 95 centesimos; "9,5折" lo
       mismo escrito con coma. Lo que se paga, en tanto por ciento: */
    const paga = (x < 10) ? x * 10 : x;
    return ' ' + Math.round(100 - paga) + ' ';
  });
}

function conCifrasChinas(es, tr) {
  let t = String(tr);
  /* Los numeros salen del castellano YA SIN LAS HORAS ni los telefonos: si
     no, las cifras de un horario -"13:00-17:00"- se buscaban tambien en
     chino y metian por la puerta de atras un "01" o un "06" que nadie
     habia escrito. Y sin ceros a la izquierda, que no son un numero. */
  const numeros = String(es).replace(/[.,](?=\d{3}\b)/g, '').match(/\d+/g) || [];
  for (const n of [...new Set(numeros)].sort((a, b) => b.length - a.length)) {
    if (n.length < 2 || n[0] === '0') continue;
    for (const forma of chinoDe(n)) {
      /* "十" suelto NO vale: tambien es "muy" (十分) y "cruz" (十字). 百, 千
         y 万 sueltos si, que no significan otra cosa, y el chino los usa
         mucho: "不足百人" es "menos de 100 habitantes" y "百佳" es "entre
         las 100 mejores". */
      if (forma.length < 2 && forma !== '百' && forma !== '千' && forma !== '万') continue;
      if (t.includes(forma)) {
        /* SOLO LA PRIMERA. "百佳" son las 100 mejores y "百年葡萄园" son
           viñedos centenarios: la misma silaba, y el castellano solo dice
           un numero. Cambiandolas todas aparecia un 100 de mas. */
        t = t.replace(forma, ' ' + n + ' ');
        break;
      }
    }
  }
  return t;
}

/* El chino escribe los meses con numero -"12月" es diciembre, "4-6月" es de
   abril a junio- y el castellano con su nombre. Eso metia un 10, un 11 o un
   12 de mas en catorce fichas. Se quita el "N月" del chino SOLO si el
   castellano nombra ese mes: si el chino se inventara un mes que el
   castellano no dice, sigue cantando. */
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
               'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/* El castellano tambien abrevia: "abril-junio y oct-nov". Van solo las
   abreviaturas que no son otra palabra. "mar" NO esta, que es el mar, y
   marzo entero se reconoce igual; "may" tampoco hace falta, que mayo ya es
   corto. */
const MESES_CORTOS = ['ene', 'feb', null, 'abr', null, 'jun', 'jul',
                      'ago', 'sept?', 'oct', 'nov', 'dic'];
function nombraMes(bajo, k) {
  if (bajo.includes(MESES[k])) return true;
  const c = MESES_CORTOS[k];
  return c ? new RegExp('(?<![a-záéíóúñ])' + c + '(?![a-záéíóúñ])').test(bajo) : false;
}
function sinMesesChinos(es, tr) {
  const bajo = String(es).toLowerCase();
  let t = String(tr);
  /* Primero los rangos: "4-6月" es de abril a junio y "10-11月" de octubre
     a noviembre. Si se quitara solo el mes pegado al 月 quedaria suelto el
     primer numero del rango. */
  t = t.replace(/(?<![\d])(\d{1,2})\s*[-–—]\s*(\d{1,2})\s*月/g, (m, a, b) => {
    const na = Number(a), nb = Number(b);
    if (na < 1 || na > 12 || nb < 1 || nb > 12) return m;
    return (nombraMes(bajo, na - 1) && nombraMes(bajo, nb - 1)) ? ' ' : m;
  });
  MESES.forEach((nombre, k) => {
    if (!nombraMes(bajo, k)) return;
    t = t.replace(new RegExp('(?<![\\d])' + (k + 1) + '\\s*月', 'g'), ' ');
  });
  return t;
}

const ENLACE = /[\w.+-]+@[\w-]+\.[\w.]+|(?:https?:\/\/)?(?:[\w-]+\.)+(?:com|es|org|net|eu|io|info|dev)\b(?:\/[\w/.=&?%+-]*)?/gi;

const hallazgos = [];
const apunta = (tipo, donde, txt) => hallazgos.push({ tipo, donde, txt });

/* ── 1. los textos de lugar, que viven en idiomas/<lang>.json ───────────── */
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
function span(decl, abre) {
  const i = src.indexOf(decl), o = src.indexOf(abre, i);
  const cierra = abre === '[' ? ']' : '}';
  let d = 0, q = null;
  for (let k = o; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === abre) d++; else if (c === cierra) { d--; if (d === 0) return [o, k + 1]; }
  }
  throw new Error('no cierra ' + decl);
}
const [PI, PF] = span('const places = [', '[');
const PLACES = eval('(' + src.slice(PI, PF) + ')');
const CAMPOS = ['desc', 'cat', 'hours', 'aviso'];

/* La lista de nombres de sitio, sacada del catalogo y no escrita a mano: el
   ultimo trozo de cada `cat` es el municipio o el barrio. Se le suman los
   trozos que aparecen de ultimos en una ficha y de intermedios en otra
   -"La Granja" es barrio de Santa Cruz y sale en las dos posiciones-. */
for (const p of PLACES) {
  if (!p.cat || typeof p.cat.es !== 'string') continue;
  const t = p.cat.es.split('·').map(x => x.trim()).filter(Boolean);
  if (t.length > 1) LUGARES.add(t[t.length - 1]);
}
const trozo = (p, campo) => campo === 'aviso' ? (p.parking && p.parking.aviso) : p[campo];

let fuera = {};
if (LANG !== 'es') {
  const f = path.join(RAIZ, 'idiomas', LANG + '.json');
  if (!fs.existsSync(f)) { console.log('FALTA idiomas/' + LANG + '.json'); process.exit(1); }
  fuera = JSON.parse(fs.readFileSync(f, 'utf8'));
}

let nLugar = 0;
for (const p of PLACES) {
  for (const campo of CAMPOS) {
    const fila = trozo(p, campo);
    if (!fila || typeof fila.es !== 'string') continue;
    const es = fila.es;
    const tr = LANG === 'es' ? es : (fuera[p.id] || {})[campo];
    const donde = p.id + '.' + campo;
    if (typeof tr !== 'string' || !tr.trim()) { apunta('FALTA', donde, es.slice(0, 60)); continue; }
    nLugar++;
    mirar(es, tr, donde, campo);
  }
}

/* ── 2. los textos de interfaz, que siguen dentro de index.html ─────────── */
const pila = [], objetos = [];
for (let k = 0; k < src.length; k++) {
  const c = src[k];
  if (c === '"' || c === "'" || c === '`') { const q = c; for (k++; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) break; } continue; }
  if (c === '/' && src[k+1] === '/') { k = src.indexOf('\n', k); if (k < 0) break; continue; }
  if (c === '/' && src[k+1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
  if (c === '{') pila.push(k);
  else if (c === '}') { const a = pila.pop(); if (a !== undefined) objetos.push({ ini: a, fin: k + 1 }); }
}
objetos.sort((a, b) => (a.fin - a.ini) - (b.fin - b.ini));
/* ── EXCEPCIONES DECLARADAS EN EL PROPIO FUENTE ───────────────────────────
   Hay una tabla que NO se traduce y no es un descuido: wikiTitleOverrides
   son los titulos EXACTOS de articulo de Wikipedia, y un titulo inventado no
   devuelve el articulo, devuelve nada. La excepcion se declara al lado de la
   tabla con "SIN-TRADUCIR: <nombre>" y se lee desde aqui, igual que hacen
   barrido_idiomas.js y auditar_web.js. Sin esto, este control cantaba 15
   filas por idioma que ya estaban miradas y decididas: un control que avisa
   de lo que ya se sabe acaba leyendose por encima. */
const EXENTAS = [];
for (const m of src.matchAll(/SIN-TRADUCIR:\s*(\S+)/g)) {
  const nom = m[1];
  const decl = new RegExp('(?:const|let|var)\\s+' + nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*\\{');
  const d = decl.exec(src);
  if (!d) continue;
  const o = src.indexOf('{', d.index);
  let n = 0, qq = null, f = -1;
  for (let k = o; k < src.length; k++) {
    const c = src[k], pv = src[k - 1];
    if (qq) { if (c === qq && pv !== '\\') qq = null; continue; }
    if (c === '"' || c === "'" || c === '`') { qq = c; continue; }
    if (c === '{') n++; else if (c === '}') { n--; if (n === 0) { f = k + 1; break; } }
  }
  if (f > 0) EXENTAS.push({ nom, ini: o, fin: f });
}
const esExenta = o => EXENTAS.some(e => o.ini >= e.ini && o.fin <= e.fin);
const dentroYa = [];
let nUi = 0;
for (const o of objetos) {
  if (o.ini > PI && o.fin < PF) continue;                 // places[] ya mirado
  if (esExenta(o)) continue;                             // declarado en el fuente
  if (dentroYa.some(f => o.ini > f.ini && o.fin < f.fin)) continue;
  let v;
  try { v = eval('(' + src.slice(o.ini, o.fin) + ')'); } catch (e) { continue; }
  if (!v || typeof v !== 'object' || typeof v.es !== 'string') continue;
  dentroYa.push(o);
  const linea = src.slice(0, o.ini).split('\n').length;
  const tr = LANG === 'es' ? v.es : v[LANG];
  if (typeof tr !== 'string' || !tr.trim()) { apunta('FALTA', 'interfaz:' + linea, String(v.es).slice(0, 60)); continue; }
  nUi++;
  mirar(v.es, tr, 'interfaz:' + linea);
}

function mirar(es, tr, donde, campo) {
  if (('⚠️' in {}) === false) { /* nada: solo para que quede claro que se compara abajo */ }
  if (es.includes('⚠️') !== tr.includes('⚠️')) apunta('AVISO', donde, es.slice(0, 55));
  /* el orden importa: primero las horas, luego el telefono, y las cifras
     sobre lo que queda. Si no, un "13:00" cuenta ademas como el numero 13. */
  const esH = campo === 'hours';
  /* En `cat` NO se leen horas. Las seis etiquetas del catalogo con pinta de
     horario -"PR-TF 8 · Anaga (Exigente · 14 km · 5-6h)"- son las seis
     duraciones de un sendero, y ninguna es la hora a la que abre nada; leer
     "5-6h" como de cinco a seis de la manana cantaba seis horarios perdidos
     en chino, en un texto que estaba bien. Comprobado sobre las 771
     etiquetas: ninguna lleva horario de apertura. */
  const sinHoras = campo === 'cat';
  const [ha, esSinH] = sinHoras ? [[], es] : sacarHoras(es, esH);
  const [hb, trSinH] = sinHoras ? [[], tr] : sacarHoras(tr, esH);
  if (ha.join() !== hb.join()) apunta('HORAS', donde, reloj(ha) + ' vs ' + reloj(hb) + ' :: ' + es.slice(0, 45));
  const trChino = (LANG === 'zh' || LANG === 'zht') ? sinMesesChinos(es, conCifrasChinas(esSinH, sinDescuentoChino(trSinH))) : trSinH;
  const [ta, esSinT] = sacarTelefonos(esSinH), [tb, trSinT] = sacarTelefonos(trChino);
  if (ta.join() !== tb.join()) apunta('TELEFONO', donde, ta + ' vs ' + tb + ' :: ' + es.slice(0, 45));
  const trDoba = LANG === 'pl' ? sinDobaPolaca(trSinT) : trSinT;
  const a = cifras(sinMillones(esSinT)), b = cifras(sinMillones(trDoba));
  if (a.join() !== b.join()) apunta('CIFRAS', donde, a + ' vs ' + b + ' :: ' + es.slice(0, 45));
  const ma = marcas(es), mb = marcas(tr);
  if (ma.join() !== mb.join()) apunta('MARCADOR', donde, ma + ' vs ' + mb + ' :: ' + es.slice(0, 45));
  if (etiquetas(es) !== etiquetas(tr)) apunta('ETIQUETAS', donde, etiquetas(es) + ' vs ' + etiquetas(tr));
  if (LANG !== 'es') {
    const esc = ESCRITURA[LANG];
    if (esc.debe && !esc.debe.test(tr)) apunta('SIN-SU-ALFABETO', donde, tr.slice(0, 50));
    if (esc.prohibe && esc.prohibe.test(tr)) apunta('ALFABETO-AJENO', donde, tr.slice(0, 50));
    if (igual(es, tr) && es.replace(/[^A-Za-zÀ-ÿ]/g, '').length >= 12
        && !trozos(es).every(t => trozoLegitimo(t, LANG))) {
      const sueltos = trozos(es).filter(t => !trozoLegitimo(t, LANG));
      apunta('IGUAL-AL-CASTELLANO', donde, es.slice(0, 55) + '   [sin declarar: ' + sueltos.join(' | ') + ']');
    }
    /* La etiqueta `cat` es una lista separada por "·", y los trozos tienen
       que ser los mismos. Contarlos pilla lo que la longitud no pillaba:
       439 etiquetas repartidas por siete idiomas habian perdido trozos por
       el camino -"Golf · 9 Trous · Arona · Debutants" se habia quedado sin
       el "Familias" del final- y el control de longitud solo canto 38.
       El bulgaro no perdio ninguno, asi que no es una fatalidad de la
       traduccion: es que se cayeron. */
    /* Vale igual para `hours`, que tambien es una lista con "·":
       "L-V 07:00-21:00 · Consultar festivos". El frances y el aleman se
       habian quedado sin el "Consultar festivos" y el control de longitud
       los cantaba de milagro, por los pelos. */
    /* Un correo o una web no se traducen: o estan igual, o no estan. Y
       cuando no estan, el cribado de longitud puede no enterarse: el ingles
       de acc-adissur se habia dejado el correo de la asociacion y seguia
       teniendo largo de sobra para pasar. Doce fichas del castellano llevan
       correo o web. */
    for (const enlace of new Set(es.match(ENLACE) || [])) {
      if (!tr.includes(enlace)) apunta('ENLACE', donde, 'falta ' + enlace + ' :: ' + es.slice(0, 40));
    }
    if (campo === 'cat' || campo === 'hours') {
      const ta = es.split('·').length, tb = tr.split('·').length;
      if (ta !== tb) apunta('TROZOS-' + campo.toUpperCase(), donde, ta + ' vs ' + tb + ' :: ' + es + '   ->   ' + tr);
    }
    /* MUY-CORTA solo en textos con cuerpo. En un rotulo de tres palabras la
       proporcion no dice nada: "Palomitas de maiz" son 18 caracteres y
       "Popcorn" 8, y no falta ni una palabra; "Picoteo, aperitivo para
       acompañar el vino" son 42 y el chino lo dice entero en cinco. Todos
       los avisos que quedaban por aqui eran de ese tipo, salvo dos que eran
       de verdad y que ahora coge el control de trozos, que es el que sabe
       mirar una lista. Para el texto largo esta faltan_textos.js, que
       compara contra la mediana de cada idioma. */
    const min = MINIMO[LANG] || 0.45;
    if (es.length >= 60 && tr.length < es.length * min) apunta('MUY-CORTA', donde, tr.length + ' vs ' + es.length + ' :: ' + es.slice(0, 40));
  }
}

/* ── informe ─────────────────────────────────────────────────────────────── */
const porTipo = {};
hallazgos.forEach(h => (porTipo[h.tipo] = porTipo[h.tipo] || []).push(h));
console.log('=== ' + LANG + ' ===');
console.log('  textos de lugar mirados....... ' + nLugar);
console.log('  textos de interfaz mirados.... ' + nUi +
            (EXENTAS.length ? '   (exentas: ' + EXENTAS.map(e => e.nom).join(', ') + ')' : ''));
console.log('  hallazgos..................... ' + hallazgos.length);
for (const t of Object.keys(porTipo).sort()) {
  console.log('    ' + t.padEnd(20) + String(porTipo[t].length).padStart(5));
  (LISTA ? porTipo[t] : porTipo[t].slice(0, 6)).forEach(h =>
    console.log('       ' + h.donde.padEnd(26) + ' ' + String(h.txt).slice(0, 96)));
  if (!LISTA && porTipo[t].length > 6) console.log('       ... y ' + (porTipo[t].length - 6) + ' mas (--lista)');
}
process.exit(hallazgos.length ? 1 : 0);
