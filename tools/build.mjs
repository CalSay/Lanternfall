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
// - hero art (AREA_ART entries of kind 'hero', card hero-packs) by hero, not by zone: one pack of each hero's core moves and one
//   pack for each other move. The boot loader writes only the save's hero's core pack; the rest of that hero's moves load first
//   after boot, and another hero's packs load when the save has that hero (heroPacks below; 75-art-load holds the game while the
//   stage needs a move that is not in yet).
// The boot loader shows a plain text line with the bytes done until the game's script has run. The inline page stays the
// default and is written the same way in both modes.
export const ASSET_DIR = path.join(ROOT, 'dist', 'assets');
export const SPLIT_FILE = path.join(ROOT, 'dist', 'lanternfall-split.html');
export const isAsset = text => /^\/\/ [^\n]*GENERATED/.test(text.slice(0, 400));
const hash10 = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 10);
export const assetName = (f, text) => `${f.replace(/\.js$/, '')}.${hash10(text)}.js`;
const attr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
// Every generated art file is one or the other (buildSplit throws on a file in neither, so new art is placed on purpose):
// BOOT_ART loads before the game, whole; AREA_ART is split into packs that load by zone.
export const BOOT_ART = ['21r-data-resicons.js', '21s-data-actionicons.js', '21t-data-navicons.js', '21u-data-gearicons.js', '21v-data-statusicons.js',
  '21y-data-heroart.js', '21yc-data-portraits.js', '21z-data-huntart.js'];
export function placeArt(files, art = AREA_ART) {
  const loose = files.filter(f => !BOOT_ART.includes(f) && !art[f]);
  if (loose.length) throw new Error(`split: ${loose.join(', ')} is generated art in neither BOOT_ART nor AREA_ART (tools/build.mjs): say whether it loads before the game or by zone`);
}
// file -> { v: the constant, kind: the pack kind, keep: what the page keeps of one entry (null: nothing), load: the pack's data }
// A hero file (kind 'hero', card hero-packs) registers here too, with no new loader code. Either one hero's file:
//   constant { moves: { <move>: data }, ...other fields }, entry { v, kind: 'hero', hero: <hero id>, core: [<move>, ...], keep, load }
// or several heroes in one file:
//   constant { heroes: { <hero>: { moves, ...that hero's other fields } }, ...other fields }, entry { v, kind: 'hero', core: { <hero>: [...] }, keep, load }
// core: the moves the hero needs on the first frame (the boot set counts the heaviest hero's core); keep and load work per move
// (when both keep part of a move, make both plain objects: 75-art-load merges them with Object.assign, anything else is replaced).
// Hero ids are SOLO_ORDER's (check.mjs). The page keeps everything but the moves' data and registers the constant
// (lfBoot.heroFile), which puts in the save's hero's core at once, so the core is in the constant before the next file runs, as inline.
const CORE_WREN = ['idle'];   // only the idle fits the boot set (the next lightest core, idle + victory, puts zone 2 at 4.03 MB)
export const AREA_ART = {
  '21za-data-foeart.js': { v: 'FOE_ART', kind: 'foe', keep: P => Object.assign({}, P, { atlases: {} }), load: P => ({ atlases: P.atlases }) },
  '21zb-data-bgart.js': { v: 'BG_ART', kind: 'bg', keep: null, load: B => B },
  // Wren's route S fight moves (route-s-wren-wire): the page keeps each move's frame table, its atlas comes in the move's pack
  // classic: the Classic art switch (64k) turns this art off, so the loaders leave its packs out while it is on (x in the table)
  '21ye-data-wren-s.js': { v: 'WREN_S', kind: 'hero', hero: 'wren', core: CORE_WREN, classic: true, keep: ({ atlas, ...M }) => M, load: M => ({ atlas: M.atlas }) }
};
// A JS literal: JSON, but a string with no quote, backslash or line break goes in single quotes, as the embed tools write basE91.
const lit = v => typeof v === 'string' ? (/['\\\n\r\u2028\u2029]/.test(v) ? JSON.stringify(v) : `'${v}'`)
  : Array.isArray(v) ? `[${v.map(lit).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.entries(v).map(([k, x]) => JSON.stringify(k) + ':' + lit(x)).join(',')}}` : JSON.stringify(v);
const dataOf = (f, text, v) => vm.runInNewContext(`${text}\n;${v}`, {}, { filename: f });
// Which zones show each pack, from the shipped code (59l's ZONE_FOES, 22's zoneTheme) over the Lantern Road's zones (ROAD_ZONES):
// [[from, to], ...] ranges. Past the road the scenery repeats every 35 zones and no zone has a zone monster (check.mjs holds
// that), so the boot loader and 75-art-load read zone z there as the road's last 35 zones.
function packZones() {
  const core = loadCore(), n = core.eval('ROAD_ZONES');
  const rows = core.eval(`Array.from({ length: ${n} }, (_, i) => [ZONE_FOES[i + 1] ? ZONE_FOES[i + 1].key : null, zoneTheme(i + 1)])`);
  const out = {}, add = (id, z) => { const r = out[id] = out[id] || [], last = r[r.length - 1]; if (last && last[1] === z - 1) last[1] = z; else r.push([z, z]); };
  rows.forEach(([foe, theme], i) => { if (foe) add('foe:' + foe, i + 1); add('bg:' + theme, i + 1); });
  return { out, road: n, area: core.eval(`Array.from({ length: ${n} }, (_, i) => zoneAreaIdx(i + 1))`) };
}
// A hero file's packs: one of each hero's core moves (id hero:<v>.<hero>.core) and one per other move (hero:<v>.<hero>.<move>).
// Each is `lfArt('hero', key, { <move>: data })`; 75-art-load puts each move in the hero's moves (<v>.moves for a one-hero file,
// <v>.heroes.<hero>.moves otherwise).
const NAME = /^[a-z0-9_-]+$/i;
export function heroPacks(x, A, data) {
  const packs = [], heroes = {}, tag = x.f.replace(/-data-.*$/, ''), one = typeof A.hero === 'string';
  if (one ? !data || typeof data.moves !== 'object' || !data.moves : !data || typeof data.heroes !== 'object' || !data.heroes)
    throw new Error(`split: ${x.f} is hero art, so ${A.v} needs ${one ? `its moves ({ moves: { <move>: data } }) for ${A.hero}` : 'a heroes table ({ heroes: { <hero>: { moves } } }), or the entry names its one hero'}`);
  for (const [hero, H] of Object.entries(one ? { [A.hero]: data } : data.heroes)) {
    const moves = (H && H.moves) || {}, core = one ? A.core : A.core && A.core[hero], bad = [hero, ...Object.keys(moves)].filter(n => !NAME.test(n) || n === 'core');
    if (bad.length) throw new Error(`split: ${x.f}: ${bad.join(', ')} cannot name a hero or a move in a pack file (letters, digits, - and _ only, and never "core")`);
    if (!Array.isArray(core) || !core.length) throw new Error(`split: ${x.f} names no core moves for ${hero} (AREA_ART core): say which moves the first frame needs`);
    const lost = core.filter(m => !Object.prototype.hasOwnProperty.call(moves, m));
    if (lost.length) throw new Error(`split: ${x.f}: ${hero}'s core moves ${lost.join(', ')} are not in ${A.v}${one ? '' : '.heroes.' + hero}.moves`);
    for (const [set, ms] of [['core', core], ...Object.keys(moves).filter(m => !core.includes(m)).map(m => [m, [m]])]) {
      const key = `${A.v}.${hero}.${set}`, id = 'hero:' + key;
      const text = `// ${x.f.replace(/\.js$/, '')} ${id}: GENERATED by tools/build.mjs --split from src/js/${x.f} (hero-packs). Do not edit.\n`
        + `lfArt("hero", ${JSON.stringify(key)}, ${lit(Object.fromEntries(ms.map(m => [m, A.load(moves[m])])))});\n`;
      packs.push({ id, f: x.f, name: `${tag}-hero-${key}.${hash10(text)}.js`, text, bytes: Buffer.byteLength(text), zones: [], hero, core: set === 'core', moves: ms, v: A.v, classic: !!A.classic, shapes: null });
    }
    heroes[hero] = { ...H, moves: A.keep ? Object.fromEntries(Object.entries(moves).map(([m, M]) => [m, A.keep(M)])) : {} };
  }
  const keep = { f: x.f, text: `// ${x.f.replace(/\.js$/, '')} (split build, hero-packs): ${A.v} as the page keeps it; each hero's moves come in its packs (assets/).\n`
    + `const ${A.v} = ${lit(one ? heroes[A.hero] : { ...data, heroes })};\nlfBoot.heroFile(${JSON.stringify(A.v)}, ${A.v}${one ? ', ' + JSON.stringify(A.hero) : ''});\n` };
  return { packs, keep };
}
export function areaPacks(frags, art = AREA_ART) {
  const { out: zones, road, area } = packZones(), packs = [], keep = [];
  for (const x of frags) {
    const A = art[x.f]; if (!A) continue;
    if (A.kind === 'hero') { const h = heroPacks(x, A, dataOf(x.f, x.text, A.v)); packs.push(...h.packs); keep.push(h.keep); continue; }
    const data = dataOf(x.f, x.text, A.v), kept = {};
    for (const [key, entry] of Object.entries(data)) {
      const id = A.kind + ':' + key, text = `// ${x.f.replace(/\.js$/, '')} ${id}: GENERATED by tools/build.mjs --split from src/js/${x.f} (art-loader). Do not edit.\n`
        + `lfArt(${JSON.stringify(A.kind)}, ${JSON.stringify(key)}, ${lit(A.load(entry))});\n`;
      const name = `${x.f.replace(/-data-.*$/, '')}-${A.kind}-${key}.${hash10(text)}.js`;
      // a background holding both shapes also carries each shape alone (the load lines count it at one shape: loadReport)
      const both = A.kind === 'bg' && entry.land && entry.port, shapes = both ? Object.fromEntries(['land', 'port'].map(o => [o, `lfArt(${JSON.stringify(A.kind)}, ${JSON.stringify(key)}, ${lit({ [o]: entry[o] })});\n`])) : null;
      packs.push({ id, f: x.f, name, text, bytes: Buffer.byteLength(text), zones: zones[id] || [], shapes });
      if (A.keep) kept[key] = A.keep(entry);
    }
    keep.push({ f: x.f, text: `// ${x.f.replace(/\.js$/, '')} (split build, art-loader): ${A.v} as the page keeps it; each entry's art comes in its pack (assets/).\nconst ${A.v} = ${lit(kept)};\n` });
  }
  return { packs, keep, road, area };
}

// art and extra: checks only (check.mjs builds a test hero file from today's art in memory with them; nothing is written then)
export function buildSplit({ write = true, art = AREA_ART, extra = [] } = {}) {
  const { shell, css, frags: own } = parts(), frags = [...own, ...extra].sort((a, b) => (a.f < b.f ? -1 : a.f > b.f ? 1 : 0));
  const gen = frags.filter(x => isAsset(x.text)), { packs, keep, road, area } = areaPacks(gen, art);
  placeArt(gen.map(x => x.f), art);
  const assets = gen.filter(x => !art[x.f]).map(x => ({ f: x.f, name: assetName(x.f, x.text), text: x.text, bytes: Buffer.byteLength(x.text) }));
  const saveKey = /const KEY = '([^']+)'/.exec(fs.readFileSync(path.join(JS_DIR, '30-state.js'), 'utf8'))[1];
  const classicKey = /const PREF = '([^']+)'/.exec(fs.readFileSync(path.join(JS_DIR, '64k-portraits.js'), 'utf8'))[1];   // the Classic art switch
  // a hero pack: h its hero, c 1 for the core moves, m the moves it holds, v the constant it goes in (no zones)
  const table = Object.fromEntries(packs.map(p => [p.id, p.hero ? { f: 'assets/' + p.name, b: p.bytes, z: [], h: p.hero, c: p.core ? 1 : 0, m: p.moves, v: p.v, ...(p.classic ? { x: 1 } : {}) } : { f: 'assets/' + p.name, b: p.bytes, z: p.zones }]));
  const loader = fs.readFileSync(path.join(ROOT, 'src', 'boot-loader.html'), 'utf8')
    .replace('/* @files */', () => JSON.stringify(Object.fromEntries(assets.map(a => [a.name, a.bytes]))))
    .replace('/* @packs */', () => JSON.stringify(table)).replace('/* @road */', () => String(road)).replace('/* @key */', () => JSON.stringify(saveKey))
    .replace('/* @classic */', () => JSON.stringify(classicKey));
  const tags = assets.map(a => `<script src="assets/${attr(a.name)}" onload="lfBoot.done(this)" onerror="lfBoot.fail(this)"></script>`).join('\n');
  const code = frags.filter(x => !isAsset(x.text) || art[x.f]).map(x => keep.find(k => k.f === x.f) || x);
  // the loader (its screen and script) right after the styles, before any game markup, so its screen is the first thing painted
  // (card loading-screen); the boot files' tags and the game's script stay where the inline page has its script
  const html = page(shell, `${css}</style>\n${loader.replace(/\n*$/, '')}\n<style>`, `${tags}\n${iife(code)}\n<script>lfBoot.end();</script>`).replace('\n<style></style>', '');
  const files = [...assets, ...packs];
  if (write) {
    fs.mkdirSync(ASSET_DIR, { recursive: true });
    const names = new Set(files.map(a => a.name));
    for (const f of fs.readdirSync(ASSET_DIR)) if (!names.has(f)) fs.rmSync(path.join(ASSET_DIR, f));   // only this build's files stay
    for (const a of files) fs.writeFileSync(path.join(ASSET_DIR, a.name), a.text);
    fs.writeFileSync(SPLIT_FILE, html);
  }
  return { file: SPLIT_FILE, html, bytes: Buffer.byteLength(html), assets, packs, files, road, area };
}

// Bytes on the wire: Brotli quality 4, the cautious stand-in for Netlify's (docs/design/hosting/measure.mjs).
export const wire = s => zlib.brotliCompressSync(Buffer.from(s), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } }).length;
const KB = n => (n / 1024).toFixed(1) + ' KB', MB = n => (n / 1e6).toFixed(2) + ' MB';

// ---- the split build's load lines (docs/design/hosting.md 6; art-loader judge, 2026-10-10). Bytes on the wire, decimal. ----
// boot: the page + the boot files + the packs of one zone, for a new game (zone 1) and the worst zone (zones 1 to 2000, past the
//   road read as the road's last 35 zones). E1: while Mossy Hollow's pack holds both shapes it counts at its landscape shape, and
//   the portrait share left out is capped. zoneSet: one zone's packs; areaSet: the packs an area shows first. Both count a pack at
//   its larger shape and leave out area 1's named exceptions, each held to its cap until ns-a1-wire empties the list.
//   Hero packs (hero-packs): both boot lines count the heaviest hero's core packs (the boot loader writes only the save's hero's
//   core; a new game is counted as if it had the heaviest hero, so no hero needs an exception). Other moves load after boot.
export const LOAD_LINES = {
  bootWarn: 3.5e6, bootFail: 4.0e6, e1: { pack: 'bg:forest', port: 0.70e6 }, zoneSet: 0.65e6, areaSet: 1.0e6, scan: 2000,
  area1: { 'foe:imp': 0.39e6, 'foe:gloomjaw': 0.85e6, 'bg:forest': 1.45e6 }
};
export function loadReport(s, { size = wire, lines = LOAD_LINES } = {}) {
  const page = size(s.html), boot = s.assets.reduce((n, a) => n + size(a.text), 0), fails = [], warns = [];
  const pk = Object.fromEntries(s.packs.map(p => {
    const real = size(p.text), sh = p.shapes && Object.fromEntries(Object.entries(p.shapes).map(([o, t]) => [o, size(t)]));
    return [p.id, { real, big: sh ? Math.max(sh.land, sh.port) : real, counted: sh && p.id === lines.e1.pack ? sh.land : real, port: sh ? real - sh.land : 0 }];
  }));
  const at = (p, q) => p.zones.some(([a, b]) => q >= a && q <= b), map = z => (z > s.road ? s.road - 34 + (z - s.road - 1) % 35 : z);
  const cores = {};
  for (const p of s.packs) if (p.hero && p.core) cores[p.hero] = (cores[p.hero] || 0) + pk[p.id].real;
  const hero = Object.entries(cores).reduce((m, [h, b]) => (b > m.b ? { h, b } : m), { h: null, b: 0 });
  const zoneBoot = z => { const ps = s.packs.filter(p => at(p, map(z))); return { z, counted: page + boot + hero.b + ps.reduce((n, p) => n + pk[p.id].counted, 0), real: page + boot + hero.b + ps.reduce((n, p) => n + pk[p.id].real, 0) }; };
  const zone1 = zoneBoot(1); let worst = zone1;
  for (let z = 2; z <= lines.scan; z++) { const b = zoneBoot(z); if (b.counted > worst.counted) worst = b; }
  for (const [name, b] of [['a new game (zone 1)', zone1], [`the worst zone (${worst.z})`, worst]]) {
    const say = `boot set, ${name}: ${MB(b.counted)} counted (${MB(b.real)} with both of Mossy Hollow's shapes${hero.h ? `; ${hero.h}'s core moves ${MB(hero.b)}` : ''})`;
    if (b.counted > lines.bootFail) fails.push(`${say}, over ${MB(lines.bootFail)}`); else if (b.counted > lines.bootWarn) warns.push(`${say}, over the ${MB(lines.bootWarn)} warn line`);
  }
  for (const [id, x] of Object.entries(pk)) {
    if (id === lines.e1.pack && x.port > lines.e1.port) fails.push(`${id}'s portrait share left out of the boot set is ${MB(x.port)}, over ${MB(lines.e1.port)} (E1)`);
  }
  const ex = lines.area1;
  for (const [id, cap] of Object.entries(ex)) {
    if (!pk[id]) fails.push(`area 1's exception ${id} names a pack the build lacks`);
    else if (pk[id].real > cap) fails.push(`${id} is ${MB(pk[id].real)}, over its area 1 cap of ${MB(cap)}`);
  }
  const counted = p => (ex[p.id] ? 0 : pk[p.id].big);
  let zoneMax = { z: 1, b: 0 };
  for (let q = 1; q <= s.road; q++) { const b = s.packs.filter(p => at(p, q)).reduce((n, p) => n + counted(p), 0); if (b > zoneMax.b) zoneMax = { z: q, b }; }
  if (zoneMax.b > lines.zoneSet) fails.push(`zone ${zoneMax.z}'s packs are ${MB(zoneMax.b)}, over ${MB(lines.zoneSet)} (zone set)`);
  const areas = {};
  for (const p of s.packs) if (p.zones.length) { const a = s.area[p.zones[0][0] - 1]; areas[a] = (areas[a] || 0) + counted(p); }
  const areaMax = Object.entries(areas).reduce((m, [a, b]) => (b > m.b ? { a: +a, b } : m), { a: 0, b: 0 });
  if (areaMax.b > lines.areaSet) fails.push(`area ${areaMax.a + 1}'s new packs are ${MB(areaMax.b)}, over ${MB(lines.areaSet)} (area set)`);
  const everything = page + boot + Object.values(pk).reduce((n, x) => n + x.real, 0);
  return { page, boot, packs: pk, hero, zone1, worst, zoneMax, areaMax, everything, fails, warns };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { file, bytes } = build();
  console.log(`built ${path.relative(ROOT, file)} (${(bytes / 1024).toFixed(1)} KB)`);
  if (process.argv.includes('--split')) {
    const s = buildSplit(), r = loadReport(s), raw = s.assets.reduce((n, a) => n + a.bytes, 0);
    console.log(`built ${path.relative(ROOT, s.file)} (${KB(s.bytes)}; ${MB(r.page)} on the wire) + ${path.relative(ROOT, ASSET_DIR)}/ (${s.assets.length} boot files, ${KB(raw)}; ${MB(r.boot)} on the wire; ${s.packs.length} area packs)`);
    console.log(`boot set (B2): zone 1 ${MB(r.zone1.counted)}, worst zone ${r.worst.z} ${MB(r.worst.counted)} counted (with both of Mossy Hollow's shapes ${MB(r.zone1.real)} and ${MB(r.worst.real)}); `
      + `packs: ${Object.entries(r.packs).map(([id, x]) => `${id} ${MB(x.real)}`).join(', ')}; ${r.hero.h ? `heaviest hero core ${r.hero.h} ${MB(r.hero.b)}` : 'no hero packs'}; largest zone set ${MB(r.zoneMax.b)} (zone ${r.zoneMax.z}), area set ${MB(r.areaMax.b)} (area ${r.areaMax.a + 1}), area 1's exceptions left out`);
    console.log(`everything: ${MB(r.everything)} on the wire (B1's 6.0 / 8.0 MB first-load lines are a report here); a returning player after a code change: ${MB(r.page)} (wire = Brotli quality 4)`);
    for (const w of r.warns) console.log('warn: ' + w);
    for (const f of r.fails) console.log('over a load line: ' + f);
  }
}
