#!/usr/bin/env node
// Build dist/lanternfall.html from src/: shell + styles (filename order) + one IIFE made
// of every src/js/*.js fragment (filename order). Node 18, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, JS_DIR, CSS_DIR, listDir } from './lib/core.mjs';

export function build() {
  const shell = fs.readFileSync(path.join(ROOT, 'src', 'shell.html'), 'utf8');
  const css = listDir(CSS_DIR, '.css').map(f => fs.readFileSync(path.join(CSS_DIR, f), 'utf8').replace(/\n*$/, '\n')).join('');
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
