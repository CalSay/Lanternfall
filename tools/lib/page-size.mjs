// page-size: the page and art byte budget (docs/design/page-bytes.md sections 4 and 6; judge ruling 2026-10-09).
// Read only: it measures the built page and the generated art data files and changes nothing.
//   pageSizeReport({ page, jsDir, cssDir, root }) -> { lines, fails, warns }
//     page: the built page's path (default dist/lanternfall.html); jsDir / cssDir: the sources it was built from.
//   tools/check.mjs runs it as the 'page size' section. For a scratch copy (the mutation runs):
//     node tools/lib/page-size.mjs [--page=<html>] [--js=<src/js dir>]   (exits 1 on a fail)
// Units are decimal (1 KB = 1,000 bytes, 1 MB = 1,000,000), the stricter reading of the 16 MB Artifact limit.
// The parts split is the one docs/design/page-bytes/page-parts.mjs prints (that tool stays as the plan's measurement).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT, JS_DIR, CSS_DIR, listDir } from './core.mjs';
import { b91Decode } from './b91.mjs';

export const PAGE_FAIL = 14000000;   // the ceiling with the 2 MB margin kept free under 16 MB
export const PAGE_WARN = 12000000;
// Section 4's ceilings in file bytes (lossless WebP, every atlas of a pack together). Never looser than the ruling.
export const CEIL = { monster: 85e3, champion: 120e3, elder: 200e3, beast: 60e3, background: 190e3, still: 25e3 };
// New-style pieces (NS_ART, docs/design/new-style/plan.md 5.1, adopted 2026-10-10): a layered scenery set, a node (the tree line,
// the larger), and a camp station, gatherer, critter, Hesketh or prop. Foes take the kinds above from their entry's `kind`.
CEIL.scenery = 400e3; CEIL.node = 70e3; CEIL.piece = 25e3;
export const AREA_CEIL = 425e3;      // an area's five monsters with their Captains, together
export const ZONES_PER_AREA = 5;     // Chapter 1: 35 zones in 7 areas (Mossy Hollow 1-5, Batwing Caves 6-10, ...)
// A pack's kind and zone by stage key (FOE_ART), until the embed tools write a `kind` (and `zone`) field into the pack.
// A FOE_ART pack missing here and carrying no `kind` fails: add its row when its pack is embedded.
export const STAGE = {
  imp: { kind: 'monster', zone: 1 },        // Thorn Imp
  gloomjaw: { kind: 'monster', zone: 2 }    // Gloomjaw
};
// The known exceptions (the ruling names exactly these four; never add another). Each may not grow past its measured size
// (9 Oct 2026, base d7a7d801), so the check is green on day one and catches only new or changed art. In an area's total an
// excepted monster counts at the monster ceiling: it keeps its slot in the area sheet, and the overage is the exception's.
// Keyed by stage key and picture id: a redrawn Imp, Gloomjaw or Mossy Hollow goes in under a new key (or its row comes out here),
// so it meets its ceiling. When Codex's vetted Hunting pack replaces HUNT_ART, its card swaps 'hunt:interim' for a per-beast check
// at the 60 KB beast ceiling (and the hunting ground at the background ceiling).
export const EXCEPT = {
  'foe:imp': 387068,                                        // Thorn Imp, 11 PNG atlases
  'foe:gloomjaw': 840913,                                   // Gloomjaw, 11 PNG atlases
  'bg:mossy-hollow-outlined-night-v1:land': 758512,         // Mossy Hollow, 960x540 WebP
  'bg:mossy-hollow-outlined-night-v1:port': 666544,         // Mossy Hollow, 480x900 WebP (upright crop)
  'hunt:interim': 171537                                    // the interim Hunting art (RLE, not files; the whole of HUNT_ART as embedded)
};
// The art data files this check reads. A new generated 21z* file must join this list (and its packs the ceilings).
const ART_FILES = { '21z-data-huntart.js': 'HUNT_ART', '21za-data-foeart.js': 'FOE_ART', '21zb-data-bgart.js': 'BG_ART', '21zc-data-nsart.js': 'NS_ART' };
const BASE_REF = 'origin/claude/elegant-johnson-m6k00u';

const KB = n => (n / 1e3).toFixed(1) + ' KB', MB = n => (n / 1e6).toFixed(2) + ' MB';
const fileBytes = s => b91Decode(s).length;   // an embedded file's bytes (basE91 text since embed-base91)
const isGen = src => /GENERATED/.test(src.split('\n')[0]);

// The page by part: shell and markup, CSS, hand-written code, and each generated data file (as page-parts.mjs splits it).
export function pageParts(html, jsDir = JS_DIR) {
  const sStart = html.indexOf('<style>'), sEnd = html.indexOf('</style>') + 8, js0 = html.indexOf('<script>');
  const rows = [['shell and markup', Buffer.byteLength(html.slice(0, sStart) + html.slice(sEnd, js0))], ['CSS', Buffer.byteLength(html.slice(sStart, sEnd))]];
  const parts = html.slice(js0).split(/(?=\/\/ ---- src\/js\/)/);
  let code = Buffer.byteLength(parts.shift());
  for (const p of parts) {
    const f = p.match(/^\/\/ ---- src\/js\/(\S+) ----/)[1], file = path.join(jsDir, f);
    if (fs.existsSync(file) && isGen(fs.readFileSync(file, 'utf8'))) rows.push(['generated: ' + f, Buffer.byteLength(p)]); else code += Buffer.byteLength(p);
  }
  rows.push(['hand-written code', code]);
  return rows.sort((a, b) => b[1] - a[1]);
}

function readData(jsDir, f, name) {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(path.join(jsDir, f), 'utf8') + `\n;this.__x = ${name};`, ctx);
  return ctx.__x;
}

// Every pack the art files embed: { id, label, kind, bytes, zone? }. Unknown kinds come back with kind null.
export function packs(jsDir = JS_DIR) {
  const out = [];
  const foe = readData(jsDir, '21za-data-foeart.js', 'FOE_ART');
  for (const [k, p] of Object.entries(foe)) {
    const t = STAGE[k] || {};
    out.push({ id: 'foe:' + k, label: `foe pack "${k}"`, kind: String(p.kind || t.kind || '').toLowerCase() || null, zone: p.zone || t.zone,
      bytes: Object.values(p.atlases || {}).reduce((a, s) => a + fileBytes(s), 0) });
  }
  const bg = readData(jsDir, '21zb-data-bgart.js', 'BG_ART');
  for (const [theme, p] of Object.entries(bg)) for (const o of ['land', 'port']) if (p[o])
    out.push({ id: `bg:${p.id}:${o}`, label: `background "${p.id}" (${theme}, ${o} ${p[o].w}x${p[o].h})`, kind: p.kind || 'background', bytes: fileBytes(p[o].src) });
  const hunt = readData(jsDir, '21z-data-huntart.js', 'HUNT_ART');
  out.push({ id: 'hunt:interim', label: 'interim Hunting art (HUNT_ART)', kind: 'interim', bytes: Buffer.byteLength(JSON.stringify(hunt)) });
  const ns = readData(jsDir, '21zc-data-nsart.js', 'NS_ART'), NSK = { scenery: 'scenery', foe: null, beast: 'beast', node: 'node' };
  for (const [g, G] of Object.entries(ns)) if (G && typeof G === 'object') for (const [k, e] of Object.entries(G))
    out.push({ id: `ns:${g}.${k}`, label: `new-style ${g} "${k}"`, kind: g === 'foe' ? e.kind || 'monster' : NSK[g] || 'piece', zone: e.zone,
      bytes: Object.values(e.img || {}).reduce((a, s) => a + fileBytes(s), 0) });
  return out;
}

// Code and CSS source bytes (hand-written src/js, every src/styles file) in the work tree, or at a git commit.
export function sourceBytes(jsDir = JS_DIR, cssDir = CSS_DIR) {
  let code = 0, css = 0;
  for (const f of listDir(jsDir, '.js')) { const s = fs.readFileSync(path.join(jsDir, f)); if (!isGen(s.toString('utf8', 0, 400))) code += s.length; }
  for (const f of listDir(cssDir, '.css')) css += fs.statSync(path.join(cssDir, f)).size;
  return { code, css };
}
function sourceBytesAt(rev, root) {
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['pipe', 'pipe', 'ignore'] });
  const files = git('ls-tree', '-r', '-l', rev, '--', 'src/js', 'src/styles').trim().split('\n').map(l => {
    const m = /^\S+ blob (\S+)\s+(\d+)\t(.+)$/.exec(l); return m && { sha: m[1], size: +m[2], file: m[3] };
  }).filter(Boolean);
  let code = 0, css = 0;
  for (const x of files) {
    if (x.file.startsWith('src/styles/')) { if (x.file.endsWith('.css')) css += x.size; continue; }
    if (!x.file.endsWith('.js')) continue;
    const head = execFileSync('git', ['cat-file', 'blob', x.sha], { cwd: root, maxBuffer: 1 << 26, stdio: ['pipe', 'pipe', 'ignore'] }).toString('utf8', 0, 400);
    if (!isGen(head)) code += x.size;
  }
  return { code, css };
}

export function pageSizeReport({ page = path.join(ROOT, 'dist', 'lanternfall.html'), jsDir = JS_DIR, cssDir = CSS_DIR, root = ROOT } = {}) {
  const lines = [], fails = [], warns = [];
  // 1. the page
  const html = fs.readFileSync(page, 'utf8'), total = Buffer.byteLength(html);
  const rel = path.relative(root, page);
  lines.push(`page ${rel.startsWith('..') ? page : rel}: ${total} bytes = ${MB(total)} (fail above ${MB(PAGE_FAIL)}, warn above ${MB(PAGE_WARN)}, Artifact limit 16 MB)`);
  if (total > PAGE_WARN) {
    const top = pageParts(html, jsDir).slice(0, 5).map(([k, n]) => `${k} ${KB(n)}`).join('; ');
    const msg = `the page is ${MB(total)}; the five largest parts: ${top}`;
    if (total > PAGE_FAIL) fails.push(`${msg}. Over the 14 MB page ceiling (docs/design/page-bytes.md 4): shrink it before adding anything`);
    else warns.push(`${msg}. Over 12 MB: the reserve levers in docs/design/page-bytes.md 4 may be due`);
  }
  // 2. every art file is one this check knows
  for (const f of listDir(jsDir, '.js')) if (/^21z/.test(f) && !ART_FILES[f] && isGen(fs.readFileSync(path.join(jsDir, f), 'utf8')))
    fails.push(`${f}: a generated art file the page size check does not know; add it to ART_FILES in tools/lib/page-size.mjs with its packs' ceilings`);
  // 3. each pack against its ceiling, or an exception against its measured size
  const all = packs(jsDir), area = {};
  for (const p of all) {
    const ex = EXCEPT[p.id];
    if (ex !== undefined) {
      if (p.bytes > ex) fails.push(`${p.label}: ${p.bytes} bytes, past its measured ${ex} as a known exception (docs/design/page-bytes.md 6); a shipped pack may not grow`);
      else lines.push(`  ${p.label}: ${KB(p.bytes)} (known exception, measured ${KB(ex)})`);
    } else if (!p.kind || !Object.hasOwn(CEIL, p.kind)) {
      fails.push(`${p.label}: no kind; add its stage key to STAGE in tools/lib/page-size.mjs (or a kind field from its embed tool)`);
    } else if (p.bytes > CEIL[p.kind]) {
      fails.push(`${p.label}: ${p.bytes} bytes, over the ${p.kind} ceiling of ${KB(CEIL[p.kind])} (docs/design/page-bytes.md 4)`);
    } else lines.push(`  ${p.label}: ${KB(p.bytes)} of ${KB(CEIL[p.kind])} (${p.kind})`);
    if (p.kind === 'monster') {
      if (!(p.zone > 0)) { fails.push(`${p.label}: a monster with no zone; give it one in STAGE so its area sheet adds up`); continue; }
      const a = Math.ceil(p.zone / ZONES_PER_AREA);
      (area[a] = area[a] || []).push([p.label, ex !== undefined ? CEIL.monster : p.bytes]);
    }
  }
  for (const [a, ms] of Object.entries(area)) {
    const n = ms.reduce((s, m) => s + m[1], 0);
    const msg = `area ${a} (zones ${(a - 1) * ZONES_PER_AREA + 1}-${a * ZONES_PER_AREA}) monsters: ${KB(n)} of ${KB(AREA_CEIL)}`;
    if (n > AREA_CEIL) fails.push(`${msg}, over the area sheet ceiling (${ms.map(m => m[0] + ' ' + KB(m[1])).join(', ')}; a known exception counts ${KB(CEIL.monster)})`);
    else lines.push('  ' + msg);
  }
  // 4. the growth line: code and CSS source bytes against the merge base with the integration branch
  const now = sourceBytes(jsDir, cssDir);
  let base = null, why = '';
  try {
    const mb = execFileSync('git', ['merge-base', 'HEAD', BASE_REF], { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    base = { sha: mb.slice(0, 8), ...sourceBytesAt(mb, root) };
  } catch (e) { why = `no merge base with ${BASE_REF} in this checkout`; }
  const d = (a, b) => (a - b >= 0 ? '+' : '') + KB(a - b);
  lines.push(base
    ? `growth: code ${KB(now.code)} (${d(now.code, base.code)}), CSS ${KB(now.css)} (${d(now.css, base.css)}) against ${base.sha}, the merge base with ${BASE_REF}`
    : `growth: code ${KB(now.code)}, CSS ${KB(now.css)} (${why}; fetch the branch to compare)`);
  return { lines, fails, warns };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
  const r = pageSizeReport({ page: arg('page') ? path.resolve(arg('page')) : undefined, jsDir: arg('js') ? path.resolve(arg('js')) : undefined });
  for (const l of r.lines) console.log(l);
  for (const w of r.warns) console.log('  WARN ' + w);
  for (const f of r.fails) console.log('  FAIL ' + f);
  process.exit(r.fails.length ? 1 : 0);
}
