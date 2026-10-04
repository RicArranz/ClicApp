/* Prueba de humo: juega los 20 niveles con ratón simulado, abriendo index.html por file://
   Uso:  node test/jugar.js [carpeta_capturas]        (necesita playwright, p. ej. /root/rp/node_modules)  */
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
const shotDir = process.argv[2] || null;

(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage({ viewport: { width: +(process.env.W || 1366), height: +(process.env.H || 768) } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));

  const wait = ms => page.waitForTimeout(ms);
  const centers = sel => page.evaluate(s => [...document.querySelectorAll(s)].map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top }; }), sel);
  const click = async (sel, i = 0, opt) => { const c = (await centers(sel))[i]; if (!c) throw new Error('no hay ' + sel); await page.mouse.click(c.x, c.y, opt); return c; };
  const dblclick = async (sel, i = 0) => { const c = (await centers(sel))[i]; if (!c) throw new Error('no hay ' + sel); await page.mouse.click(c.x, c.y); await wait(120); await page.mouse.click(c.x, c.y); };
  const drag = async (from, to) => {
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    for (let k = 1; k <= 12; k++) { await page.mouse.move(from.x + (to.x - from.x) * k / 12, from.y + (to.y - from.y) * k / 12); await wait(10); }
    await page.mouse.up(); await wait(80);
  };
  const stageRect = async () => (await centers('#stage'))[0];

  const solvers = {
    1: async () => { for (const c of await centers('.lamp')) { await page.mouse.move(c.x, c.y, { steps: 5 }); await wait(40); } },
    2: async () => { for (let n = 0; n < 8; n++) { const l = await centers('.tgt'); if (!l.length) break; await page.mouse.click(l[0].x, l[0].y); await wait(60); } },
    3: async () => {
      for (let n = 0; n < 60; n++) {
        const l = await centers('.bug:not(.caught)'); if (!l.length) break;
        await page.mouse.move(l[0].x, l[0].y, { steps: 4 }); await wait(80);
        const l2 = await centers('.bug:not(.caught)'); if (!l2.length) break;
        await page.mouse.move(l2[0].x, l2[0].y); await page.mouse.click(l2[0].x, l2[0].y); await wait(60);
      }
    },
    4: async () => { for (let n = 0; n < 4; n++) { const l = await centers('.chest.tgt'); if (!l.length) break; await page.mouse.click(l[0].x, l[0].y); await wait(100); await page.mouse.click(l[0].x, l[0].y); await wait(120); } },
    5: async () => { for (let n = 0; n < 8; n++) { const l = await centers('.carrot.tgt'); if (!l.length) break; await page.mouse.click(l[0].x, l[0].y); await wait(100); await page.mouse.click(l[0].x, l[0].y); await wait(700); } },
    6: async () => { await dblclick('.folder', 0); await wait(200); await click('.wclose'); },
    7: async () => { for (let n = 0; n < 3; n++) { const s = (await centers('.seed'))[0], p = (await centers('.pot.tgt'))[0]; await drag(s, p); } },
    8: async () => { const can = (await centers('.can'))[0], tap = (await centers('.tap'))[0]; await drag(can, tap); const can2 = (await centers('.can'))[0], pl = (await centers('.plantz'))[0]; await drag(can2, pl); },
    9: async () => {
      const kinds = ['tomate', 'berenjena', 'zanahoria', 'tomate', 'zanahoria', 'berenjena'], bx = { tomate: 0, zanahoria: 1, berenjena: 2 };
      const order = kinds.slice();
      for (let n = 0; n < order.length; n++) { const v = (await centers('.veg'))[0], b = (await centers('.basket'))[bx[kinds[order.length - (await centers('.veg')).length]]]; await drag(v, b); }
    },
    10: async () => {
      const t = (await centers('.movable .wtitle'))[0], o = (await centers('.outl'))[0]; await drag(t, o); await wait(500);
      const sl = (await centers('.sl'))[0]; await page.mouse.move(sl.x - sl.w / 2 + 5, sl.y); await page.mouse.down(); await page.mouse.move(sl.l + sl.w * 0.79, sl.y, { steps: 8 }); await page.mouse.up();
    },
    11: async () => { const s = await stageRect(); await drag({ x: s.l + s.w * 0.08, y: s.t + s.h * 0.1 }, { x: s.l + s.w * 0.52, y: s.t + s.h * 0.88 }); },
    12: async () => { for (const w of ['agua', 'sol', 'semillas']) { const c = (await centers('[data-w="' + w + '"]'))[0]; if (!c) break; await page.mouse.dblclick(c.x, c.y); await wait(150); } },
    13: async () => { for (const i of [1, 2]) { const c = (await centers('[data-i="' + i + '"]'))[0]; await page.mouse.click(c.x, c.y, { clickCount: 3 }); await wait(150); } },
    14: async () => { for (let n = 0; n < 12; n++) { await page.mouse.move(600, 400); await page.mouse.wheel(0, 700); await wait(80); } await wait(200); await click('.gold'); },
    15: async () => { await page.evaluate(() => { const s = document.querySelector('.scroller'); s.scrollLeft = 99999; }); await wait(200); await click('.gold'); },
    16: async () => {
      const sets = [[1, 0], [0, 1], [1, 1]];
      for (let i = 0; i < 3; i++) {
        await page.evaluate(([x, y]) => { const s = document.querySelector('.scroller'); s.scrollLeft = x ? 99999 : 0; s.scrollTop = y ? 99999 : 0; }, i === 0 ? [1, 0] : i === 1 ? [0, 1] : [1, 1]);
        await wait(200);
        const t = (await centers('.tgt'))[0]; if (!t) break;
        // el objetivo de esta esquina es el visible
        const vis = (await centers('.tgt')).filter(c => c.x > 0 && c.y > 0 && c.x < +(process.env.W || 1366) && c.y < +(process.env.H || 768));
        if (vis[0]) await page.mouse.click(vis[0].x, vis[0].y);
        await wait(100);
      }
    },
    17: async () => { await click('.rclick', 0, { button: 'right' }); await wait(100); await click('.mi.tgt'); },
    18: async () => {
      for (const [i, lab] of [[0, 0], [1, 0], [2, 0]]) {
        const l = await centers('.rclick.tgt'); if (!l.length) break;
        await page.mouse.click(l[0].x, l[0].y, { button: 'right' }); await wait(100); await click('.mi.tgt'); await wait(700);
      }
    },
    19: async () => {
      await click('.rclick', 0, { button: 'right' }); await wait(100); await click('.mi', 0); await wait(100);
      for (let n = 0; n < 3; n++) { const p = (await centers('.patch'))[0]; await page.mouse.click(p.x, p.y, { button: 'right' }); await wait(100); await click('.mi', 1); await wait(150); }
    },
  };
  const masterOrder = [2, 4, 8, 12, 14, 17];

  // ---- inicio: validación del nombre ----
  await page.click('#form-start .btn-go', { force: true });
  if (!(await page.isVisible('#name-error'))) errors.push('no avisa de nombre vacío');
  await page.fill('#in-name', 'lorena');
  await page.click('#form-start .btn-go', { force: true });
  await wait(300);
  const nm = await page.textContent('#lvl-num'); if (!/Nivel 1 de 20/.test(nm)) errors.push('indicador de nivel: ' + nm);

  for (let lvl = 1; lvl <= 20; lvl++) {
    const label = await page.textContent('#lvl-num');
    if (!label.includes('Nivel ' + lvl + ' de')) { errors.push('Nivel esperado ' + lvl + ' pero: ' + label); break; }
    if (shotDir) await page.screenshot({ path: path.join(shotDir, 'n' + String(lvl).padStart(2, '0') + '.png') });
    try {
      if (lvl < 20) await solvers[lvl]();
      else {
        for (const id of masterOrder) {
          await wait(400);
          if (shotDir && id === 14) await page.screenshot({ path: path.join(shotDir, 'n20_scroll.png') });
          await solvers[id]();
          await wait(1500);
        }
      }
    } catch (e) { errors.push('Nivel ' + lvl + ' solver: ' + e.message); }
    try { await page.waitForSelector('#modal-win:not([hidden])', { timeout: 4000 }); }
    catch (e) { errors.push('Nivel ' + lvl + ': no se abrió la modal de éxito. Feedback: ' + (await page.textContent('#feedback')) + ' | contador: ' + (await page.textContent('#counter'))); if (shotDir) await page.screenshot({ path: path.join(shotDir, 'fallo' + lvl + '.png') }); break; }
    const t = await page.textContent('#win-title'); if (!/Lorena/.test(t)) errors.push('modal sin nombre: ' + t);
    if (shotDir && (lvl === 1 || lvl === 20)) await page.screenshot({ path: path.join(shotDir, 'modal' + lvl + '.png') });
    await page.click('#btn-next', { force: true }); await wait(250);
  }
  if (await page.isVisible('#screen-end')) {
    if (shotDir) await page.screenshot({ path: path.join(shotDir, 'final.png') });
    const t = await page.textContent('#end-name'); if (t !== 'Lorena') errors.push('final sin nombre');
    await page.click('#btn-restart', { force: true }); await wait(200);
    if (!(await page.isVisible('#screen-start')) || (await page.inputValue('#in-name')) !== '') errors.push('volver al inicio falla');
  } else errors.push('no se llegó a la pantalla final');

  console.log(errors.length ? 'FALLOS:\n- ' + errors.join('\n- ') : 'OK: 20 niveles superados, sin errores de consola');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
