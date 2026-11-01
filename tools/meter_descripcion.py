#!/usr/bin/env python3
"""meter_descripcion.py — mete descripciones rehechas en idiomas/<lang>.json.

   python3 tools/meter_descripcion.py <idioma> <fichero.json con {id: texto}>

   COMPRUEBA QUE EL TEXTO ES DE ESE LUGAR. Un id que no existe ya se veia;
   lo que no se veia era un id que SI existe pero es otro sitio: el texto
   entraba sin una queja y quedaba una ficha hablando de lo que no es.
   Paso de verdad -pp-teide no existia y el sitio se llama pp-izana- y solo
   se noto por mirarlo a mano. Ahora se exige que las cifras del castellano
   esten en la traduccion, que es lo que comparten dos textos del mismo
   lugar y no comparten dos textos de sitios distintos."""
import io, json, re, sys, os, subprocess, unicodedata
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lang, fich = sys.argv[1], sys.argv[2]

node = subprocess.run(['node', '-e', '''
const fs=require("fs");const src=fs.readFileSync("RAIZ_AQUI/index.html","utf8");
const i=src.indexOf("const places = [");const o=src.indexOf("[",i);
let d=0,q=null,fin=0;
for(let k=o;k<src.length;k++){const c=src[k],p=src[k-1];
 if(q){if(c===q&&p!=="\\\\")q=null;continue;}
 if(c==='"'||c==="'"||c==="`"){q=c;continue;}
 if(c==="[")d++;else if(c==="]"){d--;if(d===0){fin=k+1;break;}}}
const P=eval("("+src.slice(o,fin)+")");
const out={};P.forEach(p=>{if(p.desc&&typeof p.desc.es==="string")out[p.id]=p.desc.es;});
process.stdout.write(JSON.stringify(out));
'''.replace('RAIZ_AQUI', RAIZ)], capture_output=True, text=True)
ES = json.loads(node.stdout)

def cifras(s):
    s = re.sub(r'(?<=\d)[\s  ](?=\d{3}(?!\d))', '', s)
    s = re.sub(r'(\d+(?:[.,]\d+)?)\s*[万萬]', lambda m: ' %d ' % round(float(m.group(1).replace(',', '.')) * 10000), s)
    return sorted(re.findall(r'\d{2,}', s.replace('.', '').replace(',', '')))

ruta = os.path.join(RAIZ, 'idiomas', lang + '.json')
d = json.load(open(ruta, encoding='utf-8'))
nuevos = json.load(open(fich, encoding='utf-8'))
mal = []
for pid, txt in nuevos.items():
    if pid not in d or 'desc' not in d[pid]:
        mal.append('no existe o no tiene desc: ' + pid); continue
    esp = ES.get(pid, '')
    a, b = cifras(esp), cifras(txt)
    faltan = [x for x in a if x not in b]
    if faltan:
        mal.append('%s: la traduccion no trae %s. El castellano dice: %s'
                   % (pid, faltan, esp[:80]))
        continue
    # Las cifras no bastan: hay descripciones que no tienen ninguna, y ahi el
    # control decia que si a cualquier cosa. Lo que comparten dos textos del
    # MISMO lugar y no dos de sitios distintos son los nombres propios. En los
    # idiomas de alfabeto latino se escriben igual; en chino y bulgaro van
    # transliterados y esta comprobacion no se puede hacer.
    if lang in ('en', 'fr', 'de', 'it', 'nl'):
        # SOLO las mayusculas que NO abren frase. Una palabra en mayuscula
        # detras de un punto no dice nada: "Area recreativa...", "Fogones
        # gratuitos...", "Pinar canario..." son nombres comunes, y exigir que
        # la traduccion los repita hacia fallar textos correctos -el frances
        # escribe "Espace", "Barbecues" y "Pinede"-. Es el mismo error que ya
        # aparecio en auditar_cirilico.py con el bulgaro.
        propios = set(re.findall(r'(?<![.!?:;]\s)(?<!^)\b[A-ZÁÉÍÓÚÑ][a-záéíóúñü]{3,}',
                                 esp, re.MULTILINE))
        propios -= {'Playa','Puerto','Parque','Centro','Punta','Calle','Avenida',
                    'Mercado','Museo','Campo','Zona','Ruta','Barranco','Piscina',
                    'Ideal','Acceso','Horario','Tiene','Para','Desde','Muy','Una',
                    'Como','Este','Esta','Sin','Con','Entre','Bien','Cerca'}
        # Por la RAIZ, no por la palabra entera: el aleman escribe
        # "Teneriffas" donde el castellano pone "Tenerife", y el control
        # cantaba una traduccion correcta. Cinco letras bastan para
        # distinguir y siguen sin colar un texto de otro sitio.
        # Y SIN TILDES. El aleman escribe "Atlantiks" donde el castellano
        # pone "Atlantico": cinco letras coinciden, pero la tilde de la a no,
        # y el control cantaba una traduccion correcta.
        def pelar(x):
            return unicodedata.normalize('NFD', x).encode('ascii', 'ignore').decode().lower()
        txtPelado = pelar(txt)
        if propios and not any(pelar(n)[:5] in txtPelado for n in propios):
            mal.append('%s: la traduccion no nombra ninguno de %s. El castellano dice: %s'
                       % (pid, sorted(propios)[:6], esp[:80]))
if mal:
    print('NO se escribe nada:')
    for m in mal: print('   ' + m)
    sys.exit(1)
for pid, txt in nuevos.items():
    d[pid]['desc'] = txt
with io.open(ruta, 'w', encoding='utf-8') as fh:
    fh.write('{\n' + ',\n'.join(' ' + json.dumps(k) + ': ' + json.dumps(d[k], ensure_ascii=False) for k in d) + '\n}\n')
print('metidas: %d en %s' % (len(nuevos), lang))
