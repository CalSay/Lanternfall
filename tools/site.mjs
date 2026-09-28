// tools/site.mjs: the standalone web build for testers (Netlify). Wraps dist/lanternfall.html (the
// Artifact page, which has no doctype/head) into a normal page in standards mode, and writes a tiny
// Netlify site to the given folder (default site/): index.html, _headers (always fetch the newest page)
// and netlify.toml (no build step: the page is built locally by tools/build.mjs first).
import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.resolve(process.argv[2] || path.join(ROOT, 'site'));
const page = fs.readFileSync(path.join(ROOT, 'dist', 'lanternfall.html'), 'utf8');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'),
  '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + page);
fs.writeFileSync(path.join(out, '_headers'), '/*\n  Cache-Control: no-cache\n');
fs.writeFileSync(path.join(out, 'netlify.toml'), '[build]\n  publish = "."\n  command = ""\n');
console.log('site written to ' + out);
