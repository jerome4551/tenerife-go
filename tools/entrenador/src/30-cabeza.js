  /* ───────────────────────── la cabeza de Jérôme ─────────────────────────
     La de frente es la del presentador (modulos/guia.js): el mismo dibujo, las mismas bocas y los
     mismos párpados. Aquí va montada sobre un cuerpo que se mueve en tres dimensiones, así que
     tiene además un dibujo de perfil y otro de espaldas, y se elige el que toca según hacia dónde
     mira la cabeza respecto de la cámara. De frente, los rasgos se corren un poco al girar. */
  var CARA = 'M103,112 C103,74 130,54 160,54 C190,54 217,74 217,112 L218,144 C218,162 213,177 203,188 C193,199 177,209 160,209 C143,209 127,199 117,188 C107,177 102,162 102,144z';
  var BOCAS = {
    cerrada: { f: '', d: '', l: 'M132,170 Q160,190 188,170' },
    sonrisa: { f: 'M129,167 Q160,181 191,167 Q188,197 160,200 Q132,197 129,167z', d: 'M132.5,168.5 Q160,182 187.5,168.5 L185.5,180 Q160,191 134.5,180z', l: 'M129,167 Q160,181 191,167' },
    poco:    { f: 'M135,170 Q160,179 185,170 Q182,191 160,193 Q138,191 135,170z', d: 'M137.5,171 Q160,179 182.5,171 L181.5,178 Q160,185 138.5,178z', l: 'M135,170 Q160,179 185,170' },
    a:       { f: 'M134,168 Q160,176 186,168 Q188,198 160,201 Q132,198 134,168z', d: 'M137,169 Q160,176 183,169 L183,178 Q160,184 137,178z', l: 'M134,168 Q160,176 186,168' },
    o:       { f: 'M145,170 Q160,164 175,170 Q181,187 160,199 Q139,187 145,170z', d: 'M148,170.5 Q160,166 172,170.5 L172,174.5 Q160,171 148,174.5z', l: 'M145,170 Q160,164 175,170' },
    e:       { f: 'M130,169 Q160,178 190,169 Q186,191 160,193 Q134,191 130,169z', d: 'M133,170 Q160,178 187,170 L185,181 Q160,188 135,181z', l: 'M130,169 Q160,178 190,169' },
    oh:      { f: 'M147,172 Q160,166 173,172 Q177,193 160,197 Q143,193 147,172z', d: '', l: '' },
    risa:    { f: 'M126,164 Q160,180 194,164 Q193,204 160,207 Q127,204 126,164z', d: 'M129.5,165.5 Q160,181 190.5,165.5 L188.5,178 Q160,190.5 131.5,178z', l: 'M126,164 Q160,180 194,164' },
    contenta:{ f: '', d: '', l: 'M130,170 Q160,195 190,170' },
    pilla:   { f: '', d: '', l: 'M137,177.5 Q161,189 187,168' },
    mm:      { f: '', d: '', l: 'M147,180 Q161,184.5 178,176' },
    seria:   { f: '', d: '', l: 'M139,178 Q160,183.5 181,178' },
    /* el esfuerzo: los dientes apretados */
    ay:      { f: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z', d: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z',
               r: 'M133,180 H187 M147.5,167 V193 M160,166 V194 M172.5,167 V193', l: 'M135,170 Q160,165 185,170 Q189,180 185,190 Q160,195 135,190 Q131,180 135,170z' },
    /* soplar: la boca pequeña y redonda */
    sopla:   { f: 'M151,174 Q160,169 169,174 Q172,186 160,190 Q148,186 151,174z', d: '', l: '' }
  };
  /* los gestos de la cara: como en el presentador, más los del esfuerzo */
  var EMO = {
    contento:  { boca: 'sonrisa', entorna: 0.25 },
    risa:      { boca: 'risa', ojos: [0, 0], arco: 9, cejas: [3.5, 4, 3.5, 4], rubor: 0.44, entorna: 1 },
    guino:     { boca: 'sonrisa', ojos: [1, 0], arco: 7, cejas: [4, 0, -1.5, -4], entorna: 0.5 },
    asombro:   { boca: 'oh', ojos: [1.24, 1.24], cejas: [6.5, 3, 6.5, 3], entorna: -0.25 },
    ilusion:   { boca: 'risa', ojos: [1.14, 1.14], cejas: [4.5, 2, 4.5, 2], rubor: 0.36 },
    serio:     { boca: 'seria', cejas: [0.6, 6, 0.6, 6], rubor: 0.12 },
    atento:    { boca: 'contenta', ojos: [0.94, 0.94], cejas: [1.5, 2, 1.5, 2], entorna: 0.2 },
    apuro:     { boca: 'ay', ojos: [1.08, 1.08], cejas: [3.4, 12, 3.4, 12], rubor: 0.4 },
    /* el esfuerzo: los ojos entornados, el ceño y los dientes apretados; y soltar el aire */
    esfuerzo:  { boca: 'ay', ojos: [0.5, 0.5], cejas: [-1.5, -10, -1.5, -10], entorna: 0.85, rubor: 0.46 },
    sopla:     { boca: 'sopla', ojos: [0.82, 0.82], cejas: [0.5, -4, 0.5, -4], entorna: 0.4, rubor: 0.36 },
    concentra: { boca: 'mm', ojos: [0.84, 0.84], cejas: [0, -6, 0, -6], entorna: 0.35, rubor: 0.26 }
  };
  function ojoFormas(x, a, b, arcoO, fuera) {
    var y = 134, l = x - 11.5, r = x + 11.5, ab = a > 1 ? 1 : a, c = 1 - ab;
    var t = y - 16 * a - arcoO * c, f = y + 14 * (1 - 0.5 * b) * ab - arcoO * c;
    var n = function (v) { return v.toFixed(1); };
    var top = 'M' + l + ',' + y + ' C' + (x - 8) + ',' + n(t) + ' ' + (x + 8) + ',' + n(t) + ' ' + r + ',' + y;
    return {
      hueco: top + ' C' + (x + 8) + ',' + n(f) + ' ' + (x - 8) + ',' + n(f) + ' ' + l + ',' + y + 'z',
      sombra: top + ' C' + (x + 8) + ',' + n(t + 7.5) + ' ' + (x - 8) + ',' + n(t + 7.5) + ' ' + l + ',' + y + 'z',
      parpado: top + (fuera < 0 ? ' M' + l + ',' + y + ' l-2.4,-1.5' : ' M' + r + ',' + y + ' l2.4,-1.5'),
      bajo: ab > 0.3 ? 'M' + (l + 2) + ',' + (y + 1) + ' C' + (x - 7) + ',' + n(f + 1) + ' ' + (x + 7) + ',' + n(f + 1) + ' ' + (r - 2) + ',' + (y + 1) : '',
      pliegue: 'M' + (l + 1.5) + ',' + (y - 3.6) + ' C' + (x - 8) + ',' + n(t - 4.6) + ' ' + (x + 8) + ',' + n(t - 4.6) + ' ' + (r - 1.5) + ',' + (y - 3.6)
    };
  }
  function visema(ch) {
    if (!ch) return null;
    var c = ch.toLowerCase();
    if (' \n\t.,;:!?¡¿…—–-«»“”"\'()'.indexOf(c) >= 0) return null;
    if ('aáàâäãåаяą'.indexOf(c) >= 0) return 'a';
    if ('eéèêëęiíìîïyэеиыйě'.indexOf(c) >= 0) return 'e';
    if ('oóòôöõuúùûüоуюёø'.indexOf(c) >= 0) return 'o';
    if ('mbpмбп'.indexOf(c) >= 0) return 'cerrada';
    if (c > '⹿') return ['a', 'e', 'o', 'poco'][ch.charCodeAt(0) % 4];
    return 'poco';
  }

  function Cabeza(defs, u) {
    var p = function (n) { return u + '-' + n; }, url = function (n) { return 'url(#' + u + '-' + n + ')'; };
    var D0 = '';
    D0 += '<radialGradient id="' + p('piel') + '" cx=".4" cy=".34" r=".8"><stop offset="0" stop-color="' + C.pielL + '"/><stop offset=".5" stop-color="' + C.piel + '"/><stop offset="1" stop-color="' + C.pielS + '"/></radialGradient>';
    D0 += '<linearGradient id="' + p('pelo') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.peloL + '"/><stop offset=".6" stop-color="' + C.pelo + '"/><stop offset="1" stop-color="' + C.peloS + '"/></linearGradient>';
    D0 += '<linearGradient id="' + p('lente') + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".38"/><stop offset=".45" stop-color="#cfe8ff" stop-opacity=".06"/><stop offset="1" stop-color="#cfe8ff" stop-opacity=".22"/></linearGradient>';
    D0 += '<radialGradient id="' + p('iris') + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b17a43"/><stop offset=".55" stop-color="#70482a"/><stop offset="1" stop-color="#3a2412"/></radialGradient>';
    D0 += '<linearGradient id="' + p('sien') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.peloS + '"/><stop offset=".5" stop-color="' + C.peloS + '" stop-opacity=".85"/><stop offset="1" stop-color="' + C.peloS + '" stop-opacity=".12"/></linearGradient>';
    D0 += '<clipPath id="' + p('caraclip') + '"><path d="' + CARA + '"/></clipPath>';
    D0 += '<clipPath id="' + p('ojoi') + '"><path class="tgh-hueco-i" d=""/></clipPath><clipPath id="' + p('ojod') + '"><path class="tgh-hueco-d" d=""/></clipPath>';
    D0 += '<clipPath id="' + p('bocaclip') + '"><path class="tgh-boca-forma" d=""/></clipPath>';
    D0 += '<clipPath id="' + p('perfclip') + '"><path d="' + PERFIL + '"/></clipPath>';
    D0 += '<clipPath id="' + p('ojop') + '"><path class="tgh-hueco-p" d=""/></clipPath>';
    var hueco = crear('g', null, defs); hueco.innerHTML = D0;
    this.defs = hueco;

    var ojo = function (x, k) {
      return '<g class="tgh-ojo tgh-ojo-' + k + '"><path class="tgh-blanco" d="" fill="#fff"/>' +
        '<g clip-path="' + url('ojo' + k) + '"><g class="tgh-iris"><circle cx="' + x + '" cy="133.5" r="7.8" fill="' + url('iris') + '"/><circle cx="' + x + '" cy="133.5" r="7.8" fill="none" stroke="#2f1c0e" stroke-width="1.1"/>' +
        '<circle cx="' + x + '" cy="133.5" r="3.6" fill="#160b05"/><circle cx="' + (x - 2.7) + '" cy="130.4" r="2.4" fill="#fff"/><circle cx="' + (x + 2.6) + '" cy="136.3" r="1.1" fill="#fff" opacity=".85"/></g>' +
        '<path class="tgh-sombra" d="" fill="#4a2f22" opacity=".2"/></g>' +
        '<path class="tgh-pliegue" d="" fill="none" stroke="' + C.pielSS + '" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>' +
        '<path class="tgh-bajo" d="" fill="none" stroke="' + C.pielSS + '" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>' +
        '<path class="tgh-parpado" d="" fill="none" stroke="#3d2a1c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
    };
    var montura = function (x) {
      return '<path fill-rule="evenodd" fill="' + C.mont + '" d="M' + (x + 8) + ',113 h34 a8,8 0 0 1 8,8 v22 a8,8 0 0 1 -8,8 h-34 a8,8 0 0 1 -8,-8 v-22 a8,8 0 0 1 8,-8z ' +
        'M' + (x + 9.4) + ',118.6 a6,6 0 0 0 -6,6 v17.8 a6,6 0 0 0 6,6 h31.2 a6,6 0 0 0 6,-6 v-17.8 a6,6 0 0 0 -6,-6z"/>';
    };
    var g = crear('g', { 'class': 'tgh' });
    this.g = g;
    g.innerHTML =
    /* ══ de frente ══ */
    '<g class="tgh-frente">' +
      '<g class="tgh-orejas"><g class="tgh-oreja-i">' +
        '<path d="M104,130 C95,125 88,133 89,146 C90,158 97,166 105,163z" fill="' + C.piel + '"/>' +
        '<path d="M100,136 C94,137 93,146 95,153 C96,156 99,158 101,157 M97,145 q3.4,2.4 2.4,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/></g><g class="tgh-oreja-d">' +
        '<path d="M216,130 C225,125 232,133 231,146 C230,158 223,166 215,163z" fill="' + C.pielS + '"/>' +
        '<path d="M220,136 C226,137 227,146 225,153 C224,156 221,158 219,157 M223,145 q-3.4,2.4 -2.4,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/></g></g>' +
      '<path d="' + CARA + '" fill="' + url('piel') + '"/>' +
      '<g clip-path="' + url('caraclip') + '">' +
        '<path d="M100,152 C104,174 112,190 124,200 C136,212 150,214 160,214 C170,214 184,212 196,200 C208,190 216,174 220,152 C215,166 207,174 196,176 C188,170 178,166 170,166 C166,162 154,162 150,166 C142,166 132,170 124,176 C113,174 105,166 100,152z" fill="#6a5140" opacity=".14"/>' +
        '<ellipse cx="146" cy="90" rx="31" ry="12" fill="' + C.pielL + '" opacity=".5"/>' +
        '<path d="M102,150 C104,172 112,188 124,199 C115,186 109,170 107,150z M218,150 C216,172 208,188 196,199 C205,186 211,170 213,150z" fill="' + C.pielSS + '" opacity=".26"/>' +
        '<path d="M146,203.5 Q160,209.5 174,203.5 Q160,206.5 146,203.5z" fill="' + C.pielSS + '" opacity=".4"/>' +
        '<g class="tgh-mejillas"><ellipse class="tgh-rubor" cx="118" cy="166" rx="13.5" ry="8.5" fill="' + C.rubor + '" opacity=".24"/>' +
        '<ellipse class="tgh-rubor" cx="202" cy="166" rx="13.5" ry="8.5" fill="' + C.rubor + '" opacity=".24"/></g>' +
      '</g>' +
      '<g class="tgh-pelo">' +
        '<path d="M101,124 C95,104 97,84 108,68 C120,52 140,44 160,44 C182,44 202,52 213,68 C223,84 225,104 219,124 C217,113 214,107 211,104 C200,90 182,84 160,84 C138,84 120,90 109,104 C106,107 103,113 101,124z" fill="' + C.peloS + '"/>' +
        '<path d="M100.5,147 C97,131 98,116 102,103 C105,104 108,106 110,109 C107.5,120 106.5,134 107.5,147 C105.5,150 102,150 100.5,147z M219.5,147 C223,131 222,116 218,103 C215,104 212,106 210,109 C212.5,120 213.5,134 212.5,147 C214.5,150 218,150 219.5,147z" fill="' + url('sien') + '"/>' +
        '<g class="tgh-tupe">' +
          '<path d="M106,107 C97,89 100,70 110,58 C112,50 118,42 126,35 C128,41 131,45 136,45 C138,35 142,29 150,24 C151,31 154,36 159,37 C162,29 166,25 174,22 C174,29 177,34 182,35 C186,31 192,30 198,31 C198,37 201,42 206,46 C216,55 223,70 222,86 C221,94 218,100 214,105 C208,91 196,83 180,81 C160,77 140,79 126,85 C116,90 110,98 106,107z" fill="' + url('pelo') + '"/>' +
          '<path d="M106,107 C110,98 116,90 126,85 C140,79 160,77 180,81 C196,83 208,91 214,105 C209,98 198,92 180,90 C160,87 140,88 126,93 C117,96 111,101 106,107z" fill="' + C.peloSS + '" opacity=".5"/>' +
          '<path d="M136,45 C128,58 124,72 124,87 M159,37 C150,50 146,66 146,81 M182,35 C174,48 170,64 170,81 M206,46 C199,58 195,70 195,84" fill="none" stroke="' + C.peloSS + '" stroke-width="1.7" stroke-linecap="round" opacity=".45"/>' +
          '<g fill="' + C.peloL + '" opacity=".8">' +
            '<path d="M113,76 C114,60 120,48 127,40 C125,52 123,63 122,77 C120,80 114,80 113,76z"/><path d="M135,72 C137,54 143,41 151,30 C149,45 148,58 147,73 C145,76 137,76 135,72z"/>' +
            '<path d="M159,69 C161,51 167,38 175,28 C173,43 172,56 171,70 C169,73 161,73 159,69z"/><path d="M183,70 C185,55 191,44 198,36 C197,49 196,60 195,73 C193,76 185,75 183,70z"/>' +
            '<path d="M204,78 C206,68 210,61 215,57 C215,66 214,74 212,82 C210,84 205,82 204,78z" opacity=".7"/></g>' +
        '</g>' +
      '</g>' +
      '<g class="tgh-cinta">' +
        '<path d="M98,96 Q160,70 222,96 L223,111 Q160,85 97,111z" fill="#19b6a6"/>' +
        '<path d="M98,96 Q160,70 222,96 L222.4,101 Q160,75 97.6,101z" fill="#3fd2c2" opacity=".9"/>' +
        '<path d="M97.4,107.5 Q160,81.5 222.6,107.5" fill="none" stroke="#0e8a7e" stroke-width="2" opacity=".75"/>' +
        '<path d="M99,103.6 Q160,77.6 221,103.6" fill="none" stroke="#f3fffd" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>' +
      '</g>' +
      '<g class="tgh-rasgos">' +
        '<g class="tgh-ceja-i"><path d="M109.5,109.5 C117,99.5 134,95.5 151,100.5 C152.6,101 152.6,105.6 150.5,106 C136,102.5 121,104 112.5,111 C110.5,112.5 108.5,111 109.5,109.5z" fill="' + C.ceja + '"/></g>' +
        '<g class="tgh-ceja-d"><path d="M210.5,109.5 C203,99.5 186,95.5 169,100.5 C167.4,101 167.4,105.6 169.5,106 C184,102.5 199,104 207.5,111 C209.5,112.5 211.5,111 210.5,109.5z" fill="' + C.ceja + '"/></g>' +
        ojo(131, 'i') + ojo(189, 'd') +
        '<path d="M161,137 L160.4,151" stroke="' + C.pielL + '" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>' +
        '<ellipse cx="160.5" cy="158.5" rx="4.6" ry="5.6" fill="' + C.pielL + '" opacity=".55"/>' +
        '<path d="M157,141 C155,151 149,158 151,164 C153,170 167,171 170,164" fill="none" stroke="' + C.pielSS + '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<g class="tgh-gafas">' +
          '<path class="tgh-patilla" d="M107,124 L95.5,129.6 M213,124 L224.5,129.6" stroke="' + C.mont + '" stroke-width="3.8" stroke-linecap="round"/>' +
          '<rect x="109" y="118" width="44" height="30" rx="7" fill="' + url('lente') + '"/><rect x="167" y="118" width="44" height="30" rx="7" fill="' + url('lente') + '"/>' +
          montura(106) + montura(164) +
          '<path d="M155,127 Q160,122.5 165,127" fill="none" stroke="' + C.mont + '" stroke-width="4.6" stroke-linecap="round"/>' +
          '<path d="M114,115.6 h30 M172,115.6 h30" stroke="' + C.montL + '" stroke-width="1.7" stroke-linecap="round"/>' +
          '<g fill="#fff" opacity=".42"><path d="M112,136 L119,121.5 h5 L112.5,145z"/><path d="M170,136 L177,121.5 h5 L170.5,145z"/></g>' +
        '</g>' +
        '<g class="tgh-boca">' +
          '<path class="tgh-boca-fondo" d="" fill="' + C.boca + '"/>' +
          '<g clip-path="' + url('bocaclip') + '"><ellipse class="tgh-lengua" cx="160" cy="197" rx="16" ry="8.5" fill="' + C.lengua + '"/>' +
          '<path class="tgh-dientes" d="" fill="' + C.diente + '"/><path class="tgh-boca-rayas" d="" fill="none" stroke="#b9aea6" stroke-width="1.1" stroke-linecap="round"/></g>' +
          '<path class="tgh-boca-linea" d="" fill="none" stroke="#8c4a3e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M125,163 q-4,4 -2,10 M195,163 q4,4 2,10" fill="none" stroke="' + C.pielSS + '" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>' +
        '</g>' +
      '</g>' +
      '<path class="tgh-gota" d="M226,74 C226,74 219.5,84.5 219.5,89.5 a6.5,6.5 0 0 0 13,0 C232.5,84.5 226,74 226,74z" fill="#8fd6fb" stroke="#3aa0d8" stroke-width="1.2" opacity="0"/>' +
    '</g>' +
    /* ══ de perfil (mira a la derecha) ══ */
    '<g class="tgh-perfil" style="display:none">' +
      '<path d="' + PERFIL + '" fill="' + url('piel') + '"/>' +
      '<g clip-path="' + url('perfclip') + '">' +
        '<path d="M150,170 C160,190 180,204 204,212 C216,210 218,198 214,188 C206,184 204,176 209,166 C196,160 170,160 150,170z" fill="#6a5140" opacity=".15"/>' +
        '<path d="M128,150 C134,176 146,196 170,210 L120,214z" fill="' + C.pielSS + '" opacity=".3"/>' +
        '<ellipse class="tgh-rubor" cx="186" cy="166" rx="12" ry="7.5" fill="' + C.rubor + '" opacity=".24"/>' +
        '<ellipse cx="196" cy="92" rx="12" ry="16" fill="' + C.pielL + '" opacity=".4"/>' +
      '</g>' +
      /* la nariz y su aleta; el surco de la boca */
      '<path d="M214,159 C210,157 207,160 207,163" fill="none" stroke="' + C.pielSS + '" stroke-width="2.2" stroke-linecap="round"/>' +
      /* el pelo: corto por detrás y por los lados, con la patilla; arriba, el tupé */
      '<path d="M199,84 C192,62 172,48 148,48 C114,48 90,74 88,110 C87,134 94,152 106,164 C110,152 116,144 124,140 C122,128 128,118 140,114 C150,112 156,108 160,102 C170,100 186,96 199,84z" fill="' + C.peloS + '"/>' +
      '<path d="M140,114 C150,112 156,108 160,102 C164,112 164,128 160,146 C156,150 152,148 152,142 C152,132 148,122 140,114z" fill="' + url('sien') + '"/>' +
      '<g class="tgh-tupe">' +
        '<path d="M200,88 C208,70 208,50 199,34 C194,40 189,42 183,40 C183,32 179,26 170,20 C168,28 164,32 158,32 C156,24 150,20 141,18 C141,26 137,30 131,32 C127,28 121,26 114,28 C116,34 114,40 108,46 C96,58 88,76 88,96 C98,80 114,70 134,66 C156,62 180,70 200,88z" fill="' + url('pelo') + '"/>' +
        '<path d="M183,40 C178,50 176,60 177,70 M158,32 C152,44 150,54 151,64 M131,32 C124,42 120,54 120,68" fill="none" stroke="' + C.peloSS + '" stroke-width="1.7" stroke-linecap="round" opacity=".45"/>' +
        '<g fill="' + C.peloL + '" opacity=".8"><path d="M188,64 C190,52 194,44 198,38 C199,48 198,58 196,68 C194,70 189,68 188,64z"/><path d="M162,58 C163,46 166,36 171,26 C172,38 171,48 170,60 C168,62 163,62 162,58z"/>' +
          '<path d="M136,60 C137,48 140,38 144,26 C146,38 145,50 144,62 C142,64 137,64 136,60z"/><path d="M110,70 C112,58 116,48 122,40 C122,52 120,62 118,72 C116,74 111,74 110,70z"/></g>' +
      '</g>' +
      '<g class="tgh-cinta">' +
        '<path d="M211,93 C170,80 126,82 88,98 L89,113 C128,97 170,95 213,108z" fill="#19b6a6"/>' +
        '<path d="M211,93 C170,80 126,82 88,98 L88.4,103 C127,87 170,85 211.8,98z" fill="#3fd2c2" opacity=".9"/>' +
        '<path d="M88.8,109.5 C128,93.5 170,91.5 212.6,104.5" fill="none" stroke="#0e8a7e" stroke-width="2" opacity=".75"/>' +
      '</g>' +
      /* la oreja */
      '<path d="M150,127 C140,122 131,131 132,146 C133,159 141,168 150,165 C157,161 159,138 150,127z" fill="' + C.piel + '" stroke="' + C.pielSS + '" stroke-width="1"/>' +
      '<path d="M147,134 C140,134 138,144 140,152 C141,156 144,158 147,157 M142,145 q4,2 3,7" fill="none" stroke="' + C.pielSS + '" stroke-width="1.9" stroke-linecap="round" opacity=".8"/>' +
      /* la ceja, el ojo y las gafas (la montura, de canto; la patilla, hasta la oreja) */
      '<g class="tgh-ceja-p"><path d="M183,111 C190,103 202,102 211,107 C212,109 211,112 209,112 C202,108 193,109 186,114 C184,115 182,113 183,111z" fill="' + C.ceja + '"/></g>' +
      '<g class="tgh-ojo-p"><path class="tgh-blanco" d="" fill="#fff"/>' +
        '<g clip-path="' + url('ojop') + '"><circle cx="199.5" cy="133" r="6.2" fill="' + url('iris') + '"/><circle cx="201" cy="133" r="3" fill="#160b05"/><circle cx="198.6" cy="130.6" r="1.8" fill="#fff"/></g>' +
        '<path class="tgh-parpado" d="" fill="none" stroke="#3d2a1c" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="tgh-gafas">' +
        '<path d="M208,123 C190,121 168,122 150,126 C146,127 144,131 145,136" fill="none" stroke="' + C.mont + '" stroke-width="3.6" stroke-linecap="round"/>' +
        '<path d="M203,117 C199,118 197,121 197,125 L197,142 C197,147 200,150 204,150 L210,150 C212,150 213,148 213,146 L213,121 C213,119 212,117 210,117z" fill="' + url('lente') + '"/>' +
        '<path fill-rule="evenodd" d="M204,113.5 h7 a4,4 0 0 1 4,4 v30 a4,4 0 0 1 -4,4 h-7 a8,8 0 0 1 -8,-8 v-22 a8,8 0 0 1 8,-8z M204.6,118.6 a4.6,4.6 0 0 0 -4.6,4.6 v19.6 a4.6,4.6 0 0 0 4.6,4.6 h4.6 a1.6,1.6 0 0 0 1.6,-1.6 v-25.6 a1.6,1.6 0 0 0 -1.6,-1.6z" fill="' + C.mont + '"/>' +
      '</g>' +
      '<g class="tgh-boca-p"><path class="tgh-bp-fondo" d="" fill="' + C.boca + '"/><path class="tgh-bp-dientes" d="" fill="#fff"/>' +
        '<path class="tgh-bp-linea" d="" fill="none" stroke="#8c4a3e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M196,166 q-4,5 -1,11" fill="none" stroke="' + C.pielSS + '" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>' +
      '<path class="tgh-gota" d="M178,70 C178,70 171.5,80.5 171.5,85.5 a6.5,6.5 0 0 0 13,0 C184.5,80.5 178,70 178,70z" fill="#8fd6fb" stroke="#3aa0d8" stroke-width="1.2" opacity="0"/>' +
    '</g>' +
    /* ══ de espaldas ══ */
    '<g class="tgh-espalda" style="display:none">' +
      '<path d="M104,130 C95,125 88,133 89,146 C90,158 97,166 105,163z" fill="' + C.pielS + '"/><path d="M216,130 C225,125 232,133 231,146 C230,158 223,166 215,163z" fill="' + C.pielS + '"/>' +
      '<path d="' + CARA + '" fill="' + C.pielS + '"/>' +
      '<path d="M102,150 C101,120 100,96 108,74 C120,52 140,44 160,44 C182,44 202,52 213,74 C220,96 219,120 218,150 C216,170 208,184 196,190 C184,196 136,196 124,190 C112,184 104,170 102,150z" fill="' + C.peloS + '"/>' +
      '<path d="M124,190 C136,196 184,196 196,190 C190,200 176,206 160,206 C144,206 130,200 124,190z" fill="' + C.peloSS + '" opacity=".4"/>' +
      '<path d="M130,120 C128,140 130,160 136,180 M160,116 L160,186 M190,120 C192,140 190,160 184,180" fill="none" stroke="' + C.peloSS + '" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>' +
      '<g class="tgh-tupe"><path d="M106,104 C97,86 100,68 110,58 C112,50 118,42 126,35 C128,41 131,45 136,45 C138,35 142,29 150,24 C151,31 154,36 159,37 C162,29 166,25 174,22 C174,29 177,34 182,35 C186,31 192,30 198,31 C198,37 201,42 206,46 C216,55 223,70 222,86 C221,94 218,100 214,104 C200,96 180,92 160,92 C140,92 120,96 106,104z" fill="' + url('pelo') + '"/>' +
        '<path d="M136,45 C130,58 128,72 128,90 M159,37 C156,52 156,70 157,90 M182,35 C182,50 184,70 188,90" fill="none" stroke="' + C.peloSS + '" stroke-width="1.7" stroke-linecap="round" opacity=".4"/></g>' +
      '<g class="tgh-cinta"><path d="M98,100 Q160,112 222,100 L223,115 Q160,127 97,115z" fill="#19b6a6"/><path d="M97.4,111.5 Q160,123.5 222.6,111.5" fill="none" stroke="#0e8a7e" stroke-width="2" opacity=".75"/>' +
        '<path d="M150,112 L140,138 L152,134 L156,120z M170,112 L180,138 L168,134 L164,120z" fill="#19b6a6"/><circle cx="160" cy="114" r="7" fill="#0e8a7e"/></g>' +
    '</g>';
    var q = function (s) { return g.querySelector(s); };
    this.R = {
      frente: q('.tgh-frente'), perfil: q('.tgh-perfil'), espalda: q('.tgh-espalda'),
      rasgos: q('.tgh-frente .tgh-rasgos'), tupe: q('.tgh-frente .tgh-tupe'), tupeP: q('.tgh-perfil .tgh-tupe'), tupeE: q('.tgh-espalda .tgh-tupe'), orejaI: q('.tgh-oreja-i'), orejaD: q('.tgh-oreja-d'), mejillas: q('.tgh-mejillas'),
      cejaI: q('.tgh-ceja-i'), cejaD: q('.tgh-ceja-d'), cejaP: q('.tgh-ceja-p'),
      iris: Array.prototype.slice.call(g.querySelectorAll('.tgh-iris')), rubor: Array.prototype.slice.call(g.querySelectorAll('.tgh-rubor')),
      bocaF: q('.tgh-boca-fondo'), bocaD: q('.tgh-dientes'), bocaL: q('.tgh-boca-linea'), bocaR: q('.tgh-boca-rayas'), lengua: q('.tgh-lengua'),
      bocaClip: this.defs.querySelector('.tgh-boca-forma'),
      ojo: {
        i: { blanco: q('.tgh-ojo-i .tgh-blanco'), hueco: this.defs.querySelector('.tgh-hueco-i'), sombra: q('.tgh-ojo-i .tgh-sombra'), parpado: q('.tgh-ojo-i .tgh-parpado'), bajo: q('.tgh-ojo-i .tgh-bajo'), pliegue: q('.tgh-ojo-i .tgh-pliegue') },
        d: { blanco: q('.tgh-ojo-d .tgh-blanco'), hueco: this.defs.querySelector('.tgh-hueco-d'), sombra: q('.tgh-ojo-d .tgh-sombra'), parpado: q('.tgh-ojo-d .tgh-parpado'), bajo: q('.tgh-ojo-d .tgh-bajo'), pliegue: q('.tgh-ojo-d .tgh-pliegue') }
      },
      ojoP: { blanco: q('.tgh-ojo-p .tgh-blanco'), hueco: this.defs.querySelector('.tgh-hueco-p'), parpado: q('.tgh-ojo-p .tgh-parpado') },
      bpF: q('.tgh-bp-fondo'), bpD: q('.tgh-bp-dientes'), bpL: q('.tgh-bp-linea'),
      gotas: Array.prototype.slice.call(g.querySelectorAll('.tgh-gota'))
    };
    /* el estado de la cara: cada cosa va hacia su meta con suavidad */
    this.e = EMO.contento; this.emo = 'contento';
    this.v = { aI: 1, aD: 1, bb: 0.25, cIy: 0, cIr: 0, cDy: 0, cDr: 0, mx: 0, my: 0, rubor: 0.24, sudor: 0 };
    this.m = { aI: 1, aD: 1, bb: 0.25, cIy: 0, cIr: 0, cDy: 0, cDr: 0, mx: 0, my: 0, rubor: 0.24, sudor: 0 };
    this.boca = 'sonrisa'; this.bocaBase = 'sonrisa'; this.parp = 0; this.parpT = -1; this.prox = 1.4; this.t = 0; this.habla = 0; this.bocaT = 0;
    this.vista = ''; this.escala = 0.195;
    /* el tupé va un instante detrás de la cabeza: dos muelles (se ladea, se estira) y de dónde venía */
    this.peloA = new Muelle(17, 0.25); this.peloY = new Muelle(20, 0.3); this.cAnt = null; this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; this.dt = 0; this.corte = true;
  }
  /* la cabeza de perfil: el cráneo, la frente, la nariz, los labios, el mentón y la mandíbula */
  var PERFIL = 'M150,50 C176,48 200,62 208,86 C211,96 212,104 211,110 C209,114 207,117 208,121 C210,128 216,138 224,147 C229,152 231,155 228,158 C225,160 218,160 214,160 C212,163 213,166 216,169 C218,171 219,173 217,175 C216,176 216,178 217,180 C218,183 216,186 213,187 C210,188 209,190 210,193 C213,199 213,205 207,209 C200,213 188,212 176,208 C162,204 150,198 142,190 C134,182 130,170 128,158 C120,156 106,150 98,140 C88,126 86,104 94,84 C104,62 126,50 150,50z';
  var BOCAS_P = {
    sonrisa: { f: 'M218,174 C211,175 204,174 199,170 C199,180 208,186 216,181z', d: 'M217,175 C211,176 205,175 201,172 C202,176 205,178 208,179 C212,179 215,178 217,177z', l: 'M218,174 C211,175 204,174 199,170' },
    cerrada: { f: '', d: '', l: 'M218,175 C211,178 204,177 199,171' },
    seria: { f: '', d: '', l: 'M218,176 C211,177 205,177 200,176' },
    ay: { f: 'M218,172 C211,171 204,172 200,175 C200,180 203,184 209,185 C213,185 216,183 218,180z', d: 'M218,172 C211,171 204,172 200,175 C200,180 203,184 209,185 C213,185 216,183 218,180z', l: 'M218,172 C211,171 204,172 200,175 C200,180 203,184 209,185 C213,185 216,183 218,180z M201,178 L217,176.5' },
    sopla: { f: 'M219,173 C215,171 210,172 208,176 C208,181 212,184 217,182z', d: '', l: 'M219,173 C215,171 210,172 208,176 C208,181 212,184 217,182' },
    habla: { f: 'M218,173 C211,173 205,173 201,172 C201,180 206,185 213,184 C216,183 218,180 218,178z', d: 'M217,174 C211,174 206,174 203,173.4 L204,176.4 C208,177.4 213,177.4 217,176.6z', l: 'M218,173 C211,173 205,173 201,172' }
  };
  /* el gesto de la cara */
  Cabeza.prototype.emocion = function (n) {
    var e = EMO[n] || EMO.contento, o = e.ojos || [1, 1], c = e.cejas || [0, 0, 0, 0], m = this.m;
    this.emo = EMO[n] ? n : 'contento'; this.e = e;
    m.aI = o[0]; m.aD = o[1]; m.bb = e.entorna || 0; m.cIy = c[0]; m.cIr = -c[1]; m.cDy = c[2]; m.cDr = c[3];
    m.rubor = e.rubor == null ? 0.24 : e.rubor;
    this.bocaBase = e.boca || 'sonrisa'; if (!this.habla) this.boca = this.bocaBase;
  };
  Cabeza.prototype.sudar = function (cuanto) { this.m.sudor = cuanto ? 1 : 0; };
  Cabeza.prototype.hablar = function (seg) { this.habla = seg ? this.t + seg : 0; if (!seg) this.boca = this.bocaBase; };
  Cabeza.prototype.letra = function (ch) { var v = visema(ch); this.boca = v || this.bocaBase; };
  Cabeza.prototype.parpadea = function () { if (this.parpT < 0) this.parpT = 0; };
  /* un paso de tiempo: el parpadeo, la boca que habla y lo que va hacia su meta */
  Cabeza.prototype.paso = function (dt, parado) {
    var v = this.v, m = this.m, k = parado ? 1 : 1 - Math.exp(-dt * 14), n;
    if (parado) dt = 0;
    this.t += dt; this.dt = dt;
    /* los ojos van de un punto a otro de un salto corto, no deslizándose */
    for (n in m) v[n] += (m[n] - v[n]) * (n === 'sudor' ? 1 - Math.exp(-dt * 3) : (n === 'mx' || n === 'my') ? (parado ? 1 : 1 - Math.exp(-dt * 26)) : k);
    if (this.parpT < 0 && this.t > this.prox) this.parpT = 0;
    if (this.parpT >= 0) {
      this.parpT += dt; var f = this.parpT / 0.15;
      this.parp = f < 0.5 ? f * 2 : f < 1 ? 2 - f * 2 : 0;
      if (f >= 1) { this.parpT = -1; this.parp = 0; this.prox = this.t + (Math.random() < 0.2 ? 0.2 : 2.4 + Math.random() * 3.2); }
    }
    if (this.habla > this.t) {
      this.bocaT -= dt;
      if (this.bocaT <= 0) { this.bocaT = 0.085 + Math.random() * 0.06; this.boca = ['a', 'poco', 'e', 'o', 'poco', 'cerrada', 'e', 'a'][Math.floor(Math.random() * 8)]; }
    } else if (this.habla) { this.habla = 0; this.boca = this.bocaBase; }
  };
  /* Coloca la cabeza según el esqueleto y la cámara, elige el dibujo y pinta la cara. */
  Cabeza.prototype.pintar = function (E, cam, lista) {
    var R = this.R, Bc = E.Bc, f = cam.d(Bc[2]), up = cam.d(Bc[1]), pos = cam.p(E.cab), k = this.escala * cam.esc, v = this.v;
    var kx = punto(cam.k, Bc[0]), ky = punto(cam.k, Bc[1]), kz = f[2];
    /* con histéresis, para que no baile entre dos dibujos en el umbral */
    var vista = this.vista;
    if (vista === 'frente') { if (kz < 0.52) vista = kz < -0.6 ? 'espalda' : 'perfil'; }
    else if (vista === 'espalda') { if (kz > -0.52) vista = kz > 0.6 ? 'frente' : 'perfil'; }
    else if (vista === 'perfil') { if (kz > 0.68) vista = 'frente'; else if (kz < -0.68) vista = 'espalda'; }
    else vista = kz > 0.6 ? 'frente' : kz < -0.6 ? 'espalda' : 'perfil';
    if (vista !== this.vista) {
      this.vista = vista;
      R.frente.style.display = vista === 'frente' ? '' : 'none'; R.perfil.style.display = vista === 'perfil' ? '' : 'none'; R.espalda.style.display = vista === 'espalda' ? '' : 'none';
    }
    var parp = this.parp, e = this.e, ojos = e.ojos || [1, 1];
    /* el tupé: lo que cambia la velocidad de la cabeza (el tirón), visto en la pantalla y en unidades del dibujo */
    var tir = [0, 0], dtp = this.dt;
    if (this.corte || !this.cAnt || quieto()) { this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; this.peloA.x = this.peloA.v = this.peloY.x = this.peloY.v = 0; this.corte = false; }
    else if (dtp > 0) {
      var mov = menos(E.cab, this.cAnt);
      if (largo(mov) > 22) { this.vF = [0, 0, 0]; this.vS = [0, 0, 0]; }
      else { var vel = por(mov, 1 / dtp); this.vF = mezcla(this.vF, vel, 1 - Math.exp(-dtp / 0.04)); this.vS = mezcla(this.vS, vel, 1 - Math.exp(-dtp / 0.18)); }
      var tw = cam.d(menos(this.vF, this.vS)); tir = [tw[0] / this.escala, tw[1] / this.escala];
    }
    this.cAnt = E.cab;
    var pelo = function (g, giro, vol, cx, cy, extra) {
      /* al dibujo: se deshace su giro (y su volteo, de perfil) */
      var cg = Math.cos(giro * RAD), sg = Math.sin(giro * RAD), lx = tir[0] * cg + tir[1] * sg, ly = (-tir[0] * sg + tir[1] * cg) * vol;
      var a = yo0.peloA.paso(entre(-0.024 * lx, -6, 6), dtp), sy = 1 + yo0.peloY.paso(entre(0.0003 * ly, -0.035, 0.045), dtp);
      pon(g, 'transform', (extra || '') + 'rotate(' + n1(a) + ' ' + cx + ' ' + cy + ') translate(0,' + n1(cy * (1 - sy)) + ') scale(1,' + n2(sy) + ')');
    }, yo0 = this;
    if (vista === 'perfil') {
      var fl = Math.sqrt(f[0] * f[0] + f[1] * f[1]) || 1, ang = Math.atan2(f[1], f[0]) / RAD;
      var a = ang * RAD, sx = Math.sin(a), cx = Math.cos(a);
      /* tras girar, el «arriba» del dibujo es (sen, −cos); si no coincide con el de la cabeza, se voltea */
      var vol = (sx * up[0] - cx * up[1]) < 0 ? -1 : 1;
      pon(this.g, 'transform', 'translate(' + n1(pos[0]) + ',' + n1(pos[1]) + ') rotate(' + n1(ang) + ') scale(' + n2(k) + ',' + n2(k * vol) + ') translate(-150,-206)');
      pelo(R.tupeP, ang, vol, 146, 84);
      /* el ojo que se ve: el del lado de la cámara */
      var ab = (kx > 0 ? v.aI : v.aD) * (1 - parp), aa = entre(ab, 0, 1.3);
      var clave = aa.toFixed(2);
      if (R.ojoP._c !== clave) {
        R.ojoP._c = clave;
        var t = 134 - 8.5 * aa, b = 134 + 5.5 * Math.min(1, aa);
        var hu = 'M188,134 C191,' + n1(t) + ' 200,' + n1(t - 1) + ' 205,132.6 C201,' + n1(b + 1) + ' 192,' + n1(b + 1) + ' 188,134z';
        R.ojoP.blanco.setAttribute('d', hu); R.ojoP.hueco.setAttribute('d', hu);
        R.ojoP.parpado.setAttribute('d', 'M187,134.4 C191,' + n1(t) + ' 200,' + n1(t - 1) + ' 206,132.4');
      }
      pon(R.cejaP, 'transform', 'translate(0,' + n2(-(kx > 0 ? v.cIy : v.cDy)) + ') rotate(' + n2((kx > 0 ? -v.cIr : v.cDr) * 0.8) + ' 197 108)');
      var bp = BOCAS_P[this.habla ? (this.boca === 'cerrada' || this.boca === 'poco' ? 'cerrada' : 'habla') : (BOCAS_P[this.bocaBase] ? this.bocaBase : (BOCAS[this.bocaBase] && BOCAS[this.bocaBase].f ? 'sonrisa' : 'cerrada'))];
      if (R._bp !== bp) { R._bp = bp; R.bpF.setAttribute('d', bp.f); R.bpD.setAttribute('d', bp.d); R.bpL.setAttribute('d', bp.l); }
    } else {
      var roll = Math.atan2(up[0], -up[1]) / RAD;
      pon(this.g, 'transform', 'translate(' + n1(pos[0]) + ',' + n1(pos[1]) + ') rotate(' + n1(roll) + ') scale(' + n2(k) + ') translate(-160,-214)');
      if (vista === 'frente') {
        /* los rasgos se corren hacia donde mira la cabeza; el tupé, menos; las orejas, al revés */
        var s = kz < 0 ? -1 : 1, dx = -kx * 40 * s, dy = ky * 30 * s, ap = 1 - 0.22 * Math.abs(kx);
        pon(R.rasgos, 'transform', 'translate(' + n1(160 + dx) + ',' + n1(dy) + ') scale(' + n2(ap) + ',1) translate(-160,0)');
        pon(R.mejillas, 'transform', 'translate(' + n1(dx * 0.7) + ',' + n1(dy * 0.6) + ')');
        pelo(R.tupe, roll, 1, 160, 98, 'translate(' + n1(dx * 0.3) + ',' + n1(dy * 0.2) + ') ');
        pon(R.orejaI, 'transform', 'translate(' + n1(-dx * 0.42) + ',' + n1(-dy * 0.3) + ')'); pon(R.orejaD, 'transform', 'translate(' + n1(-dx * 0.42) + ',' + n1(-dy * 0.3) + ')');
        pon(R.orejaI, 'opacity', dx > 14 ? '0' : '1'); pon(R.orejaD, 'opacity', dx < -14 ? '0' : '1');
        pon(R.cejaI, 'transform', 'translate(0,' + n2(-v.cIy) + ') rotate(' + n2(v.cIr) + ' 130 104)'); pon(R.cejaD, 'transform', 'translate(0,' + n2(-v.cDy) + ') rotate(' + n2(v.cDr) + ' 190 104)');
        var entorna = entre(v.bb, -0.5, 1.2), bbS = entorna.toFixed(2), yo = this;
        ['i', 'd'].forEach(function (kk, n) {
          var a2 = entre((n ? v.aD : v.aI) * (1 - parp), 0, 1.4), arcoO = ojos[n] < 0.2 ? (e.arco || 0) : -9, cl = a2.toFixed(2) + '|' + bbS + '|' + arcoO, o = R.ojo[kk];
          if (o._c === cl) return; o._c = cl;
          var F = ojoFormas(n ? 189 : 131, a2, entorna, arcoO, n ? 1 : -1);
          o.blanco.setAttribute('d', F.hueco); o.hueco.setAttribute('d', F.hueco); o.sombra.setAttribute('d', F.sombra); o.parpado.setAttribute('d', F.parpado); o.bajo.setAttribute('d', F.bajo); o.pliegue.setAttribute('d', F.pliegue);
        });
        var ir = 'translate(' + n2(v.mx * 3.4) + ',' + n2(v.my * 2.8) + ')';
        if (R._ir !== ir) { R._ir = ir; R.iris.forEach(function (gg) { gg.setAttribute('transform', ir); }); }
        if (R._boca !== this.boca) {
          R._boca = this.boca;
          var b2 = BOCAS[this.boca] || BOCAS.sonrisa;
          R.bocaF.setAttribute('d', b2.f); R.bocaClip.setAttribute('d', b2.f); R.bocaD.setAttribute('d', b2.d); R.bocaL.setAttribute('d', b2.l); R.bocaR.setAttribute('d', b2.r || '');
          R.lengua.style.display = b2.f && !b2.r ? '' : 'none';
        }
      } else pelo(R.tupeE, roll, 1, 160, 98);
    }
    var ru = n2(v.rubor);
    if (R._ru !== ru) { R._ru = ru; R.rubor.forEach(function (gg) { gg.setAttribute('opacity', ru); }); }
    var su = n2(entre(v.sudor, 0, 1) * (0.55 + 0.45 * Math.sin(this.t * 3.1)));
    if (R._su !== su) { R._su = su; R.gotas.forEach(function (gg) { gg.setAttribute('opacity', su); gg.setAttribute('transform', 'translate(0,' + n1((this.t * 9) % 14) + ')'); }, this); }
    lista.push({ z: cam.p(mas(E.cab, aplicar(Bc, [0, 13, 0])))[2] + 3, el: this.g });
  };
