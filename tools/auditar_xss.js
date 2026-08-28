#!/usr/bin/env node
/* Regresion de XSS: siembra datos hostiles y comprueba que salen como texto.
 *   python3 -m http.server 8766 & node tools/auditar_xss.js [puerto]  */
'use strict';
const PUERTO = process.argv[2] || 8766;
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PAY = '<img src=x onerror="window.PWNED=1">';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
                                    args: ['--no-proxy-server', '--no-sandbox'] });
  const p = await (await b.newContext({ serviceWorkers: 'block' })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(4500);
  const r = await p.evaluate(PAY => {
    const o = {};
    const stop = { id: 'x', stopId: '9999', nombre: PAY, municipio: PAY, lat: 28.4, lng: -16.3,
                   esTerminal: true, panel: 'https://evil.com/x' };
    const lines = [{ id: 'bus-x', numero: PAY, color: 'red" onload="window.PWNED=1', nombre: PAY }];
    const html = buildBusStopPopup(stop, lines);
    const d = document.createElement('div'); d.innerHTML = html; document.body.appendChild(d);
    o.payloadComoTexto   = d.textContent.indexOf('<img src=x') !== -1;
    o.imgInyectados      = d.querySelectorAll('img').length;
    o.atributosHostiles  = [...d.querySelectorAll('*')].filter(e => [...e.attributes].some(a => /^on/i.test(a.name))).length;
    d.remove();
    const pon = u => buildBusStopPopup(Object.assign({}, stop, { panel: u }), lines);
    o.panelEvil          = pon('https://evil.com/x').indexOf('evil.com') === -1;
    o.panelJavascript    = pon('javascript:alert(1)').indexOf('javascript:') === -1;
    o.panelSubdominio    = pon('https://metrotenerife.com.evil.com/x').indexOf('evil.com') === -1;
    o.panelHttp          = pon('http://opendata.metrotenerife.com/x').indexOf('http://') === -1;
    o.panelLegitimo      = pon('https://opendata.metrotenerife.com/p/1').indexOf('opendata.metrotenerife.com') !== -1;
    return o;
  }, PAY);
  await p.waitForTimeout(300);
  const pwn = await p.evaluate(() => !!window.PWNED);
  const espera = { payloadComoTexto: true, imgInyectados: 0, atributosHostiles: 0,
                   panelEvil: true, panelJavascript: true, panelSubdominio: true,
                   panelHttp: true, panelLegitimo: true };
  let mal = 0;
  for (const [k, v] of Object.entries(espera)) {
    const ok = r[k] === v;
    if (!ok) mal++;
    console.log('  ' + (ok ? '   ' : '<--') + ' ' + k.padEnd(20) + ' ' + JSON.stringify(r[k]));
  }
  console.log('  ' + (pwn ? '<--' : '   ') + ' ' + 'window.PWNED'.padEnd(20) + ' ' + pwn);
  console.log('  ' + (errs.length ? '<--' : '   ') + ' ' + 'pageerrors'.padEnd(20) + ' ' + errs.length);
  if (pwn) mal++;
  await b.close();
  console.log(mal ? '\n*** ' + mal + ' fallo(s) ***' : '\nregresion en verde');
  process.exit(mal ? 1 : 0);
})();
