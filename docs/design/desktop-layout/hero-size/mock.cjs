// hero-screen-size-ruling mock: NOT game code. Loads a scratch copy of the built page with the landscape zoom floor
// patched (integer zooms only) and shoots the fight. Usage: node mock.cjs <dist.html> <outdir> <option> [save.json] [sizes]
const fs = require('fs'), path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [,, DIST, OUT, OPT, SAVEF, SIZESARG] = process.argv;
fs.mkdirSync(OUT, { recursive: true });
const KEY = 'lanternfall.save.v5', s = JSON.parse(fs.readFileSync(SAVEF, 'utf8'));
const SIZES = (SIZESARG || '1280x720,1920x1080,1366x640,740x360,360x740').split(',').map(x => x.split('x').map(Number));
const ORIG = 'LAND_ZOOMS = [2, 3, 4], LAND_MIN_W = 360, LAND_MIN_H = 280';
const OPTS = { A: ORIG, B: 'LAND_ZOOMS = [2, 3, 4], LAND_MIN_W = 300, LAND_MIN_H = 220', C: 'LAND_ZOOMS = [2, 3, 4], LAND_MIN_W = 360, LAND_MIN_H = 250' };
function html() { let h = fs.readFileSync(DIST, 'utf8'); if (!h.includes(ORIG)) throw new Error('zoom line not found');
  h = h.replace(ORIG, OPTS[OPT]); const end = h.lastIndexOf('})();\n</script>');
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + h.slice(0, end) + '\n;window.__t = { x: src => eval(src) };\n' + h.slice(end); }
const MEASURE = () => {
  const r = sel => { const e = [...document.querySelectorAll(sel)].find(e => e.offsetParent || getComputedStyle(e).position === 'fixed'); if (!e) return null; const b = e.getBoundingClientRect(); if (!b.width && !b.height) return null; return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  let st = null, rc = null; try { st = window.__t.x('stageStats()'); rc = window.__t.x('stageRects()'); } catch (e) {}
  const cv = document.getElementById('cv').getBoundingClientRect();
  const sb = document.querySelector('.stagebox').getBoundingClientRect(); let txtB = 0, txtWho = '';
  for (const e of document.querySelectorAll('.stagebox *')) { if (e.closest('.sbar') || e.tagName === 'CANVAS') continue;
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (!b.width || cs.visibility === 'hidden' || +cs.opacity === 0 || b.top > sb.top + sb.height / 2 || b.top < sb.top + 60) continue; if (b.bottom > txtB) { txtB = b.bottom; txtWho = e.textContent.trim().slice(0, 30); } }
  const f = st && st.foes && st.foes[0], foeTopCss = f ? Math.round(sb.top + (f[2] - f[4]) * st.ZM) : null, heroTopCss = rc && rc.hero ? Math.round(sb.top + rc.hero.y * st.ZM) : null;
  const heroH = rc && rc.hero ? Math.round((st.GY - rc.hero.y) * st.ZM) : null;
  return { txtBottom: Math.round(txtB), txtWho, foeTopCss, heroTopCss, heroH, heroShare: heroH && Math.round(100 * heroH / sb.height), foeH: f && f[4] * st.ZM, stage: r('.stagebox'), cv: [Math.round(cv.x), Math.round(cv.y), Math.round(cv.width), Math.round(cv.height)], ZM: st && st.ZM, SW: st && st.SW, SH: st && st.SH, GY: st && st.GY, hudB: st && st.hudB, tall: st && st.tall,
    front: st && st.front, foes: st && st.foes, rects: rc, sbar: r('.sbar'), vs: r('.vs-card, .tb-vs, .turn-vs'), toasts: r('#toasts'), hud: r('.hud') };
};
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const body = html(), t0 = s.last + 1000;
  for (const [w, h] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); page.on('pageerror', e => console.log('PAGEERROR', w + 'x' + h, String(e)));
    await page.clock.install({ time: t0 });
    await page.addInitScript(([k, raw]) => { try { if (!sessionStorage.getItem('__in')) { sessionStorage.setItem('__in', '1'); localStorage.setItem(k, raw); } } catch (e) {} }, [KEY, JSON.stringify(s)]);
    await page.route('**/*', r => r.request().url() === 'http://lf.test/' ? r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }) : r.abort());
    await page.goto('http://lf.test/', { waitUntil: 'commit' });
    for (let i = 0; i < 60 && !(await page.evaluate(() => !!document.querySelector('.tab')).catch(() => false)); i++) await page.clock.runFor(200);
    await page.clock.runFor(3000);
    for (let i = 0; i < 6; i++) { const b = await page.$('.away-ov button, .mm-ov button, .ob-bub .ob-x, .bsheet-ov .bsheet-x'); if (!b) break; await b.click({ force: true }).catch(() => {}); await page.clock.runFor(600); }
    await page.keyboard.press('Escape').catch(() => {}); await page.clock.runFor(600);
    const extra = process.env.EVAL; if (extra) { await page.evaluate(src => window.__t.x(src), extra).catch(e => console.log('EVALERR', String(e))); }
    const VIEW = process.env.VIEW || 'fight';
    if (VIEW === 'camp') { await page.click('.tab[data-tab="world"]', { force: true }).catch(e => console.log('NOCAMP')); await page.clock.runFor(800); }
    if (VIEW === 'gather') { const b = await page.$('#modeSeg button:nth-child(2)'); if (b) await b.click({ force: true }); else console.log('NOGATHER'); await page.clock.runFor(1500); }
    const frames = (process.env.FRAMES || '0,1500,3000').split(',').map(Number); let last = 0;
    for (const at of frames) { await page.clock.runFor(Math.max(1, at - last)); last = at;
      const file = `${process.env.TAG || ''}${OPT}-${w}x${h}-${at}.png`; await page.screenshot({ path: path.join(OUT, file) });
      console.log(JSON.stringify({ shot: file, ...(await page.evaluate(MEASURE)) })); }
    await ctx.close();
  }
  await browser.close();
})();
