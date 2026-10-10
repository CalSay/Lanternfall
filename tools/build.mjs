#!/usr/bin/env node
// Build dist/lanternfall.html from src/: shell + styles (filename order) + one IIFE made
// of every src/js/*.js fragment (filename order). Node 18, no dependencies.
// --split also writes the split build (dist/lanternfall-split.html plus dist/assets/), see buildSplit below.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { ROOT, JS_DIR, CSS_DIR, listDir, loadCore } from './lib/core.mjs';

// The joined styles as written (desktop-layout check compares against these, untransformed).
export const rawCss = () => listDir(CSS_DIR, '.css').map(f => fs.readFileSync(path.join(CSS_DIR, f), 'utf8').replace(/\n*$/, '\n')).join('');

// desktop-layout-v1 (docs/design/desktop-layout.md 1): text grows with the screen. Every font size S (in `font-size` or the
// size inside a `font:` shorthand) becomes max(var(--tmin, 0px), calc(S * var(--tk, 1))). :root sets --tk 1 and --tmin 0px, so
// every size outside the desktop tiers computes exactly as written. Skipped: comments, `inherit` and keyword sizes, 0, a line
// carrying /* tk:off */, and anything it cannot parse (left unchanged). `!important` stays outside the max().
const SIZE = String.raw`(?:\d*\.?\d+px|calc\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))`;
const SIZE_ONLY = new RegExp(`^${SIZE}$`);
const SHORT = new RegExp(`^((?:(?:italic|normal|bold|\\d{3})\\s+)*)(${SIZE})((?:\\/[^\\s]+)?\\s+\\S.*)$`);
const grow = v => `max(var(--tmin, 0px), calc(${v.startsWith('calc(') ? v.slice(4) : v} * var(--tk, 1)))`;
function scaleDecls(code) {
  return code.replace(/(^|[{;\s])(font-size|font)(\s*:\s*)([^;{}]*?)(\s*!important)?(\s*)(?=;|}|$)/g, (m, pre, prop, colon, val, imp, sp) => {
    let out = null;
    if (prop === 'font-size') { if (SIZE_ONLY.test(val)) out = grow(val); }
    else { const s = SHORT.exec(val); if (s) out = s[1] + grow(s[2]) + s[3]; }
    return out == null ? m : pre + prop + colon + out + (imp || '') + sp;
  });
}
export function scaleText(css) {
  let inComment = false;
  return css.split('\n').map(line => {
    if (line.includes('/* tk:off */')) { if (line.includes('/*') && !line.includes('*/', line.lastIndexOf('/*'))) inComment = true; return line; }
    let out = '', i = 0;
    while (i < line.length) {
      if (inComment) { const e = line.indexOf('*/', i); if (e < 0) { out += line.slice(i); i = line.length; } else { out += line.slice(i, e + 2); i = e + 2; inComment = false; } }
      else { const s = line.indexOf('/*', i); const end = s < 0 ? line.length : s; out += scaleDecls(line.slice(i, end)); i = end; if (s >= 0) inComment = true; }
    }
    return out;
  }).join('\n');
}

// The page's parts, shared by both modes: the shell, the scaled CSS and every src/js fragment (filename order) as built.
function parts() {
  const shell = fs.readFileSync(path.join(ROOT, 'src', 'shell.html'), 'utf8');
  for (const mark of ['<!-- @styles -->', '<!-- @script -->']) {
    if (shell.split(mark).length !== 2) throw new Error(`src/shell.html must contain ${mark} exactly once`);
  }
  const frags = listDir(JS_DIR, '.js').map(f => ({ f, text: fs.readFileSync(path.join(JS_DIR, f), 'utf8').replace(/\n*$/, '\n') }));
  return { shell, css: scaleText(rawCss()), frags };
}
// Use function replacers so `$` sequences in the code are never treated as patterns.
const page = (shell, css, script) => shell.replace('<!-- @styles -->', () => `<style>\n${css}</style>`).replace('<!-- @script -->', () => script);
const iife = frags => `<script>\n(() => {\n'use strict';\n\n${frags.map(x => `// ---- src/js/${x.f} ----\n` + x.text).join('\n')}})();\n</script>`;

export function build() {
  const { shell, css, frags } = parts();
  const out = page(shell, css, iife(frags));
  const file = path.join(ROOT, 'dist', 'lanternfall.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  return { file, bytes: Buffer.byteLength(out) };
}

// ---- split mode (asset-build and art-loader; docs/design/hosting.md 5, B2) ----
// `node tools/build.mjs --split` also writes dist/lanternfall-split.html plus dist/assets/. Every generated art data file (a
// src/js fragment whose header says GENERATED) leaves the page:
// - the boot files (icons, heroes, portraits, the hunting art) as they are, under a content-hashed name, each named in a plain
//   <script src> before the game's script, so they run in order before the game boots, as the inline page would (each file is
//   one `const X = {...}`; the game reads it by name);
// - the area art (AREA_ART: the foe packs and the battle backgrounds) as one pack file per foe and per background, also
//   content-hashed. A pack file is `lfArt(kind, key, data);`. The boot loader (src/boot-loader.html) reads the save's zone and
//   writes the tags of that zone's packs before the boot files, so the zone you open in is drawn as in the inline page. Every
//   other pack loads after boot, one area ahead (src/js/75-art-load.js), and the game waits while the zone on screen lacks one.
//   What stays in the page: the foes' timings and frame tables (59l reads them in fights, so a fight plays the same whether its
//   art is in or not); their atlases come with the pack. A background stays out of BG_ART until its pack arrives (only the
//   stage and the opening read it, and zoneTheme falls back to the scenery rule until then).
// The boot loader shows a plain text line with the bytes done until the game's script has run. The inline page stays the
// default and is written the same way in both modes.
export const ASSET_DIR = path.join(ROOT, 'dist', 'assets');
export const SPLIT_FILE = path.join(ROOT, 'dist', 'lanternfall-split.html');
export const isAsset = text => /^\/\/ [^\n]*GENERATED/.test(text.slice(0, 400));
const hash10 = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 10);
export const assetName = (f, text) => `${f.replace(/\.js$/, '')}.${hash10(text)}.js`;
const attr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
// file -> { v: the constant, kind: the pack kind, keep: what the page keeps of one entry (null: nothing), load: the pack's data }
export const AREA_ART = {
  '21za-data-foeart.js': { v: 'FOE_ART', kind: 'foe', keep: P => Object.assign({}, P, { atlases: {} }), load: P => ({ atlases: P.atlases }) },
  '21zb-data-bgart.js': { v: 'BG_ART', kind: 'bg', keep: null, load: B => B }
};
// A JS literal: JSON, but a string with no quote, backslash or line break goes in single quotes, as the embed tools write basE91.
const lit = v => typeof v === 'string' ? (/['\\\n\r\u2028\u2029]/.test(v) ? JSON.stringify(v) : `'${v}'`)
  : Array.isArray(v) ? `[${v.map(lit).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.entries(v).map(([k, x]) => JSON.stringify(k) + ':' + lit(x)).join(',')}}` : JSON.stringify(v);
const dataOf = (f, text, v) => vm.runInNewContext(`${text}\n;${v}`, {}, { filename: f });
// Which zones show each pack, from the shipped code (59l's ZONE_FOES, 22's zoneTheme) over the Lantern Road's zones (ROAD_ZONES):
// [[from, to], ...] ranges. Past the road, 75-art-load asks the same two functions in the page (zoneTheme reads BG_ART only in
// the Hollow, zones 1-35, so out there it does not matter that a background is not in yet; check.mjs holds that).
function packZones() {
  const core = loadCore(), n = core.eval('ROAD_ZONES');
  const rows = core.eval(`Array.from({ length: ${n} }, (_, i) => [ZONE_FOES[i + 1] ? ZONE_FOES[i + 1].key : null, zoneTheme(i + 1)])`);
  const out = {}, add = (id, z) => { const r = out[id] = out[id] || [], last = r[r.length - 1]; if (last && last[1] === z - 1) last[1] = z; else r.push([z, z]); };
  rows.forEach(([foe, theme], i) => { if (foe) add('foe:' + foe, i + 1); add('bg:' + theme, i + 1); });
  return { out, road: n };
}
export function areaPacks(frags) {
  const { out: zones, road } = packZones(), packs = [], keep = [];
  for (const x of frags) {
    const A = AREA_ART[x.f]; if (!A) continue;
    const data = dataOf(x.f, x.text, A.v), kept = {};
    for (const [key, entry] of Object.entries(data)) {
      const id = A.kind + ':' + key, text = `// ${x.f.replace(/\.js$/, '')} ${id}: GENERATED by tools/build.mjs --split from src/js/${x.f} (art-loader). Do not edit.\n`
        + `lfArt(${JSON.stringify(A.kind)}, ${JSON.stringify(key)}, ${lit(A.load(entry))});\n`;
      const name = `${x.f.replace(/-data-.*$/, '')}-${A.kind}-${key}.${hash10(text)}.js`;
      packs.push({ id, f: x.f, name, text, bytes: Buffer.byteLength(text), zones: zones[id] || [] });
      if (A.keep) kept[key] = A.keep(entry);
    }
    keep.push({ f: x.f, text: `// ${x.f.replace(/\.js$/, '')} (split build, art-loader): ${A.v} as the page keeps it; each entry's art comes in its pack (assets/).\nconst ${A.v} = ${lit(kept)};\n` });
  }
  return { packs, keep, road };
}

export function buildSplit({ write = true } = {}) {
  const { shell, css, frags } = parts();
  const gen = frags.filter(x => isAsset(x.text)), { packs, keep, road } = areaPacks(gen);
  const assets = gen.filter(x => !AREA_ART[x.f]).map(x => ({ f: x.f, name: assetName(x.f, x.text), text: x.text, bytes: Buffer.byteLength(x.text) }));
  const saveKey = /const KEY = '([^']+)'/.exec(fs.readFileSync(path.join(JS_DIR, '30-state.js'), 'utf8'))[1];
  const table = Object.fromEntries(packs.map(p => [p.id, { f: 'assets/' + p.name, b: p.bytes, z: p.zones }]));
  const loader = fs.readFileSync(path.join(ROOT, 'src', 'boot-loader.html'), 'utf8')
    .replace('/* @files */', () => JSON.stringify(Object.fromEntries(assets.map(a => [a.name, a.bytes]))))
    .replace('/* @packs */', () => JSON.stringify(table)).replace('/* @road */', () => String(road)).replace('/* @key */', () => JSON.stringify(saveKey));
  const tags = assets.map(a => `<script src="assets/${attr(a.name)}" onload="lfBoot.done(this)" onerror="lfBoot.fail(this)"></script>`).join('\n');
  const code = frags.filter(x => !isAsset(x.text) || AREA_ART[x.f]).map(x => keep.find(k => k.f === x.f) || x);
  const html = page(shell, css, `${loader.replace(/\n*$/, '\n')}${tags}\n${iife(code)}\n<script>lfBoot.end();</script>`);
  const files = [...assets, ...packs];
  if (write) {
    fs.mkdirSync(ASSET_DIR, { recursive: true });
    const names = new Set(files.map(a => a.name));
    for (const f of fs.readdirSync(ASSET_DIR)) if (!names.has(f)) fs.rmSync(path.join(ASSET_DIR, f));   // only this build's files stay
    for (const a of files) fs.writeFileSync(path.join(ASSET_DIR, a.name), a.text);
    fs.writeFileSync(SPLIT_FILE, html);
  }
  return { file: SPLIT_FILE, html, bytes: Buffer.byteLength(html), assets, packs, files };
}

// Bytes on the wire: Brotli quality 4, the cautious stand-in for Netlify's (docs/design/hosting/measure.mjs).
const wire = s => zlib.brotliCompressSync(Buffer.from(s), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } }).length;
const KB = n => (n / 1024).toFixed(1) + ' KB', MB = n => (n / 1e6).toFixed(2) + ' MB';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { file, bytes } = build();
  console.log(`built ${path.relative(ROOT, file)} (${(bytes / 1024).toFixed(1)} KB)`);
  if (process.argv.includes('--split')) {
    const s = buildSplit();
    const pageWire = wire(s.html), raw = s.assets.reduce((n, a) => n + a.bytes, 0), aWire = s.assets.reduce((n, a) => n + wire(a.text), 0);
    const pw = new Map(s.packs.map(p => [p.id, wire(p.text)])), pk = s.packs.reduce((n, p) => n + pw.get(p.id), 0);
    console.log(`built ${path.relative(ROOT, s.file)} (${KB(s.bytes)}; ${MB(pageWire)} on the wire) + ${path.relative(ROOT, ASSET_DIR)}/ (${s.assets.length} boot files, ${KB(raw)}; ${MB(aWire)} on the wire; ${s.packs.length} area packs, ${MB(pk)} on the wire)`);
    const zoneSet = z => s.packs.filter(p => p.zones.some(([a, b]) => z >= a && z <= b));
    const boot = z => pageWire + aWire + zoneSet(z).reduce((n, p) => n + pw.get(p.id), 0);
    let worst = 1; for (const p of s.packs) for (const [a, b] of p.zones) for (let z = a; z <= b; z++) if (boot(z) > boot(worst)) worst = z;
    console.log(`boot set (B2): zone 1 ${MB(boot(1))}, worst zone ${worst} ${MB(boot(worst))} on the wire; packs: ${s.packs.map(p => `${p.id} ${MB(pw.get(p.id))}`).join(', ')}`);
    console.log(`everything: ${MB(pageWire + aWire + pk)} on the wire; a returning player after a code change: ${MB(pageWire)} (wire = Brotli quality 4)`);
  }
}
