// map-study/core.js: the pixel kit for the World map art study (MAP0). Scratch code, not wired into
// the game. Everything is drawn at ART size (1 art px), then shown at 2x (map) or 3x (close-ups)
// with image-rendering: pixelated. Rules follow B1 (docs/design/art-direction.md): 3 tones per
// material lit from the top left, a dark section line where one piece sits on another, and a
// 1 art px ink outline (#120B18) round every sprite.
'use strict';
const MK = (() => {
  const INK = '#120B18';
  // ---------------- colour ----------------
  const RGB = new Map();
  const rgb = h => { let v = RGB.get(h); if (!v) { const n = parseInt(h.slice(1), 16); v = [n >> 16 & 255, n >> 8 & 255, n & 255]; RGB.set(h, v); } return v; };
  const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const lum = h => { const [r, g, b] = rgb(h); return (r * 0.3 + g * 0.59 + b * 0.11) / 255; };
  const desat = (h, t) => { const [r, g, b] = rgb(h), l = r * 0.3 + g * 0.59 + b * 0.11; return hex(r + (l - r) * t, g + (l - g) * t, b + (l - b) * t); };
  const mul = (a, b) => { const A = rgb(a), B = rgb(b); return hex(A[0] * B[0] / 255, A[1] * B[1] / 255, A[2] * B[2] / 255); };
  const rand = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  // 3 tones + a line colour from one base (the B1 ramp, simplified: highlight toward gold, shade toward plum)
  function ramp(base, o) {
    o = o || {};
    const hi = mix(mix(base, '#FFE8B0', 0.18), '#FFFFFF', o.hi ?? 0.12), sh = mix(mix(base, '#2A1840', 0.3), '#000000', o.sh ?? 0.08);
    return [hi, base, sh, mix(mix(base, '#1A0E28', 0.62), '#000000', 0.1)];
  }

  // ---------------- a sprite: an art-size grid of colours ----------------
  class Spr {
    constructor(w, h, fill) { this.w = w; this.h = h; this.c = new Array(w * h).fill(fill ?? null); this.lights = []; }
    ok(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    get(x, y) { return this.ok(x, y) ? this.c[y * this.w + x] : null; }
    set(x, y, c) { x = Math.round(x); y = Math.round(y); if (this.ok(x, y)) this.c[y * this.w + x] = c; return this; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); return this; }
    hl(x, y, w, c) { return this.rect(x, y, w, 1, c); }
    vl(x, y, h, c) { return this.rect(x, y, 1, h, c); }
    // rows of characters; pal maps a character to a colour; '.' and ' ' are empty
    map(rows, pal, ox = 0, oy = 0, flip = false) {
      rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch === '.' || ch === ' ') continue; const c = pal[ch]; if (c === undefined) throw new Error('no colour for ' + ch); this.set(ox + (flip ? row.length - 1 - x : x), oy + y, c); } });
      return this;
    }
    ell(cx, cy, rx, ry, c) {
      for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) this.set(x, y, typeof c === 'function' ? c(x, y, dx, dy) : c);
      }
      return this;
    }
    // a 3-tone shaded volume, lit from the top left. tones = [hi, base, shade]
    blob(cx, cy, rx, ry, tones, o) {
      o = o || {}; const L = [-0.55, -0.62, 0.58], ln = Math.hypot(...L);
      return this.ell(cx, cy, rx, ry, (x, y, dx, dy) => {
        const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)), d = (dx * L[0] + dy * L[1] + nz * L[2]) / ln;
        return d > (o.t0 ?? 0.72) ? tones[0] : d > (o.t1 ?? 0.18) ? tones[1] : tones[2];
      });
    }
    line(x0, y0, x1, y1, c, w = 1) {
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
      for (let i = 0; i <= n; i++) { const t = i / n, x = Math.round(x0 + (x1 - x0) * t - (w - 1) / 2), y = Math.round(y0 + (y1 - y0) * t - (w - 1) / 2); this.rect(x, y, w, w, c); }
      return this;
    }
    poly(pts, c) {
      const n = pts.length / 2; let y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < n; i++) { y0 = Math.min(y0, pts[i * 2 + 1]); y1 = Math.max(y1, pts[i * 2 + 1]); }
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
        const yc = y + 0.5, xs = [];
        for (let i = 0; i < n; i++) { const ax = pts[i * 2], ay = pts[i * 2 + 1], bx = pts[(i + 1) % n * 2], by = pts[(i + 1) % n * 2 + 1]; if ((ay <= yc) !== (by <= yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.set(x, y, typeof c === 'function' ? c(x, y) : c);
      }
      return this;
    }
    // copy another sprite in (null pixels skipped); line: a colour drawn where s covers pixels already
    // set (a section line on the piece underneath, B1 rule 2)
    stamp(s, x, y, o) {
      o = o || {}; x = Math.round(x); y = Math.round(y);
      for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
        const c = s.c[j * s.w + (o.flip ? s.w - 1 - i : i)]; if (c == null) continue;
        this.set(x + i, y + j, o.tint ? o.tint(c) : c);
      }
      for (const l of s.lights) this.lights.push(Object.assign({}, l, { x: x + (o.flip ? s.w - 1 - l.x : l.x), y: y + l.y }));
      return this;
    }
    // recolour every pixel (a palette swap: dark, dim, lit)
    recolor(fn) { const s = this.clone(); for (let i = 0; i < s.c.length; i++) if (s.c[i] != null) s.c[i] = fn(s.c[i], i % s.w, (i / s.w) | 0); return s; }
    clone() { const s = new Spr(this.w, this.h); s.c = this.c.slice(); s.lights = this.lights.map(l => Object.assign({}, l)); return s; }
    // a copy one px bigger on every side with a 1 art px outline (4-way)
    outlined(ink = INK) {
      const s = new Spr(this.w + 2, this.h + 2); s.stamp(this, 1, 1);
      for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
        if (s.get(x, y) != null) continue;
        if (this.get(x - 2, y - 1) != null || this.get(x, y - 1) != null || this.get(x - 1, y - 2) != null || this.get(x - 1, y) != null) s.c[y * s.w + x] = ink;
      }
      return s;
    }
    light(x, y, r, col, o) { this.lights.push(Object.assign({ x, y, r, col }, o || {})); return this; }
    // bounding box of set pixels
    bbox() { let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.c[y * this.w + x] != null) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1 }; }
    canvas(scale = 1) {
      const cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
      const g = cv.getContext('2d'), im = g.createImageData(this.w, this.h), d = im.data;
      for (let i = 0; i < this.c.length; i++) { const c = this.c[i]; if (c == null) continue; const [r, gg, b] = rgb(c); d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255; }
      g.putImageData(im, 0, 0);
      if (scale === 1) return cv;
      const big = document.createElement('canvas'); big.width = this.w * scale; big.height = this.h * scale;
      const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(cv, 0, 0, big.width, big.height);
      return big;
    }
  }
  const fromMap = (rows, pal) => new Spr(rows[0].length, rows.length).map(rows, pal);

  // Lighting over a finished plate (baked once). lights: [{ x, y, r, col, a }]. Pixels outside every
  // light's reach take dark(c); inside, bands (SNES style, no gradients): full colour, a warm tint
  // near the flame. edge: the width of the half-lit band, in art px.
  function relight(plate, lights, o) {
    o = o || {};
    const out = new Spr(plate.w, plate.h), darkC = new Map(), dark = c => { let v = darkC.get(c); if (v === undefined) { v = o.dark(c); darkC.set(c, v); } return v; };
    const edge = o.edge ?? 5, warmC = new Map();
    const warm = (c, col, k) => { const key = c + col + k; let v = warmC.get(key); if (!v) { v = mix(c, mul(mix(c, '#FFFFFF', 0.25), col), k); v = mix(v, col, k * 0.18); warmC.set(key, v); } return v; };
    for (let y = 0; y < plate.h; y++) for (let x = 0; x < plate.w; x++) {
      const c = plate.c[y * plate.w + x]; if (c == null) continue;
      const dk = o.darkPlate ? () => dark(o.darkPlate.c[y * plate.w + x] ?? c) : () => dark(c);
      let best = 1e9, bl = null, lit = o.allLit ? 2 : 0;
      for (const l of lights) {
        const dx = (x + 0.5 - l.x) / (l.rx || l.r), dy = (y + 0.5 - l.y) / (l.ry || l.r), q = Math.sqrt(dx * dx + dy * dy);
        if (q < best) { best = q; bl = l; }
      }
      if (!o.allLit && bl) { const r = bl.rx || bl.r, inner = 1 - edge / r; lit = best <= inner ? 2 : best <= 1 ? 1 : 0; }
      let v = lit === 2 ? c : lit === 1 ? (o.dither ? (((x + y) & 1) ? c : (o.half ? o.half(c, dk()) : dk())) : o.half ? o.half(c, dk()) : mix(c, dk(), 0.5)) : dk();
      if (bl && bl.warm && lit) { const wr = bl.warm; const dx = (x + 0.5 - bl.x) / wr, dy = (y + 0.5 - bl.y) / (wr * (bl.wy || 0.75)), q2 = dx * dx + dy * dy; if (q2 < 1) v = warm(v, bl.col || '#FFBA60', q2 < 0.3 ? 0.42 : 0.22); }
      out.c[y * plate.w + x] = v;
    }
    return out;
  }
  // A soft glow layer at art size, drawn smooth (CSS scales it with smoothing): additive light.
  function glowCanvas(w, h, lights, k = 1) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
    g.globalCompositeOperation = 'lighter';
    for (const l of lights) {
      if (!l.glow) continue;
      const [r, gg, b] = rgb(l.col || '#FFBA60'), R = l.glow;
      const gr = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, R);
      gr.addColorStop(0, `rgba(${r},${gg},${b},${(l.ga ?? 0.55) * k})`); gr.addColorStop(0.35, `rgba(${r},${gg},${b},${(l.ga ?? 0.55) * 0.35 * k})`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gr; g.fillRect(l.x - R, l.y - R, R * 2, R * 2);
    }
    return cv;
  }
  return { INK, rgb, hex, mix, lum, desat, mul, rand, ramp, Spr, fromMap, relight, glowCanvas };
})();
