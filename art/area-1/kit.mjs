// art/area-1/kit.mjs: the Mossy Hollow trial pack's pixel kit (Claude trial, Cal 2026-10-07; see docs/DECISIONS.md "Art unblock").
// Node only, no dependencies. A sprite is a list of parts: each part is a signed-distance shape, a material and a depth.
// Rendering is whole-pixel and flat-shaded: every covered pixel takes one of four tones of its material from a fixed light at
// the top left (the surface tilts toward the edge of a shape), a darker section line where one part sits on another, and a
// 1-pixel dark outline round the whole sprite. No gradients, no blending, no anti-aliasing.
import zlib from 'node:zlib';

// ---------- colour ----------
export const rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
export const toHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// A material ramp from one base colour: [line, deep shade, shade, base, light, highlight]. Shades slide toward plum, lights toward gold,
// as art-direction.md asks (3 working tones; the line and highlight are used sparingly).
export function ramp(base, o = {}) {
  const b = rgb(base), plum = rgb(o.shadeTo || '#2A1638'), gold = rgb(o.lightTo || '#FFE2A0');
  const sh = o.shade == null ? 0.30 : o.shade, li = o.light == null ? 0.22 : o.light;
  return [mixc(b, rgb('#0E0812'), 0.80), mixc(b, plum, sh * 1.9), mixc(b, plum, sh), b, mixc(b, gold, li), mixc(b, gold, li * 2.1)];
}
export const INK = rgb('#120B18');

// ---------- shapes (signed distance in px: negative inside; y runs down) ----------
const hyp = Math.hypot;
export const ell = (cx, cy, rx, ry, rot = 0) => {
  const c = Math.cos(rot), s = Math.sin(rot), m = Math.min(rx, ry);
  return (x, y) => { const px = x - cx, py = y - cy, u = (px * c + py * s) / rx, v = (-px * s + py * c) / ry; return (hyp(u, v) - 1) * m; };
};
export const cap = (x1, y1, r1, x2, y2, r2 = r1) => {
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
  return (x, y) => { let t = ((x - x1) * dx + (y - y1) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; return hyp(x - (x1 + dx * t), y - (y1 + dy * t)) - (r1 + (r2 - r1) * t); };
};
export const box = (cx, cy, w, h, rot = 0, rad = 0) => {
  const c = Math.cos(rot), s = Math.sin(rot), hx = w / 2 - rad, hy = h / 2 - rad;
  return (x, y) => { const px = x - cx, py = y - cy, u = Math.abs(px * c + py * s) - hx, v = Math.abs(-px * s + py * c) - hy; return hyp(Math.max(u, 0), Math.max(v, 0)) + Math.min(Math.max(u, v), 0) - rad; };
};
export const poly = pts => {   // pts: [x, y, x, y, ...]
  const n = pts.length / 2;
  return (x, y) => {
    let d = 1e9, inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const ax = pts[j * 2], ay = pts[j * 2 + 1], bx = pts[i * 2], by = pts[i * 2 + 1];
      if (((ay > y) !== (by > y)) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
      const ex = bx - ax, ey = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey || 1)));
      d = Math.min(d, hyp(x - ax - ex * t, y - ay - ey * t));
    }
    return inside ? -d : d;
  };
};
export const uni = (...f) => (x, y) => { let d = 1e9; for (const g of f) { const v = g(x, y); if (v < d) d = v; } return d; };
export const sub = (a, b) => (x, y) => Math.max(a(x, y), -b(x, y));
export const inter = (a, b) => (x, y) => Math.max(a(x, y), b(x, y));
export const moveS = (f, dx, dy) => (x, y) => f(x - dx, y - dy);
// a smooth chain of capsules through points with radii: [[x, y, r], ...] (horns, tails, tendrils, roots)
export const chain = pts => uni(...pts.slice(1).map((p, i) => cap(pts[i][0], pts[i][1], pts[i][2], p[0], p[1], p[2])));
// a curved thorn from a base to a tip: base width w, bending by `bend` px to the side
export const thorn = (bx, by, tx, ty, w, bend = 0) => {
  const mx = (bx + tx) / 2, my = (by + ty) / 2, nx = -(ty - by), ny = tx - bx, L = hyp(nx, ny) || 1;
  const px = mx + nx / L * bend, py = my + ny / L * bend;
  return chain([[bx, by, w / 2], [px, py, w * 0.30], [tx, ty, 0.35]]);
};

// ---------- noise (deterministic) ----------
export const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
export const vnoise = (x, y, s = 0) => {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

// ---------- sprite ----------
// part: { sd, mat (a ramp), z, flat (one tone, no light), emit (a colour: lit by itself), rim (px over which the surface turns, default 3),
//   tone (+1 darker, -1 lighter), nl (no section line on what is under it), tex (amount of surface noise), lum (a function (x, y) -> light offset), id }
export class Sprite {
  constructor(w, h, o = {}) { this.w = w; this.h = h; this.parts = []; this.ink = o.ink ? rgb(o.ink) : INK; this.noOutline = !!o.noOutline; this.seed = o.seed || 1; }
  add(sd, mat, z = 0, o = {}) { this.parts.push(Object.assign({ sd, mat, z, id: this.parts.length }, o)); return this; }
  render() {
    const { w, h } = this, P = this.parts.map((p, i) => [p, i]).sort((a, b) => a[0].z - b[0].z || a[1] - b[1]).map(a => a[0]);
    const own = new Int16Array(w * h).fill(-1), dep = new Float32Array(w * h);
    for (let pi = 0; pi < P.length; pi++) {
      const sd = P[pi].sd;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = sd(x + 0.5, y + 0.5); if (d < 0) { own[y * w + x] = pi; dep[y * w + x] = d; } }
    }
    const out = new Uint8ClampedArray(w * h * 4);
    const Lx = -0.55, Ly = -0.66, Lz = 0.52, Ln = hyp(Lx, Ly, Lz);
    const put = (x, y, c) => { const i = (y * w + x) * 4; out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; out[i + 3] = 255; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const pi = own[y * w + x]; if (pi < 0) continue;
      const p = P[pi], R = p.mat;
      if (p.emit) { put(x, y, rgb(p.emit)); continue; }
      let tone;
      if (p.flat) tone = 3;
      else {
        const px = x + 0.5, py = y + 0.5, e = 0.75;
        let gx = p.sd(px + e, py) - p.sd(px - e, py), gy = p.sd(px, py + e) - p.sd(px, py - e); const gl = hyp(gx, gy) || 1; gx /= gl; gy /= gl;
        const t = Math.max(0, Math.min(1, -dep[y * w + x] / (p.rim || 3))), nz = Math.pow(t, 0.8), nxy = Math.sqrt(Math.max(0, 1 - nz * nz));
        let lum = (gx * nxy * Lx + gy * nxy * Ly + nz * Lz) / Ln;
        if (p.lum) lum += p.lum(px, py);
        if (p.tex) lum += (Math.floor(vnoise(px / 5, py / 5, this.seed + p.id) * 3) / 3 - 0.5) * p.tex * 0.5;   // low-frequency clusters only, never per-pixel speckle
        lum -= (p.tone || 0) * 0.35;
        tone = lum < -0.45 ? 1 : lum < 0.12 ? 2 : lum < 0.66 ? 3 : lum < 0.92 || p.hi === false ? 4 : 5;
      }
      put(x, y, R[tone]);
    }
    // section lines: where a part meets a part above it (not drawn when the upper part is nl)
    const line = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const pi = own[y * w + x]; if (pi < 0) continue; const p = P[pi];
      if (p.flat || p.emit || p.noLine) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = own[ny * w + nx]; if (q > pi && !P[q].nl && P[q].mat !== p.mat) { line.push([x, y, p.mat[0]]); break; }
      }
    }
    for (const [x, y, c] of line) put(x, y, c);
    // ink outline, 4-way
    if (!this.noOutline) {
      const ol = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (own[y * w + x] >= 0) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && own[ny * w + nx] >= 0) { ol.push([x, y]); break; } }
      }
      for (const [x, y] of ol) put(x, y, this.ink);
    }
    return { w, h, d: out };
  }
}

// ---------- images ----------
export const blankImg = (w, h) => ({ w, h, d: new Uint8ClampedArray(w * h * 4) });
export function blit(dst, src, ox, oy) {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const dx = x + ox, dy = y + oy; if (dx < 0 || dy < 0 || dx >= dst.w || dy >= dst.h) continue;
    const i = (y * src.w + x) * 4; if (!src.d[i + 3]) continue;
    const j = (dy * dst.w + dx) * 4; dst.d[j] = src.d[i]; dst.d[j + 1] = src.d[i + 1]; dst.d[j + 2] = src.d[i + 2]; dst.d[j + 3] = 255;
  }
}
export const isEmpty = img => { for (let i = 3; i < img.d.length; i += 4) if (img.d[i]) return false; return true; };
export function leftEdge(img) { for (let x = 0; x < img.w; x++) for (let y = 0; y < img.h; y++) if (img.d[(y * img.w + x) * 4 + 3]) return x; return -1; }
export function scaleImg(img, k) {
  const o = blankImg(img.w * k, img.h * k);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const i = (((y / k) | 0) * img.w + ((x / k) | 0)) * 4, j = (y * o.w + x) * 4; o.d[j] = img.d[i]; o.d[j + 1] = img.d[i + 1]; o.d[j + 2] = img.d[i + 2]; o.d[j + 3] = img.d[i + 3]; }
  return o;
}

// ---------- PNG ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (type, data) => { const b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); b.write(type, 4, 'ascii'); data.copy(b, 8); b.writeUInt32BE(crc32(b.subarray(4, 8 + data.length)), 8 + data.length); return b; };
export function encodePNG(img) {
  const { w, h, d } = img, bpp = 4, raw = Buffer.alloc((w * bpp + 1) * h);
  for (let y = 0; y < h; y++) {   // per row: the filter with the smallest sum of absolute values
    const row = Buffer.from(d.buffer, d.byteOffset + y * w * bpp, w * bpp), up = y ? Buffer.from(d.buffer, d.byteOffset + (y - 1) * w * bpp, w * bpp) : Buffer.alloc(w * bpp);
    let best = null, bf = 0, bs = Infinity;
    for (let f = 0; f < 5; f++) {
      const o = Buffer.alloc(w * bpp); let s = 0;
      for (let i = 0; i < w * bpp; i++) {
        const a = i >= bpp ? row[i - bpp] : 0, b = up[i], c = i >= bpp ? up[i - bpp] : 0;
        let p; if (f === 0) p = 0; else if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1; else { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
        const v = (row[i] - p) & 255; o[i] = v; s += v < 128 ? v : 256 - v;
      }
      if (s < bs) { bs = s; bf = f; best = o; }
    }
    raw[y * (w * bpp + 1)] = bf; best.copy(raw, y * (w * bpp + 1) + 1);
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- animation helpers ----------
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t * t * (3 - 2 * t);
// keyframes: [[t, {param: value, ...}], ...] with t in 0..1 (sorted); returns the params at u (eased between keys; missing params carry from the nearest key)
export function sampleKeys(keys, u, base = {}) {
  let a = keys[0], b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (u >= keys[i][0] && u <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
  const span = b[0] - a[0] || 1, t = ease(Math.max(0, Math.min(1, (u - a[0]) / span))), out = Object.assign({}, base);
  const names = new Set([...Object.keys(a[1]), ...Object.keys(b[1])]);
  for (const n of names) { const av = a[1][n] != null ? a[1][n] : (base[n] || 0), bv = b[1][n] != null ? b[1][n] : av; out[n] = lerp(av, bv, t); }
  return out;
}
