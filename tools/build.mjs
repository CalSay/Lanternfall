#!/usr/bin/env node
// Build dist/lanternfall.html from src/: shell + styles (filename order) + one IIFE made
// of every src/js/*.js fragment (filename order). Node 18, no dependencies.
// --split also writes the split build (dist/lanternfall-split.html plus dist/assets/), see buildSplit below.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { ROOT, JS_DIR, CSS_DIR, listDir } from './lib/core.mjs';

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

// ---- split mode (asset-build; docs/design/hosting.md 5, B1) ----
// `node tools/build.mjs --split` also writes dist/lanternfall-split.html plus dist/assets/: every generated art data file
// (a src/js fragment whose header says GENERATED) as it is, under a content-hashed name. The page names each file in a plain
// <script src> before the game's script, so the browser fetches them in parallel and runs them in order before the game boots,
// exactly as the inline page would (each file is one `const X = {...}` with no other code; the game reads it by name). The boot
// loader (src/boot-loader.html) shows a plain text line with the bytes done until the game's script has run.
// The inline page stays the default and is written the same way in both modes.
export const ASSET_DIR = path.join(ROOT, 'dist', 'assets');
export const SPLIT_FILE = path.join(ROOT, 'dist', 'lanternfall-split.html');
export const isAsset = text => /^\/\/ [^\n]*GENERATED/.test(text.slice(0, 400));
export const assetName = (f, text) => `${f.replace(/\.js$/, '')}.${crypto.createHash('sha256').update(text).digest('hex').slice(0, 10)}.js`;
const attr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

export function buildSplit({ write = true } = {}) {
  const { shell, css, frags } = parts();
  const assets = frags.filter(x => isAsset(x.text)).map(x => ({ f: x.f, name: assetName(x.f, x.text), text: x.text, bytes: Buffer.byteLength(x.text) }));
  const loader = fs.readFileSync(path.join(ROOT, 'src', 'boot-loader.html'), 'utf8')
    .replace('/* @files */', () => JSON.stringify(Object.fromEntries(assets.map(a => [a.name, a.bytes]))));
  const tags = assets.map(a => `<script src="assets/${attr(a.name)}" onload="lfBoot.done(this)" onerror="lfBoot.fail(this)"></script>`).join('\n');
  const html = page(shell, css, `${loader.replace(/\n*$/, '\n')}${tags}\n${iife(frags.filter(x => !isAsset(x.text)))}\n<script>lfBoot.end();</script>`);
  if (write) {
    fs.mkdirSync(ASSET_DIR, { recursive: true });
    const keep = new Set(assets.map(a => a.name));
    for (const f of fs.readdirSync(ASSET_DIR)) if (!keep.has(f)) fs.rmSync(path.join(ASSET_DIR, f));   // only this build's files stay
    for (const a of assets) fs.writeFileSync(path.join(ASSET_DIR, a.name), a.text);
    fs.writeFileSync(SPLIT_FILE, html);
  }
  return { file: SPLIT_FILE, html, bytes: Buffer.byteLength(html), assets };
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
    console.log(`built ${path.relative(ROOT, s.file)} (${KB(s.bytes)}; ${MB(pageWire)} on the wire) + ${path.relative(ROOT, ASSET_DIR)}/ (${s.assets.length} files, ${KB(raw)}; ${MB(aWire)} on the wire)`);
    console.log(`split first load: ${MB(pageWire + aWire)} on the wire; a returning player after a code change: ${MB(pageWire)} (wire = Brotli quality 4)`);
  }
}
