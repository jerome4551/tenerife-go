/* El analizador de JavaScript (acorn), donde lo tenga el entorno de las pruebas.
   El de octubre de 2026 lo traia dentro de eslint
   (/opt/node22/lib/node_modules/eslint/node_modules/acorn); el que se renovo el
   30 de octubre ya no, y lo tiene en /opt/node-tools/node_modules/acorn. Las
   herramientas lo pedian por la primera ruta y, sin el, unas no corrian y otras
   se saltaban sin decirlo lo que lo necesita. Aqui se busca en las dos y, si no
   esta en ninguna, el require normal, que falla diciendo que falta. */
const fs = require('fs');
const SITIOS = [
  '/opt/node22/lib/node_modules/eslint/node_modules/acorn',
  '/opt/node-tools/node_modules/acorn',
];
module.exports = require(SITIOS.find(p => fs.existsSync(p)) || 'acorn');
