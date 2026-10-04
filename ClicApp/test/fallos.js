
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const found = [];
const bad = (m) => { found.push(m); console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  async function nueva(w = 1366, h = 768, hash = '') {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('dialog', d => { errs.push('dialog: ' + d.message()); d.dismiss(); });
    await page.goto(URL + hash); page.errs = errs; return page;
  }
  const start = async (p, name) => { await p.fill('#in-name', name); await p.click('#form-start .btn-go', { force: true }); await p.waitForTimeout(300); };
  const C = (p, s) => p.evaluate(s => [...document.querySelectorAll(s)].map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top }; }), s);
  const fb = p => p.textContent('#feedback');

  console.log('1. Nombres raros');
  let p = await nueva();
  await start(p, '<img src=x onerror=alert(1)><b>x</b>');
  if (await p.evaluate(() => !!document.querySelector('#bubble img, #bubble b + b img'))) bad('el nombre inyecta HTML en el bocadillo'); else ok('HTML del nombre escapado en el bocadillo');
  if ((await p.textContent('#bubble')).indexOf('<img') < 0) bad('el nombre no se muestra literal'); else ok('el nombre se muestra literal');
  if (p.errs.length) bad('errores: ' + p.errs.join('|'));
  await p.close();
  p = await nueva(); await p.fill('#in-name', '     '); await p.click('#form-start .btn-go', { force: true });
  (await p.isVisible('#name-error')) ? ok('nombre de solo espacios rechazado') : bad('acepta nombre de solo espacios');
  await p.fill('#in-name', 'maría josé del carmen de la cruz'); await p.click('#form-start .btn-go', { force: true }); await p.waitForTimeout(300);
  const shown = await p.evaluate(() => document.querySelector('#bubble b').textContent); console.log('    nombre largo →', shown);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth); ov ? bad('desbordamiento horizontal con nombre largo') : ok('sin desbordamiento con nombre largo');
  await p.close();

  console.log('2. Enter en el campo de nombre y recarga');
  p = await nueva(); await p.fill('#in-name', 'Ana'); await p.press('#in-name', 'Enter'); await p.waitForTimeout(300);
  (await p.isVisible('#screen-game')) ? ok('Enter empieza el juego') : bad('Enter no empieza');
  await p.reload(); await p.waitForTimeout(300);
  (await p.isVisible('#screen-start')) ? ok('tras recargar vuelve al inicio') : bad('tras recargar no está en inicio');
  (await p.inputValue('#in-name')) === 'Ana' ? ok('nombre recordado en la pestaña') : bad('nombre no recordado');
  await p.close();

  console.log('3. Clics equivocados en cada tipo de nivel');
  p = await nueva(1366, 768, '#nivel=4'); await start(p, 'Ana');
  let c = (await C(p, '.chest'))[0]; await p.mouse.click(c.x, c.y); await p.waitForTimeout(1100);
  (/solo clic|DOS clics/.test(await fb(p))) ? ok('L4: un solo clic da aviso') : bad('L4 sin aviso tras un clic: ' + await fb(p));
  await p.mouse.click(c.x, c.y); await p.waitForTimeout(1000); await p.mouse.click(c.x, c.y); await p.waitForTimeout(100);
  (await p.evaluate(() => document.querySelectorAll('.chest.armed').length)) ? ok('L4: clics lentos no abren (correcto)') : bad('L4: estado armed raro');
  await p.mouse.click(c.x, c.y, { button: 'right' }); await p.waitForTimeout(100);
  (/IZQUIERDO/.test(await fb(p))) ? ok('L4: clic derecho avisa') : bad('L4: clic derecho sin aviso');
  if (await p.evaluate(() => !!document.querySelector('.cmenu'))) bad('L4: salió un menú contextual'); 
  await p.close();

  p = await nueva(1366, 768, '#nivel=8'); await start(p, 'Ana');
  let can = (await C(p, '.can'))[0], pl = (await C(p, '.plantz'))[0];
  await p.mouse.move(can.x, can.y); await p.mouse.down(); await p.mouse.move(pl.x, pl.y, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(100);
  (/vacía/.test(await fb(p))) ? ok('L8: regar sin llenar avisa') : bad('L8 sin aviso: ' + await fb(p));
  await p.waitForTimeout(600); let after = (await C(p, '.can'))[0]; Math.abs(after.x - can.x) < 3 ? ok('L8: la regadera vuelve a su sitio') : bad('L8: la regadera no volvió');
  await p.waitForTimeout(600); await p.mouse.move(can.x, can.y); await p.mouse.down(); await p.mouse.move(can.x - 120, can.y + 20, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(100);
  (/Casi/.test(await fb(p))) ? ok('L8: soltar en el vacío avisa') : bad('L8 soltar fuera sin aviso: ' + await fb(p));
  await p.mouse.click(can.x, can.y); await p.waitForTimeout(100);
  (/MANTÉN/.test(await fb(p))) ? ok('L8: clic sin arrastrar explica cómo') : bad('L8 clic sin aviso');
  await p.close();

  p = await nueva(1366, 768, '#nivel=9'); await start(p, 'Ana');
  let v = (await C(p, '.veg'))[0], bs = await C(p, '.basket');
  await p.mouse.move(v.x, v.y); await p.mouse.down(); await p.mouse.move(bs[1].x, bs[1].y, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(100);
  const nveg = (await C(p, '.veg')).length; console.log('    verduras tras soltar tomate en cesta 2:', nveg, '| aviso:', await fb(p));
  await p.close();

  p = await nueva(1366, 768, '#nivel=17'); await start(p, 'Ana');
  c = (await C(p, '.rclick'))[0]; await p.mouse.click(c.x, c.y);
  (/DERECHO/.test(await fb(p))) ? ok('L17: clic izquierdo avisa') : bad('L17 sin aviso');
  await p.mouse.click(c.x, c.y, { button: 'right' }); await p.waitForTimeout(100);
  const mi = await C(p, '.mi'); await p.mouse.click(mi[1].x, mi[1].y); await p.waitForTimeout(100);
  (/Regar/.test(await fb(p))) && !(await p.isVisible('#modal-win')) ? ok('L17: opción equivocada no gana') : bad('L17: opción equivocada: ' + await fb(p));
  await p.mouse.click(c.x, c.y, { button: 'right' }); await p.mouse.click(40, 700); await p.waitForTimeout(100);
  (await p.evaluate(() => document.querySelectorAll('.cmenu').length)) === 0 ? ok('L17: clic fuera cierra el menú') : bad('L17: el menú no se cierra al hacer clic fuera');
  await p.mouse.click(c.x, c.y, { button: 'right' }); await p.keyboard.press('Escape');
  (await p.evaluate(() => document.querySelectorAll('.cmenu').length)) === 0 ? ok('L17: Esc cierra el menú') : bad('L17: Esc no cierra el menú');
  await p.close();

  console.log('4. Selección de texto');
  p = await nueva(1366, 768, '#nivel=12'); await start(p, 'Ana');
  c = (await C(p, '[data-w="sol"]'))[0]; await p.mouse.dblclick(c.x, c.y); await p.waitForTimeout(150);
  (/Esa no es/.test(await fb(p))) ? ok('L12: palabra equivocada avisa') : bad('L12 palabra equivocada: ' + await fb(p));
  c = (await C(p, '[data-w="agua"]'))[0]; await p.mouse.dblclick(c.x, c.y); await p.waitForTimeout(150);
  const w1 = await p.evaluate(() => document.querySelector('[data-w="agua"]').className); w1.includes('ok') ? ok('L12: «agua» aceptada') : bad('L12 agua no aceptada: ' + await fb(p));
  await p.close();
  p = await nueva(1366, 768, '#nivel=13'); await start(p, 'Ana');
  c = (await C(p, '[data-i="0"]'))[0]; await p.mouse.click(c.x, c.y, { clickCount: 3 }); await p.waitForTimeout(150);
  (/no es la frase/.test(await fb(p))) ? ok('L13: frase equivocada avisa') : bad('L13: ' + await fb(p));
  // arrastrar solo media frase
  const l1 = (await C(p, '[data-i="1"]'))[0]; await p.mouse.move(l1.l + 6, l1.y); await p.mouse.down(); await p.mouse.move(l1.l + l1.w * 0.4, l1.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(150);
  (/Falta un trozo/.test(await fb(p))) ? ok('L13: media frase avisa') : console.log('    aviso media frase:', await fb(p));
  await p.close();

  console.log('5. Selección con rectángulo (L11)');
  p = await nueva(1366, 768, '#nivel=11'); await start(p, 'Ana');
  const st = (await C(p, '#stage'))[0];
  const drag = async (a, b) => { await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(b.x, b.y, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(100); };
  await drag({ x: st.l + st.w * .05, y: st.t + st.h * .1 }, { x: st.l + st.w * .95, y: st.t + st.h * .95 });
  (/piedra/.test(await fb(p))) ? ok('L11: rectángulo con piedras avisa') : bad('L11: ' + await fb(p));
  await drag({ x: st.l + st.w * .05, y: st.t + st.h * .05 }, { x: st.l + st.w * .1, y: st.t + st.h * .1 });
  (/nada seleccionado/.test(await fb(p))) ? ok('L11: rectángulo vacío avisa') : bad('L11: ' + await fb(p));
  await p.close();

  console.log('6. Scroll');
  p = await nueva(1366, 768, '#nivel=14'); await start(p, 'Ana');
  const g = (await C(p, '.gold'))[0];
  (g.y > 768) ? ok('L14: la calabaza no está a la vista al empezar') : bad('L14: la calabaza ya está visible');
  await p.mouse.click(800, 300); await p.waitForTimeout(100);
  (/Todavía/.test(await fb(p))) ? ok('L14: clic en vacío avisa') : bad('L14: sin aviso');
  await p.setViewportSize({ width: 1000, height: 600 }); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('.scroller').scrollTop = 99999; }); await p.waitForTimeout(150);
  const g2 = (await C(p, '.gold'))[0]; (g2.y > 0 && g2.y < 600) ? ok('L14: tras redimensionar sigue alcanzable') : bad('L14: tras redimensionar la calabaza queda fuera: y=' + g2.y);
  await p.close();
  p = await nueva(1366, 768, '#nivel=16'); await start(p, 'Ana');
  const reach = await p.evaluate(() => { const s = document.querySelector('.scroller'); const out = []; document.querySelectorAll('.tgt').forEach(t => { const r = t.getBoundingClientRect(), sr = s.getBoundingClientRect(); out.push([r.left - sr.left + s.scrollLeft, r.top - sr.top + s.scrollTop, s.scrollWidth, s.scrollHeight]); }); return out; });
  reach.every(r => r[0] > 0 && r[1] > 0 && r[0] < r[2] && r[1] < r[3]) ? ok('L16: los 3 tesoros están dentro del mapa') : bad('L16: tesoro fuera del mapa ' + JSON.stringify(reach));
  await p.close();

  console.log('7. Flujo: salir, doble clic en SIGUIENTE, volver');
  p = await nueva(1366, 768, '#nivel=2'); await start(p, 'Ana');
  for (const t of await C(p, '.tgt')) { await p.mouse.click(t.x, t.y); await p.waitForTimeout(40); }
  await p.waitForSelector('#modal-win:not([hidden])');
  const nb = (await C(p, '#btn-next'))[0]; await p.mouse.dblclick(nb.x, nb.y); await p.waitForTimeout(500);
  const lab = await p.textContent('#lvl-num'); /Nivel 3 de/.test(lab) ? ok('doble clic en SIGUIENTE avanza un solo nivel') : bad('doble clic en SIGUIENTE → ' + lab);
  await p.click('#btn-home'); (await p.isVisible('#modal-exit')) ? ok('«Inicio» pide confirmación') : bad('Inicio sin confirmación');
  await p.click('#btn-stay', { force: true }); await p.click('#btn-home'); await p.click('#btn-leave', { force: true }); await p.waitForTimeout(200);
  (await p.isVisible('#screen-start')) && (await p.inputValue('#in-name')) === '' ? ok('salir limpia el nombre') : bad('salir no limpia');
  p.errs.length ? bad('errores: ' + p.errs.join('|')) : ok('sin errores de consola en el flujo');
  await p.close();

  console.log('8. Reloj/temporizadores tras cambiar de nivel (avisos de un nivel en otro)');
  p = await nueva(1366, 768, '#nivel=4'); await start(p, 'Ana');
  c = (await C(p, '.chest'))[0]; await p.mouse.click(c.x, c.y);   // deja un expirado pendiente
  await p.click('#btn-home'); await p.click('#btn-leave', { force: true }); await p.fill('#in-name', 'Ana'); await p.evaluate(() => { location.hash = '#nivel=1'; });
  await p.click('#form-start .btn-go', { force: true }); await p.waitForTimeout(1200);
  (/solo clic|DOS clics/.test(await fb(p))) ? bad('aviso de L4 aparece en otro nivel') : ok('no se cuelan avisos de niveles anteriores');
  await p.close();

  console.log('9. Pantallas pequeñas / grandes (¿se corta algo?)');
  for (const [w, h] of [[1024, 600], [1280, 600], [1600, 900], [2560, 1440]]) {
    for (const n of [1, 10, 18]) {
      p = await nueva(w, h, '#nivel=' + n); await start(p, 'Ana'); await p.waitForTimeout(200);
      const r = await p.evaluate(() => {
        const st = document.querySelector('#stage').getBoundingClientRect(), out = [];
        document.querySelectorAll('#stage .it').forEach(i => { const r = i.getBoundingClientRect(); if (r.width && (r.right < st.left + 5 || r.left > st.right - 5 || r.bottom < st.top + 5 || r.top > st.bottom - 5)) out.push(i.className); });
        const b = document.querySelector('#btn-pista').getBoundingClientRect();
        return { fuera: out, pista: b.bottom <= innerHeight + 1, vh: innerHeight };
      });
      (r.fuera.length || !r.pista) ? bad(`${w}x${h} nivel ${n}: ` + (r.fuera.length ? 'objetos fuera del escenario ' + r.fuera.join(',') : '') + (!r.pista ? ' «Ayúdame» cortado' : '')) : ok(`${w}x${h} nivel ${n} correcto`);
      await p.close();
    }
  }

  console.log('\n' + (found.length ? found.length + ' FALLO(S):\n- ' + found.join('\n- ') : 'Sin fallos encontrados'));
  await browser.close();
})();
