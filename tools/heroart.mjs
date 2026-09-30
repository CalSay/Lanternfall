#!/usr/bin/env node
// HEROART1: pack the hand-drawn hero poses (art/heroes/<hero>/poses/*.png and gather/*.png, palette.png, Wren's fx/*.png) into
// src/js/21y-data-heroart.js. Build-time only; the output is committed, so the game build never runs this.
// Node 18, no dependencies (a small PNG reader on node:zlib).
//
// Format (read by 64h-hero-sprites.js):
//   HERO_ART = { v, w: 224, h: 192, ax: 96, ay: 132, heroes: { <id>: { pal, poses: { <key>: [x0, y0, w, h, rle] }, fx } } }
//   pal: the hero's colours as one string of 6-hex-digit RGB entries; palette index i + 1 is pal entry i, 0 is transparent.
//   A pose keeps only its opaque bounding box (x0, y0, w, h inside the 224x192 canvas). rle: base64 of runs over
//   the box, row by row. Each run is one byte: low 6 bits = palette index, high 2 bits = length 1, 2 or 3; high
//   bits 11 = the next byte holds length - 4 (4..259).
//   fx: like poses, but x0 = y0 = 0 and w, h = the sprite's own size.
// Usage: node tools/heroart.mjs            (writes the file and prints the sizes)
//        node tools/heroart.mjs --check    (exit 1 if the committed file is out of date)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ART = path.join(ROOT, 'art', 'heroes');
const OUT = path.join(ROOT, 'src', 'js', '21y-data-heroart.js');
const W = 224, H = 192, AX = 96, AY = 132;

// hero -> [pose key, file] (the keys 64h uses)
export const HEROES = {
  // trim: the outer outline is dropped wherever dark shading already sits inside it (trimOutline below)
  wren: { trim: true, poses: [['draw', 'full-draw'], ['release', 'just-released'], ['camp', 'relaxed-camp'], ['hurt', 'hurt'],
    ['wind', 'wind-up'], ['block', 'defensive-brace'], ['kneel', 'kneeling'], ['fallen', 'fallen']],
    fx: [['bat', 'bat'], ['arrow', 'arrow'], ['waves', 'sound_waves']] },
  tobin: { poses: [['ready', '01-ready-guard'], ['wind', '02-wind-up'], ['strike', '03-strike'], ['block', '04-braced-block'],
    ['camp', '05-relaxed-camp'], ['hurt', '06-hurt'], ['kneel', '07-kneeling'], ['fallen', '08-fallen']],
    gather: [['g1', 'g1-rest'], ['g2', 'g2-forward'], ['g3', 'g3-shoulder'], ['g4', 'g4-overhead'], ['g5', 'g5-low'], ['g6', 'g6-crouch'], ['g7', 'g7-level']] },
  pip: { poses: [['ready', '01-ready'], ['wind', '02-wind-up'], ['cast', '03-cast'], ['camp', '04-relaxed-camp'],
    ['hurt', '05-hurt'], ['kneel', '06-kneeling'], ['fallen', '07-fallen']],
    gather: [['g1', 'g1-rest'], ['g2', 'g2-forward'], ['g3', 'g3-shoulder'], ['g4', 'g4-overhead'], ['g5', 'g5-low'], ['g6', 'g6-crouch'], ['g7', 'g7-level']] }
};

// ---- outline trim (owner, 2026-09-29: Wren's border read about 4 px thick) ----
// An outer outline pixel (near-black, touching the transparent outside) is cleared when every pixel just inside it,
// opposite each open side, is dark too: that shading becomes the edge, so the dark band is one pixel thinner and the
// line sits closer to the figure. Pixels with a light inside (a face, gold trim) keep their outline. Edits img in place.
const lum = (r, g, b) => 0.3 * r + 0.59 * g + 0.11 * b;
export function trimOutline(img) {
  const { w, h, rgba } = img, src = Uint8Array.from(rgba);
  const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 0;
  const L = (x, y) => { const i = (y * w + x) * 4; return lum(src[i], src[i + 1], src[i + 2]); };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!op(x, y) || L(x, y) >= 20) continue;
    const outs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !op(x + dx, y + dy));
    if (outs.length && outs.every(([dx, dy]) => op(x - dx, y - dy) && L(x - dx, y - dy) < 45)) rgba[(y * w + x) * 4 + 3] = 0;
  }
  return img;
}

// ---- a small PNG reader: 8-bit, non-interlaced, colour types 0, 2, 3, 4, 6 -> RGBA ----
export function readPNG(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(file + ': not a PNG');
  let p = 8, w = 0, h = 0, depth = 0, ct = 0, inter = 0, plte = null, trns = null; const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; ct = d[9]; inter = d[12]; }
    else if (type === 'PLTE') plte = d;
    else if (type === 'tRNS') trns = d;
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || inter) throw new Error(`${file}: only 8-bit non-interlaced PNGs (depth ${depth}, interlace ${inter})`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct]; if (!ch) throw new Error(file + ': colour type ' + ct);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * ch, px = Buffer.alloc(h * stride);
  for (let y = 0, q = 0; y < h; y++) {
    const f = raw[q++], row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[row + x - ch] : 0, up = y ? px[row - stride + x] : 0, c = x >= ch && y ? px[row - stride + x - ch] : 0;
      let v = raw[q++];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      px[row + x] = v & 255;
    }
  }
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    let r, g, bl, al = 255;
    if (ct === 6) { r = px[i * 4]; g = px[i * 4 + 1]; bl = px[i * 4 + 2]; al = px[i * 4 + 3]; }
    else if (ct === 2) { r = px[i * 3]; g = px[i * 3 + 1]; bl = px[i * 3 + 2]; }
    else if (ct === 3) { const k = px[i]; r = plte[k * 3]; g = plte[k * 3 + 1]; bl = plte[k * 3 + 2]; al = trns && k < trns.length ? trns[k] : 255; }
    else if (ct === 0) { r = g = bl = px[i]; }
    else { r = g = bl = px[i * 2]; al = px[i * 2 + 1]; }
    rgba.set([r, g, bl, al], i * 4);
  }
  return { w, h, rgba };
}
const hex = (d, i) => ((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]).toString(16).padStart(6, '0');

// the palette in palette.png order (first appearance, row by row)
function readPalette(hero) {
  const { w, h, rgba } = readPNG(path.join(ART, hero, 'palette.png')), out = [];
  for (let i = 0; i < w * h; i++) if (rgba[i * 4 + 3] > 0) { const c = hex(rgba, i * 4); if (!out.includes(c)) out.push(c); }
  return out;
}
function encode(img, pal, name, whole) {
  const { w, h, rgba } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = rgba[(y * w + x) * 4 + 3];
    if (a && a !== 255) throw new Error(`${name}: partial alpha ${a} at ${x},${y} (pixel art must be 0 or 255)`);
    if (a) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  }
  if (!whole) { if (x1 < 0) throw new Error(name + ': empty'); } else { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, idx = new Uint8Array(bw * bh);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const i = ((y + y0) * w + x + x0) * 4;
    if (!rgba[i + 3]) continue;
    const k = pal.indexOf(hex(rgba, i));
    if (k < 0) throw new Error(`${name}: colour #${hex(rgba, i)} at ${x + x0},${y + y0} is not in the palette`);
    idx[y * bw + x] = k + 1;
  }
  const bytes = [];
  for (let i = 0; i < idx.length;) {
    let n = 1; while (i + n < idx.length && idx[i + n] === idx[i] && n < 259) n++;
    if (n <= 3) bytes.push(idx[i] | ((n - 1) << 6)); else bytes.push(idx[i] | 0xc0, n - 4);
    i += n;
  }
  return { x0, y0, w: bw, h: bh, b64: Buffer.from(bytes).toString('base64'), idx };
}

export function pack() {
  const heroes = {}, sizes = {};
  for (const [id, def] of Object.entries(HEROES)) {
    const pal = readPalette(id);
    if (pal.length > 63) throw new Error(id + ': more than 63 colours');
    const poses = {}, fx = {};
    // gather: the empty-fist gathering poses (art/heroes/<id>/gather, made by tools/art/gathersheet.py); 64h draws the tools
    for (const [key, file, dir] of def.poses.map(p => [...p, 'poses']).concat((def.gather || []).map(p => [...p, 'gather']))) {
      const img = readPNG(path.join(ART, id, dir, file + '.png'));
      if (def.trim) trimOutline(img);
      if (img.w !== W || img.h !== H) throw new Error(`${id}/${file}: ${img.w}x${img.h}, want ${W}x${H}`);
      const e = encode(img, pal, `${id}/${file}`);
      poses[key] = [e.x0, e.y0, e.w, e.h, e.b64];
    }
    for (const [key, file] of def.fx || []) {
      const img = readPNG(path.join(ART, id, 'fx', file + '.png'));
      const e = encode(img, pal, `${id}/fx/${file}`, true);
      fx[key] = [0, 0, e.w, e.h, e.b64];
    }
    heroes[id] = { pal: pal.join(''), poses, fx };
    sizes[id] = JSON.stringify(heroes[id]).length;
  }
  const body = JSON.stringify({ v: 1, w: W, h: H, ax: AX, ay: AY, heroes })
    .replace(/"(poses|fx)":/g, '\n    "$1":').replace(/\],"/g, '],\n      "').replace(/"(wren|tobin|pip)":\{/g, '\n  "$1":{');
  const src = `// 21y-data-heroart: GENERATED by tools/heroart.mjs from art/heroes/*/poses, palette.png and wren/fx. Do not edit.
// HEROART1: the hand-drawn hero poses for Wren, Tobin and Pip (224x192 canvases, feet on the anchor ax, ay),
// palette-indexed and run-length coded (format at the top of tools/heroart.mjs). Decoded by 64h-hero-sprites.js.
// Pure data (a core-range file): no DOM.
const HERO_ART = ${body};
`;
  return { src, sizes };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { src, sizes } = pack();
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== src) { console.log('src/js/21y-data-heroart.js is out of date: run node tools/heroart.mjs'); process.exit(1); }
    console.log('src/js/21y-data-heroart.js is up to date');
  } else {
    fs.writeFileSync(OUT, src);
    console.log(`wrote ${path.relative(ROOT, OUT)} (${src.length} bytes)`, sizes);
  }
}
