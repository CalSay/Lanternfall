// 63-scenery: Hi-bit parallax backgrounds (1 art px per CSS px) plus smooth device-resolution
// atmosphere (fog, ambient particles, lamp glows, moon halo, vignette). Browser-only.
//
//   sceneFor(theme, W, H, hue) -> scene     theme: forest|cave|bone|barrow|fungal|quarry|marsh|mine|woods|raid
//     scene = { layers: [{ c, f, fg }], fog, amb, light, W, H, GY, M, theme, hue }
//     Layers are W + 2*M wide (M = 24 px parallax margin), H tall, cached per (theme, W, H, hue).
//     GY is the ground line (feet). The band from GY-72 to GY, between 12% and 90% of W, is kept clear.
//   drawScene(ctx, scene, camX, which = 'back')   which: 'back' (sky..ground) | 'fg' (foreground) | 'all'
//     ctx must be in CSS px units (e.g. setTransform(DPR,...)) with imageSmoothingEnabled = false.
//     camX in CSS px, keep within +-16.
//   drawAtmosphere(ctx, scene, T, W, H, camX = 0)   T in seconds; draws on top of everything.
//
// Per frame this is: 4-5 drawImage calls for the layers, plus pre-rendered glow sprites for
// fog, particles and lamps, plus one stretched overlay for the vignette. No gradients are made
// per frame and nothing allocates.
let drawScene, drawAtmosphere;
function sceneFor() { return null; } // replaced below
{
  const M = 24;
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
  const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;
  // 4-tone background ramp [highlight, base, shadow, deep], hue-shifted like the character ramps
  // (toward gold when lit, toward plum in shadow), with deltas scaled for dark scenery.
  function ramp(rgb) {
    const [h, s, l] = toHsl(rgb);
    return [
      toRgb(toward(h, 45, 10), s * 0.95, Math.min(0.92, l + Math.max(0.05, Math.min(0.16, l * 0.75)))),
      rgb,
      toRgb(toward(h, 265, 12), s, l * 0.7),
      toRgb(toward(h, 265, 22), s, l * 0.48)
    ];
  }

  // ---------- material buffers ----------
  // Each layer is painted as a buffer of material ids, then shaded in one pass:
  //  full: lit rim top-left, base, shadow on the right with a checker dither, deep edge
  //  top:  lit top edge, then darker with depth (ground, ridges)
  //  flat: one colour (stars, emissives, specks)
  function Layer(w, h) { this.w = w; this.h = h; this.m = new Uint8Array(w * h); }
  Layer.prototype.px = function (x, y, id) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.m[y * this.w + x] = id; };
  Layer.prototype.rect = function (x, y, w, h, id) {
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y)), x1 = Math.min(this.w, Math.round(x + w)), y1 = Math.min(this.h, Math.round(y + h));
    for (let yy = y0; yy < y1; yy++) this.m.fill(id, yy * this.w + x0, yy * this.w + Math.max(x0, x1));
  };
  // filled ellipse; half: 'top' keeps the upper half only
  Layer.prototype.oval = function (cx, cy, rx, ry, id, half) {
    for (let dy = -Math.ceil(ry); dy <= (half === 'top' ? 0 : Math.ceil(ry)); dy++) {
      const k = 1 - (dy / (ry + 0.5)) ** 2; if (k <= 0) continue;
      const w = Math.round(rx * Math.sqrt(k)); this.rect(cx - w, cy + dy, 2 * w + 1, 1, id);
    }
  };
  // triangle pointing up (or down when down = true), apex at (cx, top)
  Layer.prototype.tri = function (cx, top, h, hw, id, down) {
    for (let i = 0; i < h; i++) { const w = Math.round(hw * (down ? 1 - i / h : (i + 1) / h)); this.rect(cx - w, top + i, 2 * w + 1, 1, id); }
  };
  Layer.prototype.line = function (x0, y0, x1, y1, wd, id) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) { const t = i / n, w = Math.max(1, Math.round(wd)); this.rect(x0 + (x1 - x0) * t - w / 2, y0 + (y1 - y0) * t - w / 2, w, w, id); }
  };
  // column fill from y(x) to bottom (ridges, ground)
  Layer.prototype.fillFrom = function (yf, bottom, id) { for (let x = 0; x < this.w; x++) { const y = Math.round(yf(x)); this.rect(x, y, 1, bottom - y, id); } };

  function shade(L, mats, img) {
    const { w, h, m } = L, d = img.data;
    const same = (x, y, id) => x >= 0 && x < w && y >= 0 && y < h && m[y * w + x] === id;
    for (let x = 0; x < w; x++) {
      let run = 0, runId = 0;
      for (let y = 0; y < h; y++) {
        const i = y * w + x, id = m[i];
        if (!id) continue;
        // a run restarts below empty space or another shaded material; flat specks don't break it
        const up = y ? m[i - w] : 0, mt = mats[id]; let t = 1;
        if (mt.mode !== 'flat' && (!up || (up !== id && (mats[up].mode !== 'flat' || runId !== id)))) { run = y; runId = id; }
        if (mt.mode === 'top') {
          const dt = y - run, k = mt.k;
          t = dt === 0 ? 0 : dt < k ? 1 : dt < k + 3 ? (((x + y) & 1) ? 2 : 1) : dt < 2.4 * k ? 2 : dt < 2.4 * k + 3 ? (((x + y) & 1) ? 3 : 2) : 3;
        } else if (mt.mode === 'full') {
          if (y === run || !same(x - 1, y, id)) t = 0;
          else if (!same(x + 1, y, id)) t = 3;
          else if (!same(x + 2, y, id)) t = 2;
          else if (!same(x + 3, y, id) && ((x + y) & 1)) t = 2;
          else if (!same(x, y + 1, id) && mt.under) t = 2;
        }
        const c = mt.r[t], o = i * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
  }

  // ---------- themes ----------
  // Colours keep today's identity (THEMES in 20-data.js); extras add Hi-bit detail.
  const TH = {
    forest: { sky: ['#101C18', '#35533F'], far: '#223A2E', mid: '#1F3A2A', ground: '#101A14', top: '#3E6B3A', stars: 1,
      amb: ['firefly', '#D8F07A', 16], fog: ['#8FC7A0', 0.08] },
    cave: { sky: ['#0A0910', '#211C34'], far: '#171327', mid: '#1C1830', ground: '#0D0A15', top: '#3A3052',
      amb: ['drip', '#7FB2FF', 7], fog: ['#6E7FC0', 0.05], glow: '#7FB2FF' },
    bone: { sky: ['#12090C', '#4A2226'], far: '#2A1619', mid: '#2A181B', ground: '#150B0D', top: '#5A3A2E', moon: '#E0524F', bone: '#B8AE9C',
      amb: ['ash', '#9A8F8F', 26], fog: ['#8A4048', 0.07] },
    barrow: { sky: ['#0A151C', '#224452'], far: '#16303C', mid: '#1A3542', ground: '#0B181E', top: '#2F5A55', stars: 1, stone: '#3E5A64', glow: '#9BE3F0',
      amb: ['mote', '#9BE3F0', 18], fog: ['#9BE3F0', 0.16] },
    fungal: { sky: ['#140B1C', '#4A2A54'], far: '#2A1834', mid: '#2C1A38', ground: '#140A1A', top: '#6A3A6E', cap: '#6A3A7E', glow: '#FF9ED8',
      amb: ['spore', '#FF9ED8', 24], fog: ['#B070C0', 0.07] },
    quarry: { sky: ['#15130F', '#4B4337'], far: '#322D27', mid: '#4A4236', ground: '#191612', top: '#6E6250', moon: '#EFE6D6',
      amb: ['dust', '#CDBFA0', 22], fog: ['#CDBFA0', 0.05] },
    marsh: { sky: ['#08110F', '#274240'], far: '#182C29', mid: '#1C3330', ground: '#0C1615', top: '#35524C', moon: '#CFE8E0', water: '#1E3A3A',
      amb: ['wisp', '#9FD8C9', 10], fog: ['#9FD8C9', 0.2] },
    mine: { sky: ['#0A090D', '#1E1A26'], far: '#17141D', mid: '#4A3524', ground: '#120F17', top: '#3A3442', glow: '#FFB347',
      amb: ['dust', '#A9B1BD', 16], fog: ['#8A7A6A', 0.05] },
    woods: { sky: ['#13241B', '#46714F'], far: '#274532', mid: '#2A3A26', ground: '#122016', top: '#4E7F42', leaf: '#2E5A34',
      amb: ['leaf', '#5FAE4E', 12], fog: ['#CFE8B0', 0.06], shafts: 1 },
    raid: { sky: ['#0E0407', '#5A1A20'], far: '#2A0C12', mid: '#24101A', ground: '#10060A', top: '#5A1E22', moon: '#FF9E3D', glow: '#FF7A3D', stars: 1,
      amb: ['ember', '#FF9E3D', 30], fog: ['#FF6A3D', 0.07] }
  };

  const cache = new Map();

  function build(theme, W, H, hue) {
    const th = TH[theme] || TH.forest;
    const LW = W + 2 * M, GY = Math.round(H * 0.8);
    const r = rand(theme.length * 7919 + W * 13 + H * 31 + 7);
    const C = hex => rot(hx(hex), hue);
    const mats = [null];
    const mat = (rgb, mode, k) => { mats.push({ r: ramp(rgb), mode: mode || 'full', k: k || 4 }); return mats.length - 1; };
    const flat = rgb => { mats.push({ r: [rgb, rgb, rgb, rgb], mode: 'flat' }); return mats.length - 1; };
    const skyTop = C(th.sky[0]), skyBot = C(th.sky[1]);
    const haze = (hex, t) => blend(C(hex), skyBot, t);        // atmospheric perspective
    const X = fx => M + fx * W;                               // screen fraction -> layer x
    const band = x => x > X(0.12) && x < X(0.9);              // the characters' band
    const lights = [], drips = [];
    const lamp = (x, y, hex, rad, a, f, pulse) => lights.push({ x, y, rgb: C(hex).join(','), r: rad, a, f, pulse: pulse || 0, ph: r() * 6 });

    const sky = new Layer(LW, H), far = new Layer(LW, H), mid = new Layer(LW, H), gnd = new Layer(LW, H), fg = new Layer(LW, H);

    // ---- sky: 6-step ramp with 4x4 ordered dithering ----
    const steps = [0, 1, 2, 3, 4, 5].map(i => blend(skyTop, skyBot, i / 5));
    const skyImg = new ImageData(LW, H), sd = skyImg.data;
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 0; y < H; y++) {
      const fr = Math.min(1, y / GY) * 5, i0 = Math.floor(fr), fx = fr - i0;
      for (let x = 0; x < LW; x++) {
        const c = steps[Math.min(5, fx > (bayer[(y & 3) * 4 + (x & 3)] + 0.5) / 16 ? i0 + 1 : i0)], o = (y * LW + x) * 4;
        sd[o] = c[0]; sd[o + 1] = c[1]; sd[o + 2] = c[2]; sd[o + 3] = 255;
      }
    }
    if (th.stars) {
      const s1 = flat(blend(C('#FFF4DC'), skyTop, 0.1)), s2 = flat(blend(C('#8FA8B0'), skyTop, 0.35));
      for (let i = 0; i < LW / 7; i++) sky.px(r() * LW, r() * GY * 0.5, r() < 0.3 ? s1 : s2);
    }
    let moon = null;
    if (th.moon) {
      const big = theme === 'bone' || theme === 'raid';
      const mx = X(theme === 'raid' ? 0.5 : big ? 0.74 : 0.8), my = Math.round(H * (big ? 0.2 : 0.16)), mr = big ? 15 : 10;
      const mc = C(th.moon), id = mat(mc);
      mats[id].r[0] = blend(mc, [255, 250, 235], 0.35);
      sky.oval(mx, my, mr, mr, id);
      const cr = flat(blend(mc, ramp(mc)[2], 0.45));
      for (const [cx, cy, cr2] of [[-0.25, 0.1, 2.2], [0.35, 0.35, 1.4], [0.2, -0.4, 1]]) sky.oval(mx + cx * mr, my + cy * mr, cr2 * mr / 10, cr2 * mr / 12, cr);
      moon = { x: mx, y: my, r: mr, rgb: mc.join(',') };
    }

    // ---- far ridge (f 0.2) ----
    const farC = haze(th.far, 0.25), farC2 = haze(th.far, 0.05);
    const s = [r() * 10, r() * 10, r() * 10];
    const ridgeY = (x, base, amp) => base + Math.sin(x * 0.021 + s[0]) * amp + Math.sin(x * 0.057 + s[1]) * amp * 0.45 + Math.sin(x * 0.009 + s[2]) * amp * 1.2;
    const ceilY = x => H * 0.1 + Math.sin(x * 0.05 + s[1]) * H * 0.04 + Math.sin(x * 0.13 + s[0]) * H * 0.02;
    const back = mat(farC, 'top', 6), front = mat(farC2, 'top', 5);

    // ---- per-theme features ----
    const pine = (L, x, base, h, id, trunk) => {
      L.rect(x - 1, base - h * 0.14, 3, h * 0.14 + 1, trunk);
      const tiers = 4;
      for (let t = 0; t < tiers; t++) { const top = base - h + t * h * 0.2, th2 = h * 0.34, hw = h * (0.12 + t * 0.07); L.tri(x, top, th2, hw, id); }
    };
    const deadTree = (L, x, base, len, wd, id, rr) => {
      const br = (x0, y0, a, l, w, d) => {
        if (d > 4 || w < 0.8) return;
        const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; L.line(x0, y0, x1, y1, w, id);
        br(x1, y1, a - 0.45 - rr() * 0.35, l * 0.68, w * 0.62, d + 1); if (rr() < 0.85) br(x1, y1, a + 0.4 + rr() * 0.35, l * 0.6, w * 0.6, d + 1);
      };
      br(x, base, -Math.PI / 2 - 0.08 + rr() * 0.16, len, wd, 0);
    };
    const gT = th.top, gG = th.ground;

    switch (theme) {
      case 'forest': {
        far.fillFrom(x => ridgeY(x, GY - H * 0.34, 8), GY + 2, back);
        for (let x = r() * 6; x < LW; x += 5 + r() * 6) { const b = ridgeY(x, GY - H * 0.2, 5), h = 12 + r() * 18; far.tri(x, b - h, h, h * 0.28, front); far.rect(x - 2, b - 1, 5, GY - b + 3, front); }
        const pId = mat(C(th.mid)), tr = mat(C('#2A2018'));
        const xs = [0.02, 0.1, 0.3, 0.52, 0.7, 0.86, 0.97];
        for (const fx of xs) { const x = X(fx) + (r() - 0.5) * 16, h = band(x) ? H * (0.42 + r() * 0.12) : H * (0.62 + r() * 0.12); pine(mid, x, GY + 1, h, pId, tr); }
        break;
      }
      case 'cave': {
        for (let x = 0; x < LW; x++) { const cy = Math.round(ceilY(x)); far.rect(x, 0, 1, cy, back); }
        far.fillFrom(x => ridgeY(x, GY - H * 0.22, 6), GY + 2, front);
        for (let x = r() * 20; x < LW; x += 14 + r() * 22) { const b = ridgeY(x, GY - H * 0.22, 6), h = 8 + r() * 16; far.tri(x, b - h, h, 3 + r() * 3, front); }
        const rk = mat(C(th.mid)), cry = flat(C(th.glow)), cryD = flat(ramp(C(th.glow))[2]);
        for (let x = r() * 10; x < LW; x += 10 + r() * 16) {
          const len = band(x) ? H * (0.1 + r() * 0.2) : H * (0.18 + r() * 0.3), hw = 3 + r() * 5;
          mid.tri(x, 0, len, hw, rk, true);
          if (r() < 0.55) drips.push({ x, y: len - 1, f: 0.5 });
        }
        mid.rect(0, 0, LW, 4, rk);
        for (let i = 0; i < 6; i++) { const x = X([0.02, 0.07, 0.92, 0.97, 0.45, 0.6][i]) + r() * 6, h = i < 4 ? 14 + r() * 16 : 6 + r() * 5; mid.tri(x, GY - h, h + 1, 3 + h * 0.18, rk); }
        const crystal = (L, x, base, n) => { for (let k = 0; k < n; k++) { const cx = x + k * 3 - n, ch = 4 + r() * 7; L.tri(cx, base - ch, ch, 1.2, k % 2 ? cry : cryD); } if (L === mid || L === fg) lamp(x, base - 5, th.glow, 26, 0.35, L === fg ? 1.35 : 0.5, 1); };
        crystal(mid, X(0.05), GY, 3); crystal(mid, X(0.95), GY, 4);
        break;
      }
      case 'bone': {
        far.fillFrom(x => ridgeY(x, GY - H * 0.2, 7), GY + 2, back);
        for (let x = r() * 30; x < LW; x += 24 + r() * 30) { const b = ridgeY(x, GY - H * 0.2, 7); far.rect(x, b - 7, 1, 7, back); far.rect(x - 2, b - 5, 5, 1, back); }
        far.fillFrom(x => ridgeY(x + 400, GY - H * 0.1, 4), GY + 2, front);
        const wood = mat(C(th.mid)), stone = mat(C('#4A3A3C')), boneC = flat(blend(C(th.bone), C(gG), 0.45)), crossDark = flat(ramp(C('#4A3A3C'))[3]);
        deadTree(mid, X(0.06), GY + 1, H * 0.2, 6, wood, r);
        deadTree(mid, X(0.93), GY + 1, H * 0.22, 7, wood, r);
        deadTree(mid, X(0.46), GY + 1, H * 0.1, 3, wood, r);
        for (const fx of [0.18, 0.31, 0.6, 0.74, 0.84]) {
          const x = X(fx) + (r() - 0.5) * 10, h = 10 + r() * 7, w = 7 + r() * 3;
          mid.rect(x, GY - h + 3, w, h, stone); mid.oval(x + w / 2 - 0.5, GY - h + 3, w / 2, 3, stone, 'top');
          if (r() < 0.5) { mid.rect(x + w / 2 - 1, GY - h + 3, 1, 5, crossDark); mid.rect(x + w / 2 - 2, GY - h + 4, 3, 1, crossDark); }
        }
        for (let i = 0; i < 18; i++) { const x = X(r()), y = GY + 3 + r() * (H - GY - 6); gnd.rect(x, y, 2 + r() * 3, 1, boneC); }
        break;
      }
      case 'barrow': {
        far.fillFrom(x => ridgeY(x, GY - H * 0.3, 8), GY + 2, back);
        far.fillFrom(x => ridgeY(x + 300, GY - H * 0.16, 6), GY + 2, front);
        const mound = mat(C(th.mid)), stone = mat(C(th.stone)), dark = flat(ramp(C(th.mid))[3]), rune = flat(C(th.glow));
        const mounds = [[0.06, 40, 24], [0.34, 36, 14], [0.62, 44, 16], [0.94, 42, 26]];
        for (const [fx, rx, ry] of mounds) {
          const x = X(fx); mid.oval(x, GY + 2, rx, ry, mound, 'top');
          if (ry > 20) { mid.rect(x - 4, GY - 9, 9, 11, dark); mid.rect(x - 6, GY - 11, 13, 2, stone); mid.rect(x - 6, GY - 9, 2, 11, stone); mid.rect(x + 5, GY - 9, 2, 11, stone); }
        }
        const stones = [[0.17, 7, 26], [0.23, 5, 17], [0.79, 8, 28], [0.5, 4, 12]];
        for (const [fx, sw, sh] of stones) {
          const x = X(fx); mid.rect(x - sw / 2, GY - sh + 2, sw, sh, stone); mid.oval(x - 0.5, GY - sh + 2, sw / 2, 2, stone, 'top');
          if (sh > 20) { mid.px(x - 1, GY - sh * 0.6, rune); mid.px(x, GY - sh * 0.6 + 1, rune); mid.px(x - 1, GY - sh * 0.6 + 3, rune); lamp(x, GY - sh * 0.6, th.glow, 14, 0.25, 0.5, 1); }
        }
        break;
      }
      case 'fungal': {
        far.fillFrom(x => ridgeY(x, GY - H * 0.14, 5), GY + 2, back);
        for (let x = r() * 20; x < LW; x += 18 + r() * 26) { const b = GY - H * 0.1, h = 14 + r() * 26, cw = 5 + r() * 8; far.rect(x - 1, b - h, 3, h + 4, back); far.oval(x, b - h, cw, cw * 0.55, back, 'top'); }
        const stem = mat(C('#8A6E88')), cap = mat(C(th.cap)), gill = flat(ramp(C(th.cap))[3]), spot = flat(C(th.glow)), spotD = flat(blend(C(th.glow), C(th.cap), 0.5));
        mats[stem].under = 1;
        const shroom = (L, x, h, cw, f) => {
          const sw = Math.max(3, Math.round(cw * 0.34)); L.rect(x - sw / 2, GY - h, sw, h + 1, stem);
          L.rect(x - cw * 0.22, GY - 2, cw * 0.44, 3, stem);
          L.oval(x, GY - h, cw, cw * 0.62, cap, 'top'); L.rect(x - cw + 2, GY - h, 2 * cw - 3, 1, gill);
          const n = Math.round(cw / 3);
          for (let k = 0; k < n; k++) { const sx = x + (r() - 0.5) * cw * 1.4, sy = GY - h - 1 - r() * cw * 0.4; L.px(sx, sy, k % 3 ? spotD : spot); L.px(sx + 1, sy, spotD); }
          lamp(x, GY - h - cw * 0.25, th.glow, cw * 3.2, 0.2, f, 1);
        };
        shroom(mid, X(0.04), H * 0.42, 30, 0.5); shroom(mid, X(0.95), H * 0.5, 34, 0.5);
        shroom(mid, X(0.3), H * 0.16, 8, 0.5); shroom(mid, X(0.62), H * 0.12, 6, 0.5); shroom(mid, X(0.72), H * 0.2, 9, 0.5);
        shroom(fg, X(-0.01), 16, 7, 1.35); shroom(fg, X(0.04), 9, 4, 1.35); shroom(fg, X(1.0), 12, 6, 1.35);
        break;
      }
      case 'quarry': {
        for (let pass = 0; pass < 2; pass++) {
          const base = pass ? GY - H * 0.14 : GY - H * 0.34, id = pass ? front : back;
          far.fillFrom(x => Math.round(ridgeY(x + pass * 200, base, pass ? 5 : 10) / 6) * 6, GY + 2, id);
        }
        const st = mat(C(th.mid)), flute = mat(ramp(C(th.mid))[2]), rub = mat(blend(C(th.mid), C(th.ground), 0.3));
        const pillar = (x, h, w, intact) => {
          mid.rect(x, GY - h, w, h + 1, st);
          for (let k = 2; k < w - 1; k += 3) mid.rect(x + k, GY - h + (intact ? 4 : 2), 1, h - 6, flute);
          mid.rect(x - 2, GY - 3, w + 4, 4, st);
          if (intact) { mid.rect(x - 2, GY - h - 3, w + 4, 4, st); mid.rect(x - 4, GY - h - 6, w + 8, 3, st); }
          else for (let k = 0; k < w; k++) mid.rect(x + k, GY - h - Math.round(r() * 5), 1, 6, st);
        };
        pillar(X(0.02), H * 0.55, 18, true); pillar(X(0.2), H * 0.2, 14, false); pillar(X(0.58), H * 0.14, 13, false);
        pillar(X(0.8), H * 0.3, 15, false); pillar(X(0.93), H * 0.6, 18, true);
        for (const fx of [0.36, 0.69, 0.13]) { const x = X(fx); mid.rect(x, GY - 5, 12, 6, rub); mid.rect(x + 13, GY - 3, 6, 4, rub); }
        const seam = flat(ramp(C(th.ground))[3]);
        for (let y = GY + 8; y < H; y += 9 + (y - GY) / 4) { gnd.rect(0, y, LW, 1, seam); }
        break;
      }
      case 'marsh': {
        far.fillFrom(x => ridgeY(x, GY - H * 0.1, 3), GY + 2, back);
        for (let x = r() * 12; x < LW; x += 8 + r() * 14) { const h = 10 + r() * 22, b = GY - H * 0.08; far.rect(x, b - h, 1 + (r() < 0.3 ? 1 : 0), h, back); if (r() < 0.6) far.line(x, b - h * 0.6, x + (r() - 0.5) * 12, b - h * 0.85, 1, back); }
        const reed = mat(C(th.mid)), head = flat(ramp(C('#5A4028'))[1]), stump = mat(C('#2A2A24'));
        const clump = (x, n, hmax) => { for (let k = 0; k < n; k++) { const rx = x + k * 2 + r() * 2, rh = hmax * (0.4 + r() * 0.6); mid.rect(rx, GY - rh, 1, rh + 1, reed); if (r() < 0.35) mid.rect(rx, GY - rh - 3, 1, 4, head); } };
        clump(X(0.0), 9, 42); clump(X(0.9), 10, 46); clump(X(0.3), 4, 14); clump(X(0.62), 5, 12);
        deadTree(mid, X(0.14), GY + 1, H * 0.12, 4, stump, r); deadTree(mid, X(0.78), GY + 1, H * 0.08, 3, stump, r);
        const water = mat(C(th.water), 'top', 2), glint = flat(blend(C(th.moon), C(th.water), 0.5));
        for (const [fx, w] of [[0.05, 70], [0.45, 90], [0.82, 60]]) { const y = GY + 14 + r() * 16; gnd.oval(X(fx) + w / 2, y, w / 2, 4, water); for (let k = 0; k < 4; k++) gnd.rect(X(fx) + 8 + r() * (w - 16), y - 1 + r() * 3, 2 + r() * 4, 1, glint); }
        break;
      }
      case 'mine': {
        for (let x = 0; x < LW; x++) far.rect(x, 0, 1, Math.round(ceilY(x)), back);
        far.fillFrom(x => ceilY(x) + 2, GY + 2, front);
        const wall = far, dark = flat(ramp(C(th.far))[3]);
        wall.oval(X(0.55), GY + 1, 26, 34, dark, 'top');
        const oreCols = ['#D08A4E', '#A9B1BD', '#7FD6E0'].map(h => flat(blend(C(h), C(th.far), 0.35)));
        for (let i = 0; i < LW / 9; i++) { const x = r() * LW, y = H * 0.18 + r() * (GY - H * 0.25); wall.px(x, y, oreCols[i % 3]); if (r() < 0.4) wall.px(x + 1, y + 1, oreCols[i % 3]); }
        const wood = mat(C(th.mid)), iron = flat(C('#3A3542')), glass = flat(C(th.glow));
        const beamY = Math.round(H * 0.14);
        for (const fx of [-0.02, 0.38, 0.78]) {
          const x = X(fx), w = W * 0.34;
          mid.rect(x, beamY, 5, GY - beamY + 1, wood); mid.rect(x + w, beamY, 5, GY - beamY + 1, wood);
          mid.rect(x - 3, beamY - 2, w + 11, 6, wood);
          mid.line(x + 5, beamY + 16, x + 18, beamY + 4, 3, wood); mid.line(x + w, beamY + 16, x + w - 13, beamY + 4, 3, wood);
          const lx = x + w * 0.5 + 2, ly = beamY + 4 + 16;
          mid.rect(lx, beamY + 4, 1, 16, iron); mid.rect(lx - 2, ly, 5, 7, iron); mid.rect(lx - 1, ly + 1, 3, 5, glass); mid.rect(lx - 3, ly - 1, 7, 1, iron);
          lamp(lx + 0.5, ly + 3.5, th.glow, 58, 0.34, 0.5, 2);
        }
        const rail = flat(ramp(C('#6E6878'))[2]), sleeper = flat(ramp(C(th.mid))[3]);
        const ry = GY + Math.round((H - GY) * 0.62);
        for (let x = 0; x < LW; x += 7) gnd.rect(x, ry - 1, 4, 5, sleeper);
        gnd.rect(0, ry, LW, 1, rail); gnd.rect(0, ry + 3, LW, 1, rail);
        break;
      }
      case 'woods': {
        const backT = mat(haze(th.far, 0.5), 'full');
        for (let x = r() * 10; x < LW; x += 14 + r() * 18) far.rect(x, 0, 2 + r() * 5, GY, r() < 0.5 ? back : backT);
        far.fillFrom(x => ridgeY(x, GY - H * 0.08, 3), GY + 2, front);
        for (let x = 0; x < LW; x++) far.rect(x, 0, 1, Math.round(H * 0.08 + Math.sin(x * 0.07 + s[0]) * 5 + Math.sin(x * 0.19) * 3), back);
        const bark = mat(C(th.mid)), groove = flat(ramp(C(th.mid))[3]), leaves = mat(C(th.leaf));
        const trunk = (x, w) => {
          mid.rect(x, 0, w, GY + 1, bark);
          mid.tri(x + w / 2, GY - 10, 11, w * 0.85, bark);
          for (let k = 3; k < w - 3; k += 4 + Math.round(r() * 2)) { let y = r() * 20; while (y < GY - 8) { const l = 8 + r() * 26; mid.rect(x + k, y, 1, l, groove); y += l + 4 + r() * 10; } }
        };
        trunk(X(-0.02), 26); trunk(X(0.9), 30); trunk(X(0.4), 12);
        for (let x = -10; x < LW + 10; x += 16 + r() * 10) mid.oval(x, H * 0.02, 14 + r() * 10, 8 + r() * 10, leaves);
        break;
      }
      case 'raid': {
        const cone = (x, base, h, hw, id) => { for (let i = 0; i < h; i++) { const w = Math.round(hw * (0.25 + 0.75 * i / h)); far.rect(x - w, base - h + i, 2 * w + 1, 1, id); } };
        far.fillFrom(x => ridgeY(x, GY - H * 0.12, 4), GY + 2, front);
        cone(X(0.2), GY - H * 0.1, H * 0.34, 50, back); cone(X(0.78), GY - H * 0.1, H * 0.46, 64, back);
        const lava = flat(C('#FF7A3D')), lavaD = flat(C('#C23A20'));
        for (const [fx, h] of [[0.2, H * 0.34], [0.78, H * 0.46]]) {
          const top = GY - H * 0.1 - h, x0 = X(fx);
          far.rect(x0 - 6, top, 13, 1, lava);
          for (let k = 0; k < 3; k++) { let x = x0 + (k - 1) * 4, y = top + 1; while (y < GY - H * 0.1 - 4 && r() < 0.96) { far.px(x, y, y % 3 ? lava : lavaD); y++; x += r() < 0.3 ? (r() < 0.5 ? -1 : 1) : 0; } }
          lamp(x0, top, '#FF7A3D', 60, 0.3, 0.2, 1);
        }
        const obs = mat(C(th.mid));
        for (const fx of [0.02, 0.09, 0.9, 0.97, 0.3, 0.64]) { const x = X(fx) + r() * 6, h = band(x) ? 10 + r() * 10 : H * (0.3 + r() * 0.25); mid.tri(x, GY - h, h + 1, 3 + h * 0.12, obs); }
        const crack = flat(C('#FF7A3D')), crackD = flat(C('#8A2A18'));
        for (let i = 0; i < 6; i++) {
          let x = X(r()), y = GY + 6 + r() * (H - GY - 10); const len = 10 + r() * 30;
          for (let k = 0; k < len; k++) { gnd.px(x, y, k % 5 ? crackD : crack); x += 1; y += r() < 0.3 ? (r() < 0.5 ? -1 : 1) : 0; }
          if (!band(x) || y > GY + 16) lamp(x - len / 2, y, '#FF7A3D', 18, 0.22, 1, 1);
        }
        break;
      }
    }

    // ---- ground (f 1) ----
    const gm = mat(C(gG), 'top', 7);
    mats[gm].r[0] = C(gT);
    gnd.m.forEach((v, i) => { if (!v && i >= (GY + 1) * LW) gnd.m[i] = gm; }); // keep features painted above
    const top = flat(C(gT)), topD = flat(ramp(C(gT))[2]);
    gnd.rect(0, GY, LW, 1, top);
    const grassy = theme !== 'raid' && theme !== 'mine' && theme !== 'quarry' && theme !== 'cave';
    for (let x = 0; x < LW; x++) {
      if (grassy && r() < 0.4) { const h = r() < 0.3 ? 2 : 1; gnd.rect(x, GY - h, 1, h, r() < 0.5 ? top : topD); }
      else if (!grassy && r() < 0.15) gnd.px(x, GY - 1, topD);
    }
    const speck = flat(ramp(C(gG))[0]), speckD = flat(ramp(C(gG))[3]);
    for (let i = 0; i < LW / 4; i++) { const y = GY + 4 + r() * (H - GY - 4); gnd.rect(r() * LW, y, r() < 0.3 ? 2 : 1, 1, r() < 0.5 ? speck : speckD); }

    // ---- foreground (f 1.35): corners and the bottom strip only ----
    const fgC = blend(C(gG), [4, 3, 6], 0.45), fgId = mat(fgC), fgT = flat(ramp(fgC)[3]);
    const corner = (fx, fn) => fn(X(fx));
    const tuft = (x, n, hmax) => { for (let k = 0; k < n; k++) { const bx = x + k * 2 + r() * 2, h = 3 + r() * hmax; fg.line(bx, H, bx + (r() - 0.5) * 4, H - h, 1, fgT); } };
    switch (theme) {
      case 'cave': case 'mine':
        corner(-0.03, x => fg.tri(x + 10, 0, H * 0.22, 12, fgId, true)); corner(1.0, x => fg.tri(x, 0, H * 0.16, 10, fgId, true));
        corner(-0.02, x => fg.oval(x + 8, H + 2, 22, 12, fgId, 'top')); corner(0.98, x => fg.oval(x, H + 2, 18, 9, fgId, 'top'));
        break;
      case 'forest': case 'woods':
        corner(-0.03, x => { fg.rect(x, 0, 12, H, fgId); }); tuft(X(0.0), 8, 14); tuft(X(0.92), 8, 12); tuft(X(0.5), 3, 5);
        break;
      case 'marsh': tuft(X(-0.02), 10, 26); tuft(X(0.93), 9, 22); tuft(X(0.4), 3, 6); break;
      case 'bone': case 'barrow': tuft(X(-0.01), 7, 12); tuft(X(0.94), 7, 10);
        if (theme === 'bone') corner(0.965, x => { const b = flat(blend(C(th.bone), fgC, 0.55)); fg.rect(x, H - 7, 7, 5, b); fg.rect(x + 1, H - 2, 5, 2, b); fg.px(x + 1, H - 5, fgT); fg.px(x + 4, H - 5, fgT); });
        break;
      case 'quarry': case 'raid': corner(-0.02, x => { fg.oval(x + 6, H + 2, 18, 10, fgId, 'top'); fg.oval(x + 26, H + 2, 8, 5, fgId, 'top'); }); corner(0.97, x => fg.oval(x, H + 2, 16, 8, fgId, 'top')); break;
      default: tuft(X(0), 5, 8); tuft(X(0.95), 5, 8);
    }

    // ---- shade and bake ----
    const bake = (L, base) => { const c = mkCanvas(LW, H), g = c.getContext('2d'), img = base || new ImageData(LW, H); shade(L, mats, img); g.putImageData(img, 0, 0); return c; };
    const layers = [
      { c: bake(sky, skyImg), f: 0.05 },
      { c: bake(far), f: 0.2 },
      { c: bake(mid), f: 0.5 },
      { c: bake(gnd), f: 1 },
      { c: bake(fg), f: 1.35, fg: true }
    ];

    // ---- atmosphere data ----
    const [type, ambHex, n] = th.amb;
    const ambRgb = C(ambHex).join(',');
    const pr = rand(W * 3 + H + theme.length);
    const parts = [];
    for (let i = 0; i < n; i++) parts.push({ x: pr() * (W + 40) - 20, y: pr(), sp: 0.6 + pr() * 0.8, ph: pr() * 6.283, sz: 0.6 + pr() * 0.8, d: drips.length ? drips[i % drips.length] : null, per: 1.6 + pr() * 2.4 });
    const fog = { rgb: C(th.fog[0]).join(','), a: th.fog[1], y: GY - 6 };
    // overlay: vignette plus a theme tint, pre-rendered small and stretched when drawn
    const ov = mkCanvas(Math.ceil(W / 2), Math.ceil(H / 2)), og = ov.getContext('2d'), ow = ov.width, oh = ov.height;
    const vg = og.createRadialGradient(ow * 0.5, oh * 0.56, oh * 0.38, ow * 0.5, oh * 0.56, ow * 0.78);
    vg.addColorStop(0, 'rgba(6,4,10,0)'); vg.addColorStop(1, 'rgba(6,4,10,.62)');
    og.fillStyle = vg; og.fillRect(0, 0, ow, oh);
    const tint = { raid: ['255,90,40', 0.16, 1], bone: ['160,30,40', 0.08, 0], cave: ['10,8,20', 0.25, 0], mine: ['10,8,14', 0.2, 0], fungal: ['200,90,200', 0.06, 1], marsh: ['150,210,200', 0.05, 1] }[theme];
    if (tint) { const lg = og.createLinearGradient(0, 0, 0, oh); const [c, a, bottom] = tint; lg.addColorStop(bottom ? 0.4 : 0, `rgba(${c},${bottom ? 0 : a})`); lg.addColorStop(bottom ? 1 : 0.45, `rgba(${c},${bottom ? a : 0})`); og.fillStyle = lg; og.fillRect(0, 0, ow, oh); }

    return {
      theme, hue, W, H, GY, M, layers,
      fog, amb: { type, rgb: ambRgb, parts },
      light: { moon, lamps: lights, shafts: !!th.shafts, overlay: ov }
    };
  }

  // ---------- cached glow sprites (shared) ----------
  const glowCache = new Map();
  function glow(rgb, soft) {
    const k = rgb + (soft ? 's' : '');
    let c = glowCache.get(k);
    if (!c) {
      c = mkCanvas(64, 64); const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      if (soft) { gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(1, `rgba(${rgb},0)`); }
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
    W = Math.max(1, Math.round(W)); H = Math.max(1, Math.round(H)); hue = Math.round(hue || 0) % 360;
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
    for (const ly of scene.layers) {
      if (which === 'back' && ly.fg) continue;
      if (which === 'fg' && !ly.fg) continue;
      ctx.drawImage(ly.c, Math.round(-scene.M - camX * ly.f), 0);
    }
  };

  drawAtmosphere = function (ctx, scene, T, W, H, camX) {
    camX = camX || 0; W = W || scene.W; H = H || scene.H;
    const t = REDUCED ? 0 : T, M0 = scene.M, GY = scene.GY * H / scene.H;
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = 'source-over';
    // fog bands: wide soft blobs drifting along the ground, one higher and fainter
    const fg = glow(scene.fog.rgb, true), fa = scene.fog.a;
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
    if (L.moon) { const m = L.moon, rr = m.r * 4.5; ctx.globalAlpha = 0.22; ctx.drawImage(glow(m.rgb, true), m.x - M0 - camX * 0.05 - rr, m.y - rr, rr * 2, rr * 2); }
    if (L.shafts) {
      const sp = shaft();
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.07 + 0.03 * Math.sin(t * 0.4 + i * 1.7); ctx.drawImage(sp, W * (0.08 + i * 0.26) - camX * 0.3, -4, W * 0.18, GY + 8); }
    }
    for (const lp of L.lamps) {
      const fl = REDUCED ? 1 : lp.pulse === 2 ? 0.85 + 0.15 * Math.sin(T * 13 + lp.ph) * Math.sin(T * 7.3) : lp.pulse ? 0.85 + 0.15 * Math.sin(T * 1.3 + lp.ph) : 1;
      const x = lp.x - M0 - camX * lp.f, rr = lp.r * fl;
      ctx.globalAlpha = lp.a * fl; ctx.drawImage(glow(lp.rgb), x - rr, lp.y - rr, rr * 2, rr * 2);
    }
    // ambient particles: stateless, positions are a function of time
    const A = scene.amb, spr = glow(A.rgb), W2 = W + 40;
    const wrap = (v, m) => ((v % m) + m) % m;
    for (const p of A.parts) {
      let x, y, a = 1, sz = 1.2 * p.sz, g = 6;
      switch (A.type) {
        case 'firefly': x = p.x + Math.sin(t * 0.3 * p.sp + p.ph) * 22; y = GY - 20 - p.y * (GY * 0.5) + Math.sin(t * 0.5 + p.ph * 2) * 8; a = 0.5 + 0.5 * Math.sin(t * 2.2 * p.sp + p.ph); g = 9; break;
        case 'drip': {
          if (!p.d) continue;
          const c = wrap(t + p.ph, p.per), sx = p.d.x - M0 - camX * p.d.f;
          x = sx; if (c < 0.8) { y = p.d.y + 1; a = c / 0.8; sz = 0.9; } else { y = p.d.y + 0.5 * 300 * (c - 0.8) ** 2; if (y > GY) { const q = Math.min(1, (y - GY) / 30); y = GY; a = 1 - q; sz = 0.8 + q * 2; } }
          g = 5; break;
        }
        case 'ash': x = wrap(p.x + t * 5 * p.sp, W2) - 20; y = wrap(p.y * H + t * 4 * p.sp, H); x += Math.sin(t + p.ph) * 3; a = 0.7; g = 0; sz = 1; break;
        case 'mote': x = p.x + Math.sin(t * 0.4 + p.ph) * 10; y = GY + 4 - wrap(p.y * GY + t * 3 * p.sp, GY * 0.8); a = Math.min(1, (GY + 4 - y) / 20) * (0.6 + 0.4 * Math.sin(t * 1.5 + p.ph)); g = 7; break;
        case 'spore': x = p.x + Math.sin(t * 0.8 * p.sp + p.ph) * 8; y = GY - wrap(p.y * GY + t * 5 * p.sp, GY); a = Math.min(1, (GY - y) / 20) * 0.8; g = 6; break;
        case 'dust': x = wrap(p.x + t * 6 * p.sp, W2) - 20; y = GY * (0.35 + 0.6 * p.y) + Math.sin(t * 0.7 + p.ph) * 4; a = 0.45; g = 0; sz = 1; break;
        case 'wisp': x = wrap(p.x + t * 3 * p.sp + Math.sin(t * 0.3 + p.ph) * 20, W2) - 20; y = GY - 10 - p.y * 50 + Math.sin(t * 0.9 + p.ph) * 6; a = 0.5 + 0.5 * Math.sin(t * 0.8 + p.ph); g = 14; sz = 1.6; break;
        case 'ember': x = p.x + Math.sin(t * 1.4 * p.sp + p.ph) * 6; y = GY + 6 - wrap(p.y * H + t * 22 * p.sp, H); a = Math.min(1, (GY + 6 - y) / 30, y / 40) * (0.7 + 0.3 * Math.sin(t * 9 + p.ph)); g = 6; break;
        case 'leaf': x = wrap(p.x + t * 5 * p.sp + Math.sin(t * 1.3 + p.ph) * 10, W2) - 20; y = wrap(p.y * H + t * 10 * p.sp, GY + 10); a = 0.85; g = 0; sz = 1.5; break;
        default: continue;
      }
      if (A.type !== 'drip') x -= camX * 0.9;
      if (a <= 0.02) continue;
      if (g) { ctx.globalAlpha = a * 0.35; ctx.drawImage(spr, x - g, y - g, g * 2, g * 2); }
      ctx.globalAlpha = a;
      ctx.globalCompositeOperation = g ? 'lighter' : 'source-over';
      ctx.fillStyle = `rgb(${A.rgb})`;
      if (A.type === 'leaf') ctx.fillRect(x, y, Math.sin(t * 3 + p.ph) > 0 ? 2 : 1, 1);
      else if (A.type === 'drip' && y < GY) ctx.fillRect(x - sz / 2, y, sz, sz * 2);
      else ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      ctx.globalCompositeOperation = 'lighter';
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(L.overlay, 0, 0, W, H);
    ctx.imageSmoothingEnabled = smooth;
  };
}
