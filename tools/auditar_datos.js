#!/usr/bin/env node
/* Auditoria de datos: catalogo, lineas, paradas, trazado y lugares.
 * Solo lee.   node tools/auditar_datos.js   */
'use strict';
const { LINES, CAT, PLACES, km, distanciaAVia, norm } = require('./cargar');
const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
let fallos = 0;
/* Antes solo sumaba al contador: el informe decia "1 control fuera de lo
   esperado" y no habia forma de saber cual, porque una linea que falla se
   imprimia igual que una que pasa. Ahora la falla se marca donde ocurre. */
const debe = (t, v, ok) => { P(t, v); if (!ok) { fallos++; console.log('      <--  MAL: este es el que falla'); } };

console.log('=== catalogo ===');
const cat = Object.entries(CAT);
debe('paradas', cat.length, cat.length === 2514);
debe('sin municipio', cat.filter(([, p]) => !p.m).length, cat.every(([, p]) => p.m));
debe('sin nombre', cat.filter(([, p]) => !(p.n || '').trim()).length, cat.every(([, p]) => (p.n || '').trim()));
debe('claves no numericas', cat.filter(([k]) => !/^\d+$/.test(k)).length, cat.every(([k]) => /^\d+$/.test(k)));
debe('fuera de la caja de Tenerife',
     cat.filter(([, p]) => p.la < 27.95 || p.la > 28.62 || p.lo < -16.98 || p.lo > -16.05).length, true);
const muni = {}; cat.forEach(([, p]) => muni[p.m] = (muni[p.m] || 0) + 1);
debe('municipios distintos', Object.keys(muni).length, Object.keys(muni).length === 31);
const coord = {}; cat.forEach(([k, p]) => { const q = p.la + ',' + p.lo; (coord[q] = coord[q] || []).push(k); });
P('coordenada duplicada exacta', Object.values(coord).filter(a => a.length > 1).length + '  (viene de stops.txt)');

/* El indice parada -> lineas. No se puede deducir de las secuencias: cada
   linea guarda un recorrido y TITSA publica varios patrones por linea. */
const conL = cat.filter(([, p]) => Array.isArray(p.l) && p.l.length);
debe('con indice de lineas (campo l)', conL.length, conL.length === cat.length);
const numsApp = new Set(LINES.map(l => String(l.numero)));
const huerfanas = cat.flatMap(([k, p]) => (p.l || []).filter(n => !numsApp.has(n)).map(n => k + '→' + n));
debe('numeros del indice sin linea en la app', huerfanas.length, huerfanas.length === 0);
huerfanas.slice(0, 5).forEach(x => console.log('      ' + x));
const refs = cat.reduce((a, [, p]) => a + ((p.l || []).length), 0);
P('referencias linea-parada del indice', refs);
/* el indice nunca puede decir MENOS que las secuencias: seria perder servicio */
const seq = {};
LINES.forEach(l => (l.paradas || []).forEach(s => { if (s.stopId) (seq[s.stopId] = seq[s.stopId] || new Set()).add(String(l.numero)); }));
let pierden = 0;
for (const k in seq) { const t = new Set((CAT[k] || {}).l || []); for (const n of seq[k]) if (!t.has(n)) pierden++; }
debe('lineas que la secuencia ve y el indice no', pierden, pierden === 0);

console.log('\n=== lineas ===');
debe('lineas', LINES.length, LINES.length === 183);
const ids = LINES.map(l => l.id);
debe('ids repetidos', ids.length - new Set(ids).size, ids.length === new Set(ids).size);
const nums = {}; LINES.forEach(l => (nums[l.numero] = nums[l.numero] || []).push(l.id));
debe('numeros compartidos', Object.values(nums).filter(a => a.length > 1).length, true);
debe('lineas con menos de 2 paradas', LINES.filter(l => (l.paradas || []).length < 2).length, true);
debe('lineas sin via', LINES.filter(l => !Array.isArray(l.via) || l.via.length < 2).length, true);
debe('lineas sin frecuencia', LINES.filter(l => !l.frecuencia).length, true);
debe('lineas sin precio', LINES.filter(l => !l.precio).length, true);
const tipos = {}; LINES.forEach(l => tipos[l.tipo] = (tipos[l.tipo] || 0) + 1);
P('por tipo', JSON.stringify(tipos));

console.log('\n=== paradas y trazado ===');
const tot = LINES.reduce((a, l) => a + l.paradas.length, 0);
debe('referencias de parada', tot, tot === 6263);
const pid = LINES.flatMap(l => l.paradas.map(p => p.id));
debe('ids de parada repetidos', pid.length - new Set(pid).size, pid.length === new Set(pid).size);
debe('referencias huerfanas', LINES.flatMap(l => l.paradas).filter(p => p.stopId && !CAT[p.stopId]).length, true);
debe('paradas sin municipio', LINES.flatMap(l => l.paradas).filter(p => !p.municipio).length, true);
let rep = 0; LINES.forEach(l => { for (let i = 1; i < l.paradas.length; i++) if (l.paradas[i].stopId && l.paradas[i].stopId === l.paradas[i-1].stopId) rep++; });
debe('parada repetida consecutiva', rep, rep === 0);
const pts = LINES.reduce((a, l) => a + (l.via ? l.via.length : 0), 0);
let malos = 0, fueraV = 0;
LINES.forEach(l => (l.via || []).forEach(v => {
  if (!Array.isArray(v) || v.length !== 2 || !isFinite(v[0]) || !isFinite(v[1])) malos++;
  else if (v[0] < 27.95 || v[0] > 28.62 || v[1] < -16.98 || v[1] > -16.05) fueraV++;
}));
P('puntos de via', pts);
debe('puntos de via mal formados o fuera', malos + fueraV, malos + fueraV === 0);
const lejos = [];
LINES.forEach(l => {
  if (!Array.isArray(l.via) || l.via.length < 2) return;
  l.paradas.forEach(p => {
    const m = distanciaAVia([p.lat, p.lng], l.via);   // al SEGMENTO, nunca al vertice
    if (m > 200) lejos.push([l.numero, p.nombre, Math.round(m)]);
  });
});
debe('paradas a mas de 200 m de su trazado', lejos.length + ' de ' + tot, lejos.length <= 5);
lejos.sort((a, b) => b[2] - a[2]).slice(0, 6).forEach(x => console.log('      %s  «%s»  %d m', x[0], x[1], x[2]));
let saltoSinVia = 0;
LINES.forEach(l => { const v = Array.isArray(l.via) && l.via.length > 1;
  for (let i = 1; i < l.paradas.length; i++) {
    const d = km([l.paradas[i-1].lat, l.paradas[i-1].lng], [l.paradas[i].lat, l.paradas[i].lng]);
    if (d > 8 && !v) saltoSinVia++;
  } });
debe('saltos > 8 km dibujados como recta', saltoSinVia, saltoSinVia === 0);

/* El tranvia va aparte: sus paradas salen del CSV de Metropolitano y 20 de las
   21 de L1 son vertice exacto de la polilinea publicada. */
console.log('\n=== tranvia ===');
LINES.filter(l => l.tipo === 'tranvia').forEach(l => {
  const ds = l.paradas.map(p => distanciaAVia([p.lat, p.lng], l.via));
  const vert = l.paradas.filter(p => l.via.some(v => km(v, [p.lat, p.lng]) * 1000 < 0.5)).length;
  const largo = l.via.reduce((a, _, i) => i ? a + km(l.via[i-1], l.via[i]) : 0, 0);
  P(l.id + ': paradas · vertice exacto', l.paradas.length + ' · ' + vert);
  P(l.id + ': km del trazado', largo.toFixed(2));
  debe(l.id + ': parada mas lejos de la via (m)', Math.max(...ds).toFixed(1), Math.max(...ds) < 10);
});

console.log('\n=== lugares ===');
/* El numero va fijo a proposito: si un dia se pierden fichas por un mal
   pegado, esto lo dice. Solo se mueve cuando la baja o el alta es
   deliberada. 805 -> 804 el 7 de septiembre, al quitar
   charco-infierno-arafo, que estaba a 10 km del mar y no existe; 804 ->
   803 el 20 de septiembre, al dar de baja montana-colorada, que ninguna
   fuente situa en Fasnia (parche auditoria-mar-8); 803 -> 786 el mismo dia,
   al borrar las 17 fichas nucleo-* que duplicaban una cabecera municipal
   con la misma coordenada exacta; 786 -> 787 el 21 de septiembre, con el
   alta de playa-fajana-realejos; 787 -> 786 el 28 de septiembre, al dar de
   baja guachinche-san-juan-rambla: nombre generico, sin direccion ni
   telefono y sin ningun guachinche que se llame asi; 786 -> 785 el 29 de
   septiembre, al dar de baja mercadona-el-medano: en El Medano no hay ningun
   Mercadona, el que salia era el de San Isidro; 785 -> 779 el 2 de octubre, al
   dar de baja las SEIS gasolineras que el registro oficial del MITECO no tiene
   a menos de 300 m (gas-tf1-adeje, gas-tf1-candelaria, gas-tf1-guaza2,
   gas-tf2-aeropuerto, gas-tf5-icod y gas-tf82-los-gigantes); 779 -> 780 el 2 de
   octubre, con la primera alta del registro (gas-7749-garachico, sesion 26);
   780 -> 813 el 2 de octubre, con las 33 de Santa Cruz de Tenerife (sesion 01);
   813 -> 839 el 2 de octubre, con 26 de las 28 de La Laguna (sesion 02): las
   otras 2 ya las cubrian gas-tf2-lalaguna y gas-tf5-lalaguna, que se enlazan;
   839 -> 853 el 2 de octubre, con 14 de las 15 de Arona (sesion 03): la otra
   ya la cubria gas-tf1-guaza, que se enlaza;
   853 -> 867 el 3 de octubre, con las 14 de Adeje (sesion 04);
   867 -> 866 el 3 de octubre, al retirar la DISA de Pedro de Valdivia (7840):
   el LEEME de las capturas decia no darla de alta sin confirmar que esta
   abierta (Google: «fuera de servicio por obras») y entro por error en la 01;
   866 -> 878 el 3 de octubre, con 12 de las 13 de Los Realejos (sesion 05): la
   otra ya la cubria gas-tf5-los-realejos, que se enlaza;
   878 -> 879 el 3 de octubre, al volver la DISA de Pedro de Valdivia: Jerome
   confirma con la web de DISA que esta abierta;
   879 -> 888 el 3 de octubre, con 9 de las 11 de Granadilla de Abona (sesion
   06): una ya la cubria gas-tf1-granadilla, que se enlaza, y la REPSOL del
   «lado aire» del aeropuerto queda en espera hasta saber si se puede entrar;
   888 -> 889 el 3 de octubre, al entrar esa Repsol: esta a 134 m del TF-1, fuera
   del aeropuerto, y Repsol la da abierta las 24 horas;
   889 -> 898 el 3 de octubre, con 9 de las 10 de La Orotava (sesion 07): la
   otra ya la cubria gas-tf21-aguamansa, que se enlaza;
   898 -> 908 el 3 de octubre, con las 10 de San Miguel de Abona (sesion 08);
   908 -> 914 el 3 de octubre, con 6 de las 7 de Arafo (sesion 09): la otra ya
   la cubria gas-tf1-guimar, que se enlaza;
   914 -> 920 el 3 de octubre, con 6 de las 7 de Guia de Isora (sesion 10): la
   otra ya la cubria gas-tf82-guia-isora, que se enlaza y se le corrige el pin;
   920 -> 919 el 3 de octubre, al dar de baja super-hiperdino-san-juan-rambla: en San
   Juan de la Rambla no hay ningun HiperDino (orden de Jerome);
   919 -> 925 el 3 de octubre, con las 6 de Guimar (sesion 11);
   925 -> 930 el 3 de octubre, con 5 de las 6 de Tacoronte (sesion 12): la otra
   ya la cubria gas-tf5-tacoronte, que se enlaza;
   930 -> 934 el 3 de octubre, con 4 de las 5 de Arico (sesion 13): la otra ya
   la cubria gas-tf1-abades, que se enlaza;
   934 -> 943 el 3 de octubre, con las 5 de Icod de los Vinos (sesion 14) y 4 de
   las 5 de Puerto de la Cruz (sesion 15): la otra ya la cubria gas-tf5-ptocz;
   943 -> 947 el 3 de octubre, con 4 de las 5 de El Sauzal (sesion 16): la otra
   ya la cubria gas-tf5-el-sauzal;
   947 -> 951 el 3 de octubre, con las 4 de Candelaria (sesion 17);
   951 -> 955 el 4 de octubre, con las 4 de Santiago del Teide (sesion 18);
   955 -> 958 el 4 de octubre, con las 3 de Fasnia (sesion 19);
   958 -> 961 el 4 de octubre, con las 3 de La Guancha (sesion 20);
   961 -> 963 el 4 de octubre, con 2 de las 3 de La Matanza de Acentejo (sesion
   21): la otra ya la cubria gas-tf5-el-bohio.
   963 -> 966 el 4 de octubre, con las 3 de El Rosario (sesion 22);
   966 -> 969 el 4 de octubre, con las 3 de Tegueste (sesion 23);
   969 -> 971 el 4 de octubre, con las 2 de Santa Ursula (sesion 24);
   971 -> 972 el 4 de octubre, con la de Buenavista del Norte (sesion 25);
   972 -> 973 el 4 de octubre, con la de San Juan de la Rambla (sesion 27);
   973 -> 974 el 4 de octubre, con la de Los Silos (sesion 28);
   974 -> 975 el 4 de octubre, con la de El Tanque (sesion 29);
   975 -> 976 el 4 de octubre, con la de La Victoria de Acentejo (sesion 30): la
   ultima alta. Las 212 del registro tienen ficha.
   976 -> 975 el 6 de octubre: fuera la BP Ten Bel (Arona), que segun Jerome no
   existe; queda en espera en correcciones-registro.json.
   975 -> 974 el 11 de octubre: fuera el Mirador del Cardon (Guia de Isora). No
   figura en el listado oficial de miradores de Turismo de Tenerife ni en ninguna
   otra fuente; el unico «Mirador del Cardon» esta en Gran Canaria (Jerome).
   974 -> 977 el 17 de octubre: los Jardines Victoria (La Orotava), la Cueva
   del Santo Hermano Pedro (Granadilla de Abona) y el Pino Gordo (Vilaflor), de
   la entrega lanzamiento-lugares (LANZAMIENTO-PLAY.md 1.8): fuente de Turismo
   de Tenerife y OK de Jerome.
   977 -> 980 el 17 de octubre: el Castillo de San Miguel (Garachico) y los
   miradores de La Garañona (El Sauzal) y de Cherfe, los tres de
   `pendiente_de_jerome` en la misma entrega. No tienen fuente oficial; entran
   con el OK de Jerome: «vivo aquí y conozco estos lugares».
   Esta cifra subio una vez por sesion de gasolineras hasta la ultima alta, y se
   cambia A MANO a proposito: asi ningun lugar entra sin que nadie lo vea.
   980 -> 979 el 31 de octubre de 2026: la bodega Cueva del Rey (Icod), cerrada.
   Jerome: «Cerrado permanentemente quítala». */
debe('lugares', PLACES.length, PLACES.length === 979);
/* Y el resumen de arriba de AUDITORIA-FINAL.md («# 1 · Qué hay»): decia 787
   con 980 en el mapa (17 de octubre de 2026). Ahora se coteja aqui. */
{
  const doc = require('fs').readFileSync(require('path').join(__dirname, '..', 'AUDITORIA-FINAL.md'), 'utf8');
  const m = /^\| Lugares \| \*\*([\d.]+)\*\*/m.exec(doc);
  const dice = m ? Number(m[1].replace(/\./g, '')) : null;
  debe('lugares en el resumen de AUDITORIA-FINAL.md', dice === null ? 'no encuentro la fila' : dice, dice === PLACES.length);
}
['id','name','emoji','color','lat','lng','desc','category'].forEach(c =>
  debe('sin ' + c, PLACES.filter(p => p[c] === undefined || p[c] === '').length, PLACES.every(p => p[c] !== undefined && p[c] !== '')));
debe('ids que no cumplen [a-z0-9-]', PLACES.filter(p => !/^[a-z0-9-]+$/.test(p.id)).length, true);
debe('fuera de la caja de Tenerife',
     PLACES.filter(p => p.lat < 27.95 || p.lat > 28.62 || p.lng < -16.98 || p.lng > -16.05).length, true);
const urls = []; PLACES.forEach(p => Object.values(p).forEach(v => { if (typeof v === 'string' && /^https?:/.test(v)) urls.push(v); }));
debe('urls sin cifrar', urls.filter(u => u.startsWith('http://')).length + ' de ' + urls.length, !urls.some(u => u.startsWith('http://')));
/* El emoji de la ficha va en su campo, y la app ya lo pinta delante del
   nombre: 28 nombres (buceo, kayak, escalada, pesca, parapente, windsurf)
   lo llevaban ademas escrito dentro y salian con el emoji dos veces. Se
   quitaron el 13 de octubre de 2026 con el OK de Jerome. Lo que va DETRAS
   del nombre (🐾 ♿ 🤝) es una marca de servicio y se queda. */
const emojiDelante = PLACES.filter(p => /^\p{Extended_Pictographic}/u.test(String(p.name)));
debe('nombres que empiezan por un emoji', emojiDelante.length, emojiDelante.length === 0);
emojiDelante.slice(0, 5).forEach(p => console.log('      <--  ' + p.id + ' : ' + p.name));

/* Las valoraciones de terceros -notas y recuentos de Google, TripAdvisor,
   AllTrails- caducan y no son nuestras: salieron de las fichas el 16 de
   octubre de 2026 (LANZAMIENTO-PLAY.md 1.5), en los diez idiomas. Se miran el
   nombre, la categoria, las etiquetas y la descripcion en castellano, y la
   descripcion y la categoria en los nueve idiomas. «PADI 5★» es el nivel de un
   centro de buceo, no una nota, y no lo coge: aqui cuentan las notas con
   decimal («4,7★», «4.6/5»), los recuentos de reseñas y esas plataformas. */
{
  const NOTA = new RegExp([
    '\\b[0-5][.,]\\d\\s*(?:★|☆|\\/\\s*5\\b|星|estrellas|stars|étoiles|sterne|stelle|sterren|звезд|gwiazd)',
    'TripAdvisor|AllTrails',
    '\\d\\+?\\s*(?:reseñas|valoraciones|reviews|avis\\b|Bewertungen|recensioni|beoordelingen|recensies|opinii|opiniach|отзива|оценки)',
    '\\d\\s*多?\\s*[条條]\\s*[评評][价價]'].join('|'), 'iu');
  const conNota = [];
  for (const p of PLACES) {
    const campos = { nombre: p.name, cat: (p.cat || {}).es, desc: (p.desc || {}).es, etiquetas: (p.tags || []).join(' | ') };
    for (const [c, t] of Object.entries(campos)) if (t && NOTA.test(t)) conNota.push(p.id + ' (es, ' + c + '): ' + t.match(NOTA)[0]);
  }
  for (const L of ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
    const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'idiomas', L + '.json'), 'utf8'));
    for (const [id, e] of Object.entries(d)) for (const c of ['desc', 'cat'])
      if (e[c] && NOTA.test(e[c])) conNota.push(id + ' (' + L + ', ' + c + '): ' + e[c].match(NOTA)[0]);
  }
  debe('valoraciones de terceros en las fichas (diez idiomas)', conNota.length, conNota.length === 0);
  conNota.slice(0, 6).forEach(x => console.log('      <--  ' + x));
}

/* La calidad del agua y su ano no se pueden separar: el texto de la insignia
   dice "censo oficial {a}", asi que una ficha con calidad y sin ano pintaria
   el marcador crudo. */
const conAgua = PLACES.filter(p => p.aguaCalidad);
debe('con calidad de agua', conAgua.length, conAgua.length > 0);
debe('con calidad pero sin ano', conAgua.filter(p => !p.aguaCalidadAnio).length,
     conAgua.every(p => p.aguaCalidadAnio));
/* El codigo indexa por minusculas; el censo las publica capitalizadas, y una
   "Excelente" no casa con nada y no pinta insignia, sin dar ningun error. */
const VALORES = ['excelente', 'buena', 'suficiente'];
debe('valores de calidad fuera de los tres', conAgua.filter(p => !VALORES.includes(p.aguaCalidad)).length,
     conAgua.every(p => VALORES.includes(p.aguaCalidad)));
/* lifeguard null es "no se sabe" y badgeSocorristas no pinta nada. Que sea
   deliberado y no un descuido se comprueba: solo se acepta true, false o null. */
debe('lifeguard con un valor que no es true/false/null',
     PLACES.filter(p => 'lifeguard' in p && p.lifeguard !== true && p.lifeguard !== false && p.lifeguard !== null).length,
     PLACES.every(p => !('lifeguard' in p) || p.lifeguard === true || p.lifeguard === false || p.lifeguard === null));
/* El alias solo sirve si el buscador lo lee. Son tres filtros distintos.
   El patron mira sinTildes(), que es como se comparan desde que la busqueda
   pliega los acentos. Cuando se cambio la forma de la comparacion este
   control se quedo a 0 y canto, que es lo que tenia que hacer: un control
   que no reconoce el codigo que vigila no esta vigilando nada. */
const fs_ = require('fs');
const html = fs_.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const leenAlias = (html.match(/\.alias && sinTildes\([a-z]+\.alias\)\.includes\(searchQuery\)/g) || []).length;
debe('filtros del buscador que leen alias', leenAlias, leenAlias >= 3);

/* Y que la busqueda pliegue los acentos en los DOS lados. Si se pliega solo
   lo tecleado, escribir CON tilde deja de encontrar: seria cambiar un fallo
   por el contrario. */
const pliegaEntrada = /searchQuery = sinTildes\(e\.target\.value\)/.test(html);
const sinPlegar = (html.match(/\.toLowerCase\(\)\.includes\(searchQuery\)/g) || []).length;
debe('la busqueda pliega lo que se teclea', pliegaEntrada ? 'si' : 'NO', pliegaEntrada);
debe('comparaciones que aun no pliegan el texto', sinPlegar, sinPlegar === 0);
debe('lugares con alias', PLACES.filter(p => p.alias).length, PLACES.filter(p => p.alias).length > 0);

/* Los colores entran en un atributo style sin escapar, asi que solo son
   seguros mientras TODOS sean un #rrggbb. Hoy lo son los 805; que siga
   siendolo no puede depender de la suerte. */
const colorMalo = PLACES.filter(p => !/^#[0-9a-fA-F]{6}$/.test(String(p.color || '')));
debe('colores que no son #rrggbb (van a un style sin escapar)', colorMalo.length, colorMalo.length === 0);
colorMalo.slice(0, 5).forEach(p => console.log('      <--  ' + p.id + ' : ' + p.color));

/* Un warn cuyo valor no este en WARN_I18N no pinta banner y no da error: el
   aviso de seguridad desaparece en silencio. Se comprueba contra la tabla del
   propio fichero. */
const clavesWarn = (html.match(/WARN_I18N\s*=\s*\{[\s\S]*?\n  \};/) || [''])[0];
const CONOCIDOS = [...new Set([...clavesWarn.matchAll(/^\s{4}(\w+):\s*\{/gm)].map(m => m[1]))];
const conWarn = PLACES.filter(p => p.warn);
debe('lugares con aviso (warn)', conWarn.length, conWarn.length > 0);
debe('avisos cuyo valor no existe en WARN_I18N',
     conWarn.filter(p => !CONOCIDOS.includes(p.warn)).length,
     CONOCIDOS.length > 0 && conWarn.every(p => CONOCIDOS.includes(p.warn)));
const porTipo = {}; conWarn.forEach(p => porTipo[p.warn] = (porTipo[p.warn] || 0) + 1);
P('avisos por tipo', Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(x => x[0] + ' ' + x[1]).join(' · '));

/* Cifras exactas escritas a mano en el fichero. El schema.org que leen los
   buscadores decia "702 puntos de interes" con 805 dentro, y dos comentarios
   hablaban de los 702 marcadores. Un "mas de 700" no cuenta: eso sigue
   siendo cierto y no se toca. */
const exactas = [...html.matchAll(/(?<!de )(?<!\+)(\d{3,4})\s*(?:puntos de inter[eé]s|marcadores|lugares(?! verificados))/g)]
  .map(m => ({ n: Number(m[1]), txt: m[0].trim() }))
  .filter(x => !/^m[aá]s de/i.test(x.txt));
const mienten = exactas.filter(x => x.n !== PLACES.length);
debe('cifras exactas de lugares que no son ' + PLACES.length, mienten.length, mienten.length === 0);
mienten.slice(0, 5).forEach(x => console.log('      <--  ' + x.txt));

/* 12 de octubre de 2026. Dos fichas de Anaga (bici-anaga-cruz-carmen y
   acc-sendero-sentidos) decian que Anaga o su laurisilva son «Patrimonio
   Mundial», en los diez idiomas. No lo son: el Macizo de Anaga es Reserva de
   la Biosfera de la UNESCO, declarada el 9 de junio de 2015 (Ministerio para
   la Transicion Ecologica, programa MAB, ficha «Macizo de Anaga»). En Tenerife
   son Patrimonio Mundial San Cristobal de La Laguna (1999) y el Parque
   Nacional del Teide (2007). Ningun lugar de Anaga puede decir otra cosa en
   ningun idioma. */
/* Y la Fiesta de los Corazones de Tejina (12 de octubre de 2026, Jerome): la
   ficha nucleo-tejina decia «Patrimonio de la Humanidad UNESCO», en
   septiembre y «unica en el mundo». Es Bien de Interes Cultural, con categoria
   de ambito local, por el Decreto 71/2003, de 12 de mayo (BOC n. 102, de 29
   de mayo de 2003, disposicion 931), y se celebra en agosto, por San
   Bartolome. No tiene ninguna declaracion de la UNESCO: ni en el texto, en
   ningun idioma, ni en las etiquetas. */
{
  const WHS = /Patrimonio Mundial|Patrimonio de la Humanidad|World Heritage|Patrimoine mondial|Welterbe|Weltnaturerbe|Patrimonio Mondiale|Patrimonio dell.Umanit|werelderfgoed|世界遗产|世界遺產|световно наследство|[śs]wiatow\S* dziedzictw/i;
  const UNESCO = /UNESCO|ЮНЕСКО|联合国教科文|聯合國教科文|人类遗产|人類遺產/i;
  const GRUPOS = [
    { que: 'lugares de Anaga', mal: WHS,
      de: p => /anaga|cruz del carmen/i.test(p.id + ' ' + p.name + ' ' + ((p.desc && p.desc.es) || '')) },
    { que: 'la Fiesta de los Corazones de Tejina', mal: new RegExp(WHS.source + '|' + UNESCO.source, 'i'), etiquetas: true,
      de: p => p.id === 'nucleo-tejina' || /corazones de tejina/i.test((p.desc && p.desc.es) || '') },
  ];
  const textos = {};
  for (const L of ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
    try { textos[L] = JSON.parse(fs_.readFileSync(require('path').join(__dirname, '..', 'idiomas', L + '.json'), 'utf8')); }
    catch (e) { textos[L] = null; }
  }
  for (const g of GRUPOS) {
    const lugares = PLACES.filter(g.de), malos = [];
    for (const p of lugares) {
      if (g.mal.test((p.desc && p.desc.es) || '')) malos.push(p.id + ' [es]');
      if (g.etiquetas && (p.tags || []).some(t => g.mal.test(t))) malos.push(p.id + ' [etiquetas]');
      for (const L of Object.keys(textos)) {
        if (!textos[L]) { malos.push('no se lee idiomas/' + L + '.json'); continue; }
        if (textos[L][p.id] && g.mal.test(textos[L][p.id].desc || '')) malos.push(p.id + ' [' + L + ']');
      }
    }
    debe(g.que + ' (' + lugares.length + ') que dicen «Patrimonio Mundial»' + (g.etiquetas ? ' o UNESCO' : '') + ' en algun idioma',
         malos.length, lugares.length > 0 && malos.length === 0);
    malos.slice(0, 6).forEach(x => console.log('      <--  ' + x));
  }
}

/* 12 de octubre de 2026. El "mas de 700" de arriba se dejaba pasar porque era
   cierto, y asi el schema.org que leen los buscadores estuvo diciendo «mas de
   700 lugares verificados» con 974 en el mapa. Jerome: «verifica el polaco
   y los 700». Desde hoy lo que lee alguien (la cabecera, sin comentarios, y
   los textos entre comillas) no lleva cifras redondas de lugares sino la
   contada, no dice que esten todos "verificados" (no se puede demostrar
   lugar a lugar) y el schema.org declara todos los idiomas de la app. */
const cabeza = html.slice(0, html.indexOf('</head>')).replace(/<!--[\s\S]*?-->/g, '');
const literales = html.match(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g) || [];
const REDONDA = /(?:m[aá]s de|\+)\s*(\d{3,4})\s*(?:puntos de inter[eé]s|marcadores|lugares|sitios)/gi;
const redondas = [];
for (const t of [cabeza, ...literales]) for (const m of t.matchAll(REDONDA)) redondas.push(m[0]);
debe('cifras redondas de lugares en lo que se lee (va la contada, ' + PLACES.length + ')', redondas.length, redondas.length === 0);
[...new Set(redondas)].slice(0, 5).forEach(t => console.log('      <--  ' + t));
const verif = (cabeza.match(/[^."]*verificad[^."]*/gi) || []);
debe('la cabecera (schema.org, meta) dice que los lugares estan «verificados»', verif.length, verif.length === 0);
verif.slice(0, 3).forEach(t => console.log('      <--  ' + t.trim().slice(0, 90)));
/* Lo mismo para el manifest, que es lo que ensena el movil al instalar
   («720 lugares verificados» hasta el 16 de octubre de 2026), y la imagen
   para compartir, que la cabecera pedia y no existia (LANZAMIENTO-PLAY.md
   1.7). */
{
  const raiz = require('path').join(__dirname, '..');
  const man = JSON.parse(fs_.readFileSync(require('path').join(raiz, 'manifest.webmanifest'), 'utf8'));
  const d = man.description || '';
  debe('el manifest: la descripcion, sin cifras de lugares ni «verificados»', JSON.stringify(d),
       !!d && !/\d{3}|verificad/i.test(d));
  const tamJpeg = b => {
    if (!b || b[0] !== 0xFF || b[1] !== 0xD8) return null;
    for (let i = 2; i + 9 < b.length; ) {
      if (b[i] !== 0xFF) return null;
      const m = b[i + 1], largo = b.readUInt16BE(i + 2);
      if (m >= 0xC0 && m <= 0xC3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + largo;
    }
    return null;
  };
  let tam = null;
  try { tam = tamJpeg(fs_.readFileSync(require('path').join(raiz, 'og-image.jpg'))); } catch (e) {}
  const pide = /og-image\.jpg/.test(cabeza);
  debe('og-image.jpg existe, es JPG y mide 1200x630 (la piden og:image, twitter:image y el JSON-LD)',
       tam ? tam.w + 'x' + tam.h : 'no esta', !pide || (!!tam && tam.w === 1200 && tam.h === 630));
}
{
  const sopLd = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
    .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
    .map(l => l === 'zht' ? 'zh-Hant' : l);
  const ld = (cabeza.match(/"inLanguage"\s*:\s*\[([^\]]*)\]/) || [, ''])[1]
    .split(',').map(x => x.trim().replace(/^"|"$/g, '')).filter(Boolean);
  const faltan = sopLd.filter(l => !ld.includes(l));
  debe('idiomas de la app que el schema.org no declara (inLanguage)', faltan.length ? faltan.join(' ') : 0,
       ld.length > 0 && faltan.length === 0);
}

/* La misma regla para el numero de idiomas, que ademas se mueve solo.
   "Toda la app en 8 idiomas" y "con fichas en 8 idiomas" estan escritos en
   cada idioma; el dia que un idioma a medias deje de estarlo pasan a ser
   nueve y nadie va a acordarse de esas dieciocho frases. Terminados =
   SUPPORTED_LANGS menos IDIOMAS_INCOMPLETOS, que estan los dos en el fuente,
   asi que el control lo sabe sin que se lo cuenten. */
const sop = (html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const incompl = (html.match(/IDIOMAS_INCOMPLETOS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const terminados = sop.filter(l => !incompl.includes(l)).length;
debe('idiomas declarados', sop.length + ' · a medias ' + incompl.length + ' · terminados ' + terminados,
     sop.length > 0 && terminados > 0);
/* la cifra va pegada a la palabra "idioma/lengua" en los nueve idiomas.
   Se mira SOLO dentro de literales de texto: un comentario que diga "7
   idiomas" puede ser cierto (habla de otro momento) y haria fallar para
   siempre a un control que no puede distinguirlo. Lo que no puede mentir
   es lo que lee el usuario. */
const PAL = /(\d{1,2})\s*(?:idiomas|languages|langues|Sprachen|lingue|talen|езика|\\u79cd\\u8bed\\u8a00|\\u7a2e\\u8a9e\\u8a00|种语言|種語言)/g;
const LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
const cifras = [];
for (const lit of html.match(LITERAL) || [])
  for (const m of lit.matchAll(PAL)) cifras.push({ n: Number(m[1]), txt: m[0].trim() });
const malIdi = cifras.filter(x => x.n !== terminados);
debe('cifras de idiomas en la interfaz que no son ' + terminados,
     malIdi.length + ' de ' + cifras.length, malIdi.length === 0);
[...new Set(malIdi.map(x => x.txt))].slice(0, 6).forEach(t => console.log('      <--  ' + t));

/* ── orientaciones de playa ──
   Desde septiembre las 99 zonas de bano tienen `ori`. Lo que se vigila aqui
   no es la cifra, es que la tabla y places[] no se separen: una fila que
   apunte a un POI que ya no existe no da error, simplemente deja de salir. */
console.log('\n=== orientaciones de playa ===');
{
  const src = require('fs').readFileSync('index.html', 'utf8');
  let b = src.slice(src.indexOf('const PLAYAS_ORIENTACION'));
  b = b.slice(0, b.indexOf('\n};'));
  const filas = [...b.matchAll(/'([a-z0-9-]+)':\s*\{([^}]*)\}/g)];
  const RUMBOS = ['N','NE','E','SE','S','SW','W','NW'];
  const banio = PLACES.filter(p => p.category === 'playa' || p.category === 'piscinas');
  const claves = filas.map(m => m[1]);
  const sinOri = banio.filter(p => !claves.includes(p.id)).map(p => p.id);
  const huerf  = claves.filter(id => !PLACES.some(p => p.id === id));
  const malOri = filas.filter(m => { const o = /ori:\s*'([A-Z]+)'/.exec(m[2]); return !o || !RUMBOS.includes(o[1]); }).map(m => m[1]);
  P('filas en PLAYAS_ORIENTACION', filas.length);
  P('  de ellas, deducida:true', filas.filter(m => /deducida/.test(m[2])).length);
  P('  escritas a mano', filas.filter(m => !/deducida/.test(m[2])).length);
  debe('claves duplicadas', claves.length - new Set(claves).size, claves.length === new Set(claves).size);
  debe('zonas de bano sin orientacion', sinOri.length, sinOri.length === 0);
  sinOri.slice(0, 6).forEach(i => console.log('      <--  ' + i));
  debe('filas que apuntan a un POI inexistente', huerf.length, huerf.length === 0);
  huerf.slice(0, 6).forEach(i => console.log('      <--  ' + i));
  debe('ori fuera de los 8 rumbos', malOri.length, malOri.length === 0);
}

/* ── el catalogo del planificador de dia ──
   Mismo fallo silencioso que las orientaciones: `zone.suggestionIds.forEach`
   hace `if (!place) return;`, asi que un id que ya no existe no da error, la
   ficha simplemente deja de ofrecerse y nadie se entera. Al dar de baja
   montana-colorada se vio que ya habia 16 asi. */
console.log('\n=== catalogo del planificador ===');
{
  const src = require('fs').readFileSync('index.html', 'utf8');
  const refs = [];
  for (const b of src.matchAll(/suggestionIds:\s*\[([\s\S]*?)\]/g))
    for (const m of b[1].matchAll(/'([a-z0-9-]+)'/g)) refs.push(m[1]);
  const vivos = new Set(PLACES.map(p => p.id));
  const rotas = refs.filter(id => !vivos.has(id));
  const huerf = [...new Set(rotas)];
  P('referencias en suggestionIds', refs.length);
  debe('que apuntan a un POI inexistente',
       rotas.length + ' referencias, ' + huerf.length + ' ids distintos',
       rotas.length === 0);
  huerf.forEach(i => console.log('      <--  ' + i));

  /* Dos fichas con el mismo nombre en la misma zona salen como dos lineas
     identicas en el catalogo y no hay forma de saber cual es cual. No falla
     -una playa y un nucleo pueden llamarse igual de verdad- pero se lista:
     casi cuela meter `nucleo-el-sauzal` donde ya estaba `ciudad-sauzal`. */
  const nom = new Map(PLACES.map(p => [p.id, norm(p.name)]));
  const repes = [];
  for (const b of src.matchAll(/(\w+):\s*\{\s*\n\s*emoji:[^\n]*\n\s*suggestionIds:\s*\[([\s\S]*?)\]/g)) {
    const por = new Map();
    for (const m of b[2].matchAll(/'([a-z0-9-]+)'/g)) {
      const n2 = nom.get(m[1]); if (!n2) continue;
      por.set(n2, (por.get(n2) || []).concat(m[1]));
    }
    for (const [, a] of por) if (a.length > 1) repes.push(b[1] + ': ' + a.join(' = '));
  }
  P('el mismo nombre dos veces en una zona', repes.length);
  repes.forEach(r => console.log('      ·  ' + r));

  /* Un sitio ofrecido en dos zonas puede estar donde no le toca -asi
     aparecieron faro-rasca y faro-abona, faros de Arona y Arico, en la lista
     del NORTE- o estar en las dos A PROPOSITO. No falla, porque lo segundo
     es lo normal aqui:

       · el circuito MASCA-TEIDE es una excursion de un dia de verdad, y por
         eso masca, mirador-maska, ruta-masca-playa, acantilados-gigantes,
         riscos-chio y ciudad-santiago-teide estan en sur Y en cumbre. NO
         son un error: ya se quitaron una vez por no saberlo y hubo que
         devolverlas.
       · ciudad-vilaflor (1.400 m) es la puerta sur del parque.
       · ciudad-rosario lleva «Cumbre Dorsal» en su propia ficha.

     Lo que si es un error es un sitio en una zona del otro lado de la isla,
     como los dos faros. Por eso se lista, no se suspende. */
  const donde = new Map();
  for (const b of src.matchAll(/(\w+):\s*\{\s*\n\s*emoji:[^\n]*\n\s*suggestionIds:\s*\[([\s\S]*?)\]/g))
    for (const m of b[2].matchAll(/'([a-z0-9-]+)'/g))
      donde.set(m[1], (donde.get(m[1]) || []).concat(b[1]));
  const multi = [...donde].filter(([, z]) => z.length > 1);
  P('ofrecidos en mas de una zona', multi.length);
  multi.forEach(([i, z]) => console.log('      ·  ' + i + '  ' + z.join(' + ')));
}

console.log('\n=== grupos de categorias (las pestañas del boton de categorias) ===');
{
  /* Cada categoria del mapa en una pestaña, y en una sola: en dos, el mismo
     filtro saldria dos veces; en ninguna, no se podria filtrar por ella. Y
     lo que Jerome decide de un grupo se queda como lo decidio: el 13 de
     octubre de 2026, «Senderismo quiero la categoría en deportes». */
  const { grab } = require('./rotulos_app');
  const GRUPOS = grab('const CAT_GROUPS = [');
  const BASE = grab('const categoriesBase = {');
  const enGrupo = {};
  GRUPOS.forEach(g => g.cats.forEach(c => (enGrupo[c] = enGrupo[c] || []).push(g.id)));
  const dobles = Object.entries(enGrupo).filter(([, gs]) => gs.length > 1);
  const sueltas = Object.keys(BASE).filter(c => !enGrupo[c]);
  const fantasmas = Object.keys(enGrupo).filter(c => !BASE[c]);
  P('pestañas', GRUPOS.length);
  debe('categorias en dos pestañas', dobles.length, dobles.length === 0);
  dobles.forEach(([c, gs]) => console.log('      ' + c + ': ' + gs.join(' y ')));
  debe('categorias sin pestaña', sueltas.length, sueltas.length === 0);
  sueltas.forEach(c => console.log('      ' + c));
  debe('en una pestaña y sin ser categoria', fantasmas.length, fantasmas.length === 0);
  fantasmas.forEach(c => console.log('      ' + c));
  const DECIDIDO = { senderismo: 'deporte' };
  for (const [c, g] of Object.entries(DECIDIDO))
    debe(c + ' en la pestaña «' + g + '» (lo decidio Jerome)', (enGrupo[c] || []).join(', ') || 'ninguna', (enGrupo[c] || []).join() === g);
}

console.log('\n=== rotulos repetidos ===');
const por = {}; Object.entries(CAT).forEach(([k, p]) => (por[norm(p.n)] = por[norm(p.n)] || []).push(k));
const dup = Object.entries(por).filter(([, a]) => a.length > 1);
P('rotulos usados por 2+ paradas', dup.length + '  (' + dup.reduce((a, [, x]) => a + x.length, 0) + ' paradas)');
const pares = dup.filter(([, a]) => { let m = 0; for (let i = 0; i < a.length; i++) for (let j = i+1; j < a.length; j++)
  m = Math.max(m, km([CAT[a[i]].la, CAT[a[i]].lo], [CAT[a[j]].la, CAT[a[j]].lo])); return m < 0.08; });
P('de esos, pares ida/vuelta a menos de 80 m', pares.length);

/* ── la tabla «Integridad de datos» de AUDITORIA-FINAL.md ──────────────────
   Decia «0 de 164» referencias del planificador y «786» lugares completos
   cuando eran 162 y 980 (18 de octubre de 2026; Jerome: que se cuenten). Cada
   fila se coteja con lo que cuentan los controles de arriba y con las mismas
   reglas: las paradas del tranvia van como objetos, sin clave del catalogo, y
   por eso no son huerfanas ni repetidas. Si una fila falta o cambia de nombre,
   tambien en rojo: una cifra que nadie mira se queda vieja. */
console.log('\n=== la tabla «Integridad de datos» de AUDITORIA-FINAL.md ===');
{
  const doc = fs_.readFileSync(require('path').join(__dirname, '..', 'AUDITORIA-FINAL.md'), 'utf8');
  const ini = doc.indexOf('\n## Integridad de datos\n');
  const sec = ini < 0 ? '' : doc.slice(ini, doc.indexOf('\n## ', ini + 5));
  const fila = et => {
    const l = sec.split('\n').find(x => x.startsWith('| ' + et + ' |'));
    return l ? l.split('|')[2].replace(/\*\*/g, '').trim() : null;
  };
  const n = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '.');      // 6263 -> «6.263»
  const sug = [];
  for (const b of html.matchAll(/suggestionIds:\s*\[([\s\S]*?)\]/g)) for (const m of b[1].matchAll(/'([a-z0-9-]+)'/g)) sug.push(m[1]);
  const vivos = new Set(PLACES.map(p => p.id));
  const caja = (la, lo) => la >= 27.95 && la <= 28.62 && lo >= -16.98 && lo <= -16.05;
  const COMPLETO = ['id', 'name', 'category', 'lat', 'lng', 'color', 'emoji'];
  const tabla = {
    'Ids de línea repetidos · números compartidos':
      (ids.length - new Set(ids).size) + ' · ' + Object.values(nums).filter(a => a.length > 1).length,
    'Ids de parada repetidos': (pid.length - new Set(pid).size) + ' de ' + n(pid.length),
    'Referencias huérfanas al catálogo (paradas)':
      String(LINES.flatMap(l => l.paradas).filter(p => p.stopId && !CAT[p.stopId]).length),
    'Referencias huérfanas en `suggestionIds` (planificador de día)':
      sug.filter(i => !vivos.has(i)).length + ' de ' + n(sug.length),
    'Paradas o lugares fuera de Tenerife':
      String(PLACES.filter(p => !caja(p.lat, p.lng)).length + Object.values(CAT).filter(p => !caja(p.la, p.lo)).length),
    'Parada repetida consecutiva en una línea': String(rep),
    '`via` con punto mal formado': malos + ' de ' + n(pts),
    'Lugares completos (id, nombre, categoría, coordenada, color, emoji)':
      String(PLACES.filter(p => COMPLETO.every(c => p[c] !== undefined && p[c] !== null && p[c] !== '')).length),
    'Ids de lugar que cumplen `[a-z0-9-]`': String(PLACES.filter(p => /^[a-z0-9-]+$/.test(p.id)).length),
    'Con calidad de agua, y su año': conAgua.length + ' · ' + conAgua.filter(p => p.aguaCalidadAnio).length,
    'Con alias de búsqueda, que los 3 filtros leen': String(PLACES.filter(p => p.alias).length),
    'Con aviso `warn`, y su tipo existe en `WARN_I18N`':
      conWarn.length + ' · ' + conWarn.filter(p => !CONOCIDOS.includes(p.warn)).length + ' huérfanos',
    'De esos, `warn:"mar"`': String(conWarn.filter(p => p.warn === 'mar').length),
    'URLs de lugar sin cifrar': urls.filter(u => u.startsWith('http://')).length + ' de ' + urls.length,
  };
  for (const [et, cuenta] of Object.entries(tabla)) {
    const dice = fila(et);
    debe(et.replace(/`/g, '').slice(0, 44), (dice === null ? '(no esta la fila)' : dice) + '   contado: ' + cuenta, dice === cuenta);
  }
  /* y las dos cifras que van en el texto: los filtros que leen el alias y
     las lineas con mas de dos paradas terminales */
  const filtros = /que los (\d+) filtros leen/.exec(sec);
  debe('filtros del buscador que leen el alias', (filtros ? filtros[1] : '(no esta)') + '   contado: ' + leenAlias,
       !!filtros && Number(filtros[1]) === leenAlias);
  const term = /\*\*(\d+) líneas marcan más de 2 paradas como\s+terminal\*\*/.exec(sec);
  const nTerm = LINES.filter(l => l.paradas.filter(p => p.esTerminal).length > 2).length;
  debe('lineas con mas de 2 paradas terminales', (term ? term[1] : '(no esta)') + '   contado: ' + nTerm,
       !!term && Number(term[1]) === nTerm);
}

console.log('\n' + (fallos ? '*** ' + fallos + ' control(es) fuera de lo esperado ***' : 'todo dentro de lo esperado'));
process.exit(fallos ? 1 : 0);
