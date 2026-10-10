#!/usr/bin/env node
// Cold load of the split build on a throttled link (card asset-build's check; docs/design/hosting.md 9 card 3). Read only.
//   node tools/build.mjs --split && node docs/design/hosting/cold-load.mjs [--mbps 1.6] [--rtt 150]
// Serves dist/lanternfall-split.html and dist/assets/ from a local server that answers in Brotli quality 4 (the cautious stand-in
// for Netlify's, see measure.mjs), opens it in a fresh browser on Lighthouse's "slow 4G" (1.6 Mbps down, 150 ms round trip) and
// prints when the loading line first shows and is first painted, beside the page's own wire time (its Brotli bytes at that speed).
// The line must show within that wire time plus 2 s. Google Fonts requests are refused, as in every tool, so they cost nothing.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { findBrowser } from '../../../tools/lib/browser.mjs';
import { pageAssets, assetFor, ASSET_TYPE } from '../../../tools/lib/page-assets.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? +process.argv[i + 1] : d; };
const MBPS = arg('mbps', 1.6), RTT = arg('rtt', 150);
const file = path.join(ROOT, 'dist', 'lanternfall-split.html');
if (!fs.existsSync(file)) { console.error('dist/lanternfall-split.html is missing: run node tools/build.mjs --split'); process.exit(2); }
const html = Buffer.from('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + fs.readFileSync(file, 'utf8'));
const assets = pageAssets(file);
const br = b => zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } });
const body = new Map([['/', br(html)], ...[...assets].map(([k, v]) => ['/' + k, br(v)])]);
const srv = http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname, b = body.get(p);
  if (!b) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': p === '/' ? 'text/html; charset=utf-8' : ASSET_TYPE, 'content-encoding': 'br', 'cache-control': 'no-store' });
  res.end(b);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}/`;

const { pw, exe, reason } = findBrowser();
if (!pw || !exe) { console.error(reason); process.exit(2); }
const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
await page.route('**/*', r => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
const cdp = await page.context().newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: RTT, downloadThroughput: MBPS * 1e6 / 8, uploadThroughput: 750e3 / 8 });
const t0 = Date.now();
const nav = page.goto(base, { waitUntil: 'load', timeout: 300000 });
let shown = null, lines = [];
while (true) {
  const r = await page.evaluate(() => {
    const t = document.getElementById('lfBootText'), fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return { t: t ? t.textContent : null, fcp: fcp ? fcp.startTime : null, game: !!document.getElementById('zName') && !document.getElementById('lfBoot') && document.readyState !== 'loading' };
  }).catch(() => ({}));
  const s = (Date.now() - t0) / 1000;
  if (r.t && shown === null) shown = s;
  if (r.t && lines[lines.length - 1] !== r.t) lines.push(r.t);
  if (r.game || s > 300) break;
  await new Promise(res => setTimeout(res, 100));
}
await nav;
const ready = (Date.now() - t0) / 1000;
const paint = await page.evaluate(() => (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || null);
const pageWire = body.get('/').length, assetWire = [...body.keys()].filter(k => k !== '/').reduce((n, k) => n + body.get(k).length, 0);
const wireTime = pageWire * 8 / (MBPS * 1e6);
console.log(`[cold-load] ${MBPS} Mbps, ${RTT} ms round trip. Page ${(pageWire / 1e6).toFixed(2)} MB on the wire (${wireTime.toFixed(1)} s at this speed), assets ${(assetWire / 1e6).toFixed(2)} MB`);
console.log(`[cold-load] loading line in the page at ${shown == null ? 'never' : shown.toFixed(1) + ' s'}; first paint at ${paint == null ? 'none' : (paint / 1000).toFixed(1) + ' s'}; game ready at ${ready.toFixed(1)} s`);
console.log(`[cold-load] lines seen: ${lines.join(' | ')}`);
const limit = wireTime + 2, at = Math.max(shown ?? Infinity, paint == null ? Infinity : paint / 1000);
console.log(`[cold-load] ${at <= limit ? 'PASS' : 'MISS'}: the line shows at ${at.toFixed(1)} s, limit ${limit.toFixed(1)} s (page wire time + 2 s)`);
await browser.close(); srv.close();
