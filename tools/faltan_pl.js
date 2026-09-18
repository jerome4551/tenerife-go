#!/usr/bin/env node
/* Que le falta a un idioma nuevo, tabla por tabla y con el castellano al lado.
 *   node tools/faltan_pl.js pl            resumen por tabla
 *   node tools/faltan_pl.js pl TABLA      los textos de esa tabla
 */
'use strict';
const fs=require('fs'),path=require('path');
const acorn=require('/opt/node22/lib/node_modules/eslint/node_modules/acorn');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const L=process.argv[2]||'pl', SOLO=process.argv[3]||null;
/* Las tablas declaradas SIN-TRADUCIR en el fuente no son huecos: son codigos
   y titulos exactos. wikiTitleOverrides guarda los titulos de articulos que
   YA EXISTEN en cada Wikipedia, y un titulo inventado no devuelve el
   articulo, devuelve nada. Contarlas aqui como pendientes seria invitar a
   rellenarlas a ojo. */
const EXENTAS = new Set(
  [...src.matchAll(/SIN-TRADUCIR:\s*([A-Za-z_$][\w$]*)/g)].map(m => m[1]));
const bloques=[];{const re=/<script\b([^>]*)>/gi;let m;
 while((m=re.exec(src))){if(/src=/i.test(m[1]))continue;
  if(/type=/i.test(m[1])&&!/javascript|module/i.test(m[1]))continue;
  const ini=m.index+m[0].length,fin=src.indexOf('</script>',ini);
  if(fin>0)bloques.push({ini,js:src.slice(ini,fin)});}}
const linea=i=>src.slice(0,i).split('\n').length;
const res={};
function texto(js,n){
  if(n.type==='Literal')return String(n.value);
  if(n.type==='TemplateLiteral')return js.slice(n.start,n.end);
  return '«'+n.type+'»';
}
for(const b of bloques){
  let ast;try{ast=acorn.parse(b.js,{ecmaVersion:'latest'})}catch(e){continue}
  (function walk(n,nom){
    if(!n||typeof n!=='object')return;
    if(n.type==='ObjectExpression'){
      const props=n.properties.filter(p=>p.type==='Property');
      const cl=props.map(p=>p.key.name||p.key.value);
      if(cl.includes('es')&&cl.includes('en')&&cl.includes('fr')){
        const t=nom||'(anonima)';
        if(!cl.includes(L)&&!EXENTAS.has(t)){
          const es=props.find(p=>(p.key.name||p.key.value)==='es');
          (res[t]=res[t]||[]).push({ln:linea(b.ini+n.start),es:texto(b.js,es.value),
                                    esNodo:es.value.type});
        }
        return;
      }
    }
    let nuevo=nom;
    if(n.type==='VariableDeclarator'&&n.id&&n.id.name)nuevo=n.id.name;
    for(const k in n){if(k==='start'||k==='end'||k==='loc')continue;const v=n[k];
      if(Array.isArray(v))v.forEach(x=>walk(x,nuevo));
      else if(v&&typeof v==='object'&&v.type)walk(v,nuevo);}
  })(ast,null);
}
if(SOLO){
  for(const f of (res[SOLO]||[])) console.log('L'+f.ln+'  '+f.es);
  console.log('('+(res[SOLO]||[]).length+' filas en '+SOLO+')');
}else{
  let t=0;
  for(const [k,v] of Object.entries(res).sort((a,b)=>b[1].length-a[1].length)){
    console.log(String(v.length).padStart(4)+'  '+k+'   (L'+v[0].ln+'…)');t+=v.length;}
  console.log('\n'+t+' filas sin '+L);
}
