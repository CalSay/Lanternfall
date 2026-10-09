// page-bytes: today's page by part. Read only: run `node tools/build.mjs` first, then
//   node docs/design/page-bytes/page-parts.mjs
// Splits dist/lanternfall.html into the shell and markup, the CSS, hand-written code and each generated data file
// (a src/js file whose first line says GENERATED), and counts the base64 runs in the page.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const page = fs.readFileSync(path.join(ROOT, 'dist', 'lanternfall.html'), 'utf8'), total = Buffer.byteLength(page);
// decimal units throughout (1 MB = 1,000,000 bytes), the stricter reading of the 16 MB limit
const KB = n => (n / 1e3).toFixed(1).padStart(8) + ' KB', MB = n => (n / 1e6).toFixed(2) + ' MB';
const sStart = page.indexOf('<style>'), sEnd = page.indexOf('</style>') + 8, js0 = page.indexOf('<script>');
const rows = [['shell and markup (title, font links, HTML)', Buffer.byteLength(page.slice(0, sStart) + page.slice(sEnd, js0))],
  ['CSS (as built)', Buffer.byteLength(page.slice(sStart, sEnd))]];
// every fragment as the build joins it: "// ---- src/js/<f> ----\n" + file
const parts = page.slice(js0).split(/(?=\/\/ ---- src\/js\/)/);
let code = Buffer.byteLength(parts.shift()); const gen = [];
for (const p of parts) {
  const f = p.match(/^\/\/ ---- src\/js\/(\S+) ----/)[1], src = fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8');
  if (/GENERATED/.test(src.split('\n')[0])) gen.push([f, Buffer.byteLength(p)]); else code += Buffer.byteLength(p);
}
rows.push(['hand-written code (all other src/js files)', code]);
gen.sort((a, b) => b[1] - a[1]);
for (const [f, n] of gen) rows.push(['generated: ' + f, n]);
console.log('page dist/lanternfall.html:', total, 'bytes =', MB(total), 'of the 16 MB Artifact limit');
for (const [k, n] of rows) console.log(KB(n), (100 * n / total).toFixed(1).padStart(5) + '%', ' ', k);
console.log('sum of parts', rows.reduce((a, r) => a + r[1], 0), 'bytes (equals the page)');
const b64 = (page.match(/[A-Za-z0-9+/]{200,}={0,2}/g) || []);
console.log('base64 runs of 200+ chars:', b64.length, 'runs,', KB(b64.reduce((a, s) => a + s.length, 0)).trim());
console.log('fonts: Google Fonts links, fetched at run time, 0 bytes in the page:', (page.match(/fonts\.googleapis\.com\/css2\?family=[^:&"]+/g) || []).map(s => s.split('=')[1]).join(', '));
// whole-line // comments in hand-written code (what a comment-stripping build would drop)
let com = 0;
for (const f of fs.readdirSync(path.join(ROOT, 'src', 'js'))) {
  const s = fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8');
  if (/GENERATED/.test(s.split('\n')[0])) continue;
  for (const l of s.split('\n')) if (l.trim().startsWith('//')) com += Buffer.byteLength(l) + 1;
}
console.log('whole-line comments in hand-written code:', KB(com).trim(), `(${(100 * com / code).toFixed(0)}% of it)`);
