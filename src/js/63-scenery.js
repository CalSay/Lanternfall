// 63-scenery: B1 (16-bit) parallax backgrounds with lantern light. Browser-only.
// Art is drawn at 2 CSS px per art px (like the B1 sprites): flat 3-tone pieces, a section line
// where one piece sits on another, a dark outline around mid and foreground shapes. Far layers are
// hazed toward the sky and have no outline, so they never compete with the sprites.
// Lanterns are the world's heartbeat: every theme has its own lamps, and each lit lamp casts a
// baked, banded light pool into the pixels plus a soft device-resolution glow that flickers.
//
//   sceneFor(theme, W, H, hue) -> scene     theme: forest|cave|bone|barrow|fungal|quarry|marsh|mine|woods|raid
//     scene = { layers: [{ c, f, fg }], fog, amb, light, lights, W, H, GY, M, PX, theme, hue }
//     Layers are drawn at PX = 2 CSS px per art px, (W + 2*M) CSS px wide (M = 24 px parallax margin),
//     cached per (theme, W, H, hue). GY is the ground line (feet), in CSS px.
//     scene.lights = [{ x, y, r, rgb, a, f, layer, kind }]: every lit lamp. x, y in stage CSS px at
//       camX = 0 (draw at x - camX * f), r = glow radius in CSS px, rgb = 'r,g,b', layer = index
//       into layers. drawAtmosphere already draws their glows; the list is there for extra effects.
//   drawScene(ctx, scene, camX, which = 'back')   which: 'back' (sky..ground) | 'fg' (foreground) | 'all'
//     ctx must be in CSS px units (e.g. setTransform(DPR,...)) with imageSmoothingEnabled = false.
//     camX in CSS px, keep within +-16.
//   drawAtmosphere(ctx, scene, T, W, H, camX = 0)   T in seconds; draws on top of everything.
//
// Per frame: 5 drawImage calls for the layers, 1-2 cached glow sprites per lamp (about 10-18
// lamps), a few fog blobs and particles, and one stretched vignette. No gradients are made per
// frame and nothing allocates. Flicker is static under prefers-reduced-motion.
let drawScene, drawAtmosphere;
function sceneFor() { return null; } // replaced below
{
  const PX = 2, M = 24, MA = M / PX;
  const REDUCED = typeof reduced !== 'undefined' ? reduced : !!(typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
  const rand = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // ---------- colour ----------
  const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  function toHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
    if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s, l];
  }
  function toRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    if (!s) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
  }
  const toward = (h, target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  const rot = (rgb, deg) => { if (!deg) return rgb; const [h, s, l] = toHsl(rgb); return toRgb(h + deg, s, l); };
  const blend = (a, b, t) => [0, 1, 2].map(i => Math.round(a[i] * (1 - t) + b[i] * t));
  const desat = (rgb, k) => { const [h, s, l] = toHsl(rgb); return toRgb(h, s * k, l); };
  // B1 ramp [highlight, base, shade, line]: highlight leans gold, shade and line lean plum.
  function ramp(rgb, soft) {
    const [h, s, l] = toHsl(rgb), k = soft ? 0.45 : 1;
    return [
      toRgb(toward(h, 48, 12 * k), s * 0.95, Math.min(0.9, l + k * Math.max(0.06, Math.min(0.15, l * 0.55)))),
      rgb,
      toRgb(toward(h, 262, 10 * k), s * 0.95, l * (1 - 0.3 * k)),
      toRgb(toward(h, 262, 18), s * 0.7, l * 0.46)
    ];
  }

  // ---------- material buffers ----------
  // Each layer is painted as material ids plus a piece id (paint order), then shaded in one pass:
  //  vol:  lit top and left edge, base, shade on the right and bottom edge (light from top left)
  //  top:  lit top edge, then base (ground, ridges, far silhouettes)
  //  flat: one colour (flames, glass, specks); flat materials never cast section lines
  // A pixel next to a later piece of another material becomes its material's line colour, the
  // pixel under that becomes shade (cast shadow). Outlined layers get a 1 px outline outside shapes.
  function Layer(w, h) { this.w = w; this.h = h; this.m = new Uint8Array(w * h); this.p = new Int32Array(w * h); this.pc = 0; this.hold = 0; this.pools = []; }
  Layer.prototype.np = function () { return this.hold ? this.pc : ++this.pc; };
  Layer.prototype.grp = function (fn) { this.pc++; this.hold++; fn(); this.hold--; };
  Layer.prototype.put = function (x, y, id, pc) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) { const i = y * this.w + x; this.m[i] = id; this.p[i] = pc; } };
  Layer.prototype.px = function (x, y, id) { this.put(Math.round(x), Math.round(y), id, this.np()); };
  Layer.prototype.span = function (x0, x1, y, id, pc) {
    if (y < 0 || y >= this.h) return; x0 = Math.max(0, x0); x1 = Math.min(this.w, x1);
    for (let x = x0; x < x1; x++) { const i = y * this.w + x; this.m[i] = id; this.p[i] = pc; }
  };
  Layer.prototype.rect = function (x, y, w, h, id) {
    const pc = this.np(), x0 = Math.round(x), y0 = Math.max(0, Math.round(y)), x1 = Math.round(x + w), y1 = Math.min(this.h, Math.round(y + h));
    for (let yy = y0; yy < y1; yy++) this.span(x0, x1, yy, id, pc);
  };
  // filled ellipse; half: 'top' keeps the upper half only
  Layer.prototype.oval = function (cx, cy, rx, ry, id, half) {
    const pc = this.np();
    for (let dy = -Math.ceil(ry); dy <= (half === 'top' ? 0 : Math.ceil(ry)); dy++) {
      const k = 1 - (dy / (ry + 0.5)) ** 2; if (k <= 0) continue;
      const w = Math.round(rx * Math.sqrt(k)); this.span(Math.round(cx - w), Math.round(cx + w + 1), Math.round(cy + dy), id, pc);
    }
  };
  // triangle pointing up (or down), apex at (cx, top)
  Layer.prototype.tri = function (cx, top, h, hw, id, down) {
    const pc = this.np();
    for (let i = 0; i < h; i++) { const w = Math.round(hw * (down ? 1 - i / h : (i + 1) / h)); this.span(Math.round(cx - w), Math.round(cx + w + 1), Math.round(top + i), id, pc); }
  };
  Layer.prototype.line = function (x0, y0, x1, y1, wd, id) {
    const pc = this.np(), n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))), w = Math.max(1, Math.round(wd));
    for (let i = 0; i <= n; i++) { const t = i / n, x = Math.round(x0 + (x1 - x0) * t - (w - 1) / 2), y = Math.round(y0 + (y1 - y0) * t - (w - 1) / 2); for (let k = 0; k < w; k++) this.span(x, x + w, y + k, id, pc); }
  };
  // polygon, scanline fill: pts = [x0, y0, x1, y1, ...]
  Layer.prototype.poly = function (pts, id) {
    const pc = this.np(), n = pts.length / 2; let y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < n; i++) { y0 = Math.min(y0, pts[i * 2 + 1]); y1 = Math.max(y1, pts[i * 2 + 1]); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < n; i++) { const ax = pts[i * 2], ay = pts[i * 2 + 1], bx = pts[(i + 1) % n * 2], by = pts[(i + 1) % n * 2 + 1]; if ((ay <= yc) !== (by <= yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) this.span(Math.round(xs[k]), Math.round(xs[k + 1]), y, id, pc);
    }
  };
  // column fill from y(x) to bottom (ridges, ground)
  Layer.prototype.fillFrom = function (yf, bottom, id) { const pc = this.np(); for (let x = 0; x < this.w; x++) { const y = Math.round(yf(x)); for (let yy = Math.max(0, y); yy < Math.min(this.h, bottom); yy++) this.put(x, yy, id, pc); } };

  function shade(L, mats, img, ol, noLines) {
    const { w, h, m, p } = L, d = img.data;
    const pAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : p[y * w + x];
    // a neighbour that sits on top of this piece and should cut a section line
    const over = (x, y, id, pc) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return false;
      const j = y * w + x, id2 = m[j]; if (!id2 || p[j] <= pc) return false;
      const m2 = mats[id2]; if (m2.nl) return false;
      return id2 !== id || mats[id].sep;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, id = m[i];
      if (!id) continue;
      const mt = mats[id], pc = p[i]; let t = 1;
      if (mt.mode !== 'flat') {
        const top = pAt(x, y - 1) !== pc, left = pAt(x - 1, y) !== pc;
        if (mt.mode === 'vol') {
          if (top || left) t = 0;
          else if (pAt(x + 1, y) !== pc || pAt(x, y + 1) !== pc || (mt.wide && pAt(x + 2, y) !== pc)) t = 2;
        } else if (top) t = 0;
        if (noLines) { /* far layers: no section lines, only the lit top edge */ }
        else if (over(x, y - 1, id, pc) || over(x - 1, y, id, pc) || over(x + 1, y, id, pc) || over(x, y + 1, id, pc)) t = 3;
        else if (y > 1 && over(x, y - 2, id, pc) && t < 2) t = 2;
      }
      const c = mt.r[t], o = i * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
    if (ol) {
      const solid = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return false; const id = m[y * w + x]; return id && !mats[id].nl; };
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (m[y * w + x]) continue;
        if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) { const o = (y * w + x) * 4; d[o] = ol[0]; d[o + 1] = ol[1]; d[o + 2] = ol[2]; d[o + 3] = 255; }
      }
    }
    // baked light: flat, banded pools around each lamp (SNES-style, three bands)
    for (const pl of L.pools) {
      const x0 = Math.max(0, Math.floor(pl.x - pl.rx)), x1 = Math.min(w - 1, Math.ceil(pl.x + pl.rx));
      const y0 = Math.max(0, Math.floor(pl.y - pl.ry)), y1 = Math.min(h - 1, Math.ceil(pl.y + pl.ry));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const o = (y * w + x) * 4; if (!d[o + 3]) continue;
        const q = ((x + 0.5 - pl.x) / pl.rx) ** 2 + ((y + 0.5 - pl.y) / pl.ry) ** 2; if (q >= 1) continue;
        const k = pl.a * (q < 0.22 ? 1 : q < 0.55 ? 0.6 : 0.3);
        for (let c = 0; c < 3; c++) d[o + c] = Math.min(255, Math.round(d[o + c] + (pl.rgb[c] - d[o + c]) * k * (pl.rgb[c] > d[o + c] ? 1 : 0.35)));
      }
    }
  }

  // ---------- themes ----------
  // sky: gradient stops; far/mid: base colours; gnd/lip/path: the ground band; ink: outline tone.
  const TH = {
    forest: { sky: ['#0C1424', '#172838', '#24404A', '#355650'], far: '#1E3A3A', far2: '#1A3430', leaf: '#2A5A3A', leaf2: '#224C36', bark: '#4A3628', iron: '#3A3444',
      gnd: '#244A2C', lip: '#4A8040', path: '#6A5236', stars: 1, amb: ['firefly', '#D8F07A', 14], fog: ['#8FC7A0', 0.07] },
    cave: { sky: ['#07060C', '#0E0C18', '#17132A', '#211C36'], far: '#1C1830', far2: '#221C38', rock: '#3A3252', wood: '#4A3828', iron: '#2E2A38', crystal: '#7FB2FF',
      gnd: '#211C30', lip: '#4A4064', path: '#2E2840', amb: ['drip', '#7FB2FF', 7], fog: ['#6E7FC0', 0.05] },
    bone: { sky: ['#0E0609', '#22100F', '#3E1A1C', '#5A2626'], far: '#2E1719', far2: '#26131A', wood: '#3E2A26', stone: '#5A4A4A', iron: '#2E2630', moon: '#E0524F', bone: '#B8AE9C',
      gnd: '#2A1A18', lip: '#5A3A2E', path: '#3E2A22', amb: ['ash', '#9A8F8F', 22], fog: ['#8A4048', 0.07] },
    barrow: { sky: ['#08121A', '#102430', '#1A3642', '#244A52'], far: '#16323C', far2: '#1A3A40', mound: '#28504A', stone: '#5A6E74', iron: '#2A3038', rune: '#9BE3F0',
      gnd: '#1C3A36', lip: '#3C6A5A', path: '#34484A', stars: 1, amb: ['mote', '#9BE3F0', 16], fog: ['#9BE3F0', 0.14] },
    fungal: { sky: ['#10081A', '#1E1030', '#34204A', '#4A2A5A'], far: '#2E1A3E', far2: '#34204A', cap: '#7A3A7E', cap2: '#A04A6A', stem: '#5E4A5E', iron: '#3A2A40', glow: '#FF9ED8',
      gnd: '#2A1834', lip: '#6A3A6E', path: '#3E2A48', amb: ['spore', '#FF9ED8', 22], fog: ['#B070C0', 0.07] },
    quarry: { sky: ['#12100E', '#221E1A', '#3A3228', '#4E4436'], far: '#3A332A', far2: '#4A4034', stone: '#8A7C66', wood: '#6A4A30', iron: '#36302C', moon: '#EFE6D6',
      gnd: '#3A342C', lip: '#7A6C56', path: '#5A5044', amb: ['dust', '#CDBFA0', 20], fog: ['#CDBFA0', 0.05] },
    marsh: { sky: ['#060D0C', '#0C1A18', '#162C28', '#234038'], far: '#16302A', far2: '#1C3630', reed: '#3A5A40', wood: '#4A3C2C', iron: '#26302C', wisp: '#9FE8C8', moon: '#CFE8E0',
      gnd: '#12302E', lip: '#2E4E48', path: '#5A4632', water: '#1A3A3A', amb: ['wisp', '#9FD8C9', 8], fog: ['#9FD8C9', 0.18] },
    mine: { sky: ['#08070B', '#100E16', '#18141F', '#201B28'], far: '#221D2A', far2: '#2A2432', wood: '#6A4A2E', iron: '#34303C', rock: '#3A3444',
      gnd: '#1E1A26', lip: '#4A4254', path: '#2A2530', amb: ['dust', '#A9B1BD', 14], fog: ['#8A7A6A', 0.05] },
    woods: { sky: ['#10201A', '#1C3426', '#2C4A34', '#3E6446'], far: '#244232', far2: '#2A4A36', leaf: '#2E5E36', leaf2: '#27502F', bark: '#553E2C', iron: '#3A3444',
      gnd: '#264A2A', lip: '#508A42', path: '#5E4A32', amb: ['leaf', '#6FBE5E', 12], fog: ['#CFE8B0', 0.05], shafts: 1 },
    raid: { sky: ['#0C0306', '#240A10', '#46141A', '#6A2022'], far: '#2E0E14', far2: '#381218', rock: '#3A1E26', stone: '#5A3A3A', iron: '#2A1C22', moon: '#FF9E3D',
      gnd: '#24100E', lip: '#5A2A22', path: '#3A1E1C', stars: 1, amb: ['ember', '#FF9E3D', 28], fog: ['#FF6A3D', 0.07] }
  };
  // light colours (lantern flame is never hue-shifted: it is the same light in every land)
  const FLAME = [255, 186, 96], FLAME_HOT = [255, 236, 170], FLAME_OUT = [232, 110, 48];

  const cache = new Map();

  function build(theme, W, H, hue) {
    const th = TH[theme] || TH.forest;
    const Wa = Math.ceil(W / PX), Ha = Math.ceil(H / PX), LW = Wa + 2 * MA;
    const GY = Math.round(H * 0.8), G = Math.floor(GY / PX);
    const r = rand(theme.length * 7919 + W * 13 + H * 31 + 7);
    const C = hex => rot(hx(hex), hue);
    const skyC = th.sky.map(C), skyBot = skyC[skyC.length - 1];
    const mats = [null];
    const add = (rgbs, mode, o) => { mats.push(Object.assign({ r: rgbs, mode: mode || 'vol' }, o || {})); return mats.length - 1; };
    const mat = (c, mode, o) => add(ramp(typeof c === 'string' ? C(c) : c), mode, o);
    const matS = (c, mode, o) => add(ramp(typeof c === 'string' ? C(c) : c, 1), mode || 'top', o);   // soft, for far layers
    const flat = (c, o) => { const v = typeof c === 'string' ? C(c) : c; return add([v, v, v, v], 'flat', Object.assign({ nl: 1 }, o || {})); };
    const hz = (hex, t, s) => desat(blend(C(hex), skyBot, t), s ?? 0.75);   // atmospheric perspective
    const X = fx => MA + fx * Wa;                                          // screen fraction -> layer x (art)
    const band = x => x > X(0.02) && x < X(0.9);                           // where the party and foe stand

    const sky = new Layer(LW, Ha), far = new Layer(LW, Ha), mid = new Layer(LW, Ha), gnd = new Layer(LW, Ha), fg = new Layer(LW, Ha);
    const LAY = [sky, far, mid, gnd, fg], PAR = [0.05, 0.2, 0.5, 1, 1.35];
    const lamps = [], drips = [], motes = [];

    // ---- lights ----
    // A lit lamp at art (x, y) on layer L: a glow (CSS radius rr), a banded pool baked into L, and
    // optionally a pool on the ground under it. rgb is an [r,g,b] array.
    function light(L, x, y, rr, o) {
      o = o || {};
      const rgb = o.rgb || FLAME, li = LAY.indexOf(L), a = o.a ?? 0.5;
      lamps.push({ x: (x + 0.5) * PX, y: (y + 0.5) * PX, r: rr, rgb: rgb.join(','), a, f: PAR[li], layer: li, core: o.core ?? 1, ph: r() * 6.283, kind: o.kind || 'lamp', flick: o.flick ?? 1 });
      const pa = o.pool ?? (li === 1 ? 0.25 : 0.32);
      if (pa > 0) L.pools.push({ x: x + 0.5, y: y + 0.5, rx: rr / PX * (o.px ?? 0.75), ry: rr / PX * (o.py ?? 0.7), rgb, a: pa });
      if (o.gnd) gnd.pools.push({ x: x + 0.5 + (o.gx || 0), y: G + 2, rx: o.gnd, ry: Math.max(3, o.gnd * 0.28), rgb, a: 0.3 });
      if (li === 2 && (o.kind || 'lamp') === 'lamp' && motes.length < 8 && r() < 0.7) motes.push(lamps[lamps.length - 1]);
    }
    // shared prop materials (created lazily per build)
    const iron = mat(th.iron || '#3A3444'), ironL = flat(ramp(C(th.iron || '#3A3444'))[3], { nl: 0 });
    const glass = add([FLAME, FLAME, FLAME, FLAME], 'flat', { nl: 1 }), hot = add([FLAME_HOT, FLAME_HOT, FLAME_HOT, FLAME_HOT], 'flat', { nl: 1 });
    const flameO = add([FLAME_OUT, FLAME_OUT, FLAME_OUT, FLAME_OUT], 'flat', { nl: 1 });
    const deadGlass = flat(blend(C(th.iron || '#3A3444'), [120, 130, 140], 0.25), { nl: 0 });
    const tinted = rgb => add([rgb, rgb, rgb, rgb], 'flat', { nl: 1 });

    // lantern: cap at (x, y) top centre, 5 x 7 art px; big = 7 wide. rgb: glass colour (default flame)
    function lantern(L, x, y, o) {
      o = o || {}; x = Math.round(x); y = Math.round(y);
      const lit = o.lit ?? true, g1 = o.rgb ? tinted(o.rgb) : glass, g2 = o.rgb ? tinted(blend(o.rgb, [255, 255, 240], 0.55)) : hot;
      L.grp(() => { L.rect(x - 1, y - 1, 3, 1, iron); L.rect(x - 2, y, 5, 1, iron); L.rect(x - 2, y + 1, 1, 4, iron); L.rect(x + 2, y + 1, 1, 4, iron); L.rect(x - 2, y + 5, 5, 1, iron); });
      if (lit) { L.rect(x - 1, y + 1, 3, 4, g1); L.rect(x, y + 2, 1, 2, g2); light(L, x, y + 3, o.r ?? 30, Object.assign({ rgb: o.rgb }, o)); }
      else { L.rect(x - 1, y + 1, 3, 4, deadGlass); if (o.broken) L.px(x + 1, y + 2, 0); }
    }
    // tiny lantern for ropes and far posts: 3 x 3
    function bulb(L, x, y, o) {
      o = o || {}; x = Math.round(x); y = Math.round(y);
      L.rect(x - 1, y, 3, 1, ironL); L.rect(x - 1, y + 1, 3, 2, o.rgb ? tinted(o.rgb) : glass); L.px(x, y + 1, o.rgb ? tinted(blend(o.rgb, [255, 255, 240], 0.5)) : hot);
      light(L, x, y + 2, o.r ?? 16, Object.assign({ core: 0.6 }, o));
    }
    // lamp post: base at (x, base), lantern on an arm (dir 1 = right, -1 = left) or on top
    function lampPost(L, x, base, h, o) {
      o = o || {}; x = Math.round(x);
      const dir = o.dir || 1, top = base - h, lit = o.lit ?? true;
      L.grp(() => {
        L.rect(x - 1, top, 2, h + 1, iron); L.rect(x - 2, base - 3, 4, 4, iron); L.rect(x - 2, top + 6, 4, 1, iron);
        if (!o.top) { L.rect(dir > 0 ? x : x - 5, top, 6, 1, iron); L.px(x + dir * 2, top + 1, iron); }
      });
      if (o.top) lantern(L, x, top - 6, Object.assign({ lit }, o));
      else { L.px(x + dir * 5, top + 1, ironL); lantern(L, x + dir * 5, top + 3, Object.assign({ lit, gnd: o.gnd ?? 14 }, o)); }
      if (o.twin) { L.grp(() => { L.rect(dir < 0 ? x : x - 5, top, 6, 1, iron); }); L.px(x - dir * 5, top + 1, ironL); lantern(L, x - dir * 5, top + 3, o); }
    }
    // broken lamp post: leaning, glass dark
    function brokenPost(L, x, base, h, lean) {
      const tx = x + lean, top = base - h;
      L.grp(() => { L.line(x, base, tx, top, 2, iron); L.rect(x - 2, base - 3, 4, 4, iron); L.line(tx, top, tx + 4 * Math.sign(lean || 1), top + 2, 1, iron); });
      lantern(L, tx + 4 * Math.sign(lean || 1), top + 4, { lit: false, broken: 1 });
    }
    // chain + lantern hanging from (x, y)
    function hang(L, x, y, len, o) { L.rect(Math.round(x), y, 1, len, ironL); lantern(L, x, y + len + 1, o); }
    // sagging rope from (x0, y0) to (x1, y1) with n little lights
    function rope(L, x0, y0, x1, y1, sag, n, o) {
      o = o || {}; const rp = flat(o.col || ramp(C(th.iron || '#3A3444'))[3], { nl: 1 });
      const yAt = x => { const t = (x - x0) / (x1 - x0); return y0 + (y1 - y0) * t + sag * Math.sin(Math.PI * t); };
      for (let x = Math.round(x0); x <= x1; x++) L.px(x, yAt(x), rp);
      for (let k = 1; k <= n; k++) { const x = x0 + (x1 - x0) * (k - 0.5) / n + (r() - 0.5) * 3; bulb(L, x, yAt(x) + 1, o); }
    }
    function candle(L, x, y, o) { // base at (x, y)
      const wax = flat('#D8CCB0', { nl: 0 });
      L.rect(x, y - 2, 1, 2, wax); L.px(x, y - 3, hot); L.px(x, y - 4, glass);
      light(L, x, y - 3, (o && o.r) || 12, Object.assign({ core: 0.5, pool: 0.22, px: 0.6, py: 0.5 }, o));
    }
    function windowLit(L, x, y, w, h, o) {
      L.rect(x, y, w, h, glass); if (w > 2) L.rect(x + Math.floor(w / 2), y, 1, h, ironL); if (h > 3) L.rect(x, y + Math.floor(h / 2), w, 1, ironL);
      light(L, x + w / 2 - 0.5, y + h / 2, (o && o.r) || 12, Object.assign({ core: 0.4, pool: 0.12 }, o));
    }
    function flame(L, x, y, s) { // fire tongue with base centre at (x, y)
      L.tri(x, y - 5 * s, 5 * s, 2.4 * s, flameO); L.tri(x, y - 4 * s, 4 * s, 1.5 * s, glass); L.tri(x, y - 2.4 * s, 2.4 * s, 0.7 * s, hot);
    }
    function brazier(L, x, base, s, o) {
      const bowl = mat(th.iron || '#3A3444', 'vol', { wide: 1 });
      L.grp(() => { L.rect(x - 1, base - 9 * s, 3, 9 * s, bowl); L.rect(x - 3 * s, base - 2, 6 * s + 1, 2, bowl); });
      L.poly([x - 5 * s, base - 12 * s, x + 5 * s + 1, base - 12 * s, x + 3 * s + 1, base - 8 * s, x - 3 * s, base - 8 * s], bowl);
      L.rect(x - 5 * s, base - 13 * s, 10 * s + 1, 1, bowl);
      flame(L, x - 2 * s, base - 12 * s, s * 0.8); flame(L, x + 2 * s, base - 12 * s, s * 0.8); flame(L, x, base - 12 * s, s * 1.2);
      light(L, x, base - 16 * s, (o && o.r) || 56 * s, Object.assign({ a: 0.6, rgb: [255, 150, 70], gnd: 16 * s, flick: 2 }, o));
    }

    // ---- sky: banded gradient with a 2x2 checker at each band edge (SNES) ----
    const bands = 7, skyImg = new ImageData(LW, Ha), sd = skyImg.data;
    const skyAt = t => { const n = skyC.length - 1, seg = Math.min(n - 1, Math.floor(t * n)), f = t * n - seg; return blend(skyC[seg], skyC[seg + 1], f); };
    const bandCols = []; for (let b = 0; b <= bands; b++) bandCols.push(skyAt(b / bands));
    for (let y = 0; y < Ha; y++) {
      const q = Math.min(1, y / (G - 4)) * bands, b = Math.floor(q), fq = q - b;
      for (let x = 0; x < LW; x++) {
        const c = bandCols[Math.min(bands, b + (fq > 0.7 && ((x + y) & 1) ? 1 : 0))], o = (y * LW + x) * 4;
        sd[o] = c[0]; sd[o + 1] = c[1]; sd[o + 2] = c[2]; sd[o + 3] = 255;
      }
    }
    if (th.stars) {
      const s1 = flat(blend([255, 244, 220], skyC[0], 0.2)), s2 = flat(blend(C('#8FA8B0'), skyC[0], 0.45));
      for (let i = 0; i < LW / 5; i++) sky.px(r() * LW, r() * G * 0.45, r() < 0.25 ? s1 : s2);
    }
    let moon = null;
    if (th.moon) {
      const big = theme === 'bone' || theme === 'raid';
      const mx = X(theme === 'raid' ? 0.42 : big ? 0.3 : theme === 'forest' ? 0.64 : 0.76), my = Math.round(Ha * (theme === 'forest' ? 0.26 : big ? 0.18 : 0.15)), mr = big ? 8 : 5;
      const mc = C(th.moon), id = mat(mc); mats[id].r[0] = blend(mc, [255, 250, 235], 0.4); mats[id].r[2] = blend(mc, mats[id].r[2], 0.5);
      sky.oval(mx, my, mr, mr, id);
      if (theme !== 'raid') { const cr = flat(blend(mc, ramp(mc)[2], 0.45)); sky.oval(mx - mr * 0.3, my + mr * 0.15, mr * 0.2, mr * 0.16, cr); sky.px(mx + mr * 0.3, my - mr * 0.35, cr); }
      moon = { x: mx * PX, y: my * PX, r: mr * PX, rgb: mc.join(',') };
    }

    // ---- far layer helpers ----
    const s = [r() * 10, r() * 10, r() * 10];
    const ridgeY = (x, base, amp) => base + Math.sin(x * 0.042 + s[0]) * amp + Math.sin(x * 0.11 + s[1]) * amp * 0.45 + Math.sin(x * 0.018 + s[2]) * amp * 1.2;
    const ceilY = x => Ha * 0.1 + Math.sin(x * 0.1 + s[1]) * Ha * 0.035 + Math.sin(x * 0.26 + s[0]) * Ha * 0.02;
    const farBack = matS(hz(th.far, 0.4)), farFront = matS(hz(th.far2 || th.far, 0.18));
    const farDark = flat(hz(th.far, 0.55), { nl: 1 });
    const farLamp = (x, y, o) => { // tiny distant lamp on a post (2 px of light)
      far.rect(x, y, 1, G - y, farDark); far.rect(x - 1, y - 2, 3, 2, glass); far.px(x, y - 2, hot);
      light(far, x, y - 1, (o && o.r) || 9, Object.assign({ core: 0.5, a: 0.55, pool: 0.2 }, o));
    };
    const pine = (L, x, base, h, id, trunk) => {
      if (trunk) L.rect(x - 1, base - h * 0.16, 2, h * 0.16 + 1, trunk);
      L.grp(() => { for (let t = 0; t < 3; t++) { const top = base - h + t * h * 0.24, hw = h * (0.14 + t * 0.08); L.tri(x, top, h * 0.36, hw, id); } });
    };
    const deadTree = (L, x, base, len, wd, id, rr, hook) => {
      L.grp(() => {
        const br = (x0, y0, a, l, w, d) => {
          if (d > 3 || w < 0.8) return;
          const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; L.line(x0, y0, x1, y1, w, id);
          if (hook && d === 1 && !hook.x) { hook.x = x1; hook.y = y1; }
          br(x1, y1, a - 0.5 - rr() * 0.3, l * 0.66, w * 0.6, d + 1); if (rr() < 0.85) br(x1, y1, a + 0.45 + rr() * 0.3, l * 0.6, w * 0.6, d + 1);
        };
        br(x, base, -Math.PI / 2 - 0.1 + rr() * 0.2, len, wd, 0);
      });
    };

    // ---- ground band (f 1): back lip, the path where feet stand, and the foreground ground ----
    const gTop = G - 3;
    const gm = mat(th.gnd, 'top'), lipM = flat(th.lip, { nl: 1 }), lipD = flat(ramp(C(th.lip))[2], { nl: 1 });
    mats[gm].r[0] = C(th.lip);
    gnd.rect(0, gTop, LW, Ha - gTop, gm);
    const pathM = th.path ? mat(th.path, 'top') : 0;
    const pathTop = G - 1, pathBot = G + 7;

    switch (theme) {
      // ================= Mossy Hollow: lamplit forest road, the most lanterns (hope) =================
      case 'forest': {
        far.fillFrom(x => ridgeY(x, G - Ha * 0.4, 4), G, farBack);
        for (let x = r() * 4; x < LW; x += 3 + r() * 4) { const b = ridgeY(x, G - Ha * 0.4, 4) + 3, h = 8 + r() * 10; far.tri(x, b - h, h, h * 0.3, farBack); }
        far.fillFrom(x => ridgeY(x + 99, G - Ha * 0.2, 3), G, farFront);
        for (let x = r() * 5; x < LW; x += 5 + r() * 6) { const b = ridgeY(x + 99, G - Ha * 0.2, 3) + 2, h = 10 + r() * 12; far.tri(x, b - h, h, h * 0.28, farFront); }
        // a cottage on the far hill, windows lit
        { const x = Math.round(X(0.63)), b = Math.round(ridgeY(X(0.63) + 99, G - Ha * 0.2, 3)) + 1, wall = matS(hz('#4A3A30', 0.2)), roof = matS(hz('#3A2A30', 0.2));
          far.rect(x - 6, b - 7, 12, 8, wall); far.poly([x - 8, b - 7, x, b - 13, x + 8, b - 7], roof); far.rect(x + 3, b - 13, 2, 4, roof);
          windowLit(far, x - 4, b - 5, 2, 2, { r: 10, a: 0.5 }); windowLit(far, x + 2, b - 5, 2, 2, { r: 10, a: 0.5 }); }
        for (const fx of [0.12, 0.3, 0.46, 0.84, 1.02]) { const x = Math.round(X(fx)); farLamp(x, Math.round(ridgeY(x + 99, G - Ha * 0.2, 3)) - 3); }
        // mid: canopy ceiling, trunks at the edges, a rope of lanterns, branch lanterns, a lamp post at the crossing
        const leaf = mat(desat(C(th.leaf), 0.85), 'vol', { sep: 1 }), leaf2 = mat(desat(C(th.leaf2), 0.85), 'vol', { sep: 1 });
        const bark = mat(desat(C(th.bark), 0.85), 'vol', { wide: 1 }), groove = flat(ramp(C(th.bark))[3], { nl: 0 });
        const trunk = (x, w) => { x = Math.round(x); mid.grp(() => { mid.rect(x, 0, w, G + 1, bark); mid.tri(x + w / 2, G - 6, 7, w * 0.8, bark); }); for (let k = 2; k < w - 2; k += 3) { let y = r() * 8; while (y < G - 6) { const l = 4 + r() * 12; mid.rect(x + k, y, 1, l, groove); y += l + 3 + r() * 6; } } };
        const tx = [X(-0.01), X(0.17), X(0.84), X(0.97)], tw = [10, 5, 5, 11];
        tx.forEach((x, i) => trunk(x, tw[i]));
        for (let x = -6; x < LW + 8; x += 7 + r() * 6) { const y = Ha * 0.03 + r() * Ha * 0.08; mid.oval(x, y, 7 + r() * 5, 5 + r() * 4, r() < 0.5 ? leaf : leaf2); }
        for (const x of [X(0.02), X(0.97)]) for (let k = 0; k < 4; k++) mid.oval(x + (r() - 0.5) * 18, Ha * (0.14 + k * 0.07), 7 + r() * 3, 5 + r() * 2, k % 2 ? leaf : leaf2);
        rope(mid, tx[1] + 4, Math.round(Ha * 0.2), tx[2], Math.round(Ha * 0.22), 9, 6, { r: 18, a: 0.42 });
        mid.line(tx[3], Ha * 0.36, tx[3] - 12, Ha * 0.33, 2, bark); hang(mid, tx[3] - 10, Math.round(Ha * 0.34), 5, { r: 30 });
        mid.line(tx[0] + 9, Ha * 0.3, tx[0] + 20, Ha * 0.27, 2, bark); hang(mid, tx[0] + 18, Math.round(Ha * 0.28), 6, { r: 30 });
        lampPost(mid, X(0.52), G + 1, 40, { r: 38, dir: -1 });
        // crossing signpost beside it
        const plank = mat('#6A5038');
        mid.grp(() => { mid.rect(X(0.555), G - 16, 1, 17, plank); mid.rect(X(0.555) - 1, G - 15, 7, 2, plank); mid.rect(X(0.555) - 5, G - 12, 6, 2, plank); });
        for (const [fx, rx] of [[0.05, 10], [0.93, 11], [0.3, 5], [0.7, 5]]) mid.oval(X(fx), G - 1, rx, rx * 0.6, leaf2, 'top');
        // ground: grass, a dirt road, flowers
        gnd.grp(() => { for (let x = 0; x < LW; x++) { const t = pathTop + ((x * 7 + 3) % 11 < 2 ? 1 : 0); gnd.span(x, x + 1, t, pathM, gnd.pc); for (let y = t + 1; y < pathBot + ((x * 5) % 13 < 3 ? 1 : 0); y++) gnd.span(x, x + 1, y, pathM, gnd.pc); } });
        const fl1 = flat('#E8B070'), fl2 = flat('#C8A0E0');
        for (let i = 0; i < LW / 10; i++) { const y = pathBot + 2 + r() * (Ha - pathBot - 3); gnd.px(r() * LW, y, r() < 0.5 ? fl1 : fl2); }
        break;
      }
      // ================= Batwing Caves: miners' lamps and crystal-lit niches =================
      case 'cave': {
        for (let x = 0; x < LW; x++) far.rect(x, 0, 1, Math.round(ceilY(x)) + 4, farFront);
        far.fillFrom(x => ceilY(x) + 4, G, farBack);
        far.fillFrom(x => ridgeY(x, G - Ha * 0.18, 4), G, farFront);
        for (let x = r() * 12; x < LW; x += 10 + r() * 14) { const b = ridgeY(x, G - Ha * 0.18, 4), h = 5 + r() * 9; far.tri(x, b - h, h, 2 + r() * 2, farFront); }
        for (const [fx, w] of [[0.22, 7], [0.6, 5], [0.86, 9]]) { const x = X(fx); far.poly([x - w, 0, x + w, 0, x + w * 0.4, Ha * 0.3, x + w * 0.7, G, x - w * 0.8, G, x - w * 0.5, Ha * 0.35], farFront); }
        const cry = C(th.crystal), cryM = tinted(desat(cry, 0.8)), cryD = tinted(blend(cry, C(th.far), 0.55));
        const niche = (x, y) => { far.oval(x, y, 5, 4, farDark); for (let k = 0; k < 3; k++) far.tri(x - 2 + k * 2, y + 3 - (2 + k % 2 * 2), 2 + k % 2 * 2, 0.6, k % 2 ? cryM : cryD); light(far, x, y + 1, 16, { rgb: cry, a: 0.45, core: 0.4, flick: 0, kind: 'crystal' }); };
        niche(Math.round(X(0.28)), Math.round(G - Ha * 0.42)); niche(Math.round(X(0.72)), Math.round(G - Ha * 0.5)); niche(Math.round(X(1.04)), Math.round(G - Ha * 0.36));
        farLamp(Math.round(X(0.48)), Math.round(ridgeY(X(0.48), G - Ha * 0.18, 4)) - 3);
        farLamp(Math.round(X(0.1)), Math.round(ridgeY(X(0.1), G - Ha * 0.18, 4)) - 3);
        const rk = mat(desat(C(th.rock), 0.8), 'vol', { wide: 1 }), rk2 = mat(desat(blend(C(th.rock), C(th.far), 0.35), 0.8), 'vol', { sep: 1 });
        mid.rect(0, 0, LW, 3, rk);
        for (let x = r() * 6; x < LW; x += 6 + r() * 9) { const len = band(x) ? Ha * (0.06 + r() * 0.12) : Ha * (0.12 + r() * 0.22); mid.tri(x, 2, len, 2 + r() * 3, r() < 0.5 ? rk : rk2, true); if (r() < 0.5) drips.push({ x: x * PX, y: (2 + len) * PX, f: 0.5 }); }
        // pillars at the edges
        mid.grp(() => { mid.poly([X(-0.03), 0, X(0.06), 0, X(0.045), G * 0.5, X(0.07), G + 1, X(-0.03), G + 1], rk); });
        mid.grp(() => { mid.poly([X(0.95), 0, X(1.04), 0, X(1.04), G + 1, X(0.93), G + 1, X(0.955), G * 0.55], rk); });
        // wooden prop frame with a hanging miner's lamp, a rope of lamps under the ceiling
        const wood = mat(th.wood, 'vol');
        mid.grp(() => { mid.rect(X(0.5), Ha * 0.18, 3, G - Ha * 0.18 + 1, wood); mid.rect(X(0.5) - 8, Ha * 0.18, 19, 3, wood); });
        hang(mid, X(0.5) - 6, Math.round(Ha * 0.18) + 3, 4, { r: 34 }); hang(mid, X(0.5) + 8, Math.round(Ha * 0.18) + 3, 7, { r: 30 });
        rope(mid, X(0.06), Math.round(Ha * 0.14), X(0.48), Math.round(Ha * 0.18), 7, 2, { r: 18 });
        rope(mid, X(0.52), Math.round(Ha * 0.18), X(0.95), Math.round(Ha * 0.13), 8, 2, { r: 18 });
        lantern(mid, X(0.975), Math.round(G - 30), { r: 30, gnd: 12 }); mid.rect(X(0.975) - 2, G - 32, 4, 1, ironL);
        // crystal clusters at the pillar feet
        const crystal = (x, n) => { for (let k = 0; k < n; k++) mid.tri(x + k * 2 - n, G - (4 + (k * 5) % 5), 4 + (k * 5) % 5, 1, k % 2 ? cryM : cryD); light(mid, x, G - 4, 24, { rgb: cry, a: 0.4, core: 0.5, flick: 0, kind: 'crystal', gnd: 10 }); };
        crystal(X(0.07), 4); crystal(X(0.92), 3);
        for (const fx of [0.34, 0.62]) mid.tri(X(fx), G - 5, 6, 3, rk2);
        gnd.grp(() => gnd.rect(0, pathTop, LW, pathBot - pathTop, pathM));
        const st = mat(desat(C(th.rock), 0.7));
        for (let i = 0; i < 10; i++) gnd.oval(r() * LW, pathBot + 2 + r() * (Ha - pathBot - 3), 1 + r() * 2, 1, st);
        break;
      }
      // ================= The Bonefield: grave candles, a lamp-lit chapel, broken posts =================
      case 'bone': {
        far.fillFrom(x => ridgeY(x, G - Ha * 0.22, 4), G, farBack);
        for (let x = r() * 16; x < LW; x += 12 + r() * 16) { const b = ridgeY(x, G - Ha * 0.22, 4); far.rect(x, b - 5, 1, 5, farBack); far.rect(x - 1, b - 4, 3, 1, farBack); }
        // chapel on the rise
        { const x = Math.round(X(0.55)), b = Math.round(ridgeY(X(0.55), G - Ha * 0.22, 4)) + 2, wall = matS(hz('#4A3434', 0.15)), roof = matS(hz('#2E1C22', 0.1));
          far.rect(x - 9, b - 10, 16, 11, wall); far.poly([x - 11, b - 10, x - 1, b - 17, x + 9, b - 10], roof);
          far.rect(x + 6, b - 20, 6, 21, wall); far.tri(x + 9, b - 29, 9, 3.5, roof); far.rect(x + 9, b - 32, 1, 3, roof); far.rect(x + 8, b - 31, 3, 1, roof);
          windowLit(far, x - 6, b - 7, 2, 3, { r: 12, a: 0.55 }); windowLit(far, x - 1, b - 7, 2, 3, { r: 12, a: 0.55 }); windowLit(far, x + 8, b - 16, 2, 3, { r: 12, a: 0.6 });
          far.rect(x + 3, b - 5, 2, 5, glass); }
        far.fillFrom(x => ridgeY(x + 400, G - Ha * 0.1, 2), G, farFront);
        const wood = mat(desat(C(th.wood), 0.8)), stone = mat(desat(C(th.stone), 0.7)), boneC = flat(blend(C(th.bone), C(th.gnd), 0.4)), crossD = flat(ramp(C(th.stone))[3], { nl: 0 });
        const hookR = {}; deadTree(mid, X(0.95), G + 1, Ha * 0.26, 5, wood, r, hookR);
        deadTree(mid, X(0.03), G + 1, Ha * 0.24, 5, wood, r);
        if (hookR.x) hang(mid, hookR.x, Math.round(hookR.y), 4, { r: 28 });
        for (const [fx, cnd] of [[0.16, 1], [0.28, 0], [0.4, 1], [0.58, 1], [0.8, 0], [0.86, 1]]) {
          const x = Math.round(X(fx) + (r() - 0.5) * 6), h = 7 + Math.round(r() * 4), w = 5 + Math.round(r() * 2);
          mid.grp(() => { mid.rect(x, G - h + 2, w, h, stone); mid.oval(x + w / 2 - 0.5, G - h + 2, w / 2, 2, stone, 'top'); });
          if (r() < 0.5) { mid.rect(x + Math.floor(w / 2), G - h + 3, 1, 4, crossD); mid.rect(x + Math.floor(w / 2) - 1, G - h + 4, 3, 1, crossD); }
          if (cnd) candle(mid, x - 2, G + 1, { r: 14 });
        }
        brokenPost(mid, Math.round(X(0.9)), G + 1, 30, -5);
        lampPost(mid, Math.round(X(0.47)), G + 1, 38, { r: 36, dir: 1 });
        gnd.grp(() => { for (let x = 0; x < LW; x++) { const t = pathTop + ((x * 3) % 17 < 3 ? 1 : 0); for (let y = t; y < pathBot - ((x * 7) % 19 < 4 ? 1 : 0); y++) gnd.span(x, x + 1, y, pathM, gnd.pc); } });
        for (let i = 0; i < 12; i++) { const x = r() * LW, y = pathBot + 2 + r() * (Ha - pathBot - 4); gnd.rect(x, y, 2 + r() * 2, 1, boneC); }
        for (const fx of [0.36, 0.7]) candle(gnd, Math.round(X(fx)), pathBot + 4, { r: 12 });
        break;
      }
      // ================= Beetle Barrows: lantern-lit barrow doors, rune stones =================
      case 'barrow': {
        far.fillFrom(x => ridgeY(x, G - Ha * 0.3, 5), G, farBack);
        far.fillFrom(x => ridgeY(x + 300, G - Ha * 0.14, 3), G, farFront);
        for (const [fx, rx, ry] of [[0.3, 16, 8], [0.62, 20, 10], [0.9, 14, 7]]) { const x = X(fx), b = ridgeY(x + 300, G - Ha * 0.14, 3) + 2; far.oval(x, b, rx, ry, farFront, 'top'); far.rect(x - 1, b - 3, 3, 3, glass); light(far, x, b - 2, 10, { a: 0.5, core: 0.4, pool: 0.2 }); }
        const mound = mat(desat(C(th.mound), 0.8), 'vol', { wide: 1 }), stone = mat(desat(C(th.stone), 0.7), 'vol'), dark = flat(ramp(C(th.mound))[3], { nl: 0 });
        const rune = C(th.rune), runeM = tinted(rune);
        const doorLight = tinted(blend(FLAME, [60, 30, 20], 0.45));
        const barrow = (x, rx, ry, door) => {
          mid.oval(x, G + 1, rx, ry, mound, 'top');
          if (door == null) return;
          x = Math.round(x + door);
          mid.rect(x - 4, G - 10, 9, 11, doorLight); mid.rect(x - 2, G - 7, 5, 8, glass);
          mid.grp(() => { mid.rect(x - 7, G - 13, 15, 3, stone); mid.rect(x - 6, G - 10, 2, 11, stone); mid.rect(x + 5, G - 10, 2, 11, stone); });
          light(mid, x, G - 5, 30, { a: 0.4, core: 0.3, gnd: 14, kind: 'door' });
          lampPost(mid, x - 11, G + 1, 16, { top: 1, r: 24 }); lampPost(mid, x + 12, G + 1, 16, { top: 1, r: 24 });
        };
        barrow(X(-0.02), 26, 22, null); barrow(X(1.02), 30, 26, -14); barrow(X(0.5), 22, 16, 0);
        const standing = (x, sw, sh, lit) => { mid.grp(() => { mid.rect(x - sw / 2, G - sh + 1, sw, sh, stone); mid.oval(x - 0.5, G - sh + 1, sw / 2, 1.5, stone, 'top'); }); if (lit) { const ry = G - Math.round(sh * 0.6); mid.px(x - 1, ry, runeM); mid.px(x, ry + 1, runeM); mid.px(x - 1, ry + 3, runeM); light(mid, x, ry + 1, 14, { rgb: rune, a: 0.3, core: 0, flick: 0, kind: 'rune' }); } };
        standing(X(0.16), 5, 20, 1); standing(X(0.21), 4, 12, 0); standing(X(0.78), 5, 22, 1); standing(X(0.3), 3, 8, 0);
        lampPost(mid, Math.round(X(0.04)), G - 12, 16, { top: 1, r: 28 });
        // stone slab path
        const slab = mat(desat(C(th.path), 0.6), 'top', { sep: 1 });
        for (let x = -2; x < LW; x += 7 + Math.round(r() * 3)) { const w = 5 + Math.round(r() * 3); gnd.rect(x, pathTop + (r() < 0.3 ? 1 : 0), w, pathBot - pathTop - 1, slab); }
        break;
      }
      // ================= Fungal Deep: paper lanterns hung among glowing caps =================
      case 'fungal': {
        far.fillFrom(x => ridgeY(x, G - Ha * 0.12, 3), G, farBack);
        const farShroom = (x, h, cw, lit) => { const b = G - Ha * 0.08; far.rect(x - 1, b - h, 2, h + 4, farBack); far.oval(x, b - h, cw, cw * 0.5, farFront, 'top'); if (lit) { far.rect(x + cw - 2, b - h + 1, 1, 2, farDark); far.rect(x + cw - 3, b - h + 3, 3, 3, glass); light(far, x + cw - 2, b - h + 4, 9, { a: 0.5, core: 0.4 }); } };
        let li = 0; for (let x = r() * 10; x < LW; x += 12 + r() * 16) farShroom(x, 10 + r() * 22, 4 + r() * 6, li++ % 2 === 0);
        const stem = mat(desat(C(th.stem), 0.7), 'vol', { wide: 1 }), cap = mat(desat(C(th.cap), 0.8), 'vol', { wide: 1 }), cap2 = mat(desat(C(th.cap2), 0.75), 'vol', { wide: 1 });
        const gill = flat(ramp(C(th.cap))[3], { nl: 0 }), glowC = C(th.glow), spot = tinted(glowC), spotD = tinted(blend(glowC, C(th.cap), 0.5));
        const paper = [255, 170, 110];
        const shroom = (x, h, cw, c, lanterns) => {
          x = Math.round(x);
          mid.grp(() => { mid.rect(x - Math.max(1, Math.round(cw * 0.16)), G - h, Math.max(3, Math.round(cw * 0.32)), h + 1, stem); mid.rect(x - cw * 0.2, G - 2, cw * 0.4, 3, stem); });
          mid.oval(x, G - h, cw, cw * 0.58, c, 'top'); mid.rect(x - cw + 2, G - h, 2 * cw - 3, 1, gill);
          const n = Math.round(cw / 3);
          for (let k = 0; k < n; k++) { const sx = x + (r() - 0.5) * cw * 1.3, sy = G - h - 2 - r() * cw * 0.35; mid.px(sx, sy, k % 3 ? spotD : spot); }
          light(mid, x, G - h - cw * 0.2, cw * 2.2, { rgb: glowC, a: 0.2, core: 0, flick: 0, kind: 'glow', pool: 0.15 });
          for (const lx of lanterns) hang(mid, x + lx * cw, G - h + 1, 3 + Math.round(r() * 5), { r: 26, rgb: paper });
        };
        shroom(X(0.03), Ha * 0.46, 22, cap, [0.6]); shroom(X(0.96), Ha * 0.54, 25, cap2, [-0.7, -0.2]);
        shroom(X(0.26), 10, 5, cap2, []); shroom(X(0.57), 8, 4, cap, []); shroom(X(0.86), 14, 7, cap, []);
        // lantern on a stake between the party and the foe
        lampPost(mid, Math.round(X(0.5)), G + 1, 30, { r: 32, rgb: paper, dir: 1 });
        rope(mid, X(0.08), Math.round(Ha * 0.26), X(0.88), Math.round(Ha * 0.18), 10, 5, { r: 16, rgb: paper, a: 0.4 });
        gnd.grp(() => { for (let x = 0; x < LW; x++) for (let y = pathTop + ((x * 3) % 13 < 2 ? 1 : 0); y < pathBot; y++) gnd.span(x, x + 1, y, pathM, gnd.pc); });
        for (const [fx, h, cw] of [[-0.01, 8, 4], [1.0, 6, 3]]) { const x = Math.round(X(fx)); fg.rect(x - 1, Ha - h, 2, h, stem); fg.oval(x, Ha - h, cw, cw * 0.6, cap, 'top'); }
        break;
      }
      // ================= Quarry Ruins: work lamps on scaffolds and carts =================
      case 'quarry': {
        for (let pass = 0; pass < 2; pass++) {
          const base = pass ? G - Ha * 0.14 : G - Ha * 0.36, id = pass ? farFront : farBack;
          far.fillFrom(x => Math.round(ridgeY(x + pass * 200, base, pass ? 3 : 6) / 4) * 4, G, id);
        }
        const ledge = flat(hz(th.far, 0.3), { nl: 1 }), cut = flat(hz(th.far, 0.55), { nl: 1 });
        for (let y = Math.round(G - Ha * 0.3); y < G - Ha * 0.16; y += 5) for (let x = r() * 20; x < LW; x += 14 + r() * 20) { far.rect(x, y, 6 + r() * 10, 1, ledge); if (r() < 0.4) far.rect(x + 2, y + 1, 1, 3, cut); }
        // far scaffolds with pinpoint lamps
        for (const fx of [0.3, 0.66, 0.92]) { const x = Math.round(X(fx)), b = Math.round(ridgeY(x, G - Ha * 0.36, 6) / 4) * 4; far.rect(x - 4, b - 12, 1, 12, farDark); far.rect(x + 4, b - 12, 1, 12, farDark); far.rect(x - 5, b - 12, 11, 1, farDark); far.rect(x - 5, b - 6, 11, 1, farDark); far.rect(x + 1, b - 11, 2, 2, glass); light(far, x + 1, b - 10, 9, { a: 0.5, core: 0.4 }); }
        const st = mat(desat(C(th.stone), 0.7), 'vol', { wide: 1 }), flute = flat(ramp(C(th.stone))[2], { nl: 0 }), wood = mat(desat(C(th.wood), 0.8));
        const pillar = (x, h, w, intact) => {
          x = Math.round(x);
          mid.grp(() => { mid.rect(x, G - h, w, h + 1, st); mid.rect(x - 1, G - 2, w + 2, 3, st); if (intact) { mid.rect(x - 1, G - h - 2, w + 2, 2, st); mid.rect(x - 2, G - h - 4, w + 4, 2, st); } else for (let k = 0; k < w; k++) mid.rect(x + k, G - h - Math.round(r() * 3), 1, 4, st); });
          for (let k = 2; k < w - 1; k += 2) mid.rect(x + k, G - h + 3, 1, h - 5, flute);
        };
        pillar(X(0.93), Ha * 0.52, 9, true); pillar(X(0.3), 9, 6, false); pillar(X(0.63), 7, 6, false);
        // scaffold with work lamps (left)
        const sx = Math.round(X(0.0)), sw = 16, sTop = Math.round(G - Ha * 0.56);
        mid.grp(() => { mid.rect(sx, sTop, 2, G - sTop + 1, wood); mid.rect(sx + sw, sTop, 2, G - sTop + 1, wood); for (const y of [sTop, sTop + 16, sTop + 34]) mid.rect(sx - 2, y, sw + 6, 2, wood); mid.line(sx + 1, sTop + 2, sx + sw, sTop + 15, 1, wood); mid.line(sx + 1, sTop + 32, sx + sw, sTop + 18, 1, wood); });
        hang(mid, sx + sw + 3, sTop + 2, 3, { r: 32 }); hang(mid, sx + 5, sTop + 18, 3, { r: 28 });
        // cart with a lantern on a pole (right)
        const cx = Math.round(X(0.86)), cw2 = mat('#5A4030');
        mid.grp(() => { mid.rect(cx - 7, G - 8, 14, 5, cw2); mid.rect(cx - 8, G - 9, 16, 1, cw2); });
        const wheel = mat(th.iron); mid.oval(cx - 4, G - 2, 2, 2, wheel); mid.oval(cx + 4, G - 2, 2, 2, wheel);
        const rub = mat(desat(C(th.stone), 0.6)); mid.oval(cx - 2, G - 9, 4, 2, rub, 'top'); mid.oval(cx + 3, G - 9, 3, 2, rub, 'top');
        mid.rect(cx + 6, G - 20, 1, 11, ironL); lantern(mid, cx + 6, G - 26, { r: 30, gnd: 12 });
        // tripod work lamp between the party and the foe
        mid.grp(() => { mid.line(X(0.5), G - 22, X(0.5) - 4, G, 1, wood); mid.line(X(0.5), G - 22, X(0.5) + 4, G, 1, wood); mid.rect(X(0.5), G - 22, 1, 23, wood); });
        hang(mid, X(0.5) + 1, G - 22, 1, { r: 30, gnd: 12 });
        const seam = flat(ramp(C(th.path))[3], { nl: 0 });
        gnd.grp(() => gnd.rect(0, pathTop, LW, pathBot - pathTop, pathM));
        for (let x = r() * 6; x < LW; x += 8 + r() * 6) gnd.rect(x, pathTop + 1, 1, pathBot - pathTop - 1, seam);
        gnd.rect(0, pathBot, LW, 1, seam);
        const rubble = mat(desat(C(th.stone), 0.5));
        for (let i = 0; i < LW / 12; i++) gnd.oval(r() * LW, pathBot + 4 + r() * (Ha - pathBot - 5), 1 + r() * 2, 1, rubble);
        break;
      }
      // ================= Wraithmarsh: will-o-wisp lanterns on stilts, a boardwalk =================
      case 'marsh': {
        far.fillFrom(x => ridgeY(x, G - Ha * 0.1, 2), G, farBack);
        for (let x = r() * 8; x < LW; x += 5 + r() * 8) { const h = 6 + r() * 14, b = G - Ha * 0.08; far.rect(x, b - h, 1, h, farBack); if (r() < 0.5) far.line(x, b - h * 0.6, x + (r() - 0.5) * 8, b - h * 0.85, 1, farBack); }
        const wisp = C(th.wisp);
        for (const fx of [0.22, 0.44, 0.7, 1.02]) { const x = Math.round(X(fx)), y = Math.round(G - Ha * 0.08 - 12 - r() * 6); far.rect(x, y, 1, G - y, farDark); far.rect(x - 1, y - 2, 3, 2, tinted(wisp)); light(far, x, y - 1, 10, { rgb: wisp, a: 0.5, core: 0.4, pool: 0.2, kind: 'wisp' }); }
        { const x = Math.round(X(0.58)), b = Math.round(G - Ha * 0.1), hut = matS(hz('#3A3228', 0.25));
          far.rect(x - 5, b - 4, 1, 5, farDark); far.rect(x + 4, b - 4, 1, 5, farDark);
          far.rect(x - 6, b - 11, 12, 7, hut); far.poly([x - 8, b - 11, x, b - 16, x + 8, b - 11], farBack);
          windowLit(far, x - 3, b - 9, 2, 2, { r: 10, a: 0.55 }); windowLit(far, x + 2, b - 9, 2, 2, { r: 10, a: 0.4 }); }
        const reed = mat(desat(C(th.reed), 0.8)), head = flat(ramp(C('#5A4028'))[1], { nl: 0 }), stump = mat(desat(C(th.wood), 0.7)), pole = mat(th.wood);
        const clump = (x, n, hmax) => { for (let k = 0; k < n; k++) { const rx = x + k * 1.5 + r(), rh = hmax * (0.4 + r() * 0.6); mid.rect(rx, G - rh, 1, rh + 1, reed); if (r() < 0.35) mid.rect(rx, G - rh - 2, 1, 3, head); } };
        clump(X(-0.02), 8, 24); clump(X(0.93), 9, 26); clump(X(0.3), 3, 8); clump(X(0.64), 3, 7);
        deadTree(mid, X(0.1), G + 1, Ha * 0.14, 3, stump, r); deadTree(mid, X(0.83), G + 1, Ha * 0.1, 2, stump, r);
        const stilt = (x, h, o) => { x = Math.round(x); mid.grp(() => { mid.rect(x, G - h, 2, h + 1, pole); mid.rect(x - 3, G - h, 8, 1, pole); }); hang(mid, x - 2, G - h + 1, 2, o); if (!o.nohang2) hang(mid, x + 4, G - h + 1, 4, Object.assign({}, o, { r: (o.r || 30) * 0.8 })); };
        stilt(X(0.0), 36, { rgb: wisp, r: 30, kind: 'wisp', gnd: 12 });
        stilt(X(0.5), 32, { r: 34, gnd: 14, nohang2: 1 });              // one relit, warm: hope
        stilt(X(0.95), 40, { rgb: wisp, r: 30, kind: 'wisp', gnd: 12 });
        brokenPost(mid, Math.round(X(0.74)), G + 1, 22, -4);
        // boardwalk over black water
        const water = mat(th.water, 'top'); gnd.rect(0, gTop, LW, Ha - gTop, water);
        const plank = mat(desat(C(th.path), 0.7), 'top', { sep: 1 });
        for (let x = -3; x < LW; x += 9) gnd.rect(x, pathTop + ((x * 7) % 5 === 0 ? 1 : 0), 9, pathBot - pathTop - 2, plank);
        const postM = mat(th.wood); for (let x = 2; x < LW; x += 18) gnd.rect(x, pathBot - 2, 2, 5, postM);
        const glint = flat(blend(C(th.moon), C(th.water), 0.5));
        for (let i = 0; i < 14; i++) gnd.rect(r() * LW, pathBot + 3 + r() * (Ha - pathBot - 4), 2 + r() * 3, 1, glint);
        // reflections of the stilt lamps in the water
        for (const lp of lamps) if (lp.layer === 2) { const x = Math.round(lp.x / PX), c = tinted(blend(lp.rgb.split(',').map(Number), C(th.water), 0.5)); for (let y = pathBot + 3; y < Ha - 1; y += 2) gnd.rect(x - 1 + (y % 4 ? 1 : 0), y, 2, 1, c); }
        break;
      }
      // ================= Mine (gathering ore): timber frames, work lamps, an ore cart =================
      case 'mine': {
        for (let x = 0; x < LW; x++) far.rect(x, 0, 1, Math.round(ceilY(x)), farFront);
        far.fillFrom(x => ceilY(x), G, farBack);
        far.oval(X(0.62), G, 13, 17, farDark, 'top');
        light(far, X(0.62), G - 8, 14, { a: 0.35, core: 0, pool: 0.25 });
        far.rect(X(0.62) - 1, G - 10, 2, 2, glass);
        const strata = flat(hz(th.far, 0.0, 0.6), { nl: 1 }), strataD = flat(ramp(C(th.far))[2], { nl: 1 });
        for (let y = Math.round(Ha * 0.2); y < G - 4; y += 6 + Math.round(r() * 4)) for (let x = r() * 10; x < LW; x += 10 + r() * 16) { const w = 5 + r() * 12; far.rect(x, y, w, 1, strataD); far.rect(x + 1, y - 1, w - 2, 1, strata); }
        const oreCols = ['#D08A4E', '#A9B1BD', '#7FD6E0'].map(h => flat(blend(C(h), C(th.far), 0.4)));
        for (let i = 0; i < LW / 5; i++) { const x = r() * LW, y = Ha * 0.18 + r() * (G - Ha * 0.25); far.px(x, y, oreCols[i % 3]); if (r() < 0.4) far.px(x + 1, y + 1, oreCols[i % 3]); }
        const wood = mat(desat(C(th.wood), 0.85), 'vol', { wide: 1 }), beamY = Math.round(Ha * 0.14);
        for (const fx of [-0.02, 0.5, 0.98]) {
          const x = Math.round(X(fx));
          mid.grp(() => { mid.rect(x - 2, beamY, 4, G - beamY + 1, wood); });
        }
        mid.grp(() => { mid.rect(0, beamY - 2, LW, 4, wood); });
        for (const fx of [-0.02, 0.5, 0.98]) { const x = Math.round(X(fx)); mid.line(x - 9, beamY + 2, x - 2, beamY + 9, 2, wood); mid.line(x + 9, beamY + 2, x + 2, beamY + 9, 2, wood); }
        hang(mid, X(0.25), beamY + 2, 6, { r: 40 }); hang(mid, X(0.75), beamY + 2, 4, { r: 40 }); hang(mid, X(0.1), beamY + 2, 3, { r: 30 });
        lantern(mid, X(0.5) + 4, G - 30, { r: 30, gnd: 12 }); mid.rect(X(0.5) + 2, G - 31, 4, 1, ironL);
        // ore cart with a lamp (right edge)
        const cx = Math.round(X(0.93)), cart = mat('#4A4452', 'vol', { wide: 1 }), ore = mat('#A07050');
        mid.oval(cx, G - 9, 6, 3, ore, 'top'); mid.oval(cx + 3, G - 10, 3, 2, ore, 'top');
        mid.grp(() => { mid.poly([cx - 8, G - 9, cx + 8, G - 9, cx + 6, G - 3, cx - 6, G - 3], cart); });
        mid.oval(cx - 4, G - 2, 2, 2, iron); mid.oval(cx + 4, G - 2, 2, 2, iron);
        mid.rect(cx - 8, G - 17, 1, 8, ironL); lantern(mid, cx - 8, G - 23, { r: 26 });
        // rails
        const rail = flat(ramp(C('#6E6878'))[1], { nl: 0 }), sleeper = mat(desat(C(th.wood), 0.6));
        gnd.grp(() => gnd.rect(0, pathTop, LW, pathBot - pathTop, pathM));
        const ry = pathBot + 3; for (let x = 0; x < LW; x += 5) gnd.rect(x, ry - 1, 3, 4, sleeper);
        gnd.rect(0, ry, LW, 1, rail); gnd.rect(0, ry + 2, LW, 1, rail);
        break;
      }
      // ================= Woods (gathering wood): big trunks, lanterns nailed to them =================
      case 'woods': {
        for (let x = r() * 6; x < LW; x += 8 + r() * 10) far.rect(x, 0, 1 + r() * 3, G, r() < 0.5 ? farBack : farFront);
        far.fillFrom(x => ridgeY(x, G - Ha * 0.08, 2), G, farFront);
        for (const fx of [0.3, 0.55, 0.8]) farLamp(Math.round(X(fx)), Math.round(G - Ha * 0.08 - 5));
        const bark = mat(desat(C(th.bark), 0.85), 'vol', { wide: 1 }), groove = flat(ramp(C(th.bark))[3], { nl: 0 });
        const leaf = mat(desat(C(th.leaf), 0.85), 'vol', { sep: 1 }), leaf2 = mat(desat(C(th.leaf2), 0.85), 'vol', { sep: 1 });
        const trunk = (x, w) => { x = Math.round(x); mid.grp(() => { mid.rect(x, 0, w, G + 1, bark); mid.tri(x + w / 2, G - 6, 7, w * 0.8, bark); }); for (let k = 2; k < w - 2; k += 3) { let y = r() * 8; while (y < G - 6) { const l = 4 + r() * 12; mid.rect(x + k, y, 1, l, groove); y += l + 3 + r() * 6; } } };
        trunk(X(-0.03), 14); trunk(X(0.95), 15); trunk(X(0.42), 6);
        for (let x = -6; x < LW + 8; x += 7 + r() * 6) mid.oval(x, Ha * 0.02 + r() * Ha * 0.06, 7 + r() * 5, 5 + r() * 4, r() < 0.5 ? leaf : leaf2);
        // lanterns on brackets
        const bracket = (x, y, dir) => { mid.rect(dir > 0 ? x : x - 4, y, 5, 1, iron); lantern(mid, x + dir * 4, y + 1, { r: 32, gnd: 12 }); };
        bracket(X(-0.03) + 14, Math.round(G - 34), 1); bracket(X(0.95), Math.round(G - 38), -1); bracket(X(0.42) + 6, Math.round(G - 40), 1);
        // log pile and a work lamp at the right
        const log = mat('#6A4C34', 'vol', { sep: 1 }), ring = flat('#A08058', { nl: 0 });
        lampPost(mid, Math.round(X(0.9)) + 14, G + 1, 28, { r: 34, dir: -1 });
        for (const [dx, dy] of [[0, 0], [5, 0], [10, 0], [2.5, -4], [7.5, -4]]) { const x = X(0.86) + dx, y = G - 2 + dy; mid.oval(x, y, 2, 2, log); mid.px(x, y, ring); }
        gnd.grp(() => { for (let x = 0; x < LW; x++) for (let y = pathTop + ((x * 7 + 3) % 11 < 2 ? 1 : 0); y < pathBot; y++) gnd.span(x, x + 1, y, pathM, gnd.pc); });
        break;
      }
      // ================= World raid: great braziers along an obsidian causeway =================
      case 'raid': {
        far.fillFrom(x => ridgeY(x, G - Ha * 0.12, 3), G, farFront);
        const cone = (x, base, h, hw) => far.poly([x - hw, base, x - hw * 0.2, base - h, x + hw * 0.2, base - h, x + hw, base], farBack);
        cone(X(0.2), G - Ha * 0.1, Ha * 0.32, 26); cone(X(0.78), G - Ha * 0.1, Ha * 0.44, 32);
        const lava = flat('#FF7A3D'), lavaD = flat('#C23A20');
        for (const [fx, h] of [[0.2, Ha * 0.32], [0.78, Ha * 0.44]]) {
          const top = Math.round(G - Ha * 0.1 - h), x0 = Math.round(X(fx));
          far.rect(x0 - 3, top, 7, 1, lava);
          for (let k = 0; k < 2; k++) { let x = x0 + (k ? 2 : -2), y = top + 1; while (y < G - Ha * 0.1 - 2 && r() < 0.96) { far.px(x, y, y % 3 ? lava : lavaD); y++; x += r() < 0.3 ? (r() < 0.5 ? -1 : 1) : 0; } }
          light(far, x0, top, 30, { rgb: [255, 122, 61], a: 0.35, core: 0, pool: 0.2, kind: 'lava' });
        }
        for (const fx of [0.1, 0.36, 0.6, 0.88]) { const x = Math.round(X(fx)), b = Math.round(ridgeY(x, G - Ha * 0.12, 3)); far.rect(x - 1, b - 4, 3, 4, farDark); far.rect(x - 1, b - 6, 3, 2, flameO); far.px(x, b - 7, glass); light(far, x, b - 5, 12, { rgb: [255, 140, 60], a: 0.55, core: 0.4, pool: 0.25, flick: 2 }); }
        const obs = mat(desat(C(th.rock), 0.8), 'vol', { wide: 1 }), plinth = mat(desat(C(th.stone), 0.7), 'vol', { wide: 1 });
        for (const fx of [0.01, 0.09, 0.91, 0.99]) { const x = X(fx) + r() * 3, h = Ha * (0.3 + r() * 0.2); mid.tri(x, G - h, h + 1, 2 + h * 0.1, obs); }
        const great = (x, s) => { x = Math.round(x); mid.grp(() => { mid.rect(x - 7, G - 6, 15, 7, plinth); mid.rect(x - 8, G - 7, 17, 2, plinth); }); brazier(mid, x, G - 6, s, { r: 64 }); };
        great(X(0.01), 1.3); great(X(0.95), 1.4); brazier(mid, Math.round(X(0.5)), G + 1, 0.8, { r: 36 });
        gnd.grp(() => gnd.rect(0, pathTop, LW, pathBot - pathTop, pathM));
        const crack = flat('#FF7A3D'), crackD = flat('#8A2A18');
        for (let i = 0; i < 6; i++) {
          let x = X(r()), y = pathBot + 2 + r() * (Ha - pathBot - 4); const len = 6 + r() * 16;
          for (let k = 0; k < len; k++) { gnd.px(x, y, k % 5 ? crackD : crack); x += 1; y += r() < 0.3 ? (r() < 0.5 ? -1 : 1) : 0; }
          if (!band(x - len / 2)) light(gnd, x - len / 2, y, 16, { rgb: [255, 122, 61], a: 0.3, core: 0, pool: 0.25, kind: 'lava' });
        }
        break;
      }
    }

    // ---- ground detail common to all: lip tufts, specks ----
    const grassy = theme === 'forest' || theme === 'woods' || theme === 'barrow' || theme === 'bone' || theme === 'fungal';
    for (let x = 0; x < LW; x++) {
      if (grassy && r() < 0.45) { const h = r() < 0.3 ? 2 : 1; gnd.rect(x, gTop - h, 1, h, r() < 0.55 ? lipM : lipD); }
      else if (!grassy && theme !== 'marsh' && r() < 0.12) gnd.px(x, gTop - 1, lipD);
    }
    const speck = flat(ramp(C(th.gnd))[0]), speckD = flat(ramp(C(th.gnd))[3]);
    for (let i = 0; i < LW / 6; i++) { const y = pathBot + 2 + r() * (Ha - pathBot - 2); gnd.px(r() * LW, y, r() < 0.5 ? speck : speckD); }

    // ---- foreground (f 1.35): corners and the bottom strip only ----
    const fgC = blend(C(th.gnd), [6, 4, 10], 0.5), fgId = mat(fgC, 'vol', { sep: 1 }), fgT = flat(ramp(fgC)[3]);
    const tuft = (x, n, hmax) => { for (let k = 0; k < n; k++) { const bx = x + k + r(), h = 2 + r() * hmax; fg.line(bx, Ha, bx + (r() - 0.5) * 2, Ha - h, 1, fgT); } };
    switch (theme) {
      case 'cave': case 'mine':
        fg.tri(X(-0.02) + 5, 0, Ha * 0.18, 6, fgId, true); fg.tri(X(1.0), 0, Ha * 0.14, 5, fgId, true);
        fg.oval(X(-0.02) + 4, Ha + 1, 11, 6, fgId, 'top'); fg.oval(X(0.99), Ha + 1, 9, 5, fgId, 'top');
        break;
      case 'forest': case 'woods': {
        fg.oval(X(-0.02), Ha + 1, 12, 8, fgId, 'top'); fg.oval(X(0.04), Ha + 2, 7, 5, fgId, 'top'); tuft(X(0.9), 5, 6); tuft(X(0.5), 2, 3);
        if (theme === 'forest') { // fence post with a lantern, bottom right
          const fx = Math.round(X(0.985)), post = mat(blend(C('#5A4030'), [6, 4, 10], 0.4));
          fg.grp(() => { fg.rect(fx, Ha - 16, 3, 16, post); fg.rect(fx - 12, Ha - 11, 12, 2, post); fg.rect(fx - 12, Ha - 6, 12, 2, post); });
          fg.rect(fx - 2, Ha - 16, 3, 1, iron); lantern(fg, fx - 2, Ha - 14, { r: 26, pool: 0.3 });
        }
        break;
      }
      case 'marsh': tuft(X(-0.02), 7, 14); tuft(X(0.94), 6, 12); break;
      case 'bone': case 'barrow': tuft(X(-0.01), 5, 7); tuft(X(0.95), 5, 6);
        if (theme === 'bone') { const x = Math.round(X(0.965)), b = flat(blend(C(th.bone), fgC, 0.5), { nl: 0 }); fg.rect(x, Ha - 4, 4, 3, b); fg.rect(x + 1, Ha - 1, 2, 1, b); fg.px(x + 1, Ha - 3, fgT); fg.px(x + 2, Ha - 3, fgT); }
        break;
      case 'quarry': case 'raid': fg.oval(X(-0.02) + 3, Ha + 1, 9, 5, fgId, 'top'); fg.oval(X(-0.02) + 13, Ha + 1, 4, 3, fgId, 'top'); fg.oval(X(0.98), Ha + 1, 8, 4, fgId, 'top'); break;
      default: tuft(X(0), 4, 5); tuft(X(0.95), 4, 5);
    }

    // ---- shade and bake ----
    const ink = (hex, t) => blend(ramp(C(hex))[3], [8, 5, 12], t);
    const bake = (L, base, ol, nol) => { const c = mkCanvas(LW, Ha), g = c.getContext('2d'), img = base || new ImageData(LW, Ha); shade(L, mats, img, ol, nol); g.putImageData(img, 0, 0); return c; };
    const midInk = ink(th.mid || th.far, 0.55);
    const layers = [
      { c: bake(sky, skyImg, null, 1), f: PAR[0] },
      { c: bake(far, null, null, 1), f: PAR[1] },
      { c: bake(mid, null, midInk), f: PAR[2] },
      { c: bake(gnd), f: PAR[3] },
      { c: bake(fg, null, [10, 6, 14]), f: PAR[4], fg: true }
    ];

    // ---- atmosphere data ----
    const [type, ambHex, n] = th.amb;
    const ambRgb = C(ambHex).join(',');
    const pr = rand(W * 3 + H + theme.length);
    const parts = [];
    for (let i = 0; i < n; i++) parts.push({ x: pr() * (W + 40) - 20, y: pr(), sp: 0.6 + pr() * 0.8, ph: pr() * 6.283, sz: 0.6 + pr() * 0.8, d: drips.length ? drips[i % drips.length] : null, per: 1.6 + pr() * 2.4 });
    const moths = motes.map(lp => ({ lp, ph: pr() * 6.283, rx: 6 + pr() * 8, ry: 4 + pr() * 5, sp: 0.6 + pr() * 0.6 }));
    const fog = { rgb: C(th.fog[0]).join(','), a: th.fog[1], y: GY - 6 };
    // overlay: vignette plus a theme tint, pre-rendered small and stretched when drawn
    const ov = mkCanvas(Math.ceil(W / 2), Math.ceil(H / 2)), og = ov.getContext('2d'), ow = ov.width, oh = ov.height;
    const vg = og.createRadialGradient(ow * 0.5, oh * 0.56, oh * 0.4, ow * 0.5, oh * 0.56, ow * 0.8);
    vg.addColorStop(0, 'rgba(6,4,12,0)'); vg.addColorStop(1, 'rgba(6,4,12,.5)');
    og.fillStyle = vg; og.fillRect(0, 0, ow, oh);
    const tint = { raid: ['255,90,40', 0.14, 1], bone: ['160,30,40', 0.08, 0], cave: ['10,8,20', 0.22, 0], mine: ['10,8,14', 0.18, 0], fungal: ['200,90,200', 0.05, 1], marsh: ['150,210,200', 0.05, 1] }[theme];
    if (tint) { const lg = og.createLinearGradient(0, 0, 0, oh); const [c, a, bottom] = tint; lg.addColorStop(bottom ? 0.4 : 0, `rgba(${c},${bottom ? 0 : a})`); lg.addColorStop(bottom ? 1 : 0.45, `rgba(${c},${bottom ? a : 0})`); og.fillStyle = lg; og.fillRect(0, 0, ow, oh); }

    // public light list: stage CSS px at camX = 0
    for (const lp of lamps) lp.x -= M;
    return {
      theme, hue, W, H, GY, M, PX, layers, lights: lamps,
      fog, amb: { type, rgb: ambRgb, parts, moths },
      light: { moon, lamps, shafts: !!th.shafts, overlay: ov }
    };
  }

  // ---------- cached glow sprites (shared) ----------
  const glowCache = new Map();
  // kind 0: fog (soft), 1: lamp pool (D: .55 centre, .2 at a third), 2: hot core
  function glow(rgb, kind) {
    const k = rgb + '|' + kind;
    let c = glowCache.get(k);
    if (!c) {
      c = mkCanvas(64, 64); const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      if (kind === 0) { gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(1, `rgba(${rgb},0)`); }
      else if (kind === 1) { gr.addColorStop(0, `rgba(${rgb},.55)`); gr.addColorStop(0.35, `rgba(${rgb},.2)`); gr.addColorStop(1, `rgba(${rgb},0)`); }
      else { gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.3, `rgba(${rgb},.35)`); gr.addColorStop(1, `rgba(${rgb},0)`); }
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowCache.set(k, c);
    }
    return c;
  }
  let shaftSprite = null;
  function shaft() {
    if (!shaftSprite) {
      shaftSprite = mkCanvas(64, 128); const g = shaftSprite.getContext('2d');
      const lg = g.createLinearGradient(0, 0, 0, 128); lg.addColorStop(0, 'rgba(255,243,196,.9)'); lg.addColorStop(1, 'rgba(255,243,196,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(20, 0); g.lineTo(34, 0); g.lineTo(64, 128); g.lineTo(30, 128); g.closePath(); g.fill();
    }
    return shaftSprite;
  }

  sceneFor = function (theme, W, H, hue) {
    W = Math.max(1, Math.round(W)); H = Math.max(1, Math.round(H)); hue = ((Math.round(hue || 0) % 360) + 360) % 360;
    const key = theme + '|' + W + 'x' + H + '|' + hue;
    let sc = cache.get(key);
    if (!sc) {
      sc = build(theme, W, H, hue);
      cache.set(key, sc);
      if (cache.size > 8) cache.delete(cache.keys().next().value);
    } else { cache.delete(key); cache.set(key, sc); }
    return sc;
  };

  drawScene = function (ctx, scene, camX, which) {
    camX = camX || 0; which = which || 'back';
    const px = scene.PX || 1;
    for (const ly of scene.layers) {
      if (which === 'back' && ly.fg) continue;
      if (which === 'fg' && !ly.fg) continue;
      ctx.drawImage(ly.c, Math.round(-scene.M - camX * ly.f), 0, ly.c.width * px, ly.c.height * px);
    }
  };

  // lamp flicker: gentle for lanterns (1), livelier for fire (2), none for crystals and runes (0)
  const flickAt = (lp, T) => REDUCED || !lp.flick ? 1 : lp.flick === 2
    ? 0.86 + 0.08 * Math.sin(T * 11 + lp.ph) + 0.06 * Math.sin(T * 17.3 + lp.ph * 2)
    : 0.92 + 0.05 * Math.sin(T * 5.1 + lp.ph) + 0.03 * Math.sin(T * 12.7 + lp.ph * 3);

  drawAtmosphere = function (ctx, scene, T, W, H, camX) {
    camX = camX || 0; W = W || scene.W; H = H || scene.H;
    const t = REDUCED ? 0 : T, GY = scene.GY * H / scene.H;
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = 'source-over';
    // fog bands: wide soft blobs drifting along the ground, one higher and fainter
    const fg = glow(scene.fog.rgb, 0), fa = scene.fog.a;
    for (let i = 0; i < 4; i++) {
      const bw = W * (0.7 + 0.15 * i), bh = 18 + i * 6;
      const x = ((t * (4 + i * 2.5) + i * W * 0.45) % (W + bw)) - bw - camX * 0.8;
      const y = (i === 3 ? GY - 50 : GY - 8 + i * 6) - bh / 2;
      ctx.globalAlpha = fa * (i === 3 ? 0.6 : 1);
      ctx.drawImage(fg, x, y, bw, bh); ctx.drawImage(fg, x + W + bw, y, bw, bh);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    const L = scene.light;
    if (L.moon) { const m = L.moon, rr = m.r * 4.5; ctx.globalAlpha = 0.2; ctx.drawImage(glow(m.rgb, 0), m.x - scene.M - camX * 0.05 - rr, m.y - rr, rr * 2, rr * 2); }
    if (L.shafts) {
      const sp = shaft();
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.06 + 0.03 * Math.sin(t * 0.4 + i * 1.7); ctx.drawImage(sp, W * (0.08 + i * 0.26) - camX * 0.3, -4, W * 0.18, GY + 8); }
    }
    // lantern light: a soft pool plus a small hot core, both cached sprites
    for (const lp of L.lamps) {
      const fl = flickAt(lp, T), x = lp.x - camX * lp.f, rr = lp.r * fl;
      if (x + rr < 0 || x - rr > W) continue;
      ctx.globalAlpha = Math.min(1, lp.a * fl * 1.3); ctx.drawImage(glow(lp.rgb, 1), x - rr, lp.y - rr, rr * 2, rr * 2);
      if (lp.core) { const cr = 5 + lp.r * 0.12; ctx.globalAlpha = 0.45 * lp.core * fl; ctx.drawImage(glow(lp.rgb, 2), x - cr, lp.y - cr, cr * 2, cr * 2); }
    }
    // ambient particles: stateless, positions are a function of time
    const A = scene.amb, spr = glow(A.rgb, 2), W2 = W + 40;
    const wrap = (v, m) => ((v % m) + m) % m;
    for (const p of A.parts) {
      let x, y, a = 1, sz = 2 * p.sz, g = 6;
      switch (A.type) {
        case 'firefly': x = p.x + Math.sin(t * 0.3 * p.sp + p.ph) * 22; y = GY - 20 - p.y * (GY * 0.5) + Math.sin(t * 0.5 + p.ph * 2) * 8; a = REDUCED ? 0.7 : 0.5 + 0.5 * Math.sin(t * 2.2 * p.sp + p.ph); g = 9; sz = 2; break;
        case 'drip': {
          if (!p.d) continue;
          const c = wrap(t + p.ph, p.per), sx = p.d.x - scene.M - camX * p.d.f;
          x = sx; if (c < 0.8) { y = p.d.y + 1; a = c / 0.8; sz = 1.5; } else { y = p.d.y + 0.5 * 300 * (c - 0.8) ** 2; if (y > GY) { const q = Math.min(1, (y - GY) / 30); y = GY; a = 1 - q; sz = 1.5 + q * 2; } }
          g = 5; break;
        }
        case 'ash': x = wrap(p.x + t * 5 * p.sp, W2) - 20; y = wrap(p.y * H + t * 4 * p.sp, H); x += Math.sin(t + p.ph) * 3; a = 0.6; g = 0; sz = 2; break;
        case 'mote': x = p.x + Math.sin(t * 0.4 + p.ph) * 10; y = GY + 4 - wrap(p.y * GY + t * 3 * p.sp, GY * 0.8); a = Math.min(1, (GY + 4 - y) / 20) * (0.6 + 0.4 * Math.sin(t * 1.5 + p.ph)); g = 7; sz = 2; break;
        case 'spore': x = p.x + Math.sin(t * 0.8 * p.sp + p.ph) * 8; y = GY - wrap(p.y * GY + t * 5 * p.sp, GY); a = Math.min(1, (GY - y) / 20) * 0.8; g = 6; sz = 2; break;
        case 'dust': x = wrap(p.x + t * 6 * p.sp, W2) - 20; y = GY * (0.35 + 0.6 * p.y) + Math.sin(t * 0.7 + p.ph) * 4; a = 0.4; g = 0; sz = 2; break;
        case 'wisp': x = wrap(p.x + t * 3 * p.sp + Math.sin(t * 0.3 + p.ph) * 20, W2) - 20; y = GY - 10 - p.y * 50 + Math.sin(t * 0.9 + p.ph) * 6; a = 0.5 + 0.5 * Math.sin(t * 0.8 + p.ph); g = 14; sz = 2; break;
        case 'ember': x = p.x + Math.sin(t * 1.4 * p.sp + p.ph) * 6; y = GY + 6 - wrap(p.y * H + t * 22 * p.sp, H); a = Math.min(1, (GY + 6 - y) / 30, y / 40) * (0.7 + 0.3 * Math.sin(t * 9 + p.ph)); g = 6; sz = 2; break;
        case 'leaf': x = wrap(p.x + t * 5 * p.sp + Math.sin(t * 1.3 + p.ph) * 10, W2) - 20; y = wrap(p.y * H + t * 10 * p.sp, GY + 10); a = 0.85; g = 0; sz = 2; break;
        default: continue;
      }
      if (A.type !== 'drip') x -= camX * 0.9;
      if (a <= 0.02) continue;
      if (g) { ctx.globalAlpha = a * 0.35; ctx.drawImage(spr, x - g, y - g, g * 2, g * 2); }
      ctx.globalAlpha = a;
      ctx.globalCompositeOperation = g ? 'lighter' : 'source-over';
      ctx.fillStyle = `rgb(${A.rgb})`;
      if (A.type === 'leaf') ctx.fillRect(Math.round(x), Math.round(y), Math.sin(t * 3 + p.ph) > 0 ? 4 : 2, 2);
      else if (A.type === 'drip' && y < GY) ctx.fillRect(x - sz / 2, y, sz, sz * 2);
      else ctx.fillRect(Math.round(x - sz / 2), Math.round(y - sz / 2), sz, sz);
      ctx.globalCompositeOperation = 'lighter';
    }
    // moths and fireflies drawn to the lanterns
    if (A.moths) {
      const ms = glow('255,220,150', 2);
      ctx.fillStyle = '#FFE9B0';
      for (const m of A.moths) {
        const lp = m.lp, a = REDUCED ? 0.6 : 0.45 + 0.4 * Math.sin(t * 3.1 * m.sp + m.ph);
        const x = lp.x - camX * lp.f + Math.sin(t * 1.3 * m.sp + m.ph) * m.rx, y = lp.y + 4 + Math.cos(t * 1.7 * m.sp + m.ph) * m.ry;
        ctx.globalAlpha = a * 0.4; ctx.drawImage(ms, x - 5, y - 5, 10, 10);
        ctx.globalAlpha = a; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(L.overlay, 0, 0, W, H);
    ctx.imageSmoothingEnabled = smooth;
  };
}
