// page-bytes: decode every foe atlas in Chromium as the shipped PNG and as the lossless WebP copy levers.py made, then compare.
//   node docs/design/page-bytes/decode-check.mjs <scratch dir from levers.py>
// Prints, per atlas that differs on the canvas: pixels that differ, the largest difference after drawing over mid grey
// (what reaches the screen), and whether they are opaque or semi-transparent. Also the median time to decode all atlases
// (7 runs), which DecompressionStream formats exist, and whether createImageBitmap takes bytes decoded from a string.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const DIR = process.argv[2];
const names = fs.readdirSync(path.join(DIR, 'png')).sort();
const items = names.map(n => ({ n, png: fs.readFileSync(path.join(DIR, 'png', n)).toString('base64'), webp: fs.readFileSync(path.join(DIR, 'webp', n.replace(/\.png$/, '.webp'))).toString('base64') }));
const exe = fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
const b = await chromium.launch(exe), p = await b.newPage();
const r = await p.evaluate(async items => {
  const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const px = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
  const over = (D, i, k) => (D[i + k] * D[i + 3] + 128 * (255 - D[i + 3])) / 255;
  const diffs = [];
  for (const it of items) {
    const A = px(await load('data:image/png;base64,' + it.png)), W = px(await load('data:image/webp;base64,' + it.webp));
    let n = 0, raw = 0, shown = 0, opaque = 0;
    for (let i = 0; i < A.length; i += 4) {
      let d = 0; for (let k = 0; k < 4; k++) d = Math.max(d, Math.abs(A[i + k] - W[i + k]));
      if (!d) continue;
      n++; raw = Math.max(raw, d); if (A[i + 3] === 255) opaque++;
      shown = Math.max(shown, Math.abs(A[i + 3] - W[i + 3]), ...[0, 1, 2].map(k => Math.round(Math.abs(over(A, i, k) - over(W, i, k)))));
    }
    if (n) diffs.push({ atlas: it.n, pixels: n, largestRaw: raw, largestOnGrey: shown, opaque });
  }
  const t = { png: [], webp: [] };
  for (let run = 0; run < 7; run++) for (const k of ['png', 'webp']) {
    const t0 = performance.now();
    await Promise.all(items.map(it => load(`data:image/${k};base64,${it[k]}#${run}`).then(i => i.decode())));
    t[k].push(performance.now() - t0);
  }
  const med = a => Math.round(a.sort((x, y) => x - y)[a.length >> 1]);
  // a text-decoded byte path (what a denser encoding than base64 would use): bytes -> Blob -> ImageBitmap
  const bin = atob(items[0].webp), u8 = Uint8Array.from(bin, c => c.charCodeAt(0));
  const bmp = await createImageBitmap(new Blob([u8], { type: 'image/webp' })).then(x => `${x.width}x${x.height}`, e => 'failed: ' + e);
  const ds = ['gzip', 'deflate', 'deflate-raw', 'brotli'].filter(f => { try { new DecompressionStream(f); return true; } catch { return false; } });
  return { atlases: items.length, differOnCanvas: diffs, msDecodeAllPng: med(t.png), msDecodeAllWebp: med(t.webp), decompressionStream: ds, imageBitmapFromBytes: bmp, ua: navigator.userAgent };
}, items);
console.log(JSON.stringify(r, null, 1));
await b.close();
