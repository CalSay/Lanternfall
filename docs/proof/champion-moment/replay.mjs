// Proof for card champion-moment: the zone 5 Champion falls at 740x360 and 360x740. The pre scene closes, the first clear shows the post scene, then one Champion card with the cache in it.
import fs from 'node:fs'; import path from 'node:path';
import { findBrowser } from '../../../tools/lib/browser.mjs';
const ROOT = path.resolve(import.meta.dirname, '..', '..', '..');   // run: node docs/proof/champion-moment/replay.mjs (after node tools/build.mjs)
const { pw, exe } = await findBrowser();
const html0 = fs.readFileSync(ROOT + '/dist/lanternfall.html', 'utf8'), end = html0.lastIndexOf('})();\n</script>');
const html = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + html0.slice(0, end) + '\n;window.__t = { x: src => eval(src) };\n' + html0.slice(end);
const raw = fs.readFileSync(ROOT + '/tests/fixtures/save-mid.json', 'utf8');
const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
for (const [w, h] of [[740, 360], [360, 740]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, turns: true });
  await ctx.addInitScript(([k, rw]) => { try { localStorage.setItem('lanternfall.test.moments', '1'); } catch (e) {}
    if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); const o = JSON.parse(rw); o.last = Date.now(); localStorage.setItem(k, JSON.stringify(o)); }, ['lanternfall.save.v5', raw]);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.route('**/*', r => r.request().url() === 'http://lf.test/' ? r.fulfill({ status: 200, body: html, headers: { 'content-type': 'text/html; charset=utf-8' } }) : r.abort());
  await page.goto('http://lf.test/'); await page.waitForTimeout(800);
  for (let i = 0; i < 4; i++) { const b = await page.$('#createScreen .create-go'); if (!b) break; await b.click(); await page.waitForTimeout(300); }
  const X = s => page.evaluate(s => window.__t.x(s), s);
  await page.waitForTimeout(4600);
  await X(`S.tab=''; S.onboard.tips=false; S.story.seen={}; MOMENT_Q.length=0; true`);
  const st = async () => X(`JSON.stringify({ sheet: !!document.querySelector('.bsheet-ov'), mm: !!document.querySelector('.mm-ov'), mmEye: (document.querySelector('.mm-eye')||{}).textContent, q: MOMENT_Q.map(x=>x.kind), busy: storyBusy(), held: storyHeld() })`);
  const tag = `${w}x${h}`;
  await X(`S.activity='fight'; S.zone=5; S.maxZone=5; S.cache.opened = 0; fightBoss=true; spawn(); true`);
  await page.waitForTimeout(1500);
  console.log(tag, 'after spawn', await st());
  for (let i = 0; i < 6; i++) { const b = await page.$('.bsheet-ov .sty-done, .bsheet-ov .sty-next, .bsheet-ov button'); if (!b) break; await b.click(); await page.waitForTimeout(400); }
  console.log(tag, 'pre closed', await st());
  await X(`killPack(mob, 40); true`);
  await page.waitForTimeout(900);
  console.log(tag, 'after kill', await st());
  await page.screenshot({ path: `${ROOT}/docs/proof/champion-moment/scene-${tag}.png` });
  const seq = [];
  for (let i = 0; i < 40; i++) {
    const s = JSON.parse(await st()); seq.push(s.sheet ? 'sheet' : s.mm ? 'card:' + s.mmEye : '-');
    if (s.mm) { await page.waitForTimeout(900); await page.screenshot({ path: `${ROOT}/docs/proof/champion-moment/card-${tag}.png` }); const t = await X(`document.querySelector('.mm-card').innerText`); console.log(tag, 'CARD', JSON.stringify(t)); const r = await X(`(() => { const c = document.querySelector('.mm-card').getBoundingClientRect(); return [c.top, c.bottom, innerHeight, document.querySelector('.mm-go').getBoundingClientRect().bottom]; })()`); console.log(tag, 'rect', r); await page.click('.mm-go'); await page.waitForTimeout(400); seq.push('closed'); break; }
    const b = await page.$('.bsheet-ov .sty-done, .bsheet-ov .sty-next, .bsheet-ov button'); if (b) { await b.click(); } await page.waitForTimeout(600);
  }
  console.log(tag, 'sequence', seq.join(' > '), 'errs', errs);
  await ctx.close();
}
await browser.close();
