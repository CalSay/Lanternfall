// map-study/shots.mjs: renders the study PNGs into docs/design/img/map/ (MAP0 scratch).
// node prototypes/map-study/shots.mjs [out-dir] [--only a-screen,h-strip] [--fonts dir]
// Needs the global playwright package and /opt/pw-browsers/chromium (as tools/perf.mjs).
// Google Fonts: pass --fonts <dir> holding handjet.css, barlow.css and the woff2 files (named
// s_<path with / as _>), or the page falls back to Arial Narrow.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const req = createRequire(import.meta.url);
let pw; for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright']) { try { pw = req(p); break; } catch (e) {} }
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const out = args[0] && !args[0].startsWith('--') ? path.resolve(args[0]) : path.resolve(here, '../../docs/design/img/map');
const only = opt('--only') ? opt('--only').split(',') : null, fontDir = opt('--fonts');
fs.mkdirSync(out, { recursive: true });
const exe = ['/opt/pw-browsers/chromium/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome', '/opt/pw-browsers/chromium'].find(p => { try { return fs.statSync(p).isFile(); } catch (e) { return false; } });
const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const JOBS = [];
for (const k of ['a', 'b', 'c', 'h']) {
  JOBS.push({ name: `map-${k}-screen`, q: `style=${k.toUpperCase()}&view=screen`, w: 360, h: 740, dpr: 2, sel: '.phone' });
  JOBS.push({ name: `map-${k}-full`, q: `style=${k.toUpperCase()}&view=full`, w: 360, h: 740, dpr: 2, sel: '.phone' });
  JOBS.push({ name: `map-${k}-closeups`, q: `style=${k.toUpperCase()}&view=sheet`, w: 1000, h: 800, dpr: 1, sel: '.sheet' });
}
JOBS.push({ name: 'map-h-strip', q: 'style=H&view=strip', w: 600, h: 600, dpr: 1, sel: '.sheet' });
JOBS.push({ name: 'map-overview', q: 'style=A&view=overview', w: 1240, h: 900, dpr: 1, sel: '.ov', last: 1 });
for (const j of JOBS) {
  if (only && !only.includes(j.name.replace(/^map-/, ''))) continue;
  const ctx = await browser.newContext({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: j.dpr });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('[page]', j.name, e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('[console]', j.name, m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, async route => {
    const u = new URL(route.request().url());
    if (!fontDir) return route.abort();
    if (u.hostname === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: fs.readFileSync(path.join(fontDir, u.search.includes('Handjet') ? 'handjet.css' : 'barlow.css'), 'utf8') });
    const f = path.join(fontDir, u.pathname.replace(/^\//, 's_').replace(/^s_s\//, 's_').replace(/\//g, '_'));
    return fs.existsSync(f) ? route.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : route.abort();
  });
  await page.goto('file://' + path.join(here, 'index.html') + '?' + j.q);
  await page.waitForSelector('body[data-ready="1"]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const el = await page.$(j.sel);
  await el.screenshot({ path: path.join(out, j.name + '.png') });
  const ms = await page.evaluate(() => document.body.dataset.ms);
  console.log('wrote', j.name + '.png', ms ? 'bake ms ' + ms : '');
  await ctx.close();
}
await browser.close();
