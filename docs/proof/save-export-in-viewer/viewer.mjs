// Proof for card save-export-in-viewer, in a real browser. The page runs twice per view:
//   viewer: inside a frame with a window.claude stub, as the claude.ai Artifact viewer serves it (it grants no downloads)
//   page:   top level with no window.claude, as Netlify serves it
// Each run opens the bell > Settings > Save code, presses the second export button and records what happens.
// Run: node tools/build.mjs && node docs/proof/save-export-in-viewer/viewer.mjs   (shots land in docs/proof/save-export-in-viewer/shots)
import fs from 'node:fs';
import path from 'node:path';
import { findBrowser } from '../../../tools/lib/browser.mjs';
import { ROOT, loadCore } from '../../../tools/lib/core.mjs';
import { view, contextOptions } from '../../../tools/lib/views.mjs';

const KEY = 'lanternfall.save.v5', ORIGIN = 'https://lanternfall.proof/';
const html = fs.readFileSync(path.join(ROOT, 'dist', 'lanternfall.html'), 'utf8');
const save = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-mid.json'), 'utf8'));
save.last = Date.now();
const host = '<title>viewer host</title><style>html,body{margin:0;height:100%;background:#000}iframe{border:0;width:100%;height:100%;display:block}</style><iframe src="/game"></iframe>';
const shots = path.join(path.dirname(new URL(import.meta.url).pathname), 'shots');
fs.mkdirSync(shots, { recursive: true });

const core = loadCore({ seed: 1 });   // decodes a shown code with the game's own strict check
const bt = findBrowser();
const browser = await bt.pw.chromium.launch({ executablePath: bt.exe, args: ['--no-sandbox'] });
const out = []; let bad = 0;
try {
  for (const v of ['desktop', 'landscape', 'portrait']) for (const mode of ['viewer', 'page']) {
    const ctx = await browser.newContext(contextOptions(view(v)));
    const page = await ctx.newPage(), errors = [], downloads = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('download', d => downloads.push(d.suggestedFilename()));
    await page.addInitScript(([k, raw, viewer]) => {
      try { localStorage.setItem(k, raw); } catch (e) {}
      if (viewer && window.self !== window.top) window.claude = { use: () => Promise.resolve(null) };
    }, [KEY, JSON.stringify(save), mode === 'viewer']);
    await page.route('**/*', r => {
      const u = new URL(r.request().url());
      if (u.origin !== new URL(ORIGIN).origin) return r.abort();
      if (u.pathname === '/game' || (mode === 'page' && u.pathname === '/')) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
      if (u.pathname === '/') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: host });
      return r.abort();
    });
    await page.goto(ORIGIN);
    const game = mode === 'viewer' ? page.frameLocator('iframe') : page;
    try { await game.locator('#lfLoad').waitFor({ state: 'detached', timeout: 60000 }); }
    catch (e) { throw new Error(`${v} ${mode}: the game never booted; page errors: ${errors.join(' | ') || 'none'}`); }
    await page.waitForTimeout(1500);
    for (let i = 0; i < 8; i++) {   // a story card or the away report may sit on top: close it as a player would
      const btn = game.locator('.bsheet-ov button, .away-ov button').filter({ hasText: /^(Skip|Continue|Collect|Got it|Close)$/ }).first();
      if (!(await btn.count())) break; await btn.dispatchEvent('click'); await page.waitForTimeout(700);
    }
    await game.locator('#bellBtn').click();
    await page.waitForTimeout(600);
    try { await game.locator('.nlog-seg button', { hasText: 'Settings' }).first().click({ timeout: 8000 }); }
    catch (e) { await page.screenshot({ path: path.join(shots, `${v}-${mode}-stuck.png`) }); throw e; }
    const sec = game.locator('#sec-savecode');
    await sec.scrollIntoViewIfNeeded();
    const labels = await sec.locator('button').allTextContents();
    const second = mode === 'viewer' ? 'Show save code' : 'Download file';
    await sec.getByRole('button', { name: second, exact: true }).click();
    await page.waitForTimeout(800);
    const box = sec.locator('.savecode-fallback');
    const shown = (await box.count()) ? await box.inputValue() : '';
    const decoded = shown ? core.eval(`(r => r.ok ? 'a valid save of ' + r.data.name + ', zone ' + r.data.maxZone : 'BAD: ' + r.error)(decodeSave(${JSON.stringify(shown)}))`) : '';
    if (await box.count()) await box.scrollIntoViewIfNeeded();
    const shot = `${v}-${mode}.png`;
    await page.screenshot({ path: path.join(shots, shot) });
    const ok = mode === 'viewer'
      ? labels.includes('Show save code') && !labels.includes('Download file') && decoded.startsWith('a valid') && downloads.length === 0 && !errors.length
      : labels.includes('Download file') && !labels.includes('Show save code') && !shown && downloads.length === 1 && /^lanternfall-save-\d{8}\.txt$/.test(downloads[0]) && !errors.length;
    if (!ok) bad++;
    out.push(`${ok ? 'ok  ' : 'FAIL'} ${v.padEnd(9)} ${mode.padEnd(6)} buttons [${labels.join(', ')}] pressed "${second}" -> ` +
      (mode === 'viewer' ? `code box ${shown ? shown.length + ' chars, starts ' + shown.slice(0, 4) + ', decodes to ' + decoded : 'MISSING'}, downloads ${downloads.length}` : `downloads [${downloads.join(', ')}], code box ${shown ? 'SHOWN' : 'none'}`) +
      `, page errors ${errors.length}  (${shot})`);
    await ctx.close();
  }
} finally { await browser.close(); }
console.log(out.join('\n'));
process.exit(bad ? 1 : 0);
