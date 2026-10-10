#!/usr/bin/env node
// Static server for dist/. Usage: node tools/serve.mjs [port] [--split]  (default 5173, or $PORT)
// "/" serves dist/lanternfall.html wrapped in a minimal document so it renders like the Artifact viewer; with --split it serves
// dist/lanternfall-split.html and the asset files it names (node tools/build.mjs --split first).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/core.mjs';
import { pageAssets, assetFor, ASSET_TYPE } from './lib/page-assets.mjs';

const DIST = path.join(ROOT, 'dist');
const args = process.argv.slice(2), SPLIT = args.includes('--split');
const port = +(args.find(a => !a.startsWith('--')) || process.env.PORT || 5173);
const PAGE = SPLIT ? '/lanternfall-split.html' : '/lanternfall.html';
if (SPLIT && !fs.existsSync(path.join(DIST, PAGE))) { console.error('dist' + PAGE + ' is missing: run node tools/build.mjs --split'); process.exit(2); }
const assets = SPLIT ? pageAssets(path.join(DIST, PAGE)) : new Map();
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const a = assetFor(assets, p);
  if (a) { res.writeHead(200, { 'content-type': ASSET_TYPE, 'cache-control': 'no-store' }); res.end(a); return; }
  if (p === '/') p = PAGE;
  const file = path.normalize(path.join(DIST, p));
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  let body = fs.readFileSync(file);
  if (file.endsWith('.html')) body = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + body;
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
}).listen(port, () => console.log(`serving dist/ at http://localhost:${port}/`));
