// map-study/style-h.js: MAP1, the owner's hybrid "H". Style A's top-down 16-bit overworld (forests,
// Lantern Hill's cliff with stairs and a waterfall, the stream and its bridges, the marsh pond, graves
// and barrows, the winding road with a lamp per zone) under style C's night, with C's landmarks.
// The mood is "light in the dark": everything is night. Each lit lamp and landmark throws a small
// warm pool that falls off fast; outside the pools the land is deep shadow, silhouettes only.
// Fireflies and motes drift in the dark patches (DOM sprites, CSS only).
//
// Light model (baked once per plate, no per-frame work):
//   1. Paint the plate in full colour (as A).
//   2. Bake a light plate: per pixel the strongest light I = a * (1 - q)^2 (q = distance / radius,
//      an ellipse squashed on the ground), capped per light. Lights only touch their bounding box.
//   3. Quantise I into 4 levels with a 4 x 4 Bayer dither (SNES-style seams, 1-2 px wide):
//      0 shadow, 1 dusk, 2 lamplit, 3 flame. Each level is a palette swap of the painted colour
//      (2 and 3 are tinted by that pixel's strongest light: warm, blue well light, red raid light).
'use strict';
const STYLE_H = (() => {
  const { mix, desat, mul, rand, Spr, fromMap } = MK;
  const PA = STYLE_A.P, A = STYLE_A.parts, C = STYLE_C.parts, PC = STYLE_C.P;
  const FL = '#FFBA60', FIRE = '#FF9A48', WELL = '#6FD0E8', RAID = '#FF6B3D', GOLD = '#FFD27A';

  // ================= the light model =================
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const T1 = 0.12, T2 = 0.34, T3 = 0.62, DITH = 0.14; // level thresholds and dither amplitude
  const SHADOW = '#050816', DUSK = '#0A1024';
  // the four palettes (a real build keeps these as 4 arrays per region palette, indexed by colour id)
  const cache = new Map();
  const memo = (k, f) => { let v = cache.get(k); if (v === undefined) { v = f(); cache.set(k, v); } return v; };
  const L0 = c => memo('0' + c, () => mix(desat(c, 0.66), SHADOW, 0.74));
  const L1 = c => memo('1' + c, () => mix(desat(c, 0.45), DUSK, 0.48));
  const L2 = (c, t) => memo('2' + c + t, () => mix(mul(desat(c, 0.25), mix(t, '#FFFFFF', 0.45)), t, 0.1));
  const L3 = (c, t) => memo('3' + c + t, () => mix(mix(c, '#FFFFFF', 0.1), t, 0.24));
  const LV = [L0, L1, L2, L3];
  // bake the light plate: strongest light per pixel, and whose tint it is
  function lightMap(W, H, lights, amb) {
    const I = new Float32Array(W * H).fill(amb || 0), T = new Array(W * H).fill(null);
    for (const l of lights) {
      const rx = l.rx || l.r, ry = l.ry || (l.r * 0.72), a = l.a ?? 1, cap = l.cap ?? 9;
      const x0 = Math.max(0, Math.floor(l.x - rx)), x1 = Math.min(W - 1, Math.ceil(l.x + rx)), y0 = Math.max(0, Math.floor(l.y - ry)), y1 = Math.min(H - 1, Math.ceil(l.y + ry));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - l.x) / rx, dy = (y + 0.5 - l.y) / ry, q = Math.sqrt(dx * dx + dy * dy);
        if (q >= 1) continue;
        const v = Math.min(cap, a * (1 - q) * (1 - q)), i = y * W + x;
        if (v > I[i]) { I[i] = v; T[i] = l.col || T[i]; }
      }
    }
    const level = (x, y) => { const i = y * W + x, v = I[i] + (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * DITH; return v > T3 ? 3 : v > T2 ? 2 : v > T1 ? 1 : 0; };
    const shade = (c, x, y) => { const k = level(x, y); return k >= 2 ? LV[k](c, T[y * W + x] || FL) : LV[k](c); };
    return { I, T, W, H, level, shade };
  }
  function relight(pl, lm) { const out = new Spr(pl.w, pl.h); for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) { const c = pl.c[y * pl.w + x]; if (c != null) out.c[y * pl.w + x] = lm.shade(c, x, y); } return out; }
  // stamp a sprite after relight: its glass (emissive) keeps its colour when lit, the rest takes the light
  const GLASS = new Set([PC.F, PC.f, PC.o]);
  function stampLit(out, lm, s, x, y, emissive) {
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      const c = s.c[j * s.w + i]; if (c == null) continue; const px = x + i, py = y + j; if (!out.ok(px, py)) continue;
      out.c[py * out.w + px] = emissive && GLASS.has(c) ? c : lm.shade(c, px, py);
    }
  }
  // fireflies and motes: a few DOM sprites dropped only where it is dark
  function motes(lm, n, kinds, seed, box) {
    const r = rand(seed), out = []; box = box || [4, 4, lm.W - 4, lm.H - 4];
    for (let t = 0; t < 900 && out.length < n; t++) {
      const x = box[0] + Math.floor(r() * (box[2] - box[0])), y = box[1] + Math.floor(r() * (box[3] - box[1]));
      let dark = true; for (const [dx, dy] of [[0, 0], [8, 0], [-8, 0], [0, 7], [0, -7]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < lm.W && yy < lm.H && lm.I[yy * lm.W + xx] > 0.1) dark = false; }
      if (!dark || out.some(m => Math.abs(m.x - x) + Math.abs(m.y - y) < 16)) continue;
      out.push({ x, y, k: kinds[Math.floor(r() * kinds.length)], d: -(r() * 9).toFixed(2), p: 1 + Math.floor(r() * 3) });
    }
    return out;
  }
  // tame C's big smooth glows: the light falls off fast
  const tame = (s, k) => { for (const l of s.lights) { if (l.glow) l.glow = Math.round(l.glow * k); if (l.ga) l.ga *= 0.9; } return s; };

  // ================= sprites =================
  // the road lamp: C's hook lamp, cut down for the top-down map (8 x 12 art px)
  const LAMP_ROWS = ['.iiiii..', '.I...i..', '.i..iii.', '.i.iFfoi', '.i.ifFfi', '.i.ioooi', '.i..iii.', '.i......', '.i......', '.I......', 'iIi.....', 'tsst....'];
  function lamp(lit) { const rows = lit ? LAMP_ROWS : LAMP_ROWS.map(r => r.replace(/F/g, 'd').replace(/[fo]/g, 'D')); const s = fromMap(rows, PC).outlined(); if (lit) s.light(6, 5, 8, FL, { glow: 9, ga: 0.6 }); return s; }
  const LAMP_GLASS = [6, 5]; // in the outlined sprite
  const rest = () => tame(C.rest(), 0.62), tavern = () => tame(C.tavern(), 0.8), well = () => tame(C.well(), 0.62);
  const greatLantern = (lit, col) => { const s = C.greatLantern(lit, col); if (!lit) return s.recolor(L1); return tame(s, 0.62); };
  const sign = () => C.sign(), wyrm = () => tame(C.wyrm(), 0.75), gate = () => C.gate().recolor(L1);

  // ================= the Hollow =================
  const ROWS_H = [134, 174, 214, 254, 294];
  const PLACES_H = { rest: [84, 66], tavern: [28, 70], well: [152, 108], sign: [72, 104], lantern: [158, 58] };
  function grass(pl, W, H, P) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const tx = x % 12, ty = y % 12, t = (Math.floor(x / 12) * 7 + Math.floor(y / 12) * 13) % 5;
      if ((tx === 3 && ty === 4) || (tx === 4 && ty === 3) || (tx === 9 && ty === 9) || (tx === 8 && ty === 10 && t > 1)) pl.set(x, y, P.G);
      else if ((tx === 4 && ty === 4) || (tx === 9 && ty === 10) || (tx === 7 && ty === 1 && t < 2)) pl.set(x, y, P.h);
    }
  }
  function roadOf(pts, W, H) { const rs = new Spr(W, H); for (let i = 0; i + 1 < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; rs.line(x0, y0, x1, y1, 1, 6); } return rs; }
  function paintRoad(pl, rs, fill, edge, spot) {
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) if (rs.get(x, y)) {
      const e = !rs.get(x, y - 1) || !rs.get(x - 1, y) || !rs.get(x + 1, y) || !rs.get(x, y + 1);
      pl.set(x, y, e ? edge : ((x * 5 + y * 11) % 13 === 0 ? spot : fill));
    }
  }
  // lamps on a plate: lit ones throw a pool; the first dark one gets the frontier glow (dusk only), so
  // the next stretch of road shows as shapes
  function roadLights(lamps, save, lights, glow) {
    lamps.forEach((l, i) => {
      l.lit = l.zone < save.maxZone;
      if (l.lit) { lights.push({ x: l.x + 1, y: l.y - 3, rx: 19, ry: 14, a: 1, col: FL }); glow.push({ x: l.x - 2 + LAMP_GLASS[0], y: l.y - 17 + LAMP_GLASS[1], glow: 9, ga: 0.6, col: FL }); }
      // the frontier glow leans forward along the road, toward the lamps still to light
      if (l.zone === save.maxZone) { const nx = lamps[i + 1] && lamps[i + 1].y === l.y ? Math.sign(lamps[i + 1].x - l.x) : 0; lights.push({ x: l.x + 1 + nx * 10, y: l.y - 4, rx: 40, ry: 22, a: 1, cap: 0.27 }); }
    });
  }
  function stampLamps(out, lm, lamps) { for (const l of lamps) stampLit(out, lm, lamp(l.lit), l.x - 2, l.y - 17, l.lit); }

  function paintHollow(save, o) {
    o = o || {};
    const W = 180, H = 324, r = rand(7), P = PA, pl = new Spr(W, H, P.g), places = PLACES_H;
    grass(pl, W, H, P);
    // Lantern Hill: a plateau top right; its south face is a cliff, stairs cut into it
    const hillB = x => 62 + Math.round(Math.sin(x / 9) * 2 + Math.sin(x / 4.3)) - Math.max(0, Math.round((126 - x) * 0.9));
    const hill = (x, y) => x >= 106 && y < hillB(x);
    for (let y = 0; y < 80; y++) for (let x = 100; x < W; x++) if (hill(x, y)) pl.set(x, y, (x * 3 + y * 5) % 23 === 0 ? P.G : (x + y * 2) % 29 === 0 ? P.h : '#5A8C48');
    for (let x = 106; x < W; x++) {
      const yb = hillB(x); if (yb <= 0) continue;
      pl.set(x, yb - 1, '#86B864');
      for (let k = 0; k < 9; k++) { const y = yb + k; pl.set(x, y, k === 0 ? P.S : k === 8 ? P.T : ((x * 7 + Math.floor(y / 3) * 5) % 11 === 0 || (y % 3 === 2 && (x + Math.floor(y / 3)) % 6 === 0)) ? P.T : x % 9 === 0 ? P.t : k < 3 ? P.s : P.t); }
    }
    for (let k = 0; k < 9; k++) pl.rect(136, hillB(136) + 8 - k, 7, 1, k % 2 ? P.s : P.S);
    pl.vl(135, hillB(135) - 1, 11, P.T); pl.vl(143, hillB(143) - 1, 11, P.T);
    // yards: the camp clearing, the tavern yard, the well yard (trodden earth)
    const earth = (x, y, dx, dy) => (dx * dx + dy * dy > 0.8) ? '#8A7048' : ((x * 7 + y * 3) % 17 === 0 ? '#8A7048' : '#A08458');
    pl.ell(84, 60, 34, 20, earth); pl.ell(28, 72, 20, 10, earth); pl.ell(150, 106, 18, 9, earth); pl.ell(72, 104, 10, 5, earth);
    // the marsh pond (bottom left) with a shore and lily pads
    const pond = (x, y) => ((x - 22) / 34) ** 2 + ((y - 280) / 24) ** 2 <= 1 && y > 262 && x < 58;
    for (let y = 255; y < 306; y++) for (let x = 0; x < 64; x++) if (pond(x, y)) { const edge = !pond(x, y - 1) || !pond(x + 1, y); pl.set(x, y, edge ? '#A0906A' : (y + x * 3) % 9 === 0 ? '#4A8AA0' : (y % 4 === 0 && x % 6 < 3) ? '#2E6A84' : '#24587A'); }
    for (const [x, y] of [[14, 272], [30, 284], [40, 276]]) pl.map(['.G.', 'GGg', '.g.'], P, x, y);
    // the stream: off the hill (a waterfall down the cliff), under the road, into the pond
    const streamX = y => Math.round(122 + Math.sin(y / 23) * 5 - Math.max(0, y - 80) * 0.3);
    for (let y = 26; y < 270; y++) {
      const x = streamX(y), hb = hillB(x); if (y < hb - 1 && y > 60) continue;
      if (y < hb - 1) { if (hill(x, y)) { pl.rect(x - 1, y, 3, 1, '#2E6A84'); pl.set(x, y, '#4A8AA0'); } continue; }
      if (y < hb + 9) { pl.rect(x - 1, y, 4, 1, (y + x) % 3 ? '#9AD8E8' : '#E0FCFF'); continue; }
      if (pond(x, y)) break;
      pl.rect(x - 1, y, 4, 1, '#2E6A84'); pl.set(x, y, '#4A8AA0'); pl.set(x - 2, y, '#8A7A5A'); pl.set(x + 3, y, P.h);
    }
    // the road: out of the camp gate, down past the Almanac, then a snake of 5 rows (one per band)
    const rows = ROWS_H, xl = 20, xr = 160;
    const sn = MAPDATA.snake(rows, xl, xr, 1, [[88, 78], [88, 114], [xl, 114]], [[xr, H + 2]]);
    const rs = roadOf(sn.pts, W, H);
    paintRoad(pl, rs, '#A48558', '#6A5034', '#B89A6A');
    for (const y of rows) { const x = streamX(y); pl.rect(x - 3, y - 4, 8, 8, P.w); for (let k = 0; k < 8; k += 2) pl.hl(x - 3, y - 4 + k, 8, P.W); pl.vl(x - 4, y - 4, 8, P.V); pl.vl(x + 5, y - 4, 8, P.V); }
    // forests on the edges and between rows, then the small stamps
    const busy = (x, y, pad = 7) => { for (let yy = y - pad; yy <= y + pad; yy++) for (let xx = x - pad; xx <= x + pad; xx++) if (rs.get(xx, yy)) return true; return false; };
    const nearPlace = (x, y) => Object.values(places).some(([px, py]) => Math.abs(px - x) < 24 && y > py - 40 && y < py + 12);
    const trees = [];
    for (let i = 0; i < 480; i++) {
      const x = Math.floor(r() * (W + 10)) - 5, y = Math.floor(r() * (H + 6)) - 4;
      const edge = x < 12 || x > W - 14 || (y < 26 && x < 60) || (y > 84 && y < 104 && x < 44);
      const between = rows.some(ry => Math.abs(y - ry - 20) < 7) && r() < 0.5;
      if (!(edge || between)) continue;
      if (busy(x, y + 4, 8) || nearPlace(x, y) || hill(x, y + 10) || pond(x, y + 12) || Math.abs(streamX(y + 12) - x) < 6) continue;
      trees.push([x, y, r() < 0.22 ? 1 : 0]);
    }
    trees.sort((a, b) => a[1] - b[1]);
    const forest = new Spr(W, H);
    for (const [x, y, p] of trees) forest.stamp(p ? A.pine() : A.tree(0, r() < 0.4), x - 7, y - 8);
    pl.stamp(forest.outlined(), -1, -1);
    // a few pines on the hill behind the Great Lantern
    for (const [x, y] of [[118, 18], [128, 10], [172, 22]]) pl.stamp(A.pine().outlined(), x - 5, y - 8);
    const put = (s, x, y) => pl.stamp(s, x - Math.floor(s.w / 2), y - s.h + 1);
    for (const [x, y] of [[60, 164], [96, 200], [140, 238], [74, 280], [150, 154], [40, 236], [128, 194]]) if (!busy(x, y, 4)) put(A.rock(), x, y);
    for (const [x, y] of [[134, 148], [142, 150], [138, 157], [148, 149], [152, 157], [30, 238], [37, 241]]) put(A.grave(), x, y);
    put(A.mound(), 70, 237); put(A.mound(), 92, 240);
    for (const [x, y, c] of [[40, 192], [46, 196], [36, 198]]) put(A.shroom(c ? '#B858A0' : '#C8508A'), x, y);
    for (const [x, y] of [[48, 266], [52, 288], [6, 298], [56, 276]]) pl.stamp(A.reed().outlined(), x, y);
    for (const [x, y] of [[120, 122], [50, 154], [160, 200], [24, 220], [110, 280]]) if (!busy(x, y, 4)) put(A.bush(), x, y);
    for (let k = 0; k < 4; k++) pl.rect(150 + k * 4, 264 + k * 3, 30 - k * 4, 3, k % 2 ? P.s : P.S);
    pl.hl(150, 276, 30, P.T);
    // ---- light ----
    const lamps = sn.lamps.map((l, i) => ({ ...l, zone: i + 1 })), lights = [], glow = [];
    roadLights(lamps, save, lights, glow);
    // landmarks are lights too: the camp fire (the Hearth, always lit), the tavern windows, the well,
    // the Almanac's own lamp; a lit Great Lantern lights the hill and lifts the whole region to dusk
    lights.push({ x: 84, y: 60, rx: 50, ry: 32, a: 1.25, col: FIRE }, { x: 28, y: 70, rx: 26, ry: 17, a: 0.95, col: FL },
      { x: 152, y: 100, rx: 24, ry: 17, a: 1, col: WELL }, { x: 72, y: 100, rx: 15, ry: 11, a: 0.9, col: FL });
    const allLit = !!(save.lit && save.lit.hollow);
    if (allLit) lights.push({ x: 158, y: 44, rx: 62, ry: 46, a: 1.15, col: GOLD });
    const lm = lightMap(W, H, lights, allLit ? 0.2 : 0);
    const out = relight(pl, lm);
    stampLamps(out, lm, lamps);
    const pins = [
      { id: 'rest', at: places.rest, spr: rest(), label: "Hollow's Rest" },
      { id: 'tavern', at: places.tavern, spr: tavern(), label: 'Tavern', dot: save.dots.tavern },
      { id: 'well', at: places.well, spr: well(), label: 'Deepwell' },
      { id: 'sign', at: places.sign, spr: sign(), label: 'Almanac', dot: save.dots.sign },
      { id: 'lantern', at: places.lantern, spr: greatLantern(allLit, '#F2C14E'), label: 'Great Lantern', lbl: allLit ? '' : 'cold' }
    ];
    return { plate: out, lm, lamps, pins, rows, W, H, flags: rows.map((y, i) => ({ band: i, y, open: save.maxZone > i * 7 })), glowLights: glow, motes: o.noMotes ? [] : motes(lm, 14, ['ff', 'ff', 'ff', 'mo'], 31) };
  }

  // ================= the Coast =================
  function paintCoast(save) {
    const W = 180, H = 262, r = rand(11), pl = new Spr(W, H, '#5E8A5A');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const tx = x % 12, ty = y % 12; if ((tx === 3 && ty === 4) || (tx === 9 && ty === 9)) pl.set(x, y, '#7AA46A'); else if (tx === 4 && ty === 4) pl.set(x, y, '#46704A'); }
    const shore = y => 40 + Math.round(Math.sin(y / 17) * 6 + Math.sin(y / 7) * 2);
    for (let y = 0; y < H; y++) { const s = shore(y); for (let x = 0; x < s + 8; x++) pl.set(x, y, x < s ? ((x * 3 + y * 7) % 23 === 0 || (y % 6 === 0 && (x + y) % 12 < 3) ? '#4A8AA0' : x > s - 3 ? '#2E6A84' : '#1E4E6A') : ((x + y) % 3 ? '#B0A488' : '#948870')); }
    const rows = [40, 80, 120, 160, 200], xl = 62, xr = 162;
    const sn = MAPDATA.snake(rows, xl, xr, 0, [[160, -2], [160, 40]], [[xl, H + 2]]);
    const rs = roadOf(sn.pts, W, H);
    paintRoad(pl, rs, '#A89878', '#6A5E48', '#B8AA8A');
    const busy = (x, y, pad = 7) => { for (let yy = y - pad; yy <= y + pad; yy++) for (let xx = x - pad; xx <= x + pad; xx++) if (rs.get(xx, yy)) return true; return false; };
    const forest = new Spr(W, H), tr = [];
    for (let i = 0; i < 280; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * H); if (x < shore(y) + 12 || busy(x, y + 4, 8)) continue; if (!(x > W - 12 || rows.some(ry => Math.abs(y - ry - 20) < 6))) continue; tr.push([x, y]); }
    tr.sort((a, b) => a[1] - b[1]); for (const [x, y] of tr) forest.stamp(A.pine(), x - 5, y - 8);
    pl.stamp(forest.outlined(), -1, -1);
    for (const [x, y] of [[90, 60], [140, 100], [100, 180], [150, 222]]) if (!busy(x, y, 4)) pl.stamp(A.rock(), x - 4, y - 5);
    pl.blob(30, 250, 14, 6, [PA.s, PA.t, PA.T]); // Saltreach rock
    const lamps = sn.lamps.map((l, i) => ({ ...l, zone: 36 + i })), lights = [], glow = [];
    roadLights(lamps, save, lights, glow);
    const lm = lightMap(W, H, lights, 0), out = relight(pl, lm);
    // the sea is never quite black: a few moonlit crests (fixed pixels, part of the plate)
    const r2 = rand(4);
    for (let i = 0; i < 60; i++) { const y = Math.floor(r2() * H), x = Math.floor(r2() * (shore(y) - 4)); if (lm.I[y * W + x] < 0.1) { out.set(x, y, '#1C2C44'); out.set(x + 1, y, '#16243A'); } }
    stampLamps(out, lm, lamps);
    const pins = [{ id: 'lantern', at: [30, 246], spr: greatLantern(false), label: 'Saltreach Light', lbl: 'cold' }];
    return { plate: out, lm, lamps, pins, rows, W, H, flags: rows.map((y, i) => ({ band: 5 + i, y, open: save.maxZone > 35 + i * 7 })), glowLights: glow, motes: motes(lm, 9, ['ff', 'mo', 'mo'], 13, [shore(0) + 6, 4, W - 4, H - 4]) };
  }

  // ================= Beyond (locked, the raid lit) =================
  function paintBeyond() {
    const W = 180, H = 84, r = rand(5), pl = new Spr(W, H, '#4A4048');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = r(); if (n < 0.06) pl.set(x, y, '#5E5460'); else if (n < 0.08) pl.set(x, y, '#8A3A30'); }
    for (let i = 0; i < 6; i++) { const x = 20 + i * 28 + Math.floor(r() * 10), y = 14 + Math.floor(r() * 50); pl.line(x, y, x + 6, y + 3, '#B8442E'); }
    pl.line(62, 0, 62, 30, '#6A5E58', 5); pl.line(62, 30, 40, 44, '#6A5E58', 5);
    for (let k = 0; k < 6; k++) pl.set(40 - k * 3, 44 + k, '#6A5E58');
    // the raid's red pool; the gate sits in a dusk glow so the road's end shows
    const lights = [{ x: 132, y: 48, rx: 38, ry: 26, a: 1.15, col: RAID }, { x: 62, y: 26, rx: 26, ry: 20, a: 1, cap: 0.27 }];
    const lm = lightMap(W, H, lights, 0), out = relight(pl, lm);
    // lava cracks glow faintly even in the dark (emissive pixels)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (pl.get(x, y) === '#B8442E' && lm.I[y * W + x] < 0.1) out.set(x, y, '#5A1A14');
    return { plate: out, lm, lamps: [], rows: [], W, H, flags: [], glowLights: [],
      pins: [{ id: 'raid', at: [132, 50], spr: wyrm(), label: 'Raid: the Ashen Wyrm', dot: 1, lit: 1 }, { id: 'gate', at: [62, 30], spr: gate(), label: 'Reach zone 71', lbl: 'cold' }],
      motes: motes(lm, 7, ['em', 'em', 'mo'], 9) };
  }

  // ================= five regions: the same band slice, lit and locked =================
  const RP = [
    { g: '#4C7E40', G: '#6E9E52', h: '#35613A', road: '#A48558', edge: '#6A5034', mote: 'ff' },
    { g: '#5E8A5A', G: '#7AA46A', h: '#46704A', road: '#A89878', edge: '#6A5E48', sea: 1, mote: 'mo' },
    { g: '#5A5058', G: '#6E646A', h: '#443C44', road: '#7A6A60', edge: '#4A3E3A', ember: 1, mote: 'em' },
    { g: '#C8D0E0', G: '#E8EEF8', h: '#A0A8C0', road: '#8A8078', edge: '#5A5250', mote: 'sn' },
    { g: '#3A3450', G: '#4A4462', h: '#2A2640', road: '#6E6886', edge: '#2A2640', mote: 'cr' }
  ];
  const TINT = [FL, '#FFC890', '#FF8A50', '#FFE0B0', '#C8A0FF']; // each region's lamp tint (Long Stair: crystal violet)
  function regionTile(i, locked) {
    const R = RP[i], W = 72, H = 44, s = new Spr(W, H, R.g);
    grass(s, W, H, R);
    if (R.sea) for (let y = 0; y < H; y++) { const e = 9 + Math.round(Math.sin(y / 5) * 2); for (let x = 0; x < e + 3; x++) s.set(x, y, x < e ? ((x + y * 3) % 7 === 0 ? '#4A8AA0' : '#24587A') : '#A89C80'); }
    if (R.ember) for (const [x, y] of [[8, 8], [40, 14], [24, 20], [60, 6]]) { s.line(x, y, x + 5, y + 2, '#B8442E'); s.set(x + 2, y + 1, '#FF9E3D'); }
    const put = (sp, x, y) => s.stamp(sp, x - Math.floor(sp.w / 2), y - sp.h + 1);
    if (i === 0) { put(A.tree(0, 0).outlined(), 10, 22); put(A.tree(0, 1).outlined(), 60, 20); put(A.tree(0, 0).outlined(), 36, 14); }
    if (i === 1) { put(A.pine().outlined(), 30, 18); put(A.pine().outlined(), 58, 20); }
    if (i === 2) { for (const x of [14, 54]) { const d = new Spr(10, 14); d.vl(4, 3, 11, '#3A3034'); d.line(4, 6, 1, 2, '#3A3034'); d.line(5, 5, 8, 1, '#3A3034'); d.line(4, 9, 7, 7, '#3A3034'); put(d.outlined(), x, 22); } put(A.rock(), 34, 18); }
    if (i === 3) { for (const x of [10, 36, 60]) { const sp = A.pine().recolor(c => c === PA.g ? '#5A7A8A' : c === PA.h ? '#3A5468' : c); for (let y = 0; y < sp.h; y += 4) for (let xx = 0; xx < sp.w; xx++) if (sp.get(xx, y) && sp.get(xx, y) !== PA.v) sp.set(xx, y, '#F2F6FF'); put(sp.outlined(), x, 22); } }
    if (i === 4) { for (const [x, h] of [[10, 12], [34, 8], [60, 14]]) { const c = new Spr(8, h); c.poly([4, 0, 8, h, 0, h], (xx) => xx < 4 ? '#8A7AB0' : '#5A4A80'); c.vl(4, 2, h - 3, '#D8C8FF'); put(c.outlined(), x, 22); } }
    const band = new Spr(W, H); band.line(0, 33, W, 33, 1, 6);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (band.get(x, y)) s.set(x, y, (!band.get(x, y - 1) || !band.get(x, y + 1)) ? R.edge : R.road);
    const lamps = [{ x: 18, y: 33, zone: 1 }, { x: 46, y: 33, zone: 2 }], lights = [], glow = [];
    if (!locked) { roadLights(lamps, { maxZone: 2 }, lights, glow); lights[0].col = glow[0].col = TINT[i]; }
    else { lamps.forEach(l => { l.lit = false; }); lights.push({ x: 36, y: 34, rx: 26, ry: 16, a: 1, cap: 0.27 }); }
    const lm = lightMap(W, H, lights, 0), out = relight(s, lm);
    if (i === 4) for (const [x, y] of [[10, 13], [34, 17], [60, 11]]) if (lm.I[y * W + x] < 0.1) { out.set(x, y, '#6A4AA0'); out.set(x, y + 1, '#4A3A78'); } // crystals keep a faint glow
    stampLamps(out, lm, lamps);
    const pins = locked ? [{ at: [36, 40], spr: gate() }] : [];
    return { plate: out, glow, pins, motes: motes(lm, 2, [R.mote], 40 + i) };
  }

  // ================= the close-up sheet (3x), with each piece in its own pool of light =================
  function ground(w, h, pools, amb) {
    const s = new Spr(w, h, PA.g); grass(s, w, h, PA);
    const band = new Spr(w, h); band.line(0, h - 4, w, h - 4, 1, 6);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (band.get(x, y)) s.set(x, y, (!band.get(x, y - 1) || !band.get(x, y + 1)) ? '#6A5034' : '#A48558');
    const lm = lightMap(w, h, pools, amb || 0); return { plate: relight(s, lm), lm };
  }
  const MOTE_CSS = { ff: ['#F4FFB0', '#D8F07A'], mo: ['#AABEE8', '#7F9AD8'], em: ['#FFB060', '#FF6B3D'], sn: ['#F2F6FF', '#C8D8FF'], cr: ['#D8C8FF', '#B58CFF'] };
  // draw a list of fireflies/motes into a canvas at scale Z (static, for sheets and strips)
  function drawMotes(g, ms, Z) {
    for (const m of ms) {
      const [core, halo] = MOTE_CSS[m.k] || MOTE_CSS.ff, cx = (m.x + 0.5) * Z, cy = (m.y + 0.5) * Z;
      if (m.k !== 'mo' && m.k !== 'sn') { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, Z * 4); gr.addColorStop(0, halo + 'AA'); gr.addColorStop(1, halo + '00'); g.fillStyle = gr; g.fillRect(cx - Z * 4, cy - Z * 4, Z * 8, Z * 8); }
      g.fillStyle = core; g.globalAlpha = m.k === 'mo' ? 0.6 : 1; g.fillRect(m.x * Z, m.y * Z, Z, Z); g.globalAlpha = 1;
    }
  }
  function compose(plate, glow, sprites, ms, Z) {
    const cv = document.createElement('canvas'); cv.width = plate.w * Z; cv.height = plate.h * Z;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(plate.canvas(Z), 0, 0);
    const gl = glow.slice();
    for (const [s, x, y] of sprites) for (const l of s.lights) gl.push(Object.assign({}, l, { x: x + l.x, y: y + l.y }));
    if (gl.length) { const gc = MK.glowCanvas(plate.w, plate.h, gl, 0.9); g.save(); g.globalCompositeOperation = 'screen'; g.imageSmoothingEnabled = true; g.drawImage(gc, 0, 0, cv.width, cv.height); g.restore(); g.imageSmoothingEnabled = false; }
    for (const [s, x, y] of sprites) g.drawImage(s.canvas(Z), x * Z, y * Z);
    drawMotes(g, ms || [], Z);
    return cv;
  }
  function sheetView(wrap, $, portrait) {
    const hd = $('div', 'sh-head');
    hd.append($('h1', '', 'H. Light in the dark (hybrid)'), $('p', '', "A's overworld under C's night, with C's landmarks. Each piece stands in the pool of light it throws; outside the pools the ground is deep shadow. Close-ups at 3x (1 art px = 3 CSS px)."));
    wrap.append(hd);
    const grid = $('div', 'sh-grid'); wrap.append(grid);
    const Z = 3;
    const items = [
      { name: "Hollow's Rest", note: 'tents, a rope of lanterns over the fire; the Hearth, always lit', spr: rest(), pool: { rx: 44, ry: 18, a: 1.25, col: FIRE, dy: -8 } },
      { name: 'The Tavern', note: 'two storeys of lit windows, mug sign', spr: tavern(), pool: { rx: 30, ry: 14, a: 0.95, col: FL, dy: -4 } },
      { name: 'The Deepwell', note: 'well house, a beam of blue light', spr: well(), pool: { rx: 26, ry: 13, a: 1, col: WELL, dy: -6 } },
      { name: 'Great Lantern (lit)', note: 'lights the hill; lifts the region to dusk', spr: greatLantern(true, '#F2C14E'), pool: { rx: 44, ry: 20, a: 1.15, col: GOLD, dy: -18 }, amb: 0.2 },
      { name: 'Great Lantern (dark)', note: 'cold glass, dusk palette: a goal in the dark', spr: greatLantern(false), pool: { rx: 30, ry: 16, a: 1, cap: 0.27 } },
      { name: 'Almanac post', note: 'notice board with its own small lamp', spr: sign(), pool: { rx: 16, ry: 9, a: 0.9, col: FL, dy: -4 } },
      { name: 'Raid: the Ashen Wyrm', note: 'a red pool on the dark Beyond plate', spr: wyrm(), pool: { rx: 36, ry: 16, a: 1.15, col: RAID } },
      { name: 'War horn', note: 'raid pin for the other great foes', spr: C.horn(), pool: { rx: 18, ry: 9, a: 1, col: RAID } },
      { name: 'Road lamps', note: 'lit (a pool) / dark (the frontier glow) / dark (shadow)', lamps: 1 },
      { name: 'You', note: 'your portrait as the lantern glass', spr: C.youFrame(portrait), pool: { rx: 22, ry: 10, a: 0.9, col: GOLD } },
      { name: 'Team out', note: 'walkers with a lantern on a pole: a moving pool', spr: tame(C.team(), 0.8), pool: { rx: 16, ry: 8, a: 0.9, col: FL, dx: 8 } },
      { name: 'Band flags', note: 'open / locked', spr: C.flag(true), spr2: C.flag(false), pool: { rx: 26, ry: 10, a: 1, cap: 0.27 } },
      { name: 'Locked region', note: 'chained gate, dark lantern, dusk palette', spr: gate(), pool: { rx: 28, ry: 14, a: 1, cap: 0.27 } },
      { name: 'Fireflies and motes', note: 'DOM sprites in the dark only: firefly, mote, ember, snow, crystal', motesCard: 1 }
    ];
    for (const it of items) {
      const card = $('figure', 'card'); let cv;
      if (it.lamps) {
        const w = 84, h = 36, gy = h - 4, ls = [{ x: 18, y: gy, zone: 1 }, { x: 42, y: gy, zone: 2 }, { x: 66, y: gy, zone: 3 }], lights = [], glow = [];
        roadLights(ls, { maxZone: 2 }, lights, glow);
        const { plate, lm } = ground(w, h, lights); stampLamps(plate, lm, ls);
        cv = compose(plate, glow, [], [], Z);
      } else if (it.motesCard) {
        const w = 84, h = 36, { plate } = ground(w, h, []);
        cv = compose(plate, [], [], [{ x: 14, y: 12, k: 'ff' }, { x: 26, y: 20, k: 'ff' }, { x: 38, y: 10, k: 'mo' }, { x: 50, y: 18, k: 'em' }, { x: 62, y: 11, k: 'sn' }, { x: 72, y: 21, k: 'cr' }], Z);
      } else {
        const sprs = [it.spr, it.spr2].filter(Boolean), gap = 10, tw = sprs.reduce((a, s) => a + s.w, 0) + gap * (sprs.length - 1);
        const w = Math.max(84, tw + 28), h = Math.max(...sprs.map(s => s.h)) + 12, x0 = Math.round((w - tw) / 2), gy = h - 5;
        const p = it.pool, pools = [{ x: w / 2 + (p.dx || 0), y: gy + (p.dy || 0) * 0 - 1, rx: p.rx, ry: p.ry, a: p.a, col: p.col, cap: p.cap }];
        if (p.dy) pools.push({ x: w / 2 + (p.dx || 0), y: gy + p.dy, rx: p.rx * 0.8, ry: p.ry * 1.4, a: p.a * 0.9, col: p.col, cap: p.cap });
        const { plate } = ground(w, h, pools, it.amb);
        let x = x0; const list = []; for (const s of sprs) { list.push([s, x, gy - s.h + 1]); x += s.w + gap; }
        cv = compose(plate, [], list, [], Z);
      }
      const sw = $('div', 'sw'); sw.append(cv); card.append(sw);
      const cap = $('figcaption'); cap.append($('b', '', it.name), $('span', '', it.note)); card.append(cap); grid.append(card);
    }
    // the palette swap: one painted colour, four lights
    wrap.append($('h2', 'sh-h2', 'The palette swap: each painted colour has 4 lights (shadow, dusk, lamplit, flame)'));
    const ramp = $('div', 'sh-ramp'); wrap.append(ramp);
    const base = [['grass', PA.g], ['canopy', PA.G], ['road', '#A48558'], ['stone', PA.s], ['water', '#24587A'], ['roof', PC.R], ['canvas', PC.C]];
    for (const [n, c] of base) {
      const f = $('figure', 'rp'); const row = $('div', 'rp-row');
      for (const [k, v] of [['0', L0(c)], ['1', L1(c)], ['paint', c], ['2', L2(c, FL)], ['3', L3(c, FL)]]) { const sw = $('i'); sw.style.background = v; sw.title = k + ' ' + v; row.append(sw); }
      f.append(row, $('figcaption', '', n)); ramp.append(f);
    }
    wrap.append($('p', 'sh-note', 'Swatches: shadow, dusk, the painted colour (never shown at night), lamplit, flame. Lamplit and flame take the tint of the light that wins the pixel: warm lamps, blue for the Deepwell, red for the raid.'));
    // five regions
    wrap.append($('h2', 'sh-h2', 'Five regions: the same band slice (a lit lamp, the frontier lamp), then locked'));
    const row = $('div', 'sh-regions'); wrap.append(row);
    MAPDATA.five.forEach((rg, i) => {
      const f = $('figure', 'rt');
      for (const locked of [false, true]) { const t = regionTile(i, locked); f.append(compose(t.plate, t.glow, (t.pins || []).map(p => [p.spr, p.at[0] - Math.floor(p.spr.w / 2), p.at[1] - p.spr.h + 1]), t.motes, 2)); }
      f.append($('figcaption', '', rg.name)); row.append(f);
    });
  }

  // ================= the lit vs unlit strip: band II at 0, 3 and 7 lamps lit =================
  function stripView(wrap, $) {
    const hd = $('div', 'sh-head');
    hd.append($('h1', '', 'H. Lit vs unlit: band II (zones 8-14)'), $('p', '', 'The same stretch of the Hollow at 0, 3 and 7 lamps lit. Each lit lamp adds one warm pool. The first dark lamp gets the frontier glow, so the next shapes show. 3x.'));
    wrap.append(hd);
    const Z = 3, y0 = 144, y1 = 200;
    for (const [n, mz] of [[0, 8], [3, 11], [7, 15]]) {
      const res = paintHollow({ maxZone: mz, zone: mz, lit: {}, dots: {} }), W = res.W, h = y1 - y0;
      const crop = new Spr(W, h); for (let y = 0; y < h; y++) for (let x = 0; x < W; x++) crop.c[y * W + x] = res.plate.c[(y + y0) * W + x];
      const glow = res.glowLights.filter(l => l.y > y0 - 6 && l.y < y1).map(l => Object.assign({}, l, { y: l.y - y0 }));
      const ms = res.motes.filter(m => m.y > y0 && m.y < y1 - 2).map(m => Object.assign({}, m, { y: m.y - y0 }));
      const f = $('figure', 'strip'); f.append($('figcaption', '', n === 0 ? 'No lamps lit' : n === 7 ? 'All 7 lamps lit' : n + ' lamps lit'), compose(crop, glow, [], ms, Z)); wrap.append(f);
    }
  }

  const swatch = (w, h) => ground(w, h, []).plate;
  return {
    key: 'H', name: 'Light in the dark (hybrid)', pitch: "A's top-down overworld at night, C's landmarks. Each lit lamp and landmark throws a small warm pool that falls off fast; the rest is deep shadow with fireflies.",
    paintHollow, paintCoast, paintBeyond, sheetView, stripView, swatch, youFrame: C.youFrame, team: () => tame(C.team(), 0.8), flag: C.flag, glowK: 0.9,
    youTip: l => [l.x + 2, l.y - 4], teamAt: (res, band) => { const l = res.lamps.filter(m => m.band === band)[5]; return l ? [l.x, res.rows[band] + 4] : [52, res.rows[band] + 4]; },
    L0, L1, L2, L3, lightMap, regionTile
  };
})();
