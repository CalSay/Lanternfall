#!/usr/bin/env node
// Hosting plan measurements (docs/design/hosting.md). Read only: it reads dist/lanternfall.html and src/js, writes nothing.
//   node tools/build.mjs && node docs/design/hosting/measure.mjs [--live]
// --live also fetches https://lanternfall.netlify.app/ (Brotli, gzip and plain) and repeats the Brotli fetch with its ETag.
// Units are decimal (1 MB = 1,000,000 bytes), as in docs/design/page-bytes.md. "Wire" is bytes after Brotli quality 4. Netlify
// served the live page (2,545,420 bytes raw) as 740,710 to 741,137 Brotli bytes on 9 Oct 2026, between quality 4 (756,549) and
// 5 (697,405), so quality 4 is the cautious stand-in. Quality 11 is printed beside it for comparison.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { packs } from '../../../tools/lib/page-size.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const JS = path.join(ROOT, 'src', 'js');
const html = fs.readFileSync(path.join(ROOT, 'dist', 'lanternfall.html'), 'utf8');
const brq = (s, q) => zlib.brotliCompressSync(Buffer.from(s), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: q } }).length;
const br = s => brq(s, 4), br11 = s => brq(s, 11);
const gz = s => zlib.gzipSync(Buffer.from(s), { level: 9 }).length;
const MB = n => (n / 1e6).toFixed(2) + ' MB', KB = n => (n / 1e3).toFixed(1) + ' KB';
const isGen = f => /GENERATED/.test(fs.readFileSync(path.join(JS, f), 'utf8').slice(0, 400));

// 1. The page as one file.
const raw = Buffer.byteLength(html), wire = br(html);
console.log(`[page] dist/lanternfall.html: ${raw} bytes = ${MB(raw)}; gzip -9 ${MB(gz(html))}; wire (Brotli 4) ${MB(wire)} (${(wire / raw * 100).toFixed(0)}%); Brotli 11 ${MB(br11(html))}`);

// 2. The page by part, raw and on the wire (split the way tools/lib/page-size.mjs pageParts splits it).
const sStart = html.indexOf('<style>'), sEnd = html.indexOf('</style>') + 8, js0 = html.indexOf('<script>');
const parts = html.slice(js0).split(/(?=\/\/ ---- src\/js\/)/);
let code = parts.shift();
const gen = {};
for (const p of parts) {
  const f = p.match(/^\/\/ ---- src\/js\/(\S+) ----/)[1];
  if (fs.existsSync(path.join(JS, f)) && isGen(f)) gen[f] = p; else code += p;
}
const shell = html.slice(0, sStart) + html.slice(sEnd, js0), css = html.slice(sStart, sEnd);
const rows = [['shell and markup', shell], ['CSS', css], ['hand-written code', code], ...Object.entries(gen).map(([f, s]) => ['generated: ' + f, s])];
console.log('[parts] part | raw | wire');
let genWire = 0;
for (const [n, s] of rows.sort((a, b) => b[1].length - a[1].length)) {
  const w = br(s); if (n.startsWith('generated')) genWire += w;
  console.log(`  ${n} | ${KB(Buffer.byteLength(s))} | ${KB(w)}`);
}
const codeWire = br(shell + css + code);
console.log(`[parts] shell + CSS + hand-written code on the wire: ${MB(codeWire)}; generated data files on the wire: ${MB(genWire)}`);

// 3. Embedded art as plain files (what an asset-file build would serve; WebP and PNG do not shrink further under Brotli).
const pk = packs();
for (const p of pk) console.log(`[files] ${p.label}: ${KB(p.bytes)} as a file`);

// 4. Two first loads for a split build (page plus asset files), priced on today's art.
// (a) Preload-all: every asset loads before the title screen (card asset-build): code, CSS and shell on the wire, every generated
//     text file on the wire, and the art packs as files (WebP and PNG do not shrink under Brotli; embedded, they cost the same on
//     the wire, see [parts]).
// (b) Boot set, only if an art loader lands: the page; every icon, hero and portrait file (they can show from the first minute);
//     the current area's picture (the landscape one, the larger) and the current zone's foe, priced at the worst case in area 1
//     (Gloomjaw, zone 2: a returning player boots into their own zone, not zone 1).
const TEXT_ALL = Object.keys(gen).filter(f => !/^21z(a|b)?-data-/.test(f));
const textAll = TEXT_ALL.reduce((a, f) => a + br(gen[f]), 0);
const files = pk.filter(p => p.id !== 'hunt:interim').reduce((a, p) => a + p.bytes, 0);
const hunt = br(gen['21z-data-huntart.js'] || '');
const preload = codeWire + textAll + files + hunt;
console.log(`[first-load] preload-all: code+CSS+shell ${KB(codeWire)} + icon, hero and portrait files ${KB(textAll)} + foe and background files ${KB(files)} + Hunting ${KB(hunt)} = ${MB(preload)} on the wire`);
const gloom = (pk.find(p => p.id === 'foe:gloomjaw') || {}).bytes || 0;
const land = (pk.find(p => /^bg:.*:land$/.test(p.id)) || {}).bytes || 0;
const boot = codeWire + textAll + gloom + land;
console.log(`[boot] code+CSS+shell ${KB(codeWire)} + icon, hero and portrait files ${KB(textAll)} + Gloomjaw ${KB(gloom)} + Mossy Hollow landscape ${KB(land)} = ${MB(boot)} on the wire`);
console.log(`[growth] code grows about 0.1 MB raw a day (page-bytes.md 1); at this build's code ratio that is ${KB(1e5 * codeWire / Buffer.byteLength(shell + css + code))} a day on the wire`);

// 5. Time on a link, and Netlify credits per load (20 credits a GB of bandwidth, 2 credits per 10,000 requests; Netlify docs, 9 Oct 2026).
const secs = (b, mbps) => (b * 8 / (mbps * 1e6)).toFixed(1) + ' s';
for (const [n, b] of [['whole page today', wire], ['preload-all first load', preload], ['boot set', boot]])
  console.log(`[time] ${n} ${MB(b)}: ${secs(b, 1.6)} at 1.6 Mbps (Lighthouse "slow 4G"), ${secs(b, 10)} at 10 Mbps, ${secs(b, 50)} at 50 Mbps`);
const credits = b => b / 1e9 * 20;
console.log(`[credits] a first load of today's page: ${credits(wire).toFixed(3)} credits; a revalidated repeat visit (304, no body): 2/10,000 = 0.0002 credits`);
for (const [plan, c] of [['Free (300 credits, hard limit)', 300], ['Pro (3,000 credits)', 3000]]) {
  const left = c - 4 * 15;   // four Monday production deploys at 15 credits each
  console.log(`[credits] ${plan}: after 4 Monday deploys (60), ${left} credits = ${(left / 20).toFixed(1)} GB = about ${Math.floor(left / credits(wire))} first loads of today's page a month`);
}

// 6. Optional: the live Netlify page.
if (process.argv.includes('--live')) {
  const url = 'https://lanternfall.netlify.app/';
  for (const enc of ['br', 'gzip', 'identity']) {
    const r = await fetch(url, { headers: { 'accept-encoding': enc } });
    const b = Buffer.from(await r.arrayBuffer());
    console.log(`[live] ${url} accept-encoding ${enc}: HTTP ${r.status}, ${b.length} bytes decoded, content-encoding ${r.headers.get('content-encoding') || 'none'}, etag ${r.headers.get('etag')}`);
  }
  console.log('[live] note: fetch() decodes the body, so the decoded size is shown; curl -w %{size_download} gives bytes on the wire.');
}
