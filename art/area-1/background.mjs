// art/area-1/background.mjs: the Mossy Hollow battle background, drawn in code. Night, a low moon, mist between flat pine layers,
// giant mossy trunks left and right, a hedgefolk cottage with lit windows, a lantern post, a cobbled road with a warm light pool.
// Flat tones only: no gradients, no blur, no anti-aliasing. Every object gets a 1px dark ink outline; far layers do not.
// drawBackground('land') -> 640x400, drawBackground('port') -> 400x720; the road line (where feet stand) is at 0.78 of the height.
import { rgb, mixc, hash, vnoise, ell, cap, box, poly, uni, chain, INK } from './kit.mjs';

const K = rgb;
const CFG = {
  land: { W: 640, H: 400, cot: 160, lamp: 478, moon: [396, 60, 15], L: { cx: 26, hw: 50, flare: 44 }, R: { cx: 606, hw: 52, flare: 44 }, back: { cx: 538, hw: 17 }, fenceL: [10, 128], fenceR: [494, 540] },
  port: { W: 400, H: 720, cot: 126, lamp: 296, moon: [262, 160, 16], L: { cx: 0, hw: 42, flare: 38 }, R: { cx: 400, hw: 46, flare: 38 }, back: { cx: 346, hw: 13 }, fenceL: [4, 84], fenceR: [330, 352] }
};

// ---------- palette ----------
const SKY = ['#0a0d24', '#0f1536', '#151d46', '#1c2755', '#243463', '#2e4272'].map(K);
const P = {
  star: K('#a9b8e8'), starB: K('#e6ecff'),
  moon: [K('#7f95a2'), K('#a3b6ba'), K('#d3dfd0'), K('#f4f8e4')], moonCr: K('#b4c4c2'),
  glow: [K('#22306a'), K('#2a3a74'), K('#344688')],
  cloud: [K('#0c1130'), K('#141b42'), K('#3a4c86'), K('#566aa4')],
  ridge1: K('#26346a'), ridge2: K('#1b2652'), pine1: K('#29386f'), pine2: K('#1d2a58'), pine2r: K('#2a3b72'), pine3: K('#131c42'), pine3r: K('#1e2b5a'),
  mist: [K('#2f3f72'), K('#3a4c84'), K('#4a5e96')],
  mistG: [K('#1b2c40'), K('#233851')],
  ground: [K('#0e1a1d'), K('#142529'), K('#1c3430'), K('#2a4a38')],
  bark: [K('#16121f'), K('#221c2e'), K('#322a3c'), K('#4a4050'), K('#6e6478')],
  barkBack: [K('#171d3f'), K('#1f2850'), K('#283359'), K('#36446f')],
  moss: [K('#14231d'), K('#1f3727'), K('#2e4d2e'), K('#42693a'), K('#62903f')],
  wood: [K('#1d1520'), K('#33262b'), K('#4d3a38'), K('#6e5444'), K('#94755a')],
  stone: [K('#1c1f3a'), K('#2c3052'), K('#3c4068'), K('#4e5480'), K('#6a72a0')],
  roof: [K('#1a2a34'), K('#26394a'), K('#33495a'), K('#466378'), K('#6f90a4')],
  warm: [K('#6a3a2a'), K('#d8782e'), K('#ffc25c'), K('#fff0b4')],
  road: [
    [K('#0c0a14'), K('#16162a'), K('#1d2038'), K('#262b48')],   // dark (lowest rows)
    [K('#161426'), K('#262b47'), K('#2f3656'), K('#3a4366')],   // cool
    [K('#1c1219'), K('#3a2f3e'), K('#473c44'), K('#554850')],   // warm 1
    [K('#271619'), K('#5c4440'), K('#745844'), K('#8c6b4c')],   // warm 2
    [K('#33201a'), K('#85604a'), K('#a98050'), K('#c89858')]    // warm 3
  ],
  rock: [K('#161a2c'), K('#232843'), K('#343b5c'), K('#4a5378'), K('#6a7499')],
  fg: [K('#06080f'), K('#0d1220'), K('#151c30'), K('#212a44'), K('#34405e')],
  fgMoss: [K('#0f1c18'), K('#17301f'), K('#244a2c'), K('#3a6a38')],
  fern: [K('#0c1a16'), K('#16301f'), K('#25502d'), K('#3b7239')],
  leaf: [K('#070a16'), K('#0c1426'), K('#13253a'), K('#24463f')],
  vine: [K('#233a2c'), K('#3a5c3a'), K('#6a9650')]
};
const WARM_GLOW = K('#ff9d40');

export function drawBackground(orient) {
  const C = CFG[orient === 'port' ? 'port' : 'land'], { W, H } = C;
  const R = Math.round(H * 0.78), HZ = R - 64, ROADTOP = R - 36, ROADBOT = R + 22;
  const d = new Uint8ClampedArray(W * H * 4); for (let i = 3; i < d.length; i += 4) d[i] = 255;
  const mask = new Uint8Array(W * H);
  const set = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; };
  const get = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const lum = c => c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (() => { let s = 12345; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
  const LD = [0.55, -0.83];   // light comes from the upper right (the moon)

  // draw an sd shape. shade(x, y, depth, px, py) -> colour. ink: outline colour or null.
  function obj(sd, bb, shade, ink = INK) {
    const x0 = Math.max(0, Math.floor(bb[0])), y0 = Math.max(0, Math.floor(bb[1])), x1 = Math.min(W - 1, Math.ceil(bb[2])), y1 = Math.min(H - 1, Math.ceil(bb[3])), idx = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const v = sd(x + 0.5, y + 0.5); if (v < 0) { mask[y * W + x] = 1; idx.push(y * W + x); set(x, y, shade(x + 0.5, y + 0.5, -v, x, y)); } }
    if (ink) for (let y = Math.max(0, y0 - 1); y <= Math.min(H - 1, y1 + 1); y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(W - 1, x1 + 1); x++) {
      if (mask[y * W + x]) continue;
      if ((x > 0 && mask[y * W + x - 1]) || (x < W - 1 && mask[y * W + x + 1]) || (y > 0 && mask[(y - 1) * W + x]) || (y < H - 1 && mask[(y + 1) * W + x])) set(x, y, ink);
    }
    for (const i of idx) mask[i] = 0;
  }
  // flat 4-5 tone shading from a ramp [deep, dark, base, light, rim] using the sd's own surface tilt
  const lit = (sd, pal, o = {}) => (x, y, depth) => {
    const e = 0.8, rim = o.rim || 2.6;
    let gx = sd(x + e, y) - sd(x - e, y), gy = sd(x, y + e) - sd(x, y - e); const gl = Math.hypot(gx, gy) || 1; gx /= gl; gy /= gl;
    let l = (gx * LD[0] + gy * LD[1]) * (depth < rim ? 1 : 0.4) + (o.bias || 0);
    if (o.tex) l += (vnoise(x / 2.4, y / 2.4, o.seed || 3) - 0.5) * o.tex + (hash(x | 0, y | 0, 9) - 0.5) * o.tex * 0.4;
    const t = l > 0.62 && depth < rim + 0.5 ? 4 : l > 0.2 ? 3 : l > -0.4 ? 2 : l > -0.8 ? 1 : 0;
    return pal[Math.min(t, pal.length - 1)];
  };
  const glow = (cx, cy, radii, alphas, col = WARM_GLOW) => {
    const rm = radii[radii.length - 1];
    for (let y = Math.max(0, Math.floor(cy - rm)); y <= Math.min(H - 1, cy + rm); y++) for (let x = Math.max(0, Math.floor(cx - rm)); x <= Math.min(W - 1, cx + rm); x++) {
      const r = Math.hypot(x + 0.5 - cx, (y + 0.5 - cy)); let k = -1; for (let i = 0; i < radii.length; i++) if (r < radii[i]) { k = i; break; }
      if (k < 0) continue; set(x, y, mixc(get(x, y), col, alphas[k]));
    }
  };

  // ---------- 1. sky ----------
  const fr = [0.2, 0.4, 0.57, 0.72, 0.86];
  for (let x = 0; x < W; x++) {
    const bs = fr.map((f, k) => HZ * f + (vnoise(x / 40, k * 7, 1) - 0.5) * 9);
    for (let y = 0; y < HZ + 24; y++) { let b = 0; while (b < 5 && y > bs[b]) b++; set(x, y, SKY[b]); }
  }
  const [mx, my, mr] = C.moon;
  for (let i = 0; i < Math.round(W * HZ / 1500); i++) {
    const x = (rnd() * W) | 0, y = (rnd() * HZ * 0.62) | 0; if (Math.hypot(x - mx, y - my) < mr + 34) continue;
    if (rnd() < 0.16) { set(x, y, P.starB); set(x - 1, y, P.star); set(x + 1, y, P.star); set(x, y - 1, P.star); set(x, y + 1, P.star); } else set(x, y, rnd() < 0.5 ? P.star : P.glow[2]);
  }
  // moon halo: three flat rings, only where lighter than the sky behind
  [[mr + 26, P.glow[0]], [mr + 15, P.glow[1]], [mr + 6, P.glow[2]]].forEach(([r, c]) => {
    for (let y = Math.max(0, my - r | 0); y <= my + r; y++) for (let x = Math.max(0, mx - r | 0); x <= Math.min(W - 1, mx + r); x++) if (Math.hypot(x + 0.5 - mx, y + 0.5 - my) < r && lum(get(x, y)) < lum(c)) set(x, y, c);
  });
  {
    const sd = ell(mx, my, mr, mr);
    obj(sd, [mx - mr - 2, my - mr - 2, mx + mr + 2, my + mr + 2], (x, y, dep) => {
      const nx = (x - mx) / mr, ny = (y - my) / mr, face = nx * 0.6 - ny * 0.8;   // toward the upper right
      if (dep < 2.2 && face > 0.35) return P.moon[3];
      if (face < -0.62 || (face < -0.3 && dep < 2)) return P.moon[0];
      if (face < -0.1) return P.moon[1];
      return P.moon[2];
    }, K('#8ea4b2'));
    for (const [cx, cy, r] of [[-5, -2, 3.4], [3, 5, 2.6], [4, -6, 2], [-2, 6, 1.6]]) obj(ell(mx + cx, my + cy, r, r * 0.85), [mx + cx - r - 1, my + cy - r - 1, mx + cx + r + 1, my + cy + r + 1], (x, y) => (x - mx - cx) * 0.5 - (y - my - cy) * 0.8 < -0.4 ? P.moon[0] : P.moonCr, null);
  }
  // clouds: dark flat banks, a thin lit edge on the side that faces the moon
  const cloud = (cx, cy, w, h) => {
    const parts = []; for (let i = 0; i < 5; i++) parts.push(ell(cx + (i - 2) * w * 0.2, cy - Math.sin(i * 1.9) * h * 0.18, w * 0.22, h * (0.38 + 0.12 * ((i * 37) % 3) / 2)));
    const sd = uni(...parts, box(cx, cy + h * 0.3, w * 0.8, h * 0.5, 0, 2));
    const tm = [mx - cx, my - cy], tl = Math.hypot(tm[0], tm[1]) || 1;
    obj(sd, [cx - w, cy - h, cx + w, cy + h], (x, y, dep) => {
      const o = sd(x + tm[0] / tl * 2.4, y + tm[1] / tl * 2.4) > 0;
      return o ? (dep < 1.4 ? P.cloud[3] : P.cloud[2]) : (y > cy + h * 0.1 ? P.cloud[0] : P.cloud[1]);
    }, null);
  };
  cloud(mx + 18, my + mr + 8, 120, 17); cloud(mx - 120, my + 6, 94, 14); cloud(mx - 40, my - mr - 4, 70, 10); cloud(mx + 130, my + 34, 86, 13);
  if (orient === 'port') { cloud(80, HZ * 0.28, 110, 15); cloud(300, HZ * 0.52, 100, 13); cloud(70, HZ * 0.6, 90, 12); }

  // ---------- 2. far land: ridges, pine layers, mist ----------
  const ridge = (base, amp, s1, seed, col) => { for (let x = 0; x < W; x++) { const h = amp * (vnoise(x / s1, seed) * 0.7 + vnoise(x / (s1 / 3), seed + 1) * 0.3); for (let y = Math.floor(base - h); y < HZ + 30; y++) set(x, y, col); } };
  const pine = (x, base, h, w, col, rimc) => {
    const n = Math.max(2, Math.round(h / 8)), top = base - h;
    for (let y = Math.floor(top); y < base; y++) {
      const t = (y - top) / h, u = t * n, half = (w / 2) * ((Math.floor(u) + 0.3 + 0.7 * (u % 1)) / n);
      for (let xx = Math.round(x - half); xx <= Math.round(x + half); xx++) set(xx, y, rimc && xx >= Math.round(x + half) - 1 && (u % 1) > 0.25 ? rimc : col);
    }
    for (let y = base; y < base + 3; y++) set(x, y, col);
  };
  const mistBand = (yc, thick, amp, seed, cols, pat = 0) => {
    for (let x = 0; x < W; x++) {
      const n = vnoise(x / 38, seed), t = pat ? thick * clamp((n - 0.25) * 2.2, 0, 1) : thick, c = yc + (vnoise(x / 70, seed + 4) - 0.5) * amp;
      if (t < 1) continue;
      for (let y = Math.round(c - t / 2); y < Math.round(c + t / 2); y++) { const f = (y - (c - t / 2)) / t; set(x, y, f < 0.28 ? cols[cols.length - 1] : f < 0.7 ? cols[1] : cols[0]); }
    }
  };
  if (orient === 'port') { ridge(HZ - 120, 150, 120, 5, K('#1f2c5e')); }
  ridge(HZ - 38, orient === 'port' ? 120 : 60, 90, 11, P.ridge1);
  for (let x = -4; x < W + 8; x += 5 + (hash(x, 1, 4) * 4 | 0)) pine(x, HZ - 14 + (vnoise(x / 20, 3) - 0.5) * 8, 22 + hash(x, 2, 5) * 16, 11, P.pine1);
  mistBand(HZ - 16, 18, 8, 21, P.mist);
  ridge(HZ - 22, 38, 70, 31, P.ridge2);
  for (let x = -6; x < W + 8; x += 7 + (hash(x, 3, 6) * 6 | 0)) pine(x, HZ - 2 + (vnoise(x / 20, 9) - 0.5) * 6, 32 + hash(x, 4, 7) * 22, 15, P.pine2, P.pine2r);
  mistBand(HZ - 2, 12, 6, 41, P.mist);

  // ---------- 3. back meadow (ground behind the road) ----------
  const gtop = x => HZ + 4 + (vnoise(x / 28, 51) - 0.5) * 9;
  for (let x = 0; x < W; x++) for (let y = Math.floor(gtop(x)); y < ROADTOP + 10; y++) {
    const n = vnoise(x / 5, y / 3, 6), hh = hash(x, y, 8);
    set(x, y, n > 0.7 ? P.ground[2] : n < 0.3 ? P.ground[0] : P.ground[1]);
    if (hh > 0.955 && y > gtop(x) + 2) { set(x, y, P.ground[3]); set(x, y - 1, P.ground[2]); }
  }
  // dark pines on the far left and right, in front of the meadow edge
  for (const [x, h] of orient === 'port' ? [[96, 90], [170, 60], [214, 70], [332, 96], [250, 58]] : [[210, 78], [258, 56], [290, 44], [348, 36], [540, 88], [492, 62], [580, 100], [440, 38]]) {
    pine(x, gtop(x) + 5, h, 22 + h * 0.15, P.pine3, P.pine3r);
  }

  // ---------- 4. cottage ----------
  {
    const cx = C.cot, by = HZ + 14;
    // chimney, behind the roof
    obj(box(cx + 15, by - 52, 8, 16), [cx + 8, by - 62, cx + 22, by - 40], (x, y) => P.stone[(hash(x | 0, y >> 2, 7) * 3 | 0) + (x > cx + 17 ? 1 : 0)], INK);
    // smoke, drifting right: flat puffs in two tones
    [[cx + 16, by - 64, 3.4], [cx + 20, by - 72, 4.2], [cx + 27, by - 81, 4.8], [cx + 36, by - 89, 4.2], [cx + 45, by - 95, 3]].forEach(([px, py, r], i) => {
      const sd = ell(px, py, r * 1.15, r); obj(sd, [px - r * 2, py - r * 2, px + r * 2, py + r * 2], (x, y) => (x - px) * 0.5 - (y - py) * 0.8 > r * 0.18 ? P.mist[2 - (i > 2 ? 1 : 0)] : P.mist[1 - (i > 2 ? 1 : 0)], null);
    });
    // wing at the left, low lean-to roof
    const wing = box(cx - 32, by - 9, 20, 18);
    obj(wing, [cx - 44, by - 20, cx - 20, by], (x, y) => P.stone[1 + (hash(((x + (((y - by) >> 2) & 1) * 3) / 6) | 0, (y - by) >> 2, 5) * 2.4 | 0)], INK);
    const wroof = poly([cx - 46, by - 16, cx - 32, by - 28, cx - 18, by - 16]);
    obj(wroof, [cx - 48, by - 30, cx - 16, by - 14], (x, y) => { const row = ((y - by + 30) / 3.5) | 0; return P.roof[(row & 1) ? 1 : 2] && ((x > cx - 28 && row < 3) ? P.roof[3] : (row & 1) ? P.roof[1] : P.roof[2]); }, INK);
    // main wall
    const wall = box(cx, by - 14, 54, 28);
    obj(wall, [cx - 28, by - 29, cx + 28, by], (x, y) => { const row = ((y - (by - 28)) / 5) | 0, col = ((x + (row & 1) * 3.5) / 7) | 0, n = hash(col, row, 11); const t = n < 0.28 ? 1 : n < 0.8 ? 2 : 3; return (x - cx > 20 && t < 3 ? P.stone[t + 1] : P.stone[t]); }, INK);
    // roof
    const roof = poly([cx - 35, by - 25, cx - 1, by - 58, cx + 1, by - 58, cx + 35, by - 25]);
    obj(roof, [cx - 38, by - 60, cx + 38, by - 22], (x, y, dep) => {
      const row = ((y - (by - 58)) / 4) | 0, edge = (y - (by - 58)) % 4 < 1;
      let t = (row & 1) ? 2 : 3; if (edge) t = 1; if (hash((x / 5) | 0, row, 3) > 0.9) t = Math.max(1, t - 1);
      if (x > cx + 5 && dep < 3.5) t = 4;   // moon-lit right slope
      if (vnoise(x / 6, y / 5, 8) > 0.64 && y < by - 36 && x < cx) return P.moss[1 + (hash(x | 0, y | 0, 2) > 0.6 ? 1 : 0)];
      return P.roof[Math.min(t, 4)];
    }, INK);
    // window light
    const wins = [[cx - 14, by - 16], [cx + 14, by - 16]];
    for (const [wx, wy] of wins) glow(wx, wy, [9, 15, 22], [0.4, 0.22, 0.1]);
    glow(cx, by - 40, [6, 10], [0.35, 0.18]);
    const win = (wx, wy, w, h) => {
      obj(box(wx, wy, w + 2, h + 2), [wx - w, wy - h, wx + w, wy + h], () => P.wood[1], INK);
      obj(box(wx, wy, w, h), [wx - w, wy - h, wx + w, wy + h], (x, y) => (Math.abs(x - wx) < 0.6 || Math.abs(y - wy) < 0.6) ? P.wood[0] : (Math.hypot(x - wx, y - wy) < 1.9 ? P.warm[3] : Math.hypot(x - wx, y - wy) < 3.6 ? P.warm[2] : P.warm[1]), null);
    };
    for (const [wx, wy] of wins) win(wx, wy, 7, 8);
    win(cx, by - 40, 4, 5);
    win(cx - 33, by - 10, 5, 5);
    // door: warm arch with a stone surround
    obj(uni(box(cx, by - 6, 11, 12), ell(cx, by - 12, 5.5, 5.5)), [cx - 8, by - 20, cx + 8, by], (x, y) => y < by - 17 ? P.stone[4] : Math.abs(x - cx) > 4 ? P.stone[3] : P.stone[2], INK);
    obj(uni(box(cx, by - 5, 7, 11), ell(cx, by - 11, 3.5, 3.5)), [cx - 6, by - 17, cx + 6, by], (x, y) => ((x - cx) | 0) === 0 && (y | 0) % 2 === 0 ? P.warm[0] : (Math.hypot(x - cx, y - (by - 6)) < 3.5 ? P.warm[3] : P.warm[2]), null);
    // a small hanging lantern by the door
    glow(cx + 11, by - 16, [5, 9, 14], [0.4, 0.22, 0.1]);
    obj(box(cx + 11, by - 16, 3, 4), [cx + 8, by - 20, cx + 14, by - 12], () => P.warm[3], INK);
  }
  mistBand(HZ + 11, 8, 4, 61, P.mist, 1);

  // ---------- 5. fences ----------
  const fence = (x0, x1, y) => {
    const posts = []; for (let x = x0; x <= x1; x += 17 + (hash(x, 1, 9) * 4 | 0)) posts.push(x);
    const ys = x => y + (vnoise(x / 40, 77) - 0.5) * 3;
    for (const rail of [6, 13]) for (let i = 0; i + 1 < posts.length; i++) {
      const xa = posts[i], xb = posts[i + 1], ya = ys(xa) - rail, yb = ys(xb) - rail + (hash(i, rail, 4) - 0.5) * 3;
      obj(cap(xa, ya, 1.4, xb, yb, 1.4), [xa - 2, Math.min(ya, yb) - 3, xb + 2, Math.max(ya, yb) + 3], lit(cap(xa, ya, 1.4, xb, yb, 1.4), P.wood, { rim: 1.5 }), INK);
    }
    for (const x of posts) { const h = 19 + (hash(x, 2, 6) * 5 | 0), tilt = (hash(x, 3, 6) - 0.5) * 1.5; const sd = poly([x - 2, ys(x), x - 2 + tilt, ys(x) - h, x + tilt, ys(x) - h - 2, x + 2 + tilt, ys(x) - h, x + 2, ys(x)]); obj(sd, [x - 4, ys(x) - h - 4, x + 4, ys(x) + 1], lit(sd, P.wood, { rim: 1.4 }), INK); }
  };
  fence(...C.fenceL, HZ + 26); fence(...C.fenceR, HZ + 24);

  // ---------- 6. trunks (bases behind the road) ----------
  const GY = ROADTOP + 8;
  function trunk(o) {
    const { cx, hw, inner, flare, seed, back } = o, fh = 120;
    const wob = y => Math.sin(y / 53 + seed) * hw * 0.05 + (vnoise(0, y / 23, seed) - 0.5) * hw * 0.14;
    const fl = y => flare * Math.pow(Math.max(0, (y - (GY - fh)) / fh), 2.3);
    const xl = y => cx - hw - wob(y) - fl(y) * (inner < 0 ? 1 : 0.35), xr = y => cx + hw + wob(y) + fl(y) * (inner > 0 ? 1 : 0.35);
    const sd = (x, y) => Math.max(xl(y) - x, x - xr(y), y - GY);
    const pal = back ? P.barkBack : P.bark;
    obj(sd, [cx - hw - flare - 4, -2, cx + hw + flare + 4, GY + 1], (x, y) => {
      const dl = inner > 0 ? xr(y) - x : x - xl(y), span = xr(y) - xl(y);
      if (back) { const r = vnoise(x / 2.6, y / 40, seed) + 0.3 * vnoise(x / 1.3, y / 9, seed + 1); return dl < 2.5 ? pal[3] : (dl < span * 0.4 ? (r > 0.62 ? pal[1] : pal[2]) : (r > 0.5 ? pal[0] : pal[1])); }
      const r = vnoise(x / 3.4 + vnoise(x / 9, y / 60, seed) * 3, y / 38, seed) + 0.45 * vnoise(x / 1.4, y / 8, seed + 2) - 0.2;
      const s = dl / (span * 0.62) * 1.05 + (r - 0.5) * 0.6;
      let t = s < 0.06 ? 4 : s < 0.2 ? 3 : s < 0.52 ? 2 : s < 0.86 ? 1 : 0;
      if (vnoise(x / 2.4, y / 34, seed + 9) < 0.15) t = Math.max(0, t - 2);
      const m = vnoise(x / 7, y / 16, seed + 5) + clamp((y - (GY - 170)) / 170, 0, 1) * 0.3 + (dl < 7 ? 0.05 : 0);
      if (m > 0.8 && y > 12) return P.moss[Math.max(0, t - 1)];
      return pal[t];
    }, back ? K('#161c3c') : INK);
    return { xl, xr };
  }
  trunk({ ...C.back, inner: -1, flare: 12, seed: 71, back: true });
  const TL = trunk({ ...C.L, inner: 1, seed: 17 }), TR = trunk({ ...C.R, inner: -1, seed: 29 });
  // roots
  const root = (pts, seed) => { const sd = chain(pts); const bb = pts.reduce((b, p) => [Math.min(b[0], p[0] - p[2] - 2), Math.min(b[1], p[1] - p[2] - 2), Math.max(b[2], p[0] + p[2] + 2), Math.max(b[3], p[1] + p[2] + 2)], [1e9, 1e9, -1e9, -1e9]);
    obj((x, y) => Math.max(sd(x, y), y - (GY + 2)), bb, (x, y, dep) => { const l = lit(sd, P.bark, { rim: 3, tex: 0.5, seed })(x, y, dep); const mm = vnoise(x / 6, y / 5, seed + 4) + (y < GY - 6 ? 0.12 : 0); return mm > 0.64 ? P.moss[l === P.bark[4] ? 3 : l === P.bark[3] ? 2 : l === P.bark[2] ? 1 : 0] : l; }, INK); };
  const Lc = C.L, Rc = C.R;
  root([[Lc.cx + Lc.hw + 4, GY - 46, 12], [Lc.cx + Lc.hw + Lc.flare * 0.6, GY - 14, 9], [Lc.cx + Lc.hw + Lc.flare + 24, GY + 1, 5], [Lc.cx + Lc.hw + Lc.flare + 38, GY + 3, 2]], 41);
  root([[Lc.cx + Lc.hw - 4, GY - 30, 9], [Lc.cx + Lc.hw + 18, GY - 5, 6], [Lc.cx + Lc.hw + Lc.flare * 0.9 + 6, GY + 2, 3]], 43);
  root([[Rc.cx - Rc.hw - 4, GY - 46, 12], [Rc.cx - Rc.hw - Rc.flare * 0.6, GY - 14, 9], [Rc.cx - Rc.hw - Rc.flare - 24, GY + 1, 5], [Rc.cx - Rc.hw - Rc.flare - 38, GY + 3, 2]], 47);
  root([[Rc.cx - Rc.hw + 4, GY - 28, 8], [Rc.cx - Rc.hw - 16, GY - 4, 5], [Rc.cx - Rc.hw - Rc.flare - 4, GY + 2, 3]], 49);

  mistBand(GY - 12, 12, 5, 81, P.mistG, 1);
  // ---------- 7. road ----------
  {
    const rows = []; let y = ROADTOP; let r = 0;
    while (y < ROADBOT + 4) { const h = Math.round(4 + r * 0.62); rows.push([y, h]); y += h; r++; }
    const rowOf = new Int16Array(H).fill(-1); rows.forEach(([y0, h], i) => { for (let yy = y0; yy < y0 + h; yy++) if (yy < H) rowOf[yy] = i; });
    const stones = rows.map(([y0, h], i) => { const arr = []; const w = 9 + i * 0.9; let x = -((hash(i, 1, 13) * w) | 0) - 4; while (x < W) { const sw = Math.round(w * (0.8 + hash(x, i, 14) * 0.7)); arr.push([x, x + sw, hash(x, i, 15)]); x += sw; } return arr; });
    const lp = [C.lamp - 22, R - 6, 110, 21];   // light pool: cx, cy, rx, ry
    const edgeT = x => ROADTOP + (vnoise(x / 13, 33) - 0.5) * 5, edgeB = x => ROADBOT + (vnoise(x / 17, 34) - 0.5) * 5;
    for (let x = 0; x < W; x++) for (let yy = Math.floor(edgeT(x)); yy < edgeB(x); yy++) {
      const ri = rowOf[Math.min(H - 1, Math.max(ROADTOP, yy))]; if (ri < 0) continue;
      const [y0, h] = rows[ri], st = stones[ri].find(s => x >= s[0] && x < s[1]); const u = x - st[0], w = st[1] - st[0], v = yy - y0;
      const q = ((x - lp[0]) / lp[2]) ** 2 + ((yy - lp[1]) / lp[3]) ** 2 + (vnoise(x / 9, yy / 5, 90) - 0.5) * 0.12;
      let ring = q < 0.16 ? 4 : q < 0.42 ? 3 : q < 0.82 ? 2 : 1; if (yy >= H * 0.8) ring = 0; else if (yy >= H * 0.8 - 4) ring = Math.min(ring, 1);
      const lv = st[2] < 0.25 ? 1 : st[2] < 0.85 ? 2 : 3;
      let t;
      if (u === 0 || v === h - 1 || (u === w - 1 && v > 1) || ((u === 1 && (v === 0 || v === h - 2)) || (u === w - 2 && v === 0))) t = 0;
      else if (v === 0 && lv > 1) t = Math.min(3, lv + 1); else if (v === 0) t = lv;
      else if (v >= h - 2 || u >= w - 2) t = Math.max(1, lv - 1);
      else t = lv;
      const hh = hash(x, yy, 16); if (hh > 0.972 && t > 0) t = Math.max(1, t - 1); else if (hh < 0.02 && t > 1) t = Math.min(3, t + 1);
      let col = P.road[ring][t];
      if (t === 0 && hash(x, yy, 17) > 0.93 && yy < H * 0.78) col = P.moss[1];
      if (yy < edgeT(x) + 1.5) col = P.road[ring === 1 ? 0 : 1][0];
      if (yy > edgeB(x) - 1.5) col = P.road[0][0];
      set(x, yy, col);
    }
  }
  // grass lip along the near road edge and tufts that overlap the far road edge
  for (let x = 0; x < W; x++) {
    const e = ROADBOT + (vnoise(x / 17, 34) - 0.5) * 5;
    for (let yy = Math.floor(e) - 1; yy < H; yy++) {
      const n = vnoise(x / 6, yy / 3, 61), hh = hash(x, yy, 62), k = yy - e;
      let c = P.fg[1]; if (n > 0.66) c = P.fg[2]; else if (n < 0.28) c = P.fg[0];
      if (k < 3 && hh > 0.5) c = P.fg[0];
      if (hh > 0.97 && k > 3 && n > 0.5) c = P.fgMoss[1];
      set(x, yy, c);
    }
    const t = ROADTOP + (vnoise(x / 13, 33) - 0.5) * 5;
    if (hash(x, 7, 63) > 0.8) { const hgt = 2 + (hash(x, 8, 63) * 3 | 0); for (let k = 0; k < hgt; k++) set(x + (k > 2 ? 1 : 0), t - k + 2, k > 1 ? P.ground[3] : P.ground[1]); }
  }

  // ---------- 8. mid rocks, lantern post ----------
  const rock = (cx, cy, rx, ry, seed, pal, mpal, nomoss) => {
    const base = ell(cx, cy, rx, ry), sd = (x, y) => base(x, y) + (vnoise(x / 4, y / 4, seed) - 0.5) * 3.2 + (y > cy ? 0 : -((cx - x) / rx) * 0.8);
    obj((x, y) => Math.max(sd(x, y), y - (cy + ry * 0.7)), [cx - rx - 3, cy - ry - 4, cx + rx + 3, cy + ry + 2], (x, y, dep) => {
      const l = lit(sd, pal, { rim: 2.6, tex: 0.5, seed })(x, y, dep);
      if (!nomoss && vnoise(x / 5, y / 4, seed + 3) > 0.52 && (y - cy) / ry < -0.1) return mpal[l === pal[4] ? 3 : l === pal[3] ? 2 : l === pal[2] ? 1 : 0];
      return l;
    }, pal === P.fg ? K('#04060b') : INK);
  };
  const fern = (x0, y0, ang, len, pal, k = 1, seed = 1) => {
    const n = Math.round(len / 3), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, a = ang + (t * t) * 0.9 * k; pts.push([x0 + Math.sin(a) * len * t * 0.95, y0 - Math.cos(a) * len * t * 0.95 + t * t * len * 0.15]); }
    for (let i = 0; i < n; i++) cap2(pts[i], pts[i + 1], 0.9, pal[1]);
    for (let i = 2; i <= n; i++) {
      const t = i / n, ll = (1 - t * 0.78) * len * 0.38, a0 = Math.atan2(pts[i][0] - pts[i - 1][0], -(pts[i][1] - pts[i - 1][1]));
      for (const sgn of [-1, 1]) { const a = a0 + sgn * (1.05 - t * 0.3), ex = pts[i][0] + Math.sin(a) * ll, ey = pts[i][1] - Math.cos(a) * ll + ll * 0.3; cap2(pts[i], [ex, ey], 1.1, (-Math.cos(a)) < -0.3 || t > 0.7 ? pal[3] : pal[2]); }
    }
  };
  function cap2(a, b, r, col) { const c = cap(a[0], a[1], r, b[0], b[1], r * 0.5); const x0 = Math.floor(Math.min(a[0], b[0]) - r - 1), x1 = Math.ceil(Math.max(a[0], b[0]) + r + 1), y0 = Math.floor(Math.min(a[1], b[1]) - r - 1), y1 = Math.ceil(Math.max(a[1], b[1]) + r + 1); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (c(x + 0.5, y + 0.5) < 0) set(x, y, col); }
  if (orient === 'port') {
    rock(96, GY - 6, 14, 9, 5, P.rock, P.moss); rock(318, GY - 4, 15, 10, 6, P.rock, P.moss); fern(106, GY, 0.2, 24, P.fern, 1); fern(302, GY, -0.3, 24, P.fern, -1);
  } else {
    rock(140, GY - 6, 17, 11, 5, P.rock, P.moss); rock(158, GY - 2, 11, 7, 6, P.rock, P.moss); rock(498, GY - 6, 17, 11, 7, P.rock, P.moss); rock(540, GY - 2, 14, 9, 8, P.rock, P.moss);
    fern(122, GY + 2, -0.5, 26, P.fern, -1); fern(176, GY + 3, 0.5, 22, P.fern, 1); fern(520, GY + 2, 0.4, 26, P.fern, 1); fern(458, GY + 4, -0.5, 20, P.fern, -1);
  }
  // lantern post, with its light on everything behind it
  {
    const lx = C.lamp, top = ROADTOP - 118, base = ROADTOP + 2, ax = lx - 26, ay = top + 14;
    glow(ax, ay + 7, [11, 20, 32], [0.58, 0.34, 0.16]);
    const pole = box(lx, (top + base) / 2, 6, base - top);
    obj(pole, [lx - 5, top - 2, lx + 5, base], (x, y) => { const dl = x - (lx - 3); const t = dl < 1.5 ? 1 : dl > 4.4 ? 4 : 2 + (vnoise(x, y / 7, 4) > 0.7 ? 0 : 1); return P.wood[t > 3 ? 4 : t > 2 ? 3 : t === 2 ? 2 : 1]; }, INK);
    obj(box(lx - 12, top + 6, 28, 4), [lx - 28, top, lx + 3, top + 12], (x, y) => y < top + 5 ? P.wood[3] : P.wood[2], INK);
    obj(cap(lx - 2, top + 22, 1.6, lx - 12, top + 8, 1.6), [lx - 15, top + 5, lx, top + 25], () => P.wood[2], INK);
    obj(cap(ax, top + 8, 0.6, ax, ay - 3, 0.6), [ax - 2, top + 6, ax + 2, ay], () => P.wood[0], null);
    obj(poly([ax - 5, ay, ax - 3, ay - 5, ax + 3, ay - 5, ax + 5, ay]), [ax - 6, ay - 7, ax + 6, ay + 1], (x, y) => P.wood[x > ax ? 3 : 2], INK);
    obj(box(ax, ay + 7, 8, 12), [ax - 6, ay + 1, ax + 6, ay + 14], (x, y) => { const q = Math.hypot((x - ax) * 1.1, (y - (ay + 7)) * 0.7); return q < 2.6 ? P.warm[3] : q < 4.2 ? P.warm[2] : P.warm[1]; }, INK);
    obj(box(ax, ay + 14, 8, 2), [ax - 6, ay + 12, ax + 6, ay + 17], () => P.wood[2], INK);
    glow(ax, ay + 7, [3.2], [0.0]);
  }
  // back trunk's mist, then the foliage canopy and limbs frame the top

  // ---------- 9. canopy, limbs, hanging moss ----------
  const limb = (pts, seed) => {
    const sd = chain(pts), bb = pts.reduce((b, p) => [Math.min(b[0], p[0] - p[2] - 3), Math.min(b[1], p[1] - p[2] - 3), Math.max(b[2], p[0] + p[2] + 3), Math.max(b[3], p[1] + p[2] + 3)], [1e9, 1e9, -1e9, -1e9]);
    obj(sd, bb, (x, y, dep) => { const l = lit(sd, P.bark, { rim: 3, tex: 0.6, seed })(x, y, dep); return vnoise(x / 6, y / 5, seed + 4) > 0.6 && l !== P.bark[0] ? P.moss[l === P.bark[4] ? 4 : l === P.bark[3] ? 3 : 2] : l; }, INK);
    return sd;
  };
  const y0 = HZ * 0.3;
  limb([[Lc.cx + Lc.hw - 14, y0 + 52, 16], [Lc.cx + Lc.hw + 36, y0 + 20, 11], [Lc.cx + Lc.hw + 84, y0 + 2, 7], [Lc.cx + Lc.hw + 124, y0 + 4, 3.5], [Lc.cx + Lc.hw + 150, y0 + 14, 1.6]], 101);
  limb([[Lc.cx + Lc.hw + 54, y0 + 12, 5], [Lc.cx + Lc.hw + 70, y0 + 36, 3.4], [Lc.cx + Lc.hw + 80, y0 + 58, 1.6]], 103);
  limb([[Rc.cx - Rc.hw + 12, y0 - 6, 14], [Rc.cx - Rc.hw - 30, y0 - 22, 9], [Rc.cx - Rc.hw - 62, y0 - 24, 5], [Rc.cx - Rc.hw - 88, y0 - 14, 2]], 107);
  // canopy: dark leaf mass at the top corners
  {
    const depth = x => { const a = Math.max(0, 1 - x / (W * 0.38)), b = Math.max(0, 1 - (W - x) / (W * 0.34)); return 8 + Math.max(a * a, b * b) * (HZ * 0.34) * (orient === 'port' ? 0.5 : 0.85) + (vnoise(x / 11, 71) - 0.5) * 12 + (vnoise(x / 3.3, 72) - 0.5) * 7; };
    for (let x = 0; x < W; x++) { const dp = Math.round(depth(x)); for (let y = 0; y < dp; y++) { const e = dp - y; let c = e < 3 ? P.leaf[2] : P.leaf[1]; if (y < dp - 10 && hash((x / 3) | 0, (y / 3) | 0, 73) < 0.5) c = P.leaf[0]; if (e < 5 && hash(x, y, 74) > 0.86 && x > W * 0.12) c = P.leaf[3]; set(x, y, c); } }
    for (let x = 0; x < W; x += 2) if (hash(x, 5, 75) > 0.5 && depth(x) > 18) { const x1 = x + ((hash(x, 6, 75) * 3) | 0), len = 8 + (hash(x, 7, 75) * 26 | 0), y1 = Math.round(depth(x)); for (let k = 0; k < len; k++) set(x1 + Math.round(Math.sin(k / 6 + x) * 0.8), y1 + k, k > len - 3 ? P.vine[2] : k % 4 === 3 ? P.vine[1] : P.vine[0]); }
  }
  // vines hanging from the left limb
  for (let i = 0; i < 9; i++) { const x = Lc.cx + Lc.hw + 20 + i * 12, yy = y0 + 4 + Math.sin(i * 0.5) * 6 + (i < 3 ? 14 : 0), len = 6 + (hash(i, 1, 76) * 20 | 0); for (let k = 0; k < len; k++) set(x + Math.round(Math.sin(k / 5 + i) * 0.7), yy + 8 + k, k > len - 3 ? P.vine[2] : k % 4 === 3 ? P.vine[1] : P.vine[0]); }

  // ---------- 10. foreground: rocks and ferns in the corners, quiet in the middle ----------
  const FY = H - 1;
  if (orient === 'port') {
    rock(14, FY - 32, 40, 30, 21, P.fg, P.fgMoss); rock(70, FY - 8, 30, 16, 22, P.fg, P.fgMoss); rock(392, FY - 30, 44, 30, 23, P.fg, P.fgMoss); rock(332, FY - 5, 28, 14, 24, P.fg, P.fgMoss);
    rock(200, FY + 6, 40, 11, 25, P.fg, P.fgMoss, true);
    fern(34, FY - 52, -0.4, 40, P.fern, -1); fern(52, FY - 30, 0.4, 32, P.fern, 1); fern(372, FY - 56, 0.3, 42, P.fern, 1); fern(352, FY - 28, -0.4, 30, P.fern, -1);
  } else {
    rock(18, FY - 30, 48, 32, 21, P.fg, P.fgMoss); rock(86, FY - 8, 34, 17, 22, P.fg, P.fgMoss); rock(142, FY + 2, 26, 10, 26, P.fg, P.fgMoss, true);
    rock(626, FY - 30, 52, 34, 23, P.fg, P.fgMoss); rock(552, FY - 8, 34, 17, 24, P.fg, P.fgMoss); rock(498, FY + 2, 26, 10, 27, P.fg, P.fgMoss, true);
    rock(322, FY + 6, 36, 9, 25, P.fg, P.fgMoss, true);
    fern(44, FY - 58, -0.4, 44, P.fern, -1); fern(64, FY - 36, 0.4, 36, P.fern, 1); fern(104, FY - 14, 0.5, 26, P.fern, 1);
    fern(604, FY - 62, 0.3, 46, P.fern, 1); fern(578, FY - 36, -0.4, 36, P.fern, -1); fern(540, FY - 14, -0.5, 26, P.fern, -1);
  }
  // fireflies
  for (const [fx, fy] of orient === 'port' ? [[60, 440], [330, 400], [90, 330], [350, 520], [30, 520]] : [[70, 230], [120, 200], [560, 236], [602, 190], [520, 268], [30, 280], [616, 290]]) {
    glow(fx + 0.5, fy + 0.5, [3.2], [0.18], K('#d8e87a')); set(fx, fy, K('#f4fa9a')); set(fx + 1, fy, K('#c6d860'));
  }
  return { w: W, h: H, road: R, img: { w: W, h: H, d } };
}
