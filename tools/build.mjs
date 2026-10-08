#!/usr/bin/env node
// Build dist/lanternfall.html from src/: shell + styles (filename order) + one IIFE made
// of every src/js/*.js fragment (filename order). Node 18, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
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

export function build() {
  const shell = fs.readFileSync(path.join(ROOT, 'src', 'shell.html'), 'utf8');
  const css = scaleText(rawCss());
  const js = listDir(JS_DIR, '.js').map(f => `// ---- src/js/${f} ----\n` + fs.readFileSync(path.join(JS_DIR, f), 'utf8').replace(/\n*$/, '\n')).join('\n');
  for (const mark of ['<!-- @styles -->', '<!-- @script -->']) {
    if (shell.split(mark).length !== 2) throw new Error(`src/shell.html must contain ${mark} exactly once`);
  }
  // Use function replacers so `$` sequences in the code are never treated as patterns.
  const out = shell
    .replace('<!-- @styles -->', () => `<style>\n${css}</style>`)
    .replace('<!-- @script -->', () => `<script>\n(() => {\n'use strict';\n\n${js}})();\n</script>`);
  const file = path.join(ROOT, 'dist', 'lanternfall.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  return { file, bytes: Buffer.byteLength(out) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { file, bytes } = build();
  console.log(`built ${path.relative(ROOT, file)} (${(bytes / 1024).toFixed(1)} KB)`);
}
